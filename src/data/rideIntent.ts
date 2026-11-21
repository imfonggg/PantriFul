/**
 * Deterministic check for searches that signal a transportation need, such as
 * "no car, need groceries tonight". Used to offer an Empower ride popup.
 */
const RIDE_PATTERNS: RegExp[] = [
  /\bno car\b/,
  /\bwithout (a |my )?car\b/,
  /\bno vehicle\b/,
  /\bno transportation\b/,
  /\bno license\b/,
  /\b(?:can'?t|cannot|can not|couldn'?t|could not) drive\b/,
  /\bdon'?t have a car\b/,
  /\bneed (a )?ride\b/,
  /\bgive (me|us) a ride\b/,
  /\bride to\b/,
  /\bneed groceries? (tonight|today|now)\b/,
  /\bgroceries? (tonight|today)\b/,
];

export function needsRide(query: string) {
  const normalized = query.toLowerCase().replace(/[’‘`]/g, "'").trim();
  if (!normalized) return false;
  return RIDE_PATTERNS.some((pattern) => pattern.test(normalized));
}
