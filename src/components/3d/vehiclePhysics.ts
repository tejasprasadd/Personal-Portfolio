import type { DynamicRayCastVehicleController, RigidBody, World } from "@dimforge/rapier3d-compat";
import type { ControlState } from "@/hooks/useGameControls";

export const ROVER = {
  mass: 520,
  wheelRadius: 0.62,
  halfTrack: 1.18,
  halfBase: 1.25,
  connectY: 0.38,
  suspensionRest: 0.55,
  suspensionTravel: 0.55,
  maxSpeed: 21,
  maxBoostSpeed: 30,
  maxReverse: 8,
} as const;
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
    vehicle.setWheelSuspensionStiffness(i, 24);
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
