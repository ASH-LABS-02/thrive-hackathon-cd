# Fidelity Ledger

References inspected: `outputs/GLOBE_SECTION_CONCEPT.png`, `outputs/WOW_IMPACT_CONCEPT.png`, and the original globe screenshots supplied in the brief.
Implementation inspected from `outputs/WEBSITE_PREVIEW.png`, `outputs/GLOBE_REPLY_PREVIEW.png`, `outputs/ARRIVAL_PREVIEW.png`, and `outputs/MOBILE_PREVIEW.png`.

| Comparison point | Concept evidence | Render evidence | Result |
|---|---|---|---|
| First viewport composition | Luminous globe, open negative space, visible global routes | Headline and CTA occupy the left; the procedural globe anchors the right | Matched with intentional editorial reversal |
| Reply composition | Globe on the left with a focused story panel on the right | Direct-linked reply view resolves to the same left-globe/right-panel hierarchy | Matched |
| Palette | Graphite black with icy cyan energy | Deep navy-black, cyan atmosphere, bright packet nodes, restrained white type | Matched |
| Hero copy | Concept leaves room for code-native narrative copy | “Made it safely.”, supporting line, fact, and Begin control remain readable and native | Matched |
| Asset treatment | Artistic globe with orbiting signal paths | Fully procedural shader globe, arcs, particles, city nodes, and instanced packets | Intentional interactive adaptation |
| Motion language | Orbiting data nodes and slow planetary drift | Scroll-linked globe morph, accelerated copy reveals, live routes, and reversible chapter transitions | Matched |
| Impact moment | A focused source beacon, shockwave rings, and a few fast packet streaks | The Begin interaction triggers a DOM shockwave plus a WebGL impact pulse and tapered packet comets | Matched as a real-time adaptation |
| Typography | Editorial serif display with quiet sans-serif interface chrome | Newsreader bookends the landing and arrival while Manrope/Inter handle story and controls | Matched |
| Finale | Data resolves into one destination with a clear energy settle | Packet fragments converge into a persistent reassembly core while the general WebGL stream fades away | Matched as an arrival payoff |
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
- `The reply`
- `How it works`

No unapproved hero eyebrow, badge, metric panel, or invented CTA was added.

## Material fixes made during QA

- Added explicit React bindings after browser QA caught a blank first render.
- Lazy-loaded the WebGL engine, reducing the main gzip JavaScript bundle to approximately 112 KB.
- Optimized chapter artwork from approximately 10.6 MB to approximately 1 MB total.
- Added a directional canvas mask so live packets do not compromise text readability.
- Added reversible chapter-local scroll timelines, word-level title reveals, image depth/parallax, transition light sweeps, and velocity-reactive WebGL camera motion.
- Replaced the former landing image with the procedural globe and reused it for the global reply chapter.
- Shortened the globe scroll span and reveal timings so the handoff reads faster without becoming abrupt.
- Replaced individual packet frame loops with instanced packet streams and removed dark instance-color artifacts.
- Added reliable deep-link positioning for `#reply` and synchronized the reply panel with the globe transition.
- Added the high-impact launch choreography: initial globe assembly, source beacon, expanding shockwave, CTA flash, and tapered comet packets.
- Added a code-native reassembly animation and disabled the global canvas at arrival so it cannot collide with the finale artwork or title.
- Switched the opening and closing titles to the editorial serif treatment while preserving the original visible copy.
- Fixed mobile overflow caused by off-screen animation states while preserving the desktop transition depth.
- Corrected range input propagation and verified congestion changes from 36% to 90%, latency from 78 ms to 103 ms, and active routes from 2 to 3.
- Verified synthesized sound changes the accessible control from `Enable sound` to `Mute sound`.

No material visual mismatch remains in the verified hero, ignition flow, globe reply, arrival payoff, Route Lab, or mobile layouts.
