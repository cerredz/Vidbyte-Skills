# Design Doc: Pre-Turn Self-Check and Pass/Fail Calibration Sections for Gated Interactive Skills

**Status:** Draft
**Author:** Claude
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

---

## 1. Overview

Add two new behavioral-alignment sections — `Pre-Turn Self-Check` and `Pass/Fail Calibration` — to every gated interactive learning skill in the repository (17 skills across batches 1–3), **and** expand the `/interactive` router's catalog so it can route to the full family instead of only the original three skills. The first section is a short per-turn checklist that forces the model to confirm gate state, user-work authenticity, hidden-material discipline, and persistence before it sends any response. The second supplies side-by-side just-passing vs. just-failing example responses for each of a skill's gates, so the model grades against a concrete line instead of a subjective "pass only if X." Both sections are skill-specific: the checklist items and the calibration examples are written against each skill's actual phases and gates. The router update is separate: `/interactive` currently catalogs only `sq3r`, `pq4r`, and `pao-system`, but 14 newer family skills (the expansion four and batch-3 ten) are missing from it; this change adds them to its Linked Catalog and Selection Algorithm. No manifest, version-bundle, or runtime changes are involved — these are in-prompt content additions only.

---

## 2. Goals & Non-Goals

### Goals

- Add a `## Pre-Turn Self-Check` section to all 17 gated interactive skills, with content tailored to that skill's gates, hidden material, and persistence artifacts.
- Add a `## Pass/Fail Calibration` section to all 17 gated interactive skills, with borderline just-passing vs. just-failing pairs for each gate type the skill defines.
- Place both sections at a consistent location across every skill so the family stays uniform and predictable.
- Reinforce the existing interactive contract (orient → explain → demonstrate → HALT → evaluate → persist; the user does the cognitive work; recognition ≠ recall) rather than introduce new behavior.
- Keep each skill independently installable; the new sections must be self-contained within each `SKILL.md`.
- Expand the `/interactive` router so its Linked Catalog and Selection Algorithm cover all 16 gated family skills (the current three plus the 14 missing ones), grouped by sub-family, with deterministic one-method routing preserved.
- Update the `/interactive` frontmatter description and Use Cases so they no longer imply the catalog is only SQ3R/PQ4R/PAO.

### Non-Goals

- Do **not** add `Pre-Turn Self-Check` or `Pass/Fail Calibration` to the `/interactive` router. It has no user-work gates and no hidden material, so neither section applies (confirmed with the user). The router is modified **only** to expand its catalog/routing.
- Do **not** change `skills-manifest.json`, `lib/skill-versions.json`, `README.md`, or `llms.txt`. These sections are internal prompt content, not catalog-facing metadata; the skills' descriptions and registrations are unchanged.
- Do **not** add the other behavioral sections discussed earlier (Turn Discipline, Integrity, Worked Example, Retention, Quick Reference, Coaching Tone, etc.). Only the two requested sections are in scope.
- Do **not** alter any existing phase, gate, threshold, Identity, Goal, Model Behavior, or Failure Modes content. The additions sit alongside existing content without rewriting it.
- Do **not** add tests or verification scripts (per the design-doc-no-tests workflow).
- Do **not** rename, reorder, or renumber existing sections.

---

## 3. Background & Context

The repository ships a family of gated interactive learning skills under `skills/<name>/SKILL.md`. Each one runs a multi-turn workflow: it orients the user, explains a phase, performs only agent-owned preparation, presents one explicit user-work gate, **HALTs**, evaluates the user's response on the next turn, persists accepted work, and advances only on a pass. The defining invariant is that the *user* does the cognitive work — paraphrasing, recalling, classifying, predicting, reflecting — and the agent never fills a gate or lets recognition substitute for recall.

These skills are LLM prompt packages, so the gap that matters is between what the prose *says* and what the model *does* at runtime. Two failure modes recur:

1. **Halt leakage / state confusion.** The model presents a gate and then answers it itself, runs two phases in one turn, reveals hidden material early, or forgets to persist accepted work. The "Interaction Contract" describes the loop but does not give the model a pre-send checkpoint.
2. **Lenient grading.** Each gate says "pass only if X," but X is subjective, and models drift toward passing weak work to be encouraging — accepting a near-copy as a paraphrase, "good point" as a substantive annotation, or recognition as recall.

The user asked (via `/design-doc-no-tests`) to add two targeted sections that close these gaps, with skill-specific content in each file. PR #110 (expansion: reap, ok5r, dominic-system, chain-method) and PR #112 (batch 3: ten more skills) have both merged to `main`, so `origin/main` now contains the full family. The local `main` checkout is stale; implementation will branch from `origin/main`.

The 17 in-scope gated skills, by batch:

- **Batch 1** (PR #105): `sq3r`, `pq4r`, `pao-system`
- **Expansion** (PR #106/#110): `reap`, `ok5r`, `dominic-system`, `chain-method`
- **Batch 3** (PR #112): `1-3-5`, `bullet-journal`, `dr-ta`, `flow-notes`, `gtd`, `insert`, `para`, `solo`, `think-aloud`, `woop`

The `interactive` router is explicitly excluded.

---

## 4. Requirements

### Functional Requirements

1. Every one of the 17 gated skills SHALL gain exactly one `## Pre-Turn Self-Check` section and exactly one `## Pass/Fail Calibration` section.
2. The `## Pre-Turn Self-Check` section SHALL be placed immediately after the skill's `## Interaction Contract` section (and, where a `## Persistent Data Contract` immediately follows Interaction Contract, before that Persistent Data Contract — i.e. directly adjacent to the turn-loop definition).
3. The `## Pass/Fail Calibration` section SHALL be placed immediately after the skill's final numbered `## Phase …` section and before the first non-phase section that follows it (e.g. `## Alternate Modes`, `## State and Resume`, `## Export Mode`, or `## Final Handoff`).
4. Each `## Pre-Turn Self-Check` SHALL contain a short checklist (5–8 items) the model runs before every response, including, adapted to the skill: (a) am I at an open gate I set last turn; (b) did the user actually produce the required work product, or only acknowledge / ask / paste material back; (c) am I about to reveal this skill's hidden material or the answer before the user has produced it; (d) is there accepted work I have not yet persisted to this skill's artifact/state file.
5. Each `## Pre-Turn Self-Check` SHALL additionally include at least one item that is specific to that skill's defining constraint (e.g. REAP "am I about to allow annotation before all encodings pass?"; Dominic "am I about to show a Person/Action during a hidden recall quiz?"; INSERT "am I about to exceed 3–5 star marks or skip a confidence check?").
6. Each `## Pass/Fail Calibration` SHALL contain, for each distinct gate type the skill defines, one just-passing example user response and one just-failing example user response, each with a one-line "Why" that names the deciding criterion.
7. Failing examples SHALL be *plausible near-misses* (the kind a model is tempted to pass), not obviously empty answers, because borderline cases are what calibrate the line.
8. Calibration examples SHALL use the skill's own domain and gate vocabulary and SHALL NOT reuse a skill's live demonstration example as a test item where the skill's demonstration-variation rule applies.
9. The additions SHALL NOT modify, reorder, renumber, or delete any existing section, frontmatter field, or gate threshold.
10. Both new sections SHALL use the same heading level (`##`) and formatting conventions as the surrounding sections so the files remain valid and visually consistent.
11. The `interactive` router SHALL NOT receive a `Pre-Turn Self-Check` or `Pass/Fail Calibration` section.
12. No `skills-manifest.json`, `lib/skill-versions.json`, `README.md`, or `llms.txt` entry SHALL change.
13. The `/interactive` `## Linked Catalog` SHALL list all 16 gated family skills (`sq3r`, `pq4r`, `reap`, `ok5r`, `insert`, `dr-ta`, `flow-notes`, `pao-system`, `dominic-system`, `chain-method`, `solo`, `think-aloud`, `gtd`, `para`, `bullet-journal`, `1-3-5`, `woop`), each with a repository-relative canonical link to its `SKILL.md`, a short purpose statement, "choose when" conditions, and a "prefer a sibling when" redirect.
14. The catalog SHALL be organized into labeled sub-family groups (Reading & study; Memory / mnemonic; Comprehension & metacognition; Productivity & organization; Goal-setting) so routing stays scannable and deterministic.
15. The `## Selection Algorithm` SHALL be extended to first classify the user's need by sub-family, then select exactly one method within it using the sub-family tie-breakers, preserving the existing "explicit skill name wins" and "at most one clarifying question" rules.
16. The frontmatter `description` and `## Use Cases` SHALL be updated so they no longer name only SQ3R/PQ4R/PAO and instead describe the broader family.
17. Existing catalog entries for `sq3r`, `pq4r`, and `pao-system` SHALL be preserved in substance (regrouped, not rewritten); new entries MAY use a more compact entry format to keep the file manageable.
18. The router SHALL continue to load a selected skill's canonical `SKILL.md` rather than reproduce its phase logic, and SHALL keep its existing Missing-Skill and No-Match behaviors (extended to the new methods).

### Non-Functional Requirements

- **Performance:** Sections are static prose; they add a small, bounded amount of context to each skill. Keep each section tight (self-check ≈ 8–12 lines; calibration ≈ 2 short pairs per gate) to avoid bloating the prompt.
- **Consistency:** Identical section names, ordering, and skeleton across all 17 files; only the bracketed content differs.
- **Self-containment:** Each section must make sense when its skill is installed alone; no cross-skill references.
- **Safety:** Calibration examples must respect each skill's existing safety posture (e.g. non-graphic imagery for chain-method; synthetic targets for dominic-system; untrusted-source handling for reading skills).
- **Validation scope:** No new tests. An optional installer dry-run / existing `npm test` may be run as a sanity check that markdown additions did not break skill discovery, but is not required by this workflow.

---

## 5. High-Level Design

This is a content-only change. Two parts: (1) the two new behavioral sections are added uniformly to 17 gated-skill markdown files; (2) the `/interactive` router (an 18th file) gets a catalog/routing expansion only. Plus one new design doc. There is no code, no schema, no API, and no data flow. The "design" is the two section templates, their placement rule, the per-skill content each is filled with, and the router's expanded catalog/Selection Algorithm (Section 6.4).

Both sections are inserted with the Edit tool by anchoring on stable existing text:

- **Pre-Turn Self-Check** anchors on the end of `## Interaction Contract` (the line(s) just before the next `## ` heading) and is inserted as a new `## ` section there.
- **Pass/Fail Calibration** anchors on the start of the first section that follows the last `## Phase …` block and is inserted immediately before it.

Each file keeps every existing section verbatim; the two new sections are additive.

```
SKILL.md (unchanged sections in grey, new in *bold*)
  Identity
  (Origin / How-it-works)
  Goal
  (Model Behavior)
  Use Cases
  When Not to Use
  Invocation
  (Source Detection / Privacy)
  Orientation
  Interaction Contract
  *Pre-Turn Self-Check*        <-- inserted here
  (Persistent Data Contract)
  Phase 1 … Phase N
  *Pass/Fail Calibration*      <-- inserted here (after last Phase)
  (Alternate Modes / State / Export)
  Final Handoff
  Failure Modes
  Success Criteria
```

### Section template — `Pre-Turn Self-Check`

```markdown
## Pre-Turn Self-Check

Before sending any response, silently confirm each item. If any is unchecked, fix it before replying.

- **At a gate?** Did I HALT last turn awaiting <user work product>? If so, this turn evaluates that work — it does not also introduce the next gate.
- **Did the user do the work?** Did they actually produce <specific work product>, or only acknowledge / ask a question / paste the <source|list|target> back? Acknowledgment is not a pass.
- **Hidden material intact?** Am I about to show <skill-specific hidden thing> before the user has <recalled|produced> it? Recognition is not recall.
- **Persisted?** Is there accepted work from the last pass I have not yet written to <state file / artifact>?
- **<Skill-specific invariant 1>**
- **<Skill-specific invariant 2>**
```

### Section template — `Pass/Fail Calibration`

```markdown
## Pass/Fail Calibration

Models grade leniently. These borderline pairs mark where each gate's line sits — grade against them, and do not pass weak work to be encouraging.

### <Gate name> (Phase N)
- ✅ Passes — "<plausible just-passing response>"
  Why: <the criterion it satisfies>.
- ❌ Fails — "<plausible near-miss response>"
  Why: <the criterion it misses>.
```

---

## 6. Detailed Design

The change touches 17 files with the same two-section pattern. Sections 6.1 and 6.2 give the two fully worked examples (`reap` and `insert`) that serve as the authoring reference; Section 6.3 specifies the content each remaining skill's sections must cover. Every skill's content is written against its real, already-read gate list during implementation.

### 6.1 Worked example — `skills/reap/SKILL.md`

**File(s):** `skills/reap/SKILL.md`
**Type:** Modified

REAP gates: Read account (Phase 1), Encode (Phase 2), Annotate ≥60% substantive (Phase 3), Ponder three connected answers (Phase 4). Hidden material: during Encode the source wording is removed; during Ponder only annotations are shown. Persistence: `reap-<slug>.state.md`, final `reap-<slug>.md`.

`Pre-Turn Self-Check` (after `## Interaction Contract`):

```markdown
## Pre-Turn Self-Check

Before sending any response, silently confirm each item. If any is unchecked, fix it before replying.

- **At a gate?** Did I HALT last turn awaiting a Read account, an encoding, annotations, or a Ponder answer? If so, this turn evaluates that work — it does not also present the next section or phase.
- **Did the user do the work?** Did they write the sentence / encoding / annotation themselves, or only say "ok", "done", or "go on"? Acknowledgment never passes a gate.
- **Encode before annotate?** Am I about to let the user annotate before every in-scope encoding has passed? If so, use the "Encode first" boundary and keep Phase 2 active.
- **Hidden material intact?** In Encode, am I re-showing the source wording I should have removed? In Ponder, am I showing the source, Read notes, or encodings instead of only the accepted annotations?
- **Not editorializing for them?** Am I about to accept (or worse, supply) an encoding that argues with the author rather than stating the author's claim in the user's words?
- **Persisted?** Have I written the latest accepted Read note / encoding / annotation to `reap-<slug>.state.md` before halting?
```

`Pass/Fail Calibration` (after Phase 4, before `## Alternate Modes`):

```markdown
## Pass/Fail Calibration

Models grade leniently. These borderline pairs mark where each gate's line sits — grade against them, and do not pass weak work to be encouraging.

### Read account (Phase 1)
- ✅ Passes — "The author is building toward the idea that zoning rules, not demand, drive most urban housing shortages."
  Why: original-language statement of the section's argumentative move.
- ❌ Fails — "This section is about housing shortages and zoning rules in cities."
  Why: near-restatement of the heading; names the topic but not what the author is doing with it.

### Encode (Phase 2)
- ✅ Passes — "From the author's view, scarcity is manufactured by regulation, so deregulation is the primary lever."
  Why: states the author's claim, scope, and causal relationship in the user's own words.
- ❌ Fails — "The author claims deregulation fixes housing, which ignores tenant protections."
  Why: editorializes ("which ignores…") instead of representing the author's position; that belongs in Annotate.

### Annotate (Phase 3)
- ✅ Passes — "This overstates the causal weight of zoning — Tokyo loosened rules but rents still rose with in-migration, so demand clearly matters too."
  Why: a substantive qualification with a specific counterexample.
- ❌ Fails — "Good point, I think the author is mostly right here."
  Why: agreement with no reason, qualification, consequence, or connection; does not count toward the 60% threshold.

### Ponder (Phase 4)
- ✅ Passes — "My belief that deregulation alone is sufficient was challenged by my own Tokyo annotation; I'd investigate how supply and migration interact."
  Why: connects to a specific accepted annotation and answers belief-challenged + follow-up.
- ❌ Fails — "This was a really interesting and well-argued piece."
  Why: generic praise not tied to any annotation; answers none of the three prompts.
```

### 6.2 Worked example — `skills/insert/SKILL.md`

**File(s):** `skills/insert/SKILL.md`
**Type:** Modified

INSERT gates: Symbols quiz 4/5 (Phase 1), at least one valid mark per chunk with locator (Phase 2), every question dispositioned (Phase 3), every `✓` verified by original explanation (Phase 4). Constraints: `*` limited to 3–5; all-`✓` challenged. Persistence: `insert-<slug>.state.md`, `insert-<slug>.md`.

`Pre-Turn Self-Check` (after `## Interaction Contract`):

```markdown
## Pre-Turn Self-Check

Before sending any response, silently confirm each item. If any is unchecked, fix it before replying.

- **At a gate?** Did I HALT last turn awaiting symbol answers, chunk marks, question dispositions, or a confidence explanation? This turn evaluates that work; it does not also advance to the next chunk or phase.
- **Did the user do the work?** Did they choose the marks and write the explanation themselves, or am I about to mark the chunk / explain the ✓ for them? I may chunk and build lists; I may not choose marks or supply explanations.
- **Hidden material intact?** In Confidence Calibration, am I showing the explanatory source context for the ✓ I am testing, instead of just the locator/claim?
- **Star budget?** Am I about to accept more than 3–5 final `*` marks without requiring demotion?
- **Fluency illusion?** Are all marks `✓` (challenge it), or have key ideas emerged with no `→` connection (ask for one)?
- **Persisted?** Have I written accepted marks, dispositions, and calibration results to `insert-<slug>.state.md` before halting?
```

`Pass/Fail Calibration` (after Phase 4, before `## Alternate Modes`):

```markdown
## Pass/Fail Calibration

Models grade leniently. These borderline pairs mark where each gate's line sits — grade against them, and do not pass weak work to be encouraging.

### Symbol quiz (Phase 1)
- ✅ Passes — chooses `?` for "I don't follow how step 3 follows from step 2."
  Why: maps confusion to the unclear symbol; 4/5 correct overall.
- ❌ Fails — chooses `✓` for "I don't follow how step 3 follows from step 2."
  Why: marks confusion as known; the function is inverted.

### Chunk mark (Phase 2)
- ✅ Passes — "`!` at 'doubling every 18 months' — I didn't realize the rate was that fast."
  Why: symbol + exact locator + rationale matching the symbol's function.
- ❌ Fails — "`!` this whole paragraph was interesting."
  Why: no locator and no specific rationale; "interesting" does not identify surprise or importance.

### Question disposition (Phase 3)
- ✅ Passes — "Q2 → will research; I'll check the original benchmark in the cited paper."
  Why: an explicit disposition with a concrete next action.
- ❌ Fails — "I'll figure the questions out later."
  Why: no per-question disposition; "later" leaves questions undispositioned.

### Confidence calibration (Phase 4)
- ✅ Passes — for a ✓ on 'idempotent': "It means running the operation again gives the same result, so retries are safe."
  Why: accurate one-sentence explanation in the user's own words; ✓ stands.
- ❌ Fails — for the same ✓: "Yeah, I know what idempotent means."
  Why: assertion of knowing, not an explanation; downgrade ✓ to `?`.
```

### 6.3 Remaining skills — content specification

**Type:** Modified (one `## Pre-Turn Self-Check` + one `## Pass/Fail Calibration` each)

Each skill's two sections follow the same templates. The table below names, per skill, (a) the skill-specific self-check invariant(s) beyond the four common items, and (b) the gates the calibration section must cover with a passing/failing pair. Implementation reads each skill's full gate text before authoring so example responses use real thresholds and vocabulary.

| Skill | Self-check skill-specific invariant(s) | Calibration gates to cover |
|-------|----------------------------------------|----------------------------|
| `sq3r` | Reciting with source hidden? Prediction tied to skeleton, not the title? | Survey prediction; Question selection; Recite (hidden recall); Review synthesis |
| `pq4r` | Reflection connected to prior knowledge, not generic? Prediction recorded before reading? | Preview prediction/goal; Question; Reflect; Recite; Review; Prediction-vs-reality |
| `pao-system` | About to reveal a Person/Action/Object during a hidden quiz? Map mastered before list build? Secrets being persisted? | Major-map mastery; Person/Action/Object batch recall; Scene recall; Decode |
| `ok5r` | Record is paraphrase not transcription? Recite with source AND records hidden? Reflection cites a record entry? | Survey prediction; Question (4–6); Record (4 slots); Recite (80%); Review; Reflect (3 cited) |
| `dominic-system` | About to show a Person/Action during a hidden batch quiz? `6=S` reinforced? Digit map mastered before build? Synthetic target for secrets? | Letter-map mastery (10/10); Person batch recall; Action batch recall; Scene recall; Decode (exact) |
| `chain-method` | Showing the chain/list during a recall gate? Imagery non-graphic by default? Interaction (not juxtaposition) required? | Practice links (interaction + distinctiveness); Chain recall (100% order); Drill scoring |
| `1-3-5` | One genuinely-big task (not three mediums)? Displacement enforced when list overflows? | One Big; Three Medium; Five Small; Render/Confirm; Displacement; Review |
| `bullet-journal` | Entries correctly typed (task/event/note), not prose? Migration requires rewrite/delegate/strike, never "later"? Physical notebook authoritative? | Index; Future Log; Monthly Log; Daily Log (typed entries); Migration |
| `dr-ta` | Prediction made before reading the segment? Proof/revision tied to text evidence? | Prediction; Prove/Revise against evidence |
| `flow-notes` | Big ideas captured as the user's own, arrows showing real relationships? | Learn Flow; Big Ideas + Arrows; Synthesis; Deep Connections |
| `gtd` | "Is it actionable?" decided by the user? Next actions are physical/visible, not vague? Inbox actually emptied? | Mind Sweep; Clarify (actionable + next action); Organize; Weekly Review; Engage |
| `para` | Classification by actionability, not topic? Projects have an outcome + deadline? | Four Folders; Projects; Areas; Resources; Classify (actionability); Weekly Review |
| `solo` | Level classified from the user's explanation with evidence, not assumed? Next step matches the diagnosed level? | Learn Levels; Elicit Explanation; Classify-with-evidence; Next Step; Reassessment |
| `think-aloud` | Verbalization is genuine in-the-moment reasoning, not a polished after-the-fact summary? | Rules quiz; Warm-up; Real-problem verbalization; Analysis; Target |
| `woop` | Obstacle is internal (not external excuse)? Plan is a concrete if-then? Wish is challenging but feasible? | Wish; Outcome; Internal Obstacle; Plan (if-then); Full WOOP; Follow-up |

#### Edge Cases & Error Handling (applies to all 17)

- **Skill has a `Persistent Data Contract` right after `Interaction Contract`** (pao, dominic, gtd, para, bullet-journal): insert `Pre-Turn Self-Check` between `Interaction Contract` and `Persistent Data Contract`, keeping it adjacent to the turn loop.
- **Skill's last phase is followed directly by `Final Handoff`** (chain-method) or `Export Mode` (pao, dominic) or `State and Resume` (ok5r): insert `Pass/Fail Calibration` immediately before that section.
- **A gate has no meaningful "near-miss"** (e.g. a pure completion confirmation like OK5R Phase 3 Read): cover only the gates that grade a work product; do not invent a calibration pair for a non-graded checkpoint, and note it in the section if useful.
- **Demonstration-variation rule** (reap, chain-method, dominic-system, ok5r): calibration examples are fixed reference illustrations, not live demonstrations; phrase them as grading references so they do not collide with the "vary the demo each session" rule.
- **Anchor not unique:** if the Edit anchor text is not unique within a file, extend the anchor to include the preceding heading line to disambiguate.

### 6.4 `/interactive` router catalog expansion

**File(s):** `skills/interactive/SKILL.md`
**Type:** Modified (catalog/routing only — no Pre-Turn Self-Check or Pass/Fail Calibration)

#### What it does

Currently the router catalogs only `sq3r`, `pq4r`, and `pao-system`. This expands the `## Linked Catalog` to all 16 gated family skills, grouped by sub-family, and extends `## Selection Algorithm` to route across the wider set. The router remains a selector: it picks exactly one installed method, explains the choice in one sentence, loads that method's canonical `SKILL.md`, and starts it — it never reproduces phase logic.

#### Sub-family grouping (16 skills)

```text
Reading & study        : sq3r, pq4r, reap, ok5r, insert, dr-ta, flow-notes
Memory / mnemonic      : pao-system, dominic-system, chain-method
Comprehension/metacog. : solo, think-aloud
Productivity & org.     : gtd, para, bullet-journal, 1-3-5
Goal-setting           : woop
```

#### Catalog entry format (new entries)

Existing sq3r/pq4r/pao entries are kept in substance and moved under their group headings. New entries use a compact, uniform shape so 16 entries stay manageable:

```markdown
### `/<skill>`

Canonical instructions: [`../<skill>/SKILL.md`](../<skill>/SKILL.md).

<1–2 sentence purpose and signature move.>

Choose when:
- <3–5 concrete trigger conditions>

Prefer a sibling when:
- <2–3 redirects to the nearest method, e.g. "the source is an argument → /reap">
```

#### Selection Algorithm (extended)

```text
1. If the user explicitly names an installed method, select it.
2. Classify the need into a sub-family:
   - There is a source to read/study        -> Reading & study
   - There is an exact ordered target to memorize -> Memory / mnemonic
   - The goal is to gauge/deepen understanding of an explanation -> Comprehension & metacognition
   - The goal is to capture/organize tasks, notes, or projects -> Productivity & organization
   - The goal is to turn a wish into an actionable plan -> Goal-setting
3. Within the chosen sub-family, apply tie-breakers:
   - Reading: factual structured -> /sq3r; dense/reflection -> /pq4r; author's argument -> /reap;
     long + reusable record -> /ok5r; fast margin pre-pass -> /insert; prediction-driven -> /dr-ta;
     visual idea-mapping -> /flow-notes.
   - Memory: phonetic dense PAO -> /pao-system; initial-based -> /dominic-system; short ordered list -> /chain-method.
   - Comprehension: classify understanding depth -> /solo; verbalize live problem-solving -> /think-aloud.
   - Productivity: capture-everything backlog -> /gtd; file notes/projects by actionability -> /para;
     analog rapid logging + migration -> /bullet-journal; shape a single day -> /1-3-5.
   - Goal-setting: /woop.
4. Ask at most one clarifying question, only when its answer changes the sub-family or method.
5. Verify the canonical path is readable; announce "Selected: /<skill> — <reason>."; load and run it.
```

#### Edge Cases & Error Handling

- **Description/Use Cases drift:** update the frontmatter `description` (which names only "SQ3R, PQ4R, or PAO") and `## Use Cases`/`## When Not to Use` so they describe the broader family without claiming uninstalled methods are present.
- **Missing-skill / No-match:** keep the existing behaviors; extend the No-Match examples so productivity/goal needs route correctly instead of being declined.
- **Ambiguous cross-family input** (e.g. "help me get organized to study"): the algorithm resolves by primary intent and may ask one clarifying question; it never starts two methods.
- **Out of scope:** the router does not gain workflow gates, so it remains excluded from Section 6.1–6.3 additions.

---

## 7. Data Model Changes

N/A — no database, schema, or persisted-artifact format changes. The local state/handoff schemas each skill writes (`*-state.md`, `*.json`, `*.md`) are untouched.

---

## 8. API Changes

N/A — no HTTP endpoints, CLI subcommands, or backend contracts are added or modified. The skills' invocation grammars and flags are unchanged.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/interactive-skill-selfcheck-calibration.md` | This design doc |
| MODIFY | `skills/sq3r/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/pq4r/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/pao-system/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/reap/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/ok5r/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/dominic-system/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/chain-method/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/1-3-5/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/bullet-journal/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/dr-ta/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/flow-notes/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/gtd/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/insert/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/para/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/solo/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/think-aloud/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/woop/SKILL.md` | Add Pre-Turn Self-Check + Pass/Fail Calibration |
| MODIFY | `skills/interactive/SKILL.md` | Expand Linked Catalog + Selection Algorithm to all 16 family skills; update description/Use Cases (no self-check/calibration) |

No files will be deleted. `skills/interactive/SKILL.md` is modified **only** for catalog/routing expansion — it does **not** receive the two new behavioral sections.

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| `origin/main` (full family merged) | post-PR #112 | Provides all 17 skills to edit | Local main is stale — must branch from `origin/main` |
| Existing Node installer/validator | repo version | Discovers/validates skill folders | Low — additive `##` sections do not affect frontmatter/manifest validation |
| `git` / `gh` | installed | Worktree, branch, PR | Standard workflow |

No new package or service dependency is introduced.

---

## 11. Rollout & Deployment

- Branch `feat/interactive-skill-selfcheck-calibration` from `origin/main` in an isolated worktree.
- Commit this design doc first, then implement in logical commits (suggested grouping: expansion 4, batch-1 trio, batch-3 ten — or one commit per skill).
- Additive and non-breaking: existing phases, gates, and thresholds are unchanged, so installed users see only the two new reference sections.
- No feature flag; no migration. Rollback is a plain revert of the commits — no user data or artifacts are affected.
- Optional sanity check after edits: existing `npm test` and an installer dry-run for one edited skill to confirm discovery still works (not required by the no-tests workflow).

---

## 12. Open Questions

- [ ] Section ordering preference: place `Pre-Turn Self-Check` *before* a `Persistent Data Contract` (chosen default, keeps it adjacent to the turn loop) vs. after it. Default chosen unless you object.
- [ ] Calibration depth: one passing/failing pair per gate (chosen default) vs. two pairs for the highest-risk gate in each skill. Default keeps the section tight per the NFRs.
- [ ] Commit granularity: one commit per skill (more reviewable) vs. one commit per batch (fewer commits). Default: per batch.
- [ ] **Router catalog scope:** include the productivity/organization methods (`gtd`, `para`, `bullet-journal`, `1-3-5`) and goal-setting (`woop`) in `/interactive`? Default chosen = **include all 16** (they are all `learning`-categorized family members), broadening the router's framing from "learning or memory technique" to "interactive learning, study, memory, productivity, or goal method." If you'd rather keep the router to reading + memory + comprehension only (11 skills), say so and I'll trim.
- [ ] Router entry verbosity: standardize all 16 entries to the compact format (uniform, smaller file) vs. keep the three existing verbose entries as-is and only add compact new ones (default).

---

## 13. Alternatives Considered

### Alternative 1: One shared sections file referenced by all skills
- What: Put generic versions of both sections in a shared doc and link to it from each skill.
- Why rejected: Breaks the family's self-containment requirement (skills install independently), and the user explicitly wants *skill-specific* content, which a shared file cannot provide.

### Alternative 2: Add the two behavioral sections to the `/interactive` router too
- What: Give the router a routing-adapted self-check and calibration.
- Why rejected: Confirmed with the user to exclude it — the router has no user-work gates and no hidden material, so Pass/Fail Calibration has nothing to grade and the self-check items do not map. The router is still modified, but only to expand its catalog/routing (Section 6.4), which is a separate concern.

### Alternative 5: Leave the router catalog alone and document the gap
- What: Ship only the two sections and file the missing-catalog issue separately.
- Why rejected: The user explicitly asked to update the router in the same pass, and the gap is concrete (14 installed family skills are unreachable via `/interactive`). Folding it in keeps the family-alignment work in one PR.

### Alternative 3: Place both sections at the end (near Failure Modes)
- What: Append both after Success Criteria.
- Why rejected: A *pre-turn* checklist read after all the phases is less likely to actually gate behavior. Placing the self-check next to the Interaction Contract (the turn loop) and calibration next to the gates it grades keeps each section where the model needs it.

### Alternative 4: Fold the content into existing Interaction Contract / Failure Modes
- What: Expand existing sections instead of adding new ones.
- Why rejected: The user asked for these as distinct, scannable sections; a checklist phrased as its own section is followed more reliably than the same rules diffused into prose (the whole rationale for the request).
