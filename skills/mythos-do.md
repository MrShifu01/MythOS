---
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
- Work meets `.mythos/context/standards.md` quality bar
- Non-trivial decisions logged to `.mythos/memory/decisions.md`
- Output scored against `.mythos/context/evaluation-rubrics.md` — score reported with dimensional breakdown

**Skill creation mode:** When asked to create a skill — generate the skill, write 3 synthetic evaluation tests against it, score them against evaluation-rubrics.md, only write the file if ≥2 tests score ≥75.

**Trust yourself:** A typo needs no process. A new data model needs a logged decision. Judge the scope.
