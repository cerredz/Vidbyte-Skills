---
name: curriculum-learning-trace
description: >
  Use this skill when the user invokes /curriculum-learning-trace or asks for a
  default public reasoning trace using Curriculum Learning Reasoning. The skill
  writes a durable scratchpad to root memory/{question_name}.md and uses
  progressive easy-to-hard scaffolding as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100
  numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
---

# Curriculum Learning Reasoning Trace

## Goal

Use Curriculum Learning Reasoning to answer the user's question through progressive difficulty scaffolding, not through a generic checklist or interchangeable trace. The trace should design a sequence of proxy problems ordered easiest to hardest, solve each stepping stone, record transfer insights, and bring the accumulated understanding to bear on the target. The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought. Center the scratchpad on the curriculum design, the solution of each proxy problem, the transfer insights between steps, and the final target solution that leverages the accumulated curriculum. Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task. Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise. Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent

Direct assault on a complex reasoning problem often fails because too many interacting constraints, unknowns, and dependencies must be held in mind simultaneously. Curriculum learning reasoning addresses this by decomposing the hard problem into a sequence of easier proxy problems that progressively build the component skills and insights needed for the target. By the time the trace reaches the target problem, it has already solved three to five related but simpler problems, each contributing a piece of understanding that the target solution can draw on. This approach is especially suited to multi-domain problems, problems with deep technical dependencies, and problems where the user's current conceptual toolkit is insufficient for a direct solution. The intent is to replace "think harder about the hard problem" with "think carefully about easier problems that teach you what you need for the hard problem."

## Instructions

Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains. Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace. Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect. Build the scratchpad by designing a curriculum of 3-5 proxy problems ordered easiest to hardest, solving each stepping stone, recording transfer insights, and then confronting the target with the accumulated curriculum. Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth. Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis. End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy

Curriculum Learning Reasoning is a reasoning strategy that applies the easy-to-hard training paradigm to single-problem analysis. Grounded in Parashar et al. (2025) and the SATURN method (NeurIPS 2025 Spotlight), it uses progressive difficulty scaffolding to build reasoning incrementally rather than confronting the hardest problem immediately. The core move is: design a sequence of 3-5 proxy problems from easiest to hardest that isolate and progressively combine the skills needed for the target, solve each stepping stone fully, record what was learned and how it transfers forward, and then solve the target using the accumulated curriculum. A strong Curriculum Learning Reasoning trace shows the progressive difficulty gradient, demonstrates genuine transfer between steps, and produces a target solution that explicitly leverages the stepping-stone insights.

## Algorithm for the Output Document
1. Restate the user's target question, constraints, and evidence standard. Classify the problem's dominant reasoning domain.
2. Design the curriculum: create 3-5 proxy problems ordered easiest to hardest, each adding a dimension of complexity, removing a simplifying assumption, or combining previously separate skills.
3. Solve each proxy problem fully using appropriate reasoning, producing numbered reasoning items for each.
4. After each proxy problem, record transfer insights: what was learned, what technique or principle was discovered, and how it applies to the next proxy and to the target.
5. Confront the target problem, explicitly referencing specific insights from specific proxy problems to build the solution.
6. Record assumptions, missing evidence, disconfirming signals, and confidence changes throughout.
7. Synthesize the completed curriculum trace into a final answer, showing how the progressive scaffolding produced a solution that a direct approach would not have achieved.

8. Validate the curriculum quality retrospectively. Assess whether the difficulty gradient was genuine—each proxy problem must be meaningfully harder than the last, not merely a restatement with different surface features. Evaluate whether transfer insights were substantive and actionable, providing specific techniques or principles that demonstrably improved the next proxy's solution, rather than generic observations that could apply to any problem. If the curriculum fails these tests—for example, Proxy 3 is no harder than Proxy 2, or transfer insights merely repeat what was already known—flag the weakness explicitly in the trace rather than presenting a flawed curriculum as sound methodology.

## Implementation Details

The curriculum learning paradigm applied here draws on Parashar et al. (2025), "Curriculum Reinforcement Learning from Easy to Hard Tasks Improves LLM Reasoning." Their SATURN method, recognized as a NeurIPS 2025 Spotlight, demonstrated that scheduling training and RL tasks from easy to hard produces dramatic improvements in LLM reasoning performance. Key results: +14.0 and +28.1 average pass@3 on SAT for 1.5B and 7B models respectively, +4.9 on AIME and +1.8 on LiveCodeBench. The technique uses GRPO (Group Relative Policy Optimization) in the RL context, with easy-to-hard task scheduling and fading schedules that gradually reduce dependency on easier tasks to prevent overfitting. The method comes with convergence guarantees and finite-sample complexity bounds, establishing it as theoretically grounded rather than merely heuristic. In the single-problem reasoning context, the curriculum consists of 3-5 proxy problems that progressively build toward the target, with fading applied by increasingly referencing accumulated insights from earlier steps rather than solving each proxy from scratch.

## Output Information

Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user. Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question." Use numbered scratchpad items for scannability, but treat the number target as approximate and subordinate to usefulness. Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review. After writing the file, respond with the path, selected strategy, scale note, and final answer summary.

## Specify Files And Length And Structure Of Output

Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name. Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer. Within the Scratchpad section, use subsections for the Curriculum Design, each Proxy Problem solution, Transfer Insights after each proxy, and the Target Confrontation. The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions. Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability. If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.

## Things Not to Do

- Do not present minor variations of the same problem as distinct proxy problems ΓÇö each stepping stone must add a qualitatively new dimension of difficulty.
- Do not skip transfer insights ΓÇö after every proxy problem, explicitly record what was learned and how it applies to the next step and to the target.
- Do not rush through early proxy problems ΓÇö they are the foundation and must receive full solution treatment, not abbreviated summaries.
- Do not solve the target problem before working through the curriculum ΓÇö the entire value of the method comes from the progressive scaffolding.
- Do not design a flat curriculum where all proxy problems are at similar difficulty ΓÇö the easy-to-hard gradient must be genuine and visible in the trace.
- Do not fail to reference proxy problem insights when solving the target ΓÇö the target solution must explicitly cite specific lessons from specific stepping stones.
- Do not solve proxy problems that are unrelated to the target ΓÇö each must exercise a skill or insight that is demonstrably needed for the target solution.
- Do not present the curriculum as an afterthought or appendix ΓÇö it is the core structure of the scratchpad and must carry the reasoning.
