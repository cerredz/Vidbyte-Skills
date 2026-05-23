# Design Doc: Compress PR 72-81 Into One PR

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-22
**Last Updated:** 2026-05-22

---

## 1. Overview

Combine open draft PRs #72 through #81 in `cerredz/Vidbyte-Skills` into one reviewable draft PR against `main` so the reviewer can inspect the complete batch once instead of reviewing ten sequential PRs. The combined PR will preserve the content of each source PR, resolve only overlapping registry and test-file conflicts, run the existing validation suite, and leave the original PRs untouched unless the user separately asks to close them.

---

## 2. Goals & Non-Goals

### Goals

- Create one branch containing the cumulative content of PRs #72, #73, #74, #75, #76, #77, #78, #79, #80, and #81.
- Preserve the source PR commits' behavior and files as much as possible while making the combined tree coherent.
- Resolve shared-file conflicts in `skills-manifest.json`, `lib/skill-versions.json`, `scripts/validate.js`, and `scripts/smoke-test.js` by unioning compatible additions.
- Open a single draft PR targeting `main`.
- Run the repo's existing validation suite before PR creation.
- Keep the design-doc workflow intact by committing this design doc before implementation changes.

### Non-Goals

- Do not close, merge, or comment on PRs #72-#81 unless the user explicitly asks after the combined PR exists.
- Do not redesign the skills, rewrite their prompt content, or change behavior beyond conflict resolution required to combine the PRs.
- Do not publish npm packages or tag a release.
- Do not modify generated package copies under `packages/` unless the source PR content already does so or validation requires it.
- Do not add new dependencies.

---

## 3. Background & Context

- Repository: `cerredz/Vidbyte-Skills`, local path `C:\Users\422mi\vidbyte-repos\vidbyte-cli`.
- Current default branch: `main`.
- Current local `main` has untracked files under `docs/design/`; those must be handled before Phase 3 because the design-doc workflow requires a clean `main` before creating the implementation worktree.
- The repo is a Node package named `vidbyte-skills` with Node >=18. It also contains a stdlib-only Python CLI under `cli/`.
- Root install entry points live under `bin/`, shared installer logic under `lib/`, validation scripts under `scripts/`, and skill sources under `skills/<skill-name>/`.
- `skills-manifest.json` maps skills to `learning` and `reasoning` categories.
- `lib/skill-versions.json` maps version strings to skill names and is validated by `scripts/validate.js`.
- The standard verification command is `npm test`, which runs `scripts/validate.js`, `scripts/smoke-test.js`, and `scripts/cli-smoke-test.js`.
- All source PRs #72-#81 are open drafts against `main`, have the same merge base commit `951f78f9ee67999b51df4fd2ca355f34b89d3874`, and each is individually marked clean by GitHub.

Source PRs:

| PR | Branch | Summary |
|----|--------|---------|
| #72 | `feat/self-improving-skills-and-update-command` | Adds Self-Improving sections to 10 learning skills and adds `vidbyte-skills update`. |
| #73 | `feat/theoretical-feedback` | Adds `/theoretical-feedback` skill. |
| #74 | `feat/my-knowledge` | Adds `/my-knowledge` skill. |
| #75 | `feat/learn-from-video` | Adds `/learn-from-video` skill with helper scripts and references. |
| #76 | `feat/read-find-papers-skills` | Adds `/read-paper` and `/find-papers` skills, helpers, references, and validation updates. |
| #77 | `feat/docs-tldr` | Adds `/docs-tldr` skill, helpers, references, and validation updates. |
| #78 | `feat/jargon-utility-skill` | Adds `/jargon` utility skill. |
| #79 | `feat/scope-utility-skill` | Adds `/scope` utility skill and smoke-test coverage. |
| #80 | `feat/unit` | Adds `/unit` utility skill. |
| #81 | `feat/finding-resources-skill` | Adds `/finding-resources` skill, helpers, and references. |

---

## 4. Requirements

### Functional Requirements

1. The combined PR must include every file change from PRs #72-#81.
2. The combined PR must include this design doc at `docs/design/compress-pr-72-81.md`.
3. The branch must be created in an isolated git worktree after explicit approval.
4. The source PRs must be applied in numeric order, #72 through #81, to keep conflict resolution deterministic.
5. `skills-manifest.json` must include all newly added learning skills from the source PRs without duplicate entries.
6. `lib/skill-versions.json` must include all version additions from the source PRs without dropping entries from earlier source PRs.
7. Shared validator changes must preserve all accepted file extensions required by source PR helper files, including `.js`, `.py`, `.json`, and Markdown reference files.
8. Shared smoke-test changes must preserve the installer assertions added by source PRs.
9. The `vidbyte-skills update` command from PR #72 must route before normal installer parsing.
10. Existing source skill content must remain unchanged except where conflict markers or generated registry integration require resolution.
11. The final branch must pass `npm test`, or any failure must be reported with the exact command and error.
12. The final branch must be pushed and opened as a draft PR against `main`.

### Non-Functional Requirements

- Maintainability: conflict resolutions should be obvious union merges, not broad rewrites.
- Security: no secrets or `.env` files may be committed; the updater must retain npm registry access only and no arbitrary URL execution.
- Reliability: validation must catch missing manifest and version entries for every skill directory.
- Portability: preserve Windows and Unix behavior for the updater command and test scripts.
- Reviewability: preserve source PR design docs and create one combined PR body that lists included PRs and test evidence.

---

## 5. High-Level Design

The implementation will create a new feature branch, `feat/compress-pr-72-81`, in a separate worktree rooted under `C:\Users\422mi\vidbyte-repos\worktrees\`. The first commit on that branch will add this design doc. Subsequent commits will apply PR content in numeric groups so the final branch is reviewable by original feature area while still producing one PR.

The safest combine strategy is to fetch each PR head as `origin/pr/<number>` and replay the source PR commits or equivalent diffs into the implementation worktree in order. Most files are additive and should apply directly. The expected conflicts are in shared generated or registry-style files: `skills-manifest.json`, `lib/skill-versions.json`, `scripts/validate.js`, and `scripts/smoke-test.js`. Those conflicts will be resolved by preserving all additions from all source PRs.

Expected final registry intent:

```text
PR heads -> combined worktree -> unioned registries/tests -> npm test -> draft PR
```

The combined PR will not depend on the ten original PR branches after creation; it will target `main` directly and contain the effective result of the batch.

---

## 6. Detailed Design

### 6.1 Worktree and Branch Setup

**File(s):** N/A - git metadata
**Type:** N/A - branch/worktree operation

#### What it does

Creates an isolated implementation workspace so `main` and existing local untracked files are not used for implementation.

#### Interface / API

```bash
git checkout main
git pull origin main
git worktree add ../worktrees/feat-compress-pr-72-81 -b feat/compress-pr-72-81
```

#### Logic / Algorithm

1. Confirm `main` is clean.
2. Pull `origin/main`.
3. Create a worktree for `feat/compress-pr-72-81`.
4. Commit `docs/design/compress-pr-72-81.md` first.
5. Fetch source PR refs if not already present.

#### Edge Cases & Error Handling

- If `main` remains dirty due to existing untracked design docs, stop and report the blocker.
- If the worktree path already exists, inspect it and choose a non-conflicting path only if it is not an active unrelated user worktree.
- If `git pull` fails, stop without editing files.

---

### 6.2 Source PR Replay

**File(s):** Source PR commits from `origin/pr/72` through `origin/pr/81`
**Type:** Modified repository content

#### What it does

Applies all source PR content to the combined branch.

#### Interface / API

```bash
git fetch origin pull/72/head:refs/remotes/origin/pr/72
git fetch origin pull/73/head:refs/remotes/origin/pr/73
# repeated through PR 81
```

#### Logic / Algorithm

1. For each PR number from 72 to 81:
   1. Inspect `git log origin/main..origin/pr/<number>`.
   2. Apply commits in their original order with `git cherry-pick` where practical.
   3. If a cherry-pick conflicts, resolve only the conflicting hunks by preserving both PR additions.
   4. Run lightweight syntax checks for newly introduced helper scripts when useful.
   5. Commit the resolved result with a source-PR-aware commit message.
2. After all PRs are applied, inspect `git diff origin/main...HEAD --name-status` and compare it to the source PR file manifest.
3. Confirm no conflict markers remain.

#### Edge Cases & Error Handling

- Repeated edits to JSON registry files must be resolved as valid JSON.
- If two source PRs insert the same skill in different locations, keep one entry.
- If a source PR adds context-protocol metadata to `lib/skill-versions.json`, keep a single coherent `_context_protocol` object if validation accepts it.
- If a cherry-pick becomes too noisy, apply that PR's final diff and commit it as a combined source-PR commit instead of preserving every original commit.

---

### 6.3 Combined Skill Registries

**File(s):** `skills-manifest.json`, `lib/skill-versions.json`
**Type:** Modified

#### What it does

Creates coherent final registry files that include all source PR skill additions.

#### Interface / API

```json
{
  "learning": [
    "docs-tldr",
    "find-papers",
    "finding-resources",
    "jargon",
    "learn-from-video",
    "my-knowledge",
    "read-paper",
    "scope",
    "theoretical-feedback",
    "unit"
  ]
}
```

```json
{
  "3": ["theoretical-feedback", "learn-from-video", "find-papers", "read-paper", "docs-tldr"],
  "4": ["jargon", "scope", "unit", "finding-resources"]
}
```

#### Logic / Algorithm

1. Start from `main`'s current `skills-manifest.json`.
2. Add all new skill names from PRs #73-#81 to the `learning` array.
3. Preserve existing `reasoning` entries.
4. Start from `main`'s current `lib/skill-versions.json`.
5. Add all version entries from PRs that touched the version file:
   - Version `3`: `theoretical-feedback`, `learn-from-video`, `find-papers`, `read-paper`, `docs-tldr`.
   - Version `4`: `jargon`, `scope`, `unit`, `finding-resources`.
6. Preserve the fact that PR #74 added `my-knowledge` only to `skills-manifest.json` and did not register it in `lib/skill-versions.json`.
7. Ensure the files parse as JSON and pass `scripts/validate.js`.

#### Edge Cases & Error Handling

- `scripts/validate.js` rejects duplicate manifest entries.
- `scripts/validate.js` rejects version entries without matching `skills/<name>/SKILL.md`.
- If the source PRs use inconsistent ordering, prefer stable, readable ordering grouped by version while preserving every entry.

---

### 6.4 Update Command

**File(s):** `bin/install.js`, `lib/updater.js`, `README.md`, `cli/helpers/usage.py`
**Type:** Modified and new

#### What it does

Includes PR #72's `vidbyte-skills update` command.

#### Interface / API

```bash
vidbyte-skills update
npx vidbyte-skills update
```

#### Logic / Algorithm

1. `bin/install.js` checks `argv[0] === "update"` before normal installer execution.
2. `lib/updater.js` reads the current package version, fetches the latest npm metadata, installs `vidbyte-skills@latest` globally when needed, then runs the installer.
3. Windows uses `npm.cmd`; Unix-like platforms use `npm`.
4. README and Python CLI usage text document the command.

#### Edge Cases & Error Handling

- If npm metadata fetch fails, print a clear updater error and exit non-zero.
- If current version is already latest, exit cleanly.
- If global install fails, propagate the non-zero exit.

---

### 6.5 Self-Improving Skill Sections

**File(s):** `skills/concept-coverage/SKILL.md`, `skills/do-not-repeat/SKILL.md`, `skills/explain-away-others/SKILL.md`, `skills/mental-model/SKILL.md`, `skills/no-assumptions/SKILL.md`, `skills/practice/SKILL.md`, `skills/question-builder/SKILL.md`, `skills/question/SKILL.md`, `skills/struggle/SKILL.md`, `skills/transfer-signals/SKILL.md`
**Type:** Modified

#### What it does

Includes PR #72's skill-specific `## Self-Improving` append sections.

#### Interface / API

```markdown
## Self-Improving

### Protocol
...

### Things to Remember
```

#### Logic / Algorithm

1. Preserve each source PR section text.
2. Keep the section at the end of each skill file as introduced by PR #72.
3. Do not modify activation rules or core skill logic.

#### Edge Cases & Error Handling

- If any skill has changed on `main`, append without removing existing content.
- Avoid duplicate Self-Improving sections if a file already contains one.

---

### 6.6 Added Prompt Skills and Helpers

**File(s):** `skills/docs-tldr/**`, `skills/finding-resources/**`, `skills/find-papers/**`, `skills/jargon/**`, `skills/learn-from-video/**`, `skills/my-knowledge/**`, `skills/read-paper/**`, `skills/scope/**`, `skills/theoretical-feedback/**`, `skills/unit/**`
**Type:** New files

#### What it does

Adds all new skill packages from PRs #73-#81.

#### Interface / API

```markdown
---
name: <skill-name>
description: <non-empty description>
---
```

New skill invocations include:

```text
/theoretical-feedback
/my-knowledge
/learn-from-video
/read-paper
/find-papers
/docs-tldr
/jargon
/scope
/unit
/find-resource
/finding-resources
```

#### Logic / Algorithm

1. Preserve each `SKILL.md` from the source PRs.
2. Preserve each helper script and reference file from the source PRs.
3. Ensure frontmatter `name` matches the directory name for each skill.
4. Ensure helper scripts remain dependency-free unless the source PR already documented an optional external tool used by the host harness.

#### Edge Cases & Error Handling

- Markdown references are copied as data files and are validated through file presence and skill metadata.
- Helper scripts must be syntactically valid for their runtime where practical.
- Prompt-level commands are not HTTP APIs; validation is repository-structure validation plus manual invocation review.

---

### 6.7 Validation and Smoke Tests

**File(s):** `scripts/validate.js`, `scripts/smoke-test.js`
**Type:** Modified

#### What it does

Combines source PR validation changes so the expanded skill tree and helper files are accepted.

#### Interface / API

```bash
node scripts/validate.js
node scripts/smoke-test.js
node scripts/cli-smoke-test.js
npm test
```

#### Logic / Algorithm

1. Preserve existing validation checks for skill frontmatter, manifest references, and version references.
2. Include all source PR additions for permitted helper/reference file validation.
3. Preserve smoke test checks added for selector/version behavior.
4. Run `npm test` at the end.

#### Edge Cases & Error Handling

- If validation reveals a source PR omission, fix only the registry or validation integration needed for the combined tree.
- If Python is unavailable, report `scripts/cli-smoke-test.js` failure exactly.

---

## 7. Data Model Changes

### 7.1 Skill Category Manifest

**Change type:** Modified

```json
{
  "learning": [
    "docs-tldr",
    "find-papers",
    "finding-resources",
    "jargon",
    "learn-from-video",
    "my-knowledge",
    "read-paper",
    "scope",
    "theoretical-feedback",
    "unit"
  ]
}
```

**Migration strategy:** (if applicable)

- Forward migration: add the new skill directories first, then add the names to `skills-manifest.json`.
- Rollback plan: remove the new skill names from `skills-manifest.json` and delete their directories.

---

### 7.2 Skill Version Manifest

**Change type:** Modified

```json
{
  "3": ["theoretical-feedback", "learn-from-video", "find-papers", "read-paper", "docs-tldr"],
  "4": ["jargon", "scope", "unit", "finding-resources"]
}
```

**Migration strategy:** (if applicable)

- Forward migration: add version entries after corresponding skill directories exist.
- Rollback plan: remove the new skill names from their version arrays and remove empty version keys only if no remaining skills use them.

---

### 7.3 Prompt-Local Helper Types

**Change type:** New transient types

```typescript
type ResourceCandidate = {
  title: string;
  url: string;
  sourceType: string;
  depth?: string;
  orientation?: string;
};
```

**Migration strategy:** (if applicable)

- N/A - helper scripts operate on transient local data and do not persist repository data.

---

## 8. API Changes

### 8.1 CLI: `vidbyte-skills update`

**Change type:** New

**Request:**

```bash
vidbyte-skills update
```

**Response:**

```json
{
  "status": "already-up-to-date | updated | error",
  "currentVersion": "string",
  "latestVersion": "string"
}
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| N/A | npm registry lookup fails |
| N/A | global npm install fails |
| N/A | post-update reinstall fails |

---

### 8.2 Prompt Skill Invocations

**Change type:** New

**Request:**

```text
/<skill-name> [arguments]
```

**Response:**

```json
{
  "type": "markdown prompt output",
  "content": "skill-specific response"
}
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| N/A | Missing required topic, URL, paper, or situation |
| N/A | Host harness lacks web, browser, or file tools required by a specific skill |
| N/A | Optional helper script receives invalid arguments |

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/compress-pr-72-81.md` | Design document for the combined PR workflow |
| MODIFY | `bin/install.js` | Add `update` command routing from PR #72 |
| MODIFY | `cli/helpers/usage.py` | Document update command in Python CLI usage |
| CREATE | `docs/design/docs-tldr.md` | Preserve PR #77 design doc |
| CREATE | `docs/design/finding-resources-skill.md` | Preserve PR #81 design doc |
| CREATE | `docs/design/jargon-skill.md` | Preserve PR #78 design doc |
| CREATE | `docs/design/learn-from-video.md` | Preserve PR #75 design doc |
| CREATE | `docs/design/my-knowledge.md` | Preserve PR #74 design doc |
| CREATE | `docs/design/read-find-papers-skills.md` | Preserve PR #76 design doc |
| CREATE | `docs/design/scope-skill.md` | Preserve PR #79 design doc |
| CREATE | `docs/design/self-improving-skills-and-update-command.md` | Preserve PR #72 design doc |
| CREATE | `docs/design/theoretical-feedback-skill.md` | Preserve PR #73 design doc |
| CREATE | `docs/design/unit.md` | Preserve PR #80 design doc |
| MODIFY | `lib/skill-versions.json` | Union version registrations from PRs #73, #75, #76, #77, #78, #79, #80, and #81 |
| CREATE | `lib/updater.js` | Add updater implementation from PR #72 |
| MODIFY | `README.md` | Document update command from PR #72 |
| MODIFY | `scripts/smoke-test.js` | Preserve source PR smoke-test additions |
| MODIFY | `scripts/validate.js` | Preserve source PR validation additions |
| MODIFY | `skills/concept-coverage/SKILL.md` | Add Self-Improving section from PR #72 |
| CREATE | `skills/docs-tldr/references/known-docs-map.json` | Add docs-tldr reference map from PR #77 |
| CREATE | `skills/docs-tldr/scripts/extract-concepts.js` | Add docs-tldr helper from PR #77 |
| CREATE | `skills/docs-tldr/scripts/extract-operations.js` | Add docs-tldr helper from PR #77 |
| CREATE | `skills/docs-tldr/scripts/fetch-doc-pages.js` | Add docs-tldr helper from PR #77 |
| CREATE | `skills/docs-tldr/scripts/resolve-docs-url.js` | Add docs-tldr helper from PR #77 |
| CREATE | `skills/docs-tldr/SKILL.md` | Add docs-tldr skill from PR #77 |
| MODIFY | `skills/do-not-repeat/SKILL.md` | Add Self-Improving section from PR #72 |
| MODIFY | `skills/explain-away-others/SKILL.md` | Add Self-Improving section from PR #72 |
| CREATE | `skills/finding-resources/references/domain-source-map.md` | Add finding-resources reference from PR #81 |
| CREATE | `skills/finding-resources/references/source-type-playbook.md` | Add finding-resources reference from PR #81 |
| CREATE | `skills/finding-resources/scripts/build-search-plan.js` | Add finding-resources helper from PR #81 |
| CREATE | `skills/finding-resources/scripts/parse-finding-resources-args.js` | Add finding-resources helper from PR #81 |
| CREATE | `skills/finding-resources/scripts/rank-resources.js` | Add finding-resources helper from PR #81 |
| CREATE | `skills/finding-resources/SKILL.md` | Add finding-resources skill from PR #81 |
| CREATE | `skills/find-papers/references/domain-source-map.md` | Add find-papers reference from PR #76 |
| CREATE | `skills/find-papers/references/source-registry.md` | Add find-papers reference from PR #76 |
| CREATE | `skills/find-papers/scripts/deduplicate.js` | Add find-papers helper from PR #76 |
| CREATE | `skills/find-papers/scripts/rank-results.js` | Add find-papers helper from PR #76 |
| CREATE | `skills/find-papers/scripts/search-arxiv.js` | Add find-papers helper from PR #76 |
| CREATE | `skills/find-papers/scripts/search-eric.js` | Add find-papers helper from PR #76 |
| CREATE | `skills/find-papers/scripts/search-pubmed.js` | Add find-papers helper from PR #76 |
| CREATE | `skills/find-papers/scripts/search-semantic-scholar.js` | Add find-papers helper from PR #76 |
| CREATE | `skills/find-papers/SKILL.md` | Add find-papers skill from PR #76 |
| CREATE | `skills/jargon/references/jargon-field-map.md` | Add jargon reference from PR #78 |
| CREATE | `skills/jargon/scripts/extract-jargon.js` | Add jargon helper from PR #78 |
| CREATE | `skills/jargon/SKILL.md` | Add jargon skill from PR #78 |
| CREATE | `skills/learn-from-video/references/question-type-guide.md` | Add learn-from-video reference from PR #75 |
| CREATE | `skills/learn-from-video/references/research-basis.md` | Add learn-from-video reference from PR #75 |
| CREATE | `skills/learn-from-video/scripts/control-video.js` | Add learn-from-video helper from PR #75 |
| CREATE | `skills/learn-from-video/scripts/detect-browser-tools.js` | Add learn-from-video helper from PR #75 |
| CREATE | `skills/learn-from-video/scripts/extract-transcript.py` | Add learn-from-video helper from PR #75 |
| CREATE | `skills/learn-from-video/SKILL.md` | Add learn-from-video skill from PR #75 |
| MODIFY | `skills/mental-model/SKILL.md` | Add Self-Improving section from PR #72 |
| CREATE | `skills/my-knowledge/SKILL.md` | Add my-knowledge skill from PR #74 |
| MODIFY | `skills/no-assumptions/SKILL.md` | Add Self-Improving section from PR #72 |
| MODIFY | `skills/practice/SKILL.md` | Add Self-Improving section from PR #72 |
| MODIFY | `skills/question/SKILL.md` | Add Self-Improving section from PR #72 |
| MODIFY | `skills/question-builder/SKILL.md` | Add Self-Improving section from PR #72 |
| CREATE | `skills/read-paper/references/section-map.md` | Add read-paper reference from PR #76 |
| CREATE | `skills/read-paper/scripts/extract-signal.js` | Add read-paper helper from PR #76 |
| CREATE | `skills/read-paper/scripts/fetch-fulltext.js` | Add read-paper helper from PR #76 |
| CREATE | `skills/read-paper/scripts/resolve-url.js` | Add read-paper helper from PR #76 |
| CREATE | `skills/read-paper/scripts/strip-noise.js` | Add read-paper helper from PR #76 |
| CREATE | `skills/read-paper/SKILL.md` | Add read-paper skill from PR #76 |
| CREATE | `skills/scope/references/scope-field-map.md` | Add scope reference from PR #79 |
| CREATE | `skills/scope/scripts/parse-scope-args.js` | Add scope helper from PR #79 |
| CREATE | `skills/scope/SKILL.md` | Add scope skill from PR #79 |
| MODIFY | `skills/struggle/SKILL.md` | Add Self-Improving section from PR #72 |
| CREATE | `skills/theoretical-feedback/references/domain-examples.md` | Add theoretical-feedback reference from PR #73 |
| CREATE | `skills/theoretical-feedback/SKILL.md` | Add theoretical-feedback skill from PR #73 |
| MODIFY | `skills/transfer-signals/SKILL.md` | Add Self-Improving section from PR #72 |
| CREATE | `skills/unit/SKILL.md` | Add unit skill from PR #80 |
| MODIFY | `skills-manifest.json` | Union learning manifest entries from PRs #73-#81 |

---

## 10. Testing Plan

### Unit Tests

- `node --check skills/docs-tldr/scripts/extract-concepts.js`
- `node --check skills/docs-tldr/scripts/extract-operations.js`
- `node --check skills/docs-tldr/scripts/fetch-doc-pages.js`
- `node --check skills/docs-tldr/scripts/resolve-docs-url.js`
- `node --check skills/find-papers/scripts/deduplicate.js`
- `node --check skills/find-papers/scripts/rank-results.js`
- `node --check skills/find-papers/scripts/search-arxiv.js`
- `node --check skills/find-papers/scripts/search-eric.js`
- `node --check skills/find-papers/scripts/search-pubmed.js`
- `node --check skills/find-papers/scripts/search-semantic-scholar.js`
- `node --check skills/jargon/scripts/extract-jargon.js`
- `node --check skills/learn-from-video/scripts/control-video.js`
- `node --check skills/learn-from-video/scripts/detect-browser-tools.js`
- `python -m py_compile skills/learn-from-video/scripts/extract-transcript.py`
- `node --check skills/read-paper/scripts/extract-signal.js`
- `node --check skills/read-paper/scripts/fetch-fulltext.js`
- `node --check skills/read-paper/scripts/resolve-url.js`
- `node --check skills/read-paper/scripts/strip-noise.js`
- `node --check skills/scope/scripts/parse-scope-args.js`
- `node --check skills/finding-resources/scripts/build-search-plan.js`
- `node --check skills/finding-resources/scripts/parse-finding-resources-args.js`
- `node --check skills/finding-resources/scripts/rank-resources.js`

### Integration Tests

- `node scripts/validate.js`
- `node scripts/smoke-test.js`
- `node scripts/cli-smoke-test.js`
- `npm test`
- `node bin/install.js --version 3 --dry-run --platform codex`
- `node bin/install.js --version 4 --dry-run --platform codex`
- `node bin/install.js --version all --dry-run --platform codex`
- `node bin/install.js --skill docs-tldr,find-papers,finding-resources,jargon,learn-from-video,my-knowledge,read-paper,scope,theoretical-feedback,unit --dry-run --platform codex`

### Manual / QA Test Cases

1. Given `vidbyte-skills update`, when the package is already current, the command exits cleanly and does not run normal skill selector parsing.
2. Given each new skill directory, when `scripts/validate.js` runs, the skill frontmatter name matches its directory name.
3. Given `--version 3`, when the installer performs a dry run, the version 3 skills from the combined PR are selected.
4. Given `--version 4`, when the installer performs a dry run, the version 4 skills from the combined PR are selected.
5. Given `--version all`, when the installer performs a dry run, all versioned skills from existing and new versions are selected.
6. Given `skills-manifest.json`, confirm all newly created skill directories are listed exactly once.
7. Given source PRs #72-#81, confirm the final combined diff contains every file listed in the source PR file manifests.
8. Given a final branch, confirm `git diff --check origin/main...HEAD` reports no whitespace or conflict marker problems.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| GitHub CLI `gh` | Installed local CLI | Read source PRs and create the combined draft PR | Medium - requires authentication |
| GitHub repository | `cerredz/Vidbyte-Skills` | Source PR refs and PR creation target | Medium - branch or PR state may change |
| npm registry | `https://registry.npmjs.org/vidbyte-skills` | Used by PR #72 updater command | Medium - network failures or registry metadata issues |
| Node.js | `>=18` | Existing package runtime, validation, updater `fetch` support | Low |
| Python | Python 3 | Existing Python CLI smoke test and helper syntax checks | Medium - local binary may be absent |
| Host harness web/browser tools | Tool-dependent | Used by some prompt skills at runtime | Medium - availability varies by harness |

---

## 12. Rollout & Deployment

- Feature flags: N/A.
- Breaking change: No intended breaking change. The batch is additive except for the new update subcommand routing in `bin/install.js` and expanded validation/smoke-test behavior.
- Deployment order:
  1. Clean or otherwise resolve the local `main` untracked-file blocker.
  2. Create the isolated worktree and branch.
  3. Commit this design doc.
  4. Apply PRs #72-#81 in numeric order.
  5. Resolve shared registry and validation conflicts by unioning additions.
  6. Run syntax checks and `npm test`.
  7. Push `feat/compress-pr-72-81`.
  8. Open one draft PR against `main`.
- Rollback procedure:
  1. Close the combined draft PR if opened.
  2. Delete the remote branch `feat/compress-pr-72-81`.
  3. Remove the local worktree with `git worktree remove` after confirming no user work is present.
  4. Leave source PRs #72-#81 unchanged.

---

## 13. Open Questions

- [ ] Local `main` currently has untracked design docs. Should I remove/stash/ignore those before Phase 3, or are they intentional files that need to be preserved elsewhere?
- [ ] Should `my-knowledge` remain manifest-only as PR #74 currently implements it, or should it be assigned to a version in `lib/skill-versions.json` as part of this combined PR?
- [ ] After the combined PR is opened, do you want the original draft PRs #72-#81 closed with a comment pointing to the combined PR, or left open?

---

## 14. Alternatives Considered

### Alternative 1: Merge PRs #72-#81 sequentially

- What: Review and merge each draft PR in GitHub one by one.
- Why rejected: The user explicitly asked to avoid reviewing and commenting on the PRs sequentially.

### Alternative 2: Create a squashed patch from all PR diffs

- What: Apply all source PR final diffs into one large commit.
- Why rejected: This would make conflict resolution less traceable. Grouped replay by source PR preserves the origin of each feature area while still producing one review PR.

### Alternative 3: Base the combined PR on one of the existing PR branches

- What: Pick PR #72 or #81 as the base and merge the others into it.
- Why rejected: All PRs share the same `main` merge base, so a fresh branch is cleaner and avoids implying ownership by one source PR.

### Alternative 4: Reimplement the features manually from PR descriptions

- What: Read PR bodies and recreate the final code by hand.
- Why rejected: The source PR branches already contain the desired content. Replaying those commits or diffs reduces accidental drift and preserves reviewed artifacts.
