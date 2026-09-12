import { useCallback, useEffect, useRef } from "react";

/**
 * Lightweight synthesized audio engine (no external assets).
 * Every cue is generated with the WebAudio API so the site ships with zero
 * audio downloads and works fine when sound is disabled.
 */
export type Cue = "boot" | "hover" | "click" | "unlock" | "success" | "close";

const TONES: Record<Cue, { freq: number; to: number; dur: number; type: OscillatorType }> = {
  boot: { freq: 180, to: 620, dur: 0.55, type: "sine" },
  hover: { freq: 620, to: 720, dur: 0.06, type: "square" },
  click: { freq: 420, to: 240, dur: 0.09, type: "square" },
  unlock: { freq: 320, to: 880, dur: 0.28, type: "triangle" },
  success: { freq: 520, to: 1040, dur: 0.22, type: "sine" },
  close: { freq: 400, to: 160, dur: 0.14, type: "sine" },
};

export function useAudio(enabled: boolean, volume = 0.35) {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensure = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (cue: Cue) => {
      if (!enabled) return;
      const ctx = ensure();
      if (!ctx) return;
      const { freq, to, dur, type } = TONES[cue];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + dur);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    },
    [enabled, ensure, volume],
  );

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  return play;
}
