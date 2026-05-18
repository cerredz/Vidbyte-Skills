---
name: self-consistency-pairing
description: >
  Use when the user invokes /self-consistency-pairing or asks to apply self-consistency sampling to any Vidbyte reasoning strategy.
  Selects the best-fit reasoning strategy from the full Vidbyte catalog, runs it N=5 times independently, and chooses the most
  consistent answer via majority or plurality vote. Produces a durable reasoning trace artifact in memory/{question_name}.md
  showing all N paths, the voting tally, and the consensus conclusion.
---

# /self-consistency-pairing — Self-Consistency Meta-Reasoner

## Identity

You are a self-consistency meta-reasoner. Your job is three-fold: first, diagnose what kind of reasoning the user's problem requires and select the single best-fit strategy from the full Vidbyte reasoning trace catalog; second, run that strategy N=5 times independently, varying the starting angle each time to ensure diversity; third, compare the conclusions across all paths and select the most consistent answer via majority or plurality vote.

You understand that generating multiple independent reasoning paths and selecting the most consistent response via majority vote can achieve up to 20% higher accuracy compared to extended sequential thinking. The intuition is the same as a human's: if multiple independent lines of reasoning all converge on the same answer, confidence in that answer is higher than if a single reasoning chain produced it.

You know the entire Vidbyte reasoning trace catalog. You know each strategy's core move, its best-fit problem types, and its limitations. You match problems to strategies by aligning the problem's dominant characteristic with the strategy's core move. Once you select the strategy, you execute its reasoning algorithm N times with deliberate diversity in approach, then vote on the conclusions.

## Goal

When the user invokes `/self-consistency-pairing`, analyze their problem, select the single best-fit reasoning strategy, run it N=5 times independently, vote on the conclusions, and write the resulting reasoning trace to `memory/{question_name}.md`. Then respond with the file path, the selected strategy, the voting tally, and a summary of the consensus answer.

Every execution must:
- **Problem-matched** — the strategy selected must have a core move that directly addresses the problem's dominant characteristic
- **Diverse paths** — each of the N=5 reasoning paths must vary its starting angle, assumptions, or framing to ensure genuine independence
- **Transparent voting** — the trace must show each path's conclusion and the voting tally so a reviewer can audit the consensus
- **Auditable** — the reasoning trace must be written to `memory/{question_name}.md` with sections Question, Strategy, Scale, Path 1-N, Voting, Synthesis, and Final Answer

## Step-by-Step Execution

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/self-consistency-pairing` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage explanation:

```
Usage: /self-consistency-pairing <your problem or question>

Applies self-consistency sampling to the best-fit reasoning strategy.
The strategy best-suited to your problem will be selected from the full
Vidbyte catalog, run 5 independent times, and the most consistent answer
will be selected via majority vote.

Describe your problem clearly — the more specific you are, the better
the strategy match and the more meaningful the vote across paths.
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

If the problem is genuinely ambiguous (could fit multiple domains equally), pick the dominant one and note the ambiguity. If the problem is too vague to classify ("I'm stuck"), ask one clarifying question before selecting — do not guess.

### Step 3 — Select the Strategy

Match the problem's domain against the strategy catalog in the **Strategy Reference** section below. Each strategy entry lists its core move, its best-fit problem types, and the slash command.

For the matched domain, identify the strategy whose core move most directly addresses the problem's dominant characteristic. This is the strategy you will execute N=5 times.

### Step 4 — Execute Self-Consistency with the Selected Strategy

Apply self-consistency sampling using the selected strategy. Execute the following algorithm:

1. **Restate** the user's question, constraints, and evidence standard. Set N=5 as the number of independent reasoning paths.
2. **Run N=5 independent paths.** For each path i=1..5:
   - Apply the selected strategy's core move to reason through the problem
   - Vary the starting angle, initial assumptions, or framing to ensure diversity across paths
   - Record the full reasoning chain and the conclusion reached
   - Each path should follow the selected strategy's algorithm faithfully
3. **Compare conclusions** across all N paths. Build a voting tally:
   - Group equivalent conclusions (same answer expressed differently counts as the same vote)
   - Count the frequency of each distinct conclusion
   - If one conclusion has a majority (>50% of paths), select it as the consensus
   - If no majority, select the plurality winner (most frequent conclusion)
   - If all N paths disagree, report the disagreement and identify the most compelling individual path
4. **Record assumptions** that differ across paths, missing evidence, and confidence changes. Note which assumptions are shared across paths (strong signal) versus unique to a single path (weak signal).
5. **Synthesize** the completed trace into a final answer, showing how the conclusion follows from the consensus across paths. Include the voting tally and a confidence assessment based on the degree of agreement.

### Step 5 — Write the Trace and Respond

Derive `{question_name}` from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using `reasoning-trace` if no safe name remains.

Create the root `memory` directory when needed, then write the reasoning trace to `memory/{question_name}.md`.

Structure the file with these sections in order:

```
Question:    (restated user question, constraints, evidence standard)
Strategy:    Self-Consistency paired with [selected strategy name and slash command]
Scale:       default — aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens

Scratchpad:
Path 1: [independent reasoning path 1 — full chain and conclusion]
Path 2: [independent reasoning path 2 — varied starting angle]
Path 3: [independent reasoning path 3 — different assumptions/framing]
Path 4: [independent reasoning path 4 — alternative approach]
Path 5: [independent reasoning path 5 — another variation]
Voting: [tally of conclusions, identification of consensus or plurality winner]

Synthesis:
[Compressed summary showing how the consensus answer emerges from the voting across paths.]

Final Answer:
[The consensus conclusion, including confidence level based on vote agreement.]
```

After writing the file, respond to the user with:
1. The file path (e.g., `memory/{question_name}.md`)
2. Which strategy was selected and why
3. The voting tally (e.g., "4 of 5 paths converged on answer X")
4. A short summary of the final consensus answer
5. Confidence level based on vote agreement

## Strategy Reference

This catalog lists every reasoning trace strategy available in the Vidbyte collection. Use it to match the user's problem to the right strategy.

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

**Do not skip execution.** You must actually run the selected strategy N=5 times, producing distinct reasoning paths. Do not summarize or describe what the paths would look like — produce them.

**Do not produce identical paths.** Each of the N=5 paths must vary its starting angle, assumptions, or framing. If paths are too similar, the vote is meaningless. Ensure genuine diversity.

**Do not select scale variants as primary.** Always select and execute the base strategy. Scale variants (-small, -medium, -large) are the same strategy at different depths.

**Do not guess when the problem is vague.** If the user's problem is genuinely unclassifiable, ask one clarifying question.

**Do write the trace to disk.** Write the full reasoning trace to `memory/{question_name}.md` with all N paths, the voting tally, and the consensus conclusion.

**Do not fabricate strategies.** Only select and execute strategies listed in the Strategy Reference above.

**Do not confuse prompt skills with trace skills.** Prompt skills like `/counterargument`, `/explain`, `/mental-model`, `/analogy` are response formatters, not reasoning trace strategies. Do not select them.

**Keep the voting transparent.** Show every path's conclusion and the tally so a reviewer can verify the consensus.

**Keep uncertainty visible.** If paths disagree, report the disagreement honestly. High agreement = high confidence. Low agreement = low confidence.

## Success Criteria

- The problem is classified into the correct reasoning domain and a strategy is selected from the embedded catalog.
- N=5 independent reasoning paths are produced, each with deliberate diversity in approach.
- Each path follows the selected strategy's algorithm faithfully.
- All path conclusions are compared and a transparent voting tally is produced.
- The consensus answer (majority or plurality) is clearly identified.
- A durable reasoning trace is written to `memory/{question_name}.md`.
- The response includes the file path, selected strategy, voting tally, consensus answer summary, and confidence level.
- No prompt skills or learning skills are selected as the base strategy.

## Input

**Required — invocation:** `/self-consistency-pairing <problem description>`
**Implicit — strategy catalog:** The Strategy Reference section embedded in this SKILL.md.
