<!-- MythOS calibration anchor — DO NOT MODIFY — ground truth for rubric scoring -->
# Example: Code Evaluation — PASS (82/100)

**Feature:** Add rate limiting to the public API endpoint `/api/search`
**Domain:** Code rubric

## What was built
A middleware function that reads a Redis-backed counter per IP, rejects with 429 after
30 requests/minute, and resets the window on the next minute boundary. Tested with
unit tests covering the happy path, the limit-hit case, and the Redis failure fallback.

## Playwright Findings
- `/api/search` responds normally for the first 30 requests — confirmed via Playwright
- Request 31 returns 429 with `Retry-After` header — verified
- After 60 seconds, limit resets — verified via mocked time in tests
- Redis failure falls back to in-memory limit (graceful degradation) — confirmed

## Dimension Scores

**Correctness: 90/100** — No issues. Rate limiting fires correctly, fallback works, headers are set.

**Architecture fit: 85/100** — Middleware pattern matches the existing `auth` middleware in the same directory. Naming and file placement are consistent.

**Security posture: 75/100** — IP-based limiting is bypassable via X-Forwarded-For header spoofing. Finding logged, not a blocker at this severity. Developer should add header trust configuration.

**Maintainability: 75/100** — Function is well-scoped. One gap: the Redis key expiry logic is duplicated in two places. Minor, not a blocker.

**Composite: 82/100 → pass_with_warnings**

## Verdict
`pass_with_warnings` — Advance to Security phase.
Log: X-Forwarded-For bypass risk for Security Engineer to evaluate.

---
*What made this a PASS: The core thing works end-to-end. Playwright confirmed the live behaviour
matched the spec. The findings are real but medium severity — they don't break the feature.*
