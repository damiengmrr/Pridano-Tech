/*
 * Audits Lighthouse réels (mobile et desktop) sur un build de production servi en local
 * (compression activée, pages indexables via QA_INDEXABLE_ORIGIN). Le build par défaut est
 * régénéré à la fin. Les rapports bruts sont enregistrés dans .qa/lighthouse/.
 *
 *   node scripts/qa/lighthouse.js [routes…]
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const out = path.join(root, '.qa/lighthouse');
const PORT = 4180;
const origin = `http://127.0.0.1:${PORT}`;
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/sites-web', '/saas', '/crm', '/realisations', '/a-propos', '/contact', '/devis'];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const { build } = require('../build');
  await build({ env: { ...process.env, QA_INDEXABLE_ORIGIN: origin } });
  const { createApp } = require('../../server');
  const server = createApp().listen(PORT, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const { default: lighthouse } = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');
  const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-first-run', '--disable-gpu-sandbox'] });
  const rows = [];
  try {
    for (const formFactor of ['mobile', 'desktop']) {
      for (const route of routes) {
        const config = formFactor === 'desktop'
          ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } } }
          : { extends: 'lighthouse:default' };
        const result = await lighthouse(origin + route, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, config);
        const lhr = result.lhr;
        const score = (c) => Math.round(lhr.categories[c].score * 100);
        const metric = (id) => lhr.audits[id]?.displayValue || '';
        const failing = Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'manual').map((a) => `${a.id} (${a.score})`);
        const row = { formFactor, route, performance: score('performance'), accessibility: score('accessibility'), bestPractices: score('best-practices'), seo: score('seo'), FCP: metric('first-contentful-paint'), LCP: metric('largest-contentful-paint'), TBT: metric('total-blocking-time'), CLS: metric('cumulative-layout-shift'), SI: metric('speed-index'), failing };
        rows.push(row);
        fs.writeFileSync(path.join(out, `${formFactor}-${route === '/' ? 'accueil' : route.slice(1)}.json`), result.report);
        console.log(`${formFactor.padEnd(7)} ${route.padEnd(14)} P${row.performance} A${row.accessibility} BP${row.bestPractices} SEO${row.seo} · LCP ${row.LCP} · TBT ${row.TBT} · CLS ${row.CLS}${failing.length ? ` · à revoir : ${failing.join(', ')}` : ''}`);
      }
    }
  } finally {
    await chrome.kill();
    server.close();
    await build({ env: process.env });
  }
  fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify({ date: new Date().toISOString(), lighthouse: require('lighthouse/package.json').version, chromium: chromium.executablePath().split('/').find((p) => p.startsWith('chromium')), rows }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
