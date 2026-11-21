import { describe, expect, it } from "vitest";
import { donationPreview, validDonationAmount, ridePreview } from "@/data/ridePreviews";
describe("Inactive funded-ride and donation previews", () => {
  it("never charges a donor selecting $25", () => { expect(donationPreview("25")).toEqual({ amountUsd: 25, charged: false }); });
  it("accepts a custom donation to the cent", () => { expect(validDonationAmount("12.34")).toBe(12.34); });
  it("rejects zero, negative and invalid donation amounts", () => { for (const value of ["0", "-5", "", "NaN", "1.234"]) expect(validDonationAmount(value)).toBeNull(); });
  it("keeps rider fare at $0 without booking a driver", () => { expect(ridePreview("crossover")).toEqual({ destinationId: "crossover", riderCostUsd: 0, booked: false }); });
});