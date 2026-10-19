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
   expect(await page.locator('img[src]').evaluateAll(images=>images.filter(i=>i.complete && !i.naturalWidth).map(i=>i.src)),route).toEqual([]);
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/^http/);
   if(['desktop','tablet','mobile'].includes(name)) {
    // Visit the real scroll positions so below-the-fold lazy images are represented.
    await page.evaluate(async()=>{
     for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight*.8){
      window.scrollTo({top:y,behavior:'instant'});await new Promise(resolve=>setTimeout(resolve,35));
     }
     await Promise.all([...document.querySelectorAll('img[src]')].map(img=>img.decode().catch(()=>{})));
     window.scrollTo({top:0,behavior:'instant'});
    });
    await page.screenshot({path:`test-results/visual/${name}-${route==='/'?'home':route.slice(1)}.png`,fullPage:true});
   }
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

for(const width of [1440,390]) {
 test(`product theater at ${width}: lazy assets, keyboard, real captures and motion controls`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  const images=[];
  page.on('request',request=>{if(request.url().includes('/images/pridano/')) images.push(request.url());});
  await page.goto('/crm');
  const theater=page.locator('[data-product-theater]');
  await theater.scrollIntoViewIfNeeded();
  await expect(theater).toHaveAttribute('data-playback','paused');
  await expect(page.locator('[data-product-play]')).toBeHidden();
  expect(images.some(url=>/factures|planning|login/.test(url))).toBe(false);
  for(let i=0;i<4;i++){
   await page.locator(`[data-product-tab="${i}"]`).click();
   await expect(theater).toHaveAttribute('data-active',String(i));
   const panel=page.locator(`[data-product-panel="${i}"]`);
   await expect(panel).toBeVisible();
   expect(await panel.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
   await theater.screenshot({path:`test-results/visual/product-${width}-${i}.png`});
  }
  await page.locator('[data-product-tab="3"]').focus();await page.keyboard.press('Home');
  await expect(page.locator('[data-product-tab="0"]')).toBeFocused();
  await expect(theater).toHaveAttribute('data-active','0');
  await page.keyboard.press('ArrowRight');await expect(theater).toHaveAttribute('data-active','1');
  await page.locator('[data-product-expand]').click();await expect(page.locator('.product-dialog')).toBeVisible();
  await expect(page.locator('.dialog-image img')).toHaveAttribute('src','/assets/images/pridano/factures.png');
  await page.keyboard.press('Escape');await expect(page.locator('.product-dialog')).not.toBeVisible();
  await expect(page.locator('[data-product-expand]')).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('[data-product-play]').click();await expect(theater).toHaveAttribute('data-playback','playing');
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await expect(theater).toHaveAttribute('data-playback','paused');
  await theater.scrollIntoViewIfNeeded();await expect(theater).toHaveAttribute('data-playback','playing');
  await page.locator('[data-product-play]').click();await expect(theater).toHaveAttribute('data-playback','paused');
 });
}
test('hero sequence resolves once and construction exposes each visual stage',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await page.waitForTimeout(6000);
 await expect(page.locator('[data-hero-scene]')).toHaveClass(/scene-active/);
 expect(await page.locator('.hero-scene .mock-button').evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);
 await page.screenshot({path:'test-results/visual/hero-motion-complete.png'});
 for(let i=0;i<9;i++){
  await page.locator(`[data-stage="${i}"]`).click();
  await page.waitForTimeout(800);
  await page.screenshot({path:`test-results/visual/construction-${i}.png`});
 }
});

test('product visit advances after eight seconds and stays frozen outside the viewport',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.clock.install();await page.goto('/crm');
 const theater=page.locator('[data-product-theater]');await theater.scrollIntoViewIfNeeded();
 await expect(theater).toHaveAttribute('data-playback','playing');
 await page.clock.fastForward(8100);await expect(theater).toHaveAttribute('data-active','1');
 await page.locator('.footer').scrollIntoViewIfNeeded();await expect(theater).toHaveAttribute('data-playback','paused');
 await page.clock.fastForward(24000);await expect(theater).toHaveAttribute('data-active','1');
 await page.emulateMedia({reducedMotion:'reduce'});await theater.scrollIntoViewIfNeeded();
 await expect(theater).toHaveAttribute('data-playback','paused');await page.clock.fastForward(16000);
 await expect(theater).toHaveAttribute('data-active','1');
});

test('phone symbols request text presentation and restore unchanged desktop text', async ({page}) => {
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 const star=page.locator('.asterisk');
 await expect(star).toHaveText('✳');
 const desktopText=await page.locator('main').textContent();
 await page.setViewportSize({width:390,height:844});
 await expect(star).toHaveText('✳\uFE0E');
 await expect(page.locator('.browser-bar>span').last().first()).toHaveText('↗\uFE0E');
 await page.setViewportSize({width:1440,height:900});
 await expect(star).toHaveText('✳');
 expect(await page.locator('main').textContent()).toBe(desktopText);
 await page.setViewportSize({width:390,height:844});
 await page.reload();
 await expect(star).toHaveText('✳\uFE0E');
});
