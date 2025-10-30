# Planning Template

**Use this template BEFORE writing any code for a new phase/feature.**

This ensures you're building the RIGHT thing, not just building it right.

---

## Phase/Feature Name

[Name of what you're building]

**Estimated Time:** [Hours]  
**Priority:** [P0/P1/P2/P3]  
**Date:** [YYYY-MM-DD]

---

## 1. Problem Definition

**What problem are we solving?** (Not "what feature" - what PROBLEM)

[Describe the actual problem in 2-3 sentences. Focus on pain points, not solutions.]

**Why now?** (Why is this problem important to solve right now?)

[Explain the urgency or impact]

**Who has this problem?**

- [ ] Me (developer)
- [ ] End users
- [ ] Both
- [ ] Future developers

---

## 2. Success Criteria

**How will we know the problem is solved?**

List specific, measurable outcomes:

1. [Outcome 1 - Be specific and measurable]
2. [Outcome 2]
3. [Outcome 3]

**What does "good enough" look like?** (When can we stop?)

[Define the minimum viable solution]

---

## 3. Technical Approach

**What's the SIMPLEST solution that solves the problem?**

[Describe the approach in 3-5 sentences. Avoid over-engineering.]

**Key decisions:**

| Decision | Options Considered | Choice | Why |
|----------|-------------------|--------|-----|
| [Decision 1] | [A, B, C] | [Choice] | [Reason] |
| [Decision 2] | [A, B] | [Choice] | [Reason] |

**Files to create:**
- `path/to/file1.js` - [Purpose]
- `path/to/file2.js` - [Purpose]

**Files to modify:**
- `path/to/existing.js` - [What changes]

**Dependencies to add:**
- `package-name` - [Why needed]

---

## 4. Validation Plan

**BEFORE writing code:**

- [ ] Problem definition reviewed
- [ ] Success criteria agreed upon
- [ ] Technical approach makes sense
- [ ] No simpler alternative exists

**DURING implementation:**

- [ ] [Check 1 - e.g., "Tests pass locally"]
- [ ] [Check 2 - e.g., "No console errors"]
- [ ] [Check 3 - e.g., "Preview deployment works"]

**AFTER implementation:**

- [ ] Success criteria #1 verified
- [ ] Success criteria #2 verified
- [ ] Success criteria #3 verified
- [ ] No regressions in existing features
- [ ] Documentation updated

**How to test:**

1. [Test step 1]
2. [Test step 2]
3. [Test step 3]

---

## 5. Scope Control

**What we ARE doing:**

- [In-scope item 1]
- [In-scope item 2]
- [In-scope item 3]

**What we are NOT doing (out of scope):**

- [ ] [Out-of-scope item 1 - explicitly excluded]
- [ ] [Out-of-scope item 2 - save for later]
- [ ] [Out-of-scope item 3 - not needed]

**Why this matters:** Prevents scope creep and keeps focus on solving the actual problem.

---

## 6. Risks & Mitigation

**What could go wrong?**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk 1] | [High/Med/Low] | [High/Med/Low] | [How to prevent/handle] |
| [Risk 2] | [High/Med/Low] | [High/Med/Low] | [How to prevent/handle] |

---

## 7. Rollback Plan

**If this doesn't work, how do we undo it?**

1. [Rollback step 1]
2. [Rollback step 2]
3. [Time to rollback: X minutes]

---

## 8. Next Steps

**After completing this work:**

1. [What comes next]
2. [What becomes possible]
3. [What to monitor]

---

## Approval

**Before writing code, answer these questions:**

- [ ] Is this the right problem to solve?
- [ ] Are we solving it the simplest way?
- [ ] Do we have clear success criteria?
- [ ] Do we know how to test it?
- [ ] Have we limited scope appropriately?
- [ ] Is the risk acceptable?

**If all boxes checked: START CODING** ✅  
**If any box unchecked: REVISE PLAN** 🔄

---

_This template forces you to think BEFORE coding, preventing wasted effort._