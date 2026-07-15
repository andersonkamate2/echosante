# Echo Santé

Application Next.js 15 App Router pour Echo Santé, avec frontend mobile-first, dashboard admin CRUD, stockage local JSON et PWA installable.

## Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS
- Données locales dans `data/*.json`
- API routes App Router pour le CRUD
- PWA: `public/manifest.json`, `public/sw.js`, page hors ligne

## Données

Les collections JSON sont dans `data/`:

- `articles.json`
- `projects.json`
- `team.json`
- `services.json`
- `statistics.json`
- `pages.json`
- `gallery.json`
- `site-settings.json`
- `contact-messages.json`
- `admin-users.json`

La couche d’accès est dans `lib/json-db/` et `lib/data/`.

En local, les écritures CRUD modifient directement `data/*.json`. Sur Vercel, le filesystem applicatif n’est pas persistant; le store initialise donc une copie runtime dans `/tmp/echo-sante-data` pour rester compatible sans configuration externe. Les modifications faites sur Vercel sont fonctionnelles pendant la durée de vie de l’instance, mais ne remplacent pas un stockage durable.

## Commandes

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test:mock
npm run build
```

## Administration

URL: `/admin/login`

Identifiants locaux par défaut:

```text
admin@echosante.org
password
```

Changez ces identifiants dans `data/admin-users.json` ou via l’API admin avant une mise en production réelle. Définissez aussi `AUTH_COOKIE_SECRET` en production pour signer les sessions.

## PWA

L’application est installable sur mobile et desktop via le manifest. Le service worker met en cache les assets principaux et sert `offline.html` lors d’une navigation hors ligne.

## Déploiement Vercel

Le projet est prêt pour Vercel sans base externe:

- `package.json` utilise `next build`
- `vercel.json` pointe vers `npm run build`
- aucune dépendance Prisma, Supabase ou SQLite
- aucune migration ou variable de base de données requise

Vérification:

```bash
node scripts/verify-deployment.mjs
```

## Structure

```text
app/              routes, pages, API routes et actions serveur
components/       composants UI réutilisables
data/             source JSON locale
lib/data/         fonctions métier par entité
lib/json-db/      store JSON générique
public/           images, manifest, service worker, offline page
types/            types partagés
utils/            helpers
```
