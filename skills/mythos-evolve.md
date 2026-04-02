---
name: mythos:evolve
description: Improvement engine. Evolves standards, rubrics, skills, and CLAUDE.md via scored evidence. Snapshot before every pass. Rollback available.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# /mythos:evolve

**Before any pass:** Save snapshot to `.mythos/snapshots/YYYY-MM-DD-HHmm/` containing:
standards.md, evaluation-rubrics.md, evaluation-examples/, all 6 skill files, CLAUDE.md.

**Mode selection:**
- *Evidence mode* — outcomes library has ≥3 real entries per artifact: use scored real outputs, compare wording variants, keep higher scorer
- *Synthetic mode* — fresh install or sparse history: generate 3–5 representative task scenarios for this project type, score each, identify lowest-scoring definitions, propose improvements

**Artifacts in scope:**
- `standards.md` — sharpen contracts where scores show consistent underperformance
- `evaluation-rubrics.md` — detect and fix scoring drift; re-score calibration anchors each pass
- Any of the 6 mythos skills — strip procedure density >40%, add Output Contract where missing, A/B test wording
- `CLAUDE.md` — tighten hard constraints only; never remove them

**Output contract:**
- Snapshot saved (path printed)
- Max 5 changes per pass
- Each applied change backed by score delta or synthetic test result
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

  To rollback:  /mythos:evolve rollback
──────────────────────────────────────────
```

**Rollback mode:** `/mythos:evolve rollback` — list all snapshots with composite score at capture time. User picks one to restore. Restore = overwrite current files from snapshot. Confirm before writing.
