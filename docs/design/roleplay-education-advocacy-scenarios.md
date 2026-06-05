# Design Doc: Roleplay Education Advocacy Scenarios

**Status:** Draft
**Author:** Codex
**Created:** 2026-06-04
**Last Updated:** 2026-06-04

---

## 1. Overview

This feature expands the `/roleplay` catalog with 25 high-school and college education advocacy scenarios. The goal is to train students, parents, and early-career learners to navigate school systems ethically: reading policy, preparing evidence, making bounded asks, escalating respectfully, and closing on concrete next steps. The implementation will follow the accepted PR #94 pattern: scenario metadata is added to the roleplay generator, each scenario produces a `scenario.md` and scenario-specific `rubric.md`, the central registry is updated, and a focused verification script proves the generated files are complete and discoverable.

---

## 2. Goals & Non-Goals

### Goals

- Add 25 curated roleplay scenario folders under `skills/roleplay/`, each with `scenario.md` and `rubric.md`.
- Cover both high-school and college institutional contexts, including teachers, counselors, principals, professors, registrars, aid offices, conduct offices, coaches, and accommodation staff.
- Use PR #94 as the quality bar: scenario-specific character profiles, difficult opening lines, realistic pushback, 15 non-overlapping rubric dimensions, and weighted scoring.
- Update `skills/roleplay/scenarios-registry.md` so `/roleplay` discovers the new scenarios.
- Extend the roleplay generation script so the new scenario files can be regenerated consistently.
- Add a dedicated verification script for this scenario batch and run it before PR creation.
- Preserve the roleplay installer behavior from PR #94: `roleplay` category installation should still install only `roleplay` and `create-roleplay`.

### Non-Goals

- No changes to the active roleplay runtime in `skills/roleplay/SKILL.md`.
- No changes to the create-roleplay factory in `skills/create-roleplay/SKILL.md`.
- No changes to top-level installable skill categories in `skills-manifest.json`; these are roleplay scenario data files, not standalone `SKILL.md` skills.
- No attempt to create legally precise education-law advice. The scenarios train communication and institutional navigation, not legal representation.
- No manipulative, dishonest, or policy-evading scenarios. The content must teach ethical advocacy inside the rules of the institution.
- No changes to package binaries or installer shims unless verification finds a regression caused by the scenario work.

---

## 3. Background & Context

PR #94 merged the reviewed version of the roleplay expansion after PR #91 review comments. The important precedent is that a large generated batch was narrowed to a curated set, generic rubrics were replaced with scenario-specific dimensions, and the roleplay registry became the discovery surface for scenario selection. The merged repository now has central roleplay skill files plus scenario folders such as `academic-integrity-defense`, `emergency-deadline-extension`, `appealing-exam-grade`, `joining-competitive-research-lab`, and `asking-professor-letter-of-recommendation`.

The current roleplay catalog is already useful for college-facing academic conversations, but it does not yet cover the broader high-school and college advocacy moments where students and families often lose opportunities because they do not know how to ask, document, appeal, or escalate. This feature builds that next layer. It should teach users how educational systems actually make decisions: policy compliance, evidence, timing, respectful pressure, institutional empathy, and clear follow-through.

The repository is a Node.js ES module package with no third-party runtime dependencies for this area. Scenario generation and verification use Node standard library APIs. The working tree observed during audit is dirty and local `main` was behind `origin/main`; implementation must happen only after approval in an isolated worktree based on updated main, per the design-doc workflow.

---

## 4. Requirements

### Functional Requirements

1. Generate exactly 25 new education advocacy scenario folders under `skills/roleplay/`.
2. Each new scenario folder must contain exactly two committed files: `scenario.md` and `rubric.md`.
3. Each `scenario.md` must include the existing roleplay schema sections:
   - `## Character Identity`
   - `## Character Personality`
   - `## Character Knowledge Profile`
   - `## Character Emotional Profile`
   - `## The Situation`
   - `## Your Role`
   - `## Character Goals`
   - `## Opening Line`
   - `## Example Character Responses`
   - `## Conversation Guidelines`
   - `## User Context Questions`
   - `## Scenario Adaptation`
4. Each `rubric.md` must include `## Scoring Dimensions`, `## Overall Score`, and `## Scoring Notes`.
5. Each rubric must contain exactly 15 numbered dimensions.
6. Each rubric dimension must contain `Weight`, `Measures`, `Things to Look For`, and score anchors for 1, 2, 3, 4, and 5.
7. Each rubric's weight sum must be between 50 and 80.
8. Each scenario must be registered in `skills/roleplay/scenarios-registry.md` with a slug, display name, and one-line description.
9. Registry updates must preserve the existing header and existing rows.
10. Scenario slugs must be lowercase hyphen-case and must not collide with existing PR #94 slugs.
11. The generator must preserve the existing PR #94 scenario set and continue generating the 11 merged scenarios.
12. `node scripts/test-roleplay-education-advocacy-scenarios.js` must pass.
13. `node scripts/test-roleplay-scenarios-expansion.js` must continue to pass.
14. `npm run validate` and `npm test` must pass before PR creation.

The 25 scenarios to add are:

| Slug | Display Name | Primary Institution Level |
|------|--------------|---------------------------|
| teacher-grade-correction-request | Teacher Grade Correction Request | High school and college |
| make-up-test-after-absence | Make-Up Test After Absence | High school and college |
| late-assignment-penalty-reduction | Late Assignment Penalty Reduction | High school and college |
| retake-or-test-correction-request | Retake or Test Correction Request | High school |
| class-placement-appeal | Class Placement Appeal | High school |
| advanced-course-permission | Advanced Course Permission | High school and college |
| schedule-conflict-resolution | Schedule Conflict Resolution | High school and college |
| counselor-recommendation-advocacy | Counselor Recommendation Advocacy | High school |
| disciplinary-record-appeal | Disciplinary Record Appeal | High school and college |
| bullying-harassment-escalation | Bullying or Harassment Escalation | High school |
| iep-504-accommodation-meeting | IEP/504 Accommodation Meeting | High school |
| temporary-injury-accommodation | Temporary Injury Accommodation | High school and college |
| mental-health-support-plan | Mental Health Support Plan | High school and college |
| attendance-policy-exception | Attendance Policy Exception | High school and college |
| athletic-eligibility-appeal | Athletic Eligibility Appeal | High school and college |
| scholarship-deadline-rescue | Scholarship Deadline Rescue | High school and college |
| financial-aid-correction-meeting | Financial Aid Correction Meeting | College |
| transcript-error-correction | Transcript Error Correction | High school and college |
| graduation-requirement-exception | Graduation Requirement Exception | High school and college |
| community-service-hour-dispute | Community Service Hour Dispute | High school |
| work-study-schedule-accommodation | Work-Study Schedule Accommodation | College |
| parent-teacher-conference-self-advocacy | Parent-Teacher Conference Self-Advocacy | High school |
| group-project-contribution-dispute | Group Project Contribution Dispute | High school and college |
| unsafe-classroom-lab-concern | Unsafe Classroom/Lab Concern | High school and college |
| alternative-assignment-pathway-pitch | Alternative Assignment Pathway Pitch | High school and college |

### Non-Functional Requirements

- Maintainability: scenario metadata should live in the existing roleplay generator rather than scattered manual files.
- Consistency: generated files must follow PR #94 heading and registry conventions.
- Reviewability: the batch must be curated and finite, not an unbounded dump of all brainstormed scenarios.
- Safety: scenario language must frame advocacy as ethical, evidence-based, and policy-aware.
- Portability: no new dependencies; scripts must run under the existing Node >=18 package configuration.
- Determinism: repeated generator runs should produce the same files and avoid duplicate registry rows.

---

## 5. High-Level Design

The implementation will extend `scripts/generate-all-roleplays.js`, which PR #94 introduced as the metadata-driven source for roleplay scenario files. The new scenario metadata will be added as a curated education advocacy batch. The generator will combine the existing PR #94 shipped scenarios with the new batch and write all scenario/rubric pairs under `skills/roleplay/`.

The scenario files are data consumed by the existing `/roleplay` skill. There is no runtime API change. Discovery continues to flow through the registry:

```text
scenario metadata -> generate-all-roleplays.js
                  -> skills/roleplay/<slug>/scenario.md
                  -> skills/roleplay/<slug>/rubric.md
                  -> skills/roleplay/scenarios-registry.md
                  -> /roleplay menu and /roleplay <slug>
```

The generator should preserve the accepted PR #94 behavior while improving naming clarity where touched. In PR #94, symbols such as `getReviewedScenarios` describe the review-filtered subset from PR #91. This feature will either keep those names for minimal churn or rename only the necessary local concepts to "shipped" or "curated" if the code remains clear and tests prove no registry behavior changed.

The new dedicated verification script will validate the new batch. It will not replace `scripts/test-roleplay-scenarios-expansion.js`; that script remains the guard for the PR #94 scenario set and installer category behavior.

---

## 6. Detailed Design

### 6.1 Roleplay Generator Extension

**File(s):** `scripts/generate-all-roleplays.js`
**Type:** Modified

#### What it does

Adds the 25 education advocacy scenario definitions to the generator and ensures they are included in the generated output and registry.

#### Interface / API

```javascript
class EducationAdvocacyScenarioBatch {
  getScenarios() {}
  getRubricDimensionsBySlug() {}
}

class RoleplayScenarioGenerator {
  generateAll() {}
}
```

The existing script is currently function-oriented. During implementation, non-trivial new logic should be introduced behind classes to satisfy the design-doc code style requirements while keeping the file executable with `node scripts/generate-all-roleplays.js`.

#### Logic / Algorithm

1. Define metadata for 25 scenarios with slug, display name, category, one-line description, character identity, character personality, school level, institutional role, opening line, guidelines, and user context questions.
2. Define scenario-specific rubric dimensions for all 25 scenarios.
3. Combine existing PR #94 shipped scenarios with the new education advocacy scenarios.
4. Sanitize each slug with the existing hyphen-case behavior.
5. Create `skills/roleplay/<slug>/` if missing.
6. Write `scenario.md` using the existing schema and the scenario-specific character metadata.
7. Write `rubric.md` using the 15 scenario-specific dimensions.
8. Read the existing registry, preserve existing rows, remove duplicates for generated slugs, and append missing new rows.
9. Leave top-level `skills-manifest.json` unchanged because only `roleplay` and `create-roleplay` are installable roleplay skills.

#### Edge Cases & Error Handling

- If a slug collides with an existing scenario, the generator must keep one row and one folder, not duplicate registry rows.
- If a rubric definition is missing for a new slug, the test script must fail rather than allowing fallback generic dimensions.
- If the registry file is missing, the generator may recreate the standard header, matching current behavior.
- If a scenario folder contains a `SKILL.md`, stale cleanup must not delete it because it could be a real top-level-style skill folder nested by mistake.

### 6.2 Generated Scenario Files

**File(s):** `skills/roleplay/<new-slug>/scenario.md`
**Type:** New file

#### What it does

Each file defines one realistic character simulation for an education advocacy conversation.

#### Interface / API

```markdown
# Scenario: <Display Name>
## Character Identity
## Character Personality
## Character Knowledge Profile
## Character Emotional Profile
## The Situation (From <Character>'s POV)
## Your Role (The User's POV)
## Character Goals
## Opening Line
## Example Character Responses
## Conversation Guidelines
## User Context Questions
## Scenario Adaptation
```

#### Logic / Algorithm

1. Character roles will match the institution level: high-school teacher, counselor, assistant principal, coach, special education coordinator, registrar, professor, financial aid officer, or workplace supervisor for work-study.
2. Opening lines must create immediate realistic pressure.
3. Conversation guidelines must define what causes refusal, conditional approval, escalation, and de-escalation.
4. User context questions must be scenario-specific and ask for details that affect the simulation.

#### Edge Cases & Error Handling

- Scenarios involving bullying, harassment, mental health, IEP/504, or conduct issues must avoid pretending the model is a lawyer or therapist.
- High-school scenarios may involve parents, but the user role should preserve student agency unless the scenario is explicitly family-facing.
- All content should teach documentation and process rather than intimidation or dishonesty.

### 6.3 Generated Rubric Files

**File(s):** `skills/roleplay/<new-slug>/rubric.md`
**Type:** New file

#### What it does

Each rubric scores the user's roleplay performance against 15 scenario-specific dimensions calibrated for exceptionalism.

#### Interface / API

```markdown
# Rubric: <Display Name>
## Scoring Dimensions
### 1. <Dimension Name>
**Weight:** <1-5>
**Measures:** <specific sentence>
**Things to Look For:** <observable signals>
**Score 1 - Weak:** <behavioral anchor>
**Score 2:** <behavioral anchor>
**Score 3 - Adequate:** <behavioral anchor>
**Score 4:** <behavioral anchor>
**Score 5 - Strong:** <behavioral anchor>
## Overall Score
## Scoring Notes
```

#### Logic / Algorithm

1. Use exactly 15 dimensions per scenario.
2. Reserve weight 5 for the primary signals in that scenario.
3. Keep total weights between 50 and 80.
4. Include scoring notes that name the primary signal dimensions and warn against rewarding manipulative or dishonest advocacy.

#### Edge Cases & Error Handling

- Rubrics must not collapse into generic dimensions like "clarity" repeated across scenarios without scenario-specific behavior.
- Rubrics must distinguish high-school contexts from college contexts where authority, parent involvement, and records differ.
- Rubrics must not reward hiding evidence, exaggerating emergencies, or bypassing required processes.

### 6.4 Scenarios Registry

**File(s):** `skills/roleplay/scenarios-registry.md`
**Type:** Modified

#### What it does

Adds 25 new rows so `/roleplay` can discover the new scenarios.

#### Interface / API

```markdown
| <slug> | <Display Name> | <one-line description> |
```

#### Logic / Algorithm

1. Preserve the registry heading and table header.
2. Preserve existing rows from PR #94 and earlier launch scenarios.
3. Append the 25 education advocacy rows.
4. De-duplicate by slug if the generator is run multiple times.

#### Edge Cases & Error Handling

- Duplicate slugs should not create duplicate menu entries.
- One-line descriptions should remain concise enough to scan in the `/roleplay` menu.

### 6.5 Education Advocacy Verification Script

**File(s):** `scripts/test-roleplay-education-advocacy-scenarios.js`
**Type:** New file

#### What it does

Verifies the new scenario batch after generation.

#### Interface / API

```javascript
class EducationAdvocacyScenarioVerifier {
  run() {}
}
```

#### Logic / Algorithm

1. Load the expected 25 slugs.
2. Verify each folder exists and contains exactly `scenario.md` and `rubric.md`.
3. Verify required scenario and rubric headings.
4. Verify each rubric has exactly 15 dimensions.
5. Verify all dimensions include weights and five score anchors.
6. Verify weight sums are between 50 and 80.
7. Verify all slugs appear in `scenarios-registry.md` exactly once.
8. Verify `node bin/install.js roleplay --dry-run` still includes `roleplay` and `create-roleplay` and does not include unrelated skills.
9. Print one `PASS` or `FAIL` label per test and exit non-zero on failure.

#### Edge Cases & Error Handling

- The script must fail on missing files, duplicate registry rows, malformed weights, missing anchors, or wrong installer filtering.
- The script should report the slug and test name in failures so review fixes are direct.

---

## 7. Data Model Changes

### 7.1 Roleplay Scenario Metadata

**Change type:** Modified

```typescript
type RoleplayScenarioMetadata = {
  slug: string;
  name: string;
  category: string;
  oneLiner: string;
  schoolLevel?: "high-school" | "college" | "both";
  characterName: string;
  characterAge: number;
  characterRole: string;
  characterBackground: string;
  coreTraits: string;
  communicationStyle: string;
  decisionMaking: string;
  authorityRelation: string;
  petPeeves: string;
  respectEarned: string;
  expertise: string;
  seenTooMuch: string;
  startingEmotionalState: string;
  openingLine: string;
  guidelines: string[];
  userQuestions: string[];
  rubricDimensions: RubricDimension[];
};

type RubricDimension = {
  name: string;
  w: number;
  measures: string;
  lookFor: string;
};
```

**Migration strategy:** N/A - this is in-repository generator metadata, not persisted user data.

---

## 8. API Changes

N/A - no backend HTTP API, CLI command contract, or package binary change is planned.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/roleplay-education-advocacy-scenarios.md` | Design document and implementation source of truth |
| MODIFY | `scripts/generate-all-roleplays.js` | Add education advocacy scenario metadata, rubric dimensions, and generation inclusion |
| CREATE | `scripts/test-roleplay-education-advocacy-scenarios.js` | Dedicated verification script for the new batch |
| MODIFY | `skills/roleplay/scenarios-registry.md` | Register the 25 new roleplay scenarios |
| CREATE | `skills/roleplay/teacher-grade-correction-request/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/teacher-grade-correction-request/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/make-up-test-after-absence/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/make-up-test-after-absence/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/late-assignment-penalty-reduction/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/late-assignment-penalty-reduction/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/retake-or-test-correction-request/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/retake-or-test-correction-request/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/class-placement-appeal/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/class-placement-appeal/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/advanced-course-permission/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/advanced-course-permission/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/schedule-conflict-resolution/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/schedule-conflict-resolution/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/counselor-recommendation-advocacy/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/counselor-recommendation-advocacy/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/disciplinary-record-appeal/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/disciplinary-record-appeal/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/bullying-harassment-escalation/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/bullying-harassment-escalation/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/iep-504-accommodation-meeting/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/iep-504-accommodation-meeting/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/temporary-injury-accommodation/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/temporary-injury-accommodation/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/mental-health-support-plan/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/mental-health-support-plan/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/attendance-policy-exception/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/attendance-policy-exception/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/athletic-eligibility-appeal/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/athletic-eligibility-appeal/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/scholarship-deadline-rescue/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/scholarship-deadline-rescue/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/financial-aid-correction-meeting/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/financial-aid-correction-meeting/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/transcript-error-correction/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/transcript-error-correction/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/graduation-requirement-exception/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/graduation-requirement-exception/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/community-service-hour-dispute/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/community-service-hour-dispute/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/work-study-schedule-accommodation/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/work-study-schedule-accommodation/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/parent-teacher-conference-self-advocacy/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/parent-teacher-conference-self-advocacy/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/group-project-contribution-dispute/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/group-project-contribution-dispute/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/unsafe-classroom-lab-concern/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/unsafe-classroom-lab-concern/rubric.md` | New roleplay rubric |
| CREATE | `skills/roleplay/alternative-assignment-pathway-pitch/scenario.md` | New roleplay scenario |
| CREATE | `skills/roleplay/alternative-assignment-pathway-pitch/rubric.md` | New roleplay rubric |

---

## 10. Testing Plan

### Unit Tests

- [Edge Case] `EducationAdvocacyScenarioVerifier` -> verifies the expected slug list contains exactly 25 entries and no duplicates.
- [Hidden Assumption] `EducationAdvocacyScenarioVerifier` -> fails if any expected slug is not lowercase hyphen-case.
- [Silent Failure] `EducationAdvocacyScenarioVerifier` -> fails if a slug appears in the registry more than once.
- [Hidden Failure] `EducationAdvocacyScenarioVerifier` -> fails if a scenario folder is present but one of `scenario.md` or `rubric.md` is missing.
- [Edge Case] `EducationAdvocacyScenarioVerifier` -> fails if any scenario folder contains files beyond `scenario.md` and `rubric.md`.
- [Hidden Assumption] `EducationAdvocacyScenarioVerifier` -> fails if a generated scenario is accidentally created as a top-level installable skill with `SKILL.md`.
- [Silent Failure] `EducationAdvocacyScenarioVerifier` -> fails if a registry row points to the wrong display name for a slug.
- [Hidden Failure] `EducationAdvocacyScenarioVerifier` -> fails if `scenario.md` is missing any required roleplay heading.
- [Hidden Failure] `EducationAdvocacyScenarioVerifier` -> fails if `rubric.md` is missing `## Scoring Dimensions`, `## Overall Score`, or `## Scoring Notes`.
- [Silent Failure] `EducationAdvocacyScenarioVerifier` -> fails if a rubric has fewer or more than 15 dimensions while still appearing readable.
- [Hidden Assumption] `EducationAdvocacyScenarioVerifier` -> fails if any rubric dimension lacks a numeric `Weight`.
- [Edge Case] `EducationAdvocacyScenarioVerifier` -> fails if any rubric weight is below 1 or above 5.
- [Silent Failure] `EducationAdvocacyScenarioVerifier` -> fails if any rubric weight sum is outside the 50-80 range.
- [Hidden Failure] `EducationAdvocacyScenarioVerifier` -> fails if any dimension lacks any of the five score anchors.
- [Hidden Assumption] `EducationAdvocacyScenarioVerifier` -> fails if a scenario with sensitive context lacks guidance discouraging dishonest or unsafe escalation.

### Integration Tests

- [Hidden Failure] Run `node scripts/generate-all-roleplays.js`, then verify all 25 folders and registry rows exist.
- [Silent Failure] Run the generator twice and verify registry row counts do not increase on the second run.
- [Hidden Assumption] Run `node scripts/test-roleplay-scenarios-expansion.js` to ensure the PR #94 scenarios still pass after generator changes.
- [Silent Failure] Run `node bin/install.js roleplay --dry-run` and verify output includes `roleplay` and `create-roleplay` but excludes unrelated skills such as `daily-review` and `explain`.
- [Hidden Failure] Run `npm run validate` to confirm top-level manifest validation still passes.
- [Hidden Failure] Run `npm test` to confirm the repository's existing validation, smoke, CLI security, and CLI smoke checks still pass.

### Manual / QA Test Cases

1. [Edge Case] Open `skills/roleplay/scenarios-registry.md` and confirm the new rows are appended below the existing PR #94 rows without reformatting the header.
2. [Silent Failure] Pick three scenarios, run `/roleplay <slug>` mentally against the loading contract, and confirm each slug maps to a real `scenario.md` and `rubric.md`.
3. [Hidden Assumption] Review sensitive scenarios (`bullying-harassment-escalation`, `iep-504-accommodation-meeting`, `mental-health-support-plan`) and confirm they train communication and process rather than giving legal, clinical, or unsafe advice.
4. [Hidden Failure] Review five random rubrics and confirm dimensions are scenario-specific rather than generic copies with only names changed.
5. [Edge Case] Confirm high-school-specific scenarios do not assume the user can make adult college-style registrar decisions without guardian, counselor, or school policy involvement where relevant.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Node.js | >=18 from `package.json` | Run generator and verification scripts | Low; existing project baseline |
| GitHub CLI | Local authenticated `gh` | Create final draft PR after implementation | Medium; PR creation blocked if auth is missing |
| External services | N/A | No runtime external calls planned | N/A |

---

## 12. Rollout & Deployment

- After approval, create an isolated worktree from updated `main`.
- Commit this design doc first.
- Implement generator metadata and verification script.
- Run the generator to create scenario/rubric files and update the registry.
- Run `node scripts/test-roleplay-education-advocacy-scenarios.js`.
- Run `node scripts/test-roleplay-scenarios-expansion.js`.
- Run `npm run validate`.
- Run `npm test`.
- Push the branch and open a draft PR targeting `main`.

Rollback procedure: revert the PR commit(s). Since this feature only adds generated markdown scenario files and modifies the generator/registry, rollback is a normal Git revert with no data migration.

---

## 13. Open Questions

- [ ] Should the implementation ship exactly these 25 scenarios, or should any be swapped for scenarios from the earlier 30-item brainstorm before approval?
- [ ] Should the generator terminology be renamed from "reviewed scenarios" to "shipped scenarios" while touching the file, or should naming churn be avoided?
- [ ] Should `npm test` be updated to include the new education advocacy verification script, or should the script remain manually invoked like the PR #94 roleplay script?
- [ ] The local working tree is dirty and `main` was behind `origin/main` during audit. Before Phase 3, should I proceed by creating a worktree from updated `origin/main` if local `main` remains dirty, or should local `main` be cleaned/pulled by you first?

---

## 14. Alternatives Considered

### Alternative 1: Manually write all 50 markdown files

- What: Create every `scenario.md` and `rubric.md` directly by hand.
- Why rejected: It is review-hostile, easy to drift from the schema, and inconsistent with the PR #94 generator pattern.

### Alternative 2: Add all 30 brainstormed scenarios

- What: Ship the entire broader brainstorm from the previous discussion.
- Why rejected: PR #94 showed that curated scope is better than a broad generated dump. A 25-scenario batch is large enough to cover the domain while keeping review feasible.

### Alternative 3: Create top-level installable skills for each education scenario

- What: Add 25 new `skills/<slug>/SKILL.md` folders.
- Why rejected: The existing architecture treats roleplay scenarios as data loaded by the central `/roleplay` skill. Making each scenario installable would bloat `skills-manifest.json` and break the current roleplay discovery model.

### Alternative 4: Create a separate education-roleplay generator script

- What: Add `scripts/generate-education-advocacy-roleplays.js` instead of modifying `scripts/generate-all-roleplays.js`.
- Why rejected: PR #94 established one generator as the source for shipped roleplay scenarios. A second generator would create uncertainty about which script owns the registry and stale scenario cleanup.
