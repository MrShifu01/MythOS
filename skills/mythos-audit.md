---
name: mythos:audit
description: Full codebase health score across 8 dimensions. Generates sprint file with outcome-ready items.
allowed-tools: Bash, Read, Glob, Grep, Write
---

# /mythos:audit

**Output contract:**
- Score every dimension 0–100 (criteria below)
- Composite = weighted average using weights from `.mythos/context/standards.md`
- Append entry to `.mythos/memory/audit-scores.md`: date, composite, per-dimension breakdown
- Write sprint file to `.mythos/sprints/active/YYYY-MM-DD-audit.md`
- Each sprint item is a `/mythos:do`-ready outcome definition with expected score delta

**Dimensions:**

| Dimension   | What it measures |
|-------------|-----------------|
| Frontend    | Component quality, bundle size, rendering patterns, accessibility, design consistency with standards.md |
| Backend     | API design, error handling, input validation, service boundaries |
| Database    | Schema quality, query efficiency, index coverage, migration hygiene |
| Performance | Core Web Vitals, response times, caching strategy, N+1 patterns |
| Security    | OWASP Top 10, auth patterns, secrets exposure, dependency vulnerabilities |
| Testing     | Coverage, test quality, E2E (Playwright), integration vs unit balance |
| API         | Contract clarity, versioning, documentation, consistency |
| Code health | Duplication, complexity, dead code, dependency freshness |

**Sprint item format:**
```markdown
## Sprint: [Title] — expected +[N]pts on [Dimension] score

**Outcome:** [One observable sentence defining success]
Success: [Measurable verification criteria]

**Current gap:** [score]/100 — [specific gap description]
```

**Close with:**
```
Sprints written → .mythos/sprints/active/YYYY-MM-DD-audit.md

When ready:  /mythos:do sprints
```
