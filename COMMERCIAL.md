# COMMERCIAL — prix publiés, tarifs envisagés et points à valider

Ce document sert à préparer une décision des fondateurs. **Il ne publie rien.**

- Les seuls prix affichés sur le site sont les prix déjà validés (section 1). Ils n'ont pas été modifiés.
- Les tarifs de la section 2 viennent de votre analyse concurrentielle. Ils ne figurent sur **aucune** page, dans aucune donnée structurée et dans aucun fichier du site. Le test `tests/catalog.test.js` le vérifie à chaque `npm test` : il échoue si l'un de ces montants apparaît dans une page générée.
- Les durées de production, frais et calculs ci-dessous sont des **hypothèses de travail**. Ils ne viennent ni de vos temps passés réels ni de devis fournisseurs. Remplacez-les par vos propres chiffres avant toute décision.

## 1. Prix publiés aujourd'hui (validés, inchangés)

Source unique : `site/data/brand.js` (`pricing`, `maintenance`, `pricingTax: 'HT'`).

| Prestation | Prix publié | Délai publié | Avantages publiés |
|---|---:|---|---|
| Création de site web | Dès 990 € HT | 3 à 5 jours | 1 an d'hébergement et de nom de domaine offerts · Accès au CMS · Accompagnement personnalisé · Assistance 7j/7 pendant 1 an · Le site est à vous |
| Refonte de site web | Dès 790 € HT | 3 à 5 jours | Les mêmes avantages que la création · Audit gratuit du site actuel · Référencement Google conservé |
| Logiciel sur mesure | Dès 3 900 € HT | — | Atelier de cadrage offert · Prix ferme, sans surprise · 3 mois de garantie · Le code vous appartient |
| Landing page | Dès 490 € HT | — | Aucun avantage publié. Prix validé par les fondateurs le 3 novembre 2026. |
| Maintenance Essentiel | 29 € HT / mois | — | Hébergement et nom de domaine · Sauvegardes et sécurité · Assistance sous 48 h |
| Maintenance Sérénité | 59 € HT / mois | — | Tout Essentiel · 5 petites modifications par mois, faites sous 48 h · Assistance 7j/7 sous 24 h |
| Maintenance Croissance | 119 € HT / mois | — | Tout Sérénité · Petites modifications illimitées, faites sous 24 h · 1 nouvelle page par mois · Référencement Google suivi |

### Où ces prix apparaissent dans le nouveau catalogue

Les nouvelles prestations réutilisent ces prix par référence (`price: { ref }` dans `site/data/catalog.js`). Aucun nouveau montant n'a été créé.

| Prestation du catalogue | Prix affiché | Référence |
|---|---|---|
| Landing page | Dès 490 € HT | `landing` |
| Site vitrine | Dès 990 € HT | `site` |
| Refonte de site | Dès 790 € HT | `refonte` |
| Logiciels métier | Dès 3 900 € HT | `saas` |
| Hébergement, Formules de maintenance, Sauvegardes, Mises à jour, Assistance | Dès 29 € HT / mois | `maintenance` |
| Les 22 autres prestations (sur 31) | « Sur devis » | aucune |

## 2. Tarifs envisagés — NON VALIDÉS, NON PUBLIÉS

### Méthode de lecture

- **Jours de production** : temps de travail total estimé (une personne), cadrage, échanges et mise en ligne compris. C'est une hypothèse à confronter à vos projets passés.
- **Prix ÷ jours** : indicateur de rentabilité brute, avant frais tiers, charges et temps commercial. Il permet de repérer les offres où la marge risque d'être faible.
- **Frais tiers** : coûts payés à des fournisseurs. Leurs montants changent : vérifiez la grille du fournisseur au moment de chaque devis. Il faut aussi décider s'ils sont payés directement par le client ou refacturés.

### Sites web et e-commerce

| Offre | Prix HT envisagé | Contenu à définir | Jours (hypothèse) | Prix ÷ jours |
|---|---:|---|---:|---:|
| Site vitrine Essentiel | Dès 1 590 € | 1 à 5 pages, formulaire, bases SEO | 3 à 5 | 318 à 530 € |
| Site vitrine Business | Dès 2 490 € | 6 à 10 pages, prise de rendez-vous, contenus accompagnés | 5 à 8 | 311 à 498 € |
| Site Premium | Dès 3 990 € | Design sur mesure poussé, animations, parcours complexes | 8 à 12 | 333 à 499 € |
| Refonte complète | Dès 1 590 € | Audit, reprise des contenus, redirections 301, suivi du référencement | 4 à 6 | 265 à 398 € |
| E-commerce Starter | Dès 3 490 € | Catalogue limité (≈ 50 produits), paiement, livraison | 8 à 12 | 291 à 436 € |
| E-commerce Business | Dès 6 490 € | Grand catalogue (les intégrations aux outils de gestion ne sont plus proposées depuis le 3 novembre 2026) | 15 à 20 | 325 à 433 € |

Frais tiers à prévoir :

- **Tous les sites** : nom de domaine, hébergement, outil de CMS si payant, polices ou images sous licence.
- **E-commerce** :
  - abonnement de la plateforme (Shopify, ou hébergement WooCommerce) ;
  - commissions des moyens de paiement (Stripe, PayPal…), qui sont un pourcentage du chiffre d'affaires du client ;
  - extensions et thèmes payants ;
  - outil d'expédition.

Risques et points d'attention :

- **Incohérence avec le prix publié.** « Création de site web dès 990 € » est publié. Un « Site vitrine Essentiel dès 1 590 € » le contredirait. Depuis le 3 novembre 2026, la landing page a son propre prix (dès 490 €) et les 990 € correspondent au site vitrine. Avant de publier une grille Essentiel / Business / Premium, il faut décider si le site vitrine passe à 1 590 € ou reste à 990 €, puis ajuster la grille et les textes ensemble.
- **Refonte.** La refonte est publiée à 790 €, la refonte complète serait à 1 590 €. Il faut définir clairement la différence entre les deux, sinon les clients choisiront toujours 790 €.
- **E-commerce et contenus juridiques.** Conditions générales de vente, droit de rétractation et mentions obligatoires sont de la responsabilité du marchand. Indiquez dans le devis qu'ils sont fournis par le client, ou par un juriste.

### Branding et design — retiré de l'offre

Les fondateurs ont retiré entièrement la catégorie Branding & UI/UX le 3 novembre 2026 (logo, identité visuelle, charte graphique, design UI/UX, maquettes, motion design). Les tarifs envisagés pour ces offres (590, 1 090, 2 290, 490 et 990 €) ne sont donc plus d'actualité. Le test `tests/catalog.test.js` continue de vérifier que 590, 1 090 et 2 290 € n'apparaissent nulle part. 490 € est désormais le prix validé de la landing page.

### Automatisations et IA (prix d'installation)

| Offre | Installation HT envisagée | Contenu à définir | Jours (hypothèse) | Prix ÷ jours |
|---|---:|---|---:|---:|
| Automatisation simple | Dès 690 € | 1 déclencheur, 2 à 3 applications | 1 à 2 | 345 à 690 € |
| Automatisation Business | Dès 1 790 € | Plusieurs scénarios, gestion des erreurs | 3 à 5 | 358 à 597 € |
| Assistant IA FAQ | Dès 990 € | Base de connaissances, intégration au site | 2 à 3 | 330 à 495 € |
| Assistant IA connecté | Dès 2 790 € | Connexion aux outils (agenda, CRM…) | 5 à 7 | 399 à 558 € |
| Agent IA métier | Dès 3 900 € | Missions métier, validations, journal d'activité | 8 à 12 | 325 à 488 € |

Frais tiers **récurrents**, à prévoir dès le devis :

- **Outil d'automatisation** : abonnement Make, Zapier ou n8n Cloud, ou un serveur pour n8n auto-hébergé.
- **Modèle d'IA** : facturé à l'usage par son fournisseur, selon le volume de questions. Ce coût varie d'un client à l'autre et d'un mois à l'autre.
- **Hébergement** de l'assistant et de sa base de connaissances.

Risques :

- **Pas d'offre récurrente définie.** La grille ne propose que des prix d'installation. Or une automatisation casse quand une application change son API, et un assistant IA doit être réajusté. Sans forfait de suivi mensuel, ce travail ne serait pas payé. Un forfait de ce type est à créer et à valider ; aucun n'est publié.
- **Agent IA métier au même prix qu'un logiciel sur mesure** (3 900 €). C'est cohérent seulement si le périmètre est comparable.
- **Obligations réglementaires** :
  - RGPD (données transmises au fournisseur du modèle, lieu de traitement) ;
  - transparence envers les utilisateurs qui échangent avec une IA (règlement européen sur l'IA).
  À faire vérifier par un conseil. Ce n'est pas un avis juridique.
- **Ce qui est déjà affiché** : la page Agents IA dit déjà, honnêtement, que l'IA peut se tromper, qu'il y a une validation humaine et que les coûts d'usage s'ajoutent. À garder dans les devis.

### Applications et logiciels

| Offre | Prix HT envisagé | Contenu à définir | Jours (hypothèse) | Prix ÷ jours |
|---|---:|---|---:|---:|
| Petit outil métier | Dès 3 900 € | Même niveau que « Logiciel sur mesure », déjà publié à 3 900 € | 8 à 12 | 325 à 488 € |
| Application web métier | Dès 8 900 € | Plusieurs rôles, plusieurs modules | 20 à 30 | 297 à 445 € |
| MVP SaaS | Dès 18 000 € | Comptes, abonnement, multi-clients | 40 à 60 | 300 à 450 € |
| Plateforme SaaS complète | Sur devis | — | — | — |

- **Frais tiers** :
  - hébergement de l'application et de la base de données ;
  - emails transactionnels ;
  - supervision ;
  - commissions de paiement (Stripe) pour un SaaS ;
  - comptes développeur (Apple : abonnement annuel, Google Play : frais d'inscription) pour une application mobile.
- **Risques** :
  - « Prix ferme, sans surprise » et « 3 mois de garantie » sont déjà publiés pour le logiciel sur mesure. Un prix ferme n'est tenable qu'avec un cahier des charges signé et une procédure écrite pour les demandes hors périmètre ;
  - au-delà de 20 jours, deux fondateurs ne peuvent mener qu'un ou deux projets de ce type à la fois.

## 3. Conditions déjà publiées qui présentent un risque (non modifiées)

Ces conditions sont en ligne aujourd'hui. Conformément à la consigne, **elles n'ont pas été changées**. Elles sont signalées pour décision.

1. **Maintenance Croissance : « Petites modifications illimitées, faites sous 24 h » pour 119 €/mois.**
   - Sans plafond, un seul client exigeant peut consommer plusieurs jours par mois.
   - La définition d'une petite modification existe déjà sur le site (« un texte, une photo, des horaires, un prix »). Il manque une limite d'usage raisonnable, ou un nombre maximal par jour.
   - « Sous 24 h » doit préciser jours ouvrés ou non.
2. **« Assistance 7j/7 pendant 1 an » (création) et « Assistance 7j/7 sous 24 h » (Sérénité).**
   - À deux fondateurs, il faut définir ce que couvre le 7j/7 : canal, horaires de réponse, ce qui est traité le week-end, et qui assure pendant les congés.
3. **« Accès au CMS : vous modifiez vos textes et photos vous-même ».**
   - L'outil de gestion de contenu livré aux clients n'est pas défini dans ce projet. Ce dépôt est le site de Pridano Tech, pas un modèle de site client.
   - Il faut choisir la solution, son coût éventuel (licence, hébergement) et le temps de prise en main inclus.
4. **« 1 an d'hébergement et de nom de domaine offerts ».**
   - Coût réel par client à chiffrer : domaine, hébergement, temps de mise en place.
   - Il faut aussi prévoir ce qui se passe à la fin de la première année : bascule vers Essentiel à 29 €/mois, ou transfert au client.
   - Le site dit déjà que la maintenance est « sans engagement ».
5. ~~Landing page et site vitrine affichés « dès 990 € ».~~ Réglé le 3 novembre 2026 : landing page dès 490 €, site vitrine dès 990 €.
6. **Mention « HT ».**
   - Elle doit correspondre au régime de TVA réel de la structure. En franchise en base, la mention « TVA non applicable, art. 293 B du CGI » est requise.
   - La forme juridique n'étant pas encore renseignée dans `brand.legal`, ce point est à confirmer avec votre expert-comptable.

## 4. Conditions à valider avant de publier un nouveau tarif

- [x] Ce que couvrent les 990 € publiés : le site vitrine (la landing page a son prix, dès 490 €).
- [ ] La grille complète des sites (Essentiel, Business, Premium), avec un contenu précis pour chaque palier.
- [ ] La différence entre « Refonte » (790 €) et « Refonte complète ».
- [ ] Un forfait mensuel de suivi pour les automatisations et les assistants IA, et la règle de refacturation des coûts d'usage des modèles.
- [ ] La règle de refacturation des frais tiers (paiement direct par le client ou refacturation).
- [ ] Les limites d'usage de la maintenance Croissance et la définition du 7j/7.
- [ ] La solution de CMS livrée aux clients, et son coût.
- [ ] Le régime de TVA et la mention fiscale.
- [ ] Les conditions générales de vente (acompte, échéancier, propriété du code au paiement complet, garantie).

## 5. Publier un tarif une fois validé

1. Dans `site/data/brand.js`, ajouter une entrée à `pricing` : `{ id: 'vitrine-business', label: 'Site vitrine Business', from: 2490, delivery: '…', perks: […] }`. Une entrée de `pricing` n'est affichée que là où elle est référencée : elle n'apparaît pas toute seule sur les pages.
2. Dans `site/data/catalog.js`, sur la prestation concernée, ajouter `price: { ref: 'vitrine-business' }`. La carte affiche alors « À partir de … », et la page de catégorie ajoute l'offre dans ses données structurées.
3. Dans `tests/catalog.test.js`, retirer ce montant de la liste des tarifs non validés.
4. Lancer `npm run build`, puis `npm test`.

Pour afficher un nouveau palier dans la section « Combien coûte un site web ? » de la page Sites web, ajoutez son identifiant à `pricingSection({ ids: [...] })` dans `site/pages/sites-web.js`.
