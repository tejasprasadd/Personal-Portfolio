import type { DynamicRayCastVehicleController, RigidBody, World } from "@dimforge/rapier3d-compat";
import type { ControlState } from "@/hooks/useGameControls";

export const ROVER = {
  mass: 520,
  wheelRadius: 0.48,
  halfTrack: 0.99,
  halfBase: 1.48,
  connectY: 0.32,
  suspensionRest: 0.5,
  suspensionTravel: 0.38,
  maxSpeed: 21,
  maxBoostSpeed: 30,
  maxReverse: 8,
} as const;
export const CHASSIS = {
  halfExtents: [0.88, 0.34, 1.98] as [number, number, number],
  position: [0, 0.16, 0] as [number, number, number],
};
export const SPAWN = { x: 0, y: 1.25, z: 18 };
/** Reset a live body without destroying React/Rapier registrations. */
export function resetBody(body: RigidBody, position = SPAWN, heading = Math.PI) {
  body.setTranslation(position, true);
  body.setRotation({ x: 0, y: Math.sin(heading / 2), z: 0, w: Math.cos(heading / 2) }, true);
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  body.resetForces(true);
  body.resetTorques(true);
}
export const WHEEL_ANCHORS: [number, number][] = [
  [-ROVER.halfTrack, ROVER.halfBase],
  [ROVER.halfTrack, ROVER.halfBase],
  [-ROVER.halfTrack, -ROVER.halfBase],
  [ROVER.halfTrack, -ROVER.halfBase],
];
export function createRoverController(world: World, body: RigidBody) {
  const vehicle = world.createVehicleController(body);
  vehicle.indexUpAxis = 1;
  vehicle.setIndexForwardAxis = 2;
  for (const [x, z] of WHEEL_ANCHORS)
    vehicle.addWheel(
      { x, y: ROVER.connectY, z },
      { x: 0, y: -1, z: 0 },
      { x: -1, y: 0, z: 0 },
      ROVER.suspensionRest,
      ROVER.wheelRadius,
    );
  for (let i = 0; i < 4; i++) {
    vehicle.setWheelSuspensionStiffness(i, 32);
    vehicle.setWheelSuspensionCompression(i, 2.4);
    vehicle.setWheelSuspensionRelaxation(i, 3.6);
    vehicle.setWheelMaxSuspensionTravel(i, ROVER.suspensionTravel);
    vehicle.setWheelMaxSuspensionForce(i, 30000);
    vehicle.setWheelFrictionSlip(i, 2.6);
    vehicle.setWheelSideFrictionStiffness(i, 0.9);
  }
  return vehicle;
}
/** Forces are newtons; Rapier wheel brakes take impulse (force × fixed dt). */
export function driveRover(
  vehicle: DynamicRayCastVehicleController,
  input: ControlState,
  dt: number,
  previousSteering: number,
) {
  const speed = vehicle.currentVehicleSpeed(),
    abs = Math.abs(speed),
    m = ROVER.mass;
  const lock = 0.62 + (0.24 - 0.62) * Math.min(abs / ROVER.maxSpeed, 1);
  const steering =
    previousSteering + (input.turn * lock - previousSteering) * (1 - Math.exp(-9 * dt));
  vehicle.setWheelSteering(0, steering);
  vehicle.setWheelSteering(1, steering);
  const boosting = input.boost && input.forward > 0,
    top = boosting ? ROVER.maxBoostSpeed : ROVER.maxSpeed;
  let engine = 0,
    brake = 0;
  if (input.handbrake) brake = m * 9;
  else if (input.forward > 0) {
    if (speed < -0.5) brake = m * 3.4;
    else engine = speed < top ? m * (boosting ? 6.2 : 3.6) : 0;
  } else if (input.forward < 0) {
    if (speed > 0.5) brake = m * 3.4;
    else engine = speed > -ROVER.maxReverse ? -m * 2.2 : 0;
  } else brake = m * (abs < 1.2 ? 1.6 : 0.12);
  for (let i = 0; i < 4; i++) {
    const rear = i >= 2;
    vehicle.setWheelEngineForce(
      i,
      engine * (rear ? 1 : boosting ? 0.55 : 0) * Math.abs(input.forward),
    );
    vehicle.setWheelBrake(
      i,
      (input.handbrake ? (rear ? brake * 0.5 : brake * 0.05) : brake * 0.25) * dt,
    );
    vehicle.setWheelSideFrictionStiffness(i, input.handbrake && rear ? 0.16 : 0.9);
    vehicle.setWheelFrictionSlip(i, input.handbrake && rear ? 0.6 : 2.6);
  }
  vehicle.updateVehicle(dt);
  return { speed, steering, handbrake: input.handbrake };
}
