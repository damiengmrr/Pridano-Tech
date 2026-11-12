/* Micro-interactions : apparitions, boutons magnétiques, curseur « point ». */
import { $, $$, reduceMotion, finePointer } from '../core.js';

export function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const pending = new Set(items);
  const show = (el) => {
    el.classList.add('is-in');
    pending.delete(el);
    io.unobserve(el);
  };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) show(entry.target);
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach((el) => io.observe(el));
  /*
   * Filet de sécurité : un glissé rapide au doigt peut faire traverser l’écran à un bloc entre
   * deux mesures de l’observateur. Tout bloc déjà passé au-dessus du bas de l’écran est affiché.
   */
  let queued = false;
  const sweep = () => {
    queued = false;
    const limit = window.innerHeight * 0.94;
    for (const el of pending) if (el.getBoundingClientRect().top < limit) show(el);
    if (!pending.size) window.removeEventListener('scroll', onScroll);
  };
  const onScroll = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(sweep);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  /* Filet de sécurité : rien ne doit rester invisible (impression, ancres, agents). */
  window.addEventListener('beforeprint', () => items.forEach((el) => el.classList.add('is-in')));
  window.addEventListener('hashchange', () => items.forEach((el) => el.classList.add('is-in')), { once: true });
}

/* Le remplissage part du point d’entrée du pointeur ; léger aimant sur pointeur fin. */
export function initMagnetic() {
  const buttons = $$('[data-magnetic], .btn');
  const magnetic = finePointer.matches && !reduceMotion.matches;
  for (const btn of buttons) {
    btn.addEventListener('pointerenter', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--x', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--y', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    if (!magnetic) continue;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.setProperty('--mx', `${(dx * 10).toFixed(2)}px`);
      btn.style.setProperty('--my', `${(dy * 8).toFixed(2)}px`);
    });
    btn.addEventListener('pointerleave', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--x', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--y', `${((e.clientY - r.top) / r.height) * 100}%`);
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  }
}

/*
 * Démos au survol (qualités d’un site) : sur un écran tactile il n’y a pas de survol,
 * la démo se joue donc quand la carte est bien visible à l’écran.
 */
export function initPlayInView() {
  const tiles = $$('.q-tile');
  if (!tiles.length || finePointer.matches || reduceMotion.matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.classList.toggle('is-play', entry.isIntersecting);
  }, { threshold: 0.6 });
  tiles.forEach((tile) => io.observe(tile));
}

/* Lumière au survol : la position du pointeur est transmise à la carte survolée (--lx, --ly). */
const GLOW = '.parcours-card, .quote-card';

export function initGlow() {
  if (!finePointer.matches || reduceMotion.matches || !document.querySelector(GLOW)) return;
  let frame = 0;
  let event = null;
  const apply = () => {
    frame = 0;
    const card = event.target.closest?.(GLOW);
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--lx', `${Math.round(event.clientX - r.left)}px`);
    card.style.setProperty('--ly', `${Math.round(event.clientY - r.top)}px`);
  };
  document.addEventListener('pointermove', (e) => {
    event = e;
    if (!frame) frame = requestAnimationFrame(apply);
  }, { passive: true });
}

/* Curseur : le point de la marque suit le pointeur (décoratif, le curseur natif reste visible). */
export function initCursor() {
  const root = $('[data-cursor-root]');
  if (!root || !finePointer.matches || reduceMotion.matches) return;
  document.documentElement.classList.add('has-cursor');
  const text = $('[data-cursor-text]', root);
  let x = -100, y = -100, cx = -100, cy = -100, raf = 0, last = '';
  const loop = () => {
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    root.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX;
    y = e.clientY;
    root.classList.remove('is-hidden');
    if (!raf) raf = requestAnimationFrame(loop);
    const target = e.target.closest?.('[data-cursor], a, button, summary, label, [role="tab"]');
    const label = target?.dataset?.cursor || '';
    root.classList.toggle('is-link', Boolean(target) && !label);
    root.classList.toggle('is-label', Boolean(label));
    if (label !== last) {
      text.textContent = label;
      last = label;
    }
    root.classList.toggle('is-dark', Boolean(e.target.closest?.('.section--dark')));
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => root.classList.add('is-hidden'));
  window.addEventListener('blur', () => root.classList.add('is-hidden'));
}
