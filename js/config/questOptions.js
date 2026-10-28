/* =========================================================================
   QUEST OPTIONS CONFIGURATION
   -------------------------------------------------------------------------
   Fixed lists used by the filters, the quest cards and the creation form.
   Change them here and every page follows.
   ========================================================================= */

/**
 * Quest levels, from easiest (F) to hardest (S).
 * The letter is shown on the card; its color comes from
 * the CSS class "level-badge--<letter>" (see css/components.css).
 */
export const QUEST_LEVELS = ["F", "E", "D", "C", "B", "A", "S"];

/**
 * Quest types (the four launch categories of the product vision).
 * The visible name of each type is the translation key "questType.<id>".
 */
export const QUEST_TYPES = ["citizen-science", "solo-nearby", "local-group", "remote-online"];
