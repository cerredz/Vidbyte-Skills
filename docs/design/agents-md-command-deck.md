# Design Doc: AGENTS.md Command Deck

**Status:** Draft
**Author:** opencode (design-doc-no-tests workflow)
**Created:** 2026-08-17
**Last Updated:** 2026-08-17

---

## 1. Overview

Add a **Command Deck** section to the root `AGENTS.md`: the verified commands an agent needs to validate, test, build, install, and use this repository's two runtimes (the Node installer and the Python CLI), so no session is spent guessing invocations. Each entry is the literal command, a 1-2 sentence description, and the command's key parameters.

## 2. Goals & Non-Goals

### Goals
- One top-level `## Command Deck` section appended to `AGENTS.md`, after the File Index.
- Subsections: Repository gates, Installer (npm/npx), and the Python CLI (`vidbyte` / `python -m cli`).
- Every entry: actual command + 1-2 sentence description + key params.
- Every command verified against `package.json`, `scripts/`, `bin/`, `cli/commands/`, and `README.md`.

### Non-Goals
- No changes to any file other than `AGENTS.md`.
- No changes to the Map (File Index) content or conventions.
- No new scripts; this repository ships no CI workflow, and that does not change.

## 3. Background & Context

`AGENTS.md` is currently only on the open PR branch `feat/agents-md-repository-map` (PR #119); this branch stacks on it. The repository has two runtimes that share no call path: a Node installer (`npm test` runs validate + three smoke/security scripts + one Python script as the full gate, since no CI workflow exists) and a Python CLI invoked as `python -m cli` from the repo root (the `bin/vidbyte.js` shim delegates to exactly that), exposing `auth login|logout|status`, `agents list|get|path`, and the `feedback`, `compressor`, and `retain` submit commands.

## 4. Requirements

### Functional Requirements
1. `AGENTS.md` gains exactly one new top-level section, `## Command Deck`, placed after the File Index.
2. The section opens with a one-paragraph note stating it is a run-command reference, deliberately outside the Map's topology contract.
3. The gates subsection reproduces the `npm test` chain and each gate script individually (`validate.js`, `smoke-test.js`, `cli-smoke-test.js`, `cli-security-test.js`, `test-agent-facing-cli-skills.py`).
4. The installer subsection covers `npm run install-skills`, `npx vidbyte-skills` with `--version` modes, and the `vidbyte-learning-skills` / `vidbyte-reasoning-skills` category packages.
5. The CLI subsection covers `python -m cli` (and the `vidbyte` bin shim) for auth, agents, and the three submit commands.
6. The unsupported form `npx install vidbyte-skills` is called out as an error to avoid, since `README.md` documents agents tripping on it.

### Non-Functional Requirements
- Scannable entries: command line, at most two sentences, one params line.
- Correct GitHub Markdown rendering; no encoding hazards.

## 5. High-Level Design

Appended content, not Map content; the Map blockquote is untouched and the deck carries its own scope note. Entries are ordered: gates (the PR-blocking checks), installer surface, then the runtime CLI.

```
AGENTS.md
  ...existing Map...
  ## Command Deck        <- new
    ### Repository gates (npm test and its parts)
    ### Installer (npx vidbyte-skills and friends)
    ### Python CLI (python -m cli / vidbyte)
```

## 6. Detailed Design

### 6.x AGENTS.md Command Deck section

**File(s):** `AGENTS.md`
**Type:** Modified (append one section)

#### Content decisions
- Gates: `npm test` first as the full chain, then each script alone for narrow iteration, then `node scripts/build-packages.js` for regenerating `packages/`.
- Installer: `npx vidbyte-skills`, `--version all|1|2|5`, named-skill installs, and the category sub-packages, all verified from `README.md`.
- CLI: `python -m cli auth login|logout|status`, `python -m cli agents list|get <name>|path`, and `feedback submit`, `compressor submit`, `retain submit` from `cli/router.py`.

#### Edge cases
- Windows note: `bin/vidbyte.js` tries `python` then `python3`; the deck prefers the direct `python -m cli` form.

## 7. Data Model Changes

N/A - documentation-only change.

## 8. API Changes

N/A - documentation-only change.

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/agents-md-command-deck.md` | This design doc |
| MODIFY | `AGENTS.md` | Append the Command Deck section |

## 10. Dependencies & External Services

N/A - the deck only documents commands that already exist in the repository.

## 11. Rollout & Deployment

Docs-only. This PR stacks on `feat/agents-md-repository-map` (PR #119) and retargets to `main` automatically once that PR merges.

## 12. Open Questions

- [ ] None blocking.

## 13. Alternatives Considered

### Alternative 1: Distribute commands into Map folder entries
- What: Put commands next to `scripts/`, `bin/`, and `cli/` entries.
- Why rejected: The Map is topology-only by its own contract; commands would be scattered.

### Alternative 2: A separate COMMANDS.md
- What: Keep AGENTS.md pure.
- Why rejected: Agents would need a second lookup; the user explicitly wants the deck inside AGENTS.md.

END OF DESIGN DOC TEMPLATE
