# Create Skill Guide

This guide explains how to create Vidbyte skills in this repository and how to choose the right skill type before writing a `SKILL.md`.

All Vidbyte skills share the same filesystem contract, but they do not all have the same job. Some skills change the way the model reasons. Some skills change the shape of a single answer. Some skills run across an entire session, write learning artifacts, and submit those artifacts to Vidbyte through the local CLI. Treat those as different products with different design constraints.

## Skill System Overview

Vidbyte skills live under `skills/`:

```text
skills/<skill-name>/
  SKILL.md
  scripts/
  references/
  assets/
```

Only `SKILL.md` is required. The other folders are optional and should exist only when the skill actually needs reusable scripts, reference material, or assets.

`SKILL.md` must start with YAML frontmatter:

```markdown
---
name: my-skill
description: Use this skill when the user asks for the workflow this skill handles.
---

# My Skill

Skill instructions go here.
```

The skill name must:

- be lowercase hyphen-case
- match the folder name exactly
- match `^[a-z0-9]+(-[a-z0-9]+)*$`
- have a non-empty `description`
- have a non-empty body

The installer discovers skills automatically through `lib/skill-catalog.js`. Adding a normal skill does not require a registry edit. Validation happens in `lib/skill-validation.js` and `scripts/validate.js`.

Run validation with:

```bash
npm test
```

## Skill Type Decision Table

| Question | Build This Type | Core Output | State | CLI Needed |
|----------|-----------------|-------------|-------|------------|
| Should the user get an auditable reasoning artifact shaped by a strategy? | Reasoning trace skill | Markdown scratchpad in `memory/` | Usually none beyond the artifact | No |
| Should the next answer follow a specific structure, tone, or epistemic standard? | Prompt skill | Inline chat response | Usually stateless | No |
| Should the skill observe a whole session, collect learning data, or persist a feedback artifact? | Learning/background skill | Local artifact and/or Vidbyte submission | Session-local or artifact-backed | Usually yes |

Use the smallest type that solves the problem. Do not add CLI code to a prompt skill. Do not make a background skill if a direct slash command is enough. Do not make a reasoning trace skill if the user only needs a shaped answer in the chat.

## Shared Skill Contract

Every skill should answer these questions in its prompt:

- **When does it activate?** Explicit slash command, semantic trigger, or automatic session start.
- **What is its role?** Reasoning strategy, response formatter, background observer, coach, evaluator, etc.
- **What does it produce?** Inline answer, scratchpad file, feedback file, CLI submission, URL, or no user-facing output.
- **What state does it keep?** None, session-local counters, local files, temp files, or backend records.
- **What must it never do?** Examples: reveal hidden reasoning, expose secrets, call arbitrary URLs, interrupt debugging, or display background feedback inline.
- **How does it fail?** Usage message, silent skip, dry-run result, CLI error capture, or no-op.

Good skills are narrow. The `description` should tell the harness when to load the skill, and the body should tell the model exactly how to behave after the skill is loaded.

## Type 1: Reasoning Trace Skills

Reasoning trace skills make the model answer through a named reasoning strategy and write a public, durable scratchpad. These are simple reasoning skills in the sense that their core value is the reasoning procedure itself.

Examples in this repo include:

- `abductive-trace`
- `analysis-of-competing-hypotheses-trace`
- `causal-trace`
- `first-principles-trace`
- `swot-trace`

### What They Do

A reasoning trace skill should:

1. detect the user's question or explicit slash command
2. derive a safe `question_name`
3. create `memory/` when needed
4. write or replace `memory/{question_name}.md`
5. structure the scratchpad around the named reasoning strategy
6. end with a synthesis and final answer
7. respond to the user with the path and a concise final summary

The public scratchpad is not hidden chain-of-thought. It is an inspectable artifact containing subquestions, assumptions, tests, comparisons, intermediate conclusions, and uncertainty.

### Scale Variants

Many reasoning trace skills have variants:

| Variant | Typical Target | Use When |
|---------|----------------|----------|
| `-small` | around 25 numbered lines | The question is narrow or the user asks for a quick pass |
| default or `-medium` | around 100 numbered lines | The question benefits from structured analysis |
| `-large` | 500+ numbered lines when justified | The question is broad, high-stakes, or explicitly asks for depth |

These are effort targets, not quotas. The trace should adapt to the real complexity of the question.

### Prompt Contents

A reasoning trace skill prompt should include:

- strategy identity and goal
- trigger conditions
- output file path
- safe filename derivation
- required document sections
- scale note
- the reasoning strategy's core move
- final response format

Template:

```markdown
---
name: strategy-name-trace
description: >
  Use this skill when the user invokes /strategy-name-trace or asks for a public reasoning trace using Strategy Name.
  The skill writes a durable scratchpad to root memory/{question_name}.md.
---

# Strategy Name Reasoning Trace

## Goal
Use Strategy Name to answer the user's question through [core move], not through a generic checklist.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md.
Build the scratchpad by repeatedly applying [strategy-specific move].

## Output
Write the artifact before responding to the user.
Respond with the path, selected strategy, scale note, and final answer summary.
```

### Testing

Minimum testing:

- `npm test`
- manual invocation in a harness
- confirm `memory/{question_name}.md` is created
- confirm the trace uses the named strategy instead of a generic outline

## Type 2: Prompt Skills

Prompt skills are response contracts. Their core functionality lives in the prompt instructions and output format, not in files, scripts, CLI commands, or backend state.

Examples of this type include planned or existing prompt workflows such as:

- `/counterargument`
- `/mental-model`
- `/research`
- `/explain`
- `/question`

### What They Do

A prompt skill should:

1. activate on a clear user invocation or semantic trigger
2. extract the user's input
3. produce an inline response in the required structure
4. enforce tone, evidence, formatting, or reasoning constraints
5. show usage if invoked without required input
6. avoid writing files unless the skill explicitly becomes a trace or artifact skill

Prompt skills are useful when the user wants the answer a specific way:

- adversarial critique
- mental model construction
- sourced research brief
- layered explanation
- structured Q&A
- counterargument
- misconception correction

### Prompt Contents

A prompt skill should include:

- exact trigger
- input handling rules
- output sections in order
- hard constraints
- usage fallback
- examples of banned weak behavior
- edge cases

Template:

```markdown
---
name: counterargument
description: >
  Use when the user invokes /counterargument. Stress-tests an idea with adversarial rigor.
---

# /counterargument

## Activation
Activate only when the user's prompt starts with /counterargument.

## Output Format
Produce these sections in order:
1. The Opposing Position
2. Logical Vulnerabilities
3. Practical Failure Modes
4. Edge Cases That Break It
5. The Strongest Single Point

## Constraints
Do not soften, balance, or validate the user's original position.
Every criticism must identify a specific mechanism of failure.

## Empty Invocation
If the user invokes /counterargument with no input, show the usage format.
```

### What Prompt Skills Should Not Do

Prompt skills should not:

- write background logs
- maintain long-running session state
- call Vidbyte
- construct API requests
- add CLI commands
- persist secrets
- turn every future answer into the same format unless explicitly designed as a background style skill

### Testing

Minimum testing:

- `npm test`
- manual invocation with normal input
- manual invocation with empty input
- response-shape inspection against the required sections
- scan for banned phrases or prohibited behavior if the skill defines them

## Type 3: Learning And Background Skills

Learning/background skills run across a session. They watch the user's interaction pattern, collect learning signals, create local artifacts, and sometimes submit those artifacts to Vidbyte through the CLI.

Examples in this repo:

- `feedback-generator`
- `compression-check`
- `anti-passive`

The user-facing examples are often described as `/feedback` and `/compression`, but the important architectural point is the same: the skill's prompt owns observation and artifact creation; the CLI owns backend submission.

### What They Do

A background learning skill may:

1. initialize at session start
2. infer the session domain
3. keep session-local counters or flags
4. monitor each user message
5. apply skip rules
6. write a local artifact incrementally
7. evaluate the user's response or behavior against the conversation
8. submit the final artifact through the Vidbyte CLI
9. display nothing, or display only a one-line CLI result

Background skills need stricter prompts than normal prompt skills because they can easily become disruptive. The prompt must say when to stay silent, when to interrupt, what to write, what to submit, and how to fail.

### Background Skill Lifecycle

Use this lifecycle unless the skill has a specific reason to differ:

```text
Session starts
  |
  v
Initialize state
  |
  v
For each user message:
  - update counters or observations
  - classify the moment
  - apply skip rules
  - write artifact entries when useful
  - optionally inject one prompt or continue silently
  |
  v
At checkpoint or session close:
  - finalize artifact
  - call Vidbyte CLI if backend persistence is needed
  - display only the allowed user-facing output
```

### What Belongs In The Background Skill Prompt

A learning/background `SKILL.md` should include these sections:

- **Identity / Persona:** The precise role, such as silent observer, compression coach, or passive-consumption detector.
- **Activation:** Whether it starts automatically, only on slash command, or after explicit user opt-in.
- **State Variables:** Counters, thresholds, current check state, domain, artifact path, recurrence map, or last prompt window.
- **Per-Message Algorithm:** What happens before every response.
- **Skip Rules:** Conditions where the skill must not interrupt or log.
- **Artifact Schema:** The exact Markdown or JSON structure to write.
- **CLI Command:** The exact `vidbyte ...` or `python -m cli ...` command to call.
- **Failure Handling:** Silent skip, local-only fallback, captured stderr, or visible one-line failure.
- **Privacy / Security Constraints:** No secrets in prompt or artifact; no raw sensitive content if unnecessary.
- **User-Facing Output Rules:** Silence, one-line URL, injected question, or normal response plus marker.
- **Success Criteria:** Concrete observable outcomes.

### State Models

There are three common state models:

| State Model | Use When | Example |
|-------------|----------|---------|
| Stateless session monitor | The skill only needs current and recent messages | Passive-consumption detection |
| Session-local state | The skill needs counters, thresholds, or temporary check state | Compression checks |
| Artifact-backed state | The skill needs a durable log to submit later | Feedback generation |

Use session-local state for temporary behavior. Use local artifacts for things the CLI will submit or a later reader must inspect. Do not invent a local database unless the skill truly needs one.

### Interruption Policy

Most background skills should default to silence. Interrupt only when the moment is useful and the prompt defines clear skip rules.

Common skip rules:

- the user is debugging an active error
- the user wrote a long specification
- the user is already explaining their reasoning
- the user is answering a question from the assistant
- the prompt is a simple confirmation
- the user explicitly opts out
- the current task is urgent or flow-sensitive

When in doubt, skip. A missed learning moment is usually cheaper than a badly timed interruption.

## CLI And Backend Integration

The Vidbyte CLI is the trusted local boundary between prompt-written artifacts and the Vidbyte backend. Skills should call the CLI instead of constructing backend requests directly.

Current commands:

```bash
vidbyte feedback submit --file <path> --domain <name> --conversation-id <id>
vidbyte compressor submit --file <path> --domain <name> --conversation-id <id>
```

Local development invocation:

```bash
python -m cli feedback submit --file feedback-log.md --domain software-engineering --conversation-id local-test --dry-run
python -m cli compressor submit --file compression-check.md --domain software-engineering --conversation-id local-test --dry-run
```

Some environments use `python3`; Windows often uses `python`. The repo's smoke-test wrapper tries the appropriate candidates.

### Why The CLI Exists

The prompt is not a security boundary. It is text in a model context. It can be copied, injected, or misunderstood. Therefore, the prompt should not:

- store secrets
- construct HMAC signatures
- build auth headers
- call `curl` directly for Vidbyte submissions
- send requests to user-provided URLs
- decide whether a backend request is authenticated

The CLI should:

- read the local artifact file
- sanitize outbound content
- build the JSON payload
- resolve the official endpoint
- load secrets from environment or `.env`
- compute request hashes and signatures
- send traffic only to Vidbyte's official API origin
- return a concise backend result

The backend should:

- verify signatures independently
- reject replayed or stale requests
- validate schemas
- apply rate limits
- store accepted artifacts
- return a URL or status

### Current CLI Flow

The Python CLI is intentionally small and uses the standard library.

```text
cli/__main__.py
  parses argv into resource, action, options
  |
  v
cli/router.py
  maps (resource, action) to a command class
  |
  v
cli/commands/<resource>.py
  reads sanitized file content and builds JSON payload
  |
  v
cli/client.py
  resolves endpoint name and builds request
  |
  v
cli/auth/headers.py
  creates signed Vidbyte headers
  |
  v
https://vidbyte.pro
```

Current endpoint map in `cli/client.py`:

```text
feedback      -> /api/skills/feedback
compressor    -> /api/skills/compressor
auth-validate -> /api/auth/validate
auth-session  -> /api/auth/session
```

Skill submissions use signed skill headers:

```text
Content-Type
X-Skill-Id
X-Skill-Timestamp
X-Skill-Nonce
X-Skill-Body-SHA256
X-Skill-Signature
X-Vidbyte-CLI-Version
```

The canonical signature input is:

```text
METHOD
/api/path
timestamp
nonce
body-sha256
```

The CLI signs that canonical string with `VIDBYTE_SKILL_SECRET` using HMAC-SHA256.

### CLI Configuration

Skill submission reads:

- `VIDBYTE_SKILL_SECRET`: required for signed skill submission
- `VIDBYTE_SKILL_ID`: optional override, defaults to the configured skill id
- `VIDBYTE_TIMEOUT_MS`: optional timeout override
- `.env`: local development file loaded from the working directory or repo root

Do not commit real `.env` files. Use `.env.example` for setup documentation.

### Dry Run

Every backend-bound command should support `--dry-run`. Dry run validates command input, builds headers, and returns metadata without sending a network request.

Example:

```bash
python -m cli feedback submit --file feedback-log.md --domain software-engineering --conversation-id local-test --dry-run
```

Expected shape:

```json
{
  "endpoint": "feedback",
  "header_names": ["Content-Type", "X-Skill-Id"],
  "skill_id": "feedback-generator-v1",
  "bytes": 247,
  "signed": true,
  "file": "/absolute/path/to/feedback-log.md"
}
```

The actual `header_names` array contains every signed header. Tests should verify the full list.

## Adding A New CLI-Backed Skill

Add CLI integration only when the skill needs backend persistence or a backend-generated result. If the skill only changes the response format, keep it as a prompt skill.

### Step 1: Define The Artifact Contract

Before writing CLI code, decide:

- artifact type name
- local file format
- required metadata
- backend endpoint name
- expected backend response fields
- user-facing output rule
- failure behavior

Example:

```json
{
  "type": "compression-check",
  "domain": "software-engineering",
  "conversation_id": "abc123",
  "file_name": "compression-check.md",
  "content": "...",
  "generated_at": "2026-05-13T00:00:00Z"
}
```

### Step 2: Create A Command Class

Create `cli/commands/<resource>.py`.

Command classes should:

- receive parsed `options`
- validate required options with `require_option`
- use `@sanitize_file_content` when reading user/model-authored files
- build a JSON payload
- instantiate `VidbyteRequestBuilder`
- return dry-run metadata when `--dry-run` is set
- format the backend response into the approved user-facing line

Skeleton:

```python
import json
from datetime import datetime, timezone
from pathlib import Path

from ..client import VidbyteRequestBuilder
from ..helpers import read_package_version, require_option, sanitize_file_content


class NewResourceCommand:

    @sanitize_file_content
    def submit(self, options: dict) -> str | None:
        file = require_option(options, "file", "--file")
        content = options["_sanitized_content"]

        payload = json.dumps({
            "type": "new-resource",
            "domain": options.get("domain", "unknown"),
            "conversation_id": options.get("conversation-id", ""),
            "file_name": Path(file).name,
            "content": content,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        })

        builder = VidbyteRequestBuilder(
            body=payload,
            cli_version=read_package_version(),
            endpoint_name="new-resource",
            skill_id=options.get("skill-id"),
        )

        if options.get("dry-run"):
            result = builder.dry_run()
            result["file"] = str(Path(file).resolve())
            return json.dumps(result, indent=2)

        response = builder.request()
        if response.get("url"):
            return f"View the result on {response['url']}"
        if response.get("message"):
            return response["message"]
        return json.dumps(response)
```

### Step 3: Route The Command

Update `cli/router.py`:

```python
from .commands.new_resource import NewResourceCommand

if resource == "new-resource" and action == "submit":
    cmd = NewResourceCommand()
    return cmd.submit(options)
```

Keep the router explicit. The router is the single place to know which command resources exist.

### Step 4: Add The Endpoint

Update `ENDPOINTS` in `cli/client.py`:

```python
ENDPOINTS = {
    "new-resource": "/api/skills/new-resource",
}
```

Only fixed endpoint names should be used. Do not let prompt text or user input choose the destination URL.

### Step 5: Update Usage Text

Update `cli/helpers/usage.py` so users can discover the command:

```text
vidbyte new-resource submit --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]
```

### Step 6: Add Smoke Test Coverage

Add or extend a smoke test that:

- creates a temporary artifact file
- runs `python -m cli new-resource submit --file ... --dry-run`
- sets `VIDBYTE_SKILL_SECRET` to a test value
- parses stdout as JSON
- asserts endpoint name, file path, signed status, skill id, and header names

### Step 7: Document The CLI Command In The Skill Prompt

The `SKILL.md` must say exactly how to submit:

````markdown
After the artifact is complete, submit it through the Vidbyte CLI:

```bash
python -m cli new-resource submit --file "$ARTIFACT_FILE" --domain "$DOMAIN" --conversation-id "$CONVERSATION_ID"
```

Do not construct headers, call `curl`, or send requests directly. The CLI owns signing, sanitization, endpoint routing, and transport.
````

If the command should be silent, say so. If the user should see the returned URL, say exactly how to display it.

## Backend Requirements For CLI-Backed Skills

Backend implementation is outside this repo, but every new CLI-backed skill implies a backend route. The backend should independently enforce:

- HTTPS-only transport
- raw-body hash verification
- HMAC signature verification
- timestamp freshness window
- nonce replay prevention
- skill id lookup
- route-specific schema validation
- request size limits
- rate limits
- audit logging
- safe persistence

The backend must verify the request. It should not trust the CLI merely because the CLI claims the request is signed.

## Validation And Testing

Use these checks by skill type:

| Skill Type | Required Checks |
|------------|-----------------|
| Reasoning trace | `npm test`, manual invocation, memory file exists, strategy-specific trace shape |
| Prompt skill | `npm test`, empty invocation behavior, normal invocation response shape, banned behavior scan |
| Background skill without CLI | `npm test`, manual session simulation, skip-rule checks, output silence/interruption checks |
| Background skill with CLI | `npm test`, CLI dry-run smoke test, artifact schema check, failure behavior check |

For CLI changes, test both success-shaped dry run output and missing required options.

## Authoring Checklists

### Reasoning Trace Skill Checklist

- [ ] Skill name is lowercase hyphen-case and matches the folder.
- [ ] Description names the slash command or trigger.
- [ ] Prompt names the reasoning strategy's core move.
- [ ] Prompt writes to `memory/{question_name}.md`.
- [ ] Prompt derives safe filenames.
- [ ] Prompt defines scale target.
- [ ] Prompt tells the model what to say after writing the file.
- [ ] `npm test` passes.

### Prompt Skill Checklist

- [ ] Trigger is explicit.
- [ ] Empty invocation has a usage response.
- [ ] Output sections are listed in order.
- [ ] Tone and format constraints are explicit.
- [ ] Banned weak behavior is named.
- [ ] Skill is stateless unless explicitly justified.
- [ ] No CLI or backend behavior is included.
- [ ] `npm test` passes.

### Learning / Background Skill Checklist

- [ ] Identity and session role are clear.
- [ ] Activation model is explicit.
- [ ] State variables are named.
- [ ] Per-message algorithm is defined.
- [ ] Skip rules are conservative.
- [ ] Artifact schema is specified.
- [ ] User-facing output rules are strict.
- [ ] Failure behavior is defined.
- [ ] Secrets are never placed in the prompt or artifact.
- [ ] CLI submission uses an approved command if backend persistence is needed.
- [ ] `npm test` passes.

### CLI-Backed Skill Checklist

- [ ] Artifact contract is defined before code.
- [ ] Command class exists in `cli/commands/`.
- [ ] Router maps `(resource, action)` explicitly.
- [ ] Endpoint name is added to `cli/client.py`.
- [ ] Usage text is updated.
- [ ] Command uses shared sanitization.
- [ ] Command supports `--dry-run`.
- [ ] Smoke test validates dry-run JSON.
- [ ] Skill prompt calls the CLI and never builds headers.
- [ ] Backend route verifies signature, replay protection, schema, and limits.

## Common Mistakes

### Mistake: Treating All Skills As Prompt Skills

If a skill needs to run all session, create files, or submit to Vidbyte, it is not just a response formatter. Give it lifecycle instructions and failure rules.

### Mistake: Putting Security Logic In `SKILL.md`

Prompts must not contain signing secrets, HMAC code, auth headers, or backend URLs beyond the fixed CLI command. Security logic belongs in the CLI and backend.

### Mistake: Calling `curl` From A Skill

Do not call Vidbyte directly from prompt instructions. Use the CLI so sanitization, endpoint pinning, signing, version headers, and error handling stay centralized.

### Mistake: Making Background Skills Too Talkative

Background skills should be quiet by default. If they interrupt, the prompt must define exactly when and why.

### Mistake: Logging Everything

Feedback artifacts should be high-signal. Logging trivial stylistic choices or every small mistake creates noisy artifacts that are less useful for learning.

### Mistake: Mixing Multiple Skill Types In One Skill

If a skill tries to be a reasoning trace, background observer, and response formatter at once, it will be hard for the model to follow. Split the workflow unless the behaviors are inseparable.

### Mistake: Skipping Dry Run

Every CLI-backed skill should support a local dry run so command parsing, payload building, header construction, and file handling can be tested without network traffic.

## Practical Rule

Put judgment in the prompt, enforcement in the CLI, and authority in the backend.

The prompt can notice, reason, ask, evaluate, and write artifacts. The CLI can sanitize, sign, pin endpoints, and transport. The backend can verify, reject, persist, and return durable URLs. Keep those responsibilities separate and the skill system stays simple, inspectable, and safe to extend.
