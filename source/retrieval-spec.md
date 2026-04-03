# 5-Tier Progressive Retrieval Specification

**Version:** 1.0
**Used by:** `/mythos:do` (task retrieval), `/mythos:audit` (knowledge-informed scoring), session start (context loading)

Progressive retrieval minimizes context loading by resolving most queries at the lowest possible cost. Instead of loading all memory at session start, the agent loads domain summaries and escalates to deeper retrieval only when needed.

---

## Design Principles

1. **Load summaries, not everything** — Session start reads `context.md` files (domain summaries), not all entries
2. **Escalate progressively** — Start with cached/indexed results, only invoke deep search for novel queries
3. **Signal uncertainty** — When knowledge doesn't exist, say so explicitly (out-of-domain detection)
4. **Cache repeated patterns** — Agents ask variations of similar questions; cache absorbs the repetition

---

## The 5 Tiers

### Tier 0 — Exact Cache Hit (~0ms)
**Mechanism:** Check if this exact query (or a semantically identical one) was answered recently in this session.
**How in MythOS:** The agent remembers what it already retrieved in the current conversation. If it already read an entry, it doesn't re-read it.
**Condition:** Agent recognizes it already has the answer in its context window.

### Tier 1 — Fuzzy Cache (~50ms)
**Mechanism:** The query is a rephrasing of a recently answered question.
**How in MythOS:** The agent recognizes the query is a variation of something it already answered. Uses its reasoning to connect the rephrased question to existing context.
**Condition:** Agent judges the query is substantially similar to a recent one.

### Tier 2 — Direct Search (~100ms)
**Mechanism:** Search the Context Tree using file names, tags, and content via Glob/Grep.
**How in MythOS:** Agent uses `Glob` to find entries by domain/topic path, `Grep` to search entry content and tags. High-confidence results (clear match with no ambiguity) are returned directly.
**Condition:** Query maps clearly to a domain/topic, and matching entries are found.

### Tier 3 — Optimized Deep Read (< 5s)
**Mechanism:** Read matching entries fully, cross-reference with related entries via relation graph.
**How in MythOS:** Agent reads the matched entries, follows `relations` links to related entries, and synthesizes an answer from the combined context.
**Condition:** Multiple potential matches found, or match requires cross-referencing.

### Tier 4 — Full Agentic Reasoning (8-15s)
**Mechanism:** Full traversal of the Context Tree with multi-step reasoning.
**How in MythOS:** Agent reads domain summaries, identifies relevant topics, reads entries, follows relation chains, and reasons across multiple domains to construct an answer.
**Condition:** Novel query, no direct matches, requires synthesis across domains.

---

## Session Start Protocol

Instead of loading all memory files, the session start protocol loads the **Context Tree skeleton**:

### Always Load (lightweight, ~2KB total)
1. `.mythos/context/product.md` — What the product does
2. `.mythos/context/standards.md` — Quality bar and philosophy
3. `.mythos/memory/context-tree/operations/session/current.md` — Last session state

### Load Domain Summaries (ambient awareness)
4. All `context.md` files at the domain level:
   - `.mythos/memory/context-tree/*/context.md`
   
These summaries tell the agent what knowledge exists without loading full entries.

### Load Core Entries Only
5. Any entry with `maturity: core` — these are foundational knowledge that should always be in context.

### On-Demand (retrieved when needed)
- Individual entries retrieved via Tier 2-4 when a task requires specific knowledge
- Relation graph traversal for multi-hop reasoning
- Full topic contents when auditing a specific dimension

---

## Out-of-Domain Detection

When the agent searches the Context Tree and finds no relevant entries:

### Detection Criteria
- Query terms don't match any entry titles, tags, or content
- No domain/topic path maps to the query subject
- Context summaries don't mention the queried concept

### Response Protocol
Instead of hallucinating from tangential results, the agent explicitly signals:

```
⚠ No relevant knowledge found in the Context Tree for: [query subject]
  This appears outside the scope of stored knowledge.
  
  Options:
  1. Proceed using general knowledge (no memory backing)
  2. Create a new entry via /mythos:remember after researching
  3. Flag as a knowledge gap for the next /mythos:audit
```

This prevents decisions based on mismatched retrievals — an essential property when agents make consequential choices based on stored knowledge.

---

## Retrieval in Each Skill

### `/mythos:do`
Before starting work, retrieves relevant entries:
1. Search for entries matching the task description (Tier 2)
2. Check constraints domain for applicable rules (Tier 2)
3. Check lessons domain for past failures on similar tasks (Tier 2)
4. Follow relations for deeper context if needed (Tier 3)

### `/mythos:audit`
For each dimension being scored:
1. Load domain summary for the relevant area
2. Retrieve all entries tagged with that dimension
3. Follow relation chains to find connected knowledge
4. Use full agentic reasoning for cross-domain synthesis (Tier 4)

### `/mythos:evolve`
When evaluating knowledge quality:
1. Load all domain summaries
2. Identify entries with lifecycle issues (decaying, stuck at draft)
3. Cross-reference with audit scores and outcomes
4. Propose improvements based on evidence across the tree

---

## Cache Strategy

The Context Tree maintains a lightweight query log at `.mythos/memory/context-tree/.query-log.md`:

```markdown
# Query Log
Recent queries and their resolution tiers for cache optimization.

## 2026-04-03
- "What data access pattern do we use?" → Tier 2 → architecture/decisions/repo-pattern.md
- "Are there security constraints for auth?" → Tier 2 → constraints/invariant/auth-*.md
- "Why did we choose JWT over sessions?" → Tier 3 → architecture/decisions/auth-strategy.md + relations
```

This log helps the agent recognize repeated query patterns and serves as input for `/mythos:evolve` to identify knowledge gaps (frequently asked questions with no matching entries).
