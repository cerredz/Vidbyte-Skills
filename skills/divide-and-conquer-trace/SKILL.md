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
The trace should disentangle the problem into three distinct phases ΓÇö decompose into independent sub-tasks, resolve each sub-task independently, then assemble solutions into the final answer, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Divide-and-Conquer Prompting useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent
Divide-and-Conquer trace is invoked when the problem is too complex to reason about monolithically — either because it has natural decomposition points, because different sub-problems require different types of expertise, or because the dependencies between sub-problems are non-trivial and must be tracked explicitly. A single-pass reasoning chain on a complex problem can blur the boundaries between sub-questions, causing the model to implicitly answer one sub-question using information that properly belongs to another, creating a solution that looks coherent but is logically unsound. By forcing strict phase separation — decompose, then resolve each piece independently, then assemble — D&C prevents cross-contamination between sub-problems and makes the dependency structure of the solution fully transparent.

A user would select this trace over a generic trace when the question has clearly separable components that benefit from independent treatment, such as multi-part analysis problems, system design tasks, or any situation where sub-answers must stand on their own before being combined. The strategy is distinguished from simpler decomposition approaches by its three-phase discipline: the decomposer must not solve, the resolver must not assemble, and the assembler must not decompose. This tripartite separation has theoretical grounding in the finding that Transformers at fixed depth have limited expressive power for problems requiring iterative computation — D&C extends this capacity by offloading sub-computations into independent reasoning contexts, each of which can use the model's full depth without interference from other sub-problems.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Divide-and-Conquer Prompting move: separate task decomposition, sub-task resolution, and solution assembly into three distinct processes, solving each independently before combining.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Divide-and-Conquer Prompting disentangles task decomposition, sub-task resolution, and solution assembly into three distinct processes. Unlike monolithic approaches that interleave these phases, D&C forces clear separation at each stage ΓÇö the decomposer does not solve, the resolver does not assemble, and the assembler does not decompose.
Theoretical analysis reveals that this strategy can extend the expressive power of fixed-depth Transformers beyond what is possible with standard prompting. Research from 2024 demonstrates that explicit phase separation prevents the model from short-circuiting the reasoning process.
It should give the output document a visible three clearly labeled phases with decomposition structure, independent sub-task solutions, and assembly logic, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "separate task decomposition, sub-task resolution, and solution assembly into three distinct processes, solving each independently before combining" and when the final answer needs demonstrable independence of sub-task solutions with explicit recombination logic.
A strong Divide-and-Conquer Prompting trace shows clean phase separation, makes sub-task independence explicit, and demonstrates that the assembly is coherent.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then decompose it into independent sub-tasks with clear interfaces between them.
2. Resolve each sub-task independently ΓÇö each solution must stand alone without depending on other sub-task solutions being correct.
3. After all sub-tasks are resolved, assemble their solutions into the final answer, handling any cross-task dependencies or contradictions discovered during assembly.
4. Record the decomposition structure, each sub-task solution, and the assembly logic in the trace, noting any sub-tasks that required sequential resolution.
5. Synthesize the completed trace into the final answer, showing how the solution follows from independent resolution and coherent assembly.

## Implementation Details
Divide-and-Conquer Prompting as a formal strategy for extending LLM reasoning capabilities was introduced by Feng et al. (2024, AAAI) in "Divide-and-Conquer Prompting: Extending the Expressive Power of Fixed-Depth Transformers." The paper provided both empirical and theoretical analysis showing that phase separation — treating decomposition, resolution, and assembly as distinct processes — enables Transformers to solve problems beyond the theoretical limits of single-pass prompting. The key theoretical insight is that a fixed-depth Transformer has bounded circuit complexity (TC⁰), meaning certain compositional problems are structurally unsolvable in a single forward pass; D&C circumvents this by breaking the computation into sub-problems that individually fall within the model's circuit depth, then combining their outputs through assembly.

Empirically, the paper demonstrated that D&C prompting outperforms standard prompting on compositional reasoning benchmarks that require multi-step synthesis across independent components. The gains are most pronounced on problems where the sub-components have complex internal structure that would be lost if they were reasoned about simultaneously — for example, multi-constraint optimization problems where each constraint interacts with the others in non-obvious ways. The three-phase architecture also produces more interpretable reasoning traces because the reviewer can verify each sub-solution independently before checking the assembly logic, rather than having to disentangle a monolithic chain.

For Vidbyte reasoning traces, D&C requires explicit labeling of the three phases (Decomposition, Resolution, Assembly) in the output, with clear interfaces between phases. The decomposition phase must identify sub-tasks that are as independent as possible — if two sub-tasks have tight coupling, they should either be merged or the dependency should be explicitly noted. During resolution, each sub-task must be solved without reference to how it will be used in assembly, to guarantee independence. During assembly, contradictions discovered between independently derived sub-solutions must be surfaced and resolved rather than papered over. The trace should include a dependency diagram or table showing which sub-solutions feed into which parts of the final answer.

The broader context includes work on compositional generalization (Lake & Baroni, 2018, 2023) which demonstrated that neural models struggle with systematically combining known primitives in novel ways. D&C addresses this by forcing the model to treat each primitive (sub-problem) independently before attempting composition. Related work on least-to-most prompting (Zhou et al., 2023) and tree-of-thoughts (Yao et al., 2023) shares the decomposition philosophy but differs in structure: least-to-most is linear (sequential sub-problems), tree-of-thoughts branches without recombination, while D&C specifically emphasizes the assembly phase where independently derived answers are integrated.

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
- Do not let the decomposer solve the sub-tasks during the decomposition phase — the separation between identifying what needs to be done and actually doing it is the strategy's defining discipline.
- Do not skip the assembly phase by simply concatenating sub-solutions — assembly must actively reconcile and integrate independent answers, addressing any contradictions or gaps that emerge when sub-solutions are combined.
- Do not decompose into sub-tasks that are trivially dependent on each other — if sub-task B cannot be solved without sub-task A's answer, they should be a single sub-task or the dependency must be explicitly modeled.
- Do not resolve sub-tasks by referencing solutions to other sub-tasks during the resolution phase — each resolution must be self-contained, because interleaving defeats the purpose of independent verification.
- Do not produce a trace that merges the three phases into an undifferentiated reasoning block — the phase labels (Decomposition, Resolution, Assembly) must be visually distinct in the output so the reviewer can audit the phase discipline.
- Do not skip documenting sub-task interfaces — which sub-solution provides which input to the assembly — because without explicit interfaces, the reviewer cannot verify that assembly used sub-solutions correctly.
- Do not treat assembly as a trivial concatenation exercise; if assembly discovers that two independently correct sub-solutions are incompatible, the trace must surface and resolve the conflict rather than picking one and discarding the other.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
