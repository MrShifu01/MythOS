# Adaptive Knowledge Lifecycle (AKL) Specification

**Version:** 1.0
**Used by:** `/mythos:remember` (write-path), `/mythos:do` (retrieval scoring), `/mythos:evolve` (lifecycle management)

The Adaptive Knowledge Lifecycle governs how knowledge entries evolve over time. Entries earn importance through access and updates, progress through maturity tiers, and decay when unused — enabling the Context Tree to self-organize.

---

## Importance Scoring

Each entry carries an `importance` score in [0, 100] that tracks its value over time.

### Score Events

| Event | Bonus | When |
|-------|-------|------|
| Access (read for retrieval) | +3 | Entry returned as part of a query result |
| Update (content modified) | +5 | Entry content changed via UPDATE or UPSERT |
| Creation | initial: 50 | New entry starts at baseline importance |

### Daily Decay

A decay factor of **0.995** is applied conceptually to prevent unbounded accumulation:

```
importance_effective = importance × 0.995^(days_since_last_event)
```

This means:
- After 7 days of inactivity: importance × 0.965 (~3.5% loss)
- After 30 days: importance × 0.860 (~14% loss)
- After 90 days: importance × 0.637 (~36% loss)

Decay is applied lazily — calculated on read, not via background process.

---

## Maturity Tiers

Entries progress through three maturity tiers based on importance, with **hysteresis gaps** to prevent rapid oscillation:

```
draft ──────────────────→ validated ──────────────────→ core
       importance ≥ 65              importance ≥ 85
       
core ───────────────────→ validated ──────────────────→ draft
       importance < 60              importance < 35
```

| Tier | Meaning | Promotion Threshold | Demotion Threshold | Hysteresis Gap |
|------|---------|--------------------|--------------------|----------------|
| `draft` | New or unverified knowledge | — | importance < 35 (from validated) | 30 |
| `validated` | Accessed multiple times, proven useful | importance ≥ 65 | importance < 60 (from core) | 25 |
| `core` | Foundational knowledge, frequently referenced | importance ≥ 85 | — | — |

### Tier Behaviors

- **draft** entries are loaded only when specifically queried (Tier 2+ retrieval)
- **validated** entries are included in topic-level context summaries
- **core** entries are always loaded in domain-level context summaries and at session start

---

## Recency Decay

A separate time-dependent score captures freshness:

```
recency_score = exp(-days_since_update / 30)
```

| Days Since Update | Recency Score |
|-------------------|---------------|
| 0 | 1.000 |
| 7 | 0.792 |
| 14 | 0.628 |
| 21 | 0.497 (~half-life) |
| 30 | 0.368 |
| 60 | 0.135 |
| 90 | 0.050 |

---

## Compound Retrieval Score

When retrieving entries for a query, the compound score combines search relevance with lifecycle signals:

```
Score(entry, query) = w_r × relevance + w_i × normalized_importance + w_t × recency_score
```

Default weights:
- `w_r` = 0.6 (search relevance dominates)
- `w_i` = 0.25 (importance matters for tiebreaking)
- `w_t` = 0.15 (recency provides freshness signal)

Where `normalized_importance = importance / 100` and `relevance` is determined by the retrieval tier (exact match = 1.0, fuzzy match = Jaccard score, search = BM25 normalized score).

---

## AKL Operations in `/mythos:remember`

When curating knowledge, `/mythos:remember` applies AKL as follows:

### On ADD
```yaml
importance: 50          # baseline
maturity: draft         # all new entries start as draft
access_count: 0
update_count: 0
```

### On UPDATE
```yaml
importance: min(100, current + 5)
update_count: current + 1
updated: [now]
# Maturity promotion check triggered
```

### On ACCESS (read for retrieval)
```yaml
importance: min(100, current + 3)
access_count: current + 1
last_accessed: [now]
# Maturity promotion check triggered
```

### Maturity Check (after any importance change)
```
effective_importance = importance × 0.995^(days_since_last_event)

if maturity == "draft" and effective_importance >= 65:
    maturity = "validated"
elif maturity == "validated" and effective_importance >= 85:
    maturity = "core"
elif maturity == "core" and effective_importance < 60:
    maturity = "validated"
elif maturity == "validated" and effective_importance < 35:
    maturity = "draft"
```

---

## Lifecycle in `/mythos:status`

The status dashboard includes AKL summary:

```
  context tree   [N] entries ([C] core, [V] validated, [D] draft)
  decaying       [N] entries below importance 35 (candidates for archival)
  most accessed  [entry-id] ([N] accesses)
```

---

## Lifecycle in `/mythos:evolve`

The evolve engine considers AKL when evaluating knowledge quality:
- Entries with high access but low importance may need content improvement
- Entries stuck at `draft` maturity for >30 days may need review or deletion
- `core` entries that haven't been accessed in 60+ days may need re-validation
