/**
 * 01 OPENING GALLERY → 02 INTERPRETER. → 80/20
 *
 * One pinned stage, one progress value p (0..1). Every frame is a pure
 * function of p, so scrubbing backwards on stage is always safe.
 *
 *  0.00 ─ 0.38  FLIGHT     camera travels through a 3D field of works
 *  0.38 ─ 0.50  SORT       every work lands on one plane: a contact sheet
 *  0.50 ─ 0.66  CONVERGE   80% dissolve first, the key 20% fold into one square
 *  0.66 ─ 0.76  INTERPRETER.   the square becomes the full stop
 *  0.76 ─ 1.00  80/20      the full stop unfolds into 100 cells; 20 remain
 */
import { WORKS, CATEGORIES } from '../data/works.js';
import { clamp, lerp, range, ease, rng, fx } from '../lib/util.js';

const P = 1000; // CSS perspective (px)
const CAT_ORDER = ['BRAND', 'PACK', 'PRINT', 'AI', 'MUSIC'];
const WORD = 'INTERPRETER';

export function createOpen(root) {
  const $ = (s) => root.querySelector(s);
  const world = $('#world');
  const vp3d = $('#viewport3d');
  const intro = $('#intro');
  const bracket = $('#bracket');
  const caption = $('#caption');
  const sheetLabel = $('#sheetLabel');
  const interp = $('#interp');
  const dotEl = $('#interpDot');
  const lettersEl = $('#interpLetters');
  const subEls = [...root.querySelectorAll('.interp__sub > *')];
  const pareto = $('#pareto');
  const pGrid = $('#paretoGrid');
  const pTextEls = [...root.querySelectorAll('.pareto__text > *')];
  const cap = { idx: $('#capIdx'), title: $('#capTitle'), year: $('#capYear'), cat: $('#capCat') };

  // ── letters ───────────────────────────────────────────────
  const letters = [...WORD].map((ch) => {
    const w = document.createElement('span');
    w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.04em';
    const s = document.createElement('span');
    s.textContent = ch;
    s.style.transform = 'translateY(110%)';
    w.appendChild(s);
    lettersEl.appendChild(w);
    return s;
  });

  // ── works ─────────────────────────────────────────────────
  const r = rng(11);
  const order = [...WORKS].sort(
    (a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat),
  );
  let keyCount = 0;
  const items = WORKS.map((w, i) => {
    const el = document.createElement('div');
    el.className = `work work--${w.cat.toLowerCase()}`;
    el.style.setProperty('--tone', w.tone);
    el.style.setProperty('--ph-ink', isLight(w.tone) ? '#121211' : '#efeee9');
    el.dataset.id = w.id;
    el.innerHTML = `
      <div class="work__media">${media(w, i)}</div>
      ${w.cat === 'MUSIC' ? '<span class="work__disc"></span>' : ''}
      <div class="work__ink"></div>
      <div class="work__label">${String(i + 1).padStart(2, '0')} ${CATEGORIES[w.cat].en}</div>`;
    world.appendChild(el);
    if (w.cat === 'MUSIC') el.addEventListener('click', () => toggleMusic(el, w));

    const theta = i * 2.39996 + 3.88;
    const central = i % 4 === 2;
    return {
      w, el, i,
      key: !!w.key,
      keyIdx: w.key ? keyCount++ : -1,
      sheetIdx: order.indexOf(w),
      size: 0.55 + r() * 0.8, // relative area
      theta,
      radius: central ? 0.12 + r() * 0.1 : 0.42 + r() * 0.36,
      zJitter: (r() - 0.5) * 160,
      // computed on resize
      wpx: 0, hpx: 0, x: 0, y: 0, zBase: 0, sx: 0, sy: 0, ss: 1,
    };
  });

  // ── 80/20 cells ───────────────────────────────────────────
  const r2 = rng(80);
  const keyCells = new Set();
  while (keyCells.size < 20) keyCells.add(Math.floor(r2() * 100));
  const cells = Array.from({ length: 100 }, (_, k) => {
    const el = document.createElement('i');
    if (keyCells.has(k)) el.className = 'k';
    pGrid.appendChild(el);
    return { el, k, key: keyCells.has(k), d: r2(), dx: 0, dy: 0 };
  });

  // ── layout ────────────────────────────────────────────────
  let vw, vh, Cmax, dot = { x: 0, y: 0, s: 10 }, cellSize = 10;
  const SPACING = 430;

  function layout() {
    vw = innerWidth;
    vh = innerHeight;
    const base = Math.min(vw, vh * 1.6) * 0.2;

    items.forEach((it) => {
      const area = base * base * it.size;
      it.wpx = Math.sqrt(area * it.w.ratio);
      it.hpx = Math.sqrt(area / it.w.ratio);
      const maxH = vh * 0.46;
      if (it.hpx > maxH) { it.wpx *= maxH / it.hpx; it.hpx = maxH; }
      it.el.style.width = it.wpx + 'px';
      it.el.style.height = it.hpx + 'px';
      it.el.style.left = -it.wpx / 2 + 'px';
      it.el.style.top = -it.hpx / 2 + 'px';

      const R = it.radius * vw;
      it.x = Math.cos(it.theta) * R;
      it.y = Math.sin(it.theta) * R * 0.52;
      it.zBase = -it.i * SPACING - 300 + it.zJitter;
    });
    Cmax = (WORKS.length - 1) * SPACING - 900;

    // contact sheet — 7 × 4, sorted by discipline
    const cols = 7, rows = 4;
    let cw = Math.min(vw * 0.8, vh * 1.5) / cols;
    let ch = cw * 0.9;
    if (ch * rows > vh * 0.6) { ch = (vh * 0.6) / rows; cw = ch / 0.9; }
    items.forEach((it) => {
      const c = it.sheetIdx % cols, rr = Math.floor(it.sheetIdx / cols);
      it.sx = (c - (cols - 1) / 2) * cw;
      it.sy = (rr - (rows - 1) / 2) * ch + vh * 0.02;
      it.ss = Math.min((cw * 0.78) / it.wpx, (ch * 0.66) / it.hpx);
    });

    // measure the full stop (where everything converges)
    const prev = interp.style.transform;
    interp.style.transform = 'none';
    const d = dotEl.getBoundingClientRect();
    interp.style.transform = prev;
    dot = { x: d.left + d.width / 2 - vw / 2, y: d.top + d.height / 2 - vh / 2, s: d.width };

    // 80/20 grid
    const g = pGrid.getBoundingClientRect();
    const step = g.width / 10;
    cellSize = step * 0.74;
    cells.forEach((c) => {
      const col = c.k % 10, row = Math.floor(c.k / 10);
      const left = col * step + (step - cellSize) / 2;
      const top = row * step + (step - cellSize) / 2;
      c.el.style.cssText += `;left:${left}px;top:${top}px;width:${cellSize}px;height:${cellSize}px`;
      c.dx = d.left + d.width / 2 - (g.left + left + cellSize / 2);
      c.dy = d.top + d.height / 2 - (g.top + top + cellSize / 2);
    });
    items.forEach((it) => (it.el._fx = null));
  }

  // ── mouse parallax (flight only) ─────────────────────────
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX / innerWidth - 0.5;
    mouse.y = e.clientY / innerHeight - 0.5;
  });

  let featured = -1;
  let lastP = -1;

  function update(p, force = false) {
    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;
    const flightInfluence = 1 - range(p, 0.36, 0.42);
    vp3d.style.perspectiveOrigin = `${lerp(66, 50, ease.inOut(range(p, 0, 0.12)))}% ${lerp(44, 50, ease.inOut(range(p, 0, 0.12)))}%`;
    world.style.transform = `rotateX(${-mouse.sy * 4 * flightInfluence}deg) rotateY(${mouse.sx * 6 * flightInfluence}deg)`;
    if (!force && Math.abs(p - lastP) < 1e-5) return;
    lastP = p;

    // intro type
    const it0 = range(p, 0.012, 0.06);
    fx(intro, 1 - it0, -it0 * 50);

    // camera
    const pf = range(p, 0, 0.38);
    const cam = -400 + (Cmax + 400) * (pf * 0.8 + ease.inOut(pf) * 0.2);

    let best = null, bestD = Infinity;
    const dotShown = p >= 0.66 && p < 0.76;

    for (const it of items) {
      // FLIGHT state
      let x = it.x, y = it.y, z = it.zBase + cam;
      let o = fog(z);
      if (o > 0.95 && p < 0.36) {
        const dd = Math.abs(z + 900);
        if (dd < bestD) { bestD = dd; best = it; }
      }

      // SORT → contact sheet
      const st = it.sheetIdx / items.length;
      const tb = ease.inOutQuart(range(p, 0.38 + st * 0.025, 0.455 + st * 0.025));
      if (tb > 0) {
        let x0 = x, y0 = y, z0 = z, o0 = o;
        if (z > 200) { z0 = -4200 - it.i * 60; o0 = 0; } // already passed → re-enter from depth
        x = lerp(x0, it.sx, tb);
        y = lerp(y0, it.sy, tb);
        z = lerp(z0, 0, tb);
        o = lerp(o0, 1, Math.min(1, tb * 1.6));
      }
      let sX = lerp(1, it.ss, tb), sY = sX;

      // CONVERGE — the 80% fall away in place, the key 20% fold into the full stop
      let ink = 0;
      if (!it.key) {
        const f = ease.inOut(range(p, 0.5 + it.sheetIdx * 0.0012, 0.535 + it.sheetIdx * 0.0012));
        o *= 1 - f;
        y += f * 14;
        sX *= 1 - f * 0.08; sY = sX;
      } else {
        const lift = ease.out(range(p, 0.5, 0.53)); // survivors step forward
        sX *= 1 + lift * 0.12; sY = sX;
        const c0 = 0.552 + it.keyIdx * 0.008;
        const tc = ease.inOutQuart(range(p, c0, c0 + 0.07));
        if (tc > 0) {
          x = lerp(x, dot.x, tc);
          y = lerp(y, dot.y, tc);
          sX = lerp(sX, dot.s / it.wpx, tc);
          sY = lerp(sY, dot.s / it.hpx, tc);
          ink = range(tc, 0.35, 0.9);
        }
      }
      if (p >= 0.66) o = 0;

      const label = tb * (it.key ? 1 - range(p, 0.55, 0.57) : 1 - range(p, 0.495, 0.515));
      const vis = o > 0.002 && z < P * 0.75;
      const key = vis ? `${x | 0}|${y | 0}|${z | 0}|${sX.toFixed(4)}|${sY.toFixed(4)}|${o.toFixed(3)}|${ink.toFixed(2)}|${label.toFixed(2)}` : 'h';
      if (it.el._fx !== key) {
        it.el._fx = key;
        if (!vis) {
          it.el.style.visibility = 'hidden';
        } else {
          it.el.style.visibility = 'visible';
          it.el.style.opacity = o;
          it.el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${sX}, ${sY})`;
          it.el.style.setProperty('--inkify', ink);
          it.el.style.setProperty('--label', label);
          it.el.style.zIndex = Math.round(z + 10000);
        }
      }
    }

    // focus bracket + caption (Studio-Agar style archival index)
    const bo = range(p, 0.04, 0.07) * (1 - range(p, 0.33, 0.37));
    bracket.style.opacity = best ? bo : 0;
    caption.style.opacity = bo;
    if (best) {
      const b = best.el.getBoundingClientRect();
      bracket.style.transform = `translate(${b.left}px, ${b.top}px)`;
      bracket.style.width = b.width + 'px';
      bracket.style.height = b.height + 'px';
      if (featured !== best.i) {
        featured = best.i;
        const w = best.w;
        cap.idx.textContent = `${String(best.i + 1).padStart(2, '0')}/${WORKS.length}`;
        cap.title.textContent = w.title;
        cap.year.textContent = w.year;
        cap.cat.textContent = `${CATEGORIES[w.cat].en} · ${CATEGORIES[w.cat].zh}`;
      }
    }

    fx(sheetLabel, range(p, 0.44, 0.47) * (1 - range(p, 0.55, 0.57)));
    const phase = p < 0.5 ? 0 : 1;
    if (sheetLabel._ph !== phase) {
      sheetLabel._ph = phase;
      sheetLabel.children[0].textContent = phase ? 'Reduce — 80% set aside' : 'Contact sheet — 28 works, 5 disciplines';
      sheetLabel.children[1].textContent = phase ? 'Keep the essential 20%' : 'Sorted by discipline';
    }

    // INTERPRETER. — letters rise out of the full stop, right → left
    letters.forEach((s, i) => {
      const k = WORD.length - 1 - i;
      const t = ease.out(range(p, 0.655 + k * 0.0045, 0.69 + k * 0.0045));
      s.style.transform = `translateY(${(1 - t) * 110}%)`;
    });
    dotEl.style.opacity = dotShown ? 1 : 0;
    subEls.forEach((el, k) => {
      const t = range(p, 0.695 + k * 0.012, 0.715 + k * 0.012);
      fx(el, t, (1 - t) * 18);
    });
    const out = range(p, 0.755, 0.79);
    interp.style.opacity = 1 - out;
    interp.style.transform = `translateY(${-out * 50}px)`;

    // 80/20 — the full stop unfolds into 100 cells
    const live = p >= 0.76;
    const dim = range(p, 0.845, 0.875);
    pGrid.classList.toggle('is-split', dim > 0.5);
    for (const c of cells) {
      if (!live) { if (c.el._fx !== 'h') { c.el._fx = 'h'; c.el.style.opacity = 0; } continue; }
      const t = ease.inOutQuart(range(p, 0.76 + c.d * 0.035, 0.8 + c.d * 0.035));
      const s0 = dot.s / cellSize;
      const o = c.key ? 1 : 1 - dim * 0.9;
      const key = `${t.toFixed(4)}|${o.toFixed(3)}`;
      if (c.el._fx === key) continue;
      c.el._fx = key;
      c.el.style.opacity = o;
      c.el.style.transform = `translate(${c.dx * (1 - t)}px, ${c.dy * (1 - t)}px) scale(${lerp(s0, 1, t)})`;
    }
    pTextEls.forEach((el, k) => {
      const t = range(p, 0.86 + k * 0.016, 0.89 + k * 0.016);
      fx(el, t, (1 - t) * 22);
    });
  }

  layout();
  return {
    layout: () => { layout(); update(lastP < 0 ? 0 : lastP, true); },
    update,
    chapter: (p) => (p < 0.64 ? 0 : 1),
  };
}

// ── helpers ─────────────────────────────────────────────────
function fog(z) {
  // fade in from depth, fade out as it passes the lens
  const far = 1 - range(-z, 3400, 5600);
  const near = 1 - range(z, 120, 520);
  return clamp(far * near);
}

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

function ratioLabel(r) {
  const known = [[1, '1:1'], [4 / 5, '4:5'], [5 / 4, '5:4'], [4 / 3, '4:3'], [3 / 4, '3:4'], [2 / 3, '2:3'], [3 / 2, '3:2'], [16 / 9, '16:9'], [9 / 16, '9:16'], [16 / 10, '16:10'], [21 / 9, '21:9'], [1 / 1.414, 'A-series'], [1.414, 'A-series']];
  const hit = known.find(([v]) => Math.abs(v - r) < 0.01);
  return hit ? hit[1] : r.toFixed(2);
}

function media(w, i) {
  if (w.src) {
    if (/\.(mp4|webm|mov)$/i.test(w.src)) {
      return `<video src="${w.src}" muted loop autoplay playsinline></video>`;
    }
    return `<img src="${w.src}" alt="${w.title}" loading="eager" decoding="async" />`;
  }
  return `<div class="work__ph">
      <span><b>${String(i + 1).padStart(2, '0')}</b> — ${CATEGORIES[w.cat].en}</span>
      <span class="ratio">${ratioLabel(w.ratio)}</span>
    </div>`;
}

let current = null;
function toggleMusic(el, w) {
  // v1: visual state only. v2: drop `audio` into works.js and it plays.
  const on = !el.classList.contains('is-playing');
  document.querySelectorAll('.work.is-playing').forEach((n) => n.classList.remove('is-playing'));
  if (current) { current.pause(); current = null; }
  if (on) {
    el.classList.add('is-playing');
    if (w.audio) { current = new Audio(w.audio); current.play().catch(() => {}); }
  }
}
