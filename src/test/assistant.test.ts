import { describe, expect, it } from "vitest";
import { FOOD_RESOURCES } from "@/data/foodResources";
import {
  profileLine,
  toAssistantProfile,
  ASSISTANT_CANDIDATES,
  assistantCandidates,
  assistantInputSchema,
  parseAssistantResult,
} from "@/data/assistant";

describe("assistantInputSchema", () => {
  it("accepts and trims a message", () => {
    expect(assistantInputSchema.parse({ message: "  need food  " }).message).toBe("need food");
  });
  it("rejects empty or huge messages and bad coordinates", () => {
    expect(() => assistantInputSchema.parse({ message: " " })).toThrow();
    expect(() => assistantInputSchema.parse({ message: "a".repeat(1001) })).toThrow();
    expect(() =>
      assistantInputSchema.parse({ message: "hi", origin: { lat: 200, lng: 0 } }),
    ).toThrow();
  });
});

describe("assistantCandidates", () => {
  it("gives Gemini the nearest places, nearest first", () => {
    const list = assistantCandidates(FOOD_RESOURCES);
    expect(list.length).toBe(Math.min(ASSISTANT_CANDIDATES, FOOD_RESOURCES.length));
    const miles = list.map((c) => c.miles ?? Infinity);
    expect(miles).toEqual([...miles].sort((a, b) => a - b));
  });
});

describe("parseAssistantResult", () => {
  const known = new Set(["a", "b", "c", "d", "e"]);
  it("keeps only known, unique ids, at most 4", () => {
    const text = JSON.stringify({
      reply: "Try these",
      recommendedIds: ["a", "zzz", "a", "b", "c", "d", "e"],
    });
    expect(parseAssistantResult(text, known)).toEqual({
      reply: "Try these",
      recommendedIds: ["a", "b", "c", "d"],
    });
  });
  it("falls back to plain text", () => {
    expect(parseAssistantResult("hello", known)).toEqual({ reply: "hello", recommendedIds: [] });
  });
});

describe("assistant profile", () => {
  it("keeps known saved preferences and drops unknown ones", () => {
    expect(toAssistantProfile({ dietary: "halal", household: "pets", household_size: 4 })).toEqual({
      dietary: "halal",
      household: "",
      householdSize: 4,
    });
  });
  it("describes the profile for the prompt", () => {
    expect(profileLine({ dietary: "gluten_free", household: "students", householdSize: null })).toContain(
      "diet: gluten-free, household: students",
    );
    expect(profileLine({ dietary: "", household: "", householdSize: null })).toBe("");
    expect(profileLine(undefined)).toBe("");
  });
});
