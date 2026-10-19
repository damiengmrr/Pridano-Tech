(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 641px)');
  // Mobile fonts may render these Unicode symbols as colorful emoji.
  // VS15 requests text presentation; restore the original text on desktop.
  const mobileSymbols = new Map();
  function syncMobileSymbols() {
    if (desktop.matches) {
      for (const [node, {original, normalized}] of mobileSymbols) {
        if (node.nodeValue === normalized) node.nodeValue = original;
      }
      mobileSymbols.clear();
      return;
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('script, style, svg, textarea, input, [contenteditable]')) continue;
      const original = node.nodeValue;
      const normalized = original.replace(/([✳↗↘✓©])(?:[\uFE0E\uFE0F])?/gu, '$1\uFE0E');
      if (normalized !== original) {
        mobileSymbols.set(node, {original, normalized});
        node.nodeValue = normalized;
      }
    }
  }
  syncMobileSymbols();
  desktop.addEventListener('change', syncMobileSymbols);
  const header = document.querySelector('.header');
  const menu = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  function setMenu(open) {
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (menu) menu.inert = !open;
    menu?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (e.key === 'Escape') { setMenu(false); toggle.focus(); }
    if (e.key === 'Tab') {
      const items = [toggle, ...menu.querySelectorAll('a')];
      const first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  matchMedia('(min-width: 961px)').addEventListener('change', e => { if(e.matches) setMenu(false); });
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('js-reveal');
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    }), {threshold:.08, rootMargin:'0px 0px -20px 0px'});
    revealEls.forEach(el => revealObserver.observe(el));
  }
  const stageDescriptions = ['Poser la bonne intention avant le premier pixel.','Organiser le message autour de vos visiteurs.','Valider les parcours, sans se laisser distraire par la forme.','Donner à votre entreprise un langage visuel singulier.','Faire dialoguer typographie, contraste et espace.','Donner du rythme et guider le regard.','Composer une expérience généreuse sur grand écran.','Repenser les usages pour le creux de la main.','Réunir le fond, la forme et la technique.'];
  const build = document.querySelector('[data-build]');
  const frame = document.querySelector('[data-build-frame]');
  const stageButtons = [...document.querySelectorAll('[data-stage]')];
  let currentStage = -1;
  function setStage(index) {
    if (!frame || currentStage === index) return;
    currentStage=index;
    frame.dataset.phase=String(index);
    stageButtons.forEach((btn,i)=>btn.setAttribute('aria-pressed',String(i===index)));
    document.querySelector('[data-stage-number]').textContent=`${String(index+1).padStart(2,'0')} / 09`;
    document.querySelector('[data-stage-copy]').textContent=stageDescriptions[index];
    build.style.setProperty('--progress', (index+1)/9);
  }
  function motionMode() {
    document.documentElement.classList.toggle('js-motion',!reduced.matches && desktop.matches);
    const hint = document.querySelector('[data-build-hint]');
    if(hint) hint.textContent = !reduced.matches && desktop.matches ? 'Faites défiler pour voir notre approche prendre forme.' : 'Choisissez une étape pour voir notre approche prendre forme.';
    if (reduced.matches) {document.documentElement.classList.remove('js-reveal');setStage(8);}
    else if (!desktop.matches) setStage(0);
  }
  motionMode();
  if (currentStage<0) setStage(0);
  reduced.addEventListener('change',motionMode);
  desktop.addEventListener('change',motionMode);
  stageButtons.forEach((btn,i)=>btn.addEventListener('click',()=>{
    if (!reduced.matches && desktop.matches) {
      const top=build.getBoundingClientRect().top+scrollY;
      const distance=build.offsetHeight-innerHeight;
      // Interior of each stage's scroll interval avoids rounding into the previous stage.
      window.scrollTo({top:top-header.offsetHeight+distance*(i+.25)/9,behavior:'instant'});
    }
    setStage(i);
  }));
  let scheduled=false;
  const hero=document.querySelector('.hero-browser');
  function updateScroll() {
    scheduled=false;
    header?.classList.toggle('scrolled',scrollY>12);
    if (build && desktop.matches && !reduced.matches) {
      const rect=build.getBoundingClientRect();
      const distance=build.offsetHeight-innerHeight;
      const progress=Math.min(1,Math.max(0,(header.offsetHeight-rect.top)/distance));
      if (rect.top<innerHeight && rect.bottom>0) setStage(Math.min(8,Math.floor(progress*9)));
    }
    if(hero && !reduced.matches && desktop.matches && scrollY<innerHeight*1.3) {
      const drift=Math.min(1,scrollY/innerHeight);
      hero.style.translate=`0 ${drift*-25}px`;
    }
  }
  function scheduleScroll(){if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll);}}
  window.addEventListener('scroll',scheduleScroll,{passive:true});
  window.addEventListener('resize',scheduleScroll,{passive:true});
  updateScroll();
  const workflow=document.querySelector('[data-workflow]');
  if(workflow) {
    const nodes=[...workflow.querySelectorAll('[data-workflow-node]')];
    let timer, index=0, visible=false, paused=false;
    const pause=workflow.querySelector('[data-workflow-pause]');
    const stepLabel=workflow.querySelector('[data-workflow-label]');
    const names=nodes.map(n=>n.lastElementChild.textContent);
    function draw(){
      nodes.forEach((n,i)=>{n.classList.toggle('is-active',i===index);n.classList.toggle('is-complete',i<index);});
      workflow.style.setProperty('--workflow-progress',index/(nodes.length-1));
      stepLabel.textContent=index===nodes.length-1 ? 'Un parcours. Un seul système.' : `${names[index]} → ${names[index+1]}`;
    }
    pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Reprendre l’animation':'Mettre en pause';play();});
    function stop(){clearInterval(timer);timer=undefined;}
    function play(){
      stop();
      pause.hidden=reduced.matches;
      if(reduced.matches || document.hidden || !visible || paused){if(reduced.matches){nodes.forEach(n=>n.classList.add('is-complete'));workflow.style.setProperty('--workflow-progress',1);stepLabel.textContent='Un parcours. Un seul système.';}return;}
      draw();
      timer=setInterval(()=>{index=(index+1)%nodes.length;draw();},1400);
    }
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;workflow.classList.toggle('is-visible',visible);play();},{threshold:.2});
    observer.observe(workflow);
    document.addEventListener('visibilitychange',play);
    reduced.addEventListener('change',play);
    window.addEventListener('pagehide',stop);
  }
  // Finite entrance sequences and ambient curves only run while visible.
  const motionScenes=[...document.querySelectorAll('[data-hero-scene], [data-connection-scene], [data-product-theater]')];
  const visibleScenes=new Set();
  const syncScenes=()=>motionScenes.forEach(scene=>scene.classList.toggle('scene-active',visibleScenes.has(scene)&&!document.hidden&&!reduced.matches));
  const sceneObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting) visibleScenes.add(entry.target);else visibleScenes.delete(entry.target);});
    syncScenes();
  },{threshold:.08});
  motionScenes.forEach(scene=>sceneObserver.observe(scene));
  document.addEventListener('visibilitychange',syncScenes);
  reduced.addEventListener('change',syncScenes);

  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.hero-aside .button, .final-cta .button').forEach(button=>{
    let raf;
    const reset=()=>{cancelAnimationFrame(raf);button.style.removeProperty('--magnet-x');button.style.removeProperty('--magnet-y');};
    button.addEventListener('pointermove',event=>{
      if(reduced.matches||!finePointer.matches) return;
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const rect=button.getBoundingClientRect();
        button.style.setProperty('--magnet-x',`${Math.max(-4,Math.min(4,(event.clientX-rect.left-rect.width/2)*.045))}px`);
        button.style.setProperty('--magnet-y',`${Math.max(-3,Math.min(3,(event.clientY-rect.top-rect.height/2)*.08))}px`);
      });
    });
    button.addEventListener('pointerleave',reset);
    button.addEventListener('blur',reset);
    reduced.addEventListener('change',reset);
  });

  const theater=document.querySelector('[data-product-theater]');
  if(theater) {
    const tabs=[...theater.querySelectorAll('[data-product-tab]')];
    const panels=[...theater.querySelectorAll('[data-product-panel]')];
    const play=theater.querySelector('[data-product-play]');
    const expand=theater.querySelector('[data-product-expand]');
    const dialog=theater.querySelector('dialog');
    const originals=['dashboard','factures','planning','login'];
    let active=0, requested=0, visible=false, playing=desktop.matches&&!reduced.matches, timer;
    expand.hidden=false;
    function stop(){clearTimeout(timer);timer=undefined;}
    function schedule(){
      stop();
      play.hidden=reduced.matches;
      play.textContent=playing?'Mettre en pause':'Lire la visite';
      play.setAttribute('aria-pressed',String(playing));
      const running=playing&&visible&&!document.hidden&&!reduced.matches&&!dialog.open;
      theater.dataset.playback=running?'playing':'paused';
      if(running) timer=setTimeout(()=>select((active+1)%panels.length,false),8000);
    }
    async function select(index,manual=true){
      if(manual) playing=false;
      stop();requested=index;
      const panel=panels[index];
      const img=panel.querySelector('img');
      panel.querySelectorAll('[data-srcset]').forEach(source=>{source.srcset=source.dataset.srcset;delete source.dataset.srcset;});
      if(img.dataset.src){img.loading='eager';img.src=img.dataset.src;delete img.dataset.src;}
      // Keep the previous frame visible until the next actual screenshot is ready.
      try {await img.decode();} catch { /* The alt text and original remain available if an asset fails. */ }
      if(requested!==index) return;
      active=index;
      tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
      panels.forEach((p,i)=>{p.hidden=i!==index;});
      theater.dataset.active=String(index);
      schedule();
    }
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>select(i));
      tab.addEventListener('keydown',event=>{
        let next;
        if(event.key==='ArrowRight') next=(i+1)%tabs.length;
        else if(event.key==='ArrowLeft') next=(i+tabs.length-1)%tabs.length;
        else if(event.key==='Home') next=0;
        else if(event.key==='End') next=tabs.length-1;
        if(next!==undefined){event.preventDefault();tabs[next].focus();select(next);}
      });
    });
    play.addEventListener('click',()=>{playing=!playing;schedule();});
    expand.addEventListener('click',()=>{
      const img=document.createElement('img');
      img.src=`/assets/images/pridano/${originals[active]}.png`;
      img.alt=panels[active].querySelector('img').alt.replace('cadrée sur les indicateurs et les connexions entre clients, devis et projets.','capture complète.');
      dialog.querySelector('.dialog-image').replaceChildren(img);
      dialog.showModal();document.documentElement.classList.add('product-modal');schedule();
    });
    theater.querySelector('[data-product-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{document.documentElement.classList.remove('product-modal');schedule();expand.focus();});
    const productObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.35;schedule();},{threshold:.35});
    productObserver.observe(theater);
    document.addEventListener('visibilitychange',schedule);
    reduced.addEventListener('change',()=>{if(reduced.matches) playing=false;schedule();});
    desktop.addEventListener('change',()=>{if(!desktop.matches) playing=false;schedule();});
    window.addEventListener('pagehide',stop);
    theater.dataset.active='0';schedule();
  }

  const form=document.querySelector('[data-contact-form]');
  if(form) {
    const type=new URLSearchParams(location.search).get('projet');
    if([...form.projectType.options].some(o=>o.value===type)) form.projectType.value=type;
    const status=form.querySelector('.form-status');
    const submit=form.querySelector('[type=submit]');
    const submitLabel=submit.querySelector('span');
    let sending=false;
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if(sending || !form.reportValidity()) return;
      sending=true;submit.disabled=true;submitLabel.textContent='Envoi en cours…';
      status.classList.remove('error');status.textContent='Votre demande est en cours de transmission.';
      const fields=Object.fromEntries(new FormData(form));
      fields.consent=form.consent.checked;
      try {
        const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields),signal:AbortSignal.timeout(20000)});
        const result=await response.json();
        if(!response.ok || result.ok!==true) throw new Error(result.message || 'La demande n’a pas pu être envoyée.');
        status.textContent='Votre demande a bien été transmise à Pridano. Merci, nous reviendrons vers vous par email.';
        form.reset();
      } catch(error) {
        status.classList.add('error');
        status.textContent=error.name==='TimeoutError'?'La confirmation tarde à arriver. Votre demande a peut-être été transmise. Vous pouvez nous contacter à pridanotech@gmail.com.':`${error.message || 'Le service est momentanément indisponible.'} Vous pouvez écrire à pridanotech@gmail.com. Vos informations restent dans le formulaire.`;
      } finally {sending=false;submit.disabled=false;submitLabel.textContent='Parler de votre projet';status.focus();}
    });
  }
})();
