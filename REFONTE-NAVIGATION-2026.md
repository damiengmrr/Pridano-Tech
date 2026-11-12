# Refonte Pridano Tech — navigation et fiches produits

Version de travail issue du ZIP transmis le 9 novembre 2026.

## Objectif

Rendre les solutions et logiciels accessibles immédiatement, avec une navigation inspirée du principe des méga-menus de LegalPlace, **sans reproduire sa direction artistique**. L'identité Pridano (couleurs, typographie, logo, films, WebGL, transitions et composants métier) est conservée.

## Modifications effectives

- En-tête desktop avec menus déroulants **Solutions** et **Nos logiciels**, alimentés directement par `site/data/catalog.js` et `site/data/software.js`. Ouverture au survol ou au clic, utilisation clavier possible et fermeture avec Échap/clic extérieur.
- Recherche globale accessible depuis l'en-tête et au clavier (`/` ou `Ctrl/⌘+K`) : filtre localement prestations, catégories et logiciels ; elle ne dépend d'aucune API.
- Menu mobile enrichi avec des liens directs vers les 6 catégories de prestation et 4 logiciels.
- Accueil raccourci : intro et hero 3D conservés ; navigation par besoin, aperçu du catalogue logiciel, repères des **prix existants**, réalisations et prise de contact. Les pages de détails prennent en charge les contenus longs.
- Catalogue des prestations transformé en répertoire de 6 rubriques et liens profonds vers toutes les prestations : accès direct aux pages existantes.
- Catalogue de 4 logiciels regroupé sur une grille filtrable (tous, en développement, concepts).
- Fiches dédiées aux **concepts** Pridano Finance, Pridano CRM et Pridano Booking : `/logiciels/finance`, `/logiciels/crm`, `/logiciels/booking` ; la page existante `/crm` reste la fiche de Pridano Business OS (en développement).
- Navigation, sitemap, JSON-LD, titres, descriptions, pages Netlify et serveur Express mis à jour via les routes générées.
- Tous les tarifs viennent des valeurs du ZIP dans `site/data/brand.js` et **aucun prix de SaaS n'a été ajouté**.

## Statuts respectés

- **Pridano Business OS** : en développement, page `/crm` ; captures déjà présentes et explicitement présentées comme captures de développement avec données de démonstration.
- **Pridano Finance, Pridano CRM et Pridano Booking** : concepts, aucune inscription, aucun tarif ni date de lancement. Les éléments listés sont des objectifs/fonctions *envisagés*, pas des fonctionnalités déjà livrées.

## Fichiers majeurs

| Fichier | Rôle |
|---|---|
| `site/components/layout.js` | Header, méga-menus, recherche, navigation mobile |
| `src/styles/refonte.css` | Design du menu, catalogue et fiches |
| `src/scripts/refonte.js` | Interactions accessibles, recherche, filtres |
| `site/pages/home.js` | Accueil plus court et orienté besoins |
| `site/pages/prestations.js` | Répertoire de solutions |
| `site/pages/logiciels.js` | Catalogue et filtres |
| `site/pages/logiciel.js` | Fiche générique pour concepts |
| `site/data/software.js` | Pages et statuts logiciels |
| `site/pages/index.js` | Routes générées automatiquement |
| `netlify.toml` | Déploiement des 3 nouvelles routes |
| `scripts/build.js` | Inclusion des nouveaux assets |
| `scripts/render-local-no-deps.js` | Synchronisation de l'aperçu HTML avec le code source si npm n'est pas installé |

## Comment lancer ou déployer

1. Installer Node.js 22 ou version compatible (minimum 20).
2. Dans le dossier du projet : `npm ci`.
3. Construire le site : `npm run build` (en production, les variables sont déjà définies dans `netlify.toml`).
4. Vérifier : `npm test`, puis `npm run test:frontend` avec Playwright et un serveur local démarré selon `playwright.config.js`.
5. Sur Netlify, garder la configuration de build du projet (`npm run build`, publication `public/`).

Les fichiers `public/` dans ce ZIP sont déjà synchronisés avec cette refonte pour consultation et comprennent les nouveaux assets. Ils préservent le bundle JS de la version d'origine. À l'installation des dépendances, `npm run build` régénère ce bundle à partir des sources.

## Contrôles effectués dans cet environnement

- Syntaxe des fichiers JavaScript touchés : valide.
- **20 routes** HTML vérifiées : liens internes, ancres, fichiers JS présents et canonical cohérents (aucun lien cassé détecté).
- Rendu contrôlé en lecture locale sur cinq largeurs (320, 390, 768, 1280, 1440 px) et cinq pages-clés : pas de débordement horizontal détecté.
- Recherche par mots-clés (y compris accents), ouverture/fermeture du méga-menu, filtres logiciel et navigation contrôlés dans un navigateur de test.
- Le téléchargement automatique des dépendances npm n'a pas abouti dans cet environnement : **les suites complètes `npm test` et `npm run test:frontend` n'ont donc pas pu être exécutées ici**. À lancer avant publication.

## Informations non ajoutées

Aucun SIREN, adresse de domiciliation, TVA, témoignage, référence client, abonnement SaaS, promesse de mise à disposition, prix ou date de lancement n'a été inventé. Les mentions légales toujours incomplètes dans le ZIP restent à renseigner à partir d'informations fiables.
