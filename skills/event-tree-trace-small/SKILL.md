---
name: event-tree-trace-small
description: >
  Use this skill when the user invokes /event-tree-trace-small or asks for a small public reasoning trace using Event Tree Analysis.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Event Tree Analysis as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 25 numbered lines or roughly 500 to 900 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by risk analysis instead of a generic response.
---

# Event Tree Analysis Reasoning Trace Small

## Goal
Use Event Tree Analysis to answer the user's question through risk analysis, not through a generic checklist or interchangeable trace.
The trace should start from an initiating event and branch through possible outcomes and controls, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on options, probabilities, tradeoffs, risks, sensitivities, and consequences, because those artifacts make event tree analysis useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Event Tree Analysis move: start from an initiating event and branch through possible outcomes and controls.
Use a short trace, usually around 25 numbered lines, and prioritize the highest-value reasoning moves.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Event Tree Analysis is a reasoning strategy for turning a question into an auditable public trace instead of an unstructured opinion.
It should give the output document a visible sequence of decisions, tests, and intermediate conclusions, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "start from an initiating event and branch through possible outcomes and controls" and when the final answer needs evidence, assumptions, and uncertainty kept in view.
A strong Event Tree Analysis trace lets that move determine the order and granularity of the scratchpad, then compresses the result into a concise final answer.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then derive the subquestions or working items that Event Tree Analysis needs to inspect.
2. Apply the core move explicitly: start from an initiating event and branch through possible outcomes and controls.
3. For each subquestion, case, option, hypothesis, or criterion the move creates, write numbered public reasoning items that answer it before advancing.
4. Record assumptions, missing evidence, disconfirming signals, and confidence changes where they affect the analysis.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from Event Tree Analysis rather than from a generic summary.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: small - aim for around 25 numbered lines, or roughly 500 to 900 tokens, while keeping the reasoning compact and readable."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, and final answer summary.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
The Scratchpad section should target around 25 numbered lines or roughly 500 to 900 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the small scale approximate.
