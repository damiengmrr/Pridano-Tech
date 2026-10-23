/*
 * Cinématique d’ouverture de l’accueil : « Le premier point ».
 * I. L’inconnu — l’obscurité, un point de lumière (le point du logo), des fragments de biseaux.
 * II. Le dévoilement — la caméra recule, le symbole apparaît, le point rejoint le réseau.
 * III. La transformation — des lignes partent des nœuds, une grille naît, les projets réels arrivent.
 * IV. L’arrivée — les écrans passent la caméra, la lumière envahit l’écran, le symbole se pose
 *     exactement à sa place dans le hero : la dernière image du film est la première du site.
 *
 * Gabarit seulement : la mise en scène est pilotée par src/scripts/modules/film.js.
 * Version courte pour les visites suivantes, rien en mouvement réduit (script d’amorçage).
 * Décoratif : le vrai contenu de la page est rendu dessous dès le départ.
 */
const { brand } = require('../data/brand');
const { glGeometry, wordmark } = require('../lib/logo');
const { icon } = require('../lib/html');

/* Projets réels projetés pendant l’acte III (captures des sites livrés et du produit maison). */
const panels = [
  { id: 'top', src: '/assets/img/solaria-site-640.webp', label: 'Solaria Média' },
  { id: 'right', src: '/assets/img/dashboard-640.webp', label: 'Pridano Business OS' },
  { id: 'bottom', src: '/assets/img/ppg-site-640.webp', label: 'Prévenir Pour Gagner' },
];

function film() {
  const geo = glGeometry();
  const [dx, dy] = geo.dot;
  return `<div class="film" data-film style="--dot-x:${dx.toFixed(3)};--dot-y:${dy.toFixed(3)}">
<div class="film-bg" data-film-bg><span class="film-beam"></span><span class="film-grain"></span></div>
<div class="film-grid" data-film-grid aria-hidden="true"></div>
<div class="film-gl" data-film-gl aria-hidden="true"></div>
<svg class="film-mark" data-film-mark viewBox="-1.6 -1.2 3.2 2.4" aria-hidden="true" focusable="false"><defs><filter id="film-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="0.05"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9"/></filter></defs><g data-film-goo><g transform="translate(${(-geo.center[0] / geo.unit).toFixed(4)} ${(-geo.center[1] / geo.unit).toFixed(4)}) scale(${(1 / geo.unit).toFixed(6)})"><use href="#pt-shape" fill="url(#pt-grad)"/></g><circle data-film-dot cx="${dx.toFixed(4)}" cy="${(-dy).toFixed(4)}" r="${geo.dot[2].toFixed(4)}" fill="#08a2ff"/></g><rect class="film-sweep" x="-1.6" y="-1.2" width="3.2" height="2.4" fill="url(#film-sweep)" mask="url(#film-shape)"/><mask id="film-shape"><g transform="translate(${(-geo.center[0] / geo.unit).toFixed(4)} ${(-geo.center[1] / geo.unit).toFixed(4)}) scale(${(1 / geo.unit).toFixed(6)})"><use href="#pt-mark" fill="#fff"/></g></mask><linearGradient id="film-sweep" gradientUnits="userSpaceOnUse" x1="-1.4" y1="0" x2="1.4" y2="0.4" data-film-sweep><stop offset="0.38" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#e8fbff" stop-opacity="0.9"/><stop offset="0.62" stop-color="#fff" stop-opacity="0"/></linearGradient></svg>
<span class="film-spark" data-film-spark aria-hidden="true"></span>
<span class="film-flare" aria-hidden="true"></span>
<span class="film-flash" data-film-flash aria-hidden="true"></span>
<svg class="film-lines" data-film-lines aria-hidden="true" focusable="false">${panels.map((p) => `<path data-line="${p.id}" pathLength="1"/><circle data-pulse="${p.id}" r="3"/>`).join('')}</svg>
<div class="film-panels" aria-hidden="true">${panels.map((p) => `<figure class="film-panel" data-panel="${p.id}"><canvas width="640" height="400" data-src="${p.src}"></canvas><figcaption>${p.label}</figcaption></figure>`).join('')}</div>
<p class="film-credit" aria-hidden="true">Studio digital indépendant · ${brand.city}</p>
<div class="film-title" data-film-title aria-hidden="true">${wordmark({ cls: 'film-word' })}<p class="film-tagline">${brand.tagline}</p></div>
<div class="film-hud" aria-hidden="true"><span data-film-act>I</span><span class="film-hud-bar"><i data-film-progress></i></span></div>
<button class="film-skip" type="button" data-film-skip>Passer l’intro${icon('arrow')}</button>
</div>`;
}

module.exports = { film };
