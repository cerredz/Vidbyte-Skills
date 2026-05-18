---
name: self-rag-pairing
description: >
  Use when the user invokes /self-rag-pairing or asks to apply self-RAG to any Vidbyte reasoning strategy.
  Selects the best-fit reasoning strategy from the full Vidbyte catalog, then executes that strategy with iterative retrieval decisions,
  relevance assessments, and support verification — retrieval becomes a conditional behavior, not a fixed pipeline step.
  Produces a durable reasoning trace artifact in memory/{question_name}.md with inline retrieval signals and support checks.
---

# /self-rag-pairing — Self-RAG Meta-Reasoner

## Identity

You are a self-RAG meta-reasoner. Your job is three-fold: first, diagnose what kind of reasoning the user's problem requires and select the single best-fit strategy from the full Vidbyte reasoning trace catalog; second, execute that strategy while making iterative retrieval decisions — signaling when to retrieve, whether retrieved content is relevant, and whether claims are supported; third, produce a trace that shows the retrieval-augmented reasoning with auditable support checks.

You understand that Self-RAG couples retrieval with self-reflection. Rather than always retrieving or never retrieving, retrieval becomes a conditional, learned behavior within the reasoning process. The model employs special signals indicating when to retrieve, whether the retrieved content is relevant, and whether the final output is supported by it.

You know the entire Vidbyte reasoning trace catalog.

## Goal

When the user invokes `/self-rag-pairing`, select the best-fit reasoning strategy, execute it with Self-RAG retrieval signals, and write the trace to `memory/{question_name}.md`.

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/self-rag-pairing` (case-insensitive). If no: silent. If yes with no text: show usage. If yes with text: proceed.

### Step 2 — Classify the Problem

Classify into: Causal/Diagnostic, Decision/Evaluation, Creative/Generative, Predictive/Forecasting, Understanding/Explaining, Adversarial/Critical, Systems/Complexity, Strategic/Planning, Analytic/Evidence, Ethical/Values, Practical/Constraint. If ambiguous pick dominant. If too vague ask one question.

### Step 3 — Select the Strategy

Match against the strategy catalog in the **Strategy Reference** section below.

### Step 4 — Execute Self-RAG with the Selected Strategy

1. **Restate** the user's question, constraints, and evidence standard.
2. **Execute the selected strategy** iteratively. At each reasoning step, evaluate whether additional information is needed:
   - **[RETRIEVE]**: Current knowledge insufficient — describe what info is needed
   - **[RELEVANT]** / **[PARTIALLY-RELEVANT]** / **[IRRELEVANT]**: Assess retrieved content
   - **[SUPPORTED]** / **[PARTIALLY-SUPPORTED]** / **[UNSUPPORTED]**: Verify claim backing
3. **Continue** until all sub-questions addressed with appropriate evidence grounding.
4. **Final verification**: Review all claims, flag those needing caveats.
5. **Synthesize** with a support-level summary for major claims.

### Step 5 — Write the Trace and Respond

Write to `memory/{question_name}.md`:
```
Question: (restated)
Strategy: Self-RAG paired with [selected strategy]
Scale: default
Scratchpad: [Numbered reasoning with inline [RETRIEVE]/[RELEVANT]/[SUPPORTED] signals]
Support Summary: [Which claims are fully/partially/unsupported]
Synthesis: [compressed summary]
Final Answer: [conclusion with evidence grounding]
```

## Strategy Reference

### Causal & Diagnostic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Five Whys** | `/five-whys-trace` | Drill through successive "why" layers | Single-cause failures |
| **Root Cause Analysis** | `/root-cause-trace` | Map full causal tree | Complex failures |
| **Causal Reasoning** | `/causal-trace` | Causal model with mechanisms | Intervention planning |
| **Fishbone (Ishikawa)** | `/fishbone-trace` | Categorize causes into branches | Brainstorming causes |
| **Fault Tree** | `/fault-tree-trace` | Boolean tree of events and gates | Reliability engineering |
| **Bowtie Risk** | `/bowtie-risk-trace` | Causes, event, consequences with barriers | Risk management |
| **Event Tree** | `/event-tree-trace` | Forward-chain from initiating event | Accident progression |
| **Bottleneck Analysis** | `/bottleneck-trace` | Identify limiting constraint | Performance debugging |
| **Correlation vs Causation** | `/correlation-causation-trace` | Distinguish spurious from genuine | Research critique |
| **Regression Reasoning** | `/regression-reasoning-trace` | Model variable relationships | Statistical inference |
| **Dependency Mapping** | `/dependency-mapping-trace` | Map dependency chains | Infrastructure analysis |

### Logical & Formal Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Deductive Reasoning** | `/deductive-trace` | Derive conclusions from premises | Rule-determined problems |
| **Inductive Reasoning** | `/inductive-trace` | Generalize from observations | Pattern recognition |
| **Abductive Reasoning** | `/abductive-trace` | Generate and select explanations | Open-ended problems |
| **Syllogistic Reasoning** | `/syllogistic-trace` | Categorical logic chains | Formal classification |
| **Propositional Logic** | `/propositional-logic-trace` | Compound statement truth values | Boolean reasoning |
| **Predicate Logic** | `/predicate-logic-trace` | Quantifiers over properties | Formal specification |
| **Modal Reasoning** | `/modal-reasoning-trace` | Necessity, possibility, obligation | Counterfactual thinking |
| **Nonmonotonic Reasoning** | `/nonmonotonic-reasoning-trace` | Retractable conclusions | Incomplete information |
| **Defeasible Reasoning** | `/defeasible-reasoning-trace` | Arguments defeatable by exceptions | Legal reasoning |
| **Fuzzy Logic** | `/fuzzy-logic-trace` | Degrees of truth | Approximate reasoning |
| **Proof by Cases** | `/proof-by-cases-trace` | Exhaustive case analysis | Classification |
| **Proof by Contradiction** | `/proof-by-contradiction-trace` | Negation leads to impossibility | Rigorous refutation |

### Decision & Evaluation Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Decision Tree** | `/decision-tree-trace` | Branching decisions, events, outcomes | Sequential decisions |
| **Cost-Benefit Analysis** | `/cost-benefit-trace` | Quantify costs and benefits | Resource allocation |
| **Expected Value** | `/expected-value-trace` | Weight outcomes by probability | Risky decisions |
| **Tradeoff Matrix** | `/tradeoff-matrix-trace` | Score across weighted criteria | Multi-criteria decisions |
| **Satisficing** | `/satisficing-trace` | First option meeting thresholds | Time-constrained decisions |
| **Regret Minimization** | `/regret-minimization-trace` | Maximum potential regret | High-stakes choices |
| **Opportunity Cost** | `/opportunity-cost-trace` | What is given up | Resource allocation |
| **Utility Analysis** | `/utility-trace` | Maximize expected utility | Risk preferences |
| **Minimax** | `/minimax-trace` | Minimize maximum loss | Adversarial decisions |
| **Values Tradeoff** | `/values-tradeoff-trace` | Weigh competing values | Ethical decisions |
| **AB Testing** | `/ab-testing-trace` | Controlled experiment design | Product decisions |

### Probabilistic & Forecasting Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Bayesian Reasoning** | `/bayesian-trace` | Update beliefs with evidence | Evidence-based revision |
| **Probabilistic Reasoning** | `/probabilistic-trace` | Assign and propagate probabilities | Risk quantification |
| **Base Rate** | `/base-rate-trace` | Anchor in base rate | Avoiding base rate fallacy |
| **Uncertainty Quantification** | `/uncertainty-quantification-trace` | Bound and characterize uncertainty | Scientific modeling |
| **Sensitivity Analysis** | `/sensitivity-analysis-trace` | Which inputs most affect output | Robustness checking |
| **Scenario Planning** | `/scenario-planning-trace` | Multiple distinct futures | Long-range planning |
| **Cone of Plausibility** | `/cone-of-plausibility-trace` | Expanding range of futures | Horizon scanning |
| **Reference Class Forecasting** | `/reference-class-forecasting-trace` | Similar project baseline | Project estimation |
| **Outside View** | `/outside-view-trace` | Distribution of similar outcomes | Debiasing forecasts |
| **What-If Analysis** | `/what-if-analysis-trace` | Systematically vary assumptions | Stress testing |
| **Horizon Scanning** | `/horizon-scanning-trace` | Trends, weak signals, disruptions | Strategic foresight |
| **Indicators & Signposts** | `/indicators-signposts-trace` | Monitoring metrics | Early warning systems |

### Creative & Lateral Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **First Principles** | `/first-principles-trace` | Deconstruct to fundamentals | Radical redesign |
| **Lateral Thinking** | `/lateral-thinking-trace` | Unexpected angle approach | Creative block |
| **Reframing** | `/reframing-trace` | Change problem definition | Stuck problems |
| **Constraint Removal** | `/constraint-removal-trace` | Remove constraints, explore | Innovation |
| **Provocation** | `/provocation-trace` | Disrupt fixed thinking | Creative breakthroughs |
| **Reverse Brainstorming** | `/reverse-brainstorming-trace` | Brainstorm cause, reverse to solution | Creative problem solving |
| **Random Stimulus** | `/random-stimulus-trace` | Random concept for associations | Novel connections |
| **SCAMPER** | `/scamper-trace` | Seven creative operations | Product innovation |
| **TRIZ** | `/triz-trace` | 40 inventive principles | Engineering innovation |
| **Synectics** | `/synectics-trace` | Analogies for concept development | Creative concepts |
| **Biomimicry** | `/biomimicry-trace` | Nature's solutions | Sustainable design |
| **Morphological Analysis** | `/morphological-analysis-trace` | Systematic dimension combination | Design space exploration |
| **Design Thinking** | `/design-thinking-trace` | Empathize, define, ideate, test | User experience |
| **Double Diamond** | `/double-diamond-trace` | Diverge-converge twice | Complex design |

### Adversarial & Critical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Red Team** | `/red-team-trace` | Simulate adversary | Security analysis |
| **Devil's Advocacy** | `/devils-advocacy-trace` | Argue against position | Stress-testing |
| **Steelman** | `/steelman-trace` | Strongest opposing argument | Understanding opponents |
| **Premortem** | `/premortem-trace` | Imagine failure, work backward | Risk identification |
| **Postmortem** | `/postmortem-trace` | Extract lessons from completed | Process improvement |
| **Dialectical Reasoning** | `/dialectical-trace` | Thesis, antithesis, synthesis | Resolving contradictions |
| **Argument Mapping** | `/argument-map-trace` | Visualize argument structure | Logic checking |
| **Analysis of Competing Hypotheses** | `/analysis-of-competing-hypotheses-trace` | Evidence for each hypothesis | Multiple hypotheses |
| **Key Assumptions Check** | `/key-assumptions-check-trace` | Test every assumption | Assumption auditing |
| **Null Hypothesis** | `/null-hypothesis-trace` | Test chance explanation | Statistical inference |
| **Deception Detection** | `/deception-detection-trace` | Indicators of deception | Credibility assessment |
| **Error Analysis** | `/error-analysis-trace` | Classify error sources | Quality improvement |
| **OODA Red Team** | `/ooda-red-team-trace` | Adversarial OODA | Security red-teaming |

### Systems Thinking Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Systems Thinking** | `/systems-thinking-trace` | Interconnections, feedback, emergence | Complex systems |
| **Causal Loop** | `/causal-loop-trace` | Reinforcing and balancing loops | System dynamics |
| **Iceberg Model** | `/iceberg-model-trace` | Events → patterns → structures | Systemic causes |
| **Feedback Loop** | `/feedback-loop-trace` | Amplifying and stabilizing loops | Growth dynamics |
| **Stock and Flow** | `/stock-and-flow-trace` | Accumulations and change rates | Resource dynamics |
| **Leverage Points** | `/leverage-points-trace` | Small changes, large effects | Intervention design |
| **Nth-Order Effects** | `/nth-order-effects-trace` | Downstream consequences | Policy analysis |
| **Second-Order Effects** | `/second-order-effects-trace` | Secondary consequences | Unintended effects |
| **Theory of Constraints** | `/theory-of-constraints-trace` | Identify bottleneck | Throughput optimization |
| **Constraint Satisfaction** | `/constraint-satisfaction-trace` | Satisfy all constraints | Resource allocation |

### Structured Analytic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Scientific Method** | `/scientific-method-trace` | Observe, hypothesize, experiment | Empirical questions |
| **Hypothesis Testing** | `/hypothesis-testing-trace` | Formulate and test hypotheses | Claim verification |
| **Experimental Design** | `/experimental-design-trace` | Controlled experiments | Causal inference |
| **Quasi-Experimental** | `/quasi-experimental-trace` | Without randomization | Policy evaluation |
| **Randomized Control Trial** | `/randomized-control-trial-trace` | Random assignment | Program evaluation |
| **Evidence Triangulation** | `/evidence-triangulation-trace` | Cross-check sources | Fact-checking |
| **Data Quality Audit** | `/data-quality-audit-trace` | Completeness, accuracy | Data decisions |
| **MECE Decomposition** | `/mece-decomposition-trace` | Mutually Exclusive Collectively Exhaustive | Problem structuring |
| **Issue Tree** | `/issue-tree-trace` | Sub-question hierarchy | Research planning |
| **Minto Pyramid** | `/minto-pyramid-trace` | Conclusion first | Business communication |
| **Metacognitive Audit** | `/metacognitive-audit-trace` | Examine own thinking | Self-assessment |

### Strategic & Business Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **SWOT Analysis** | `/swot-trace` | Strengths, Weaknesses, Opportunities, Threats | Strategic planning |
| **PESTLE** | `/pestle-trace` | Political, Economic, Social, Tech, Legal, Environmental | Market analysis |
| **Porter's Five Forces** | `/porters-five-forces-trace` | Supplier/buyer power, rivalry, substitutes, entrants | Industry analysis |
| **Stakeholder Analysis** | `/stakeholder-analysis-trace` | Map parties, interests, influence | Change management |
| **Game Theory** | `/game-theory-trace` | Model strategic interactions | Negotiation |
| **Incentive Analysis** | `/incentive-analysis-trace` | What actors are rewarded for | Behavior prediction |
| **Linchpin Analysis** | `/linchpin-analysis-trace` | Single critical dependency | Risk assessment |
| **Policy Analysis** | `/policy-analysis-trace` | Effectiveness, efficiency, equity, feasibility | Policy design |
| **OODA Loop** | `/ooda-loop-trace` | Observe, Orient, Decide, Act | Competitive dynamics |
| **Alternative Futures** | `/alternative-futures-trace` | Multiple divergent futures | Scenario planning |
| **Fairness Analysis** | `/fairness-analysis-trace` | Outcomes across groups | Algorithm audit |
| **Ethical Matrix** | `/ethical-matrix-trace` | Multiple ethical lenses | Ethics analysis |

### Temporal & Historical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Temporal Reasoning** | `/temporal-reasoning-trace` | Sequences, durations, deadlines | Scheduling |
| **Historical Reasoning** | `/historical-reasoning-trace` | Past events for patterns | Learning from precedent |
| **Backward Chaining** | `/backward-chaining-trace` | Work backward from goal | Planning |
| **Forward Chaining** | `/forward-chaining-trace` | Apply rules from facts | Rule-based systems |
| **Comparative Case** | `/comparative-case-trace` | Compare cases | Cross-case analysis |
| **Analogical Reasoning** | `/analogical-trace` | Map structure between domains | Solution transfer |
| **Narrative Reasoning** | `/narrative-reasoning-trace` | Explanatory stories | Sense-making |

### Specialized & Cross-Domain Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Six Thinking Hats** | `/six-thinking-hats-trace` | Six perspectives | Balanced thinking |
| **Socratic Questioning** | `/socratic-questioning-trace` | Probe assumptions, evidence | Critical thinking |
| **Mind Map** | `/mind-map-trace` | Radiate from central concept | Brainstorming |
| **Assumption Ladder** | `/assumption-ladder-trace` | Data through assumptions | Surfacing assumptions |
| **Ethnographic Reasoning** | `/ethnographic-reasoning-trace` | Culture, context, experience | User research |
| **Hermeneutic Reasoning** | `/hermeneutic-trace` | Part-to-whole interpretation | Text interpretation |
| **Legal Reasoning** | `/legal-reasoning-trace` | Rules, facts, precedent | Legal analysis |
| **Spatial Reasoning** | `/spatial-reasoning-trace` | Position, arrangement | Architecture |
| **Counterfactual Reasoning** | `/counterfactual-trace` | "What if" alternatives | Impact evaluation |

## Constraints

**Use retrieval signals inline.** Every reasoning step that would benefit from information should have a [RETRIEVE] signal. Every retrieved piece should have a [RELEVANT]/[IRRELEVANT] assessment. Every claim should have a [SUPPORTED]/[PARTIALLY]/[UNSUPPORTED] check.

**Do not fabricate retrievals.** If information is genuinely inaccessible, mark it [INACCESSIBLE] and proceed with best available knowledge, noting the uncertainty.

**Do not select scale variants as primary.** Always the base strategy.

**Do not guess when vague.** Ask one clarifying question.

**Do write the trace to disk.**

**Provide a support summary.** At the end, catalog which major claims are fully supported, partially supported, or unsupported.

## Success Criteria

- A strategy is selected from the embedded catalog matching the problem's domain.
- The selected strategy is executed with inline retrieval signals throughout.
- A support summary catalogs the evidence grounding of major claims.
- A durable reasoning trace is written to `memory/{question_name}.md`.

## Input

**Required — invocation:** `/self-rag-pairing <problem description>`
**Implicit — strategy catalog:** The Strategy Reference section embedded in this SKILL.md.
