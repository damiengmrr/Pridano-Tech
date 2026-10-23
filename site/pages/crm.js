const { icon, pt, btn, label, picture } = require('../lib/html');
const s = require('../components/sections');
const { heroMedia } = require('../components/hero-media');

const screens = [
  { id: 'dashboard', tab: 'Pilotez', title: 'Le quotidien, en plus clair.', text: 'Clients, devis, projets et montants à encaisser : une vue pour retrouver le fil de votre activité.', alt: 'Vue d’ensemble réelle de Pridano Business OS, avec les indicateurs et les connexions entre clients, devis et projets.' },
  { id: 'factures', tab: 'Facturez', title: 'De l’accord au règlement.', text: 'Retrouvez les factures issues des devis acceptés et les montants restant à régler, dans la continuité du travail engagé.', alt: 'Écran réel des factures Pridano montrant une facture et son montant restant dû.' },
  { id: 'planning', tab: 'Planifiez', title: 'Le travail trouve sa place.', text: 'Rendez-vous, interventions et équipes se retrouvent dans un planning relié à votre activité.', alt: 'Planning réel de Pridano, avec les filtres d’équipe et une intervention dans le calendrier.' },
  { id: 'login', tab: 'Centralisez', title: 'Toutes les bonnes connexions.', text: 'Un espace pour reprendre le fil. Du premier contact au projet livré, Pridano porte une même idée : garder le contexte.', alt: 'Écran de connexion Pridano : « Votre entreprise. Toutes les bonnes connexions. »' },
];

function theater() {
  const tabs = screens.map((sc, i) => `<button type="button" role="tab" id="tab-${sc.id}" aria-controls="panel-${sc.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${i}"><span class="index-num">${String(i + 1).padStart(2, '0')}</span>${sc.tab}</button>`).join('');
  const panels = screens.map((sc, i) => `<div class="theater-panel" role="tabpanel" id="panel-${sc.id}" aria-labelledby="tab-${sc.id}" tabindex="0"${i === 0 ? '' : ' hidden'} data-panel="${i}">
<div class="theater-text"><h3 class="h3">${pt(sc.title)}</h3><p>${sc.text}</p><a class="link" href="/assets/img/product/${sc.id}.png" target="_blank" rel="noopener">Agrandir la capture<span class="visually-hidden"> ${sc.tab} (image originale, nouvel onglet)</span>${icon('expand')}</a></div>
<div class="theater-shot">${picture(sc.id, { alt: sc.alt, sizes: '(min-width: 1000px) 62vw, 94vw', loading: i === 0 ? 'eager' : 'lazy' })}</div>
</div>`).join('');
  return `<section class="theater section--dark" id="produit" data-index-label="Le produit" data-index-dark data-theater>
<div class="wrap">
<div class="theater-head"><h2 class="label">Le produit, de l’intérieur</h2><p class="theater-note"><span class="badge badge--dev">Captures de développement · données de démonstration</span></p></div>
<div class="theater-tabs" role="tablist" aria-label="Écrans de Pridano Business OS">${tabs}</div>
${panels}
</div>
</section>`;
}

function workflow() {
  const names = ['Prospect', 'Devis', 'Acceptation', 'Projet', 'Planning', 'Stock', 'Facture'];
  return `<section class="flow" id="parcours" data-index-label="Parcours" data-flow>
<div class="wrap">
${s.sectionHead({ kicker: 'Un produit, une conviction', title: 'L’information avance. Avec votre activité.', lead: 'Un prospect devient un client. Une proposition devient un projet. Notre vision : préserver le fil entre ces étapes, au lieu de le reconstruire d’un outil à l’autre.' })}
<div class="flow-track" data-flow-track>
<span class="flow-line" aria-hidden="true"><span class="flow-line-fill"></span></span>
<ol class="flow-nodes" role="list">${names.map((n, i) => `<li class="flow-node" data-flow-node="${i}"><span class="flow-dot" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="flow-name">${n}</span></li>`).join('')}</ol>
</div>
<p class="fine-print">Parcours cible illustré. Disponibilité des modules à confirmer lors de l’échange.</p>
</div>
</section>`;
}

function modules() {
  const items = [
    ['Relation commerciale', 'Prospects, clients, pipeline et devis. Du premier échange à la proposition.'],
    ['Opérations', 'Projets, planning et coordination. De l’accord au travail à réaliser.'],
    ['Gestion', 'Catalogue, stock et facturation. Relier les ressources au suivi de l’activité.'],
  ];
  return `<section class="modules" id="modules" data-index-label="Modules">
<div class="wrap">
${s.sectionHead({ kicker: 'La vision des modules', title: 'Relier les étapes. Garder le contexte.', lead: 'Les domaines ci-dessous décrivent l’ambition du produit. Ils ne constituent pas une liste de fonctionnalités commercialisées.' })}
<ul class="modules-grid" role="list">${items.map(([t, p], i) => `<li class="module" data-reveal style="--d:${i}"><span class="index-num">${String(i + 1).padStart(2, '0')} · Vision produit</span><h3 class="h3">${t}</h3><p>${p}</p></li>`).join('')}</ul>
</div>
</section>`;
}

function ask() {
  const qs = ['Quels devis dois-je relancer ?', 'Quels produits passent sous le seuil ?', 'Que s’est-il passé avec ce client ?'];
  return `<section class="ask section--dark" id="ask" data-index-label="Ask" data-index-dark>
<div class="wrap ask-grid">
<div class="ask-copy" data-reveal>
${label('Ask · Piste d’exploration')}
<h2 class="h2">${pt('Demandez à votre entreprise.')}</h2>
<p class="lead">Et si retrouver une information commençait par une question ? Nous explorons cette idée dans le cadre du Business OS.</p>
<p class="fine-print">Les exemples illustrent une intention de conception. Aucun assistant opérationnel n’est proposé sur cette page.</p>
</div>
<div class="ask-demo" aria-hidden="true">
<p class="ask-tag">Concept Ask</p>
${qs.map((q, i) => `<p class="ask-q" style="--d:${i}">${q}</p>`).join('')}
<p class="ask-a">Une question. Le bon contexte.</p>
</div>
</div>
</section>`;
}

module.exports = {
  title: 'Pridano Business OS — Notre CRM en développement',
  description: 'Découvrez la vision de Pridano Business OS, notre produit maison en développement : réunir le parcours commercial et opérationnel dans un seul système.',
  crumb: 'Le produit Pridano',
  body: () => `${s.pageHero({
    crumb: 'Le produit Pridano',
    kicker: '03 Pridano · Business OS en développement',
    title: 'Votre entreprise. Un seul logiciel.',
    lead: 'Notre produit maison porte une idée simple : relier la relation client et le travail qui en découle.',
    actions: `${btn({ href: '/contact?projet=crm', label: 'Échanger sur le produit' })}<span class="badge badge--dev">En développement · périmètre et accès à confirmer</span>`,
    media: heroMedia.os(),
  })}
${theater()}
${workflow()}
${modules()}
${ask()}
${s.finalCta({ kicker: 'Pridano · Business OS', title: 'Parlons de votre usage.', primary: { href: '/contact?projet=crm', label: 'Échanger sur Pridano' }, note: 'Un échange pour découvrir la vision du produit, <br>son avancement et les possibilités de démonstration.', tagline: null, aside: null })}`,
};
