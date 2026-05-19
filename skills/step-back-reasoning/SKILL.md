---
name: step-back-reasoning
description: >
  Use when the user invokes /step-back-reasoning or asks for reasoning grounded in higher-level
  principles and abstractions before tackling specifics. This meta-skill pairs step-back prompting
  with any Vidbyte strategy — first ascending to identify underlying concepts, principles, and
  frameworks, then applying the selected strategy guided by those abstractions. Reduces the risk
  of reasoning errors caused by getting lost in irrelevant details.
---

# Step-Back Reasoning

## Goal

This meta-skill applies the step-back prompting framework — first abstracting from a specific problem to its underlying principles, concepts, and general class, then reasoning forward from those abstractions using the most appropriate Vidbyte strategy. The two-phase structure separates concept-space exploration from detail-space execution. In the first phase the skill identifies the general class of the problem, the fundamental principles at play, and the applicable conceptual frameworks, effectively going wider in concept-space before going deeper in reasoning-space. In the second phase the skill selects and executes a Vidbyte trace strategy whose algorithm is grounded in and guided by the abstractions established in the first phase.

The rationale is that reasoning directly from details without first establishing a principle scaffolding increases the risk of getting lost in irrelevant specifics, fixating on surface features, or applying the wrong reasoning structure to the problem. By stepping back to identify what kind of problem this is, what principles govern it, and what framework best captures its structure, the reasoner builds an abstraction layer that orients all subsequent reasoning. Empirical evidence from Zheng et al (2024) demonstrates that this approach yields substantial gains: +27% on TimeQA, +11% on MMLU Chemistry, +7% on MMLU Physics, and +7% on MuSiQue on PaLM-2L, with similar patterns on GPT-4 and Llama2-70B. The meta-skill writes a durable trace recording both the abstractions and the strategy-grounded reasoning, producing an artifact where the scaffolding is visible and auditable.

## Intent

Direct reasoning from problem details without first establishing higher-level principles systematically introduces errors that could have been prevented by abstraction. A problem about calculating the force on a charged particle can be solved as a plug-and-chug physics exercise or as an application of Coulomb's law and superposition — the latter produces the same answer but catches sign errors, boundary conditions, and degenerate cases that the former misses. A business decision framed in specifics can be made as a one-off judgment or as an instance of a general class of make-vs-buy decisions — the latter surfaces reference cases, tradeoff dimensions, and failure modes invisible to the one-off approach. Step-back reasoning prevents these failure modes by making abstraction a mandatory first phase before any strategy-specific reasoning begins.

The pairing with Vidbyte's strategy catalog is deliberate. Once the abstractions are established, the selected strategy operates on firmer ground — its algorithm is oriented by principles rather than surface features, its assumptions are checked against the abstraction layer, and its conclusions can be validated by whether they are consistent with the general class of the problem. The two-phase output is more rigorous than either step-back prompting alone or strategy execution alone because the abstractions constrain and guide the reasoning while the strategy's algorithm provides the structure for applying the abstractions to the specific question.

## Background — What Is Step-Back Reasoning

Step-Back Reasoning operationalizes the Step-Back Prompting framework introduced by Zheng et al in their 2024 ICLR paper "Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models." The framework identifies a common failure mode in LLM reasoning: models presented with detailed, specific problems often become mired in those details, pursuing dead-end reasoning chains, misapplying domain knowledge, or failing to recognize that the problem is an instance of a general class with known solution patterns. The proposed remedy is a two-phase abstraction-and-reasoning scheme.

In the first phase — the step back — the model is prompted to abstract away from the specific question and instead identify the general class of the problem, the underlying scientific or logical principles at play, and the conceptual frameworks that apply. For example, given a specific physics calculation, the model first identifies that the problem involves conservation of energy, the work-energy theorem, and a particular field configuration. In the second phase — reason forward — the model applies those identified principles to the specific quantities and constraints in the question. The experiments tested PaLM-2L, GPT-4, and Llama2-70B across domains including physics, chemistry, temporal reasoning, and multi-hop reasoning. PaLM-2L showed improvements of +7% on MMLU Physics, +11% on MMLU Chemistry, +27% on TimeQA, and +7% on MuSiQue. The core insight is that going wider in concept-space before going deeper in reasoning-space reduces the chance that the model fixates on irrelevant surface details, prematurely commits to a wrong reasoning direction, or fails to recognize degenerate cases, boundary conditions, and hidden assumptions.

## Algorithm

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/step-back-reasoning` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage guidance.
- If yes with text: proceed to Step 2.

### Step 2 — Clarify the Problem

Parse the user's problem. Determine whether it is sufficiently specified for both abstraction and strategy selection. If the problem is genuinely ambiguous — missing critical constraints, admitting multiple incompatible framings, or too vague to identify a general class — ask exactly one clarifying question before proceeding. Do not step back from an underspecified problem; the abstraction phase will amplify vagueness rather than resolve it.

If the problem is well-specified, restate it with its domain, constraints, evidence standard, and any explicit or implicit assumptions. This restatement becomes the input to the abstraction phase.

### Step 3 — Web Search for Skills if Not Installed

Before classifying the problem and selecting a Vidbyte strategy, verify the skill catalog is accessible. If the target strategy appears missing from the current installation, perform a web search to locate the latest Vidbyte skills. Do not execute a strategy that is unavailable — fall back to the closest available strategy and record the substitution explicitly.

### Step 4 — Classify the Problem Domain

Classify the clarified problem into one of the 11 Vidbyte reasoning domains (see Reasoning Arsenal below). This classification is a preliminary step that narrows the strategy search space before the abstraction phase begins. The domain classification uses the problem's dominant reasoning characteristic — causal, decision-oriented, creative, predictive, etc. — and will be refined or confirmed by the abstractions established in Step 6.

### Step 5 — Select the Best-Fit Vidbyte Strategy

Based on the domain classification, select the single best-fit Vidbyte trace strategy from the catalog. The strategy's core move must align with the problem's dominant characteristic. Identify the strategy by name and slash command. If the selection is close, note the runner-up and the tradeoff that drove the primary selection. The selected strategy will be executed in Step 7, guided by the abstractions from Step 6.

### Step 6 — Step Back: Abstraction Phase

Execute the step-back abstraction protocol. Working from the specific problem stated in Step 2, ascend to identify:

1. **General class**: What general category does this problem belong to? Is it an instance of a known problem class (e.g., a constrained optimization, a two-body dynamics problem, a make-vs-buy decision, a root-cause investigation)? Naming the class connects the problem to known solution patterns.
2. **Underlying principles**: What fundamental principles, laws, theorems, or regularities govern this class of problem? These are the non-negotiable constraints that any valid solution must respect (e.g., conservation laws, logical axioms, economic equilibrium conditions, causal precedence).
3. **Conceptual frameworks**: What established frameworks, models, or analytical lenses are applicable? These provide the vocabulary and structure for reasoning (e.g., supply-demand analysis, decision theory, control theory, information theory, game-theoretic equilibrium concepts).
4. **Key abstractions**: What are the domain-relevant abstractions that strip away irrelevant detail while preserving the structural features that matter? These are the concepts that will guide the strategy's application in the next phase.

Write these abstractions as numbered items in the trace. They serve as the principle scaffolding that will orient all subsequent reasoning.

### Step 7 — Reason Forward: Application Phase

Apply the selected Vidbyte strategy's algorithm to the specific problem, but ground every step in the abstractions established in Step 6. For each subquestion, hypothesis, option, or criterion the strategy's algorithm generates, check:

- Does this reasoning step respect the underlying principles identified in the abstraction phase?
- Does it use the vocabulary and structure of the applicable conceptual framework?
- Does it operate on the key abstractions, or has it slipped back into irrelevant surface details?
- Are there boundary conditions, degenerate cases, or hidden assumptions that the abstraction layer reveals?

Execute the strategy's full algorithm: restate the question (now with abstractions), apply the core move, produce numbered reasoning items organized by the strategy's structure, record assumptions and uncertainty, and synthesize. The difference from standard strategy execution is that every reasoning item is explicitly linked to at least one abstraction from Step 6 — the user should be able to trace each reasoning step back to a principle or framework.

### Step 8 — Map Abstractions to Specifics and Write Trace

Derive `{question_name}` from the user's question by lowercasing, replacing non-alphanumeric runs with hyphens, and trimming extra hyphens. Write the reasoning trace to `memory/{question_name}.md` with these sections:

```
Question:        (restated question with constraints and domain)
Strategy:        (selected Vidbyte strategy with slash command and justification)
Scale:           (default — aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens)

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

### Causal / Diagnostic
Problems that ask why something happened, what caused an outcome, or where a failure originated. Causal reasoning strategies decompose chains of cause and effect, distinguish root causes from symptoms, and test whether a given factor is necessary, sufficient, or merely correlated. Key strategies include Five Whys for drilling through symptom layers, Root Cause Analysis for mapping multi-factor causal trees, Fishbone for categorizing potential causes into branches, Fault Tree for Boolean event analysis, and Causal Reasoning for constructing formal cause-effect models with counterfactuals. In step-back reasoning, the abstraction phase identifies the causal structure (e.g., necessary condition, sufficient condition, INUS condition), whether feedback loops are present, and what distinguishes causation from mere correlation, so the strategy does not mistake correlation for mechanism.

### Decision / Evaluation
Problems that require choosing between options, allocating resources, or trading off competing criteria under uncertainty. Decision strategies structure the option space, weight criteria, model uncertainty, and surface the rationale behind a choice so it can be inspected and challenged. Key strategies include Decision Tree for sequential choices under uncertainty, Cost-Benefit Analysis for quantified comparison, Expected Value for probabilistic payoffs, Tradeoff Matrix for multi-criteria scoring, Satisficing for bounded-rationality decisions, and Regret Minimization for irreversible high-stakes choices. The step-back phase identifies the decision's general class (e.g., bet, investment, selection, allocation), the decision criterion (e.g., maximize expected utility, minimize maximum regret), and whether the decision is one-shot or repeated, so the strategy matches the decision's formal structure.

### Creative / Generative
Problems that demand novel solutions, reframed problem definitions, or breaking out of conventional solution spaces. Creative strategies destabilize fixed assumptions, introduce unexpected associations, and systematically explore design space. Key strategies include First Principles for foundational reconstruction, Lateral Thinking for approaching from unexpected angles, Reframing for changing the problem statement itself, Constraint Removal for discovering hidden assumptions, SCAMPER for seven creative operations, and TRIZ for contradiction resolution. The step-back phase identifies the governing constraints and principles — what must remain true, what can be varied, and what level of the problem hierarchy a solution can target — so creative exploration is bounded by principles rather than by convention.

### Predictive / Forecasting
Problems that ask what will happen, how likely an outcome is, or what range of futures to prepare for. Forecasting strategies quantify uncertainty, propagate probability, and ground predictions in reference classes rather than optimistic inside-view estimates. Key strategies include Bayesian Reasoning for evidence-based belief updating, Probabilistic Reasoning for structured uncertainty propagation, Reference Class Forecasting for historical baselines, Scenario Planning for multi-future preparation, and Sensitivity Analysis for identifying critical assumptions. The step-back phase establishes the reference class, the base rate, the time horizon, and the causal structure of what is being forecast, so predictions are anchored in structural features rather than narrative intuition.

### Understanding / Explaining
Problems that ask how a system works, why a mechanism operates as it does, or what conceptual model best captures a phenomenon. Understanding strategies build explanatory models, connect parts to wholes, and clarify mechanism rather than just surface description. Key strategies include Systems Thinking for interconnections and feedback loops, Mental Simulation for running qualitative models forward, Analogical Reasoning for structure transfer between domains, and Concept Mapping for knowledge organization. The step-back phase identifies the level of explanation needed (mechanistic, functional, intentional), the appropriate grain of abstraction, and whether the system exhibits emergent or reductive behavior.

### Adversarial / Critical
Problems that require stress-testing an idea, finding weaknesses in a plan, or constructing the strongest possible case against a position. Adversarial strategies simulate opposition, surface hidden vulnerabilities, and test conviction strength before commitment. Key strategies include Red Team for full adversarial simulation, Devil's Advocacy for arguing the strongest counter-case, Steelman for constructing the best opposing argument, Premortem for imagining failure backwards, and Analysis of Competing Hypotheses for multi-hypothesis evaluation. The step-back phase identifies the highest-value attack surface, the dependency structure of the argument or plan, and the standard of evidence required to overturn the current belief.

### Systems / Complexity
Problems involving interconnected components, feedback loops, emergent behavior, and non-linear dynamics where local changes can produce distant effects. Systems strategies map structure, identify leverage points, and trace consequences through multiple orders of effect. Key strategies include Systems Thinking for holistic interconnections, Causal Loop for feedback diagramming, Iceberg Model for drilling from events to mental models, Leverage Points for highest-impact interventions, and Nth-Order Effects for tracing cascading consequences. The step-back phase identifies the system boundary, the feedback structure (reinforcing vs. balancing), the time delays, and the level of the iceberg where leverage is most effective.

### Strategic / Planning
Problems about competitive positioning, long-term direction, resource allocation, or navigating complex stakeholder environments. Strategic strategies evaluate the external landscape, internal capabilities, and the moves available to each actor. Key strategies include SWOT for capability-environment alignment, PESTLE for macro-environmental scanning, Porter's Five Forces for industry structure, Game Theory for interdependent choice, and Stakeholder Analysis for influence mapping. The step-back phase identifies the strategic landscape's structure (cooperative, competitive, mixed-motive), the time scale, the key uncertainties, and whether the problem calls for positioning, capability-building, or move-sequencing.

### Analytic / Evidence
Problems that demand rigorous evaluation of data, testing of claims against evidence, or formal decomposition into logically exhaustive components. Analytic strategies structure inquiry, prevent confirmation bias, and make the evidence-to-conclusion chain inspectable. Key strategies include Scientific Method for hypothesis-driven investigation, Hypothesis Testing for formal evaluation, MECE Decomposition for exhaustive breakdowns, Evidence Triangulation for cross-source validation, and Metacognitive Audit for examining the reasoning process itself. The step-back phase identifies the evidence standard, the appropriate level of statistical rigor, the independence of evidence sources, and the disconfirming evidence standard.

### Ethical / Values
Problems involving moral judgment, fairness across groups, competing value systems, or decisions where the right answer depends on which normative framework is applied. Ethical strategies surface the values at stake, apply multiple ethical lenses, and make tradeoffs explicit rather than implicit. Key strategies include Ethical Matrix for multi-framework evaluation, Values Tradeoff for competing-principle decisions, Fairness Analysis for distributional impact, and Dialectical Reasoning for integrating opposing perspectives. The step-back phase identifies the applicable normative frameworks, the affected stakeholders, the rights and duties in play, and whether the problem is resolvable by a single framework or requires framework pluralism.

### Practical / Constraint
Problems framed by limited resources, fixed constraints, or optimization under bounds where the question is less about what is ideal and more about what is achievable. Practical strategies identify the binding constraint, allocate scarce resources, and find the best solution that respects all limits. Key strategies include Bottleneck Analysis for finding the limiting factor, Constraint Satisfaction for enumerating valid configurations, Satisficing for meeting thresholds, Theory of Constraints for throughput optimization, and Opportunity Cost for understanding foregone alternatives. The step-back phase identifies the binding constraint, whether constraints are hard or soft, and the optimization criterion (maximize, satisfice, or lexicographically satisfy), so the strategy does not waste effort optimizing unconstrained dimensions.

## Success Criteria

- Invocation is detected correctly — the skill activates only for `/step-back-reasoning` and is silent otherwise.
- The problem is clarified before any abstraction or strategy selection occurs; underspecified problems receive exactly one clarifying question.
- The domain classification maps the problem to one of the 11 Vidbyte reasoning domains and is traceable to the problem's dominant characteristic.
- The selected Vidbyte strategy has a core move that directly addresses the problem's dominant characteristic and is identified by name and slash command.
- The abstraction phase produces at least four outputs: general class, underlying principles, conceptual frameworks, and key abstractions — each with specific, problem-grounded content.
- Each abstraction is stated concretely enough that it can be cited or applied in the reasoning phase; vague abstractions ("this is a complex problem") do not satisfy this criterion.
- The reasoning phase applies the strategy's full algorithm, and every reasoning item can be plausibly traced to at least one abstraction from the first phase.
- The reasoning does not slip back into detail-level reasoning without reference to the abstraction scaffolding; principle-guided reasoning is visibly different from unguided reasoning.
- A durable reasoning trace is written to `memory/{question_name}.md` with sections Question, Strategy, Scale, Abstractions, Scratchpad, Synthesis, and Final Answer.
- The scratchpad contains approximately 100 numbered lines or roughly 2,000 to 3,500 tokens, adapted to problem complexity.
- Assumptions, missing evidence, disconfirming signals, and uncertainty are recorded in the trace.
- The synthesis explicitly connects the abstractions to the specific conclusions, showing how the principle scaffolding constrained and guided the reasoning.
- The response to the user includes the file path, the abstractions identified, the strategy selected with justification, and a summary of the final answer.
- No strategy is executed before the abstraction phase is complete; rushing to execution defeats the purpose of step-back reasoning.
- The trace is auditable — a reviewer can see both what abstractions were built and how they were applied at each reasoning step.

## Things Not to Do

- Do not skip the abstraction phase and jump directly to strategy execution. The whole point of step-back reasoning is that abstraction precedes and orients reasoning.
- Do not produce vague abstractions like "this is a complex problem" or "multiple factors are involved." Abstractions must name specific principles, frameworks, and problem classes that can actually constrain downstream reasoning.
- Do not select a strategy whose core move is incompatible with the abstractions established in the first phase. If the abstraction reveals the problem is a causal one, do not select a creative strategy.
- Do not treat the abstraction phase as a summary of the problem. It is a step upward in generality — identifying principles, not restating details at a higher level of description.
- Do not allow the reasoning phase to ignore the abstractions. If the abstractions identify a conservation law or a feedback structure, every relevant reasoning step must respect it.
- Do not execute a strategy without verifying it is available in the Vidbyte catalog. If missing, search for it or fall back with an explicit substitution note.
- Do not write a trace that reads like two unrelated sections. The abstractions and the scratchpad must visibly connect — the scratchpad references abstractions, and the synthesis traces the connection back.
- Do not skip writing the trace to disk. The artifact at `memory/{question_name}.md` must contain both the abstraction scaffolding and the strategy-grounded reasoning.

## Input

**Required — Invocation:** `/step-back-reasoning <problem description>` — The user's problem or question. The more specifically the problem describes its domain, constraints, and desired output, the more precise the abstraction phase will be and the more effectively the strategy will be guided by the resulting principles.

**Implicit — Step-back prompting framework:** The Zheng et al (2024) two-phase abstraction-and-reasoning scheme. Used in Step 6 to structure the abstraction phase into general class identification, principle extraction, framework selection, and key abstraction formulation.

**Implicit — Vidbyte strategy catalog:** The full set of Vidbyte reasoning trace strategies organized across 11 domains. Used to select and execute the best-fit strategy in Steps 4-5 and 7.
