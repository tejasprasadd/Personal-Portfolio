import type { Quality } from "@/hooks/useSettings";

/** Everything the renderer scales per quality tier. */
export type QualityPreset = {
  /** Device pixel ratio clamp [min, max] before the display cap is applied. */
  dpr: [number, number];
  shadows: boolean;
  shadowMap: number;
  /** Terrain mesh resolution. */
  terrainSegments: number;
  /** LOD switch distances for trees: [near, mid, far]. */
  treeLod: [number, number, number];
  /** LOD switch distances for boulders: [near, far]. */
  rockLod: [number, number];
  /** Fraction of distant scatter kept. */
  scatterKeep: number;
  /** Radius (from origin) beyond which decoration is dropped entirely. */
  drawDistance: number;
  particles: number;
  /** Camera far plane. */
  far: number;
  fogDensity: number;
};

export const QUALITY_PRESETS: Record<Quality, QualityPreset> = {
  high: {
    dpr: [1, 2],
    shadows: true,
    shadowMap: 2048,
    terrainSegments: 220,
    treeLod: [0, 30, 70],
    rockLod: [0, 45],
    scatterKeep: 1,
    drawDistance: 200,
    particles: 280,
    far: 340,
    fogDensity: 0.0032,
  },
  medium: {
    dpr: [1, 1.5],
    shadows: true,
    shadowMap: 1024,
    terrainSegments: 150,
    treeLod: [0, 20, 46],
    rockLod: [0, 30],
    scatterKeep: 0.7,
    drawDistance: 120,
    particles: 160,
    far: 260,
    fogDensity: 0.0042,
  },
  low: {
    dpr: [0.7, 1],
    shadows: false,
    shadowMap: 512,
    terrainSegments: 90,
    treeLod: [0, 12, 26],
    rockLod: [0, 18],
    scatterKeep: 0.4,
    drawDistance: 78,
    particles: 60,
    far: 180,
    fogDensity: 0.0058,
  },
};
