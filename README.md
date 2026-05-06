# Vidbyte Skills

Install Vidbyte Agent Skills across coding harnesses from one source directory.

Repository: https://github.com/cerredz/Vidbyte-Skills

## Install

From this repository:

```bash
npm run install-skills
```

From GitHub with npm:

```bash
npx github:cerredz/Vidbyte-Skills
```

By default, the installer copies every skill under `skills/` to user-level locations for Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Hermes, Cline, and the universal `.agents` alias.

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

## Installer Options

```bash
vidbyte-skills --scope user
vidbyte-skills --scope project
vidbyte-skills --scope both
vidbyte-skills --platform claude-code,codex,gemini
vidbyte-skills --mode link
vidbyte-skills --dry-run
```

Supported platforms:

```text
claude-code, codex, gemini, opencode, cursor, hermes, universal, windsurf, cline, continue, roo-code
```

Windsurf, Continue, and Roo Code are project-scoped rule integrations. Cline supports both user and project rules. These rule integrations flatten `skills/` into a generated Markdown rule file.

## Verify

```bash
npm test
```

The smoke test installs a fixture skill into temporary home and project directories, then checks that the expected files were created.
