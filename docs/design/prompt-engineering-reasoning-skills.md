# Design Doc: Prompt Engineering Reasoning Skills

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-18
**Last Updated:** 2026-05-18

---

## 1. Overview

This feature adds 14 new reasoning skills to the Vidbyte collection, derived from seven cutting-edge prompt engineering research strategies. Each research strategy produces two skills: a standalone reasoning trace skill that embodies the strategy as a first-class reasoning method, and a "pairing" meta-skill that knows how to apply that strategy in combination with any of the 100+ existing reasoning trace skills in the catalog. This bridges the gap between state-of-the-art LLM inference-time research and the Vidbyte skill ecosystem.

---

## 2. Goals & Non-Goals

### Goals
- Create 7 standalone reasoning trace skills, each implementing one prompt engineering research strategy as a reasoning method that produces a durable `memory/{question_name}.md` artifact
- Create 7 pairing meta-skills, each able to select the best-fit existing reasoning strategy from the full Vidbyte catalog and then apply the research strategy as a meta-layer over it
- Follow all Vidbyte skill conventions: YAML frontmatter, SKILL.md format, knowledge embedded in the skill (no external API calls), Type 1 reasoning trace output structure
- Register all 14 new skills in `skills-manifest.json` under the `reasoning` category
- Pass validation: `npm test` must succeed

### Non-Goals
- Scale variants (-small, -medium, -large) for the new skills — only default/base variants
- CLI-backed backend integration — these are pure Type 1 reasoning trace skills, no backend submission
- Modifications to existing skill files or the installer
- Integration with the `autoreasoner` catalog (that is a separate task if desired)
- Adding these strategies as new entries in `autoreasoner`'s Strategy Reference (separate follow-up)

---

## 3. Background & Context

### Why this is being built now
The Vidbyte repository already has 100+ reasoning trace strategies covering formal logic, decision analysis, systems thinking, creative problem solving, and more. However, recent LLM research (2024–2025) has identified novel inference-time strategies that operate at a meta-level — they govern *how* a model should approach reasoning, not *what* specific reasoning move to make. These strategies represent the next frontier in prompt engineering and have demonstrated measurable accuracy improvements on benchmarks.

### What problem does it solve
Current Vidbyte skills are single-strategy: one strategy, one trace. The new pairing meta-skills introduce **composability** — the ability to layer a meta-strategy (e.g., self-consistency voting) on top of any existing reasoning strategy. This dramatically increases the value of the existing catalog by enabling new modes of use without modifying existing skills.

### Current state
- The `autoreasoner` skill already demonstrates the pattern of selecting from the full catalog and executing a single strategy
- The pairing meta-skills extend this pattern by adding a meta-strategy execution layer after selection
- No existing skills implement any of these seven research strategies

### Constraints
- All skills must be self-contained in SKILL.md (no external API dependencies)
- Pairing skills must embed the full strategy catalog inline (same pattern as `autoreasoner`)
- Skills are Type 1 (reasoning trace) only — no CLI, no backend, no side effects beyond writing to `memory/`

---

## 4. Requirements

### Functional Requirements

#### Standalone Skills (1–7)
1. `self-consistency-trace`: Accepts a problem, samples N (default 5) independent reasoning paths through the problem, evaluates the conclusion from each path, and selects the most consistent answer via majority/plurality consensus. Records all paths and the voting outcome in the trace artifact.
2. `parallel-thinking-trace`: Accepts a problem, decomposes it into independent sub-problems, runs separate parallel reasoning threads for each, and synthesizes results. Avoids the diminishing returns of long sequential chains by going wide before going deep.
3. `multi-agent-debate-trace`: Simulates multiple agent perspectives (default 3) that independently reason about the problem, then engage in structured rounds of critique and revision toward consensus. Records each agent's initial position, debate rounds, and final convergence (or persistent disagreement).
4. `mixture-of-agents-trace`: Passes the problem through successive layers of refinement, where each layer takes the previous layer's output as additional context and improves it. Records each layer's inputs, refinements, and the progressive quality improvement.
5. `self-rag-trace`: Iteratively reasons about the problem, deciding at each step whether to retrieve additional information, evaluating the relevance of retrieved content, and checking whether the final output is factually supported. Records retrieval decisions, content assessments, and support checks.
6. `paradigm-routing-trace`: Before answering, analyzes the problem to select the single most suitable reasoning paradigm from a lightweight taxonomy (Direct, CoT, ReAct, Plan-Execute, Reflection, ReCode). Then executes the selected paradigm. Records the routing decision and the reasoning trace.
7. `codeact-trace`: Approaches the problem by expressing reasoning steps as executable Python code, using automated feedback (error messages, test results) to self-debug, and consolidating actions into a unified code space. Records code, execution results, and how the code-based approach drove the conclusion.

#### Pairing Skills (8–14)
8. `self-consistency-pairing`: Given a problem, selects the best-fit reasoning strategy from the full Vidbyte catalog, runs that strategy N times independently, then applies majority/plurality vote to select the most consistent answer. Records all paths and the voting.
9. `parallel-thinking-pairing`: Given a problem, selects the best-fit reasoning strategy from the full Vidbyte catalog, then runs that strategy on parallel decomposed sub-problems, synthesizing results.
10. `multi-agent-debate-pairing`: Given a problem, selects the best-fit reasoning strategy from the full Vidbyte catalog, then simulates multiple agents each applying that strategy independently before engaging in structured debate rounds.
11. `mixture-of-agents-pairing`: Given a problem, selects the best-fit reasoning strategy from the full Vidbyte catalog, then passes the problem through successive refinement layers where each layer applies the selected strategy.
12. `self-rag-pairing`: Given a problem, selects the best-fit reasoning strategy from the full Vidbyte catalog, then executes that strategy with iterative retrieval, relevance checking, and support verification.
13. `paradigm-routing-pairing`: Given a problem, routes to the most suitable reasoning paradigm, then within that paradigm selects and executes the best-fit Vidbyte reasoning strategy from the full catalog.
14. `codeact-pairing`: Given a problem, selects the best-fit reasoning strategy from the full Vidbyte catalog, then expresses that strategy's reasoning steps as executable code with self-debugging.

### Non-Functional Requirements
- **Performance:** All skills are prompt-only (no network calls), so latency depends on model inference speed only. Pairing skills will produce longer traces (N-fold for self-consistency, multi-agent, etc.) but this is inherent to the strategy.
- **Scalability:** Skills are stateless and self-contained. No external dependencies.
- **Security:** No secrets, no API keys, no network calls. All reasoning happens in the model's context window.
- **Observability:** Every skill produces a durable `memory/{question_name}.md` trace artifact with sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
- **Reliability:** Pairing skills fall back gracefully: if the strategy selection is ambiguous, they fall back to abductive reasoning (same as `autoreasoner`).

---

## 5. High-Level Design

The feature introduces two layers of skills:

**Layer 1 — Standalone Skills:** New reasoning methods that did not previously exist in the Vidbyte catalog. These are straightforward Type 1 reasoning trace skills following the exact same template as existing trace skills (e.g., `bayesian-trace`, `first-principles-trace`). Each has a unique core move derived from its research strategy.

**Layer 2 — Pairing Meta-Skills:** Skills that wrap the existing catalog. They follow the `autoreasoner` architecture — embedding the full strategy reference catalog inline — but add a meta-strategy execution layer after strategy selection. The flow is: classify problem → select best-fit strategy from catalog → apply meta-strategy using that strategy → produce trace artifact.

```
[User invokes /self-consistency-pairing]
       |
       v
[Classify problem domain]
       |
       v
[Select best-fit reasoning strategy from full Vidbyte catalog]
       |
       v
[Execute selected strategy N=5 times independently]
       |
       v
[Compare conclusions, apply majority/plurality vote]
       |
       v
[Write trace to memory/{question_name}.md with all N paths + voting]
```

All skills write to `memory/{question_name}.md` following the established six-section format (Question, Strategy, Scale, Scratchpad, Synthesis, Final Answer).

### Key Design Decisions
- **Pairing skills embed the full catalog** rather than referencing external files, because skills must be self-contained for portability across harnesses
- **No variants** for the initial release — reduces scope and avoids combinatorial explosion (7 strategies × 4 variants = 28 extra files)
- **Standalone + pairing distinction** because some users want the pure research strategy, others want it combined with existing strategies
- **N=5 default for self-consistency** as a reasonable balance between diversity and token budget

---

## 6. Detailed Design

### 6.1 self-consistency-trace

**File(s):** `skills/self-consistency-trace/SKILL.md`
**Type:** New file

#### What it does
Implements the Self-Consistency / Best-of-N Sampling strategy as a standalone reasoning method. Generates N independent reasoning paths through the problem and selects the most consistent answer via majority or plurality vote.

#### Interface / API
```
Invocation: /self-consistency-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the user's question, constraints, and evidence standard
2. Define N (default 5) — the number of independent reasoning paths to sample
3. For each path i=1..N:
   a. Reason through the problem independently from scratch (vary starting angle, assumptions, or approach to ensure diversity)
   b. Record the chain of reasoning and the conclusion reached
4. Compare all N conclusions and identify the most consistent answer:
   - If a single answer appears in a majority of paths, select it
   - If no majority exists, select the plurality winner (most frequent answer)
   - If all paths disagree, report the disagreement and the most compelling individual path
5. Record the voting tally and synthesize the final answer
6. Write the trace with all N paths and the consensus outcome

#### Edge Cases & Error Handling
- If N=1 (user specifies): fall back to single-path reasoning with a note
- If all paths reach different conclusions: report the disagreement, note low confidence, present the strongest single path
- If the problem is too vague: ask one clarifying question before sampling

---

### 6.2 parallel-thinking-trace

**File(s):** `skills/parallel-thinking-trace/SKILL.md`
**Type:** New file

#### What it does
Implements the Parallel Thinking / Overthinking counter-paradigm. Decomposes the problem into independent sub-problems and runs parallel reasoning threads, avoiding the diminishing returns of long sequential chains.

#### Interface / API
```
Invocation: /parallel-thinking-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the user's question and identify its natural decomposition points
2. Decompose into 3–5 independent sub-problems (each can be reasoned about separately)
3. For each sub-problem, run an independent reasoning thread:
   a. Apply focused reasoning to that specific sub-problem
   b. Target concise depth per thread (~25–50 lines) rather than one deep chain
4. Synthesize results from all parallel threads into a coherent final answer
5. Identify any cross-thread dependencies or contradictions
6. Write the trace showing all parallel threads and the synthesis

#### Edge Cases & Error Handling
- If the problem cannot be meaningfully decomposed: note this and fall back to sequential reasoning on the whole problem
- If parallel threads produce contradictory results: flag the contradiction, analyze why, and present the synthesis that best reconciles them
- Easy problems may cross the "overthinking threshold" quickly — cap per-thread depth at ~50 lines

---

### 6.3 multi-agent-debate-trace

**File(s):** `skills/multi-agent-debate-trace/SKILL.md`
**Type:** New file

#### What it does
Implements Multi-Agent Debate (MAD) as a standalone reasoning method. Simulates multiple heterogeneous agents with distinct roles who independently reason, then engage in structured debate rounds toward consensus.

#### Interface / API
```
Invocation: /multi-agent-debate-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the user's question
2. Define 3 heterogeneous agents with distinct roles (not identical perspectives):
   - Agent A: Optimizer — best-case, opportunity-focused
   - Agent B: Skeptic — worst-case, risk-focused
   - Agent C: Integrator — systems-level, connection-focused
3. Round 1 — Initial Positions: Each agent independently reasons and states their conclusion with reasoning
4. Round 2 — Critique: Each agent critiques the other agents' positions, identifying weaknesses, missing evidence, or logical gaps
5. Round 3 — Revision: Each agent revises their position in light of the critiques, acknowledging valid points and defending against invalid ones
6. Final Round — Convergence: Attempt to converge on a consensus position. If consensus is reached, state it. If not, clearly characterize the persistent disagreement
7. Write the trace with all rounds and the final outcome

#### Edge Cases & Error Handling
- If all agents immediately agree: note the strong consensus (high confidence)
- If agents persistently disagree after 3 rounds: stop, characterize the crux of disagreement, present both positions with their evidence
- Current MAD frameworks fail to consistently outperform single-agent — this skill acknowledges this finding and presents disagreement transparently

---

### 6.4 mixture-of-agents-trace

**File(s):** `skills/mixture-of-agents-trace/SKILL.md`
**Type:** New file

#### What it does
Implements Mixture-of-Agents (MoA) layered aggregation. Passes the problem through successive refinement layers, where each layer takes the previous layer's output as context and improves it.

#### Interface / API
```
Invocation: /mixture-of-agents-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the user's question
2. Define 3 layers of refinement:
   - Layer 1 (Proposer): Generate an initial analysis and answer
   - Layer 2 (Refiner): Review Layer 1's output, identify gaps, correct errors, deepen analysis
   - Layer 3 (Synthesizer): Take Layer 2's refined output, add missing perspectives, produce final answer
3. Execute each layer sequentially, recording each layer's full output
4. Rate the quality improvement across layers (explicit delta analysis)
5. Write the trace showing the progressive refinement

#### Edge Cases & Error Handling
- If a later layer contradicts an earlier layer: flag the contradiction, explain which layer has the better reasoning
- If quality does not improve across layers: note the plateau, explain why additional layers added no value
- If the initial analysis is already strong: Layer 2 and 3 focus on edge cases and depth rather than correction

---

### 6.5 self-rag-trace

**File(s):** `skills/self-rag-trace/SKILL.md`
**Type:** New file

#### What it does
Implements Self-RAG — retrieval as a learned decision coupled with self-reflection. Iteratively reasons while deciding when to retrieve information, evaluating retrieved content relevance, and verifying output support.

#### Interface / API
```
Invocation: /self-rag-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the user's question
2. Begin iterative reasoning. At each step, evaluate whether additional information is needed:
   - Signal [RETRIEVE]: Current knowledge insufficient for this sub-question → describe what information is needed
   - Signal [RELEVANT] / [IRRELEVANT]: After hypothetical retrieval, assess whether the information addresses the need
   - Signal [SUPPORTED] / [PARTIALLY] / [UNSUPPORTED]: Check whether claims in the output are backed by the retrieved information
3. Continue reasoning until all sub-questions are addressed
4. Final verification pass: review all [SUPPORTED] claims and flag any that need caveats
5. Write the trace with retrieval decisions, relevance assessments, and support checks inline

#### Edge Cases & Error Handling
- If no retrieval is needed (the problem relies on reasoning alone): note this, proceed with pure reasoning
- If retrieval would require information the model cannot access: mark as [INACCESSIBLE], proceed with best available knowledge and note the uncertainty
- If retrieved information contradicts the model's existing knowledge: flag the contradiction, weigh both sources

---

### 6.6 paradigm-routing-trace

**File(s):** `skills/paradigm-routing-trace/SKILL.md`
**Type:** New file

#### What it does
Implements Paradigm Routing ("Select-then-Solve"). Before answering, analyzes the problem to select the most suitable inference-time paradigm from a proven taxonomy, then executes that paradigm.

#### Interface / API
```
Invocation: /paradigm-routing-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the user's question
2. Analyze the problem and classify it against a lightweight paradigm taxonomy:
   - **Direct**: Simple factual/definitional questions — answer directly
   - **CoT (Chain of Thought)**: Multi-step problems benefiting from sequential reasoning
   - **ReAct**: Problems requiring reasoning interleaved with action/observation loops
   - **Plan-Execute**: Complex tasks where upfront planning improves execution
   - **Reflection**: Problems where iterative self-critique and revision improve the answer
   - **ReCode**: Problems where expressing reasoning as code improves precision
3. Route to the selected paradigm and execute it
4. Record the routing decision with justification (why this paradigm, not others)
5. Write the trace showing the paradigm selection and the executed reasoning

#### Edge Cases & Error Handling
- If the problem is genuinely ambiguous across paradigms: pick the safest paradigm (CoT), note the ambiguity
- If the selected paradigm degrades performance (the problem would have been better served by another): this is an inherent risk acknowledged in the research — the router is approximate, not oracle
- Avoid overthinking: simple problems should route to Direct, not CoT

---

### 6.7 codeact-trace

**File(s):** `skills/codeact-trace/SKILL.md`
**Type:** New file

#### What it does
Implements CodeAct — code as a unified action space. Expresses reasoning steps as executable Python code, uses automated feedback for self-debugging, and consolidates actions into a unified code representation.

#### Interface / API
```
Invocation: /codeact-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the user's question
2. Decompose the problem into components that can be expressed as code
3. For each component, write executable Python code that:
   - Encodes the reasoning logic
   - Stores intermediate results as variables for reuse
   - Composes multiple logical operations
   - Produces testable outputs
4. For each code block, simulate execution and record:
   - The code itself
   - Expected output or error messages
   - Self-debugging corrections if errors occur
5. Use code's inherent control flow (loops, conditionals, functions) to structure the reasoning
6. Synthesize final answer from code-executed results
7. Write the trace showing code blocks, execution results, and the conclusion

#### Edge Cases & Error Handling
- If the problem cannot be meaningfully expressed as code: note this limitation, fall back to structured text reasoning
- If code would require external libraries not available: use stdlib Python only, note when external tools would have helped
- If simulated execution produces errors: self-debug and correct, recording the debugging cycle

---

### 6.8–6.14 Pairing Meta-Skills (Shared Architecture)

**File(s):** 
- `skills/self-consistency-pairing/SKILL.md`
- `skills/parallel-thinking-pairing/SKILL.md`
- `skills/multi-agent-debate-pairing/SKILL.md`
- `skills/mixture-of-agents-pairing/SKILL.md`
- `skills/self-rag-pairing/SKILL.md`
- `skills/paradigm-routing-pairing/SKILL.md`
- `skills/codeact-pairing/SKILL.md`

**Type:** New files

#### What they do
Each pairing skill is a meta-reasoner that:
1. Classifies the user's problem into a reasoning domain
2. Selects the single best-fit reasoning strategy from the full Vidbyte catalog (same Strategy Reference as `autoreasoner`)
3. Applies the meta-strategy (self-consistency, debate, MoA, etc.) using the selected strategy as the base reasoning engine
4. Produces a trace artifact showing both the strategy selection and the meta-execution

#### Shared Architecture
All 7 pairing skills share the same structural skeleton:
- **Identity:** Meta-reasoner that pairs [META-STRATEGY] with the full Vidbyte reasoning catalog
- **Step 1 — Detect Invocation:** Check for slash command
- **Step 2 — Classify Problem:** Same 11-domain classification table as `autoreasoner`
- **Step 3 — Select Strategy:** Match problem domain against the full Strategy Reference catalog
- **Step 4 — Execute Meta-Strategy:** Apply the specific meta-strategy using the selected base strategy
- **Step 5 — Write Trace:** Produce `memory/{question_name}.md` with standard sections

#### Key differences per pairing skill
Each pairing skill differs only in Step 4 (the meta-strategy execution):

| Pairing Skill | Meta-Strategy Execution |
|---|---|
| `self-consistency-pairing` | Run selected strategy N=5 times independently, majority vote on conclusions |
| `parallel-thinking-pairing` | Decompose into sub-problems, run selected strategy on each in parallel, synthesize |
| `multi-agent-debate-pairing` | 3 heterogeneous agents each apply the selected strategy, then debate in rounds |
| `mixture-of-agents-pairing` | 3 layers, each applying the selected strategy with previous output as context |
| `self-rag-pairing` | Apply selected strategy with [RETRIEVE]/[RELEVANT]/[SUPPORTED] checkpoints |
| `paradigm-routing-pairing` | First route to best paradigm, then within that paradigm select and execute best Vidbyte strategy |
| `codeact-pairing` | Express the selected strategy's reasoning steps as executable Python code |

#### Strategy Reference Embedding
Each pairing skill embeds the full 100+ strategy catalog as an inline reference (same structure as `autoreasoner`'s Strategy Reference section). This catalog is organized by domain:
- Causal & Diagnostic (11 strategies)
- Logical & Formal (12 strategies)
- Decision & Evaluation (11 strategies)
- Probabilistic & Forecasting (12 strategies)
- Creative & Lateral (14 strategies)
- Adversarial & Critical (13 strategies)
- Systems Thinking (10 strategies)
- Structured Analytic (12 strategies)
- Strategic & Business (12 strategies)
- Temporal & Historical (8 strategies)
- Specialized & Cross-Domain (10 strategies)

#### Edge Cases & Error Handling (all pairing skills)
- If problem is too vague to classify: ask one clarifying question (same as `autoreasoner`)
- If selected strategy is not in the catalog: fall back to abductive reasoning
- If N>1 paths produce wildly divergent results (self-consistency): report disagreement, present strongest path
- If consensus cannot be reached (debate): characterize the crux of disagreement
- Never select prompt skills or learning skills as the base strategy

---

## 7. Data Model Changes

### 7.1 skills-manifest.json

**Change type:** Modified

The `reasoning` array in `skills-manifest.json` will be appended with 14 new entries:

```json
"self-consistency-trace",
"parallel-thinking-trace",
"multi-agent-debate-trace",
"mixture-of-agents-trace",
"self-rag-trace",
"paradigm-routing-trace",
"codeact-trace",
"self-consistency-pairing",
"parallel-thinking-pairing",
"multi-agent-debate-pairing",
"mixture-of-agents-pairing",
"self-rag-pairing",
"paradigm-routing-pairing",
"codeact-pairing"
```

**Migration strategy:** N/A — additive change only, no rollback needed beyond removing the entries.

---

## 8. API Changes

N/A — No API endpoints are created or modified. These are pure prompt skills with no backend integration.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/self-consistency-trace/SKILL.md` | Standalone self-consistency reasoning skill |
| CREATE | `skills/parallel-thinking-trace/SKILL.md` | Standalone parallel thinking reasoning skill |
| CREATE | `skills/multi-agent-debate-trace/SKILL.md` | Standalone multi-agent debate reasoning skill |
| CREATE | `skills/mixture-of-agents-trace/SKILL.md` | Standalone mixture-of-agents reasoning skill |
| CREATE | `skills/self-rag-trace/SKILL.md` | Standalone self-RAG reasoning skill |
| CREATE | `skills/paradigm-routing-trace/SKILL.md` | Standalone paradigm routing reasoning skill |
| CREATE | `skills/codeact-trace/SKILL.md` | Standalone codeact reasoning skill |
| CREATE | `skills/self-consistency-pairing/SKILL.md` | Meta-skill pairing self-consistency with full catalog |
| CREATE | `skills/parallel-thinking-pairing/SKILL.md` | Meta-skill pairing parallel thinking with full catalog |
| CREATE | `skills/multi-agent-debate-pairing/SKILL.md` | Meta-skill pairing multi-agent debate with full catalog |
| CREATE | `skills/mixture-of-agents-pairing/SKILL.md` | Meta-skill pairing mixture-of-agents with full catalog |
| CREATE | `skills/self-rag-pairing/SKILL.md` | Meta-skill pairing self-RAG with full catalog |
| CREATE | `skills/paradigm-routing-pairing/SKILL.md` | Meta-skill pairing paradigm routing with full catalog |
| CREATE | `skills/codeact-pairing/SKILL.md` | Meta-skill pairing codeact with full catalog |
| MODIFY | `skills-manifest.json` | Add 14 new entries to the reasoning array |

**Summary:** 14 new files created, 1 file modified, 0 files deleted.

---

## 10. Testing Plan

### Unit Tests (Validation)

The existing `npm test` (validate.js) automatically covers:
- All 14 new skill folders contain a `SKILL.md` with valid YAML frontmatter
- All `name` fields match their folder names and are valid hyphen-case
- All `description` fields are non-empty
- All `body` sections are non-empty
- All 14 skills are registered in `skills-manifest.json` under `reasoning`

No new test code is required — the existing validation infrastructure handles this automatically.

### Integration Tests

- **Smoke test:** Run `npm test` and confirm all validations pass
- **Manual invocation test:** Invoke each skill with a sample problem and verify:
  - The skill activates for its slash command
  - A `memory/{question_name}.md` file is produced
  - The file contains all required sections (Question, Strategy, Scale, Scratchpad, Synthesis, Final Answer)
  - The output follows the skill's algorithm

### Manual / QA Test Cases

1. **Standalone self-consistency-trace:** Given "Should we migrate from monolith to microservices?", verify N=5 independent paths are recorded with a majority-voted conclusion
2. **Standalone parallel-thinking-trace:** Given "What caused the production outage?", verify the problem is decomposed into sub-problems with parallel threads
3. **Standalone multi-agent-debate-trace:** Given "Is AGI possible by 2030?", verify 3 agents with distinct roles debate through structured rounds
4. **Standalone mixture-of-agents-trace:** Given "Design a caching strategy for our API", verify 3 layers of progressive refinement
5. **Standalone paradigm-routing-trace:** Given "What is 2+2?" verify it routes to Direct (not CoT), and given a complex math problem verify it routes to CoT
6. **Pairing self-consistency-pairing:** Given "Why did our conversion rate drop?", verify it selects a causal strategy and runs it 5 times with voting
7. **Pairing paradigm-routing-pairing:** Verify two-stage routing: first to paradigm, then to Vidbyte strategy within that paradigm

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | All reasoning is prompt-only, no external services | None |

---

## 12. Rollout & Deployment

- **Feature flags:** None — skills are passive until invoked by slash command
- **Breaking changes:** None — purely additive
- **Deployment order:** Single commit, single PR
- **Rollback procedure:** Revert the commit; skills are non-breaking additions
- **Compatibility:** All skills follow existing conventions; compatible with all harnesses the installer supports

---

## 13. Open Questions

- [ ] Should these 14 new strategies be added to the `autoreasoner` Strategy Reference catalog? (Separate follow-up)
- [ ] Should scale variants (-small, -medium, -large) be created for the standalone skills? (Deferred — user can request)
- [ ] Should the pairing skills be registered in `lib/skill-versions.json` under a new version? (Current versions 1–3 are sparse; likely not needed)
- [ ] Should the CodeAct standalone skill suggest actually executing Python code, or only simulate? (Design assumes simulation — actual execution requires sandboxing which is out of scope)

---

## 14. Alternatives Considered

### Alternative 1: Add strategies as entries in autoreasoner's catalog
- **What:** Instead of creating separate skills, add the 7 strategies as new rows in `autoreasoner`'s Strategy Reference table
- **Why rejected:** The `autoreasoner` selects and executes ONE strategy. The research strategies are meta-strategies that govern *how* to reason, not *what* reasoning move to make. They operate at a different level. Standalone skills let users invoke them directly. Pairing skills implement the meta-layer behavior that `autoreasoner` cannot express.

### Alternative 2: Create only pairing skills, skip standalone
- **What:** Only create the 7 pairing meta-skills
- **Why rejected:** The research strategies are independently valuable as reasoning methods. A user wanting pure self-consistency shouldn't need to also invoke an existing strategy. Standalone skills are simpler, more focused, and have clearer scope boundaries.

### Alternative 3: Create one mega-skill combining all 7 strategies
- **What:** A single `/meta-reasoner` skill that can apply any of the 7 meta-strategies
- **Why rejected:** Too complex; violates the "one skill = one purpose" principle from the skill authoring guide. Separate skills are discoverable, testable, and maintainable independently.

### Alternative 4: Only create default level, add small/medium/large variants
- **What:** Create the full 4-variant family per standalone skill (28 extra files total)
- **Why rejected:** Increases scope 4x. Variants can be added later as a fast-follow if users request them. The pairing skills already generate more tokens inherently (N paths, debate rounds, etc.), so the default scale is naturally larger.

