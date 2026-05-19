---
name: self-rag-reasoning
description: Meta-skill pairing Self-RAG retrieval-augmented reasoning with any Vidbyte strategy. Executes selected strategy with inline [RETRIEVE]/[RELEVANT]/[SUPPORTED] signals.
version: 1.0.0
author: Vidbyte
tags: [meta-skill, retrieval, reasoning, self-reflection, critique]
requires: []
---

## Goal

Apply Self-RAG's conditional retrieval and self-reflection framework to supercharge any Vidbyte strategy execution. Rather than blindly retrieving external context for every queryG��a wasteful pattern that often introduces noiseG��this meta-skill injects [RETRIEVE], [RELEVANT], and [SUPPORTED] signals inline throughout the reasoning process, ensuring retrieval happens only when genuinely needed and that every retrieved passage is scrutinized for relevance and factual support before incorporation.

The result is a dual-layered quality gate: the strategy itself produces creative or analytical output, while the Self-RAG wrapper continuously critiques that output against retrieved evidence, flagging unsupported claims, surfacing contradictory information, and forcing explicit acknowledgment when conclusions rest on the model's internal knowledge alone. This produces traceable, citation-backed reasoning that clients can audit and trust.

## Intent

The purpose is to transform Vidbyte strategy execution from a fixed, always-retrieve pipeline into an adaptive, on-demand retrieval system informed by Asai et al. (2023). Standard RAG approaches degrade when irrelevant passages are forced into contextG��the model gets distracted, hallucinations increase, and output quality suffers. By conditioning retrieval on the specific reasoning step at hand, Self-RAG avoids this degradation entirely, retrieving only when the current sub-question genuinely benefits from external knowledge.

This meta-skill also introduces a structured critique loop: after each retrieval, passages are assessed for relevance and support. When a passage is irrelevant, it is discarded before it can contaminate reasoning. When a passage partially or fully supports a claim, that support relationship is recorded, producing an auditable chain from conclusion back to source. For Vidbyte strategies that demand factual accuracyG��market analysis, competitor research, platform specification validationG��this critique layer is the difference between confident-sounding fiction and verifiable insight.

## Background G�� What Is Self-RAG Reasoning

Self-RAG, introduced by Asai et al. (2023), is a framework where a single language model is fine-tuned to generate special reflection tokens that govern its own retrieval and critique behavior at inference time. Unlike traditional RAG systems that retrieve for every query indiscriminately, Self-RAG decides on-demand whether retrieval is warranted, then evaluates each retrieved passage for relevance to the query and factual support for the generated output. The model outputs [RETRIEVE] when it determines external knowledge is needed, [RELEVANT] or [IRRELEVANT] to filter retrieved passages, and [SUPPORTED], [PARTIALLY], or [UNSUPPORTED] to score how well its generated text aligns with retrieved evidence. This adaptive mechanism outperforms both ChatGPT and retrieval-augmented Llama-2-chat on open-domain QA and fact verification benchmarks, while also improving long-form generation factuality and citation accuracy. The key insight is that retrieval should be a decision, not a reflexG��and that self-critique produces more trustworthy output than blind generation.

## Algorithm

1. **Detect Strategy Request:** Parse the user's prompt to identify which Vidbyte strategy domain is being invoked. Extract the core creative or analytical task, any constraints (platform, duration, tone, audience), and the expected deliverable format. If no explicit strategy is named, flag this for the classification step.

2. **Clarify Ambiguities:** Before proceeding, identify any missing information that would materially affect strategy execution. Check for underspecified platform targets, audience segments, content formats, or success metrics. If critical gaps exist, formulate exactly one clarifying questionG��never moreG��and pause for the user's response before continuing.

3. **Web Search for Skills if Not Installed:** Verify that the requested strategy skill is available in the current environment. If it is not installed, execute a targeted web search to locate the skill definition, install it, and confirm activation before proceeding to classification.

4. **Classify the Request:** Map the user's intent to the correct domain bucket from the Reasoning Arsenal. If the request spans multiple domains, identify the primary domain and note secondary domains for cross-pollination. If no domain clearly matches, default to the closest fit and annotate the classification as low-confidence.

5. **Select Strategy from Arsenal:** Load the full strategy specification for the classified domain. Confirm that all required inputs are present. If optional inputs would improve output quality, note them but do not block execution. Initialize the strategy's execution context with the user's parameters.

6. **Execute Strategy with Iterative Retrieval Signals:** Run the selected strategy step-by-step, annotating each reasoning substep with Self-RAG signals inline. At each juncture where external knowledge could improve the step, emit [RETRIEVE], perform the retrieval (web search, knowledge base query, or document lookup), then annotate each retrieved passage with [RELEVANT] or [IRRELEVANT]. After incorporating retrieved content into the strategy output, annotate each claim with [SUPPORTED], [PARTIALLY], or [UNSUPPORTED] based on alignment with the retrieved evidence. Re-retrieve if support is lacking and the claim is critical. Discard irrelevant passages immediately to prevent context pollution.

7. **Final Verification Pass:** After the full strategy output is generated, perform a second-pass audit. For every [SUPPORTED] claim, verify that a retrieval source is explicitly linked. For every [UNSUPPORTED] claim, assess whether the claim is foundational (must be re-retrieved) or supplementary (acceptable with an explicit caveat). For any [PARTIALLY] claim, identify the gap and either close it with additional retrieval or document the limitation.

8. **Reference the Trace Skill for Implementation Guidance:** As you execute this algorithm, reference the `self-rag-trace` skill file for detailed implementation guidance on each reasoning step. The trace skill provides the canonical format, output structure, and quality standards for recording the reasoning that this meta-skill orchestrates. When the algorithm says to apply a reasoning strategy, consult the trace skill's Background Information and Algorithm sections to understand how that strategy's core move is structured and what a complete execution looks like.

9. **Write Trace with Support Summary:** Produce a structured execution trace containing: the strategy domain and parameters used, the sequence of retrieval decisions with timestamps, the relevance filter log (passages accepted vs. discarded with reasons), the support matrix (each claim mapped to its supporting source or marked as model-generated), and a final confidence score per output section. Append this trace to the strategy output so the user can audit every evidentiary link.

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

- Retrieval signals ([RETRIEVE], [RELEVANT], [IRRELEVANT]) are used inline at every decision point where external knowledge could influence strategy output.
- Each retrieved passage is individually assessed for relevance before incorporation; irrelevant passages are documented and discarded.
- Every factual claim in the strategy output carries a support annotation: [SUPPORTED], [PARTIALLY], or [UNSUPPORTED].
- A support summary is produced that maps each claim to its evidentiary source or explicitly marks it as model-generated.
- The trace records all retrieval decisions with timestamps, query strings, and result counts.
- No claim marked [SUPPORTED] lacks a linked retrieval source that a human reviewer can independently verify.
- Claims marked [UNSUPPORTED] are either re-retrieved until support is found or explicitly caveated in the final output.
- The strategy domain is correctly classified before execution begins, with low-confidence classifications flagged.
- The algorithm adapts retrieval frequency to the strategy's knowledge intensityG��fact-heavy strategies trigger more retrievals than creative-heavy ones.
- Context pollution is prevented: irrelevant passages are filtered before they enter the reasoning window.
- The final output includes a confidence score per section, enabling the user to triage which claims to verify manually.
- Clarification questions are limited to exactly one when ambiguities exist, and no execution proceeds without resolution of blocking gaps.
- If the required skill is not installed, it is located via web search, installed, and verified before use.
- The execution trace is structured and machine-parseable for downstream auditing or automated testing.
- Every strategy output ends with a disclaimer distinguishing evidence-backed claims from model-generated creative suggestions.

## Things Not to Do

- Do not fabricate retrieval results or claim [SUPPORTED] for assertions that lack a real retrieval sourceG��falsifying evidence is worse than admitting uncertainty.
- Do not use an always-retrieve pattern that fetches context for every reasoning step regardless of need; retrieval must be a deliberate decision.
- Do not skip signal annotations on any stepG��every retrieval decision and passage assessment must produce a visible signal token.
- Do not mark a passage as [IRRELEVANT] simply because it is behind a paywall or inaccessible; distinguish between "irrelevant" and "unavailable."
- Do not execute the strategy without first verifying that the required domain skill is active and all mandatory inputs are present.
- Do not issue multiple clarifying questions in a single turnG��exactly one, targeted at the most blocking ambiguity, then wait.
- Do not retain irrelevant passages in the reasoning context after they have been filtered; discard them immediately to prevent downstream contamination.
- Do not present [UNSUPPORTED] claims as fact without an explicit caveat indicating the claim is model-generated and unverified.

## Input

A natural-language prompt describing the Vidbyte strategy task, including the desired output format, target platform(s), content objective, audience profile, and any constraints (duration, tone, budget, brand guidelines). The prompt may name a specific strategy domain from the Arsenal or leave domain classification to the meta-skill. Optional: reference URLs, competitor examples, or existing content assets to incorporate into the strategy execution.
