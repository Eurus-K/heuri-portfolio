/**
 * 03 FROM EXPERIENCE TO AI — Taiwan → Korea, ASEAN, Southern California.
 * Dot-matrix land (sampled from Natural Earth 110m via world-atlas), flight
 * arcs drawn as scroll-scrubbed strokes.
 *
 *  0.00 ─ 0.25  land sweeps in from Taiwan
 *  0.26 ─ 0.62  routes: Korea → ASEAN → Southern California
 *  0.55 ─ 0.70  1.0 → 2.0 shift
 *  0.74 ─ 1.00  the question
 */
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import { ORIGIN, DESTINATIONS } from '../data/content.js';
import { range, ease, fx } from '../lib/util.js';

const NS = 'http://www.w3.org/2000/svg';
const land = feature(land110, land110.objects.land);

// route order & timing
const ROUTE_T = { KR: [0.27, 0.36], ASEAN: [0.34, 0.5], US: [0.46, 0.62] };

export function createMap(root) {
  const $ = (s) => root.querySelector(s);
  const stage = root.querySelector('.stage');
  const svg = $('#mapSvg');
  const labelsEl = $('#mapLabels');
  const head = $('#mapHead');
  const rows = [...root.querySelectorAll('.shift__row')];
  const question = $('#question');

  const canvas = document.createElement('canvas');
  canvas.className = 'map__dots';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  stage.insertBefore(canvas, svg);
  const ctx = canvas.getContext('2d');

  let dots = [], origin = [0, 0], maxDist = 1, routes = [], labels = [], dpr = 1;

  function layout() {
    const vw = Math.max(1, innerWidth), vh = Math.max(1, innerHeight);
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);

    // frame: India → Southern California, Australia's north → Mongolia
    const proj = geoNaturalEarth1().rotate([-175, 0]);
    proj.fitExtent(
      [[vw * 0.2, vh * 0.2], [vw * 0.94, vh * 1.02]],
      { type: 'MultiPoint', coordinates: [[88, 52], [-112, 52], [88, -14], [-112, -14]] },
    );

    // rasterise land once, then sample a square grid → dot matrix
    const off = document.createElement('canvas');
    off.width = vw; off.height = vh;
    const octx = off.getContext('2d', { willReadFrequently: true });
    octx.fillStyle = '#000';
    octx.beginPath();
    geoPath(proj, octx)(land);
    octx.fill();
    const img = octx.getImageData(0, 0, vw, vh).data;
    const step = Math.max(7, Math.round(Math.min(vw, vh) / 95));
    origin = proj(ORIGIN.lonlat);
    dots = [];
    maxDist = 1;
    for (let y = step / 2; y < vh; y += step) {
      for (let x = step / 2; x < vw; x += step) {
        if (img[((y | 0) * vw + (x | 0)) * 4 + 3] > 128) {
          const d = Math.hypot(x - origin[0], y - origin[1]);
          maxDist = Math.max(maxDist, d);
          dots.push({ x, y, d, s: step * 0.32 });
        }
      }
    }

    // routes
    svg.innerHTML = '';
    labelsEl.innerHTML = '';
    const gRoutes = document.createElementNS(NS, 'g');
    svg.appendChild(gRoutes);
    routes = DESTINATIONS.map((dst, k) => {
      const [x1, y1] = proj(dst.lonlat);
      const [x0, y0] = origin;
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
      // lift arcs "upwards" (perpendicular, toward north)
      let nx = -dy / len, ny = dx / len;
      if (ny > 0) { nx = -nx; ny = -ny; }
      const lift = Math.min(len * 0.32, 220);
      const cx = (x0 + x1) / 2 + nx * lift, cy = (y0 + y1) / 2 + ny * lift;
      const d = `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`;

      const glow = el('path', { d, class: 'route-glow' });
      const path = el('path', { d, class: 'route' });
      const node = el('rect', { class: 'node', width: 6, height: 6, x: x1 - 3, y: y1 - 3 });
      const pulse = el('circle', { class: 'pulse', cx: x1, cy: y1, r: 0 });
      const head = el('rect', { class: 'node', width: 5, height: 5 });
      gRoutes.append(glow, path, pulse, node, head);
      const L = path.getTotalLength();
      [glow, path].forEach((n) => n.setAttribute('stroke-dasharray', `${L} ${L}`));

      const groupIdx = DESTINATIONS.filter((x) => x.group === dst.group).indexOf(dst);
      const groupN = DESTINATIONS.filter((x) => x.group === dst.group).length;
      const [a, b] = ROUTE_T[dst.group];
      const span = (b - a) / (groupN + 1);
      const t0 = a + groupIdx * span * 0.7, t1 = t0 + span * 2;

      const lab = document.createElement('div');
      lab.className = 'mlabel';
      lab.innerHTML = `<b>${dst.zh}</b><span>${dst.id} · ${dst.en}</span>`;
      if (x1 > vw * 0.8) lab.classList.add('mlabel--flip');
      lab.style.left = x1 + 'px';
      lab.style.top = y1 + 'px';
      // ASEAN labels are dense: only the first of the group gets the long name
      if (dst.group === 'ASEAN' && groupIdx > 0) lab.querySelector('span').textContent = dst.id;
      labelsEl.appendChild(lab);

      return { dst, glow, path, node, pulse, head, L, t0, t1, lab };
    });

    const oNode = el('rect', { class: 'origin', width: 9, height: 9, x: origin[0] - 4.5, y: origin[1] - 4.5 });
    const oPulse = el('circle', { class: 'pulse', cx: origin[0], cy: origin[1], r: 0 });
    svg.append(oPulse, oNode);
    const oLab = document.createElement('div');
    oLab.className = 'mlabel mlabel--origin';
    oLab.innerHTML = `<b>${ORIGIN.zh}</b><span>${ORIGIN.id} · ${ORIGIN.en}</span>`;
    oLab.style.left = origin[0] + 'px';
    oLab.style.top = origin[1] + 'px';
    labelsEl.appendChild(oLab);
    labels = { oNode, oPulse, oLab };
    lastDrawn = -1;
  }

  let lastDrawn = -1, last = -1;
  function drawDots(reveal, dimTo) {
    const key = reveal.toFixed(3) + dimTo.toFixed(3);
    if (key === lastDrawn) return;
    lastDrawn = key;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const R = reveal * maxDist * 1.05;
    for (const d of dots) {
      if (d.d > R) continue;
      const edge = Math.min(1, (R - d.d) / 140);
      ctx.globalAlpha = (0.12 + 0.3 * edge * (1 - d.d / maxDist)) * dimTo + 0.0;
      ctx.fillStyle = edge < 0.4 ? '#ff4a1c' : '#efeee9';
      ctx.fillRect(d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
    }
  }

  function update(p, force) {
    if (!force && Math.abs(p - last) < 1e-5) return;
    last = p;
    const q = range(p, 0.74, 0.8);
    const dim = 1 - q * 0.72;

    drawDots(ease.out(range(p, 0.02, 0.26)), dim);
    svg.style.opacity = dim;
    labelsEl.style.opacity = 1 - q;

    const ot = range(p, 0.18, 0.24);
    labels.oNode.style.opacity = ot;
    labels.oLab.style.opacity = ot;
    labels.oPulse.setAttribute('r', ot > 0 ? 6 + ((p * 900) % 22) : 0);
    labels.oPulse.style.opacity = ot * (1 - ((p * 900) % 22) / 22);

    for (const r of routes) {
      const t = ease.inOut(range(p, r.t0, r.t1));
      const off = r.L * (1 - t);
      r.path.setAttribute('stroke-dashoffset', off);
      r.glow.setAttribute('stroke-dashoffset', off);
      const live = t > 0 && t < 1;
      r.head.style.opacity = live ? 1 : 0;
      if (live) {
        const pt = r.path.getPointAtLength(r.L * t);
        r.head.setAttribute('x', pt.x - 2.5);
        r.head.setAttribute('y', pt.y - 2.5);
      }
      const arrived = range(p, r.t1 - 0.01, r.t1 + 0.02);
      r.node.style.opacity = arrived;
      r.lab.style.opacity = arrived;
      r.pulse.setAttribute('r', arrived * 14);
      r.pulse.style.opacity = (1 - range(p, r.t1, r.t1 + 0.06)) * arrived;
    }

    const h = 1 - q;
    fx(head, range(p, 0.0, 0.06) * h);
    rows.forEach((row, k) => {
      const t = range(p, 0.56 + k * 0.05, 0.61 + k * 0.05);
      fx(row, t * h, (1 - t) * 18);
    });
    const qt = range(p, 0.79, 0.85);
    fx(question, qt, (1 - qt) * 30);
  }

  layout();
  return { layout: () => { layout(); update(last < 0 ? 0 : last, true); }, update, chapter: () => 2 };
}

function el(tag, attrs) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
