# Design system Pridano Tech

Le système visuel est construit à partir des logos officiels fournis (`brand-source/`) :

- le symbole en dégradé ;
- le logotype horizontal ;
- les deux rendus 3D.

Les tracés ont été vectorisés automatiquement, sans redessin (`scripts/brand/trace-logo.js`, `site/data/logo-geometry.json`). Les tokens se trouvent dans `src/styles/tokens.css`.

## 1. Analyse de la marque

| Élément | Observation | Usage dans le système |
|---|---|---|
| Point isolé | Un disque séparé, à gauche de la forme | Le premier pas, le contact. Il porte le curseur, les puces des étiquettes, l'indicateur de navigation et le point voyageur de la méthode. |
| Forme à trois nœuds | Trois disques reliés par des congés concaves, en chevron (« avancer ») | Les trois offres du site : nœud haut = Sites web, nœud droit = SaaS & logiciels, nœud bas = Le produit Pridano (Business OS). Le symbole sert de plan du site. |
| Dégradé | Cyan en haut à droite, azur profond en bas à gauche | `--g-brand`, sur les objets, les remplissages de boutons et les états actifs. Jamais en couleur de texte sur fond clair (contraste insuffisant). |
| Logotype « pridano. » | Grotesque très gras, minuscules, approche serrée, carré ultramarine en point final | Typographie Archivo 800, approche -0,06 em. **Le carré ultramarine termine chaque titre** (`.pt`) : la marque se reconnaît sans lire le nom. |
| Rendus 3D officiels | Matière satinée, lumière de studio, ombre douce, fond gris clair | Fond « papier » `#f2f3f5`, ombres bleutées, scène WebGL éclairée de la même façon. |

## 2. Couleurs

| Token | Valeur | Rôle | Contraste |
|---|---|---|---|
| `--c-ink` | `#0a0c10` | Texte principal, fonds sombres | 17,6:1 sur papier |
| `--c-ink-3` | `#262b36` | Texte secondaire | 12,8:1 sur papier |
| `--c-muted` | `#565e6c` | Légendes, métadonnées | 5,9:1 sur papier, 5,4:1 sur `paper-2` |
| `--c-muted-2` | `#7a8291` | Décoratif uniquement (filets, séparateurs) | 3,5:1, pas pour du texte courant |
| `--c-paper` | `#f2f3f5` | Fond principal | — |
| `--c-paper-2` / `-3` | `#e8eaee` / `#dde0e6` | Sections alternées, symbole en filigrane | — |
| `--c-cyan` | `#1fdcff` | Dégradé ; accent sur fond sombre | 11,9:1 sur encre |
| `--c-azure` | `#08a2ff` | Dégradé, points actifs | encre sur azur : 7,1:1 |
| `--c-blue` | `#0a78ee` | Bas du dégradé | — |
| `--c-ultra` | `#1b45ff` | Carré du logotype : liens, accent, focus | 5,6:1 sur papier, 6,3:1 sur blanc |
| `--c-on-dark-muted` | `#a8b0bf` | Texte secondaire sur fond sombre | 9:1 sur encre |

**Règle d'or** : les couleurs ajoutées enrichissent la palette officielle sans la remplacer. Aucun néon, aucune particule, aucun dégradé violet générique.

## 3. Typographie

Police : **Archivo** variable (graisses 100 à 900, sous-ensemble latin, 35 Ko en WOFF2), auto-hébergée sous licence OFL. Une police de repli ajustée (`Archivo Fallback`, métriques approchées sur Arial) limite les décalages au chargement (CLS mesuré : 0). Les étiquettes techniques utilisent la police monospace du système.

| Style | Taille (fluide) | Graisse | Interligne | Approche |
|---|---|---|---|---|
| Display / hero | 3 → 9,6 rem | 820 | 0,86 | -0,06 em |
| H1 de page | 2,5 → 6,4 rem | 800 | 0,88 | -0,058 em |
| H2 | 2,15 → 5,25 rem | 780 | 0,95 | -0,045 em |
| H3 | 1,35 → 1,95 rem | 700 | 1,08 | -0,022 em |
| Chapô (`.lead`) | 1,125 → 1,42 rem | 400 | 1,45 | -0,012 em |
| Texte | 1,0625 rem (1 rem en mobile) | 400 | 1,6 | — |
| Étiquette (`.label`) | 0,75 rem, capitales | 640 | 1,2 | +0,14 em, précédée du point dégradé |

## 4. Espacements, grille, formes

- **Échelle d'espacement** : base 4 px (`--s-1` 0,25 rem → `--s-10` 8 rem). Les sections utilisent `--section-y`, de 5 à 11 rem.
- **Gouttière** : `--gutter` de 16 à 56 px. Le contenu est limité à 1440 px (`.wrap`), sur une grille de 12 colonnes pour les héros et les compositions.
- **Rayons** : 6, 12, 20, 32, 48 px et pilule. Ils dérivent des nœuds circulaires du symbole. Les boutons sont des pilules : des « nœuds » cliquables.
- **Ombres** : `--sh-1` (cartes), `--sh-2` (panneaux), `--sh-float` (aperçus flottants). Elles sont teintées de bleu, comme l'ombre du rendu 3D.

## 5. Composants

| Composant | Classe | Comportement |
|---|---|---|
| Bouton principal | `.btn.btn--primary` | Pilule encre ; le dégradé se remplit depuis le point d'entrée du pointeur ; la flèche sort et revient ; léger aimant sur pointeur fin ; focus visible |
| Bouton secondaire | `.btn--ghost`, `.btn--light`, `.btn--outline-light` | Mêmes mécaniques, adaptées au fond |
| Lien | `.link` | Soulignement qui se rétracte, flèche qui avance (↗ pour un lien externe, annoncé « nouvel onglet ») |
| Étiquette | `.label` | Point dégradé, capitales espacées |
| Badge d'état | `.badge`, `.badge--dev` | Pastille de statut : point azur, ou orange pour « en développement » |
| Champ | `.field`, `.input` | Libellé visible, aide, erreur liée par `aria-describedby`, `aria-invalid` |
| Choix | `.choices` / `.choice` | Vrais boutons radio présentés en pastilles |
| FAQ | `.faq details` | `<details>` natif, ouverture animée (`::details-content`) |
| Navigation | `.main-nav` + `.nav-dot` | Le point de la marque glisse d'un lien à l'autre en s'étirant ; il marque la page courante |
| Dock mobile | `.dock` | Barre au pouce (Menu + action principale), rangée quand un champ est actif ou que le pied de page apparaît |
| Menu | `<dialog class="menu">` | Feuille modale native : focus piégé, Échap, retour du focus |
| Rail d'index | `.index-rail` | Desktop ≥ 1280 px : un point par section, page en cours, saut direct ; s'adapte aux sections sombres |
| Carte de nœuds | `nodeMap()` | Le symbole comme plan, avec le nœud de la page allumé |
| Contacts directs | `.direct-contacts` | Email, puis téléphone (`tel:`) et « Prendre rendez-vous » s'ils sont renseignés ; icône + libellé, cible ≥ 44 px. Utilisé dans Contact, le menu et le pied de page. |
| Carte de prix | `.pricing` / `.price-card` | « À partir de » en étiquette, montant en grand (espaces insécables, « 990 € »), mention fiscale, délai, liste cochée des avantages, note éventuelle, bouton secondaire vers le contact présélectionné. Une offre seule garde une largeur de lecture (40 rem). Rendue seulement si un montant existe. |
| Témoignage | `.quotes` / `.quote-card` | `<blockquote>` avec guillemets français, nom en gras, fonction et structure en `--c-muted`. Rendu seulement avec une citation réelle. |
| Réalisation en situation | `.case-devices` (`.case-browser` + `.case-phone`) | Capture réelle du site livré dans une fenêtre de navigateur (barre avec l'adresse du site), capture mobile dans un cadre de téléphone qui la chevauche en bas à droite ; pastille d'état sous la fenêtre. Sans capture, l'image d'illustration reprend sa place. |
| Visuel d'en-tête de page | `.hm` + `.hm-layer` (`--z`) | Captures réelles en couches (fenêtre de navigateur `.mk-browser`, application `.mk-app`, téléphone `.mk-phone`, planche de design `.mk-board`, fenêtre de code `.mk-code`, pastilles `.mk-chip`). Entrée échelonnée selon la profondeur, léger parallaxe au pointeur. Une variante par page : `sites`, `work`, `saas`, `os`, `studio`. |
| Maintenance | `.care` / `.care-card` (`--featured` sur fond encre) | Nom, prix mensuel, liste cochée ; la formule conseillée est mise en avant sans chiffre inventé. |
| Liste légale | `.legal-list` / `.legal-row` | Liste de définitions en deux colonnes (une seule sous 560 px) ; une ligne n'existe que si la donnée est fournie. |

## 6. Mouvement

**Principes** : chaque animation sert la compréhension, la marque, le guidage ou le rythme. On anime surtout `transform` et `opacity` ; l'animation d'arrivée anime aussi des tracés SVG et un masque. Aucun détournement du défilement : le défilement natif reste maître.

| Token | Valeur | Usage |
|---|---|---|
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | Apparitions, survols |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | Transitions de page, fermetures |
| `--ease-back` | rebond léger | Points, pastilles |
| `--ease-goo` | ressort `linear()` | Indicateur de navigation, point qui rejoint le symbole |
| Durées | 160, 320, 640 et 960 ms | Micro-interaction → séquence |

### Séquences signatures

0. **Film d'ouverture « Le premier point »** (accueil, première page de la visite, 7,6 s ; 2,7 s aux visites suivantes) : storyboard, variantes et choix techniques dans DIRECTION-CREATIVE.md.
1. **Hero « Le point rejoint le réseau »** : le symbole en volume (WebGL), éclairé comme le rendu officiel.
   - Au survol de la forme, le point isolé est attiré puis fusionne organiquement (union lisse de champs de distance).
   - À la souris, on peut saisir le point ; au toucher, on le relance.
   - Au défilement, il rejoint définitivement la forme.
2. **La première impression compte** : texte court à gauche ; à droite, un site livré sur mobile et le point de la marque qui descend un rail au fil de la lecture, en allumant « Il présente votre activité », « Inspire confiance », « Donne envie de vous choisir », puis « Le premier appel ».
3. **Les trois offres** : le nœud correspondant au bloc lu s'allume dans le symbole.
4. **Moins de détours. Plus de possibilités.** :
   - Le schéma du site existant (« Fichiers Excel / Double saisie / Processus manuels → Un outil commun ») s'anime : les problèmes épars se relient, puis se rassemblent pour former le symbole.
   - Le défilement pilote la séquence sur desktop (section épinglée) ; sur mobile, une lecture automatique unique, puis des boutons.
5. **Méthode** : un point voyage d'étape en étape, sur une piste horizontale épinglée en desktop et verticale en mobile.
6. **Couche par couche** (Sites web) : un site se construit en 9 étapes, de la stratégie au site final, jusqu'au passage en mobile.
7. **Transitions de page** (View Transitions natives), selon le lien suivi : travelling latéral entre rubriques, ouverture depuis le cadre d'un visuel, cercle depuis le point cliqué pour les appels à l'action, fondu court pour précédent / suivant. L'en-tête et le dock restent en place (détail dans DIRECTION-CREATIVE.md §6).
8. **Titres** : les mots des titres de section montent de derrière une ligne de coupe ; ceux des titres de page se posent un à un.
9. **Lumière au survol** : un reflet cyan suit le pointeur sur les cartes.

### Mouvement réduit (`prefers-reduced-motion`)

- Pas de scène WebGL : le rendu statique reste affiché.
- Les séquences épinglées se déplient en contenu statique, les apparitions sont immédiates.
- Les transitions de page sont désactivées.
- Pas de film d'ouverture, pas de transitions de page, mots des titres affichés directement.

Les ratios ci-dessus sont calculés selon la formule WCAG 2.2. Les étapes non encore « allumées » de la première impression utilisent `--c-muted` (lisible avant l'animation).

## 7. Garde-fous

- Le texte essentiel n'est jamais dans un canvas. Toute illustration est décorative (`aria-hidden`) et doublée par du HTML lisible.
- Les captures produit sont marquées « Captures de développement · données de démonstration ».
- Les schémas sont marqués « Illustration conceptuelle, pas un projet client ».
