/*
 * Source unique des informations factuelles sur Pridano Tech.
 * Chaque donnée provient du site existant (ZIP fourni, octobre 2026) ou du brief client.
 * Voir CONTENT-VERIFICATION.md avant d’ajouter ou de modifier une information.
 */
const brand = {
  name: 'Pridano Tech',
  shortName: 'Pridano',
  alternateNames: ['Pridano', 'PridanoTech', 'Pridanotech'],
  email: 'pridanotech@gmail.com',
  city: 'Montpellier',
  country: 'France',
  countryCode: 'FR',
  coordinates: '43°36′ N · 3°52′ E',
  tagline: 'Des sites qui marquent. Des outils qui font avancer.',
  description: 'Pridano crée des sites web sur mesure qui renforcent votre image. Studio à Montpellier : création, refonte, SaaS et logiciels métier.',
  logoPng: '/assets/brand/pridano-tech-logo-512.png',
  /*
   * ───── À COMPLÉTER PAR L’ÉQUIPE ─────
   * Tant qu’un champ est vide, l’élément correspondant n’apparaît pas sur le site
   * (aucune valeur inventée). Dès qu’il est rempli, `npm run build` l’affiche partout :
   * pages, pied de page, données structurées Google.
   */
  phone: '07 78 70 25 18', // affiché tel quel ; le lien tel: est calculé
  bookingUrl: 'https://calendly.com/pridanotech',
  sameAs: ['https://www.linkedin.com/in/pridano-tech-7666483a8/', 'https://www.instagram.com/pridanotech/'], // profils officiels (brief client, octobre 2026)
  legal: {
    denomination: '', // ex. 'Pridano Tech'
    forme: '', // ex. 'SAS au capital de 1 000 €' ou 'Entreprise individuelle (micro-entreprise)'
    siege: '', // adresse postale complète du siège
    siren: '', // ex. 'SIREN 123 456 789' ou 'SIRET 123 456 789 00012'
    rcs: '', // ex. 'RCS Montpellier' (si société)
    tva: '', // n° de TVA intracommunautaire, ou 'TVA non applicable, art. 293 B du CGI'
    directeurPublication: '', // ex. 'Damien Gamarra'
    /* Hébergeur vérifié : en-tête « Server: Netlify » de pridanotech.fr ; adresse publiée par Netlify. */
    hebergeur: { nom: 'Netlify, Inc.', adresse: '101 2nd Street, San Francisco, CA 94105, États-Unis', site: 'https://www.netlify.com' },
  },
  founders: [
    {
      id: 'damien-gamarra',
      name: 'Damien Gamarra',
      role: 'Design & frontend',
      bio: 'Direction artistique, interfaces et développement frontend. Une attention particulière à l’identité visuelle et à la qualité de chaque écran.',
      url: 'https://damiengamarra.com',
      image: 'damien',
    },
    {
      id: 'noah-lemoing',
      name: 'Noah Lemoing',
      role: 'Produit & intégration',
      bio: 'Cadrage du besoin, développement et intégration. Faire le lien entre un usage concret et une base technique exploitable.',
      url: null,
      image: 'noah',
    },
  ],
};

/*
 * Les trois nœuds du symbole = les trois offres présentées sur le site existant
 * (première expertise, deuxième expertise, produit maison). Textes repris tels quels.
 */
const expertises = [
  {
    id: 'sites',
    node: 'top',
    index: '01',
    href: '/sites-web',
    name: 'Sites web',
    kicker: 'Notre première expertise',
    nav: 'Notre cœur de métier',
    title: 'Votre site. À son meilleur niveau.',
    text: 'Une création ou une refonte. Une présence qui vous ressemble.',
    points: [
      ['Une image juste.', 'Une direction artistique sur mesure pour exprimer votre singularité et rendre votre offre évidente.'],
      ['Chaque écran compte.', 'Des parcours conçus pour le mobile, la tablette et le desktop. Agréables à lire, simples à utiliser.'],
      ['Le détail fait la différence.', 'Des interactions précises, un chargement soigné et des bases SEO propres pour servir votre activité.'],
    ],
    link: 'Découvrir l’offre web',
  },
  {
    id: 'logiciels',
    node: 'right',
    index: '02',
    href: '/saas',
    name: 'SaaS & logiciels',
    kicker: 'Notre deuxième expertise',
    nav: 'Notre deuxième expertise',
    title: 'Parfois, un site ne suffit pas.',
    text: 'Quand les fichiers s’accumulent et que vos outils ne se parlent plus, nous concevons le logiciel qui remet votre activité en mouvement.',
    points: ['Outils internes & logiciels métier', 'SaaS & applications web', 'API, intégrations & automatisations', 'Dashboards & pilotage'],
    link: 'SaaS & logiciels sur mesure',
  },
  {
    id: 'crm',
    node: 'bottom',
    index: '03',
    href: '/crm',
    name: 'Le produit Pridano',
    kicker: 'Notre produit maison',
    nav: 'Produit en développement',
    title: 'Pridano. Votre entreprise. Un seul logiciel.',
    text: 'Notre produit maison porte une idée simple : relier la relation client et le travail qui en découle.',
    points: ['Relation commerciale', 'Opérations', 'Gestion'],
    link: 'Découvrir la vision produit',
  },
];

/*
 * Prix d’appel « à partir de ». Vide = non affiché.
 * Le libellé reprend les offres du site existant.
 * pricingTax : 'HT' si vous facturez la TVA ; 'TTC' (avec une note « TVA non applicable,
 * art. 293 B du CGI ») si vous êtes en franchise de TVA.
 */
const pricing = [
  { id: 'site', label: 'Création de site web', from: 990, delivery: '3 à 5 jours', href: '/contact?projet=site' },
  { id: 'refonte', label: 'Refonte de site web', from: 790, delivery: '3 à 5 jours', href: '/contact?projet=refonte' },
  { id: 'saas', label: 'SaaS & logiciel sur mesure', from: 3900, href: '/contact?projet=saas' },
];
const pricingTax = 'HT';
const pricingNote = 'Le périmètre exact est précisé dans la proposition, avant tout engagement.'; // ex. 'Prix HT, contenu et périmètre précisés dans la proposition.'

/*
 * Maintenance après la mise en ligne (brief client, octobre 2026) : sans engagement, prix HT par mois.
 * Vide = section masquée.
 */
const maintenance = [
  { id: 'essentiel', name: 'Essentiel', price: 29, features: ['Hébergement et certificat HTTPS', 'Sauvegardes', 'Surveillance de la disponibilité', 'Corrections techniques'] },
  { id: 'serenite', name: 'Sérénité', price: 59, featured: true, features: ['Tout le forfait Essentiel', '1 h de modifications par mois', 'Rapport mensuel : audience et performance'] },
  { id: 'croissance', name: 'Croissance', price: 119, features: ['Tout le forfait Sérénité', '3 h de modifications par mois', 'Suivi SEO et fiche Google Business Profile'] },
];

/*
 * Témoignages clients réels, avec l’accord écrit de la personne. Vide = section masquée.
 * { quote: '…', name: 'Prénom N.', role: 'Fonction', company: 'Structure', project: 'solaria' | 'ppg' }
 */
const testimonials = [];

/* Méthode de collaboration (site existant, page Sites web). */
const method = [
  ['Découverte', 'Nous parlons de votre entreprise, de votre offre et de vos visiteurs.'],
  ['Stratégie', 'Nous définissons les objectifs, le périmètre et les contenus à préparer.'],
  ['Direction artistique', 'Nous posons un univers visuel cohérent avec votre positionnement.'],
  ['Conception', 'Nous dessinons les pages et les parcours avant le développement.'],
  ['Développement', 'Nous construisons les interfaces, les interactions et les connexions utiles.'],
  ['Validation', 'Nous vérifions ensemble les contenus, les écrans et les fonctionnalités.'],
  ['Mise en ligne', 'Nous préparons le lancement, les redirections et les réglages techniques.'],
  ['Suivi', 'Nous définissons les besoins de maintenance et les évolutions à venir.'],
];

/* Méthode logiciels (site existant, page SaaS). */
const softwareMethod = [
  ['Analyse', 'Observer vos usages, les points de friction et les contraintes.'],
  ['UX', 'Dessiner les parcours autour des personnes qui utiliseront le logiciel.'],
  ['Architecture', 'Définir les données, les connexions et les bases techniques.'],
  ['Développement', 'Construire le périmètre convenu et valider les fonctionnalités.'],
  ['Mise en service', 'Tester les usages, préparer la prise en main et les évolutions.'],
];

/* Réalisations vérifiées (site existant, page Réalisations). Aucun chiffre ni témoignage. */
const projects = [
  {
    id: 'solaria',
    name: 'Solaria Média',
    type: 'Site vitrine · Agence de communication',
    status: 'Site en ligne',
    href: 'https://solariamedia.netlify.app',
    linkLabel: 'Voir le site',
    text: 'Une présence lumineuse pour une agence de communication et marketing à La Réunion. Stratégie, création et expertises réunies dans un univers visuel affirmé.',
    tags: ['Identité visuelle', 'Présentation des expertises', 'Communication'],
    image: 'solaria',
    alt: 'Univers visuel Solaria Média : communication, création et identité de marque',
    site: 'solaria-site',
    siteMobile: 'solaria-site-m',
    siteAlt: 'Page d’accueil du site Solaria Média, sur ordinateur',
    siteMobileAlt: 'Page d’accueil du site Solaria Média, sur mobile',
  },
  {
    id: 'ppg',
    name: 'Prévenir Pour Gagner',
    type: 'Site vitrine · Association',
    status: 'Projet client',
    href: 'https://prevenirpourgagner.com',
    linkLabel: 'Voir le site',
    text: 'Rendre la prévention dans le sport accessible. Un site pour présenter l’association, ses interventions et ses actions auprès des jeunes.',
    tags: ['Présentation de l’association', 'Sensibilisation', 'Actions terrain'],
    image: 'ppg',
    alt: 'Identité de l’association Prévenir Pour Gagner',
    site: 'ppg-site',
    siteMobile: 'ppg-site-m',
    siteAlt: 'Page d’accueil du site Prévenir Pour Gagner, sur ordinateur',
    siteMobileAlt: 'Page d’accueil du site Prévenir Pour Gagner, sur mobile',
  },
];

/* Types de projet acceptés par /api/contact (server/handlers/contact.js). */
const projectTypes = [
  ['site', 'Créer un site web'],
  ['refonte', 'Refondre un site existant'],
  ['saas', 'Créer un SaaS ou un logiciel'],
  ['automatisation', 'Connecter ou automatiser des outils'],
  ['crm', 'Échanger sur Pridano'],
];

module.exports = { brand, expertises, method, softwareMethod, projects, projectTypes, pricing, pricingTax, pricingNote, maintenance, testimonials };
