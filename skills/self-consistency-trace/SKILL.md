---
name: self-consistency-trace
description: >
  Use this skill when the user invokes /self-consistency-trace or asks for a default public reasoning trace using Self-Consistency.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Self-Consistency as the actual structure of the analysis.
  The strategy samples N independent reasoning paths and selects the most consistent answer via majority or plurality vote,
  analogous to the human experience that multiple reasoning paths leading to the same answer warrant greater confidence.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by consensus across diverse reasoning paths instead of a single chain of thought.
---

# Self-Consistency Reasoning Trace

## Goal
Use Self-Consistency to answer the user's question through consensus across independent reasoning paths, not through a single chain of thought or generic response.
The trace should sample N diverse reasoning paths, evaluate each path's conclusion, and select the most consistent answer via majority or plurality vote, so the visible reasoning shows the convergence (or divergence) across paths.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on the independent paths, the conclusion from each, and the voting result, because those artifacts make self-consistency useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming where paths diverge, where assumptions differ, and what confidence the consensus warrants.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Self-Consistency move: sample N independent reasoning paths, evaluate each path's conclusion, and select the most consistent answer via majority or plurality vote.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Self-Consistency is a reasoning strategy that samples a diverse set of reasoning paths and chooses the most consistent answer using majority or plurality vote.
It is analogous to the human experience that if multiple reasoning paths lead to the same answer, we have greater confidence the answer is correct.
Research from 2025 found that generating multiple independent reasoning paths within the same inference budget and selecting the most consistent response via majority vote achieves up to 20% higher accuracy compared to extended sequential thinking.
It should give the output document N visible reasoning paths, each with its own chain of thought and conclusion, then a voting tally and consensus outcome, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "sample N independent reasoning paths, evaluate each conclusion, and select the most consistent answer via majority or plurality vote" and when the final answer needs evidence of convergence (or divergence) across independent lines of reasoning.
A strong Self-Consistency trace shows the diversity of paths, makes the voting transparent, and compresses the result into a concise final answer with explicit confidence based on path agreement.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then set N (default 5) as the number of independent reasoning paths to sample.
2. For each path i=1..N: reason through the problem independently from scratch, varying the starting angle, assumptions, or approach to ensure diversity. Record the full reasoning chain and the conclusion.
3. Compare all N conclusions and apply majority or plurality vote: if a single answer appears in the majority of paths, select it as the consensus. If no majority exists, select the plurality winner. If all paths disagree, report the disagreement and identify the most compelling individual path.
4. Record assumptions, missing evidence, disconfirming signals, and confidence changes where they affect the analysis, noting which assumptions are shared across paths versus unique to a single path.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from the consensus across paths, including the voting tally and confidence level.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should contain a dedicated section for each path (Path 1, Path 2, ..., Path N) followed by a Voting section that tallies conclusions and identifies the consensus.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, voting tally, and confidence level.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, use subsections for each independent path (Path 1, Path 2, ..., Path N) and a Voting subsection that tallies conclusions.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
