// Original expedition jeep. Metres, +Z forward, named independent wheel pivots.
// Rebuild the committed asset with: node scripts/build-jeep.mjs
import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { mkdir, writeFile } from "node:fs/promises";
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((value) => {
      this.result = value;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((value) => {
      this.result = `data:${blob.type};base64,${Buffer.from(value).toString("base64")}`;
      this.onloadend?.();
    });
  }
};
const root = new T.Group();
root.name = "ExpeditionJeep";
const body = new T.Group();
body.name = "Body";
root.add(body);
const mat = (name, color, roughness, metalness = 0) => {
  const m = new T.MeshStandardMaterial({ color, roughness, metalness });
  m.name = name;
  return m;
};
const paint = mat("Paint", "#647467", 0.33, 0.48),
  rubber = mat("Rubber", "#191b1b", 0.91),
  trim = mat("Trim", "#242a2b", 0.62, 0.15);
const metal = mat("Steel", "#828d8b", 0.27, 0.85),
  glass = mat("Glass", "#21383d", 0.08, 0.58),
  lens = mat("Headlights", "#fff1ce", 0.16),
  tail = mat("BrakeLights", "#9c2520", 0.28),
  amber = mat("Indicators", "#c78b36", 0.25);
lens.emissive.set("#ffdda2");
lens.emissiveIntensity = 0.3;
tail.emissive.set("#ff3523");
tail.emissiveIntensity = 0.3;
function part(parent, geometry, material, p = [0, 0, 0], r = [0, 0, 0]) {
  const m = new T.Mesh(geometry, material);
  m.position.set(...p);
  m.rotation.set(...r);
  parent.add(m);
  return m;
}
const box = (parent, size, p, material = paint, r = [0, 0, 0], radius = 0.025) =>
  part(
    parent,
    radius < 0.015 ? new T.BoxGeometry(...size) : new RoundedBoxGeometry(...size, 1, radius),
    material,
    p,
    r,
  );
const cyl = (
  parent,
  radius,
  length,
  p,
  material = metal,
  rotation = [0, 0, Math.PI / 2],
  segments = 32,
) => part(parent, new T.CylinderGeometry(radius, radius, length, segments), material, p, rotation);
function rod(parent, a, b, r = 0.018, material = trim) {
  const start = new T.Vector3(...a),
    end = new T.Vector3(...b),
    d = end.clone().sub(start);
  const m = part(
    parent,
    new T.CylinderGeometry(r, r, d.length(), 8),
    material,
    start.add(end).multiplyScalar(0.5).toArray(),
  );
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
}
box(body, [1.48, 0.16, 3.95], [0, -0.02, 0], trim);
for (const x of [-0.55, 0.55]) box(body, [0.12, 0.16, 3.95], [x, -0.15, 0], trim);
for (const side of [-1, 1]) {
  // Cut actual wheel openings into the body sides.
  const shape = new T.Shape();
  shape.moveTo(-2.1, 0.05);
  shape.lineTo(-2.1, 0.63);
  shape.lineTo(2.1, 0.63);
  shape.lineTo(2.1, 0.05);
  for (const z of [1.48, -1.48]) {
    shape.lineTo(z + 0.55, 0.05);
    shape.absarc(z, 0.05, 0.55, 0, Math.PI, false);
  }
  shape.lineTo(-2.1, 0.05);
  part(
    body,
    new T.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      curveSegments: 18,
    }),
    paint,
    [side * 0.87, 0, 0],
    [0, Math.PI / 2, 0],
  );
  box(body, [0.1, 0.13, 1.76], [side * 0.99, -0.08, 0], trim);
  for (const z of [-0.95, 0.04, 0.9])
    box(body, [0.013, 0.51, 0.012], [side * 0.968, 0.34, z], trim, undefined, 0.003);
  for (const z of [-0.65, 0.48]) {
    box(body, [0.055, 0.045, 0.15], [side * 0.995, 0.48, z], trim);
    for (const y of [0.16, 0.42]) box(body, [0.04, 0.06, 0.09], [side * 0.99, y, z + 0.35], metal);
  }
  rod(body, [side * 0.92, 0.87, 0.91], [side * 1.09, 0.85, 1], 0.024);
  box(body, [0.17, 0.18, 0.25], [side * 1.12, 0.88, 1], trim);
  box(body, [0.012, 0.14, 0.19], [side * 1.214, 0.88, 1], metal);
  for (const z of [-1.48, 1.48]) {
    const points = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      points.push(new T.Vector3(side * 1.025, 0.03 + Math.sin(a) * 0.575, z + Math.cos(a) * 0.575));
    }
    part(body, new T.TubeGeometry(new T.CatmullRomCurve3(points), 24, 0.075, 8, false), trim);
  }
}
box(body, [1.77, 0.16, 1.34], [0, 0.67, 1.31], paint, [-0.035, 0, 0], 0.055);
box(body, [1.73, 0.11, 2.42], [0, 1.44, -0.55], trim, undefined, 0.05);
box(body, [1.74, 0.1, 2.37], [0, 0.65, -0.55], paint);
box(body, [1.71, 0.7, 0.1], [0, 1.04, -1.77], trim);
box(body, [1.52, 0.5, 0.03], [0, 1.08, -1.832], glass);
box(body, [1.6, 0.68, 0.038], [0, 1.075, 0.71], glass, [-0.16, 0, 0]);
for (const side of [-1, 1]) {
  box(body, [0.075, 0.77, 0.07], [side * 0.835, 1.07, 0.71], paint, [-0.16, 0, 0]);
  box(body, [0.035, 0.62, 2.26], [side * 0.864, 1.065, -0.56], glass);
  for (const z of [-1.72, -0.87, -0.01])
    box(body, [0.065, 0.7, 0.075], [side * 0.875, 1.07, z], trim);
  for (const z of [1, 1.65]) box(body, [0.055, 0.09, 0.09], [side * 0.9, 0.68, z], trim);
}
box(body, [1.74, 0.065, 0.06], [0, 1.425, 0.645], trim);
for (const x of [-0.4, 0.4]) rod(body, [x - 0.18, 0.76, 0.797], [x + 0.18, 0.9, 0.779], 0.011);
box(body, [1.79, 0.58, 0.11], [0, 0.38, 2.02], paint);
for (let i = -3; i <= 3; i++)
  box(body, [0.065, 0.36, 0.03], [i * 0.123, 0.39, 2.085], rubber, undefined, 0.026);
for (const x of [-0.66, 0.66]) {
  cyl(body, 0.188, 0.075, [x, 0.43, 2.095], trim, [Math.PI / 2, 0, 0]);
  cyl(body, 0.149, 0.082, [x, 0.43, 2.12], lens, [Math.PI / 2, 0, 0]);
  box(body, [0.14, 0.065, 0.04], [x, 0.16, 2.1], amber);
}
box(body, [2.08, 0.22, 0.28], [0, 0.025, 2.14], trim, undefined, 0.045);
box(body, [0.48, 0.17, 0.24], [0, 0.18, 2.18], metal);
cyl(body, 0.067, 0.4, [0, 0.205, 2.235], trim);
for (const x of [-0.65, 0.65])
  part(body, new T.TorusGeometry(0.07, 0.016, 8, 16), metal, [x, -0.005, 2.295]);
box(body, [1.97, 0.19, 0.24], [0, 0, -2.12], trim);
box(body, [1.75, 0.59, 0.12], [0, 0.37, -2.015], paint);
for (const x of [-0.72, 0.72]) box(body, [0.2, 0.23, 0.075], [x, 0.4, -2.1], tail);
box(body, [0.32, 0.1, 0.027], [-0.5, 0.14, -2.108], metal);
for (const x of [-0.71, 0.71]) {
  for (const z of [-1.5, 0.45]) rod(body, [x, 1.48, z], [x, 1.59, z]);
  rod(body, [x, 1.59, -1.62], [x, 1.59, 0.56]);
}
for (const z of [-1.62, -1.1, -0.55, 0, 0.56]) rod(body, [-0.71, 1.59, z], [0.71, 1.59, z]);
rod(body, [0.94, 0.65, 0.9], [0.94, 1.49, 0.67], 0.047);
box(body, [0.16, 0.12, 0.21], [0.94, 1.53, 0.64], trim);
function wheel(name, side = 1) {
  const g = new T.Group();
  g.name = name;
  cyl(g, 0.455, 0.3, [0, 0, 0], rubber);
  for (const x of [-0.13, 0.13])
    part(g, new T.TorusGeometry(0.375, 0.08, 10, 36), rubber, [x, 0, 0], [0, Math.PI / 2, 0]);
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 32; i++) {
      const a = ((i + (row % 2) * 0.5) / 32) * Math.PI * 2;
      box(
        g,
        [0.09, 0.035, 0.075],
        [(row - 1) * 0.103, Math.cos(a) * 0.467, Math.sin(a) * 0.467],
        rubber,
        [a, 0, (row - 1) * 0.15],
        0.007,
      );
    }
  cyl(g, 0.276, 0.318, [0, 0, 0], trim);
  const x = side * 0.172;
  part(g, new T.TorusGeometry(0.261, 0.02, 8, 32), metal, [x, 0, 0], [0, Math.PI / 2, 0]);
  cyl(g, 0.089, 0.065, [x, 0, 0], metal);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    box(
      g,
      [0.036, 0.16, 0.045],
      [x, Math.cos(a) * 0.16, Math.sin(a) * 0.16],
      metal,
      [a, 0, 0],
      0.01,
    );
    cyl(
      g,
      0.018,
      0.04,
      [x + side * 0.025, Math.cos(a) * 0.065, Math.sin(a) * 0.065],
      trim,
      undefined,
      8,
    );
  }
  return g;
}
for (const [name, x, z] of [
  ["WheelFL", -0.99, 1.48],
  ["WheelFR", 0.99, 1.48],
  ["WheelRL", -0.99, -1.48],
  ["WheelRR", 0.99, -1.48],
]) {
  const w = wheel(name, Math.sign(x));
  w.position.set(x, 0, z);
  root.add(w);
}
const spare = wheel("Spare");
spare.rotation.y = Math.PI / 2;
spare.position.set(0, 0.56, -2.23);
body.add(spare);
// Bake static meshes and batch by material, preserving five independently animated parts.
for (const group of [...root.children]) {
  group.updateMatrixWorld(true);
  const inverse = group.matrixWorld.clone().invert(),
    buckets = new Map();
  group.traverse((obj) => {
    if (!obj.isMesh) return;
    const geo = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
    geo.applyMatrix4(inverse.clone().multiply(obj.matrixWorld));
    const b = buckets.get(obj.material) ?? [];
    b.push(geo);
    buckets.set(obj.material, b);
  });
  group.clear();
  for (const [material, geometries] of buckets) {
    const mesh = new T.Mesh(mergeVertices(mergeGeometries(geometries)), material);
    mesh.name = material.name;
    group.add(mesh);
  }
}
const output = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true });
await mkdir(new URL("../public/models/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../public/models/expedition-jeep.glb", import.meta.url),
  Buffer.from(output),
);
console.log(`Exported expedition-jeep.glb (${Math.round(output.byteLength / 1024)} KB)`);
