---
name: parallel-thinking-reasoning
description: >
  Use when the user invokes /parallel-thinking-reasoning or wants to apply
  parallel thinking decomposition as a meta-layer over any Vidbyte reasoning
  strategy. Counters the overthinking failure mode by decomposing the problem
  into 3–5 independent sub-problems, running the selected base strategy on each
  in parallel, and synthesizing the results. Reduces inference cost by avoiding
  redundant reasoning while improving accuracy through focused decomposition.
  Based on S-GRPO (sequence reduction with accuracy gains) and REA-RL (36%
  cost reduction without accuracy loss).
---

# /parallel-thinking-reasoning — Parallel Thinking Meta-Reasoner

## Goal

When the user invokes `/parallel-thinking-reasoning`, decompose their complex problem into 3–5 independent sub-problems, select or confirm a base reasoning strategy for each sub-problem from the Vidbyte catalog, run those strategies in parallel on each sub-problem, and synthesize the results into a coherent answer. Write the complete trace — including the decomposition, each sub-problem's reasoning scratchpad, and the synthesis — to `memory/{question_name}.md`. This meta-skill counters the "overthinking" failure mode where models generate thousands of tokens of redundant reasoning that doesn't improve the answer, by decomposing the problem into bite-sized sub-problems that can each be reasoned through with focused depth rather than sprawling breadth, then running those sub-problem analyses in parallel.

Parallel thinking addresses a specific and well-documented failure mode in language model reasoning: overthinking. When faced with a complex problem, models often generate long chains of reasoning that revisit the same territory, elaborate on settled points, and burn tokens on reasoning that doesn't change the answer. This is not just wasteful — it can actively degrade accuracy by introducing confusion, diluting the signal from the strongest reasoning steps, and exhausting the model's effective context window. By decomposing the problem first, we give each sub-problem a focused reasoning budget proportionate to its difficulty, and by running in parallel, we avoid the compounding effect where confusion in one sub-problem contaminates reasoning about the next. The REA-RL framework demonstrated that decomposition with parallel execution reduces inference costs by 36% without accuracy loss; S-GRPO showed that sequence length can be reduced by 35.4–61.1% while simultaneously improving accuracy by 0.72–6.08 percentage points.

## Intent

We run this meta-skill because complex problems are rarely monolithic — they are composites of simpler questions that can be answered independently. When a user asks "Should we enter the European market with our SaaS product?" the question contains sub-problems about market sizing (how big is the opportunity?), competitive analysis (who is already there and how strong are they?), regulatory assessment (what compliance requirements exist?), operational feasibility (can we deliver the product there?), and financial modeling (what does the investment and return look like?). Each of these sub-problems benefits from a potentially different reasoning strategy — market sizing might use Fermi estimation or reference class forecasting, competitive analysis might use Porter's Five Forces, regulatory assessment might use legal reasoning or constraint satisfaction, and financial modeling might use cost-benefit analysis or expected value reasoning. Running all of these as one undifferentiated reasoning trace produces a long, tangled output where each domain's analysis bleeds into the others and the overall structure is hard to follow.

Parallel decomposition makes the reasoning architecture explicit. The decomposition step itself is a reasoning act — identifying which aspects of the problem are independent, which are dependent (and therefore must be sequenced), and what level of granularity each sub-problem requires. This upfront structuring investment pays off in three ways: first, it prevents overthinking by giving each sub-problem a bounded scope; second, it enables parallel execution where sub-problems can be dispatched simultaneously, reducing total latency; and third, it produces a cleaner output where each sub-analysis is self-contained and the synthesis step shows how the pieces fit together. The technique is particularly valuable for problems that cross domain boundaries — a business strategy question that requires financial, competitive, operational, and regulatory analysis — because it prevents the model from defaulting to whichever domain it finds easiest and shortchanging the others.

## Background — What Is Parallel Thinking and Why Does It Counter Overthinking

Parallel thinking is a problem-solving paradigm that counters the sequential, monolithic reasoning approach that dominates most language model interactions. In the standard approach, a model receives a complex question and generates a single long reasoning chain that moves linearly from beginning to end, with each step building on the previous one. This approach has two failure modes. First, overthinking: the model generates excessive reasoning tokens that revisit settled territory, elaborate on already-established points, and spend disproportionate effort on easy sub-problems while under-attending to hard ones. Second, contamination: errors or confusion in early reasoning steps propagate forward and corrupt later steps, because the model's autoregressive generation means each token is conditioned on all previous tokens — including the mistaken ones.

Parallel thinking addresses both failures by front-loading a decomposition step that breaks the problem into sub-problems that are as independent as possible, then solving each sub-problem in a focused reasoning session that starts fresh — uncontaminated by the reasoning history of other sub-problems. The decomposition itself is informed by research on reasoning budgets: S-GRPO (Sequence-aware Group Relative Policy Optimization) demonstrated that problems have natural reasoning thresholds — "easy" problems require only ~2,000 tokens of reasoning, while "hard" problems may need ~8,000. Forcing a one-size-fits-all reasoning budget either under-thinks hard problems or over-thinks easy ones. By decomposing, we assign each sub-problem a budget proportionate to its difficulty: a simple factual sub-problem gets a short reasoning budget, while a complex analytical sub-problem gets more depth.

The empirical case for parallel thinking comes from two complementary lines of research. REA-RL (Reasoning-Enhanced Actor-Critic with Reinforcement Learning) introduced a reflection model that monitors reasoning quality and decides when revision is needed, reducing inference costs by 36% without accuracy loss — because it avoids generating unnecessary revision on reasoning steps that are already correct. S-GRPO reduced sequence length by 35.4% to 61.1% across benchmarks while improving accuracy by 0.72 to 6.08 percentage points, demonstrating that shorter, focused reasoning can outperform longer, unfocused reasoning. The Budget-Adaptive Curriculum approach achieved up to 8.3% accuracy gains under tight token budgets while cutting total token consumption by 34%, by allocating reasoning depth where it matters most. Together, these findings establish that reasoning efficiency and reasoning quality are not in tension — the best reasoning is targeted reasoning, and parallel decomposition is the mechanism for targeting.

## Algorithm

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/parallel-thinking-reasoning` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage explanation:

```
Usage: /parallel-thinking-reasoning <your complex problem or question>

Parallel thinking decomposes your problem into independent sub-problems,
runs a reasoning strategy on each in parallel, and synthesizes the results.
This counters overthinking by giving each sub-problem focused depth rather
than one sprawling analysis.

Best for complex problems that cross domain boundaries or have clearly
separable aspects. Not ideal for simple single-domain questions —
use the base strategy directly for those.

Optionally specify base strategies per sub-problem using --sub "description":
/parallel-thinking-reasoning --sub "market size: /fermi-estimation-trace"
  --sub "competition: /porters-five-forces-trace"
  "Should we enter the European market?"
```

- If yes with text: proceed to Step 2.

### Step 2 — Clarify Ambiguity

If the user's problem is too vague to decompose meaningfully (e.g., "help me think about my business"), ask one clarifying question about the problem's scope and what kind of analysis is needed. Decomposing a vague problem produces vague sub-problems and useless parallel analyses.

If the user specified sub-problems via `--sub` flags, validate each against the Reasoning Arsenal and note any that don't map to a known strategy. If `--sub` flags are used, skip Step 3 (decomposition) and go directly to Step 4 (strategy selection per sub-problem).

### Step 3 — Decompose the Problem

Analyze the user's problem and identify 3–5 sub-problems that are as independent as possible. Good decomposition principles:

- **MECE-adjacent**: Sub-problems should be mutually exclusive (minimal overlap) and collectively exhaustive (together they cover the full question). Perfect MECE is ideal but not always achievable; aim for low overlap and full coverage.
- **Domain-aligned**: Each sub-problem should fall cleanly into one reasoning domain (causal, decision, probabilistic, creative, etc.). If a sub-problem crosses domains, decompose it further.
- **Dependency-minimal**: Sub-problems should be answerable independently — the answer to sub-problem A should not depend on the answer to sub-problem B. If there is a dependency, sequence the sub-problems (A then B) rather than running them in parallel, and note the dependency in the trace.
- **Difficulty-calibrated**: Assign sub-problems a difficulty rating (simple, moderate, complex) that will determine their reasoning budget. Simple sub-problems (factual, well-defined) get ~500–1,000 tokens; moderate sub-problems get ~1,000–2,500 tokens; complex sub-problems (analytical, multi-factor) get ~2,500–4,000 tokens. This prevents overthinking on easy sub-problems and underthinking on hard ones.

Document the decomposition in the trace with a brief rationale for each sub-problem — what it covers, why it's independent, and what difficulty level it warrants.

### Step 4 — Web Search for Skills if Not Installed

For each sub-problem, identify the matching reasoning strategy from the Reasoning Arsenal below. If a needed strategy's skill is not installed locally (check by scanning `skills/` for the matching `*-trace` directory with a `SKILL.md` file), perform a web search for "Vidbyte skills reasoning strategies <strategy-name>" to locate and install it. If a strategy is not found at all, fall back to abductive reasoning for that sub-problem and notify the user.

### Step 5 — Select the Base Strategy for Each Sub-Problem

For each sub-problem, match its domain against the Reasoning Arsenal and select the strategy whose core move most directly addresses the sub-problem's dominant characteristic. A single complex problem may use different strategies for different sub-problems — that is the point of parallel decomposition. Document each selection with a brief justification in the trace.

If the user specified strategies via `--sub` flags, use those directly.

### Step 6 — Run Sub-Problems in Parallel

Execute each sub-problem's analysis independently. For each sub-problem:

1. Restate the sub-problem with its specific constraints and evidence standard.
2. Apply the selected strategy's core move explicitly — this is the central reasoning act for that sub-problem.
3. Produce numbered reasoning items following the strategy's algorithm.
4. Record assumptions, missing evidence, disconfirming signals, and confidence changes.
5. Synthesize the sub-problem's analysis into a concise sub-conclusion.

Each sub-problem's reasoning should be focused and proportionate to its difficulty — do not generate a 100-item trace for a sub-problem that can be answered in 15 items. The goal is efficient depth, not uniform length.

Number sub-problems clearly in the output: `## Sub-Problem 1/4: [Description]`, `## Sub-Problem 2/4: [Description]`, and so on.

### Step 7 — Synthesize

After all sub-problems are complete, synthesize the sub-conclusions into a unified answer to the original question. The synthesis should:

- Identify how each sub-conclusion contributes to the overall answer.
- Note any interactions or tensions between sub-conclusions (e.g., sub-problem A says the market is large, but sub-problem B says competitive intensity makes entry unprofitable — the synthesis must reconcile these).
- Flag any sub-problems where the analysis was inconclusive or where assumptions dominate the conclusion.
- Produce a final answer that integrates the sub-conclusions into a coherent response to the original question.

The synthesis is not just a summary — it is a reasoning act in its own right, identifying patterns across sub-problems that were not visible when each was analyzed in isolation.

### Step 8 — Write Trace to Disk

Derive `{question_name}` from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using `parallel-thinking-trace` if no safe name remains.

Create the root `memory` directory when needed, then write the complete parallel thinking trace to `memory/{question_name}.md`.

Structure the file with these sections in order:

```
Question:    (restated user question, constraints, evidence standard)
Meta-Strategy:    Parallel Thinking Decomposition (S-GRPO / REA-RL informed)

Decomposition Rationale:
[Why these sub-problems, why they're independent, difficulty calibration]

Sub-Problem 1/N: [Description]
Strategy: [Name and slash command]
Difficulty: [simple / moderate / complex]
[Complete reasoning trace — strategy applied to this sub-problem]

Sub-Problem 2/N: [Description]
Strategy: [Name and slash command]
Difficulty: [simple / moderate / complex]
[Complete reasoning trace]

[... remaining sub-problems ...]

Interactions and Dependencies:
[Cross-cutting observations — tensions, reinforcements, dependencies noted]

Synthesis:
[Integrated answer to the original question, showing how sub-conclusions combine]

Final Answer:
[The conclusion that follows from the synthesis, including important uncertainty]
```

After writing the file, respond to the user with:
1. The file path (e.g., `memory/{question_name}.md`)
2. The decomposition summary — which sub-problems were identified and which strategies were used for each
3. The synthesized final answer in brief
4. Optionally, any sub-problems where confidence was low and further analysis would be beneficial

## Reasoning Arsenal

### Causal & Diagnostic

**Five Whys** drills down through successive "why" layers to find the root cause beneath symptoms. Best for single-cause failures, straightforward debugging, and linear cause chains where each layer has one dominant answer. Use it when you suspect a single root cause beneath visible symptoms.

**Root Cause Analysis** maps the full causal tree — direct causes, contributing factors, and systemic conditions — rather than stopping at one root. Best for complex failures with multiple interacting causes where fixing one factor without addressing systemic conditions would let the failure recur.

**Causal Reasoning** constructs a causal model linking causes to effects with explicit mechanisms and counterfactuals — what would have happened if the cause had been absent. Best for understanding causal mechanisms and planning interventions with predictable effects.

**Fishbone (Ishikawa)** categorizes potential causes into standardized branches (people, process, technology, environment, materials, measurement) to ensure broad coverage during brainstorming. Best for structured cause brainstorming in manufacturing or process problems.

**Fault Tree** builds a top-down Boolean tree of events connected by AND/OR gates leading to a top-level failure. Best for reliability engineering, safety analysis, and computing failure probabilities in complex systems.

**Bowtie Risk** maps causes (left), the central risk event (center), and consequences (right) with preventive and mitigative barriers on each side. Best for risk management and demonstrating barrier adequacy in safety cases.

**Event Tree** forward-chains from an initiating event through a sequence of possible outcomes, branching at each barrier or decision point. Best for accident progression and scenario analysis after a trigger event.

**Bottleneck Analysis** identifies the single constraint that most limits throughput or performance in a system. Best for performance debugging and process optimization where one constraint dominates.

**Correlation vs Causation** systematically distinguishes spurious correlations from genuine causal relationships by testing for confounding, reverse causation, and coincidental alignment. Best for evaluating causal claims in observational data.

**Regression Reasoning** models relationships between variables and quantifies effect sizes while accounting for confounds. Best for data-driven causal estimation with numeric data.

**Dependency Mapping** maps what depends on what, identifying critical paths and single points of failure in interconnected systems. Best for infrastructure analysis and cascade-risk assessment.

### Logical & Formal

**Deductive Reasoning** derives conclusions from premises through logically necessary steps — if premises are true, the conclusion must be true. Best for problems where rules or axioms fully determine the answer.

**Inductive Reasoning** generalizes from specific observations to broader patterns or principles. Best for pattern recognition and theory building from examples, with conclusions that are probable but not certain.

**Abductive Reasoning** generates competing explanations for observed evidence and selects the best-supported one. Best for open-ended diagnostic problems with multiple possible explanations. Use as the default fallback when no other strategy is a clear fit.

**Syllogistic Reasoning** tests categorical logic through chains of major premise, minor premise, and conclusion. Best for formal categorical classification and rule application.

**Propositional Logic** evaluates truth values of compound statements using AND, OR, NOT, IMPLIES. Best for Boolean reasoning and formal verification of logical arguments.

**Predicate Logic** reasons about properties and relations using "for all" and "there exists" quantifiers. Best for formal specification and relational reasoning.

**Modal Reasoning** handles necessity, possibility, obligation, and other modalities beyond simple true/false. Best for counterfactual and normative analysis.

**Nonmonotonic Reasoning** draws conclusions that can be retracted when new information arrives. Best for problems with incomplete and evolving information.

**Defeasible Reasoning** builds arguments that hold by default but can be defeated by exceptions. Best for legal reasoning and rule-with-exception problems.

**Fuzzy Logic** reasons with degrees of truth rather than binary true/false. Best for graded concepts and approximate reasoning.

**Proof by Cases** breaks a problem into exhaustive, mutually exclusive cases and proves each independently. Best for classification and conditional problems with clear branches.

**Proof by Contradiction** assumes the negation of the target claim and derives an impossibility. Best for impossibility proofs and rigorous refutation.

### Decision & Evaluation

**Decision Tree** maps decisions, chance events, and outcomes as a branching tree with expected values. Best for sequential decisions under uncertainty with multiple stages.

**Cost-Benefit Analysis** quantifies and compares all costs and benefits of each option. Best for resource allocation and investment decisions where impacts can be monetized.

**Expected Value** weights each outcome by its probability to compute the average expected result. Best for risky decisions with probabilistic payoffs.

**Tradeoff Matrix** scores options across weighted criteria to surface the best-balanced choice. Best for multi-criteria decisions where no option dominates on every dimension.

**Satisficing** finds the first option that meets all minimum thresholds rather than optimizing. Best for time-constrained decisions where "good enough" suffices.

**Regret Minimization** evaluates options by the maximum regret you'd feel — and minimizes that maximum. Best for irreversible, high-stakes decisions.

**Opportunity Cost** evaluates what you give up by choosing each option — the value of the foregone alternative. Best for resource allocation tradeoffs.

**Utility Analysis** models preferences as a utility function and maximizes expected utility. Best for decisions involving risk preferences and subjective value.

**Minimax** chooses the option that minimizes your maximum possible loss. Best for adversarial decisions and worst-case planning.

**Values Tradeoff** surfaces and weighs competing values when options optimize for different principles. Best for ethical decisions and mission-level tradeoffs.

**AB Testing** designs and analyzes controlled experiments comparing two variants. Best for empirical product and UI decisions.

### Probabilistic & Forecasting

**Bayesian Reasoning** updates belief probabilities as evidence arrives using Bayes' theorem. Best for evidence-based belief revision and diagnostic reasoning with base rates.

**Probabilistic Reasoning** assigns and propagates probabilities through structured analysis. Best for risk quantification and uncertainty propagation.

**Base Rate** anchors probability estimates in the underlying base rate before adjusting for specifics. Best for avoiding the base rate fallacy in diagnosis and prediction.

**Uncertainty Quantification** explicitly bounds and characterizes uncertainty in estimates. Best for scientific modeling and policy forecasting where uncertainty communication matters.

**Sensitivity Analysis** identifies which uncertain inputs most affect the output. Best for model validation and identifying critical assumptions.

**Scenario Planning** develops multiple distinct, coherent futures and plans for each. Best for long-range strategy under deep uncertainty.

**Cone of Plausibility** maps the expanding range of possible futures from now outward. Best for horizon scanning and communicating time-uncertainty relationships.

**Reference Class Forecasting** predicts using the distribution of outcomes for similar past projects. Best for avoiding the planning fallacy in project estimation.

**Outside View** predicts by anchoring in the statistical distribution of similar cases. Best for debiasing forecasts and counteracting overoptimism.

**What-If Analysis** systematically varies assumptions and observes how outcomes change. Best for stress testing conclusions against alternative inputs.

**Horizon Scanning** identifies emerging trends, weak signals, and potential disruptions. Best for strategic foresight and early warning.

**Indicators & Signposts** defines observable metrics that signal a scenario is unfolding. Best for monitoring and adaptive strategy triggers.

### Creative & Lateral

**First Principles** deconstructs a problem to fundamental truths and rebuilds from there. Best for radical redesign and breaking out of conventional thinking.

**Lateral Thinking** approaches the problem from unexpected angles to bypass standard thought patterns. Best for creative block and "impossible" problems.

**Reframing** changes how the problem is defined to unlock new solution spaces. Best for stuck problems where the current framing is the obstacle.

**Constraint Removal** imagines removing each constraint to explore what becomes possible. Best for innovation and finding hidden degrees of freedom.

**Provocation** makes deliberately provocative statements to disrupt fixed thinking. Best for creative breakthroughs and challenging orthodoxies.

**Reverse Brainstorming** brainstorms how to cause the problem, then inverts ideas into solutions. Best for creative problem solving when standard brainstorming stalls.

**Random Stimulus** introduces a random word or concept to trigger unexpected associations. Best for creative block needing genuinely novel connections.

**SCAMPER** applies Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse operations. Best for systematic product and process innovation.

**TRIZ** applies 40 inventive principles from patent analysis to resolve technical contradictions. Best for engineering innovation and contradiction resolution.

**Synectics** uses analogies and metaphors to make the strange familiar and the familiar strange. Best for creative concept development through comparison.

**Biomimicry** seeks solutions by studying how nature solved analogous problems. Best for design innovation and sustainable solutions.

**Morphological Analysis** decomposes into dimensions and systematically explores combinations. Best for design space exploration and structured ideation.

**Design Thinking** cycles through empathize, define, ideate, prototype, test. Best for human-centered product and service design.

**Double Diamond** structures problem solving into diverge-converge-diverge-converge. Best for design processes requiring both exploration and refinement.

### Adversarial & Critical

**Red Team** simulates a motivated adversary trying to defeat your plan or system. Best for security analysis and vulnerability assessment.

**Devil's Advocacy** argues the strongest possible case against your position. Best for testing conviction strength and surfacing hidden weaknesses.

**Steelman** constructs the strongest possible version of the opposing argument. Best for genuine understanding of opponents and intellectual honesty.

**Premortem** imagines the project has failed and works backward to identify causes. Best for project risk identification before launch.

**Postmortem** analyzes a completed project to extract lessons learned. Best for after-action review and organizational learning.

**Dialectical Reasoning** moves through thesis, antithesis, and synthesis. Best for integrating opposing views and resolving contradictions.

**Argument Mapping** visualizes claims, evidence, rebuttals, and their logical connections. Best for understanding complex argument structures.

**Analysis of Competing Hypotheses** lists all plausible hypotheses and evaluates evidence for and against each. Best for intelligence analysis and multi-hypothesis problems.

**Key Assumptions Check** lists every assumption and tests each for validity and sensitivity. Best for decision validation and assumption auditing.

**Null Hypothesis** tests whether observed patterns could be explained by chance alone. Best for statistical inference and signal detection.

**Deception Detection** analyzes information for indicators of deception or manipulation. Best for fraud investigation and source credibility assessment.

**Error Analysis** systematically identifies, classifies, and traces error sources. Best for debugging and quality improvement.

**OODA Red Team** applies Observe-Orient-Decide-Act from an adversarial perspective. Best for competitive strategy and rapid adversarial analysis.

### Systems Thinking

**Systems Thinking** maps interconnections, feedback loops, and emergent behaviors. Best for complex adaptive systems where linear thinking produces policy resistance.

**Causal Loop** diagrams reinforcing and balancing feedback loops. Best for understanding system dynamics and unintended consequences.

**Iceberg Model** moves from events to patterns to structures to mental models. Best for deep system understanding and finding leverage.

**Feedback Loop** identifies and analyzes amplifying and stabilizing loops. Best for growth dynamics and runaway effects.

**Stock and Flow** models accumulations and the rates that change them. Best for resource dynamics and buffer analysis.

**Leverage Points** identifies where small changes produce large system-level effects. Best for intervention design and maximum-impact strategy.

**Nth-Order Effects** traces consequences beyond first-order to surface hidden downstream impacts. Best for policy analysis and intervention planning.

**Second-Order Effects** focuses on the often-overlooked secondary consequences. Best for unintended consequence mapping.

**Theory of Constraints** identifies the system's bottleneck and subordinates everything to maximizing flow through it. Best for throughput optimization.

**Constraint Satisfaction** finds solutions that satisfy all constraints simultaneously. Best for scheduling and configuration problems.

### Structured Analytic

**Scientific Method** cycles through observe, question, hypothesize, experiment, analyze, conclude. Best for empirical investigation with systematic data gathering.

**Hypothesis Testing** formulates testable hypotheses and designs experiments to evaluate them. Best for moving from "I think" to "the data show."

**Experimental Design** designs controlled experiments with proper randomization and measurement. Best for research methodology and causal inference design.

**Quasi-Experimental** designs studies when randomization is not possible. Best for policy evaluation and natural experiments.

**Randomized Control Trial** designs gold-standard experiments with random assignment. Best for highest-standard causal evidence.

**Evidence Triangulation** cross-checks findings across multiple independent sources and methods. Best for research validation and confidence assessment.

**Data Quality Audit** assesses data for completeness, accuracy, consistency, and reliability. Best for data-driven decisions and analytics preparation.

**MECE Decomposition** breaks problems into Mutually Exclusive and Collectively Exhaustive parts. Best for problem structuring and consulting analysis.

**Issue Tree** decomposes a complex question into a hierarchy of sub-questions. Best for problem decomposition and research planning.

**Minto Pyramid** structures communication with the conclusion first, supported by grouped arguments. Best for business communication and recommendation structuring.

**Metacognitive Audit** examines your own thinking for biases, gaps, and overconfidence. Best for self-assessment and cognitive debiasing.

### Strategic & Business

**SWOT Analysis** evaluates Strengths, Weaknesses, Opportunities, and Threats. Best for strategic planning and competitive positioning.

**PESTLE** analyzes Political, Economic, Social, Technological, Legal, and Environmental factors. Best for macro-environmental scanning and market analysis.

**Porter's Five Forces** analyzes competitive intensity through supplier power, buyer power, rivalry, substitutes, and new entrants. Best for industry analysis and market entry decisions.

**Stakeholder Analysis** maps who is affected, their interests, influence, and needs. Best for project planning and change management.

**Game Theory** models strategic interactions where outcomes depend on all players' choices. Best for competitive strategy and negotiation.

**Incentive Analysis** maps what each actor is rewarded for and what behavior the structure produces. Best for organization design and behavior prediction.

**Linchpin Analysis** identifies the single assumption everything else depends on. Best for risk assessment and critical dependency identification.

**Policy Analysis** evaluates policy options against effectiveness, efficiency, equity, and feasibility. Best for policy design and program evaluation.

**OODA Loop** cycles through Observe, Orient, Decide, Act for rapid decision-making. Best for fast-moving competitive situations.

**Alternative Futures** develops multiple coherent, divergent futures to test strategy. Best for scenario planning and futures thinking.

**Fairness Analysis** evaluates outcomes across groups for disparate impact and equity. Best for algorithm audit and policy fairness.

**Ethical Matrix** evaluates decisions through consequentialist, deontological, and virtue ethics lenses. Best for moral reasoning and values-based decisions.

### Temporal & Historical

**Temporal Reasoning** reasons about sequences, durations, deadlines, and temporal constraints. Best for scheduling and process analysis.

**Historical Reasoning** analyzes past events to identify patterns, causes, and lessons. Best for learning from precedent and tracing idea genealogies.

**Backward Chaining** starts from the goal and works backward to identify preconditions. Best for planning and goal decomposition.

**Forward Chaining** starts from known facts and applies rules to derive conclusions. Best for rule-based reasoning and predictive generation.

**Comparative Case** compares and contrasts cases to identify patterns. Best for cross-case analysis and benchmarking.

**Analogical Reasoning** maps structure from a familiar source domain to an unfamiliar target. Best for understanding novel concepts through comparison.

**Narrative Reasoning** constructs and evaluates coherent stories that explain event sequences. Best for sense-making and chronological explanation.

### Specialized & Cross-Domain

**Six Thinking Hats** examines problems through six perspectives: facts, emotions, caution, optimism, creativity, and process. Best for multi-perspective analysis and balanced thinking.

**Socratic Questioning** probes assumptions, evidence, viewpoints, implications, and the question itself. Best for deep understanding and assumption surfacing.

**Mind Map** radiates outward from a central concept, associating and connecting ideas. Best for brainstorming and knowledge organization.

**Assumption Ladder** climbs from observable data through interpretations to high-level assumptions. Best for surfacing hidden assumptions.

**Ethnographic Reasoning** understands problems through culture, context, and lived experience. Best for user research and context-rich understanding.

**Hermeneutic Reasoning** interprets meaning through iterative part-to-whole understanding cycles. Best for text interpretation and meaning-making.

**Legal Reasoning** applies rules to facts, interprets statutes, and reasons from precedent. Best for legal analysis and regulatory compliance.

**Spatial Reasoning** reasons about position, arrangement, distance, and spatial relationships. Best for architecture, logistics, and physical design.

**Counterfactual Reasoning** explores "what if" alternatives to what actually happened. Best for impact evaluation and causal inference.

## Success Criteria

- The problem is decomposed into 3–5 sub-problems that are as independent as possible, with each sub-problem falling cleanly into one reasoning domain.
- Each sub-problem is assigned a difficulty rating (simple, moderate, complex) that determines its reasoning budget, preventing overthinking on easy problems and underthinking on hard ones.
- For each sub-problem, a base strategy is selected from the Reasoning Arsenal whose core move matches the sub-problem's dominant characteristic, with a brief justification documented.
- Each sub-problem is analyzed independently using its selected strategy's algorithm, producing a focused scratchpad with numbered reasoning items proportional to its difficulty rating.
- Sub-problems are executed in parallel where they are independent; any dependencies are explicitly noted and sequenced rather than run in parallel with hidden contamination.
- The synthesis step identifies how each sub-conclusion contributes to the overall answer, notes interactions and tensions between sub-conclusions, and produces an integrated final answer.
- A complete reasoning trace is written to `memory/{question_name}.md` with sections Question, Decomposition Rationale, each sub-problem's analysis, Interactions and Dependencies, Synthesis, and Final Answer.
- The trace demonstrates reasoning efficiency — total token consumption is proportionate to problem complexity rather than inflated by overthinking, with each sub-problem receiving a budget calibrated to its difficulty.
- Assumptions, missing evidence, disconfirming signals, and confidence levels are recorded within each sub-problem's scratchpad.
- The decomposition rationale is documented so a reviewer can judge whether the sub-problems were correctly identified as independent.
- No sub-problem's reasoning bleeds into or contaminates another sub-problem's analysis — each sub-problem's scratchpad starts fresh.
- The synthesis does not just restate sub-conclusions but identifies cross-cutting patterns, tensions, and tradeoffs that emerge from the decomposition.
- The final answer integrates all sub-conclusions into a coherent response to the original question, flagging areas of low confidence or unresolved tension.
- No prompt skills or session-management skills are selected as base strategies for sub-problems.
- The trace shows reasoning depth where it matters (complex sub-problems) and reasoning economy where it doesn't (simple sub-problems), demonstrating the budget-adaptive principle.

## Things Not to Do

- Do not force all sub-problems into a single strategy. The value of parallel decomposition is that different sub-problems may need different reasoning approaches — a market sizing sub-problem might need reference class forecasting while a regulatory sub-problem might need legal reasoning. Applying the same strategy to all sub-problems defeats the purpose of decomposition.
- Do not decompose into sub-problems that are secretly dependent. If sub-problem B's analysis needs sub-problem A's conclusion as an input, the sub-problems are not independent and should be sequenced, not parallelized. Running dependent analyses in parallel produces inconsistent results where B's analysis may contradict A's without awareness.
- Do not overthink. The primary failure mode this meta-skill counters is generating more reasoning than the problem needs. If a sub-problem can be answered adequately in 15 numbered items, do not generate 100. The budget-adaptive principle is central: allocate reasoning depth where it improves the answer, and economy where it doesn't.
- Do not underthink complex sub-problems. Efficiency is not the same as brevity — a complex sub-problem that genuinely needs 50 reasoning items should get them. The goal is to eliminate wasted tokens, not to truncate necessary reasoning.
- Do not skip the interactions and dependencies section. Sub-problems that appeared independent during decomposition may reveal interactions during analysis — a tension between the financial and operational sub-conclusions, a dependency that wasn't apparent upfront. The synthesis must identify and address these.
- Do not present the synthesis as certainty when sub-conclusions are low-confidence. If two sub-problems have high-confidence conclusions and two have low-confidence conclusions, the overall synthesis should reflect that mixed confidence rather than averaging it into a medium-confidence overall answer.
- Do not decompose problems that are fundamentally monolithic. Some questions cannot be sensibly decomposed — they require integrated reasoning where the pieces only make sense in relation to each other. Forcing decomposition on such problems produces fragmented analysis that misses the holistic insight. If the problem resists decomposition after genuine effort, fall back to running the single best-fit base strategy on the whole problem.
- Do not write the trace to a location other than `memory/{question_name}.md` at the repository root. Traces must be discoverable and auditable in the standard Vidbyte memory location.

## Input

**Required — invocation:** `/parallel-thinking-reasoning <problem description>` — Sent by the user. Optionally, `--sub "<description>: <strategy>"` to specify sub-problems and strategies explicitly.

**Required — Reasoning Arsenal:** The Reasoning Arsenal section embedded in this SKILL.md. Used to match each sub-problem's domain to the right base strategy.

**Optional — sub-problem override:** The user may specify `--sub "<sub-problem description>: /<strategy-slash-command>"` for one or more sub-problems to bypass automatic decomposition and strategy selection for those sub-problems. Usage: `--sub "market sizing: /fermi-estimation-trace" --sub "competition: /porters-five-forces-trace"`.
