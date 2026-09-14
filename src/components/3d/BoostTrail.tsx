import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { controls } from "@/hooks/useGameControls";
import type { PlayerState } from "./Player";

/** Pooled world-space exhaust: it stays behind as the jeep moves away. */
export function BoostTrail({
  state,
  paused,
  reduceMotion,
}: {
  state: PlayerState;
  paused: boolean;
  reduceMotion: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const pool = useMemo(
    () => ({
      cursor: 0,
      elapsed: 0,
      particles: Array.from({ length: 80 }, () => ({ life: 0, x: 0, y: 0, z: 0, yaw: 0 })),
      dummy: new THREE.Object3D(),
      color: new THREE.Color(),
    }),
    [],
  );
  useFrame((_, delta) => {
    if (!mesh.current) return;
    const dt = Math.min(delta, 0.05);
    const active =
      !paused &&
      !reduceMotion &&
      controls.boost &&
      controls.forward > 0 &&
      Math.abs(state.speed) > 1;
    pool.elapsed += dt;
    if (active && pool.elapsed >= 0.025) {
      pool.elapsed = 0;
      for (const side of [-1, 1]) {
        const p = pool.particles[pool.cursor++ % pool.particles.length]!;
        const sin = Math.sin(state.heading),
          cos = Math.cos(state.heading);
        Object.assign(p, {
          life: 1,
          yaw: state.heading,
          x: state.position.x - sin * 2.15 + cos * side * 0.57,
          y: state.position.y + 0.05,
          z: state.position.z - cos * 2.15 - sin * side * 0.57,
        });
      }
    }
    pool.particles.forEach((p, i) => {
      p.life = reduceMotion || paused ? 0 : Math.max(0, p.life - dt * 1.8);
      p.x -= Math.sin(p.yaw) * dt * 2;
      p.z -= Math.cos(p.yaw) * dt * 2;
      pool.dummy.position.set(p.x, p.y, p.z);
      pool.dummy.rotation.set(0, p.yaw, 0);
      pool.dummy.scale.set(0.19 * p.life, 0.12 * p.life, 0.65 * p.life);
      pool.dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, pool.dummy.matrix);
      pool.color.setRGB(0.08 * p.life, 0.65 * p.life, p.life);
      mesh.current!.setColorAt(i, pool.color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 80]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
