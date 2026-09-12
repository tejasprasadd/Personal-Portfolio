import { useCallback, useMemo, useRef, useState } from "react";
import type { Quality } from "./useSettings";
import type { Capabilities } from "./useDeviceCapabilities";

const TIERS: Quality[] = ["low", "medium", "high"];

/** Conservative starting tier derived from what the device tells us up front. */
export function seedTier(caps: Capabilities): Quality {
  if (!caps.ready) return "medium";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  if (caps.lowPower || cores <= 4 || mem <= 2) return "low";
  if (caps.touch || cores <= 6 || (mem <= 4 && dpr > 2)) return "medium";
  return "high";
}

const DOWN_FPS = 40;
const UP_FPS = 55;
/** Seconds a tier must hold steady before another change is allowed. */
const COOLDOWN = 4;
/** Seconds of sustained evidence needed before stepping. */
const WINDOW = 1.5;

/**
 * Rolling frame-time sampler that walks the quality tier up or down on its own.
 * `sample(dt)` is called from the render loop; the returned tier is React state.
 */
export function useQualityScaler(initial: Quality) {
  const [tier, setTier] = useState<Quality>(initial);
  const tierRef = useRef<Quality>(initial);
  const acc = useRef(0);
  const frames = useRef(0);
  const cooldown = useRef(COOLDOWN);
  const slow = useRef(0);
  const fast = useRef(0);
  const [fps, setFps] = useState(60);

  const set = useCallback((next: Quality) => {
    tierRef.current = next;
    setTier(next);
    cooldown.current = COOLDOWN;
    slow.current = 0;
    fast.current = 0;
  }, []);

  const sample = useCallback(
    (dt: number) => {
      if (dt <= 0 || dt > 0.5) return;
      acc.current += dt;
      frames.current += 1;
      cooldown.current -= dt;
      if (acc.current < 0.5) return;

      const measured = frames.current / acc.current;
      acc.current = 0;
      frames.current = 0;
      setFps(Math.round(measured));

      if (cooldown.current > 0) return;

      const idx = TIERS.indexOf(tierRef.current);
      if (measured < DOWN_FPS) {
        slow.current += 0.5;
        fast.current = 0;
        if (slow.current >= WINDOW && idx > 0) set(TIERS[idx - 1]!);
      } else if (measured > UP_FPS) {
        fast.current += 0.5;
        slow.current = 0;
        // promoting is riskier than demoting — demand a longer clean streak
        if (fast.current >= WINDOW * 3 && idx < TIERS.length - 1) set(TIERS[idx + 1]!);
      } else {
        slow.current = 0;
        fast.current = 0;
      }
    },
    [set],
  );

  const reset = useCallback(
    (next: Quality) => {
      if (next !== tierRef.current) set(next);
    },
    [set],
  );

  return useMemo(() => ({ tier, fps, sample, reset }), [tier, fps, sample, reset]);
}
