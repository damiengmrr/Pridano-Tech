# Pridano — site public

Refonte du site existant, sans changement de framework : HTML prérendu, CSS et JavaScript natif, Express et fonctions Netlify. Le CRM reste un projet séparé.

## Travailler en local

```sh
npm ci
npm run build
npm run dev
```

Le serveur utilise `PORT` (3000 par défaut). Si ce port est déjà occupé, démarrer un aperçu isolé :

```sh
node -e "require('./server').createApp().listen(4173, '127.0.0.1')"
```

Ouvrir http://127.0.0.1:4173. Relancer `npm run build` après modification des templates ; les modifications CSS/JS sont servies directement.

## Où modifier le site

- `site/pages.js` : les sept pages principales, les mentions, la confidentialité et la 404.
- `site/components.js` : marque, navigation, footer, contenus des réalisations et scènes communes.
- `site/product.js` : les quatre écrans du théâtre Pridano, l’aperçu d’accueil et les courbes de connexion.
- `site/privacy.html` : texte de confidentialité conservé depuis le site existant.
- `public/assets/css/pridano.css` : tokens de marque en tête, composants, animations et adaptations responsive.
- `public/assets/js/pridano.js` : navigation, scène de construction, théâtre produit et formulaire.
- `scripts/build.js` : génération HTML, métadonnées, sitemap et robots. Les fichiers HTML générés dans `public/` sont versionnés pour rester directement exploitables.
- `server/handlers/contact.js` : formulaire court, validation serveur et transport email existant. Adaptateur Netlify : `netlify/functions/contact.js`.

Les portraits optimisés sont dérivés des originaux conservés. La police Manrope est auto-hébergée, avec sa licence OFL. Le logo existant sert aussi d’aperçu social, remplaçable dans le générateur. Aucune police distante ni bibliothèque d’animation sur les nouvelles pages.

Les pages historiques de devis et de portfolios sont conservées avec leurs composants et dépendances. Les anciennes URLs d’accueil, services, projets, studio et confidentialité ont des redirections 301 dans Express et dans `netlify.toml`. Le devis guidé reste disponible sur `/devis.html`.

## Vérification

```sh
npm run lint
npm test
npx playwright install chromium
npm run test:frontend
```

`lint` contrôle la syntaxe JS, les assets locaux, les H1, les métadonnées et ESLint sur le nouveau code. Pas de TypeScript dans cette stack, donc pas de typecheck TypeScript.

Les tests serveur utilisent un transport email injecté. Les tests navigateur interceptent les envois du formulaire : aucun email réel n’est envoyé. Ils couvrent les sept pages à 1440, 1280, 768 et 390 pixels, les liens, les redirections, le menu, les étapes de conception, les erreurs et la confirmation du formulaire. Les captures sont dans `test-results/visual` et `.qa` (ignorés par Git). `node scripts/visual-qa.js` actualise les vues destinées à l’inspection visuelle.

## Avant une publication ultérieure

1. Renseigner les informations juridiques réelles : dénomination, forme sociale, siège, immatriculation, responsable de publication, hébergeur. Le texte de confidentialité historique contient encore des champs à compléter ; faire correspondre cette page aux prestataires et pratiques effectivement retenus.
2. Configurer `PUBLIC_SITE_URL` avec le domaine public confirmé puis exécuter `NODE_ENV=production npm run build`. En local, `robots` et les métadonnées interdisent l’indexation. Un build de production refuse une origine localhost. Le sitemap et les canonicals utilisent uniquement cette origine configurée.
3. Vérifier les paramètres Resend existants (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL`), le domaine expéditeur et effectuer un envoi réel autorisé. Une clé est présente localement mais sa validité et la livraison réelle n’ont pas été testées. Les adaptateurs Netlify et leurs redirections sont préparés ; aucune publication ni validation sur un hébergement Netlify n’a été effectuée.

Le CRM est présenté comme un produit en développement. Les modules, le workflow et Ask sont explicitement une vision produit : les conditions d’accès et le périmètre commercial restent à confirmer. Les quatre captures de développement fournies sont maintenant présentées sur `/crm`, avec un aperçu du dashboard sur l’accueil. Les références conservées sont Prévenir Pour Gagner, le portfolio publié de Damien Gamarra et la démonstration locale de Noah Lemoing. Aucun résultat chiffré ni témoignage ajouté.

## Polish Phase 2

Les quatre PNG originaux sont conservés dans `public/assets/images/pridano/`. `node scripts/prepare-product-images.js` régénère les versions WebP et les cadrages mobiles, sans retoucher les textes ou les valeurs. Sharp est un outil de préparation local, sans code envoyé au navigateur.

Le théâtre charge d’abord le dashboard ; les autres écrans sont chargés lors de leur sélection. Les onglets sont utilisables au clavier (flèches, Début, Fin). La visite avance toutes les huit secondes uniquement lorsqu’elle est visible sur desktop. Une sélection manuelle la met en pause. Elle s’arrête également quand l’onglet est masqué, quand la capture originale est ouverte ou lorsque la réduction des animations est activée. Sur mobile, la sélection est manuelle par défaut. Le bouton « Agrandir » ouvre le PNG original, avec défilement sur petit écran.

Le hero se construit une fois, les neuf étapes de conception restent pilotables au scroll ou au toucher, et les courbes sont animées seulement à l’écran. Les transitions de pages utilisent l’amélioration progressive native du navigateur. Aucun ajout de bibliothèque d’animation ni changement du transport des formulaires, des redirections ou de la génération SEO. Cette phase n’a pas été publiée.
