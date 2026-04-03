---
name: mythos:remember
description: Agent-native memory curation. Routes input to the Context Tree with structured operations, AKL metadata, and relation linking.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /mythos:remember

Curate knowledge into the Context Tree. You are the curator — the same LLM that reasons about the task decides what to store, where to place it, what it relates to, and why it matters.

## Curate Operations

Use one of five atomic operations:

| Operation | When | Behavior |
|-----------|------|----------|
| **ADD** | New knowledge | Create entry file + update domain `context.md` |
| **UPDATE** | Refine existing | Edit entry content, bump `importance` +5, increment `update_count` |
| **UPSERT** | Unsure if exists | Search first — ADD if new, UPDATE if found |
| **MERGE** | Overlapping entries | Combine two entries into one, delete the source |
| **DELETE** | Obsolete/wrong | Remove entry, clean up relations index |

## Routing Rules

Route input to the correct Context Tree domain:

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

## Entry Format

Every entry is a markdown file at `.mythos/memory/context-tree/[domain]/[topic]/[slug].md`:

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
  - target: [relative-path-to-related-entry]
    type: [depends-on|enforces|supersedes|related-to|derived-from|conflicts-with|extends]
    reason: "[why this link exists]"
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

## AKL Metadata

Apply Adaptive Knowledge Lifecycle on every write:

- **ADD**: `importance: 50`, `maturity: draft`, counts at 0
- **UPDATE**: `importance: min(100, current + 5)`, increment `update_count`
- **ACCESS** (when read for retrieval): `importance: min(100, current + 3)`, increment `access_count`

After any importance change, check maturity transitions:
- `draft → validated` when effective importance ≥ 65
- `validated → core` when effective importance ≥ 85
- `core → validated` when effective importance < 60
- `validated → draft` when effective importance < 35

Effective importance = `importance × 0.995^(days_since_last_event)`

## Relation Linking

After writing an entry:
1. Search existing entries for shared concepts (Glob by domain, Grep by tags/content)
2. For each meaningful connection, add to the entry's `relations` frontmatter
3. Update `.mythos/memory/context-tree/.relations-index.json` with forward + backward links
4. Aim for 1-3 relations per entry. More than 5 → consider splitting.

Relation types: `depends-on`, `enforces`, `supersedes`, `related-to`, `derived-from`, `conflicts-with`, `extends`

## Context Summary Updates

After any curate operation, update the domain's `context.md`:
- Entry count
- Topic listing with counts
- Key entries (core maturity)
- Recent activity

## Before Writing

1. Search the Context Tree for duplicates (Glob + Grep on title and key terms)
2. If duplicate found: UPDATE or MERGE instead of ADD
3. If related entries found: add relations

## Output Contract

One block, exactly this format:
```
▸ [OPERATION] → [file-path]
  reason: [why this was stored here]
  importance: [score] · maturity: [tier]
  relations: [N] links ([list of relation types])
```
