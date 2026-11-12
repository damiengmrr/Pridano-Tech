# NON-RÉGRESSION — contrôles avant/après

Objectif : vérifier que l'évolution (catalogues, devis multi-besoins) n'a modifié **ni la DA, ni les animations, ni les fonctionnalités existantes**, en dehors des changements voulus et listés dans CHANGELOG.md.

Tous les contrôles ci-dessous ont été **réellement exécutés** le 2 novembre 2026 sur macOS (Apple Silicon), Node 26.8.1, Chromium de Playwright. Ceux qui n'ont pas pu l'être sont listés au §6.

## 1. Référence « avant »

- Le ZIP fourni (`PRIDANOTECH-NEXT-GEN-COMPLETE.zip`) a été décompressé dans un dossier temporaire, puis construit et servi tel quel.
- Le fichier ZIP d'origine n'a pas été modifié : l'archive livrée porte un autre nom.
- Seule différence de départ entre le ZIP et le dossier de travail : le lien Instagram du pied de page, ajouté le 30 octobre 2026. Il est conservé.

## 2. Comparaison pixel par pixel des pages existantes

**Méthode** :

- **Pages comparées** : les 11 pages existantes (accueil, Sites web, SaaS, Réalisations, Business OS, Studio, Contact, Devis, mentions légales, confidentialité, 404).
- **Largeurs** : 390, 1024 et 1440 px.
- **Captures** : pleine page, avant puis après.
- **Conditions de capture**, pour des images stables et comparables :
  - mouvement réduit ;
  - transitions et animations figées au moment de la capture ;
  - éléments fixes masqués (en-tête, dock, rail, curseur).
- **Comparaison** : ligne par ligne. Une ligne est « différente » si au moins un pixel varie de plus de 30 niveaux cumulés (R+G+B) ; les zones différentes sont regroupées en bandes.

**Résultat** : 33 comparaisons (11 pages × 3 largeurs). Les seules zones différentes sont les changements voulus. Tout ce qui se trouve au-dessus d'un changement est identique au pixel près.

| Page | Zones différentes | Explication |
|---|---|---|
| Réalisations, Business OS (`/crm`), Studio, Contact, mentions légales, 404 | Pied de page uniquement | Nouveaux liens « Prestations » et « Nos produits » dans le pied de page : 68 px de plus à 1024 et 1440 px, 146 px à 390 px |
| Confidentialité | Nouveau paragraphe sur le brouillon du devis, puis le pied de page | À 390 px, la capture s'arrête à 16 000 px, avant ce paragraphe : rien ne diffère dans la zone capturée |
| Accueil | Les lignes du titre principal et du chapô (nouveaux textes, même nombre de lignes, voir CHANGELOG.md du 3 novembre), puis la nouvelle section « Un seul partenaire » et le contenu qu'elle décale vers le bas | Le sur-titre, les boutons, le visuel 3D du hero et les sections jusqu'aux trois offres sont identiques ; le hero garde exactement ses dimensions (§3) |
| Sites web | À partir du bloc « Nos prestations », inséré après les formules de maintenance | Hero, démonstration, prix et maintenance identiques |
| SaaS & logiciels | À partir du bloc « Nos prestations », inséré après « Partir du quotidien » | Hero et problèmes/réponses identiques |
| Devis | À partir du sélecteur de besoins, inséré sous les étapes « Décrire / Préciser / Relire / Envoyer » | Titre, chapô et étapes identiques ; la conversation et le dossier gardent leur rendu, décalés vers le bas |

L'en-tête est masqué dans ces captures. À 1440 px, ses libellés de navigation changent (« Prestations », « Nos produits » ; voir CHANGELOG.md). Sa taille, son style et son comportement ne changent pas.

## 3. Hero, animations et transitions

| Contrôle | Méthode | Résultat |
|---|---|---|
| Dimensions du hero (accueil) | Hauteur du hero, du chapô et du sur-titre mesurées avant et après à 390, 1024, 1440 et 1920 px | Identiques au pixel près : hero 1 101 / 900 / 992 / 1 123 px, chapô 79 / 91 / 99 / 99 px, sur-titre 29 / 14 / 14 / 14 px, avant comme après |
| Code du hero, du film d'ouverture et de la scène 3D | Comparaison des fichiers avec le ZIP | Identiques : `src/scripts/gl/*`, `src/scripts/modules/hero.js`, `film*.js`, `site/components/film.js`, `src/styles/tokens.css`, `base.css` n'ont pas été modifiés |
| Film d'ouverture | Test Playwright « intro » : version complète puis courte, Passer, Échap, molette, rechargement, mouvement réduit | Réussi |
| Scène WebGL et visuel statique | Test Playwright « hero » | Réussi |
| Mouvement réduit | Test Playwright : pas de scène WebGL, aucune séquence épinglée, contenus visibles | Réussi |
| Transitions de page | Ordre gauche/droite étendu aux nouvelles pages (`navigation.js`). Mécanisme inchangé. | Vérifié par lecture du code et par le test de navigation |
| Démos existantes | Tests Playwright : 9 couches de Sites web, schéma « Moins de détours », onglets de Business OS | Réussis |
| Menu mobile | Test Playwright : ouverture depuis le dock, Échap, retour du focus, navigation | Réussi (le parcours passe désormais par « Prestations », puis « SaaS & logiciels ») |

## 4. DA : couleurs, typographies, composants

- **Aucune couleur, police, taille de texte ni courbe d'animation n'a été ajoutée.**
  - `tokens.css` et `base.css` n'ont pas été modifiés.
  - Les ajouts CSS (`inner.css`, `sections.css`, `components.css`) n'utilisent que les variables existantes.
- **Composants des nouvelles pages** : uniquement des composants existants.
  - Cartes `.module`, puces `.node-points`, grille `.principle` ;
  - cas d'usage `.ps-row`, cartes de prix `.price-card` ;
  - méthode, FAQ `details`, appel final, bloc produit de Business OS ;
  - visuels du hero intérieur (`.mk-*`).
  - Nouveaux styles : la mise en page des cartes de prestation (`.svc`) et les badges de statut (`.badge--*`), dans les couleurs existantes.
- **Seule règle ajoutée aux styles existants** : l'état actif du menu accepte aussi `aria-current="true"`. Il signale « Prestations » comme section courante sur une page de catégorie, avec le même rendu que la page courante.

## 5. Fonctionnalités existantes

| Fonctionnalité | Contrôle | Résultat |
|---|---|---|
| Toutes les pages existantes | Statut 200 en Express (test « routes ») et dans les tests navigateur à 5 largeurs | Réussi |
| URL, canonicals, redirections 301 historiques | Tests Node (routes, SEO) | Réussis, aucune URL modifiée |
| Réalisations | Comparaison de pixels : seul le pied de page diffère | Conservées |
| Pridano Business OS (`/crm`) | Comparaison de pixels : seul le pied de page diffère ; test des onglets | Conservé |
| Formulaire de contact | Test Playwright : validation, erreur serveur, confirmation (envoi simulé) | Réussi |
| Devis guidé sans besoin coché | Test Node « parcours d'origine inchangé » | Réussi |
| Prix publiés | Test Node : 990, 790, 3 900, 29, 59 et 119 € présents ; aucun tarif envisagé publié | Réussi |
| Données structurées existantes | Tests SEO (Organization, WebSite, Service et offres de `/sites-web` et `/saas`) | Réussis |
| Performances | Lighthouse sur 12 pages, mobile et desktop | 99 ou 100 dans les 4 catégories (TESTS.md) |

## 6. Limites

- **Navigateurs** : comparaisons et tests faits dans Chromium uniquement. Safari et Firefox restent à vérifier en recette (voir QA-REPORT.md §9).
- **Animations en mouvement** : les captures figent les animations. Le bon déroulement du film, du hero 3D et des transitions est couvert par les tests Playwright et par l'absence de modification de leur code, pas par une comparaison image par image en mouvement.
- **Appareils réels** : aucun test sur iPhone ou Android réel.
