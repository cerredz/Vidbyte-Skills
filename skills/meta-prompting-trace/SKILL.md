---
name: meta-prompting-trace
description: >
  Use this skill when the user invokes /meta-prompting-trace or asks for a default public reasoning trace using Meta-Prompting.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Meta-Prompting as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by single-model conductor orchestrating a panel of expert perspectives instead of a generic response.
---

# Meta-Prompting Reasoning Trace

## Goal
Use Meta-Prompting to answer the user's question through single-model conductor orchestrating a panel of expert perspectives, not through a generic checklist or interchangeable trace.
The trace should decompose the problem into subtasks, assign each to a tailored expert persona with specific instructions, collect independent expert contributions, and synthesize them as the conductor, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make meta-prompting useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Meta-Prompting move: act as a conductor that deconstructs the problem into subtasks, assigns each to a distinct expert persona within the same context, and synthesizes their contributions.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Meta-Prompting transforms a single language model into a multi-faceted conductor that manages and integrates multiple independent expert queries within the same context window. High-level instructions guide the model to deconstruct complex tasks into smaller subtasks, which are then handled by distinct expert instances of the same model each operating under specific tailored instructions. This is architecturally distinct from multi-agent systems because it is one model playing all roles rather than multiple separate deployments — substantially reducing computational overhead while still gaining the benefit of specialized perspectives. Research from 2024 demonstrates that meta-prompting achieves performance competitive with multi-agent systems while being significantly more cost-effective.
It should give the output document a visible conductor's task decomposition, each expert's contribution under their persona, and the conductor's synthesis, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "act as a conductor that deconstructs the problem into subtasks, assigns each to a distinct expert persona within the same context, and synthesizes their contributions" and when the final answer needs multi-perspective analysis with explicit reconciliation of expert disagreements.
A strong Meta-Prompting trace shows distinct expert voices, makes the conductor's synthesis logic explicit, and surfaces where experts agree or disagree.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then identify which specialized perspectives the problem requires.
2. Define 3-5 expert personas, each with a specific domain focus and tailored reasoning instructions relevant to the problem's sub-questions.
3. As conductor, assign each sub-question to the appropriate expert, collecting each expert's independent analysis within the structured trace.
4. Synthesize expert contributions as the conductor: reconcile conflicts, weight contributions by relevance, and build the integrated answer.
5. Record all expert contributions and the conductor's synthesis, showing how the final answer integrates perspectives rather than favoring a single view.

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
