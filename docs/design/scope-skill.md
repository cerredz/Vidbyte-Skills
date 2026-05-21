<!--
CONTEXT PROTOCOL HEADER
Description: Design document for the /scope utility skill in version 4.
Purpose: Coordinates the architectural framework, requirements, detailed file blueprints, and validation steps prior to branch execution.
Architecture: Standard Markdown design doc conforming to design-doc template sections.
Relation to Codebase: Saved under docs/design/scope-skill.md to track structural intent and obtain user approval.
Similar Files: docs/design/jargon-skill.md, docs/design/read-find-papers-skills.md.
-->

# Design Doc: /scope Utility Skill

**Status:** Draft  
**Author:** Antigravity  
**Created:** 2026-05-21  
**Last Updated:** 2026-05-21  

---

## 1. Overview

One of the most common and underrated failure modes in learning is not knowing what you are actually signing up for. When a user decides to learn a broad technical or academic field (e.g., machine learning, economics, systems design, philosophy), they lack an honest, objective map of the actual territory. They either go too narrow too quickly and miss foundational pillars, or they go too broad and get overwhelmed.

The `/scope` utility skill acts as a cognitive cartographer. It defines the exact shape and boundaries of a domain before the user commits any real time or energy to it. It answers three questions:
1. **Core**: What is actually inside the field?
2. **Adjacent**: What sits at the edges of the field and is adjacent but distinct?
3. **Misconceptions**: What is commonly assumed to be part of the field but is actually separate or a subfield?

---

## 2. Goals & Non-Goals

### Goals
* **Delineate Boundaries**: Clarify the scope of any broad field, topic, or research domain.
* **Contrast Neighboring Topics**: Draw sharp distinctions between easily conflated fields (e.g. Machine Learning vs. Data Analysis, Cryptography vs. Blockchains).
* **Demystify Misconceptions**: Identify topics commonly assumed to be core parts of the field that are technically distinct or separate domains.
* **Concise Formatting**: Keep outputs concise, concrete, and high-impact to prevent reading fatigue.
* **Version 4 Certified**: Fully integrate the skill into **Version 4** of the Vidbyte CLI registry and version schemas.
* **Premium Terminal Styling**: Render boundary charts in a visually striking ASCII block structure.

### Non-Goals
* **Creating Learning Roadmaps**: The skill does not prescribe chronological learning orders or paths (use other tutor skills for curriculum plans).
* **Teaching the Subject Matter**: The skill is purely for defining scope and boundaries, not for explaining every individual concept in depth (use `/explain` or `/jargon` for terminology details).
* **Using Online Web APIs**: Operates fully offline using robust prompt synthesis and static local seed maps.

---

## 3. Background & Context

Currently, the Vidbyte CLI features powerful active learning skills, but does not have a boundary-mapping utility. Beginners starting a new topic often fail to see "the forest for the trees," leading them to spend weeks on minor sub-topics, or to confuse related disciplines. Front-loading a clear mapping of a field allows learners to spot when they are conflating two different fields, or when the thing they actually want to learn is a subfield of something much larger.

---

## 4. Requirements

### Functional Requirements

1. **Command Ingestion**: Support the `/scope "<input>"` format.
2. **Three-Way Boundary Analysis**: Output three concise, concrete sections:
   * **Core**: Key pillars, concepts, and primary branches defining the field.
   * **Adjacent & Distinct**: Neighboring fields/topics that overlap at the boundary but are separate.
   * **Commonly Misattributed**: Topics incorrectly assumed to be core parts of this domain but are distinct.
3. **Aesthetic Terminal Printout**: Output the map inside a beautiful ASCII boundary box layout.
4. **Interactive Flag Support**:
   * `/scope "<input>" --depth <high-level|deep>`: Control explanation granularity (default is high-level).
   * `/scope "<input>" --focus <area>`: Direct the mapping engine to concentrate the boundary analysis relative to a specific subfield.
5. **Ecosystem Compliance**: Register the skill under the `learning` category in `skills-manifest.json` and version `"4"` in `lib/skill-versions.json`.

### Non-Functional Requirements

* **Performance**: Map generation must complete in a single conversational turn.
* **Zero Testing Failures**: Must pass standard validator checks (`npm test`) with a zero exit code.
* **Header Compliance**: Every created file must comply with the global user rule for Context Protocol Headers.

---

## 5. High-Level Design

The `/scope` utility is integrated into the CLI's category registries. When a user runs `/scope <input>`, the prompt execution pipeline triggers:

```text
[Input: Broad Topic/Field]
            │
            ▼
[Infer Domain & Consult Seeds] ──► (Using scope-field-map.md domain maps)
            │
            ▼
[Boundary Mapping Engine] ──► (Determine Core vs. Adjacent vs. Misconceptions)
            │
            ▼
[ASCII Terminal Presenter] ──► (Structured boundary map printout)
```

---

## 6. Detailed Design

### 6.1 `skills/scope/SKILL.md`
**File:** `skills/scope/SKILL.md`  
**Type:** New file  

#### What it does
Houses the system prompt contract guiding the LLM on how to act as a boundary cartographer, parse user fields/topics, map the core, adjacent, and misattributed elements, and structure terminal outputs.

#### Interface / Contract
```markdown
---
name: scope
description: Define boundaries of broad domains, highlighting core, adjacent, and misattributed fields.
---
<!--
CONTEXT PROTOCOL HEADER
Description: Main prompt instructions for the scope utility skill.
Purpose: Coordinates how the agent defines domain scopes, identifies adjacent fields, corrects misconceptions, and prints beautiful terminal maps.
...
-->
```

---

### 6.2 `skills/scope/references/scope-field-map.md`
**File:** `skills/scope/references/scope-field-map.md`  
**Type:** New file  

#### What it does
Provides seed mappings for key disciplines (e.g. Systems Design, Economics, Machine Learning, Philosophy) to serve as high-signal templates for boundary generation.

#### Structure
Structured markdown tables containing Core Pillars, Adjacent Fields, and Common Misconceptions for each seed domain.

---

### 6.3 `skills/scope/scripts/parse-scope-args.js`
**File:** `skills/scope/scripts/parse-scope-args.js`  
**Type:** New file  

#### What it does
Parses CLI command arguments like `--depth` and `--focus`, handles input sanitization, and structures options for the prompt.

#### Interface
```javascript
export function parseScopeArgs(argsArray) {
  // Input: array of strings
  // Output: { cleanInput: string, depth: string, focus: string }
}
```

---

### 6.4 Registry Registrations
**Files:** `skills-manifest.json`, `lib/skill-versions.json`  
**Type:** Modified  

#### What it does
Integrates `scope` into the system-wide CLI registries under category `learning` and Version `4`.

---

## 7. Data Model Changes

N/A - This is a stateless utility prompt skill and does not modify database schemas.

---

## 8. API Changes

N/A - This is a local CLI prompt skill and does not expose external HTTP API endpoints.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/scope/SKILL.md` | Core prompt instruction contract |
| CREATE | `skills/scope/references/scope-field-map.md` | Static seed mapping reference |
| CREATE | `skills/scope/scripts/parse-scope-args.js` | Helper script to sanitize inputs and parse optional flags |
| MODIFY | `skills-manifest.json` | Register `scope` under `learning` category (alphabetically) |
| MODIFY | `lib/skill-versions.json` | Register `scope` in version `4` registry array |

---

## 10. Testing Plan

### Unit Tests
* **`describe('parseScopeArgs')`**:
  * Verify it extracts clean input strings correctly.
  * Verify standard fallback options when `--depth` or `--focus` are absent.
  * Verify parsing of `--depth deep` and `--focus "behavioral"` flags.

### Integration Tests
* **`npm test`**: Run validation suite checking for category mappings, valid frontmatter, version tier consistency, and zero test crashes.

### Manual / QA Test Cases
1. Run `/scope "Machine Learning"`:
   * Verify core, adjacent (e.g. Data Analysis), and misattributed (e.g. AGI) sections render concisely in ASCII.
2. Run `/scope "Systems Design" --depth deep --focus "distributed"`:
   * Verify deep granularity formatting and distributed systems orientation.

---

## 11. Dependencies & External Services

N/A - Zero external runtime dependencies.

---

## 12. Rollout & Deployment

### Rollout
Merged and packaged into the active CLI registry, immediately available for deployment via `install.js`.

### Rollback
Git revert version tags and registry modifications.

---

## 13. Open Questions

No open questions.

---

## 14. Alternatives Considered

### Alternative 1: Directing the user to `/explain`
* **Why rejected**: `/explain` teaches specific concepts and mechanics. It does not provide high-level boundary cartography, leading to potential overwhelm when exploring broad disciplines.

### Alternative 2: Prescribing detailed chronological learning roadmaps
* **Why rejected**: Chronological roadmaps can be subjective, opinionated, and high-maintenance. A pure boundary-scoping map is factual, concise, and empowers the user to choose their own focus.
