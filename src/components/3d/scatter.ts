import { heightAt, isWater, rand, trailInfo } from "./terrain";
import { ZONES } from "./zones";

export type ScatterItem = {
  key: number;
  pos: [number, number, number];
  scale: number;
  rock: boolean;
  /** Collision radius in the XZ plane. */
  radius: number;
};

/** Number of scatter candidates generated (shared by visuals and collision). */
export const SCATTER_COUNT = 220;

/** Boulders sitting in the clearing (always solid). */

export const CLEARING_ROCKS: [number, number][] = [
  [-4, 6],
  [12, -8],
  [-13, 8],
  [20, -14],
];

/** Deterministic forest/boulder scatter shared by the renderer and the jeep physics. */
export function buildScatter(count: number): ScatterItem[] {
  const out: ScatterItem[] = [];
  for (let i = 0; i < count; i++) {
    const a = rand(i, 1) * Math.PI * 2;
    const r = 9 + Math.sqrt(rand(i, 2)) * 78;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = heightAt(x, z);
    if (isWater(x, z) || h > 18) continue;
    // Preserve a clear corridor along the driveable expedition trail.
    if (trailInfo(x, z).distance < 6.4) continue;
    if (r < 17 && rand(i, 6) > 0.15) continue;
    // keep a clear apron around every checkpoint so they stay drivable
    let inZone = false;
    for (const zone of ZONES) {
      if (Math.hypot(x - zone.position[0], z - zone.position[2]) < 9.5) {
        inZone = true;
        break;
      }
    }
    if (inZone) continue;

    const rock = rand(i, 4) > 0.78;
    const scale = 0.75 + rand(i, 3) * 1.3;
    out.push({
      key: i,
      pos: [x, h - 0.15, z],
      scale,
      rock,
      radius: rock ? scale * 1.15 : scale * 0.5,
    });
  }
  return out;
}

/** Every solid blocker the jeep must not drive through: [x, z, radius]. */
export function solidBlockers(items: ScatterItem[]): [number, number, number][] {
  const list: [number, number, number][] = items.map((it) => [it.pos[0], it.pos[2], it.radius]);
  for (const [x, z] of CLEARING_ROCKS) list.push([x, z, 1.35]);
  return list;
}
