# Constraint Taxonomy

`.mythos/memory/constraints.md` stores hard rules for this project.
Use this taxonomy to classify and record constraints via `/mythos:remember`.

## Tiers

### Invariant (never break under any circumstances)
Rules where violation causes immediate, severe harm.
- Security rules: no secrets in code, no unvalidated user input reaching a DB query
- Data integrity: no destructive migrations without backups
- Example: "Never store plaintext passwords"

### Policy (break only with explicit team decision and logged justification)
Rules encoding team agreements. Can change, but only deliberately.
- Architecture patterns: "all API routes go through /api/v1/"
- Code standards: "no `any` casts in TypeScript"
- Example: "All database access via repository pattern, no raw queries in route handlers"

### Preference (default choice, overridable in context)
Rules expressing taste or defaults. Override freely with good reason.
- Style: "prefer named exports over default exports"
- Tooling: "use pnpm, not npm"
- Example: "Tailwind for styling unless project already uses CSS modules"

## Format for constraints.md entries

```markdown
## [Short title]
**Tier:** invariant | policy | preference
**Rule:** [One sentence — what must/must not happen]
**Why:** [One sentence — the reasoning behind it]
**Added:** [YYYY-MM-DD]
```
