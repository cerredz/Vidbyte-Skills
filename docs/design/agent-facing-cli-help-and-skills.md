# Design Doc: Agent-Facing CLI Help and Skills

**Status:** Draft
**Author:** Codex
**Created:** 2026-06-04
**Last Updated:** 2026-06-04

---

## 1. Overview

Add an agent-focused help section to the `vidbyte` CLI and a local command group that lets coding agents load current, version-matched Markdown instructions for using the CLI. The design follows the `vercel-labs/agent-browser` pattern found via web research: a stable help/discovery surface points agents to a CLI-served skill catalog, while the actual usage instructions live in bundled Markdown files loaded at runtime.

---

## 2. Goals & Non-Goals

### Goals

- Add an `Agents:` section to `vidbyte --help` that explicitly tells agents how to load current CLI usage instructions.
- Add a `vidbyte agents` command group with `list`, `get`, and `path` subcommands.
- Ship bundled agent-facing Markdown skill content for core Vidbyte CLI usage.
- Support `--json` output for agent programmatic consumption.
- Support `get --full` to include `references/` and `templates/` content alongside a skill.
- Keep the implementation stdlib-only in the existing Python `vidbyte` CLI.
- Keep the existing `vidbyte-skills` installer behavior separate from this new command group.
- Add automated verification that covers every behavior in this design.

### Non-Goals

- Do not change the backend API contract for `feedback`, `compressor`, `retain`, or `auth`.
- Do not change installed harness skill behavior under the existing `skills/` directory.
- Do not add new npm dependencies or Python dependencies.
- Do not expose secrets, auth state, or environment values through the agent help command.
- Do not implement the full `agent-browser skills` namespace verbatim as `vidbyte skills`; `vidbyte` already lives in a package named `vidbyte-skills`, so the new namespace is `agents` to avoid ambiguity.
- Do not implement skill installation through `vidbyte agents`; installation remains under `vidbyte-skills`.

---

## 3. Background & Context

The current repository exposes two related CLI surfaces:

- `vidbyte`, a Node shim (`bin/vidbyte.js`) that delegates to a stdlib-only Python CLI in `cli/`.
- `vidbyte-skills`, a Node installer (`bin/install.js`) that installs product skills from `skills/` into coding harnesses.

`vidbyte --help` currently lists backend submission and auth commands, plus a short `Skill Installer:` section. It has no explicit agent-oriented section and no way for an agent to ask the installed CLI for current usage instructions. Several existing skills already tell agents to call `vidbyte retain`, `vidbyte feedback submit`, or `vidbyte-skills auth login`, but those instructions are copied into installed skill files and can drift from the installed CLI version.

The reference implementation is `vercel-labs/agent-browser`. Its public skills docs describe `agent-browser skills list/get/path`, `get --full`, `get --all`, `--json`, and an environment override for the skills directory. The GitHub implementation in `cli/src/skills.rs` searches both `skills/` discovery stubs and `skill-data/` runtime content, hides bootstrap stubs from list/all output via `hidden: true`, reads `SKILL.md` frontmatter, and includes `references/` and `templates/` files when `--full` is passed. Sources used:

- `https://agent-browser.dev/skills`
- `https://github.com/vercel-labs/agent-browser/blob/main/skills/agent-browser/SKILL.md`
- `https://github.com/vercel-labs/agent-browser/blob/main/cli/src/skills.rs`
- `https://github.com/vercel-labs/agent-browser/tree/main/skill-data`

This feature adapts that pattern to Vidbyte without conflating two distinct concepts: installable Vidbyte product skills under `skills/`, and agent-facing CLI usage guides under a new `agent-skills/` directory.

---

## 4. Requirements

### Functional Requirements

1. `vidbyte --help` SHALL include an `Agents:` section.
2. The `Agents:` section SHALL mention `vidbyte agents`, `vidbyte agents get core`, `vidbyte agents get core --full`, and `vidbyte agents --json`.
3. `vidbyte agents` SHALL behave the same as `vidbyte agents list`.
4. `vidbyte agents list` SHALL list non-hidden bundled agent skills with names and descriptions.
5. `vidbyte agents list --json` SHALL output valid JSON with `success: true` and a `data` array of `{name, description}` objects.
6. `vidbyte agents get core` SHALL output the full `agent-skills/core/SKILL.md` content.
7. `vidbyte agents get core --full` SHALL output the core skill plus any files under `agent-skills/core/references/` and `agent-skills/core/templates/`, separated by clear file headers.
8. `vidbyte agents get --all` SHALL output every non-hidden agent skill.
9. `vidbyte agents get --all --json` SHALL output valid JSON with `success: true` and a `data` array of skill content objects.
10. `vidbyte agents path` SHALL print the resolved agent skill root path.
11. `vidbyte agents path core` SHALL print the resolved path to the `core` agent skill directory.
12. The command group SHALL support `VIDBYTE_AGENT_SKILLS_DIR` as a test/development override pointing directly at an alternate agent skills directory.
13. Unknown agent skill names SHALL fail with a non-zero exit and a clear `Skill not found: <name>` error.
14. Unknown `vidbyte agents` subcommands SHALL fail with a non-zero exit and a clear `Unknown agents subcommand: <name>` error.
15. The implementation SHALL not read from or write to auth/session files.
16. The implementation SHALL not make network requests.
17. The implementation SHALL not list product skills from `skills/`; it SHALL read only `agent-skills/` unless `VIDBYTE_AGENT_SKILLS_DIR` overrides the root.
18. The npm package `files` manifest SHALL include `agent-skills`.
19. The README SHALL document the agent-facing command group.

### Non-Functional Requirements

- Performance: Listing should scan only the shallow `agent-skills/` directory. `get --full` should read only the selected skill's supplementary files.
- Scalability: Adding a new agent guide should require adding `agent-skills/<name>/SKILL.md`, with optional references/templates.
- Security: All content is local Markdown. The command must not expose stored tokens, API keys, env var values, request signatures, or backend responses.
- Observability: Human output should be compact and predictable. JSON output should be machine-readable and stable.
- Reliability: Missing directories, missing `SKILL.md`, malformed frontmatter, unknown names, and empty catalogs should have deterministic output.

---

## 5. High-Level Design

Create a new `agent-skills/` directory for runtime CLI usage guides. This separates agent-facing instructions about how to operate `vidbyte` from installable user/product skills under `skills/`. The first bundled skill is `core`, which teaches agents the current CLI command shapes, the security boundary, dry-run usage, auth usage, and when to call each existing Vidbyte command.

Add a new Python command class, `AgentSkillsCommand`, under `cli/commands/agents.py`. It discovers directories under `agent-skills/`, parses the same simple `SKILL.md` frontmatter fields used elsewhere (`name`, `description`, optional `hidden`), lists visible guides, reads selected guide content, optionally appends references/templates, and returns either text or JSON. The Python implementation mirrors the agent-browser mechanics but stays in stdlib Python and the existing router style.

`cli/__main__.py` receives a small special-case parser for the `agents` command group because existing `parse_options()` intentionally rejects positional arguments. The `agents` parser preserves positional subcommand/name arguments for the command class. Existing `feedback`, `compressor`, `retain`, and `auth` parsing stays unchanged.

```text
Agent or human
    |
    v
vidbyte --help
    |
    +--> Agents section points to `vidbyte agents get core --full`
    |
    v
vidbyte agents get core --full
    |
    v
cli/__main__.py detects agents command group
    |
    v
CommandRouter -> AgentSkillsCommand
    |
    v
agent-skills/core/SKILL.md + references/templates
    |
    v
Markdown or JSON output to stdout
```

---

## 6. Detailed Design

### 6.1 Agent Skill Content

**File(s):** `agent-skills/core/SKILL.md`, `agent-skills/core/references/vidbyte-cli-commands.md`
**Type:** New file

#### What it does

Provides version-matched instructions for agents using the installed Vidbyte CLI.

#### Interface / API

```markdown
---
name: core
description: Core Vidbyte CLI usage for agents: auth, retain, feedback, compressor, dry-run validation, and security boundaries.
---

# Vidbyte CLI Core
...
```

#### Logic / Algorithm

1. Keep `SKILL.md` concise enough to load by default.
2. Point agents to `vidbyte agents get core --full` when they need command references.
3. Explain that agents must call `vidbyte`/`vidbyte-skills` instead of constructing backend requests.
4. Include common flows:
   - Auth: `vidbyte-skills auth login`
   - Retain: `vidbyte retain ...`
   - Feedback: `vidbyte feedback submit --file ...`
   - Compressor: `vidbyte compressor submit --file ...`
   - Dry run: add `--dry-run`
5. Include security rules:
   - Do not call Vidbyte HTTP endpoints directly.
   - Do not construct auth headers in prompt text.
   - Do not expose secrets in output.

#### Edge Cases & Error Handling

- N/A - Static Markdown content. Validation happens through the command test script.

---

### 6.2 `AgentSkillsCommand`

**File(s):** `cli/commands/agents.py`
**Type:** New file

#### What it does

Discovers and serves bundled agent-facing CLI usage skills.

#### Interface / API

```python
class AgentSkillsCommand:
    def __init__(self, repo_root: Path | None = None) -> None:
        # Stores the repository root and resolves the agent skills directory.

    def run(self, action: str, args: list[str]) -> str | None:
        # Dispatches list, get, and path actions using command-local argument parsing.

    def list(self, args: list[str]) -> str:
        # Lists non-hidden agent skills as text or JSON.

    def get(self, args: list[str]) -> str:
        # Returns selected skill content, all visible skills, and optional supplementary files.

    def path(self, args: list[str]) -> str:
        # Returns the root path or a named skill directory path.
```

Internal helper classes/functions:

```python
@dataclass
class AgentSkill:
    name: str
    description: str
    directory: Path
    skill_file: Path
    hidden: bool
```

#### Logic / Algorithm

1. Resolve the skill root:
   - If `VIDBYTE_AGENT_SKILLS_DIR` exists and points to a directory, use it.
   - Otherwise use `<repo_root>/agent-skills`.
2. Discover one-level child directories containing `SKILL.md`.
3. Parse frontmatter:
   - `name` is required.
   - `description` is optional but should default to empty string if missing.
   - `hidden: true` hides a guide from `list` and `get --all`, but `get <name>` can still retrieve it.
4. Sort skills by name.
5. For `list`, return visible skills only.
6. For `get <name>`, resolve exact names and return full `SKILL.md`.
7. For `get --all`, return all visible skills.
8. For `get --full`, append files from `references/` and `templates/` sorted by filename.
9. For `path`, print the root or selected directory.
10. For `--json`, return stable JSON with `success` and `data`.

#### Edge Cases & Error Handling

- Missing `agent-skills/`: text output says no agent skills found; JSON returns `{"success": true, "data": []}` for list and a structured error for get/path.
- Empty directory: same behavior as missing directory for list.
- Directory without `SKILL.md`: ignored.
- Malformed frontmatter: ignored unless a named get target depends on it, in which case it behaves as not found.
- Unknown name: non-zero exit via `RuntimeError`.
- `get` with no name and no `--all`: non-zero exit with usage guidance.
- Supplementary file read error: skip unreadable file rather than failing the whole command.

---

### 6.3 Main CLI Dispatch

**File(s):** `cli/__main__.py`
**Type:** Modified

#### What it does

Routes `vidbyte agents ...` to the new command group without changing existing command parsing.

#### Interface / API

```python
def _main(argv: list[str]) -> None:
    # Parses top-level Vidbyte commands and dispatches them through CommandRouter.
```

#### Logic / Algorithm

1. Preserve current help behavior for no args, `--help`, and `-h`.
2. If `argv[0] == "agents"`:
   - If no subcommand or the next arg starts with `--`, set `action = "list"` and pass remaining args.
   - Otherwise set `action = argv[1]` and pass `argv[2:]`.
   - Build `options = {"_args": rest}`.
3. Preserve existing special case for `retain`.
4. Preserve existing two-token `resource action` parsing for other commands.
5. Print non-empty command result.

#### Edge Cases & Error Handling

- `vidbyte agents --json` maps to `list --json`.
- `vidbyte agents get core --json` preserves `core` as a positional name.
- Existing `feedback submit` and `auth login` parsing remains unchanged.

---

### 6.4 Router Integration

**File(s):** `cli/router.py`
**Type:** Modified

#### What it does

Adds routing for the new `agents` resource.

#### Interface / API

```python
class CommandRouter:
    def route(self, resource: str, action: str, options: dict) -> str | None:
        # Routes known command groups to their command classes.
```

#### Logic / Algorithm

1. Import `AgentSkillsCommand`.
2. If `resource == "agents"` and `action in ("list", "get", "path")`, instantiate `AgentSkillsCommand`.
3. Call `cmd.run(action, options.get("_args", []))`.
4. Existing branches remain unchanged.

#### Edge Cases & Error Handling

- Unknown `agents` subcommands fall through to the existing unknown command error, or are handled in `AgentSkillsCommand.run` with a clearer message.

---

### 6.5 Help Text

**File(s):** `cli/helpers/usage.py`
**Type:** Modified

#### What it does

Adds an agent-specific help section.

#### Interface / API

```python
def usage() -> str:
    # Returns the Vidbyte CLI help text.
```

#### Logic / Algorithm

Append this section before `Security:`:

```text
Agents:
  vidbyte agents                         List bundled agent-facing CLI skills
  vidbyte agents get core                Load core Vidbyte CLI usage instructions
  vidbyte agents get core --full         Include command references and templates
  vidbyte agents --json                  Return structured agent skill metadata
```

#### Edge Cases & Error Handling

- N/A - Static text.

---

### 6.6 Package Manifest

**File(s):** `package.json`
**Type:** Modified

#### What it does

Ensures the new `agent-skills/` directory is included in published npm packages.

#### Interface / API

```json
"files": [
  "agent-skills",
  "bin",
  "cli",
  ...
]
```

#### Logic / Algorithm

Add `"agent-skills"` to the existing `files` array.

#### Edge Cases & Error Handling

- If omitted, local tests pass but published npm packages would not contain the runtime agent guides. The dedicated test script will assert the manifest includes `agent-skills`.

---

### 6.7 README Documentation

**File(s):** `README.md`
**Type:** Modified

#### What it does

Documents the new agent-facing command group near the current `Vidbyte CLI` section.

#### Interface / API

```markdown
## Agent Usage Guides

vidbyte agents
vidbyte agents get core
vidbyte agents get core --full
vidbyte agents get core --json
```

#### Logic / Algorithm

1. Explain that `vidbyte agents` is for agent-facing CLI usage instructions.
2. Explain that `vidbyte-skills` remains the installer.
3. Mention that `VIDBYTE_AGENT_SKILLS_DIR` can override the root for development.

#### Edge Cases & Error Handling

- N/A - Documentation only.

---

### 6.8 Verification Script

**File(s):** `scripts/test-agent-facing-cli-skills.py`, `package.json`
**Type:** New file and modified

#### What it does

Runs command-level tests for the new feature and gets wired into `npm test`.

#### Interface / API

```python
def main() -> int:
    # Runs every test case from this design and exits non-zero on failure.
```

#### Logic / Algorithm

1. Invoke `python -m cli --help` and assert the `Agents:` section exists.
2. Invoke `python -m cli agents` and assert `core` appears.
3. Invoke `python -m cli agents --json` and parse JSON.
4. Invoke `python -m cli agents get core` and assert the Markdown heading appears.
5. Invoke `python -m cli agents get core --full` and assert a `references/vidbyte-cli-commands.md` header appears.
6. Invoke `python -m cli agents get --all --json` and assert at least one content object exists.
7. Invoke `python -m cli agents path` and assert the path ends in `agent-skills`.
8. Invoke `python -m cli agents path core` and assert the path ends in `agent-skills/core`.
9. Invoke unknown-name and unknown-subcommand cases and assert non-zero exits.
10. Create a temporary override directory, set `VIDBYTE_AGENT_SKILLS_DIR`, and assert only the fixture skill is listed.
11. Assert `package.json` includes `"agent-skills"` in `files`.

#### Edge Cases & Error Handling

- The script prints `PASS` or `FAIL` for every case and ends with `X/Y tests passed`.
- The script exits with code `1` if any case fails.

---

## 7. Data Model Changes

### 7.1 Agent Skill Markdown Format

**Change type:** New

```markdown
---
name: core
description: Core Vidbyte CLI usage for agents.
hidden: false
---

# Vidbyte CLI Core
```

**Migration strategy:** N/A - New local content directory only.

- Forward migration: Include `agent-skills/` in the npm package and command discovery.
- Rollback plan: Remove `agent-skills/`, remove the `agents` command route, and remove the help/README references.

---

## 8. API Changes

N/A - No HTTP API endpoints are created, modified, or deprecated. This is a local CLI feature.

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/agent-facing-cli-help-and-skills.md` | Design document for this feature |
| CREATE | `agent-skills/core/SKILL.md` | Bundled core agent-facing CLI usage guide |
| CREATE | `agent-skills/core/references/vidbyte-cli-commands.md` | Full command reference included by `--full` |
| CREATE | `cli/commands/agents.py` | Python command class for `vidbyte agents` |
| CREATE | `scripts/test-agent-facing-cli-skills.py` | Required verification script for all design test cases |
| MODIFY | `cli/__main__.py` | Dispatch `vidbyte agents` without breaking existing parsers |
| MODIFY | `cli/router.py` | Route `agents list/get/path` to the new command class |
| MODIFY | `cli/helpers/usage.py` | Add `Agents:` help section |
| MODIFY | `package.json` | Publish `agent-skills/` and run the new verification script in `npm test` |
| MODIFY | `README.md` | Document agent-facing usage guide commands |

Total: 5 files created, 5 files modified, 0 files deleted.

---

## 10. Testing Plan

### Unit Tests

- [Edge Case] `AgentSkillsCommand` discovers an empty or missing agent skill directory and `list` returns an empty result instead of throwing.
- [Hidden Failure] `AgentSkillsCommand` ignores child directories without `SKILL.md` so malformed local folders do not pollute the catalog.
- [Hidden Assumption] `AgentSkillsCommand` parses `name` and multiline `description` frontmatter correctly.
- [Hidden Assumption] `AgentSkillsCommand` respects `hidden: true` for `list` and `get --all` while still allowing `get <hidden-name>`.
- [Silent Failure] `AgentSkillsCommand` sorts listed skills by name so output order is deterministic.
- [Edge Case] `AgentSkillsCommand.get` with no name and no `--all` exits non-zero with usage guidance.
- [Edge Case] `AgentSkillsCommand.get` with multiple names separates Markdown sections predictably.
- [Silent Failure] `AgentSkillsCommand.get --full` includes supplementary files in sorted order so agents do not miss references due to filesystem ordering.
- [Hidden Failure] `AgentSkillsCommand.path core` fails non-zero for unknown names rather than printing the root path.
- [Hidden Assumption] `VIDBYTE_AGENT_SKILLS_DIR` points directly at an alternate skill root, not at the repository root.

### Integration Tests

- [Hidden Assumption] `python -m cli --help` includes an `Agents:` section with `vidbyte agents get core --full`.
- [Edge Case] `python -m cli agents` behaves like `python -m cli agents list`.
- [Silent Failure] `python -m cli agents --json` emits parseable JSON with `success: true` and `core` metadata.
- [Hidden Failure] `python -m cli agents get core` emits the installed `core` content and does not fall through to unknown command handling.
- [Silent Failure] `python -m cli agents get core --json` emits JSON where the content field contains the full `SKILL.md`, not just the body.
- [Edge Case] `python -m cli agents get --all` excludes `hidden: true` fixture skills.
- [Hidden Failure] `python -m cli agents get core --full` includes `references/vidbyte-cli-commands.md`.
- [Hidden Assumption] `python -m cli agents path` prints the real bundled agent skills root.
- [Hidden Assumption] `python -m cli agents path core` prints the real bundled core skill directory.
- [Hidden Failure] `python -m cli feedback submit --file <tmp> --dry-run` still works after dispatch changes.
- [Hidden Failure] `python -m cli retain ... --dry-run` still works after dispatch changes.
- [Hidden Failure] `python -m cli auth status` still routes correctly after dispatch changes.
- [Hidden Assumption] `node bin/vidbyte.js agents get core` delegates through the Node shim and works from the package root.

### Manual / QA Test Cases

1. [Edge Case] Run `vidbyte agents get missing`; confirm it exits non-zero and says `Skill not found: missing`.
2. [Edge Case] Run `vidbyte agents nope`; confirm it exits non-zero and says `Unknown agents subcommand: nope`.
3. [Silent Failure] Run `vidbyte agents get core --full`; confirm no auth token, API key, signing header, or env var value is printed.
4. [Hidden Failure] Pack the npm package locally with `npm pack --dry-run`; confirm `agent-skills/core/SKILL.md` appears in the file list.
5. [Hidden Assumption] Run `npm test`; confirm the new verification script runs after existing validation and smoke tests.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Python standard library | Existing Python 3 runtime | Filesystem scanning, JSON formatting, subprocess test script | Low |
| Node.js | >=18 existing package engine | Existing npm test runner and Node shim | Low |
| agent-browser docs/repo | `https://agent-browser.dev/skills`, `https://github.com/vercel-labs/agent-browser` | Design reference only | Low - no runtime dependency |

---

## 12. Rollout & Deployment

- Feature flags: None.
- Breaking change: No. Existing `vidbyte` commands and `vidbyte-skills` installer behavior remain unchanged.
- Deployment order: Single PR. The package manifest change must land with the new directory so published packages include the agent guides.
- Rollback procedure: Revert the PR. No backend, database, or user data migration is involved.
- Release notes: Mention that agents can run `vidbyte agents get core --full` for current CLI usage instructions.

---

## 13. Open Questions

- [ ] Should the command group eventually be aliased as `vidbyte skills` for closer parity with `agent-browser`, or is `vidbyte agents` the permanent public surface?
- [ ] Should `vidbyte-skills --help` also get an `Agents:` section, or is the agent-facing command only part of the `vidbyte` backend submission CLI for now?
- [ ] Should future agent guides include separate entries for `retain`, `feedback`, and `auth`, or should `core` remain the only guide until the command surface grows?

---

## 14. Alternatives Considered

### Alternative 1: Implement `vidbyte skills` Instead Of `vidbyte agents`

- What: Mirror `agent-browser skills` exactly as `vidbyte skills list/get/path`.
- Why rejected: This repo's npm package and installer are already named `vidbyte-skills`, and `skills/` already means installable product skills. A `vidbyte skills` namespace would be easier to confuse with installation or product skill listing. `vidbyte agents` makes the intent explicit.

### Alternative 2: Serve Existing `skills/` Directly

- What: Let `vidbyte agents get retain` or `vidbyte skills get retain` read from the existing installable skill catalog.
- Why rejected: The existing catalog contains hundreds of product and reasoning skills, not just CLI usage guides. Listing that catalog would be noisy and would not solve the agent help problem. It also couples runtime CLI usage instructions to product skill packaging.

### Alternative 3: Put The Agent Guide In README Only

- What: Add an `Agents` section to README and help text without a CLI command.
- Why rejected: README content can drift from the installed CLI version. The point of the agent-browser pattern is that agents can ask the installed binary for instructions that match the binary they are about to use.

### Alternative 4: Fetch Agent Instructions From The Web

- What: Have the CLI print a URL or fetch instructions from Vidbyte docs.
- Why rejected: Agents should be able to operate offline and should not need network access just to learn local command syntax. Local bundled Markdown is deterministic, package-versioned, and easier to test.

### Alternative 5: Add New Node-Based Runtime Command

- What: Implement the agent guide command in Node next to `vidbyte-skills`.
- Why rejected: The requested target is `vidbyte-cli`, whose public `vidbyte` command delegates to Python. Keeping the command in Python keeps one CLI surface and avoids creating another partial command parser in Node.
