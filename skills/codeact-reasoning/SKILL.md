---
name: codeact-reasoning
description: Meta-skill pairing CodeAct code-space reasoning with any Vidbyte strategy. Expresses selected strategy's steps as executable Python with self-debugging for verifiable, reproducible reasoning.
version: 1.0.0
author: Vidbyte
tags: [meta-skill, code, execution, self-debugging, python, verification]
requires: []
---

## Goal

Transform Vidbyte strategy execution from declarative text into executable Python code, leveraging the CodeAct framework's insight that code is a superior action space for LLM reasoning. By expressing strategy steps as runnable scriptsG��data transformations, metric calculations, content structure validation, A/B test simulationsG��this meta-skill makes reasoning auditable, reproducible, and self-correcting via Python's interpreter-driven error feedback loop. When a script fails, the model reads the traceback and revises the code, closing the gap between intention and execution without human intervention.

The result is strategy output backed by actual computation rather than prose approximation. Retention curves are plotted from real formulas, not described. Monetization projections are calculated from parameterized models, not estimated. Platform format compliance is checked by parsing output against schemas, not eyeballed. Every conclusion has a code artifact that can be re-run, inspected, and challengedG��shifting strategy from a "trust the model" paradigm to a "verify the execution" paradigm.

## Intent

The purpose is to apply Wang et al.'s (2024) CodeAct frameworkG��which demonstrates up to 20% higher success rates than text or JSON action spaces across 17 LLMsG��to Vidbyte's strategy execution pipeline. Traditional strategy output relies on the model generating prose that sounds correct; CodeAct replaces this with Python code that must run correctly, producing output that is computationally verified. When the interpreter rejects a script due to a syntax error, type mismatch, or logical flaw, the model reads the error and debugs itself, iterating until the code executes cleanly and produces valid output.

This self-debugging loop is the meta-skill's core differentiator. Rather than hoping the first draft of a strategy is accurate, CodeAct-reasoning runs every computation, catches every exception, and refines every script until it passes. For Vidbyte strategies that involve quantitative analysisG��retention math, CPM projections, trend decay modeling, engagement rate forecastingG��this produces hard numbers with traceable derivations. For qualitative strategies, code formalizes the structural rules (script templates, thumbnail composition grids, audio timing maps) into validation scripts that check output for compliance. The meta-skill unifies both quantitative and qualitative strategy domains under a single, verifiable execution model.

## Background G�� What Is CodeAct Reasoning

CodeAct, introduced by Wang et al. (2024) at ICML, is a framework where LLM agents use executable Python code as their universal action space instead of JSON-structured text commands. The key insight is that code is a more expressive, compact, and verifiable medium than natural language for specifying multi-step operations: a single Python function can replace dozens of JSON tool-call messages, and the Python interpreter provides immediate, unambiguous feedback (success or traceback) that the agent can use for self-correction. Evaluated across 17 LLMs on complex agent benchmarks, CodeAct achieved up to 20% higher task success rates than text-based and JSON-based alternatives. The CodeActAgent, fine-tuned from Llama-2 and Mistral on the 7,000-example multi-turn CodeActInstruct dataset, demonstrates the ability to compose library calls, handle edge cases through try-except blocks, and iteratively debug code based on interpreter errorsG��all within a standard Python environment restricted to the standard library.

## Algorithm

1. **Detect Strategy Request and Identify Computational Components:** Parse the user's prompt to identify which Vidbyte strategy domain is being invoked and which substeps involve computation, data transformation, validation, or structured output generation. Flag substeps that are purely creative (e.g., tone selection, narrative voice) as candidates for structural validation rather than direct code execution. Separate the request into code-amenable components and prose-only components.

2. **Clarify Ambiguities with Parameter Extraction:** Before writing any code, identify all quantitative inputs needed for computationG��target metrics, platform constraints, budget ranges, audience sizes, duration limits. If any required numerical parameter is missing or ambiguous, formulate exactly one clarifying question to resolve it. Do not proceed to code generation with placeholder values that would produce misleading output.

3. **Web Search for Skills and Libraries:** Verify that the required Vidbyte strategy skill is installed and active. Additionally, assess whether any Python libraries beyond the standard library are needed for the computations (e.g., `math`, `statistics`, `json`, `datetime` are stdlib-safe; anything beyond that requires explicit justification). If the strategy skill is missing, perform a web search to locate and install it.

4. **Classify the Strategy Domain:** Map the user's intent to the correct domain bucket from the Reasoning Arsenal (same Arsenal as self-rag-reasoning: Viral Hook Engineering, Retention Optimization, Trend Hijacking, Platform-Specific Formatting, Script Structure, Visual Storytelling, Audio Design, Thumbnail Psychology, Audience Growth, Monetization Strategy, Brand Narrative). Identify the computations inherent to that domainG��for Retention Optimization, this means retention curve functions and drop-off prediction; for Monetization Strategy, this means CPM tables and revenue projection formulas.

5. **Select and Load Strategy Specification:** Load the full strategy definition for the classified domain. Extract the computational substeps that will be expressed as Python code. For each substep, define the expected inputs, the transformation logic, and the expected output schema. Note which substeps are purely heuristic or creative and will receive structural validation rather than direct code implementation.

6. **Express Strategy as Python Code, Simulate Execution, and Self-Debug:** Write a Python script (or set of scripts) that implements all computational substeps. The script must include: explicit input variable declarations at the top (so parameters can be swapped for different scenarios), the core computation functions, output formatting that produces both machine-parseable results and human-readable summaries, and exception handling that catches and reports errors rather than crashing silently. Execute the script in a Python interpreter. If execution fails (any exception or non-zero exit), read the full traceback, identify the root cause, revise the script, and re-execute. Repeat this self-debug loop until the script runs to completion without errors and produces output that passes basic sanity checks (no NaN values, no negative counts where positive is required, no outputs exceeding physically possible bounds). For creative/heuristic substeps, write a structural validation script that checks for format compliance, completeness, and internal consistency rather than attempting to generate the creative content itself.

7. **Synthesize Code Outputs to Conclusions:** Aggregate the output of all executed scripts into the final strategy deliverable. For each code-generated result, produce a prose interpretation that explains what the numbers mean in strategic terms. For structural validations, report pass/fail with specific remediation actions for any failures. Distinguish clearly between computationally derived conclusions (backed by executable code) and heuristic recommendations (backed by the model's pattern recognition).

8. **Reference the Trace Skill for Implementation Guidance:** As you execute this algorithm, reference the `codeact-trace` skill file for detailed implementation guidance on each reasoning step. The trace skill provides the canonical format, output structure, and quality standards for recording the reasoning that this meta-skill orchestrates. When the algorithm says to apply a reasoning strategy, consult the trace skill's Background Information and Algorithm sections to understand how that strategy's core move is structured and what a complete execution looks like.

9. **Write Trace with Code Summary:** Produce a structured execution trace containing: the strategy domain and parameters used, the full source code of each script executed (with revision history showing the self-debug iterations), the stdout/stderr output of the final successful execution, a summary of any self-debug iterations (original error, fix applied, result), a mapping from each strategic conclusion to the code artifact that produced it, and a confidence score per section based on whether the conclusion is code-backed or heuristic. The trace must enable another engineer to reproduce all results by re-running the included scripts.

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

- Every computational substep in the strategy is expressed as executable Python code that runs to completion without errors.
- All code uses only the Python standard library unless an external library is explicitly justified and available in the execution environment.
- At least one self-debug iteration is performed and recorded for any script that fails on first execution, demonstrating the error-feedback loop.
- The execution trace includes the full source code of every script, the stdout/stderr output, and a revision log of self-debug fixes.
- Each strategic conclusion is explicitly mapped to the code artifact that produced it (for computational conclusions) or marked as heuristic (for creative conclusions).
- No NaN, infinite, or physically impossible values appear in any code output without an explicit annotation explaining the boundary condition.
- Structural validation scripts pass for all template-based outputs (script structures, thumbnail compositions, platform formats).
- The trace enables full reproducibility: another engineer with the same Python interpreter can re-run all scripts and obtain identical results.
- Input parameters are declared in a single, clearly labeled section at the top of each script so they can be changed without reading the implementation.
- Error messages from failed executions are preserved in the trace to inform future debugging and strategy refinement.
- Confidence scores distinguish between code-backed conclusions (high confidence) and heuristic recommendations (moderate confidence).
- Clarification questions are limited to exactly one when numerical parameters are missing or ambiguous.
- If the required Vidbyte strategy skill is not installed, it is located via web search, installed, and verified before code generation begins.
- No execution proceeds with placeholder values that would produce misleading or invalid computational output.

## Things Not to Do

- Do not simulate code execution by describing what the code would outputG��actually run the Python interpreter and capture real stdout/stderr.
- Do not use external libraries beyond the standard library unless the environment has been verified to include them and their use is explicitly documented in the trace.
- Do not ship code that produces an unhandled exceptionG��every script must include try-except blocks for known failure modes and exit cleanly.
- Do not confuse heuristic prose generation with computational outputG��mark each conclusion with its derivation method (code-backed or heuristic).
- Do not skip the self-debug loop when a script fails on first executionG��the traceback must be read, the root cause diagnosed, and the fix applied.
- Do not leave magic numbers unexplained in codeG��every numerical constant must be assigned to a named variable with a comment documenting its source or derivation.
- Do not generate code that writes to the filesystem outside the designated trace output directory without explicit user permission.
- Do not present a strategy as fully verified if any script in the pipeline failed to execute or produced output that failed validation checks.

## Input

A natural-language prompt describing the Vidbyte strategy task, including all quantitative parameters needed for computation (target metrics, platform constraints, budget ranges, audience sizes, duration limits). The prompt may name a specific strategy domain or leave classification to the meta-skill. Optional: reference data files (CSV, JSON) for trend data, retention benchmarks, or CPM tables that can be loaded by the Python scripts. The input must specify which computations are required and which are optional, so the algorithm can prioritize code generation for mandatory substeps.
