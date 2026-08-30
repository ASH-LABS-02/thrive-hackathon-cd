# The Secret Life of a Message — Design System

## Accepted concept references

- `public/assets/concepts/01-send.jpg` — hero and packetization
- `public/assets/concepts/02-city.jpg` — city network
- `public/assets/concepts/03-ocean.jpg` — undersea fiber
- `public/assets/concepts/04-datacenter.jpg` — server processing
- `public/assets/concepts/05-routing.jpg` — congestion and recovery
- `public/assets/concepts/06-arrival.jpg` — reassembly and finale

## Visual tokens

- Background: `#02070b` graphite-black
- Deep surface: `#07131b`
- Primary text: `#f1f6f8`
- Muted text: `#91a4ad`
- Cyan: `#30d9ff`
- Cyan bright: `#8deaff`
- Amber: `#ffb55e`
- Border: `rgba(151, 221, 239, 0.18)`
- Panel: `rgba(3, 13, 19, 0.72)`
- Display type: Manrope/Inter-style geometric sans-serif
- Body/UI type: Inter/system sans-serif
- Radii: 18px media, 999px circular/compact controls
- Motion: 160ms UI, 700ms section reveal, slow continuous 3D drift

## Layout rules

- Full-viewport chapter bands with a single dominant image/3D moment.
- Text occupies at most 34rem and alternates sides according to available image space.
- Avoid card grids; use open composition and a single translucent information surface only where interaction requires it.
- Navigation remains quiet: title, chapters, sound, replay.
- All text, controls, metrics, and diagrams are code-native.
- Generated imagery receives edge fades only; no color wash overlay.

## Allowed hero copy

- `Made it safely.`
- `You tap send. A hidden world wakes up.`
- `Begin the journey`
- Navigation: `Journey`, `Route lab`, `How it works`, `Sound`

## Component families

- Quiet text navigation links with cyan focus/hover state
- Circular icon controls with hairline border
- Chapter marker: two-digit index plus thin rule
- Large editorial chapter heading
- One compact glass control panel for Route Lab
- Sliders with cyan progress and amber warning state
- Minimal footer/replay ending

## Icon treatment

- Outline icons, 1.5px stroke, round joins/caps, 18–20px optical size
- Speaker/speaker-off for audio
- Arrow-down for beginning
- Rotate-counterclockwise for replay
- Pause/play only when motion controls are visible

## Responsive behavior

- Desktop is the fidelity target.
- Under 820px: images become full-height backdrops, text docks near the bottom, 3D geometry count is reduced, and Route Lab controls stack.
- Reduced-motion mode: remove canvas drift and scroll scrubbing; use opacity transitions and static concepts.
