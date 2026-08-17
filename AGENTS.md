# Vidbyte Skills

Vidbyte helps developers package reusable agent workflows, learning routines, and reasoning methods as portable skills. Vidbyte Skills is the repository and npm package that installs those skills into local coding harnesses, and it also ships the `vidbyte` command that skills use to submit authenticated artifacts back to Vidbyte. Coding agents need local, versioned instructions that are more precise than a general prompt — this repository packages those instructions as auditable Markdown folders, installs them into the harnesses developers already use, and keeps the authenticated network boundary in code rather than in prompt text.

The repository owns the skill source files under `skills/`; the installer copies or links them into native skill directories and writes generated rule files for Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Hermes, GitHub Copilot, Warp, Factory, Crush, Aider, Augment, Cline, Continue, Roo Code, Windsurf, and AGENTS.md-compatible tools. The single most important structural fact about this repository is that it has **two runtimes**: a Node.js installer (`bin/`, `lib/`, `packages/`, `package.json`) that puts skills on disk, and a Python CLI (`cli/`) that skills invoke at runtime to authenticate and submit artifacts. They share a repository but not a call path, and confusing them is the most common way to get lost here.

> **This file is a Map.** It is a lossy compression of what this repository already contains in full — folder topology and what each folder is for, nothing that isn't derivable from the tree itself. It exists to answer *where do I look next*, not to be correct in every detail. It is expected to drift; regenerate it rather than patching it.

## File Index

**Root files:** `README.md` — installation forms, the repository map, and the supported-harness list. `llms.txt` — the agent-readable description of the package and its skills. `package.json` — npm package metadata and the `bin` entries that make `npx vidbyte-skills` work. `skills-manifest.json` — the generated catalog of every skill, its category, and its version, consumed by the installer. `.env.example`, `LICENSE`, `.gitignore`.

### `agent-skills/`

A small, separate skill tree for skills that target agents rather than human-driven harnesses — currently a single `core/` group. It is kept apart from `skills/` because its install path and audience differ: these are the instructions an autonomous agent loads for itself, not ones a developer opts into per project. Contents are not expanded here; skill files are instructions, not repository structure.

### `artifacts/`

Authored design and research documents that explain how this repository thinks, written for humans and not shipped to users. `architecture.md` is the structural companion to this Map and the deeper reference for how the installer and CLI fit together; `cli-command-architecture.md` and `skill-cli-backend-architecture.md` cover the Python CLI and its backend boundary. `create-skill-guide.md` and `context-engineering-guidlines.md` (with its `adding-to-` companion) are the authoring rules a new skill must satisfy. `contracts.md`, `research.md`, `implementation-plan.md`, `reasoning-strategies-research.md`, and `utility-interactive-skills.md` hold the remaining background.

### `bin/`

The executable shims npm exposes as commands, each a thin wrapper that delegates into `lib/` or `cli/`. `install.js` is the default entry behind `npx vidbyte-skills`; `vidbyte.js` is the `vidbyte` command skills call to submit authenticated artifacts. `learning.js`, `reasoning.js`, and `roleplay.js` are category installers that preselect a skill bundle rather than the curated default. Keep logic out of this folder — these files exist to resolve an entry point, nothing more.

### `cli/`

The Python command layer: authentication, feedback capture, compression, retention, dry-run validation, and submission of artifacts back to the Vidbyte backend. `router.py` dispatches subcommands and `client.py` is the HTTP client that talks to Vidbyte. This is the runtime half of the repository — it executes while a developer is working with a skill, long after the installer has finished. It is entirely separate from the Node installer under `lib/`.

#### `cli/auth/`

Everything that turns a local machine into an authenticated caller. `config.py` and `session.py` persist and load credentials; `headers.py` and `signature.py` build the authenticated request headers and request signatures; `invocation.py` records how the CLI was invoked so the backend can attribute an artifact; `sanitize.py` strips sensitive values before anything is logged or transmitted. This is the security boundary of the whole package — changes here need review against the CLI backend auth hardening design doc.

#### `cli/commands/`

One module per user-facing verb. `auth.py` handles login and identity; `feedback.py` submits skill feedback; `compressor.py` implements the compression command; `retain.py` implements retention exercises; `agents.py` covers agent-facing surfaces. Each command parses its own arguments and calls into `client.py`, keeping transport out of the command layer. `README.md` documents the command contract for contributors.

#### `cli/constants/`

Fixed values shared across the CLI so they are declared once rather than repeated at call sites. Currently `auth.py`, holding the authentication constants — header names, scheme identifiers, and endpoint fragments — that both `cli/auth/` and `client.py` depend on. If a value is needed in two places, it belongs here.

#### `cli/dataclasses/`

Typed payload shapes for the commands that submit structured data: `compressor.py`, `feedback.py`, and `retain.py`. These define the exact contract the backend expects, so a change here is a change to an API contract and must be matched on the Vidbyte side. Keeping them separate from the command modules is what lets validation happen before any network call is made.

#### `cli/helpers/`

Small shared utilities that do not warrant their own layer. Currently `usage.py`, which renders help and usage text — deliberately factored out because the CLI's help output is itself an agent-facing surface with its own design doc, not incidental formatting. Keep it thin — anything that grows a domain belongs in its own module.

### `docs/`

Design documentation for this repository. Because nearly every skill in `skills/` began as a design doc, this folder doubles as the catalog's rationale: if you want to know what a skill is supposed to do and why it was accepted, look for its doc here before reading its `SKILL.md`. At roughly fifty files it is the largest authored-prose surface in the repository outside `skills/` itself.

#### `docs/design/`

Roughly fifty design docs, one per feature or per skill family. They fall into two groups: repository mechanics (`cli-backend-auth-hardening.md`, `expanded-coding-harness-integrations.md`, `agent-facing-cli-help-and-skills.md`, `critical-thinking-install-flag.md`) and individual skill specifications (`autoreasoner.md`, `anti-passive.md`, `compression-check.md`, `do-not-repeat.md`, `docs-tldr.md`, and many more). Read the relevant doc before changing a skill's behavior.

### `lib/`

The Node installer internals — the actual logic behind `npx vidbyte-skills`, and the counterpart to the Python `cli/`. `installer.js` is the orchestrator; `skill-catalog.js`, `skill-groups.js`, and `skill-versions.js` (with the generated `skill-versions.json`) decide which skills a given invocation selects; `platform-targets.js` resolves the native skill directory for each of the seventeen-plus supported harnesses; `rule-documents.js` generates the per-harness rule files, including AGENTS.md-compatible output. `cli-options.js` parses installer flags, `frontmatter.js` and `skill-validation.js` enforce skill file structure, `install-actions.js` and `install-environment.js` perform and scope the writes, `install-reporter.js` renders the result, and `updater.js` handles upgrades.

### `packages/`

Standalone npm sub-packages that install one curated skill bundle each, so a user can pull a category without pulling the whole catalog. Each is a minimal package — a `package.json` and a `bin/install.js` — that delegates back to the shared installer in `lib/`. This is a distribution concern only; no skill content lives here.

#### `packages/learning/`

The published sub-package for the learning bundle — the version 2 background learning skills, which a user activates once, works through normally, and then ends with that skill's end command to write a learning artifact. Its `package.json` declares the standalone package identity and its `bin/install.js` shim invokes the shared installer with the learning category preselected. No skill content lives here; only the packaging that selects it.

##### `packages/learning/bin/`

Holds the single `install.js` entry point for the learning sub-package. It exists so npm has a binary to expose; the real work happens in the repository's `lib/installer.js`. Do not fork installer behavior into this file.

#### `packages/reasoning/`

The published sub-package for the reasoning bundle — the largest category in `skills/`, covering the reasoning-method and trace skills. Structurally identical to `packages/learning/`: a `package.json` plus a shim that preselects the reasoning category. Kept as a separate package so users who only want reasoning methods do not install the rest.

##### `packages/reasoning/bin/`

Holds the single `install.js` entry point for the reasoning sub-package, mirroring `packages/learning/bin/`. It resolves the entry point and delegates to the shared installer. Nothing category-specific should accumulate here.

### `scripts/`

Validation, smoke testing, packaging, and catalog generation — the gate this repository has instead of a CI workflow, since it ships none. `validate.js` checks every skill's structure and frontmatter; `smoke-test.js`, `cli-smoke-test.js`, and `cli-smoke-test.py` exercise the installer and both CLI surfaces end to end; `cli-security-test.js` and `cli-security-test.py` cover the auth boundary. `build-packages.js` produces the `packages/` sub-packages, and `generate-all-roleplays.js` and `test-roleplay-scenarios-expansion.js` generate and check the roleplay skill family. Run `validate.js` and the smoke tests before opening a PR.

### `skills/`

The source of truth for every installable skill, and 87% of the tracked files in this repository. Each skill is a folder holding a `SKILL.md` and its supporting files; `skills/README.md` documents the catalog categories, authoring rules, and validation expectations. The catalog is dominated by reasoning methods published in graduated depths — most `<method>-trace` skills also ship `-small`, `-medium`, and `-large` variants — alongside learning routines (`sq3r`, `pq4r`, `reap`, `gtd`, `para`), reflection frameworks (`gibbs-reflective-cycle`, `kolb-learning-cycle-trace`), and Vidbyte-specific skills (`vidbyte-auth`, `vidbyte-tutor`, `retain`, `research`). Per the Map's own rule, this folder is listed but **not** expanded: skill files are agent instructions, not repository structure, and enumerating them here would bury the routing information this file exists to carry.

## Command Deck

This section is the run-command reference for this repository's two runtimes — the Node installer and the Python CLI. It is deliberately **not** part of the Map's topology contract above — it exists so nobody burns tokens guessing or searching for an invocation. Each entry is the literal command, what it does, and its notable parameters. Run everything from the repository root. This repository ships no CI workflow, so the local gate is the only gate.

### Repository gates

- `npm test`
  The full gate: skill validation, the installer smoke test, both CLI smoke tests, the CLI security test, and the agent-facing CLI skills check. Run and pass before every PR.
  Params: none (it is a fixed chain in `package.json`).
- `node scripts/validate.js`
  Checks every skill's folder structure and frontmatter against the catalog rules.
  Params: none; the fast loop while authoring a skill.
- `node scripts/smoke-test.js`
  End-to-end smoke test of the installer surface.
  Params: none.
- `node scripts/cli-smoke-test.js`
  Exercises the Python CLI surface end to end from Node.
  Params: none.
- `node scripts/cli-security-test.js`
  Covers the CLI auth boundary (credentials, headers, signatures, redaction).
  Params: none.
- `python scripts/test-agent-facing-cli-skills.py`
  Verifies the agent-facing CLI help and skills surfaces.
  Params: none.
- `node scripts/build-packages.js`
  Regenerates the `packages/` sub-packages after a catalog change.
  Params: none.

### Installer (Node runtime)

- `npx vidbyte-skills`
  The supported one-shot install of the curated version 1 skills into user-level harness directories. Not `npx install vidbyte-skills` — npm parses that as a different command.
  Params: `--version all` install every valid skill; `--version 2` a numbered bundle; or name skills to install only those.
- `npm run install-skills`
  Runs the repository's own installer entry (`bin/install.js`) from a checkout.
  Params: same selection flags as the `npx` form.
- `npx vidbyte-learning-skills --version 2`
  Installs the learning-category sub-package's version 2 background-learning bundle.
  Params: `--version <n>` bundle version.
- `npx vidbyte-reasoning-skills`
  Installs the reasoning-category sub-package (largest category). `vidbyte-roleplay-skills` follows the same shape.
  Params: same selection flags as the main installer.

### Python CLI (auth + artifact submission)

- `python -m cli auth login`
  Authenticates this machine against the Vidbyte backend and stores the session credentials.
  Params: none; interactive. Siblings: `auth logout`, `auth status`.
- `python -m cli agents list`
  Lists the agent-facing skills this CLI knows about.
  Params: none.
- `python -m cli agents get <name>`
  Prints one agent-facing skill's details.
  Params: `<name>` the skill name, e.g. as listed by `agents list`.
- `python -m cli agents path`
  Prints the on-disk path the agent-facing skills resolve from.
  Params: none.
- `python -m cli feedback submit`
  Submits skill feedback to the Vidbyte backend.
  Params: run with `--help` for the payload flags; JSON mode supported.
- `python -m cli compressor submit`
  Submits a compression artifact to the backend.
  Params: run with `--help` for the payload flags.
- `python -m cli retain submit`
  Submits a retention-exercise artifact to the backend.
  Params: run with `--help` for the payload flags.
- `node bin/vidbyte.js <command>`
  The `vidbyte` bin shim — delegates to `python -m cli` from the repository root, trying `python` then `python3` on Windows.
  Params: the same subcommands as `python -m cli`.
