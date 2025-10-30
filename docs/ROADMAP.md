# Life Dashboard - Product Roadmap

**Last Updated:** October 30, 2025  
**Current Version:** 1.1.0  
**Status:** Phase 1 Complete ✅

---

## Overview

This document is the **single source of truth** for what's next in Life Dashboard. All planned work, estimates, and priorities live here.

**Completed Work:** See [CHANGELOG.md](./CHANGELOG.md)  
**Architecture Details:** See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Progress Tracker

```
Phase 1 - Foundation:    ████████████████████ 100% ✅ (Oct 29, 2025)
Phase 2 - Resilience:    ░░░░░░░░░░░░░░░░░░░░   0%
Phase 3 - Multi-Calendar: ░░░░░░░░░░░░░░░░░░░░   0%
Phase 4 - Observability: ░░░░░░░░░░░░░░░░░░░░   0%
```

**Overall Completion:** 25% of error handling roadmap

---

## Phase 2: Resilience & Reliability 🛡️

**Status:** 🔲 Not Started  
**Priority:** P1 (High)  
**Size:** 🔴 Extra Large  
**Estimated Time:** 2.3 hours (AI-adjusted from 5.5 hours)  
**Dependencies:** Phase 1 complete ✅

### Goal
Make the app resilient to transient failures and network issues. No more manual Google Calendar reconnects!

### Features

#### 1. Automatic Token Refresh 🔄
**Size:** 🟡 Medium (25 min)  
**Status:** ✅ **COMPLETED** (Oct 29, 2025)

**What it does:**
- Automatically refreshes Google Calendar tokens before they expire
- No more 401 errors or manual reconnects
- Checks token expiry 5 minutes before expiration
- Uses refresh token to get new access token

**Files:**
- `lib/google-token-refresh.js` ✅ Created
- `app/api/calendar/route.js` ✅ Updated

#### 2. Retry Logic with Exponential Backoff
**Size:** 🟡 Medium (30 min)  
**Status:** 🔲 Not Started

**What it does:**
- Automatically retry failed API calls
- Wait longer between each retry (1s, 2s, 4s, 8s)
- Stop after 3 attempts
- Works for Google Calendar API, Supabase queries

**Implementation:**
```javascript
// lib/retry.js
async function withRetry(fn, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      await sleep(Math.pow(2, attempt) * 1000) // Exponential backoff
    }
  }
}
```

**Impact:**
- Fewer errors from temporary network issues
- Better user experience (no "try again" errors)
- Works silently in background

#### 3. Timeout Handling
**Size:** 🟢 Small (10 min)  
**Status:** 🔲 Not Started

**What it does:**
- Set maximum wait time for API calls (10 seconds)
- Show helpful error if timeout occurs
- Prevent infinite loading states

**Implementation:**
```javascript
// Wrap API calls with timeout
const fetchWithTimeout = (url, timeout = 10000) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ])
}
```

**Impact:**
- No more "stuck" loading screens
- Clear error messages
- Better error logging

#### 4. Circuit Breaker for Calendar API
**Size:** 🟡 Medium (30 min)  
**Status:** 🔲 Not Started

**What it does:**
- If calendar fails repeatedly, stop trying temporarily
- Show cached events or graceful degradation
- Automatically retry after cooldown period
- Prevent hammering a failing API

**Implementation:**
```javascript
// lib/circuit-breaker.js
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0
    this.threshold = threshold
    this.timeout = timeout
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  onSuccess() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }
  
  onFailure() {
    this.failureCount++
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN'
      this.openedAt = Date.now()
    }
  }
}
```

**Impact:**
- Protects against API rate limits
- Better user messaging when service is down
- Reduces wasted API calls

#### 5. Integration & Testing
**Size:** 🟡 Medium (45 min)  
**Status:** 🔲 Not Started

**Testing plan:**
- Test retry logic with forced failures
- Test timeout with slow mock API
- Test circuit breaker with repeated failures
- Verify error logging works
- Test on preview deployment

### Cost & Time Estimates

| Metric | Value |
|--------|-------|
| **Raw Estimate** | 5.5 hours (330 min) |
| **AI-Adjusted** | 2.3 hours (140 min) |
| **Cost (at $50/hr)** | ~$115 |
| **ROI** | Saves ~4 hours/month in debugging |
| **Payback Period** | ~2 weeks |

### Success Criteria

- ✅ Token refresh works automatically (DONE)
- [ ] Calendar API calls retry on failure
- [ ] No more "stuck" loading states
- [ ] Circuit breaker prevents API hammering
- [ ] Health endpoint shows retry/circuit status
- [ ] Error logs show retry attempts

### Files to Create/Modify

**New Files:**
- `lib/retry.js` - Retry logic utility
- `lib/circuit-breaker.js` - Circuit breaker implementation
- `lib/fetch-with-timeout.js` - Timeout wrapper

**Modified Files:**
- `app/api/calendar/route.js` - Add retry + circuit breaker
- `components/Calendar.js` - Handle circuit breaker state
- `app/api/health/route.js` - Show circuit breaker status

---

## Phase 3: Multi-Calendar Support 📅

**Status:** 🔲 Not Started  
**Priority:** P2 (Medium)  
**Size:** 🔴 Extra Large  
**Estimated Time:** 2.5 hours (AI-adjusted from 6 hours)  
**Dependencies:** Phase 2 complete

### Goal
Support multiple calendar providers (Google + Outlook) in a unified view. See work and personal calendars together.

### Features

#### 1. Calendar Service Abstraction
**Size:** 🟡 Medium (20 min)  
**Status:** 🔲 Not Started

**What it does:**
- Create interface that works for any calendar provider
- Refactor existing Google Calendar code to use interface
- Make it easy to add more providers later

**Implementation:**
```javascript
// lib/calendar-service.js
class CalendarService {
  async getEvents(startDate, endDate) { throw new Error('Not implemented') }
  async createEvent(event) { throw new Error('Not implemented') }
  async deleteEvent(eventId) { throw new Error('Not implemented') }
}

class GoogleCalendarService extends CalendarService {
  async getEvents(startDate, endDate) {
    // Existing Google Calendar logic
  }
}

class OutlookCalendarService extends CalendarService {
  async getEvents(startDate, endDate) {
    // New Outlook logic
  }
}
```

**Impact:**
- Clean separation of concerns
- Easy to test each provider
- Future providers (Apple Calendar, etc.) are simple to add

#### 2. Outlook Calendar Integration
**Size:** 🟠 Large (40 min)  
**Status:** 🔲 Not Started

**What it does:**
- OAuth with Microsoft
- Fetch Outlook Calendar events
- Store Outlook tokens securely
- Support same features as Google Calendar

**Requirements:**
- Microsoft Azure account
- Register app in Azure Portal
- Get Client ID and Secret
- Configure redirect URIs

**Database Changes:**
```sql
-- Add new table for calendar connections
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL, -- 'google', 'outlook'
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  account_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider, account_email)
);

CREATE INDEX idx_calendar_connections_user_provider 
  ON calendar_connections(user_id, provider);

-- Migrate existing google_tokens to calendar_connections
INSERT INTO calendar_connections (user_id, provider, access_token, refresh_token, expiry_date)
SELECT user_id, 'google', access_token, refresh_token, expiry_date
FROM google_tokens;

-- Drop old table
DROP TABLE google_tokens;
```

**New API Routes:**
- `/api/auth/outlook` - Initiate OAuth
- `/api/auth/outlook/callback` - OAuth callback
- `/api/calendar?provider=outlook` - Fetch Outlook events

**Impact:**
- Users can connect multiple accounts
- See work and personal calendars together
- Competitive feature (most calendar apps support this)

#### 3. Unified Multi-Calendar View
**Size:** 🟡 Medium (25 min)  
**Status:** 🔲 Not Started

**What it does:**
- Fetch from all connected calendars
- Merge events by date
- Color-code by calendar
- Filter/toggle calendars on/off

**UI Design:**
```
┌─────────────────────────────────────┐
│ Google Calendar                  [x]│
│ Work Calendar (Outlook)          [x]│
│ Personal Calendar (Outlook)      [x]│
└─────────────────────────────────────┘

Today:
  🔵 10:00 AM - Team Standup (Work)
  🟢 2:00 PM - Doctor Appointment (Personal)
  🔵 4:00 PM - Client Call (Work)
```

**Implementation:**
```javascript
async function getUnifiedEvents() {
  const connections = await getCalendarConnections(userId)
  const eventPromises = connections.map(conn => {
    const service = createCalendarService(conn.provider)
    return service.getEvents(startDate, endDate)
  })
  
  const results = await Promise.allSettled(eventPromises)
  const allEvents = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
  
  return allEvents.sort((a, b) => a.start - b.start)
}
```

**Impact:**
- One place to see all calendars
- No more switching between apps
- Better time management

#### 4. Testing & Polish
**Size:** 🟡 Medium (45 min)  
**Status:** 🔲 Not Started

**Testing plan:**
- Connect both Google and Outlook
- Verify events show from both
- Test color coding
- Test filtering
- Test edge cases (no calendars, one fails, etc.)
- Mobile responsive testing

### Cost & Time Estimates

| Metric | Value |
|--------|-------|
| **Raw Estimate** | 6 hours (360 min) |
| **AI-Adjusted** | 2.5 hours (150 min) |
| **Cost (at $50/hr)** | ~$125 |
| **Monthly Value** | Saves 2 hours/month in calendar switching |
| **Payback Period** | ~5 weeks |

### Success Criteria

- [ ] Can connect Google Calendar
- [ ] Can connect Outlook Calendar
- [ ] Events from both show in unified view
- [ ] Color-coded by calendar
- [ ] Can toggle calendars on/off
- [ ] Mobile responsive
- [ ] Database migration successful

### Files to Create/Modify

**New Files:**
- `lib/calendar-service.js` - Abstract calendar interface
- `lib/outlook-calendar.js` - Outlook implementation
- `app/api/auth/outlook/route.js` - Outlook OAuth
- `app/api/auth/outlook/callback/route.js` - OAuth callback
- `supabase-migrations/002_calendar_connections.sql` - New schema

**Modified Files:**
- `components/Calendar.js` - Support multiple calendars
- `app/api/calendar/route.js` - Unified endpoint
- `lib/google-calendar.js` - Refactor to use interface

---

## Phase 4: Observability Dashboard 📊

**Status:** 🔲 Not Started  
**Priority:** P2 (Medium)  
**Size:** 🟠 Large  
**Estimated Time:** 2.3 hours (AI-adjusted from 5 hours)  
**Dependencies:** Phase 1 complete ✅

### Goal
Visual dashboard to monitor app health, errors, and performance. Get alerted when things break.

### Features

#### 1. Error Dashboard UI
**Size:** 🟠 Large (35 min)  
**Status:** 🔲 Not Started

**What it does:**
- View recent errors
- Filter by service, level, date
- See error trends over time
- Mark errors as resolved
- Export error reports

**UI Design:**
```
┌──────────────────────────────────────────┐
│ Error Dashboard                          │
├──────────────────────────────────────────┤
│ [Last 24 hours ▼] [All Services ▼]      │
├──────────────────────────────────────────┤
│                                          │
│ 📊 Error Rate:  5 errors/hour           │
│ ⚠️  Most Errors: calendar (12 errors)   │
│ 🔥 Critical:     2 unresolved           │
│                                          │
├──────────────────────────────────────────┤
│ Recent Errors:                           │
│                                          │
│ 🔴 [14:23] Calendar API timeout          │
│    Service: google-calendar              │
│    [View Details] [Mark Resolved]       │
│                                          │
│ 🟡 [14:15] Database query slow          │
│    Service: database                     │
│    [View Details] [Mark Resolved]       │
│                                          │
└──────────────────────────────────────────┘
```

**Implementation:**
- New page: `/app/dashboard/errors/page.js`
- Query `error_logs` table with filters
- Charts with Recharts library
- Real-time updates (optional)

**Impact:**
- See problems before users report them
- Faster debugging
- Better system understanding

#### 2. Alerting System
**Size:** 🟡 Medium (30 min)  
**Status:** 🔲 Not Started

**What it does:**
- Email when error rate spikes
- Slack notification for critical errors
- Configure alert thresholds
- Daily/weekly summary reports

**Alert Types:**
- **Spike Alert:** Error rate > 10/hour
- **Critical Alert:** Any error level "critical"
- **Service Down:** Health check fails
- **Daily Summary:** Email with stats

**Implementation:**
```javascript
// lib/alerting.js
async function checkAlerts() {
  const errorRate = await getErrorRate('1 hour')
  if (errorRate > 10) {
    await sendEmail({
      to: 'admin@example.com',
      subject: 'High Error Rate Alert',
      body: `Error rate is ${errorRate}/hour`
    })
  }
}

// Run every 5 minutes via cron or Vercel Cron
```

**Services Needed:**
- Email: SendGrid, Resend, or AWS SES
- Slack: Incoming webhook
- Cron: Vercel Cron (free tier)

**Impact:**
- Know about problems immediately
- Fix issues before they escalate
- Sleep better at night 😴

#### 3. Request Tracing
**Size:** 🟡 Medium (25 min)  
**Status:** 🔲 Not Started

**What it does:**
- Track full lifecycle of a request
- See which API calls were made
- Measure time spent in each step
- Debug slow requests

**Implementation:**
```javascript
// Add request ID to logger context
const requestId = crypto.randomUUID()
logger.info('Request started', { requestId, path: req.url })

// Log each step
logger.info('Fetching calendar', { requestId })
logger.info('Query database', { requestId })
logger.info('Request completed', { requestId, duration: Date.now() - start })

// Query logs by requestId to see full trace
```

**UI:**
- Click on an error → See full request trace
- Timeline view of request steps
- Identify bottlenecks

**Impact:**
- Faster debugging
- Find slow queries
- Optimize performance

#### 4. Performance Monitoring
**Size:** 🟡 Medium (25 min)  
**Status:** 🔲 Not Started

**What it does:**
- Track API response times
- Monitor database query latency
- Page load metrics
- Set performance budgets

**Metrics to Track:**
- Average response time
- P95/P99 latency (95th/99th percentile)
- Slowest endpoints
- Database query time
- Error rate by endpoint

**Implementation:**
```javascript
// Middleware to track timing
export async function middleware(request) {
  const start = Date.now()
  const response = await next()
  const duration = Date.now() - start
  
  logger.info('Request completed', {
    path: request.url,
    method: request.method,
    status: response.status,
    duration
  })
  
  return response
}
```

**Dashboard:**
- Line chart of response times over time
- Table of slowest endpoints
- Alerts when response time > threshold

**Impact:**
- Catch performance regressions
- Prioritize optimization work
- Better user experience

#### 5. Testing & Integration
**Size:** 🟡 Medium (25 min)  
**Status:** 🔲 Not Started

**Testing plan:**
- Generate test errors
- Verify alerts fire
- Check dashboard updates
- Test on mobile
- Verify email/Slack notifications work

### Cost & Time Estimates

| Metric | Value |
|--------|-------|
| **Raw Estimate** | 5 hours (300 min) |
| **AI-Adjusted** | 2.3 hours (140 min) |
| **Cost (at $50/hr)** | ~$115 |
| **Monthly Cost** | $5-10 (SendGrid/Slack) |
| **Monthly Value** | Saves 3 hours/month in debugging |
| **Payback Period** | ~3 weeks |

### Success Criteria

- [ ] Can view error dashboard
- [ ] Errors filterable by service/date
- [ ] Can mark errors as resolved
- [ ] Alerts fire on high error rate
- [ ] Email notifications work
- [ ] Request tracing works
- [ ] Performance metrics tracked

### Files to Create/Modify

**New Files:**
- `app/dashboard/errors/page.js` - Error dashboard UI
- `lib/alerting.js` - Alerting logic
- `lib/performance.js` - Performance tracking
- `app/api/cron/check-alerts/route.js` - Cron job for alerts

**Modified Files:**
- `middleware.js` - Add performance tracking
- `lib/logger.js` - Add request tracing
- `app/api/health/route.js` - Add performance data

---

## Future Ideas (Not Scheduled)

Ideas we might explore after Phase 4:

### Calendar Enhancements
- **Recurring events** - Handle repeating events
- **Event creation** - Add events from dashboard
- **Event editing** - Modify existing events
- **Calendar sharing** - Share with family members
- **Smart suggestions** - AI-powered event recommendations

### Todo Enhancements
- **Due dates** - Add deadlines to todos
- **Priorities** - Mark todos as high/medium/low
- **Categories** - Organize todos by project
- **Recurring todos** - Daily/weekly repeating tasks
- **Subtasks** - Break down large todos

### Grocery Enhancements
- **Categories** - Organize by aisle (produce, dairy, etc.)
- **Recipes** - Generate grocery list from recipes
- **Price tracking** - Track item prices over time
- **Shopping history** - See what you buy regularly

### Integration Ideas
- **Weather** - Show weather in calendar
- **Todoist sync** - Import from Todoist
- **Notion integration** - Sync with Notion
- **Apple Calendar** - Third calendar provider
- **Habitica** - Gamify todos

### Advanced Features
- **Mobile app** - React Native or PWA
- **Offline mode** - Work without internet
- **Collaboration** - Share dashboard with family
- **Voice input** - Add todos by voice
- **Dark mode** - Toggle theme

---

## Decision Framework

When deciding what to work on:

### Priority Levels

| Priority | Criteria | Example |
|----------|----------|----------|
| **P0 (Emergency)** | App broken, users blocked | Database down |
| **P1 (High)** | High ROI, enables other work | Phase 2 resilience |
| **P2 (Medium)** | Important but not urgent | Phase 3 multi-calendar |
| **P3 (Low)** | Nice to have | Future ideas |

### ROI Calculation

**Formula:**
```
ROI = (Monthly Time Saved × Hourly Rate × 12 months) / Implementation Cost
```

**Example (Phase 2):**
```
Monthly Time Saved: 4 hours
Hourly Rate: $50
Implementation Cost: $115

ROI = (4 × $50 × 12) / $115 = 20.9 (2,090% ROI!)
```

### Time Availability

**Choose tasks based on available time:**

| Available Time | Task Size | Examples |
|----------------|-----------|----------|
| 30 min | 1-2 Small tasks | Quick fixes, docs |
| 1 hour | 1 Medium task | Component update, bug fix |
| 2 hours | 1 Large task | Full feature |
| 4+ hours | 1 Extra Large | Complete phase |

---

## Velocity Tracking

**Your AI-Assisted Velocity:**

| Task Type | Speedup | Notes |
|-----------|---------|-------|
| **Coding** | 4x faster | AI writes most code |
| **Testing** | 1.3x faster | Still need manual verification |
| **Integration** | 2x faster | AI helps, you test |
| **Documentation** | 3x faster | AI drafts, you refine |

**Phase 1 Results:**
- Estimated: 3.3 hours (raw)
- Actual: 0.75 hours
- Velocity: 4.4x faster than raw estimate

**Adjusted Future Estimates:**
- All estimates in this document are AI-adjusted
- Already account for 60-80% time savings
- Track actual time to improve estimates

---

## Summary

### Total Remaining Work

| Phase | Status | Est. Time | Est. Cost |
|-------|--------|-----------|----------|
| Phase 1 | ✅ Complete | 0.75 hrs | $37.50 |
| Phase 2 | 🔲 Not Started | 2.3 hrs | $115 |
| Phase 3 | 🔲 Not Started | 2.5 hrs | $125 |
| Phase 4 | 🔲 Not Started | 2.3 hrs | $115 |
| **Total** | **25% Done** | **8 hrs** | **$392.50** |

**With AI assistance, the entire roadmap is ~8 hours of work!**

### Quick Wins (< 1 hour each)

1. **Retry logic** (30 min) - Phase 2
2. **Timeout handling** (10 min) - Phase 2
3. **Error dashboard basic** (35 min) - Phase 4

### What's Next?

Recommended order:
1. ✅ **Phase 1** - Done!
2. **Phase 2** - Resilience (highest ROI)
3. **Phase 4** - Observability (leverage Phase 1 logs)
4. **Phase 3** - Multi-calendar (nice to have)

---

**Questions? See [WORKFLOW.md](./WORKFLOW.md) for how to work on these items.**
