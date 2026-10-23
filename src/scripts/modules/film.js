/*
 * Cinématique d’ouverture : le script d’amorçage (dans <head>) a déjà décidé de la jouer
 * (accueil, première page de la visite, mouvement non réduit) et choisi sa version
 * (complète la première fois, courte ensuite). La mise en scène est chargée à part.
 * Réseau lent : si elle arrive après le filet de sécurité CSS (le film s’est déjà effacé),
 * on n’y revient pas et la page reste telle quelle.
 */
import { $ } from '../core.js';

const LATE = 3.2;

function filmTime(film) {
  const started = $('[data-film-spark]', film)?.getAnimations?.().map((a) => a.startTime).filter((v) => typeof v === 'number');
  return started?.length ? ((document.timeline?.currentTime ?? performance.now()) - Math.min(...started)) / 1000 : 0;
}

function abandon(film) {
  const root = document.documentElement;
  if (!film.isConnected) return;
  film.remove();
  root.classList.remove('has-intro', 'intro-out', 'intro-lock');
  delete root.dataset.intro;
  window.dispatchEvent(new CustomEvent('pt:intro-end', { detail: { loaded: null } }));
}

export function initFilm() {
  const root = document.documentElement;
  const film = $('[data-film]');
  if (!film) return;
  if (!root.classList.contains('has-intro')) {
    film.remove();
    return;
  }
  if (filmTime(film) > LATE) return abandon(film);
  root.classList.add('intro-lock');
  /* Le filet de sécurité CSS a effacé le film : la page est rendue tout de suite. */
  film.addEventListener('animationend', (e) => {
    if (e.target === film && e.animationName === 'film-safety') abandon(film);
  });
  return import('./film-run.js')
    .then(({ runFilm }) => (filmTime(film) > LATE ? abandon(film) : runFilm(film, root.dataset.intro === 'short' ? 'short' : 'full')))
    .catch(() => abandon(film));
}
