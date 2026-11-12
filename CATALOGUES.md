# CATALOGUES — organisation, données et procédures d'ajout

Le site a deux catalogues, chacun piloté par **un seul fichier de données**. Les pages, la navigation par catégorie, le sitemap, les données structurées (JSON-LD), `llms.txt` et les liens vers le devis guidé sont générés à partir de ces fichiers. Pour ajouter une prestation ou un logiciel, on modifie ces données, pas les gabarits.

| Fichier | Rôle |
|---|---|
| `site/data/catalog.js` | **Catalogue 1 — Prestations** : 6 catégories, 31 prestations |
| `site/data/software.js` | **Catalogue 2 — Pridano Software** : statuts et 4 produits |
| `site/data/needs.js` | Les 10 besoins du devis guidé et la question posée pour chacun (partagé par le site et le serveur) |
| `site/data/brand.js` | Prix validés (`pricing`, `maintenance`), seuls prix que le catalogue peut afficher |
| `site/components/catalog.js` | Composants : cartes, sections, navigation par catégorie, badges de statut, liens vers le devis |
| `site/pages/prestations.js` | Page `/prestations` (catalogue complet) |
| `site/pages/prestation.js` | Gabarit des pages de catégorie `/prestations/<id>` |
| `site/pages/logiciels.js` | Page `/logiciels` (catalogue des logiciels) |
| `site/pages/logiciel.js` | Gabarit des futures pages produit `/logiciels/<id>` (aucune publiée aujourd'hui) |
| `site/pages/index.js` | Table des routes : les pages de catégorie et de produit y sont ajoutées automatiquement |
| `netlify.toml` | Une règle de réécriture par route (à ajouter à la main, vérifié par test) |

Après toute modification : `npm run build`, puis `npm test`. Les tests de `tests/catalog.test.js` détectent les oublis : catégorie sans prestation, besoin inconnu, prix non validé, route absente de Netlify, statut incohérent.

## 1. Catalogue des prestations

### Catégories et pages

| # | Catégorie | Page | Type de page |
|---|---|---|---|
| 01 | Sites web | `/sites-web` | Page existante, conservée. Un bloc « Nos prestations » y a été ajouté. |
| 02 | E-commerce | `/prestations/e-commerce` | Générée |
| 03 | Agents IA | `/prestations/agents-ia` | Générée |
| 04 | Automatisations | `/prestations/automatisations` | Générée |
| 05 | Applications & logiciels | `/saas` | Page existante, conservée. Un bloc « Nos prestations » y a été ajouté. |
| 06 | Maintenance & accompagnement | `/prestations/maintenance` | Générée |

Les URL existantes `/sites-web` et `/saas` n'ont pas changé. Elles servent de page de détail pour leur catégorie, afin de ne pas créer de doublon de contenu ni perdre leur référencement.

Une page générée contient, dans l'ordre :

1. un hero avec fil d'Ariane « Accueil › Prestations › Catégorie » ;
2. les bénéfices ;
3. les prestations incluses (cartes détaillées : pour qui, avantages, livrables, prix ou « Sur devis », bouton « Demander un devis ») ;
4. le cadre (uniquement pour Agents IA : limites de l'IA, données, coûts d'usage) ;
5. les cas d'usage ;
6. le tarif (« Sur devis », ou les formules de maintenance validées) ;
7. le déroulement ;
8. la FAQ ;
9. les services complémentaires ;
10. l'appel final vers le devis guidé, avec la catégorie déjà cochée.

### Modèle d'une catégorie (`categories`)

| Champ | Obligatoire | Rôle |
|---|---|---|
| `id` | oui | Identifiant unique, utilisé dans l'URL générée |
| `index` | oui | Numéro affiché (« 04 ») |
| `name` | oui | Nom affiché dans le catalogue, le fil d'Ariane, les liens |
| `page` | oui | URL de la page de détail |
| `generated` | oui | `true` = page générée par `prestation.js` ; `false` = page existante |
| `intro` | oui | Résumé d'une phrase (catalogue, navigation) |
| `need` | oui | Besoin du devis guidé coché par défaut depuis cette catégorie (un `id` de `needs.js`) |
| `seo` | si générée | `{ title, description }` de la page |
| `hero` | si générée | `{ kicker, title, lead }` |
| `benefits` | si générée | Liste de `[titre, texte]` |
| `trust` | non | `{ kicker, title, items: [[titre, texte]] }` : bloc de cadre (limites, données) |
| `useCases` | si générée | Liste de `[situation, prestation, réponse]` |
| `process` | si générée | Étapes `[titre, texte]` |
| `faq` | si générée | Questions `[question, réponse]`. Elles sont visibles sur la page et reprises en `FAQPage` dans le JSON-LD. |
| `related` | si générée | `id` des catégories complémentaires |

### Modèle d'une prestation (`services`)

| Champ | Obligatoire | Rôle |
|---|---|---|
| `id` | oui | Identifiant unique. Il sert d'ancre `#prestation-<id>` sur la page de catégorie. |
| `category` | oui | `id` de la catégorie |
| `name`, `short`, `details` | oui | Nom, accroche, description |
| `audience` | oui | Pour qui |
| `benefits` | oui | Avantages (liste) |
| `deliverables` | oui | Livrables (liste) |
| `need` | oui | Besoin coché dans le devis guidé depuis cette prestation |
| `price` | non | `{ ref: 'site' }` : référence vers un prix **validé** de `brand.js` (`pricing[].id`, ou `'maintenance'`). Sans `price`, la carte affiche « Sur devis ». |

**Aucun montant n'est écrit dans `catalog.js`.** Un prix ne s'affiche que par référence à `brand.js`. Les tarifs envisagés sont dans COMMERCIAL.md.

### Ajouter une prestation

1. Ajouter un objet à `services` dans `site/data/catalog.js`, avec la bonne `category` et le bon `need`.
2. `npm run build`, puis `npm test`.

La carte apparaît sur `/prestations` et sur la page de la catégorie, et elle est ajoutée aux données structurées (`ItemList`, `OfferCatalog`).

### Ajouter une catégorie

1. Ajouter un objet à `categories`, avec `generated: true` et une page `/prestations/<id>`. Remplir tous les champs marqués « si générée ».
2. Si nécessaire, ajouter un besoin dans `site/data/needs.js` (voir section 3).
3. Ajouter la règle Netlify dans `netlify.toml`, sous le commentaire « Catalogues » :
   ```toml
   [[redirects]]
     from = "/prestations/<id>"
     to = "/prestations-<id>.html"
     status = 200
   ```
4. Facultatif : un visuel de hero dédié dans `site/components/hero-media.js` (clé = `id`). Sans visuel dédié, la page utilise celui du catalogue.
5. Ajouter au moins une prestation à la catégorie.
6. `npm run build`, puis `npm test`.

La route Express, le sitemap, `llms.txt`, la navigation par catégorie et les liens du pied de page de la catégorie sont automatiques. Le test « routes » échoue tant que la règle Netlify manque.

### Retirer une catégorie

Exemple : Branding & UI/UX, retirée le 3 novembre 2026.

1. Supprimer la catégorie et ses prestations dans `site/data/catalog.js`, puis renuméroter `index`.
2. Retirer les besoins correspondants dans `site/data/needs.js`, s'il y en a, et vérifier les `related` des autres catégories.
3. Dans `netlify.toml`, remplacer la règle `200` de la page par une redirection `301` vers `/prestations` (avec `force = true`). Ajouter la même redirection aux `aliases` de `server.js`.
4. **Supprimer le fichier `public/prestations-<id>.html`** : le build ne supprime pas les anciennes pages.
5. `npm run build`, puis `npm test`.

## 2. Catalogue des logiciels (Pridano Software)

### Statuts

| Statut | Libellé | Règle |
|---|---|---|
| `concept` | Concept | Idée à l'étude. Aucune capture, aucune formule, aucun lien d'inscription. |
| `developpement` | En développement | En cours de construction, non commercialisé. Captures réelles de développement autorisées, présentées comme telles. |
| `beta` | Bêta | Uniquement si une **vraie** version de test est accessible à des utilisateurs. |
| `disponible` | Disponible | Uniquement si un **vrai** lien d'inscription existe **et** que des formules validées sont renseignées. Le test bloque sinon. |

État actuel :

- **Pridano Business OS** : En développement. Page existante `/crm`, captures réelles déjà publiées (données de démonstration).
- **Finance, CRM, Booking** : Concept, regroupés sous « En préparation ». (Projects, Stock, Dashboard et Forms ont été retirés le 3 novembre 2026.)

Aucun produit n'est affiché « Disponible ».

### Modèle d'un produit (`products`)

| Champ | Rôle |
|---|---|
| `id`, `name`, `category`, `status` | Identité et statut |
| `tagline`, `description`, `features` | Présentation |
| `note` | Précision honnête affichée sur la carte (ex. Finance : « pas un logiciel de comptabilité… ») |
| `screenshots` | Clés d'images **réelles** de `site/data/images.json`. Vide pour un concept. |
| `plans` | Formules validées `{ name, price, period, features }`. Vide = aucun prix affiché. |
| `faq` | Questions propres au produit |
| `docsUrl` | Lien vers une documentation existante |
| `signupUrl` | Lien d'inscription réel. Le bouton n'existe que si le statut est `disponible`. |
| `page` | Page produit existante (`/crm` pour Business OS) |
| `publishPage` | `true` = génère `/logiciels/<id>` avec `site/pages/logiciel.js` |
| `teaser` | `true` = présenté avec le bloc produit existant du site (capture réelle et lien vers sa page) |

### Le bouton « Être informé du lancement »

Il mène au **formulaire de contact existant** (`/contact?projet=crm&sujet=<nom du produit>`). Le message y est prérempli : « Bonjour, je souhaite être informé(e) du lancement de … ». La demande arrive donc par le circuit de contact réel (Resend), sans nouvelle liste ni nouveau service tiers. Rien n'est collecté sans action du visiteur.

### Ajouter un logiciel

1. Ajouter un objet à `products` dans `site/data/software.js` avec `status: 'concept'`, puis `npm run build` et `npm test`. La carte apparaît dans « En préparation ».

### Faire avancer un logiciel

1. **Statut `developpement`.** Les captures sont autorisées si elles sont réelles : ajouter les images dans `brand-source/`, les déclarer dans `scripts/assets/build-assets.js`, puis `npm run assets`.
2. **Page produit.**
   - Mettre `publishPage: true` et ajouter la règle Netlify :
     ```toml
     [[redirects]]
       from = "/logiciels/<id>"
       to = "/logiciels-<id>.html"
       status = 200
     ```
   - La page affiche ce qui existe : fonctionnalités, captures, FAQ et documentation, chaque élément seulement s'il est renseigné.
3. **Statut `beta`.** Seulement avec un accès de test réel.
4. **Statut `disponible`.** Seulement avec `signupUrl` et `plans` validés. Les prix des formules suivent la même règle que COMMERCIAL.md.

## 3. Lien avec le devis guidé

- Chaque catégorie et chaque prestation pointe vers `/devis?besoins=<id>`. Le besoin est alors coché à l'ouverture du devis.
- Le parcours « Construire mon projet numérique » pointe vers `/devis?parcours=projet`. Il coche « Projet numérique complet » et adapte le premier message.
- Plusieurs besoins se combinent : `/devis?besoins=site-vitrine,identite-visuelle`.

Pour **ajouter un besoin**, ajoutez une entrée à `site/data/needs.js` :

- `id` et `label` ;
- `profile` : un profil existant du moteur (`site_vitrine`, `ecommerce`, `refonte`, `saas`, `outil_interne`, `automatisation`, `integration_ia`, `custom`) ;
- `question` : `{ question, placeholder, quickReplies }`, la question ciblée posée une fois le besoin coché.

Le sélecteur de la page `/devis`, le moteur de questions (mode local et mode IA) et l'email reçu le prennent en compte sans autre modification.

## 4. Données structurées générées

| Page | JSON-LD |
|---|---|
| `/prestations` | `CollectionPage` + `ItemList` de toutes les prestations, `hasPart` vers les catégories |
| `/prestations/<id>` | `Service` + `OfferCatalog` des prestations, `BreadcrumbList` à 3 niveaux, `FAQPage` |
| `/prestations/maintenance` | En plus : une `Offer` mensuelle par formule de maintenance validée |
| `/logiciels` | `CollectionPage` + `ItemList` « nom (statut) » |

Une `Offer` n'est produite que pour un prix validé et affiché sur la page. Le test « données structurées » le vérifie.
