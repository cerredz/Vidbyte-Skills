---
name: iteration-of-thought-trace
description: >
  Use this skill when the user invokes /iteration-of-thought-trace or asks for a default public reasoning trace using Iteration of Thought.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Iteration of Thought as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by multi-round reasoning with intermediate summarization extending context indefinitely instead of a generic response.
---

# Iteration of Thought Reasoning Trace

## Goal
Use Iteration of Thought to answer the user's question through multi-round reasoning with intermediate summarization extending context indefinitely, not through a generic checklist or interchangeable trace.
The trace should run successive reasoning rounds where each round builds on a compressed summary of the previous round, enabling arbitrarily deep reasoning without context window overflow, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Iteration of Thought useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Iteration of Thought move: reason through the problem in multiple rounds, compress each round into an intermediate summary, and build the next round on the compressed summary until convergence.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Iteration of Thought (InftyThink) transforms reasoning into a multi-round inference process with intermediate summarization, extending the effective context size arbitrarily. Each round generates reasoning, which is then compressed into a summary before the next round begins — allowing the reasoning chain to be indefinitely long without exceeding the context window.
This is particularly valuable for problems that require sustained reasoning beyond a single pass. Research from 2024 demonstrates that iterative summarization preserves essential reasoning while enabling depth that single-pass approaches cannot achieve.
It should give the output document a visible multiple reasoning rounds each followed by a compressed summary, showing convergence or progression across rounds, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "reason through the problem in multiple rounds, compress each round into an intermediate summary, and build the next round on the compressed summary until convergence" and when the final answer needs sustained deep reasoning that builds across rounds with explicit tracking of what changed.
A strong Iteration of Thought trace shows the evolution of reasoning across rounds, makes compression visible, and stops when convergence is reached rather than when context runs out.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then generate an initial round of full reasoning analysis.
2. Compress Round 1 into an intermediate summary capturing essential findings, open questions, and uncertainties.
3. Build Round 2 on the compressed summary — deepen the analysis, correct errors, and address gaps identified in the previous round.
4. Continue compressing and reasoning in additional rounds until the reasoning converges or diminishing returns are reached.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from iterative deepening rather than a single pass.

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
