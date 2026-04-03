---
name: mythos:do
description: Use for every task. Outcome-first execution with progressive retrieval, taste-aware coding, inline memory curation, and self-scoring.
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

## Taste-Aware Execution

If `~/.mythos/taste/profile.md` exists, apply the human's preferences during execution:
- Use their naming conventions (`naming` patterns)
- Follow their structural preferences (`architecture` patterns)
- Match their verbosity level (`verbosity` patterns)
- Avoid patterns they consistently reject

Taste preferences are soft — deviate with good reason, but default to matching the human's style.

## Memory Curation (inline)

During and after work, curate knowledge into the Context Tree. You are the curator — the same LLM that reasons about the task decides what to store, where to place it, what it relates to, and why.

### Curate Operations

| Operation | When | Behavior |
|-----------|------|----------|
| **ADD** | New knowledge | Create entry file + update domain `context.md` |
| **UPDATE** | Refine existing | Edit content, bump `importance` +5, increment `update_count` |
| **UPSERT** | Unsure if exists | Search first — ADD if new, UPDATE if found |
| **MERGE** | Overlapping entries | Combine two entries, delete the source |
| **DELETE** | Obsolete/wrong | Remove entry, clean up relations |

### Routing Rules

| Input Type | Domain Path | Default Topic |
|------------|-------------|---------------|
| Session state (in-flight, next steps) | `operations/session/` | `current.md` (overwrite) |
| Hard constraint (non-negotiable rule) | `constraints/` | `invariant/`, `policy/`, or `preference/` |
| Architectural decision (alternatives + tradeoffs) | `architecture/decisions/` | auto from title |
| High-scoring output (score ≥ 75) | `outcomes/` | `skills/` or `agents/` |
| Recurring pattern or observation | `observations/` | auto-detected topic |
| Lesson from failure or near-miss | `lessons/` | auto-detected topic |
| Idea under investigation | `hypotheses/` | auto-detected topic |
| Audit score entry | `operations/audit-history/` | dated entry |

### Entry Format

Every entry at `.mythos/memory/context-tree/[domain]/[topic]/[slug].md`:

```markdown
---
id: [kebab-case-slug]
domain: [domain]
topic: [topic]
created: [ISO 8601]
updated: [ISO 8601]
author: claude
importance: 50
maturity: draft
access_count: 0
update_count: 0
relations:
  - target: [path-to-related-entry]
    type: [depends-on|enforces|supersedes|related-to|derived-from|conflicts-with|extends]
    reason: "[why]"
tags: [relevant, tags]
---

# [Title]

## Provenance
- **Task:** [originating task]
- **Sources:** [files, URLs, conversations]
- **Reason:** [why stored]

## Content
[The knowledge — interpreted and structured]

## Snippets
[Code, formulas, data if relevant]
```

### AKL on Write

- **ADD**: importance 50, maturity draft, counts 0
- **UPDATE**: importance min(100, current + 5), increment update_count
- **ACCESS**: importance min(100, current + 3), increment access_count
- Check maturity: draft→validated at ≥65, validated→core at ≥85, core→validated at <60, validated→draft at <35

### Relation Linking

After writing: search existing entries for shared concepts, add relations (1-3 per entry), update `.relations-index.json`.

### Before Writing

Search Context Tree for duplicates. UPDATE or MERGE instead of ADD when possible.

## Output Contract

- Scoreable outcome defined before first file edit
- Work meets `.mythos/context/standards.md` quality bar
- Non-trivial decisions curated to Context Tree during work
- Output scored against `.mythos/context/evaluation-rubrics.md` — score reported with dimensional breakdown
- If retrieval found relevant entries, cite them in the score report
- If taste profile influenced execution, note which preferences were applied
- Session state updated in `operations/session/current.md` after significant work

**Skill creation mode:** When asked to create a skill — generate the skill, write 3 synthetic evaluation tests against it, score them against evaluation-rubrics.md, only write the file if ≥2 tests score ≥75.

**Trust yourself:** A typo needs no process. A new data model needs a logged decision. Judge the scope.
