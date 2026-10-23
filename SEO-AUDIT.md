# SEO, AEO et compatibilité agents : stratégie et vérifications

Domaine canonique : **https://pridanotech.fr**. Toutes les vérifications ont été faites en local le 22 octobre 2026, sans publication. Aucun résultat de Search Console ni de validateur externe n'est revendiqué.

## 1. Architecture et intentions de recherche

Les titres, descriptions et H1 sont **ceux du site existant**. La refonte n'a pas réécrit les contenus éditoriaux (voir CONTENT-VERIFICATION.md).

| URL | Intention principale | H1 visible (texte du site existant) |
|---|---|---|
| `/` | Création de sites web et logiciels sur mesure à Montpellier | « Création de sites web & logiciels sur mesure · Montpellier — Des sites qui marquent. Des idées qui avancent. » (sur-titre repris du titre d'onglet d'origine : la requête principale figure dans le H1) |
| `/sites-web` | Création et refonte de site web sur mesure | « Votre entreprise fait la différence. Votre site aussi. » |
| `/saas` | SaaS, applications et logiciels métier sur mesure | « Moins de détours. Plus de possibilités. » |
| `/realisations` | Références réelles | « Le travail parle. Regardez de plus près. » |
| `/crm` (menu : « Le produit Pridano ») | Pridano Business OS (produit en développement) | « Votre entreprise. Un seul logiciel. » |
| `/a-propos` | Qui est derrière Pridano | « Des personnes. Des idées. Le souci du détail. » |
| `/contact` | Prise de contact | « Tout commence par un échange. » |
| `/devis` | Demande de devis guidée | « Décrivez le projet. Le brief se construit en quelques échanges. » |
| `/mentions-legales` | Obligation légale (noindex tant que les informations ne sont pas complètes) | « Mentions légales. » |
| `/confidentialite` | Obligation RGPD | « Politique de confidentialité » |

Aucune page locale artificielle ni page « mot-clé » n'a été créée.

## 2. Métadonnées générées (build de production)

| URL | `<title>` (longueur) | Description | Robots | Graphe JSON-LD |
|---|---|---|---|---|
| `/` | Création de sites web & logiciels sur mesure à Montpellier · Pridano (68) | 133 car. | index | Organization, WebSite, WebPage, ItemList |
| `/sites-web` | Création & refonte de sites web sur mesure · Pridano (52) | 140 car. | index | + BreadcrumbList, Service avec 5 `offers` (création dès 990 €, refonte dès 790 €, maintenance 29 / 59 / 119 € par mois, HT), FAQPage (5 questions) |
| `/saas` | SaaS, applications & logiciels métier sur mesure · Pridano (58) | 138 car. | index | + BreadcrumbList, Service avec `offers` (dès 3 900 € HT) |
| `/realisations` | Réalisations — Sites web · Pridano (36) | 116 car. | index | CollectionPage (ItemList de 2 CreativeWork), BreadcrumbList |
| `/crm` | Pridano Business OS — Notre CRM en développement · Pridano (58) | 151 car. | index | WebPage, BreadcrumbList |
| `/a-propos` | Le studio — Damien Gamarra & Noah Lemoing · Pridano (51) | 146 car. | index | AboutPage, BreadcrumbList, 2 × Person |
| `/contact` | Contact — Parlons de votre site ou logiciel · Pridano (53) | 134 car. | index | ContactPage, BreadcrumbList |
| `/devis` | Devis intelligent · Pridano (27) | 110 car. | index | WebPage, BreadcrumbList |
| `/mentions-legales` | Mentions légales — Informations du site · Pridano (49) | 94 car. | noindex tant que l'éditeur est incomplet, puis index | WebPage, BreadcrumbList |
| `/confidentialite` | Politique de confidentialité · Pridano (38) | 119 car. | index | WebPage, BreadcrumbList |
| `/404` | Page introuvable · Pridano (26) | 63 car. | noindex | aucun |
| `/portfolio-noah.html`, `/portfolio-dada.html` | Pages historiques | — | noindex, nofollow (balise + en-tête `X-Robots-Tag`) | — |

Chaque page comporte :

- `lang="fr-FR"` et un seul H1 ;
- un canonical absolu (sauf la 404) et un title unique ;
- une description unique ;
- les balises Open Graph (`og:site_name` « Pridano », comme sur le site existant) et Twitter Card, avec une image de partage 1200 × 630 ;
- un manifeste et des favicons.

## 3. Identité de marque structurée

- Une entité **Organization** stable (`https://pridanotech.fr/#organization`), répétée à l'identique sur chaque page :
  - `name: "Pridano Tech"` (comme dans le JSON-LD du site existant), `alternateName: ["Pridano", "PridanoTech", "Pridanotech"]` ;
  - `url`, `logo` (PNG carré 512 px), `email`, `contactPoint` (service client, français) ;
  - `telephone` (07 78 70 25 18, aussi dans `contactPoint`) et `sameAs` (LinkedIn, Instagram), renseignés le 22 octobre 2026 ;
  - ajoutés automatiquement dès qu'ils seront renseignés dans `site/data/brand.js` : `legalName`, `identifier` (SIREN) ;
  - `description` : la description de l'accueil du site existant ;
  - `slogan` : « Des sites qui marquent. Des outils qui font avancer. » ;
  - `address` réduite à ce qui est confirmé : `addressLocality: Montpellier`, `addressCountry: FR` ;
  - `knowsAbout` (les prestations visibles sur le site) et `member` → les deux personnes présentées sur `/a-propos`.
- Une entité **WebSite** (`#website`), avec le même nom et les mêmes variantes, reliée à l'Organization par `publisher`.
- Chaque **WebPage** est reliée au WebSite (`isPartOf`) et à l'Organization (`about`), avec un `BreadcrumbList` sur les pages intérieures.
- Les **Service** de `/sites-web` et `/saas` reprennent les descriptions et prestations publiées sur ces pages. Chaque prix affiché a son `Offer` : `PriceSpecification` (`minPrice`, `EUR`, `valueAddedTaxIncluded: false`) pour les prix « à partir de », `UnitPriceSpecification` mensuelle (`unitCode: MON`) pour la maintenance. Les montants du JSON-LD sont ceux de la page (vérifié par test).
- **FAQPage** : uniquement sur `/sites-web`, la seule page du site existant qui publie une FAQ. Questions et réponses identiques au texte visible (vérifié par test).
- Les **Person** (Damien Gamarra, Noah Lemoing) reprennent rôle, bio, `worksFor` et `sameAs` uniquement s'ils sont confirmés (`damiengamarra.com`).

### Variantes de nom

Les variantes de nom apparaissent dans `alternateName`. Dans le texte visible, on retrouve les formes déjà utilisées par le site existant : « Pridano » dans les titres et les textes, « Pridano Tech » dans le pied de page. Il n'y a ni texte caché ni répétition artificielle. La casse (PRIDANO TECH) n'est pas ajoutée comme variante distincte : les moteurs ne distinguent pas la casse.

### Volontairement absents

- `legalName`, `identifier` : identité légale en attente (champs prêts dans `brand.js`).
- Le lien LinkedIn fourni est un profil personnel (`/in/`). Une **page entreprise** LinkedIn (`/company/`) serait plus claire pour Google et pour les visiteurs ; l'ajouter dans `brand.sameAs` une fois créée.
- `ProfessionalService` / `LocalBusiness` : adresse postale non confirmée.
- `aggregateRating` / `Review` : aucun avis vérifiable. La section Témoignages, une fois remplie, reste du contenu visible sans balisage `Review` : Google n'affiche pas d'étoiles pour les avis qu'une entreprise publie sur elle-même.
- `SoftwareApplication` : le produit n'est pas commercialisé.

## 4. Technique

| Élément | Mise en place |
|---|---|
| Sitemap | `/sitemap.xml` : 9 URL indexables, canonicals uniquement (sans 404, ni portfolios historiques, ni mentions légales tant qu'elles sont en noindex) |
| robots.txt | Production : `Allow: /`, `Disallow: /api/` et lien vers le sitemap. Local et Deploy Previews : `Disallow: /` et `noindex` |
| Redirections 301 | `/index.html`, `/services.html`, `/projets.html`, `/about.html` et toutes les variantes `.html` des pages (y compris `/devis.html` → `/devis`), requête conservée. Express et Netlify sont alignés. |
| 404 | Statut 404 réel, page dessinée, liens de reprise. Les API répondent en JSON 404. |
| HTML crawlable | Pages prérendues ; navigation en vrais liens `<a>` ; contenu complet sans JavaScript (seul l'envoi du formulaire en a besoin) |
| Images | AVIF + WebP responsives, dimensions explicites, `alt` descriptifs (décoratives : `alt=""`), chargement différé sauf l'image principale |
| Performance | Voir PERFORMANCE-REPORT.md : 100/100 en SEO sur les 8 pages auditées, mobile et desktop |
| Langue | Une seule langue (fr-FR), pas de hreflang nécessaire |

## 5. AEO / GEO : moteurs de réponse et assistants

- Les contenus sont ceux du site existant, factuels, sous des titres explicites.
- Structure sémantique : `section`, `nav`, `header`, `footer`, `main`, `ol`, `details`.
- La FAQ « Avant de vous lancer. » de la page Sites web est balisée en FAQPage.
- Aucun contenu essentiel n'est dans un canvas ou une image : la scène 3D est décorative (`aria-hidden`).
- Le film d'ouverture de l'accueil est décoratif. La page complète (titre, textes, liens, données structurées) est dans le HTML dès le départ, sous le film. Un moteur ou un agent la lit sans attendre. Le film ne se joue qu'à la première page d'une visite, et jamais en mouvement réduit.
- `/llms.txt` : description du site existant et liens principaux. C'est un format proposé, **non normalisé**, sans garantie d'être lu ni d'améliorer la visibilité.

La refonte n'ajoute pas de texte : la FAQ d'accueil rédigée lors d'une première version a été retirée à la demande de l'équipe. Pour renforcer les réponses directes aux questions (« Qui est Pridano ? », « Où êtes-vous basés ? »…), il faudra des textes fournis et validés par l'équipe.

La présence dans les réponses d'IA ne peut pas être garantie.

## 6. Visite agentique

Ce qu'un agent navigateur peut faire (couvert par les tests Playwright) :

- **Navigation** : vrais liens et boutons, noms accessibles explicites, lien d'évitement, fil d'Ariane.
- **Formulaire** : libellés liés, erreurs annoncées (`aria-invalid` + message lié), état d'envoi (`aria-busy`, région `role="status"`), confirmation explicite.
- **Composants** : menu en `<dialog>` natif, onglets au motif ARIA (flèches, Début, Fin), FAQ en `<details>` natif.
- **Séquences animées** : pilotables par boutons (`aria-pressed`), sans geste complexe. Le défilement reste natif, sans piège.
- **Pré-sélection** : `/contact?projet=site|refonte|saas|automatisation|crm` présélectionne le type de projet.

## 7. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `npm test` | 24 tests : indexation production / preview / local, canonicals, sitemap, robots, titres et descriptions uniques au format « · Pridano », un H1 par page, entités uniques, variantes de marque, FAQPage uniquement sur Sites web et identique au texte visible, absence de faux avis ou chiffres, redirections 301, 404, portfolios en noindex, données facultatives (prix, téléphone, profils, identité légale) absentes du HTML et du JSON-LD tant qu'elles ne sont pas fournies, puis présentes et cohérentes une fois renseignées |
| `npm run lint` | Syntaxe JS, H1, 287 références de ressources locales, métadonnées, absence de secrets dans les fichiers servis |
| `npm run test:frontend` | Liens internes et ancres résolus sur les 10 pages ; aucune erreur console |
| Lighthouse | SEO 100 sur toutes les pages auditées (voir PERFORMANCE-REPORT.md) |

À faire après publication :

- passer le test des résultats enrichis de Google et le validateur Schema.org sur l'URL publique ;
- soumettre le sitemap dans Search Console et Bing Webmaster Tools ;
- inspecter l'accueil.

## 8. Référencement local et notoriété (hors site)

Ce qui pèse le plus pour « création site web Montpellier » se joue en dehors du code :

1. **Fiche Google Business Profile** (adresse ou zone desservie, catégorie « Concepteur de sites Web », photos, lien vers le site). C'est la condition pour apparaître dans le bloc carte.
2. **Annuaires et plateformes** où les TPE comparent les prestataires : La Fabrique du Net, Malt, page entreprise LinkedIn, Pages Jaunes. Mêmes nom, ville, email et téléphone partout.
3. **Avis Google** de vos clients (Solaria Média, Prévenir Pour Gagner), demandés après chaque livraison.
4. **Liens** : un « Site réalisé par Pridano » dans le pied de page des sites livrés, avec l'accord du client.
5. LinkedIn et Instagram sont déjà dans `brand.sameAs`. Ajouter la fiche Google Business Profile et la page entreprise LinkedIn une fois créées.
