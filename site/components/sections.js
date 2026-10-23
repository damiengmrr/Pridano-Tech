/* Sections réutilisables. Tout le contenu essentiel est du HTML lisible, sans dépendre du JS. */
const { brand, expertises, method, projects, pricing, pricingTax, pricingNote, maintenance, maintenanceNote, testimonials } = require('../data/brand');
const { nodeMap, mark, ICON_BOX, nodes } = require('../lib/logo');
const { esc, icon, pt, words, btn, link, label, picture, extAttrs, newTab, price } = require('../lib/html');

function breadcrumb(name) {
  return `<nav class="breadcrumb" aria-label="Fil d’Ariane"><ol><li><a href="/">Accueil</a></li><li><span aria-current="page">${name}</span></li></ol></nav>`;
}

/* En-tête de page intérieure : le symbole sert de plan, le nœud de la page s’allume. */
function pageHero({ crumb, kicker, title, lead, actions = '', node = null, caption = '', index = 'Introduction', extra = '', media = '' }) {
  return `<section class="page-hero${media ? ' page-hero--media' : ''}" data-index-label="${index}">
<div class="wrap page-hero-grid">
<div class="page-hero-top">${breadcrumb(crumb)}</div>
<div class="page-hero-copy">
${label(kicker)}
<h1 class="h1 page-title split">${words(pt(title))}</h1>
${lead ? `<p class="lead page-lead">${lead}</p>` : ''}
${actions ? `<div class="btn-row">${actions}</div>` : ''}
</div>
${node ? `<figure class="page-hero-map" aria-hidden="true">${nodeMap(node)}<figcaption>${caption}</figcaption></figure>` : ''}
${media}
${extra}
</div>
</section>`;
}

function sectionHead({ kicker, title, lead = '', cls = '', level = 2, aside = '' }) {
  return `<header class="section-head ${cls}" data-reveal>
<div class="section-head-main">${label(kicker)}<h${level} class="h2 split">${words(pt(title))}</h${level}>${lead ? `<p class="lead">${lead}</p>` : ''}</div>
${aside ? `<div class="section-head-aside">${aside}</div>` : ''}
</header>`;
}

/*
 * « La première impression compte » : texte court à gauche ; à droite, le point de la marque
 * descend au fil de la lecture, du site découvert sur mobile jusqu’au premier appel.
 */
function firstImpression() {
  const steps = [['eye', 'Il présente votre activité'], ['shield', 'Inspire confiance'], ['cursor', 'Donne envie de vous choisir'], ['phone', 'Le premier appel']];
  return `<section class="first" id="premiere-impression" data-index-label="La première impression">
<div class="wrap first-grid">
<div class="first-copy" data-reveal>
${label('La première impression compte')}
<h2 class="h2">${pt('Avant le premier appel, il y a votre site.')}</h2>
<p class="lead">Il présente votre activité, inspire <strong>confiance</strong> et donne envie de vous <strong>choisir</strong>. Nous faisons du design et de la technique les alliés de cette première <strong>rencontre</strong>.</p>
</div>
<div class="first-visual" aria-hidden="true" data-first>
<div class="first-phone mk-phone">${picture('solaria-site-m', { decorative: true, sizes: '(min-width: 900px) 16vw, 40vw' })}</div>
<div class="first-steps"><span class="first-track"><span class="first-dot"></span></span>
<ol role="list">${steps.map(([ic, text], i) => `<li class="first-step${i === steps.length - 1 ? ' first-step--call' : ''}">${icon(ic)}<span>${text}</span></li>`).join('')}</ol>
</div>
</div>
</div>
</section>`;
}

/* Prix d’appel affiché sous une offre de l’accueil, si renseigné. */
function nodePrice(id) {
  const map = { sites: 'site', logiciels: 'saas' };
  const p = pricing.find((x) => x.id === map[id] && Number(x.from) > 0);
  return p ? `<p class="node-price">À partir de <strong>${price(p.from)}</strong> ${pricingTax}${p.delivery ? ` · livré en ${p.delivery}` : ''}</p>` : '';
}

/* Les trois nœuds du symbole = les trois offres du site (sites web, SaaS & logiciels, produit maison). */
function nodesSection() {
  const point = (p) => (Array.isArray(p) ? `<li>${icon('check')}<span><strong>${p[0]}</strong> ${p[1]}</span></li>` : `<li>${icon('check')}${p}</li>`);
  const items = expertises.map((e) => `<li class="node-item" data-node="${e.node}" id="expertise-${e.id}">
<div class="node-item-head"><span class="node-index">${e.index}</span><p class="label label--plain">${e.kicker}</p></div>
<h3 class="h3">${e.title}</h3>
<p class="node-text">${e.text}</p>
<ul class="node-points" role="list">${e.points.map(point).join('')}</ul>
${e.id === 'crm' ? '<p><span class="badge badge--dev">Produit en développement</span></p>' : ''}${nodePrice(e.id)}
${link({ href: e.href, label: e.link })}
</li>`).join('');
  const label3 = (n, text) => `<text class="nodes-fig-label nodes-fig-label--${n}" x="${nodes[n].cx}" y="${nodes[n].cy + 18}" text-anchor="middle">${text}</text>`;
  return `<section class="nodes-section" id="expertises" data-index-label="Expertises" data-nodes>
<div class="wrap">
${sectionHead({ kicker: 'Design. Développement. Impact.', title: 'Du premier échange au dernier pixel.' })}
<div class="nodes-grid">
<div class="nodes-figure" aria-hidden="true" data-nodes-figure data-active="top">
<svg class="nodes-svg" viewBox="${ICON_BOX.x - 40} ${ICON_BOX.y - 40} ${ICON_BOX.w + 80} ${ICON_BOX.h + 80}" focusable="false">
<use class="nodes-base" href="#pt-mark"/>
${['top', 'right', 'bottom', 'dot'].map((n) => `<circle class="nodes-hl nodes-hl--${n}" data-hl="${n}" cx="${nodes[n].cx}" cy="${nodes[n].cy}" r="${nodes[n].r}"/>`).join('')}
${label3('top', '01')}${label3('right', '02')}${label3('bottom', '03')}${label3('dot', '+')}
</svg>
<p class="nodes-caption" data-nodes-caption>01 · Sites web</p>
</div>
<ol class="nodes-list" role="list">
${items}
<li class="node-item node-item--you" data-node="dot" id="premier-pas">
<div class="node-item-head"><span class="node-index">+</span><p class="label label--plain">Le premier pas, simplement</p></div>
<h3 class="h3">Tout commence par un échange.</h3>
<p class="node-text">Un nouveau site, une refonte, une idée de logiciel. Racontez-nous ce que vous avez en tête.</p>
<div class="btn-row">${btn({ href: '/contact?projet=site', label: 'Démarrer un projet', track: 'cta-premier-pas:Démarrer un projet' })}${link({ href: '/devis', label: 'Vous préférez construire un brief guidé ?' })}</div>
</li>
</ol>
</div>
</div>
</section>`;
}

/* « Du dispersé au connecté » : illustration conceptuelle pilotée par le défilement ou par les boutons. */
function transformSection({ id = 'transformation', kicker, title, lead, steps, before, after, caption }) {
  const scatter = [[120, 140], [470, 110], [520, 360], [300, 270], [90, 420], [380, 500]];
  const beforeLabels = before.map((t, i) => `<g class="tf-label tf-label--before" data-i="${i}"><rect rx="16" ry="16"/><text>${esc(t)}</text></g>`).join('');
  const afterLabels = after.map((t, i) => `<g class="tf-label tf-label--after" data-i="${i}"><rect rx="16" ry="16"/><text>${esc(t)}</text></g>`).join('');
  const blobs = scatter.map(([x, y], i) => `<circle class="tf-blob" data-i="${i}" cx="${x}" cy="${y}" r="34"/>`).join('');
  const stepList = steps.map((s, i) => `<li class="tf-step${i === 0 ? ' is-active' : ''}" data-step="${i}">
<button type="button" class="tf-step-btn" aria-pressed="${i === 0}" data-step-btn="${i}"><span class="tf-step-num">${String(i + 1).padStart(2, '0')}</span><span class="tf-step-title">${s.title}</span></button>
<p>${s.text}</p>
</li>`).join('');
  return `<section class="transform" id="${id}" data-index-label="Transformation" data-transform>
<div class="transform-pin">
<div class="wrap transform-grid">
<div class="transform-copy">
${label(kicker)}
<h2 class="h2">${pt(title)}</h2>
<p class="lead">${lead}</p>
</div>
<ol class="tf-steps" role="list">${stepList}</ol>
<figure class="transform-figure">
<div class="tf-stage" aria-hidden="true">
<svg class="tf-svg" viewBox="0 0 600 600" focusable="false" data-tf-svg>
<defs>
<filter id="tf-goo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="13"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"/></filter>
<linearGradient id="tf-grad" x1="0" y1="600" x2="600" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0a78ee"/><stop offset=".55" stop-color="#08a2ff"/><stop offset="1" stop-color="#1fdcff"/></linearGradient>
</defs>
<g class="tf-grid">${Array.from({ length: 7 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="600"/><line x1="0" y1="${i * 100}" x2="600" y2="${i * 100}"/>`).join('')}</g>
<g class="tf-links" data-tf-links></g>
<g class="tf-goo" filter="url(#tf-goo)" fill="url(#tf-grad)">${blobs}</g>
<g class="tf-mark" data-tf-mark transform="translate(300 300) scale(0.36) translate(${-(ICON_BOX.x + ICON_BOX.w / 2)} ${-(ICON_BOX.y + ICON_BOX.h / 2)})"><use href="#pt-mark" fill="url(#pt-grad)"/></g>
<g class="tf-labels">${beforeLabels}${afterLabels}</g>
</svg>
</div>
<figcaption class="tf-caption"><span class="tf-state" data-tf-state>${steps[0].title}</span><span>${caption}</span></figcaption>
</figure>
</div>
</div>
</section>`;
}

function methodSection({ steps = method, kicker = 'Une collaboration sans zone floue', title = 'Vous savez où l’on va. À chaque étape.', lead = '', id = 'methode', index = 'Méthode' } = {}) {
  const items = steps.map(([t, p], i) => `<li class="method-step" data-method-step="${i}">
<span class="method-num">${String(i + 1).padStart(2, '0')}</span>
<span class="method-node" aria-hidden="true"></span>
<h3 class="h4">${t}</h3>
<p>${p}</p>
</li>`).join('');
  return `<section class="method" id="${id}" data-index-label="${index}" data-method>
<div class="method-pin">
<div class="wrap method-head">
<div>${label(kicker)}<h2 class="h2">${pt(title)}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}</div>
<p class="method-count" aria-hidden="true"><span data-method-current>01</span> / ${String(steps.length).padStart(2, '0')}</p>
</div>
<div class="method-viewport">
<ol class="method-track" role="list" data-method-track style="--steps:${steps.length}">
<span class="method-rail" aria-hidden="true"><span class="method-rail-fill"></span><span class="method-traveller"></span></span>
${items}
</ol>
</div>
</div>
</section>`;
}

/* Liste typographique des réalisations ; aperçu qui suit le curseur sur desktop. */
function workSection({ list = projects, head = true, kicker = 'Une sélection, du concret', title = 'Le travail parle.' } = {}) {
  const rows = list.map((p, i) => `<li class="work-row" data-work-row="${p.id}">
<a class="work-link" href="${p.href}"${extAttrs(p.href)} data-cursor="Voir" data-umami-event="realisation:${p.id}">
<span class="work-index">${String(i + 1).padStart(2, '0')}</span>
<span class="work-name">${p.name}</span>
<span class="work-type">${p.type}</span>
<span class="work-go" aria-hidden="true">${icon('arrow-up-right')}</span>${newTab(p.href)}
</a>
${picture(p.site || p.image, { alt: p.site ? p.siteAlt : p.alt, sizes: '(min-width: 900px) 30vw, 92vw', cls: 'work-thumb' })}
</li>`).join('');
  return `<section class="work" id="realisations" data-index-label="Réalisations" data-work>
<div class="wrap">
${head ? sectionHead({ kicker, title, aside: link({ href: '/realisations', label: 'Toutes les réalisations' }) }) : ''}
<ol class="work-list" role="list">${rows}</ol>
</div>
<div class="work-preview" aria-hidden="true" data-work-preview>${list.map((p) => picture(p.site || p.image, { decorative: true, sizes: '420px', cls: 'work-preview-img', attrs: `data-preview="${p.id}"` })).join('')}</div>
</section>`;
}

function osTeaser({ kicker = 'Notre produit maison', title = 'Nous construisons aussi le nôtre.', lead = 'Pridano. Votre entreprise. Un seul logiciel.', cta = 'Découvrir la vision produit' } = {}) {
  return `<section class="os section--dark" id="business-os" data-index-label="Notre produit maison" data-index-dark>
<div class="wrap os-grid">
<div class="os-copy" data-reveal>
${label(kicker)}
<h2 class="h2">${pt(title)}</h2>
<p class="lead">${lead}</p>
<p><span class="badge badge--dev">Produit en développement</span></p>
<div class="btn-row">${btn({ href: '/crm', label: cta, variant: 'light' })}</div>
</div>
<figure class="os-figure" data-tilt>
<div class="os-frame">
<div class="os-frame-bar" aria-hidden="true"><span></span><span></span><span></span><b>pridano · Workspace</b></div>
${picture('dashboard', { alt: 'Vue d’ensemble réelle de Pridano, cadrée sur les indicateurs et les connexions entre clients, devis et projets.', sizes: '(min-width: 1000px) 55vw, 92vw' })}
</div>
<figcaption>Captures de développement · Données de démonstration</figcaption>
</figure>
</div>
</section>`;
}

/* « Pourquoi Pridano » : les quatre principes et les personnes du studio (accueil). */
const principles = [
  ['Le fond et la forme.', 'Votre image mérite la même attention que le fonctionnement de votre site.'],
  ['Une vraie profondeur technique.', 'Sites, applications et produits maison : nous pensons aussi à ce qui se passe derrière l’écran.'],
  ['Un projet lisible.', 'Un périmètre défini ensemble, des étapes de validation et une mise en ligne préparée.'],
  ['Une suite possible.', 'Votre site peut évoluer avec vos outils, vos intégrations et les besoins de votre entreprise.'],
];

function studioSection() {
  const people = brand.founders.map((f) => `<li class="person" data-reveal style="--d:${f.id === 'noah-lemoing' ? 2 : 0}">
${picture(f.image, { alt: f.name, sizes: '(min-width: 900px) 22vw, 45vw', cls: 'person-photo' })}
<h3 class="h4">${f.name}</h3>
<p class="muted small">${f.role}</p>
</li>`).join('');
  const list = principles.map(([t, p], i) => `<li><span class="index-num">${String(i + 1).padStart(2, '0')}</span><h3 class="h4">${pt(t)}</h3><p>${p}</p></li>`).join('');
  return `<section class="studio" id="studio" data-index-label="Pourquoi Pridano">
<div class="wrap studio-grid">
<div class="studio-copy" data-reveal>
${label('Pourquoi Pridano')}
<h2 class="h2">${pt('Une belle image. Des bases solides.')}</h2>
<ol class="mini-principles" role="list">${list}</ol>
</div>
<div class="studio-people">
<ul class="people" role="list">${people}</ul>
<p class="studio-caption">Du design au développement, <br>des personnes derrière chaque décision.</p>
${link({ href: '/a-propos', label: 'Rencontrer le studio' })}
</div>
</div>
</section>`;
}

function faqSection(items, { kicker = 'Questions fréquentes', title = 'Les réponses, sans détour.', id = 'questions' } = {}) {
  const list = items.map(([q, a]) => `<details><summary><span>${q}</span><span class="faq-icon" aria-hidden="true"></span></summary><div class="faq-answer"><p>${a}</p></div></details>`).join('');
  return `<section class="faq-section" id="${id}" data-index-label="Questions">
<div class="wrap faq-grid">
${sectionHead({ kicker, title })}
<div class="faq">${list}</div>
</div>
</section>`;
}

/* Appel final du site existant : « Le prochain lien, c’est le vôtre. » */
function finalCta({
  kicker = 'Le prochain lien, c’est le vôtre.',
  title = 'Votre prochain site. Le début de quelque chose.',
  primary = { href: '/contact?projet=site', label: 'Démarrer un projet' },
  note = 'Une image juste. <br>Une première impression qui reste.',
  tagline = 'Une idée. Un échange. Une connexion.',
  aside = { href: '/saas', label: 'Vous cherchez plutôt un logiciel ?' },
} = {}) {
  return `<section class="final" id="contact-final" data-index-label="Contact" data-final>
<div class="final-orbit" aria-hidden="true"><span class="final-dot" data-final-dot></span>${mark({ cls: 'final-mark', fill: 'url(#pt-grad)' })}</div>
<div class="wrap final-inner">
${label(kicker)}
<h2 class="display final-title">${pt(title)}</h2>
<div class="final-actions">${btn({ href: primary.href, label: primary.label, attrs: 'data-final-target', track: `cta-final:${primary.label}` })}${brand.bookingUrl ? btn({ href: brand.bookingUrl, label: 'Prendre rendez-vous', variant: 'ghost', track: 'prise-rdv' }) : ''}${note ? `<p class="final-note">${note}</p>` : ''}</div>
${tagline || aside ? `<div class="final-bottom">${tagline ? `<span>${tagline}</span>` : ''}${aside ? link({ href: aside.href, label: aside.label }) : ''}</div>` : ''}
</div>
</section>`;
}

/*
 * Prix d’appel « à partir de » : rendu uniquement pour les offres dont le montant
 * est renseigné dans site/data/brand.js (pricing). Sinon, rien n’est affiché.
 */
function pricingSection({ ids, title = 'Combien coûte un site web ?', cta = 'Démarrer un projet' }) {
  const items = pricing.filter((p) => ids.includes(p.id) && Number(p.from) > 0);
  if (!items.length) return '';
  const cards = items.map((p) => `<li class="price-card" data-reveal>
<p class="label label--plain">${p.label}</p>
<p class="price-from"><span>À partir de</span> <strong>${price(p.from)}</strong> <span>${pricingTax}</span></p>
${p.delivery ? `<p class="price-delay">${icon('clock')}Livré en ${p.delivery}</p>` : ''}
${p.perks?.length ? `<ul class="care-list price-perks" role="list">${p.perks.map((f) => `<li>${icon('check')}${f}</li>`).join('')}</ul>` : ''}
${p.note ? `<p class="fine-print">${esc(p.note)}</p>` : ''}
${btn({ href: p.href, label: cta, variant: 'ghost', size: 'sm', track: `cta-tarif:${p.id}` })}
</li>`).join('');
  return `<section class="pricing" id="tarifs" data-index-label="Tarifs">
<div class="wrap">
${sectionHead({ kicker: 'Parlons concrètement', title, lead: 'Le prix dépend du nombre de pages, du travail de design, des contenus et des fonctionnalités. Nous définissons le périmètre avec vous avant de préparer une proposition adaptée.' })}
<ul class="price-grid" role="list">${cards}</ul>
${pricingNote ? `<p class="fine-print price-note">${esc(pricingNote)}</p>` : ''}
</div>
</section>`;
}

/* Maintenance après la mise en ligne : trois formules sans engagement, si renseignées. */
function maintenanceSection() {
  if (!maintenance.length) return '';
  const cards = maintenance.map((m, i) => `<li class="care-card${m.featured ? ' care-card--featured on-dark' : ''}" data-reveal style="--d:${i}">
<p class="care-head"><span class="label label--plain">${m.name}</span>${m.featured ? '<span class="care-tag">Conseillé</span>' : ''}</p>
<p class="price-from"><strong>${price(m.price)}</strong> <span>${pricingTax} / mois</span></p>
<ul class="care-list" role="list">${m.features.map((f) => `<li>${icon('check')}${f}</li>`).join('')}</ul>
</li>`).join('');
  return `<section class="care" id="maintenance" data-index-label="Maintenance">
<div class="wrap">
${sectionHead({ kicker: 'Après la mise en ligne', title: 'Un site suivi. Sans engagement.', lead: 'Hébergement, sécurité et mises à jour : choisissez le suivi qui correspond à votre activité, et changez de formule quand vous le souhaitez.' })}
<ul class="care-grid" role="list">${cards}</ul>
<div class="care-foot">${btn({ href: '/contact?projet=site', label: 'Parler du suivi de mon site', variant: 'ghost', track: 'cta-maintenance' })}<p class="fine-print">${maintenanceNote ? `${esc(maintenanceNote)} ` : ''}Prix ${pricingTax} par mois, sans durée minimale.</p></div>
</div>
</section>`;
}

/* Repère de maintenance pour la FAQ. */
function maintenanceHint() {
  if (!maintenance.length) return '';
  return ` Pour repère : la première année d’hébergement est offerte, puis la maintenance est sans engagement, à partir de ${price(Math.min(...maintenance.map((m) => m.price)))} ${pricingTax} par mois.`;
}

/* Phrase de repère ajoutée à la réponse « Combien coûte un site web ? » quand des prix existent. */
function pricingHint(ids) {
  const items = pricing.filter((p) => ids.includes(p.id) && Number(p.from) > 0);
  if (!items.length) return '';
  return ` Pour repère : ${items.map((p) => `${p.label.toLowerCase()} à partir de ${price(p.from)} ${pricingTax}`).join(', ')}.`;
}

/* Témoignages réels (brand.js → testimonials). Section absente tant qu’il n’y en a pas. */
function testimonialsSection({ project = null } = {}) {
  const list = testimonials.filter((t) => t.quote && t.name && (!project || t.project === project));
  if (!list.length) return '';
  const items = list.map((t, i) => `<li class="quote-card" data-reveal style="--d:${i}">
<blockquote><p>« ${esc(t.quote)} »</p></blockquote>
<p class="quote-author"><strong>${esc(t.name)}</strong>${t.role || t.company ? `<span>${esc([t.role, t.company].filter(Boolean).join(' · '))}</span>` : ''}</p>
</li>`).join('');
  return `<section class="quotes" id="temoignages" data-index-label="Témoignages">
<div class="wrap">
${sectionHead({ kicker: 'Témoignages', title: 'Ce qu’en disent nos clients.' })}
<ul class="quote-grid" role="list">${items}</ul>
</div>
</section>`;
}

module.exports = { pricingSection, pricingHint, maintenanceSection, maintenanceHint, testimonialsSection, breadcrumb, pageHero, sectionHead, firstImpression, nodesSection, transformSection, methodSection, workSection, osTeaser, studioSection, faqSection, finalCta };
