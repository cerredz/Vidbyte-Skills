# Design Doc: Meta-Reasoning Skills Batch 2 — Advanced Prompt Engineering Strategies

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-18
**Last Updated:** 2026-05-18

---

## 1. Overview

This feature adds prompt-implementable reasoning skills derived from 13 advanced prompt engineering research clusters (A through M). Unlike Batch 1 (self-consistency, debate, etc.), these strategies span budget control, reasoning topologies, in-context learning, tool integration, dual-process architectures, context engineering, and memory organization. A central `/autometareasoner` skill is created to route users to the appropriate meta-skill from both Batch 1 and Batch 2, analogous to how `/autoreasoner` routes to individual reasoning strategies.

Each strategy is first classified as "prompt-implementable" (can be expressed purely through SKILL.md instructions) or "requires-training/architecture" (needs model retraining, RL, or architectural changes beyond prompts). Only prompt-implementable strategies become skills. The rest are documented as deferred.

---

## 2. Goals & Non-Goals

### Goals
- Classify all ~60 strategies across 13 clusters into "prompt-implementable" vs "requires-training/architecture"
- Create standalone reasoning trace skills for all prompt-implementable strategies
- Create a central `/autometareasoner` skill that knows when to use each meta-skill (from both Batch 1 and Batch 2)
- Register all new skills in `skills-manifest.json`
- Pass validation: `npm test`

### Non-Goals
- Implement strategies that require model training, RL, or architecture changes (documented as deferred)
- Create pairing meta-skills for Batch 2 (those from Batch 1 already exist)
- Scale variants (-small, -medium, -large) for the new skills
- Modify existing skill files

---

## 3. Background & Context

### Why this is being built now
Batch 1 created 18 skills covering 9 meta-strategies. This batch extends coverage to the broader prompt engineering research landscape from 2024–2025, spanning budget-controlled reasoning, structured topologies, dual-process thinking, and memory architectures. The rapid pace of research means many of these strategies are genuinely novel and not yet represented in any skill collection.

### Current state
- Batch 1 skills exist on `feat/prompt-engineering-reasoning-skills` (PR #63, draft)
- The `autoreasoner` skill routes to individual reasoning strategies but not meta-strategies
- No `/autometareasoner` skill exists yet

### Constraints
- All skills must be self-contained in SKILL.md (no external API dependencies)
- Skills are Type 1 (reasoning trace) — produce `memory/{question_name}.md` artifacts
- Skills must follow the existing SKILL.md template conventions

---

## 4. Requirements

### Functional Requirements
1. Create standalone reasoning trace skills for every prompt-implementable strategy
2. Create `/autometareasoner` — a meta-level router that:
   - Classifies the user's problem
   - Selects whether a meta-strategy or direct reasoning is appropriate
   - If meta: selects the best-fit meta-skill from all available (Batch 1 pairings + Batch 2 standalones)
   - If direct: delegates to `/autoreasoner`
   - Produces a trace artifact

### Non-Functional Requirements
- Same as Batch 1: prompt-only, no network calls, no secrets
- `/autometareasoner` must embed the full meta-skill catalog inline (same pattern as `autoreasoner`)

---

## 5. High-Level Design

### Strategy Classification

Each strategy is classified into one of three categories:
- **IMPLEMENT**: Can be expressed purely through prompt instructions in SKILL.md
- **DEFER-TRAIN**: Requires model training, RL, fine-tuning, or architecture changes
- **DEFER-INFRA**: Requires external infrastructure (simulators, tool APIs, agent frameworks)

### Implementation Scope

After classification, the following strategies will be implemented as standalone skills:

**From Cluster A (Budget Control):**
- A1. Budget Forcing — `budget-forcing-trace` [IMPLEMENT]
- A3. Chain of Draft — `chain-of-draft-trace` [IMPLEMENT]
- A4. Answer Convergence — `answer-convergence-trace` [IMPLEMENT]
- A7. Focused Chain-of-Thought — `focused-cot-trace` [IMPLEMENT]
- A8. Sketch-of-Thought — `sketch-of-thought-trace` [IMPLEMENT]

**From Cluster D (In-Context Learning):**
- D1. Retrieval-Augmented ICL — `reticl-trace` [IMPLEMENT]
- D2. Many-Shot ICL — `many-shot-icl-trace` [IMPLEMENT]

**From Cluster E (Structured Reasoning Topologies):**
- E1. Chain-of-Table — `chain-of-table-trace` [IMPLEMENT]
- E2. Contrastive CoT — `contrastive-cot-trace` [IMPLEMENT]
- E3. Least-to-Most Prompting — `least-to-most-trace` [IMPLEMENT]
- E4. Decomposed Prompting — `decomposed-prompting-trace` [IMPLEMENT]
- E5. Cross-Lingual Consistency — `cross-lingual-consistency-trace` [IMPLEMENT]
- E6. Adaptive Graph of Thoughts — `adaptive-got-trace` [IMPLEMENT]
- E7. Iteration of Thought — `iteration-of-thought-trace` [IMPLEMENT]
- E8. Divide-and-Conquer — `divide-and-conquer-trace` [IMPLEMENT]

**From Cluster F (Deep Research):**
- F1. Agentic Deep Research — `agentic-deep-research-trace` [IMPLEMENT]
- F4. Mind-Map Memory — `mind-map-memory-trace` [IMPLEMENT]

**From Cluster G (Multi-Agent):**
- G3. Chain-of-Agents — `chain-of-agents-trace` [IMPLEMENT]
- G4. Thought Communication — `thought-communication-trace` [IMPLEMENT]

**From Cluster H (Tool/Code Integration):**
- H2. Autonomous Code Integration — `autonomous-code-integration-trace` [IMPLEMENT]
- H3. Program of Thoughts — `program-of-thoughts-trace` [IMPLEMENT]

**From Cluster I (Cascade Inference):**
- I3. Difficulty-Aware Routing — `difficulty-aware-routing-trace` [IMPLEMENT]

**From Cluster J (Dual Process):**
- J1. Talker-Reasoner — `talker-reasoner-trace` [IMPLEMENT]
- J3. AlphaOne — `alphaone-trace` [IMPLEMENT]

**From Cluster K (Context Engineering):**
- K1. Intent Engineering — `intent-engineering-trace` [IMPLEMENT]
- K3. Self-Notes — `self-notes-trace` [IMPLEMENT]
- K4. Dynamic Cheatsheet — `dynamic-cheatsheet-trace` [IMPLEMENT]

**From Cluster M (Miscellaneous):**
- M2. Expert Persona PRISM Routing — `prism-routing-trace` [IMPLEMENT]
- M7. Generative Semantic Workspace — `gsw-trace` [IMPLEMENT]
- M8. Pre-Storage Reasoning — `pre-storage-reasoning-trace` [IMPLEMENT]
- M9. Temporal Semantic Memory — `tsm-trace` [IMPLEMENT]
- M10. Round-Wise Improvement (PDR) — `pdr-trace` [IMPLEMENT]

### Non-Implementable (Deferred)

| Strategy | Reason |
|----------|--------|
| A2. Elastic Reasoning | Requires training with budget-constrained rollout |
| A5. BudgetThinker | Requires training with control tokens + RL |
| A6. ES-CoT | Requires reward model for speculative rejection |
| B1-B6. Recurrent/Latent Depth | Requires transformer architecture changes |
| C1-C6. RLVR Paradigms | Requires RL training infrastructure |
| D3. RDES | Requires RL for demonstration selection |
| D5. Coreset Selection | Requires mathematical coreset computation |
| F2. WARP | Requires interleaved writing context (complex prompt but borderline) |
| F3. Test-Time Diffusion | Requires diffusion-style optimization |
| G1. ADAS/AFlow | Requires heuristic search over code-represented workflows |
| G2. EvoAgentX | Requires multi-framework integration |
| G5. Agent KB | Requires universal memory infrastructure |
| G6. APC | Requires plan caching infrastructure |
| G7. Lazy Agent Mitigation | Requires RL with Shapley values |
| G8. DRTAG | Requires dynamic agent generation infrastructure |
| H1. Tool-Integrated Thinking | Requires RL for tool invocation |
| H4. Self-Tooling Agent | Requires training |
| I1. Speculative Thinking | Requires large+small model orchestration |
| I2. SCoT | Requires draft-target model architecture |
| J2. Dualformer | Requires training with randomized traces |
| K2. Specification Engineering | Requires machine-readable corpus infrastructure |
| L1-L3. Embodied Reasoning | Requires simulation environments |
| M1. CoT as Mirage | Research finding, not a strategy |
| M3. Role Vectors | Requires representation engineering |
| M4. Multilingual Optimization | Requires automated prompt search |
| M5. Agentic Supernet | Requires differentiable architecture search |
| M6. Self-Evolving Survey | Survey paper, not a strategy |

### Flow: /autometareasoner

```
[User invokes /autometareasoner <problem>]
       |
       v
[Classify problem domain + complexity]
       |
       v
[Decide: meta-strategy needed or direct reasoning?]
       |
       ├── Direct → delegate to /autoreasoner
       |
       └── Meta → select best-fit meta-skill from:
              Batch 1: self-consistency, parallel-thinking, multi-agent-debate,
                       mixture-of-agents, self-rag, paradigm-routing, codeact,
                       step-back, curriculum-learning
              Batch 2: budget-forcing, chain-of-draft, contrastive-cot,
                       least-to-most, decomposed-prompting, cross-lingual-consistency,
                       adaptive-got, iteration-of-thought, divide-and-conquer,
                       agentic-deep-research, talker-reasoner, program-of-thoughts,
                       prism-routing, etc.
       |
       v
[Execute selected meta-skill → produce trace]
```

---

## 6. Detailed Design

### 6.1 budget-forcing-trace

**File(s):** `skills/budget-forcing-trace/SKILL.md`
**Type:** New file
**Cluster:** A1

#### What it does
Implements Budget Forcing — controls reasoning depth by injecting deliberate pause/check signals. When the model reaches a conclusion, it appends "Wait" to force double-checking, or terminates early when confidence is high. This deceptively simple trick (injecting a single token) became one of the most reproduced findings of 2025.

#### Logic / Algorithm
1. Restate question, set an internal reasoning budget
2. Reason through the problem step by step
3. Before stating final answer, inject a deliberate pause: "Wait, let me double-check..."
4. Re-examine the reasoning: any leaps, missing evidence, alternative answers?
5. If error found, correct it. If confirmed, state the answer with confidence
6. Write trace showing initial reasoning, the "Wait" checkpoint, and any corrections

---

### 6.2 chain-of-draft-trace

**File(s):** `skills/chain-of-draft-trace/SKILL.md`
**Type:** New file
**Cluster:** A3

#### What it does
Implements Chain of Draft — limits each reasoning step to ~5 words, challenging the assumption that verbose reasoning is necessary. Paired with the insight that a large fraction of reasoning tokens are redundant.

#### Logic / Algorithm
1. Restate question
2. Break into sub-steps
3. For each sub-step, write exactly one terse line (~5 words max) that captures the essential insight
4. No elaboration, no hedging, no restating — only the core reasoning nugget
5. After all draft steps, expand only the final answer to normal prose
6. Write trace showing compressed draft steps and final expansion

---

### 6.3 answer-convergence-trace

**File(s):** `skills/answer-convergence-trace/SKILL.md`
**Type:** New file
**Cluster:** A4

#### What it does
Monitors when intermediate answers stabilize across reasoning steps, using convergence as a signal to terminate reasoning early — preventing unnecessary steps.

#### Logic / Algorithm
1. Restate question
2. Begin reasoning iteratively
3. After each major reasoning step, state "Intermediate answer at step N: [conclusion so far]"
4. Compare with previous intermediate answers
5. When the answer has remained stable for 2 consecutive steps, terminate and declare final answer
6. Record convergence point and steps saved in trace

---

### 6.4 focused-cot-trace

**File(s):** `skills/focused-cot-trace/SKILL.md`
**Type:** New file
**Cluster:** A7

#### What it does
First organizes essential information into a concise structured context, then guides reasoning exclusively over that context — reducing tokens by 2-3x while preserving strong reasoning.

#### Logic / Algorithm
1. Read the query and extract all essential information
2. Structure it into a compressed context block (facts, constraints, what's asked)
3. Reason exclusively over this compressed context — do not re-describe or re-read the original
4. Reference context items by number/label for efficiency
5. Write trace showing the compressed context and the focused reasoning

---

### 6.5 sketch-of-thought-trace

**File(s):** `skills/sketch-of-thought-trace/SKILL.md`
**Type:** New file
**Cluster:** A8

#### What it does
Cognitive-psychology-inspired paradigm producing minimal, sketch-style intermediate steps rather than full verbalizations. Like Chain of Draft, challenges the premise that output length correlates with reasoning quality.

#### Logic / Algorithm
1. Restate question in one line
2. Produce sketch-style reasoning: abbreviations, symbols, arrows, fragments — not full sentences
3. Each sketch line captures the essential cognitive move without prose
4. Final answer in full prose, connected to the sketch
5. Write trace showing the sketch and the translation to full answer

---

### 6.6 reticl-trace

**File(s):** `skills/reticl-trace/SKILL.md`
**Type:** New file
**Cluster:** D1

#### What it does
Retrieval-Augmented In-Context Learning — dynamically curates tailored demonstrations for each specific input rather than using static pre-defined examples. The model simulates the retrieval step by reasoning about what demonstrations would be most helpful, then generating those as in-context examples.

#### Logic / Algorithm
1. Analyze the query: what type of reasoning does it require? What domain knowledge?
2. Simulate retrieval: write 2-3 tailored demonstration examples that show:
   - A similar problem solved correctly
   - The reasoning pattern that applies
3. Use these demonstrations as in-context guidance for solving the actual problem
4. Write trace showing curated demonstrations and the solution

---

### 6.7 many-shot-icl-trace

**File(s):** `skills/many-shot-icl-trace/SKILL.md`
**Type:** New file
**Cluster:** D2

#### What it does
Uses many demonstration examples (not just a few) for in-context learning, leveraging extended context windows. Retains key advantages over fine-tuning: training-free, applicable to proprietary models.

#### Logic / Algorithm
1. For the given problem type, generate 5-8 demonstration examples
2. Each demo shows: similar problem, step-by-step solution, final answer
3. After demonstrations, solve the actual problem using the pattern learned from demos
4. Write trace showing the many-shot demonstrations and the target solution

---

### 6.8 chain-of-table-trace

**File(s):** `skills/chain-of-table-trace/SKILL.md`
**Type:** New file
**Cluster:** E1

#### What it does
Incorporates intermediate tables from tabular operations as a proxy for intermediate thoughts. Operations on structured table data become the reasoning chain, directly applicable to table-based question answering.

#### Logic / Algorithm
1. If the problem involves tabular/comparative data, represent it as a markdown table
2. Perform operations on the table: filter, sort, group, join, aggregate
3. Each table operation is a reasoning step — the table IS the thought trace
4. The final table or derived value is the answer
5. Write trace showing the table chain

---

### 6.9 contrastive-cot-trace

**File(s):** `skills/contrastive-cot-trace/SKILL.md`
**Type:** New file
**Cluster:** E2

#### What it does
Provides both valid AND invalid reasoning demonstrations, guiding the model to reduce reasoning mistakes. Shows improvements of 9.8-16 points over conventional CoT by learning from what not to do.

#### Logic / Algorithm
1. For the problem, generate TWO reasoning paths:
   - Path A: A deliberately flawed reasoning chain showing a common mistake
   - Path B: The correct reasoning chain, noting where Path A went wrong
2. Diagnose the specific error in Path A: what assumption was wrong? What step was skipped?
3. Use the contrast to strengthen the correct answer
4. Write trace showing both paths and the error diagnosis

---

### 6.10 least-to-most-trace

**File(s):** `skills/least-to-most-trace/SKILL.md`
**Type:** New file
**Cluster:** E3

#### What it does
Breaks down a complex problem into simpler subproblems and solves them in sequence, where each subproblem's solution facilitates the next. Generalizes to harder problems than those seen in prompts.

#### Logic / Algorithm
1. Analyze the complex problem and identify natural subproblems ordered from easiest to hardest
2. Solve Subproblem 1 (easiest) — the answer becomes input for Subproblem 2
3. Solve Subproblem 2 using Subproblem 1's answer
4. Continue until reaching the original complex problem
5. Write trace showing the chain of subproblems and their solutions feeding forward

---

### 6.11 decomposed-prompting-trace

**File(s):** `skills/decomposed-prompting-trace/SKILL.md`
**Type:** New file
**Cluster:** E4

#### What it does
Allows diverse decomposition structures including recursion and non-linear structures — unlike least-to-most which is constrained to sequential ordering. A decomposer delegates to specialist sub-task handlers.

#### Logic / Algorithm
1. Analyze the problem and identify its decomposition structure (sequential, parallel, recursive, tree)
2. Define specialist sub-handlers for each component (e.g., "data analyst", "logic checker", "synthesizer")
3. Delegate each sub-task to its specialist, collecting results
4. Assemble the final answer from specialist outputs
5. Write trace showing the decomposition structure and each specialist's work

---

### 6.12 cross-lingual-consistency-trace

**File(s):** `skills/cross-lingual-consistency-trace/SKILL.md`
**Type:** New file
**Cluster:** E5

#### What it does
Generates reasoning paths in multiple languages and integrates them through majority voting. Linguistic biases in training corpora can cause semantic drift; multi-language reasoning diversifies traces, achieving 4.1-18.5% accuracy gains.

#### Logic / Algorithm
1. Reason through the problem in English (primary language)
2. Reason through the same problem in 2-3 additional languages, each independently
3. Compare conclusions across languages — are they consistent?
4. If consistent: high confidence. If divergent: the disagreement reveals a linguistic bias or ambiguity
5. Integrate via majority vote with explicit cross-language comparison
6. Write trace showing all language paths and the cross-language analysis

---

### 6.13 adaptive-got-trace

**File(s):** `skills/adaptive-got-trace/SKILL.md`
**Type:** New file
**Cluster:** E6

#### What it does
Dynamically constructs an acyclic directed graph of thoughts, using per-instance criteria for node expansion and stopping. Unifies chain, tree, and graph reasoning within a single adaptive framework.

#### Logic / Algorithm
1. Start with the question as the root node
2. From each node, decide: expand (generate child thoughts), branch (generate alternatives), or stop (sufficiently resolved)
3. Each child thought addresses a sub-question, alternative, or implication
4. Connect related thoughts with directed edges showing dependency
5. When all leaf nodes are resolved, trace the graph to synthesize the answer
6. Write trace as a structured graph (node IDs with parent/child relationships)

---

### 6.14 iteration-of-thought-trace

**File(s):** `skills/iteration-of-thought-trace/SKILL.md`
**Type:** New file
**Cluster:** E7

#### What it does
Transforms reasoning into a multi-round inference process with intermediate summarization, extending context arbitrarily. Summarizes completed reasoning blocks before continuing with the next iteration.

#### Logic / Algorithm
1. Round 1: Initial reasoning on the full problem — produce partial analysis
2. Summarize Round 1 into a compressed block
3. Round 2: Continue reasoning from the summary, addressing gaps — produce updated analysis
4. Summarize Round 2, compressing previous work
5. Round N: Final round addresses remaining gaps
6. After all rounds, produce final answer from accumulated summaries
7. Write trace showing each round, its summary, and the progressive refinement

---

### 6.15 divide-and-conquer-trace

**File(s):** `skills/divide-and-conquer-trace/SKILL.md`
**Type:** New file
**Cluster:** E8

#### What it does
Disentangles task decomposition, sub-task resolution, and solution assembly into three distinct processes. Theoretical analysis reveals this extends the expressive power of fixed-depth Transformers.

#### Logic / Algorithm
1. **Phase 1 — Decompose:** Break the problem into independent sub-tasks. Define inputs, outputs, and dependencies for each.
2. **Phase 2 — Resolve:** Solve each sub-task independently. No cross-talk between sub-tasks during resolution.
3. **Phase 3 — Assemble:** Combine sub-task solutions into the final answer. Resolve any interface mismatches.
4. Write trace showing the three phases clearly separated

---

### 6.16 agentic-deep-research-trace

**File(s):** `skills/agentic-deep-research-trace/SKILL.md`
**Type:** New file
**Cluster:** F1

#### What it does
Implements an agentic search-read-synthesize loop. Rather than one-shot retrieval, plans a series of steps: issuing search queries (simulated), consulting documents (simulated), and refining understanding via iterative retrieval and reasoning.

#### Logic / Algorithm
1. Analyze the research question and plan an investigation strategy
2. Iteration 1: Issue search query → review results → extract key findings
3. Iteration 2: Refine query based on gaps → review → extract
4. Iteration 3-N: Continue until research question is sufficiently answered
5. Synthesize all findings into a comprehensive answer with cited sources
6. Write trace showing the research trajectory and synthesis

---

### 6.17 mind-map-memory-trace

**File(s):** `skills/mind-map-memory-trace/SKILL.md`
**Type:** New file
**Cluster:** F4

#### What it does
Uses mind-map knowledge graphs to correct errors and maintain coherence across long reasoning chains. The growing knowledge graph serves as a persistent scratchpad that self-organizes.

#### Logic / Algorithm
1. Start with the central question as the mind map root
2. As reasoning proceeds, add nodes for: facts, assumptions, sub-questions, evidence, conclusions
3. Connect related nodes with labeled edges (supports, contradicts, depends-on, implies)
4. After each reasoning segment, review the mind map for: contradictions, gaps, unsupported claims
5. Use the mind map to structure the final answer — trace a coherent path through the graph
6. Write trace with the mind map structure and the traced answer path

---

### 6.18 chain-of-agents-trace

**File(s):** `skills/chain-of-agents-trace/SKILL.md`
**Type:** New file
**Cluster:** G3

#### What it does
Multiple worker agents sequentially communicate to handle different segments of text, followed by a manager agent that synthesizes. Up to 10% improvement over RAG and full-context baselines.

#### Logic / Algorithm
1. If the context is long/complex, segment it into chunks
2. Worker 1 reads chunk 1, processes it, passes key findings to Worker 2
3. Worker 2 reads chunk 2 + Worker 1's findings, processes, passes forward
4. Continue through all workers
5. Manager agent receives final worker's output + all key findings, synthesizes final answer
6. Write trace showing the worker chain and synthesis

---

### 6.19 thought-communication-trace

**File(s):** `skills/thought-communication-trace/SKILL.md`
**Type:** New file
**Cluster:** G4

#### What it does
Enables agents to interact directly mind-to-mind via shared and private latent thoughts. Communication beyond language directly benefits collaboration.

#### Logic / Algorithm
1. Define 3 agents analyzing the same problem from different perspectives
2. Each agent maintains: shared thoughts (visible to all) and private thoughts (internal)
3. Agents read each other's shared thoughts and update their own
4. After multiple rounds of thought sharing, converge on a synthesis
5. Write trace showing the evolution of shared thoughts across agents

---

### 6.20 autonomous-code-integration-trace

**File(s):** `skills/autonomous-code-integration-trace/SKILL.md`
**Type:** New file
**Cluster:** H2

#### What it does
Enables autonomous decision between CoT reasoning and code execution — the model independently develops its methodology-selection strategy without external instruction.

#### Logic / Algorithm
1. Analyze the problem: does it benefit more from CoT reasoning or code execution?
2. Declare the methodology choice with justification
3. If CoT: reason step-by-step in natural language
4. If Code: express the reasoning as executable Python, use error feedback, self-debug
5. If hybrid: use code for computation-heavy parts, CoT for conceptual parts
6. Write trace showing the methodology decision and execution

---

### 6.21 program-of-thoughts-trace

**File(s):** `skills/program-of-thoughts-trace/SKILL.md`
**Type:** New file
**Cluster:** H3

#### What it does
Disentangles computation from reasoning: writes a program that expresses the reasoning logic, delegates numerical computation to a Python interpreter. The model focuses on high-level logic; the interpreter handles arithmetic.

#### Logic / Algorithm
1. Analyze the problem — separate conceptual reasoning from numerical computation
2. Express the high-level reasoning logic as natural language
3. For numerical/computational parts, write Python code that encodes the logic
4. Execute the code (simulated), record outputs
5. Combine conceptual reasoning + computed results into final answer
6. Write trace separating reasoning prose from code blocks

---

### 6.22 difficulty-aware-routing-trace

**File(s):** `skills/difficulty-aware-routing-trace/SKILL.md`
**Type:** New file
**Cluster:** I3

#### What it does
Estimates query difficulty and routes to appropriate reasoning depth — simple queries get lightweight processing, complex ones get full multi-step reasoning with tools.

#### Logic / Algorithm
1. Assess problem difficulty on a simple scale: Trivial, Simple, Moderate, Complex, Very Complex
2. Route based on difficulty:
   - Trivial/Simple: Direct answer, minimal reasoning
   - Moderate: Standard CoT reasoning
   - Complex: Full strategy application with verification
   - Very Complex: Multi-round reasoning with decomposition
3. Record the difficulty assessment and routing decision
4. Write trace showing difficulty classification and routed reasoning

---

### 6.23 talker-reasoner-trace

**File(s):** `skills/talker-reasoner-trace/SKILL.md`
**Type:** New file
**Cluster:** J1

#### What it does
Implements System 1/System 2 dual-process architecture: a Talker handles fast-path natural language interaction while a Reasoner performs slower multi-step reasoning and planning, sharing common memory.

#### Logic / Algorithm
1. **Talker Phase (System 1):** Rapid initial assessment — what's the question, what's the intuition, what's the likely answer? Fast, surface-level.
2. **Reasoner Phase (System 2):** Slow, deliberate multi-step reasoning. Verify or challenge the Talker's intuition. Apply rigorous analysis.
3. **Integration:** Compare Talker and Reasoner conclusions. Where they agree = high confidence. Where they disagree = flag for deeper analysis.
4. Write trace showing both systems and the integration

---

### 6.24 alphaone-trace

**File(s):** `skills/alphaone-trace/SKILL.md`
**Type:** New file
**Cluster:** J3

#### What it does
A routing system that decides per query whether to invoke slow deliberate reasoning or fast direct response, based on estimated query difficulty — combining both paradigms without retraining.

#### Logic / Algorithm
1. Estimate query difficulty and type
2. Route to Fast: If straightforward, answer directly with brief reasoning
3. Route to Slow: If complex, invoke full deliberate reasoning with verification
4. Record the routing decision and confidence
5. Write trace showing the routing choice and execution

---

### 6.25 intent-engineering-trace

**File(s):** `skills/intent-engineering-trace/SKILL.md`
**Type:** New file
**Cluster:** K1

#### What it does
Encodes organizational goals, values, and trade-off hierarchies into the reasoning process — ensuring the agent pursues the right outcomes, not just executes correctly.

#### Logic / Algorithm
1. Before reasoning, explicitly elicit or define: what are the goals? What values matter? What trade-offs are acceptable?
2. Structure these as an intent hierarchy: primary goal → secondary goals → constraints
3. Reason through the problem with the intent hierarchy as a decision filter
4. At each decision point, check: does this serve the primary goal? Does it violate any constraint?
5. Write trace showing the intent hierarchy and how it shaped each decision

---

### 6.26 self-notes-trace

**File(s):** `skills/self-notes-trace/SKILL.md`
**Type:** New file
**Cluster:** K3

#### What it does
Allows the model to insert reasoning notes anywhere in the reasoning process — not just before answering. Enables a form of working memory that tracks state as reasoning proceeds.

#### Logic / Algorithm
1. Begin reasoning through the problem
2. At any point where an observation, caveat, or state-tracking is needed, insert `[NOTE: ...]`
3. Notes can be: reminders, partial conclusions, flags, state trackers, open questions
4. Later reasoning steps can reference earlier notes
5. Before final answer, review all notes — resolve open questions, address flags
6. Write trace with inline notes visible

---

### 6.27 dynamic-cheatsheet-trace

**File(s):** `skills/dynamic-cheatsheet-trace/SKILL.md`
**Type:** New file
**Cluster:** K4

#### What it does
Maintains a living "playbook" through incremental delta updates rather than monolithic rewrites. Prevents context collapse while growing domain-specific tactics.

#### Logic / Algorithm
1. Start with an initial analysis of the problem domain
2. Maintain a "cheatsheet" section that grows incrementally as reasoning proceeds
3. Each new insight is added as a delta to the cheatsheet, not a rewrite
4. The cheatsheet accumulates: patterns identified, rules discovered, counterexamples, heuristics
5. Before final answer, review the cheatsheet for patterns that inform the conclusion
6. Write trace showing the cheatsheet evolution alongside the reasoning

---

### 6.28 prism-routing-trace

**File(s):** `skills/prism-routing-trace/SKILL.md`
**Type:** New file
**Cluster:** M2

#### What it does
Expert personas improve alignment but can damage accuracy. PRISM routing decides per-query whether an expert persona will help or hurt performance, rather than blanket assignment.

#### Logic / Algorithm
1. Analyze the query: would an expert persona help (domain-specific expertise needed) or hurt (persona distorts neutral reasoning)?
2. If persona helps: adopt the most relevant expert persona and reason from that perspective
3. If persona hurts: reason as a neutral, objective analyst
4. Record the routing decision with justification
5. Write trace showing the persona decision and its effect on reasoning

---

### 6.29 gsw-trace

**File(s):** `skills/gsw-trace/SKILL.md`
**Type:** New file
**Cluster:** M7

#### What it does
Generative Semantic Workspace — builds structured, interpretable representations of evolving situations. Outperforms RAG-based baselines by up to 20% while reducing context tokens by 51%.

#### Logic / Algorithm
1. As information about the problem accumulates, build a structured semantic workspace:
   - Entities: key actors, objects, concepts
   - Relations: how entities connect
   - Events: what happened, in what sequence
   - States: current status of each entity
2. Update the workspace as new reasoning/information arrives
3. Use the workspace to answer queries by querying the structured representation
4. Write trace showing the workspace structure and query resolution

---

### 6.30 pre-storage-reasoning-trace

**File(s):** `skills/pre-storage-reasoning-trace/SKILL.md`
**Type:** New file
**Cluster:** M8

#### What it does
Shifts inference burden to memory storage stage — does heavy reasoning at write time so retrieval at query time is cheap and fast.

#### Logic / Algorithm
1. When receiving new information, process it deeply immediately:
   - Extract key facts and implications
   - Connect to existing knowledge
   - Pre-compute answers to likely follow-up questions
   - Index for efficient retrieval
2. Store the processed, reasoned-about version, not the raw input
3. When queried later, retrieve pre-computed answers with minimal additional reasoning
4. Write trace showing the pre-storage reasoning and the efficient retrieval

---

### 6.31 tsm-trace

**File(s):** `skills/tsm-trace/SKILL.md`
**Type:** New file
**Cluster:** M9

#### What it does
Temporal Semantic Memory — tracks not just what happened but when and for how long. Duration-aware consolidation and semantic-time grounding enable better multi-session understanding.

#### Logic / Algorithm
1. When reasoning about events or sequences, attach temporal metadata:
   - Timestamp: when did this happen?
   - Duration: how long did it last?
   - Sequence: what happened before/after?
   - Relevance-decay: how does importance change over time?
2. Use this temporal structure to reason about sequences, causality, and change
3. Write trace with explicit temporal annotations

---

### 6.32 pdr-trace

**File(s):** `skills/pdr-trace/SKILL.md`
**Type:** New file
**Cluster:** M10

#### What it does
Frames inference as a round-wise improvement operator under explicit token budgets. Holds per-call budget fixed while varying total compute across rounds. Delivers +11% on AIME 2024, +9% on AIME 2025.

#### Logic / Algorithm
1. Define the per-round token budget (e.g., 500 tokens for reasoning per round)
2. Round 1: Reason within budget, produce interim answer and identify gaps
3. Round 2: Address gaps within budget, produce improved answer
4. Round N: Continue until answer stabilizes or budget exhausted
5. Compare answers across rounds to measure improvement
6. Write trace showing each round's budget, reasoning, and improvement delta

---

### 6.33 autometareasoner (Central Meta-Skill)

**File(s):** `skills/autometareasoner/SKILL.md`
**Type:** New file

#### What it does
Central routing skill analogous to `autoreasoner` but for meta-skills. Analyzes the user's problem and decides: should a meta-strategy be used, or direct reasoning? If meta, which one from the full catalog of Batch 1 + Batch 2 meta-skills? If direct, delegates to `autoreasoner`.

#### Catalog Structure
The `/autometareasoner` skill embeds a catalog of all available meta-skills organized by purpose:

**When to use a meta-skill vs direct reasoning:**
- Use a meta-skill when: the problem benefits from structured process control (budgets, multiple passes, verification, decomposition, routing, or ensemble methods)
- Use direct reasoning when: the problem is straightforward, well-defined, and benefits from a single focused reasoning strategy

**Meta-Skill Catalog (Batch 1 + Batch 2):**

| Meta-Skill | Category | When to Use |
|-----------|----------|------------|
| `self-consistency-pairing` | Ensemble | Need confidence through multiple independent paths |
| `parallel-thinking-pairing` | Structure | Problem decomposes naturally into sub-problems |
| `multi-agent-debate-pairing` | Adversarial | Need perspectives to challenge each other |
| `mixture-of-agents-pairing` | Refinement | Need progressive quality improvement |
| `self-rag-pairing` | Evidence | Need explicit evidence grounding |
| `paradigm-routing-pairing` | Routing | Unsure which reasoning paradigm fits best |
| `codeact-pairing` | Code | Problem benefits from executable reasoning |
| `step-back-pairing` | Abstraction | Risk of getting lost in details |
| `curriculum-learning-pairing` | Scaffolding | Problem too complex for direct attack |
| `budget-forcing-trace` | Budget | Need to force double-checking |
| `chain-of-draft-trace` | Efficiency | Need minimal, terse reasoning |
| `answer-convergence-trace` | Efficiency | Need early stopping when answer stabilizes |
| `focused-cot-trace` | Efficiency | Information can be compressed before reasoning |
| `sketch-of-thought-trace` | Efficiency | Need cognitive-minimal reasoning |
| `contrastive-cot-trace` | Error Prevention | Risk of common reasoning mistakes |
| `least-to-most-trace` | Structure | Sequential from easy to hard |
| `decomposed-prompting-trace` | Structure | Non-linear decomposition needed |
| `cross-lingual-consistency-trace` | Robustness | Multi-language reduces bias |
| `adaptive-got-trace` | Structure | Dynamic graph of thoughts needed |
| `iteration-of-thought-trace` | Depth | Need indefinite reasoning depth |
| `divide-and-conquer-trace` | Structure | Clean separation of decompose-resolve-assemble |
| `agentic-deep-research-trace` | Research | Multi-step investigation needed |
| `mind-map-memory-trace` | Memory | Need persistent knowledge graph |
| `chain-of-agents-trace` | Multi-Agent | Long context, worker-manager pattern |
| `thought-communication-trace` | Multi-Agent | Multi-perspective thought sharing |
| `autonomous-code-integration-trace` | Code/Reasoning | Auto-decide CoT vs code |
| `program-of-thoughts-trace` | Code | Separate computation from reasoning |
| `difficulty-aware-routing-trace` | Routing | Auto-scale reasoning to problem difficulty |
| `talker-reasoner-trace` | Dual Process | Fast intuition + slow verification |
| `alphaone-trace` | Routing | Auto-decide fast vs slow mode |
| `intent-engineering-trace` | Alignment | Explicit goal/value hierarchy needed |
| `self-notes-trace` | Memory | Need working memory during reasoning |
| `dynamic-cheatsheet-trace` | Memory | Accumulate patterns during reasoning |
| `prism-routing-trace` | Routing | Auto-decide persona vs neutral |
| `gsw-trace` | Memory | Structured semantic workspace needed |
| `pre-storage-reasoning-trace` | Memory | Pre-process info for efficient retrieval |
| `tsm-trace` | Memory | Temporal sequence tracking needed |
| `pdr-trace` | Budget | Round-wise improvement under token budget |

#### Logic / Algorithm
1. Detect invocation: `/autometareasoner <problem>`
2. Classify the problem's complexity and structure:
   - Is a meta-strategy needed? (complex, multi-faceted, high-stakes, needs verification)
   - Or is direct reasoning sufficient? (straightforward, well-defined, single-domain)
3. If direct: respond with "Use `/autoreasoner` for direct strategy selection"
4. If meta: match problem characteristics against the meta-skill catalog and select the best fit
5. Execute the selected meta-skill on the user's problem
6. Write trace with routing decision and execution

---

## 7. Data Model Changes

### 7.1 skills-manifest.json

**Change type:** Modified

Add entries for all 33 new skills to the `reasoning` array.

---

## 8. API Changes

N/A — pure prompt skills.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/budget-forcing-trace/SKILL.md` | A1. Budget Forcing |
| CREATE | `skills/chain-of-draft-trace/SKILL.md` | A3. Chain of Draft |
| CREATE | `skills/answer-convergence-trace/SKILL.md` | A4. Answer Convergence |
| CREATE | `skills/focused-cot-trace/SKILL.md` | A7. Focused CoT |
| CREATE | `skills/sketch-of-thought-trace/SKILL.md` | A8. Sketch-of-Thought |
| CREATE | `skills/reticl-trace/SKILL.md` | D1. RetICL |
| CREATE | `skills/many-shot-icl-trace/SKILL.md` | D2. Many-Shot ICL |
| CREATE | `skills/chain-of-table-trace/SKILL.md` | E1. Chain-of-Table |
| CREATE | `skills/contrastive-cot-trace/SKILL.md` | E2. Contrastive CoT |
| CREATE | `skills/least-to-most-trace/SKILL.md` | E3. Least-to-Most |
| CREATE | `skills/decomposed-prompting-trace/SKILL.md` | E4. Decomposed Prompting |
| CREATE | `skills/cross-lingual-consistency-trace/SKILL.md` | E5. Cross-Lingual Consistency |
| CREATE | `skills/adaptive-got-trace/SKILL.md` | E6. Adaptive GoT |
| CREATE | `skills/iteration-of-thought-trace/SKILL.md` | E7. Iteration of Thought |
| CREATE | `skills/divide-and-conquer-trace/SKILL.md` | E8. Divide-and-Conquer |
| CREATE | `skills/agentic-deep-research-trace/SKILL.md` | F1. Agentic Deep Research |
| CREATE | `skills/mind-map-memory-trace/SKILL.md` | F4. Mind-Map Memory |
| CREATE | `skills/chain-of-agents-trace/SKILL.md` | G3. Chain-of-Agents |
| CREATE | `skills/thought-communication-trace/SKILL.md` | G4. Thought Communication |
| CREATE | `skills/autonomous-code-integration-trace/SKILL.md` | H2. Autonomous Code Integration |
| CREATE | `skills/program-of-thoughts-trace/SKILL.md` | H3. Program of Thoughts |
| CREATE | `skills/difficulty-aware-routing-trace/SKILL.md` | I3. Difficulty-Aware Routing |
| CREATE | `skills/talker-reasoner-trace/SKILL.md` | J1. Talker-Reasoner |
| CREATE | `skills/alphaone-trace/SKILL.md` | J3. AlphaOne |
| CREATE | `skills/intent-engineering-trace/SKILL.md` | K1. Intent Engineering |
| CREATE | `skills/self-notes-trace/SKILL.md` | K3. Self-Notes |
| CREATE | `skills/dynamic-cheatsheet-trace/SKILL.md` | K4. Dynamic Cheatsheet |
| CREATE | `skills/prism-routing-trace/SKILL.md` | M2. PRISM Routing |
| CREATE | `skills/gsw-trace/SKILL.md` | M7. GSW |
| CREATE | `skills/pre-storage-reasoning-trace/SKILL.md` | M8. Pre-Storage Reasoning |
| CREATE | `skills/tsm-trace/SKILL.md` | M9. Temporal Semantic Memory |
| CREATE | `skills/pdr-trace/SKILL.md` | M10. PDR Round-Wise Improvement |
| CREATE | `skills/autometareasoner/SKILL.md` | Central meta-skill router |
| MODIFY | `skills-manifest.json` | Add 33 new entries |

**Summary:** 33 new files created, 1 file modified, 0 files deleted.

---

## 10. Testing Plan

### Unit Tests (Validation)
- `npm test` validates all new SKILL.md files for correct frontmatter, naming, and manifest registration

### Manual QA
1. Invoke each skill with a sample problem and verify trace artifact is produced
2. Test `/autometareasoner` with problems that should route to meta vs direct
3. Test `/autometareasoner` with ambiguous problems to verify clarification behavior

---

## 11. Dependencies & External Services

None — all skills are prompt-only.

---

## 12. Rollout & Deployment

- No feature flags, no breaking changes
- Single PR, single merge

---

## 13. Open Questions

- [ ] Should any of the "DEFER-TRAIN" strategies get prompt-only approximations?
- [ ] Should `/autometareasoner` also embed the full `autoreasoner` strategy catalog for direct routing?
- [ ] Should batch 2 skills also get pairing variants with the full catalog? (Deferred — would be ~30 pairing × 100+ catalog entries = massive)

---

## 14. Alternatives Considered

### Alternative 1: Implement all ~60 strategies regardless of feasibility
- **Why rejected:** Strategies requiring RL, architecture changes, or external infrastructure cannot be expressed in pure prompts. Attempting to do so would produce misleading skills that don't actually implement the research.

### Alternative 2: Create pairing skills for every batch 2 strategy
- **Why rejected:** Would create ~30 additional pairing skills embedding the full 100+ catalog, each ~400 lines. The marginal value is low since batch 2 strategies are already meta-level — stacking another meta-layer on top creates diminishing returns.

### Alternative 3: Merge /autometareasoner into /autoreasoner
- **Why rejected:** Different levels of abstraction. `/autoreasoner` selects individual reasoning strategies (First Principles, Bayesian, etc.). `/autometareasoner` selects process-level strategies (budget control, decomposition, routing). Merging them would create a confusing catalog with 150+ entries at different abstraction levels.
