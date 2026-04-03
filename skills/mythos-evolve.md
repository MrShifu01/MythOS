---
name: mythos:evolve
description: Improvement engine. Evolves standards, rubrics, skills, CLAUDE.md, and Context Tree knowledge via scored evidence. Snapshot before every pass. Rollback available.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# /mythos:evolve

**Before any pass:** Save snapshot to `.mythos/snapshots/YYYY-MM-DD-HHmm/` containing:
standards.md, evaluation-rubrics.md, evaluation-examples/, all 6 skill files, CLAUDE.md, and `.relations-index.json`.

**Mode selection:**
- *Evidence mode* — outcomes library has ≥3 real entries per artifact: use scored real outputs, compare wording variants, keep higher scorer
- *Synthetic mode* — fresh install or sparse history: generate 3–5 representative task scenarios for this project type, score each, identify lowest-scoring definitions, propose improvements

## Artifacts in Scope

- `standards.md` — sharpen contracts where scores show consistent underperformance
- `evaluation-rubrics.md` — detect and fix scoring drift; re-score calibration anchors each pass
- Any of the 6 mythos skills — strip procedure density >40%, add Output Contract where missing, A/B test wording
- `CLAUDE.md` — tighten hard constraints only; never remove them

## Context Tree Lifecycle Management

In addition to artifact evolution, each evolve pass reviews the Context Tree:

### AKL Maintenance
- Calculate effective importance for all entries: `importance × 0.995^(days_since_last_event)`
- **Promote** entries that crossed upward thresholds (draft→validated at ≥65, validated→core at ≥85)
- **Demote** entries that crossed downward thresholds (core→validated at <60, validated→draft at <35)
- Flag entries with effective importance < 20 as **archival candidates**

### Relation Graph Health
- Identify orphan entries (no relations) — suggest connections or flag as isolated knowledge
- Detect `supersedes` chains — archive fully superseded entries
- Find entries connected by `conflicts-with` — surface unresolved tensions
- Check for broken links (relations pointing to deleted entries) — clean up

### Context Summary Refresh
- Regenerate `context.md` files for any domain/topic that changed since last evolve
- Update entry counts, maturity distributions, and key entries

## Output Contract

- Snapshot saved (path printed)
- Max 5 changes per pass (artifacts) + unlimited AKL promotions/demotions
- Each applied change backed by score delta or synthetic test result
- AKL lifecycle changes listed separately
- Proposed changes listed (A/B in progress — needs one more scored session)
- No-change items listed with reason
- Calibration examples never modified
- Hard constraints in CLAUDE.md never removed

```
▸ MythOS  ·  evolve  ·  pass #N
──────────────────────────────────────────
  snapshot       saved → snapshots/YYYY-MM-DD-HHmm/
  mode           evidence | synthetic

  IMPROVEMENTS APPLIED
  · [artifact] — [change] ([+N]pts evidence)

  PROPOSED (A/B in progress)
  · [artifact] — [variant description]

  NO CHANGE
  · [artifact] — [reason]

  CONTEXT TREE LIFECYCLE
  · promoted    [N] entries (draft→validated: [N], validated→core: [N])
  · demoted     [N] entries (core→validated: [N], validated→draft: [N])
  · archival    [N] entries flagged (importance < 20)
  · orphans     [N] entries with no relations
  · stale links [N] broken relations cleaned

  To rollback:  /mythos:evolve rollback
──────────────────────────────────────────
```

**Rollback mode:** `/mythos:evolve rollback` — list all snapshots with composite score at capture time. User picks one to restore. Restore = overwrite current files from snapshot. Confirm before writing.
