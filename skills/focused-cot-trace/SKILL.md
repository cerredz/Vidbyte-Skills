---
name: focused-cot-trace
description: >
  Use this skill when the user invokes /focused-cot-trace or asks for a default public reasoning trace using Focused Chain-of-Thought.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Focused Chain-of-Thought as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by organize essential information first, then reason exclusively over the structured context instead of a generic response.
---

# Focused Chain-of-Thought Reasoning Trace

## Goal
Use Focused Chain-of-Thought to answer the user's question through organize essential information first, then reason exclusively over the structured context, not through a generic checklist or interchangeable trace.
The trace should extract the key facts, constraints, and principles from the query into a structured context block, then reason step-by-step exclusively from that context, reducing token waste on irrelevant detail, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Focused Chain-of-Thought useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Focused Chain-of-Thought move: extract and structure the essential information from the query into a concise context block, then reason exclusively over that organized context.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Focused Chain-of-Thought first organizes essential information from a query into a concise, structured context and then guides the model to reason exclusively over this context. This training-free, input-centric approach reduces the number of generated tokens by 2-3x compared to standard chain-of-thought prompting while preserving strong reasoning performance.
Research from 2024 shows that a large fraction of reasoning tokens in standard CoT are redundant restatements — Focused CoT eliminates this redundancy by separating organization from reasoning. The key insight is that the model benefits from a clean, structured context more than from re-reading the original verbose query.
It should give the output document a visible organized context block followed by reasoning that references specific context elements, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "extract and structure the essential information from the query into a concise context block, then reason exclusively over that organized context" and when the final answer needs efficient reasoning that avoids redundant restatements and stays grounded in extracted essentials.
A strong Focused Chain-of-Thought trace shows the organized context clearly, makes every reasoning step reference a specific context element, and delivers concise but complete reasoning.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then extract and organize the essential facts, constraints, and principles into a concise structured context block.
2. Verify that the organized context captures all information relevant to answering the question — flag anything omitted.
3. Reason step-by-step exclusively from the organized context, referencing specific context elements by number for each reasoning step.
4. If the organized context proves insufficient for a step, expand it with the missing information and continue, noting the gap.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from reasoning over the organized context rather than the original verbose query.

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
