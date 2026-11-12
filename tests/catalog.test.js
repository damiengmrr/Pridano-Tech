/*
 * Catalogues : intégrité des données, prix (seuls les tarifs validés sont publiés),
 * statuts honnêtes des logiciels, pages générées, routes Express et Netlify, données structurées.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { categories, services, categoryById } = require('../site/data/catalog');
const { products, statuses } = require('../site/data/software');
const { needs, needById } = require('../site/data/needs');
const { pricing, maintenance } = require('../site/data/brand');
const routes = require('../site/pages');
const { build } = require('../scripts/build');
const { createApp } = require('../server');

const production = { PUBLIC_SITE_URL: 'https://pridanotech.fr', NODE_ENV: 'production' };
let files;
let server;
let origin;
before(async () => {
  ({ files } = await build({ env: production, write: false, bundle: false }));
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

const html = () => [...files].filter(([name]) => name.endsWith('.html'));
const graph = (file) => JSON.parse(files.get(file).match(/application\/ld\+json">(.*?)<\/script>/)[1])['@graph'];

test('prestations : identifiants uniques, catégorie et besoin du devis valides, contenu complet', () => {
  assert.equal(new Set(services.map((s) => s.id)).size, services.length);
  assert.equal(new Set(categories.map((c) => c.id)).size, categories.length);
  assert.equal(new Set(categories.map((c) => c.page)).size, categories.length);
  for (const s of services) {
    assert.ok(categoryById[s.category], `${s.id} : catégorie`);
    assert.ok(needById[s.need], `${s.id} : besoin du devis`);
    for (const key of ['name', 'short', 'details', 'audience']) assert.ok(s[key], `${s.id} : ${key}`);
    assert.ok(s.benefits.length && s.deliverables.length, `${s.id} : avantages et livrables`);
  }
  for (const c of categories) {
    assert.ok(services.some((s) => s.category === c.id), `${c.id} : au moins une prestation`);
    assert.ok(needById[c.need], `${c.id} : besoin du devis`);
    if (c.generated) for (const key of ['seo', 'hero', 'benefits', 'useCases', 'process', 'faq', 'related']) assert.ok(c[key], `${c.id} : ${key}`);
  }
});

test('prix : seules les références validées dans brand.js sont utilisées', () => {
  const allowed = new Set([...pricing.map((p) => p.id), 'maintenance']);
  for (const s of services) if (s.price) assert.ok(allowed.has(s.price.ref), `${s.id} : référence de prix ${s.price.ref}`);
});

test('prix publiés : les tarifs validés sont présents, aucun tarif envisagé n’est publié', () => {
  const all = html().map(([, body]) => body).join('\n');
  const amount = (n) => `${n.toLocaleString('fr-FR').replace(/ | /g, ' ')} €`;
  for (const n of [990, 790, 3900, 490, 1490, ...maintenance.map((m) => m.price)]) assert.ok(all.includes(amount(n)), `prix validé ${n} absent`);
  /* Propositions de COMMERCIAL.md, non validées : elles ne doivent apparaître sur aucune page. */
  for (const n of [1590, 2490, 3990, 3490, 6490, 590, 1090, 2290, 690, 1790, 2790, 8900, 18000]) {
    for (const [name, body] of html()) assert.ok(!body.includes(amount(n)), `${name} : tarif non validé ${n} €`);
  }
});

test('logiciels : statuts honnêtes, aucune capture ni formule pour un produit non disponible', () => {
  const images = JSON.parse(fs.readFileSync(path.join(__dirname, '../site/data/images.json'), 'utf8'));
  for (const p of products) {
    assert.ok(statuses[p.status], `${p.id} : statut`);
    if (p.status === 'disponible') assert.ok(p.signupUrl && p.plans.length, `${p.id} : disponible sans inscription ni formule`);
    if (p.status === 'concept') {
      assert.equal(p.screenshots.length, 0, `${p.id} : capture pour un concept`);
      assert.equal(p.plans.length, 0, `${p.id} : formule pour un concept`);
      assert.equal(p.signupUrl, '', `${p.id} : inscription pour un concept`);
    }
    for (const img of p.screenshots) assert.ok(images[img], `${p.id} : capture ${img} inconnue`);
  }
  const page = files.get('logiciels.html');
  assert.equal((page.match(/data-status="disponible"/g) || []).length, 0);
  assert.equal((page.match(/data-status="concept"/g) || []).length, products.filter((p) => p.status === 'concept').length);
  assert.match(page, /Pridano CRM/);
  assert.match(page, /href="\/crm"/);
  /* Les concepts disposent désormais de fiches dédiées, sans tarif ni inscription. */
  assert.match(page, /href="\/logiciels\/finance"/);
  for (const id of ['finance', 'booking']) assert.ok(files.has(`logiciels-${id}.html`), `${id} : page dédiée`);
  /* Le CRM est le produit présenté sur /crm : plus de fiche concept en double. */
  assert.ok(!files.has('logiciels-crm.html'), 'pas de fiche concept CRM en double');
});

test('pages générées : une par catégorie, avec fil d’Ariane, FAQ et appel au devis guidé', () => {
  for (const c of categories.filter((x) => x.generated)) {
    const file = routes[c.page]?.file;
    assert.ok(file && files.has(file), `${c.page} : page générée`);
    const body = files.get(file);
    assert.match(body, /<a href="\/prestations">Prestations<\/a>/, `${c.page} : fil d’Ariane`);
    assert.ok(body.includes(`href="/devis?besoins=${c.need}"`), `${c.page} : lien vers le devis`);
    for (const [q] of c.faq) assert.ok(body.includes(q), `${c.page} : FAQ ${q}`);
    const crumbs = graph(file).find((n) => n['@type'] === 'BreadcrumbList');
    assert.equal(crumbs.itemListElement.length, 3, `${c.page} : fil d’Ariane JSON-LD`);
  }
  /* Catalogue : chaque prestation est présente avec un lien vers sa page de détail ; celles « à venir » renvoient au bloc dédié. */
  const index = files.get('prestations.html');
  for (const s of services) assert.ok(index.includes(s.upcoming ? `${categoryById[s.category].page}#a-venir"` : `#prestation-${s.id}"`), `catalogue : ${s.id}`);
  /* Une prestation « à venir » n’a pas de carte (ni prix) : elle figure seulement dans le bloc « à venir ». */
  for (const s of services.filter((x) => x.upcoming)) {
    const body = files.get(routes[categoryById[s.category].page].file);
    assert.ok(!body.includes(`id="prestation-${s.id}"`), `${s.id} : pas de carte`);
    assert.ok(body.includes('id="a-venir"') && body.includes(s.name), `${s.id} : bloc à venir`);
  }
});

test('données structurées : offres uniquement pour les prix affichés', () => {
  const ecommerce = graph('prestations-e-commerce.html').find((n) => n['@type'] === 'Service');
  /* Prix de départ e-commerce validés le 12 novembre 2026 : création et refonte de boutique. */
  assert.deepEqual(ecommerce.offers.map((o) => o.priceSpecification.minPrice), [1490, 990]);
  const automation = graph('prestations-automatisations.html').find((n) => n['@type'] === 'Service');
  assert.equal(automation.offers, undefined);
  assert.equal(ecommerce.hasOfferCatalog.itemListElement.length, services.filter((s) => s.category === 'e-commerce').length);
  const care = graph('prestations-maintenance.html').find((n) => n['@type'] === 'Service');
  assert.deepEqual(care.offers.map((o) => o.priceSpecification.price), maintenance.map((m) => m.price));
  const list = graph('prestations.html').find((n) => n['@type'] === 'CollectionPage').mainEntity.itemListElement;
  assert.equal(list.length, services.filter((s) => !s.upcoming).length);
});

test('routes : toutes les pages servies par Express, déclarées pour Netlify et dans le sitemap', async () => {
  const toml = fs.readFileSync(path.join(__dirname, '../netlify.toml'), 'utf8');
  const sitemap = files.get('sitemap.xml');
  for (const [route, { file, page }] of Object.entries(routes)) {
    if (route === '/' || route === '/404') continue;
    const res = await fetch(origin + route);
    assert.equal(res.status, 200, route);
    assert.ok(toml.includes(`from = "${route}"\n  to = "/${file}"`), `${route} : règle Netlify`);
    if (!page.noindex) assert.ok(sitemap.includes(`https://pridanotech.fr${route}</loc>`), `${route} : sitemap`);
  }
  /* Catégorie retirée (Branding & UI/UX, 3 novembre 2026) : redirection permanente vers le catalogue. */
  const removed = await fetch(`${origin}/prestations/branding-ui-ux`, { redirect: 'manual' });
  assert.equal(removed.status, 301);
  assert.equal(removed.headers.get('location'), '/prestations');
  assert.ok(toml.includes('from = "/prestations/branding-ui-ux"\n  to = "/prestations"\n  status = 301'));
  assert.ok(!sitemap.includes('branding-ui-ux'));
});

test('navigation : catalogues accessibles depuis l’en-tête, le menu et le pied de page de chaque page', () => {
  for (const [name, body] of html()) {
    for (const href of ['/prestations', '/logiciels']) {
      assert.ok(body.includes(`<a href="${href}"`), `${name} : lien ${href}`);
    }
  }
  assert.match(files.get('prestations-agents-ia.html'), /<a href="\/prestations" aria-current="true">Solutions<\/a>/);
  assert.match(files.get('crm.html'), /<a href="\/logiciels" aria-current="true">Nos logiciels<\/a>/);
});

test('devis guidé : sélecteur des 10 besoins, présélection depuis les catalogues', () => {
  const devis = files.get('devis.html');
  for (const n of needs) assert.ok(devis.includes(`value="${n.id}" data-need`), `besoin ${n.id}`);
  assert.equal(needs.length, 10);
  assert.match(files.get('prestations.html'), /href="\/devis\?parcours=projet"/);
});
