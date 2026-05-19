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

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Elastic Reasoning move: allocate reasoning into two budgeted phases — thinking (exploration) and solution (construction) — and adapt when either phase is constrained.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Elastic Reasoning explicitly separates reasoning into two phases — thinking and solution — with independently allocated budgets. This addresses the problem that standard chain-of-thought interleaves exploration and answer construction, leading to uneven balance: some answers overthink while others under-build. At test time, it prioritizes completeness of solution segments, significantly improving reliability under tight resource constraints. Research from 2025 demonstrates that a budget-constrained rollout strategy teaches the model to reason adaptively when thinking is cut short, producing higher-quality answers than uniform budget allocation.
It should give the output document a visible clear phase separation with thinking budget used, solution budget used, and adaptation points, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "allocate reasoning into two budgeted phases — thinking (exploration) and solution (construction) — and adapt when either phase is constrained" and when the final answer needs well-structured final answer that prioritizes completeness over elaboration when under budget.
A strong Elastic Reasoning trace shows the budget allocation decision, records where thinking was truncated, and delivers a complete solution even under constraints.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then estimate the problem's complexity to allocate budgets for thinking and solution phases.
2. Phase 1 — Thinking: explore hypotheses, generate analyses, and test assumptions within the allocated thinking budget, recording all exploration.
3. Mark the phase transition explicitly, noting what was covered and what remains unexplored due to budget constraints.
4. Phase 2 — Solution: construct the structured answer within the solution budget, prioritizing completeness of core conclusions over elaboration.
5. Synthesize the completed trace into the final answer, showing where budget constraints shaped the analysis and what confidence adjustments result.

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
