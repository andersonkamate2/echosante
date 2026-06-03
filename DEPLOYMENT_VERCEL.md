# Vercel Deployment Guide - Echo Santé

## Pre-Deployment Checklist ✅

- ✅ Database: Supabase PostgreSQL configured
- ✅ Storage: echosante bucket ready
- ✅ CRUD Operations: All tests passing
- ✅ RLS Policies: Security configured
- ✅ Environment: Dual-DB support (SQLite dev/PostgreSQL prod)
- ✅ API Routes: Configured

## Environment Variables for Vercel

Add the following environment variables to your Vercel project:

```env
# Supabase
SUPABASE_URL=https://zorbriynnrgihwwhkebo.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URLs (from .env.production)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Optional
NODE_ENV=production
DEBUG=false
```

## Deployment Steps

### 1. Push to GitHub (if not already)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy via Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

Or simply push to your main branch and Vercel will auto-deploy (if connected to GitHub).

### 3. Configure Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Select your Echo Santé project
3. Go to Settings → Environment Variables
4. Add all variables from above
5. Redeploy after adding variables

### 4. Verify Deployment

Check the deployment:
- Production URL should be accessible
- API endpoints should work
- Database queries should succeed

```bash
# Test in Vercel logs
curl https://your-vercel-url.vercel.app/api/articles
```

## Production Architecture

```
┌─────────────────────────────────────────────┐
│            Vercel (Next.js 15)              │
├─────────────────────────────────────────────┤
│  • API Routes (/api/*)                      │
│  • Server Components (ISR)                  │
│  • Middleware (Auth checks)                 │
└────────────┬────────────────────────────────┘
             │
             ├─→ Supabase PostgreSQL
             │   • RLS Policies enabled
             │   • Row-level security active
             │   • 9 main tables
             │
             └─→ Supabase Storage
                 • echosante bucket
                 • Max file size: Configurable
                 • CDN-backed delivery
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test home page loads correctly
- [ ] Test article listing page
- [ ] Test admin login flow
- [ ] Verify image uploads work
- [ ] Check database connections in logs
- [ ] Monitor ISR cache regeneration
- [ ] Set up error tracking (e.g., Sentry)

## Common Issues & Solutions

### Database Connection Error
```
Error: Connection refused
```
**Solution:** Verify DATABASE_URL and DIRECT_URL in Vercel environment variables.

### RLS Policy Denial
```
Error: row level security
```
**Solution:** Use correct Supabase keys (service key for admin operations, anon key for public reads).

### Storage Bucket 404
```
Error: bucket not found
```
**Solution:** Verify bucket name is "echosante" and exists in Supabase Storage.

## Monitoring

### Vercel Logs
- Go to Deployments → select deployment → Function Logs
- Filter for database errors or timeouts

### Supabase Logs
- Go to Supabase Dashboard → Logs
- Check for RLS policy violations or connection errors

### Performance
- ISR cache: Check that pages are cached (X-Vercel-Cache header)
- Database: Monitor query performance in Supabase dashboard
- Storage: Check CDN hit rate for images

## Rollback Procedure

If issues occur:

1. Check Vercel deployments page
2. Select previous successful deployment
3. Click "Promote to Production"
4. Or redeploy with `vercel --prod`

## Support & Debugging

### Enable Verbose Logging
```typescript
// In lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Test Database Connection
```bash
npm run env:check:live
npm run db:verify
```

### Run Full Test Suite
```bash
npm run test:all
npm run test:crud
npm run test:auth
```

## Next Steps

1. ✅ Verify production deployment
2. Deploy admin authentication UI
3. Set up email notifications
4. Configure CDN caching headers
5. Set up monitoring & alerts

---

**Deployment Status:** ✅ Ready for Vercel
**Last Updated:** 2024-06-03
**Environment:** Production
