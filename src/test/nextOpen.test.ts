import { describe, expect, it } from "vitest";
import { nextOpenings } from "@/data/nextOpen";
import type { FoodResource } from "@/data/types";

const base: FoodResource = {
  id: "test-next-open", name: "Test", type: "pantry", address: "1 Test St, Tampa, FL",
  hours: { 0: [{ open: "10:00", close: "13:00" }], 6: [{ open: "09:00", close: "11:00" }] },
  eligibility: "", offers: [], verified: true, scheduleKnown: true,
};

describe("nextOpenings", () => {
  it("skips today's closed slot and suggests tomorrow before next week", () => {
    // Saturday 4 PM in Tampa: today's 9–11 slot is over.
    const now = new Date("2026-11-21T21:00:00Z");
    expect(nextOpenings(base, now)[0]).toMatch(/^tomorrow \(Sunday\)/);
    expect(nextOpenings(base, now)[1]).toMatch(/^Saturday, Nov 28/);
  });
  it("keeps a slot later today", () => {
    const now = new Date("2026-11-21T13:00:00Z"); // Saturday 8 AM
    expect(nextOpenings(base, now)[0]).toMatch(/^today/);
  });
  it("returns nothing when no hours are listed", () => {
    expect(nextOpenings({ ...base, hours: {} }, new Date("2026-11-21T21:00:00Z"))).toEqual([]);
  });
});
