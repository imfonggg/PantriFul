import { z } from "zod";
import type { FoodResource, LatLng } from "./types";
import { filterResources } from "./resourceFilters";
import { nextOpenings } from "./nextOpen";

/** What the browser sends to the assistant. Validated on the server. */
export const assistantInputSchema = z.object({
  message: z.string().trim().min(1, "Tell us what you need.").max(1000),
  origin: z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .optional(),
  /** Saved account preferences, sent only when the person is signed in. */
  profile: z
    .object({
      dietary: z.enum(["", "vegetarian", "vegan", "halal", "gluten_free"]),
      household: z.enum(["", "individuals", "families", "seniors", "students"]),
      householdSize: z.number().int().min(1).max(20).nullable(),
    })
    .optional(),
});
export type AssistantProfile = NonNullable<AssistantInput["profile"]>;
export type AssistantInput = z.infer<typeof assistantInputSchema>;

export interface AssistantPlace {
  id: string;
  /** Place name from our directory (never from Gemini). */
  name: string;
  /** When it is next open, e.g. "Tomorrow, 10 AM–12 PM". */
  when: string;
  /** Short reason it fits. */
  why: string;
}

export interface AssistantResult {
  /** Short opening line(s), separated by newlines. */
  reply: string;
  /** One line per recommended place, shown with the name in bold and the time underlined. */
  places?: AssistantPlace[];
  /** Urgent safety or same-day help info, shown in bold red. */
  urgent?: string;
  recommendedIds: string[];
}

const USF: LatLng = { lat: 28.0637, lng: -82.4131 };
/** How many of the nearest places Gemini sees. Keeps prompts small and fast. */
export const ASSISTANT_CANDIDATES = 20;

/** The nearest places (with distance and open-now) that Gemini may recommend from. */
export function assistantCandidates(
  resources: FoodResource[],
  origin: LatLng = USF,
  now: Date = new Date(),
) {
  return filterResources(resources, {
    types: [],
    household: "",
    dietary: "",
    includeUnknown: true,
    city: "",
    openOnly: false,
    maxMiles: 0,
    origin,
    now,
    query: "",
  })
    .slice(0, ASSISTANT_CANDIDATES)
    .map((r) => ({
      id: r.id,
      name: r.name,
      services: r.serviceTypes ?? [r.type],
      address: r.address,
      miles: r.miles === null ? null : Math.round(r.miles * 10) / 10,
      openNow: r.open,
      // Precomputed soonest service times, so Gemini doesn't have to do date math.
      nextOpen: nextOpenings(r, now),
      hours: r.scheduleKnown === false ? "unknown" : r.hours,
      eligibility: r.eligibility,
      household: r.household,
      dietary: r.dietary,
      offers: r.offers,
      // Long notes slow Gemini down; links add nothing it can use.
      notes: r.notes && !/^https?:\/\//.test(r.notes) ? r.notes.slice(0, 160) : undefined,
    }));
}

export function assistantSystemPrompt(
  candidates: ReturnType<typeof assistantCandidates>,
  now: Date,
  nearUser: boolean,
  profile?: AssistantProfile,
): string {
  const localTime = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
  });
  return [
    "You are PantriFul, a warm, non-judgemental assistant that helps people around USF Tampa and Hillsborough County find free food.",
    `It is ${localTime} in Tampa. Hours use 0=Sunday..6=Saturday in 24h local time. Distances are from ${nearUser ? "the person's location" : "USF Tampa"}.`,
    "Recommend 1 to 4 places ONLY from the list below, by id. Never invent places, hours, phone numbers or requirements.",
    "Prefer places that are open now, then the soonest nextOpen time (later today, then tomorrow, then the next day). Never suggest waiting until the same weekday next week when a sooner day is listed. Also weigh distance and fit (household, diet, transport). Read notes for monthly or appointment-only schedules; a place with empty nextOpen has no listed hours, so say to call ahead.",
    "Reply in the same language the person writes in. Plain text, no markdown, no bullet symbols, no ids or codes in the text.",
    "Put one short, kind opening line in reply (no place details, no 211 or 911 there). Put each recommended place in places, best first: id, when (its soonest nextOpen time, written short like \"Today, 5–7 PM\", \"Tomorrow, 10 AM–12 PM\" or \"Tuesday, Nov 24, 10 AM–1 PM\", or \"Call ahead for hours\" if nextOpen is empty), and why (under 15 words: why it fits and what to bring if listed; do not repeat the name or time).",
    "Put urgent info in the separate urgent field, not in reply: if nothing is open today, a short line saying to call 211 (Florida's free help line) for help today; if they mention an emergency or danger, tell them to call 911. Leave urgent empty when none applies.",
    "If nothing fits, say so kindly in reply and put the 211 line in urgent.",
    ...(profileLine(profile) ? [profileLine(profile)] : []),
    `Places: ${JSON.stringify(candidates)}`,
  ].join("\n");
}

const profileSchema = assistantInputSchema.shape.profile.unwrap();

/** Turn a saved profiles row into assistant preferences, dropping any unknown values. */
export function toAssistantProfile(row: {
  dietary: string;
  household: string;
  household_size: number | null;
}): AssistantProfile {
  const pick = <T extends string>(options: readonly T[], value: string) =>
    (options as readonly string[]).includes(value) ? (value as T) : ("" as T);
  const size = row.household_size;
  return {
    dietary: pick(profileSchema.shape.dietary.options, row.dietary),
    household: pick(profileSchema.shape.household.options, row.household),
    householdSize: size && Number.isInteger(size) && size >= 1 && size <= 20 ? size : null,
  };
}

/** Describe saved account preferences for the prompt, or "" if there are none. */
export function profileLine(profile?: AssistantProfile): string {
  if (!profile) return "";
  const parts = [
    profile.dietary && `diet: ${profile.dietary.replace("_", "-")}`,
    profile.household && `household: ${profile.household}`,
    profile.householdSize && `household size: ${profile.householdSize}`,
  ].filter(Boolean);
  return parts.length
    ? `The person's saved profile (use it unless their message says otherwise): ${parts.join(", ")}.`
    : "";
}

/** Parse Gemini's JSON and keep only ids that exist in the candidate list. */
export function parseAssistantResult(
  text: string,
  knownIds: Set<string>,
  names: Map<string, string> = new Map(),
): AssistantResult {
  try {
    const parsed = JSON.parse(text) as Partial<Omit<AssistantResult, "places">> & { places?: unknown };
    const seen = new Set<string>();
    const places: AssistantPlace[] = [];
    for (const item of Array.isArray(parsed.places) ? parsed.places : []) {
      const { id, when, why } = (item ?? {}) as Record<string, unknown>;
      if (typeof id !== "string" || !knownIds.has(id) || seen.has(id) || places.length >= 4) continue;
      seen.add(id);
      places.push({
        id,
        name: names.get(id) ?? "",
        when: typeof when === "string" ? when.trim() : "",
        why: typeof why === "string" ? why.trim() : "",
      });
    }
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    const urgent = typeof parsed.urgent === "string" ? parsed.urgent.trim() : "";
    const ids = [...places.map((p) => p.id), ...(Array.isArray(parsed.recommendedIds) ? parsed.recommendedIds : [])];
    if (!reply && !places.length) throw new IncompleteReplyError();
    return {
      reply,
      ...(places.length ? { places } : {}),
      ...(urgent ? { urgent } : {}),
      recommendedIds: [
        ...new Set(ids.filter((id): id is string => typeof id === "string" && knownIds.has(id))),
      ].slice(0, 4),
    };
  } catch {
    // A reply that starts as JSON but doesn't parse was cut off; never show raw JSON to the person.
    if (text.trim().startsWith("{") || !text.trim()) throw new IncompleteReplyError();
    return { reply: text.trim(), recommendedIds: [] };
  }
}

/** Gemini stopped before finishing its JSON (e.g. it ran out of output tokens). */
export class IncompleteReplyError extends Error {
  constructor() {
    super("incomplete reply");
    this.name = "IncompleteReplyError";
  }
}
