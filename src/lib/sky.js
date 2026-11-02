/**
 * The shared sky behind the map and Export Compass: one fixed layer, so the
 * two sections can hand over without a seam. Each scene reports its own dawn
 * level; the compass takes over once it has started.
 *
 *   level 0      ink night (no glow)
 *   level 0..1   the glow rises from the horizon (map)
 *   level 1..2   daybreak: the glow climbs higher (compass)
 */
const el = document.getElementById('skyGlobal');
const dawn = document.getElementById('skyDawn');
const end = document.getElementById('skyEnd');
const state = { map: 0, mapOn: false, compass: null };
let lastKey = '';

function paint() {
  const L = state.compass ?? state.map;
  const on = state.mapOn || state.compass !== null;
  const key = `${on}|${L.toFixed(4)}`;
  if (key === lastKey) return;
  lastKey = key;
  el.style.opacity = on ? 1 : 0;
  const rise = Math.min(1, L), climb = Math.max(0, L - 1);
  dawn.style.opacity = rise;
  dawn.style.transform = `translateY(${(1 - rise) * 30}vh) scale(${1 + climb * 0.9})`; // daybreak: the glow grows taller
}

/** map: p > 0 means the map owns the screen; level 0..1 */
export function setMapSky(p, level) {
  state.mapOn = p > 0;
  state.map = level;
  paint();
}

/** the closing glow, 0..1 (mirror of the opening's plum glow) */
export function setEndGlow(v) {
  end.style.opacity = v;
}

/** compass: null while it hasn't started, else level 0..2 */
export function setCompassSky(level) {
  state.compass = level;
  paint();
}
