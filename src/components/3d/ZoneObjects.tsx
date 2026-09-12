import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { SKILL_GROUPS } from "@/data/portfolio";
import type { Zone, ZoneId } from "./zones";
import { heightAt } from "./terrain";

const WOOD = "#7A5230";
const WOOD_DARK = "#5B3A21";
const CANVAS = "#D9C39B";
const METAL = "#5A5A62";

function Label({ zone, active }: { zone: Zone; active: boolean }) {
  return (
    <Html center distanceFactor={22} position={[0, 3.6, 0]} zIndexRange={[10, 0]}>
      <div
        className="pointer-events-none select-none whitespace-nowrap rounded-sm border px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-200"
        style={{
          borderColor: `${zone.color}${active ? "cc" : "55"}`,
          color: zone.color,
          background: "rgba(30,20,10,0.78)",
          boxShadow: active ? `0 0 22px -4px ${zone.color}` : "none",
          transform: `scale(${active ? 1.12 : 1})`,
        }}
      >
        {zone.label}
        <span className="block text-[8px] tracking-[0.25em] text-white/70">
          {active ? "PRESS E" : zone.sub}
        </span>
      </div>
    </Html>
  );
}

/** Signpost planks used across camp stations. */
function Signboard({ color, active }: { color: string; active: boolean }) {
  return (
    <group position={[0, 2.2, 0.9]} rotation={[-0.08, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.9, 0.9, 0.12]} />
        <meshStandardMaterial color={CANVAS} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.6, 0.5]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.9 : 0.55} />
      </mesh>
    </group>
  );
}

/** Camp bonfire at the centre of the trail. */
function Campfire({ color, active }: { color: string; active: boolean }) {
  const flame = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!flame.current) return;
    const t = state.clock.elapsedTime;
    flame.current.scale.set(
      1 + Math.sin(t * 7) * 0.08,
      1 + Math.sin(t * 9 + 1) * 0.16,
      1 + Math.cos(t * 8) * 0.08,
    );
    flame.current.rotation.y = t * 0.8;
  });
  return (
    <group>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.1, 0.25, Math.sin(a) * 2.1]} castShadow>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color="#8C8378" roughness={1} flatShading />
          </mesh>
        );
      })}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.5, 0]} rotation={[0.5, (i / 4) * Math.PI * 2, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.14, 2.2, 6]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
      <mesh ref={flame} position={[0, 1.4, 0]}>
        <coneGeometry args={[0.75, 1.9, 8]} />
        <meshStandardMaterial
          color="#FB923C"
          emissive={color}
          emissiveIntensity={active ? 2.6 : 1.8}
          transparent
          opacity={0.92}
        />
      </mesh>
      <pointLight color="#FFA24C" intensity={active ? 34 : 22} distance={16} position={[0, 1.6, 0]} />
    </group>
  );
}

/** Project station: stacked crates with a trail map board. */
function CrateStation({ color, active }: { color: string; active: boolean }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.9, 1, 1.4]} />
        <meshStandardMaterial color={WOOD} roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.2, 1.35, -0.1]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.8, 1.1]} />
        <meshStandardMaterial color="#A97B4B" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[-0.85, 1.3, 0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 2.6, 6]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      <mesh castShadow position={[0.85, 1.3, 0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 2.6, 6]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </mesh>
      <Signboard color={color} active={active} />
      <pointLight color={color} intensity={active ? 10 : 3} distance={8} position={[0, 2.4, 1.4]} />
    </group>
  );
}

/** Social zone: radio antenna mast with a spinning dish. */
function AntennaMast({ color, active }: { color: string; active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.6;
  });
  return (
    <group>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.32, 4.4, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.5} />
      </mesh>
      {[0.9, 2.1, 3.2].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.05, 6, 14]} />
          <meshStandardMaterial color="#7A7A82" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      <group ref={ref} position={[0, 4.5, 0]}>
        <mesh castShadow rotation={[0.7, 0, 0]}>
          <sphereGeometry args={[0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={CANVAS} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2 : 1} />
        </mesh>
      </group>
      <pointLight color={color} intensity={active ? 12 : 4} distance={10} position={[0, 4.4, 0]} />
    </group>
  );
}

/** Experience zone: expedition container / field workshop. */
function FieldContainer({ color, active }: { color: string; active: boolean }) {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[3.4, 2.4, 1.8]} />
        <meshStandardMaterial color="#4E6E52" roughness={0.85} metalness={0.15} />
      </mesh>
      {[-1, -0.4, 0.2, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.2, 0.91]}>
          <boxGeometry args={[0.12, 2.3, 0.04]} />
          <meshStandardMaterial color="#3F5A44" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.6, 0.18, 2]} />
        <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.5} />
      </mesh>
      <Signboard color={color} active={active} />
      <pointLight color={color} intensity={active ? 10 : 3} distance={9} position={[0, 2.6, 1.4]} />
    </group>
  );
}

/** Education zone: canvas expedition tent. */
function CampTent({ color, active }: { color: string; active: boolean }) {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.3, 2.6, 4]} />
        <meshStandardMaterial color={CANVAS} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.7, 1.2]}>
        <planeGeometry args={[1, 1.4]} />
        <meshStandardMaterial color="#4A3A24" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.9, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[0.45, 3.15, 0]}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 1.2 : 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight color={color} intensity={active ? 10 : 3} distance={9} position={[0, 2, 1.4]} />
    </group>
  );
}

/** Skills zone: tyre stack with a spinning gear rig. */
function TyreRig({ color, active }: { color: string; active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * (active ? 0.8 : 0.35);
  });
  return (
    <group>
      {[0.3, 0.75, 1.2].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, i * 0.4]} castShadow>
          <torusGeometry args={[0.85, 0.3, 10, 20]} />
          <meshStandardMaterial color="#27272A" roughness={0.95} />
        </mesh>
      ))}
      <group ref={ref} position={[0, 2.4, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.55, 16, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.4 : 0.7} />
        </mesh>
        {SKILL_GROUPS.map((g, i) => {
          const a = (i / SKILL_GROUPS.length) * Math.PI * 2;
          return (
            <mesh
              key={g.category}
              position={[Math.cos(a) * 1.9, Math.sin(a * 2) * 0.4, Math.sin(a) * 1.9]}
              castShadow
            >
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color={g.color} roughness={0.7} metalness={0.2} />
            </mesh>
          );
        })}
      </group>
      <pointLight color={color} intensity={active ? 10 : 4} distance={9} position={[0, 2.4, 0]} />
    </group>
  );
}

/** Resume zone: ranger noticeboard with a pinned document. */
function Noticeboard({ color, active }: { color: string; active: boolean }) {
  return (
    <group>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 2.2, 6]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[2.9, 1.8, 0.16]} />
        <meshStandardMaterial color={WOOD} roughness={0.95} />
      </mesh>
      <mesh position={[0, 2, 0.1]}>
        <planeGeometry args={[1.1, 1.4]} />
        <meshStandardMaterial color="#F5EEDC" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.85, 0.1]}>
        <planeGeometry args={[2.4, 0.25]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.95 : 0.6} />
      </mesh>
      <pointLight color={color} intensity={active ? 10 : 3} distance={8} position={[0, 2.4, 1.2]} />
    </group>
  );
}

/** Contact zone: trail archway with a hanging lantern. */
function TrailArch({ color, active }: { color: string; active: boolean }) {
  const lamp = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (lamp.current) lamp.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.12;
  });
  return (
    <group>
      {[-1.8, 1.8].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 3.2, 8]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[4.2, 0.3, 0.35]} />
        <meshStandardMaterial color={WOOD} roughness={0.95} />
      </mesh>
      <group ref={lamp} position={[0, 3.15, 0]}>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.45, 0.6, 0.45]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 2.4 : 1.2}
          />
        </mesh>
      </group>
      <pointLight color={color} intensity={active ? 16 : 8} distance={11} position={[0, 2.6, 0]} />
    </group>
  );
}

const PROJECT_IDS: ZoneId[] = ["queans", "rag", "motion", "edulens"];

export function ZoneObject({
  zone,
  active,
  onSelect,
}: {
  zone: Zone;
  active: boolean;
  onSelect: (id: ZoneId) => void;
}) {
  const color = zone.color;

  let body: React.ReactNode;
  if (zone.id === "about") body = <Campfire color={color} active={active} />;
  else if (PROJECT_IDS.includes(zone.id)) body = <CrateStation color={color} active={active} />;
  else if (zone.id === "social") body = <AntennaMast color={color} active={active} />;
  else if (zone.id === "experience") body = <FieldContainer color={color} active={active} />;
  else if (zone.id === "education") body = <CampTent color={color} active={active} />;
  else if (zone.id === "skills") body = <TyreRig color={color} active={active} />;
  else if (zone.id === "resume") body = <Noticeboard color={color} active={active} />;
  else body = <TrailArch color={color} active={active} />;

  const [zx, , zz] = zone.position;
  const y = heightAt(zx, zz);

  return (
    <group position={[zx, y, zz]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          visible={false}
          position={[0, 1.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(zone.id);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
        >
          <boxGeometry args={[2.6, 3, 2.6]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      <group onClick={(e) => (e.stopPropagation(), onSelect(zone.id))}>{body}</group>
      <Label zone={zone} active={active} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.6, 3.1, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.5 : 0.14}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
