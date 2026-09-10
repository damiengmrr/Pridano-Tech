const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('../server');
let server,origin;
before(async()=>{server=createApp().listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));origin=`http://127.0.0.1:${server.address().port}`;});
after(()=>new Promise(resolve=>server.close(resolve)));
test('all seven main routes and preserved brief/privacy routes serve HTML',async()=>{
 for(const route of ['/','/sites-web','/realisations','/saas','/crm','/a-propos','/contact','/devis.html','/confidentialite','/mentions-legales','/portfolio-noah.html']) {const res=await fetch(origin+route);assert.equal(res.status,200,route);assert.match(res.headers.get('content-type'),/text\/html/);}
});
test('legacy redirects retain query strings and use permanent 301',async()=>{
 for(const [old,url] of [['/index.html','/'],['/services.html','/sites-web'],['/projets.html','/realisations'],['/about.html','/a-propos'],['/confidentialite.html','/confidentialite'],['/contact.html','/contact']]) {
 const res=await fetch(origin+old+'?source=legacy',{redirect:'manual'});assert.equal(res.status,301);assert.equal(res.headers.get('location'),url+'?source=legacy');}
});
test('unknown pages return designed HTML 404 and APIs return JSON 404',async()=>{
 const page=await fetch(origin+'/unknown-page');assert.equal(page.status,404);assert.match(await page.text(),/Reprenons le/);
 const api=await fetch(origin+'/api/unknown');assert.equal(api.status,404);assert.match(api.headers.get('content-type'),/json/);
});
test('contact endpoint rejects incomplete submission without sending email',async()=>{
 const res=await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(res.status,400);assert.equal((await res.json()).ok,false);
});
