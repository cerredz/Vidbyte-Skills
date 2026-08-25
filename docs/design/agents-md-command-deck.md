# Design Doc: AGENTS.md Command Deck

**Status:** Draft
**Author:** opencode (design-doc-no-tests workflow)
**Created:** 2026-08-17
**Last Updated:** 2026-08-25

---

## 1. Overview

Add a **Command Deck** section to the root `AGENTS.md` that gives contributors verified commands for developing and debugging this repository's two runtimes: the Node.js installer and the Python CLI. The section is a local command reference, not package installation or end-user usage documentation.

## 2. Goals & Non-Goals

### Goals
- One top-level `## Command Deck` section appended to `AGENTS.md`, after the File Index.
- Cover the complete local gate and the individual Node.js and Python checks that make up that gate.
- Document repository build/generation commands, syntax checks, and native debugger entry points.
- Keep every command grounded in the scripts and runtime entry points that already exist in the repository.

### Non-Goals
- No changes to application or installer behavior.
- No package installation instructions such as `npx vidbyte-skills` or `npm run install-skills`.
- No new scripts, dependencies, or CI workflow.
- No changes to the Map's File Index content or conventions.

## 3. Background & Context

This repository has two runtimes that share a checkout but not a call path. The Node.js side owns the installer, package generation, skill validation, and smoke tests; the Python side owns the `cli/` module and its agent-facing artifact commands. Contributors need a fast way to select the relevant local check and to attach the Node or Python debugger when one surface fails.

## 4. Requirements

### Functional Requirements
1. `AGENTS.md` gains exactly one new top-level section, `## Command Deck`, placed after the File Index.
2. The section opens with a scope note identifying it as a development/debugging reference outside the Map contract.
3. The repository gates include `npm test`, `npm run validate`, each targeted JavaScript gate, and the agent-facing Python check.
4. The Node.js subsection covers package generation, roleplay generation/verification, `node --check`, and `node --inspect-brk`.
5. The Python subsection covers `compileall`, the module entry point, an agent-facing route, a dry-run submission, and `pdb`.
6. The deck does not present installer commands or package-consumer usage as contributor development commands.

### Non-Functional Requirements
- Each entry has a literal command, a short purpose, and a params line.
- All commands match the existing `package.json`, `scripts/`, `cli/`, and runtime entry points.
- The Markdown renders without changing the existing File Index.

## 5. High-Level Design

Append a development-focused section after the existing Map:

```
AGENTS.md
  ...existing Map...
  ## Command Deck
    ### Repository gates
    ### Node.js development and debugging
    ### Python CLI development and debugging
```

The gates section starts with the full `npm test` chain and then gives targeted commands. The runtime sections add the build/generation and debugger commands that contributors need while changing the corresponding code.

## 6. Detailed Design

### 6.1 AGENTS.md Command Deck section

**File(s):** `AGENTS.md`
**Type:** Modified (append one section)

#### Content decisions
- Use `npm test` as the complete local gate and `npm run validate` for the fast catalog loop.
- List the individual JavaScript and Python gate scripts so a contributor can narrow a failure quickly.
- Keep Node.js commands focused on package generation, roleplay generation/verification, syntax checks, and inspector attachment.
- Keep Python commands focused on module compilation, CLI routing, dry-run request validation, and `pdb`.

#### Edge cases
- `python -m cli ... --dry-run` validates a request without sending it to the backend.
- `node --inspect-brk` and `python -m pdb` are interactive debugger entry points; they intentionally pause until a debugger continues execution.

## 7. Data Model Changes

N/A - documentation-only change.

## 8. API Changes

N/A - documentation-only change.

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| MODIFY | `AGENTS.md` | Append the development/debugging Command Deck |
| CREATE | `docs/design/agents-md-command-deck.md` | Record the Command Deck scope and command inventory |

## 10. Dependencies & External Services

N/A - the deck documents commands already supported by the repository's Node.js and Python runtimes.

## 11. Rollout & Deployment

Docs-only. Contributors use the Command Deck from a checkout when validating or debugging changes.

## 12. Open Questions

- [ ] None blocking.

## 13. Alternatives Considered

### Alternative 1: Document package installation and end-user usage
- What: List `npx`, category package, and installed `vidbyte` commands.
- Why rejected: Those commands describe consuming the package, while this section is for developing and debugging the repository.

### Alternative 2: Add new npm scripts for every targeted check
- What: Wrap each existing script in additional `package.json` entries.
- Why rejected: The existing scripts already provide the needed entry points; the Command Deck should document them without changing behavior.

END OF DESIGN DOC TEMPLATE
