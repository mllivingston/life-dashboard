# Life Dashboard - Architecture

**Last Updated:** October 29, 2025  
**Current Version:** 1.1.0

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Error Handling System](#error-handling-system)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Design](#api-design)
7. [Design Decisions](#design-decisions)

---

## System Overview

Life Dashboard is a personal productivity application that integrates:
- **Google Calendar** - View and manage calendar events
- **Todo Lists** - Track tasks and to-dos
- **Grocery Lists** - Manage shopping items

### Architecture Pattern
- **Frontend:** Next.js 14 (React Server Components + Client Components)
- **Backend:** Next.js API Routes (serverless functions)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Browser                      │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│              Next.js Frontend (Vercel)              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Calendar   │  │   TodoList   │  │  Grocery  │ │
│  │  Component   │  │  Component   │  │Component  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│           Next.js API Routes (Vercel)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │/api/     │  │/api/     │  │/api/auth/google/ │  │
│  │calendar  │  │health    │  │                  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└────────┬────────────────────┬────────────────────────┘
         │                    │
         ▼                    ▼
┌────────────────┐   ┌─────────────────────┐
│ Google Calendar│   │   Supabase          │
│      API       │   │  (PostgreSQL + Auth)│
└────────────────┘   └─────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14.2.3
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect)
- **HTTP Client:** Native fetch API

### Backend
- **Runtime:** Node.js (serverless functions)
- **Framework:** Next.js API Routes
- **Authentication:** NextAuth.js + Supabase Auth
- **External APIs:** Google Calendar API

### Database
- **Provider:** Supabase
- **Database:** PostgreSQL 15
- **ORM:** Supabase JavaScript Client
- **Row Level Security:** Enabled on all tables

### Infrastructure
- **Hosting:** Vercel (frontend + API routes)
- **Database Hosting:** Supabase Cloud
- **Domain:** Vercel auto-generated (or custom domain)
- **SSL:** Automatic via Vercel

---

## Database Schema

### Core Tables

#### `todos`
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

**Purpose:** Store user to-do list items  
**RLS:** Users can only access their own todos

#### `grocery_items`
```sql
CREATE TABLE grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  item TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store grocery shopping list items  
**RLS:** Users can only access their own items

#### `google_tokens`
```sql
CREATE TABLE google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Store Google OAuth tokens for calendar access  
**RLS:** Users can only access their own tokens  
**Security:** Tokens are encrypted at rest by Supabase

---

## Error Handling System

*Added: Phase 1 - October 29, 2025*

### Overview

The error handling system provides comprehensive error tracking, graceful degradation, and real-time monitoring. It consists of four main components working together to ensure the application remains resilient and observable.

### Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Application Layer                    │
│                                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │ Calendar   │  │  TodoList  │  │  Grocery   │     │
│  │ Component  │  │ Component  │  │ Component  │     │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘     │
│        │                │                │            │
│        ▼                ▼                ▼            │
│  ┌────────────────────────────────────────────┐     │
│  │       Error Boundary (Component-Level)     │     │
│  │  - Catches React errors                    │     │
│  │  - Shows fallback UI                       │     │
│  │  - Logs to logger                          │     │
│  └─────────────────┬──────────────────────────┘     │
│                    │                                  │
└────────────────────┼──────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│                  Logger Utility                       │
│  - Structured logging (error, warn, info, debug)    │
│  - Automatic context enrichment                      │
│  - Writes to console (dev) & database (prod)        │
│  - Request tracing with unique IDs                   │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│              Error Logs Database                      │
│  Table: error_logs                                    │
│  - Full error context                                 │
│  - User information                                   │
│  - Browser context                                    │
│  - Request metadata                                   │
└──────────────────────────────────────────────────────┘
```

### Components

#### 1. Error Logs Database (`error_logs` table)

**Location:** `supabase-migrations/001_error_logs.sql`

**Schema:**
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users,
  session_id TEXT,
  level TEXT, -- 'error', 'warn', 'info', 'debug'
  service TEXT, -- 'google-calendar', 'todos', etc.
  error_type TEXT, -- 'API_ERROR', 'TOKEN_REFRESH_FAILED', etc.
  message TEXT NOT NULL,
  stack_trace TEXT,
  error_code TEXT,
  request_context JSONB, -- Browser info, URL, etc.
  metadata JSONB, -- Additional context
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT
);
```

**Indexes:**
- `idx_error_logs_user_created` - Fast user-specific queries
- `idx_error_logs_service_level` - Service health queries
- `idx_error_logs_unresolved` - Find unresolved errors
- `idx_error_logs_type` - Query by error type
- `idx_error_logs_message_search` - Full-text search

**Helper Functions:**
- `cleanup_old_error_logs(days)` - Remove old resolved errors
- `get_error_stats(interval)` - Get error statistics

**RLS Policies:**
- Users can view their own errors
- Service role can insert errors
- Users can mark their errors as resolved

#### 2. Logger Utility (`lib/logger.js`)

**Purpose:** Centralized logging with automatic context enrichment

**Features:**
- **Log Levels:** error, warn, info, debug
- **Context Enrichment:** Automatically adds user ID, session ID, browser info
- **Dual Output:** Console (always) + Database (errors & warnings)
- **Request Tracing:** Unique request IDs for end-to-end tracing
- **Service-Specific Loggers:** Create child loggers per service

**API:**
```javascript
import logger from '@/lib/logger'

// Basic logging
logger.error('Failed to fetch calendar', { service: 'calendar' })
logger.warn('Rate limit approaching', { remaining: 10 })
logger.info('User logged in', { userId: '123' })
logger.debug('Request details', { headers: {...} })

// Service-specific logger
const calendarLogger = logger.child('google-calendar')
calendarLogger.error('Token expired')

// Error logging helper
import { logError } from '@/lib/logger'
try {
  await fetchData()
} catch (error) {
  logError(error, { service: 'calendar', context: 'fetchEvents' })
}
```

**Configuration:**
- `NEXT_PUBLIC_LOG_LEVEL` - Set minimum log level (default: 'info')
- `NEXT_PUBLIC_ENABLE_DB_LOGGING` - Enable/disable database logging (default: true)

#### 3. Error Boundaries (`components/ErrorBoundary.js`)

**Purpose:** Catch React errors and prevent full app crashes

**Features:**
- **Component Isolation:** One component fails, others keep working
- **Fallback UI:** Show error message instead of white screen
- **Error Loop Detection:** Detect and handle repeated crashes
- **Automatic Logging:** Logs all caught errors to logger utility
- **Reset Capability:** Allow users to retry after error

**Usage:**
```javascript
import ErrorBoundary from '@/components/ErrorBoundary'

<ErrorBoundary serviceName="Calendar">
  <Calendar />
</ErrorBoundary>
```

**Specialized Fallbacks:**
- `CalendarErrorFallback` - Calendar-specific error UI
- `ListErrorFallback` - Generic list error UI

**Error States:**
- **Normal Error:** Show fallback with retry button
- **Error Loop (3+ crashes):** Show critical error, suggest refresh

#### 4. Health Check Endpoint (`app/api/health/route.js`)

**Purpose:** Monitor system health in real-time

**Endpoint:** `GET /api/health`

**Checks:**
- Database connectivity (query latency)
- Authentication service status
- Google Calendar token validity
- System resources (memory, uptime)

**Response Format:**
```json
{
  "status": "healthy" | "degraded" | "down",
  "timestamp": "2025-10-29T...",
  "responseTime": 123,
  "services": {
    "database": { "status": "up", "latency": 15 },
    "authentication": { "status": "up" },
    "googleCalendar": { "status": "up", "expiresInMinutes": 45 },
    "system": { "status": "up", "uptime": 3600 }
  }
}
```

**Content Negotiation:**
- **Browser:** Returns beautiful HTML dashboard with auto-refresh
- **API Client:** Returns JSON for monitoring tools

**HTTP Status Codes:**
- `200` - Healthy or degraded
- `503` - System down

---

## Authentication & Authorization

### Authentication Flow

1. **User Registration/Login:**
   - Handled by Supabase Auth
   - Email/password authentication
   - Session stored in HTTP-only cookies

2. **Google Calendar OAuth:**
   - Separate OAuth flow for calendar access
   - Tokens stored in `google_tokens` table
   - Automatic token refresh (to be implemented in Phase 2)

### Authorization

**Row Level Security (RLS):**
All user data tables use RLS policies:
```sql
-- Example: todos table
CREATE POLICY "Users can only access their own todos"
ON todos
FOR ALL
USING (auth.uid() = user_id);
```

**Benefits:**
- Database-level security (can't bypass in code)
- Automatic filtering of queries
- Protection against SQL injection

---

## API Design

### API Routes Structure

```
app/api/
├── auth/
│   └── google/
│       ├── route.js              # Initiate OAuth
│       └── callback/
│           └── route.js          # OAuth callback
├── calendar/
│   └── route.js                  # Fetch calendar events
└── health/
    └── route.js                  # System health check
```

### API Conventions

**Error Responses:**
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { "additionalContext": "..." }
}
```

**Success Responses:**
```json
{
  "data": { "result": "..." },
  "meta": { "timestamp": "...", "version": "1.0.0" }
}
```

### Authentication

**Client-Side:**
```javascript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Server-Side:**
```javascript
import { createServerSupabaseClient } from '@/lib/supabase/server'
const supabase = await createServerSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()
```

---

## Design Decisions

### Why Next.js?

**Pros:**
- Server-side rendering for better performance
- API routes eliminate need for separate backend
- File-based routing (simple to understand)
- Great developer experience
- Easy Vercel deployment

**Cons:**
- Learning curve for SSR/RSC concepts
- Less flexibility than separate backend

**Decision:** Chose Next.js for rapid development and integrated frontend/backend.

### Why Supabase?

**Pros:**
- PostgreSQL (mature, reliable)
- Built-in authentication
- Row-level security (database-level auth)
- Real-time subscriptions (future use)
- Free tier generous for MVP

**Cons:**
- Vendor lock-in
- Less control than self-hosted

**Decision:** Chose Supabase for speed to market and built-in features.

### Why Error Boundaries Over Global Error Handler?

**Reasoning:**
- **Isolation:** One component fails, others keep working
- **Better UX:** Show specific error messages per component
- **Easier Debugging:** Know exactly which component failed
- **Graceful Degradation:** App remains partially functional

**Tradeoff:** More code (wrap each component) vs. better UX

**Decision:** Use error boundaries for better user experience and resilience.

### Why Database Logging Over External Service (Sentry)?

**Phase 1 Decision:**
- **No additional cost:** Use existing database
- **Full control:** Own all error data
- **Easy queries:** SQL for analysis
- **Simple setup:** No new accounts/APIs

**Future Consideration (Phase 4):**
- May add Sentry for better alerting and dashboards
- Can run both (database + Sentry) in parallel
- Database logs remain as source of truth

---

## Future Architecture Changes

### Phase 2: Resilience (Planned)

**Additions:**
- Token refresh mechanism
- Retry logic with exponential backoff
- Timeout handling
- Circuit breaker for APIs

**Impact:** Minimal - adds middleware layer, no schema changes

### Phase 3: Multi-Calendar (Planned)

**Additions:**
- Calendar service abstraction interface
- Support for Outlook Calendar
- Unified calendar view

**Impact:** Moderate - new tables for additional calendars, refactor existing calendar code

### Phase 4: Observability (Planned)

**Additions:**
- Error dashboard UI
- Alerting system
- Request tracing
- Performance monitoring

**Impact:** Moderate - new UI components, possibly external service integration

---

## Performance Considerations

### Current State
- **Database queries:** Indexed, should scale to 10k+ users
- **API calls:** Each page load makes 1-3 API calls
- **Bundle size:** ~200KB (acceptable for SPA)

### Known Bottlenecks
1. **Google Calendar API:** Rate limited (10,000 requests/day)
2. **No caching:** Every page load fetches fresh data
3. **No pagination:** Loads all todos/groceries at once

### Future Optimizations (If Needed)
- Add Redis caching layer
- Implement pagination for lists
- Add service worker for offline support

---

## Security Considerations

### Current Security Measures
1. **RLS policies:** All user data protected at database level
2. **HTTPS:** Enforced by Vercel
3. **HTTP-only cookies:** Session tokens not accessible to JS
4. **OAuth tokens:** Encrypted at rest by Supabase
5. **Environment variables:** Secrets not in code

### Known Security Gaps (To Address)
1. **No rate limiting:** Could be abused
2. **No CSRF protection:** Using API routes (less concern)
3. **Google token refresh:** Manual (user must reconnect)

### Security Roadmap
- **Phase 2:** Automatic token refresh
- **Phase 4:** Add rate limiting middleware
- **Future:** Add 2FA support

---

_This architecture document is a living document. Update as system evolves._
