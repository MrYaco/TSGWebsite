/* =========================================================================
   QUEST BOARD PAGE (questboard.html)
   Shows the published quests that are not completed yet.
   ========================================================================= */

import { initializePageLayout } from "../layout/initializePageLayout.js";
import { initializeQuestBrowser } from "../components/questBrowser.js";
import { getPublishedQuests } from "../data/dataRepository.js";

initializePageLayout();
initializeQuestBrowser({ loadQuests: getPublishedQuests });
