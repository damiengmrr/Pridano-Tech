# Vérification des contenus

**Règle suivie, à la demande de l'équipe** : les textes sont ceux du site existant (pridanotech.fr, identique au ZIP fourni). La refonte porte sur le design, la mise en scène, la navigation et la technique. **Aucun texte de contenu n'a été réécrit.**

Seules différences admises :

- correction des accents manquants dans le devis guidé (par exemple « Verification » → « Vérification ») ;
- libellés d'interface et d'accessibilité indispensables, détaillés au §3 ;
- un message d'erreur technique du brief guidé, rendu sans détail interne, voir §3 ;
- les ajustements décidés après l'analyse clients, professionnels et marché, détaillés au §5 (libellés repris d'autres pages du site existant, blocs prêts mais masqués tant que vous n'avez pas fourni l'information).

La source unique des faits dans le code est `site/data/brand.js`.

## 1. Contrôle automatique

Chaque fragment de texte visible du nouveau site a été comparé au corpus du site existant :

- les pages publiées ;
- le gabarit du devis guidé ;
- le code des composants.

Après réalignement, **toutes les phrases de contenu proviennent du site existant**. Les seuls fragments restants sont :

| Fragment | Nature |
|---|---|
| « Représentation de notre approche · visuel d'illustration », « Un outil commun · Informations reliées · Actions simplifiées » | Assemblage de deux légendes du site existant |
| « (nouvel onglet) », « (image originale, nouvel onglet) », « Votre message à l'assistant » | Textes réservés aux lecteurs d'écran |

## 2. Où sont repris les textes du site existant

| Page | Textes repris |
|---|---|
| Accueil | Titre de la page et description. Sur-titre du hero « Création de sites web & logiciels sur mesure · Montpellier » (titre d'onglet de votre page d'accueil ; remplace « Studio digital indépendant · Montpellier », voir §5). H1 « Des sites qui marquent. Des idées qui avancent. ». Chapô « Nous créons des sites web sur mesure… ». Boutons « Démarrer un projet » et « Découvrir nos réalisations ». « La première impression compte / Avant le premier appel, il y a votre site. » et son paragraphe. « Design. Développement. Impact. » et « Des sites qui marquent. Des outils qui font avancer. ». Les trois offres « Notre première expertise / Votre site. À son meilleur niveau. » (avec « Une image juste. », « Chaque écran compte. », « Le détail fait la différence. »), « Notre deuxième expertise / Parfois, un site ne suffit pas. », « Notre produit maison ». « Le premier pas, simplement / Tout commence par un échange. ». « Moins de détours. Plus de possibilités. » et le schéma « Fichiers Excel / Double saisie / Processus manuels → Un outil commun ». La méthode en 8 étapes. « Une sélection, du concret / Des idées devenues des présences. ». « Nous construisons aussi le nôtre. ». « Pourquoi Pridano / Une belle image. Des bases solides. » et ses 4 principes. « Du design au développement, des personnes derrière chaque décision. ». Appel final « Le prochain lien, c'est le vôtre. / Votre prochain site. Le début de quelque chose. / Une idée. Un échange. Une connexion. / Vous cherchez plutôt un logiciel ? » |
| Sites web | Intégralité : hero, création / refonte, « De l'idée au dernier pixel » avec les 9 étapes et leurs légendes d'origine (« Poser la bonne intention avant le premier pixel. »…), « Ce qui fait un bon site », méthode, réalisations, FAQ « Avant de vous lancer. » |
| SaaS & logiciels | Hero, « Partir du quotidien » (4 problèmes et réponses), « Votre logiciel. Vos règles. » avec le schéma « Vos données / Vos équipes / Vos outils / Vos clients / Vos règles », « De la question à l'usage », « Le savoir-faire, mis en pratique / Nous développons notre propre produit. » |
| Le produit Pridano (`/crm`) | Intégralité : hero, captures et textes Pilotez / Facturez / Planifiez / Centralisez, parcours, vision des modules, concept Ask, « Parlons de votre usage. », toutes les mentions de prudence |
| Réalisations | Intégralité (Solaria Média, Damien Gamarra, Prévenir Pour Gagner, textes et tags) |
| Le studio | Intégralité (hero, Damien Gamarra, Noah Lemoing, « Notre façon de faire », produit maison) |
| Contact | Intégralité : « Le premier pas, simplement », « Et ensuite ? », « Votre projet 01 — Faisons connaissance », libellés, bouton « Parler de votre projet », consentement, « Les champs marqués * sont nécessaires. Aucun envoi avant votre validation. », message de confirmation du serveur |
| Devis guidé | Titre « Devis intelligent ». En-tête « Devis guidé / Décrivez le projet. Le brief se construit en quelques échanges. » (présent dans le code du site existant). Tous les messages de l'assistant, de la relecture et de la validation (accents corrigés). |
| Navigation et pied de page | « Sites web », « Réalisations », « SaaS & logiciels », « Le produit Pridano » (libellé de votre pied de page, à la place de « Le CRM »), « Le studio », « Démarrer un projet » ; colonnes « Explorer » et « Pridano », « Retour en haut ↑ » |
| Mentions légales | Textes d'origine (« Informations du site », « Informations en cours de finalisation », « Données personnelles »), présentés en liste. Ajout des rubriques « Éditeur du site » et « Hébergement » (Netlify, Inc., hébergeur réel du site), voir §5. |
| Politique de confidentialité | Texte d'origine. Les champs `[À compléter]` sont remplis depuis `brand.js` ou retirés, et quatre passages sont mis à jour pour décrire le site tel qu'il fonctionne réellement, voir §5. |
| 404 | Textes d'origine |
| Titres d'onglet et descriptions | Ceux du site existant, au format « Titre · Pridano » |

## 3. Libellés d'interface ajoutés (non éditoriaux)

| Élément | Raison |
|---|---|
| « Menu », « Fermer le menu », « Aller au contenu », « Accueil », « Nous contacter », « Devis guidé » dans le menu mobile | Navigation et accessibilité (les deux derniers reprennent des libellés existants) |
| Messages d'erreur par champ du formulaire (« Indiquez votre nom. »…) | Accessibilité : chaque erreur est annoncée sur son champ. Le message global reprend celui du serveur : « Merci de vérifier votre nom, votre email, votre message et votre accord pour être recontacté. » |
| Libellés des sections dans le rail d'index (desktop) | Repères de navigation |
| Message serveur « Le service d'envoi est momentanément indisponible… » | Remplace un message qui affichait au visiteur le nom d'une variable technique (`RESEND_API_KEY`) |
| Bouton d'en-tête « Devis guidé » sur Contact, « Nous contacter » sur Devis guidé | Libellés existants ; évite un bouton qui renvoie vers la page où l'on se trouve déjà |
| « Prendre rendez-vous » | Bouton affiché seulement si `brand.bookingUrl` est renseigné |
| « À partir de … HT », « Pour repère : … » | Affichés seulement si un prix est renseigné dans `pricing` |
| « Combien coûte un logiciel ? » (page SaaS) | Adapté de votre question de FAQ « Combien coûte un site web ? » ; n'apparaît qu'avec un prix SaaS renseigné. Le sur-titre « Parlons concrètement » et le paragraphe viennent de votre page Sites web. |
| « Témoignages », « Ce qu'en disent nos clients. » | En-tête de section, affichée seulement avec au moins un témoignage réel dans `testimonials` |
| « Éditeur du site », « Nom », « Forme », « Siège », « Immatriculation », « TVA », « Directeur de la publication », « Hébergeur », « Adresse », « Site » | Intitulés des mentions légales ; chaque ligne n'apparaît que si l'information est renseignée |

## 4. Retiré lors du réalignement

Ces textes avaient été rédigés pendant la refonte et ne figurent pas sur votre site :

- la FAQ de l'accueil et celle de la page SaaS ;
- le manifeste « Chaque entreprise commence par un point… » ;
- les titres « Trois nœuds. Un seul réseau. » et « Du dispersé au connecté. » ;
- la note « L'IA, quand elle sert un usage » ;
- la section « Le symbole Pridano » de la page Studio ;
- le positionnement « TPE, PME et professionnels » ;
- la mention « IA appliquée » ;
- les légendes « Le point rejoint le réseau ».

Le positionnement de votre brief (« Accompagner les TPE, PME et professionnels… ») n'est plus affiché. Si vous souhaitez l'ajouter, fournissez la formulation exacte à publier.

## 5. Ajustements après l'analyse clients, professionnels et marché

Décisions prises avec l'équipe :

| Sujet | Ce qui a changé |
|---|---|
| Libellé « Le CRM » | Devient « Le produit Pridano » partout (menu, nœud 03, fil d'Ariane). C'est le libellé de votre pied de page d'origine. L'URL `/crm` ne change pas. |
| Sur-titre de l'accueil | « Création de sites web & logiciels sur mesure · Montpellier », repris du titre d'onglet de votre page d'accueil : un visiteur comprend l'offre en une ligne. |
| Prix | Blocs « À partir de … » prêts sur Sites web et SaaS, **masqués** tant que `pricing[].from` est vide. Aucun montant n'a été inventé. |
| Contact | Téléphone et prise de rendez-vous en ligne prêts dans Contact, le menu, le pied de page et l'appel final, **masqués** tant que `brand.phone` et `brand.bookingUrl` sont vides. |
| Témoignages | Section prête sur l'accueil et les réalisations, **masquée** tant que `testimonials` est vide. Uniquement des citations réelles, avec l'accord de la personne. |
| Réalisations | Solaria Média et Prévenir Pour Gagner sont montrés avec des captures réelles de leur site en ligne (navigateur et mobile, `npm run captures`), à la place des visuels d'illustration. |
| Portfolios historiques | `/portfolio-noah.html` et `/portfolio-dada.html` restent accessibles mais sont exclus de Google (`noindex, nofollow`). |
| Mentions légales | Construites à partir de `brand.legal`. L'hébergeur réel (Netlify, Inc.) est indiqué. La page reste en `noindex` tant que l'éditeur n'est pas complet. |
| Politique de confidentialité | Champs remplis depuis `brand.legal` ou retirés (plus aucun crochet visible). Passages mis à jour : ressources externes (aucune sur les pages principales ; Google Fonts, Tailwind et unpkg seulement sur les portfolios historiques), mesure d'audience Umami sans cookie, stockage de session utilisé pour l'animation de transition. **La date « Version du 2 avril 2026 » est à mettre à jour à la publication.** |

## 6. Deuxième série d'ajustements (retours de l'équipe, 22 octobre 2026)

Informations fournies par l'équipe et publiées :

| Information | Où elle apparaît |
|---|---|
| Téléphone 07 78 70 25 18 | Contact, menu, pied de page, mentions légales, JSON-LD |
| Prise de rendez-vous `calendly.com/pridanotech` | Bouton « Prendre rendez-vous » : Contact, appel final, menu, pied de page |
| LinkedIn et Instagram | JSON-LD `sameAs` |
| Prix « à partir de » (formule « Accessible », HT) : site 990 €, refonte 790 €, logiciel 3 900 € | Sites web, SaaS, accueil, FAQ, JSON-LD |
| Délai : livré en 3 à 5 jours (sites) | Cartes de prix, accueil, nouvelle question de FAQ |
| Maintenance sans engagement : Essentiel 29 €, Sérénité 59 €, Croissance 119 € HT par mois | Nouvelle section sur Sites web, FAQ, JSON-LD |
| Retrait du portfolio de Damien Gamarra des réalisations | Réalisations, accueil, JSON-LD |

Textes nouveaux ou modifiés, rédigés pour ces ajouts (à relire par l'équipe) :

| Texte | Où |
|---|---|
| « Réalisations — Sites web » (titre d'onglet), « Une agence. Un site associatif. Des besoins différents, une attention commune au détail. » | Réalisations : « Un univers personnel » et « portfolios » retirés avec le portfolio de Damien |
| « Les visuels sont des captures des sites en ligne. Ouvrez chaque lien pour découvrir le site complet. » | Note sous les réalisations |
| « En combien de temps mon site est-il livré ? » / « Votre site est livré en 3 à 5 jours. Le planning exact est précisé dans la proposition. » | FAQ Sites web |
| « Livré en 3 à 5 jours », « Le périmètre exact est précisé dans la proposition, avant tout engagement. » | Cartes de prix |
| « Après la mise en ligne », « Un site suivi. Sans engagement. », « Hébergement, sauvegardes, surveillance et modifications : choisissez le suivi qui correspond à votre activité, et changez de formule quand vous le souhaitez. », contenu des trois formules, « Conseillé », « Parler du suivi de mon site », « Prix HT par mois, sans durée minimale. » | Section maintenance |
| « Pour repère : maintenance sans engagement à partir de 29 € HT par mois. » | Ajouté à la réponse de FAQ d'origine |

Visuels des en-têtes de pages (décoratifs, masqués aux lecteurs d'écran) : captures réelles des sites livrés et du produit maison. Les mots affichés viennent du site existant (« Stratégie », « Design », « Développement », « Votre identité » ; « Vos données », « Vos équipes », « Vos outils », « Vos clients », « Vos règles » ; onglets « Pilotez », « Facturez », « Planifiez »), plus les prénoms des fondateurs, les coordonnées de Montpellier et quatre lignes de code réel du site (`tokens.css`).

Section « La première impression compte » : même titre et même paragraphe qu'à l'origine, présentés en taille normale. Les étapes du visuel reprennent des fragments du texte (« Il présente votre activité », « Inspire confiance », « Donne envie de vous choisir ») et du titre (« Le premier appel »).

Film d'ouverture : uniquement des textes existants. Le générique « Studio digital indépendant · Montpellier » est l'ancien sur-titre de l'accueil ; la signature est « Des sites qui marquent. Des outils qui font avancer. » ; les écrans portent les noms des projets réels (Solaria Média, Prévenir Pour Gagner, Pridano Business OS). Ajouts d'interface : les numéros d'acte (I à IV) et le bouton « Passer l'intro ».

## 7. Informations à compléter

1. **Mentions légales** (en attente) : dénomination juridique, forme sociale, siège, numéro d'immatriculation (SIREN/SIRET, RCS), TVA intracommunautaire, directeur de la publication → `brand.legal`. Les prix sont affichés HT : la société facture donc la TVA, et son numéro de TVA devra figurer dans les mentions.
2. **Témoignages réels** (en attente des réponses clients) avec accord écrit → `testimonials`.
3. **Fiche Google Business Profile** : à ajouter dans `brand.sameAs` une fois créée.
4. **Politique de confidentialité** : confirmer la liste des sous-traitants (Netlify, Resend, Groq, Umami, et Calendly pour la prise de rendez-vous) et la date de version.
5. **Liens externes** à revérifier à la publication : `solariamedia.netlify.app`, `prevenirpourgagner.com`, `calendly.com/pridanotech`.

## 8. Ressources

| Ressource | Statut |
|---|---|
| Logos officiels | Vectorisés automatiquement (`brand-source/` → `site/data/logo-geometry.json`) |
| Rendu 3D du hero | Calculé à partir du tracé officiel |
| Photos des fondateurs, visuels des réalisations, captures produit | Réutilisés et optimisés (AVIF/WebP) |
| Captures des sites livrés (Solaria Média, Prévenir Pour Gagner) | Prises sur les sites en ligne le 22 octobre 2026, sans interaction (`brand-source/realisations/`) |
| Police Archivo | Licence SIL OFL 1.1, fichier joint `public/assets/fonts/ARCHIVO-OFL.txt` |

L'ancienne capture `pridano.png` (« étude de cas NovaSpace », « Lighthouse xxx ») n'est pas utilisée sur les nouvelles pages. Elle reste uniquement dans le portfolio historique `/portfolio-noah.html`, inchangé.

Les images inutilisées de l'ancien dossier ne sont pas incluses dans l'archive :

- `setup-pridano.jpg` (76 Mo)
- `fika.jpeg`
- `logo-nono.png`
- `campus-pridano.jpg`
- `team-pridano.jpg`
- `ynov.jpeg`
- la capture d'écran du 19 janvier 2026
