/* =========================================================================
   QUEST FILTERS — fills the filter <select> menus and filters the quests
   -------------------------------------------------------------------------
   The <select> elements are written in the HTML of each page; this file
   fills their options and contains the filtering logic.
   ========================================================================= */

import { translate } from "../i18n/i18n.js";
import { createElement } from "../utils/domHelpers.js";

/** Value of the "All" option: it means "do not filter on this criterion". */
export const ALL_OPTIONS_VALUE = "all";

/**
 * Replaces the options of a <select> and keeps the selected value
 * when it still exists (useful when re-translating the page).
 *
 * @param {HTMLSelectElement} selectElement
 * @param {Array<{value: string, label: string}>} options
 * @param {string} allOptionLabelKey - Translation key of the "All" option.
 */
export function fillFilterOptions(selectElement, options, allOptionLabelKey = "filters.all") {
  const previousValue = selectElement.value || ALL_OPTIONS_VALUE;

  const optionElements = [
    { value: ALL_OPTIONS_VALUE, label: translate(allOptionLabelKey) },
    ...options,
  ].map((option) => createElement("option", { text: option.label, attributes: { value: option.value } }));

  selectElement.replaceChildren(...optionElements);

  const previousValueStillExists = optionElements.some((option) => option.value === previousValue);
  selectElement.value = previousValueStillExists ? previousValue : ALL_OPTIONS_VALUE;
}

/**
 * Keeps only the quests that match every chosen criterion.
 * A criterion equal to ALL_OPTIONS_VALUE (or empty) is ignored.
 *
 * @param {object[]} quests
 * @param {object} criteria
 * @param {string} [criteria.questType]
 * @param {string} [criteria.level]
 * @param {Set<string>|null} [criteria.allowedQuestIds] - Keep only these IDs (null = no limit).
 * @returns {object[]}
 */
export function filterQuests(quests, criteria) {
  const isActive = (value) => value && value !== ALL_OPTIONS_VALUE;

  return quests.filter((quest) => {
    if (isActive(criteria.questType) && quest.questType !== criteria.questType) {
      return false;
    }
    if (isActive(criteria.level) && quest.level !== criteria.level) {
      return false;
    }
    if (criteria.allowedQuestIds && !criteria.allowedQuestIds.has(quest.questId)) {
      return false;
    }
    return true;
  });
}

/**
 * Returns the IDs of the quests completed by one member.
 * @param {object[]} questCompletions - Content of data/quest-completions.json.
 * @param {string} userId
 * @returns {Set<string>}
 */
export function getQuestIdsCompletedByUser(questCompletions, userId) {
  return new Set(
    questCompletions
      .filter((completion) => completion.userId === userId)
      .map((completion) => completion.questId)
  );
}
