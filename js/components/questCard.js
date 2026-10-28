/* =========================================================================
   QUEST CARD — compact format of a quest (see "Quest representation.md")
   -------------------------------------------------------------------------
   Shows: level (colored letter), archetype, suggested participants, title,
   and grey lines representing the description.
   Clicking anywhere on the card opens the complete format (the modal).
   ========================================================================= */

import { translate, getLocalizedText } from "../i18n/i18n.js";
import { createElement } from "../utils/domHelpers.js";

/**
 * Creates the colored circle with the quest level letter.
 * Exported because the quest detail modal uses it too.
 * @param {string} level - "F" to "S".
 */
export function createLevelBadge(level) {
  return createElement("span", {
    className: `level-badge level-badge--${level.toLowerCase()}`,
    text: level,
    attributes: {
      role: "img",
      "aria-label": translate("quest.levelAria", { level }),
    },
  });
}

/**
 * Returns the participants text: "1" or "3–10".
 * @param {{min: number, max: number}} suggestedParticipants
 */
export function formatParticipantRange(suggestedParticipants) {
  const { min, max } = suggestedParticipants;
  return min === max ? String(min) : `${min}–${max}`;
}

/**
 * Returns the translated name of the archetype of a quest.
 * @param {string} archetypeId - classId, for example "dryad".
 * @param {Map<string, object>} archetypeNamesById - classId -> bilingual name.
 */
export function getArchetypeName(archetypeId, archetypeNamesById) {
  return getLocalizedText(archetypeNamesById.get(archetypeId)) || archetypeId;
}

/**
 * Builds one quest card.
 * @param {object} quest - A quest from data/quests.json.
 * @param {object} context
 * @param {Map<string, object>} context.archetypeNamesById
 * @param {(quest: object) => void} context.onQuestSelected - Called on click.
 * @returns {HTMLElement} An <article> element.
 */
export function createQuestCard(quest, context) {
  const openButton = createElement("button", {
    className: "quest-card__open-button",
    text: getLocalizedText(quest.title),
    attributes: {
      type: "button",
      "aria-haspopup": "dialog",
      "aria-describedby": `quest-card-hint-${quest.questId}`,
    },
  });
  openButton.addEventListener("click", () => context.onQuestSelected(quest));

  // Three grey lines: a visual hint of the description, hidden from screen readers.
  const descriptionPreview = createElement(
    "div",
    { className: "quest-card__description-preview", attributes: { "aria-hidden": "true" } },
    [1, 2, 3].map(() => createElement("span", { className: "quest-card__description-line" }))
  );

  return createElement("article", { className: "quest-card" }, [
    createElement("div", { className: "quest-card__top-row" }, [
      createLevelBadge(quest.level),
      createElement("span", {
        className: "quest-card__archetype",
        text: getArchetypeName(quest.archetype, context.archetypeNamesById),
      }),
    ]),
    createElement("h3", { className: "quest-card__title" }, [openButton]),
    createElement("p", {
      className: "quest-card__participants",
      text: translate("quest.participantsWithValue", {
        count: formatParticipantRange(quest.suggestedParticipants),
      }),
    }),
    createElement("span", {
      className: "visually-hidden",
      text: translate("quest.openDetails"),
      attributes: { id: `quest-card-hint-${quest.questId}` },
    }),
    descriptionPreview,
  ]);
}
