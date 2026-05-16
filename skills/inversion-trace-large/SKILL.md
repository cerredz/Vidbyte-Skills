---
name: inversion-trace-large
description: >
  Use this skill when the user invokes /inversion-trace-large or asks for a large public reasoning trace using Inversion.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Inversion as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 500 or more numbered lines or roughly 10,000+ tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by approaching problems backward by asking what would guarantee failure instead of a generic response.
---

# Inversion Reasoning Trace Large

## Goal
Use Inversion to answer the user's question through approaching problems backward by asking what would guarantee failure, not through a generic checklist or interchangeable trace.
The trace should approach problems backward by asking what would guarantee failure, then avoid those causes, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make inversion useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Inversion move: approach problems backward by asking what would guarantee failure, then avoid those causes.
Use an extended trace, usually around 500 or more numbered lines, and organize it into clear phases so the length remains usable.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Inversion is a reasoning strategy for turning a question into an auditable public trace instead of an unstructured opinion.
It should give the output document a visible sequence of decisions, tests, and intermediate conclusions, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "approach problems backward by asking what would guarantee failure, then avoid those causes" and when the final answer needs evidence, assumptions, and uncertainty kept in view.
A strong Inversion trace lets that move determine the order and granularity of the scratchpad, then compresses the result into a concise final answer.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then derive the subquestions or working items that Inversion needs to inspect.
2. Apply the core move explicitly: approach problems backward by asking what would guarantee failure, then avoid those causes.
3. For each subquestion, case, option, hypothesis, or criterion the move creates, write numbered public reasoning items that answer it before advancing.
4. Record assumptions, missing evidence, disconfirming signals, and confidence changes where they affect the analysis.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from Inversion rather than from a generic summary.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: large - aim for around 500+ numbered lines, or roughly 10,000+ tokens, when the question is broad enough to justify that depth."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, and final answer summary.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
The Scratchpad section should target around 500 or more numbered lines or roughly 10,000+ tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the large scale approximate.
