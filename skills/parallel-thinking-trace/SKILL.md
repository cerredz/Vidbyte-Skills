---
name: parallel-thinking-trace
description: >
  Use when the user invokes /parallel-thinking-trace or asks for a standalone
  reasoning trace using Parallel Thinking. Counters the overthinking failure
  mode by decomposing the problem into 3–5 independent sub-problems, running
  each with a focused reasoning strategy, and synthesizing the results. Based
  on S-GRPO (35–61% sequence reduction with 0.7–6.1% accuracy gains) and
  REA-RL (36% cost reduction without accuracy loss). Produces a durable audit
  trail in memory/{question_name}.md showing the decomposition, each sub-problem's
  analysis, and the integrated synthesis.
---

# Parallel Thinking Reasoning Trace

## Goal

Use Parallel Thinking to answer the user's question by decomposing it into 3–5 independent sub-problems, applying focused reasoning strategies to each sub-problem in parallel, and synthesizing the sub-conclusions into an integrated answer — rather than generating one long, monolithic reasoning chain that revisits the same territory and burns tokens on overthinking. The trace should demonstrate that each sub-problem received reasoning depth proportionate to its difficulty: simple factual sub-problems get economical analysis, complex analytical sub-problems get deeper treatment, and no sub-problem receives more reasoning than it needs. The goal is to create a public scratchpad that a reviewer can audit — inspecting the decomposition rationale to verify that sub-problems were genuinely independent, comparing each sub-problem's analysis to confirm that the selected strategy was appropriate, and evaluating the synthesis to judge whether the sub-conclusions combine coherently.

The trace counters a specific failure mode: overthinking. When language models face complex problems, they default to generating long chains of reasoning that elaborate on settled points, revisit the same territory from slightly different angles, and dilute the strongest reasoning with weaker supplementary reasoning. This is not just wasteful — it can degrade accuracy by introducing confusion and exhausting the effective context window. Parallel thinking prevents this by front-loading a decomposition step that partitions the problem into bite-sized sub-problems, each of which can be reasoned through with focused depth. The decomposition itself is a reasoning act worthy of audit — did we identify the right sub-problems, are they genuinely independent, and does each receive the depth it deserves?

## Intent

We run this trace when the problem is complex enough to benefit from decomposition — when it crosses domain boundaries, when it has clearly separable aspects that each require different reasoning strategies, or when a single reasoning chain would produce a tangled, overlong output. The trace is designed to be self-contained: it handles decomposition, strategy selection per sub-problem, parallel execution, and synthesis without requiring a separate meta-reasoner. The user invokes `/parallel-thinking-trace` when they specifically want the parallel thinking technique applied to their problem, whether because they recognize it as decomposable or because a previous single-path analysis was unfocused and unsatisfying.

The output serves both as an answer and as a reasoning-quality assessment. The decomposition shows how the problem was structured; the per-sub-problem analyses show the depth of reasoning applied to each aspect; and the synthesis shows how the pieces fit together. A reviewer can assess whether the decomposition missed important sub-problems, whether any sub-problem was overthought (generating 50 items for a question that needed 10) or underthought (generating 10 items for a question that needed 50), and whether the synthesis genuinely integrates the sub-conclusions or merely restates them. This auditability is the trace's value: it makes the reasoning architecture explicit and inspectable.

## Instructions

Derive `{question_name}` from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using `parallel-thinking-trace` if no safe name remains.

Create the root `memory` directory when needed, then write or replace `memory/{question_name}.md` with this trace.

Start the file with the question, the meta-strategy name, a scale note, and the decomposition rationale — explaining why these sub-problems were chosen, why they are independent, and what difficulty level each warrants.

Decompose the problem into 3–5 sub-problems that are as independent as possible. For each sub-problem: identify its reasoning domain, select the best-fit strategy from Vidbyte's reasoning catalog, assign a difficulty rating (simple, moderate, complex) that determines its reasoning budget, and apply the strategy's algorithm — restating the sub-problem, applying the core move, producing numbered reasoning items, recording assumptions and uncertainty, and synthesizing a sub-conclusion.

After all sub-problems are analyzed, synthesize the sub-conclusions into an integrated answer. Identify how each sub-conclusion contributes to the overall answer, note interactions and tensions between sub-conclusions, and produce a final answer that integrates the pieces into a coherent response.

End the file with the synthesis and final answer that follow from the combined sub-analyses, including any important uncertainty or unresolved tensions.

## Background Information About The Reasoning Strategy

Parallel Thinking is a problem-solving paradigm that counters the sequential, monolithic reasoning default of language models by front-loading decomposition and executing sub-problem analyses independently. The core insight is that complex problems are rarely monolithic — they are composites of simpler questions that can be answered independently, and treating them as one undifferentiated reasoning task produces overthinking: generating excessive tokens that revisit settled territory, elaborate on already-established points, and dilute the strongest reasoning with weaker supplementary reasoning. By decomposing first, each sub-problem gets a focused reasoning budget proportionate to its difficulty, avoiding both overthinking on easy sub-problems and underthinking on hard ones.

The empirical foundation for this approach comes from multiple lines of research on reasoning efficiency. S-GRPO (Sequence-aware Group Relative Policy Optimization) demonstrated that models can be trained to generate more concise reasoning without sacrificing accuracy, achieving sequence length reductions of 35.4% to 61.1% while simultaneously improving accuracy by 0.72 to 6.08 percentage points across benchmarks. This finding challenges the assumption that longer reasoning necessarily produces better answers — it demonstrates that focused, well-structured reasoning can outperform longer, less-structured reasoning. The key mechanism is that S-GRPO learns to recognize when further reasoning would be redundant and stops, rather than continuing to elaborate on settled points.

REA-RL (Reasoning-Enhanced Actor-Critic with Reinforcement Learning) introduced a reflection model that monitors reasoning quality and decides when revision is warranted, reducing inference costs by 36% without accuracy loss. The critical efficiency gain comes from avoiding unnecessary revision: standard approaches revise reasoning steps regardless of whether they're correct, while REA-RL's reflection model identifies steps that are already adequate and skips revision for those steps. This selective revision mechanism is directly analogous to parallel decomposition — both identify which parts of the problem actually need deep reasoning and which can be handled more economically.

The Budget-Adaptive Curriculum approach further refined this by demonstrating that reasoning budget allocation matters as much as total budget. Under tight token budgets, budget-adaptive allocation achieved up to 8.3% accuracy gains while cutting total token consumption by 34%, by assigning more reasoning depth to difficult problems and less to easy ones. This finding directly informs the difficulty-calibrated sub-problem budgeting in parallel thinking traces: simple sub-problems get a short reasoning budget (~500–1,000 tokens), moderate sub-problems get a medium budget (~1,000–2,500 tokens), and complex sub-problems get a deeper budget (~2,500–4,000 tokens). The total token consumption across all sub-problems is typically lower than what a monolithic reasoning chain would consume for the same problem, because each sub-problem's budget is calibrated rather than inflated.

The overthinking threshold varies by problem difficulty. Research on reasoning token budgets suggests that "easy" problems (those answerable through straightforward application of known principles) reach diminishing returns at approximately 2,000 tokens of reasoning, while "hard" problems (those requiring multi-step synthesis across domains) may benefit from up to 8,000 tokens. Parallel decomposition respects these thresholds by assigning each sub-problem a budget appropriate to its individual difficulty rather than applying a uniform budget to the whole problem. A complex problem decomposed into one simple sub-problem (500 tokens), two moderate sub-problems (1,500 tokens each), and one complex sub-problem (3,000 tokens) would consume approximately 6,500 tokens total — less than the 8,000 tokens a monolithic approach might consume, and with better-structured reasoning where easy aspects don't receive unnecessary depth and hard aspects don't get shortchanged.

## Algorithm for the Output Document

1. Restate the user's question, constraints, and evidence standard. Identify the question's scope — what domains does it touch, what kinds of analysis does it require, and what would constitute a satisfactory answer?

2. Decompose the question into 3–5 sub-problems. Apply decomposition principles: sub-problems should be as independent as possible (minimal overlap in what they analyze), collectively exhaustive (together they cover the full question), and domain-aligned (each falls cleanly into one reasoning domain). Document the decomposition rationale — why these sub-problems, why they're independent, and what difficulty level each warrants based on its analytical demands. If sub-problems have dependencies (A's analysis depends on B's conclusion), note them explicitly and sequence rather than parallelizing.

3. For Sub-Problem 1, identify its reasoning domain and select the best-fit strategy from the Vidbyte catalog. Document the selection with a brief justification. Apply the strategy's algorithm: restate the sub-problem with its specific constraints, apply the core move, produce numbered reasoning items proportionate to the sub-problem's difficulty rating, record assumptions and uncertainty, and synthesize a sub-conclusion. Keep the reasoning focused — do not generate 50 items for a sub-problem that can be answered in 15.

4. Repeat Step 3 for Sub-Problems 2 through N, each starting from a clean reasoning context (uncontaminated by the previous sub-problem's reasoning). Apply the selected strategy independently for each sub-problem. The parallelism is in the conceptual structure — each sub-problem's analysis stands alone and does not depend on or reference the detailed reasoning of other sub-problems.

5. After all sub-problems are analyzed, identify cross-cutting interactions and dependencies. Note tensions where sub-conclusions point in different directions (e.g., the market sizing says the opportunity is large, but the competitive analysis says entry would be unprofitable). Note reinforcements where sub-conclusions align. Note any dependencies that became apparent during analysis but were not identified during decomposition.

6. Synthesize the sub-conclusions into an integrated answer to the original question. The synthesis is a reasoning act — it identifies how each sub-conclusion contributes to the overall answer, resolves tensions between sub-conclusions where possible, and flags unresolved tensions where they remain. The synthesis should show how the pieces fit together, not just restate each piece.

7. Produce a final answer that integrates the synthesis into a coherent response. Flag areas of low confidence or unresolved tension. If certain sub-problems yielded high-confidence conclusions while others were inconclusive, the final answer should reflect that mixed confidence rather than presenting an averaged confidence.

8. Write the complete trace to `memory/{question_name}.md` with sections: Question, Meta-Strategy, Decomposition Rationale, each sub-problem's analysis (with Sub-Problem description, Strategy, Difficulty, and Scratchpad), Interactions and Dependencies, Synthesis, and Final Answer.

## Implementation Details

Parallel thinking traces are grounded in research on reasoning efficiency and overthinking prevention. The overthinking phenomenon — where language models generate excessive reasoning tokens that don't improve answer quality — has been documented across multiple model families and benchmark types. The core mechanism is that autoregressive generation incentivizes elaboration: each token is conditioned on all previous tokens, creating a natural tendency toward longer outputs where later tokens reinforce, qualify, or extend earlier ones, even when the earlier reasoning was already sufficient. This is not a model failure per se — it's a structural property of autoregressive generation that produces wasted computation and, in some cases, actively degrades accuracy by introducing confusion and diluting the signal from the strongest reasoning steps.

The S-GRPO framework (Sequence-aware Group Relative Policy Optimization) directly addresses this by training models to prefer concise, high-quality reasoning over longer, lower-quality reasoning. The key innovation is a reward function that jointly optimizes for answer correctness and reasoning conciseness, so the model learns to recognize when further reasoning would be redundant and to stop. The empirical results — 35.4% to 61.1% sequence length reduction with simultaneous accuracy gains of 0.72 to 6.08 percentage points — demonstrate that conciseness and quality are not in tension when the model is explicitly trained to balance them. For parallel thinking traces, this finding validates the core design principle: allocate reasoning depth where it improves the answer, and reasoning economy where it doesn't.

The REA-RL framework (Reasoning-Enhanced Actor-Critic with Reinforcement Learning) introduced a complementary mechanism: a reflection model that evaluates each reasoning step's quality and decides whether revision is needed. The reflection model is trained to distinguish steps that are correct and complete (no revision needed) from steps that are incorrect or incomplete (revision needed), and to only trigger the revision process for the latter. This selective approach reduces inference costs by 36% without accuracy loss because it eliminates the default practice of revising all steps regardless of quality. For parallel thinking traces, this informs the sub-problem difficulty calibration: sub-problems rated as "simple" receive reasoning that assumes the basic analysis is likely correct and doesn't need iterative refinement, while sub-problems rated as "complex" receive deeper reasoning that includes checks and potential revision.

The Budget-Adaptive Curriculum approach demonstrated the importance of dynamic difficulty assessment. In standard training, problems are assumed to have uniform difficulty and receive uniform reasoning budgets. The budget-adaptive approach instead assesses each problem's difficulty and allocates budget accordingly, achieving up to 8.3% accuracy gains under tight budgets while cutting total token consumption by 34%. This finding directly maps to the difficulty calibration in parallel thinking traces: each sub-problem receives a difficulty rating (simple, moderate, complex) that determines its approximate reasoning budget. Simple sub-problems target ~500–1,000 tokens, moderate sub-problems target ~1,000–2,500 tokens, and complex sub-problems target ~2,500–4,000 tokens. These ranges are guidelines, not hard limits — the actual budget should adapt to the sub-problem's real complexity.

The overthinking threshold research provides empirical grounding for these budget ranges. Analysis of reasoning traces across model families suggests that easy problems (those answerable through straightforward knowledge application or single-step inference) typically reach diminishing returns at approximately 2,000 tokens — beyond this point, additional reasoning rarely changes the answer. Hard problems (those requiring multi-step synthesis, cross-domain integration, or resolution of competing considerations) may benefit from up to approximately 8,000 tokens of reasoning. Parallel decomposition exploits this by giving each sub-problem a budget proportionate to its individual difficulty rather than applying the hard-problem budget to the entire composite question. A problem decomposed into one simple, two moderate, and one complex sub-problem would consume roughly 6,500 tokens total — less than the 8,000 tokens a monolithic approach might allocate, and with each sub-problem receiving depth calibrated to its needs rather than uniform depth.

## Output Information

Write the scratchpad as Markdown in `memory/{question_name}.md` at the repository root before responding to the user.

Include this scale note near the top of the file: "Scale: adaptive — each sub-problem receives reasoning depth proportionate to its difficulty. Simple sub-problems target ~500–1,000 tokens, moderate sub-problems ~1,000–2,500 tokens, complex sub-problems ~2,500–4,000 tokens. Total trace typically targets 3,500–8,000 tokens across all sub-problems and synthesis, adapting to the real complexity of the question."

Use numbered scratchpad items within each sub-problem's analysis for scanability, but treat the number target as approximate and difficulty-calibrated — a simple sub-problem may have 10–20 numbered items, while a complex one may have 40–60.

Keep all scratchpad content public, inspectable, and concise enough per line that a reviewer can compare sub-problem analyses and verify the decomposition. After writing the file, respond with the path, decomposition summary (sub-problems and strategies used), synthesis summary, and any noted interactions or unresolved tensions.

## Specify Files And Length And Structure Of Output

Write the artifact to `memory/{question_name}.md` at the repository root, using the literal `memory` directory name.

Structure the file with the sections: Question, Meta-Strategy, Scale, Decomposition Rationale, each Sub-Problem's analysis (with Sub-Problem header, Strategy, Difficulty, and Scratchpad), Interactions and Dependencies, Synthesis, and Final Answer.

Each Sub-Problem section should contain: a restatement of the sub-problem, the selected strategy with justification, the difficulty rating with brief rationale, a Scratchpad with numbered reasoning items, recorded assumptions and uncertainty, and a Sub-Conclusion that states the sub-problem's answer in a concise, comparable format.

The Interactions and Dependencies section should identify: tensions between sub-conclusions (where they point in different directions), reinforcements (where they align), dependencies discovered during analysis, and any sub-problems whose conclusions modify or qualify other sub-problems' conclusions.

The Synthesis section should integrate sub-conclusions into a coherent response to the original question, showing how the pieces fit together rather than merely restating them. Flag areas of low confidence or unresolved tension.

If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the difficulty-calibrated budget approximate.

## Things Not to Do

- Do not generate a monolithic reasoning chain and label sub-sections as sub-problems. The sub-problem analyses must be genuinely independent — each starts from a clean reasoning context and applies its strategy without reference to the detailed reasoning of other sub-problems. If the sub-problems are just sections of one long reasoning chain, the trace is not parallel thinking.
- Do not assign the same difficulty rating to all sub-problems unless they genuinely warrant it. The budget-adaptive principle requires that simple sub-problems receive economical reasoning and complex sub-problems receive deeper reasoning. Uniform difficulty ratings produce either overthinking on easy sub-problems or underthinking on hard ones.
- Do not overthink easy sub-problems. A factual question that can be answered in 10 numbered items should not receive 50. The goal of parallel thinking is to eliminate wasted reasoning, not to redistribute it across sub-problems. If a sub-problem is simple, reason through it efficiently and move on.
- Do not underthink hard sub-problems. A complex analytical question that genuinely needs 50 reasoning items to explore competing hypotheses, evaluate evidence, and test assumptions should receive those 50 items. Efficiency is about eliminating waste, not truncating necessary reasoning.
- Do not synthesize by simply concatenating sub-conclusions. The synthesis must identify how sub-conclusions combine and interact — tensions, reinforcements, qualifications, and cross-cutting patterns. A synthesis that reads "Sub-problem 1 found X, Sub-problem 2 found Y, Sub-problem 3 found Z" without showing how X, Y, and Z relate to each other is not a synthesis.
- Do not hide dependencies between sub-problems. If during analysis you discover that Sub-Problem 3's conclusion depends on Sub-Problem 1's conclusion, note this in the Interactions and Dependencies section and explain why it wasn't identified during decomposition. Transparency about dependencies is more valuable than claiming false independence.
- Do not force decomposition on problems that are fundamentally monolithic. Some questions resist sensible decomposition — their pieces only make sense in relation to each other, and analyzing them separately produces fragmented, misleading conclusions. If the problem resists decomposition after genuine effort, document the attempt and fall back to running the single best-fit strategy on the whole problem.
- Do not write the trace to a location other than `memory/{question_name}.md` at the repository root. Traces must be discoverable and auditable in the standard Vidbyte memory location.
