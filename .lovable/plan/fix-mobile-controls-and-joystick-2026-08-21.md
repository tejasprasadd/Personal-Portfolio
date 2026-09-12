# Fix mobile controls and joystick

On phones the joystick and action buttons don't drive the jeep. Three causes in the current code:

1. The joystick pad and buttons have no `touch-action: none`. The browser treats the drag as a page scroll/pan gesture and fires `pointercancel`, so steering stops immediately after touch-down.
2. The control layer is hidden below `md` only by CSS (`md:hidden`), but the touch check that renders it is `pointer: coarse`. On tablets and coarse-pointer laptops the controls mount but are invisible — no controls at all.
3. The action buttons (Boost / Drift / Hop / Open) rely on `onPointerUp` / `onPointerLeave` on the button itself. If the finger slides off before lift, the flag stays stuck on (permanent boost/handbrake).

## What changes

- Add `touch-action: none` and `user-select: none` to the joystick pad, knob and action buttons so touch drags reach the app instead of the browser's scroll gesture.
- Release the joystick on `lostpointercapture` as well as up/cancel, and ignore secondary pointers so a second finger doesn't reset steering.
- Make Boost / Drift / Hop latch off on a global `pointerup` / `pointercancel`, not just on the button, so flags never stick.
- Show the touch controls whenever the device is touch-capable (drive visibility from the same capability flag that mounts them, instead of the `md:hidden` breakpoint), and keep the desktop keyboard hint hidden in that case.
- Prevent the camera-drag handler in the 3D scene from reacting to touches that started on the control overlay, so joysticking doesn't also swing the camera.
- Verify on a mobile viewport in the preview that forward/turn respond and the buttons release cleanly.

## Technical notes

Files: `src/components/ui/MobileControls.tsx` (touch-action, pointer capture/release, global release listeners, visibility), `src/routes/index.tsx` (pass touch flag / render condition), `src/components/3d/Scene.tsx` (skip camera drag when the pointer target is inside the control overlay). No changes to physics or game logic.
