import { useEffect, useRef, useState } from "react";
import type { PlayerState } from "@/components/3d/Player";
import { ZONES, type ZoneId } from "@/components/3d/zones";


const SIZE = 148;
const RANGE = 84;

const toPx = (worldValue: number) =>
  Math.max(4, Math.min(SIZE - 4, (worldValue / RANGE) * (SIZE / 2) + SIZE / 2));

/** Top-down radar of the valley with zone waypoints and the jeep's heading. */
export function Minimap({
  playerState,
  nearZone,
  onSelect,
}: {
  playerState: PlayerState;
  nearZone: ZoneId | null;
  onSelect: (id: ZoneId) => void;
}) {
  const dot = useRef<HTMLDivElement>(null);
  const [closest, setClosest] = useState<{ id: ZoneId; dist: number } | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const { position, heading } = playerState;
      if (dot.current) {
        dot.current.style.transform = `translate(-50%,-50%) translate(${toPx(position.x)}px, ${toPx(
          position.z,
        )}px) rotate(${-heading}rad)`;
      }
      let best: { id: ZoneId; dist: number } | null = null;
      for (const z of ZONES) {
        const d = Math.hypot(position.x - z.position[0], position.z - z.position[2]);
        if (!best || d < best.dist) best = { id: z.id, dist: d };
      }
      setClosest((prev) =>
        prev && best && prev.id === best.id && Math.abs(prev.dist - best.dist) < 0.5 ? prev : best,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playerState]);

  const target = closest ? ZONES.find((z) => z.id === closest.id) : null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 hidden md:block">
      <div className="glass-panel pixel-corners pointer-events-auto rounded-md p-2">
        <div
          className="relative overflow-hidden rounded-sm border border-cyan/25 bg-void/70"
          style={{ width: SIZE, height: SIZE }}
          role="img"
          aria-label="Minimap of the valley with zone waypoints"
        >
          {ZONES.map((z) => {
            const active = z.id === nearZone;
            return (
              <button
                key={z.id}
                onClick={() => onSelect(z.id)}
                title={z.label}
                aria-label={`Open ${z.label}`}
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-150"
                style={{
                  left: toPx(z.position[0]),
                  top: toPx(z.position[2]),
                  background: z.color,
                  boxShadow: `0 0 ${active ? 12 : 5}px ${z.color}`,
                  transform: `translate(-50%,-50%) scale(${active ? 1.5 : 1})`,
                }}
              />
            );
          })}
          <div ref={dot} className="absolute left-0 top-0">
            <div className="size-0 border-x-[5px] border-b-[10px] border-x-transparent border-b-foreground" />
          </div>
        </div>
        <p className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          {target ? (
            <span style={{ color: target.color }}>
              {target.label} · {Math.round(closest!.dist)}m
            </span>
          ) : (
            "Valley radar"
          )}
        </p>
      </div>
    </div>
  );
}
