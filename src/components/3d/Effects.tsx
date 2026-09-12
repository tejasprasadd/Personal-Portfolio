import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SKID_MAX = 260;
const DUST_MAX = 220;
const DEBRIS_MAX = 90;

export type SkidHandle = {
  add: (x: number, y: number, z: number, yaw: number, width: number) => void;
};
export type DustHandle = {
  add: (x: number, y: number, z: number, vx: number, vz: number, strength: number) => void;
};
export type DebrisHandle = {
  burst: (x: number, y: number, z: number, nx: number, nz: number, strength: number) => void;
};

/** Chips of dirt and sparks thrown out when the jeep slams something. */
export function Debris({ handle }: { handle: React.MutableRefObject<DebrisHandle | null> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const state = useMemo(
    () => ({
      cursor: 0,
      life: new Float32Array(DEBRIS_MAX),
      pos: new Float32Array(DEBRIS_MAX * 3),
      vel: new Float32Array(DEBRIS_MAX * 3),
      spin: new Float32Array(DEBRIS_MAX),
      size: new Float32Array(DEBRIS_MAX),
      dummy: new THREE.Object3D(),
    }),
    [],
  );

  handle.current = {
    burst: (x, y, z, nx, nz, strength) => {
      const n = 6 + Math.round(strength * 8);
      for (let k = 0; k < n; k++) {
        const i = state.cursor;
        state.cursor = (state.cursor + 1) % DEBRIS_MAX;
        const o = i * 3;
        state.pos[o] = x;
        state.pos[o + 1] = y + 0.3 + Math.random() * 0.4;
        state.pos[o + 2] = z;
        state.vel[o] = nx * (1.5 + strength * 4) + (Math.random() - 0.5) * 3.4;
        state.vel[o + 1] = 2 + Math.random() * 3.5 * (0.5 + strength);
        state.vel[o + 2] = nz * (1.5 + strength * 4) + (Math.random() - 0.5) * 3.4;
        state.spin[i] = (Math.random() - 0.5) * 14;
        state.size[i] = 0.06 + Math.random() * 0.1;
        state.life[i] = 1;
      }
    },
  };

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < DEBRIS_MAX; i++) {
      const l = state.life[i] ?? 0;
      const d = state.dummy;
      if (l <= 0) {
        d.position.set(0, -9999, 0);
        d.scale.setScalar(0.0001);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
        continue;
      }
      state.life[i] = Math.max(0, l - dt * 1.2);
      const o = i * 3;
      state.vel[o + 1] = (state.vel[o + 1] ?? 0) - 16 * dt;
      state.pos[o] = (state.pos[o] ?? 0) + (state.vel[o] ?? 0) * dt;
      state.pos[o + 1] = (state.pos[o + 1] ?? 0) + (state.vel[o + 1] ?? 0) * dt;
      state.pos[o + 2] = (state.pos[o + 2] ?? 0) + (state.vel[o + 2] ?? 0) * dt;
      d.position.set(state.pos[o] ?? 0, state.pos[o + 1] ?? 0, state.pos[o + 2] ?? 0);
      d.rotation.set(l * (state.spin[i] ?? 0), l * 3, l * (state.spin[i] ?? 0) * 0.5);
      d.scale.setScalar((state.size[i] ?? 0.08) * Math.min(1, l * 2));
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, DEBRIS_MAX]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8A6A45" roughness={1} />
    </instancedMesh>
  );
}


/** Fading tyre marks stamped onto the ground as an instanced quad pool. */
export function SkidMarks({ handle }: { handle: React.MutableRefObject<SkidHandle | null> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const state = useMemo(
    () => ({
      cursor: 0,
      life: new Float32Array(SKID_MAX),
      data: new Float32Array(SKID_MAX * 5),
      dummy: new THREE.Object3D(),
    }),
    [],
  );

  handle.current = {
    add: (x, y, z, yaw, width) => {
      const i = state.cursor;
      state.cursor = (state.cursor + 1) % SKID_MAX;
      state.life[i] = 1;
      state.data.set([x, y, z, yaw, width], i * 5);
    },
  };

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < SKID_MAX; i++) {
      const l = (state.life[i] ?? 0) - dt * 0.055;
      state.life[i] = Math.max(0, l);
      const o = i * 5;
      const s = Math.max(0, l);
      state.dummy.position.set(state.data[o] ?? 0, (state.data[o + 1] ?? 0) + 0.05, state.data[o + 2] ?? 0);
      state.dummy.rotation.set(-Math.PI / 2, 0, -(state.data[o + 3] ?? 0));
      state.dummy.scale.set((state.data[o + 4] ?? 0.3) * Math.min(1, s * 1.6), 1.05, 1);
      state.dummy.updateMatrix();
      m.setMatrixAt(i, state.dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SKID_MAX]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#2A2018" transparent opacity={0.45} depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
    </instancedMesh>
  );
}

/** Dust puffs kicked up by the wheels. */
export function Dust({ handle }: { handle: React.MutableRefObject<DustHandle | null> }) {
  const points = useRef<THREE.Points>(null);
  const state = useMemo(() => {
    const positions = new Float32Array(DUST_MAX * 3).fill(-9999);
    const vel = new Float32Array(DUST_MAX * 3);
    return { cursor: 0, positions, vel, life: new Float32Array(DUST_MAX) };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(state.positions, 3));
    return g;
  }, [state]);

  handle.current = {
    add: (x, y, z, vx, vz, strength) => {
      const i = state.cursor;
      state.cursor = (state.cursor + 1) % DUST_MAX;
      const o = i * 3;
      state.positions[o] = x + (Math.random() - 0.5) * 0.4;
      state.positions[o + 1] = y + 0.1;
      state.positions[o + 2] = z + (Math.random() - 0.5) * 0.4;
      state.vel[o] = vx * 0.25 + (Math.random() - 0.5) * 1.2;
      state.vel[o + 1] = 0.8 + Math.random() * 1.4 * strength;
      state.vel[o + 2] = vz * 0.25 + (Math.random() - 0.5) * 1.2;
      state.life[i] = 1;
    },
  };

  useFrame((_, dt) => {
    for (let i = 0; i < DUST_MAX; i++) {
      const l = state.life[i] ?? 0;
      if (l <= 0) continue;
      const n = l - dt * 0.9;
      state.life[i] = n;
      const o = i * 3;
      if (n <= 0) {
        state.positions[o + 1] = -9999;
        continue;
      }
      const vx = state.vel[o] ?? 0;
      const vy = state.vel[o + 1] ?? 0;
      const vz = state.vel[o + 2] ?? 0;
      state.positions[o] = (state.positions[o] ?? 0) + vx * dt;
      state.positions[o + 1] = (state.positions[o + 1] ?? 0) + vy * dt;
      state.positions[o + 2] = (state.positions[o + 2] ?? 0) + vz * dt;
      state.vel[o] = vx * 0.96;
      state.vel[o + 1] = vy * 0.94;
      state.vel[o + 2] = vz * 0.96;
    }
    const attr = geometry.attributes['position'] as THREE.BufferAttribute;
    attr.needsUpdate = true;
    if (points.current) points.current.frustumCulled = false;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.85}
        color="#C8AD84"
        transparent
        opacity={0.42}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
