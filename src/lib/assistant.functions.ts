import { createServerFn } from "@tanstack/react-start";
import { ApiError, GoogleGenAI, ThinkingLevel, Type, type ThinkingConfig } from "@google/genai";
import { FOOD_RESOURCES } from "@/data/foodResources";
import {
  assistantCandidates,
  assistantInputSchema,
  assistantSystemPrompt,
  IncompleteReplyError,
  parseAssistantResult,
  type AssistantResult,
} from "@/data/assistant";

// The model that has answered in production, then faster/newer aliases to try.
const DEFAULT_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"];
/** The model that last answered, so later requests skip models that failed. */
let workingModel: string | undefined;
/** Recent answers (e.g. the example chips), so repeat questions are instant. */
const cache = new Map<string, { at: number; result: AssistantResult }>();
const CACHE_MS = 10 * 60_000;
/** Give up on a slow Gemini call instead of leaving the person waiting. */
const TIMEOUT_MS = 15_000;

/**
 * Picking 1-4 places from a short list needs little reasoning, and "thinking"
 * is what makes replies slow. Gemini 2.5 takes a token budget (0 = off);
 * newer models take a level.
 */
function thinkingFor(model: string): ThinkingConfig {
  return /gemini-2\.5/.test(model)
    ? { thinkingBudget: 0 }
    : { thinkingLevel: ThinkingLevel.LOW };
}

/** Short, actionable message for the person (and for whoever is debugging the deploy). */
function friendlyError(error: unknown): string {
  const status = error instanceof ApiError ? error.status : undefined;
  const text = error instanceof Error ? error.message : "";
  if (status === 400 && /api key/i.test(text))
    return "The assistant's API key was rejected (check GEMINI_API_KEY). You can still browse the list below.";
  if (status === 401 || status === 403)
    return "The assistant's API key isn't allowed to use Gemini (check GEMINI_API_KEY). You can still browse the list below.";
  if (status === 404)
    return "The assistant's Gemini model wasn't found (check GEMINI_MODEL). You can still browse the list below.";
  if (/abort|timed? ?out/i.test(text))
    return "The assistant took too long to answer. Please try again, or browse the list below.";
  if (status === 429)
    return "The assistant has hit its usage limit for now. Please try again in a minute, or browse the list below.";
  // Include a short code so whoever runs the deploy can tell what failed without logs.
  const code = status ?? (error instanceof Error ? error.name : "unknown");
  return `The assistant is busy right now (code ${code}). Please try again, or browse the list below.`;
}

/**
 * Gemini-powered food finder. Runs only on the server so GEMINI_API_KEY never
 * reaches the browser. Never logs the person's message.
 */
export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => assistantInputSchema.parse(input))
  .handler(async ({ data }): Promise<AssistantResult> => {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey)
      throw new Error("The assistant isn't set up yet. You can still browse the list below.");

    const now = new Date();
    const key = JSON.stringify([
      data.message.toLowerCase(),
      data.origin && [data.origin.lat.toFixed(2), data.origin.lng.toFixed(2)],
      data.profile,
      Math.floor(now.getTime() / CACHE_MS),
    ]);
    const cached = cache.get(key);
    if (cached && now.getTime() - cached.at < CACHE_MS) return cached.result;
    const candidates = assistantCandidates(FOOD_RESOURCES, data.origin, now);
    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: TIMEOUT_MS } });
    const systemInstruction = assistantSystemPrompt(candidates, now, Boolean(data.origin), data.profile);
    const knownIds = new Set(candidates.map((c) => c.id));
    const ask = (model: string, thinking: boolean) =>
      ai.models.generateContent({
        model,
        contents: data.message,
        config: {
          systemInstruction,
          temperature: 0.4,
          // Thinking tokens count toward this limit, so leave room for the JSON answer.
          maxOutputTokens: 4096,
          ...(thinking ? { thinkingConfig: thinkingFor(model) } : {}),
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              urgent: { type: Type.STRING },
              recommendedIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["reply", "recommendedIds"],
          },
        },
      });

    // Try the model that last worked, then the configured one, then fallbacks.
    const models = [
      ...new Set([workingModel, process.env["GEMINI_MODEL"], DEFAULT_MODEL, ...FALLBACK_MODELS]),
    ].filter((m): m is string => Boolean(m));
    let lastError: unknown;
    let discovered = false;
    for (let i = 0; i < models.length; i++) {
      const model = models[i]!;
      // First with thinking turned down; if the model rejects that setting, once without it.
      for (const thinking of [true, false]) {
        const started = Date.now();
        try {
          const response = await ask(model, thinking);
          const result = parseAssistantResult(response.text ?? "", knownIds);
          workingModel = model;
          // Timing only, never the person's message.
          console.log(`assistant ok: model=${model} thinking=${thinking} ms=${Date.now() - started}`);
          if (cache.size > 200) cache.clear();
          cache.set(key, { at: Date.now(), result });
          return result;
        } catch (error) {
          lastError = error;
          // Log Google's error (status + message), never the person's message.
          const status = error instanceof ApiError ? error.status : undefined;
          const detail = error instanceof Error ? error.message.slice(0, 300) : "unknown";
          console.error(`assistant failed: model=${model} thinking=${thinking} status=${status ?? "?"} ${detail}`);
          if (model === workingModel) workingModel = undefined;
          // Retry without thinking if the model rejects the setting or ran out of room mid-answer.
          if (thinking && ((status === 400 && /thinking/i.test(detail)) || error instanceof IncompleteReplyError)) continue;
          // A bad key or a usage limit won't get better on another model; anything else might.
          if ((status === 400 && /api key/i.test(detail)) || status === 401 || status === 403 || status === 429 || /abort|timed? ?out/i.test(detail))
            throw new Error(friendlyError(error));
          break; // try the next model
        }
      }
      // None of the names we know worked: ask Google which Flash models this key can use.
      if (i === models.length - 1 && !discovered) {
        discovered = true;
        try {
          const pager = await ai.models.list({ config: { pageSize: 100 } });
          const available: string[] = [];
          for await (const m of pager) {
            const name = m.name?.replace(/^models\//, "");
            if (name && /flash/i.test(name) && !/image|tts|audio|live|embed/i.test(name) && m.supportedActions?.includes("generateContent") && !models.includes(name)) available.push(name);
          }
          console.log(`assistant: discovered models ${available.slice(0, 5).join(", ")}`);
          models.push(...available.slice(0, 3));
        } catch (error) {
          console.error(`assistant: listing models failed ${error instanceof Error ? error.message.slice(0, 200) : ""}`);
        }
      }
    }
    throw new Error(friendlyError(lastError));
  });
