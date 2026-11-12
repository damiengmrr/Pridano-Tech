/* Accueil : textes repris du site existant (pridanotech.fr), mis en scène autour du symbole. */
const { brand, expertises, pricing, pricingTax } = require('../data/brand');
const { categories } = require('../data/catalog');
const { products } = require('../data/software');
const { glGeometry } = require('../lib/logo');
const { esc, btn, link, picture, images } = require('../lib/html');
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
<span class="hero-line">Tout votre</span>
<span class="hero-line">numérique<span class="pt">.</span></span>
<span class="hero-line hero-line--second">Un seul</span>
<span class="hero-line hero-line--second">partenaire<span class="pt">.</span></span>
</h1>
<div class="hero-side">
<p class="lead hero-lead">Sites, boutiques en ligne, logiciels, automatisations et IA : conçus, développés et suivis par la même équipe.</p>
<div class="btn-row">${btn({ href: '/contact?projet=site', label: 'Démarrer un projet', track: 'cta-hero:Démarrer un projet' })}${btn({ href: '/realisations', label: 'Découvrir nos réalisations', variant: 'ghost', track: 'cta-hero:Découvrir nos réalisations' })}</div>
</div>
</div>
<nav class="hero-nodes wrap" aria-label="Nos expertises"><ol role="list">${nodes}</ol></nav>
</section>`;
}

function discovery() {
  return `<section class="discovery" id="vos-solutions" data-index-label="Solutions"><div class="wrap">
<div class="discovery-heading"><div><span class="label">Vos besoins</span><h2 class="h2">Que souhaitez-vous créer ?</h2></div>${btn({ href: '/devis?parcours=projet', label: 'J’ai plusieurs besoins', variant: 'ghost' })}</div>
<div class="discovery-grid">${categories.map((cat) => `<a class="discovery-card" href="${cat.page}"><h3>${cat.name}</h3><p>${cat.intro}</p></a>`).join('')}</div>
</div></section>`;
}

/* Logiciels maison : présentés comme un projet à venir, sans statut ni catalogue. */
function softwarePreview() {
  return s.soonSection({
    id: 'nos-logiciels',
    index: 'Logiciels',
    kicker: 'Pridano Software · À venir',
    lead: 'Nous concevons aussi nos propres logiciels. Ils ne sont pas encore disponibles.',
    items: products.map((p) => ({ title: p.category, meta: p.name, href: p.page || `/logiciels/${p.id}` })),
    cta: { href: `/contact?projet=crm&sujet=${encodeURIComponent('Pridano Software')}`, label: 'Être tenu informé', track: 'logiciels:etre-informe' },
    aside: link({ href: '/logiciels', label: 'Découvrir la vision' }),
  });
}

function pricePreview() {
  const featured = pricing.filter((p) => ['landing', 'site', 'refonte', 'saas'].includes(p.id) && Number(p.from) > 0);
  return `<section class="home-prices" id="prix" data-index-label="Tarifs"><div class="wrap">
${s.sectionHead({ kicker: 'Repères de prix', title: 'Des repères pour votre budget.', lead: 'Le périmètre exact est précisé dans votre proposition.', aside: `<a class="link" href="/sites-web#prestations">Offres web et maintenance</a>` })}
<div class="home-price-grid">${featured.map((p) => `<a href="${p.href}" class="home-price"><span>${p.label}</span><strong>Dès ${Number(p.from).toLocaleString('fr-FR')} € <small>${pricingTax}</small></strong><span>Parler de ce projet</span></a>`).join('')}</div>
</div></section>`;
}

module.exports = {
  title: 'Création de sites web & logiciels sur mesure à Montpellier',
  description: 'Pridano Tech, studio digital à Montpellier : sites web, e-commerce, logiciels sur mesure, automatisations et agents IA. Un seul partenaire pour tout votre numérique.',
  crumb: 'Accueil',
  body: () => `${film()}
${hero()}
${discovery()}
${softwarePreview()}
${pricePreview()}
${s.workSection({ kicker: 'Réalisations', title: 'Des projets concrets.' })}
${s.finalCta()}`,
};
