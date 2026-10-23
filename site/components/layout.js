/* Structure commune : en-tête, menu mobile, dock, pied de page, curseur. */
const { brand } = require('../data/brand');
const { sprite, mark, wordmark } = require('../lib/logo');
const { esc, icon, btn, telHref, extAttrs } = require('../lib/html');

/* Libellés de navigation repris du site existant (« Le produit Pridano » : libellé du pied de page d’origine). */
const nav = [
  { href: '/sites-web', label: 'Sites web' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/saas', label: 'SaaS & logiciels' },
  { href: '/crm', label: 'Le produit Pridano' },
  { href: '/a-propos', label: 'Le studio' },
];

const menuLinks = [
  { href: '/', label: 'Accueil' },
  ...nav,
  { href: '/contact', label: 'Nous contacter' },
  { href: '/devis', label: 'Devis guidé' },
];

/* Action principale unique dans l’en-tête et le dock (sauf pages Contact et Devis guidé). */
const defaultCta = { href: '/contact?projet=site', label: 'Démarrer un projet' };

/* Moyens de contact directs : n’apparaissent que s’ils sont renseignés dans brand.js. */
function directContacts({ cls = '' } = {}) {
  const items = [`<li><a href="mailto:${brand.email}" data-umami-event="email">${icon('mail')}${brand.email}</a></li>`];
  if (brand.phone) items.push(`<li><a href="${telHref(brand.phone)}" data-umami-event="telephone">${icon('phone')}${esc(brand.phone)}</a></li>`);
  if (brand.bookingUrl) items.push(`<li><a href="${esc(brand.bookingUrl)}"${extAttrs(brand.bookingUrl)} data-umami-event="prise-rdv">${icon('calendar')}Prendre rendez-vous<span class="visually-hidden"> (nouvel onglet)</span></a></li>`);
  return `<ul class="direct-contacts ${cls}" role="list">${items.join('')}</ul>`;
}

const current = (route, href) => (route === href ? ' aria-current="page"' : '');

function brandLink() {
  return `<a class="brand" href="/" aria-label="Pridano Tech, accueil">${mark({ cls: 'mark' })}${wordmark({ cls: 'wordmark' })}</a>`;
}

function header(route, cta = defaultCta) {
  const links = nav.map((item) => `<li><a href="${item.href}"${current(route, item.href)}>${item.label}</a></li>`).join('');
  return `<header class="site-header" data-header>
<div class="wrap header-inner">
${brandLink()}
<nav class="main-nav" aria-label="Navigation principale" data-nav><ul role="list">${links}</ul><span class="nav-dot" aria-hidden="true"></span></nav>
${btn({ href: cta.href, label: cta.label, size: 'sm', cls: 'header-cta', track: `cta-entete:${cta.label}` })}
</div>
</header>`;
}

function dock(cta = defaultCta) {
  return `<div class="dock" data-dock>
<button class="dock-menu" type="button" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false" data-menu-open><span class="dock-menu-icon" aria-hidden="true"></span>Menu</button>
<a class="dock-cta" href="${esc(cta.href)}" data-umami-event="cta-dock:${esc(cta.label)}">${cta.label}</a>
</div>`;
}

function menu(route) {
  const links = menuLinks.map((item, i) => `<li style="--i:${i}"><a href="${item.href}"${current(route, item.href)}><small>${String(i).padStart(2, '0')}</small>${item.label}${icon('arrow')}</a></li>`).join('');
  return `<dialog class="menu" id="site-menu" aria-label="Menu" data-menu>
<div class="menu-sheet on-dark">
<div class="menu-head"><span class="label">pridano.</span><button class="menu-close" type="button" data-menu-close aria-label="Fermer le menu">${icon('close')}</button></div>
<nav aria-label="Navigation mobile"><ul class="menu-links" role="list">${links}</ul></nav>
<div class="menu-foot">${directContacts()}<span>${brand.city}, ${brand.country}</span></div>
</div>
</dialog>`;
}

function footer() {
  const col = (title, items) => `<div class="footer-col"><h2>${title}</h2><ul role="list">${items.map(([href, text]) => (href ? `<li><a href="${href}">${text}</a></li>` : `<li><span>${text}</span></li>`)).join('')}</ul></div>`;
  return `<footer class="site-footer section--dark" data-index-dark>
<div class="wrap">
<div class="footer-grid">
<div class="footer-pitch"><p>Des sites qui marquent. <br>Des outils qui font avancer.</p>${directContacts({ cls: 'footer-contacts' })}</div>
${col('Explorer', [['/sites-web', 'Sites web'], ['/realisations', 'Réalisations'], ['/saas', 'SaaS & logiciels']])}
${col('Pridano', [['/crm', 'Le produit Pridano'], ['/a-propos', 'Le studio'], ['/contact', 'Nous contacter'], [null, `${brand.city}, ${brand.country}`]])}
</div>
<div class="footer-word" aria-hidden="true">${wordmark({ cls: 'wordmark' })}</div>
<div class="footer-bottom"><span>© ${new Date().getFullYear()} ${brand.name}</span><nav aria-label="Liens de bas de page"><ul role="list"><li><a href="/mentions-legales">Mentions légales</a></li><li><a href="/confidentialite">Confidentialité</a></li><li><a href="#top">Retour en haut ↑</a></li></ul></nav></div>
</div>
</footer>`;
}

function cursor() {
  return '<div class="cursor" aria-hidden="true" data-cursor-root><span class="cursor-dot"></span><span class="cursor-label" data-cursor-text></span></div>';
}

function chrome(route, cta) {
  return {
    before: `${sprite()}<a class="skip-link" href="#main">Aller au contenu</a>${header(route, cta)}`,
    after: `${footer()}${dock(cta)}${menu(route)}${cursor()}`,
  };
}

module.exports = { nav, chrome, header, footer, defaultCta, brandLink, directContacts };
