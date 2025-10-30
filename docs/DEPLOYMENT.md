# Deployment Guide

How to deploy Life Dashboard to production using our feature branch workflow.

---

## Quick Reference

**Production:** https://life-dashboard-ri1t.vercel.app  
**Health Check:** https://life-dashboard-ri1t.vercel.app/api/health  
**Method:** Feature branches → Preview → Merge → Production

---

## Deployment Workflow

### Standard Process (Feature Branch)

1. **Create feature branch:**
```bash
git checkout -b feature/my-feature
```

2. **Make changes and push:**
```bash
git add .
git commit -m "feat: description"
git push origin feature/my-feature
```

3. **Vercel auto-creates preview deployment** (⌚ 30-60 seconds)
   - Preview URL: `https://life-dashboard-ri1t-[hash].vercel.app`
   - Same environment as production
   - Safe to test changes

4. **Create Pull Request on GitHub**

5. **Test on preview deployment:**
   - Click "View deployment" button in PR
   - Verify all functionality works
   - Check health endpoint: `[preview-url]/api/health`
   - Test critical user flows

6. **Merge PR when tests pass:**
   - Vercel automatically deploys to production
   - Preview deployment auto-deleted
   - Production updated in ~60 seconds

7. **Verify production:**
   - Visit: https://life-dashboard-ri1t.vercel.app
   - Check health: https://life-dashboard-ri1t.vercel.app/api/health
   - Test critical flows

For detailed workflow documentation, see [WORKFLOW.md](./WORKFLOW.md).

---

## Environment Variables

### Required Variables

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://uzygfzjkxffmcesliwsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Google OAuth:**
```
GOOGLE_CLIENT_ID=96666258855-2tpl78o0c8m4de0nshmpf5rht8c6sgge.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

**NextAuth:**
```
NEXTAUTH_SECRET=GJ+SDndPketDkY+JG8Elmy4QjpaVEUvLnGhddHYIzuE=
NEXTAUTH_URL=https://life-dashboard-ri1t.vercel.app
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://life-dashboard-ri1t.vercel.app/api/auth/google/callback
```

**Optional:**
```
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_DB_LOGGING=true
```

### Managing Variables in Vercel

1. Go to: Project → Settings → Environment Variables
2. Add/Edit variables
3. Check **Production**, **Preview**, and **Development** environments
4. **Redeploy** after changes (variables don't auto-update)

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Database Migrations

### Running Migrations

1. **Push code** (including migration file)
2. **Wait for deployment**
3. **Run migration in production:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy/paste migration SQL
   - Execute
4. **Verify:**
   ```bash
   curl https://life-dashboard-ri1t.vercel.app/api/health
   ```

### Migration Order

```sql
-- 1. Initial setup
supabase-setup.sql

-- 2. Error logging (Phase 1)
supabase-migrations/001_error_logs.sql

-- Future migrations...
```

---

## Initial Setup (One-Time)

### 1. Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. Import `mllivingston/life-dashboard`
4. Configure:
   - Framework: Next.js ✅ (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`

### 2. Configure Environment Variables

Add all variables listed above in Vercel Dashboard.

### 3. Deploy

Click **Deploy** → Wait 2-3 minutes.

### 4. Run Database Migrations

Run all migrations in Supabase SQL Editor (see order above).

### 5. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID → Add redirect URI:
   ```
   https://life-dashboard-ri1t.vercel.app/api/auth/google/callback
   ```
4. Save

### 6. Test Production

- [ ] Visit production URL
- [ ] Sign in works
- [ ] Health endpoint shows "healthy"
- [ ] Google Calendar connects
- [ ] Todos and grocery list work

---

## Rollback

### Method 1: Vercel Dashboard (Fastest)

1. Go to Vercel → Deployments
2. Find last working deployment
3. Click **...** → **Promote to Production**

### Method 2: Git Revert

```bash
git revert HEAD
git push origin main
# Vercel auto-deploys the revert
```

### Database Rollback

```sql
-- Rollback table creation
DROP TABLE IF EXISTS problem_table;

-- Rollback column addition  
ALTER TABLE my_table DROP COLUMN problem_column;
```

**Important:** Always test migrations in development first!

---

## Monitoring

### Health Check

**Production:** https://life-dashboard-ri1t.vercel.app/api/health  
**Auto-refresh:** Every 30 seconds  

**Monitor:**
- Overall status (healthy/degraded/down)
- Database latency
- Google Calendar token status
- System uptime

### Error Logs

Query the `error_logs` table in Supabase:

```sql
-- Recent errors
SELECT * FROM error_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Error rate
SELECT COUNT(*) FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Errors by service
SELECT service, COUNT(*) as count
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY service;
```

### Vercel Analytics

Monitor in Vercel Dashboard → Analytics:
- Page views
- API calls
- Error rate
- Response times

---

## Troubleshooting

### Deployment Fails

**Check:**
1. Vercel build logs (click deployment → Build Logs)
2. Common issues:
   - Missing environment variable
   - Syntax error
   - Missing dependency

**Fix:**
```bash
# Test locally first
npm run build

# Then push fix
git push origin main
```

### Health Endpoint Shows "Down"

**Debug:**
1. Which service is down?
2. Check database migrations ran
3. Verify environment variables
4. Check Supabase project status

### Google OAuth Error

**Error:** `redirect_uri_mismatch`

**Fix:**
Ensure exact match in Google Cloud Console:
```
https://life-dashboard-ri1t.vercel.app/api/auth/google/callback
```
No trailing slash!

### Calendar Not Loading

**Debug:**
1. Check health endpoint - token expired?
2. Check error_logs table
3. Try reconnecting Google Calendar
4. Verify Google API enabled

### Environment Variable Not Working

**Solution:**
1. Verify in Vercel Dashboard
2. Check all environments are selected
3. **Redeploy** (important!)
4. Verify:
```javascript
console.log(process.env.YOUR_VARIABLE)
```

---

## Pre-Deployment Checklist

- [ ] Code tested locally
- [ ] Tests pass (if applicable)
- [ ] Health endpoint shows healthy
- [ ] No console errors
- [ ] Migration files ready
- [ ] Environment variables documented

## Post-Deployment Checklist

- [ ] Production URL loads
- [ ] Health endpoint shows healthy
- [ ] Test critical user flows
- [ ] Monitor error logs for 10 minutes
- [ ] Verify migrations ran (if applicable)

---

## Best Practices

### Deployment Timing

**Best times:**
- ✅ Monday-Thursday
- ✅ Morning/afternoon
- ✅ After testing

**Avoid:**
- ❌ Friday evening
- ❌ Late night
- ❌ Before vacation

### Feature Branch Strategy

**Always use feature branches for:**
- New features
- Bug fixes
- Refactoring
- Database changes

**May push directly to main for:**
- Documentation updates
- Typo fixes
- Emergency hotfixes

---

## Support Resources

**Vercel:**
- [Documentation](https://vercel.com/docs)
- [Support](https://vercel.com/support)

**Supabase:**
- [Docs](https://supabase.com/docs)  
- [Support](https://supabase.com/support)

**Internal:**
- [WORKFLOW.md](./WORKFLOW.md) - Detailed git/deployment workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Local development
- [ROADMAP.md](./ROADMAP.md) - What's next

---

_Last updated: October 30, 2025_
