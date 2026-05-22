<!--
CONTEXT PROTOCOL HEADER
Description: Design document for the theoretical-feedback skill inside the vidbyte-cli codebase.
Purpose: To specify requirements, architecture, files to change, and verification plan for adding the "/theoretical-feedback" skill to version 3 of the repo.
Architecture: Documented below under sections 5 (High-Level Design) and 6 (Detailed Design).
Functions/Key Elements: Outlines the extraction algorithm, transferability test, seed library, and spaced retention integration.
Relation to Codebase: Guides the implementation of skills/theoretical-feedback/SKILL.md, references/domain-examples.md, skills-manifest.json, and lib/skill-versions.json.
Similar Files: docs/design/motivate-skill.md, docs/design/retain.md.
-->

# Design Doc: `/theoretical-feedback` Skill

**Status:** Draft
**Author:** Antigravity
**Created:** 2026-05-20
**Last Updated:** 2026-05-20

---

## 1. Overview

The `/theoretical-feedback` skill is a prompt-level feedback skill designed to operate at the **class level, not the instance level**. Given a domain and/or specific mistake or situation (e.g., chess, software engineering, writing, ML/AI), it does not provide practical corrections for the specific mistake (e.g., "you should not have traded your bishop" or "split this function"). Instead, it identifies the underlying mental models, heuristics, and thinking habits that separate novices from experts in that domain, delivering them as transferable, wisdom-grade feedback. It answers the core question: *"What should I always be asking myself when I encounter problems like this?"* producing value for the next 100 times the user faces a similar class of problem.

---

## 2. Goals & Non-Goals

### Goals

- Implement the `/theoretical-feedback` skill under the `skills/theoretical-feedback` folder structure.
- Define a high-quality `SKILL.md` that captures the complete procedural instructions, transferability test, output format, and rules for the skill.
- Provide a robust seed library of theoretical principles in `skills/theoretical-feedback/references/domain-examples.md` across 10 curated domains.
- Register `theoretical-feedback` under the `"learning"` array in `skills-manifest.json` at the root of `vidbyte-cli`.
- Add `theoretical-feedback` under the `"3"` key in `lib/skill-versions.json` to make it a Version 3 skill.
- Ensure integration with the spacing retention CLI `vidbyte retain` by auto-generating ready-to-run retention commands at the bottom of the output under a "Lock this in?" block.
- Pass all smoke and validation tests via `npm test`.

### Non-Goals

- Creating a new CLI binary command or changing the Python backend codebase (the skill is a prompt-based skill that leverages existing `vidbyte retain` commands).
- Building user-level persistence/history tracking for this skill within this iteration (this is stateless, as specified by the requirements).
- Automating background feedback generation (this is a user-initiated prompt skill, invoked via `/theoretical-feedback`).

---

## 3. Background & Context

In the Vidbyte Skills Platform, there is an existing `/feedback` skill that works at the **instance level** ("Here is what was wrong and how to fix it"). The `/theoretical-feedback` skill is designed to be highly complementary to `/feedback`. While `/feedback` handles immediate fixes, `/theoretical-feedback` abstracts the problem to a broader class and extracts high-level mental models.

By pairing this skill with the spaced repetition workflow of the `vidbyte retain` CLI command, the user can transition from a quick fix to permanently internalizing an expert mental model.

The skill will be placed in the Version 3 index of the repository. This showcases the growth of advanced prompt-engineering cognitive skills that require reference seed libraries to anchor reasoning quality.

---

## 4. Requirements

### Functional Requirements

1. **Invocation**: The skill MUST trigger when the user runs `/theoretical-feedback` or references the `/theoretical-feedback` command.
2. **Domain Inference**:
   - If both the domain and situation/mistake are provided, the skill MUST extract the class of problem, 1 primary principle, and 2 supporting principles.
   - If only the situation is provided, the skill MUST infer the domain, confirm it inline, and then proceed with the extraction.
   - If only the domain is provided, the skill MUST ask one clarifying question: *"What happened or what are you trying to get feedback on?"*
3. **Extraction Algorithm**:
   - The skill MUST parse the input, abstract it upward to a 1-sentence class of problem description, and generate principles.
   - Each principle MUST pass the **Transferability Test** internally before being presented.
4. **Transferability Test**:
   - Applies to at least 10 other situations in the same domain?
   - Describes HOW to think, not WHAT to do?
   - Something a mentor would say, not a debugger?
   - A beginner can read and immediately see how it changes their thinking?
5. **Options / Flags**:
   - `--all`: Deliver the full principle set for the domain (up to 5 principles), bypassing the single core principle format.
   - `--domain <name>`: Force a specific domain, bypassing the automatic inference engine.
6. **Integration**: The skill MUST append a ready-to-run `vidbyte retain` shell block at the bottom under a "Lock this in?" header to facilitate easy spaced repetition onboarding.
7. **Quality Anchor**: The skill MUST reference the local `references/domain-examples.md` seed library to maintain an elite standard of abstraction.

### Non-Functional Requirements

- **Statelessness**: The skill does not write session state back to its own files, guaranteeing ease of installation in copy or link mode across Claude Code, Codex, and Gemini CLI.
- **Latency**: Inline execution should rely on zero-shot/few-shot cognitive reasoning based on the prompt instructions and reference files, ensuring high responsiveness.

---

## 5. High-Level Design

The `/theoretical-feedback` skill is structured as a stateless prompt skill. It resides under `skills/theoretical-feedback/`.

```text
vidbyte-cli/
  skills/
    theoretical-feedback/
      SKILL.md                  <-- The prompt instructions, constraints, and algorithm
      references/
        domain-examples.md      <-- Seed library of high-quality principle examples
  lib/
    skill-versions.json         <-- Version index registering the skill in version 3
  skills-manifest.json          <-- Manifest registry placing it under the learning category
```

When a user runs the `/theoretical-feedback` skill:
1. The host harness (e.g. Gemini CLI, Claude Code) loads the `SKILL.md` system prompt.
2. The model reads the input and refers to `references/domain-examples.md` to calibrate what high-quality class-level feedback looks like.
3. The model executes the extraction algorithm, performs the internal Transferability Test, formats the core and supporting principles, and outputs the result.
4. It also formats a copy-pasteable `vidbyte retain` command pre-filled with the extracted concepts so the user can easily lock it into their personal Spaced Repetition memory.

---

## 6. Detailed Design

### 6.1 `skills/theoretical-feedback/SKILL.md`

**File:** `skills/theoretical-feedback/SKILL.md`
**Type:** New File

#### What it does
Contains the skill's identity, frontmatter configuration, parsed arguments, step-by-step extraction procedure, Transferability Test guidelines, detailed output templates, and hard rules.

#### Interface / YAML Frontmatter
```markdown
---
name: theoretical-feedback
description: >
  Use when the user runs /theoretical-feedback. Given any situation or
  mistake — in any domain — extracts the underlying mental model or
  thinking habit that separates novices from experts in that domain and
  delivers it as transferable feedback. Does NOT give practical advice,
  fix specific mistakes, or tell the user what to do next. Gives feedback
  to the class of problem, not the instance.
version: 1.0.0
arguments: true
---
```

#### Logic / Algorithm
1. Parse the `$ARGUMENTS` to detect domains, situations, or flags (`--all`, `--domain <name>`).
2. Map to/infer the domain using the seed library for guidance.
3. Perform abstraction to obtain the class of problem.
4. Generate the primary and supporting principles.
5. Filter candidate principles using the 4-gate Transferability Test. Discard and regenerate if any gate fails.
6. Format output precisely using HSL-equivalent ANSI-style box outlines.
7. Include the "Lock this in?" block showing a pre-assembled `vidbyte retain` command with distilled concepts.

---

### 6.2 `skills/theoretical-feedback/references/domain-examples.md`

**File:** `skills/theoretical-feedback/references/domain-examples.md`
**Type:** New File

#### What it does
Provides concrete, elite-grade examples of high-level theoretical feedback across 10 distinct domains to serve as a high-fidelity reference for the model.

#### Domains Seeded
- Software Engineering
- Chess
- Writing
- Design (UI/UX)
- Machine Learning
- Investing / Finance
- Negotiation
- Public Speaking
- Mathematics / Problem Solving
- Management / Leadership

---

### 6.3 `lib/skill-versions.json`

**File:** `lib/skill-versions.json`
**Type:** Modified

#### What it does
Registers the `theoretical-feedback` skill in version 3 of the platform index.

#### Diff
```diff
   "2": [],
-  "3": []
+  "3": ["theoretical-feedback"]
```

---

### 6.4 `skills-manifest.json`

**File:** `skills-manifest.json`
**Type:** Modified

#### What it does
Registers the skill under the `learning` array so that it is properly compiled, validated, and packaged by the build system.

#### Diff
```diff
   "learning": [
     "blindspots",
...
     "retain",
     "struggle",
+    "theoretical-feedback",
     "transfer-signals",
```

---

## 7. Data Model Changes

N/A - This feature does not modify any databases or persistence layers.

---

## 8. API Changes

N/A - This feature does not expose or modify web endpoints.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/theoretical-feedback/SKILL.md` | Skill implementation prompt |
| CREATE | `skills/theoretical-feedback/references/domain-examples.md` | Domain seed library of top-tier principles |
| MODIFY | `lib/skill-versions.json` | Register the skill under version 3 |
| MODIFY | `skills-manifest.json` | Register the skill in the central manifest |

---

## 10. Testing Plan

### Automated Tests
- Run `npm test` at the root of `vidbyte-cli` to execute the full test suite (`validate.js`, `smoke-test.js`, and `cli-smoke-test.js`).
- Verify that metadata validation succeeds for the new skill.
- Verify that `validateVersionManifest` correctly checks that the version 3 reference exists and is linked properly in `skills/`.

### Manual / QA Test Cases
Verify inline response shape and argument handling by running dry runs of the prompt skill on various test inputs:
1. **Scenario 1**: Stated domain + situation.
   - Run `/theoretical-feedback chess I traded my bishop for a knight on move 12`
   - Expect correct output conforming to the standard output format, with no piece-specific recommendations.
2. **Scenario 2**: Situation only (domain inference).
   - Run `/theoretical-feedback I pitch to investors and they don't seem engaged`
   - Expect domain to be inferred as "Investing/Finance" or "Negotiation" and confirmed inline.
3. **Scenario 3**: Domain only.
   - Run `/theoretical-feedback --domain software-engineering`
   - Expect clarifying question: *"What happened or what are you trying to get feedback on?"*
4. **Scenario 4**: `--all` flag.
   - Run `/theoretical-feedback --domain software-engineering --all`
   - Expect a delivery of the full principle set (up to 5 principles) for software engineering.

---

## 11. Dependencies & External Services

N/A - No new dependencies are introduced.

---

## 12. Rollout & Deployment

- This is a non-breaking additions release.
- Running `node scripts/build-packages.js` compiles the package subdirectories, preparing it for immediate deployment across the `learning` packaging harnesses.

---

## 13. Open Questions

- None. The behavior, platform integration, and structure are completely specified.

---

## 14. Alternatives Considered

### Alternative 1: Make `/theoretical-feedback` a Python CLI-bound command
- **Why rejected**: A prompt-level skill flattens cleanly into rule-file platforms (Windsurf, Cursor, Cline) without requiring the user to update their local CLI binaries. Keeping it as a prompt skill ensures immediate cross-platform compatibility and zero deployment friction.

---
