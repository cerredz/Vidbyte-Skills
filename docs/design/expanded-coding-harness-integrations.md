# Design Doc: Expanded Coding Harness Integrations

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-13
**Last Updated:** 2026-05-13

---

## 1. Overview

This feature expands the Vidbyte Skills installer from its current set of 11 supported harness targets to a broader set of popular coding-agent platforms and instruction-file formats. The installer will continue copying native `SKILL.md` folders where a harness supports Agent Skills, and will generate or update platform-specific rule files where the harness expects repository instructions rather than skill folders. The design emphasizes conservative writes: generated files may be overwritten, but shared root files such as `AGENTS.md`, `CONVENTIONS.md`, and `.github/copilot-instructions.md` will be updated through managed Vidbyte blocks so existing project guidance is preserved.

---

## 2. Goals & Non-Goals

### Goals

- Add at least 25 new selectable CLI platform IDs for popular coding harnesses and instruction formats not currently exposed by `--platform`.
- Install native `SKILL.md` directories for platforms with documented Agent Skills support, including GitHub Copilot, Warp, Factory Droid, Crush, and OpenClaw.
- Generate managed Markdown rule files for platforms that consume repository instruction files, including Aider, Augment, Kilo Code, Jules, Zed, Replit Agent, Devin, OpenHands, Qwen Code, Warp rules, and AGENTS.md-compatible agents.
- Prevent duplicate writes when several selected platforms resolve to the same physical file, especially `AGENTS.md`.
- Preserve existing user/project instruction files by inserting or replacing only a delimited Vidbyte-managed block.
- Update README and smoke tests so new platform IDs, paths, and install behavior are documented and verified.

### Non-Goals

- Installing third-party marketplace skills from external registries such as ClawHub, Awesome Copilot, Warp Oz Skills, or OpenRouter apps.
- Adding model provider configuration, OpenRouter API keys, MCP servers, or agent account authentication.
- Guaranteeing that every commercial cloud agent uses local files in all execution modes; this design only installs into documented local or repository-level discovery paths.
- Migrating existing user-authored `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or other instruction files into a single canonical file.
- Adding a YAML parser dependency solely for Aider configuration; any `.aider.conf.yml` handling must remain conservative and dependency-free unless a future design approves a parser.

---

## 3. Background & Context

The repository currently owns portable skills under `skills/<name>/SKILL.md` and installs them through `bin/install.js` and `lib/installer.js`. Platform path logic is centralized in `lib/platform-targets.js`. The current platform list is `claude-code`, `codex`, `gemini`, `opencode`, `cursor`, `hermes`, `universal`, `windsurf`, `cline`, `continue`, and `roo-code`.

The existing implementation supports two output styles:

- `skill-dir`: copy or symlink every selected skill directory into a platform skill root.
- `rule-file`: flatten selected skills into one generated Markdown document and write it to a platform rule path.

Research shows the coding-agent ecosystem has moved in two directions. First, Agent Skills are now documented by more platforms. GitHub Copilot documents `.github/skills/` and `~/.copilot/skills/`; Warp documents `.warp/skills/`, `~/.warp/skills/`, and several compatible skill directories; Factory documents `.factory/skills/<skill>/SKILL.md`; Crush documents `~/.config/crush/skills`, Windows local app data skill roots, and `.crush/skills`; OpenClaw documents workspace and user skill directories. Second, many tools consume repository instruction files such as `AGENTS.md`, `GEMINI.md`, `QWEN.md`, `.github/copilot-instructions.md`, `.augment/rules/*.md`, `.openhands/microagents/repo.md`, `replit.md`, `.rules`, and `CONVENTIONS.md`.

Sources consulted include OpenRouter coding app rankings, GitHub Copilot skills and custom-instructions docs, VS Code Copilot Agent Skills docs, Warp rules and skills docs, Factory skills and `AGENTS.md` docs, Crush README, OpenClaw skills docs, Aider conventions/config docs, Augment rules/guidelines docs, Kilo custom-instructions docs, Jules docs, Zed rules docs, Replit `replit.md` docs, Devin rules docs, OpenHands microagents docs, Qwen Code docs, Gemini CLI memory docs, JetBrains AI Assistant instructions docs, Piebald agent rules docs, and the AGENTS.md specification repository.

---

## 4. Requirements

### Functional Requirements

1. The installer SHALL expose at least these 25 new platform IDs: `github-copilot`, `vscode-copilot`, `copilot-cli`, `warp`, `factory`, `crush`, `openclaw`, `aider`, `augment-code`, `auggie`, `kilo-code`, `jules`, `zed`, `replit-agent`, `devin`, `openhands`, `qwen-code`, `gemini-memory`, `jetbrains-ai`, `junie`, `kiro`, `amp`, `piebald`, `open-harness`, and `agents-md`.
2. The installer SHALL keep all existing platform IDs and behavior backward compatible.
3. For native skill platforms, the installer SHALL copy or link selected skill directories to each documented skill root for the selected scope.
4. For generated dedicated rule files, the installer SHALL overwrite only the dedicated Vidbyte file, such as `.augment/rules/vidbyte-skills.md`.
5. For shared instruction files that may already contain user content, the installer SHALL update only a managed block delimited by `<!-- vidbyte-skills:start -->` and `<!-- vidbyte-skills:end -->`.
6. When the managed block is absent, the installer SHALL append it to the file with a short heading, preserving existing content byte-for-byte outside the appended block.
7. When the managed block is present, the installer SHALL replace only the block contents.
8. When multiple selected platforms resolve to the same destination file and same rendered content, the installer SHALL write that destination once.
9. The installer SHALL protect against destructive self-copy when a destination skill root is the same as `VIDBYTE_SKILLS_SRC` or the repository `skills/` source directory.
10. The installer SHALL support Windows local app data for platforms whose documented Windows user path is under `%LOCALAPPDATA%`, falling back to `~/AppData/Local` when `LOCALAPPDATA` is unavailable.
11. The installer SHALL update `--help`, README supported platform lists, and install-location tables.
12. The smoke test SHALL verify at least one native skill target, one generated dedicated rule file, one managed shared instruction file, one duplicate destination deconfliction case, and one self-copy protection case.

### Non-Functional Requirements

- Performance: Target construction and deconfliction must be O(number of selected platforms and targets). Rendering already scales with selected skill count and should remain unchanged in complexity.
- Scalability: Adding another platform should remain a registry-only change unless the platform requires a new target kind.
- Security: The installer must not fetch or execute external skill code. It only copies skills already present under the local `skills/` source root.
- Observability: Dry-run output must show the final destination path and action. Managed-block updates should report `update` or `write` consistently.
- Reliability / error tolerance: Ambiguous `.aider.conf.yml` mutation should warn and avoid destructive rewrites rather than corrupting user configuration.

---

## 5. High-Level Design

The implementation will extend the existing target registry rather than replacing it. `lib/platform-targets.js` will gain more platform IDs and a richer target schema. Existing `skill-dir` and `rule-file` targets stay intact. A new `managed-rule-file` target will handle shared Markdown instruction files by appending/replacing a delimited Vidbyte block. A new `aider-rule` target will write `CONVENTIONS.md` as a managed file and conservatively ensure `.aider.conf.yml` loads it when safe.

The installer flow remains:

```text
CLI args -> parse platform IDs -> discover selected skills -> build targets
        -> deconflict targets -> render/copy/link -> report results
```

The key design decision is to distinguish dedicated generated files from shared instruction files. Existing generated files such as `.continue/rules/vidbyte-skills.md` can be overwritten because the path is Vidbyte-owned. Files like `AGENTS.md`, `.github/copilot-instructions.md`, `QWEN.md`, and `replit.md` often contain user-authored project context, so the installer must not replace the whole file.

For platforms that share the AGENTS.md standard, the CLI will expose separate platform IDs because users think in terms of tools, but internally they may resolve to the same `managed-rule-file` destination. This keeps `--platform jules`, `--platform amp`, and `--platform agents-md` intuitive while avoiding duplicate writes when `--platform all` is used.

---

## 6. Detailed Design

### 6.1 Platform Target Registry Expansion

**File(s):** `lib/platform-targets.js`
**Type:** Modified

#### What it does

Owns platform IDs and maps each platform/scope pair to one or more install targets.

#### Interface / API

```javascript
export const PLATFORM_IDS = [
  "claude-code",
  "codex",
  "...existing",
  "github-copilot",
  "vscode-copilot",
  "copilot-cli",
  "warp",
  "factory",
  "crush",
  "openclaw",
  "aider",
  "augment-code",
  "auggie",
  "kilo-code",
  "jules",
  "zed",
  "replit-agent",
  "devin",
  "openhands",
  "qwen-code",
  "gemini-memory",
  "jetbrains-ai",
  "junie",
  "kiro",
  "amp",
  "piebald",
  "open-harness",
  "agents-md"
];
```

New target shapes:

```javascript
{
  kind: "managed-rule-file",
  file: string,
  label: string,
  platform: string,
  scope: "user" | "project",
  title: string
}

{
  kind: "aider-rule",
  conventionsFile: string,
  configFile: string,
  label: "Aider",
  platform: "aider",
  scope: "user" | "project",
  title: "Vidbyte Skills for Aider"
}
```

Planned new platform target mapping:

| Platform ID | Scope | Target(s) |
| --- | --- | --- |
| `github-copilot` | user | `~/.copilot/skills/<skill>/SKILL.md` |
| `github-copilot` | project | `.github/skills/<skill>/SKILL.md`, `.github/copilot-instructions.md` managed block |
| `vscode-copilot` | user | `~/.copilot/skills/<skill>/SKILL.md` |
| `vscode-copilot` | project | `.github/skills/<skill>/SKILL.md`, `.github/copilot-instructions.md` managed block |
| `copilot-cli` | user | `~/.copilot/skills/<skill>/SKILL.md` |
| `copilot-cli` | project | `.github/skills/<skill>/SKILL.md` |
| `warp` | user | `~/.warp/skills/<skill>/SKILL.md`, `~/AGENTS.md` managed block |
| `warp` | project | `.warp/skills/<skill>/SKILL.md`, `AGENTS.md` managed block |
| `factory` | user | `~/.factory/skills/<skill>/SKILL.md`, `~/AGENTS.md` managed block |
| `factory` | project | `.factory/skills/<skill>/SKILL.md`, `AGENTS.md` managed block |
| `crush` | user | `~/.config/crush/skills/<skill>/SKILL.md`, Windows `%LOCALAPPDATA%/crush/skills/<skill>/SKILL.md` when on Windows |
| `crush` | project | `.crush/skills/<skill>/SKILL.md`, `AGENTS.md` managed block |
| `openclaw` | user | `~/.openclaw/skills/<skill>/SKILL.md` |
| `openclaw` | project | `skills/<skill>/SKILL.md`, skipped when that root equals the selected source skills root |
| `aider` | user | `~/CONVENTIONS.md` managed block, `~/.aider.conf.yml` conservative read entry |
| `aider` | project | `CONVENTIONS.md` managed block, `.aider.conf.yml` conservative read entry |
| `augment-code` | user | `~/.augment/rules/vidbyte-skills.md` |
| `augment-code` | project | `.augment/rules/vidbyte-skills.md`, `.augment-guidelines` managed block |
| `auggie` | user | `~/.augment/rules/vidbyte-skills.md` |
| `auggie` | project | `.augment/rules/vidbyte-skills.md` |
| `kilo-code` | user | `~/.config/kilo/AGENTS.md` managed block |
| `kilo-code` | project | `AGENTS.md` managed block |
| `jules` | project | `AGENTS.md` managed block |
| `zed` | project | `.rules` managed block |
| `replit-agent` | project | `replit.md` managed block |
| `devin` | user | `~/AGENTS.md` managed block |
| `devin` | project | `AGENTS.md` managed block |
| `openhands` | project | `.openhands/microagents/repo.md` managed block |
| `qwen-code` | project | `QWEN.md` managed block |
| `gemini-memory` | user | `~/GEMINI.md` managed block |
| `gemini-memory` | project | `GEMINI.md` managed block |
| `jetbrains-ai` | project | `AGENTS.md` managed block |
| `junie` | project | `.junie/guidelines.md` managed block |
| `kiro` | project | `.kiro/guidelines.md` managed block |
| `amp` | project | `AGENTS.md` managed block |
| `piebald` | project | `AGENTS.md` managed block |
| `open-harness` | project | `AGENTS.md` managed block |
| `agents-md` | user | `~/AGENTS.md` managed block |
| `agents-md` | project | `AGENTS.md` managed block |

#### Logic / Algorithm

1. Add the new IDs to `PLATFORM_IDS`.
2. Keep existing target maps for skill directories and dedicated generated rule files.
3. Add maps for managed rule files and Aider rule targets.
4. Add an `environment.localAppData` helper to build Windows local app data paths where needed.
5. Return target objects from `buildTargets()` exactly as before, with the new kinds included.

#### Edge Cases & Error Handling

- `openclaw` project scope can collide with this repository's own `skills/` source root. The target should be emitted, but install actions must skip self-copy safely.
- Several platform IDs intentionally share `AGENTS.md`; target deconfliction will collapse duplicate writes.
- Some user-level root files such as `~/AGENTS.md` may be surprising. README must clearly document them, and users can restrict scope or platform selection.

### 6.2 Managed Markdown Rule Files

**File(s):** `lib/install-actions.js`, `lib/rule-documents.js`
**Type:** Modified

#### What it does

Adds a safe write path for shared Markdown instruction files.

#### Interface / API

```javascript
export function installManagedRuleFile(skills, target, dryRun) {
  // returns { action: "write" | "update", destination: target.file }
}

export function renderManagedRuleBlock(skills, title) {
  // returns block delimited with vidbyte-skills:start/end markers
}
```

#### Logic / Algorithm

1. Render selected skills with the same body content currently used by `renderRuleDocument()`.
2. Wrap the rendered content in stable HTML comment delimiters.
3. If the file does not exist, create parent directories and write the managed block as the whole file.
4. If the file exists and contains both delimiters, replace the inclusive block.
5. If the file exists without delimiters, append two newlines and the managed block.
6. Preserve all content outside the managed block exactly.

#### Edge Cases & Error Handling

- If only one delimiter is present, throw a clear error and do not modify the file.
- If parent directory creation fails, surface the filesystem error.
- Dry-run must not create directories or files.

### 6.3 Target Deconfliction

**File(s):** `lib/installer.js`
**Type:** Modified

#### What it does

Prevents repeated writes or repeated directory replacements when platform aliases map to the same destination.

#### Interface / API

```javascript
function dedupeTargets(targets) {
  return uniqueTargets;
}
```

#### Logic / Algorithm

1. Compute a stable key per target:
   - `skill-dir:${target.root}`
   - `rule-file:${target.file}`
   - `managed-rule-file:${target.file}`
   - `aider-rule:${target.conventionsFile}:${target.configFile}`
2. Preserve the first target for each key.
3. Merge labels/platforms into report metadata when useful.
4. Install only the deconflicted list.

#### Edge Cases & Error Handling

- If two targets have the same destination but different kinds, keep them separate and let the implementation fail loudly; that would indicate a registry bug.
- If label merging becomes noisy, report the first label and path. Correctness does not depend on merged labels.

### 6.4 Self-Copy Protection

**File(s):** `lib/install-actions.js`
**Type:** Modified

#### What it does

Prevents deleting source skill directories when a project target root equals the installer source `skills/` root.

#### Interface / API

```javascript
export function installSkillDirectory(skill, target, mode, dryRun, environment) {
  // existing behavior plus source/destination guard
}
```

#### Logic / Algorithm

1. Resolve `skill.dir`, destination, `target.root`, and `environment.skillsRoot`.
2. If destination equals `skill.dir`, return `{ action: "skip", destination, reason: "source and destination are identical" }`.
3. If target root equals `environment.skillsRoot`, return a skip result before `rmSync()`.
4. Otherwise perform existing copy/link replacement.

#### Edge Cases & Error Handling

- Symlink mode must use resolved real paths when possible to avoid deleting a linked source.
- The guard must run before `fs.rmSync(destination)`.

### 6.5 Aider Configuration Handling

**File(s):** `lib/install-actions.js`, `lib/rule-documents.js`
**Type:** Modified

#### What it does

Writes Vidbyte guidance to `CONVENTIONS.md` and makes Aider load that file automatically when `.aider.conf.yml` can be updated safely.

#### Interface / API

```javascript
export function installAiderRule(skills, target, dryRun) {
  // writes/updates CONVENTIONS.md and updates .aider.conf.yml conservatively
}
```

#### Logic / Algorithm

1. Write `CONVENTIONS.md` using managed-block semantics.
2. If `.aider.conf.yml` is absent, create:

```yaml
read:
  - CONVENTIONS.md
```

3. If `.aider.conf.yml` contains a Vidbyte-managed config marker, replace that marker block.
4. If it has a simple top-level `read:` list and does not already include `CONVENTIONS.md`, append `  - CONVENTIONS.md`.
5. If the config shape is ambiguous, leave it unchanged and return a warning result telling the user to add `read: [CONVENTIONS.md]`.

#### Edge Cases & Error Handling

- Avoid parsing or rewriting complex YAML structures.
- Preserve comments and existing content wherever possible.
- Do not duplicate `CONVENTIONS.md` entries.

### 6.6 Environment Paths

**File(s):** `lib/install-environment.js`
**Type:** Modified

#### What it does

Adds environment path data needed by Windows-aware targets.

#### Interface / API

```javascript
export function readInstallEnvironment() {
  return {
    home,
    localAppData,
    projectRoot,
    repoRoot,
    skillsRoot
  };
}
```

#### Logic / Algorithm

1. Use `process.env.LOCALAPPDATA` on Windows when present.
2. Otherwise fall back to `path.join(home, "AppData", "Local")` on Windows.
3. On non-Windows, `localAppData` may point to `path.join(home, ".local", "share")` only for future use; Crush uses `~/.config/crush/skills` on non-Windows.

#### Edge Cases & Error Handling

- Keep existing `VIDBYTE_HOME`, `VIDBYTE_PROJECT_ROOT`, and `VIDBYTE_SKILLS_SRC` overrides unchanged.

### 6.7 Documentation Updates

**File(s):** `README.md`, `package.json`
**Type:** Modified

#### What it does

Documents supported platforms and updates package discoverability.

#### Interface / API

N/A - Markdown and package metadata only.

#### Logic / Algorithm

1. Update the supported platform list under Installer Options.
2. Split Install Locations into native skill directories, dedicated generated rule files, and managed shared instruction files.
3. Note that managed shared files preserve existing content outside Vidbyte markers.
4. Add keywords for major new platforms where appropriate.

#### Edge Cases & Error Handling

- Keep README concise despite the larger matrix.
- Explicitly warn about `--scope user --platform agents-md` writing `~/AGENTS.md`.

### 6.8 Tests

**File(s):** `scripts/smoke-test.js`
**Type:** Modified

#### What it does

Extends installer smoke coverage for new target behavior.

#### Interface / API

N/A - script is executed by `npm test`.

#### Logic / Algorithm

1. Run installer against temp home/project/skills roots as today.
2. Assert new native skill destinations exist for representative platforms:
   - `.github/skills/demo-skill/SKILL.md`
   - `.warp/skills/demo-skill/SKILL.md`
   - `.factory/skills/demo-skill/SKILL.md`
   - `.crush/skills/demo-skill/SKILL.md`
3. Assert managed files contain Vidbyte markers and selected skill content:
   - `AGENTS.md`
   - `.github/copilot-instructions.md`
   - `QWEN.md`
   - `replit.md`
4. Pre-create `AGENTS.md` with user content and verify it survives.
5. Verify duplicate selected platforms that map to `AGENTS.md` do not duplicate the Vidbyte block.
6. Verify self-copy protection by running `--platform openclaw --scope project` with project root equal to repo-style source root and checking the fixture source was not removed.

#### Edge Cases & Error Handling

- Keep tests deterministic and offline.
- Avoid platform-specific assertions for Windows-only local app data unless running on Windows.

---

## 7. Data Model Changes

N/A - No database, persisted schema, or application data model changes. The only data-shape change is the in-memory target object schema in `lib/platform-targets.js`.

---

## 8. API Changes

N/A - No HTTP API endpoints are created, modified, or deprecated. The public CLI surface changes by accepting additional `--platform` values.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/expanded-coding-harness-integrations.md` | Architecture and rollout plan for expanded harness support |
| MODIFY | `lib/platform-targets.js` | Add new platform IDs and target mappings |
| MODIFY | `lib/install-actions.js` | Add managed-block writes, Aider handling, and self-copy protection |
| MODIFY | `lib/rule-documents.js` | Render managed Markdown blocks and optional rule frontmatter |
| MODIFY | `lib/installer.js` | Deconflict duplicate targets and route new target kinds |
| MODIFY | `lib/install-environment.js` | Add Windows local app data path support |
| MODIFY | `lib/install-reporter.js` | Report skip/warning results clearly |
| MODIFY | `README.md` | Document new platforms, locations, and managed-file behavior |
| MODIFY | `package.json` | Update keywords for new harness integrations |
| MODIFY | `scripts/smoke-test.js` | Add coverage for new targets and safety behavior |

---

## 10. Testing Plan

### Unit Tests

N/A - The repository currently uses smoke/validation scripts rather than a unit test framework. This change will extend `scripts/smoke-test.js` rather than introduce a new test framework.

### Integration Tests

- `npm test` must pass.
- `node ./bin/install.js demo-skill --scope both --platform github-copilot,warp,factory,augment-code,kilo-code,aider,openhands,qwen-code,replit-agent --dry-run` should complete and report paths without filesystem writes.
- Smoke test must verify native skill installs, generated rule files, managed shared files, duplicate deconfliction, and self-copy protection.

### Manual / QA Test Cases

1. Given an existing `AGENTS.md` containing user project instructions, when installing `--platform jules,amp,agents-md --scope project`, then `AGENTS.md` keeps the original content and contains exactly one Vidbyte-managed block.
2. Given no `.github/copilot-instructions.md`, when installing `--platform github-copilot --scope project`, then the file is created with Vidbyte guidance and `.github/skills/<skill>/SKILL.md` exists.
3. Given no `.aider.conf.yml`, when installing `--platform aider --scope project`, then `CONVENTIONS.md` is created and `.aider.conf.yml` reads it.
4. Given an existing `.aider.conf.yml` with a simple `read:` list, when installing `--platform aider`, then `CONVENTIONS.md` is added once.
5. Given `--mode link`, when installing to Warp or Factory skill directories, then the destination skill path is a symlink/junction as in existing platforms.
6. Given `--scope both --platform openclaw` from this repository, when source and destination skill roots collide, then the installer skips the unsafe project target and does not delete source skills.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Node.js stdlib | Node >= 18 | Filesystem, path, OS environment handling | Low |
| External documentation | Linked sources only | Research basis for target paths | Medium: docs and product behavior can change |
| OpenRouter coding app rankings | `https://openrouter.ai/apps/category/coding` | Popularity signal for candidate prioritization | Low: used only for research, not runtime |

No runtime network calls or new npm dependencies are planned.

---

## 12. Rollout & Deployment

- Feature flags: None.
- Breaking change: No intended breaking change. Existing platform IDs and default behavior remain.
- Migration path: Users can opt into individual new platforms with `--platform`; `--platform all` will include the new platforms, so README must make the broader write surface clear.
- Deployment order: Merge code and docs together after tests pass.
- Rollback procedure: Revert the implementation commit. Managed files written in user projects can be manually cleaned by deleting the Vidbyte block between `vidbyte-skills:start` and `vidbyte-skills:end`.

---

## 13. Open Questions

- [ ] Should `--platform all` include every AGENTS.md-compatible alias, or should aliases such as `jules`, `amp`, and `agents-md` be opt-in to avoid writing root `AGENTS.md` for users who only expected skill directories?
- [ ] Should OpenClaw project scope be enabled by default despite its documented `<workspace>/skills` path colliding with this repository's own `skills/` source convention?
- [ ] Should Aider config mutation be limited to creating `.aider.conf.yml` only when absent, with existing configs left untouched and a warning emitted?
- [ ] Should `github-copilot`, `vscode-copilot`, and `copilot-cli` remain separate aliases even though their local skill paths overlap?
- [ ] Should user-scope managed root files such as `~/AGENTS.md`, `~/GEMINI.md`, and `~/CONVENTIONS.md` be included in `--scope both`, or should root instruction files be project-only by default?

---

## 14. Alternatives Considered

### Alternative 1: Only add native Agent Skills platforms

- What: Add GitHub Copilot, Warp, Factory, Crush, and OpenClaw skill directories and ignore instruction-file-only platforms.
- Why rejected: The user's request explicitly asks for broad coding harness coverage. Many popular harnesses still use rules or context files rather than `SKILL.md` folders.

### Alternative 2: Overwrite shared instruction files

- What: Treat `AGENTS.md`, `QWEN.md`, `replit.md`, and `.github/copilot-instructions.md` like current generated rule files and replace the whole file.
- Why rejected: These files commonly contain important project-specific instructions. Replacing them would be destructive and would make `--platform all` unsafe.

### Alternative 3: Use one `agents-md` platform instead of platform-specific aliases

- What: Add only `agents-md` for all tools that read `AGENTS.md`.
- Why rejected: Users choose platforms by tool name. `--platform jules` or `--platform amp` is more discoverable than knowing their shared file format.

### Alternative 4: Add a YAML parser dependency for Aider

- What: Add a dependency to parse and mutate `.aider.conf.yml` robustly.
- Why rejected: The repository currently has no runtime dependencies and uses Node stdlib only. A conservative line-based implementation is enough for common Aider configs; ambiguous configs can be left with a warning.

### Alternative 5: Generate a separate file per platform even for AGENTS.md tools

- What: Write files such as `JULES.md`, `AMP.md`, or `DEVIN.md` to avoid shared destinations.
- Why rejected: Those are not the documented discovery files for the tools. Installing into non-discovered files would create artifacts that agents ignore.

