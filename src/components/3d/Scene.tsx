import { Suspense, memo, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import * as THREE from "three";
import { Island } from "./Island";
import { Player, type PlayerState } from "./Player";
import { ZONES, type ZoneId } from "./zones";
import type { Quality } from "@/hooks/useSettings";
import { useDrivingAudio } from "@/hooks/useDrivingAudio";
import { Ocean } from "./Ocean";
import { BoostTrail } from "./BoostTrail";
import type { TimeOfDay } from "@/lib/timeOfDay";

export type Telemetry = { speed: number; x: number; z: number; airborne: boolean };
export type SceneProps = {
  quality: Quality;
  reduceMotion: boolean;
  resetKey: number;
  exploring: boolean;
  paused: boolean;
  sound: boolean;
  music: boolean;
  timeOfDay: TimeOfDay;
  onReset: () => void;
  activeZone: ZoneId | null;
  onNearZone: (id: ZoneId | null) => void;
  onSelectZone: (id: ZoneId) => void;
  onTelemetry: (data: Telemetry) => void;
  onReady: () => void;
  onFailure: () => void;
  onFrame?: ((dt: number) => void) | undefined;
};
function Lighting({ quality, timeOfDay }: { quality: Quality; timeOfDay: TimeOfDay }) {
  const { gl, scene } = useThree();
  const night = timeOfDay === "night";
  useEffect(() => {
    scene.environmentIntensity = night ? 0.1 : 0.38;
    scene.background = new THREE.Color(night ? "#152b3f" : "#a6c9cc");
    scene.fog = new THREE.Fog(night ? "#152b3f" : "#a6c9cc", 155, 340);
    gl.toneMappingExposure = night ? 0.85 : 1.05;
  }, [gl, scene, night]);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl),
      room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);
  return (
    <>
      <hemisphereLight
        args={[night ? "#8dabc9" : "#f7f6dc", night ? "#233d48" : "#829c88", night ? 0.45 : 1.7]}
      />
      <directionalLight
        position={[-25, 65, 35]}
        color={night ? "#acc9f2" : "#fff2d5"}
        intensity={night ? 0.65 : 2.8}
        castShadow={quality !== "low"}
        shadow-mapSize={quality === "high" ? [2048, 2048] : [1024, 1024]}
        shadow-camera-left={-52}
        shadow-camera-right={52}
        shadow-camera-top={52}
        shadow-camera-bottom={-52}
        shadow-camera-far={160}
        shadow-normalBias={0.08}
        shadow-bias={-0.0001}
      />
    </>
  );
}
function CameraRig({
  state,
  exploring,
  reduceMotion,
  resetKey,
}: {
  state: PlayerState;
  exploring: boolean;
  reduceMotion: boolean;
  resetKey: number;
}) {
  const { camera, gl, size } = useThree();
  const orbit = useRef({ yaw: 0.0, zoom: 1, dragging: false, x: 0 }),
    target = useMemo(() => new THREE.Vector3(), []),
    desired = useMemo(() => new THREE.Vector3(), []),
    look = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    orbit.current = { yaw: 0, zoom: 1, dragging: false, x: 0 };
    look.copy(state.position);
  }, [resetKey, look, state]);
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      orbit.current.dragging = true;
      orbit.current.x = e.clientX;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (orbit.current.dragging) {
        orbit.current.yaw -= (e.clientX - orbit.current.x) * 0.005;
        orbit.current.x = e.clientX;
      }
    };
    const up = () => {
      orbit.current.dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      if (!exploring) return;
      e.preventDefault();
      orbit.current.zoom = THREE.MathUtils.clamp(orbit.current.zoom + e.deltaY * 0.001, 0.65, 1.7);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl, exploring]);
  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05),
      yaw = 0.64 + orbit.current.yaw;
    const narrow = size.width / size.height < 1.1;
    const radius = exploring ? 20 * orbit.current.zoom : narrow ? 125 : 105;
    if (exploring) target.set(state.position.x, state.position.y, state.position.z);
    else target.set(0, 0, 0);
    look.lerp(target, 1 - Math.exp(-dt * 4));
    const sway = reduceMotion || exploring ? 0 : Math.sin(s.clock.elapsedTime * 0.16) * 0.7;
    desired.set(
      look.x + Math.sin(yaw) * radius,
      look.y + (exploring ? 16 * orbit.current.zoom : narrow ? 92 : 78) + sway,
      look.z + Math.cos(yaw) * radius,
    );
    camera.position.lerp(desired, reduceMotion ? 1 : 1 - Math.exp(-dt * 3));
    camera.lookAt(look);
  });
  return null;
}
function Runtime({ state, props }: { state: PlayerState; props: SceneProps }) {
  const { gl } = useThree(),
    last = useRef(0),
    near = useRef<ZoneId | null>(null);
  useEffect(() => {
    props.onReady();
    const lost = (e: Event) => {
      e.preventDefault();
      props.onFailure();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, props.onReady, props.onFailure]);
  useFrame((_, dt) => {
    props.onFrame?.(dt);
    last.current += dt;
    if (last.current < 0.1) return;
    last.current = 0;
    let closest: ZoneId | null = null,
      distance = 7;
    for (const zone of ZONES) {
      const d = Math.hypot(
        state.position.x - zone.position[0],
        state.position.z - zone.position[2],
      );
      if (d < distance) {
        distance = d;
        closest = zone.id;
      }
    }
    if (near.current !== closest) {
      near.current = closest;
      props.onNearZone(closest);
    }
    props.onTelemetry({
      speed: Math.abs(state.speed) * 3.6,
      x: state.position.x,
      z: state.position.z,
      airborne: state.airborne,
    });
  });
  return null;
}
function Scene(props: SceneProps) {
  const state = useMemo<PlayerState>(
    () => ({
      position: new THREE.Vector3(0, 2, 18),
      heading: Math.PI,
      speed: 0,
      airborne: false,
      inWater: false,
    }),
    [],
  );
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const fn = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);
  useDrivingAudio({
    state,
    enabled: props.sound,
    music: props.music,
    active: props.exploring && !props.paused && visible,
  });
  return (
    <Canvas
      aria-label="Interactive island with a drivable rover and portfolio landmarks"
      dpr={props.quality === "high" ? [1, 1.5] : [1, 1]}
      shadows={props.quality === "low" ? false : "percentage"}
      frameloop={visible && !props.paused ? "always" : "demand"}
      camera={{ position: [63, 78, 84], fov: 43, near: 0.5, far: 500 }}
      gl={{
        alpha: true,
        antialias: props.quality !== "low",
        powerPreference: props.quality === "low" ? "low-power" : "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ scene, gl }) => {
        scene.background = null;
        scene.fog = new THREE.Fog("#dbe6dd", 155, 340);
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Suspense fallback={null}>
        <Lighting quality={props.quality} timeOfDay={props.timeOfDay} />
        <Ocean
          quality={props.quality}
          reduceMotion={props.reduceMotion}
          timeOfDay={props.timeOfDay}
        />
        <Physics
          gravity={[0, -18, 0]}
          timeStep={1 / 60}
          interpolate
          paused={props.paused || !visible}
        >
          <Island
            quality={props.quality}
            activeZone={props.activeZone}
            onSelect={props.onSelectZone}
            resetKey={props.resetKey}
            reduceMotion={props.reduceMotion}
            timeOfDay={props.timeOfDay}
          />
          <Player
            state={state}
            resetKey={props.resetKey}
            reduceMotion={props.reduceMotion || props.quality === "low"}
            timeOfDay={props.timeOfDay}
            quality={props.quality}
            onReset={props.onReset}
          />
        </Physics>
        <BoostTrail
          key={props.resetKey}
          state={state}
          paused={props.paused || !visible || !props.exploring}
          reduceMotion={props.reduceMotion}
        />
        <CameraRig
          state={state}
          exploring={props.exploring}
          reduceMotion={props.reduceMotion}
          resetKey={props.resetKey}
        />
        <Runtime state={state} props={props} />
      </Suspense>
    </Canvas>
  );
}

export default memo(Scene);
