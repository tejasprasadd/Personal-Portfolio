import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Detailed } from "@react-three/drei";
import { CylinderCollider, RigidBody, TrimeshCollider } from "@react-three/rapier";
import * as THREE from "three";
import { WORLD_SIZE, heightAt, rand, slopeAt, trailInfo } from "./terrain";
import { CLEARING_ROCKS, SCATTER_COUNT, buildScatter, solidBlockers } from "./scatter";
import { QUALITY_PRESETS } from "./quality";
import type { Quality } from "@/hooks/useSettings";



const GRASS = new THREE.Color("#4E7A3A");
const GRASS_DARK = new THREE.Color("#3B5F2E");
const DIRT = new THREE.Color("#8A5A32");
const SAND = new THREE.Color("#C2A46A");
const ROCK = new THREE.Color("#8C8378");

/** Hilly valley floor with a carved river gorge (vertex-coloured). */
export function Terrain({ quality }: { quality: Quality }) {
  const segments = QUALITY_PRESETS[quality].terrainSegments;

  const build = (segs: number, colored: boolean) => {
    const g = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segs, segs);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes['position'] as THREE.BufferAttribute;
    const colors = colored ? new Float32Array(pos.count * 3) : null;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);
      if (!colors) continue;

      // slope-aware shading gives ridges rock and flats grass/dirt
      const s2 = slopeAt(x, z, 1.5);
      const steep = Math.min(1, Math.hypot(s2.dx, s2.dz) * 0.9);
      const trail = trailInfo(x, z).surface;
      if (Math.hypot(x, z) < 20) c.copy(DIRT).lerp(GRASS, 0.3);
      else c.copy(GRASS).lerp(GRASS_DARK, rand(i, 3) * 0.45);
      c.lerp(DIRT, trail * 0.5);
      c.lerp(ROCK, steep * 0.6);
      c.lerp(SAND, Math.max(0, h) * 0.02);
      c.offsetHSL(0, 0, (rand(i, 7) - 0.5) * 0.035);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    if (colors) g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  };

  const geometry = useMemo(() => build(segments, true), [segments]);
  // Physics uses a coarser mesh: same shape, far cheaper and more stable.
  const collision = useMemo(() => {
    const g = build(80, false).toNonIndexed();
    const verts = new Float32Array((g.attributes['position'] as THREE.BufferAttribute).array);
    const idx = new Uint32Array(verts.length / 3);
    for (let i = 0; i < idx.length; i++) idx[i] = i;
    return { verts, idx };
  }, []);

  return (
    <group>
      <RigidBody type="fixed" colliders={false} friction={1.1}>
        <TrimeshCollider args={[collision.verts, collision.idx]} friction={1.1} />
      </RigidBody>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.95} metalness={0} dithering />
      </mesh>
    </group>
  );
}


/** Sunlit dust motes drifting over the valley. */
export function Particles({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 34;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.015;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.1}
        color="#F5D9A8"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ---------- shared geometry / material pools ----------
   One instance each, reused by every prop: far fewer GPU uploads and
   much lower memory on phones. */
const G = {
  trunkHi: new THREE.CylinderGeometry(0.26, 0.4, 2.8, 7),
  trunkLo: new THREE.CylinderGeometry(0.3, 0.38, 2.8, 4),
  canopyHi: new THREE.ConeGeometry(1.7, 3.2, 8),
  canopyMid: new THREE.ConeGeometry(1.7, 3.2, 5),
  capHi: new THREE.ConeGeometry(1.2, 2.2, 8),
  treeFar: new THREE.ConeGeometry(1.8, 5.4, 4),
  rockHi: new THREE.IcosahedronGeometry(1, 0),
  rockLo: new THREE.TetrahedronGeometry(1.1, 0),
};

const M = {
  bark: new THREE.MeshStandardMaterial({ color: "#5B3A21", roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: "#2F6B3A", roughness: 0.95 }),
  leafLight: new THREE.MeshStandardMaterial({ color: "#3B7F45", roughness: 0.95 }),
  leafFlat: new THREE.MeshLambertMaterial({ color: "#33723D" }),
  rock: new THREE.MeshStandardMaterial({ color: "#8C8378", roughness: 1, flatShading: true }),
  rockFlat: new THREE.MeshLambertMaterial({ color: "#8C8378", flatShading: true }),
};

/** Tree with three detail tiers swapped automatically by camera distance. */
function Tree({
  position,
  scale = 1,
  lod,
}: {
  position: [number, number, number];
  scale?: number;
  lod: [number, number, number];
}) {
  return (
    <group position={position} scale={scale}>
      <Detailed distances={lod}>
        {/* near: full detail + shadows */}
        <group>
          <mesh castShadow position={[0, 1.4, 0]} geometry={G.trunkHi} material={M.bark} />
          <mesh castShadow position={[0, 3.4, 0]} geometry={G.canopyHi} material={M.leaf} />
          <mesh castShadow position={[0, 4.8, 0]} geometry={G.capHi} material={M.leafLight} />
        </group>
        {/* mid: fewer segments, no cap, no shadow casting */}
        <group>
          <mesh position={[0, 1.4, 0]} geometry={G.trunkLo} material={M.bark} />
          <mesh position={[0, 3.6, 0]} geometry={G.canopyMid} material={M.leaf} />
        </group>
        {/* far: single cheap cone, unlit-ish material */}
        <mesh position={[0, 3.2, 0]} geometry={G.treeFar} material={M.leafFlat} />
      </Detailed>
    </group>
  );
}

/** Boulder with a near/far detail swap. */
function Boulder({
  position,
  rotation,
  scale,
  lod,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  lod: [number, number];
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Detailed distances={lod}>
        <mesh castShadow geometry={G.rockHi} material={M.rock} />
        <mesh geometry={G.rockLo} material={M.rockFlat} />
      </Detailed>
    </group>
  );
}

/** Forest, boulders and shrubs scattered over the hills (visual only). */
export function Scenery({ quality }: { quality: Quality }) {
  const preset = QUALITY_PRESETS[quality];
  const items = useMemo(() => {
    const all = buildScatter(SCATTER_COUNT);
    if (preset.scatterKeep >= 1) return all;
    // Drop only far-away decoration; nearby items stay so visuals match collisions.
    return all.filter((it) => {
      const r = Math.hypot(it.pos[0], it.pos[2]);
      if (r < 30) return true;
      if (r > preset.drawDistance) return false;
      return rand(it.key, 11) < preset.scatterKeep;
    });
  }, [preset]);

  return (
    <group>
      {items.map((it) =>
        it.rock ? (
          <Boulder
            key={it.key}
            position={[it.pos[0], it.pos[1] + 0.5, it.pos[2]]}
            rotation={[rand(it.key, 8), rand(it.key, 9) * 6, 0]}
            scale={it.scale * 1.2}
            lod={preset.rockLod}
          />
        ) : (
          <Tree key={it.key} position={it.pos} scale={it.scale} lod={preset.treeLod} />
        ),
      )}
    </group>
  );
}


const TRAIL_LOGS = [-2.42, -0.55, 1.42];
const TRAIL_ROCKS = [-1.8, 0.35, 2.28];

function trailPoint(angle: number, lateral = 0): [number, number, number] {
  const probe = trailInfo(Math.cos(angle) * 28, Math.sin(angle) * 28);
  const radius = probe.centerRadius + lateral;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return [x, heightAt(x, z), z];
}

/** Low logs and embedded rocks form deliberate, driveable trail obstacles. */
export function Obstacles() {
  return (
    <group>
      {TRAIL_LOGS.map((angle, i) => {
        const [x, y, z] = trailPoint(angle);
        return (
          <RigidBody
            key={`log-${i}`}
            type="fixed"
            colliders={false}
            position={[x, y + 0.28, z]}
            rotation={[0, -angle, Math.PI / 2]}
          >
            <CylinderCollider args={[2.15, 0.24]} friction={1.2} restitution={0.05} />
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.24, 0.3, 4.3, 9]} />
              <meshStandardMaterial color="#5B3A21" roughness={1} />
            </mesh>
          </RigidBody>
        );
      })}
      {TRAIL_ROCKS.map((angle, i) => {
        const [x, y, z] = trailPoint(angle, i === 1 ? -0.8 : 0.7);
        return (
        <RigidBody
          key={`rock-${i}`}
          type="fixed"
          colliders="ball"
          position={[x, y + 0.45, z]}
        >
          <mesh castShadow receiveShadow scale={[1.1, 0.72, 0.9]} rotation={[0.2, angle, 0.1]}>
            <icosahedronGeometry args={[0.72, 0]} />
            <meshStandardMaterial color="#8C8378" roughness={1} flatShading />
          </mesh>
        </RigidBody>
        );
      })}
    </group>
  );
}


/** Crates, barrels and tyres the jeep can smash around. */
export function Props({ resetKey }: { resetKey: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2 + 0.4;
        const r = 5 + ((i * 3.7) % 12);
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        return {
          key: i,
          pos: [x, heightAt(x, z) + 1.2 + (i % 3), z] as [number, number, number],
          kind: i % 3,
        };
      }),
    [],
  );

  return (
    <group key={resetKey}>
      {items.map((p) =>
        p.kind === 0 ? (
          <RigidBody
            key={p.key}
            position={p.pos}
            colliders="cuboid"
            restitution={0.25}
            friction={0.9}
            mass={0.5}
          >
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.9, 0.9]} />
              <meshStandardMaterial color="#A97B4B" roughness={0.95} />
            </mesh>
          </RigidBody>
        ) : p.kind === 1 ? (
          <RigidBody
            key={p.key}
            position={p.pos}
            colliders="hull"
            restitution={0.3}
            friction={0.7}
            mass={0.45}
          >
            <mesh castShadow>
              <cylinderGeometry args={[0.42, 0.42, 1.05, 14]} />
              <meshStandardMaterial color="#C2410C" roughness={0.7} metalness={0.25} />
            </mesh>
          </RigidBody>
        ) : (
          <RigidBody
            key={p.key}
            position={p.pos}
            colliders="hull"
            restitution={0.5}
            friction={1}
            mass={0.35}
          >
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.45, 0.18, 8, 16]} />
              <meshStandardMaterial color="#27272A" roughness={0.95} />
            </mesh>
          </RigidBody>
        ),
      )}
    </group>
  );
}

/** Invisible cylinder colliders for every solid tree/boulder so the jeep's
 *  dynamic chassis actually bumps into the scenery. */
export function SceneryColliders() {
  const blockers = useMemo(() => solidBlockers(buildScatter(SCATTER_COUNT)), []);
  return (
    <group>
      {blockers.map(([x, z, r], i) => (
        <RigidBody
          key={`blk-${i}`}
          type="fixed"
          colliders={false}
          position={[x, heightAt(x, z) + 1.6, z]}
        >
          <CylinderCollider args={[1.8, Math.max(0.5, r)]} friction={0.4} restitution={0.1} />
        </RigidBody>
      ))}
    </group>
  );
}
