export type TimeOfDayPreference = "auto" | "day" | "night";
export type TimeOfDay = "day" | "night";

export function resolveTimeOfDay(preference: TimeOfDayPreference, date = new Date()): TimeOfDay {
  if (preference === "day" || preference === "night") return preference;
  return date.getHours() >= 7 && date.getHours() < 19 ? "day" : "night";
}

export function parseTimeOfDay(value: unknown): TimeOfDayPreference {
  return value === "day" || value === "night" ? value : "auto";
}
