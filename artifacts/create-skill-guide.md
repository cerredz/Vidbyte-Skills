# Create Skill Guide

This guide explains the Vidbyte skill taxonomy and the end-to-end process for creating each skill type. Use it to decide which type to build, what belongs in the `SKILL.md` prompt, what belongs in the CLI, and how backend-bound learning artifacts flow from prompt instructions to Vidbyte's API.

---

## Skill System Overview

Every skill in this repository lives under `skills/<name>/SKILL.md` and is discovered automatically by the installer. The only requirements are:

- A `SKILL.md` file with YAML frontmatter containing `name` and `description`.
- The `name` field must be lowercase hyphen-case and match the parent folder name.
- The `description` field must be non-empty and describe when the skill activates.
- The body must be non-empty (at least one line of instruction after the frontmatter).

Optionally, a skill folder may contain `scripts/`, `references/`, or `assets/` subdirectories. These are preserved by the installer and available to the skill at runtime.

Run `npm test` to validate all skills and run smoke tests.

---

## Shared Skill Contract

Every `SKILL.md` must begin with:

```markdown
---
name: my-skill
description: Use this skill when the user asks for a specific workflow.
---

# My Skill

Instructions here...
```

The `description` field serves as the trigger hint for harnesses that support automatic skill activation. Write it as a completion of "Use this skill when..." so the harness can match user intent to the right skill.

---

## Skill Type Decision Table

| If the user wants... | Build this type | Example |
|---|---|---|
| A public reasoning artifact written to `memory/` | Reasoning trace skill | `abductive-trace` |
| A structured inline response (no files, no CLI) | Prompt skill | `/counterargument`, `/explain` |
| Session-long observation, artifact writing, and CLI submission to Vidbyte | Learning/background skill | `feedback-generator`, `compression-check`, `retain` |

---

## Type 1: Reasoning Trace Skills

**When to use:** The skill produces a public scratchpad of step-by-step reasoning, typically written to `memory/{question_name}.md`. The user invokes it explicitly (slash command or direct request) and expects a transparent reasoning artifact as the output.

**Activation:** Slash command or explicit request (e.g., "use abductive reasoning on this problem").

**What the prompt owns:**
- The reasoning strategy (abductive, deductive, analogical, etc.).
- The trace format (numbered steps, assumptions, evidence, conclusions).
- Scale variants: small (~25 lines), medium/default (~100 lines), large (~500+ lines).
- Instructions to write to `memory/{question_name}.md`.

**What the prompt does NOT own:**
- No CLI calls. No backend submission. No session state tracking. No files beyond the reasoning artifact.

**Testing:** Metadata validation (`npm test`) plus manual invocation against sample questions.

**Template:**

```markdown
---
name: my-reasoning-skill
description: Use this skill when the user wants a structured reasoning trace for a specific problem.
---

# My Reasoning Skill

## Identity
You are a [strategy] reasoner. When invoked, produce a step-by-step trace...

## Goal
Write a structured reasoning artifact to `memory/{question_name}.md`...

## Steps
1. ...
2. ...

## Scale Variants
- Small (~25 lines): [when and how]
- Default (~100 lines): [when and how]
- Large (~500+ lines): [when and how]
```

---

## Type 2: Prompt Skills

**When to use:** The skill shapes the model's inline response without writing files, calling the CLI, or maintaining session state. Common examples are slash commands that restructure output (e.g., `/counterargument`, `/explain`, `/mental-model`).

**Activation:** Slash command or pattern match on user intent.

**What the prompt owns:**
- Output structure (sections, formatting, tone constraints).
- Banned phrases and style rules.
- Fallback behavior when input is insufficient.

**What the prompt does NOT own:**
- No files. No CLI. No backend. No session state.

**Testing:** Metadata validation plus manual response-shape checks.

**Template:**

```markdown
---
name: my-prompt-skill
description: Use this skill when the user wants a specific response format.
---

# My Prompt Skill

## Identity
You format responses as...

## Output Structure
- Section 1: ...
- Section 2: ...

## Constraints
- Do not...
- Always...
```

---

## Type 3: Learning and Background Skills

**When to use:** The skill runs across an entire session, observes conversation context, and submits structured artifacts to Vidbyte through the Python CLI. These skills either run silently in the background (`feedback-generator`, `compression-check`) or activate on an explicit slash command (`/retain`).

**Activation:**
- **Background skills:** Automatic at session start, continuous monitoring, no user invocation.
- **Explicit skills:** Slash command (`/retain`).

**What the prompt owns:**
- Session lifecycle (start, per-message, close).
- State variables (counters, thresholds, check state).
- Skip rules and interruption policy.
- Artifact generation from conversation context.
- ONE thing: calling the CLI. The prompt never constructs headers, signs requests, or calls `curl`.

**What the CLI owns:**
- Input validation and sanitization.
- JSON payload assembly.
- HMAC signing (X-Skill-Signature, nonce, timestamp, body hash).
- Fixed endpoint routing (`/api/skills/{endpoint}`).
- Network transport (only to `https://vidbyte.pro`).
- Dry-run validation (`--dry-run`).
- Secret management (`VIDBYTE_SKILL_SECRET` from environment or `.env`).

**What the backend owns (outside this repo):**
- Signature verification and replay protection.
- Schema validation.
- Storage and rendering.
- Premium entitlement gating.

---

## CLI and Backend Integration

### Current CLI Commands

```text
vidbyte feedback submit   --file <path> [--domain] [--conversation-id] [--skill-id] [--dry-run]
vidbyte compressor submit --file <path> [--domain] [--conversation-id] [--skill-id] [--dry-run]
vidbyte retain            --concept1-name <text> --concept1-distillation <text> --concept1-anchor <text> --concept1-hook <text> --question1 <text> --answer1 <text> [--dry-run]
vidbyte auth login | logout | status
```

### Architecture

```text
SKILL.md (prompt instructions)
    |
    v
python3 -m cli <resource> <action> [options]
    |
    v
cli/commands/<resource>.py  ── validates, sanitizes, builds payload
    |
    v
cli/dataclasses/<resource>.py ── defines the structured payload schema
    |
    v
cli/client.py (VidbyteRequestBuilder) ── signs and sends to Vidbyte
    |
    v
Vidbyte backend ── verifies, stores, returns URL
```

### Security Boundary

Skills MUST call the CLI. They must NEVER:
- Construct HMAC headers directly.
- Access `VIDBYTE_SKILL_SECRET` or include it in prompt text.
- Call arbitrary URLs or use `curl`.
- Store secrets in `SKILL.md`, committed artifacts, or generated files.

---

## CLI Dataclasses

Every CLI command that submits structured data to the backend defines its payload schema as classes in `cli/dataclasses/<resource>.py`. These dataclass files serve as the single source of truth for what the backend expects to receive. The command files (`cli/commands/<resource>.py`) import from the dataclass module and call `to_json()` to serialize the payload.

### Why Dataclasses

- **Single source of truth:** The backend schema is defined in one place, not spread across dict literals in command files.
- **Validation at construction:** Required fields and relationships are enforced when the dataclass object is created, not when the JSON is serialized.
- **Reusable:** The same dataclass can be used by tests, dry-run validation, and the live submission path.
- **Discoverable:** A new contributor can open `cli/dataclasses/` and immediately see the data contract for every backend-bound skill.

### Dataclass Pattern

Each file in `cli/dataclasses/` defines one or more classes representing the structured objects the backend receives. Each class has:

1. An `__init__` that accepts validated inputs and assigns them to `__slots__`.
2. A `to_dict()` method that returns a plain dict for embedding in larger structures.
3. A `to_json()` method on the top-level payload class that serializes the full request body.

Example structure for a typical payload:

```python
# cli/dataclasses/example.py
import json
from datetime import datetime, timezone

class ExampleItem:
    __slots__ = ("id", "name", "value")
    def __init__(self, item_id: str, name: str, value: str):
        self.id = item_id
        self.name = name
        self.value = value

    def to_dict(self) -> dict:
        return {"id": self.id, "name": self.name, "value": self.value}

class ExamplePayload:
    __slots__ = ("domain", "items", "generated_at")
    def __init__(self, domain: str, items: list[ExampleItem]):
        self.domain = domain
        self.items = items
        self.generated_at = datetime.now(timezone.utc).isoformat()

    def to_json(self) -> str:
        return json.dumps({
            "type": "example",
            "domain": self.domain,
            "items": [i.to_dict() for i in self.items],
            "generated_at": self.generated_at,
        })
```

The command class then uses it:

```python
# cli/commands/example.py
from ..dataclasses.example import ExamplePayload

class ExampleCommand:
    def submit(self, options: dict) -> str | None:
        items = [...]  # collect from options
        payload = ExamplePayload(domain=options.get("domain", "unknown"), items=items)

        builder = VidbyteRequestBuilder(
            body=payload.to_json(),
            cli_version=read_package_version(),
            endpoint_name="example",
            skill_id=options.get("skill-id"),
        )
        ...
```

### Existing Dataclasses

| File | Classes | Backend Endpoint |
|---|---|---|
| `cli/dataclasses/feedback.py` | `FeedbackPayload` | `/api/skills/feedback` |
| `cli/dataclasses/compressor.py` | `CompressorPayload` | `/api/skills/compressor` |
| `cli/dataclasses/retain.py` | `RetainConcept`, `RetainQuestion`, `RetainProblem`, `RetainReview`, `RetainModule`, `RetainPayload` | `/api/skills/retain` |

---

## What Belongs in a Background Skill Prompt

A learning/background skill `SKILL.md` should include the following sections:

1. **Identity / Persona:** What role the model takes when this skill is active.
2. **Goal:** The concrete output or behavior the skill produces.
3. **Activation / Lifecycle:** When the skill starts, what triggers it, when it stops.
4. **State Variables:** Counters, thresholds, flags (session-local, not persisted to disk).
5. **Per-Message Algorithm:** What the model does on every user message (count, evaluate skip rules, inject questions, append artifacts).
6. **Skip Rules:** Conditions where the skill should defer or stay silent.
7. **Artifact Schema:** The structure of any files or payloads the skill produces.
8. **CLI Command:** The exact `python3 -m cli ...` invocation, with fallback instructions.
9. **CLI Install Context:** Instructions for when the CLI is not available:
   ```text
   If the Vidbyte CLI is not installed, the user can install it globally with:
   npm install -g vidbyte-skills
   ```
10. **Failure Modes:** What happens when the CLI is unavailable, the network fails, or validation errors occur.
11. **Privacy / Security Constraints:** Secrets, URLs, and header rules.
12. **Success Criteria:** Measurable outcomes that define when the skill worked correctly.

---

## Adding a New CLI-Backed Skill

Follow these steps in order:

### 1. Define the Backend Artifact Type

Decide the endpoint name and payload shape. The endpoint name goes in `cli/client.py` `ENDPOINTS` dict. The payload shape becomes a dataclass in `cli/dataclasses/<resource>.py`.

### 2. Create the Dataclass

Create `cli/dataclasses/<resource>.py` with classes representing the backend objects. Include `to_dict()` on item classes and `to_json()` on the top-level payload class.

### 3. Create the Command Class

Create `cli/commands/<resource>.py` with a class that:
- Accepts options and builds a payload using the dataclass.
- Creates a `VidbyteRequestBuilder` with the payload JSON.
- Handles `--dry-run` by returning builder metadata plus validation fields.
- Handles live mode by calling `builder.request()` and formatting the response.
- Sanitizes all user-provided strings through the existing `Sanitizer`.

For commands with many CLI flags (like `retain`), pass options to `__init__` and do validation/collection there. For simpler file-based commands, use `submit(self, options)`.

### 4. Add Route

In `cli/router.py`, add a new `if` branch before the unknown command error:

```python
if resource == "<name>" and action == "submit":
    cmd = <Name>Command()
    return cmd.submit(options)
```

### 5. Add Endpoint

In `cli/client.py`, add the endpoint to `ENDPOINTS`:

```python
ENDPOINTS = {
    ...
    "<name>": "/api/skills/<name>",
}
```

### 6. Update Usage Text

In `cli/helpers/usage.py`, add the command to the usage string.

### 7. Add Smoke Test

In `scripts/cli-smoke-test.py`, add a dry-run invocation and assertions:
- Assert `endpoint` matches.
- Assert `skill_id` matches.
- Assert `signed` is True.
- Assert module-specific counts (concept count, question count, etc.) if applicable.
- Assert `header_names` match the expected signature headers.

### 8. Write the Skill Prompt

Create `skills/<name>/SKILL.md` following the background skill prompt template above. Include:

- The exact CLI invocation the model should use.
- A CLI install context block:
  ```bash
  if command -v vidbyte >/dev/null 2>&1; then
    python3 -m cli <resource> <action> [...flags]
  else
    echo "Vidbyte CLI is not installed. Install it with: npm install -g vidbyte-skills"
  fi
  ```
- Security constraints (never construct headers, never use curl, never include secrets).
- Failure behavior.

### 9. Run Tests

```bash
npm test
```

The test suite validates all skill metadata and runs the CLI smoke test with `--dry-run`.

---

## Authoring Checklists

### Reasoning Trace Skill Checklist

- [ ] Frontmatter: `name` (lowercase hyphen-case, matches folder) and `description`.
- [ ] Identity section: what strategy, what output.
- [ ] Steps: numbered algorithm.
- [ ] Output: writes to `memory/{question_name}.md`.
- [ ] Scale variants: small, medium/default, large with approximate line counts.
- [ ] Run `npm test` and confirm metadata validation passes.

### Prompt Skill Checklist

- [ ] Frontmatter: `name` and `description`.
- [ ] Output structure defined with sections.
- [ ] Tone constraints and banned phrases.
- [ ] Fallback behavior for insufficient input.
- [ ] No file paths, no CLI commands, no backend references.
- [ ] Run `npm test` and confirm metadata validation passes.

### Learning/Background Skill Checklist

- [ ] Frontmatter: `name` and `description`.
- [ ] Identity, goal, lifecycle sections.
- [ ] State variables (session-local, not persisted).
- [ ] Per-message algorithm with skip rules.
- [ ] Artifact schema or CLI flag contract.
- [ ] Exact CLI invocation with install fallback instructions.
- [ ] Failure modes: what happens when CLI is unavailable.
- [ ] Security: no secrets, no header construction, no curl, no arbitrary URLs.
- [ ] Success criteria.
- [ ] Dataclass created in `cli/dataclasses/<resource>.py`.
- [ ] Command class created in `cli/commands/<resource>.py`.
- [ ] Route added in `cli/router.py`.
- [ ] Endpoint added in `cli/client.py`.
- [ ] Usage text updated in `cli/helpers/usage.py`.
- [ ] Smoke test added in `scripts/cli-smoke-test.py`.
- [ ] Run `npm test` and confirm all checks pass.

---

## Common Mistakes

1. **Overloading one skill with multiple behaviors.** If a skill does two unrelated things, split it into two skills. Each `SKILL.md` should have a single clear purpose.

2. **Making background skills chatty.** Background skills should be invisible unless they have a specific reason to surface output. Every line a background skill prints to the user is a line that distracts from the user's task.

3. **Using `curl` instead of the CLI.** The CLI is the security boundary. Direct `curl` calls bypass signing, sanitization, and endpoint validation.

4. **Persisting secrets in prompt text.** Secrets belong in environment variables or `.env` files. Never hardcode them in `SKILL.md`, generated artifacts, or command arguments.

5. **Skipping dry-run tests.** Every CLI-backed skill must have a `--dry-run` smoke test. It is the fastest way to catch payload shape mismatches and missing required options before they hit the backend.

6. **Failing to define failure behavior.** What happens when the CLI is not installed? When the network is down? When the backend returns a 429? Define these behaviors explicitly in the skill prompt so the model handles them consistently.

7. **Putting validation logic only in the command file.** Validation should live in the dataclass constructors where possible. This ensures that any code path that creates a dataclass object gets the same validation.

8. **Defining the backend payload shape as dict literals in command files.** Use the dataclass pattern instead. Dicts scattered across command files make the backend contract invisible and impossible to audit.

9. **Generating the backend payload inside the prompt skill.** The model generates content. The CLI structures, validates, signs, and sends it. Do not have the prompt produce JSON payloads - have it produce the CLI flags and let the CLI do assembly.
