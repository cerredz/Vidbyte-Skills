# Vidbyte Skills

Vidbyte Skills is a portable skill installer for local coding harnesses. The repository owns the skill source files under `skills/`; the installer copies or links those skills into native skill directories and writes generated rule files for Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Hermes, GitHub Copilot, Warp, Factory, Crush, Aider, Augment, Cline, Continue, Roo Code, Windsurf, and AGENTS.md-compatible tools.

Repository: https://github.com/cerredz/Vidbyte-Skills

## Intended Behavior

Run the installer from `npx`, npm scripts, or the package binary. By default it installs every valid skill from this repository into user-level harness directories on the local machine. You can also name one or more skills to install only those skills.

After installation, open or reload your coding harness. The skills are available from that harness according to its normal local skill or rule discovery behavior.

## Install All Skills

From npm after the package is published:

```bash
npx vidbyte-skills
```

From this GitHub repository:

```bash
npx github:cerredz/Vidbyte-Skills
```

From a local checkout:

```bash
npm run install-skills
```

`npx install vidbyte-skills` is not a supported npm invocation form; npm interprets that as running a separate command named `install`, not this package. The package-supported one-shot command is `npx vidbyte-skills`.

## Install Specific Skills

Pass skill names as positional arguments:

```bash
npx vidbyte-skills my-skill
npx vidbyte-skills my-skill other-skill
```

Or use `--skill` with a comma-separated list:

```bash
npx vidbyte-skills --skill my-skill,other-skill
```

For GitHub installs before npm publication:

```bash
npx github:cerredz/Vidbyte-Skills my-skill
```

The selector may also include a package-style prefix such as `vidbyte-skills/my-skill`; the installer uses the final path segment as the skill name.

## Installer Options

```bash
vidbyte-skills [skill-name ...] [options]

--scope user
--scope project
--scope both
--platform claude-code,codex,gemini
--skill my-skill,other-skill
--mode copy
--mode link
--dry-run
```

Defaults:

```text
scope: user
platform: all
skill selection: all skills
mode: copy
```

Supported platforms:

```text
claude-code, codex, gemini, opencode, cursor, hermes, universal, windsurf, cline, continue, roo-code
github-copilot, vscode-copilot, copilot-cli, warp, factory, crush, openclaw, aider
augment-code, auggie, kilo-code, jules, zed, replit-agent, devin, openhands
qwen-code, gemini-memory, jetbrains-ai, junie, kiro, amp, piebald, open-harness, agents-md
```

## Vidbyte CLI

This package also exposes a `vidbyte` command for skill-to-backend submissions. Skills should call the CLI instead of constructing backend requests directly in prompt text.

```bash
vidbyte feedback submit --file feedback-log-2026-05-11-example.md --domain software-engineering --conversation-id example
```

The CLI is implemented in Python (stdlib only, no dependencies). It signs requests with `VIDBYTE_SKILL_SECRET`, sends traffic only to `https://vidbyte.pro`, and adds the Vidbyte skill authentication headers. Copy `.env.example` to `.env` for local development; real `.env` files are ignored by git.

Use `--dry-run` to validate command input without sending a network request:

```bash
vidbyte feedback submit --file feedback-log.md --domain software-engineering --conversation-id local-test --dry-run
```

The CLI can also be invoked directly via Python:

```bash
python3 -m cli feedback submit --file feedback-log.md --domain software-engineering --conversation-id local-test --dry-run
```

## Install Locations

Skill-directory integrations receive a copy or symlink of each selected skill folder:

```text
Claude Code: ~/.claude/skills or <project>/.claude/skills
Codex: ~/.codex/skills or <project>/.codex/skills
Gemini CLI: ~/.gemini/skills or <project>/.gemini/skills
OpenCode: ~/.config/opencode/skill, ~/.config/opencode/skills, <project>/.opencode/skill, or <project>/.opencode/skills
Cursor: ~/.cursor/skills or <project>/.cursor/skills
Hermes: ~/.hermes/skills
Universal: ~/.agents/skills or <project>/.agents/skills
GitHub Copilot / VS Code Copilot / Copilot CLI: ~/.copilot/skills or <project>/.github/skills
Warp: ~/.warp/skills or <project>/.warp/skills
Factory Droid: ~/.factory/skills or <project>/.factory/skills
Crush: ~/.config/crush/skills, %LOCALAPPDATA%/crush/skills on Windows, or <project>/.crush/skills
OpenClaw: ~/.openclaw/skills or <project>/skills
```

Rule-file integrations receive a generated Markdown rule file that flattens the selected skills into one document:

```text
Windsurf: <project>/.windsurf/rules/vidbyte-skills.md
Cline: ~/Documents/Cline/Rules/vidbyte-skills.md or <project>/.clinerules/vidbyte-skills.md
Continue: <project>/.continue/rules/vidbyte-skills.md
Roo Code: <project>/.roo/rules/vidbyte-skills.md
Augment Code / Auggie: ~/.augment/rules/vidbyte-skills.md or <project>/.augment/rules/vidbyte-skills.md
```

Managed instruction-file integrations insert or replace only the block between `<!-- vidbyte-skills:start -->` and `<!-- vidbyte-skills:end -->`, preserving existing project instructions outside that block:

```text
AGENTS.md-compatible tools: ~/AGENTS.md or <project>/AGENTS.md
GitHub Copilot instructions: <project>/.github/copilot-instructions.md
Aider: ~/CONVENTIONS.md or <project>/CONVENTIONS.md, plus .aider.conf.yml read configuration when safe
Augment guidelines: <project>/.augment-guidelines
Kilo Code: ~/.config/kilo/AGENTS.md or <project>/AGENTS.md
Zed: <project>/.rules
Replit Agent: <project>/replit.md
OpenHands: <project>/.openhands/microagents/repo.md
Qwen Code: <project>/QWEN.md
Gemini memory: ~/GEMINI.md or <project>/GEMINI.md
Junie: <project>/.junie/guidelines.md
Kiro: <project>/.kiro/guidelines.md
```

Hermes is user-scoped only. Windsurf, Continue, Roo Code, Jules, Zed, Replit Agent, OpenHands, Qwen Code, JetBrains AI, Junie, Kiro, Amp, Piebald, and Open Harness are project-scoped only. Cline supports both user and project rules. `--scope user --platform agents-md` writes a managed block to `~/AGENTS.md`; use `--scope project` if you only want repository-local instructions.

## Add A Skill

Create a folder under `skills/` with a `SKILL.md` file:

```text
skills/my-skill/
  SKILL.md
  scripts/
  references/
  assets/
```

`SKILL.md` must start with frontmatter:

```markdown
---
name: my-skill
description: Use this skill when the user asks for the specific workflow it handles.
---

# My Skill

Follow these steps:

1. Do the first thing.
2. Do the second thing.
3. Use `$ARGUMENTS` when the harness passes direct invocation arguments.
```

The skill name must be lowercase hyphen-case and must match the folder name.

For a deeper guide to choosing and authoring reasoning trace, prompt, and background/CLI-backed skills, see `artifacts/create-skill-guide.md`.

## Reasoning Trace Skills

This repository includes a generated collection of 100+ reasoning trace strategies, each with default, small, medium, and large slash-skill variants under `skills/`.
Each trace skill writes a public scratchpad to `memory/{question_name}.md` and uses approximate scale targets rather than fixed quotas: small is around 25 numbered lines, medium and default are around 100 numbered lines, and large is around 500+ numbered lines when the question justifies that depth.
The committed `SKILL.md` files are the source of truth for the collection; update those files directly when improving a reasoning trace.

## Verify

```bash
npm test
```

The test suite validates skill metadata and runs a smoke test that installs a fixture skill into temporary home and project directories.
