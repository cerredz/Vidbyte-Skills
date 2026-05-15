# Design Doc: Context Engineering Guidlines

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

---

## 1. Overview

Create a new repository artifact that documents reusable context-engineering prompt sections for building stronger prompts. The artifact will define each requested section in regular prose by explaining what the section is, the intent behind using it, and how it should affect a model's response. A companion artifact will explain how to add new sections or revise existing sections later without diluting the guidelines.

---

## 2. Goals & Non-Goals

### Goals

- Add a main `context-engineering-guidlines` artifact for common prompt sections.
- Document the requested sections: `identity`, `goal`, `success criteria`, `intuition`, `checklist`, `internal_monolog`, and `internal reasoning`.
- Add `output style` as its own prompt section because it describes the shape and tone of the model's final response.
- For each section, explain its description, intent, and response effect in regular text.
- Use only actual prompt sections as `##` headings in the main artifact.
- Write each main artifact section as two paragraphs with 6-8 total sentences.
- Treat internal monologue and internal reasoning as private execution guidance, not as user-visible chain-of-thought output.
- Add a companion artifact that explains how to add future changes to the context-engineering guidelines file.
- Keep the change documentation-only and aligned with the repo's existing `artifacts/` convention.

### Non-Goals

- Add or modify a `skills/<name>/SKILL.md` file.
- Change installer behavior, validation rules, CLI behavior, package metadata, or README content.
- Introduce new runtime code, dependencies, tests, commands, or backend integration.
- Create a prompt generator application or interactive CLI.
- Require models to reveal hidden chain-of-thought or private reasoning traces to the user.
- Add nested `Description`, `Intuition`, `Output Style`, or `Template` headings inside each main artifact section.
- Normalize or rename every existing artifact in the repo.

---

## 3. Background & Context

This repository is a portable skill and prompt-instruction library. It has a large `skills/` directory containing installable `SKILL.md` prompts, and an `artifacts/` directory containing reference material such as architecture notes, research, implementation plans, and authoring guidance. The README already describes the repository as a skill installer and points contributors toward `artifacts/create-skill-guide.md` for deeper authoring guidance.

The requested change fits the `artifacts/` pattern better than the `skills/` pattern because the user is asking for a reusable guide rather than an installable slash skill. The new artifact should be something the user can read, copy from, and use as source material when writing prompts. The review feedback clarified that `intuition` and `output style` should be actual sections, not subsection labels repeated inside every other section. It also clarified that each section should be written as regular text, with only the real prompt sections using `##` headings.

One important constraint is the user's requested `internal_monolog` and `internal reasoning` sections. These are useful as prompt-authoring concepts, but they should be framed as private planning guidance and decision discipline rather than instructions to expose hidden chain-of-thought. The artifact should help the user write prompts that improve model execution while keeping final outputs concise, useful, and policy-safe.

---

## 4. Requirements

### Functional Requirements

1. The main artifact SHALL be created under `artifacts/` with the requested name `context-engineering-guidlines.md`.
2. The main artifact SHALL explain that it is a reusable guide for composing prompt sections.
3. The main artifact SHALL include an `identity` section.
4. The main artifact SHALL include a `goal` section.
5. The main artifact SHALL include a `success criteria` section.
6. The main artifact SHALL include an `intuition` section.
7. The main artifact SHALL include a `checklist` section.
8. The main artifact SHALL include an `internal_monolog` section.
9. The main artifact SHALL include an `internal reasoning` section.
10. The main artifact SHALL include an `output style` section.
11. The `output style` section SHALL explain the shape, tone, density, organization, and presentation of the model's final response.
12. Every actual section SHALL explain what the section is, the intent behind using it, and how it should affect the model's response.
13. Every actual section SHALL be written in regular prose.
14. Every actual section SHALL use two paragraphs and 6-8 total sentences.
15. The main artifact SHALL NOT place `Description`, `Intuition`, `Output Style`, or `Template` as nested headings inside each section.
16. The internal-monologue and internal-reasoning sections SHALL avoid requiring hidden chain-of-thought in the final output.
17. A companion artifact SHALL be created under `artifacts/` explaining how to add future changes to the context-engineering guidelines file.
18. The companion artifact SHALL define a repeatable process for adding a new section: identify purpose, review overlap, write regular prose, include response effect, add guardrails, and review for safe reasoning instructions.

### Non-Functional Requirements

- **Performance targets:** N/A - documentation-only change.
- **Scalability considerations:** The guidelines should be easy to extend with new prompt sections without rewriting the whole artifact.
- **Security requirements:** The artifact must not instruct models to expose hidden chain-of-thought, secrets, credentials, private logs, or sensitive internal system details.
- **Observability:** N/A - no runtime behavior or logging is introduced.
- **Reliability / error tolerance:** The companion artifact should reduce future drift by defining how additions should be reviewed for clarity, overlap, response effect, and safe handling of private reasoning.

---

## 5. High-Level Design

The change will add two Markdown artifacts. The main artifact, `artifacts/context-engineering-guidlines.md`, will be the reusable guide for prompt sections. The companion artifact, `artifacts/adding-to-context-engineering-guidlines.md`, will be a maintainer-facing process for updating the main guide over time.

The main artifact will use a flat structure so the reader does not confuse prompt sections with explanatory subsections. Each actual section will be a `##` heading followed by two prose paragraphs. Those paragraphs will explain the section's description, its intent, and the visible effect it should have on the model's response. The guide will avoid templates and nested subsection labels so the requested sections remain the only `##` structure in the file.

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
  |-- output style
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

Provides the primary context-engineering reference for reusable prompt sections. It explains each section's role in a prompt, the intent behind using it, and how it should affect the model's response.

#### Interface / API

Markdown artifact with this proposed structure:

```markdown
# Context Engineering Guidlines

## identity
## goal
## success criteria
## intuition
## checklist
## internal_monolog
## internal reasoning
## output style
```

#### Logic / Algorithm

1. Introduce the artifact as a prompt-authoring guide for reusable sections.
2. Explain that each section should be written for the task at hand rather than copied generically.
3. Define `identity` as the section that establishes the model's role, standards, and operating posture.
4. Define `goal` as the section that states the exact outcome the model should produce.
5. Define `success criteria` as the section that defines completion conditions the model should satisfy before stopping.
6. Define `intuition` as the section that explains the conceptual logic behind the prompt.
7. Define `checklist` as the section that lists execution actions or reminders the model should follow while working.
8. Define `internal_monolog` as private attention guidance that must not ask the model to print hidden reasoning.
9. Define `internal reasoning` as private reasoning standards and verification checks that improve rigor without exposing chain-of-thought.
10. Define `output style` as the section that controls the shape, tone, density, organization, and presentation of the final response.
11. Write each section in two paragraphs with 6-8 total sentences.
12. Avoid nested subsection headings inside the main artifact sections.

#### Edge Cases & Error Handling

- **Requested filename contains a typo:** Use `context-engineering-guidlines.md` exactly to honor the user's requested name.
- **Reader expects "guidelines" spelling:** The companion artifact can mention the intentional spelling match to avoid accidental duplicate files.
- **Internal monologue wording could invite chain-of-thought exposure:** The artifact will explicitly frame it as private execution guidance and prohibit printing hidden reasoning.
- **Sections overlap conceptually:** The companion artifact will instruct maintainers to update an existing section rather than add a duplicate.
- **Prompt gets too long:** The guide will stay concise by requiring each section to fit in two paragraphs and 6-8 total sentences.

### 6.2 Adding-To Guide Artifact

**File(s):** `artifacts/adding-to-context-engineering-guidlines.md`
**Type:** New file

#### What it does

Provides a maintenance process for future additions to `artifacts/context-engineering-guidlines.md`.

#### Interface / API

Markdown artifact with this proposed structure:

```markdown
# Adding To Context Engineering Guidlines

## Before Adding A Section
## Required Section Shape
## Addition Workflow
## Review Checklist
## Common Failure Modes
## Example Addition Stub
## Maintenance Rule
```

#### Logic / Algorithm

1. Explain that additions should improve prompt construction rather than duplicate existing sections.
2. Require each new section to use a `##` heading in the main artifact.
3. Require each new section to use regular prose rather than nested explanatory headings.
4. Require each new section to explain what the section is, the intent behind it, and how it should affect the model's response.
5. Require each new section to use two paragraphs and 6-8 total sentences.
6. Define the update workflow:
   - identify the prompt failure the new section solves
   - check for overlap with existing sections
   - draft the section in the required prose shape
   - review for clarity, specificity, response effect, and safe reasoning instructions
7. Add a review checklist:
   - section has one job
   - section is not duplicative
   - section uses two paragraphs and 6-8 total sentences
   - no nested subsection headings are added
   - no hidden reasoning is requested in final output
   - no secrets or private implementation details are requested
8. Include an example addition stub contributors can copy.

#### Edge Cases & Error Handling

- **New section duplicates existing guidance:** The companion artifact will instruct maintainers to merge or refine the existing section instead of adding a duplicate.
- **New section has no response effect:** The addition should be rejected until the visible effect on the answer is explicit.
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

1. Given a user reads `artifacts/context-engineering-guidlines.md`, when they scan the headings, then only actual prompt sections appear as `##` headings.
2. Given a user reads any actual section, when they inspect its structure, then it uses two paragraphs and 6-8 total sentences.
3. Given a user reads the `identity` section, then they understand that it defines the model's role and expert posture.
4. Given a user reads the `goal` section, then they understand that it defines the exact outcome the prompt should produce.
5. Given a user reads `success criteria`, then they understand that it defines completion checks the model should satisfy before stopping.
6. Given a user reads `intuition`, then they understand that it is its own section for conceptual prompt logic.
7. Given a user reads `output style`, then they understand that it is its own section for the shape and tone of the model's final response.
8. Given a user reads `internal_monolog` or `internal reasoning`, then they know to guide private execution without requiring hidden chain-of-thought in final output.
9. Given a future contributor reads `artifacts/adding-to-context-engineering-guidlines.md`, when they add a new section, then they can follow the required prose shape and review checklist.
10. Run `npm test` after implementation to confirm repository validation and smoke tests still pass, even though no executable code changed.

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
- [ ] Should the main artifact include only prose, or should a separate companion guide hold future examples and templates?
- [ ] Should the companion "adding to" artifact include a small changelog template for tracking future edits?

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

### Alternative 4: Keep The Nested Section Pattern

- What: Keep `Description`, `Intuition`, `Output Style`, and `Template` as nested headings under every section.
- Why rejected: Review feedback clarified that `intuition` and `output style` are their own sections, and that the main artifact should explain each actual section in regular text.
