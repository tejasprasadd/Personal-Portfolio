import { useCallback, useEffect, useMemo, useState } from "react";
import {
  advanceMission,
  EMPTY_MISSION_STATE,
  MISSIONS,
  parseMissionState,
  type MissionId,
  type MissionState,
} from "@/lib/missions";
import type { ZoneId } from "@/components/3d/zones";

const KEY = "tejas_os_missions_v1";

export function useMissions() {
  const [state, setState] = useState<MissionState>(EMPTY_MISSION_STATE);
  const [recap, setRecap] = useState<MissionId | null>(null);
  useEffect(() => setState(parseMissionState(window.localStorage.getItem(KEY))), []);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Progress remains available for this session. */
    }
  }, [state]);

  const start = useCallback((id: MissionId) => {
    setRecap(null);
    setState((current) => ({ ...current, active: { id, step: 0 } }));
  }, []);
  const advance = useCallback(
    (zone: ZoneId) => {
      const finishing =
        state.active &&
        MISSIONS[state.active.id].steps[state.active.step]?.zone === zone &&
        state.active.step === MISSIONS[state.active.id].steps.length - 1
          ? state.active.id
          : null;
      setState((current) => advanceMission(current, zone));
      if (finishing) setRecap(finishing);
    },
    [state],
  );
  const stop = useCallback(() => setState((current) => ({ ...current, active: null })), []);
  const reset = useCallback(() => {
    setRecap(null);
    setState(EMPTY_MISSION_STATE);
  }, []);
  const activeMission = state.active ? MISSIONS[state.active.id] : null;
  const activeStep = state.active ? activeMission?.steps[state.active.step] : null;
  return useMemo(
    () => ({
      state,
      activeMission,
      activeStep,
      recap,
      start,
      advance,
      stop,
      reset,
      closeRecap: () => setRecap(null),
    }),
    [state, activeMission, activeStep, recap, start, advance, stop, reset],
  );
}
