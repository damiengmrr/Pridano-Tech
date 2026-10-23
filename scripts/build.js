/*
 * Build du site : bundles JS/CSS (esbuild), pages HTML prérendues, métadonnées SEO,
 * données structurées, sitemap, robots, manifeste. Aucun framework, aucune hydratation.
 *
 *   npm run build                       → origine locale, indexation bloquée
 *   PUBLIC_SITE_URL=https://pridanotech.fr NODE_ENV=production npm run build
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
require('dotenv').config({ quiet: true });
require('dotenv').config({ path: '.env.local', quiet: true });

const routes = require('../site/pages');
const { chrome, defaultCta } = require('../site/components/layout');
const { graph } = require('../site/seo');
const { brand } = require('../site/data/brand');
const { esc } = require('../site/lib/html');

const root = path.resolve(__dirname, '..');
const pub = (...p) => path.join(root, 'public', ...p);

/* Origine canonique et indexation, déduites de l’environnement (variables Netlify prioritaires sur .env). */
function settings(env) {
  /* QA_INDEXABLE_ORIGIN : mesure Lighthouse locale uniquement (page indexable servie en local). Ne jamais déployer avec. */
  if (env.QA_INDEXABLE_ORIGIN) return { origin: new URL(env.QA_INDEXABLE_ORIGIN).origin, blockIndexing: false };
  const origin = new URL(env.PUBLIC_SITE_URL || 'http://localhost:3000').origin;
  const local = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|$)/.test(origin);
  if (env.NODE_ENV === 'production' && local) throw new Error('PUBLIC_SITE_URL doit contenir le domaine public confirmé avant un build de production.');
  return { origin, blockIndexing: local || ['deploy-preview', 'branch-deploy', 'dev'].includes(env.CONTEXT) };
}
const UMAMI_ID = '8c9f201d-bbd1-46e9-bf2c-cfe5a4a9f71d';

const hash = (content) => crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
const cspHash = (content) => `'sha256-${crypto.createHash('sha256').update(content).digest('base64')}'`;

async function bundleScripts() {
  const outDir = pub('assets/js/build');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const worker = await esbuild.build({ entryPoints: [path.join(root, 'src/scripts/gl/sdf-worker.js')], bundle: true, minify: true, format: 'esm', target: 'es2020', write: false, legalComments: 'none' });
  const workerCode = worker.outputFiles[0].text;
  const workerName = `sdf-worker-${hash(workerCode)}.js`;
  fs.writeFileSync(path.join(outDir, workerName), workerCode);

  const result = await esbuild.build({
    entryPoints: { main: path.join(root, 'src/scripts/main.js') },
    bundle: true,
    splitting: true,
    format: 'esm',
    target: ['es2020', 'safari15'],
    minify: true,
    sourcemap: false,
    legalComments: 'none',
    outdir: outDir,
    entryNames: '[name]-[hash]',
    chunkNames: 'c-[name]-[hash]',
    metafile: true,
    define: { __SDF_WORKER__: JSON.stringify(`/assets/js/build/${workerName}`) },
  });
  const main = Object.entries(result.metafile.outputs).find(([, o]) => o.entryPoint && o.entryPoint.endsWith('main.js'))[0];
  const sizes = Object.entries(result.metafile.outputs).filter(([f]) => f.endsWith('.js')).map(([f, o]) => `${path.basename(f)} ${(o.bytes / 1024).toFixed(1)} Ko`);
  return { main: '/' + path.relative(pub(), path.join(root, main)).split(path.sep).join('/'), sizes };
}

async function bundleStyles() {
  const build = async (entry) => {
    const r = await esbuild.build({ entryPoints: [path.join(root, 'src/styles', entry)], bundle: true, minify: true, write: false, loader: { '.css': 'css' }, target: ['chrome111', 'safari16.4', 'firefox115'], external: ['/assets/*'], legalComments: 'none' });
    return r.outputFiles[0].text.trim();
  };
  const styles = { main: await build('main.css') };
  for (const f of fs.readdirSync(path.join(root, 'src/styles/pages'))) {
    styles[f.replace('.css', '')] = await build(`pages/${f}`);
  }
  return styles;
}

/* Amorçage synchrone : active les styles JS et oriente la transition de page depuis le point cliqué. */
const BOOT = "(function(d){d.classList.replace('no-js','js');try{var s=sessionStorage;if(!s.getItem('pt-intro')){s.setItem('pt-intro','1');if(location.pathname==='/'&&!location.hash&&!matchMedia('(prefers-reduced-motion: reduce)').matches){var m='full';try{m=localStorage.getItem('pt-film')?'short':'full';localStorage.setItem('pt-film','1')}catch(_){}d.dataset.intro=m;d.classList.add('has-intro')}}}catch(_){}addEventListener('pagereveal',function(e){if(!e.viewTransition)return;var k='fade';try{var o=JSON.parse(sessionStorage.getItem('pt-vt')||'null');if(o&&Date.now()-o.t<5000){k=o.k||'circle';d.style.setProperty('--vt-x',o.x+'%');d.style.setProperty('--vt-y',o.y+'%');if(o.r)d.style.setProperty('--vt-r',o.r.join('% ')+'%')}sessionStorage.removeItem('pt-vt')}catch(_){}d.dataset.vt=k;e.viewTransition.finished.finally(function(){delete d.dataset.vt})})})(document.documentElement)";

function csp() {
  return [
    "default-src 'self'",
    `script-src 'self' ${cspHash(BOOT)} https://cloud.umami.is`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev",
    "worker-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
  ].join('; ');
}

function documentHtml(route, page, { scripts, styles, origin, blockIndexing }) {
  /* Format des titres du site existant : « Titre · Pridano ». */
  const pageTitle = `${page.title} · ${brand.shortName}`;
  const url = origin + (route === '/' || route === '/404' ? '/' : route);
  const canonical = route === '/404' ? '' : `<link rel="canonical" href="${esc(url)}">`;
  const robots = blockIndexing || page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  const cta = page.headerCta || defaultCta;
  const { before, after } = chrome(route, cta);
  const extraCss = page.css && styles[page.css] ? styles[page.css] : '';
  const quoteCss = page.page === 'quote' ? styles.devis : '';
  const og = `${origin}/assets/brand/pridano-tech-og.jpg`;
  const jsonLd = route === '/404' ? '' : `<script type="application/ld+json">${JSON.stringify(graph({ origin, route, page })).replaceAll('<', '\\u003c')}</script>`;
  const analytics = blockIndexing ? '' : `<script defer src="https://cloud.umami.is/script.js" data-website-id="${UMAMI_ID}" data-domains="pridanotech.fr"></script>`;
  return `<!doctype html>
<html lang="fr-FR" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp()}">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="${robots}">
${canonical}
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#f2f3f5">
<meta name="color-scheme" content="light">
<meta name="author" content="${brand.name}">
<link rel="preload" href="/assets/fonts/archivo-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
<style>${styles.main}${extraCss}${quoteCss}</style>
<script>${BOOT}</script>
<script type="module" src="${scripts.main}"></script>
${analytics}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${brand.shortName}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(page.description)}">
${route === '/404' ? '' : `<meta property="og:url" content="${esc(url)}">`}
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Pridano Tech : le symbole en volume et le logotype pridano.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(pageTitle)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${og}">
${jsonLd}
</head>
<body id="top" data-route="${route}"${page.page ? ` data-page="${page.page}"` : ''}>
${before}
<main id="main" tabindex="-1">
${page.body()}
</main>
${after}
</body>
</html>
`;
}

function seoFiles(indexed, { origin, blockIndexing }) {
  const files = new Map();
  files.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map((r) => `  <url><loc>${esc(origin + (r === '/' ? '/' : r))}</loc></url>`).join('\n')}\n</urlset>\n`);
  files.set('robots.txt', `User-agent: *\n${blockIndexing ? 'Disallow: /' : 'Allow: /\nDisallow: /api/'}\n\nSitemap: ${origin}/sitemap.xml\n`);
  files.set('site.webmanifest', JSON.stringify({
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    lang: 'fr-FR',
    start_url: '/',
    display: 'browser',
    background_color: '#f2f3f5',
    theme_color: '#f2f3f5',
    icons: [
      { src: '/assets/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/brand/pridano-tech-logo-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2));
  /* Résumé factuel pour les agents et assistants (format llms.txt, non normalisé : aucune garantie d’usage). */
  files.set('llms.txt', `# ${brand.name}\n\n> ${brand.description}\n\nVariantes du nom : ${brand.alternateNames.join(', ')}. Site officiel : ${origin}/\n\n## Pages principales\n\n- [Sites web : création et refonte](${origin}/sites-web)\n- [Logiciels métier, SaaS et automatisation](${origin}/saas)\n- [Réalisations](${origin}/realisations)\n- [Pridano Business OS, produit en développement](${origin}/crm)\n- [Le studio : Damien Gamarra et Noah Lemoing](${origin}/a-propos)\n- [Contact](${origin}/contact) · [Brief guidé](${origin}/devis)\n\n## Contact\n\n- Email : ${brand.email}\n- Ville : ${brand.city}, ${brand.country}\n`);
  return files;
}

/*
 * Génère le site. `write: false` renvoie les fichiers sans toucher au disque (tests),
 * `bundle: false` remplace les bundles par des valeurs neutres.
 */
async function build({ env = process.env, write = true, bundle = true } = {}) {
  const ctx = settings(env);
  const [scripts, styles] = bundle ? await Promise.all([bundleScripts(), bundleStyles()]) : [{ main: '/assets/js/build/main.js', sizes: [] }, { main: '', devis: '', privacy: '' }];
  const files = new Map();
  const indexed = [];
  for (const [route, { file, page, sitemap = true }] of Object.entries(routes)) {
    files.set(file, documentHtml(route, page, { scripts, styles, ...ctx }));
    if (sitemap && !page.noindex) indexed.push(route);
  }
  for (const [name, body] of seoFiles(indexed, ctx)) files.set(name, body);
  if (write) for (const [name, body] of files) fs.writeFileSync(pub(name), body);
  return { files, scripts, styles, ...ctx };
}

if (require.main === module) {
  build().then(({ scripts, styles, origin, blockIndexing, files }) => {
    console.log(`✓ ${files.size} fichiers générés · ${blockIndexing ? 'aperçu : indexation bloquée' : `origine canonique ${origin}`}`);
    console.log(`  CSS inline : ${(styles.main.length / 1024).toFixed(1)} Ko (brut) · JS : ${scripts.sizes.join(' · ')}`);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { build, settings, BOOT, csp };
