/*
 * QA visuelle : captures pleine page de chaque route à plusieurs largeurs, contrôle du
 * débordement horizontal et des erreurs console. Mouvement réduit émulé pour obtenir des
 * captures stables (les séquences épinglées se déplient alors en contenu statique).
 *
 *   node scripts/qa/visual.js [largeurs séparées par des virgules] [routes…]
 * Sortie : .qa/visual/<largeur>-<route>.png et .qa/visual/report.json
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { createApp } = require('../../server');

const root = path.resolve(__dirname, '../..');
const out = path.join(root, '.qa/visual');
const widths = (process.argv[2] || '320,375,390,768,1024,1440,1920').split(',').map(Number);
const routes = process.argv.slice(3).length ? process.argv.slice(3) : ['/', '/sites-web', '/saas', '/realisations', '/crm', '/a-propos', '/contact', '/devis', '/mentions-legales', '/confidentialite', '/page-inexistante'];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const report = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
      for (const route of routes) {
        const page = await context.newPage();
        const errors = [];
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        page.on('pageerror', (e) => errors.push(e.message));
        await page.addInitScript(() => sessionStorage.setItem('pt-intro', '1'));
        await page.goto(origin + route, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        /* Défilement complet : déclenche le chargement différé des images et les apparitions. */
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 40));
          }
          window.scrollTo(0, 0);
          const visible = [...document.images].filter((img) => img.offsetParent !== null && !img.complete);
          await Promise.race([Promise.all(visible.map((img) => new Promise((r) => { img.onload = img.onerror = r; }))), new Promise((r) => setTimeout(r, 4000))]);
        });
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement.scrollWidth - window.innerWidth;
          const offenders = [...document.querySelectorAll('body *')].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > window.innerWidth + 1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.hero-stage, .final-orbit, .lost-stage, [aria-hidden="true"], .method-track, .sprite');
          }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} → ${Math.round(el.getBoundingClientRect().right)}`);
          return { doc, offenders };
        });
        const name = `${width}-${route === '/' ? 'accueil' : route.slice(1).replaceAll('/', '_')}.png`;
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.screenshot({ path: path.join(out, name), fullPage: true, clip: height < 15000 ? undefined : { x: 0, y: 0, width, height: 15000 } });
        report.push({ width, route, overflow: overflow.doc, offenders: overflow.offenders, errors });
        if (overflow.doc > 0 || errors.length) console.log(`⚠ ${width} ${route}`, overflow, errors);
        await page.close();
      }
      await context.close();
      console.log(`✓ ${width}px`);
    }
  } finally {
    await browser.close();
    server.close();
  }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
})();
