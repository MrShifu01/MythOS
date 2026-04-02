---
name: mythos:remember
description: Routes any input to the correct memory tier automatically. Call before saving anything to .mythos/memory/.
allowed-tools: Read, Write, Edit
---

# /mythos:remember

Given any input, determine the correct memory tier and write it there.

**Routing rules:**
- Session state (what happened, what's in-flight, what to do next) → `.mythos/memory/session.md` (overwrite, not append)
- Hard constraint (non-negotiable rule that must never break) → `.mythos/memory/constraints.md`
- Architectural decision (choice between alternatives with tradeoffs) → `.mythos/memory/decisions.md`
- High-scoring output (score ≥75) → `.mythos/memory/outcomes/<role>.md` with score and date
- Recurring pattern or team observation → `.mythos/memory/observations.md`
- Lesson from a failure or near-miss → `.mythos/memory/lessons.md`

**Before writing:** Check for duplicates. Update existing entry rather than creating duplicate.

**Output contract:**
- One line: where it landed (file path) and why (routing rule applied)
- Nothing else
