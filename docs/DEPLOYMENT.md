# Deployment Guide

**Last Updated:** October 30, 2025

This guide covers deploying Life Dashboard to production.

---

## Quick Reference

**Production URL:** https://life-dashboard-ri1t.vercel.app  
**Health Check:** https://life-dashboard-ri1t.vercel.app/api/health  
**Deployment:** Automatic via GitHub (see [WORKFLOW.md](./WORKFLOW.md))

---

## Prerequisites

- [x] Vercel account
- [x] GitHub repository
- [x] Supabase project
- [x] Google OAuth credentials

---

## Initial Setup

### 1. Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Import `life-dashboard` repository
3. Framework: Next.js (auto-detected)
4. Click Deploy

### 2. Configure Environment Variables

**In Vercel → Settings → Environment Variables:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google OAuth
GOOGLE_CLIENT_ID=[your-client-id].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://[your-app].vercel.app/api/auth/google/callback

# NextAuth
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://[your-app].vercel.app

# Optional
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_DB_LOGGING=true
```

**Important:** Check boxes for Production, Preview, and Development

### 3. Run Database Migrations

**In Supabase SQL Editor:**

1. Run `supabase-setup.sql`
2. Run `supabase-migrations/001_error_logs.sql`

### 4. Update Google OAuth

**In Google Cloud Console → Credentials:**

Add authorized redirect URI:
```
https://life-dashboard-ri1t.vercel.app/api/auth/google/callback
```

### 5. Test Production

- [ ] Visit production URL
- [ ] Sign in works
- [ ] Health endpoint returns "healthy"
- [ ] Calendar connects
- [ ] Todos and grocery lists work

---

## Deployment Workflow

**See [WORKFLOW.md](./WORKFLOW.md) for the complete deployment process.**

### Quick Summary

1. **Create feature branch** from main
2. **Make changes** and push to GitHub
3. **Vercel auto-creates preview** deployment
4. **Test on preview URL**
5. **Create PR** when ready
6. **Merge PR** → Production auto-deploys
7. **Delete branch** after merge

**Production deploys automatically** when you merge to `main`.

---

## Environment Variables Reference

### Required Variables

| Variable | Purpose | Example |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | `eyJh...` |
| `GOOGLE_CLIENT_ID` | Google OAuth | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-abc123` |
| `NEXTAUTH_SECRET` | Session encryption | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Auth callback URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | Google redirect | `https://your-app.vercel.app/api/auth/google/callback` |

### Optional Variables

| Variable | Default | Purpose |
|----------|---------|----------|
| `NEXT_PUBLIC_LOG_LEVEL` | `info` | Logging verbosity |
| `NEXT_PUBLIC_ENABLE_DB_LOGGING` | `true` | Write logs to database |

---

## Database Migrations

### Adding New Migrations

1. **Create file:** `supabase-migrations/00X_description.sql`
2. **Push code** (includes migration file)
3. **Wait for deployment** to succeed
4. **Run SQL** in production Supabase
5. **Test** the new feature

**Example:**
```bash
git add supabase-migrations/002_new_feature.sql
git commit -m "feat: add new feature"
git push origin main  # Deploys code

# Then run SQL in Supabase production
```

---

## Monitoring

### Health Check

**Endpoint:** `/api/health`  
**Auto-refresh:** Every 30 seconds

**What to monitor:**
- Overall status (healthy/degraded/down)
- Database latency (< 100ms good)
- Google Calendar token status
- System uptime

### Error Logs

**Query Supabase `error_logs` table:**

```sql
-- Recent errors
SELECT * FROM error_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Error rate
SELECT COUNT(*) as error_count
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Vercel Analytics

**Access:** Vercel Dashboard → Analytics

**Monitor:**
- Page views
- API call count
- Error rate
- Response times

---

## Rollback

### Rollback Deployment

**Method 1: Vercel Dashboard**
1. Deployments → Find last working deployment
2. Click **...** → **Promote to Production**

**Method 2: Git Revert**
```bash
git revert HEAD
git push origin main
```

### Rollback Database

```sql
-- Example: Drop problematic table
DROP TABLE IF EXISTS problem_table;

-- Example: Remove problematic column
ALTER TABLE my_table DROP COLUMN problem_column;
```

**Tip:** Always test migrations locally first!

---

## Troubleshooting

### Deployment Fails

1. **Check build logs** in Vercel
2. **Common issues:**
   - Missing environment variable
   - Syntax error
   - Missing dependency

**Solution:** Fix locally, test with `npm run build`, push fix

### Health Endpoint Shows "Down"

1. **Check which service** is down
2. **Common causes:**
   - Database migration not run
   - Environment variable missing
   - Supabase project paused

**Solution:**
- Run database migrations
- Verify environment variables
- Check Supabase status

### Google OAuth Not Working

**Error:** `redirect_uri_mismatch`

**Solution:**
Ensure redirect URIs match exactly in:
- Google Cloud Console
- Vercel environment variables

No trailing slash!

### Environment Variable Not Working

**Symptoms:** Works locally, not in production

**Solution:**
1. Verify variables in Vercel Dashboard
2. Check all environments are checked
3. **Redeploy** after adding variables

---

## Best Practices

### Pre-Deployment Checklist

- [ ] Code tested locally
- [ ] Health endpoint shows healthy
- [ ] No console errors
- [ ] Migrations ready (if needed)
- [ ] Changelog updated

### Deployment Timing

**Best times:**
- ✅ Monday-Thursday (easy to fix issues)
- ✅ Morning/afternoon (team available)

**Avoid:**
- ❌ Friday evening
- ❌ Late night
- ❌ Before vacation

---

## Production URLs

**Application:**
```
App: https://life-dashboard-ri1t.vercel.app
Health: https://life-dashboard-ri1t.vercel.app/api/health
GitHub: https://github.com/mllivingston/life-dashboard
```

**Services:**
```
Supabase: https://supabase.com/dashboard/project/uzygfzjkxffmcesliwsb
Vercel: https://vercel.com/mllivingstons-projects
```

---

## Support

- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Development:** See [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Workflow:** See [WORKFLOW.md](./WORKFLOW.md)
- **Roadmap:** See [ROADMAP.md](./ROADMAP.md)

---

_Deployment is automated - just push to main!_ 🚀
