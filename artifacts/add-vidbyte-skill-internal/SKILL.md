---
name: add-vidbyte-skill-internal
description: Use this internal repository skill when adding, updating, or reviewing a skill inside the Vidbyte-Skills repository. It gives Codex the repository-specific architecture, file conventions, installer behavior, validation steps, and pull-request expectations needed to change skills correctly.
---

# Add Vidbyte Skill Internal

## Repository Context
This repository is an npm-distributed skill installer. Installable skills live under `skills/<skill-name>/SKILL.md`; the installer discovers directories automatically, so adding a normal skill should not require editing a registry. Files under `artifacts/` are repository planning and internal guidance artifacts, not installable user skills. Installer code lives in `bin/` and `lib/`, while validation and smoke tests live in `scripts/`.

## Add Or Update A Skill
Create or edit a directory under `skills/` whose name is lowercase hyphen-case and exactly matches the `name` field in `SKILL.md` frontmatter. Every installable skill must start with YAML frontmatter containing only the required `name` and `description` fields unless the repository has intentionally adopted a broader schema. Write the description as the trigger surface: include what the skill does and when Codex should use it. Keep the body procedural and concise, with only the context a future agent would not reliably infer from the user request and codebase.

## Default Versus Reasoning Skills
Reasoning trace skills are token-heavy and are intentionally not part of the default install path. A skill is treated as a reasoning trace skill when its name matches `-trace`, such as `causal-trace`, `causal-trace-small`, or `first-principles-trace-large`. Non-reasoning skills are default skills and are selected by `vidbyte-skills` when no selector is passed. Use the `reasoning` collection only for reasoning trace skills; do not make ordinary skills match the `*-trace*` naming pattern unless they should be excluded from default installs.

## Installer Rules
The installer reads skill folders from the configured skills root, validates selected skills, then copies or links them into requested platform targets. Avoid editing installer code when adding a normal skill; edit installer code only when changing discovery, selection, validation, platform targets, rule-file rendering, or command behavior. Package-style selectors such as `vidbyte-skills/my-skill` and `vidbyte-skill/reasoning` are normalized to their final path segment by `lib/cli-options.js`.

## Required Verification
Run `npm test` after changing skills, installer behavior, validation logic, package metadata, or README usage instructions. Use targeted dry runs when selection behavior changes, for example `node ./bin/install.js --dry-run --platform codex` and `node ./bin/install.js reasoning --dry-run --platform codex`. For skill content changes, inspect at least one representative `SKILL.md` and confirm the frontmatter name, directory name, and trigger description align. For broad generated collections, add or run a structural audit that checks every affected skill rather than relying only on spot checks.

## Pull Request Checklist
Keep changes scoped to the requested skill or installer behavior. Update `README.md` when user-visible install commands, selectors, defaults, or authoring rules change. Include the test commands and any targeted audit output in the PR body. If the branch depends on another open PR, base the new PR on that branch so reviewers can see only the incremental changes.
