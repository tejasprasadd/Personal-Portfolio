# Bigger tyres + a real raycast-vehicle jeep

Two things to fix: the enlarged wheels now cut into the body shell, and the jeep still drives on a hand-written kinematic rig rather than true vehicle physics. The plan makes the tyres bigger *and* correct, then swaps the drive model for a Bruno-Simon-style raycast vehicle (the same technique his kart uses: a dynamic chassis body with four spring-loaded raycast wheels).

## 1. Fix the wheel/body intersection

- Push the wheels outboard so the oversized tyres clear the body sides instead of sinking into the flanks (wider half-track, matched left/right).
- Lift the body shell relative to the axles so the taller tyre tops sit inside the wheel arches, not through the doors.
- Add simple fender-flare rings over each arch so the extra tyre width reads as intentional lift kit rather than clipping.
- Rebalance the visual chassis (axle tubes, shocks, mud flaps) to the new track width.

## 2. Bigger tyres

- Raise the tyre scale another step (roughly +25% over the current size) with the physics wheel radius, ride height, axle drop and suspension travel all derived from that one number, so visuals and collisions never drift apart again.

## 3. Bruno-Simon-style physics

Replace the kinematic terrain-follower with a proper vehicle simulation:

- Dynamic chassis rigid body with realistic mass and centre of gravity slightly low and rearward.
- Four raycast wheels, each with its own spring (stiffness, compression/rebound damping, max travel, rest length) — suspension load then genuinely differs corner to corner over rough ground.
- Engine force on the rear wheels (front-assist under boost), brake force on all four, steering on the front pair with speed-sensitive limit.
- Per-wheel friction slip so the rear breaks loose under power and the handbrake locks the rear axle for drift, with the chassis carrying real momentum and yaw inertia.
- Because the chassis is dynamic, the jeep can now lean, get air, land nose-first and even roll on a bad landing — with an auto-recover (press R, or automatic after a few seconds upside down) so the user is never stuck.
- Existing skid marks, dust, tyre smoke, debris bursts and camera shake get rewired to the new wheel contact/slip data instead of the old estimates.

## 4. Keep everything else working

Zone triggers, minimap, waypoints, checkpoints, controls (WASD, Space handbrake, V hop, boost) and the quality scaler stay exactly as they are; only the vehicle layer changes.

## Technical notes

- `src/components/3d/JeepModel.tsx`: single `WHEEL_SCALE` source of truth, wider `MODEL_HALF_TRACK`, body offset raised, fender geometry added.
- `src/components/3d/Player.tsx`: rebuilt around `useRapier` + Rapier's `DynamicRayCastVehicleController` (chassis `RigidBody type="dynamic"` with a cuboid collider), wheel transforms read back from the controller each frame; scenery collision handled by real colliders instead of the manual blocker loop where the scatter props already have them.
- Terrain already has a trimesh collider, so raycasts hit real geometry — no separate heightmap sampling needed for the drive model (`heightAt` stays for FX placement).
- FX (`Effects.tsx`) unchanged in API; only the call sites move to wheel contact points and slip values.

Note: this is an original implementation of a standard raycast-vehicle setup — no assets, code or visual identity are taken from bruno-simon.com.
