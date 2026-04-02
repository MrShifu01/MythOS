// mythos-install/templates.mjs

/**
 * Generate CLAUDE.md content (~40 lines, from MythOS spec).
 */
export function getCLAUDEMd() {
  return `# MythOS
You are operating inside MythOS — an AI harness built for intelligent models.
You are not being scripted. You are being given context and trusted to judge.

## Session Start — load these 5 files
1. \`.mythos/context/product.md\`
2. \`.mythos/context/standards.md\`
3. \`.mythos/memory/decisions.md\` (last 20 entries)
4. \`.mythos/memory/constraints.md\`
5. \`.mythos/memory/audit-scores.md\` (last 5 entries)

## Outcome Rule
No work begins without a scoreable outcome definition.
If you cannot state what success looks like in one observable sentence, ask.
One clarifying question at a time until you can.

## Quality Bar
Evaluate all outputs against \`.mythos/context/evaluation-rubrics.md\`.
Calibration anchors: \`.mythos/context/evaluation-examples/\`

## Memory
After any non-trivial decision: log to \`.mythos/memory/decisions.md\`
After any high-scoring output (≥75): log to \`.mythos/memory/outcomes/\`
Route via \`/mythos:remember\` when in doubt.

## Hard Constraints
- No work begins without a scoreable outcome definition
- No deploy without evaluation score ≥ the threshold in standards.md
- HIGH-tier actions (deploy, delete, push to remote): pause and confirm
- Save architectural decisions to memory before proceeding

## Commands
/mythos:do       — define outcome + execute
/mythos:audit    — full codebase health score + generate sprints
/mythos:evolve   — improve standards, rubrics, skills via scoring
/mythos:remember — route anything to the right memory tier
/mythos:status   — memory + score trend dashboard
/mythos:standards — update standards.md from evidence

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
 * Initial empty memory files — headers only.
 */
export const memoryFiles = {
  'decisions.md': `# Decisions\n\nLog architectural and significant technical decisions here.\nFormat: date, decision, why, alternatives considered.\n\n---\n`,
  'constraints.md': `# Constraints\n\nHard rules for this project. See \`.mythos/rules/README.md\` for taxonomy.\n\n---\n`,
  'lessons.md': `# Lessons\n\nPatterns learned from failures and near-misses.\n\n---\n`,
  'observations.md': `# Observations\n\nRecurring patterns and team observations worth noting.\n\n---\n`,
  'hypotheses.md': `# Hypotheses\n\nIdeas under investigation. Each hypothesis: stated assumption, how to test it, status.\n\n---\n`,
  'audit-scores.md': `# Audit Score History\n\nTimestamped composite scores from \`/mythos:audit\` runs.\n\n---\n`,
}

/**
 * Skill file contents — installed to ~/.claude/skills/
 * Keys are skill directory names. Values are SKILL.md content.
 */
export const skills = {

'mythos-do': `---
name: mythos:do
description: Use for every task. Opens with outcome question, judges how much process is needed, executes, scores output.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, TodoWrite, TodoRead
---

# /mythos:do

**Before any work:** State what success looks like in one observable sentence.
- If you cannot, ask one clarifying question. Repeat until you can.
- If mid-task the defined outcome turns out to be wrong, surface it before continuing — not after.

**Output contract:**
- Scoreable outcome defined before first file edit
- Work meets \`.mythos/context/standards.md\` quality bar
- Non-trivial decisions logged to \`.mythos/memory/decisions.md\`
- Output scored against \`.mythos/context/evaluation-rubrics.md\` — score reported with dimensional breakdown

**Skill creation mode:** When asked to create a skill — generate the skill, write 3 synthetic evaluation tests against it, score them against evaluation-rubrics.md, only write the file if ≥2 tests score ≥75.

**Trust yourself:** A typo needs no process. A new data model needs a logged decision. Judge the scope.
`,

'mythos-audit': `---
name: mythos:audit
description: Full codebase health score across 8 dimensions. Generates sprint file with outcome-ready items.
allowed-tools: Bash, Read, Glob, Grep, Write
---

# /mythos:audit

**Output contract:**
- Score every dimension 0–100 (criteria below)
- Composite = weighted average using weights from \`.mythos/context/standards.md\`
- Append entry to \`.mythos/memory/audit-scores.md\`: date, composite, per-dimension breakdown
- Write sprint file to \`.mythos/sprints/active/YYYY-MM-DD-audit.md\`
- Each sprint item is a \`/mythos:do\`-ready outcome definition with expected score delta

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

**Sprint item format:**
\`\`\`markdown
## Sprint: [Title] — expected +[N]pts on [Dimension] score

**Outcome:** [One observable sentence defining success]
Success: [Measurable verification criteria]

**Current gap:** [score]/100 — [specific gap description]
\`\`\`

**Close with:**
\`\`\`
Sprints written → .mythos/sprints/active/YYYY-MM-DD-audit.md

When ready:  /mythos:do sprints
\`\`\`
`,

'mythos-evolve': `---
name: mythos:evolve
description: Improvement engine. Evolves standards, rubrics, skills, and CLAUDE.md via scored evidence. Snapshot before every pass. Rollback available.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# /mythos:evolve

**Before any pass:** Save snapshot to \`.mythos/snapshots/YYYY-MM-DD-HHmm/\` containing:
standards.md, evaluation-rubrics.md, evaluation-examples/, all 6 skill files, CLAUDE.md.

**Mode selection:**
- *Evidence mode* — outcomes library has ≥3 real entries per artifact: use scored real outputs, compare wording variants, keep higher scorer
- *Synthetic mode* — fresh install or sparse history: generate 3–5 representative task scenarios for this project type, score each, identify lowest-scoring definitions, propose improvements

**Artifacts in scope:**
- \`standards.md\` — sharpen contracts where scores show consistent underperformance
- \`evaluation-rubrics.md\` — detect and fix scoring drift; re-score calibration anchors each pass
- Any of the 6 mythos skills — strip procedure density >40%, add Output Contract where missing, A/B test wording
- \`CLAUDE.md\` — tighten hard constraints only; never remove them

**Output contract:**
- Snapshot saved (path printed)
- Max 5 changes per pass
- Each applied change backed by score delta or synthetic test result
- Proposed changes listed (A/B in progress — needs one more scored session)
- No-change items listed with reason
- Calibration examples never modified
- Hard constraints in CLAUDE.md never removed

\`\`\`
▸ MythOS  ·  evolve  ·  pass #N
──────────────────────────────────────────
  snapshot       saved → snapshots/YYYY-MM-DD-HHmm/
  mode           evidence | synthetic

  IMPROVEMENTS APPLIED
  · [artifact] — [change] ([+N]pts evidence)

  PROPOSED (A/B in progress)
  · [artifact] — [variant description]

  NO CHANGE
  · [artifact] — [reason]

  To rollback:  /mythos:evolve rollback
──────────────────────────────────────────
\`\`\`

**Rollback mode:** \`/mythos:evolve rollback\` — list all snapshots with composite score at capture time. User picks one to restore. Restore = overwrite current files from snapshot. Confirm before writing.
`,

'mythos-remember': `---
name: mythos:remember
description: Routes any input to the correct memory tier automatically. Call before saving anything to .mythos/memory/.
allowed-tools: Read, Write, Edit
---

# /mythos:remember

Given any input, determine the correct memory tier and write it there.

**Routing rules:**
- Hard constraint (non-negotiable rule that must never break) → \`.mythos/memory/constraints.md\`
- Architectural decision (choice between alternatives with tradeoffs) → \`.mythos/memory/decisions.md\`
- High-scoring output (score ≥75) → \`.mythos/memory/outcomes/<role>.md\` with score and date
- Recurring pattern or team observation → \`.mythos/memory/observations.md\`
- Lesson from a failure or near-miss → \`.mythos/memory/lessons.md\`

**Before writing:** Check for duplicates. Update existing entry rather than creating duplicate.

**Output contract:**
- One line: where it landed (file path) and why (routing rule applied)
- Nothing else
`,

'mythos-status': `---
name: mythos:status
description: Memory and score trend dashboard. Under 20 lines total output.
allowed-tools: Read, Bash, Glob
---

# /mythos:status

**Output contract:**
- Read \`.mythos/memory/\` and count entries in each file
- Read \`.mythos/memory/audit-scores.md\` for score history
- Total output ≤20 lines, exactly the format below — nothing more

Output exactly this format:

\`\`\`
▸ MythOS  ·  status
──────────────────────────────────────
  decisions      [N] entries
  constraints    [N] entries
  lessons        [N] entries
  outcomes       [N] entries (last: [score] on [date])

  last audit     [score]/100  [date]
  trend          [↑ / ↓ / →] vs previous

  last evolve    [date] · pass #[N]  (or "never")

  → [one prioritised recommendation for what to improve next]
──────────────────────────────────────
\`\`\`

Count entries by counting \`---\` separators or \`##\` headings per file, whichever is used.
If a file is empty, show 0. If audit-scores.md has no entries, show "no audits yet".
`,

'mythos-standards': `---
name: mythos:standards
description: Keeps standards.md sharp. Proposes specific wording improvements backed by score evidence.
allowed-tools: Read, Write, Edit, Glob
---

# /mythos:standards

**Output contract:**
- Read \`.mythos/context/standards.md\` and \`.mythos/memory/outcomes/\`
- For each standards.md section, check if scored outcomes reveal a consistent gap
- Propose specific wording changes — each backed by score delta evidence
- Format each proposal: current wording → proposed wording, evidence: "+N pts on [dimension] in [N] sessions"
- If \`.mythos/context/product.md\` shows the product has significantly changed, offer to re-run the 5 install questions

Do not modify standards.md without showing the proposed diff and confirming with the user first.
`,

}
