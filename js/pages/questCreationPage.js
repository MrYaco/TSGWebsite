/* =========================================================================
   QUEST CREATION PAGE (quest-creation.html)
   -------------------------------------------------------------------------
   The website has no server yet, so this page does not save anything.
   It turns the form into a quest entry (JSON) that follows the data model
   of js/data/dataRepository.js, ready to be pasted into data/quests.json.
   When a database exists, only submitQuest() needs to change: send the
   object to the database instead of displaying it.
   ========================================================================= */

import { initializePageLayout } from "../layout/initializePageLayout.js";
import { QUEST_LEVELS, QUEST_TYPES } from "../config/questOptions.js";
import { getQuestArchetypes } from "../data/dataRepository.js";
import { translate, getLocalizedText, onLanguageChange } from "../i18n/i18n.js";
import { createElement } from "../utils/domHelpers.js";

initializePageLayout();

const questForm = document.getElementById("quest-creation-form");
const resultSection = document.getElementById("quest-result-section");
const generatedJsonElement = document.getElementById("generated-quest-json");
const copyButton = document.getElementById("copy-quest-json-button");
const copyStatusElement = document.getElementById("copy-status-message");
const participantsMaxInput = document.getElementById("quest-participants-max");

let questArchetypes = [];

/* ---------- Select menus ---------- */

/**
 * Fills a <select> with a "Choose…" option followed by the given options,
 * keeping the current choice when the language changes.
 */
function fillFormSelect(selectElement, options) {
  const previousValue = selectElement.value;
  const placeholderOption = createElement("option", {
    text: translate("questCreation.chooseOption"),
    attributes: { value: "" },
  });
  const optionElements = options.map((option) =>
    createElement("option", { text: option.label, attributes: { value: option.value } })
  );
  selectElement.replaceChildren(placeholderOption, ...optionElements);
  selectElement.value = previousValue;
}

function fillAllFormSelects() {
  fillFormSelect(
    document.getElementById("quest-level"),
    QUEST_LEVELS.map((level) => ({ value: level, label: level }))
  );
  fillFormSelect(
    document.getElementById("quest-type"),
    QUEST_TYPES.map((questType) => ({ value: questType, label: translate(`questType.${questType}`) }))
  );
  fillFormSelect(
    document.getElementById("quest-archetype"),
    questArchetypes.map((archetype) => ({ value: archetype.classId, label: getLocalizedText(archetype.name) }))
  );
}

/* ---------- Reading the form ---------- */

/** Splits a multi-line text into a list of non-empty lines. */
function splitLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/**
 * Pairs English and French lines into bilingual items.
 * Line 1 EN goes with line 1 FR, and so on. A missing French line
 * reuses the English text so nothing is ever empty.
 */
function pairBilingualLines(englishText, frenchText) {
  const englishLines = splitLines(englishText);
  const frenchLines = splitLines(frenchText);
  return englishLines.map((englishLine, index) => ({
    en: englishLine,
    fr: frenchLines[index] || englishLine,
  }));
}

/** Splits "Q-0001, Q-0002" into ["Q-0001", "Q-0002"]. */
function splitQuestIds(text) {
  return text
    .split(",")
    .map((questId) => questId.trim())
    .filter((questId) => questId !== "");
}

/**
 * Builds a quest object from the form fields.
 * The field names (name="...") in the HTML are used as keys.
 * @param {HTMLFormElement} form
 */
export function buildQuestFromForm(form) {
  const field = (fieldName) => String(new FormData(form).get(fieldName) ?? "").trim();

  return {
    questId: field("questId"),
    title: { en: field("titleEn"), fr: field("titleFr") || field("titleEn") },
    description: { en: field("descriptionEn"), fr: field("descriptionFr") || field("descriptionEn") },
    milestones: pairBilingualLines(field("milestonesEn"), field("milestonesFr")),
    level: field("level"),
    archetype: field("archetype"),
    questType: field("questType"),
    suggestedParticipants: {
      min: Number(field("participantsMin")),
      max: Number(field("participantsMax")),
    },
    supposedExpense: Number(field("supposedExpense")),
    rewards: pairBilingualLines(field("rewardsEn"), field("rewardsFr")),
    location: field("location"),
    relatedQuestIds: splitQuestIds(field("relatedQuestIds")),
    questgiverId: field("questgiverId"),
    officialInstructionsUrl: field("officialInstructionsUrl"),
    status: "published",
    isCompleted: false,
  };
}

/* ---------- Validation, submission and copy ---------- */

/** Checks that the maximum of participants is not below the minimum. */
function validateParticipants() {
  const minimum = Number(document.getElementById("quest-participants-min").value);
  const maximum = Number(participantsMaxInput.value);
  // setCustomValidity shows the browser's own error bubble on submit.
  participantsMaxInput.setCustomValidity(
    maximum < minimum ? translate("questCreation.participantsError") : ""
  );
}

function submitQuest(event) {
  event.preventDefault(); // stay on the page instead of reloading it
  validateParticipants();
  if (!questForm.reportValidity()) {
    return;
  }

  const newQuest = buildQuestFromForm(questForm);
  generatedJsonElement.textContent = JSON.stringify(newQuest, null, 2);
  copyStatusElement.textContent = "";
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyGeneratedJson() {
  try {
    await navigator.clipboard.writeText(generatedJsonElement.textContent);
    copyStatusElement.classList.remove("status-message--error");
    copyStatusElement.textContent = translate("questCreation.copied");
  } catch (error) {
    copyStatusElement.classList.add("status-message--error");
    copyStatusElement.textContent = translate("questCreation.copyFailed");
  }
}

/* ---------- Start ---------- */
async function initializeQuestCreationPage() {
  try {
    questArchetypes = await getQuestArchetypes();
  } catch (error) {
    console.error(error); // The form still works; only the archetype list stays empty.
  }
  fillAllFormSelects();

  questForm.addEventListener("submit", submitQuest);
  participantsMaxInput.addEventListener("input", validateParticipants);
  document.getElementById("quest-participants-min").addEventListener("input", validateParticipants);
  copyButton.addEventListener("click", copyGeneratedJson);
  onLanguageChange(fillAllFormSelects);
}

initializeQuestCreationPage();
