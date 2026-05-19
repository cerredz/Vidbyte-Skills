---
name: self-consistency-reasoning
description: >
  Use when the user invokes /self-consistency-reasoning or wants to apply
  self-consistency sampling (Wang et al., ICLR 2023) as a meta-layer over any
  Vidbyte reasoning strategy. Samples N=5 diverse reasoning paths via temperature
  decoding from a single base strategy, then majority-votes the most consistent
  answer. Pairs with any CoT-prompted strategy in the Vidbyte catalog — no
  additional training required.
---

# /self-consistency-reasoning — Self-Consistency Meta-Reasoner

## Goal

When the user invokes `/self-consistency-reasoning`, analyze their problem, select or confirm a base reasoning strategy from the Vidbyte catalog, run that strategy across N=5 independent reasoning paths with temperature sampling to produce diverse reasoning chains, then aggregate the results via majority vote to select the most consistent answer. Write the complete trace — including all five reasoning paths, the vote tally, and the consensus answer — to `memory/{question_name}.md`. The meta-skill wraps any Vidbyte reasoning strategy (causal, diagnostic, decision, creative, probabilistic, or otherwise) and applies the self-consistency technique from Wang et al. (ICLR 2023), which replaces greedy decoding with sampling-based diversity to produce more reliable answers, especially for tasks where a single reasoning path can drift or hallucinate.

This meta-skill does not replace the reasoning strategy — it amplifies it. The base strategy provides the reasoning architecture (Five Whys drills through causal layers, Bayesian Reasoning updates beliefs from evidence, Decision Trees map outcomes under uncertainty), and self-consistency provides a reliability layer on top by running that architecture multiple times with different decoding seeds and selecting the answer that emerges most frequently across runs. The user gets both the benefit of a domain-appropriate reasoning structure and the robustness of consensus across diverse reasoning paths. The trace file captures every reasoning path in full, making the consensus derivation auditable — a reviewer can inspect all five scratchpads side by side and verify that the winning answer truly emerged from the data rather than from a single lucky decoding.

## Intent

We run this meta-skill because single-path reasoning is fragile. Even the best reasoning strategy can produce a wrong answer when the model commits to an early misstep — a faulty causal attribution, an incorrect base rate, a premature closure on one hypothesis — and then elaborates that error through the rest of the trace. Self-consistency addresses this by sampling multiple independent reasoning paths, each of which may make different early missteps, and letting the aggregate signal across paths surface the correct answer. The technique is grounded in the empirical finding that, for reasoning tasks where there is typically a single correct answer (math word problems, logical deduction, diagnostic classification), the most frequent answer across diverse reasoning chains is substantially more accurate than the answer from any single chain.

Self-consistency is a decoding strategy, not a training procedure. It requires no fine-tuning, no additional data, and no change to the underlying model or to the base reasoning strategy it wraps. It is complementary to every other improvement — chain-of-thought prompting, step-back prompting, retrieval augmentation, and multi-agent debate — because it operates at the inference layer and can be applied on top of any strategy that produces a final answer. The only requirement is that the base strategy be run with non-zero temperature so that each path produces a meaningfully different reasoning trace; identical paths provide no diversity and therefore no benefit. Our default of N=5 balances accuracy gains against inference cost, following Wang et al.'s finding that gains are steepest in the first 5–10 paths and diminish after roughly 40.

## Background — What Is Self-Consistency Reasoning

Self-consistency (Wang et al., "Self-Consistency Improves Chain of Thought Reasoning in Language Models," ICLR 2023) is a decoding strategy that replaces the standard greedy decoding used in chain-of-thought prompting with a sampling-and-aggregation approach. Instead of taking the single most probable token at each step (greedy decoding produces exactly one reasoning path), the model generates N diverse reasoning paths by sampling from the decoder's output distribution with non-zero temperature, then extracts the final answer from each path and selects the most frequent answer via majority vote. The technique is motivated by the observation that language models can arrive at the correct answer through many different reasoning sequences — and that when they do, the correct answer tends to appear consistently across diverse paths while incorrect answers are idiosyncratic and don't repeat.

The empirical results are strong and consistent across benchmark families. On GSM8K (grade-school math word problems), self-consistency with N=40 paths improved accuracy from 56.5% (greedy) to 74.4% — a gain of 17.9 percentage points. On SVAMP (structure-varied arithmetic), the gain was 11.0 points. On AQuA (algebraic word problems), 12.2 points. The technique scales gracefully: majority-vote accuracy increases monotonically with the number of paths sampled, with the steepest gains in the first 5–10 paths and diminishing returns beyond roughly 40. For practical use within Vidbyte, we default to N=5 to capture most of the gain while keeping inference cost manageable, and we allow the user to increase N for high-stakes problems where the marginal accuracy gain justifies the additional compute.

The key insight is that self-consistency exploits a property of the model's output distribution: for many reasoning tasks, the correct answer lies in a high-probability region of the answer space (many paths converge to it), while incorrect answers are scattered across low-probability regions (few paths land on the same wrong answer). Majority vote simply reads out the modal answer from this distribution. This works because the model's reasoning errors tend to be diverse — different paths make different mistakes — while correct reasoning converges. If errors were systematic (all paths made the same mistake), self-consistency would offer no benefit; the empirical results demonstrate that this is not the case and that path diversity is naturally achieved through temperature sampling without any special prompting.

## Algorithm

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/self-consistency-reasoning` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage explanation:

```
Usage: /self-consistency-reasoning <your problem or question>

Self-consistency runs your question through N=5 diverse reasoning paths
using a single base strategy, then majority-votes the most frequent answer.
This makes the final answer more reliable than any single reasoning run.

Optionally specify a base strategy (e.g., /self-consistency-reasoning
--strategy /five-whys-trace "Why did our deployment fail?") or let the
meta-reasoner select the best-fit strategy automatically.

To get the strongest results, describe your problem in detail — the base
strategy will use your full description to structure its reasoning, and
self-consistency will amplify the reliability of that structure's output.
```

- If yes with text: proceed to Step 2.

### Step 2 — Clarify Ambiguity

If the user's problem is genuinely ambiguous (e.g., "I need help with this decision" without specifying what decision), ask one clarifying question about the domain and type of reasoning needed. A wrong base strategy applied five times still produces a wrong consensus. Do not guess.

If the user specified a base strategy via `--strategy <name>` (e.g., `--strategy /five-whys-trace`), extract and validate it against the Reasoning Arsenal below. If the named strategy is not in the arsenal, respond with: "Strategy `/xyz` not found in the Vidbyte reasoning catalog. Here are the available strategies grouped by domain:" and list the domains from the arsenal.

If no base strategy was specified, proceed to Step 3 to classify and select one automatically.

### Step 3 — Web Search for Skills if Not Installed

If the base strategy identified in Step 2 does not match any skill installed in the local Vidbyte collection (check by scanning the `skills/` directory for a matching `*-trace` directory with a `SKILL.md` file), perform a web search for "Vidbyte skills reasoning strategies <strategy-name>" to locate the skill definition. If found, install it. If not found at all, fall back to abductive reasoning as the base strategy and notify the user.

### Step 4 — Classify the Problem

Read the user's problem and determine the dominant reasoning characteristic. Classify into the domains listed in the **Reasoning Arsenal** section below. Match the problem's dominant characteristic against the prose descriptions — each strategy entry describes what the strategy does, what it is best for, and what makes it distinctive, so you can match by alignment rather than by keyword.

### Step 5 — Select the Base Strategy from the Arsenal

From the matched domain, select the single strategy whose core move most directly addresses the problem's dominant characteristic. The Reasoning Arsenal below provides prose descriptions organized by domain — read the entries in the matched domain and select the one whose description best fits the problem. If the problem has characteristics from multiple domains, prioritize the dominant one and note the secondary domains for transparency in the trace.

### Step 6 — Run N=5 Paths with the Base Strategy

Execute the selected base strategy's algorithm five times, each with a meaningfully different reasoning path. To achieve path diversity:

- Use explicit instruction at the start of each path: "Reasoning Path {i}/5 — approach this problem from a different angle than previous paths. If previous paths emphasized causal structure, try a probabilistic framing. If previous paths were analytical, try a counterfactual approach." Vary the starting perspective explicitly.
- Each path must produce a complete reasoning trace following the base strategy's algorithm: restate the question, apply the core move, produce numbered reasoning items, record assumptions and uncertainty, and synthesize a final answer.
- Extract the final answer from each path as a concise, comparable statement (typically 1–3 sentences). This is the answer that will be compared across paths for the vote.

Number the paths clearly in the output: `## Path 1/5`, `## Path 2/5`, and so on, with each path containing its own scratchpad and final answer. If the base strategy is particularly complex, each path may be proportionally longer; the total scratchpad across all five paths will typically be larger than a single-path trace.

### Step 7 — Vote

After all five paths are complete, extract the final answer from each path. Compare the answers and group equivalent answers together — answers that express the same conclusion in different words count as the same vote. Tally the votes for each distinct answer. The answer with the most votes is the consensus.

If there is a tie (e.g., 2-2-1 split), present the tied answers as competing conclusions with equal support, and report the tally transparently. If no answer receives more than one vote (1-1-1-1-1 split), report that the paths did not converge and present the diversity of perspectives as the output, recommending that the user re-examine the problem framing or provide additional constraints.

Write the tally in the output as a clear table:

```
| Answer | Paths Supporting | Count |
|--------|-----------------|-------|
| Answer A | Paths 1, 3, 5 | 3 |
| Answer B | Path 2 | 1 |
| Answer C | Path 4 | 1 |
```

### Step 8 — Write Trace to Disk

Derive `{question_name}` from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using `self-consistency-trace` if no safe name remains.

Create the root `memory` directory when needed, then write the complete self-consistency trace to `memory/{question_name}.md`.

Structure the file with these sections in order:

```
Question:    (restated user question, constraints, evidence standard)
Base Strategy:    (name of the selected base strategy and its slash command)
Meta-Strategy:    Self-Consistency (Wang et al., ICLR 2023), N=5 paths
Scale:       (default — aim for roughly 5,000 to 8,000 tokens total across all paths)

Path 1/5:
[Complete reasoning trace for path 1 — apply the base strategy's algorithm]

Path 2/5:
[Complete reasoning trace for path 2 — apply the base strategy's algorithm from a different angle]

Path 3/5:
[Complete reasoning trace for path 3]

Path 4/5:
[Complete reasoning trace for path 4]

Path 5/5:
[Complete reasoning trace for path 5]

Vote Tally:
| Answer | Paths Supporting | Count |
|--------|-----------------|-------|
| ... | ... | ... |

Consensus Answer:
[The answer with the most votes, or a report of divergence if no consensus emerged]

Divergence Analysis:
[If paths diverged, analyze why — what assumptions or evidence led to different conclusions]
```

After writing the file, respond to the user with:
1. The file path (e.g., `memory/{question_name}.md`)
2. Which base strategy was used and why it was the best fit
3. The consensus answer (or the divergence report if no consensus emerged)
4. The vote tally in brief
5. Optionally, 1–2 runner-up strategies the user could try if they want a different angle

## Reasoning Arsenal

### Causal & Diagnostic

**Five Whys** drills down through successive "why" layers to find the root cause beneath symptoms. Best for single-cause failures and straightforward debugging where the cause chain is linear and each layer has one dominant answer. Use it when you suspect the problem has a single root that probing deeper will reveal, rather than a tangle of interdependent causes.

**Root Cause Analysis** maps the full causal tree — direct causes, contributing factors, and systemic conditions — rather than stopping at one root. Best for complex failures where multiple factors interacted to produce the outcome, and where fixing one cause without addressing systemic conditions would let the failure recur. Use it when the problem resists single-cause explanation.

**Causal Reasoning** constructs a causal model linking causes to effects with explicit mechanisms and counterfactuals — what would have happened if the cause had been absent. Best for understanding how one thing causes another and for planning interventions with predictable effects. Use it when you need to reason about manipulation and control, not just correlation.

**Fishbone (Ishikawa)** categorizes potential causes into standardized branches (people, process, technology, environment, materials, measurement) to ensure broad coverage before investigating. Best for brainstorming possible causes in manufacturing, operations, or process problems where the cause is unknown and categories prevent blind spots. Use it as a structured brainstorming tool, not a final diagnostic.

**Fault Tree** builds a top-down Boolean tree of events connected by AND/OR gates leading to a top-level failure. Best for reliability engineering, safety analysis, and complex system failures where you need to compute failure probabilities or identify minimal cut sets. Use it when the system's failure logic can be expressed as Boolean combinations.

**Bowtie Risk** maps causes on the left, the central risk event in the middle, and consequences on the right, with preventive and mitigative barriers on each side. Best for risk management and safety cases where you need to demonstrate that barriers exist and are adequate. Use it when the problem is about a specific risk event with identifiable causes and consequences.

**Event Tree** forward-chains from an initiating event through a sequence of possible outcomes, branching at each safety barrier or decision point. Best for accident progression analysis and scenario exploration after a trigger event. Use it when you need to trace forward from "what just happened" to "what could happen next."

**Bottleneck Analysis** identifies the single constraint that most limits throughput or performance in a system. Best for performance debugging and process optimization where you need to find the one thing to fix for maximum gain. Use it when the system has a clear limiting factor rather than distributed degradation.

**Correlation vs Causation** systematically distinguishes spurious correlations from genuine causal relationships by testing for confounding, reverse causation, and coincidental alignment. Best for evaluating causal claims, interpreting observational data, and critiquing research that implies causation from correlation. Use it when someone says "X causes Y" but hasn't established mechanism or ruled out alternatives.

**Regression Reasoning** models the relationship between variables and quantifies effect sizes while accounting for confounds. Best for data-driven diagnosis where you have numeric data and need to estimate how much one variable changes when another changes. Use it when the problem is quantitative and you can access or estimate the relevant data.

**Dependency Mapping** maps what depends on what, identifying critical paths, single points of failure, and cascade risks in a system of interconnected components. Best for infrastructure analysis, project planning, and architecture review where failures propagate through dependencies. Use it when you need to understand what breaks if a specific component fails.

### Logical & Formal

**Deductive Reasoning** derives conclusions from premises through logically necessary steps — if the premises are true, the conclusion must be true. Best for problems where rules, definitions, or formal axioms fully determine the answer, and where the reasoning can be validated by checking each inferential step. Use it when the problem has a provably correct answer given accepted premises.

**Inductive Reasoning** generalizes from specific observations to broader patterns, principles, or theories. Best for pattern recognition, theory building from examples, and problems where you have data but no pre-existing rule that determines the answer. Use it when you need to infer a general principle from specific cases, acknowledging that inductive conclusions are probable, not certain.

**Abductive Reasoning** generates competing explanations for observed evidence and selects the best-supported one by comparing explanatory power, simplicity, and coherence. Best for open-ended diagnostic problems with multiple possible explanations where you need to identify the most plausible account. Use it as the default fallback when no other strategy is a clear fit — it handles ambiguity well.

**Syllogistic Reasoning** tests categorical logic through chains of major premise, minor premise, and conclusion, checking for validity (does the conclusion follow?) and soundness (are the premises true?). Best for formal logic problems, categorical classification, and rule application where the reasoning structure is categorical. Use it when the problem can be expressed in "All X are Y, Z is X, therefore Z is Y" form.

**Propositional Logic** evaluates truth values of compound statements using logical operators (AND, OR, NOT, IMPLIES) and tests for logical equivalence, consistency, and entailment. Best for Boolean reasoning, conditional logic puzzles, and formal verification of logical arguments. Use it when the problem involves complex combinations of true/false conditions.

**Predicate Logic** reasons about properties and relations using quantifiers — "for all" (universal) and "there exists" (existential) — over domains of objects. Best for formal specification, relational reasoning, and quantified statements where propositional logic is insufficiently expressive. Use it when relationships between objects and quantified properties are central to the reasoning.

**Modal Reasoning** handles necessity, possibility, obligation, permission, and other modalities that go beyond simple true/false. Best for counterfactual thinking ("what must have been true"), normative analysis ("what should be done"), and possibility space exploration ("what could happen"). Use it when the problem involves what could or must be, not just what is.

**Nonmonotonic Reasoning** draws conclusions that can be retracted when new information arrives — reasoning that is defeasible rather than absolute. Best for problems with incomplete information where conclusions are provisional and subject to revision. Use it when you know your information is partial and you expect updates.

**Defeasible Reasoning** builds arguments that hold by default but can be defeated by exceptions or countervailing considerations. Best for legal reasoning, policy analysis, and rule-with-exception problems where general principles have specific carve-outs. Use it when rules have "unless" clauses that matter.

**Fuzzy Logic** reasons with degrees of truth — a statement can be 0.7 true rather than strictly true or false. Best for graded concepts, partial membership, and approximate reasoning where crisp categories distort reality. Use it when the problem involves "somewhat," "mostly," or continuous gradations rather than binary classification.

**Proof by Cases** breaks a problem into exhaustive, mutually exclusive cases and proves the desired result for each case independently. Best for classification problems, conditional problems with multiple branches, and situations where the reasoning differs fundamentally across categories. Use it when you can partition the problem space cleanly.

**Proof by Contradiction** assumes the negation of what you want to prove and derives a logical impossibility, thereby establishing the original claim. Best for impossibility results, uniqueness proofs, and rigorous refutation of positions. Use it when direct proof is unwieldy but proving the impossibility of the opposite is tractable.

### Decision & Evaluation

**Decision Tree** maps decisions, chance events, and outcomes as a branching tree, computing expected values by folding back from the leaves. Best for sequential decisions under uncertainty with multiple stages where later decisions depend on earlier outcomes. Use it when the decision has a clear temporal structure with chance nodes between choice points.

**Cost-Benefit Analysis** quantifies and compares all costs and benefits of each option, converting heterogeneous impacts to a common metric (typically monetary or utility). Best for resource allocation, investment decisions, and policy evaluation where tradeoffs can be monetized or otherwise quantified. Use it when you can estimate both sides of the ledger with reasonable precision.

**Expected Value** weights each possible outcome by its probability to compute the probability-weighted average result for each option. Best for risky decisions with probabilistic payoffs — betting, financial decisions, and project selection under uncertainty. Use it when probabilities can be estimated and outcomes can be quantified, and when the decision will be repeated (justifying the average-based criterion).

**Tradeoff Matrix** scores options across multiple weighted criteria, surfacing the best-balanced choice when no option dominates on every dimension. Best for multi-criteria decisions like vendor selection, technology comparisons, and hiring decisions. Use it when you have clear criteria but options that excel on different dimensions.

**Satisficing** finds the first option that meets all minimum acceptability thresholds rather than seeking the optimal option. Best for time-constrained decisions, "good enough" problems, and situations where the cost of optimization exceeds the benefit. Use it when the decision isn't worth exhaustive search.

**Regret Minimization** evaluates options by the maximum regret you would feel — the difference between the outcome you got and the best outcome you could have gotten — and chooses the option with the smallest maximum regret. Best for irreversible, high-stakes decisions where you want to protect against the worst-case feeling of having chosen wrong. Use it when the decision is one you can't undo.

**Opportunity Cost** evaluates what you give up by choosing each option — the value of the next-best alternative foregone. Best for resource allocation decisions where choosing one thing means not choosing another, and the comparison is between the chosen option and its best alternative. Use it when the choice is fundamentally about what you're saying no to.

**Utility Analysis** models preferences as a utility function and maximizes expected utility, accommodating risk aversion, diminishing returns, and subjective value. Best for decisions involving risk preferences, non-linear payoffs, and situations where money doesn't equal value. Use it when the decision-maker's attitude toward risk matters.

**Minimax** chooses the option that minimizes your maximum possible loss — optimal for adversarial decisions where an opponent is actively working against you. Best for competitive strategy, security decisions, and worst-case planning. Use it when you need to protect against the worst the environment (or an adversary) can throw at you.

**Values Tradeoff** surfaces and weighs competing values when options optimize for fundamentally different principles — e.g., efficiency vs. equity, speed vs. quality, autonomy vs. safety. Best for ethical decisions, mission tradeoffs, and value-laden choices where the core conflict is between goods, not between good and bad. Use it when the decision is really about what kind of organization or person you want to be.

**AB Testing** designs and analyzes controlled experiments comparing two variants (A vs. B) with proper randomization, sample size justification, and statistical inference. Best for product decisions, UI optimization, and any empirical comparison where you can run a live experiment. Use it when you can generate data rather than rely on judgment.

### Probabilistic & Forecasting

**Bayesian Reasoning** updates belief probabilities as evidence arrives using Bayes' theorem — starting from a prior, multiplying by the likelihood of the evidence under each hypothesis, and normalizing to get the posterior. Best for evidence-based belief revision, diagnostic reasoning where base rates matter, and learning from sequential data. Use it when you have prior beliefs that should be updated by new information.

**Probabilistic Reasoning** assigns and propagates probabilities through a structured analysis, tracking how uncertainty in inputs produces uncertainty in outputs. Best for risk quantification, uncertainty propagation, and stochastic modeling where you have a model structure but uncertain parameters. Use it when you need to be explicit about how sure or unsure you are.

**Base Rate** anchors probability estimates in the underlying base rate — the prevalence of the outcome in the relevant population — before adjusting for case-specific details. Best for avoiding the base rate fallacy in diagnostic testing, screening decisions, and any prediction where the background frequency dominates. Use it when you're tempted to ignore "how common is this, generally?" in favor of vivid case details.

**Uncertainty Quantification** explicitly bounds and characterizes uncertainty in estimates — confidence intervals, credible intervals, prediction intervals, and sensitivity ranges. Best for scientific modeling, engineering estimates, and policy forecasting where decision-makers need to know how much they don't know. Use it when you need to communicate uncertainty precisely.

**Sensitivity Analysis** identifies which uncertain inputs most affect the output, so you know where to invest effort in reducing uncertainty. Best for model validation, robustness checking, and identifying the critical assumptions that drive conclusions. Use it when you have a model and want to know which levers actually matter.

**Scenario Planning** develops multiple distinct, coherent futures — not predictions but plausible alternative worlds — and plans for each. Best for long-range strategy under deep uncertainty where the future is unknowable and the goal is robustness across scenarios. Use it when the question is "what should we do now given that the future could unfold in fundamentally different ways?"

**Cone of Plausibility** maps the expanding range of possible futures from now outward, showing how uncertainty grows with time horizon. Best for horizon scanning, long-term forecasting, and communicating why near-term predictions can be precise while far-term ones cannot. Use it when you need to show the relationship between time and uncertainty.

**Reference Class Forecasting** predicts by looking at the distribution of outcomes for similar past projects — your project is a member of a class, and the class distribution is your baseline prediction. Best for project estimation, avoiding the planning fallacy, and cost or duration estimates where inside-view optimism dominates. Use it when you need an outside-view baseline.

**Outside View** predicts by anchoring in the distribution of outcomes for similar cases rather than the details of this specific case — the statistical answer before the narrative answer. Best for debiasing forecasts, counteracting overoptimism, and project planning where inside-view details seduce you into false precision. Use it when your detailed plan feels right but you suspect the base rate tells a different story.

**What-If Analysis** systematically varies assumptions and observes how outcomes change — stress-testing the conclusion against alternative inputs. Best for stress testing, assumption exploration, and contingency planning where you want to know what would break your conclusion. Use it when you have a baseline analysis and want to know how robust it is.

**Horizon Scanning** identifies emerging trends, weak signals, and potential disruptions by surveying a broad information landscape for early indicators of change. Best for strategic foresight, early warning, and trend detection where the goal is awareness, not prediction. Use it when you want to know what's emerging that could matter.

**Indicators & Signposts** defines observable metrics that would signal a particular scenario is unfolding — the things you'd expect to see if a given future were materializing. Best for monitoring programs, early warning systems, and adaptive strategy where you need triggers to re-evaluate your plan. Use it when you need to know when to change course.

### Creative & Lateral

**First Principles** deconstructs a problem to its most fundamental truths — the things you know with certainty — and rebuilds a solution from those foundations, discarding all inherited assumptions. Best for breaking out of conventional thinking, radical redesign, and problems where "the way it's always been done" is the obstacle. Use it when you need to question everything, including the question.

**Lateral Thinking** approaches the problem from an unexpected angle to bypass standard thought patterns and access solutions that systematic reasoning misses. Best for creative block, "impossible" problems, and situations where direct attack has failed repeatedly. Use it when you need to escape the rut of conventional approaches.

**Reframing** changes how the problem is defined — its boundaries, its goal, its constraints — to unlock new solution spaces. Best for stuck problems where the current framing is the obstacle, not the solution space. Use it when "we've tried everything" really means "we've tried everything within this frame."

**Constraint Removal** imagines removing each constraint in turn and explores what becomes possible, identifying which constraints are real and which are self-imposed. Best for creativity under constraints, innovation, and finding the hidden degrees of freedom. Use it when you suspect your constraints are more assumed than real.

**Provocation** makes deliberately provocative, counter-intuitive statements to disrupt fixed thinking patterns and force the mind into new territory. Best for creative breakthroughs, challenging organizational orthodoxies, and escaping groupthink. Use it when the room needs shaking up — but don't use it when stakeholders need reassurance.

**Reverse Brainstorming** brainstorms how to cause the problem — how to make it worse, how to ensure failure — then inverts the ideas into solutions. Best for creative problem solving when standard brainstorming has stalled, because thinking about how to break something is often easier than thinking about how to fix it. Use it when you're stuck in solution-brainstorming mode.

**Random Stimulus** introduces a random word, image, or concept to trigger unexpected associations and break the mind out of its current associative path. Best for creative block and need for genuinely novel connections that structured methods wouldn't produce. Use it when you need a spark, not a framework.

**SCAMPER** applies seven creative operations — Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse — to an existing solution or product to generate variants. Best for product innovation, process redesign, and feature ideation where you have a starting point to transform. Use it as a systematic creativity checklist.

**TRIZ** applies 40 inventive principles derived from patent analysis to resolve technical contradictions without tradeoffs — making something stronger and lighter, faster and more accurate. Best for engineering innovation, technical problem solving, and contradiction resolution where tradeoffs feel inevitable. Use it when you face a genuine engineering contradiction.

**Synectics** uses analogies and metaphors to make the strange familiar (understanding new concepts through known ones) and the familiar strange (seeing everyday things in novel ways). Best for creative concept development and making unfamiliar domains accessible through comparison. Use it when bridging between known and unknown domains.

**Biomimicry** seeks solutions by studying how nature has solved analogous problems — structural efficiency from bones, adhesion from gecko feet, optimization from ant colonies. Best for design innovation, sustainable solutions, and problems where biological evolution has already run the experiment. Use it when nature might have solved your problem already.

**Morphological Analysis** decomposes the problem into independent dimensions, enumerates values for each dimension, and systematically explores combinations from the resulting matrix. Best for design space exploration, feature combination, and structured ideation where you want to ensure combinatorial coverage. Use it when the solution space can be parameterized.

**Design Thinking** moves through empathize, define, ideate, prototype, and test — a human-centered problem-solving process grounded in user needs. Best for product design, user experience, and service design where the user's experience is the measure of success. Use it when you're building for humans and need to understand them first.

**Double Diamond** structures problem solving into two divergence-convergence cycles: diverge to explore the problem broadly, converge to define it precisely, diverge to develop many solutions, converge to deliver one. Best for design processes and complex problem solving where exploration and refinement must alternate. Use it when you need both breadth and focus.

### Adversarial & Critical

**Red Team** simulates a motivated adversary trying to defeat your plan, argument, or system, identifying vulnerabilities before real adversaries do. Best for security analysis, plan stress-testing, and vulnerability assessment where the threat is active and adaptive. Use it when you need to think like someone who wants you to fail.

**Devil's Advocacy** argues the strongest possible case against your position, regardless of whether the advocate believes it, to surface weaknesses and test conviction strength. Best for testing conviction strength, surfacing hidden weaknesses, and preparing for criticism. Use it before making a case to others — it tells you where you're vulnerable.

**Steelman** constructs the strongest possible version of the opposing argument — better than the opponent could make it — before engaging with it. Best for understanding opponents genuinely, strengthening your own position through engagement with the best counterarguments, and demonstrating intellectual honesty. Use it when you want to argue against the best version, not the weakest.

**Premortem** imagines the project has already failed and works backward to identify all the causes of that failure, producing a risk inventory generated by prospective hindsight. Best for project planning, risk identification, and "what could go wrong" analysis before launch. Use it when optimism is high and skepticism is needed.

**Postmortem** analyzes a completed project or event to extract lessons learned — what went well, what went wrong, and what should change. Best for after-action review, incident analysis, and organizational learning from experience. Use it after something ends, not before.

**Dialectical Reasoning** moves through thesis (initial position), antithesis (its contradiction), and synthesis (a higher-order resolution that integrates the truth in both). Best for complex debates, integrating opposing views, and resolving apparent contradictions by finding the deeper unity. Use it when two positions both seem right in different ways.

**Argument Mapping** visualizes the structure of an argument — claims, evidence, rebuttals, and their logical connections — to make the reasoning architecture inspectable. Best for understanding complex arguments, debate preparation, and logic checking where you need to see how the pieces fit. Use it when you're drowning in prose and need to see the structure.

**Analysis of Competing Hypotheses** lists all plausible hypotheses, evaluates evidence for and against each in a matrix, and selects the best-supported while actively seeking evidence that discriminates between hypotheses. Best for intelligence analysis, complex diagnostic reasoning, and multiple-hypothesis problems where confirmation bias is the main risk. Use it when you have multiple explanations and need to avoid cherry-picking supporting evidence.

**Key Assumptions Check** lists every assumption underlying a conclusion and tests each for validity, sensitivity, and supporting evidence — identifying which assumptions, if wrong, would change everything. Best for decision validation, assumption auditing, and risk assessment where unnoticed assumptions are the main failure mode. Use it when you suspect you're standing on unexamined ground.

**Null Hypothesis** tests whether observed patterns could be explained by chance alone — the baseline of "nothing interesting is happening" against which claims of effect must be measured. Best for statistical inference, A/B test interpretation, and research evaluation where you need to distinguish signal from noise. Use it when someone claims to see a pattern and you need to check whether random variation could produce it.

**Deception Detection** analyzes information for indicators of deception, misrepresentation, or manipulation — inconsistencies, implausible details, motive patterns, and linguistic markers. Best for fraud investigation, source evaluation, and credibility assessment where the truth-telling assumption is unsafe. Use it when you have reason to doubt the information source.

**Error Analysis** systematically identifies, classifies, and traces the sources of errors in a process or system — distinguishing systematic errors from random ones, common causes from special causes. Best for debugging, quality improvement, and learning from mistakes where the error pattern is more informative than any single error. Use it when you need to go from "this failed" to "this is why it fails."

**OODA Red Team** applies Boyd's Observe-Orient-Decide-Act loop from an adversarial perspective — how would a competitor cycle through OODA to defeat you? Best for competitive strategy, security red-teaming, and rapid adversarial analysis where the opponent's decision cycle matters. Use it when your adversary is adaptive and fast.

### Systems Thinking

**Systems Thinking** maps interconnections, feedback loops, stocks, flows, and emergent behaviors to understand why a system behaves as it does — often counterintuitively. Best for complex adaptive systems, organizational dynamics, and ecosystem analysis where linear cause-effect thinking produces policy resistance. Use it when the problem resists direct solutions because the system pushes back.

**Causal Loop** diagrams reinforcing (amplifying) and balancing (stabilizing) feedback loops in a system, revealing the circular causality that drives behavior over time. Best for understanding system dynamics, policy resistance, and unintended consequences where you need to see the loops, not just the links. Use it when you suspect feedback is the key to the system's behavior.

**Iceberg Model** moves from surface events to underlying patterns, then to systemic structures, then to the mental models that create those structures — using depth as the organizing principle. Best for deep system understanding and finding leverage points where intervention would change the system rather than just treat symptoms. Use it when you want to go deeper than events.

**Feedback Loop** identifies and analyzes reinforcing loops (virtuous and vicious cycles that amplify change) and balancing loops (goal-seeking mechanisms that resist change). Best for growth dynamics, stabilization mechanisms, and runaway effects where the loop structure determines the behavior. Use it when the system is driven by feedback, not by one-way causation.

**Stock and Flow** models accumulations (stocks — things that build up or deplete) and the rates that change them (flows — things that add to or subtract from stocks). Best for resource dynamics, population models, and inventory or buffer analysis where accumulation and depletion are the central mechanisms. Use it when the problem is about levels, not just rates.

**Leverage Points** identifies where small changes can produce large system-level effects — the places to intervene in a system, ranked by effectiveness. Based on Donella Meadows's hierarchy from constants and parameters (weak) to the mindset out of which the system arises (strongest). Best for intervention design and system change strategy where you want maximum impact from minimum effort. Use it when you need to know where to push.

**Nth-Order Effects** traces consequences beyond first-order to surface hidden downstream impacts — the chain of "and then what?" that turns a seemingly beneficial intervention into a harmful one (or vice versa). Best for policy analysis, intervention planning, and "and then what" reasoning where first-order thinking misleads. Use it when the obvious answer might be wrong because of downstream effects.

**Second-Order Effects** focuses specifically on the often-overlooked secondary consequences of actions — the effects that happen because the first-order effects changed something else. Best for decision impact analysis and unintended consequence mapping where the first-order effect is clear but the chain reaction is not. Use it when you need to check "and then?"

**Theory of Constraints** identifies the system's single bottleneck (the constraint that limits throughput) and subordinates everything else to maximizing flow through that constraint. Best for throughput optimization, production systems, and process improvement where a single constraint dominates. Use it when you can identify the one thing that's holding everything back.

**Constraint Satisfaction** defines constraints and finds solutions that satisfy all of them simultaneously — a feasible solution, not necessarily an optimal one. Best for scheduling, resource allocation, and configuration problems where the challenge is finding any solution that works. Use it when feasibility is the goal, not optimization.

### Structured Analytic

**Scientific Method** cycles through observe, question, hypothesize, experiment, analyze, and conclude — the classic empirical investigation loop. Best for empirical questions where you can gather data systematically and test predictions. Use it when the question is empirical and you can design a test.

**Hypothesis Testing** formulates testable hypotheses and designs experiments to evaluate them against data — specifying what evidence would support or refute each. Best for empirical validation, research design, and claim verification where you need to move from "I think" to "the data show." Use it when you have a specific claim to test.

**Experimental Design** designs controlled experiments with proper randomization, control groups, blinding, and measurement to establish causality. Best for research methodology, A/B testing design, and causal inference where you can manipulate the independent variable. Use it when you need to design the experiment, not just interpret its results.

**Quasi-Experimental** designs studies when randomization is not possible but causal inference is still needed — using methods like difference-in-differences, regression discontinuity, and instrumental variables. Best for policy evaluation, natural experiments, and observational causal inference where you can't randomize but still need to estimate effects. Use it when the ideal experiment is impossible.

**Randomized Control Trial** designs gold-standard experiments with random assignment to treatment and control groups, eliminating selection bias. Best for medical research, program evaluation, and rigorous causal testing where the stakes justify the cost of randomization. Use it when you need the highest standard of causal evidence.

**Evidence Triangulation** cross-checks findings across multiple independent sources and methods — if surveys, behavioral data, and expert interviews all point the same way, confidence increases; if they diverge, you've found a gap to investigate. Best for research validation, fact-checking, and confidence assessment where no single source is definitive. Use it when you have multiple evidence streams and need to synthesize them.

**Data Quality Audit** assesses data for completeness, accuracy, consistency, and reliability before using it for decisions. Best for data-driven decisions, analytics preparation, and data pipeline validation where the quality of the conclusion depends on the quality of the data. Use it before trusting the numbers.

**MECE Decomposition** breaks a problem into Mutually Exclusive (no overlap) and Collectively Exhaustive (no gaps) parts — the consulting-standard problem structuring tool. Best for problem structuring, consulting analysis, and issue tree construction where completeness and clarity matter. Use it when you need to be sure you haven't missed anything and haven't double-counted.

**Issue Tree** decomposes a complex question into a hierarchy of sub-questions, organized logically so that answering the leaves answers the root. Best for problem decomposition, research planning, and structured analysis where the question is too big to answer directly. Use it when you need to break the problem into answerable pieces.

**Minto Pyramid** structures communication with the conclusion first, supported by grouped arguments that are themselves supported by data — top-down communication for busy executives. Best for business communication, recommendation structuring, and executive summaries where the audience wants the answer first. Use it when you're presenting, not investigating.

**Metacognitive Audit** examines your own thinking process for biases, gaps, overconfidence, and unwarranted assumptions — thinking about your thinking. Best for self-assessment, decision quality review, and cognitive debiasing where the thinker is the biggest source of error. Use it when you need to check whether you're thinking well, not just whether your answer seems right.

### Strategic & Business

**SWOT Analysis** evaluates Strengths (internal, positive), Weaknesses (internal, negative), Opportunities (external, positive), and Threats (external, negative) for a strategic situation. Best for strategic planning, competitive positioning, and situational awareness where you need a structured scan of internal and external factors. Use it for a broad strategic overview.

**PESTLE** analyzes Political, Economic, Social, Technological, Legal, and Environmental factors in the macro-environment. Best for market analysis, environmental scanning, and macro-context assessment where external forces shape the strategic landscape. Use it when you need to understand the big-picture context.

**Porter's Five Forces** analyzes competitive intensity through five forces: supplier power, buyer power, competitive rivalry, threat of substitutes, and threat of new entrants. Best for industry analysis, market entry decisions, and competitive strategy where industry structure determines profitability. Use it to understand why some industries are more profitable than others.

**Stakeholder Analysis** maps who is affected by or can affect a decision, their interests, their influence, and what they need — producing a stakeholder management strategy. Best for project planning, change management, and policy design where stakeholder support determines success. Use it when people, not analysis, will determine the outcome.

**Game Theory** models strategic interactions where each player's outcome depends on all players' choices — Nash equilibrium, dominant strategies, and commitment effects. Best for competitive strategy, negotiation, auction design, and cooperation problems where others are also thinking strategically. Use it when the other players are intelligent and adaptive.

**Incentive Analysis** maps what each actor is rewarded for and what behavior the incentive structure actually produces — which often differs from what it was intended to produce. Best for organization design, policy analysis, and behavior prediction where "what gets measured gets done" explains outcomes. Use it when you suspect the incentives are producing the wrong behavior.

**Linchpin Analysis** identifies the single assumption or condition that everything else depends on — the one thing that, if wrong, causes the entire structure to collapse. Best for risk assessment, strategic planning, and identifying critical dependencies where you need to know what to protect most. Use it when you need to find the keystone assumption.

**Policy Analysis** evaluates policy options against criteria of effectiveness (will it work?), efficiency (at what cost?), equity (who benefits, who bears the cost?), and feasibility (can it be implemented?). Best for policy design, regulation analysis, and program evaluation where a systematic comparison of options is needed. Use it when you're choosing between policy instruments.

**OODA Loop** cycles through Observe (gather information), Orient (interpret and synthesize), Decide (choose action), and Act (execute) — a rapid decision-making framework developed for air combat. Best for competitive dynamics, fast-moving situations, and tactical decisions where speed matters. Use it when the situation is evolving and your decisions must evolve with it.

**Alternative Futures** develops multiple coherent, divergent futures — not predictions but plausible worlds — and uses them to test strategy robustness. Best for scenario planning, long-range strategy, and futures thinking where the test is "does our strategy work across diverse futures?" Use it when you need to plan for a range of possibilities.

**Fairness Analysis** evaluates outcomes across groups for disparate impact, equity, and procedural fairness — asking not just "is it efficient?" but "is it fair?" Best for algorithm audit, policy fairness, and distributional analysis where aggregate metrics hide group-level disparities. Use it when fairness is a binding constraint.

**Ethical Matrix** evaluates decisions through multiple ethical lenses — consequentialist (outcomes), deontological (duties and rules), and virtue ethics (character and flourishing) — recognizing that different frameworks highlight different considerations. Best for ethics analysis, moral reasoning, and values-based decisions where no single framework suffices. Use it when the decision has moral weight.

### Temporal & Historical

**Temporal Reasoning** reasons about sequences, durations, deadlines, concurrency, and temporal constraints — what must happen before what, what can happen in parallel, and what the time budget is. Best for scheduling, process analysis, and timeline construction where temporal order matters. Use it when time is the primary constraint.

**Historical Reasoning** analyzes past events to identify patterns, causes, and lessons — understanding how we got here by understanding what happened and why. Best for understanding historical patterns, learning from precedent, and tracing the genealogy of ideas or institutions. Use it when the past holds the key to understanding the present.

**Backward Chaining** starts from the desired goal and works backward to identify the necessary preconditions — what must be true for the goal to be achievable, and what must be true for those preconditions to be achievable, recursively. Best for planning, goal decomposition, and proof construction where the end is clear but the path is not. Use it when you know where you want to go but not how to get there.

**Forward Chaining** starts from known facts and applies rules to derive new conclusions — step-by-step inference from what is known to what follows. Best for rule-based reasoning, predictive reasoning, and procedural generation where you have a knowledge base of facts and rules. Use it when you have data and rules and want to see what they imply.

**Comparative Case** compares and contrasts cases systematically to identify patterns — what differs between cases that succeeded and cases that failed, what is common across cases despite surface differences. Best for cross-case analysis, benchmarking, and pattern identification where the variation across cases is informative. Use it when you have multiple cases and want to learn from their differences.

**Analogical Reasoning** maps structure from a familiar source domain to an unfamiliar target domain — understanding X by recognizing that X is like Y in important structural ways. Best for understanding novel concepts, solution transfer, and creative insight through comparison. Use it when a familiar domain can illuminate an unfamiliar one.

**Narrative Reasoning** constructs and evaluates coherent stories that explain sequences of events — causal chains wrapped in temporal order with actors, motives, and turning points. Best for sense-making, case building, and chronological explanation where a story captures the logic better than a list of factors. Use it when the explanation needs a plot.

### Specialized & Cross-Domain

**Six Thinking Hats** examines the problem through six distinct perspectives in sequence: white hat (facts, data), red hat (emotions, intuition), black hat (caution, risks), yellow hat (optimism, benefits), green hat (creativity, alternatives), and blue hat (process, meta-cognition). Best for multi-perspective analysis, group decision preparation, and balanced thinking where any single perspective would miss important dimensions. Use it when you need to see the problem from every angle systematically.

**Socratic Questioning** probes assumptions, evidence, viewpoints, implications, and the question itself through systematic questioning — clarification, probing assumptions, probing evidence, considering alternative perspectives, probing implications, and questioning the question. Best for deep understanding, assumption surfacing, and critical thinking where the goal is to think better, not just to get an answer. Use it when you need to examine the foundations of a belief.

**Mind Map** radiates outward from a central concept, associating and connecting ideas in a non-linear, visual structure that mirrors the brain's associative organization. Best for brainstorming, knowledge organization, and creative exploration where hierarchy and connection are both important. Use it to generate and organize ideas before committing to a linear structure.

**Assumption Ladder** climbs from observable data at the bottom through layers of interpretation to high-level assumptions at the top — making the inferential steps explicit so they can be inspected and contested. Best for surfacing hidden assumptions and checking inference quality where you need to distinguish what you observed from what you concluded. Use it when the gap between data and conclusion needs examination.

**Ethnographic Reasoning** understands problems through the lens of culture, context, and lived experience — immersing in the world of the people affected rather than analyzing from a distance. Best for user research, cultural analysis, and context-rich understanding where the insider perspective is different from the outsider perspective. Use it when you need to understand how things look from inside the situation.

**Hermeneutic Reasoning** interprets meaning through iterative cycles of part-to-whole understanding — each pass through the material deepens understanding by relating details to the whole and the whole to details. Best for text interpretation, meaning-making, and interpretive analysis where understanding deepens with each re-reading. Use it when meaning is constructed through interpretation, not extracted through analysis.

**Legal Reasoning** applies rules to facts, interprets statutes by canons of construction, reasons from precedent through analogical comparison, and balances competing principles. Best for legal analysis, regulatory compliance, and rule interpretation where the reasoning must follow legal conventions. Use it when the question is about what the law requires or permits.

**Spatial Reasoning** reasons about position, arrangement, distance, orientation, adjacency, containment, and movement in physical or virtual space. Best for architecture, logistics, geographic analysis, and physical design where spatial relationships are the primary constraint. Use it when where things are relative to each other is the central question.

**Counterfactual Reasoning** explores "what if" alternatives to what actually happened — if X had been different, would Y still have occurred? Best for impact evaluation, historical analysis, and learning from near-misses where you need to estimate what would have happened under different conditions. Use it when the question is about causation and the counterfactual state is the key evidence.

## Success Criteria

- The user's problem is classified into the correct reasoning domain and a base strategy is selected from the Reasoning Arsenal whose core move matches the problem's dominant characteristic.
- N=5 diverse reasoning paths are generated, each applying the base strategy's algorithm from a meaningfully different starting angle, with sufficient temperature-induced variation that no two paths are identical in their reasoning structure.
- Each path produces a complete trace following the base strategy's algorithm — with restated question, applied core move, numbered reasoning items, recorded assumptions and uncertainty, and a synthesized final answer.
- The final answers from all five paths are extracted as concise, comparable statements and grouped by equivalence; answers expressing the same conclusion in different words are correctly counted as the same vote.
- A transparent vote tally is presented showing which paths supported each distinct answer, with counts, so a reviewer can verify that the consensus answer truly has majority support.
- The consensus answer is identified as the answer with the most votes; if no answer receives more than one vote, the divergence is reported transparently rather than forcing a false consensus.
- A complete reasoning trace is written to `memory/{question_name}.md` with sections Question, Base Strategy, Meta-Strategy, all five numbered paths, Vote Tally, Consensus Answer, and Divergence Analysis if applicable.
- Assumptions, missing evidence, disconfirming signals, and confidence levels are recorded within each path's scratchpad, making the reasoning behind each vote auditable.
- The response to the user includes the file path, the base strategy used with brief justification, the consensus answer, and the vote tally summary.
- The base strategy is traceable to a specific entry in the Reasoning Arsenal with a documented core move.
- No prompt skills or session-management skills are selected as base strategies.
- The trace does not fabricate strategies — only strategies with entries in the Reasoning Arsenal are eligible for selection.
- Scale is adapted to the problem's complexity: the total trace across all five paths typically targets 5,000 to 8,000 tokens, with more for complex multi-domain problems.
- Divergent paths are analyzed — when paths reach different conclusions, the trace identifies which assumptions or evidence differences drove the divergence.
- The vote tally is presented before the consensus answer so the reader sees the evidence for consensus (or lack thereof) before the conclusion.

## Things Not to Do

- Do not force consensus when paths genuinely diverge. A 1-1-1-1-1 split is information — report it as divergence, analyze why paths differed, and present the diversity of perspectives. Forcing a "winner" when there is no majority misleads the user about the reliability of the answer.
- Do not use identical reasoning paths. If all five paths follow the same structure and reach the same answer through the same reasoning, there is no diversity and the meta-skill provides no benefit. Vary the starting angle explicitly — causal framing for one path, probabilistic for another, adversarial for a third.
- Do not skip the vote tally. The tally is the core of the self-consistency technique — it shows the user exactly how many paths supported each answer and gives them the information to judge consensus quality for themselves. Hiding the tally behind a summary is hiding the method's primary output.
- Do not apply self-consistency to problems where the answer is inherently subjective or where diversity of perspective is the goal. Self-consistency improves accuracy for problems with a correct answer; for open-ended creative tasks, forcing convergence to a majority answer may suppress valuable minority perspectives.
- Do not select a base strategy you cannot execute. The Reasoning Arsenal is your source of truth for what strategies exist and what their core moves are. If a strategy's entry doesn't give you enough to execute the algorithm, fall back to abductive reasoning.
- Do not run fewer than N=5 paths without explicit user instruction. The research shows that gains increase rapidly from 1 to 5 paths; fewer than 5 paths leave accuracy gains on the table. Only reduce N if the user explicitly requests a faster, lower-confidence result.
- Do not present the consensus as certainty. Even when 5/5 paths agree, the consensus could be wrong — the paths all share the same underlying model and the same base strategy, so systematic errors (where the strategy itself is ill-suited to the problem) can produce confident consensus on a wrong answer. Always note that consensus reflects agreement across paths, not ground-truth verification.
- Do not write the trace to a location other than `memory/{question_name}.md` at the repository root. Traces must be discoverable and auditable, and the `memory/` directory is the standard location for all Vidbyte reasoning artifacts.

## Input

**Required — invocation:** `/self-consistency-reasoning <problem description>` — Sent by the user. Optionally, `--strategy <slash-command>` to specify the base strategy explicitly.

**Required — Reasoning Arsenal:** The Reasoning Arsenal section embedded in this SKILL.md. Used to match the user's problem domain to the right base strategy and to provide the core move for execution.

**Optional — path count override:** The user may specify `--paths N` to override the default N=5 (e.g., `--paths 10` for higher confidence on high-stakes problems, or `--paths 3` for faster results).
