---
name: codeact-trace
description: >
  Use this skill when the user invokes /codeact-trace or asks for a default public reasoning trace using CodeAct.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses CodeAct as the actual structure of the analysis.
  The strategy uses executable Python code to consolidate reasoning actions into a unified action space. Instead of expressing actions
  as JSON or structured text, CodeAct leverages code's inherent control and data flow — storing intermediate results as variables for reuse,
  composing multiple operations, and using automated feedback (error messages) for self-debugging. This reaches up to 20% higher success
  rate over text/JSON baselines by unlocking LLMs' potential to tackle complex tasks using their pre-trained knowledge of programming.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by executable reasoning code with self-debugging instead of text-only reasoning.
---

# CodeAct Reasoning Trace

## Goal
Use CodeAct to answer the user's question through executable code that expresses reasoning as a unified action space, not through text-only reasoning or structured JSON.
The trace should express reasoning steps as executable Python code, use automated feedback for self-debugging, and consolidate actions into a unified code representation, so the visible reasoning shows the code, its execution, and how it drove the conclusion.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on the code blocks, execution results, and self-debugging cycles, because those artifacts make codeact useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming where code-based reasoning reaches its limits, where errors reveal hidden assumptions, and where text reasoning fills gaps code cannot express.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the CodeAct move: express reasoning steps as executable Python code, use automated feedback for self-debugging, and consolidate actions into a unified code space.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
CodeAct is a reasoning strategy that uses executable Python code to consolidate LLM agents' actions into a unified action space.
Instead of expressing actions as JSON or structured text, CodeAct leverages code's inherent control and data flow — storing intermediate results as variables for reuse, composing multiple tools to perform complex logical operations, and using automated feedback (e.g., error messages) to improve task-solving by self-debugging generated code.
The key insight is that code inherently supports control and data flow, allowing for the storage of intermediate results as variables for reuse and the composition of multiple tools to perform complex logical operations — unlocking LLMs' potential to tackle complex tasks by leveraging pre-trained knowledge of programming.
Research shows this reaches up to 20% higher success rate over text/JSON baselines, and also allows the use of readily available Python packages for an expanded action space instead of hand-crafted task-specific tools.
It should give the output document visible code blocks, their execution results, and the self-debugging corrections, so the reader can see how the answer was reached through executable reasoning rather than text-only chains of thought.
Use it when the problem benefits from the core move "express reasoning steps as executable Python code, use automated feedback for self-debugging, and consolidate actions into a unified code space" and when the final answer needs the precision, composability, and verifiability that code provides.
A strong CodeAct trace shows code that directly advances the reasoning, honest recording of errors and debugging, and clear connections between code output and final conclusions.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then identify which parts of the problem can be expressed as code (computations, logical operations, data transformations, simulations).
2. For each reasoning component, write executable Python code that encodes the reasoning logic, stores intermediate results as variables, and produces testable outputs.
3. For each code block, simulate execution and record the expected output. If the code would produce errors, record the error, self-debug, and show the corrected version.
4. Use code's control flow (loops, conditionals, functions) to structure the reasoning where it adds precision — not all reasoning must be code, but code should carry the parts where it adds value.
5. After all code components execute, synthesize the results into the final answer, explicitly connecting code outputs to conclusions.
6. Record assumptions embedded in the code (e.g., input assumptions, edge case handling) and note where code-based reasoning reaches limits that require text-based reasoning.
7. Synthesize the completed trace into the final answer, showing how the conclusion follows from the code outputs rather than from pure text reasoning.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should interleave code blocks (in Markdown code fences with language python) with reasoning text. Each code block should be followed by its execution result and any self-debugging corrections.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, and note any code components that were critical to the conclusion.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, interleave Python code blocks with reasoning text, execution results, and self-debugging corrections. Include a Code Summary subsection at the end of Scratchpad that catalogs which code components drove which conclusions.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
