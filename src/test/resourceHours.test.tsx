import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/LanguageProvider";
import { ResourceHours } from "@/components/ResourceHours";
import type { FoodResource } from "@/data/types";

// Saturday 11:00 AM in Tampa — a day this pantry does not serve.
const now = new Date("2026-11-21T16:00:00Z");

const resource: FoodResource = {
  id: "test-hours-only-service-days",
  name: "Test Pantry",
  type: "pantry",
  address: "1 Test St, Tampa, FL",
  hours: {
    2: [{ open: "09:00", close: "12:00" }],
    5: [{ open: "13:00", close: "16:00" }],
  },
  eligibility: "Anyone in the county",
  offers: [],
  verified: true,
  scheduleKnown: true,
};

function renderHours(overrides: Partial<FoodResource> = {}) {
  return render(
    <LanguageProvider>
      <ResourceHours resource={{ ...resource, ...overrides }} now={now} />
    </LanguageProvider>,
  );
}

describe("Weekly hours list", () => {
  it("lists only the days the provider serves", () => {
    renderHours();

    expect(screen.getByText("Tuesday")).toBeInTheDocument();
    expect(screen.getByText("Friday")).toBeInTheDocument();
    expect(screen.getByText("9 AM–12 PM")).toBeInTheDocument();
    expect(screen.getByText("1 PM–4 PM")).toBeInTheDocument();

    for (const day of ["Sunday", "Monday", "Wednesday", "Thursday", "Saturday"]) {
      expect(screen.queryByText(day)).not.toBeInTheDocument();
    }
    expect(screen.queryByText("No Listed Service")).not.toBeInTheDocument();
  });

  it("asks people to call ahead when no service days are published", () => {
    renderHours({ hours: {} });

    expect(screen.getByText("No service days published — call ahead.")).toBeInTheDocument();
    expect(screen.queryByText("Weekly Hours")).not.toBeInTheDocument();
  });
});
