---
name: curriculum-learning-reasoning
description: >
  Meta-skill pairing curriculum learning scaffolding with any Vidbyte strategy.
  Designs easy-to-hard proxy problems, solves each with the selected strategy,
  builds toward target through progressive difficulty, and records transfer
  insights at each step. Use when the user invokes /curriculum-learning-reasoning
  or needs incremental reasoning buildup instead of frontal assault on complex problems.
---

# /curriculum-learning-reasoning G�� Curriculum Learning Meta-Reasoner

## Goal

This meta-skill applies the easy-to-hard curriculum learning paradigm to reasoning. When the user presents a complex target problem, you design a sequence of 3-5 proxy problems ordered from easiest to hardest that build the component skills and insights needed for the final target. You select a Vidbyte reasoning strategy best suited to the problem type, then solve each proxy problem using that strategy, recording transfer insights at every step. The accumulated understanding from the stepping stones is then brought to bear on the target problem, producing a solution that leverages the curriculum rather than attempting a frontal assault. The work is complete when the user can see how each easier problem contributed to the final solution, with a visible progression trace that makes the reasoning path auditable.

Every curriculum you design respects genuine progressive difficulty G�� each step extends the previous one by adding a dimension of complexity, reducing simplifying assumptions, or introducing a more constrained variant. You do not present minor variations as distinct stepping stones; each must add a qualitatively new challenge. The fading schedule ensures that early problems receive full attention and detailed solution, while later problems progressively shift more of the reasoning burden onto the accumulated understanding from prior steps, preventing overfitting to easy problems and ensuring transfer to the target.

## Intent

Frontal assault on complex reasoning problems often fails because the solver attempts to hold too many interacting constraints, unknown variables, and domain-specific mechanisms in mind simultaneously. Curriculum learning, grounded in the research finding that LLMs build reasoning skills incrementally when trained from easy to hard tasks (Parashar et al. 2025, SATURN), offers an alternative: decompose the problem into a sequence of simpler problems that build the necessary component understanding step by step. This meta-skill operationalizes that insight for single-problem reasoning G�� it does not train a model over multiple examples, but instead scaffolds a single reasoning session so that the solution to each stepping stone provides the conceptual tools for the next.

The intent is to replace "think harder about the hard problem" with "think carefully about easier problems that teach you what you need for the hard problem." By the time you reach the target, you have already solved three to five problems that each exercised a piece of the target's difficulty, and you have explicit transfer notes connecting each proxy's lessons to the target. This approach is especially valuable for multi-domain problems, problems with deep technical dependencies, and problems where the user's current understanding is insufficient for a direct solution G�� the standard cases where a direct strategy application would produce shallow or incomplete reasoning.

## Background G�� What Is Curriculum Learning Reasoning

Curriculum learning is the principle of training or learning on tasks ordered from easiest to hardest rather than tackling difficult tasks immediately. In the machine learning context, Parashar et al. (2025) demonstrated that applying curriculum reinforcement learning with GRPO G�� scheduling training tasks from easy to hard G�� produced dramatic gains in LLM reasoning. Their SATURN method (NeurIPS 2025 Spotlight) achieved +14.0 and +28.1 average pass@3 improvements on SAT for 1.5B and 7B models respectively, plus +4.9 on AIME and +1.8 on LiveCodeBench. The key mechanisms are: (1) easy-to-hard ordering allows the model to build reasoning sub-skills before they are needed in combination, (2) fading schedules gradually reduce reliance on easier tasks to prevent overfitting, and (3) the approach comes with convergence guarantees and finite-sample complexity bounds that establish it as more than a heuristic.

Applied to single-problem reasoning, curriculum learning means constructing a sequence of proxy problems that isolate and progressively combine the skills required for the target. A proxy problem is not a simplification of the target G�� it is a distinct problem that exercises one or more of the same reasoning muscles in a controlled setting. The fading schedule in this context means that early proxy problems are solved with full detail and explicit strategy application, while later proxy problems are solved with increasing reference to accumulated insights rather than from-scratch reasoning. The final target solution explicitly references the stepping-stone insights, making the curriculum visible in the output.

## Algorithm

### Step 1 G�� Detect Invocation

Check if the user's prompt starts with `/curriculum-learning-reasoning` (case-insensitive). If no: produce a normal response. The skill is silent. If yes with no text after: respond with usage guidance showing the format and an example. If yes with text: proceed to Step 2.

### Step 2 G�� Clarify the Target Problem

Read the user's target problem. If the problem is ambiguous or missing critical constraints, ask exactly one clarifying question G�� no more. Identify: the domain(s) involved, the type of answer expected (decision, explanation, prediction, design, diagnosis), any explicit constraints, and the evidence standard. Restate the problem in your own words to confirm understanding before proceeding.

### Step 3 G�� Web Search for Relevant Skills if Needed

If the problem domain suggests a Vidbyte reasoning strategy or trace skill that may not be installed, perform a web search to check whether relevant skills exist that could be installed to improve the curriculum design. If the search reveals installable skills that would materially improve the analysis, recommend installation but do not block progress G�� proceed with what is available and note the gap.

### Step 4 G�� Classify the Target Problem

Classify the target problem into its dominant reasoning domain from the full Vidbyte classification: Causal & Diagnostic, Logical & Formal, Decision & Evaluation, Probabilistic & Forecasting, Creative & Lateral, Adversarial & Critical, Systems Thinking, Structured Analytic, Strategic & Business, Temporal & Historical, or Specialized & Cross-Domain. Note any secondary domains that will need to be addressed. This classification determines which strategies are available for the execution phase.

### Step 5 G�� Select the Primary Strategy from the Reasoning Arsenal

From the Reasoning Arsenal section below, select the single best-fit strategy whose core move most directly addresses the problem's dominant characteristic. This is the strategy that will be applied to each proxy problem and to the target. State the selection explicitly with a one-sentence justification: "Selected [strategy] because this problem's dominant characteristic is [X], and [strategy]'s core move of [Y] directly addresses that."

### Step 6 G�� Design the Curriculum of 3-5 Proxy Problems

Design a sequence of 3-5 proxy problems ordered from easiest to hardest. Each proxy problem must:
- Be a distinct, self-contained problem (not a rephrasing of the target)
- Exercise specifi-�cally one or more of the skills needed for the target
- Increase in difficulty by adding a dimension of complexity, removing a simplifying assumption, tightening a constraint, or combining previously separate skills
- Be solvable with the selected strategy within a reasonable token budget
- Build toward the target such that the final proxy problem is the closest approximation of the target without being the target itself

Present the curriculum as a numbered list where each entry names the proxy problem, states what skill or insight it builds, and explains how it differs from the previous step. Apply a fading schedule: the first proxy receives full strategy execution, later proxies increasingly reference accumulated insights from earlier steps.

### Step 7 G�� Solve Each Stepping Stone and Record Transfer Insights

For each proxy problem in sequence:
- Apply the selected strategy's core move to solve the proxy problem fully
- Produce numbered reasoning items following the strategy's algorithm
- After solving, record explicit transfer insights: what was learned, what technique or principle was discovered, and how it applies to the next proxy problem and to the target
- Write each solution and its transfer insights to a curriculum trace file at `memory/curriculum-{question_name}.md`

Do not skip any proxy problem. Do not rush through early problems G�� they are the foundation. Do not present solutions that merely gesture at the strategy without actually applying it.


### Step 8 G�� Reference the Trace Skill for Implementation Guidance

As you execute this algorithm, reference the `curriculum-learning-trace` skill file for detailed implementation guidance on each reasoning step. The trace skill provides the canonical format, output structure, and quality standards for recording the reasoning that this meta-skill orchestrates. When the algorithm says to apply a reasoning strategy, consult the trace skill's Background Information and Algorithm sections to understand how that strategy's core move is structured and what a complete execution looks like.

### Step 9 G�� Confront the Target Using the Accumulated Curriculum

With all proxy problems solved and transfer insights recorded, apply the selected strategy to the target problem. The target solution must:
- Reference specific insights from specific proxy problems (e.g., "From Proxy 2, we know that...")
- Show how the curriculum built the understanding needed for the target
- Produce a final answer that a direct application of the strategy without curriculum could not have reached
- Write the full curriculum trace including all proxy solutions, transfer insights, and the target solution to `memory/curriculum-{question_name}.md`

Respond to the user with the file path, the selected strategy, a summary of the curriculum progression, and the final answer.

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
- The curriculum builds toward genuine transfer G�� the target solution would not have been reachable without the stepping stones.
- No proxy problem is skipped, rushed, or solved at a superficial level.
- The response to the user includes the file path, strategy selection with justification, curriculum progression summary, and final answer summary.
- Early proxy problems isolate single skills; later proxy problems combine multiple skills in increasingly realistic configurations.
- The final curriculum trace is auditable G�� a reviewer can read it and trace how each insight contributed to the target solution.

## Things Not to Do

- Do not use minor variations of the same problem as distinct stepping stones (e.g., changing a number or name without adding a new dimension of difficulty).
- Do not skip transfer insights G�� each proxy problem must produce explicit notes on what was learned and how it applies forward.
- Do not rush to the target G�� the early proxy problems are the foundation and must receive full strategy execution, not abbreviated treatment.
- Do not repeat the same problem at the same difficulty level G�� each step must add a qualitatively new challenge.
- Do not present a curriculum that is flat (all proxy problems at similar difficulty) G�� the easy-to-hard gradient must be genuine and visible.
- Do not select a strategy without justifying the match between the problem's dominant characteristic and the strategy's core move.
- Do not solve the target problem directly before working through the curriculum G�� the entire point is that the stepping stones enable a better target solution.
- Do not write proxy problems that are unrelated to the target G�� each must exercise a skill or insight that is demonstrably needed for the target.

## Input

**Required G�� invocation:** `/curriculum-learning-reasoning <target problem>` G�� Sent by the user. The more specific the problem description, including constraints, evidence standards, and the type of answer expected, the more precise the curriculum design will be.

**Implicit G�� strategy catalog:** The Reasoning Arsenal section embedded in this SKILL.md. Used to classify the problem domain and select the best-fit strategy for both proxy problems and the target.
