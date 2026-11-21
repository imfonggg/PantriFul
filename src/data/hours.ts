import type { FoodResource } from "./types";

export function tampaClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const value = (key: string) => parts.find((p) => p.type === key)?.value ?? "0";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { day: days.indexOf(value("weekday")) as 0 | 1 | 2 | 3 | 4 | 5 | 6, minutes: Number(value("hour")) * 60 + Number(value("minute")) };
}

export function fmt(t: string) {
  const [h = 0, m = 0] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hr = h % 12 || 12;
  return m ? `${hr}:${String(m).padStart(2, "0")}${suffix}` : `${hr}${suffix}`;
}

export function isOpenNow(r: FoodResource, now = new Date()) {
  if (!r.scheduleKnown) return false;
  const clock = tampaClock(now);
  const slots = r.hours[clock.day] ?? [];
  const mins = clock.minutes;
  return slots.some((s) => {
    const [oh = 0, om = 0] = s.open.split(":").map(Number);
    const [ch = 0, cm = 0] = s.close.split(":").map(Number);
    return mins >= oh * 60 + om && mins < ch * 60 + cm;
  });
}

export function todayHours(r: FoodResource, now = new Date()) {
  const slots = r.hours[tampaClock(now).day] ?? [];
  if (!slots.length) return null;
  return slots.map((s) => `${fmt(s.open)}–${fmt(s.close)}`).join(", ");
}

export function openingStatus(r: FoodResource, now: Date): "unknown" | "open" | "closed" | "soon" {
  if (!r.scheduleKnown) return "unknown";
  const { day, minutes } = tampaClock(now);
  const active = (r.hours[day] ?? []).filter(slot => {
    const [h = 0, m = 0] = slot.open.split(":").map(Number);
    const [ch = 0, cm = 0] = slot.close.split(":").map(Number);
    return minutes >= h * 60 + m && minutes < ch * 60 + cm;
  });
  if (!active.length) return "closed";
  const remaining = Math.max(...active.map(slot => {
    const [h = 0, m = 0] = slot.close.split(":").map(Number);
    return h * 60 + m - minutes;
  }));
  return remaining <= 30 ? "soon" : "open";
}

export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
