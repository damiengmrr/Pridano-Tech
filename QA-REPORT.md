# Rapport QA

**Contexte de test** :

- **Date et machine** : 22 octobre 2026, macOS (Apple Silicon), Node 26.8.1.
- **Navigateurs** : Chromium 1243 (Playwright) et le navigateur intégré de l'application (Chromium avec GPU) pour les vérifications visuelles interactives. Pour la dernière série de modifications (§5), les vérifications visuelles ont été faites par captures Playwright (Chromium sans GPU) : le navigateur intégré n'avait pas accès au dossier du projet.
- **Build testé** : `npm run build`, servi par Express en local.
- **Envois réels** : aucun. Les appels `/api/contact` sont interceptés dans les tests.

## 1. Tests automatisés

| Suite | Commande | Contenu | Résultat |
|---|---|---|---|
| Contrôles statiques | `npm run lint` | Syntaxe de 47 fichiers JS, un H1 par page, 284 références de ressources locales existantes, métadonnées, recherche de secrets dans les fichiers servis, ESLint | ✅ réussi |
| Tests Node | `npm test` | 24 tests : validation et transport du contact, adaptateur Netlify, pages et pages historiques (200), 301 avec requête conservée, 404 HTML/JSON, ressources servies, API du brief guidé, SEO (indexation par contexte, canonicals, sitemap, robots, titres et descriptions uniques), JSON-LD (entités, variantes, cohérence FAQ, personnes, réalisations), absence de faux avis ou chiffres, portfolios historiques en noindex, contenus facultatifs (prix, témoignages, téléphone, rendez-vous, identité légale) absents sans donnée et présents avec données de test, y compris dans le JSON-LD | ✅ 24/24 |
| Tests navigateur | `npm run test:frontend` | 16 tests Playwright (détail ci-dessous) | ✅ 16/16 |
| Captures | `npm run qa:visual` | 77 captures pleine page : 11 routes × 320, 375, 390, 768, 1024, 1440 et 1920 px, avec contrôle du débordement et de la console | ✅ 0 débordement, 0 erreur (hors 404 attendue sur la page 404) |
| Lighthouse | `npm run qa:lighthouse` | 8 pages × mobile et desktop | Voir PERFORMANCE-REPORT.md |

### Parcours navigateur couverts (`tests/browser/site.spec.js`)

1. **Cinq largeurs (1440, 1280, 768, 390, 320)** sur les 10 pages : statut 200, un H1 visible, aucun débordement horizontal, aucune image cassée après défilement complet, aucune erreur console.
2. **Clavier** : le lien « Aller au contenu » est le premier focus et place le focus sur `main` ; anneau de focus visible.
3. **Menu mobile** :
   - ouverture depuis le dock (`aria-expanded`) ;
   - fermeture à Échap avec retour du focus ;
   - navigation vers `/saas`, puis le CTA présélectionne « Créer un SaaS ou un logiciel » sur `/contact`.
4. **Formulaire de contact** :
   - présélection via `?projet=refonte` ;
   - envoi vide : focus sur le premier champ en erreur, `aria-invalid` et message lié ;
   - erreur serveur simulée (503) : message affiché, saisie conservée ;
   - succès simulé : confirmation focalisée (« Votre demande a bien été transmise. ») ;
   - charge utile JSON conforme au contrat serveur (`projectType`, `consent: true`, pot de miel vide).
5. **Business OS** : onglets au clavier (flèche droite, Fin, Début), panneau correspondant visible, capture réelle affichée.
6. **Sites web** : les 9 couches de la démonstration au toucher (`data-stage`, `aria-pressed`).
7. **Schéma « Moins de détours » (mobile)** : pilotage par boutons sans défilement, étape « Un outil commun. » annoncée.
8. **Hero** :
   - visuel statique immédiat ;
   - H1 et liens des trois offres présents ;
   - la scène passe en `webgl` sur GPU, ou reste `static` en rendu logiciel (cas du navigateur de test).
9. **Mouvement réduit** : pas de scène WebGL, aucune séquence épinglée, aucun contenu masqué.
10. **Brief guidé** : moteur initialisé (état de l'assistant affiché), message d'accueil, réponses rapides, sans erreur.
11. **Liens internes et ancres** : tous résolus (statut < 400, cibles d'ancre présentes).
12. **Film d'ouverture** : version complète à la première visite, version courte ensuite, « Passer l'intro », Échap, molette, rechargement, mouvement réduit, visite commencée sur une autre page, fin automatique.

## 2. Vérifications visuelles manuelles (navigateur avec GPU)

| Élément | Vérification |
|---|---|
| Hero WebGL | Rendu du symbole en volume, ombre portée. Au survol de la forme, le point est aspiré puis fusionne (« connecté »). La qualité adaptative et la pause hors écran sont actives. |
| Hero mobile | Objet en haut à droite, titre lisible dessous, fondu statique → 3D seulement après la première image |
| Sections du récit | « La première impression compte » qui s'allume, nœuds synchronisés avec la lecture, « Moins de détours. Plus de possibilités. » épinglé (trois étapes), méthode horizontale avec point voyageur synchronisé |
| Réalisations | Liste typographique et aperçu qui suit le curseur (desktop), vignettes en ligne (mobile) |
| Pages intérieures | Sites web (couches, bento des qualités), Logiciels (problème → réponse, hub), Business OS (onglets, parcours, concept Ask), Studio, Contact, Brief guidé, mentions, confidentialité, 404 |
| Menu mobile | Feuille modale sombre, typographie monumentale, page courante en cyan |

Défauts trouvés pendant la QA, puis corrigés :

- objet 3D trop grand ;
- point final orphelin en fin de ligne ;
- carte « Refonte » non sombre ;
- couches de la démo mal superposées ;
- ordre titre / illustration sur mobile ;
- contraste des étapes inactives de la méthode ;
- débordement à 320 px (bouton insécable) ;
- ordre des titres sur Business OS ;
- image principale chargée en différé (Réalisations, Studio) ;
- curseur visible au chargement ;
- coût du WebGL en rendu logiciel.

## 3. Accessibilité

- Lighthouse Accessibilité : 100 sur les pages auditées (voir PERFORMANCE-REPORT.md).
- WCAG 2.2 AA visé :
  - contrastes calculés (DESIGN-SYSTEM.md) ;
  - focus visible sur tous les éléments interactifs ;
  - cibles tactiles d'au moins 24 px partout (WCAG 2.5.8) et de 44 à 56 px pour les actions principales (boutons, dock, onglets, choix du formulaire) ;
  - ordre de tabulation logique ;
  - `<dialog>` natif pour le menu, piège de focus ajouté à la modale de relecture du brief ;
  - libellés et erreurs liés ;
  - langue déclarée ;
  - aucune information portée seulement par la couleur ou le mouvement.
- Aucun mouvement automatique en boucle :
  - la scène 3D est une animation décorative lente, désactivée en mouvement réduit ;
  - les séquences suivent le défilement ou les boutons ;
  - la lecture automatique mobile de « Transformation » est unique et dure moins de 5 s ;
  - les pulsations décoratives sont limitées à 2 ou 3 itérations.
- Zoom : mise en page fluide jusqu'à 320 px sans défilement horizontal (équivalent d'un zoom à 400 % sur 1280 px).

## 4. Réalignement des textes

À la demande de l'équipe, tous les textes de contenu ont été remis à l'identique du site existant (voir CONTENT-VERIFICATION.md). Les tests, les captures et les audits ont été relancés après ce réalignement.

## 5. Ajustements après l'analyse clients, professionnels et marché

Modifications (détail dans CONTENT-VERIFICATION.md §5) : « Le produit Pridano » dans la navigation, sur-titre explicite de l'accueil, réalisations montrées avec les captures réelles des sites livrés, blocs prix / téléphone / rendez-vous / témoignages prêts mais masqués, mentions légales et politique de confidentialité pilotées par `brand.js`, portfolios historiques en noindex, événements de mesure d'audience sur les actions clés.

Vérifié après ces modifications :

- `npm run lint`, `npm test` (23/23), `npm run test:frontend` (15/15) ;
- `npm run qa:visual` : 77 captures (11 routes × 7 largeurs), aucun débordement, aucune erreur console hors la 404 attendue sur la page 404 ;
- Lighthouse sur les 8 pages, mobile et desktop : 100 dans les quatre catégories (PERFORMANCE-REPORT.md) ;
- captures ciblées : Réalisations (1440 et 390 px), Contact, Mentions légales, pied de page.

Défauts trouvés, puis corrigés :

- la pastille « Site en ligne » masquait l'adresse du site dans la fenêtre de navigateur (déplacée sous la fenêtre) ;
- adresse du site soulignée par le lien parent ;
- liste des informations manquantes des mentions légales sans « et » final ;
- mention « HT » codée en dur, alors que le régime de TVA n'est pas confirmé (rendue paramétrable : `pricingTax`) ;
- captures des réalisations surdimensionnées sur mobile (environ 18 Ko de surplus, nouvelles largeurs et `sizes`).

Blocs prix, témoignages, téléphone et rendez-vous : contrôlés par les tests et par des captures (1440 et 390 px) d'un rendu en mémoire avec des **données fictives**, jamais écrites dans le site ni livrées. Rendu correct, aucun débordement, aucune erreur. Une vérification sera à refaire avec les vraies informations (longueur réelle des textes et des montants).

## 6. Retours de l'équipe : en-têtes, première impression, animation d'arrivée

Modifications : visuels à droite des en-têtes des 5 pages intérieures (captures réelles en couches), section « La première impression compte » refaite (texte court + visuel animé au défilement), animation d'arrivée de 5 secondes sur l'accueil, prix « Accessible » HT et délai de 3 à 5 jours publiés, section maintenance, téléphone, Calendly, LinkedIn, Instagram, retrait du portfolio de Damien des réalisations.

Vérifié après ces modifications (même machine, 22 octobre 2026) :

| Contrôle | Résultat |
|---|---|
| `npm run lint` | ✅ 47 fichiers JS, 284 références de ressources, aucun secret |
| `npm test` | ✅ 24/24 (nouveau : prix, délai, maintenance, téléphone, Calendly et profils présents et identiques dans le JSON-LD ; tout disparaît si les données sont vidées) |
| `npm run test:frontend` | ✅ 16/16, dont un nouveau test de l'intro : affichée à la première visite de l'accueil, en-tête masqué pendant l'intro, « Passer l'intro » et Échap, absente au rechargement, absente en mouvement réduit, absente si la visite commence par une autre page, disparition automatique |
| `npm run qa:visual` | ✅ 77 captures (11 routes × 7 largeurs, intro marquée comme vue), 0 débordement, 0 erreur console hors la 404 attendue |
| Lighthouse | ✅ 100 / 100 / 100 / 100 sur les 8 pages, mobile et desktop, avec l'animation d'arrivée de cette version (remplacée ensuite par le film, voir §7) |
| Captures ciblées | En-têtes des 5 pages à 1440 et 390 px ; première impression à deux positions de défilement ; intro image par image (0,4 à 5,6 s, à 1440 et 390 px) ; prix et maintenance |

Défauts trouvés, puis corrigés :

- étapes de la première impression trop estompées avant leur allumage (contraste insuffisant relevé par Lighthouse, accessibilité 96 → 100) ;
- image LCP chargée en différé dans l'en-tête de `/crm` sur mobile ;
- curseur « Damien » masqué par la fenêtre de code sur mobile (page Studio) ;
- bouton de la maquette visible dans l'en-tête mobile de l'intro ;
- icône d'horloge et cartes de maintenance sans style au premier rendu ;
- captures produit des en-têtes sans la mention « données de démonstration » (ajoutée, comme sur le reste du site).

Non vérifié : les en-têtes n'ont été vus que dans Chromium (captures Playwright), pas dans Safari ni Firefox.

## 7. Expérience cinématographique : film d'ouverture, transitions, mouvement

Modifications :

- le film d'ouverture « Le premier point » remplace l'animation précédente (DIRECTION-CREATIVE.md) ;
- quatre types de transitions de page ;
- titres révélés mot par mot ;
- reflet au survol des cartes ;
- profondeur au défilement (en-têtes, réalisations) ;
- ambiance « nuit » du symbole 3D.

Vérifié (22 octobre 2026) :

| Contrôle | Résultat |
|---|---|
| `npm run lint` | ✅ 47 fichiers JS, 287 références de ressources, aucun secret |
| `npm test` | ✅ 24/24 |
| `npm run test:frontend` | ✅ 16/16. Le test du film couvre : film complet à la première visite, version courte à la visite suivante, « Passer l'intro », Échap, molette, rechargement sans film, mouvement réduit sans film, arrivée par une autre page sans film, fin automatique sans erreur. |
| `npm run qa:visual` | ✅ 77 captures, 0 débordement, 0 erreur console hors la 404 attendue |
| Lighthouse | ✅ 100 / 100 / 100 / 100 sur 7 pages ; accueil avec film : 99 / 100 / 100 / 100 (PERFORMANCE-REPORT.md) |
| Film avec GPU (Chromium + Metal, Apple M5) | Captures image par image à 1440 et 390 px, version complète et version courte. Scène 3D prête à 0,5 s, passage au hero sans coupure (`data-scene="webgl"`), aucune erreur. |
| Film sans GPU (rendu logiciel) | Captures à 1440 px : film vectoriel complet, fondu vers le visuel statique, `data-scene="static"` à la fin, aucune erreur |
| « Passer » au milieu du film | Échap à 2,6 s : la caméra rejoint le hero en 0,9 s, puis la scène interactive reprend |
| Réseau lent | Mise en scène retardée de 5 s : le film s'efface seul à 3,5 s et la page est rendue. Retard de 0,9 s : film joué normalement. |
| Transitions de page | Captures en cours de transition : travelling vers la rubrique suivante et précédente, cercle depuis un appel à l'action, ouverture depuis une offre du hero, fondu au retour arrière |

Défauts trouvés, puis corrigés :

- gros plans trop serrés (texture du symbole visible) ;
- bande de lumière qui aplatissait les faces avant ;
- résolution dégradée après une pause de rendu ;
- faisceau aux bords nets (le flou était coupé par le découpage) ;
- lignes partant du centre des nœuds ;
- slogan non centré sur mobile ;
- deux symboles visibles pendant l'arrivée sans GPU ;
- reflet gris pendant « Passer » ;
- film qui pouvait réapparaître si sa mise en scène arrivait après le filet de sécurité ;
- mots des titres qui chevauchaient le paragraphe suivant pendant leur arrivée.

## 8. Limites et points non vérifiés

- **Navigateurs** : seul Chromium a été testé. Safari (iOS/macOS) et Firefox doivent être vérifiés en recette. Points d'attention :
  - transitions de page (View Transitions entre documents) : Chrome/Edge 126+, Safari 18.2+, sinon navigation classique ;
  - `::details-content` (animation de la FAQ) : sans animation si non supporté ;
  - WebGL2 et OffscreenCanvas en Worker (Safari 16.4+), avec repli automatique sur le fil principal puis sur le visuel statique.
- **Film d'ouverture** :
  - vu seulement dans Chromium : avec GPU (Apple M5, Metal) et en rendu logiciel ;
  - non testé sur iPhone, Android, Safari ni Firefox réels ;
  - fluidité (images par seconde) non mesurée sur téléphone ; la qualité adaptative et le repli vectoriel sont là pour les appareils modestes ;
  - points à regarder en recette Safari : masque de l'ouverture finale (préfixe `-webkit-` fourni) et unités `dvh` (avec repli `vh`).
- **Lecteurs d'écran** : la structure a été vérifiée par l'arbre d'accessibilité et axe (via Lighthouse). Aucun test avec VoiceOver ou NVDA réels.
- **Envoi d'emails** : non testé en réel (aucune clé valide utilisée ; voir DEPLOYMENT.md). Le comportement a été validé par transport simulé.
- **Assistant IA du brief** : testé en mode local (sans clé Groq). Le mode connecté n'a pas été appelé.
- **Fonctions Netlify** : adaptateurs testés unitairement, aucun déploiement Netlify effectué.
- **Scène 3D** : vérifiée sur GPU Apple Silicon. Sur d'autres GPU, la qualité adaptative et l'arrêt automatique (au-delà de 45 ms par image) protègent la fluidité. Le rendu final peut légèrement varier selon les pilotes.
