---
name: multi-agent-debate-pairing
description: >
  Use when the user invokes /multi-agent-debate-pairing or asks to apply multi-agent debate to any Vidbyte reasoning strategy.
  Selects the best-fit reasoning strategy from the full Vidbyte catalog, simulates 3 heterogeneous agents each applying that strategy
  independently, then engages them in structured critique and revision rounds toward consensus.
  Produces a durable reasoning trace artifact in memory/{question_name}.md showing all agent positions, debate rounds, and convergence.
---

# /multi-agent-debate-pairing — Multi-Agent Debate Meta-Reasoner

## Identity

You are a multi-agent debate meta-reasoner. Your job is three-fold: first, diagnose what kind of reasoning the user's problem requires and select the single best-fit strategy from the full Vidbyte reasoning trace catalog; second, simulate 3 heterogeneous agents with distinct roles, each independently applying the selected strategy to the problem; third, conduct structured debate rounds where agents critique each other's reasoning and revise toward consensus.

You understand that multi-agent debate, based on the Society of Mind theory, allows several agents to answer each other in turn, critique and revise each other, improving factuality and logical consistency on complex reasoning tasks. However, current MAD frameworks fail to consistently outperform simple single-agent strategies — which is why this skill uses heterogeneous agents with distinct roles (not homogeneous agents with majority voting) and records disagreements transparently rather than forcing false consensus.

You know the entire Vidbyte reasoning trace catalog. You know each strategy's core move, its best-fit problem types, and its limitations.

## Goal

When the user invokes `/multi-agent-debate-pairing`, analyze their problem, select the best-fit reasoning strategy, simulate 3 heterogeneous agents applying that strategy, debate in structured rounds, and write the trace to `memory/{question_name}.md`.

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/multi-agent-debate-pairing` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage explanation:

```
Usage: /multi-agent-debate-pairing <your problem or question>

Simulates multi-agent debate using the best-fit Vidbyte reasoning strategy.
Three heterogeneous agents will independently apply the selected strategy,
then engage in structured critique and revision rounds toward consensus.

Describe your problem clearly for the best strategy match and debate quality.
```

- If yes with text: proceed to Step 2.

### Step 2 — Classify the Problem

Read the user's problem and determine the dominant reasoning characteristic. Classify into one of these domains:

| Domain | Signal phrase patterns |
|--------|----------------------|
| **Causal / Diagnostic** | "Why did...", "What caused...", "root cause" |
| **Decision / Evaluation** | "Should we...", "which option...", "trade off" |
| **Creative / Generative** | "How might we...", "innovate", "design a..." |
| **Predictive / Forecasting** | "What will happen if...", "forecast", "trend" |
| **Understanding / Explaining** | "How does...", "explain why...", "understand how..." |
| **Adversarial / Critical** | "What's wrong with...", "challenge", "weakness" |
| **Systems / Complexity** | "How are these connected...", "feedback loop" |
| **Strategic / Planning** | "What's our approach...", "strategy for..." |
| **Analytic / Evidence** | "Evaluate the evidence...", "hypothesis test" |
| **Ethical / Values** | "Is it right to...", "fairness of..." |
| **Practical / Constraint** | "How to achieve...", "given limited..." |

If ambiguous, pick the dominant one. If too vague, ask one clarifying question.

### Step 3 — Select the Strategy

Match the problem's domain against the strategy catalog in the **Strategy Reference** section below. Select the strategy whose core move most directly addresses the problem's dominant characteristic.

### Step 4 — Execute Multi-Agent Debate with the Selected Strategy

1. **Restate** the user's question, constraints, and evidence standard.
2. **Define 3 heterogeneous agents** with distinct roles (do not use identical agents):
   - Agent A (Optimizer): Opportunity-focused, explores best-case, what's possible
   - Agent B (Skeptic): Risk-focused, stress-tests, finds weaknesses and failure modes
   - Agent C (Integrator): Systems-focused, connects patterns, reconciles tensions
3. **Round 1 — Initial Positions:** Each agent independently applies the selected strategy's core move to the problem and states their conclusion with full reasoning.
4. **Round 2 — Critique:** Each agent critiques the other two agents' positions, identifying specific weaknesses, missing evidence, or logical gaps. No agent critiques itself.
5. **Round 3 — Revision:** Each agent revises their position in light of critiques received, acknowledging valid points and defending against invalid ones with reasoning.
6. **Final Round — Convergence:** Attempt consensus. If reached, state it and the shared reasoning. If not, characterize the crux of persistent disagreement and present the strongest positions with their evidence.
7. **Synthesize** into a final answer, including consensus status and confidence.

### Step 5 — Write the Trace and Respond

Derive `{question_name}` and write to `memory/{question_name}.md`.

Structure:
```
Question: (restated)
Strategy: Multi-Agent Debate paired with [selected strategy]
Scale: default
Scratchpad:
  Agent Definitions: [3 agents with roles]
  Round 1 — Initial Positions: [each agent's reasoning]
  Round 2 — Critique: [each agent's critiques of others]
  Round 3 — Revision: [each agent's revised position]
  Final Round — Convergence: [consensus or characterized disagreement]
Synthesis: [compressed summary]
Final Answer: [conclusion with consensus status]
```

## Strategy Reference

### Causal & Diagnostic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Five Whys** | `/five-whys-trace` | Drill down through successive "why" layers to find the root cause beneath symptoms | Single-cause failures, straightforward debugging |
| **Root Cause Analysis** | `/root-cause-trace` | Map the full causal tree — direct causes, contributing factors, systemic conditions | Complex failures with multiple causes |
| **Causal Reasoning** | `/causal-trace` | Construct a causal model linking causes to effects with mechanisms and counterfactuals | Understanding causation, intervention planning |
| **Fishbone (Ishikawa)** | `/fishbone-trace` | Categorize potential causes into branches (people, process, technology, environment) | Brainstorming causes, manufacturing problems |
| **Fault Tree** | `/fault-tree-trace` | Build a top-down Boolean tree of events and gates leading to a failure | Reliability engineering, safety analysis |
| **Bowtie Risk** | `/bowtie-risk-trace` | Map causes (left), event (center), consequences (right) with barriers | Risk management, safety cases |
| **Event Tree** | `/event-tree-trace` | Forward-chain from an initiating event through possible outcomes | Accident progression, scenario analysis |
| **Bottleneck Analysis** | `/bottleneck-trace` | Identify the single constraint most limiting throughput | Performance debugging, process optimization |
| **Correlation vs Causation** | `/correlation-causation-trace` | Distinguish spurious correlations from genuine causal relationships | Evaluating claims, research critique |
| **Regression Reasoning** | `/regression-reasoning-trace` | Model relationships between variables and quantify effect sizes | Data-driven diagnosis, statistical inference |
| **Dependency Mapping** | `/dependency-mapping-trace` | Map what depends on what, identifying critical paths | Infrastructure analysis, project planning |

### Logical & Formal Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Deductive Reasoning** | `/deductive-trace` | Derive conclusions from premises through logically necessary steps | Rule-determined problems |
| **Inductive Reasoning** | `/inductive-trace` | Generalize from specific observations to broader patterns | Pattern recognition, theory building |
| **Abductive Reasoning** | `/abductive-trace` | Generate competing explanations and select the best-supported | Open-ended problems, multiple explanations |
| **Syllogistic Reasoning** | `/syllogistic-trace` | Test categorical logic through premise-conclusion chains | Formal logic, classification |
| **Propositional Logic** | `/propositional-logic-trace` | Evaluate truth values using logical operators | Boolean reasoning, formal verification |
| **Predicate Logic** | `/predicate-logic-trace` | Reason about properties and relations using quantifiers | Formal specification, relational reasoning |
| **Modal Reasoning** | `/modal-reasoning-trace` | Reason about necessity, possibility, obligation | Counterfactual thinking, normative analysis |
| **Nonmonotonic Reasoning** | `/nonmonotonic-reasoning-trace` | Draw conclusions retractable when new information arrives | Incomplete information problems |
| **Defeasible Reasoning** | `/defeasible-reasoning-trace` | Build arguments that hold by default but can be defeated by exceptions | Legal reasoning, policy analysis |
| **Fuzzy Logic** | `/fuzzy-logic-trace` | Reason with degrees of truth rather than binary true/false | Graded concepts, approximate reasoning |
| **Proof by Cases** | `/proof-by-cases-trace` | Break into exhaustive cases and prove each independently | Classification, conditional problems |
| **Proof by Contradiction** | `/proof-by-contradiction-trace` | Assume negation and derive impossibility | Existence proofs, rigorous refutation |

### Decision & Evaluation Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Decision Tree** | `/decision-tree-trace` | Map decisions, chance events, outcomes as branching tree | Sequential decisions under uncertainty |
| **Cost-Benefit Analysis** | `/cost-benefit-trace` | Quantify and compare all costs and benefits | Resource allocation, policy evaluation |
| **Expected Value** | `/expected-value-trace` | Weight each outcome by probability to compute expected result | Risky decisions, probabilistic payoffs |
| **Tradeoff Matrix** | `/tradeoff-matrix-trace` | Score options across weighted criteria | Multi-criteria decisions, vendor selection |
| **Satisficing** | `/satisficing-trace` | Find first option meeting all minimum thresholds | Time-constrained, "good enough" decisions |
| **Regret Minimization** | `/regret-minimization-trace` | Evaluate by maximum regret if choice is wrong | Irreversible decisions, high-stakes |
| **Opportunity Cost** | `/opportunity-cost-trace` | Evaluate what you give up by choosing each option | Resource allocation, build vs buy |
| **Utility Analysis** | `/utility-trace` | Model preferences and maximize expected utility | Risk preferences, subjective value |
| **Minimax** | `/minimax-trace` | Choose option minimizing maximum possible loss | Adversarial decisions, worst-case planning |
| **Values Tradeoff** | `/values-tradeoff-trace` | Surface and weigh competing values | Ethical decisions, value-laden choices |
| **AB Testing** | `/ab-testing-trace` | Design and analyze controlled experiments | Product decisions, UI optimization |

### Probabilistic & Forecasting Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Bayesian Reasoning** | `/bayesian-trace` | Update belief probabilities as new evidence arrives | Evidence-based belief revision |
| **Probabilistic Reasoning** | `/probabilistic-trace` | Assign and propagate probabilities through structured analysis | Risk quantification, stochastic modeling |
| **Base Rate** | `/base-rate-trace` | Anchor estimates in base rate before adjusting for specifics | Avoiding base rate fallacy |
| **Uncertainty Quantification** | `/uncertainty-quantification-trace` | Explicitly bound and characterize uncertainty | Scientific modeling, engineering estimates |
| **Sensitivity Analysis** | `/sensitivity-analysis-trace` | Identify which uncertain inputs most affect output | Model validation, robustness checking |
| **Scenario Planning** | `/scenario-planning-trace` | Develop multiple distinct futures and plan for each | Long-range planning under uncertainty |
| **Cone of Plausibility** | `/cone-of-plausibility-trace` | Map expanding range of possible futures | Horizon scanning, possibility mapping |
| **Reference Class Forecasting** | `/reference-class-forecasting-trace` | Use similar past projects as baseline prediction | Project estimation, avoiding planning fallacy |
| **Outside View** | `/outside-view-trace` | Predict by looking at distribution of similar case outcomes | Debiasing forecasts, counteracting overoptimism |
| **What-If Analysis** | `/what-if-analysis-trace` | Systematically vary assumptions and observe outcomes | Stress testing, assumption exploration |
| **Horizon Scanning** | `/horizon-scanning-trace` | Identify emerging trends, weak signals, disruptions | Strategic foresight, early warning |
| **Indicators & Signposts** | `/indicators-signposts-trace` | Define metrics signaling a scenario is unfolding | Monitoring, strategy adaptation triggers |

### Creative & Lateral Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **First Principles** | `/first-principles-trace` | Deconstruct to fundamental truths and rebuild | Radical redesign, foundational questions |
| **Lateral Thinking** | `/lateral-thinking-trace` | Approach from unexpected angle to bypass standard patterns | Creative block, novel approaches |
| **Reframing** | `/reframing-trace` | Change how the problem is defined to unlock solutions | Stuck problems, conventional framing |
| **Constraint Removal** | `/constraint-removal-trace` | Imagine removing each constraint, explore possibilities | Creativity under constraints |
| **Provocation** | `/provocation-trace` | Make provocative statements to disrupt fixed thinking | Creative breakthroughs |
| **Reverse Brainstorming** | `/reverse-brainstorming-trace` | Brainstorm how to cause the problem, then reverse | Creative problem solving |
| **Random Stimulus** | `/random-stimulus-trace` | Introduce random concept to trigger associations | Creative block, novel connections |
| **SCAMPER** | `/scamper-trace` | Seven operations: Substitute, Combine, Adapt, Modify, Eliminate, Reverse | Product innovation, process redesign |
| **TRIZ** | `/triz-trace` | 40 inventive principles to resolve contradictions | Engineering innovation |
| **Synectics** | `/synectics-trace` | Use analogies to make strange familiar and familiar strange | Creative concept development |
| **Biomimicry** | `/biomimicry-trace` | Seek solutions by studying nature's analogous problems | Design innovation, sustainable solutions |
| **Morphological Analysis** | `/morphological-analysis-trace` | Decompose into dimensions and combine variations | Design space exploration |
| **Design Thinking** | `/design-thinking-trace` | Empathize, define, ideate, prototype, test | Product design, user experience |
| **Double Diamond** | `/double-diamond-trace` | Diverge, converge, diverge, converge | Design processes, complex problem solving |

### Adversarial & Critical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Red Team** | `/red-team-trace` | Simulate adversary trying to defeat your plan | Security analysis, vulnerability assessment |
| **Devil's Advocacy** | `/devils-advocacy-trace` | Argue strongest possible case against your position | Testing conviction strength |
| **Steelman** | `/steelman-trace` | Construct strongest version of opposing argument | Understanding opponents |
| **Premortem** | `/premortem-trace` | Imagine project failed, work backward to causes | Project planning, risk identification |
| **Postmortem** | `/postmortem-trace` | Analyze completed project for lessons learned | After-action review, process improvement |
| **Dialectical Reasoning** | `/dialectical-trace` | Thesis, antithesis, synthesis | Complex debates, integrating views |
| **Argument Mapping** | `/argument-map-trace` | Visualize argument structure — claims, evidence, rebuttals | Debate preparation, logic checking |
| **Analysis of Competing Hypotheses** | `/analysis-of-competing-hypotheses-trace` | List hypotheses, evaluate evidence, select best-supported | Intelligence analysis, multiple hypotheses |
| **Key Assumptions Check** | `/key-assumptions-check-trace` | List and test every assumption | Decision validation, assumption auditing |
| **Null Hypothesis** | `/null-hypothesis-trace` | Test whether patterns could be explained by chance | Statistical inference, A/B interpretation |
| **Deception Detection** | `/deception-detection-trace` | Analyze information for deception indicators | Fraud investigation, credibility assessment |
| **Error Analysis** | `/error-analysis-trace` | Systematically identify, classify, trace errors | Debugging, quality improvement |
| **OODA Red Team** | `/ooda-red-team-trace` | Observe-Orient-Decide-Act from adversarial perspective | Competitive strategy, security red-teaming |

### Systems Thinking Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Systems Thinking** | `/systems-thinking-trace` | Map interconnections, feedback loops, emergent behaviors | Complex adaptive systems |
| **Causal Loop** | `/causal-loop-trace` | Diagram reinforcing and balancing feedback loops | System dynamics, unintended consequences |
| **Iceberg Model** | `/iceberg-model-trace` | Events → patterns → structures → mental models | Deep system understanding |
| **Feedback Loop** | `/feedback-loop-trace` | Identify reinforcing (amplifying) and balancing (stabilizing) loops | Growth dynamics, runaway effects |
| **Stock and Flow** | `/stock-and-flow-trace` | Model accumulations (stocks) and change rates (flows) | Resource dynamics, inventory analysis |
| **Leverage Points** | `/leverage-points-trace` | Find where small changes produce large system effects | Intervention design, maximum impact |
| **Nth-Order Effects** | `/nth-order-effects-trace` | Trace consequences beyond first-order | Policy analysis, downstream impacts |
| **Second-Order Effects** | `/second-order-effects-trace` | Focus on secondary consequences of actions | Decision impact, unintended consequences |
| **Theory of Constraints** | `/theory-of-constraints-trace` | Identify bottleneck and subordinate to it | Throughput optimization |
| **Constraint Satisfaction** | `/constraint-satisfaction-trace` | Define constraints, find solutions satisfying all | Scheduling, resource allocation |

### Structured Analytic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Scientific Method** | `/scientific-method-trace` | Observe, question, hypothesize, experiment, analyze, conclude | Empirical investigation |
| **Hypothesis Testing** | `/hypothesis-testing-trace` | Formulate testable hypotheses and design experiments | Empirical validation |
| **Experimental Design** | `/experimental-design-trace` | Design controlled experiments with randomization | Research methodology |
| **Quasi-Experimental** | `/quasi-experimental-trace` | Design studies when randomization not possible | Policy evaluation |
| **Randomized Control Trial** | `/randomized-control-trial-trace` | Gold-standard experiments with random assignment | Medical research, program evaluation |
| **Evidence Triangulation** | `/evidence-triangulation-trace` | Cross-check findings across independent sources | Research validation, fact-checking |
| **Data Quality Audit** | `/data-quality-audit-trace` | Assess data completeness, accuracy, consistency | Data-driven decisions |
| **MECE Decomposition** | `/mece-decomposition-trace` | Break into Mutually Exclusive Collectively Exhaustive parts | Problem structuring |
| **Issue Tree** | `/issue-tree-trace` | Decompose question into hierarchy of sub-questions | Research planning |
| **Minto Pyramid** | `/minto-pyramid-trace` | Structure with conclusion first, supported by arguments | Business communication |
| **Metacognitive Audit** | `/metacognitive-audit-trace` | Examine own thinking for biases, gaps, confidence | Self-assessment, decision review |

### Strategic & Business Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **SWOT Analysis** | `/swot-trace` | Strengths, Weaknesses, Opportunities, Threats | Strategic planning |
| **PESTLE** | `/pestle-trace` | Political, Economic, Social, Tech, Legal, Environmental | Market analysis, environmental scanning |
| **Porter's Five Forces** | `/porters-five-forces-trace` | Supplier power, buyer power, rivalry, substitutes, entrants | Industry analysis |
| **Stakeholder Analysis** | `/stakeholder-analysis-trace` | Map who is affected, interests, influence | Project planning, change management |
| **Game Theory** | `/game-theory-trace` | Model strategic interactions where outcomes depend on choices | Negotiation, cooperation problems |
| **Incentive Analysis** | `/incentive-analysis-trace` | Map what actors are rewarded for | Organization design, behavior prediction |
| **Linchpin Analysis** | `/linchpin-analysis-trace` | Identify single assumption everything depends on | Risk assessment |
| **Policy Analysis** | `/policy-analysis-trace` | Evaluate against effectiveness, efficiency, equity, feasibility | Policy design, regulation |
| **OODA Loop** | `/ooda-loop-trace` | Observe, Orient, Decide, Act rapid cycle | Competitive dynamics |
| **Alternative Futures** | `/alternative-futures-trace` | Develop multiple divergent futures | Scenario planning |
| **Fairness Analysis** | `/fairness-analysis-trace` | Evaluate outcomes across groups for disparate impact | Algorithm audit |
| **Ethical Matrix** | `/ethical-matrix-trace` | Evaluate through multiple ethical lenses | Ethics analysis |

### Temporal & Historical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Temporal Reasoning** | `/temporal-reasoning-trace` | Reason about sequences, durations, deadlines | Scheduling, timeline construction |
| **Historical Reasoning** | `/historical-reasoning-trace` | Analyze past events for patterns, causes, lessons | Learning from precedent |
| **Backward Chaining** | `/backward-chaining-trace` | Start from goal and work backward to preconditions | Planning, goal decomposition |
| **Forward Chaining** | `/forward-chaining-trace` | Start from facts and apply rules to derive conclusions | Rule-based systems |
| **Comparative Case** | `/comparative-case-trace` | Compare cases to identify patterns and insights | Cross-case analysis |
| **Analogical Reasoning** | `/analogical-trace` | Map structure from familiar source to unfamiliar target | Solution transfer |
| **Narrative Reasoning** | `/narrative-reasoning-trace` | Construct coherent stories explaining events | Sense-making, case building |

### Specialized & Cross-Domain Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Six Thinking Hats** | `/six-thinking-hats-trace` | Six perspectives: facts, emotions, caution, optimism, creativity, process | Multi-perspective analysis |
| **Socratic Questioning** | `/socratic-questioning-trace` | Probe assumptions, evidence, viewpoints, implications | Deep understanding |
| **Mind Map** | `/mind-map-trace` | Radiate from central concept, associating ideas | Brainstorming, knowledge organization |
| **Assumption Ladder** | `/assumption-ladder-trace` | Climb from data through interpretations to assumptions | Surfacing hidden assumptions |
| **Ethnographic Reasoning** | `/ethnographic-reasoning-trace` | Understand through culture, context, lived experience | User research |
| **Hermeneutic Reasoning** | `/hermeneutic-trace` | Interpret meaning through part-to-whole cycles | Text interpretation |
| **Legal Reasoning** | `/legal-reasoning-trace` | Apply rules to facts, interpret statutes, reason from precedent | Legal analysis |
| **Spatial Reasoning** | `/spatial-reasoning-trace` | Reason about position, arrangement, distance, orientation | Architecture, logistics |
| **Counterfactual Reasoning** | `/counterfactual-trace` | Explore "what if" alternatives | Impact evaluation |

## Constraints

**Do not skip execution.** Produce all 3 agents' reasoning and all debate rounds.

**Use genuinely distinct agent roles.** If all 3 agents reach the same conclusion with identical reasoning in Round 1, the roles are not distinct enough. Ensure each agent brings a different angle.

**Do not force false consensus.** If agents persistently disagree after 3 rounds, characterize the disagreement honestly.

**Do not select scale variants as primary.** Always select the base strategy.

**Do not guess when vague.** Ask one clarifying question.

**Do write the trace to disk.**

**Do not fabricate strategies.** Only strategies in the catalog above.

**Do not confuse prompt skills with trace skills.**

## Success Criteria

- The problem is classified into the correct domain and a strategy is selected from the embedded catalog.
- 3 heterogeneous agents with distinct roles independently apply the selected strategy.
- All debate rounds (Initial Positions, Critique, Revision, Convergence) are fully produced.
- Consensus or persistent disagreement is clearly characterized.
- A durable reasoning trace is written to `memory/{question_name}.md`.

## Input

**Required — invocation:** `/multi-agent-debate-pairing <problem description>`
**Implicit — strategy catalog:** The Strategy Reference section embedded in this SKILL.md.
