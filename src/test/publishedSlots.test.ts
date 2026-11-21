import { describe, expect, it } from "vitest";
import { describeSlot, parseSlot, runsThisWeek } from "@/data/publishedSlots";

const t = (s: string) => s;

describe("published schedule slots", () => {
  it("turns provider week codes into plain language", () => {
    expect(describeSlot("08:00–10:00 Dates:  1st", 6, t)).toBe(
      "8am–10am (1st Saturday of the month only)",
    );
    expect(describeSlot("08:30–12:00 Dates:  3rd, 4th TEFAP", 5, t)).toBe(
      "8:30am–12pm (3rd & 4th Friday of the month only) · TEFAP",
    );
    expect(describeSlot("15:30–18:00 TEFAP", 3, t)).toBe("3:30pm–6pm · TEFAP");
    expect(parseSlot("09:00–11:00 Weeks:  1st, 3rd").weeks).toEqual([1, 3]);
  });
  it("knows whether a slot runs this week", () => {
    const thirdSaturday = new Date("2026-11-21T15:00:00Z");
    expect(runsThisWeek("08:00–10:00 Dates:  1st", thirdSaturday)).toBe(false);
    expect(runsThisWeek("08:00–10:00 Dates:  3rd", thirdSaturday)).toBe(true);
    expect(runsThisWeek("08:00–10:00", thirdSaturday)).toBe(true);
  });
});
