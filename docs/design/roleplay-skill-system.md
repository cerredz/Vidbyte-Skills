# Design Doc: Roleplay Skill System

**Status:** Draft
**Author:** Claude
**Created:** 2026-06-01
**Last Updated:** 2026-06-01

---

## 1. Overview

The Roleplay Skill System adds two new skills to the Vidbyte Skills repository: `roleplay` and `create-roleplay`. The `roleplay` skill is a central hub that simulates characters in realistic interpersonal scenarios (job interview, talking to a boss, consulting an expert) and scores the user's responses against a structured rubric. The `create-roleplay` skill generates new scenario and rubric files from a description and persists them as data files inside the `roleplay` skill folder, extending the catalog without requiring a manual file commit. Both skills are pure prompt skills — no CLI backend, no Vidbyte API submission — and follow the existing Type 2 (Prompt Skill) pattern.

---

## 2. Goals & Non-Goals

### Goals

- Create `skills/roleplay/SKILL.md` as a discovery-first hub: lists available scenarios, accepts a user choice or custom description, reads the chosen scenario and rubric files into context, simulates the character, and scores responses.
- Create `skills/roleplay/scenarios-registry.md` as the index of all available scenarios — the central skill reads this at runtime to discover what's available.
- Create three launch scenarios with scenario and rubric file pairs: `job-interview`, `talking-to-boss`, `talking-to-expert`.
- Encode two scoring modes — **interleaved** (turn-by-turn feedback after each user response) and **end-of-session** (full rubric report at conversation close) — as user-selectable at session start.
- Create `skills/create-roleplay/SKILL.md` that: reads existing scenarios as style references, generates a new `scenario.md` + `rubric.md` pair, writes them to the correct path inside `skills/roleplay/`, and appends the new entry to `scenarios-registry.md`.
- Register both `roleplay` and `create-roleplay` in `skills-manifest.json` under `learning`.
- Pass `npm test` (validate.js, smoke-test.js, cli-smoke-test.js, cli-security-test.js).

### Non-Goals

- No Vidbyte CLI backend integration — this is a prompt-only skill with no API submission.
- No CLI dataclasses, commands, router changes, or client endpoint additions.
- No changes to the installer (`bin/install.js`), validator logic, or harness integration code.
- No automatic session-level background monitoring — the skill activates on explicit `/roleplay` invocation.
- No UI, web, or frontend changes.
- No changes to any existing skills.
- The 15-scenario full catalog is out of scope for this PR — three launch scenarios ship now; the extended list ships in a follow-up.

---

## 3. Background & Context

Vidbyte Skills already has a strong library of passive learning skills (compression-check, feedback-generator, retain) and active prompt skills (practice, question). The competitive intelligence audit from 2026-05-28 identified roleplay/conversational coaching (Duolingo Max, Skillsoft CAISY in Agentforce) as a distinct learning primitive no Vidbyte skill covers yet. Roleplay is the highest-fidelity practice mode for interpersonal competencies — job interviews, negotiation, difficult feedback conversations — where declarative knowledge is not enough and only simulated practice builds real skill.

The architecture borrows the "skill-to-skills" routing pattern already established in `vidbyte-tutor` but adds a second dimension: each sub-scenario is not a separate SKILL.md but a pair of data files (`scenario.md` + `rubric.md`) that the central skill reads dynamically at runtime. This keeps the manifest clean (two entries, not N+2) while allowing the catalog to grow without modifying any SKILL.md.

---

## 4. Requirements

### Functional Requirements

1. When invoked via `/roleplay` with no arguments, the central skill reads `scenarios-registry.md` and presents the available scenario list with one-line descriptions.
2. The user may select a scenario by name/number OR describe a custom scenario in natural language.
3. Before starting, the skill asks the user to choose a scoring mode: **interleaved** (score each turn) or **end-of-session** (score at the end).
4. Once a scenario is chosen, the skill reads the corresponding `scenario.md` and `rubric.md` files into context.
5. The skill enters character — simulating the persona defined in `scenario.md` — and delivers the opening line verbatim from the scenario file.
6. In **interleaved mode**: after each user response, the skill stays in character, then immediately appends a brief score against the rubric dimensions (1 sentence per dimension, numeric score).
7. In **end-of-session mode**: the skill stays in character throughout, scores only when the user types `/score` or `/end`, delivering a full rubric report with dimension scores, evidence quotes, and an overall score.
8. At any point, `/exit-roleplay` ends the session and delivers a summary regardless of scoring mode.
9. For a custom scenario description: the skill delegates to `create-roleplay` logic (generates scenario.md + rubric.md, persists them, updates the registry) and then loads the new files.
10. `create-roleplay` accepts a free-text description, reads 1-2 existing scenario/rubric pairs as examples, generates the new files following the shared template schema, writes them to `skills/roleplay/<slug>/`, and appends the slug + one-line description to `scenarios-registry.md`.
11. The rubric must follow the shared schema: named dimensions, weight (1-5), and a 1/3/5 anchor scale with behavioral descriptions per anchor.
12. Both `roleplay` and `create-roleplay` must have valid YAML frontmatter where `name` matches the folder name exactly.
13. Both must appear in `skills-manifest.json` under `learning`.

### Non-Functional Requirements

- No external network calls; all data is local file reads/writes.
- Scenario and rubric files must be human-readable Markdown — editable by hand without breaking the skill.
- No secrets, credentials, or environment variables.
- The validator (`npm test`) must pass with no new errors.

---

## 5. High-Level Design

The system has two independent but linked skills. `roleplay` is the runtime orchestrator: it reads a registry file to discover scenarios, reads scenario/rubric data files to configure behavior, and runs the conversation. `create-roleplay` is a factory: it reads existing scenarios as exemplars and writes new ones to disk.

Data flows at runtime like this:

```
User invokes /roleplay
        |
        v
roleplay/SKILL.md  --- Read -->  roleplay/scenarios-registry.md
        |                        (list: slug, display-name, one-liner)
        |
        v
User selects scenario + scoring mode
        |
        v
roleplay/SKILL.md  --- Read -->  roleplay/<slug>/scenario.md
                   --- Read -->  roleplay/<slug>/rubric.md
        |
        v
Character simulation begins
(interleaved scoring OR end-of-session scoring based on user choice)

----------------------------------------------------------------------

User invokes /create-roleplay or triggers from /roleplay custom path
        |
        v
create-roleplay/SKILL.md  --- Read -->  roleplay/<any>/scenario.md  (exemplar)
                          --- Read -->  roleplay/<any>/rubric.md     (exemplar)
        |
        v
Generate new scenario.md + rubric.md content
        |
        v
create-roleplay/SKILL.md  --- Write -->  roleplay/<new-slug>/scenario.md
                          --- Write -->  roleplay/<new-slug>/rubric.md
                          --- Edit  -->  roleplay/scenarios-registry.md (append)
```

The key architectural decision is that **scenario and rubric files are data, not skills**. They live inside the `roleplay/` skill folder as subdirectories but are invisible to the validator (which only scans the top-level `skills/` directory). This prevents manifest bloat and keeps all scenario content collocated with the skill that owns it.

---

## 6. Detailed Design

### 6.1 `skills/roleplay/SKILL.md`

**File:** `skills/roleplay/SKILL.md`
**Type:** New file

#### What it does

Central hub skill. Discovers available scenarios, accepts user selection or custom description, loads the selected scenario and rubric files into context, simulates the character, and scores the user's responses in the chosen mode.

#### Session Flow

```
1. On activation:
   a. Read skills/roleplay/scenarios-registry.md
   b. Present numbered list to user

2. Receive user input:
   a. If matches a scenario name/number → load that scenario
   b. If is a description → route to create-roleplay flow, then load new scenario
   c. If user says "help" / blank → repeat the list

3. Ask user: "Interleaved scoring (after each turn) or end-of-session scoring?"

4. Read skills/roleplay/<slug>/scenario.md
   Read skills/roleplay/<slug>/rubric.md

5. Enter character:
   - Adopt character name, role, personality from scenario.md
   - Deliver opening line verbatim from scenario.md
   - Stay fully in character throughout

6a. INTERLEAVED mode — after each user turn:
   - Respond as character (1-3 sentences in role)
   - Break character: print "--- Score ---"
   - Score each rubric dimension: "[Dimension]: [1-5] — [one sentence rationale]"
   - Resume character

6b. END-OF-SESSION mode — during conversation:
   - Stay fully in character
   - Track key evidence quotes from user turns internally
   - On /score or /end: break character and deliver full rubric report

7. Full rubric report format:
   ## Roleplay Score: [Scenario Name]
   Mode: [Interleaved | End-of-Session]
   Turns: [N]

   | Dimension | Weight | Score | Evidence |
   |-----------|--------|-------|---------|
   | [dim]     | [w]    | [1-5] | "[quote]" |

   Overall Score: [weighted_avg] / 5

   ### Strengths
   - [bullet]

   ### Areas to Improve
   - [bullet]

8. /exit-roleplay at any time → deliver report and end session
```

---

### 6.2 `skills/roleplay/scenarios-registry.md`

Registry format: Markdown table with columns `Slug`, `Display Name`, `One-Line Description`.
`create-roleplay` appends rows; `roleplay` reads rows at session start.

---

### 6.3 Scenario file schema (`scenario.md`)

```
# Scenario: [Display Name]

## Character Profile
Name / Role / Personality / Emotional State

## Situation
## Your Role
## Character Goals
## Opening Line (quoted)
## Conversation Guidelines (bullet list)
```

---

### 6.4 Rubric file schema (`rubric.md`)

```
# Rubric: [Display Name]

## Scoring Dimensions
Per dimension: Name, Weight (1-5), Measures, Score 1 anchor, Score 3 anchor, Score 5 anchor.

## Overall Score
Weighted average formula.

## Scoring Notes
```

---

### 6.5 `skills/create-roleplay/SKILL.md`

Factory skill. Accepts description, reads exemplar files, generates scenario.md + rubric.md following the schemas, writes to `skills/roleplay/<slug>/`, appends to `scenarios-registry.md`.

---

## 7. Data Model Changes

N/A — Markdown data files only. No database, schema, or migration changes.

---

## 8. API Changes

N/A — no API endpoints, no CLI commands, no backend calls.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/roleplay-skill-system.md` | This design doc |
| CREATE | `skills/roleplay/SKILL.md` | Central hub skill |
| CREATE | `skills/roleplay/scenarios-registry.md` | Scenario discovery index |
| CREATE | `skills/roleplay/job-interview/scenario.md` | Launch scenario: job interview |
| CREATE | `skills/roleplay/job-interview/rubric.md` | Launch rubric: job interview |
| CREATE | `skills/roleplay/talking-to-boss/scenario.md` | Launch scenario: talking to boss |
| CREATE | `skills/roleplay/talking-to-boss/rubric.md` | Launch rubric: talking to boss |
| CREATE | `skills/roleplay/talking-to-expert/scenario.md` | Launch scenario: consulting an expert |
| CREATE | `skills/roleplay/talking-to-expert/rubric.md` | Launch rubric: consulting an expert |
| CREATE | `skills/create-roleplay/SKILL.md` | Factory skill for new scenarios |
| MODIFY | `skills-manifest.json` | Add `roleplay` and `create-roleplay` to `learning` array |

---

## 10. Testing Plan

### Structural / Schema Tests (automated via validate.js)

- `skills/roleplay/SKILL.md` has valid frontmatter with `name: roleplay` matching directory — [Hidden Assumption]
- `skills/create-roleplay/SKILL.md` has valid frontmatter with `name: create-roleplay` matching directory — [Hidden Assumption]
- Both appear in `skills-manifest.json` under `learning` — [Hidden Assumption]
- No duplicate entries in `skills-manifest.json` after modification — [Edge Case]
- `scenarios-registry.md` contains at least 3 rows — [Edge Case]
- Every launch scenario directory contains `scenario.md` and `rubric.md` — [Hidden Assumption]
- Each `rubric.md` contains at least 3 scoring dimensions — [Edge Case]
- Each `rubric.md` dimension has weight + 3 anchor scores — [Hidden Failure]
- Each `scenario.md` contains an Opening Line section — [Hidden Failure]
- Slug in registry matches directory name exactly — [Silent Failure]

### Manual / QA Test Cases

1. `/roleplay` with no args → prints scenario list with ≥3 options — [Edge Case]
2. `/roleplay job-interview` → reads scenario.md, delivers Alex Chen's opening line — [Happy path]
3. Interleaved mode selected → after each user response, `--- Score ---` block appears — [Happy path]
4. End-of-session mode, `/score` command → full rubric table with evidence quotes — [Happy path]
5. `/exit-roleplay` mid-session → partial rubric delivered, session ends — [Edge Case]
6. `/score` in interleaved mode → skill acknowledges per-turn scores already active — [Edge Case]
7. `/create-roleplay` with description → scenario.md and rubric.md written to disk — [Happy path]
8. `/create-roleplay` with existing slug → warning + asks for different name — [Edge Case]
9. `/create-roleplay` with <10 word description → asks one follow-up — [Edge Case]
10. `npm test` after all files added → validate.js exits 0 — [Hidden Assumption]
11. End-of-session overall score = correct weighted average — [Silent Failure]
12. Registry slug with no matching directory → readable error surfaced — [Hidden Failure]

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Node.js | ≥18 (existing) | Runs validate.js | None |
| Claude Code Read tool | Runtime | Loads scenario/rubric files | Low |
| Claude Code Write tool | Runtime | create-roleplay writes files | Low — user approves |

---

## 12. Rollout & Deployment

- No feature flags. Additive only.
- Not a breaking change. Existing skills, installer, and CLI untouched.
- Rollback: delete `skills/roleplay/`, `skills/create-roleplay/`, revert manifest entries.

---

## 13. Open Questions

- [ ] Should `/roleplay` support direct slug argument (e.g., `/roleplay job-interview`) to skip list? (Implementing as convenience shortcut.)
- [ ] Should `create-roleplay` preview before writing? (Deferred post-v1.)
- [ ] What is the full 15-scenario list for the follow-up PR? (Out of scope here.)

---

## 14. Alternatives Considered

### Alternative 1: Each scenario as a separate SKILL.md

- What: `skills/roleplay-job-interview/SKILL.md`, etc.
- Why rejected: Manifest bloat; scenarios are data not logic; `create-roleplay` couldn't register new scenarios without modifying the manifest.

### Alternative 2: Inline scenario content in central SKILL.md

- What: Embed all scenarios directly in `roleplay/SKILL.md`.
- Why rejected: SKILL.md grows unbounded; `create-roleplay` can't safely append to a structured SKILL.md.

### Alternative 3: `scenarios-registry.json` instead of Markdown

- What: JSON registry file.
- Why rejected: Stray trailing comma breaks JSON on append; Markdown table is safer and human-readable.
