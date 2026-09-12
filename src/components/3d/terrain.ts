/** Procedural rough offroad terrain shared by the renderer, physics and the jeep. */

export const WORLD_SIZE = 200;
/** Kept for compatibility: the map has no water any more. */
export const WATER_LEVEL = -999;

/** A broad, looping offroad route that threads through the portfolio camps. */
export function trailInfo(x: number, z: number) {
  const radius = Math.hypot(x, z);
  const angle = Math.atan2(z, x);
  const centerRadius = 27.5 + Math.sin(angle * 3 + 0.4) * 2.8 + Math.sin(angle * 5 - 0.7) * 1.1;
  const offset = radius - centerRadius;
  const distance = Math.abs(offset);
  const surface = Math.max(0, 1 - distance / 5.2);
  return { angle, centerRadius, offset, distance, surface };
}

/** Ground height at any world point: rolling dirt, ruts and low humps. */
export function heightAt(x: number, z: number) {
  const r = Math.hypot(x, z);

  let h =
    Math.sin(x * 0.028 + z * 0.017) * 2.1 +
    Math.cos(z * 0.024 - x * 0.013) * 1.7 +
    Math.sin((x + z) * 0.058) * 0.9 +
    Math.cos((x - z) * 0.045) * 0.7 +
    Math.sin(x * 0.1) * 0.45 +
    Math.cos(z * 0.12) * 0.4 +
    Math.sin(x * 0.22 + z * 0.18) * 0.18;

  // Keep the camp clearing gentle, let the roughness grow outward.
  const flat = Math.min(1, Math.max(0, (r - 6) / 18));
  h *= 0.25 + flat * 0.75;

  // Cut a compact expedition trail into the terrain rather than laying a
  // flat road on top. Twin wheel grooves, a raised crown and eroded shoulders
  // all remain part of the physics mesh, so the suspension follows them.
  const trail = trailInfo(x, z);
  const rutLeft = Math.exp(-Math.pow((trail.offset - 1.35) / 0.5, 2));
  const rutRight = Math.exp(-Math.pow((trail.offset + 1.35) / 0.5, 2));
  const crown = Math.exp(-Math.pow(trail.offset / 0.8, 2));
  const shoulder = Math.exp(-Math.pow((trail.distance - 4.6) / 0.75, 2));
  const corrugation = Math.sin(trail.angle * 38) * 0.1 * trail.surface;
  h += shoulder * 0.3 + crown * 0.14 - (rutLeft + rutRight) * 0.42 + corrugation;

  // Soft berm at the far edge so the world reads as bounded (no mountains).
  const m = Math.max(0, r - 78);
  h += m * m * 0.006;
  h = Math.min(h, 20);

  return h;
}

/** No water on this map. */
export function isWater(_x: number, _z: number) {
  return false;
}

/** Approximate surface normal via finite differences. */
export function slopeAt(x: number, z: number, e = 1.2) {
  const hl = heightAt(x - e, z);
  const hr = heightAt(x + e, z);
  const hd = heightAt(x, z - e);
  const hu = heightAt(x, z + e);
  return { dx: (hr - hl) / (2 * e), dz: (hu - hd) / (2 * e) };
}

/** Deterministic pseudo-random in [0,1). */
export function rand(i: number, seed = 1) {
  return ((Math.sin(i * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;
}
