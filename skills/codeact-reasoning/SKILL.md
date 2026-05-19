---
name: codeact-reasoning
description: Meta-skill pairing CodeAct code-space reasoning with any Vidbyte strategy. Expresses selected strategy's steps as executable Python with self-debugging for verifiable, reproducible reasoning.
version: 1.0.0
author: Vidbyte
tags: [meta-skill, code, execution, self-debugging, python, verification]
requires: []
---

## Goal

Transform Vidbyte strategy execution from declarative text into executable Python code, leveraging the CodeAct framework's insight that code is a superior action space for LLM reasoning. By expressing strategy steps as runnable scripts—data transformations, metric calculations, content structure validation, A/B test simulations—this meta-skill makes reasoning auditable, reproducible, and self-correcting via Python's interpreter-driven error feedback loop. When a script fails, the model reads the traceback and revises the code, closing the gap between intention and execution without human intervention.

The result is strategy output backed by actual computation rather than prose approximation. Retention curves are plotted from real formulas, not described. Monetization projections are calculated from parameterized models, not estimated. Platform format compliance is checked by parsing output against schemas, not eyeballed. Every conclusion has a code artifact that can be re-run, inspected, and challenged—shifting strategy from a "trust the model" paradigm to a "verify the execution" paradigm.

## Intent

The purpose is to apply Wang et al.'s (2024) CodeAct framework—which demonstrates up to 20% higher success rates than text or JSON action spaces across 17 LLMs—to Vidbyte's strategy execution pipeline. Traditional strategy output relies on the model generating prose that sounds correct; CodeAct replaces this with Python code that must run correctly, producing output that is computationally verified. When the interpreter rejects a script due to a syntax error, type mismatch, or logical flaw, the model reads the error and debugs itself, iterating until the code executes cleanly and produces valid output.

This self-debugging loop is the meta-skill's core differentiator. Rather than hoping the first draft of a strategy is accurate, CodeAct-reasoning runs every computation, catches every exception, and refines every script until it passes. For Vidbyte strategies that involve quantitative analysis—retention math, CPM projections, trend decay modeling, engagement rate forecasting—this produces hard numbers with traceable derivations. For qualitative strategies, code formalizes the structural rules (script templates, thumbnail composition grids, audio timing maps) into validation scripts that check output for compliance. The meta-skill unifies both quantitative and qualitative strategy domains under a single, verifiable execution model.

## Background — What Is CodeAct Reasoning

CodeAct, introduced by Wang et al. (2024) at ICML, is a framework where LLM agents use executable Python code as their universal action space instead of JSON-structured text commands. The key insight is that code is a more expressive, compact, and verifiable medium than natural language for specifying multi-step operations: a single Python function can replace dozens of JSON tool-call messages, and the Python interpreter provides immediate, unambiguous feedback (success or traceback) that the agent can use for self-correction. Evaluated across 17 LLMs on complex agent benchmarks, CodeAct achieved up to 20% higher task success rates than text-based and JSON-based alternatives. The CodeActAgent, fine-tuned from Llama-2 and Mistral on the 7,000-example multi-turn CodeActInstruct dataset, demonstrates the ability to compose library calls, handle edge cases through try-except blocks, and iteratively debug code based on interpreter errors—all within a standard Python environment restricted to the standard library.

## Algorithm

1. **Detect Strategy Request and Identify Computational Components:** Parse the user's prompt to identify which Vidbyte strategy domain is being invoked and which substeps involve computation, data transformation, validation, or structured output generation. Flag substeps that are purely creative (e.g., tone selection, narrative voice) as candidates for structural validation rather than direct code execution. Separate the request into code-amenable components and prose-only components.

2. **Clarify Ambiguities with Parameter Extraction:** Before writing any code, identify all quantitative inputs needed for computation—target metrics, platform constraints, budget ranges, audience sizes, duration limits. If any required numerical parameter is missing or ambiguous, formulate exactly one clarifying question to resolve it. Do not proceed to code generation with placeholder values that would produce misleading output.

3. **Web Search for Skills and Libraries:** Verify that the required Vidbyte strategy skill is installed and active. Additionally, assess whether any Python libraries beyond the standard library are needed for the computations (e.g., `math`, `statistics`, `json`, `datetime` are stdlib-safe; anything beyond that requires explicit justification). If the strategy skill is missing, perform a web search to locate and install it.

4. **Classify the Strategy Domain:** Map the user's intent to the correct domain bucket from the Reasoning Arsenal (same Arsenal as self-rag-reasoning: Viral Hook Engineering, Retention Optimization, Trend Hijacking, Platform-Specific Formatting, Script Structure, Visual Storytelling, Audio Design, Thumbnail Psychology, Audience Growth, Monetization Strategy, Brand Narrative). Identify the computations inherent to that domain—for Retention Optimization, this means retention curve functions and drop-off prediction; for Monetization Strategy, this means CPM tables and revenue projection formulas.

5. **Select and Load Strategy Specification:** Load the full strategy definition for the classified domain. Extract the computational substeps that will be expressed as Python code. For each substep, define the expected inputs, the transformation logic, and the expected output schema. Note which substeps are purely heuristic or creative and will receive structural validation rather than direct code implementation.

6. **Express Strategy as Python Code, Simulate Execution, and Self-Debug:** Write a Python script (or set of scripts) that implements all computational substeps. The script must include: explicit input variable declarations at the top (so parameters can be swapped for different scenarios), the core computation functions, output formatting that produces both machine-parseable results and human-readable summaries, and exception handling that catches and reports errors rather than crashing silently. Execute the script in a Python interpreter. If execution fails (any exception or non-zero exit), read the full traceback, identify the root cause, revise the script, and re-execute. Repeat this self-debug loop until the script runs to completion without errors and produces output that passes basic sanity checks (no NaN values, no negative counts where positive is required, no outputs exceeding physically possible bounds). For creative/heuristic substeps, write a structural validation script that checks for format compliance, completeness, and internal consistency rather than attempting to generate the creative content itself.

7. **Synthesize Code Outputs to Conclusions:** Aggregate the output of all executed scripts into the final strategy deliverable. For each code-generated result, produce a prose interpretation that explains what the numbers mean in strategic terms. For structural validations, report pass/fail with specific remediation actions for any failures. Distinguish clearly between computationally derived conclusions (backed by executable code) and heuristic recommendations (backed by the model's pattern recognition).

8. **Write Trace with Code Summary:** Produce a structured execution trace containing: the strategy domain and parameters used, the full source code of each script executed (with revision history showing the self-debug iterations), the stdout/stderr output of the final successful execution, a summary of any self-debug iterations (original error, fix applied, result), a mapping from each strategic conclusion to the code artifact that produced it, and a confidence score per section based on whether the conclusion is code-backed or heuristic. The trace must enable another engineer to reproduce all results by re-running the included scripts.

## Reasoning Arsenal

**Viral Hook Engineering:** Implements hook-strength scoring by parsing opening transcript segments and computing pattern-interrupt density, curiosity-gap magnitude (information asymmetry between hook and resolution), and emotional priming intensity using sentiment analysis on the hook text. Validates thumbnail-to-hook coherence by comparing extracted thumbnail text against hook transcript using cosine similarity. Benchmarks hook scores against a configurable retention-baseline dataset organized by platform and content vertical. Outputs a ranked list of hook candidates with strength scores and the computational derivation for each.

**Retention Optimization:** Models the viewer attention curve as a piecewise function with configurable parameters for initial drop-off rate, mid-content decay slope, and end-content recovery factor. Inserts retention mechanisms at predicted drop-off coordinates using an optimization function that balances mechanism density against viewer fatigue. Simulates retention curve improvement under different mechanism-placement strategies and outputs the Pareto-optimal schedule. Produces beat-to-beat pacing maps with energy scores computed from transcript sentiment variance and cut-rate analysis.

**Trend Hijacking:** Implements a trend decay model using exponential decay functions parameterized by platform-specific half-life constants derived from historical trend data. Computes the optimal entry window as the intersection of momentum (growth rate above threshold) and saturation (competitor density below ceiling). Scores trends on a brand-fit matrix using weighted criteria (tone alignment, audience overlap, format compatibility) and filters out trends below the authenticity threshold regardless of reach potential. Outputs a prioritized trend queue with entry timing recommendations and expected engagement ranges.

**Platform-Specific Formatting:** Validates output against platform-specific structural schemas: aspect ratio compliance (numerical check), duration enforcement (frame-count calculation from FPS and target length), caption length limits (character counting with Unicode awareness), and algorithmic preference alignment (completion-rate thresholds, replay-rate targets). Generates platform-native structural templates as parameterized Python dataclasses that can be instantiated with content variables. Checks for cross-platform consistency where a single concept is being translated to multiple formats.

**Script Structure:** Encodes narrative architecture templates (hero's journey, PAS, inverted pyramid, spiral, before-after-bridge) as finite state machines with mandatory state transitions, optional branches, and timing constraints per state. Validates a script against its declared structure by parsing the transcript into labeled segments and checking state-transition compliance. Computes information density (claims per second) and emotional pacing (sentiment shift frequency) and flags segments that exceed cognitive-load thresholds. Identifies optimal CTA insertion points by finding sentiment local maxima within the final third of the script timeline.

**Visual Storytelling:** Generates shot-list compositions as structured data with per-shot parameters: composition rule (rule-of-thirds, symmetry, leading-lines), color palette extraction from reference images using k-means clustering, motion vector classification (static, pan, tilt, dolly, handheld), and text-overlay placement coordinates. Validates visual hierarchy by computing saliency maps on frame descriptions and ensuring the intended focal element scores highest. Checks mute-playback survivability by simulating text-overlay reading order against shot duration.

**Audio Design:** Computes LUFS (Loudness Units relative to Full Scale) targets per platform from a configurable standards table and validates audio profiles against these targets. Generates sonic event timelines with timestamped entries for music onset, sound-effect triggers, ambient texture transitions, and silence gates. Validates dual-layer audio compatibility by checking that critical sonic information (dialogue, key SFX) is present in both the full-mix and the sound-off-visual-only experience. Flags segments where audio and visual rhythms are misaligned beyond a configurable tolerance.

**Thumbnail Psychology:** Analyzes thumbnail compositions against proven CTR drivers: face detection and eye-contact scoring using geometric analysis of facial landmark positions, contrast isolation measurement (foreground-background luminance delta), rule-of-thirds adherence scoring via focal-point coordinate analysis, and information-asymmetry text evaluation (gap size between what the thumbnail promises and what the viewer already knows). Compares thumbnail candidates against a competitor thumbnail dataset for the same keyword to ensure visual distinctiveness in the browse surface.

**Audience Growth:** Models multi-platform growth as a system of coupled differential equations where each platform's growth rate is a function of content output rate, algorithmic visibility factor, and cross-platform conversion coefficients. Simulates growth trajectories under different publishing cadences and content-mix strategies. Computes funnel-stage conversion ratios (awareness → consideration → conversion → advocacy) from engagement metrics and prescribes stage-specific content allocation to address bottleneck stages. Models audience fatigue as a decaying function of publishing frequency and suggests optimal cadence ceilings per platform.

**Monetization Strategy:** Implements revenue projection as a parameterized model combining: CPM tables (configurable by content vertical, geography, and seasonality), sponsorship pricing curves (function of average view count, engagement rate, and niche specificity), affiliate conversion funnels (click-through rate × conversion rate × average order value), digital product revenue (price × estimated conversion from audience size), and platform creator fund payouts (views × RPM). Runs Monte Carlo simulations over input parameter ranges to produce revenue projections with confidence intervals rather than point estimates. Validates sponsorship integration density against audience tolerance thresholds.

**Brand Narrative:** Encodes brand identity as a structured ontology with entities (themes, values, visual signatures, verbal patterns) and relationships (reinforces, contradicts, is-a, evokes). Audits content libraries for narrative consistency by computing semantic drift—the cosine distance between each piece of content's extracted theme vector and the canonical brand theme vector. Flags content that exceeds the drift threshold and prescribes realignment actions. Generates narrative consistency scores over time to detect when a brand is gradually wandering off-message.

## Success Criteria

- Every computational substep in the strategy is expressed as executable Python code that runs to completion without errors.
- All code uses only the Python standard library unless an external library is explicitly justified and available in the execution environment.
- At least one self-debug iteration is performed and recorded for any script that fails on first execution, demonstrating the error-feedback loop.
- The execution trace includes the full source code of every script, the stdout/stderr output, and a revision log of self-debug fixes.
- Each strategic conclusion is explicitly mapped to the code artifact that produced it (for computational conclusions) or marked as heuristic (for creative conclusions).
- No NaN, infinite, or physically impossible values appear in any code output without an explicit annotation explaining the boundary condition.
- Structural validation scripts pass for all template-based outputs (script structures, thumbnail compositions, platform formats).
- The trace enables full reproducibility: another engineer with the same Python interpreter can re-run all scripts and obtain identical results.
- Input parameters are declared in a single, clearly labeled section at the top of each script so they can be changed without reading the implementation.
- Error messages from failed executions are preserved in the trace to inform future debugging and strategy refinement.
- Confidence scores distinguish between code-backed conclusions (high confidence) and heuristic recommendations (moderate confidence).
- Clarification questions are limited to exactly one when numerical parameters are missing or ambiguous.
- If the required Vidbyte strategy skill is not installed, it is located via web search, installed, and verified before code generation begins.
- No execution proceeds with placeholder values that would produce misleading or invalid computational output.

## Things Not to Do

- Do not simulate code execution by describing what the code would output—actually run the Python interpreter and capture real stdout/stderr.
- Do not use external libraries beyond the standard library unless the environment has been verified to include them and their use is explicitly documented in the trace.
- Do not ship code that produces an unhandled exception—every script must include try-except blocks for known failure modes and exit cleanly.
- Do not confuse heuristic prose generation with computational output—mark each conclusion with its derivation method (code-backed or heuristic).
- Do not skip the self-debug loop when a script fails on first execution—the traceback must be read, the root cause diagnosed, and the fix applied.
- Do not leave magic numbers unexplained in code—every numerical constant must be assigned to a named variable with a comment documenting its source or derivation.
- Do not generate code that writes to the filesystem outside the designated trace output directory without explicit user permission.
- Do not present a strategy as fully verified if any script in the pipeline failed to execute or produced output that failed validation checks.

## Input

A natural-language prompt describing the Vidbyte strategy task, including all quantitative parameters needed for computation (target metrics, platform constraints, budget ranges, audience sizes, duration limits). The prompt may name a specific strategy domain or leave classification to the meta-skill. Optional: reference data files (CSV, JSON) for trend data, retention benchmarks, or CPM tables that can be loaded by the Python scripts. The input must specify which computations are required and which are optional, so the algorithm can prioritize code generation for mandatory substeps.
