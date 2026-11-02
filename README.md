# INTERPRETER. — 5-minute live exhibition

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

Before going on stage, run `npm run build && npm run preview`. Everything, fonts and map data included, is bundled locally, so it works without internet.

## Presenter controls

| Key | Action |
| --- | --- |
| → / Space / PageDown (clicker) | Next beat |
| ← / PageUp | Previous beat |
| 1 – 4 | Jump to chapter 01–04 |
| P | Presenter HUD (beat, timer, talking point; the timer turns red after 4:30) |
| T | Reset timer · **F** fullscreen · **Home** back to start |

Beats and talking points live in `src/presenter.js` → `BEATS` (`p` = position within the scene, `dur` = travel time in seconds). You can still scroll freely with the mouse.

## Where to edit

| What | File |
| --- | --- |
| Works (28 frames) | `src/data/works.js` |
| Name, Export Compass demo URL | `src/data/content.js` → `PROFILE`, `COMPASS` |
| NURSTYLE questions, AI answer | `src/data/content.js` → `QUESTIONS`, `AI_ANSWER` |
| Map routes | `src/data/content.js` → `DESTINATIONS` |

### Swapping in real works

1. Put the file in `public/works/`, e.g. `public/works/brand-01.jpg`
2. In `works.js`, add `src: '/works/brand-01.jpg'` to that entry, then set `ratio` to the artwork's real proportions

Layout and animation are generated from the data, so nothing else needs changing.

## Asset checklist (most important first)

| # | Asset | Spec | Notes |
| --- | --- | --- | --- |
| 1 | **Works, 20–28 pieces** (brand / packaging / graphic / AI / music covers, 4–6 per category) | JPG or WebP, **longest side 1600px**, under 400KB each; sRGB | Name files as `category-number`, e.g. `pack-03.webp`. Add a title and year for each |
| 2 | **Order of the works** | Just list the file names in order | The first few appear in the opening frame, so put your strongest pieces first |
| 3 | **Your name** (CN/EN display form) | Text | Shown in the top-right corner |
| 4 | **Export Compass demo URL** | localhost or a deployed URL | Embedded in the final window with an "Enter demo" button. If the site refuses iframes, set `openInIframe: false` |
| 5 | **NURSTYLE: real customer questions** | 12–20 entries: question / source channel / touchpoint it belongs to | The current ones are **examples written by me**. Please replace them with real data |
| 6 | **The real AI search observation** | Test query, the AI's answer (excerpt), and which page was cited | The current `AI_ANSWER` is a **mockup**. It must match what you actually observed |
| 7 | (Optional) AI works as video | MP4 (H.264), 6–10 seconds, muted, under 4MB | Set `src` to `.mp4` and it autoplays on loop |
| 8 | (Optional) Music clips | MP3, 30-second excerpt | Add `audio: '/audio/xx.mp3'`; clicking the cover plays it |
