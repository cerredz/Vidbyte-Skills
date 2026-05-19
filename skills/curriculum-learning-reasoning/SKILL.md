---
name: curriculum-learning-reasoning
description: >
  Meta-skill pairing curriculum learning scaffolding with any Vidbyte strategy.
  Designs easy-to-hard proxy problems, solves each with the selected strategy,
  builds toward target through progressive difficulty, and records transfer
  insights at each step. Use when the user invokes /curriculum-learning-reasoning
  or needs incremental reasoning buildup instead of frontal assault on complex problems.
---

# /curriculum-learning-reasoning — Curriculum Learning Meta-Reasoner

## Goal

This meta-skill applies the easy-to-hard curriculum learning paradigm to reasoning. When the user presents a complex target problem, you design a sequence of 3-5 proxy problems ordered from easiest to hardest that build the component skills and insights needed for the final target. You select a Vidbyte reasoning strategy best suited to the problem type, then solve each proxy problem using that strategy, recording transfer insights at every step. The accumulated understanding from the stepping stones is then brought to bear on the target problem, producing a solution that leverages the curriculum rather than attempting a frontal assault. The work is complete when the user can see how each easier problem contributed to the final solution, with a visible progression trace that makes the reasoning path auditable.

Every curriculum you design respects genuine progressive difficulty — each step extends the previous one by adding a dimension of complexity, reducing simplifying assumptions, or introducing a more constrained variant. You do not present minor variations as distinct stepping stones; each must add a qualitatively new challenge. The fading schedule ensures that early problems receive full attention and detailed solution, while later problems progressively shift more of the reasoning burden onto the accumulated understanding from prior steps, preventing overfitting to easy problems and ensuring transfer to the target.

## Intent

Frontal assault on complex reasoning problems often fails because the solver attempts to hold too many interacting constraints, unknown variables, and domain-specific mechanisms in mind simultaneously. Curriculum learning, grounded in the research finding that LLMs build reasoning skills incrementally when trained from easy to hard tasks (Parashar et al. 2025, SATURN), offers an alternative: decompose the problem into a sequence of simpler problems that build the necessary component understanding step by step. This meta-skill operationalizes that insight for single-problem reasoning — it does not train a model over multiple examples, but instead scaffolds a single reasoning session so that the solution to each stepping stone provides the conceptual tools for the next.

The intent is to replace "think harder about the hard problem" with "think carefully about easier problems that teach you what you need for the hard problem." By the time you reach the target, you have already solved three to five problems that each exercised a piece of the target's difficulty, and you have explicit transfer notes connecting each proxy's lessons to the target. This approach is especially valuable for multi-domain problems, problems with deep technical dependencies, and problems where the user's current understanding is insufficient for a direct solution — the standard cases where a direct strategy application would produce shallow or incomplete reasoning.

## Background — What Is Curriculum Learning Reasoning

Curriculum learning is the principle of training or learning on tasks ordered from easiest to hardest rather than tackling difficult tasks immediately. In the machine learning context, Parashar et al. (2025) demonstrated that applying curriculum reinforcement learning with GRPO — scheduling training tasks from easy to hard — produced dramatic gains in LLM reasoning. Their SATURN method (NeurIPS 2025 Spotlight) achieved +14.0 and +28.1 average pass@3 improvements on SAT for 1.5B and 7B models respectively, plus +4.9 on AIME and +1.8 on LiveCodeBench. The key mechanisms are: (1) easy-to-hard ordering allows the model to build reasoning sub-skills before they are needed in combination, (2) fading schedules gradually reduce reliance on easier tasks to prevent overfitting, and (3) the approach comes with convergence guarantees and finite-sample complexity bounds that establish it as more than a heuristic.

Applied to single-problem reasoning, curriculum learning means constructing a sequence of proxy problems that isolate and progressively combine the skills required for the target. A proxy problem is not a simplification of the target — it is a distinct problem that exercises one or more of the same reasoning muscles in a controlled setting. The fading schedule in this context means that early proxy problems are solved with full detail and explicit strategy application, while later proxy problems are solved with increasing reference to accumulated insights rather than from-scratch reasoning. The final target solution explicitly references the stepping-stone insights, making the curriculum visible in the output.

## Algorithm

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/curriculum-learning-reasoning` (case-insensitive). If no: produce a normal response. The skill is silent. If yes with no text after: respond with usage guidance showing the format and an example. If yes with text: proceed to Step 2.

### Step 2 — Clarify the Target Problem

Read the user's target problem. If the problem is ambiguous or missing critical constraints, ask exactly one clarifying question — no more. Identify: the domain(s) involved, the type of answer expected (decision, explanation, prediction, design, diagnosis), any explicit constraints, and the evidence standard. Restate the problem in your own words to confirm understanding before proceeding.

### Step 3 — Web Search for Relevant Skills if Needed

If the problem domain suggests a Vidbyte reasoning strategy or trace skill that may not be installed, perform a web search to check whether relevant skills exist that could be installed to improve the curriculum design. If the search reveals installable skills that would materially improve the analysis, recommend installation but do not block progress — proceed with what is available and note the gap.

### Step 4 — Classify the Target Problem

Classify the target problem into its dominant reasoning domain from the full Vidbyte classification: Causal & Diagnostic, Logical & Formal, Decision & Evaluation, Probabilistic & Forecasting, Creative & Lateral, Adversarial & Critical, Systems Thinking, Structured Analytic, Strategic & Business, Temporal & Historical, or Specialized & Cross-Domain. Note any secondary domains that will need to be addressed. This classification determines which strategies are available for the execution phase.

### Step 5 — Select the Primary Strategy from the Reasoning Arsenal

From the Reasoning Arsenal section below, select the single best-fit strategy whose core move most directly addresses the problem's dominant characteristic. This is the strategy that will be applied to each proxy problem and to the target. State the selection explicitly with a one-sentence justification: "Selected [strategy] because this problem's dominant characteristic is [X], and [strategy]'s core move of [Y] directly addresses that."

### Step 6 — Design the Curriculum of 3-5 Proxy Problems

Design a sequence of 3-5 proxy problems ordered from easiest to hardest. Each proxy problem must:
- Be a distinct, self-contained problem (not a rephrasing of the target)
- Exercise specifi­cally one or more of the skills needed for the target
- Increase in difficulty by adding a dimension of complexity, removing a simplifying assumption, tightening a constraint, or combining previously separate skills
- Be solvable with the selected strategy within a reasonable token budget
- Build toward the target such that the final proxy problem is the closest approximation of the target without being the target itself

Present the curriculum as a numbered list where each entry names the proxy problem, states what skill or insight it builds, and explains how it differs from the previous step. Apply a fading schedule: the first proxy receives full strategy execution, later proxies increasingly reference accumulated insights from earlier steps.

### Step 7 — Solve Each Stepping Stone and Record Transfer Insights

For each proxy problem in sequence:
- Apply the selected strategy's core move to solve the proxy problem fully
- Produce numbered reasoning items following the strategy's algorithm
- After solving, record explicit transfer insights: what was learned, what technique or principle was discovered, and how it applies to the next proxy problem and to the target
- Write each solution and its transfer insights to a curriculum trace file at `memory/curriculum-{question_name}.md`

Do not skip any proxy problem. Do not rush through early problems — they are the foundation. Do not present solutions that merely gesture at the strategy without actually applying it.

### Step 8 — Confront the Target Using the Accumulated Curriculum

With all proxy problems solved and transfer insights recorded, apply the selected strategy to the target problem. The target solution must:
- Reference specific insights from specific proxy problems (e.g., "From Proxy 2, we know that...")
- Show how the curriculum built the understanding needed for the target
- Produce a final answer that a direct application of the strategy without curriculum could not have reached
- Write the full curriculum trace including all proxy solutions, transfer insights, and the target solution to `memory/curriculum-{question_name}.md`

Respond to the user with the file path, the selected strategy, a summary of the curriculum progression, and the final answer.

## Reasoning Arsenal

This section catalogs every reasoning strategy domain available in the Vidbyte collection. When designing curricula and selecting strategies, match the problem's dominant characteristic to the domain whose core move best addresses it. Each domain entry describes what the strategies in that domain do and when they apply — use these descriptions to select the right strategy for both proxy problems and the target.

### Causal & Diagnostic

Strategies in this domain trace causes to effects or diagnose why something happened. They drill down through layers of causation — from surface symptoms to root mechanisms — using tools like iterative "why" questioning (Five Whys), causal tree mapping (Root Cause Analysis, Fault Tree), systematic categorization of potential causes (Fishbone), and mechanism-based causal modeling (Causal Reasoning). Use these strategies when the problem asks why an outcome occurred, what caused a failure, or how to intervene in a causal chain. They are strongest when the causal structure is complex but the evidence is available or can be inferred. Avoid them when the problem is primarily about future prediction, values tradeoffs, or creative generation — these strategies diagnose the past, they do not forecast or invent.

### Logical & Formal

Strategies in this domain apply formal reasoning structures to derive conclusions from premises through logically necessary or warranted steps. They include deductive reasoning (necessary inference from rules), inductive reasoning (generalization from patterns), abductive reasoning (inference to the best explanation), and various formal systems such as syllogistic, propositional, predicate, modal, nonmonotonic, defeasible, and fuzzy logic. Use these strategies when the problem involves rule application, classification from principles, reasoning under incomplete or revisable information, or formal verification of claims. They are strongest when the premises are well-defined and the inference rules are clear. Avoid them when the problem is empirical and requires evidence weighing rather than logical derivation, or when the domain is too messy for formalization.

### Decision & Evaluation

Strategies in this domain evaluate options against criteria to identify the best choice under constraints. They include structured comparison methods (Decision Matrix, Tradeoff Matrix, Cost-Benefit Analysis), probabilistic decision tools (Decision Tree, Expected Value, Minimax), and bounded-rationality approaches (Satisficing, Regret Minimization, Opportunity Cost). Use these strategies when the problem asks which option to choose, how to allocate resources, or what tradeoffs to accept. They are strongest when options are well-defined, criteria can be articulated, and preferences or values are clear. Avoid them when the problem is about understanding causation, generating novel solutions, or analyzing complex systems — these strategies evaluate, they do not explain or invent.

### Probabilistic & Forecasting

Strategies in this domain manage uncertainty by assigning, updating, and propagating probability estimates through structured analysis. They include Bayesian updating (belief revision with evidence), base rate anchoring, uncertainty quantification, sensitivity analysis, and forecasting methods such as scenario planning, reference class forecasting, and horizon scanning. Use these strategies when the problem involves prediction, risk assessment, or reasoning under significant uncertainty where probabilities can be estimated. They are strongest when base rates or reference classes are available, or when the uncertainty structure can be explicitly modeled. Avoid them when the problem requires precise deterministic answers, creative generation, or ethical reasoning — these strategies quantify uncertainty, they do not resolve value conflicts or invent solutions.

### Creative & Lateral

Strategies in this domain break conventional thought patterns to generate novel solutions or reframe problems. They include foundational deconstruction (First Principles), lateral entry points (Lateral Thinking, Provocation, Random Stimulus), structured creativity (SCAMPER, TRIZ, Morphological Analysis, Synectics), constraint manipulation (Constraint Removal), and design methodologies (Design Thinking, Double Diamond). Use these strategies when the problem requires innovation, when existing approaches have failed, or when the solution space needs to be expanded before it can be evaluated. They are strongest when the problem is poorly framed, over-constrained by invisible assumptions, or trapped in local optima. Avoid them when the problem is well-defined and requires precise evaluation of known options — these strategies generate and reframe, they do not optimize or verify.

### Adversarial & Critical

Strategies in this domain stress-test ideas by constructing the strongest possible case against them or by simulating opposition. They include adversarial simulation (Red Team, Devil's Advocacy, OODA Red Team), argument reconstruction (Steelman, Dialectical Reasoning, Argument Mapping), assumption auditing (Key Assumptions Check, Null Hypothesis), and failure analysis (Premortem, Postmortem, Error Analysis, Analysis of Competing Hypotheses). Use these strategies when the user needs to find weaknesses in a plan, test the robustness of a conclusion, or understand what the strongest counterarguments would be. They are strongest when the idea or plan is well-formed enough to attack and the goal is to harden it. Avoid them when the user needs creative generation or collaborative solution-building — these strategies attack and stress-test, they do not construct or invent.

### Systems Thinking

Strategies in this domain model interconnections, feedback loops, emergent behaviors, and leverage points in complex adaptive systems. They include holistic system mapping (Systems Thinking, Iceberg Model), loop analysis (Causal Loop, Feedback Loop), flow modeling (Stock and Flow), constraint identification (Theory of Constraints, Bottleneck Analysis), and intervention design (Leverage Points, Nth-Order Effects). Use these strategies when the problem involves interacting parts where the behavior of the whole cannot be understood by analyzing components in isolation, when interventions produce unintended consequences, or when the system exhibits non-linear dynamics. They are strongest for organizational, ecological, economic, and socio-technical systems. Avoid them when the problem is linear, single-cause, or well-isolated — these strategies add unnecessary complexity to simple problems.

### Structured Analytic

Strategies in this domain apply rigorous, transparent methods to analyze evidence, decompose problems, and structure reasoning so it can be audited. They include the scientific method cycle (observe, hypothesize, test, conclude), experimental design (controlled experiments, quasi-experiments, RCTs), evidence evaluation (triangulation, data quality audit), problem decomposition (MECE, Issue Tree, Minto Pyramid), and metacognitive oversight (Metacognitive Audit). Use these strategies when the problem requires evidence-based conclusions that can be scrutinized, when the reasoning process itself must be defensible, or when the analysis needs to be communicated to skeptical audiences. They are strongest for empirical questions, research design, and structured problem-solving in professional contexts. Avoid them when speed matters more than rigor, or when the problem is primarily about values, creativity, or strategic intuition.

### Strategic & Business

Strategies in this domain analyze competitive position, market dynamics, stakeholder interests, and organizational choices. They include environmental scanning (SWOT, PESTLE, Porter's Five Forces), stakeholder and incentive mapping, game-theoretic modeling of strategic interaction, policy analysis, and ethics frameworks (Ethical Matrix, Fairness Analysis). Use these strategies when the problem involves organizational decisions, market positioning, competitive dynamics, or policy design where multiple actors have conflicting interests. They are strongest when the strategic landscape can be mapped and the key players and their incentives are identifiable. Avoid them when the problem is technical rather than organizational, or when the decision involves purely personal values rather than multi-stakeholder tradeoffs.

### Temporal & Historical

Strategies in this domain reason about sequences, timelines, historical patterns, and change over time. They include temporal constraint reasoning, historical pattern analysis, backward and forward chaining through event sequences, comparative case analysis across time periods, analogical transfer from historical precedents, and narrative construction for chronological explanation. Use these strategies when the problem involves scheduling, process analysis, learning from past events, or understanding how a sequence of events produced an outcome. They are strongest when the temporal structure is complex — when order matters, when delays and durations are critical, or when historical precedent offers genuine insight. Avoid them when the problem is atemporal (e.g., purely logical, abstract, or static) — these strategies add a time dimension that may not be relevant.

### Specialized & Cross-Domain

Strategies in this domain apply domain-specific reasoning methods or integrate multiple perspectives to address problems that do not fit neatly into a single domain. They include multi-hat perspective-taking (Six Thinking Hats), deep Socratic probing of assumptions and implications, spatial reasoning for physical and geographic problems, legal reasoning for rule-to-fact application and precedent-based analysis, ethnographic and hermeneutic interpretation for meaning-making and cultural analysis, and counterfactual reasoning for exploring alternative histories. Use these strategies when the problem crosses domain boundaries, requires a specialized reasoning mode, or benefits from deliberate perspective-shifting. They are strongest for problems that resist single-domain classification and require the thinker to inhabit multiple frames. Avoid them when the problem clearly fits within a single well-defined domain — these strategies add complexity without corresponding benefit in those cases.

## Success Criteria

- The curriculum contains 3-5 proxy problems that form a genuinely progressive difficulty gradient, not minor variations of the same problem.
- Each proxy problem is solved fully using the selected strategy's core move, producing numbered reasoning items that an auditor can follow.
- Transfer insights are recorded after each proxy problem, explicitly connecting what was learned to the next proxy and to the target.
- The target solution explicitly references specific insights from specific proxy problems, demonstrating that the curriculum was used rather than bypassed.
- The fading schedule is visible: later proxy problems show increasing reliance on accumulated insights from earlier steps.
- The selected strategy is justified with a one-sentence explanation matching the problem's dominant characteristic to the strategy's core move.
- The curriculum trace is written to `memory/curriculum-{question_name}.md` with sections for each proxy problem, transfer insights, and the target solution.
- The problem is classified into the correct reasoning domain from the eleven-domain classification.
- Secondary domains are noted when the target problem spans multiple reasoning types.
- Assumptions, missing evidence, and uncertainty are recorded throughout the trace, not hidden.
- The curriculum builds toward genuine transfer — the target solution would not have been reachable without the stepping stones.
- No proxy problem is skipped, rushed, or solved at a superficial level.
- The response to the user includes the file path, strategy selection with justification, curriculum progression summary, and final answer summary.
- Early proxy problems isolate single skills; later proxy problems combine multiple skills in increasingly realistic configurations.
- The final curriculum trace is auditable — a reviewer can read it and trace how each insight contributed to the target solution.

## Things Not to Do

- Do not use minor variations of the same problem as distinct stepping stones (e.g., changing a number or name without adding a new dimension of difficulty).
- Do not skip transfer insights — each proxy problem must produce explicit notes on what was learned and how it applies forward.
- Do not rush to the target — the early proxy problems are the foundation and must receive full strategy execution, not abbreviated treatment.
- Do not repeat the same problem at the same difficulty level — each step must add a qualitatively new challenge.
- Do not present a curriculum that is flat (all proxy problems at similar difficulty) — the easy-to-hard gradient must be genuine and visible.
- Do not select a strategy without justifying the match between the problem's dominant characteristic and the strategy's core move.
- Do not solve the target problem directly before working through the curriculum — the entire point is that the stepping stones enable a better target solution.
- Do not write proxy problems that are unrelated to the target — each must exercise a skill or insight that is demonstrably needed for the target.

## Input

**Required — invocation:** `/curriculum-learning-reasoning <target problem>` — Sent by the user. The more specific the problem description, including constraints, evidence standards, and the type of answer expected, the more precise the curriculum design will be.

**Implicit — strategy catalog:** The Reasoning Arsenal section embedded in this SKILL.md. Used to classify the problem domain and select the best-fit strategy for both proxy problems and the target.
