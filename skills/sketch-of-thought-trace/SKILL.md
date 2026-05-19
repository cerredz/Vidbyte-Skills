---
name: sketch-of-thought-trace
description: >
  Use this skill when the user invokes /sketch-of-thought-trace or asks for a default public reasoning trace using Sketch-of-Thought.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Sketch-of-Thought as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by compressed sketch-style reasoning with minimal tokens per step instead of a generic response.
---

# Sketch-of-Thought Reasoning Trace

## Goal
Use Sketch-of-Thought to answer the user's question through compressed sketch-style reasoning with minimal tokens per step, not through a generic checklist or interchangeable trace.
The trace should generate reasoning as compressed insights in sketch format — each step is a dense note rather than a complete sentence, prioritizing information density over fluency, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Sketch-of-Thought useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Sketch-of-Thought move: produce minimal sketch-style reasoning steps with high information density, using abbreviations and structural formatting instead of full sentences.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Sketch-of-Thought is a cognitive psychology-inspired paradigm that guides models to produce minimal, sketch-style intermediate reasoning steps rather than full verbalizations. Like Chain of Draft, it challenges the premise that reasoning quality correlates with output length. The approach is rooted in the psychological finding that expert reasoners often think in compressed, notation-heavy formats rather than full prose. Research from 2024 demonstrates that sketch-style reasoning preserves answer quality while substantially reducing token consumption, making it particularly valuable for cost-sensitive and latency-sensitive applications.
It should give the output document a visible compressed sketch steps with abbreviations, notation, and structural formatting that maximizes information per token, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "produce minimal sketch-style reasoning steps with high information density, using abbreviations and structural formatting instead of full sentences" and when the final answer needs efficient reasoning that prioritizes substance over verbosity while remaining auditable.
A strong Sketch-of-Thought trace maximizes information density, uses structural shortcuts effectively, and still produces a clear final answer.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then plan the sketch structure — what key points must be captured in minimal form.
2. Generate sketch-style reasoning steps, each as a compressed insight using abbreviations, notation, and structural formatting rather than full sentences.
3. For each sketch step that is too compressed to audit, add a minimal expansion inline without reverting to full prose.
4. Review the sketch chain for completeness — ensure no critical reasoning step was lost to compression.
5. Synthesize the completed trace into a full final answer, expanding the sketch into clear prose while preserving the reasoning structure.

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
