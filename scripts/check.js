/*
 * Contrôles rapides avant publication : syntaxe JS, un H1 par page, ressources locales
 * existantes, métadonnées essentielles, aucun secret ni hôte local dans les fichiers servis.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const walk = (file) => (fs.statSync(file).isDirectory() ? fs.readdirSync(file).flatMap((name) => walk(path.join(file, name))) : [file]);
const scripts = ['server.js', 'scripts', 'site', 'server', 'netlify/functions'].map((p) => path.join(root, p)).flatMap(walk).filter((f) => f.endsWith('.js'));
for (const file of scripts) execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });

const routes = require('../site/pages');
let assets = 0;
for (const [route, { file }] of Object.entries(routes)) {
  const html = fs.readFileSync(path.join(root, 'public', file), 'utf8');
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) throw new Error(`Un seul H1 attendu : ${route}`);
  for (const match of html.matchAll(/(?:src|href|srcset)="([^"]+)"/g)) {
    for (const candidate of match[1].split(',').map((s) => s.trim().split(' ')[0])) {
      if (!candidate.startsWith('/assets/') && !candidate.startsWith('/favicon') && !candidate.startsWith('/apple-touch')) continue;
      assets++;
      if (!fs.existsSync(path.join(root, 'public', candidate.split(/[?#]/)[0]))) throw new Error(`Ressource manquante ${candidate} (${route})`);
    }
  }
  for (const needle of ['<meta name="description"', 'property="og:title"', '<meta name="viewport"', 'lang="fr-FR"']) {
    if (!html.includes(needle)) throw new Error(`Métadonnée manquante ${needle} : ${route}`);
  }
  if (route !== '/404' && !html.includes('rel="canonical"')) throw new Error(`Canonical manquant : ${route}`);
}

const served = walk(path.join(root, 'public')).filter((f) => /\.(html|js|css|txt|xml|json|webmanifest)$/.test(f));
for (const file of served) {
  const body = fs.readFileSync(file, 'utf8');
  if (/re_[A-Za-z0-9]{12,}|gsk_[A-Za-z0-9]{12,}|sk-[A-Za-z0-9]{20,}/.test(body)) throw new Error(`Secret potentiel dans ${path.relative(root, file)}`);
}
console.log(`✓ ${scripts.length} fichiers JS vérifiés · ${Object.keys(routes).length} pages · ${assets} références de ressources · aucun secret dans ${served.length} fichiers servis.`);
