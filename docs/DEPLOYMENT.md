# Deployment Guide

This guide covers deploying Life Dashboard to production on Vercel.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Deployment](#initial-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)
7. [Updating Production](#updating-production)
8. [Rollback](#rollback)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**Deployment Stack:**
- **Frontend + API:** Vercel (serverless)
- **Database:** Supabase (managed PostgreSQL)
- **Domain:** Vercel auto-generated or custom

**Current Production URL:** `https://life-dashboard-ri1t.vercel.app`

**Deployment Method:** Automatic via Git push to main branch

---

## Prerequisites

Before deploying, ensure you have:

- [x] Vercel account created
- [x] Vercel CLI installed (optional): `npm i -g vercel`
- [x] GitHub repository set up
- [x] Supabase project created
- [x] Google OAuth credentials (production URLs)
- [x] Code tested locally

---

## Initial Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Add remote and push
git remote add origin https://github.com/mllivingston/life-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New...** → **Project**
4. Import `life-dashboard` repository
5. Configure project:
   - **Framework Preset:** Next.js ✅ (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Step 3: Add Environment Variables

In Vercel project settings, add these variables:

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://uzygfzjkxffmcesliwsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Google OAuth:**
```
GOOGLE_CLIENT_ID=96666258855-2tpl78o0c8m4de0nshmpf5rht8c6sgge.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**NextAuth:**
```
NEXTAUTH_SECRET=GJ+SDndPketDkY+JG8Elmy4QjpaVEUvLnGhddHYIzuE=
NEXTAUTH_URL=https://life-dashboard-ri1t.vercel.app
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://life-dashboard-ri1t.vercel.app/api/auth/google/callback
```

**Optional - Logging:**
```
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_DB_LOGGING=true
NEXT_PUBLIC_APP_VERSION=1.1.0
```

**Important:** Check all three environments (Production, Preview, Development)

### Step 4: Deploy

Click **Deploy** and wait 2-3 minutes.

**Expected result:** Deployment succeeds, you get a URL like `https://life-dashboard-abc123.vercel.app`

---

## Environment Variables

### Managing Environment Variables

**In Vercel Dashboard:**
1. Project → Settings → Environment Variables
2. Add/Edit/Delete variables
3. **After changes:** Redeploy for them to take effect

**Environment Types:**
- **Production:** Used for `main` branch deployments
- **Preview:** Used for feature branch deployments
- **Development:** Used for local development (not typically needed)

### Required Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz.supabase.co` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJh...` | Supabase anon key |
| `GOOGLE_CLIENT_ID` | `123-abc.apps.googleusercontent.com` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-abc123` | Google OAuth secret |
| `NEXTAUTH_SECRET` | `random-secret-string` | Session encryption |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Auth callback URL |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | `https://your-app.vercel.app/api/auth/google/callback` | Google redirect |

### Optional Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_LOG_LEVEL` | `info` | Logging verbosity |
| `NEXT_PUBLIC_ENABLE_DB_LOGGING` | `true` | Write logs to database |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | App version in logs |

### Generating Secrets

**NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## Database Setup

### Step 1: Run Migrations in Production

After first deployment, set up the database:

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Run migrations in order:

**Migration 1: Initial Setup**
```sql
-- Run supabase-setup.sql
-- (Creates todos, grocery_items, google_tokens tables)
```

**Migration 2: Error Logging**
```sql
-- Run supabase-migrations/001_error_logs.sql
-- (Creates error_logs table and policies)
```

### Step 2: Verify Tables

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Expected tables:
-- - todos
-- - grocery_items
-- - google_tokens
-- - error_logs
```

### Step 3: Test Connectivity

Visit your health endpoint:
```
https://your-app.vercel.app/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "up" }
  }
}
```

---

## Post-Deployment

### Update Google OAuth

After deployment, update Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://life-dashboard-ri1t.vercel.app/api/auth/google/callback
   ```
6. Click **Save**

### Test Production

**Checklist:**
- [ ] Visit production URL
- [ ] Sign up/sign in works
- [ ] Health endpoint returns healthy
- [ ] Can connect Google Calendar
- [ ] Todos work
- [ ] Grocery list works
- [ ] Check error logs in Supabase (should be empty or minimal)

### Set Up Monitoring

1. **Bookmark health endpoint:**
   ```
   https://your-app.vercel.app/api/health
   ```

2. **Set up UptimeRobot (optional):**
   - Monitor health endpoint every 5 minutes
   - Get alerts if it goes down

3. **Check Vercel Analytics:**
   - Project → Analytics
   - Monitor traffic and performance

---

## Updating Production

### Automatic Deployment (Recommended)

Vercel automatically deploys when you push to `main`:

```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin main

# Vercel automatically deploys (2-3 minutes)
```

**Check deployment:**
1. Go to Vercel Dashboard → Deployments
2. Wait for "Ready" status
3. Test production URL

### Manual Deployment (if needed)

```bash
# Using Vercel CLI
vercel --prod

# Or redeploy from dashboard
# Vercel Dashboard → Deployments → ... → Redeploy
```

### Database Migrations

When adding new migrations:

1. **Push code** (includes migration file)
2. **Wait for deployment**
3. **Run migration** in production Supabase
4. **Test** the new feature

**Example:**
```bash
# 1. Code with migration file
git add supabase-migrations/002_new_feature.sql
git commit -m "feat: add new feature with migration"
git push origin main

# 2. Wait for Vercel deployment

# 3. Run in production Supabase SQL Editor
# Copy/paste 002_new_feature.sql

# 4. Test production
curl https://your-app.vercel.app/api/health
```

---

## Rollback

### Rollback Deployment

If a deployment breaks production:

**Method 1: Vercel Dashboard**
1. Go to Deployments
2. Find last working deployment
3. Click **...** → **Promote to Production**

**Method 2: Git Revert**
```bash
# Revert last commit
git revert HEAD
git push origin main

# Vercel will auto-deploy the revert
```

### Rollback Database

**If migration breaks database:**

```sql
-- Example: Rollback table creation
DROP TABLE IF EXISTS problem_table;

-- Or: Rollback column addition
ALTER TABLE my_table DROP COLUMN problem_column;
```

**Important:** Always test migrations locally first!

---

## Monitoring

### Health Check

**Endpoint:** `https://your-app.vercel.app/api/health`

**What to monitor:**
- Overall status (healthy/degraded/down)
- Database latency (< 100ms good)
- Google Calendar token status
- System uptime

**Auto-refresh:** Page refreshes every 30 seconds

### Error Logs

**Check Supabase error_logs table:**

```sql
-- Recent errors
SELECT * FROM error_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Error rate
SELECT COUNT(*) as error_count
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Errors by service
SELECT service, COUNT(*) as count
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY service
ORDER BY count DESC;
```

### Vercel Analytics

**Monitor:**
- Page views
- API call count
- Error rate
- Response times

**Access:** Vercel Dashboard → Project → Analytics

### Set Up Alerts

**Option 1: Email Alerts (Vercel)**
- Configure in Vercel Dashboard
- Get notified of failed deployments

**Option 2: UptimeRobot (Free)**
- Monitor health endpoint
- Email/SMS when down
- 50 monitors free tier

**Option 3: Custom (Future)**
- Query error_logs table
- Send email if error rate spikes
- Implement in Phase 4

---

## Troubleshooting

### Deployment Fails

**Error:** "Build failed"

**Debug steps:**
1. Check Vercel build logs (click deployment → View Build Logs)
2. Look for error message
3. Common issues:
   - Missing environment variable
   - Syntax error in code
   - Missing dependency

**Solution:**
- Fix the issue locally
- Test with `npm run build`
- Push fix to GitHub

---

### Health Endpoint Shows "Down"

**Symptoms:** `/api/health` returns 503

**Debug steps:**
1. Check which service is down
2. Common causes:
   - Database migration not run
   - Environment variable missing
   - Supabase project paused

**Solutions:**
- Run database migrations
- Check environment variables in Vercel
- Check Supabase project status

---

### Google OAuth Not Working

**Error:** "redirect_uri_mismatch"

**Debug steps:**
1. Check Google Cloud Console redirect URIs
2. Check NEXT_PUBLIC_GOOGLE_REDIRECT_URI in Vercel

**Solution:**
Ensure they match exactly:
```
Production URL: https://life-dashboard-ri1t.vercel.app/api/auth/google/callback
Google Console: https://life-dashboard-ri1t.vercel.app/api/auth/google/callback
```

No trailing slash, must match exactly!

---

### Calendar Not Loading

**Symptoms:** "Failed to fetch calendar events"

**Debug steps:**
1. Check health endpoint - token status?
2. Check error_logs table
3. Check Google API quotas

**Solutions:**
- Reconnect Google Calendar
- Check Google Cloud Console API is enabled
- Check quota limits

---

### Environment Variable Not Working

**Symptoms:** Feature works locally, not in production

**Debug steps:**
1. Check Vercel environment variables are set
2. Check variable name (typos?)
3. Check environments (Production checked?)

**Solution:**
1. Verify variables in Vercel Dashboard
2. **Redeploy** after adding variables (important!)
3. Check with:
```javascript
// In API route
console.log(process.env.YOUR_VARIABLE)
```

---

## Best Practices

### Pre-Deployment Checklist

Before every deployment:

- [ ] Code tested locally
- [ ] Tests pass (if applicable)
- [ ] Health endpoint shows healthy
- [ ] No console errors
- [ ] Migration files ready (if needed)
- [ ] Environment variables documented
- [ ] Changelog updated

### During Deployment

- [ ] Monitor Vercel deployment status
- [ ] Check build logs for warnings
- [ ] Wait for "Ready" status

### Post-Deployment

- [ ] Visit production URL
- [ ] Run through test scenarios
- [ ] Check health endpoint
- [ ] Monitor error logs for 10 minutes
- [ ] Test critical user flows

### Deployment Timing

**Best times to deploy:**
- ✅ Monday-Thursday (easy to fix if issues)
- ✅ Morning/afternoon (team available)
- ✅ After testing

**Avoid:**
- ❌ Friday evening (weekend issues)
- ❌ Late night (no one to fix issues)
- ❌ Before vacation (can't monitor)

---

## Deployment Checklist by Phase

### Phase 1 Deployment ✅

- [x] Deploy code to Vercel
- [x] Add environment variables
- [x] Run database migrations
- [x] Update Google OAuth redirect URIs
- [x] Test production
- [x] Monitor health endpoint

### Phase 2 Deployment (Future)

- [ ] Deploy retry logic code
- [ ] No database changes needed
- [ ] Update health checks
- [ ] Test token refresh flow

### Phase 3 Deployment (Future)

- [ ] Deploy multi-calendar code
- [ ] Run new migrations (calendar_connections table)
- [ ] Add Outlook OAuth credentials
- [ ] Update health checks
- [ ] Test both calendars

### Phase 4 Deployment (Future)

- [ ] Deploy dashboard UI
- [ ] Add alerting service credentials
- [ ] Configure email/Slack webhooks
- [ ] Test monitoring

---

## Production URLs

**Current Production:**
```
App: https://life-dashboard-ri1t.vercel.app
Health: https://life-dashboard-ri1t.vercel.app/api/health
GitHub: https://github.com/mllivingston/life-dashboard
```

**Supabase:**
```
Dashboard: https://supabase.com/dashboard/project/uzygfzjkxffmcesliwsb
API: https://uzygfzjkxffmcesliwsb.supabase.co
```

**Vercel:**
```
Dashboard: https://vercel.com/mllivingstons-projects
```

---

## Support

**Vercel Issues:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

**Supabase Issues:**
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Support](https://supabase.com/support)

**Application Issues:**
- Check ARCHITECTURE.md
- Check DEVELOPMENT.md
- Check error_logs table
- Review health endpoint

---

_Last updated: October 29, 2025_  
_Version: 1.1.0_
