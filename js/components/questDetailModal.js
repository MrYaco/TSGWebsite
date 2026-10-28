/* =========================================================================
   QUEST DETAIL MODAL — complete format of a quest
   (see "Quest representation.md")
   -------------------------------------------------------------------------
   Shows: title, level, archetype, suggested participants, supposed expense,
   description, milestones (+ location, rewards, related quests and the
   "Open official instructions" button).
   The card fills 80% of the screen and the page behind is blurred
   (see .quest-modal in css/components.css).

   It uses the native HTML <dialog> element, which handles for free:
   the Escape key, keeping the keyboard focus inside, and the backdrop.
   ========================================================================= */

import { translate, getLocalizedText } from "../i18n/i18n.js";
import { createElement, createTextList } from "../utils/domHelpers.js";
import { createLevelBadge, formatParticipantRange, getArchetypeName } from "./questCard.js";

/** The single <dialog> element of the page, created on first use. */
let questDialogElement = null;

/** Creates the <dialog> once and adds its closing behavior. */
function getQuestDialog() {
  if (questDialogElement) {
    return questDialogElement;
  }
  questDialogElement = createElement("dialog", {
    className: "quest-modal",
    attributes: { "aria-labelledby": "quest-modal-title" },
  });

  // A click on the blurred background (outside the card) closes the modal.
  questDialogElement.addEventListener("click", (event) => {
    if (event.target === questDialogElement) {
      questDialogElement.close();
    }
  });

  document.body.append(questDialogElement);
  return questDialogElement;
}

/** Tells whether the modal is currently open. */
export function isQuestDetailModalOpen() {
  return Boolean(questDialogElement && questDialogElement.open);
}

/**
 * Opens the modal with the details of a quest.
 * Calling it again while open simply refreshes the content
 * (used when the language changes).
 *
 * @param {object} quest - A quest from data/quests.json.
 * @param {object} context
 * @param {Map<string, object>} context.archetypeNamesById
 * @param {Map<string, object>} context.questsById - To show related quest titles.
 */
export function openQuestDetailModal(quest, context) {
  const dialog = getQuestDialog();
  dialog.replaceChildren(createModalHeader(quest, context, dialog), createModalBody(quest, context));

  if (!dialog.open) {
    dialog.showModal();
  }
}

/** Dark header: level, archetype, title and close button. */
function createModalHeader(quest, context, dialog) {
  const closeButton = createElement("button", {
    className: "quest-modal__close-button",
    text: translate("quest.close"),
    attributes: { type: "button" },
  });
  closeButton.addEventListener("click", () => dialog.close());

  return createElement("header", { className: "quest-modal__header" }, [
    createLevelBadge(quest.level),
    createElement("div", { className: "quest-modal__heading" }, [
      createElement("p", {
        className: "quest-modal__archetype",
        text: getArchetypeName(quest.archetype, context.archetypeNamesById),
      }),
      createElement("h2", {
        className: "quest-modal__title",
        text: getLocalizedText(quest.title),
        attributes: { id: "quest-modal-title" },
      }),
    ]),
    closeButton,
  ]);
}

/** Body of the modal: key facts, description, lists and main action. */
function createModalBody(quest, context) {
  return createElement("div", { className: "quest-modal__body" }, [
    createElement("dl", { className: "quest-modal__facts" }, [
      createFact("quest.participants", formatParticipantRange(quest.suggestedParticipants)),
      createFact("quest.expense", formatExpense(quest.supposedExpense)),
      createFact("quest.location", getLocalizedText(quest.location)),
    ]),

    createSectionTitle("quest.description"),
    createElement("p", { text: getLocalizedText(quest.description) }),

    ...createOptionalListSection("quest.milestones", quest.milestones.map(getLocalizedText), "ol"),
    ...createOptionalListSection("quest.rewards", quest.rewards.map(getLocalizedText), "ul"),
    ...createOptionalListSection("quest.relatedQuests", getRelatedQuestTitles(quest, context), "ul"),

    createMainAction(quest),
  ]);
}

/** One fact of the grid: a label (dt) and its value (dd). */
function createFact(labelKey, valueText) {
  return createElement("div", { className: "quest-modal__fact" }, [
    createElement("dt", { text: translate(labelKey) }),
    createElement("dd", { text: valueText }),
  ]);
}

function createSectionTitle(titleKey) {
  return createElement("h3", { className: "quest-modal__section-title", text: translate(titleKey) });
}

/**
 * Returns [title, list] or an empty array when there is nothing to show,
 * so empty sections do not appear.
 */
function createOptionalListSection(titleKey, itemTexts, listTag) {
  if (itemTexts.length === 0) {
    return [];
  }
  return [createSectionTitle(titleKey), createTextList(itemTexts, { listTag })];
}

/** "None — free" when the expense is 0 (always the case during the MVP). */
function formatExpense(supposedExpense) {
  if (!supposedExpense) {
    return translate("quest.expenseNone");
  }
  return translate("quest.expenseAmount", { amount: supposedExpense });
}

/** Turns related quest IDs into titles (unknown IDs are skipped). */
function getRelatedQuestTitles(quest, context) {
  return quest.relatedQuestIds
    .map((relatedQuestId) => context.questsById.get(relatedQuestId))
    .filter(Boolean)
    .map((relatedQuest) => getLocalizedText(relatedQuest.title));
}

/** Primary action of a quest: open the official instructions. */
function createMainAction(quest) {
  if (!quest.officialInstructionsUrl) {
    return null;
  }
  return createElement("div", { className: "quest-modal__actions" }, [
    createElement("a", {
      className: "button button--primary",
      text: translate("quest.openInstructions"),
      attributes: {
        href: quest.officialInstructionsUrl,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
    createElement("p", { className: "quest-modal__actions-note", text: translate("quest.instructionsNote") }),
  ]);
}
