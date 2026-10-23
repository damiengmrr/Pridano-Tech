/* Calcul du champ de distance hors du fil principal : aucune tâche longue pendant le chargement. */
import { computeSdf } from './sdf-core.js';

self.onmessage = (event) => {
  const { geo, options } = event.data;
  try {
    const result = computeSdf(geo, { ...options, createCanvas: (w, h) => new OffscreenCanvas(w, h) });
    self.postMessage({ ok: true, ...result }, [result.data.buffer]);
  } catch (error) {
    self.postMessage({ ok: false, message: String(error) });
  }
};
