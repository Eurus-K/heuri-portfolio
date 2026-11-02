/**
 * 01 OPENING GALLERY → the orb → INTERPRETER → 80/20
 *
 * One pinned stage, one progress value p (0..1). Every frame is a pure
 * function of p, so scrubbing backwards on stage is always safe.
 *
 *  0.00 ─ 0.26  GALLERY    camera travels through a 3D field of works; no text
 *  0.23 ─ 0.36  ABSORB     works drift to the centre and dissolve; the orb forms
 *  0.37 ─ 0.63  STATUS     three lines, each with its own orb palette
 *  0.64 ─ 0.72  DIVE       the orb rushes towards the lens and floods the frame
 *  0.71 ─ 0.86  INTERPRETER   alone, comes into focus (blur → sharp, wide → tight)
 *  0.86 ─ 1.00  80/20      100 cells; 20 remain
 */
import { WORKS, CATEGORIES } from '../data/works.js';
import { STATUS_LINES } from '../data/content.js';
import { clamp, lerp, range, ease, rng, fx, typeText } from '../lib/util.js';
import { createOrb } from '../lib/orb.js';

const P = 1000; // CSS perspective (px)
const STATUS_AT = [0.37, 0.46, 0.55]; // start of each status line
const STATUS_LEN = 0.09;

export function createOpen(root) {
  const $ = (s) => root.querySelector(s);
  const world = $('#world');
  const vp3d = $('#viewport3d');
  const canvas = $('#orb');
  const statusEl = $('#orbStatus');
  const statusText = $('#orbText');
  const dots = $('#orbDots');
  const word = $('#interp');
  const pGrid = $('#paretoGrid');
  const pTextEls = [...root.querySelectorAll('.pareto__text > *')];
  const orb = createOrb(canvas);

  // ── works ─────────────────────────────────────────────────
  const r = rng(11);
  const items = WORKS.map((w, i) => {
    const el = document.createElement('div');
    el.className = `work work--${w.cat.toLowerCase()}`;
    el.style.setProperty('--tone', w.tone);
    el.style.setProperty('--ph-ink', isLight(w.tone) ? '#1d1d1f' : '#f5f5f7');
    el.innerHTML = `
      <div class="work__media">${media(w, i)}</div>
      ${w.cat === 'MUSIC' ? '<span class="work__disc"></span>' : ''}`;
    world.appendChild(el);
    if (w.cat === 'MUSIC') el.addEventListener('click', () => toggleMusic(el, w));

    const central = i % 4 === 2;
    return {
      w, el, i,
      size: 0.55 + r() * 0.8, // relative area
      theta: i * 2.39996 + 3.88,
      radius: central ? 0.12 + r() * 0.1 : 0.42 + r() * 0.36,
      zJitter: (r() - 0.5) * 160,
      absorb: r(), // order in which it falls into the orb
      wpx: 0, hpx: 0, x: 0, y: 0, zBase: 0,
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
  let vw, vh, Cmax, orbSize = 160, cellSize = 10;
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
      it.el._fx = null;
    });
    Cmax = (WORKS.length - 1) * SPACING - 900;

    // Dipper-scale orb: ~10% of the width, never taller than a quarter screen
    orbSize = Math.round(Math.min(vw * 0.105, vh * 0.24));
    orb.resize(orbSize * 1.2); // canvas includes room for the outer glow
    statusEl.style.setProperty('--status-y', orbSize * 0.5 + Math.max(24, vh * 0.035) + 'px');

    // 80/20 grid — cells unfold from the centre of the screen
    const g = pGrid.getBoundingClientRect();
    const step = g.width / 10;
    cellSize = step * 0.74;
    cells.forEach((c) => {
      const col = c.k % 10, row = Math.floor(c.k / 10);
      const left = col * step + (step - cellSize) / 2;
      const top = row * step + (step - cellSize) / 2;
      c.el.style.cssText += `;left:${left}px;top:${top}px;width:${cellSize}px;height:${cellSize}px`;
      c.dx = vw / 2 - (g.left + left + cellSize / 2);
      c.dy = vh / 2 - (g.top + top + cellSize / 2);
      c.el._fx = null;
    });
  }

  // ── mouse parallax (gallery only) ─────────────────────────
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX / innerWidth - 0.5;
    mouse.y = e.clientY / innerHeight - 0.5;
  });

  // ── orb render loop (only while visible) ──────────────────
  let orbState = { on: false, stage: 0 };
  (function loop(ms) {
    if (orbState.on) orb.draw(ms / 1000, orbState.stage);
    requestAnimationFrame(loop);
  })(0);

  let lastP = -1;

  function update(p, force = false) {
    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;
    const par = 1 - range(p, 0.22, 0.3);
    world.style.transform = `rotateX(${-mouse.sy * 4 * par}deg) rotateY(${mouse.sx * 6 * par}deg)`;
    if (!force && Math.abs(p - lastP) < 1e-5) return;
    lastP = p;

    document.body.classList.toggle('is-intro', p < 0.855); // the word stands alone

    // ── GALLERY → ABSORB ──
    const pf = range(p, 0, 0.26);
    const cam = -400 + (Cmax + 400) * (pf * 0.8 + ease.inOut(pf) * 0.2);
    vp3d.style.perspectiveOrigin = `${lerp(58, 50, ease.inOut(range(p, 0, 0.1)))}% 50%`;

    for (const it of items) {
      let x = it.x, y = it.y, z = it.zBase + cam;
      let o = fog(z);
      let s = 1;

      const a0 = 0.23 + it.absorb * 0.06;
      const ta = ease.inOutQuart(range(p, a0, a0 + 0.06));
      if (ta > 0) {
        if (z > 200) o = 0; // already behind the camera
        x = lerp(x, 0, ta);
        y = lerp(y, 0, ta);
        z = lerp(Math.min(z, 0), 0, ta);
        s = lerp(1, 0.04, ease.in(ta));
        o *= 1 - range(ta, 0.7, 1);
      }

      const vis = o > 0.002 && z < P * 0.75;
      const key = vis ? `${x | 0}|${y | 0}|${z | 0}|${s.toFixed(4)}|${o.toFixed(3)}` : 'h';
      if (it.el._fx !== key) {
        it.el._fx = key;
        if (!vis) {
          it.el.style.visibility = 'hidden';
        } else {
          it.el.style.visibility = 'visible';
          it.el.style.opacity = o;
          it.el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${s})`;
          it.el.style.zIndex = Math.round(z + 10000);
        }
      }
    }

    // ── ORB ──
    const grow = ease.out(range(p, 0.27, 0.36));
    const dive = ease.in(range(p, 0.64, 0.69));
    const orbO = grow * (1 - range(p, 0.682, 0.72));
    // palette stage: 0 forming → 1 / 2 / 3 per status line
    const stage = STATUS_AT.reduce((acc, a) => acc + ease.inOut(range(p, a - 0.01, a + 0.03)), 0);
    orbState = { on: orbO > 0.001, stage };
    canvas.style.opacity = orbO;
    canvas.style.transform = `translate(-50%, -50%) scale(${lerp(0.25, 1, grow) * (1 + dive * 16)})`;
    canvas.style.filter = dive > 0.01 ? `blur(${dive * 18}px)` : 'none';

    // ── STATUS LINES ──
    let shown = false;
    STATUS_AT.forEach((a, k) => {
      if (p < a || p >= a + STATUS_LEN) return;
      shown = true;
      const t = range(p, a, a + 0.035);
      const out = range(p, a + STATUS_LEN - 0.014, a + STATUS_LEN);
      const txt = typeText(STATUS_LINES[k], t);
      if (statusText.textContent !== txt) statusText.textContent = txt;
      dots.classList.toggle('is-on', t >= 1);
      statusEl.style.opacity = 1 - out;
    });
    if (!shown) statusEl.style.opacity = 0;

    // ── INTERPRETER — comes into focus ──
    const w = range(p, 0.71, 0.775);
    const wo = range(p, 0.83, 0.86);
    const we = ease.out(w);
    word.style.opacity = we * (1 - wo);
    word.style.filter = w < 1 ? `blur(${(1 - we) * 22}px)` : 'none';
    word.style.letterSpacing = `${lerp(0.45, -0.025, we)}em`;
    word.style.transform = `translate(-50%, -50%) scale(${1 - wo * 0.04})`;

    // ── 80/20 ──
    const live = p >= 0.855;
    const dim = range(p, 0.915, 0.94);
    pGrid.classList.toggle('is-split', dim > 0.5);
    for (const c of cells) {
      if (!live) { if (c.el._fx !== 'h') { c.el._fx = 'h'; c.el.style.opacity = 0; } continue; }
      const t = ease.inOutQuart(range(p, 0.855 + c.d * 0.035, 0.895 + c.d * 0.035));
      const o = (c.key ? 1 : 1 - dim * 0.86) * Math.min(1, t * 4);
      const key = `${t.toFixed(4)}|${o.toFixed(3)}`;
      if (c.el._fx === key) continue;
      c.el._fx = key;
      c.el.style.opacity = o;
      c.el.style.transform = `translate(${c.dx * (1 - t)}px, ${c.dy * (1 - t)}px) scale(${t})`;
    }
    pTextEls.forEach((el, k) => {
      const t = range(p, 0.925 + k * 0.014, 0.95 + k * 0.014);
      fx(el, t, (1 - t) * 22);
    });
  }

  layout();
  return {
    layout: () => { layout(); update(lastP < 0 ? 0 : lastP, true); },
    update,
    chapter: (p) => (p < 0.7 ? 0 : 1),
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
      <span>${String(i + 1).padStart(2, '0')} — ${CATEGORIES[w.cat].en}</span>
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
