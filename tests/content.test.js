/*
 * Contenus pilotés par les données (site/data/brand.js) : rien n'est affiché tant qu'une
 * information n'est pas fournie, tout apparaît dès qu'elle l'est, à l'identique dans le JSON-LD.
 */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const data = require('../site/data/brand');

const production = { PUBLIC_SITE_URL: 'https://pridanotech.fr', NODE_ENV: 'production' };

/* Recharge les gabarits pour qu'ils relisent les données modifiées. */
function fresh() {
  for (const key of Object.keys(require.cache)) {
    if ((key.includes('/site/') && !key.includes('/site/data/')) || key.includes('/scripts/build')) delete require.cache[key];
  }
  return require('../scripts/build').build({ env: production, write: false, bundle: false });
}

const snapshot = JSON.parse(JSON.stringify({ brand: data.brand, pricing: data.pricing, maintenance: data.maintenance, testimonials: data.testimonials }));
const restore = () => {
  Object.assign(data.brand, JSON.parse(JSON.stringify(snapshot.brand)));
  data.pricing.splice(0, data.pricing.length, ...JSON.parse(JSON.stringify(snapshot.pricing)));
  data.maintenance.splice(0, data.maintenance.length, ...JSON.parse(JSON.stringify(snapshot.maintenance)));
  data.testimonials.splice(0, data.testimonials.length, ...JSON.parse(JSON.stringify(snapshot.testimonials)));
};
after(restore);

test('sans données : ni prix, ni maintenance, ni témoignages, ni téléphone, ni « À compléter » visibles', async () => {
  Object.assign(data.brand, { phone: '', bookingUrl: '', sameAs: [] });
  data.pricing.forEach((p) => { p.from = null; });
  data.maintenance.splice(0);
  data.testimonials.splice(0);
  const { files } = await fresh();
  restore();
  for (const [name, html] of files) {
    if (!name.endsWith('.html')) continue;
    assert.ok(!html.includes('price-card'), `${name} : prix`);
    assert.ok(!html.includes('care-card'), `${name} : maintenance`);
    assert.ok(!html.includes('quote-card'), `${name} : témoignage`);
    assert.ok(!html.includes('href="tel:'), `${name} : téléphone`);
    assert.ok(!/À compléter|À confirmer/.test(html), `${name} : champ à compléter visible`);
  }
  assert.ok(!files.get('sites-web.html').includes('"offers"'));
  assert.match(files.get('mentions-legales.html'), /noindex, nofollow/);
  assert.match(files.get('mentions-legales.html'), /Netlify, Inc\./);
  assert.match(files.get('confidentialite.html'), /Umami/);
});

test('données publiées : prix, délai, maintenance, téléphone, rendez-vous, profils et JSON-LD cohérents', async () => {
  const { files } = await fresh();
  const sites = files.get('sites-web.html');
  assert.match(sites, /À partir de<\/span> <strong>990\s€<\/strong> <span>HT/);
  assert.match(sites, /Livré en 3 à 5 jours/);
  assert.match(sites, /29\s€<\/strong> <span>HT \/ mois/);
  assert.match(files.get('saas.html'), /3\s900\s€/);
  assert.match(files.get('contact.html'), /href="tel:0778702518"/);
  assert.match(files.get('contact.html'), /href="https:\/\/calendly\.com\/pridanotech"/);
  const graph = (file) => JSON.parse(files.get(file).match(/application\/ld\+json">(.*?)<\/script>/)[1])['@graph'];
  const org = graph('index.html').find((n) => n['@type'] === 'Organization');
  assert.equal(org.telephone, '07 78 70 25 18');
  assert.deepEqual(org.sameAs, data.brand.sameAs);
  const service = graph('sites-web.html').find((n) => n['@type'] === 'Service');
  assert.deepEqual(service.offers.map((o) => o.priceSpecification.minPrice ?? o.priceSpecification.price), [990, 790, 29, 59, 119]);
});

test('avec données de test : témoignages et identité légale', async () => {
  Object.assign(data.brand.legal, { denomination: 'Exemple SAS', forme: 'SAS', siege: '1 rue Exemple, 34000 Montpellier', siren: 'SIREN 000 000 000', directeurPublication: 'Exemple' });
  data.testimonials.push({ quote: 'Texte de test.', name: 'Test T.', company: 'Test', project: 'solaria' });
  const { files } = await fresh();
  restore();
  Object.assign(data.brand.legal, snapshot.brand.legal);
  assert.match(files.get('index.html'), /quote-card/);
  const mentions = files.get('mentions-legales.html');
  assert.match(mentions, /Exemple SAS/);
  assert.match(mentions, /index, follow/);
  const org = JSON.parse(files.get('index.html').match(/application\/ld\+json">(.*?)<\/script>/)[1])['@graph'].find((n) => n['@type'] === 'Organization');
  assert.equal(org.legalName, 'Exemple SAS');
});
