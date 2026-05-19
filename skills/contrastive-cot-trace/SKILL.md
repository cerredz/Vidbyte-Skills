---
name: contrastive-cot-trace
description: >
  Use this skill when the user invokes /contrastive-cot-trace or asks for a default public reasoning trace using Contrastive Chain-of-Thought.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Contrastive Chain-of-Thought as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by learning from both valid and invalid reasoning demonstrations instead of a generic response.
---

# Contrastive Chain-of-Thought Reasoning Trace

## Goal
Use Contrastive Chain-of-Thought to answer the user's question through learning from both valid and invalid reasoning demonstrations, not through a generic checklist or interchangeable trace.
The trace should produce a valid reasoning path alongside contrastive invalid versions for each major step, show why each mistake is wrong, and synthesize the corrected chain, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make contrastive chain-of-thought useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Contrastive Chain-of-Thought move: generate both valid and invalid reasoning for each step, explain why invalid paths fail, and build the answer from corrected reasoning.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Contrastive Chain-of-Thought provides both valid and invalid reasoning demonstrations, guiding the model to reason step-by-step while reducing reasoning mistakes. Unlike standard CoT which only shows correct reasoning, CCoT explicitly models what-not-to-do — for each major reasoning step, a contrastive invalid version is generated and explicitly corrected. Research shows improvements of 9.8 points on GSM-8K and 16 points on Bamboogle compared to conventional CoT. The mechanism works by forcing the model to distinguish correct from incorrect reasoning patterns rather than simply following a single correct template.
It should give the output document a visible paired valid/invalid reasoning with explicit corrections at each step, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "generate both valid and invalid reasoning for each step, explain why invalid paths fail, and build the answer from corrected reasoning" and when the final answer needs explicit error awareness and corrected reasoning that learns from demonstrated mistakes.
A strong Contrastive Chain-of-Thought trace shows plausible mistakes and their corrections, making the final reasoning more robust by preemptively addressing failure modes.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then generate the primary valid reasoning path step by step.
2. For each major reasoning step, generate a contrastive invalid version — a plausible but incorrect approach — and explain exactly why it fails.
3. Show the correction explicitly: how the invalid step is fixed, what principle or check prevents the error, and how the corrected reasoning advances.
4. After all contrastive pairs, synthesize the corrected chain into a clean reasoning path free of the identified errors.
5. Record both valid and invalid reasoning in the trace, showing how error awareness improves the final answer's reliability.

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
