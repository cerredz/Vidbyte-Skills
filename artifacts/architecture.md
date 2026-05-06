# Repository Architecture

## Goal

Create one source-of-truth skill repository that can be installed into multiple coding harnesses with one command.

## Minimal Structure

```text
vidbyte-skills/
  artifacts/
    research.md
    architecture.md
    implementation-plan.md
  bin/
    install.js
  scripts/
    smoke-test.js
    validate.js
  skills/
    .gitkeep
  package.json
  README.md
```

## Design

Skills live only in `skills/<name>/SKILL.md`. Adding a skill should not require registration in code.

The installer has three responsibilities:

1. Discover skill directories under `skills/`.
2. Validate basic `SKILL.md` shape before copying.
3. Install each skill to selected platform destinations or generated rule files.

Platform-specific logic is isolated in a destination registry inside `bin/install.js`. Each platform adapter owns path construction, compatibility aliases, and whether it receives copied skill folders or a generated Markdown rule file. This keeps the repository flat while making new harness support a small additive change.

## Link Target

The repository is linked to:

https://github.com/cerredz/Vidbyte-Skills

This link appears in `package.json` repository metadata, `README.md`, and the local git remote named `origin`.

## Install Modes

Default behavior copies skills because it works consistently across Windows, macOS, Linux, npm package installs, and agents that do not follow symlinks reliably.

An optional `--mode link` mode is included for local development. On Windows, directory links use junctions.

## Scope

The installer supports:

- `--scope user`: global tool locations under the user's home directory.
- `--scope project`: project-local config folders under the current working directory.
- `--scope both`: user and project locations.

Default scope is `user`.

## Rule-Based Harnesses

Some harnesses do not have a verified `SKILL.md` package location. For those, the installer flattens discovered skills into one generated Markdown rule document:

- Windsurf: `.windsurf/rules/vidbyte-skills.md`
- Cline user scope: `~/Documents/Cline/Rules/vidbyte-skills.md`
- Cline project scope: `.clinerules/vidbyte-skills.md`
- Continue project scope: `.continue/rules/vidbyte-skills.md`
- Roo Code project scope: `.roo/rules/vidbyte-skills.md`
