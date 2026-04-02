---
name: mythos:status
description: Memory and score trend dashboard. Under 20 lines total output.
allowed-tools: Read, Bash, Glob
---

# /mythos:status

**Output contract:**
- Read `.mythos/memory/` and count entries in each file
- Read `.mythos/memory/audit-scores.md` for score history
- Total output ≤20 lines, exactly the format below — nothing more

Output exactly this format:

```
▸ MythOS  ·  status
──────────────────────────────────────
  decisions      [N] entries
  constraints    [N] entries
  lessons        [N] entries
  outcomes       [N] entries (last: [score] on [date])

  last audit     [score]/100  [date]
  trend          [↑ / ↓ / →] vs previous

  last evolve    [date] · pass #[N]  (or "never")

  → [one prioritised recommendation for what to improve next]
──────────────────────────────────────
```

Count entries by counting `---` separators or `##` headings per file, whichever is used.
If a file is empty, show 0. If audit-scores.md has no entries, show "no audits yet".
