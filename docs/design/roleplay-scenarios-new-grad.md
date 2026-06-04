---
_context_protocol:
  description: "Design note for the reviewed New Grad & Intern roleplay additions."
  purpose: "Documents the new-grad scenarios retained after PR review."
  architecture: "The final new-grad additions are generated from scripts/generate-all-roleplays.js and registered in scenarios-registry.md."
  key_elements:
    - scripts/generate-all-roleplays.js
    - skills/roleplay/citation-plagiarism-accusation/scenario.md
    - skills/roleplay/over-promised-deadline-crisis/scenario.md
  relation_to_codebase: "Records the narrowed New Grad & Intern scope after review feedback."
  similar_files:
    - docs/design/roleplay-scenarios-expansion.md
---

# Design Doc: Reviewed New Grad Roleplay Scenarios

**Status:** Updated after review
**Author:** Antigravity
**Created:** 2026-06-03
**Last Updated:** 2026-06-04

---

## 1. Overview

The original new-grad draft proposed 15 scenarios. Review comments explicitly kept two new-grad scenarios in this PR:

1. `citation-plagiarism-accusation`
2. `over-promised-deadline-crisis`

All other new-grad draft scenarios are removed from the generated output and registry.

---

## 2. Requirements

- Generate each retained scenario with both `scenario.md` and `rubric.md`.
- Keep each retained scenario registered in `skills/roleplay/scenarios-registry.md`.
- Ensure rubrics use scenario-specific dimensions rather than broad shared category templates.
- Ensure stale generated new-grad scenario folders are removed when the generator runs.

---

## 3. Implementation

The active new-grad slugs are part of `ACTIVE_SCENARIO_SLUGS` in `scripts/generate-all-roleplays.js`. The generator removes stale generated folders, writes the retained scenarios, and rewrites the registry without stale generated rows.

---

## 4. Verification

Run:

```bash
node scripts/generate-all-roleplays.js
node scripts/test-roleplay-scenarios-expansion.js
npm test
```

These checks confirm the retained new-grad scenarios exist, their markdown schemas are valid, the registry includes them, and the CLI test suite still passes.
