import { createServerFn } from "@tanstack/react-start";
import { ApiError, GoogleGenAI, Type } from "@google/genai";
import { FOOD_RESOURCES } from "@/data/foodResources";
import {
  assistantCandidates,
  assistantInputSchema,
  assistantSystemPrompt,
  parseAssistantResult,
  type AssistantResult,
} from "@/data/assistant";

const DEFAULT_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-2.5-flash"];

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
  if (status === 429)
    return "The assistant has hit its usage limit for now. Please try again in a minute, or browse the list below.";
  return "The assistant is busy right now. Please try again, or browse the list below.";
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
    const candidates = assistantCandidates(FOOD_RESOURCES, data.origin, now);
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = assistantSystemPrompt(candidates, now, Boolean(data.origin));
    const knownIds = new Set(candidates.map((c) => c.id));
    // Try the configured model first; fall back if Google doesn't know that model name.
    const models = [...new Set([process.env["GEMINI_MODEL"] || DEFAULT_MODEL, ...FALLBACK_MODELS])];
    let lastError: unknown;
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: data.message,
          config: {
            systemInstruction,
            temperature: 0.4,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                recommendedIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["reply", "recommendedIds"],
            },
          },
        });
        return parseAssistantResult(response.text ?? "", knownIds);
      } catch (error) {
        lastError = error;
        // Log Google's error (status + message), never the person's message.
        const status = error instanceof ApiError ? error.status : undefined;
        const detail = error instanceof Error ? error.message.slice(0, 300) : "unknown";
        console.error(`assistant failed: model=${model} status=${status ?? "?"} ${detail}`);
        if (status !== 404) break;
      }
    }
    throw new Error(friendlyError(lastError));
  });
