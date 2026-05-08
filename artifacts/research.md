# Coding Harness Skill Standards Research

This document captures the repository context gathered before implementation.

## Core Standard

Most coding harnesses now accept an Agent Skills-style package:

```text
skill-name/
  SKILL.md
  scripts/
  references/
  assets/
```

`SKILL.md` is the required entrypoint. The shared minimum is YAML frontmatter with `name` and `description`, followed by Markdown instructions. Scripts, references, and assets are optional bundled resources.

## Verified Platform Notes

| Platform | User-scope path | Project-scope path | Notes |
| --- | --- | --- | --- |
| Claude Code | `~/.claude/skills/<name>/SKILL.md` | `.claude/skills/<name>/SKILL.md` | Claude Code also supports `.claude/commands/*.md`, but current docs recommend skills because they support bundled files and automatic loading. Skills can be invoked with `/name`. |
| OpenAI Codex | `~/.codex/skills/<name>/SKILL.md` | `.codex/skills/<name>/SKILL.md` | OpenAI's skills catalog describes skills as folders of instructions, scripts, and resources. Codex may use optional `agents/openai.yaml` metadata, but `SKILL.md` is the core. |
| Gemini CLI | `~/.gemini/skills/<name>/SKILL.md` and `~/.agents/skills/<name>/SKILL.md` | `.gemini/skills/<name>/SKILL.md` and `.agents/skills/<name>/SKILL.md` | Gemini CLI discovers both native and `.agents/skills` alias paths. It has `/skills list`, `/skills reload`, and `gemini skills install/link/uninstall`. |
| OpenCode | `~/.config/opencode/skill/<name>/SKILL.md` | `.opencode/skill/<name>/SKILL.md` | OpenCode docs list singular `skill` paths and Claude-compatible paths. Some community docs use plural `skills`; the installer writes both to maximize compatibility. |
| Cursor | `~/.cursor/skills/<name>/SKILL.md` | `.cursor/skills/<name>/SKILL.md` | Cursor added `SKILL.md` skills for dynamic procedural instructions. |
| Hermes Agent | `~/.hermes/skills/<name>/SKILL.md` | Not consistently documented | Hermes exposes installed skills as dynamic slash commands and maintains user skills under `~/.hermes/skills`. |
| Universal alias | `~/.agents/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` | Used by Gemini CLI and increasingly by cross-agent tooling. |
| Windsurf | No canonical Agent Skills path found | `.windsurf/rules/*.md` | Windsurf uses rules rather than `SKILL.md` packages. The installer can generate a project rule file from installed skills. |
| Cline | `~/Documents/Cline/Rules/*.md` | `.clinerules/*.md` | Cline uses Markdown rules and also recognizes Cursor/Windsurf rules and `AGENTS.md`. The installer generates rule files. |
| Continue | Hub rules | `.continue/rules/*.md` | Continue uses rules rather than native `SKILL.md` folders. The installer generates project-local rules. |
| Roo Code | Not consistently documented | `.roo/rules/*.md` | Roo Code uses custom instruction/rule files. The installer generates project-local rules. |

## Sources Consulted

- Claude Code skills docs: https://code.claude.com/docs/en/skills
- Claude Code slash command docs: https://code.claude.com/docs/en/slash-commands
- OpenAI skills catalog: https://github.com/openai/skills
- Gemini CLI skills docs: https://geminicli.com/docs/cli/tutorials/skills-getting-started/
- Gemini CLI skills management docs: https://geminicli.com/docs/cli/using-agent-skills/
- OpenCode skills docs: https://opencode.ubitools.com/skills/
- Cursor skills changelog: https://cursor.com/changelog/2-4
- Hermes skills docs and reference material: https://github.com/NousResearch/hermes-agent
- Windsurf rules docs: https://docs.windsurf.com/windsurf/cascade/memories
- Cline rules docs: https://docs.cline.bot/customization/cline-rules
- Continue rules docs: https://docs.continue.dev/customize/rules

## Research Constraints

The phrase "all coding harness platforms" is open-ended. The first implementation targets the explicit examples from the task plus major documented `SKILL.md` consumers and rule-file based adjacent coding agents found during research. The architecture keeps platform handling isolated so more adapters can be added without changing skill source layout.
