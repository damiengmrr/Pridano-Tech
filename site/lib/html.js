/* Petits outils de gabarit : échappement, icônes, boutons, images responsives. */
const fs = require('node:fs');
const path = require('node:path');

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const icons = {
  arrow: '<path d="M4.5 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  'arrow-up-right': '<path d="M7 17 17 7m-8.5 0H17v8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  'arrow-down': '<path d="M12 4.5v15m6-6-6 6-6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  close: '<path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
  phone: '<path d="M6.6 3.5h2.7l1.4 4-2 1.3a12 12 0 0 0 6.5 6.5l1.3-2 4 1.4v2.7a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
  cursor: '<path d="M5.5 3.5 19 10.2l-6.1 1.8-2.9 6.5Z" fill="currentColor" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.8" stroke="currentColor" stroke-width="1.6" fill="none"/>',
  shield: '<path d="M12 3.5 19 6v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="m8.8 12 2.2 2.2 4.2-4.4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  clock: '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  calendar: '<path d="M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>',
  mail: '<path d="M3.5 6.5h17v11h-17z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21Z" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="12" cy="10" r="2.3" fill="currentColor"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  spark: '<path d="M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2Z" fill="currentColor"/>',
};

const icon = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || ''}</svg>`;

/* Le point final des titres devient le carré ultramarine du logotype (le « . » reste dans le texte). */
const pt = (text) => String(text).replace(/([^\s>]+)\.(?=\s|<|$)/g, '<span class="nowrap">$1<span class="pt">.</span></span>');

const isExternal = (href) => /^https?:\/\//.test(href);
const extAttrs = (href) => (isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : '');
const newTab = (href) => (isExternal(href) ? '<span class="visually-hidden"> (nouvel onglet)</span>' : '');

function btn({ href, label, variant = 'primary', size = '', icon: iconName = 'arrow', attrs = '', type, cls: extra = '', track = '' }) {
  const cls = ['btn', `btn--${variant}`, size ? `btn--${size}` : '', extra].filter(Boolean).join(' ');
  if (track) attrs += ` data-umami-event="${esc(track)}"`;
  const inner = `<span class="btn-label">${label}</span><span class="btn-icon" aria-hidden="true">${icon(isExternal(href || '') ? 'arrow-up-right' : iconName)}</span>`;
  if (type) return `<button class="${cls}" type="${type}" data-magnetic ${attrs}>${inner}</button>`;
  return `<a class="${cls}" href="${esc(href)}" data-magnetic${extAttrs(href)} ${attrs}>${inner}${newTab(href)}</a>`;
}

function link({ href, label, cls = '', track = '' }) {
  const ext = isExternal(href);
  const event = track || (href === '/devis' ? 'lien:devis-guide' : '');
  return `<a class="link${ext ? ' link--ext' : ''}${cls ? ` ${cls}` : ''}" href="${esc(href)}"${extAttrs(href)}${event ? ` data-umami-event="${esc(event)}"` : ''}>${label}${newTab(href)}${icon(ext ? 'arrow-up-right' : 'arrow')}</a>`;
}

/* Téléphone : affiché tel quel, lien tel: au format international sans espaces. */
const telHref = (phone) => `tel:${String(phone).replace(/[^+\d]/g, '')}`;
const price = (amount) => `${Number(amount).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, '\u00a0')}\u00a0€`;

const label = (text, cls = '') => `<p class="label${cls ? ` ${cls}` : ''}">${text}</p>`;

/* Images optimisées : manifeste généré par scripts/assets/optimize-images.js */
let manifest = null;
function images() {
  if (!manifest) {
    const file = path.join(__dirname, '../data/images.json');
    manifest = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  }
  return manifest;
}

function picture(name, { alt = '', sizes = '100vw', cls = '', imgCls = '', loading = 'lazy', priority = false, decorative = false, attrs = '' } = {}) {
  const info = images()[name];
  if (!info) throw new Error(`Image inconnue dans le manifeste : ${name}`);
  const srcset = (format) => info.widths.map((w) => `/assets/img/${name}-${w}.${format} ${w}w`).join(', ');
  const fallbackWidth = info.widths.find((w) => w >= 800) || info.widths[info.widths.length - 1];
  const altAttr = decorative ? 'alt=""' : `alt="${esc(alt)}"`;
  const prio = priority ? ' fetchpriority="high"' : '';
  const load = priority ? 'eager' : loading;
  const formats = info.formats || ['avif', 'webp'];
  const sources = formats.filter((f) => f !== 'webp').map((f) => `<source type="image/${f}" srcset="${srcset(f)}" sizes="${sizes}">`).join('');
  return `<picture${cls ? ` class="${cls}"` : ''}${attrs ? ` ${attrs}` : ''}>${sources}<img${imgCls ? ` class="${imgCls}"` : ''} src="/assets/img/${name}-${fallbackWidth}.webp" srcset="${srcset('webp')}" sizes="${sizes}" width="${info.width}" height="${info.height}" ${altAttr} loading="${load}" decoding="async"${prio}></picture>`;
}

/*
 * Révélation mot à mot : chaque mot est enveloppé (le titre reste un seul texte pour les
 * lecteurs d’écran et les moteurs). Les balises existantes (point final, retours) sont conservées.
 */
function words(html) {
  let i = 0;
  return html.replace(/(<[^>]+>)|([^<\s]+)/g, (m, tag, word) => tag || `<span class="sw"><span style="--wi:${i++}">${word}</span></span>`);
}

module.exports = { esc, icon, pt, words, btn, link, label, picture, images, isExternal, extAttrs, newTab, telHref, price };
