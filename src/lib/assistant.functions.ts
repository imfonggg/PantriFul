import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI, Type } from "@google/genai";
import { FOOD_RESOURCES } from "@/data/foodResources";
import {
  assistantCandidates,
  assistantInputSchema,
  assistantSystemPrompt,
  parseAssistantResult,
  type AssistantResult,
} from "@/data/assistant";

const DEFAULT_MODEL = "gemini-3.8-flash";

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
    try {
      const response = await ai.models.generateContent({
        model: process.env["GEMINI_MODEL"] || DEFAULT_MODEL,
        contents: data.message,
        config: {
          systemInstruction: assistantSystemPrompt(candidates, now, Boolean(data.origin)),
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
      return parseAssistantResult(response.text ?? "", new Set(candidates.map((c) => c.id)));
    } catch (error) {
      console.error("assistant failed:", error instanceof Error ? error.name : "unknown");
      throw new Error(
        "The assistant is busy right now. Please try again, or browse the list below.",
      );
    }
  });
