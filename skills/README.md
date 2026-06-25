# Vidbyte Skills Catalog

The `skills/` directory is the source of truth for installable Vidbyte skills.
Each skill is a portable Markdown workflow that can be copied or linked into
local coding harnesses such as Claude Code, Codex, Gemini CLI, Cursor, Warp, and
AGENTS.md-compatible tools.

## Role In The Repository

Skills are the content layer of Vidbyte Skills. The Node installer discovers
valid skill directories, filters them by name, category, and version, then
installs the selected folders or generated rule files into target harnesses.
The Python `vidbyte` CLI handles authenticated submissions for skills that need
to send artifacts back to Vidbyte.

## Design Philosophy

Skills should be inspectable, portable, and local-first. A skill is just a
folder with a `SKILL.md` file and optional supporting assets. The catalog is
validated before release so installed instructions are predictable across
harnesses.

The prompt should own task-specific reasoning and artifact generation. Code owns
filesystem installation, manifest validation, session handling, and backend
transport.

## Invocation Safety (all skills that call the CLI)

Any skill that invokes the `vidbyte` / `vidbyte-skills` CLI with content derived from the
conversation MUST pass each value as its own discrete argument (argv-array form), and MUST
NOT build a single shell-command string by interpolating user- or model-generated text.
Conversation content can contain quotes, `$(...)`, backticks, or newlines; interpolating it
into a shell string risks arbitrary command execution on the user's machine. Let the CLI
receive each argument verbatim.

## Usage

Install every default skill:

```bash
npx vidbyte-skills
```

Install selected skills:

```bash
npx vidbyte-skills --skill retain,feedback-route
npx vidbyte-skills retain feedback-route
```

Install category-specific packages when the binary is available:

```bash
npx vidbyte-learning-skills
npx vidbyte-reasoning-skills
npx vidbyte-roleplay-skills
```

## Skill Shape

Every skill lives at `skills/<skill-name>/SKILL.md`. The folder name and
frontmatter `name` must match and use lowercase hyphen-case.

```markdown
---
name: my-skill
description: Use this skill when the user asks for a focused workflow.
---

# My Skill

Follow these steps:

1. Clarify the task boundary.
2. Produce the requested artifact.
3. Verify the result before handing it back.
```

Optional supporting folders can sit beside `SKILL.md`:

```text
skills/my-skill/
|-- SKILL.md
|-- references/
|-- scripts/
`-- assets/
```

## Catalog Categories

`skills-manifest.json` groups skills into release and product categories:

- `learning`: learning, tutoring, retention, feedback, and study workflows.
- `reasoning`: reusable reasoning traces, decision frameworks, and analysis strategies.
- `utility`: workflow helpers and general-purpose support skills.
- `roleplay`: scenario-based practice skills with roleplay content.

`lib/skill-catalog.js` discovers skill folders and reads frontmatter.
`lib/skill-versions.json` controls version-tier filtering. `scripts/validate.js`
checks frontmatter, manifest registration, and version manifest references.

## Key Files

- `skills-manifest.json`: category membership.
- `lib/skill-catalog.js`: discovery, selection, category filtering, and version filtering.
- `lib/installer.js`: install orchestration for selected skills.
- `scripts/validate.js`: structural catalog validation.
- `scripts/smoke-test.js`: installer behavior verification across simulated targets.

## Related Flows

Use [`cli/commands`](../cli/commands/README.md) for the authenticated command
layer that skills call when they need to submit feedback, retention, or
compression artifacts.
