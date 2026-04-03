# ByteRover × MythOS — Implementation Plan

**Paper:** "ByteRover: Agent-Native Memory Through LLM-Curated Hierarchical Context"
**Authors:** Andy Nguyen, Danh Doan, Hoang Pham, Bao Ha, Dat Pham, Linh Nguyen, Hieu Nguyen, Thien Nguyen, Cuong Do, Phat Nguyen, Toan Nguyen (ByteRover)
**Source:** arxiv.org/abs/2604.01599

---

## Why ByteRover Is a Natural Fit

Both MythOS and ByteRover share the same core philosophy:
- **Trust the LLM to curate its own knowledge** — no external embedding/chunking pipelines
- **Markdown files on the local filesystem** as the knowledge store
- **Provenance and explicit reasoning** over opaque embeddings
- **Zero external infrastructure** — no vector DB, no graph DB, no embedding service

The key difference: MythOS uses **flat memory files** (`decisions.md`, `lessons.md`) that will become unwieldy as projects grow. ByteRover's **Context Tree** architecture solves this scaling problem while preserving MythOS's trust-first philosophy.

---

## Key ByteRover Concepts

| Concept | Description |
|---------|-------------|
| **Context Tree** | Hierarchical file-based knowledge graph: `Domain > Topic > Subtopic > Entry` |
| **Adaptive Knowledge Lifecycle (AKL)** | Importance scoring (0-100), maturity tiers (`draft → validated → core`), recency decay |
| **5-Tier Progressive Retrieval** | Cache → fuzzy cache → BM25 search → single LLM call → full agentic loop |
| **Relation Graph** | `@relation` annotations between entries forming a navigable knowledge graph |
| **Curate Operations** | ADD, UPDATE, UPSERT, MERGE, DELETE — atomic ops with stateful feedback |
| **Out-of-Domain Detection** | Explicitly signals when queries fall outside stored knowledge |
| **Stateful Feedback Loop** | Per-operation status so the agent can reason about failures and adapt |

---

## Mapping to MythOS

| ByteRover Concept | Current MythOS | Upgrade Path |
|---|---|---|
| **Context Tree** | Flat files (`decisions.md`, `lessons.md`) | Restructure `.mythos/memory/` as hierarchical tree |
| **AKL** | No lifecycle management | YAML frontmatter with `importance`, `maturity`, `last_accessed`, `decay` |
| **5-Tier Retrieval** | Claude reads ALL memory at session start | Progressive retrieval — serve from cache/index first |
| **Relation Graph** | Memory files are isolated silos | `@relation` annotations linking entries across domains |
| **Structured Entries** | Freeform markdown entries | Standardized format with provenance, narrative, snippets |
| **Curate Operations** | `/mythos:remember` routes to a flat file | Atomic operations with status feedback |
| **OOD Detection** | Not present | Signal when queries fall outside stored knowledge |

---

## Phase 1 — Context Tree (Memory Restructuring)

**Goal:** Replace flat memory files with a hierarchical Context Tree.

### New Directory Structure
```
.mythos/memory/context-tree/
├── architecture/           # Domain: architectural decisions
│   ├── context.md          # Auto-generated domain summary
│   ├── patterns/           # Topic: patterns and conventions
│   │   ├── context.md      # Topic summary
│   │   └── [entries].md    # Individual knowledge entries
│   └── decisions/          # Topic: key decisions
│       ├── context.md
│       └── [entries].md
├── constraints/            # Domain: hard rules
│   ├── context.md
│   ├── invariant/
│   ├── policy/
│   └── preference/
├── lessons/                # Domain: failure patterns
│   ├── context.md
│   └── [topic]/
├── operations/             # Domain: session & workflow state
│   ├── context.md
│   ├── session/
│   └── audit-history/
├── outcomes/               # Domain: high-scoring outputs
│   ├── context.md
│   ├── skills/
│   └── agents/
└── observations/           # Domain: recurring patterns
    ├── context.md
    └── [topic]/
```

### Knowledge Entry Format
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
relations:
  - target: constraints/invariant/no-raw-sql.md
    type: enforces
    reason: "This decision was made to comply with the no-raw-SQL constraint"
tags: [database, repository-pattern]
---

# Repository Pattern for Data Access

## Provenance
- **Task:** Implement user authentication
- **Sources:** /src/models/user.ts, /src/routes/auth.ts
- **Reason:** Centralize data access to enable caching and audit logging

## Content
Adopted repository pattern for all database access. Route handlers never
execute raw queries — all access goes through typed repository methods.

## Alternatives Considered
- Direct Prisma calls in route handlers — rejected: no audit trail
- GraphQL resolvers — rejected: adds complexity for internal API

## Snippets
```typescript
// src/repositories/user.repository.ts
export class UserRepository {
  async findById(id: string): Promise<User | null> { ... }
}
```
```

### Changes Required
- **`/mythos:remember`** — Updated to route entries into Context Tree with curate operations (ADD/UPDATE/UPSERT/MERGE/DELETE)
- **`CLAUDE.md`** — Updated session start to load Context Tree summaries instead of flat files
- **Installer** — Creates Context Tree skeleton instead of flat memory files
- **New file: `source/context-tree.md`** — Documents the Context Tree structure and entry format

---

## Phase 2 — Adaptive Knowledge Lifecycle (AKL)

**Goal:** Entries self-organize via importance scoring, maturity tiers, and recency decay.

### Lifecycle Metadata (in YAML frontmatter)
```yaml
importance: 50          # 0-100, tracks value over time
maturity: draft         # draft → validated → core
last_accessed: 2026-04-03T10:00:00Z
access_count: 0
update_count: 0
```

### Importance Scoring
- Access event: +3 bonus
- Update event: +5 bonus
- Daily decay factor: 0.995 (prevents unbounded accumulation)

### Maturity Tiers (with hysteresis)
| Transition | Threshold | Demotion |
|---|---|---|
| `draft → validated` | importance ≥ 65 | importance < 35 |
| `validated → core` | importance ≥ 85 | importance < 60 |

### Recency Decay
```
recency_score = exp(-days_since_update / 30)
```
Half-life of ~21 days. Entries not accessed or updated decay naturally.

### Compound Retrieval Score
```
Score(entry, query) = w_r * relevance + w_i * normalized_importance + w_t * recency_score
```

### Changes Required
- **`/mythos:remember`** — Applies AKL metadata on every write; updates importance on access
- **`/mythos:status`** — Shows maturity distribution and decaying entries
- **`/mythos:evolve`** — Considers AKL when evaluating knowledge quality; promotes/demotes entries
- **New file: `source/akl-spec.md`** — Documents AKL scoring rules

---

## Phase 3 — Progressive Retrieval

**Goal:** Stop loading all memory at session start. Use tiered strategy to minimize latency.

### 5-Tier Strategy

| Tier | Mechanism | Latency | When |
|---|---|---|---|
| 0 | Exact cache hit | ~0ms | Hash match on query |
| 1 | Fuzzy cache (Jaccard similarity) | ~50ms | Jaccard ≥ 0.6 |
| 2 | Direct search (BM25 on file content) | ~100ms | High-confidence match with score gap |
| 3 | Optimized LLM call with pre-fetched context | < 5s | Medium-confidence match |
| 4 | Full agentic reasoning loop | 8-15s | Novel or ambiguous queries |

### Out-of-Domain Detection
When query terms don't match any entry and score < threshold, explicitly signal:
"This query appears outside the scope of stored knowledge."

### Changes Required
- **`CLAUDE.md`** — Session start loads only domain summaries (context.md files), not all entries
- **`/mythos:do`** — Uses progressive retrieval to fetch relevant memory instead of reading everything
- **`/mythos:remember`** — Maintains a query cache and search index metadata
- **New file: `source/retrieval-spec.md`** — Documents the 5-tier retrieval strategy

---

## Phase 4 — Relation Graph

**Goal:** Explicit `@relation` annotations between entries form a navigable knowledge graph.

### Relation Types
| Type | Meaning | Example |
|---|---|---|
| `depends-on` | This entry depends on another | Decision depends on a constraint |
| `enforces` | This entry enforces another | Constraint enforces an invariant |
| `supersedes` | This entry replaces another | Updated decision supersedes old one |
| `related-to` | General association | Lesson relates to a decision |
| `derived-from` | Created from another entry | Outcome derived from a sprint item |
| `conflicts-with` | Tension between entries | Two constraints that create tradeoffs |

### Bidirectional Index
Each entry's `relations` field in frontmatter creates forward links. A backlinks index
is maintained as `.mythos/memory/context-tree/.relations-index.json`:
```json
{
  "architecture/decisions/repo-pattern.md": {
    "forward": [
      {"target": "constraints/invariant/no-raw-sql.md", "type": "enforces"}
    ],
    "backward": [
      {"source": "outcomes/skills/auth-implementation.md", "type": "derived-from"}
    ]
  }
}
```

### Graph Traversal in Skills
- **`/mythos:audit`** — Follows relation edges for multi-hop reasoning (e.g., "this code violates a constraint that was created because of a past lesson")
- **`/mythos:evolve`** — Uses relation graph to identify tightly-coupled entries that should evolve together
- **`/mythos:remember`** — Auto-suggests relations when creating new entries based on content similarity to existing entries

### Changes Required
- **Entry format** — `relations` field in YAML frontmatter
- **`/mythos:remember`** — Suggests and creates relations on curate operations
- **`/mythos:audit`** — Traverses relation graph for deeper analysis
- **New file: `source/relations-spec.md`** — Documents relation types and graph traversal rules

---

## Implementation Priority

1. **Phase 1 (Context Tree)** — Foundation. Everything else builds on hierarchical structure.
2. **Phase 2 (AKL)** — Makes entries self-organizing. Prevents memory bloat.
3. **Phase 3 (Progressive Retrieval)** — Performance. Critical as Context Tree grows.
4. **Phase 4 (Relation Graph)** — Intelligence. Enables multi-hop reasoning and cross-entry navigation.

---

## What We're NOT Implementing

- **MiniSearch full-text index** — ByteRover uses this for sub-100ms BM25. MythOS operates through Claude, which can search files directly. The spec describes the *strategy*, and Claude executes it using Glob/Grep.
- **Socket.IO daemon / task queue** — ByteRover runs as a persistent service. MythOS is a Claude Code harness — the agent IS the process.
- **Query cache as a data structure** — Claude's context window serves as the working cache. The spec describes when to escalate, not how to implement in-memory caches.

The implementation adapts ByteRover's *concepts* to MythOS's *trust-first, file-based* paradigm. The LLM reads the specs and executes them — that's the whole point of agent-native memory.
