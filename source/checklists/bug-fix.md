# Bug Fix Checklist

Use with `/mythos:do` for bug fixes.

## Before Starting
- [ ] Reproduce the bug — if you cannot reproduce it, do not fix it
- [ ] Root cause identified — not just the symptom
- [ ] Outcome defined: "Bug X is fixed when Y behaviour is observed"

## During
- [ ] Regression test written that fails on the bug, passes on the fix
- [ ] Fix targets root cause only — no collateral changes
- [ ] Related code paths checked for same class of bug

## Before Calling Done
- [ ] Regression test passes
- [ ] No new test failures introduced
- [ ] Fix does not change unrelated behaviour
- [ ] If root cause reveals systemic issue, log observation to `.mythos/memory/observations.md`
