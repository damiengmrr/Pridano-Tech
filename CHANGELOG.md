# CHANGELOG

## 2026-11-03 (2) — Recentrage des catalogues, prix de la landing page

Décisions des fondateurs.

- **Catalogue des logiciels** : Pridano Projects, Stock, Dashboard et Forms retirés (le tableau de bord existe déjà dans Business OS). Restent Business OS (en développement), Finance, CRM et Booking (concepts).
- **Sites web** : la landing page a son propre prix, **dès 490 € HT**, validé le 3 novembre 2026 (`pricing` → `landing` dans `brand.js`). Le site vitrine reste à 990 € HT. La section « Combien coûte un site web ? » de la page Sites web n'a pas changé.
- **E-commerce** :
  - prestations « Catalogue produits », « Paiement et livraison » et « Intégrations métier » retirées ; restent « Création de boutique » et « Refonte de boutique » ;
  - les textes de la page ne promettent plus de liaison avec les outils de gestion (stocks, facturation) : hero, bénéfices, cas d'usage, déroulement, FAQ, description ;
  - le paiement et la livraison restent décrits comme des éléments de la boutique ;
  - sur desktop, une catégorie à deux prestations s'affiche sur deux colonnes.
- **Branding & UI/UX** retiré entièrement :
  - catégorie, 6 prestations et page `/prestations/branding-ui-ux` (redirigée en 301 vers `/prestations`, dans Express et `netlify.toml`) ;
  - besoins « Identité visuelle » et « UI/UX » retirés du devis guidé, qui en compte maintenant 10 ;
  - textes qui citaient l'identité visuelle comme prestation (chapô de l'accueil, catalogue, parcours « projet complet », description de marque, `knowsAbout`) mis à jour ;
  - le portfolio et la biographie de l'équipe, qui parlent de projets réels, ne changent pas.
- **Catalogue** : 6 catégories renumérotées de 01 à 06, 31 prestations.
- **Tests** : adaptés (10 besoins, prix de 490 € validé, 2 prestations e-commerce, redirection de la page retirée).

## 2026-11-03 — Clarté du menu, accueil et catalogue mobile

Suite à l'avis sur le site. Aucune couleur, police, animation ni composant nouveau.

- **Menu** : « Nos logiciels » devient **« Nos produits »** (en-tête, menu mobile, pied de page, fil d'Ariane). Il n'y a plus deux entrées « logiciels » : « SaaS & logiciels », libellé d'origine du site, désigne le service sur mesure ; « Nos produits », les logiciels de Pridano. La page `/logiciels` garde son URL et son titre « Nos logiciels. Construits pour les entreprises. », avec le sur-titre « Nos produits · Pridano Software ».
- **Accueil** :
  - le titre principal porte le positionnement : « Tout votre numérique. Un seul partenaire. », à la place de « Des sites qui marquent. Des idées qui avancent. » ;
  - même structure (4 lignes, 2 en accent), même animation, dimensions du hero identiques au pixel près ;
  - le sur-titre SEO « Création de sites web & logiciels sur mesure · Montpellier » reste dans le H1 ;
  - nouveau chapô : « Sites, identité visuelle, logiciels, automatisations et IA : conçus, développés et suivis par la même équipe. » ;
  - la signature « Des sites qui marquent. Des outils qui font avancer. » reste dans le pied de page, le film d'ouverture et l'image de partage.
- **Description de marque** (`brand.description`, utilisée par les données structurées `Organization`, le manifeste et `llms.txt`) : « Pridano Tech, studio digital à Montpellier : sites web, e-commerce, identité visuelle, logiciels sur mesure, automatisations et agents IA. Un seul partenaire pour tout votre numérique. »
- **Catalogue `/prestations` sur mobile et tablette** (900 px et moins) :
  - chaque prestation tient sur une ligne : numéro, nom, prix ou « Sur devis », flèche ; toute la ligne est cliquable ;
  - la description et les livrables restent sur la page de la catégorie ;
  - les 40 prestations restent visibles ;
  - hauteur de la page à 390 px : 18 486 → 10 593 px ;
  - desktop inchangé.

## 2026-11-02 — Deux catalogues, devis multi-besoins, accueil « un seul partenaire »

Évolution de `PRIDANOTECH-NEXT-GEN-COMPLETE.zip`, **sans refonte visuelle** :

- pas de nouvelle couleur, police, animation ni transition ;
- les nouvelles pages réutilisent les composants existants (cartes `.module`, `.price-card`, `.principle`, cas d'usage `.ps-row`, méthode, FAQ, appel final, visuels du hero) ;
- les prix validés sont inchangés.

Voir NON-REGRESSION.md pour les contrôles avant/après.

### Ajouté

- **Catalogue des prestations** (`site/data/catalog.js`) : 7 catégories, 40 prestations. Chacune a : pour qui, avantages, livrables, prix validé ou « Sur devis », et un lien vers le devis.
  - `/prestations` : catalogue complet, navigation par catégorie, parcours « Construire mon projet numérique ».
  - Pages de catégorie générées :
    - `/prestations/e-commerce` ;
    - `/prestations/branding-ui-ux` ;
    - `/prestations/agents-ia`, avec un bloc « Une IA utile. Et encadrée. » sur les limites de l'IA, les données et les coûts d'usage ;
    - `/prestations/automatisations` ;
    - `/prestations/maintenance`, avec les formules de maintenance validées.
  - `/sites-web` et `/saas` restent les pages des catégories Sites web et Applications & logiciels. Elles reçoivent un bloc « Nos prestations ».
- **Catalogue des logiciels** (`site/data/software.js`) : `/logiciels`.
  - Statuts Concept, En développement, Bêta, Disponible, avec leur légende.
  - Pridano Business OS : « En développement », présenté avec le bloc produit existant, renvoie à `/crm`.
  - Finance, CRM, Booking, Projects, Stock, Dashboard et Forms : « Concept », dans « En préparation ». Aucune capture, aucun prix, aucune inscription.
  - « Être informé du lancement » ouvre le formulaire de contact existant avec un message prérempli.
  - Gabarit de page produit `/logiciels/<id>` prêt, aucune page publiée.
- **Devis guidé multi-besoins** (`site/data/needs.js`) :
  - 12 besoins à cocher, combinables et facultatifs ;
  - une question ciblée par besoin, puis le délai et le budget, sans question en double ;
  - présélection depuis les catalogues (`/devis?besoins=…`) ;
  - parcours « Construire mon projet numérique » (`/devis?parcours=projet`) ;
  - un champ de relecture par besoin coché ;
  - besoins et précisions repris dans l'email reçu, avec une référence de demande.
- **Robustesse du devis** :
  - brouillon conservé dans l'onglet (rechargement de page) pendant 24 h au plus, sans les coordonnées, effacé à l'envoi ;
  - identifiant de demande envoyé avec le brief ; un second envoi identique dans les 30 minutes n'envoie pas de second email.
- **Accueil** :
  - chapô « Sites, identité visuelle, logiciels, automatisations et IA : un seul partenaire pour tout votre numérique. » (même longueur, le hero garde ses dimensions) ;
  - description de la page mise à jour ;
  - nouvelle section « Un seul partenaire » (8 savoir-faire, avec liens) après les trois offres ;
  - le sur-titre « Création de sites web & logiciels sur mesure · Montpellier » est conservé : il fait partie du H1 et porte la requête principale (voir SEO-AUDIT.md).
- **SEO** :
  - titres et descriptions des nouvelles pages ;
  - fil d'Ariane à 3 niveaux ;
  - JSON-LD `CollectionPage`/`ItemList`, `Service`/`OfferCatalog`, `FAQPage` sur les pages qui affichent une FAQ ;
  - offres structurées uniquement pour les prix validés ;
  - sitemap, `llms.txt` et `knowsAbout` mis à jour.
- **Tests** :
  - `tests/catalog.test.js` (9 tests) ;
  - `tests/devis.test.js` (7 tests) ;
  - 3 nouveaux parcours Playwright (catalogue des prestations, catalogue des logiciels, devis à plusieurs besoins) ;
  - nouvelles routes dans les tests navigateur, la QA visuelle et Lighthouse.
- **Documentation** : CATALOGUES.md, COMMERCIAL.md, TESTS.md, ROADMAP.md, NON-REGRESSION.md, ce fichier.

### Modifié

- **Navigation (en-tête et menu)** :
  - avant : Sites web · SaaS & logiciels · Le produit Pridano · Réalisations · Le studio ;
  - après : Sites web · **Prestations** · **Nos logiciels** · Réalisations · Le studio ;
  - SaaS & logiciels reste accessible depuis Prestations et le pied de page ; Le produit Pridano depuis Nos logiciels et le pied de page ;
  - l'entrée « Prestations » reste active sur les pages de catégorie, « Nos logiciels » sur `/crm` (`aria-current="true"`).
- **Pied de page** :
  - colonne Explorer : Sites web, Prestations, SaaS & logiciels, Réalisations ;
  - colonne Pridano : Nos logiciels, Le produit Pridano, Le studio, Nous contacter.
- **Transitions de page** : l'ordre gauche/droite intègre les nouvelles pages.
- **Formulaire de contact** : prérempli depuis « Être informé du lancement » (`?sujet=`, texte nettoyé et limité à 60 caractères).
- **Politique de confidentialité** : mention du brouillon du devis guidé (stockage de session, sans coordonnées, durée).
- **Express** (`server.js`) : les pages sont servies depuis la table des routes, ce qui inclut les nouvelles pages. Les redirections 301 historiques sont conservées.
- **Netlify** (`netlify.toml`) : 7 règles de réécriture pour les nouvelles pages. Les règles existantes n'ont pas changé.
- **Lighthouse** : le script gère les routes imbriquées.

### Corrigé

- **Devis guidé, mode local** : le mot « entreprise » était reconnu comme « reprise » (de données) et ajoutait une question hors sujet. La détection exige maintenant le mot entier.

### Inchangé (volontairement)

- **Prix publiés** : 990 €, 790 €, 3 900 € HT ; maintenance 29, 59 et 119 € HT/mois, avec leurs avantages. Les tarifs envisagés sont documentés dans COMMERCIAL.md, sans être publiés.
- **Expérience existante** : hero 3D, film d'ouverture, animations, transitions, curseur, dock mobile, réalisations, `/crm`, formulaire de contact, API, redirections.
- **Le lien Instagram du pied de page**, ajouté le 30 octobre 2026 après la création du ZIP, est conservé.
