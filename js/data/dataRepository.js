/* =========================================================================
   DATA REPOSITORY — the only file that knows where the data comes from
   -------------------------------------------------------------------------
   Pages never read the JSON files themselves: they call the functions of
   this file (getPublishedQuests, getGuildClasses, ...). If the data later
   comes from somewhere else (a Google Sheet export, an API), only the
   paths and the loading code below need to change — no page changes.

   DATA MODEL (based on "Database Structure.md")
   ---------------------------------------------
   Translated text is stored as { "en": "...", "fr": "..." } and displayed
   with getLocalizedText() from js/i18n/i18n.js.

   @typedef {{ en: string, fr: string }} BilingualText

   @typedef {object} Quest              -> data/quests.json
   @property {string} questId                  "Q-0001"
   @property {BilingualText} title
   @property {BilingualText} description
   @property {BilingualText[]} milestones      list of steps
   @property {string} level                    "F" to "S" (see js/config/questOptions.js)
   @property {string} archetype                a classId of data/classes.json
   @property {string} questType                see QUEST_TYPES in js/config/questOptions.js
   @property {{min: number, max: number}} suggestedParticipants
   @property {number} supposedExpense          always 0 during the MVP (no money)
   @property {BilingualText[]} rewards
   @property {string|BilingualText} location  city/region, or translated text like "Online" — never a private address
   @property {string[]} relatedQuestIds
   @property {string} questgiverId             userId of the Guild member who created it
   @property {string} officialInstructionsUrl  primary action of the quest
   @property {"draft"|"published"|"archived"} status   only "published" and "archived" are public
   @property {boolean} isCompleted             true -> shown in the Archive page

   @typedef {object} PublicUser         -> data/public-users.json
   @property {string} userId
   @property {string} userName
   @property {number} generalLevel
   @property {Object<string, number>} classLevels   { classId: level }
   PRIVATE FIELDS (password, email) MUST NEVER be written in a public
   JSON file: anyone can download it. They stay in the private database.

   @typedef {object} QuestCompletion    -> data/quest-completions.json
   @property {string} questId
   @property {string} userId
   @property {string} completedAt      ISO date "2026-10-01"
   Only completions that the member chose to make PUBLIC are exported here.
   ========================================================================= */

/** Location of each data file (relative to the HTML pages). */
const DATA_FILE_PATHS = {
  quests: "data/quests.json",
  guildClasses: "data/classes.json",
  publicUsers: "data/public-users.json",
  questCompletions: "data/quest-completions.json",
};

/**
 * Remembers files already downloaded, so each file is loaded only once
 * per page even if several functions need it.
 */
const loadedFilesCache = new Map();

/**
 * Downloads and reads a JSON file.
 * @param {string} filePath
 * @returns {Promise<any>}
 */
function loadJsonFile(filePath) {
  if (!loadedFilesCache.has(filePath)) {
    const loadingPromise = fetch(filePath).then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load ${filePath} (HTTP ${response.status})`);
      }
      return response.json();
    });
    // If loading fails, forget it so a later call can try again.
    loadingPromise.catch(() => loadedFilesCache.delete(filePath));
    loadedFilesCache.set(filePath, loadingPromise);
  }
  return loadedFilesCache.get(filePath);
}

/* ---------- Quests ---------- */

/** Every quest visible to the public (published or archived). */
export async function getAllPublicQuests() {
  const quests = await loadJsonFile(DATA_FILE_PATHS.quests);
  return quests.filter((quest) => quest.status === "published" || quest.status === "archived");
}

/** Quests shown on the quest board: published and not completed yet. */
export async function getPublishedQuests() {
  const quests = await getAllPublicQuests();
  return quests.filter((quest) => quest.status === "published" && !quest.isCompleted);
}

/** Quests shown in the archive: completed ones (completed = TRUE). */
export async function getCompletedQuests() {
  const quests = await getAllPublicQuests();
  return quests.filter((quest) => quest.isCompleted);
}

/* ---------- Classes ---------- */

/** Content of data/classes.json: { isLevelingSystemFinal, classes: [...] } */
export async function getGuildClassesData() {
  return loadJsonFile(DATA_FILE_PATHS.guildClasses);
}

/** Only the classes that can be used as a quest archetype. */
export async function getQuestArchetypes() {
  const guildClassesData = await getGuildClassesData();
  return guildClassesData.classes.filter((guildClass) => guildClass.isQuestArchetype);
}

/* ---------- Users and completions ---------- */

/** Public profiles of the members (no private information). */
export async function getPublicUsers() {
  return loadJsonFile(DATA_FILE_PATHS.publicUsers);
}

/** Public completion records: which member completed which quest. */
export async function getQuestCompletions() {
  return loadJsonFile(DATA_FILE_PATHS.questCompletions);
}
