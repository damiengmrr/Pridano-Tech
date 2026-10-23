/*
 * Visuels des en-têtes de pages intérieures : captures réelles (sites livrés, produit maison)
 * mises en scène en couches. Décoratifs (aria-hidden) : le texte de la page porte l’information.
 * Chaque couche a une profondeur (--z) utilisée par le léger effet de parallaxe au pointeur.
 */
const { picture, icon } = require('../lib/html');
const { mark } = require('../lib/logo');

const layer = (cls, z, html) => `<div class="hm-layer ${cls}" style="--z:${z}">${html}</div>`;
const bar = (text = '') => `<div class="mk-bar"><i></i><i></i><i></i>${text ? `<b>${text}</b>` : ''}</div>`;
/* Visuels au-dessus de la ligne de flottaison : images chargées tout de suite, la principale en priorité. */
const shot = (img, sizes, priority = false) => picture(img, { decorative: true, sizes, priority, loading: 'eager' });
const browser = (img, { url = '', sizes, priority = false }) => `<div class="mk-browser">${bar(url)}${shot(img, sizes, priority)}</div>`;
const phone = (img, { sizes }) => `<div class="mk-phone">${shot(img, sizes)}</div>`;
const chip = (text, cls = '') => `<span class="mk-chip ${cls}">${text}</span>`;
const wrap = (variant, layers, caption = '') => `<figure class="hm hm--${variant}" aria-hidden="true" data-hm><div class="hm-stage">${layers}</div>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;

const big = '(min-width: 900px) 34vw, 80vw';
const small = '(min-width: 900px) 9vw, 22vw';

const media = {
  /* Sites web : un site livré, sur ordinateur et sur mobile, et les quatre ingrédients du site existant. */
  sites: () => wrap('sites', [
    layer('hm-a', 0.4, browser('solaria-site', { url: 'solariamedia.netlify.app', sizes: big, priority: true })),
    layer('hm-b', 1, phone('solaria-site-m', { sizes: small })),
    layer('hm-c1', 1.4, chip('Stratégie')),
    layer('hm-c2', 1.8, chip('Design')),
    layer('hm-c3', 1.2, chip('Développement')),
    layer('hm-c4', 2, chip(`${icon('spark')}Votre identité`, 'mk-chip--accent')),
  ].join('')),

  /* Réalisations : les deux sites livrés, superposés. */
  work: () => wrap('work', [
    layer('hm-a', 0.3, browser('ppg-site', { url: 'prevenirpourgagner.com', sizes: big })),
    layer('hm-b', 0.8, browser('solaria-site', { url: 'solariamedia.netlify.app', sizes: big, priority: true })),
    layer('hm-c', 1.5, phone('ppg-site-m', { sizes: small })),
    layer('hm-t1', 1.9, chip('Solaria Média', 'mk-chip--dot')),
    layer('hm-t2', 1.6, chip('Prévenir Pour Gagner', 'mk-chip--dot')),
  ].join('')),

  /* SaaS : le produit maison au centre, relié aux cinq éléments du schéma « Votre logiciel. Vos règles. ». */
  saas: () => wrap('saas', [
    `<svg class="hm-links" viewBox="0 0 100 80" preserveAspectRatio="none">${[[14, 12], [6, 44], [88, 10], [94, 58], [24, 74]].map(([x, y]) => `<line x1="50" y1="42" x2="${x}" y2="${y}"/>`).join('')}</svg>`,
    layer('hm-a', 0.5, `<div class="mk-app">${bar('Pridano Business OS')}${shot('dashboard', big, true)}</div>`),
    layer('hm-c1', 1.6, chip('Vos données')),
    layer('hm-c2', 1.2, chip('Vos équipes')),
    layer('hm-c3', 1.8, chip('Vos outils')),
    layer('hm-c4', 1.4, chip('Vos clients')),
    layer('hm-c5', 2, chip('Vos règles', 'mk-chip--accent')),
  ].join(''), 'Un outil commun · Informations reliées · Actions simplifiées<br>Pridano Business OS · Captures de développement · Données de démonstration'),

  /* Produit Pridano : trois écrans réels du Business OS, en éventail. */
  os: () => wrap('os', [
    layer('hm-a', 0.3, `<div class="mk-app">${bar('Facturez')}${shot('factures', big)}</div>`),
    layer('hm-b', 0.6, `<div class="mk-app">${bar('Planifiez')}${shot('planning', big)}</div>`),
    layer('hm-c', 1.1, `<div class="mk-app">${bar('Pilotez')}${shot('dashboard', big, true)}</div>`),
  ].join(''), 'Pridano / L’espace entreprise<br>Captures de développement · Données de démonstration'),

  /* Studio : le design et le développement réunis, à Montpellier. */
  studio: ({ coordinates, city, country }) => wrap('studio', [
    layer('hm-a', 0.5, `<div class="mk-board"><div class="mk-board-sel">${mark({ cls: 'mk-board-mark' })}<i></i><i></i><i></i><i></i></div><span class="mk-cursor mk-cursor--design">${icon('cursor')}<b>Damien</b></span></div>`),
    layer('hm-b', 1, `<div class="mk-code">${bar('tokens.css')}<pre><code><span class="k">:root</span> {
  <span class="p">--c-ultra</span>: <span class="v">#1b45ff</span>;
  <span class="p">--c-cyan</span>: <span class="v">#1fdcff</span>;
  <span class="p">--f-display</span>: <span class="s">'Archivo'</span>;
}<span class="caret"></span></code></pre><span class="mk-cursor mk-cursor--code">${icon('cursor')}<b>Noah</b></span></div>`),
    layer('hm-c', 1.7, chip(`${icon('pin')}${coordinates}`, 'mk-chip--mono')),
  ].join(''), `${city}, ${country}`),
};

module.exports = { heroMedia: media };
