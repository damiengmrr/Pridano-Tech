const { icon, pt, btn, label } = require('../lib/html');
const s = require('../components/sections');
const { heroMedia } = require('../components/hero-media');

const faq = [
  ['Combien coûte un site web ?', `Le prix dépend du nombre de pages, du travail de design, des contenus et des fonctionnalités. Nous définissons le périmètre avec vous avant de préparer une proposition adaptée.${s.pricingHint(['site', 'refonte'])}`],
  ['En combien de temps mon site est-il livré ?', 'Votre site est livré en 3 à 5 jours. Le planning exact est précisé dans la proposition.'],
  ['Pouvez-vous reprendre mon site actuel ?', 'Oui. La refonte commence par l’existant : contenus, URLs, identité, outils et éléments à conserver. La nouvelle version est construite autour des besoins actuels de votre activité.'],
  ['Faut-il avoir tous les contenus prêts ?', 'Pas nécessairement. Un premier échange permet de lister les textes, photos et informations utiles, puis de définir ce qui doit être préparé et par qui.'],
  ['Que se passe-t-il après la mise en ligne ?', `Nous définissons ensemble le cadre du suivi, de la maintenance et des évolutions. Ces éléments sont précisés dans la proposition, selon votre besoin.${s.maintenanceHint()}`],
];

/* Étapes et légendes de la scène de construction du site existant. */
const stages = [
  ['Stratégie', 'Poser la bonne intention avant le premier pixel.'],
  ['Structure', 'Organiser le message autour de vos visiteurs.'],
  ['Wireframe', 'Valider les parcours, sans se laisser distraire par la forme.'],
  ['Direction artistique', 'Donner à votre entreprise un langage visuel singulier.'],
  ['Design', 'Faire dialoguer typographie, contraste et espace.'],
  ['Motion', 'Donner du rythme et guider le regard.'],
  ['Desktop', 'Composer une expérience généreuse sur grand écran.'],
  ['Mobile', 'Repenser les usages pour le creux de la main.'],
  ['Site final', 'Réunir le fond, la forme et la technique.'],
];

function buildDemo() {
  const steps = stages.map(([t, p], i) => `<li class="build-step${i === 0 ? ' is-active' : ''}" data-build-step="${i}">
<button type="button" class="build-step-btn" aria-pressed="${i === 0}" data-build-btn="${i}"><span class="build-step-num">${String(i + 1).padStart(2, '0')}</span>${t}</button>
<p>${p}</p>
</li>`).join('');
  return `<section class="build" id="conception" data-index-label="Conception" data-build>
<div class="build-pin">
<div class="wrap build-grid">
<div class="build-copy">
${label('De l’idée au dernier pixel')}
<h2 class="h2">${pt('Un bon site. Rien au hasard.')}</h2>
<p class="lead">Faites défiler pour voir <br>notre approche prendre forme.</p>
</div>
<ol class="build-steps" role="list">${steps}</ol>
<figure class="build-figure">
<div class="build-device" data-build-device data-stage="0" aria-hidden="true">
<div class="bd-bar"><span></span><span></span><span></span><b>pridano / votre prochaine présence digitale</b></div>
<div class="bd-screen">
<div class="bd-notes"><span>Votre activité</span><span>Vos visiteurs</span><span>Un objectif clair</span></div>
<div class="bd-nav"><b class="bd-logo">votre marque<i>.</i></b><span class="bd-links"><i></i><i></i><i></i></span><span class="bd-cta">Contact</span></div>
<div class="bd-hero">
<div class="bd-hero-copy"><small>Un nouveau regard</small><strong>Faites place à la différence.</strong><p>Une présence à la hauteur de ce que vous faites.</p><span class="bd-btn">Découvrir notre univers</span></div>
<div class="bd-hero-art"><span class="bd-o bd-o1"></span><span class="bd-o bd-o2"></span><span class="bd-o bd-o3"></span></div>
</div>
<div class="bd-cards"><span><i></i><b></b></span><span><i></i><b></b></span><span><i></i><b></b></span></div>
<div class="bd-wire"><span>01 · Navigation</span><span>02 · Votre message</span><span>03 · Univers visuel</span><span>04 · Vos expertises</span><span>05 · Prendre contact</span></div>
<div class="bd-da"><span class="bd-aa">Aa</span><span class="bd-sw bd-sw1"></span><span class="bd-sw bd-sw2"></span><span class="bd-sw bd-sw3"></span><span class="bd-sw bd-sw4"></span></div>
<div class="bd-ready">Prêt pour la rencontre</div>
</div>
</div>
<figcaption>Démonstration de conception · visuel d’illustration</figcaption>
</figure>
</div>
</div>
</section>`;
}

function qualities() {
  const tiles = [
    ['Design & identité', 'Un langage visuel qui reflète votre positionnement, sans vous faire entrer dans un modèle.', '<div class="q-demo q-type" aria-hidden="true"><span>Aa</span></div>'],
    ['Contenu & conversion', 'Des messages compréhensibles, une offre lisible et des appels à l’action placés au bon endroit.', '<div class="q-demo q-cta" aria-hidden="true"><span class="q-line"></span><span class="q-line q-line--short"></span><span class="q-btn">Nous contacter</span></div>'],
    ['Mobile & accessibilité', 'De vrais parcours mobiles, des contrastes lisibles et une navigation utilisable au clavier.', '<div class="q-demo q-focus" aria-hidden="true"><span>Accueil</span><span>Offre</span><span>Contact</span></div>'],
    ['Motion & interactions', 'Des animations qui guident la lecture et soulignent les détails, sans ralentir l’expérience.', '<div class="q-demo q-ease" aria-hidden="true"><svg viewBox="0 0 200 100"><path d="M10 90 C 80 90, 90 10, 190 10" /></svg><span class="q-ease-dot"></span></div>'],
    ['Performance', 'Des images adaptées, des ressources maîtrisées et une attention portée au chargement.', '<div class="q-demo q-perf" aria-hidden="true"><span class="q-bar"><i></i></span><span class="q-bar"><i></i></span><span class="q-bar"><i></i></span></div>'],
    ['SEO technique', 'Titres, descriptions, structure sémantique, sitemap et redirections préparés pour la mise en ligne.', '<div class="q-demo q-serp" aria-hidden="true"><small>votre marque.</small><b>Un site qui vous ressemble.</b><span></span><span class="short"></span></div>'],
  ];
  return `<section class="qualities" id="qualites" data-index-label="Qualités">
<div class="wrap">
${s.sectionHead({ kicker: 'Ce qui fait un bon site', title: 'Beau au premier regard. Juste à chaque usage.' })}
<ul class="q-grid" role="list">${tiles.map(([t, p, demo], i) => `<li class="q-tile" data-reveal style="--d:${i % 3}">${demo}<span class="index-num">${String(i + 1).padStart(2, '0')}</span><h3 class="h4">${t}</h3><p>${p}</p></li>`).join('')}</ul>
</div>
</section>`;
}

function paths() {
  const card = (cls, num, kicker, title, text, points, href, cta) => `<article class="path-card ${cls}" data-reveal>
<p class="path-num">${num}</p>
${label(kicker, 'label--plain')}
<h2 class="h2">${pt(title)}</h2>
<p class="path-text">${text}</p>
<ul class="node-points" role="list">${points.map((p) => `<li>${icon('check')}${p}</li>`).join('')}</ul>
${btn({ href, label: cta, variant: cls === 'path-card--dark' ? 'light' : 'primary' })}
</article>`;
  return `<section class="paths" id="creation-refonte" data-index-label="Création & refonte">
<div class="wrap paths-grid">
${card('', '01', 'Création', 'Tout commence par une présence.', 'Vous lancez une activité ou vous avez besoin d’un vrai site professionnel. Nous construisons une vitrine claire, distinctive et adaptée à vos objectifs.', ['Votre offre et vos messages structurés', 'Une identité digitale cohérente', 'Des pages pensées pour la prise de contact'], '/contact?projet=site', 'Créer mon site')}
${card('path-card--dark section--dark', '02', 'Refonte', 'Vous avez évolué. Votre site, moins.', 'Votre activité mérite mieux qu’une présence devenue floue ou datée. Nous reprenons l’existant, conservons ce qui compte et repensons l’expérience.', ['Analyse des contenus et parcours existants', 'URLs utiles et référencement pris en compte', 'Une nouvelle direction, une transition préparée'], '/contact?projet=refonte', 'Repenser mon site')}
</div>
</section>`;
}

module.exports = {
  title: 'Création & refonte de sites web sur mesure',
  description: 'Un site web à la hauteur de votre entreprise. Création, refonte, design, responsive, motion et SEO technique : découvrez la méthode Pridano.',
  crumb: 'Sites web',
  faq,
  service: { name: 'Création et refonte de sites web sur mesure', type: 'Conception de sites web', description: 'Un site web à la hauteur de votre entreprise. Création, refonte, design, responsive, motion et SEO technique : découvrez la méthode Pridano.', offers: ['Création de site web', 'Refonte de site web'], priceIds: ['site', 'refonte'], maintenance: true },
  body: () => `${s.pageHero({
    crumb: 'Sites web',
    kicker: '01 Sites web · Notre cœur de métier · Création & refonte',
    title: 'Votre entreprise fait la différence. Votre site aussi.',
    lead: 'Un site qui présente clairement votre offre, rassure vos visiteurs et facilite le premier contact. Conçu pour vous. Dans chaque détail.',
    actions: `${btn({ href: '/contact?projet=site', label: 'Démarrer un projet' })}`,
    media: heroMedia.sites(),
  })}
${paths()}
${s.pricingSection({ ids: ['site', 'refonte'] })}
${s.maintenanceSection()}
${buildDemo()}
${qualities()}
${s.methodSection()}
${s.workSection({ kicker: 'Une sélection, du concret', title: 'Des idées devenues des présences.' })}
${s.faqSection(faq, { kicker: 'Parlons concrètement', title: 'Avant de vous lancer.' })}
${s.finalCta()}`,
};
