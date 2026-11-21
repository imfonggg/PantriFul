import { describe, expect, it } from "vitest";

import { needsRide } from "@/data/rideIntent";

describe("needsRide", () => {
  it("recognises searches that signal a transportation need", () => {
    expect(needsRide("no car, need groceries tonight")).toBe(true);
    expect(needsRide("I don’t have a car")).toBe(true);
    expect(needsRide("can't drive to a pantry")).toBe(true);
    expect(needsRide("need a ride to food bank")).toBe(true);
    expect(needsRide("no transportation")).toBe(true);
    expect(needsRide("groceries tonight")).toBe(true);
  });

  it("stays quiet for ordinary food searches", () => {
    expect(needsRide("")).toBe(false);
    expect(needsRide("food pantry tampa")).toBe(false);
    expect(needsRide("33612")).toBe(false);
    expect(needsRide("hot meals near me")).toBe(false);
    expect(needsRide("Trinity Café")).toBe(false);
  });
});
