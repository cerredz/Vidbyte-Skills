---
name: elastic-reasoning-trace
description: >
  Use this skill when the user invokes /elastic-reasoning-trace or asks for a default public reasoning trace using Elastic Reasoning.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Elastic Reasoning as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by two-phase budgeted reasoning with thinking and solution phases instead of a generic response.
---

# Elastic Reasoning Trace

## Goal
Use Elastic Reasoning to answer the user's question through two-phase budgeted reasoning with thinking and solution phases, not through a generic checklist or interchangeable trace.
The trace should separate reasoning into an exploration phase and a construction phase with independent budgets, prioritize solution completeness under resource constraints, and adapt when thinking is cut short, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make elastic reasoning useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent
Elastic Reasoning trace is invoked when the user operates under explicit resource constraints — whether token budgets, time limits, or attention spans — and needs the reasoning process to adaptively prioritize what matters most rather than treating all reasoning as equally valuable. Standard chain-of-thought allocates reasoning effort uniformly across steps, which means it may overthink simple sub-problems (wasting budget on trivial verification) while under-thinking complex ones (running out of budget before reaching the core difficulty). Elastic Reasoning addresses this by splitting reasoning into two independently budgeted phases — thinking (exploration) and solution (construction) — and training the model to produce useful partial results when either phase is cut short.

A user would select this trace over a generic trace when the task has a known budget constraint that makes uniform-depth reasoning impractical — for example, when generating traces for a latency-sensitive application, when working within token limits for cost control, or when the user explicitly requests a "budget-conscious" analysis. The strategy's value proposition is not that it produces better answers than unbounded reasoning, but that it produces better answers than uniform-budget reasoning under the same constraint, because it can strategically conserve tokens on easy sub-problems and redirect them to hard ones. Research shows that when thinking is cut short, budget-constrained rollout strategies teach the model to produce more complete solutions than simply truncating a standard chain-of-thought at the same token count.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Elastic Reasoning move: allocate reasoning into two budgeted phases ΓÇö thinking (exploration) and solution (construction) ΓÇö and adapt when either phase is constrained.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Elastic Reasoning explicitly separates reasoning into two phases ΓÇö thinking and solution ΓÇö with independently allocated budgets. This addresses the problem that standard chain-of-thought interleaves exploration and answer construction, leading to uneven balance: some answers overthink while others under-build. At test time, it prioritizes completeness of solution segments, significantly improving reliability under tight resource constraints. Research from 2025 demonstrates that a budget-constrained rollout strategy teaches the model to reason adaptively when thinking is cut short, producing higher-quality answers than uniform budget allocation.
It should give the output document a visible clear phase separation with thinking budget used, solution budget used, and adaptation points, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "allocate reasoning into two budgeted phases ΓÇö thinking (exploration) and solution (construction) ΓÇö and adapt when either phase is constrained" and when the final answer needs well-structured final answer that prioritizes completeness over elaboration when under budget.
A strong Elastic Reasoning trace shows the budget allocation decision, records where thinking was truncated, and delivers a complete solution even under constraints.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then estimate the problem's complexity to allocate budgets for thinking and solution phases.
2. Phase 1 ΓÇö Thinking: explore hypotheses, generate analyses, and test assumptions within the allocated thinking budget, recording all exploration.
3. Mark the phase transition explicitly, noting what was covered and what remains unexplored due to budget constraints.
4. Phase 2 ΓÇö Solution: construct the structured answer within the solution budget, prioritizing completeness of core conclusions over elaboration.
5. Synthesize the completed trace into the final answer, showing where budget constraints shaped the analysis and what confidence adjustments result.

## Implementation Details
Elastic Reasoning was introduced by Anonymous Authors (2025, under review at the time of publication) in "Elastic Reasoning: Budget-Constrained Rollout Strategies for Adaptive LLM Reasoning." The paper formalizes reasoning as a two-phase process with independently allocated budgets: a thinking phase where the model explores hypotheses, generates analyses, and tests assumptions, and a solution phase where it constructs a structured answer from the explored material. The key empirical finding is that when both phases share a total budget, allocating budget unevenly based on problem complexity produces higher-quality answers than uniform allocation — specifically, problems that need more exploration get more thinking budget, while simpler problems shift budget toward solution construction.

The technical mechanism involves a budget-constrained rollout strategy: the model is trained to recognize when its thinking budget is exhausted and to transition to solution mode even if exploration is incomplete, prioritizing completeness over thoroughness. This contrasts with standard approaches where budget exhaustion simply truncates the output, potentially leaving the answer mid-sentence or missing critical components. The model learns to produce a minimum viable solution that covers all necessary conclusions even if individual conclusions are less elaborated than they would be under unconstrained conditions. The paper demonstrated that this adaptive budgeting produces measurably better trade-offs between reasoning depth and answer completeness compared to uniform allocation strategies.

For Vidbyte reasoning traces, Elastic Reasoning requires explicit budget declarations at the start of the trace — how many tokens or steps are allocated to thinking versus solution — and the trace must visibly mark the phase transition where the model shifts from exploration to construction. The thinking phase should record what was explored and, critically, what was not explored due to budget constraints, so the reviewer understands the scope limitations. The solution phase must demonstrate completeness under constraint: every sub-question identified in thinking should receive at least a brief answer, even if the answer is qualified with uncertainty due to limited exploration. The trace should end with a confidence adjustment section acknowledging where budget limitations increase uncertainty.

The broader context includes work on adaptive computation time (Graves, 2016) and conditional computation in neural networks, which similarly allocate computational resources non-uniformly based on input difficulty. Elastic Reasoning applies this principle to LLM reasoning by making budget allocation an explicit, controllable parameter rather than an emergent property of the generation process.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, and final answer summary.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.

## Things Not to Do
- Do not allocate equal budgets to thinking and solution by default — the split should reflect the problem's characteristics, with exploration-heavy problems getting more thinking budget and straightforward problems shifting budget toward solution.
- Do not let the thinking phase run unbounded and then cram the solution into whatever budget remains — the phase transition must be a deliberate decision, not an emergency triggered by exhaustion.
- Do not present an incomplete solution as definitive — if budget constraints prevented full exploration of a sub-question, the answer to that sub-question must be qualified with explicit uncertainty indicators.
- Do not skip the budget declaration at the start of the trace — the reviewer must know what the budget was to evaluate whether the model used it effectively, not just to see the final answer.
- Do not pad the thinking phase with low-value exploration to consume budget — every thinking item should be a hypothesis, analysis, or test that genuinely advances understanding, not filler.
- Do not treat "adapting when thinking is cut short" as meaning the model should suddenly become more verbose — adaptation means prioritizing completeness of coverage over depth, not adding fluff.
- Do not leave the phase transition unmarked — the trace must have a clear visual break (subsection header, separator, or explicit transition statement) between thinking and solution phases.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
