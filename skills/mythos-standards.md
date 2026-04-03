---
name: mythos:standards
description: Keeps standards.md sharp. Uses Context Tree evidence — outcomes, lessons, audit history — to propose specific wording improvements.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /mythos:standards

**Output contract:**
- Read `.mythos/context/standards.md`
- Search Context Tree for evidence:
  - `outcomes/` — scored outputs revealing standards gaps
  - `lessons/` — failures caused by unclear or missing standards
  - `operations/audit-history/` — audit score trends per dimension
  - `constraints/` — rules that may need elevation to standards
- For each standards.md section, check if evidence reveals a consistent gap
- Propose specific wording changes — each backed by score delta evidence
- Format each proposal: current wording → proposed wording, evidence: "+N pts on [dimension] in [N] sessions"
- If `.mythos/context/product.md` shows the product has significantly changed, offer to re-run the 5 install questions

**Relation-aware analysis:** Follow relation links from low-scoring entries back to the standards they were evaluated against. If multiple entries score poorly on the same standard, the standard wording likely needs sharpening.

Do not modify standards.md without showing the proposed diff and confirming with the user first.
