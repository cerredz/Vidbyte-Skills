---
name: mixture-of-agents-reasoning
description: Meta-skill pairing mixture-of-agents layered refinement with any Vidbyte reasoning strategy. 3 layers (Proposer, Refiner, Synthesizer) each applying the selected strategy, with each layer receiving all previous-layer outputs as context for progressive quality improvement.
version: 1.0.0
author: Vidbyte
tags: [meta-skill, mixture-of-agents, layered, refinement, reasoning, collective-expertise]
requires: []
---

# /mixture-of-agents-reasoning G�� Mixture of Agents Meta-Reasoner

## Goal

Pair mixture-of-agents layered refinement with any Vidbyte reasoning strategy to produce answers that benefit from structured, progressive quality improvement across multiple heterogeneous model layers. Three processing layersG��the Proposer layer, the Refiner layer, and the Synthesizer layerG��each contain multiple agents that independently apply the selected reasoning strategy, receive all outputs from preceding layers as auxiliary context, and generate outputs that the next layer uses as input. The result is an assembly-line architecture where each layer adds a measurable quality delta: the Proposer layer generates diverse initial approaches, the Refiner layer critiques and improves them, and the Synthesizer layer aggregates the refined outputs into a final answer that outperforms what any single agent or single layer could produce alone.

This meta-skill operationalizes Wang et al.'s (2024) collective expertise hypothesis: that structured aggregation of heterogeneous model outputs across layers can surpass the best individual model's performance. The open-source MoA ensemble achieved 65.1% on AlpacaEval, beating GPT-4 Omni's 57.5%, demonstrating that layered refinement with diverse proposers and aggregators can produce emergent quality beyond any constituent model. The trace captures the full refinement pipelineG��initial proposals, refiner critiques and improvements, and synthesizer aggregationG��so the user can audit how quality accumulated across layers and why the final output is stronger than any layer's individual contribution.

## Intent

The purpose is to apply the mixture-of-agents (MoA) architectureG��formalized by Wang et al. (2024) in "Mixture-of-Agents Enhances LLM Capabilities"G��as a quality-amplification wrapper around Vidbyte strategy execution. Single-agent reasoning, even with a rigorous strategy, is bounded by that agent's individual capability ceiling. By structuring execution as a layered pipeline where each layer sees and improves upon all previous-layer outputs, MoA creates a ratchet mechanism: quality can only stay the same or improve at each layer, never degrade, because each layer's agents use previous outputs as augmenting context and are free to produce better answers but not required to accept worse ones. This architecture is fundamentally different from debateG��it is an assembly line, not an argumentG��and its strength comes from iterative refinement rather than adversarial pressure.

This meta-skill also exploits the MoA finding that output quality scales with both layer count and model diversity. More layers produce higher quality, but diminishing returns set in as layers converge on similar outputs. Heterogeneous agents within each layerG��models or reasoning postures that differ in their strengths, weaknesses, and characteristic approachesG��prevent premature convergence and maintain the quality gradient that makes layering valuable. The Proposer layer generates diverse starting points so the Refiner layer has meaningful variation to work with. The Refiner layer improves the best proposals while preserving diversity. The Synthesizer layer distills the refined set into a single coherent answer. By tracking quality deltas between layersG��what changed, what improved, and whyG��the trace reveals where the MoA architecture added the most value and where further layers would yield diminishing returns.

## Background G�� What Is Mixture of Agents Reasoning

Mixture of Agents reasoning, introduced by Wang et al. (2024), is a layered architecture for language model orchestration where each layer contains multiple LLM agents that process all outputs from the previous layer as context before generating their own outputs. Unlike multi-agent debate, which uses adversarial critique and revision rounds, MoA uses progressive refinement: each layer's agents see what every agent in the previous layer produced and use that as augmenting context to generate improved outputs. The architecture achieved 65.1% on AlpacaEval using an open-source ensemble, surpassing GPT-4 Omni's 57.5%G��a result that operationalizes the collective expertise hypothesis: that structured aggregation of heterogeneous model outputs across layers can generate emergent quality beyond any individual model's capability. The architecture has two phases: proposal (initial layers generate diverse candidate outputs) and aggregation (final layers synthesize the best elements of the candidate set into a single output). Key design parameters include the number of layers, the number and diversity of agents per layer, and the prompt template that governs how each agent incorporates previous-layer outputs. Wang et al. demonstrated that quality scales monotonically with layer count up to a saturation point, that agent diversity within layers prevents premature convergence, and that hierarchical aggregation (multiple synthesis layers rather than a single final aggregation) produces higher quality than flat, single-step aggregation. The architecture's strength is its composability: any model can serve as a proposer or aggregator, making it a general-purpose quality-amplification wrapper rather than a model-specific technique.

## Algorithm

1. **Detect Invocation:** Parse the user's prompt to identify which Vidbyte reasoning strategy domain is being invoked. Extract the core question, constraints (platform, duration, audience, evidence standards), and expected deliverable format. If no explicit strategy is named, flag this for the classification step. Confirm that the mixture-of-agents meta-skill is active and that the three-layer architecture is loaded.

2. **Clarify Ambiguities:** Before proceeding, identify any missing information that would materially affect strategy execution or layer refinement. Check for underspecified objectives, audience segments, success criteria, or evidence standards. If critical gaps exist, formulate exactly one clarifying questionG��never moreG��and pause for the user's response before continuing. Pipeline quality depends on clear input specification; ambiguity propagates across layers and degrades all downstream outputs.

3. **Web Search for Skills if Not Installed:** Verify that the requested domain strategy skill is available in the current environment. If it is not installed, execute a targeted web search to locate the skill definition, install it, and confirm activation before proceeding to classification. The MoA meta-skill requires the underlying strategy skill for each layer's agents to apply.

4. **Classify the Request:** Map the user's intent to the correct domain bucket from the Reasoning Arsenal. If the request spans multiple domains, identify the primary domain and note secondary domains for cross-pollination during refinement. If no domain clearly matches, default to the closest fit and annotate the classification as low-confidence. The strategy classification determines which reasoning move each layer's agents will apply.

5. **Select Strategy from Arsenal:** Load the full strategy specification for the classified domain. Confirm that all required inputs are present. If optional inputs would improve output quality or refinement depth, note them but do not block execution. Initialize the execution context with user parameters and define the layer configuration: number of agents per layer (default 2-3 proposers, 2 refiners, 1 synthesizer), the refinement prompt template (how agents incorporate previous-layer outputs), and the quality tracking format (how deltas between layers will be measured and reported).

6. **Execute Three Layers with Quality Tracking:** Run the MoA pipeline through three structured layers, capturing all intermediate outputs and quality deltas. **Layer 1 G�� Proposer Layer (Diverse Generation):** Multiple agents independently apply the selected strategy to produce initial candidate solutions. The goal is diversity: proposers should approach the problem from different angles, emphasize different considerations, and produce recognizably distinct outputs. Record each proposer's output and a brief self-assessed quality note. **Layer 2 G�� Refiner Layer (Improvement and Critique):** Multiple agents receive all Layer 1 outputs as context and produce refined versions. Each refiner assesses the proposers' outputs, identifies the strongest elements across them, addresses weaknesses, fills gaps, and produces an improved solution that demonstrably exceeds any single proposer's output. Record each refiner's output with explicit annotations of what was kept, what was changed, and why. **Layer 3 G�� Synthesizer Layer (Aggregation and Finalization):** A single synthesizer agent receives all Layer 2 outputs and produces the final answer. The synthesizer selects the best elements from across the refiner outputs, reconciles any remaining inconsistencies, ensures completeness against the original problem specification, and produces a polished, coherent final answer. Record the synthesizer's selection rationaleG��which elements came from which refiner, which elements were newly generated, and which elements were explicitly excluded and why.

7. **Measure and Report Quality Deltas:** After each layer completes, compute the quality delta: what improved between Layer 1 and Layer 2, and between Layer 2 and Layer 3. Quality deltas should be specific and claim-level, not generic ("output improved"). For each delta, identify which specific claims, arguments, or structural elements were added, strengthened, corrected, or removed. Track diversity across the pipeline: did the proposer layer produce genuinely diverse outputs, or did proposers converge prematurely? Did the refiner layer preserve or reduce diversity? Did the synthesizer capture the best from across the refined set?

8. **Reference the Trace Skill for Implementation Guidance:** As you execute this algorithm, reference the `mixture-of-agents-trace` skill file for detailed implementation guidance on each reasoning step. The trace skill provides the canonical format, output structure, and quality standards for recording the reasoning that this meta-skill orchestrates. When the algorithm says to apply a reasoning strategy, consult the trace skill's Background Information and Algorithm sections to understand how that strategy's core move is structured and what a complete execution looks like.

9. **Write Trace with Full Pipeline History:** Produce a structured execution trace containing: the strategy domain and parameters used, the layer configuration (agents per layer, refinement prompt template), each proposer's Layer 1 output with quality self-assessment, each refiner's Layer 2 output with keep/change/why annotations, the synthesizer's Layer 3 final answer with selection rationale, the quality delta report between each layer, and a final assessment of whether the MoA architecture produced a materially stronger answer than a single-agent execution would have. Append this trace to the strategy output so the user can audit how quality accumulated across the pipeline.

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

- Three distinct MoA layers are executed in full: the Proposer layer produces diverse initial candidate solutions, the Refiner layer produces improved versions with explicit keep/change/why annotations, and the Synthesizer layer produces a final aggregated answer with selection rationale.
- The Proposer layer generates recognizably diverse outputsG��at least two distinct approaches, emphases, or solution strategies that reflect genuine variation rather than superficial rewording.
- The Refiner layer demonstrably improves upon the proposer outputsG��each refiner output addresses weaknesses, fills gaps, or strengthens claims that were absent or weaker in the proposer outputs.
- The Synthesizer's selection rationale transparently traces which elements of the final answer came from which refiner output, which elements were newly generated, and which elements were explicitly excluded and why.
- Quality deltas are measured and reported between each layer, with specific, claim-level annotations of what improved rather than generic quality assertions.
- The final answer is materially stronger than what any single proposer producedG��the MoA architecture must add demonstrable value beyond single-agent execution.
- The selected strategy domain is correctly classified before the pipeline begins, and the strategy's core move is visibly applied by agents at every layer.
- The trace captures all intermediate outputs, quality deltas, and the synthesizer's selection rationale, enabling a human reviewer to audit how quality accumulated across the pipeline.
- If a layer produces no measurable improvement over the previous layer, this is reported honestly rather than forcing a quality delta that does not exist.
- Diversity is tracked across the pipeline: the trace reports whether proposer diversity was genuine, whether refiners preserved or reduced diversity, and whether the synthesizer captured the best from across the refined set.
- Clarification questions are limited to exactly one when ambiguities exist, and no execution proceeds without resolution of blocking gaps.
- If the required domain strategy skill is not installed, it is located via web search, installed, and verified before the pipeline begins.
- The trace includes a final assessment of whether the MoA architecture added value and whether additional layers would yield further quality improvement or diminishing returns.
- The execution trace is structured and self-contained, enabling downstream audit without requiring access to the original conversation context.
- Every layer's agents apply the selected strategy faithfullyG��the MoA architecture refines strategy execution, it does not replace or override the strategy's core move.

## Things Not to Do

- Do not skip layers or collapse multiple layers into a single stepG��the three-layer architecture (Proposer, Refiner, Synthesizer) is mandatory, and each layer must produce distinct, recorded output.
- Do not allow proposers to produce identical or near-identical outputsG��diversity in the proposer layer is essential for the refiner layer to have meaningful variation to work with, and premature convergence undermines the entire pipeline.
- Do not omit quality delta reportingG��every layer transition must include specific, claim-level annotations of what improved, what stayed the same, and what was removed.
- Do not present the Synthesizer as simply selecting "the best" refiner outputG��the Synthesizer must selectively combine elements from across the refined set, and its selection rationale must be explicit and per-element.
- Do not force quality improvement when a layer genuinely adds no valueG��if a refiner cannot improve upon the proposer outputs, or if the synthesizer cannot improve upon the refiner outputs, report this honestly rather than fabricating a quality delta.
- Do not select prompt skills, learning skills, or session-management skills as the underlying strategyG��only genuine reasoning trace strategies from the Arsenal may be paired with this meta-skill.
- Do not execute the pipeline without first verifying that the required domain strategy skill is active and all mandatory inputs are present.
- Do not issue multiple clarifying questions in a single turnG��exactly one, targeted at the most blocking ambiguity, then wait.

## Input

A natural-language prompt describing the Vidbyte strategy task, including the desired output format, target platform(s), content objective, audience profile, and any constraints (duration, tone, budget, brand guidelines). The prompt may name a specific strategy domain from the Arsenal or leave domain classification to the meta-skill. The mixture-of-agents wrapper operates automatically once the underlying strategy is identifiedG��no additional invocation syntax is required beyond the standard Vidbyte strategy prompt. Optional: explicit preference for layer count (more layers for higher quality at the cost of computational budget) or agent count per layer, though the default three-layer configuration with 2-3 proposers, 2 refiners, and 1 synthesizer is recommended for most tasks.
