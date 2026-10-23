/*
 * Champ de distance signé du symbole Pridano, calculé à partir de son tracé vectoriel.
 * Transformée de distance euclidienne exacte (Felzenszwalb & Huttenlocher) sur un rendu
 * suréchantillonné, puis réduction par moyenne : contours lisses, biseaux sans stries.
 * Utilisé dans un Web Worker (sdf-worker.js) et, à défaut, sur le fil principal.
 */

function edt1d(f, n, d, v, z) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

function edt(grid, w, h) {
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) grid[y * w + x] = Math.sqrt(d[x]);
  }
}

export function computeSdf({ path, center, unit }, { size = 512, span = 1.3, supersample = 2, createCanvas }) {
  const hi = size * supersample;
  const canvas = createCanvas(hi, hi);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const px = hi / (2 * span);
  const k = px / unit;
  ctx.setTransform(k, 0, 0, k, hi / 2 - center[0] * k, hi / 2 - center[1] * k);
  ctx.fill(new Path2D(path));
  const alpha = ctx.getImageData(0, 0, hi, hi).data;
  const count = hi * hi;
  const inside = new Float64Array(count);
  const outside = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const solid = alpha[i * 4 + 3] > 127;
    outside[i] = solid ? 0 : 1e20;
    inside[i] = solid ? 1e20 : 0;
  }
  edt(outside, hi, hi);
  edt(inside, hi, hi);
  const out = new Float32Array(size * size);
  const norm = 1 / (supersample * supersample * px);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let sy = 0; sy < supersample; sy++) {
        for (let sx = 0; sx < supersample; sx++) {
          const i = (y * supersample + sy) * hi + (x * supersample + sx);
          let dist = outside[i] - inside[i];
          /* Affinage sous-pixel le long du contour grâce à la couverture anticrénelée. */
          if (dist > -1.5 && dist < 1.5) dist = 0.5 - alpha[i * 4 + 3] / 255;
          sum += dist;
        }
      }
      out[y * size + x] = sum * norm;
    }
  }
  return { data: out, size, span };
}
