# Direction créative : « Le premier point »

> « Pridano Tech should not feel like a website you visit. It should feel like a product launch you experience. »

Ce document décrit le concept, la cinématique d'ouverture, le langage 3D, le système de mouvement, les transitions de page et la stratégie de performance du site. Le design system (couleurs, typographie, composants) est dans DESIGN-SYSTEM.md.

## 1. Concept central

Le symbole officiel associe **un point isolé** et **un réseau de trois nœuds**. Le site raconte une seule histoire : un premier point (une idée, un premier échange) qui rejoint un réseau (un site, un logiciel, une entreprise qui avance).

- Le **film d'ouverture** montre ce point naître dans le noir, puis rejoindre le réseau.
- Dans le **hero**, le visiteur peut faire fusionner le point avec la forme, à la souris ou au toucher.
- Dans la page, le point **guide la lecture** : rail de la « première impression », point voyageur de la méthode, indicateur du menu, curseur.
- Les **trois nœuds** sont les trois offres : Sites web, SaaS & logiciels, Le produit Pridano.

Il n'y a qu'un seul objet 3D, le logo officiel en volume. Aucune forme décorative n'est ajoutée sans raison.

## 2. Direction artistique

Le site alterne deux ambiances qui partagent le même objet :

| Ambiance | Où | Matière et lumière |
|---|---|---|
| **Nuit** | Film d'ouverture, sections sombres (Business OS, pied de page) | Fond encre profond (`#05070c`) avec vignettage et grain. Faisceau de lumière diffus. Symbole en verre sombre : bande de lumière de studio qui glisse sur les biseaux, liseré cyan, halo. |
| **Jour** | Le reste du site | Fond papier (`#f2f3f5`). Symbole en matière satinée, dégradé officiel cyan → azur, ombre douce. |

L'alternance spectacle / sobriété est voulue :

- le film est le seul moment « spectaculaire » imposé, et on peut le passer ;
- ensuite, le visiteur déclenche lui-même les effets (interaction, défilement) ;
- les sections calmes (prix, contact, mentions) restent sobres.

## 3. Cinématique d'ouverture

### Storyboard (version complète, 7,6 s, première visite)

| Temps | Acte | Caméra et symbole | Lumière | Typographie et interface |
|---|---|---|---|---|
| 0 – 1,9 s | **I. L'inconnu** | Noir. Un point de lumière apparaît, à l'endroit exact où se trouvera le point du logo. Gros plans sur les biseaux du symbole : caméra très proche, légère dérive. | Faisceau diffus, flare anamorphique horizontal, bande de lumière qui balaie les arêtes | Générique : « Studio digital indépendant · Montpellier » |
| 1,9 – 4,4 s | **II. Le dévoilement** | La caméra recule (travelling arrière avec rotation) et révèle le symbole entier. Le point quitte sa place, **rejoint le réseau** (fusion organique), puis revient. | Deuxième passage de lumière, halo qui monte, flash au moment de la fusion | « pridano. » révélé de gauche à droite, puis la signature « Des sites qui marquent. Des outils qui font avancer. » |
| 4,4 – 6,2 s | **III. La transformation** | Léger recul et rotation. Des lignes de lumière partent des trois nœuds. | Une grille en perspective naît au sol. Le symbole commence à prendre sa couleur. | Trois écrans arrivent de la profondeur, depuis les nœuds : Solaria Média, Pridano Business OS, Prévenir Pour Gagner (captures réelles) |
| 6,2 – 7,6 s | **IV. L'arrivée** | Les écrans passent la caméra (travelling avant). Le symbole glisse vers sa place exacte dans le hero, pose comprise. | La lumière se répand depuis le symbole : un cercle s'ouvre dans la nuit et dévoile la page. Le symbole passe de la matière « nuit » à la matière « jour ». | Le titre du hero se met en mouvement à l'ouverture |

**La dernière image du film est la première image du site.** Le symbole du film n'est pas une copie : c'est le canevas 3D du hero, prêté au film puis rendu à sa place avec la même pose et le même cadrage. La scène interactive reprend sans coupure.

### Variantes

| Cas | Ce qui est joué |
|---|---|
| Première visite | Version complète (7,6 s) |
| Visite suivante (même navigateur) | Version courte (2,7 s) : point de lumière, dévoilement, fusion, logotype, arrivée |
| Page suivante de la même visite, ou arrivée sur une autre page | Aucun film |
| Mouvement réduit demandé | Aucun film |
| Pas de GPU (rendu logiciel), mémoire faible, économie de données, ou scène 3D pas prête à temps | Même film, avec le symbole vectoriel (halo, balayage de lumière, fusion « gluante »), qui se fond ensuite dans le visuel statique du hero |
| Réseau très lent (mise en scène arrivée après 3,2 s) | Le film s'efface de lui-même, la page reste telle quelle |

### Contrôle par le visiteur

On peut passer le film à tout moment, avec :

- le bouton « Passer l'intro » ;
- un clic n'importe où ;
- les touches Échap, Entrée, Espace, ↓ ou Page suivante ;
- un geste de défilement (molette ou glissé tactile).

Le film rejoint alors l'arrivée en 0,9 s depuis l'état courant, sans coupure. Il n'y a aucun son.

## 4. Langage 3D

- **Un objet, une source** : le symbole est calculé à partir du tracé vectoriel officiel. Ce tracé est converti en champ de distance (calculé dans un Web Worker), extrudé avec un biseau arrondi, puis rendu par raymarching dans un seul shader. Il n'y a ni modèle à télécharger ni bibliothèque 3D.
- **La fusion** (union lisse de champs de distance) est la signature : le point se fond dans le réseau comme une goutte.
- **Matières** :
  - nuit : verre sombre, reflets de softbox, liseré cyan, halo ;
  - jour : satin.
  Un seul paramètre fait passer de l'une à l'autre.
- **Interfaces en 3D** : seulement des captures réelles (sites livrés, produit maison), mises en perspective. Aucun écran inventé.

## 5. Système de mouvement

| Séquence | Où | Déclencheur |
|---|---|---|
| Film d'ouverture | Accueil | Arrivée sur le site |
| Le point rejoint le réseau | Hero de l'accueil | Pointeur, toucher, défilement |
| Mots qui montent de derrière une ligne de coupe | Titres de section | Entrée dans l'écran |
| Mots qui se posent un à un | Titres de pages intérieures | Arrivée sur la page |
| Couches qui suivent le pointeur et se séparent au défilement | Visuels d'en-tête des pages intérieures | Pointeur, défilement |
| Navigateur et téléphone à des vitesses différentes | Réalisations | Défilement |
| Rail et point qui allume les étapes | « La première impression compte » | Défilement |
| Nœud allumé selon le bloc lu, symbole qui se forme, point voyageur de la méthode, construction du site couche par couche | Accueil, Sites web | Défilement ou boutons |
| Reflet qui suit le pointeur | Cartes (prix, maintenance, parcours, principes, modules) | Survol (pointeur fin) |
| Boutons magnétiques, remplissage depuis le point d'entrée, curseur « point » | Tout le site | Survol (pointeur fin) |

Courbes : `--ease-out` pour les entrées, `--ease-in-out` pour la caméra et les transitions, `--ease-back` pour les points. Dans le site, on anime les transformations et l'opacité. Les transitions de page animent aussi un masque (clip-path), et le film des tracés SVG et un masque.

## 6. Transitions de page

| Lien suivi | Plan | Effet |
|---|---|---|
| Menu, pied de page, fil d'Ariane, entre deux rubriques | **Travelling latéral** | La nouvelle page entre par la droite (rubrique suivante dans l'ordre du menu) ou par la gauche (précédente). L'ancienne recule et s'assombrit. |
| Un visuel ou une offre du hero | **Plan large → gros plan** | La nouvelle page s'ouvre depuis le cadre de l'élément cliqué, l'ancienne pousse vers la caméra. |
| Appel à l'action (« Démarrer un projet »…) | **Ouverture circulaire** | La page s'ouvre en cercle depuis le point cliqué. |
| Précédent / suivant du navigateur, adresse tapée | **Fondu court** (0,26 s) | La navigation reste immédiate. |

L'en-tête et le dock mobile restent en place pendant toutes les transitions. Sur la nouvelle page, le titre se pose ensuite mot par mot. Techniquement, ce sont les View Transitions natives entre documents (Chrome et Edge 126+, Safari 18.2+). Ailleurs, la navigation reste classique.

## 7. Organisation narrative

**Accueil** :

1. Film.
2. Hero : promesse et symbole interactif.
3. La première impression compte : pourquoi un site.
4. Les trois offres (les trois nœuds).
5. Moins de détours : quand un logiciel s'impose.
6. Méthode.
7. Réalisations.
8. Produit maison.
9. Studio.
10. Appel final : contact, rendez-vous, devis.

**Pages intérieures** : en-tête avec un visuel réel → contenu → prix et maintenance quand c'est pertinent → appel final.

## 8. Stratégie de performance

- Le **contenu réel** est rendu dès le premier affichage, sous le film. Le film ne bloque jamais le chargement.
- **Acte I en CSS pur** : il démarre avec la page. La mise en scène (10 Ko) est chargée à part, seulement pour l'accueil et seulement si le film est joué.
- **Un seul canevas, un seul draw call**. Le film utilise la scène du hero : pas de second contexte WebGL.
- **Budget de pixels** :
  - 1,6 M px en desktop et 0,7 M px en mobile ;
  - densité plafonnée à 1,5 ;
  - qualité adaptative si les images dépassent 24 ms.
- **Détection du rendu logiciel** : passage automatique au film vectoriel.
- **Écrans de l'acte III** dessinés dans des canevas : ils ne retardent pas l'élément LCP.
- **Scène interactive** démarrée seulement après le film. Le film retire ses éléments et ses écouteurs à la fin : rien ne reste en mémoire.

Mesures réelles : PERFORMANCE-REPORT.md.

## 9. Références

Le niveau visé s'inspire des lancements de produits d'Apple (mise en scène de l'objet, lumière de studio, continuité) et de studios comme Active Theory ou Resn (expérience WebGL au service d'une marque). Aucune composition, aucun code et aucun élément graphique n'en sont repris. Les choix viennent du logo Pridano :

- le point devient le personnage principal ;
- la fusion organique devient la signature ;
- le passage nuit → jour devient l'arrivée sur le site.

## 10. Choix techniques

- **Pas de Three.js ni de GSAP**. Le rendu 3D existant (raymarching du logo officiel) suffit et reste très léger (7,8 Ko). Une ligne de temps maison pilote le film (10 Ko). Ajouter une bibliothèque coûterait 100 à 200 Ko sans gain visible.
- **WebGL2 plutôt que WebGPU** : prise en charge plus large, et un seul shader plein écran n'a pas besoin de WebGPU.
- **Vidéo pré-calculée écartée** : elle aurait été plus lourde (plusieurs Mo), non interactive, et n'aurait pas permis la continuité exacte avec le hero.
