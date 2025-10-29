# Development Guide

This guide covers how to develop, test, and debug Life Dashboard.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Testing](#testing)
4. [Debugging](#debugging)
5. [Code Style](#code-style)
6. [Git Workflow](#git-workflow)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Google Cloud Console account (for Calendar API)
- Code editor (VS Code, Cursor, etc.)

### Initial Setup

1. **Clone the repository:**
```bash
git clone https://github.com/mllivingston/life-dashboard.git
cd life-dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: Logging
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_ENABLE_DB_LOGGING=true
```

4. **Set up database:**
```bash
# Run migrations in Supabase SQL Editor
# Execute files in order:
# 1. supabase-setup.sql
# 2. supabase-migrations/001_error_logs.sql
```

5. **Run development server:**
```bash
npm run dev
```

6. **Open browser:**
```
http://localhost:3000
```

---

## Development Workflow

### Daily Development Cycle

1. **Pull latest changes:**
```bash
git pull origin main
npm install  # In case dependencies changed
```

2. **Create feature branch:**
```bash
git checkout -b feature/your-feature-name
```

3. **Make changes:**
- Edit code
- Test locally
- Check for errors

4. **Commit changes:**
```bash
git add .
git commit -m "feat: description of changes"
```

5. **Push and deploy:**
```bash
git push origin feature/your-feature-name
# Vercel will auto-deploy preview
```

6. **Merge to main:**
```bash
git checkout main
git merge feature/your-feature-name
git push origin main
# Vercel will auto-deploy to production
```

### Task Sizing

Use this framework for estimating work:

| Size | Duration | Use For |
|------|----------|---------|
| 🟢 Small | < 10 min | Quick fixes, single file changes |
| 🟡 Medium | 10-45 min | Component updates, small features |
| 🟠 Large | 45-90 min | Full features, multiple files |
| 🔴 Extra Large | > 90 min | Major features, architecture changes |

### Before Starting Work

1. **Review documentation:**
   - Check ARCHITECTURE.md for system design
   - Check CHANGELOG.md for recent changes
   - Read relevant code comments

2. **Understand the task:**
   - What's the goal?
   - Which files will change?
   - Are there dependencies?
   - What's the test plan?

3. **Estimate time:**
   - Use sizing framework
   - Add 20% buffer for unknowns
   - Track actual time vs estimate

---

## Testing

### Manual Testing Checklist

Before committing code, test:

**✅ Core Functionality:**
- [ ] App loads without errors
- [ ] Can sign in/sign up
- [ ] Calendar loads events
- [ ] Can add/delete todos
- [ ] Can add/delete grocery items
- [ ] Sign out works

**✅ Error Handling:**
- [ ] Health endpoint shows status
- [ ] Error logs appear in Supabase
- [ ] Error boundaries catch errors
- [ ] Components fail independently

**✅ Responsive Design:**
- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1440px width)

**✅ Browser Testing:**
- [ ] Chrome (primary)
- [ ] Safari (MacOS users)
- [ ] Firefox (optional)

### Testing Health Check

```bash
# Test health endpoint
curl http://localhost:3000/api/health | jq

# Expected: status "healthy"
```

### Testing Logger

```javascript
// In browser console
import logger from '@/lib/logger'
logger.error('Test error', { test: true })

// Check Supabase error_logs table
```

### Testing Error Boundaries

1. **Add intentional error:**
```javascript
// In Calendar.js, top of component
if (true) throw new Error('TEST ERROR BOUNDARY')
```

2. **Refresh page**
3. **Expected:** Calendar shows error UI, todos/groceries still work
4. **Remove test code**

### Database Testing

```sql
-- Check error logs
SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 10;

-- Check error stats
SELECT * FROM get_error_stats('24 hours');

-- Check unresolved errors
SELECT * FROM recent_critical_errors;
```

---

## Debugging

### Debug Workflow

1. **Check browser console** - Look for JavaScript errors
2. **Check health endpoint** - Is a service down?
3. **Check error logs** - Recent errors in database?
4. **Check Supabase logs** - Database query issues?
5. **Check terminal** - Server-side errors?

### Common Debug Commands

```bash
# Check dev server logs
npm run dev

# Check environment variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debugging Tools

**Browser DevTools:**
- **Console:** JavaScript errors and logs
- **Network:** API call failures
- **Application:** Check cookies, local storage

**Health Endpoint:**
```
http://localhost:3000/api/health
```
- Shows which services are down
- Response time issues
- Token expiration status

**Supabase Dashboard:**
- **Table Editor:** View data directly
- **SQL Editor:** Run custom queries
- **Logs:** See real-time database queries
- **Auth:** Check user sessions

### Logger Debug Mode

```bash
# Enable debug logging
NEXT_PUBLIC_LOG_LEVEL=debug npm run dev
```

Then check console for detailed logs.

### Common Issues

#### Issue: "Failed to fetch calendar events"

**Symptoms:** Calendar shows error message

**Debug Steps:**
1. Check health endpoint - is token expired?
2. Check Supabase `google_tokens` table - does token exist?
3. Check browser console - what's the error?
4. Check error_logs table - full error details

**Solutions:**
- Delete token row, reconnect Google Calendar
- Check Google OAuth credentials in .env.local
- Verify redirect URI matches Google Cloud Console

#### Issue: "Logger not writing to database"

**Symptoms:** Errors in console but not in error_logs table

**Debug Steps:**
1. Check RLS policies on error_logs table
2. Check Supabase credentials in .env.local
3. Check browser console for Supabase errors
4. Try manual insert to test permissions

**Solutions:**
```sql
-- Test RLS policies
SELECT * FROM pg_policies WHERE tablename = 'error_logs';

-- Test manual insert
INSERT INTO error_logs (level, service, message)
VALUES ('info', 'test', 'Test message');
```

#### Issue: "Health endpoint returns 503"

**Symptoms:** /api/health shows system down

**Debug Steps:**
1. Check todos table exists
2. Check Supabase connection
3. Check .env.local has correct credentials

**Solutions:**
- Run database migrations
- Verify Supabase URL and anon key
- Check Supabase project status

---

## Code Style

### JavaScript Style

**Conventions:**
- Use `const` by default, `let` when reassigning
- Use arrow functions for callbacks
- Use async/await over promises
- Use template literals for strings
- Use destructuring when helpful

**Example:**
```javascript
// Good
const fetchEvents = async () => {
  const { data, error } = await supabase.from('todos').select('*')
  if (error) throw error
  return data
}

// Avoid
function fetchEvents() {
  return supabase.from('todos').select('*').then(function(result) {
    if (result.error) throw result.error
    return result.data
  })
}
```

### React Style

**Conventions:**
- Use functional components
- Use hooks (useState, useEffect)
- Keep components focused (single responsibility)
- Extract reusable logic into custom hooks
- Use error boundaries around components

**Example:**
```javascript
// Good
export default function TodoList({ userId }) {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchTodos()
  }, [userId])
  
  return <div>{/* component JSX */}</div>
}

// Avoid: Class components
class TodoList extends React.Component {
  // ...
}
```

### File Organization

```
project-root/
├── app/                    # Next.js app directory
│   ├── page.js            # Main dashboard
│   ├── login/
│   │   └── page.js        # Login page
│   └── api/               # API routes
│       ├── health/
│       ├── calendar/
│       └── auth/
├── components/            # React components
│   ├── Calendar.js
│   ├── TodoList.js
│   ├── GroceryList.js
│   └── ErrorBoundary.js
├── lib/                   # Utilities
│   ├── logger.js
│   └── supabase/
│       ├── client.js
│       └── server.js
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── CHANGELOG.md
└── supabase-migrations/   # Database migrations
    └── 001_error_logs.sql
```

### Naming Conventions

**Files:**
- Components: `PascalCase.js` (e.g., `Calendar.js`)
- Utilities: `camelCase.js` (e.g., `logger.js`)
- API routes: `route.js` (Next.js convention)
- SQL: `###_description.sql` (e.g., `001_error_logs.sql`)

**Variables:**
- Constants: `UPPER_SNAKE_CASE` (e.g., `LOG_LEVELS`)
- Functions: `camelCase` (e.g., `fetchCalendarEvents`)
- Components: `PascalCase` (e.g., `ErrorBoundary`)
- React hooks: `use` prefix (e.g., `useState`)

---

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>: <description>

[optional body]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add error logging database table"
git commit -m "fix: calendar not refreshing after reconnect"
git commit -m "docs: update architecture with Phase 1 changes"
git commit -m "refactor: extract logger into separate utility"
```

### Branch Strategy

**Main branch:** `main` (always production-ready)

**Feature branches:**
```bash
feature/error-handling
feature/multi-calendar
fix/calendar-refresh-bug
docs/architecture-update
```

**Branch lifecycle:**
1. Create from `main`
2. Make changes
3. Push to GitHub
4. Merge back to `main`
5. Delete branch

### Before Pushing

**Checklist:**
- [ ] Code tested locally
- [ ] No console errors
- [ ] Health endpoint shows healthy
- [ ] Commit message follows convention
- [ ] No sensitive data in code

---

## Common Tasks

### Add a New Component

1. **Create file:** `components/NewComponent.js`
2. **Write component:**
```javascript
'use client'
import { useState } from 'react'

export default function NewComponent() {
  return <div>New Component</div>
}
```
3. **Add to page:** Import and use in `app/page.js`
4. **Wrap in error boundary:** For resilience
5. **Test:** Verify it works

### Add a New API Route

1. **Create folder:** `app/api/new-endpoint/`
2. **Create file:** `app/api/new-endpoint/route.js`
3. **Write handler:**
```javascript
import { NextResponse } from 'next/server'

export async function GET(request) {
  return NextResponse.json({ message: 'Hello' })
}
```
4. **Test:** `curl http://localhost:3000/api/new-endpoint`

### Add a Database Table

1. **Create migration:** `supabase-migrations/00X_table_name.sql`
2. **Write SQL:**
```sql
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own data"
ON my_table FOR ALL
USING (auth.uid() = user_id);
```
3. **Run in Supabase SQL Editor**
4. **Test:** Query the table

### Update Documentation

1. **Architecture changes:** Update `docs/ARCHITECTURE.md`
2. **New features:** Add to `docs/CHANGELOG.md`
3. **Development process:** Update `docs/DEVELOPMENT.md`
4. **Deployment:** Update `docs/DEPLOYMENT.md`

---

## Troubleshooting

### Development Server Won't Start

**Error:** `Port 3000 already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found

**Error:** `Cannot find module '@/lib/logger'`

**Solution:**
```bash
# Check file exists
ls lib/logger.js

# Reinstall dependencies
npm install

# Check jsconfig.json has path aliases
```

### Database Connection Fails

**Error:** `Failed to connect to Supabase`

**Solution:**
1. Check `.env.local` has correct credentials
2. Verify Supabase project is active
3. Check internet connection
4. Test manually:
```javascript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
const { data, error } = await supabase.from('todos').select('count')
console.log(data, error)
```

### Google OAuth Not Working

**Error:** `redirect_uri_mismatch`

**Solution:**
1. Go to Google Cloud Console
2. Check OAuth 2.0 Client ID
3. Verify redirect URI exactly matches:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.vercel.app/api/auth/google/callback`
4. No trailing slash!

---

## Next Steps

After getting comfortable with development:

1. **Read ARCHITECTURE.md** - Understand system design
2. **Review CHANGELOG.md** - See what changed recently
3. **Check GitHub issues** - Find tasks to work on
4. **Start with small tasks** - Build confidence
5. **Ask questions** - When stuck, ask!

---

_Happy coding! 🚀_
