# Design Doc: Utility Interactive Skills — Learning Tricks Batch 2

**Status:** Draft
**Author:** Codex
**Created:** 2026-06-21
**Last Updated:** 2026-06-21

---

## 1. Overview

Extend PR #105's version 5 utility-interactive learning family with five prompt-led skills: `/mind-mapping`, `/concept-mapping`, `/progressive-summarization`, `/jol`, and `/kwl`. Each skill will teach the named historical method, preserve the method's defining constraint through explicit multi-turn gates, keep the learner responsible for the cognitive work, and write a durable local artifact. The existing `/interactive` router, family authoring artifact, manifests, and public catalogs will be expanded so the new methods are discoverable without adding runtime code or duplicating their canonical workflows in the router.

---

## 2. Goals & Non-Goals

### Goals

- Create complete, self-contained `SKILL.md` packages for all five requested methods.
- Follow PR #105's interaction contract: orient, explain, demonstrate, gate, halt, evaluate, persist, and advance only on a pass.
- Preserve the defining protocols: Buzan's one-keyword branches, Novak's labeled propositions and cross-links, Forte's layer dependency and selectivity, delayed cue-only JOL ratings, and Ogle's K/W-before-reading then L/comparison sequence.
- Support every requested invocation mode, with capability-safe behavior for URLs, local paths, timers, reminders, and file writes.
- Persist the requested Markdown or JSON handoff artifacts in the user's current working directory.
- Include ready-to-run, user-controlled `vidbyte retain` blocks in completed Markdown learning artifacts without executing them automatically.
- Expand `/interactive` with linked catalog entries, exclusions, and deterministic tie-break rules for the five new methods.
- Add the five skills to the `learning` category and PR #105's opt-in version 5 bundle.
- Update the utility-interactive authoring artifact, README, and `llms.txt` so future agents and users understand the new patterns.

### Non-Goals

- Implement a generic graph renderer, terminal color engine, timer daemon, notification service, scheduler, or background worker.
- Add backend endpoints, CLI subcommands, authentication behavior, dependencies, migrations enforced by code, or new verification scripts.
- Modify the existing reasoning skills `mind-map-trace` or `concept-mapping-trace`; the new skills are interactive learning protocols with distinct names and behavior.
- Implement `/cornell-notes`, outlining, `/blurting`, `/feynman`, or new SQ3R/REAP behavior.
- Guarantee delayed reminders in a harness with no scheduling capability; the JOL artifact and due date remain the portable source of truth.
- Generate graphical image files. Terminal maps are Markdown/Unicode approximations accompanied by color and image metadata.
- Automatically ingest every file in a batch folder without user-visible sequencing, source validation, and overwrite protection.

---

## 3. Background & Context

PR #105 (`feat/utility-interactive-skills`, currently open) introduces `/sq3r`, `/pq4r`, `/pao-system`, and `/interactive`, registers version 5, and adds `artifacts/utility-interactive-skills.md`. Its core intent is not merely to describe learning techniques, but to run active, gated sessions where the agent removes clerical friction while the user performs prediction, encoding, retrieval, reflection, or recall. Every gate requires observable evidence; a prompt must halt after asking for that evidence; failed attempts receive criteria-based retries and then targeted hints without answer leakage.

The repository discovers `skills/<name>/SKILL.md` folders automatically. `skills-manifest.json` assigns categories, `lib/skill-versions.json` controls version bundles, and `scripts/validate.js` checks frontmatter, directory naming, registration, and bundle references. Supporting references must live inside the consuming skill folder, but this batch needs no static reference assets. Skills are installed independently, so each new prompt must be self-contained and `/interactive` must load the canonical installed `SKILL.md` rather than restating its phases.

The new skills occupy distinct use cases. Mind maps explore one topic as a radial keyword tree; concept maps answer a focus question through labeled propositions and cross-links. Progressive Summarization distills an already captured source for future retrieval rather than teaching it deeply. JOL measures perceived future recall and later calibration rather than performing a study test. KWL frames expository reading before and after another reading method. These boundaries must appear in activation descriptions, routing rules, and failure behavior so similarly named reasoning traces or nearby reading methods are not selected incorrectly.

Local `main` does not yet contain PR #105. Implementation therefore must either wait until PR #105 merges (preferred) or use an explicitly approved stacked worktree based on `refs/remotes/origin/pr-105`. An unrelated untracked local design file already exists at `docs/design/utility-interactive-skills-expansion.md`; this design deliberately uses `docs/design/learning-tricks-batch-2.md` and will not modify or include that user-owned file.

---

## 4. Requirements

### Functional Requirements

1. `mind-mapping` SHALL orient the user to Tony Buzan's radial-tree method, its brainstorming/reconstruction use case, its non-sequential boundary, and a 10–20 minute session expectation.
2. Mind Mapping SHALL accept a topic, `--from <url|path>`, or `--reconstruct`; classify available input honestly; and never invent inaccessible source content or a prior saved map.
3. Mind Mapping SHALL build one central concept, then 4–7 first-level branches, then per-branch sub-branches. Every branch label SHALL be exactly one lexical keyword; phrases SHALL fail the gate and require compression.
4. Mind Mapping SHALL preserve a single-center connected tree and reject labeled-edge/multiple-hub concept-map behavior with an availability-aware `/concept-mapping` redirect.
5. Mind Mapping SHALL render a terminal-friendly radial/box-drawing approximation ordered clockwise from the upper-right, while explicitly noting that Markdown cannot reproduce Buzan's organic curves or physical page layout.
6. Mind Mapping SHALL require at least three color assignments across first-level branches and one concrete mental image/icon per first-level branch, represented portably with `[C1]`-style tags plus a legend.
7. Mind Mapping SHALL run a source-hidden reconstruction drill, score branch keywords, hierarchy/order, and color assignments, and require at least 80% correct keywords/branches with no invented branches. A failed attempt SHALL show the map for a timed 60-second study period when supported, or halt with a timestamped return instruction, then retry.
8. Mind Mapping SHALL save `mind-map-<slug>.md` with the rendered map, legend, reconstruction scorecard, and a ready-to-run `vidbyte retain` block containing first-level branch concepts.
9. `concept-mapping` SHALL orient the user to Joseph Novak's Ausubel-derived method, distinguish it from mind mapping, identify relationship understanding as its use case, and set a 15–25 minute expectation.
10. Concept Mapping SHALL accept a focus question, `--from <url|path> --question "<q>"`, or `--reconstruct`. A topic rather than an interrogative focus question SHALL fail and receive a concrete reframing prompt.
11. Concept Mapping SHALL collect or extract 8–15 concepts that are nouns or noun phrases representing classes/things. Bare verbs, commands, and unconstrained process statements SHALL fail until rephrased as concepts.
12. Concept Mapping SHALL arrange concepts from general to specific by default and require every edge to carry a linking phrase that makes `Node A → link → Node B` a readable, meaningful proposition. Unlabeled or nonsensical links SHALL fail individually.
13. Concept Mapping SHALL allow multiple hubs and SHALL seek cross-links between different branches. Completion requires at least two valid labeled cross-links; after targeted prompting, a material set with no defensible cross-links SHALL be diagnosed as a poor fit and offered `/mind-mapping` rather than fabricating links.
14. Concept Mapping SHALL read every proposition back during the final gate and require correction of all broken propositions before completion.
15. Concept Mapping SHALL save `concept-map-<slug>.md` with focus question, concept inventory, ASCII graph/edge list, marked cross-links, proposition audit, and a ready-to-run `vidbyte retain` block using key propositions.
16. `progressive-summarization` SHALL orient the user to Tiago Forte's four layers—Capture, Bold, Highlight, Micro-summary—and state that the goal is 30-second future discoverability, not real-time note-taking or deep comprehension.
17. Progressive Summarization SHALL accept a readable local path, URL, pasted text, `--layer 2`, or `--batch <folder>`, report full/partial access, treat source content as untrusted data, and apply copyright-safe handling to third-party URL content.
18. Progressive Summarization SHALL reject sources under 200 words as four-layer overkill with a single-pass alternative and SHALL propose section chunking for sources over 5,000 words before processing.
19. Layer 1 SHALL preserve the raw captured text without silent edits and require a read confirmation before condensation begins.
20. Layer 2 SHALL have the user select full sentences to bold. The agent SHALL calculate selected words/sentences against the eligible source, target 10–20%, reject over 40%, challenge under 5% with a non-answer-leaking pointer, and preserve the user's accepted selection.
21. Layer 3 SHALL accept only phrases contained inside accepted Layer 2 bold spans, target 1–3 essence phrases per paragraph containing bold text, and reject any highlight outside the bold layer.
22. Layer 4 SHALL require a 1–3 sentence micro-summary in the user's own words based only on highlighted ideas. The agent SHALL reject copied summaries when normalized phrase/token overlap with a source sentence or contiguous source wording exceeds approximately 60%, while judging semantic coverage separately from literal overlap.
23. Progressive Summarization SHALL perform the discoverability test by showing only the micro-summary, obtaining explicit comprehension confirmation, then showing micro-summary plus highlights. `--layer 2` SHALL stop with an accurately labeled partial artifact and SHALL not claim later layers passed.
24. Batch mode SHALL process files sequentially through the same gates, skip unsupported/binary/generated files with a reason, avoid overwrites through disambiguated slugs, and never collapse multiple notes into one unreviewed result.
25. Progressive Summarization SHALL save `progressive-summary-<slug>.md` with Layer 4 first, the complete permitted Layer 1 text with nested Markdown bold/highlight notation, discoverability result, and a ready-to-run retain block based on the micro-summary concepts.
26. `jol` SHALL orient the user to Nelson and Dunlosky's Judgments of Learning, explain fluency miscalibration and the value of delayed judgments, distinguish confidence rating from recall testing, and state the one-week follow-up.
27. JOL SHALL support `/jol`, `--items <file>`, `--from-blurting`, `--retest [<session-file>]`, and `--history`; it SHALL not claim a prior blurting artifact, timer, or reminder capability without detecting one.
28. A new JOL session SHALL require at least five valid cue/answer items. It SHALL load prior items when available or guide a study pass without exposing answers after the study phase.
29. JOL SHALL record a study-completed timestamp and enforce at least five elapsed minutes before accepting ratings. If the host can wait, it may run a timer; otherwise it SHALL save state, halt, and validate wall-clock time on return.
30. During ratings, JOL SHALL display one cue at a time without its answer and request only a 0–100 integer confidence that the answer will be recalled in one week. If the user attempts recall, the skill SHALL stop that item, restate the rating-only rule, and re-present a clean rating prompt.
31. JOL SHALL require ratings for all items, preserve answer keys without displaying them during ratings, compute `retest_due` as seven calendar days after rating completion, and save `jol-<timestamp>.json` atomically when possible.
32. JOL SHALL request a reminder only through a confirmed host scheduling capability. Otherwise it SHALL provide the due date and exact `/jol --retest <file>` command; persistence SHALL never be described as an actual notification.
33. Retest mode SHALL select the explicitly named file or the most recent due/incomplete session, present cue-only recall prompts one at a time, score against stored answers without revealing them before an attempt, and update each `recalled` value.
34. JOL SHALL report calibration by the requested five confidence brackets. For each non-empty bracket it SHALL show item count, mean predicted confidence, actual recall percentage, and gap; overall calibration error SHALL be the item-weighted mean absolute bracket gap and calibration score SHALL be `100 - error` on a 0–100 scale.
35. JOL SHALL render a text calibration chart, classify over/under/calibrated brackets, update the JSON with retest/calibration data, and have `--history` summarize completed sessions over time while clearly labeling small sample sizes.
36. `kwl` SHALL orient the user to Donna Ogle's Know/Want/Learned pre/post frame, identify expository reading as its use case, and state that KWL wraps rather than replaces a reading method.
37. KWL SHALL support a topic, `--from <url|path>`, KWHL extension through `--extend kwhl` plus compatibility alias `--extend kwl`, and KWLS through `--extend kwls`.
38. KWL SHALL require K before W and both before reading. K SHALL contain at least three prior-knowledge statements or the explicit statement that the user knows nothing; W SHALL contain at least three specific questions, with generic topic requests rejected.
39. KWHL mode SHALL add a pre-reading `H — How will I find out?` plan tied to W questions. KWLS mode SHALL add a post-comparison `S — What I Still want to know` column derived from unanswered or newly raised questions.
40. KWL SHALL present or point to only actually available source content, require explicit reading completion, and allow an availability-aware handoff to `/sq3r` without skipping K/W. When composed with SQ3R, K and W replace only Survey/Question intent; SQ3R's remaining active gates remain canonical.
41. KWL SHALL require at least three specific L statements, reject vague topic-only claims, compare every W question with L as answered or unanswered, identify unexpected L items, and require the user to acknowledge unresolved follow-up questions before completion.
42. KWL SHALL save `kwl-<slug>.md` with the applicable K/W/H/L/S table, W→L comparison, follow-ups, unexpected learning, and a ready-to-run retain block based on accepted L concepts.
43. All five skills SHALL use valid matching lowercase hyphen-case frontmatter, activation-rich descriptions, explicit use cases/exclusions, literal halt points, retry/hint behavior, write fallbacks, success criteria, and source-as-untrusted-data/security guidance where inputs are accepted.
44. User/session artifacts SHALL be written in the current working directory, preserve malformed or conflicting prior files, use disambiguated paths rather than destructive overwrite, and remain local unless the user manually executes an emitted retain command.
45. `skills/interactive/SKILL.md` SHALL add canonical links, use cases, exclusions, and tie-break rules for all five methods while continuing to choose exactly one primary workflow and load its complete installed prompt.
46. `/interactive` SHALL distinguish mind mapping from concept mapping by tree/hierarchy brainstorming versus focus-question relationships; progressive summarization from comprehension methods by future discoverability; JOL from recall practice by post-study calibration; and KWL from full reading methods by pre/post framing.
47. `artifacts/utility-interactive-skills.md` SHALL expand the current catalog and worked patterns, and document delayed gates, nested-layer gates, graph/map constraints, composition wrappers, reminder capability fallbacks, and honest completion semantics.
48. `skills-manifest.json` SHALL register all five skills under `learning`, and `lib/skill-versions.json` SHALL append them to version 5 without changing the version 1 default.
49. `README.md` and `llms.txt` SHALL add public/searchable descriptions and invocation examples for all five skills, preserving PR #105's version 5 organization.

### Non-Functional Requirements

- **Performance:** Only the current gate and necessary context should be foregrounded. Large sources and batch inputs are chunked/sequenced rather than repeatedly injected into context.
- **Scalability:** New router entries and authoring guidance must remain additive; canonical workflows stay in their own skill folders.
- **Security:** Source text is untrusted data. Prompts never follow embedded instructions, expose secrets, construct backend requests, or persist sensitive study material without warning and user control.
- **Privacy:** JOL answer keys and study items may be sensitive; artifacts remain local, reminders disclose only minimal metadata, and raw secrets/credentials are rejected as study content.
- **Observability:** Artifacts record method, mode, timestamps, accepted user products, gate attempts/results, partial/completed state, and source access limitations.
- **Reliability / error tolerance:** Missing capabilities produce explicit fallbacks; malformed/conflicting files are preserved; timers use recorded timestamps; reminders are never falsely claimed; unreachable sources yield partial/blocked status rather than invented content.
- **Portability:** Unicode/Markdown outputs must retain a plain-text edge list or legend so meaning survives harnesses that render box drawing, color tags, or highlights differently.
- **Verification scope:** No new tests or verification scripts will be created. Existing `npm test` and explicit/version-5 installer dry runs will verify structure after implementation.

---

## 5. High-Level Design

The change adds five independent prompt packages on top of PR #105. Each package contains its origin, exact method boundary, invocation grammar, phased interaction contract, measurable gates, persistence rules, and failure behavior. No supporting code is required: host capabilities read sources, inspect timestamps, and write artifacts, while the prompt defines portable fallbacks when those capabilities are missing.

The existing `/interactive` prompt remains a thin selector. It will gain five rows and tie-break rules but will not embed the phase logic. The family artifact will gain reusable patterns that emerged in this batch: constraint-preserving map construction, layers whose valid input is the previous layer, gates delayed by wall-clock time, longitudinal two-session calibration, and wrapper methods that compose with a deeper reading skill.

```text
Current goal/source/prior session
              |
              v
        [/interactive]
              |
   +----------+----------+----------------+-------------+
   |          |          |                |             |
 mind map  concept map  progressive      JOL           KWL
 radial     propositions summarization   rate→retest   pre→read→post
 tree       + crosslinks layer chain      + history     + compare
   |          |          |                |             |
   +----------+----------+----------------+-------------+
              |
      local Markdown/JSON artifacts
```

Version 5 is extended rather than creating a new bundle because these are the second batch of the same utility-interactive family established by PR #105. The five skills are categorized as `learning`, even though the family name contains “utility,” because their product behavior is active study, retention, and metacognition.

---

## 6. Detailed Design

### 6.1 Mind Mapping Skill

**File(s):** `skills/mind-mapping/SKILL.md`
**Type:** New file

#### What it does

Runs Buzan-style single-center mind-map construction, enforces one keyword per branch, adds portable color/image metadata, and completes with a hidden reconstruction drill.

#### Interface / API

```text
/mind-mapping <topic>
/mind-mapping --from <url|path>
/mind-mapping --reconstruct [<mind-map-file>]
```

#### Logic / Algorithm

1. Parse mode and resolve a topic, readable source, or prior map.
2. Reject sequential or relationship-edge-heavy inputs with a reasoned redirect.
3. Collect central concept, 4–7 single-word branches, and single-word sub-branches through separate halt/evaluate turns.
4. Render the radial approximation and enforce one connected parent per node.
5. Collect colors and mental images, requiring three colors minimum.
6. Hide the map, collect reconstruction, score it, and retry below 80%.
7. Save the final map, scorecard, and retain block.

#### Edge Cases & Error Handling

- Hyphenated lexical compounds are accepted only when they function as one term; whitespace-separated phrases fail.
- Unicode failure falls back to an indented tree while preserving clockwise order metadata.
- Missing prior map in reconstruct mode reports the search scope and asks for a file; it does not invent state.
- A write conflict produces a disambiguated slug.

### 6.2 Concept Mapping Skill

**File(s):** `skills/concept-mapping/SKILL.md`
**Type:** New file

#### What it does

Runs Novak concept mapping from a focus question through concept extraction, hierarchy, labeled propositions, cross-links, and final proposition reading.

#### Interface / API

```text
/concept-mapping <focus-question>
/concept-mapping --from <url|path> --question "<question>"
/concept-mapping --reconstruct [<concept-map-file>]
```

#### Logic / Algorithm

1. Require and validate a focus question.
2. Collect/extract 8–15 noun/noun-phrase concepts.
3. Arrange general-to-specific nodes.
4. Add edges only with user-confirmed linking phrases and validate each proposition.
5. Seek at least two labeled cross-links between distinct branches.
6. Read every proposition and repair all broken paths.
7. Save graph plus a canonical edge list, audit, and retain block.

#### Edge Cases & Error Handling

- An unlabeled edge remains pending and cannot appear as accepted output.
- A radial single-center tree triggers a mind-map distinction before continuing.
- If two cross-links cannot be defended after targeted prompts, stop as method mismatch rather than manufacture them.
- Dense ASCII collisions fall back to numbered nodes and an exact labeled edge list.

### 6.3 Progressive Summarization Skill

**File(s):** `skills/progressive-summarization/SKILL.md`
**Type:** New file

#### What it does

Guides a captured note through Forte's four dependent layers, enforces selective bolding and nested highlights, and validates an original micro-summary for future discoverability.

#### Interface / API

```text
/progressive-summarization <path|url|pasted-text>
/progressive-summarization <source> --layer 2
/progressive-summarization --batch <folder>
```

#### Logic / Algorithm

1. Detect/acquire the source and reject too-short or require chunking for too-long input.
2. Number eligible sentences/paragraphs and preserve Layer 1.
3. Collect Layer 2 sentence selections, compute ratios, and enforce selectivity.
4. Collect Layer 3 phrases and verify every phrase is inside an accepted bold span.
5. Collect Layer 4, check length, semantic grounding, and approximate source overlap.
6. Run micro-summary-only and micro-summary-plus-highlight discoverability checks.
7. Save full or accurately labeled partial output; repeat sequentially in batch mode.

#### Edge Cases & Error Handling

- URL access that cannot legally/technically provide full text produces a partial artifact or requests user-provided text.
- Markdown escaping preserves original syntax while adding bold/highlight notation; a legend explains the highlight marker.
- Duplicate filenames/slugs never overwrite prior processed notes.
- Binary/generated folder entries are skipped with reasons.

### 6.4 Judgments of Learning Skill

**File(s):** `skills/jol/SKILL.md`
**Type:** New file

#### What it does

Runs delayed cue-only confidence judgments, persists a one-week retest, scores actual recall, and reports calibration over one or multiple sessions.

#### Interface / API

```text
/jol
/jol --items <file>
/jol --from-blurting
/jol --retest [<jol-session.json>]
/jol --history
```

#### Logic / Algorithm

1. Load/collect at least five cue-answer items and complete the study pass.
2. Save `study_completed_at`, enforce five elapsed minutes, and resume after the delay.
3. Present cue-only items individually and collect 0–100 confidence without recall.
4. Save ratings, rating timestamp, and seven-day due date; schedule only with a confirmed capability.
5. On retest, collect actual recall cue by cue and score each item.
6. Aggregate five confidence brackets, compute weighted calibration error/score, render chart, and update JSON.
7. In history mode, read completed JOL artifacts and show calibration trend/sample sizes.

#### Edge Cases & Error Handling

- Early return before five minutes reports remaining time and halts.
- Invalid confidence values are retried; attempted recall causes a clean re-prompt without recording the answer as a JOL.
- A retest before its due date warns that timing differs and requires explicit confirmation before proceeding.
- Missing answer keys, malformed JSON, ambiguous latest sessions, or unavailable blurting files are reported without mutation.

### 6.5 KWL Skill

**File(s):** `skills/kwl/SKILL.md`
**Type:** New file

#### What it does

Runs Ogle's K/W pre-reading activation, an explicit reading boundary, L consolidation, and W-to-L comparison, with optional KWHL/KWLS extensions.

#### Interface / API

```text
/kwl <topic>
/kwl --from <url|path>
/kwl <topic-or-source> --extend kwhl
/kwl <topic-or-source> --extend kwl   # compatibility alias for supplied input
/kwl <topic-or-source> --extend kwls
```

#### Logic / Algorithm

1. Validate expository topic/source and select base/KWHL/KWLS columns.
2. Collect at least three K statements or an explicit zero-knowledge statement.
3. Collect at least three specific W questions; collect H plans in KWHL mode.
4. Only then present/point to the reading source or hand off to an installed reading skill.
5. After completion, collect at least three specific L statements.
6. Compare every W against L, mark answered/unanswered, identify unexpected L, and derive follow-ups/S.
7. Require user acknowledgment and save the table, comparison, and retain block.

#### Edge Cases & Error Handling

- Fiction/procedures produce a method-fit explanation rather than forced KWL.
- A user trying to skip K/W remains at the pre-reading gate.
- Unavailable source content leaves the session ready at the reading boundary rather than pretending it was read.
- Composition with SQ3R loads the canonical installed skill and avoids duplicating or silently skipping its active gates.

### 6.6 Interactive Router Expansion

**File(s):** `skills/interactive/SKILL.md`
**Type:** Modified

#### What it does

Adds the five new canonical targets to PR #105's linked catalog and selection algorithm.

#### Interface / API

```text
/interactive [goal, source, or explicit method]
```

#### Logic / Algorithm

1. Preserve explicit installed-skill selection.
2. Add outcome/input signals and tie-break rules for all five methods.
3. Choose exactly one primary method; treat KWL composition as an explicit staged handoff, not concurrent execution.
4. Load the chosen complete `SKILL.md` and reuse existing conversation input.
5. Provide exact installation instructions when the canonical file is absent.

#### Edge Cases & Error Handling

- Existing `concept-mapping-trace`/`mind-map-trace` names do not count as the new interactive skills.
- If routing is genuinely ambiguous, ask at most one question.
- Do not duplicate canonical gates in the router.

### 6.7 Utility Interactive Skills Artifact

**File(s):** `artifacts/utility-interactive-skills.md`
**Type:** Modified

#### What it does

Expands PR #105's intent/design guide with the Batch 2 catalog and reusable authoring patterns.

#### Interface / API

```text
N/A - Repository authoring documentation.
```

#### Logic / Algorithm

1. Add five catalog rows and routing distinctions.
2. Document delayed, layered, graph-constrained, reconstruction, and wrapper/composition gates.
3. Add worked patterns and failure modes from each new method.
4. Preserve canonical-skill ownership, local-first state, and capability honesty.

#### Edge Cases & Error Handling

- Documentation must not imply guaranteed timer/reminder APIs.
- Examples must distinguish completed practice from partial/extract-only artifacts.

### 6.8 Catalog and Version Metadata

**File(s):** `skills-manifest.json`, `lib/skill-versions.json`
**Type:** Modified

#### What it does

Registers the new folders as learning skills and appends them to version 5.

#### Interface / API

```json
{
  "learning": ["concept-mapping", "jol", "kwl", "mind-mapping", "progressive-summarization"],
  "5": ["concept-mapping", "interactive", "jol", "kwl", "mind-mapping", "pao-system", "pq4r", "progressive-summarization", "sq3r"]
}
```

The shown arrays are illustrative subsets/order; implementation preserves all existing entries and repository ordering conventions.

#### Logic / Algorithm

1. Begin from PR #105's manifest/version files.
2. Add each exact folder name once under `learning`.
3. Add each exact folder name once to version 5.
4. Keep versions 1–4 and default behavior unchanged.

#### Edge Cases & Error Handling

- Validation fails on missing/duplicate/mismatched names; implementation reconciles against the actual merged PR #105 state.

### 6.9 Public Catalog Documentation

**File(s):** `README.md`, `llms.txt`
**Type:** Modified

#### What it does

Adds human-facing and model-facing discovery entries for the five methods under version 5.

#### Interface / API

```text
npx vidbyte-skills --version 5
npx vidbyte-skills mind-mapping concept-mapping progressive-summarization jol kwl
```

#### Logic / Algorithm

1. Extend PR #105's version 5 section and learning table.
2. Summarize each method's defining constraint and best-fit use case.
3. Link the expanded utility-interactive authoring artifact where PR #105 places it.
4. Add matching searchable `llms.txt` entries without duplicating complete prompts.

#### Edge Cases & Error Handling

- Documentation is reconciled with final skill names and flags before commit.

### 6.10 Design Document

**File(s):** `docs/design/learning-tricks-batch-2.md`
**Type:** New file

#### What it does

Defines the approved source of truth, scope, requirements, and file manifest for this batch.

#### Interface / API

```text
N/A - Design documentation only.
```

#### Logic / Algorithm

1. Commit this document first in the approved implementation worktree.
2. Implement only the approved manifest and behaviors.
3. Document any approved deviation before implementation diverges.

#### Edge Cases & Error Handling

- Implementation stops if PR #105 or an approved equivalent base is unavailable.
- The unrelated untracked expansion design is excluded from all commits.

---

## 7. Data Model Changes

### 7.1 Mind/Concept/Progressive/KWL Markdown Artifacts

**Change type:** New runtime artifact contracts

```yaml
schema_version: 1
method: mind-mapping | concept-mapping | progressive-summarization | kwl
mode: normal | reconstruct | from-source | layer-2 | batch | kwhl | kwls
status: in_progress | partial | complete
source_type: topic | path | url | pasted | prior-artifact
source_identifier: redacted-or-local-identifier
updated_at: ISO-8601
```

Readable Markdown sections contain the method-specific maps, layers, tables, accepted user products, gates, scores, and retain block. **Migration strategy:** no prior runtime schema exists. Rollback removes repository prompts/catalog exposure but never deletes user-created artifacts.

### 7.2 JOL Session JSON

**Change type:** New runtime artifact contract

```json
{
  "schemaVersion": 1,
  "sessionDate": "2026-06-21",
  "studyCompletedAt": "ISO-8601",
  "ratingsCompletedAt": "ISO-8601 or null",
  "retestDue": "2026-06-28",
  "retestCompletedAt": null,
  "status": "studied|rated|retested",
  "items": [
    {"id": 1, "cue": "...", "answer": "...", "jolRating": 85, "recalled": null}
  ],
  "calibration": null
}
```

After retest, `calibration` stores bracket counts, mean predictions, recall rates, gaps, overall error, and overall score. **Migration strategy:** no automatic migration. If an older/manual artifact lacks required fields, report it and offer a new recovered file rather than overwriting it.

---

## 8. API Changes

N/A - The change adds prompt invocation grammars and local artifact contracts only. It does not add or modify HTTP endpoints, CLI subcommands, authentication requests, or backend response schemas.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/learning-tricks-batch-2.md` | Source-of-truth design for Batch 2 |
| CREATE | `skills/mind-mapping/SKILL.md` | Guided Buzan mind-mapping workflow |
| CREATE | `skills/concept-mapping/SKILL.md` | Guided Novak concept-mapping workflow |
| CREATE | `skills/progressive-summarization/SKILL.md` | Guided Forte four-layer distillation workflow |
| CREATE | `skills/jol/SKILL.md` | Delayed JOL, retest, calibration, and history workflow |
| CREATE | `skills/kwl/SKILL.md` | Guided KWL/KWHL/KWLS reading frame |
| MODIFY | `skills/interactive/SKILL.md` | Route to the five new canonical methods |
| MODIFY | `artifacts/utility-interactive-skills.md` | Expand family intent, catalog, and authoring patterns |
| MODIFY | `skills-manifest.json` | Register five learning skills |
| MODIFY | `lib/skill-versions.json` | Append five skills to version 5 |
| MODIFY | `README.md` | Add version 5 and public catalog documentation |
| MODIFY | `llms.txt` | Add searchable model-facing skill summaries |

No files will be deleted.

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| PR #105 utility-interactive changes | `refs/remotes/origin/pr-105` or merged equivalent | Supplies `/interactive`, version 5, and family artifact to extend | Open PR may change before merge; stacked work can conflict |
| Existing Node installer/validator | Repository version | Discovers and validates skill folders/manifests | Catalog mismatch causes validation failure |
| Host file/web/time capabilities | Harness-dependent | Read sources, persist artifacts, and enforce elapsed delays | Missing capability requires explicit fallback/partial state |
| Host reminder/scheduling capability | Optional, harness-dependent | Best-effort JOL retest reminder | Must never be assumed or falsely reported |
| Existing `vidbyte retain` CLI | Existing package contract | Optional user-run retain blocks | Prompts must not execute automatically or construct transport |

No new package or mandatory external service dependency is introduced.

---

## 11. Rollout & Deployment

- Preferred: wait for PR #105 to merge, update local `main`, then create `feat/learning-tricks-batch-2` in an isolated worktree.
- Alternative only with explicit approval: create the worktree/branch from `refs/remotes/origin/pr-105` and open a stacked draft PR targeting PR #105's branch until it merges.
- Commit this design document first, then add canonical prompts, router/artifact changes, and catalogs in logical commits.
- Run existing `npm test`, explicit dry-run installs for all five new skills, and a version 5 dry run. No new test scripts are added.
- The change is additive and non-breaking; version 1 remains the default.
- Rollback reverts repository commits and catalog exposure. Runtime artifacts created by users remain user-owned and are not automatically removed.
- If PR #105 changes before implementation, reconcile file contents and document deviations without including the unrelated untracked local design file.

---

## 12. Open Questions

- [ ] Should implementation wait for PR #105 to merge into `main` (preferred), or should the eventual PR be stacked on `feat/utility-interactive-skills`?

No method-level behavior remains unresolved: the supplied ambiguous KWHL flag is handled through canonical `--extend kwhl` plus the supplied `--extend kwl` compatibility alias, and JOL reminders are explicitly capability-dependent.

---

## 13. Alternatives Considered

### Alternative 1: Put all five workflows directly in `/interactive`

- What: Expand the router into a monolithic prompt containing every phase and gate.
- Why rejected: It duplicates canonical behavior, increases context cost, prevents reliable individual installation, and creates prompt drift.

### Alternative 2: Reuse existing reasoning-trace skills

- What: Alias `/mind-mapping` to `mind-map-trace` and `/concept-mapping` to `concept-mapping-trace`.
- Why rejected: Trace skills produce reasoning structures; the requested skills are historical learning protocols with user gates, reconstruction/proposition audits, and durable handoffs.

### Alternative 3: Add scripts for timers, similarity, rendering, and calibration

- What: Build helper executables to enforce delays, calculate overlap, render maps, and score JOLs.
- Why rejected: PR #105 defines this family as prompt-led and portable, the requested scope is simple content, and host capabilities plus explicit formulas are sufficient. New code would enlarge installation and testing scope.

### Alternative 4: Create a version 6 bundle

- What: Treat Batch 2 as a separate installer version.
- Why rejected: The methods extend the same not-yet-released utility-interactive family established as version 5. Appending preserves one coherent opt-in catalog.

### Alternative 5: Promise reminders from the prompt

- What: State that `/jol` will notify the user one week later in every harness.
- Why rejected: A Markdown skill cannot guarantee background execution. Persisted due dates plus detected scheduling capabilities are honest and portable.

### Alternative 6: Share one generic session schema across all methods

- What: Introduce a common runtime engine/schema for gates and state.
- Why rejected: The artifacts have materially different shapes, no runtime consumes them, and PR #105 explicitly avoids a generic workflow engine. Small shared conventions belong in the authoring artifact, not a new abstraction.

