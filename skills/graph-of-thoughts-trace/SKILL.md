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

## Intent
Graph of Thoughts trace is invoked when the problem's reasoning structure is fundamentally non-linear — when multiple independent lines of inquiry must be pursued in parallel and then synthesized, or when a reasoning path needs to be refined through feedback loops that earlier structures cannot express. Chain-of-thought forces a single linear path; tree-of-thought allows branching but forbids merging branches together. GoT is the first trace strategy that enables aggregation — the fusion of multiple converging reasoning paths into a single synthesized node — which makes it uniquely suited for problems where the answer depends on integrating evidence from independent analyses that must remain separate until the integration point.

A user would select this trace over a generic trace (or over chain/tree-based traces) when the problem demands synthesis across independent analytical dimensions — for example, evaluating a policy proposal where economic, social, and environmental analyses must be conducted separately and then merged into an integrated assessment. The graph structure also enables feedback loops, where the output of a thought node can be routed back as input to refine an earlier node, making it suitable for iterative refinement problems such as design optimization or argument polishing. The trace's graph topology — vertices, edges, aggregation, and feedback — is itself the primary audit artifact, allowing the reviewer to verify not just the content of each thought but the structural validity of how thoughts were connected.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Graph of Thoughts move: model reasoning as a graph where thoughts are vertices and dependencies are edges, then construct, connect, aggregate, and refine thoughts through the graph structure.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Graph of Thoughts (GoT) advances prompting capabilities by modeling LLM-generated information as an arbitrary graph, where units of information ("thoughts") are vertices and edges correspond to dependencies between them. Unlike chains (linear) and trees (branching without merging), GoT enables aggregation ΓÇö multiple independent reasoning paths can be merged into a single synthesized thought node, something chain and tree structures structurally prohibit. The framework also supports feedback loops where a thought can be refined by routing its output as input for deeper iteration. Research from 2024 shows GoT improves performance on complex reasoning tasks by enabling more expressive topological structures than linear or tree-based approaches.
It should give the output document a visible graph structure with labeled vertices, directed edges, aggregated nodes, and any feedback loops applied, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "model reasoning as a graph where thoughts are vertices and dependencies are edges, then construct, connect, aggregate, and refine thoughts through the graph structure" and when the final answer needs demonstrable synthesis across multiple reasoning paths with explicit aggregation logic.
A strong Graph of Thoughts trace shows the full graph topology, makes aggregation explicit, and compresses the structure into a concise final answer.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then identify natural decomposition points that create multiple independent thought nodes.
2. Construct the thought graph: define initial thought vertices, establish dependency edges between them, and plan where aggregation nodes will merge converging paths.
3. Generate content for each thought node in dependency order, recording the reasoning at each vertex before advancing to dependent thoughts.
4. Apply aggregation where multiple thoughts converge ΓÇö synthesize them into a single node that captures the combined insights. Apply feedback loops where a thought's output should refine an earlier node.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from traversing the graph structure rather than from a single linear chain.

## Implementation Details
Graph of Thoughts was introduced by Besta et al. (2024, AAAI) in "Graph of Thoughts: Solving Elaborate Problems with Large Language Models," which formalized LLM reasoning as operations on an arbitrary graph where thoughts are vertices and dependencies are directed edges. The paper's key architectural contribution is the introduction of aggregation transformations — operations that merge multiple independent thoughts into a single synthesized node — which chain-based (CoT, 2022) and tree-based (ToT, 2023) structures structurally cannot express. The paper demonstrated that this additional topological expressiveness translates to improved performance on sorting, set operations, and keyword counting tasks, with GoT reducing the number of LLM calls needed compared to tree-of-thoughts while maintaining or improving accuracy.

The GoT framework defines four core transformations: Generate (create a new thought from an existing one), Aggregate (merge multiple thoughts into one), Refine (improve a thought through iteration), and Score (evaluate thought quality). The graph structure is more than a presentation format — it is the computational architecture of the reasoning process. Aggregation is the framework's distinguishing capability: when multiple independent reasoning paths produce partial conclusions, these can be fused into a single node that represents their combined insights, something that chain and tree structures cannot do because they lack convergence. Feedback loops enable a thought to be refined by routing its output as input for deeper iteration, supporting patterns like "generate initial answer, evaluate weaknesses, refine" within the same graph traversal.

For Vidbyte reasoning traces, GoT requires an explicit graph description — either as a structured text diagram (ASCII art or indented notation) or as a labeled vertex/edge list — showing the topology of the reasoning process. Each vertex must be labeled with its contributing thoughts, and aggregation nodes must show what they synthesize from. Feedback loops must be explicitly traced: "Thought D refines Thought B; the loop ran twice before convergence." The trace should explain why the graph structure was chosen — why certain thoughts were placed in parallel, why certain paths were merged, and what the aggregation criteria were. The final synthesis should demonstrate that the conclusion follows from traversing the graph, not from a single linear chain that the graph notation merely decorates.

The broader context includes work on structured state space models and graph neural networks, but GoT's innovation is applying graph abstractions to the reasoning process itself rather than to the model architecture. Related work on program-aided language models (Gao et al., 2023, PAL) and tool-augmented reasoning similarly use structured representations, but GoT is unique in using the graph as both the reasoning structure and the reasoning artifact that the user can inspect.

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

## Things Not to Do
- Do not present a chain of thoughts and label it as a graph — the trace must show genuine branching, merging, or feedback loops; a DAG that is topologically a simple path is not a graph of thoughts.
- Do not aggregate thoughts that do not genuinely converge — aggregation should synthesize complementary or overlapping insights; merging unrelated thoughts produces a node with no coherent content.
- Do not let feedback loops run without a convergence criterion — the trace must show when and why iteration stopped, not just that it ran multiple times.
- Do not skip the topology description — the graph structure (which vertices connect to which, where aggregation occurs, where feedback loops apply) must be explicitly documented, not inferred from reading order.
- Do not confuse the graph structure with subsection headers — having sections with different headers is not graph reasoning; the trace must show actual dependency edges between thoughts that the reviewer can trace.
- Do not create aggregation nodes that simply restate the input thoughts without synthesis — aggregation must produce new insight from combining, not just concatenation.
- Do not present a graph where every vertex depends on every previous vertex — that is a fully connected graph and provides no structural insight; the edges should represent genuine reasoning dependencies.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
