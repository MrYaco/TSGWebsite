/* =========================================================================
   I18N.JS — Translation system (English / French)
   -------------------------------------------------------------------------
   How it works:
     1. In the HTML, every translatable element gets a key:
          <p data-i18n="home.hook.text">English text (default)</p>
        Attributes can be translated too:
          <input data-i18n-attributes="placeholder:form.titlePlaceholder">
        Several attributes are separated with ";".
     2. The text of each key is stored in translations/en.js and fr.js.
     3. applyTranslations() replaces the text of every element with a key.
     4. setLanguage() saves the choice and sends the LANGUAGE_CHANGE_EVENT,
        so pages can re-draw the parts generated with JavaScript.

   The English text is also written directly in the HTML files so that
   search engines and visitors without JavaScript can still read the page.
   ========================================================================= */

import { englishTranslations } from "./translations/en.js";
import { frenchTranslations } from "./translations/fr.js";

/** All dictionaries, by language code. Add a new language here. */
const TRANSLATIONS_BY_LANGUAGE = {
  en: englishTranslations,
  fr: frenchTranslations,
};

export const SUPPORTED_LANGUAGES = Object.keys(TRANSLATIONS_BY_LANGUAGE);
const DEFAULT_LANGUAGE = "en";
const LANGUAGE_STORAGE_KEY = "solarpunk-guild-language";

/** Name of the event sent on the document when the language changes. */
export const LANGUAGE_CHANGE_EVENT = "guild:languagechange";

let currentLanguage = detectInitialLanguage();

/**
 * Chooses the first language to display:
 * the visitor's saved choice, otherwise the browser language, otherwise English.
 */
function detectInitialLanguage() {
  const savedLanguage = readSavedLanguage();
  if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }
  const browserLanguage = (navigator.language || "").slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browserLanguage)) {
    return browserLanguage;
  }
  return DEFAULT_LANGUAGE;
}

/** Reads the saved language. Storage can be blocked, so errors are ignored. */
function readSavedLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    // Storage blocked (private mode...): the choice simply won't be remembered.
  }
}

/** Returns the language currently displayed ("en" or "fr"). */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Returns the text of a translation key in the current language.
 * Values between braces are replaced: translate("x", { count: 3 }) turns
 * "{count} quests" into "3 quests".
 * A missing key falls back to English, then to the key itself (and warns
 * in the console, to help the developer spot it).
 */
export function translate(translationKey, replacements = {}) {
  let text =
    TRANSLATIONS_BY_LANGUAGE[currentLanguage][translationKey] ??
    TRANSLATIONS_BY_LANGUAGE[DEFAULT_LANGUAGE][translationKey];

  if (text === undefined) {
    console.warn(`Missing translation key: "${translationKey}"`);
    return translationKey;
  }

  for (const [placeholderName, value] of Object.entries(replacements)) {
    text = text.replaceAll(`{${placeholderName}}`, String(value));
  }
  return text;
}

/**
 * Returns the right language of a bilingual data value.
 * Data files store translated text as { "en": "...", "fr": "..." }.
 * A plain string is returned unchanged.
 */
export function getLocalizedText(bilingualValue) {
  if (bilingualValue === null || bilingualValue === undefined) {
    return "";
  }
  if (typeof bilingualValue === "string") {
    return bilingualValue;
  }
  return bilingualValue[currentLanguage] || bilingualValue[DEFAULT_LANGUAGE] || "";
}

/**
 * Translates every element that has a data-i18n or data-i18n-attributes
 * attribute inside rootElement (the whole page by default).
 */
export function applyTranslations(rootElement = document) {
  rootElement.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  rootElement.querySelectorAll("[data-i18n-attributes]").forEach((element) => {
    // Format: "attributeName:translationKey;otherAttribute:otherKey"
    element.dataset.i18nAttributes.split(";").forEach((pair) => {
      const [attributeName, translationKey] = pair.split(":").map((part) => part.trim());
      if (attributeName && translationKey) {
        element.setAttribute(attributeName, translate(translationKey));
      }
    });
  });

  if (rootElement === document) {
    updateDocumentMetadata();
  }
}

/** Updates <html lang>, the tab title and the meta description. */
function updateDocumentMetadata() {
  document.documentElement.lang = currentLanguage;

  const pageTitleKey = document.body.dataset.pageTitleKey;
  if (pageTitleKey) {
    document.title = translate(pageTitleKey);
  }

  const pageDescriptionKey = document.body.dataset.pageDescriptionKey;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (pageDescriptionKey && metaDescription) {
    metaDescription.setAttribute("content", translate(pageDescriptionKey));
  }
}

/**
 * Changes the displayed language, translates the page and notifies
 * the page scripts so they can re-draw their dynamic content.
 */
export function setLanguage(newLanguage) {
  if (!SUPPORTED_LANGUAGES.includes(newLanguage) || newLanguage === currentLanguage) {
    return;
  }
  currentLanguage = newLanguage;
  saveLanguage(newLanguage);
  applyTranslations();
  document.dispatchEvent(
    new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language: newLanguage } })
  );
}

/** Shortcut for pages: runs callbackFunction every time the language changes. */
export function onLanguageChange(callbackFunction) {
  document.addEventListener(LANGUAGE_CHANGE_EVENT, callbackFunction);
}
