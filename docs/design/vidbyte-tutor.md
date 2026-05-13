# Design Doc: Vidbyte Tutor Skill

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-13
**Last Updated:** 2026-05-13

---

## 1. Overview

The `vidbyte-tutor` skill is a central orchestration skill for the non-reasoning Vidbyte skills in this repository. It gives the agent a single entry point, `/vidbyte-tutor`, that knows when to use Vidbyte's learning, feedback, metacognition, authentication, and session-review skills.

This skill explicitly does not orchestrate the generated reasoning trace skills. The repository contains many `*-trace`, `*-trace-small`, `*-trace-medium`, and `*-trace-large` skills, but those are out of scope for `vidbyte-tutor`. The tutor is intended to route the smaller set of core Vidbyte learning-loop skills, not the large reasoning catalog.

The implementation is prompt-only: a new `skills/vidbyte-tutor/SKILL.md` file with valid frontmatter and structured instructions. It does not add runtime code, modify the installer, or introduce a registry. The existing installer discovers the new skill automatically because it scans every directory under `skills/` and validates each `SKILL.md`.

---

## 2. Goals & Non-Goals

### Goals

- Create a new `skills/vidbyte-tutor/SKILL.md` skill with valid frontmatter and a non-empty body.
- Make `vidbyte-tutor` the central orchestrator for non-reasoning Vidbyte skills.
- Include a catalog-aware prompt that tells the agent: "You are the orchestrator of Vidbyte's non-reasoning learning skills."
- Explain the use cases of each included non-reasoning skill.
- Route explicit requests for included skills directly to the named skill.
- Route vague user intents, such as "check my understanding", "help me retain this", or "watch for misconceptions", to the most appropriate included skill.
- Preserve the existing installer, validator, package metadata, and CLI behavior.
- Keep the skill concise enough that it remains usable as a tutor and router rather than a duplicated copy of every target skill.

### Non-Goals

- No orchestration of generated reasoning trace skills.
- No mention of `*-trace` skills as selectable options in the tutor.
- No changes to `bin/`, `lib/`, `scripts/`, `cli/`, `package.json`, or README installation behavior.
- No generated registry file or dynamic catalog builder in this change.
- No backend calls or Vidbyte API changes.
- No changes to existing skills.
- No automatic activation in every session. The skill is used when invoked or when its description matches a routing/orchestration need.
- No attempt to duplicate every full existing `SKILL.md` body inside `vidbyte-tutor`; it should summarize and route, not replace the canonical skills.

---

## 3. Background & Context

This repository is a portable skill installer. The source of truth is the `skills/` directory, where every skill lives in `skills/<skill-name>/SKILL.md`. The Node installer discovers skills by scanning directories under `skills/`, reading frontmatter with `name` and `description`, validating each skill, and copying or linking skill directories into supported harness locations. Rule-file integrations flatten selected skills into one generated Markdown document.

The current repository includes a large generated collection of reasoning trace skills. The user clarified that `vidbyte-tutor` should not include those reasoning skills, because they make up the large majority of the catalog and would overwhelm the central tutor.

The intended included skills are the non-reasoning Vidbyte skills currently present in the catalog:

- `anti-passive`
- `compression-check`
- `daily-review`
- `do-not-repeat`
- `feedback-generator`
- `misconceptions`
- `vidbyte-auth`
- `why`

The requested feature is not a new execution engine. It is a central skill prompt that makes the core learning-loop skills easier to use: the agent should be able to read `vidbyte-tutor`, recognize which non-reasoning Vidbyte skill applies, and either recommend or activate that skill's canonical workflow.

---

## 4. Requirements

### Functional Requirements

1. The repository SHALL add `skills/vidbyte-tutor/SKILL.md`.
2. The skill directory name SHALL match the frontmatter name exactly: `vidbyte-tutor`.
3. The frontmatter description SHALL make the skill discoverable for non-reasoning Vidbyte skill orchestration, routing, skill selection, and tutoring requests.
4. The skill body SHALL define the agent identity as the orchestrator of Vidbyte's non-reasoning learning skills.
5. The skill body SHALL explain that canonical behavior lives in each target skill's own `SKILL.md`.
6. The skill body SHALL explicitly exclude generated reasoning trace skills from its routing catalog.
7. The skill body SHALL include the use cases for `anti-passive`, `compression-check`, `daily-review`, `do-not-repeat`, `feedback-generator`, `misconceptions`, `vidbyte-auth`, and `why`.
8. The skill body SHALL include routing rules for explicit requests. If the user asks for `/daily-review`, route to `daily-review`; if the user asks for `/misconceptions`, route to `misconceptions`.
9. The skill body SHALL tell the agent to ask at most one clarifying question only when skill selection materially depends on missing context.
10. The skill body SHALL tell the agent to prefer one primary skill and optional secondary skills only when they serve distinct phases.
11. The skill body SHALL include tie-break rules for overlapping learning-loop skills.
12. The skill body SHALL preserve platform portability by avoiding tool-specific commands except when summarizing target skill behavior that already contains a command.
13. The new skill SHALL pass the existing validation scripts.

### Non-Functional Requirements

- **Maintainability:** The catalog is short and static, matching the non-reasoning skills currently in the repository.
- **Portability:** The skill remains pure Markdown with YAML frontmatter, matching the repository's existing skill pattern.
- **Security:** No filesystem writes, network calls, credentials, or backend submissions are introduced by `vidbyte-tutor` itself.
- **Reliability:** If the user names a specific included skill, the orchestrator must not override that explicit request.
- **Usability:** The skill should provide concise routing decisions, not list unrelated reasoning trace skills.

---

## 5. High-Level Design

Add one new skill:

```text
skills/vidbyte-tutor/
  SKILL.md
```

At runtime, the agent reads `vidbyte-tutor` and follows a routing process:

```text
User request
  |
  v
Does the request name one of the included non-reasoning Vidbyte skills?
  |-- yes --> Use that skill exactly.
  |
  |-- no --> Classify the user's learning-loop intent:
             authentication / misconception tracking / comprehension check /
             daily review / feedback artifact / repeated-error prevention /
             passive-consumption interruption / metacognitive why prompt
  |
  v
Select one primary included skill.
  |
  v
If needed, name optional secondary skills only for distinct phases.
  |
  v
Proceed with the selected skill's canonical workflow, or recommend it if the
user only asked which skill to use.
```

The catalog inside `SKILL.md` will be organized into:

1. Orchestrator identity and core exclusion rule.
2. Selection algorithm.
3. Included skill catalog.
4. Tie-break rules.
5. Response behavior.
6. Success criteria and input expectations.

This design intentionally avoids code changes. The existing discovery pipeline already supports this skill:

- `lib/skill-catalog.js` reads `skills/vidbyte-tutor/SKILL.md`.
- `lib/skill-validation.js` validates the name, description, and body.
- `scripts/validate.js` validates the same conventions.
- `lib/installer.js` installs the new skill with the rest of the catalog.
- `lib/rule-documents.js` includes it in generated rule documents.

---

## 6. Detailed Design

### 6.1 New Skill File

**File:** `skills/vidbyte-tutor/SKILL.md`  
**Type:** Create

#### Frontmatter

```yaml
---
name: vidbyte-tutor
description: >
  Use this skill as the central orchestrator for Vidbyte's non-reasoning learning skills
  when the user wants help choosing, routing, combining, or understanding skills such as
  misconceptions, daily-review, compression-check, feedback-generator, do-not-repeat,
  anti-passive, why, and vidbyte-auth.
---
```

#### Body Structure

The body will use these sections:

1. `# /vidbyte-tutor - Vidbyte Skill Orchestrator`
2. `## Identity`
3. `## Core Rule`
4. `## Selection Algorithm`
5. `## Included Skills`
6. `## Tie-Break Rules`
7. `## Response Behavior`
8. `## Success Criteria`
9. `## Input`

#### Identity

The identity section will state, in substance:

```text
You are the orchestrator of Vidbyte's non-reasoning learning skills. Your job is to
understand the user's learning-loop need, select the best included skill, explain the
selection briefly when helpful, and then follow the selected skill's canonical workflow.
```

It will explicitly say that `vidbyte-tutor` routes and explains skills; it does not replace the deeper instructions in the selected skill.

#### Core Rule

The core rule will state that `vidbyte-tutor` must not route to, catalog, or recommend the generated reasoning trace skills. If a user explicitly asks for a reasoning trace skill while using `vidbyte-tutor`, the tutor should say that reasoning traces are outside this tutor's catalog and then either honor the explicit user request if the host system supports that skill or ask whether they want help choosing among the non-reasoning Vidbyte skills instead.

#### Selection Algorithm

The skill will follow this process:

1. Detect explicit names for included skills.
2. Respect explicit included-skill requests.
3. Classify the task by learning-loop intent.
4. Choose one primary included skill.
5. Optionally identify secondary skills only when they add a distinct phase.
6. Ask one clarifying question only if missing context prevents a defensible choice.
7. Proceed with the chosen skill's normal workflow if the user gave a substantive task.
8. Recommend the chosen skill if the user only asked which skill to use.

#### Included Skill Catalog

The skill will include these use cases:

| Skill | Use Case |
|-------|----------|
| `anti-passive` | Use when the session is drifting into passive explanation consumption and the user needs a gentle redirect toward building, deciding, or trying something. |
| `compression-check` | Use when the user needs periodic articulation checks about what was built and why, with internal evaluation submitted to Vidbyte. |
| `daily-review` | Use at the end of a work session to extract high-risk concepts into durable review notes and send them to Vidbyte. |
| `do-not-repeat` | Use when repeated conceptual errors should be detected across prompts or sessions and interrupted with a focused corrective intervention. |
| `feedback-generator` | Use when the session needs a silent diagnostic feedback artifact written to a file and submitted through the Vidbyte CLI. |
| `misconceptions` | Use when the user wants silent tracking of wrong mental models during the session and an end-of-session misconception log. |
| `vidbyte-auth` | Use when the user needs to authenticate the Vidbyte CLI for account-linked features. |
| `why` | Use when the user needs occasional context-specific why questions to prevent autopilot and surface assumptions. |

#### Tie-Break Rules

The skill will include concrete routing preferences:

- If the user asks for a named included skill, use it exactly.
- If the user needs authentication, choose `vidbyte-auth`.
- If the user wants misconception tracking, choose `misconceptions`.
- If the user wants an end-of-day or end-of-session learning review, choose `daily-review`.
- If the user wants a background feedback file for later analysis, choose `feedback-generator`.
- If the user wants periodic checks that they can explain what was built and why, choose `compression-check`.
- If the user is repeatedly making the same conceptual error, choose `do-not-repeat`.
- If the user is passively consuming explanations without building or deciding, choose `anti-passive`.
- If the user is making choices on autopilot and needs reflective prompts, choose `why`.
- If multiple background skills could apply, choose only the one that matches the user's explicit learning goal. Name optional secondary skills only as future additions.

#### Response Behavior

When the user invokes `/vidbyte-tutor`, the skill should:

- If the user asked for help choosing a skill, provide the recommended primary skill, why it fits, and at most two alternatives.
- If the user gave a substantive task, route directly and proceed with the selected skill's workflow.
- Avoid listing the whole catalog unless the user asks for all included skills.
- Avoid mentioning reasoning trace skills except to state they are outside this tutor's scope.
- Keep explanations concise and actionable.

---

## 7. Data Model Changes

N/A - This is a prompt-only skill. No database schema, persistent state, migration, or structured runtime data model is added.

---

## 8. API Changes

N/A - No API endpoints, CLI commands, backend routes, authentication headers, or network contracts are changed.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/vidbyte-tutor.md` | Design document for the new non-reasoning central orchestration skill. |
| CREATE | `skills/vidbyte-tutor/SKILL.md` | New Vidbyte non-reasoning skill orchestrator prompt. |

**Total: 2 files created, 0 files modified, 0 files deleted.**

---

## 10. Testing Plan

### Unit Tests

N/A - The implementation is a Markdown skill prompt, not executable library code.

### Validation Tests

Run:

```bash
npm run validate
```

Expected result:

- `skills/vidbyte-tutor/SKILL.md` exists.
- Frontmatter starts at the top of the file.
- Frontmatter has `name: vidbyte-tutor`.
- The name matches the directory.
- Description is non-empty.
- Body is non-empty.
- The skill name matches `^[a-z0-9]+(-[a-z0-9]+)*$`.

### Full Smoke Tests

Run:

```bash
npm test
```

Expected result:

- Existing validation passes.
- Existing installer smoke test passes.
- Existing CLI smoke test passes.

### Manual / QA Test Cases

1. **Explicit included skill routing:** Given "use `/daily-review`", the tutor selects `daily-review` exactly.
2. **Authentication routing:** Given "help me authenticate Vidbyte", the tutor selects `vidbyte-auth`.
3. **Misconception tracking routing:** Given "watch for my misconceptions this session", the tutor selects `misconceptions`.
4. **Comprehension check routing:** Given "make sure I can explain what we built", the tutor selects `compression-check`.
5. **Repeated error routing:** Given "I keep making the same mistake", the tutor selects `do-not-repeat`.
6. **Passive learning routing:** Given "I keep reading explanations and not building", the tutor selects `anti-passive`.
7. **Autopilot routing:** Given "ask me why when I seem to be acting on autopilot", the tutor selects `why`.
8. **Feedback artifact routing:** Given "silently capture feedback for later", the tutor selects `feedback-generator`.
9. **Reasoning exclusion:** Given "which reasoning trace should I use?", the tutor states that reasoning trace skills are outside the `vidbyte-tutor` scope.
10. **No catalog dump by default:** Given a normal routing request, the response should name the chosen skill and rationale without listing all included skills.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Existing skill validation scripts | Repository-local | Validate the new skill frontmatter/body conventions. | Low |
| Existing installer | Repository-local | Discover and install the new skill. | Low |

No new npm dependencies, Python dependencies, backend services, or external APIs are introduced.

---

## 12. Rollout & Deployment

- **Feature flags:** None.
- **Deployment order:** Merge the new skill and design doc. Existing installation commands will include the skill automatically.
- **Backwards compatibility:** Fully additive. Existing skill names and installer behavior remain unchanged.
- **Rollback:** Delete `skills/vidbyte-tutor/` and the design doc. No data migration or cleanup is required.
- **User-facing change:** Users can invoke `/vidbyte-tutor` or ask for non-reasoning Vidbyte skill selection/orchestration and receive focused routing guidance.

---

## 13. Open Questions

N/A - The user clarified that reasoning skills should not be included, so the implementation scope is the current non-reasoning skill set only.

---

## 14. Alternatives Considered

### Alternative 1: Include reasoning trace skills

What: Catalog and route the generated reasoning trace skills alongside the non-reasoning learning-loop skills.

Why rejected: The user explicitly clarified that reasoning skills should not be included because they make up the large majority of the repository.

### Alternative 2: Generate a registry file from all frontmatter

What: Add a script that reads every `SKILL.md` and generates a catalog consumed by `vidbyte-tutor`.

Why rejected: The requested skill is simple and limited to a short non-reasoning set. A generator would add complexity without enough value for this scope.

### Alternative 3: Modify the installer to create an orchestrator rule file

What: Change `lib/rule-documents.js` or the installer to synthesize a top-level orchestrator automatically.

Why rejected: The installer already flattens skills for rule-file integrations. This request is about a reusable skill, not changing installer behavior.

### Alternative 4: Duplicate every included skill body inside `vidbyte-tutor`

What: Paste the full bodies of the included skills into one tutor skill.

Why rejected: That would duplicate canonical instructions and make future maintenance harder. The tutor should route to skills and summarize use cases, not replace them.

---

END OF DESIGN DOC
