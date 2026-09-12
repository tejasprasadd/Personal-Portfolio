import { HoloPanel } from "./HoloPanel";
import { RetroButton } from "./RetroButton";
import type { QualityPref, Settings } from "@/hooks/useSettings";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3">
      <span className="font-mono text-[11px] uppercase tracking-widest text-foreground/85">
        {label}
      </span>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-colors"
      style={{
        borderColor: on ? "#86EFAC88" : "#8B5CF644",
        color: on ? "#86EFAC" : "#A5A0C0",
        background: on ? "#86EFAC14" : "transparent",
      }}
    >
      {on ? "On" : "Off"}
    </button>
  );
}

export function SettingsPanel({
  settings,
  update,
  onClose,
  onResetAchievements,
  onResetScene,
  onSwitchMode,
  mode,
}: {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  onClose: () => void;
  onResetAchievements: () => void;
  onResetScene: () => void;
  onSwitchMode: () => void;
  mode: "3d" | "2d";
}) {
  return (
    <HoloPanel title="SETTINGS" subtitle="system preferences" accent="#22D3EE" onClose={onClose}>
      <div className="space-y-1">
        <Row label="Sound effects">
          <Toggle
            on={settings.sound}
            label="Sound effects"
            onChange={(v) => update({ sound: v })}
          />
        </Row>
        <Row label="Ambient music">
          <Toggle on={settings.music} label="Ambient music" onChange={(v) => update({ music: v })} />
        </Row>
        <Row label="Quality">
          <div className="flex gap-2">
            {(["auto", "high", "medium", "low"] as QualityPref[]).map((q) => (
              <button
                key={q}
                onClick={() => update({ quality: q })}
                aria-pressed={settings.quality === q}
                className="rounded-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-widest"
                style={{
                  borderColor: settings.quality === q ? "#22D3EE99" : "#8B5CF644",
                  color: settings.quality === q ? "#22D3EE" : "#A5A0C0",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Reduce motion">
          <Toggle
            on={settings.reduceMotion}
            label="Reduce motion"
            onChange={(v) => update({ reduceMotion: v })}
          />
        </Row>
        <Row label="CRT effects">
          <Toggle on={settings.crt} label="CRT effects" onChange={(v) => update({ crt: v })} />
        </Row>
        <Row label={mode === "3d" ? "Switch to 2D portfolio" : "Switch to 3D world"}>
          <RetroButton onClick={onSwitchMode}>{mode === "3d" ? "2D mode" : "3D mode"}</RetroButton>
        </Row>
        <div className="flex flex-wrap gap-3 pt-4">
          <RetroButton onClick={onResetScene}>Reset scene</RetroButton>
          <RetroButton onClick={onResetAchievements}>Reset achievements</RetroButton>
        </div>
      </div>
    </HoloPanel>
  );
}
