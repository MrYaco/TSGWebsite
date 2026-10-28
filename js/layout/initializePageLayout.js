/* =========================================================================
   INITIALIZE PAGE LAYOUT — code shared by every page
   -------------------------------------------------------------------------
   Every page script calls initializePageLayout() first. It:
     1. builds the header and the footer,
     2. translates the page into the visitor's language.
   The current page is read from <body data-page="...">.
   ========================================================================= */

import { renderSiteHeader } from "../components/siteHeader.js";
import { renderSiteFooter } from "../components/siteFooter.js";
import { applyTranslations } from "../i18n/i18n.js";

/**
 * Prepares the common parts of the page.
 * @returns {string} The id of the current page (for example "questboard").
 */
export function initializePageLayout() {
  const currentPageId = document.body.dataset.page;
  renderSiteHeader(currentPageId);
  renderSiteFooter();
  applyTranslations();
  return currentPageId;
}
