---
name: cross-lingual-consistency-trace
description: >
  Use this skill when the user invokes /cross-lingual-consistency-trace or asks for a default public reasoning trace using Cross-Lingual Consistency.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Cross-Lingual Consistency as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by multilingual reasoning paths integrated through consistency voting instead of a generic response.
---

# Cross-Lingual Consistency Reasoning Trace

## Goal
Use Cross-Lingual Consistency to answer the user's question through multilingual reasoning paths integrated through consistency voting, not through a generic checklist or interchangeable trace.
The trace should reason through the problem independently in multiple languages, surface assumptions that differ across languages, and vote on the most consistent conclusion across language paths, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Cross-Lingual Consistency useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Cross-Lingual Consistency move: generate reasoning paths in multiple languages, compare conclusions across languages, and use majority voting to select the most consistent answer.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Cross-Lingual Consistency generates reasoning paths in multiple languages and integrates them through majority voting to elevate reasoning capabilities. Different languages have different training data distributions and linguistic biases — reasoning across languages surfaces assumptions hidden in monolingual reasoning. This approach is particularly effective because an LLM's internal knowledge representations vary by language, meaning the same problem reasoned in English versus Chinese may expose different facets. Research from 2024 demonstrates 4.1-18.5% accuracy gains by diversifying the language of reasoning traces.
It should give the output document a visible reasoning paths in multiple languages, conclusion comparison table, and voting outcome, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "generate reasoning paths in multiple languages, compare conclusions across languages, and use majority voting to select the most consistent answer" and when the final answer needs validated conclusions that hold across linguistic perspectives with explicit handling of divergence.
A strong Cross-Lingual Consistency trace shows multilingual reasoning paths, makes cross-language differences visible, and demonstrates that the conclusion is robust across linguistic variation.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then generate the primary reasoning path in English.
2. Generate independent reasoning paths in 2 additional languages, reasoning from scratch in each rather than translating the English path.
3. Compare conclusions across all language paths — identify where they converge and where they diverge, noting what assumptions differ per language.
4. Apply majority vote on the conclusions: if consensus exists, report it with confidence. If paths diverge, analyze the divergence and select the best-supported conclusion.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from cross-lingual consistency rather than a single-language perspective.

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
