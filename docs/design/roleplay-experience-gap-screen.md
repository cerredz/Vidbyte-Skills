# Design Doc: Roleplay Scenario — Experience Gap Screen

**Status:** Draft — awaiting explicit approval
**Author:** Grok
**Created:** 2026-07-21
**Last Updated:** 2026-07-21

## 1. Overview

Add one new **roleplay scenario** to the existing Roleplay Skill System so candidates can practice the high-stakes screening conversation in which a recruiter objects that the applicant has less experience than the posting requires (new grad → mid-level, mid-level → senior, career switcher into a seniority band, or any field where years-on-paper is the filter).

This is **not** a new top-level skill folder with its own `SKILL.md`. In Vidbyte Skills, roleplay scenarios are **data files** under `skills/roleplay/<slug>/` (`scenario.md` + `rubric.md`), discovered via `scenarios-registry.md` and loaded at runtime by the existing `/roleplay` skill. The model plays a realistic recruiter who opens with (or quickly reaches) the roadblock: "We actually require X years of experience; you have Y." The user must practice **elicitation techniques** — discovery questions that reframe tenure into demonstrated scope, outcomes, and hire-risk reduction — to move past the filter without fabricating experience or arguing seniority by title alone.

## 2. Goals & Non-Goals

### Goals

- Ship a hand-crafted, field-agnostic, level-gap-agnostic scenario pair:
  - `skills/roleplay/experience-gap-screen/scenario.md`
  - `skills/roleplay/experience-gap-screen/rubric.md`
- Register the scenario in `skills/roleplay/scenarios-registry.md` so `/roleplay` discovery lists it and `/roleplay experience-gap-screen` loads it directly.
- Encode the character as a professional **recruiter / talent sourcer** whose default move is the years-of-experience objection, not a full technical hiring manager interview (that is already covered by `job-interview`).
- Personalize X (required years), Y (user years), field, title gap, and company context via **User Context Questions** before the roleplay starts.
- Make the primary skill under practice **elicitation under pressure**: questions that surface must-have vs nice-to-have requirements, first-90-day outcomes, what "years" is a proxy for, and what evidence would change the recruiter's risk assessment.
- Provide a 15–20 dimension rubric calibrated for exceptionalism, with primary weight on elicitation quality, honesty, and advancing to a concrete next step (HM screen, portfolio review, or explicit criteria for reconsideration).
- Optionally mention the scenario in the `/roleplay` skill description/activation list so harness auto-activation can match "experience gap," "not enough years," or "underqualified for the posting" intent.
- Pass the repository's canonical full local CI: `npm test`.

### Non-Goals

- No new top-level skill (`skills/experience-gap-*/SKILL.md`).
- No changes to `create-roleplay` schema, installer, CLI, backend, or auth.
- No `skills-manifest.json` change (scenario data is not a separate manifest entry; only `roleplay` and `create-roleplay` remain in the `roleplay` category).
- No addition to `scripts/generate-all-roleplays.js` `ACTIVE_SCENARIO_SLUGS` (generator output is thinner and uses generic rubric blueprints; this scenario needs scenario-specific elicitation dimensions). Hand-crafted quality bar matches launch scenarios such as `job-interview` and `salary-negotiation`.
- No new test file. Existing `scripts/test-roleplay-scenarios-expansion.js` only validates the 13 generated ACTIVE slugs and must not be extended unless a later change puts this scenario on the generator path.
- No coaching that fabricates employment history, inflates titles, or teaches deception. The skill practices **truthful reframing and discovery**, not resume fraud.
- No full technical interview loop, salary negotiation close, or offer negotiation (existing scenarios cover those stages).
- No UI/web/frontend changes.
- No package version bump required for content-only scenario addition (optional follow-up if maintainers want a release note).

## 3. Background & Context

### Repository roleplay architecture (source of truth)

From `docs/design/roleplay-skill-system.md`, `skills/create-roleplay/SKILL.md`, and live catalog:

| Piece | Role |
|-------|------|
| `skills/roleplay/SKILL.md` | Runtime hub: discovers registry, loads scenario+rubric, simulates character, scores |
| `skills/roleplay/scenarios-registry.md` | Markdown table index (Slug, Display Name, One-Line Description) |
| `skills/roleplay/<slug>/scenario.md` | Character, situation, opening line, guidelines, user context questions |
| `skills/roleplay/<slug>/rubric.md` | 15–20 weighted dimensions with 1–5 behavioral anchors |
| `skills/create-roleplay/SKILL.md` | Factory skill that writes new scenario pairs and appends the registry |
| `skills-manifest.json` → `"roleplay"` | Only `roleplay`, `create-roleplay` |
| `bin/roleplay.js` | Installs the roleplay category (`npx install-roleplay`) |

Scenario folders are **data, not skills**. The validator only requires top-level skill `SKILL.md` contracts; nested scenario markdown is not separate installable skills.

### Required scenario schema (from create-roleplay)

Every scenario must include:

1. Character Identity  
2. Character Personality  
3. Character Knowledge Profile  
4. Character Emotional Profile  
5. The Situation (From the Character's POV) — **first person**  
6. Your Role (The User's POV)  
7. Character Goals  
8. Opening Line — challenging, character-specific  
9. Example Character Responses (weak / strong / deflect / genuine understanding)  
10. Conversation Guidelines  
11. User Context Questions  
12. Scenario Adaptation (present on generated and most hand-crafted scenarios; include for consistency with expansion verification headers)

### Required rubric schema

- 15–20 non-overlapping dimensions  
- Weight 1–5 per dimension; sum of weights 50–80  
- Full anchors Score 1–5, behavioral not abstract  
- `## Scoring Dimensions`, `## Overall Score`, `## Scoring Notes`  
- Primary signal dimensions called out in Scoring Notes  

### Gap in the current catalog

Existing scenarios cover technical interviews (`job-interview`), salary/offer (`salary-negotiation`), promotion (`asking-for-promotion`), and many workplace/academic conflicts. **None** model the recruiter screen whose sole blocking objection is **insufficient years of experience relative to the posting**, with the user's job being to use **elicitation** rather than credentials theater to reopen the pipeline.

That conversation is common, high-stakes, and poorly practiced: candidates either collapse, over-argue "years are a bad metric," invent experience, or monologue impact without learning what the company actually needs.

### Canonical CI

From `package.json`:

```bash
npm test
```

Which runs:

```bash
node ./scripts/validate.js
&& node ./scripts/smoke-test.js
&& node ./scripts/cli-smoke-test.js
&& node ./scripts/cli-security-test.js
&& python ./scripts/test-agent-facing-cli-skills.py
```

Optional diagnostic for roleplay expansion (not required for this hand-crafted slug unless tests are extended):

```bash
node scripts/test-roleplay-scenarios-expansion.js
```

## 4. Requirements

### Functional Requirements

1. **Slug and paths:** Create directory `skills/roleplay/experience-gap-screen/` containing exactly `scenario.md` and `rubric.md` (no extra files committed; `user-context.md` is runtime-generated by `/roleplay` and must not be committed).
2. **Registry row:** Append one row to `skills/roleplay/scenarios-registry.md` without reordering or reformatting existing rows:
   - Slug: `experience-gap-screen`
   - Display Name: `Experience Gap Screen`
   - One-liner (≤100 chars preferred): practice moving a recruiter past "we need X years, you have Y" using elicitation, not resume inflation.
3. **Character:** A named recruiter (hand-crafted full identity: age, role, background, personality contradictions, pet peeves, respect triggers). Default stance: process-bound, risk-averse, measured by pipeline quality and "years" as a coarse proxy for reduced hiring risk.
4. **Opening roadblock:** Opening line (or first substantive beat) must surface the experience gap in concrete form, e.g. required years X vs candidate years Y, using placeholders that the session personalizes from User Context (if skipped, use a concrete default such as 5 years required / 2 years listed).
5. **User skill under practice:** The user must primarily use **elicitation techniques**, including but not limited to:
   - Clarifying what "X years" is a proxy for (scope, autonomy, domain depth, leadership of others, production ownership).
   - Separating must-have requirements from preferred/nice-to-have filters.
   - Eliciting first-90-day / first-year outcomes the hiring manager cares about.
   - Mapping **truthful** transferable work (internships, projects, adjacent roles, intensity/scope) to those outcomes without claiming untrue tenure.
   - Asking what evidence would make the recruiter comfortable advancing the candidate (work sample, HM conversation, portfolio, take-home).
   - Discovering whether similar "under-years" candidates have been hired and what made them succeed.
   - Securing a concrete next step or explicit decision criteria rather than a vague "we'll keep you in mind."
6. **Anti-patterns the character punishes:** fabricating years, title inflation, arguing abstractly that "years don't matter" without evidence, monologuing impact without discovery, becoming adversarial toward the recruiter, begging, or oversharing personal hardship as the main case.
7. **Field and level generality:** Scenario text must not hard-code software-only success criteria. User Context Questions collect field, target title/level, X, Y, and the user's real proof points so the same scenario works for engineering, nursing, sales, design, academia-adjacent roles, trades, etc.
8. **User Context Questions (minimum set):**
   1. Target role, company type (if known), and field.
   2. Years (or equivalent) the posting requires (X) and years the user has on paper (Y).
   3. Nature of the gap (new grad → mid, mid → senior, career switch, title mismatch, domain switch).
   4. Two to three truthful proof points the user can cite (scope, outcomes, leadership of work — not inflated titles).
   5. What the user finds hardest in this conversation (freezing, over-arguing, overselling, etc.).
9. **Rubric:** 15–20 dimensions, weights sum 50–80, Weight 5 on at most 3 primary signals. Primary signals must include elicitation quality, honesty/non-fabrication, and advancement/next-step clarity. Include dimensions for listening, tone control under rejection, mapping evidence to elicited criteria, and exit alignment.
10. **Optional hub touch:** Update `skills/roleplay/SKILL.md` description and/or Activation bullet list to include experience-gap / underqualified-for-posting language so automatic skill routing is more likely. Do not change session flow logic.
11. **Quality bar:** Match hand-crafted depth of `job-interview` / `salary-negotiation` (specific character voice, contradiction, first-person Situation, four distinct example responses, behavioral anchors). Do not ship thin generator-template prose.
12. **CI:** After implementation in an isolated worktree, `npm test` must pass from repo root.

### Non-Functional Requirements

- **Reliability:** Scenario and rubric are static Markdown; no network, secrets, or CLI submission.
- **Security / ethics:** Prompt content must explicitly forbid fabricating employment history. Character may end or cool the conversation if the user invents experience.
- **Compatibility:** Installable via existing roleplay category install; no installer code change required.
- **Observability:** Human-readable files; registry row enables discovery.
- **Canonical full local CI:** `npm test` (see Background).
- **Required remote checks:** Whatever GitHub Actions (if any) or branch protection requires on PRs for this repo; currently package scripts are the primary gate. After draft PR, watch `gh pr checks` and drive green.

## 5. High-Level Design

```
User: /roleplay experience-gap-screen
            |
            v
skills/roleplay/SKILL.md
  - reads scenarios-registry.md (includes new row)
  - reads experience-gap-screen/scenario.md
  - reads experience-gap-screen/rubric.md
  - collects User Context (X, Y, field, proof points)
  - scoring mode A/B
            |
            v
Enter character: Recruiter
  Opening line asserts years gap (X vs Y)
  User practices elicitation to reframe filter
  Character warms only when discovery reduces hire risk
            |
            v
Score against elicitation-first rubric
```

### Design decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Top-level skill vs scenario data | **Scenario data under `roleplay/`** | Matches architecture; avoids manifest bloat; install path already works |
| Generator vs hand-craft | **Hand-craft** | Elicitation dimensions and recruiter voice need specificity generator blueprints lack |
| Character type | **Recruiter / sourcer**, not HM | The roadblock is pipeline filter + years proxy; HM interview is `job-interview` |
| Scope of "winning" | Advance or clarify path, not force hire | Realistic recruiter authority; success = next step or explicit criteria, not job offer |
| Ethics | Truthful reframing only | Aligns with roleplay system integrity dimensions and real-world risk |

## 6. Detailed Design

### 6.1 Scenario data — `scenario.md`

**Files:** `skills/roleplay/experience-gap-screen/scenario.md`  
**Type:** New

#### Responsibility

Define the recruiter character, the experience-gap situation, opening line, example responses, conversation rules, user context questions, and adaptation note so `/roleplay` can run a high-fidelity session.

#### Interface / API

```text
# Scenario: Experience Gap Screen
## Character Identity
## Character Personality
## Character Knowledge Profile
## Character Emotional Profile
## The Situation (From <FirstName>'s POV)   # first person
## Your Role (The User's POV)
## Character Goals
## Opening Line
## Example Character Responses
## Conversation Guidelines
## User Context Questions
## Scenario Adaptation
```

#### Logic / Algorithm (content design)

1. **Character sketch (implementation will flesh fully):**
   - Working name: **Jordan Hale**, Senior Technical Recruiter (title generalized in prose to "recruiter specializing in mid/senior professional hiring" so non-tech fields still map via user context — character history can include tech *and* professional services placements, or be "talent acquisition partner" spanning functions).
   - Contradiction: Warm and conversational on the surface, but **inflexible on risk signals** until the candidate reduces uncertainty with evidence mapped to role outcomes; respects hustle *after* honesty, not before.
   - Pet peeves: inventing years, "titles are just titles" without proof, monologuing, attacking the job description, personal hardship as primary pitch.
   - Respect triggers: precise clarifying questions, honest gap acknowledgment, mapping scope/intensity to outcomes, asking what would make Jordan comfortable advancing the packet.

2. **Situation (character POV, first person):** Jordan is screening applicants for a role posted at level L requiring ~X years. The user's materials show ~Y years (Y < X). Jordan's KPI is qualified pipeline, not "giving people a chance." They will state the gap early and hold it unless the candidate elicits what the years stand for and proves risk is lower than the paper gap implies.

3. **User role:** Applicant with less on-paper experience than the posting; goal is to keep the process alive through discovery and truthful evidence mapping.

4. **Opening line (illustrative — final wording in implementation):**  
   > "I pulled your profile and I want to be straight with you — this role is posted for about [X] years of experience, and I'm seeing closer to [Y] on your side. How do you usually talk people through that gap?"

5. **Conversation guidelines (behavioral rules for the model-in-character):**
   - Open or immediately re-anchor on X vs Y.
   - Do not volunteer the real success criteria until the user elicits them.
   - Warm when the user asks high-quality discovery questions and maps truthful evidence.
   - Cool or shut down if the user fabricates, attacks the filter abstractly without evidence, or monologues without listening.
   - Authority limit: can advance to hiring manager / portfolio review / "not a fit" — cannot extend a formal offer in this scene.
   - Keep responses 2–4 sentences.
   - Personalize X/Y/field from `user-context.md`.

6. **User Context Questions:** as listed in Functional Requirements §8.

#### Edge Cases & Error Handling

- User skips all context → use concrete defaults (e.g., mid-level software role, 5 years required, 2 years experience) and note defaults in character framing.
- User claims more years than Y mid-session without prior context → character treats as credibility break.
- User tries to turn session into full system design interview → character redirects: "That's for the hiring manager; my job is whether you clear this screen."
- Field is non-tech → character vocabulary shifts via Scenario Adaptation / user context (same structure, different domain nouns).

---

### 6.2 Rubric data — `rubric.md`

**Files:** `skills/roleplay/experience-gap-screen/rubric.md`  
**Type:** New

#### Responsibility

Score the user's elicitation-heavy performance against non-overlapping dimensions with exceptionalism calibration.

#### Interface / API

```text
# Rubric: Experience Gap Screen
## Scoring Dimensions
### N. <Name>
**Weight:** ...
**Measures:** ...
**Things to Look For:** ...
**Score 1 — Weak:** ...
**Score 2:** ...
**Score 3 — Adequate:** ...
**Score 4:** ...
**Score 5 — Strong:** ...
## Overall Score
## Scoring Notes
```

#### Planned dimensions (15–18; finalize counts/weights at implementation; sum 50–80)

Primary signals (Weight 5, at most three):

1. **Elicitation of Success Criteria** — extracts what the role must deliver / what "years" proxy for  
2. **Honest Gap Handling** — acknowledges Y < X without fabrication or defensiveness  
3. **Evidence-to-Criteria Mapping** — maps truthful work to elicited criteria, not to a generic "I'm a hard worker" narrative  

High-weight supporting dimensions (Weight 3–4):

4. Must-have vs nice-to-have separation  
5. Question quality (open, specific, non-leading, non-interrogation of the person)  
6. Listening and answer integration (uses recruiter's words in follow-ups)  
7. Risk reduction framing (what lowers hire risk for the company)  
8. Pushback handling when recruiter restates the years filter  
9. Tone under rejection / pressure  
10. Avoiding argument-only stance ("years are dumb") without replacement signal  
11. Concrete next-step ask (HM screen, work sample, criteria for reconsideration)  
12. Time discipline / conversation structure  
13. Domain translation (states transferable scope in the field's language)  
14. Boundary respect for recruiter authority  
15. Exit alignment (owners, timeline, materials to send)  
16. Intellectual honesty on weak spots  
17. Avoiding overclaim / title inflation  
18. Closing summary of mutual understanding  

#### Logic / Algorithm

- Overall = sum(score × weight) / sum(weights)  
- Scoring Notes name the three primary signals and state that fabrication of experience caps multiple dimensions at 1 and may zero the session narrative success regardless of eloquence.

#### Edge Cases & Error Handling

- Short sessions (<3 turns): score only observed dimensions; note "insufficient sample" in report via `/roleplay` report format (no special code).  
- User refuses elicitation and only pitches: low scores on primary elicitation dimensions by design.

---

### 6.3 Registry update

**Files:** `skills/roleplay/scenarios-registry.md`  
**Type:** Modified

#### Responsibility

Make the scenario discoverable by `/roleplay` menu and slug routing.

#### Interface / API

```markdown
| experience-gap-screen | Experience Gap Screen | Practice moving a recruiter past "we need X years, you have Y" using elicitation, not resume inflation. |
```

#### Logic / Algorithm

1. Append row at bottom.  
2. Do not reorder, reformat header, or rewrite existing descriptions.

#### Edge Cases & Error Handling

- Slug collision: none today (verified audit). If collision appears before implementation, choose `experience-years-objection` as fallback slug and update this design doc.

---

### 6.4 Optional hub activation wording

**Files:** `skills/roleplay/SKILL.md`  
**Type:** Modified (optional but recommended)

#### Responsibility

Improve auto-activation match for experience-gap intent without changing flow.

#### Interface / API

- Extend frontmatter `description` with phrases: experience gap, not enough years, underqualified for the posting, recruiter screen on years of experience.  
- Add one Activation bullet for those intents.

#### Logic / Algorithm

Text-only edit; no new steps.

#### Edge Cases & Error Handling

- Keep description length reasonable for harness metadata.

---

### 6.5 Design documentation (this file)

**Files:** `docs/design/roleplay-experience-gap-screen.md`  
**Type:** New (this document)

Committed first on the feature branch after approval, then implementation commits follow.

## 7. Data Model Changes

N/A — no structured database, dataclass, or API schema changes. Scenario/rubric Markdown are the only "data" artifacts; registry is a Markdown table.

## 8. API Changes

N/A — no HTTP, CLI command, or Python router changes. Runtime interface remains:

```text
/roleplay
/roleplay experience-gap-screen
/create-roleplay   # unchanged; not required for shipping this scenario
```

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/roleplay-experience-gap-screen.md` | This design doc; source of truth for implementation |
| CREATE | `skills/roleplay/experience-gap-screen/scenario.md` | Recruiter character + experience-gap scenario content |
| CREATE | `skills/roleplay/experience-gap-screen/rubric.md` | 15–20 elicitation-focused scoring dimensions |
| MODIFY | `skills/roleplay/scenarios-registry.md` | Register slug for discovery |
| MODIFY | `skills/roleplay/SKILL.md` | Optional: activation/description keywords for experience-gap intent |

**Manifest counts:** 3 CREATE, 2 MODIFY, 0 DELETE (if SKILL.md touch is included).  
**Minimum ship set if activation wording is deferred:** 3 CREATE, 1 MODIFY (registry only).

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Existing `/roleplay` skill | local files | Loads and runs scenario | Low — no code change |
| Node ≥18 | package engines | `npm test` | Low |
| None (network) | N/A | Scenario is offline prompt data | None |

## 11. Rollout & Deployment

- **Rollout order:**
  1. Explicit approval of this design doc.
  2. Isolated worktree from clean, current `main` on branch `feat/roleplay-experience-gap-screen`.
  3. Commit design doc first: `docs: add design doc for roleplay-experience-gap-screen`.
  4. Implement scenario + rubric + registry (+ optional SKILL.md wording) in logical commit(s).
  5. Run full `npm test` until green.
  6. Push and open **draft** PR targeting `main` with design doc body.
  7. Watch required remote checks; fix until green.
- **Compatibility:** Additive content only; no breaking change to existing scenarios or installers.
- **Feature flags:** None.
- **Rollback:** Revert the PR / remove `skills/roleplay/experience-gap-screen/` and the registry row (and any SKILL.md wording). No data migration.

## 12. Open Questions

- [x] **Top-level skill vs scenario?** Resolved by architecture: scenario data under `roleplay/`.
- [x] **Generator path?** Resolved: hand-crafted, not `ACTIVE_SCENARIO_SLUGS`.
- [ ] **Character default industry:** Prefer a cross-functional talent partner voice vs explicitly "technical recruiter"? Recommendation: cross-functional talent acquisition partner with examples across functions so non-tech users do not feel software-coded by default. **Needs user confirmation only if they want tech-only.**
- [ ] **Success definition:** Is "advance to HM" the top success, or is "leave with written criteria for reconsideration" equally valid? Recommendation: either is a win; forced hire is out of scope.
- [ ] **SKILL.md activation edit:** Include in this PR (recommended) or registry-only?

If the user does not answer open questions at approval time, implement with recommendations above (cross-functional recruiter, either next-step as win, include SKILL.md activation wording).

## 13. Alternatives Considered

### New top-level skill `skills/experience-gap-practice/SKILL.md`

- What: Standalone prompt skill that embeds the whole scenario in SKILL.md.
- Why rejected: Duplicates the roleplay system, skips shared scoring modes/registry/create-roleplay, and contradicts `roleplay-skill-system.md` architecture.

### Add only via runtime `/create-roleplay` without committing files

- What: User generates scenario ad hoc in a session.
- Why rejected: Not durable, not in the published catalog, not reviewable, not installable for all harness users.

### Put scenario in `generate-all-roleplays.js` ACTIVE set

- What: Metadata object + regenerate markdown from templates.
- Why rejected: Generic rubric blueprints do not encode elicitation-specific dimensions; generator Situation POV is generic; hand-craft matches launch quality for this pedagogy.

### Extend `job-interview` scenario instead

- What: Add experience-gap branch inside job-interview.
- Why rejected: Different character (HM vs recruiter), different skill (technical depth vs elicitation under a years filter), would bloat and confuse scoring.

### Teach deception / "resume optimization" that fabricates years

- What: Coach users to claim experience they do not have.
- Why rejected: Unethical, high real-world risk, conflicts with honesty dimensions already central to the roleplay system.
)
