<!--
CONTEXT PROTOCOL HEADER
Description: Design document for the /jargon utility skill in version 4.
Purpose: Coordinates architecture, detailed designs, registry listings, and verification paths prior to branch worktree execution.
Architecture: Standard Markdown design doc conforming to design-doc template sections.
Relation to Codebase: Saved under docs/design/jargon-skill.md to track structural intent and obtain explicit user approval.
Similar Files: docs/design/read-find-papers-skills.md.
-->

# Design Doc: /jargon Utility Skill

**Status:** Draft
**Author:** Antigravity
**Created:** 2026-05-21
**Last Updated:** 2026-05-21

---

## 1. Overview

Unfamiliar technical vocabulary or field-specific terminology creates continuous cognitive friction during deep reading, onboarding, or technical conversations. The `/jargon` skill is a proactive, plain-language "vocabulary primer" utility. It front-loads the friction of entering a new technical domain or reading dense text by surfacing key terminology and explaining it in simple, plain-language definitions—strictly avoiding the use of jargon to explain jargon. Additionally, it features "predictive priming" to infer what terminology an expert in the given space naturally utilizes, ensuring the user is fully briefed before engaging.

---

## 2. Goals & Non-Goals

### Goals
* **Extract & Surface Vocabulary**: Identify high-friction, domain-specific terminology from a user-supplied piece of text, topic, or field.
* **Jargon-Free Explanations**: Generate definitions that strictly explain terms in plain English, avoiding circular definitions where obscure terms are used to explain other obscure terms.
* **Predictive Domain Priming**: When given a broad field or topic, anticipate and define terminology that an expert would naturally use, even if those terms are not explicitly found in the user prompt.
* **Ecosystem Versioning**: Deploy the skill certified under **Version 4** of the Vidbyte CLI ecosystem.
* **Clean Terminal Presentation**: Render the vocabulary primers in beautifully structured, boxed tables in the console.

### Non-Goals
* **Synthesizing General Guides**: Creating general-purpose summaries or tutorial guides of the field (use `/retain` or `/explain` instead).
* **Live Dictionary Web APIs**: Querying live external dictionary services (the skill operates entirely offline using robust prompt instruction inference and static local domain maps).

---

## 3. Background & Context

Currently, the Vidbyte CLI features powerful active learning skills, but lacks a dedicated vocabulary translation and domain-priming assistant. When a user runs into unfamiliar terms (e.g. "homoscedasticity" in statistics or "reentrancy" in smart contracts), they must break their reading flow to perform an external search. Front-loading this dictionary priming enables the user to engage with dense material or walk into expert conversations with immediate conceptual fluency.

---

## 4. Requirements

### Functional Requirements
1. **Multi-Input Parsing**: Support input consisting of either a piece of text (e.g., abstract, codebase snippet), a specific topic (e.g., "transformer neural networks"), or an entire field (e.g., "microbiology").
2. **Plain-Language Gating**: The system must rewrite definitions into plain-language counterparts. If a term like *recursion* is defined, the explanation must not use words like *inductive* or *self-referential* without immediate plain-language translations.
3. **Predictive Term Expansion**: Generate at least 5-8 foundational terms that represent expert conceptual anchors for the inferred domain.
4. **Console Rendering**: Draw clean ASCII tables with columns for `Term`, `Pronunciation/Analogy`, and `Plain-Language Explanation`.
5. **Ecosystem Compliance**: Register the skill under the `learning` category in the manifest and version `4` in the CLI versions database.

### Non-Functional Requirements
* **Offline Performance**: Surfacing terms and generating plain-language guides must complete in a single conversational round.
* **Validation Gating**: Must pass structural validation checks (`npm test`) with zero exit code.
* **Documentation Compliance**: Every created/edited file must carry a Context Protocol Header.

---

## 5. High-Level Design

The `/jargon` utility is discovered and packed by the CLI compiler. When a user invokes the skill via the command line or conversational agent with `/jargon <input>`, the skill acts as a vocabulary priming pipeline.

```text
[Input: Text/Topic/Field]
       │
       ▼
[Infer Domain & Load Maps] ──► (Using jargon-field-map.md local maps)
       │
       ▼
[Term Extraction & Expansion] ──► (Surface text terms + predict expert terms)
       │
       ▼
[Plain-Language Definition Engine] ──► (Translate terms to plain English analogies)
       │
       ▼
[Console Layout Formatter] ──► (Beautiful terminal-native ASCII boxes)
```

---

## 6. Detailed Design

### 6.1 `skills/jargon/SKILL.md`
**File:** `skills/jargon/SKILL.md`
**Type:** New file

#### What it does
Exposes the main system prompt guiding the assistant on how to act as a vocabulary primer, parse inputs, rewrite complex jargon terms into plain language, predict expert terminologies, and structure the terminal console output.

#### Interface / Prompt Contract
```markdown
---
name: jargon
description: Surface domain-specific jargon, translate it to plain language, and prime vocabulary for technical topics.
---
...
```

---

### 6.2 `skills/jargon/scripts/extract-jargon.js`
**File:** `skills/jargon/scripts/extract-jargon.js`
**Type:** New file

#### What it does
Implements local heuristics and string cleanups to extract potentially difficult or dense terms from the input text before passing them to the translation model.

#### Interface / API
```javascript
export function cleanText(input) { ... }
export function extractPotentialTerms(text) { ... }
```

---

### 6.3 `skills/jargon/references/jargon-field-map.md`
**File:** `skills/jargon/references/jargon-field-map.md`
**Type:** New file

#### What it does
Provides standard vocabulary mappings and seed terms for high-friction domains (e.g. Distributed Systems, Immunology, Mathematical Physics, Corporate Finance, Smart Contracts) to facilitate predictive priming when a user inputs a field name rather than a dense text block.

---

### 6.4 `skills-manifest.json`
**File:** `skills-manifest.json`
**Type:** Modified

#### What it does
Registers `"jargon"` under the `"learning"` array alphabetically, and embeds the top-level `_context_protocol` header key.

---

### 6.5 `lib/skill-versions.json`
**File:** `lib/skill-versions.json`
**Type:** Modified

#### What it does
Registers `"jargon"` under the new version `"4"` array, and embeds the top-level `_context_protocol` header key.

---

### 6.6 `scripts/validate.js`
**File:** `scripts/validate.js`
**Type:** Modified

#### What it does
Incorporate a Context Protocol Header block at the top of the file, and ensure that the validator skips `_context_protocol` key within `lib/skill-versions.json` without failing tests.

---

## 7. Data Model Changes
N/A - This change only affects runtime prompt execution and static registries.

---

## 8. API Changes
N/A - No external API changes.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/jargon/SKILL.md` | Core system prompt and behavior contract. |
| CREATE | `skills/jargon/scripts/extract-jargon.js` | Text scanning and matching utility. |
| CREATE | `skills/jargon/references/jargon-field-map.md` | Core seed-vocabulary domain primer mapping. |
| MODIFY | `skills-manifest.json` | Register jargon skill alphabetically. |
| MODIFY | `lib/skill-versions.json` | Add version 4 block and register jargon skill. |
| MODIFY | `scripts/validate.js` | Handle special _context_protocol key and add header. |

---

## 10. Testing Plan

### Unit Tests
* **`extract-jargon.js` validation**: Verify that candidate extraction works across long blocks, handling punctuation, newlines, and capitalization cleanups.

### Integration / Smoke Tests
* **`npm test`**: Verify that structural validation, catalog compilation, and CLI loader scripts compile and pass cleanly.

### Manual / QA Test Cases
1. **Domain Priming**: Given `/jargon "Smart Contracts"`, verify that terms like "gas limit", "reentrancy", "state trie", and "evm" are surfaced and explained with clear analogies (e.g., gas limit compared to car fuel budgets).
2. **Text Extraction**: Given a dense physics snippet containing "Bose-Einstein condensate", verify that the term is extracted and described as a "super-atom that behaves like a single wave when cooled to near-zero temperatures".

---

## 11. Dependencies & External Services
N/A - Uses native Node.js libraries.

---

## 12. Rollout & Deployment
* Backward-compatible; registers as version 4 which ensures it does not interfere with version 1, 2, or 3 environments.
* Rollback is performed by reverting modifications to the manifest and versions registry.

---

## 13. Open Questions
* [ ] Do we need support for language translation? (Decided: out of scope for Version 4; English jargon translation is the primary focus).

---

## 14. Alternatives Considered

### Alternative 1: Web Dictionary Integration
* **Why rejected**: Creating direct HTTP integrations adds latency, API key management complexity, and introduces fragile dependencies that break when the external service is down. Local/prompt-driven priming provides instant, offline, deterministic responses.
