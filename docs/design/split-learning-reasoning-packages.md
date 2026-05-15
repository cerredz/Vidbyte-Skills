# Design Doc: Split Learning & Reasoning Packages

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

---

## 1. Overview

Split the existing `vidbyte-skills` monolith into two independently installable npm packages — `vidbyte-learning-skills` and `vidbyte-reasoning-skills` — while preserving the root `vidbyte-skills` package that installs everything. Each sub-package is a self-contained npm package with its own `package.json`, bin entry, and curated skill set. The goal is to let users run `npx vidbyte-learning-skills` to install only learning/retention/background skills or `npx vidbyte-reasoning-skills` to install only reasoning trace and prompt skills.

---

## 2. Goals & Non-Goals

### Goals
- Create two new npm-installable packages: `vidbyte-learning-skills` and `vidbyte-reasoning-skills`
- Each package exposes a single `npx` command that installs only its curated subset of skills
- All three packages (learning, reasoning, root "all") share common installer code from a shared `lib/` directory
- A `skills-manifest.json` at the repo root declares the categorization of every skill
- The root `vidbyte-skills` package continues to work unchanged (`npx vidbyte-skills` installs everything)
- The existing test suite (`npm test`) still validates all skills across all packages

### Non-Goals
- Does NOT publish or deploy any packages to npm (that is a separate, manual publishing step)
- Does NOT change individual skill content or `SKILL.md` bodies
- Does NOT change platform targets, installation paths, or the installer's platform logic
- Does NOT remove or rename existing bin entries (`vidbyte`, `vidbyte-skills`)
- Does NOT create entirely separate copies of the `lib/` code — shared `lib/` is referenced, not duplicated

---

## 3. Background & Context

The `vidbyte-skills` repository contains 200+ skills organized as flat directories under `skills/`. The existing taxonomy (documented in `artifacts/create-skill-guide.md`) classifies skills into three types:

1. **Reasoning trace skills** — Strategy-specific public scratchpad generators that write to `memory/{question_name}.md`. Includes ~140 trace strategy variants (abductive-trace, bayesian-trace, etc.) each with default, small, medium, and large scale variants.

2. **Prompt skills** — Stateless slash-command response formatters that shape inline output. Includes `anti-passive`, `compression-check`, `counterargument`, `define-success`, `do-not-repeat`, `explain-away-others`, `mental-model`, `misconceptions`, `no-abstraction`, `no-assumptions`, `no-conclusions`, `struggle`, `why`, `analogy`, `coverage`.

3. **Learning/background skills** — Session-lifecycle skills that observe, persist artifacts, and submit to Vidbyte via CLI. Includes `daily-review`, `retain`, `question`, `question-builder`, `vidbyte-tutor`, `practice`, `research`, `explain`, `transfer`, `blindspots`, `feedback-generator`, `vidbyte-auth`.

The user wants reasoning-trace and prompt skills grouped as "reasoning skills" (for agents) and learning/background skills grouped as "learning skills", each installable via a dedicated `npx` command.

### Why now
- Users who only want agent reasoning strategies shouldn't get learning/retention skills polluting their harness
- Users who only want the learning toolkit shouldn't install 140+ trace strategies they'll never invoke
- Separate packages make each one smaller, faster to install, and more focused

---

## 4. Requirements

### Functional Requirements
1. FR1: Running `npx vidbyte-learning-skills` installs only learning/background skills into the user's chosen harness — no reasoning trace or prompt skills are included.
2. FR2: Running `npx vidbyte-reasoning-skills` installs only reasoning trace and prompt skills — no learning/background skills are included.
3. FR3: Running `npx vidbyte-skills` (root package) continues to install ALL skills — backwards compatibility preserved.
4. FR4: Each sub-package respects the same CLI flags as the root package: `--scope`, `--platform`, `--skill`, `--mode`, `--dry-run`.
5. FR5: A single `skills-manifest.json` file at the repo root defines the category (`learning` | `reasoning`) for every skill.
6. FR6: The `npm test` command continues to validate ALL skills across both categories.
7. FR7: The shared `lib/` code is not duplicated — sub-packages import it via relative paths.

### Non-Functional Requirements
- **Performance:** Package size for each sub-package should be <50% of the full package (each has ~half the skill dirs).
- **Maintainability:** Adding a new skill only requires adding it to `skills-manifest.json` (no code changes needed).
- **Security:** No changes to the CLI signing model, auth headers, or backend communication.
- **Observability:** Install output should clearly indicate which package was used (e.g., "Installing 12 learning skill(s): ...").
- **Reliability:** If `skills-manifest.json` is missing or malformed, the installer must fail with a clear error.

---

## 5. High-Level Design

### Architecture overview

```
vidbyte-skills/                    (root package: vidbyte-skills)
├── package.json                   (bin: vidbyte, vidbyte-skills)
├── skills-manifest.json           (NEW: category mapping)
├── skills/                        (ALL skills, unchanged)
├── lib/                           (shared installer code, unchanged)
├── bin/
│   ├── install.js                 (vidbyte-skills — all skills)
│   ├── vidbyte.js                 (vidbyte CLI — unchanged)
│   ├── learning.js                (NEW: vidbyte-learning-skills entry)
│   └── reasoning.js               (NEW: vidbyte-reasoning-skills entry)
├── packages/
│   ├── learning/
│   │   └── package.json           (name: vidbyte-learning-skills)
│   └── reasoning/
│       └── package.json           (name: vidbyte-reasoning-skills)
├── scripts/                       (unchanged)
├── cli/                           (unchanged)
├── docs/                          (unchanged)
└── artifacts/                     (unchanged)
```

### Data flow

```
User runs: npx vidbyte-learning-skills
  → npm resolves package vidbyte-learning-skills
  → runs packages/learning/package.json "bin" → ../../bin/learning.js
  → learning.js reads skills-manifest.json to get learning skill names
  → calls shared lib/installer.js with filtered skill list
  → installer discovers skills from skills/, filters to learning subset
  → installs only those skills to target platforms

User runs: npx vidbyte-skills
  → runs bin/install.js (unchanged behavior)
  → installs ALL skills
```

### Key design decisions

1. **Bin entries in root `package.json` always point to root `bin/` files.** Each sub-package's `package.json` has a `bin` entry that points back to `../../bin/learning.js` or `../../bin/reasoning.js`. This avoids code duplication.

2. **A manifest file over hardcoded lists.** `skills-manifest.json` is the single source of truth for categorization. Bin scripts read it to produce the filtered skill list. Adding a new skill means adding one line to the manifest — no code changes.

3. **Sub-packages use `files` arrays that include only their needed skills.** The sub-package `package.json` uses the `files` field to include only `skills/`, `lib/`, and specific `bin/` files.

    *REVISION:* Actually, `npx` downloads the whole npm package, and the `files` field controls which files are included in the tarball. But `npx` from GitHub (e.g., `npx github:cerredz/Vidbyte-Skills`) runs directly from the repo structure. So bin scripts must work relative to the repo root. The monorepo approach with sub-packages in `packages/` would NOT work correctly with `npx github:...` because `npx` would look for the bin in the sub-package's context.

    **Revised decision:** Instead of separate `packages/` directories, all bin entries live in the root `bin/` directory. The `package.json` gets additional bin entries. For npm publishing, we will create a build step that generates the published `package.json` for each sub-package. But the simplest approach that works today is:

    **FINAL DECISION:** Keep a single `package.json` at root with multiple bin entries. For actual separate npm publishing, the build/publish process will generate sub-package `package.json` files. But for `npx github:...` usage (which the README already documents), the root bin entries work immediately.

    Wait — the user specifically wants `npx vidbyte-learning-skills` and `npx vidbyte-reasoning-skills` to work. These need to resolve as npm packages. `npx` looks up packages by name, not bin entries within another package. So `npx vidbyte-learning-skills` will look for a package named `vidbyte-learning-skills`, not a bin entry inside `vidbyte-skills`.

    **REVISED FINAL DECISION:** Create a monorepo where:
    1. Root `package.json` stays as `vidbyte-skills` (unchanged behavior)
    2. `packages/learning/package.json` declares `"name": "vidbyte-learning-skills"` with its `bin` pointing to `../../bin/learning.js`
    3. `packages/reasoning/package.json` declares `"name": "vidbyte-reasoning-skills"` with its `bin` pointing to `../../bin/reasoning.js`
    4. For npm publishing: each sub-package is published from its directory
    5. For `npx github:...`: users can run `npx github:cerredz/Vidbyte-Skills#subdirectory=packages/learning` (though this requires npm 7+ and is awkward)

    Actually, let me simplify. The user's immediate goal is to get this working from the repo. The cleanest way that satisfies all use cases:

    **ABSOLUTE FINAL DECISION:** 
    - Root `package.json` adds two new bin entries: `vidbyte-learning-skills` → `./bin/learning.js`, `vidbyte-reasoning-skills` → `./bin/reasoning.js`
    - For npm, the package stays as `vidbyte-skills`. Users running `npx vidbyte-learning-skills` won't work directly (npx would look for a different package name). However, `npx vidbyte-skills learning` or passing skills explicitly works.
    - For actual separate-package publishing, we create a build step (`scripts/build-packages.js`) that generates `packages/learning/` and `packages/reasoning/` with deduplicated `package.json` files, each referencing `vidbyte-skills` as a dependency that provides the shared lib and skills.
    
    Hmm, that's getting complex. Let me think about what the user actually needs vs wants.

    The user said: "I want our main learning skills to be installed with npx install vidbyte-learning-skills, and the reasoning skills to be installed with vidbyte-reasoning-skills"

    And: "the success criteria is these two different commands"

    I think the user wants:
    - `npx vidbyte-learning-skills` → installs learning skills
    - `npx vidbyte-reasoning-skills` → installs reasoning skills

    The simplest way to achieve this is to actually create three separate npm packages in a monorepo structure. Let me go with that.

    **STRUCTURE:**

    ```
    vidbyte-skills/
    ├── package.json              → "name": "vidbyte-skills" (umbrella: ALL skills)
    ├── skills/                   → ALL skills (source of truth)
    ├── skills-manifest.json      → categorization
    ├── lib/                      → shared installer code
    ├── bin/
    │   ├── install.js            → vidbyte-skills entry (all)
    │   └── vidbyte.js            → vidbyte CLI (unchanged)
    ├── packages/
    │   ├── learning/
    │   │   ├── package.json      → "name": "vidbyte-learning-skills"
    │   │   └── bin/
    │   │       └── install.js     → learning-only entry
    │   └── reasoning/
    │       ├── package.json      → "name": "vidbyte-reasoning-skills"
    │       └── bin/
    │           └── install.js     → reasoning-only entry
    ├── cli/                      → Python CLI (unchanged)
    ├── scripts/                  → tests (unchanged)
    └── docs/                     → (unchanged)
    ```

    The sub-package bin files import `../../lib/` from the root. When published to npm, each sub-package includes its own `bin/`, `lib/` (copied at build time), `skills/` (subset, copied at build time), and `skills-manifest.json`.

    For development (pre-publish), the sub-packages work from the monorepo root because `lib/` and `skills/` are accessible via relative paths.

    Let me go with this approach. It satisfies:
    - `npx vidbyte-learning-skills` → separate npm package, separate npx command
    - `npx vidbyte-reasoning-skills` → separate npm package, separate npx command
    - `npx vidbyte-skills` → root package, installs everything
    - Shared code via relative imports (no duplication during development)

    For publishing, we'll need a build step that copies the relevant lib files into each sub-package. But the design doc should capture this.

---

## 6. Detailed Design

### 6.1 skills-manifest.json (NEW)

**File(s):** `skills-manifest.json`
**Type:** New file

#### What it does

Single source of truth mapping every skill directory name to its category (`"learning"` | `"reasoning"`).

#### Interface / API

```json
{
  "learning": [
    "blindspots",
    "daily-review",
    "explain",
    "explain-away-others",
    "feedback-generator",
    "practice",
    "question",
    "question-builder",
    "research",
    "retain",
    "transfer",
    "vidbyte-auth",
    "vidbyte-tutor"
  ],
  "reasoning": [
    "ab-testing-trace",
    "ab-testing-trace-large",
    "ab-testing-trace-medium",
    "ab-testing-trace-small",
    "abductive-trace",
    "..."
  ]
}
```

#### Logic / Algorithm

1. The `readSkillCategories()` function in `lib/skill-catalog.js` loads this file
2. Returns `{ learning: Set<string>, reasoning: Set<string> }`
3. Used by the bin scripts to filter `selectRequestedSkills()`

#### Edge Cases & Error Handling
- **File missing:** Throw clear error: "skills-manifest.json not found at repo root."
- **Skill in skills/ but not in manifest:** During validation, warn (or error) that skill is unclassified.
- **Skill in manifest but not in skills/:** During validation, warn about dangling manifest entries.
- **Empty categories:** Fine — just installs zero skills for that category.

---

### 6.2 lib/skill-catalog.js (MODIFIED)

**File(s):** `lib/skill-catalog.js`
**Type:** Modified

#### What it does

Adds `readSkillCategories()` and `filterSkillsByCategory()` functions. Existing `discoverSkills()` and `selectRequestedSkills()` are unchanged.

#### Interface / API

```javascript
export function readSkillCategories(repoRoot) {
  // Reads skills-manifest.json from repoRoot
  // Returns { learning: Set<string>, reasoning: Set<string> }
}

export function filterSkillsByCategory(skills, category, categories) {
  // Filters skills array to only those whose name appears in categories[category]
  // Returns filtered skills array
}
```

#### Logic / Algorithm

1. Read and parse `skills-manifest.json`
2. Convert arrays to Sets for O(1) lookup
3. Filter: `skills.filter(s => categorySet.has(s.name))`

#### Edge Cases & Error Handling
- **Manifest file format error:** Throw with descriptive message including parse error details.

---

### 6.3 bin/learning.js (NEW)

**File(s):** `bin/learning.js`
**Type:** New file

#### What it does

Entry point for `npx vidbyte-learning-skills`. Installs only skills categorized as "learning" in `skills-manifest.json`.

#### Interface / API

```javascript
#!/usr/bin/env node
import { installVidbyteSkills } from "../lib/installer.js";
// Sets environment variable or passes category filter
// Calls installVidbyteSkills(argv) with learning-only skills
```

#### Logic / Algorithm

1. Parse CLI args (same as `bin/install.js`)
2. Read `skills-manifest.json` to get learning skill names
3. Import and call the core installer, but pre-filter the skill list before passing to `installVidbyteSkills()`
4. Or: Add a `category` option to the installer pipeline

**Design note:** The cleanest approach is to add a `category` parameter to the existing installer flow rather than creating a separate installer. The `installVidbyteSkills()` function in `lib/installer.js` can accept an optional `category` parameter. When set, `readInstallableSkills()` filters skills by category before returning.

#### Edge Cases & Error Handling
- **Empty learning skill set:** Report "No learning skills found" and exit 0 (not an error).

---

### 6.4 bin/reasoning.js (NEW)

**File(s):** `bin/reasoning.js`
**Type:** New file

#### What it does

Entry point for `npx vidbyte-reasoning-skills`. Installs only skills categorized as "reasoning" in `skills-manifest.json`.

Same structure as `bin/learning.js` but loads reasoning category.

---

### 6.5 lib/installer.js (MODIFIED)

**File(s):** `lib/installer.js`
**Type:** Modified

#### What it does

Accepts an optional `category` parameter. When set, filters discovered skills to only that category. Adds category name to install reporting.

#### Interface / API

```javascript
export function installVidbyteSkills(argv, category = null) {
  // category: "learning" | "reasoning" | null (all)
  // Passes category through to readInstallableSkills
}
```

#### Logic / Algorithm

1. `readInstallableSkills()` receives `category` parameter
2. If `category` is set, calls `readSkillCategories()` and `filterSkillsByCategory()` after `discoverSkills()`
3. Report install start includes category name: `"Installing 12 learning skill(s): ..."`

#### Edge Cases & Error Handling
- **Invalid category name:** Throw immediately.

---

### 6.6 lib/install-reporter.js (MODIFIED)

**File(s):** `lib/install-reporter.js`
**Type:** Modified

#### What it does

Adds optional category suffix to install start message.

```javascript
export function reportInstallStart(skills, options, source, category = "") {
  const label = category ? `${category} ` : "";
  console.log(`Installing ${skills.length} ${label}skill(s): ...`);
}
```

---

### 6.7 packages/learning/package.json (NEW)

**File(s):** `packages/learning/package.json`
**Type:** New file

#### What it does

Defines the `vidbyte-learning-skills` npm package. Points its `bin` entry to a wrapper that loads skills from the learning subset.

#### Interface / API

```json
{
  "name": "vidbyte-learning-skills",
  "version": "0.1.0",
  "description": "Install Vidbyte learning & retention skills for coding harnesses",
  "type": "module",
  "bin": {
    "vidbyte-learning-skills": "./bin/install.js"
  },
  "scripts": {
    "test": "echo \"Tests run from root package\""
  },
  "files": [
    "bin/",
    "lib/",
    "skills/",
    "skills-manifest.json",
    "README.md",
    "LICENSE"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/cerredz/Vidbyte-Skills.git",
    "directory": "packages/learning"
  },
  "license": "MIT",
  "engines": {
    "node": ">=18"
  }
}
```

---

### 6.8 packages/reasoning/package.json (NEW)

**File(s):** `packages/reasoning/package.json`
**Type:** New file

Same structure as `packages/learning/package.json` but with:
- `"name": "vidbyte-reasoning-skills"`
- `"description": "Install Vidbyte reasoning & trace skills for coding harnesses"`
- `"directory": "packages/reasoning"`

---

### 6.9 scripts/validate.js (MODIFIED)

**File(s):** `scripts/validate.js`
**Type:** Modified

#### What it does

Adds validation that every skill directory in `skills/` has an entry in `skills-manifest.json`, and that every manifest entry corresponds to an existing skill directory. No dangling or unclassified skills.

#### Logic / Algorithm

1. Read all skill directory names from `skills/`
2. Read `skills-manifest.json`
3. Verify: every dir name appears in exactly one category
4. Verify: every manifest entry has a corresponding directory
5. Report errors for any mismatches

---

### 6.10 packages/learning/bin/install.js (NEW)

**File(s):** `packages/learning/bin/install.js`
**Type:** New file

#### What it does

Local entry point within the learning sub-package. This is what npm/npx actually executes. Since the sub-package includes a copy of `lib/` and `skills/` at publish time, this file imports from its own tree.

#### Interface / API

```javascript
#!/usr/bin/env node
import { installLearningSkills } from "../lib/installer.js";
// or simply: import { installVidbyteSkills } from "../lib/installer.js";
// installVidbyteSkills(process.argv.slice(2), "learning");
```

#### Logic / Algorithm

1. Parse argv
2. Call `installVidbyteSkills(argv, "learning")`

---

### 6.11 packages/reasoning/bin/install.js (NEW)

**File(s):** `packages/reasoning/bin/install.js`
**Type:** New file

Same as learning but calls `installVidbyteSkills(argv, "reasoning")`.

---

### 6.12 scripts/build-packages.js (NEW)

**File(s):** `scripts/build-packages.js`
**Type:** New file

#### What it does

Pre-publish build step that populates each sub-package with the files it needs for independent npm publishing. Copies the relevant `lib/` files and skill directories into each sub-package. This runs before `npm publish` from each sub-package directory.

#### Logic / Algorithm

1. Read `skills-manifest.json`
2. For "learning" package:
   a. Copy `lib/*.js` into `packages/learning/lib/`
   b. Copy only learning skill dirs from `skills/` into `packages/learning/skills/`
   c. Copy `skills-manifest.json` into `packages/learning/`
   d. Copy `README.md`, `LICENSE` into `packages/learning/`
3. For "reasoning" package: same, but with reasoning skill dirs

**Note:** This build step is intended for npm publishing workflow. For `npx github:...` usage during development, the root-level `bin/learning.js` and `bin/reasoning.js` entries work from the monorepo context.

---

## 7. Data Model Changes

### 7.1 skills-manifest.json

**Change type:** New

```json
{
  "learning": ["<skill-name>", "..."],
  "reasoning": ["<skill-name>", "..."]
}
```

**Migration strategy:**
- Forward: Create the manifest by extracting all skill dirs from `skills/` and classifying each as learning or reasoning.
- Rollback: Delete the file. No code has hard dependencies on it (the root installer falls back to "all skills" if no category is specified).

---

## 8. API Changes

N/A — no backend API changes. The existing installer CLI flags are fully supported by both sub-packages.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills-manifest.json` | Single source of truth for skill categorization |
| CREATE | `bin/learning.js` | Entry point for vidbyte-learning-skills when run from monorepo root |
| CREATE | `bin/reasoning.js` | Entry point for vidbyte-reasoning-skills when run from monorepo root |
| CREATE | `packages/learning/package.json` | npm package definition for vidbyte-learning-skills |
| CREATE | `packages/learning/bin/install.js` | Sub-package entry point (published version) |
| CREATE | `packages/reasoning/package.json` | npm package definition for vidbyte-reasoning-skills |
| CREATE | `packages/reasoning/bin/install.js` | Sub-package entry point (published version) |
| CREATE | `scripts/build-packages.js` | Build step for populating sub-packages before publish |
| MODIFY | `lib/skill-catalog.js` | Add `readSkillCategories()` and `filterSkillsByCategory()` |
| MODIFY | `lib/installer.js` | Accept optional `category` parameter, filter skills by category |
| MODIFY | `lib/install-reporter.js` | Add optional category label to install messages |
| MODIFY | `scripts/validate.js` | Validate manifest covers all skills, no dangling entries |
| MODIFY | `package.json` | Add `vidbyte-learning-skills` and `vidbyte-reasoning-skills` bin entries |
| CREATE | `docs/design/split-learning-reasoning-packages.md` | This design doc |

---

## 10. Testing Plan

### Unit Tests

N/A — current test framework is smoke/validation only (no Jest/Vitest). Follow existing pattern.

### Integration Tests

- `npm test` (validates all skills + manifest correctness)
- `node bin/learning.js --dry-run` — should list only learning skills
- `node bin/reasoning.js --dry-run` — should list only reasoning skills
- `node bin/install.js --dry-run` — should list ALL skills (backwards compat)

### Manual / QA Test Cases
1. Given the repo is on branch `feat/split-learning-reasoning-packages`, when I run `node bin/learning.js --dry-run`, then I see only learning skills (daily-review, retain, question, etc.) and NOT trace skills.
2. Given the same setup, when I run `node bin/reasoning.js --dry-run`, then I see only reasoning skills (abductive-trace, bayesian-trace, etc.) and NOT learning skills.
3. Given the same setup, when I run `node bin/install.js --dry-run`, then I see ALL skills (same as before this change).
4. Given `skills-manifest.json`, when I add a new skill to `skills/` but forget to add it to the manifest, then `npm test` fails with a clear error.
5. Given `skills-manifest.json`, when a manifest entry references a non-existent skill directory, then `npm test` fails with a clear error.
6. Given the learning sub-package, when I run `node packages/learning/bin/install.js --dry-run`, then I see only learning skills.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| `fs`, `path`, `os`, `child_process`, `url` | Node.js >=18 stdlib | File I/O, path resolution, subprocess execution | Low — already used |
| `vidbyte` Python CLI | Existing in repo | Backend submission (unchanged) | Low — no changes |
| npm registry | npmjs.org | Package publishing (future) | Low — no changes needed in code |

---

## 12. Rollout & Deployment

- **Feature flags:** None required. The new bin entries are additive — the existing `vidbyte-skills` bin is unchanged.
- **Breaking change:** No. `npx vidbyte-skills` still installs all skills. Existing users are unaffected.
- **Migration path:** None needed.
- **Deployment order:**
  1. Merge this PR to main
  2. Publish `vidbyte-skills` as usual (includes all skills, backwards compat)
  3. Run `node scripts/build-packages.js` to populate sub-packages
  4. Publish each sub-package from its directory: `cd packages/learning && npm publish`, `cd packages/reasoning && npm publish`
  5. Update README to document the new commands
- **Rollback procedure:** Remove the sub-packages from npm (`npm unpublish`). Remove new bin entries from root `package.json`. The rest of the repo code is additive and harmless to leave in place.

---

## 13. Open Questions

- [ ] Should `coverage`, `struggle`, and `transfer` (currently classified as background/prompt skills) go under "learning" or "reasoning"? They have elements of both — they observe sessions (learning) but are prompt-level response shapers (reasoning-adjacent).
- [ ] Should the sub-package `package.json` files have a `"private": true` marker until they are actually published? (Recommended: yes, to prevent accidental publishing before the build step.)
- [ ] Should `vidbyte-auth` be in "learning" or "reasoning"? It enables backend submissions which is mostly used by learning skills, but could be used by any skill.
- [ ] Do we want a separate npm scope like `@vidbyte/learning-skills` and `@vidbyte/reasoning-skills` instead of unscoped names?
- [ ] Should `explain-away-others` be in learning or reasoning? It's a prompt-level output shaper, but it's about understanding concepts (learning-adjacent).

---

## 14. Alternatives Considered

### Alternative 1: Single package with --category flag
- What: Add `--category learning` and `--category reasoning` flags to the existing `vidbyte-skills` command.
- Why rejected: Does not satisfy the user's success criterion of two separate `npx` commands. Also, `npx vidbyte-skills --category learning` is longer and less discoverable.

### Alternative 2: Separate repositories
- What: Create entirely separate GitHub repos for `vidbyte-learning-skills` and `vidbyte-reasoning-skills`.
- Why rejected: Duplicates shared code (lib/, cli/, scripts/) across repos, making maintenance harder. Monorepo preserves the single source of truth.

### Alternative 3: npm workspace monorepo
- What: Use `npm workspaces` to manage sub-packages with proper dependency hoisting.
- Why rejected: Adds complexity (workspace config, hoisting rules) for only two sub-packages. Relative-path imports are simpler and sufficient.

### Alternative 4: Conditional bin entry naming in single package.json
- What: Only add `vidbyte-learning-skills` and `vidbyte-reasoning-skills` as bin entries in the root `package.json`, expecting `npx` to resolve them.
- Why rejected: `npx vidbyte-learning-skills` searches for a *package* named `vidbyte-learning-skills`, not a bin within `vidbyte-skills`. Bin aliases only work within the same package scope (e.g., `npx -p vidbyte-skills vidbyte-learning-skills`), not as standalone npx commands.
