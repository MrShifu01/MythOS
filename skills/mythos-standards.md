---
name: mythos:standards
description: Keeps standards.md sharp. Proposes specific wording improvements backed by score evidence.
allowed-tools: Read, Write, Edit, Glob
---

# /mythos:standards

**Output contract:**
- Read `.mythos/context/standards.md` and `.mythos/memory/outcomes/`
- For each standards.md section, check if scored outcomes reveal a consistent gap
- Propose specific wording changes — each backed by score delta evidence
- Format each proposal: current wording → proposed wording, evidence: "+N pts on [dimension] in [N] sessions"
- If `.mythos/context/product.md` shows the product has significantly changed, offer to re-run the 5 install questions

Do not modify standards.md without showing the proposed diff and confirming with the user first.
