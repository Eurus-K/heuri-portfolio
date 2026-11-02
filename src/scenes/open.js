/**
 * 01 OPENING GALLERY → the orb → INTERPRETER → 80/20
 *
 * One pinned stage, one progress value p (0..1). Transitions are pure
 * functions of p, so scrubbing backwards on stage is always safe. Two moments
 * are triggered instead of scrubbed, so one scroll / one click plays them whole:
 * the status lines (typed) and INTERPRETER (per-letter entrance, Dipper-style).
 *
 *  0.00 ─ 0.26  GALLERY    camera travels through a 3D field of works; no text
 *  0.24 ─ 0.34  PARK       works settle around the edges and keep floating
 *  0.29 ─ 0.62  ABSORB     the orb forms; each status line pulls in one batch
 *  0.37 ─ 0.64  STATUS     three lines, each with its own orb palette
 *  0.645─ 0.69  SHRINK     the orb quietly shrinks away
 *  0.70 ─ 0.83  INTERPRETER   alone; letters slide in, slide out
 *  0.855─ 1.00  80/20      100 cells; 20 remain
 */
import { WORKS, CATEGORIES } from '../data/works.js';
import { STATUS_LINES } from '../data/content.js';
import { clamp, lerp, range, ease, rng, fx } from '../lib/util.js';
import { createOrb } from '../lib/orb.js';

const P = 1000; // CSS perspective (px)
const STATUS_AT = [0.37, 0.46, 0.55]; // start of each status line
const STATUS_LEN = 0.09;
const TYPE_MS = 38; // per character
// batch k is absorbed starting here: one while the orb forms, one per status line
const BATCH_AT = [0.305, ...STATUS_AT.map((a) => a - 0.005)];
const BATCH_SIZES = [6, 7, 7, 8];
const WORD_IN = 0.7, WORD_OUT = 0.83;
const ABSORB_LEN = 0.04; // per work
const SWIRL = 1.1; // radians turned while spiralling in
const RIPPLE_S = 1.3; // ripple lifetime (seconds)

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
  const batchOf = [];
  BATCH_SIZES.forEach((n, k) => { for (let j = 0; j < n; j++) batchOf.push(k); });
  // deterministic shuffle so each batch mixes disciplines
  for (let i = batchOf.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [batchOf[i], batchOf[j]] = [batchOf[j], batchOf[i]];
  }
  const inBatch = [0, 0, 0, 0];

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
    const batch = batchOf[i % batchOf.length];
    return {
      w, el, i,
      size: 0.55 + r() * 0.8, // relative area
      theta: i * 2.39996 + 3.88,
      radius: central ? 0.12 + r() * 0.1 : 0.42 + r() * 0.36,
      zJitter: (r() - 0.5) * 160,
      settle: r(),
      batch, inBatch: inBatch[batch]++,
      phase: r() * Math.PI * 2, // floating drift
      arrived: false,
      wpx: 0, hpx: 0, x: 0, y: 0, zBase: 0, px: 0, py: 0, ps: 1,
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

  // ── INTERPRETER letters ───────────────────────────────────
  const letters = [...word.textContent.trim()].map((ch) => {
    const s = document.createElement('span');
    s.textContent = ch;
    s.style.display = 'inline-block';
    s.style.opacity = 0;
    return s;
  });
  word.textContent = '';
  letters.forEach((s) => word.appendChild(s));

  // ── layout ────────────────────────────────────────────────
  let vw, vh, Cmax, orbSize = 160, cellSize = 10;
  const SPACING = 430;

  function layout() {
    vw = innerWidth;
    vh = innerHeight;
    const base = Math.min(vw, vh * 1.6) * 0.2;

    // edge slots: an elliptical band around the orb, like Dipper's floating clips
    const slotR = rng(5);
    const n = items.length;
    items.forEach((it, k) => {
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

      const a = (k / n) * Math.PI * 2 + (slotR() - 0.5) * 0.25;
      const band = 0.8 + slotR() * 0.35;
      it.px = Math.cos(a) * vw * 0.4 * band;
      it.py = Math.sin(a) * vh * 0.38 * band;
      it.ps = (Math.min(vw, vh) * (0.09 + slotR() * 0.07)) / Math.max(it.wpx, it.hpx);
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

  // ── triggered moments ─────────────────────────────────────
  const typing = { k: -1, start: 0 };
  let wordIn = false;

  function wordEnter() {
    letters.forEach((s, i) => {
      s.getAnimations().forEach((a) => a.cancel());
      s.animate(
        [{ opacity: 0, transform: 'translateX(0.45em) scale(1.3)' }, { opacity: 1, transform: 'none' }],
        { duration: 1100, delay: i * 45, easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)', fill: 'both' },
      );
    });
  }
  function wordExit() {
    const n = letters.length;
    letters.forEach((s, i) => {
      s.getAnimations().forEach((a) => a.cancel());
      s.animate(
        [{ opacity: Number(getComputedStyle(s).opacity), transform: 'none' }, { opacity: 0, transform: 'translateX(0.3em) scale(0.5)' }],
        { duration: 650, delay: (n - 1 - i) * 27, easing: 'cubic-bezier(0.55, 0, 0.675, 0.19)', fill: 'both' },
      );
    });
  }

  // ── per-frame loop: orb shader + typing clock ─────────────
  let orbState = { on: false, stage: 0, speed: 1 };
  const impacts = []; // { x, y, start } — where works hit the orb
  let orbClock = 0, lastMs = 0, speed = 1;
  (function loop(ms) {
    const dt = Math.min(0.05, (ms - lastMs) / 1000);
    lastMs = ms;
    speed += (orbState.speed - speed) * 0.03; // ease towards the target flow speed
    orbClock += dt * speed;
    if (orbState.on) {
      const now = performance.now();
      orb.draw(orbClock, orbState.stage, impacts.map((m) => [m.x, m.y, (now - m.start) / 1000 / RIPPLE_S]));
    }
    if (typing.k >= 0) {
      const line = STATUS_LINES[typing.k];
      const n = Math.min(line.length, Math.floor((performance.now() - typing.start) / TYPE_MS));
      const txt = line.slice(0, n);
      if (statusText.textContent !== txt) statusText.textContent = txt;
      dots.classList.toggle('is-on', n >= line.length);
    }
    requestAnimationFrame(loop);
  })(0);

  let lastP = -1;

  function update(p, force = false) {
    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;
    const par = 1 - range(p, 0.22, 0.3);
    world.style.transform = `rotateX(${-mouse.sy * 4 * par}deg) rotateY(${mouse.sx * 6 * par}deg)`;
    const floating = p > 0.23 && p < 0.66; // works drift even when scroll is still
    if (!force && !floating && Math.abs(p - lastP) < 1e-5) return;
    lastP = p;

    document.body.classList.toggle('is-intro', p < 0.855); // the word stands alone
    const now = performance.now() / 1000;

    // orb size first: works vanish when they reach its rim
    const grow = ease.out(range(p, 0.29, 0.35));
    const shrink = ease.inOut(range(p, 0.645, 0.69));
    const orbScale = lerp(0.25, 1, grow) * (1 - shrink * 0.94);
    const orbR = 0.5 * orbSize * orbScale;
    let absorbed = 0;

    // ── GALLERY → PARK → ABSORB ──
    const pf = range(p, 0, 0.26);
    const cam = -400 + (Cmax + 400) * (pf * 0.8 + ease.inOut(pf) * 0.2);
    vp3d.style.perspectiveOrigin = `${lerp(58, 50, ease.inOut(range(p, 0, 0.1)))}% 50%`;

    for (const it of items) {
      let x = it.x, y = it.y, z = it.zBase + cam;
      let o = fog(z);
      let s = 1;

      // park around the edges (works already passed re-enter from outside)
      const s0 = 0.235 + it.settle * 0.03;
      const tp = ease.inOutQuart(range(p, s0, s0 + 0.07));
      if (tp > 0) {
        let x0 = x, y0 = y, z0 = z, o0 = o;
        if (z > 200) { x0 = it.px * 1.9; y0 = it.py * 1.9; z0 = 0; o0 = 0; }
        const fl = tp * (1 - range(p, 0.62, 0.66));
        const dx = Math.sin(now * 0.35 + it.phase) * 12 * fl;
        const dy = Math.cos(now * 0.28 + it.phase * 1.3) * 14 * fl;
        x = lerp(x0, it.px, tp) + dx;
        y = lerp(y0, it.py, tp) + dy;
        z = lerp(Math.min(z0, 0), 0, tp);
        s = lerp(1, it.ps, tp);
        o = lerp(o0, 1, Math.min(1, tp * 1.5));
      }

      // absorbed with its batch: spirals in, slow then fast, turns round on
      // the way, and disappears behind the orb's rim (the orb draws on top)
      const a0 = BATCH_AT[it.batch] + it.inBatch * 0.006;
      const ta = range(p, a0, a0 + ABSORB_LEN);
      let round = 0, arrived = false;
      if (ta > 0) {
        const e = ease.in(ta); // easeInCubic
        const r0 = Math.hypot(x, y) || 1, ang0 = Math.atan2(y, x);
        const rr = r0 * (1 - e), ang = ang0 + SWIRL * e;
        x = Math.cos(ang) * rr;
        y = Math.sin(ang) * rr;
        s *= lerp(1, 0.35, e);
        round = Math.min(1, e * 1.6);
        arrived = rr < orbR * 0.9;
        if (arrived) {
          o = 0;
          absorbed++;
          if (!it.arrived) impacts.push({ x: Math.cos(ang), y: -Math.sin(ang), start: performance.now() });
        }
      }
      it.arrived = arrived;

      let clip = '';
      if (round > 0) {
        const side = Math.min(it.wpx, it.hpx);
        const ix = ((it.wpx - side) / 2) * round, iy = ((it.hpx - side) / 2) * round;
        clip = `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px round ${lerp(2, side / 2, round).toFixed(1)}px)`;
      }

      const vis = o > 0.002 && z < P * 0.75;
      const key = vis ? `${x | 0}|${y | 0}|${z | 0}|${s.toFixed(4)}|${o.toFixed(3)}|${clip}` : 'h';
      if (it.el._fx !== key) {
        it.el._fx = key;
        if (!vis) {
          it.el.style.visibility = 'hidden';
        } else {
          it.el.style.visibility = 'visible';
          it.el.style.opacity = o;
          it.el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${s})`;
          it.el.style.zIndex = Math.round(z + 10000);
          it.el.style.clipPath = clip;
        }
      }
    }
    while (impacts.length && (performance.now() - impacts[0].start) / 1000 > RIPPLE_S) impacts.shift();
    if (impacts.length > 8) impacts.splice(0, impacts.length - 8);

    // ── ORB — forms, changes colour per line, flows faster the more it has
    //    absorbed, then quietly shrinks away ──
    const orbO = grow * (1 - range(shrink, 0.6, 1));
    const stage = STATUS_AT.reduce((acc, a) => acc + ease.inOut(range(p, a - 0.01, a + 0.03)), 0);
    orbState = { on: orbO > 0.001, stage, speed: 1 + (absorbed / items.length) * 1.8 };
    canvas.style.opacity = orbO;
    canvas.style.transform = `translate(-50%, -50%) scale(${orbScale})`;

    // ── STATUS LINES — one trigger types the whole line ──
    let k = -1;
    STATUS_AT.forEach((a, i) => { if (p >= a && p < a + STATUS_LEN) k = i; });
    if (k !== typing.k) {
      typing.k = k;
      typing.start = performance.now();
      if (k < 0) { statusText.textContent = ''; dots.classList.remove('is-on'); }
    }
    statusEl.style.opacity = k < 0 ? 0 : 1 - range(p, STATUS_AT[k] + STATUS_LEN - 0.014, STATUS_AT[k] + STATUS_LEN);

    // ── INTERPRETER — plays whole on entry, leaves on exit (either direction) ──
    const inside = p >= WORD_IN && p < WORD_OUT;
    if (inside !== wordIn) {
      wordIn = inside;
      inside ? wordEnter() : wordExit();
    }

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
    pTextEls.forEach((el, i) => {
      const t = range(p, 0.925 + i * 0.014, 0.95 + i * 0.014);
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
