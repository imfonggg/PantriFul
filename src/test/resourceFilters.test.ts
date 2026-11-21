import { describe, expect, it } from "vitest";
import { FOOD_RESOURCES } from "@/data/foodResources";
import { directionsUrl, filterResources, matchesNeed, type ResourceFilters } from "@/data/resourceFilters";
import { isOpenNow } from "@/data/hours";

const filters: ResourceFilters = { types: [], household: "", dietary: "", includeUnknown: true, city: "", query: "", openOnly: false, maxMiles: 0, origin: { lat: 28.0637, lng: -82.4131 }, now: null };
describe("Food assistance rules", () => {
  it("allows browsing every resource without a session", () => {
    expect(filterResources(FOOD_RESOURCES, filters)).toHaveLength(106);
  });
  it("matches household needs without promising eligibility for unknown sites", () => {
    expect(matchesNeed(["students"], "families", true)).toBe(false);
    expect(matchesNeed([], "families", false)).toBe(false);
    expect(matchesNeed(["families"], "families", false)).toBe(true);
  });
  it("does not infer halal availability from an organization's name", () => {
    const results = filterResources(FOOD_RESOURCES, { ...filters, dietary: "halal", includeUnknown: false });
    expect(results).toHaveLength(0);
  });
  it("keeps unknown dietary listings only when explicitly included", () => {
    expect(matchesNeed([], "vegetarian", true)).toBe(true);
    expect(matchesNeed([], "vegetarian", false)).toBe(false);
  });
  it("ranks vegetarian matches above nearer unconfirmed listings", () => {
    const results = filterResources(FOOD_RESOURCES, { ...filters, dietary: "vegetarian" });
    expect(results.slice(0, 2).map(r => r.id).sort()).toEqual(["ftb-23431", "ftb-23799"]);
    expect(results.slice(2).every(r => !r.dietary?.length)).toBe(true);
  });
  it("does not treat a published nonmatching diet as unconfirmed", () => {
    const results = filterResources(FOOD_RESOURCES, { ...filters, dietary: "vegan", includeUnknown: true });
    expect(results.map(r => r.id)).not.toContain("ftb-23431");
    expect(results.map(r => r.id)).not.toContain("ftb-23799");
  });
  it("offers transit directions to the exact pantry address", () => {
    const url = new URL(directionsUrl("2030 W Fletcher Ave, Tampa, FL 33612", "transit"));
    expect(url.searchParams.get("travelmode")).toBe("transit");
    expect(url.searchParams.get("destination")).toBe("2030 W Fletcher Ave, Tampa, FL 33612");
    expect(url.searchParams.has("origin")).toBe(false);
  });
  it("keeps the benefits-help category available", () => {
    const results = filterResources(FOOD_RESOURCES, { ...filters, types: ["benefits"] });
    expect(results.map((r) => r.id)).toContain("ftb-23799");
  });
  it("does not mark unconfirmed schedules as closed or open", () => {
    const usf = FOOD_RESOURCES.find((r) => r.id === "usf-feed-a-bull");
    if (!usf) throw new Error("Campus pantry missing");
    expect(usf.scheduleKnown).toBe(false);
    expect(isOpenNow(usf, new Date("2026-11-23T15:00:00Z"))).toBe(false);
  });
  it("uses Tampa time for the scheduled open filter", () => {
    const resource = FOOD_RESOURCES.find((r) => r.name === "Trinity Cafe");
    if (!resource) throw new Error("Trinity Cafe missing");
    const fixture = { ...resource, scheduleKnown: true, hours: { 1: [{ open: "11:00", close: "13:00" }] } };
    expect(isOpenNow(fixture, new Date("2026-11-23T16:00:00Z"))).toBe(true);
    expect(isOpenNow(fixture, new Date("2026-11-23T18:00:00Z"))).toBe(false);
  });
});
describe("ZIP code filter", () => {
  it("keeps only places whose published address has that ZIP", () => {
    const rows = filterResources(FOOD_RESOURCES, { ...filters, zipCode: "33612", now: new Date("2026-11-21T15:00:00Z") });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => /\b33612\b/.test(r.address))).toBe(true);
  });
});