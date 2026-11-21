import { z } from "zod";
import type { FoodResource, LatLng } from "./types";
import { filterResources } from "./resourceFilters";

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

export interface AssistantResult {
  reply: string;
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
    "Prefer places that are open now or soon, close by, and that fit the person's situation (household, diet, transport, timing). Read notes for monthly or appointment-only schedules.",
    "Reply in the same language the person writes in. Keep it under 110 words, plain text, no markdown. Mention what to bring if listed, and suggest calling ahead when hours are unknown.",
    "If nothing fits, say so kindly and suggest calling 211 (Florida's free help line). If they mention an emergency or danger, tell them to call 911.",
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
export function parseAssistantResult(text: string, knownIds: Set<string>): AssistantResult {
  try {
    const parsed = JSON.parse(text) as Partial<AssistantResult>;
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    const ids = Array.isArray(parsed.recommendedIds) ? parsed.recommendedIds : [];
    return {
      reply,
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
