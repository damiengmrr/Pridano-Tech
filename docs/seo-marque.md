# Identification de la marque Pridano Tech

Audit et vérification locale du 19 octobre 2026, sans publication.

## Audit initial

L’accueil publié sur `https://pridanotech.fr/` et le générateur local contenaient déjà une organisation nommée « Pridano Tech », son URL, son email et son logo. Les variantes de marque étaient absentes et aucun objet `WebSite` n’était présent.

Les 10 pages générées avaient un titre unique terminé par « Pridano », un canonical correct, une description et `og:site_name: Pridano`. « Pridano » étant une variante de marque explicitement reconnue, ces métadonnées fonctionnelles ont été conservées.

## Modifications limitées au JSON-LD

- Complément de l’objet `Organization` existant : `alternateName: ["PridanoTech", "Pridano"]`. Son `name: "Pridano Tech"`, son URL, son email et son logo sont conservés.
- Ajout sur l’accueil d’un seul objet `WebSite` avec `name: "Pridano Tech"`, les mêmes variantes et `url: "https://pridanotech.fr/"`.
- L’accueil rassemble les deux objets dans un seul bloc JSON-LD avec `@graph`. Les autres pages conservent un seul objet `Organization` et un seul bloc JSON-LD.
- Aucun texte caché ou mot-clé artificiel. Aucun changement de titre, de description, de canonical, de robots, de sitemap, d’URL, de CSS, de JavaScript navigateur, d’asset ou de contenu visible.

Le complément représente 171 octets HTML sur l’accueil et 42 sur chacune des neuf autres pages, avant compression. Il ne charge aucune ressource et n’ajoute aucun code exécuté par le navigateur.

## Vérification de toutes les pages

| URL | Organization | WebSite | Métadonnées hors JSON-LD et contenu visible |
|---|---|---|---|
| `/` | Un objet enrichi | Un objet ajouté | Identiques |
| `/sites-web` | Un objet enrichi | Aucun | Identiques |
| `/realisations` | Un objet enrichi | Aucun | Identiques |
| `/saas` | Un objet enrichi | Aucun | Identiques |
| `/crm` | Un objet enrichi | Aucun | Identiques |
| `/a-propos` | Un objet enrichi | Aucun | Identiques |
| `/contact` | Un objet enrichi | Aucun | Identiques |
| `/confidentialite` | Un objet enrichi | Aucun | Identiques |
| `/mentions-legales` | Un objet enrichi | Aucun | Identiques |
| `/404` | Un objet enrichi | Aucun | Identiques |

Le sitemap contenant 8 URL et `robots.txt` sont identiques octet par octet. Les directives `noindex` des pages concernées sont conservées. Les fichiers HTML historiques hors générateur restent inchangés.

## Comparaison visuelle et tests

- Comparaison de 20 paires de captures pleine page : les 10 pages à 1440 px et à 390 px. Les PNG avant/après sont identiques octet par octet, donc aucune différence de pixels. Captures réalisées dans Chromium avec mouvement réduit pour rendre la comparaison reproductible. Le code d’animation lui-même n’a pas changé.
- Comparaison des sources : après retrait du bloc JSON-LD, chaque page est strictement identique avant/après, y compris son corps HTML et toutes ses autres métadonnées.
- `npm run lint` : réussi.
- `npm test` : 15 tests réussis. Le test de marque vérifie les 10 pages, le JSON valide, les noms exacts, l’unicité des entités et des métadonnées, et la conservation des champs existants.
- `npm run test:frontend` : 14 tests réussis, couvrant notamment desktop, laptop, tablette, mobile, navigation, interactions et formulaires.
- `git diff --check` : réussi.

Les captures, l’audit JSON par page et les rapports Lighthouse bruts sont conservés localement sous `.qa/brand-seo/` (répertoire ignoré par Git).

## Lighthouse avant / après

Mesures locales sur l’accueil, même URL `http://127.0.0.1:4182/`, Lighthouse 12.8.2 et même Chrome, profils mobile et desktop. Il s’agit de mesures du build de production servi localement, pas d’un nouvel audit du site publié.

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Mobile | 80 → 90 | 95 → 95 | 100 → 100 | 100 → 100 |
| Desktop | 100 → 100 | 95 → 95 | 100 → 100 | 100 → 100 |

Une mesure avant et une après par profil. Le score de performance dépend de l’exécution ; la hausse mobile ne prouve pas une accélération provoquée par le JSON-LD. Aucune baisse n’est observée. Le score d’accessibilité à 95 était déjà présent et reste inchangé ; aucune correction hors périmètre n’a été effectuée.

## Portée des validations

Les contrôles locaux valident la syntaxe JSON, les types et champs attendus, l’absence de doublons et la conservation des pages. Aucun résultat d’un validateur externe ni d’une nouvelle inspection Search Console n’est revendiqué.

Google recommande `WebSite` sur la page d’accueil pour indiquer le nom préféré et ses alternatives. Ce balisage aide à identifier la marque ; il ne garantit ni position ni délai de prise en compte. Les variantes de casse ne sont pas ajoutées artificiellement aux champs.

Sources : [Nom du site — Google Search Central](https://developers.google.com/search/docs/appearance/site-names), [Organization — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/organization).
