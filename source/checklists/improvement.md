# Improvement Checklist

Use with `/mythos:do` for refactors, performance work, and tech debt reduction.

## Before Starting
- [ ] Outcome defined: what measurable property improves?
  (e.g. "bundle size < 200KB", "query time < 50ms", "test coverage > 80%")
- [ ] Baseline measured — you cannot claim improvement without a before number
- [ ] Scope bounded — improvements expand; agree on boundaries before starting

## During
- [ ] Behaviour preserved — tests pass throughout
- [ ] One concern at a time — do not mix refactor with feature work
- [ ] Progress measurable — check against baseline at each step

## Before Calling Done
- [ ] After number measured and compared to baseline
- [ ] Delta logged to `.mythos/memory/audit-scores.md` if audit-relevant
- [ ] No new technical debt introduced in the name of "improvement"
