# The Secret Life of a Message

An interactive 3D scrollytelling website that makes internet data visible. Follow the message “Made it safely.” as it becomes packets, crosses a city, travels through an undersea fiber-optic cable, enters a data center, reroutes around congestion, and reassembles at its destination.

## Features

- Seven cinematic, full-viewport story chapters
- Real-time WebGL packet stream built with React Three Fiber
- Interactive congestion, distance, and packet-loss simulation
- Optional synthesized ambient soundscape
- Scroll, navigation, keyboard, reduced-motion, and mobile support
- Original coordinated concept artwork for every major chapter

## Stack

- React 19 + Vite
- Three.js + React Three Fiber + Drei
- Framer Motion
- Lucide React
- Custom CSS design system

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Controls

- Scroll or use the chapter rail to travel through the story.
- Use **Route Lab** sliders to change congestion, distance, and packet loss.
- Use the header sound button to enable or mute ambience.
- Use the pause button to stop continuous 3D motion.
- Replay from the final chapter or footer.

## Project structure

```text
public/assets/concepts/  Generated chapter artwork
src/App.jsx              Story structure, state, sound, and interactions
src/JourneyCanvas.jsx    WebGL packet system
src/data.js              Chapter content
src/index.css            Design system and responsive presentation
outputs/                 Planning and design documentation
```

## Notes

- No API keys are required.
- Sound is synthesized locally with the Web Audio API and stays off until enabled.
- Chapter timings are illustrative; real latency varies by route and network conditions.
- The concept artwork was generated for this project and contains no third-party logos.
