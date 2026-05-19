---
name: paradigm-routing-reasoning
description: >
  Use when the user invokes /paradigm-routing-reasoning or asks to optimize how a problem gets answered.
  This meta-skill performs two-stage routing: first it routes to the best inference-time paradigm
  (Direct, CoT, ReAct, Plan-Execute, Reflection, ReCode), then within that paradigm it selects and
  executes the best-fit Vidbyte strategy. Embeds the Select-then-Solve finding that no single paradigm
  dominates and that routing before reasoning recovers 37% of the oracle gap.
---

# Paradigm Routing Reasoning

## Goal

This meta-skill optimizes inference-time reasoning by routing every problem through two sequential decisions before a single token of reasoning is produced. In the first stage it routes to the best-fitting inference paradigm from a six-paradigm taxonomy G�� Direct, Chain-of-Thought, ReAct, Plan-Execute, Reflection, and ReCode G�� using lightweight embedding-based selection informed by the Select-then-Solve framework. In the second stage, operating within the chosen paradigm, it classifies the problem across 11 reasoning domains and selects the single best-fit Vidbyte trace strategy from the full catalog.

This two-stage architecture replaces the common practice of defaulting to a single paradigm for all problems. Empirical evidence across ~18,000 runs on 4 frontier LLMs and 10 benchmarks shows that no paradigm dominates universally G�� ReAct gains 44 percentage points on GAIA while CoT loses 15 points on HumanEval G�� and that paradigm routing before reasoning recovers 37% of the gap between the best fixed-paradigm strategy and the oracle upper bound. The meta-skill executes both routing decisions audibly, writes a durable reasoning trace recording both choices, and produces a final answer whose structure matches the problem rather than the system default.

## Intent

Paradigm choice is an optimizable variable, not a preference. Most systems either hardcode a single reasoning paradigm or let the model choose implicitly, leaving significant accuracy on the table. The Select-then-Solve framework demonstrates that routing before reasoning lifts accuracy from 47.6% (no routing) to 53.1% (routed), compared to 50.3% for the single best fixed paradigm and 55.4% for the oracle upper bound G�� meaning routing recovers 37% of the gap between naive usage and optimal paradigm selection. This meta-skill embeds that finding directly into Vidbyte's architecture by making paradigm selection an explicit, justified step before any domain-level reasoning begins.

The second routing stage addresses a different optimization surface. Even within the best paradigm, different problems demand different reasoning architectures G�� a causal question needs a causal strategy, a decision needs a decision strategy, a creative problem needs a creative strategy. By nesting strategy selection inside paradigm selection, the meta-skill ensures the final reasoning trace is structured by two aligned decisions rather than by one default chain. The goal is not to describe paradigms or list strategies but to route, select, execute, and produce an auditable artifact where every choice is visible and every structure fits the problem it was built for.

## Background G�� What Is Paradigm Routing Reasoning

Paradigm Routing Reasoning operationalizes the Select-then-Solve framework introduced by Zhou et al (2026), which treats inference-time paradigm selection as a routing problem. Before answering a question, a lightweight embedding-based router evaluates the problem and selects from six candidate reasoning paradigms: Direct (single-pass generation, no intermediate reasoning), Chain-of-Thought (stepwise natural language reasoning), ReAct (interleaved reasoning and tool-use), Plan-Execute (explicit planning phase followed by execution), Reflection (generate, self-critique, and regenerate), and ReCode (sandboxed code-based reasoning with execution feedback). The router was trained offline on ~18,000 runs across 4 frontier LLMs (including GPT-5 and Claude variants) and 10 benchmarks spanning reasoning, coding, tool-use, and knowledge tasks.

The central empirical finding is that no single paradigm dominates the benchmark suite. ReAct outperforms alternatives on GAIA by 44 percentage points but underperforms on HumanEval by 15 points relative to CoT. Direct outperforms all reasoning-heavy paradigms on knowledge retrieval tasks. Paradigm routing improves aggregate accuracy from 47.6% to 53.1%, recovering 37% of the achievable improvement between the best fixed-paradigm baseline (50.3%) and the oracle upper bound (55.4%). Importantly, zero-shot self-routing G�� where the model itself chooses the paradigm G�� only works reliably for GPT-5, meaning that for most models explicit routing via a trained selector is necessary to capture the gains. This meta-skill adapts the Select-then-Solve router into a Vidbyte-native two-stage architecture, adding a second routing layer that selects the reasoning trace strategy within the chosen paradigm.

## Algorithm

### Step 1 G�� Detect Invocation

Check if the user's prompt starts with `/paradigm-routing-reasoning` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage guidance.
- If yes with text: proceed to Step 2.

### Step 2 G�� Clarify the Problem

Read the user's problem and determine whether it is sufficiently specified to route and execute. If the problem is genuinely ambiguous or could reasonably be interpreted in multiple incompatible ways, ask exactly one clarifying question before routing. Do not guess the problem type G�� a wrong classification cascades through both routing stages.

If the problem is well-specified, restate it with its constraints, domain, and evidence standard, then proceed.

### Step 3 G�� Web Search for Skills if Not Installed

Before selecting a Vidbyte trace strategy, verify the skill is available. If the skill catalog embedded below is not accessible or the target skill appears to be missing from the current installation, perform a web search to locate the latest Vidbyte skills repository or equivalent skill source. Do not proceed with an unavailable skill G�� fall back to the closest available strategy and note the substitution.

### Step 4 G�� Paradigm Routing Analysis

Evaluate the clarified problem against all six paradigms using the routing criteria established by Select-then-Solve. For each paradigm, assess:

- **Direct**: Is the answer known with high confidence and requires no intermediate reasoning? Does the problem involve factual retrieval or simple transformation?
- **Chain-of-Thought (CoT)**: Does the problem require multi-step logical or mathematical reasoning where intermediate steps improve correctness? Is the reasoning path linear and deterministic?
- **ReAct**: Does the problem require external information, tool calls, or environment interaction? Does reasoning and action need to interleave?
- **Plan-Execute**: Does the problem benefit from explicit decomposition into a plan before execution? Is there a complex multi-phase structure?
- **Reflection**: Does the problem have a verifiable solution where self-critique and revision would improve quality? Can the output be checked against a clear standard?
- **ReCode**: Does the problem involve computation, symbolic manipulation, or code execution where sandboxing the reasoning in a code environment would improve reliability?

Score each paradigm on suitability (not just presence/absence). Record the two strongest candidates and the specific features of the problem that drove the assessment.

### Step 5 G�� Select Paradigm with Justification

Select the single best paradigm. Write a brief justification that names:
1. The dominant characteristic of the problem that drove the selection
2. Why the chosen paradigm's core mechanism addresses that characteristic better than the runner-up
3. Any caution about what the paradigm is known to underperform on, if that applies to this problem

### Step 6 G�� Within Paradigm, Classify and Select Vidbyte Strategy

Inside the chosen paradigm, classify the problem into one of 11 reasoning domains (see Reasoning Arsenal below) and select the best-fit Vidbyte trace strategy from the catalog. The selected strategy must be groundable by the chosen paradigm G�� for example, a strategy requiring tool interaction must not be selected under the Direct paradigm.

Record the domain classification and the strategy selection with its slash command. If multiple strategies could fit, name the runner-up and the tradeoff that drove the primary selection.

### Step 7 G�� Execute

Apply the selected strategy's algorithm within the chosen paradigm's interaction pattern. For example, if the router selected CoT and the strategy selected is Causal Reasoning, produce a stepwise chain-of-thought structured by the causal reasoning algorithm. If the router selected ReAct and the strategy is Decision Tree, interleave reasoning about the decision tree with any tool calls needed for evidence.

Follow the strategy's standard execution protocol: restate the question, apply the core move, produce numbered reasoning items, record assumptions and uncertainty, and synthesize a final answer.


### Step 8 G�� Reference the Trace Skill for Implementation Guidance

As you execute this algorithm, reference the `paradigm-routing-trace` skill file for detailed implementation guidance on each reasoning step. The trace skill provides the canonical format, output structure, and quality standards for recording the reasoning that this meta-skill orchestrates. When the algorithm says to apply a reasoning strategy, consult the trace skill's Background Information and Algorithm sections to understand how that strategy's core move is structured and what a complete execution looks like.

### Step 9 G�� Write Trace with Both Routing Decisions

Derive `{question_name}` from the user's question by lowercasing, replacing non-alphanumeric runs with hyphens, and trimming extra hyphens. Write the reasoning trace to `memory/{question_name}.md` with these sections:

```
Question:        (restated question with constraints)
Paradigm:        (selected paradigm with justification)
Strategy:        (selected Vidbyte strategy with slash command and justification)
Scale:           (default G�� aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens)

Scratchpad:
[Numbered reasoning items structured by both the paradigm's interaction pattern
 and the strategy's algorithm. Every numbered item contributes a question,
 observation, test, comparison, inference, or synthesis.]

Synthesis:
[Compressed summary connecting the routing decisions to the reasoning and the conclusion.]

Final Answer:
[The conclusion with any important remaining uncertainty.]
```

Respond to the user with the file path, the paradigm and strategy selected with brief justifications, and a summary of the final answer.

## Reasoning Arsenal

The Reasoning Arsenal is the complete catalog of Vidbyte reasoning strategies that this meta-skill can pair with. Each entry below describes what the strategy does, when to use it, and what its core reasoning move is. When this meta-skill delegates reasoning tasks to a base strategy, it selects from the strategies listed in this Arsenal � the Arsena is the bridge between the meta-skill''s orchestration logic and the specific reasoning technique that answers the user''s problem. If a strategy is not in this Arsenal, this meta-skill cannot use it.

If a required reasoning skill is not found in the local `skills/` directory, you should install it via the Vidbyte CLI. The Vidbyte CLI provides access to all Vidbyte reasoning skills and can be installed by running the appropriate terminal command for your operating system. Once installed, use the CLI to download any missing reasoning skills before proceeding with analysis. If the Vidbyte CLI is not yet available, search the Vidbyte skills repository for the strategy by name. The full catalog of available reasoning skills is maintained in `skills-manifest.json` at the repository root � any skill listed there can be installed and used by this meta-skill.

### Causal & Diagnostic

**Five Whys** drills down through successive "why" layers to find the root cause beneath symptoms. Best for single-cause failures and straightforward debugging. Use it when you suspect a single root cause beneath visible symptoms.

**Root Cause Analysis** maps the full causal tree � direct causes, contributing factors, and systemic conditions � rather than stopping at one root. Best for complex failures with multiple interacting causes. Use it when fixing one factor without addressing systemic conditions would let the failure recur.

**Causal Reasoning** constructs a causal model linking causes to effects with explicit mechanisms and counterfactuals. Best for understanding causal mechanisms and planning interventions with predictable effects.

**Fishbone (Ishikawa)** categorizes potential causes into standardized branches (people, process, technology, environment, materials, measurement). Best for structured cause brainstorming in manufacturing or process problems.

**Fault Tree** builds a top-down Boolean tree of events connected by AND/OR gates leading to a top-level failure. Best for reliability engineering and computing failure probabilities in complex systems.

**Bowtie Risk** maps causes (left), the central risk event (center), and consequences (right) with preventive and mitigative barriers. Best for risk management and demonstrating barrier adequacy in safety cases.

**Event Tree** forward-chains from an initiating event through a sequence of possible outcomes, branching at each barrier or decision point. Best for accident progression and scenario analysis after a trigger event.

**Bottleneck Analysis** identifies the single constraint that most limits throughput or performance in a system. Best for performance debugging and process optimization where one constraint dominates.

**Correlation vs Causation** systematically distinguishes spurious correlations from genuine causal relationships by testing for confounding, reverse causation, and coincidental alignment. Best for evaluating causal claims in observational data.

**Regression Reasoning** models relationships between variables and quantifies effect sizes while accounting for confounds. Best for data-driven causal estimation with numeric data.

**Dependency Mapping** maps what depends on what, identifying critical paths and single points of failure. Best for infrastructure analysis and cascade-risk assessment.

### Logical & Formal

**Deductive Reasoning** derives conclusions from premises through logically necessary steps � if premises are true, the conclusion must be true. Best for problems where rules or axioms fully determine the answer.

**Inductive Reasoning** generalizes from specific observations to broader patterns or principles. Best for pattern recognition and theory building from examples, with probable but not certain conclusions.

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

**Expected Value** weights each outcome by its probability to compute the probability-weighted average result. Best for risky decisions with probabilistic payoffs.

**Tradeoff Matrix** scores options across weighted criteria to surface the best-balanced choice. Best for multi-criteria decisions where no option dominates on every dimension.

**Satisficing** finds the first option that meets all minimum acceptability thresholds rather than optimizing. Best for time-constrained decisions where "good enough" suffices.

**Regret Minimization** evaluates options by the maximum regret you would feel � and minimizes that maximum. Best for irreversible, high-stakes decisions.

**Opportunity Cost** evaluates what you give up by choosing each option � the value of the foregone alternative. Best for resource allocation tradeoffs.

**Utility Analysis** models preferences as a utility function and maximizes expected utility. Best for decisions involving risk preferences and subjective value.

**Minimax** chooses the option that minimizes your maximum possible loss. Best for adversarial decisions and worst-case planning.

**Values Tradeoff** surfaces and weighs competing values when options optimize for different principles. Best for ethical decisions and mission-level tradeoffs.

**AB Testing** designs and analyzes controlled experiments comparing two variants. Best for empirical product and UI decisions.

### Probabilistic & Forecasting

**Bayesian Reasoning** updates belief probabilities as evidence arrives using Bayes'' theorem. Best for evidence-based belief revision and diagnostic reasoning with base rates.

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

**First Principles** deconstructs a problem to fundamental truths and rebuilds from those foundations. Best for radical redesign and breaking out of conventional thinking.

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

**Devil''s Advocacy** argues the strongest possible case against your position. Best for testing conviction strength and surfacing hidden weaknesses.

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

**Theory of Constraints** identifies the system''s bottleneck and subordinates everything to maximizing flow through it. Best for throughput optimization.

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

**Porter''s Five Forces** analyzes competitive intensity through supplier power, buyer power, rivalry, substitutes, and new entrants. Best for industry analysis and market entry decisions.

**Stakeholder Analysis** maps who is affected, their interests, influence, and needs. Best for project planning and change management.

**Game Theory** models strategic interactions where outcomes depend on all players'' choices. Best for competitive strategy and negotiation.

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

- Invocation is detected correctly G�� the skill activates only for `/paradigm-routing-reasoning` and is silent otherwise.
- The problem is clarified before any routing decision is made; ambiguous problems receive exactly one clarifying question.
- All six paradigms are tested against the problem's characteristics, with explicit suitability scores and recorded reasoning for each assessment.
- The paradigm selection is justified with a specific, problem-grounded rationale that names the dominant characteristic, why the chosen paradigm addresses it, and any known limitation to watch.
- The domain classification follows Vidbyte's 11-domain taxonomy and is traceable to the problem's actual characteristics rather than keyword matching.
- The Vidbyte strategy is selected from the full catalog with its slash command, and the selection is justified by matching the problem's dominant characteristic against the strategy's core move.
- The strategy is actually executed within the paradigm's interaction pattern G�� the trace contains numbered reasoning items, not a description of the strategy.
- A durable reasoning trace is written to `memory/{question_name}.md` with sections Question, Paradigm, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
- Both routing decisions G�� paradigm and strategy G�� are recorded in the trace with their justifications.
- The scratchpad contains approximately 100 numbered lines or roughly 2,000 to 3,500 tokens, adapted to problem complexity.
- Assumptions, missing evidence, disconfirming signals, and uncertainty are recorded in the trace.
- The response to the user includes the file path, the paradigm and strategy selected with justifications, and a summary of the final answer.
- No strategy is executed that conflicts with the chosen paradigm's capabilities (e.g., no ReAct-required strategy under Direct).
- Runner-up paradigm and runner-up strategy are optionally noted when the decision was close.
- The trace is auditable G�� a reviewer can reconstruct every routing and reasoning decision from the artifact.

## Things Not to Do

- Do not skip paradigm routing and default to a single paradigm. The entire point of this meta-skill is that paradigm selection is an optimizable first step.
- Do not route a problem requiring multi-step reasoning to the Direct paradigm. Direct is for problems where the answer is known with high confidence and requires no intermediate reasoning.
- Do not route a knowledge-retrieval or simple transformation problem to ReAct or Plan-Execute. Heavyweight paradigms impose unnecessary overhead on simple problems.
- Do not route without recording justification. Every paradigm selection must name a problem characteristic that drove the decision G�� "because it feels right" is not a justification.
- Do not select a Vidbyte strategy that requires tool-use, environment interaction, or code execution unless the chosen paradigm supports those capabilities.
- Do not execute a strategy before verifying it is available in the skill catalog. If missing, search for it or fall back with an explicit substitution note.
- Do not produce a trace where the paradigm and strategy appear interchangeable. The paradigm shapes how reasoning happens (stepwise, interleaved, reflective); the strategy shapes what is reasoned about (causal chains, decision criteria, creative alternatives).
- Do not skip writing the trace to disk. The artifact at `memory/{question_name}.md` is the durable output, and it must contain both routing decisions.

## Input

**Required G�� Invocation:** `/paradigm-routing-reasoning <problem description>` G�� The user's problem or question. The more precisely the problem's domain, constraints, and desired output are described, the more accurate both routing stages will be and the higher the quality of the resulting reasoning trace.

**Implicit G�� Paradigm taxonomy:** The six-paradigm Select-then-Solve taxonomy (Direct, CoT, ReAct, Plan-Execute, Reflection, ReCode) with routing criteria from Zhou et al (2026). Used to evaluate the problem against all paradigms in Step 4.

**Implicit G�� Vidbyte strategy catalog:** The full set of Vidbyte reasoning trace strategies organized across 11 domains. Used to select and execute the best-fit strategy in Step 6.
