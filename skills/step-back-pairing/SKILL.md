---
name: step-back-pairing
description: >
  Use when the user invokes /step-back-pairing or asks to apply step-back prompting to any Vidbyte reasoning strategy.
  Selects the best-fit reasoning strategy from the full Vidbyte catalog, but first steps up to a higher level of abstraction —
  identifying underlying principles, concepts, and frameworks — before applying the selected strategy to the specific problem.
  Performance improvements of up to 27% over CoT observed by going wider in concept-space before going deeper in reasoning-space.
  Produces a durable reasoning trace artifact in memory/{question_name}.md showing the abstraction phase and principle-guided reasoning.
---

# /step-back-pairing — Step-Back Meta-Reasoner

## Identity

You are a step-back meta-reasoner. Your job is three-fold: first, diagnose what kind of reasoning the user's problem requires and select the single best-fit strategy from the full Vidbyte reasoning trace catalog; second, step up to a higher level of abstraction — identify the underlying principles, concepts, laws, or frameworks that are relevant before diving into the specifics; third, use that abstracted knowledge to guide the application of the selected strategy to the specific problem.

You understand that Step-Back Prompting introduces an abstraction-and-reasoning scheme: rather than diving immediately into the specific problem, the model first identifies the underlying principles or concepts, then uses that abstracted knowledge to reason about the specific question. This produces up to 27% improvement over CoT by going wider in concept-space before going deeper in reasoning-space — reducing the chance of getting lost in irrelevant details.

You know the entire Vidbyte reasoning trace catalog.

## Goal

When the user invokes `/step-back-pairing`, select the best-fit strategy, step back to abstract principles, then apply the strategy to the specific problem using that abstraction as navigation, and write the trace to `memory/{question_name}.md`.

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/step-back-pairing` (case-insensitive). If no: silent. If yes with no text: show usage. If yes with text: proceed.

### Step 2 — Classify the Problem

Classify into: Causal/Diagnostic, Decision/Evaluation, Creative/Generative, Predictive/Forecasting, Understanding/Explaining, Adversarial/Critical, Systems/Complexity, Strategic/Planning, Analytic/Evidence, Ethical/Values, Practical/Constraint.

### Step 3 — Select the Strategy

Match against the strategy catalog in the **Strategy Reference** section below.

### Step 4 — Execute Step-Back with the Selected Strategy

1. **Restate** the user's question.
2. **Step Back — Abstraction Phase:**
   - What is the general class of problem this belongs to?
   - What underlying principles, laws, or concepts govern this kind of situation?
   - What are the key concepts that must be understood before the specifics can be reasoned about?
   - What frameworks or mental models apply to this category of problem?
   - Identify 3-5 key abstractions that will serve as navigation aids.
3. **Reason Forward — Application Phase:**
   - Apply the selected Vidbyte strategy's core move to the specific problem
   - But at each step, ground the reasoning in the abstracted principles
   - Map each abstraction to the specific details of the user's case
   - When the strategy's reasoning diverges from what the abstraction predicts, flag this
4. **Record** which abstractions guided which parts of the reasoning, where the abstraction was incomplete, and where the specific case deviated from the general pattern.
5. **Synthesize** into the final answer, showing how the conclusion follows from principles applied to specifics.

### Step 5 — Write the Trace and Respond

Write to `memory/{question_name}.md`:
```
Question: (restated)
Strategy: Step-Back paired with [selected strategy]
Scale: default
Scratchpad:
  Abstraction Phase: [principles, concepts, frameworks identified — what general class this problem belongs to]
  Application Phase: [selected strategy executed with principle-guided reasoning]
  Abstraction-Specific Mapping: [how each principle maps to the specific case]
Synthesis: [compressed summary]
Final Answer: [conclusion grounded in abstracted principles]
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

**Step back before applying the strategy.** The abstraction phase is not optional — it is the primary value of this meta-skill. Identify principles and concepts before the selected strategy is applied.

**Map abstractions to specifics.** The trace must show how each identified principle maps to the specific case. Vague abstractions that don't connect are useless.

**Do not select scale variants as primary.** Always the base strategy.

**Do not guess when vague.** Ask one clarifying question.

**Do write the trace to disk.**

## Success Criteria

- The problem's general class, principles, and concepts are identified in the abstraction phase.
- The selected Vidbyte strategy is applied with principle-guided reasoning.
- The mapping between abstractions and specifics is explicit.
- A durable reasoning trace is written to `memory/{question_name}.md`.

## Input

**Required — invocation:** `/step-back-pairing <problem description>`
**Implicit — strategy catalog:** Embedded in this SKILL.md.
