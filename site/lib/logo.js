/*
 * Géométrie de marque issue de la vectorisation des logos officiels (scripts/brand/trace-logo.js).
 * Toutes les déclinaisons SVG du site (en-tête, pied de page, cartes de nœuds, favicons,
 * champ de distance WebGL) partagent ces tracés : une seule source, aucun redessin.
 */
const geometry = require('../data/logo-geometry.json');

const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));

const icon = geometry.icon;
const word = geometry.wordmark;

/* Repère du symbole : boîte englobante du point + de la forme à trois nœuds. */
const ICON_BOX = { x: icon.box.minX, y: icon.box.minY, w: icon.box.maxX - icon.box.minX + 1, h: icon.box.maxY - icon.box.minY + 1 };
const WORD_BOX = { x: word.box.minX, y: word.box.minY, w: word.box.maxX - word.box.minX + 1, h: word.box.maxY - word.box.minY + 1 };

const shapePath = round(icon.shapePath);
const wordPath = round(word.path);
const dot = { cx: Math.round(icon.dot.cx * 10) / 10, cy: Math.round(icon.dot.cy * 10) / 10, r: Math.round(icon.dot.r * 10) / 10 };
const square = word.square;

/* Centres des trois nœuds (maxima du champ de distance, mesurés sur la source). */
const nodes = {
  top: { cx: 742, cy: 198, r: 150 },
  right: { cx: 1107, cy: 546, r: 158 },
  bottom: { cx: 754, cy: 854, r: 150 },
  dot: { cx: dot.cx, cy: dot.cy, r: dot.r },
};

const viewBox = (b) => `${b.x} ${b.y} ${b.w} ${b.h}`;

/* Gradient officiel : cyan en haut à droite, azur profond en bas à gauche. */
const gradientDefs = (id = 'pt-grad') => `<linearGradient id="${id}" x1="${ICON_BOX.x}" y1="${ICON_BOX.y + ICON_BOX.h}" x2="${ICON_BOX.x + ICON_BOX.w}" y2="${ICON_BOX.y}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0a78ee"/><stop offset=".5" stop-color="#08a2ff"/><stop offset="1" stop-color="#1fdcff"/></linearGradient>`;

/* Sprite inséré une fois par page : les autres SVG le référencent avec <use>. */
function sprite() {
  return `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs>${gradientDefs()}<g id="pt-mark"><circle cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}"/><path d="${shapePath}"/></g><g id="pt-shape"><path d="${shapePath}"/></g><g id="pt-letters"><path d="${wordPath}" fill-rule="evenodd"/></g></defs></svg>`;
}

function mark({ cls = 'mark', label = '', fill = 'url(#pt-grad)' } = {}) {
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="${cls}" viewBox="${viewBox(ICON_BOX)}" ${a11y}><use href="#pt-mark" fill="${fill}"/></svg>`;
}

function wordmark({ cls = 'wordmark', label = '' } = {}) {
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="${cls}" viewBox="${viewBox(WORD_BOX)}" ${a11y}><use href="#pt-letters" fill="currentColor"/><rect class="wordmark-square" x="${square.x}" y="${square.y}" width="${square.w}" height="${square.h}" fill="#1b45ff"/></svg>`;
}

/*
 * Carte de nœuds : le symbole sert de plan du site. Le nœud actif est mis en couleur,
 * les autres restent en filigrane. Purement décoratif (le texte de la page porte le sens).
 */
function nodeMap(active, { cls = 'node-map' } = {}) {
  const n = nodes[active];
  const highlight = n ? `<circle class="node-map-active" cx="${n.cx}" cy="${n.cy}" r="${n.r}" fill="url(#pt-grad)"/><circle class="node-map-pulse" cx="${n.cx}" cy="${n.cy}" r="${n.r}" fill="none" stroke="url(#pt-grad)" stroke-width="10"/>` : '';
  const core = active === 'core' ? ' is-core' : '';
  return `<svg class="${cls}${core}" viewBox="${viewBox(ICON_BOX)}" aria-hidden="true" focusable="false"><use class="node-map-base" href="#pt-mark"/>${highlight}</svg>`;
}

/* SVG autonomes (fichiers servis, favicons, Open Graph). */
function standaloneMark({ background = null, padding = 0.12, size = 512 } = {}) {
  const pad = Math.max(ICON_BOX.w, ICON_BOX.h) * padding;
  const side = Math.max(ICON_BOX.w, ICON_BOX.h) + pad * 2;
  const x = ICON_BOX.x - pad - (side - pad * 2 - ICON_BOX.w) / 2;
  const y = ICON_BOX.y - pad - (side - pad * 2 - ICON_BOX.h) / 2;
  const bg = background ? `<rect x="${x}" y="${y}" width="${side}" height="${side}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${x} ${y} ${side} ${side}"><defs>${gradientDefs()}</defs>${bg}<g fill="url(#pt-grad)"><circle cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}"/><path d="${shapePath}"/></g></svg>`;
}

function standaloneLogo({ color = '#0a0c10', height = 120 } = {}) {
  const gap = 140;
  const scale = ICON_BOX.h / WORD_BOX.h * 0.62;
  const wordW = WORD_BOX.w * (ICON_BOX.h / WORD_BOX.h) * 0.62;
  const width = ICON_BOX.w + gap + wordW;
  const ty = ICON_BOX.h * 0.19;
  return `<svg xmlns="http://www.w3.org/2000/svg" height="${height}" width="${Math.round(height * width / ICON_BOX.h)}" viewBox="0 0 ${Math.round(width)} ${ICON_BOX.h}"><title>Pridano Tech</title><defs>${gradientDefs()}</defs><g transform="translate(${-ICON_BOX.x} ${-ICON_BOX.y})" fill="url(#pt-grad)"><circle cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}"/><path d="${shapePath}"/></g><g transform="translate(${ICON_BOX.w + gap} ${ty}) scale(${scale}) translate(${-WORD_BOX.x} ${-WORD_BOX.y})"><path d="${wordPath}" fill="${color}" fill-rule="evenodd"/><rect x="${square.x}" y="${square.y}" width="${square.w}" height="${square.h}" fill="#1b45ff"/></g></svg>`;
}

/* Données transmises à la scène WebGL (repère normalisé, y vers le haut). */
function glGeometry() {
  const cx = ICON_BOX.x + ICON_BOX.w / 2;
  const cy = ICON_BOX.y + ICON_BOX.h / 2;
  const unit = ICON_BOX.h / 2;
  return {
    path: shapePath,
    center: [cx, cy],
    unit,
    dot: [(dot.cx - cx) / unit, -(dot.cy - cy) / unit, dot.r / unit],
    nodes: Object.fromEntries(['top', 'right', 'bottom'].map((k) => [k, [(nodes[k].cx - cx) / unit, -(nodes[k].cy - cy) / unit]])),
  };
}

module.exports = { ICON_BOX, WORD_BOX, nodes, sprite, mark, wordmark, nodeMap, standaloneMark, standaloneLogo, glGeometry, gradientDefs };
