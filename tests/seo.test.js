const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const pages=require('../site/pages');
const components=require('../site/components');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'scripts/build.js'),'utf8');
function build(env){
 const files=new Map();
 const configCalls=[];
 const imports={
  'node:fs':{writeFileSync:(file,body)=>files.set(path.basename(file),body)},
  'node:path':path,
  dotenv:{config:options=>configCalls.push(options)},
  '../site/pages':pages,
  '../site/components':components
 };
 vm.runInNewContext(source,{
  require:name=>imports[name],
  __dirname:path.join(root,'scripts'),
  process:{env},URL,console:{log:()=>{}}
 });
 return {files,configCalls};
}
test('production pages allow indexing with the public canonical and sitemap',()=>{
 const {files,configCalls}=build({PUBLIC_SITE_URL:'https://pridanotech.fr',NODE_ENV:'production'});
 for(const [route,page] of Object.entries(pages)){
  const html=files.get((route==='/'?'index':route.slice(1))+'.html');
  assert.ok(html.includes(`content="${page.noindex?'noindex, nofollow':'index, follow'}"`),route);
  assert.ok(html.includes(`rel="canonical" href="https://pridanotech.fr${route}"`),route);
  assert.ok(!html.includes('localhost'),route);
 }
 assert.equal(files.get('robots.txt'),'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://pridanotech.fr/sitemap.xml\n');
 assert.ok(!files.get('sitemap.xml').includes('/404'));
 assert.ok(!files.get('sitemap.xml').includes('/mentions-legales'));
 assert.ok(configCalls.every(options=>!options.override),'environment must override dotenv files');
});
for(const CONTEXT of ['deploy-preview','branch-deploy','dev']){
 test(`${CONTEXT} stays non indexable`,()=>{
  const {files}=build({PUBLIC_SITE_URL:'https://pridanotech.fr',NODE_ENV:'production',CONTEXT});
  assert.match(files.get('index.html'),/content="noindex, nofollow"/);
  assert.match(files.get('robots.txt'),/Disallow: \/\n/);
 });
}
test('localhost remains non indexable and is rejected for a production build',()=>{
 const {files}=build({PUBLIC_SITE_URL:'http://localhost:3000'});
 assert.match(files.get('index.html'),/content="noindex, nofollow"/);
 assert.match(files.get('robots.txt'),/Disallow: \/\n/);
 assert.throws(()=>build({PUBLIC_SITE_URL:'http://localhost:3000',NODE_ENV:'production'}),/PUBLIC_SITE_URL/);
});
