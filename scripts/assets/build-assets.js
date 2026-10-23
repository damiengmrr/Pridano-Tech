/*
 * Prépare les ressources statiques à partir de brand-source/ :
 *  - images responsives AVIF + WebP (manifeste site/data/images.json)
 *  - captures produit originales (bouton « Agrandir »)
 *  - SVG de marque, favicons, icônes d’application, logo pour les données structurées
 *  - police Archivo (variable, sous-ensemble latin) auto-hébergée
 * À relancer après modification d’une source : `npm run assets`.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const logo = require('../../site/lib/logo');

const root = path.resolve(__dirname, '../..');
const src = (...p) => path.join(root, 'brand-source', ...p);
const out = (...p) => path.join(root, 'public', ...p);
fs.mkdirSync(out('assets/img'), { recursive: true });
fs.mkdirSync(out('assets/img/product'), { recursive: true });
fs.mkdirSync(out('assets/brand'), { recursive: true });
fs.mkdirSync(out('assets/fonts'), { recursive: true });

const jobs = [
  { name: 'damien', file: src('photos/damien.jpg'), widths: [400, 640, 960] },
  { name: 'noah', file: src('photos/noah.jpg'), widths: [400, 640, 960] },
  { name: 'solaria', file: src('photos/solaria.jpg'), widths: [640, 960, 1400] },
  { name: 'ppg', file: src('photos/logo-ppg.png'), widths: [640, 960, 1400] },
  { name: 'dashboard', file: src('product/dashboard.png'), widths: [640, 1000, 1440] },
  { name: 'factures', file: src('product/factures.png'), widths: [640, 1000, 1440] },
  { name: 'planning', file: src('product/planning.png'), widths: [640, 1000, 1440] },
  { name: 'login', file: src('product/login.png'), widths: [640, 1200, 1800] },
  { name: 'logo-3d', file: src('logo-3d-icon.webp'), widths: [480, 940] },
  /* Captures réelles des sites livrés (npm run captures) */
  { name: 'solaria-site', file: src('realisations/solaria-desktop.png'), widths: [640, 900, 1440], optional: true },
  { name: 'solaria-site-m', file: src('realisations/solaria-mobile.png'), widths: [300, 560], optional: true },
  { name: 'ppg-site', file: src('realisations/ppg-desktop.png'), widths: [640, 900, 1440], optional: true },
  { name: 'ppg-site-m', file: src('realisations/ppg-mobile.png'), widths: [300, 560], optional: true },
  { name: 'hero-poster', file: src('generated/hero-poster.png'), widths: [420, 640, 860, 1100, 1300], alpha: true, optional: true },
];

async function images() {
  const manifest = {};
  for (const job of jobs) {
    if (!fs.existsSync(job.file)) {
      if (job.optional) { console.log(`- ${job.name} : source absente (npm run poster / npm run captures)`); continue; }
      throw new Error(`Source manquante : ${job.file}`);
    }
    const meta = await sharp(job.file).metadata();
    const widths = job.widths.filter((w) => w <= meta.width);
    if (!widths.length) widths.push(meta.width);
    for (const w of widths) {
      const base = sharp(job.file).resize({ width: w, withoutEnlargement: true });
      await base.clone().avif({ quality: job.alpha ? 62 : 55, effort: 6 }).toFile(out('assets/img', `${job.name}-${w}.avif`));
      await base.clone().webp({ quality: job.alpha ? 82 : 78, alphaQuality: 90, effort: 6 }).toFile(out('assets/img', `${job.name}-${w}.webp`));
    }
    manifest[job.name] = { widths, width: meta.width, height: meta.height, formats: ['avif', 'webp'] };
    console.log(`✓ ${job.name} ${widths.join('/')}`);
  }
  fs.writeFileSync(path.join(root, 'site/data/images.json'), JSON.stringify(manifest, null, 2));
  for (const f of ['dashboard', 'factures', 'planning', 'login']) {
    await sharp(src('product', `${f}.png`)).png({ compressionLevel: 9, palette: false }).toFile(out('assets/img/product', `${f}.png`));
  }
}

async function brandFiles() {
  const markSvg = logo.standaloneMark({ size: 512 });
  fs.writeFileSync(out('assets/brand/pridano-tech-symbole.svg'), markSvg);
  fs.writeFileSync(out('assets/brand/pridano-tech-logo.svg'), logo.standaloneLogo({ height: 120 }));
  fs.writeFileSync(out('assets/brand/pridano-tech-logo-blanc.svg'), logo.standaloneLogo({ height: 120, color: '#ffffff' }));
  fs.writeFileSync(out('favicon.svg'), logo.standaloneMark({ size: 64, padding: 0.04 }));
  const onWhite = (size, padding) => sharp(Buffer.from(logo.standaloneMark({ size, padding, background: '#ffffff' }))).png();
  await onWhite(180, 0.16).toFile(out('apple-touch-icon.png'));
  await onWhite(512, 0.16).toFile(out('assets/brand/pridano-tech-logo-512.png'));
  await onWhite(192, 0.16).toFile(out('assets/brand/icon-192.png'));
  await sharp(Buffer.from(logo.standaloneMark({ size: 512, padding: 0.22, background: '#ffffff' }))).png().toFile(out('assets/brand/icon-maskable-512.png'));
  await sharp(Buffer.from(logo.standaloneMark({ size: 48, padding: 0.04 }))).png().toFile(out('favicon-48.png'));
  console.log('✓ marque : SVG, favicons, icônes');
}

function fonts() {
  const pkg = path.join(root, 'node_modules/@fontsource-variable/archivo');
  fs.copyFileSync(path.join(pkg, 'files/archivo-latin-wght-normal.woff2'), out('assets/fonts/archivo-latin-wght.woff2'));
  fs.copyFileSync(path.join(pkg, 'LICENSE'), out('assets/fonts/ARCHIVO-OFL.txt'));
  console.log('✓ police Archivo (OFL)');
}

(async () => {
  fonts();
  await brandFiles();
  await images();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
