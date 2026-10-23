# Pridano Tech — site officiel (refonte « next-gen »)

Site de **Pridano Tech** (pridanotech.fr). Les textes sont ceux du site existant ; la refonte porte sur le design, l'expérience et la technique (voir CONTENT-VERIFICATION.md).

Le site présente le studio digital indépendant de Montpellier. Il couvre les sites web sur mesure, les logiciels métier et SaaS, l'automatisation, et le produit maison Pridano Business OS.

L'idée directrice est **« Le point rejoint le réseau »**. Le symbole officiel associe un point isolé à une forme où trois nœuds sont reliés. Sur ce site, il devient le fil conducteur :

- Le hero présente le symbole en 3D temps réel (WebGL, sans bibliothèque). Le point isolé est attiré par le curseur et fusionne avec la forme au survol, au toucher ou au défilement.
- Chaque nœud correspond à une offre du site (Sites web, SaaS & logiciels, Le produit Pridano) ; le point mène au premier échange.
- Les pages intérieures affichent le symbole comme un plan, avec le nœud de la page allumé.
- Les titres se terminent par le carré ultramarine du logotype.
- Les transitions de page s'ouvrent depuis le point cliqué.
- À la première visite, l'accueil s'ouvre sur un **film d'environ 7 secondes**, « Le premier point » : le logo 3D filmé dans le noir, puis dévoilé, puis transformé en interfaces réelles. Sa dernière image est la première image du site. Les visites suivantes ont une version courte (2,7 s). Voir DIRECTION-CREATIVE.md.

## Démarrage rapide

Prérequis : Node.js 20 ou plus récent (testé avec Node 26).

```sh
npm ci
npm run build
npm run dev
```

Puis ouvrir http://localhost:3000 (le port se change avec la variable `PORT`).

`npm run build` régénère les pages HTML, les bundles JS/CSS, le sitemap, robots.txt, le manifeste et `llms.txt` dans `public/`. Relancez-le après toute modification de `site/` ou `src/`.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run build` | Build complet. En local, l'indexation est bloquée (`noindex`, `Disallow: /`). |
| `npm run dev` / `npm start` | Serveur Express : pages, API contact et brief guidé, compression, en-têtes de sécurité. |
| `npm run assets` | Régénère les images responsives (AVIF + WebP), les favicons, les SVG de marque et la police à partir de `brand-source/`. |
| `npm run poster` | Rend le visuel statique du hero avec le shader du site (Playwright). Lancer ensuite `npm run assets`. |
| `npm run og` | Compose l'image de partage 1200 × 630. |
| `npm run captures` | Capture les sites livrés des réalisations (desktop et mobile) dans `brand-source/realisations/`, sans interagir avec eux. Lancer ensuite `npm run assets`. |
| `npm run lint` | Contrôles de syntaxe, des H1, des ressources locales, des métadonnées et des secrets, puis ESLint. |
| `npm test` | Tests Node : contact, routes, redirections, 404, API, SEO, données structurées, contenus pilotés par `brand.js` (rien d'affiché sans donnée). |
| `npm run test:frontend` | Tests navigateur Playwright : 5 largeurs, clavier, menu, formulaire, onglets, démos, mouvement réduit, liens. |
| `npm run qa:visual` | Captures pleine page de chaque route à 320, 375, 390, 768, 1024, 1440 et 1920 px (`.qa/visual/`). |
| `npm run qa:lighthouse` | Audits Lighthouse mobile et desktop sur un build de production servi localement (`.qa/lighthouse/`). |
| `npm run package` | Construit l'archive de livraison (sans `node_modules`, `.env` ni artefacts de test). |

La première exécution des tests navigateur peut demander `npx playwright install chromium`.

## Architecture

```
site/                  Gabarits et contenus (HTML prérendu au build)
  data/brand.js        Source unique des informations factuelles (voir CONTENT-VERIFICATION.md)
  data/logo-geometry.json  Tracés vectoriels issus des logos officiels
  lib/                 Outils de gabarit, déclinaisons SVG du logo
  components/          En-tête, menu, dock mobile, pied de page, sections partagées
  pages/               Une page par fichier + index des routes
  seo.js               Graphe JSON-LD par page
src/
  styles/              Design system (tokens, base, composants, sections, pages)
  scripts/             JS natif en modules : navigation, interactions, récit, pages
  scripts/gl/          Scène WebGL du logo (raymarching, ambiances nuit et jour) + champ de distance en Web Worker
  scripts/modules/film*.js  Film d'ouverture (chargé à part, seulement quand il est joué)
  scripts/quote/       Moteur du brief guidé existant (conservé)
server/, server.js     Express : pages, API /api/contact, /api/quote/*, /api/send-brief
netlify/functions/     Mêmes API en fonctions Netlify
scripts/               Build, contrôles, génération d'assets, QA visuelle et Lighthouse
brand-source/          Logos officiels, photos et captures sources (non servis)
public/                Site généré prêt à servir (pages, bundles, images optimisées)
tests/                 Tests Node et Playwright
```

Le site ne dépend d'aucun framework ni d'aucune bibliothèque côté navigateur.

- **CSS** : inliné dans chaque page (environ 13 Ko compressés).
- **JS principal** : un module d'environ 8 Ko compressés.
- **Chargés à la demande** : la scène 3D (environ 2,5 Ko compressés + Web Worker) et le brief guidé.
- **Analytics** : Umami (déjà en place sur l'ancien site, sans cookie), seulement en production et sur le domaine pridanotech.fr.

## Où modifier quoi

| Je veux… | Fichier |
|---|---|
| Changer un texte de page | `site/pages/<page>.js` |
| Changer une information d'entreprise (email, ville, fondateurs, réalisations) | `site/data/brand.js` |
| Afficher des prix, des témoignages, un téléphone, un lien de rendez-vous, les mentions légales | `site/data/brand.js`, voir « Informations à compléter » ci-dessous |
| Changer la navigation ou le pied de page | `site/components/layout.js` |
| Ajuster couleurs, typographie, espacements | `src/styles/tokens.css` (voir DESIGN-SYSTEM.md) |
| Ajuster le rendu 3D | `src/scripts/gl/logo-scene.js` (matériau, lumière) et `src/scripts/modules/hero.js` (physique, interactions) |
| Ajouter une réalisation | `site/data/brand.js` → `projects`, puis l'image source dans `brand-source/photos/` et une entrée dans `scripts/assets/build-assets.js` |
| Modifier les métadonnées ou le JSON-LD | `site/pages/*.js` (title, description) et `site/seo.js` |

## Informations à compléter

Le site n'affiche que des faits fournis par l'équipe. Chaque bloc ci-dessous reste **masqué** tant que le champ correspondant de `site/data/brand.js` est vide. Après chaque modification : `npm run build`, puis `npm test`.

État au 22 octobre 2026 : téléphone, lien Calendly, profils LinkedIn et Instagram, prix, délai et maintenance sont **renseignés et publiés**. Restent vides : identité légale (`brand.legal`) et témoignages (`testimonials`).

| Champ dans `brand.js` | Ce qui apparaît une fois rempli |
|---|---|
| `brand.phone` (ex. `'06 12 34 56 78'`) | Lien `tel:` dans le contact, le menu, le pied de page et les mentions légales ; `telephone` dans le JSON-LD |
| `brand.bookingUrl` (lien Calendly, Cal.com, Google Agenda…) | Bouton « Prendre rendez-vous » : page Contact, appel final, menu, pied de page |
| `brand.sameAs` (URL LinkedIn, Instagram, Google Business Profile…) | Profils officiels dans le JSON-LD `Organization` |
| `brand.legal` (dénomination, forme, siège, SIREN, RCS, TVA, directeur de publication) | Mentions légales complètes ; la page passe en `index, follow` dès que les champs obligatoires sont remplis. Les champs de la politique de confidentialité sont remplis automatiquement. |
| `pricing[].from` (montant en euros, nombre) et `pricing[].delivery` | Section « Combien coûte… ? » sur Sites web et SaaS, délai « Livré en … », repère de prix dans la FAQ et sur l'accueil, `offers` dans le JSON-LD `Service` |
| `maintenance` (nom, prix mensuel, contenu de chaque formule) | Section « Un site suivi. Sans engagement. » sur Sites web, repère dans la FAQ, offres mensuelles dans le JSON-LD |
| `pricingTax` (`'HT'` ou `'TTC'`) et `pricingNote` | Mention fiscale à côté des prix et note sous les cartes |
| `testimonials` (citation réelle, avec l'accord écrit de la personne) | Section « Témoignages » sur l'accueil et les réalisations |

Les captures des sites livrés (`npm run captures`) sont à refaire quand un client met son site à jour.

## Film d'ouverture

- **Quand** : seulement sur l'accueil, et seulement si c'est la première page de la visite. Une visite correspond à un onglet (`sessionStorage`).
  - Première visite : version complète (7,6 s). Visites suivantes : version courte (2,7 s), car le navigateur s'en souvient (`localStorage`).
  - Jamais si le visiteur a demandé de réduire les animations, ni avec une ancre dans l'adresse.
- **Comment le passer** : bouton « Passer l'intro », clic, touche Échap, Entrée, Espace ou ↓, ou un simple geste de défilement. Le film rejoint alors la page en 0,9 s, sans coupure.
- **Où se trouve le code** :
  - décision avant le premier rendu : script d'amorçage (`BOOT` dans `scripts/build.js`) ;
  - gabarit : `site/components/film.js` ;
  - décor et cadrage de départ : `src/styles/sections.css`, section « Cinématique d'ouverture » ;
  - mise en scène : `src/scripts/modules/film-run.js`, chargé à part, 10 Ko ;
  - ambiance « nuit » du symbole : `src/scripts/gl/logo-scene.js`.
- **Sans GPU, sur un appareil faible ou en économie de données** : le même film est joué avec le symbole vectoriel.
- **Sécurité** : si la mise en scène n'a pas démarré au bout de 3,5 s (script bloqué, réseau très lent), le film s'efface de lui-même. Le contenu de la page est présent dessous dès le départ (lecteurs d'écran, moteurs de recherche).
- **Le retirer** : supprimer `${film()}` dans `site/pages/home.js`, puis `npm run build`.

## Fonctionnalités conservées

- **Formulaire de contact** : `/api/contact`, validation serveur, envoi via Resend. Le contrat JSON est inchangé.
- **Brief guidé assisté par IA** : `/devis`, avec les routes `/api/quote/*` et `/api/send-brief`. Le moteur `quote.js` est conservé ; l'interface est redessinée et les accents corrigés.
- **Pages historiques** : `/portfolio-noah.html` et `/portfolio-dada.html` restent servies, avec les chemins d'images réparés. Elles sont exclues des moteurs de recherche (`noindex, nofollow` dans la page et en-tête `X-Robots-Tag`).
- **Anciennes URLs** : toutes redirigées en 301, aussi bien dans Express que dans `netlify.toml`.

Voir DIRECTION-CREATIVE.md pour le concept, le film d'ouverture, le langage 3D et les transitions ; DEPLOYMENT.md pour la mise en ligne et les variables d'environnement, et QA-REPORT.md, PERFORMANCE-REPORT.md, SEO-AUDIT.md et CONTENT-VERIFICATION.md pour les vérifications effectuées.
