const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');

let server;
let origin;
before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

test('toutes les pages publiques et historiques répondent en HTML', async () => {
  for (const route of ['/', '/sites-web', '/realisations', '/saas', '/crm', '/a-propos', '/contact', '/devis', '/confidentialite', '/mentions-legales', '/portfolio-noah.html', '/portfolio-dada.html']) {
    const res = await fetch(origin + route);
    assert.equal(res.status, 200, route);
    assert.match(res.headers.get('content-type'), /text\/html/, route);
  }
});

test('anciennes URLs : redirections 301 qui conservent la requête', async () => {
  for (const [old, url] of [['/index.html', '/'], ['/services.html', '/sites-web'], ['/projets.html', '/realisations'], ['/about.html', '/a-propos'], ['/confidentialite.html', '/confidentialite'], ['/contact.html', '/contact'], ['/devis.html', '/devis'], ['/saas.html', '/saas']]) {
    const res = await fetch(`${origin}${old}?source=legacy`, { redirect: 'manual' });
    assert.equal(res.status, 301, old);
    assert.equal(res.headers.get('location'), `${url}?source=legacy`, old);
  }
});

test('404 : page HTML dessinée, API en JSON', async () => {
  const page = await fetch(`${origin}/page-inconnue`);
  assert.equal(page.status, 404);
  assert.match(await page.text(), /Reprenons le bon chemin/);
  const api = await fetch(`${origin}/api/inconnue`);
  assert.equal(api.status, 404);
  assert.match(api.headers.get('content-type'), /json/);
});

test('ressources statiques servies : polices, images, scripts, marque', async () => {
  const html = await (await fetch(`${origin}/`)).text();
  const assets = [...html.matchAll(/(?:src|href)="(\/(?:assets|favicon)[^"?#]*)"/g)].map((m) => m[1]);
  assert.ok(assets.length > 10);
  for (const asset of new Set(assets)) {
    const res = await fetch(origin + asset);
    assert.equal(res.status, 200, asset);
  }
});

test('portfolios historiques : accessibles mais exclus des moteurs', async () => {
  for (const route of ['/portfolio-noah.html', '/portfolio-dada.html']) {
    const res = await fetch(origin + route);
    assert.equal(res.status, 200, route);
    assert.equal(res.headers.get('x-robots-tag'), 'noindex, nofollow', route);
    assert.match(await res.text(), /<meta name="robots" content="noindex, nofollow">/, route);
  }
});

test('le formulaire de contact refuse une demande incomplète sans envoyer d’email', async () => {
  const res = await fetch(`${origin}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).ok, false);
});

test('le brief guidé expose ses routes et refuse un brief vide', async () => {
  const health = await fetch(`${origin}/api/health`);
  assert.equal(health.status, 200);
  const res = await fetch(`${origin}/api/send-brief`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 400);
});
