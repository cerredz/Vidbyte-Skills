---
_context_protocol:
  description: "Design document detailing the addition of 15 New Grad & Intern high-stakes roleplay scenarios to the repository."
  purpose: "To lay out the detailed architecture, file manifest, and verification plan for adding the second batch of roleplay scenarios using the metadata-driven generator."
  architecture: "Extends scripts/generate-all-roleplays.js to include the 15 new scenarios, runs the generator to produce the markdown files, and registers them in scenarios-registry.md."
  key_elements:
    - docs/design/roleplay-scenarios-new-grad.md: This design document
    - scripts/generate-all-roleplays.js: The metadata-driven generator script
    - skills/roleplay/scenarios-registry.md: Central scenarios registry index
  relation_to_codebase: "Serves as the blueprint for expanding the roleplay scenarios catalog under skills/roleplay/."
  similar_files:
    - docs/design/roleplay-scenarios-expansion.md
---

# Design Doc: Roleplay Scenarios New Grad Expansion

**Status:** Draft
**Author:** Antigravity
**Created:** 2026-06-03
**Last Updated:** 2026-06-03

---

## 1. Overview

This feature adds 15 new high-stakes roleplaying scenarios specifically tailored to New Grads & Interns to the `vidbyte-cli` repository. These scenarios address common, high-pressure career challenges such as database crashes, plagiarism accusations, deadline crises, job offer negotiations, and peer boundary disputes. We will extend the existing metadata-driven generator script `scripts/generate-all-roleplays.js` to define these 15 scenarios, generate their `scenario.md` and `rubric.md` files, and register them in `scenarios-registry.md`.

---

## 2. Goals & Non-Goals

### Goals

- Extend `scripts/generate-all-roleplays.js` to include the metadata and profiles for all 15 new scenarios.
- Generate 15 new folders under `skills/roleplay/`, each containing:
  - `scenario.md` conforming to the character identity, personality, knowledge, emotional profiles, situation POV, role, goals, opening line, example responses, guidelines, and context questions.
  - `rubric.md` containing 15 dimensions tailored to the "New Grad & Intern" domain with anchors for scores 1, 3, and 5.
- Update `skills/roleplay/scenarios-registry.md` to index all 15 new scenarios.
- Verify that `npm test` and the custom validation script pass 100% cleanly.

### Non-Goals

- No modifications to the central simulator logic in `skills/roleplay/SKILL.md` or other categories.
- No changes to the CLI installation logic.

---

## 3. Background & Context

The roleplay skill catalog currently contains 54 scenarios (7 initial + 47 added in the first expansion). New graduates and interns face unique, highly stressful social challenges in professional environments where they lack established leverage and tenure. Providing scenarios addressing these specific entry-level situations helps users practice de-escalation, professional communication, and accountability early in their careers.

---

## 4. Requirements

### Functional Requirements

1. **15 New Scenarios**: Under `skills/roleplay/`, there must be 15 new folders with correct slugs.
2. **Standard File Schema**: Each folder must contain a `scenario.md` and a `rubric.md` matching the established format exactly.
3. **Structured Registry**: `skills/roleplay/scenarios-registry.md` must be updated to register all 15 new scenarios.
4. **Validation Success**: `npm test` must run with 0 errors.

### Non-Functional Requirements

- **Consistency**: Rubrics must have exactly 15 dimensions per category, with consistent weights and clear, observable anchors.
- **Tone**: The character profiles must be realistic, challenging, and professional.

---

## 5. High-Level Design

We will add the 15 new scenarios to the database array inside `scripts/generate-all-roleplays.js`. A new domain/category template `"New Grad & Intern"` will be introduced in the script to generate rubrics with dimensions tailored to this domain.

When executed, the script will write the 30 new markdown files (`scenario.md` and `rubric.md` for each of the 15 scenarios) and append them to `scenarios-registry.md`.

---

## 6. Detailed Design

### 6.1 Domain-Specific Rubric Dimensions

The `"New Grad & Intern"` domain will use the following 15 scoring dimensions:

1. **Immediate Accountability**: Taking ownership without deflecting blame.
2. **Technical Clarity**: Explaining issues or designs without confusing jargon.
3. **Professional Composure**: Remaining calm and focused under scrutiny.
4. **Solution Orientation**: Coming with options and recommendations, not just problems.
5. **Boundary Firmness**: Maintaining integrity and refusing unethical directives.
6. **Negotiation Strategy**: Structuring salary or schedule requests with data.
7. **Listening and Synthesis**: Active listening and integrating supervisor feedback.
8. **Respect for Hierarchy**: Communicating constructively with senior staff.
9. **Actionability of proposals**: Proposing clear, time-bound steps with owners.
10. **Ethical Decision-Making**: Integrity when discovering fraud or data directives.
11. **Risk Awareness**: Understanding downstream operational impacts.
12. **Clarity of Asks**: Specificity and bounding of resource or schedule requests.
13. **composure under critique**: Constructive response to public or harsh feedback.
14. **Time Management Discipline**: Meeting commitments and managing project load.
15. **Closing & Follow-up**: crisp wrap-up of next steps and alignment.

---

## 7. Data Model Changes

N/A - Markdown files only.

---

## 8. API Changes

N/A - No backend HTTP APIs.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/roleplay-scenarios-new-grad.md` | This design doc |
| MODIFY | `scripts/generate-all-roleplays.js` | Adding 15 new scenarios metadata and templates |
| MODIFY | `skills/roleplay/scenarios-registry.md` | Registry update to index 15 new scenarios |

---

## 10. Testing Plan

### Automated Test Cases

- **Verify Directory Schema [Edge Case]**: Verify that all 15 new folders contain exactly `scenario.md` and `rubric.md`.
- **Verify Header Structure [Hidden Failure]**: Ensure all generated files have the correct markdown headings and sections.
- **Verify Manifest and Installer [Hidden Assumption]**: Run `npm test` (validate.js) to confirm no linter errors.
- **Verify Registry Integration [Silent Failure]**: Verify all 15 new slugs are present in `scenarios-registry.md`.

### Manual / QA Test Cases

1. Run `node scripts/generate-all-roleplays.js` and verify files are generated.
2. Run `npm test` and `node scripts/test-roleplay-scenarios-expansion.js` (extended for the new list).
3. Validate `/roleplay` launches a new scenario (e.g. `accidental-database-crash`) correctly.

---

## 11. Dependencies & External Services

No new dependencies.

---

## 12. Rollout & Deployment

- Run generator script locally.
- Validate all files.
- Commit all changes and open draft PR.

---

## 13. Open Questions

- None.

---

## 14. Alternatives Considered

N/A - Generator pattern is already proven and active.

---
