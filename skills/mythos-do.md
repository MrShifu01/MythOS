---
name: mythos:do
description: Use for every task. Opens with outcome question, uses progressive retrieval from Context Tree, executes, scores output.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, TodoWrite, TodoRead
---

# /mythos:do

**Before any work:** State what success looks like in one observable sentence.
- If you cannot, ask one clarifying question. Repeat until you can.
- If mid-task the defined outcome turns out to be wrong, surface it before continuing — not after.

## Progressive Retrieval

Before starting work, retrieve relevant knowledge from the Context Tree using the 5-tier strategy:

1. **Tier 0-1 (Cache):** Check if you already have relevant context from this session. Don't re-read what you already know.
2. **Tier 2 (Direct Search):** Search `.mythos/memory/context-tree/` for entries matching the task:
   - `Glob` by domain/topic path for known areas
   - `Grep` for task-related terms in entry titles, tags, and content
3. **Tier 3 (Deep Read):** If matches found, read entries fully. Follow `relations` links to related entries for cross-context.
4. **Tier 4 (Full Traversal):** For novel tasks with no direct matches, read domain summaries (`context.md` files), then explore relevant topics.

**Constraint check:** Always search `constraints/` domain for rules applicable to the task. Violations of `invariant` constraints are hard blocks.

**Lesson check:** Search `lessons/` domain for past failures on similar tasks. Don't repeat known mistakes.

**Out-of-domain:** If no relevant knowledge exists in the Context Tree, say so explicitly. Proceed with general knowledge but flag the gap.

## Output Contract

- Scoreable outcome defined before first file edit
- Work meets `.mythos/context/standards.md` quality bar
- Non-trivial decisions logged via `/mythos:remember` → Context Tree
- Output scored against `.mythos/context/evaluation-rubrics.md` — score reported with dimensional breakdown
- If retrieval found relevant entries, cite them in the score report

**Skill creation mode:** When asked to create a skill — generate the skill, write 3 synthetic evaluation tests against it, score them against evaluation-rubrics.md, only write the file if ≥2 tests score ≥75.

**Trust yourself:** A typo needs no process. A new data model needs a logged decision. Judge the scope.
