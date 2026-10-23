/*
 * Point d’entrée unique. Chaque module vérifie la présence de ses éléments :
 * une page n’exécute que ce qui la concerne. La scène WebGL et le brief guidé
 * sont chargés à la demande (chunks séparés).
 */
import { initHeader, initMenu, initDock, initIndexRail, initPageTransitions } from './modules/navigation.js';
import { initReveal, initMagnetic, initCursor, initGlow } from './modules/interactions.js';
import { initFirst, initNodes, initTransform, initMethod, initWork, initTilt, initFlow, initHub, initBuild, initFinal, initHeroMedia, initDepth } from './modules/story.js';
import { initTheater, initContactForm, initQuote, initLost } from './modules/pages.js';
import { initHero } from './modules/hero.js';
import { initFilm } from './modules/film.js';

const tasks = [
  initFilm, initHeader, initMenu, initDock, initPageTransitions,
  initReveal, initMagnetic, initCursor, initGlow,
  initHero, initHeroMedia, initDepth, initFirst, initNodes, initTransform, initMethod, initWork, initTilt, initFlow, initHub, initBuild, initFinal,
  initTheater, initContactForm, initQuote, initLost,
  initIndexRail,
];

for (const task of tasks) {
  try {
    const result = task();
    if (result && typeof result.catch === 'function') result.catch((error) => console.error(`[pridano] ${task.name}`, error));
  } catch (error) {
    console.error(`[pridano] ${task.name}`, error);
  }
}
