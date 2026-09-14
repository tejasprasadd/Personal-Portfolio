import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RigidBody,
  useRapier,
  useBeforePhysicsStep,
  type RapierRigidBody,
} from "@react-three/rapier";
import type { DynamicRayCastVehicleController } from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { createRoverController, driveRover, ROVER, CHASSIS, resetBody } from "./vehiclePhysics";
import type { Quality } from "@/hooks/useSettings";
import type { TimeOfDay } from "@/lib/timeOfDay";
import { controls } from "@/hooks/useGameControls";
import {
  JeepBody,
  JeepWheelMesh,
  MODEL_HALF_BASE,
  MODEL_HALF_TRACK,
  MODEL_WHEEL_RADIUS,
} from "./JeepModel";
const heightAt = (_x: number, _z: number) => 0;
import {
  Debris,
  Dust,
  SkidMarks,
  type DebrisHandle,
  type DustHandle,
  type SkidHandle,
} from "./Effects";

export type PlayerState = {
  position: THREE.Vector3;
  heading: number;
  speed: number;
  airborne: boolean;
  inWater: boolean;
  /** Decaying 0..1 jolt used for camera shake on impacts and hard landings. */
  impact?: number;
  /** Simulated engine revs, 0..1 of redline. */
  rpm?: number;
  /** Current gear, 0 = reverse, 1..5 forward. */
  gear?: number;
  /** Per-wheel suspension compression, 0 (extended) .. 1 (bottomed out). */
  suspension?: number[];
  /** Accumulated chassis damage, 0..1. */
  damage?: number;
};

/** Redline in "engine rpm" units used by the dashboard. */
export const REDLINE = 7000;

/* ---------------------------------------------------------------------------
   Vehicle geometry. Everything is derived from the tyre radius so the visual
   model and the raycast suspension can never drift apart.
--------------------------------------------------------------------------- */
const WHEEL_RADIUS = ROVER.wheelRadius;
const HALF_TRACK = MODEL_HALF_TRACK;
const HALF_BASE = MODEL_HALF_BASE;
/** Where the suspension is bolted to the chassis, in chassis space. */
const CONNECT_Y = ROVER.connectY;
/** Spring rest length: how far the wheel hangs below its mount at rest. */
const SUSP_REST = ROVER.suspensionRest;
/** Long-travel offroad springs. */
const SUSP_TRAVEL = ROVER.suspensionTravel;
const SUSP_STIFFNESS = 24;
const SUSP_COMPRESSION = 2.4;
const SUSP_RELAX = 3.6;
const MAX_SUSP_FORCE = 30000;
/** Model root sits on the ground plane at rest. */
// Allow for spring compression at rest so the model arches centre on the tyres.
const BODY_Y = CONNECT_Y - SUSP_REST + 0.14;

/** Chassis mass (kg-ish) — everything else is scaled off it. */
const MASS = ROVER.mass;
const ENGINE_FORCE = MASS * 3.6;
const BOOST_FORCE = MASS * 6.2;
const REVERSE_FORCE = MASS * 2.2;
const BRAKE_FORCE = MASS * 3.4;
const HANDBRAKE_FORCE = MASS * 9;
const MAX_SPEED = 21;
const MAX_BOOST_SPEED = 30;
const MAX_REVERSE = 8;

const GRIP = 2.6;
const SIDE_GRIP = 0.9;
const DRIFT_SIDE_GRIP = 0.16;

const SPAWN: [number, number, number] = [0, 0, 18];
const spawnY = () => heightAt(SPAWN[0], SPAWN[2]) + WHEEL_RADIUS + SUSP_REST + 0.6;

/** Local wheel anchors: FL, FR, RL, RR (x = right, z = forward). */
const WHEEL_ANCHORS: [number, number][] = [
  [-HALF_TRACK, HALF_BASE],
  [HALF_TRACK, HALF_BASE],
  [-HALF_TRACK, -HALF_BASE],
  [HALF_TRACK, -HALF_BASE],
];

const DOWN = { x: 0, y: -1, z: 0 };
const AXLE = { x: -1, y: 0, z: 0 };

const CORNERS = ["front-left", "front-right", "back-left", "back-right"] as const;

/**
 * Creates the raycast vehicle controller for the chassis body.
 * Rendered as a child of the chassis <RigidBody> so its cleanup runs *before*
 * the rigid body is destroyed — the reverse order makes Rapier's wasm bindings
 * throw "recursive use of an object detected".
 */
function VehicleRig({
  chassis,
  vehicle,
}: {
  chassis: React.RefObject<RapierRigidBody | null>;
  vehicle: React.MutableRefObject<DynamicRayCastVehicleController | null>;
}) {
  const { world } = useRapier();
  useEffect(() => {
    const rb = chassis.current;
    if (!rb) return;
    const v = createRoverController(world, rb);
    vehicle.current = v;
    return () => {
      try {
        if (vehicle.current) world.removeVehicleController(vehicle.current);
      } catch {
        /* world already torn down */
      }
      vehicle.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);
  return null;
}

/**
 * Offroad jeep driven by Rapier's raycast vehicle controller: a dynamic
 * chassis with four independently sprung raycast wheels, engine force on the
 * rear axle, speed-sensitive steering and a rear-locking handbrake for drift.
 */
export function Jeep({
  state,
  resetKey,
  reduceMotion,
  timeOfDay,
  quality,
  onReset,
}: {
  state: PlayerState;
  resetKey: number;
  reduceMotion: boolean;
  timeOfDay: TimeOfDay;
  quality: Quality;
  onReset: () => void;
}) {
  const { world } = useRapier();
  const chassis = useRef<RapierRigidBody>(null);
  const vehicle = useRef<DynamicRayCastVehicleController | null>(null);

  const wheelRefs = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const tyreRefs = useRef<(THREE.Group | null)[]>([null, null, null, null]);

  const skid = useRef<SkidHandle | null>(null);
  const dust = useRef<DustHandle | null>(null);
  const debris = useRef<DebrisHandle | null>(null);

  const steer = useRef(0);
  const skidTimer = useRef(0);
  const dustTimer = useRef(0);
  const wasAirborne = useRef(false);
  const airTime = useRef(0);
  const upsideDown = useRef(0);
  const jumpLock = useRef(false);
  const prevSpeed = useRef(0);
  const recoveryPending = useRef(false);
  const lastReset = useRef(resetKey);

  useEffect(() => {
    if (lastReset.current === resetKey || !chassis.current) return;
    lastReset.current = resetKey;
    // The body stays registered; replacing only the controller clears cached suspension/speed.
    if (vehicle.current) world.removeVehicleController(vehicle.current);
    resetBody(chassis.current);
    vehicle.current = createRoverController(world, chassis.current);
    steer.current =
      skidTimer.current =
      dustTimer.current =
      airTime.current =
      upsideDown.current =
      prevSpeed.current =
        0;
    wasAirborne.current = jumpLock.current = recoveryPending.current = false;
    state.position.set(0, 1.25, 18);
    Object.assign(state, {
      heading: Math.PI,
      speed: 0,
      airborne: false,
      inWater: false,
      impact: 0,
      rpm: 0.16,
      gear: 1,
      damage: 0,
      suspension: [0, 0, 0, 0],
    });
    wheelRefs.current.forEach((wheel, i) => {
      if (wheel) {
        wheel.position.set(WHEEL_ANCHORS[i]![0], CONNECT_Y - SUSP_REST, WHEEL_ANCHORS[i]![1]);
        wheel.rotation.set(0, 0, 0);
      }
    });
    tyreRefs.current.forEach((wheel) => wheel?.rotation.set(0, 0, 0));
  }, [resetKey, state, world]);

  const q = useMemo(() => new THREE.Quaternion(), []);
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), []);
  const up = useMemo(() => new THREE.Vector3(), []);

  useBeforePhysicsStep((world) => {
    const rb = chassis.current;
    const v = vehicle.current;
    if (!rb || !v || recoveryPending.current) return;
    const dt = world.timestep;

    const drive = driveRover(v, controls, dt, steer.current);
    steer.current = drive.steering;
    const speed = drive.speed;
    const absSpeed = Math.abs(speed);
    const handbrake = drive.handbrake;

    // ---- read back chassis pose -------------------------------------------
    const t = rb.translation();
    const rot = rb.rotation();
    q.set(rot.x, rot.y, rot.z, rot.w);
    euler.setFromQuaternion(q);
    up.set(0, 1, 0).applyQuaternion(q);

    state.position.set(t.x, t.y, t.z);
    state.heading = euler.y;
    state.speed = speed;
    state.inWater = false;

    let grounded = 0;
    for (let i = 0; i < 4; i++) if (v.wheelIsInContact(i)) grounded++;
    const airborne = grounded === 0;
    state.airborne = airborne;

    // ---- idle settle: kill residual jitter when parked ---------------------
    const idle = controls.forward === 0 && controls.turn === 0 && !controls.jump && !controls.boost;
    if (idle && grounded >= 3 && absSpeed < 0.8) {
      const lv = rb.linvel();
      const av = rb.angvel();
      rb.setLinvel({ x: lv.x * 0.1, y: Math.min(0, lv.y), z: lv.z * 0.1 }, true);
      rb.setAngvel({ x: av.x * 0.1, y: av.y * 0.1, z: av.z * 0.1 }, true);
    }

    // ---- hop, landings and impacts ----------------------------------------
    if (!controls.jump) jumpLock.current = false;
    if (controls.jump && !airborne && !jumpLock.current) {
      jumpLock.current = true;
      rb.applyImpulse({ x: 0, y: MASS * 6.4, z: 0 }, true);
    }

    if (airborne) airTime.current += dt;
    if (wasAirborne.current && !airborne) {
      const landing = Math.min(1, airTime.current * 1.4);
      if (landing > 0.12) {
        state.impact = Math.min(1, (state.impact ?? 0) + landing);
        state.damage = Math.min(1, (state.damage ?? 0) + landing * 0.04);
        if (!reduceMotion) {
          for (let i = 0; i < 4; i++) {
            const c = v.wheelContactPoint(i);
            if (!c) continue;
            dust.current?.add(c.x, c.y, c.z, 0, 0, 0.6 + landing);
            dust.current?.add(c.x, c.y, c.z, 0, 0, 0.4 + landing * 0.7);
          }
          if (landing > 0.5) debris.current?.burst(t.x, t.y - 1, t.z, 0, 0, landing);
        }
      }
      airTime.current = 0;
    }
    wasAirborne.current = airborne;

    // hard deceleration (hitting scenery) shakes the camera
    const decel = (prevSpeed.current - speed) / Math.max(dt, 0.001);
    prevSpeed.current = speed;
    if (!airborne && decel > 40 && !handbrake) {
      const force = Math.min(1, decel / 160);
      state.impact = Math.min(1, (state.impact ?? 0) + force);
      state.damage = Math.min(1, (state.damage ?? 0) + force * 0.06);
      if (!reduceMotion && force > 0.25) {
        debris.current?.burst(t.x, t.y - 0.8, t.z, 0, 0, force);
      }
    }
    state.impact = Math.max(0, (state.impact ?? 0) - dt * 3.4);
    // the chassis slowly patches itself up so the run never becomes unplayable
    state.damage = Math.max(0, (state.damage ?? 0) - dt * 0.012);

    // ---- flip recovery ------------------------------------------------------
    if (up.y < 0.15 && absSpeed < 2) upsideDown.current += dt;
    else upsideDown.current = 0;
    if (upsideDown.current > 2.5) {
      recoveryPending.current = true;
      onReset();
      return;
    }

    // Recover from the island edge; no invisible boundary walls.
    if (t.y < -3 || Math.hypot(t.x, t.z) > 53) {
      state.inWater = true;
      recoveryPending.current = true;
      onReset();
      return;
    }

    // ---- wheel visuals: real suspension travel + spin -----------------------
    let slipTotal = 0;
    const susp = state.suspension ?? (state.suspension = [0, 0, 0, 0]);
    for (let i = 0; i < 4; i++) {
      const group = wheelRefs.current[i];
      const tyre = tyreRefs.current[i];
      const anchor = WHEEL_ANCHORS[i]!;
      const len = v.wheelSuspensionLength(i) ?? SUSP_REST;
      if (group) {
        group.position.set(anchor[0], CONNECT_Y - len, anchor[1]);
        group.rotation.y = v.wheelSteering(i) ?? 0;
      }
      if (tyre) tyre.rotation.x = -(v.wheelRotation(i) ?? 0);
      slipTotal += Math.abs(v.wheelSideImpulse(i) ?? 0);
      // 0 = fully extended (droop), 1 = bottomed out
      const compression = THREE.MathUtils.clamp(
        (SUSP_REST + SUSP_TRAVEL * 0.5 - len) / SUSP_TRAVEL,
        0,
        1,
      );
      susp[i] = THREE.MathUtils.lerp(susp[i] ?? 0, compression, 1 - Math.exp(-dt * 18));
    }

    // ---- drivetrain telemetry (rpm / gear) ----------------------------------
    {
      const kph = absSpeed * 3.6;
      const gear = airborne
        ? (state.gear ?? 1)
        : speed < -0.4
          ? 0
          : Math.min(5, Math.max(1, Math.floor(kph / 22) + 1));
      const perGear = 24; // kph spanned by each gear before shifting
      const inGear = gear === 0 ? kph : kph - (gear - 1) * 22;
      const throttle = Math.abs(controls.forward) > 0 ? (controls.forward > 0 ? 1 : 0.7) : 0;
      let target =
        0.16 +
        THREE.MathUtils.clamp(inGear / perGear, 0, 1) * 0.72 +
        throttle * 0.16 +
        (airborne && throttle > 0 ? 0.12 : 0);
      if (handbrake && absSpeed > 2) target += 0.08;
      state.rpm = THREE.MathUtils.lerp(
        state.rpm ?? 0.16,
        THREE.MathUtils.clamp(target, 0, 1),
        1 - Math.exp(-dt * 9),
      );
      state.gear = gear;
    }

    // ---- slip FX: skid marks, tyre smoke and dust ---------------------------
    if (!reduceMotion && !airborne) {
      const slip = Math.min(1, slipTotal / (MASS * 1.4));
      const wheelspin = controls.forward > 0 && absSpeed < 3 ? 1 - absSpeed / 3 : 0;
      const skidding = handbrake ? absSpeed > 2 : slip > 0.32 || wheelspin > 0.5;

      skidTimer.current -= dt;
      if (skidding && skidTimer.current <= 0) {
        skidTimer.current = 0.018;
        const width = 0.34 + slip * 0.24;
        for (let i = 2; i < 4; i++) {
          const c = v.wheelContactPoint(i);
          if (c) skid.current?.add(c.x, c.y, c.z, euler.y, width);
        }
        if (handbrake || slip > 0.65) {
          for (let i = 0; i < 2; i++) {
            const c = v.wheelContactPoint(i);
            if (c) skid.current?.add(c.x, c.y, c.z, euler.y, width * 0.85);
          }
        }
      }

      dustTimer.current -= dt;
      const rate = absSpeed > 4 || skidding ? 0.035 : 0.2;
      if ((absSpeed > 2.5 || skidding) && dustTimer.current <= 0) {
        dustTimer.current = rate;
        const vel = rb.linvel();
        for (let i = 2; i < 4; i++) {
          const c = v.wheelContactPoint(i);
          if (!c) continue;
          dust.current?.add(
            c.x,
            c.y,
            c.z,
            -vel.x * 0.35,
            -vel.z * 0.35,
            Math.min(1.6, absSpeed / 10 + slip + wheelspin),
          );
        }
      }
    }
  });

  return (
    <>
      {!reduceMotion && (
        <group key={resetKey}>
          <SkidMarks handle={skid} />
          <Dust handle={dust} />
          <Debris handle={debris} />
        </group>
      )}
      <RigidBody
        ref={chassis}
        type="dynamic"
        position={[SPAWN[0], spawnY(), SPAWN[2]]}
        rotation={[0, Math.PI, 0]}
        colliders={false}
        canSleep={false}
        ccd
        linearDamping={0.15}
        angularDamping={0.6}
      >
        {/* chassis: mass sits low and slightly rearward for stability */}
        <CuboidCollider
          args={CHASSIS.halfExtents}
          position={CHASSIS.position}
          mass={MASS}
          friction={0.6}
          restitution={0.05}
        />
        <CuboidCollider
          args={[0.81, 0.43, 1.15]}
          position={[0, 0.92, -0.55]}
          mass={0}
          friction={0.3}
        />

        <VehicleRig chassis={chassis} vehicle={vehicle} />

        {WHEEL_ANCHORS.map((anchor, i) => (
          <group
            key={i}
            ref={(g) => {
              wheelRefs.current[i] = g;
            }}
            position={[anchor[0], CONNECT_Y - SUSP_REST, anchor[1]]}
          >
            <group
              ref={(g) => {
                tyreRefs.current[i] = g;
              }}
            >
              <JeepWheelMesh corner={CORNERS[i]!} />
            </group>
          </group>
        ))}

        {/* coil-over shocks, anchored to the frame */}
        {WHEEL_ANCHORS.map(([x, z]) => (
          <mesh key={`shock${x}${z}`} position={[x * 0.82, CONNECT_Y - 0.12, z]}>
            <cylinderGeometry args={[0.09, 0.09, 0.8, 8]} />
            <meshStandardMaterial color="#B45309" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}

        {/* live axle tubes */}
        {[HALF_BASE, -HALF_BASE].map((z) => (
          <mesh
            key={`axle${z}`}
            position={[0, CONNECT_Y - SUSP_REST, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.1, 0.1, HALF_TRACK * 2, 10]} />
            <meshStandardMaterial color="#2A2A2E" metalness={0.55} roughness={0.6} />
          </mesh>
        ))}
        {[HALF_BASE, -HALF_BASE].map((z) => (
          <mesh key={`diff${z}`} position={[0, CONNECT_Y - SUSP_REST, z]}>
            <sphereGeometry args={[0.21, 12, 12]} />
            <meshStandardMaterial color="#2A2A2E" metalness={0.55} roughness={0.6} />
          </mesh>
        ))}

        <group position={[0, BODY_Y, 0]}>
          <JeepBody timeOfDay={timeOfDay} quality={quality} />
        </group>
      </RigidBody>
    </>
  );
}

export const Player = Jeep;
