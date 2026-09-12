# Tejas — An engineer’s playground

Public Site: https://tejas-playground.tejasprasad43.chatgpt.site

## Audit and design

The original project uses React 19, Vite 8, TanStack Start, Tailwind 4, Three.js, React Three Fiber, Drei, Rapier and Motion. It already contained real raycast vehicle physics, but a full-screen boot/intro hid the world. Variable physics timesteps, brake-force/impulse confusion, invisible lower-quality colliders, and Lovable-specific model/resume URLs reduced usability and portability.

The upgrade keeps portfolio content, projects, experience, education, skills, contact links, resume, achievements, settings, audio, and the standard `/portfolio` route. The first viewport now shows the island directly; driving is optional and project cards remain available without WebGL. The visual palette uses sage `#dbe6dd`, pine `#253e35`, parchment `#f6f7ef`, clay `#bf6745`, and moss `#769f78`. Space Grotesk handles headings and body, DM Serif Display a restrained italic accent, and JetBrains Mono labels and instrumentation.

## Updated modules

- `src/routes/index.tsx`: accessible landing, optional driving mode, destination navigation, minimap, telemetry and preserved panels/settings/achievements.
- `src/components/playground/`: modular project presentation, vector fallback and render error boundary.
- `src/components/3d/Scene.tsx`: lazy canvas, generated PMREM environment map, filtered directional shadows, camera orbit/zoom, visibility suspension and local audio.
- `src/components/3d/Island.tsx`: original procedural island, instanced trees, collidable landmarks, ramp, movable crates and bouncy balls.
- `src/components/3d/JeepModel.tsx`: original procedural rover with suspension-aligned wheels; no external GLB.
- `src/components/3d/vehiclePhysics.ts`: shared, testable Rapier controller setup, analogue throttle, speed-sensitive steering, boost and impulse-correct brakes.
- `src/components/3d/Player.tsx`: fixed-step controller integration, sprung wheels, hop, skid/dust/impact effects, flip and edge recovery.
- `src/hooks/useGameControls.ts`, `src/components/ui/MobileControls.tsx`: overlay/visibility clearing and independent touch releases.
- `src/components/ui/HoloPanel.tsx`: native modal focus containment, Escape handling and focus restoration.
- `src/hooks/useSettings.ts`, `src/hooks/useDeviceCapabilities.ts`: system reduced motion, opt-in sound, WebGL2 and low-power detection.
- `src/hooks/useAchievements.ts`: side effects moved outside React state updaters to prevent duplicate notifications.
- `src/styles.css`, `src/data/portfolio.ts`: shared visual system and matching project accents.
- `src/routes/portfolio.tsx`, `src/routes/__root.tsx`, sitemap and robots: preserved standard route, typography and public Site metadata.
- `src/lib/resume.ts`, `public/AI-Tejas-Resume-July-2026.pdf`: verified local copy of the existing public resume.
- `vite.config.ts`, `scripts/prepare-hosting.mjs`: Cloudflare-compatible output while preserving Lovable/TanStack architecture.

## Controls

WASD / arrows drive, Shift boosts, Space / X handbrakes, V / left Control hops, E interacts, R resets rover and props, M toggles sound, and Escape dismisses panels. Drag the scene to orbit. In driving mode, scroll to zoom. Touch devices get a joystick and action buttons. All content is also available through the destination navigation and `/portfolio`.

## Performance tradeoffs

The target is 60 fps, not a hardware-independent guarantee. Physics advances at fixed 1/60-second steps with interpolated rigid bodies. Trees use instancing and retain collidable silhouettes across detail tiers. DPR is capped at 1.5 on high and 1 on medium/low. Shadow maps are 2048 on high, 1024 on medium, and disabled on low; low quality also omits dust/skid/debris. Mobile tree geometry is simpler. The world pauses behind panels/offscreen and on hidden tabs. No postprocessing or remote HDR/GLB assets are required. System reduced motion disables decorative 3D and scroll entrance motion; low-power devices default to an SVG illustration with optional 3D.

Rapier's WebAssembly-containing lazy chunk is approximately 842 KB gzipped; the lazy 3D scene chunk approximately 253 KB gzipped in the validated build. Those downloads buy actual sprung-wheel physics and collision simulation. The ordinary content renders first and the 3D path is not mounted on unsupported or default low-power devices. Fonts load with `display=swap` and have system fallbacks.

## Validation and local use

No new packages were required; the existing dependencies were installed using the existing Bun lockfile.

```sh
bun install
bun run dev
bun run check
bun test
bun run build
```

Four executable physics tests (12 assertions) cover grounded suspension, analogue acceleration/braking/reverse, momentum transfer to a crate, and equivalent trajectories with 30/60 fps render schedules. TypeScript and the production build pass. Browser checks cover desktop/mobile layout, entering driving mode, opening a project, Escape and restored focus. The resume is a valid PDF. Broad real-device GPU benchmarking is still necessary before claiming a universal 60 fps.

Source archives exclude dependencies, builds, Git internals, environment files and credentials. Site credentials are never stored in source. The local `.env` is unchanged and not published as source.
