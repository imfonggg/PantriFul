import { describe, expect, it } from "vitest";
import { EMPOWER_PRICING, PANTRIFUL_RIDE_PROGRAM } from "@/data/empowerProgram";

describe("Empower's published Tampa/Orlando rules", () => {
  it("records the $49.99 monthly plan", () => { expect(EMPOWER_PRICING.monthlyUsd).toBe(49.99); });
  it("records the $19.99 weekly plan", () => { expect(EMPOWER_PRICING.weeklyUsd).toBe(19.99); });
  it("records the 30-day driver trial", () => { expect(EMPOWER_PRICING.freeTrialDays).toBe(30); });
  it("records zero commission on ride fares", () => { expect(EMPOWER_PRICING.rideCommissionPercent).toBe(0); });
  it("sets the proposed rider contribution to zero", () => { expect(PANTRIFUL_RIDE_PROGRAM.intendedRiderCostUsd).toBe(0); });
  it("does not activate funded rides before an agreement and payments exist", () => {
    expect(PANTRIFUL_RIDE_PROGRAM.status).toBe("project-scenario");
    expect(PANTRIFUL_RIDE_PROGRAM.realPartnershipAgreed).toBe(false);
    expect(PANTRIFUL_RIDE_PROGRAM.paymentsEnabled).toBe(false);
  });
});