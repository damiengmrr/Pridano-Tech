/*
 * Rend le visuel statique du hero avec le shader du site (même géométrie, même éclairage),
 * fond transparent : il s’affiche avant la scène WebGL et la remplace quand elle est
 * indisponible (mouvement réduit, économie de données, WebGL absent).
 * Sortie : brand-source/generated/hero-poster.png, puis `npm run assets`.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('@playwright/test');
const { glGeometry } = require('../../site/lib/logo');

const root = path.resolve(__dirname, '../..');
const SIZE = 1300;

const page = `<!doctype html><html><body style="margin:0;background:transparent">
<canvas id="c" width="${SIZE}" height="${SIZE}" style="width:${SIZE}px;height:${SIZE}px"></canvas>
<script type="module">
import { createLogoScene } from '/src/scripts/gl/logo-scene.js';
import { computeSdf } from '/src/scripts/gl/sdf-core.js';
const geo = ${JSON.stringify(glGeometry())};
const sdf = computeSdf(geo, { size: 512, span: 1.3, supersample: 3, createCanvas: (w, h) => new OffscreenCanvas(w, h) });
const canvas = document.getElementById('c');
const scene = createLogoScene(canvas, sdf, { allowSoftware: true, onReady() {
  scene.render({ width: ${SIZE}, height: ${SIZE}, time: 0, dot: [geo.dot[0], geo.dot[1], geo.dot[2]], merge: 0, yaw: -0.24, pitch: 0.1, roll: 0, zoom: 1, shift: [0, 0] });
  document.title = 'ready';
} });
</script></body></html>`;

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') {
    res.setHeader('Content-Type', 'text/html');
    return res.end(page);
  }
  const file = path.join(root, url);
  if (!file.startsWith(root) || !fs.existsSync(file)) {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader('Content-Type', 'text/javascript');
  fs.createReadStream(file).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const tab = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
    await tab.goto(`http://127.0.0.1:${server.address().port}/`);
    await tab.waitForFunction(() => document.title === 'ready', null, { timeout: 120000 });
    const out = path.join(root, 'brand-source/generated');
    fs.mkdirSync(out, { recursive: true });
    await tab.locator('#c').screenshot({ path: path.join(out, 'hero-poster.png'), omitBackground: true });
    console.log('✓ brand-source/generated/hero-poster.png');
  } finally {
    await browser.close();
    server.close();
  }
});
