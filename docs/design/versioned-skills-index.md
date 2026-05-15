# Design Doc: Versioned Skills Index

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

---

## 1. Overview

Introduce a central versioned skills manifest (`lib/skill-versions.js`) that maps product versions (1, 2, 3, ...) to the set of skills included in each version. The installer is updated to respect a `--version <n|all>` CLI flag (default: `1`) so that when an end user runs `npx vidbyte-skills`, they receive only the V1 offering — not every skill in the repository. The manifest also serves as the single source of truth for what constitutes each version of the Vidbyte product.

---

## 2. Goals & Non-Goals

### Goals
- Create a central indexed dictionary (`lib/skill-versions.js`) mapping version numbers to skill name arrays
- Define version 1 as: `anti-passive`, `no-assumptions`, `question`, `explain-away-others`, `mental-model`
- Modify the installer so the default install target is version 1 (not "all skills in repo")
- Add `--version <n|all>` CLI flag to let users choose a specific version or install everything
- When the user explicitly names skills on the command line, those take precedence over version filtering
- All existing tests continue to pass; new validation confirms version manifest integrity
- Follow all existing code conventions (ESM, camelCase, functional style, no external dependencies)

### Non-Goals
- Creating the SKILL.md files for `no-assumptions` and `explain-away-others` (done in a separate PR)
- Changing how skills are discovered from disk (discovery remains file-system-based)
- Modifying validation beyond what is needed to check the version manifest
- Changing the Python CLI (`cli/`) — no backend version tracking
- Adding version metadata to individual SKILL.md frontmatter
- Version-based conditional behavior within skills themselves

---

## 3. Background & Context

### Why this is being built now

The repository currently contains 500+ skills — mostly reasoning trace variants — but the actual Vidbyte product offering for end users is a curated subset. Currently, `npx vidbyte-skills` installs everything indiscriminately, flooding the user's harness with hundreds of trace skills they didn't ask for. This degrades the first-run experience and makes the product feel unfocused.

### What problem it solves

- **Noise reduction**: Users get the 5 curated V1 skills, not 500+ trace variants
- **Versioned product**: As V2, V3, etc. are defined, they have a place to live in code
- **Single source of truth**: The manifest is the canonical definition of what each version contains — no guessing, no implicit conventions
- **Future-proofing**: When new skills are added to `skills/`, they don't pollute the default install until explicitly added to a version

### Current state

The installer (`lib/installer.js`) calls `discoverSkills()` from `lib/skill-catalog.js`, which scans the entire `skills/` directory for valid SKILL.md files. There is no filtering beyond the `--skill` flag. The `question` design doc describes the "Vidbyte learning skills" taxonomy but no versioning mechanism exists in code.

### Constraints

- Must not break existing smoke tests (`npm test`)
- Must be backward-compatible for anyone passing `--skill` explicitly
- Must follow the existing architectural pattern of pure JS modules with no external dependencies

---

## 4. Requirements

### Functional Requirements

1. The repo SHALL contain a `lib/skill-versions.js` file exporting a `SKILL_VERSIONS` object mapping version strings to arrays of skill names.
2. `SKILL_VERSIONS["1"]` SHALL equal `["anti-passive", "no-assumptions", "question", "explain-away-others", "mental-model"]`.
3. The `--version` CLI flag SHALL accept an integer version number (e.g., `1`, `2`) or the literal `"all"`.
4. When `--version` is not specified, the installer SHALL default to version `"1"`.
5. When `--version all` is specified, all discovered skills SHALL be installed (current behavior).
6. When `--version <n>` is specified and the version exists in the manifest, only the skills listed for that version SHALL be installed.
7. When `--version <n>` is specified and the version does NOT exist in the manifest, the installer SHALL error with a message listing available versions.
8. When the user explicitly passes skill names as positional args or via `--skill`, those explicit names SHALL override the version filter (i.e., the explicitly named skills are installed regardless of version membership).
9. The version manifest SHALL be validated during `npm run validate` — every skill name referenced in the manifest must correspond to a valid `skills/<name>/SKILL.md` file.
10. The `--version` flag and its value SHALL be reported in the install start log line (e.g., `Installing 5 skill(s) from version 1: ...`).

### Non-Functional Requirements

- **Performance**: The version filter is an O(n) array filter over already-discovered skills. Zero measurable overhead.
- **Scalability**: Adding a new version is a single-line addition to the manifest object.
- **Security**: No new attack surface. The manifest is a JS object in source; versions are string-integer validated.
- **Observability**: The install reporter already logs which skills are being installed. The version label makes it explicit.
- **Reliability**: If a skill listed in the manifest is missing from disk, validation fails early (during `npm run validate`) rather than silently skipping at install time.

---

## 5. High-Level Design

A new module `lib/skill-versions.js` exports the central version manifest. The installer imports this module and uses it to filter the set of discovered skills before proceeding to install targets.

The CLI options parser (`lib/cli-options.js`) is extended with a `--version` reader. The parsed version value flows into `installVidbyteSkills`, which passes it to `selectRequestedSkills` (in `lib/skill-catalog.js`), where version filtering is applied after explicit-skill-name selection.

**Data flow:**

```
User runs: npx vidbyte-skills
                    |
                    v
          [cli-options.js]
          Parses argv, extracts --version (default "1")
                    |
                    v
          [installer.js]
          readInstallableSkills(skillsRoot, skillNames, version)
                    |
                    v
          [skill-catalog.js]
          1. discoverSkills(skillsRoot)         → all skills on disk
          2. filterByVersion(skills, version)   → narrow to version set
          3. selectRequestedSkills(skills, names) → if explicit names given, use those
                    |
                    v
          [installer.js]
          Installs filtered skills into targets
```

**Key design decisions:**

1. **Default to V1, not "all"**: This is a product decision. End users install Vidbyte for the curated learning skills. Power users and developers who want everything can use `--version all`. The default reflects the product, not the repository contents.

2. **Explicit names override version**: If the user types `npx vidbyte-skills --version 1 some-trace-skill`, they get `some-trace-skill` installed. Explicit intent wins. This avoids a confusing situation where the user explicitly names a skill and it's silently excluded.

3. **Manifest as JS, not JSON**: Following the repo's convention (everything is ESM `.js`), the manifest is a JavaScript module. It exports the data object and a helper function `getSkillsForVersion(version)` that handles the "all" case and the lookup.

4. **Validation catches manifest/drift**: If a skill is removed from disk but still referenced in the manifest, `npm run validate` catches it. This prevents stale version references from reaching users.

5. **Version is a string, not a number**: `"1"`, `"2"`, `"all"` — this keeps the manifest keys simple and avoids YAML/JSON type confusion when the CLI passes `--version 1` (which arrives as the string `"1"`).

---

## 6. Detailed Design

### 6.1 `lib/skill-versions.js` — Version Manifest

**File(s):** `lib/skill-versions.js`
**Type:** New file

#### What it does
The single source of truth for which skills belong to which product version. Exports the manifest object and a lookup helper.

#### Interface / API

```javascript
export const SKILL_VERSIONS = {
  "1": [
    "anti-passive",
    "no-assumptions",
    "question",
    "explain-away-others",
    "mental-model"
  ],
  "2": [
    // Future: V2 skills will be defined here
  ],
  "3": [
    // Future: V3 skills will be defined here
  ]
};

export function getSkillsForVersion(version, allSkills) {
  if (version === "all") {
    return allSkills;
  }

  const versionSkills = SKILL_VERSIONS[version];

  if (!versionSkills) {
    const available = Object.keys(SKILL_VERSIONS).join(", ");
    throw new Error(`Unknown version "${version}". Available versions: ${available}, or "all".`);
  }

  const skillNameSet = new Set(versionSkills);
  return allSkills.filter((skill) => skillNameSet.has(skill.name));
}
```

#### Logic / Algorithm

1. Receives a version string (`"1"`, `"2"`, `"all"`) and the full set of discovered skills.
2. If `version === "all"`, returns the full set unchanged (backward-compatible behavior).
3. Looks up the version in `SKILL_VERSIONS`.
4. If not found, throws an error listing available versions.
5. Builds a `Set` from the version's skill name list for O(1) lookup.
6. Filters the discovered skills to only those whose `name` is in the set.
7. Returns the filtered array.

#### Edge Cases & Error Handling

- **Version not in manifest**: Throws a descriptive error with available versions.
- **Skill in manifest doesn't exist on disk**: Filter will silently exclude it (skill not in `allSkills`). Validation during `npm run validate` ensures this doesn't ship.
- **Empty version array** (e.g., `"2": []`): Returns an empty skill list. The installer reports "No installable skills found" which is correct.

---

### 6.2 `lib/cli-options.js` — Add `--version` Flag

**File(s):** `lib/cli-options.js`
**Type:** Modified

#### What it does
Adds a `--version` option reader to the existing CLI argument parser. Updates defaults and the usage text.

#### Changes

**Default options** — add `version` field:
```javascript
function defaultOptions(platformIds) {
  return {
    dryRun: false,
    mode: "copy",
    platforms: [...platformIds],
    scope: "user",
    skillNames: [],
    version: "1"          // NEW: default to V1
  };
}
```

**Option readers** — add `--version` reader:
```javascript
function optionReaders(platformIds) {
  return [
    // ... existing readers ...
    optionReader("--version", (value, options) => { options.version = value; }),
    optionReader("--scope",    (value, options) => { options.scope = value; }),
    optionReader("--mode",     (value, options) => { options.mode = value; }),
    optionReader("--platform", (value, options) => { options.platforms = parsePlatforms(value, platformIds); }),
    optionReader("--skill",    (value, options) => { options.skillNames.push(...parseSkillNames(value)); })
  ];
}
```

**Validation** — add version validation:
```javascript
function validateInstallOptions(options) {
  // ... existing scope and mode validation ...

  // Validate version
  if (!/^\d+$/.test(options.version) && options.version !== "all") {
    throw new Error(`Invalid --version "${options.version}". Use a version number (e.g., '1', '2') or 'all'.`);
  }
}
```

**Usage text** — add `--version` line:
```
--version <1|2|all>              Skills version to install. Default: 1
```

#### Edge Cases & Error Handling

- `--version abc` → validation throws `Invalid --version "abc". Use a version number (e.g., '1', '2') or 'all'.`
- `--version=2` (equals form) → parsed correctly by existing `optionReader` logic
- `--version` with no value → existing `readValue` logic throws `Missing value for --version.`

---

### 6.3 `lib/skill-catalog.js` — Version Filtering

**File(s):** `lib/skill-catalog.js`
**Type:** Modified

#### What it does
The existing `selectRequestedSkills` function gains version-awareness. When explicit skill names are provided, they take precedence. Otherwise, version filtering is applied.

#### Changes

**New export** — `filterByVersion`:
```javascript
import { getSkillsForVersion } from "./skill-versions.js";

export function filterByVersion(skills, version) {
  return getSkillsForVersion(version, skills);
}
```

**Modified export** — `selectRequestedSkills` signature unchanged (still accepts `skills` and `skillNames`). The version filtering happens separately in the installer before `selectRequestedSkills` is called, keeping this function's responsibility narrow.

#### Logic / Algorithm

No changes to existing `selectRequestedSkills` logic. The version filter is applied upstream in the installer (see 6.4).

---

### 6.4 `lib/installer.js` — Integrate Version Filter

**File(s):** `lib/installer.js`
**Type:** Modified

#### What it does
The `readInstallableSkills` function now accepts and applies the version parameter. When explicit skill names are given via `--skill` or positional args, version filtering is skipped (explicit intent wins).

#### Changes

**Modified function** — `readInstallableSkills`:
```javascript
import { filterByVersion } from "./skill-catalog.js";

function readInstallableSkills(skillsRoot, skillNames, version) {
  const allSkills = discoverSkills(skillsRoot);

  if (skillNames.length > 0) {
    // Explicit skill names: user knows what they want, skip version filtering
    return selectRequestedSkills(allSkills, skillNames);
  }

  // No explicit names: apply version filter, then return all matching
  return filterByVersion(allSkills, version);
}
```

**Modified call site** in `installVidbyteSkills`:
```javascript
export function installVidbyteSkills(argv) {
  const environment = readInstallEnvironment();
  const options = parseArgs(argv, PLATFORM_IDS);
  const skills = readInstallableSkills(
    environment.skillsRoot,
    options.skillNames,
    options.version       // NEW: pass version to the filter
  );
  // ... rest unchanged
}
```

**Updated report** — `reportInstallStart` receives the version for logging:
```javascript
// In installSkillsIntoRequestedTargets:
reportInstallStart(skills, options, environment.skillsRoot);
// The reportInstallStart function is updated to include version in output
```

#### Edge Cases & Error Handling

- **Explicit skill names + version**: The version is ignored. User's explicit names are installed. This is intentional — explicit names are more specific than version.
- **Version has no matching skills on disk**: `filterByVersion` returns an empty array. `installVidbyteSkills` reports "No installable skills found" via `reportEmptySkillSource`. This is correct behavior — the skills in the manifest don't exist yet on disk.
- **Version "all"**: Returns all discovered skills. Preserves backward compatibility for power users.

---

### 6.5 `lib/install-reporter.js` — Version in Output

**File(s):** `lib/install-reporter.js`
**Type:** Modified

#### What it does
The install start message includes the version being installed so the user knows what they're getting.

#### Changes

```javascript
export function reportInstallStart(skills, options, source) {
  const action = options.dryRun ? "Planning" : "Installing";
  const skillNames = skills.map((skill) => skill.name).join(", ");
  const versionLabel = options.version === "all" ? "all skills" : `version ${options.version}`;

  console.log(`${action} ${skills.length} skill(s) from ${versionLabel}: ${skillNames}`);
  console.log(`Mode: ${options.mode}; scope: ${options.scope}; source: ${source}`);
}
```

---

### 6.6 `scripts/validate.js` — Validate Version Manifest

**File(s):** `scripts/validate.js`
**Type:** Modified

#### What it does
Adds a new validation step that ensures every skill name in `SKILL_VERSIONS` corresponds to a valid `skills/<name>/SKILL.md` file. Catches manifest drift (e.g., a skill removed from disk but still referenced in a version).

#### Changes

Add after the existing skill validation loop:

```javascript
function validateVersionManifest(errors) {
  const versionPath = path.join(REPO_ROOT, "lib", "skill-versions.js");
  if (!fs.existsSync(versionPath)) {
    errors.push("Missing lib/skill-versions.js.");
    return;
  }

  // Dynamic import for ESM
  import(versionPath).then(({ SKILL_VERSIONS }) => {
    for (const [version, skillNames] of Object.entries(SKILL_VERSIONS)) {
      if (!/^\d+$/.test(version)) {
        errors.push(`lib/skill-versions.js: version key "${version}" must be a numeric string.`);
        continue;
      }
      for (const name of skillNames) {
        const skillFile = path.join(SKILLS_DIR, name, "SKILL.md");
        if (!fs.existsSync(skillFile)) {
          errors.push(`lib/skill-versions.js: version ${version} references "${name}" but skills/${name}/SKILL.md does not exist.`);
        }
      }
    }
  }).catch((error) => {
    errors.push(`lib/skill-versions.js: failed to load — ${error.message}`);
  });
}
```

Wait — dynamic `import()` returns a promise. The validation script is synchronous. This needs to be handled differently. See below.

**Revised approach**: Since `validate.js` runs synchronously and the manifest is a JS file, use `fs.readFileSync` + `new Function` or a static analysis approach. Better yet: make the manifest a JSON file so it can be `require`d or `readFileSync` + `JSON.parse`.

**Alternative**: Keep `skill-versions.js` as a JS module but add a companion `skill-versions.json` that is the canonical data file, with the JS module re-exporting from JSON. This is cleaner.

**Final decision**: The manifest lives as `lib/skill-versions.json` (pure data, validatable without dynamic import). `lib/skill-versions.js` imports it and exports the helper function. This keeps data separate from logic and makes validation trivial.

Wait — this repo is ESM-only. `import` of JSON requires an import assertion in some Node versions. Let me check...

In Node 18+, `import data from "./file.json" assert { type: "json" }` is available. But Node 18 has it behind a flag in some versions.

Simpler approach: Make the JSON file, use `fs.readFileSync` + `JSON.parse` in the JS module. No import assertions needed. This is the most portable approach.

Actually, even simpler: just put the data directly in `lib/skill-versions.js` as an exported object. For validation, use the static `import` (`import { SKILL_VERSIONS } from ...`). Since `validate.js` is a Node script with top-level await support in ESM, we could use dynamic import.

Wait, `validate.js` doesn't use top-level await. Let me look at it again... It calls `main()` at the end. It's synchronous.

The cleanest solution: make the version data a JSON file. The `skill-versions.js` module reads and parses it. The validation script also reads and parses it. Both use `fs.readFileSync` + `JSON.parse`. Zero dynamic import complexity.

Let me revise the design:

**File `lib/skill-versions.json`:**
```json
{
  "1": ["anti-passive", "no-assumptions", "question", "explain-away-others", "mental-model"],
  "2": [],
  "3": []
}
```

**File `lib/skill-versions.js`:**
```javascript
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(dirname, "skill-versions.json"), "utf8"));

export const SKILL_VERSIONS = manifest;

export function getSkillsForVersion(version, allSkills) {
  if (version === "all") {
    return allSkills;
  }
  const versionSkills = SKILL_VERSIONS[version];
  if (!versionSkills) {
    const available = Object.keys(SKILL_VERSIONS).join(", ");
    throw new Error(`Unknown version "${version}". Available versions: ${available}, or "all".`);
  }
  const skillNameSet = new Set(versionSkills);
  return allSkills.filter((skill) => skillNameSet.has(skill.name));
}
```

This approach:
- `lib/skill-versions.json` — pure data, trivially validatable
- `lib/skill-versions.js` — imports JSON, exports helper
- Both `validate.js` and the runtime code can read the JSON without dynamic imports

---

### 6.7 `lib/installer.js` — Import Path Update

**File(s):** `lib/installer.js`
**Type:** Modified

Add import for the version filter:
```javascript
import { filterByVersion } from "./skill-catalog.js";
```
(`filterByVersion` is re-exported from `skill-catalog.js`, which imports from `skill-versions.js`)

---

## 7. Data Model Changes

### 7.1 `lib/skill-versions.json`

**Change type:** New

```json
{
  "1": ["anti-passive", "no-assumptions", "question", "explain-away-others", "mental-model"],
  "2": [],
  "3": []
}
```

**Migration strategy:**
- Forward: Create the file. No data migration needed.
- Rollback: Delete the file. Revert installer to pre-versioning behavior.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. This is a CLI-only change.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `lib/skill-versions.json` | Pure data: version-to-skills mapping |
| CREATE | `lib/skill-versions.js` | Module: exports manifest + `getSkillsForVersion` helper |
| CREATE | `docs/design/versioned-skills-index.md` | This design document |
| MODIFY | `lib/cli-options.js` | Add `--version` flag, validation, usage text |
| MODIFY | `lib/skill-catalog.js` | Add `filterByVersion` export |
| MODIFY | `lib/installer.js` | Apply version filter in `readInstallableSkills` |
| MODIFY | `lib/install-reporter.js` | Include version in install start log |
| MODIFY | `scripts/validate.js` | Validate manifest entries exist on disk |

**Total: 3 files created, 5 files modified, 0 files deleted.**

---

## 10. Testing Plan

### Unit Tests

N/A — This codebase has no unit test framework. The smoke tests serve as integration/validation tests.

### Integration / Validation Tests

- **`npm run validate`** must pass — validates:
  - `lib/skill-versions.json` exists and is valid JSON
  - Every skill name in the manifest has a corresponding `skills/<name>/SKILL.md` file
  - Existing validation checks continue to pass

- **`npm test`** must pass — the full test suite:
  - `scripts/validate.js` runs clean
  - `scripts/smoke-test.js` installs a fixture into temp dirs (should work unchanged)
  - `scripts/cli-smoke-test.js` CLI integration tests (may need `--version all` for fixture tests)

### Manual / QA Test Cases

1. **Default install (no flags)**:
   - Given: `npx vidbyte-skills` (or `node bin/install.js`)
   - Then: Installs only the 5 V1 skills (anti-passive, no-assumptions, question, explain-away-others, mental-model)
   - Then: Output says "Installing X skill(s) from version 1: ..."

2. **Explicit version 1**:
   - Given: `npx vidbyte-skills --version 1`
   - Then: Same as default — 5 V1 skills installed

3. **Version all**:
   - Given: `npx vidbyte-skills --version all`
   - Then: All discovered skills from `skills/` directory installed (current behavior)

4. **Invalid version**:
   - Given: `npx vidbyte-skills --version 99`
   - Then: Error message: `Unknown version "99". Available versions: 1, 2, 3, or "all".`

5. **Invalid version format**:
   - Given: `npx vidbyte-skills --version abc`
   - Then: Error message: `Invalid --version "abc". Use a version number (e.g., '1', '2') or 'all'.`

6. **Explicit skill names override version**:
   - Given: `npx vidbyte-skills --version 1 some-trace-skill`
   - Then: `some-trace-skill` is installed (even though it's not in V1)

7. **Explicit --skill flag overrides version**:
   - Given: `npx vidbyte-skills --version 1 --skill some-trace-skill,other-skill`
   - Then: `some-trace-skill` and `other-skill` are installed

8. **Version in dry-run mode**:
   - Given: `npx vidbyte-skills --version 1 --dry-run`
   - Then: Lists planned installs for 5 V1 skills, no files written

9. **Version with --help**:
   - Given: `npx vidbyte-skills --help`
   - Then: Help text includes `--version <1|2|all>` line

10. **npm test passes**:
    - Given: All changes committed
    - Then: `npm test` exits with code 0

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | Pure Node.js stdlib — no external dependencies | None |

---

## 12. Rollout & Deployment

- **Feature flags**: None. The `--version` flag is available immediately.
- **Breaking change**: Yes — the default install behavior changes from "all skills" to "V1 skills only". Users who previously ran `npx vidbyte-skills` and got all 500+ skills will now get 5. This is intentional and matches the product vision. Users who want all skills can use `--version all`.
- **Deployment order**: Single PR merge. No multi-service coordination.
- **Rollback procedure**: Revert the PR. The installer returns to "install all" behavior. No data migration needed.

---

## 13. Open Questions

- [ ] **Should the smoke tests use `--version all` to avoid breaking?** The existing `scripts/smoke-test.js` and `scripts/cli-smoke-test.js` may need updating to pass `--version all` since the default is now V1 and fixture skills won't be in the manifest.
- [ ] **Should version 2 and 3 have placeholder empty arrays or not be defined?** Having empty arrays for 2 and 3 signals that these versions are planned but not yet populated. This is cleaner than having them absent from the manifest.
- [ ] **Should there be a `VIDBYTE_DEFAULT_VERSION` env var?** For development convenience, an env var override of the default version could be useful. Not in scope for this design, but worth considering.
- [ ] **What happens when `no-assumptions` and `explain-away-others` SKILL.md files don't exist yet?** Validation will catch this and fail `npm run validate`. Those skill files must be created before this PR can merge (or the manifest must not reference them until they exist).

---

## 14. Alternatives Considered

### Alternative 1: Keep default as "all", make version opt-in

- What: Default stays as current behavior (install everything). Users opt into versioned installs with `--version 1`.
- Why rejected: The point of versioning is to curate the product offering. If the default is still "everything," the versioning adds complexity without solving the noise problem. The user explicitly stated V1 skills are what should be downloaded.

### Alternative 2: Version metadata in each SKILL.md frontmatter

- What: Add `version: 1` to each skill's YAML frontmatter. Filter by frontmatter field.
- Why rejected: Pollutes every skill file with version metadata. Requires modifying 500+ files. The central manifest is cleaner — one file defines what each version contains. Frontmatter versioning would also mean skills can appear in multiple versions without a clear source of truth.

### Alternative 3: Separate directories per version (`skills/v1/`, `skills/v2/`)

- What: Organize skills by version in subdirectories.
- Why rejected: Skills can appear in multiple versions (a V1 skill may continue in V2). Directory-based versioning forces duplication or symlinks. The manifest approach is non-destructive and keeps the flat `skills/` directory simple.

### Alternative 4: `package.json` versions field

- What: Put the version manifest in `package.json`.
- Why rejected: `package.json` is for npm metadata. Mixing product versioning into npm metadata violates separation of concerns. The manifest deserves its own file.

### Alternative 5: Skip validation of manifest entries

- What: Don't validate that manifest skills exist on disk. Let the installer silently skip missing ones.
- Why rejected: Silent skipping hides bugs. If a skill is removed from disk but the manifest isn't updated, the version silently drops a skill. Validation makes this a loud, fast failure.

---

END OF DESIGN DOC
