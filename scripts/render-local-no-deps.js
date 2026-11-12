/* Prévisualisation locale sans installation npm : reconstruit les pages avec les
   dernières données/templates, et conserve les anciens bundles du ZIP.
   Pour la mise en ligne, préférer npm ci && npm run build. */
const fs = require('node:fs');
const path = require('node:path');
const routes = require('../site/pages');
const { chrome, defaultCta } = require('../site/components/layout');
const { brand } = require('../site/data/brand');
const { esc } = require('../site/lib/html');
const { graph } = require('../site/seo');
const origin = 'https://pridanotech.fr';
const pub = path.resolve(__dirname,'../public');
for (const [route, {file,page}] of Object.entries(routes)) {
  const filename = path.join(pub,file);
  if (!fs.existsSync(filename)) throw new Error(`HTML de base absent: ${file}`);
  let html=fs.readFileSync(filename,'utf8');
  const {before,after}=chrome(route,page.headerCta || defaultCta);
  const body=`<body id="top" data-route="${route}"${page.page ? ` data-page="${page.page}"` : ''}>\n${before}\n<main id="main" tabindex="-1">\n${page.body()}\n</main>\n${after}\n</body>`;
  html=html.replace(/<body\b[^>]*>[\s\S]*<\/body>/, body);
  // Actualiser titres et descriptions à partir de chaque page, nouvelles pages incluses.
  html=html.replace(/<title>[^<]*<\/title>/,`<title>${esc(page.title)} · ${esc(brand.shortName)}</title>`);
  html=html.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(page.description)}">`);
  const canonical = origin + (route === '/' || route === '/404' ? '/' : route);
  html=html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);
  html=html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`);
  html=html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(page.title)} · ${esc(brand.shortName)}">`);
  html=html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(page.description)}">`);
  html=html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(page.title)} · ${esc(brand.shortName)}">`);
  html=html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(page.description)}">`);
  const structured = JSON.stringify(graph({ origin, route, page })).replaceAll('<', '\\u003c');
  html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${structured}</script>`);
  if (!html.includes('/assets/css/refonte.css')) html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/refonte.css">\n<script defer src="/assets/js/refonte.js"></script>\n</head>');
  fs.writeFileSync(filename,html);
}
// Les trois pages ajoutées ont d'abord besoin d'un HTML de référence. Le script
// est à utiliser après initialisation par scripts/build.js, ou avec la copie ci-dessous.
const indexed = Object.entries(routes).filter(([route, item]) => item.sitemap !== false && !item.page.noindex).map(([route]) => route);
fs.writeFileSync(path.join(pub, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map((route) => `  <url><loc>${esc(origin + (route === '/' ? '/' : route))}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`${Object.keys(routes).length} pages HTML synchronisées`);
