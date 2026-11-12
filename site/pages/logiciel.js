/*
 * Page d’un logiciel Pridano (/logiciels/<id>), générée seulement pour les produits marqués
 * `publishPage: true` dans site/data/software.js. Les concepts ont leurs pages
 * explicatives sans fausse capture, tarif, inscription ou promesse de disponibilité.
 * Chaque bloc n’apparaît que si sa donnée existe : pas de bouton d’inscription sans lien réel,
 * pas de tarif sans formule validée, pas de capture qui ne soit pas réelle.
 */
const { btn, pt, icon, link, price, picture } = require('../lib/html');
const s = require('../components/sections');
const c = require('../components/catalog');
const { pricingTax } = require('../data/brand');
const { products, statuses } = require('../data/software');
const { esc } = require('../lib/html');

function productPage(p) {
  const signup = p.status === 'disponible' && p.signupUrl;
  const isConcept = p.status === 'concept';
  const plans = p.plans.length ? `<section class="care" id="formules" data-index-label="Formules">
<div class="wrap">
${s.sectionHead({ kicker: 'Formules', title: 'Choisir sa formule.' })}
<ul class="care-grid" role="list">${p.plans.map((plan, i) => `<li class="care-card${plan.featured ? ' care-card--featured on-dark' : ''}" data-reveal style="--d:${i}">
<p class="care-head"><span class="label label--plain">${plan.name}</span></p>
<p class="price-from"><strong>${price(plan.price)}</strong> <span>${pricingTax} / ${plan.period || 'mois'}</span></p>
<ul class="care-list" role="list">${plan.features.map((f) => `<li>${icon('check')}${f}</li>`).join('')}</ul>
</li>`).join('')}</ul>
</div>
</section>` : '';
  const shots = p.screenshots.length ? `<section class="svc" id="captures" data-index-label="Captures">
<div class="wrap">
${s.sectionHead({ kicker: 'Le produit, de l’intérieur', title: 'Des écrans réels.' })}
<ul class="modules-grid" role="list">${p.screenshots.map((img) => `<li class="module">${picture(img, { alt: `Capture réelle de ${p.name}`, sizes: '(min-width: 900px) 30vw, 90vw' })}</li>`).join('')}</ul>
</div>
</section>` : '';
  return {
    title: `${p.name} — ${p.tagline}`,
    description: p.description,
    crumb: p.name,
    parent: { href: '/logiciels', label: 'Nos produits' },
    faq: p.faq,
    body: () => `${s.pageHero({
      crumb: p.name,
      parent: { href: '/logiciels', label: 'Nos produits' },
      kicker: `Pridano Software · ${p.category}`,
      title: p.tagline,
      lead: p.description,
      actions: `${signup ? btn({ href: p.signupUrl, label: 'Créer un compte' }) : btn({ href: c.interestHref(p), label: 'Être tenu informé' })}${c.statusBadge(p.status)}`,
    })}
<section class="product-detail" id="fonctionnalites" data-index-label="Fonctionnalités"><div class="wrap product-detail-grid">
<div class="product-detail-intro"><span class="label">${isConcept ? 'Périmètre envisagé' : 'Vision des fonctionnalités'}</span><h2 class="h2">${isConcept ? 'À quoi servirait ce logiciel ?' : 'Ce que nous construisons.'}</h2><p class="lead">${esc(p.description)}</p>${p.note ? `<p class="fine-print">${esc(p.note)}</p>` : ''}</div>
<div class="product-detail-features"><h3>Les domaines couverts ${isConcept ? '(envisagés)' : '(vision produit)'}</h3><ul role="list">${p.features.map((f) => `<li><strong>${esc(f)}</strong></li>`).join('')}</ul></div>
</div></section>
<section class="product-detail-more" data-index-label="À savoir"><div class="wrap"><div><span class="label">Disponibilité et accès</span><h2>Où en est ${esc(p.name)} ?</h2><p>${esc(statuses[p.status].text)} Pas encore de tarif ni de date de lancement.</p></div><div><span class="label">Dans l’écosystème Pridano</span><h2>Découvrir d’autres solutions.</h2><ul role="list">${products.filter((other) => other.id !== p.id).map((other) => `<li><a href="${other.page || '/crm'}">${esc(other.name)}</a></li>`).join('')}</ul></div></div></section>
${shots}
${plans}
${p.faq.length ? s.faqSection(p.faq) : ''}
${p.docsUrl ? `<section class="svc"><div class="wrap">${link({ href: p.docsUrl, label: 'Consulter la documentation' })}</div></section>` : ''}
${s.finalCta({ kicker: 'Pridano · Software', title: pt('Une question sur ce logiciel ?'), primary: { href: c.interestHref(p), label: 'Nous écrire' }, tagline: null, aside: { href: '/logiciels', label: 'Tous nos logiciels' } })}`,
  };
}

module.exports = { productPage };
