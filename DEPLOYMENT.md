# Mise en ligne

Aucune publication, aucune modification DNS et aucune configuration de production n'a été effectuée pendant la refonte. Les étapes ci-dessous sont à suivre par l'équipe.

## 0. Avant tout : sécurité de la clé Resend

L'archive d'origine contenait une clé Resend d'apparence réelle (préfixe `re_`) à deux endroits :

- dans `.env` ;
- dans **`.env.example`**, qui est **versionné dans l'historique Git** (commit `3f87f5d`).

**Révoquez cette clé dans le tableau de bord Resend et créez-en une nouvelle** avant la mise en ligne. Ni `.env` ni l'historique Git ne sont inclus dans cette archive, et `.env.example` ne contient plus que des valeurs fictives. Le contrôle `npm run lint` refuse tout fichier servi contenant un motif de clé.

## 1. Netlify (recommandé, configuration fournie)

`netlify.toml` configure :

| Élément | Configuration |
|---|---|
| Build | `npm run build`, publication du dossier `public/` |
| Variables de build | `NODE_ENV=production`, `PUBLIC_SITE_URL=https://pridanotech.fr`, `NODE_VERSION=22` |
| Fonctions | `netlify/functions/` (contact, brief guidé, santé de l'API) |
| Redirections | 301 des anciennes URLs (`.html`), URLs propres, 404 dessinée |
| En-têtes | Sécurité (HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, COOP) et cache (1 an immuable pour les bundles et polices, 30 jours pour les images) |

Les Deploy Previews et les déploiements de branche restent automatiquement non indexables (`noindex` et `Disallow: /`).

### Variables d'environnement Netlify (Site settings → Environment variables)

| Variable | Obligatoire | Rôle |
|---|---|---|
| `RESEND_API_KEY` | oui, pour l'envoi d'emails | Clé Resend (nouvelle clé, voir étape 0) |
| `RESEND_FROM_EMAIL` | recommandé | Expéditeur vérifié dans Resend, par exemple `Pridano Tech <contact@pridanotech.fr>`. La valeur par défaut `onboarding@resend.dev` ne livre qu'à l'adresse du compte Resend. |
| `LEAD_NOTIFICATION_EMAIL` | non | Destinataire des demandes (par défaut `pridanotech@gmail.com`). Si vous créez une adresse sur le domaine (par exemple `contact@pridanotech.fr`), mettez-la ici et dans `brand.email`. |
| `GROQ_API_KEY` | non | Active l'assistant IA du brief guidé. Sans clé, l'assistant fonctionne en mode local (qualification par règles). |
| `GROQ_MODEL` | non | Modèle Groq (par défaut `llama-3.3-70b-versatile`) |

### Étapes

1. Remplacer le contenu du dépôt existant par celui de l'archive, sur une branche dédiée, en conservant votre dossier `.git`. Vérifier le diff.
2. Créer une Deploy Preview et tester le contact et le brief guidé avec une adresse interne.
3. Vérifier dans Resend le domaine expéditeur (DNS SPF et DKIM sur pridanotech.fr) si vous changez `RESEND_FROM_EMAIL`.
4. Publier en production.
5. Dans Google Search Console et Bing Webmaster Tools, soumettre `https://pridanotech.fr/sitemap.xml`, puis inspecter `/` et `/sites-web`.

### Domaines historiques

`pridanotech.netlify.app` et `pridano-tech.netlify.app` sont des adresses Netlify : elles servent le même déploiement. Les canonicals pointent toujours vers `https://pridanotech.fr`.

Pour rediriger aussi ces sous-domaines, configurez **pridanotech.fr comme domaine principal** dans Netlify (Domain management). Netlify redirige alors automatiquement le sous-domaine `.netlify.app` du site concerné vers le domaine principal.

Le second site (`pridano-tech.netlify.app`), s'il s'agit d'un projet Netlify distinct, n'a pas pu être examiné : son rôle reste à confirmer avant de le supprimer ou de le rediriger.

## 2. Hébergement Node (alternative)

```sh
npm ci --omit=dev
PUBLIC_SITE_URL=https://pridanotech.fr NODE_ENV=production npm run build   # nécessite les devDependencies (esbuild)
PORT=3000 RESEND_API_KEY=… npm start
```

Le build a besoin d'esbuild (devDependency). Lancez-le sur une machine de build, puis déployez `public/` avec le serveur.

Express applique la compression, les en-têtes de sécurité, le cache, les redirections 301 et la 404, de façon identique à Netlify.

## 3. Avant la publication : contenus à fournir

Tout se renseigne dans `site/data/brand.js` (détail dans README.md, section « Informations à compléter »), puis `npm run build` et `npm test`.

- **Mentions légales** (`brand.legal`) : dénomination, forme sociale, siège, SIREN/SIRET, RCS, TVA, directeur de la publication. L'hébergeur (Netlify) est déjà indiqué. La page passe en `index` dès que l'éditeur est complet, et la politique de confidentialité se remplit avec les mêmes données.
- **Politique de confidentialité** : mettre à jour la date « Version du 2 avril 2026 » dans `site/privacy.html` le jour de la publication, et confirmer la liste des sous-traitants (Netlify, Resend, Groq, Umami).
- **Témoignages** réels (`testimonials`) : la section reste masquée tant qu'elle est vide. Prix, délai, maintenance, téléphone, Calendly et réseaux sont déjà publiés.
- **Calendly** : vérifier que `calendly.com/pridanotech` propose bien un type de rendez-vous (appel découverte) et que les créneaux sont à jour.

## 4. Après la mise en ligne

- **Google Business Profile** : créer ou revendiquer la fiche (catégorie « Concepteur de sites Web », Montpellier), avec le lien vers le site. Voir SEO-AUDIT.md §8.
- **Annuaires** : La Fabrique du Net, Malt, page entreprise LinkedIn. Mêmes nom, ville, email et téléphone partout, puis ajouter les URL dans `brand.sameAs`.
- **Avis** : demander un avis Google à chaque client livré.
- **Mesure d'audience** : Umami (sans cookie, uniquement sur pridanotech.fr). Événements envoyés, visibles dans Umami → Events :
  - `cta-entete:…`, `cta-dock:…`, `cta-tarif:…`, `cta-maintenance` : clics sur les boutons d'action ;
  - `email`, `telephone`, `prise-rdv` : clics sur les moyens de contact directs ;
  - `realisation:<id>` : ouverture d'un site livré ;
  - `lien:devis-guide` : accès au brief guidé ;
  - `contact-envoye` (avec le type de projet) et `brief-envoye` : envois réussis.
- **Captures des réalisations** : relancer `npm run captures` puis `npm run assets` quand un client met son site à jour.
- **Film d'ouverture** : surveiller dans Umami le taux de sortie de l'accueil après la mise en ligne. Si beaucoup de visiteurs partent pendant le film, le raccourcir (découpage dans `PLANS`, `src/scripts/modules/film-run.js`) ou le retirer (README, « Film d'ouverture »).
- **Test utilisateurs** : protocole court dans TEST-UTILISATEURS.md, à mener avec 5 dirigeants de TPE.
- Relancer un audit Lighthouse sur l'URL publique et consulter les Core Web Vitals terrain (CrUX / Search Console) après quelques semaines de trafic.
