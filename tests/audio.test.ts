import { expect, test } from "bun:test";
import { activateDrivingAudio, subscribeDrivingAudio } from "../src/lib/drivingAudio";

test("audio is lazy, resumes on activation, and shares one context across controls", async () => {
  const original = globalThis.window;
  let constructed = 0,
    resumed = 0,
    started = 0;
  class Context {
    state = "suspended";
    currentTime = 0;
    destination = {};
    constructor() {
      constructed++;
    }
    async resume() {
      resumed++;
      this.state = "running";
    }
    createOscillator() {
      return {
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {
          return { connect() {} };
        },
        disconnect() {},
        start() {
          started++;
        },
        stop() {},
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {},
        disconnect() {},
      };
    }
  }
  let notifications = 0;
  try {
    Object.defineProperty(globalThis, "window", {
      value: { AudioContext: Context },
      configurable: true,
      writable: true,
    });
    const unsubscribe = subscribeDrivingAudio(() => notifications++);
    expect(constructed).toBe(0);
    const pending = activateDrivingAudio(true);
    expect(resumed).toBe(1); // resume occurs synchronously in the enabling gesture
    expect(await pending).toBe(true);
    expect(await activateDrivingAudio()).toBe(true);
    expect(constructed).toBe(1);
    expect(notifications).toBe(1);
    expect(started).toBe(1);
    unsubscribe();
    Object.defineProperty(globalThis, "window", { value: {}, configurable: true, writable: true });
    expect(await activateDrivingAudio()).toBe(false);
  } finally {
    Object.defineProperty(globalThis, "window", {
      value: original,
      configurable: true,
      writable: true,
    });
  }
});
