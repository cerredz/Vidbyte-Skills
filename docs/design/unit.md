# Design Doc: /unit Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-21
**Last Updated:** 2026-05-21

---

## 1. Overview

The `unit` skill is a decomposition tool. Given any large, complex topic — a domain, a framework, a methodology, a system, an academic subject — it breaks it down into its smallest meaningful components. These are the atomic pieces that everything else is built from: the core concepts, principles, operations, and elements that can't be broken further without losing conceptual coherence. It is explicitly NOT a roadmap, a learning plan, a sequence, or a prioritization. It is pure decomposition — what are the pieces, organized by category, nothing more.

Invoked via `/unit <topic>`, it produces a structured catalog of atomic units grouped by natural category.

---

## 2. Goals & Non-Goals

### Goals
- Create a single `SKILL.md` prompt skill file
- Accept any topic — programming, business, science, humanities, arts, engineering — and decompose it into atomic units
- Identify the natural categories within the topic and group units accordingly
- Ensure each unit is "atomic": independently definable, conceptually coherent, and not further decomposable without losing meaning
- Present output as a clean, scannable catalog with category headings and unit entries
- Operate entirely as an inline response — no files, no CLI, no backend

### Non-Goals
- Sequencing, prioritizing, or recommending learning order — this is decomposition, not a roadmap
- Generating a curriculum, syllabus, or study plan
- Providing explanations or tutorials for each unit — definitions only
- Making value judgments about which units are more important
- Identifying dependencies between units (though natural grouping by category is included)
- Persisting state across invocations
- Calling external services or writing files

---

## 3. Background & Context

### The Problem

When faced with a large, unfamiliar topic — say "machine learning" or "Kubernetes" or "corporate finance" — the learner's first challenge is not understanding any specific piece. It's understanding what the pieces even are. The topic presents as a monolithic, opaque whole. Without a clear decomposition, the learner doesn't know where to start, what to prioritize, or how the pieces relate.

Existing resources (documentation, textbooks, courses) often obscure the decomposition by:
- Mixing explanation with structure (you can't see the pieces for the prose)
- Sequencing content for pedagogy rather than cataloging components
- Assuming the learner already knows the taxonomy

### What /unit Provides

`/unit` solves the "what even is this thing made of?" problem. It strips a topic down to its atomic conceptual pieces, organized into natural categories, so the learner can see the whole map at once. From there, they can decide what to learn first, what to skip, and how the territory is structured — but those decisions are theirs to make.

### Distinction from Existing Skills

| Skill | Function | Distinction |
|-------|----------|-------------|
| `docs-tldr` | Fetches docs and produces a cheat sheet with concepts, operations, mistakes, nav map | `docs-tldr` extracts from live documentation; `unit` decomposes from knowledge |
| `explain` | Explains a concept in depth | `explain` goes deep on one thing; `unit` goes wide across many things |
| `concept-coverage` | Tracks which concepts have been covered in a session | `concept-coverage` observes; `unit` generates |
| `mental-model` | Builds a mental model from a topic | `mental-model` builds a holistic picture; `unit` enumerates atomic pieces |

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate on `/unit <topic>` with a required topic argument.
2. The skill SHALL accept any topic — technical, academic, professional, creative, or abstract — and produce a decomposition.
3. The skill SHALL identify the natural categories or dimensions within the topic (e.g., for "databases": data modeling, querying, transactions, performance, administration).
4. The skill SHALL, for each category, enumerate the atomic units — the smallest concepts, principles, operations, or elements that are still independently meaningful.
5. Each unit SHALL be:
   - **Independently definable**: It has a clear identity and can be understood on its own terms
   - **Conceptually coherent**: It hangs together as a single idea
   - **Non-decomposable (at this level)**: Breaking it further would produce pieces that don't make sense in isolation
6. The skill SHALL provide a 1-sentence definition for each unit — enough to distinguish it from adjacent units, not enough to teach it.
7. The skill SHALL target 15-30 units per topic for typical domains. Narrower topics may produce fewer; broader topics may produce more (up to 50).
8. The skill SHALL present the output as a structured catalog:
   - Topic name at top
   - Brief (1-2 sentence) description of what the topic encompasses
   - Categories as section headers
   - Units within each category as a bulleted or numbered list with 1-sentence definitions
9. The skill SHALL NOT include:
   - Learning sequences, roadmaps, or recommended order
   - Tutorial content, examples, or deep explanations
   - Dependencies between units (X depends on Y)
   - Prioritization, difficulty ratings, or importance judgments
   - Prerequisites or "you should know X first"
10. The skill SHALL produce output as an inline response only. No files written, no CLI calls, no backend.
11. The skill SHALL handle edge cases gracefully:
    - **Overly broad topic** ("physics", "mathematics"): Narrow to a reasonable scope and note the boundary. Suggest sub-topics the user could decompose separately.
    - **Overly narrow topic** ("Python list comprehensions"): Produce the natural decomposition at that scope, even if it yields fewer units.
    - **Ambiguous topic** ("Ruby" — the language or the gem?): Ask for clarification or decompose both and label.
    - **Vague topic** ("leadership"): Extract the natural sub-domains and decompose each.

### Non-Functional Requirements

- **Performance**: Pure inline computation. Response expected within a single turn for all topics.
- **Scalability**: No persistent state. Each invocation is independent.
- **Security**: No file writes, no network calls, no credential exposure.
- **Observability**: The output itself is the only visible artifact.

---

## 5. High-Level Design

The skill is a single `SKILL.md` prompt file. The agent reads the instructions and executes a single-pass decomposition when invoked.

**Data flow:**

```
User invokes /unit <topic>
         |
         v
[Agent loads unit SKILL.md]
         |
         +-- Step 1: Scope the topic
         |     - If overly broad, narrow with boundary note
         |     - If ambiguous, clarify or decompose both
         |     - Define what the topic encompasses (1-2 sentences)
         |
         v
[Step 2: Identify natural categories]
         |     - What are the major dimensions/axes of this topic?
         |     - 3-8 categories for typical topics
         |
         v
[Step 3: Decompose each category into atomic units]
         |     - For each category, enumerate the smallest
         |       independently meaningful components
         |     - Each unit gets a 1-sentence definition
         |     - Target 15-30 units total
         |
         v
[Step 4: Format and deliver catalog]
               - Topic name
               - Description
               - Categories with units
               - No sequencing, no roadmap, no dependencies
```

**Key design decisions:**

1. **Atomic unit definition**: The hardest part is defining "smallest meaningful component." The rule is: can this unit be understood on its own, without referencing sibling units? If yes, it's atomic. If it can only be understood in relation to other things, it's been broken too far.

2. **Category-first organization**: Units are organized by natural category (e.g., "data types", "control flow", "I/O" for a programming language) rather than presented as a flat list. This provides structural context without implying sequence.

3. **No sequencing, no roadmap**: The most important constraint. Many tools that claim to "break down" a topic actually produce a learning plan. `/unit` explicitly does not. The user asked for the pieces, not the order.

4. **1-sentence definitions, not explanations**: Definitions distinguish units from each other. Explanations teach. The boundary is intentional — the output is a map, not a textbook.

5. **Utility category placement**: Like `docs-tldr`, this is a tool that transforms input. It belongs in the `"utility"` manifest category.

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition)

**File:** `skills/unit/SKILL.md`
**Type:** New file

Body sections:
1. **Identity** — You decompose large topics into their smallest meaningful components
2. **Goal** — Give the user the atomic pieces of any topic, organized by category, with no roadmap or sequencing
3. **Definition — What is a Unit?** — The atomic unit criteria: independently definable, conceptually coherent, non-decomposable at this level
4. **Algorithm** — 4-step decomposition (scope, categorize, decompose, deliver)
5. **What NOT to include** — Explicit prohibitions: no sequencing, no dependencies, no prioritization, no tutorials, no examples
6. **Output Format** — Exact output structure with topic, description, categories, and units
7. **Category Identification Heuristics** — How to find the natural categories within any topic
8. **Edge Cases** — Overly broad, overly narrow, ambiguous, and vague topics
9. **Constraints** — Guardrails (no files, no CLI, no sequencing)
10. **Success Criteria** — Verifiable outcomes
11. **Input** — `/unit <topic>` invocation

#### Logic / Algorithm

**Step 1 — Scope the topic:**
1. Read the user-provided topic.
2. If the topic is overly broad (e.g., "mathematics", "physics"), narrow it to a reasonable sub-domain (e.g., "linear algebra", "classical mechanics") and note the boundary. Suggest related sub-topics the user could decompose separately.
3. If the topic is ambiguous (e.g., "Ruby" could be language or gem), ask for clarification or decompose both dimensions and label them.
4. Define what the topic encompasses in 1-2 sentences. This bounds the decomposition.

**Step 2 — Identify natural categories:**
1. Scan the topic for natural dimensions or axes. A category is a grouping of related units that share a common concern.
2. Categories answer: what are the different *kinds* of things in this topic?
3. Target 3-8 categories. Too few means under-categorization; too many means over-fragmentation.
4. Category heuristics by domain:
   - **Technical frameworks/languages**: syntax, data model, execution model, standard library, ecosystem, tooling
   - **Scientific fields**: core principles, key phenomena, methods/tools, sub-disciplines, theoretical frameworks
   - **Business domains**: core concepts, key processes, metrics, stakeholders/roles, tools/systems
   - **Creative disciplines**: elements, principles, techniques, tools/mediums, genres/styles
   - **Abstract/philosophical topics**: key concepts, major positions/schools, central arguments, methods, applications

**Step 3 — Decompose each category into atomic units:**
1. For each category, enumerate the smallest components that are still independently meaningful.
2. Apply the atomic unit test to each candidate:
   - Can this be defined independently, without referencing sibling units? (If no, it's not atomic — group it with what it depends on)
   - Does it hang together as a single coherent idea? (If no, it's a grab-bag — split it further)
   - Could it be broken into smaller meaningful pieces? (If yes, break it down until you reach the floor)
3. Generate a 1-sentence definition for each unit. The definition should:
   - Identify what the unit IS (not what it's for)
   - Distinguish it from adjacent units in the same category
   - Be comprehensible to someone who understands the domain but not this specific topic
4. Target 15-30 units total. Adjust for topic scope:
   - Narrow topics (e.g., "Python decorators"): 5-12 units
   - Typical topics (e.g., "React", "SQL", "negotiation"): 15-30 units
   - Broad sub-domains (e.g., "machine learning", "microeconomics"): 25-50 units

**Step 4 — Format and deliver the catalog:**

```
+---------------------------------------------------+
|  /unit — <Topic Name>                             |
+---------------------------------------------------+

<1-2 sentence description of what the topic encompasses>

--- <Category 1> ---

- <Unit name>: <1-sentence definition>
- <Unit name>: <1-sentence definition>
...

--- <Category 2> ---

- <Unit name>: <1-sentence definition>
...

[... all categories and units]
```

The output is delivered inline. No file is written. No follow-up is offered.

### 6.2 Manifest Entry

Add `"unit"` to the existing `"utility"` category in `skills-manifest.json`.

### 6.3 Version Manifest

Add `"unit"` to version `"4"` in `lib/skill-versions.json`. If the `"4"` key does not exist, create it.

---

## 7. Data Model Changes

N/A — The skill maintains no persistent data. Output is delivered inline.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. This is a prompt-based skill with no server component.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/unit/SKILL.md` | Core skill definition |
| CREATE | `docs/design/unit.md` | This design document |
| MODIFY | `skills-manifest.json` | Add `"unit"` to `"utility"` category |
| MODIFY | `lib/skill-versions.json` | Add `"unit"` to version 4 |

**Total: 2 files created, 2 files modified, 0 files deleted.**

No changes to `scripts/validate.js` — the `"utility"` category is already supported.

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. The skill is a Markdown prompt.

### Integration Tests
N/A — The skill operates within the LLM's session context.

### Validation Tests
- **`npm test`** must pass — `validate.js` checks:
  - `skills/unit/SKILL.md` exists with valid frontmatter
  - `skills/unit` is listed in `skills-manifest.json` under `"utility"`
  - No dangling manifest entries or missing skill directories

### Manual / QA Test Cases

1. **Basic decomposition**: Given `/unit react`, then the output contains 3-8 categories (e.g., core concepts, component model, state management, rendering, ecosystem) with 15-30 units total, each with a 1-sentence definition.

2. **No roadmap content**: Given `/unit kubernetes`, then the output contains NO learning sequence, NO "start with X then learn Y", NO prerequisites, NO difficulty ratings.

3. **Atomic units are independent**: Given any unit in any `/unit` output, then its definition does not require knowledge of other units in the same decomposition.

4. **Categories are coherent**: Given any category in any `/unit` output, then all units within that category share a common concern or dimension.

5. **Overly broad topic handling**: Given `/unit mathematics`, then the skill narrows to a specific sub-domain and suggests other sub-topics.

6. **Overly narrow topic handling**: Given `/unit python-list-comprehensions`, then the skill produces a decomposition at that scope (fewer units, appropriate granularity).

7. **Ambiguous topic handling**: Given `/unit ruby`, then the skill either asks for clarification (language or gem?) or decomposes both dimensions.

8. **Non-technical topic**: Given `/unit negotiation`, then the skill decomposes it into categories and atomic units (principles, tactics, preparation, psychology, etc.).

9. **Abstract topic**: Given `/unit critical-thinking`, then the skill identifies categories (logical principles, cognitive biases, argument analysis, evidence evaluation, etc.) and atomic units within each.

10. **No file artifacts**: Given any invocation, then no files are created on disk.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | The skill has zero external dependencies | None |

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the user invokes `/unit <topic>`.
- **Breaking change**: No. This is a new, additive skill. No existing code is modified (manifest addition only).
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Rollback procedure**: Delete `skills/unit/` directory, remove from manifest, and re-run the installer.

---

## 13. Open Questions

- [ ] **Should the skill accept a `--depth` flag?** `/unit react --depth detailed` could produce more granular units (50+); `--depth overview` could produce fewer (10-15). **Recommendation**: Not in v1. The default depth with topic-scope adjustment covers the most common use cases.
- [ ] **Should units link to external resources?** Each unit could include a reference link to its primary documentation or canonical source. **Recommendation**: Not in v1. The skill is a decomposition tool, not a reference. Links would blur the boundary.
- [ ] **Should the skill detect and flag "false units"?** Some topics have concepts that appear atomic but are actually composites. Should the skill flag these? **Recommendation**: The atomic unit test (step 3) handles this implicitly. Explicit flagging adds noise.
- [ ] **Should the output include a "see also" for related topics?** At the bottom, suggest related topics the user might want to decompose next. **Recommendation**: Include for overly broad topics that were narrowed; omit otherwise.
- [ ] **Should categories have descriptions?** Currently, categories are just labels. A 1-sentence description per category could add context. **Recommendation**: Category names should be self-explanatory. Add descriptions only if a category name is unavoidably ambiguous.

---

## 14. Alternatives Considered

### Alternative 1: Learning roadmap instead of decomposition
- What: Sequence the units into a recommended learning order with prerequisites and milestones.
- Why rejected: The user explicitly said "not a roadmap." The skill's value is in answering "what is this made of?" — the question that comes before "how do I learn it?" Existing skills (`vidbyte-tutor`, course-structured content) handle learning sequences.

### Alternative 2: Flat list without categories
- What: Produce a single flat list of all units without category grouping.
- Why rejected: Flat lists obscure structure. Categories provide the natural dimensionality of the topic without implying sequence — the user can see "there are 4 kinds of things here" at a glance.

### Alternative 3: Deep explanations per unit
- What: Each unit gets a 3-5 sentence explanation with examples.
- Why rejected: The skill would become a mini-textbook, losing the scannability and density that makes it useful. Users who want explanations can ask about specific units separately or use the `explain` skill.

### Alternative 4: Dependency graph between units
- What: Show which units depend on which other units (X requires Y).
- Why rejected: Dependencies imply sequence, which the user explicitly rejected. Additionally, dependency relationships are often subjective — what one person considers a prerequisite, another considers independent.

### Alternative 5: Interactive drill-down
- What: Present top-level categories, let the user select one to see its units, drill down recursively.
- Why rejected: The skill is a prompt, not an interactive application. The full map on one screen is the value — the user can see everything at once and decide where to focus.

---

END OF DESIGN DOC
