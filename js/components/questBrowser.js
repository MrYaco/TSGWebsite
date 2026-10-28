/* =========================================================================
   QUEST BROWSER — filters + quest grid + detail modal, working together
   -------------------------------------------------------------------------
   Used by the quest board page and the archive page, which only differ by
   the quests they load and by the "Completed by" filter of the archive.

   Elements expected in the HTML of the page (found by their id):
     #filter-quest-type     <select>  quest type filter
     #filter-difficulty     <select>  difficulty filter
     #filter-member         <select>  (optional) "completed by" filter
     #reset-filters-button  <button>  resets every filter
     #quest-result-count    <p>       "3 quests found"
     #quest-list            <ul>      the grid of cards
   ========================================================================= */

import { QUEST_LEVELS, QUEST_TYPES } from "../config/questOptions.js";
import { getAllPublicQuests, getQuestArchetypes, getPublicUsers, getQuestCompletions } from "../data/dataRepository.js";
import { translate, onLanguageChange } from "../i18n/i18n.js";
import { fillFilterOptions, filterQuests, getQuestIdsCompletedByUser, ALL_OPTIONS_VALUE } from "./questFilters.js";
import { renderQuestList, showQuestListMessage, updateResultCount } from "./questList.js";
import { openQuestDetailModal, isQuestDetailModalOpen } from "./questDetailModal.js";

/**
 * Starts the quest browser of the page.
 * @param {object} settings
 * @param {() => Promise<object[]>} settings.loadQuests - Which quests to show.
 */
export async function initializeQuestBrowser(settings) {
  const pageElements = {
    questTypeSelect: document.getElementById("filter-quest-type"),
    difficultySelect: document.getElementById("filter-difficulty"),
    memberSelect: document.getElementById("filter-member"), // null on the quest board
    resetButton: document.getElementById("reset-filters-button"),
    resultCount: document.getElementById("quest-result-count"),
    questList: document.getElementById("quest-list"),
  };

  // Everything the browser needs to remember while the page is open.
  const browserState = {
    quests: [],
    publicUsers: [],
    questCompletions: [], // only loaded on the archive page
    selectedQuest: null,
    displayContext: {
      archetypeNamesById: new Map(),
      questsById: new Map(),
      onQuestSelected: (quest) => openQuest(quest),
    },
  };

  function openQuest(quest) {
    browserState.selectedQuest = quest;
    openQuestDetailModal(quest, browserState.displayContext);
  }

  /** Fills the filter menus in the current language. */
  function fillAllFilterOptions() {
    fillFilterOptions(
      pageElements.questTypeSelect,
      QUEST_TYPES.map((questType) => ({ value: questType, label: translate(`questType.${questType}`) }))
    );
    fillFilterOptions(
      pageElements.difficultySelect,
      QUEST_LEVELS.map((level) => ({ value: level, label: level }))
    );
    if (pageElements.memberSelect) {
      fillFilterOptions(
        pageElements.memberSelect,
        browserState.publicUsers.map((user) => ({ value: user.userId, label: user.userName })),
        "filters.allMembers"
      );
    }
  }

  /** Applies the filters and re-draws the cards. */
  function refreshQuestList() {
    let allowedQuestIds = null;
    const selectedMemberId = pageElements.memberSelect?.value;
    if (selectedMemberId && selectedMemberId !== ALL_OPTIONS_VALUE) {
      allowedQuestIds = getQuestIdsCompletedByUser(browserState.questCompletions, selectedMemberId);
    }

    const visibleQuests = filterQuests(browserState.quests, {
      questType: pageElements.questTypeSelect.value,
      level: pageElements.difficultySelect.value,
      allowedQuestIds,
    });

    renderQuestList(pageElements.questList, visibleQuests, browserState.displayContext);
    updateResultCount(pageElements.resultCount, visibleQuests.length);
  }

  /** Puts every filter back on "All". */
  function resetFilters() {
    [pageElements.questTypeSelect, pageElements.difficultySelect, pageElements.memberSelect]
      .filter(Boolean)
      .forEach((selectElement) => {
        selectElement.value = ALL_OPTIONS_VALUE;
      });
    refreshQuestList();
  }

  // ---------- 1. Load the data ----------
  showQuestListMessage(pageElements.questList, "questList.loading");
  try {
    // The member filter (archive only) also needs the users and the completions.
    const hasMemberFilter = Boolean(pageElements.memberSelect);
    const [questsToShow, allPublicQuests, archetypes, publicUsers, questCompletions] = await Promise.all([
      settings.loadQuests(),
      getAllPublicQuests(),
      getQuestArchetypes(),
      hasMemberFilter ? getPublicUsers() : [],
      hasMemberFilter ? getQuestCompletions() : [],
    ]);
    browserState.quests = questsToShow;
    browserState.publicUsers = publicUsers;
    browserState.questCompletions = questCompletions;
    browserState.displayContext.archetypeNamesById = new Map(
      archetypes.map((archetype) => [archetype.classId, archetype.name])
    );
    browserState.displayContext.questsById = new Map(
      allPublicQuests.map((quest) => [quest.questId, quest])
    );
  } catch (error) {
    console.error(error);
    showQuestListMessage(pageElements.questList, "questList.error");
    return;
  }

  // ---------- 2. First display ----------
  fillAllFilterOptions();
  refreshQuestList();

  // ---------- 3. React to the visitor ----------
  [pageElements.questTypeSelect, pageElements.difficultySelect, pageElements.memberSelect]
    .filter(Boolean)
    .forEach((selectElement) => selectElement.addEventListener("change", refreshQuestList));

  pageElements.resetButton.addEventListener("click", resetFilters);

  // When the language changes, re-draw everything generated by JavaScript.
  onLanguageChange(() => {
    fillAllFilterOptions();
    refreshQuestList();
    if (isQuestDetailModalOpen() && browserState.selectedQuest) {
      openQuest(browserState.selectedQuest);
    }
  });
}
