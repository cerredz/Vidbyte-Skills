# Design Doc: explain-away-others, define-success, no-conclusions

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-13
**Last Updated:** 2026-05-13

---

## 1. Overview

Add three new user-invoked slash-command skills to the Vidbyte catalog and register them in the central `vidbyte-tutor` orchestration skill. Each skill enforces a specific cognitive discipline that the model would otherwise circumvent:

- **`explain-away-others`** (`/ruled-out`): Before proceeding with the user's proposed approach, the model identifies 2-3 genuine competitive alternatives and will not continue until the user explains — with context-specific, mechanism-level precision — why each alternative fails in their situation. Generic dismissals are returned.
- **`define-success`** (`/define-success`): The model blocks any task until the user provides success criteria that a third party not present for the conversation could use to evaluate completion. The bar is third-party evaluability across four fields: WHAT changes, HOW verified, THE THRESHOLD, THE DEADLINE.
- **`no-conclusions`** (`/no-conclusions`): The model acts as a pure information and mechanism provider, never drawing conclusions, recommendations, diagnoses, or decisions. Uses only a permitted vocabulary of observations and mechanisms.

All three are **prompt skills** — user-invoked slash commands that produce stateless, format-governed responses. They follow the same architectural pattern as the existing `question` skill.

The `vidbyte-tutor` orchestrator skill (described in its own design doc at `docs/design/vidbyte-tutor.md`) will be updated to include these three skills in its non-trace skills catalog so the orchestrator can route users to them.

---

## 2. Goals & Non-Goals

### Goals

- Create `skills/explain-away-others/SKILL.md` with frontmatter and full procedural instructions
- Create `skills/define-success/SKILL.md` with frontmatter and full procedural instructions
- Create `skills/no-conclusions/SKILL.md` with frontmatter and full procedural instructions
- Create `skills/vidbyte-tutor/SKILL.md` as the central orchestrator skill (if not yet created) with catalog entries for all three new skills
- All skills pass existing validation (`npm test`)
- Each skill is self-contained with zero dependencies
- Each skill follows the established SKILL.md conventions (YAML frontmatter, procedural instructions, constraints, success criteria)

### Non-Goals

- No changes to the installer (`bin/`, `lib/`)
- No CLI commands, backend endpoints, or network calls
- No file I/O — all three skills are stateless inline-response formatters
- No automatic/background activation — all three are user-invoked via slash command
- No modifications to existing skills
- No changes to `package.json` or README (the installer discovers new skills automatically)

---

## 3. Background & Context

This repository already contains several non-trace user-invoked prompt skills (`question`, `vidbyte-auth`), always-on background skills (`why`, `anti-passive`, `do-not-repeat`), and CLI-backed background skills (`feedback-generator`, `compression-check`). The catalog also includes 122 reasoning trace families with scale variants.

The three new skills fill specific cognitive gaps:

1. **explain-away-others**: Users (and the models assisting them) routinely default to the first approach that comes to mind without seriously evaluating alternatives. Even when alternatives are considered, the evaluation is often perfunctory — "X is too slow" rather than "X would exceed our 100ms p95 latency budget given 10K concurrent connections and our current c3.large instance tier." This skill forces a deliberate, context-grounded alternative evaluation before proceeding.

2. **define-success**: Users routinely ask models to perform tasks without defining what done looks like. This leads to unbounded work ("the code is cleaner"), circular criteria ("the bug is fixed"), or unverifiable outcomes ("it feels more intuitive"). This skill enforces third-party evaluable success criteria before work begins.

3. **no-conclusions**: Models default to drawing conclusions — identifying bugs, recommending approaches, diagnosing problems. This habit removes the cognitive work that builds the user's own judgment. A developer who only receives bug identifications never develops the ability to read code and find breaks. This skill forces the model to present only observations and mechanisms, forcing the user to synthesize.

The `vidbyte-tutor` design doc at `docs/design/vidbyte-tutor.md` already defines the orchestrator skill's structure, catalog, and routing rules. The tutor skill file (`skills/vidbyte-tutor/SKILL.md`) does not yet exist. This design creates it with the full catalog, including the three new skills.

---

## 4. Requirements

### Functional Requirements

#### explain-away-others (`skills/explain-away-others/SKILL.md`)

1. The skill SHALL activate when the user prompt starts with `/ruled-out` (or `/explain-away-others`).
2. The skill SHALL read the user's request and identify the approach they are proposing.
3. The skill SHALL generate 2-3 genuine, competitive alternatives that a competent practitioner in that domain would seriously consider.
4. The skill SHALL block the request with a formatted prompt listing each alternative in one sentence and requiring the user to explain why each fails in their specific context.
5. The skill SHALL evaluate user explanations against two criteria: (a) context-specificity — does it reference actual constraints, data, requirements? (b) mechanism of failure — does it explain why, not just state that?
6. The skill SHALL return generic dismissals with a specific explanation of what was missing and request a revised response.
7. The skill SHALL proceed with the user's original approach ONLY after all alternatives have been satisfactorily explained away.
8. The skill SHALL NOT proceed if any explanation is generic, vague, or lacks mechanism-of-failure reasoning.
9. The skill SHALL NOT accept "the user picks the alternatives" — the model must generate them.
10. The skill SHALL include cross-domain examples (software, medicine, law, finance, writing) in the body so the LLM can model the behavior.

#### define-success (`skills/define-success/SKILL.md`)

11. The skill SHALL activate when the user prompt starts with `/define-success`.
12. The skill SHALL block the user's request immediately and present a four-field template: WHAT changes, HOW verified, THE THRESHOLD, THE DEADLINE.
13. The skill SHALL evaluate each field against the third-party evaluability test: could someone who has never spoken to the user read this and know whether the task succeeded?
14. The skill SHALL return any field that fails the third-party evaluability test with a specific explanation of why it fails.
15. The skill SHALL NOT accept partial progress — all four fields must pass before proceeding.
16. The skill SHALL explicitly guard against three failure modes: vague success, circular success, and unverifiable success.
17. The skill SHALL NOT accept vague criteria like "the code is cleaner" without measurable dimension (fewer lines? lower complexity? faster execution?).
18. The skill SHALL NOT accept circular criteria like "the bug is fixed" without specifying current vs. expected behavior.
19. The skill SHALL include cross-domain examples in the body.

#### no-conclusions (`skills/no-conclusions/SKILL.md`)

20. The skill SHALL activate when the user prompt starts with `/no-conclusions`.
21. The skill SHALL operate under a strict permitted/prohibited vocabulary:
    - Permitted: observations ("This function iterates N times"), data ("the lab value is 3.2x"), mechanisms ("the drug acts by..."), patterns ("7 of 9 cases...")
    - Prohibited: conclusions ("this is causing your bug"), recommendations ("you should..."), diagnoses ("this is liver damage"), decisions ("the answer is..."), implications ("this means...")
22. The skill SHALL redirect when the user pushes for conclusions: "Here is what I can observe: [restates]. What are you seeing?"
23. The skill SHALL NEVER apologize for not concluding — it simply does not conclude.
24. The skill SHALL surface a contradictory data point if the user's own conclusion is demonstrably incorrect given the data presented, using only: "Note that [specific data point] shows [value], which differs from the assumption in your conclusion."
25. The skill SHALL include cross-domain examples in the body.
26. The skill SHALL NOT relent when the user pushes — the redirection is consistent.

#### vidbyte-tutor (`skills/vidbyte-tutor/SKILL.md`)

27. The skill SHALL serve as the central orchestrator for all Vidbyte skills.
28. The skill SHALL include a non-trace skills catalog with use cases for all existing non-trace skills.
29. The skill SHALL include entries for `explain-away-others`, `define-success`, and `no-conclusions` in the non-trace catalog.
30. The skill SHALL follow the structure defined in `docs/design/vidbyte-tutor.md`.

### Non-Functional Requirements

- **Performance**: Negligible overhead. All skills are prompt-only with no I/O, network, or computation.
- **Scalability**: Stateless per invocation. No session state.
- **Security**: No file writes, network calls, credential exposure.
- **Observability**: Structured response formats are self-evident.
- **Reliability**: If the user provides insufficient context for `explain-away-others` to generate meaningful alternatives, the skill asks for the missing context rather than generating weak alternatives.

---

## 5. High-Level Design

Add four new skills as self-contained `SKILL.md` files under `skills/`. Each skill is a pure prompt instruction set — no runtime code, no dependencies, no file I/O.

**Data flow for explain-away-others:**

```
User: "/ruled-out [proposed approach]"
         |
         v
[Agent with explain-away-others skill loaded]
         |
         +-- Does prompt start with "/ruled-out" or "/explain-away-others"?
         |     No --> Normal response
         |    Yes
         |     +-- Identify the approach user is proposing
         |     +-- Generate 2-3 genuine alternatives
         |     +-- Block with explanation prompt
         |     +-- User responds with explanations
         |     +-- Evaluate each explanation
         |     |     Generic? --> Return with specific feedback
         |     |     Context-specific + mechanism? --> Accept
         |     +-- All alternatives explained away? --> Proceed with original task
```

**Data flow for define-success:**

```
User: "/define-success [task description]"
         |
         v
[Agent with define-success skill loaded]
         |
         +-- Does prompt start with "/define-success"?
         |     No --> Normal response
         |    Yes
         |     +-- Block and present four-field template
         |     +-- User responds with filled template
         |     +-- Test each field: third-party evaluable?
         |     |     Fails? --> Return that field with specific feedback
         |     |     All pass? --> Proceed with original task
```

**Data flow for no-conclusions:**

```
User: "/no-conclusions [task / question]"
         |
         v
[Agent with no-conclusions skill loaded]
         |
         +-- Does prompt start with "/no-conclusions"?
         |     No --> Normal response
         |    Yes
         |     +-- Produce response using only permitted vocabulary
         |     +-- User pushes for conclusions?
         |     |     --> "Here is what I can observe: [restate]. What are you seeing?"
         |     +-- User states a conclusion that contradicts data?
         |           --> "Note that [data] shows [value], which differs from your conclusion."
```

**Architecture:**

```
User invokes slash command
         |
         v
Skill SKILL.md instructions loaded by agent
         |
         v
Agent follows procedural instructions deterministically
         |
         v
Formatted inline response delivered
```

Key design decisions:

1. **Prompt-only implementation**: All three skills are pure instructions — no executable code, no dependencies. This matches the patterns established by `question`, `why`, and `anti-passive`.

2. **User-invoked activation**: All three are slash commands, not automatic background skills. They are invoked only when the user deliberately chooses to apply the discipline. This avoids friction during normal workflows.

3. **Cross-domain examples embedded in SKILL.md**: Each skill includes concrete worked examples (software, medicine, law, finance, writing) so the LLM has a model of expected behavior. This is the most reliable way to ensure format adherence.

4. **Explain-away-others naming**: The skill directory is named `explain-away-others` (hyphen-case). The slash command `/ruled-out` is supported as an alias. Both trigger the same behavior. The name matches the user's requested rename.

5. **Stateless execution**: All three skills produce inline responses with no file I/O, no session state, and no persistent artifacts.

---

## 6. Detailed Design

### 6.1 explain-away-others

**File(s):** `skills/explain-away-others/SKILL.md`
**Type:** New file

#### What it does
A user-invoked slash command that prevents a user from proceeding with their proposed approach until they have explained why 2-3 genuine competitive alternatives fail in their specific context. The model identifies the alternatives — not the user — and the model evaluates the explanations for context-specificity and mechanism-of-failure reasoning.

#### Frontmatter

```yaml
---
name: explain-away-others
description: >
  Use when the user invokes /ruled-out or /explain-away-others. Before proceeding with the user's
  proposed approach, identifies 2-3 genuine competitive alternatives and blocks until the user
  explains — with context-specific, mechanism-level precision — why each alternative fails.
  Generic dismissals are returned. The model picks the alternatives, not the user.
---
```

#### Body Sections

1. **Identity** — Defines the skill as a cognitive forcing function that prevents users from defaulting to their first approach without seriously evaluating alternatives.
2. **Goal** — Break the pattern of perfunctory alternative evaluation by forcing context-grounded, mechanism-level explanations.
3. **Activation Rule** — Triggered by `/ruled-out` or `/explain-away-others` prefix.
4. **Algorithm** — Step-by-step execution:
   - Step 1: Detect invocation
   - Step 2: Identify the user's proposed approach
   - Step 3: Generate 2-3 genuine competitive alternatives
   - Step 4: Block with formatted prompt
   - Step 5: Evaluate user explanations (context-specificity + mechanism of failure)
   - Step 6: Accept or return
   - Step 7: Proceed with original task only after all alternatives explained away
5. **Evaluation Rubric** — Explicit criteria for what passes vs. what gets returned:
   - Context-specificity: references actual constraints, data, requirements
   - Mechanism of failure: explains why the approach fails, not just that it fails
   - Examples of generic vs. specific explanations
6. **Cross-Domain Examples** — Software, medicine, law, finance, writing
7. **Constraints** — Never accept generic dismissals, never let user pick alternatives, always provide 2-3 alternatives, ask for context if insufficient information
8. **Success Criteria** — Verifiable outcomes

#### Edge Cases & Error Handling

- **Insufficient context to generate alternatives**: Ask clarifying questions about constraints before generating alternatives.
- **User's approach is genuinely optimal**: The skill still identifies alternatives and requires explanation — even the best approach benefits from deliberate alternative consideration.
- **User provides explanations for only some alternatives**: Return the unexplained alternatives.
- **Very niche domain**: Draw on domain-general analogies if specific practitioner alternatives are unclear.

### 6.2 define-success

**File(s):** `skills/define-success/SKILL.md`
**Type:** New file

#### What it does
A user-invoked slash command that blocks any task until the user provides four-field success criteria that pass a third-party evaluability test. The bar is that someone not present for the conversation could read the criteria and determine whether the task was completed successfully.

#### Frontmatter

```yaml
---
name: define-success
description: >
  Use when the user invokes /define-success. Blocks any task until the user provides
  third-party evaluable success criteria across four fields: WHAT changes, HOW verified,
  THE THRESHOLD, and THE DEADLINE. Returns vague, circular, or unverifiable criteria
  with specific feedback on what fails.
---
```

#### Body Sections

1. **Identity** — Defines the skill as a completion-gate that prevents unbounded or undefined work.
2. **Goal** — Ensure every task has third-party evaluable success criteria before work begins.
3. **The Third-Party Evaluability Test** — Explicit definition: could someone who has never spoken to you read this and know whether the task succeeded?
4. **The Four Fields** — Detailed explanation of each:
   - WHAT changes: The specific thing that is different when this is done
   - HOW you verify: The exact method to confirm it changed
   - THE THRESHOLD: The minimum acceptable outcome — not perfect, minimum
   - THE DEADLINE: By when, or after how many iterations, evaluation occurs
5. **Three Failure Modes** — Explicitly described with examples:
   - Vague success: "The code is cleaner." Returned. Cleaner by what measure?
   - Circular success: "The bug is fixed." Returned. What behavior currently occurs? Expected behavior?
   - Unverifiable success: "It feels more intuitive." Returned. Feelings are not third-party evaluable.
6. **Algorithm** — Step-by-step execution:
   - Step 1: Detect invocation
   - Step 2: Block and present four-field template
   - Step 3: Receive user response
   - Step 4: Test each field against third-party evaluability
   - Step 5: Return failing fields with specific feedback
   - Step 6: Repeat until all fields pass
   - Step 7: Proceed with original task
7. **No Partial Credit Rule** — If one field fails, all must be resubmitted (or at minimum the failing field). The skill does not accept partial progress.
8. **Cross-Domain Examples** — Product, medicine, law, finance, personal
9. **Constraints** — No partial credit, no accepting vague/circular/unverifiable criteria, no proceeding before all four fields pass
10. **Success Criteria** — Verifiable outcomes

#### Edge Cases & Error Handling

- **User provides only 2 of 4 fields**: Return with request for all four.
- **User pushes back ("just do it")**: Politely restate that the skill requires defined success before proceeding.
- **Task is genuinely exploratory**: Frame success as "the specific question answered" or "the specific hypothesis tested."
- **Deadline is genuinely unknown**: Accept a fallback like "after 3 iterations" or "by end of this session."

### 6.3 no-conclusions

**File(s):** `skills/no-conclusions/SKILL.md`
**Type:** New file

#### What it does
A user-invoked slash command that transforms the model into a pure information and mechanism provider. The model observes, describes, presents data, and explains mechanisms — but never recommends, diagnoses, identifies, decides, or tells the user what the answer is. Every conclusion is drawn by the user.

#### Frontmatter

```yaml
---
name: no-conclusions
description: >
  Use when the user invokes /no-conclusions. The model acts as a pure information provider —
  observing, describing, and explaining mechanisms, but never recommending, diagnosing,
  identifying, deciding, or drawing conclusions. The user synthesizes all data.
  Does not relent when the user pushes for conclusions.
---
```

#### Body Sections

1. **Identity** — Defines the skill as a pure information provider, not a decision-maker or diagnostician.
2. **Goal** — Force the user to hold all information simultaneously and synthesize it themselves, building cognitive judgment.
3. **Permitted Vocabulary** — Explicit list: "This function iterates N times", "The lab value is 3.2x", "In three comparable cases...", "The mechanism by which this drug acts is..."
4. **Prohibited Vocabulary** — Explicit list with replacements:
   - "This is causing your bug" → Describe what each section does, the values at each step
   - "You should use X" → Describe what X does, describe what Y does
   - "The answer is..." → Present the relevant data without synthesizing
   - "This means..." → Present the data that would support the inference, let user infer
5. **The Push-Back Response** — When user says "just tell me what's wrong" or "what should I do": "Here is what I can observe: [restates relevant data]. What are you seeing?"
6. **The One Exception** — If the user's stated conclusion is demonstrably incorrect given the data presented: "Note that [specific data point] shows [specific value], which differs from the assumption in your conclusion." Then stop.
7. **Algorithm** — Step-by-step execution:
   - Step 1: Detect invocation
   - Step 2: For each response, filter through permitted/prohibited vocabulary
   - Step 3: If about to produce a conclusion, replace with underlying observation or mechanism
   - Step 4: When user pushes, redirect with "Here is what I can observe"
   - Step 5: When user states a false conclusion, surface the contradicting data point
8. **Cross-Domain Examples** — Debugging, medicine, law, finance, science
9. **Constraints** — Never conclude, never apologize for not concluding, never relent, the one exception is for factual contradiction only
10. **Success Criteria** — Verifiable outcomes

#### Edge Cases & Error Handling

- **User pushes aggressively**: Do not relent. "Here is what I can observe. What are you seeing?"
- **Truly dangerous situation** (e.g., medical emergency): The skill's constraints remain. The model presents all relevant data and mechanisms — the user must decide.
- **User asks a question with a definitive factual answer**: Present the evidence for the answer without stating "the answer is X." E.g., "The documentation at [source] states that..." rather than "The answer is X."
- **User asks for a recommendation in no-conclusions mode**: Describe the tradeoffs of each option without stating which is better.

### 6.4 vidbyte-tutor (Orchestrator Update)

**File(s):** `skills/vidbyte-tutor/SKILL.md`
**Type:** New file

#### What it does
The central orchestration skill for the Vidbyte catalog. Routes users to the appropriate Vidbyte skill based on their intent. This file follows the complete design described in `docs/design/vidbyte-tutor.md`, with additions for the three new skills.

#### Frontmatter

```yaml
---
name: vidbyte-tutor
description: >
  Use this skill as the central Vidbyte skill orchestrator when the user wants help choosing,
  routing, combining, or understanding Vidbyte skills, or when they ask for a tutor that knows
  which repository skill to use for learning, reasoning, feedback, reflection, and analysis tasks.
---
```

#### Catalog Additions for New Skills

In the Non-Trace Skills catalog table, add:

| Skill | Use Case |
|-------|----------|
| `explain-away-others` | Force deliberate alternative evaluation before proceeding with a chosen approach. The model identifies competitive alternatives and requires context-specific, mechanism-level explanations for why each fails. Invoke as `/ruled-out`. |
| `define-success` | Define third-party evaluable success criteria before beginning any task. Blocks until all four fields (WHAT, HOW, THRESHOLD, DEADLINE) pass the evaluability test. |
| `no-conclusions` | Switch the model into pure information-provider mode — observations and mechanisms only, no recommendations, diagnoses, or decisions. Forces the user to synthesize. |

In the Tie-Break Rules section, add routing entries:

```text
- For "challenge my approach" or "what am I missing" prefer `explain-away-others`.
- For "define the goal" or "what does done look like" prefer `define-success`.
- For "just give me the data, no recommendations" prefer `no-conclusions`.
```

#### Body Structure

The vidbyte-tutor SKILL.md follows the structure defined in `docs/design/vidbyte-tutor.md`:

1. `# /vidbyte-tutor — Vidbyte Skill Orchestrator`
2. `## Identity`
3. `## Core Rule`
4. `## Selection Algorithm`
5. `## Scale Selection`
6. `## Non-Trace Skills` (updated with 3 new entries)
7. `## Reasoning Trace Families`
8. `## Tie-Break Rules` (updated with 3 new routing entries)
9. `## Response Behavior`
10. `## Success Criteria`
11. `## Input`

---

## 7. Data Model Changes

N/A — All four skills are prompt-only. No database schema, persistent state, or structured runtime data model is added.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. No CLI commands are added. No network traffic is involved.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/explain-away-others-define-success-no-conclusions.md` | Design document for the three new skills and orchestrator update |
| CREATE | `skills/explain-away-others/SKILL.md` | New skill: forces alternative evaluation before proceeding |
| CREATE | `skills/define-success/SKILL.md` | New skill: enforces third-party evaluable success criteria |
| CREATE | `skills/no-conclusions/SKILL.md` | New skill: pure information provider, no conclusions |
| CREATE | `skills/vidbyte-tutor/SKILL.md` | Central orchestrator skill with full catalog including new entries |

**Total: 5 files created, 0 modified, 0 deleted.**

---

## 10. Testing Plan

### Unit Tests

N/A — All implementations are Markdown skill prompts, not executable code.

### Validation Tests

Run:

```bash
npm run validate
```

Expected results:
- `skills/explain-away-others/SKILL.md` passes validation (name matches directory, non-empty description, non-empty body)
- `skills/define-success/SKILL.md` passes validation
- `skills/no-conclusions/SKILL.md` passes validation
- `skills/vidbyte-tutor/SKILL.md` passes validation

### Full Smoke Tests

```bash
npm test
```

Expected: existing validation and installer smoke tests pass. The installer discovers new skills automatically.

### Manual / QA Test Cases

#### explain-away-others

1. **Basic invocation**: Given `/ruled-out we should use a REST API for this`, the model identifies 2-3 alternatives (e.g., GraphQL, gRPC, WebSockets) and blocks with explanation prompt.
2. **Generic dismissal rejected**: Given the user responds with "GraphQL is too complex", the model returns it with "Why is GraphQL too complex given this specific client, payload size, and query pattern?"
3. **Context-specific explanation accepted**: Given the user responds with "GraphQL would require clients to implement a query parser, but our mobile clients have a 50KB payload budget and our API has exactly 4 endpoints — the flexibility GraphQL provides is excess cost without benefit", the model accepts.
4. **All alternatives explained**: After all alternatives are explained, the model proceeds with the original task.
5. **Insufficient context**: Given `/ruled-out` with a vague request, the model asks clarifying questions before generating alternatives.

#### define-success

1. **Basic invocation**: Given `/define-success refactor the auth module`, the model blocks and presents the four-field template.
2. **Vague criteria returned**: Given the user responds with WHAT: "the code is cleaner", the model returns it with "Cleaner by what measure? Fewer lines? Lower cyclomatic complexity? Faster execution?"
3. **Circular criteria returned**: Given the user responds with WHAT: "the bug is fixed", the model returns it with "What behavior currently occurs? What behavior should occur?"
4. **All fields pass**: Given specific, verifiable criteria across all four fields, the model proceeds.
5. **Missing fields**: Given only 2 of 4 fields, the model requests the missing fields.

#### no-conclusions

1. **Basic invocation**: Given `/no-conclusions what's wrong with this code`, the model describes what each section does, values passed, output at each step — never states "the bug is on line X".
2. **Push-back response**: Given the user responds with "Just tell me what's wrong", the model responds with "Here is what I can observe: [restates]. What are you seeing?"
3. **False conclusion surfaced**: Given the user states a conclusion that contradicts presented data, the model surfaces the specific data point.
4. **No apology**: The model never apologizes for not concluding.
5. **Normal responses unaffected**: Prompts without `/no-conclusions` prefix produce normal responses.

#### vidbyte-tutor

1. **Routing to explain-away-others**: Given "challenge my approach", the orchestrator recommends `explain-away-others`.
2. **Routing to define-success**: Given "define what done looks like", the orchestrator recommends `define-success`.
3. **Routing to no-conclusions**: Given "just give me data without recommendations", the orchestrator recommends `no-conclusions`.
4. **Full catalog listing**: Given "list all Vidbyte skills", the orchestrator presents the grouped catalog including the three new skills.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Existing skill validation scripts | Repository-local | Validate new skill frontmatter/body conventions | Low |
| Existing installer | Repository-local | Discover and install new skills | Low |

No new npm dependencies, Python dependencies, backend services, or external APIs are introduced.

---

## 12. Rollout & Deployment

- **Feature flags**: None.
- **Deployment order**: Merge all five files in a single PR.
- **Backwards compatibility**: Fully additive. No existing skills are modified. No installer behavior changes.
- **Rollback**: Delete the four new skill directories and their design doc. No data migration required.
- **Breaking change**: No.

---

## 13. Open Questions

- [ ] Should the `explain-away-others` slash command be `/ruled-out` (as originally named) or `/explain-away-others` (matching the directory name)? Both can be supported as trigger prefixes.
- [ ] Should `no-conclusions` have an exception for safety-critical situations (e.g., the user is about to run `rm -rf /`)? The current design maintains the constraint unrelentingly, but the model could surface the data more prominently.
- [ ] Should `define-success` persist the success criteria to a local file so the model can reference them later in the session? Current design is stateless inline-only.
- [ ] Should `vidbyte-tutor` list all 496+ concrete skill names or use family-based grouping? The existing design doc favors family-based grouping.
- [ ] Should the three new skills support a `short` variant with more concise output? Not in v1; the user can constrain with natural language.
- [ ] Should `explain-away-others` limit the number of back-and-forth rounds before accepting a final explanation to prevent infinite loops? Recommend a 2-round maximum per alternative.

---

## 14. Alternatives Considered

### Alternative 1: Merge all three skills into one "critical-thinking" meta-skill

- What: Combine explain-away-others, define-success, and no-conclusions into a single skill with sub-commands.
- Why rejected: Each skill addresses a distinct cognitive discipline. Combining them would make the skill harder to invoke precisely and dilute the behavioral instructions. The repo convention is one skill per sharp failure mode.

### Alternative 2: Make them always-on background skills

- What: Make explain-away-others, define-success, and no-conclusions run automatically like `why` or `anti-passive`.
- Why rejected: These disciplines are high-friction by design. Applying them to every user prompt would make the harness unusable. They must be opt-in.

### Alternative 3: Implement as CLI-backed skills with backend submissions

- What: Add CLI commands and backend endpoints for tracking alternative evaluations, success criteria, and conclusion-free sessions.
- Why rejected: Over-engineered. These are response-format contracts — no backend persistence is needed. The value is in the cognitive discipline applied during the session, not in stored artifacts.

### Alternative 4: Implement explain-away-others via session-level state tracking

- What: Have the model track which alternatives were considered and whether the user has sufficient context.
- Why rejected: Adds complexity. The skill is a single exchange — user proposes, model presents alternatives, user explains. Stateless is sufficient.

### Alternative 5: Skip vidbyte-tutor creation, only add the three skills standalone

- What: Create only the three new skills without the orchestrator.
- Why rejected: The user explicitly requested adding these skills to the "main /teach skill." The vidbyte-tutor design doc already exists and describes the orchestrator. Creating it alongside the new skills ensures discoverability.

---

END OF DESIGN DOC
