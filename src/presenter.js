/**
 * PRESENTER — deterministic beats for a 5-minute live talk.
 *
 *   → / Space / PageDown   next beat   (works with presentation clickers)
 *   ← / PageUp             previous beat
 *   1 – 4                  jump to chapter
 *   Home                   back to the start
 *   P                      toggle presenter HUD (beat, timer, talking point)
 *   T                      reset timer
 *   F                      fullscreen
 *
 * Free scrolling still works at any time; beats just make the rhythm repeatable.
 * `dur` is the travel time to reach that beat (seconds).
 */
const BEATS = [
  { s: 'open', p: 0, dur: 1.2, note: '（不說話）讓作品自己出場：品牌、包裝、平面、AI、音樂封面。' },
  { s: 'open', p: 0.149, dur: 3.4, note: '穿過作品。每一件都在不同市場、不同受眾之間做轉譯。' },
  { s: 'open', p: 0.286, dur: 2.8, note: '（作品退到畫面四周，繼續漂浮）' },
  { s: 'open', p: 0.411, dur: 2.6, note: '光球出現，第一批作品被吸進去。這些作品看起來很分散，但背後是同一種能力——' },
  { s: 'open', p: 0.497, dur: 2, note: 'Seeing beyond the surface：看穿表面。' },
  { s: 'open', p: 0.6, dur: 2, note: 'Connecting the dots：把分散的資訊連起來。' },
  { s: 'open', p: 0.703, dur: 2, note: 'Distilling what matters：提煉出真正重要的事。' },
  { s: 'open', p: 0.891, dur: 3.4, note: 'INTERPRETER：把複雜轉譯成可執行的策略。' },
  { s: 'nur', p: 0.14, dur: 2.6, note: 'NURSTYLE：從真實顧客問題出發。問題散落在 IG、LINE、評論、Email。' },
  { s: 'nur', p: 0.39, dur: 2.6, note: '我把這些問題整理成四個決策接觸點，FAQ 是其中之一。這是改版前。' },
  { s: 'nur', p: 0.6, dur: 2.4, note: '改版後：結構清楚，AI 讀得懂。' },
  { s: 'nur', p: 0.82, dur: 3, note: 'AI 搜尋測試：品牌頁面被引用與推薦。結構清楚的資訊，才會被 AI 引用。' },
  { s: 'map', p: 0.1, dur: 2.4, note: '把這個能力延伸到下一個問題：餐飲業的第二曲線。' },
  { s: 'map', p: 0.7, dur: 4, note: '台灣餐飲出海 2.0：從輸出服務，到輸出產品、風味與文化價值。' },
  { s: 'map', p: 0.9, dur: 2, note: '問題：沒有 Global BD 團隊，怎麼降低海外市場探索成本？' },
  { s: 'compass', p: 0.22, dur: 2.6, note: 'EXPORT COMPASS：我正在開發的 AI 市場探索工作台。' },
  { s: 'compass', p: 0.75, dur: 3.4, note: '從自然語言描述產品 → 定價、通路與買方、法規路徑、同業借鏡。' },
  { s: 'compass', p: 1, dur: 2, note: '進入 Demo。' },
];
const CHAPTER_BEAT = [0, 7, 12, 15];

export function createPresenter({ lenis, yFor }) {
  const hud = document.getElementById('hud');
  const hudBeat = document.getElementById('hudBeat');
  const hudTime = document.getElementById('hudTime');
  const hudNote = document.getElementById('hudNote');
  let t0 = null;
  let target = 0; // index of the beat we are at / heading to

  const y = (b) => yFor(b.s, b.p);

  /** beat at or right before the current scroll position */
  function currentIndex() {
    const s = lenis.scroll + 4;
    let idx = 0;
    BEATS.forEach((b, i) => { if (y(b) <= s) idx = i; });
    return idx;
  }

  function go(i) {
    i = Math.max(0, Math.min(BEATS.length - 1, i));
    target = i;
    if (t0 === null && i > 0) t0 = performance.now();
    const b = BEATS[i];
    lenis.scrollTo(y(b), {
      duration: b.dur,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      lock: true,
      force: true,
    });
    paint();
  }

  function paint() {
    hudBeat.textContent = `${target + 1}/${BEATS.length}`;
    hudNote.textContent = BEATS[target].note;
  }

  // While a beat animation is running, `next` continues from the target,
  // not from the in-between scroll position — rapid clicks never skip.
  const isMoving = () => lenis.isScrolling === 'smooth';

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const base = isMoving() ? target : currentIndex();
    const atBeat = Math.abs(lenis.scroll - y(BEATS[base])) < 6;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') {
      e.preventDefault();
      go(isMoving() || atBeat ? base + 1 : currentIndex() + 1);
    } else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') {
      e.preventDefault();
      go(isMoving() || atBeat ? base - 1 : currentIndex());
    } else if (k === 'Home') {
      e.preventDefault(); go(0);
    } else if (/^[1-4]$/.test(k)) {
      go(CHAPTER_BEAT[+k - 1]);
    } else if (k === 'p' || k === 'P') {
      hud.hidden = !hud.hidden;
      target = currentIndex();
      paint();
    } else if (k === 't' || k === 'T') {
      t0 = performance.now();
    } else if (k === 'f' || k === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
  });

  setInterval(() => {
    if (hud.hidden) return;
    const s = t0 === null ? 0 : Math.floor((performance.now() - t0) / 1000);
    hudTime.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    hudTime.style.color = s > 270 ? '#ff4a1c' : '';
    if (!isMoving()) { target = currentIndex(); paint(); }
  }, 250);

  paint();
  return { go };
}
