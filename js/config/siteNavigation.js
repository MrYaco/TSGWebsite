/* =========================================================================
   SITE NAVIGATION CONFIGURATION
   -------------------------------------------------------------------------
   Single place that describes every page and which links each page shows.
   It follows the "Link" sections of "Website Structure.md".

   To ADD A PAGE:
     1. Create the .html file (copy an existing page as a template).
     2. Add it to SITE_PAGES below.
     3. Add its links in LINKS_BY_PAGE.
     4. Add its translation keys (nav.xxx, page.xxx.title, page.xxx.description)
        in js/i18n/translations/en.js and fr.js.
   ========================================================================= */

/**
 * Every page of the website.
 * - fileName: the HTML file to link to
 * - labelKey: translation key of the link text
 */
export const SITE_PAGES = {
  home: { fileName: "index.html", labelKey: "nav.home" },
  questboard: { fileName: "questboard.html", labelKey: "nav.questboard" },
  archive: { fileName: "archive.html", labelKey: "nav.archive" },
  library: { fileName: "library.html", labelKey: "nav.library" },
  classes: { fileName: "classes.html", labelKey: "nav.classes" },
  questCreation: { fileName: "quest-creation.html", labelKey: "nav.questCreation" },
  contact: { fileName: "contact.html", labelKey: "nav.contact" },
};

/**
 * Links shown on each page.
 * - primaryLinks: buttons of the top bar (from the "Link" sections)
 * - burgerLinks: less important links, placed in the burger menu
 * The home page is always reachable by clicking the logo.
 * The key of each entry must match the <body data-page="..."> of the page.
 */
export const LINKS_BY_PAGE = {
  home: {
    primaryLinks: ["questboard", "archive", "library"],
    burgerLinks: ["classes", "contact"],
  },
  questboard: {
    primaryLinks: ["archive", "library", "questCreation"],
    burgerLinks: ["home", "classes", "contact"],
  },
  archive: {
    primaryLinks: ["questboard", "library", "questCreation"],
    burgerLinks: ["home", "classes", "contact"],
  },
  library: {
    primaryLinks: ["questboard", "questCreation", "classes"],
    burgerLinks: ["home", "archive", "contact"],
  },
  classes: {
    primaryLinks: ["questboard", "questCreation", "library"],
    burgerLinks: ["home", "archive", "contact"],
  },
  questCreation: {
    primaryLinks: ["questboard", "archive", "library"],
    burgerLinks: ["home", "classes", "contact"],
  },
  contact: {
    primaryLinks: ["questboard", "archive", "library"],
    burgerLinks: ["home", "classes"],
  },
};

/**
 * Links to places outside the website (footer and contact page).
 * TODO: replace the placeholder addresses with the real ones.
 */
export const EXTERNAL_LINKS = {
  discord: "https://discord.com/", // TODO: Guild invitation link
  instagram: "https://www.instagram.com/", // TODO: Guild account
  contactEmail: "mailto:contact@solarpunkguild.example", // TODO: real address
};
