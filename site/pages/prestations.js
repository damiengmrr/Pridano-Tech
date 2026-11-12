/* Catalogue 1 : toutes les prestations, par catégorie (données : site/data/catalog.js). */
const { btn } = require('../lib/html');
const s = require('../components/sections');
const c = require('../components/catalog');
const { heroMedia } = require('../components/hero-media');
const { categories, servicesOf } = require('../data/catalog');
const { esc } = require('../lib/html');

module.exports = {
  title: 'Prestations — Sites, logiciels, IA et automatisations',
  description: 'Le catalogue des prestations Pridano Tech : sites web, e-commerce, agents IA, automatisations, applications, logiciels sur mesure et maintenance.',
  crumb: 'Prestations',
  schemaType: 'CollectionPage',
  catalog: 'services',
  body: () => `${s.pageHero({
    crumb: 'Prestations',
    kicker: 'Prestations · Catalogue',
    title: 'Votre entreprise. Toutes vos solutions numériques.',
    lead: `Sites, boutiques en ligne, logiciels, automatisations et agents IA : ${categories.length} savoir-faire, un seul partenaire.`,
    actions: `${btn({ href: c.parcoursHref, label: 'Construire mon projet', track: 'cta-parcours' })}${btn({ href: '/devis', label: 'Devis guidé', variant: 'ghost' })}`,
    media: heroMedia.catalog(),
    extra: c.categoryNav(),
  })}
<section class="svc solution-index" id="catalogue" data-index-label="Catalogue"><div class="wrap">
${s.sectionHead({ kicker: 'Nos domaines', title: 'Toutes nos solutions.' })}
<div class="solution-index-grid">${categories.map((cat) => `<article class="solution-index-card" id="${cat.id}"><h2>${esc(cat.name)}</h2><p>${esc(cat.intro)}</p><ul role="list">${servicesOf(cat.id).map((service) => (service.upcoming ? `<li><a href="${cat.page}#a-venir">${esc(service.name)} <small>à venir</small></a></li>` : `<li><a href="${cat.page}#prestation-${service.id}">${esc(service.name)}</a></li>`)).join('')}</ul><a class="link" href="${cat.page}">Explorer cette solution</a></article>`).join('')}</div>
</div></section>
${c.parcoursSection()}
${s.finalCta({
    kicker: 'Le prochain lien, c’est le vôtre.',
    title: 'Un besoin, ou plusieurs. Parlons-en.',
    primary: { href: c.parcoursHref, label: 'Construire mon projet' },
    note: 'Une seule demande pour un site, une identité, <br>un logiciel ou une automatisation.',
    aside: { href: '/logiciels', label: 'Découvrir nos logiciels' },
  })}`,
};
