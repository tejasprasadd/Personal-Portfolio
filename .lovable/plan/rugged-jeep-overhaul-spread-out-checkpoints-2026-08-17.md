# Rugged Jeep Overhaul + Spread-Out Checkpoints

## What changes

### 1. Bigger, taller, more rugged jeep
- Wheel radius goes from 0.44 to ~0.62 with wider tyres and deeper mud lugs, chunkier beadlock rims.
- Ride height and body lift increase to match (lifted suspension look): raised body tub, visible coil-over shocks and axle tubes between the frame and each wheel, wider track and longer wheelbase so proportions stay right.
- Model detail pass: sharper grille with round headlights, fender flares, rock sliders, front bumper with winch, rear-mounted spare on the bigger wheel size, roof rack with light bar, snorkel, exhaust — all built from primitives so it stays fast and has no external asset dependency.

### 2. No more wheels sinking into the ground
- The chassis currently rides an averaged plane of the four contact points, so on uneven ground the low wheels bury themselves. Each wheel will instead be clamped so its visual bottom never goes below the terrain under it: per-wheel suspension travel is solved against its own contact height, and the ride height derives from the highest-loaded wheel rather than a flat average.
- Body pitch/roll is fitted to the contact points but limited so the tyres always stay on or above the surface.

### 3. Suspension realism tuning
- Independent per-wheel spring + damper with real travel limits (compression and droop stops), so a wheel can hang in the air over a dip instead of snapping to the body.
- Softer springs with progressive bump stops: small ruts absorbed by the wheels, big landings compress and rebound once instead of jittering.
- Anti-roll coupling side-to-side so the jeep leans in corners without tipping, plus weight transfer under throttle/brake retained.

### 4. Slip and impact FX
- Slip: skid marks now scale with actual slip angle (not just handbrake), tyre-smoke puffs when a wheel spins up from a standstill or locks, and a subtle slip-based steering wobble.
- Impact: hitting a rock or tree kicks a dust burst plus small debris sparks at the contact point, a chassis jolt (suspension compresses + camera shake), and a landing thump with dust rings from each wheel proportional to fall speed.

### 5. Spread-out checkpoints
- The 11 zones currently sit in a tight ~15-unit cluster. They get pushed out across the map (roughly a 30-70 unit radius spread, sensible driving distance apart, each placed on drivable ground) so exploring actually means driving.
- Minimap range, waypoint beacon scale/visibility distance, and the "nearest zone" distance readout adjust for the larger world.

## Technical notes
- Files touched: `src/components/3d/Player.tsx` (model, suspension solver, FX triggers), `src/components/3d/Effects.tsx` (impact bursts, debris, smoke), `src/components/3d/zones.ts` (positions), `src/components/3d/Scene.tsx` (camera shake, proximity ranges), `src/components/experience/Minimap.tsx` (range), `src/components/3d/Waypoints.tsx` (scale/far visibility).
- Jeep stays a kinematic rigid body with the custom drive model — that is what removed the earlier hopping bug — with suspension solved per wheel instead of one body spring.
- Terrain sampling per wheel already exists; the fix is in how the contacts feed the chassis pose.
