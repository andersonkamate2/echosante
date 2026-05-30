# Deployment & Configuration Guide

## Environment Variables

### Development (SQLite + Local Admin)
```bash
NODE_ENV=development
DATABASE_URL=file:./prisma/dev.db
AUTH_COOKIE_SECRET=your-dev-secret-key
LOCAL_ADMIN_EMAIL=admin@echosante.org
LOCAL_ADMIN_PASSWORD=password
SITE_URL=http://localhost:3000
TEST_SUPABASE=0
```

### Production (Supabase PostgreSQL)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/echo_sante
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
AUTH_COOKIE_SECRET=your-production-secret-key
SITE_URL=https://echosante.org
```

## Database Setup

### Local Development (SQLite)
```bash
npm run dev
# Automatically creates SQLite database and seeds admin user
```

### Production (Supabase)
1. Create Supabase project at https://supabase.com
2. Run SQL schema from `sql/schema-rls.sql` in Supabase SQL Editor
3. Create first admin user:
   ```sql
   -- In Supabase Auth, create a new user with email
   -- Then in admin_role table:
   INSERT INTO auth.admin_role (user_id, role)
   VALUES (auth.uid(), 'admin');
   ```
4. Set environment variables in `.env.production`
5. Deploy to Vercel/Netlify

## Build & Deploy

### Build
```bash
npm run build
```

### Local Testing
```bash
npm run dev:mock    # Mock Supabase
npm run dev         # Real local SQLite
```

### Deploy to Vercel
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set production environment variables
4. Deploy: Vercel auto-builds and deploys

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=.next
```

## Monitoring & Maintenance

### Check Admin Users
```bash
# SQLite
sqlite3 prisma/dev.db "SELECT id, email FROM AdminUser;"

# Supabase Dashboard → Authentication → Users
```

### Revalidate ISR Cache
```bash
# Manually revalidate articles after publishing
curl -X POST https://echosante.org/api/revalidate?secret=your-secret&path=/articles

# Or in code:
revalidatePath('/articles');
revalidatePath('/articles/[slug]');
```

### Database Backups
```bash
# Supabase: Automatic daily backups in dashboard
# SQLite: Manual backup
cp prisma/dev.db prisma/dev.db.backup
```

## Scaling Recommendations

### Current Setup
- Good for: Small to mid-size NGOs (< 10k monthly visitors)
- Max articles: 10,000+ (depends on content size)

### Optimization for Scale
1. **CDN**: Enable Vercel Edge Cache (60s-30m)
2. **Database**: Add read replicas in Supabase
3. **Images**: Use Vercel Image Optimization
4. **Search**: Add Algolia for full-text search
5. **Analytics**: Integrate Vercel Analytics or Plausible

## Troubleshooting

### Articles not showing up
1. Check `status = 'published'` in database
2. Check ISR revalidation (60s delay)
3. Clear browser cache
4. Check middleware logs

### Admin login not working
1. Check cookie settings (secure/httpOnly)
2. Verify `AUTH_COOKIE_SECRET` is set
3. Check token expiration
4. Verify admin user exists in database

### Supabase connection issues
1. Check `SUPABASE_URL` and keys
2. Verify RLS policies are enabled
3. Check network connectivity
4. Review Supabase logs in dashboard

## Performance Checklist

- [ ] ISR enabled on article/page detail pages
- [ ] Sitemap generated and submitted to Google Search Console
- [ ] robots.txt blocks `/admin` routes
- [ ] Meta descriptions added to all pages
- [ ] Open Graph images configured
- [ ] Images optimized with next/image
- [ ] Database indexes created on status/slug/published_at
- [ ] CDN caching configured
- [ ] SSL certificate installed
- [ ] Analytics configured

## Security Checklist

- [ ] `AUTH_COOKIE_SECRET` is strong (32+ chars)
- [ ] Cookies are httpOnly and secure
- [ ] Admin middleware blocks unauthenticated requests
- [ ] RLS policies enabled on all public tables
- [ ] Rate limiting on `/api/auth` endpoint
- [ ] Contact form spam protection (CAPTCHA)
- [ ] Database backups configured
- [ ] Security headers set (CSP, X-Frame-Options)
- [ ] Admin routes not exposed in sitemap
- [ ] Sensitive environment variables not committed to git
