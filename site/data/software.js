/*
 * CATALOGUE 2 — Pridano Software : les logiciels développés par Pridano Tech.
 * Source unique de la page /logiciels et des pages /logiciels/<id>.
 * Procédure d’ajout et règles de statut : CATALOGUES.md.
 *
 * Règles (vérifiées par tests/catalog.test.js) :
 *  - `status` : concept | developpement | beta | disponible. Jamais « disponible » sans
 *    lien d’inscription réel ET formules validées ; jamais « beta » sans accès de test réel.
 *  - `screenshots` : uniquement des captures réelles du produit (aucune maquette présentée comme réelle).
 *  - `plans` : uniquement des tarifs validés par les fondateurs. Vide = aucun prix affiché.
 *  - `page` : URL de la page dédiée du produit ; `publishPage: true` génère /logiciels/<id>
 *    pour expliquer factuellement le concept, sans annoncer une disponibilité.
 *  - Les noms ci-dessous sont des noms de travail : ce ne sont pas des marques déposées.
 */
/*
 * Libellés publics : les logiciels pas encore prêts sont présentés comme « à venir » (un projet assumé),
 * sans détailler leur stade interne. Le statut reste utilisé pour les règles d’honnêteté ci-dessus.
 */
const statuses = {
  concept: { label: 'À venir', text: 'En préparation, pas encore commercialisé.' },
  developpement: { label: 'À venir', text: 'En préparation, pas encore commercialisé.' },
  beta: { label: 'Bêta', text: 'Version de test réelle, ouverte à un nombre limité d’utilisateurs.' },
  disponible: { label: 'Disponible', text: 'Produit commercialisé : inscription et tarifs publiés.' },
};

const products = [
  {
    id: 'business-os',
    name: 'Pridano CRM',
    category: 'Relation client',
    status: 'developpement',
    tagline: 'Votre entreprise. Un seul logiciel.',
    description: 'Notre produit maison porte une idée simple : relier la relation client et le travail qui en découle.',
    features: ['Relation commerciale : prospects, clients, pipeline et devis', 'Opérations : projets, planning et coordination', 'Gestion : catalogue, stock et facturation'],
    /* Captures réelles de développement (données de démonstration), déjà publiées sur /crm. */
    screenshots: ['dashboard', 'factures', 'planning'],
    plans: [],
    faq: [],
    docsUrl: '',
    signupUrl: '',
    page: '/crm',
    publishPage: false,
    /* Présenté avec le bloc produit existant du site (capture réelle, lien vers /crm). */
    teaser: true,
  },
  {
    id: 'finance',
    name: 'Pridano Finance',
    category: 'Finance',
    status: 'concept',
    tagline: 'Suivre sa trésorerie, simplement.',
    description: 'Un outil de suivi financier pour visualiser la trésorerie, les dépenses et les recettes, et anticiper les mois à venir.',
    features: ['Trésorerie', 'Dépenses et recettes', 'Prévisions simples', 'Indicateurs financiers'],
    note: 'Outil de suivi, pas un logiciel de comptabilité ni de facturation conforme à la réglementation.',
    screenshots: [],
    plans: [],
    faq: [],
    docsUrl: '',
    signupUrl: '',
    page: '/logiciels/finance',
    publishPage: true,
  },
  {
    id: 'booking',
    name: 'Pridano Booking',
    category: 'Réservations',
    status: 'concept',
    tagline: 'Des rendez-vous sans allers-retours.',
    description: 'La prise de rendez-vous en ligne, reliée à vos disponibilités et à votre calendrier.',
    features: ['Rendez-vous en ligne', 'Disponibilités', 'Calendrier', 'Rappels'],
    screenshots: [],
    plans: [],
    faq: [],
    docsUrl: '',
    signupUrl: '',
    page: '/logiciels/booking',
    publishPage: true,
  },
];

const productById = Object.fromEntries(products.map((p) => [p.id, p]));

module.exports = { statuses, products, productById };
