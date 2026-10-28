/* =========================================================================
   DOM HELPERS — small functions to build HTML elements from JavaScript
   ========================================================================= */

/**
 * Creates an HTML element in one call.
 *
 * Example:
 *   createElement("a", { className: "button", text: "Go", attributes: { href: "x.html" } })
 *
 * @param {string} tagName - The HTML tag ("div", "li", "button", ...).
 * @param {object} [options]
 * @param {string} [options.className] - CSS class(es).
 * @param {string} [options.text] - Text content.
 * @param {object} [options.attributes] - Other attributes. A value of
 *        undefined, null or false skips the attribute; true adds it empty.
 * @param {Array<Node|null>} [children] - Elements placed inside (null is ignored).
 *
 * Text is set with textContent, never innerHTML: if a quest contains
 * "<script>", it is shown as text and cannot run as code.
 */
export function createElement(tagName, options = {}, children = []) {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  for (const [attributeName, value] of Object.entries(options.attributes || {})) {
    if (value === undefined || value === null || value === false) {
      continue;
    }
    element.setAttribute(attributeName, value === true ? "" : String(value));
  }
  for (const child of children) {
    if (child) {
      element.append(child);
    }
  }
  return element;
}

/**
 * Creates a <ul> or <ol> from an array of texts.
 * @param {string[]} items - The text of each list item.
 * @param {object} [options] - { listTag: "ul" | "ol", className }
 */
export function createTextList(items, options = {}) {
  const listTag = options.listTag || "ul";
  const listItems = items.map((itemText) => createElement("li", { text: itemText }));
  return createElement(listTag, { className: options.className }, listItems);
}
