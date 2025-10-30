# Phase 2: Technical Foundation - PLAN

**Estimated Time:** 11 hours  
**Priority:** P0 (Critical)  
**Date:** 2025-10-30  
**Status:** 📋 Planning (Not Started)

---

## 1. Problem Definition

**What problem are we solving?**

We cannot safely refactor, add features, or onboard developers because:
1. We have ZERO automated tests (every deploy risks breaking the app)
2. We trust all input data (vulnerable to corruption and attacks)
3. We have unlimited API calls (vulnerable to DOS and runaway costs)

**Why now?**

Before building ANY new features, we need confidence that changes won't break existing functionality. Without tests, validation, and rate limiting:
- Phase 3 (Resilience) requires refactoring = high risk of breaking things
- Phase 4 (Multi-Calendar) adds complexity = more to break
- Every feature compounds the risk

We're at a crossroads: Build on sand or build on rock.

**Who has this problem?**

- [x] Me (developer) - Can't refactor safely
- [ ] End users - Not directly visible
- [x] Both - Users suffer when things break
- [x] Future developers - Can't onboard without tests

---

## 2. Success Criteria

**How will we know the problem is solved?**

1. **Tests exist and pass** - 20+ tests covering critical paths (health, calendar, todos, auth)
2. **CI blocks bad code** - GitHub Actions fails PRs when tests fail
3. **Input validation works** - API returns 400 errors for invalid data (not 500)
4. **Rate limiting works** - 429 errors returned when limits exceeded
5. **Can refactor confidently** - Change code, tests still pass

**What does "good enough" look like?**

Minimum viable:
- 20+ tests (not 100% coverage, just critical paths)
- Validation on all API POST/PUT routes
- Rate limiting on all public endpoints
- CI pipeline runs tests on every PR

**NOT aiming for:**
- 100% test coverage (diminishing returns)
- Complex test fixtures (keep it simple)
- Advanced rate limiting strategies (basic is fine)

---

## 3. Technical Approach

**What's the SIMPLEST solution that solves the problem?**

**For Testing:**
- Use Jest (already common in Next.js ecosystem)
- Use React Testing Library for components
- Use Playwright for E2E (parallel test execution)
- Start with 20-30 tests covering critical paths

**For Validation:**
- Use Zod (TypeScript-friendly, simple API)
- Create schemas for each API route
- Validate request bodies before processing

**For Rate Limiting:**
- Use Upstash Ratelimit (Vercel integration, free tier)
- Implement sliding window rate limiting
- 10 requests per 10 seconds per user

**Key decisions:**

| Decision | Options | Choice | Why |
|----------|---------|--------|-----|
| Test framework | Jest, Vitest, Mocha | **Jest** | Most popular, great Next.js support |
| E2E framework | Playwright, Cypress, Puppeteer | **Playwright** | Faster, better API, works with Vercel |
| Validation | Zod, Yup, Joi | **Zod** | TypeScript-first, composable |
| Rate limiting | Upstash, Redis, Custom | **Upstash** | Serverless-friendly, free tier |
| Where to store rate limits | Redis, Memory, Database | **Redis (Upstash)** | Fast, scales well |

**Files to create:**

```
tests/
├── unit/
│   ├── logger.test.js
│   ├── token-refresh.test.js
│   └── error-boundary.test.js
├── integration/
│   ├── api-health.test.js
│   ├── api-calendar.test.js
│   └── api-todos.test.js
└── e2e/
    ├── user-login.spec.js
    ├── user-adds-todo.spec.js
    └── calendar-loads.spec.js

lib/
├── validation.js        # Zod schemas
└── rate-limit.js        # Rate limiting utility

.github/
└── workflows/
    └── ci.yml          # GitHub Actions CI
```

**Files to modify:**

- `app/api/calendar/route.js` - Add validation + rate limiting
- `app/api/todos/route.js` - Add validation + rate limiting (if exists)
- `app/api/auth/google/route.js` - Add rate limiting
- `package.json` - Add test scripts and dependencies

**Dependencies to add:**

- `jest` - Test framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - Jest matchers
- `@playwright/test` - E2E testing
- `zod` - Validation schemas
- `@upstash/ratelimit` - Rate limiting
- `@upstash/redis` - Redis client

---

## 4. Validation Plan

**BEFORE writing code:**

- [x] Problem definition reviewed ✅
- [x] Success criteria agreed upon ✅
- [x] Technical approach makes sense ✅
- [x] No simpler alternative exists ✅

**DURING implementation:**

- [ ] **Milestone 1: Testing Setup** (2 hours)
  - [ ] Jest configured and running
  - [ ] Playwright configured
  - [ ] GitHub Actions workflow created
  - [ ] First test passes

- [ ] **Milestone 2: Unit Tests** (3 hours)
  - [ ] Logger tests pass
  - [ ] Token refresh tests pass
  - [ ] Error boundary tests pass
  - [ ] No console errors

- [ ] **Milestone 3: Integration Tests** (2 hours)
  - [ ] Health endpoint tests pass
  - [ ] Calendar API tests pass
  - [ ] Todos API tests pass (if route exists)

- [ ] **Milestone 4: E2E Tests** (1.5 hours)
  - [ ] Login flow test passes
  - [ ] Add todo test passes
  - [ ] Calendar loads test passes

- [ ] **Milestone 5: Validation** (2 hours)
  - [ ] Zod schemas created
  - [ ] Validation added to API routes
  - [ ] Invalid data returns 400 errors
  - [ ] Valid data still works

- [ ] **Milestone 6: Rate Limiting** (1 hour)
  - [ ] Upstash Redis connected
  - [ ] Rate limiting middleware working
  - [ ] 429 errors returned when exceeded
  - [ ] Normal requests unaffected

**AFTER implementation:**

- [ ] Success criteria #1: 20+ tests exist and pass ✅
- [ ] Success criteria #2: CI blocks failing PRs ✅
- [ ] Success criteria #3: Invalid input returns 400 ✅
- [ ] Success criteria #4: Rate limits return 429 ✅
- [ ] Success criteria #5: Can refactor safely ✅
- [ ] No regressions in existing features
- [ ] Documentation updated (DEVELOPMENT.md)

**How to test:**

**Testing Framework:**
```bash
# Run all tests
npm test

# Run specific test suite
npm test logger

# Run E2E tests
npm run test:e2e

# Expected: All tests pass
```

**Input Validation:**
```bash
# Test invalid todo (empty task)
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"task": ""}'
# Expected: 400 Bad Request

# Test valid todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"task": "Buy milk"}'
# Expected: 200 OK
```

**Rate Limiting:**
```bash
# Rapid fire requests (11 in quick succession)
for i in {1..11}; do
  curl http://localhost:3000/api/health
done
# Expected: First 10 succeed, 11th returns 429
```

**CI Pipeline:**
1. Create PR with failing test
2. Push to GitHub
3. GitHub Actions runs tests
4. PR shows "❌ Checks failed"
5. Can't merge until fixed

---

## 5. Scope Control

**What we ARE doing:**

- ✅ Automated testing framework (Jest + Playwright)
- ✅ 20-30 tests covering critical paths
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Input validation with Zod (all API routes)
- ✅ Rate limiting with Upstash (all public endpoints)

**What we are NOT doing (out of scope):**

- [ ] **100% test coverage** - Diminishing returns, focus on critical paths
- [ ] **Performance testing** - That's Phase 6
- [ ] **Security testing/pen testing** - That's Phase 7
- [ ] **Visual regression testing** - Nice to have, not critical
- [ ] **Testing external services (Google API)** - Mock them instead
- [ ] **Load testing** - That's Phase 6
- [ ] **Mutation testing** - Advanced, not needed yet

**Why this matters:**  
We could spend 40 hours building a perfect test suite. We're spending 11 hours building a GOOD ENOUGH test suite. The goal is confidence to refactor, not perfection.

---

## 6. Risks & Mitigation

**What could go wrong?**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Tests are flaky** (fail randomly) | Medium | High | Use Playwright's auto-wait, avoid hardcoded delays, retry flaky tests |
| **CI takes too long** (>5 min) | Medium | Medium | Run tests in parallel, cache dependencies, only run affected tests |
| **Rate limiting breaks legit users** | Low | High | Set generous limits (10/10sec), monitor error rates, allow burst |
| **Validation is too strict** (rejects valid data) | Medium | Medium | Start permissive, tighten over time, log rejected requests |
| **Tests pass locally, fail in CI** | Medium | Medium | Use same Node version, same env vars, document setup |
| **Breaking changes in dependencies** | Low | Medium | Pin versions in package.json, test before upgrading |
| **Upstash Redis quota exceeded** | Low | Medium | Monitor usage, upgrade if needed, fallback to memory cache |

---

## 7. Rollback Plan

**If this doesn't work, how do we undo it?**

**Tests causing issues:**
1. Tests can be ignored/skipped without affecting app functionality
2. Remove GitHub Actions workflow file
3. App continues to work as before
4. **Time to rollback: 5 minutes**

**Validation causing issues:**
1. Comment out validation middleware in API routes
2. Redeploy
3. App accepts all input again (like before)
4. **Time to rollback: 10 minutes**

**Rate limiting causing issues:**
1. Remove rate limiting middleware
2. Redeploy
3. App has unlimited requests again (like before)
4. **Time to rollback: 10 minutes**

**Complete rollback:**
1. Revert the PR/commit
2. Redeploy to production
3. Remove new dependencies from package.json
4. **Time to rollback: 15 minutes**

---

## 8. Next Steps

**After completing this work:**

1. **Phase 3 (Resilience) becomes safe** - Can refactor with confidence
2. **Can add new developers** - Tests document how things work
3. **Can deploy confidently** - Tests catch regressions
4. **Can experiment** - Tests allow safe exploration
5. **Monitor test execution time** - Keep CI fast (<5 min)
6. **Monitor rate limit hits** - Adjust if too strict
7. **Monitor validation errors** - Understand what users are sending

**Metrics to track:**
- Test execution time (goal: <5 min)
- Test failure rate (goal: <5% flakiness)
- Rate limit hit rate (goal: <1% of requests)
- Validation error rate (goal: <5% of requests)

---

## Approval

**Before writing code, answer these questions:**

- [x] Is this the right problem to solve? ✅ YES - Can't scale without this
- [x] Are we solving it the simplest way? ✅ YES - Standard tools, no over-engineering
- [x] Do we have clear success criteria? ✅ YES - 5 measurable outcomes
- [x] Do we know how to test it? ✅ YES - Detailed validation plan
- [x] Have we limited scope appropriately? ✅ YES - Good enough, not perfect
- [x] Is the risk acceptable? ✅ YES - Low risk, can rollback easily

**Decision: START CODING** ✅

**Estimated: 11 hours over 2-3 sessions**

---

## Session Breakdown

**Session 1 (4 hours): Testing Foundation**
- Setup Jest, Playwright, GitHub Actions
- Write first 10 unit tests
- Verify CI works

**Session 2 (4 hours): Validation & More Tests**
- Add Zod validation to API routes
- Write integration tests
- Write E2E tests

**Session 3 (3 hours): Rate Limiting & Polish**
- Add Upstash rate limiting
- Test everything together
- Update documentation
- Deploy to preview, test, merge

---

_Plan approved: 2025-10-30_  
_Ready to implement: YES ✅_