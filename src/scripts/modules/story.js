/* Séquences narratives liées au défilement. Chaque séquence reste lisible et pilotable sans elles. */
import { $, $$, reduceMotion, desktop, finePointer, clamp, lerp, smoothstep, onScroll, scrollToProgress, refresh } from '../core.js';

/* « La première impression » : le point descend, chaque étape s’allume à son passage. */
export function initFirst() {
  const visual = $('[data-first]');
  if (!visual) return;
  const steps = $$('.first-step', visual);
  const set = (q) => {
    visual.style.setProperty('--p', q.toFixed(3));
    steps.forEach((step, i) => step.classList.toggle('is-on', q >= i / (steps.length - 1) - 0.001));
  };
  if (reduceMotion.matches) return set(1);
  onScroll(visual, (p) => set(smoothstep(0.18, 0.62, p)));
}

/* Expertises : le nœud correspondant au bloc lu s’allume dans le symbole. */
export function initNodes() {
  const section = $('[data-nodes]');
  if (!section || !('IntersectionObserver' in window)) return;
  const figure = $('[data-nodes-figure]', section);
  const caption = $('[data-nodes-caption]', section);
  const items = $$('.node-item', section);
  const names = { top: '01 · Sites web', right: '02 · SaaS & logiciels', bottom: '03 · Le produit Pridano', dot: 'Le premier pas' };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const node = entry.target.dataset.node;
      figure.dataset.active = node;
      if (caption) caption.textContent = names[node];
      items.forEach((it) => it.classList.toggle('is-active', it === entry.target));
    }
  }, { rootMargin: '-42% 0px -42% 0px' });
  items.forEach((it) => io.observe(it));
}

/* « Du dispersé au connecté » : les problèmes épars se rassemblent pour former le symbole. */
export function initTransform() {
  for (const section of $$('[data-transform]')) setupTransform(section);
}

function setupTransform(section) {
  const svg = $('[data-tf-svg]', section);
  const blobs = $$('.tf-blob', svg);
  const before = $$('.tf-label--before', svg);
  const after = $$('.tf-label--after', svg);
  const mark = $('[data-tf-mark]', svg);
  const links = $('[data-tf-links]', svg);
  const stateEl = $('[data-tf-state]', section);
  const steps = $$('.tf-step', section);
  const buttons = $$('[data-step-btn]', section);
  const scatter = blobs.map((b) => [Number(b.getAttribute('cx')), Number(b.getAttribute('cy'))]);
  /* Positions finales : nœuds haut, droite, bas, point isolé, puis deux masses de liaison. */
  const goal = [[289, 183, 54], [420, 308, 56], [293, 419, 54], [178, 310, 57], [372, 302, 46], [352, 236, 34]];
  const ns = 'http://www.w3.org/2000/svg';
  const pairs = [[0, 1], [1, 2], [2, 4], [4, 0], [3, 4], [5, 1]];
  const lines = pairs.map(() => {
    const l = document.createElementNS(ns, 'line');
    l.setAttribute('pathLength', '1');
    links.append(l);
    return l;
  });

  const place = (g, x, y, dyOffset) => {
    const text = g.querySelector('text');
    const rect = g.querySelector('rect');
    if (!g._w) {
      const box = text.getBBox();
      g._w = box.width + 26;
    }
    text.setAttribute('x', x);
    text.setAttribute('y', y + dyOffset + 5);
    text.setAttribute('text-anchor', 'middle');
    rect.setAttribute('x', x - g._w / 2);
    rect.setAttribute('y', y + dyOffset - 14);
    rect.setAttribute('width', g._w);
    rect.setAttribute('height', 32);
  };

  const afterAnchors = [[289, 183, -82], [420, 308, 88], [293, 419, 88], [178, 310, 92]];
  let current = -1;
  const render = (p) => {
    const gather = smoothstep(0.32, 0.86, p);
    const t = performance.now() / 1000;
    blobs.forEach((b, i) => {
      const drift = (1 - gather) * 10;
      const x = lerp(scatter[i][0], goal[i][0], gather) + Math.sin(t * 0.8 + i) * drift;
      const y = lerp(scatter[i][1], goal[i][1], gather) + Math.cos(t * 0.7 + i * 1.7) * drift;
      b.setAttribute('cx', x.toFixed(1));
      b.setAttribute('cy', y.toFixed(1));
      b.setAttribute('r', lerp(34, goal[i][2], gather).toFixed(1));
      if (before[i]) place(before[i], x, y, 58);
    });
    const linkIn = smoothstep(0.12, 0.38, p) * (1 - smoothstep(0.62, 0.86, p));
    lines.forEach((l, i) => {
      const [a, b] = pairs[i];
      l.setAttribute('x1', blobs[a].getAttribute('cx'));
      l.setAttribute('y1', blobs[a].getAttribute('cy'));
      l.setAttribute('x2', blobs[b].getAttribute('cx'));
      l.setAttribute('y2', blobs[b].getAttribute('cy'));
      l.style.strokeDashoffset = String(1 - clamp(linkIn * 1.6 - i * 0.08));
      l.style.opacity = String(linkIn);
    });
    before.forEach((g) => (g.style.opacity = String(1 - smoothstep(0.18, 0.42, p))));
    after.forEach((g, i) => {
      const [x, y, off] = afterAnchors[i];
      place(g, x, y, off);
      g.style.opacity = String(smoothstep(0.78 + i * 0.03, 0.95, p));
    });
    mark.style.opacity = String(smoothstep(0.86, 0.98, p));
    $('.tf-goo', svg).style.opacity = String(1 - smoothstep(0.88, 0.99, p));
    const step = p < 0.3 ? 0 : p < 0.72 ? 1 : 2;
    if (step !== current) {
      current = step;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === step));
      buttons.forEach((btn, i) => btn.setAttribute('aria-pressed', String(i === step)));
      if (stateEl) stateEl.textContent = buttons[step]?.querySelector('.tf-step-title')?.textContent || '';
    }
  };

  const targets = [0.06, 0.52, 1];
  const pinned = () => desktop.matches && !reduceMotion.matches;
  let manual = null;

  const tween = (to) => {
    const from = manual ?? 0;
    const start = performance.now();
    const dur = reduceMotion.matches ? 1 : 1400;
    const step = (now) => {
      const k = clamp((now - start) / dur);
      manual = lerp(from, to, 1 - Math.pow(1 - k, 3));
      render(manual);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  buttons.forEach((btn, i) => btn.addEventListener('click', () => {
    if (pinned()) scrollToProgress(section, targets[i] * 0.98);
    else tween(targets[i]);
  }));

  const setMode = () => {
    section.classList.toggle('is-pinned', pinned());
    refresh();
  };
  desktop.addEventListener('change', setMode);
  setMode();

  if (reduceMotion.matches) {
    render(1);
    manual = 1;
    return;
  }
  onScroll(section, (p) => {
    if (pinned()) render(p);
  }, { mode: 'pin' });

  /* Hors épinglage (mobile) : une seule séquence automatique à l’arrivée, puis contrôle manuel. */
  const once = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || pinned()) return;
    once.disconnect();
    manual = 0;
    render(0);
    setTimeout(() => tween(0.52), 900);
    setTimeout(() => tween(1), 3200);
  }, { threshold: 0.5 });
  once.observe($('.transform-figure', section));
  render(0);
}

/* Méthode : le point voyage d’étape en étape (horizontal et épinglé sur desktop). */
export function initMethod() {
  for (const section of $$('[data-method]')) {
    const track = $('[data-method-track]', section);
    const stepsEl = $$('[data-method-step]', section);
    const counter = $('[data-method-current]', section);
    const viewport = $('.method-viewport', section);
    let overflow = 0;
    let active = -1;
    const horizontal = () => desktop.matches && !reduceMotion.matches;

    const layout = () => {
      section.classList.toggle('is-horizontal', horizontal());
      if (horizontal()) {
        overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
        section.style.setProperty('--scroll-span', `${overflow}px`);
      } else {
        overflow = 0;
        section.style.removeProperty('--scroll-span');
        track.style.transform = '';
      }
      refresh();
    };

    const setActive = (i) => {
      if (i === active) return;
      active = i;
      stepsEl.forEach((s, j) => {
        s.classList.toggle('is-active', j === i);
        s.classList.toggle('is-past', j < i);
      });
      if (counter) counter.textContent = String(i + 1).padStart(2, '0');
    };

    onScroll(section, (p) => {
      if (horizontal()) {
        const q = smoothstep(0.04, 0.94, p);
        const shift = q * overflow;
        track.style.transform = `translate3d(${-shift}px, 0, 0)`;
        section.style.setProperty('--progress', q.toFixed(4));
        /* Étape active : la dernière dont le nœud a été atteint par le point voyageur. */
        const rail = track.querySelector('.method-rail');
        const travellerX = rail.offsetLeft + q * rail.offsetWidth;
        let index = 0;
        stepsEl.forEach((step, i) => {
          if (step.offsetLeft + 28 <= travellerX + 2) index = i;
        });
        setActive(index);
      } else {
        const q = smoothstep(0.12, 0.78, p);
        section.style.setProperty('--progress', q.toFixed(4));
        setActive(Math.min(stepsEl.length - 1, Math.floor(q * stepsEl.length * 0.999)));
      }
    }, { mode: 'pin' });

    desktop.addEventListener('change', layout);
    window.addEventListener('resize', layout, { passive: true });
    document.fonts?.ready.then(layout);
    layout();
    setActive(0);
  }
}

/* Réalisations : aperçu qui suit le pointeur sur desktop. */
export function initWork() {
  const section = $('[data-work]');
  const preview = section && $('[data-work-preview]', section);
  if (!section || !preview || !finePointer.matches || reduceMotion.matches) return;
  section.classList.add('has-preview');
  const pics = $$('[data-preview]', preview);
  let x = 0, y = 0, cx = 0, cy = 0, raf = 0, shown = false;
  const loop = () => {
    cx += (x - cx) * 0.16;
    cy += (y - cy) * 0.16;
    const tilt = clamp((x - cx) * 0.04, -8, 8);
    preview.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${tilt}deg)`;
    raf = shown || Math.abs(x - cx) > 0.5 ? requestAnimationFrame(loop) : 0;
  };
  for (const row of $$('[data-work-row]', section)) {
    row.addEventListener('pointerenter', (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        cx = x;
        cy = y;
      }
      shown = true;
      pics.forEach((p) => p.classList.toggle('is-active', p.dataset.preview === row.dataset.workRow));
      preview.classList.add('is-visible');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    row.addEventListener('pointerleave', () => {
      shown = false;
      preview.classList.remove('is-visible');
    });
  }
  section.addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
  }, { passive: true });
}

/* Inclinaison progressive d’un visuel au défilement (capture produit). */
export function initTilt() {
  for (const el of $$('[data-tilt]')) {
    if (reduceMotion.matches) {
      el.style.setProperty('--tilt', '0');
      continue;
    }
    onScroll(el, (p) => el.style.setProperty('--tilt', (1 - smoothstep(0.05, 0.48, p)).toFixed(3)));
  }
}

/* Parcours Business OS : la ligne se remplit au fil de la lecture. */
export function initFlow() {
  const section = $('[data-flow]');
  if (!section) return;
  const track = $('[data-flow-track]', section);
  const nodes = $$('[data-flow-node]', section);
  if (reduceMotion.matches) {
    track.style.setProperty('--flow', '1');
    nodes.forEach((n) => n.classList.add('is-on'));
    return;
  }
  onScroll(track, (p) => {
    const q = smoothstep(0.2, 0.7, p);
    track.style.setProperty('--flow', q.toFixed(3));
    nodes.forEach((n, i) => n.classList.toggle('is-on', q >= i / (nodes.length - 1) - 0.001));
  });
}

/* Hub d’intégrations : les données circulent entre le logiciel et ses satellites. */
export function initHub() {
  const hub = $('[data-hub]');
  if (!hub) return;
  const travellers = $$('[data-hub-traveller]', hub);
  const place = (p) => travellers.forEach((c) => {
    const t = (p * 2.4 + Number(c.dataset.offset)) % 1;
    const x = lerp(300, Number(c.dataset.x), t);
    const y = lerp(300, Number(c.dataset.y), t);
    c.setAttribute('cx', x.toFixed(1));
    c.setAttribute('cy', y.toFixed(1));
  });
  if (reduceMotion.matches) return place(0.2);
  onScroll(hub, place);
}

/* Démonstration « couche par couche » (page Sites web). */
export function initBuild() {
  const section = $('[data-build]');
  if (!section) return;
  const device = $('[data-build-device]', section);
  const steps = $$('[data-build-step]', section);
  const buttons = $$('[data-build-btn]', section);
  const n = steps.length;
  const pinned = () => desktop.matches && !reduceMotion.matches;
  let current = -1;
  const set = (i) => {
    if (i === current) return;
    current = i;
    device.dataset.stage = String(i);
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => {
    if (pinned()) scrollToProgress(section, (i + 0.5) / n);
    else set(i);
  }));
  const mode = () => {
    section.classList.toggle('is-pinned', pinned());
    refresh();
  };
  desktop.addEventListener('change', mode);
  mode();
  onScroll(section, (p) => {
    if (pinned()) set(Math.min(n - 1, Math.floor(p * n * 0.999)));
  }, { mode: 'pin' });
  set(0);
}

/* Appel final : le point rejoint le symbole quand on vise l’action principale. */
export function initFinal() {
  for (const section of $$('[data-final]')) {
    const target = $('[data-final-target]', section);
    if (!target) continue;
    const on = () => section.classList.add('is-connecting');
    const off = () => section.classList.remove('is-connecting');
    target.addEventListener('pointerenter', on);
    target.addEventListener('pointerleave', off);
    target.addEventListener('focus', on);
    target.addEventListener('blur', off);
    if (!reduceMotion.matches) onScroll(section, (p) => section.style.setProperty('--final', smoothstep(0.1, 0.6, p).toFixed(3)));
  }
}

/* Visuels d’en-tête : les couches suivent légèrement le pointeur, chacune selon sa profondeur. */
export function initHeroMedia() {
  const media = $('[data-hm]');
  if (!media || reduceMotion.matches) return;
  const zone = media.closest('section') || media;
  /* Au défilement, les couches se séparent selon leur profondeur (mouvement de caméra vertical). */
  onScroll(zone, (p) => media.style.setProperty('--sp', p.toFixed(3)), { start: 0 });
  if (!finePointer.matches) return;
  let frame = 0;
  let x = 0;
  let y = 0;
  const apply = () => {
    frame = 0;
    media.style.setProperty('--mx', x.toFixed(3));
    media.style.setProperty('--my', y.toFixed(3));
  };
  zone.addEventListener('pointermove', (e) => {
    const r = zone.getBoundingClientRect();
    x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    if (!frame) frame = requestAnimationFrame(apply);
  });
  zone.addEventListener('pointerleave', () => {
    x = 0;
    y = 0;
    if (!frame) frame = requestAnimationFrame(apply);
  });
}

/* Réalisations : le navigateur et le téléphone glissent à des vitesses différentes (profondeur). */
export function initDepth() {
  if (reduceMotion.matches) return;
  for (const el of $$('.case-devices')) onScroll(el, (p) => el.style.setProperty('--dp', p.toFixed(3)));
}
