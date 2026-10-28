/* =========================================================================
   ARCHIVE PAGE (archive.html)
   Shows the completed quests, with an extra "Completed by" filter.
   ========================================================================= */

import { initializePageLayout } from "../layout/initializePageLayout.js";
import { initializeQuestBrowser } from "../components/questBrowser.js";
import { getCompletedQuests } from "../data/dataRepository.js";

initializePageLayout();
initializeQuestBrowser({ loadQuests: getCompletedQuests });
