---
name: graph-of-thoughts-trace
description: >
  Use this skill when the user invokes /graph-of-thoughts-trace or asks for a default public reasoning trace using Graph of Thoughts.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Graph of Thoughts as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by graph-structured reasoning with aggregation across paths instead of a linear chain.
---

# Graph of Thoughts Reasoning Trace

## Goal
Use Graph of Thoughts to answer the user's question through graph-structured reasoning with aggregation across paths instead of a linear chain, not through a generic checklist or interchangeable trace.
The trace should represent reasoning as an interconnected graph of thoughts with vertices connected by dependencies, aggregate converging paths into synthesized nodes, and apply feedback loops for refinement, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make graph of thoughts useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Graph of Thoughts move: model reasoning as a graph where thoughts are vertices and dependencies are edges, then construct, connect, aggregate, and refine thoughts through the graph structure.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Graph of Thoughts (GoT) advances prompting capabilities by modeling LLM-generated information as an arbitrary graph, where units of information ("thoughts") are vertices and edges correspond to dependencies between them. Unlike chains (linear) and trees (branching without merging), GoT enables aggregation — multiple independent reasoning paths can be merged into a single synthesized thought node, something chain and tree structures structurally prohibit. The framework also supports feedback loops where a thought can be refined by routing its output as input for deeper iteration. Research from 2024 shows GoT improves performance on complex reasoning tasks by enabling more expressive topological structures than linear or tree-based approaches.
It should give the output document a visible graph structure with labeled vertices, directed edges, aggregated nodes, and any feedback loops applied, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "model reasoning as a graph where thoughts are vertices and dependencies are edges, then construct, connect, aggregate, and refine thoughts through the graph structure" and when the final answer needs demonstrable synthesis across multiple reasoning paths with explicit aggregation logic.
A strong Graph of Thoughts trace shows the full graph topology, makes aggregation explicit, and compresses the structure into a concise final answer.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then identify natural decomposition points that create multiple independent thought nodes.
2. Construct the thought graph: define initial thought vertices, establish dependency edges between them, and plan where aggregation nodes will merge converging paths.
3. Generate content for each thought node in dependency order, recording the reasoning at each vertex before advancing to dependent thoughts.
4. Apply aggregation where multiple thoughts converge — synthesize them into a single node that captures the combined insights. Apply feedback loops where a thought's output should refine an earlier node.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from traversing the graph structure rather than from a single linear chain.

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
