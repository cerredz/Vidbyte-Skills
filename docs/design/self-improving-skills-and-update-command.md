# Design Doc: Self-Improving Skills + `vidbyte update` Command

**Status:** Approved
**Author:** Antigravity
**Created:** 2026-05-20
**Last Updated:** 2026-05-20

---

## 1. Overview

This feature adds two things to `vidbyte-cli`:

1. **Self-Improving Section** — A standardized `## Self-Improving` section appended to the bottom of every non-reasoning, non-background v1 learning skill file. The section instructs the AI agent running the skill to append UX-level observations (output shape, diction, formatting preferences) after each session where the user reacts meaningfully. It does **not** change core skill logic or output structure — only surface-level language and presentation.

2. **`vidbyte update` Command** — A new CLI command (`vidbyte-skills update` or `npx vidbyte-skills update`) that updates the locally installed vidbyte-skills package to the most recent version published to npm, then re-runs the skill installer so all harnesses reflect the new skills automatically.

---

## 2. Goals & Non-Goals

### Goals

- Add a `## Self-Improving` section to all targeted learning skill `SKILL.md` files.
- The section must clearly instruct the agent to append UX learnings — wording, diction, output shape — not change core logic.
- Each skill's self-improving section must be skill-specific (referencing the skill's actual output shape and interaction style).
- Add a `vidbyte update` CLI command that self-updates the package and reinstalls skills.
- The update command must work from `vidbyte-skills update` (npm bin) invocation.
- The update command must print clear progress: checking version, downloading, reinstalling.

### Non-Goals

- The self-improving section does NOT instruct the agent to change core skill logic, scoring rules, activation rules, or output structure.
- The self-improving section does NOT apply to reasoning trace skills (`*-trace`, `*-trace-large`, etc.).
- The self-improving section does NOT apply to `anti-passive` (pure silent background skill with no user-facing output shape to tune).
- The update command does NOT migrate or upgrade user configuration, auth tokens, or `.env` files.
- The update command does NOT support downgrading to a specific version.

---

## 3. Background & Context

The user is building the Vidbyte learning skill ecosystem and wants two capabilities:

1. **Self-improvement loop**: Skills should evolve based on real usage. The self-improving section creates a lightweight protocol for the AI agent to append what it learned about UX preferences each session.

2. **Easy updates**: Users should be able to run one command to get the latest version installed across all their harnesses.

---

## 4. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| MODIFY | `skills/no-assumptions/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/question/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/explain-away-others/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/mental-model/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/practice/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/do-not-repeat/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/question-builder/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/struggle/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/transfer-signals/SKILL.md` | Add `## Self-Improving` section |
| MODIFY | `skills/concept-coverage/SKILL.md` | Add `## Self-Improving` section |
| CREATE | `lib/updater.js` | New update logic module |
| MODIFY | `bin/install.js` | Route `argv[0] === "update"` to updater |
| MODIFY | `cli/helpers/usage.py` | Add `vidbyte update` to help text |
| MODIFY | `README.md` | Document `vidbyte-skills update` |

**Totals:** 1 new file, 13 modifications, 0 deletions.
