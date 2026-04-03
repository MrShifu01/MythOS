---
name: mythos:audit
description: Full codebase health score across 8 dimensions. Uses Context Tree relation graph for multi-hop analysis. Generates sprint file.
allowed-tools: Bash, Read, Glob, Grep, Write
---

# /mythos:audit

**Output contract:**
- Score every dimension 0–100 (criteria below)
- Composite = weighted average using weights from `.mythos/context/standards.md`
- Append entry to Context Tree: `.mythos/memory/context-tree/operations/audit-history/YYYY-MM-DD.md`
- Write sprint file to `.mythos/sprints/active/YYYY-MM-DD-audit.md`
- Each sprint item is a `/mythos:do`-ready outcome definition with expected score delta

## Knowledge-Informed Scoring

For each dimension, leverage the Context Tree before scoring:

1. **Load constraints** — Search `constraints/` for rules relevant to this dimension
2. **Check lessons** — Search `lessons/` for past failures in this area
3. **Follow relations** — Use the relation graph to find connected knowledge:
   - `enforces` links show what patterns implement which constraints
   - `conflicts-with` links reveal unresolved tensions
   - `derived-from` chains show provenance of current patterns
4. **Cross-reference outcomes** — Check `outcomes/` for past scores on similar work

This enables scoring not just the code, but the **coherence** of the knowledge backing it.

## Dimensions

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

## Context Tree Health (bonus dimension)

In addition to the 8 code dimensions, report Context Tree health:
- Total entries and maturity distribution
- Orphan entries (no relations) — knowledge gaps
- Decaying entries (importance < 35) — stale knowledge
- Missing domains — areas with no stored knowledge

This is informational only — not included in the composite score.

## Sprint Item Format
```markdown
## Sprint: [Title] — expected +[N]pts on [Dimension] score

**Outcome:** [One observable sentence defining success]
Success: [Measurable verification criteria]

**Current gap:** [score]/100 — [specific gap description]
**Related knowledge:** [Context Tree entries relevant to this sprint item]
```

## Audit Entry Format (for Context Tree)

The audit result is stored as a Context Tree entry in `operations/audit-history/`:

```markdown
---
id: audit-YYYY-MM-DD
domain: operations
topic: audit-history
created: [ISO 8601]
updated: [ISO 8601]
author: claude
importance: 70
maturity: validated
access_count: 0
update_count: 0
relations: []
tags: [audit, scores]
---

# Audit — YYYY-MM-DD

## Composite: [score]/100

## Breakdown
| Dimension | Score | Finding |
|-----------|-------|---------|
| ... | ... | ... |

## Context Tree Health
- Entries: [N] (core: [C], validated: [V], draft: [D])
- Relations: [N] links, [N] orphans
- Decaying: [N] entries
```

**Close with:**
```
Sprints written → .mythos/sprints/active/YYYY-MM-DD-audit.md

When ready:  /mythos:do sprints
```
