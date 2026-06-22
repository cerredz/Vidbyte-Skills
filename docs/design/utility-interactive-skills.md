# Design Doc: Utility Interactive Skills

**Status:** Draft
**Author:** Codex
**Created:** 2026-06-21
**Last Updated:** 2026-06-21

---

## 1. Overview

Add a version 5 bundle of guided, interaction-based learning utilities to Vidbyte Skills: `/sq3r` for structured nonfiction, `/pq4r` for denser material that needs explicit reflection, `/pao-system` for long numeric or card sequences, and `/interactive` for choosing and immediately running the best installed interactive utility from the current conversation. Each skill teaches its method before using it, divides work into gated phases, requires the user to perform retrieval or encoding work instead of passively consuming an answer, and produces a durable local handoff artifact. A new `artifacts/utility-interactive-skills.md` document will define this interaction model and the authoring standard for future skills in the family.

---

## 2. Goals & Non-Goals

### Goals

- Create complete `SKILL.md` packages for `sq3r`, `pq4r`, `pao-system`, and `interactive`.
- Make every method feel like a guided session: orient the user, explain the current phase, demonstrate on the user's material, halt for user work, evaluate the response, and advance only after the gate passes.
- Include explicit `Use Cases` and `When Not to Use` sections in each method skill.
- Support the requested invocation modes and flags, including `--no-gates`, `--section`, `--quick`, `--reflect-prompts`, `--build`, `--drill`, and `--export` where applicable.
- Accept pasted text, local paths, URLs, and transcripts for the reading methods, with format detection and graceful fallback behavior.
- Persist final SQ3R/PQ4R handoffs, resumable long-reading state, the user's PAO list, and per-session PAO results in the current working directory.
- Include a ready-to-run `vidbyte retain` block in completed SQ3R and PQ4R handoffs without automatically submitting it.
- Give `/interactive` a linked catalog of the installed interactive utilities and route from the current conversation to one primary method.
- Provide reusable Major System teaching material and a concrete starter 00â€“99 person list inside the PAO skill package.
- Add all four skills to the `learning` manifest category and a new version `5` bundle, then document them in the public README and `llms.txt` catalog.
- Create a comprehensive artifact explaining the intent, interaction contract, prompt structure, persistence model, routing rules, failure modes, and process for adding future interactive utility skills.

### Non-Goals

- Implement `/feynman`, `/cornell-notes`, `/memory-palace`, `/rhyming-pegs`, `/major-system`, or `/dominic-system` in this change.
- Add a new backend endpoint, CLI command, authentication flow, or automatic Vidbyte submission.
- Add helper executables, runtime dependencies, schemas enforced by code, or new test/verification scripts.
- Modify installer discovery, category filtering, platform targets, or CLI routing.
- Build a generic workflow engine for gates or cross-session state; the workflow remains prompt-defined and local-file based.
- Guarantee access to arbitrary paywalled or unreachable URL content.
- Treat quick reference lookup, research-paper analysis, fiction, or short unstructured prose as a valid SQ3R/PQ4R session.

---

## 3. Background & Context

The repository stores each installable skill under `skills/<name>/SKILL.md`. The Node installer discovers those folders automatically, while `skills-manifest.json` assigns product categories and `lib/skill-versions.json` defines opt-in version bundles. Validation requires lowercase hyphen-case names, matching folder/frontmatter names, non-empty descriptions, and valid manifest/version references. Optional `references/`, `scripts/`, and `assets/` content is copied with its owning skill. There is no repository-wide shared-reference installation mechanism, so shared teaching material must live inside an owning skill package or be duplicated deliberately.

Existing learning skills establish useful precedents. `/read-paper` uses orientation, active-learning gates, mode flags, a Markdown handoff, and a `vidbyte retain` command; it is the research-paper-specific alternative that SQ3R and PQ4R must distinguish themselves from. `/roleplay` demonstrates a multi-turn workflow with explicit halts, local persistence, resume behavior, and an orchestrated final report. `/vidbyte-tutor` demonstrates routing to canonical skills without reimplementing their complete workflows. The new `/interactive` skill follows that orchestration pattern but is intentionally limited to interactive utility skills.

The repository currently has version bundles 1â€“4. Version 1 is the installer default, so adding these methods to a new version 5 preserves existing default behavior while making the bundle available through `--version 5`, `--version all`, and explicit skill selection. The root README and `llms.txt` are public catalogs and must be updated with the new bundle and skill descriptions. `skills/README.md` documents category semantics but does not enumerate individual skills, so it does not require a change.

Several requested redirects point to skills not currently present in the repository. The new prompts will preserve the recommendations, but they must check availability and describe them as optional/future techniques rather than claiming that Vidbyte installed them. The PQ4R orientation will use the historically and structurally consistent statement â€œPQ4R extends SQ3R with a goal-setting preview and a reflection pause,â€ resolving the contradictory supplied phrase â€œSQ4R with one extra phase.â€

---

## 4. Requirements

### Functional Requirements

1. `sq3r` SHALL open a three-line orientation naming Francis P. Robinson, defining Surveyâ€“Questionâ€“Readâ€“Reciteâ€“Review, and setting a 10â€“20 minute expectation before beginning a normal gated session.
2. `sq3r` SHALL state that it is for structured expository nonfiction and direct research papers to `/read-paper`; it SHALL reject fiction, single paragraphs, and other non-structured text after checking for usable section structure.
3. `sq3r` SHALL auto-detect pasted text, a local path, a URL, or a transcript; report the detected source type and access level; and avoid inventing unavailable content.
4. `sq3r` SHALL implement the five requested gated phases. Every phase SHALL explain its purpose in second person, demonstrate on the user's source, halt for user work, evaluate against explicit criteria, and advance only on a pass.
5. SQ3R Survey SHALL extract a 6â€“10 line structural skeleton from available TOC/headings/subheadings, section boundaries, emphasized terms, figures, and summaries, then require one predicted topic sentence and two questions.
6. SQ3R Question SHALL turn every heading and subheading into a genuine question, then require the user to select and type 3â€“5 questions that map to source headings.
7. SQ3R Read SHALL work one section at a time with the user's selected questions visible, then require an original-language answer identifying which questions the section answered. Verbatim copying or passive acknowledgment SHALL fail the gate.
8. SQ3R Recite SHALL hide or stop displaying source content, collect an unaided recitation, and return a covered/missing/invented scorecard. Passing requires at least 80% of key points and zero invented content.
9. SQ3R Review SHALL show the recitation and survey skeleton side by side, require a one-paragraph synthesis answering the requested â€œone thingâ€ and colleague handoff prompts, and evaluate coherence and specificity.
10. SQ3R SHALL support `--no-gates`, `--section <name>`, and `--quick`; SHALL save `sq3r-<slug>.md` on completion; and SHALL checkpoint sessions over 20,000 words to `sq3r-<slug>.state.md` for later resume.
11. The SQ3R final handoff SHALL contain the survey, chosen questions, section paraphrases, scorecard, synthesis, and a shell-formatted `vidbyte retain` block for 3â€“5 concepts.
12. `pq4r` SHALL open with an orientation explaining that PQ4R extends SQ3R through goal-setting Preview and explicit Reflect phases, and that the six-phase session normally takes 20â€“30 minutes.
13. `pq4r` SHALL include the same source handling, structured-text boundary, Question, Read, Recite, Review, gate, retry, long-text checkpoint, and handoff principles as SQ3R, expressed self-sufficiently so installing PQ4R alone does not require the SQ3R folder.
14. PQ4R Preview SHALL produce the structural skeleton and require both a one-sentence learning goal and a prediction of the text's argument.
15. PQ4R Question SHALL require one selected question explicitly tied to the Preview goal in addition to heading-derived questions.
16. PQ4R Reflect SHALL hide source text and require specific answers to what was newly learned, what it connects to, and what surprised or contradicted the prediction. Generic checkbox responses SHALL fail and receive a passage-level hint.
17. PQ4R Review SHALL compare the initial prediction with the final synthesis and record the prediction-versus-reality delta.
18. `pq4r` SHALL support the SQ3R flags plus `--reflect-prompts <custom>` and save `pq4r-<slug>.md` with all six phases, the prediction delta, and the retain block.
19. Both reading skills SHALL interpret â€œhide the sourceâ€ as not reprinting or quoting it during retrieval gates. User-provided/local content may be shown section by section; third-party URL content SHALL use section pointers and limited excerpts or paraphrases instead of reproducing an entire copyrighted work.
20. Both reading skills SHALL track failed gate attempts. On the first failure they SHALL state the failed criterion and ask for a retry; on the second they SHALL give a targeted hint or identify the missing topic without supplying the answer, then keep the gate closed.
21. `pao-system` SHALL open with the requested explanation that PAO turns three two-digit codes into a personâ€“actionâ€“object scene, that a complete system needs 00â€“99 mappings, and that long-sequence memorization is the intended use case.
22. `pao-system` SHALL explicitly distinguish long numeric/card sequences from short lists and conceptual learning, and SHALL include `Use Cases` and `When Not to Use` sections.
23. PAO Phase 1 SHALL teach the Major System map from `references/major-system-map.md`, drill all ten single digits in shuffled order plus five two-digit pairs, and require a ten-item mastery quiz before list building.
24. PAO Phase 2 SHALL build the user's 00â€“99 person list in batches of ten. For each number the agent SHALL generate 3â€“5 Major-System-compatible candidate people/peg names, require a concrete visualizable selection, persist it, and gate the batch with unaided recall.
25. PAO SHALL offer `references/starter-people.json` as an explicit opt-in alternative to creating all 100 people. It SHALL never silently overwrite user choices with starter entries.
26. PAO Phase 3 SHALL derive a concrete signature action and object for every selected person, allow substitutions, persist after each accepted item/batch, and require batch recall before completion.
27. PAO Phase 4 SHALL accept numeric input or a user-defined card encoding, validate that a complete usable PAO list exists, chunk each six-digit/three-code group into a vivid PAO scene, ask for enough memory-palace loci, place scenes in order, and gate both scene recall and exact decoding.
28. For card input, PAO SHALL use an existing card-code mapping from `pao-list.json` or help the user create and persist one. The illustrative `9â™£ = 39` SHALL not be treated as a complete canonical deck mapping.
29. PAO Phase 5 SHALL offer spaced recall, random-number, and deck drills; score exact recall; record misses; and append drill history to the PAO data artifact and a session Markdown log.
30. `pao-system` SHALL support no-argument onboarding, direct numeric input, `--build`, `--drill`, and `--export`. It SHALL save `pao-list.json` atomically when host tools permit and `pao-session-<timestamp>.md` per doing/drill session.
31. PAO SHALL refuse the doing phase until all required people/actions/objects for the target codes exist. It SHALL route non-numeric material through a numeric encoding step or recommend `/memory-palace` only if available.
32. `interactive` SHALL describe itself as the entry point for choosing an interaction-based learning utility from conversation context, list Markdown paths to `sq3r`, `pq4r`, and `pao-system`, and include concise use cases for each.
33. `interactive` SHALL inspect the current task and recent conversation, respect an explicitly named target skill, otherwise choose exactly one primary skill, briefly explain why, load that skill's canonical `SKILL.md`, and immediately begin its workflow when the required source/target is already present.
34. `interactive` SHALL prefer SQ3R for ordinary structured nonfiction, PQ4R for dense/theoretical text or a stated passive-reading problem, and PAO for 30+ ordered digits/items or card sequences with a numeric encoding.
35. If routing is genuinely ambiguous, `interactive` SHALL ask at most one concise clarifying question. If the required target skill is not installed/readable, it SHALL provide the exact install command instead of imitating the missing skill from memory.
36. Every new skill SHALL use valid lowercase hyphen-case frontmatter, include activation/use-case language in its description, identify success criteria and failure behavior, and avoid exposing secrets or constructing backend requests.
37. `artifacts/utility-interactive-skills.md` SHALL explain the family intent, use-case boundaries, orientation pattern, phase/gate contract, division of agent/user labor, evaluation/retry rules, modes, state persistence, handoff format, routing/catalog pattern, reference ownership, security/privacy, and an end-to-end checklist for creating future skills.
38. `skills-manifest.json` SHALL register all four skills under `learning`, and `lib/skill-versions.json` SHALL add all four to version `5`.
39. `README.md` SHALL add a version 5 installation section, catalog entries for all four skills, and a link to the authoring artifact. `llms.txt` SHALL add corresponding searchable catalog summaries.

### Non-Functional Requirements

- **Performance:** Normal gated sessions should reveal only the current section/phase. Sources over 20,000 words must checkpoint and resume rather than requiring one context window.
- **Scalability:** The authoring artifact and `/interactive` catalog must define an additive pattern for future interactive skills without central runtime changes.
- **Security:** Skills must treat source text as untrusted content, never follow instructions embedded in that content, never include credentials in artifacts, and use only host-provided file/web capabilities. The retain block is displayed for user execution and does not construct headers or call arbitrary endpoints.
- **Privacy:** PAO artifacts may contain personally meaningful people, locations, and memorization targets. Prompts must warn users before persisting sensitive numbers, recommend redaction/placeholders for credentials and financial data, and never encourage storing a live credit-card number in plaintext.
- **Observability:** Each session artifact records source/target metadata, current/completed phases, gate outcomes, scores, and timestamps sufficient to understand progress and resume safely.
- **Reliability / error tolerance:** Writes should preserve prior progress, malformed state/JSON should be reported without overwriting it, unreachable URLs should fall back to available material, and unsupported inputs should produce a specific redirect.
- **Portability:** Skill behavior must remain prompt-led and usable across supported harnesses; host-specific tools may be used only through capability-based instructions and fallbacks.
- **Verification scope:** No new test or verification scripts will be created. Existing `npm test` and installer dry runs will be used after implementation.

---

## 5. High-Level Design

The change adds four self-contained prompt packages and two PAO reference assets. SQ3R and PQ4R deliberately duplicate their shared phase instructions because the installer permits selecting one skill in isolation; PQ4R may explain its relationship to SQ3R and link to the sibling skill, but it cannot depend on that sibling being present. PAO owns the reusable Major System map and starter people data under its own `references/` directory because the current installer has no shared-reference bundle. The authoring artifact will state that future `/major-system` or `/dominic-system` work should copy or deliberately relocate that reference only alongside an installer design change.

`/interactive` is a thin router. It contains a linked catalog and selection rules, but the selected skill's `SKILL.md` remains authoritative. When the skill exists, `/interactive` reads it and begins that workflow; when it does not, the router reports the missing path and gives an explicit installation command. This prevents prompt drift and avoids maintaining four implementations inside the router.

Reading-session data flows from source acquisition to structural validation, orientation, phase-local demonstration, a user gate, evaluation, and a final Markdown handoff. Long sources add a state checkpoint at the same boundary after each section. PAO data flows from the shared phonetic map into user-selected people, then actions and objects, then target-specific scenes and recall logs. All data stays local unless the user manually runs the generated retain command.

```text
Current conversation / explicit invocation
                    |
                    v
             [/interactive]
          /          |          \
         v           v           v
     [/sq3r]      [/pq4r]   [/pao-system]
        |             |            |
  source + gates  source + gates  PAO list + drills
        |             |            |
        v             v            v
 final .md +      final .md +   pao-list.json +
 state .md        state .md     session .md
        \_____________|____________/
                      |
               local artifacts only
```

Key design decisions are: use `learning` rather than `utility` because the repository defines learning as tutoring, retention, and study workflows; create version 5 rather than alter the version 1 default; keep artifacts local and CLI-free; make every gate behavioral and measurable; ship a starter people list but require explicit adoption; and treat redirects to not-yet-bundled skills as availability-aware recommendations.

---

## 6. Detailed Design

### 6.1 SQ3R Skill

**File(s):** `skills/sq3r/SKILL.md`
**Type:** New file

#### What it does

Defines the complete interactive SQ3R tutor, source handling, five gated phases, modes, resume state, and final handoff contract.

#### Interface / API

```text
/sq3r <path|url|pasted text|transcript>
/sq3r <source> --no-gates
/sq3r <source> --section <name>
/sq3r <source> --quick
```

Local outputs:

```text
sq3r-<slug>.state.md   # checkpoint for resumable/long sessions
sq3r-<slug>.md         # completed handoff
```

#### Logic / Algorithm

1. Parse flags and classify the source as pasted text, readable local path, URL, or transcript.
2. Acquire only available content and report any access limitation.
3. Detect structured expository text using headings/section boundaries and route unsupported material before starting.
4. Print the three-line orientation and applicable mode summary.
5. Run Survey, Question, per-section Read, Recite, and Review with an explicit halt after every gate.
6. Record every accepted user response and gate result in session state.
7. Checkpoint after every phase and after every Read section when the source exceeds 20,000 words.
8. On completion, render the require…616 tokens truncated…pear in this `SKILL.md`.

---

### 6.3 PAO System Skill

**File(s):** `skills/pao-system/SKILL.md`
**Type:** New file

#### What it does

Teaches the Major System prerequisite, builds and persists the user's PAO encoding, guides first memorization through a memory palace, and provides scored practice modes.

#### Interface / API

```text
/pao-system
/pao-system <numeric target>
/pao-system --build
/pao-system --drill
/pao-system --export
```

Local artifacts use this conceptual contract:

```json
{
  "schemaVersion": 1,
  "updatedAt": "ISO-8601",
  "majorSystemMastered": false,
  "entries": {
    "00": { "consonants": "s/z-s/z", "person": null, "action": null, "object": null, "source": "user|starter|null" }
  },
  "encodings": { "cards": {} },
  "buildProgress": { "peopleThrough": null, "actionsObjectsThrough": null },
  "drills": []
}
```

Per-session logs are `pao-session-<timestamp>.md` and include target type, encoded scenes, loci, exact recall score, misses, and next drill recommendation. Sensitive raw targets are redacted by default in logs unless the user explicitly requests otherwise.

#### Logic / Algorithm

1. Inspect invocation mode and load `pao-list.json` if present.
2. For onboarding/build without Major System mastery, read the bundled map, teach it, drill, and gate with ten items.
3. Build people 10 at a time using Major-System-compatible candidates or explicit starter-list adoption; save after every accepted choice.
4. Gate unaided people recall per batch, then build/gate signature actions and objects in the same batches.
5. For direct memorization, validate all codes needed by the target. Route to build only for missing mappings rather than requiring unrelated unused codes.
6. If the target is cards, require or construct a complete unambiguous card-code mapping before scene generation.
7. Request the exact number of memory-palace loci, generate vivid interactive scenes, and gate scene recall followed by code decoding.
8. Save a session log and append drill summary/history to the PAO list.
9. In export mode, print a readable 00â€“99 table without mutating state.

#### Edge Cases & Error Handling

- Non-digits, separators, odd-length inputs, and lengths not divisible by six are normalized only with user-visible padding/group rules; no digit is silently discarded.
- Abstract people/actions/objects are rejected in favor of one concrete, visually distinctive subject/action/object.
- Missing or incomplete mappings route to the smallest required build batch; full deck work still requires a complete deck mapping.
- Invalid JSON is never overwritten automatically. The skill reports the parse problem and offers recovery into a new file.
- The skill warns against saving real payment credentials, government identifiers, secrets, or other sensitive sequences.
- `/memory-palace`, `/rhyming-pegs`, `/major-system`, and `/dominic-system` are mentioned only as optional techniques if installed; otherwise their absence is explicit.

---

### 6.4 Major System Reference

**File(s):** `skills/pao-system/references/major-system-map.md`
**Type:** New file

#### What it does

Provides the canonical digit-to-sound map, sound rules, examples, quiz-generation constraints, candidate-quality rules, and common confusions used by the PAO teaching phase.

#### Interface / API

```text
0 = s/z
1 = t/d
2 = n
3 = m
4 = r
5 = l
6 = sh/ch/j/soft-g
7 = k/hard-g
8 = f/v
9 = p/b
```

#### Logic / Algorithm

1. Teach sounds rather than spelling.
2. Ignore vowels and the explicitly documented filler sounds.
3. Validate candidate peg/person names against ordered consonant sounds.
4. Use shuffled full-digit drills and novel two-digit pairs.
5. Prefer concrete, familiar, visually distinct people over perfect-but-abstract words.

#### Edge Cases & Error Handling

- Accents and pronunciation variants are accepted when the user can state a stable sound mapping.
- Ambiguous hard/soft `g` and `c` cases are evaluated phonetically and explained.
- The reference is prompt guidance, not a language-specific phonetics engine.

---

### 6.5 Starter People Reference

**File(s):** `skills/pao-system/references/starter-people.json`
**Type:** New file

#### What it does

Supplies one concrete, recognizable, Major-System-compatible starter person for every code 00â€“99, with consonant cue and display name. It accelerates onboarding while preserving explicit user choice.

#### Interface / API

```json
{
  "schemaVersion": 1,
  "entries": {
    "34": { "consonants": "m-r", "peg": "Mary", "person": "Mary Poppins" }
  }
}
```

#### Logic / Algorithm

1. Load only when the user asks to see or adopt the starter list.
2. Present entries in the current ten-code batch.
3. Let the user accept, replace, or customize each entry.
4. Mark adopted entries with `source: starter` in `pao-list.json`.

#### Edge Cases & Error Handling

- Familiarity varies by culture; every entry is replaceable and the prompt asks for substitutions when recognition is weak.
- The list contains people/characters only, not default actions or objects, so Phase 3 remains personalized.
- Duplicate identities are avoided because distinctiveness matters during recall.

---

### 6.6 Interactive Router Skill

**File(s):** `skills/interactive/SKILL.md`
**Type:** New file

#### What it does

Provides the entry point and linked catalog for interactive utility skills, selects one method from the current conversation, and delegates execution to the canonical skill prompt.

#### Interface / API

```text
/interactive
/interactive <goal or source>
```

Canonical links:

```text
../sq3r/SKILL.md
../pq4r/SKILL.md
../pao-system/SKILL.md
```

#### Logic / Algorithm

1. If the user explicitly names a catalog skill, choose it.
2. Otherwise classify source/goal/sequence type from recent conversation.
3. Apply the SQ3R/PQ4R/PAO tie-break rules and select one primary method.
4. Ask at most one question only when selection changes materially based on the answer.
5. State the chosen skill and one-sentence rationale.
6. Read its canonical `SKILL.md` and begin immediately when required input exists.
7. If the file is absent, stop and give `npx vidbyte-skills <skill-name>`.

#### Edge Cases & Error Handling

- Short, unstructured, conceptual, or non-numeric tasks may match none of the initial catalog; explain the mismatch and name optional techniques without pretending they are installed.
- When SQ3R and PQ4R both fit, prefer PQ4R only when density, theory, reflection, or passive-reading risk is explicit; otherwise choose SQ3R.
- The router does not stack multiple gated methods in one session unless the user explicitly requests a later transition.

---

### 6.7 Interactive Utility Authoring Artifact

**File(s):** `artifacts/utility-interactive-skills.md`
**Type:** New file

#### What it does

Acts as the canonical design and authoring guide for skills whose primary product is a multi-turn user practice session rather than a one-shot answer.

#### Interface / API

The artifact will use these major sections:

```text
Intent and Definition
When an Interactive Utility Is Appropriate
Interaction Contract
Orientation Contract
Phase and Gate Design
Agent Work vs User Work
Evaluation, Retry, and Hint Policy
Inputs and Modes
State, Resume, and Artifact Design
Routing Through /interactive
References and Portability
Privacy and Security
Skill Template
Creation Checklist
Worked Patterns: SQ3R, PQ4R, PAO
Failure Modes and Anti-Patterns
```

#### Logic / Algorithm

1. Define the family by observable multi-turn behavior, not by topic.
2. Specify the orientation â†’ explain â†’ demonstrate â†’ halt â†’ evaluate â†’ advance loop.
3. Define a gate as user-produced evidence with pass/fail criteria and a non-answering hint path.
4. Explain mode design, source acquisition, local persistence, and resumability.
5. Explain `/interactive` catalog registration and canonical-skill delegation.
6. Provide a copyable `SKILL.md` outline and author checklist grounded in repository conventions.
7. Use the first three method skills as worked examples and explicitly document unavailable future neighbors.

#### Edge Cases & Error Handling

- The guide distinguishes an interactive utility from a questionnaire, a one-shot prompt formatter, and a silent background skill.
- It forbids gates that can pass on â€œdone,â€ passive agreement, or verbatim copying.
- It explains how to degrade when file, web, state, or sibling-skill capabilities are absent.

---

### 6.8 Catalog and Version Registration

**File(s):** `skills-manifest.json`, `lib/skill-versions.json`
**Type:** Modified

#### What it does

Registers the four new directories as learning skills and makes them an opt-in version 5 bundle.

#### Interface / API

```json
{
  "learning": ["interactive", "pao-system", "pq4r", "sq3r"],
  "5": ["interactive", "pao-system", "pq4r", "sq3r"]
}
```

The snippets are additive illustrations; existing arrays remain intact and catalog entries remain alphabetized where the file convention permits.

#### Logic / Algorithm

1. Add each name exactly once under `learning`.
2. Add numeric key `"5"` with the four names.
3. Preserve `_context_protocol` metadata and versions 1â€“4 unchanged.
4. Let existing validation verify directories, frontmatter, category uniqueness, and version references.

#### Edge Cases & Error Handling

- Do not add the skills to both `learning` and `utility`; the manifest rejects duplicate category membership.
- Version 5 remains opt-in because the installer default is version 1.

---

### 6.9 Public Catalog Documentation

**File(s):** `README.md`, `llms.txt`
**Type:** Modified

#### What it does

Documents installation, discovery, use cases, and authoring guidance for humans and docs-indexing systems.

#### Interface / API

README examples:

```bash
npx vidbyte-skills --version 5
npx vidbyte-learning-skills --version 5
npx vidbyte-skills interactive sq3r pq4r pao-system
```

#### Logic / Algorithm

1. Add a version 5 section with the four methods and concise distinctions.
2. Add four alphabetized rows to the README Learning table.
3. Link `artifacts/utility-interactive-skills.md` from the skill-authoring guidance.
4. Add searchable summaries and invocation names to the `llms.txt` Learning Skills section.

#### Edge Cases & Error Handling

- Documentation must not claim the version 5 bundle installs by default.
- `/interactive` must not be confused with the broader existing `/vidbyte-tutor` orchestrator; their catalogs and purpose are stated separately.
- Optional future skill redirects are labeled unavailable in this bundle.

---

## 7. Data Model Changes

### 7.1 Reading Session State

**Change type:** New

```yaml
schema_version: 1
method: sq3r | pq4r
status: in_progress | complete
source:
  type: path | url | pasted_text | transcript
  identifier: string
  access: full | partial
slug: string
current_phase: string
current_section: string | null
survey: string[]
goal: string | null
prediction: string | null
questions: string[]
answers: object[]
reflection: object | null
recitation_scorecard: object | null
gate_attempts: object
updated_at: ISO-8601
```

**Migration strategy:** N/A - new local Markdown frontmatter/body contract.

- Forward migration: Create state only for resumable/long sessions or when the host needs persistence.
- Rollback plan: Stop producing new state files; existing Markdown remains human-readable.

### 7.2 PAO List

**Change type:** New

```json
{
  "schemaVersion": 1,
  "updatedAt": "ISO-8601",
  "majorSystemMastered": true,
  "entries": {
    "00": {
      "consonants": "s/z-s/z",
      "person": "string|null",
      "action": "string|null",
      "object": "string|null",
      "source": "user|starter|null"
    }
  },
  "encodings": { "cards": { "9C": "39" } },
  "buildProgress": {},
  "drills": []
}
```

**Migration strategy:** N/A - new user-owned local JSON artifact.

- Forward migration: Initialize schema version 1, then update only fields accepted during the current gated session.
- Rollback plan: User retains the JSON; removing the skill does not delete user data.

### 7.3 PAO Session Log

**Change type:** New

```text
timestamp, target type/redacted target, code groups, scenes, loci,
recall attempts, exact score, misses, next recommended drill
```

**Migration strategy:** N/A - append-only Markdown session artifacts.

---

## 8. API Changes

N/A - no HTTP, backend, Python CLI, or installer API endpoint is created, modified, or deprecated. The skills use existing host file/web capabilities and only display the existing `vidbyte retain` CLI command as an optional handoff.

User-facing slash interfaces are documented in Section 6. The `SKILL.md` frontmatter description is the activation contract for automatic harness matching; direct invocations use `/sq3r`, `/pq4r`, `/pao-system`, and `/interactive`.

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/utility-interactive-skills.md` | Approved source of truth for implementation |
| CREATE | `artifacts/utility-interactive-skills.md` | Comprehensive intent and authoring guide for interactive utility skills |
| CREATE | `skills/sq3r/SKILL.md` | Interactive five-phase SQ3R workflow |
| CREATE | `skills/pq4r/SKILL.md` | Interactive six-phase PQ4R workflow |
| CREATE | `skills/pao-system/SKILL.md` | PAO onboarding, build, memorization, and drill workflow |
| CREATE | `skills/pao-system/references/major-system-map.md` | Reusable Major System teaching and validation reference |
| CREATE | `skills/pao-system/references/starter-people.json` | Optional starter people for codes 00â€“99 |
| CREATE | `skills/interactive/SKILL.md` | Linked catalog and context-based router for the interactive utility family |
| MODIFY | `skills-manifest.json` | Register all four skills in the learning category |
| MODIFY | `lib/skill-versions.json` | Add the version 5 interactive utility bundle |
| MODIFY | `README.md` | Document version 5 installation, skills, and authoring artifact |
| MODIFY | `llms.txt` | Add searchable public catalog descriptions |

Totals: **8 files created, 4 files modified, 0 files deleted.** The design document is the only file created before implementation approval.

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Host harness file tools | Capability-dependent | Read local sources and persist session artifacts | Medium - some harnesses may lack writes or hide files between sessions |
| Host harness web tools | Capability-dependent | Retrieve URL sources | Medium - URLs may be unreachable, paywalled, partial, or subject to quotation limits |
| Existing Vidbyte CLI | Existing `vidbyte retain` command | Optional user-run retention handoff | Low - no automatic invocation or new contract |
| Existing installer/validator | Node.js 18+ repository tooling | Discover, filter, install, and validate skills | Low - data-only registration changes |
| Major System | Static reference | Encode digits as consonant sounds | Low - prompt/reference content only |

No new npm, Python, or runtime dependency is introduced.

---

## 11. Rollout & Deployment

- Feature flags: N/A.
- Breaking change: No. Version 1 remains the default; version 5 is additive and opt-in.
- Migration path: Existing users install with `npx vidbyte-skills --version 5`, `npx vidbyte-learning-skills --version 5`, `--version all`, or explicit skill names.
- Deployment order:
  1. Commit this approved design doc in the isolated feature worktree.
  2. Add the artifact, four skills, and PAO references.
  3. Register category and version data.
  4. Update README and `llms.txt`.
  5. Run `npm test` and dry-run version/explicit selection commands.
  6. Complete the required adversarial refinement pass, commit fixes, and open a draft PR.
- Verification after implementation:
  - `npm test`
  - `node bin/learning.js --version 5 --dry-run --platform codex`
  - `node bin/install.js --version 5 --dry-run --platform codex`
  - `node bin/install.js --version all --dry-run --skill interactive,sq3r,pq4r,pao-system --platform codex`
  - Manual prompt review against every phase, gate, flag, failure mode, output field, and router tie-break in Section 4.
- Rollback procedure: remove version 5 entries and learning-category registrations, revert README/`llms.txt`, and remove the new skill/artifact files. User-created session files remain user-owned and are not deleted.

---

## 12. Open Questions

- [ ] Should the new interactive methods be version `5` as designed, or should they be appended to an existing version bundle?
- [ ] Should all four be categorized as `learning` as designed, or do you want the three method skills and router under the manifest's `utility` category despite their study/retention behavior?
- [ ] Is `artifacts/utility-interactive-skills.md` the intended meaning of â€œan artifact in the root folder,â€ or do you want `utility-interactive-skills.md` directly at repository root?
- [ ] Should the PAO starter reference contain people only as designed, preserving personalized actions/objects, or ship a complete starter PAO triple list?
- [ ] For long reading sessions, should completed `.state.md` checkpoints be retained and marked complete as designed, or should the skill ask permission to remove them after producing the final handoff?

---

## 13. Alternatives Considered

### Alternative 1: Categorize the Bundle as Utility

- What: Add all four names to `skills-manifest.json` under `utility`.
- Why rejected: Repository documentation defines `learning` as tutoring, retention, and study workflows, which precisely matches these skills. The learning-specific binary also filters the learning category, so utility placement would make a learning-method bundle less discoverable there.

### Alternative 2: Make PQ4R Import SQ3R at Runtime

- What: Keep only PQ4R-specific phases in its prompt and require reading `../sq3r/SKILL.md` for shared logic.
- Why rejected: Explicit skill installation can install PQ4R without SQ3R. A hard sibling dependency would make the installed skill incomplete; self-contained mirrored logic is more portable.

### Alternative 3: Put a Shared Major System Reference at `skills/references/`

- What: Create one repository-wide reference outside any named skill.
- Why rejected: The installer copies selected skill folders, not arbitrary shared directories. PAO ownership guarantees the reference is installed with its consumer; a future shared-resource mechanism would require a separate installer design.

### Alternative 4: Embed the Full Starter List in `SKILL.md`

- What: Put all 100 starter people inline in the PAO prompt.
- Why rejected: It would consume context on every invocation, obscure the interactive algorithm, and make culturally-specific substitutions harder to maintain. A lazily read JSON reference keeps the prompt focused.

### Alternative 5: Expand `/vidbyte-tutor` Instead of Adding `/interactive`

- What: Add SQ3R, PQ4R, and PAO routing to the existing broad learning orchestrator.
- Why rejected: The user explicitly requested `/interactive`, and its purpose is narrower: route only interaction-based utility methods and immediately start the chosen gated workflow. Keeping separate catalogs prevents the already broad tutor from becoming a catch-all.

### Alternative 6: Add Executable Parsers and State Managers

- What: Build scripts for source parsing, flag parsing, JSON validation, atomic writes, and resume state.
- Why rejected: The requested change is prompt-centered and explicitly uses the no-tests workflow. Existing host capabilities can perform the work without introducing runtime code or new verification obligations. The artifact leaves room for scripts later if real cross-harness failures justify them.


