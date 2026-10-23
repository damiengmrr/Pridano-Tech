/* Outils partagés : préférences de mouvement, maths, ordonnanceur unique de défilement. */

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
export const desktop = window.matchMedia('(min-width: 1024px)');

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/*
 * Effets liés au défilement. Un seul rAF par frame, et seulement pour les éléments
 * proches de l’écran (IntersectionObserver). Deux modes :
 *  - 'pin'     : 0 quand le haut de l’élément touche le haut de l’écran, 1 quand son bas touche le bas
 *  - 'through' : 0 quand l’élément entre par le bas, 1 quand il sort par le haut
 */
const effects = new Map();
let scheduled = false;
let viewport = window.innerHeight;

function run() {
  scheduled = false;
  for (const [el, effect] of effects) {
    if (!effect.active) continue;
    const rect = el.getBoundingClientRect();
    let p;
    if (effect.mode === 'pin') {
      const span = rect.height - viewport;
      p = span > 0 ? clamp(-rect.top / span) : (rect.top < 0 ? 1 : 0);
    } else {
      const start = viewport * (effect.start ?? 1);
      const end = -rect.height * (effect.end ?? 1);
      p = clamp((start - rect.top) / (start - end));
    }
    if (p !== effect.last) {
      effect.last = p;
      effect.update(p, rect);
    }
  }
}

export function requestTick() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(run);
  }
}

const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const effect = effects.get(entry.target);
    if (effect) effect.active = entry.isIntersecting;
  }
  requestTick();
}, { rootMargin: '25% 0px 25% 0px' }) : null;

export function onScroll(el, update, options = {}) {
  if (!el) return () => {};
  const effect = { update, mode: options.mode || 'through', start: options.start, end: options.end, active: !io, last: -1 };
  effects.set(el, effect);
  io?.observe(el);
  requestTick();
  return () => {
    effects.delete(el);
    io?.unobserve(el);
  };
}

export function refresh() {
  for (const effect of effects.values()) effect.last = -1;
  requestTick();
}

window.addEventListener('scroll', requestTick, { passive: true });
window.addEventListener('resize', () => {
  viewport = window.innerHeight;
  refresh();
}, { passive: true });

export function scrollToProgress(el, p) {
  const rect = el.getBoundingClientRect();
  const span = rect.height - window.innerHeight;
  const top = window.scrollY + rect.top + span * clamp(p);
  window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
}

export function onIdle(fn, timeout = 1500) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout });
  else window.setTimeout(fn, 200);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
