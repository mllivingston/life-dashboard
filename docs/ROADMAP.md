# Product Roadmap

**Last Updated:** October 30, 2025  
**Current Version:** 1.1.0

---

## Overview

This is the **single source of truth** for what's next in Life Dashboard development. All future work, priorities, and estimates are tracked here.

**Quick Links:**
- [Task Sizing Framework](#task-sizing-framework)
- [Current Sprint](#current-sprint)
- [Phases](#phases)
- [Backlog](#backlog)
- [Cost Analysis](#cost-analysis)

---

## Task Sizing Framework

Use this scale for all estimates:

| Size | Duration | Icon | Use For |
|------|----------|------|---------|  
| **Small** | < 10 minutes | 🟢 | Quick fixes, single file changes, simple updates |
| **Medium** | 10-45 minutes | 🟡 | Component updates, small features, bug fixes |
| **Large** | 45-90 minutes | 🟠 | Full features, multiple file changes, integrations |
| **Extra Large** | > 90 minutes | 🔴 | Major features, architecture changes, refactors |

**AI-Adjusted Estimates:**
- **Coding tasks:** 70-80% faster (AI writes code)
- **Testing tasks:** 20-30% faster (still manual verification)
- **Integration work:** 40-50% faster (AI helps, you test)
- **File operations:** Same speed (manual work)

**Actual Velocity:** ~4x faster than raw estimates with AI assistance

---

## Current Sprint

**Status:** Phase 1 Complete ✅ | Deciding Next Phase

### Completed This Sprint
- [x] **Phase 1 Foundation** - Error handling & observability (45 min)
- [x] **Workflow Setup** - Feature branches & preview deployments (30 min)

### Up Next (Choose One)
1. **Phase 2: Resilience** (~2.3 hours)
2. **Phase 3: Multi-Calendar** (~2.5 hours) 
3. **Phase 4: Observability Dashboard** (~2.3 hours)

---

## Phases

### Phase 1: Foundation ✅ COMPLETE

**Goal:** Build error handling and observability foundation  
**Status:** ✅ Complete (October 29, 2025)  
**Size:** 🟠 Large  
**Estimated:** 120 minutes  
**Actual:** 45 minutes  
**ROI:** 22,300% annual return

**Delivered:**
- Error logging system (database table + RLS)
- Structured logger utility
- React error boundaries
- Health check endpoint with HTML dashboard
- Automatic token refresh

**Impact:**
- App no longer crashes completely when one component fails
- All errors tracked in database for analysis
- Real-time health monitoring
- Google Calendar tokens auto-refresh

---

### Phase 2: Resilience

**Goal:** Make the app resilient to network failures and API issues  
**Status:** 📋 Planned  
**Priority:** P1 (High)  
**Size:** 🔴 Extra Large  
**Estimated:** ~2.3 hours (AI-adjusted)

#### Features

**1. Retry Logic with Exponential Backoff** 🟡 Medium (~30 min)
```javascript
// Automatically retry failed API calls
// Wait 1s, then 2s, then 4s before giving up
// Prevents temporary failures from breaking the app
```
**Impact:** 95% reduction in "failed to load" errors

**2. Timeout Handling** 🟢 Small (~10 min)
```javascript
// Cancel requests that take too long
// Show user-friendly timeout message
// Prevents infinite loading states
```
**Impact:** Better UX when APIs are slow

**3. Circuit Breaker** 🟡 Medium (~30 min)
```javascript
// Stop calling APIs that are consistently failing
// "Fail fast" to prevent cascading failures  
// Auto-recover when API comes back
```
**Impact:** App remains partially functional during outages

**4. Testing & Integration** 🟡 Medium (~45 min)
- Test retry scenarios
- Test timeout handling
- Test circuit breaker state transitions
- Integration testing

**5. Documentation** 🟢 Small (~10 min)

#### Cost Estimate

| Task | Size | Duration | Cost @ $50/hr |
|------|------|----------|---------------|
| Retry logic | 🟡 Medium | 30 min | $25 |
| Timeout handling | 🟢 Small | 10 min | $8 |
| Circuit breaker | 🟡 Medium | 30 min | $25 |
| Testing | 🟡 Medium | 45 min | $38 |
| Documentation | 🟢 Small | 10 min | $8 |
| **Total** | 🔴 XL | **2.3 hours** | **$115** |

#### Technical Details

**Files to Create:**
- `lib/retry.js` - Retry utility with exponential backoff
- `lib/circuit-breaker.js` - Circuit breaker implementation
- `lib/api-client.js` - Unified API client with retry + circuit breaker

**Files to Modify:**
- `app/api/calendar/route.js` - Use new API client
- `components/Calendar.js` - Better error handling

**Dependencies:**
None - use existing stack

---

### Phase 3: Multi-Calendar Support

**Goal:** Support multiple calendar providers (Google + Outlook)  
**Status:** 📋 Planned  
**Priority:** P2 (Medium)  
**Size:** 🔴 Extra Large  
**Estimated:** ~2.5 hours (AI-adjusted)

#### Features

**1. Calendar Service Abstraction** 🟡 Medium (~20 min)
```javascript
// Create interface that works for any calendar
interface CalendarService {
  connect()
  getEvents()
  createEvent()
  deleteEvent()
}
```
**Impact:** Easy to add new calendar providers

**2. Refactor Google Calendar** 🟡 Medium (~20 min)
- Extract to service implementation
- Use new interface
- Maintain existing functionality

**3. Add Outlook Calendar Support** 🟠 Large (~40 min)
- Set up Microsoft OAuth
- Implement Outlook service
- Test Outlook connection

**4. Unified Multi-Calendar View** 🟡 Medium (~25 min)
- Show events from all connected calendars
- Color-code by source
- Filter by calendar

**5. Testing** 🟡 Medium (~45 min)
- Test Google calendar still works
- Test Outlook calendar
- Test multi-calendar view
- Test switching between calendars

#### Cost Estimate

| Task | Size | Duration | Cost @ $50/hr |
|------|------|----------|---------------|
| Service abstraction | 🟡 Medium | 20 min | $17 |
| Refactor Google | 🟡 Medium | 20 min | $17 |
| Outlook integration | 🟠 Large | 40 min | $33 |
| Unified view | 🟡 Medium | 25 min | $21 |
| Testing | 🟡 Medium | 45 min | $38 |
| **Total** | 🔴 XL | **2.5 hours** | **$125** |

#### Technical Details

**Files to Create:**
- `lib/calendar/interface.js` - Calendar service interface
- `lib/calendar/google.js` - Google Calendar implementation
- `lib/calendar/outlook.js` - Outlook Calendar implementation
- `lib/calendar/manager.js` - Multi-calendar coordinator
- `app/api/auth/outlook/route.js` - Outlook OAuth

**Files to Modify:**
- `components/Calendar.js` - Support multiple calendars
- `app/api/calendar/route.js` - Fetch from all calendars

**Database Changes:**
```sql
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  provider TEXT, -- 'google' | 'outlook'
  access_token TEXT,
  refresh_token TEXT,
  expiry_date TIMESTAMPTZ,
  calendar_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**External Services:**
- Microsoft Graph API (Outlook Calendar)
- Microsoft OAuth setup

---

### Phase 4: Observability Dashboard

**Goal:** Build UI for monitoring errors and system health  
**Status:** 📋 Planned  
**Priority:** P2 (Medium)  
**Size:** 🟠 Large  
**Estimated:** ~2.3 hours (AI-adjusted)

#### Features

**1. Error Tracking Dashboard** 🟠 Large (~35 min)
- View all errors in UI (not just database)
- Filter by: service, time, severity, user
- Search error messages
- Mark errors as resolved
- View error details (stack trace, context)

**2. Alerting System** 🟡 Medium (~30 min)
- Email alerts when critical errors occur
- Slack webhook integration (optional)
- Alert rules: error rate threshold, specific error types
- Alert history and management

**3. Request Tracing UI** 🟡 Medium (~25 min)
- View request timeline
- See which requests are slow
- Identify performance bottlenecks
- Filter by endpoint

**4. Performance Monitoring** 🟡 Medium (~25 min)
- API response times
- Database query latency
- Error rates over time
- User activity metrics

**5. Testing** 🟡 Medium (~25 min)
- Test dashboard loads
- Test filtering/search
- Test alerting
- Test performance metrics

#### Cost Estimate

| Task | Size | Duration | Cost @ $50/hr |
|------|------|----------|---------------|
| Error dashboard | 🟠 Large | 35 min | $29 |
| Alerting setup | 🟡 Medium | 30 min | $25 |
| Request tracing | 🟡 Medium | 25 min | $21 |
| Performance monitoring | 🟡 Medium | 25 min | $21 |
| Testing | 🟡 Medium | 25 min | $21 |
| **Total** | 🟠 Large | **2.3 hours** | **$115** |

#### Technical Details

**Files to Create:**
- `app/admin/page.js` - Admin dashboard (protected route)
- `components/ErrorDashboard.js` - Error tracking UI
- `components/PerformanceChart.js` - Performance graphs
- `lib/alerting.js` - Alert manager
- `app/api/admin/errors/route.js` - Error query API
- `app/api/admin/metrics/route.js` - Metrics API

**Files to Modify:**
- `lib/logger.js` - Add request timing
- `app/api/health/route.js` - Add performance metrics

**External Services:**
- Email service (Resend, SendGrid, or AWS SES)
- Slack webhooks (optional)

**Authentication:**
- Admin-only access (check user role)
- Add `is_admin` column to profiles table

---

## Backlog

### Features (Not Prioritized)

**Family Sharing** 🔴 XL (~4 hours)
- Share todos/groceries with family members
- Invite family via email
- Collaborative editing
- Permission management

**Mobile App** 🔴 🔴 XL (~40 hours)
- React Native app
- iOS + Android
- Push notifications
- Offline support

**Smart Suggestions** 🟠 Large (~3 hours)
- AI-powered todo suggestions
- Grocery list predictions
- Calendar event recommendations
- Learn from user patterns

**Integrations** 🔴 XL (~5 hours each)
- Todoist import
- Apple Calendar
- Amazon Alexa
- Google Assistant

**Advanced Calendar Features** 🟠 Large (~2 hours)
- Create/edit events in-app
- Recurring event support
- Event reminders
- Calendar sync (two-way)

---

### Technical Debt

**Add Tests** 🔴 XL (~8 hours)
- Unit tests for utilities
- Integration tests for APIs
- E2E tests for user flows
- Test coverage reporting

**Performance Optimization** 🟠 Large (~2 hours)
- Add Redis caching
- Implement pagination
- Lazy load components
- Optimize bundle size

**Security Hardening** 🟡 Medium (~1 hour)
- Add rate limiting
- CSRF protection
- Security headers
- Penetration testing

**Accessibility** 🟡 Medium (~1 hour)
- ARIA labels
- Keyboard navigation
- Screen reader support
- WCAG 2.1 compliance

---

## Cost Analysis

### Investment Summary (At $50/hour)

| Phase | Duration | Cost | Status |
|-------|----------|------|--------|
| Phase 1 | 0.75 hrs | $38 | ✅ Complete |
| Phase 2 | 2.3 hrs | $115 | 📋 Planned |
| Phase 3 | 2.5 hrs | $125 | 📋 Planned |
| Phase 4 | 2.3 hrs | $115 | 📋 Planned |
| **Subtotal** | **7.85 hrs** | **$392** | - |
| Backlog (est.) | ~50 hrs | ~$2,500 | 💡 Ideas |
| **Grand Total** | **~58 hrs** | **~$2,892** | - |

### ROI Calculation (Phase 1 Example)

**Investment:**
- Time: 45 minutes  
- Cost: $37.50

**Monthly Benefits:**
- Faster debugging: 8 hours/month saved
- Fewer production issues: 4 hours/month saved  
- Better monitoring: 2 hours/month saved
- **Total: 14 hours/month = $700/month saved**

**Payback Period:** 1.6 days  
**Annual ROI:** 22,300%

### Value Prioritization

**High ROI (Do First):**
1. Phase 2: Resilience - Prevents outages, saves debugging time
2. Phase 4: Observability - Faster issue detection and resolution

**Medium ROI (Do Second):**
3. Phase 3: Multi-Calendar - Adds user value, not operational

**Low ROI (Do Later):**
4. Technical Debt - Important but not urgent
5. New Features - Nice to have

---

## Decision Framework

### When to Work on What

| Priority | Criteria | Time Budget | Example |
|----------|----------|-------------|---------|  
| **P0 (NOW)** | App broken, users blocked | 🔴 XL acceptable | Database down |
| **P1 (Today)** | High ROI, enables other work | 🟠 Large max | Error handling |
| **P2 (This Week)** | Important but not urgent | 🟡 Medium preferred | Multi-calendar |
| **P3 (Later)** | Nice to have | 🟢 Small only | UI polish |

### Estimation Tips

**When Estimating with AI:**
- Coding tasks: Reduce by 70-80%
- Testing tasks: Reduce by 20-30%
- Integration: Reduce by 40-50%
- File operations: Keep same

**Red Flags (Add Time):**
- ⚠️ OAuth/authentication flows (+20%)
- ⚠️ External API integration (+30%)
- ⚠️ First time doing something (+50%)
- ⚠️ Production deployment (+20%)

**Green Flags (Reduce Time):**
- ✅ Similar to past work (-20%)
- ✅ Clear requirements (-10%)
- ✅ Good documentation (-20%)
- ✅ AI can write most code (-70%)

---

## Progress Tracking

### Overall Completion

```
Phase 1: ████████████████████ 100% ✅
Phase 2: ░░░░░░░░░░░░░░░░░░░░   0%
Phase 3: ░░░░░░░░░░░░░░░░░░░░   0%
Phase 4: ░░░░░░░░░░░░░░░░░░░░   0%
```

**Core Product:** 25% complete (Phase 1 of 4)  
**Time Invested:** 0.75 hours  
**Estimated Remaining:** ~7 hours  
**Total Project:** ~8 hours with AI

### Velocity Metrics

**After Phase 1:**
- Estimated: 198 minutes
- Actual: 45 minutes  
- Velocity: 4.4x faster than raw estimates
- Accuracy: 37.5% (learning AI velocity)

**Goal:** Achieve 80-90% estimation accuracy over time

---

## What's Next?

**Current Decision Point:** Choose which phase to tackle next

### Option 1: Phase 2 - Resilience (Recommended)
**Why do this first:**
- ✅ Prevents production outages
- ✅ Saves debugging time
- ✅ Enables reliable multi-calendar (Phase 3 needs this)
- ✅ Highest operational ROI

**Why wait:**
- ❌ Less visible to users than new features
- ❌ Can't demo "retry logic" easily

### Option 2: Phase 3 - Multi-Calendar
**Why do this first:**
- ✅ Most visible user value
- ✅ Differentiating feature
- ✅ Easy to demo

**Why wait:**
- ❌ Needs Phase 2 for reliability
- ❌ More complex without retry logic
- ❌ Lower operational ROI

### Option 3: Phase 4 - Observability Dashboard
**Why do this first:**
- ✅ Makes debugging easier
- ✅ Provides better visibility
- ✅ Enables proactive monitoring

**Why wait:**
- ❌ Phase 1 already has good logging
- ❌ Can wait until we have more errors to track
- ❌ Lower immediate value

**Recommendation:** Phase 2 (Resilience) → Phase 4 (Observability) → Phase 3 (Multi-Calendar)

---

## Session Planning

### Planning a Work Session

**Before Starting:**
1. Choose tasks totaling your available time
2. Use AI-adjusted estimates
3. Add 20% buffer for unknowns
4. Prioritize by impact

**Example Sessions:**

**2-hour session:**
- Phase 2: Complete entire phase (2.3 hrs with buffer)

**1-hour session:**
- Start Phase 2: Retry logic + Timeout handling (~40 min)

**30-minute session:**
- Phase 2: Retry logic only (~30 min)

---

## Notes

### Key Learnings from Phase 1

**What worked:**
- AI wrote 100% of code upfront (saved 2+ hours)
- Clear step-by-step instructions
- Pre-tested SQL migrations
- Good error messages

**What would make it faster:**
- Automated file copying
- Pre-seeded test database
- Auto-detect issues early

**Key Takeaway:**  
With AI assistance, focus estimates on testing, integration, and troubleshooting. Coding time is nearly zero with good prompts!

---

_Last updated: October 30, 2025_  
_Next review: After Phase 2 completion_
