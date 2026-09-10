const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const roots=['server.js','scripts','site','server','netlify/functions','public/assets/js'];
function walk(file){return fs.statSync(file).isDirectory()?fs.readdirSync(file).flatMap(name=>walk(path.join(file,name))):[file];}
const scripts=roots.flatMap(walk).filter(file=>file.endsWith('.js'));
for(const file of scripts) execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
const pages=require('../site/pages');
for(const route of Object.keys(pages)){
 const name=route==='/'?'index':route.slice(1);
 const html=fs.readFileSync(`public/${name}.html`,'utf8');
 if((html.match(/<h1(?:\s|>)/g)||[]).length!==1) throw Error(`Expected one H1: ${route}`);
 for(const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) if(!fs.existsSync(`public${match[1]}`)) throw Error(`Missing asset ${match[1]}`);
 if(!html.includes('rel="canonical"')||!html.includes('property="og:title"')) throw Error(`Missing metadata: ${route}`);
}
console.log(`Syntax checked ${scripts.length} JavaScript files; HTML, H1, local assets and metadata checked for ${Object.keys(pages).length} pages.`);
