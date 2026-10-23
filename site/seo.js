/*
 * Identité structurée (JSON-LD) : une entité Organization stable, un WebSite,
 * puis un graphe par page qui ne décrit que ce qui est visible sur la page.
 */
const { brand, expertises, projects, pricing, pricingTax, maintenance } = require('./data/brand');

function graph({ origin, route, page }) {
  const url = origin + (route === '/' ? '/' : route);
  const org = `${origin}/#organization`;
  const site = `${origin}/#website`;
  const people = brand.founders.map((f) => `${origin}/a-propos#${f.id}`);

  const organization = {
    '@type': 'Organization',
    '@id': org,
    name: brand.name,
    alternateName: brand.alternateNames,
    url: `${origin}/`,
    logo: { '@type': 'ImageObject', '@id': `${origin}/#logo`, url: origin + brand.logoPng, width: 512, height: 512, caption: brand.name },
    image: { '@id': `${origin}/#logo` },
    email: brand.email,
    description: brand.description,
    slogan: brand.tagline,
    address: { '@type': 'PostalAddress', addressLocality: brand.city, addressCountry: brand.countryCode },
    knowsAbout: ['Création de sites web', 'Refonte de sites web', 'Logiciels métier sur mesure', 'SaaS et applications web', 'Automatisation et intégrations API', 'Tableaux de bord'],
    member: people.map((id) => ({ '@id': id })),
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: brand.email, areaServed: 'FR', availableLanguage: 'fr', ...(brand.phone ? { telephone: brand.phone } : {}) },
    /* Ajoutés seulement s’ils sont renseignés dans brand.js. */
    ...(brand.phone ? { telephone: brand.phone } : {}),
    ...(brand.sameAs.length ? { sameAs: brand.sameAs } : {}),
    ...(brand.legal.denomination ? { legalName: brand.legal.denomination } : {}),
    ...(brand.legal.siren ? { identifier: brand.legal.siren } : {}),
  };

  const website = {
    '@type': 'WebSite',
    '@id': site,
    url: `${origin}/`,
    name: brand.name,
    alternateName: brand.alternateNames,
    inLanguage: 'fr-FR',
    publisher: { '@id': org },
  };

  const crumbs = route === '/' ? null : {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: page.crumb || page.title, item: url },
    ],
  };

  const webpage = {
    '@type': page.schemaType || 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': site },
    about: { '@id': org },
    primaryImageOfPage: { '@id': `${origin}/#logo` },
    ...(crumbs ? { breadcrumb: { '@id': crumbs['@id'] } } : {}),
  };

  const nodes = [organization, website, webpage];
  if (crumbs) nodes.push(crumbs);

  if (page.service) {
    nodes.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.service.name,
      serviceType: page.service.type,
      description: page.service.description,
      url,
      provider: { '@id': org },
      ...(page.service.offers ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: page.service.name, itemListElement: page.service.offers.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })) } } : {}),
      ...(() => {
        /* Prix d’appel « à partir de » (HT), uniquement s’ils sont publiés sur la page. */
        const offers = pricing.filter((p) => (page.service.priceIds || []).includes(p.id) && Number(p.from) > 0)
          .map((p) => ({ '@type': 'Offer', name: p.label, url: origin + p.href.split('?')[0], priceSpecification: { '@type': 'PriceSpecification', minPrice: Number(p.from), priceCurrency: 'EUR', valueAddedTaxIncluded: pricingTax !== 'HT' } }));
        /* Formules de maintenance mensuelles, publiées sur la page Sites web. */
        if (page.service.maintenance) {
          for (const m of maintenance) offers.push({ '@type': 'Offer', name: `Maintenance ${m.name}`, url: `${url}#maintenance`, priceSpecification: { '@type': 'UnitPriceSpecification', price: m.price, priceCurrency: 'EUR', unitCode: 'MON', unitText: 'mois', valueAddedTaxIncluded: pricingTax !== 'HT' } });
        }
        return offers.length ? { offers } : {};
      })(),
    });
    webpage.mainEntity = { '@id': `${url}#service` };
  }

  if (route === '/') {
    webpage.mainEntity = { '@id': org };
    nodes.push({
      '@type': 'ItemList',
      '@id': `${url}#expertises`,
      name: 'Sites web, SaaS & logiciels, Le produit Pridano',
      itemListElement: expertises.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.name, url: origin + e.href })),
    });
  }

  if (route === '/a-propos') {
    for (const f of brand.founders) {
      nodes.push({
        '@type': 'Person',
        '@id': `${origin}/a-propos#${f.id}`,
        name: f.name,
        jobTitle: f.role,
        description: f.bio,
        worksFor: { '@id': org },
        image: `${origin}/assets/img/${f.image}-640.webp`,
        ...(f.url ? { url: f.url, sameAs: [f.url] } : {}),
      });
    }
  }

  if (route === '/realisations') {
    webpage.mainEntity = {
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'CreativeWork', name: p.name, url: p.href, description: p.text, genre: p.type, creator: { '@id': org } },
      })),
    };
  }

  if (page.faq?.length) {
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      isPartOf: { '@id': `${url}#webpage` },
      inLanguage: 'fr-FR',
      mainEntity: page.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': nodes };
}

module.exports = { graph };
