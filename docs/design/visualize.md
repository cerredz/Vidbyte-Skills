# CONTEXT PROTOCOL HEADER
## Description
Architecture design document for the new `/visualize` skill.
## Purpose
To detail the design, requirements, visual templates, auto-routing algorithm, testing plan, and file manifests for `/visualize` skill, satisfying the architectural-first development workflow.
## Architecture
Covers the implementation of the new pure-prompt visual learning skill in `skills/visualize/SKILL.md` and integrations in manifest files.
## Relation to Codebase
Acts as the official architecture design record for the visual pedagogy module of `vidbyte-skills`.
## Similar Files
- [explain-counterargument-mental-model-research.md](file:///C:/Users/422mi/vidbyte-repos/vidbyte-cli/docs/design/explain-counterargument-mental-model-research.md)
- [optimal-feedback-agent.md](file:///C:/Users/422mi/vidbyte-repos/vidbyte-cli/docs/design/optimal-feedback-agent.md)

---

# Design Doc: /visualize — Dual-Coded Visual Learning Skill

**Status:** Draft
**Author:** Antigravity
**Created:** 2026-05-20
**Last Updated:** 2026-05-20

---

## 1. Overview

The `/visualize` skill is a user-invoked slash-command skill that extends the Vidbyte pedagogy suite with high-retention visual learning representations. Grounded in dual-coding theory, cognitive load theory, and Novak concept mapping, the skill takes a technical or abstract topic and automatically routes it to one of five visual formats: Concept Maps, Layered Architectures, Sequence Flowcharts, Analogy-to-Mechanism Maps, or Interactive Code Walkthroughs. The skill runs entirely as a prompt-based module, generating zero side effects and requiring no external visualization tools, formatting the visual artifacts inline using clean Unicode box-drawing or ASCII characters.

---

## 2. Goals & Non-Goals

### Goals

- Implement a new `/visualize` skill under `skills/visualize/SKILL.md` that activates on `/visualize` slash commands.
- Support 5 distinct, high-retention visual output formats utilizing ASCII/Unicode formatting.
- Implement an auto-routing classifier that automatically selects the optimal visual format based on the topic's characteristics.
- Ground all generated visuals in established cognitive and learning-science theories (dual-coding, split-attention reduction, scaffold-before-detail).
- Integrate the skill into the main `skills-manifest.json` catalog and version lists.
- Pass all repository verification tests (`npm run validate` and `npm test`).

### Non-Goals

- Creating or writing files to disk (no image generation, no PDF output).
- Integrating with external browser-based rendering APIs or native drawing packages.
- Modifying the CLI payload structure or introducing any Python backend dependencies.

---

## 3. Background & Context

While Vidbyte currently offers several pedagogical skills, such as `/explain` (for layered definitions) and `/mental-model` (for narrative-based cognitive framing), it lacks a dedicated visual reasoning tool.

Visual representations are highly effective, but standard AI-generated diagrams frequently suffer from three primary failures:
1. **Split-Attention Effects**: Requiring the user to constantly shift attention between a diagram and a detached legend.
2. **Cognitive Overload**: Presenting overwhelming detail before establishing a high-level structural scaffold.
3. **Weak Propositional Links**: Presenting connections without explicit relational verbs (e.g. connecting box A and B with a simple line, leaving the relationship ambiguous).

The `/visualize` skill systematically resolves these defects by implementing a structured visual pedagogy framework.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate when the user invokes `/visualize` followed by their query/topic.
2. The skill SHALL support an optional format prefix: `map:`, `arch:`, `flow:`, `analogy:`, or `tour:`.
3. If no format prefix is specified, the skill SHALL automatically classify the topic and route it to the optimal layout:
   - **Abstract structures or conceptual relationships** -> Concept Map / Dependency Graph
   - **Component boundaries, API isolation, security layers** -> Layered System Architecture / Boundary Map
   - **Processes, timelines, data routing, protocols** -> Sequence Flowchart / Chronological Timeline
   - **Complex algorithms, low-level mechanics, hardware, maths** -> Analogy-to-Mechanism Mapping
   - **Code blocks, design patterns, middleware** -> Interactive Code Walkthrough / Tour
4. All visual formats SHALL be rendered inline using clean Unicode box-drawing characters (`┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼`) or standard ASCII.
5. Diagrams SHALL place labels directly inside or adjacent to the visual elements to prevent the split-attention effect (no legends).
6. Concept Maps SHALL enforce labeled directional arrows (e.g., `──[ authenticates with ]──>`) indicating the exact relationship.
7. Analogy mappings SHALL explicitly declare their failure boundaries ("This analogy breaks down at...").
8. The output structure SHALL enforce **Scaffold-Before-Detail** (skeleton diagram first, followed by zoom-in explanation).
9. The response SHALL end with a **Generative Active Learning** retrieval challenge asking the user to make a prediction about a modification to the visual structure.

### Non-Functional Requirements

- **Zero-Dependency Portability**: Must operate as a pure text prompt.
- **Low Latency**: The visual representation must be generated in a single inline model response turn.
- **Validation Compliance**: The skill folder structure and manifests must satisfy all existing repo check constraints.

---

## 5. High-Level Design

The `/visualize` skill is designed as a portable instruction set added to the Vidbyte skill collection under `skills/visualize/SKILL.md`. The core architecture utilizes prompt engineering to instantiate a "Visual Pedagogy Engineer" agent.

When a user submits `/visualize <topic>`, the harness passes the request to the model, which simulates the following stages:

```text
User Request → [Prefix or Automatic Classification]
                     ↓
         [Pedagogical Visual Router]
                     ↓
     ┌───────────────┼───────────────┬───────────────┐
     ▼               ▼               ▼               ▼
[Concept Map]  [Layered Arch]   [Sequence]    [Analogy Map]   [Code Tour]
     └───────────────┼───────────────┴───────────────┘
                     ▼
         [Dual-Coded Explanation]
                     ▼
         [Active Learning Prompt]
```

Stage details:
1. **Routing**: Analyzes query metadata and routes to one of the 5 layouts.
2. **Visual Construction**: Drafts the diagram using a structured Unicode box format, enforcing inline labeling and explicit relational vectors.
3. **Dual-Coded Grounding**: Produces a verbal explanation that explicitly calls out landmarks in the diagram.
4. **Active Learning**: Appends a highly targeted retrieval challenge.

---

## 6. Detailed Design

### 6.1 Visualize Skill Prompts

**File(s):** `skills/visualize/SKILL.md`
**Type:** New file

#### What it does
Houses the core system instructions, style constraints, format templates, routing rules, and pedagogical guidelines.

#### Interface / API
```markdown
Usage: /visualize [format:] <topic>
```

#### Logic / Algorithm
1. **Mode Detection**: Check if prompt starts with `/visualize`. If yes, proceed; if no, keep silent.
2. **Layout Routing**: Parse prefix or evaluate topic keywords.
3. **High-Level Diagramming**: Output the selected diagram type first.
4. **Detailed Explanation**: Walk through the component mechanics.
5. **Epistemic Retrieval**: Present the user with a "What if" architectural change question.

---

## 7. Data Model Changes

N/A - This is a pure-prompt skill that does not introduce any schema or database modifications.

---

## 8. API Changes

N/A - Leverages existing slash command discovery harnesses.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/visualize.md` | This design document |
| CREATE | `skills/visualize/SKILL.md` | Core visualize skill prompt |
| MODIFY | `skills-manifest.json` | Register the skill under learning |
| MODIFY | `lib/skill-versions.json` | Add to versions 1 and 3 |

---

## 10. Testing Plan

### Automated Tests
- Run `npm run validate` to verify schema, YAML parsing, manifest registration, and version matching.
- Run `npm test` to run full regression smoke tests.

### Manual / QA Test Cases
1. **Auto-routing conceptual**: `/visualize closures` -> Verify it renders a Concept Map hierarchy.
2. **Auto-routing protocol**: `/visualize OAuth flow` -> Verify it renders a Sequence flowchart with client, auth server, resource server lanes.
3. **Forced format**: `/visualize analogy: garbage collection` -> Verify it forces the split analogy-mechanism layout with failure boundary.

---

## 11. Dependencies & External Services

N/A - Zero external runtimes, dependencies, or service connections required.

---

## 12. Rollout & Deployment

- The skill will be packaged inside the regular `vidbyte-skills` module.
- Running `npm run install-skills` or updating `npx vidbyte-skills` will distribute the updated skill, flat rule documents, and configuration files into user harnesses automatically.

---

## 13. Open Questions

None.

---

## 14. Alternatives Considered

### Alternative 1: Mermaid.js Only
- **What**: Enforce Mermaid syntax exclusively for all diagrams.
- **Why rejected**: Many terminal-based harnesses (e.g. aider, claude-code) render raw markdown and cannot visually display Mermaid diagrams, leading to unreadable syntax text blocks for the user. ASCII/Unicode box art provides a superior, universally readable fallback that renders perfectly in all shells and markdown readers.

---
