---
name: self-rag-trace
description: >
  Use this skill when the user invokes /self-rag-trace or asks for a default public reasoning trace using Self-RAG.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Self-RAG as the actual structure of the analysis.
  The strategy couples retrieval with self-reflection to iteratively refine generated content — the model employs special signals indicating
  when to retrieve, whether the retrieved content is relevant, and whether the final output is supported by retrieved evidence.
  Retrieval becomes a conditional, trained behavior rather than a fixed pipeline step.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by iterative retrieval decisions with explicit relevance and support verification.
---

# Self-RAG Reasoning Trace

## Goal
Use Self-RAG to answer the user's question through iterative retrieval decisions coupled with self-reflection, not through a fixed retrieval pipeline or generic response.
The trace should interleave reasoning with explicit retrieval signals, relevance assessments, and support verification, so the visible reasoning shows when and why information was retrieved and whether it was useful.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on retrieval decisions, relevance assessments, and support checks, because those artifacts make self-rag useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming when retrieval is needed but inaccessible, when retrieved information contradicts existing knowledge, and when claims are only partially supported.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Self-RAG move: reason iteratively, emit retrieval signals when information is needed, assess relevance of retrieved content, and verify whether claims are supported.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Self-RAG is a reasoning strategy that couples retrieval with self-reflection to iteratively refine generated content.
Unlike always-retrieving or never-retrieving approaches, Self-RAG makes retrieval a conditional, learned behavior — the model employs special signals to indicate when to retrieve, whether the retrieved content is relevant, and whether the final output is supported by retrieved evidence.
Retrieval becomes a decision point within the reasoning process rather than a fixed pipeline step that runs before or after reasoning.
It should give the output document a visible decision trail of when retrieval was triggered, what was retrieved, whether it was relevant, and whether final claims are supported, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "reason iteratively, signal when to retrieve, assess relevance of retrieved content, and verify whether claims are supported by evidence" and when the final answer needs explicit evidence grounding with auditable support checks.
A strong Self-RAG trace shows clear retrieval decisions, honest relevance assessments, and transparent support verification that distinguishes well-supported from partially-supported claims.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then begin iterative reasoning.
2. At each reasoning step, evaluate whether additional information is needed. When needed, emit a [RETRIEVE] signal describing what specific information would help and why.
3. For each retrieval, assess relevance: [RELEVANT] if the information directly addresses the need, [PARTIALLY-RELEVANT] if it addresses it partially, [IRRELEVANT] if it does not help.
4. After incorporating retrieved information into reasoning, verify support: [SUPPORTED] if the claim is backed by retrieved evidence, [PARTIALLY-SUPPORTED] if partially backed, [UNSUPPORTED] if it relies on reasoning alone without evidence backing.
5. Continue this cycle until all sub-questions are addressed with appropriate evidence grounding.
6. Final verification pass: review all claims and flag any that need caveats about evidence quality or accessibility limitations.
7. Record assumptions, missing evidence, and confidence changes, noting specifically where retrieval was needed but information was inaccessible.
8. Synthesize the completed trace into the final answer, showing how the conclusion follows from the retrieval-augmented reasoning and what evidence supports each major claim.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should interleave reasoning items with retrieval signals ([RETRIEVE], [RELEVANT]/[IRRELEVANT], [SUPPORTED]/[PARTIALLY]/[UNSUPPORTED]) as inline annotations within the numbered reasoning.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, and a support-level summary for major claims.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, interleave reasoning items with retrieval signal annotations. Include a Support Summary subsection at the end of Scratchpad that catalogs which claims are fully supported, partially supported, or unsupported.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
