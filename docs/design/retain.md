# Design Doc: Retain Skill

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-13
**Last Updated:** 2026-05-13

---

## 1. Overview

The `/retain` skill stops the normal conversation flow and turns the current session into a 15-minute Vidbyte retention exercise. The model generates the exercise content from the conversation context, then invokes the Vidbyte CLI with flags that mirror the generated exercise shape, such as `--concept1-name`, `--concept1-anchor`, `--question1`, `--answer1`, `--problem1-scenario`, and `--problem1-criteria`. The CLI assembles those flags into a structured retain module, signs the request, submits it to `/api/skills/retain`, and prints the Vidbyte URL where the user completes the exercise.

---

## 2. Goals & Non-Goals

### Goals

- Create a new explicit slash skill at `skills/retain/SKILL.md`.
- Add a first-class `vidbyte retain` CLI command with no `submit` subcommand.
- Make the CLI arguments mimic the model's generated output shape instead of requiring a JSON file.
- Generate the full 15-minute exercise in the user's current model session with no backend LLM generation call.
- Structure the exercise into encoding anchors, brain dump, cued recall, active reasoning problems, and review scheduling.
- Build and sign a structured JSON payload inside the CLI.
- Submit to `POST https://vidbyte.pro/api/skills/retain`.
- Return a Vidbyte URL for the interactive premium retention route.
- Preserve the existing security boundary: prompts do not construct HMAC headers, see secrets, or call arbitrary URLs.
- Add dry-run smoke coverage for the argument-shaped command.

### Non-Goals

- Implementing Vidbyte backend route code in this repository.
- Implementing the Vidbyte frontend exercise screens in this repository.
- Adding a file-based retain artifact contract as the primary path.
- Adding third-party dependencies.
- Changing existing `feedback`, `compressor`, or `auth` command behavior.
- Moving premium entitlement checks into the local CLI.
- Persisting spaced repetition schedules locally.

---

## 3. Background & Context

Existing backend-connected skills in this repo follow a prompt-to-CLI-to-backend pattern. The prompt layer produces learning content; the Python CLI validates, sanitizes, signs, and submits; Vidbyte verifies and stores. The relevant examples are `feedback-generator` and `compression-check`.

The user's updated requirement changes the retain command from a file submission API to a command whose flags represent the actual exercise content the model generated. This means the final invocation should look like a direct serialization of the model output, for example:

```bash
vidbyte retain \
  --title "Retain this session" \
  --domain "software-engineering" \
  --conversation-id "session-2026-05-13" \
  --concept1-name "HMAC request signing" \
  --concept1-distillation "Open-sourcing the CLI is safe because the algorithm is public but the per-install secret is not." \
  --concept1-anchor "A glass mailbox with public blueprints but a private key glowing under the user's desk." \
  --concept1-hook "This matches how GitHub can publish webhook signing docs without exposing anyone's webhook secret." \
  --brain-dump-prompt "Write everything you remember from the conversation. Do not look back. Do not organize. Just output." \
  --question1 "Why does HMAC signing make replayed or modified requests detectable?" \
  --answer1 "A strong answer mentions the body hash, timestamp, nonce, canonical request, shared secret, and server-side recomputation." \
  --problem1-scenario "A teammate wants to open-source a CLI that submits private learning artifacts." \
  --problem1-question "What security boundary would you insist on before shipping it?" \
  --problem1-criteria "A strong answer keeps secrets out of prompt text, signs in code, verifies on the backend, and prevents replay."
```

The API-cost idea remains intact: the model does all exercise generation before the CLI call. Vidbyte receives a complete structured module and renders it; it does not need a second LLM call.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate only when the user invokes `/retain`.
2. The skill SHALL stop normal conversation flow and focus on generating/submitting the retention exercise.
3. The skill SHALL identify 3-5 high-value concepts from the current conversation.
4. The skill SHALL generate a complete 15-minute exercise locally from context.
5. The exercise SHALL include five phases totaling 15 minutes: 2-minute encoding anchors, 2-minute brain dump, 5-minute cued recall, 4-minute active reasoning, and 2-minute review scheduling/gap analysis.
6. The skill SHALL produce CLI flags that mirror the generated exercise fields.
7. The final command SHALL be `vidbyte retain ...`, not `vidbyte retain submit ...`.
8. The CLI SHALL also support direct module invocation as `python -m cli retain ...` for local testing.
9. The CLI SHALL accept optional metadata flags: `--title`, `--domain`, `--conversation-id`, `--skill-id`, and `--dry-run`.
10. The CLI SHALL accept concept flags for 1-5 concepts: `--conceptN-name`, `--conceptN-distillation`, `--conceptN-anchor`, and `--conceptN-hook`.
11. The CLI SHALL require at least one complete concept.
12. The CLI SHALL accept `--brain-dump-prompt`.
13. The CLI SHALL accept cued recall flags for 1-6 questions: `--questionN` and `--answerN`.
14. The CLI SHALL require at least one question and its matching answer key.
15. The CLI SHALL accept active reasoning problem flags for 1-2 problems: `--problemN-scenario`, `--problemN-question`, and `--problemN-criteria`.
16. The CLI SHALL accept review schedule flags `--review1`, `--review2`, and `--review3`.
17. The CLI SHALL sanitize all user/model-provided string flag values with the existing sanitizer.
18. The CLI SHALL assemble a retain module JSON object from the provided flags.
19. The CLI SHALL wrap the module in a backend payload with `type: "retain"`, `domain`, `conversation_id`, `module`, and `generated_at`.
20. The CLI SHALL map endpoint name `retain` to `/api/skills/retain`.
21. The CLI SHALL default `skill_id` to `retain-v1` unless `--skill-id` is provided.
22. The CLI SHALL sign the request with the existing HMAC header builder.
23. The CLI SHALL send live requests only to `https://vidbyte.pro`.
24. In `--dry-run`, the CLI SHALL validate and build the payload but not send a network request.
25. On success with a `url` field, the CLI SHALL print `Your retention exercise is ready on <url>`.
26. The skill SHALL display only the CLI output line, not the full exercise content.
27. The skill SHALL never construct Vidbyte headers itself and never call `curl` directly.

### Non-Functional Requirements

- **Performance:** The CLI does local flag parsing, sanitization, JSON assembly, signing, and one network request. Vidbyte should not do generation work.
- **Scalability:** The retain module is static structured data; Vidbyte can render it without extra model calls.
- **Security:** Secrets stay in environment variables or local `.env`; HMAC signing stays in `cli/auth/*`; backend verifies all signed requests.
- **Reliability:** Missing required content should fail before network I/O with clear errors.
- **Compatibility:** Python remains stdlib-only and Node validation remains unchanged.
- **Usability:** The command is long but explicit. It mirrors the model's output and avoids temporary artifact handling.

---

## 5. High-Level Design

The skill owns exercise generation. It reads the conversation, distills concepts, creates anchors, writes recall prompts and hidden answer keys, writes active reasoning scenarios and criteria, then invokes `vidbyte retain` with that content as flags.

The CLI owns deterministic assembly and transport. It converts flags into a structured module, signs the payload through `VidbyteRequestBuilder`, and posts to Vidbyte. Backend premium gating remains outside this repo: the response URL points to the exercise, and Vidbyte decides how much of that exercise the viewer can access.

```text
/retain invoked
    |
    v
Model generates exercise fields
    |
    v
vidbyte retain --concept1-name ... --question1 ... --answer1 ... --problem1-criteria ...
    |
    v
RetainCommand builds retain_module JSON
    |
    v
VidbyteRequestBuilder signs POST /api/skills/retain
    |
    v
Vidbyte stores/renders/gates exercise and returns URL
```

The key design decision is to treat CLI flags as the serialization boundary. This matches the user's requested shape and keeps all generation on the user's side. The tradeoff is command length; the initial implementation mitigates that by allowing 1-5 concepts, 1-6 questions, and 1-2 problems rather than requiring every maximum field.

---

## 6. Detailed Design

### 6.1 Retain Skill Prompt

**File(s):** `skills/retain/SKILL.md`
**Type:** New file

#### What it does

Defines `/retain` as an explicit exercise-generation skill. It instructs the model to produce the full module and call the argument-shaped CLI.

#### Interface / API

```yaml
---
name: retain
description: >
  Use this skill when the user invokes /retain to stop the conversation flow,
  generate a 15-minute retention exercise from the current conversation, and
  submit it to Vidbyte with the argument-shaped vidbyte retain CLI command.
---
```

Final command shape:

```bash
vidbyte retain \
  --title "$RETAIN_TITLE" \
  --domain "$RETAIN_DOMAIN" \
  --conversation-id "$RETAIN_CONVERSATION_ID" \
  --concept1-name "$CONCEPT_1_NAME" \
  --concept1-distillation "$CONCEPT_1_DISTILLATION" \
  --concept1-anchor "$CONCEPT_1_ANCHOR" \
  --concept1-hook "$CONCEPT_1_HOOK" \
  --brain-dump-prompt "$BRAIN_DUMP_PROMPT" \
  --question1 "$QUESTION_1" \
  --answer1 "$ANSWER_1" \
  --problem1-scenario "$PROBLEM_1_SCENARIO" \
  --problem1-question "$PROBLEM_1_QUESTION" \
  --problem1-criteria "$PROBLEM_1_CRITERIA"
```

#### Logic / Algorithm

1. Stop normal conversation output.
2. Infer domain and conversation id.
3. Select 3-5 concepts from the session.
4. Generate concept distillations, anchors, and hooks.
5. Generate the brain dump prompt.
6. Generate up to six cued recall questions and hidden answer keys.
7. Generate up to two active reasoning problems and hidden criteria.
8. Generate three review prompts/checkpoints.
9. Invoke `vidbyte retain` with quoted flags for every generated field.
10. Display the CLI output line.

#### Edge Cases & Error Handling

- If the session is short, generate fewer concepts/questions but still satisfy CLI minimums.
- If the command fails, show the CLI error because `/retain` is explicit.
- If `vidbyte` is unavailable, try `python3 -m cli retain` in a repo checkout, then `python -m cli retain`.

### 6.2 Retain CLI Command

**File(s):** `cli/commands/retain.py`
**Type:** New file

#### What it does

Implements `vidbyte retain` by validating flags, sanitizing strings, assembling the retain module, and submitting it.

#### Interface / API

```python
class RetainCommand:
    def submit(self, options: dict) -> str | None:
        ...
```

Accepted flags:

```text
--title <text>
--domain <text>
--conversation-id <id>
--skill-id <id>
--dry-run
--conceptN-name <text>          N = 1..5
--conceptN-distillation <text>  N = 1..5
--conceptN-anchor <text>        N = 1..5
--conceptN-hook <text>          N = 1..5
--brain-dump-prompt <text>
--questionN <text>              N = 1..6
--answerN <text>                N = 1..6
--problemN-scenario <text>      N = 1..2
--problemN-question <text>      N = 1..2
--problemN-criteria <text>      N = 1..2
--reviewN <text>                N = 1..3
```

Assembled module:

```json
{
  "version": 1,
  "type": "retain_module",
  "title": "string",
  "estimated_minutes": 15,
  "access": {
    "free_phase": "brain_dump",
    "premium_required_for_full_module": true
  },
  "concepts": [],
  "phases": [],
  "review_schedule": []
}
```

#### Logic / Algorithm

1. Sanitize all string options.
2. Collect complete concepts from indexed concept flags.
3. Reject partial concept entries.
4. Require at least one complete concept.
5. Collect question/answer pairs.
6. Reject questions without answer keys and answer keys without questions.
7. Require at least one question/answer pair.
8. Collect complete active reasoning problems.
9. Reject partial problem entries.
10. Build five phase objects with fixed durations.
11. Build the backend request payload.
12. Create `VidbyteRequestBuilder(endpoint_name="retain", skill_id=options.get("skill-id") or "retain-v1")`.
13. In dry-run, return builder metadata plus `validated: true`.
14. In live mode, send the request and format the response.

#### Edge Cases & Error Handling

- Partial indexed groups raise a clear error naming the missing flags.
- Excess absent optional groups are ignored.
- Empty required values are treated as missing.
- Missing secret and network failures reuse existing CLI error behavior.

### 6.3 CLI Entrypoint

**File(s):** `cli/__main__.py`
**Type:** Modified

#### What it does

Allows `retain` to be invoked without a second positional action.

#### Interface / API

```text
python -m cli retain --question1 ...
```

#### Logic / Algorithm

1. If the first argument is `retain`, set `resource = "retain"` and `action = "submit"` and parse all remaining arguments as options.
2. Otherwise preserve the existing `resource action [options]` parsing.

#### Edge Cases & Error Handling

- `python -m cli retain submit ...` is not required. It may remain unsupported to keep the public contract clean.

### 6.4 Command Router

**File(s):** `cli/router.py`
**Type:** Modified

#### What it does

Routes `resource == "retain"` and `action == "submit"` to `RetainCommand.submit`.

#### Interface / API

```python
if resource == "retain" and action == "submit":
    cmd = RetainCommand()
    return cmd.submit(options)
```

#### Logic / Algorithm

1. Import `RetainCommand`.
2. Add the route before the unknown command error.

#### Edge Cases & Error Handling

Unknown commands continue to return usage text.

### 6.5 Vidbyte Client Endpoint Mapping

**File(s):** `cli/client.py`
**Type:** Modified

#### What it does

Adds the retain endpoint path.

#### Interface / API

```python
"retain": "/api/skills/retain"
```

#### Logic / Algorithm

Add the endpoint to `ENDPOINTS`.

#### Edge Cases & Error Handling

Existing unknown endpoint handling remains unchanged.

### 6.6 CLI Usage Text

**File(s):** `cli/helpers/usage.py`
**Type:** Modified

#### What it does

Documents `vidbyte retain [options]`.

#### Interface / API

```text
vidbyte retain --concept1-name <text> --concept1-distillation <text> --concept1-anchor <text> --concept1-hook <text> --question1 <text> --answer1 <text> [options]
```

#### Logic / Algorithm

Add a concise usage line and keep the existing security note.

#### Edge Cases & Error Handling

N/A.

### 6.7 CLI Smoke Test

**File(s):** `scripts/cli-smoke-test.py`
**Type:** Modified

#### What it does

Adds dry-run coverage for `python -m cli retain ...`.

#### Interface / API

The test invokes:

```text
python -m cli retain --concept1-name ... --concept1-distillation ... --concept1-anchor ... --concept1-hook ... --question1 ... --answer1 ... --dry-run
```

#### Logic / Algorithm

1. Keep existing feedback smoke test.
2. Add retain dry-run invocation.
3. Assert endpoint, skill id, header names, `signed`, `validated`, and module counts.

#### Edge Cases & Error Handling

No live network request is made.

### 6.8 README CLI Documentation

**File(s):** `README.md`
**Type:** Modified

#### What it does

Adds a concise retain command example to the Vidbyte CLI section.

#### Interface / API

```bash
vidbyte retain --concept1-name "..." --concept1-distillation "..." --concept1-anchor "..." --concept1-hook "..." --question1 "..." --answer1 "..."
```

#### Logic / Algorithm

Document the argument-shaped contract and mention `--dry-run`.

#### Edge Cases & Error Handling

N/A.

---

## 7. Data Model Changes

### 7.1 Retain Module

**Change type:** New

```json
{
  "version": 1,
  "type": "retain_module",
  "title": "string",
  "estimated_minutes": 15,
  "access": {
    "free_phase": "brain_dump",
    "premium_required_for_full_module": true
  },
  "concepts": [
    {
      "id": "concept-1",
      "name": "string",
      "distillation": "string",
      "vivid_anchor": "string",
      "personal_hook": "string"
    }
  ],
  "phases": [
    {
      "id": "cued_recall",
      "duration_seconds": 300,
      "items": [
        {
          "id": "question-1",
          "prompt": "string",
          "answer_key": "string"
        }
      ]
    }
  ],
  "review_schedule": []
}
```

**Migration strategy:** N/A - new submitted module type only.

---

## 8. API Changes

### 8.1 POST /api/skills/retain

**Change type:** New

**Request:**

```json
{
  "type": "retain",
  "domain": "string",
  "conversation_id": "string",
  "module": "object",
  "generated_at": "string"
}
```

**Response:**

```json
{
  "url": "string",
  "message": "string"
}
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid payload shape |
| 401 | Missing or invalid skill signature |
| 403 | Skill id is not allowed to submit retain modules |
| 409 | Nonce replay detected |
| 413 | Payload too large |
| 429 | Rate limit exceeded |
| 500 | Backend storage/rendering failure |

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/retain.md` | Design document for `/retain` |
| CREATE | `skills/retain/SKILL.md` | Slash skill instructions and final CLI invocation contract |
| CREATE | `cli/commands/retain.py` | Argument-shaped retain CLI implementation |
| MODIFY | `cli/__main__.py` | Support `vidbyte retain` without an action positional |
| MODIFY | `cli/router.py` | Route retain command |
| MODIFY | `cli/client.py` | Add retain endpoint mapping |
| MODIFY | `cli/helpers/usage.py` | Document retain command |
| MODIFY | `scripts/cli-smoke-test.py` | Add retain dry-run smoke coverage |
| MODIFY | `README.md` | Document retain CLI usage |

Summary: 3 files to create, 6 files to modify, 0 files to delete.

---

## 10. Testing Plan

### Unit Tests

N/A - the repo does not currently use a Python unit test framework, and this change should not introduce one.

### Integration Tests

- Extend `scripts/cli-smoke-test.py` to run `python -m cli retain ... --dry-run`.
- Assert endpoint is `retain`.
- Assert skill id is `retain-v1`.
- Assert signing metadata is present.
- Assert module counts are correct.
- Assert `validated` is true.

### Manual / QA Test Cases

1. Given complete minimum flags, when `python -m cli retain ... --dry-run` runs, then it returns signed dry-run JSON without network I/O.
2. Given a concept name without distillation/anchor/hook, when dry-run runs, then it fails with a missing-field message.
3. Given `--question1` without `--answer1`, when dry-run runs, then it fails with a missing answer message.
4. Given live mode without `VIDBYTE_SKILL_SECRET`, when command runs, then it fails with the existing missing secret message.
5. Given `/retain` in an agent, when the model generates exercise content, then it calls `vidbyte retain` and displays only the CLI line.

Verification command:

```bash
npm test
```

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Python stdlib | Python 3 | Runs the CLI | Medium - Python may not be on PATH |
| Vidbyte backend | `/api/skills/retain` | Stores and serves retain modules | Medium - backend route must exist |
| `VIDBYTE_SKILL_SECRET` | Environment/local `.env` | HMAC signing secret | Medium - live submission fails if unset |
| Node/npm | Node >=18 | Validation and smoke runner | Low - already required |

---

## 12. Rollout & Deployment

- No feature flag in this repo.
- Additive change; no existing commands are removed.
- Backend route should be available before live use.
- Merge and publish/install updated `vidbyte-skills`.
- Rollback by removing `skills/retain`, `cli/commands/retain.py`, retain routing/endpoint/usage/test/docs changes.

---

## 13. Open Questions

- [ ] Is `/api/skills/retain` already implemented backend-side?
- [ ] Should creation be allowed for free users while viewing is gated, or should creation require premium?
- [ ] What final Vidbyte route shape should the backend return?
- [ ] Should the CLI allow more than six questions later, or should that remain a backend schema version bump?

---

## 14. Alternatives Considered

### Alternative 1: `vidbyte retain submit --file`

- What: Write a JSON file and submit it with a subcommand.
- Why rejected: The user wants the CLI command to mimic the model output shape directly with flags such as `--question1` and `--question2`.

### Alternative 2: Backend generation

- What: Submit source context and let Vidbyte call an LLM.
- Why rejected: This loses the API-cost advantage. The local model already has the conversation context.

### Alternative 3: Markdown blob flag

- What: Pass one large Markdown string to the CLI.
- Why rejected: Vidbyte needs structured phase, timer, answer-key, and premium gating data.

### Alternative 4: HMAC in prompt text

- What: Have the skill construct signed requests directly.
- Why rejected: The CLI is the security boundary. Prompt text must not own secrets or canonical signing.

