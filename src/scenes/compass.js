/**
 * 04 EXPORT COMPASS — the needle settles, the compass opens into the
 * product window, which then goes full-bleed and hands over to the live demo.
 *
 *  0.00 ─ 0.28  wordmark + compass rose, needle searches then settles
 *  0.28 ─ 0.45  rose collapses, window opens
 *  0.45 ─ 0.75  product description → four modules → plan
 *  0.76 ─ 0.92  window goes full-bleed; demo iframe (if configured) fades in
 */
import { COMPASS } from '../data/content.js';
import { range, lerp, ease, fx, typeText } from '../lib/util.js';
import { setCompassSky } from '../lib/sky.js';

const PROMPT = '台灣手工鳳梨酥，想試探南加州與新加坡的通路。';

export function createCompass(root) {
  const $ = (s) => root.querySelector(s);
  const head = $('#cmpHead');
  const rose = $('#cmpRose');
  const needle = $('#roseNeedle');
  const ticks = $('#roseTicks');
  const win = $('#window');
  const body = $('#windowBody');
  const input = $('#previewInput');
  const mods = [...root.querySelectorAll('.mod')];
  const out = $('#previewOut');
  const enter = $('#enterDemo');
  const urlEl = $('#windowUrl');

  for (let a = 0; a < 360; a += 15) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const r0 = a % 90 === 0 ? 80 : 88;
    const rad = (a * Math.PI) / 180;
    l.setAttribute('x1', Math.sin(rad) * r0);
    l.setAttribute('y1', -Math.cos(rad) * r0);
    l.setAttribute('x2', Math.sin(rad) * 96);
    l.setAttribute('y2', -Math.cos(rad) * 96);
    ticks.appendChild(l);
  }

  let iframe = null;
  if (COMPASS.url) {
    urlEl.textContent = COMPASS.url.replace(/^https?:\/\//, '');
    enter.href = COMPASS.url;
  }
  enter.addEventListener('click', (e) => {
    if (!COMPASS.url) { e.preventDefault(); return; }
    if (COMPASS.openInIframe && iframe) {
      e.preventDefault();
      iframe.style.pointerEvents = 'auto';
      enter.style.opacity = 0;
      enter.classList.remove('is-live');
      win.classList.add('is-interactive');
    }
  });

  let last = -1;
  function update(raw, force) {
    if (!force && Math.abs(raw - last) < 1e-5) return;
    last = raw;
    // the first screen is shared with the map leaving above (sections overlap),
    // so the compass timeline starts once the map has scrolled away
    const s0 = innerHeight / Math.max(1, root.offsetHeight - innerHeight);
    const p = range(raw, s0, 1);
    const arrive = ease.out(range(raw, s0 * 0.85, s0 + 0.04));

    // needle: searches, overshoots, settles on a heading
    const n = range(p, 0.02, 0.26);
    const angle = lerp(-140, 52, ease.out(n)) + Math.sin(n * Math.PI * 3) * 18 * (1 - n);
    needle.setAttribute('transform', `rotate(${angle})`);

    // daybreak: carries on from the map's dawn (0.65) and climbs as the window opens
    setCompassSky(raw > 0 ? lerp(0.65, 1.7, ease.inOut(range(p, 0.05, 0.5))) : null);

    const open = ease.inOutQuart(range(p, 0.28, 0.44));
    fx(head, arrive * (1 - range(p, 0.26, 0.34)), (1 - arrive) * 40 - range(p, 0.26, 0.34) * 30);
    rose.style.opacity = arrive * (1 - open);
    rose.style.transform = `translateY(-50%) scale(${1 - open * 0.6}) rotate(${open * 90}deg)`;

    // window: opens from a line, then goes full-bleed
    const full = ease.inOutQuart(range(p, 0.76, 0.9));
    const ins = (1 - open) * 50;
    win.style.opacity = open > 0 ? 1 : 0;
    win.style.clipPath = `inset(${ins}% ${ins}% ${ins}% ${ins}%)`;
    win.style.width = lerp(72, 100, full) + 'vw';
    win.style.height = lerp(72, 100, full) + 'vh';

    input.textContent = typeText(PROMPT, range(p, 0.46, 0.56));
    mods.forEach((m, k) => m.classList.toggle('is-on', p > 0.57 + k * 0.035));
    out.style.opacity = range(p, 0.71, 0.74);

    if (COMPASS.url && COMPASS.openInIframe && full > 0.2 && !iframe) {
      iframe = document.createElement('iframe');
      iframe.src = COMPASS.url;
      iframe.style.opacity = 0;
      iframe.style.pointerEvents = 'none';
      iframe.style.transition = 'opacity 0.8s';
      iframe.style.background = 'var(--paper)';
      body.appendChild(iframe);
    }
    if (iframe) iframe.style.opacity = full > 0.95 ? 1 : 0;

    document.body.classList.toggle('is-handoff', full > 0.4);
    const e = range(p, 0.9, 0.94);
    enter.style.opacity = e;
    enter.classList.toggle('is-live', e > 0.5);
  }

  return { layout: () => update(last < 0 ? 0 : last, true), update, chapter: () => 3 };
}
