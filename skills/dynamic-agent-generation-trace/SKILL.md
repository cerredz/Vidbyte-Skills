---
name: dynamic-agent-generation-trace
description: >
  Use this skill when the user invokes /dynamic-agent-generation-trace or asks for a default public reasoning trace using Dynamic Agent Generation.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Dynamic Agent Generation as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by adaptive agent workforce that grows as new perspectives are discovered instead of a generic response.
---

# Dynamic Agent Generation Reasoning Trace

## Goal
Use Dynamic Agent Generation to answer the user's question through adaptive agent workforce that grows as new perspectives are discovered, not through a generic checklist or interchangeable trace.
The trace should begin reasoning with a small set of general agents, then create new specialized agents whenever the problem reveals an uncovered perspective, with each new agent contributing focused analysis, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Dynamic Agent Generation useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Dynamic Agent Generation move: start with foundational agents and generate new specialized agents on-the-fly as the task reveals what perspectives are needed.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Dynamic Real-Time Agent Generation (DRTAG) enables the automatic creation of new specialized agents driven by evolving task-specific contexts, reducing the need for predefined agent roles. Unlike static multi-agent architectures where the team composition is fixed upfront, DRTAG discovers what specializations are needed during the reasoning process itself. The system grows its own workforce — when a sub-problem requires a perspective not yet represented, a new agent persona is generated with tailored instructions for that perspective. Research from 2024 demonstrates significant improvements in task adaptability compared to fixed-role approaches.
It should give the output document a visible agent creation log showing when and why each new agent was generated, plus contributions from all agents, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "start with foundational agents and generate new specialized agents on-the-fly as the task reveals what perspectives are needed" and when the final answer needs adaptive coverage where no important perspective is missed due to fixed role definitions.
A strong Dynamic Agent Generation trace shows the adaptive discovery of needed perspectives, justifies each new agent creation, and produces comprehensive coverage from a growing team.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then define 2-3 foundational agents covering broad perspectives relevant to the problem.
2. Begin reasoning with the foundational agents, collecting their independent analyses and identifying gaps in perspective coverage.
3. When a sub-question requires a perspective not covered by existing agents, generate a new specialized agent with tailored instructions for that specific angle.
4. Collect the new agent's contribution, then continue reasoning — generate additional agents as needed until all perspectives are covered.
5. Synthesize all agent contributions into the final answer, showing how the adaptive workforce provided comprehensive coverage.

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
