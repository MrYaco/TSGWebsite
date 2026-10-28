/* =========================================================================
   SITE HEADER — the top bar shown on every page
   -------------------------------------------------------------------------
   Structure (from "Website Structure.md"):
     | LOGO | SolarPunk Guild          | Page buttons | Burger menu |
     |      | Where action takes place |              |             |
   The burger menu contains the language switcher and the less important
   links. On mobile, the page buttons also move into the burger menu.

   Each page contains an empty <header id="site-header"></header>;
   renderSiteHeader() fills it.
   ========================================================================= */

import { SITE_PAGES, LINKS_BY_PAGE } from "../config/siteNavigation.js";
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setLanguage, onLanguageChange } from "../i18n/i18n.js";
import { createElement } from "../utils/domHelpers.js";

/**
 * Builds the header of the page.
 * @param {string} currentPageId - Key of the current page in SITE_PAGES.
 */
export function renderSiteHeader(currentPageId) {
  const headerElement = document.getElementById("site-header");
  if (!headerElement) {
    console.warn('No <header id="site-header"> found on this page.');
    return;
  }

  const pageLinks = LINKS_BY_PAGE[currentPageId] || LINKS_BY_PAGE.home;

  // "Skip to main content" link for keyboard users, placed before the header.
  headerElement.before(
    createElement("a", {
      className: "skip-link",
      attributes: { href: "#main-content", "data-i18n": "skipLink" },
    })
  );

  headerElement.className = "site-header";
  headerElement.replaceChildren(
    createElement("div", { className: "page-container site-header__inner" }, [
      createBrandLink(),
      createPrimaryNavigation(pageLinks.primaryLinks, currentPageId),
      createBurgerMenu(pageLinks, currentPageId),
    ])
  );
}

/** Logo + site name + tagline. Clicking it goes to the home page. */
function createBrandLink() {
  return createElement(
    "a",
    {
      className: "site-brand",
      attributes: {
        href: SITE_PAGES.home.fileName,
        "data-i18n-attributes": "aria-label:site.homeLinkLabel",
      },
    },
    [
      createElement("img", {
        className: "site-brand__logo",
        attributes: { src: "assets/images/logo.svg", alt: "", width: 44, height: 44 },
      }),
      createElement("span", { className: "site-brand__text" }, [
        createElement("span", { className: "site-brand__name", attributes: { "data-i18n": "site.name" } }),
        createElement("span", { className: "site-brand__tagline", attributes: { "data-i18n": "site.tagline" } }),
      ]),
    ]
  );
}

/** Creates one navigation link to a page. */
function createPageLink(pageId, currentPageId, className) {
  const page = SITE_PAGES[pageId];
  return createElement("a", {
    className,
    attributes: {
      href: page.fileName,
      "data-i18n": page.labelKey,
      // aria-current tells screen readers (and our CSS) which page is open.
      "aria-current": pageId === currentPageId ? "page" : null,
    },
  });
}

/** The buttons of the top bar (hidden on mobile, see css/layout.css). */
function createPrimaryNavigation(primaryPageIds, currentPageId) {
  const listItems = primaryPageIds.map((pageId) =>
    createElement("li", {}, [createPageLink(pageId, currentPageId, "primary-navigation__link")])
  );
  return createElement(
    "nav",
    { className: "primary-navigation", attributes: { "data-i18n-attributes": "aria-label:nav.primaryLabel" } },
    [createElement("ul", { className: "primary-navigation__list" }, listItems)]
  );
}

/** The burger button and the panel it opens. */
function createBurgerMenu(pageLinks, currentPageId) {
  const panelId = "burger-menu-panel";

  const toggleButton = createElement(
    "button",
    {
      className: "burger-menu__toggle",
      attributes: {
        type: "button",
        "aria-expanded": "false",
        "aria-controls": panelId,
        "data-i18n-attributes": "aria-label:menu.open",
      },
    },
    [createElement("span", { className: "burger-menu__icon", attributes: { "aria-hidden": "true" } })]
  );

  // Top bar links (visible only on mobile) followed by the less important links.
  const mobileOnlyItems = pageLinks.primaryLinks.map((pageId) =>
    createElement("li", { className: "burger-menu__item--mobile-only" }, [
      createPageLink(pageId, currentPageId, "burger-menu__link"),
    ])
  );
  const burgerItems = pageLinks.burgerLinks.map((pageId) =>
    createElement("li", {}, [createPageLink(pageId, currentPageId, "burger-menu__link")])
  );

  const panel = createElement(
    "div",
    { className: "burger-menu__panel", attributes: { id: panelId, hidden: true } },
    [
      createElement("nav", { attributes: { "data-i18n-attributes": "aria-label:nav.burgerLabel" } }, [
        createElement("ul", { className: "burger-menu__list" }, [...mobileOnlyItems, ...burgerItems]),
      ]),
      createLanguageSwitcher(),
    ]
  );

  const burgerMenu = createElement("div", { className: "burger-menu" }, [toggleButton, panel]);
  addBurgerMenuBehavior(burgerMenu, toggleButton, panel);
  return burgerMenu;
}

/** Opens/closes the panel: click on the button, Escape key, click outside. */
function addBurgerMenuBehavior(burgerMenu, toggleButton, panel) {
  function setMenuOpen(isOpen) {
    panel.hidden = !isOpen;
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  }

  toggleButton.addEventListener("click", () => setMenuOpen(panel.hidden));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setMenuOpen(false);
      toggleButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!panel.hidden && !burgerMenu.contains(event.target)) {
      setMenuOpen(false);
    }
  });
}

/** One button per supported language ("English", "Français"). */
function createLanguageSwitcher() {
  const languageButtons = SUPPORTED_LANGUAGES.map((languageCode) => {
    const button = createElement("button", {
      className: "language-switcher__button",
      attributes: {
        type: "button",
        lang: languageCode,
        "data-language": languageCode,
        "data-i18n": `language.${languageCode}`,
      },
    });
    button.addEventListener("click", () => setLanguage(languageCode));
    return button;
  });

  // aria-pressed marks the active language (styled in css/layout.css).
  function markActiveLanguage() {
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === getCurrentLanguage()));
    });
  }
  markActiveLanguage();
  onLanguageChange(markActiveLanguage);

  return createElement(
    "div",
    { className: "language-switcher", attributes: { role: "group", "aria-labelledby": "language-switcher-label" } },
    [
      createElement("span", {
        className: "language-switcher__label",
        attributes: { id: "language-switcher-label", "data-i18n": "menu.languageLabel" },
      }),
      createElement("div", { className: "language-switcher__options" }, languageButtons),
    ]
  );
}
