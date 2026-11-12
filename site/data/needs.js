/*
 * Besoins proposés dans le devis guidé (sélection multiple) et question adaptée à chacun.
 * Source unique, lue à la fois par le site (sélecteur de la page /devis, liens des catalogues)
 * et par le serveur (moteur de cadrage : server/utils/project-brief.js).
 *
 * Ajouter un besoin : une entrée ici suffit. `profile` rattache le besoin à un profil existant
 * du moteur (formulation des questions communes) ; `question` est posée une fois le besoin coché.
 */
const needs = [
  {
    id: 'site-vitrine',
    label: 'Site vitrine',
    profile: 'site_vitrine',
    question: {
      question: 'Pour le site : combien de pages environ, et que doit-il permettre ? Les textes et photos sont-ils prêts ?',
      placeholder: 'Ex. 5 pages, formulaire de devis, galerie photos, textes à rédiger avec vous.',
      quickReplies: ['Une seule page', '3 à 5 pages', '6 à 10 pages', 'Prise de rendez-vous', 'Contenus prêts', 'Contenus à créer'],
    },
  },
  {
    id: 'e-commerce',
    label: 'Site e-commerce',
    profile: 'ecommerce',
    question: {
      question: 'Pour la boutique : combien de produits, comment encaisser et comment livrer ?',
      placeholder: 'Ex. 80 produits, paiement par carte, livraison et retrait en boutique.',
      quickReplies: ['Moins de 50 produits', '50 à 500 produits', 'Plus de 500 produits', 'Paiement en ligne', 'Livraison et retrait'],
    },
  },
  {
    id: 'refonte',
    label: 'Refonte',
    profile: 'refonte',
    question: {
      question: 'Pour la refonte : quelle est l’adresse du site actuel, et qu’est-ce qui ne vous convient plus ?',
      placeholder: 'Ex. monsite.fr : design daté, difficile à modifier, peu de demandes de contact.',
      quickReplies: ['Design daté', 'Pas adapté au mobile', 'Difficile à modifier', 'Peu de demandes', 'Trop lent'],
    },
  },
  {
    id: 'automatisation',
    label: 'Automatisation',
    profile: 'automatisation',
    question: {
      question: 'Pour l’automatisation : qu’est-ce qui déclenche le processus, quelles applications faut-il relier, et que doit-il se passer ensuite ?',
      placeholder: 'Ex. un devis signé crée le client dans le CRM, prépare la facture et prévient l’équipe.',
      quickReplies: ['Formulaire ou email entrant', 'Nouvelle commande', 'Devis signé', 'Google Workspace / Microsoft 365', 'CRM', 'Facturation / comptabilité'],
    },
  },
  {
    id: 'agent-ia',
    label: 'Agent IA',
    profile: 'integration_ia',
    question: {
      question: 'Pour l’agent IA : quelles missions lui confier, à partir de quelles données, avec quels outils, et qui valide ses réponses ?',
      placeholder: 'Ex. répondre aux questions fréquentes à partir de nos fiches produits, avec relecture humaine des cas complexes.',
      quickReplies: ['Répondre aux questions clients', 'Qualifier des demandes', 'Rechercher dans nos documents', 'Préparer des réponses à valider', 'Connexion à nos outils'],
    },
  },
  {
    id: 'application',
    label: 'Application web ou mobile',
    profile: 'saas',
    question: {
      question: 'Pour l’application : web, mobile ou les deux ? Qui l’utilisera, et pour faire quoi en priorité ?',
      placeholder: 'Ex. application mobile pour nos techniciens : consulter les interventions et prendre des photos.',
      quickReplies: ['Application web', 'Application mobile', 'Les deux', 'Pour nos clients', 'Pour notre équipe'],
    },
  },
  {
    id: 'logiciel-metier',
    label: 'Logiciel métier',
    profile: 'outil_interne',
    question: {
      question: 'Pour le logiciel métier : quel processus voulez-vous outiller, et avec quoi travaillez-vous aujourd’hui ?',
      placeholder: 'Ex. suivi des chantiers et des devis, aujourd’hui sur Excel et par email.',
      quickReplies: ['Devis et factures', 'Planning', 'Stock', 'Suivi de chantiers ou de projets', 'Excel aujourd’hui'],
    },
  },
  {
    id: 'saas-sur-mesure',
    label: 'SaaS sur mesure',
    profile: 'saas',
    question: {
      question: 'Pour le SaaS : qui seront les utilisateurs, quelles fonctions sont indispensables, quelles données seront gérées, et comment sera-t-il vendu ?',
      placeholder: 'Ex. des cabinets clients, trois rôles d’accès, données clients sensibles, abonnement mensuel.',
      quickReplies: ['Clients professionnels', 'Particuliers', 'Plusieurs rôles d’accès', 'Abonnement mensuel', 'Données sensibles'],
    },
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    profile: 'custom',
    question: {
      question: 'Pour la maintenance : quel site ou outil faut-il suivre, où est-il hébergé, et avez-vous besoin de modifications régulières ?',
      placeholder: 'Ex. site existant hébergé chez un autre prestataire, quelques mises à jour par mois.',
      quickReplies: ['Site créé par Pridano', 'Site existant ailleurs', 'Je ne sais pas où il est hébergé', 'Modifications régulières'],
    },
  },
  {
    id: 'projet-complet',
    label: 'Projet numérique complet',
    profile: 'custom',
    question: {
      question: 'Pour votre projet numérique : par quoi faut-il commencer ? Quelles sont vos priorités ?',
      placeholder: 'Ex. d’abord le site pour l’ouverture, puis l’outil de devis dans un second temps.',
      quickReplies: ['D’abord le site', 'D’abord la boutique', 'D’abord les outils internes', 'Tout en même temps', 'À définir ensemble'],
    },
  },
];

const needById = Object.fromEntries(needs.map((n) => [n.id, n]));

/* Ne garde que les besoins connus, sans doublon, dans l’ordre du catalogue ; « projet complet » en dernier. */
function normalizeNeeds(list) {
  const wanted = new Set((Array.isArray(list) ? list : String(list || '').split(',')).map((id) => String(id).trim()).filter((id) => needById[id]));
  return needs.map((n) => n.id).filter((id) => wanted.has(id));
}

/* Libellé lisible d’une sélection, pour le type de projet du brief. */
function needsLabel(list) {
  const ids = normalizeNeeds(list);
  if (!ids.length) return '';
  const labels = ids.filter((id) => id !== 'projet-complet').map((id) => needById[id].label);
  if (ids.includes('projet-complet')) return labels.length ? `Projet numérique complet : ${labels.join(', ')}` : 'Projet numérique complet';
  return labels.join(' + ');
}

module.exports = { needs, needById, normalizeNeeds, needsLabel };
