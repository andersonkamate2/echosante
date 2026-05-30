# GUIDE de déploiement et configuration

Ce guide est destiné à un développeur qui découvre le projet `echo-sante-ngosite`.
Il explique l'installation locale, la configuration des variables d'environnement, l'intégration Supabase, le déploiement sur Vercel et l'utilisation de Supabase comme stockage principal des données et des fichiers.

---

## 1. Présentation du projet

### Architecture générale
Le projet est une application Next.js 15 en App Router, TypeScript et Prisma.
- `app/` contient les pages publiques, les API routes et l'interface d'administration.
- `lib/` contient la logique de données, l'intégration Supabase, l'authentification et le fournisseur de base de données.
- `prisma/` contient le schéma SQLite local et le script de seed.
- `sql/` contient des schémas SQL et des seeds pour Supabase/PostgreSQL.

### Technologies utilisées
- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- Supabase JS client
- SQLite pour le développement local
- Supabase PostgreSQL pour la production
- Vercel pour le déploiement
- Tailwind CSS pour le style
- Zod pour la validation côté application

### Rôle de Next.js
- Génère les pages publiques et les pages admin.
- Fournit des API routes dans `app/api/*`.
- Gère le middleware d'accès admin (`app/middleware.ts`).
- Utilise `next build` / `next dev` pour compiler et exécuter le site.

### Rôle de Supabase
- Fournit la base de données PostgreSQL en production.
- Fournit l'authentification des administrateurs en production.
- Fournit le stockage de fichiers via Supabase Storage (recommandé pour les images et documents).

### Rôle de Vercel
- Héberge l'application Next.js en production.
- Gère le build et la mise en ligne du site.
- Fournit l'environnement de déploiement et la configuration des variables d'environnement.

---

## 2. Prérequis

Avant de commencer, installez et préparez :

- Node.js 20+ ou version compatible avec Next.js 15.
- npm (ou pnpm, mais les scripts fournis utilisent npm).
- Git pour cloner le dépôt.
- Compte Supabase pour la base de données et le stockage.
- Compte Vercel pour déployer l'application.

---

## 3. Installation locale

Ouvrez un terminal et exécutez :

```bash
git clone <url-du-repo>
cd echo-sante-nestjs
npm install
npm run dev
```

### Explication des commandes
- `git clone <url-du-repo>` : récupère le code source du projet.
- `cd echo-sante-nestjs` : entre dans le dossier du projet.
- `npm install` : installe les dépendances nécessaires.
- `npm run dev` : démarre l'environnement de développement.

Le script `npm run dev` exécute automatiquement :
1. `npm run prisma:generate:sqlite`
2. `npm run prisma:push:sqlite`
3. `npm run prisma:seed`
4. `next dev`

Cela génère le client Prisma, crée/synchronise la base SQLite locale, insère les données d'exemple et démarre Next.js.

---

## 4. Variables d'environnement locales

Créez un fichier `./.env.local` à partir de l'exemple. Voici un exemple complet :

```env
# Local dev database
DATABASE_URL="file:./dev.db"

# Local admin user
LOCAL_ADMIN_EMAIL=admin@echosante.org
LOCAL_ADMIN_PASSWORD=password

# Cookie secret pour l'authentification locale
AUTH_COOKIE_SECRET=change-me-in-production

# Supabase public / front-end
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase server-side
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Mode debug local force le SQLite lorsque DEBUG=true
DEBUG=true

# URL publique de l'application (optionnel, non utilisé directement dans le code)
APP_URL=http://localhost:3000
```

### Explication des variables
- `DATABASE_URL` : URL de connexion à la base de données locale SQLite.
- `LOCAL_ADMIN_EMAIL` : adresse de l'administrateur local seedée.
- `LOCAL_ADMIN_PASSWORD` : mot de passe de l'administrateur local seedé.
- `AUTH_COOKIE_SECRET` : secret utilisé pour signer les cookies d'authentification.
- `NEXT_PUBLIC_SUPABASE_URL` : URL publique du projet Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé publique Supabase pour le navigateur.
- `SUPABASE_URL` : URL Supabase pour les appels serveur.
- `SUPABASE_SERVICE_KEY` : clé serveur Supabase (service role key).
- `DEBUG` : si `true`, le projet utilise SQLite local et ignore Supabase.
- `APP_URL` : base URL de l'application. Non utilisé directement dans le code, mais utile pour la configuration et les redirections externes.

### Quelles variables sont publiques ?
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont exposées au navigateur.

### Quelles variables sont privées ?
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `AUTH_COOKIE_SECRET`, `DATABASE_URL`, `LOCAL_ADMIN_EMAIL`, `LOCAL_ADMIN_PASSWORD`.

> Important : ne commitez jamais les clés privées dans Git.

---

## 5. Création du projet Supabase

### 5.1 Création du projet
1. Connectez-vous à Supabase.
2. Cliquez sur `New project`.
3. Entrez un nom de projet, un mot de passe de base, choisissez la région.
4. Créez le projet.

### 5.2 Création des tables
Le projet local utilise les tables suivantes :
- `Article`
- `AdminUser`
- `Project`
- `TeamMember`
- `PageContent`
- `Service`
- `Statistic`
- `ContactMessage`
- `Gallery`
- `SiteSetting`

Dans Supabase, vous pouvez traduire ces modèles en tables PostgreSQL avec des colonnes équivalentes.

Le dossier `sql/` contient un exemple de schéma :
- `sql/schema.sql`
- `sql/seed.sql`

Vous pouvez exécuter ces fichiers dans l'éditeur SQL Supabase pour créer la structure initiale.

### 5.3 Activation RLS
Pour la production, activez Row Level Security sur les tables publiées, au minimum pour :
- `articles`
- `profiles` (utilisateurs Auth)

Dans `sql/schema.sql`, un exemple d'activation RLS est déjà démontré pour `articles`.

### 5.4 Création des policies
Le code ne gère pas toutes les policies automatiquement, mais la logique attend :
- `SELECT` public sur les contenus publiés.
- `INSERT`, `UPDATE`, `DELETE` seulement pour les administrateurs.

Exemple de policy pour `articles` :
```sql
create policy "public published articles" on articles for select using (status = 'published');
```

### 5.5 Configuration Auth
- Activez l'authentification dans Supabase Auth.
- Utilisez des e-mails et mots de passe pour les administrateurs.
- Assurez-vous de créer au moins un compte admin.

> Le code actuel utilise Supabase Auth en production si `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définis et valides.

### 5.6 Configuration Storage
- Activez Supabase Storage.
- Créez un bucket privé ou public pour les fichiers.
- Configurez les règles en lecture/écriture selon le besoin.

> Le projet ne référence pas encore un bucket spécifique dans le code, mais Supabase Storage est la bonne place pour héberger images, PDF et documents.

---

## 6. Configuration du stockage des fichiers

### 6.1 Créer un bucket
Dans Supabase Storage :
1. Ouvrez `Storage`.
2. Cliquez sur `Create a new bucket`.
3. Donnez un nom explicite, par exemple `uploads` ou `public-files`.
4. Choisissez `public` ou `private` selon les besoins.

### 6.2 Configurer les permissions
- Pour un bucket public : activez l'accès public.
- Pour un bucket privé : protégez l'accès et servez les fichiers via des URLs signées.

### 6.3 Stocker les images
Exemple d'utilisation avec Supabase JS :
```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const uploadImage = async (file: File) => {
  const path = `images/${file.name}`;
  const { data, error } = await supabase.storage.from('uploads').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  return { data, error };
};
```

### 6.4 Stocker les PDF
```ts
const uploadPdf = async (file: File) => {
  const path = `documents/${file.name}`;
  const { data, error } = await supabase.storage.from('uploads').upload(path, file, {
    contentType: 'application/pdf',
  });
  return { data, error };
};
```

### 6.5 Stocker les documents
```ts
const uploadDocument = async (file: File) => {
  const path = `docs/${file.name}`;
  const { data, error } = await supabase.storage.from('uploads').upload(path, file);
  return { data, error };
};
```

### 6.6 Règle importante
- Les fichiers ne doivent jamais être stockés sur Vercel.
- Tous les fichiers doivent être stockés dans Supabase Storage.
- Vercel sert uniquement l'application front-end et l'API.

---

## 7. Déploiement sur Vercel

### 7.1 Création du dépôt GitHub
1. Créez un repository GitHub vide.
2. Dans le dossier du projet :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <url-du-repo>
git push -u origin main
```

### 7.2 Push sur GitHub
- Push du code vers la branche principale.
- Vérifiez que le dépôt contient `package.json`, `app/`, `lib/`, `prisma/`, `sql/`, `.env.example`.

### 7.3 Connexion GitHub → Vercel
1. Connectez-vous à Vercel.
2. Importez le projet depuis GitHub.
3. Sélectionnez le repository `echo-sante-ngosite`.

### 7.4 Import du projet
- Framework : Next.js.
- Build command : `npm run build`.
- Output directory : `.next`.

> Le fichier `vercel.json` du projet confirme ces valeurs.

### 7.5 Configuration du build
Par défaut, Vercel utilisera :
- `npm install`
- `npm run build`

Assurez-vous que la commande de build est bien `npm run build`.

---

## 8. Variables d'environnement Vercel

Dans l'interface Vercel, allez dans :
`Settings > Environment Variables`.
Ajoutez les variables suivantes pour `Production` :

- `NEXT_PUBLIC_SUPABASE_URL` = `https://<votre-projet>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<votre-anon-key>`
- `SUPABASE_URL` = `https://<votre-projet>.supabase.co`
- `SUPABASE_SERVICE_KEY` = `<votre-service-role-key>`
- `AUTH_COOKIE_SECRET` = `<une-chaîne-forte-de-32-caractères+>`
- `DATABASE_URL` = `postgresql://<user>:<pass>@<host>:5432/<db>?schema=public`
- `DEBUG` = `false`
- `APP_URL` = `https://<votre-domaine>.vercel.app`

### Où ajouter les variables
1. Ouvrez le projet Vercel.
2. Cliquez sur `Settings`.
3. Dans `Environment Variables`, cliquez sur `Add`.
4. Entrez une variable par ligne.

### Description textuelle des captures d'écran
- `Project Settings > Environment Variables` : zone dans Vercel où les variables de build et runtime sont définies.
- `Add Environment Variable` : bouton pour créer une variable.
- `Environment` : choisissez `Production` (ou `Preview` si vous voulez tester dans un cluster de preprod).

---

## 9. Passage en production

En production, le projet doit automatiquement :

- utiliser Supabase PostgreSQL
- utiliser Supabase Auth
- utiliser Supabase Storage

### Condition de production
Le projet bascule automatiquement vers Supabase lorsque :
- `DEBUG=false`
- `SUPABASE_URL` est défini
- `SUPABASE_SERVICE_KEY` est défini
- `NEXT_PUBLIC_SUPABASE_URL` est défini
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` est défini

### Comment le code gère cela
- `lib/database/provider.ts` détecte si Supabase est configuré.
- Si les clés sont absentes ou manifestement factices (`test.supabase.co`, `test-...`, `your-supabase`), le mode SQLite est forcé.
- En production, la variable `DEBUG` doit être `false`.

### Résultat attendu
- Les données sont lues/écrites dans Supabase PostgreSQL.
- L'authentification admin passe par Supabase Auth.
- Les fichiers sont stockés dans Supabase Storage, pas sur Vercel.

---

## 10. Gestion des utilisateurs

### Visiteur
- Accès libre aux contenus publics.
- Les pages publiques sont accessibles sans authentification.

### Administrateur
- Connexion obligatoire via `/admin/login`.
- Tableau de bord admin protégé sous `/admin/dashboard`.
- Un cookie signé `app_session_id` protège l'accès.

### Création d'un administrateur Supabase
1. Créez un utilisateur via Supabase Auth.
2. Associez-lui un rôle admin dans les données de profil.

> Le projet local utilise un admin local seedé si Supabase n'est pas configuré. En production, utilisez Supabase Auth.

---

## 11. Dépannage

### Problèmes fréquents

#### Variables d'environnement incorrectes
- Cause : une variable manquante ou mal nommée.
- Diagnostic : vérifier `Settings > Environment Variables` dans Vercel et `.env.local` en local.
- Solution : corriger `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AUTH_COOKIE_SECRET`, `DATABASE_URL`.

#### Échec de connexion à Supabase
- Cause : URL ou clé incorrecte.
- Diagnostic : tester la connexion dans Supabase Console, vérifier les logs.
- Solution : copier-coller les valeurs depuis Supabase Dashboard.

#### Erreurs RLS
- Cause : policies incomplètes pour `articles` ou `profiles`.
- Diagnostic : regarder les policies de Supabase et le message d'erreur de la requête.
- Solution : activer RLS et créer des policies `SELECT` publiques et `INSERT/UPDATE/DELETE` admin.

#### Erreurs de build Vercel
- Cause : build command ou variables manquantes.
- Diagnostic : logs Vercel `Build`.
- Solution : vérifier `Build Command = npm run build`, `Output Directory = .next`, et variables de production.

#### Erreurs de Storage
- Cause : bucket inexistant ou permissions incorrectes.
- Diagnostic : vérifier Storage dans Supabase, tester upload/download.
- Solution : créer le bucket, ajuster les permissions, utiliser des URLs signées si le bucket est privé.

### Cas spécifique : mode de développement local
- `DEBUG=true` force le mode SQLite.
- `test.supabase.co` et `test-anon-key` sont traités comme des placeholders.
- Pour le développement local, utilisez `npm run dev`.
- Pour forcer un test Supabase sans base locale, vous pouvez utiliser `npm run dev:mock`, bien que le code principal décide du mode en fonction des variables.

---

## 12. Checklist avant mise en production

- [ ] Variables d'environnement configurées dans Vercel.
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définis.
- [ ] `AUTH_COOKIE_SECRET` est fort et secret.
- [ ] `DATABASE_URL` pointant vers la base Supabase PostgreSQL.
- [ ] Tables créées dans Supabase.
- [ ] RLS activé sur les tables publiques.
- [ ] Buckets Supabase créés pour les fichiers.
- [ ] Auth Supabase configuré.
- [ ] Domaine configuré dans Vercel.
- [ ] HTTPS actif sur le domaine.
- [ ] Admin login `/admin/login` fonctionne.
- [ ] Dashboard admin `/admin/dashboard` accessible aux admins.

---

## Annexes spécifiques au projet

### Scripts npm utiles
- `npm run dev` : démarre le développement local avec SQLite et seed.
- `npm run dev:mock` : démarre Next.js avec `TEST_SUPABASE=1`.
- `npm run build` : build de production.
- `npm run build:local` : build local avec SQLite et `DEBUG=true`.
- `npm run lint` : lance ESLint.
- `npm run prisma:generate:sqlite` : génère Prisma client pour SQLite.
- `npm run prisma:push:sqlite` : pousse le schéma SQLite.
- `npm run prisma:seed` : insère les données de seed locales.
- `npm run test:mock` : exécute des tests de flux mock.
- `npm run test:integration` : exécute des tests d'intégration réels.
- `npm run migrate:supabase` : script de migration vers Supabase (utilise `SUPABASE_URL` et `SUPABASE_SERVICE_KEY`).

### Configuration Vercel
- `buildCommand` : `npm run build`
- `outputDirectory` : `.next`
- Le fichier `vercel.json` contient cette configuration.

### Tables réelles utilisées par le code
- `Article`
- `AdminUser`
- `Project`
- `TeamMember`
- `PageContent`
- `Service`
- `Statistic`
- `ContactMessage`
- `Gallery`
- `SiteSetting`

### Fichiers SQL utiles
- `sql/schema.sql` : schéma Supabase / PostgreSQL.
- `sql/seed.sql` : seed d'exemple pour Supabase.

---

## Notes finales

- Le projet est conçu pour fonctionner en mode `DEBUG=true` localement avec SQLite.
- Pour aller en production, le seul basculement nécessaire est la configuration complète de Supabase et la désactivation de `DEBUG`.
- Toutes les ressources statiques ou fichiers de contenu doivent être gérées par Supabase Storage, jamais par Vercel.

Ce guide couvre les étapes essentielles pour installer, configurer, déployer et maintenir le projet `echo-sante-ngosite`.
