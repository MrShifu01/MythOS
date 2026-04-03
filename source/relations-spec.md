# Relation Graph Specification

**Version:** 1.0
**Used by:** `/mythos:remember` (relation creation), `/mythos:audit` (graph traversal), `/mythos:evolve` (coupled evolution)

The Relation Graph connects Context Tree entries via explicit, author-stated semantic links. Unlike embedding-based implicit similarity, these edges represent deliberate connections — the LLM decided these concepts are related and stated why.

---

## Design Principles

1. **Explicit over implicit** — Every relation has a stated `reason`. No hidden similarity scores.
2. **Bidirectional** — Forward links (source → target) automatically create backlinks (target → source).
3. **Typed** — Each relation has a semantic type that guides traversal behavior.
4. **Sparse** — Only create relations that add navigational value. Not everything needs to link to everything.

---

## Relation Types

| Type | Meaning | Direction | Example |
|------|---------|-----------|---------|
| `depends-on` | This entry requires another to be understood | A depends on B | Decision depends on a constraint |
| `enforces` | This entry enforces or implements another | A enforces B | Code pattern enforces a security constraint |
| `supersedes` | This entry replaces another (marks target as stale) | A supersedes B | Updated decision replaces old one |
| `related-to` | General semantic association | Bidirectional | Lesson relates to a decision |
| `derived-from` | Created as a result of another entry | A derived from B | Outcome derived from a sprint item |
| `conflicts-with` | Tension or contradiction between entries | Bidirectional | Two constraints that create tradeoffs |
| `extends` | This entry adds to or specializes another | A extends B | A topic-specific pattern extends a general one |

---

## Relation Format in Frontmatter

Relations are declared in the entry's YAML frontmatter:

```yaml
relations:
  - target: constraints/invariant/no-raw-sql.md
    type: enforces
    reason: "This pattern was adopted to comply with the no-raw-SQL constraint"
  - target: lessons/security/sql-injection-incident.md
    type: derived-from
    reason: "Decision motivated by the SQL injection incident in sprint 3"
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `target` | Yes | Relative path from `context-tree/` root to the target entry |
| `type` | Yes | One of the defined relation types |
| `reason` | Yes | Why this relation exists — stated by the curating LLM |

---

## Bidirectional Reference Index

The relation graph maintains a JSON index at `.mythos/memory/context-tree/.relations-index.json` for O(1) lookup:

```json
{
  "architecture/decisions/repo-pattern.md": {
    "forward": [
      {
        "target": "constraints/invariant/no-raw-sql.md",
        "type": "enforces",
        "reason": "Pattern adopted to comply with no-raw-SQL constraint"
      }
    ],
    "backward": [
      {
        "source": "outcomes/skills/auth-implementation.md",
        "type": "derived-from",
        "reason": "Auth implementation followed this pattern"
      }
    ]
  }
}
```

### Index Maintenance

The index is updated by `/mythos:remember` on every curate operation:
- **ADD**: Insert forward links from the new entry; insert backlinks in target entries
- **UPDATE**: Diff relations; remove stale links, add new ones
- **DELETE**: Remove all forward and backward links involving the deleted entry
- **MERGE**: Combine relations from both entries; deduplicate

---

## Graph Traversal Patterns

### 1. Impact Analysis — "What depends on this?"
Follow `backward` links of type `depends-on`, `enforces`, `derived-from`:
```
constraint/invariant/no-raw-sql.md
  ← enforces ← architecture/decisions/repo-pattern.md
  ← enforces ← architecture/patterns/query-builder.md
  ← derived-from ← lessons/security/sql-injection.md
```
**Use case:** Before modifying a constraint, understand what breaks.

### 2. Root Cause — "Why does this exist?"
Follow `forward` links of type `derived-from`, `depends-on`:
```
architecture/decisions/repo-pattern.md
  → derived-from → lessons/security/sql-injection.md
  → enforces → constraints/invariant/no-raw-sql.md
```
**Use case:** Understanding the reasoning chain behind a decision.

### 3. Conflict Detection — "What creates tension?"
Find all `conflicts-with` relations:
```
constraints/policy/fast-deploys.md
  ↔ conflicts-with ↔ constraints/policy/full-test-suite.md
```
**Use case:** Identifying tradeoffs during `/mythos:audit`.

### 4. Staleness Propagation — "What's outdated?"
When an entry is marked `supersedes`, follow backward links to find entries that may also be stale:
```
architecture/decisions/auth-v2.md
  → supersedes → architecture/decisions/auth-v1.md
  
architecture/decisions/auth-v1.md
  ← derived-from ← outcomes/skills/old-auth-flow.md  ← POTENTIALLY STALE
```
**Use case:** `/mythos:evolve` identifies cascading staleness.

---

## Relation Creation in `/mythos:remember`

When creating or updating an entry, `/mythos:remember` follows this process:

1. **Analyze content** — Identify concepts, entities, and decisions mentioned
2. **Search existing entries** — Find entries in the Context Tree that share concepts
3. **Suggest relations** — For each potential link, determine:
   - Is this a meaningful connection? (not everything should link)
   - What type best describes the relationship?
   - Why does this link add navigational value?
4. **Declare in frontmatter** — Add relations to the entry's YAML
5. **Update index** — Rebuild forward/backward links in `.relations-index.json`

### Relation Density Guidelines
- **Constraints** typically have many backward links (things that enforce them)
- **Decisions** typically link forward to constraints and backward to lessons
- **Lessons** typically link forward to decisions they motivated
- **Outcomes** typically link back to the decisions/patterns they followed
- **Observations** link to related lessons or hypotheses
- Aim for 1-3 relations per entry. More than 5 suggests the entry should be split.

---

## Graph in `/mythos:audit`

During audit, the relation graph enables multi-hop reasoning:

1. For each dimension being scored, identify relevant constraint entries
2. Follow `enforces` links to find which decisions/patterns implement those constraints
3. Check `conflicts-with` links for unresolved tensions
4. Follow `derived-from` chains to understand the provenance of current patterns
5. Score not just the code, but the coherence of the knowledge backing it

---

## Graph in `/mythos:evolve`

The evolve engine uses relations to identify tightly-coupled entries:

- Entries connected by `depends-on` or `enforces` should evolve together
- When improving a standard, check what `enforces` it and whether those need updating too
- `supersedes` chains indicate knowledge that needs cleanup (archive old versions)
- Orphan entries (no relations) may indicate knowledge that's isolated and possibly stale
