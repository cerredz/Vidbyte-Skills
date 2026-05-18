---
name: paradigm-routing-trace
description: >
  Use this skill when the user invokes /paradigm-routing-trace or asks for a default public reasoning trace using Paradigm Routing.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Paradigm Routing as the actual structure of the analysis.
  The strategy is a meta-paradigm that selects the most suitable inference-time paradigm before answering. Research comparing six paradigms
  (Direct, CoT, ReAct, Plan-Execute, Reflection, ReCode) across four frontier LLMs and ten benchmarks found that no single paradigm dominates,
  and oracle per-task selection beats the best fixed paradigm by 17.1 percentage points. A lightweight embedding-based router selects the
  most suitable paradigm before answering each task, improving average accuracy and recovering up to 37% of the oracle gap.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by optimal paradigm selection before reasoning begins.
---

# Paradigm Routing Reasoning Trace

## Goal
Use Paradigm Routing to answer the user's question through optimal paradigm selection before reasoning begins, not through a fixed paradigm or generic response.
The trace should first analyze the problem to select the most suitable inference-time paradigm, then execute that paradigm, so the visible reasoning shows why one paradigm was chosen over others.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on the paradigm routing decision and the subsequent paradigm execution, because those artifacts make paradigm routing useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming where the routing decision is ambiguous, what alternative paradigms were considered, and the confidence in the routing choice.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Paradigm Routing move: analyze the problem, select the most suitable inference-time paradigm from a proven taxonomy, and execute that paradigm.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Paradigm Routing ("Select-then-Solve") is a meta-paradigm that sits on top of all other inference-time paradigms.
Research comparing six paradigms — Direct, CoT, ReAct, Plan-Execute, Reflection, and ReCode — across four frontier LLMs and ten benchmarks (roughly 18,000 runs) found that reasoning structure helps dramatically on some tasks but hurts on others.
ReAct improves over direct prompting by 44 percentage points on GAIA, while CoT degrades performance by 15pp on HumanEval. No single paradigm dominates, and oracle per-task selection beats the best fixed paradigm by 17.1pp on average.
The solution is a lightweight embedding-based router that selects the most suitable paradigm before answering each task, improving average accuracy from 47.6% to 53.1% — outperforming the best fixed paradigm and recovering up to 37% of the oracle gap.
The implication is that the choice of paradigm is itself an optimizable variable, and routing to the right paradigm before reasoning begins is a high-leverage decision.
It should give the output document a visible routing decision with justification, then the executed paradigm's reasoning trace, so the reader can see why the paradigm was chosen and how the answer was reached.

A strong Paradigm Routing trace shows clear routing justification, honest assessment of paradigm fit, and a reasoning trace that follows the selected paradigm's characteristic structure.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard.
2. Analyze the problem by testing it against each paradigm in the taxonomy:
   - **Direct**: Simple factual/definitional questions — answer directly without extended reasoning.
   - **CoT (Chain of Thought)**: Multi-step problems benefiting from sequential reasoning with intermediate steps.
   - **ReAct**: Problems requiring reasoning interleaved with action/observation loops or tool use.
   - **Plan-Execute**: Complex tasks where upfront planning improves execution quality and organization.
   - **Reflection**: Problems where iterative self-critique and revision improve the final answer quality.
   - **ReCode**: Problems where expressing reasoning as structured code improves precision and verifiability.
3. Select the best-fit paradigm with justification: why this paradigm, why not the alternatives, and confidence in the routing decision.
4. Execute the selected paradigm, producing a reasoning trace that follows that paradigm's characteristic structure.
5. Record assumptions, missing evidence, disconfirming signals, and confidence changes where they affect the analysis.
6. Synthesize the completed trace into the final answer, showing how the conclusion follows from the selected paradigm's reasoning structure.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should contain a Paradigm Routing section that shows the analysis of each candidate paradigm and the selection with justification, followed by a Paradigm Execution section that follows the selected paradigm's reasoning structure.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, and which paradigm was selected with brief justification.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, use a Paradigm Routing subsection that analyzes candidate paradigms and selects the best fit with justification, then a Paradigm Execution subsection that follows the selected paradigm's characteristic reasoning structure.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
