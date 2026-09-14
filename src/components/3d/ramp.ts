/** Closed, double-ended wedge. Render mesh and convex collider share these vertices. */
export const RAMP_POSITION: [number, number, number] = [10, 0, -5];
export const RAMP_VERTICES = new Float32Array([
  -3.5, -0.15, -7, 3.5, -0.15, -7, -3.5, -0.15, 7, 3.5, -0.15, 7, -3.5, 0.015, -7, 3.5, 0.015, -7,
  -3.5, 0.015, 7, 3.5, 0.015, 7, -3.5, 1.4, 0, 3.5, 1.4, 0,
]);
export const RAMP_INDICES = [
  0, 2, 1, 1, 2, 3, 4, 5, 8, 5, 9, 8, 8, 9, 6, 9, 7, 6, 0, 1, 4, 1, 5, 4, 2, 6, 3, 3, 6, 7, 0, 4, 8,
  0, 8, 6, 0, 6, 2, 1, 9, 5, 1, 7, 9, 1, 3, 7,
].reverse();
