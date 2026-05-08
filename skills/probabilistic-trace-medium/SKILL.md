---
name: probabilistic-trace-medium
description: "Use this skill when the user invokes /probabilistic-trace-medium or asks for a medium public reasoning trace using Probabilistic Reasoning. It writes a structured scratchpad to root memory/{question_name}.md and scales the trace to exactly 100 numbered scratchpad lines."
---

# Probabilistic Reasoning Reasoning Trace Medium

## Goal
Use this skill to produce a public, audit-friendly reasoning trace for the user's question using the Probabilistic Reasoning strategy.
Convert the question into a named investigation and write the scratchpad at the repository root under `memory/{question_name}.md`.
Keep the trace focused on inspectable reasoning artifacts such as assumptions, subquestions, evidence, checks, intermediate conclusions, and the final answer.
Do not expose hidden private chain-of-thought; provide a concise public scratchpad that captures the visible structure of the reasoning method.
Make the final response point to the scratchpad file and summarize the conclusion only after the file is written.

## Instructions
Derive `{question_name}` from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using `reasoning-trace` if no safe name remains.
Create the root `memory` directory if it does not already exist, then create or overwrite `memory/{question_name}.md` for this trace.
Start the scratchpad by naming the question, the selected strategy, the selected scale, and the exact required line budget.
Apply Probabilistic Reasoning by using it to represent uncertainty explicitly, compare likelihoods, and avoid binary certainty when evidence is incomplete, and make each numbered line advance that method rather than adding generic filler.
End by writing a final answer section that is consistent with the scratchpad and states any remaining uncertainty plainly.

## Background Information About The Reasoning Strategy
Probabilistic Reasoning is a uncertainty analysis strategy that gives the trace a specific shape instead of a loose stream of thoughts.
Its core move is to represent uncertainty explicitly, compare likelihoods, and avoid binary certainty when evidence is incomplete, which helps the model expose reasoning checkpoints that a reader can inspect.
The strategy is useful when the user wants the answer to show how the conclusion was built, compared, challenged, or calibrated.
The main failure mode is treating the framework as decorative labels, so every line should do real work inside the chosen strategy.
The trace should preserve uncertainty, assumptions, and disconfirming evidence because those details make the final answer more trustworthy.

## Output Information
Write the scratchpad as Markdown in the root `memory/{question_name}.md` file before giving the user the final answer.
Include this exact scale statement near the top of the file: "Scale: medium - this scratchpad is required to output exactly 100 lines."
Use numbered scratchpad lines so the requested line count can be verified without guessing.
Keep each line concise, but make it substantive enough to show the reasoning operation performed on that line.
After the scratchpad is complete, respond to the user with the file path, the selected strategy, the scale statement, and the final answer.

## Specify Files And Length And Structure Of Output
The only required artifact is `memory/{question_name}.md` at the repository root, and the directory name must be exactly `memory`.
Write exactly 100 numbered scratchpad lines, then add a short final answer after the numbered trace.
Structure the file with the sections `Question`, `Strategy`, `Scale`, `Scratchpad`, `Synthesis`, and `Final Answer`.
The `Scratchpad` section must contain the numbered trace lines, while `Synthesis` should compress the trace into a small set of takeaways.
If the user gives a format, domain, or evidence constraint, preserve it inside this structure while still meeting the medium length requirement.
