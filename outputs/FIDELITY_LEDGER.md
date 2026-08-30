# Fidelity Ledger

Reference inspected: `public/assets/concepts/01-send.jpg` at its native 1680×945 composition.  
Implementation inspected from `outputs/WEBSITE_PREVIEW.png` at the browser’s 1264×720 viewport.

| Comparison point | Concept evidence | Render evidence | Result |
|---|---|---|---|
| First viewport composition | Dark negative space on the left; phone, hand, and packet arc on the right | Headline and CTA sit in the left negative space; hero subject remains dominant on the right | Matched |
| Palette | Graphite black, cyan signal, restrained amber bedside light | Exact black/cyan/amber relationship retained without a color wash | Matched |
| Hero copy | Concept intentionally reserves space for code-native copy | “Made it safely.”, supporting line, fact, and Begin control remain readable and native | Matched |
| Asset treatment | Full-bleed cinematic image with no tint | Full-bleed background uses edge fades only; no overlay wash | Matched |
| Motion language | Packet arc, pulse, and slow camera implication | Live WebGL packet cubes, route curves, particles, and chapter scroll transitions extend the same motif | Matched |
| Navigation and controls | Quiet chrome and circular control treatment | Minimal centered nav plus circular pause/sound controls | Matched |
| Container model | Open editorial canvas, no card grid | Chapters remain open/full-bleed; only the functional Route Lab uses one glass panel | Matched |
| Responsive behavior | Desktop-first spatial composition | 390×844 test stacks copy near the bottom, removes overflow, hides nonessential navigation, and reduces 3D interference | Intentional responsive adaptation |

## Above-the-fold copy diff

Allowed and present:

- `Made it safely.`
- `You tap send. A hidden world wakes up.`
- `Begin the journey`
- `Journey`
- `Route lab`
- `How it works`

No unapproved hero eyebrow, badge, metric panel, or invented CTA was added.

## Material fixes made during QA

- Added explicit React bindings after browser QA caught a blank first render.
- Lazy-loaded the WebGL engine, reducing the main gzip JavaScript bundle to approximately 112 KB.
- Optimized chapter artwork from approximately 10.6 MB to approximately 1 MB total.
- Added a directional canvas mask so live packets do not compromise text readability.
- Added reversible chapter-local scroll timelines, word-level title reveals, image depth/parallax, transition light sweeps, and velocity-reactive WebGL camera motion.
- Fixed mobile overflow caused by off-screen animation states while preserving the desktop transition depth.
- Corrected range input propagation and verified congestion changes from 36% to 90%, latency from 78 ms to 103 ms, and active routes from 2 to 3.
- Verified synthesized sound changes the accessible control from `Enable sound` to `Mute sound`.

No material visual mismatch remains in the verified hero, Route Lab, or mobile layouts.
