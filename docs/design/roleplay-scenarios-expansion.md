---
_context_protocol:
  description: "Design note for the reviewed roleplay scenario expansion."
  purpose: "Documents the final scenario set after PR review comments were applied."
  architecture: "The metadata-driven generator owns the reviewed scenario allowlist, generated markdown files, and registry rows."
  key_elements:
    - scripts/generate-all-roleplays.js
    - scripts/test-roleplay-scenarios-expansion.js
    - skills/roleplay/scenarios-registry.md
  relation_to_codebase: "Keeps the roleplay catalog expansion synchronized with generated artifacts."
  similar_files:
    - docs/design/roleplay-scenarios-new-grad.md
---

# Design Doc: Reviewed Roleplay Scenarios Expansion

**Status:** Updated after review
**Author:** Antigravity
**Created:** 2026-06-03
**Last Updated:** 2026-06-04

---

## 1. Overview

This feature adds only the roleplay scenarios explicitly kept during review. The generator defines the active reviewed set, removes stale generated scenario folders, regenerates the selected `scenario.md` and `rubric.md` files, and updates `skills/roleplay/scenarios-registry.md`.

---

## 2. Final Scenario Set

The reviewed expansion contains 13 generated scenarios:

1. `academic-integrity-defense`
2. `appealing-exam-grade`
3. `asking-for-raise`
4. `asking-professor-recommendation`
5. `bad-code-feedback`
6. `citation-plagiarism-accusation`
7. `discussing-professional-burnout`
8. `emergency-deadline-extension`
9. `handling-missed-deliverable`
10. `joining-competitive-research-lab`
11. `negotiating-remote-work`
12. `over-promised-deadline-crisis`
13. `resigning-from-job`

---

## 3. Review-Driven Changes

- Removed generated scenarios that were not explicitly marked to keep.
- Reframed the AI code contamination scenario as `bad-code-feedback`.
- Reframed the recommendation scenario as a general professor recommendation-letter request.
- Reframed the salary-adjustment scenario as `asking-for-raise`.
- Reframed the manager-specific resignation scenario as `resigning-from-job`.
- Replaced broad category rubrics with scenario-specific rubric dimensions and score anchors.

---

## 4. Implementation Notes

`scripts/generate-all-roleplays.js` remains the source of truth for generated scenario content. It uses `ACTIVE_SCENARIO_SLUGS` to decide which scenarios are emitted and removes stale generated directories from earlier drafts.

Each generated rubric has 15 dimensions. The dimensions are scenario-specific by including the scenario name, character role, scenario prompts, and character-specific evaluation context in the measure and scoring anchors.

---

## 5. Verification

Run:

```bash
node scripts/generate-all-roleplays.js
node scripts/test-roleplay-scenarios-expansion.js
npm test
```

The custom roleplay verification checks directory schema, required markdown headers, registry coverage, and installer category filtering.
