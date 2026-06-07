# Déploiement sur Vercel avec SQLite

## ⚠️ Important: Limitations de SQLite sur Vercel

SQLite sur Vercel a une limitation critique: **les données ne persistent pas** entre les déploiements car:
- Vercel est serverless (pas de stockage permanent)
- Chaque déploiement crée un nouvel environnement isolé
- `/tmp` est ephemeral

### Options recommandées:

#### 1. **PostgreSQL Supabase** (Recommandé - Déjà configuré ✅)
- Free tier avec 500MB de données
- Persistence complète garantie
- Déjà intégré dans le projet
- Idéal pour production

#### 2. **SQLite local** (Développement seulement)
- Parfait pour dev local avec `npm run dev`
- Données persistantes localement

#### 3. **Vercel KV / Upstash** (Alternative)
- Redis backend avec persistence
- Bon pour petits datasets
- Payant après free tier

## 📋 Étapes de déploiement

### Option A: Déploiement avec Supabase (Recommandé)

```bash
# 1. Configuration Vercel
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add SUPABASE_ANON_KEY
vercel env add SITE_URL

# 2. Récupérez vos credentials Supabase depuis:
# https://app.supabase.com/project/_/settings/api

# 3. Déployez
vercel --prod
```

### Option B: Déploiement avec SQLite + Vercel KV

**Note:** Nécessite une configuration plus complexe. Non recommandé pour production.

## 🚀 Vercel CLI Installation

```bash
npm install -g vercel
```

## 📝 Variables d'environnement à configurer

Sur la [dashboard Vercel](https://vercel.com/dashboard):

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez les variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJx...
SUPABASE_ANON_KEY=eyJx...
SITE_URL=https://votre-domaine.vercel.app
DATABASE_URL=postgresql://user:pass@host/db
```

## ✅ Vérification

Après déploiement:

```bash
# Vérifier les logs
vercel logs

# Tester l'API
curl https://votre-app.vercel.app/api/articles
```

## 🔄 Configuration du Prisma pour Vercel

Le script build est déjà configuré:

```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": ".next"
}
```

Le build automatique:
1. Génère les clients Prisma
2. Sync la base de données
3. Seed les données initiales
4. Compile Next.js

## 🛠️ Troubleshooting

### Erreur: "database is locked"
- SQLite nécessite un singleton Prisma
- Le projet utilise déjà le bon pattern dans `lib/prisma.ts`

### Erreur: "Cannot find module '@prisma/client'"
```bash
vercel env pull  # Récupère les vars localement
npm run postinstall
```

### Données perdues après redéploiement
- Normal avec SQLite + Vercel (pas de persistence)
- Solution: Utiliser Supabase PostgreSQL
- Seed les données à chaque build avec `prisma/seed.ts`

## 📚 Ressources

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Prisma on Vercel](https://www.prisma.io/docs/deploy/vercel)
- [Supabase Free Tier](https://supabase.com/pricing)
