---
name: mythos:taste
description: Learn YOUR coding preferences from git diffs. Compares what Claude produced vs what you actually shipped. Cross-project taste profile at ~/.mythos/taste/.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# /mythos:taste

Learn from the gap between what Claude produces and what you actually commit. This is the strongest signal for calibrating to YOUR preferences.

## Modes

### `/mythos:taste` (default — analyze recent diffs)

1. **Find Claude-authored changes** in git log:
   - Look for commits with `claude.ai/code/session` in the message
   - Look for commits with author containing `claude` or `anthropic`
   - Look for commits matching known MythOS patterns (e.g., contains session URL)

2. **Find human follow-up edits** — subsequent commits by a different author that touch the same files

3. **For each modified file, classify the outcome:**
   - **Accepted** — file committed unchanged by human (or only whitespace changes)
   - **Corrected** — file has meaningful human edits after Claude's version
   - **Rejected** — file was reverted, deleted, or `git checkout`'d away

4. **For each correction, extract the pattern:**
   - Read the diff between Claude's version and the human's version
   - Classify into a category: `style`, `architecture`, `error-handling`, `simplicity`, `verbosity`, `safety`, `testing`, `ux`, `naming`, `dependencies`
   - Write a one-line pattern description
   - Check if this pattern already exists in corrections log (if so, increment confidence)

5. **Update global taste files:**
   - Append new corrections to `~/.mythos/taste/corrections.md`
   - Update `~/.mythos/taste/stats.md` with acceptance rates
   - If any pattern reaches ≥2 observations, promote to `~/.mythos/taste/profile.md`

### `/mythos:taste review` — show current taste profile

Read and display `~/.mythos/taste/profile.md` with stats summary. If no profile exists yet, say so and explain how to generate one.

### `/mythos:taste reset` — clear all taste data

After confirmation, delete contents of `~/.mythos/taste/corrections.md`, `stats.md`, and `profile.md`. Keep the files with empty headers.

### `/mythos:taste ignore [pattern]` — exclude a pattern

Add the pattern to an ignore list in `~/.mythos/taste/profile.md`. Ignored patterns are skipped during future analysis and not applied during `/mythos:do`.

## Git Analysis Protocol

When scanning git history:

```bash
# Find Claude commits (last 50 commits or last 30 days, whichever is smaller)
git log --author="claude" --author="anthropic" --format="%H %ai %s" --since="30 days ago" -50

# If no author match, search by commit message pattern
git log --grep="claude.ai/code/session" --format="%H %ai %s" --since="30 days ago" -50

# For each Claude commit, find human edits to same files
git log --no-merges --format="%H %an %ai %s" -- [files] --since=[claude-commit-date]

# Get the diff between Claude's version and human's final version
git diff [claude-commit]..[human-commit] -- [file]
```

## Correction Extraction

For each diff hunk, analyze:

| Signal | Category | Example |
|--------|----------|---------|
| Variable renamed | `naming` | `data` → `user`, `res` → `response` |
| Function restructured | `architecture` | Logic moved between files/layers |
| Error handling changed | `error-handling` | Generic catch → specific error types |
| Code removed | `simplicity` | Unnecessary abstraction deleted |
| Comments removed | `verbosity` | Docstring on obvious function removed |
| Comments added | `verbosity` | Explanation added for complex logic |
| Validation added | `safety` | Null check, input validation added |
| Import changed | `dependencies` | lodash → native, library swapped |
| Test rewritten | `testing` | describe/it → flat test(), mocks changed |
| UI element changed | `ux` | Loading state added, layout adjusted |
| Style changed | `style` | Ternary → if/else, early return added |

## Confidence Scoring

Patterns gain confidence through repetition:

| Observations | Confidence | Behavior |
|-------------|-----------|----------|
| 1 | `weak` | Logged only, not in profile |
| 2-3 | `moderate` | Added to profile, applied as soft preference |
| 4-6 | `strong` | Applied as default preference in `/mythos:do` |
| 7+ | `established` | Treated as a personal standard |

Cross-project observations count double — a pattern seen in 2 different projects at 1 observation each = `moderate` confidence.

## Output Contract

```
▸ MythOS  ·  taste
──────────────────────────────────────────
  scanned        [N] Claude commits, [N] files
  accepted       [N] files ([N]%)
  corrected      [N] files ([N]%)
  rejected       [N] files ([N]%)

  NEW PATTERNS
  · [category]: [pattern] (observation [N])

  STRENGTHENED PATTERNS
  · [category]: [pattern] ([old-confidence] → [new-confidence])

  PROFILE
  [N] total patterns ([N] strong, [N] moderate, [N] weak)
  acceptance rate: [N]% ([trend] vs previous)

  taste profile → ~/.mythos/taste/profile.md
──────────────────────────────────────────
```

## Edge Cases

- **No Claude commits found:** Report "No Claude-authored commits found in last 30 days. Make sure commits include a session URL or are authored by Claude."
- **No human follow-ups:** Report "No human edits found after Claude commits. Nothing to learn yet."
- **First run (no `~/.mythos/taste/` exists):** Create the directory structure and run analysis.
- **Merge commits:** Skip — they don't represent human corrections.
- **Large diffs (>500 lines):** Summarize at file level rather than hunk level to avoid noise.
