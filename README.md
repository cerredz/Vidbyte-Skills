# Vidbyte Skills

Vidbyte helps developers package reusable agent workflows, learning routines, and
reasoning methods as portable skills. Vidbyte Skills is the repository and npm
package that installs those skills into local coding harnesses and also ships
the `vidbyte` command used by skills to submit authenticated artifacts back to
Vidbyte. Coding agents need local, versioned instructions that are more precise
than a general prompt — Vidbyte Skills packages those instructions as auditable
Markdown folders, installs them into the harnesses developers already use, and
keeps the authenticated network boundary in code rather than prompt text.

The repository owns the skill source files under `skills/`; the installer copies
or links those skills into native skill directories and writes generated rule
files for Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Hermes, GitHub
Copilot, Warp, Factory, Crush, Aider, Augment, Cline, Continue, Roo Code,
Windsurf, and AGENTS.md-compatible tools.

Repository: https://github.com/cerredz/Vidbyte-Skills

## Repository Map

| Area | Role |
|------|------|
| [`skills/`](skills/README.md) | Source of truth for installable skills, catalog categories, authoring rules, and validation expectations |
| [`cli/commands/`](cli/commands/README.md) | Python command layer for auth, feedback, compression, retention, dry-run validation, and backend submission |
| `lib/` | Node installer internals for skill discovery, catalog filtering, target resolution, and install actions |
| `bin/` | Package binary shims for `vidbyte`, `vidbyte-skills`, category installers, and roleplay installers |
| `scripts/` | Validation, smoke testing, packaging, and catalog-generation scripts |

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

## Install Version 2 Background Learning Skills

Version 2 is the background learning bundle. Activate one of these skills once,
work normally through the conversation, then use that skill's end command to
write the learning artifact.

```bash
npx vidbyte-skills --version 2
npx vidbyte-learning-skills --version 2
```

Included skills:

| Skill | Command | What it tracks |
|-------|---------|----------------|
| concept-coverage | `/concept-coverage` | Maps what you understand versus the gaps you skipped past |
| question-builder | `/question-builder` | Builds retention and next-step questions so you leave with something to study |
| struggle | `/struggle` | Tracks recurring struggle points so repeated patterns are visible |
| transfer-signals | `/transfer-signals` | Catches moments where a pattern you already know could transfer to the current problem |
| misconceptions | `/misconceptions` | Watches for faulty mental models and logs them before you close the session |

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
--version 1
--version 2
--version all
--mode copy
--mode link
--dry-run
```

Defaults:

```text
scope: user
platform: all
skill selection: all skills
skills version: 1
mode: copy
```

Supported platforms:

```text
claude-code, codex, gemini, opencode, cursor, hermes, universal, windsurf, cline, continue, roo-code
github-copilot, vscode-copilot, copilot-cli, warp, factory, crush, openclaw, aider
augment-code, auggie, kilo-code, jules, zed, replit-agent, devin, openhands
qwen-code, gemini-memory, jetbrains-ai, junie, kiro, amp, piebald, open-harness, agents-md
```

## Updating Skills

Run the update command to pull the latest published version of `vidbyte-skills` from npm and reinstall all skills into your harnesses automatically:

```bash
vidbyte-skills update
```

Or via npx without a local install:

```bash
npx vidbyte-skills update
```

The update command:
1. Reads your current installed version from `package.json`.
2. Fetches the latest version from the npm registry.
3. Exits cleanly with "Already up to date" if no new version is available.
4. Runs `npm install --global vidbyte-skills@latest` if a newer version exists.
5. Reinstalls all skills into your harnesses using the installer defaults (user scope, all platforms, version 1).

## Vidbyte CLI

This package also exposes a `vidbyte` command for skill-to-backend submissions. Skills should call the CLI instead of constructing backend requests directly in prompt text.

```bash
vidbyte feedback submit --file feedback-log-2026-05-11-example.md --domain software-engineering --conversation-id example
```

The `/retain` skill uses an argument-shaped command so the model can pass the generated exercise fields directly:

```bash
vidbyte retain --title "Retain this session" --domain software-engineering --conversation-id example --concept1-name "CLI auth boundary" --concept1-distillation "The prompt generates content while the CLI owns authenticated transport." --concept1-anchor "A locked dispatch box with a public label and a short-lived pass inside." --concept1-hook "This matches short-lived deployment credentials, where the long-lived account session only mints scoped one-use credentials." --question1 "Why should the prompt not construct Vidbyte auth headers itself?" --answer1 "A strong answer says prompt text is not a trust boundary, while the CLI keeps account sessions and requests short-lived invocation tokens in code."
```

The CLI is implemented in Python (stdlib only, no dependencies). It authenticates with a Vidbyte session, mints short-lived invocation tokens for backend writes, sends traffic only to `https://vidbyte.pro`, and never asks prompts to construct auth headers. Copy `.env.example` to `.env` for local development; real `.env` files are ignored by git.

Use `--dry-run` to validate command input without sending a network request:

```bash
vidbyte feedback submit --file feedback-log.md --domain software-engineering --conversation-id local-test --dry-run
vidbyte retain --concept1-name "Concept" --concept1-distillation "Mechanism" --concept1-anchor "Vivid image" --concept1-hook "Personal hook" --question1 "Question?" --answer1 "Answer key" --dry-run
```

The CLI can also be invoked directly via Python:

```bash
python3 -m cli feedback submit --file feedback-log.md --domain software-engineering --conversation-id local-test --dry-run
python3 -m cli retain --concept1-name "Concept" --concept1-distillation "Mechanism" --concept1-anchor "Vivid image" --concept1-hook "Personal hook" --question1 "Question?" --answer1 "Answer key" --dry-run
```

## Agent Usage Guides

The `vidbyte` command also serves bundled agent-facing usage guides so coding agents can load instructions that match the installed CLI version.

```bash
vidbyte agents
vidbyte agents get core
vidbyte agents get core --full
vidbyte agents get core --json
```

`vidbyte agents` only serves CLI usage instructions. Use `vidbyte-skills` to install product skills into local coding harnesses.

For development and tests, set `VIDBYTE_AGENT_SKILLS_DIR` to point at an alternate agent guide directory.

## Skills

### Learning

Skills for active learning, comprehension, retention, and research.

| Skill | Command | Description |
|-------|---------|-------------|
| blindspots | `/blindspots` | Surfaces hidden principles, tradeoffs, or considerations the user hasn't named yet using targeted guiding questions |
| compression-check | background | Silent background coach that asks you to explain what you just built; evaluates your response and submits a learning record to Vidbyte |
| concept-coverage | `/concept-coverage` | Background tracker that monitors how deeply you engage with a concept; export as a JSON learning artifact at end of session |
| daily-review | `/daily-review` | Extracts high-risk session concepts at end of a work session, appends them to a log, and sends them to Vidbyte for spaced review |
| explain | `/explain` | Rebuilds explanations from first principles; diagnoses which understanding layer is broken and fills from the lowest solid floor |
| explain-away-others | `/explain-away-others` | Before accepting your approach, identifies 2–3 competitive alternatives and requires mechanism-level explanations for why each fails |
| feedback-generator | `/feedback` | Multi-agent harness that generates expert domain feedback grounded in 180+ learning-science papers through iterative self-refinement |
| find-papers | `/find-papers` | Searches for academic papers via plain-language prompt, filters by credible databases, and returns a clean formatted list |
| finding-resources | `/find-resource` | Produces a comprehensive learning-resource map across books, papers, courses, and practitioner writing for any topic |
| jargon | `/jargon` | Surfaces domain-specific jargon, translates to plain language, and builds vocabulary before engaging a technical topic |
| learn-from-video | `/learn-from-video` | Browser-controlled active learning session for a YouTube video with transcript-based segment planning and checkpoint questions |
| misconceptions | `/misconceptions` | Silently tracks faulty mental models during the session and writes an end-of-session misconception log |
| motivate | `/motivate` | Delivers one non-repeated motivational learning quote and logs it so it is never shown again |
| my-knowledge | `/my-knowledge` | Scans the session to give an honest assessment of genuine understanding vs. context-dependent familiarity |
| practice | `/practice` | Creates high-volume practice questions that emphasize pattern recognition, variation, and creative intelligence |
| question | `/question` | Produces detailed five-section answers (What, Why, Critical Thinking, Best Practices, Resources) to counter shallow responses in coding harnesses |
| question-builder | `/question-builder` | Background tracker that logs retention and future-direction questions throughout the session; export as a JSON artifact |
| read-paper | `/read-paper` | Reads a research paper (arXiv, DOI, PDF, Semantic Scholar, PubMed), strips noise, extracts a 6-field core signal, and runs a learning gate check |
| research | `/research` | Answers grounded in verified knowledge with explicit source attribution and epistemic labeling on every claim; peer-reviewed sources only |
| retain | `/retain` | Pauses the conversation, generates a 15-minute retention exercise from the session, and submits it to Vidbyte |
| scope | `/scope` | Defines the boundaries of broad domains, highlighting core, adjacent, and commonly misattributed fields |
| struggle | `/struggle` | Background tracker that logs repeated struggle patterns and blind-spot signals throughout the session; export as a JSON artifact |
| theoretical-feedback | `/theoretical-feedback` | Extracts the underlying mental model separating novices from experts for any situation or mistake in any domain |
| transfer-signals | `/transfer-signals` | Background tracker that logs cross-field concept connections and missed transfer-learning opportunities |
| vidbyte-auth | `/vidbyte-auth` | Authenticates the Vidbyte CLI with your account to enable saved analysis results and persisted preferences |
| vidbyte-tutor | `/vidbyte-tutor` | Orchestrator for all non-reasoning learning skills; routes to the best skill, explains the selection, and follows the skill's workflow |
| visualize | `/visualize` | Renders visual explanations in Unicode box art; auto-routes to concept maps, layered architectures, sequence flowcharts, or analogy mappings |

### Utility

| Skill | Command | Description |
|-------|---------|-------------|
| docs-tldr | `/docs-tldr <library>` | Fetches official documentation for any library and produces a minimal cheat sheet: 5 core concepts, 10 common operations with code, 3 common mistakes, and a navigation map |
| unit | `/unit <topic>` | Decomposes a large complex subject into its smallest meaningful atomic components; pure decomposition, no roadmap |

### Roleplay

| Skill | Command | Description |
|-------|---------|-------------|
| roleplay | `/roleplay` | Character simulation for practicing real-world interpersonal scenarios: job interviews, difficult conversations, salary negotiation, feedback delivery, cold pitching |
| create-roleplay | `/create-roleplay` | Creates a new roleplay scenario for use with `/roleplay`; generates `scenario.md` and `rubric.md` and registers the scenario |

### Reasoning Trace Skills

This repository includes a generated collection of 100+ reasoning trace strategies, each with default, small, medium, and large slash-skill variants under `skills/`.
Each trace skill writes a public scratchpad to `memory/{question_name}.md` and uses approximate scale targets rather than fixed quotas: small is around 25 numbered lines, medium and default are around 100 numbered lines, and large is around 500+ numbered lines when the question justifies that depth.
The committed `SKILL.md` files are the source of truth for the collection; update those files directly when improving a reasoning trace.

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

## Verify

```bash
npm test
```

The test suite validates skill metadata and runs a smoke test that installs a fixture skill into temporary home and project directories.
