import { Link } from "@tanstack/react-router";
import { HelpCircle, Settings, Volume2, VolumeX } from "lucide-react";
import { PROFILE } from "@/data/portfolio";
import { ZONES, type ZoneId } from "@/components/3d/zones";

export function Hud({
  nearZone,
  sound,
  onToggleSound,
  onHelp,
  onSettings,
  onJump,
}: {
  nearZone: ZoneId | null;
  sound: boolean;
  onToggleSound: () => void;
  onHelp: () => void;
  onSettings: () => void;
  onJump: (id: ZoneId) => void;
}) {
  const near = ZONES.find((z) => z.id === nearZone);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-3 p-4">
        <div className="glass-panel pixel-corners pointer-events-auto rounded-md px-4 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan">TEJAS_OS</p>
          <p className="text-sm font-semibold text-foreground">{PROFILE.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {PROFILE.role}
          </p>
        </div>
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button
            onClick={onToggleSound}
            aria-label={sound ? "Mute sound" : "Unmute sound"}
            className="glass-panel rounded-md p-2 text-foreground/85 hover:text-cyan"
          >
            {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <button
            onClick={onHelp}
            aria-label="Help and controls"
            className="glass-panel rounded-md p-2 text-foreground/85 hover:text-cyan"
          >
            <HelpCircle className="size-4" />
          </button>
          <button
            onClick={onSettings}
            aria-label="Settings"
            className="glass-panel rounded-md p-2 text-foreground/85 hover:text-cyan"
          >
            <Settings className="size-4" />
          </button>
          <Link
            to="/portfolio"
            className="glass-panel rounded-md px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground/85 hover:text-cyan"
          >
            2D portfolio
          </Link>
        </div>
      </header>

      {/* Zone quick-nav: everything is reachable without driving. */}
      <nav
        aria-label="Zones"
        className="pointer-events-auto fixed left-1/2 top-[4.75rem] z-30 hidden max-w-[92vw] -translate-x-1/2 flex-wrap justify-center gap-1.5 md:flex"
      >
        {ZONES.map((z) => (
          <button
            key={z.id}
            onClick={() => onJump(z.id)}
            className="rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors"
            style={{
              borderColor: `${z.color}44`,
              color: z.color,
              background: "rgba(8,11,24,0.6)",
            }}
          >
            {z.label}
          </button>
        ))}
      </nav>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 md:bottom-6">
        <p className="glass-panel rounded-md px-4 py-2 text-center font-mono text-[10px] uppercase tracking-widest text-foreground/80">
          {near ? (
            <span style={{ color: near.color }}>
              {near.label} in range — press E / tap OPEN
            </span>
          ) : (
            <span className="hidden md:inline">
              WASD to drive · drag to look · wheel to zoom · E to interact · R to respawn
            </span>
          )}
          {!near && <span className="md:hidden">Joystick to drive · tap objects to open</span>}
        </p>
      </div>
    </>
  );
}
