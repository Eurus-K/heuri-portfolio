/**
 * 02 NURSTYLE — real customer questions → FAQ before/after → cited by AI.
 *
 * Everything follows the scroll (Maze-style) except the drop and the typing.
 * The credits roll, the line and the card rise each take about one wheel step.
 *
 *  0.00         question pills drop in and pile up            (triggered, physics)
 *  ROLL         the pile rolls up and away like credits, accelerating
 *  LINE         the line rises in
 *  CARD         the card rises from below over the line; the sky turns flat night
 *  0.12 ─ 0.27  the FAQ page wipes from Before to After
 *  0.29 ─ 0.42  the After page scrolls down: every question AI can read
 *  0.42 ─ 0.58  dusk rises behind the card: night → rose → full peach
 *  0.60 ─ 0.88  on peach: the takeaway, and the AI answer citing the page
 *  0.86 ─ 0.98  peach sinks back into night, ready for the map
 */
import { QUESTIONS, TOUCHPOINTS, AI_ANSWER, FAQ_SHOTS } from '../data/content.js';
import { range, ease, rng, fx } from '../lib/util.js';
import { createPile } from '../lib/pile.js';

const PILL_COLORS = [
  { color: '#ff9478', ink: '#2a1424' }, // coral
  { color: '#6e7bf2', ink: '#ffffff' }, // periwinkle
  { color: '#f3ebe1', ink: '#2a1424' }, // cream sand
];
const DROP_LIVE = 0.035; // arriving later than this skips straight to the settled pile
// each ~one wheel step of scroll (about 0.025 of this scene)
const ROLL = [0.045, 0.07];
const LINE = [0.06, 0.077];
const CARD = [0.082, 0.107];
const AFTER_SCROLL = [0.29, 0.42];
const AFTER_END = 0.875; // where the questions end on the full-page capture (the footer starts below)
const CITED_AT = [0.63, 0.88]; // AI answer types while p is inside this range
const Q_MS = 32, A_MS = 18; // per character

export function createNur(root) {
  const $ = (s) => root.querySelector(s);
  const pileEl = $('#pile');
  const lineEl = $('#nurLine');
  const cardCol = $('#caseCol');
  const cardRise = $('#caseRise');
  const ba = $('#ba');
  const before = $('#baBefore'), after = $('#baAfter'), line = $('#baLine');
  const tagBefore = $('.ba__tag--before');
  const skyFlat = $('#skyFlat'), skyRose = $('#skyRose'), skyPeach = $('#skyPeach');
  const citedTitle = $('.cited__title');
  const ai = $('#ai');
  const aiQ = $('#aiQ'), aiA = $('#aiA'), aiCite = $('#aiCite');

  // the four decision touchpoints as glass buttons under the card, FAQ in focus
  $('#caseTabs').innerHTML = TOUCHPOINTS.map(
    (t) => `<span class="case__tab${t.id === 'faq' ? ' is-on' : ''}">${t.label}</span>`,
  ).join('');

  before.innerHTML = FAQ_SHOTS.before ? `<img src="${FAQ_SHOTS.before}" alt="FAQ before" />` : MOCK_BEFORE;
  after.innerHTML = FAQ_SHOTS.after ? `<img src="${FAQ_SHOTS.after}" alt="FAQ after" />` : MOCK_AFTER;

  // ── the pile: colours at random, but the same every run ──
  const r = rng(7);
  const pile = createPile(pileEl, QUESTIONS.map((q) => ({ text: q.q, ...PILL_COLORS[Math.floor(r() * 3)] })));

  // how far the full-page After capture can scroll inside the frame
  const afterImg = after.querySelector('img');
  let afterTravel = 0;
  const measureAfter = () => {
    afterTravel = afterImg ? Math.max(0, afterImg.offsetHeight * AFTER_END - ba.clientHeight) : 0;
    if (last >= 0) update(last, true);
  };
  afterImg?.addEventListener('load', measureAfter);

  function layout() {
    pile.layout();
    measureAfter();
  }

  // ── per-frame loop: physics + AI answer typing ────────────
  const typing = { on: false, start: 0 };
  (function loop(now) {
    pile.tick(now);
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
  })(performance.now());

  let last = -1;
  function update(p, force) {
    if (!force && Math.abs(p - last) < 1e-5) return;
    last = p;

    // the drop: plays live on arrival, settles instantly if we jumped past it
    if (p <= 0.002) {
      if (pile.started) pile.reset();
    } else if (!pile.started) {
      p < DROP_LIVE ? pile.start() : pile.settle();
    }

    // credits roll: slow off the mark, then fast and gone
    const roll = range(p, ROLL[0], ROLL[1]);
    pileEl.style.transform = `translateY(${-ease.in(roll) * 130}vh)`;
    pileEl.style.opacity = 1 - range(roll, 0.7, 1);

    // the line rises in; the card then rises over it
    const lin = ease.out(range(p, LINE[0], LINE[1]));
    fx(lineEl, lin, (1 - lin) * 40);
    const cin = ease.out(range(p, CARD[0], CARD[1]));
    cardRise.style.transform = `translateY(${(1 - cin) * 100}vh)`;
    // the card section sits on flat night (Maze-style: plain ground, plain card)
    skyFlat.style.opacity = cin * (1 - range(p, 0.86, 0.94));

    // the card holds, then gives way to the peach
    const cout = ease.inOut(range(p, 0.56, 0.6));
    cardCol.style.opacity = 1 - cout;
    cardCol.style.visibility = cout > 0.998 ? 'hidden' : 'visible';
    cardCol.style.transform = `translate(-50%, -50%) translateY(${-cout * 4}vh) scale(${1 - cout * 0.03})`;

    // before → after wipe, then the After page scrolls down to show everything
    const v = 100 * (1 - ease.inOut(range(p, 0.12, 0.27)));
    if (!afterTravel && afterImg?.complete) afterTravel = Math.max(0, afterImg.offsetHeight * AFTER_END - ba.clientHeight); // cached image: load fired early
    if (afterImg) afterImg.style.transform = `translateY(${-ease.inOut(range(p, AFTER_SCROLL[0], AFTER_SCROLL[1])) * afterTravel}px)`;
    before.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    line.style.left = `${v}%`;
    line.style.opacity = v > 0.5 && v < 99.5 ? 1 : 0;
    tagBefore.style.opacity = range(v, 4, 14); // off once the page is all After

    // dusk rising to full peach, then sinking back to night
    const rose = range(p, 0.42, 0.52) * (1 - range(p, 0.9, 0.98));
    const peach = range(p, 0.5, 0.58) * (1 - range(p, 0.86, 0.93));
    skyRose.style.opacity = rose;
    skyPeach.style.opacity = peach;
    document.body.classList.toggle('is-light', peach > 0.5);

    // climax: takeaway + AI answer
    const tt = ease.out(range(p, 0.6, 0.64));
    const ta = ease.out(range(p, 0.62, 0.67));
    const out = range(p, 0.85, 0.88);
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

// After: wording taken from the NURSTYLE FAQ corpus (2026-06-01)
const MOCK_AFTER = `<div class="mock mock--after">
  <h4>常見問題</h4>
  <div class="m-cats"><span>商品選購</span><span>訂單與購物</span><span>配送與交期</span><span>發票相關</span><span>退貨與退款</span><span>會員與帳號</span></div>
  <div class="m-q is-open">可以試穿嗎？怎麼申請？<em>可以。NURSTYLE 提供現場試穿與商品寄送試穿服務兩種方式，可依照所在地區與需求選擇，再透過 LINE 提出申請。</em></div>
  <div class="m-q">尺寸怎麼選？<span>＋</span></div>
  <div class="m-q">團體採購有優惠嗎？<span>＋</span></div>
  <div class="m-q">商品多久會出貨？<span>＋</span></div>
  <span class="m-schema">FAQPage schema</span>
</div>`;
