---
_context_protocol:
  description: "Design document detailing the expansion of the roleplay skill system with 47 new scenarios across Tech/Professional, Corporate, and Student categories, plus command shimming."
  purpose: "To provide a detailed architecture, implementation manifest, and verification plan for scaling the roleplay catalog using a metadata-driven generator."
  architecture: "Uses a Node.js generation script to translate a scenario metadata database into individual scenario/rubric markdown files, updates the scenarios registry, and registers category installers."
  key_elements:
    - docs/design/roleplay-scenarios-expansion.md: This design document
    - scripts/generate-all-roleplays.js: Metadata-driven generator script
    - skills/roleplay/scenarios-registry.md: Central scenarios registry index
  relation_to_codebase: "Serves as the blueprint for expanding the data files used by the /roleplay central skill."
  similar_files:
    - docs/design/roleplay-skill-system.md
---

# Design Doc: Roleplay Scenarios Expansion

**Status:** Draft
**Author:** Antigravity
**Created:** 2026-06-03
**Last Updated:** 2026-06-03

---

## 1. Overview

This feature expands the `vidbyte-cli` repository's interactive roleplay capability by adding 47 new interpersonal communication scenarios (sub-skills) under the `skills/roleplay/` directory. These scenarios are grouped into three categories: Tech & Professional, Day-to-Day Corporate America, and Student Scenarios. To prevent context window bloat, token inefficiency, and manual copy-paste errors across 94 files, we will implement a centralized Node.js generator script (`scripts/generate-all-roleplays.js`) containing the structured metadata for all 47 scenarios, which will systematically write the standard-compliant `scenario.md` and `rubric.md` files. We also register and document the `npx install roleplay` (and `npx install-roleplay`) command to install only these roleplay category skills.

---

## 2. Goals & Non-Goals

### Goals

- Implement a metadata-driven generator script `scripts/generate-all-roleplays.js` containing complete profiles (identity, personality, guidelines, questions) for all 47 new scenarios.
- Generate 47 new subdirectories under `skills/roleplay/`, each containing:
  - `scenario.md` conforming to the character identity, personality, knowledge, emotional profiles, situation POV, role, goals, opening line, example responses, guidelines, and context questions.
  - `rubric.md` containing 15 non-overlapping dimensions tailored to each domain (Tech, Corporate, Student), with anchors for scores 1, 3, and 5.
- Update `skills/roleplay/scenarios-registry.md` to index all 47 new scenarios.
- Support `npx install roleplay` and `npx install-roleplay` commands to target only the `roleplay` category during installation.
- Pass all validation checks in `validate.js`.

### Non-Goals

- No modification to the core runtime simulator logic in `skills/roleplay/SKILL.md` or the scenario factory `skills/create-roleplay/SKILL.md`.
- No modification to other skill categories (learning, reasoning, utility).

---

## 3. Background & Context

The initial roleplay skill system (PR #90) proved the value of character simulation and rubric scoring, but only included 7 initial scenarios. To turn this into a comprehensive training tool, we need a diverse set of scenarios addressing specific, common, and high-stakes social situations. 

Because hand-writing 94 large markdown files is extremely labor-intensive and prone to schema drift, using a generator script is the optimal approach. It guarantees that all scenarios match the strict schema guidelines from PR #90, are properly formatted, and are registered consistently in the central markdown table.

---

## 4. Requirements

### Functional Requirements

1. **47 Scenario Folders**: Under `skills/roleplay/`, there must be 47 folders (with slugs matching the list).
2. **Standard File Schema**: Each folder must contain a `scenario.md` and a `rubric.md` matching the established format exactly.
3. **Structured Registry**: `skills/roleplay/scenarios-registry.md` must be updated to contain rows for all 47 new scenarios.
4. **Command Shimming**: `npx install roleplay` and `npx install-roleplay` must successfully resolve to installing only `roleplay` and `create-roleplay`.
5. **Lint/Validation Success**: `npm test` (running `validate.js`) must exit with code 0.

### Non-Functional Requirements

- **Consistency**: Rubrics must have exactly 15 dimensions per category, with consistent weights and clear, observable anchors.
- **Maintainability**: The generator script must be clean, readable, and easy to run or extend.

---

## 5. High-Level Design

The 47 scenarios will be defined in a centralized database array inside `scripts/generate-all-roleplays.js`. When executed, the script will:
1. Clear/create the target folders for the 47 scenarios.
2. Generate the files `scenario.md` and `rubric.md` using domain-specific templates.
3. Update `skills/roleplay/scenarios-registry.md` by reading existing entries, removing duplicates, and appending the new entries.

For the installer command, `bin/install.js` and `package.json` already have the necessary shims in place. We will ensure the local modifications to `bin/install.js`, `lib/skill-catalog.js`, and `skills-manifest.json` are fully integrated and verified.

---

## 6. Detailed Design

### 6.1 `scripts/generate-all-roleplays.js`

**File:** `scripts/generate-all-roleplays.js`
**Type:** New file

#### What it does
Houses the database of all 47 scenarios and writes the markdown files to disk.

#### Interface
```javascript
// Run via Node.js: node scripts/generate-all-roleplays.js
function generateAll();
```

#### Logic / Algorithm
1. Loop over each scenario object in the database.
2. Determine domain category (Tech, Corporate, Student).
3. Populate `scenario.md` template with character details, opening lines, custom guidelines, and questions.
4. Populate `rubric.md` template with 15 domain-tailored dimensions, customizing behavioral descriptions for each scenario.
5. Create folder if it doesn't exist; write files.
6. Append row to `skills/roleplay/scenarios-registry.md` if not already present.

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
| CREATE | `docs/design/roleplay-scenarios-expansion.md` | This design doc |
| CREATE | `scripts/generate-all-roleplays.js` | Metadata generator script |
| MODIFY | `skills/roleplay/scenarios-registry.md` | Registry update to index 47 new scenarios |

---

## 10. Testing Plan

### Automated Test Cases

- **Verify Directory Schema [Edge Case]**: Verify that all 47 generated folders contain exactly `scenario.md` and `rubric.md`.
- **Verify Header Structure [Hidden Failure]**: Ensure all generated files have the correct markdown headings and sections.
- **Verify Manifest and Installer [Hidden Assumption]**: Run `npm test` (validate.js) to confirm no linter errors.
- **Verify Command Filter [Silent Failure]**: Test `npx install roleplay` in dry-run mode to ensure only roleplay skills are staged for install.

### Manual / QA Test Cases

1. Run `node scripts/generate-all-roleplays.js` and verify all files are generated without error.
2. Run `npm test` to verify that `validate.js` passes.
3. Check the scenarios menu by invoking `/roleplay` in the CLI to see the expanded 47 options.

---

## 11. Dependencies & External Services

No new dependencies. Runs on standard Node.js libraries (`fs`, `path`).

---

## 12. Rollout & Deployment

- Run generator script locally.
- Validate all files.
- Commit all changes and open draft PR.

---

## 13. Open Questions

- [ ] Are all 47 scenarios listed with their exact names? Yes, mapped directly from request.

---

## 14. Alternatives Considered

### Alternative 1: Writing files manually
- **Why rejected**: Context limit exhaustion, high risk of typos, high maintenance overhead.

---
