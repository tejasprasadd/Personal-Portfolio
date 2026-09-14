import { useCallback, useEffect, useRef, useState } from "react";
import { activateDrivingAudio } from "@/lib/drivingAudio";
import { parseTimeOfDay, resolveTimeOfDay, type TimeOfDayPreference } from "@/lib/timeOfDay";

export type Quality = "high" | "medium" | "low";
/** User preference: a fixed tier, or let the runtime scaler decide. */
export type QualityPref = Quality | "auto";

export type Settings = {
  sound: boolean;
  music: boolean;
  quality: QualityPref;
  reduceMotion: boolean;
  crt: boolean;
  timeOfDay: TimeOfDayPreference;
};

const KEY = "tejas_os_settings_v2";

export const DEFAULT_SETTINGS: Settings = {
  sound: false,
  music: false,
  quality: "auto",
  reduceMotion: false,
  crt: false,
  timeOfDay: "auto",
};

function read(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw)
      return {
        ...DEFAULT_SETTINGS,
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      };
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<Settings>),
      timeOfDay: parseTimeOfDay((JSON.parse(raw) as Partial<Settings>).timeOfDay),
      reduceMotion:
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        Boolean((JSON.parse(raw) as Partial<Settings>).reduceMotion),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [clock, setClock] = useState<Date | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRequest = useRef(0);

  useEffect(() => {
    setSettings(read());
    setClock(new Date());
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const persist = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      const request =
        patch.sound !== undefined || patch.music !== undefined
          ? ++audioRequest.current
          : audioRequest.current;
      if (patch.sound === true || patch.music === true) {
        setAudioError(null);
        void activateDrivingAudio(patch.sound === true).then((ok) => {
          if (request !== audioRequest.current) return;
          if (ok) persist(patch);
          else setAudioError("Sound could not start. Tap the sound button to try again.");
        });
      } else persist(patch);
    },
    [persist],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("reduce-motion", settings.reduceMotion);
    document.documentElement.classList.toggle("no-crt", !settings.crt);
  }, [settings.reduceMotion, settings.crt]);

  return {
    settings,
    update,
    audioError,
    timeOfDay: clock ? resolveTimeOfDay(settings.timeOfDay, clock) : ("day" as const),
  };
}
