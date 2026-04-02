# MythOS

An AI workflow harness for Claude Code. Gives the model the right context and gets out of the way.

## Install

```bash
npx mythos-install
```

Asks 5 questions about your project. Generates `.mythos/` with your standards, memory, and calibration anchors. Installs 6 skills to `~/.claude/skills/`.

## The three mechanisms

1. **Outcome clarity** — no work begins without a scoreable definition of success
2. **Scored improvement loop** — every output scored, high scores feed the outcomes library, evidence sharpens standards
3. **Evolvable everything** — standards, rubrics, and skills all improve via the same scored evidence loop, with rollback

## Commands

After install, these slash commands are available in Claude Code:

| Command | What it does |
|---|---|
| `/mythos:do` | Define outcome + execute. Opens every task with the outcome question. |
| `/mythos:audit` | Full codebase health score (8 dimensions) + generates sprint file. |
| `/mythos:evolve` | Improve standards, rubrics, skills via scored evidence. Snapshot + rollback. |
| `/mythos:remember` | Route anything to the right memory tier automatically. |
| `/mythos:status` | Memory entry counts + score trend + one recommendation. |
| `/mythos:standards` | Sharpen standards.md from score evidence. |

## What gets installed

```
CLAUDE.md                              (~40 lines)
.mythos/
  context/
    product.md                         (your product + audience)
    standards.md                       (quality bar, gate threshold, audit weights)
    evaluation-rubrics.md              (dimensional scoring rubric)
    evaluation-examples/               (calibration anchors — fixed ground truth)
  memory/
    decisions.md
    constraints.md
    lessons.md
    observations.md
    hypotheses.md
    outcomes/
    audit-scores.md
  checklists/
    feature.md
    bug-fix.md
    improvement.md
  sprints/
    active/
    archive/
  snapshots/
```

## Philosophy

MythOS is an information system, not a behavioral scaffold. The model has the context, the quality bar, and the memory. It decides how much process any task needs. A typo needs no planning. A new data model needs a logged decision.

## Migration from SmashOS

SmashOS users: MythOS replaces SmashOS. The key changes:

| SmashOS | MythOS |
|---|---|
| CLAUDE.md (170 lines) | CLAUDE.md (~40 lines, generated) |
| 12 role files | `standards.md` (one file, your team's taste) |
| 47 agent files | 0 agent files (model judges) |
| 15+ skills | 6 skills |
| Behavioral guardrail layer | Removed — "trust yourself" principle |
