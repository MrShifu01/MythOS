<!-- MythOS calibration anchor — DO NOT MODIFY — ground truth for rubric scoring -->
# Example: Code Evaluation — FAIL (38/100)

**Feature:** Add user export to CSV endpoint `/api/users/export`
**Domain:** Code rubric

## What was built
A route handler that queries all users and returns them as CSV. No authentication check.
No pagination. No rate limiting. Tests exist but mock the database entirely.

## Playwright Findings
- `/api/users/export` is accessible without a session cookie — **unauthenticated access to all user data**
- Response on a large dataset: request times out after 30s — endpoint is unusable in production
- CSV headers are correct, data format is correct

## Dimension Scores

**Correctness: 55/100** — CSV format is correct but the endpoint times out with >500 rows.
The core feature "exports user data" technically works but not at any realistic scale.

**Architecture fit: 70/100** — Route handler follows existing patterns. Minor: no use of the
existing `withAuth` wrapper that every other protected route uses.

**Security posture: 10/100** — CRITICAL: No authentication. Any request to `/api/users/export`
returns the full user table including emails and hashed passwords. This is a data exposure
vulnerability. Pipeline halted — this cannot advance.

**Maintainability: 60/100** — Mocked database tests give false confidence. Tests pass but
do not test what the endpoint actually does against a real database.

**Composite: 38/100 → fail — rework**

## Verdict
`fail — rework` — Do not advance. Return to Senior Developer.

**Priority fix:** Wrap the handler in `withAuth` immediately. This is a P0 security issue.

**Secondary fix:** Add pagination (`limit`/`offset` or cursor-based) before the auth fix ships.

---
*What made this a FAIL: The Playwright walk-through found an unauthenticated data exposure
that code review would likely miss (the missing wrapper isn't obvious from the diff).
The composite score reflects a critical security dimension failure, not just minor issues.*
