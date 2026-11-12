/* Structure commune : en-tête, menu mobile, dock, pied de page, curseur. */
const { brand } = require('../data/brand');
const { sprite, mark, wordmark } = require('../lib/logo');
const { esc, icon, btn, link, telHref, extAttrs } = require('../lib/html');
const { categories, servicesOf } = require('../data/catalog');
const { products, statuses } = require('../data/software');

/*
 * Navigation : le cœur de métier (Sites web), puis les deux catalogues (Prestations, Nos produits).
 * « SaaS & logiciels » et « Le produit Pridano » restent accessibles depuis ces catalogues,
 * le menu mobile et le pied de page. Même nombre de liens qu’avant : la barre garde sa composition.
 */
const nav = [
  { href: '/prestations', label: 'Solutions', section: '/prestations/', mega: 'solutions', also: ['/sites-web', '/saas'] },
  { href: '/logiciels', label: 'Nos logiciels', mega: 'software', also: ['/crm'], section: '/logiciels/' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/a-propos', label: 'Le studio' },
];

const menuLinks = [
  { href: '/', label: 'Accueil' },
  ...nav,
  { href: '/contact', label: 'Nous contacter' },
  { href: '/devis', label: 'Devis guidé' },
];

/* Menus construits depuis les catalogues : aucun prix, statut ou produit inventé. */
function megaPanels() {
  const solutionLinks = categories.map((c) => `<a class="mega-link" href="${c.page}"><span class="mega-link-name">${esc(c.name)}</span><span class="mega-link-desc">${esc(c.intro)}</span></a>`).join('');
  const productLinks = products.map((p) => `<a class="mega-link" href="${p.page || `/logiciels/${p.id}`}"><span class="mega-link-name">${esc(p.name)}</span><span class="mega-link-desc">${esc(p.tagline)}</span></a>`).join('');
  return `<div class="mega-shell wrap" data-mega-shell>
<section class="mega-panel" id="mega-solutions" data-mega-panel="solutions" aria-label="Toutes les solutions" hidden>
<div class="mega-panel-head"><div><span class="label">Ce que nous faisons</span><h2>Un besoin. Une solution.</h2></div><a class="mega-all" href="/prestations">Toutes les prestations</a></div>
<div class="mega-grid">${solutionLinks}</div>
<div class="mega-bottom"><span>Plusieurs besoins pour un seul projet ?</span><a href="/devis?parcours=projet">Construire mon projet</a></div>
</section>
<section class="mega-panel" id="mega-software" data-mega-panel="software" aria-label="Catalogue des logiciels" hidden>
<div class="mega-panel-head"><div><span class="label">Pridano Software · À venir</span><h2>Ce que nous préparons.</h2></div><a class="mega-all" href="/logiciels">Découvrir la vision</a></div>
<div class="mega-grid mega-grid--software">${productLinks}</div>
<div class="mega-bottom"><span>Vous cherchez un logiciel adapté à votre métier ?</span><a href="/saas">Développement sur mesure</a></div>
</section>
</div>`;
}

function searchDialog() {
  const solutions = categories.map((c) => ({ href: c.page, name: c.name, extra: c.intro, search: servicesOf(c.id).map((s) => s.name).join(' '), group: 'Prestation' }));
  const softwares = products.map((product) => ({ href: product.page || `/logiciels/${product.id}`, name: product.name, extra: `${product.tagline} · ${statuses[product.status].label}`, search: `${product.category} ${product.description} ${product.features.join(' ')}`, group: 'Logiciel' }));
  const other = [{ href: '/sites-web#prestations', name: 'Tarifs des sites web', extra: 'Création, refonte et maintenance', group: 'Tarifs' }, { href: '/devis', name: 'Demander un devis', extra: 'Décrire vos besoins', group: 'Contact' }, { href: '/realisations', name: 'Nos réalisations', extra: 'Découvrir les projets', group: 'Studio' }];
  const rows = [...solutions, ...softwares, ...other].map((item) => `<li class="quick-result" data-quick-result data-search-text="${esc(`${item.name} ${item.extra} ${item.group} ${item.search || ''}`.toLowerCase())}"><a href="${item.href}"><span><small>${esc(item.group)}</small><strong>${esc(item.name)}</strong><span>${esc(item.extra)}</span></span></a></li>`).join('');
  return `<dialog class="quick-search" data-quick-search aria-label="Trouver une solution Pridano">
<div class="quick-search-box">
<div class="quick-search-top"><label for="quick-search-field">Que recherchez-vous ?</label><button type="button" data-quick-close aria-label="Fermer la recherche">${icon('close')}</button></div>
<input id="quick-search-field" type="search" placeholder="Site web, CRM, boutique, IA…" autocomplete="off" data-quick-input>
<p class="quick-search-empty" data-quick-empty hidden>Aucun résultat. Essayez un autre mot ou <a href="/contact">contactez-nous</a>.</p>
<ul class="quick-search-results" role="list">${rows}</ul>
<div class="quick-search-foot">Recherche dans les prestations et logiciels Pridano · Échap pour fermer</div>
</div></dialog>`;
}

/* Action principale unique dans l’en-tête et le dock (sauf pages Contact et Devis guidé). */
const defaultCta = { href: '/contact?projet=site', label: 'Démarrer un projet' };

/* Moyens de contact directs : n’apparaissent que s’ils sont renseignés dans brand.js. */
function directContacts({ cls = '' } = {}) {
  const items = [`<li><a href="mailto:${brand.email}" data-umami-event="email">${icon('mail')}${brand.email}</a></li>`];
  if (brand.phone) items.push(`<li><a href="${telHref(brand.phone)}" data-umami-event="telephone">${icon('phone')}${esc(brand.phone)}</a></li>`);
  if (brand.bookingUrl) items.push(`<li><a href="${esc(brand.bookingUrl)}"${extAttrs(brand.bookingUrl)} data-umami-event="prise-rdv">${icon('calendar')}Prendre rendez-vous<span class="visually-hidden"> (nouvel onglet)</span></a></li>`);
  return `<ul class="direct-contacts ${cls}" role="list">${items.join('')}</ul>`;
}

/*
 * Réseaux affichés dans le pied de page, lus dans brand.sameAs (le JSON-LD garde la liste complète).
 * LinkedIn : uniquement une page entreprise (/company/), pas le profil personnel (/in/).
 */
const socialNetworks = [
  { label: 'Instagram', match: /^https:\/\/(www\.)?instagram\.com\/[^/?#]+/ },
  { label: 'LinkedIn', match: /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/company\/[^/?#]+/ },
];

function socialLinks() {
  const items = socialNetworks.flatMap(({ label, match }) => {
    const href = brand.sameAs.find((url) => match.test(url));
    return href ? [`<li>${link({ href, label, track: `reseau:${label.toLowerCase()}` })}</li>`] : [];
  });
  return items.length ? `<ul class="footer-social" role="list">${items.join('')}</ul>` : '';
}

/* Lien courant ; une rubrique reste active sur ses pages enfants (catalogues). */
const isCurrent = (route, item) => route === item.href || (item.section && route.startsWith(item.section)) || (item.also || []).includes(route);
const current = (route, item) => (route === item.href ? ' aria-current="page"' : isCurrent(route, item) ? ' aria-current="true"' : '');

function brandLink() {
  return `<a class="brand" href="/" aria-label="Pridano Tech, accueil">${mark({ cls: 'mark' })}${wordmark({ cls: 'wordmark' })}</a>`;
}

function header(route, cta = defaultCta) {
  const links = nav.map((item) => `<li${item.mega ? ` class="nav-cluster" data-mega-item="${item.mega}"` : ''}><a href="${item.href}"${current(route, item)}>${item.label}</a>${item.mega ? `<button class="mega-trigger" type="button" data-mega-trigger="${item.mega}" aria-expanded="false" aria-label="Afficher : ${item.label}" aria-controls="mega-${item.mega}">${icon('chevron')}</button>` : ''}</li>`).join('');
  return `<header class="site-header" data-header>
<div class="wrap header-inner">
${brandLink()}
<nav class="main-nav" aria-label="Navigation principale" data-nav><ul role="list">${links}</ul><span class="nav-dot" aria-hidden="true"></span></nav>
<button class="header-search" type="button" data-quick-open aria-haspopup="dialog" aria-label="Rechercher une solution">${icon('search')}<span>Rechercher</span></button>
${btn({ href: cta.href, label: cta.label, size: 'sm', cls: 'header-cta', track: `cta-entete:${cta.label}` })}
<button class="header-menu" type="button" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false" data-menu-open><span class="dock-menu-icon" aria-hidden="true"></span>Menu</button>
</div>
${megaPanels()}
</header>`;
}

function dock(cta = defaultCta) {
  /* Rangé dès le départ (en haut de page) : le script le fait sortir au défilement. */
  return `<div class="dock is-tucked" data-dock>
<button class="dock-menu" type="button" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false" data-menu-open><span class="dock-menu-icon" aria-hidden="true"></span>Menu</button>
<a class="dock-cta" href="${esc(cta.href)}" data-umami-event="cta-dock:${esc(cta.label)}">${cta.label}</a>
</div>`;
}

function menu(route) {
  const links = menuLinks.map((item, i) => `<li style="--i:${i}"><a href="${item.href}"${current(route, item)}><small>${String(i).padStart(2, '0')}</small>${item.label}</a></li>`).join('');
  return `<dialog class="menu" id="site-menu" aria-label="Menu" data-menu>
<div class="menu-sheet on-dark">
<div class="menu-head"><span class="label">pridano.</span><button class="menu-close" type="button" data-menu-close aria-label="Fermer le menu">${icon('close')}</button></div>
<div class="menu-shortcuts"><p class="label">Solutions</p><div>${categories.map((cat) => `<a href="${cat.page}">${esc(cat.name)}</a>`).join('')}</div><p class="label">Nos logiciels</p><div>${products.map((p) => `<a href="${p.page || `/logiciels/${p.id}`}">${esc(p.name)}</a>`).join('')}</div></div>
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
<div class="footer-pitch"><p>Des sites qui marquent. <br>Des outils qui font avancer.</p>${directContacts({ cls: 'footer-contacts' })}${socialLinks()}</div>
${col('Explorer', [['/sites-web', 'Sites web'], ['/prestations', 'Prestations'], ['/saas', 'SaaS & logiciels'], ['/realisations', 'Réalisations']])}
${col('Pridano', [['/logiciels', 'Nos produits'], ['/crm', 'Le produit Pridano'], ['/a-propos', 'Le studio'], ['/contact', 'Nous contacter'], [null, `${brand.city}, ${brand.country}`]])}
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
    after: `${footer()}${dock(cta)}${menu(route)}${searchDialog()}${cursor()}`,
  };
}

module.exports = { nav, chrome, header, footer, defaultCta, brandLink, directContacts };
