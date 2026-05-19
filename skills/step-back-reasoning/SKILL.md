---
name: step-back-reasoning
description: >
  Use when the user invokes /step-back-reasoning or asks for reasoning grounded in higher-level
  principles and abstractions before tackling specifics. This meta-skill pairs step-back prompting
  with any Vidbyte strategy G�� first ascending to identify underlying concepts, principles, and
  frameworks, then applying the selected strategy guided by those abstractions. Reduces the risk
  of reasoning errors caused by getting lost in irrelevant details.
---

# Step-Back Reasoning

## Goal

This meta-skill applies the step-back prompting framework G�� first abstracting from a specific problem to its underlying principles, concepts, and general class, then reasoning forward from those abstractions using the most appropriate Vidbyte strategy. The two-phase structure separates concept-space exploration from detail-space execution. In the first phase the skill identifies the general class of the problem, the fundamental principles at play, and the applicable conceptual frameworks, effectively going wider in concept-space before going deeper in reasoning-space. In the second phase the skill selects and executes a Vidbyte trace strategy whose algorithm is grounded in and guided by the abstractions established in the first phase.

The rationale is that reasoning directly from details without first establishing a principle scaffolding increases the risk of getting lost in irrelevant specifics, fixating on surface features, or applying the wrong reasoning structure to the problem. By stepping back to identify what kind of problem this is, what principles govern it, and what framework best captures its structure, the reasoner builds an abstraction layer that orients all subsequent reasoning. Empirical evidence from Zheng et al (2024) demonstrates that this approach yields substantial gains: +27% on TimeQA, +11% on MMLU Chemistry, +7% on MMLU Physics, and +7% on MuSiQue on PaLM-2L, with similar patterns on GPT-4 and Llama2-70B. The meta-skill writes a durable trace recording both the abstractions and the strategy-grounded reasoning, producing an artifact where the scaffolding is visible and auditable.

## Intent

Direct reasoning from problem details without first establishing higher-level principles systematically introduces errors that could have been prevented by abstraction. A problem about calculating the force on a charged particle can be solved as a plug-and-chug physics exercise or as an application of Coulomb's law and superposition G�� the latter produces the same answer but catches sign errors, boundary conditions, and degenerate cases that the former misses. A business decision framed in specifics can be made as a one-off judgment or as an instance of a general class of make-vs-buy decisions G�� the latter surfaces reference cases, tradeoff dimensions, and failure modes invisible to the one-off approach. Step-back reasoning prevents these failure modes by making abstraction a mandatory first phase before any strategy-specific reasoning begins.

The pairing with Vidbyte's strategy catalog is deliberate. Once the abstractions are established, the selected strategy operates on firmer ground G�� its algorithm is oriented by principles rather than surface features, its assumptions are checked against the abstraction layer, and its conclusions can be validated by whether they are consistent with the general class of the problem. The two-phase output is more rigorous than either step-back prompting alone or strategy execution alone because the abstractions constrain and guide the reasoning while the strategy's algorithm provides the structure for applying the abstractions to the specific question.

## Background G�� What Is Step-Back Reasoning

Step-Back Reasoning operationalizes the Step-Back Prompting framework introduced by Zheng et al in their 2024 ICLR paper "Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models." The framework identifies a common failure mode in LLM reasoning: models presented with detailed, specific problems often become mired in those details, pursuing dead-end reasoning chains, misapplying domain knowledge, or failing to recognize that the problem is an instance of a general class with known solution patterns. The proposed remedy is a two-phase abstraction-and-reasoning scheme.

In the first phase G�� the step back G�� the model is prompted to abstract away from the specific question and instead identify the general class of the problem, the underlying scientific or logical principles at play, and the conceptual frameworks that apply. For example, given a specific physics calculation, the model first identifies that the problem involves conservation of energy, the work-energy theorem, and a particular field configuration. In the second phase G�� reason forward G�� the model applies those identified principles to the specific quantities and constraints in the question. The experiments tested PaLM-2L, GPT-4, and Llama2-70B across domains including physics, chemistry, temporal reasoning, and multi-hop reasoning. PaLM-2L showed improvements of +7% on MMLU Physics, +11% on MMLU Chemistry, +27% on TimeQA, and +7% on MuSiQue. The core insight is that going wider in concept-space before going deeper in reasoning-space reduces the chance that the model fixates on irrelevant surface details, prematurely commits to a wrong reasoning direction, or fails to recognize degenerate cases, boundary conditions, and hidden assumptions.

## Algorithm

### Step 1 G�� Detect Invocation

Check if the user's prompt starts with `/step-back-reasoning` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage guidance.
- If yes with text: proceed to Step 2.

### Step 2 G�� Clarify the Problem

Parse the user's problem. Determine whether it is sufficiently specified for both abstraction and strategy selection. If the problem is genuinely ambiguous G�� missing critical constraints, admitting multiple incompatible framings, or too vague to identify a general class G�� ask exactly one clarifying question before proceeding. Do not step back from an underspecified problem; the abstraction phase will amplify vagueness rather than resolve it.

If the problem is well-specified, restate it with its domain, constraints, evidence standard, and any explicit or implicit assumptions. This restatement becomes the input to the abstraction phase.

### Step 3 G�� Web Search for Skills if Not Installed

Before classifying the problem and selecting a Vidbyte strategy, verify the skill catalog is accessible. If the target strategy appears missing from the current installation, perform a web search to locate the latest Vidbyte skills. Do not execute a strategy that is unavailable G�� fall back to the closest available strategy and record the substitution explicitly.

### Step 4 G�� Classify the Problem Domain

Classify the clarified problem into one of the 11 Vidbyte reasoning domains (see Reasoning Arsenal below). This classification is a preliminary step that narrows the strategy search space before the abstraction phase begins. The domain classification uses the problem's dominant reasoning characteristic G�� causal, decision-oriented, creative, predictive, etc. G�� and will be refined or confirmed by the abstractions established in Step 6.

### Step 5 G�� Select the Best-Fit Vidbyte Strategy

Based on the domain classification, select the single best-fit Vidbyte trace strategy from the catalog. The strategy's core move must align with the problem's dominant characteristic. Identify the strategy by name and slash command. If the selection is close, note the runner-up and the tradeoff that drove the primary selection. The selected strategy will be executed in Step 7, guided by the abstractions from Step 6.

### Step 6 G�� Step Back: Abstraction Phase

Execute the step-back abstraction protocol. Working from the specific problem stated in Step 2, ascend to identify:

1. **General class**: What general category does this problem belong to? Is it an instance of a known problem class (e.g., a constrained optimization, a two-body dynamics problem, a make-vs-buy decision, a root-cause investigation)? Naming the class connects the problem to known solution patterns.
2. **Underlying principles**: What fundamental principles, laws, theorems, or regularities govern this class of problem? These are the non-negotiable constraints that any valid solution must respect (e.g., conservation laws, logical axioms, economic equilibrium conditions, causal precedence).
3. **Conceptual frameworks**: What established frameworks, models, or analytical lenses are applicable? These provide the vocabulary and structure for reasoning (e.g., supply-demand analysis, decision theory, control theory, information theory, game-theoretic equilibrium concepts).
4. **Key abstractions**: What are the domain-relevant abstractions that strip away irrelevant detail while preserving the structural features that matter? These are the concepts that will guide the strategy's application in the next phase.

Write these abstractions as numbered items in the trace. They serve as the principle scaffolding that will orient all subsequent reasoning.

### Step 7 G�� Reason Forward: Application Phase

Apply the selected Vidbyte strategy's algorithm to the specific problem, but ground every step in the abstractions established in Step 6. For each subquestion, hypothesis, option, or criterion the strategy's algorithm generates, check:

- Does this reasoning step respect the underlying principles identified in the abstraction phase?
- Does it use the vocabulary and structure of the applicable conceptual framework?
- Does it operate on the key abstractions, or has it slipped back into irrelevant surface details?
- Are there boundary conditions, degenerate cases, or hidden assumptions that the abstraction layer reveals?

Execute the strategy's full algorithm: restate the question (now with abstractions), apply the core move, produce numbered reasoning items organized by the strategy's structure, record assumptions and uncertainty, and synthesize. The difference from standard strategy execution is that every reasoning item is explicitly linked to at least one abstraction from Step 6 G�� the user should be able to trace each reasoning step back to a principle or framework.


### Step 8 G�� Reference the Trace Skill for Implementation Guidance

As you execute this algorithm, reference the `step-back-trace` skill file for detailed implementation guidance on each reasoning step. The trace skill provides the canonical format, output structure, and quality standards for recording the reasoning that this meta-skill orchestrates. When the algorithm says to apply a reasoning strategy, consult the trace skill's Background Information and Algorithm sections to understand how that strategy's core move is structured and what a complete execution looks like.

### Step 9 G�� Map Abstractions to Specifics and Write Trace

Derive `{question_name}` from the user's question by lowercasing, replacing non-alphanumeric runs with hyphens, and trimming extra hyphens. Write the reasoning trace to `memory/{question_name}.md` with these sections:

```
Question:        (restated question with constraints and domain)
Strategy:        (selected Vidbyte strategy with slash command and justification)
Scale:           (default G�� aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens)

Abstractions:
- General Class:    (the problem class this is an instance of)
- Principles:       (the fundamental principles that govern solutions in this class)
- Frameworks:       (the applicable conceptual frameworks and their key structures)
- Key Abstractions: (the domain-relevant abstractions that strip irrelevant detail)

Scratchpad:
[Numbered reasoning items structured by both the strategy's algorithm and the abstractions.
 Every numbered item contributes a question, observation, test, comparison, inference, or synthesis.
 Items that apply an abstraction to a specific should name which abstraction is being applied.]

Synthesis:
[Compressed summary connecting the abstractions through the reasoning to the conclusion.]

Final Answer:
[The conclusion with any important remaining uncertainty.]
```

Respond to the user with the file path, the abstractions identified, the strategy selected with justification, and a summary of the final answer.

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

- Invocation is detected correctly G�� the skill activates only for `/step-back-reasoning` and is silent otherwise.
- The problem is clarified before any abstraction or strategy selection occurs; underspecified problems receive exactly one clarifying question.
- The domain classification maps the problem to one of the 11 Vidbyte reasoning domains and is traceable to the problem's dominant characteristic.
- The selected Vidbyte strategy has a core move that directly addresses the problem's dominant characteristic and is identified by name and slash command.
- The abstraction phase produces at least four outputs: general class, underlying principles, conceptual frameworks, and key abstractions G�� each with specific, problem-grounded content.
- Each abstraction is stated concretely enough that it can be cited or applied in the reasoning phase; vague abstractions ("this is a complex problem") do not satisfy this criterion.
- The reasoning phase applies the strategy's full algorithm, and every reasoning item can be plausibly traced to at least one abstraction from the first phase.
- The reasoning does not slip back into detail-level reasoning without reference to the abstraction scaffolding; principle-guided reasoning is visibly different from unguided reasoning.
- A durable reasoning trace is written to `memory/{question_name}.md` with sections Question, Strategy, Scale, Abstractions, Scratchpad, Synthesis, and Final Answer.
- The scratchpad contains approximately 100 numbered lines or roughly 2,000 to 3,500 tokens, adapted to problem complexity.
- Assumptions, missing evidence, disconfirming signals, and uncertainty are recorded in the trace.
- The synthesis explicitly connects the abstractions to the specific conclusions, showing how the principle scaffolding constrained and guided the reasoning.
- The response to the user includes the file path, the abstractions identified, the strategy selected with justification, and a summary of the final answer.
- No strategy is executed before the abstraction phase is complete; rushing to execution defeats the purpose of step-back reasoning.
- The trace is auditable G�� a reviewer can see both what abstractions were built and how they were applied at each reasoning step.

## Things Not to Do

- Do not skip the abstraction phase and jump directly to strategy execution. The whole point of step-back reasoning is that abstraction precedes and orients reasoning.
- Do not produce vague abstractions like "this is a complex problem" or "multiple factors are involved." Abstractions must name specific principles, frameworks, and problem classes that can actually constrain downstream reasoning.
- Do not select a strategy whose core move is incompatible with the abstractions established in the first phase. If the abstraction reveals the problem is a causal one, do not select a creative strategy.
- Do not treat the abstraction phase as a summary of the problem. It is a step upward in generality G�� identifying principles, not restating details at a higher level of description.
- Do not allow the reasoning phase to ignore the abstractions. If the abstractions identify a conservation law or a feedback structure, every relevant reasoning step must respect it.
- Do not execute a strategy without verifying it is available in the Vidbyte catalog. If missing, search for it or fall back with an explicit substitution note.
- Do not write a trace that reads like two unrelated sections. The abstractions and the scratchpad must visibly connect G�� the scratchpad references abstractions, and the synthesis traces the connection back.
- Do not skip writing the trace to disk. The artifact at `memory/{question_name}.md` must contain both the abstraction scaffolding and the strategy-grounded reasoning.

## Input

**Required G�� Invocation:** `/step-back-reasoning <problem description>` G�� The user's problem or question. The more specifically the problem describes its domain, constraints, and desired output, the more precise the abstraction phase will be and the more effectively the strategy will be guided by the resulting principles.

**Implicit G�� Step-back prompting framework:** The Zheng et al (2024) two-phase abstraction-and-reasoning scheme. Used in Step 6 to structure the abstraction phase into general class identification, principle extraction, framework selection, and key abstraction formulation.

**Implicit G�� Vidbyte strategy catalog:** The full set of Vidbyte reasoning trace strategies organized across 11 domains. Used to select and execute the best-fit strategy in Steps 4-5 and 7.
