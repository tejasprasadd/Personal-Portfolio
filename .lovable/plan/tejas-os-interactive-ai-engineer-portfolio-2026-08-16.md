# TEJAS_OS — Interactive AI Engineer Portfolio

A compact, retro-futuristic interactive 3D portfolio for B R Tejas Prasad, with a fully polished 2D fallback portfolio that carries the same design language and all resume content.

## What gets built

**Boot sequence** — black screen, blinking cursor, staged system lines (INITIALIZING TEJAS_OS, LOADING AI MODULES, LOADING PROJECT ARCHIVE, CONNECTING TO PORTFOLIO WORLD), progress bar, SYSTEM READY. Skippable, and skipped automatically for returning visitors and reduced-motion users.

**Landing overlay** — name, "AI-focused Software Engineer", short intro, and three actions: Start Exploring, View Resume, Skip 3D Experience.

**One compact 3D scene** — a floating retro-futuristic lab platform in a dark void, with 7 interactive zones:

1. Central AI Core (About) — rotating, pulsing, emissive crystal that shifts color with the active section
2. Project Archive — 4 floating arcade terminals: QueANS, Motion Algorithm, Conversational RAG Multi-PDF Agent Q&A, EduLens
3. Social Signal Tower — GitHub, LinkedIn, Email, Phone
4. Experience Console — Webknot Technologies, Apex Academy
5. Education Module — RNSIT, BASE PU College
6. Skills Reactor — rotating rings of skill nodes grouped by category
7. Resume Terminal + Contact Portal

**Movement (the fun part)** — you drive a small hover-vehicle/robot with WASD/arrows: real rigid-body physics, momentum, drift, a Space boost-hop, a neon trail, and dust/spark particles on landing. The world reacts — you can bump and knock around scattered props (crates, cones, floating cubes), objects wobble and topple, and zones flare brighter as you get close. Camera smooth-follows with drag-rotate and wheel-zoom. E/Enter opens the nearby zone's holographic panel; Escape closes; R resets the scene and props. On mobile: virtual joystick + interact button, tap-to-select objects, reduced particles and effects.

**Panels** — glass panels with neon borders, pixel corner marks, CRT scan-in animation, full keyboard focus handling and ARIA labels. Every zone's content is also reachable from a top nav, so nothing requires driving.

**2D portfolio** at `/portfolio` — same tokens and type, standard sections (hero, about, experience, skills, projects, education, resume, contact). Used by Skip 3D, by WebGL failure, and by low-capability devices.

**Extras** — achievements in localStorage (SYSTEM BOOTED, FIRST CONTACT, PROJECT EXPLORER, NETWORK CONNECTED, DATA ANALYST, AI ARCHITECT), settings panel (sound, music, quality preset, reduce motion, CRT toggle, 3D/2D mode, resets), help overlay, toasts, optional audio muted by default.

**Resume** — the uploaded `AI-Tejas-Resume-July-2026.pdf` is wired as the real download/open target for the Resume Terminal and every Resume button.

## Content rules

All text comes verbatim from your prompt: projects, tech stacks, experience bullets, education, skills categories, contact details. No invented links, metrics, awards, or titles. Projects without links show no link button.

## Technical notes

- Stack: existing TanStack Start + React 19 + TypeScript + Tailwind v4.
- New deps: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `motion`, `howler`.
- The 3D scene is client-only and lazy-loaded behind a Suspense boundary (no SSR of WebGL); the 2D route is fully server-rendered so recruiters and crawlers get real HTML.
- Design tokens (the given palette, radii, glow shadows, scanline utilities) go into `src/styles.css` via `@theme inline`; fonts (Space Grotesk, JetBrains Mono, Press Start 2P) load via a `<link>` in `__root.tsx`.
- Content lives in `src/data/*.ts` with shared types in `src/types`; hooks for controls, audio, achievements, device capability; components split under `src/components/3d` and `src/components/ui`.
- Performance: quality presets, instanced particles, low-poly primitive-based models (no heavy asset downloads), capped shadows, disposal on unmount.
- SEO: per-route `head()` with your title/description, OG + Twitter tags, JSON-LD Person, retro "T_OS" favicon.

## Build order

1. Design system + data files + 2D portfolio route + nav
2. 3D scene shell: platform, camera, lights, fog, grid, particles, player + physics
3. Zones: AI Core, projects, social tower, experience, education, skills, resume, contact
4. Panels, camera transitions, audio, achievements, parallax, CRT effects
5. Mobile controls, settings, accessibility, WebGL fallback
6. Verification pass: links, content accuracy, resume download, responsiveness, performance
