export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/** progress of p inside [a, b], clamped to 0..1 */
export const range = (p, a, b) => clamp((p - a) / (b - a));

export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  in: (t) => t * t * t,
  inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
};

/** deterministic PRNG so the composition is identical on every run */
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** fade + translate helper; skips DOM writes when nothing changed */
export function fx(el, o = 1, y = 0, x = 0, s = 1) {
  const key = `${o.toFixed(3)}|${y.toFixed(1)}|${x.toFixed(1)}|${s.toFixed(3)}`;
  if (el._fx === key) return;
  el._fx = key;
  el.style.opacity = o;
  el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
  el.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
}

/** reveal `text` progressively, t in 0..1 */
export const typeText = (text, t) => text.slice(0, Math.round(text.length * clamp(t)));
