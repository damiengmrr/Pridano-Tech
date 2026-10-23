const fs = require('node:fs');
const path = require('node:path');
const { brand } = require('../data/brand');
const { esc, pt, btn, label, link, telHref } = require('../lib/html');
const { breadcrumb } = require('../components/sections');
const { mark } = require('../lib/logo');

/*
 * Mentions légales (LCEN, art. 6) : construites à partir de brand.legal.
 * Tant que les informations de l’éditeur sont incomplètes, la page l’indique et reste en noindex.
 */
const legal = brand.legal;
const required = [
  ['denomination', 'la dénomination juridique'],
  ['forme', 'la forme sociale'],
  ['siege', 'l’adresse du siège'],
  ['siren', 'le numéro d’immatriculation'],
  ['directeurPublication', 'le responsable de publication'],
];
const missing = required.filter(([key]) => !legal[key]).map(([, text]) => text);
const row = (term, value) => (value ? `<div class="legal-row"><dt>${term}</dt><dd>${value}</dd></div>` : '');
const host = legal.hebergeur;

const mentions = {
  title: 'Mentions légales — Informations du site',
  description: 'Informations légales disponibles sur le site Pridano Tech et contact du studio.',
  crumb: 'Mentions légales',
  noindex: missing.length > 0,
  body: () => `<section class="legal" data-index-label="Mentions légales">
<div class="wrap--narrow">
${breadcrumb('Mentions légales')}
${label('Informations du site')}
<h1 class="h1">${pt('Mentions légales.')}</h1>
<div class="prose">
<h2 class="h3">Éditeur du site</h2>
<dl class="legal-list">
${row('Nom', legal.denomination || brand.name)}
${row('Forme', esc(legal.forme))}
${row('Siège', esc(legal.siege))}
${row('Immatriculation', esc([legal.siren, legal.rcs].filter(Boolean).join(' · ')))}
${row('TVA', esc(legal.tva))}
${row('Directeur de la publication', esc(legal.directeurPublication))}
${row('Contact', `<a href="mailto:${brand.email}">${brand.email}</a>${brand.phone ? ` · <a href="${telHref(brand.phone)}">${esc(brand.phone)}</a>` : ''}`)}
${row('Ville', `${brand.city}, ${brand.country}`)}
</dl>
${missing.length ? `<h2 class="h3">Informations en cours de finalisation</h2>
<p>${missing.join(', ').replace(/, ([^,]*)$/, ' et $1').replace(/^./, (c) => c.toUpperCase())} ${missing.length > 1 ? 'doivent être renseignés' : 'doit être renseigné'} avant la publication de cette nouvelle version.</p>` : ''}
<h2 class="h3">Hébergement</h2>
<dl class="legal-list">
${row('Hébergeur', esc(host.nom))}
${row('Adresse', esc(host.adresse))}
${row('Site', `<a href="${host.site}" target="_blank" rel="noopener noreferrer">${host.site.replace('https://', '')}<span class="visually-hidden"> (nouvel onglet)</span></a>`)}
</dl>
<h2 class="h3">Données personnelles</h2>
<p>Consultez la <a href="/confidentialite">politique de confidentialité</a> pour les informations relatives aux demandes de contact et au parcours de devis.</p>
</div>
</div>
</section>`,
};

/*
 * Politique de confidentialité : texte historique conservé, champs « À compléter »
 * remplis à partir de brand.legal ; à défaut, mention neutre (aucun crochet visible).
 */
function privacyHtml() {
  let html = fs.readFileSync(path.join(__dirname, '../privacy.html'), 'utf8');
  const pending = 'En cours de finalisation';
  const placeholder = (text) => new RegExp(`<span\\s+class="privacy-placeholder"\\s*>\\s*\\[${text}[^\\]]*\\]\\s*</span\\s*>`, 'g');
  const fills = [
    ['À compléter : dénomination sociale exacte', esc([legal.denomination, legal.forme].filter(Boolean).join(' — ')) || pending],
    ['À compléter : adresse postale complète', esc(legal.siege) || pending],
    ['À compléter : numéro SIREN ou SIRET', esc([legal.siren, legal.rcs].filter(Boolean).join(' · ')) || pending],
    ['À compléter si adresse dédiée ou DPO', ''],
    ['À compléter : nom de l’hébergeur'.replace('’', "'"), `${esc(host.nom)} — ${esc(host.adresse)}`],
    ['À compléter selon l’hébergeur'.replace('’', "'"), ''],
    ['À confirmer : région de traitement', ''],
  ];
  for (const [text, value] of fills) html = html.replace(placeholder(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), value);
  /* Adresse postale de contact : ligne affichée seulement si le siège est connu. */
  html = html.replace(/<div class="privacy-definition-row">\s*<strong>Adresse postale<\/strong>[\s\S]*?<\/div>/, legal.siege ? `<div class="privacy-definition-row"><strong>Adresse postale</strong><span>${esc(legal.siege)}</span></div>` : '');
  html = html.replace(/\s+\./g, (m) => (m.includes('\n') ? '.' : m));
  /* Ressources externes et mesure d’audience : état réel du nouveau site. */
  html = html.replace(/<span>Google Fonts \(`fonts\.googleapis\.com`, `fonts\.gstatic\.com`\) et `unpkg\.com` pour certaines bibliothèques front<\/span>/,
    '<span>Aucune sur les pages principales : polices et scripts sont hébergés sur le site. Les pages historiques de portfolio chargent Google Fonts, Tailwind (cdn.tailwindcss.com) et unpkg.com.</span></div>\n<div class="privacy-definition-row"><strong>Mesure d’audience</strong><span>Umami Cloud (umami.is), sans cookie : pages vues, sites de provenance, navigateur, système, type d’appareil et localisation approximative, uniquement sur pridanotech.fr.</span>');
  html = html.replace("et potentiellement à l'avenir pour des outils d'analyse d'audience ou\n                d'automatisation.", "pour la mesure d'audience sans cookie (Umami), et potentiellement à l'avenir pour des\n                outils d'automatisation.");
  html = html.replace("<li>mesurer l'audience ou gérer des cookies non essentiels si ces fonctionnalités sont activées ultérieurement dans des conditions conformes à la réglementation.</li>",
    "<li>mesurer l'audience du site de manière agrégée et sans cookie (Umami), et gérer des cookies non essentiels si ces fonctionnalités sont activées ultérieurement dans des conditions conformes à la réglementation.</li>");
  html = html.replace("<li>à la date de mise à jour de cette page, aucun traceur publicitaire n'est explicitement identifié dans le code applicatif courant du site ;</li>",
    "<li>à la date de mise à jour de cette page, aucun traceur publicitaire n'est explicitement identifié dans le code applicatif courant du site ;</li>\n                <li>la mesure d'audience repose sur Umami (umami.is), qui ne dépose pas de cookie ; pour l'animation de transition entre deux pages, la position du dernier clic est conservée dans le stockage de session du navigateur, puis effacée dès l'affichage de la page suivante ;</li>");
  return html;
}

const privacy = {
  title: 'Politique de confidentialité',
  description: 'Informations sur le traitement des données personnelles, les demandes de contact et les briefs adressés à Pridano Tech.',
  crumb: 'Confidentialité',
  css: 'privacy',
  body: () => `<div class="wrap legal-crumb">${breadcrumb('Confidentialité')}</div>
<div class="legacy-privacy" data-index-label="Confidentialité">${privacyHtml()}</div>`,
};

const notFound = {
  title: 'Page introuvable',
  description: 'Retrouvez les sites web, les réalisations et le studio Pridano.',
  crumb: 'Page introuvable',
  noindex: true,
  body: () => `<section class="lost" data-lost>
<div class="lost-stage" aria-hidden="true"><span class="lost-dot" data-lost-dot></span>${mark({ cls: 'lost-mark' })}</div>
<div class="wrap lost-inner">
${label('404 · Cette page n’existe pas')}
<h1 class="h1">Reprenons le bon chemin<span class="pt">.</span></h1>
<p class="lead">Le lien a peut-être changé. Retrouvez notre travail et parlons de votre prochain site.</p>
<div class="btn-row">${btn({ href: '/', label: 'Revenir à l’accueil' })}${btn({ href: '/contact', label: 'Nous contacter', variant: 'ghost' })}</div>
<nav class="lost-links" aria-label="Pages principales"><ul role="list">
<li>${link({ href: '/sites-web', label: 'Sites web' })}</li>
<li>${link({ href: '/saas', label: 'SaaS & logiciels' })}</li>
<li>${link({ href: '/realisations', label: 'Réalisations' })}</li>
<li>${link({ href: '/a-propos', label: 'Le studio' })}</li>
</ul></nav>
</div>
</section>`,
};

module.exports = { mentions, privacy, notFound, privacyHtml };
