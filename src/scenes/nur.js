/**
 * NURSTYLE — from scattered customer questions to decision touchpoints,
 * then to an AI answer that cites the structure.
 *
 *  0.00 ─ 0.30  questions surface, scattered across channels
 *  0.32 ─ 0.50  they sort into four touchpoints
 *  0.55 ─ 0.80  an AI search answer cites the touchpoints
 *  0.84 ─ 1.00  takeaway
 */
import { QUESTIONS, TOUCHPOINTS, AI_ANSWER } from '../data/content.js';
import { range, lerp, ease, rng, fx, typeText } from '../lib/util.js';

const CITED = ['faq', 'fit'];

export function createNur(root) {
  const $ = (s) => root.querySelector(s);
  const field = $('#nurField');
  const colsEl = $('#nurCols');
  const head = $('#nurHead');
  const capt = $('#nurCaption');
  const ai = $('#ai');
  const aiQ = $('#aiQ'), aiA = $('#aiA'), aiCite = $('#aiCite');
  const outEl = $('#nurOut');

  const cols = TOUCHPOINTS.map((t) => {
    const n = QUESTIONS.filter((q) => q.to === t.id).length;
    const el = document.createElement('div');
    el.className = 'col';
    el.innerHTML = `<div class="col__h"><b>${t.en}</b><span class="mono dim">${String(n).padStart(2, '0')}</span></div><div class="col__zh">${t.zh}</div>`;
    colsEl.appendChild(el);
    return { ...t, el, count: 0 };
  });

  const r = rng(23);
  const chips = QUESTIONS.map((q, i) => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.innerHTML = `<span>${q.q}</span><small>${q.src}</small>`;
    field.appendChild(el);
    const col = cols.find((c) => c.id === q.to);
    const slot = col.count++;
    return { q, el, col, slot, i, rx: r(), ry: r(), rot: (r() - 0.5) * 7, d: r(), sx: 0, sy: 0, tx: 0, ty: 0 };
  });

  function layout() {
    const vw = innerWidth, vh = innerHeight;
    chips.forEach((c) => {
      const w = c.el.offsetWidth;
      // scatter: right two-thirds and lower band, leaving the headline clear
      c.sx = lerp(vw * 0.3, vw - w - vw * 0.04, c.rx);
      c.sy = c.ry < 0.35 ? lerp(vh * 0.12, vh * 0.42, c.ry / 0.35) : lerp(vh * 0.5, vh * 0.86, (c.ry - 0.35) / 0.65);
      if (c.sx < vw * 0.52 && c.sy < vh * 0.45) c.sy += vh * 0.38; // keep head zone free
      const cr = c.col.el.getBoundingClientRect();
      const stageTop = root.querySelector('.stage').getBoundingClientRect().top;
      c.tx = cr.left;
      c.ty = cr.top - stageTop + 62 + c.slot * 46;
    });
  }

  let last = -1;
  function update(p, force) {
    if (!force && Math.abs(p - last) < 1e-5) return;
    last = p;

    fx(head, 1 - range(p, 0.33, 0.38), -range(p, 0.33, 0.38) * 30);
    fx(capt, range(p, 0.42, 0.47) * (1 - range(p, 0.82, 0.86)));

    const sortT = (c) => ease.inOutQuart(range(p, 0.32 + c.d * 0.08, 0.42 + c.d * 0.08));
    for (const c of chips) {
      const appear = ease.out(range(p, 0.02 + c.i * 0.012, 0.08 + c.i * 0.012));
      const t = sortT(c);
      const drift = Math.sin(p * 40 + c.i) * 6 * (1 - t);
      const x = lerp(c.sx, c.tx, t);
      const y = lerp(c.sy + (1 - appear) * 30, c.ty, t) + drift;
      const rot = c.rot * (1 - t);
      const o = appear;
      const key = `${x | 0}|${y | 0}|${rot.toFixed(2)}|${o.toFixed(3)}`;
      if (c.el._fx !== key) {
        c.el._fx = key;
        c.el.style.opacity = o;
        c.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
      }
      c.el.classList.toggle('is-hot', p > 0.77 && CITED.includes(c.q.to));
    }
    cols.forEach((c, k) => {
      c.el.style.opacity = range(p, 0.38 + k * 0.02, 0.44 + k * 0.02);
      c.el.classList.toggle('is-cited', p > 0.77 && CITED.includes(c.id));
    });

    // AI answer
    const aiT = range(p, 0.54, 0.58);
    fx(ai, aiT, (1 - aiT) * 24);
    aiQ.textContent = typeText(AI_ANSWER.query, range(p, 0.58, 0.63));
    const ans = typeText(AI_ANSWER.answer, range(p, 0.64, 0.76));
    aiA.innerHTML = ans.replace(/NURSTYLE/g, '<mark>NURSTYLE</mark>');
    aiCite.textContent = `↳ Cited: ${AI_ANSWER.cite}`;
    aiCite.style.opacity = range(p, 0.76, 0.79);

    const o = range(p, 0.86, 0.91);
    fx(outEl, o, (1 - o) * 20);
  }

  layout();
  return { layout: () => { layout(); update(last < 0 ? 0 : last, true); }, update, chapter: () => 1 };
}
