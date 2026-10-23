/* Accueil : textes repris du site existant (pridanotech.fr), mis en scène autour du symbole. */
const { brand, expertises } = require('../data/brand');
const { glGeometry } = require('../lib/logo');
const { esc, icon, btn, picture, images } = require('../lib/html');
const s = require('../components/sections');
const { film } = require('../components/film');

function hero() {
  const hasPoster = Boolean(images()['hero-poster']);
  const poster = hasPoster ? picture('hero-poster', { decorative: true, priority: true, sizes: '(min-width: 761px) min(52vw, 860px), 84vw', cls: 'hero-poster' }) : '<div class="hero-poster hero-poster--css"></div>';
  const nodes = expertises.map((e) => `<li><a class="hero-node" href="${e.href}" data-vt-zoom><span class="hero-node-dot" aria-hidden="true"></span><span class="hero-node-index">${e.index}</span><span class="hero-node-name">${e.name}</span><span class="hero-node-kicker">${e.nav}</span></a></li>`).join('');
  return `<section class="hero" data-hero data-index-label="Accueil" id="accueil">
<div class="hero-stage" aria-hidden="true" data-hero-stage>
${poster}
<canvas class="hero-canvas" data-hero-canvas data-geo="${esc(JSON.stringify(glGeometry()))}"></canvas>
</div>
<div class="wrap hero-grid">
<h1 class="hero-title">
<span class="label hero-kicker">Création de sites web & logiciels sur mesure · ${brand.city}</span>
<span class="hero-line">Des sites</span>
<span class="hero-line">qui marquent<span class="pt">.</span></span>
<span class="hero-line hero-line--accent">Des idées</span>
<span class="hero-line hero-line--accent">qui avancent<span class="pt">.</span></span>
</h1>
<div class="hero-side">
<p class="lead hero-lead">Nous créons des sites web sur mesure pour donner à votre entreprise l’image qu’elle mérite.</p>
<div class="btn-row">${btn({ href: '/contact?projet=site', label: 'Démarrer un projet', track: 'cta-hero:Démarrer un projet' })}${btn({ href: '/realisations', label: 'Découvrir nos réalisations', variant: 'ghost', track: 'cta-hero:Découvrir nos réalisations' })}</div>
</div>
<p class="hero-hint" aria-hidden="true"><span class="hero-hint-dot"></span><span>Une idée. Un échange. Une connexion.</span></p>
</div>
<nav class="hero-nodes wrap" aria-label="Nos expertises"><ol role="list">${nodes}</ol><a class="hero-scroll" href="#premiere-impression" aria-label="Défiler vers la suite">${icon('arrow-down')}</a></nav>
</section>`;
}

module.exports = {
  title: 'Création de sites web & logiciels sur mesure à Montpellier',
  description: 'Pridano crée des sites web sur mesure qui renforcent votre image. Studio à Montpellier : création, refonte, SaaS et logiciels métier.',
  crumb: 'Accueil',
  body: () => `${film()}
${hero()}
${s.firstImpression()}
${s.nodesSection()}
${s.transformSection({
    kicker: 'Représentation de notre approche',
    title: 'Moins de détours. Plus de possibilités.',
    lead: 'Votre activité a ses propres règles. Nous créons les logiciels qui les comprennent.',
    steps: [
      { title: 'Les fichiers deviennent ingérables.', text: 'L’information existe, mais se disperse.' },
      { title: 'Vos logiciels ne se parlent pas.', text: 'Relier vos outils existants et automatiser les étapes répétitives, selon les possibilités de chaque service.' },
      { title: 'Un outil commun.', text: 'Votre métier. Sur mesure. Informations reliées · Actions simplifiées.' },
    ],
    before: ['Fichiers Excel', 'Double saisie', 'Processus manuels', 'Fichiers ingérables', 'Outils qui ne se parlent plus', 'Information dispersée'],
    after: ['Vos données', 'Votre logiciel', 'Vos équipes', 'Vos clients'],
    caption: 'Représentation de notre approche · visuel d’illustration',
  })}
${s.methodSection()}
${s.workSection({ kicker: 'Une sélection, du concret', title: 'Des idées devenues des présences.' })}
${s.testimonialsSection()}
${s.osTeaser()}
${s.studioSection()}
${s.finalCta()}`,
};
