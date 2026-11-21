/**
 * Plain hex copies of the site's color tokens.
 *
 * Map libraries paint pins on a canvas and cannot read the CSS custom
 * properties in styles.css, so these mirror those tokens. If a token in
 * styles.css changes, change the matching value here.
 */
export const MAP_COLORS = {
  /** A place that is open right now (--plum). */
  open: "#58045e",
  /** A place that is closed right now (--brown). */
  closed: "#af8e6e",
  /** The starting point: USF Tampa, or the person's own location (--green). */
  origin: "#45653e",
  /** The place picked from a card or pin: stands out from open and closed pins. */
  selected: "#e8590c",
  /** Ring around every pin (--card). */
  ring: "#fffbf4",
} as const;
