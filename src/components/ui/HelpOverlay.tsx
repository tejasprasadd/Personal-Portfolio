import { HoloPanel } from "./HoloPanel";
import { ACHIEVEMENTS, type AchievementId } from "@/data/portfolio";
import { MISSIONS, type MissionDefinition, type MissionId } from "@/lib/missions";
import { Compass, Stamp } from "lucide-react";

const CONTROLS: [string, string][] = [
  ["W / ↑", "Accelerate"],
  ["S / ↓", "Brake & reverse"],
  ["A D / ← →", "Steer"],
  ["Shift", "Turbo boost"],
  ["Space or X", "Handbrake — lock the rear wheels and drift"],
  ["V or Ctrl", "Hop over obstacles"],
  ["Mouse drag", "Orbit the camera"],
  ["Mouse wheel", "Zoom in / out"],
  ["E or Enter", "Open nearby zone"],
  ["Escape", "Close panel"],
  ["M", "Mute / unmute"],
  ["R", "Reset the scene"],
  ["Touch", "Joystick + BOOST / DRIFT / HOP / OPEN buttons"],
];

export function HelpOverlay({
  onClose,
  unlocked,
  completedMissions,
  activeMission,
  onChooseMission,
}: {
  onClose: () => void;
  unlocked: AchievementId[];
  completedMissions: MissionId[];
  activeMission: MissionDefinition | null;
  onChooseMission: () => void;
}) {
  return (
    <HoloPanel
      title="FIELD GUIDE"
      subtitle="missions, passport, and driving controls"
      accent="#86EFAC"
      onClose={onClose}
    >
      <section className="field-guide-missions">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/80">
            Current mission
          </p>
          <h3>{activeMission?.title ?? "Free exploration"}</h3>
          <p>
            {activeMission?.description ??
              "Choose a short role-based route or continue exploring at your own pace."}
          </p>
        </div>
        <button onClick={onChooseMission}>
          <Compass /> {activeMission ? "Change mission" : "Choose a mission"}
        </button>
      </section>
      <section className="passport-strip" aria-label="Engineering passport">
        <p>
          <Stamp /> Engineering passport
        </p>
        <div>
          {Object.values(MISSIONS).map((mission) => {
            const earned = completedMissions.includes(mission.id);
            return (
              <span
                key={mission.id}
                className={earned ? "earned" : ""}
                style={{ borderColor: earned ? mission.accent : undefined }}
              >
                {earned ? "✓" : "○"} {mission.stamp}
              </span>
            );
          })}
        </div>
      </section>
      <div className="grid gap-6 md:grid-cols-2 field-guide-columns">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/80">Controls</p>
          <ul className="mt-3 space-y-2">
            {CONTROLS.map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-3 text-sm">
                <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-[11px] text-crt">
                  {k}
                </span>
                <span className="text-right text-foreground/80">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/80">
            Achievements
          </p>
          <ul className="mt-3 space-y-2">
            {ACHIEVEMENTS.map((a) => {
              const got = unlocked.includes(a.id);
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border/70 px-3 py-2"
                  style={{ borderColor: got ? "#FACC1566" : undefined }}
                >
                  <span
                    className="font-mono text-[11px] uppercase tracking-widest"
                    style={{ color: got ? "#FACC15" : "#A5A0C0" }}
                  >
                    {got ? "★" : "☆"} {a.label}
                  </span>
                  <span className="text-right text-[11px] text-muted-foreground">{a.hint}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </HoloPanel>
  );
}
