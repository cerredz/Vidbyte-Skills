---
name: paradigm-routing-reasoning
description: >
  Use when the user invokes /paradigm-routing-reasoning or asks to optimize how a problem gets answered.
  This meta-skill performs two-stage routing: first it routes to the best inference-time paradigm
  (Direct, CoT, ReAct, Plan-Execute, Reflection, ReCode), then within that paradigm it selects and
  executes the best-fit Vidbyte strategy. Embeds the Select-then-Solve finding that no single paradigm
  dominates and that routing before reasoning recovers 37% of the oracle gap.
---

# Paradigm Routing Reasoning

## Goal

This meta-skill optimizes inference-time reasoning by routing every problem through two sequential decisions before a single token of reasoning is produced. In the first stage it routes to the best-fitting inference paradigm from a six-paradigm taxonomy — Direct, Chain-of-Thought, ReAct, Plan-Execute, Reflection, and ReCode — using lightweight embedding-based selection informed by the Select-then-Solve framework. In the second stage, operating within the chosen paradigm, it classifies the problem across 11 reasoning domains and selects the single best-fit Vidbyte trace strategy from the full catalog.

This two-stage architecture replaces the common practice of defaulting to a single paradigm for all problems. Empirical evidence across ~18,000 runs on 4 frontier LLMs and 10 benchmarks shows that no paradigm dominates universally — ReAct gains 44 percentage points on GAIA while CoT loses 15 points on HumanEval — and that paradigm routing before reasoning recovers 37% of the gap between the best fixed-paradigm strategy and the oracle upper bound. The meta-skill executes both routing decisions audibly, writes a durable reasoning trace recording both choices, and produces a final answer whose structure matches the problem rather than the system default.

## Intent

Paradigm choice is an optimizable variable, not a preference. Most systems either hardcode a single reasoning paradigm or let the model choose implicitly, leaving significant accuracy on the table. The Select-then-Solve framework demonstrates that routing before reasoning lifts accuracy from 47.6% (no routing) to 53.1% (routed), compared to 50.3% for the single best fixed paradigm and 55.4% for the oracle upper bound — meaning routing recovers 37% of the gap between naive usage and optimal paradigm selection. This meta-skill embeds that finding directly into Vidbyte's architecture by making paradigm selection an explicit, justified step before any domain-level reasoning begins.

The second routing stage addresses a different optimization surface. Even within the best paradigm, different problems demand different reasoning architectures — a causal question needs a causal strategy, a decision needs a decision strategy, a creative problem needs a creative strategy. By nesting strategy selection inside paradigm selection, the meta-skill ensures the final reasoning trace is structured by two aligned decisions rather than by one default chain. The goal is not to describe paradigms or list strategies but to route, select, execute, and produce an auditable artifact where every choice is visible and every structure fits the problem it was built for.

## Background — What Is Paradigm Routing Reasoning

Paradigm Routing Reasoning operationalizes the Select-then-Solve framework introduced by Zhou et al (2026), which treats inference-time paradigm selection as a routing problem. Before answering a question, a lightweight embedding-based router evaluates the problem and selects from six candidate reasoning paradigms: Direct (single-pass generation, no intermediate reasoning), Chain-of-Thought (stepwise natural language reasoning), ReAct (interleaved reasoning and tool-use), Plan-Execute (explicit planning phase followed by execution), Reflection (generate, self-critique, and regenerate), and ReCode (sandboxed code-based reasoning with execution feedback). The router was trained offline on ~18,000 runs across 4 frontier LLMs (including GPT-5 and Claude variants) and 10 benchmarks spanning reasoning, coding, tool-use, and knowledge tasks.

The central empirical finding is that no single paradigm dominates the benchmark suite. ReAct outperforms alternatives on GAIA by 44 percentage points but underperforms on HumanEval by 15 points relative to CoT. Direct outperforms all reasoning-heavy paradigms on knowledge retrieval tasks. Paradigm routing improves aggregate accuracy from 47.6% to 53.1%, recovering 37% of the achievable improvement between the best fixed-paradigm baseline (50.3%) and the oracle upper bound (55.4%). Importantly, zero-shot self-routing — where the model itself chooses the paradigm — only works reliably for GPT-5, meaning that for most models explicit routing via a trained selector is necessary to capture the gains. This meta-skill adapts the Select-then-Solve router into a Vidbyte-native two-stage architecture, adding a second routing layer that selects the reasoning trace strategy within the chosen paradigm.

## Algorithm

### Step 1 — Detect Invocation

Check if the user's prompt starts with `/paradigm-routing-reasoning` (case-insensitive).

- If no: produce a normal response. The skill is silent.
- If yes with no text after: respond with usage guidance.
- If yes with text: proceed to Step 2.

### Step 2 — Clarify the Problem

Read the user's problem and determine whether it is sufficiently specified to route and execute. If the problem is genuinely ambiguous or could reasonably be interpreted in multiple incompatible ways, ask exactly one clarifying question before routing. Do not guess the problem type — a wrong classification cascades through both routing stages.

If the problem is well-specified, restate it with its constraints, domain, and evidence standard, then proceed.

### Step 3 — Web Search for Skills if Not Installed

Before selecting a Vidbyte trace strategy, verify the skill is available. If the skill catalog embedded below is not accessible or the target skill appears to be missing from the current installation, perform a web search to locate the latest Vidbyte skills repository or equivalent skill source. Do not proceed with an unavailable skill — fall back to the closest available strategy and note the substitution.

### Step 4 — Paradigm Routing Analysis

Evaluate the clarified problem against all six paradigms using the routing criteria established by Select-then-Solve. For each paradigm, assess:

- **Direct**: Is the answer known with high confidence and requires no intermediate reasoning? Does the problem involve factual retrieval or simple transformation?
- **Chain-of-Thought (CoT)**: Does the problem require multi-step logical or mathematical reasoning where intermediate steps improve correctness? Is the reasoning path linear and deterministic?
- **ReAct**: Does the problem require external information, tool calls, or environment interaction? Does reasoning and action need to interleave?
- **Plan-Execute**: Does the problem benefit from explicit decomposition into a plan before execution? Is there a complex multi-phase structure?
- **Reflection**: Does the problem have a verifiable solution where self-critique and revision would improve quality? Can the output be checked against a clear standard?
- **ReCode**: Does the problem involve computation, symbolic manipulation, or code execution where sandboxing the reasoning in a code environment would improve reliability?

Score each paradigm on suitability (not just presence/absence). Record the two strongest candidates and the specific features of the problem that drove the assessment.

### Step 5 — Select Paradigm with Justification

Select the single best paradigm. Write a brief justification that names:
1. The dominant characteristic of the problem that drove the selection
2. Why the chosen paradigm's core mechanism addresses that characteristic better than the runner-up
3. Any caution about what the paradigm is known to underperform on, if that applies to this problem

### Step 6 — Within Paradigm, Classify and Select Vidbyte Strategy

Inside the chosen paradigm, classify the problem into one of 11 reasoning domains (see Reasoning Arsenal below) and select the best-fit Vidbyte trace strategy from the catalog. The selected strategy must be groundable by the chosen paradigm — for example, a strategy requiring tool interaction must not be selected under the Direct paradigm.

Record the domain classification and the strategy selection with its slash command. If multiple strategies could fit, name the runner-up and the tradeoff that drove the primary selection.

### Step 7 — Execute

Apply the selected strategy's algorithm within the chosen paradigm's interaction pattern. For example, if the router selected CoT and the strategy selected is Causal Reasoning, produce a stepwise chain-of-thought structured by the causal reasoning algorithm. If the router selected ReAct and the strategy is Decision Tree, interleave reasoning about the decision tree with any tool calls needed for evidence.

Follow the strategy's standard execution protocol: restate the question, apply the core move, produce numbered reasoning items, record assumptions and uncertainty, and synthesize a final answer.

### Step 8 — Write Trace with Both Routing Decisions

Derive `{question_name}` from the user's question by lowercasing, replacing non-alphanumeric runs with hyphens, and trimming extra hyphens. Write the reasoning trace to `memory/{question_name}.md` with these sections:

```
Question:        (restated question with constraints)
Paradigm:        (selected paradigm with justification)
Strategy:        (selected Vidbyte strategy with slash command and justification)
Scale:           (default — aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens)

Scratchpad:
[Numbered reasoning items structured by both the paradigm's interaction pattern
 and the strategy's algorithm. Every numbered item contributes a question,
 observation, test, comparison, inference, or synthesis.]

Synthesis:
[Compressed summary connecting the routing decisions to the reasoning and the conclusion.]

Final Answer:
[The conclusion with any important remaining uncertainty.]
```

Respond to the user with the file path, the paradigm and strategy selected with brief justifications, and a summary of the final answer.

## Reasoning Arsenal

### Causal / Diagnostic
Problems that ask why something happened, what caused an outcome, or where a failure originated. Causal reasoning strategies decompose chains of cause and effect, distinguish root causes from symptoms, and test whether a given factor is necessary, sufficient, or merely correlated. Key strategies include Five Whys for drilling through symptom layers, Root Cause Analysis for mapping multi-factor causal trees, Fishbone for categorizing potential causes into branches, Fault Tree for Boolean event analysis, and Causal Reasoning for constructing formal cause-effect models with counterfactuals. For problems where correlation is mistaken for causation, Correlation vs Causation provides the diagnostic separation.

### Decision / Evaluation
Problems that require choosing between options, allocating resources, or trading off competing criteria under uncertainty. Decision strategies structure the option space, weight criteria, model uncertainty, and surface the rationale behind a choice so it can be inspected and challenged. Key strategies include Decision Tree for sequential choices under uncertainty, Cost-Benefit Analysis for quantified comparison, Expected Value for probabilistic payoffs, Tradeoff Matrix for multi-criteria scoring, Satisficing for bounded-rationality decisions, Regret Minimization for irreversible high-stakes choices, and Utility Analysis for modeling risk preferences.

### Creative / Generative
Problems that demand novel solutions, reframed problem definitions, or breaking out of conventional solution spaces. Creative strategies destabilize fixed assumptions, introduce unexpected associations, and systematically explore design space. Key strategies include First Principles for foundational reconstruction, Lateral Thinking for approaching from unexpected angles, Reframing for changing the problem statement itself, Constraint Removal for discovering hidden assumptions, SCAMPER for seven creative operations, TRIZ for contradiction resolution, and Biomimicry for nature-inspired design.

### Predictive / Forecasting
Problems that ask what will happen, how likely an outcome is, or what range of futures to prepare for. Forecasting strategies quantify uncertainty, propagate probability, and ground predictions in reference classes rather than optimistic inside-view estimates. Key strategies include Bayesian Reasoning for evidence-based belief updating, Probabilistic Reasoning for structured uncertainty propagation, Reference Class Forecasting for using historical baselines, Scenario Planning for multi-future preparation, Sensitivity Analysis for identifying critical assumptions, and Horizon Scanning for weak signal detection.

### Understanding / Explaining
Problems that ask how a system works, why a mechanism operates as it does, or what conceptual model best captures a phenomenon. Understanding strategies build explanatory models, connect parts to wholes, and clarify mechanism rather than just surface description. Key strategies include Systems Thinking for mapping interconnections and feedback loops, Mental Simulation for running qualitative models forward, Analogical Reasoning for transferring structure from familiar to unfamiliar domains, First Principles for decomposing to fundamentals, and Concept Mapping for visualizing knowledge relationships.

### Adversarial / Critical
Problems that require stress-testing an idea, finding weaknesses in a plan, or constructing the strongest possible case against a position. Adversarial strategies simulate opposition, surface hidden vulnerabilities, and test conviction strength before commitment. Key strategies include Red Team for full adversarial simulation, Devil's Advocacy for arguing the strongest counter-case, Steelman for constructing the best opposing argument, Premortem for imagining failure and working backward, and Analysis of Competing Hypotheses for evaluating multiple explanations against evidence.

### Systems / Complexity
Problems involving interconnected components, feedback loops, emergent behavior, and non-linear dynamics where local changes can produce distant effects. Systems strategies map structure, identify leverage points, and trace consequences through multiple orders of effect. Key strategies include Systems Thinking for holistic interconnections, Causal Loop for feedback diagramming, Iceberg Model for drilling from events to mental models, Leverage Points for identifying highest-impact interventions, and Nth-Order Effects for tracing consequences beyond the immediately visible.

### Strategic / Planning
Problems about competitive positioning, long-term direction, resource allocation across initiatives, or navigating complex stakeholder environments. Strategic strategies evaluate the external landscape, internal capabilities, and the moves available to each actor. Key strategies include SWOT for capability-environment alignment, PESTLE for macro-environmental scanning, Porter's Five Forces for industry structure analysis, Game Theory for interdependent strategic choice, Stakeholder Analysis for influence mapping, and Scenario Planning for futures-ready strategy.

### Analytic / Evidence
Problems that demand rigorous evaluation of data, testing of claims against evidence, or formal decomposition into logically exhaustive components. Analytic strategies structure inquiry, prevent confirmation bias, and make the evidence-to-conclusion chain inspectable. Key strategies include Scientific Method for hypothesis-driven investigation, Hypothesis Testing for formal empirical evaluation, MECE Decomposition for mutually exclusive and collectively exhaustive breakdowns, Evidence Triangulation for cross-source validation, and Metacognitive Audit for examining the reasoning process itself for bias.

### Ethical / Values
Problems involving moral judgment, fairness across groups, competing value systems, or decisions where the right answer depends on which normative framework is applied. Ethical strategies surface the values at stake, apply multiple ethical lenses, and make tradeoffs explicit rather than implicit. Key strategies include Ethical Matrix for multi-framework evaluation, Values Tradeoff for competing-principle decisions, Fairness Analysis for distributional impact assessment, and Dialectical Reasoning for integrating opposing value perspectives into a synthesis.

### Practical / Constraint
Problems framed by limited resources, fixed constraints, or optimization under bounds where the question is less about what is ideal and more about what is achievable. Practical strategies identify the binding constraint, allocate scarce resources, and find the best solution that respects all limits. Key strategies include Bottleneck Analysis for finding the limiting factor, Constraint Satisfaction for enumerating valid configurations, Satisficing for meeting thresholds without optimizing, Theory of Constraints for systematic throughput improvement, and Opportunity Cost for understanding what each choice foregoes.

## Success Criteria

- Invocation is detected correctly — the skill activates only for `/paradigm-routing-reasoning` and is silent otherwise.
- The problem is clarified before any routing decision is made; ambiguous problems receive exactly one clarifying question.
- All six paradigms are tested against the problem's characteristics, with explicit suitability scores and recorded reasoning for each assessment.
- The paradigm selection is justified with a specific, problem-grounded rationale that names the dominant characteristic, why the chosen paradigm addresses it, and any known limitation to watch.
- The domain classification follows Vidbyte's 11-domain taxonomy and is traceable to the problem's actual characteristics rather than keyword matching.
- The Vidbyte strategy is selected from the full catalog with its slash command, and the selection is justified by matching the problem's dominant characteristic against the strategy's core move.
- The strategy is actually executed within the paradigm's interaction pattern — the trace contains numbered reasoning items, not a description of the strategy.
- A durable reasoning trace is written to `memory/{question_name}.md` with sections Question, Paradigm, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
- Both routing decisions — paradigm and strategy — are recorded in the trace with their justifications.
- The scratchpad contains approximately 100 numbered lines or roughly 2,000 to 3,500 tokens, adapted to problem complexity.
- Assumptions, missing evidence, disconfirming signals, and uncertainty are recorded in the trace.
- The response to the user includes the file path, the paradigm and strategy selected with justifications, and a summary of the final answer.
- No strategy is executed that conflicts with the chosen paradigm's capabilities (e.g., no ReAct-required strategy under Direct).
- Runner-up paradigm and runner-up strategy are optionally noted when the decision was close.
- The trace is auditable — a reviewer can reconstruct every routing and reasoning decision from the artifact.

## Things Not to Do

- Do not skip paradigm routing and default to a single paradigm. The entire point of this meta-skill is that paradigm selection is an optimizable first step.
- Do not route a problem requiring multi-step reasoning to the Direct paradigm. Direct is for problems where the answer is known with high confidence and requires no intermediate reasoning.
- Do not route a knowledge-retrieval or simple transformation problem to ReAct or Plan-Execute. Heavyweight paradigms impose unnecessary overhead on simple problems.
- Do not route without recording justification. Every paradigm selection must name a problem characteristic that drove the decision — "because it feels right" is not a justification.
- Do not select a Vidbyte strategy that requires tool-use, environment interaction, or code execution unless the chosen paradigm supports those capabilities.
- Do not execute a strategy before verifying it is available in the skill catalog. If missing, search for it or fall back with an explicit substitution note.
- Do not produce a trace where the paradigm and strategy appear interchangeable. The paradigm shapes how reasoning happens (stepwise, interleaved, reflective); the strategy shapes what is reasoned about (causal chains, decision criteria, creative alternatives).
- Do not skip writing the trace to disk. The artifact at `memory/{question_name}.md` is the durable output, and it must contain both routing decisions.

## Input

**Required — Invocation:** `/paradigm-routing-reasoning <problem description>` — The user's problem or question. The more precisely the problem's domain, constraints, and desired output are described, the more accurate both routing stages will be and the higher the quality of the resulting reasoning trace.

**Implicit — Paradigm taxonomy:** The six-paradigm Select-then-Solve taxonomy (Direct, CoT, ReAct, Plan-Execute, Reflection, ReCode) with routing criteria from Zhou et al (2026). Used to evaluate the problem against all paradigms in Step 4.

**Implicit — Vidbyte strategy catalog:** The full set of Vidbyte reasoning trace strategies organized across 11 domains. Used to select and execute the best-fit strategy in Step 6.
