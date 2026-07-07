# Design Doc: Critical Thinking Install Flag

**Status:** Draft
**Author:** Codex
**Created:** 2026-07-07
**Last Updated:** 2026-07-07

---

## 1. Overview

Add a `--critical-thinking` installer flag to the Vidbyte Skills Node CLI so users can install only the critical-thinking skills without copying a long comma-separated `--skill` list. The flag will expand to a static dictionary of confirmed installable critical-thinking skill names in code, then reuse the existing requested-skill installer path, validation, target resolution, and reporting behavior.

---

## 2. Goals & Non-Goals

### Goals

- Add `--critical-thinking` to `vidbyte-skills` and category wrapper invocations that share `lib/cli-options.js`.
- Back the flag with a static code dictionary rather than deriving the list dynamically from descriptions, README text, or version bundles.
- Include all confirmed installable critical-thinking skills found in the recent PR audit.
- Preserve existing positional skill names, `--skill`, `--version`, `--scope`, `--platform`, `--mode`, `--dry-run`, and `--help` behavior.
- Document the new full install command in `README.md` and `llms.txt`.
- Keep the implementation additive and avoid changing default version 1 installs.

### Non-Goals

- Do not create new skill folders or modify any `SKILL.md` prompt content.
- Do not change `lib/skill-versions.json` or create a new version bundle.
- Do not add a generic tag/category system to skill metadata.
- Do not add backend endpoints, Python `vidbyte` command behavior, authentication behavior, or package dependencies.
- Do not add new verification scripts or test files.
- Do not include skills that GitHub PR metadata reports as merged but that are not present on `origin/main` as installable skill folders.
- Do not include reasoning trace siblings unless they are explicitly part of the critical-thinking install group.

---

## 3. Background & Context

The repository's install path is a Node CLI. `package.json` maps `vidbyte-skills` to `bin/install.js`, and `bin/install.js` passes most invocations to `installVidbyteSkills(argv)` in `lib/installer.js`. The installer calls `parseArgs(argv, PLATFORM_IDS)` from `lib/cli-options.js`, discovers all `skills/<name>/SKILL.md` folders, and then either selects requested skill names or filters by category/version. Requested skills already have higher precedence than version/category selection because `readInstallableSkills` returns `selectRequestedSkills(allSkills, skillNames)` whenever `skillNames.length > 0`.

The current version bundle mechanism lives in `lib/skill-versions.json`. `origin/main` contains version 7, which is documented as “Reflection, Critical-Thinking, and Goal Skills.” That bundle includes 23 skills, but the user's request is narrower: a command that installs only the critical-thinking subset.

Recent PR audit:

- PR `#115`, merged `2026-06-24`, superseded PR `#113` and added/reworked the Version 7 reflection, critical-thinking, and goal batch.
- PR `#113`, closed unmerged, is the original design/implementation PR and explicitly names the critical-thinking family.
- PRs `#109` through `#112` added/reworked interactive reading, memory, productivity, and learning methods, not explicitly critical-thinking skills.
- PR `#111` is reported by GitHub as merged and added `concept-mapping`, `mind-mapping`, `progressive-summarization`, `jol`, and `kwl`, but the current fetched `origin/main` tree does not contain those installable folders or catalog entries. Those names should not be included in a static install dictionary until the main branch state is reconciled.
- PRs `#104`, `#103`, `#102`, `#101`, `#100`, `#99`, `#97`, `#95`, `#94`, and `#93` do not add explicit critical-thinking installable skills.

Confirmed critical-thinking installable skills on `origin/main`:

```text
baloney-detection-kit
community-philosophical-inquiry
ennis-critical-thinking
fisher-scriven-analysis
halpern-argument-analysis
lamp-argument-mapping
paul-elder-framework
reference-class-forecasting
toulmin-model
twardy-evidence-mapping
```

The full user-facing install command after this feature ships will be:

```bash
npx vidbyte-skills --critical-thinking
```

For direct GitHub installs before npm publication, the equivalent command will be:

```bash
npx github:cerredz/Vidbyte-Skills --critical-thinking
```

---

## 4. Requirements

### Functional Requirements

1. `vidbyte-skills --critical-thinking` SHALL install only the static critical-thinking skill group, subject to normal target, scope, mode, and dry-run options.
2. `vidbyte-skills --critical-thinking --dry-run` SHALL print planned installs for the static group without writing files.
3. `vidbyte-skills --critical-thinking --platform codex --scope project` SHALL apply the existing target selection behavior to the static group.
4. `vidbyte-learning-skills --critical-thinking` SHALL also work because it reuses `parseArgs`; the requested skill group SHALL take precedence over the wrapper category filter, matching existing requested-skill behavior.
5. The static group SHALL contain exactly the ten confirmed critical-thinking skill names listed in Background & Context unless the user explicitly approves adding adjacent or currently absent skills.
6. The flag SHALL be combinable with positional skills or `--skill`; combined selectors SHALL be deduplicated using the existing `uniqueValues` behavior.
7. If a static dictionary entry is missing from `skills/`, the existing requested-skill validation SHALL fail loudly with `Unknown skill(s): ...`; implementation SHALL NOT silently skip missing dictionary entries.
8. `vidbyte-skills --help` SHALL document `--critical-thinking` and show an example invocation.
9. Unknown option handling SHALL remain unchanged for other unrecognized flags.
10. README SHALL document the full npm command and the GitHub pre-publication command.
11. `llms.txt` SHALL mention the new selector so agents can recommend the short command.
12. Existing default behavior SHALL remain `version: 1`; running `vidbyte-skills` without the flag SHALL not install critical-thinking skills unless version 1 changes in a separate PR.

### Non-Functional Requirements

- **Performance:** Parsing the flag is O(1) plus appending ten strings; no file scan or metadata inference is introduced.
- **Scalability:** The static dictionary should live in one obvious code location so future curated groups can be added without spreading arrays across docs and parser logic.
- **Security:** No new shell execution, network request, auth behavior, or path handling is introduced.
- **Observability:** Existing install reporter output remains the source of truth for which skills were selected and where they were installed.
- **Reliability / error tolerance:** Static entries are validated by the existing requested-skill path; stale entries fail clearly instead of producing partial installs.

---

## 5. High-Level Design

The implementation will add a small static skill-group module under `lib/`, then teach `lib/cli-options.js` to recognize `--critical-thinking` as a boolean selector. When present, the parser appends the static list to `options.skillNames`. Everything after parsing remains unchanged: `lib/installer.js` sees requested skill names and uses `selectRequestedSkills`, which validates names, filters discovered skills, and passes the selected skills to normal install target logic.

This keeps the feature out of version-bundle semantics. `--version 7` still installs the whole Version 7 reflection, critical-thinking, and goal batch. `--critical-thinking` installs only the curated critical-thinking subset. If the user combines `--critical-thinking` with `--skill some-other-skill`, the parser treats that as an explicit union.

```text
User CLI
  |
  v
bin/install.js / bin/learning.js
  |
  v
lib/installer.js
  |
  v
lib/cli-options.js --critical-thinking
  |
  v
lib/skill-groups.js static dictionary
  |
  v
options.skillNames = [critical-thinking names]
  |
  v
existing selectRequestedSkills -> validate -> install
```

---

## 6. Detailed Design

### 6.1 Static Skill Groups

**File(s):** `lib/skill-groups.js`
**Type:** New file

#### What it does

Defines static installer groups that map curated CLI flags to exact skill directory names.

#### Interface / API

```javascript
export const SKILL_GROUPS = {
  criticalThinking: [
    "baloney-detection-kit",
    "community-philosophical-inquiry",
    "ennis-critical-thinking",
    "fisher-scriven-analysis",
    "halpern-argument-analysis",
    "lamp-argument-mapping",
    "paul-elder-framework",
    "reference-class-forecasting",
    "toulmin-model",
    "twardy-evidence-mapping"
  ]
};
```

#### Logic / Algorithm

1. Export a frozen or ordinary object containing the static group.
2. Keep names lowercase hyphen-case and matching `origin/main` skill folders.
3. Do not read manifests, README, PR metadata, or skill files from this module.

#### Edge Cases & Error Handling

- Missing or misspelled names are intentionally surfaced later by existing `selectRequestedSkills` validation.
- The module has no runtime side effects.

---

### 6.2 CLI Option Parsing

**File(s):** `lib/cli-options.js`
**Type:** Modified

#### What it does

Adds `--critical-thinking` as a boolean option that appends the static critical-thinking group to `options.skillNames`.

#### Interface / API

```javascript
import { SKILL_GROUPS } from "./skill-groups.js";

// New accepted flag:
// --critical-thinking
```

#### Logic / Algorithm

1. Import `SKILL_GROUPS`.
2. Add `--critical-thinking` to the help text.
3. Add an example such as `vidbyte-skills --critical-thinking`.
4. In `readArgument`, detect `arg === "--critical-thinking"`.
5. Push `...SKILL_GROUPS.criticalThinking` into `options.skillNames`.
6. Return the current index because the flag has no value.
7. Leave final `options.skillNames = uniqueValues(options.skillNames)` unchanged.

#### Edge Cases & Error Handling

- `--critical-thinking=true` is not supported in the first implementation; it will follow existing unknown-option behavior.
- `--critical-thinking --version 7` selects the static group because requested skills take precedence over version selection.
- `--critical-thinking --skill reap` installs the static group plus `reap`; this mirrors existing composability rather than inventing mutual exclusion rules.

---

### 6.3 README Documentation

**File(s):** `README.md`
**Type:** Modified

#### What it does

Documents the short install command and distinguishes it from `--version 7`.

#### Interface / API

```bash
npx vidbyte-skills --critical-thinking
npx github:cerredz/Vidbyte-Skills --critical-thinking
```

#### Logic / Algorithm

1. Add a short subsection near Version 7 or “Install Specific Skills.”
2. State that `--critical-thinking` installs the curated critical-thinking subset, while `--version 7` installs reflection, critical-thinking, and goal skills.
3. Add `--critical-thinking` to the installer options block.
4. Preserve existing install commands.

#### Edge Cases & Error Handling

- Documentation should not claim this installs every argument/evidence-related skill in the repository; it installs the curated confirmed group.
- Documentation should not mention PR `#111` candidates as installed until they exist on `origin/main`.

---

### 6.4 LLM Documentation

**File(s):** `llms.txt`
**Type:** Modified

#### What it does

Adds a model-facing note that agents can recommend the short critical-thinking install flag.

#### Interface / API

```text
npx vidbyte-skills --critical-thinking
```

#### Logic / Algorithm

1. Add the flag to install examples or the Version 7 section.
2. List the static group at a high level or point to the README command.
3. Clarify that `--version 7` remains broader than the critical-thinking group.

#### Edge Cases & Error Handling

- Keep content concise and searchable.

---

## 7. Data Model Changes

N/A - This feature adds a static JavaScript dictionary and CLI parser behavior. It does not modify persisted schemas, local user artifacts, backend collections, JSON skill manifests, or skill frontmatter.

---

## 8. API Changes

### 8.1 CLI `vidbyte-skills --critical-thinking`

**Change type:** New

**Request:**

```text
vidbyte-skills --critical-thinking [--scope user|project|both] [--platform list|all] [--mode copy|link] [--dry-run]
```

**Response:**

```text
Existing installer output showing selected critical-thinking skills and per-target install results.
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| CLI exit 1 | A static skill name is not present in discovered skills |
| CLI exit 1 | Existing invalid `--scope`, `--platform`, `--mode`, or unknown-option behavior |
| CLI exit 1 | Existing filesystem install error |

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/critical-thinking-install-flag.md` | Source-of-truth design for this feature |
| CREATE | `lib/skill-groups.js` | Static critical-thinking skill dictionary |
| MODIFY | `lib/cli-options.js` | Parse `--critical-thinking`, update help text, and append the static group |
| MODIFY | `README.md` | Document the full install commands and option |
| MODIFY | `llms.txt` | Add model-facing command guidance |

No files will be deleted.

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Node.js | Existing `>=18` package engine | Runs the installer and ES modules | None beyond current package requirements |
| Existing skill catalog | `skills/` on `origin/main` | Provides folders selected by the static dictionary | Missing names cause validation failure |
| GitHub PR metadata | `gh pr view/list`, audit-time only | Confirm recent PR provenance | PR `#111` merge/main discrepancy requires caution |
| npm package distribution | `vidbyte-skills` after publish | User-facing `npx vidbyte-skills --critical-thinking` command | Command is available only after release containing this feature |

---

## 11. Rollout & Deployment

- Implement in an isolated worktree after explicit approval.
- Commit this design document first in the feature branch.
- Add the static group and parser flag.
- Update README and `llms.txt`.
- Run existing verification only: `node ./scripts/validate.js`, `node ./bin/install.js --critical-thinking --dry-run --platform codex --scope project`, and optionally `npm test` if time allows. No new test scripts will be created.
- Release through the existing npm/package process.
- Rollback by reverting the feature commit(s); default installs and version bundles are unchanged.

---

## 12. Open Questions

- [ ] Should adjacent but not explicitly critical-thinking skills such as `reap`, `flow-notes`, `dr-ta`, `question`, or `research` be included, or should the flag remain limited to the confirmed Version 7 critical-thinking family?
- [ ] Should the PR `#111` discrepancy be investigated before implementation? GitHub reports it merged, but the fetched `origin/main` tree does not contain `concept-mapping`, `mind-mapping`, `progressive-summarization`, `jol`, or `kwl` as installable folders.
- [ ] Should `--critical-thinking=true` be supported, or is the plain boolean flag enough?
- [ ] Branch setup after approval may be blocked by the current local `main` state: it is behind `origin/main` and has unrelated untracked files. Per workflow, implementation should stop if `main` is dirty unless those files are handled or an alternate worktree-from-`origin/main` approach is explicitly approved.

---

## 13. Alternatives Considered

### Alternative 1: Use `--version 7`

- What: Tell users to run `npx vidbyte-skills --version 7`.
- Why rejected: Version 7 installs reflection and goal-pursuit skills too. The user asked for only critical-thinking skills.

### Alternative 2: Tell Users To Run A Long `--skill` List

- What: Document a comma-separated command with all ten critical-thinking names.
- Why rejected: It is error-prone and was the problem the new CLI flag is meant to solve.

### Alternative 3: Infer Critical-Thinking Skills From README Text

- What: Parse README, `llms.txt`, or descriptions for “critical thinking.”
- Why rejected: Documentation text is not a stable API. A static dictionary is explicit, reviewable, and matches the user's request.

### Alternative 4: Add Tags To Skill Frontmatter

- What: Add `tags: [critical-thinking]` metadata to skill files and filter dynamically.
- Why rejected: This touches many prompt files and changes metadata conventions. The requested change is simpler and safer as a static code dictionary.

### Alternative 5: Add A New Version Bundle

- What: Add version 8 or another `lib/skill-versions.json` key containing only critical-thinking skills.
- Why rejected: The user asked for a CLI command/flag, not another version number. Version bundles are coarse release groups, while this is a curated cross-bundle selector.
