---
name: parallel-thinking-trace
description: >
  Use this skill when the user invokes /parallel-thinking-trace or asks for a default public reasoning trace using Parallel Thinking.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Parallel Thinking as the actual structure of the analysis.
  The strategy decomposes the problem into independent sub-problems and runs parallel reasoning threads, avoiding the diminishing returns
  of long sequential chains where a single path hits overthinking thresholds. Research shows easier problems cross this threshold at around
  2,000 tokens versus 8,000 tokens for hard problems — optimal token budget is problem-difficulty-dependent.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by parallel decomposition instead of one long sequential chain.
---

# Parallel Thinking Reasoning Trace

## Goal
Use Parallel Thinking to answer the user's question through decomposition into parallel reasoning threads, not through a single long sequential chain or generic response.
The trace should decompose the problem into independent sub-problems, run focused reasoning on each in parallel, and synthesize results, so the visible reasoning shows breadth-first exploration before depth.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on the decomposition, each parallel thread's reasoning, and the cross-thread synthesis, because those artifacts make parallel thinking useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming where threads produce contradictory results, where cross-thread dependencies exist, and what assumptions differ across threads.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Parallel Thinking move: decompose the problem into independent sub-problems, run focused reasoning on each in parallel, and synthesize results across threads.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Parallel Thinking is a reasoning strategy that counters the "overthinking" failure mode of deep sequential reasoning by going wide rather than deep.
Rather than running one long sequential reasoning chain that hits diminishing returns, it decomposes the problem into independent sub-problems and runs parallel reasoning threads, then synthesizes the results.
Research has characterized when sequential depth helps versus hurts: easier problems cross the overthinking threshold at around 2,000 tokens versus 8,000 tokens for hard problems, meaning optimal token budget is problem-difficulty-dependent.
It should give the output document a visible decomposition, parallel thread analysis for each sub-problem, and a synthesis that integrates results, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "decompose into independent sub-problems, run parallel focused reasoning on each, and synthesize results" and when the final answer needs breadth-first exploration to avoid the diminishing returns of a single deep chain.
A strong Parallel Thinking trace shows clear decomposition, focused threads, and transparent synthesis that reconciles cross-thread findings.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then identify natural decomposition points that create 3-5 independent sub-problems.
2. For each sub-problem, run an independent focused reasoning thread, targeting concise depth (around 25-50 lines per thread) rather than one deep chain that may overthink.
3. After all threads complete, identify cross-thread dependencies, contradictions, or reinforcing findings.
4. Record assumptions, missing evidence, disconfirming signals, and confidence changes where they affect the analysis, noting which assumptions span threads versus are thread-specific.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from integrating the parallel threads rather than from a single sequential chain.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should contain a Decomposition section that defines each sub-problem, then a dedicated subsection for each parallel thread (Thread 1, Thread 2, ..., Thread N), followed by a Cross-Thread Synthesis section.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, and note any cross-thread contradictions that remain.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, use a Decomposition subsection to define sub-problems, then dedicated subsections for each parallel thread, and a Cross-Thread Synthesis subsection to integrate results.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
