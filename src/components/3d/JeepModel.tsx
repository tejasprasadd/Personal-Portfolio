import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROVER } from "./vehiclePhysics";
import type { Quality } from "@/hooks/useSettings";
import type { TimeOfDay } from "@/lib/timeOfDay";
import { controls } from "@/hooks/useGameControls";

export const MODEL_WHEEL_RADIUS = ROVER.wheelRadius;
export const MODEL_HALF_TRACK = ROVER.halfTrack;
export const MODEL_HALF_BASE = ROVER.halfBase;
const MODEL_URL = "/models/expedition-jeep.glb";
const WHEELS = {
  "front-left": "WheelFL",
  "front-right": "WheelFR",
  "back-left": "WheelRL",
  "back-right": "WheelRR",
};

class ModelBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ModelPart({ name, night = false }: { name: string; night?: boolean }) {
  const { nodes } = useGLTF(MODEL_URL);
  const { object, lights } = useMemo(() => {
    const original = nodes[name];
    if (!original) throw new Error(`Missing jeep part: ${name}`);
    const clone = original.clone(true);
    clone.position.set(0, 0, 0);
    const lights: THREE.MeshStandardMaterial[] = [];
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = child.receiveShadow = true;
        const m = (child.material as THREE.MeshStandardMaterial).clone();
        child.material = m;
        if (m.name === "Headlights" || m.name === "BrakeLights") lights.push(m);
      }
    });
    return { object: clone, lights };
  }, [nodes, name]);
  useEffect(
    () => () =>
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) (child.material as THREE.Material).dispose();
      }),
    [object],
  );
  useFrame(() =>
    lights.forEach((m) => {
      if (m.name === "Headlights") m.emissiveIntensity = night ? 3 : 0.3;
      if (m.name === "BrakeLights")
        m.emissiveIntensity = controls.handbrake || controls.forward < 0 ? 3 : night ? 0.8 : 0.2;
    }),
  );
  return <primitive object={object} dispose={null} />;
}

export function JeepBody({ timeOfDay, quality }: { timeOfDay: TimeOfDay; quality: Quality }) {
  const night = timeOfDay === "night";
  const target = useMemo(() => new THREE.Object3D(), []);
  const light = useRef<THREE.SpotLight>(null);
  useEffect(() => {
    target.position.set(0, -0.5, 15);
    if (light.current) light.current.target = target;
  }, [target, night, quality]);
  const fallback = (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1.9, 1, 4.4]} />
      <meshStandardMaterial color="#647467" />
    </mesh>
  );
  return (
    <>
      <ModelBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <ModelPart name="Body" night={night} />
        </Suspense>
      </ModelBoundary>
      {night && quality !== "low" && (
        <>
          <primitive object={target} />
          <spotLight
            ref={light}
            position={[0, 0.45, 2.15]}
            color="#ffe1ab"
            intensity={85}
            distance={28}
            angle={0.5}
            penumbra={0.7}
            decay={1.3}
          />
        </>
      )}
    </>
  );
}

export function JeepWheelMesh({ corner }: { corner: keyof typeof WHEELS }) {
  const fallback = (
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[ROVER.wheelRadius, ROVER.wheelRadius, 0.3, 16]} />
      <meshStandardMaterial color="#191b1b" />
    </mesh>
  );
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <ModelPart name={WHEELS[corner]} />
      </Suspense>
    </ModelBoundary>
  );
}

if (typeof window !== "undefined") useGLTF.preload(MODEL_URL);
