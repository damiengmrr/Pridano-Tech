/*
 * Prépare l'archive de livraison PRIDANOTECH-NEXT-GEN-COMPLETE.zip à côté du projet :
 * sources, site généré, assets, documentation et résumé QA. Exclut les dépendances
 * installées, les secrets locaux et les artefacts de test volumineux.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const os = require('node:os');

const root = path.resolve(__dirname, '..');
const name = 'pridanotech-next-gen';
const zip = path.join(root, '..', 'PRIDANOTECH-NEXT-GEN-COMPLETE.zip');

/* Résumé QA joint : rapports Lighthouse condensés et quelques captures de référence. */
const qaOut = path.join(root, 'docs/qa');
fs.rmSync(qaOut, { recursive: true, force: true });
fs.mkdirSync(path.join(qaOut, 'captures'), { recursive: true });
const summary = path.join(root, '.qa/lighthouse/summary.json');
if (fs.existsSync(summary)) fs.copyFileSync(summary, path.join(qaOut, 'lighthouse-summary.json'));
for (const shot of ['1440-accueil', '390-accueil', '1440-sites-web', '1440-realisations', '390-realisations', '390-contact', '1440-crm', '768-saas']) {
  const src = path.join(root, '.qa/visual', `${shot}.png`);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(qaOut, 'captures', `${shot}.png`));
}

/* Images du film d'ouverture (captures image par image, avec et sans GPU). */
const filmDir = path.join(root, '.qa/film');
if (fs.existsSync(filmDir)) {
  fs.mkdirSync(path.join(qaOut, 'film'), { recursive: true });
  for (const f of fs.readdirSync(filmDir).filter((n) => n.endsWith('.png'))) fs.copyFileSync(path.join(filmDir, f), path.join(qaOut, 'film', f));
}

fs.rmSync(zip, { force: true });
const exclude = ['node_modules/*', '.claude/*', 'original/*', '*.zip', '.env', '.env.local', '.env.*.local', '.qa/*', '.tmp/*', 'test-results/*', 'playwright-report/*', '*.DS_Store'].flatMap((p) => ['-x', `${name}/${p}`]);
/* L'archive contient toujours un dossier « pridanotech-next-gen », quel que soit le nom du dossier de travail (copie, autre emplacement). */
let cwd = path.join(root, '..');
if (path.basename(root) !== name) {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'pridano-pack-'));
  fs.symlinkSync(root, path.join(cwd, name));
}
execFileSync('zip', ['-r', '-q', '-9', zip, name, ...exclude], { cwd, stdio: 'inherit' });
const size = (fs.statSync(zip).size / 1024 / 1024).toFixed(1);
console.log(`✓ ${path.basename(zip)} (${size} Mo)`);
