/* En-tête contextuel, indicateur « point » de la navigation, dock et menu mobile, rail d’index. */
import { $, $$, reduceMotion } from '../core.js';

export function initHeader() {
  const header = $('[data-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let queued = false;

  const update = () => {
    queued = false;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const menuOpen = document.documentElement.classList.contains('menu-open');
    if (y > 480 && y > lastY + 6 && !menuOpen && !header.contains(document.activeElement)) header.classList.add('is-hidden');
    else if (y < lastY - 6 || y <= 480) header.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();

  const nav = $('[data-nav]', header);
  const dot = nav && $('.nav-dot', nav);
  if (!nav || !dot) return;
  const links = $$('a', nav);
  const current = links.find((a) => a.getAttribute('aria-current') === 'page');
  let timer;
  const moveTo = (link, animate = true) => {
    const r = link.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    dot.style.setProperty('--dot-x', `${r.left - n.left + r.width / 2 - 3}px`);
    dot.classList.add('is-visible');
    if (animate && !reduceMotion.matches) {
      dot.classList.add('is-moving');
      clearTimeout(timer);
      timer = setTimeout(() => dot.classList.remove('is-moving'), 240);
    }
  };
  const rest = () => (current ? moveTo(current) : dot.classList.remove('is-visible'));
  links.forEach((a) => {
    a.addEventListener('pointerenter', () => moveTo(a));
    a.addEventListener('focus', () => moveTo(a));
  });
  nav.addEventListener('pointerleave', rest);
  nav.addEventListener('focusout', (e) => { if (!nav.contains(e.relatedTarget)) rest(); });
  const place = () => current && moveTo(current, false);
  document.fonts?.ready.then(place);
  window.addEventListener('resize', place, { passive: true });
  place();
}

export function initMenu() {
  const dialog = $('[data-menu]');
  const openers = $$('[data-menu-open]');
  if (!dialog || !openers.length || typeof dialog.showModal !== 'function') return;
  const html = document.documentElement;

  const open = () => {
    dialog.showModal();
    html.classList.add('menu-open');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'true'));
  };
  const finish = () => {
    dialog.classList.remove('is-closing');
    if (dialog.open) dialog.close();
  };
  const close = () => {
    if (!dialog.open) return;
    if (reduceMotion.matches) return finish();
    dialog.classList.add('is-closing');
    setTimeout(finish, 260);
  };
  dialog.addEventListener('close', () => {
    html.classList.remove('menu-open');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
  });
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
  $$('[data-menu-close]', dialog).forEach((b) => b.addEventListener('click', close));
  openers.forEach((b) => b.addEventListener('click', open));
}

export function initDock() {
  const dock = $('[data-dock]');
  if (!dock) return;
  const footer = $('.site-footer');
  let footerVisible = false;
  let typing = false;
  const sync = () => dock.classList.toggle('is-tucked', footerVisible || typing);
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;
      sync();
    }, { rootMargin: '0px 0px -30% 0px' }).observe(footer);
  }
  document.addEventListener('focusin', (e) => {
    typing = e.target.matches?.('input, textarea, select') ?? false;
    sync();
  });
  document.addEventListener('focusout', () => {
    typing = false;
    sync();
  });
}

/* Rail d’index : un point par section, pour se repérer et sauter directement à une partie. */
export function initIndexRail() {
  const sections = $$('main [data-index-label]');
  if (sections.length < 3 || !('IntersectionObserver' in window)) return;
  const rail = document.createElement('nav');
  rail.className = 'index-rail';
  rail.setAttribute('aria-label', 'Sections de la page');
  const list = document.createElement('ol');
  const links = sections.map((section, i) => {
    if (!section.id) section.id = `section-${i + 1}`;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${section.id}`;
    a.innerHTML = `<span class="rail-label"></span><span class="rail-dot" aria-hidden="true"></span>`;
    a.firstElementChild.textContent = section.dataset.indexLabel;
    li.append(a);
    list.append(li);
    return a;
  });
  rail.append(list);
  document.body.append(rail);
  const darkSections = new Set($$('[data-index-dark]'));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const i = sections.indexOf(entry.target);
      links.forEach((a, j) => (j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      rail.classList.toggle('is-dark', darkSections.has(entry.target));
    }
  }, { rootMargin: '-48% 0px -48% 0px' });
  sections.forEach((s) => observer.observe(s));
}

/* Transition entre pages : la nouvelle page s’ouvre depuis le point cliqué (voir script d’amorçage). */
/*
 * Transitions de page : un langage, plusieurs plans selon le lien suivi (lu par le script
 * d’amorçage de la page suivante, qui pose data-vt avant le premier rendu) :
 *  - navigation entre rubriques : travelling latéral, dans le sens de l’ordre du menu ;
 *  - lien porté par un visuel : la page s’ouvre depuis ce visuel (plan large → gros plan) ;
 *  - appel à l’action et autres liens : ouverture circulaire depuis le point cliqué ;
 *  - précédent / suivant du navigateur : fondu court (data-vt="fade", par défaut).
 */
const ORDER = ['/', '/sites-web', '/realisations', '/saas', '/crm', '/a-propos', '/contact', '/devis'];

export function initPageTransitions() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const record = { x: Math.round(((e.clientX || W / 2) / W) * 100), y: Math.round(((e.clientY || H / 2) / H) * 100), t: Date.now(), k: 'circle' };
    const from = ORDER.indexOf(location.pathname);
    const to = ORDER.indexOf(url.pathname);
    if (a.closest('.main-nav, .menu-links, .footer-col, .breadcrumb, .lost-links') && from > -1 && to > -1 && from !== to) {
      record.k = to > from ? 'next' : 'prev';
    } else if (a.matches('[data-vt-zoom]') || a.querySelector('img, picture, canvas')) {
      const r = a.getBoundingClientRect();
      record.k = 'zoom';
      record.r = [r.top / H, (W - r.right) / W, (H - r.bottom) / H, r.left / W].map((v) => Math.round(Math.max(0, v) * 1000) / 10);
    }
    try {
      sessionStorage.setItem('pt-vt', JSON.stringify(record));
    } catch {
      /* stockage indisponible : fondu par défaut */
    }
  });
}
