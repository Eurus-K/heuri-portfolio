import '@fontsource-variable/inter/opsz.css'; // optical sizes: Display cut at large sizes, like SF Pro
import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/500.css';
import '@fontsource/noto-sans-tc/600.css';
import './style.css';

import Lenis from 'lenis';
import { PROFILE } from './data/content.js';
import { clamp } from './lib/util.js';
import { createOpen } from './scenes/open.js';
import { createNur } from './scenes/nur.js';
import { createMap } from './scenes/map.js';
import { createCompass } from './scenes/compass.js';
import { createPresenter } from './presenter.js';

history.scrollRestoration = 'manual';

document.getElementById('profileName').textContent = PROFILE.name;
document.getElementById('profileMeta').textContent = `${PROFILE.place} ${PROFILE.year}`;

const CHAPTERS = ['01 — Opening Gallery', '02 — Interpreter', '03 — From Experience to AI', '04 — Export Compass'];

async function boot() {
  await document.fonts.ready; // layouts measure type, (the 80/20 grid), so wait for fonts

  const sections = {
    open: document.getElementById('open'),
    nur: document.getElementById('nur'),
    map: document.getElementById('map'),
    compass: document.getElementById('compass'),
  };
  const scenes = [
    { id: 'open', el: sections.open, api: createOpen(sections.open) },
    { id: 'nur', el: sections.nur, api: createNur(sections.nur) },
    { id: 'map', el: sections.map, api: createMap(sections.map) },
    { id: 'compass', el: sections.compass, api: createCompass(sections.compass) },
  ];

  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });

  let metrics = [];
  function measure() {
    metrics = scenes.map((s) => ({ top: s.el.offsetTop, len: s.el.offsetHeight - innerHeight }));
  }
  /** absolute scroll position for a scene-local progress */
  const yFor = (id, p) => {
    const i = scenes.findIndex((s) => s.id === id);
    return metrics[i].top + clamp(p) * metrics[i].len;
  };

  const chapterLabel = document.getElementById('chapterLabel');
  const chapterIdx = document.getElementById('chapterIdx');
  const fill = document.getElementById('progressFill');
  const hint = document.getElementById('hint');
  let chapter = -1;

  function frame(force = false) {
    const y = lenis.scroll;
    let dark = false, ch = 0;
    scenes.forEach((s, i) => {
      const m = metrics[i];
      const p = clamp((y - m.top) / m.len);
      // only drive scenes that are on screen (or adjacent)
      if (y > m.top - innerHeight * 1.2 && y < m.top + m.len + innerHeight * 1.2) s.api.update(p, force);
      if (y >= m.top - innerHeight * 0.5) {
        ch = s.api.chapter(p);
        dark = s.el.classList.contains('dark');
      }
    });
    if (ch !== chapter) {
      chapter = ch;
      chapterLabel.textContent = CHAPTERS[ch];
      chapterIdx.textContent = String(ch + 1).padStart(2, '0');
    }
    document.body.classList.toggle('is-dark', dark);
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.transform = `scaleX(${y / max})`;
    hint.style.opacity = y < 40 ? 1 : 0;
  }

  function raf(t) {
    lenis.raf(t);
    frame();
    requestAnimationFrame(raf);
  }

  measure();
  frame(true);
  requestAnimationFrame(raf);

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      measure();
      scenes.forEach((s) => s.api.layout());
      frame(true);
    }, 150);
  });

  createPresenter({ lenis, yFor });
  window.__interp = { lenis, yFor, scenes };
}

boot();
