---
name: cross-lingual-consistency-trace
description: >
  Use this skill when the user invokes /cross-lingual-consistency-trace or asks for a default public reasoning trace using Cross-Lingual Consistency.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Cross-Lingual Consistency as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by multilingual reasoning paths integrated through consistency voting instead of a generic response.
---

# Cross-Lingual Consistency Reasoning Trace

## Goal
Use Cross-Lingual Consistency to answer the user's question through multilingual reasoning paths integrated through consistency voting, not through a generic checklist or interchangeable trace.
The trace should reason through the problem independently in multiple languages, surface assumptions that differ across languages, and vote on the most consistent conclusion across language paths, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make Cross-Lingual Consistency useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent
Cross-Lingual Consistency trace is invoked when the user suspects that the answer to their question might be distorted by the linguistic biases embedded in English-dominant training data, and they want the reasoning stress-tested across multiple language representations. Monolingual reasoning can mask assumptions that are artifacts of English-language discourse patterns rather than universal truths about the problem — for example, a legal question reasoned in English may implicitly adopt common-law framing that a French or German reasoning path would challenge. This trace forces the model to reconstruct the problem from scratch in at least two additional languages, producing independent reasoning trajectories that either converge (increasing confidence) or diverge (revealing hidden assumptions).

A user would select this trace over a generic trace when the question touches on culturally embedded concepts, translation-sensitive definitions, or domains where linguistic framing affects analysis — comparative law, cross-cultural policy, international business, or any problem where the training data distribution might vary significantly by language. The research basis is the finding that LLMs encode knowledge differently across languages because training data is not uniformly distributed; reasoning in German may surface technical precision that English reasoning glosses over, while reasoning in Japanese may foreground relational dynamics that Western-centric reasoning backgrounds. By requiring cross-lingual agreement through majority voting, the trace produces answers that are robust to language-specific artifacts, which is valuable when the user needs conclusions that hold independent of the language in which the question was posed.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Cross-Lingual Consistency move: generate reasoning paths in multiple languages, compare conclusions across languages, and use majority voting to select the most consistent answer.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Cross-Lingual Consistency generates reasoning paths in multiple languages and integrates them through majority voting to elevate reasoning capabilities. Different languages have different training data distributions and linguistic biases ΓÇö reasoning across languages surfaces assumptions hidden in monolingual reasoning. This approach is particularly effective because an LLM's internal knowledge representations vary by language, meaning the same problem reasoned in English versus Chinese may expose different facets. Research from 2024 demonstrates 4.1-18.5% accuracy gains by diversifying the language of reasoning traces.
It should give the output document a visible reasoning paths in multiple languages, conclusion comparison table, and voting outcome, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "generate reasoning paths in multiple languages, compare conclusions across languages, and use majority voting to select the most consistent answer" and when the final answer needs validated conclusions that hold across linguistic perspectives with explicit handling of divergence.
A strong Cross-Lingual Consistency trace shows multilingual reasoning paths, makes cross-language differences visible, and demonstrates that the conclusion is robust across linguistic variation.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then generate the primary reasoning path in English.
2. Generate independent reasoning paths in 2 additional languages, reasoning from scratch in each rather than translating the English path.
3. Compare conclusions across all language paths ΓÇö identify where they converge and where they diverge, noting what assumptions differ per language.
4. Apply majority vote on the conclusions: if consensus exists, report it with confidence. If paths diverge, analyze the divergence and select the best-supported conclusion.
5. Synthesize the completed trace into the final answer, showing how the conclusion follows from cross-lingual consistency rather than a single-language perspective.

## Implementation Details
Cross-lingual reasoning as a strategy for improving model outputs was formalized by Qin et al. (2024) in "Cross-Lingual Consistency of Large Language Models," which demonstrated that generating reasoning paths in multiple languages and integrating them through voting can elevate accuracy by 4.1-18.5% across various reasoning benchmarks compared to monolingual baselines. The paper established that the internal representations of knowledge vary significantly by language — a model queried in Chinese may access different factual associations than when queried in English — and that cross-lingual voting surfaces the most robust answer by canceling out language-specific noise. This finding is consistent with broader research on how multilingual training data shapes LLM knowledge representation.

The mechanism operates on the insight that different languages have different co-occurrence statistics in training data, meaning that the same concept has a different neighborhood of associated concepts depending on the language. When the model reasons about a problem in English, it draws on English-language associations; when it reasons about the same problem from scratch in French, it draws on a different association network. If both paths converge on the same conclusion, confidence increases substantially. If they diverge, the divergence itself is diagnostic — it flags hidden assumptions, ambiguous terms, or culturally bound interpretations that a monolingual trace would miss. This is distinct from translation-based approaches; the model must reason natively in each language rather than translating the English reasoning, because translation loses the divergent associations that make the method valuable.

For Vidbyte reasoning traces, CLC requires generating at least three independent reasoning paths in different languages (English plus two others), where each path starts from the original question without referencing the other paths. The trace must include a comparison table showing where conclusions converge and diverge, with explicit analysis of the linguistic or cultural factors driving any divergence. The voting mechanism should be clearly documented: if paths agree, report the consensus with high confidence; if they disagree, the user must see which path is best-supported on its own merits and why. The languages chosen should be meaningfully different in training data distribution — choosing English, British English, and Canadian English would provide negligible diversity.

The broader research context includes work on multilingual language models and cross-lingual transfer (Conneau et al., 2020, XLM-R; Xue et al., 2021, mT5) which established that multilingual models encode language-agnostic representations alongside language-specific ones. CLC exploits this architecture by activating multiple language-specific reasoning circuits and requiring them to agree. Additional validation comes from work on self-consistency (Wang et al., 2023, ICLR) which showed that sampling multiple reasoning paths and voting improves accuracy; CLC extends this by ensuring the multiple paths are generated from genuinely different linguistic starting points rather than from the same language with different random seeds.

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
- Do not translate the English reasoning path into other languages — each language path must be generated independently from scratch, because translation preserves the English-language associations that cross-lingual reasoning is designed to escape.
- Do not choose languages that are too linguistically or culturally similar — using English, Australian English, and Canadian English provides negligible diversity and misses the point of the strategy.
- Do not present divergent conclusions as equally valid without analysis — the trace must investigate why paths diverged and determine which conclusion is better supported, not just report disagreement and move on.
- Do not skip the comparison table — the side-by-side view of conclusions across languages is the primary audit artifact, and without it the reviewer cannot verify that convergence is genuine rather than assumed.
- Do not treat majority voting as automatically authoritative — if the majority conclusion is weaker on its own merits than a minority conclusion, the trace must surface this tension rather than defaulting to the vote count.
- Do not let the voting mechanism obscure uncertainty — if all three paths are low-confidence or internally inconsistent, reporting a 2-1 vote as a strong signal is misleading.
- Do not use the same reasoning structure in all language paths; the strategy's value comes from genuinely different reasoning trajectories, so the decomposition, evidence weighting, and argument structure should vary naturally by language.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
