# MythOS

An AI workflow harness for Claude Code. Gives the model the right context and gets out of the way.

## Install

```bash
npx mythos-install
```

Asks 5 questions about your project. Generates `.mythos/` with your standards, Context Tree, and calibration anchors. Installs 6 skills to `~/.claude/skills/`.

## The four mechanisms

1. **Outcome clarity** — no work begins without a scoreable definition of success
2. **Scored improvement loop** — every output scored, high scores feed the outcomes library, evidence sharpens standards
3. **Evolvable everything** — standards, rubrics, and skills all improve via the same scored evidence loop, with rollback
4. **Agent-native memory** — the same LLM that reasons about a task curates, structures, and retrieves knowledge via the Context Tree (inspired by [ByteRover](https://arxiv.org/abs/2604.01599))

## Commands

After install, these slash commands are available in Claude Code:

| Command | What it does |
|---|---|
| `/mythos:do` | Define outcome + progressive retrieval from Context Tree + execute + score. |
| `/mythos:audit` | Full codebase health score (8 dimensions) + Context Tree health + generates sprint file. |
| `/mythos:evolve` | Improve standards, rubrics, skills, and Context Tree lifecycle via scored evidence. |
| `/mythos:remember` | Curate knowledge into Context Tree with atomic operations (ADD/UPDATE/UPSERT/MERGE/DELETE). |
| `/mythos:taste` | Learn YOUR coding preferences from git diffs — cross-project at `~/.mythos/taste/`. |
| `/mythos:status` | Context Tree dashboard + AKL lifecycle + taste stats + score trends. |

## What gets installed

```
~/.mythos/                             (global — cross-project)
  taste/
    profile.md                         (synthesized coding preferences)
    corrections.md                     (raw correction log from git diffs)
    stats.md                           (acceptance rates by category + project)

CLAUDE.md                              (~55 lines)
.mythos/
  context/
    product.md                         (your product + audience)
    standards.md                       (quality bar, gate threshold, audit weights)
    evaluation-rubrics.md              (dimensional scoring rubric)
    evaluation-examples/               (calibration anchors — fixed ground truth)
    context-tree.md                    (Context Tree structure spec)
    akl-spec.md                        (Adaptive Knowledge Lifecycle spec)
    retrieval-spec.md                  (5-tier progressive retrieval spec)
    relations-spec.md                  (relation graph spec)
    taste-spec.md                      (cross-project taste learning spec)
  memory/
    context-tree/                      (hierarchical knowledge graph)
      architecture/                    (decisions, patterns)
      constraints/                     (invariant, policy, preference)
      lessons/                         (failure patterns)
      observations/                    (recurring patterns)
      outcomes/                        (high-scoring outputs)
      hypotheses/                      (ideas under investigation)
      operations/                      (session state, audit history)
      .relations-index.json            (bidirectional relation graph)
    decisions.md                       (legacy flat file)
    constraints.md                     (legacy flat file)
    lessons.md                         (legacy flat file)
    ...
  checklists/
    feature.md
    bug-fix.md
    improvement.md
  sprints/
    active/
    archive/
  snapshots/
```

## Taste Learning — The Cross-Project Network Effect

MythOS learns YOUR coding preferences by analyzing git diffs between what Claude produces and what you actually commit. This is the strongest signal for calibration — behavioral, not declared.

- **Diff-based** — After Claude works, `/mythos:taste` compares Claude's output to your committed version
- **Cross-project** — Taste profile lives at `~/.mythos/taste/` (global). Every project makes every other project better.
- **Confidence-weighted** — Patterns need ≥2 observations to influence behavior. 7+ observations become personal standards.
- **10 categories** — `style`, `architecture`, `error-handling`, `simplicity`, `verbosity`, `safety`, `testing`, `ux`, `naming`, `dependencies`
- **Acceptance tracking** — Files classified as accepted/corrected/rejected. Acceptance rate trends over time.

The taste profile feeds into every skill: `/mythos:do` applies your preferences during execution, `/mythos:evolve` cross-references taste with standards and proposes elevating strong taste patterns to project standards.

See `source/taste-spec.md` for full specification.

## Context Tree

MythOS stores knowledge in a hierarchical file-based knowledge graph inspired by [ByteRover](https://arxiv.org/abs/2604.01599). Key features:

- **Hierarchical** — Domain > Topic > Entry, each domain with auto-generated `context.md` summaries
- **Adaptive Knowledge Lifecycle (AKL)** — entries earn importance through access (+3) and updates (+5), progress through maturity tiers (`draft → validated → core`), and decay when unused
- **Progressive Retrieval** — session start loads summaries, not everything; 5-tier escalation from cache to full agentic reasoning
- **Relation Graph** — explicit `@relation` annotations link entries with typed connections (`depends-on`, `enforces`, `supersedes`, `related-to`, `derived-from`, `conflicts-with`, `extends`)
- **Zero infrastructure** — all knowledge stored as human-readable markdown files, version-controllable, portable

See `source/context-tree.md`, `source/akl-spec.md`, `source/retrieval-spec.md`, `source/relations-spec.md` for full specifications.

## Philosophy

MythOS is an information system, not a behavioral scaffold. The model has the context, the quality bar, and the memory. It decides how much process any task needs. A typo needs no planning. A new data model needs a logged decision.

The Context Tree makes the agent the curator of its own knowledge — the same LLM that reasons about a task decides what to store, where to place it, what it relates to, and why it matters. No external embedding pipelines, no vector databases, no opaque similarity scores.

## Migration from SmashOS

SmashOS users: MythOS replaces SmashOS. The key changes:

| SmashOS | MythOS |
|---|---|
| CLAUDE.md (170 lines) | CLAUDE.md (~50 lines, generated) |
| 12 role files | `standards.md` (one file, your team's taste) |
| 47 agent files | 0 agent files (model judges) |
| 15+ skills | 6 skills |
| Behavioral guardrail layer | Removed — "trust yourself" principle |
| Flat memory files | Context Tree with AKL lifecycle + relation graph |
