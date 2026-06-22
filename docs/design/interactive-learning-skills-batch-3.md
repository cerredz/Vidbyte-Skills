# Design Doc: Interactive Learning Skills Batch 3

**Status:** Draft
**Author:** Codex
**Created:** 2026-06-21
**Last Updated:** 2026-06-21

---

## 1. Overview

Add ten self-contained interactive skills to Vidbyte Skills: `/bullet-journal`, `/para`, `/insert`, `/flow-notes`, `/dr-ta`, `/solo`, `/think-aloud`, `/gtd`, `/1-3-5`, and `/woop`. Each skill will teach its named protocol, halt for observable user work, enforce its defining constraint, persist local state or handoffs, and support the requested setup/review/history modes without adding runtime services. The supplied collaborative-learning, critical-thinking, attention, reflection, and creativity catalogs remain research context for later batches.

---

## 2. Goals & Non-Goals

### Goals

- Implement complete prompt-led workflows for the ten fully specified skills.
- Preserve each method's origin, use-case boundary, exact protocol, measurable gates, and signature move.
- Support longitudinal state for Bullet Journal, PARA, SOLO, Think-Aloud, GTD, 1-3-5, and WOOP using local artifacts.
- Handle paths, URLs, pasted text, note collections, timers, and reminders through capability checks and honest fallbacks.
- Register all ten skills under `learning`, place them in a new opt-in version 6 bundle, and document them in public catalogs.
- Keep the skills independently installable and avoid dependencies on open PRs or absent sibling skills.

### Non-Goals

- Implement the ~35 ΓÇ£Niche Strategies by DomainΓÇ¥ candidates or their top-three recommendations in this change.
- Modify `/interactive` or files proposed by open PR #105.
- Modify the version 5 skills proposed by PR #106.
- Add notification daemons, cron jobs, calendar integrations, note-app APIs, filesystem watchers, or background workers.
- Add backend endpoints, authenticated CLI commands, package dependencies, or new verification scripts.
- Claim that a physical notebook entry, timed pause, file-open history, live silence, or reminder occurred when the host cannot observe it.
- Provide clinical diagnosis, therapy, or medical treatment through productivity or metacognitive workflows.

---

## 3. Background & Context

Vidbyte skills are portable prompt packages under `skills/<name>/SKILL.md`. The Node installer discovers folders automatically; `skills-manifest.json` assigns categories; `lib/skill-versions.json` controls bundles; validation checks matching hyphen-case names, descriptions, and valid registrations. The root `README.md` and `llms.txt` are the public catalogs. Prompt packages may write user-owned local artifacts but cannot assume a persistent process or third-party application integration.

The repository's established interactive pattern is: orient, explain, prepare, gate, halt, evaluate, retry/hint, persist, and advance. The agent removes clerical friction but does not perform the cognitive decision, explanation, classification, prediction, reflection, or recall gate for the user. Recommendations to sibling skills are availability-aware.

This batch is standalone from `origin/main`. Version 6 avoids colliding semantically with the open version 5 batches. The local `main` checkout already contains two unrelated untracked design documents; implementation will use an isolated worktree and preserve them. Several requested features require capability boundaries: reminder requests become due dates and exact resume commands when scheduling is unavailable; ΓÇ£30 seconds of silenceΓÇ¥ requires a timestamped live transcript or an explicit pause marker; note-access staleness uses observable file metadata or state history, never invented app analytics.

---

## 4. Requirements

### Functional Requirements

1. `bullet-journal` SHALL attribute Ryder Carroll, teach Rapid Logging symbols and the four modules, and identify monthly Migration as the defining move.
2. Bullet Journal SHALL support setup, `--daily`, `--migrate`, `--future`, and `--review`; persist `bullet-journal-state.json`; and treat the physical notebook as authoritative when used.
3. Setup SHALL gate Index confirmation, a six-month Future Log with at least three items or explicit emptiness, a Monthly Log with at least five tasks, and a Daily Log with at least five correctly typed entries.
4. Bullet syntax SHALL distinguish tasks, events, notes, priority, complete, migrated, and scheduled markers and reject prose-heavy or misclassified entries.
5. Migration SHALL require rewrite, delegate, or strike for every open task; ΓÇ£laterΓÇ¥ SHALL fail. State SHALL track task age and flag tasks migrated three or more times.
6. A new month SHALL not be marked active until the prior month's open tasks are migrated. Reminder scheduling SHALL occur only through a confirmed host capability; otherwise state stores a due date and resume command.
7. Bullet Journal SHALL discourage decoration replacing logging and redirect long-form prose to a separate journal.
8. `para` SHALL attribute Tiago Forte, teach Projects/Areas/Resources/Archives, and enforce actionability rather than topic as the classification rule.
9. PARA SHALL support setup, `--classify <note>`, `--classify-all`, `--review`, and `--audit`; persist `para-state.json`; and work through accessible files/notes or manual entries without assuming a note-app API.
10. Setup SHALL require four numbered top-level folders, then at least three valid Projects (or explicit none), three Areas, and three Resources.
11. Projects SHALL require an active outcome and finish line; Areas SHALL require ongoing responsibility; Resources SHALL require likely future reference; Archives SHALL contain inactive preserved items.
12. Every classification SHALL run the four-question decision flow and require a one-sentence justification. ΓÇ£Might need somedayΓÇ¥ SHALL route to Archives/delete rather than Resources.
13. PARA weekly review SHALL process completed Projects, new captures, and category changes. Staleness audits SHALL use only observable timestamps/state and flag Resources inactive for 90+ days and Projects inactive for 30+ days.
14. If review is overdue, PARA SHALL preserve new captures but block further classification/audit claims until review completes, avoiding data loss while enforcing maintenance.
15. `insert` SHALL attribute Barto and Caverly, teach the five symbols, and support source input, `--review`, `--symbols`, and `--confidence-check`.
16. INSERT symbol training SHALL require 4/5 correct scenario classifications.
17. INSERT SHALL present sources in 1ΓÇô3 paragraph chunks and require at least one user-selected mark per chunk with symbol, location/phrase, and required note for `?`/`ΓåÆ`.
18. INSERT SHALL cap `*` at the top 3ΓÇô5 ideas, challenge all-`Γ£ô` marking, and prompt for at least one defensible connection when none appears.
19. Post-reading review SHALL build Questions, Study Notes, Connections, and Confidence lists from accepted marks and require a disposition for every question.
20. Confidence calibration SHALL require an original one-sentence explanation for every `Γ£ô`; failed explanations downgrade the mark to `?` and update Questions.
21. INSERT SHALL save `insert-<slug>.md` with marked text or copyright-safe pointers/excerpts, all four lists, calibration results, and a retain block derived from accepted `*`/`!` marks.
22. `flow-notes` SHALL attribute Scott Young, distinguish argument flow from transcription, and support source input, `--synthesis`, `--connect`, and `--lecture`.
23. Flow Notes training SHALL require 2/3 correct flow-note versus fact-note choices.
24. For every source chunk, the user SHALL provide at least two phrase-level big ideas and one meaningful arrow. Lists without arrows fail.
25. The agent SHALL detect likely transcription through excessive full-sentence/word volume, require compression, preserve inline `?` questions, and skip lookup-able facts unless structurally necessary.
26. Synthesis SHALL occur immediately when possible or record elapsed time, hide detailed notes, and require 2ΓÇô3 original sentences describing the argument's movement rather than topic.
27. Deep connection SHALL require specific answers about prior material, prior knowledge, and the weakest link/counterfactual.
28. `--lecture` SHALL use lighter per-chunk batching without removing arrow/synthesis requirements. Final output SHALL be `flow-notes-<slug>.md` with synthesis first, flow map, connections, questions, and retain block.
29. `dr-ta` SHALL attribute Russell Stauffer, teach predictΓåÆreadΓåÆverify, and support source input, `--section <n>`, and `--synthesis`.
30. Prediction-rule training SHALL require 2/3 correct testability judgments.
31. Before each section, DR-TA SHALL show structure/previous accepted context but not unread content and require a specific falsifiable prediction.
32. After reading, every verification SHALL be confirmed/refuted/partial and cite a specific passage or copyright-safe short excerpt/pointer. Verdict without evidence fails.
33. Predictions SHALL be tracked across sections; repeated non-evolving predictions trigger a model-updating challenge.
34. Final synthesis SHALL state the actual argument and describe how prediction history changed. Output SHALL be `dr-ta-<slug>.md` with cycles, synthesis, and retain block.
35. `solo` SHALL attribute Biggs and Collis, teach all five SOLO levels, and identify SOLO as assessment rather than a primary study method.
36. SOLO training SHALL require 2/3 correct classifications. Assessment SHALL collect an unaided explanation of at least three sentences to a specific relational question.
37. Classification SHALL follow the mandatory five-level structural checklist and cite exact evidence from the user's response for the assigned level.
38. SOLO SHALL prescribe a level-specific next action and require the user to commit to one concrete study step.
39. `--reassess` SHALL use a different question, compare level change, and never equate memorized phrasing with growth. `--history` SHALL scan matching local artifacts.
40. SOLO SHALL save `solo-<topic>-<timestamp>.md` with question, response, evidence-based level, prescription, and linked reassessment history.
41. `think-aloud` SHALL attribute Ericsson and Simon, teach concurrent narration versus explanation, and support user problems, `--problem <type>`, `--analyze`, and `--history`.
42. Think-Aloud training SHALL require 2/3 correct segment labels and a warm-up with at least five thought units.
43. The real task SHALL require raw concurrent narration, allow fragments/false starts, redirect explanation with the supplied wording, and block filtering.
44. Silence SHALL be prompted only when observable through a live timestamped transcript or explicit pause marker. In ordinary text chat, the skill SHALL use chunk checkpoints and never claim unseen 30-second silence.
45. Analysis SHALL segment/categorize thought units, count strategy selection/switching, self-caught/uncorrected errors, confusion markers, and stuck points, and cite at least one exact transcript moment.
46. Think-Aloud SHALL prescribe one specific metacognitive target, require commitment, save `think-aloud-<timestamp>.md` with transcript/report/target/retain block, and compute history only from saved sessions.
47. `gtd` SHALL attribute David Allen, teach Capture, Clarify, Organize, Reflect, Engage, and distinguish action management from PARA/analog Bullet Journal.
48. GTD SHALL support setup, `--weekly-review`, `--daily`, `--capture <item>`, `--next-actions`, `--projects`, and `--audit`; persist `gtd-state.json`.
49. Mind Sweep SHALL use trigger categories and require at least 15 captures before setup proceeds.
50. Clarify SHALL process each item individually to a disposition, enforce the two-minute rule, delegation/Waiting For, and Project versus single-action distinction.
51. Next Actions SHALL be physical, visible, context-tagged actions; every Project SHALL have a defined outcome and at least one Next Action.
52. Weekly Review SHALL gate all seven requested checks. Quick Capture SHALL always preserve an item, but stale systems SHALL block non-capture workflows until review completes.
53. Daily Engage SHALL filter by context, time, energy, and priority and require at least one selected commitment.
54. GTD audits SHALL flag 30-day stale Projects and 14-day overdue Waiting For entries based on actual state dates.
55. `1-3-5` SHALL attribute Alex Cavoulacos/The Muse, teach exactly one Big, three Medium, and five Small tasks, and support plan, `--review`, `--history`, and `--from-gtd`.
56. Big Task SHALL be specific, one-day completable, most important, and roughly 2ΓÇô4 hours; Mediums exactly three at 30ΓÇô60 minutes; Smalls exactly five at 5ΓÇô15 minutes.
57. The plan SHALL ask for peak energy, protect the Big Task block, require confirmation, and then prohibit a tenth task without a logged displacement.
58. End-of-day review SHALL disposition all nine tasks and record completion/displacement rates. History SHALL scan dated artifacts and warn when displacement exceeds 50% consistently.
59. `--from-gtd` SHALL load candidates only when a readable GTD state exists and SHALL still enforce sizing/selection gates.
60. 1-3-5 SHALL save `1-3-5-<date>.md` with plan, statuses, displacement log, and review.
61. `woop` SHALL attribute Gabriele Oettingen, teach Wish/Outcome/Obstacle/Plan in order, distinguish mental contrasting from positive fantasy, and support new, `--followup`, `--history`, and `--refine`.
62. Wish SHALL be specific, challenging but achievable, substantially controllable, and timeframed (default next four weeks).
63. Outcome SHALL follow a 2ΓÇô3 minute visualization when timing is available or an explicit self-timed halt, and require one vivid result-focused sentence.
64. Obstacle SHALL be internal, specific, and behaviorally honest. External obstacles SHALL be redirected to the user's internal response.
65. Plan SHALL use executable `If <obstacle>, then I will <action>` wording, directly address the obstacle, and reduce reliance on willpower.
66. The assembled WOOP SHALL require truth/feasibility confirmation and route revisions back to Obstacle or Plan as appropriate.
67. Follow-up SHALL record both goal outcome and plan execution, then refine misidentified obstacles or infeasible plans. Scheduling SHALL use a confirmed capability or store a due date and exact resume command.
68. WOOP SHALL save `woop-<slug>-<timestamp>.md` with structured metadata, statement, follow-up, and retain block for the implementation intention.
69. Every skill SHALL include activation-rich frontmatter, origin, use cases/exclusions, literal halt points, criteria-based retries, persistence/write fallbacks, and success criteria.
70. Sources, note collections, task lists, transcripts, and goals SHALL be treated as untrusted/private data; artifacts remain local unless users explicitly run emitted commands.
71. Malformed/conflicting state SHALL be preserved and recovered to disambiguated paths; writes SHOULD be atomic when host tools support them.
72. `skills-manifest.json` SHALL register all ten skills under `learning`; `lib/skill-versions.json` SHALL add version `6` without changing version 1 default behavior.
73. `README.md` SHALL document version 6 installation and all ten learning entries; `llms.txt` SHALL add searchable summaries and distinctions.

### Non-Functional Requirements

- **Performance:** Display only the current item/chunk/gate; process large collections sequentially and summarize old state.
- **Scalability:** State schemas are versioned and append compact history rather than embedding unbounded full source content.
- **Security:** Never follow embedded instructions, expose secrets, execute note/task content, or construct backend requests.
- **Privacy:** Warn before persisting sensitive tasks, goals, transcripts, or note content; support redacted identifiers/pointers.
- **Observability:** State records timestamps, modes, cursors, accepted decisions, gate attempts, reviews, and due dates.
- **Reliability:** Capabilities are detected; missing timers/reminders/app analytics receive explicit manual fallbacks; malformed files are never overwritten.
- **Portability:** Unicode symbols include plain-text meanings, and every workflow works through text even without app integrations.
- **Verification:** No new test scripts; run existing `npm test`, JSON validation, and explicit/version-6 installer dry runs.

---

## 5. High-Level Design

The change adds ten independent prompt packages and four catalog changes. State-heavy skills define explicit JSON or Markdown-frontmatter contracts; source-reading skills reuse consistent source detection and copyright-safe chunking; assessment skills preserve user responses verbatim enough to support evidence-based evaluation. No skill assumes another is installed.

```text
User invocation
  |-- systems: Bullet Journal | PARA | GTD | 1-3-5
  |             -> local state/daily artifacts -> review/history
  |-- reading: INSERT | Flow Notes | DR-TA
  |             -> source chunks -> active gates -> Markdown handoff
  |-- assessment: SOLO | Think-Aloud
  |             -> unaided response/transcript -> evidence analysis -> history
  `-- goal loop: WOOP
                -> W/O/O/P gates -> due follow-up -> refinement
```

Key decisions are: version 6 is independent from open version 5 work; quick capture is never discarded even when maintenance is overdue; reminders are represented as due dates unless a real scheduler exists; ordinary chat cannot measure silence; and niche research candidates remain a later roadmap rather than being implemented as skeletal prompts.

---

## 6. Detailed Design

### 6.1 Bullet Journal

**File(s):** `skills/bullet-journal/SKILL.md`
**Type:** New file

#### What it does

Guides physical/digital BuJo setup, rapid logging, future additions, reviews, and mandatory monthly migration.

#### Interface / API

```text
/bullet-journal [--daily|--migrate|--future|--review]
bullet-journal-state.json
```

#### Logic / Algorithm

1. Load/recover state and route mode.
2. Teach syntax and gate Index, Future, Monthly, Daily modules.
3. Persist page/module/task metadata while treating physical confirmation honestly.
4. On migration, present every open task individually and require rewrite/delegate/strike.
5. Increment migration age, flag age ΓëÑ3, close month only after all decisions.

#### Edge Cases & Error Handling

- No scheduled future items is accepted explicitly; insufficient daily/monthly entries retry.
- Long-form prose and decoration-first behavior receive method-boundary corrections.
- Missing scheduler stores due date/resume command without claiming a reminder.

### 6.2 PARA

**File(s):** `skills/para/SKILL.md`
**Type:** New file

#### What it does

Builds an actionability-based four-folder system and maintains classifications/reviews.

#### Interface / API

```text
/para [--classify <note>|--classify-all|--review|--audit]
para-state.json
```

#### Logic / Algorithm

1. Select tool/location and gate folder creation.
2. Define/gate Projects, Areas, Resources.
3. Classify notes one at a time through the PΓåÆAΓåÆRΓåÆArchive/delete flow with justification.
4. Run weekly review and timestamp activity/classifications.
5. Audit only observable state/file dates.

#### Edge Cases & Error Handling

- Topic-folder proposals are reframed by actionability.
- Resource dumping and ΓÇ£somedayΓÇ¥ justifications fail.
- Overdue review permits safe capture but blocks classification until maintenance completes.

### 6.3 INSERT

**File(s):** `skills/insert/SKILL.md`
**Type:** New file

#### What it does

Runs symbol training, chunk marking, list extraction, and mandatory confidence calibration.

#### Interface / API

```text
/insert <path|URL|text>
/insert --review [artifact]
/insert --symbols
/insert --confidence-check [artifact]
```

#### Logic / Algorithm

1. Detect source/access and teach/quiz symbols.
2. Chunk source and collect user marks with locations/notes.
3. Enforce engagement, star selectivity, and connection prompting.
4. Build four review lists and disposition all questions.
5. Test every check mark through original explanation; downgrade failures.
6. Write final handoff and retain block.

#### Edge Cases & Error Handling

- Third-party text uses pointers/limited excerpts rather than a reproduced marked work.
- No marks, all checks, no connections, or >5 stars trigger targeted retries.

### 6.4 Flow Notes

**File(s):** `skills/flow-notes/SKILL.md`
**Type:** New file

#### What it does

Captures big ideas and directed relationships, then requires synthesis and deep connections.

#### Interface / API

```text
/flow-notes <path|URL|text>
/flow-notes --synthesis [artifact]
/flow-notes --connect [artifact]
/flow-notes --lecture
```

#### Logic / Algorithm

1. Detect source/mode and teach flow versus fact notes.
2. Gate phrases and at least one arrow per chunk; retain inline questions.
3. Detect transcription and require compression.
4. Hide details and gate 2ΓÇô3 sentence throughline synthesis.
5. Gate all three connection/counterfactual prompts.
6. Save synthesis-first handoff.

#### Edge Cases & Error Handling

- Factual reference or derivation-heavy sources receive better-method guidance.
- A topic summary, missing arrows, or generic connections fail.
- ΓÇ£Within 30 minutesΓÇ¥ is recorded honestly from timestamps.

### 6.5 DR-TA

**File(s):** `skills/dr-ta/SKILL.md`
**Type:** New file

#### What it does

Runs falsifiable prediction, section reading, evidence verification, and evolving prediction cycles.

#### Interface / API

```text
/dr-ta <path|URL|text>
/dr-ta --section <n>
/dr-ta --synthesis [artifact]
```

#### Logic / Algorithm

1. Detect structured source and teach prediction testability.
2. Show structure only and gate a first falsifiable prediction.
3. Present one section, confirm reading, then gate verdict plus evidence.
4. Repeat with updated predictions and track evolution.
5. Gate synthesis against prediction history and actual argument.

#### Edge Cases & Error Handling

- Vague predictions and unsupported verdicts remain blocked.
- Unstructured/reference sources receive a method-boundary redirect.
- Evidence from third-party sources remains excerpt-limited.

### 6.6 SOLO

**File(s):** `skills/solo/SKILL.md`
**Type:** New file

#### What it does

Assesses structural depth of an unaided explanation, prescribes a next move, and tracks reassessment growth.

#### Interface / API

```text
/solo <topic>
/solo --reassess <topic>
/solo --history <topic>
/solo --teach
```

#### Logic / Algorithm

1. Teach/quiz five levels.
2. Generate a relational open question and collect ΓëÑ3 unaided sentences.
3. Apply the five-level checklist and cite response evidence.
4. Prescribe level-specific study activity and gate commitment.
5. Reassess with a new question and link artifacts/history.

#### Edge Cases & Error Handling

- Short/copied responses retry in the user's own words.
- Disputed classifications are explained through structural distinctions and may be re-attempted.
- History reports only saved evidence, not inferred past levels.

### 6.7 Think-Aloud

**File(s):** `skills/think-aloud/SKILL.md`
**Type:** New file

#### What it does

Coaches concurrent no-filter narration, analyzes cognitive moves, and assigns one metacognitive practice target.

#### Interface / API

```text
/think-aloud
/think-aloud --problem <math|logic|coding|design>
/think-aloud --analyze [transcript]
/think-aloud --history
```

#### Logic / Algorithm

1. Teach/quiz narration versus explanation/filtering.
2. Gate a five-unit warm-up.
3. Collect real-task narration in chunks without solving for the user.
4. Redirect explanation/filtering; handle only observable pauses.
5. Segment/code transcript, count moves/errors/confusion, and cite exact moments.
6. Prescribe/gate one next-session target and save report/retain block.

#### Edge Cases & Error Handling

- Answer-only attempts redo narration.
- Automatic tasks receive a poor-fit warning.
- Generic analysis is invalid without transcript evidence.
- Coding tasks avoid exposing secrets and may reference code paths rather than embedding sensitive content.

### 6.8 GTD

**File(s):** `skills/gtd/SKILL.md`
**Type:** New file

#### What it does

Builds and maintains a trusted action-management system with mandatory clarification and Weekly Review.

#### Interface / API

```text
/gtd [--weekly-review|--daily|--capture <item>|--next-actions|--projects|--audit]
gtd-state.json
```

#### Logic / Algorithm

1. Load/recover state and route quick capture safely.
2. Run ΓëÑ15-item Mind Sweep.
3. Clarify each item through actionability, two-minute, delegation, and Project tests.
4. Build Next Actions, Projects, Waiting For, Someday/Maybe, Calendar, Reference.
5. Require a Next Action per Project.
6. Gate all seven Weekly Review steps and daily four-factor engagement.

#### Edge Cases & Error Handling

- Vague/project-shaped Next Actions retry as physical visible verbs.
- Calendar accepts only date/time-specific commitments.
- Overdue review blocks processing/engagement but never loses quick captures.

### 6.9 1-3-5

**File(s):** `skills/1-3-5/SKILL.md`
**Type:** New file

#### What it does

Creates a constrained nine-task daily plan, enforces displacement, and trends plan realism.

#### Interface / API

```text
/1-3-5 [--review|--history|--from-gtd]
1-3-5-<date>.md
```

#### Logic / Algorithm

1. Select/gate one Big Task.
2. Select/gate exactly three Medium and five Small tasks.
3. Assign Big Task to peak-energy block and confirm plan.
4. Require displacement for any new task and log it.
5. Disposition all nine at review and compute history rates from dated files.

#### Edge Cases & Error Handling

- Oversized/vague tasks are sliced; mis-sized tasks reclassify.
- Meeting-driven days receive a fit warning but may use reduced controllable windows only after acknowledgement.
- Existing same-date files resume or use an explicit overwrite decision; never silently replace.

### 6.10 WOOP

**File(s):** `skills/woop/SKILL.md`
**Type:** New file

#### What it does

Runs ordered mental contrasting, creates an executable implementation intention, and learns from follow-up.

#### Interface / API

```text
/woop [--followup [artifact]|--history|--refine [artifact]]
woop-<slug>-<timestamp>.md
```

#### Logic / Algorithm

1. Gate a specific controllable timeframed Wish.
2. Gate a vivid result-focused Outcome after visualization.
3. Gate the main internal specific Obstacle.
4. Gate a directly matched executable if-then Plan.
5. Assemble and confirm truth/feasibility.
6. Store follow-up due date, then record achievement and plan execution for refinement.

#### Edge Cases & Error Handling

- Vague/unrealistic wishes, external obstacles, and willpower-only plans retry.
- Mental-health/clinical goals receive a non-clinical boundary and appropriate professional-support suggestion when needed.
- No scheduler means a due date/resume command, never a claimed reminder.

### 6.11 Catalog and Bundle Registration

**File(s):** `skills-manifest.json`, `lib/skill-versions.json`
**Type:** Modified

#### What it does

Registers ten learning skills and creates version 6.

#### Interface / API

```json
"6": ["1-3-5", "bullet-journal", "dr-ta", "flow-notes", "gtd", "insert", "para", "solo", "think-aloud", "woop"]
```

#### Logic / Algorithm

1. Add exact folder/frontmatter names to `learning`.
2. Add the sorted version 6 array.
3. Preserve all existing/default bundles.

#### Edge Cases & Error Handling

- Concurrent manifests merge as a union; no version 5 files are assumed.

### 6.12 Public Catalogs

**File(s):** `README.md`, `llms.txt`
**Type:** Modified

#### What it does

Documents version 6 installation, invocation modes, and method boundaries.

#### Interface / API

```text
npx vidbyte-skills --version 6
```

#### Logic / Algorithm

1. Add a version 6 install section/table.
2. Add ten Learning rows/summaries.
3. Distinguish nearby methods such as GTD/PARA/BuJo and INSERT/Flow/DR-TA.

#### Edge Cases & Error Handling

- Catalog commands and output names must match canonical prompts.

### 6.13 Design Document

**File(s):** `docs/design/interactive-learning-skills-batch-3.md`
**Type:** New file

#### What it does

Defines the approved standalone scope and implementation contract.

#### Interface / API

N/A - Design documentation only.

#### Logic / Algorithm

1. Commit this document first in the isolated implementation worktree.
2. Reconcile implementation and refinement against requirements/manifest.

#### Edge Cases & Error Handling

- Any scope change is documented before implementation diverges.

---

## 7. Data Model Changes

### 7.1 Bullet Journal State

**Change type:** New

```json
{
  "schemaVersion": 1,
  "modules": { "index": {}, "futureLog": {}, "monthlyLogs": {}, "dailyLogs": {} },
  "tasks": [{ "id": "string", "text": "string", "status": "open|completed|migrated|scheduled|delegated|struck", "migrationCount": 0 }],
  "migrationHistory": [],
  "updatedAt": "ISO-8601"
}
```

**Migration strategy:** New schema; malformed files recover to a disambiguated path. Rollback preserves user state.

### 7.2 PARA State

**Change type:** New

```json
{
  "schemaVersion": 1,
  "projects": [], "areas": [], "resources": [],
  "classifications": [{ "note": "safe identifier", "folder": "P|A|R|Ar|delete", "justification": "string", "classifiedAt": "ISO-8601" }],
  "reviews": [], "updatedAt": "ISO-8601"
}
```

**Migration strategy:** New schema; no automated movement occurs without user confirmation.

### 7.3 GTD State

**Change type:** New

```json
{
  "schemaVersion": 1,
  "inbox": [], "nextActions": {}, "projects": [], "waitingFor": [],
  "somedayMaybe": [], "calendar": [], "reference": [],
  "weeklyReviews": [], "updatedAt": "ISO-8601"
}
```

**Migration strategy:** New schema; state write never executes or delegates an action automatically.

### 7.4 Markdown History Artifacts

**Change type:** New

SOLO, Think-Aloud, 1-3-5, and WOOP use YAML frontmatter with `schema_version`, method/topic/date, status, due/reassessment linkage, and timestamps so history modes can scan artifacts without a central database.

**Migration strategy:** New artifacts; conflicting paths are resumed or disambiguated, not overwritten.

---

## 8. API Changes

N/A - The change adds prompt invocation grammars and local artifact contracts only. No HTTP endpoint, authenticated CLI command, or backend schema changes.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/interactive-learning-skills-batch-3.md` | Approved implementation contract |
| CREATE | `skills/bullet-journal/SKILL.md` | Bullet Journal setup/migration workflow |
| CREATE | `skills/para/SKILL.md` | PARA classification/review workflow |
| CREATE | `skills/insert/SKILL.md` | INSERT marking/calibration workflow |
| CREATE | `skills/flow-notes/SKILL.md` | Flow-note/synthesis workflow |
| CREATE | `skills/dr-ta/SKILL.md` | Prediction-verification reading workflow |
| CREATE | `skills/solo/SKILL.md` | SOLO assessment/history workflow |
| CREATE | `skills/think-aloud/SKILL.md` | Think-aloud analysis workflow |
| CREATE | `skills/gtd/SKILL.md` | GTD action-management workflow |
| CREATE | `skills/1-3-5/SKILL.md` | Constrained daily-planning workflow |
| CREATE | `skills/woop/SKILL.md` | WOOP goal/follow-up workflow |
| MODIFY | `skills-manifest.json` | Register ten learning skills |
| MODIFY | `lib/skill-versions.json` | Add opt-in version 6 bundle |
| MODIFY | `README.md` | Document version 6 and ten skills |
| MODIFY | `llms.txt` | Add searchable summaries/distinctions |

No files will be deleted.

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Existing installer/validator | Repository version | Discovery, validation, installation | Registration mismatch fails validation |
| Host file/web capabilities | Harness-dependent | Read sources/collections and write artifacts | Missing access requires manual/partial input |
| Host timer/scheduler capabilities | Optional | Timed visualization, review reminders, follow-ups | Most hosts cannot guarantee background timing; due-date fallback required |
| Existing `vidbyte retain` CLI | Existing contract | Optional user-run learning handoffs | Skills must not execute submissions automatically |

No new dependency or external service is introduced.

---

## 11. Rollout & Deployment

- After approval, create `feat/interactive-learning-skills-batch-3` from `origin/main` in a separate worktree, leaving the dirty main checkout untouched.
- Commit this design document first, then prompt packages, then catalog/bundle changes.
- Run JSON validation for state examples, `npm test`, explicit ten-skill dry run, and version 6 dry run.
- Version 1 remains default; version 6, `all`, or explicit skill names expose this batch.
- Rollback reverts repository files but never deletes user-created state/handoff artifacts.
- No feature flag or deployment ordering is needed.

---

## 12. Open Questions

N/A - Scope is the ten fully specified skills. Capability-dependent reminders, timing, note analytics, and silence detection have explicit honest fallbacks in this design.

---

## 13. Alternatives Considered

### Alternative 1: Implement all niche candidates

- What: Add roughly 35 additional skeletal skills from the research catalog.
- Why rejected: They lack the same full interactive specifications, would dilute quality, and materially exceed ΓÇ£do the same thingΓÇ¥ for the ten detailed skills.

### Alternative 2: Add these to version 5

- What: Extend the open interactive batches' version bundle.
- Why rejected: This change is standalone from `main`; version 6 avoids coupling and merge ambiguity while preserving opt-in installation.

### Alternative 3: Add scheduler and note-app integrations

- What: Implement reliable reminders, Notion/Obsidian APIs, and live activity tracking.
- Why rejected: That requires new code, credentials, dependencies, and platform-specific contracts. Portable prompt skills must use capability checks/manual fallbacks.

### Alternative 4: One generic productivity/reading skill

- What: Combine related methods behind modes in one large prompt.
- Why rejected: Each method has a different signature constraint, state schema, and activation boundary. Independent packages remain auditable and explicitly installable.
