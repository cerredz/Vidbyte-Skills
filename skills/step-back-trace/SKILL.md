---
name: step-back-trace
description: >
  Use this skill when the user invokes /step-back-trace or asks for a default public reasoning trace using Step-Back Prompting.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Step-Back Prompting as the actual structure of the analysis.
  The strategy forces the model to first step up to a higher level of abstraction, identify underlying principles or concepts,
  and then use that abstracted knowledge to reason about the specific question. Going wider in concept-space before going deeper
  in reasoning-space reduces the chance of getting lost in irrelevant details. Performance improvements of up to 27% over CoT observed.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by abstraction-first reasoning instead of diving directly into specifics.
---

# Step-Back Reasoning Trace

## Goal
Use Step-Back Prompting to answer the user's question through abstraction before reasoning, not through direct immersion in specifics or generic response.
The trace should first step up to identify the underlying principles, concepts, or general frameworks relevant to the question, then use that abstracted knowledge to reason about the specific problem, so the visible reasoning shows the abstraction layer that guides the analysis.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on the abstraction step and the subsequent principle-guided reasoning, because those artifacts make step-back prompting useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming where the abstraction may be incomplete, where principles conflict, and where details not captured by the abstraction matter.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Step-Back move: step up to a higher level of abstraction, identify underlying principles or concepts, and then use that abstracted knowledge to reason about the specific question.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Step-Back Prompting is a reasoning strategy that introduces an abstraction-and-reasoning scheme: rather than diving immediately into the specific problem, the model is first prompted to step up to a higher level of abstraction and identify the underlying principles or concepts, then uses that abstracted knowledge to reason about the specific question.
Performance improvements of up to 27% over CoT were observed, particularly across challenging STEM tasks, Knowledge QA, and Multi-Hop Reasoning.
The underlying intuition is that going wider in concept-space before going deeper in reasoning-space reduces the chance of getting lost in irrelevant details — by first building a mental map of the relevant principles, the model has a navigation aid for the specific reasoning that follows.
It should give the output document a visible two-phase structure: first, the abstraction step that identifies principles, concepts, and frameworks; second, the principle-guided reasoning step that applies those abstractions to the specific problem.
Use it when the problem benefits from the core move "step up to a higher abstraction level, identify underlying principles, then use that abstracted knowledge to reason about the specific question" and when the problem risks getting lost in details that could be clarified by first understanding the general case.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard.
2. **Step Back — Abstraction Phase**: Step up from the specific question to identify the underlying principles, concepts, laws, patterns, or general frameworks that are relevant. What is the general class of problem this belongs to? What principles govern this kind of situation? What are the key concepts that must be understood before the specifics can be reasoned about?
3. **Reason Forward — Application Phase**: Apply the abstracted knowledge to the specific question. For each identified principle or concept, map it to the specific details of the user's problem. Use the abstraction as a navigation aid to structure the reasoning.
4. Record assumptions about which principles apply, where the abstraction may be incomplete, and where the specific case deviates from the general pattern.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from the abstracted principles applied to the specific case, not from a generic summary.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should contain an Abstraction Phase subsection that identifies principles and concepts, followed by an Application Phase subsection that applies those abstractions to the specific question.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, and note the key abstractions that guided the reasoning.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, use an Abstraction Phase subsection (stepping up to principles/concepts/frameworks) followed by an Application Phase subsection (applying abstractions to the specific problem).
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
