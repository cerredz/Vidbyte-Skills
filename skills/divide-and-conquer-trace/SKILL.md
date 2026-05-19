---
name: divide-and-conquer-trace
description: >
  Use this skill when the user invokes /divide-and-conquer-trace or asks for a default public reasoning trace using Divide-and-Conquer Prompting.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Divide-and-Conquer Prompting as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by structured three-phase decomposition, independent resolution, and assembly instead of a generic response.
---

# Divide-and-Conquer Prompting Reasoning Trace

## Goal
Use Divide-and-Conquer Prompting to answer the user's question through structured three-phase decomposition, independent resolution, and assembly, not through a generic checklist or interchangeable trace.
The trace should disentangle the problem into three distinct phases — decompose into independent sub-tasks, resolve each sub-task independently, then assemble solutions into the final answer, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Divide-and-Conquer Prompting useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Divide-and-Conquer Prompting move: separate task decomposition, sub-task resolution, and solution assembly into three distinct processes, solving each independently before combining.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Divide-and-Conquer Prompting disentangles task decomposition, sub-task resolution, and solution assembly into three distinct processes. Unlike monolithic approaches that interleave these phases, D&C forces clear separation at each stage — the decomposer does not solve, the resolver does not assemble, and the assembler does not decompose.
Theoretical analysis reveals that this strategy can extend the expressive power of fixed-depth Transformers beyond what is possible with standard prompting. Research from 2024 demonstrates that explicit phase separation prevents the model from short-circuiting the reasoning process.
It should give the output document a visible three clearly labeled phases with decomposition structure, independent sub-task solutions, and assembly logic, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "separate task decomposition, sub-task resolution, and solution assembly into three distinct processes, solving each independently before combining" and when the final answer needs demonstrable independence of sub-task solutions with explicit recombination logic.
A strong Divide-and-Conquer Prompting trace shows clean phase separation, makes sub-task independence explicit, and demonstrates that the assembly is coherent.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then decompose it into independent sub-tasks with clear interfaces between them.
2. Resolve each sub-task independently — each solution must stand alone without depending on other sub-task solutions being correct.
3. After all sub-tasks are resolved, assemble their solutions into the final answer, handling any cross-task dependencies or contradictions discovered during assembly.
4. Record the decomposition structure, each sub-task solution, and the assembly logic in the trace, noting any sub-tasks that required sequential resolution.
5. Synthesize the completed trace into the final answer, showing how the solution follows from independent resolution and coherent assembly.

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
