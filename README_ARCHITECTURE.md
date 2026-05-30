# 🏥 Echo Santé - Architecture Professionnelle Next.js 15

> **Plateforme vitrine + blog + CMS public pour ONG** avec authentification admin sécurisée, gestion de contenu publié/brouillon, et SEO optimisé.

## ✨ Caractéristiques

### 🌐 Accès Public (0 authentification requise)
- ✅ Tous les articles **publiés** visibles
- ✅ Pages CMS publiques accessibles
- ✅ Galeries d'images 
- ✅ Liste des projets, équipe, services
- ✅ Formulaire de contact WhatsApp
- ✅ Recherche et filtrage
- ✅ Sitemap + robots.txt (SEO)
- ✅ Open Graph metadata

### 🔐 Admin Dashboard (authentification requise)
- ✅ CRUD articles (draft/published)
- ✅ CRUD pages (publié/brouillon)
- ✅ CRUD galerie, équipe, services, stats
- ✅ Gestion des messages de contact
- ✅ Authentification cookie-based
- ✅ Session sécurisée 1 an

### 🚀 Performance & SEO
- ✅ **ISR** (revalidate 60s) pour vitesse + fraîcheur
- ✅ **Static Generation** avec `generateStaticParams()`
- ✅ **Metadata dynamique** par page
- ✅ **Sitemap.xml** généré dynamiquement
- ✅ **robots.txt** + Open Graph
- ✅ **Image Optimization** Next.js
- ✅ **CDN-ready** (Vercel/Cloudflare)

### 🛡️ Sécurité
- ✅ **RLS** (Row Level Security) au niveau DB
- ✅ **Middleware** d'authentification Next.js
- ✅ **Cookies sécurisés** (httpOnly, Secure, SameSite)
- ✅ **HMAC-SHA256** token signing
- ✅ **Admin role-based** access control
- ✅ **Supabase** PostgreSQL + auth

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 15)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Public Routes (ISR + CDN Cache)                            │
│  ├── / (home)                                                │
│  ├── /articles (search, filter, published only)             │
│  ├── /articles/[slug] (detail, metadata, OpenGraph)         │
│  ├── /pages (list)                                           │
│  ├── /pages/[slug] (detail)                                 │
│  ├── /gallery (public images)                               │
│  ├── /contact (form → WhatsApp)                             │
│  └── /sitemap.xml, /robots.txt                              │
│                                                               │
│  Admin Routes (Middleware Protected)                         │
│  ├── /admin/login (form)                                     │
│  ├── /admin/dashboard (CRUD panel)                           │
│  └── Middleware (/admin/* → auth check)                     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                      API LAYER (Route Handlers)               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Public API (requireAdminUser() bypassed)                   │
│  ├── GET /api/articles-public?q=search&category=cat         │
│  ├── GET /api/pages-public                                  │
│  ├── GET /api/gallery?category=general                      │
│  └── POST /api/contact (public insert)                      │
│                                                               │
│  Admin API (requireAdminUser() enforced)                    │
│  ├── POST/PUT/DELETE /api/articles                          │
│  ├── POST/PUT/DELETE /api/pages                             │
│  ├── POST/PUT/DELETE /api/gallery                           │
│  ├── POST /api/admin-users (admin mgmt)                     │
│  └── POST /api/auth (login/logout)                          │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                      DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Supabase PostgreSQL + RLS                                   │
│  ├── articles (status: draft|published)                     │
│  ├── page_contents (published: true|false)                  │
│  ├── gallery (active: true|false)                           │
│  ├── team_members (active)                                   │
│  ├── services (active)                                       │
│  ├── statistics (active)                                     │
│  ├── contact_messages (admin-only read)                     │
│  ├── testimonials (published)                                │
│  ├── events (published + status)                            │
│  ├── partners (active)                                       │
│  └── auth.admin_role (role-based access)                    │
│                                                               │
│  RLS Policies:                                               │
│  - Public: SELECT WHERE published=true OR active=true        │
│  - Admin: All operations if role='admin'                    │
│  - Insert: Public (contact forms)                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Démarrage Rapide

### Installation
```bash
# Clone repo
git clone <repo>
cd echo-sante-nestjs

# Install dépendances
npm install

# Setup Prisma (SQLite local)
npm run prisma:generate:sqlite
npm run prisma:push:sqlite
npm run prisma:seed

# Start dev server
npm run dev
```

### URLs par défaut
- 🌐 **Public**: http://localhost:3000
- 📝 **Articles**: http://localhost:3000/articles
- 🔐 **Admin Login**: http://localhost:3000/admin/login
- 📊 **Admin Dashboard**: http://localhost:3000/admin/dashboard
- 🔑 **Credentials**: `admin@echosante.org` / `password`

## 📁 Structure des Dossiers

```
echo-sante-nestjs/
├── app/
│   ├── page.tsx                      # Home page
│   ├── layout.tsx                    # Root layout + metadata
│   ├── middleware.ts                 # Auth middleware
│   ├── articles/
│   │   ├── page.tsx                  # Articles list (search)
│   │   └── [slug]/page.tsx           # Article detail (ISR)
│   ├── pages/
│   │   ├── page.tsx                  # Pages list
│   │   └── [slug]/page.tsx           # Page detail (ISR)
│   ├── gallery/page.tsx              # Gallery public
│   ├── admin/
│   │   ├── login/page.tsx            # Login form
│   │   └── dashboard/page.tsx        # Admin panel
│   ├── api/
│   │   ├── auth/route.ts             # Login/logout
│   │   ├── articles/route.ts         # Admin CRUD
│   │   ├── articles-public/route.ts  # Public read
│   │   ├── pages/route.ts            # Admin pages
│   │   ├── pages-public/route.ts     # Public pages
│   │   └── gallery/route.ts          # Admin + public
│   ├── sitemap.ts                    # Dynamic sitemap
│   ├── robots.ts                     # robots.txt
│   └── actions/
│       ├── articles.ts               # Server actions
│       └── pages.ts                  # Server actions
│
├── lib/
│   ├── auth.ts                       # Auth client wrapper
│   ├── auth-utils.ts                 # Token crypto
│   ├── auth-middleware.ts            # Admin checks
│   ├── prisma.ts                     # Prisma client
│   ├── prisma/
│   │   ├── articles.ts               # Article queries
│   │   ├── pages.ts                  # Page queries
│   │   ├── gallery.ts                # Gallery queries
│   │   └── auth.ts                   # Admin auth
│   └── supabase/
│       ├── client.ts                 # Client SDK
│       ├── server.ts                 # Server SDK
│       ├── auth.ts                   # Supabase auth
│       ├── public.ts                 # Public queries
│       └── mock.ts                   # Mock for dev
│
├── types/
│   ├── article.ts                    # Article interface
│   └── content.ts                    # Page/Gallery types
│
├── components/
│   ├── Navbar.tsx                    # Header
│   ├── Footer.tsx                    # Footer
│   ├── ArticleCard.tsx               # Article preview
│   ├── AdminArticleForm.tsx          # Admin form
│   ├── AdminResourceForm.tsx         # Generic form
│   ├── WhatsAppForm.tsx              # Contact form
│   └── ui/                           # UI components
│
├── prisma/
│   ├── schema.prisma                 # DB schema (PostgreSQL)
│   ├── schema.sqlite.prisma          # DB schema (SQLite)
│   └── seed.ts                       # Seed admin
│
├── sql/
│   ├── schema.sql                    # Legacy schema
│   └── schema-rls.sql                # RLS policies
│
├── public/                           # Static assets
├── ARCHITECTURE.md                   # Architecture guide
├── DEPLOYMENT.md                     # Deploy guide
├── AUTH.md                           # Auth docs
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## 🔑 Authentification

### Flux de Login
```
1. User → /admin/login
2. Submit email + password → POST /api/auth
3. Server verifies in Prisma (local) or Supabase (prod)
4. If valid → Create JWT token + set httpOnly cookie
5. Redirect → /admin/dashboard
6. Middleware checks cookie on /admin/* requests
```

### Token Structure
```
userId|email|role|exp|signature
examples:
123e4567|admin@echosante.org|admin|1735689600000|a3f2e9c1...
```

### Logout
```
DELETE /api/auth → Clear cookie → Redirect to /admin/login
```

## 📊 Database Schema

### Articles Table
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies
```sql
-- Public can read published articles
CREATE POLICY "articles_published_public_select" ON articles FOR SELECT
  USING (status = 'published');

-- Admin can do everything
CREATE POLICY "articles_admin_all" ON articles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.admin_role ar
    WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
  ));
```

## 🎯 Common Tasks

### Créer un Article
```typescript
// Via API
POST /api/articles
{
  "title": "Mon article",
  "slug": "mon-article",
  "excerpt": "Résumé court",
  "content": "<h2>Contenu HTML</h2>",
  "cover_image": "https://...",
  "author": "Prénom Nom",
  "category": "Santé",
  "tags": ["santé", "prévention"],
  "status": "draft"  // ou "published"
}

// Via Server Action
import { publishArticle } from '@/app/actions/articles';

await publishArticle({
  title: "...",
  slug: "...",
  // ...
  status: "published"
});
```

### Publier un Brouillon
```bash
PUT /api/articles/:id
{
  "status": "published",
  "published_at": "2024-12-30T10:00:00Z"
}
```

### Afficher les Articles Publiés
```typescript
import { getPublishedArticles } from '@/lib/supabase/public';

const articles = await getPublishedArticles({
  query: 'santé',
  category: 'Prévention'
});
```

## 🌍 Déploiement

### Vercel (recommandé)
```bash
# 1. Push vers GitHub
# 2. Import dans Vercel
# 3. Set env vars:
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add AUTH_COOKIE_SECRET
vercel env add SITE_URL

# 4. Deploy
vercel deploy --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=.next
```

### Self-hosted
```bash
npm run build
npm start
```

## 📈 Performance

### Metrics
- **First Contentful Paint**: < 1s (ISR + CDN)
- **Largest Contentful Paint**: < 2.5s
- **CLS**: < 0.1
- **Lighthouse**: 90+

### Optimizations
- ISR (60s) pour articles/pages
- Image optimization
- Dynamic imports
- CSS modules
- Compression gzip

## 🔐 Sécurité

### Checklist
- ✅ Cookies httpOnly + Secure
- ✅ CSRF protection (SameSite=Lax)
- ✅ Rate limiting (à impl)
- ✅ Input validation (Zod)
- ✅ RLS au niveau DB
- ✅ No secrets in code

### Hardening
```bash
# HTTPS enforcement
# CSP headers (Content-Security-Policy)
# HSTS (Strict-Transport-Security)
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

## 🆘 Troubleshooting

### Articles ne s'affichent pas
1. Vérifier `status = 'published'`
2. Attendre 60s pour ISR revalidation
3. Vider cache navigateur
4. Vérifier RLS policies

### Login échoue
1. Vérifier email/password corrects
2. Check `AUTH_COOKIE_SECRET` set
3. Check cookies enabled
4. Check token not expired

### Supabase connection issue
1. Vérifier `SUPABASE_URL` + keys
2. Vérifier RLS enabled
3. Vérifier network connectivity
4. Check Supabase dashboard status

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Détails architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide déploiement
- [AUTH.md](./AUTH.md) - Authentification
- [sql/schema-rls.sql](./sql/schema-rls.sql) - Schéma complet

## 🤝 Contribution

```bash
# Fork repo
git checkout -b feature/ma-feature
git commit -am "Add ma-feature"
git push origin feature/ma-feature
# PR sur main
```

## 📝 License

MIT © 2024 Echo Santé ONG

---

**Questions?** Ouvrez une issue GitHub ou consultez la documentation complète.
