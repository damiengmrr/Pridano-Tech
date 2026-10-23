const { test } = require('node:test');
const assert = require('node:assert/strict');
const routes = require('../site/pages');
const { build } = require('../scripts/build');
const { brand } = require('../site/data/brand');

const production = { PUBLIC_SITE_URL: 'https://pridanotech.fr', NODE_ENV: 'production' };
const render = (env) => build({ env, write: false, bundle: false });
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test('production : indexation, canonical public, sitemap et robots', async () => {
  const { files } = await render(production);
  for (const [route, { file, page }] of Object.entries(routes)) {
    const html = files.get(file);
    const robots = page.noindex ? 'noindex, nofollow' : 'index, follow';
    assert.ok(html.includes(`<meta name="robots" content="${robots}`), route);
    if (route !== '/404') assert.ok(html.includes(`<link rel="canonical" href="https://pridanotech.fr${route === '/' ? '/' : route}">`), route);
    assert.ok(!html.includes('localhost'), route);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${route} : un seul H1`);
    assert.equal((html.match(/<title>/g) || []).length, 1, route);
    assert.equal((html.match(/name="description"/g) || []).length, 1, route);
    assert.ok(html.includes('<html lang="fr-FR"'), route);
  }
  assert.equal(files.get('robots.txt'), 'User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://pridanotech.fr/sitemap.xml\n');
  const sitemap = files.get('sitemap.xml');
  for (const route of ['/', '/sites-web', '/saas', '/realisations', '/crm', '/a-propos', '/contact', '/devis', '/confidentialite']) {
    assert.ok(sitemap.includes(`<loc>https://pridanotech.fr${route === '/' ? '/' : route}</loc>`), route);
  }
  assert.ok(!sitemap.includes('/404') && !sitemap.includes('/mentions-legales'));
});

for (const CONTEXT of ['deploy-preview', 'branch-deploy', 'dev']) {
  test(`${CONTEXT} reste non indexable`, async () => {
    const { files } = await render({ ...production, CONTEXT });
    assert.match(files.get('index.html'), /content="noindex, nofollow"/);
    assert.match(files.get('robots.txt'), /Disallow: \/\n/);
  });
}

test('localhost bloque l’indexation et un build de production l’interdit', async () => {
  const { files } = await render({ PUBLIC_SITE_URL: 'http://localhost:3000' });
  assert.match(files.get('index.html'), /content="noindex, nofollow"/);
  await assert.rejects(() => render({ PUBLIC_SITE_URL: 'http://localhost:3000', NODE_ENV: 'production' }), /PUBLIC_SITE_URL/);
});

test('titres et descriptions uniques, marque présente', async () => {
  const { files } = await render(production);
  const titles = new Set();
  const descriptions = new Set();
  for (const [route, { file }] of Object.entries(routes)) {
    const html = files.get(file);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="(.*?)">/)[1];
    assert.ok(title.endsWith(' · Pridano'), route);
    assert.ok(title.length <= 110, `${route} : titre trop long (${title.length})`);
    assert.ok(description.length >= 50 && description.length <= 200, `${route} : description ${description.length} caractères`);
    titles.add(title);
    descriptions.add(description);
  }
  assert.equal(titles.size, Object.keys(routes).length);
  assert.equal(descriptions.size, Object.keys(routes).length);
});

test('identité structurée : une Organization stable, des variantes de marque, un WebSite', async () => {
  const { files } = await render(production);
  for (const [route, { file }] of Object.entries(routes)) {
    const blocks = jsonLd(files.get(file));
    if (route === '/404') {
      assert.equal(blocks.length, 0);
      continue;
    }
    assert.equal(blocks.length, 1, route);
    const nodes = blocks[0]['@graph'];
    const orgs = nodes.filter((n) => n['@type'] === 'Organization');
    const sites = nodes.filter((n) => n['@type'] === 'WebSite');
    assert.equal(orgs.length, 1, route);
    assert.equal(sites.length, 1, route);
    assert.equal(orgs[0]['@id'], 'https://pridanotech.fr/#organization');
    assert.equal(orgs[0].name, 'Pridano Tech');
    assert.deepEqual(orgs[0].alternateName, ['Pridano', 'PridanoTech', 'Pridanotech']);
    assert.equal(orgs[0].email, brand.email);
    assert.equal(orgs[0].address.addressLocality, 'Montpellier');
    assert.equal(orgs[0].logo.url, 'https://pridanotech.fr/assets/brand/pridano-tech-logo-512.png');
    assert.equal(sites[0].url, 'https://pridanotech.fr/');
    const page = nodes.find((n) => n['@id'] && n['@id'].endsWith('#webpage'));
    assert.ok(page, `${route} : WebPage`);
    if (route !== '/') assert.ok(nodes.some((n) => n['@type'] === 'BreadcrumbList'), `${route} : fil d’Ariane`);
  }
});

test('données structurées cohérentes avec le contenu visible', async () => {
  const { files } = await render(production);
  const graph = (file) => jsonLd(files.get(file))[0]['@graph'];
  assert.ok(graph('sites-web.html').some((n) => n['@type'] === 'Service'));
  assert.ok(graph('saas.html').some((n) => n['@type'] === 'Service'));
  const people = graph('a-propos.html').filter((n) => n['@type'] === 'Person').map((n) => n.name);
  assert.deepEqual(people, ['Damien Gamarra', 'Noah Lemoing']);
  /* FAQ uniquement là où le site existant en publiait une (Sites web), questions visibles et identiques. */
  const faq = graph('sites-web.html').find((n) => n['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, 5);
  for (const q of faq.mainEntity) assert.ok(files.get('sites-web.html').includes(q.name), `question visible ${q.name}`);
  for (const file of ['index.html', 'saas.html', 'crm.html']) assert.ok(!graph(file).some((n) => n['@type'] === 'FAQPage'), file);
  const works = graph('realisations.html').find((n) => n['@type'] === 'CollectionPage').mainEntity.itemListElement.map((i) => i.item.name);
  assert.deepEqual(works, ['Solaria Média', 'Prévenir Pour Gagner']);
});

test('aucune information inventée : pas de témoignage, de note ni de chiffre de résultat', async () => {
  const { files } = await render(production);
  for (const [route, { file }] of Object.entries(routes)) {
    const html = files.get(file);
    assert.ok(!/AggregateRating|"Review"|aggregateRating/.test(html), route);
    assert.ok(!/\+\s?\d+\s?%|\d+\s?clients satisfaits|ans d’expérience/i.test(html), route);
  }
});
