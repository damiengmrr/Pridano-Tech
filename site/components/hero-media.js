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
    layer('hm-a', 0.5, `<div class="mk-app">${bar('Pridano CRM')}${shot('dashboard', big, true)}</div>`),
    layer('hm-c1', 1.6, chip('Vos données')),
    layer('hm-c2', 1.2, chip('Vos équipes')),
    layer('hm-c3', 1.8, chip('Vos outils')),
    layer('hm-c4', 1.4, chip('Vos clients')),
    layer('hm-c5', 2, chip('Vos règles', 'mk-chip--accent')),
  ].join(''), 'Un outil commun · Informations reliées · Actions simplifiées<br>Pridano CRM · Captures de développement · Données de démonstration'),

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

/*
 * Pages du catalogue : sans capture réelle à montrer (e-commerce, IA, automatisations, maintenance),
 * une fenêtre de code d’illustration et des pastilles, marquées « Illustration ». Aucune fausse capture.
 */
const code = (file, lines) => `<div class="mk-code">${bar(file)}<pre><code>${lines.map(([k, v]) => (v === undefined ? k : `  <span class="p">${k}</span>: ${v}`)).join('\n')}<span class="caret"></span></code></pre></div>`;
const str = (text) => `<span class="s">'${text}'</span>`;
const codeScene = (variant, file, lines, chips) => wrap(`code hm--${variant}`, [
  layer('hm-a', 0.5, code(file, lines)),
  ...chips.map(([text, cls = ''], i) => layer(`hm-c${i + 1}`, [1.4, 1.8, 1.2, 2][i % 4], chip(text, cls))),
].join(''), 'Illustration');

Object.assign(media, {
  /* Catalogue des prestations : un site livré, le produit maison, et les familles de prestations. */
  catalog: () => wrap('catalog', [
    layer('hm-a', 0.3, browser('solaria-site', { url: 'solariamedia.netlify.app', sizes: big, priority: true })),
    layer('hm-b', 0.8, `<div class="mk-app">${bar('Pridano CRM')}${shot('dashboard', big)}</div>`),
    layer('hm-c1', 1.6, chip('Sites web', 'mk-chip--dot')),
    layer('hm-c2', 1.2, chip('E-commerce', 'mk-chip--dot')),
    layer('hm-c3', 1.8, chip('Agents IA', 'mk-chip--dot')),
    layer('hm-c4', 2, chip(`${icon('spark')}Un seul partenaire`, 'mk-chip--accent')),
  ].join(''), 'Solaria Média · site livré<br>Pridano CRM · Captures de développement · Données de démonstration'),

  /* Catalogue des logiciels : le seul produit réellement en développement, et ceux en préparation. */
  software: () => wrap('software', [
    layer('hm-a', 0.5, `<div class="mk-app">${bar('Pridano CRM')}${shot('dashboard', big, true)}</div>`),
    layer('hm-c1', 1.6, chip('CRM · à venir', 'mk-chip--accent')),
    layer('hm-c2', 1.2, chip('Finance · à venir', 'mk-chip--dot')),
    layer('hm-c3', 1.8, chip('Booking · à venir', 'mk-chip--dot')),
  ].join(''), 'Pridano CRM · Captures de développement · Données de démonstration'),

  'e-commerce': () => codeScene('ecommerce', 'commande', [['commande {'], ['statut', str('payée')], ['livraison', str('retrait en boutique')], ['articles', '<span class="v">2</span>'], ['}']],
    [['Fiches produits'], ['Paiement en ligne'], ['Livraison'], [`${icon('spark')}Un parcours simple`, 'mk-chip--accent']]),


  'agents-ia': () => codeScene('agents', 'agent', [['agent {'], ['mission', str('répondre aux clients')], ['sources', `[${str('faq')}, ${str('catalogue')}]`], ['validation', str('humaine')], ['}']],
    [['Vos informations'], ['Vos outils'], ['Vos règles'], [`${icon('spark')}Validation humaine`, 'mk-chip--accent']]),

  automatisations: () => codeScene('automations', 'workflow', [['workflow {'], ['quand', str('devis signé')], ['alors', `[${str('créer le client')},`], ['', `${str('préparer la facture')}]`], ['}']],
    [['CRM'], ['Facturation'], ['Email'], [`${icon('spark')}Moins de saisie`, 'mk-chip--accent']]),

  maintenance: () => codeScene('care', 'suivi', [['site {'], ['hebergement', str('https')], ['sauvegardes', '<span class="v">true</span>'], ['formule', str('sans engagement')], ['}']],
    [['Sauvegardes'], ['Mises à jour'], ['Assistance'], [`${icon('spark')}Un interlocuteur`, 'mk-chip--accent']]),
});

module.exports = { heroMedia: media };
