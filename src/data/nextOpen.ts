import published from "./publishedSchedules.json";
import { fmt, tampaClock } from "./hours";
import { parseSlot, weekOfMonth } from "./publishedSlots";
import type { FoodResource } from "./types";

const schedules: Record<string, Record<string, string[]>> = published;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MS = 24 * 60 * 60 * 1000;

/** "Tuesday, Nov 24" in Tampa time. */
function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", month: "short", day: "numeric" }).format(date);
}

function toMinutes(time: string) {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * The soonest upcoming listed service times (today if still to come, then the next days),
 * so the assistant can suggest the nearest day instead of waiting a week.
 * Labels look like "today 5 PM–7 PM", "tomorrow (Sunday) 10 AM–1 PM" or "Tuesday, Nov 24 10 AM–1 PM".
 */
export function nextOpenings(resource: FoodResource, now: Date, count = 2): string[] {
  const results: string[] = [];
  const nowMinutes = tampaClock(now).minutes;
  for (let offset = 0; offset < 14 && results.length < count; offset++) {
    const date = new Date(now.getTime() + offset * DAY_MS);
    const day = tampaClock(date).day;
    const label = offset === 0 ? "today" : offset === 1 ? `tomorrow (${DAY_NAMES[day]})` : dateLabel(date);
    const structured = resource.hours[day] ?? [];
    const times: string[] = [];
    if (structured.length) {
      for (const slot of structured) {
        if (offset === 0 && toMinutes(slot.close) <= nowMinutes) continue;
        times.push(`${fmt(slot.open)}–${fmt(slot.close)}`);
      }
    } else {
      for (const text of schedules[resource.id]?.[String(day)] ?? []) {
        const slot = parseSlot(text);
        if (slot.weeks.length && !slot.weeks.includes(weekOfMonth(date))) continue;
        const end = /[–-]\s*(\d{1,2}:\d{2})/.exec(text)?.[1];
        if (offset === 0 && end && toMinutes(end) <= nowMinutes) continue;
        times.push([slot.time, slot.extra].filter(Boolean).join(" "));
      }
    }
    if (times.length) results.push(`${label} ${times.join(", ")}`);
  }
  return results;
}
