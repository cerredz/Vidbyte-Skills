---
name: agent-as-judge-trace
description: >
  Use this skill when the user invokes /agent-as-judge-trace or asks for a default public reasoning trace using Agent-as-Judge.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Agent-as-Judge as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by step-level trajectory evaluation with intermediate scoring and critique instead of a generic response.
---

# Agent-as-Judge Reasoning Trace

## Goal
Use Agent-as-Judge to answer the user's question through step-level trajectory evaluation with intermediate scoring and critique, not through a generic checklist or interchangeable trace.
The trace should produce reasoning step-by-step while a judge persona evaluates each step for validity, identifies weaknesses, and suggests corrections before the next step proceeds, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Agent-as-Judge useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent
Agent-as-Judge trace is invoked when the reasoning process itself needs to withstand internal scrutiny before the answer is finalized — not just when you want a correct answer, but when you need the path to that answer to be demonstrably valid at every step. Standard chain-of-thought can accumulate subtle errors that go undetected until they cascade into a wrong conclusion; Agent-as-Judge prevents this by inserting a formal evaluation checkpoint after each major reasoning step, assigning a validity score and flagging weaknesses before the next step can proceed. This makes it particularly valuable for high-stakes reasoning where an undetected early mistake would silently invalidate everything that follows.

A user would select this trace over a generic trace when the problem involves multi-step deduction, legal or scientific reasoning, or any domain where a single erroneous intermediate conclusion could propagate undetected through a long chain. The strategy is grounded in research showing that LLMs, when acting as judges of their own output, can catch errors they would otherwise miss in a purely generative mode — the act of evaluation engages a different cognitive mechanism than the act of generation. By making every step pass a validity threshold before advancing, the trace produces reasoning that is not just correct in outcome but defensible at every intermediate point, creating an audit trail that a reviewer can inspect without needing to reverse-engineer the model's hidden deliberation.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Agent-as-Judge move: generate a primary reasoning path, then insert judge evaluations after each major step scoring validity, critiquing weaknesses, and suggesting corrections.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Agent-as-Judge represents an extension of the LLM-as-judge paradigm into autonomous agent evaluation, where the reasoning trajectory matters as much as the final answer. Unlike outcome-only evaluation, the judge assesses the journey ΓÇö whether each reasoning step is valid, well-supported, and progressing toward the answer. By providing intermediate critiques, the judge facilitates improvement within the reasoning process itself. Research from 2024 demonstrates that intermediate evaluation with explicit scoring improves the reliability of multi-step reasoning by catching errors early before they compound.
It should give the output document a visible reasoning steps interleaved with judge scores, critiques, and correction suggestions, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "generate a primary reasoning path, then insert judge evaluations after each major step scoring validity, critiquing weaknesses, and suggesting corrections" and when the final answer needs validated reasoning where each step has been scrutinized and corrected before proceeding.
A strong Agent-as-Judge trace shows the judge's evaluation at each step, records corrections in real-time, and demonstrates that the final answer survived rigorous scrutiny.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then generate the first reasoning step toward the answer.
2. After each major reasoning step, have the judge evaluate it: assign a validity score (1-5), identify specific weaknesses or gaps, and suggest corrections if the score is below 4.
3. Apply any judge-suggested corrections to the reasoning step before proceeding to the next step, continuing the reason-judge-correct cycle.
4. After the final answer, provide an overall trajectory assessment from the judge, summarizing the reasoning quality and any lingering concerns.
5. Synthesize the completed trace into the final answer, showing how the conclusion survived step-by-step evaluation and what corrections were applied.

## Implementation Details
The LLM-as-Judge paradigm was established by Zheng et al. (2023, NeurIPS) in "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena," demonstrating that strong LLMs can serve as scalable evaluators approaching human agreement levels. This foundational work showed that LLM judges achieve over 80% agreement with human evaluators on response quality assessments, establishing the viability of using a model to evaluate its own reasoning. The Agent-as-Judge extension, explored by Wang et al. (2024) in "Agent-as-Judge: Evaluate Agents with Agents," advances this paradigm further by shifting from outcome-level judgment to step-level trajectory evaluation, where the judge assesses the quality of each reasoning action within an agent's behavioral sequence rather than just the final output.

Empirically, step-level evaluation has been shown to catch errors that outcome-only evaluation misses entirely. Research on process supervision by Lightman et al. (2024, OpenAI) demonstrated that training models with per-step human feedback labels yields significantly better performance on challenging reasoning benchmarks like MATH compared to outcome-only supervision, with the process-supervised model outperforming the outcome-supervised model by a wide margin on the most difficult problems. The mechanism works by decomposing the evaluation problem: rather than judging a long reasoning chain as a single unit, each step is evaluated against local criteria — logical validity, factual grounding, and relevance to the question — before the next step builds upon it. This prevents the compounding error problem where early mistakes are masked by later reasoning that appears plausible.

For Vidbyte reasoning traces, Agent-as-Judge applies directly to any multi-step analysis where intermediate correctness matters. The judge persona in the trace should assign explicit 1-5 validity scores, cite specific weaknesses (not vague complaints), and provide actionable corrections that are then applied before the next reasoning step. The trace should show the full cycle — reason, judge, correct, advance — at each step, making the trajectory transparent. This is not the same as self-critique or reflection; the judge is a structured evaluator applying explicit criteria, not a vague second pass. The trace must show the judge's score changing across steps to reflect growing confidence or emerging concerns, providing the reviewer with a quantitative signal of reasoning quality at each checkpoint.

The broader research context includes work on constitutional AI (Bai et al., 2022, Anthropic) and debate-style reasoning (Du et al., 2023) which similarly use model self-evaluation as an alignment and quality mechanism. Agent-as-Judge synthesizes these threads by combining step-level scoring with corrective feedback in a single integrated trace, making it suitable for reasoning problems where the intermediate path is as important as the final destination.

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
- Do not let the judge assign uniformly high scores (4-5) at every step without substantive critique — a judge that never finds weaknesses is not actually judging, and the trace loses all value as an audit mechanism.
- Do not correct a step without showing what was wrong and why the correction resolves it — corrections without explanations are indistinguishable from the original reasoning and teach nothing to the reviewer.
- Do not skip the judge evaluation on any major reasoning step; every significant inferential move must be scored and critiqued before the next step proceeds, otherwise error propagation risks return.
- Do not merge the judge's voice with the reasoner's voice — the judge must be clearly distinguished in the trace (through labeling, bolding, or block quotes) so the reviewer can see whose reasoning is whose.
- Do not treat a validity score of 3 as acceptable to advance without correction; scores below 4 should trigger explicit corrections before proceeding, as the strategy's value lies in catching and fixing errors early.
- Do not allow the final answer to bypass the trajectory assessment — the overall synthesis must reference which steps scored lowest, what corrections were applied, and what residual uncertainty remains.
- Do not reduce the judge's evaluation to a simple "looks good" affirmation; every evaluation must cite a specific criterion (logical validity, factual accuracy, relevance, completeness) that was assessed.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
