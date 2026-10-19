const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({quiet:true});
require('dotenv').config({path:'.env.local',quiet:true});
const pages = require('../site/pages');
const {header,footer,brand} = require('../site/components');
const root=path.resolve(__dirname,'..');
const rawOrigin=process.env.PUBLIC_SITE_URL || 'http://localhost:3000';
const origin=new URL(rawOrigin).origin;
const local=/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|$)/.test(origin);
if(process.env.NODE_ENV==='production' && local) throw new Error('PUBLIC_SITE_URL doit contenir le domaine public confirmé avant un build de production.');
const blockIndexing=local || ['deploy-preview','branch-deploy','dev'].includes(process.env.CONTEXT);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
function document(route,page){const title=`${page.title} · Pridano`;const canonical=origin+(route==='/'?'/':route);return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(page.description)}"><meta name="theme-color" content="#f7f7f2"><meta name="robots" content="${blockIndexing||page.noindex?'noindex, nofollow':'index, follow'}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="website"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="Pridano"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${origin}/assets/images/pridano-logo.png"><meta property="og:image:width" content="500"><meta property="og:image:height" content="500"><meta property="og:image:alt" content="Logo Pridano"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(page.description)}"><meta name="twitter:image" content="${origin}/assets/images/pridano-logo.png"><link rel="icon" href="${brand.logo}" type="image/png"><link rel="preload" href="/assets/fonts/manrope-regular.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/assets/css/pridano.css"><script src="/assets/js/pridano.js" defer></script><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'Pridano Tech',url:origin,email:brand.email,logo:origin+brand.logo}).replaceAll('<','\\u003c')}</script></head><body data-route="${route}">${header(route)}<main id="main">${page.body()}</main>${footer()}</body></html>`;}
for(const [route,page] of Object.entries(pages)){const name=route==='/'?'index':route.slice(1);fs.writeFileSync(path.join(root,'public',name+'.html'),document(route,page));}
const indexed=Object.entries(pages).filter(([,p])=>!p.noindex).map(([r])=>r);
fs.writeFileSync(path.join(root,'public/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexed.map(r=>`<url><loc>${esc(origin+r)}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync(path.join(root,'public/robots.txt'),`User-agent: *\n${blockIndexing?'Disallow: /':'Allow: /\nDisallow: /api/'}\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Built ${Object.keys(pages).length} static pages. ${blockIndexing?'Preview: indexing disabled.':'Canonical origin: '+origin}`);
