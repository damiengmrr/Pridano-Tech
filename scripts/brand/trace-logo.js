/*
 * Vectorise les logos officiels fournis (brand-source/) :
 *  - le symbole (point isolé + forme à trois nœuds) depuis logo-icon-gradient.webp
 *  - le logotype « pridano. » depuis logo-horizontal.webp
 * Produit site/data/logo-geometry.json, utilisé par les gabarits, les SVG de marque
 * et le champ de distance de la scène WebGL. À relancer seulement si les sources changent.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const potrace = require('potrace');

const root = path.resolve(__dirname, '../..');
const src = (f) => path.join(root, 'brand-source', f);

const trace = (buffer, options) => new Promise((resolve, reject) => {
  potrace.trace(buffer, { turdSize: 40, optTolerance: 0.25, alphaMax: 1, threshold: 128, ...options }, (error, svg) => (error ? reject(error) : resolve(svg)));
});
const pathData = (svg) => [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ');

async function maskFrom(file, predicate) {
  const { data, info } = await sharp(src(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mask = new Uint8Array(info.width * info.height);
  for (let i = 0; i < mask.length; i++) {
    const [r, g, b, a] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]];
    mask[i] = predicate(r, g, b, a) ? 1 : 0;
  }
  return { mask, width: info.width, height: info.height };
}

function components({ mask, width, height }) {
  const label = new Int32Array(mask.length).fill(-1);
  const out = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || label[start] !== -1) continue;
    const id = out.length;
    const stack = [start];
    label[start] = id;
    const c = { id, area: 0, sx: 0, sy: 0, minX: width, minY: height, maxX: 0, maxY: 0 };
    while (stack.length) {
      const p = stack.pop();
      const x = p % width;
      const y = (p - x) / width;
      c.area++; c.sx += x; c.sy += y;
      c.minX = Math.min(c.minX, x); c.maxX = Math.max(c.maxX, x);
      c.minY = Math.min(c.minY, y); c.maxY = Math.max(c.maxY, y);
      for (const q of [p - 1, p + 1, p - width, p + width]) {
        if (q < 0 || q >= mask.length || !mask[q] || label[q] !== -1) continue;
        if ((q === p - 1 && x === 0) || (q === p + 1 && x === width - 1)) continue;
        label[q] = id;
        stack.push(q);
      }
    }
    out.push(c);
  }
  return { label, list: out.filter((c) => c.area > 200) };
}

async function maskToPng({ width, height }, keep) {
  const pixels = Buffer.alloc(width * height, 255);
  for (let i = 0; i < pixels.length; i++) if (keep(i)) pixels[i] = 0;
  return sharp(pixels, { raw: { width, height, channels: 1 } }).png().toBuffer();
}

async function main() {
  /* Symbole : silhouette depuis l’alpha de la version en dégradé (haute définition). */
  const icon = await maskFrom('logo-icon-gradient.webp', (r, g, b, a) => a > 127);
  const iconParts = components(icon);
  iconParts.list.sort((a, b) => a.minX - b.minX);
  const [dotPart, ...shapeParts] = iconParts.list;
  const shapeIds = new Set(shapeParts.map((c) => c.id));
  const dot = { cx: dotPart.sx / dotPart.area, cy: dotPart.sy / dotPart.area, r: Math.sqrt(dotPart.area / Math.PI) };
  const shapePng = await maskToPng(icon, (i) => shapeIds.has(iconParts.label[i]));
  const shapePath = pathData(await trace(shapePng));
  const box = {
    minX: Math.min(dotPart.minX, ...shapeParts.map((c) => c.minX)),
    minY: Math.min(dotPart.minY, ...shapeParts.map((c) => c.minY)),
    maxX: Math.max(dotPart.maxX, ...shapeParts.map((c) => c.maxX)),
    maxY: Math.max(dotPart.maxY, ...shapeParts.map((c) => c.maxY)),
  };

  /* Logotype : lettres noires + carré bleu de la version horizontale officielle. */
  const word = await maskFrom('logo-horizontal.webp', (r, g, b, a) => a > 127 && r < 90 && g < 90 && b < 90);
  const wordPng = await maskToPng(word, (i) => word.mask[i] === 1);
  const wordPath = pathData(await trace(wordPng, { turdSize: 20 }));
  const square = await maskFrom('logo-horizontal.webp', (r, g, b, a) => a > 127 && b > 150 && r < 60 && g < 110);
  const squareParts = components(square).list.sort((a, b) => b.minX - a.minX);
  const sq = squareParts[0];
  const letters = components(word).list;
  const wordBox = {
    minX: Math.min(...letters.map((c) => c.minX)), minY: Math.min(...letters.map((c) => c.minY)),
    maxX: Math.max(sq.maxX, ...letters.map((c) => c.maxX)), maxY: Math.max(sq.maxY, ...letters.map((c) => c.maxY)),
  };

  const geometry = {
    source: 'brand-source/logo-icon-gradient.webp + brand-source/logo-horizontal.webp',
    icon: { width: icon.width, height: icon.height, box, dot, shapePath },
    wordmark: { width: word.width, height: word.height, box: wordBox, path: wordPath, square: { x: sq.minX, y: sq.minY, w: sq.maxX - sq.minX + 1, h: sq.maxY - sq.minY + 1 } },
  };
  fs.mkdirSync(path.join(root, 'site/data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'site/data/logo-geometry.json'), JSON.stringify(geometry, null, 1));
  console.log('icon box', box, 'dot', dot, 'shape parts', shapeParts.length, 'path length', shapePath.length);
  console.log('wordmark box', wordBox, 'square', geometry.wordmark.square, 'letters', letters.length, 'path length', wordPath.length);
}

main().catch((error) => { console.error(error); process.exit(1); });
