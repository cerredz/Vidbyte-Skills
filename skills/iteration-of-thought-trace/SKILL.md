---
name: iteration-of-thought-trace
description: >
  Use this skill when the user invokes /iteration-of-thought-trace or asks for a default public reasoning trace using Iteration of Thought.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Iteration of Thought as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by multi-round reasoning with intermediate summarization extending context indefinitely instead of a generic response.
---

# Iteration of Thought Reasoning Trace

## Goal
Use Iteration of Thought to answer the user's question through multi-round reasoning with intermediate summarization extending context indefinitely, not through a generic checklist or interchangeable trace.
The trace should run successive reasoning rounds where each round builds on a compressed summary of the previous round, enabling arbitrarily deep reasoning without context window overflow, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Iteration of Thought useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent
Iteration of Thought trace is invoked when the problem requires sustained reasoning depth that exceeds what a single pass through the context window can accommodate — when the answer depends on building layer upon layer of analysis where each layer refines, corrects, or deepens the previous one. Standard chain-of-thought is bounded by the context window: once you have filled it with reasoning tokens, you cannot add more without losing earlier context. Iteration of Thought solves this by compressing each reasoning round into an intermediate summary before starting the next round, enabling arbitrarily deep reasoning that iteratively converges toward a better answer without context window overflow.

A user would select this trace over a generic trace when the problem genuinely benefits from multiple passes — not just more tokens, but more passes where earlier passes inform later ones — such as complex multi-constraint optimization, argument analysis requiring progressive refinement, or any problem where the first-pass answer is expected to have gaps that only become visible after the initial analysis. The strategy is distinguished from simple "think step by step" by its summarization mechanism: each round produces a compressed representation that preserves essential findings while discarding the intermediate scaffolding, freeing context for the next round to build higher. This makes IoI valuable for problems that standard CoT would either truncate or produce superficial answers for due to context constraints.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Iteration of Thought move: reason through the problem in multiple rounds, compress each round into an intermediate summary, and build the next round on the compressed summary until convergence.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Iteration of Thought (InftyThink) transforms reasoning into a multi-round inference process with intermediate summarization, extending the effective context size arbitrarily. Each round generates reasoning, which is then compressed into a summary before the next round begins ΓÇö allowing the reasoning chain to be indefinitely long without exceeding the context window.
This is particularly valuable for problems that require sustained reasoning beyond a single pass. Research from 2024 demonstrates that iterative summarization preserves essential reasoning while enabling depth that single-pass approaches cannot achieve.
It should give the output document a visible multiple reasoning rounds each followed by a compressed summary, showing convergence or progression across rounds, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "reason through the problem in multiple rounds, compress each round into an intermediate summary, and build the next round on the compressed summary until convergence" and when the final answer needs sustained deep reasoning that builds across rounds with explicit tracking of what changed.
A strong Iteration of Thought trace shows the evolution of reasoning across rounds, makes compression visible, and stops when convergence is reached rather than when context runs out.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then generate an initial round of full reasoning analysis.
2. Compress Round 1 into an intermediate summary capturing essential findings, open questions, and uncertainties.
3. Build Round 2 on the compressed summary ΓÇö deepen the analysis, correct errors, and address gaps identified in the previous round.
4. Continue compressing and reasoning in additional rounds until the reasoning converges or diminishing returns are reached.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from iterative deepening rather than a single pass.

## Implementation Details
Iteration of Thought (InftyThink) was introduced by Chen et al. (2024) in "InftyThink: Iteration of Thought with Intermediate Summarization for Infinite Context Reasoning," which addresses the fundamental limitation that transformer context windows, while growing rapidly, still impose a hard ceiling on single-pass reasoning depth. The paper demonstrated that by compressing each reasoning round into an intermediate summary — capturing conclusions, open questions, and confidence assessments — the effective reasoning depth can be extended arbitrarily without losing coherence. The key empirical finding is that this iterative summarization preserves reasoning quality across rounds that individually would exceed context limits when concatenated, enabling depth that single-pass approaches cannot achieve.

The technical mechanism operates through a compress-then-reason cycle: Round N produces a full reasoning trace, which is then compressed into a summary that captures essential findings in a fraction of the tokens. Round N+1 starts fresh with the compressed summary as context, allowing it to build on previous insights without being weighed down by the full history of intermediate reasoning steps. The compression step must be smart — it cannot simply truncate or reduce verbosity; it must identify and preserve findings that are genuinely essential for the next round while discarding scaffolding that served its purpose. The paper showed that 3-5 rounds is typically sufficient for convergence on complex reasoning tasks, with diminishing returns beyond that point.

For Vidbyte reasoning traces, IoI requires explicit round markers (Round 1, Round 2, etc.) with each round followed by its compressed summary. The trace must show what changed between rounds — what was corrected, what was deepened, and what new insight emerged — so the reviewer can see the convergence trajectory. The trace should stop at convergence (when a round adds no substantial new insight) rather than running a fixed number of rounds. The compression quality is directly visible in the trace: if a summary omits a finding that becomes relevant later, the trace must show the system recovering that finding rather than silently dropping it. The final synthesis should demonstrate that the answer emerged from iterative deepening, not from any single round.

The broader context includes work on recurrent and iterative transformer architectures (Dehghani et al., 2019, Universal Transformers; Hutchins et al., 2022, Block-Recurrent Transformers) which similarly apply iterative computation at the architecture level. IoI achieves iteration at the prompting level, making it compatible with any transformer model without architectural modification.

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
- Do not run more than one round if the first round fully answers the question — iterative deepening is only valuable when there are genuine gaps or refinements to make, and running unnecessary rounds wastes tokens on circular restatement.
- Do not compress a summary by simply truncating the previous round — compression is an active distillation process that must identify and preserve essential findings, not just cut off after N tokens.
- Do not let a compressed summary omit findings that become relevant in later rounds — if the summary drops information, the next round cannot build on it, and the trace must acknowledge the gap rather than silently re-deriving lost conclusions.
- Do not present each round as a fresh start that ignores previous rounds — every round must explicitly reference the previous round's summary and state what it is adding, correcting, or deepening.
- Do not run rounds until a fixed count is reached — the trace must define a convergence criterion (no new insights, confidence stabilized, diminishing returns) and stop when it is met.
- Do not let the compression step become a hidden reasoning step — the compressed summary itself should be inspectable; the reviewer must be able to judge whether the compression was faithful to the full reasoning.
- Do not produce a trace where later rounds simply restate earlier rounds in different words — the trace must show progressive deepening, not paraphrasing.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
