---
name: mythos:status
description: Context Tree dashboard with AKL lifecycle summary, relation graph stats, and score trends. Under 25 lines total output.
allowed-tools: Read, Bash, Glob, Grep
---

# /mythos:status

**Output contract:**
- Scan `.mythos/memory/context-tree/` for entry counts by domain and maturity
- Read domain `context.md` files for summaries
- Read `.mythos/memory/context-tree/operations/audit-history/` for score trend
- Check `.mythos/memory/context-tree/.relations-index.json` for graph stats
- Total output ≤25 lines, exactly the format below — nothing more

Output exactly this format:

```
▸ MythOS  ·  status
──────────────────────────────────────────
  CONTEXT TREE
  architecture   [N] entries  ([C] core · [V] validated · [D] draft)
  constraints    [N] entries  ([C] core · [V] validated · [D] draft)
  lessons        [N] entries  ([C] core · [V] validated · [D] draft)
  observations   [N] entries  ([C] core · [V] validated · [D] draft)
  outcomes       [N] entries  (last: [score] on [date])
  hypotheses     [N] entries
  operations     [N] entries

  LIFECYCLE
  decaying       [N] entries below importance 35
  most accessed  [entry-id] ([N] accesses)

  RELATIONS
  total links    [N] ([N] forward · [N] backward)
  orphan entries [N] (no relations)

  SCORES
  last audit     [score]/100  [date]
  trend          [↑ / ↓ / →] vs previous

  last evolve    [date] · pass #[N]  (or "never")

  → [one prioritised recommendation]
──────────────────────────────────────────
```

**Counting entries:** Count `.md` files in each domain directory (excluding `context.md` files). Read frontmatter for maturity tier. If a domain directory is empty or missing, show 0.

**AKL stats:** Calculate effective importance for each entry using `importance × 0.995^(days_since_last_event)`. Count entries below 35.

**Relations:** Read `.relations-index.json` if it exists. Count total forward + backward links. An orphan entry has zero relations (no forward or backward links).

**If Context Tree doesn't exist yet** (pre-migration), fall back to counting entries in flat `.mythos/memory/` files.
