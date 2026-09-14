import { expect, test } from "bun:test";
import { parseTimeOfDay, resolveTimeOfDay } from "../src/lib/timeOfDay";

test("Auto follows local hours at both day/night boundaries", () => {
  for (const [hour, minute, result] of [
    [6, 59, "night"],
    [7, 0, "day"],
    [18, 59, "day"],
    [19, 0, "night"],
  ] as const) {
    expect(resolveTimeOfDay("auto", new Date(2026, 8, 13, hour, minute))).toBe(result);
  }
});
test("manual overrides ignore time and legacy preferences default to auto", () => {
  expect(resolveTimeOfDay("day", new Date(2026, 8, 13, 23))).toBe("day");
  expect(resolveTimeOfDay("night", new Date(2026, 8, 13, 12))).toBe("night");
  for (const value of [undefined, null, "unknown", {}, 3])
    expect(parseTimeOfDay(value)).toBe("auto");
  expect(parseTimeOfDay("night")).toBe("night");
});
