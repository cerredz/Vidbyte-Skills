---
name: contrastive-cot-trace
description: >
  Use this skill when the user invokes /contrastive-cot-trace or asks for a default public reasoning trace using Contrastive Chain-of-Thought.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Contrastive Chain-of-Thought as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by learning from both valid and invalid reasoning demonstrations instead of a generic response.
---

# Contrastive Chain-of-Thought Reasoning Trace

## Goal
Use Contrastive Chain-of-Thought to answer the user's question through learning from both valid and invalid reasoning demonstrations, not through a generic checklist or interchangeable trace.
The trace should produce a valid reasoning path alongside contrastive invalid versions for each major step, show why each mistake is wrong, and synthesize the corrected chain, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make contrastive chain-of-thought useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent
Contrastive Chain-of-Thought trace is invoked when the primary risk is not that the model will produce no reasoning, but that it will produce reasoning that feels correct while containing subtle logical errors that a single-pass approach cannot detect. Standard CoT generates one path and follows it; CCoT generates one valid path and at least one deliberately invalid alternative at each step, surfacing the specific failure mode that would otherwise remain invisible. This makes the strategy uniquely suited for problems where common reasoning pitfalls are known — mathematical fallacies, causal inversions, definitional confusions, and scope errors — because the contrastive pair explicitly names and neutralizes them.

A user would select this trace over a generic trace when the domain has well-documented reasoning traps or when the stakes of an undetected error are high enough to justify the additional tokens spent on invalid demonstrations. The strategy is backed by empirical findings showing that seeing what-not-to-do improves model performance more than seeing only what-to-do — the contrastive signal provides a sharper decision boundary between correct and incorrect reasoning patterns. By externalizing both valid and invalid reasoning, the trace also gives the reviewer a richer audit artifact: they can verify not just that the positive path makes sense, but that the identified negative paths are genuinely wrong and correctly diagnosed, creating a more complete picture of the reasoning space.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Contrastive Chain-of-Thought move: generate both valid and invalid reasoning for each step, explain why invalid paths fail, and build the answer from corrected reasoning.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Contrastive Chain-of-Thought provides both valid and invalid reasoning demonstrations, guiding the model to reason step-by-step while reducing reasoning mistakes. Unlike standard CoT which only shows correct reasoning, CCoT explicitly models what-not-to-do ΓÇö for each major reasoning step, a contrastive invalid version is generated and explicitly corrected. Research shows improvements of 9.8 points on GSM-8K and 16 points on Bamboogle compared to conventional CoT. The mechanism works by forcing the model to distinguish correct from incorrect reasoning patterns rather than simply following a single correct template.
It should give the output document a visible paired valid/invalid reasoning with explicit corrections at each step, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "generate both valid and invalid reasoning for each step, explain why invalid paths fail, and build the answer from corrected reasoning" and when the final answer needs explicit error awareness and corrected reasoning that learns from demonstrated mistakes.
A strong Contrastive Chain-of-Thought trace shows plausible mistakes and their corrections, making the final reasoning more robust by preemptively addressing failure modes.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then generate the primary valid reasoning path step by step.
2. For each major reasoning step, generate a contrastive invalid version ΓÇö a plausible but incorrect approach ΓÇö and explain exactly why it fails.
3. Show the correction explicitly: how the invalid step is fixed, what principle or check prevents the error, and how the corrected reasoning advances.
4. After all contrastive pairs, synthesize the corrected chain into a clean reasoning path free of the identified errors.
5. Record both valid and invalid reasoning in the trace, showing how error awareness improves the final answer's reliability.

## Implementation Details
Contrastive Chain-of-Thought was introduced by Chia et al. (2023, EMNLP Findings) in "Contrastive Chain-of-Thought Prompting," which demonstrated that providing models with both valid and invalid reasoning examples significantly reduces reasoning errors compared to standard CoT prompting that only shows positive examples. The paper reported gains of 9.8 accuracy points on GSM-8K (from 55.0 to 64.8) and 16 points on Bamboogle (from 43.0 to 59.0) compared to conventional CoT, establishing that contrastive demonstrations provide a stronger supervisory signal than positive-only ones. The mechanism hinges on the model learning to distinguish between reasoning patterns that lead to correct and incorrect conclusions, rather than simply imitating a correct pattern without understanding why it is correct.

The technical architecture of CCoT involves pairing each reasoning step with a counterfactual: "Here is a valid way to think about this step" alongside "Here is a way you might mistakenly think about this step, and here is why it fails." This is structurally different from self-consistency or majority voting, which generate multiple valid paths and select the most common answer — CCoT deliberately generates invalid paths to make the boundaries of correct reasoning explicit. Zhang et al. (2023, "Automatic Chain of Thought Prompting in Large Language Models," ICLR) further explored how automated generation of reasoning demonstrations can scale CCoT beyond hand-crafted examples, showing that models can generate their own contrastive pairs given appropriate instructions.

For Vidbyte reasoning traces, CCoT applies to any problem where the model might be drawn toward a plausible-but-incorrect shortcut. The trace must generate at least one invalid alternative per major reasoning step, explain the specific error with precision (not vague hand-waving), and show how the correction fixes the identified flaw. The invalid demonstrations should be genuinely tempting — straw-man errors that no one would actually make defeat the purpose. The contrastive pairs should be clearly labeled (e.g., "Valid Path" and "Invalid Path") and the correction should reference a specific principle or check that prevents the error, not just a restatement of the correct path.

The broader theoretical context includes work on negative mining and hard negative examples in contrastive learning (Chen et al., 2020, SimCLR), which showed that the quality of negative examples determines the quality of learned representations. CCoT applies this same principle to reasoning: the more plausible the incorrect alternative, the more informative the contrastive signal. Recent work on self-contrastive decoding and contrastive decoding (Li et al., 2023) further validates that contrasting correct and incorrect model outputs is a powerful mechanism for improving generation quality across domains.

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
- Do not use straw-man errors that no reasonable person would make — invalid demonstrations must be genuinely plausible mistakes that a competent reasoner might actually commit, or the contrastive signal is wasted.
- Do not present a valid path and an invalid path without explicitly explaining what distinguishes them — the trace must name the principle, check, or test that separates correct from incorrect reasoning at each step.
- Do not generate more than one invalid alternative per step unless the problem genuinely has multiple distinct failure modes; flooding the trace with weak invalid paths dilutes the contrastive signal and wastes tokens.
- Do not let the invalid paths overshadow the valid path in the final synthesis — the corrected chain should be presented as the clean reasoning artifact, not buried under layers of error analysis.
- Do not confuse Contrastive Chain-of-Thought with reflection or self-correction — CCoT generates both paths deliberately as part of a single forward pass, not as a multi-turn revision process.
- Do not treat contrastive pairs as optional decoration; if a major reasoning step has no identified failure mode, either the step is trivial enough to skip or the analysis has not probed deeply enough.
- Do not correct an error by just showing the right answer without explaining the root cause — the trace must identify whether the error was logical, factual, definitional, or procedural so the reviewer understands the failure taxonomy.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
