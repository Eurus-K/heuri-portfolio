/**
 * 04 EXPORT COMPASS — the last scene. The title and compass arrive, the needle
 * settles on a heading, and a single pill opens the live demo in a new tab.
 * The dawn gives way to the opening's plum glow, mirrored from the bottom, so
 * the talk ends where it began. The page ends on this frame.
 *
 * Timeline (p, after the shared first screen; see s0 below):
 *  0.00 ─ 0.40  title and compass arrive; needle searches, then settles
 *  0.45 ─ 0.60  the demo pill rises in, then the frame holds to the end
 */
import { COMPASS } from '../data/content.js';
import { range, lerp, ease, fx } from '../lib/util.js';
import { setCompassSky, setEndGlow } from '../lib/sky.js';

export function createCompass(root) {
  const $ = (s) => root.querySelector(s);
  const head = $('#cmpHead');
  const rose = $('#cmpRose');
  const needle = $('#roseNeedle');
  const ticks = $('#roseTicks');
  const cta = $('#enterDemo');

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

  // opens the live demo in a new tab, so the presentation stays where it is
  if (COMPASS.url) cta.href = COMPASS.url;
  else cta.addEventListener('click', (e) => e.preventDefault());

  let last = -1;
  function update(raw, force) {
    if (!force && Math.abs(raw - last) < 1e-5) return;
    last = raw;
    // the first screen is shared with the map leaving above (sections overlap),
    // so the compass timeline starts once the map has scrolled away
    const s0 = innerHeight / Math.max(1, root.offsetHeight - innerHeight);
    const p = range(raw, s0, 1);
    const arrive = ease.out(range(raw, s0 * 0.85, s0 + 0.04));

    // the dawn from the map gives way to the closing plum glow as the compass arrives
    const swap = ease.inOut(range(raw, s0 * 0.5, s0 + 0.12));
    setCompassSky(raw > 0 ? 0.65 * (1 - swap) : null);
    setEndGlow(raw > 0 ? swap : 0);

    // needle: searches, overshoots, settles on a heading
    const n = range(p, 0.02, 0.4);
    const angle = lerp(-140, 52, ease.out(n)) + Math.sin(n * Math.PI * 3) * 18 * (1 - n);
    needle.setAttribute('transform', `rotate(${angle})`);

    // the head moves via `top` + its own transform, so fade/lift it with opacity + margin
    head.style.opacity = arrive;
    head.style.marginTop = `${(1 - arrive) * 40}px`;
    rose.style.opacity = arrive;

    const c = ease.out(range(p, 0.45, 0.6));
    fx(cta, c, (1 - c) * 24);
    cta.classList.toggle('is-live', c > 0.5);

  }

  return { layout: () => update(last < 0 ? 0 : last, true), update, chapter: () => 3 };
}
