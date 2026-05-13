# Design Doc: Skill Types and Creation Process Artifact

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-13
**Last Updated:** 2026-05-13

---

## 1. Overview

Create a new repository artifact that explains the Vidbyte skill taxonomy and the end-to-end process for creating each skill type: reasoning trace skills, prompt/output-shaping skills, and learning/background skills that run throughout a session and submit artifacts to Vidbyte through the local CLI. The artifact will serve as the canonical authoring guide for deciding which skill type to build, what belongs in the `SKILL.md` system prompt, what belongs in the CLI, and how backend-bound learning artifacts flow from prompt instructions to Vidbyte's API.

---

## 2. Goals & Non-Goals

### Goals

- Document the three main skill categories the user described: simple reasoning skills, prompt skills, and learning/background skills.
- Explain the current repo mechanics for skill discovery, validation, installation, and rule-file flattening.
- Explain the exact authoring process for each skill type, including `SKILL.md` structure, activation model, state model, output behavior, and testing expectations.
- Explain how learning/background skills integrate with the Python `vidbyte` CLI and why skills must call the CLI instead of constructing backend requests directly.
- Explain what CLI commands currently do for `feedback submit` and `compressor submit`.
- Explain how to add a new backend-bound skill integration: new command class, router entry, endpoint mapping, usage text, dry-run behavior, smoke tests, and skill prompt instructions.
- Explain what context belongs in the skill prompt for background skills: lifecycle, state, skip rules, artifact schema, CLI invocation, failure handling, privacy, and output constraints.
- Add a README pointer so future contributors can find the new artifact from the existing "Add A Skill" section.

### Non-Goals

- Implement new runtime behavior in this change.
- Add a new Vidbyte backend endpoint.
- Change the installer discovery or validation rules.
- Rewrite existing skills.
- Change existing CLI authentication or signing behavior.
- Add a generalized plugin framework or metadata schema beyond the existing `SKILL.md` frontmatter requirements.
- Document private backend implementation details not represented in this repo.

---

## 3. Background & Context

This repository is already organized as a portable skill package. Source skills live under `skills/<name>/SKILL.md`; the installer discovers those directories automatically; validation requires hyphen-case names, matching directory names, non-empty descriptions, and non-empty bodies. The README already explains installation and basic skill creation, and existing artifacts explain the installer architecture and CLI-to-backend security model.

The repo now contains several distinct skill styles that are easy to confuse because they share the same filesystem shape. Reasoning trace skills, such as `abductive-trace`, are strategy-specific public reasoning artifacts that write `memory/{question_name}.md`. Prompt skills, such as the planned `/explain`, `/counterargument`, `/mental-model`, and `/research` skills described in existing design docs, are mostly response-format contracts. Background learning skills, such as `feedback-generator` and `compression-check`, run across a session, observe or interrupt at specific points, produce structured learning artifacts, and submit them to Vidbyte via the CLI.

The user wants an artifact that makes these differences explicit and explains the full creation process. The most important missing documentation is the learning/background skill path: what the prompt should own, what the CLI owns, how the CLI connects to the Vidbyte API, and how the skill should describe those boundaries in its system-prompt instructions.

---

## 4. Requirements

### Functional Requirements

1. The artifact SHALL define the repository's three core skill types: reasoning trace skills, prompt skills, and learning/background skills.
2. The artifact SHALL explain the shared baseline structure for every skill: `skills/<name>/SKILL.md`, YAML frontmatter, hyphen-case naming, description trigger, optional `scripts/`, `references/`, and `assets/`.
3. The artifact SHALL describe reasoning trace skills as strategy-specific skills whose core behavior is public scratchpad generation, usually to `memory/{question_name}.md`, with default/small/medium/large scale variants where applicable.
4. The artifact SHALL describe prompt skills as stateless or mostly stateless response contracts whose core functionality lives in prompt instructions and structured output formats.
5. The artifact SHALL describe learning/background skills as session-lifecycle skills that may maintain session-local counters, append local artifacts, evaluate conversation context, and submit finished artifacts to Vidbyte through the CLI.
6. The artifact SHALL explain the prompt/CLI/backend responsibility split: prompt observes and writes artifacts, CLI sanitizes/signs/transports, backend verifies/stores.
7. The artifact SHALL explain current CLI commands: `vidbyte feedback submit`, `vidbyte compressor submit`, `python -m cli ...`, `--dry-run`, `--domain`, `--conversation-id`, and `--skill-id`.
8. The artifact SHALL explain how the CLI connects to Vidbyte: fixed endpoint names in `cli/client.py`, official API origin, JSON payload construction, sanitizer, HMAC headers, timestamp, nonce, body hash, CLI version, and environment-based secret loading.
9. The artifact SHALL explain how to add a new CLI-backed skill integration: create a command class, route it in `cli/router.py`, add an endpoint to `cli/client.py`, add usage text, reuse shared helpers, add a dry-run smoke test, and document the invocation in the skill prompt.
10. The artifact SHALL explain the context a learning/background skill should include in its system prompt: identity, activation, lifecycle, state variables, per-message algorithm, skip rules, artifact schema, CLI command, failure modes, privacy/security constraints, and success criteria.
11. The artifact SHALL include a decision tree or comparison table that tells contributors which skill type to build.
12. The artifact SHALL include concise templates or checklists for each skill type.
13. The README SHALL link to the artifact from the "Add A Skill" section.

### Non-Functional Requirements

- **Performance targets:** N/A - documentation-only change.
- **Scalability considerations:** The guide should scale to future skill types by describing boundaries and extension points instead of only naming current examples.
- **Security requirements:** The guide must emphasize that secrets never belong in `SKILL.md`, committed artifacts, or prompt text; backend-bound skills must call the CLI only.
- **Observability:** The guide should explain local validation and smoke-test expectations for contributor feedback.
- **Reliability / error tolerance:** The guide should specify graceful degradation patterns for background skills when CLI submission fails.

---

## 5. High-Level Design

The change will add a new artifact at `artifacts/create-skill-guide.md` and link it from the README. The artifact will be written as a practical authoring guide, not a design essay. It will start with the shared skill contract, then split into the three skill types, and then go deep on the learning/background path because that is the part with the most moving pieces.

The artifact will ground each concept in current repo files. Reasoning trace skills will reference `skills/abductive-trace/SKILL.md` as the representative pattern. Prompt skills will reference the existing design docs for `/explain`, `/counterargument`, `/mental-model`, and `/research` as the intended pattern. Background skills will reference `skills/feedback-generator/SKILL.md`, `skills/compression-check/SKILL.md`, `cli/commands/feedback.py`, `cli/commands/compressor.py`, `cli/router.py`, `cli/client.py`, and `cli/auth/*`.

```text
Contributor
  |
  v
[Choose skill type]
  |-- Reasoning trace ------> SKILL.md writes public memory artifact
  |-- Prompt skill ---------> SKILL.md shapes inline response
  |-- Background learning --> SKILL.md observes session and calls CLI
                                      |
                                      v
                              [Python vidbyte CLI]
                                      |
                                      v
                              [Vidbyte backend API]
```

Key design decisions:

- A new artifact is better than expanding the README because the requested process is detailed and would make the README too long.
- The README still gets a short pointer so the guide is discoverable.
- The artifact will preserve the existing security model: prompts do not build auth headers or call arbitrary URLs; they call `vidbyte` or `python -m cli`.
- The guide will distinguish "background prompt behavior" from "backend integration" because some background skills, such as passive-consumption detection, may run throughout a session without needing the CLI.

---

## 6. Detailed Design

### 6.1 Create-Skill Guide Artifact

**File(s):** `artifacts/create-skill-guide.md`
**Type:** New file

#### What it does

Provides the canonical guide for creating Vidbyte skills. It explains how to choose a skill type, how to author the `SKILL.md` prompt for that type, how installation and validation work, and how to connect learning/background skills to the Vidbyte CLI and backend boundary.

#### Interface / API

Markdown artifact with this proposed structure:

```markdown
# Create Skill Guide

## Skill System Overview
## Shared Skill Contract
## Skill Type Decision Table
## Type 1: Reasoning Trace Skills
## Type 2: Prompt Skills
## Type 3: Learning and Background Skills
## CLI and Backend Integration
## What Belongs in the Skill Prompt
## Adding a New CLI-Backed Skill
## Validation and Testing
## Authoring Checklists
## Common Mistakes
```

#### Logic / Algorithm

1. Open with the shared repo contract:
   - `skills/<name>/SKILL.md`
   - frontmatter fields `name` and `description`
   - name must be lowercase hyphen-case and match the folder
   - installer discovers automatically; no registry changes needed
   - `npm test` validates metadata and runs smoke tests

2. Add a decision table:
   - Use a reasoning trace skill when the user wants a public reasoning artifact.
   - Use a prompt skill when the user wants an inline response in a specific structure.
   - Use a learning/background skill when the skill needs to observe the whole session, persist learning artifacts, or submit to Vidbyte.

3. Explain reasoning trace skills:
   - activation examples: slash command or explicit request
   - prompt owns the reasoning strategy and public trace structure
   - writes to `memory/{question_name}.md`
   - scale variants: small, medium/default, large
   - testing: metadata validation plus manual invocation

4. Explain prompt skills:
   - activation examples: `/counterargument`, `/mental-model`, `/research`, `/explain`
   - prompt owns output sections, tone constraints, banned phrases, and fallback behavior
   - no files, no CLI, no backend
   - testing: manual response-shape checks plus metadata validation

5. Explain learning/background skills:
   - session start behavior
   - per-message monitoring
   - session-local state vs local artifact files
   - skip rules and interruption policy
   - artifact schema
   - finalization and submission
   - failure behavior when CLI is unavailable

6. Explain the CLI boundary:
   - current commands and flags
   - `cli/__main__.py` parses resource/action/options
   - `cli/router.py` maps commands to command classes
   - `cli/commands/*.py` build payloads
   - `sanitize_file_content` reads and sanitizes outbound text
   - `VidbyteRequestBuilder` maps endpoint names to fixed routes
   - `HeaderBuilder` creates signed headers
   - `EnvLoader` reads `.env` or environment variables
   - `--dry-run` validates without sending network traffic

7. Explain adding a new backend-bound skill:
   - define backend artifact type and endpoint name
   - create `cli/commands/<resource>.py`
   - add route in `cli/router.py`
   - add endpoint in `cli/client.py`
   - update `cli/helpers/usage.py`
   - add smoke test coverage for `--dry-run`
   - document the exact CLI command in the skill prompt
   - never put secrets or headers in the skill prompt

8. End with checklists and common mistakes:
   - overloading one skill with multiple behaviors
   - making background skills chatty
   - using `curl` instead of the CLI
   - persisting secrets
   - skipping dry-run tests
   - failing to define failure behavior

#### Edge Cases & Error Handling

- **Existing "create skill" artifact is absent:** Create a new guide instead of modifying a non-existent file.
- **Future skill categories appear:** The guide's decision table can be extended without changing existing sections.
- **Backend details are not fully represented locally:** The artifact will describe only the prompt and CLI side, and state that backend route implementation must independently verify signatures, schemas, rate limits, and replay protection.
- **Windows vs Unix CLI invocation:** The artifact will mention `vidbyte ...` as the package binary and `python -m cli ...` as the local-development invocation; existing scripts choose `python` or `python3` depending on platform.

### 6.2 README Link

**File(s):** `README.md`
**Type:** Modified

#### What it does

Adds a short pointer from the "Add A Skill" section to `artifacts/create-skill-guide.md` for detailed skill-type guidance.

#### Interface / API

No runtime API. Proposed copy:

```markdown
For a deeper guide to choosing and authoring reasoning trace, prompt, and background/CLI-backed skills, see `artifacts/create-skill-guide.md`.
```

#### Logic / Algorithm

1. Find the "Add A Skill" section.
2. Add one sentence after the basic `SKILL.md` example or before the "Reasoning Trace Skills" section.
3. Keep the README concise and avoid duplicating the full guide.

#### Edge Cases & Error Handling

- **Artifact link drift:** The manifest fixes the artifact path; README should point to that exact path.
- **README becoming too long:** Only add one sentence.

---

## 7. Data Model Changes

N/A - documentation-only change. No schema, persisted runtime data, or CLI payload shape changes are introduced.

---

## 8. API Changes

N/A - no API endpoints are created, modified, or deprecated.

The artifact will document the existing local CLI-to-backend contract:

```text
feedback submit   -> /api/skills/feedback
compressor submit -> /api/skills/compressor
```

It will also document the extension process for future endpoint names in `cli/client.py`, but will not add a new endpoint in this change.

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/skill-types-and-creation-process-artifact.md` | Design document for the artifact and README link |
| CREATE | `artifacts/create-skill-guide.md` | Canonical guide explaining Vidbyte skill types and creation process |
| MODIFY | `README.md` | Link the existing Add A Skill section to the detailed guide |

---

## 10. Testing Plan

### Unit Tests

N/A - documentation-only change.

### Integration Tests

N/A - no executable behavior changes.

### Manual / QA Test Cases

1. Given a contributor reads the artifact, when they need a skill that writes a public reasoning artifact, then they can identify the reasoning trace path and expected `memory/{question_name}.md` behavior.
2. Given a contributor reads the artifact, when they need a stateless slash-command response formatter, then they can identify the prompt skill path and avoid adding CLI code.
3. Given a contributor reads the artifact, when they need a session-long learning skill, then they can identify the background skill path and understand session state, artifact writing, and CLI submission.
4. Given a contributor reads the CLI section, when they add a new backend-bound command, then they know the files to modify: `cli/commands/<resource>.py`, `cli/router.py`, `cli/client.py`, `cli/helpers/usage.py`, and a smoke test.
5. Given a contributor reads the security section, when they author a backend-bound skill, then they know not to store secrets, construct HMAC headers, or call arbitrary URLs from the prompt.
6. Run `npm test` after implementation to confirm the documentation changes did not break validation or smoke tests.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Vidbyte CLI | Existing repo implementation | Documented as the only supported path for backend-bound skill submissions | Low - no behavior change |
| Vidbyte backend | `https://vidbyte.pro` | Documented as the API target for CLI submissions | Low - documentation only |

---

## 12. Rollout & Deployment

- Feature flags: N/A.
- Breaking change: No.
- Migration path: N/A.
- Deployment order: Add the artifact and README link in one docs-only change.
- Rollback procedure: Remove `artifacts/create-skill-guide.md`, remove the README pointer, and remove this design doc if desired. No runtime state or persisted data is affected.

---

## 13. Open Questions

- [ ] Should the artifact be named `artifacts/create-skill-guide.md`, or do you prefer a different path/name such as `artifacts/skill-types-and-creation-process.md`?
- [ ] Should the guide include full copy-paste templates for each skill type, or should it keep templates short and point contributors to existing skill examples?
- [ ] Should the README link be added, or should the new artifact remain discoverable only from the `artifacts/` directory?
- [ ] Should the artifact document backend implementation requirements only at a high level, or include a recommended backend route checklist even though backend code is outside this repo?

---

## 14. Alternatives Considered

### Alternative 1: Expand README Only

- What: Add all requested guidance to the README.
- Why rejected: The requested process is too detailed for the README. A long README section would bury installation instructions and make the repository harder to scan.

### Alternative 2: Modify `artifacts/skill-cli-backend-architecture.md`

- What: Add the full skill taxonomy to the existing CLI/backend architecture artifact.
- Why rejected: That artifact is focused on the security boundary between prompt, CLI, and backend. Expanding it into a full skill-authoring guide would blur its purpose. The new guide can link to and summarize that artifact instead.

### Alternative 3: Create Separate Artifacts for Each Skill Type

- What: Create one artifact for reasoning skills, one for prompt skills, and one for background skills.
- Why rejected: The user's request is specifically for an artifact that explains the full process and differences among skill types. A single guide makes comparison and decision-making easier.

### Alternative 4: Add New CLI Abstractions While Documenting

- What: Build a generic command-registration system or command template generator as part of this change.
- Why rejected: The task is documentation-focused. The current CLI router is simple and explicit; changing it would expand scope beyond the requested artifact.

