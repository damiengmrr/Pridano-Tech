const { softwareMethod } = require('../data/brand');
const { icon, pt, btn, label } = require('../lib/html');
const s = require('../components/sections');
const { heroMedia } = require('../components/hero-media');

const problems = [
  ['Les fichiers deviennent ingérables.', 'Outils internes & logiciels métier', 'Centraliser l’information et structurer les opérations dans une application pensée pour votre équipe.'],
  ['Votre idée dépasse le site vitrine.', 'SaaS & applications web', 'Concevoir les parcours, les espaces utilisateurs et les fonctionnalités d’un produit qui peut évoluer.'],
  ['Vos logiciels ne se parlent pas.', 'API, intégrations & automatisations', 'Relier vos outils existants et automatiser les étapes répétitives, selon les possibilités de chaque service.'],
  ['L’information existe, mais se disperse.', 'Dashboards & pilotage', 'Rassembler les données utiles dans une vue lisible, construite autour des décisions à prendre.'],
];

function problemList() {
  const rows = problems.map(([problem, kind, answer], i) => `<li class="ps-row" data-reveal>
<div class="ps-problem"><span class="index-num">${String(i + 1).padStart(2, '0')}</span><h3 class="h3">${problem}</h3></div>
<span class="ps-arrow" aria-hidden="true">${icon('arrow')}</span>
<div class="ps-answer"><p class="label label--plain">${kind}</p><p>${answer}</p></div>
</li>`).join('');
  return `<section class="ps" id="besoins" data-index-label="Besoins">
<div class="wrap">
${s.sectionHead({ kicker: 'Partir du quotidien', title: 'Un problème concret. Une réponse adaptée.' })}
<ol class="ps-list" role="list">${rows}</ol>
</div>
</section>`;
}

function hub() {
  const sats = ['Vos données', 'Vos équipes', 'Vos outils', 'Vos clients', 'Vos règles'];
  const pos = [[300, 70], [520, 230], [440, 500], [160, 500], [80, 230]];
  const lines = pos.map(([x, y]) => `<path class="hub-line" d="M300 300 L${x} ${y}"/>`).join('');
  /* Points voyageurs pilotés par le défilement (hub.js) : aucun mouvement automatique en boucle. */
  const travellers = pos.map(([x, y], i) => `<circle class="hub-traveller" r="6" cx="300" cy="300" data-hub-traveller data-x="${x}" data-y="${y}" data-offset="${(i * 0.21).toFixed(2)}"/>`).join('');
  const nodes = pos.map(([x, y], i) => `<g class="hub-sat"><circle cx="${x}" cy="${y}" r="46"/><text x="${x}" y="${y + 5}" text-anchor="middle">${sats[i]}</text></g>`).join('');
  return `<section class="automation" id="votre-logiciel" data-index-label="Votre logiciel">
<div class="wrap automation-grid">
<div class="automation-copy" data-reveal>
${label('Notre deuxième expertise')}
<h2 class="h2">${pt('Votre logiciel. Vos règles.')}</h2>
<p class="lead">Quand les fichiers s’accumulent et que vos outils ne se parlent plus, nous concevons le logiciel qui remet votre activité en mouvement.</p>
</div>
<figure class="hub" data-reveal="scale" data-hub>
<svg class="hub-svg" viewBox="0 0 600 580" aria-hidden="true" focusable="false">${lines}${travellers}${nodes}<g class="hub-core"><circle cx="300" cy="300" r="78"/><text x="300" y="296" text-anchor="middle">Votre</text><text x="300" y="320" text-anchor="middle">logiciel</text></g></svg>
<figcaption>Représentation de notre approche</figcaption>
</figure>
</div>
</section>`;
}

module.exports = {
  title: 'SaaS, applications & logiciels métier sur mesure',
  description: 'Pridano conçoit des SaaS, outils internes, dashboards et intégrations adaptés à votre activité. Du cadrage du besoin à la mise en service.',
  crumb: 'SaaS & logiciels',
  service: { name: 'SaaS, applications & logiciels métier sur mesure', type: 'Développement de logiciels sur mesure', description: 'Pridano conçoit des SaaS, outils internes, dashboards et intégrations adaptés à votre activité. Du cadrage du besoin à la mise en service.', offers: ['Outils internes & logiciels métier', 'SaaS & applications web', 'API, intégrations & automatisations', 'Dashboards & pilotage'], priceIds: ['saas'] },
  body: () => `${s.pageHero({
    crumb: 'SaaS & logiciels',
    kicker: '02 SaaS & logiciels · Notre deuxième expertise',
    title: 'Moins de détours. Plus de possibilités.',
    lead: 'Votre activité a ses propres règles. <br>Nous créons les logiciels qui les comprennent.',
    actions: `${btn({ href: '/contact?projet=saas', label: 'Parler de mon logiciel' })}`,
    media: heroMedia.saas(),
  })}
${problemList()}
${s.pricingSection({ ids: ['saas'], title: 'Combien coûte un logiciel ?', cta: 'Parler de mon logiciel' })}
${hub()}
${s.methodSection({ steps: softwareMethod, kicker: 'De la question à l’usage', title: 'Construire le bon outil. Dans le bon ordre.', id: 'methode-logiciel' })}
${s.osTeaser({ kicker: 'Le savoir-faire, mis en pratique', title: 'Nous développons notre propre produit.', lead: 'Pridano porte cette même conviction : un logiciel doit s’organiser autour de l’entreprise.', cta: 'Découvrir le projet Pridano' })}
${s.finalCta({ aside: null })}`,
};
