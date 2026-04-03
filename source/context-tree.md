# Context Tree — Knowledge Structure Specification

**Version:** 1.0
**Used by:** `/mythos:remember` (curation), `/mythos:do` (retrieval), `/mythos:status` (dashboard)

The Context Tree is MythOS's hierarchical file-based knowledge graph, inspired by ByteRover's agent-native memory architecture. Knowledge is organized as **Domain > Topic > Subtopic > Entry**, where each entry is a standalone markdown file with structured frontmatter.

---

## Design Principles

1. **Agent-native** — The same LLM that reasons about a task curates, structures, and retrieves knowledge. No external pipelines.
2. **File-based** — All knowledge stored as human-readable markdown. Version-controllable, portable, zero infrastructure.
3. **Hierarchical** — Domain > Topic > Subtopic > Entry. Each level has a `context.md` summary auto-generated during curation.
4. **Explicit relations** — Entries link to each other via `@relation` annotations in frontmatter, not implicit embedding similarity.
5. **Lifecycle-aware** — Every entry carries importance scoring, maturity tiers, and recency decay via Adaptive Knowledge Lifecycle (AKL).

---

## Directory Structure

```
.mythos/memory/context-tree/
├── architecture/              # Domain: architectural decisions & patterns
│   ├── context.md             # Auto-generated domain summary
│   ├── decisions/             # Topic: key architectural choices
│   │   ├── context.md         # Topic summary
│   │   └── *.md               # Individual entries
│   └── patterns/              # Topic: conventions and patterns
│       ├── context.md
│       └── *.md
├── constraints/               # Domain: hard rules (invariant/policy/preference)
│   ├── context.md
│   ├── invariant/
│   ├── policy/
│   └── preference/
├── lessons/                   # Domain: failure patterns and near-misses
│   ├── context.md
│   └── [topic]/
├── operations/                # Domain: session state and audit history
│   ├── context.md
│   ├── session/
│   └── audit-history/
├── outcomes/                  # Domain: high-scoring outputs (≥75)
│   ├── context.md
│   ├── skills/
│   └── agents/
├── observations/              # Domain: recurring patterns
│   ├── context.md
│   └── [topic]/
└── hypotheses/                # Domain: ideas under investigation
    ├── context.md
    └── [topic]/
```

---

## Knowledge Entry Format

Each entry is a standalone markdown file with structured YAML frontmatter:

```markdown
---
id: unique-slug
domain: architecture
topic: decisions
created: 2026-04-03T10:00:00Z
updated: 2026-04-03T10:00:00Z
author: claude
importance: 50
maturity: draft
access_count: 0
update_count: 0
relations:
  - target: constraints/invariant/no-raw-sql.md
    type: enforces
    reason: "Decision made to comply with the no-raw-SQL constraint"
tags: [database, repository-pattern]
---

# Entry Title

## Provenance
- **Task:** [What task led to this knowledge]
- **Sources:** [Files, URLs, or conversations that contributed]
- **Reason:** [Why this knowledge was stored]

## Content
[The actual knowledge — interpreted, structured, not raw dump]

## Alternatives Considered
[If a decision: what was rejected and why]

## Snippets
[Code, formulas, or raw data relevant to this entry]
```

### Required Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique slug (kebab-case, derived from title) |
| `domain` | string | Top-level domain (architecture, constraints, lessons, etc.) |
| `topic` | string | Second-level topic within domain |
| `created` | ISO 8601 | When the entry was first created |
| `updated` | ISO 8601 | When the entry was last modified |
| `author` | string | Who created it (usually `claude`) |
| `importance` | number (0-100) | AKL importance score |
| `maturity` | enum | `draft`, `validated`, or `core` |
| `access_count` | number | Times this entry has been read for retrieval |
| `update_count` | number | Times this entry has been modified |
| `relations` | array | Explicit links to other entries |
| `tags` | array | Freeform tags for search |

---

## Context Summary Files

Each domain and topic directory contains a `context.md` file — an auto-generated summary of its contents. These summaries are loaded at session start instead of all entries, providing ambient awareness without context overload.

```markdown
---
type: context-summary
domain: architecture
entry_count: 12
last_updated: 2026-04-03T10:00:00Z
---

# Architecture — Summary

This domain contains 12 entries across 2 topics:
- **decisions** (8 entries) — Key architectural choices including data access patterns, auth strategy, and API design
- **patterns** (4 entries) — Conventions for file structure, naming, and module boundaries

## Key Entries (core maturity)
- `decisions/repo-pattern.md` — Repository pattern for all data access
- `decisions/auth-strategy.md` — JWT + refresh token authentication

## Recent Activity
- Last entry: `patterns/error-handling.md` (2026-04-02)
- Most accessed: `decisions/repo-pattern.md` (15 accesses)
```

---

## Curate Operations

Five atomic operations for managing the Context Tree:

| Operation | Behavior | When to Use |
|-----------|----------|-------------|
| **ADD** | Create new entry; auto-generate/update `context.md` at each hierarchy level | New knowledge that doesn't exist yet |
| **UPDATE** | Replace content of an existing entry; bump `update_count` and `importance` | Refining or correcting existing knowledge |
| **UPSERT** | Add if new, update if exists | When unsure if entry already exists |
| **MERGE** | Combine two entries intelligently; delete the source | Consolidating duplicate or overlapping knowledge |
| **DELETE** | Remove a single entry or an entire subtree | Obsolete or incorrect knowledge |

Every operation carries a `reason` field that serves as an audit trail.

---

## Domain Routing Rules

When `/mythos:remember` receives input, it routes to the correct domain:

| Input Type | Domain | Topic (default) |
|------------|--------|-----------------|
| Session state (in-flight, next steps) | `operations` | `session` |
| Hard constraint (non-negotiable rule) | `constraints` | `invariant` / `policy` / `preference` |
| Architectural decision (alternatives + tradeoffs) | `architecture` | `decisions` |
| High-scoring output (score ≥ 75) | `outcomes` | `skills` / `agents` |
| Recurring pattern or observation | `observations` | auto-detected topic |
| Lesson from failure or near-miss | `lessons` | auto-detected topic |
| Idea under investigation | `hypotheses` | auto-detected topic |
| Audit score history | `operations` | `audit-history` |
