/*
 * Mise en scène de « Le premier point » (gabarit : site/components/film.js).
 *
 * Une seule horloge pilote tout : caméra et lumière du symbole 3D, point qui rejoint le réseau,
 * typographie, lignes, écrans des projets, ouverture finale. Le symbole est le canevas du hero,
 * prêté au film : à la dernière image, il est rendu au hero à sa place et dans sa pose exactes.
 * Sans GPU (ou si la scène n’est pas prête à temps), le même découpage est joué avec le symbole
 * vectoriel, qui se fond ensuite dans le visuel statique du hero.
 */
import { $, $$, clamp, smoothstep, finePointer } from '../core.js';
import { loadLogo } from '../gl/logo-loader.js';

/* Découpage en secondes. reveal : recul de caméra ; merge : départ, fusion, maintien, retour du point. */
const PLANS = {
  full: { length: 7.6, glBy: 1.5, macro: [0.9, 1.9], reveal: [1.9, 3.5], merge: [2.7, 3.35, 3.55, 4.3], word: [3.3, 4.0], tag: [3.7, 4.2], titleOut: [4.4, 4.85], transform: [4.4, 6.2], arrive: [6.2, 7.5], acts: [0, 1.9, 4.4, 6.2] },
  short: { length: 2.75, glBy: 0.7, macro: null, reveal: [0.35, 1.3], merge: [0.75, 1.05, 1.15, 1.6], word: [0.9, 1.3], tag: [1.05, 1.4], titleOut: [1.65, 1.95], transform: null, arrive: [1.7, 2.65], acts: [0, 0.35, null, 1.7] },
};
const DOCK = [-0.12, -0.03];
const REST_POSE = { yaw: -0.24, pitch: 0.1, roll: 0 };
const ROMAN = ['I', 'II', 'III', 'IV'];

const mix = (a, b, x) => a + (b - a) * x;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const out = (x) => 1 - Math.pow(1 - x, 3);
const back = (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);

/* Cadrage du film : mêmes règles que le CSS (--film-l, --cy). */
function layout() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const mobile = W <= 760;
  const L = mobile ? Math.min(0.78 * W, 0.44 * H) : Math.min(0.5 * H, 0.68 * W);
  return { W, H, mobile, L, cx: W / 2, cy: (mobile ? 0.38 : 0.46) * H };
}

/* Projection identique au shader : rotation objet → monde, caméra en z = 7, rayon 0.33. */
function objectUV([x, y, z], c) {
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch), cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  const px = (cr * cy - sr * sp * sy) * x - sr * cp * y + (cr * sy + sr * sp * cy) * z;
  const py = (sr * cy + cr * sp * sy) * x + cr * cp * y + (sr * sy - cr * sp * cy) * z;
  const pz = -cp * sy * x + sp * y + cp * cy * z;
  const s = 0.33 * (7 - pz);
  return [px / s, py / s];
}
const toScreen = (q, c, lay) => {
  const [u, v] = objectUV(q, c);
  return [lay.W / 2 + (u * c.zoom + c.shift[0]) * lay.H, lay.H / 2 - (v * c.zoom + c.shift[1]) * lay.H];
};
/* Ajuste le décalage pour qu’un point de l’objet tombe à l’endroit voulu de l’écran. */
function aim(c, q, [tx, ty], lay) {
  const [u, v] = objectUV(q, c);
  c.shift = [(tx - lay.W / 2) / lay.H - u * c.zoom, (lay.H / 2 - ty) / lay.H - v * c.zoom];
  return c;
}
const lerpCam = (a, b, x) => ({
  yaw: mix(a.yaw, b.yaw, x),
  pitch: mix(a.pitch, b.pitch, x),
  roll: mix(a.roll, b.roll, x),
  zoom: Math.exp(mix(Math.log(a.zoom), Math.log(b.zoom), x)),
  shift: [mix(a.shift[0], b.shift[0], x), mix(a.shift[1], b.shift[1], x)],
});
const centerCam = (lay, pose, scale = 1) => ({ ...pose, zoom: (lay.L / lay.H) * scale, shift: [0, (lay.H / 2 - lay.cy) / lay.H] });

/* Cadrage final : celui du canevas du hero (carré), exprimé dans le repère plein écran du film. */
function heroCam(stage, lay) {
  const r = stage.getBoundingClientRect();
  return { ...REST_POSE, zoom: r.height / lay.H, shift: [(r.left + r.width / 2 - lay.W / 2) / lay.H, (lay.H / 2 - (r.top + r.height / 2)) / lay.H], rect: r };
}

/* Image « couverture » calée en haut, comme une capture de site. */
function paint(canvas) {
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    const ctx = canvas.getContext('2d');
    const k = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    ctx.drawImage(img, (canvas.width - img.naturalWidth * k) / 2, 0, img.naturalWidth * k, img.naturalHeight * k);
  };
  img.src = canvas.dataset.src;
}

export function runFilm(film, mode) {
  const root = document.documentElement;
  const plan = PLANS[mode];
  const stage = $('[data-hero-stage]');
  const canvas = $('[data-hero-canvas]');
  const glSlot = $('[data-film-gl]', film);
  const mark = $('[data-film-mark]', film);
  const gooGroup = $('[data-film-goo]', mark);
  const svgDot = $('[data-film-dot]', mark);
  const sweepGrad = $('[data-film-sweep]', mark);
  const spark = $('[data-film-spark]', film);
  const flash = $('[data-film-flash]', film);
  const bg = $('[data-film-bg]', film);
  const grid = $('[data-film-grid]', film);
  const actLabel = $('[data-film-act]', film);
  const progress = $('[data-film-progress]', film);
  const panels = $$('[data-panel]', film).map((el) => ({ el, id: el.dataset.panel, canvas: $('canvas', el) }));
  const lines = Object.fromEntries($$('[data-line]', film).map((el) => [el.dataset.line, el]));
  const pulses = Object.fromEntries($$('[data-pulse]', film).map((el) => [el.dataset.pulse, el]));
  const geo = JSON.parse(canvas.dataset.geo);
  const rest = [geo.dot[0], geo.dot[1]];
  const radius = geo.dot[2];

  /* Le film a pris la main : le filet de sécurité CSS n’est plus nécessaire. */
  film.style.animation = 'none';
  if (plan.transform) panels.forEach((p) => paint(p.canvas));

  /* Horloge calée sur le premier rendu (les animations CSS de l’acte I ont démarré avec la page). */
  const started = spark.getAnimations?.().map((a) => a.startTime).filter((v) => typeof v === 'number');
  const t0 = started?.length ? Math.min(...started) : performance.now();
  const clock = () => ((document.timeline?.currentTime ?? performance.now()) - t0) / 1000;

  let path = 'pending';
  let gl = null;
  let glFrom = 0;
  let svgFrom = 0;
  let exit = null;
  let done = false;
  let scale = 1;
  let avg = 16;
  let lastNow = performance.now();
  let lastLay = null;

  const capable = !navigator.connection?.saveData && !(navigator.deviceMemory && navigator.deviceMemory < 2);
  const useSvg = (t) => {
    if (path !== 'pending') return;
    path = 'svg';
    svgFrom = Math.max(t, plan.macro ? plan.macro[0] : plan.reveal[0]);
    film.classList.add('is-svg');
    /* Le visuel statique du hero attend que le symbole vectoriel se pose, puis prend le relais en fondu. */
    stage.classList.add('is-holding');
  };
  if (capable) {
    loadLogo(canvas).then((loaded) => {
      const t = clock();
      if (!loaded || path !== 'pending' || t > plan.glBy || done) {
        if (path === 'pending') useSvg(t);
        return;
      }
      gl = loaded;
      path = 'gl';
      glFrom = Math.max(t, plan.macro ? plan.macro[0] : plan.reveal[0]);
      glSlot.append(canvas);
      stage.classList.add('is-live');
    });
  }

  /* ---------- Caméra et lumière à l’instant t ---------- */
  function camera(t, lay, hero) {
    if (exit) return lerpCam(exit.cam, hero, inOut(seg(t, exit.t, exit.t + exit.d)));
    const [r0, r1] = plan.reveal;
    let start;
    if (plan.macro) {
      /* Gros plan : un biseau du nœud supérieur, balayé par la lumière. */
      const k = seg(t, plan.macro[0], r0);
      start = aim({ yaw: mix(1.0, 0.78, k), pitch: mix(0.44, 0.34, k), roll: mix(-0.14, -0.08, k), zoom: (lay.L / lay.H) * mix(2.6, 2.15, k), shift: [0, 0] }, [0.16, 0.84, 0.17], [lay.W * 0.56, lay.H * 0.48], lay);
    } else {
      start = centerCam(lay, { yaw: 0.62, pitch: 0.3, roll: -0.06 }, 1.9);
    }
    const e = inOut(seg(t, r0, r1));
    let cam = lerpCam(start, centerCam(lay, { yaw: -0.38, pitch: 0.1, roll: 0 }), e);
    cam.yaw = mix(cam.yaw, -0.24, out(seg(t, r1, r1 + 0.9)));
    if (plan.transform) {
      const k = inOut(seg(t, plan.transform[0] + 0.1, plan.transform[1]));
      cam = { ...cam, yaw: mix(cam.yaw, -0.06, k), pitch: mix(cam.pitch, 0.17, k), zoom: cam.zoom * mix(1, 0.84, k) };
    }
    const [a0, a1] = plan.arrive;
    if (t > a0) cam = lerpCam(cam, hero, inOut(seg(t, a0, a1 - 0.05)));
    return cam;
  }

  function dotAt(t) {
    if (exit) {
      const e = out(seg(t, exit.t, exit.t + exit.d));
      return [mix(exit.dot[0], rest[0], e), mix(exit.dot[1], rest[1], e)];
    }
    const [m0, m1, m2, m3] = plan.merge;
    if (t < m0 || t >= m3) return rest;
    if (t < m1) {
      const e = inOut(seg(t, m0, m1));
      return [mix(rest[0], DOCK[0], e), mix(rest[1], DOCK[1], e)];
    }
    if (t < m2) return DOCK;
    const e = back(seg(t, m2, m3));
    return [mix(DOCK[0], rest[0], e), mix(DOCK[1], rest[1], e)];
  }

  function light(t) {
    const [a0, a1] = exit ? [exit.t, exit.t + exit.d] : plan.arrive;
    const tr = plan.transform;
    let mood = tr ? mix(0, 0.22, seg(t, tr[0] + 0.2, tr[1])) : 0;
    mood = mix(exit ? exit.mood : mood, 1, inOut(seg(t, a0 + 0.12, a1 - 0.08)));
    let sweep = 2.6;
    if (exit) sweep = 2.6;
    else if (plan.macro && t < 2.2) sweep = mix(-1.3, 1.5, seg(t, plan.macro[0], 2.2));
    else if (t < plan.reveal[1] + 0.4) sweep = mix(-1.5, 1.6, seg(t, plan.reveal[0] + 0.3, plan.reveal[1] + 0.4));
    else if (tr && t < tr[1]) sweep = mix(-1.5, 1.6, seg(t, tr[0] + 0.4, tr[1] - 0.2));
    const glow = 0.9 * seg(t, plan.reveal[0] + 0.3, plan.reveal[1] - 0.4) * (tr ? 1 - 0.4 * seg(t, tr[0], tr[0] + 1) : 1) * (1 - seg(t, a0, a0 + 0.8));
    return { mood, sweep, glow };
  }

  /* ---------- Une image ---------- */
  function frame() {
    if (done) return;
    try {
      render();
    } catch (error) {
      console.error('[pridano] film', error);
      finish();
    }
  }

  function render() {
    const now = performance.now();
    /* Qualité adaptative sur les images normales ; une pause ponctuelle (onglet, capture) ne compte pas. */
    if (now - lastNow < 80) avg = avg * 0.92 + (now - lastNow) * 0.08;
    lastNow = now;
    const t = clock();
    const lay = layout();
    if (!lastLay || lastLay.W !== lay.W || lastLay.H !== lay.H) {
      sizeMark(lay);
      lines.top?.ownerSVGElement?.setAttribute('viewBox', `0 0 ${lay.W} ${lay.H}`);
      lastLay = lay;
    }
    if (path === 'pending' && t >= plan.glBy) useSvg(t);

    /* Lectures de mise en page d’abord, écritures ensuite : aucun recalcul forcé. */
    const hero = heroCam(stage, lay);
    const cam = camera(t, lay, hero);
    const dot = dotAt(t);
    const merge = smoothstep(0.64, 0.1, Math.hypot(dot[0] - DOCK[0], dot[1] - DOCK[1]));
    const { mood, sweep, glow } = light(t);
    const [a0, a1] = exit ? [exit.t, exit.t + exit.d] : plan.arrive;
    const ui = exit ? 1 - seg(t, exit.t, exit.t + 0.3) : 1 - seg(t, a0, a0 + 0.45);
    const set = (k, v) => film.style.setProperty(k, typeof v === 'number' ? v.toFixed(4) : v);
    set('--ui', ui);

    /* Lumière d’ambiance, point initial, flash de fusion. */
    set('--beam', 0.75 * seg(t, 0.4, 1.6) * (1 - 0.35 * seg(t, plan.reveal[1], plan.reveal[1] + 0.8)) * (1 - seg(t, a0, a0 + 0.7)));
    if (t > mix(plan.reveal[0], plan.reveal[1], 0.55) || exit) spark.classList.add('is-off');
    const flashAt = exit ? 0 : Math.exp(-Math.pow((t - plan.merge[1] - 0.08) / 0.13, 2));
    set('--flash', flashAt * 0.9);
    const dockPx = toScreen([DOCK[0], DOCK[1], 0.17], cam, lay);
    flash.style.transform = `translate3d(${dockPx[0]}px, ${dockPx[1]}px, 0)`;

    /* Le symbole : 3D ou vectoriel. */
    const visibleFrom = path === 'gl' ? glFrom : svgFrom;
    const appear = seg(t, visibleFrom, visibleFrom + (path === 'gl' ? 0.6 : 0.4));
    if (path === 'gl') {
      set('--glo', appear);
      drawGl(t, lay, cam, dot, merge, { mood, sweep, glow }, hero.rect);
    } else if (path === 'svg') {
      drawSvg(t, lay, cam, dot, merge, { mood, sweep }, appear * (1 - seg(t, a1 - 0.35, a1)));
      if (t > a1 - 0.45) stage.classList.remove('is-holding');
    }

    /* Typographie. */
    set('--wp', out(seg(t, ...plan.word)));
    set('--tp', out(seg(t, ...plan.tag)));
    set('--to', 1 - seg(t, ...plan.titleOut));

    /* Acte III : grille, lignes, écrans. */
    if (plan.transform) drawTransform(t, lay, cam);

    /* Ouverture : la lumière se répand depuis le symbole, qui rejoint sa place dans le hero. */
    const [hx, hy] = toScreen([0, 0, 0], cam, lay);
    bg.style.setProperty('--hx', `${hx.toFixed(1)}px`);
    bg.style.setProperty('--hy', `${hy.toFixed(1)}px`);
    bg.style.setProperty('--hole', `${(Math.hypot(lay.W, lay.H) * 1.05 * inOut(seg(t, a0 + 0.2, a1))).toFixed(1)}px`);
    if (t > a0 + 0.2) root.classList.add('intro-out');

    /* Habillage. */
    const act = plan.acts.reduce((n, at, i) => (at !== null && t >= at ? i : n), 0);
    actLabel.textContent = ROMAN[act];
    progress.style.setProperty('--fp', Math.min(1, t / plan.length).toFixed(3));

    if (t >= a1 + 0.05) {
      finish();
      return;
    }
    requestAnimationFrame(frame);
  }

  function drawGl(t, lay, cam, dot, merge, { mood, sweep, glow }, r) {
    if (avg > 24 && scale > 0.55) scale *= 0.9;
    const budget = lay.mobile ? 700000 : 1600000;
    const s = Math.min(Math.min(window.devicePixelRatio || 1, 1.5) * scale, Math.sqrt(budget / (lay.W * lay.H)));
    gl.scene.render({
      width: Math.round(lay.W * s),
      height: Math.round(lay.H * s),
      time: t,
      dot: [dot[0], dot[1], radius],
      merge,
      yaw: cam.yaw,
      pitch: cam.pitch,
      roll: cam.roll,
      zoom: cam.zoom,
      shift: cam.shift,
      mood,
      sweep,
      glow,
      frame: [r.left * s, (lay.H - r.bottom) * s, r.width * s, r.height * s],
    });
  }

  /* Symbole vectoriel : même cadrage (échelle, position, légère rotation en perspective). */
  let ppu0 = 1;
  function sizeMark(lay) {
    ppu0 = lay.L / 2.31;
    Object.assign(mark.style, { width: `${3.2 * ppu0}px`, height: `${2.4 * ppu0}px`, left: `${-1.6 * ppu0}px`, top: `${-1.2 * ppu0}px` });
  }
  function drawSvg(t, lay, cam, dot, merge, { mood, sweep }, opacity) {
    const ppu = (cam.zoom * lay.H) / 2.31;
    const ox = lay.W / 2 + cam.shift[0] * lay.H;
    const oy = lay.H / 2 - cam.shift[1] * lay.H;
    mark.style.opacity = opacity.toFixed(3);
    mark.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0) perspective(1400px) rotateY(${(cam.yaw * 38).toFixed(2)}deg) rotateX(${(-cam.pitch * 24).toFixed(2)}deg) rotate(${(-cam.roll * 57).toFixed(2)}deg) scale(${(ppu / ppu0).toFixed(4)})`;
    mark.style.filter = mood < 0.99 ? `brightness(${mix(0.42, 1, mood).toFixed(3)})` : '';
    svgDot.setAttribute('cx', dot[0].toFixed(4));
    svgDot.setAttribute('cy', (-dot[1]).toFixed(4));
    gooGroup.setAttribute('filter', merge > 0.04 && merge < 0.985 ? 'url(#film-goo)' : '');
    sweepGrad.setAttribute('gradientTransform', `translate(${(sweep * 1.25).toFixed(3)} 0)`);
  }

  function drawTransform(t, lay, cam) {
    const [t0] = plan.transform;
    const a0 = exit ? exit.t : plan.arrive[0];
    grid.style.setProperty('--grid', (seg(t, t0 + 0.3, t0 + 1) * (1 - seg(t, a0, a0 + 0.5))).toFixed(3));
    grid.style.setProperty('--gy', `${((t - t0) * 70).toFixed(1)}px`);
    const pw = lay.mobile ? 0.42 * lay.W : clamp(0.2 * lay.W, 220, 340);
    const ph = pw * 0.625;
    const L = lay.L;
    const targets = lay.mobile
      ? { top: [0.27 * lay.W, lay.cy + 0.8 * L, 12], right: [0.73 * lay.W, lay.cy + 0.8 * L, -12], bottom: [0.5 * lay.W, lay.cy + 1.38 * L, 0] }
      : { top: [lay.cx - 0.98 * L, lay.cy - 0.34 * L, 20], right: [lay.cx + 1.02 * L, lay.cy - 0.06 * L, -22], bottom: [lay.cx - 0.8 * L, lay.cy + 0.48 * L, 16] };
    panels.forEach((p, i) => {
      const node = geo.nodes[p.id];
      const [nx, ny] = toScreen([node[0], node[1], 0.17], cam, lay);
      const [tx, ty, ry] = targets[p.id];
      const e0 = t0 + 0.25 + i * 0.2;
      const pin = out(seg(t, e0, e0 + 1));
      const q = seg(t, (exit ? exit.t : a0 - 0.2) + i * 0.07, (exit ? exit.t + 0.4 : a0 + 0.55) + i * 0.07);
      let x = mix(nx, tx, pin) + Math.sin(t * 0.6 + i * 2) * 6 * pin;
      let y = mix(ny, ty, pin) + Math.cos(t * 0.5 + i) * 4 * pin;
      x += (x - lay.cx) * 0.7 * q * q;
      y += (y - lay.cy) * 0.5 * q * q;
      const z = mix(-700, 0, pin) + 1100 * q * q;
      const opacity = seg(t, e0, e0 + 0.35) * (1 - seg(q, 0.45, 1));
      p.el.style.setProperty('--pw', `${pw.toFixed(1)}px`);
      p.el.style.opacity = opacity.toFixed(3);
      p.el.style.transform = `translate3d(${(x - pw / 2).toFixed(1)}px, ${(y - ph / 2).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(ry * mix(1.8, 1, pin)).toFixed(2)}deg) scale(${mix(0.12, 1, pin).toFixed(3)})`;
      /* La ligne part du bord du nœud, pas de son centre. */
      const len = Math.hypot(x - nx, y - ny) || 1;
      const edge = Math.min(len, 0.3 * (cam.zoom * lay.H) / 2.31);
      const sx = nx + ((x - nx) / len) * edge;
      const sy = ny + ((y - ny) / len) * edge;
      const line = lines[p.id];
      line.setAttribute('d', `M${sx.toFixed(1)} ${sy.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}`);
      line.style.strokeDashoffset = (1 - pin).toFixed(3);
      line.style.opacity = (1 - seg(t, a0 - 0.3, a0 + 0.1)).toFixed(3);
      const f = (t * 0.9 + i * 0.33) % 1;
      const pulse = pulses[p.id];
      pulse.setAttribute('cx', mix(sx, x, f).toFixed(1));
      pulse.setAttribute('cy', mix(sy, y, f).toFixed(1));
      pulse.style.opacity = (pin * (1 - q) * 0.9 * (1 - seg(t, a0 - 0.3, a0))).toFixed(3);
    });
  }

  /* ---------- Passer : on rejoint l’arrivée depuis l’état courant, sans coupure ---------- */
  function skip() {
    const t = clock();
    if (done || exit || t > plan.arrive[0]) return;
    const lay = layout();
    exit = { t, d: 0.9, cam: camera(t, lay, heroCam(stage, lay)), dot: dotAt(t), mood: light(t).mood };
    spark.classList.add('is-off');
  }

  /* ---------- Fin : le canevas retourne au hero, la scène interactive reprend la main ---------- */
  function finish() {
    if (done) return;
    done = true;
    let loaded = null;
    if (path === 'gl') {
      const r = stage.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, 1.75) * (finePointer.matches ? 0.9 : 0.72);
      gl.scene.render({ width: Math.round(r.width * d), height: Math.round(r.height * d), time: clock(), dot: [rest[0], rest[1], radius], merge: 0, ...REST_POSE, zoom: 1, shift: [0, 0] });
      stage.append(canvas);
      loaded = gl;
    }
    cleanup();
    stage.classList.remove('is-holding');
    film.remove();
    root.classList.remove('has-intro', 'intro-out', 'intro-lock');
    delete root.dataset.intro;
    window.dispatchEvent(new CustomEvent('pt:intro-end', { detail: { loaded } }));
  }

  const onKey = (e) => {
    if (['Escape', 'Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) skip();
  };
  const onClick = () => skip();
  const onScrollIntent = () => skip();
  function cleanup() {
    removeEventListener('keydown', onKey);
    removeEventListener('wheel', onScrollIntent);
    removeEventListener('touchmove', onScrollIntent);
    film.removeEventListener('click', onClick);
  }
  addEventListener('keydown', onKey);
  addEventListener('wheel', onScrollIntent, { passive: true });
  addEventListener('touchmove', onScrollIntent, { passive: true });
  film.addEventListener('click', onClick);

  if (clock() > plan.length) finish();
  else requestAnimationFrame(frame);
}
