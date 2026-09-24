import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ZONES, type ZoneId } from "./zones";
import { heightAt } from "./terrain";

function Beacon({
  color,
  position,
  active,
  reduceMotion,
}: {
  color: string;
  position: [number, number, number];
  active: boolean;
  reduceMotion: boolean;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const marker = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ring.current) {
      const k = reduceMotion ? 1 : 1 + Math.sin(t * 2 + position[0]) * 0.12;
      ring.current.scale.setScalar((active ? 1.35 : 1) * k);
    }
    if (marker.current) {
      marker.current.position.y = 8 + (reduceMotion ? 0 : Math.sin(t * 1.6 + position[2]) * 0.35);
      marker.current.rotation.y = t * 0.9;
    }
  });

  return (
    <group position={position}>
      {/* ground ring */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[3.2, 3.9, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.85 : 0.42}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* light column */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.2, 0.38, 8, 8, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.5 : 0.22}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* floating waypoint diamond, visible over the hills */}
      <mesh ref={marker} position={[0, 8, 0]}>
        <octahedronGeometry args={[0.95, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

/** Waypoint beacons marking every zone so they're findable across the terrain. */
export function Waypoints({
  activeZone,
  missionTarget,
  reduceMotion,
}: {
  activeZone: ZoneId | null;
  missionTarget: ZoneId | null;
  reduceMotion: boolean;
}) {
  const target = ZONES.find((zone) => zone.id === missionTarget);
  if (!target) return null;
  return (
    <group>
      <Beacon
        color={target.color}
        active={activeZone === target.id || missionTarget === target.id}
        reduceMotion={reduceMotion}
        position={[
          target.position[0],
          heightAt(target.position[0], target.position[2]),
          target.position[2],
        ]}
      />
    </group>
  );
}
