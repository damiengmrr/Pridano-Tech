# ROADMAP — logiciels, abonnements et espaces clients

Ce document décrit des **étapes futures**. Rien de ce qui suit n'est développé ni annoncé sur le site.

- La page `/logiciels` affiche le vrai statut de chaque produit : Business OS « En développement », les autres « Concept ».
- Aucune date de lancement n'est publiée.
- Les ordres de grandeur et les choix techniques sont des pistes, à valider.

## 1. Ce que l'architecture actuelle permet déjà

| Besoin futur | Déjà prêt | Fichier |
|---|---|---|
| Ajouter un logiciel au catalogue | Une entrée de données, aucun gabarit à toucher | `site/data/software.js` |
| Changer un statut (Concept → Bêta → Disponible) | Champ `status`, avec règles vérifiées par test | `software.js`, `tests/catalog.test.js` |
| Page produit dédiée | Gabarit prêt : fonctionnalités, captures réelles, formules, FAQ, documentation, bouton d'inscription si disponible | `site/pages/logiciel.js` (`publishPage: true`) |
| Formules d'abonnement affichées | Champ `plans` (vide aujourd'hui) | `software.js` |
| Lien d'inscription | Champ `signupUrl`, affiché seulement au statut `disponible` | `software.js` |
| Recueillir l'intérêt avant le lancement | « Être informé du lancement » passe par le formulaire de contact réel | `site/components/catalog.js` |
| Demandes de devis multi-prestations | 10 besoins, combinables | `site/data/needs.js` |

Le site reste un **site statique généré** (Node, Express en local, fonctions Netlify en production). C'est le bon choix pour la vitrine. En revanche, les logiciels ne doivent pas être construits **dans** ce dépôt (voir section 3).

## 2. Étapes proposées pour les logiciels

### Étape A — Pridano Business OS jusqu'à la bêta

- Terminer les modules existants : commercial, opérations, gestion.
- Ouvrir une bêta réelle à quelques entreprises volontaires, avec des données réelles et un accord écrit.
- Sur le site :
  - passer `status: 'beta'` seulement quand l'accès de test existe ;
  - publier la page produit (`publishPage: true`) si le contenu réel suffit, sinon garder `/crm`.

### Étape B — Choisir le prochain produit autonome

Les concepts Finance, CRM et Booking recoupent en partie les modules de Business OS. Projects, Stock, Dashboard et Forms ont été retirés le 3 novembre 2026 : leurs fonctions existent déjà dans Business OS ou ne sont pas prioritaires.

- **Piste 1 : modules de Business OS vendus séparément.** Une seule base de code, des modules activables. C'est moins de maintenance pour deux fondateurs.
- **Piste 2 : produits indépendants.** Chaque produit a son code, ses déploiements et son support : plus coûteux à maintenir.

Critère de choix suggéré : les demandes reçues via « Être informé du lancement ». Elles arrivent par le formulaire de contact avec le nom du produit dans le message, ce qui permet de les compter.

### Étape C — Comptes, abonnements, licences, facturation

À construire **dans l'application logicielle**, pas dans le site vitrine.

| Brique | Rôle | Points d'attention |
|---|---|---|
| Comptes et authentification | Inscription, connexion, rôles, multi-entreprise | Sécurité des mots de passe, double authentification, journalisation |
| Abonnements | Formules, période d'essai réelle, changement de formule | Prestataire de paiement (Stripe Billing ou équivalent) : commissions à intégrer au prix |
| Licences | Droits d'accès par formule et par module | Une seule source de vérité côté serveur |
| Facturation des abonnements | Factures, avoirs, relances | Obligations de facturation françaises, et facturation électronique entre entreprises (calendrier légal à vérifier avec l'expert-comptable) |
| Tableaux de bord clients | Usage, factures, paramètres | Données personnelles : registre RGPD, contrat de sous-traitance avec les clients |

### Étape D — Portail d'accès aux logiciels

Un espace unique où le client retrouve ses logiciels, ses factures et son support.

- **Recommandation** : une application séparée sur un sous-domaine (par exemple `app.pridanotech.fr`), avec sa propre base de données.
- **Le site vitrine** n'aurait qu'un lien « Se connecter », ajouté le jour où le portail existe réellement. Aucun bouton de connexion n'est affiché aujourd'hui.

## 3. Pourquoi séparer la vitrine des logiciels

- **Le site vitrine n'a ni base de données ni compte utilisateur, et c'est volontaire.**
  - Il est rapide (Lighthouse 99 à 100).
  - Il est peu coûteux à héberger.
  - Sa surface d'attaque est minimale.
- **Ajouter des comptes ou des paiements au site** imposerait une base de données, des sessions, une conformité PCI (même déléguée) et des sauvegardes. Le site deviendrait plus lent et plus risqué.
- **Le catalogue `software.js` reste la vitrine des produits.** Il pointe vers les vraies applications (`page`, `signupUrl`, `docsUrl`) quand elles existent.

## 4. Chantiers du site restant à faire (hors logiciels)

| Chantier | Pourquoi | Dépend de |
|---|---|---|
| Valider ou ajuster les tarifs envisagés | Prix des nouvelles offres (aujourd'hui « Sur devis ») | Fondateurs, COMMERCIAL.md |
| Clarifier les conditions publiées à risque | Modifications illimitées, 7j/7, CMS, hébergement offert | Fondateurs, COMMERCIAL.md §3 |
| Choisir l'outil de CMS livré aux sites clients | Promis dans l'offre « Création de site web » | Fondateurs |
| Compléter `brand.legal` | Mentions légales complètes, indexation de la page | Immatriculation (SIREN, forme, siège) |
| Tester le devis guidé en mode IA | Non testé en direct : aucune clé Groq dans cet environnement | Clé `GROQ_API_KEY` en préproduction |
| Anti-doublon persistant des envois de devis | Aujourd'hui en mémoire, par instance (voir TESTS.md) | Un stockage partagé : Netlify Blobs, ou équivalent sans coût récurrent |
| Pages produit `/logiciels/<id>` | Seulement quand un produit a assez de contenu réel | Avancement des produits |
| Avis clients | Section prête dans `brand.js` (`testimonials`), vide | Accords écrits des clients |
