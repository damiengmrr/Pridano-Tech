/*
 * Captures réelles des sites livrés (réalisations), en desktop et en mobile.
 * Aucune interaction avec les sites : pas de clic sur les bandeaux de consentement,
 * on attend simplement le rendu. Sortie : brand-source/realisations/<id>-{desktop,mobile}.png,
 * puis `npm run assets` pour générer les versions AVIF/WebP.
 *
 *   node scripts/assets/capture-realisations.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { projects } = require('../../site/data/brand');

const out = path.resolve(__dirname, '../../brand-source/realisations');
const shots = [
  { suffix: 'desktop', viewport: { width: 1440, height: 900 }, scale: 1 },
  { suffix: 'mobile', viewport: { width: 390, height: 844 }, scale: 2 },
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const project of projects) {
      for (const shot of shots) {
        const context = await browser.newContext({ viewport: shot.viewport, deviceScaleFactor: shot.scale, reducedMotion: 'reduce', locale: 'fr-FR', isMobile: shot.suffix === 'mobile', hasTouch: shot.suffix === 'mobile' });
        const page = await context.newPage();
        try {
          await page.goto(project.href, { waitUntil: 'networkidle', timeout: 45000 });
        } catch {
          await page.waitForTimeout(3000);
        }
        await page.waitForTimeout(2500);
        const file = path.join(out, `${project.id}-${shot.suffix}.png`);
        await page.screenshot({ path: file });
        console.log(`✓ ${path.relative(process.cwd(), file)}`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
