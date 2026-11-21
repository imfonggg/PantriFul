import { describe, expect, it } from "vitest";
import { fmt, formatPublishedHours } from "@/data/hours";

describe("Readable published schedules", () => {
  it("displays 24-hour source times in AM/PM", () => {
    expect(fmt("00:00")).toBe("12 AM");
    expect(fmt("12:00")).toBe("12 PM");
    expect(formatPublishedHours("15:30–18:00 TEFAP", 3)).toBe("3:30 PM–6 PM TEFAP");
  });
  it("expands third Saturday into an explicit monthly weekday", () => {
    expect(formatPublishedHours("11:00–13:00 Dates:  3rd", 6)).toBe("11 AM–1 PM 3rd Sat of the month");
  });
  it("retains both second and fourth monthly Tuesdays", () => {
    expect(formatPublishedHours("12:30–14:00 Dates:  2nd, 4th TEFAP", 2)).toBe("12:30 PM–2 PM 2nd Tue of the month, 4th Tue of the month TEFAP");
  });
  it("translates the monthly recurrence for Spanish", () => {
    expect(formatPublishedHours("11:00–13:00 Dates:  3rd", 6, "es")).toBe("11 AM–1 PM 3º sáb del mes");
  });
});