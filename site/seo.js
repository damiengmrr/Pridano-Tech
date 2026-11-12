/*
 * Identité structurée (JSON-LD) : une entité Organization stable, un WebSite,
 * puis un graphe par page qui ne décrit que ce qui est visible sur la page.
 */
const { brand, expertises, projects, pricing, pricingTax, maintenance } = require('./data/brand');
const { categories, services, servicesOf, categoryById } = require('./data/catalog');
const { products, statuses } = require('./data/software');
const { servicePrice } = require('./components/catalog');

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
    knowsAbout: ['Création de sites web', 'Refonte de sites web', 'Logiciels métier sur mesure', 'SaaS et applications web', 'Automatisation et intégrations API', 'Tableaux de bord', 'Sites e-commerce', 'Agents IA et chatbots', 'Maintenance et hébergement de sites web'],
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
      ...(page.parent ? [{ '@type': 'ListItem', position: 2, name: page.parent.label, item: origin + page.parent.href }] : []),
      { '@type': 'ListItem', position: page.parent ? 3 : 2, name: page.crumb || page.title, item: url },
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

  /* Pages de catégorie du catalogue : prestations de la catégorie, et seulement les prix validés. */
  if (page.service?.categoryId) {
    const list = servicesOf(page.service.categoryId).filter((s) => !s.upcoming);
    const offers = [];
    for (const s of list) {
      const p = servicePrice(s);
      if (!p || s.price.ref === 'maintenance') continue;
      offers.push({ '@type': 'Offer', name: s.name, description: s.short, url: `${url}#prestation-${s.id}`, priceSpecification: { '@type': 'PriceSpecification', minPrice: p.from, priceCurrency: 'EUR', valueAddedTaxIncluded: pricingTax !== 'HT' } });
    }
    if (page.service.categoryId === 'maintenance') {
      for (const m of maintenance) offers.push({ '@type': 'Offer', name: `Maintenance ${m.name}`, description: m.features.join(' · '), url: `${url}#maintenance`, priceSpecification: { '@type': 'UnitPriceSpecification', price: m.price, priceCurrency: 'EUR', unitCode: 'MON', unitText: 'mois', valueAddedTaxIncluded: pricingTax !== 'HT' } });
    }
    nodes.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.service.name,
      serviceType: page.service.type,
      description: page.service.description,
      url,
      provider: { '@id': org },
      areaServed: 'FR',
      hasOfferCatalog: { '@type': 'OfferCatalog', name: page.service.name, itemListElement: list.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.short } })) },
      ...(offers.length ? { offers } : {}),
    });
    webpage.mainEntity = { '@id': `${url}#service` };
  } else if (page.service) {
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
          .map((p) => ({ '@type': 'Offer', name: p.label, ...(p.perks?.length ? { description: p.perks.join(' · ') } : {}), url: origin + p.href.split('?')[0], priceSpecification: { '@type': 'PriceSpecification', minPrice: Number(p.from), priceCurrency: 'EUR', valueAddedTaxIncluded: pricingTax !== 'HT' } }));
        /* Formules de maintenance mensuelles, publiées sur la page Sites web. */
        if (page.service.maintenance) {
          for (const m of maintenance) offers.push({ '@type': 'Offer', name: `Maintenance ${m.name}`, description: m.features.join(' · '), url: `${url}#maintenance`, priceSpecification: { '@type': 'UnitPriceSpecification', price: m.price, priceCurrency: 'EUR', unitCode: 'MON', unitText: 'mois', valueAddedTaxIncluded: pricingTax !== 'HT' } });
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

  /* Catalogue des prestations : liste des prestations, chacune vers sa page de catégorie. */
  if (page.catalog === 'services') {
    webpage.mainEntity = {
      '@type': 'ItemList',
      name: 'Prestations Pridano Tech',
      itemListElement: services.filter((s) => !s.upcoming).map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: `${origin}${categoryById[s.category].page}#prestation-${s.id}` })),
    };
    webpage.hasPart = categories.map((c) => ({ '@type': 'WebPage', name: c.name, url: origin + c.page }));
  }

  /* Catalogue des logiciels : noms et statuts réels, sans données commerciales (aucun produit vendu). */
  if (page.catalog === 'software') {
    webpage.mainEntity = {
      '@type': 'ItemList',
      name: 'Logiciels Pridano',
      itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: `${p.name} (${statuses[p.status].label})`, url: p.page ? origin + p.page : `${url}#logiciel-${p.id}` })),
    };
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
