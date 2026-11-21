import { describe, expect, it } from "vitest";
import { DEFAULT_RESULT_LIMIT, RESULT_LIMITS, paginateResults } from "@/data/resultPagination";
import { profileSchema } from "@/data/accountSchemas";
import { FOOD_RESOURCES } from "@/data/foodResources";
import { providerDonationUrl } from "@/data/donationLinks";
import { openingStatus, todayHours } from "@/data/hours";
describe("Optional saving and result limits", () => {
  it("shows closes soon within 30 minutes and closed at the closing time", () => {
    const base = FOOD_RESOURCES[0]; if (!base) throw new Error("Missing resource");
    const resource = {...base, scheduleKnown: true, hours: {1: [{open: "11:00", close: "13:00"}]}};
    expect(openingStatus(resource,new Date("2026-11-23T17:29:00Z"))).toBe("open");
    expect(openingStatus(resource,new Date("2026-11-23T17:30:00Z"))).toBe("soon");
    expect(openingStatus(resource,new Date("2026-11-23T18:00:00Z"))).toBe("closed");
  });
  it("still displays published hours after closing and when unconfirmed", () => {
    const base = FOOD_RESOURCES[0]; if (!base) throw new Error("Missing resource");
    const resource = {...base, scheduleKnown: false, hours: {1: [{open: "11:00", close: "13:00"}]}};
    expect(todayHours(resource,new Date("2026-11-23T20:00:00Z"))).toBe("11 AM–1 PM");
    expect(openingStatus(resource,new Date("2026-11-23T20:00:00Z"))).toBe("unknown");
  });
  it("shows only the first 10 results by default", () => {
    expect(DEFAULT_RESULT_LIMIT).toBe(10);
    expect(paginateResults(FOOD_RESOURCES).rows.map(r => r.id)).toEqual(FOOD_RESOURCES.slice(0, 10).map(r => r.id));
  });
  it.each([5, 10, 20, 50, 80, 100])("supports the requested %i result limit", (size) => {
    expect(RESULT_LIMITS).toContain(size);
    expect(paginateResults(FOOD_RESOURCES, size).rows).toHaveLength(size);
  });
  it("can reach all results including the last page", () => {
    const page = paginateResults(FOOD_RESOURCES, 10, 11);
    expect(page.rows).toHaveLength(6);
    expect(page.rows.at(-1)?.id).toBe(FOOD_RESOURCES.at(-1)?.id);
  });
  it("allows an empty optional profile", () => {
    expect(profileSchema.safeParse({ display_name: "", household_size: null, household: "", dietary: "", city: "" }).success).toBe(true);
  });
  it("does not attach an umbrella donation URL to unrelated pantries", () => {
    const unrelated = FOOD_RESOURCES.find(r => r.name === "New Life Assembly");
    if (!unrelated) throw new Error("Food resource missing");
    expect(providerDonationUrl(unrelated)).toBe(null);
  });
});