/**
 * 02 NURSTYLE — real customer questions → FAQ before/after → cited by AI.
 * Same visual language as the opening: things float around the edges and get
 * pulled in. Here they are pulled into a card that rises from below (Maze-style).
 *
 *  0.00 ─ 0.30  questions float around the headline
 *  0.27 ─ 0.38  questions are pulled in; the case card rises
 *  0.42 ─ 0.58  the FAQ page wipes from Before to After
 *  0.50 ─ 0.70  dusk rises behind the card: plum → rose → full peach
 *  0.70 ─ 0.88  on peach: the takeaway, and the AI answer citing the page
 *  0.86 ─ 0.98  peach sinks back into night, ready for the map
 */
import { QUESTIONS, TOUCHPOINTS, AI_ANSWER, FAQ_SHOTS } from '../data/content.js';
import { lerp, range, ease, rng, fx } from '../lib/util.js';

const CITED_AT = [0.74, 0.9]; // typing runs while p is inside this range
const Q_MS = 32, A_MS = 18; // per character

export function createNur(root) {
  const $ = (s) => root.querySelector(s);
  const head = $('#nurHead');
  const field = $('#nurField');
  const card = $('#caseCard');
  const before = $('#baBefore'), after = $('#baAfter'), line = $('#baLine');
  const tagBefore = $('.ba__tag--before');
  const skyRose = $('#skyRose'), skyPeach = $('#skyPeach');
  const citedTitle = $('.cited__title');
  const ai = $('#ai');
  const aiQ = $('#aiQ'), aiA = $('#aiA'), aiCite = $('#aiCite');

  // tabs: the four decision touchpoints, FAQ in focus
  $('#caseTabs').innerHTML = TOUCHPOINTS.map(
    (t) => `<span class="case__tab${t.id === 'faq' ? ' is-on' : ''}">${t.zh}</span>`,
  ).join('');

  before.innerHTML = FAQ_SHOTS.before ? `<img src="${FAQ_SHOTS.before}" alt="FAQ before" />` : MOCK_BEFORE;
  after.innerHTML = FAQ_SHOTS.after ? `<img src="${FAQ_SHOTS.after}" alt="FAQ after" />` : MOCK_AFTER;

  // ── question chips ────────────────────────────────────────
  const r = rng(23);
  const chips = QUESTIONS.map((q, i) => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.innerHTML = `<span>${q.q}</span><small>${q.src}</small>`;
    field.appendChild(el);
    return { el, i, a: 0, band: 0.82 + r() * 0.3, jitter: (r() - 0.5) * 0.3, phase: r() * 6.28, pull: r(), w: 0, h: 0, x: 0, y: 0 };
  });

  let vw, vh;
  function layout() {
    vw = innerWidth;
    vh = innerHeight;
    const n = chips.length;
    chips.forEach((c, k) => {
      c.w = c.el.offsetWidth;
      c.h = c.el.offsetHeight;
      const a = (k / n) * Math.PI * 2 + c.jitter;
      c.x = Math.cos(a) * vw * 0.36 * c.band;
      c.y = Math.sin(a) * vh * 0.36 * c.band;
      c.el._fx = null;
    });
  }

  // ── AI answer typing (triggered, time-based) ──────────────
  const typing = { on: false, start: 0 };
  (function loop() {
    if (typing.on) {
      const t = performance.now() - typing.start;
      const nq = Math.min(AI_ANSWER.query.length, Math.floor(t / Q_MS));
      const tA = t - AI_ANSWER.query.length * Q_MS - 250;
      const na = tA > 0 ? Math.min(AI_ANSWER.answer.length, Math.floor(tA / A_MS)) : 0;
      const q = AI_ANSWER.query.slice(0, nq);
      if (aiQ.textContent !== q) aiQ.textContent = q;
      const ans = AI_ANSWER.answer.slice(0, na).replace(/NURSTYLE/g, '<mark>NURSTYLE</mark>');
      if (aiA._html !== ans) { aiA._html = ans; aiA.innerHTML = ans; }
      aiCite.classList.toggle('is-on', na >= AI_ANSWER.answer.length);
    }
    requestAnimationFrame(loop);
  })();

  let last = -1;
  function update(p, force) {
    const floating = p > 0 && p < 0.4; // chips drift even when the scroll is still
    if (!force && !floating && Math.abs(p - last) < 1e-5) return;
    last = p;
    const now = performance.now() / 1000;

    // headline
    const hin = ease.out(range(p, 0, 0.07));
    const hout = ease.inOut(range(p, 0.24, 0.3));
    fx(head, hin * (1 - hout), (1 - hin) * 40 - hout * 50);

    // chips: float around the headline, then get pulled into the rising card
    for (const c of chips) {
      const tin = ease.out(range(p, 0.02 + c.i * 0.007, 0.07 + c.i * 0.007));
      const d0 = 0.27 + c.pull * 0.05;
      const tp = range(p, d0, d0 + 0.05);
      const e = ease.in(tp);
      const fl = 1 - e;
      let x = c.x + Math.sin(now * 0.4 + c.phase) * 10 * fl;
      let y = c.y + Math.cos(now * 0.33 + c.phase * 1.2) * 12 * fl + (1 - tin) * 30;
      const ang = Math.atan2(y, x) + 0.9 * e, rad = Math.hypot(x, y) * (1 - e);
      x = Math.cos(ang) * rad;
      y = Math.sin(ang) * rad + vh * 0.02 * e;
      const s = lerp(1, 0.4, e);
      const o = tin * (1 - range(tp, 0.6, 1));
      const key = `${x | 0}|${y | 0}|${s.toFixed(3)}|${o.toFixed(3)}`;
      if (c.el._fx !== key) {
        c.el._fx = key;
        c.el.style.opacity = o;
        c.el.style.visibility = o < 0.002 ? 'hidden' : 'visible';
        c.el.style.transform = `translate(${x - c.w / 2}px, ${y - c.h / 2}px) scale(${s})`;
      }
    }

    // the case card rises, holds, then gives way to the peach
    const cin = ease.out(range(p, 0.29, 0.38));
    const cout = ease.inOut(range(p, 0.64, 0.7));
    card.style.opacity = Math.min(1, cin * 2) * (1 - cout);
    card.style.visibility = cin * (1 - cout) < 0.002 ? 'hidden' : 'visible';
    card.style.transform = `translate(-50%, -50%) translateY(${(1 - cin) * 70 - cout * 4}vh) scale(${1 - cout * 0.03})`;

    // before → after wipe
    const v = 100 * (1 - ease.inOut(range(p, 0.42, 0.58)));
    before.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    line.style.left = `${v}%`;
    line.style.opacity = v > 0.5 && v < 99.5 ? 1 : 0;
    tagBefore.style.opacity = range(v, 4, 14); // off once the page is all After

    // dusk rising to full peach, then sinking back to night
    const rose = range(p, 0.5, 0.62) * (1 - range(p, 0.9, 0.98));
    const peach = range(p, 0.6, 0.7) * (1 - range(p, 0.86, 0.95));
    skyRose.style.opacity = rose;
    skyPeach.style.opacity = peach;
    document.body.classList.toggle('is-light', peach > 0.5);

    // climax: takeaway + AI answer
    const tt = ease.out(range(p, 0.7, 0.75));
    const ta = ease.out(range(p, 0.73, 0.78));
    const out = range(p, 0.86, 0.9);
    fx(citedTitle, tt * (1 - out), (1 - tt) * 40);
    fx(ai, ta * (1 - out), (1 - ta) * 50);
    const on = p >= CITED_AT[0] && p < CITED_AT[1];
    if (on !== typing.on) {
      typing.on = on;
      typing.start = performance.now();
      if (!on) { aiQ.textContent = ''; aiA.innerHTML = ''; aiA._html = ''; aiCite.classList.remove('is-on'); }
    }
  }

  aiCite.textContent = `↳ 引用來源：${AI_ANSWER.cite}`;
  layout();
  return { layout: () => { layout(); update(last < 0 ? 0 : last, true); }, update, chapter: () => 1 };
}

// ── placeholder FAQ screens (until real screenshots are dropped in) ─────────
const MOCK_BEFORE = `<div class="mock mock--before">
  <div class="m-nav"><b>首頁</b><span>商品</span><span>關於我們</span><span>聯絡我們</span><span>常見問題</span></div>
  <h4>常見問題 Q&amp;A</h4>
  <p>Q：請問尺寸怎麼挑？A：請參考商品頁尺寸表，如有問題請私訊客服，我們會盡快回覆您，謝謝。Q：可以退換貨嗎？A：商品到貨七天內可申請，請保持商品完整，運費需自行負擔，詳情請洽客服。</p>
  <p>Q：有門市嗎？A：目前無實體門市。Q：多久出貨？A：一般 3–5 個工作天，預購商品另計。Q：可以開統編嗎？A：可以，請於備註欄填寫。Q：團購有優惠嗎？A：請私訊。</p>
  <p>Q：布料會透嗎？A：不會。Q：可以繡字嗎？A：可以，另計費用。Q：洗了會縮水嗎？A：建議冷水手洗。Q：可以試穿嗎？A：請私訊詢問。</p>
  <p>※ 以上若有未盡事宜，本公司保留修改權利。</p>
</div>`;

const MOCK_AFTER = `<div class="mock mock--after">
  <h4>常見問題</h4>
  <div class="m-cats"><span>尺寸與試穿</span><span>團體採購</span><span>出貨與售後</span><span>布料與保養</span></div>
  <div class="m-q is-open">可以先預約試穿嗎？<em>可以。我們提供預約試穿與尺寸建議，平日與週末皆可預約，也能寄送樣衣到單位。</em></div>
  <div class="m-q">單位一起訂購，有團購方案嗎？<span>＋</span></div>
  <div class="m-q">值班 12 小時，穿起來會悶嗎？<span>＋</span></div>
  <div class="m-q">多久可以出貨？<span>＋</span></div>
  <span class="m-schema">FAQPage schema</span>
</div>`;
