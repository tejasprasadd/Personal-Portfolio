import { useCallback, useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS, type AchievementId } from "@/data/portfolio";

const KEY = "tejas_os_achievements_v1";

export function useAchievements(onUnlock?: (label: string) => void) {
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const current = useRef<AchievementId[]>([]);
  const notify = useRef(onUnlock);
  notify.current = onUnlock;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        current.current = JSON.parse(raw) as AchievementId[];
        setUnlocked(current.current);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const unlock = useCallback((id: AchievementId) => {
    if (current.current.includes(id)) return;
    const next = [...current.current, id];
    current.current = next;
    setUnlocked(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* device-local only */
    }
    const meta = ACHIEVEMENTS.find((a) => a.id === id);
    if (meta) notify.current?.(meta.label);
  }, []);

  const reset = useCallback(() => {
    current.current = [];
    setUnlocked([]);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { unlocked, unlock, reset };
}
