const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 for(const route of ['/','/sites-web','/saas','/crm','/contact']) {
  await page.goto('http://127.0.0.1:4173'+route);await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`.qa/desktop-${route==='/'?'home':route.slice(1)}.png`});
 }
 await page.goto('http://127.0.0.1:4173/');
 // Scroll naturally through the document so lazy images have loaded before the full-page capture.
 await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=750){scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}scrollTo(0,0);await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
 await page.screenshot({path:'.qa/desktop-home-full.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/','/contact']){await page.goto('http://127.0.0.1:4173'+route);await page.screenshot({path:`.qa/mobile-${route==='/'?'home':'contact'}.png`,fullPage:route!=='/'});}
 await page.goto('http://127.0.0.1:4173/');await page.locator('.menu-toggle').click();await page.screenshot({path:'.qa/mobile-menu.png'});
 await page.goto('http://127.0.0.1:4173/sites-web');await page.locator('[data-stage="7"]').click();await page.locator('[data-build]').screenshot({path:'.qa/mobile-build.png'});
 await browser.close();console.log('Visual captures saved in .qa');
})().catch(e=>{console.error(e);process.exitCode=1;});
