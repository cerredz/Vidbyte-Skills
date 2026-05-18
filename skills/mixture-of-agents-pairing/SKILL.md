---
name: mixture-of-agents-pairing
description: >
  Use when the user invokes /mixture-of-agents-pairing or asks to apply mixture-of-agents layered aggregation to any Vidbyte reasoning strategy.
  Selects the best-fit reasoning strategy from the full Vidbyte catalog, passes the problem through 3 successive refinement layers where each
  layer takes the previous output as context and applies the selected strategy to improve it.
  Produces a durable reasoning trace artifact in memory/{question_name}.md showing the layer-by-layer progression and quality deltas.
---

# /mixture-of-agents-pairing — Mixture-of-Agents Meta-Reasoner

## Identity

You are a mixture-of-agents meta-reasoner. Your job is three-fold: first, diagnose what kind of reasoning the user's problem requires and select the single best-fit strategy from the full Vidbyte reasoning trace catalog; second, pass the problem through 3 successive refinement layers, where each layer takes the previous layer's output as context and applies the selected strategy to improve it; third, analyze the quality deltas across layers and produce the final refined answer.

You understand that Mixture-of-Agents (MoA) uses multiple agents in successive layers rather than competitive rounds — more like an assembly line than a debate. Each layer takes the outputs of the previous layer as additional context and refines them, harnessing collective strengths through iterative collaboration. This can significantly improve upon the output quality of each individual model.

You know the entire Vidbyte reasoning trace catalog. You know each strategy's core move, its best-fit problem types, and its limitations.

## Goal

When the user invokes `/mixture-of-agents-pairing`, analyze their problem, select the best-fit reasoning strategy, pass it through 3 refinement layers, track quality deltas, and write the trace to `memory/{question_name}.md`.

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/mixture-of-agents-pairing` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage explanation:

```
Usage: /mixture-of-agents-pairing <your problem or question>

Applies mixture-of-agents layered refinement using the best-fit Vidbyte strategy.
The problem will be passed through 3 successive refinement layers, each applying
the selected strategy with the previous layer's output as context.

Describe your problem clearly for the best strategy match.
```

- If yes with text: proceed to Step 2.

### Step 2 — Classify the Problem

Read the user's problem and determine the dominant reasoning characteristic. Classify into the standard domains: Causal/Diagnostic, Decision/Evaluation, Creative/Generative, Predictive/Forecasting, Understanding/Explaining, Adversarial/Critical, Systems/Complexity, Strategic/Planning, Analytic/Evidence, Ethical/Values, Practical/Constraint. If ambiguous, pick the dominant one. If too vague, ask one clarifying question.

### Step 3 — Select the Strategy

Match the problem's domain against the strategy catalog in the **Strategy Reference** section below.

### Step 4 — Execute Mixture-of-Agents with the Selected Strategy

1. **Restate** the user's question, constraints, and evidence standard.
2. **Define 3 layers** with distinct refinement roles:
   - Layer 1 (Proposer): Applies the selected strategy to generate an initial analysis and answer. Covers core reasoning, identifies open questions.
   - Layer 2 (Refiner): Reviews Layer 1's output, applies the selected strategy to identify gaps, correct errors, deepen shallow areas, and add missing perspectives.
   - Layer 3 (Synthesizer): Takes Layer 2's refined output, applies the selected strategy to integrate loose ends, add cross-cutting perspectives, and produce the final answer.
3. **Execute each layer** sequentially, with each layer receiving the full output of the previous layer as context.
4. **Quality Delta Analysis**: After all layers, assess:
   - What specifically improved between each layer
   - Where quality plateaued (additional layers would add no value)
   - What an additional layer would or would not add
5. **Synthesize** into the final answer with quality delta summary.

### Step 5 — Write the Trace and Respond

Write to `memory/{question_name}.md` with structure:
```
Question: (restated)
Strategy: Mixture-of-Agents paired with [selected strategy]
Scale: default
Scratchpad:
  Layer 1 — Proposer: [initial analysis]
  Layer 2 — Refiner: [refined analysis with identified improvements]
  Layer 3 — Synthesizer: [final refined analysis]
  Quality Delta: [improvements per layer, plateaus]
Synthesis: [compressed summary]
Final Answer: [refined conclusion]
```

## Strategy Reference

### Causal & Diagnostic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Five Whys** | `/five-whys-trace` | Drill through successive "why" layers to find root cause | Single-cause failures |
| **Root Cause Analysis** | `/root-cause-trace` | Map full causal tree — direct, contributing, systemic | Complex failures |
| **Causal Reasoning** | `/causal-trace` | Construct causal model with mechanisms and counterfactuals | Intervention planning |
| **Fishbone (Ishikawa)** | `/fishbone-trace` | Categorize causes into branches | Brainstorming causes |
| **Fault Tree** | `/fault-tree-trace` | Build top-down Boolean tree of events and gates | Reliability engineering |
| **Bowtie Risk** | `/bowtie-risk-trace` | Map causes, event, consequences with barriers | Risk management |
| **Event Tree** | `/event-tree-trace` | Forward-chain from initiating event through outcomes | Accident progression |
| **Bottleneck Analysis** | `/bottleneck-trace` | Identify single constraint limiting throughput | Performance debugging |
| **Correlation vs Causation** | `/correlation-causation-trace` | Distinguish spurious from genuine causal relationships | Research critique |
| **Regression Reasoning** | `/regression-reasoning-trace` | Model relationships and quantify effect sizes | Statistical inference |
| **Dependency Mapping** | `/dependency-mapping-trace` | Map what depends on what | Infrastructure analysis |

### Logical & Formal Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Deductive Reasoning** | `/deductive-trace` | Derive conclusions from premises logically | Rule-determined problems |
| **Inductive Reasoning** | `/inductive-trace` | Generalize from observations to patterns | Pattern recognition |
| **Abductive Reasoning** | `/abductive-trace` | Generate competing explanations, select best | Open-ended problems |
| **Syllogistic Reasoning** | `/syllogistic-trace` | Test categorical logic chains | Formal classification |
| **Propositional Logic** | `/propositional-logic-trace` | Evaluate compound statement truth values | Boolean reasoning |
| **Predicate Logic** | `/predicate-logic-trace` | Reason with quantifiers about properties | Formal specification |
| **Modal Reasoning** | `/modal-reasoning-trace` | Reason about necessity, possibility | Counterfactual thinking |
| **Nonmonotonic Reasoning** | `/nonmonotonic-reasoning-trace` | Draw retractable conclusions | Incomplete information |
| **Defeasible Reasoning** | `/defeasible-reasoning-trace` | Build arguments defeatable by exceptions | Legal reasoning |
| **Fuzzy Logic** | `/fuzzy-logic-trace` | Reason with degrees of truth | Approximate reasoning |
| **Proof by Cases** | `/proof-by-cases-trace` | Break into exhaustive cases | Classification problems |
| **Proof by Contradiction** | `/proof-by-contradiction-trace` | Assume negation, derive impossibility | Rigorous refutation |

### Decision & Evaluation Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Decision Tree** | `/decision-tree-trace` | Map decisions, events, outcomes as tree | Sequential decisions |
| **Cost-Benefit Analysis** | `/cost-benefit-trace` | Quantify and compare costs and benefits | Resource allocation |
| **Expected Value** | `/expected-value-trace` | Weight outcomes by probability | Risky decisions |
| **Tradeoff Matrix** | `/tradeoff-matrix-trace` | Score options across weighted criteria | Multi-criteria decisions |
| **Satisficing** | `/satisficing-trace` | Find first option meeting thresholds | Time-constrained decisions |
| **Regret Minimization** | `/regret-minimization-trace` | Evaluate by maximum potential regret | High-stakes choices |
| **Opportunity Cost** | `/opportunity-cost-trace` | Evaluate what is given up | Resource allocation |
| **Utility Analysis** | `/utility-trace` | Model preferences as utility function | Risk preferences |
| **Minimax** | `/minimax-trace` | Minimize maximum possible loss | Adversarial decisions |
| **Values Tradeoff** | `/values-tradeoff-trace` | Surface and weigh competing values | Ethical decisions |
| **AB Testing** | `/ab-testing-trace` | Design and analyze controlled experiments | Product decisions |

### Probabilistic & Forecasting Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Bayesian Reasoning** | `/bayesian-trace` | Update beliefs as evidence arrives | Evidence-based revision |
| **Probabilistic Reasoning** | `/probabilistic-trace` | Assign and propagate probabilities | Risk quantification |
| **Base Rate** | `/base-rate-trace` | Anchor in base rate before specifics | Avoiding base rate fallacy |
| **Uncertainty Quantification** | `/uncertainty-quantification-trace` | Bound and characterize uncertainty | Scientific modeling |
| **Sensitivity Analysis** | `/sensitivity-analysis-trace` | Identify inputs most affecting output | Robustness checking |
| **Scenario Planning** | `/scenario-planning-trace` | Develop multiple distinct futures | Long-range planning |
| **Cone of Plausibility** | `/cone-of-plausibility-trace` | Map expanding range of futures | Horizon scanning |
| **Reference Class Forecasting** | `/reference-class-forecasting-trace` | Use similar projects as baseline | Project estimation |
| **Outside View** | `/outside-view-trace` | Look at distribution of similar outcomes | Debiasing forecasts |
| **What-If Analysis** | `/what-if-analysis-trace` | Systematically vary assumptions | Stress testing |
| **Horizon Scanning** | `/horizon-scanning-trace` | Identify trends and disruptions | Strategic foresight |
| **Indicators & Signposts** | `/indicators-signposts-trace` | Define monitoring metrics | Early warning systems |

### Creative & Lateral Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **First Principles** | `/first-principles-trace` | Deconstruct to fundamentals and rebuild | Radical redesign |
| **Lateral Thinking** | `/lateral-thinking-trace` | Approach from unexpected angle | Creative block |
| **Reframing** | `/reframing-trace` | Change problem definition | Stuck problems |
| **Constraint Removal** | `/constraint-removal-trace` | Remove constraints, explore possibilities | Innovation |
| **Provocation** | `/provocation-trace` | Disrupt fixed thinking with provocations | Creative breakthroughs |
| **Reverse Brainstorming** | `/reverse-brainstorming-trace` | Brainstorm causes, then reverse to solutions | Creative problem solving |
| **Random Stimulus** | `/random-stimulus-trace` | Trigger associations with random concept | Novel connections |
| **SCAMPER** | `/scamper-trace` | Seven creative operations | Product innovation |
| **TRIZ** | `/triz-trace` | 40 inventive principles for contradictions | Engineering innovation |
| **Synectics** | `/synectics-trace` | Analogies to make strange familiar | Creative concepts |
| **Biomimicry** | `/biomimicry-trace` | Study nature's solutions | Sustainable design |
| **Morphological Analysis** | `/morphological-analysis-trace` | Combine dimensions systematically | Design space exploration |
| **Design Thinking** | `/design-thinking-trace` | Empathize, define, ideate, prototype, test | User experience |
| **Double Diamond** | `/double-diamond-trace` | Diverge and converge twice | Complex design |

### Adversarial & Critical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Red Team** | `/red-team-trace` | Simulate adversary attacking plan | Security analysis |
| **Devil's Advocacy** | `/devils-advocacy-trace` | Argue strongest case against position | Stress-testing |
| **Steelman** | `/steelman-trace` | Construct strongest opposing argument | Understanding opponents |
| **Premortem** | `/premortem-trace` | Imagine failure, work backward | Risk identification |
| **Postmortem** | `/postmortem-trace` | Analyze completed project for lessons | Process improvement |
| **Dialectical Reasoning** | `/dialectical-trace` | Thesis, antithesis, synthesis | Resolving contradictions |
| **Argument Mapping** | `/argument-map-trace` | Visualize argument structure | Logic checking |
| **Analysis of Competing Hypotheses** | `/analysis-of-competing-hypotheses-trace` | Evaluate evidence for each hypothesis | Multiple-hypothesis problems |
| **Key Assumptions Check** | `/key-assumptions-check-trace` | List and test every assumption | Assumption auditing |
| **Null Hypothesis** | `/null-hypothesis-trace` | Test if chance explains patterns | Statistical inference |
| **Deception Detection** | `/deception-detection-trace` | Analyze for deception indicators | Credibility assessment |
| **Error Analysis** | `/error-analysis-trace` | Systematically classify errors | Quality improvement |
| **OODA Red Team** | `/ooda-red-team-trace` | Adversarial Observe-Orient-Decide-Act | Security red-teaming |

### Systems Thinking Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Systems Thinking** | `/systems-thinking-trace` | Map interconnections, feedback, emergence | Complex systems |
| **Causal Loop** | `/causal-loop-trace` | Diagram reinforcing and balancing loops | System dynamics |
| **Iceberg Model** | `/iceberg-model-trace` | Events → patterns → structures → mental models | Systemic causes |
| **Feedback Loop** | `/feedback-loop-trace` | Analyze amplifying and stabilizing loops | Growth dynamics |
| **Stock and Flow** | `/stock-and-flow-trace` | Model accumulations and change rates | Resource dynamics |
| **Leverage Points** | `/leverage-points-trace` | Find small changes with large effects | Intervention design |
| **Nth-Order Effects** | `/nth-order-effects-trace` | Trace downstream consequences | Policy analysis |
| **Second-Order Effects** | `/second-order-effects-trace` | Focus on secondary consequences | Unintended effects |
| **Theory of Constraints** | `/theory-of-constraints-trace` | Identify bottleneck, subordinate to it | Throughput optimization |
| **Constraint Satisfaction** | `/constraint-satisfaction-trace` | Find solutions satisfying all constraints | Resource allocation |

### Structured Analytic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Scientific Method** | `/scientific-method-trace` | Observe, hypothesize, experiment, conclude | Empirical questions |
| **Hypothesis Testing** | `/hypothesis-testing-trace` | Formulate and test hypotheses | Claim verification |
| **Experimental Design** | `/experimental-design-trace` | Controlled experiments with randomization | Causal inference |
| **Quasi-Experimental** | `/quasi-experimental-trace` | Studies without randomization | Policy evaluation |
| **Randomized Control Trial** | `/randomized-control-trial-trace` | Gold-standard random assignment | Program evaluation |
| **Evidence Triangulation** | `/evidence-triangulation-trace` | Cross-check across sources | Fact-checking |
| **Data Quality Audit** | `/data-quality-audit-trace` | Assess completeness, accuracy, consistency | Data-driven decisions |
| **MECE Decomposition** | `/mece-decomposition-trace` | Mutually Exclusive Collectively Exhaustive | Problem structuring |
| **Issue Tree** | `/issue-tree-trace` | Decompose into sub-question hierarchy | Research planning |
| **Minto Pyramid** | `/minto-pyramid-trace` | Conclusion first, supported by arguments | Business communication |
| **Metacognitive Audit** | `/metacognitive-audit-trace` | Examine own thinking for biases | Self-assessment |

### Strategic & Business Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **SWOT Analysis** | `/swot-trace` | Strengths, Weaknesses, Opportunities, Threats | Strategic planning |
| **PESTLE** | `/pestle-trace` | Political, Economic, Social, Tech, Legal, Environmental | Market analysis |
| **Porter's Five Forces** | `/porters-five-forces-trace` | Supplier/buyer power, rivalry, substitutes, entrants | Industry analysis |
| **Stakeholder Analysis** | `/stakeholder-analysis-trace` | Map affected parties, interests, influence | Change management |
| **Game Theory** | `/game-theory-trace` | Model strategic interactions | Negotiation |
| **Incentive Analysis** | `/incentive-analysis-trace` | Map what actors are rewarded for | Behavior prediction |
| **Linchpin Analysis** | `/linchpin-analysis-trace` | Identify single critical dependency | Risk assessment |
| **Policy Analysis** | `/policy-analysis-trace` | Evaluate against effectiveness, efficiency, equity | Policy design |
| **OODA Loop** | `/ooda-loop-trace` | Observe, Orient, Decide, Act | Competitive dynamics |
| **Alternative Futures** | `/alternative-futures-trace` | Multiple divergent futures | Scenario planning |
| **Fairness Analysis** | `/fairness-analysis-trace` | Evaluate outcomes across groups | Algorithm audit |
| **Ethical Matrix** | `/ethical-matrix-trace` | Multiple ethical lenses | Ethics analysis |

### Temporal & Historical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Temporal Reasoning** | `/temporal-reasoning-trace` | Sequences, durations, deadlines | Scheduling |
| **Historical Reasoning** | `/historical-reasoning-trace` | Analyze past events for patterns | Learning from precedent |
| **Backward Chaining** | `/backward-chaining-trace` | Work backward from goal | Planning |
| **Forward Chaining** | `/forward-chaining-trace` | Apply rules from known facts | Rule-based systems |
| **Comparative Case** | `/comparative-case-trace` | Compare cases for patterns | Cross-case analysis |
| **Analogical Reasoning** | `/analogical-trace` | Map structure between domains | Solution transfer |
| **Narrative Reasoning** | `/narrative-reasoning-trace` | Construct coherent explanatory stories | Sense-making |

### Specialized & Cross-Domain Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Six Thinking Hats** | `/six-thinking-hats-trace` | Six perspectives (facts, emotions, caution, optimism, creativity, process) | Balanced thinking |
| **Socratic Questioning** | `/socratic-questioning-trace` | Probe assumptions, evidence, viewpoints | Critical thinking |
| **Mind Map** | `/mind-map-trace` | Radiate from central concept | Brainstorming |
| **Assumption Ladder** | `/assumption-ladder-trace` | Data → interpretations → assumptions | Surfacing assumptions |
| **Ethnographic Reasoning** | `/ethnographic-reasoning-trace` | Culture, context, lived experience | User research |
| **Hermeneutic Reasoning** | `/hermeneutic-trace` | Part-to-whole interpretive cycles | Text interpretation |
| **Legal Reasoning** | `/legal-reasoning-trace` | Rules to facts, precedent | Legal analysis |
| **Spatial Reasoning** | `/spatial-reasoning-trace` | Position, arrangement, orientation | Architecture |
| **Counterfactual Reasoning** | `/counterfactual-trace` | Explore "what if" alternatives | Impact evaluation |

## Constraints

**Execute all 3 layers.** Do not skip layers or summarize what they would produce. Each layer must produce its full analysis.

**Track quality deltas explicitly.** If Layer 3 adds nothing beyond Layer 2, say so. Honest quality assessment is more valuable than asserting improvement where none exists.

**Do not select scale variants as primary.** Always select the base strategy.

**Do not guess when vague.** Ask one clarifying question.

**Do write the trace to disk.**

**Do not fabricate strategies.**

**Do not confuse prompt skills with trace skills.**

## Success Criteria

- A strategy is selected from the embedded catalog matching the problem's domain.
- All 3 refinement layers are fully executed with the selected strategy.
- Quality deltas between layers are explicitly tracked and reported.
- A durable reasoning trace is written to `memory/{question_name}.md`.

## Input

**Required — invocation:** `/mixture-of-agents-pairing <problem description>`
**Implicit — strategy catalog:** The Strategy Reference section embedded in this SKILL.md.
