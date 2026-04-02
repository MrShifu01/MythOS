# Evaluation Rubrics — MythOS
**Version:** 1.0
**Used by:** `/mythos:do` (self-evaluation), `/mythos:audit` (output quality gate)

Rubrics replace binary pass/fail. Every evaluation produces a score breakdown by named dimension.
This enables targeted iteration: "Testing: 40 — no E2E suite" not just "score: 65."

---

## How to Score

1. Read each dimension's criteria carefully.
2. Score each dimension independently on 0–100.
3. Apply the weighting formula to produce a composite score.
4. Return the full breakdown — composite score AND per-dimension scores.
5. For each dimension scoring below 60: write a specific, actionable finding.

**Dimensional score meanings:**
- 90–100: Exceeds expectations — no issues found
- 70–89: Solid — minor issues only, does not block
- 50–69: Acceptable with gaps — specific improvements needed
- 30–49: Below standard — significant rework required
- 0–29: Broken or absent — must be fixed before advancing

---

## Domain: Code (backend, API, Node.js, general)

| Dimension | Weight | Criteria |
|-----------|--------|---------|
| **Correctness** | 35% | Does it actually work? Tests pass, logic is sound, no broken paths, no stubs left in. The core thing it was supposed to do — does it do that? |
| **Architecture fit** | 25% | Does it follow existing patterns? Consistent naming, file structure, module boundaries. No surprise new abstractions. No reinventing what already exists. |
| **Security posture** | 25% | No hardcoded secrets, no injection vectors, no trust boundary violations, no sensitive data logged, dependencies not introducing known CVEs. |
| **Maintainability** | 15% | Readable without a guide. Functions do one thing. Tests cover the key paths. Error handling is explicit. No silent failures. |

**Formula:** `score = (correctness × 0.35) + (architecture × 0.25) + (security × 0.25) + (maintainability × 0.15)`

**Hard blocks:**
- Any critical security vulnerability → composite capped at 30
- Core feature broken / tests fail → correctness capped at 20
- Hardcoded secret or credential → security = 0

---

## Domain: Frontend (React, Next.js, HTML/CSS, UI components)

| Dimension | Weight | Criteria |
|-----------|--------|---------|
| **Functionality** | 30% | Every interactive element works. Forms submit. Navigation reaches destinations. Loading, error, and empty states all render. |
| **Design quality** | 30% | The UI feels like a coherent whole. Colors, typography, spacing, and layout combine with clear intention. |
| **Originality** | 25% | Evidence of deliberate design decisions, not library defaults. Red flags: generic purple-white card grids, unmodified stock components. |
| **Craft** | 15% | Typography hierarchy is clear. Spacing is consistent. Contrast ratios work. Focus states exist. Responsive at key breakpoints. |

**Formula:** `score = (functionality × 0.30) + (design × 0.30) + (originality × 0.25) + (craft × 0.15)`

**Hard blocks:**
- Broken navigation or form submission → functionality capped at 20
- Missing loading/error states for async operations → functionality −20
- Hardcoded colours that ignore dark mode context → craft −15

---

## Domain: CLI / Installer (shell scripts, installers, automation)

| Dimension | Weight | Criteria |
|-----------|--------|---------|
| **Reliability** | 40% | Idempotent — running twice does not cause errors. Handles partial failures. Exit codes correct. Works on a clean machine. |
| **UX clarity** | 30% | Progress visible during long operations. Errors are human-readable. Help text is accurate. User always knows what is happening. |
| **Safety** | 30% | No destructive defaults. Dangerous operations require confirmation. Paths validated before use. No arbitrary code execution from user input. |

**Formula:** `score = (reliability × 0.40) + (ux × 0.30) + (safety × 0.30)`

**Hard blocks:**
- Non-idempotent script that corrupts state on second run → reliability = 0
- Destructive operation with no confirmation → safety capped at 20
- Silent failure (exits 0 when it should fail) → reliability −30

---

## Composite Score → Verdict

| Composite Score | Verdict | Action |
|-----------------|---------|--------|
| 85–100 | **pass** | Advance |
| 70–84 | **pass_with_warnings** | Advance, log sub-70 dimensions to memory/lessons.md |
| 50–69 | **fail — targeted** | Return with specific dimensional feedback. One retry. |
| 30–49 | **fail — rework** | Return with dimensional breakdown + pivot direction. One retry. |
| 0–29 | **fail — halt** | Hard block. Human required. |

---

## Feedback Format

```
Evaluation result: {composite}/100 — {verdict}

Dimension breakdown:
  correctness:    {score}/100 — {one sentence finding or "no issues"}
  architecture:   {score}/100 — {one sentence finding or "no issues"}
  security:       {score}/100 — {one sentence finding or "no issues"}
  maintainability:{score}/100 — {one sentence finding or "no issues"}

Priority fix: {single most important thing to address next}
```
