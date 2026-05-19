# Echo Santé - Site ONG Next.js

Projet moderne basé sur Next.js 15 (App Router), TypeScript, Tailwind CSS et Supabase.

## 🎯 Objectif

- Site web responsive avec design noir et blanc
- Module public d’articles depuis Supabase
- Authentification admin sécurisée
- Dashboard admin pour CRUD complet d’articles
- Formulaires envoyés vers WhatsApp
- Architecture claire : app/, components/, lib/, hooks/, types/, sql/, utils/

## 🚀 Installation

### Variables d’environnement requises

Créez un fichier `.env.local` avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

Vous pouvez copier le fichier d’exemple :

```bash
cp .env.local.example .env.local
```

### Commandes

```bash
npm install
npm run dev
```

Ouvrez ensuite `http://localhost:3000`.

## 🧱 Initialisation Supabase

1. Créez le projet Supabase.
2. Exécutez `sql/schema.sql` puis `sql/seed.sql`.
3. Ajoutez le compte admin dans l’authentification Supabase.
4. Vérifiez que la table `profiles` contient l’email admin et le rôle `admin`.

## 📁 Structure du projet

### Prérequis

- Node.js 18+ ou pnpm 10+
- pnpm (gestionnaire de paquets recommandé)

### Installation locale

```bash
# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev

# Le site sera accessible à http://localhost:3000
```

### Build pour la production

```bash
# Créer une build de production
pnpm build

# Prévisualiser la build
pnpm preview
```

## 📦 Structure du projet

```
echo-sante-nestjs/
├── client/
│   ├── public/              # Fichiers statiques (images)
│   │   ├── img1.webp       # Logo
│   │   ├── img2.webp       # Image héros
│   │   ├── img3.webp       # Projet 1
│   │   ├── img4.webp       # Projet 2
│   │   └── img5.webp       # Projet 3
│   ├── src/
│   │   ├── pages/          # Pages React
│   │   │   └── Home.tsx    # Page d'accueil principale
│   │   ├── components/     # Composants réutilisables
│   │   ├── contexts/       # Contextes React
│   │   ├── App.tsx         # Composant principal
│   │   ├── main.tsx        # Point d'entrée
│   │   └── index.css       # Styles globaux Tailwind
│   └── index.html          # Template HTML
├── server/
│   └── index.ts            # Serveur Express (production)
├── package.json            # Dépendances et scripts
├── vercel.json             # Configuration Vercel
├── .vercelignore           # Fichiers à ignorer pour Vercel
└── README.md               # Ce fichier
```

## 🎨 Personnalisation

### Couleurs

Les couleurs principales sont définies dans `client/src/index.css` :
- **Primaire (Rouge)** : `#dc2626` - Utilisé pour les boutons et accents
- **Secondaire** : Gris clair pour les sections alternées

### Polices

La police Segoe UI est utilisée pour une meilleure lisibilité. Vous pouvez la modifier dans `client/index.html`.

### Images

Les images sont stockées dans `client/public/` :
- `img1.webp` : Logo de l'organisation
- `img2.webp` : Image de fond du héros
- `img3.webp` à `img5.webp` : Images des projets

## 📝 Formulaires

Les formulaires (don, contact) utilisent actuellement `mailto:` pour l'envoi. Pour une fonctionnalité complète :

1. Intégrez un service d'email (SendGrid, Mailgun, etc.)
2. Ou créez une API backend pour traiter les formulaires

## 🚀 Déploiement sur Vercel

### Méthode 1 : Via Git (Recommandé)

1. Poussez votre code sur GitHub/GitLab
2. Allez sur [vercel.com](https://vercel.com)
3. Cliquez sur "New Project"
4. Sélectionnez votre repository
5. Vercel détectera automatiquement la configuration
6. Cliquez sur "Deploy"

### Méthode 2 : Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Variables d'environnement

Si vous avez besoin de variables d'environnement :

1. Allez dans les paramètres du projet sur Vercel
2. Allez à "Environment Variables"
3. Ajoutez vos variables
4. Redéployez

## 🔧 Scripts disponibles

```bash
pnpm dev       # Démarrer le serveur de développement
pnpm build     # Créer une build de production
pnpm preview   # Prévisualiser la build de production
pnpm check     # Vérifier les types TypeScript
pnpm format    # Formater le code avec Prettier
```

## 📱 Responsive Design

Le site est entièrement responsive et testé sur :
- Mobile (320px et plus)
- Tablette (768px et plus)
- Desktop (1024px et plus)

## ♿ Accessibilité

- Navigation au clavier complète
- Contraste de couleur approprié
- Labels explicites sur les formulaires
- Icônes avec texte alternatif

## 🐛 Dépannage

### Le site ne se charge pas après le déploiement

1. Vérifiez que `vercel.json` est correct
2. Vérifiez les logs de build sur Vercel
3. Assurez-vous que toutes les dépendances sont listées dans `package.json`

### Images qui ne s'affichent pas

1. Vérifiez que les fichiers `.webp` sont dans `client/public/`
2. Vérifiez les chemins dans le code (doivent commencer par `/`)

### Formulaires qui ne fonctionnent pas

Les formulaires utilisent actuellement `mailto:`. Pour une fonctionnalité complète :
1. Intégrez un service d'email
2. Ou créez une API backend

## 📞 Support

Pour toute question ou problème, contactez :
- Email : contactesu@gmail.com
- Téléphone : +243 973891230
- Adresse : Goma, Nord-Kivu, RDC

## 📄 Licence

© 2026 Echo Santé. Tous droits réservés.

---

**Construit avec ❤️ pour Echo Santé UNIGOM**
