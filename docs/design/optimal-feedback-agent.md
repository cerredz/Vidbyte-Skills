# Design Doc: Optimal Feedback Agent — Multi-Agent Orchestration Layer

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-19
**Last Updated:** 2026-05-19

---

## 1. Overview

Transform the current `feedback-generator` skill from a passive, single-agent silent observer into an **active multi-agent orchestration harness** that autonomously generates expert-level domain knowledge, structures it into actionable reasoning processes, and delivers feedback grounded in 180+ papers of learning-science research. The redesigned skill injects expert/domain knowledge context into the agent's context window before feedback generation, mimicking the cognitive process of interviewing domain experts without actually doing so — achieved through prompt-only knowledge generation using the ExpertPrompting, Self-Refine, and Iteration of Thought (IoT) research frameworks.

---

## 2. Goals & Non-Goals

### Goals

- Provide a main orchestrator agent that decides which sub-agents to invoke and in what sequence
- Implement an **Expert Researcher** sub-agent that autonomously generates field-specific expert knowledge through iterative self-refinement loops (5 iterations)
- Implement a **Divergent-to-Convergent Thinker** sub-agent that transforms open-ended feedback domains into structured, convergent reasoning processes and internal questions
- Implement a **Feedback Agent** sub-agent that delivers feedback against the 180-paper research library, with expert context injected
- Expose all three sub-agents as invocable "tools" from the main agent's system prompt
- Define the context layout: system prompt (optimal feedback research) → expert information (internal monologue + questions) → user metrics → feedback output
- Support both active (user-requested) and passive (session-end) feedback generation modes
- Maintain backward compatibility with the existing CLI submission pipeline (`vidbyte feedback submit`)

### Non-Goals

- Implementing actual tool-calling APIs or function registries — skills operate as prompt text only
- Changing the CLI submission mechanism (`cli/feedback.py`, `cli/dataclasses/feedback.py`)
- Modifying any existing reasoning trace skills
- Building actual backend service for real-time monitoring
- Implementing the frontend `/feedback` route (already designed in `docs/design/feedback-route.md`)

---

## 3. Background & Context

The current `feedback-generator` skill (`skills/feedback-generator/SKILL.md`) is a passive observer: it silently watches a user session, logs feedback points to a file, and submits via CLI. It has no domain expertise beyond what the base model provides, and it delivers feedback at session-end only.

The user has identified three critical problems with this approach:

1. **No expert knowledge injection**: The model produces generic feedback because it lacks domain-specific expert context. Research (ExpertPrompting, arxiv.org/abs/2305.14688) shows that prompting an LLM to first generate a rich expert identity — then answering conditioned on that identity — improves answer quality from 23% to 48.5% preference over vanilla answers.

2. **Divergent feedback spaces overwhelm models**: In "artful" fields (design, writing, architecture), the range of possible feedback is infinite. Models collapse to generic observations because they cannot internally structure what an expert would actually attend to.

3. **No learning-science grounding**: The current skill has no explicit feedback design principles. 180+ research papers on optimal feedback across education, medicine, language acquisition, motor learning, and organizational behavior exist but are not leveraged.

The redesigned skill addresses all three by introducing a multi-agent orchestration pattern — a first for the Vidbyte skill collection.

---

## 4. Requirements

### Functional Requirements

1. The main orchestrator agent SHALL follow a decision tree: first determine whether to invoke the Expert Researcher, then optionally the Divergent-to-Convergent Thinker, then the Feedback Agent.
2. The Expert Researcher sub-agent SHALL generate a detailed expert identity for the requested domain using ExpertPrompting techniques.
3. The Expert Researcher SHALL iteratively refine its expert knowledge over 5 Self-Refine loops, each deepening the prior output.
4. Each Self-Refine loop SHALL be driven by an Inner Dialogue Agent (IoT framework) that generates thought-provoking contextual prompts.
5. The Divergent-to-Convergent Thinker SHALL take the expert knowledge and produce: (a) an internal reasoning process description, (b) a set of diagnostic questions an expert would ask, (c) a structured framework for judging work in the domain.
6. The Feedback Agent SHALL consume: (a) the optimal feedback research library (Practical Synthesis + key paper insights), (b) the expert knowledge context, (c) the divergent-to-convergent framework, (d) user metrics/input.
7. The Feedback Agent SHALL produce feedback conforming to all 8 practical synthesis principles from the research library.
8. In "active mode" (user explicitly requests feedback), the orchestrator SHALL deliver feedback directly to the user.
9. In "passive mode" (end-of-session), the orchestrator SHALL write feedback to a file and submit via the existing CLI pipeline.
10. The skill SHALL remain a single `SKILL.md` file compatible with all existing Vidbyte harnesses.

### Non-Functional Requirements

- **Cognitive load**: Each sub-agent invocation should stay within reasonable context window limits (no single agent output exceeds ~4000 tokens).
- **Latency**: Active mode feedback delivery within a single response turn (no multi-turn required).
- **Determinism**: The orchestrator's decision tree should produce consistent behavior regardless of harness.
- **Compatibility**: Backward compatible with existing `vidbyte feedback submit` CLI workflow.

---

## 5. High-Level Design

The skill is restructured as a **multi-agent orchestration harness in a single prompt file**. Since Vidbyte skills are pure prompt text (no code execution), "sub-agents" are implemented as invocable text blocks — delimited sections of the prompt that the main agent can simulate by writing a specific invocation marker and then processing the result.

The orchestrator follows a 3-phase (optional 2-phase) decision tree:

```
User Request → [Domain Detection]
                    ↓
    ┌──────────────────────────────┐
    │ PHASE 1: Expert Researcher   │  ← Always runs
    │  • ExpertPrompting (identity)│
    │  • Self-Refine × 5 loops     │
    │  • IoT inner dialogue        │
    └──────────────┬───────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ PHASE 2: Divergent→Convergent│  ← Runs for "artful" domains
    │  • Internal reasoning process│     or when feedback space is open-ended
    │  • Expert diagnostic questions│
    │  • Structured judging framework│
    └──────────────┬───────────────┘
                   ↓
    ┌──────────────────────────────┐
    │ PHASE 3: Feedback Agent      │  ← Always runs
    │  • Context injection         │
    │  • Research-grounded delivery│
    │  • Actionable output         │
    └──────────────────────────────┘
                   ↓
         [Output or File Write]
```

### Key Design Decisions

1. **Single file, not multiple skills**: Maintaining a single `SKILL.md` keeps installation trivial and avoids coupling between separately versioned artifacts. Sub-agents are text sections within the file.

2. **Invocation markers instead of actual tool calls**: Since Vidbyte harnesses don't support custom tool definitions, the orchestrator uses text markers (e.g., `--- BEGIN EXPERT RESEARCHER ---`) to simulate sub-agent invocation. The orchestrator reads the sub-agent's instructions, generates the response "as" that agent, and feeds the output to the next phase.

3. **Active vs passive mode**: The skill detects whether the user is actively requesting feedback (`/feedback <query>`) or whether it's being invoked at session-end (existing passive mode). Active mode delivers feedback inline. Passive mode writes to a file and submits via CLI — preserving the existing pipeline.

4. **PRISM routing embedded**: Following the PRISM paper (arxiv.org/abs/2603.18507), the orchestrator decides whether expert persona injection helps or hurts based on task type. For pure knowledge-retrieval tasks, the Expert Researcher phase is truncated. For reasoning/judgment tasks, it runs fully.

5. **Research library embedded**: The 8-point Practical Synthesis and core paper insights are embedded in the Feedback Agent's section. This grounds every piece of feedback in learning science without requiring external API calls.

---

## 6. Detailed Design

### 6.1 Main Orchestrator Agent

**File(s):** `skills/feedback-generator/SKILL.md` (top-level sections)
**Type:** Heavily modified (replaces entire current content)

#### What it does
The orchestrator is the entry point. It detects the mode (active vs passive), identifies the domain, decides which sub-agents to invoke, sequences their execution, and delivers the final output.

#### Interface / API
The skill is invoked either:
1. **Active mode**: User writes `/feedback <optional domain or query>` and the model responds directly.
2. **Passive mode**: The skill is loaded as a background skill that activates at session-end.

Detection logic: If the user's message starts with `/feedback`, enter active mode. Otherwise, if the skill is loaded as a background skill, enter passive mode (existing behavior).

#### Logic / Algorithm

1. **Mode detection**: Check if user message starts with `/feedback`. If yes → Active Mode. If no, and loaded as background → Passive Mode.

2. **Domain detection**: Extract domain from user's query or, in passive mode, infer from session activity. If domain is ambiguous, default to "general" and note reduced specificity.

3. **PRISM routing** (embedded in orchestrator): Classify the task type:
   - **Knowledge-retrieval tasks** (specific API behavior, exact syntax, algorithmic complexity) → Skip or truncate Expert Researcher. The knowledge is more reliably accessed without the expert wrapper.
   - **Reasoning/judgment tasks** (code reviews, architectural feedback, best practices, design evaluation) → Full Expert Researcher + optional Divergent-to-Convergent Thinker.

4. **Sub-agent invocation sequence**:
   - Phase 1: Invoke Expert Researcher (generate expert identity + run 5 Self-Refine loops)
   - Phase 2 (conditional): If domain is "artful" (design, writing, architecture, creative), invoke Divergent-to-Convergent Thinker
   - Phase 3: Invoke Feedback Agent with all accumulated context

5. **Output routing**:
   - Active mode: Deliver feedback inline to user
   - Passive mode: Write to feedback log file, submit via CLI

#### Edge Cases & Error Handling
- **Domain unknown**: Still run Expert Researcher but generate a generalized "cross-domain expert" identity. Note reduced precision in output.
- **User interrupts**: In active mode, if user provides contradictory input mid-feedback, restart from Phase 1 with updated context.
- **No feedback-worthy content**: Output explicit "no substantive feedback" message (same as current skill's behavior).
- **CLI unavailable**: Write file but skip submission (same as current behavior).

---

### 6.2 Expert Researcher Sub-Agent

**File(s):** `skills/feedback-generator/SKILL.md` (section: "Expert Researcher Agent")
**Type:** New section

#### What it does
Generates rich, domain-specific expert knowledge through iterative self-refinement — no interviews, no RAG, no fine-tuning. Based on ExpertPrompting (arxiv.org/abs/2305.14688), Self-Refine (arxiv.org/abs/2303.17651), and Iteration of Thought (arxiv.org/abs/2409.12618).

#### Interface / API

```
Invocation marker: --- BEGIN EXPERT RESEARCHER ---
Inputs: Domain (string), Task context (string)
Outputs: Expert identity description, Domain knowledge map, Key mental frameworks
```

#### Logic / Algorithm

**Iteration 0 — ExpertPrompting identity generation:**
1. Given the domain and task, ask: "What kind of expert would think most deeply about this problem? Describe them in elaborate detail."
2. Generate: Their background (years of experience, education, specialization), what they care about, what frameworks they use, what they notice that novices miss, what they worry about, what heuristics guide their judgment.
3. This becomes the "expert persona" carried forward into all subsequent iterations.

**Iterations 1–5 — Self-Refine deepening loop:**
For each iteration (1 through 5):
1. **IoT Inner Dialogue Agent**: Generate a thought-provoking question that forces deeper engagement. Examples:
   - "What expert knowledge did you underweight in the previous iteration?"
   - "What nuances would a practitioner with 20 years in this field add?"
   - "What assumptions did you make that a true expert would challenge?"
   - "What edge cases would a master of this domain immediately flag?"
   - "What trade-offs are invisible to non-experts but central to expert judgment?"
2. **Refine**: Answer the IoT question by expanding, critiquing, or correcting the prior knowledge output.
3. **Accumulate**: Append the new insights to the growing expert knowledge map. Do not replace — build upon.

**Stopping criteria:** After 5 iterations, or if an iteration produces no meaningful new insight (self-termination per AIoT).

**Output structure:**
```
EXPERT IDENTITY:
[Detailed persona description]

EXPERT KNOWLEDGE MAP:
[Accumulated domain expertise across all iterations, organized by:
- Core Principles
- Common Pitfalls & Misconceptions
- Quality Criteria & Standards
- Trade-offs & Tensions
- Edge Cases & Boundary Conditions
- Patterns & Anti-Patterns
- Diagnostic Signals]
```

#### Edge Cases & Error Handling
- **Iteration produces no new insight**: Flag that domain knowledge is saturated; proceed with accumulated knowledge.
- **Domain too broad**: Narrow scope by selecting the most relevant sub-domain; note that feedback will be partial.
- **Contradictory insights across iterations**: Surface the contradiction explicitly rather than resolving it — experts often hold productive tensions.

---

### 6.3 Divergent-to-Convergent Thinker Sub-Agent

**File(s):** `skills/feedback-generator/SKILL.md` (section: "Divergent-to-Convergent Thinker")
**Type:** New section

#### What it does
For domains where feedback possibilities are infinite (design, writing, architecture), this agent takes the expert knowledge map and produces a structured reasoning framework that turns divergent evaluation into convergent, answerable questions. It models what an expert would actually think when judging work in the domain.

#### Interface / API

```
Invocation marker: --- BEGIN DIVERGENT-TO-CONVERGENT ---
Inputs: Expert Knowledge Map (from Phase 1), Domain (string)
Outputs: Internal reasoning process, Diagnostic questions, Judging framework
```

#### Logic / Algorithm

1. **Internal Reasoning Process**: Describe the step-by-step mental process an expert would follow when evaluating work in this domain. What do they look at first? What do they compare it against? What do they check for implicitly? Write this as if you are an expert narrating your own internal monologue.

2. **Diagnostic Questions**: Generate a structured set of questions an expert would ask themselves while reviewing work. Group by:
   - Structural questions (about organization, architecture, foundations)
   - Quality questions (about craftsmanship, fit-and-finish, standards)
   - Consequence questions (about downstream effects, maintainability, scalability)
   - Novelty questions (about creativity, appropriateness of innovation)
   - Gap questions (about what's missing, overlooked, unaddressed)

3. **Structured Judging Framework**: Produce a rubric-like structure organized by dimension, each with:
   - Dimension name
   - What "excellent" looks like
   - What "acceptable" looks like
   - What "needs attention" looks like
   - Typical expert advice for each dimension

#### Edge Cases & Error Handling
- **Domain already convergent**: If feedback space is naturally bounded (e.g., syntax checking), skip this phase. Note that the domain is inherently convergent and proceed with Phase 1 output only.
- **Framework too rigid for creative domain**: Flag that the framework is a guide, not a constraint — expert judgment must override formula when appropriate.

---

### 6.4 Feedback Agent Sub-Agent

**File(s):** `skills/feedback-generator/SKILL.md` (section: "Feedback Agent")
**Type:** New section

#### What it does
Produces the actual feedback, grounded in all three research pillars: (1) the feedback research library, (2) the expert knowledge context, (3) the divergent-to-convergent framework. Ensures every piece of feedback conforms to the 8 Practical Synthesis principles.

#### Interface / API

```
Invocation marker: --- BEGIN FEEDBACK AGENT ---
Inputs: 
  - Expert Identity + Knowledge Map (from Phase 1)
  - Internal Reasoning Process + Diagnostic Questions + Judging Framework (from Phase 2, optional)
  - User's work/action to provide feedback on
  - Domain
Outputs: Structured feedback with:
  - Overall assessment
  - Individual feedback points (Goal → Observed → Gap → Next Action)
  - Pattern analysis
  - Priority ranking
```

#### Logic / Algorithm

1. **Context assembly**: Load the full context stack:
   - Layer 1: Feedback Research Library (Practical Synthesis + key findings)
   - Layer 2: Expert Identity + Knowledge Map
   - Layer 3: Internal Reasoning Process + Questions + Framework (if available)
   - Layer 4: User's specific work/actions

2. **Feedback generation**: For each identified feedback point:
   a. State the **Goal/Standard** (what quality looks like — from expert knowledge)
   b. State the **Observation** (what was actually observed — specific, behavioral)
   c. State the **Gap** (why the difference matters — consequence, not just error)
   d. State the **Next Action** (what to keep, what to change, why, what to try next)

3. **Pattern detection**: If the same issue appears across multiple contexts, flag as a pattern and surface the likely underlying gap in understanding (not just surface error).

4. **Priority ordering**: Rank feedback points by:
   - Consequence severity (what breaks if unchanged)
   - Pattern status (recurring > isolated)
   - Actionability (clear next step > vague observation)

5. **Self-verification against Practical Synthesis**:
   - [ ] Is feedback against a clear goal/standard, not identity?
   - [ ] Does it prioritize task/process/self-regulation info over praise/grades/evaluation?
   - [ ] Is the next action obvious?
   - [ ] Is timing appropriate (immediate for correction, delayed for reflection)?
   - [ ] Is it small enough to use (no cognitive overload)?
   - [ ] Does it allow for uptake (time, examples, revision opportunity)?
   - [ ] Is praise pointing at controllable process, not fixed ability?
   - [ ] Would this feedback change the learner's next attempt?

#### Feedback Research Library (Embedded)

The Feedback Agent carries the following embedded knowledge. This is NOT retrieved externally — it is part of the agent's system context.

**Practical Synthesis (8 principles):**
1. Give feedback against a clear goal or standard, not against the learner's identity.
2. Prioritize task, process, and self-regulation information before praise, grades, or general evaluation.
3. Make the next action obvious: what to keep, what to change, why it matters, and what to try next.
4. Use immediate feedback for early correction and confusion, but consider delayed feedback when spacing, retrieval, or reflection will improve retention.
5. Keep feedback small enough to use; too much information can become cognitive overload.
6. Design for uptake: learners need time, motivation, examples, revision opportunities, and sometimes training in how to interpret feedback.
7. Treat peer and automated feedback as design problems: structure the rubric, examples, timing, and revision loop so the feedback is usable.
8. Be careful with praise: praise effort, strategy, and improvement only when it points attention back to controllable process.

**Key Research Anchors:**
- Hattie & Timperley (2007): Feedback is most powerful when it gives task, process, or self-regulation information instead of vague praise or self-level judgment. Answers: "Where am I going? How am I going? Where to next?"
- Kluger & DeNisi (1996): Feedback is not automatically helpful — it can aim attention at task, process, or self. It helps when attention stays on task learning, hurts when it provokes self-focused evaluation.
- Nicol & Macfarlane-Dick (2006): Seven principles of good feedback practice that support self-regulation. Feedback is incomplete until learner understands and uses it.
- Shute (2008): Elaborated feedback beats simple right/wrong, but too much feedback overloads the learner.
- Carless & Boud (2018): Student feedback literacy — learners need capacity to make sense of and use feedback.
- Dweck (1998): Praise for intelligence backfires; praise effort and strategy.
- Ericsson (1993): Deliberate practice requires immediate informative feedback enabling error correction.
- Bangert-Drowns et al. (1991): Feedback works hardest when it promotes mindful correction of errors rather than mindless copying of answers.

#### Edge Cases & Error Handling
- **No feedback-worthy content**: State explicitly "No substantive issues identified" — do not fabricate feedback.
- **Too many feedback points**: Cap at 7 most important. Flag remaining as "additional notes" available on request.
- **Conflicting expert perspectives**: Surface the tension; do not pick a side unless one perspective has clearly stronger evidence.

---

## 7. Data Model Changes

### 7.1 Feedback Output Structure (Updated)

**Change type:** Modified (extends existing)

The feedback output now includes expert context metadata:

```markdown
# Feedback Log

**Date:** [YYYY-MM-DD]
**Conversation ID:** [conversation-id]
**Primary Domain:** [domain]
**Expert Identity:** [generated expert persona, condensed]
**Feedback Dimensions Used:** [list from judging framework if available]

## Expert Context Summary
[1-paragraph summary of the expert knowledge generated for this session]

## Priority Patterns
[Consolidated recurring issues — the delivery agent should read this first]

## Feedback Points
### [N] - [Title]
**Goal/Standard:** [What quality looks like]
**Observed:** [Specific, behavioral observation]
**Gap:** [Why the difference matters — mechanism, not just naming the problem]
**Next Action:** [What to keep, what to change, why, what to try next]
**Priority:** [High / Medium / Low]
**Recurrence:** [First occurrence | Recurring - seen N times]
```

---

### 7.2 Client-Side FeedbackPayload (CLI)

**Change type:** No change

The existing `FeedbackPayload` dataclass in `cli/dataclasses/feedback.py` remains unchanged. The content field will carry the richer structured output. No schema migration needed.

---

## 8. API Changes

N/A — The backend API and CLI interface remain unchanged. The `vidbyte feedback submit` command still accepts `--file`, `--domain`, `--conversation-id`. The skill outputs richer content, but it fits within the existing `content` field of the payload.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| MODIFY | `skills/feedback-generator/SKILL.md` | Complete rewrite: passive observer → multi-agent orchestration harness |
| CREATE | `docs/design/optimal-feedback-agent.md` | This design doc |

**Summary: 1 file modified, 1 file created.**

---

## 10. Testing Plan

### Unit Tests (Manual validation criteria)

Since skills are prompt text, "tests" are manual verification against the Success Criteria:

| Test Scenario | Expected Outcome |
|---------------|-----------------|
| Active mode `/feedback review my React component` | Orchestrator detects active mode, runs Expert Researcher on React/frontend domain, runs Divergent-to-Convergent, runs Feedback Agent, delivers inline feedback with 8-principle compliance |
| Active mode `/feedback` with no domain | Orchestrator asks user to specify domain or context |
| Passive mode (session-end invocation) | Orchestrator detects passive mode, runs full pipeline, writes file, submits via CLI |
| Task classification: syntax question | PRISM routing skips Expert Researcher, goes direct to Feedback Agent with knowledge-retrieval framing |
| Task classification: architecture review | PRISM routing runs full pipeline: Expert Researcher + Divergent-to-Convergent + Feedback Agent |
| Expert Researcher iteration saturation | After 5 loops or self-termination, proceeds with accumulated knowledge |
| Divergent domain (art/design) | Divergent-to-Convergent Thinker runs; produces internal reasoning process + diagnostic questions + framework |
| Convergent domain (syntax checking) | Divergent-to-Convergent Thinker skipped; proceeds with Expert Researcher output only |
| No feedback-worthy content | Output states "No substantive issues" (same as current behavior) |
| CLI unavailable | Writes file, skips submission, notes in file (same as current behavior) |
| Feedback output self-check | Every feedback point passes the 8-point Practical Synthesis checklist |

### Smoke Tests

- Verify the file writes to correct directory with correct naming convention (backward compatible)
- Verify CLI submission succeeds with new content format
- Verify that in active mode, feedback is delivered without writing a file

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Vidbyte Python CLI | Existing | File submission to backend | Low — unchanged interface |
| Existing harness (Claude Code, Codex, etc.) | Existing | SKILL.md loading and execution | Low — pure prompt text, no new capabilities needed |

---

## 12. Rollout & Deployment

- **Feature flag**: None needed — the skill file is the deployment unit. Users install the updated version.
- **Breaking change**: No. The skill still writes to the same file format (enriched), still submits via the same CLI. Existing feedback log files are forward-compatible.
- **Deployment order**: Update `skills/feedback-generator/SKILL.md` → bump package version → users re-run installer.
- **Rollback**: Revert SKILL.md to previous version. No data migration needed.

---

## 13. Open Questions

- [ ] Should the Expert Researcher's 5-iteration loop be configurable (e.g., 3 iterations for simple domains)?
- [ ] Should the Divergent-to-Convergent Thinker produce scale variants (small/medium/large) like trace skills?
- [ ] Should "passive mode" also deliver inline summary at session end, or remain file-only?
- [ ] How should active mode handle conversation context — should it analyze the entire session or just the most recent exchange?
- [ ] Should we split the research library into a separate file under `skills/feedback-generator/references/` to keep SKILL.md size manageable?

---

## 14. Alternatives Considered

### Alternative 1: Split into 4 separate skills
- **What:** Create `feedback-orchestrator`, `feedback-expert-researcher`, `feedback-divergent-convergent`, `feedback-agent` as separate installable skills.
- **Why rejected:** Increases installation complexity, creates coupling across separately versioned artifacts, and most harnesses don't support skill-to-skill communication. A single file is self-contained and simpler.

### Alternative 2: External API calls for expert knowledge (RAG)
- **What:** Use external API calls to retrieve domain expertise from knowledge bases.
- **Why rejected:** Violates the user's explicit requirement: "without interviewing real experts, just prompting it." Also adds network dependencies and auth complexity. Pure prompting is zero-dependency and more portable.

### Alternative 3: Real tool calls via MCP server
- **What:** Implement the sub-agents as actual tool-callable functions via MCP.
- **Why rejected:** Not all harnesses support MCP. The skill must work across Claude Code, Codex, Gemini CLI, etc. Pure prompt text is universally compatible.

### Alternative 4: Keep current silent-observer pattern and add a separate `/feedback-expert` skill
- **What:** Don't touch the existing skill; create a new one with the multi-agent design.
- **Why rejected:** Fragments the user experience. Users should get expert feedback from `/feedback`, not have to know which variant to invoke.
