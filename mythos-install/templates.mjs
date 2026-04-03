// mythos-install/templates.mjs

/**
 * Generate CLAUDE.md content (~50 lines, from MythOS spec).
 * Integrates ByteRover-inspired Context Tree, AKL, progressive retrieval, and relation graph.
 */
export function getCLAUDEMd() {
  return `# MythOS
You are operating inside MythOS — an AI harness built for intelligent models.
You are not being scripted. You are being given context and trusted to judge.

## Session Start — Progressive Context Loading
Load lightweight context first, retrieve deeper knowledge on demand:

1. \`.mythos/context/product.md\` — what the product does
2. \`.mythos/context/standards.md\` — quality bar and philosophy
3. \`.mythos/memory/context-tree/operations/session/current.md\` — last session state
4. All domain summaries: \`.mythos/memory/context-tree/*/context.md\` — ambient awareness of stored knowledge
5. Any entry with \`maturity: core\` in frontmatter — foundational knowledge always in context
6. \`~/.mythos/taste/profile.md\` (if exists) — YOUR coding preferences learned from past corrections (cross-project)

Do NOT load all entries at startup. Use progressive retrieval (Tier 2-4) when a task needs specific knowledge.
See \`source/retrieval-spec.md\` for the 5-tier strategy.

## Outcome Rule
No work begins without a scoreable outcome definition.
If you cannot state what success looks like in one observable sentence, ask.
One clarifying question at a time until you can.

## Quality Bar
Evaluate all outputs against \`.mythos/context/evaluation-rubrics.md\`.
Calibration anchors: \`.mythos/context/evaluation-examples/\`

## Memory — Context Tree
Knowledge is stored in the Context Tree at \`.mythos/memory/context-tree/\`.
Organized as Domain > Topic > Entry, each entry with AKL lifecycle metadata.

After any non-trivial decision: curate to Context Tree inline during \`/mythos:do\`
After any high-scoring output (≥75): curate to outcomes/ inline during \`/mythos:do\`
When retrieving knowledge: update entry \`importance\` (+3 access bonus)

Specs: \`source/context-tree.md\`, \`source/akl-spec.md\`, \`source/relations-spec.md\`, \`source/taste-spec.md\`

## Hard Constraints
- No work begins without a scoreable outcome definition
- No deploy without evaluation score ≥ the threshold in standards.md
- HIGH-tier actions (deploy, delete, push to remote): pause and confirm
- Save architectural decisions to Context Tree before proceeding
- Never create Context Tree entries without frontmatter (id, domain, topic, importance, maturity, relations)

## Taste — Cross-Project Learning
\`/mythos:evolve\` learns YOUR preferences by analyzing git diffs between Claude's output and what you actually ship.
Taste profile lives at \`~/.mythos/taste/profile.md\` — shared across all projects.
Corrections accumulate: patterns seen ≥2 times become preferences applied in \`/mythos:do\`.
See \`source/taste-spec.md\` for full specification.

## Commands
/mythos:do      — define outcome + retrieve + curate memory + taste-aware execute + score
/mythos:audit   — full codebase health score + Context Tree health + generate sprints
/mythos:evolve  — improve standards, rubrics, skills + Context Tree lifecycle + taste learning
/mythos:status  — Context Tree dashboard + AKL lifecycle + taste stats + score trends

## Trust yourself
You have the context, the quality bar, and the memory.
You decide how much process this task needs.
A typo needs no planning. A new data model needs a decision logged. Judge it.
`
}

/**
 * Generate product.md from Q1 + Q2 answers.
 */
export function getProductMd(product, audience) {
  return `# Product Context
**Generated:** ${new Date().toISOString().slice(0, 10)}

## What it does
${product}

## Who it's for
${audience}
`
}

/**
 * Initial empty memory files — headers only (legacy flat files, kept for backward compat).
 */
export const memoryFiles = {
  'decisions.md': `# Decisions\n\nLog architectural and significant technical decisions here.\nFormat: date, decision, why, alternatives considered.\n\n---\n`,
  'constraints.md': `# Constraints\n\nHard rules for this project. See \`.mythos/rules/README.md\` for taxonomy.\n\n---\n`,
  'lessons.md': `# Lessons\n\nPatterns learned from failures and near-misses.\n\n---\n`,
  'observations.md': `# Observations\n\nRecurring patterns and team observations worth noting.\n\n---\n`,
  'hypotheses.md': `# Hypotheses\n\nIdeas under investigation. Each hypothesis: stated assumption, how to test it, status.\n\n---\n`,
  'audit-scores.md': `# Audit Score History\n\nTimestamped composite scores from \`/mythos:audit\` runs.\n\n---\n`,
  'session.md': `# Session State\n**Last active:** —\n**In-flight:** —\n**Next:** —\n\nUpdate this at the end of every session. The next session reads it first.\n`,
}

/**
 * Context Tree domain context.md templates — the hierarchical knowledge structure.
 * Inspired by ByteRover's agent-native memory architecture.
 */
export const contextTreeDomains = {
  'architecture': {
    'context.md': `---
type: context-summary
domain: architecture
entry_count: 0
last_updated: ${new Date().toISOString()}
---

# Architecture — Summary

This domain stores architectural decisions and patterns.
Topics: decisions, patterns.

## Key Entries (core maturity)
_No core entries yet._

## Recent Activity
_No entries yet. Use \`/mythos:remember\` to curate architectural knowledge._
`,
    topics: ['decisions', 'patterns'],
  },
  'constraints': {
    'context.md': `---
type: context-summary
domain: constraints
entry_count: 0
last_updated: ${new Date().toISOString()}
---

# Constraints — Summary

This domain stores hard rules classified by tier: invariant, policy, preference.
See \`.mythos/memory/rules/README.md\` for the constraint taxonomy.

## Key Entries (core maturity)
_No core entries yet._

## Recent Activity
_No entries yet. Use \`/mythos:remember\` to curate constraints._
`,
    topics: ['invariant', 'policy', 'preference'],
  },
  'lessons': {
    'context.md': `---
type: context-summary
domain: lessons
entry_count: 0
last_updated: ${new Date().toISOString()}
---

# Lessons — Summary

This domain stores patterns learned from failures and near-misses.

## Key Entries (core maturity)
_No core entries yet._

## Recent Activity
_No entries yet. Use \`/mythos:remember\` to curate lessons._
`,
    topics: [],
  },
  'observations': {
    'context.md': `---
type: context-summary
domain: observations
entry_count: 0
last_updated: ${new Date().toISOString()}
---

# Observations — Summary

This domain stores recurring patterns and team observations.

## Key Entries (core maturity)
_No core entries yet._

## Recent Activity
_No entries yet. Use \`/mythos:remember\` to curate observations._
`,
    topics: [],
  },
  'outcomes': {
    'context.md': `---
type: context-summary
domain: outcomes
entry_count: 0
last_updated: ${new Date().toISOString()}
---

# Outcomes — Summary

This domain stores high-scoring outputs (≥75) from tasks and audits.
Topics: skills, agents.

## Key Entries (core maturity)
_No core entries yet._

## Recent Activity
_No entries yet. High-scoring outputs will be curated here automatically._
`,
    topics: ['skills', 'agents'],
  },
  'hypotheses': {
    'context.md': `---
type: context-summary
domain: hypotheses
entry_count: 0
last_updated: ${new Date().toISOString()}
---

# Hypotheses — Summary

This domain stores ideas under investigation.
Each hypothesis: stated assumption, how to test it, status.

## Key Entries (core maturity)
_No core entries yet._

## Recent Activity
_No entries yet. Use \`/mythos:remember\` to curate hypotheses._
`,
    topics: [],
  },
  'operations': {
    'context.md': `---
type: context-summary
domain: operations
entry_count: 0
last_updated: ${new Date().toISOString()}
---

# Operations — Summary

This domain stores session state and audit history.
Topics: session, audit-history.

## Key Entries (core maturity)
_No core entries yet._

## Recent Activity
_No entries yet._
`,
    topics: ['session', 'audit-history'],
  },
}

/**
 * Initial session entry for the Context Tree.
 */
export function getSessionEntry() {
  return `---
id: current
domain: operations
topic: session
created: ${new Date().toISOString()}
updated: ${new Date().toISOString()}
author: system
importance: 50
maturity: validated
access_count: 0
update_count: 0
relations: []
tags: [session, state]
---

# Current Session State

## Status
**Last active:** —
**In-flight:** —
**Next:** —

Update this at the end of every session. The next session reads it first.
`
}

/**
 * Initial empty relations index for the Context Tree.
 */
export function getRelationsIndex() {
  return JSON.stringify({}, null, 2)
}

/**
 * Skill file contents — installed to ~/.claude/skills/
 * Keys are skill directory names. Values are SKILL.md content.
 * Integrates ByteRover-inspired Context Tree, AKL, progressive retrieval, and relation graph.
 */
export const skills = {

'mythos-do': `---
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
2. **Tier 2 (Direct Search):** Search \`.mythos/memory/context-tree/\` for entries matching the task:
   - \`Glob\` by domain/topic path for known areas
   - \`Grep\` for task-related terms in entry titles, tags, and content
3. **Tier 3 (Deep Read):** If matches found, read entries fully. Follow \`relations\` links to related entries for cross-context.
4. **Tier 4 (Full Traversal):** For novel tasks with no direct matches, read domain summaries (\`context.md\` files), then explore relevant topics.

**Constraint check:** Always search \`constraints/\` domain for rules applicable to the task. Violations of \`invariant\` constraints are hard blocks.

**Lesson check:** Search \`lessons/\` domain for past failures on similar tasks. Don't repeat known mistakes.

**Out-of-domain:** If no relevant knowledge exists in the Context Tree, say so explicitly. Proceed with general knowledge but flag the gap.

## Taste-Aware Execution

If \`~/.mythos/taste/profile.md\` exists, apply the human's preferences during execution:
- Use their naming conventions (\`naming\` patterns)
- Follow their structural preferences (\`architecture\` patterns)
- Match their verbosity level (\`verbosity\` patterns)
- Avoid patterns they consistently reject

Taste preferences are soft — deviate with good reason, but default to matching the human's style.

## Memory Curation (inline)

During and after work, curate knowledge into the Context Tree using atomic operations: ADD, UPDATE, UPSERT, MERGE, DELETE.

Route to the correct domain:
- Architectural decisions → \`architecture/decisions/\`
- Hard constraints → \`constraints/\` (invariant/policy/preference)
- Lessons from failures → \`lessons/\`
- High-scoring outputs (≥75) → \`outcomes/\`
- Session state → \`operations/session/current.md\` (overwrite)

Every entry gets AKL frontmatter (importance: 50, maturity: draft). Search for duplicates before ADD — UPDATE or MERGE when possible. Add 1-3 relations to related entries and update \`.relations-index.json\`.

See \`source/context-tree.md\` for full entry format and \`source/akl-spec.md\` for lifecycle rules.

## Output Contract

- Scoreable outcome defined before first file edit
- Work meets \`.mythos/context/standards.md\` quality bar
- Non-trivial decisions curated to Context Tree during work
- Output scored against \`.mythos/context/evaluation-rubrics.md\` — score reported with dimensional breakdown
- If retrieval found relevant entries, cite them in the score report
- If taste profile influenced execution, note which preferences were applied
- Session state updated in \`operations/session/current.md\` after significant work

**Skill creation mode:** When asked to create a skill — generate the skill, write 3 synthetic evaluation tests against it, score them against evaluation-rubrics.md, only write the file if ≥2 tests score ≥75.

**Trust yourself:** A typo needs no process. A new data model needs a logged decision. Judge the scope.
`,

'mythos-audit': `---
name: mythos:audit
description: Full codebase health score across 8 dimensions. Uses Context Tree relation graph for multi-hop analysis. Generates sprint file.
allowed-tools: Bash, Read, Glob, Grep, Write
---

# /mythos:audit

**Output contract:**
- Score every dimension 0–100 (criteria below)
- Composite = weighted average using weights from \`.mythos/context/standards.md\`
- Append entry to Context Tree: \`.mythos/memory/context-tree/operations/audit-history/YYYY-MM-DD.md\`
- Write sprint file to \`.mythos/sprints/active/YYYY-MM-DD-audit.md\`
- Each sprint item is a \`/mythos:do\`-ready outcome definition with expected score delta

## Knowledge-Informed Scoring

For each dimension, leverage the Context Tree before scoring:

1. **Load constraints** — Search \`constraints/\` for rules relevant to this dimension
2. **Check lessons** — Search \`lessons/\` for past failures in this area
3. **Follow relations** — Use the relation graph to find connected knowledge:
   - \`enforces\` links show what patterns implement which constraints
   - \`conflicts-with\` links reveal unresolved tensions
   - \`derived-from\` chains show provenance of current patterns
4. **Cross-reference outcomes** — Check \`outcomes/\` for past scores on similar work

**Dimensions:**

| Dimension   | What it measures |
|-------------|-----------------|
| Frontend    | Component quality, bundle size, rendering patterns, accessibility, design consistency with standards.md |
| Backend     | API design, error handling, input validation, service boundaries |
| Database    | Schema quality, query efficiency, index coverage, migration hygiene |
| Performance | Core Web Vitals, response times, caching strategy, N+1 patterns |
| Security    | OWASP Top 10, auth patterns, secrets exposure, dependency vulnerabilities |
| Testing     | Coverage, test quality, E2E (Playwright), integration vs unit balance |
| API         | Contract clarity, versioning, documentation, consistency |
| Code health | Duplication, complexity, dead code, dependency freshness |

## Context Tree Health (bonus dimension)

Report Context Tree health alongside code dimensions:
- Total entries and maturity distribution
- Orphan entries (no relations) — knowledge gaps
- Decaying entries (importance < 35) — stale knowledge

**Sprint item format:**
\\\`\\\`\\\`markdown
## Sprint: [Title] — expected +[N]pts on [Dimension] score

**Outcome:** [One observable sentence defining success]
Success: [Measurable verification criteria]

**Current gap:** [score]/100 — [specific gap description]
**Related knowledge:** [Context Tree entries relevant to this sprint item]
\\\`\\\`\\\`

**Close with:**
\\\`\\\`\\\`
Sprints written → .mythos/sprints/active/YYYY-MM-DD-audit.md

When ready:  /mythos:do sprints
\\\`\\\`\\\`
`,

'mythos-evolve': `---
name: mythos:evolve
description: Maintenance and improvement engine. Evolves standards, rubrics, skills, CLAUDE.md, Context Tree lifecycle, and taste learning. Snapshot before every pass.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# /mythos:evolve

**Before any pass:** Save snapshot to \`.mythos/snapshots/YYYY-MM-DD-HHmm/\` containing:
standards.md, evaluation-rubrics.md, evaluation-examples/, all 4 skill files, CLAUDE.md, and \`.relations-index.json\`.

**Mode selection:**
- *Evidence mode* — outcomes library has ≥3 real entries per artifact: use scored real outputs, compare wording variants, keep higher scorer
- *Synthetic mode* — fresh install or sparse history: generate 3–5 representative task scenarios for this project type, score each, identify lowest-scoring definitions, propose improvements

**Artifacts in scope:**
- \`standards.md\` — sharpen contracts where scores show consistent underperformance
- \`evaluation-rubrics.md\` — detect and fix scoring drift; re-score calibration anchors each pass
- Any of the 4 mythos skills — strip procedure density >40%, add Output Contract where missing, A/B test wording
- \`CLAUDE.md\` — tighten hard constraints only; never remove them

## Context Tree Lifecycle Management

### AKL Maintenance
- Calculate effective importance: \`importance × 0.995^(days_since_last_event)\`
- **Promote** entries crossing upward thresholds (draft→validated at ≥65, validated→core at ≥85)
- **Demote** entries crossing downward thresholds (core→validated at <60, validated→draft at <35)
- Flag entries with effective importance < 20 as archival candidates

### Relation Graph Health
- Identify orphan entries (no relations) — suggest connections
- Detect \`supersedes\` chains — archive fully superseded entries
- Check for broken links — clean up
- Regenerate \`context.md\` summaries for changed domains

## Taste Learning (cross-project)

Analyze git diffs to learn YOUR coding preferences:
1. Find Claude-authored commits (session URLs or author match)
2. Find human follow-up edits to same files
3. Classify: accepted, corrected, rejected
4. Extract correction patterns (style, architecture, error-handling, simplicity, verbosity, safety, testing, ux, naming, dependencies)
5. Update \`~/.mythos/taste/\` (profile, corrections, stats)

Confidence: 1 obs = weak, 2-3 = moderate, 4-6 = strong, 7+ = established.
Cross-reference taste with standards — propose elevating strong patterns.

\`/mythos:evolve taste\` — taste-only pass (skip artifact evolution)
\`/mythos:evolve taste reset\` — clear all taste data
\`/mythos:evolve taste ignore [pattern]\` — exclude a pattern

**Output contract:**
- Snapshot saved (path printed)
- Max 5 changes per pass (artifacts) + unlimited AKL promotions/demotions
- Each applied change backed by score delta or synthetic test result
- AKL lifecycle changes listed separately
- Calibration examples never modified
- Hard constraints in CLAUDE.md never removed

\\\`\\\`\\\`
▸ MythOS  ·  evolve  ·  pass #N
──────────────────────────────────────────
  snapshot       saved → snapshots/YYYY-MM-DD-HHmm/
  mode           evidence | synthetic

  IMPROVEMENTS APPLIED
  · [artifact] — [change] ([+N]pts evidence)

  PROPOSED (A/B in progress)
  · [artifact] — [variant description]

  CONTEXT TREE LIFECYCLE
  · promoted    [N] entries
  · demoted     [N] entries
  · archival    [N] entries flagged (importance < 20)
  · orphans     [N] entries with no relations

  TASTE LEARNING
  · scanned        [N] Claude commits, [N] files
  · accepted       [N] ([N]%) · corrected [N] ([N]%) · rejected [N] ([N]%)
  · new patterns   [N] · strengthened [N]
  · acceptance     [N]% ([trend])

  To rollback:  /mythos:evolve rollback
──────────────────────────────────────────
\\\`\\\`\\\`

**Rollback mode:** \`/mythos:evolve rollback\` — list all snapshots with composite score at capture time. User picks one to restore.
`,

'mythos-status': `---
name: mythos:status
description: Context Tree dashboard with AKL lifecycle summary, relation graph stats, and score trends. Under 25 lines total output.
allowed-tools: Read, Bash, Glob, Grep
---

# /mythos:status

**Output contract:**
- Scan \`.mythos/memory/context-tree/\` for entry counts by domain and maturity
- Read domain \`context.md\` files for summaries
- Check \`.relations-index.json\` for graph stats
- Total output ≤25 lines, exactly the format below

\\\`\\\`\\\`
▸ MythOS  ·  status
──────────────────────────────────────────
  CONTEXT TREE
  architecture   [N] entries  ([C] core · [V] validated · [D] draft)
  constraints    [N] entries  ([C] core · [V] validated · [D] draft)
  lessons        [N] entries
  observations   [N] entries
  outcomes       [N] entries  (last: [score] on [date])
  hypotheses     [N] entries
  operations     [N] entries

  LIFECYCLE
  decaying       [N] entries below importance 35
  most accessed  [entry-id] ([N] accesses)

  RELATIONS
  total links    [N] · orphans [N]

  TASTE (global — ~/.mythos/taste/)
  acceptance     [N]% ([trend] vs last 30d)
  patterns       [N] ([N] strong · [N] moderate)
  top correction [category]: [pattern]

  SCORES
  last audit     [score]/100  [date]
  trend          [↑ / ↓ / →] vs previous

  → [one prioritised recommendation]
──────────────────────────────────────────
\\\`\\\`\\\`

Count \`.md\` files per domain (excluding \`context.md\`). Read frontmatter for maturity.
Read \`~/.mythos/taste/stats.md\` for taste metrics. If not present, show "no taste data yet".
If Context Tree doesn't exist yet, fall back to flat \`.mythos/memory/\` files.
`,

}
