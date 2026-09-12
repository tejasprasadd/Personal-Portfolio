import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { ZONES, type ZoneId, type Zone } from "./zones";
import type { Quality } from "@/hooks/useSettings";

function Box({
  position = [0, 0, 0],
  size,
  color,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  size: [number, number, number];
  color: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
function Ring({
  inner,
  outer,
  color,
  y = 0.015,
}: {
  inner: number;
  outer: number;
  color: string;
  y?: number;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <ringGeometry args={[inner, outer, 96]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}
const TREES = Array.from({ length: 36 }, (_, i) => {
  const a = i * 2.39996,
    r = 36 + Math.sin(i * 8.7) * 6;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 1 + (Math.sin(i * 42) + 1) * 0.45 };
}).filter((t) => ZONES.every((z) => Math.hypot(t.x - z.position[0], t.z - z.position[2]) > 5));
function Trees({ quality }: { quality: Quality }) {
  const trunks = useRef<THREE.InstancedMesh>(null),
    leaves = useRef<THREE.InstancedMesh>(null);
  const matrix = useMemo(() => new THREE.Object3D(), []);
  // Static instancing preserves every collidable silhouette at every quality tier.

  const setInstances = (mesh: THREE.InstancedMesh | null, crown: boolean) => {
    if (!mesh) return;
    TREES.forEach((t, i) => {
      matrix.position.set(t.x, crown ? 3 * t.s : 1.2 * t.s, t.z);
      matrix.scale.set(
        crown ? 2 * t.s : 0.28 * t.s,
        crown ? 2.5 * t.s : 2.4 * t.s,
        crown ? 2 * t.s : 0.28 * t.s,
      );
      matrix.rotation.y = i;
      matrix.updateMatrix();
      mesh.setMatrixAt(i, matrix.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };
  return (
    <>
      <instancedMesh
        ref={(m) => {
          trunks.current = m;
          setInstances(m, false);
        }}
        args={[undefined, undefined, TREES.length]}
        castShadow
      >
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#997854" />
      </instancedMesh>
      <instancedMesh
        ref={(m) => {
          leaves.current = m;
          setInstances(m, true);
        }}
        args={[undefined, undefined, TREES.length]}
        castShadow
      >
        <icosahedronGeometry args={[1, quality === "high" ? 1 : 0]} />
        <meshStandardMaterial color="#769f78" flatShading />
      </instancedMesh>
      {TREES.map((t, i) => (
        <RigidBody key={i} type="fixed" colliders={false} position={[t.x, 1, t.z]}>
          <CylinderCollider args={[1, 0.35]} />
        </RigidBody>
      ))}
    </>
  );
}
function Landmark({
  zone,
  active,
  onSelect,
  reduceMotion,
}: {
  zone: Zone;
  active: boolean;
  onSelect: (id: ZoneId) => void;
  reduceMotion: boolean;
}) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (spin.current && !reduceMotion) spin.current.rotation.y += dt * 0.25;
  });
  const major = ["about", "queans", "rag", "motion", "edulens"].includes(zone.id);
  return (
    <group position={zone.position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2.4, 1.2, 2]} />
        <Box position={[0, 0.25, 0]} size={[5, 0.5, 4.5]} color="#f1e6c8" />
        <Box position={[0, 1.3, 0]} size={[4.2, 1.8, 3.6]} color={zone.color} />
        <Box position={[0, 2.3, 0]} size={[4.7, 0.25, 4.1]} color="#f7ebd1" />
        <Box position={[0, 1.45, 1.83]} size={[2.7, 1, 0.06]} color="#2c5250" />
        {[-1, 0, 1].map((x) => (
          <Box key={x} position={[x, 1.5, 1.88]} size={[0.06, 0.9, 0.08]} color="#e8dbc0" />
        ))}
      </RigidBody>
      <group ref={spin} position={[0, 4, 0]}>
        {zone.id === "about" || zone.id === "rag" ? (
          <>
            <mesh castShadow>
              <icosahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial
                color={zone.id === "about" ? "#e7914f" : "#91afb8"}
                roughness={0.25}
                metalness={0.35}
              />
            </mesh>
            <mesh rotation={[0.4, 0, 0.3]}>
              <torusGeometry args={[1.9, 0.065, 5, 40]} />
              <meshStandardMaterial color="#f4edce" />
            </mesh>
          </>
        ) : zone.id === "queans" ? (
          <>
            <Box size={[1.7, 2, 0.4]} color="#fff1c9" />
            <Box position={[0.35, 0.15, 0.36]} size={[1.7, 2, 0.3]} color="#e5d6b4" />
            {[-0.4, 0, 0.4].map((y) => (
              <Box key={y} position={[0.35, y, 0.53]} size={[1, 0.07, 0.05]} color="#527d70" />
            ))}
          </>
        ) : zone.id === "edulens" ? (
          <>
            {[1, 1.6, 2.3].map((h, i) => (
              <Box
                key={h}
                position={[(i - 1) * 0.75, h / 2 - 1, 0]}
                size={[0.55, h, 0.65]}
                color={["#6b9984", "#ebc167", "#d97a55"][i]!}
              />
            ))}
          </>
        ) : (
          <mesh castShadow>
            <octahedronGeometry args={[1.3, 0]} />
            <meshStandardMaterial color="#f8e7b6" metalness={0.2} roughness={0.6} />
          </mesh>
        )}
      </group>
      {(major || active) && (
        <Html center position={[0, 6.3, 0]} zIndexRange={[12, 0]}>
          <button
            className={`world-label ${active ? "is-near" : ""}`}
            onClick={() => onSelect(zone.id)}
          >
            <span style={{ background: zone.color }} />
            {zone.sub === "Project" ? zone.label : zone.sub}
            <b>↗</b>
          </button>
        </Html>
      )}
    </group>
  );
}
function PlayObjects({ resetKey }: { resetKey: number }) {
  return (
    <group key={resetKey}>
      {Array.from({ length: 9 }, (_, i) => (
        <RigidBody
          key={i}
          colliders="cuboid"
          position={[12 + (i % 3) * 1.8, 1 + Math.floor(i / 3) * 1.55, 5]}
          mass={18}
          friction={0.75}
          restitution={0.12}
          ccd
        >
          <Box size={[1.5, 1.5, 1.5]} color={i % 2 ? "#e3ac5a" : "#ecbd76"} />
          <Box position={[0, 0, 0.76]} size={[1.5, 0.15, 0.03]} color="#b0804c" />
        </RigidBody>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <RigidBody
          key={`ball${i}`}
          position={[-12 + i * 1.5, 1.5, 9]}
          colliders="ball"
          mass={8}
          restitution={0.65}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.65, 12, 8]} />
            <meshStandardMaterial color={i % 2 ? "#dd7957" : "#f1cb70"} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
export function Island({
  quality,
  activeZone,
  onSelect,
  resetKey,
  reduceMotion,
}: {
  quality: Quality;
  activeZone: ZoneId | null;
  onSelect: (id: ZoneId) => void;
  resetKey: number;
  reduceMotion: boolean;
}) {
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[1, 47]} position={[0, -1, 0]} friction={1} />
        <mesh position={[0, -1.3, 0]} receiveShadow>
          <cylinderGeometry args={[47, 46, 2.6, 96]} />
          <meshStandardMaterial color="#b6c7a5" roughness={1} />
        </mesh>
        <mesh position={[0, -3.3, 0]}>
          <cylinderGeometry args={[46, 43.5, 1.8, 96]} />
          <meshStandardMaterial color="#b8ad8d" roughness={1} />
        </mesh>
        <mesh position={[0, -4.6, 0]}>
          <cylinderGeometry args={[43.5, 42, 1, 96]} />
          <meshStandardMaterial color="#97aca1" roughness={1} />
        </mesh>
      </RigidBody>
      <Ring inner={19} outer={28} color="#e8ddbd" />
      <Ring inner={18.7} outer={19} color="#9aaa88" y={0.03} />
      <Ring inner={28} outer={28.3} color="#9aaa88" y={0.03} />
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return (
          <Box
            key={i}
            position={[Math.sin(a) * 23.5, 0.04, Math.cos(a) * 23.5]}
            size={[0.16, 0.025, 1.6]}
            rotation={[0, a, 0]}
            color="#faf0d3"
          />
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#a1b89c" />
      </mesh>
      <Trees quality={quality} />
      {ZONES.map((zone) => (
        <Landmark
          key={zone.id}
          zone={zone}
          active={activeZone === zone.id}
          onSelect={onSelect}
          reduceMotion={reduceMotion}
        />
      ))}
      <RigidBody type="fixed" colliders="cuboid" position={[8, 0.85, 15]} rotation={[-0.25, 0, 0]}>
        <Box size={[5, 0.5, 8]} color="#bb8c5e" />
        {[-1.5, 0, 1.5].map((x) => (
          <Box key={x} position={[x, 0.27, 0]} size={[0.13, 0.035, 8]} color="#f4d8a3" />
        ))}
      </RigidBody>
      <PlayObjects resetKey={resetKey} />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 5, 0, 21]}>
          <Box position={[0, 2, 0]} size={[0.2, 4, 0.2]} color="#687e6a" />
          <Box position={[side * 0.65, 3.5, 0]} size={[1.3, 0.8, 0.08]} color="#d46e49" />
        </group>
      ))}
    </>
  );
}
