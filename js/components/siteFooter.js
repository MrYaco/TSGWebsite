/* =========================================================================
   SITE FOOTER — shown on every page
   -------------------------------------------------------------------------
   Contains the link to the contact page and the social media links.
   Each page contains an empty <footer id="site-footer"></footer>.
   ========================================================================= */

import { SITE_PAGES, EXTERNAL_LINKS } from "../config/siteNavigation.js";
import { createElement } from "../utils/domHelpers.js";

/** Fills <footer id="site-footer"> with the footer content. */
export function renderSiteFooter() {
  const footerElement = document.getElementById("site-footer");
  if (!footerElement) {
    console.warn('No <footer id="site-footer"> found on this page.');
    return;
  }

  footerElement.className = "site-footer";
  footerElement.replaceChildren(
    createElement("div", { className: "page-container" }, [
      createElement("div", { className: "site-footer__columns" }, [
        createElement("p", { className: "site-footer__motto", attributes: { "data-i18n": "footer.motto" } }),
        createFooterColumn("footer.contactTitle", [
          { href: SITE_PAGES.contact.fileName, labelKey: "footer.contactLink" },
          { href: EXTERNAL_LINKS.contactEmail, labelKey: "footer.emailLink" },
        ]),
        createFooterColumn("footer.socialTitle", [
          { href: EXTERNAL_LINKS.discord, labelKey: "footer.discord", isExternal: true },
          { href: EXTERNAL_LINKS.instagram, labelKey: "footer.instagram", isExternal: true },
        ]),
      ]),
      createElement("p", { className: "site-footer__copyright", attributes: { "data-i18n": "footer.copyright" } }),
    ])
  );
}

/**
 * Creates a titled column of links.
 * @param {string} titleKey - Translation key of the column title.
 * @param {Array<{href: string, labelKey: string, isExternal?: boolean}>} links
 */
function createFooterColumn(titleKey, links) {
  const listItems = links.map((link) =>
    createElement("li", {}, [
      createElement("a", {
        className: "site-footer__link",
        attributes: {
          href: link.href,
          "data-i18n": link.labelKey,
          // External links open in a new tab; "noopener" is a security good practice.
          target: link.isExternal ? "_blank" : null,
          rel: link.isExternal ? "noopener noreferrer" : null,
        },
      }),
    ])
  );

  return createElement("div", {}, [
    createElement("h2", { className: "site-footer__title", attributes: { "data-i18n": titleKey } }),
    createElement("ul", { className: "site-footer__list" }, listItems),
  ]);
}
