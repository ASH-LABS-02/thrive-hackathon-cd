# Visualizing the Invisible: The Secret Life of a Message

## 1. Chosen challenge

**Invisible phenomenon:** How data travels through the internet.

**Core experience:** A cinematic, scroll-driven 3D website follows one ordinary message from a phone to its recipient. The message becomes packets, enters a router, travels as light through fiber, crosses the ocean, passes through a data center, survives congestion and security checks, and is reconstructed on another device.

**Working title:** **The Secret Life of a Message**  
**Tagline:** *You tap Send. A hidden world wakes up.*

The experience should feel educational, surprising, and physically believable—not like a generic neon “cyberspace” page.

## 2. Project goal

Build a responsive, accessible, high-performance 3D scrollytelling website that explains internet data movement in roughly three minutes of exploration.

Success criteria:

- A viewer understands packets, routers, fiber optics, undersea cables, servers, latency, routing, encryption, and reassembly.
- The 3D journey feels continuous from the first scroll to the final message delivery.
- The site remains usable on mobile and on devices that cannot run advanced WebGL.
- Motion supports the explanation rather than distracting from it.
- All visible text and controls remain native HTML for accessibility.

## 3. Audience and tone

- Audience: students, educators, non-technical viewers, and hackathon judges.
- Tone: cinematic wonder with scientific clarity.
- Visual direction: artistic-scientific, leaning slightly more artistic than realistic. Use a near-black environment, electric cyan data light, warm amber human-world highlights, translucent glass, believable fiber and hardware materials, and elegant spatial exaggeration where it improves comprehension.
- Avoid: Matrix-style code rain, excessive HUD overlays, unreadable sci-fi typography, random particles, and decorative motion without meaning.

## 4. Story architecture

### Chapter 0 — The Send

A phone floats in a quiet dark room. A short message is typed and the Send button is pressed. The camera dives into the phone as the message breaks into luminous numbered packets.

**Teaching point:** Digital information is divided into small packets.

### Chapter 1 — The Home Network

Packets travel as pulses from the device to a Wi-Fi router. The router reads address information and opens a route outward.

**Teaching point:** A router directs traffic; Wi-Fi is only the first short hop.

### Chapter 2 — The City Network

The camera exits the home and reveals a stylized cutaway city. Thousands of faint paths pulse beneath streets. Our packet stream joins a larger network.

**Teaching point:** Local networks connect to an internet service provider and shared infrastructure.

### Chapter 3 — Light Beneath the Ocean

The city folds into a globe. A route illuminates across the sea, then the camera dives underwater beside a fiber-optic cable. Data becomes rapid pulses of light inside glass strands.

**Teaching point:** Most international internet traffic travels through undersea fiber cables, not satellites.

### Chapter 4 — The Data Center

The packet stream enters a vast server hall. A sectioned server rack reveals switching, routing, authentication, and server response as a clean spatial sequence.

**Teaching point:** Servers process requests and return data; encryption protects content while routing metadata guides delivery.

### Chapter 5 — Traffic, Delay, and Recovery

Several paths appear. One becomes congested; packets reroute. A packet is lost and resent. A small latency meter changes as route length and congestion change.

**Teaching point:** Packets may take different paths, arrive out of order, or be retransmitted.

### Chapter 6 — Reassembly

At the destination device, numbered packets snap back into order and reconstruct the message. The recipient sees it. The camera pulls back to reveal the full route glowing across Earth.

**Teaching point:** The receiving device reassembles packets into the original content.

### Finale — The Invisible Network

The single path expands into millions of delicate global connections. Final line: **“One tap. Thousands of decisions. A journey completed in milliseconds.”**

## 5. Page structure

1. Minimal fixed navigation: title, Chapters, How It Works, Accessibility, Replay.
2. Full-viewport 3D canvas pinned during the core story.
3. Scroll chapters with short explanatory copy and progressive diagrams.
4. Interactive “Route Lab” allowing the viewer to toggle congestion, packet loss, and distance.
5. Technical explainer with a compact packet anatomy diagram.
6. Sources/methodology section.
7. Credits and replay control.

## 6. Interaction and animation specification

### Global motion system

- Scroll is the primary timeline; scrolling backward reverses the sequence cleanly.
- Use a damped scroll progress value to avoid jitter.
- Camera motion uses long Bézier paths with gentle easing; no sudden spins.
- Crossfade environments while preserving one continuous packet stream as the visual anchor.
- Desktop/laptop is the primary presentation target at 60 fps. Mobile receives a functional simplified version with reduced geometry, particles, post-processing, and camera travel; exact visual parity is not required.
- Respect `prefers-reduced-motion`: replace camera travel with dissolves and step-based illustrations.

### Signature animations

| Moment | Animation | Purpose |
|---|---|---|
| Send | Button press emits a single cyan pulse | Establish cause and effect |
| Packetization | Message surface separates into 8–12 numbered light blocks | Explain packet splitting |
| Router hop | Packets bend along a curved route; ports light sequentially | Show routing decision |
| City reveal | Room walls dissolve into a city cutaway | Scale transition |
| Fiber travel | Camera follows light pulses through transparent glass strands | Reveal the physical medium |
| Ocean crossing | Parallax marine particles and cable repeater pulses | Communicate distance |
| Data center | Server aisle lights chase toward the active rack | Guide attention |
| Congestion | Packets queue, slow, then split across alternate paths | Demonstrate dynamic routing |
| Packet loss | One packet fades; a return signal triggers retransmission | Explain reliability |
| Reassembly | Out-of-order blocks magnetically align into the message | Complete the mental model |
| Finale | Single route expands into a restrained global network | Reveal global scale |

### Microinteractions

- Hovering a packet pauses it and reveals source, destination, sequence number, size, and latency.
- Clicking an info marker opens a native HTML side panel while keeping the 3D scene visible.
- Route Lab sliders update the path, queue length, and latency number in real time.
- A chapter rail shows progress without competing with the scene.
- Keyboard controls: arrow keys for chapters, Space to pause animation, R to replay.

## 7. Technical architecture

**Recommended stack**

- React + Vite + TypeScript
- React Three Fiber and Drei for Three.js scene composition
- GSAP ScrollTrigger or Framer Motion scroll values for the master timeline
- Tailwind CSS for accessible interface styling
- Zustand for lightweight scene and interaction state
- Blender for optimized GLB models and baked textures
- Draco + Meshopt compression; KTX2/Basis textures
- Howler only if optional spatial audio is added

**Component plan**

- `AppShell`: navigation, progress, accessibility controls
- `StoryCanvas`: renderer, camera rig, lighting, post-processing
- `ScrollDirector`: normalized chapter timeline and reversible transitions
- `PacketSystem`: instanced packet geometry and route following
- `EnvironmentStage`: room, city, ocean, data center, destination
- `ChapterOverlay`: HTML copy, diagrams, and citations
- `RouteLab`: interactive simulation controls and computed latency
- `ReducedMotionStory`: non-WebGL/low-motion fallback

**Performance budget**

- Initial JavaScript: ideally below 250 KB gzip excluding lazily loaded 3D engine chunks.
- Initial visible assets: below 2 MB.
- Total compressed 3D assets: target 8–12 MB, loaded chapter-by-chapter.
- Maximum texture size: 2K desktop, 1K mobile for most surfaces.
- Use instancing for packets, lights, server rows, and repeated city elements.
- Avoid real-time shadows on mobile; use baked ambient occlusion and light maps.

## 8. Asset inventory

### Essential 3D assets

| ID | Asset | Format | Notes | Creation tool |
|---|---|---|---|---|
| M01 | Modern smartphone | GLB | Separate screen and Send button meshes | Blender or Meshy, finalized in Blender |
| M02 | Home Wi-Fi router | GLB | 4–6 distinct ports and emissive indicators | Blender or Meshy |
| M03 | Modular room cutaway | GLB | Minimal furniture; walls able to dissolve/hide | Blender |
| M04 | Stylized city cutaway kit | GLB | Buildings, roads, underground conduits | Blender Geometry Nodes |
| M05 | Fiber-optic cable cutaway | GLB | Outer layers and visible glass core | Blender |
| M06 | Undersea cable repeater | GLB | Scientifically plausible, simplified | Blender |
| M07 | Earth/globe | GLB | Low-poly sphere; geographic texture separate | Blender + NASA public data |
| M08 | Modular server rack | GLB | Removable panels and emissive status lights | Blender or Meshy |
| M09 | Data-center aisle kit | GLB | Instanced rack modules | Blender |
| M10 | Destination device | GLB | Screen must match the source message | Reuse/variant of M01 |

### Generated raster assets

| ID | Asset | Size/aspect | Role | Recommended tool |
|---|---|---|---|---|
| I01 | Full visual-direction concept board | 16:9, 4K | Align palette, materials, lighting, and tone | OpenAI Image Generation |
| I02 | Chapter 0 room/phone concept | 16:9, 4K | Composition and lighting reference | OpenAI Image Generation |
| I03 | City-network cutaway concept | 16:9, 4K | Spatial layout reference | OpenAI Image Generation |
| I04 | Undersea fiber journey concept | 16:9, 4K | Ocean and cable look reference | OpenAI Image Generation |
| I05 | Data-center concept | 16:9, 4K | Server architecture and light rhythm | OpenAI Image Generation |
| I06 | Reassembly/finale concept | 16:9, 4K | Destination and global pullback | OpenAI Image Generation |
| I07 | WebGL fallback hero poster | 16:9, 4K | Low-power/mobile fallback | OpenAI Image Generation |
| I08 | Social/share preview | 1.91:1 | Open Graph image | OpenAI Image Generation |
| T01 | Subtle room roughness texture | 2K seamless | PBR material support | Adobe Substance 3D Sampler or Material Maker |
| T02 | Ocean particulate/noise texture | 2K seamless | Low-cost atmosphere | Material Maker |
| T03 | Brushed server metal texture | 2K seamless | PBR material support | Adobe Substance 3D Sampler |
| T04 | Earth night-lights map | 2K–4K | Globe emissive layer | NASA Earth Observatory public imagery |

### Code-native assets

- Packet blocks, route splines, pulses, queues, address labels, and connection lines.
- Icons, chapter progress, diagrams, tooltips, buttons, graphs, and all typography.
- Simple particles and light trails created with instanced geometry/shaders.
- Do not generate UI screenshots or text inside images.

### Optional audio assets

| ID | Asset | Role | Tool |
|---|---|---|---|
| A01 | Low ambient electrical bed | Continuous atmosphere | ElevenLabs Sound Effects, Adobe Audition, or licensed library |
| A02 | Packet pulse suite | Send, route, split, arrive | ElevenLabs Sound Effects or custom synthesis |
| A03 | Ocean/data-center transition | Chapter transition | Custom synthesis |

Audio is part of the intended experience: restrained electrical ambience, packet pulses, low-frequency transitions, and a satisfying arrival cue. It must still be muted by default until the user enables it.

## 9. Copy/paste prompts for generated assets

Use the same visual DNA in every prompt: **near-black graphite world, electric cyan data light, restrained warm amber human light, realistic glass and metal, volumetric atmosphere, scientific clarity, premium cinematic 3D render, no visible text, no logos, no watermark.**

### I01 — Visual-direction concept board

```text
Use case: stylized-concept
Asset type: visual direction board for a premium interactive 3D educational website
Primary request: create a cohesive cinematic visual system for “The Secret Life of a Message,” showing one data message traveling from a smartphone through a home router, a city network, an undersea fiber-optic cable, a data center, and into a destination phone
Scene/backdrop: a coordinated sequence of six clean widescreen environments presented as a professional art-direction board, with consistent scale, materials, and lighting
Subject: luminous numbered data packets as the continuous visual motif
Style/medium: high-end physically based 3D visualization, scientific realism with restrained cinematic abstraction
Composition/framing: clear, spacious compositions suitable for reconstruction as interactive WebGL scenes; one obvious focal path per environment
Lighting/mood: near-black graphite atmosphere, electric cyan data light, subtle warm amber human-world highlights, soft volumetric haze
Materials/textures: realistic glass fiber, brushed dark metal, matte architectural surfaces, subtle ocean particulates
Constraints: no visible words, no UI, no logos, no watermark; avoid code rain, fantasy portals, clutter, excessive bloom, purple cyberpunk, and impossible hardware
```

### I02 — The Send

```text
Use case: stylized-concept
Asset type: 16:9 chapter concept for a scroll-driven 3D website
Primary request: a modern smartphone floating in a quiet dark bedroom at night, viewed from a close three-quarter angle; a single cyan pulse leaves the Send button while a short message begins separating into small luminous numbered packet blocks
Scene/backdrop: minimal bedroom suggested by soft silhouettes and warm practical light, with ample negative space
Style/medium: premium cinematic 3D render, physically based materials, realistic glass screen and anodized metal
Composition/framing: phone centered slightly right, packet trajectory leading into depth, camera path clearly readable
Lighting/mood: warm amber room light contrasted with precise electric cyan data glow, calm wonder
Constraints: no readable screen text, no logos, no watermark, no hands, no floating decorative UI, no exaggerated bloom
```

### I03 — City network cutaway

```text
Use case: scientific-educational
Asset type: 16:9 spatial concept for an interactive WebGL chapter
Primary request: a cinematic cutaway of a modern city at night revealing fiber routes beneath streets and inside buildings; one bright cyan packet stream leaves a home router, joins a neighborhood hub, and enters a larger network trunk
Style/medium: high-end architectural 3D visualization with scientifically clear routing paths
Composition/framing: wide oblique aerial view, layered depth, one dominant route, buildings simplified enough for real-time reconstruction
Lighting/mood: graphite city, sparse warm windows, cyan network light, subtle mist
Constraints: no labels, no text, no logos, no futuristic flying vehicles, no code rain, no dense HUD, no visual clutter
```

### I04 — Undersea light

```text
Use case: scientific-educational
Asset type: 16:9 cinematic concept for an undersea fiber-optic WebGL scene
Primary request: camera traveling beside a realistic submarine telecommunications cable on the ocean floor, with a clean cutaway revealing glass fibers carrying rapid cyan and white light pulses; a plausible repeater sits farther along the cable
Scene/backdrop: deep ocean, dark blue-black water, restrained particulate matter, gently contoured seabed
Style/medium: photorealistic premium 3D scientific visualization
Composition/framing: strong forward-leading cable line, clear view of cable layers and luminous glass core, generous darkness around the subject
Lighting/mood: mysterious but factual, cyan pulses illuminating nearby particles, subtle caustics
Constraints: no fish swarm, no diver, no submarine, no text, no logos, no magical energy, no excessive lens flare
```

### I05 — Data center

```text
Use case: stylized-concept
Asset type: 16:9 data-center chapter concept for an interactive 3D website
Primary request: a vast modern data-center aisle with dark server racks; one cyan packet stream enters the aisle, status lights activate in sequence, and a selected rack opens into a clean layered cutaway showing switching, security verification, processing, and response routing
Style/medium: premium physically based 3D render, realistic enterprise hardware simplified for educational clarity
Composition/framing: symmetrical aisle with a strong vanishing point, selected rack as the focal destination, ample space for HTML explanation beside the scene
Lighting/mood: cool controlled environment, subtle white ceiling light, precise cyan signals, restrained amber warnings
Constraints: no readable brand marks, no text baked into scene, no people, no holographic dashboards, no excessive LEDs, no watermark
```

### I06 — Reassembly and finale

```text
Use case: stylized-concept
Asset type: 16:9 final chapter concept for a scroll-driven 3D educational website
Primary request: numbered luminous packets arrive out of order at a destination smartphone, then align and reconstruct into a single message surface; behind the phone, the camera perspective opens toward Earth with one delicate illuminated route expanding into a restrained global network
Style/medium: cinematic premium 3D visualization, elegant scientific abstraction
Composition/framing: destination phone in the foreground, reassembly clearly readable, Earth and global connections revealed gradually in the background
Lighting/mood: satisfying and hopeful, cyan route light with gentle warm human illumination
Constraints: no readable message text, no logos, no UI labels, no dense connection web, no explosive effects, no watermark
```

### I07 — Fallback hero poster

```text
Use case: stylized-concept
Asset type: responsive website fallback hero image, 16:9 landscape
Primary request: one luminous data packet traveling along a glass fiber path that visually connects a smartphone silhouette on the left to a distant glowing city and Earth curvature on the right
Style/medium: premium cinematic 3D render, scientifically grounded, minimal and spacious
Composition/framing: central sweeping route with safe negative space in the upper center and left for code-native headline and controls; image must crop safely to 4:5 mobile
Lighting/mood: near-black graphite, electric cyan data light, restrained warm amber highlights
Constraints: no text, no logos, no watermark, no UI, no purple cyberpunk, no code rain, no clutter, no heavy color overlay
```

### I08 — Social preview

```text
Use case: ads-marketing
Asset type: 1.91:1 social share preview without baked-in text
Primary request: a cinematic smartphone releasing luminous cyan data packets into a transparent fiber-optic path that curves around Earth, summarizing the hidden journey of an internet message
Style/medium: premium minimal 3D render, realistic glass and metal, scientific wonder
Composition/framing: bold single focal path, readable at thumbnail size, leave the left-center area calm for optional code-added title
Lighting/mood: near-black background, crisp cyan light, subtle warm amber accent
Constraints: no text, no logos, no watermark, no small details, no clutter, no excessive bloom
```

## 10. 3D model generation briefs

AI-generated models should be treated as blockouts. Retopology, UV cleanup, material rebuilding, pivot correction, and optimization must happen in Blender before use.

### Smartphone model brief

```text
Create a realistic unbranded modern smartphone for real-time WebGL. Clean rounded rectangular silhouette, black glass front, dark anodized aluminum frame, minimal rear camera geometry. Separate meshes for screen glass, body, camera, and a small interactive Send-button surface. No logos, no engraved text. Quad-based clean topology, UV unwrapped, PBR-ready, centered origin, real-world scale, under 25k triangles after optimization.
```

### Router model brief

```text
Create an unbranded contemporary home Wi-Fi router for a real-time educational WebGL scene. Matte graphite body, two subtle antennas, separate meshes for status LEDs, power port, WAN port, and four LAN ports. Hardware must look plausible and restrained, not futuristic. No logos or text. Clean UVs, PBR-ready, real-world scale, under 20k triangles.
```

### Server rack model brief

```text
Create a modular unbranded enterprise server rack for real-time WebGL. Dark perforated metal cabinet, removable front and side panels, repeated server modules, separate emissive status-light meshes, visible switch and cable-management region. Plausible proportions, no readable labels, no logos. Optimized topology, atlas UVs, real-world scale, under 45k triangles for one hero rack; provide a lower-detail repeated version under 10k triangles.
```

### Fiber cable model brief

```text
Create a scientifically plausible submarine fiber-optic cable cutaway for real-time 3D. Show outer polyethylene jacket, protective steel wire layers, copper tube, inner buffer, and multiple transparent glass fibers. Use separate concentric meshes so layers can animate apart. No labels or text. Clean topology, curve-friendly construction, PBR materials, under 30k triangles.
```

## 11. Recommended production tools

| Need | Primary choice | Alternative | Why |
|---|---|---|---|
| Visual concepts and fallback posters | OpenAI Image Generation | Midjourney | Strong art-direction iteration and asset briefing |
| 3D blockout generation | Meshy | Tripo AI | Fast starting geometry for props |
| Final modeling/optimization | Blender | Cinema 4D | Precise topology, UVs, baking, animation, export |
| PBR texture authoring | Substance 3D Painter/Sampler | Material Maker | Reliable real-time material workflow |
| Website 3D | React Three Fiber | Vanilla Three.js | React-native scene structure and ecosystem |
| Scroll choreography | GSAP ScrollTrigger | Framer Motion | Precise pinning, scrubbing, and reversible timelines |
| Compression | glTF Transform + Draco/Meshopt + KTX2 | Blender export tools | Web delivery and progressive loading |
| Sound effects | ElevenLabs SFX | Licensed library/custom synthesis | Fast tailored sound cues |
| QA | In-app browser + performance profiler | Playwright | Visual, responsive, interaction, and performance checks |

## 12. Asset folder structure

```text
public/
  assets/
    models/
      phone.glb
      router.glb
      room.glb
      city-kit.glb
      fiber-cable.glb
      repeater.glb
      server-rack-hero.glb
      server-rack-lod.glb
      earth.glb
    textures/
      room/
      ocean/
      server/
      earth/
    images/
      concepts/
      fallback/
      social/
    audio/
      ambience/
      cues/
src/
  components/
  scenes/
  shaders/
  story/
  data/
  styles/
```

## 13. Production phases

### Phase 1 — Direction approval

- Approve the title, story, and visual direction.
- Generate I01–I06 as section-specific concepts.
- Review every concept for continuity and WebGL feasibility.
- Lock the design system, camera language, and allowed copy.

### Locked creative decisions

- **Style balance:** artistic-scientific, approximately 65% artistic and 35% realistic.
- **Message treatment:** use a short readable human message—recommended copy: **“Made it safely.”** It appears when sent, fragments into abstract packets during transit, and becomes readable again only after reassembly.
- **Sound:** include optional cinematic ambient sound and synchronized data cues.
- **Performance priority:** desktop/laptop first; mobile receives a simplified fallback experience.
- **Human presence:** use a hand pressing Send at the opening and a subtle recipient reaction at the end. Keep the network chapters free of people so scale and data motion stay clear.
- **Branding:** no school, event, or team logo is required at this stage.

### Phase 2 — Prototype

- Build a gray-box scroll prototype using simple geometry.
- Validate chapter timing, camera comfort, transitions, and mobile behavior.
- Test the Route Lab logic before producing detailed assets.

### Phase 3 — Asset production

- Model and optimize M01–M10.
- Create and bake PBR textures.
- Produce fallback images and social preview.
- Validate every GLB independently in a web viewer.

### Phase 4 — Final implementation

- Replace gray-box objects chapter by chapter.
- Add packet shaders, route splines, lighting, and UI overlays.
- Add accessibility, keyboard navigation, fallback mode, and optional sound.

### Phase 5 — QA and submission

- Test desktop, tablet, and mobile.
- Test slow network, WebGL failure, reduced motion, keyboard navigation, and screen-reader order.
- Profile load time, memory, frame rate, and long-task blocking.
- Record the final walkthrough and prepare the README, sources, and deployment.

## 14. Decisions resolved before concept generation

1. **Visual style:** a mix of scientific realism and artistic interpretation, leaning more artistic.
2. **Message:** recommended readable copy is “Made it safely.”; the meaning of this choice is recorded in the locked decisions above.
3. **Audio:** yes, include optional cinematic ambience and synchronized effects.
4. **Target hardware:** prioritize capable laptops/desktops rather than strict ordinary-phone parity.
5. **Human presence:** use it selectively wherever it strengthens the experience.
6. **Required branding:** none.

## 15. Assets needed from you

No personal photographs are required for the recommended device-only direction. Please provide only the following if they apply:

- Event/school/team logo in SVG or transparent PNG.
- Exact team name and contributor names.
- Any mandatory challenge branding, color palette, or submission text.
- Required source/citation format.
- Any licensed music or sound you specifically want used.
- Reference websites or 3D styles you want us to match.

If none apply, all visual concepts can be created from the prompts above, all interface graphics can be code-native, and the 3D objects can be produced from the model briefs.
