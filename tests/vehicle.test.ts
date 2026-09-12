import { beforeAll, expect, test } from "bun:test";
import RAPIER from "@dimforge/rapier3d-compat";
import { createRoverController, driveRover, ROVER } from "../src/components/3d/vehiclePhysics";
import type { ControlState } from "../src/hooks/useGameControls";
beforeAll(async () => {
  await RAPIER.init();
});
const idle: ControlState = { forward: 0, turn: 0, jump: false, boost: false, handbrake: false };
function rig() {
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = 1 / 60;
  world.createCollider(RAPIER.ColliderDesc.cuboid(100, 1, 100).setTranslation(0, -1, 0));
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, 2, 0)
      .setLinearDamping(0.15)
      .setAngularDamping(0.6)
      .setCanSleep(false)
      .setCcdEnabled(true),
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.95, 0.45, 1.6)
      .setTranslation(0, 0.35, -0.1)
      .setMass(ROVER.mass)
      .setFriction(0.6),
    body,
  );
  const vehicle = createRoverController(world, body);
  let steering = 0;
  const step = (input: ControlState, frames = 1) => {
    for (let i = 0; i < frames; i++) {
      steering = driveRover(vehicle, input, world.timestep, steering).steering;
      world.step();
    }
  };
  step(idle, 120);
  return { world, body, vehicle, step, dispose: () => world.free() };
}
test("suspension settles above ground and supports all four wheels", () => {
  const r = rig();
  expect(r.body.translation().y).toBeGreaterThan(0.5);
  expect(r.body.translation().y).toBeLessThan(1.5);
  for (let i = 0; i < 4; i++) expect(r.vehicle.wheelIsInContact(i)).toBe(true);
  r.dispose();
});
test("analogue throttle changes acceleration, brakes stop, reverse engages", () => {
  const full = rig(),
    half = rig();
  full.step({ ...idle, forward: 1 }, 120);
  half.step({ ...idle, forward: 0.5 }, 120);
  expect(full.body.translation().z).toBeGreaterThan(half.body.translation().z * 1.4);
  const speed = Math.abs(full.vehicle.currentVehicleSpeed());
  full.step({ ...idle, handbrake: true }, 120);
  expect(Math.abs(full.vehicle.currentVehicleSpeed())).toBeLessThan(speed * 0.2);
  full.step({ ...idle, forward: -1 }, 180);
  expect(full.vehicle.currentVehicleSpeed()).toBeLessThan(-1);
  full.dispose();
  half.dispose();
});
test("collision transfers momentum to a movable crate", () => {
  const r = rig();
  const box = r.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 1, 10));
  r.world.createCollider(RAPIER.ColliderDesc.cuboid(1, 1, 1).setMass(18), box);
  r.step({ ...idle, forward: 1 }, 160);
  expect(box.translation().z).toBeGreaterThan(12);
  r.dispose();
});
test("fixed-step trajectory is independent of rendering at 30 or 60 fps", () => {
  const a = rig(),
    b = rig();
  for (let frame = 0; frame < 120; frame++) a.step({ ...idle, forward: 1, turn: 0.2 });
  for (let frame = 0; frame < 60; frame++) b.step({ ...idle, forward: 1, turn: 0.2 }, 2);
  expect(a.body.translation().x).toBeCloseTo(b.body.translation().x, 5);
  expect(a.body.translation().z).toBeCloseTo(b.body.translation().z, 5);
  a.dispose();
  b.dispose();
});
