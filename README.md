<div align="center">

```
  ██████╗ ██████╗ ███████╗███╗   ███╗ ██████╗ ███████╗
 ██╔════╝██╔═══██╗██╔════╝████╗ ████║██╔═══██╗██╔════╝
 ██║     ██║   ██║███████╗██╔████╔██║██║   ██║███████╗
 ██║     ██║   ██║╚════██║██║╚██╔╝██║██║   ██║╚════██║
 ╚██████╗╚██████╔╝███████║██║ ╚═╝ ██║╚██████╔╝███████║
  ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝
```

### `OBSERVATORY // ONE PROMPT, 900+ LINES`

*a 3D space tech demo vibecoded entirely by Claude Opus 4.6 — I supplied the vibe*

![lines hand written](https://img.shields.io/badge/lines_hand--written-0-7c3aed?style=flat-square&labelColor=111111)
![prompt count](https://img.shields.io/badge/prompt_count-1-7c3aed?style=flat-square&labelColor=111111)
![model](https://img.shields.io/badge/pilot-claude_opus_4.6-b794f6?style=flat-square&labelColor=111111)
![stars](https://img.shields.io/badge/stars-thousands_(webgl,_not_github)-b794f6?style=flat-square&labelColor=111111)
![boilerplate](https://img.shields.io/badge/boilerplate_edited-none-7c3aed?style=flat-square&labelColor=111111)

</div>

---

## 🔭 What is this

A fully interactive space-themed 3D web experience — live Three.js starfield,
animated mission cards, real-time observatory stats, a discoveries timeline —
generated in a single session by describing the vision and letting
**Claude Opus 4.6** write every line. No boilerplate hand-edited, no
components manually wired. One React component, 900+ lines, one prompt.

This is the prompt. The whole prompt. Typos included, as historical record:

```text
Make a fully fledged website with parallax effect and multiple animations.
You are free to choose the content and topic of the website, this is a tech demo so try to show your capability.
Use HTML + CSS + React + Vue.js + three.js + Javascript and following good engineering principles.
Make it  CSS responsive.

Take as much time as you want
```

```console
nick@observatory:~$ telescope --status
[✓] starfield rendering. missions animated. stats counting.
[i] human contribution: the prompt above and the applause after.
```

## 🌠 The experience

| | feature | what it actually does |
|---|---|---|
| 01 | **live starfield** | Three.js WebGL canvas, thousands of animated stars, full lifecycle management |
| 02 | **mission cards** | animated cards showcasing deep space missions |
| 03 | **observatory stats** | live-updating counters — discoveries, light-years, active telescopes |
| 04 | **discoveries timeline** | scrollable feed of cosmic events and findings |

**What is vibecoding?** Building software by describing what you want in
natural language and letting the model handle implementation. You steer with
intent; it handles syntax, structure, and wiring. Iteration here meant
describing what *felt off* — never editing code.

## 🚀 Run it

```bash
git clone https://github.com/nitrimandylis/cosmos.git
cd cosmos
npm install
npm run dev        # → http://localhost:5173
```

## 🔩 Under the hood

| layer | tech | job |
|---|---|---|
| UI framework | React 18 | one mega-component: `src/CosmosObservatory.jsx` |
| 3D rendering | Three.js | the starfield and its thousands of residents |
| build tool | Vite | dev server and bundling |
| AI model | Claude Opus 4.6 | wrote everything above this row |

---

<div align="center">

**[Nick Trimandylis](https://github.com/nitrimandylis)**

`THE UNIVERSE WAS GENERATED IN ONE SESSION. SO WAS THIS.`

*built with Claude Opus 4.6 via [Claude Code](https://claude.ai/code)*

</div>
