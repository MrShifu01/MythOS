<!-- MythOS calibration anchor — DO NOT MODIFY — ground truth for rubric scoring -->
# Example: CLI Evaluation — FAIL (41/100)

**Feature:** Auto-detect tech stack during install — scans package.json and pre-fills prompts
**Domain:** CLI rubric

## What was tested
Ran `npx myth-os-install` in a Next.js project, a plain Node.js project, and an empty directory.

## CLI Findings
- Next.js project: detected "React" but missed "Next.js" — wrong stack label written to CLAUDE.md
- Plain Node.js: crashed with `TypeError: Cannot read properties of undefined` when package.json had no `dependencies` key
- Empty directory: infinite loop — kept re-prompting for tech stack with no way to skip
- No fallback to manual entry when detection fails
- Error output: raw stack trace shown to user — no friendly message

## Dimension Scores

**Reliability: 30/100** — Crashes on a valid edge case (no dependencies key). Infinite loop
on empty directory. These are not edge cases — they are common real-world inputs.

**UX: 45/100** — Detection result shown but not confirmed before use. User cannot correct
a wrong detection. Raw stack trace is never acceptable UX for a CLI tool.

**Safety: 50/100** — No destructive operations, but the crash leaves a partial install
(some files written before the crash). Partial installs are worse than no install.

**Composite: 41/100 → fail — targeted**

## Verdict
`fail — targeted` — Return to Generator with dimensional feedback.

**Priority fix:** Reliability failures block shipping. Wrap `package.json` parsing in
try/catch. Add a maximum retry count (3) to avoid infinite loops.

**Pivot recommendation (if this fails again):**
Drop auto-detection entirely. Show a numbered tech stack menu instead. Detection that
fails silently is worse than no detection.

---
*What made this a FAIL: A crash on a missing dependencies key is a reliability zero.
The infinite loop on empty directory is unusable. These are not edge cases — every
real installation will hit one of these paths.*
