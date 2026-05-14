# Design Doc: Context Engineering Guidlines

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

---

## 1. Overview

Create a new repository artifact that documents reusable context-engineering prompt sections for building stronger prompts. The artifact will define each requested section by explaining what it is, why it works, when to use it, and what output style it should produce. A companion artifact will explain how to add new sections or revise existing sections later without diluting the guidelines.

---

## 2. Goals & Non-Goals

### Goals

- Add a main `context-engineering-guidlines` artifact for common prompt sections.
- Document the requested sections: `identity`, `goal`, `success criteria`, `intuition`, `checklist`, `internal_monolog`, and `internal reasoning`.
- For each section, explain its purpose, the intuition behind using it, and the intended output style.
- Preserve the user's requested section constraints, including paragraph counts, sentence counts, and checklist/list shapes where specified.
- Treat internal monologue and internal reasoning as private execution guidance, not as user-visible chain-of-thought output.
- Add a companion artifact that explains how to add future changes to the context-engineering guidelines file.
- Keep the change documentation-only and aligned with the repo's existing `artifacts/` convention.

### Non-Goals

- Add or modify a `skills/<name>/SKILL.md` file.
- Change installer behavior, validation rules, CLI behavior, package metadata, or README content.
- Introduce new runtime code, dependencies, tests, commands, or backend integration.
- Create a prompt generator application or interactive CLI.
- Require models to reveal hidden chain-of-thought or private reasoning traces to the user.
- Normalize or rename every existing artifact in the repo.

---

## 3. Background & Context

This repository is a portable skill and prompt-instruction library. It has a large `skills/` directory containing installable `SKILL.md` prompts, and an `artifacts/` directory containing reference material such as architecture notes, research, implementation plans, and authoring guidance. The README already describes the repository as a skill installer and points contributors toward `artifacts/create-skill-guide.md` for deeper authoring guidance.

The requested change fits the `artifacts/` pattern better than the `skills/` pattern because the user is asking for a reusable guide rather than an installable slash skill. The new artifact should be something the user can read, copy from, and use as source material when writing prompts. It should explain not only what each prompt section is, but also why that section changes model behavior and what a good instance of the section should look like.

One important constraint is the user's requested `internal_monolog` and `internal reasoning` sections. These are useful as prompt-authoring concepts, but they should be framed as private planning guidance and decision discipline rather than instructions to expose hidden chain-of-thought. The artifact should help the user write prompts that improve model execution while keeping final outputs concise, useful, and policy-safe.

---

## 4. Requirements

### Functional Requirements

1. The main artifact SHALL be created under `artifacts/` with the requested name `context-engineering-guidlines.md`.
2. The main artifact SHALL explain that it is a reusable guide for composing prompt sections.
3. The main artifact SHALL include an `identity` section.
4. The `identity` section SHALL describe that its output style is 1-2 paragraphs, with 6-8 coherent sentences per paragraph.
5. The `identity` section SHALL explain that the purpose is to align the model with a world-class role for the task at hand.
6. The main artifact SHALL include a `goal` section.
7. The `goal` section SHALL describe that its output style is one paragraph, with 6-8 full, coherent sentences.
8. The `goal` section SHALL explain that the purpose is to define the exact outcome the prompt is trying to produce.
9. The main artifact SHALL include a `success criteria` section.
10. The `success criteria` section SHALL describe that its output style is a checklist or bullet list defining objective stopping conditions.
11. The `success criteria` section SHALL explain that these bullets are the metrics the model must satisfy before it can stop.
12. The main artifact SHALL include an `intuition` section.
13. The `intuition` section SHALL describe that its output style is 1-2 paragraphs, with 6-8 sentences per paragraph.
14. The `intuition` section SHALL explain the conceptual logic of the prompt as a whole, beyond a surface description.
15. The main artifact SHALL include a `checklist` section.
16. The `checklist` section SHALL describe that its output style is a bulleted list of concrete actions the model should make sure to do.
17. The main artifact SHALL include an `internal_monolog` section.
18. The `internal_monolog` section SHALL describe what the model should privately attend to during task execution without requiring user-visible hidden reasoning.
19. The main artifact SHALL include an `internal reasoning` section.
20. The `internal reasoning` section SHALL describe the reasoning standards, verification moves, and decision checks the model should use internally without exposing private chain-of-thought.
21. Every section SHALL include three subsections or equivalent labels: description, intuition, and output style.
22. The artifact SHALL include a short usage note explaining how to combine sections when building a prompt.
23. The artifact SHALL include concise examples or templates for the section shapes where useful.
24. A companion artifact SHALL be created under `artifacts/` explaining how to add future changes to the context-engineering guidelines file.
25. The companion artifact SHALL define a repeatable process for adding a new section: identify purpose, define intuition, define output style, add guardrails, update examples, and review for overlap.

### Non-Functional Requirements

- **Performance targets:** N/A - documentation-only change.
- **Scalability considerations:** The guidelines should be easy to extend with new prompt sections without rewriting the whole artifact.
- **Security requirements:** The artifact must not instruct models to expose hidden chain-of-thought, secrets, credentials, private logs, or sensitive internal system details.
- **Observability:** N/A - no runtime behavior or logging is introduced.
- **Reliability / error tolerance:** The companion artifact should reduce future drift by defining how additions should be reviewed for clarity, overlap, and output-shape consistency.

---

## 5. High-Level Design

The change will add two Markdown artifacts. The main artifact, `artifacts/context-engineering-guidlines.md`, will be the reusable guide for prompt sections. The companion artifact, `artifacts/adding-to-context-engineering-guidlines.md`, will be a maintainer-facing process for updating the main guide over time.

The main artifact will use a repeated section structure so the reader can scan and copy patterns easily. Each prompt section will include the same three concepts: a description of the section, the intuition for why it improves the prompt, and the expected output style. Where the user specified exact structure, such as paragraph counts or checklist shape, the artifact will preserve those constraints explicitly.

The artifact will also handle internal-reasoning-related sections carefully. It will preserve the user's requested headings so the guide remains useful for their prompt library, while making clear that those sections should guide the model's private execution standards rather than ask it to reveal hidden reasoning. This keeps the prompt guidance practical without training future prompts toward unsafe or noisy final outputs.

```text
Prompt author
  |
  v
[context-engineering-guidlines.md]
  |-- identity
  |-- goal
  |-- success criteria
  |-- intuition
  |-- checklist
  |-- internal_monolog
  |-- internal reasoning
  |
  v
[Reusable prompt sections]

Future contributor
  |
  v
[adding-to-context-engineering-guidlines.md]
  |
  v
[Consistent additions to the main guide]
```

---

## 6. Detailed Design

### 6.1 Context Engineering Guidlines Artifact

**File(s):** `artifacts/context-engineering-guidlines.md`
**Type:** New file

#### What it does

Provides the primary context-engineering reference for reusable prompt sections. It explains each section's role in a prompt, the conceptual reason to use it, and the expected output style.

#### Interface / API

Markdown artifact with this proposed structure:

```markdown
# Context Engineering Guidlines

## Purpose
## How To Use This Guide
## Section Pattern
## identity
### Description
### Intuition
### Output Style
### Template
## goal
### Description
### Intuition
### Output Style
### Template
## success criteria
### Description
### Intuition
### Output Style
### Template
## intuition
### Description
### Intuition
### Output Style
### Template
## checklist
### Description
### Intuition
### Output Style
### Template
## internal_monolog
### Description
### Intuition
### Output Style
### Template
## internal reasoning
### Description
### Intuition
### Output Style
### Template
## Recommended Section Order
## Quality Bar
```

#### Logic / Algorithm

1. Introduce the artifact as a prompt-authoring guide for reusable sections.
2. Explain that each section should be written for the task at hand rather than copied generically.
3. Define `identity`:
   - Description: establishes the model's expert role and operating stance.
   - Intuition: role framing selects the relevant standards, vocabulary, and heuristics for the task.
   - Output style: 1-2 paragraphs, 6-8 coherent sentences per paragraph, describing a world-class practitioner for the task.
4. Define `goal`:
   - Description: states the intended final outcome in one focused paragraph.
   - Intuition: a single target prevents the prompt from optimizing for vague helpfulness.
   - Output style: one paragraph, 6-8 full coherent sentences.
5. Define `success criteria`:
   - Description: objective stopping conditions.
   - Intuition: clear completion metrics prevent premature stopping and unfocused overwork.
   - Output style: checklist or bullet list of things the model must accomplish before it can stop.
6. Define `intuition`:
   - Description: conceptual explanation of what running the prompt is trying to accomplish.
   - Intuition: makes the model reason about the purpose behind the instructions instead of mechanically following labels.
   - Output style: 1-2 paragraphs, 6-8 sentences per paragraph.
7. Define `checklist`:
   - Description: concrete action reminders.
   - Intuition: gives the model a low-ambiguity execution pass after the conceptual framing.
   - Output style: bulleted list of actions to verify during or before final response.
8. Define `internal_monolog`:
   - Description: private attention targets for the model during execution.
   - Intuition: helps the model monitor quality, constraints, and task fit while working.
   - Output style: short private-instruction bullets; do not ask the model to reveal hidden reasoning or print internal monologue.
9. Define `internal reasoning`:
   - Description: reasoning standards and verification moves the model should apply internally.
   - Intuition: improves rigor by specifying how the model should evaluate assumptions, evidence, alternatives, and stopping conditions.
   - Output style: private reasoning standards or checklist bullets; final answer should show conclusions, evidence, and uncertainty without revealing chain-of-thought.
10. Add recommended section order for a complete prompt.
11. Add a quality bar for strong context-engineering sections:
    - specific to the task
    - clear output shape
    - no duplicate responsibilities
    - measurable stopping conditions
    - safe handling of private reasoning instructions

#### Edge Cases & Error Handling

- **Requested filename contains a typo:** Use `context-engineering-guidlines.md` exactly to honor the user's requested name.
- **Reader expects "guidelines" spelling:** The companion artifact can mention the intentional spelling match to avoid accidental duplicate files.
- **Internal monologue wording could invite chain-of-thought exposure:** The artifact will explicitly frame it as private execution guidance and prohibit printing hidden reasoning.
- **Sections overlap conceptually:** The artifact will explain the difference between `goal`, `intuition`, `success criteria`, and `checklist`.
- **Prompt gets too long:** The guide will recommend using only the sections that materially improve the prompt.

### 6.2 Adding-To Guide Artifact

**File(s):** `artifacts/adding-to-context-engineering-guidlines.md`
**Type:** New file

#### What it does

Provides a maintenance process for future additions to `artifacts/context-engineering-guidlines.md`.

#### Interface / API

Markdown artifact with this proposed structure:

```markdown
# Adding To Context Engineering Guidlines

## Purpose
## Before Adding A Section
## Required Section Shape
## Addition Workflow
## Review Checklist
## Common Failure Modes
## Example Addition Stub
```

#### Logic / Algorithm

1. Explain that additions should improve prompt construction rather than duplicate existing sections.
2. Require each new section to define:
   - description
   - intuition
   - output style
   - when to use it
   - when not to use it
   - safety or quality guardrails
3. Define the update workflow:
   - identify the prompt failure the new section solves
   - check for overlap with existing sections
   - draft the section using the required shape
   - add an example or template
   - review for clarity, specificity, and safe reasoning instructions
   - update recommended section order if needed
4. Add a review checklist:
   - section has one job
   - output style is concrete
   - instructions are task-adaptable
   - no hidden reasoning is requested in final output
   - no secrets or private implementation details are requested
5. Include an example addition stub contributors can copy.

#### Edge Cases & Error Handling

- **New section duplicates existing guidance:** The companion artifact will instruct maintainers to merge or refine the existing section instead of adding a duplicate.
- **New section has no output style:** The addition should be rejected until the expected shape is explicit.
- **New section asks for unsafe or noisy reasoning output:** The addition should be reframed as private execution guidance or removed.
- **Future maintainers want the corrected spelling:** The companion artifact will say not to create a second `context-engineering-guidelines.md` file unless the repository intentionally migrates the filename.

---

## 7. Data Model Changes

N/A - documentation-only change. No schema, persisted runtime data, package metadata, or CLI payload shape changes are introduced.

---

## 8. API Changes

N/A - no API endpoints, commands, public interfaces, or installer contracts are created, modified, deprecated, or deleted.

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/context-engineering-guidlines.md` | Design document for the requested artifacts |
| CREATE | `artifacts/context-engineering-guidlines.md` | Main guide for reusable context-engineering prompt sections |
| CREATE | `artifacts/adding-to-context-engineering-guidlines.md` | Future-change process for extending the main guide |

---

## 10. Testing Plan

### Unit Tests

N/A - documentation-only change.

### Integration Tests

N/A - no executable behavior changes.

### Manual / QA Test Cases

1. Given a user reads `artifacts/context-engineering-guidlines.md`, when they look for `identity`, then they can see its description, intuition, and output style.
2. Given a user reads the `identity` output style, when they write an identity prompt section, then they know to write 1-2 paragraphs with 6-8 coherent sentences per paragraph.
3. Given a user reads the `goal` output style, when they write a goal prompt section, then they know to write one paragraph with 6-8 full coherent sentences.
4. Given a user reads `success criteria`, when they write stopping conditions, then they know to use a checklist or bullet list of completion metrics.
5. Given a user reads `intuition`, when they write conceptual prompt guidance, then they know to explain what the prompt is conceptually trying to accomplish beyond a surface task description.
6. Given a user reads `checklist`, when they write execution reminders, then they know to use concrete action bullets.
7. Given a user reads `internal_monolog` or `internal reasoning`, when they write those sections, then they know to guide private execution without requiring hidden chain-of-thought in final output.
8. Given a future contributor reads `artifacts/adding-to-context-engineering-guidlines.md`, when they add a new section, then they can follow the required shape and review checklist.
9. Run `npm test` after implementation to confirm repository validation and smoke tests still pass, even though no executable code changed.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| N/A | N/A | Documentation-only change | N/A |

---

## 12. Rollout & Deployment

- Feature flags: N/A.
- Breaking change: No.
- Migration path: N/A.
- Deployment order: Add the design doc first in the implementation branch, then add the two artifacts.
- Rollback procedure: Remove `artifacts/context-engineering-guidlines.md`, remove `artifacts/adding-to-context-engineering-guidlines.md`, and remove this design doc if desired. No runtime state or package behavior is affected.

---

## 13. Open Questions

- [ ] Should the final artifact preserve the requested spelling `guidlines`, or should implementation correct it to `guidelines` and mention the correction?
- [ ] Should `internal_monolog` keep the underscore exactly, or should the artifact also include a human-readable alias such as "internal monologue"?
- [ ] Should the main artifact include fully written sample prompt sections, or keep examples as short templates to avoid encouraging generic copy-paste?
- [ ] Should the companion "adding to" artifact be strictly process-oriented, or should it include a small changelog template for tracking future edits?

---

## 14. Alternatives Considered

### Alternative 1: Add A New Skill

- What: Create `skills/context-engineering-guidlines/SKILL.md` as an installable skill.
- Why rejected: The user described a prompt-section reference file, not an invocation workflow. An artifact is easier to read, reuse, and extend.

### Alternative 2: Modify `artifacts/create-skill-guide.md`

- What: Add the requested context-engineering sections into the existing skill creation guide.
- Why rejected: That guide is about creating Vidbyte skills. The requested file is about composing prompts from reusable sections, which is a different concern.

### Alternative 3: Create Only The Main Artifact

- What: Add `artifacts/context-engineering-guidlines.md` and skip the future-change process.
- Why rejected: The user explicitly asked for an artifact for "adding to the context engineering guidelines file" for future changes.

### Alternative 4: Correct The Filename To `context-engineering-guidelines.md`

- What: Fix the typo in the requested filename during implementation.
- Why rejected: The user explicitly named `context-engineering-guidlines`. The design preserves that name while leaving an open question for approval before implementation.
