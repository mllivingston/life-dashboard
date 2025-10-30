# Architecture

**Last Updated:** October 30, 2025  
**Version:** 1.1.0

---

## System Overview

Life Dashboard is a personal productivity app that integrates:
- **Google Calendar** - View and manage events
- **Todo Lists** - Track tasks
- **Grocery Lists** - Manage shopping

**Stack:** Next.js 14 + Supabase (PostgreSQL + Auth) + Vercel

### High-Level Architecture

```
User Browser
     ↓
Next.js Frontend (Vercel)
     ↓
Next.js API Routes
     ↓
  ┌─────────────┐
  │ Google      │  Supabase
  │ Calendar API│  (PostgreSQL + Auth)
  └─────────────┘
```

---

## Technology Stack

**Frontend:** Next.js 14.2.3, React, Tailwind CSS  
**Backend:** Next.js API Routes (serverless)  
**Database:** Supabase (PostgreSQL 15)  
**Authentication:** Supabase Auth + Google OAuth  
**Deployment:** Vercel  

---

## Database Schema

### Core Tables

**`todos`** - User to-do items
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`grocery_items`** - Grocery shopping list
```sql
CREATE TABLE grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  item TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`google_tokens`** - Google OAuth tokens
```sql
CREATE TABLE google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL, -- Unix timestamp in ms
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`error_logs`** - Application error tracking (Phase 1)
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users,
  session_id TEXT,
  level TEXT, -- 'error', 'warn', 'info', 'debug'
  service TEXT, -- 'google-calendar', 'todos', etc.
  error_type TEXT,
  message TEXT NOT NULL,
  stack_trace TEXT,
  request_context JSONB,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE
);
```

**Row Level Security (RLS):** Enabled on all tables. Users can only access their own data.

---

## Error Handling System (Phase 1)

### Components

**1. Error Logs Database** (`error_logs` table)
- Comprehensive error tracking with context
- Indexed for fast queries
- RLS policies for security

**2. Logger Utility** (`lib/logger.js`)
- 4 log levels: error, warn, info, debug
- Auto-enrichment (user, session, browser)
- Dual output: console + database
- Service-specific loggers

**3. Error Boundaries** (`components/ErrorBoundary.js`)
- Component-level isolation
- Graceful fallback UI
- Auto-logging to logger
- Error loop detection

**4. Health Check** (`app/api/health/route.js`)
- Monitors: database, auth, Google Calendar, system
- Returns HTML (browsers) or JSON (API clients)
- Auto-refresh every 30 seconds

### Architecture Flow

```
Component Error
     ↓
Error Boundary Catches
     ↓
Logger Logs (with context)
     ↓
Error Logs Database
     ↓
Health Endpoint Reports
```

---

## Authentication & Authorization

### Authentication Flow

1. **Supabase Auth** - Email/password, session cookies
2. **Google OAuth** - Separate flow for Calendar API access
3. **Token Management** - Automatic refresh (Phase 1)

### Authorization

All user tables use Row Level Security (RLS):
```sql
CREATE POLICY "Users access own data"
ON table_name FOR ALL
USING (auth.uid() = user_id);
```

Database enforces security - can't bypass in code.

---

## API Design

### API Routes

```
app/api/
├── auth/google/
│   ├── route.js          # OAuth initiation
│   └── callback/route.js # OAuth callback
├── calendar/route.js     # Fetch calendar events
└── health/route.js       # System health
```

### Error Responses

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Success Responses

```json
{
  "data": { "result": "..." },
  "meta": { "timestamp": "...", "version": "1.0.0" }
}
```

---

## Design Decisions

### Why Next.js?
- **Pros:** SSR, API routes, file-based routing, easy Vercel deployment
- **Cons:** Learning curve for SSR/RSC
- **Decision:** Chose for rapid development

### Why Supabase?
- **Pros:** PostgreSQL, built-in auth, RLS, real-time, generous free tier
- **Cons:** Vendor lock-in
- **Decision:** Chose for speed to market

### Why Error Boundaries?
- **Pros:** Component isolation, better UX, easier debugging
- **Cons:** More code
- **Decision:** Better UX worth the tradeoff

### Why Database Logging?
- **Pros:** No additional cost, full control, easy SQL queries
- **Cons:** Less features than Sentry
- **Decision:** Start simple, can add external service later

---

## Performance

**Current:**
- Database queries indexed
- ~200KB bundle size
- 1-3 API calls per page load

**Known Bottlenecks:**
- Google Calendar API rate limited (10K requests/day)
- No caching (every load fetches fresh data)
- No pagination (loads all items)

**Future Optimizations:** Redis caching, pagination, service worker

---

## Security

**Current Measures:**
- RLS on all tables
- HTTPS enforced
- HTTP-only cookies
- OAuth tokens encrypted at rest
- Environment variables not in code

**Known Gaps:**
- No rate limiting
- No CSRF protection (less concern with API routes)

**Roadmap:** See [ROADMAP.md](./ROADMAP.md) for security improvements

---

## File Structure

```
life-dashboard/
├── app/                  # Next.js app directory
│   ├── page.js          # Dashboard
│   ├── login/page.js    # Login
│   └── api/             # API routes
├── components/          # React components
│   ├── Calendar.js
│   ├── TodoList.js
│   ├── GroceryList.js
│   └── ErrorBoundary.js
├── lib/                 # Utilities
│   ├── logger.js        # Error logging
│   ├── google-token-refresh.js
│   └── supabase/        # DB clients
├── docs/                # Documentation
└── supabase-migrations/ # Database migrations
```

---

## Next Steps

For planned features and improvements, see [ROADMAP.md](./ROADMAP.md).

---

_This is a living document. Update as system evolves._
