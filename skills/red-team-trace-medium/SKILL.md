---
name: red-team-trace-medium
description: >
  Use this skill when the user invokes /red-team-trace-medium or asks for a medium public reasoning trace using Red Team Reasoning.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Red Team Reasoning as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by adversarial critique instead of a generic response.
---

# Red Team Reasoning Reasoning Trace Medium

## Goal
Use Red Team Reasoning to answer the user's question through adversarial critique, not through a generic checklist or interchangeable trace.
The trace should simulate a capable opponent or critic to stress-test plans, claims, and defenses, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make red team reasoning useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Red Team Reasoning move: simulate a capable opponent or critic to stress-test plans, claims, and defenses.
Use a medium trace, usually around 100 numbered lines, and give each major reasoning step room to be inspected.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Red Team Reasoning is a adversarial critique strategy that gives analysis a recognizable pattern and prevents the answer from becoming an unstructured opinion.
Its central discipline is to simulate a capable opponent or critic to stress-test plans, claims, and defenses, which forces the model to make the important reasoning moves visible.
This strategy is strongest when the question benefits from decomposing a hard question into inspectable reasoning steps and when the reader needs to see why the answer follows.
Compared with a generic scratchpad, red team reasoning changes what gets noticed, which alternatives get compared, and which assumptions receive pressure.
A weak trace will merely label sections with the strategy name; a strong trace will let the strategy determine the order, granularity, and tests inside the analysis.
Use the strategy to surface disconfirming evidence, unresolved ambiguity, and decision-relevant implications instead of smoothing them away.
The final answer should feel like the compressed result of Red Team Reasoning, not like a separate response pasted after the trace.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: medium - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while preserving enough detail for review."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, and final answer summary.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the medium scale approximate.
