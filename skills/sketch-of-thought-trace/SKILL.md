---
name: sketch-of-thought-trace
description: >
  Use this skill when the user invokes /sketch-of-thought-trace or asks for a default public reasoning trace using Sketch-of-Thought.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Sketch-of-Thought as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by compressed sketch-style reasoning with minimal tokens per step instead of a generic response.
---

# Sketch-of-Thought Reasoning Trace

## Goal
Use Sketch-of-Thought to answer the user's question through compressed sketch-style reasoning with minimal tokens per step, not through a generic checklist or interchangeable trace.
The trace should generate reasoning as compressed insights in sketch format ΓÇö each step is a dense note rather than a complete sentence, prioritizing information density over fluency, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Sketch-of-Thought useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent
Sketch-of-Thought trace is invoked when the user wants reasoning that prioritizes information density over fluency — when the goal is to capture the essential logical structure of the analysis in the fewest possible tokens, even at the cost of grammatical completeness. Standard chain-of-thought produces full-sentence reasoning that includes substantial linguistic overhead — connectives, hedging, and restatement — that Sketch-of-Thought strips away to produce compressed, notation-heavy reasoning steps a knowledgeable reader can parse quickly. This is not "lazy reasoning"; it is reasoning optimized for review speed and token efficiency, rooted in the cognitive psychology finding that expert reasoners think in compressed, symbolic formats rather than full prose.

A user would select this trace over a generic trace when review throughput matters — when the trace will be read by domain experts who can parse abbreviated notation faster than full prose, when token costs are a binding constraint, or when the reasoning needs to fit within a strict character limit for downstream processing. The strategy also serves as a deliberate counterweight to the tendency of LLMs to produce verbose reasoning that buries the logical structure under exposition. By enforcing a sketch format, the trace forces the model to identify what is genuinely essential — if a reasoning step cannot be expressed compactly, it may not be well-enough understood to warrant inclusion. The final answer is always expanded into clear prose, so the sketch serves as the efficient intermediate representation while the final artifact remains accessible to non-expert readers.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Sketch-of-Thought move: produce minimal sketch-style reasoning steps with high information density, using abbreviations and structural formatting instead of full sentences.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Sketch-of-Thought is a cognitive psychology-inspired paradigm that guides models to produce minimal, sketch-style intermediate reasoning steps rather than full verbalizations. Like Chain of Draft, it challenges the premise that reasoning quality correlates with output length. The approach is rooted in the psychological finding that expert reasoners often think in compressed, notation-heavy formats rather than full prose. Research from 2024 demonstrates that sketch-style reasoning preserves answer quality while substantially reducing token consumption, making it particularly valuable for cost-sensitive and latency-sensitive applications.
It should give the output document a visible compressed sketch steps with abbreviations, notation, and structural formatting that maximizes information per token, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "produce minimal sketch-style reasoning steps with high information density, using abbreviations and structural formatting instead of full sentences" and when the final answer needs efficient reasoning that prioritizes substance over verbosity while remaining auditable.
A strong Sketch-of-Thought trace maximizes information density, uses structural shortcuts effectively, and still produces a clear final answer.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then plan the sketch structure ΓÇö what key points must be captured in minimal form.
2. Generate sketch-style reasoning steps, each as a compressed insight using abbreviations, notation, and structural formatting rather than full sentences.
3. For each sketch step that is too compressed to audit, add a minimal expansion inline without reverting to full prose.
4. Review the sketch chain for completeness ΓÇö ensure no critical reasoning step was lost to compression.
5. Synthesize the completed trace into a full final answer, expanding the sketch into clear prose while preserving the reasoning structure.

## Implementation Details
Sketch-of-Thought is grounded in cognitive psychology research on expert reasoning formats, synthesized and formalized for LLM prompting by Nayak et al. (2024) in "Sketch of Thought: Efficient Reasoning with Minimal Intermediate Tokens." The paper demonstrated that prompting models to produce compressed, notation-heavy intermediate steps — akin to how expert mathematicians and programmers think in symbols rather than prose — preserves final answer quality while reducing intermediate token consumption by 40-70% compared to full-sentence chain-of-thought. Related work on Chain of Draft (Xu et al., 2024) independently validated the same finding: minimal per-step tokens produce answers as accurate as verbose ones.

The psychological basis is the finding from expertise research (Chi, Glaser, & Farr, 1988; Ericsson & Smith, 1991) that experts encode problems in compressed, domain-specific representations that capture the deep structure while discarding surface detail. A chess grandmaster sees a board position as a compressed pattern, not as a sentence describing each piece; a physicist reasons with equations and diagrams, not with paragraphs of prose. Sketch-of-Thought applies this insight to LLM reasoning by instructing the model to produce intermediate steps as compressed notes — using abbreviations, symbols, arrow notation, and structural formatting — rather than as grammatical sentences. The model still reasons at the same depth, but the output format eliminates the linguistic overhead that standard CoT includes.

For Vidbyte reasoning traces, Sketch-of-Thought requires each numbered step to be a compressed insight — typically 5-15 words rather than full sentences — using abbreviations (w/ for "with," b/c for "because"), symbolic notation (→ for implication, ∴ for conclusion), and structural formatting (indentation, bullets, tables) to maximize information per token. Steps that are genuinely too compressed to audit should receive minimal inline expansion without reverting to full prose. The final answer must be expanded into clear, grammatical prose that non-expert readers can follow — the sketch is the efficient intermediate, not the final communication. The trace should demonstrate that no critical reasoning step was lost to compression; the sketch must be complete even if terse.

The broader context includes work on token efficiency in language models and the finding that many reasoning tokens in standard CoT are information-theoretically redundant. Sketch-of-Thought directly addresses this redundancy by changing the output format rather than the reasoning process, making it complementary to other strategies — a Focused CoT trace could also use sketch-style notation, and a Contrastive CoT trace could present contrastive pairs in compressed format.

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
- Do not produce a sketch that is so compressed it becomes unverifiable — if a reviewer who understands the domain cannot reconstruct the reasoning from the sketch, the compression has gone too far and defeats the audit purpose.
- Do not use abbreviations that are ambiguous or inconsistent — "eff" cannot mean "efficiency" in one step and "effective" in the next; the sketch must use a consistent shorthand vocabulary throughout the trace.
- Do not forget to expand the final answer into full prose — the sketch is the intermediate format; the final answer delivered to the user must be in clear, grammatical language accessible to non-experts.
- Do not compress reasoning by simply dropping steps — compression should remove linguistic overhead, not logical content; every inferential move present in a full-prose trace should have a compressed equivalent in the sketch.
- Do not use notation that is specific to one domain without defining it — if the trace uses mathematical or domain-specific symbols, their meaning must be inferable from context or briefly defined.
- Do not produce a sketch that is shorter than the original question — if the entire trace is briefer than the user's query, it likely omitted essential reasoning and does not constitute a meaningful analysis.
- Do not present the sketch as the final user-facing output — the trace file includes both the sketch (for audit) and the expanded answer (for communication), and the user-visible response must prioritize the expanded version.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
