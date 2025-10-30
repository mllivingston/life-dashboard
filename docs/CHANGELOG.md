# Changelog

All notable changes to Life Dashboard.

Format based on [Keep a Changelog](https://keepachangelog.com/), versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2025-10-30

### Added - Workflow & Process

#### Development Workflow
- Feature branch workflow with preview deployments
- Pull request template for structured reviews
- Automated Vercel preview deployments
- Consolidated documentation (ROADMAP.md)

#### Documentation Improvements
- **WORKFLOW.md** - Git workflow and deployment process
- **ROADMAP.md** - Single source of truth for planned features
- Simplified all docs to remove duplication
- Cross-references between documents

---

## [1.1.0] - 2025-10-29

### Added - Phase 1: Error Handling & Observability

#### Error Logging System
- **Database Table:** `error_logs` with comprehensive tracking
  - Error level, service, type, message, stack trace
  - User context, session ID, browser info
  - Request context (URL, user agent, viewport)
  - Resolution tracking
  - Full-text search
- **Helper Functions:** `cleanup_old_error_logs()`, `get_error_stats()`
- **View:** `recent_critical_errors`

#### Logger Utility (`lib/logger.js`)
- Structured logging (error, warn, info, debug)
- Automatic context enrichment
- Dual output: console + database
- Request tracing with unique IDs
- Service-specific child loggers
- Configuration via environment variables

#### Error Boundaries (`components/ErrorBoundary.js`)
- Component-level error isolation
- Graceful fallback UI with retry
- Automatic error logging
- Error loop detection
- Specialized fallbacks

#### Health Check Endpoint (`app/api/health/route.js`)
- Database connectivity monitoring
- Auth service status
- Google Calendar token validation
- System resources (memory, uptime)
- Smart content negotiation (HTML dashboard for browsers, JSON for APIs)
- Auto-refresh dashboard

#### Automatic Token Refresh (`lib/google-token-refresh.js`)
- Checks expiry 5 minutes before expiration
- Automatically refreshes Google Calendar tokens
- No more manual reconnects
- Updates database with new token

### Changed

- **Calendar Component** - Added structured logging
- **Main Dashboard** - Wrapped components in ErrorBoundary
- **Calendar API** - Integrated automatic token refresh

### Technical

**Files Created:**
- `supabase-migrations/001_error_logs.sql` (246 lines)
- `lib/logger.js` (348 lines)
- `lib/google-token-refresh.js` (110 lines)
- `components/ErrorBoundary.js` (253 lines)
- `app/api/health/route.js` (424 lines)

**Database Changes:**
- New table: `error_logs` (15 columns)
- 5 indexes for performance
- 3 RLS policies
- 2 helper functions
- 1 view

**Bundle Impact:** +15KB (logger + error boundary)

### Security

- RLS policies on error_logs
- No sensitive data logged
- Error resolution tracking

---

## [1.0.0] - 2025-10-28

### Initial Release

**Features:**
- User authentication (Supabase Auth)
- Google Calendar integration
- Todo list management
- Grocery list management
- Responsive UI with Tailwind CSS

**Tech Stack:**
- Next.js 14.2.3
- Supabase (PostgreSQL + Auth)
- Google Calendar API
- Vercel deployment

---

## Versioning Strategy

**Major (X.0.0):** Breaking changes, major rewrites  
**Minor (1.X.0):** New features, phase completions  
**Patch (1.0.X):** Bug fixes, minor improvements

**Current:** 1.1.0  
**Next:** See [ROADMAP.md](./ROADMAP.md)

---

_For planned features and upcoming releases, see [ROADMAP.md](./ROADMAP.md)_
