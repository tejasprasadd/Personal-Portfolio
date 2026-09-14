import { useEffect, useRef } from "react";
import type { PlayerState } from "@/components/3d/Player";
import { activateDrivingAudio, subscribeDrivingAudio } from "@/lib/drivingAudio";

/**
 * Fully synthesized driving audio: ambient soundtrack pad, engine revs tied to
 * RPM, tyre/terrain rumble tied to speed, plus one-shot FX for hops, landings
 * and impacts. No audio files are downloaded.
 */
export function useDrivingAudio({
  state,
  enabled,
  music,
  active,
}: {
  state: PlayerState;
  enabled: boolean;
  music: boolean;
  active: boolean;
}) {
  const ref = useRef({ state, enabled, music, active });
  ref.current = { state, enabled, music, active };

  useEffect(() => {
    if (typeof window === "undefined") return;
    let dispose: (() => void) | undefined;
    const unsubscribe = subscribeDrivingAudio((ctx) => {
      dispose?.();

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // ---- engine: crossplane V8 stack -> overdrive -> resonant exhaust ------
      const engineGain = ctx.createGain();
      engineGain.gain.value = 0;

      // Overdrive gives the burbly, torn-air roar a clean oscillator can't.
      const shaper = ctx.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < curve.length; i++) {
        const x = (i / (curve.length - 1)) * 2 - 1;
        curve[i] = Math.tanh(x * 3.2);
      }
      shaper.curve = curve;
      shaper.oversample = "4x";

      // Exhaust body: resonant peak around the pipe frequency + lowpass cab damping.
      const exhaustPeak = ctx.createBiquadFilter();
      exhaustPeak.type = "peaking";
      exhaustPeak.frequency.value = 190;
      exhaustPeak.Q.value = 3.2;
      exhaustPeak.gain.value = 9;

      const engineFilter = ctx.createBiquadFilter();
      engineFilter.type = "lowpass";
      engineFilter.frequency.value = 900;
      engineFilter.Q.value = 1.1;

      engineGain.connect(shaper).connect(exhaustPeak).connect(engineFilter).connect(master);

      /**
       * Crossplane V8: uneven firing gives the half-order (0.5x) and 1.5x
       * components that make the classic lopey burble instead of a flat drone.
       */
      const V8_PARTIALS: { mul: number; gain: number; type: OscillatorType }[] = [
        { mul: 0.5, gain: 0.55, type: "sine" }, // sub thump
        { mul: 1, gain: 1.0, type: "sawtooth" }, // firing fundamental
        { mul: 1.5, gain: 0.42, type: "square" }, // crossplane lope
        { mul: 2, gain: 0.5, type: "sawtooth" },
        { mul: 3, gain: 0.26, type: "square" },
        { mul: 4.5, gain: 0.14, type: "sawtooth" },
      ];
      const engineOscs = V8_PARTIALS.map(({ mul, gain, type }) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.detune.value = (Math.random() - 0.5) * 14; // cylinder-to-cylinder scatter
        const g = ctx.createGain();
        g.gain.value = gain * 0.42;
        o.connect(g).connect(engineGain);
        o.start();
        return { o, mul };
      });

      // Combustion roar: filtered noise pushed through the same overdrive.
      const roarNoiseGain = ctx.createGain();
      roarNoiseGain.gain.value = 0;
      const roarFilter = ctx.createBiquadFilter();
      roarFilter.type = "bandpass";
      roarFilter.frequency.value = 300;
      roarFilter.Q.value = 0.7;
      roarFilter.connect(roarNoiseGain).connect(engineGain);

      // ---- noise source shared by tyres and FX -------------------------------
      const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const tyre = ctx.createBufferSource();
      tyre.buffer = noiseBuf;
      tyre.loop = true;
      const tyreFilter = ctx.createBiquadFilter();
      tyreFilter.type = "bandpass";
      tyreFilter.frequency.value = 380;
      tyreFilter.Q.value = 0.8;
      const tyreGain = ctx.createGain();
      tyreGain.gain.value = 0;
      tyre.connect(tyreFilter).connect(tyreGain).connect(master);
      tyre.start();

      const roarNoise = ctx.createBufferSource();
      roarNoise.buffer = noiseBuf;
      roarNoise.loop = true;
      roarNoise.connect(roarFilter);
      roarNoise.start();

      // ---- ambient soundtrack: slow drifting pad -----------------------------
      const padGain = ctx.createGain();
      padGain.gain.value = 0;
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 700;
      padGain.connect(padFilter).connect(master);

      const padOscs = [110, 164.81, 220, 329.63].map((f, i) => {
        const o = ctx.createOscillator();
        o.type = i % 2 ? "triangle" : "sine";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = i === 3 ? 0.06 : 0.12;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.017;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.06;
        lfo.connect(lfoGain).connect(g.gain);
        o.connect(g).connect(padGain);
        o.start();
        lfo.start();
        return { o, lfo };
      });

      // ---- one-shot FX -------------------------------------------------------
      const burst = (freq: number, dur: number, gain: number, type: BiquadFilterType) => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        const g = ctx.createGain();
        const now = ctx.currentTime;
        g.gain.setValueAtTime(gain, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        src.connect(f).connect(g).connect(master);
        src.start(now);
        src.stop(now + dur + 0.02);
      };

      const thump = (freq: number, dur: number, gain: number) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        const g = ctx.createGain();
        const now = ctx.currentTime;
        o.frequency.setValueAtTime(freq, now);
        o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.3), now + dur);
        g.gain.setValueAtTime(gain, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o.connect(g).connect(master);
        o.start(now);
        o.stop(now + dur + 0.02);
      };

      let raf = 0;
      let last = performance.now();
      let wasAir = false;
      let prevImpact = 0;
      let terrainClock = 0;

      const tick = () => {
        raf = requestAnimationFrame(tick);
        const now = performance.now();
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;

        const { state: s, enabled: on, music: mus, active: act } = ref.current;
        const live = on && act;
        const t = ctx.currentTime;

        master.gain.setTargetAtTime(act && (on || mus) ? 0.48 : 0, t, 0.08);
        padGain.gain.setTargetAtTime(act && mus ? 0.25 : 0, t, 0.3);

        const rpm = Math.max(0, Math.min(1, s.rpm ?? 0));
        const speed = Math.abs(s.speed ?? 0);

        // V8 firing frequency: lazy idle lope up to a hard-edged top-end roar
        const base = 34 + rpm * 128;
        for (const { o, mul } of engineOscs) {
          o.frequency.setTargetAtTime(base * mul, t, 0.04);
        }
        exhaustPeak.frequency.setTargetAtTime(base * 2.2, t, 0.06);
        exhaustPeak.gain.setTargetAtTime(7 + rpm * 7, t, 0.08);
        engineFilter.frequency.setTargetAtTime(620 + rpm * rpm * 4200, t, 0.07);
        // Drive harder into the waveshaper as revs climb -> the roar gets dirtier.
        engineGain.gain.setTargetAtTime(live ? 0.16 + rpm * 0.62 : 0, t, 0.07);
        roarNoiseGain.gain.setTargetAtTime(live ? 0.05 + rpm * 0.2 : 0, t, 0.09);
        roarFilter.frequency.setTargetAtTime(240 + rpm * 1500, t, 0.09);

        // tyre / terrain rumble scales with speed, muted in the air
        const rough = s.airborne ? 0 : Math.min(1, speed / 22);
        tyreGain.gain.setTargetAtTime(live ? rough * 0.14 : 0, t, 0.1);
        tyreFilter.frequency.setTargetAtTime(240 + rough * 700, t, 0.1);

        if (live) {
          // terrain chatter: periodic gravel ticks while rolling over rough ground
          terrainClock -= dt;
          if (rough > 0.25 && terrainClock <= 0) {
            terrainClock = 0.16 + Math.random() * 0.22 * (1.2 - rough);
            burst(900 + Math.random() * 1400, 0.05, 0.05 * rough, "bandpass");
          }

          // hop off the ground
          if (s.airborne && !wasAir) burst(1200, 0.14, 0.1, "highpass");
          // landing
          if (!s.airborne && wasAir) {
            thump(120, 0.25, 0.28);
            burst(500, 0.18, 0.14, "lowpass");
          }
          // collision impacts (impact spikes upward)
          const imp = s.impact ?? 0;
          if (imp - prevImpact > 0.12) {
            thump(90, 0.3, Math.min(0.45, 0.22 + imp * 0.3));
            burst(1800, 0.12, 0.14, "highpass");
          }
          prevImpact = imp;
        }
        wasAir = !!s.airborne;
      };
      raf = requestAnimationFrame(tick);

      dispose = () => {
        cancelAnimationFrame(raf);
        try {
          engineOscs.forEach(({ o }) => o.stop());
          roarNoise.stop();
          tyre.stop();
          padOscs.forEach(({ o, lfo }) => {
            o.stop();
            lfo.stop();
          });
        } catch {
          /* already stopped */
        }
        master.disconnect();
      };
    });
    const resume = () => {
      if (ref.current.enabled || ref.current.music) void activateDrivingAudio();
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
    return () => {
      unsubscribe();
      dispose?.();
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);
}
