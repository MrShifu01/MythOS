<!-- MythOS calibration anchor — DO NOT MODIFY — ground truth for rubric scoring -->
# Example: CLI Evaluation — PASS (83/100)

**Feature:** `--upgrade` flag for myth-os-install — detects existing install and patches only changed files
**Domain:** CLI rubric

## What was tested
Ran the installer with `--upgrade` on a repo with v0.3.5 installed. Verified idempotency
(ran twice — second run produced no changes). Tested with missing files, extra files,
and a broken .claude/settings.json.

## Playwright / CLI Findings
- `npx myth-os-install --upgrade` detected existing install — correct
- Patched changed files only — did not overwrite user customisations in ai/context/
- Ran twice with no diff on second run — idempotent ✓
- Missing ai/memory/decisions.md — recreated cleanly ✓
- Broken settings.json — merged rather than overwriting ✓
- Clear progress output for each file written ✓
- `--verify` flag confirmed all files present after upgrade ✓

## Dimension Scores

**Reliability: 88/100** — Idempotent, handles missing files gracefully, merges rather
than overwrites settings.json. One edge case: concurrent runs would clobber each other
(no lock file), but acceptable for a CLI installer.

**UX: 80/100** — Progress output is clear. Each written file gets a ✓ line. The only
gap: no summary count at the end ("12 files updated, 3 skipped").

**Safety: 82/100** — Never overwrites user-edited files in ai/context/. Does not run
destructive operations without confirmation. No secrets in output.

**Composite: 83/100 → pass_with_warnings**

## Verdict
`pass_with_warnings` — Advance with concurrent-run note logged to lessons.md.

---
*What made this a PASS: The upgrade path handled every edge case tested without data loss.
The 80 UX score reflects a real gap (no summary line) but it does not block shipping.*
