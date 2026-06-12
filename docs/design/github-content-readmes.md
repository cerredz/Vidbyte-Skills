# Design Doc: GitHub Content README Expansion

**Status:** Draft
**Author:** Codex
**Created:** 2026-06-12
**Last Updated:** 2026-06-12

---

## 1. Overview

Expand the `vidbyte-cli` / `Vidbyte-Skills` repository into a stronger GitHub content surface by improving the root README and adding focused README files for the installable skills catalog and Python command layer. The goal is to make the repository understandable to search crawlers, developers, educators, and awesome-list reviewers: what Vidbyte is, why skills matter, how the CLI works, and how coding agents should use the repository without having to infer the architecture from install snippets alone.

---

## 2. Goals & Non-Goals

### Goals

- Improve the root `README.md` so it explains Vidbyte and Vidbyte Skills as a portable skill and agent-learning distribution surface, not only an installer command.
- Add `skills/README.md` explaining the skill catalog, naming conventions, manifest categories, authoring shape, install behavior, and learning/reasoning/roleplay positioning.
- Add `cli/commands/README.md` because the audited command implementation folder is `cli/commands/`; there is no root `commands/` directory.
- Explain the Python CLI command abstraction: `auth`, `feedback submit`, `compressor submit`, and `retain`.
- Describe the security philosophy: prompt text creates content, while the CLI owns sessions, invocation-token auth, sanitization, backend URLs, and request dispatch.
- Include small, audited command and code snippets based on the current source files.
- Add a deterministic verification script for README coverage, required phrases, headings, and snippets.

### Non-Goals

- No CLI runtime code changes.
- No skill content rewrites beyond the new `skills/README.md`.
- No changes to `skills-manifest.json`, `lib/skill-versions.json`, package binaries, installer behavior, or backend endpoints.
- No external awesome-list PRs or submissions in this change.
- No creation of a new root `commands/` directory unless the user explicitly approves that scope change later.
- No cleanup or reversion of the existing dirty working tree changes in `bin/`, `lib/`, `package.json`, `scripts/`, `skills-manifest.json`, or untracked roleplay docs.

---

## 3. Background & Context

The repository currently exposes two related surfaces:

- A Node package named `vidbyte-skills` with binaries in `package.json`: `vidbyte`, `vidbyte-skills`, `vidbyte-learning-skills`, `vidbyte-reasoning-skills`, `install-roleplay`, `vidbyte-roleplay-skills`, and `install`.
- A stdlib-only Python CLI under `cli/`, invoked by the Node `vidbyte` shim for backend submissions and auth-related operations.

The current root README explains install commands, installer options, supported platforms, update behavior, the `vidbyte` backend CLI, add-a-skill instructions, reasoning trace skills, and `npm test`. It is functional but begins at the installer behavior rather than the broader Vidbyte story. The prompt asks for "GitHub as a content surface" and specifically requests richer README coverage for the CLI repo, plus README files under `skills/` and the commands folder.

Audited code relevant to this design:

- `package.json`: Node package metadata, binaries, scripts, files, and keywords.
- `README.md`: current root install and CLI usage docs.
- `lib/skill-catalog.js`: discovers `skills/`, parses frontmatter, filters by category and version.
- `lib/installer.js`: reads install options, validates skills, installs skill directories or rule files into target harnesses.
- `lib/cli-options.js`: parses installer flags.
- `scripts/validate.js`: validates skill frontmatter, manifest registration, and version manifest.
- `scripts/smoke-test.js`: validates installer behavior across target harness directories/rules.
- `cli/__main__.py`: parses the Python `vidbyte` command surface.
- `cli/router.py`: routes `feedback`, `compressor`, `retain`, and `auth`.
- `cli/client.py`: owns backend endpoint mapping, dry-run behavior, session-token and invocation-token request flow.
- `cli/commands/*.py`: command classes for `auth`, `feedback`, `compressor`, and `retain`.
- `skills/`: large catalog of installable skill directories, each with `SKILL.md`.
- `skills-manifest.json`: category mapping for learning, reasoning, utility, and roleplay skills.

The repo is currently dirty before this task: `bin/install.js`, `lib/skill-catalog.js`, `package.json`, `scripts/validate.js`, and `skills-manifest.json` are modified, and `bin/roleplay.js` plus several design docs are untracked. This documentation design must not revert or overwrite unrelated changes.

---

## 4. Requirements

### Functional Requirements

1. The root `README.md` SHALL explain Vidbyte as an agent-learning and skill distribution platform for local coding harnesses.
2. The root `README.md` SHALL keep existing install commands, options, supported platform lists, update guidance, add-a-skill instructions, and verification guidance that remain accurate.
3. The root `README.md` SHALL add a concise architecture/navigation section linking to `skills/README.md` and `cli/commands/README.md`.
4. The root `README.md` SHALL mention the relationship between `vidbyte-skills` installation and the `vidbyte` backend submission CLI.
5. The root `README.md` SHALL include language useful for GitHub search and awesome-list reviewers without claiming external list inclusion.
6. `skills/README.md` SHALL explain what Vidbyte Skills are and how they fit into Vidbyte.
7. `skills/README.md` SHALL explain the skill directory contract: `skills/<name>/SKILL.md`, YAML frontmatter, lowercase hyphen-case names, optional `scripts/`, `references/`, and `assets/`.
8. `skills/README.md` SHALL explain the catalog categories present in `skills-manifest.json`: learning, reasoning, utility, and roleplay.
9. `skills/README.md` SHALL explain how installer discovery reads frontmatter through `lib/skill-catalog.js` and how validation checks manifest registration through `scripts/validate.js`.
10. `skills/README.md` SHALL include examples for installing all skills, installing a specific skill, and selecting category-specific binaries where applicable.
11. `skills/README.md` SHALL include a small skill authoring snippet using real frontmatter shape.
12. `cli/commands/README.md` SHALL explain what Vidbyte's Python command layer is and why it exists inside the Node package.
13. `cli/commands/README.md` SHALL explain each current command class:
    - `AuthCommand`: login, logout, status.
    - `FeedbackCommand`: `feedback submit`.
    - `CompressorCommand`: `compressor submit`.
    - `RetainCommand`: `retain` submit flow.
14. `cli/commands/README.md` SHALL explain the command routing model through `cli/__main__.py` and `cli/router.py`.
15. `cli/commands/README.md` SHALL explain the security model: official origin only, sanitization, session storage abstraction, invocation-token auth, dry-run validation, and no prompt-owned auth headers.
16. `cli/commands/README.md` SHALL include command-line examples and at least one Python snippet showing command routing or request-builder use.
17. Documentation SHALL avoid real API keys, session tokens, invocation tokens, or backend secrets.
18. A verification script SHALL assert that all required README files exist and contain required sections, phrases, and snippets.

### Non-Functional Requirements

- Performance: N/A - documentation-only change.
- Scalability: README content should make future commands and skills easier to document by following existing patterns.
- Security: Examples must not include real secrets and must reinforce that prompts do not construct authenticated backend requests.
- Observability: N/A - no runtime logging, tracing, or metrics behavior changes.
- Reliability: Documentation must be grounded in local code audited during this design.
- Maintainability: Verification should fail if the new README files lose required sections.
- Compatibility: Existing installer and CLI usage instructions must remain valid.

---

## 5. High-Level Design

The implementation will improve the root README as the repository-wide content surface and add two deeper README files where GitHub folder views need immediate context:

```text
README.md
  |
  +-- skills/README.md
  |     Explains installable skills, catalog categories, authoring, validation.
  |
  +-- cli/commands/README.md
        Explains command classes, routing, backend submission, auth boundary.
```

No runtime files will change. The documentation will use a consistent structure: what Vidbyte is, role in the repository, design philosophy, usage, key files, and related flows. `cli/commands/README.md` will be placed under the actual audited folder rather than creating a new root `commands/` folder. If the user wants a root `commands/` README instead, that can be added after approval as a manifest change.

Verification will be done by a Node script because this repository's primary package tooling is Node and `npm test` already uses Node scripts. The script will check the README files for required headings, phrases, code fences, and command examples, then print PASS/FAIL lines and exit non-zero on failure.

---

## 6. Detailed Design

### 6.1 Root Repository README

**File(s):** `README.md`
**Type:** Modified

#### What it does

Expands the top-level content surface so readers understand Vidbyte Skills before they reach install syntax.

#### Interface / API

```markdown
# Vidbyte Skills

Vidbyte helps developers package agent workflows as portable skills...

## Repository Map
| Area | Role |
| ... |
```

#### Logic / Algorithm

1. Replace the narrow opening paragraph with a richer explanation of Vidbyte, the skill catalog, and the CLI.
2. Add a "Repository Map" section linking to `skills/README.md` and `cli/commands/README.md`.
3. Add an "Why GitHub Skills Matter" or equivalent section explaining local harness portability, learning workflows, reasoning traces, and backend submission safety.
4. Preserve existing command examples and supported platform information.
5. Avoid claiming `awesome-*` list membership.

#### Edge Cases & Error Handling

- If existing README examples still reflect current code, preserve them.
- If a package binary is currently dirty in the working tree, do not infer new behavior from uncommitted code unless it is read and confirmed.

### 6.2 Skills Catalog README

**File(s):** `skills/README.md`
**Type:** New file

#### What it does

Explains the installable skill catalog and how skill files are discovered, validated, categorized, versioned, and installed.

#### Interface / API

```markdown
---
name: my-skill
description: Use this skill when...
---

# My Skill
```

```bash
npx vidbyte-skills
npx vidbyte-skills --skill retain,feedback-route
npx vidbyte-learning-skills
npx vidbyte-reasoning-skills
```

#### Logic / Algorithm

1. Introduce `skills/` as the source of truth for installable Vidbyte skills.
2. Explain the `SKILL.md` file contract and optional supporting folders.
3. Explain categories from `skills-manifest.json`: learning, reasoning, utility, roleplay.
4. Explain version filtering at a high level using `lib/skill-versions.json`.
5. Explain validation and smoke testing commands.
6. Include authoring and installation examples.

#### Edge Cases & Error Handling

- Do not list every skill by name; the catalog is large and changes frequently.
- Mention `scripts/validate.js` as the authoritative structural check.

### 6.3 Command Layer README

**File(s):** `cli/commands/README.md`
**Type:** New file

#### What it does

Explains the Python command abstraction layer inside the CLI package.

#### Interface / API

```bash
vidbyte feedback submit --file feedback.md --domain software-engineering --conversation-id example --dry-run
vidbyte retain --concept1-name "Concept" --concept1-distillation "Mechanism" --question1 "Question?" --answer1 "Answer" --dry-run
vidbyte-skills auth status
```

```python
from cli.router import CommandRouter

result = CommandRouter().route("feedback", "submit", {"file": "feedback.md", "dry-run": True})
```

#### Logic / Algorithm

1. Explain that `bin/vidbyte.js` delegates to the Python module.
2. Explain `cli/__main__.py` top-level parsing:
   - `retain` is a single-resource shortcut.
   - most commands use `resource action`.
3. Explain `CommandRouter` branches.
4. Explain each command class and the endpoint it targets through `VidbyteRequestBuilder`.
5. Explain dry-run behavior and sanitized file content.
6. Explain auth/session/invocation-token model without exposing implementation secrets.

#### Edge Cases & Error Handling

- Do not say prompts are trusted auth boundaries.
- Do not include real API key examples; if a key shape is mentioned, use placeholders only.
- Note that network submission requires authentication, while `--dry-run` validates request shape locally.

### 6.4 Verification Script

**File(s):** `scripts/test-github-content-readmes.js`
**Type:** New file

#### What it does

Checks the new README content surface for required files, headings, phrases, and snippets.

#### Interface / API

```javascript
function main() {
  // Prints PASS/FAIL for README checks and exits non-zero on failure.
}
```

#### Logic / Algorithm

1. Resolve repository root from the script location.
2. Define required files:
   - `README.md`
   - `skills/README.md`
   - `cli/commands/README.md`
3. Check all files exist and are non-empty.
4. Check root README contains `Vidbyte`, `skills/README.md`, `cli/commands/README.md`, `vidbyte-skills`, and `vidbyte`.
5. Check `skills/README.md` contains `Role In The Repository`, `Design Philosophy`, `Usage`, `SKILL.md`, `skills-manifest.json`, `learning`, `reasoning`, `utility`, `roleplay`, and a fenced code block.
6. Check `cli/commands/README.md` contains `Role In The Repository`, `Design Philosophy`, `Usage`, `AuthCommand`, `FeedbackCommand`, `CompressorCommand`, `RetainCommand`, `CommandRouter`, `VidbyteRequestBuilder`, `--dry-run`, and a fenced code block.
7. Print `PASS` or `FAIL` for each check.
8. Print `X/Y tests passed`.
9. Exit with status `1` if any check fails.

#### Edge Cases & Error Handling

- Missing files should report the exact missing path.
- Empty files should fail separately from missing files.
- Headings are checked as text rather than rendered Markdown.

---

## 7. Data Model Changes

N/A - documentation-only change. No skill manifest schema, skill frontmatter schema, package manifest shape, backend payload dataclass, request format, or persisted auth/session format changes.

---

## 8. API Changes

N/A - no CLI command, HTTP endpoint, package binary, installer flag, Node API, or Python command interface changes.

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/github-content-readmes.md` | Design-doc workflow source of truth for CLI README expansion |
| MODIFY | `README.md` | Reframe the repository as a rich GitHub content surface |
| CREATE | `skills/README.md` | Explain the installable skill catalog, categories, authoring, and validation |
| CREATE | `cli/commands/README.md` | Explain the Python command layer and backend submission security boundary |
| CREATE | `scripts/test-github-content-readmes.js` | Required verification script for README coverage |

Total: 4 files created, 1 file modified, 0 files deleted.

---

## 10. Testing Plan

### Unit Tests

- [Edge Case] `scripts/test-github-content-readmes.js` detects a missing `skills/README.md`.
- [Edge Case] `scripts/test-github-content-readmes.js` detects an empty `cli/commands/README.md`.
- [Hidden Failure] `scripts/test-github-content-readmes.js` rejects a skills README that omits `skills-manifest.json`, because the file could appear useful while failing to explain catalog categories.
- [Hidden Failure] `scripts/test-github-content-readmes.js` rejects a command README that omits `VidbyteRequestBuilder`, because that would hide the security/request boundary.
- [Silent Failure] `scripts/test-github-content-readmes.js` rejects a root README that omits links to one of the deeper README files.
- [Silent Failure] `scripts/test-github-content-readmes.js` rejects a command README that omits `--dry-run`, because readers could miss the local validation workflow while docs still look complete.
- [Hidden Assumption] `scripts/test-github-content-readmes.js` checks for all four manifest categories: learning, reasoning, utility, and roleplay.
- [Hidden Assumption] `scripts/test-github-content-readmes.js` checks the real command class names, assuming documentation should match the current Python command classes.

### Integration Tests

- [Edge Case] Run `node scripts/test-github-content-readmes.js` from the repo root; it must print PASS/FAIL lines and exit `0`.
- [Hidden Failure] Run `npm test` after README additions if the current dirty worktree and environment allow; documentation should not affect existing validation or smoke tests.
- [Silent Failure] Run `npm pack --dry-run` if environment allows; confirm package file inclusion remains sane and new README files under included directories would be packaged.
- [Hidden Assumption] Run `python -m cli --help` to confirm no runtime command behavior changed.

### Manual / QA Test Cases

1. [Edge Case] Open root `README.md` and confirm the first two sections answer "what is Vidbyte?" and "what is this repo?"
2. [Edge Case] Open `skills/README.md` in isolation and confirm a new contributor can understand how to add a skill.
3. [Hidden Failure] Open `cli/commands/README.md` and confirm it does not tell users to call `https://vidbyte.pro` directly.
4. [Hidden Failure] Search the three README files for `vb_live_`, `session_token`, `invocation_token`, `Authorization: Bearer`, and obvious secret placeholders that look real.
5. [Silent Failure] Confirm the root README does not claim inclusion in `awesome-mcp-servers`, `awesome-learning`, or `awesome-edtech`.
6. [Silent Failure] Confirm the command README documents `compressor submit` as well as `feedback` and `retain`, so the command surface is not accidentally narrowed.
7. [Hidden Assumption] Confirm the command README path is `cli/commands/README.md`, matching the actual repo folder rather than a non-existent root `commands/` directory.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Node.js | `>=18` from `package.json` | Verification script runtime and existing package tooling | Low |
| Python standard library | Host Python used by `python -m cli` | Existing CLI command context | Low |
| Vidbyte backend | `https://vidbyte.pro` from `cli/constants/auth.py` and `cli/client.py` | Existing backend submission target documented by CLI docs | Medium; docs must preserve auth boundary and avoid direct-call instructions |
| Local coding harnesses | Claude Code, Codex, Gemini CLI, Cursor, etc. | Existing installer targets described by README | Medium; docs must distinguish skill install behavior from backend command behavior |

---

## 12. Rollout & Deployment

- Feature flags: N/A - documentation-only.
- Breaking change: No.
- Migration path: N/A.
- Deployment order after approval:
  1. Create isolated worktree from up-to-date `main`.
  2. Commit this design doc first.
  3. Modify the root README and add the two deeper README files.
  4. Add and run `scripts/test-github-content-readmes.js`.
  5. Run relevant existing checks if the environment allows.
  6. Commit documentation and verification script.
- Rollback procedure: Revert the documentation and script commits. No package, backend, or user-data rollback is required.

---

## 13. Open Questions

- [ ] Should a new root `commands/` directory be created solely to satisfy the wording "commands folder", or is `cli/commands/README.md` the intended target because it is the actual command folder?
- [ ] Should the root README include a section naming target awesome lists, or should awesome-list positioning stay implicit until a separate submission task?
- [ ] Should the verification script be added to `npm test`, or should it remain a standalone script run during this PR only?

---

## 14. Alternatives Considered

### Alternative 1: Create `commands/README.md` At The Repository Root

- What: Add a new root `commands/` folder with a README.
- Why rejected: The audited repository does not have a root `commands/` folder; command implementations live under `cli/commands`. Creating a new top-level folder only for docs could confuse the architecture unless the user explicitly wants that.

### Alternative 2: Root README Only

- What: Expand only the root README.
- Why rejected: The user explicitly requested README files in `skills/` and the commands folder. GitHub renders folder READMEs directly, which is useful for content-surface goals.

### Alternative 3: List Every Skill In `skills/README.md`

- What: Generate or manually include a full table of every skill.
- Why rejected: The skill catalog is large and changes frequently. `skills-manifest.json` and the installer are better sources for exact membership; the README should explain structure, categories, and discovery.

### Alternative 4: Change CLI Help Or Installer Behavior While Updating Docs

- What: Add runtime help sections or new commands alongside README changes.
- Why rejected: The request is for README content. Runtime CLI behavior changes should be designed separately.

### Alternative 5: Submit To Awesome Lists In The Same Work

- What: Open external PRs to `awesome-mcp-servers`, `awesome-learning`, and `awesome-edtech`.
- Why rejected: External submissions need current repo policies, contribution guidelines, and separate PRs. The README work prepares the repository for those submissions.
