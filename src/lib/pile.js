/**
 * A pile of question pills that drop in and stack up (Matter.js).
 *
 * Deterministic on purpose: a fixed seed, fixed spawn schedule and a fixed
 * 60 Hz timestep (independent of the screen's refresh rate) give the same
 * pile at every rehearsal and on stage. `settle()` runs the whole simulation
 * at once, for when the presenter jumps past the drop.
 */
import Matter from 'matter-js';
import { rng } from './util.js';

const { Engine, Bodies, Composite, Events } = Matter;
const DT = 1000 / 60;
const SPAWN_MS = 105; // one pill every …
const SETTLE_MS = 4200; // long enough for the last pill to come to rest

export function createPile(container, items) {
  const pills = items.map((it) => {
    const el = document.createElement('div');
    el.className = 'pill';
    el.style.setProperty('--pill', it.color);
    el.style.setProperty('--pill-ink', it.ink);
    el.innerHTML = `<span class="pill__in">${it.text}</span>`;
    container.appendChild(el);
    return { el, inner: el.firstChild, w: 0, h: 0, body: null, key: '' };
  });

  let vw = 0, vh = 0, engine = null, simTime = 0, acc = 0, lastNow = 0, spawned = 0, plan = [];
  let squash = true;

  function layout() {
    vw = innerWidth;
    vh = innerHeight;
    pills.forEach((p) => { p.w = p.el.offsetWidth; p.h = p.el.offsetHeight; });
    if (engine) settle(); // re-run at the new size so the pile still fits
  }

  function reset() {
    if (engine) { Composite.clear(engine.world, false); Engine.clear(engine); }
    engine = null;
    pills.forEach((p) => { p.body = null; p.key = ''; p.el.style.visibility = 'hidden'; });
  }

  function start() {
    reset();
    // body ids decide collision order, so restart the global counters too
    Matter.Common._nextId = 0;
    Matter.Common._seed = 11;
    engine = Engine.create({ gravity: { x: 0, y: 1.25 } });
    const r = rng(42);
    // drop positions cluster around the centre, so the pile grows into a mound
    plan = pills.map((p, i) => ({
      at: i * SPAWN_MS,
      x: vw / 2 + (r() + r() + r() - 1.5) * vw * 0.16,
      angle: (r() - 0.5) * 0.5,
    }));
    const ground = vh - Math.max(24, vh * 0.04);
    const wallW = 200;
    Composite.add(engine.world, [
      Bodies.rectangle(vw / 2, ground + 100, vw * 2, 200, { isStatic: true, friction: 0.9 }),
      Bodies.rectangle(vw / 2 - vw * 0.46 - wallW / 2, vh / 2, wallW, vh * 3, { isStatic: true }),
      Bodies.rectangle(vw / 2 + vw * 0.46 + wallW / 2, vh / 2, wallW, vh * 3, { isStatic: true }),
    ]);
    Events.on(engine, 'collisionStart', (e) => {
      if (!squash) return;
      for (const pair of e.pairs) {
        for (const b of [pair.bodyA, pair.bodyB]) {
          if (b.pill && b.velocity.y > 4) bounce(b.pill, Math.min(1, b.velocity.y / 14));
        }
      }
    });
    simTime = 0;
    acc = 0;
    spawned = 0;
    lastNow = performance.now();
  }

  function spawnDue() {
    while (spawned < pills.length && plan[spawned].at <= simTime) {
      const p = pills[spawned], s = plan[spawned];
      p.body = Bodies.rectangle(s.x, -p.h - 20, p.w, p.h, {
        chamfer: { radius: p.h / 2 },
        angle: s.angle,
        restitution: 0.32,
        friction: 0.55,
        frictionStatic: 0.9,
        density: 0.0022,
      });
      p.body.pill = p;
      Composite.add(engine.world, p.body);
      p.el.style.visibility = 'visible';
      spawned++;
    }
  }

  function stepOnce() {
    spawnDue();
    Engine.update(engine, DT);
    simTime += DT;
  }

  /** advance in real time with a fixed timestep */
  function tick(now) {
    if (!engine || simTime >= SETTLE_MS) return;
    acc += Math.min(100, now - lastNow);
    lastNow = now;
    while (acc >= DT && simTime < SETTLE_MS) { stepOnce(); acc -= DT; }
    render();
  }

  /** run the whole drop instantly (presenter jumped past it) */
  function settle() {
    start();
    squash = false;
    while (simTime < SETTLE_MS) stepOnce();
    squash = true;
    render();
  }

  function render() {
    for (const p of pills) {
      if (!p.body) continue;
      const { x, y } = p.body.position;
      const key = `${x.toFixed(1)}|${y.toFixed(1)}|${p.body.angle.toFixed(3)}`;
      if (key === p.key) continue;
      p.key = key;
      p.el.style.transform = `translate(${x - p.w / 2}px, ${y - p.h / 2}px) rotate(${p.body.angle}rad)`;
    }
  }

  // Pixar-style landing: squash, then spring back
  function bounce(p, k) {
    p.inner.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: `scale(${1 + 0.14 * k}, ${1 - 0.22 * k})`, offset: 0.25 },
        { transform: `scale(${1 - 0.05 * k}, ${1 + 0.08 * k})`, offset: 0.6 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 420, easing: 'ease-out' },
    );
  }

  return {
    layout,
    start,
    settle,
    reset,
    tick,
    get started() { return !!engine; },
  };
}
