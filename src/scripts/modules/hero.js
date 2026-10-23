/*
 * Hero « Le point rejoint le réseau ».
 * Le visuel statique (rendu du même shader) s’affiche immédiatement ; la scène WebGL
 * prend le relais après le chargement, pendant un temps mort du navigateur.
 * Le point isolé obéit à un ressort : il est attiré par le pointeur, peut être saisi
 * à la souris, rejoint la forme au toucher et fusionne avec elle au fil du défilement.
 */
import { $, reduceMotion, finePointer, clamp, lerp, smoothstep, onIdle } from '../core.js';
import { loadLogo } from '../gl/logo-loader.js';


export function initHero() {
  const hero = $('[data-hero]');
  const canvas = hero && $('[data-hero-canvas]', hero);
  if (!hero || !canvas) return;
  const stage = $('[data-hero-stage]', hero);
  const stateLabel = $('[data-hero-state]', hero);
  const hint = $('[data-hero-hint]', hero);
  if (hint && !finePointer.matches) hint.textContent = 'Touchez le point : il rejoint le réseau.';

  const connection = navigator.connection;
  if (reduceMotion.matches || connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory < 2)) return;

  const go = () => onIdle(() => start().catch((error) => console.warn('[pridano] Scène 3D désactivée :', error)), 2500);
  const ready = () => (document.readyState === 'complete' ? go() : window.addEventListener('load', go, { once: true }));
  /*
   * Pendant la cinématique d’ouverture, le film pilote le même objet 3D. À la fin, il rend le
   * canevas au hero (detail.scene) et la scène interactive démarre exactement là où le film s’arrête.
   */
  if (document.documentElement.classList.contains('has-intro')) {
    window.addEventListener('pt:intro-end', (e) => (e.detail?.loaded ? start(e.detail.loaded).catch(() => {}) : ready()), { once: true });
  } else ready();

  async function start(handoff = null) {
    const loaded = handoff || await loadLogo(canvas);
    if (!loaded) {
      hero.dataset.scene = 'static';
      return;
    }
    const { scene, geo } = loaded;
    hero.dataset.scene = 'webgl';
    if (handoff) stage.classList.add('is-live');

    const rest = [geo.dot[0], geo.dot[1]];
    const radius = geo.dot[2];
    const dock = [-0.12, -0.03];
    const shapeCenter = [0.3, 0];
    const UNITS = 2.31;

    const pointer = { x: 0, y: 0, active: false, dragging: false, id: null };
    let pulseUntil = 0;
    let dx = rest[0], dy = rest[1], vx = 0, vy = 0;
    let yaw = -0.24, pitch = 0.1;
    let quality = finePointer.matches ? 0.9 : 0.72;
    let avg = 16;
    let slowStreak = 0;
    let frames = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    let size = { w: 1, h: 1 };
    let lastState = '';
    let interacted = false;
    let demoDone = false;

    const measure = () => {
      const r = canvas.getBoundingClientRect();
      size = { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    };
    measure();
    new ResizeObserver(measure).observe(canvas);

    const toObject = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      return [((clientX - r.left - r.width / 2) / r.height) * UNITS, (-(clientY - r.top - r.height / 2) / r.height) * UNITS];
    };

    hero.addEventListener('pointermove', (e) => {
      [pointer.x, pointer.y] = toObject(e.clientX, e.clientY);
      interacted = true;
      /* Indice de préhension : le curseur change au-dessus du point. */
      hero.classList.toggle('is-grabbable', e.pointerType === 'mouse' && Math.hypot(pointer.x - dx, pointer.y - dy) < radius * 1.3);
      pointer.active = e.pointerType !== 'touch' || pointer.dragging;
      resume();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      if (!pointer.dragging) pointer.active = false;
    });
    hero.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button, input, textarea, select')) return;
      const [x, y] = toObject(e.clientX, e.clientY);
      const near = Math.hypot(x - dx, y - dy) < radius * 1.3;
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        if (!near) return;
        pointer.dragging = true;
        pointer.id = e.pointerId;
        hero.setPointerCapture(e.pointerId);
        hero.classList.add('is-dragging');
        e.preventDefault();
      } else {
        const r = canvas.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) pulseUntil = performance.now() + 1700;
      }
      resume();
    });
    const release = () => {
      if (!pointer.dragging) return;
      pointer.dragging = false;
      hero.classList.remove('is-dragging');
      if (Math.hypot(dx - dock[0], dy - dock[1]) < 0.5) pulseUntil = performance.now() + 2200;
    };
    hero.addEventListener('pointerup', release);
    hero.addEventListener('pointercancel', release);

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume();
    }).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? (running = false) : resume()));
    resume();

    function resume() {
      if (running || !visible || document.hidden || !scene.ready) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }

    function frame(now) {
      if (!running || !visible || document.hidden) {
        running = false;
        return;
      }
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      /* Qualité adaptative : on vise la fluidité avant la définition. */
      avg = avg * 0.94 + (dt * 1000) * 0.06;
      if (++frames > 40) {
        if (avg > 24 && quality > 0.5) quality -= 0.08;
        else if (avg < 14 && quality < 1) quality += 0.04;
        frames = 0;
        /* Appareil trop lent même en qualité minimale : retour définitif au visuel statique. */
        if (avg > 45 && quality <= 0.5 && ++slowStreak > 2) {
          running = false;
          stage.classList.remove('is-live');
          hero.dataset.scene = 'static';
          scene.dispose();
          return;
        }
      }

      const scroll = smoothstep(0.03, 0.5, window.scrollY / Math.max(1, hero.offsetHeight));
      let tx = lerp(rest[0], dock[0], scroll) + Math.sin(t * 0.9) * 0.018;
      let ty = lerp(rest[1], dock[1], scroll) + Math.cos(t * 0.7) * 0.022;
      if (pointer.dragging) {
        tx = pointer.x;
        ty = pointer.y;
      } else {
        if (pointer.active) {
          const ex = pointer.x - tx, ey = pointer.y - ty;
          const d = Math.hypot(ex, ey);
          const pull = 0.24 / (1 + d * d * 0.9);
          tx += ex * pull;
          ty += ey * pull;
          const over = smoothstep(0.95, 0.42, Math.hypot(pointer.x - shapeCenter[0], pointer.y - shapeCenter[1]));
          tx = lerp(tx, dock[0], over * 0.9);
          ty = lerp(ty, dock[1], over * 0.9);
        }
        if (now < pulseUntil) {
          tx = dock[0];
          ty = dock[1];
        }
      }
      const reach = Math.hypot(tx, ty);
      if (reach > 1.12) {
        tx *= 1.12 / reach;
        ty *= 1.12 / reach;
      }

      const k = pointer.dragging ? 240 : 64;
      const c = pointer.dragging ? 24 : 9.5;
      vx += ((tx - dx) * k - vx * c) * dt;
      vy += ((ty - dy) * k - vy * c) * dt;
      dx += vx * dt;
      dy += vy * dt;

      const merge = smoothstep(0.64, 0.1, Math.hypot(dx - dock[0], dy - dock[1]));
      const lookX = pointer.active ? clamp(pointer.x * 0.12, -0.24, 0.24) : 0;
      const lookY = pointer.active ? clamp(-pointer.y * 0.1, -0.16, 0.16) : 0;
      yaw += (-0.24 + lookX + scroll * 0.4 - yaw) * Math.min(1, dt * 3);
      pitch += (0.1 + lookY - scroll * 0.06 - pitch) * Math.min(1, dt * 3);
      const stretch = 1 + Math.min(0.07, Math.hypot(vx, vy) * 0.018);

      const dpr = Math.min(window.devicePixelRatio || 1, 1.75) * quality;
      scene.render({
        width: Math.round(size.w * dpr),
        height: Math.round(size.h * dpr),
        time: t,
        dot: [dx, dy, radius * stretch],
        merge,
        yaw,
        pitch,
        roll: Math.sin(t * 0.35) * 0.025,
        zoom: 1,
        shift: [0, 0],
      });

      /* Le visuel statique ne s’efface qu’une fois la première image 3D réellement dessinée. */
      if (!stage.classList.contains('is-live')) {
        requestAnimationFrame(() => stage.classList.add('is-live'));
        /* Démonstration unique : sans interaction, le point rejoint une fois la forme puis revient. */
        setTimeout(() => {
          if (!interacted && !demoDone && window.scrollY < 40) pulseUntil = performance.now() + 1500;
          demoDone = true;
        }, 2600);
      }

      const state = merge > 0.55 ? 'connecté' : 'séparé';
      if (state !== lastState && stateLabel) {
        stateLabel.textContent = state;
        hero.classList.toggle('is-connected', state === 'connecté');
        lastState = state;
      }
      requestAnimationFrame(frame);
    }
  }
}
