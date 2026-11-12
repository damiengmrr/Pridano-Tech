/*
 * Page de catégorie du catalogue des prestations, générée pour chaque catégorie `generated: true`
 * de site/data/catalog.js : présentation, bénéfices, prestations incluses, cas d’usage, tarif,
 * déroulement, FAQ, services complémentaires et appel vers le devis guidé.
 */
const { btn } = require('../lib/html');
const s = require('../components/sections');
const c = require('../components/catalog');
const { heroMedia } = require('../components/hero-media');

function categoryPage(cat) {
  const devis = c.devisHref([cat.need]);
  return {
    title: cat.seo.title,
    description: cat.seo.description,
    crumb: cat.name,
    parent: { href: '/prestations', label: 'Prestations' },
    faq: cat.faq,
    category: cat.id,
    service: { name: cat.name, type: cat.name, description: cat.seo.description, offers: [], categoryId: cat.id },
    body: () => `${s.pageHero({
      crumb: cat.name,
      parent: { href: '/prestations', label: 'Prestations' },
      kicker: cat.hero.kicker,
      title: cat.hero.title,
      lead: cat.hero.lead,
      actions: `${btn({ href: devis, label: 'Demander un devis', track: `cta-categorie:${cat.id}` })}`,
      media: (heroMedia[cat.id] || heroMedia.catalog)(),
    })}
${c.benefitsSection(cat.benefits)}
${c.serviceSection(cat.id)}
${c.upcomingSection(cat)}
${cat.trust ? c.benefitsSection(cat.trust.items, { kicker: cat.trust.kicker, title: cat.trust.title, id: 'cadre', index: 'Cadre' }) : ''}
${c.useCasesSection(cat.useCases)}
${cat.id === 'maintenance' ? s.maintenanceSection() : ''}
${s.methodSection({ steps: cat.process, kicker: 'Déroulement', title: 'Comment nous travaillons ensemble.', id: 'deroulement', index: 'Déroulement' })}
${s.faqSection(cat.faq, { kicker: 'Questions fréquentes', title: 'Les réponses, sans détour.' })}
${c.relatedSection(cat.related)}
${s.finalCta({
      kicker: 'Le prochain lien, c’est le vôtre.',
      title: 'Parlons de votre projet.',
      primary: { href: devis, label: 'Demander un devis' },
      note: 'Un premier échange, <br>puis une proposition claire.',
      aside: { href: '/prestations', label: 'Voir toutes nos prestations' },
    })}`,
  };
}

module.exports = { categoryPage };
