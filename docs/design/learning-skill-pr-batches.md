# Design Doc: Reviewed Background Learning Skills

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

## Overview

This replacement PR keeps only the background learning skills that received review comments on PR #40. The prior draft proposed a 25-skill background batch, but review direction clarified that commented skills are the ones to retain and the rest should be removed from this PR.

## Goals

- Keep and revise `concept-coverage`.
- Rename `memory-prompts` to `question-builder`.
- Keep and revise `struggle`.
- Keep and revise `transfer-signals`.
- Add the requested context-engineering artifact sections for `definition` and `things to look for`.
- Use JSON-backed local background artifacts for the kept skills.

## Non-Goals

- Do not include the unreviewed background skills from the earlier draft.
- Do not add backend routes, CLI commands, authentication behavior, or external service calls.
- Do not expose hidden chain-of-thought in skill outputs or local artifacts.
- Do not add README files inside individual skill folders.

## File Manifest

Files added in this PR:

- `artifacts/context-engineering-guidlines.md`
- `docs/design/learning-skill-pr-batches.md`
- `skills/concept-coverage/SKILL.md`
- `skills/question-builder/SKILL.md`
- `skills/struggle/SKILL.md`
- `skills/transfer-signals/SKILL.md`

Files intentionally not included from the original draft:

- `skills/autonomy-score/SKILL.md`
- `skills/bottleneck-log/SKILL.md`
- `skills/calibration-log/SKILL.md`
- `skills/confidence-mismatch/SKILL.md`
- `skills/confusion-ledger/SKILL.md`
- `skills/debugging-patterns/SKILL.md`
- `skills/decision-drift/SKILL.md`
- `skills/explanation-debt/SKILL.md`
- `skills/feedback-themes/SKILL.md`
- `skills/focus-switches/SKILL.md`
- `skills/hesitation-map/SKILL.md`
- `skills/learning-dependencies/SKILL.md`
- `skills/learning-momentum/SKILL.md`
- `skills/memory-prompts/SKILL.md`
- `skills/misconception-near-misses/SKILL.md`
- `skills/practice-opportunities/SKILL.md`
- `skills/question-quality/SKILL.md`
- `skills/recovery-patterns/SKILL.md`
- `skills/recurring-errors/SKILL.md`
- `skills/retrieval-gaps/SKILL.md`
- `skills/tool-friction/SKILL.md`
- `skills/vocabulary-growth/SKILL.md`

## Skill Design

Each retained skill is a prompt-level background observer. The skill activates only through its slash command, stays silent during normal work, maintains session-local state, writes a local JSON file on finalization, and can return the accumulated notes when the user asks for them.

`concept-coverage` tracks how much conceptual depth appears in the user's prompts. It initializes a JSON file with an explanation of the active topic, then logs missing depth-specific details and concept coverage signals.

`question-builder` replaces `memory-prompts`. It tracks two question types: retention questions that reinforce memory of the conversation and future questions that show where the user can go next.

`struggle` tracks repeated struggle patterns and common blind spots. It includes a "Things To Look For" section so the model has concrete observation targets rather than a vague instruction to notice struggle.

`transfer-signals` tracks concepts across fields and moments where the user fails to apply transfer learning. It defines transfer learning in the skill body because the phrase can otherwise be interpreted too broadly.

## Testing

Run:

```text
npm test
```

Manual review should confirm:

- Every added skill has matching hyphen-case frontmatter and folder name.
- No unreviewed background skills remain in the PR.
- Each retained skill has identity, expanded two-paragraph intuition and goal sections, internal monologue, JSON artifact behavior, and a success checklist.
- `concept-coverage` includes 20+ examples of user question, model attention, and background-log entry.
- `struggle` includes 20+ things to look for.
- `question-builder` uses the new skill name and command and includes 25+ examples.
- `transfer-signals` includes a transfer-learning definition.
