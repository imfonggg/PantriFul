import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AssistantPanel } from "@/components/AssistantPanel";

vi.mock("@tanstack/react-start", () => ({ useServerFn: () => vi.fn(), createServerFn: () => ({ inputValidator: () => ({ handler: () => vi.fn() }) }) }));

describe("AssistantPanel answer", () => {
  it("bolds place names, underlines next-open times and shows urgent info in red", () => {
    render(
      <LanguageProvider>
        <AssistantPanel
          origin={{ lat: 28, lng: -82 }}
          hasLocation={false}
          onResult={() => {}}
          result={{
            reply: "I'm sorry you're going through this.",
            places: [{ id: "a", name: "Crossover Church", when: "Tomorrow, 10 AM–12 PM", why: "Pantry near campus." }],
            urgent: "Call 211 for help finding a meal today.",
            recommendedIds: ["a"],
          }}
        />
      </LanguageProvider>,
    );
    expect(screen.getByText("Crossover Church").tagName).toBe("STRONG");
    expect(screen.getByText("Tomorrow, 10 AM–12 PM").className).toContain("underline");
    expect(screen.getByText("Call 211 for help finding a meal today.").closest("p")?.className).toContain("text-status-alert");
  });
});
