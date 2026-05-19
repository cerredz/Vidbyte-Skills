---
name: self-consistency-trace
description: >
  Use when the user invokes /self-consistency-trace or asks for a standalone
  reasoning trace using Self-Consistency (Wang et al., ICLR 2023). Samples
  N=5 diverse reasoning paths from a base strategy via temperature decoding,
  then majority-votes the most consistent answer. Produces a durable audit
  trail in memory/{question_name}.md showing all five paths and the vote tally.
  Use this when a single reasoning path feels unreliable and you want consensus
  across diverse reasoning chains to surface the most robust answer.
---

# Self-Consistency Reasoning Trace

## Goal

Use Self-Consistency to answer the user's question by sampling N=5 diverse reasoning paths and selecting the most frequent answer via majority vote, not through a single-path reasoning trace that puts all confidence in one decoding trajectory. The trace should generate five independent applications of the base reasoning strategy, each starting from a meaningfully different perspective, so that consensus across paths signals reliability and divergence signals areas where the problem admits multiple defensible conclusions. The goal is to create a public scratchpad that a reviewer can audit — comparing all five reasoning paths side by side, verifying the vote tally, and independently judging whether the consensus answer deserves the confidence it claims.

Each path applies the same base strategy's algorithm — restating the question, applying the core move, producing numbered reasoning items, recording assumptions and uncertainty, and synthesizing a final answer — but each path approaches from a different starting angle. Path 1 might emphasize causal structure, Path 2 a probabilistic framing, Path 3 an adversarial stress-test, Path 4 an outside-view baseline, and Path 5 a systems perspective. The diversity across paths is what gives the vote its power: if multiple independent reasoning trajectories converge on the same answer through different routes, that answer is more trustworthy than any single path's conclusion. The trace must make this convergence (or divergence) transparent and auditable, with the vote tally presented before the consensus answer so the reader sees the evidence before the conclusion.

## Intent

We run this trace because a single reasoning path is a single sample from a distribution — and sometimes that sample is wrong, not because the reasoning strategy is bad, but because the model committed to an early misstep and elaborated it consistently. Self-consistency addresses this by sampling multiple times from the distribution of possible reasoning chains and letting the aggregate signal identify the most reliable answer. The technique is particularly valuable for problems where there is a correct answer (math problems, diagnostic classification, logical deduction, factual questions) but where the reasoning pathway to that answer has many branches and any single path can go astray. By running N=5 paths and voting, we replace "the model said X" with "4 out of 5 reasoning paths converged on X through different routes," which is a stronger epistemic position.

This trace is designed for standalone use — the user invokes `/self-consistency-trace` when they specifically want the self-consistency technique applied to their problem, regardless of whether a meta-reasoner selected it automatically. The trace embeds the base strategy selection within its own algorithm, so the user doesn't need to specify a base strategy (though they can). The output is a complete audit trail that a reviewer can inspect: five numbered reasoning paths, each with its own scratchpad and final answer, followed by the vote tally and the consensus conclusion. The trace serves as both an answer to the question and a reliability assessment — the vote distribution (5-0, 4-1, 3-2, 2-2-1, or 1-1-1-1-1) communicates how much confidence the method places in its own answer.

## Instructions

Derive `{question_name}` from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using `self-consistency-trace` if no safe name remains.

Create the root `memory` directory when needed, then write or replace `memory/{question_name}.md` with this trace.

Start the file with the question, the base strategy used, a scale note, and a brief statement of what the trace will inspect across its five paths.

Build the trace by generating five independent reasoning paths. For each path, apply the base strategy's algorithm — restate the question, apply the core move, produce numbered reasoning items, record assumptions and uncertainty, and synthesize a final answer. Vary the starting angle explicitly across paths to produce genuine diversity: use causal framing for one path, probabilistic for another, adversarial for a third, outside-view baseline for a fourth, and systems or creative framing for a fifth. The diversity is what gives the vote its power.

After all five paths, extract the final answer from each as a concise, comparable statement. Group equivalent answers (same conclusion in different words counts as the same vote) and tally votes. Present the tally as a table. Identify the consensus answer — the answer with the most votes. If there is a tie or no answer receives more than one vote, report the divergence transparently.

End the file with the consensus answer (or divergence report) that follows from the vote tally.

## Background Information About The Reasoning Strategy

Self-Consistency (Wang et al., "Self-Consistency Improves Chain of Thought Reasoning in Language Models," ICLR 2023) is a decoding strategy that replaces greedy decoding in chain-of-thought prompting with temperature-based sampling and majority-vote aggregation. Instead of generating a single reasoning path by selecting the most probable token at each step, the model generates N diverse paths by sampling from the output distribution with non-zero temperature, extracts the final answer from each path, and selects the most frequent answer via majority (or plurality) vote.

The technique is grounded in the empirical observation that for reasoning tasks with a single correct answer, the model's output distribution has a specific structure: the correct answer tends to lie in a region of the answer space where many different reasoning paths converge, while incorrect answers are scattered across low-probability regions where few paths land on the same wrong answer. Majority vote exploits this structure by reading out the modal answer — the one that appears most frequently across diverse paths. This works because the model's reasoning errors are idiosyncratic (different paths make different mistakes) while correct reasoning converges (different paths find different valid routes to the same answer). If errors were systematic — all paths made the same mistake — the technique would offer no benefit; the empirical results demonstrate that this is not the case for the benchmarks tested.

The empirical gains are substantial and well-documented. On GSM8K (grade-school math word problems), self-consistency with N=40 paths improved accuracy from 56.5% (greedy decoding) to 74.4% — a gain of 17.9 percentage points (Wang et al., 2023, Table 1). On SVAMP (structure-varied arithmetic problems), the gain was 11.0 points. On AQuA (algebraic word problems), the gain was 12.2 points. The technique scales monotonically with the number of paths — accuracy increases with each additional path, with the steepest gains in the first 5–10 paths and diminishing returns beyond approximately 40 paths. For practical deployment, N=5 captures most of the gain while keeping inference cost manageable; N can be increased for high-stakes problems where marginal accuracy improvement justifies additional compute.

Self-consistency requires no additional training, no fine-tuning, and no architectural changes. It works with any model that supports temperature sampling and any reasoning strategy that produces a final answer extractable for comparison and voting. It is complementary to other reasoning improvements — chain-of-thought prompting provides the reasoning structure that self-consistency samples from, step-back prompting can improve the quality of each individual path, and retrieval augmentation can ground each path's reasoning in external evidence. The only requirement is that the temperature be set high enough (typically 0.5–1.0) to produce meaningfully different paths; at very low temperatures, paths become nearly identical and the technique degrades to single-path reasoning.

## Algorithm for the Output Document

1. Restate the user's question, constraints, and evidence standard. Identify the dominant reasoning domain (causal, diagnostic, decision, probabilistic, creative, adversarial, systems, analytic, strategic, temporal, or specialized) and select the base strategy whose core move most directly addresses the problem's dominant characteristic. Document the strategy selection with a brief justification.

2. Generate Path 1/5: Apply the base strategy's algorithm from a primary perspective — the most natural framing for the problem's dominant domain. Restate the question, apply the core move, produce numbered reasoning items, record assumptions and uncertainty, synthesize a final answer, and extract a concise answer statement for voting.

3. Generate Path 2/5: Apply the same base strategy from a different perspective. If Path 1 emphasized causal structure, Path 2 might emphasize probabilistic or outside-view framing. If Path 1 was analytical, Path 2 might be adversarial or stress-test oriented. The goal is diversity — a different starting angle that may lead through a different reasoning pathway.

4. Generate Path 3/5: Apply the base strategy from yet another angle — consider what perspectives Path 1 and Path 2 missed. If they were both analytical in different ways, try a systems-thinking or temporal framing. If they were both forward-looking, try a counterfactual or historical framing.

5. Generate Path 4/5: Apply the base strategy from a fourth distinct perspective. At this point, actively avoid repeating the framings used in Paths 1–3. Consider creative, lateral, or constraint-based approaches if they haven't been used yet. The value of additional paths comes from covering new reasoning territory.

6. Generate Path 5/5: Apply the base strategy from a fifth distinct perspective. By this point, aim to cover a perspective that would catch errors the first four paths might have missed — a devil's advocate framing, a systems-level check for second-order effects, or a base-rate anchoring that none of the earlier paths considered.

7. Extract the final answer from each path as a concise, comparable statement (1–3 sentences). Group equivalent answers — answers that express the same conclusion in different words count as the same vote. Tally the votes for each distinct answer. Present the tally as a table with columns for Answer, Paths Supporting, and Count.

8. Identify the consensus answer — the answer with the most votes. If there is a clear winner (3+ votes), present it as the consensus conclusion with the vote tally as supporting evidence. If there is a tie or no answer receives more than one vote, report the divergence, analyze which assumptions or evidence differences drove the split, and present the diversity of perspectives as the output rather than forcing a false consensus.

## Implementation Details

The self-consistency framework was introduced by Wang et al. (2023) at ICLR 2023 in the paper "Self-Consistency Improves Chain of Thought Reasoning in Language Models." The technique operates at the decoding layer: instead of the standard practice of greedy decoding (selecting the single highest-probability token at each generation step), self-consistency samples N independent outputs from the language model's decoder by using temperature-based sampling with a non-zero temperature parameter (typically in the range of 0.5–1.0). The temperature controls the diversity of the samples — higher temperatures produce more diverse paths by flattening the probability distribution, increasing the chance that lower-probability tokens are selected, while lower temperatures produce paths that are more similar to greedy decoding. The default of N=5 paths is chosen as a practical balance: it captures approximately 70–80% of the total accuracy gain achievable at N=40 while requiring only 12.5% of the inference cost.

The majority-vote (or plurality-vote) aggregation mechanism is the simplest and most widely used consensus method. Each sampled path produces a natural-language reasoning trace and a final answer; the final answer is extracted (typically by prompting the model to state its answer in a standardized format or by parsing the last line of the reasoning trace) and compared across paths. Answers that are semantically equivalent but phrased differently are grouped together; the grouping can be done by the model itself (prompting it to determine whether two answer statements express the same conclusion) or by a separate classifier. The answer with the most supporting paths is selected as the consensus. In cases where no answer receives a majority (the modal answer has fewer than floor(N/2)+1 votes), the plurality winner is reported with a note that consensus is weak, distinguishing a 5-0 alignment from a 3-2 split from a 2-2-1 or 1-1-1-1-1 divergence.

The technique's effectiveness is theoretically grounded in the structure of the model's output distribution for reasoning tasks. Wang et al. hypothesize that for tasks with a single correct answer, the model assigns higher aggregate probability mass to the correct answer than to any individual incorrect answer, even though a single greedy decoding may land on an incorrect answer due to a local probability peak. Sampling diversely explores the distribution, and the correct answer's higher aggregate mass manifests as higher frequency across samples. This hypothesis is supported by the empirical finding that accuracy increases monotonically with the number of samples — if the correct answer did not dominate the distribution, increasing samples would eventually reveal a different most-frequent answer, but this is not observed. The diminishing returns after ~40 paths suggest that by that point, the samples have adequately covered the high-probability regions of the distribution and additional samples primarily explore low-probability regions that add little new information to the aggregate.

Self-consistency requires no model modification and is compatible with any reasoning strategy that produces a final answer. It can be applied on top of standard chain-of-thought prompting, step-back prompting, retrieval-augmented generation, multi-agent debate, or any domain-specific reasoning strategy — including the full Vidbyte reasoning catalog — because it operates purely at the decoding level. The only operational requirement is that each path be generated independently with a new random seed (or sufficient temperature to produce effective independence), so that the paths explore different regions of the output distribution. Paths that are too similar provide no diversity benefit and effectively count as a single path repeated.

## Output Information

Write the scratchpad as Markdown in `memory/{question_name}.md` at the repository root before responding to the user.

Include this scale note near the top of the file: "Scale: default — aim for roughly 5,000 to 8,000 tokens across all five reasoning paths, with each path containing its own numbered scratchpad items, adapting to the real complexity of the question."

Use numbered scratchpad items within each path for scanability, but treat the number target as approximate and subordinate to usefulness. Each path should contain reasoning that is independently coherent — a reader should be able to read any single path and understand the reasoning, even if the path's conclusion differs from the consensus.

Keep all scratchpad content public, inspectable, and concise enough per line that a reviewer can compare paths side by side. After writing the file, respond with the path, selected strategy, scale note, consensus answer (with vote distribution), and any divergence notes if paths did not converge.

## Specify Files And Length And Structure Of Output

Write the artifact to `memory/{question_name}.md` at the repository root, using the literal `memory` directory name.

Structure the file with the sections: Question, Base Strategy, Scale, Path 1/5, Path 2/5, Path 3/5, Path 4/5, Path 5/5, Vote Tally, Consensus Answer, and Divergence Analysis (if applicable).

Each path section should contain its own Sub-Question Restatement, Scratchpad (with numbered reasoning items), Assumptions and Uncertainty, and Final Answer subsections. The Final Answer within each path should end with a concise answer statement formatted for comparison — typically a bolded or clearly demarcated sentence that can be extracted for the vote.

The Vote Tally section should present a table with columns: Answer (concise description), Paths Supporting (e.g., "Paths 1, 3, 5"), and Count. The table should be followed by a brief narrative interpretation of the tally — strong consensus (5-0, 4-1), weak consensus (3-2), or divergence (2-2-1, 1-1-1-1-1).

If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.

## Things Not to Do

- Do not generate only one reasoning path and call it self-consistency. The technique depends on diversity — if Path 2, Path 3, Path 4, and Path 5 are slight rewordings of Path 1, the trace provides no benefit and misleads the user about its reliability. Vary the starting perspective explicitly and ensure the reasoning in each path is substantively different.
- Do not force convergence when paths disagree. A 2-2-1 split that reflects genuine disagreement about assumptions or evidence is more informative than a 3-2 split manufactured by reinterpreting answers to force agreement. Report the tally as it is and analyze the divergence.
- Do not skip the vote tally table. The tally is the method's output — it tells the user how much confidence to place in the answer. A consensus answer without the tally is an opinion, not a self-consistency result.
- Do not apply self-consistency to problems where the value is in the diversity of perspectives, not in convergence on a single answer. For creative brainstorming, normative analysis where multiple valid frameworks yield different conclusions, or open-ended exploration, the technique is misapplied — the goal of these tasks is not to find one correct answer.
- Do not present consensus as certainty. A 5-0 vote means five paths from the same model agreed, not that the answer is ground-truth verified. Systematic errors — where the base strategy is ill-suited or the model has a consistent blind spot — can produce confident but wrong consensus.
- Do not extract answers from paths in a way that loses substantive differences. If Path 1 says "the cause is X through mechanism A" and Path 2 says "the cause is X through mechanism B," these may or may not be the same answer depending on whether the mechanism is central to the question. Consider whether differences in mechanism, confidence, scope, or framing make answers meaningfully distinct before grouping them.
- Do not use a base strategy without documenting it. The trace must name the strategy used for each path and briefly justify why it was selected, so a reviewer can judge whether the strategy was appropriate for the problem before evaluating the paths it produced.
- Do not write the trace to a location other than `memory/{question_name}.md` at the repository root. Traces must be discoverable and auditable in the standard Vidbyte memory location.
