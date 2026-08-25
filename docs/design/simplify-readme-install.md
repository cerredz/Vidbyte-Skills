# Design Doc: Simplify README Install Instructions

**Status:** Draft
**Author:** Codex
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

---

## 1. Overview

This documentation change simplifies the Vidbyte Skills README installation guidance to two directly usable commands: the universal default install command and the command for installing a skill by name. The package already exposes `vidbyte-skills` through npm and accepts positional skill names, so the change improves discoverability without changing installer behavior.

---

## 2. Goals & Non-Goals

### Goals

- Make the primary README install section immediately understandable to a new user.
- Document `npx vidbyte-skills` as the universal default installation command.
- Document positional skill selection with `npx vidbyte-skills <skill-name>`.
- Remove alternate installation paths, version bundles, and option reference material from the primary install section so it contains only the requested workflows.

### Non-Goals

- Change the npm package, binaries, installer behavior, supported platforms, or skill catalog.
- Add or remove skills.
- Change the separate CLI, update, authoring, catalog, or verification documentation beyond removing the superseded install walkthrough.
- Add new automated tests.

---

## 3. Background & Context

- The current README spreads installation guidance across default, version-specific, category-specific, specific-skill, and option sections.
- `package.json` maps the public `vidbyte-skills` binary to `bin/install.js`.
- `bin/install.js` delegates ordinary invocations to `installVidbyteSkills`, and `lib/cli-options.js` accepts positional skill names.
- The repository's canonical verification command is `npm test`, which runs structural validation, installer smoke tests, CLI smoke/security tests, and the agent-facing CLI test.

---

## 4. Requirements

### Functional Requirements

1. The README must contain a concise `Install` section with the universal default command `npx vidbyte-skills`.
2. The same section must show how to install one named skill using `npx vidbyte-skills <skill-name>`.
3. The install section must not include the previous GitHub checkout command, local checkout command, version/category walkthroughs, or detailed installer option reference.
4. The README must continue to describe the package and its other supported workflows outside the simplified install section without changing their runtime meaning.

### Non-Functional Requirements

- Documentation must use copyable shell commands and a clear placeholder for the skill name.
- The change must not alter runtime behavior, package metadata, dependencies, generated assets, or security boundaries.
- Run the repository's complete `npm test` gate after the README change.

---

## 5. High-Level Design

Replace the current block of installation subsections in `README.md` with one `Install` section containing two short command examples. The first example invokes the package without selectors and therefore uses the installer's existing default behavior. The second passes a positional skill name, which the existing parser already treats as a requested skill selector.

No code path or package interface changes are needed. The README remains the source of user-facing usage guidance, while the existing installer and validation scripts remain untouched.

```text
[README Install section]
        |
        +--> npx vidbyte-skills          -> existing default installer behavior
        |
        +--> npx vidbyte-skills <name>   -> existing positional skill selection
```

---

## 6. Detailed Design

### 6.1 README Installation Guidance

**File(s):** `README.md`
**Type:** Modified

#### What it does

Provides the shortest supported path for installing the default skill set or one specific named skill through the published npm package.

#### Interface / API

```bash
npx vidbyte-skills
npx vidbyte-skills <skill-name>
```

#### Logic / Algorithm

1. Rename the primary installation heading to `Install`.
2. Explain that the no-argument command installs the default skill set.
3. Explain that a positional skill name limits the installation to that skill.
4. Remove the superseded alternate-source, version/category, specific-skill variants, and installer-option reference from the install block.
5. Leave the following `Updating Skills` and later README sections in place.

#### Edge Cases & Error Handling

- The README must not imply that `<skill-name>` is a literal name; it must be clearly presented as a placeholder.
- An invalid skill name continues to be handled by the existing installer; this documentation change does not add new validation or error handling.
- The command must remain `npx vidbyte-skills`, matching the `package.json` binary mapping.

---

## 7. Data Model Changes

N/A - This is a documentation-only change and does not modify persisted data, schemas, or manifests.

---

## 8. API Changes

N/A - No HTTP, Python CLI, Node.js, or package API changes are required.

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/simplify-readme-install.md` | Record the design and verification plan for the README documentation change |
| MODIFY | `README.md` | Replace the verbose installation walkthrough with the two requested commands |

---

## 10. Dependencies & External Services

N/A - No dependencies or external services are added, removed, or changed.

---

## 11. Rollout & Deployment

- No feature flag or deployment ordering is involved.
- This is a non-breaking documentation change; the existing commands and installer behavior remain unchanged.
- Rollout occurs when the README commit is merged and the package repository documentation is published.
- Rollback procedure: revert the README commit to restore the previous installation documentation. No runtime state or user data is affected.

---

## 12. Open Questions

- [ ] N/A - The command syntax and requested scope are confirmed from the repository's package manifest and installer implementation.

---

## 13. Alternatives Considered

### Alternative 1: Keep the existing detailed installation subsections

- What: Retain version, category, GitHub, local checkout, and option examples alongside the basic command.
- Why rejected: The user specifically asked for a simple install section with only universal and named-skill installation paths; retaining the alternatives would preserve the current ambiguity.

### Alternative 2: Change the installer or add a new wrapper command

- What: Modify the CLI interface to introduce a new installation command or alias.
- Why rejected: The existing `npx vidbyte-skills` command and positional skill selector already satisfy the requested workflows, so runtime changes would add risk without improving the README.

