/* =========================================================================
   QUEST LIST — the grid of quest cards (quest board and archive pages)
   ========================================================================= */

import { translate } from "../i18n/i18n.js";
import { createElement } from "../utils/domHelpers.js";
import { createQuestCard } from "./questCard.js";

/**
 * Displays a list of quests as cards inside a <ul>.
 * When the list is empty, a message is shown instead.
 *
 * @param {HTMLElement} listElement - The <ul class="quest-grid"> of the page.
 * @param {object[]} quests - Quests to display.
 * @param {object} context - Passed to createQuestCard (archetype names, click handler).
 */
export function renderQuestList(listElement, quests, context) {
  if (quests.length === 0) {
    showQuestListMessage(listElement, "questList.empty");
    return;
  }
  const cardItems = quests.map((quest) => createElement("li", {}, [createQuestCard(quest, context)]));
  listElement.replaceChildren(...cardItems);
}

/**
 * Replaces the list content with a single message
 * (loading, no result, loading error).
 * @param {HTMLElement} listElement
 * @param {string} messageKey - Translation key of the message.
 */
export function showQuestListMessage(listElement, messageKey) {
  listElement.replaceChildren(
    createElement("li", { className: "quest-grid__message", text: translate(messageKey) })
  );
}

/**
 * Writes "3 quests found" (or "1 quest found") in the counter element.
 * @param {HTMLElement} counterElement
 * @param {number} questCount
 */
export function updateResultCount(counterElement, questCount) {
  const messageKey = questCount === 1 ? "questList.resultCountOne" : "questList.resultCountMany";
  counterElement.textContent = translate(messageKey, { count: questCount });
}
