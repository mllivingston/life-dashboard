# Life Dashboard - Architecture

**Last Updated:** October 30, 2025  
**Current Version:** 1.1.0

This document describes the technical architecture and design decisions.

---

## System Overview

Life Dashboard is a personal productivity application integrating Google Calendar, todos, and grocery lists.

### Architecture Pattern

**Frontend:** Next.js 14 (React Server Components + Client Components)  
**Backend:** Next.js API Routes (serverless)  
**Database:** Supabase (PostgreSQL)  
**Authentication:** Supabase Auth  
**Deployment:** Vercel

### High-Level Diagram

```
┌─────────────────────────────────────┐
│         Browser (User)                  │
└────────────────┬─────────────────────┘
                 │
┌────────────────┴─────────────────────┐
│      Next.js (Vercel)                  │
│  ┌──────────────────────────────┐  │
│  │ Calendar | Todos | Grocery  │  │
│  └───────────┬─────────────────┘  │
│             │ API Routes           │
└─────────────┬─┴─────┬──────────────┘
             │       │
    ┌────────┴──┐    │
    │  Google     │    │
    │  Calendar   │    │
    └───────────┘    │
             ┌─────────┴────────┐
             │   Supabase          │
             │ (PostgreSQL + Auth)│
             └──────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14.2.3
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **State:** React Hooks

### Backend
- **Runtime:** Node.js (serverless)
- **Framework:** Next.js API Routes
- **Auth:** NextAuth.js + Supabase Auth
- **APIs:** Google Calendar API

### Database
- **Provider:** Supabase
- **Engine:** PostgreSQL 15
- **Client:** Supabase JavaScript Client
- **Security:** Row Level Security (RLS)

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase Cloud
- **SSL:** Automatic (Vercel)

---

## Database Schema

### Core Tables

**`todos`** - User to-do items
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`grocery_items`** - Shopping list
```sql
CREATE TABLE grocery_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  item TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`google_tokens`** - OAuth tokens
```sql
CREATE TABLE google_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`error_logs`** - Error tracking
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  level TEXT,
  service TEXT,
  message TEXT NOT NULL,
  stack_trace TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);
```

**Security:** All tables have RLS policies - users can only access their own data.

---

## Error Handling System

### Components

1. **Error Logs Database** (`error_logs` table)
   - Structured error storage
   - User context and stack traces
   - Resolution tracking

2. **Logger Utility** (`lib/logger.js`)
   - 4 log levels: error, warn, info, debug
   - Automatic context enrichment
   - Console + database output

3. **Error Boundaries** (`components/ErrorBoundary.js`)
   - Component-level isolation
   - Fallback UI with retry
   - Automatic error logging

4. **Health Check** (`app/api/health/route.js`)
   - Database connectivity
   - Auth service status
   - Token validity
   - System resources

### Error Flow

```
Error Occurs → Error Boundary Catches → Logger Records → Database Stores
     │                                                           │
     └──────── Fallback UI Shown ─────────────────────┘
```

---

## Authentication & Authorization

### Authentication
- **Method:** Email/password (Supabase Auth)
- **Sessions:** HTTP-only cookies
- **Google OAuth:** Separate flow for calendar access

### Authorization
- **Row Level Security (RLS)** on all user tables
- Database-level enforcement
- Automatic query filtering

**Example RLS Policy:**
```sql
CREATE POLICY "Users access own data"
ON todos FOR ALL
USING (auth.uid() = user_id);
```

---

## API Design

### Routes Structure

```
app/api/
├── auth/
│   └── google/
│       ├── route.js              # OAuth init
│       └── callback/route.js     # OAuth callback
├── calendar/route.js           # Fetch events
└── health/route.js             # System health
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
  "data": {},
  "meta": { "timestamp": "...", "version": "1.0.0" }
}
```

---

## Key Design Decisions

### Why Next.js?

**Pros:**
- Server-side rendering
- API routes (no separate backend)
- File-based routing
- Great DX
- Easy Vercel deployment

**Decision:** Rapid development, integrated frontend/backend

### Why Supabase?

**Pros:**
- PostgreSQL (mature, reliable)
- Built-in auth
- Row-level security
- Real-time subscriptions
- Generous free tier

**Decision:** Speed to market, built-in features

### Why Error Boundaries?

**Pros:**
- Component isolation
- Better UX (partial functionality)
- Specific error messages
- Easier debugging

**Decision:** Better UX, graceful degradation

### Why Database Logging?

**Phase 1 Decision:**
- No additional cost
- Full data control
- Easy SQL queries
- Simple setup

**Future:** May add external service (Sentry) for alerting

---

## Performance

### Current State
- **Database:** Indexed, scales to 10k+ users
- **API:** 1-3 calls per page load
- **Bundle:** ~200KB (acceptable)

### Known Bottlenecks
1. Google Calendar API (rate limited)
2. No caching
3. No pagination

### Future Optimizations
- Redis caching
- List pagination
- Service worker for offline

---

## Security

### Current Measures
- RLS policies (database-level)
- HTTPS enforced
- HTTP-only cookies
- Encrypted tokens (Supabase)
- Secrets in environment variables

### Known Gaps
- No rate limiting
- Manual token refresh (partially fixed)

### Security Roadmap
- Automatic token refresh ✅ (Phase 1)
- Rate limiting (Phase 2)
- 2FA support (future)

---

## What's Next?

**See [ROADMAP.md](./ROADMAP.md) for planned features and phases.**

---

_This architecture document is a living document. Update as system evolves._
