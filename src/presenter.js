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
  { s: 'open', p: 0.152, dur: 3.4, note: '穿過作品。每一件都在不同市場、不同受眾之間做轉譯。' },
  { s: 'open', p: 0.292, dur: 2.8, note: '（作品退到畫面四周，繼續漂浮）' },
  { s: 'open', p: 0.42, dur: 2.6, note: '光球出現，第一批作品被吸進去。這些作品看起來很分散，但背後是同一種能力——' },
  { s: 'open', p: 0.508, dur: 2, note: 'Seeing beyond the surface：看穿表面。' },
  { s: 'open', p: 0.613, dur: 2, note: 'Connecting the dots：把分散的資訊連起來。' },
  { s: 'open', p: 0.718, dur: 2, note: 'Distilling what matters：提煉出真正重要的事。' },
  { s: 'open', p: 0.91, dur: 3.4, note: 'INTERPRETER：把複雜轉譯成可執行的策略。' },
  { s: 'nur', p: 0.04, dur: 2.8, note: '這些是 NURSTYLE 顧客真實會問的問題，散落在各個管道。' },
  { s: 'nur', p: 0.078, dur: 1.4, note: '從跨市場的品牌溝通，到 AI 時代的資訊轉譯。' },
  { s: 'nur', p: 0.11, dur: 1.6, note: '我把它們整理成四個決策接觸點，FAQ 是其中之一。這是改版前：主視覺很大，問題只看得到三題。' },
  { s: 'nur', p: 0.27, dur: 2.4, note: '改版後：人看到的是整齊收合的問題。' },
  { s: 'nur', p: 0.42, dur: 2.6, note: '但 AI 讀到的是每一題：內容都寫在頁面裡，爬蟲完整讀得到。' },
  { s: 'nur', p: 0.66, dur: 3, note: '成果：沒提品牌的診所問題，10 題裡 AI 推薦了 7 題；我寫的 FAQ、團購、試穿頁有 6 題被引用。' },
  { s: 'map', p: 0.1, dur: 2.4, note: '把這個能力延伸到下一個問題：餐飲業的第二曲線。' },
  { s: 'map', p: 0.7, dur: 4, note: '台灣餐飲出海 2.0：從輸出服務，到輸出產品、風味與文化價值。' },
  { s: 'map', p: 0.9, dur: 2, note: '問題：沒有 Global BD 團隊，怎麼降低海外市場探索成本？' },
  { s: 'compass', p: 0.64, dur: 2.8, note: 'EXPORT COMPASS：我正在開發的 AI 市場探索工作台。從自然語言描述產品，整合定價、通路與買方、法規路徑與同業借鏡。點 Where next 進入 Demo（會開新分頁）。' },
  { s: 'compass', p: 1, dur: 2.4, note: '（結束：畫面收成黑色）' },
];
const CHAPTER_BEAT = [0, 7, 14, 17];

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
