import { useEffect, useRef, useState } from "react";

const LINES = [
  "INITIALIZING TEJAS_OS...",
  "LOADING AI MODULES...",
  "LOADING PROJECT ARCHIVE...",
  "CONNECTING TO PORTFOLIO WORLD...",
  "SYSTEM READY",
];

export function BootScreen({ onDone, instant }: { onDone: () => void; instant?: boolean }) {
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  useEffect(() => {
    if (instant) {
      finish();
      return;
    }
    const timers = LINES.map((_, i) =>
      window.setTimeout(() => setShown(i + 1), 350 + i * 480),
    );
    const start = performance.now();
    const total = 350 + LINES.length * 480;
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / total);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(finish, 420);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      timers.forEach(window.clearTimeout);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instant]);

  if (instant) return null;

  return (
    <div className="scanlines fixed inset-0 z-[80] flex items-center justify-center bg-[#050711] px-6">
      <div className="w-full max-w-lg">
        <p className="font-mono text-xs text-crt">
          TEJAS_OS v1.0 <span className="caret-blink">▊</span>
        </p>
        <div className="mt-6 min-h-[9.5rem] space-y-2">
          {LINES.slice(0, shown).map((l, i) => (
            <p
              key={l}
              className="font-mono text-[13px] text-crt/90"
              style={{ color: i === LINES.length - 1 ? "#86EFAC" : undefined }}
            >
              &gt; {l}
            </p>
          ))}
        </div>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-sm border border-cyan/40 bg-void">
          <div
            className="h-full bg-gradient-to-r from-violet to-cyan transition-[width] duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-[11px] text-muted-foreground">
            {Math.round(progress * 100)}% — booting portfolio world
          </p>
          <button
            onClick={finish}
            className="rounded-sm border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-foreground/80 transition-colors hover:border-cyan/70 hover:text-cyan"
          >
            Skip intro
          </button>
        </div>
      </div>
    </div>
  );
}
