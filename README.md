# Vidbyte Skills

Vidbyte Skills is a portable skill installer for local coding harnesses. The repository owns the skill source files under `skills/`; the installer copies or links those skills into the filesystem locations that Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Hermes, Cline, Continue, Roo Code, Windsurf, and `.agents`-compatible tools read from.

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
```

Rule-file integrations receive a generated Markdown rule file that flattens the selected skills into one document:

```text
Windsurf: <project>/.windsurf/rules/vidbyte-skills.md
Cline: ~/Documents/Cline/Rules/vidbyte-skills.md or <project>/.clinerules/vidbyte-skills.md
Continue: <project>/.continue/rules/vidbyte-skills.md
Roo Code: <project>/.roo/rules/vidbyte-skills.md
```

Hermes is user-scoped only. Windsurf, Continue, and Roo Code are project-scoped only. Cline supports both user and project rules.

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

## Verify

```bash
npm test
```

The test suite validates skill metadata and runs a smoke test that installs a fixture skill into temporary home and project directories.
