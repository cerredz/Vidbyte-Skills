# Design Doc: Version Two Background Learning Skills

**Status:** Draft
**Author:** Codex
**Created:** 2026-06-21
**Last Updated:** 2026-06-21

---

## 1. Overview

Add the newly added background learning skills to the curated version 2 install bundle so users can install them as a coherent learning-artifact set. The feature keeps the existing versioned installer architecture intact, registers the missing `misconceptions` skill in the learning catalog, and updates user-facing documentation so users know these skills run silently during a conversation and produce artifacts at the end.

---

## 2. Goals & Non-Goals

### Goals

- Populate version `2` in `lib/skill-versions.json` with `concept-coverage`, `question-builder`, `struggle`, `transfer-signals`, and `misconceptions`.
- Ensure every version 2 skill is registered under the `learning` category in `skills-manifest.json`.
- Update README documentation to describe version 2 as the background learning skills bundle.
- Document the correct install command for version 2 under the current default-version behavior.
- Preserve the existing installer flow for `vidbyte-skills`, `vidbyte-learning-skills`, explicit skill selection, category filtering, and `--version all`.

### Non-Goals

- Do not modify the content or behavior of the five `SKILL.md` files.
- Do not change the default installer version from `1` to `2`.
- Do not add a new CLI flag, package, runtime, background daemon, or persistent process.
- Do not add backend submission behavior or Vidbyte API calls.
- Do not change category-filtering semantics for learning, reasoning, roleplay, or all-skill installs.
- Do not add new tests or verification scripts as part of this no-tests design workflow.

---

## 3. Background & Context

The repository already has a versioned skills manifest. `lib/skill-versions.json` maps version strings to skill names, `lib/skill-versions.js` reads that JSON and filters discovered skills, and `lib/installer.js` applies the version filter after optional category filtering unless the user explicitly requested skill names. `lib/cli-options.js` defaults `--version` to `1`, and the current help text says `--version <1|2|all>`.

Version `2` currently exists as an empty array, so `npx vidbyte-skills --version 2` selects no skills. The requested background learning skills already exist on disk under `skills/`: `concept-coverage`, `question-builder`, `struggle`, `transfer-signals`, and `misconceptions`. Four of those are already registered in `skills-manifest.json` under `learning`; `misconceptions` exists on disk but is not currently registered in the manifest, which also means validation is expected to fail until it is added.

The learning package wrapper, `bin/learning.js` and `packages/learning/bin/install.js`, calls the same shared `installVidbyteSkills(argv, "learning")` path. That means a version 2 update in the shared manifests will apply to both `npx vidbyte-skills --version 2` and `npx vidbyte-learning-skills --version 2` without a separate package-specific implementation.

The user-provided marketing copy says "Try it now: npx vidbyte-skills", but the current codebase intentionally defaults `npx vidbyte-skills` to version `1`. This design treats version 2 as opt-in through `--version 2` and lists the default-command wording as an open question rather than changing default install behavior.

---

## 4. Requirements

### Functional Requirements

1. Version `2` in `lib/skill-versions.json` SHALL include exactly these requested background learning skills: `concept-coverage`, `question-builder`, `struggle`, `transfer-signals`, and `misconceptions`.
2. `skills-manifest.json` SHALL list `misconceptions` in the `learning` category.
3. The implementation SHALL NOT duplicate any existing `learning` manifest entry for `concept-coverage`, `question-builder`, `struggle`, or `transfer-signals`.
4. `npx vidbyte-skills --version 2` and `node bin/install.js --version 2` SHALL select the five version 2 skills when no explicit skill names are provided.
5. `npx vidbyte-learning-skills --version 2` and `node bin/learning.js --version 2` SHALL select the same five skills after learning-category filtering.
6. Existing explicit skill selection behavior SHALL remain unchanged: positional skill names and `--skill` SHALL override version filtering.
7. README documentation SHALL describe version 2 as a background learning skills bundle that is activated once, runs quietly through the conversation, and produces a learning artifact at the end.
8. README documentation SHALL include the requested skill descriptions for `/concept-coverage`, `/question-builder`, `/struggle`, `/transfer-signals`, and `/misconceptions`.
9. README documentation SHALL avoid claiming plain `npx vidbyte-skills` installs version 2 unless the default version is intentionally changed in a separate approved design.

### Non-Functional Requirements

- Performance: No new runtime scanning or installation work beyond the existing version filtering over discovered skills.
- Scalability: Future version 2 additions remain a manifest-only update unless they introduce new skill files.
- Security: No new network calls, shell execution, credentials, or backend interactions.
- Observability: Existing install reporter output continues to show `version 2` and the selected skill names.
- Reliability / error tolerance: Existing validation should catch a missing skill directory, invalid skill name, duplicate manifest entry, or version manifest reference to a non-existent skill.

---

## 5. High-Level Design

This is a catalog and documentation change. The installer already supports versioned selection, category filtering, and dry-run output. The core implementation updates the version manifest so version `2` resolves to the five requested background skills, then updates the category manifest so `misconceptions` is a valid learning skill like the other four.

The data flow remains unchanged:

```text
User runs --version 2
        |
        v
parseArgs() sets options.version = "2"
        |
        v
installVidbyteSkills(argv, optional category)
        |
        v
discoverSkills() -> optional learning category filter -> filterByVersion("2")
        |
        v
install selected background learning skills into requested targets
```

The README update should introduce version 2 near the existing install/version documentation and keep the existing skill table accurate. Since the current default remains version `1`, the version 2 try-now command should be `npx vidbyte-skills --version 2` or `npx vidbyte-learning-skills --version 2`, not plain `npx vidbyte-skills`.

The design deliberately avoids changing `lib/installer.js`, `lib/skill-catalog.js`, `lib/cli-options.js`, or `bin/learning.js` because the required runtime behavior already exists. Keeping the change in manifests and docs reduces blast radius and preserves the versioned architecture introduced by `docs/design/versioned-skills-index.md`.

---

## 6. Detailed Design

### 6.1 Version 2 Skills Manifest

**File(s):** `lib/skill-versions.json`
**Type:** Modified

#### What it does

Defines which skills are installed for each curated skills version.

#### Interface / API

```json
{
  "2": [
    "concept-coverage",
    "question-builder",
    "struggle",
    "transfer-signals",
    "misconceptions"
  ]
}
```

#### Logic / Algorithm

1. Keep existing `_context_protocol`, version `1`, version `3`, and version `4` entries unchanged.
2. Replace the empty version `2` array with the five requested skill names.
3. Use valid skill directory names that already exist under `skills/<name>/SKILL.md`.
4. Keep the list compact and deterministic; alphabetical order is acceptable, but preserving the request order makes the README copy line up with the user-provided sequence.

#### Edge Cases & Error Handling

- If any named skill is missing from disk, `scripts/validate.js` reports a version manifest error.
- If version `2` is left empty, the installer reports no installable skills for the requested version, which would fail the core request.
- If a non-learning skill is accidentally placed in version `2`, `vidbyte-learning-skills --version 2` would filter it out before version filtering; this design avoids that by registering all five as learning skills.

### 6.2 Learning Category Manifest

**File(s):** `skills-manifest.json`
**Type:** Modified

#### What it does

Registers skills by product category so category-specific installers can select only learning, reasoning, or roleplay skills.

#### Interface / API

```json
{
  "learning": [
    "concept-coverage",
    "misconceptions",
    "question-builder",
    "struggle",
    "transfer-signals"
  ]
}
```

#### Logic / Algorithm

1. Read the existing `learning` array.
2. Confirm `concept-coverage`, `question-builder`, `struggle`, and `transfer-signals` are already present.
3. Insert `misconceptions` once into the `learning` array.
4. Preserve existing manifest categories and avoid duplicate entries.

#### Edge Cases & Error Handling

- If `misconceptions` remains unregistered, `npm run validate` should report `skills/misconceptions is not listed in skills-manifest.json`.
- If `misconceptions` is added twice, validation should report a duplicate manifest entry.
- If it is added under the wrong category, `vidbyte-learning-skills --version 2` may not install the complete version 2 bundle.

### 6.3 README Version 2 Documentation

**File(s):** `README.md`
**Type:** Modified

#### What it does

Explains the new version 2 bundle and keeps the public skill catalog accurate.

#### Interface / API

```markdown
## Version 2 Background Learning Skills

Install the background learning bundle:

```bash
npx vidbyte-skills --version 2
npx vidbyte-learning-skills --version 2
```

Run a background skill once, keep working, and end it with its `-end` command to write the learning artifact.
```

The learning table should include:

```markdown
| misconceptions | `/misconceptions` | Silently tracks faulty mental models during the session and writes an end-of-session misconception log |
```

#### Logic / Algorithm

1. Add a short version 2 subsection near the existing install/version documentation.
2. Explain that these are background skills that activate once, run silently during the conversation, and produce a learning artifact at the end.
3. List the five commands and concise descriptions:
   - `/concept-coverage`: maps what the user understands versus skipped gaps.
   - `/question-builder`: creates next-step and retention questions.
   - `/struggle`: tracks recurring struggle points.
   - `/transfer-signals`: catches useful cross-domain pattern transfers.
   - `/misconceptions`: logs faulty mental models before the session closes.
4. Add `misconceptions` to the existing Learning table.
5. Keep the command examples accurate under the current default version behavior.

#### Edge Cases & Error Handling

- Plain `npx vidbyte-skills` currently installs version `1`, so README copy must not present it as the version 2 try-now command.
- The skill bodies use `*-end` commands to write artifacts; documentation should avoid implying that the installer itself produces artifacts.
- `misconceptions` currently writes Markdown while the other four write JSON; README should use the broader phrase "learning artifact" rather than "JSON artifact" for the whole bundle.

---

## 7. Data Model Changes

### 7.1 `lib/skill-versions.json`

**Change type:** Modified

```json
{
  "2": ["concept-coverage", "question-builder", "struggle", "transfer-signals", "misconceptions"]
}
```

**Migration strategy:** N/A - source-controlled manifest update only.

- Forward migration: replace the empty version `2` array with the five skill names.
- Rollback plan: restore version `2` to an empty array or remove only the five added names.

### 7.2 `skills-manifest.json`

**Change type:** Modified

```json
{
  "learning": ["misconceptions"]
}
```

**Migration strategy:** N/A - source-controlled manifest update only.

- Forward migration: add `misconceptions` to the existing `learning` array.
- Rollback plan: remove `misconceptions` from the `learning` array only if the skill should no longer be installable through the learning package.

---

## 8. API Changes

N/A - No HTTP API, backend endpoint, public package entry point, or CLI option is created, modified, deprecated, or deleted.

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/version-two-background-learning-skills.md` | Design source of truth for this change |
| MODIFY | `lib/skill-versions.json` | Populate version 2 with the requested background learning skills |
| MODIFY | `skills-manifest.json` | Register `misconceptions` as a learning skill and preserve complete category selection |
| MODIFY | `README.md` | Document the version 2 bundle, accurate install command, and `misconceptions` catalog entry |

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| N/A | N/A | No new dependencies or external services | N/A |

---

## 11. Rollout & Deployment

- Feature flags: None.
- Breaking change: No. Version `1` remains the default, explicit skill selection still overrides version filtering, and `--version all` remains available.
- Deployment order: Single PR with manifest and README updates.
- Package build behavior: `scripts/build-packages.js` copies shared `lib`, `skills`, `skills-manifest.json`, and README into category packages, so the learning package receives the shared version update through the existing build flow.
- Suggested verification during implementation: run `npm run validate`, then dry-run `node bin/install.js --version 2 --dry-run --platform codex` and `node bin/learning.js --version 2 --dry-run --platform codex`.
- Rollback procedure: revert the PR or remove the five version `2` entries and the README section. If rolling back `misconceptions` category registration, confirm no other version or package relies on it.

---

## 12. Open Questions

- [ ] Should the public try-now copy intentionally remain `npx vidbyte-skills`, which would require changing the default version, or should the README use `npx vidbyte-skills --version 2` to match the existing versioned installer behavior?
- [ ] Should `misconceptions` be updated in a later PR to match the JSON artifact style of the other background learning skills, or is the current Markdown log acceptable for version 2?
- [ ] Should `lib/cli-options.js` help text be broadened from `--version <1|2|all>` to mention all available versions (`1|2|3|4|all`) in a separate cleanup, since this request only changes version 2 content?

---

## 13. Alternatives Considered

### Alternative 1: Change the default installer version to 2

- What: Make plain `npx vidbyte-skills` install version `2`.
- Why rejected: The current code and README intentionally default to version `1`. Changing the default would alter first-run behavior for all users and is larger than "add this to version two."

### Alternative 2: Add only `lib/skill-versions.json` entries

- What: Populate version `2` and leave `skills-manifest.json` and README untouched.
- Why rejected: `misconceptions` is not currently in the learning category, so the learning package path would be incomplete. README would also omit one of the requested skills.

### Alternative 3: Create a separate background-skills category

- What: Add a new manifest category and category-specific installer for background skills.
- Why rejected: The existing product taxonomy already places these under learning, and the request asks for version two rather than a new package surface.

### Alternative 4: Modify each `SKILL.md` with version metadata

- What: Add `version: 2` frontmatter to each background skill.
- Why rejected: The repo already uses `lib/skill-versions.json` as the central source of truth for version membership. Per-skill version metadata would duplicate that source and increase drift risk.
