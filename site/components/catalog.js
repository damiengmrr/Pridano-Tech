/*
 * Composants des deux catalogues (prestations, logiciels). Ils réutilisent les composants
 * existants du site : cartes `.module`, listes `.node-points`, principes `.principle`,
 * lignes « problème → réponse » `.ps-row`, cartes de prix, liens `.link` et boutons `.btn`.
 */
const { pricing, pricingTax, maintenance } = require('../data/brand');
const { categories, categoryById, servicesOf } = require('../data/catalog');
const { needById, normalizeNeeds } = require('../data/needs');
const { statuses } = require('../data/software');
const { esc, icon, pt, btn, link, label, price } = require('../lib/html');
const { sectionHead, soonSection } = require('./sections');

/* Lien vers le devis guidé avec un ou plusieurs besoins présélectionnés. */
function devisHref(needIds = []) {
  const ids = normalizeNeeds(needIds);
  return ids.length ? `/devis?besoins=${ids.join(',')}` : '/devis';
}

/*
 * Tarif affiché d’une prestation : uniquement un prix validé dans brand.js.
 * Retourne null quand la prestation est « Sur devis ».
 */
function servicePrice(service) {
  const ref = service.price?.ref;
  if (!ref) return null;
  if (ref === 'maintenance') {
    if (!maintenance.length) return null;
    return { from: Math.min(...maintenance.map((m) => m.price)), unit: `${pricingTax} / mois` };
  }
  const p = pricing.find((x) => x.id === ref && Number(x.from) > 0);
  return p ? { from: Number(p.from), unit: pricingTax, delivery: p.delivery || '' } : null;
}

/*
 * Prix d’une prestation sur sa carte : seulement s’il est validé. Les prestations sans prix ne répètent
 * pas « Sur devis » (une seule mention sous la grille), et la maintenance renvoie à ses formules.
 */
const shownPrice = (service) => (service.price?.ref === 'maintenance' ? null : servicePrice(service));

function priceLine(service) {
  const p = shownPrice(service);
  if (!p) return '';
  return `<p class="svc-price"><span>À partir de</span> <strong>${price(p.from)}</strong> <span>${p.unit}</span></p>${p.delivery ? `<p class="svc-delay">Livré en ${p.delivery}</p>` : ''}`;
}

const anchor = (service) => `prestation-${service.id}`;
const detailHref = (service) => `${categoryById[service.category].page}#${anchor(service)}`;

/* Carte compacte (catalogue) ou détaillée (page de catégorie). */
function serviceCard(service, i, { detailed = false } = {}) {
  const need = needById[service.need];
  const body = detailed
    ? `<p>${service.details}</p>
<p class="svc-audience"><strong>Pour qui :</strong> ${service.audience}</p>
<ul class="node-points" role="list">${service.deliverables.map((d) => `<li>${icon('check')}${d}</li>`).join('')}</ul>`
    : `<p>${service.short}</p>`;
  const actions = detailed
    ? link({ href: devisHref([service.need]), label: 'Demander un devis', track: `catalogue:devis:${service.id}` })
    : `${link({ href: detailHref(service), label: 'Voir le détail', track: `catalogue:detail:${service.id}` })}`;
  return `<li class="module svc-card" id="${detailed ? anchor(service) : `carte-${service.id}`}" data-reveal style="--d:${i % 3}" data-need="${esc(need?.id || '')}">
<h3 class="h3">${service.name}</h3>
${body}
${priceLine(service)}
<div class="svc-actions">${actions}</div>
</li>`;
}

/* Bloc « Nos prestations » d’une catégorie : pages de catégorie, Sites web et SaaS. */
function serviceSection(categoryId, { kicker = 'Prestations incluses', title, lead = '' } = {}) {
  const cat = categoryById[categoryId];
  const list = servicesOf(categoryId).filter((s) => !s.upcoming);
  /* Une seule mention « sur devis » pour la section ; la maintenance renvoie à ses formules. */
  const priced = list.filter((s) => shownPrice(s)).length;
  const note = categoryId === 'maintenance' || priced === list.length ? '' : priced ? 'Les autres prestations sont sur devis.' : 'Prestations sur devis, après un premier échange.';
  return `<section class="svc" id="prestations" data-index-label="Prestations">
<div class="wrap">
${sectionHead({ kicker, title: title || `${cat.name} : nos prestations.`, lead })}
<ul class="modules-grid svc-grid" role="list">${list.map((s, i) => serviceCard(s, i, { detailed: true })).join('')}</ul>
${note ? `<p class="fine-print svc-note">${note}</p>` : ''}
</div>
</section>`;
}

/* Prestations proposées plus tard (ex. agents IA) : présentées comme un projet, sans prix ni promesse de date. */
function upcomingSection(cat) {
  const list = servicesOf(cat.id).filter((s) => s.upcoming);
  if (!list.length) return '';
  return soonSection({
    id: 'a-venir',
    index: 'À venir',
    kicker: `${cat.name} · À venir`,
    lead: 'Pas encore proposés : nous les préparons.',
    items: list.map((s) => ({ title: s.name, meta: s.short })),
    cta: { href: `/contact?sujet=${encodeURIComponent(cat.upcomingSubject || cat.name)}`, label: 'Être tenu informé', track: `a-venir:${cat.id}` },
  });
}

/* Navigation par catégorie (ancres), réutilise les boutons secondaires du site. */
function categoryNav() {
  return `<nav class="cat-nav" aria-label="Catégories de prestations"><ul role="list">${categories.map((c) => `<li>${btn({ href: `#${c.id}`, label: c.name, variant: 'ghost', size: 'sm', track: `catalogue:categorie:${c.id}` })}</li>`).join('')}</ul></nav>`;
}

/* Catalogue complet : une section par catégorie, des cartes compactes. */
function catalogIndex() {
  return categories.map((c) => `<section class="svc svc--index" id="${c.id}" data-index-label="${esc(c.name)}">
<div class="wrap">
${sectionHead({ kicker: `${c.index} · ${c.name}`, title: `${c.name}.`, lead: c.intro, aside: link({ href: c.page, label: `Découvrir : ${c.name}` }) })}
<ul class="modules-grid svc-grid" role="list">${servicesOf(c.id).map((s, i) => serviceCard(s, i)).join('')}</ul>
</div>
</section>`).join('');
}

/* Bénéfices : grille de principes (page Le studio). */
function benefitsSection(items, { kicker = 'Ce que vous y gagnez', title = 'Des bénéfices concrets.', id = 'benefices', index = 'Bénéfices' } = {}) {
  return `<section class="principles" id="${id}" data-index-label="${index}">
<div class="wrap">
${sectionHead({ kicker, title })}
<ol class="principles-grid" role="list">${items.map(([t, p], i) => `<li class="principle" data-reveal style="--d:${i}"><h3 class="h3">${pt(t)}</h3><p>${p}</p></li>`).join('')}</ol>
</div>
</section>`;
}

/* Cas d’usage : lignes « situation → réponse » (page SaaS & logiciels). */
function useCasesSection(rows, { kicker = 'Cas d’usage', title = 'Une situation. Une réponse.' } = {}) {
  return `<section class="ps" id="cas-usage" data-index-label="Cas d’usage">
<div class="wrap">
${sectionHead({ kicker, title })}
<ol class="ps-list" role="list">${rows.map(([situation, kind, answer]) => `<li class="ps-row" data-reveal>
<div class="ps-problem"><h3 class="h3">${situation}</h3></div>
<div class="ps-answer"><p class="label label--plain">${kind}</p><p>${answer}</p></div>
</li>`).join('')}</ol>
</div>
</section>`;
}

/* Services complémentaires : autres catégories du catalogue. */
function relatedSection(ids) {
  const list = ids.map((id) => categoryById[id]).filter(Boolean);
  if (!list.length) return '';
  return `<section class="svc svc--related" id="complementaires" data-index-label="Complémentaires">
<div class="wrap">
${sectionHead({ kicker: 'Services complémentaires', title: 'Un seul partenaire. Plusieurs savoir-faire.' })}
<ul class="modules-grid" role="list">${list.map((c, i) => `<li class="module" data-reveal style="--d:${i}"><h3 class="h3">${c.name}</h3><p>${c.intro}</p>${link({ href: c.page, label: `Découvrir : ${c.name}` })}</li>`).join('')}</ul>
</div>
</section>`;
}

/* Parcours « Construire mon projet numérique » : réutilise le devis guidé (aucun second formulaire). */
const parcoursHref = '/devis?parcours=projet';
function parcoursSection({ id = 'projet-complet' } = {}) {
  return `<section class="paths" id="${id}" data-index-label="Projet complet">
<div class="wrap">
<article class="path-card path-card--dark section--dark parcours-card" data-reveal>
${label('Construire mon projet numérique', 'label--plain')}
<h2 class="h2">${pt('Plusieurs besoins. Une seule demande.')}</h2>
<p class="path-text">Un site, une boutique, un logiciel, une automatisation : décrivez votre entreprise ou votre idée, cochez ce dont vous avez besoin, indiquez ce qui existe déjà, vos priorités et votre budget. Nous revenons vers vous avec une proposition d’ensemble.</p>
<ol class="node-points parcours-steps" role="list">${['Décrire votre entreprise ou votre idée', 'Choisir vos besoins', 'Préciser ce qui existe déjà', 'Indiquer vos priorités et votre budget', 'Envoyer une demande complète'].map((t, i) => `<li><span class="index-num">${String(i + 1).padStart(2, '0')}</span>${t}</li>`).join('')}</ol>
${btn({ href: parcoursHref, label: 'Construire mon projet', variant: 'light', track: 'cta-parcours' })}
</article>
</div>
</section>`;
}

/* Accueil : les catégories du catalogue et le parcours « projet complet », en grille de principes. */
function partnerSection() {
  const items = categories.map((cat) => [cat.index, `${cat.name}.`, cat.intro, link({ href: cat.page, label: 'Découvrir' })]);
  items.push([String(categories.length + 1).padStart(2, '0'), 'Votre projet complet.', 'Plusieurs besoins ? Décrivez votre projet une seule fois : nous construisons une proposition d’ensemble.', link({ href: parcoursHref, label: 'Construire mon projet', track: 'cta-parcours' })]);
  return `<section class="principles partner" id="un-seul-partenaire" data-index-label="Un seul partenaire">
<div class="wrap">
${sectionHead({ kicker: 'Un seul partenaire', title: 'Votre entreprise. Toutes vos solutions numériques.', lead: 'Du site à la boutique en ligne, du logiciel métier à l’agent IA : vos besoins numériques réunis chez un même partenaire, qui connaît votre projet de bout en bout.', aside: link({ href: '/prestations', label: 'Voir toutes nos prestations' }) })}
<ol class="principles-grid" role="list">${items.map(([n, t, p, a], i) => `<li class="principle" data-reveal style="--d:${i % 4}"><span class="principle-num">${n}</span><h3 class="h3">${pt(t)}</h3><p>${p}</p>${a}</li>`).join('')}</ol>
</div>
</section>`;
}

/* ---------- Logiciels ---------- */
function statusBadge(status) {
  const st = statuses[status];
  return `<span class="badge badge--${status}" title="${esc(st.text)}">${st.label}</span>`;
}

/* Contact « être informé » : le formulaire de contact existant, avec le sujet prérempli. */
const interestHref = (product) => `/contact?projet=crm&sujet=${encodeURIComponent(product.name)}`;

function productCard(product, i) {
  const action = product.page
    ? link({ href: product.page, label: `Découvrir ${product.name}` })
    : link({ href: interestHref(product), label: 'Parler de ce concept', track: `logiciel:interet:${product.id}` });
  return `<li class="module svc-card soft-card" id="logiciel-${product.id}" data-reveal style="--d:${i % 3}" data-status="${product.status}">
<p class="soft-head"><span class="index-num">${esc(product.category)}</span></p>
<h3 class="h3">${product.name}</h3>
<p>${product.description}</p>
<p class="soft-goals">Objectifs</p>
<ul class="node-points" role="list">${product.features.map((f) => `<li>${icon('check')}${f}</li>`).join('')}</ul>
${product.note ? `<p class="fine-print">${product.note}</p>` : ''}
<div class="svc-actions">${action}</div>
</li>`;
}

module.exports = {
  devisHref,
  servicePrice,
  serviceCard,
  serviceSection,
  categoryNav,
  catalogIndex,
  benefitsSection,
  useCasesSection,
  upcomingSection,
  relatedSection,
  parcoursSection,
  parcoursHref,
  partnerSection,
  statusBadge,
  productCard,
  interestHref,
};
