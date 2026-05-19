---
name: agent-as-judge-trace
description: >
  Use this skill when the user invokes /agent-as-judge-trace or asks for a default public reasoning trace using Agent-as-Judge.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Agent-as-Judge as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by step-level trajectory evaluation with intermediate scoring and critique instead of a generic response.
---

# Agent-as-Judge Reasoning Trace

## Goal
Use Agent-as-Judge to answer the user's question through step-level trajectory evaluation with intermediate scoring and critique, not through a generic checklist or interchangeable trace.
The trace should produce reasoning step-by-step while a judge persona evaluates each step for validity, identifies weaknesses, and suggests corrections before the next step proceeds, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Agent-as-Judge useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Agent-as-Judge move: generate a primary reasoning path, then insert judge evaluations after each major step scoring validity, critiquing weaknesses, and suggesting corrections.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Agent-as-Judge represents an extension of the LLM-as-judge paradigm into autonomous agent evaluation, where the reasoning trajectory matters as much as the final answer. Unlike outcome-only evaluation, the judge assesses the journey — whether each reasoning step is valid, well-supported, and progressing toward the answer. By providing intermediate critiques, the judge facilitates improvement within the reasoning process itself. Research from 2024 demonstrates that intermediate evaluation with explicit scoring improves the reliability of multi-step reasoning by catching errors early before they compound.
It should give the output document a visible reasoning steps interleaved with judge scores, critiques, and correction suggestions, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "generate a primary reasoning path, then insert judge evaluations after each major step scoring validity, critiquing weaknesses, and suggesting corrections" and when the final answer needs validated reasoning where each step has been scrutinized and corrected before proceeding.
A strong Agent-as-Judge trace shows the judge's evaluation at each step, records corrections in real-time, and demonstrates that the final answer survived rigorous scrutiny.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then generate the first reasoning step toward the answer.
2. After each major reasoning step, have the judge evaluate it: assign a validity score (1-5), identify specific weaknesses or gaps, and suggest corrections if the score is below 4.
3. Apply any judge-suggested corrections to the reasoning step before proceeding to the next step, continuing the reason-judge-correct cycle.
4. After the final answer, provide an overall trajectory assessment from the judge, summarizing the reasoning quality and any lingering concerns.
5. Synthesize the completed trace into the final answer, showing how the conclusion survived step-by-step evaluation and what corrections were applied.

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
