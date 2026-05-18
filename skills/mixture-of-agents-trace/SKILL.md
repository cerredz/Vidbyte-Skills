---
name: mixture-of-agents-trace
description: >
  Use this skill when the user invokes /mixture-of-agents-trace or asks for a default public reasoning trace using Mixture-of-Agents.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Mixture-of-Agents as the actual structure of the analysis.
  The strategy passes the problem through successive layers of refinement, where each layer takes the previous layer's output as additional context
  and improves it — more like an assembly line than a debate. The Mixture-of-Agents method harnesses the collective strengths of agents through
  iterative collaboration across successive stages, and can significantly improve upon the output quality of each individual model.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by progressive refinement across successive layers.
---

# Mixture-of-Agents Reasoning Trace

## Goal
Use Mixture-of-Agents to answer the user's question through progressive refinement across successive layers, not through a single pass or generic response.
The trace should pass the problem through multiple layers of refinement, where each layer takes the previous layer's output as context and improves it, so the visible reasoning shows how quality accumulates across layers.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on the layer-by-layer progression, each layer's refinements, and the quality delta between layers, because those artifacts make mixture-of-agents useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming where later layers correct earlier errors, what assumptions change across layers, and where quality plateaus.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Mixture-of-Agents move: pass the problem through successive refinement layers, where each layer takes the previous output as context and improves it.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Mixture-of-Agents (MoA) is a reasoning strategy distinct from debate — it uses multiple LLMs in successive layers rather than competitive rounds.
The Mixture-of-Agents method harnesses the collective strengths of agents through iterative collaboration across successive stages, and can significantly improve upon the output quality of each individual model.
Each layer takes the outputs of the previous layer as additional context and refines them — more like an assembly line than a debate, where each station improves the product based on the previous station's work.
It should give the output document a visible layer progression with each layer's analysis, the specific refinements made, and the quality delta between layers, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "pass the problem through successive refinement layers, where each layer takes the previous output as context and improves it" and when the final answer needs demonstrable quality improvement through iterative refinement.
A strong Mixture-of-Agents trace shows clear layer progression, specific refinements (not just repetition), and an honest assessment of where quality improved and where it plateaued.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then define 3 layers of refinement with distinct roles (e.g., Layer 1: Proposer, Layer 2: Refiner, Layer 3: Synthesizer).
2. Layer 1 — Proposer: Generate an initial analysis and answer, covering the core reasoning and identifying open questions.
3. Layer 2 — Refiner: Review Layer 1's output, identify specific gaps, correct errors, deepen the analysis where it was shallow, and add missing perspectives.
4. Layer 3 — Synthesizer: Take Layer 2's refined output, integrate any remaining loose ends, add cross-cutting perspectives, and produce the final answer.
5. After all layers complete, compile a quality delta analysis: what specifically improved between each layer, where quality plateaued, and what an additional layer would or would not add.
6. Record assumptions, missing evidence, disconfirming signals, and confidence changes where they affect the analysis, noting how assumptions evolve across layers.
7. Synthesize the completed trace into the final answer, showing how the conclusion follows from the layered refinement process rather than from a single pass.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should contain a Layer Definitions section, then dedicated subsections for each layer's output, and a Quality Delta section that assesses improvement across layers.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, and quality delta summary.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, use a Layer Definitions subsection, then dedicated subsections for each layer's output, and a Quality Delta subsection that tracks improvement across layers.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
