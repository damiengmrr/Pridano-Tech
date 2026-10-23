/*
 * Chargement unique du symbole en volume : champ de distance (Web Worker) + programme WebGL.
 * Partagé par la cinématique d’ouverture et le hero : un seul objet 3D, un seul canevas,
 * qui passe de l’une à l’autre sans être recréé.
 */

/* global __SDF_WORKER__ */
const FIELD = { size: 512, span: 1.3, supersample: 2 };

function computeField(geo) {
  const payload = { path: geo.path, center: geo.center, unit: geo.unit };
  const fallback = () => import('./sdf-core.js').then(({ computeSdf }) => computeSdf(payload, {
    ...FIELD,
    size: 384,
    supersample: 1,
    createCanvas: (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h }),
  }));
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined' || typeof __SDF_WORKER__ !== 'string') return fallback();
  return new Promise((resolve) => {
    const worker = new Worker(__SDF_WORKER__, { type: 'module' });
    worker.onmessage = (e) => {
      worker.terminate();
      if (e.data.ok) resolve(e.data);
      else fallback().then(resolve);
    };
    worker.onerror = () => {
      worker.terminate();
      fallback().then(resolve);
    };
    worker.postMessage({ geo: payload, options: FIELD });
  });
}

let pending = null;

/* Résout { scene, geo } quand la scène peut dessiner, ou null (pas de WebGL2, rendu logiciel, échec). */
export function loadLogo(canvas) {
  if (!pending) {
    pending = (async () => {
      const geo = JSON.parse(canvas.dataset.geo);
      const [{ createLogoScene }, sdf] = await Promise.all([import('./logo-scene.js'), computeField(geo)]);
      return new Promise((resolve) => {
        const scene = createLogoScene(canvas, sdf, { onReady: () => resolve({ scene, geo }), onFail: () => resolve(null) });
        if (!scene) resolve(null);
      });
    })().catch((error) => {
      console.warn('[pridano] Scène 3D désactivée :', error);
      return null;
    });
  }
  return pending;
}
