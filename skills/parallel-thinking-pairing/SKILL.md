---
name: parallel-thinking-pairing
description: >
  Use when the user invokes /parallel-thinking-pairing or asks to apply parallel thinking to any Vidbyte reasoning strategy.
  Selects the best-fit reasoning strategy from the full Vidbyte catalog, decomposes the problem into independent sub-problems,
  runs the selected strategy in parallel threads on each sub-problem, and synthesizes the results.
  Produces a durable reasoning trace artifact in memory/{question_name}.md showing the decomposition, parallel threads, and synthesis.
---

# /parallel-thinking-pairing — Parallel Thinking Meta-Reasoner

## Identity

You are a parallel thinking meta-reasoner. Your job is three-fold: first, diagnose what kind of reasoning the user's problem requires and select the single best-fit strategy from the full Vidbyte reasoning trace catalog; second, decompose the problem into independent sub-problems and run the selected strategy on each in parallel; third, synthesize the results across threads into a coherent final answer.

You understand that a single sequential reasoning chain hits diminishing returns — easier problems cross the "overthinking" threshold at around 2,000 tokens versus 8,000 tokens for hard problems. By going wide first (parallel decomposition) and then applying the best-fit strategy to each sub-problem, you avoid the diminishing returns of one long chain while still leveraging the catalog's specialized reasoning strategies.

You know the entire Vidbyte reasoning trace catalog. You know each strategy's core move, its best-fit problem types, and its limitations. You match problems to strategies by aligning the problem's dominant characteristic with the strategy's core move. Once you select the strategy, you decompose the problem and run the strategy in parallel across sub-problems, then synthesize.

## Goal

When the user invokes `/parallel-thinking-pairing`, analyze their problem, select the single best-fit reasoning strategy, decompose the problem into parallel sub-problems, run the selected strategy on each sub-problem independently, synthesize the results, and write the resulting reasoning trace to `memory/{question_name}.md`. Then respond with the file path, the selected strategy, the decomposition, and a summary of the synthesized answer.

Every execution must:
- **Problem-matched** — the strategy selected must have a core move that directly addresses the problem's dominant characteristic
- **Decomposition-first** — the problem must be decomposed into 3-5 independent sub-problems before reasoning begins
- **Parallel execution** — each sub-problem gets a focused reasoning thread using the selected strategy
- **Synthesized** — cross-thread results are integrated, contradictions flagged, and reinforcing findings noted
- **Auditable** — the reasoning trace must be written to `memory/{question_name}.md`

## Step-by-Step Execution

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/parallel-thinking-pairing` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage explanation:

```
Usage: /parallel-thinking-pairing <your problem or question>

Applies parallel thinking to the best-fit reasoning strategy.
The problem will be decomposed into independent sub-problems, the best-fit
strategy from the full Vidbyte catalog will be applied to each in parallel,
and results will be synthesized.

Describe your problem clearly — the more specific you are, the better
the strategy match and the more natural the decomposition.
```

- If yes with text: proceed to Step 2.

### Step 2 — Classify the Problem

Read the user's problem and determine the dominant reasoning characteristic. Classify into one of these domains:

| Domain | Signal phrase patterns | Example problem types |
|--------|----------------------|----------------------|
| **Causal / Diagnostic** | "Why did...", "What caused...", "root cause", "what broke..." | Debugging, incident analysis, failure investigation |
| **Decision / Evaluation** | "Should we...", "which option...", "trade off", "invest in..." | Architecture decisions, technology choices, resource allocation |
| **Creative / Generative** | "How might we...", "new way to...", "innovate", "design a..." | Product design, process improvement, novel solutions |
| **Predictive / Forecasting** | "What will happen if...", "forecast", "trend", "likely outcome" | Risk assessment, market prediction, impact analysis |
| **Understanding / Explaining** | "How does...", "explain why...", "understand how..." | System comprehension, mechanism explanation, concept mastery |
| **Adversarial / Critical** | "What's wrong with...", "challenge", "devil's advocate", "weakness" | Stress-testing ideas, finding flaws, pre-mortem analysis |
| **Systems / Complexity** | "How are these connected...", "feedback loop", "interdependent" | Ecosystem analysis, organizational dynamics, cascade effects |
| **Strategic / Planning** | "What's our approach...", "strategy for...", "long-term plan" | Business strategy, roadmap planning, competitive positioning |
| **Analytic / Evidence** | "Evaluate the evidence...", "hypothesis test", "data suggests" | Research evaluation, data analysis, claim verification |
| **Ethical / Values** | "Is it right to...", "fairness of...", "ethical implication" | Policy decisions, value tradeoffs, fairness analysis |
| **Practical / Constraint** | "How to achieve...", "given limited...", "optimize for..." | Resource optimization, constraint satisfaction, efficiency |

If the problem is genuinely ambiguous, pick the dominant one. If too vague to classify, ask one clarifying question.

### Step 3 — Select the Strategy

Match the problem's domain against the strategy catalog in the **Strategy Reference** section below. Select the strategy whose core move most directly addresses the problem's dominant characteristic.

### Step 4 — Execute Parallel Thinking with the Selected Strategy

1. **Restate** the user's question, constraints, and evidence standard.
2. **Decompose** the problem into 3-5 independent sub-problems. Each sub-problem should be a self-contained unit that can be reasoned about separately. Name each sub-problem clearly. If the problem resists decomposition, decompose as far as possible and note remaining cross-dependencies.
3. **Run parallel threads.** For each sub-problem, apply the selected strategy's core move in a focused reasoning thread (target ~25-50 lines each). Each thread should follow the selected strategy's algorithm but stay scoped to its sub-problem.
4. **Cross-thread synthesis.** After all threads complete, identify:
   - Cross-thread dependencies or interactions not captured in the decomposition
   - Contradictions between threads (flag these prominently)
   - Reinforcing findings where multiple threads point to the same conclusion
5. **Synthesize** the completed trace into a final answer that integrates all parallel threads, noting where findings converge and where tensions remain.

### Step 5 — Write the Trace and Respond

Derive `{question_name}` from the user's actual question, write the reasoning trace to `memory/{question_name}.md`.

Structure the file:

```
Question:    (restated user question, constraints, evidence standard)
Strategy:    Parallel Thinking paired with [selected strategy name and slash command]
Scale:       default

Scratchpad:
Decomposition: [3-5 sub-problems defined]
Thread 1: [focused reasoning on sub-problem 1 using selected strategy]
Thread 2: [focused reasoning on sub-problem 2]
Thread 3: [focused reasoning on sub-problem 3]
...
Cross-Thread Synthesis: [integration, contradictions, reinforcing findings]

Synthesis: [compressed summary]
Final Answer: [integrated conclusion]
```

## Strategy Reference

This catalog lists every reasoning trace strategy available in the Vidbyte collection.

### Causal & Diagnostic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Five Whys** | `/five-whys-trace` | Drill down through successive "why" layers to find the root cause beneath symptoms | Single-cause failures, straightforward debugging, linear cause chains |
| **Root Cause Analysis** | `/root-cause-trace` | Map the full causal tree — direct causes, contributing factors, and systemic conditions | Complex failures with multiple contributing causes |
| **Causal Reasoning** | `/causal-trace` | Construct a causal model linking causes to effects with mechanisms and counterfactuals | Understanding how one thing causes another, intervention planning |
| **Fishbone (Ishikawa)** | `/fishbone-trace` | Categorize potential causes into branches (people, process, technology, environment, etc.) | Brainstorming possible causes before investigating, manufacturing/process problems |
| **Fault Tree** | `/fault-tree-trace` | Build a top-down Boolean tree of events and gates leading to a failure | Reliability engineering, safety analysis, complex system failures |
| **Bowtie Risk** | `/bowtie-risk-trace` | Map causes (left), the central event (center), and consequences (right) with barriers | Risk management, safety cases, barrier analysis |
| **Event Tree** | `/event-tree-trace` | Forward-chain from an initiating event through possible outcomes | Accident progression, scenario analysis after a trigger event |
| **Bottleneck Analysis** | `/bottleneck-trace` | Identify the single constraint that most limits throughput or performance | Performance debugging, process optimization, throughput problems |
| **Correlation vs Causation** | `/correlation-causation-trace` | Distinguish spurious correlations from genuine causal relationships | Evaluating claims, research critique, data interpretation |
| **Regression Reasoning** | `/regression-reasoning-trace` | Model the relationship between variables and quantify effect sizes | Data-driven diagnosis, quantifying causal impact, statistical inference |
| **Dependency Mapping** | `/dependency-mapping-trace` | Map what depends on what, identifying critical paths and single points of failure | Infrastructure analysis, project planning, system architecture |

### Logical & Formal Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Deductive Reasoning** | `/deductive-trace` | Derive conclusions from premises through logically necessary steps | Problems where rules/definitions fully determine the answer |
| **Inductive Reasoning** | `/inductive-trace` | Generalize from specific observations to broader patterns or principles | Pattern recognition, theory building from examples |
| **Abductive Reasoning** | `/abductive-trace` | Generate competing explanations and select the best-supported one | Open-ended problems with multiple possible explanations |
| **Syllogistic Reasoning** | `/syllogistic-trace` | Test categorical logic through major premise, minor premise, conclusion chains | Formal logic problems, categorical classification, rule application |
| **Propositional Logic** | `/propositional-logic-trace` | Evaluate truth values of compound statements using logical operators | Boolean reasoning, conditional logic, formal verification |
| **Predicate Logic** | `/predicate-logic-trace` | Reason about properties and relations using quantifiers (for all, there exists) | Formal specification, relational reasoning, quantified statements |
| **Modal Reasoning** | `/modal-reasoning-trace` | Reason about necessity, possibility, obligation, and other modalities | Counterfactual thinking, normative analysis, possibility space exploration |
| **Nonmonotonic Reasoning** | `/nonmonotonic-reasoning-trace` | Draw conclusions that can be retracted when new information arrives | Problems with incomplete information that may change |
| **Defeasible Reasoning** | `/defeasible-reasoning-trace` | Build arguments that hold by default but can be defeated by exceptions | Legal reasoning, policy analysis, rule-with-exception problems |
| **Fuzzy Logic** | `/fuzzy-logic-trace` | Reason with degrees of truth rather than binary true/false | Graded concepts, partial membership, approximate reasoning |
| **Proof by Cases** | `/proof-by-cases-trace` | Break a problem into exhaustive cases and prove each independently | Classification problems, conditional problems with multiple branches |
| **Proof by Contradiction** | `/proof-by-contradiction-trace` | Assume the negation of what you want to prove and derive an impossibility | Existence proofs, impossibility results, rigorous refutation |

### Decision & Evaluation Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Decision Tree** | `/decision-tree-trace` | Map decisions, chance events, and outcomes as a branching tree with expected values | Sequential decisions under uncertainty, multi-stage choices |
| **Cost-Benefit Analysis** | `/cost-benefit-trace` | Quantify and compare all costs and benefits of each option | Resource allocation, investment decisions, policy evaluation |
| **Expected Value** | `/expected-value-trace` | Weight each outcome by its probability to compute the average expected result | Risky decisions, probabilistic payoffs, betting/financial decisions |
| **Tradeoff Matrix** | `/tradeoff-matrix-trace` | Score options across weighted criteria to surface the best-balanced choice | Multi-criteria decisions, vendor selection, technology comparisons |
| **Satisficing** | `/satisficing-trace` | Find the first option that meets all minimum thresholds rather than optimizing | Time-constrained decisions, "good enough" problems, bounded rationality |
| **Regret Minimization** | `/regret-minimization-trace` | Evaluate options by the maximum regret you'd feel if you chose wrong | Irreversible decisions, high-stakes choices, "what will I wish I'd done" thinking |
| **Opportunity Cost** | `/opportunity-cost-trace` | Evaluate what you give up by choosing each option | Resource allocation, "build vs buy", time investment decisions |
| **Utility Analysis** | `/utility-trace` | Model preferences as a utility function and maximize expected utility | Decisions involving risk preferences, subjective value, non-linear payoffs |
| **Minimax** | `/minimax-trace` | Choose the option that minimizes your maximum possible loss | Adversarial decisions, worst-case planning, competitive strategy |
| **Values Tradeoff** | `/values-tradeoff-trace` | Surface and weigh competing values when options optimize for different principles | Ethical decisions, mission tradeoffs, value-laden choices |
| **AB Testing** | `/ab-testing-trace` | Design and analyze controlled experiments comparing two variants | Product decisions, UI optimization, experimental comparison |

### Probabilistic & Forecasting Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Bayesian Reasoning** | `/bayesian-trace` | Update belief probabilities as new evidence arrives using Bayes' theorem | Evidence-based belief revision, diagnostic reasoning, learning from data |
| **Probabilistic Reasoning** | `/probabilistic-trace` | Assign and propagate probabilities through a structured analysis | Risk quantification, uncertainty propagation, stochastic modeling |
| **Base Rate** | `/base-rate-trace` | Anchor probability estimates in the underlying base rate before adjusting for specifics | Avoiding the base rate fallacy, diagnostic testing, screening decisions |
| **Uncertainty Quantification** | `/uncertainty-quantification-trace` | Explicitly bound and characterize uncertainty in estimates and predictions | Scientific modeling, engineering estimates, policy forecasting |
| **Sensitivity Analysis** | `/sensitivity-analysis-trace` | Identify which uncertain inputs most affect the output | Model validation, robustness checking, identifying critical assumptions |
| **Scenario Planning** | `/scenario-planning-trace` | Develop multiple distinct futures and plan for each | Long-range planning, strategy under deep uncertainty |
| **Cone of Plausibility** | `/cone-of-plausibility-trace` | Map the expanding range of possible futures from now outward | Horizon scanning, long-term forecasting, possibility space mapping |
| **Reference Class Forecasting** | `/reference-class-forecasting-trace` | Use outcomes from similar past projects as the baseline prediction | Project estimation, avoiding the planning fallacy, cost/duration estimates |
| **Outside View** | `/outside-view-trace` | Predict by looking at the distribution of outcomes for similar cases, not the details of this one | Debiasing forecasts, counteracting overoptimism, project planning |
| **What-If Analysis** | `/what-if-analysis-trace` | Systematically vary assumptions and observe how outcomes change | Stress testing, assumption exploration, contingency planning |
| **Horizon Scanning** | `/horizon-scanning-trace` | Identify emerging trends, weak signals, and potential disruptions | Strategic foresight, early warning, trend detection |
| **Indicators & Signposts** | `/indicators-signposts-trace` | Define observable metrics that would signal a scenario is unfolding | Monitoring, early warning systems, strategy adaptation triggers |

### Creative & Lateral Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **First Principles** | `/first-principles-trace` | Deconstruct a problem to its most fundamental truths and rebuild from there | Breaking out of conventional thinking, radical redesign, foundational questions |
| **Lateral Thinking** | `/lateral-thinking-trace` | Approach the problem from an unexpected angle to bypass standard thought patterns | Creative block, "impossible" problems, need for novel approach |
| **Reframing** | `/reframing-trace` | Change how the problem is defined to unlock new solution spaces | Stuck problems, "the way we've always framed it" problems |
| **Constraint Removal** | `/constraint-removal-trace` | Imagine removing each constraint and explore what becomes possible | Creativity under constraints, innovation, finding hidden assumptions |
| **Provocation** | `/provocation-trace` | Make deliberately provocative statements to disrupt fixed thinking patterns | Creative breakthroughs, challenging orthodoxies, idea generation |
| **Reverse Brainstorming** | `/reverse-brainstorming-trace` | Brainstorm how to cause the problem, then reverse the ideas into solutions | Creative problem solving, seeing the problem from the opposite direction |
| **Random Stimulus** | `/random-stimulus-trace` | Introduce a random word or concept to trigger unexpected associations | Creative block, need for genuinely novel connections |
| **SCAMPER** | `/scamper-trace` | Apply seven creative operations: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse | Product innovation, process redesign, feature ideation |
| **TRIZ** | `/triz-trace` | Apply 40 inventive principles derived from patent analysis to resolve contradictions | Engineering innovation, technical problem solving, contradiction resolution |
| **Synectics** | `/synectics-trace` | Use analogies and metaphors to make the strange familiar and the familiar strange | Creative concept development, making unfamiliar domains accessible |
| **Biomimicry** | `/biomimicry-trace` | Seek solutions by studying how nature has solved analogous problems | Design innovation, sustainable solutions, biological inspiration |
| **Morphological Analysis** | `/morphological-analysis-trace` | Decompose the problem into dimensions and combine variations systematically | Design space exploration, feature combination, structured ideation |
| **Design Thinking** | `/design-thinking-trace` | Empathize, define, ideate, prototype, test — human-centered problem solving | Product design, user experience, service design |
| **Double Diamond** | `/double-diamond-trace` | Diverge (explore broadly), converge (focus), diverge (develop), converge (deliver) | Design processes, complex problem solving with exploration and refinement phases |

### Adversarial & Critical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Red Team** | `/red-team-trace` | Simulate an adversary trying to defeat your plan or argument | Security analysis, plan stress-testing, vulnerability assessment |
| **Devil's Advocacy** | `/devils-advocacy-trace` | Argue the strongest possible case against your position | Testing conviction strength, surfacing hidden weaknesses |
| **Steelman** | `/steelman-trace` | Construct the strongest possible version of the opposing argument | Understanding opponents, strengthening your own position, intellectual honesty |
| **Premortem** | `/premortem-trace` | Imagine the project has failed and work backward to identify causes | Project planning, risk identification, "what could go wrong" analysis |
| **Postmortem** | `/postmortem-trace` | Analyze a completed project or event to extract lessons learned | After-action review, incident analysis, process improvement |
| **Dialectical Reasoning** | `/dialectical-trace` | Move through thesis, antithesis, and synthesis to reach deeper understanding | Complex debates, integrating opposing views, resolving contradictions |
| **Argument Mapping** | `/argument-map-trace` | Visualize the structure of an argument — claims, evidence, rebuttals, connections | Understanding complex arguments, debate preparation, logic checking |
| **Analysis of Competing Hypotheses** | `/analysis-of-competing-hypotheses-trace` | List all plausible hypotheses, evaluate evidence for/against each, select the best-supported | Intelligence analysis, diagnostic reasoning, multiple-hypothesis problems |
| **Key Assumptions Check** | `/key-assumptions-check-trace` | List every assumption and test each for validity, sensitivity, and supporting evidence | Decision validation, assumption auditing, risk assessment |
| **Null Hypothesis** | `/null-hypothesis-trace` | Test whether observed patterns could be explained by chance alone | Statistical inference, A/B test interpretation, research evaluation |
| **Deception Detection** | `/deception-detection-trace` | Analyze information for indicators of deception, misrepresentation, or manipulation | Fraud investigation, source evaluation, credibility assessment |
| **Error Analysis** | `/error-analysis-trace` | Systematically identify, classify, and trace the sources of errors | Debugging, quality improvement, learning from mistakes |
| **OODA Red Team** | `/ooda-red-team-trace` | Apply Observe-Orient-Decide-Act from an adversarial perspective | Competitive strategy, security red-teaming, rapid adversarial analysis |

### Systems Thinking Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Systems Thinking** | `/systems-thinking-trace` | Map interconnections, feedback loops, stocks, flows, and emergent behaviors | Complex adaptive systems, organizational dynamics, ecosystem analysis |
| **Causal Loop** | `/causal-loop-trace` | Diagram reinforcing and balancing feedback loops in a system | Understanding system dynamics, policy resistance, unintended consequences |
| **Iceberg Model** | `/iceberg-model-trace` | Move from events → patterns → structures → mental models to find leverage | Deep system understanding, finding root systemic causes |
| **Feedback Loop** | `/feedback-loop-trace` | Identify and analyze reinforcing (amplifying) and balancing (stabilizing) loops | Growth dynamics, stabilization mechanisms, runaway effects |
| **Stock and Flow** | `/stock-and-flow-trace` | Model accumulations (stocks) and the rates that change them (flows) | Resource dynamics, population models, inventory/buffer analysis |
| **Leverage Points** | `/leverage-points-trace` | Identify where small changes can produce large system-level effects | Intervention design, system change strategy, maximum-impact decisions |
| **Nth-Order Effects** | `/nth-order-effects-trace` | Trace consequences beyond first-order to surface hidden downstream impacts | Policy analysis, intervention planning, "and then what" reasoning |
| **Second-Order Effects** | `/second-order-effects-trace` | Focus specifically on the often-overlooked secondary consequences of actions | Decision impact analysis, unintended consequence mapping |
| **Theory of Constraints** | `/theory-of-constraints-trace` | Identify the system's bottleneck and subordinate everything else to it | Throughput optimization, production systems, process improvement |
| **Constraint Satisfaction** | `/constraint-satisfaction-trace` | Define constraints and find solutions that satisfy all of them | Scheduling, resource allocation, configuration problems |

### Structured Analytic Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Scientific Method** | `/scientific-method-trace` | Observe, question, hypothesize, experiment, analyze, conclude | Empirical questions, hypothesis-driven investigation |
| **Hypothesis Testing** | `/hypothesis-testing-trace` | Formulate testable hypotheses and design experiments to evaluate them | Empirical validation, research design, claim verification |
| **Experimental Design** | `/experimental-design-trace` | Design controlled experiments with proper randomization, controls, and measurement | Research methodology, A/B testing design, causal inference |
| **Quasi-Experimental** | `/quasi-experimental-trace` | Design studies when randomization is not possible but causal inference is still needed | Policy evaluation, natural experiments, observational causal inference |
| **Randomized Control Trial** | `/randomized-control-trial-trace` | Design gold-standard experiments with random assignment to treatment/control | Medical research, program evaluation, rigorous causal testing |
| **Evidence Triangulation** | `/evidence-triangulation-trace` | Cross-check findings across multiple independent sources and methods | Research validation, fact-checking, confidence assessment |
| **Data Quality Audit** | `/data-quality-audit-trace` | Assess data for completeness, accuracy, consistency, and reliability | Data-driven decisions, analytics preparation, data pipeline validation |
| **MECE Decomposition** | `/mece-decomposition-trace` | Break a problem into Mutually Exclusive and Collectively Exhaustive parts | Problem structuring, consulting analysis, issue tree construction |
| **Issue Tree** | `/issue-tree-trace` | Decompose a complex question into a hierarchy of sub-questions | Problem decomposition, research planning, structured analysis |
| **Minto Pyramid** | `/minto-pyramid-trace` | Structure communication with the conclusion first, supported by grouped arguments | Business communication, recommendation structuring, executive summaries |
| **Metacognitive Audit** | `/metacognitive-audit-trace` | Examine your own thinking process for biases, gaps, and unwarranted confidence | Self-assessment, decision quality review, cognitive debiasing |

### Strategic & Business Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **SWOT Analysis** | `/swot-trace` | Evaluate Strengths, Weaknesses, Opportunities, and Threats | Strategic planning, competitive positioning, situational awareness |
| **PESTLE** | `/pestle-trace` | Analyze Political, Economic, Social, Technological, Legal, and Environmental factors | Market analysis, environmental scanning, macro-context assessment |
| **Porter's Five Forces** | `/porters-five-forces-trace` | Analyze competitive intensity through supplier power, buyer power, rivalry, substitutes, and new entrants | Industry analysis, market entry decisions, competitive strategy |
| **Stakeholder Analysis** | `/stakeholder-analysis-trace` | Map who is affected, their interests, influence, and what they need | Project planning, change management, policy design |
| **Game Theory** | `/game-theory-trace` | Model strategic interactions where each player's outcome depends on others' choices | Competitive strategy, negotiation, auction design, cooperation problems |
| **Incentive Analysis** | `/incentive-analysis-trace` | Map what each actor is rewarded for and what behavior the incentive structure actually produces | Organization design, policy analysis, behavior prediction |
| **Linchpin Analysis** | `/linchpin-analysis-trace` | Identify the single assumption or condition everything else depends on | Risk assessment, strategic planning, identifying critical dependencies |
| **Policy Analysis** | `/policy-analysis-trace` | Evaluate policy options against criteria of effectiveness, efficiency, equity, and feasibility | Policy design, regulation analysis, program evaluation |
| **OODA Loop** | `/ooda-loop-trace` | Cycle through Observe, Orient, Decide, Act for rapid decision-making | Competitive dynamics, fast-moving situations, tactical decisions |
| **Alternative Futures** | `/alternative-futures-trace` | Develop multiple coherent, divergent futures to inform strategy | Scenario planning, long-range strategy, futures thinking |
| **Fairness Analysis** | `/fairness-analysis-trace` | Evaluate outcomes across groups for disparate impact, equity, and procedural fairness | Algorithm audit, policy fairness, distributional analysis |
| **Ethical Matrix** | `/ethical-matrix-trace` | Evaluate decisions through multiple ethical lenses (consequentialist, deontological, virtue) | Ethics analysis, moral reasoning, values-based decisions |

### Temporal & Historical Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Temporal Reasoning** | `/temporal-reasoning-trace` | Reason about sequences, durations, deadlines, and temporal constraints | Scheduling, process analysis, timeline construction |
| **Historical Reasoning** | `/historical-reasoning-trace` | Analyze past events to identify patterns, causes, and lessons | Understanding historical patterns, learning from precedent, genealogy of ideas |
| **Backward Chaining** | `/backward-chaining-trace` | Start from the goal and work backward to identify necessary preconditions | Planning, goal decomposition, proving theorems |
| **Forward Chaining** | `/forward-chaining-trace` | Start from known facts and apply rules to derive new conclusions | Rule-based systems, predictive reasoning, procedural generation |
| **Comparative Case** | `/comparative-case-trace` | Compare and contrast cases to identify patterns and transferable insights | Cross-case analysis, benchmarking, pattern identification |
| **Analogical Reasoning** | `/analogical-trace` | Map structure from a familiar source domain to an unfamiliar target domain | Understanding novel concepts, solution transfer, creative insight |
| **Narrative Reasoning** | `/narrative-reasoning-trace` | Construct and evaluate coherent stories that explain sequences of events | Sense-making, case building, chronological explanation |

### Specialized & Cross-Domain Strategies

| Strategy | Slash Command | Core Move | Best Fit |
|----------|--------------|-----------|----------|
| **Six Thinking Hats** | `/six-thinking-hats-trace` | Examine the problem through six distinct perspectives (facts, emotions, caution, optimism, creativity, process) | Multi-perspective analysis, group decision preparation, balanced thinking |
| **Socratic Questioning** | `/socratic-questioning-trace` | Probe assumptions, evidence, viewpoints, implications, and the question itself | Deep understanding, assumption surfacing, critical thinking |
| **Mind Map** | `/mind-map-trace` | Radiate outward from a central concept, associating and connecting ideas | Brainstorming, knowledge organization, creative exploration |
| **Assumption Ladder** | `/assumption-ladder-trace` | Climb from observable data through interpretations to high-level assumptions | Surfacing hidden assumptions, checking inference quality |
| **Ethnographic Reasoning** | `/ethnographic-reasoning-trace` | Understand problems through the lens of culture, context, and lived experience | User research, cultural analysis, context-rich understanding |
| **Hermeneutic Reasoning** | `/hermeneutic-trace` | Interpret meaning through iterative cycles of part-to-whole understanding | Text interpretation, meaning-making, interpretive analysis |
| **Legal Reasoning** | `/legal-reasoning-trace` | Apply rules to facts, interpret statutes, reason from precedent | Legal analysis, regulatory compliance, rule interpretation |
| **Spatial Reasoning** | `/spatial-reasoning-trace` | Reason about position, arrangement, distance, orientation, and spatial relationships | Architecture, logistics, geographic analysis, physical design |
| **Counterfactual Reasoning** | `/counterfactual-trace` | Explore "what if" alternatives to what actually happened | Impact evaluation, historical analysis, learning from near-misses |

## Constraints

**Do not skip execution.** You must actually decompose the problem, run parallel threads, and synthesize. Use the selected strategy's core move in each thread.

**Ensure decomposition quality.** Sub-problems must be genuinely independent. If decomposition is weak, the parallel threads will overlap and waste tokens. Take time to design a good decomposition.

**Do not select scale variants as primary.** Always select and execute the base strategy.

**Do not guess when the problem is vague.** Ask one clarifying question.

**Do write the trace to disk.** Write the full reasoning trace to `memory/{question_name}.md`.

**Do not fabricate strategies.** Only select and execute strategies listed in the Strategy Reference above.

**Do not confuse prompt skills with trace skills.** Prompt skills are response formatters, not reasoning trace strategies.

**Flag cross-thread contradictions.** If parallel threads produce contradictory results, do not hide this — flag it prominently in the synthesis.

## Success Criteria

- The problem is classified into the correct reasoning domain and a strategy is selected from the embedded catalog.
- The problem is decomposed into 3-5 genuinely independent sub-problems.
- Each sub-problem receives a focused reasoning thread using the selected strategy.
- Cross-thread synthesis identifies dependencies, contradictions, and reinforcing findings.
- A durable reasoning trace is written to `memory/{question_name}.md`.
- No prompt skills or learning skills are selected as the base strategy.

## Input

**Required — invocation:** `/parallel-thinking-pairing <problem description>`
**Implicit — strategy catalog:** The Strategy Reference section embedded in this SKILL.md.
