import { useEffect, useState } from "react";

export type Capabilities = {
  ready: boolean;
  webgl: boolean;
  touch: boolean;
  lowPower: boolean;
};

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    const supported = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  } catch {
    return false;
  }
}

export function useDeviceCapabilities(): Capabilities {
  const [caps, setCaps] = useState<Capabilities>({
    ready: false,
    webgl: true,
    touch: false,
    lowPower: false,
  });

  useEffect(() => {
    const touch =
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0 ||
      "ontouchstart" in window;
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
    setCaps({
      ready: true,
      webgl: detectWebGL(),
      touch,
      lowPower: cores <= 4 || mem <= 2,
    });
  }, []);

  return caps;
}
