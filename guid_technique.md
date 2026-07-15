# Guide technique - Echo Santé

Ce guide décrit l’architecture technique du projet, le stockage JSON, la PWA et le déploiement.

## Stack

- Next.js 15 avec App Router
- React 19
- TypeScript
- Tailwind CSS
- API Routes Next.js
- Stockage local JSON
- PWA avec manifest et service worker

## Commandes utiles

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test:mock
node scripts/verify-deployment.mjs
npm run build
```

Serveur local :

```text
http://localhost:3000
```

## Identifiants admin locaux

Page de connexion :

```text
/admin/login
```

Identifiants par défaut :

```text
Email : admin@echosante.org
Mot de passe : password
```

Le compte est défini dans :

```text
data/admin-users.json
```

Le mot de passe est stocké sous forme de hash `scrypt` avec sel.

## Architecture

```text
app/              Pages, routes API, actions serveur
components/       Composants réutilisables
data/             Données JSON locales
lib/data/         Fonctions métier par entité
lib/json-db/      Store JSON générique
public/           Images, manifest, service worker, page hors ligne
scripts/          Scripts de vérification
types/            Types TypeScript partagés
utils/            Helpers
```

## Stockage JSON

Les fichiers de données sont dans `data/` :

```text
data/articles.json
data/projects.json
data/team.json
data/services.json
data/statistics.json
data/pages.json
data/gallery.json
data/site-settings.json
data/contact-messages.json
data/admin-users.json
```

La couche générique se trouve dans :

```text
lib/json-db/store.ts
lib/json-db/types.ts
```

Les fonctions métier sont dans :

```text
lib/data/
```

Exemples :

- `lib/data/articles.ts`
- `lib/data/projects.ts`
- `lib/data/pages.ts`
- `lib/data/auth.ts`

## CRUD

Chaque entité utile possède des routes API CRUD dans `app/api/`.

Exemples :

```text
GET    /api/articles
POST   /api/articles
DELETE /api/articles/[id]

GET    /api/projects
POST   /api/projects
PUT    /api/projects/[id]
DELETE /api/projects/[id]
```

Les entités administrables principales sont :

- Articles
- Projets
- Équipe
- Services
- Statistiques
- Pages
- Galerie
- Paramètres du site
- Messages de contact
- Utilisateurs admin

## Authentification admin

L’authentification utilise un cookie signé.

Fichiers concernés :

```text
app/api/auth/route.ts
lib/auth-utils.ts
lib/auth-middleware.ts
lib/data/auth.ts
```

Variable recommandée en production :

```text
AUTH_COOKIE_SECRET
```

Sans cette variable, une valeur de développement est utilisée. Il faut donc la définir avant un vrai déploiement public.

## PWA

Fichiers PWA :

```text
public/manifest.json
public/sw.js
public/offline.html
components/PWARegister.tsx
```

Le manifest configure :

- nom de l’application ;
- mode standalone ;
- couleur de thème ;
- icônes ;
- URL de démarrage.

Le service worker :

- met en cache les assets principaux ;
- sert une page hors ligne pour les navigations sans réseau ;
- met en cache les réponses GET du même domaine.

## Déploiement Vercel

Le projet est compatible Vercel sans base de données externe.

Configuration :

```text
vercel.json
```

Build :

```bash
npm run build
```

Vérification :

```bash
node scripts/verify-deployment.mjs
```

## Limite du stockage sur Vercel

Vercel ne fournit pas de filesystem persistant pour les fonctions serverless.

Le store JSON fonctionne ainsi :

- en local : lecture/écriture directe dans `data/*.json` ;
- sur Vercel : initialisation d’une copie runtime dans `/tmp/echo-sante-data`.

Conséquence :

Les modifications faites depuis l’admin sur Vercel peuvent être perdues après redéploiement, changement d’instance ou expiration du runtime.

Pour une persistance durable en production, il faudrait brancher un stockage externe. Mais dans l’état actuel, le projet respecte l’objectif demandé : pas de base de données, source locale JSON et déploiement Vercel sans configuration supplémentaire.

## Tests et vérifications

TypeScript :

```bash
npm run typecheck
```

Lint :

```bash
npm run lint
```

Smoke test JSON :

```bash
npm run test:mock
```

Build production :

```bash
npm run build
```

## Sécurité à traiter avant production réelle

Avant une mise en ligne publique, il faut au minimum :

- changer le mot de passe admin par défaut ;
- définir `AUTH_COOKIE_SECRET` ;
- vérifier les contenus dans `data/*.json` ;
- éviter de publier des informations sensibles dans les fichiers JSON ;
- remplacer le stockage JSON éphémère par un stockage durable si les modifications admin doivent survivre aux redéploiements.
