---
name: multi-agent-debate-reasoning
description: Meta-skill pairing multi-agent debate with any Vidbyte reasoning strategy. 3 heterogeneous agents (Optimizer, Skeptic, Integrator) apply selected strategy, then debate in rounds toward consensus.
version: 1.0.0
author: Vidbyte
tags: [meta-skill, multi-agent, debate, reasoning, adversarial-collaboration, convergence]
requires: []
---

# /multi-agent-debate-reasoning G�� Multi-Agent Debate Meta-Reasoner

## Goal

Pair structured multi-agent debate with any Vidbyte reasoning strategy to produce answers that have survived adversarial collaboration. Three heterogeneous agentsG��the Optimizer, the Skeptic, and the IntegratorG��each independently apply the selected reasoning strategy to the user's problem, then engage in three structured debate rounds where they critique one another's positions, identify gaps, surface hidden assumptions, and revise toward convergence. The meta-skill records every position, critique, and revision transparently so the user can audit which claims survived scrutiny, which disagreements persisted, and where the consensus ultimately settled.

The result is reasoning that has been stress-tested from multiple angles before delivery. Rather than a single model producing a single answer with unknown blind spots, the debate architecture forces each claim to survive cross-examination from an agent with a deliberately different epistemic posture. Claims that survive the Optimizer's aggressive solution-finding, the Skeptic's systematic doubt, and the Integrator's demand for coherence are more robust than claims any single agent could produce alone. The trace preserves the full debate historyG��initial positions, critiques, revisions, and convergence pointsG��so the user sees not just what the answer is but why it withstood adversarial pressure and where residual uncertainty remains.

## Intent

The purpose is to apply the multi-agent debate (MAD) research techniqueG��formalized by Du et al. (2023) in "Improving Factuality and Reasoning through Multiagent Debate"G��to stress-test Vidbyte strategy execution through structured adversarial collaboration. Single-agent reasoning, even when the agent follows a rigorous strategy, is vulnerable to blind spots: confirmation bias, missing counterarguments, unexamined assumptions, and premature convergence on the first plausible answer. By instantiating three heterogeneous agents with deliberately distinct cognitive roles and forcing them to critique one another's outputs across three structured rounds, the meta-skill surfaces weaknesses that any single agent would miss and produces answers with measurable robustness.

This meta-skill also operationalizes a key finding from the MAD literature: homogeneous agent ensembles that simply vote or average do not consistently outperform single agents, because shared model biases produce correlated errors that majority voting cannot correct. Heterogeneous agentsG��each assigned a genuinely distinct epistemic roleG��create the cognitive diversity necessary for debate to generate insight rather than amplify error. The Optimizer pushes for the strongest possible solution, the Skeptic hunts for flaws and alternative explanations, and the Integrator demands that the final output cohere into a consistent, actionable whole. This is not three agents agreeing on the same answer; it is three agents with different priorities forcing one another to defend, refine, and reconcile their positions until convergence emerges from friction.

## Background G�� What Is Multi-Agent Debate Reasoning

Multi-agent debate reasoning operationalizes the insight that structured disagreement produces better answers than solitary deliberation. Rooted in Minsky's Society of Mind principleG��that intelligence emerges from the interaction of many simple, specialized agents rather than from a single monolithic reasonerG��MAD instantiates multiple language model instances with distinct cognitive roles and has them debate a question through successive rounds of position-stating, critique, and revision. Du et al. (2023) demonstrated that multi-agent debate improves both mathematical reasoning accuracy (measured on GSM8K) and factual accuracy (measured on truthfulness benchmarks), with successive debate rounds producing increasing convergence toward correct answers. The key mechanism is that each agent sees the others' responses and must either defend its position against specific critiques or revise in light of superior arguments, creating a selection pressure toward claims that can survive adversarial scrutiny. Critically, Du et al. found that heterogeneous agent configurationsG��where agents have distinct roles, personas, or reasoning stylesG��outperform homogeneous configurations where agents are identical, because homogeneous agents share the same blind spots and their debate devolves into mutual reinforcement rather than genuine adversarial testing. The debate architecture records disagreements transparently rather than forcing false consensus, ensuring that unresolved tensions are surfaced to the user rather than papered over.

## Algorithm

1. **Detect Invocation:** Parse the user's prompt to identify which Vidbyte reasoning strategy domain is being invoked. Extract the core question, constraints (platform, duration, audience, evidence standards), and expected deliverable format. If no explicit strategy is named, flag this for the classification step. Confirm that the multi-agent-debate meta-skill is active and that all agent role definitions are loaded.

2. **Clarify Ambiguities:** Before proceeding, identify any missing information that would materially affect strategy execution or debate quality. Check for underspecified objectives, audience segments, success criteria, or evidence standards. If critical gaps exist, formulate exactly one clarifying questionG��never moreG��and pause for the user's response before continuing. Debate quality depends on clear problem specification; an ambiguous question produces unfocused debate that converges on the wrong target.

3. **Web Search for Skills if Not Installed:** Verify that the requested domain strategy skill is available in the current environment. If it is not installed, execute a targeted web search to locate the skill definition, install it, and confirm activation before proceeding to classification. The debate meta-skill is useless without the underlying strategy skill to apply.

4. **Classify the Request:** Map the user's intent to the correct domain bucket from the Reasoning Arsenal. If the request spans multiple domains, identify the primary domain and note secondary domains for cross-pollination during debate. If no domain clearly matches, default to the closest fit and annotate the classification as low-confidence. The strategy classification determines which reasoning move the agents will apply.

5. **Select Strategy from Arsenal:** Load the full strategy specification for the classified domain. Confirm that all required inputs are present. If optional inputs would improve output quality or debate depth, note them but do not block execution. Initialize the execution context with user parameters and define the debate format: number of rounds (default 3), convergence threshold (when positions are close enough to terminate early), and disagreement-handling protocol (how to characterize unresolved disputes).

6. **Define Three Heterogeneous Agents with Distinct Roles:** Instantiate the three agents with clearly differentiated epistemic postures. The **Optimizer** role is to produce the strongest, most complete application of the selected strategyG��this agent prioritizes solution quality, comprehensiveness, and actionability, pushing for the best possible answer with maximal supporting reasoning. The **Skeptic** role is to find every weakness, gap, hidden assumption, alternative explanation, and failure mode in others' positionsG��this agent prioritizes critical scrutiny, demanding evidence for every claim and surfacing counterarguments that others missed. The **Integrator** role is to reconcile competing positions, identify where agents actually agree versus where they genuinely differ, synthesize partial agreements into a coherent whole, and characterize residual disagreements clearlyG��this agent prioritizes coherence, completeness, and honest uncertainty representation. Each agent must produce output that is recognizably distinct from the others; a Skeptic that agrees with everything and an Optimizer that doubts everything are role failures.

7. **Execute Three Structured Debate Rounds:** Run the debate through three rounds with full transparency. **Round 1 G�� Initial Positions:** Each agent independently applies the selected reasoning strategy to the user's problem and produces a complete initial position. These positions are shared with all agents. **Round 2 G�� Structured Critique:** Each agent reviews the other two positions and produces targeted critiques. The Optimizer critiques for missed opportunities, suboptimal solutions, and insufficient ambition. The Skeptic critiques for logical gaps, unsupported claims, hidden assumptions, and alternative explanations. The Integrator critiques for internal inconsistency, unclear tradeoffs, and unresolved tensions between competing claims. Critiques must reference specific claims from the target position; generic criticism is not allowed. **Round 3 G�� Revision and Convergence:** Each agent revises its position in light of the critiques received. Agents must explicitly acknowledge which critiques they accepted and incorporated, which they rejected and why, and where their revised position now converges with or diverges from other agents' positions. The Integrator produces a final convergence assessment: claims all three agents agree on (consensus zone), claims two of three agree on (partial consensus zone), and claims where disagreement persists with a clear characterization of the nature and significance of each disputed point.

8. **Reference the Trace Skill for Implementation Guidance:** As you execute this algorithm, reference the `multi-agent-debate-trace` skill file for detailed implementation guidance on each reasoning step. The trace skill provides the canonical format, output structure, and quality standards for recording the reasoning that this meta-skill orchestrates. When the algorithm says to apply a reasoning strategy, consult the trace skill's Background Information and Algorithm sections to understand how that strategy's core move is structured and what a complete execution looks like.

9. **Write Trace with Full Debate History:** Produce a structured execution trace containing: the strategy domain and parameters used, the three agent role definitions with their distinct priorities, each agent's full Round 1 position, all Round 2 critiques with cross-references to the claims they target, each agent's Round 3 revision with accept/reject annotations for every critique, the Integrator's convergence assessment with consensus/partial-consensus/disagreement zones, and the final synthesized answer. Append this trace to the strategy output so the user can audit every claim's survival through adversarial testing. If convergence was not achieved on a material point, the trace must characterize the nature of the disagreement explicitly rather than pretending it does not exist.

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

- Three genuinely distinct agent roles are instantiatedG��the Optimizer produces solution-focused output, the Skeptic produces critique-focused output, and the Integrator produces synthesis-focused output, with each agent's output recognizably reflecting its assigned epistemic posture.
- All three debate rounds are produced in full: Round 1 initial positions from each agent, Round 2 critiques from each agent targeting specific claims in the other positions, and Round 3 revisions with explicit accept/reject annotations for every critique received.
- The Integrator's final convergence assessment clearly characterizes three zones: claims all agents agree on (consensus), claims two of three agree on (partial consensus), and claims where disagreement persists with the nature and significance of each dispute.
- Claims that survive the full debate cycle are demonstrably more robust than any single agent's initial position, because every surviving claim has been explicitly critiqued and defended.
- The selected strategy domain is correctly classified before debate begins, and the strategy's core move is visibly applied by each agent in its reasoning.
- The debate trace records every position, critique, revision, and convergence point transparently, enabling a human reviewer to audit which claims survived scrutiny and which were revised or abandoned.
- Disagreements that persist after Round 3 are characterized honestlyG��their nature, significance, and the underlying reason for non-convergence are explained rather than papered over with false consensus.
- No agent role collapses into another; the Skeptic does not become a second Optimizer, the Integrator does not become a tie-breaking vote, and the Optimizer does not defer to the Skeptic's doubts without justification.
- The debate format adapts to the strategy's knowledge intensityG��fact-heavy strategies produce more evidence-focused critiques, while creative strategies produce more possibility-expanding critiques.
- Clarification questions are limited to exactly one when ambiguities exist, and no execution proceeds without resolution of blocking gaps.
- If the required domain strategy skill is not installed, it is located via web search, installed, and verified before debate begins.
- The final answer presents the converged consensus position while explicitly flagging points where credible disagreement remains, rather than pretending unanimous agreement.
- Every agent's output includes an explicit confidence level, and the debate trace shows how confidence evolved across rounds.
- The execution trace is structured and self-contained, enabling downstream audit without requiring access to the original conversation context.
- The debate completes within the defined round limit (default 3) unless convergence is achieved earlier, in which case early termination is documented with the convergence threshold that was met.

## Things Not to Do

- Do not use identical or near-identical agent rolesG��if the Optimizer, Skeptic, and Integrator produce outputs that are substantively interchangeable, the debate has failed and must be rerun with stronger role differentiation.
- Do not force false consensus by having agents agree when genuine disagreement existsG��the Skeptic must surface real weaknesses, not perform agreement, and unresolved disputes must be characterized transparently.
- Do not skip debate roundsG��even if the initial positions appear to agree, Round 2 critique and Round 3 revision must be executed, because surface agreement often hides latent disagreements that critique would expose.
- Do not select prompt skills, learning skills, or session-management skills as the underlying strategyG��only genuine reasoning trace strategies from the Arsenal may be paired with this meta-skill.
- Do not allow the Skeptic to critique without specificityG��every critique must reference a specific claim from a target agent's position, and generic skepticism ("this could be wrong") is not a valid critique.
- Do not present the Integrator's synthesis as a simple majority voteG��the Integrator must reconcile positions by identifying where agents actually agree on substance vs. where they use different language for the same insight, and where genuine differences remain.
- Do not execute the debate without first verifying that the required domain strategy skill is active and all mandatory inputs are present.
- Do not issue multiple clarifying questions in a single turnG��exactly one, targeted at the most blocking ambiguity, then wait.

## Input

A natural-language prompt describing the Vidbyte strategy task, including the desired output format, target platform(s), content objective, audience profile, and any constraints (duration, tone, budget, brand guidelines). The prompt may name a specific strategy domain from the Arsenal or leave domain classification to the meta-skill. The multi-agent debate wrapper operates automatically once the underlying strategy is identifiedG��no additional invocation syntax is required beyond the standard Vidbyte strategy prompt. Optional: explicit preference for debate intensity (more rounds, stricter convergence threshold) or agent role customization, though the default three-agent heterogeneous configuration is recommended for most tasks.
