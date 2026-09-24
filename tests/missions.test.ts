import { describe, expect, test } from "bun:test";
import {
  advanceMission,
  EMPTY_MISSION_STATE,
  MISSIONS,
  parseMissionState,
  type MissionState,
} from "../src/lib/missions";

describe("guided missions", () => {
  test("only the current destination advances a route", () => {
    const started: MissionState = {
      version: 1,
      active: { id: "ai", step: 0 },
      completed: [],
    };
    expect(advanceMission(started, "skills")).toEqual(started);
    expect(advanceMission(started, "queans").active).toEqual({ id: "ai", step: 1 });
  });

  test("finishing a route awards one persistent passport stamp", () => {
    const last: MissionState = {
      version: 1,
      active: { id: "fullstack", step: MISSIONS.fullstack.steps.length - 1 },
      completed: [],
    };
    const finished = advanceMission(last, "queans");
    expect(finished.active).toBeNull();
    expect(finished.completed).toEqual(["fullstack"]);
    expect(advanceMission({ ...last, completed: ["fullstack"] }, "queans").completed).toEqual([
      "fullstack",
    ]);
  });

  test("invalid and outdated stored progress falls back safely", () => {
    expect(parseMissionState("not json")).toEqual(EMPTY_MISSION_STATE);
    expect(
      parseMissionState(
        JSON.stringify({
          version: 1,
          active: { id: "ai", step: 99 },
          completed: ["ai", "unknown"],
        }),
      ),
    ).toEqual({ ...EMPTY_MISSION_STATE, completed: ["ai"] });
    expect(parseMissionState(JSON.stringify({ version: 0, completed: ["fullstack"] }))).toEqual({
      ...EMPTY_MISSION_STATE,
      completed: ["fullstack"],
    });
  });
});
