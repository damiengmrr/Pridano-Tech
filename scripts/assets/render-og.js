/*
 * Image de partage (Open Graph / réseaux sociaux) 1200 × 630, composée en HTML puis capturée :
 * symbole en volume (rendu du shader), logotype officiel vectorisé et signature de marque.
 * Sortie : public/assets/brand/pridano-tech-og.jpg
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const sharp = require('sharp');
const logo = require('../../site/lib/logo');

const root = path.resolve(__dirname, '../..');
const font = fs.readFileSync(path.join(root, 'public/assets/fonts/archivo-latin-wght.woff2')).toString('base64');
const poster = fs.readFileSync(path.join(root, 'brand-source/generated/hero-poster.png')).toString('base64');

const html = `<!doctype html><html><head><style>
@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f2f3f5;font-family:Archivo;color:#0a0c10;overflow:hidden;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(40% 60% at 76% 50%,rgba(31,220,255,.22),transparent 70%)}
.poster{position:absolute;right:-40px;top:50%;width:620px;transform:translateY(-50%)}
.copy{position:absolute;left:72px;top:64px;bottom:64px;width:640px;display:flex;flex-direction:column;justify-content:space-between}
.brand svg{height:58px;width:auto}
h1{font-size:84px;line-height:.88;letter-spacing:-.06em;font-weight:820}
.sq{display:inline-block;width:.16em;height:.145em;background:#1b45ff;margin-left:.04em}
p{font-size:24px;font-weight:560;letter-spacing:-.01em;color:#262b36}
.url{font-size:20px;font-weight:640;color:#1b45ff}
</style></head><body><div class="glow"></div>
<img class="poster" src="data:image/png;base64,${poster}">
<div class="copy"><div class="brand">${logo.standaloneLogo({ height: 58 })}</div>
<div><h1>Des sites qui marquent<span class="sq"></span><br>Des outils qui<br>font avancer<span class="sq"></span></h1></div>
<div><p>Design. Développement. Impact.</p><p class="url">pridanotech.fr · Montpellier</p></div></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: 'png' });
    await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, 'public/assets/brand/pridano-tech-og.jpg'));
    console.log('✓ public/assets/brand/pridano-tech-og.jpg');
  } finally {
    await browser.close();
  }
})();
