# TESTS — exécutés, résultats et limites

**Contexte**

- Date : 2 novembre 2026.
- Machine : macOS (Apple Silicon), Node 26.8.1.
- Navigateur : Chromium fourni par Playwright.
- Build : `npm run build`, servi en local par Express.

**Aucun envoi réel**

- Aucune demande commerciale n'a été envoyée pendant les tests.
- Les appels à `/api/contact` et `/api/send-brief` sont interceptés dans les tests navigateur.
- Côté serveur, l'envoi d'email est remplacé par une fonction de test.
- Aucune clé Resend ni Groq n'a été utilisée.

## 1. Résumé

| Suite | Commande | Résultat |
|---|---|---|
| Contrôles statiques | `npm run lint` | ✅ 55 fichiers JS, 18 pages, 350 références de ressources locales, aucun secret dans les 32 fichiers servis, ESLint sans erreur |
| Tests Node | `npm test` | ✅ 41/41 |
| Tests navigateur | `npm run test:frontend` | ✅ 20/20 (1,5 min). Après les changements du 3 novembre, le test du hero vérifiait encore l'ancien titre (« Des sites ») ; il a été aligné sur le nouveau titre, puis toute la suite relancée : 20/20. |
| QA visuelle | `npm run qa:visual` | ✅ 126 captures le 2 novembre (18 routes × 7 largeurs, de 320 à 1920 px), puis 42 captures le 3 novembre des pages touchées (accueil, prestations, logiciels, sites web, SaaS, Business OS) : aucun débordement horizontal ; seule erreur console : le 404 attendu de la page 404 |
| Lighthouse | `npm run qa:lighthouse` | ✅ 12 pages × mobile et desktop : Performance 99 à 100, Accessibilité 100, Bonnes pratiques 100, SEO 100 |
| Non-régression | Comparaison de pixels avec le ZIP d'origine | ✅ Voir NON-REGRESSION.md |
| Build de production | `PUBLIC_SITE_URL=https://pridanotech.fr NODE_ENV=production npm run build` | ✅ 22 fichiers générés, origine canonique https://pridanotech.fr, pages indexables (`robots.txt` : `Allow: /`). C'est ce build qui est livré dans `public/`. |
| Installation depuis l'archive | Archive décompressée dans un dossier vierge, puis `npm ci`, `npm run build`, `npm test`, `npm run lint` | ✅ installation sans erreur, 22 fichiers générés, 41/41, lint réussi. npm signale que les scripts d'installation des dépendances ne sont pas lancés par défaut : sans effet sur le build, les tests et le lint (vérifié). Les scripts d'images (`npm run assets`, `poster`, `og`) n'ont pas été relancés dans ce dossier. |

## 2. Tests Node (`npm test`, 41 tests)

Les 25 tests existants passent toujours : contact, routes, redirections, 404, API, SEO, contenus. Une assertion a été adaptée : le test supposait qu'une carte `price-card` affiche toujours un montant, ce qui n'est plus vrai avec les cartes « Sur devis ». Il vérifie désormais l'absence du libellé « À partir de ».

Nouveaux tests :

**`tests/catalog.test.js`** (9 tests)

1. **Intégrité des données** : identifiants uniques, catégorie et besoin valides, champs obligatoires remplis, au moins une prestation par catégorie.
2. **Prix** : seules les références de prix de `brand.js` sont utilisées.
3. **Prix publiés** : les 7 prix validés sont présents (dont la landing page à 490 €, validée le 3 novembre 2026) ; aucun des 13 montants envisagés non validés (1 590, 2 490, 3 990, 3 490, 6 490, 590, 1 090, 2 290, 690, 1 790, 2 790, 8 900, 18 000 €) n'apparaît sur une page.
4. **Logiciels** :
   - pas de « Disponible » sans inscription ni formules ;
   - aucun concept avec capture, formule ou inscription ;
   - captures limitées aux images réelles ;
   - lien « Être informé » vers le formulaire de contact.
5. **Pages de catégorie** : fil d'Ariane, lien vers le devis présélectionné, FAQ visible, fil d'Ariane JSON-LD à 3 niveaux, ancre de chaque prestation dans le catalogue.
6. **Données structurées** : pas d'`offers` sans prix validé ; les offres de maintenance égalent les prix de `brand.js` ; l'`ItemList` contient toutes les prestations.
7. **Routes** : chaque route répond 200 dans Express, a sa règle Netlify identique et figure au sitemap ; la page retirée `/prestations/branding-ui-ux` redirige en 301 vers `/prestations` (Express et Netlify) et n'est plus dans le sitemap.
8. **Navigation** : liens vers `/prestations` et `/logiciels` sur chaque page ; section active marquée.
9. **Devis** : les 10 besoins sont dans le sélecteur ; le parcours « projet complet » est relié au catalogue.

**`tests/devis.test.js`** (7 tests)

1. **Normalisation des besoins** : inconnus ignorés, doublons retirés, ordre stable, libellés.
2. **Plusieurs besoins** : une question ciblée par besoin, puis délai et budget, aucune question posée deux fois, brief complet.
3. **Projet complet** : « Qu'avez-vous déjà… » avant les priorités, puis le budget.
4. **Sans besoin coché** : le parcours d'origine est inchangé.
5. **Mode IA** : une question proposée hors parcours est remplacée par la question attendue (logique d'alignement testée sans appel au modèle).
6. **Email** : besoins et précisions présents, besoin inconnu filtré, référence de la demande.
7. **Anti-doublon** : deux envois du même identifiant donnent un seul email ; un autre identifiant donne bien un second email.

## 3. Tests navigateur (`npm run test:frontend`)

Parcours existants, tous conservés :

- 5 largeurs ;
- clavier ;
- menu mobile ;
- formulaire de contact ;
- Business OS ;
- démo Sites web ;
- schéma « Moins de détours » ;
- hero ;
- mouvement réduit ;
- brief guidé ;
- liens et ancres ;
- en-tête et dock mobiles ;
- film d'ouverture.

La liste des pages testées à 5 largeurs (1440, 1280, 768, 390, 320 px) passe de 10 à 17 pages.

Nouveaux parcours :

1. **Catalogue des prestations** :
   - navigation par catégorie (ancre « Agents IA ») ;
   - lien vers la fiche « Chatbot de site » sur sa page de catégorie ;
   - « Demander un devis » ouvre `/devis?besoins=agent-ia`, avec « Agent IA » coché.
2. **Catalogue des logiciels** :
   - aucun produit « Disponible » ;
   - Finance au statut « Concept », avec sa précision ;
   - « Être informé du lancement » ouvre le contact avec « Échanger sur Pridano » sélectionné et le message prérempli.
3. **Devis à plusieurs besoins** :
   - parcours « projet » présélectionné, ajout de « Site e-commerce » ;
   - conversation jusqu'à la question ciblée sur la boutique ;
   - changement de page puis retour : conversation et cases restaurées ;
   - relecture avec un champ par besoin ;
   - double clic sur « Envoyer » : **un seul envoi** ;
   - confirmation affichée seulement après la réponse du serveur ;
   - charge utile contrôlée (besoins, précisions, identifiant) ;
   - brouillon effacé.

## 4. Points de la mission et contrôle correspondant

| Exigence | Contrôle |
|---|---|
| Pages existantes accessibles, liens internes | Tests routes, 5 largeurs, liens et ancres |
| Réalisations et Business OS conservés | Non-régression (pixels), test Business OS |
| Catalogue des prestations et navigation par catégorie | Test « catalogue des prestations », `catalog.test.js` |
| Catalogue des logiciels et statuts | Test « catalogue des logiciels », `catalog.test.js` |
| Plusieurs prestations dans le devis, sans doublon ni perte de réponse | `devis.test.js`, test « devis à plusieurs besoins » |
| Messages d'erreur | Contact : erreur serveur simulée, champs invalides (navigateur). Devis : brief vide refusé par l'API (400, test Node). Les messages d'erreur du devis côté navigateur sont ceux du moteur existant, non modifiés. |
| Confirmation seulement après succès | Test « devis à plusieurs besoins » |
| Routes directes et rechargement | Express : test « routes » ; Netlify : règles vérifiées par le même test |
| SEO, sitemap | Tests SEO, test « routes », Lighthouse SEO 100 |
| Accessibilité | Lighthouse 100, test clavier, menu mobile |
| Performances | Lighthouse 99 à 100 |

## 5. Limites (non testé, ou testé partiellement)

- **Netlify** :
  - aucun déploiement n'a été fait ;
  - les règles de `netlify.toml` sont vérifiées par lecture automatique, et les fonctions par leurs adaptateurs ;
  - à vérifier sur une Deploy Preview : les 6 nouvelles URL, la redirection de `/prestations/branding-ui-ux`, puis un envoi de contact et de devis vers une adresse interne.
- **Envoi réel d'emails** : non testé (aucune clé utilisée). Le contenu de l'email est testé, pas sa livraison.
- **Devis en mode IA (Groq)** :
  - non appelé : aucune clé dans cet environnement ;
  - la consigne envoyée au modèle et l'alignement de ses réponses sont testés sans appel réel ;
  - à tester sur une Deploy Preview avec `GROQ_API_KEY`.
- **Anti-doublon** :
  - la mémoire des demandes reçues est propre à chaque instance du serveur ;
  - sur Netlify, deux envois identiques traités par deux instances différentes pourraient donner deux emails ;
  - côté navigateur, le double envoi est déjà bloqué (bouton désactivé pendant l'envoi, testé) ;
  - une protection complète demanderait un stockage partagé (voir ROADMAP.md).
- **Navigateurs** : Chromium uniquement. Safari et Firefox restent à vérifier en recette, ainsi qu'iPhone et Android réels.
- **Lighthouse** :
  - mesures en local, sans CDN ;
  - les audits signalés « à revoir » (`unused-css-rules`, `uses-long-cache-ttl` en local, `network-dependency-tree-insight`) existaient déjà et n'empêchent pas les scores de 99 à 100.
  - Le cache long est configuré pour Netlify dans `netlify.toml`.
- **Lecteurs d'écran** : structure vérifiée par l'arbre d'accessibilité et axe (via Lighthouse). Pas de test avec VoiceOver ou NVDA.
