import { describe, expect, it } from "vitest";
import { matchesZipCode, normalizeZipInput, publishedZipCode } from "@/data/zipCodes";
import { FOOD_RESOURCES } from "@/data/foodResources";
import { filterResources, type ResourceFilters } from "@/data/resourceFilters";

const filters: ResourceFilters = { types: [], household: "", dietary: "", includeUnknown: true, city: "", query: "", openOnly: false, maxMiles: 0, origin: { lat: 28.0637, lng: -82.4131 }, now: null };
describe("Published ZIP code filtering", () => {
  it("keeps the ZIP field to five digits", () => {
    expect(normalizeZipInput("33a6198")).toBe("33619");
  });
  it("filters to the location's published address ZIP", () => {
    const results = filterResources(FOOD_RESOURCES, { ...filters, zipCode: "33619" });
    expect(results.map(r => r.id)).toContain("ftb-23799");
    expect(results.map(r => r.id)).not.toContain("ftb-23801");
    expect(results.every(r => publishedZipCode(r.address) === "33619")).toBe(true);
  });
  it("does not infer a ZIP for an address without one", () => {
    expect(publishedZipCode("123 Main Street, Tampa")).toBeNull();
    expect(matchesZipCode("123 Main Street, Tampa", "33619")).toBe(false);
  });
  it("matches ZIP+4 addresses using the five-digit ZIP", () => {
    expect(matchesZipCode("3624 Causeway Blvd, Tampa, FL 33619-1234", "33619")).toBe(true);
    expect(matchesZipCode("3624 Causeway Blvd, Tampa, FL 33619-1234", "33612")).toBe(false);
  });
  it("preserves results while typing and restores all results when cleared", () => {
    expect(filterResources(FOOD_RESOURCES, { ...filters, zipCode: "336" })).toHaveLength(106);
    expect(filterResources(FOOD_RESOURCES, { ...filters, zipCode: "" })).toHaveLength(106);
  });
  it("combines ZIP with existing service filters", () => {
    const results = filterResources(FOOD_RESOURCES, { ...filters, zipCode: "33619", types: ["food_bank"] });
    expect(results.map(r => r.id)).toEqual(["ftb-23799"]);
  });
});