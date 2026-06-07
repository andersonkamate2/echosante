# 🚀 Déploiement Echo Santé sur Vercel

## 📋 Prérequis

- Node.js 18+ installé
- Compte Vercel (gratuit sur vercel.com)
- Git configuré

## 🎯 Deux stratégies de déploiement

### Option A: **Supabase PostgreSQL** (⭐ Recommandé)

**Avantages:**
- ✅ Données persistent entre les déploiements
- ✅ Free tier: 500MB de données
- ✅ Déjà configuré dans le projet
- ✅ Scalable et professionnel
- ✅ Gratuit pour petits projets

**Variables d'environnement requises:**
```
DATABASE_URL=postgresql://...pooler.supabase.com:6543/...
DIRECT_URL=postgresql://...supabase.com:5432/...
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_KEY=sb_secret_...
SUPABASE_STORAGE_BUCKET=echosante
SITE_URL=https://votre-app.vercel.app
AUTH_COOKIE_SECRET=votre-secret
```

### Option B: **SQLite** (Pour tests/démo)

**Limitations:**
- ⚠️ Données perdues entre déploiements
- ⚠️ Pas de persistence garantie
- ⚠️ Bon pour démo seulement
- ✅ Zéro coût
- ✅ Seed des données à chaque build

**Variables d'environnement:**
```
DATABASE_URL=file:/tmp/data.db
DIRECT_URL=file:/tmp/data.db
SITE_URL=https://votre-app.vercel.app
DEBUG=false
```

---

## 🔧 Étapes d'installation

### 1. Installer Vercel CLI

```bash
npm install -g vercel
```

### 2. Authentifier avec Vercel

```bash
vercel login
```

### 3. Lier le projet à Vercel

```bash
vercel link
# Sélectionnez votre organization et créez un nouveau projet
```

### 4. Récupérer les credentials Supabase

📍 Allez sur https://app.supabase.com/project/_/settings/api

Notez ces valeurs:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role secret` → `SUPABASE_SERVICE_KEY`

Et les URLs de connection:
- Pooler connection → `DATABASE_URL` (port 6543)
- Direct connection → `DIRECT_URL` (port 5432)

### 5. Configurer les variables d'environnement Vercel

**Option A: Via CLI**

```bash
vercel env add DATABASE_URL
# Coller: postgresql://postgres.xxx:yyy@aws-x-xx.pooler.supabase.com:6543/...

vercel env add DIRECT_URL
# Coller: postgresql://postgres.xxx:yyy@aws-x-xx.supabase.com:5432/...

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Coller: https://xxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Coller: sb_publishable_xxx

vercel env add SUPABASE_ANON_KEY
# Coller: sb_publishable_xxx

vercel env add SUPABASE_SERVICE_KEY
# Coller: sb_secret_xxx

vercel env add SUPABASE_STORAGE_BUCKET
# Répondre: echosante

vercel env add SITE_URL
# Répondre: https://echosante-xxx.vercel.app (remplacer xxx)

vercel env add AUTH_COOKIE_SECRET
# Générer une clé aléatoire de 32+ caractères
```

**Option B: Via dashboard Vercel**

1. Ouvrir https://vercel.com/dashboard
2. Sélectionner le projet `echo-sante-ngosite`
3. **Settings** → **Environment Variables**
4. Ajouter chaque variable ci-dessus

### 6. Vérifier le build localement

```bash
# Teste que tout compile correctement
npm run build

# Vérifier qu'il n'y a pas d'erreurs
vercel build
```

### 7. Déployer

**Preview deployment (test):**
```bash
vercel
```

**Production deployment:**
```bash
vercel --prod
```

Ou utiliser le script:
```bash
bash scripts/deploy-vercel.sh
```

---

## 📊 Après le déploiement

### Vérifier les logs

```bash
vercel logs <url>

# Ou voir les 50 derniers logs
vercel logs <url> -n 50
```

### Tester l'API

```bash
# Articles
curl https://votre-app.vercel.app/api/articles

# Pages
curl https://votre-app.vercel.app/api/pages

# Santé globale
curl https://votre-app.vercel.app/api/health 2>/dev/null || echo "Endpoint non disponible"
```

### Vérifier Supabase

1. Aller sur https://app.supabase.com/project/_/editor
2. Vérifier que les tables sont créées
3. Vérifier les données seedées

---

## 🛠️ Troubleshooting

### Erreur: "Could not find a valid build in the Output Directory"

**Solution:**
```bash
# Vérifier que .next existe
ls -la .next/

# Rebuild si nécessaire
rm -rf .next node_modules
npm install
npm run build
```

### Erreur: "DATABASE_URL is invalid"

**Vérifier:**
1. La variable est copiée correctement (pas de caractères cachés)
2. Elle n'est pas vide
3. Le format PostgreSQL est correct

```bash
# Vérifier localement
vercel env pull
cat .env.local | grep DATABASE_URL
```

### Erreur: "Prisma migration conflict"

**Solution:**
```bash
# Sur votre local, sync la DB
DATABASE_URL=postgresql://... npm run prisma:migrate

# Puis redéployer
vercel --prod
```

### Les données disparaissent après redéploiement

**Si vous utilisez SQLite:**
- C'est normal! SQLite sur Vercel n'a pas de persistence
- Solution: Utiliser Supabase PostgreSQL

**Si vous utilisez Supabase:**
- Vérifier que les migrations ont fonctionné
- Vérifier les logs Vercel: `vercel logs`

### Lenteur ou timeouts

**Solutions:**
1. Vérifier la connexion Supabase pooler vs directe
2. Optimiser les requêtes N+1
3. Ajouter des indexes en base de données
4. Augmenter les timeouts si nécessaire

```javascript
// Dans lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error'],
  errorFormat: 'pretty'
});
```

---

## 📈 Monitoring et logs

### Voir les logs en temps réel

```bash
vercel logs --follow
```

### Analyser un déploiement spécifique

```bash
vercel inspect <deployment-url>
```

### Voir les utilisation des resources

```bash
vercel analytics
```

---

## 🔐 Sécurité

### Variables sensibles

**Ne jamais committer:**
- `.env.production.local`
- `.env.local`
- Clés Supabase réelles

**Les secrets sont stockés:**
- Sur le serveur Vercel (sécurisé)
- Accessible via `vercel env`
- Non exposés au client (sauf NEXT_PUBLIC_*)

### Rotation des clés

Si une clé est compromise:

```bash
# Régénérer sur Supabase: https://app.supabase.com/project/_/settings/api
# Puis mettre à jour Vercel
vercel env rm SUPABASE_SERVICE_KEY
vercel env add SUPABASE_SERVICE_KEY
# Entrer la nouvelle clé

# Redéployer
vercel --prod
```

---

## 🎓 Ressources

- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Prisma on Vercel](https://www.prisma.io/docs/deploy/vercel)
- [Supabase Guide](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifier les logs: `vercel logs`
2. Vérifier le build local: `npm run build`
3. Vérifier les migrations Prisma: `vercel inspect`
4. Consulter: https://vercel.com/support

---

**Dernière mise à jour:** 2026-06-07
**Projet:** Echo Santé - ONG
**Framework:** Next.js 15.5.18
**Database:** Supabase PostgreSQL ou SQLite
