import { useCallback, useEffect, useState } from "react";

export type Quality = "high" | "medium" | "low";
/** User preference: a fixed tier, or let the runtime scaler decide. */
export type QualityPref = Quality | "auto";

export type Settings = {
  sound: boolean;
  music: boolean;
  quality: QualityPref;
  reduceMotion: boolean;
  crt: boolean;
};

const KEY = "tejas_os_settings_v2";

export const DEFAULT_SETTINGS: Settings = {
  sound: false,
  music: false,
  quality: "auto",
  reduceMotion: false,
  crt: false,
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

  useEffect(() => {
    setSettings(read());
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
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

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("reduce-motion", settings.reduceMotion);
    document.documentElement.classList.toggle("no-crt", !settings.crt);
  }, [settings.reduceMotion, settings.crt]);

  return { settings, update };
}
