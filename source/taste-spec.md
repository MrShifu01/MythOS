# Taste Learning Specification

**Version:** 1.0
**Used by:** `/mythos:taste` (diff analysis), `/mythos:do` (preference-aware execution), `/mythos:evolve` (taste-informed evolution)

Taste learning captures the gap between what Claude produces and what the human actually ships. This is the strongest available signal for calibrating Claude to YOUR preferences — not generic quality rubrics, but YOUR coding style, YOUR architectural instincts, YOUR judgment.

---

## Design Principles

1. **Behavioral, not declared** — Taste is learned from what you DO (edits, accepts, rejects), not what you SAY you want.
2. **Cross-project** — Taste lives at `~/.mythos/` (global), not `.mythos/` (per-project). Every project makes every other project better.
3. **Additive** — Corrections accumulate. Patterns strengthen with repetition. One-off edits are noise; repeated edits are signal.
4. **Non-invasive** — Taste learning reads git history. It doesn't intercept your workflow or require extra steps.

---

## Global Directory Structure

```
~/.mythos/                              # Global — shared across all projects
  taste/
    profile.md                          # Synthesized taste preferences (the output)
    corrections.md                      # Raw correction log (the evidence)
    stats.md                            # Acceptance rates by category
```

---

## How It Works

### Signal Capture

The primary signal is the **git diff between Claude's output and the human's commit**.

```
Claude writes file → Human edits file → Human commits
                     ↑                   ↑
                     THE DELTA            THE SIGNAL
```

`/mythos:taste` analyzes recent git history to find this signal:

1. **Identify Claude-authored changes** — Commits with Claude's authorship or message patterns (e.g., session URLs, known commit message style)
2. **Find human follow-up edits** — Subsequent commits by a human that modify the same files
3. **Extract the delta** — What did the human change? Added error handling? Renamed variables? Restructured logic? Changed styling?
4. **Classify the correction** — What category of taste does this represent?

### Correction Categories

| Category | What It Captures | Example |
|----------|-----------------|---------|
| `style` | Naming, formatting, code structure preferences | "Human always renames `data` to `result`" |
| `architecture` | Structural preferences, where code lives | "Human moves validation from route to service layer" |
| `error-handling` | How errors should be caught and surfaced | "Human always adds specific error types, not generic catch" |
| `simplicity` | Complexity preferences | "Human removes try/catch when function can't actually throw" |
| `verbosity` | Comment and code density preferences | "Human removes docstrings from internal functions" |
| `safety` | Validation and defensive coding preferences | "Human adds null checks Claude omitted" |
| `testing` | Test style and coverage preferences | "Human converts describe/it to flat test() calls" |
| `ux` | UI/UX sensibilities | "Human always adds loading states Claude skipped" |
| `naming` | Naming conventions beyond linting | "Human prefers `isX` for booleans, `handleX` for event handlers" |
| `dependencies` | Library and tool preferences | "Human replaces lodash calls with native methods" |

### Acceptance Classification

For each file Claude touched:

| Outcome | Definition | Signal Strength |
|---------|-----------|-----------------|
| **Accepted** | File committed unchanged (or whitespace-only diff) | Positive — Claude got it right |
| **Corrected** | File committed with meaningful edits | Learning opportunity — extract the pattern |
| **Rejected** | File reverted or deleted before commit | Strong negative — Claude's approach was wrong |
| **Abandoned** | File never committed (still in working tree) | Ambiguous — ignore |

### Pattern Extraction

A correction becomes a **taste pattern** when it's observed multiple times:

```
Observation 1: Human renamed `data` → `result` in auth.ts
Observation 2: Human renamed `data` → `payload` in api.ts  
Observation 3: Human renamed `data` → `response` in fetch.ts

Pattern: Human prefers descriptive names over generic `data`. 
         Use context-specific names: `result`, `payload`, `response`.
Category: naming
Confidence: 3 observations (strong)
```

Patterns require **≥2 observations** to be recorded. Single corrections are logged as raw observations but don't influence the taste profile until reinforced.

---

## Taste Profile Format

The synthesized taste profile at `~/.mythos/taste/profile.md`:

```markdown
---
version: 1
last_updated: 2026-04-03T10:00:00Z
total_corrections: 47
total_accepted: 156
acceptance_rate: 0.77
projects_observed: 3
---

# Taste Profile

## Style
- Prefer descriptive variable names over generic (`result` not `data`, `userCount` not `count`)
  _Confidence: 8 corrections across 2 projects_
- Use early returns over nested if/else
  _Confidence: 5 corrections across 3 projects_

## Architecture
- Validation logic belongs in service layer, not route handlers
  _Confidence: 4 corrections across 2 projects_
- Prefer flat file structure over deep nesting
  _Confidence: 3 corrections in 1 project_

## Error Handling
- Use specific error types, not generic `catch(e)`
  _Confidence: 6 corrections across 2 projects_
- Don't add try/catch around code that can't throw
  _Confidence: 3 corrections in 1 project_

## Simplicity
- Remove abstractions for one-time operations (no premature DRY)
  _Confidence: 4 corrections across 2 projects_
- Inline small utility functions used only once
  _Confidence: 2 corrections in 1 project_

## Verbosity
- No docstrings on internal/private functions
  _Confidence: 7 corrections across 3 projects_
- Comments only where logic isn't self-evident
  _Confidence: 5 corrections across 2 projects_

## Dependencies
- Prefer native JS methods over lodash/underscore equivalents
  _Confidence: 3 corrections in 1 project_
```

---

## Corrections Log Format

Raw corrections at `~/.mythos/taste/corrections.md`:

```markdown
---
total_entries: 47
last_entry: 2026-04-03T10:00:00Z
---

# Corrections Log

## 2026-04-03 — project: my-app

### Correction: naming/descriptive-variables
- **File:** src/services/auth.ts
- **Claude wrote:** `const data = await db.user.findUnique(...)`
- **Human changed to:** `const user = await db.user.findUnique(...)`
- **Category:** naming
- **Pattern:** Use context-specific names over generic `data`

### Correction: verbosity/remove-docstring
- **File:** src/utils/hash.ts
- **Claude wrote:** `/** Hashes a password using bcrypt. */ async function hashPassword(...)`
- **Human changed to:** `async function hashPassword(...)`
- **Category:** verbosity
- **Pattern:** No docstrings on self-explanatory functions
```

---

## Stats Format

Acceptance statistics at `~/.mythos/taste/stats.md`:

```markdown
---
last_updated: 2026-04-03T10:00:00Z
---

# Acceptance Stats

## Overall
- Total files: 203
- Accepted: 156 (76.8%)
- Corrected: 41 (20.2%)
- Rejected: 6 (3.0%)

## By Category (correction frequency)
| Category | Corrections | Top Pattern |
|----------|-------------|-------------|
| verbosity | 12 | Remove unnecessary docstrings |
| naming | 8 | Use descriptive variable names |
| error-handling | 6 | Use specific error types |
| style | 5 | Early returns over nesting |
| architecture | 4 | Validation in service layer |
| simplicity | 4 | No premature abstractions |
| dependencies | 3 | Native over lodash |

## By Project
| Project | Files | Acceptance Rate | Top Correction |
|---------|-------|-----------------|----------------|
| my-app | 120 | 78.3% | verbosity |
| cli-tool | 53 | 75.5% | naming |
| api-server | 30 | 73.3% | error-handling |

## Trend
- Last 7 days: 82.1% acceptance (improving)
- Last 30 days: 76.8% acceptance
- All time: 76.8% acceptance
```

---

## Integration With Existing Skills

### `/mythos:do` — Taste-Aware Execution
Before starting work, load `~/.mythos/taste/profile.md` (if it exists). Apply taste preferences during execution:
- Use the human's naming conventions
- Follow their architectural preferences
- Match their verbosity level
- Avoid patterns they consistently reject

### `/mythos:evolve` — Taste-Informed Evolution
During evolve passes, cross-reference taste corrections with standards.md:
- If taste corrections contradict a standard → flag the tension
- If taste corrections reveal a missing standard → propose adding it
- If acceptance rate drops in a category → investigate what changed

### `/mythos:status` — Taste Summary
Add taste metrics to the status dashboard:
```
  TASTE (global)
  acceptance     [N]% ([trend] vs last 30d)
  corrections    [N] patterns ([N] strong)
  top correction [category]: [pattern]
```

### `CLAUDE.md` — Session Start
Load global taste profile alongside project-specific context:
```
7. `~/.mythos/taste/profile.md` (if exists) — your coding preferences learned from past corrections
```

---

## Privacy and Control

- Taste data is local only — stored in `~/.mythos/`, never uploaded anywhere
- Human can edit `profile.md` directly to correct or remove patterns
- Human can delete `corrections.md` to reset learning
- `/mythos:taste reset` clears all taste data
- `/mythos:taste ignore [pattern]` excludes a specific pattern
- Taste suggestions are soft preferences, not hard constraints — Claude can deviate with reason
