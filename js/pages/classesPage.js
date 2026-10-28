/* =========================================================================
   CLASSES PAGE (classes.html)
   Stylized version of "Class.md": one card per class, built from
   data/classes.json. To change a class, edit the JSON file only.
   ========================================================================= */

import { initializePageLayout } from "../layout/initializePageLayout.js";
import { getGuildClassesData } from "../data/dataRepository.js";
import { translate, getLocalizedText, onLanguageChange } from "../i18n/i18n.js";
import { createElement, createTextList } from "../utils/domHelpers.js";

initializePageLayout();

const classListElement = document.getElementById("class-list");
const levelingWarningElement = document.getElementById("leveling-warning");

/** Builds the card of one class. */
function createClassCard(guildClass) {
  return createElement("article", { className: "content-block class-card" }, [
    createElement("h2", { text: getLocalizedText(guildClass.name) }),
    createElement("p", { text: getLocalizedText(guildClass.description) }),
    createElement("h3", { className: "class-card__subtitle", text: translate("classes.howToLevelUp") }),
    createTextList(guildClass.howToLevelUp.map(getLocalizedText)),
    createElement("h3", { className: "class-card__subtitle", text: translate("classes.levels") }),
    createElement(
      "ol",
      { className: "class-card__level-list" },
      guildClass.levels.map(createLevelItem)
    ),
  ]);
}

/** One level line: "New talent ........ 100 XP · Rank F–D". */
function createLevelItem(level) {
  const details = [];
  if (level.requiredXp) {
    details.push(translate("classes.xp", { xp: level.requiredXp }));
  }
  if (level.rankRange) {
    details.push(translate("classes.rank", { range: level.rankRange }));
  }

  return createElement("li", { className: "class-card__level" }, [
    createElement("span", { text: getLocalizedText(level.name) }),
    details.length > 0
      ? createElement("span", { className: "class-card__level-details", text: details.join(" · ") })
      : null,
  ]);
}

/** Loads the classes and displays them. */
async function renderClassesPage() {
  try {
    const guildClassesData = await getGuildClassesData();
    // The warning is shown only while the leveling system is not final.
    levelingWarningElement.hidden = guildClassesData.isLevelingSystemFinal;
    classListElement.replaceChildren(...guildClassesData.classes.map(createClassCard));
  } catch (error) {
    console.error(error);
    classListElement.replaceChildren(createElement("p", { text: translate("classes.loadingError") }));
  }
}

renderClassesPage();
onLanguageChange(renderClassesPage);
