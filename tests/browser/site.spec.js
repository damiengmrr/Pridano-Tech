const {test,expect}=require('@playwright/test');
const routes=['/','/sites-web','/realisations','/saas','/crm','/a-propos','/contact'];
for(const [name,width,height] of [['desktop',1440,1000],['laptop',1280,800],['tablet',768,1024],['mobile',390,844]]) {
 test(`${name}: pages, assets, console and overflow`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
  for(const route of routes){
   const response=await page.goto(route);expect(response.status()).toBe(200);
   await expect(page.locator('h1')).toHaveCount(1);
   await expect(page.locator('h1')).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
   expect(await page.locator('img').evaluateAll(images=>images.filter(i=>i.complete && !i.naturalWidth).map(i=>i.src)),route).toEqual([]);
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/^http/);
   if(['desktop','mobile'].includes(name)) await page.screenshot({path:`test-results/visual/${name}-${route==='/'?'home':route.slice(1)}.png`,fullPage:true});
  }
  expect(errors).toEqual([]);
 });
}
test('mobile menu: keyboard, close, navigation and project type',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const menu=page.locator('.menu-toggle');await menu.click();
 await expect(menu).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#mobile-menu')).toBeVisible();
 await page.screenshot({path:'test-results/visual/mobile-menu.png'});
 await page.keyboard.press('Escape');await expect(menu).toHaveAttribute('aria-expanded','false');await expect(menu).toBeFocused();
 await menu.click();await page.locator('#mobile-menu').getByRole('link',{name:'SaaS & logiciels'}).click();await expect(page).toHaveURL(/\/saas$/);
 await page.getByRole('link',{name:'Parler de mon logiciel'}).click();await expect(page.locator('select[name="projectType"]')).toHaveValue('saas');
});
test('all nine construction states work on touch; reduced motion stays static',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/sites-web');
 for(let i=0;i<9;i++){await page.locator(`[data-stage="${i}"]`).click();await expect(page.locator('[data-build-frame]')).toHaveAttribute('data-phase',String(i));}
 expect(await page.locator('[data-build]').evaluate(el=>getComputedStyle(el).position)).toBe('relative');
 await page.locator('[data-stage="7"]').click();await page.locator('[data-build]').screenshot({path:'test-results/visual/mobile-build.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.locator('html')).not.toHaveClass(/js-motion/);
});
test('desktop scroll builds the site from strategy through mobile to final',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 for(const i of [0,2,4,5,7,8]) {await page.locator(`[data-stage="${i}"]`).click();await expect(page.locator('[data-build-frame]')).toHaveAttribute('data-phase',String(i));}
 await page.locator('[data-stage="4"]').click();await page.screenshot({path:'test-results/visual/desktop-build.png'});
});
test('contact validates, preserves input on error and waits for server acknowledgement',async({page})=>{
 await page.goto('/contact?projet=refonte');await expect(page.locator('select[name="projectType"]')).toHaveValue('refonte');
 await page.getByRole('button',{name:'Parler de votre projet'}).click();await expect(page.locator('input[name="name"]')).toBeFocused();
 await page.locator('input[name="name"]').fill('QA locale');await page.locator('input[name="email"]').fill('qa@example.test');await page.locator('textarea').fill('Test local du formulaire, sans envoi externe.');await page.locator('input[name="consent"]').check();
 await page.route('**/api/contact',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,message:'L’envoi est momentanément indisponible.'})}));
 await page.getByRole('button',{name:'Parler de votre projet'}).click();await expect(page.locator('.form-status')).toContainText('indisponible');await expect(page.locator('textarea')).toHaveValue('Test local du formulaire, sans envoi externe.');
 await page.screenshot({path:'test-results/visual/contact-error.png',fullPage:true});
 await page.route('**/api/contact',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
 await page.getByRole('button',{name:'Parler de votre projet'}).click();await expect(page.locator('.form-status')).toContainText('bien été transmise');await expect(page.locator('textarea')).toHaveValue('');
});
test('main internal links and anchors resolve',async({page,request})=>{
 for(const route of routes){await page.goto(route);const hrefs=await page.locator('a[href]').evaluateAll(links=>[...new Set(links.map(a=>a.getAttribute('href')).filter(h=>h.startsWith('/')||h.startsWith('#')))]);
  for(const href of hrefs){if(href.startsWith('#'))expect(await page.locator(href).count(),href).toBeGreaterThan(0);else expect((await request.get(href)).status(),href).toBeLessThan(400);}
 }
});
