---
name: least-to-most-trace
description: >
  Use this skill when the user invokes /least-to-most-trace or asks for a default public reasoning trace using Least-to-Most Prompting.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Least-to-Most Prompting as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by progressive subproblem solving from easiest to hardest with solution transfer instead of a generic response.
---

# Least-to-Most Prompting Reasoning Trace

## Goal
Use Least-to-Most Prompting to answer the user's question through progressive subproblem solving from easiest to hardest with solution transfer, not through a generic checklist or interchangeable trace.
The trace should break the complex problem into a chain of subproblems ordered by difficulty, solve each in sequence using prior solutions as building blocks, and the final subproblem is the original question, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Least-to-Most Prompting useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Least-to-Most Prompting move: decompose the problem into subproblems ordered easiest-to-hardest, solve each in sequence where each solution enables the next, until reaching the original question.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Least-to-Most prompting breaks down a complex problem into a series of simpler subproblems and solves them in sequence, where solving each subproblem is facilitated by the answers to previously solved subproblems. This strategy is notable because it generalizes to more difficult problems than those seen in the prompts — the decomposition itself produces transfer.
Unlike curriculum learning which uses proxy problems, Least-to-Most decomposes the ACTUAL problem into its constituent parts. Research from 2023 demonstrated that this approach enables LLMs to solve compositional generalization tasks that standard chain-of-thought cannot handle.
It should give the output document a visible decomposition into ordered subproblems, each solved with transfer notes, culminating in the target solution, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "decompose the problem into subproblems ordered easiest-to-hardest, solve each in sequence where each solution enables the next, until reaching the original question" and when the final answer needs step-by-step progression where each answer explicitly builds on prior answers.
A strong Least-to-Most Prompting trace shows the full decomposition, makes transfer between steps explicit, and demonstrates that the final answer is built from simpler components.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then decompose it into subproblems ordered from easiest to hardest.
2. Solve the easiest subproblem first, providing a complete solution that will serve as a building block for subsequent problems.
3. For each subsequent subproblem, solve it using the answers from all previous subproblems as input, making the transfer explicit.
4. The final subproblem is the original question — solve it using all accumulated subproblem solutions as scaffolding.
5. Synthesize the completed trace into the final answer, showing how the solution follows from progressively building through subproblems.

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
