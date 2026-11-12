/* Logiciels Pridano : présentés comme des objectifs à venir, reliés aux fiches produit. */
const { btn, link } = require('../lib/html');
const s = require('../components/sections');
const c = require('../components/catalog');
const { products } = require('../data/software');
const { heroMedia } = require('../components/hero-media');

const interest = `/contact?projet=crm&sujet=${encodeURIComponent('Pridano Software')}`;

module.exports = {
  title: 'Nos logiciels — Pridano Software',
  description: 'Pridano Software : les logiciels que nous préparons pour les entreprises. Aucun n’est encore commercialisé.',
  crumb: 'Nos logiciels',
  schemaType: 'CollectionPage',
  catalog: 'software',
  body: () => `${s.pageHero({
    crumb: 'Nos logiciels',
    kicker: 'Pridano Software · À venir',
    title: 'Chaque outil. Sa propre solution.',
    lead: 'Des logiciels pour les entreprises, en préparation.',
    actions: `${btn({ href: interest, label: 'Être tenu informé', track: 'logiciels:etre-informe' })}${btn({ href: '/saas', label: 'Créer un logiciel sur mesure', variant: 'ghost' })}`,
    media: heroMedia.software(),
  })}
<section class="svc software-overview" id="catalogue" data-index-label="Logiciels"><div class="wrap">
${s.sectionHead({ kicker: 'Nos objectifs', title: 'Ce que chaque logiciel permettra.' })}
<ul class="modules-grid svc-grid software-cards" role="list">${products.map((p, i) => c.productCard(p, i)).join('')}</ul>
</div></section>
<section class="software-footnote" data-index-label="Sur mesure"><div class="wrap"><div><h2>Besoin d’un logiciel pour votre activité ?</h2><p>Nous concevons également des logiciels métier et SaaS sur mesure.</p>${link({ href: '/saas', label: 'Découvrir le sur-mesure' })}</div></div></section>
${s.finalCta({ kicker: 'Pridano · Software', title: 'Parlons de votre besoin.', primary: { href: '/contact?projet=saas', label: 'Échanger sur un logiciel' }, tagline: null, aside: { href: '/prestations', label: 'Toutes les prestations' } })}`,
};
