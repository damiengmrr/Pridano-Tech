const { brand } = require('../data/brand');
const { pt, btn, label, link, picture } = require('../lib/html');
const s = require('../components/sections');
const { heroMedia } = require('../components/hero-media');

const principles = [
  ['Le fond et la forme.', 'Votre image mérite la même attention que le fonctionnement de votre site.'],
  ['Une vraie profondeur technique.', 'Sites, applications et produits maison : nous pensons aussi à ce qui se passe derrière l’écran.'],
  ['Un projet lisible.', 'Un périmètre défini ensemble, des étapes de validation et une mise en ligne préparée.'],
  ['Une suite possible.', 'Votre site peut évoluer avec vos outils, vos intégrations et les besoins de votre entreprise.'],
];

function people() {
  return `<section class="founders" id="equipe" data-index-label="L’équipe">
<div class="wrap founders-grid">
${brand.founders.map((f, i) => `<article class="founder" id="${f.id}"${i === 0 ? '' : ' data-reveal'} style="--d:${i}">
${picture(f.image, { alt: `Portrait de ${f.name}`, sizes: '(min-width: 900px) 40vw, 92vw', cls: 'founder-photo' })}
<p class="index-num">${String(i + 1).padStart(2, '0')} / ${f.role}</p>
<h2 class="h2">${f.name}</h2>
<p class="founder-bio">${f.bio}</p>
${f.url ? link({ href: f.url, label: 'Découvrir le portfolio' }) : ''}
</article>`).join('')}
</div>
</section>`;
}

function principlesSection() {
  return `<section class="principles" id="facon-de-faire" data-index-label="Notre façon de faire">
<div class="wrap">
${s.sectionHead({ kicker: 'Notre façon de faire', title: 'Prendre le projet au sérieux. Rendre les échanges simples.' })}
<ol class="principles-grid" role="list">${principles.map(([t, p], i) => `<li class="principle" data-reveal style="--d:${i}"><span class="principle-num">${String(i + 1).padStart(2, '0')}</span><h3 class="h3">${pt(t)}</h3><p>${p}</p></li>`).join('')}</ol>
</div>
</section>`;
}

module.exports = {
  title: 'Le studio — Damien Gamarra & Noah Lemoing',
  description: 'Pridano, studio digital à Montpellier. Rencontrez Damien Gamarra et Noah Lemoing, du design de sites web au développement de logiciels sur mesure.',
  crumb: 'Le studio',
  schemaType: 'AboutPage',
  body: () => `${s.pageHero({
    crumb: 'Le studio',
    kicker: `Le studio · ${brand.city}`,
    title: 'Des personnes. Des idées. Le souci du détail.',
    lead: 'Pridano réunit le design et le développement. Pour créer des sites qui donnent confiance et des outils qui servent une activité réelle.',
    media: heroMedia.studio(brand),
  })}
${people()}
${principlesSection()}
<section class="studio-product section--dark" data-index-label="Notre produit" data-index-dark>
<div class="wrap studio-product-inner" data-reveal>
${label('Notre produit maison')}
<h2 class="h2">${pt('Nous créons pour vous. Et nous construisons aussi.')}</h2>
<p class="lead">Notre propre Business OS prolonge notre travail sur les logiciels métier. Un terrain concret pour penser les parcours, les connexions et la continuité d’un produit.</p>
<div class="btn-row">${btn({ href: '/crm', label: 'Découvrir notre produit maison', variant: 'light' })}</div>
</div>
</section>
${s.finalCta()}`,
};
