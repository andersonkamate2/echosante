/**
 * ARCHITECTURE GUIDE - Echo Santé Professional Platform
 * 
 * This document describes the complete security architecture with public/admin separation,
 * role-based access control (RBAC), RLS policies, and ISR caching.
 */

# Architecture Overview

## 1. Authentication & Authorization

### User Roles
- **Guest/Visitor**: No authentication. Can access all published content.
- **Admin**: Authenticated via email/password. Can create, edit, delete all content.

### Session Management
- Cookie-based authentication (httpOnly, secure, SameSite=Lax)
- Token structure: `userId|email|role|exp|signature` (HMAC-SHA256)
- Max age: 1 year (configurable via AUTH_COOKIE_SECRET)

### Admin Access
- Protected at middleware level (`app/middleware.ts`)
- Routes under `/admin` require admin role
- Auto-redirect non-admin to `/admin/login`

## 2. Database Security (Supabase/PostgreSQL)

### Row Level Security (RLS)

All public tables have three policy types:

1. **Public Read** (for published content):
   ```sql
   CREATE POLICY "articles_published_public_select" ON public.articles FOR SELECT
     USING (status = 'published');
   ```

2. **Admin All Operations**:
   ```sql
   CREATE POLICY "articles_admin_all" ON public.articles FOR ALL
     USING (EXISTS (
       SELECT 1 FROM auth.admin_role
       WHERE user_id = auth.uid() AND role = 'admin'
     ));
   ```

3. **Public Insert** (for contact forms only):
   ```sql
   CREATE POLICY "contact_messages_public_insert" ON public.contact_messages FOR INSERT
     WITH CHECK (true);
   ```

### Tables with Published/Draft Status
- **articles**: `status` column (draft/published)
- **page_contents**: `published` boolean
- **gallery**: `active` boolean
- **events**: `published` boolean

## 3. API Routes Structure

### Public Routes (No Authentication)
- `GET /api/articles-public` - List published articles with search/filter
- `GET /api/pages-public` - List published pages
- `GET /api/gallery?active=true` - List active gallery items
- `POST /api/contact` - Submit contact form (public insert)
- `GET /sitemap.xml` - Sitemap for SEO
- `GET /robots.txt` - Robots configuration

### Admin Routes (Require Admin Role)
- `POST /api/articles` - Create article
- `PUT /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]` - Delete article
- `POST /api/pages` - Create page
- `PUT /api/pages/[id]` - Update page
- `DELETE /api/pages/[id]` - Delete page
- `GET /api/gallery?admin=true` - List all gallery items
- Similar CRUD for projects, team, services, statistics, events, etc.

### Auth Routes
- `POST /api/auth` - Login (sets secure cookie)
- `GET /api/auth` - Check session
- `DELETE /api/auth` - Logout (clears cookie)

## 4. Page Rendering Strategy

### Static Generation with Incremental Static Regeneration (ISR)

**Published Pages** (revalidate every 60 seconds):
```typescript
export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}
```

**Benefits**:
- Fast initial page load (cached HTML)
- Auto-revalidate every 60s (new content visible within 1 minute)
- Falls back to SSR if revalidation fails
- Excellent SEO via pre-rendered pages

### Pages Structure
```
app/
├── page.tsx                    (home, public)
├── about/page.tsx              (public)
├── articles/
│   ├── page.tsx               (list, search, public)
│   └── [slug]/page.tsx        (detail, ISR, public)
├── pages/
│   ├── page.tsx               (list, public)
│   └── [slug]/page.tsx        (detail, ISR, public)
├── gallery/page.tsx           (public)
├── contact/page.tsx           (public)
├── projects/page.tsx          (public)
├── admin/
│   ├── login/page.tsx         (auth form)
│   ├── dashboard/page.tsx     (admin panel)
│   └── middleware.ts          (auth guard)
├── api/
│   ├── auth/route.ts          (POST/GET/DELETE)
│   ├── articles/route.ts      (admin CRUD)
│   ├── articles-public/route.ts (public read)
│   ├── pages-public/route.ts   (public read)
│   └── gallery/route.ts       (public + admin)
├── sitemap.ts                 (dynamic sitemap)
└── robots.ts                  (robots.txt)
```

## 5. Middleware Authentication

**File**: `app/middleware.ts`

```typescript
export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('app_session_id')?.value;
  const payload = token ? verifyAuthToken(token) : null;
  const isAdmin = payload?.role === 'admin';

  if (!isAdmin && request.nextUrl.pathname !== '/admin/login') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}
```

**Behavior**:
- Intercepts all `/admin/*` requests
- Verifies secure cookie token
- Redirects non-admin to `/admin/login`
- Admin already logged in? Skip login page, go to dashboard

## 6. Content Access Flow

### Visitor (Public User)
```
Browser
  ↓
Public Page (e.g., /articles)
  ↓
getPublishedArticles() 
  ↓
Supabase Query with RLS
  WHERE status = 'published' AND auth.uid() IS NULL
  ↓
Return published articles only
```

### Admin User
```
Browser (logged in via /admin/login)
  ↓
Admin Dashboard (/admin/dashboard)
  ↓
Middleware Check: Token + Role Check
  ↓
Admin API Route (e.g., POST /api/articles)
  ↓
requireAdminUser() Check
  ↓
Supabase Query with RLS
  WHERE EXISTS (SELECT FROM admin_role WHERE role = 'admin')
  ↓
Return all articles (draft + published)
```

## 7. Type Safety

### Core Types
```typescript
// User with role
export interface CurrentUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// Published article
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Page content
export interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  meta_description?: string;
}
```

## 8. Performance Optimizations

### Caching Strategy
1. **ISR (60s)**: Article/Page detail pages
2. **Server-side Cache**: getPublishedArticles() caches results
3. **HTTP Cache Headers**: CDN-friendly headers for Vercel/Cloudflare
4. **Pagination**: Large datasets paginated (if needed)

### SEO Optimizations
1. **Metadata**: Dynamic `generateMetadata()` for each page
2. **Open Graph**: Article images, descriptions
3. **Sitemap**: `sitemap.ts` with all published pages
4. **robots.txt**: Allows public content, blocks `/admin`
5. **Canonical URLs**: Set via metadata
6. **Schema.org**: Article and Organization schema

### Database Optimization
1. **Indexes**: On status, slug, published_at, category
2. **Queries**: Select only needed fields (avoid N+1)
3. **RLS**: Efficient policies with indexed columns

## 9. Deployment Environment Variables

```bash
# Supabase (Production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Authentication
AUTH_COOKIE_SECRET=your-secret-key

# SEO & Site URL
SITE_URL=https://echosante.org

# Database (SQLite for local)
DATABASE_URL=file:./prisma/dev.db
```

## 10. Common Tasks

### Publish an Article
1. Admin logs into `/admin/login`
2. Goes to `/admin/dashboard` → Articles tab
3. Fills form: title, slug, content, status="published"
4. Hits "Create Article"
5. POST to `/api/articles` with `requireAdminUser()` check
6. Article saved with `status = 'published'`
7. Within 60s, `GET /articles` shows new article (ISR)

### A Visitor Reads an Article
1. Visitor (no auth) goes to `/articles`
2. `getPublishedArticles()` returns only published articles
3. Visitor clicks article slug `/articles/my-article`
4. Page pre-generated via ISR + dynamic params
5. Article displays with metadata (SEO)
6. No login required

### Delete Article
1. Admin on dashboard, clicks delete
2. DELETE `/api/articles/[id]`
3. Middleware checks admin role
4. `requireAdminUser()` confirms
5. Article deleted from DB
6. ISR revalidates, article disappears from `/articles`

---

## Summary

✅ **100% of public content** accessible without authentication  
✅ **Admin-only CMS** with secure role-based access  
✅ **RLS security** at database level  
✅ **ISR caching** for performance  
✅ **SEO optimized** with sitemap, robots, metadata  
✅ **TypeScript** for type safety  
✅ **Middleware-protected** admin routes  
✅ **Supabase-ready** with fallback to SQLite locally
