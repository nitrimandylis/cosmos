# Cosmos Observatory

> A tech demo built entirely through vibecoding with **Claude Opus 4.6**.

![Cosmos Observatory](https://img.shields.io/badge/Built%20with-Claude%20Opus%204.6-7c3aed?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite)

---

## What is this?

This is a fully interactive, space-themed 3D web experience — complete with a live Three.js starfield, animated mission cards, real-time observatory stats, and a discoveries timeline — generated in a single session by describing the vision and letting **Claude Opus 4.6** write every line.

No boilerplate was hand-edited. No components were manually wired together. The entire 900+ line React component emerged from a conversation.

---

## What is vibecoding?

Vibecoding is the practice of building software by describing what you want in natural language and letting an AI model handle the implementation. You steer with intent — the model handles syntax, structure, and wiring.

With Claude Opus 4.6, the results speak for themselves:

- **One prompt** → a complete, animated 3D React component
- **Zero scaffolding** → production-ready JSX with inline styles and Three.js lifecycle management
- **Natural iteration** → refinements made by describing what felt off, not by editing code

---

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 18 |
| 3D rendering | Three.js |
| Build tool | Vite |
| AI model | Claude Opus 4.6 |

---

## Running locally

```bash
git clone <this-repo>
cd cosmos
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## The experience

- **Live starfield** — Three.js WebGL canvas with thousands of animated stars
- **Mission cards** — animated cards showcasing deep space missions
- **Observatory stats** — live-updating counters for discoveries, light-years traveled, and active telescopes
- **Discoveries timeline** — scrollable feed of cosmic events and findings

---

*Generated with Claude Opus 4.6 via [Claude Code](https://claude.ai/code)*
