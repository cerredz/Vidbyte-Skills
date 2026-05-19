---
name: self-rag-trace
description: Standalone execution trace that records every retrieval decision, relevance filter, and support annotation across an entire Self-RAG reasoning session for auditability and continuous improvement.
version: 1.0.0
author: Vidbyte
tags: [trace, audit, retrieval, self-reflection, evidence]
requires: [self-rag-reasoning]
---

## Goal

Produce a complete, timestamped audit trail of a Self-RAG reasoning session that captures every retrieval decision, relevance assessment, support evaluation, and claim-to-source mapping. This trace serves as both a quality assurance artifact—allowing human reviewers to independently verify every evidence-backed claim—and a feedback mechanism for improving future retrieval strategies by identifying patterns in relevance failures, support gaps, and retrieval timing errors.

The trace is designed to be machine-parseable (JSON-structured within markdown) so it can feed into automated testing pipelines, regression suites for strategy output quality, and continuous improvement loops where retrieval-pattern analytics surface which query formulations and source types most reliably produce [SUPPORTED] outcomes.

## Implementation Details

The Self-RAG framework, introduced by Asai et al. (2023) in "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection," centers on a single language model fine-tuned to emit special reflection tokens that govern retrieval and critique behavior at inference time. These tokens—[RETRIEVE], [RELEVANT], [IRRELEVANT], [SUPPORTED], [PARTIALLY], and [UNSUPPORTED]—form a compact control language that the model uses to decide on-demand whether to retrieve external knowledge for a given generation step. The critical departure from standard RAG is that retrieval is conditional: the model learns to recognize when its parametric knowledge is sufficient and when external context would improve output quality. This adaptive mechanism is what enables Self-RAG to outperform both ChatGPT and retrieval-augmented Llama-2-chat on open-domain QA (Asai et al., 2023, Table 2) and fact verification benchmarks (Asai et al., 2023, Table 3), because it avoids the well-documented degradation that occurs when irrelevant passages are injected into the context window.

The reflection token taxonomy serves distinct functions within the generation pipeline. The [RETRIEVE] token is a binary decision emitted before each generation segment: when present, the system queries an external retriever (typically a sparse or dense index over a document corpus, or a live web search endpoint) and returns the top-k passages. Each retrieved passage is then evaluated for relevance to the current query using [RELEVANT] or [IRRELEVANT] tokens; passages marked [IRRELEVANT] are discarded immediately to prevent context pollution. The surviving passages are concatenated to the generation context, and the model produces output annotated with [SUPPORTED] (the generated text is fully grounded in a retrieved passage), [PARTIALLY] (the generated text draws partial support from retrieval, with gaps filled by parametric knowledge), or [UNSUPPORTED] (the generated text has no evidential basis in the retrieved set and derives entirely from the model's internal knowledge). This taxonomy enables fine-grained factuality auditing: a human reviewer can trace every [SUPPORTED] segment to its source passage and independently verify accuracy, while [UNSUPPORTED] segments are explicitly flagged as model-generated and warrant additional scrutiny.

The on-demand retrieval decision is the framework's most impactful design choice. In standard RAG pipelines, retrieval is a fixed preprocessing step that runs before any generation begins—every query triggers retrieval regardless of whether the model actually needs external knowledge. This produces two failure modes: retrieval of irrelevant passages that distract the model and degrade output quality, and wasted computational cost for queries the model could answer correctly from parametric knowledge alone. Self-RAG's adaptive mechanism eliminates both failures by conditioning retrieval on the specific reasoning step. The model is trained (via instruction fine-tuning on data annotated with reflection tokens by a critic model) to recognize knowledge boundaries and request retrieval only when a gap exists. For long-form generation tasks, this produces measurable gains in both factuality (as evaluated by automated fact-checking metrics) and citation accuracy (the precision with which generated claims can be attributed to specific source passages), because the model is not overwhelmed by irrelevant context and can focus its attention on the passages that matter.

The practical implementation for this trace system maps the Self-RAG framework onto Vidbyte's strategy execution workflow. Each trace entry records: the step identifier within the algorithm (matching the eight-step Algorithm section of the self-rag-reasoning skill), a millisecond-precision timestamp, the retrieval decision (retrieve or skip) with rationale, the query string sent to the retriever, the number of passages returned, the relevance filter outcome per passage (accepted/discarded with reason), the generated output segment, and the support annotation per claim with a pointer to the source passage or a null marker for model-generated claims. The trace concludes with an aggregate support summary: the ratio of [SUPPORTED] to [UNSUPPORTED] claims, the average retrieval latency, the relevance precision (accepted passages / total retrieved), and a per-section confidence score derived from the support density of claims within that section. This structured output enables both immediate human audit and downstream programmatic analysis—for example, identifying which query formulations most reliably surface relevant passages for a given strategy domain, or detecting strategy steps where the model consistently overclaims support.

## Success Criteria

- Every retrieval decision is recorded with a timestamp, the query string used, the number of results returned, and the retrieval source (web, knowledge base, document corpus).
- Each retrieved passage is individually logged with its content excerpt, source URL or identifier, and the relevance determination ([RELEVANT] or [IRRELEVANT]) with a one-sentence rationale.
- Every generated claim in the strategy output is mapped to a support annotation and, if [SUPPORTED], a pointer to the specific source passage that grounds it.
- The support summary provides aggregate statistics: total claims, [SUPPORTED] count, [PARTIALLY] count, [UNSUPPORTED] count, and the support ratio.
- The trace is valid JSON and parseable by automated validation scripts without manual cleanup.
- All timestamps use ISO-8601 format with millisecond precision for precise latency analysis.
- Irrelevant passages are recorded in the trace (with discard reason) rather than silently dropped, enabling retrieval-quality analysis.
- The trace includes a per-section confidence score that correlates with the density of [SUPPORTED] claims in that section.
- No [SUPPORTED] claim in the trace points to a source that is inaccessible or unreproducible.

## Input

The output of a self-rag-reasoning session: the full strategy output with inline reflection tokens, the retrieval log (query strings, result counts, passage contents), and the support annotations per claim. The trace generator consumes this structured output and produces the formatted audit trail. No additional user input is required beyond the raw session output.
