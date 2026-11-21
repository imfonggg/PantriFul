import { fmt } from "./hours";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface PublishedSlot {
  /** "8am–10am", or the raw text when it has no time range. */
  time: string;
  /** Weeks of the month the slot runs (1 = first), or [] for every week. */
  weeks: number[];
  /** Anything else the provider listed, such as "TEFAP" or "By appointment". */
  extra: string;
}

/**
 * Parse a published schedule line such as "08:00–10:00 Dates:  1st, 3rd TEFAP".
 * Providers use "Dates:" and "Weeks:" to mean "these weeks of the month only".
 */
export function parseSlot(text: string): PublishedSlot {
  const match = /^(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*(.*)$/.exec(text.trim());
  const time = match ? `${fmt(match[1]!)}–${fmt(match[2]!)}` : "";
  let rest = (match ? match[3]! : text).trim();
  let weeks: number[] = [];
  const weekMatch = /(?:Dates|Weeks):\s*((?:[1-5](?:st|nd|rd|th)\s*,?\s*)+)/i.exec(rest);
  if (weekMatch) {
    weeks = [...weekMatch[1]!.matchAll(/([1-5])(?:st|nd|rd|th)/g)].map((m) => Number(m[1]));
    rest = (rest.slice(0, weekMatch.index) + rest.slice(weekMatch.index + weekMatch[0].length)).trim();
  }
  return { time: time || rest, weeks, extra: time ? rest : "" };
}

const ORDINAL = ["", "1st", "2nd", "3rd", "4th", "5th"];

/** Which week of the month (1-5) a date falls in, in Tampa time. */
export function weekOfMonth(now: Date): number {
  const date = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", day: "numeric" }).format(now),
  );
  return Math.ceil(date / 7);
}

/** Plain-language text for one slot, e.g. "8am–10am (1st & 3rd Saturday of the month only) · TEFAP". */
export function describeSlot(text: string, day: number, t: (s: string) => string): string {
  const slot = parseSlot(text);
  const weeks = slot.weeks.length
    ? ` (${slot.weeks.map((w) => ORDINAL[w]).join(" & ")} ${t(DAY_NAMES[day] ?? "")} ${t("of the month only")})`
    : "";
  return `${slot.time}${weeks}${slot.extra ? ` · ${slot.extra}` : ""}`;
}

/** True when a slot runs in the week of the month that `now` falls in. */
export function runsThisWeek(text: string, now: Date): boolean {
  const { weeks } = parseSlot(text);
  return !weeks.length || weeks.includes(weekOfMonth(now));
}
