# Changelog

All notable changes to Life Dashboard.

Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [1.1.0] - 2025-10-30

### Added
- **Feature Branch Workflow** - Preview deployments for safe testing
- **ROADMAP.md** - Single source of truth for future work
- **Consolidated Documentation** - Streamlined and focused docs

### Changed
- **DEPLOYMENT.md** - Updated with preview deployment workflow
- **ARCHITECTURE.md** - Removed roadmap content (moved to ROADMAP.md)
- **DEVELOPMENT.md** - Removed duplicate workflow info

---

## [1.1.0] - 2025-10-29

### Phase 1: Error Handling & Observability Foundation

**Time:** 45 minutes  
**Status:** ✅ Complete

### Added

**Error Logging System:**
- `error_logs` table with comprehensive tracking
- Helper functions: `cleanup_old_error_logs`, `get_error_stats`
- View: `recent_critical_errors`

**Logger Utility** (`lib/logger.js`):
- 4 log levels: error, warn, info, debug
- Auto context enrichment
- Dual output: console + database
- Request tracing with unique IDs

**Error Boundaries** (`components/ErrorBoundary.js`):
- Component-level isolation
- Graceful fallback UI
- Error loop detection
- Auto-logging

**Health Check** (`app/api/health/route.js`):
- Monitors database, auth, Google Calendar, system
- HTML dashboard for browsers
- JSON API for monitoring tools
- Auto-refresh every 30 seconds

**Google Token Auto-Refresh** (`lib/google-token-refresh.js`):
- Automatic token refresh before expiry
- No more manual reconnects
- 5-minute buffer before expiration

### Changed

- **Calendar.js** - Added structured logging
- **page.js** - Wrapped components in ErrorBoundary
- **calendar/route.js** - Uses auto-refresh for tokens

### Technical

**Files Created:**
- `supabase-migrations/001_error_logs.sql`
- `lib/logger.js` (348 lines)
- `lib/google-token-refresh.js` (110 lines)
- `components/ErrorBoundary.js` (253 lines)
- `app/api/health/route.js` (424 lines)

**Database:**
- New table: `error_logs` (15 columns, 5 indexes, 3 RLS policies)

---

## [1.0.0] - 2025-10-28

### Initial Release

**Features:**
- User authentication (Supabase)
- Google Calendar integration
- Todo list management
- Grocery list management
- Responsive UI (Tailwind CSS)

**Stack:**
- Next.js 14.2.3
- Supabase (PostgreSQL + Auth)
- Google Calendar API
- Vercel deployment

---

## Versioning

**Major (X.0.0):** Breaking changes  
**Minor (1.X.0):** New features, phases  
**Patch (1.0.X):** Bug fixes  

**Current:** 1.1.0  
**Next:** See [ROADMAP.md](./ROADMAP.md)
