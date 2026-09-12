import { useEffect, useRef } from "react";

export type ControlState = {
  forward: number;
  turn: number;
  jump: boolean;
  boost: boolean;
  handbrake: boolean;
};

const DRIVE_KEYS = new Set([
  "KeyW",
  "ArrowUp",
  "KeyS",
  "ArrowDown",
  "KeyA",
  "ArrowLeft",
  "KeyD",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyX",
  "KeyV",
  "ControlLeft",
]);

/** Shared mutable control state driven by keyboard and touch joystick. */
export const controls: ControlState = {
  forward: 0,
  turn: 0,
  jump: false,
  boost: false,
  handbrake: false,
};

export function useGameControls(opts: {
  enabled: boolean;
  onInteract: () => void;
  onReset: () => void;
  onEscape: () => void;
  onToggleMute: () => void;
}) {
  const pressedRef = useRef(new Set<string>());
  const ref = useRef(opts);
  ref.current = opts;

  useEffect(() => {
    const pressed = pressedRef.current;

    const apply = () => {
      const fwd =
        (pressed.has("KeyW") || pressed.has("ArrowUp") ? 1 : 0) -
        (pressed.has("KeyS") || pressed.has("ArrowDown") ? 1 : 0);
      const turn =
        (pressed.has("KeyA") || pressed.has("ArrowLeft") ? 1 : 0) -
        (pressed.has("KeyD") || pressed.has("ArrowRight") ? 1 : 0);
      controls.forward = fwd;
      controls.turn = turn;
      controls.jump = pressed.has("KeyV") || pressed.has("ControlLeft");
      controls.boost = pressed.has("ShiftLeft") || pressed.has("ShiftRight");
      controls.handbrake = pressed.has("Space") || pressed.has("KeyX");
    };

    const clear = () => {
      pressed.clear();
      apply();
    };

    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) return;

      if (e.code === "Escape") {
        ref.current.onEscape();
        return;
      }
      if (e.code === "KeyM") {
        ref.current.onToggleMute();
        return;
      }
      if (!ref.current.enabled) return;
      if (
        e.code === "KeyE" ||
        (e.code === "Enter" && target?.tagName !== "BUTTON" && target?.tagName !== "A")
      ) {
        ref.current.onInteract();
        return;
      }
      if (e.code === "KeyR") {
        ref.current.onReset();
        return;
      }
      if (DRIVE_KEYS.has(e.code)) {
        e.preventDefault();
        pressed.add(e.code);
        apply();
      }
    };

    const up = (e: KeyboardEvent) => {
      if (pressed.delete(e.code)) apply();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
      clear();
    };
  }, []);

  // Freeze driving whenever a panel/overlay takes over.
  useEffect(() => {
    if (!opts.enabled) {
      pressedRef.current.clear();
      controls.forward = 0;
      controls.turn = 0;
      controls.jump = false;
      controls.boost = false;
      controls.handbrake = false;
    }
  }, [opts.enabled]);
}
