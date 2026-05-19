# Design Doc: Prompt-Space Reasoning Strategies — Batch 3

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-18
**Last Updated:** 2026-05-18

---

## 1. Overview

This feature adds new standalone reasoning trace skills derived from 40+ prompt engineering research strategies (clusters A–M, items #18–43). Each strategy is first classified as "prompt-implementable" (can be expressed purely through SKILL.md instructions) or "requires infrastructure/training" (needs model retraining, external APIs, or architectural changes). Only prompt-implementable strategies become skills.

Batch 1 (PR #63) implemented 9 meta-strategies (18 skills: 9 trace + 9 reasoning). Batch 2 (design doc exists, not yet implemented) covers ~30 additional strategies. This **Batch 3** design focuses on strategies from the user's research collection that are either genuinely novel additions beyond Batch 2 or represent the highest-impact prompt-space approaches worth prioritizing.

---

## 2. Goals & Non-Goals

### Goals
- Classify all ~60+ strategies from the research collection into "prompt-implementable" vs "requires-training/architecture"
- Identify gaps between Batch 2 design and the user's research collection
- Implement ~12 high-impact, prompt-space-only reasoning trace skills as new additions
- Follow the existing canonical trace skill template (same pattern as `bayesian-trace`, `first-principles-trace`, etc.)
- Register all new skills in `skills-manifest.json`
- Pass validation: `npm test`

### Non-Goals
- Duplicate strategies already implemented in Batch 1 (PR #63): self-consistency, parallel-thinking, multi-agent-debate, mixture-of-agents, self-rag, paradigm-routing, codeact, step-back, curriculum-learning
- Duplicate strategies already designed in Batch 2 (to be implemented separately): chain-of-draft, budget-forcing, focused-cot, sketch-of-thought, contrastive-cot, least-to-most, decomposed-prompting, cross-lingual-consistency, adaptive-got, iteration-of-thought, divide-and-conquer, chain-of-table, reticl, many-shot-icl, difficulty-aware-routing, intent-engineering, self-notes, chain-of-agents, talker-reasoner, pdr, dynamic-cheatsheet, autonomous-code-integration, program-of-thoughts
- Implement strategies requiring model training, RL, fine-tuning, or infrastructure (documented as deferred)
- Create pairing/meta-skill versions (these are standalone trace skills only)
- Scale variants (-small, -medium, -large)
- Modify existing skill files

---

## 3. Background & Context

### Why this is being built now
The user has collected 40+ prompt engineering research strategies spanning budget control, reasoning topologies, in-context learning advances, dual-process architectures, speculative inference, and memory organization. Many of these represent the active research frontier of 2024–2025. While Batch 1 and Batch 2 already cover a significant portion, several novel strategies remain unaddressed — particularly in structural reasoning topology (graph-based), meta-orchestration (conductor + experts), elastic budget allocation, and novel improvement operators.

### What problem does it solve
The Vidbyte catalog currently has 100+ reasoning trace strategies but lacks strategies from these specific research clusters: graph-structured reasoning topologies, meta-prompting (single model as multi-role conductor), elastic two-phase budget allocation, and contrastive learning from invalid examples. These fill structural gaps in the catalog's coverage.

### Current state
- Batch 1 (PR #63): 18 skills (9 trace + 9 reasoning meta-skills), implemented in worktree, PR open
- Batch 2 (design doc): ~30 strategies designed in detail but not yet implemented
- Existing catalog: 100+ reasoning trace skills following canonical 55-line template
- The `autoreasoner` skill already routes to individual reasoning strategies

### Constraints
- All skills must be self-contained in SKILL.md (no API dependencies)
- Skills are Type 1 (reasoning trace) — produce `memory/{question_name}.md` artifacts
- Must follow the EXISTING canonical trace skill template (55-line pattern), NOT the expanded PR #63 template
- Must match `VALID_SKILL_NAME` regex: `/^[a-z0-9]+(-[a-z0-9]+)*$/`

---

## 4. Requirements

### Functional Requirements
1. Each strategy must be classified as IMPLEMENT, DEFER-TRAIN, or DEFER-INFRA
2. For IMPLEMENT strategies: create standalone reasoning trace skills following the canonical template
3. Each skill must:
   - Have valid YAML frontmatter with `name` matching directory name
   - Write a durable trace artifact to `memory/{question_name}.md`
   - Target ~100 numbered lines / 2,000–3,500 tokens of scratchpad detail
   - Include sections: Question, Strategy, Scale, Scratchpad, Synthesis, Final Answer
4. Register all skills alphabetically in `skills-manifest.json` under `reasoning`

### Non-Functional Requirements
- Prompt-only (no network calls, no API keys, no external executables)
- Self-contained (all reasoning logic in the SKILL.md instructions)
- Follow existing code style exactly (55-line template pattern)
- Pass `npm test` validation

---

## 5. High-Level Design

### 5.1 Strategy Classification

Each of the 40+ strategies is classified into one of three categories:

| Category | Criteria |
|----------|----------|
| **IMPLEMENT** | Can be expressed purely through prompt instructions in SKILL.md |
| **DEFER-TRAIN** | Requires model training, RL, fine-tuning, or architecture changes |
| **DEFER-INFRA** | Requires external infrastructure (simulators, tool APIs, agent frameworks, multi-model deployment) |

### 5.2 Full Classification Table

**CLUSTER A: Budget Control & Reasoning Efficiency**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| A1 | Budget Forcing ("Wait") | IMPLEMENT | Batch 2 |
| A2 | Elastic Reasoning | IMPLEMENT | NOT COVERED — **new for Batch 3** |
| A3 | Chain of Draft (CoD) | IMPLEMENT | Batch 2 |
| A4 | Answer Convergence | IMPLEMENT | Batch 2 |
| A5 | BudgetThinker | DEFER-TRAIN | — |
| A6 | ES-CoT / Speculative Rejection | DEFER-INFRA (needs reward model) | — |
| A7 | Focused Chain-of-Thought | IMPLEMENT | Batch 2 |
| A8 | Sketch-of-Thought | IMPLEMENT | Batch 2 |

**CLUSTER B: Recurrent & Latent Depth Scaling**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| B1–B6 | All recurrent/latent depth strategies | DEFER-TRAIN (requires architecture change) | — |

**CLUSTER C: RLVR & Training-Time Reasoning Paradigms**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| C1–C6 | All RLVR and multi-turn RL strategies | DEFER-TRAIN (requires RL training) | — |

**CLUSTER D: In-Context Learning Advances**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| D1 | Retrieval-Augmented ICL (RetICL) | IMPLEMENT | Batch 2 |
| D2 | Many-Shot ICL | IMPLEMENT | Batch 2 |
| D3 | Demonstration Selection via RL (RDES) | DEFER-TRAIN | — |
| D4 | Compute-Optimal Many-Shot ICL | IMPLEMENT | Batch 2 |
| D5 | Coreset-Based Demonstration Selection | IMPLEMENT | Batch 2 |

**CLUSTER E: Structured Reasoning Topologies**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| E1 | Chain-of-Table | IMPLEMENT | Batch 2 |
| E2 | Contrastive Chain-of-Thought | IMPLEMENT | Batch 2 |
| E3 | Least-to-Most Prompting | IMPLEMENT | Batch 2 |
| E4 | Decomposed Prompting | IMPLEMENT | Batch 2 |
| E5 | Cross-Lingual Consistency | IMPLEMENT | Batch 2 |
| E6 | Adaptive Graph of Thoughts (AGoT) | IMPLEMENT | Batch 2 |
| E7 | Iteration of Thought / InftyThink | IMPLEMENT | Batch 2 |
| E8 | Divide-and-Conquer Prompting | IMPLEMENT | Batch 2 |

**Not in Batch 2 — priority for Batch 3:**

| ID | Strategy | Classification | Why New |
|----|----------|---------------|---------|
| #36 | **Graph of Thoughts (GoT)** — base version | IMPLEMENT | AGoT is in Batch 2, but the original GoT with explicit graph construction, aggregation, and feedback loops is distinct and more fundamental |
| #37 | **Meta-Prompting** — one model as conductor + panel of experts | IMPLEMENT | Architecturally distinct from multi-agent debate. One model plays ALL roles. Cheaper, simpler, different paradigm from MAD |
| E2+ | **Contrastive CoT** — show valid AND invalid reasoning | IMPLEMENT | In Batch 2 but deserves highlighting as high-impact (+9.8–16pp improvements) |

**CLUSTER F: Deep Research Agent Paradigms**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| F1–F4 | All deep research agent paradigms | DEFER-INFRA (needs search/browse tools) | — |

**CLUSTER G: Multi-Agent Architecture & Self-Evolution**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| G1 | Automatic Workflow Design (ADAS/AFlow) | DEFER-INFRA (needs MCTS optimizer) | — |
| G2 | EvoAgentX | DEFER-INFRA | — |
| G3 | Chain-of-Agents (CoA) | IMPLEMENT | Batch 2 |
| G4 | Thought Communication | DEFER-TRAIN | — |
| G5 | Agent KB | DEFER-INFRA | — |
| G6 | Agentic Plan Caching | DEFER-INFRA | — |
| G7 | Multi-Agent RL with Lazy Agent Mitigation | DEFER-TRAIN | — |
| G8 | Dynamic Real-Time Agent Generation (DRTAG) | IMPLEMENT | NOT COVERED — **new for Batch 3** |

**CLUSTER H: Tool & Code Integration**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| H1 | Tool-Integrated Interleaved Thinking via RL | DEFER-TRAIN | — |
| H2 | Autonomous Code Integration | IMPLEMENT | Batch 2 |
| H3 | Program of Thoughts (PoT) | IMPLEMENT | Batch 2 |
| H4 | Self-Tooling Agent (STA) | DEFER-TRAIN | — |

**CLUSTER I: Speculative & Cascade Inference**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| I1 | Speculative Thinking (large guides small) | DEFER-INFRA (needs multiple models) | — |
| I2 | Speculative Chain-of-Thought (SCoT) | DEFER-INFRA | — |
| I3 | Difficulty-Aware Routing | IMPLEMENT | Batch 2 |

**CLUSTER J: System 1 / System 2 Dual Process**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| J1 | Talker-Reasoner Architecture | IMPLEMENT | Batch 2 |
| J2 | Dualformer | DEFER-TRAIN | — |
| J3 | AlphaOne | IMPLEMENT | Batch 2 |

**CLUSTER K: Context Engineering (Extended)**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| K1 | Intent Engineering (IE) | IMPLEMENT | Batch 2 |
| K2 | Specification Engineering (SE) | IMPLEMENT | Batch 2 |
| K3 | Self-Notes | IMPLEMENT | Batch 2 |
| K4 | Dynamic Cheatsheet / ACE Curator | IMPLEMENT | Batch 2 |

**CLUSTER L: Embodied & Simulation-Based Reasoning**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| L1–L3 | All embodied/simulation strategies | DEFER-INFRA (needs simulators) | — |

**CLUSTER M: Miscellaneous High-Signal Findings**

| ID | Strategy | Classification | Already Covered? |
|----|----------|---------------|-------------------|
| M1 | CoT as a Mirage | DEFER-TRAIN (analysis paper) | — |
| M2 | Expert Persona PRISM Routing | IMPLEMENT | Batch 2 |
| M3 | Role Vectors via Representation Engineering | DEFER-TRAIN (needs activation modification) | — |
| M4 | Multilingual System Prompt Optimization | IMPLEMENT | NOT COVERED — could add but lower priority |
| M5 | Multi-Agent Architecture Search | DEFER-INFRA | — |
| M6 | Self-Evolving AI Agents Survey | N/A (survey paper) | — |
| M7 | Generative Semantic Workspace (GSW) | IMPLEMENT | Batch 2 |
| M8 | Pre-Storage Reasoning | IMPLEMENT | Batch 2 |
| M9 | Temporal Semantic Memory (TSM) | IMPLEMENT | Batch 2 |

**Directly from items #18–43:**

| # | Strategy | Classification | Already Covered? |
|---|----------|---------------|-------------------|
| 18 | Active Inference / Free Energy Minimization | DEFER-INFRA (requires Bayesian framework, state factors, 7 observation modalities) | — |
| 19 | Self-RAG | IMPLEMENT | Batch 1 (PR #63) |
| 20 | Self-Consistency / Best-of-N | IMPLEMENT | Batch 1 |
| 21 | Parallel Thinking / Overthinking | IMPLEMENT | Batch 1 |
| 22 | Adaptive Budget Forcing | DEFER-TRAIN (needs token-level confidence signals) | — |
| 23 | Process Reward Models (PRMs) | DEFER-INFRA (needs separate reward model) | — |
| 24 | Sleep-Time Compute | DEFER-INFRA (needs pre-query compute infrastructure) | — |
| 25 | Multi-Agent Debate (MAD) | IMPLEMENT | Batch 1 |
| 26 | Mixture-of-Agents (MoA) | IMPLEMENT | Batch 1 |
| 27 | Iterative Refinement / PDR | IMPLEMENT | Batch 2 |
| 28 | STaR / Rejection Sampling Fine-Tuning | DEFER-TRAIN (requires training loop) | — |
| 29 | Model-Based Planning / LLM-as-World-Model | DEFER-INFRA (simulation required) | — |
| 30 | Dynamic Tool Creation / Self-Tooling | DEFER-TRAIN (requires RL training) | — |
| 31 | Quiet-STaR / Token-Level Thinking | DEFER-TRAIN (learnable tokens) | — |
| 32 | COCONUT / Chain of Continuous Thought | DEFER-TRAIN (latent space modification) | — |
| 33 | Step-Back Prompting | IMPLEMENT | Batch 1 |
| 34 | Curriculum-Based Self-Improvement | DEFER-TRAIN (training loop) | — |
| 35 | WorldMind / Failure as Alignment Signal | DEFER-INFRA (needs error signal processing) | — |
| 36 | Graph of Thoughts (GoT) | IMPLEMENT | NOT COVERED — **new for Batch 3** |
| 37 | Meta-Prompting | IMPLEMENT | NOT COVERED — **new for Batch 3** |
| 38 | Dynamic Real-Time Agent Generation | IMPLEMENT | NOT COVERED — **new for Batch 3** |
| 39 | LLM-as-Judge / Agent-as-Judge | IMPLEMENT | NOT COVERED — **new for Batch 3** |
| 40 | Expert Persona Routing (PRISM) | IMPLEMENT | Batch 2 |
| 41 | Role Vectors via Representation Engineering | DEFER-TRAIN | — |
| 42 | Neuro-Symbolic Hybrid Reasoning | DEFER-INFRA (external symbolic systems) | — |
| 43 | Curriculum Learning as Reasoning Scaffold | IMPLEMENT | Batch 1 |

### 5.3 Batch 3 Implementation Scope

After filtering, the following **12 strategies** are prompt-implementable AND NOT already covered by Batch 1 or Batch 2. These form the implementation scope for Batch 3:

| # | Skill Name | Source Strategy | Core Innovation |
|---|-----------|----------------|-----------------|
| 1 | `graph-of-thoughts-trace` | #36 Graph of Thoughts (GoT) | Arbitrary graph reasoning topology with aggregation — chains and trees are subsets; multiple paths can merge into single nodes via aggregation |
| 2 | `meta-prompting-trace` | #37 Meta-Prompting | Single model acts as conductor orchestrating a panel of expert roles within the same context window — cheaper than multi-agent but still gets specialized perspective benefit |
| 3 | `elastic-reasoning-trace` | A2 Elastic Reasoning | Two-phase budget allocation: thinking phase and solution phase with independently allocated token budgets — prioritizes solution completeness under constraints |
| 4 | `contrastive-cot-trace` | E2 Contrastive CoT | Provides BOTH valid and invalid reasoning demonstrations — model learns from what-not-to-do. +9.8 on GSM-8K, +16 on Bamboogle |
| 5 | `least-to-most-trace` | E3 Least-to-Most Prompting | Progressive subproblem solving from easiest to hardest, each facilitated by prior solutions — generalizes beyond prompt examples |
| 6 | `iteration-of-thought-trace` | E7 Iteration of Thought | Multi-round inference with intermediate summarization — extends context arbitrarily by summarizing completed blocks before continuing |
| 7 | `focused-cot-trace` | A7 Focused Chain-of-Thought | Organize essential information into structured context first, then reason exclusively over it — 2–3x inference speedup |
| 8 | `divide-and-conquer-trace` | E8 Divide-and-Conquer Prompting | Three distinct processes: task decomposition, sub-task resolution, and solution assembly — theoretically extends expressive power |
| 9 | `sketch-of-thought-trace` | A8 Sketch-of-Thought | Cognitive-psychology inspired minimal reasoning — produces sketch-style steps rather than full verbalizations |
| 10 | `dynamic-agent-generation-trace` | #38 DRTAG | Automatically creates and integrates new specialized agents driven by task context — system grows its own workforce |
| 11 | `agent-as-judge-trace` | #39 Agent-as-Judge | Uses the model as an evaluator producing intermediate rewards/critiques — evaluates reasoning trajectory, not just final answer |
| 12 | `cross-lingual-consistency-trace` | E5 Cross-Lingual Consistency | Generates reasoning paths in multiple languages and integrates via majority vote — 4.1–18.5% accuracy gains |

### 5.4 Architecture

All skills follow the existing canonical trace skill template (55-line pattern), which is significantly more compact than the PR #63 expanded template. The flow is:

```
[User invokes /{skill-name}-trace]
       |
       v
[Skill reads question, derives {question_name}]
       |
       v
[Builds scratchpad by applying the strategy's core move]
       |
       v
[Writes trace to memory/{question_name}.md]
  Sections: Question, Strategy, Scale, Scratchpad, Synthesis, Final Answer
       |
       v
[Responds with path, strategy, scale, final answer summary]
```

### 5.5 Key Design Decisions

- **Template choice:** Use the canonical 55-line trace template (matching existing bayesian-trace, first-principles-trace) rather than the expanded PR #63 template. This keeps these skills consistent with the 100+ existing trace skills and avoids template divergence.
- **No meta-skill variants:** These are standalone trace skills only — no pairing/-reasoning versions. The Batch 2 `autometareasoner` will route to them as needed.
- **No scale variants:** Only base/default scale. Variants (-large, -medium, -small) can be added as follow-up if needed.
- **Research-backed content:** Each skill's Background Information and Algorithm sections will reference the appropriate research paper and core findings.

---

## 6. Detailed Design

### 6.1 graph-of-thoughts-trace

**File(s):** `skills/graph-of-thoughts-trace/SKILL.md`
**Type:** New file

#### What it does
Graph of Thoughts (GoT) models reasoning as an arbitrary graph where LLM-generated "thoughts" are vertices and edges represent dependencies. Unlike chains (linear) and trees (branching without merging), GoT enables **aggregation** — multiple independent reasoning paths can be merged into a single synthesized thought. This also enables **feedback loops** where a thought can be refined by routing its output back as input.

#### Interface / API
```
Invocation: /graph-of-thoughts-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm (as embedded in the skill)
1. Restate the user's question and identify natural decomposition points
2. Define an initial set of thought nodes (vertices) — each a self-contained reasoning unit
3. Establish dependencies (edges) between thoughts — which thoughts feed into which
4. For each thought, generate content and record it
5. Where multiple thoughts converge, aggregate them into a synthesized node
6. Where feedback would improve a thought, loop its output back and refine
7. Traverse the graph to produce the final answer
8. Record the full graph structure and reasoning in the trace

#### Edge Cases & Error Handling
- If the problem is naturally linear: reduce to chain-of-thought but note the graph structure is degenerate
- If aggregation produces contradictory inputs: flag the contradiction, resolve explicitly
- If graph becomes too large: prioritize most-connected nodes, prune leaf nodes

---

### 6.2 meta-prompting-trace

**File(s):** `skills/meta-prompting-trace/SKILL.md`
**Type:** New file

#### What it does
Meta-Prompting transforms a single LM into a multi-faceted conductor that manages and integrates multiple independent expert queries. The model deconstructs complex tasks into smaller subtasks, each handled by distinct "expert" instances of the same model operating under specific tailored instructions. The model simultaneously acts as orchestrator and panel of diverse experts — all within one context window.

#### Interface / API
```
Invocation: /meta-prompting-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question and identify which specialized perspectives would contribute
2. Define 3-5 expert roles, each with a specific domain focus and reasoning instruction
3. As conductor, assign each sub-problem to the appropriate expert
4. Each expert provides specialized analysis within the same context
5. The conductor synthesizes expert contributions, reconciling conflicts
6. Record all expert contributions and the conductor's synthesis in the trace

#### Edge Cases & Error Handling
- If experts produce conflicting analyses: the conductor must reconcile explicitly
- If one expert dominates: rebalance by giving other experts explicit weight
- If the problem is simple: reduce to 1-2 experts and note the meta-structure is lightweight

---

### 6.3 elastic-reasoning-trace

**File(s):** `skills/elastic-reasoning-trace/SKILL.md`
**Type:** New file

#### What it does
Elastic Reasoning explicitly separates reasoning into two phases — thinking and solution — with independently allocated budgets. It prioritizes completeness of solution segments under tight resource constraints and teaches adaptive reasoning when thinking is cut short.

#### Interface / API
```
Invocation: /elastic-reasoning-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question and estimate complexity
2. Phase 1 — Thinking: allocate budget for exploration, hypothesis generation, and analysis
3. Phase 2 — Solution: allocate remaining budget for structured answer construction
4. If thinking phase runs short: flag incomplete analysis, proceed with best-available insights
5. If solution phase runs short: prioritize completeness of core answer over elaboration
6. Record the budget allocation, phase transitions, and any budget-constrained decisions

#### Edge Cases & Error Handling
- If the problem is simple: combine phases with minimal thinking budget
- If thinking phase exhausts budget: mark the answer as "under-analyzed" with explicit uncertainty
- Budget monitoring is approximate (token counts are estimated in prompt space)

---

### 6.4 contrastive-cot-trace

**File(s):** `skills/contrastive-cot-trace/SKILL.md`
**Type:** New file

#### What it does
Contrastive Chain-of-Thought provides both valid and invalid reasoning demonstrations, guiding the model to reason step-by-step while reducing reasoning mistakes. Unlike standard CoT which only shows correct reasoning, CCoT explicitly models what-not-to-do, achieving +9.8 points on GSM-8K and +16 points on Bamboogle.

#### Interface / API
```
Invocation: /contrastive-cot-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Generate a primary reasoning path (valid reasoning)
3. For each major reasoning step, generate a contrastive invalid version:
   - Show the mistake explicitly
   - Explain WHY it is wrong
   - Show how to correct it
4. After all contrastive pairs, synthesize the corrected reasoning
5. Record both valid and invalid reasoning in the trace

#### Edge Cases & Error Handling
- If no plausible mistakes exist for a step: note "no known failure mode" and continue
- Contrastive examples must be plausible (not strawmen) — if only trivial mistakes exist, acknowledge this
- The invalid reasoning should be clearly marked as INVALID in the trace

---

### 6.5 least-to-most-trace

**File(s):** `skills/least-to-most-trace/SKILL.md`
**Type:** New file

#### What it does
Least-to-Most prompting breaks down a complex problem into a series of simpler subproblems and solves them in sequence, where each subproblem's solution facilitates subsequent ones. This strategy generalizes to problems more difficult than those in the prompts.

#### Interface / API
```
Invocation: /least-to-most-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Decompose into subproblems ordered from easiest to hardest
3. Solve each subproblem in sequence, using prior solutions as building blocks
4. The final subproblem is the original question
5. Record the decomposition, each subproblem solution, and how solutions transfer forward

#### Edge Cases & Error Handling
- If the problem cannot be meaningfully decomposed: note this, solve directly
- If a subproblem's solution is wrong: it cascades — flag this risk
- Decomposition should be natural and non-arbitrary — forced decomposition is worse than direct solving

---

### 6.6 iteration-of-thought-trace

**File(s):** `skills/iteration-of-thought-trace/SKILL.md`
**Type:** New file

#### What it does
Iteration of Thought (InftyThink) transforms reasoning into a multi-round inference process with intermediate summarization, extending context size arbitrarily. Each round builds on a compressed summary of the previous round, allowing indefinitely long reasoning chains without context window overflow.

#### Interface / API
```
Invocation: /iteration-of-thought-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Round 1: Initial analysis — generate first-pass reasoning
3. Summarize Round 1 into a compressed intermediate state
4. Round 2: Build on the compressed summary — deepen, correct, extend
5. Summarize Round 2
6. Continue rounds until convergence or diminishing returns
7. Synthesize final answer from all rounds

#### Edge Cases & Error Handling
- If early rounds are already sufficient: reduce rounds, don't iterate for iteration's sake
- Summarization can lose nuance — flag what was compressed out
- Maximum 5 rounds by default to prevent infinite loops

---

### 6.7 focused-cot-trace

**File(s):** `skills/focused-cot-trace/SKILL.md`
**Type:** New file

#### What it does
Focused Chain-of-Thought first organizes essential information from a query into a concise, structured context and then guides the model to reason exclusively over this context. This reduces generated tokens by 2–3x compared to standard CoT while preserving strong reasoning performance.

#### Interface / API
```
Invocation: /focused-cot-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Phase 1 — Organize: Extract and structure the essential information into a concise context block (facts, constraints, relevant principles)
3. Phase 2 — Reason: Reason exclusively over the organized context, not the original verbose query
4. Every reasoning step must reference a specific piece of organized context
5. Flag when the organized context is incomplete and needs expansion

#### Edge Cases & Error Handling
- If the essential information is ambiguous: clarify before organizing
- If the organized context misses critical information: it fails — expand and re-reason
- The organization phase must be genuinely concise (not just a restatement)

---

### 6.8 divide-and-conquer-trace

**File(s):** `skills/divide-and-conquer-trace/SKILL.md`
**Type:** New file

#### What it does
Divide-and-Conquer Prompting disentangles task decomposition, sub-task resolution, and solution assembly into three distinct processes. Theoretical analysis shows this can extend the expressive power of fixed-depth Transformers.

#### Interface / API
```
Invocation: /divide-and-conquer-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Phase 1 — Decompose: Break the task into independent sub-tasks with clear interfaces
3. Phase 2 — Resolve: Solve each sub-task independently
4. Phase 3 — Assemble: Combine sub-task solutions into the final answer, handling cross-task dependencies
5. Record the decomposition structure, each sub-task solution, and assembly logic

#### Edge Cases & Error Handling
- If sub-tasks are not truly independent: flag cross-dependencies and resolve sequentially instead
- If assembly reveals contradictions: resolve explicitly before finalizing
- If a sub-task is unsolvable alone: note and solve with partial information

---

### 6.9 sketch-of-thought-trace

**File(s):** `skills/sketch-of-thought-trace/SKILL.md`
**Type:** New file

#### What it does
Sketch-of-Thought is a cognitive psychology-inspired paradigm that guides models to produce minimal, sketch-style intermediate reasoning steps rather than full verbalizations. Each step is a compressed insight rather than a complete sentence — prioritizing information density over fluency.

#### Interface / API
```
Invocation: /sketch-of-thought-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Generate minimal, sketch-style reasoning steps — each step should be a compressed insight (1-5 words)
3. Use notation, abbreviations, and structural formatting to maximize information density
4. If a step requires elaboration, add a brief expansion inline
5. Synthesize the sketches into a full final answer

#### Edge Cases & Error Handling
- If a sketch is too compressed to be meaningful: expand minimally
- Sketch-style reasoning may sacrifice clarity for speed — the final answer must still be clear
- Some problems resist compression (e.g., nuanced ethical reasoning) — note this and expand

---

### 6.10 dynamic-agent-generation-trace

**File(s):** `skills/dynamic-agent-generation-trace/SKILL.md`
**Type:** New file

#### What it does
Dynamic Real-Time Agent Generation (DRTAG) automatically creates new specialized agents within the reasoning process as the task reveals what specializations are needed. The system grows its own workforce on the fly — when it discovers a sub-problem requiring a perspective not yet represented, it generates a new agent for that perspective.

#### Interface / API
```
Invocation: /dynamic-agent-generation-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Start with 2-3 foundational agents (generalist, analyst, critic)
3. As reasoning reveals sub-problems requiring specialization, generate new agents:
   - Define the agent's specialty and perspective
   - Assign specific sub-questions to the new agent
   - Record the agent's contribution
4. Continue until all aspects are covered or generating new agents yields diminishing returns
5. Synthesize across all agents

#### Edge Cases & Error Handling
- Don't generate agents gratuitously — each new agent must address a real gap
- Maximum 7 total agents to prevent context bloat
- If an agent's contribution is weak: flag it, don't discard it silently

---

### 6.11 agent-as-judge-trace

**File(s):** `skills/agent-as-judge-trace/SKILL.md`
**Type:** New file

#### What it does
Agent-as-Judge uses the model to evaluate reasoning trajectories, providing intermediate rewards and critiques throughout the reasoning process. Unlike outcome-only evaluation, it assesses the journey — whether each reasoning step is valid, well-supported, and progressing toward the answer.

#### Interface / API
```
Invocation: /agent-as-judge-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Generate a primary reasoning path
3. After each major reasoning step, insert a judge evaluation:
   - Score the step's validity (1-5)
   - Critique weaknesses or gaps
   - Suggest corrections if needed
4. After the final answer, provide an overall trajectory assessment
5. Record both the reasoning and all judge evaluations in the trace

#### Edge Cases & Error Handling
- Judge evaluations should not dominate the trace — keep critiques concise
- If the judge and reasoner disagree irreconcilably: record both perspectives
- The judge is the same model — acknowledge the inherent limitation

---

### 6.12 cross-lingual-consistency-trace

**File(s):** `skills/cross-lingual-consistency-trace/SKILL.md`
**Type:** New file

#### What it does
Cross-Lingual Consistency generates reasoning paths in multiple languages and integrates them through majority voting. Different languages have different training data distributions and linguistic biases — reasoning across languages surfaces assumptions hidden in monolingual reasoning. Achieves 4.1–18.5% accuracy gains.

#### Interface / API
```
Invocation: /cross-lingual-consistency-trace <problem>
Output: memory/{question_name}.md
```

#### Logic / Algorithm
1. Restate the question
2. Generate the reasoning path in English (primary)
3. Re-generate reasoning in 2 additional languages (e.g., Spanish, Chinese, French, German, Japanese)
4. Compare conclusions across language paths — identify convergence and divergence
5. If all language paths agree: high confidence
6. If paths diverge: analyze the divergence — what assumptions differ per language?
7. Vote on the most consistent conclusion

#### Edge Cases & Error Handling
- If the problem is language-dependent (e.g., English grammar): note that cross-lingual reasoning may not add value
- Translation quality may affect reasoning quality in non-primary languages
- Default to 3 languages; if the model is clearly weaker in a language, note this and reduce weight

---

## 7. Data Model Changes

### 7.1 skills-manifest.json

**Change type:** Modified

Add 12 new entries to the `reasoning` array in alphabetical order:

```json
"agent-as-judge-trace",
"contrastive-cot-trace",
"cross-lingual-consistency-trace",
"divide-and-conquer-trace",
"dynamic-agent-generation-trace",
"elastic-reasoning-trace",
"focused-cot-trace",
"graph-of-thoughts-trace",
"iteration-of-thought-trace",
"least-to-most-trace",
"meta-prompting-trace",
"sketch-of-thought-trace"
```

No migration needed — additive change only.

---

## 8. API Changes

N/A — No API endpoints. These are pure prompt skills.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/graph-of-thoughts-trace/SKILL.md` | Graph-structured reasoning with aggregation capability |
| CREATE | `skills/meta-prompting-trace/SKILL.md` | Single-model conductor + expert panel |
| CREATE | `skills/elastic-reasoning-trace/SKILL.md` | Two-phase thinking+solution budget allocation |
| CREATE | `skills/contrastive-cot-trace/SKILL.md` | Valid+invalid reasoning demonstrations |
| CREATE | `skills/least-to-most-trace/SKILL.md` | Progressive subproblem solving |
| CREATE | `skills/iteration-of-thought-trace/SKILL.md` | Multi-round reasoning with summarization |
| CREATE | `skills/focused-cot-trace/SKILL.md` | Organize-then-reason structured approach |
| CREATE | `skills/divide-and-conquer-trace/SKILL.md` | Decompose-resolve-assemble architecture |
| CREATE | `skills/sketch-of-thought-trace/SKILL.md` | Minimal sketch-style reasoning steps |
| CREATE | `skills/dynamic-agent-generation-trace/SKILL.md` | On-the-fly agent specialization |
| CREATE | `skills/agent-as-judge-trace/SKILL.md` | Step-level trajectory evaluation |
| CREATE | `skills/cross-lingual-consistency-trace/SKILL.md` | Multilingual reasoning + voting |
| MODIFY | `skills-manifest.json` | Add 12 new entries to reasoning array |

**Summary:** 12 new files created, 1 file modified, 0 files deleted.

---

## 10. Testing Plan

### Unit Tests (Validation)
The existing `npm test` (validate.js) automatically covers:
- All 12 new skill folders contain a `SKILL.md` with valid YAML frontmatter
- All `name` fields match their folder names and pass `VALID_SKILL_NAME` regex
- All `description` fields are non-empty
- All `body` sections are non-empty
- All 12 skills are registered in `skills-manifest.json` under `reasoning`

No new test code required.

### Manual Smoke Tests
1. **graph-of-thoughts-trace:** Given a multi-faceted problem, verify the trace shows graph nodes, edges, and aggregation of merged thoughts
2. **meta-prompting-trace:** Given a complex problem, verify multiple expert roles contribute and conductor synthesizes
3. **elastic-reasoning-trace:** Verify two-phase structure with thinking budget and solution budget
4. **contrastive-cot-trace:** Verify both valid and invalid reasoning examples with corrections
5. **least-to-most-trace:** Verify subproblems ordered easiest-to-hardest with transfer between steps
6. **iteration-of-thought-trace:** Verify multiple rounds with intermediate summaries
7. **focused-cot-trace:** Verify organized context block followed by context-only reasoning
8. **divide-and-conquer-trace:** Verify three distinct phases: decompose, resolve, assemble
9. **sketch-of-thought-trace:** Verify compressed sketch-style steps with abbreviations
10. **dynamic-agent-generation-trace:** Verify agents are added as new perspectives are discovered
11. **agent-as-judge-trace:** Verify judge evaluations after each reasoning step
12. **cross-lingual-consistency-trace:** Verify reasoning in multiple languages with voting

---

## 11. Dependencies & External Services

| Dependency | Version | Purpose | Risk |
|------------|---------|---------|------|
| None | N/A | All reasoning is prompt-only | None |

---

## 12. Rollout & Deployment

- **Feature flags:** None — skills are passive until invoked by slash command
- **Breaking changes:** None — purely additive
- **Deployment order:** Single commit, single PR
- **Rollback procedure:** Revert the commit; skills are non-breaking additions

---

## 13. Open Questions

- [ ] Should `graph-of-thoughts-trace` be renamed to `graph-of-thought-trace` (singular "thought") to match existing naming patterns? Leaning toward current name to match research paper title.
- [ ] Should `dynamic-agent-generation-trace` be simplified to `agent-generation-trace` for brevity?
- [ ] Should we create an `autometareasoner` in this batch or defer to Batch 2 implementation?
- [ ] Should `cross-lingual-consistency-trace` default to 3 languages or let the user specify?

---

## 14. Alternatives Considered

### Alternative 1: Implement Batch 2 first, then this batch
- What: Implement the already-designed Batch 2 strategies (30 skills) before this batch
- Why rejected: This batch focuses on genuinely novel additions not covered by Batch 2. Both can be implemented independently. Batch 2 has significantly more scope (30+ skills vs 12).

### Alternative 2: Use the expanded PR #63 template for these skills
- What: Use the longer template with Intent, Implementation Details, Things Not to Do sections
- Why rejected: Would create template divergence from the 100+ existing trace skills. These should match the canonical pattern for consistency.

### Alternative 3: Create full meta-skill pairing versions for each
- What: Create both trace and -reasoning versions (24 total skills)
- Why rejected: These strategies are primarily standalone reasoning approaches, not meta-strategies that compose with other skills. Pairing versions add scope without clear use case.

### Alternative 4: Only implement the highest-impact 5-6 strategies
- What: Reduce scope to just graph-of-thoughts, meta-prompting, contrastive-cot, elastic-reasoning, and least-to-most
- Why rejected: All 12 add genuinely novel reasoning structures. Each fills a gap in the catalog. Implementation is template-based and efficient once the first one is done.
