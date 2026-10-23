# Rapport de performance

## 1. Conditions de mesure

| Paramètre | Valeur |
|---|---|
| Date | 22 octobre 2026 |
| Outil | Lighthouse 12.8.2 (API Node, `npm run qa:lighthouse`), Chromium 1243 headless |
| Build | Build de production : HTML, CSS inline, bundles minifiés et empreintés. Servi en local par Express avec compression gzip et en-têtes de cache identiques à Netlify. Option `QA_INDEXABLE_ORIGIN` pour que les pages soient indexables pendant la mesure. |
| Mobile | Profil Lighthouse par défaut : Moto G Power émulé, 4G lente simulée (150 ms RTT, 1,6 Mb/s), CPU ralenti ×4 |
| Desktop | 1350 × 940, 10 Mb/s, 40 ms RTT, CPU ×1 |
| Machine | macOS, Apple Silicon |

Ces chiffres sont des **mesures de laboratoire** d'un build servi localement, pas des données terrain. Une fois en ligne, il faudra consulter les Core Web Vitals réels (CrUX / Search Console, 75e percentile) et relancer Lighthouse sur https://pridanotech.fr.

## 2. Résultats (exécution finale du 22 octobre 2026 : film d'ouverture, transitions, révélations typographiques)

| Profil | Page | Perf. | Access. | Bonnes prat. | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Mobile | `/` (film compris) | 99 | 100 | 100 | 100 | 2,1 s | 0 ms | 0,001 |
| Mobile | `/sites-web` | 100 | 100 | 100 | 100 | 1,7 s | 0 ms | 0 |
| Mobile | `/saas` | 100 | 100 | 100 | 100 | 1,7 s | 0 ms | 0 |
| Mobile | `/crm` | 100 | 100 | 100 | 100 | 1,7 s | 0 ms | 0 |
| Mobile | `/realisations` | 100 | 100 | 100 | 100 | 1,7 s | 0 ms | 0 |
| Mobile | `/a-propos` | 100 | 100 | 100 | 100 | 1,5 s | 0 ms | 0 |
| Mobile | `/contact` | 100 | 100 | 100 | 100 | 1,4 s | 0 ms | 0 |
| Mobile | `/devis` | 100 | 100 | 100 | 100 | 1,8 s | 0 ms | 0,003 |
| Desktop | `/` (film compris) | 99 | 100 | 100 | 100 | 0,4 s | 0 ms | 0 |
| Desktop | `/sites-web` | 100 | 100 | 100 | 100 | 0,4 s | 0 ms | 0 |
| Desktop | `/saas` | 100 | 100 | 100 | 100 | 0,4 s | 0 ms | 0 |
| Desktop | `/crm` | 100 | 100 | 100 | 100 | 0,4 s | 0 ms | 0 |
| Desktop | `/realisations` | 100 | 100 | 100 | 100 | 0,4 s | 0 ms | 0 |
| Desktop | `/a-propos` | 100 | 100 | 100 | 100 | 0,3 s | 0 ms | 0 |
| Desktop | `/contact` | 100 | 100 | 100 | 100 | 0,3 s | 0 ms | 0 |
| Desktop | `/devis` | 100 | 100 | 100 | 100 | 0,3 s | 0 ms | 0,002 |

`/mentions-legales` (même exécution) : 100 / 100 / 100 et SEO 66. La page est volontairement en `noindex` tant que les informations de l'éditeur ne sont pas fournies.

Rapports bruts : `docs/qa/lighthouse-summary.json` dans l'archive. Les JSON complets se régénèrent avec `npm run qa:lighthouse`.

**Repère** : l'ancien site mesurait (même outil, accueil seulement) Performance 90 / Accessibilité 95 en mobile, et 100 / 95 en desktop (`.qa/brand-seo/after/` de l'archive d'origine).

### Film d'ouverture et mesure

Lighthouse arrive comme un nouveau visiteur sans GPU (rendu logiciel). La mesure de l'accueil **inclut donc le film complet**, dans sa version vectorielle.

| Indicateur (accueil) | Mobile | Desktop |
|---|---|---|
| FCP | 1,2 s | 0,3 s |
| LCP | 2,1 s | 0,4 s |
| Speed Index | 2,0 s | 1,4 s |
| TBT | 0 ms | 0 ms |
| CLS | 0,001 | 0 |

- Le point perdu (99 au lieu de 100) vient du **Speed Index** : les images sombres du film diffèrent de la page finale. Nous avons préféré garder le film tel quel plutôt que de l'affaiblir pour l'outil de mesure.
- Le vrai contenu est rendu dès le premier affichage, sous le film. L'élément LCP reste le visuel du hero, et non un élément du film : les écrans du film sont dessinés dans des canevas.
- Le film ne crée aucune tâche longue (TBT 0 ms) :
  - l'acte I est en CSS ;
  - la mise en scène (10 Ko) est chargée à part ;
  - la scène 3D est celle du hero, sans second contexte WebGL.
- Ces chiffres ne mesurent pas le ressenti. Un nouveau visiteur voit le film avant d'utiliser l'accueil, mais il peut le passer à tout moment (bouton, clic, touche, défilement). Les visites suivantes ont une version courte (2,7 s).

### Film avec GPU (vérifié dans Chromium avec GPU Apple M5, Metal)

- Scène 3D prête à 0,5 s : le film 3D est joué, et le symbole vectoriel n'apparaît pas.
- Résolution du film plafonnée :
  - densité 1,5 maximum ;
  - 1,6 million de pixels en desktop, 0,7 million en mobile ;
  - résolution réduite automatiquement si les images dépassent 24 ms.
- Passage au hero : le canevas est rendu au hero, et la scène interactive reprend aussitôt (`data-scene="webgl"`, sans erreur console).

### Recommandations Lighthouse restantes (sans effet sur les scores)

| Recommandation | Explication |
|---|---|
| `unused-css-rules` | Le CSS du site est inliné en entier sur chaque page (environ 15 Ko compressés). C'est un choix délibéré : aucune requête bloquante et un premier rendu immédiat. Un découpage par page gagnerait environ 8 Ko, au prix de la simplicité. |
| `uses-long-cache-ttl` | Les images ont un cache de 30 jours (noms non versionnés), contre 1 an immuable pour les bundles et la police. |
| `uses-responsive-images` / `image-delivery-insight` (accueil) | Le visuel du hero est servi dans la largeur supérieure la plus proche (5 variantes de 420 à 1300 px). L'écart restant est de quelques Ko. |
| `network-dependency-tree-insight` | Chaîne CSS inline → module JS → scène 3D. La scène est volontairement différée après le chargement. |

## 3. Optimisations en place

### Chargement initial

- **HTML prérendu** : aucune hydratation et aucun framework. Accueil : 30 Ko compressés, CSS inline compris.
- **CSS inline** : environ 15 Ko gzip, sans feuille bloquante.
- **JavaScript** : un seul module `defer`, environ 9,7 Ko gzip, sans dépendance. Le moteur du brief guidé (5 Ko) n'est chargé que sur `/devis`.
- **Police** : une seule, Archivo variable latin en WOFF2 (35 Ko), préchargée, en `font-display: swap`, avec une police de repli ajustée (CLS 0).
- **Image principale** : servie en priorité (`fetchpriority="high"`, chargement immédiat), sans animation d'opacité qui retarderait le LCP.

### Images

- AVIF et WebP responsives, générés par sharp à partir des sources (`npm run assets`).
- Dimensions explicites : pas de décalage de mise en page.
- Chargement différé hors écran.
- Les aperçus décoratifs cachés ne sont jamais téléchargés sur mobile.
- Visuels des en-têtes de pages : images au-dessus de la ligne de flottaison chargées immédiatement, la principale en priorité (un premier audit signalait sur `/crm` mobile une image LCP chargée en différé).
- Captures des sites livrés (Réalisations) : 640, 900 et 1440 px pour la fenêtre de navigateur, 300 et 560 px pour le téléphone, avec des attributs `sizes` calés sur la largeur affichée. La largeur 900 a remplacé 1000 après un premier audit qui signalait environ 18 Ko de surplus en mobile.

### Scène 3D

- Un seul draw call, sans bibliothèque : chunk de 3 Ko gzip, plus un Web Worker de moins de 1 Ko.
- Démarrage après l'événement `load`, pendant un temps mort du navigateur (`requestIdleCallback`).
- Champ de distance calculé dans un **Web Worker** : environ 40 ms, hors du fil principal.
- Compilation de shader non bloquante quand `KHR_parallel_shader_compile` est disponible.
- Résolution adaptative (×0,5 à ×1, ratio de pixels plafonné à 1,75), pause hors écran et onglet masqué.
- Arrêt définitif si l'appareil reste au-delà de 45 ms par image.
- Pas de scène en mouvement réduit, en mode « économie de données », sur un appareil à moins de 2 Go de mémoire, ou en **rendu logiciel** (SwiftShader / llvmpipe). Dans ces cas, le visuel statique (rendu du même shader) reste affiché.

> **À noter, en toute transparence** : sans la détection du rendu logiciel, l'accueil mobile tombait à **71** en performance dans Lighthouse (TBT 2 080 ms). La cause était le raymarching exécuté par le CPU (SwiftShader) dans le navigateur de test, sans GPU. Le comportement corrigé est celui qu'un utilisateur réel sans accélération matérielle mérite aussi : il reçoit le visuel statique au lieu d'une page saccadée. Sur un appareil avec GPU, la scène 3D s'exécute normalement.

### Animations

- Seules `transform` et `opacity` sont animées.
- Un seul `requestAnimationFrame` pour tous les effets liés au défilement, limité aux sections proches de l'écran (IntersectionObserver).
- Aucune bibliothèque d'animation et aucun détournement du défilement.

### Serveur

- Compression, cache d'un an immuable pour les bundles empreintés et la police, 30 jours pour les images.
- En-têtes de sécurité (HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, COOP).
- CSP en balise meta : scripts limités au site et à Umami, script d'amorçage autorisé par empreinte (hash).

## 4. Core Web Vitals

| Indicateur | Cible | Laboratoire (mobile simulé) |
|---|---|---|
| LCP | ≤ 2,5 s | 1,4 à 1,8 s |
| INP | ≤ 200 ms | Non mesurable en laboratoire. TBT de 0 ms sur toutes les pages ; aucune tâche longue liée aux interactions observée pendant les tests. |
| CLS | ≤ 0,1 | 0 à 0,003 |

L'INP et les valeurs au 75e percentile se vérifient uniquement sur données terrain, après la mise en ligne.

