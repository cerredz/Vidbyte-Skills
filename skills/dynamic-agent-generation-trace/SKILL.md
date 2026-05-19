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

## Intent
Dynamic Agent Generation trace is invoked when the problem's full dimensionality is not fully known at the outset — when the user suspects that additional perspectives will be needed but cannot predict in advance which ones. Fixed-role multi-agent approaches suffer from a fundamental limitation: the team composition is determined before the problem is explored, meaning that if an important perspective was not anticipated, it is simply absent from the analysis. DRTAG solves this by starting with a minimal set of broad-coverage agents and then generating new specialized agents on-the-fly whenever the reasoning process reveals a coverage gap that no existing agent can fill, ensuring that the final analysis is not artificially constrained by the initial role definitions.

A user would select this trace over a generic trace (or over a fixed multi-agent trace) when the problem domain is exploratory, interdisciplinary, or otherwise resistant to pre-specification. Examples include technology ethics assessments where legal, technical, social, and philosophical perspectives may all be needed in unknowable combinations; market analysis where unexpected competitive dynamics emerge during reasoning; or any situation where the richness of the problem exceeds the user's ability to enumerate relevant viewpoints upfront. The strategy prevents the "missing expert" failure mode — the situation where a fixed panel of agents produces a confident answer that is nevertheless wrong because the one expert who would have caught the error was never included — by making agent creation a continuous, adaptive process that responds to the problem as it unfolds rather than as it was initially described.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Dynamic Agent Generation move: start with foundational agents and generate new specialized agents on-the-fly as the task reveals what perspectives are needed.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Dynamic Real-Time Agent Generation (DRTAG) enables the automatic creation of new specialized agents driven by evolving task-specific contexts, reducing the need for predefined agent roles. Unlike static multi-agent architectures where the team composition is fixed upfront, DRTAG discovers what specializations are needed during the reasoning process itself. The system grows its own workforce ΓÇö when a sub-problem requires a perspective not yet represented, a new agent persona is generated with tailored instructions for that perspective. Research from 2024 demonstrates significant improvements in task adaptability compared to fixed-role approaches.
It should give the output document a visible agent creation log showing when and why each new agent was generated, plus contributions from all agents, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "start with foundational agents and generate new specialized agents on-the-fly as the task reveals what perspectives are needed" and when the final answer needs adaptive coverage where no important perspective is missed due to fixed role definitions.
A strong Dynamic Agent Generation trace shows the adaptive discovery of needed perspectives, justifies each new agent creation, and produces comprehensive coverage from a growing team.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then define 2-3 foundational agents covering broad perspectives relevant to the problem.
2. Begin reasoning with the foundational agents, collecting their independent analyses and identifying gaps in perspective coverage.
3. When a sub-question requires a perspective not covered by existing agents, generate a new specialized agent with tailored instructions for that specific angle.
4. Collect the new agent's contribution, then continue reasoning ΓÇö generate additional agents as needed until all perspectives are covered.
5. Synthesize all agent contributions into the final answer, showing how the adaptive workforce provided comprehensive coverage.

## Implementation Details
Dynamic Real-Time Agent Generation (DRTAG) was introduced by Li et al. (2024) in "DRTAG: Dynamic Real-Time Agent Generation for Adaptive Multi-Agent Systems," which proposed a framework where new specialized agents are created automatically during task execution based on evolving contextual needs. Unlike static multi-agent architectures such as CAMEL (Li et al., 2023) or ChatDev (Qian et al., 2023) where agent roles are predefined, DRTAG treats agent generation as an online decision — at each reasoning step, the system assesses whether existing agents cover all required perspectives, and if not, spawns a new agent with tailored instructions optimized for the uncovered dimension. The paper demonstrated that this adaptive approach achieves broader perspective coverage than fixed-role baselines while using fewer total agent interactions because agents are only created when actually needed.

The technical mechanism works through a coverage-gap detection process: after foundational agents contribute their analyses, the system evaluates whether any important aspect of the problem remains unaddressed. If a gap is detected — for example, the technical analysis missed regulatory implications, or the economic analysis ignored environmental externalities — a new agent persona is generated with explicit instructions to cover that specific blind spot. This is fundamentally different from having a generic catch-all agent, because each generated agent is specialized and receives tailored reasoning instructions that a general-purpose agent would lack. The agent creation itself is an act of meta-reasoning: the system must recognize what it does not know and design an expert to fill the gap.

For Vidbyte reasoning traces, DRTAG requires starting with 2-3 foundational agents covering broad domains (e.g., Technical Analyst, Domain Expert, Critical Evaluator), then iteratively generating new agents when coverage gaps emerge. The trace must include an agent creation log showing when each agent was created, why (what gap it fills), and what tailored instructions it received. Each agent's contribution should be clearly labeled and attributed, and the final synthesis must show how the adaptive workforce achieved comprehensive coverage that a fixed team would have missed. The number of agents should be proportional to the problem's dimensionality — most problems should generate 1-3 additional agents beyond the foundation, not dozens.

The broader research context includes work on emergent role specialization in multi-agent systems (Hong et al., 2023, MetaGPT) which showed that LLM-based agents can self-organize into specialized roles given high-level task descriptions. DRTAG extends this by making role emergence part of the online reasoning process rather than a pre-execution setup step, enabling the system to respond to problem-specific contingencies that cannot be predicted from the task description alone.

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
- Do not generate agents for trivial perspective gaps that an existing agent could cover with minimal instruction adjustment — agent creation should be reserved for genuinely uncovered dimensions, not minor nuance differences.
- Do not create agents without explicit tailored instructions — every generated agent must receive specific reasoning guidance that differentiates it from the foundational agents, or it contributes nothing new.
- Do not let the agent creation process continue indefinitely — the trace should converge once all meaningful perspectives are covered, and generating agents past the point of diminishing returns only dilutes the quality of the analysis.
- Do not allow multiple agents to produce identical or near-identical contributions — if two agents say the same thing, one of them is redundant, and the trace should note this rather than presenting it as independent confirmation.
- Do not skip the coverage-gap detection step between agent rounds — the trace must explicitly show what gap was detected, why existing agents cannot fill it, and what specific instructions will enable the new agent to address it.
- Do not present agent contributions as independent when they were generated sequentially and later agents could see earlier agents' outputs — the trace must acknowledge any cross-contamination or note when agents were truly isolated.
- Do not let the foundational agents be too narrow — they must cover broad domains so that the system can detect gaps, not be so specialized that they miss the forest for the trees.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
