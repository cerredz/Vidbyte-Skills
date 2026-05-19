---
name: self-rag-reasoning
description: Meta-skill pairing Self-RAG retrieval-augmented reasoning with any Vidbyte strategy. Executes selected strategy with inline [RETRIEVE]/[RELEVANT]/[SUPPORTED] signals.
version: 1.0.0
author: Vidbyte
tags: [meta-skill, retrieval, reasoning, self-reflection, critique]
requires: []
---

## Goal

Apply Self-RAG's conditional retrieval and self-reflection framework to supercharge any Vidbyte strategy execution. Rather than blindly retrieving external context for every query—a wasteful pattern that often introduces noise—this meta-skill injects [RETRIEVE], [RELEVANT], and [SUPPORTED] signals inline throughout the reasoning process, ensuring retrieval happens only when genuinely needed and that every retrieved passage is scrutinized for relevance and factual support before incorporation.

The result is a dual-layered quality gate: the strategy itself produces creative or analytical output, while the Self-RAG wrapper continuously critiques that output against retrieved evidence, flagging unsupported claims, surfacing contradictory information, and forcing explicit acknowledgment when conclusions rest on the model's internal knowledge alone. This produces traceable, citation-backed reasoning that clients can audit and trust.

## Intent

The purpose is to transform Vidbyte strategy execution from a fixed, always-retrieve pipeline into an adaptive, on-demand retrieval system informed by Asai et al. (2023). Standard RAG approaches degrade when irrelevant passages are forced into context—the model gets distracted, hallucinations increase, and output quality suffers. By conditioning retrieval on the specific reasoning step at hand, Self-RAG avoids this degradation entirely, retrieving only when the current sub-question genuinely benefits from external knowledge.

This meta-skill also introduces a structured critique loop: after each retrieval, passages are assessed for relevance and support. When a passage is irrelevant, it is discarded before it can contaminate reasoning. When a passage partially or fully supports a claim, that support relationship is recorded, producing an auditable chain from conclusion back to source. For Vidbyte strategies that demand factual accuracy—market analysis, competitor research, platform specification validation—this critique layer is the difference between confident-sounding fiction and verifiable insight.

## Background — What Is Self-RAG Reasoning

Self-RAG, introduced by Asai et al. (2023), is a framework where a single language model is fine-tuned to generate special reflection tokens that govern its own retrieval and critique behavior at inference time. Unlike traditional RAG systems that retrieve for every query indiscriminately, Self-RAG decides on-demand whether retrieval is warranted, then evaluates each retrieved passage for relevance to the query and factual support for the generated output. The model outputs [RETRIEVE] when it determines external knowledge is needed, [RELEVANT] or [IRRELEVANT] to filter retrieved passages, and [SUPPORTED], [PARTIALLY], or [UNSUPPORTED] to score how well its generated text aligns with retrieved evidence. This adaptive mechanism outperforms both ChatGPT and retrieval-augmented Llama-2-chat on open-domain QA and fact verification benchmarks, while also improving long-form generation factuality and citation accuracy. The key insight is that retrieval should be a decision, not a reflex—and that self-critique produces more trustworthy output than blind generation.

## Algorithm

1. **Detect Strategy Request:** Parse the user's prompt to identify which Vidbyte strategy domain is being invoked. Extract the core creative or analytical task, any constraints (platform, duration, tone, audience), and the expected deliverable format. If no explicit strategy is named, flag this for the classification step.

2. **Clarify Ambiguities:** Before proceeding, identify any missing information that would materially affect strategy execution. Check for underspecified platform targets, audience segments, content formats, or success metrics. If critical gaps exist, formulate exactly one clarifying question—never more—and pause for the user's response before continuing.

3. **Web Search for Skills if Not Installed:** Verify that the requested strategy skill is available in the current environment. If it is not installed, execute a targeted web search to locate the skill definition, install it, and confirm activation before proceeding to classification.

4. **Classify the Request:** Map the user's intent to the correct domain bucket from the Reasoning Arsenal. If the request spans multiple domains, identify the primary domain and note secondary domains for cross-pollination. If no domain clearly matches, default to the closest fit and annotate the classification as low-confidence.

5. **Select Strategy from Arsenal:** Load the full strategy specification for the classified domain. Confirm that all required inputs are present. If optional inputs would improve output quality, note them but do not block execution. Initialize the strategy's execution context with the user's parameters.

6. **Execute Strategy with Iterative Retrieval Signals:** Run the selected strategy step-by-step, annotating each reasoning substep with Self-RAG signals inline. At each juncture where external knowledge could improve the step, emit [RETRIEVE], perform the retrieval (web search, knowledge base query, or document lookup), then annotate each retrieved passage with [RELEVANT] or [IRRELEVANT]. After incorporating retrieved content into the strategy output, annotate each claim with [SUPPORTED], [PARTIALLY], or [UNSUPPORTED] based on alignment with the retrieved evidence. Re-retrieve if support is lacking and the claim is critical. Discard irrelevant passages immediately to prevent context pollution.

7. **Final Verification Pass:** After the full strategy output is generated, perform a second-pass audit. For every [SUPPORTED] claim, verify that a retrieval source is explicitly linked. For every [UNSUPPORTED] claim, assess whether the claim is foundational (must be re-retrieved) or supplementary (acceptable with an explicit caveat). For any [PARTIALLY] claim, identify the gap and either close it with additional retrieval or document the limitation.

8. **Write Trace with Support Summary:** Produce a structured execution trace containing: the strategy domain and parameters used, the sequence of retrieval decisions with timestamps, the relevance filter log (passages accepted vs. discarded with reasons), the support matrix (each claim mapped to its supporting source or marked as model-generated), and a final confidence score per output section. Append this trace to the strategy output so the user can audit every evidentiary link.

## Reasoning Arsenal

**Viral Hook Engineering:** Designs opening sequences that maximize viewer retention within the first three seconds. Evaluates pattern-interrupt techniques, curiosity gaps, and emotional priming against platform-specific autoplay behavior. Considers thumbnail-to-hook coherence, ensuring the promise made by the thumbnail is paid off immediately. Measures hook strength against known retention benchmarks for the target platform and content vertical.

**Retention Optimization:** Maps the full viewer attention curve and inserts retention mechanisms at predicted drop-off points—pattern breaks, stake escalation, open loops, and payoff teases. Analyzes pacing rhythms (beat-to-beat energy shifts) that sustain engagement across short-form, mid-form, and long-form content. Calibrates retention tactics to audience demographics, since Gen Z retention mechanics differ materially from millennial or B2B viewer patterns.

**Trend Hijacking:** Identifies emerging trends across TikTok, YouTube Shorts, and Instagram Reels with sufficient momentum to justify content investment but not yet saturated by competitors. Applies a decay curve model to predict trend lifespan and recommends entry timing within the optimal window. Matches trend mechanics to brand voice constraints, rejecting trends that would force inauthentic positioning even if they offer high reach potential.

**Platform-Specific Formatting:** Translates a single content concept across platforms, respecting each platform's native aspect ratio, duration constraints, caption conventions, and audience expectation norms. Generates platform-specific structural templates (YouTube: intro-hook-body-CTA-end screen; TikTok: hook-climax-loop) and ensures compliance with each platform's algorithmic preferences for completion rate, replay rate, and engagement velocity.

**Script Structure:** Engineers narrative architecture for video content, selecting from proven structures (hero's journey, PAS, inverted pyramid, spiral, before-after-bridge) based on content objective and audience psychology. Balances information density against emotional pacing, ensuring scripts deliver value without cognitive overload. Embeds natural CTA triggers at moments of peak emotional resonance rather than bolting them onto the end.

**Visual Storytelling:** Choreographs visual sequences that communicate information through composition, color, movement, and juxtaposition rather than relying on voiceover explanation. Applies principles of visual hierarchy, match cuts, motivated camera movement, and symbolic imagery to create meaning that survives muted playback. Integrates text overlays as rhythmic punctuation rather than crutches for weak visuals.

**Audio Design:** Composes the sonic layer—music selection, sound effects, ambient texture, and strategic silence—to reinforce emotional beats and direct attention. Considers platform-specific audio norms (TikTok's sound-on expectation vs. LinkedIn's sound-off default) and designs dual-layer audio that works in both contexts. Applies loudness normalization standards (LUFS targets per platform) to prevent algorithmic penalization.

**Thumbnail Psychology:** Designs thumbnail compositions that trigger pattern-recognition shortcuts in the viewer's visual cortex—face close-ups with direct eye contact, high-contrast color isolation, rule-of-thirds focal placement, and text that creates information asymmetry. Tests thumbnail concepts against competing thumbnails in the same browse surface to ensure visual distinctiveness. Aligns thumbnail signaling with the content's actual payoff to avoid clickbait degradation.

**Audience Growth:** Constructs multi-platform growth flywheels that convert one platform's discovery audience into another platform's deep-engagement audience. Maps content types to funnel stages (awareness → consideration → conversion → advocacy) and prescribes publishing cadences that maintain algorithmic visibility without triggering audience fatigue. Incorporates community interaction protocols that convert passive viewers into active participants.

**Monetization Strategy:** Architects revenue models spanning ad revenue, sponsorships, affiliate marketing, digital products, and platform creator funds. Evaluates CPM variance across content verticals and geographies to project revenue ceilings. Designs sponsorship integration patterns that maintain audience trust while maximizing per-deal value, including natural product placement, dedicated segments, and white-label content.

**Brand Narrative:** Develops the meta-story that unifies all content output—the creator or brand's persistent identity expressed through recurring themes, visual signatures, verbal tics, and value propositions. Ensures narrative consistency across disparate content types so that a viewer encountering any single piece of content can infer the broader brand promise. Audits existing content libraries for narrative drift and prescribes corrective alignment.

## Success Criteria

- Retrieval signals ([RETRIEVE], [RELEVANT], [IRRELEVANT]) are used inline at every decision point where external knowledge could influence strategy output.
- Each retrieved passage is individually assessed for relevance before incorporation; irrelevant passages are documented and discarded.
- Every factual claim in the strategy output carries a support annotation: [SUPPORTED], [PARTIALLY], or [UNSUPPORTED].
- A support summary is produced that maps each claim to its evidentiary source or explicitly marks it as model-generated.
- The trace records all retrieval decisions with timestamps, query strings, and result counts.
- No claim marked [SUPPORTED] lacks a linked retrieval source that a human reviewer can independently verify.
- Claims marked [UNSUPPORTED] are either re-retrieved until support is found or explicitly caveated in the final output.
- The strategy domain is correctly classified before execution begins, with low-confidence classifications flagged.
- The algorithm adapts retrieval frequency to the strategy's knowledge intensity—fact-heavy strategies trigger more retrievals than creative-heavy ones.
- Context pollution is prevented: irrelevant passages are filtered before they enter the reasoning window.
- The final output includes a confidence score per section, enabling the user to triage which claims to verify manually.
- Clarification questions are limited to exactly one when ambiguities exist, and no execution proceeds without resolution of blocking gaps.
- If the required skill is not installed, it is located via web search, installed, and verified before use.
- The execution trace is structured and machine-parseable for downstream auditing or automated testing.
- Every strategy output ends with a disclaimer distinguishing evidence-backed claims from model-generated creative suggestions.

## Things Not to Do

- Do not fabricate retrieval results or claim [SUPPORTED] for assertions that lack a real retrieval source—falsifying evidence is worse than admitting uncertainty.
- Do not use an always-retrieve pattern that fetches context for every reasoning step regardless of need; retrieval must be a deliberate decision.
- Do not skip signal annotations on any step—every retrieval decision and passage assessment must produce a visible signal token.
- Do not mark a passage as [IRRELEVANT] simply because it is behind a paywall or inaccessible; distinguish between "irrelevant" and "unavailable."
- Do not execute the strategy without first verifying that the required domain skill is active and all mandatory inputs are present.
- Do not issue multiple clarifying questions in a single turn—exactly one, targeted at the most blocking ambiguity, then wait.
- Do not retain irrelevant passages in the reasoning context after they have been filtered; discard them immediately to prevent downstream contamination.
- Do not present [UNSUPPORTED] claims as fact without an explicit caveat indicating the claim is model-generated and unverified.

## Input

A natural-language prompt describing the Vidbyte strategy task, including the desired output format, target platform(s), content objective, audience profile, and any constraints (duration, tone, budget, brand guidelines). The prompt may name a specific strategy domain from the Arsenal or leave domain classification to the meta-skill. Optional: reference URLs, competitor examples, or existing content assets to incorporate into the strategy execution.
