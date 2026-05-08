---
name: analogical-trace-large
description: >
  Use this skill when the user invokes /analogical-trace-large or asks for a large public reasoning trace using Analogical Reasoning.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Analogical Reasoning as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 500 or more numbered lines or roughly 10,000+ tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by similarity transfer instead of a generic response.
---

# Analogical Reasoning Reasoning Trace Large

## Goal
Use Analogical Reasoning to answer the user's question through similarity transfer, not through a generic checklist or interchangeable trace.
The trace should map a source case to the target case, test relevant similarities, and reject weak transfers, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make analogical reasoning useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Analogical Reasoning move: map a source case to the target case, test relevant similarities, and reject weak transfers.
Use an extended trace, usually around 500 or more numbered lines, and organize it into clear phases so the length remains usable.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Analogical Reasoning is a similarity transfer strategy that gives analysis a recognizable pattern and prevents the answer from becoming an unstructured opinion.
Its central discipline is to map a source case to the target case, test relevant similarities, and reject weak transfers, which forces the model to make the important reasoning moves visible.
This strategy is strongest when the question benefits from decomposing a hard question into inspectable reasoning steps and when the reader needs to see why the answer follows.
Compared with a generic scratchpad, analogical reasoning changes what gets noticed, which alternatives get compared, and which assumptions receive pressure.
A weak trace will merely label sections with the strategy name; a strong trace will let the strategy determine the order, granularity, and tests inside the analysis.
Use the strategy to surface disconfirming evidence, unresolved ambiguity, and decision-relevant implications instead of smoothing them away.
The final answer should feel like the compressed result of Analogical Reasoning, not like a separate response pasted after the trace.

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
