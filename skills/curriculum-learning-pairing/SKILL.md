---
name: curriculum-learning-pairing
description: >
  Use when the user invokes /curriculum-learning-pairing or asks to apply curriculum learning scaffolding to any Vidbyte reasoning strategy.
  Selects the best-fit reasoning strategy from the full Vidbyte catalog, then builds a curriculum of progressively harder proxy problems,
  solving each with the selected strategy as a stepping stone before confronting the target problem.
  The reasoning trace builds up incrementally through solved sub-problems — contrasting with CoT which jumps straight at the full problem.
  Produces a durable reasoning trace artifact in memory/{question_name}.md showing the curriculum design and progressive solutions.
---

# /curriculum-learning-pairing — Curriculum Learning Meta-Reasoner

## Identity

You are a curriculum learning meta-reasoner. Your job is three-fold: first, diagnose what kind of reasoning the user's problem requires and select the single best-fit strategy from the full Vidbyte reasoning trace catalog; second, design a curriculum of progressively harder proxy problems related to the target, where each solved problem serves as a stepping stone; third, apply the selected strategy to solve each stepping-stone problem in order, accumulating insights that transfer to the target.

You understand that Curricular Learning with Analogical Reasoning steers the model to solve easy proxy queries first, then gradually presents harder versions. The easy queries and solutions serve as stepping stones, forming a curriculum for the chain of thought. The reasoning trace builds up incrementally through solved sub-problems before confronting the hard target — contrasting with CoT which jumps straight at the full problem.

You know the entire Vidbyte reasoning trace catalog.

## Goal

When the user invokes `/curriculum-learning-pairing`, select the best-fit strategy, build a curriculum, solve stepping-stone problems, and write the trace to `memory/{question_name}.md`.

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/curriculum-learning-pairing` (case-insensitive). If no: silent. If yes with no text: show usage. If yes with text: proceed.

### Step 2 — Classify the Problem

Classify into: Causal/Diagnostic, Decision/Evaluation, Creative/Generative, Predictive/Forecasting, Understanding/Explaining, Adversarial/Critical, Systems/Complexity, Strategic/Planning, Analytic/Evidence, Ethical/Values, Practical/Constraint.

### Step 3 — Select the Strategy

Match against the strategy catalog in the **Strategy Reference** section below.

### Step 4 — Execute Curriculum Learning with the Selected Strategy

1. **Restate** the user's question.
2. **Design the Curriculum:**
   - Analyze the target problem's complexity and identify its core dynamic
   - Design 3-5 progressively harder proxy problems. Each should:
     - Be a simplified version of the target (remove complexity layers)
     - Capture a core aspect that transfers to the next step
     - Build directly on the previous step's solution
   - Start with the simplest version, add complexity layers until reaching the target
3. **Solve Each Stepping Stone:**
   - For each proxy problem in order (easiest first):
     - State the simplified problem clearly
     - Apply the selected Vidbyte strategy's core move to solve it
     - Identify what this solution teaches that transfers to the next step
4. **Confront the Target:**
   - Apply the accumulated insights, patterns, and solutions from the curriculum
   - Use stepping-stone solutions as building blocks or analogical anchors
   - The selected strategy's core move is applied to the full target problem, informed by the curriculum
5. **Synthesize** into the final answer, showing how the curriculum built toward the target.

### Step 5 — Write the Trace and Respond

Write to `memory/{question_name}.md`:
```
Question: (restated)
Strategy: Curriculum Learning paired with [selected strategy]
Scale: default
Scratchpad:
  Curriculum Design: [3-5 stepping-stone problems defined, ordered by difficulty]
  Stepping Stone 1: [simplest version + solution + transfer insight]
  Stepping Stone 2: [next difficulty + solution + transfer]
  Stepping Stone 3: [...]
  Target Solution: [full problem solved using accumulated curriculum]
Synthesis: [compressed summary showing curriculum-to-target progression]
Final Answer: [conclusion built from curriculum]
```

## Strategy Reference

### Causal & Diagnostic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Five Whys** | `/five-whys-trace` | Drill through "why" layers | Single-cause failures |
| **Root Cause Analysis** | `/root-cause-trace` | Full causal tree | Complex failures |
| **Causal Reasoning** | `/causal-trace` | Causal model | Intervention planning |
| **Fishbone (Ishikawa)** | `/fishbone-trace` | Branch causes | Brainstorming |
| **Fault Tree** | `/fault-tree-trace` | Boolean event tree | Reliability |
| **Bowtie Risk** | `/bowtie-risk-trace` | Causes-event-consequences | Risk management |
| **Event Tree** | `/event-tree-trace` | Forward-chain | Accident analysis |
| **Bottleneck Analysis** | `/bottleneck-trace` | Limiting constraint | Performance |
| **Correlation vs Causation** | `/correlation-causation-trace` | Spurious vs genuine | Research critique |
| **Regression Reasoning** | `/regression-reasoning-trace` | Model relationships | Statistical inference |
| **Dependency Mapping** | `/dependency-mapping-trace` | Dependency chains | Infrastructure |

### Logical & Formal Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Deductive Reasoning** | `/deductive-trace` | Premises to conclusions | Rule-determined |
| **Inductive Reasoning** | `/inductive-trace` | Observations to patterns | Pattern recognition |
| **Abductive Reasoning** | `/abductive-trace` | Generate explanations | Open-ended |
| **Syllogistic Reasoning** | `/syllogistic-trace` | Categorical chains | Classification |
| **Propositional Logic** | `/propositional-logic-trace` | Compound truth | Boolean reasoning |
| **Predicate Logic** | `/predicate-logic-trace` | Quantified properties | Formal specification |
| **Modal Reasoning** | `/modal-reasoning-trace` | Necessity, possibility | Counterfactual |
| **Nonmonotonic Reasoning** | `/nonmonotonic-reasoning-trace` | Retractable conclusions | Incomplete info |
| **Defeasible Reasoning** | `/defeasible-reasoning-trace` | Default with exceptions | Legal reasoning |
| **Fuzzy Logic** | `/fuzzy-logic-trace` | Degrees of truth | Approximate |
| **Proof by Cases** | `/proof-by-cases-trace` | Exhaustive cases | Classification |
| **Proof by Contradiction** | `/proof-by-contradiction-trace` | Negation impossibility | Rigorous refutation |

### Decision & Evaluation Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Decision Tree** | `/decision-tree-trace` | Branch decisions | Sequential decisions |
| **Cost-Benefit Analysis** | `/cost-benefit-trace` | Quantify costs/benefits | Resource allocation |
| **Expected Value** | `/expected-value-trace` | Probability-weighted | Risky decisions |
| **Tradeoff Matrix** | `/tradeoff-matrix-trace` | Weighted criteria | Multi-criteria |
| **Satisficing** | `/satisficing-trace` | First meeting threshold | Time-constrained |
| **Regret Minimization** | `/regret-minimization-trace` | Maximum regret | High-stakes |
| **Opportunity Cost** | `/opportunity-cost-trace` | What's given up | Resource allocation |
| **Utility Analysis** | `/utility-trace` | Maximize utility | Risk preferences |
| **Minimax** | `/minimax-trace` | Minimize max loss | Adversarial |
| **Values Tradeoff** | `/values-tradeoff-trace` | Weigh values | Ethical decisions |
| **AB Testing** | `/ab-testing-trace` | Controlled experiments | Product decisions |

### Probabilistic & Forecasting Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Bayesian Reasoning** | `/bayesian-trace` | Update with evidence | Belief revision |
| **Probabilistic Reasoning** | `/probabilistic-trace` | Probability propagation | Risk quantification |
| **Base Rate** | `/base-rate-trace` | Anchor in base rate | Base rate fallacy |
| **Uncertainty Quantification** | `/uncertainty-quantification-trace` | Bound uncertainty | Scientific modeling |
| **Sensitivity Analysis** | `/sensitivity-analysis-trace` | Critical inputs | Robustness |
| **Scenario Planning** | `/scenario-planning-trace` | Multiple futures | Long-range planning |
| **Cone of Plausibility** | `/cone-of-plausibility-trace` | Expanding futures | Horizon scanning |
| **Reference Class Forecasting** | `/reference-class-forecasting-trace` | Similar baseline | Project estimation |
| **Outside View** | `/outside-view-trace` | Distribution of outcomes | Debiasing |
| **What-If Analysis** | `/what-if-analysis-trace` | Vary assumptions | Stress testing |
| **Horizon Scanning** | `/horizon-scanning-trace` | Trends, signals | Foresight |
| **Indicators & Signposts** | `/indicators-signposts-trace` | Monitoring metrics | Early warning |

### Creative & Lateral Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **First Principles** | `/first-principles-trace` | Deconstruct fundamentals | Radical redesign |
| **Lateral Thinking** | `/lateral-thinking-trace` | Unexpected angle | Creative block |
| **Reframing** | `/reframing-trace` | Change definition | Stuck problems |
| **Constraint Removal** | `/constraint-removal-trace` | Remove constraints | Innovation |
| **Provocation** | `/provocation-trace` | Disrupt thinking | Breakthroughs |
| **Reverse Brainstorming** | `/reverse-brainstorming-trace` | Cause, reverse | Creative solving |
| **Random Stimulus** | `/random-stimulus-trace` | Random associations | Novel connections |
| **SCAMPER** | `/scamper-trace` | Seven operations | Product innovation |
| **TRIZ** | `/triz-trace` | 40 principles | Engineering |
| **Synectics** | `/synectics-trace` | Analogies | Creative concepts |
| **Biomimicry** | `/biomimicry-trace` | Nature's solutions | Sustainable design |
| **Morphological Analysis** | `/morphological-analysis-trace` | Dimension combos | Design exploration |
| **Design Thinking** | `/design-thinking-trace` | Empathize, define, test | UX design |
| **Double Diamond** | `/double-diamond-trace` | Diverge-converge | Complex design |

### Adversarial & Critical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Red Team** | `/red-team-trace` | Simulate adversary | Security |
| **Devil's Advocacy** | `/devils-advocacy-trace` | Argue against | Stress-testing |
| **Steelman** | `/steelman-trace` | Strongest opposition | Opponent understanding |
| **Premortem** | `/premortem-trace` | Imagine failure | Risk identification |
| **Postmortem** | `/postmortem-trace` | Lessons from completed | Process improvement |
| **Dialectical Reasoning** | `/dialectical-trace` | Thesis-antithesis-synthesis | Contradictions |
| **Argument Mapping** | `/argument-map-trace` | Visualize structure | Logic checking |
| **Analysis of Competing Hypotheses** | `/analysis-of-competing-hypotheses-trace` | Evidence per hypothesis | Multiple hypotheses |
| **Key Assumptions Check** | `/key-assumptions-check-trace` | Test assumptions | Auditing |
| **Null Hypothesis** | `/null-hypothesis-trace` | Chance explanation | Statistical inference |
| **Deception Detection** | `/deception-detection-trace` | Deception indicators | Credibility |
| **Error Analysis** | `/error-analysis-trace` | Classify errors | Quality improvement |
| **OODA Red Team** | `/ooda-red-team-trace` | Adversarial OODA | Red-teaming |

### Systems Thinking Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Systems Thinking** | `/systems-thinking-trace` | Interconnections | Complex systems |
| **Causal Loop** | `/causal-loop-trace` | Reinforcing, balancing | System dynamics |
| **Iceberg Model** | `/iceberg-model-trace` | Events → structures | Systemic causes |
| **Feedback Loop** | `/feedback-loop-trace` | Amplifying, stabilizing | Growth dynamics |
| **Stock and Flow** | `/stock-and-flow-trace` | Accumulations, rates | Resource dynamics |
| **Leverage Points** | `/leverage-points-trace` | Small change, big effect | Intervention |
| **Nth-Order Effects** | `/nth-order-effects-trace` | Downstream cascade | Policy analysis |
| **Second-Order Effects** | `/second-order-effects-trace` | Secondary consequences | Unintended effects |
| **Theory of Constraints** | `/theory-of-constraints-trace` | Bottleneck | Throughput |
| **Constraint Satisfaction** | `/constraint-satisfaction-trace` | Satisfy constraints | Resource allocation |

### Structured Analytic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Scientific Method** | `/scientific-method-trace` | Hypothesize, experiment | Empirical |
| **Hypothesis Testing** | `/hypothesis-testing-trace` | Formulate and test | Claim verification |
| **Experimental Design** | `/experimental-design-trace` | Controlled experiments | Causal inference |
| **Quasi-Experimental** | `/quasi-experimental-trace` | Without randomization | Policy evaluation |
| **Randomized Control Trial** | `/randomized-control-trial-trace` | Random assignment | Program evaluation |
| **Evidence Triangulation** | `/evidence-triangulation-trace` | Cross-check sources | Fact-checking |
| **Data Quality Audit** | `/data-quality-audit-trace` | Completeness, accuracy | Data decisions |
| **MECE Decomposition** | `/mece-decomposition-trace` | Mutually exclusive exhaustive | Problem structuring |
| **Issue Tree** | `/issue-tree-trace` | Sub-question hierarchy | Research planning |
| **Minto Pyramid** | `/minto-pyramid-trace` | Conclusion first | Communication |
| **Metacognitive Audit** | `/metacognitive-audit-trace` | Examine thinking | Self-assessment |

### Strategic & Business Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **SWOT Analysis** | `/swot-trace` | Strengths, Weaknesses, Opps, Threats | Strategic planning |
| **PESTLE** | `/pestle-trace` | Political, Economic, Social, Tech, Legal, Env | Market analysis |
| **Porter's Five Forces** | `/porters-five-forces-trace` | Rivalry, substitutes, entrants | Industry analysis |
| **Stakeholder Analysis** | `/stakeholder-analysis-trace` | Map parties | Change management |
| **Game Theory** | `/game-theory-trace` | Strategic interactions | Negotiation |
| **Incentive Analysis** | `/incentive-analysis-trace` | Reward structures | Behavior prediction |
| **Linchpin Analysis** | `/linchpin-analysis-trace` | Critical dependency | Risk assessment |
| **Policy Analysis** | `/policy-analysis-trace` | Effectiveness, efficiency | Policy design |
| **OODA Loop** | `/ooda-loop-trace` | Observe, Orient, Decide, Act | Competitive dynamics |
| **Alternative Futures** | `/alternative-futures-trace` | Divergent futures | Scenario planning |
| **Fairness Analysis** | `/fairness-analysis-trace` | Across groups | Algorithm audit |
| **Ethical Matrix** | `/ethical-matrix-trace` | Multiple lenses | Ethics analysis |

### Temporal & Historical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Temporal Reasoning** | `/temporal-reasoning-trace` | Sequences, durations | Scheduling |
| **Historical Reasoning** | `/historical-reasoning-trace` | Past patterns | Learning from precedent |
| **Backward Chaining** | `/backward-chaining-trace` | Goal backward | Planning |
| **Forward Chaining** | `/forward-chaining-trace` | Facts to rules | Rule-based systems |
| **Comparative Case** | `/comparative-case-trace` | Compare cases | Cross-case analysis |
| **Analogical Reasoning** | `/analogical-trace` | Map structure | Solution transfer |
| **Narrative Reasoning** | `/narrative-reasoning-trace` | Explanatory stories | Sense-making |

### Specialized & Cross-Domain Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Six Thinking Hats** | `/six-thinking-hats-trace` | Six perspectives | Balanced thinking |
| **Socratic Questioning** | `/socratic-questioning-trace` | Probe assumptions | Critical thinking |
| **Mind Map** | `/mind-map-trace` | Radiate from center | Brainstorming |
| **Assumption Ladder** | `/assumption-ladder-trace` | Data to assumptions | Surfacing assumptions |
| **Ethnographic Reasoning** | `/ethnographic-reasoning-trace` | Culture, context | User research |
| **Hermeneutic Reasoning** | `/hermeneutic-trace` | Part-to-whole | Text interpretation |
| **Legal Reasoning** | `/legal-reasoning-trace` | Rules, precedent | Legal analysis |
| **Spatial Reasoning** | `/spatial-reasoning-trace` | Position, arrangement | Architecture |
| **Counterfactual Reasoning** | `/counterfactual-trace` | What-if alternatives | Impact evaluation |

## Constraints

**Design a real curriculum.** Don't just solve the target problem directly with 3 minor variations. Each stepping stone should be genuinely simpler and build cumulatively toward the target.

**Show transfer between steps.** After each stepping-stone solution, explicitly state what transfers to the next step. The trace should show the learning progression.

**Do not select scale variants as primary.** Always the base strategy.

**Do not guess when vague.** Ask one clarifying question.

**Do write the trace to disk.**

## Success Criteria

- A curriculum of 3-5 progressively harder proxy problems is designed.
- Each stepping stone is solved using the selected Vidbyte strategy.
- Transfer insights between steps are explicitly recorded.
- The target problem solution leverages the accumulated curriculum.
- A durable reasoning trace is written to `memory/{question_name}.md`.

## Input

**Required — invocation:** `/curriculum-learning-pairing <problem description>`
**Implicit — strategy catalog:** Embedded in this SKILL.md.
