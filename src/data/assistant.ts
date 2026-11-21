import { z } from "zod";
import type { FoodResource, LatLng } from "./types";
import { filterResources } from "./resourceFilters";

/** What the browser sends to the assistant. Validated on the server. */
export const assistantInputSchema = z.object({
  message: z.string().trim().min(1, "Tell us what you need.").max(1000),
  origin: z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .optional(),
});
export type AssistantInput = z.infer<typeof assistantInputSchema>;

export interface AssistantResult {
  reply: string;
  recommendedIds: string[];
}

const USF: LatLng = { lat: 28.0637, lng: -82.4131 };
/** How many of the nearest places Gemini sees. Keeps prompts small and fast. */
export const ASSISTANT_CANDIDATES = 25;

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
      notes: r.notes,
    }));
}

export function assistantSystemPrompt(
  candidates: ReturnType<typeof assistantCandidates>,
  now: Date,
  nearUser: boolean,
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
    `Places: ${JSON.stringify(candidates)}`,
  ].join("\n");
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
    return { reply: text.trim(), recommendedIds: [] };
  }
}
