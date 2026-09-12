import { useEffect, useRef } from "react";
import { REDLINE, type PlayerState } from "@/components/3d/Player";

/** Tacho arc geometry: a 240deg sweep drawn with a stroke-dash trick. */
const R = 34;
const CIRC = 2 * Math.PI * R;
const SWEEP = 0.667; // 240deg of the circle

/**
 * Driver HUD: analog tacho + digital speed readout. All values are read imperatively from the shared
 * PlayerState each frame so React never re-renders while driving.
 */
export function Dashboard({ playerState }: { playerState: PlayerState }) {
  const needle = useRef<SVGLineElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const rpmText = useRef<HTMLSpanElement>(null);
  const speedText = useRef<HTMLSpanElement>(null);
  const gearText = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const rpm = Math.min(1, Math.max(0, playerState.rpm ?? 0));
      const kph = Math.abs(playerState.speed) * 3.6;

      if (needle.current) {
        needle.current.style.transform = `rotate(${-120 + rpm * 240}deg)`;
      }
      if (arc.current) {
        arc.current.style.strokeDasharray = `${CIRC * SWEEP * rpm} ${CIRC}`;
        arc.current.style.stroke = rpm > 0.86 ? "var(--color-amber)" : "var(--color-cyan)";
      }
      if (rpmText.current) rpmText.current.textContent = String(Math.round(rpm * REDLINE));
      if (speedText.current) speedText.current.textContent = String(Math.round(kph)).padStart(2, "0");
      if (gearText.current) {
        const g = playerState.gear ?? 1;
        gearText.current.textContent = g === 0 ? "R" : String(g);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playerState]);

  return (
    <section
      aria-label="Vehicle telemetry"
      className="glass-panel pixel-corners pointer-events-none fixed bottom-4 left-4 z-30 hidden w-[16.5rem] rounded-md p-3 md:block"
    >
      <div className="flex items-center gap-3">
        {/* Tachometer */}
        <div className="relative size-[86px] shrink-0">
          <svg viewBox="0 0 80 80" className="size-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-foreground/10"
              strokeDasharray={`${CIRC * SWEEP} ${CIRC}`}
              strokeLinecap="round"
            />
            <circle
              ref={arc}
              cx="40"
              cy="40"
              r={R}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              style={{ stroke: "var(--color-cyan)", strokeDasharray: `0 ${CIRC}` }}
            />
          </svg>
          <svg viewBox="0 0 80 80" className="absolute inset-0 size-full">
            <line
              ref={needle}
              x1="40"
              y1="40"
              x2="40"
              y2="14"
              stroke="var(--color-amber)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ transformOrigin: "40px 40px" }}
            />
            <circle cx="40" cy="40" r="3" fill="var(--color-amber)" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
            Speed
          </p>
          <p className="flex items-baseline gap-1 font-mono text-2xl font-semibold text-foreground">
            <span ref={speedText}>0</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">km/h</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span ref={rpmText}>0</span> rpm · gear <span ref={gearText} className="text-cyan">1</span>
          </p>
        </div>
      </div>

    </section>
  );
}
