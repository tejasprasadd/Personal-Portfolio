/** One context, created synchronously inside the visitor's enabling gesture. */
let context: AudioContext | null = null;
const listeners = new Set<(ctx: AudioContext) => void>();

export async function activateDrivingAudio(confirm = false): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return false;
  try {
    if (!context || context.state === "closed") {
      context = new Ctor();
      listeners.forEach((listener) => listener(context!));
    }
    // Call resume before the first await so browser user activation is retained.
    if (context.state !== "running") await context.resume();
    if (context.state !== "running") return false;
    if (confirm) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.setValueAtTime(520, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(780, context.currentTime + 0.12);
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
    }
    return true;
  } catch {
    return false;
  }
}

export function subscribeDrivingAudio(listener: (ctx: AudioContext) => void) {
  listeners.add(listener);
  if (context && context.state !== "closed") listener(context);
  return () => {
    listeners.delete(listener);
  };
}
