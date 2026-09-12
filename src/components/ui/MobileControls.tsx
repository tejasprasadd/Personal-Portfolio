import { useEffect, useRef } from "react";
import { controls } from "@/hooks/useGameControls";

/** Touch driving overlay: analogue joystick + latching action buttons. */
export function MobileControls({ onInteract }: { onInteract: () => void }) {
  const pad = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);

  const setFrom = (clientX: number, clientY: number) => {
    const el = pad.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (clientY - (r.top + r.height / 2)) / (r.height / 2);
    const cx = Math.max(-1, Math.min(1, dx));
    const cy = Math.max(-1, Math.min(1, dy));
    controls.forward = -cy;
    controls.turn = -cx;
    if (knob.current) knob.current.style.transform = `translate(${cx * 32}px, ${cy * 32}px)`;
  };

  const release = () => {
    pointerId.current = null;
    controls.forward = 0;
    controls.turn = 0;
    if (knob.current) knob.current.style.transform = "translate(0,0)";
  };

  // Global release so a finger lifted outside the pad/button never leaves a
  // control latched on.
  useEffect(() => {
    const clear = () => {
      release();
      controls.boost = false;
      controls.handbrake = false;
      controls.jump = false;
    };
    document.addEventListener("visibilitychange", clear);
    window.addEventListener("blur", clear);
    return () => {
      document.removeEventListener("visibilitychange", clear);
      window.removeEventListener("blur", clear);
      clear();
    };
  }, []);

  const holdProps = (set: (on: boolean) => void) => ({
    style: { touchAction: "none" as const, userSelect: "none" as const },
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      set(true);
    },
    onPointerUp: () => set(false),
    onPointerCancel: () => set(false),
    onLostPointerCapture: () => set(false),
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex items-end justify-between px-5">
      <div
        ref={pad}
        role="application"
        aria-label="Movement joystick"
        style={{ touchAction: "none", userSelect: "none" }}
        className="pointer-events-auto relative size-32 touch-none select-none rounded-full border border-cyan/40 bg-void/60 backdrop-blur"
        onPointerDown={(e) => {
          if (pointerId.current !== null) return;
          e.preventDefault();
          pointerId.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFrom(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pointerId.current !== e.pointerId) return;
          e.preventDefault();
          setFrom(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => pointerId.current === e.pointerId && release()}
        onPointerCancel={(e) => pointerId.current === e.pointerId && release()}
        onLostPointerCapture={(e) => pointerId.current === e.pointerId && release()}
      >
        <div
          ref={knob}
          className="pointer-events-none absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet/70 bg-violet/30"
        />
      </div>
      <div className="pointer-events-auto grid grid-cols-2 gap-3">
        <button
          type="button"
          aria-label="Boost"
          {...holdProps((on) => (controls.boost = on))}
          className="size-14 touch-none select-none rounded-full border border-amber-400/60 bg-amber-400/20 font-mono text-[10px] uppercase tracking-widest text-amber-300"
        >
          Boost
        </button>
        <button
          type="button"
          aria-label="Drift handbrake"
          {...holdProps((on) => (controls.handbrake = on))}
          className="size-14 touch-none select-none rounded-full border border-violet/60 bg-violet/20 font-mono text-[10px] uppercase tracking-widest text-violet"
        >
          Drift
        </button>
        <button
          type="button"
          aria-label="Hop"
          {...holdProps((on) => (controls.jump = on))}
          className="size-14 touch-none select-none rounded-full border border-pink/60 bg-pink/20 font-mono text-[10px] uppercase tracking-widest text-pink"
        >
          Hop
        </button>
        <button
          type="button"
          onClick={onInteract}
          style={{ touchAction: "manipulation" }}
          className="size-14 touch-manipulation select-none rounded-full border border-cyan/70 bg-cyan/20 font-mono text-[11px] uppercase tracking-widest text-cyan"
        >
          Open
        </button>
      </div>
    </div>
  );
}
