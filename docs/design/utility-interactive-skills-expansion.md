# Design Doc: Utility Interactive Skills Expansion

**Status:** Approved
**Author:** Codex
**Created:** 2026-06-21
**Last Updated:** 2026-06-21

---

## 1. Overview

Add four self-contained guided learning skills to Vidbyte Skills: `/reap` for engaging with an author's framing through paraphrase and annotation, `/ok5r` for producing reusable study records from long structured material, `/dominic-system` for initial-based numeric and card memorization, and `/chain-method` for short ordered lists. PR #105 is design reference only; this change is independently based on `main` and does not modify files introduced by that PR.

---

## 2. Goals & Non-Goals

### Goals

- Add complete `SKILL.md` packages for all four requested methods.
- Use an orient → explain → demonstrate → halt → evaluate → advance interaction contract.
- Require observable user work at every learning or recall gate.
- Persist reading handoffs, resumable reading state, mnemonic systems, and recall scores locally.
- Register the skills under `learning`, bundle them in version 5, and document them publicly.
- Keep every skill independently installable and usable without PR #105's skills.

### Non-Goals

- Modify `/interactive`, `/sq3r`, `/pq4r`, `/pao-system`, or PR #105's authoring artifact.
- Add CLI commands, backend endpoints, runtime dependencies, or installer logic.
- Implement a generic workflow/state engine or shared `memory-systems.json` schema.
- Implement `/memory-palace`, a standalone Major System, rhyming pegs, or Cornell notes.
- Add test or verification scripts.

---

## 3. Background & Context

The repository installs portable prompt packages from `skills/<name>/SKILL.md`; optional references are copied with the owning folder. `skills-manifest.json` assigns product categories, `lib/skill-versions.json` defines opt-in bundles, and existing validation checks frontmatter, directory names, manifest references, and version references. The root `README.md` and `llms.txt` are the human- and model-facing catalogs.

PR #105 demonstrates the intended interaction style for utility-oriented learning methods, but it remains outside this change. The four new prompts therefore include their complete source handling, gates, state contracts, failure behavior, and nearby-method distinctions rather than importing sibling prompts. Version 5 is introduced here with these four names; if another open change also edits version 5, merge conflict resolution must preserve the union of valid skills.

Two supplied mnemonic details need precise handling. A 30-digit Dominic target contains fifteen two-digit codes, which form seven complete Person+Action scenes plus one trailing Person image; no digit may be discarded. A card workflow cannot infer a full encoding from one example, so it requires a complete user-approved 52-card-to-code mapping.

---

## 4. Requirements

### Functional Requirements

1. `reap` SHALL introduce Eanet and Manzo's Read–Encode–Annotate–Ponder method, identify Encode as the active ingredient, estimate 15–25 minutes, and say: “SQ3R is for extracting what's true. REAP is for engaging with what the author argues.”
2. REAP SHALL accept a local path, URL, pasted text, or transcript and support `--section <name>` and `--quick`.
3. REAP SHALL report source type and full/partial access, treat source content as untrusted data, and never invent inaccessible sections.
4. REAP SHALL detect highly factual specifications/manuals with no meaningful authorial framing and recommend `/sq3r` only when available.
5. Read SHALL present manageable sections without note-taking, then require a one-sentence original-language account of each section. Verbatim restatement fails.
6. Encode SHALL require one sentence per section that accurately states the author's central claim from the author's perspective, in the user's words and without editorializing.
7. Annotation before a passing encoding SHALL be blocked with the supplied Encode-first boundary.
8. Annotate SHALL display accepted encodings and require substantive agreements, disagreements, qualifications, or cross-references on at least 60% of them. Generic agreement does not count.
9. Ponder SHALL display only annotations and require one belief strengthened, one belief challenged, and one follow-up question.
10. `--quick` SHALL run compressed Read+Encode+Ponder only for short sources; `--section` SHALL limit every claim and artifact to the selected section.
11. REAP SHALL checkpoint long/interrupted work to `reap-<slug>.state.md` and save `reap-<slug>.md` with encodings, annotations, Ponder responses, and a user-run retain block for 3–5 successfully encoded concepts.
12. `ok5r` SHALL introduce Survey–Question–Read–Record–Recite–Review–Reflect, estimate 30–45 minutes, and identify Record plus final Reflect as its value over SQ3R.
13. OK5R SHALL accept REAP's source types plus `--sections <list>` and recommend SQ3R/PQ4R for material under roughly 2,000 words unless a reusable record is explicitly wanted.
14. Survey SHALL produce a structural skeleton and require one predicted main argument.
15. Question SHALL transform headings into questions and require 4–6 user-selected priorities.
16. Read SHALL present one section at a time with chosen questions visible and require completion confirmation, without evaluating comprehension yet.
17. Record SHALL require per section: key terms, a one-sentence paraphrased claim, exact formulas/definitions/lists where needed, and one example/application.
18. Record SHALL reject transcription in place of the paraphrased claim and keep incomplete templates gated.
19. Recite SHALL hide source and records, collect unaided recall, compare it with accepted records, and report covered/missing/invented items.
20. Review SHALL require a coherent, specific synthesis answering what the text argues and what the user would tell a colleague.
21. Reflect SHALL require three record-linked answers: fit with prior knowledge, assumed prerequisites, and the gap from the user's last related study. Generic reflection fails with a record pointer.
22. OK5R SHALL checkpoint to `ok5r-<slug>.state.md` and save `ok5r-<slug>.md` with all requested products and a retain block for 5–8 concepts.
23. Both reading skills SHALL avoid reproducing entire third-party works, preserve malformed state, checkpoint after accepted chunks, and provide inline handoffs when writes are unavailable.
24. `dominic-system` SHALL introduce Dominic O'Brien's initial-based system as a PAO sibling and teach `1=A, 2=B, 3=C, 4=D, 5=E, 6=S, 7=G, 8=H, 9=N, 0=O`.
25. Dominic Phase 1 SHALL drill ten shuffled single digits, five two-digit pairs, and a final ten-item mastery quiz, explicitly reinforcing `6=S`.
26. Phase 2 SHALL build 00–99 Person mappings in batches of ten, generate 3–5 matching candidates, accept user-supplied personal contacts, reject abstractions, and require unaided 10/10 batch recall.
27. Dominic SHALL offer a bundled starter 00–99 Person list only by explicit opt-in and never overwrite user choices.
28. Phase 3 SHALL assign one concrete signature Action per Person, allow substitutions, persist accepted values, and require unaided Person+Action batch recall.
29. Phase 4 SHALL accept digits or cards with a complete stable card map, normalize without dropping digits, encode pairs as `Person(first code) + Action(second code)`, request ordered loci, and document a trailing Person-only code.
30. Phase 4 SHALL refuse encoding when required fields are missing, route to the smallest incomplete batch, and require ordered scene recall followed by exact decoding.
31. Phase 5 SHALL provide applicable mapping, recent-session, random-number, and card drills, score exact recall, log misses, and recommend a next interval.
32. Dominic SHALL support onboarding, direct numeric input, `--build`, `--drill`, and `--export`; persist `dominic-list.json`; and save `dominic-session-<timestamp>.md`.
33. `dominic-list.json` SHALL include schema version, map mastery, 00–99 Person/Action entries, build progress, optional card mapping, and drill history; malformed JSON is preserved and recovered to a new path.
34. Dominic SHALL warn before persistence and redact credentials, payment data, IDs, recovery codes, and other sensitive raw targets by default.
35. `chain-method` SHALL introduce the Link/Chain method as a sub-five-minute technique for ordered lists of 5–20 items and explain its length/random-access limitations.
36. Phase 1 SHALL teach the eggs→milk→bread→apples example and require a three-item practice chain. Juxtaposition without action or a bland image fails.
37. Phase 2 SHALL accept a supplied list or `--topic <name> --count N`, generate a second-person sensory chain, hide it, and require unaided ordered recall.
38. Chain images SHALL make item A visibly act on/transform item B through patterns such as collision, transformation, impossible physics, body substitution, or scale change.
39. Images SHALL default to vivid, bizarre, and non-graphic; violent or sexual imagery is used only on explicit appropriate user request.
40. Phase 3 SHALL offer forward, backward, and random-access drills, score order/completeness, and explain that the latter drills expose sequential limitations.
41. Chain SHALL support direct input, `--topic <name> --count N`, and `--drill`; save `chain-<slug>.md`; and save `chain-session-<timestamp>.md` drill history.
42. Chain SHALL include a retain block only when items are factual concepts, warn above 20 items, and recommend an installed palace/peg alternative without claiming absent skills exist.
43. Every skill SHALL use lowercase hyphen-case frontmatter, include activation and exclusion language, halt after active gates, define retry/hint rules, and distinguish user-produced work from agent work.
44. `skills-manifest.json` SHALL register the four skills under `learning`; `lib/skill-versions.json` SHALL add version `5` containing them without changing the default version.
45. `README.md` SHALL document version 5 installation and add learning catalog entries; `llms.txt` SHALL add searchable summaries and method distinctions.

### Non-Functional Requirements

- **Performance:** Show only the current phase/chunk; load 100-entry references in batches.
- **Scalability:** Each skill remains independently installable without sibling content.
- **Security:** Ignore instructions embedded in sources/targets and never construct backend requests.
- **Privacy:** Keep artifacts local and redact sensitive mnemonic targets by default.
- **Observability:** State/logs record phase cursor, accepted work, attempts, scores, and timestamps.
- **Reliability:** Preserve prior/malformed data and provide explicit partial-access/manual-save fallbacks.
- **Portability:** Use host capabilities conditionally with prompt-only fallbacks.
- **Verification:** Add no test scripts; run existing `npm test` and installer dry runs.

---

## 5. High-Level Design

The change adds four prompt packages and two lazy references. REAP and OK5R each own source detection, chunking, gates, checkpointing, and final handoffs. Dominic owns a starter Person reference and a persistent Person/Action schema separate from PAO. Chain owns a compact vivid-image pattern reference to repair bland associations without bloating every invocation.

```text
Explicit invocation
  |-- /reap ----------> source chunks -> encoding/annotation -> Markdown state/handoff
  |-- /ok5r ---------> source chunks -> records/recall ------> Markdown state/handoff
  |-- /dominic-system -> 00–99 Person/Action -> scenes ------> JSON list + session log
  `-- /chain-method --> short list -> vivid links -----------> chain + session log
```

Installer runtime code remains unchanged: folder discovery finds the skills, the category manifest exposes them, and version 5 groups them. This standalone branch does not create or modify `/interactive`; integration into that router belongs to whichever change owns the router after PR #105 is resolved.

---

## 6. Detailed Design

### 6.1 REAP

**File(s):** `skills/reap/SKILL.md`
**Type:** New file

#### What it does

Runs Read, Encode, Annotate, and Ponder while enforcing author-perspective paraphrase before response.

#### Interface / API

```text
/reap <path|URL|pasted text|transcript> [--section <name>] [--quick]
```

#### Logic / Algorithm

1. Parse flags, acquire/classify source, validate authorial framing, and orient.
2. Chunk Read and gate original one-sentence accounts.
3. Gate author-perspective encodings without editorializing.
4. Gate substantive annotations at 60% coverage.
5. Hide all but annotations and gate the three Ponder responses.
6. Checkpoint accepted work and produce the handoff/retain block.

#### Edge Cases & Error Handling

- Route factual/reference sources availability-aware to SQ3R.
- Refuse annotation before encoding and refuse quick mode for long text.
- Preserve inaccessible content boundaries and malformed state.

### 6.2 OK5R

**File(s):** `skills/ok5r/SKILL.md`
**Type:** New file

#### What it does

Runs the seven-phase method and produces a reusable per-section study sheet.

#### Interface / API

```text
/ok5r <path|URL|pasted text|transcript> [--sections <list>]
```

#### Logic / Algorithm

1. Detect/validate source, scope, length, and access.
2. Run Survey and Question gates.
3. Present each Read chunk and await completion.
4. Validate all four Record fields per section.
5. Hide source/records and score Recite against records.
6. Gate Review synthesis and three record-linked Reflect responses.
7. Checkpoint and write the final study artifact/retain block.

#### Edge Cases & Error Handling

- Warn when short material makes OK5R excessive.
- Permit verbatim text only for exact formulas/definitions/lists.
- Cue a record entry after generic reflection without supplying the answer.

### 6.3 Dominic System

**File(s):** `skills/dominic-system/SKILL.md`, `skills/dominic-system/references/starter-people.json`
**Type:** New files

#### What it does

Teaches the digit map, builds/persists 00–99 Person/Action mappings, encodes numeric/card targets, and scores drills. The starter list is opt-in and replaceable.

#### Interface / API

```text
/dominic-system [<number>|--build|--drill|--export]
```

```json
{
  "schemaVersion": 1,
  "letterMapMastered": false,
  "entries": { "00": { "initials": "OO", "person": null, "action": null, "source": null } },
  "encodings": { "cards": {} },
  "buildProgress": { "peopleBatchesPassed": [], "actionBatchesPassed": [] },
  "drills": []
}
```

#### Logic / Algorithm

1. Route invocation, warn about plaintext, and initialize/recover state.
2. Teach and quiz the letter map.
3. Build People then Actions in gated batches; lazily offer starter People.
4. Validate target, mappings, card codes, and loci.
5. Create Person+Action scenes, test scene recall, then exact decoding.
6. Append redacted session/drill results and support non-mutating export.

#### Edge Cases & Error Handling

- Block nonnumeric targets without approved encoding and incomplete mappings.
- Require 52 unique codes for cards and preserve trailing codes/digits.
- Never fabricate personal contacts or overwrite malformed/user state.

### 6.4 Chain Method

**File(s):** `skills/chain-method/SKILL.md`, `skills/chain-method/references/vivid-image-patterns.md`
**Type:** New files

#### What it does

Teaches adjacent-item interaction, builds one chain, tests sequential recall, and documents known limitations.

#### Interface / API

```text
/chain-method <list>
/chain-method --topic <name> --count <N>
/chain-method --drill
```

#### Logic / Algorithm

1. Parse/generate the list and validate its length.
2. Teach the example/two rules and gate a three-item user chain.
3. Build second-person adjacent interactions using the reference as needed.
4. Hide and score ordered recall.
5. Offer forward/backward/random-access drills and save scores.

#### Edge Cases & Error Handling

- One item has no chain; two items receive one link and reduced drills.
- Disambiguate duplicates before imagery.
- Warn over 20 items and do not promise random access.
- Do not generate graphic content by default.

### 6.5 Catalog Registration

**File(s):** `skills-manifest.json`, `lib/skill-versions.json`
**Type:** Modified

#### What it does

Adds all four names to `learning` and creates version 5 with those names.

#### Interface / API

```json
"5": ["chain-method", "dominic-system", "ok5r", "reap"]
```

#### Logic / Algorithm

1. Add category names using existing ordering.
2. Add the opt-in version bundle without changing default installer behavior.
3. Preserve the union if concurrent version 5 work merges later.

#### Edge Cases & Error Handling

- Validation must find an exact matching folder/frontmatter name for every entry.

### 6.6 Public Catalogs

**File(s):** `README.md`, `llms.txt`
**Type:** Modified

#### What it does

Documents version 5 installation and concise selection guidance for all four skills.

#### Interface / API

```text
npx vidbyte-skills --version 5
```

#### Logic / Algorithm

1. Add the version 5 install section/table.
2. Add four Learning catalog entries.
3. Add corresponding searchable `llms.txt` sections and distinctions.

#### Edge Cases & Error Handling

- Commands, flags, and artifact names must match canonical prompts.

### 6.7 Design Document

**File(s):** `docs/design/utility-interactive-skills-expansion.md`
**Type:** New file

#### What it does

Defines the approved, standalone implementation contract.

#### Interface / API

N/A - Design documentation only.

#### Logic / Algorithm

1. Commit this file before implementation.
2. Reconcile implementation against requirements and manifest.

#### Edge Cases & Error Handling

- Any scope change must be documented before implementation diverges.

---

## 7. Data Model Changes

### 7.1 Reading State Markdown

**Change type:** New

```yaml
schema_version: 1
method: reap | ok5r
status: in_progress | complete
source_type: path | url | pasted | transcript
source_identifier: redacted-or-local-identifier
access: full | partial
current_phase: string
section_cursor: integer
gate_attempts: object
updated_at: ISO-8601
```

**Migration strategy:** No prior schema. Rollback never deletes user runtime artifacts.

### 7.2 Dominic List JSON

**Change type:** New

Uses the schema in section 6.3, with all keys `00`–`99`, timestamps, optional card encoding, and append-only drill summaries.

**Migration strategy:** No PAO auto-conversion. Malformed input recovers to a disambiguated file; rollback preserves user data.

### 7.3 Chain Markdown Artifacts

**Change type:** New

```markdown
# Chain: <slug>
## Source List
## Interaction Links
## Recall Scores
## Vidbyte Retain
```

**Migration strategy:** N/A - no prior schema.

---

## 8. API Changes

N/A - Only prompt invocation grammars and local artifact contracts are added. No HTTP or authenticated CLI API changes.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/utility-interactive-skills-expansion.md` | Approved standalone design |
| CREATE | `skills/reap/SKILL.md` | REAP workflow |
| CREATE | `skills/ok5r/SKILL.md` | OK5R workflow |
| CREATE | `skills/dominic-system/SKILL.md` | Dominic workflow |
| CREATE | `skills/dominic-system/references/starter-people.json` | Optional 00–99 starter People |
| CREATE | `skills/chain-method/SKILL.md` | Chain workflow |
| CREATE | `skills/chain-method/references/vivid-image-patterns.md` | Vivid interaction patterns |
| MODIFY | `skills-manifest.json` | Register learning skills |
| MODIFY | `lib/skill-versions.json` | Add version 5 bundle |
| MODIFY | `README.md` | Document installation and skills |
| MODIFY | `llms.txt` | Add model-facing summaries |

No files will be deleted.

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Existing installer/validator | Repository version | Discovery, category/version selection, validation | Catalog mismatch fails validation |
| Host file/web tools | Harness-dependent | Read sources and persist artifacts | Missing capability requires partial/inline fallback |
| Existing `vidbyte retain` CLI | Existing contract | Optional user-run handoff blocks | Skills must not execute transport automatically |
| PR #105 | Reference only | Interaction-design precedent | Concurrent catalog/version edits may conflict at merge |

No new dependency or service is introduced.

---

## 11. Rollout & Deployment

- Implement in `feat/utility-interactive-skills-expansion`, isolated from the dirty `main` checkout.
- Commit this design first, then skill packages, then catalog documentation.
- Run existing `npm test` and dry-run explicit/version 5 installs.
- Version 1 remains the default; version 5, `all`, and explicit names expose the additions.
- Rollback reverts repository commits but never deletes user-created artifacts.
- Concurrent version 5 changes must be merged as a union rather than one list replacing the other.

---

## 12. Open Questions

N/A - The user clarified that PR #105 is reference-only and approved implementation from `origin/main`. Starter-list entries remain replaceable specifically to handle cultural familiarity per user.

---

## 13. Alternatives Considered

### Alternative 1: Stack on PR #105

- What: Base this branch on `feat/utility-interactive-skills` and modify its router/artifact.
- Why rejected: The user explicitly clarified that PR #105 should only be viewed for intent/design.

### Alternative 2: Shared SQ3R/PAO runtime imports

- What: Import common phase logic or persistence from sibling skills.
- Why rejected: Explicit installs must be self-contained, and the methods have different gates/schemas.

### Alternative 3: Shared `memory-systems.json`

- What: Merge PAO and Dominic state immediately.
- Why rejected: It expands migration scope and couples this standalone skill to another open change.

### Alternative 4: Dynamic-only mnemonic references

- What: Generate starter People and vivid patterns on every invocation.
- Why rejected: Lazy bundled references improve consistency and portability while preserving user choice.
