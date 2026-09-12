# Jeep overhaul + adaptive quality

## 1. Runtime quality scaler
A new auto-tuning layer measures frame time in the live scene and steps the world budget up or down on its own, so low-end phones settle into a smooth tier without the visitor touching Settings.

- Rolling FPS sampler: sustained under ~40fps drops a tier, sustained over ~55fps promotes one (with cooldown + hysteresis so it never oscillates).
- Each tier drives: render resolution (DPR cap), texture/shadow map size, LOD switch distances for trees and rocks, scatter draw distance and count, camera far plane and fog density, particle counts, and whether shadows render at all.
- Initial tier is seeded from device capabilities (cores, memory, touch, devicePixelRatio) so the first frames are already conservative on weak hardware.
- Settings keeps a manual override: "Auto" (default) plus the existing Low/Medium/High, and the HUD/settings shows the tier the scaler settled on.

## 2. New jeep model
Replace the hand-built primitive jeep with a real 3D offroad vehicle model (GLB), hosted on the CDN and loaded with a draco/meshopt-friendly loader plus a lightweight placeholder while it streams.

- Source a permissively licensed (CC0) offroad SUV/jeep GLB, upload it as a project asset, and load it via `useGLTF`.
- Keep the existing physics rig untouched: the model becomes the visual body mounted on the same chassis transform, with its four wheel nodes located by name and driven by the current steer/spin/suspension refs. If the model's wheels aren't separable, the body is used alone and wheels stay as tuned meshes matched to the model's scale and colour.
- Model scale, ride height, wheel radius and collider box are re-fitted to the new mesh so the tyres sit exactly on the terrain (no float, no sinking).
- Materials get the retro-offroad treatment: dusty roughness, tinted paint matching the site palette, headlights/roof bar emissive at low light.

## 3. Tighter turn radius
Increase steering authority so the jeep pivots noticeably harder: larger max steer angle, faster low-speed yaw rate with the existing speed-based falloff kept so it doesn't get twitchy at top speed, and slightly higher lateral grip so the nose actually follows the wheels.

## 4. Spacebar = handbrake / drift
- Space now locks the rear wheels: sharp loss of rear grip, yaw-rate boost while turning, skid marks and dust triggered as they are today.
- Jump moves to a new key (`V`, plus `Ctrl` retained as an alternate) and gets its own labelled button in the mobile control cluster; the existing handbrake key (`X`) keeps working alongside Space.
- Help overlay and the mobile control legend are updated to the new bindings.

## 5. Checkpoints closer together
Pull all 11 zones in from the current ~150-unit spread to roughly a 55–65 unit radius, keeping them well separated from each other but a short drive apart. Scatter clearing radii, minimap range, and waypoint beacon heights/scales are rescaled to match so the map still reads correctly.

## Technical notes
- Files: `src/hooks/useSettings.ts` (auto tier), new `src/hooks/useQualityScaler.ts`, `src/components/3d/Scene.tsx`, `Environment.tsx`, `Player.tsx`, `Effects.tsx`, `scatter.ts`, `zones.ts`, `Waypoints.tsx`, `src/components/experience/Minimap.tsx`, `src/hooks/useGameControls.ts`, `src/components/ui/MobileControls.tsx`, `HelpOverlay.tsx`.
- The GLB is uploaded through the asset pipeline (CDN `.asset.json` pointer), not committed as a binary.
- If no suitable CC0 jeep GLB can be fetched in-sandbox, fall back to a fully redesigned procedural jeep (sculpted bevelled body, proper glass, spare tyre, winch bumper) rather than shipping the current one.
