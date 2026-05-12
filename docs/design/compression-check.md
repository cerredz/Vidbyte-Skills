# Design Doc: Compression Check Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-11
**Last Updated:** 2026-05-11

---

## 1. Overview

The `compression-check` skill is a silent background coach that periodically asks the user to articulate what they just built and why — then evaluates their response against the actual conversation, submits the evaluation to the Vidbyte backend via the `python3 -m cli compressor submit --file <tempfile>` command, and displays the one-line response returned by the CLI. Over time, these compression checks compound into a learning history that reveals patterns across sessions: which concepts the user can implement but cannot explain. The terminal stays clean, the workflow is barely touched, and the feedback lives on Vidbyte as a persistent artifact.

---

## 2. Goals & Non-Goals

### Goals
- Create a single `SKILL.md` that the LLM agent reads and follows as procedural instructions
- Silently count user prompts every session, randomized threshold between 5-8
- At threshold, inject a single alignment-framed question asking the user to bullet-point what they built and why
- Evaluate the user bullet-point summary against actual conversation context (accuracy, gaps, misconceptions, depth)
- Package the evaluation along with the user summary and conversation context
- Invoke `python3 -m cli compressor submit --file <tempfile>` to persist the evaluation to the Vidbyte backend
- Receive and display the one-line output returned by the CLI (e.g., "Check out the full response to your summary on https://vidbyte.pro/artifacts/<id>")
- Ensure the normal workflow is minimally interrupted — the question is additive, not disruptive
- Reference the `/feedback` skill and Vidbyte feedback page so the user has a full learning chain

### Non-Goals
- Installing any new runtime code (the skill is a prompt, not executable code)
- Modifying the installer (`bin/`, `lib/`) — this is a standard, auto-discovered skill
- Modifying validation scripts — the skill passes existing validation unchanged
- Persisting any files to disk — all state is session-local (prompt counter, threshold, check history)
- Showing feedback inline — all evaluation goes to the backend, only the URL is displayed
- Evaluating every prompt — checks occur at randomized intervals only (5-8 prompts)
- Replacing the normal response — the question is injected alongside the response
- Interrupting debugging, error-handling, or troubleshooting flows
- Calling the user response a "quiz" or asking them to "summarize" — framing is always "alignment" or "compression check"

---

## 3. Background & Context

In long coding sessions, users execute many prompts but rarely stop to compress what they have learned. The act of articulating what was built and why forces metacognitive processing — it surfaces gaps between "I can do this" and "I can explain this." Research on the generation effect shows that self-generated explanations produce stronger and more durable learning than passive consumption.

The `why` skill already exists in this repo as a metacognitive coach that asks reflective questions. The `do-not-repeat` skill tracks repeated errors across sessions. The `curiosity` skill detects and amplifies curiosity signals. Missing from this suite is a skill that:
1. Periodically triggers a compression/articulation moment
2. Evaluates the user self-explanation against reality
3. Persists the evaluation as a learning artifact that compounds over time

The `compression-check` skill fills this gap. It is structurally similar to `why` (silent background monitor, randomized cadence, prompt counting) but adds three layers:
- **Collection**: It asks the user to articulate, then captures their response
- **Evaluation**: It internally evaluates the user summary against the conversation
- **Persistence**: It submits the evaluation to Vidbyte backend, creating a durable learning record accessible at a URL

The referenced `/feedback` skill (on Vidbyte) provides the feedback viewing experience. The `/compressor` prompt context in this skill should reference that the user can review their full feedback breakdown at the returned URL.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL insert itself into every agent session silently and monitor the prompt count.
2. The skill SHALL maintain a session-local prompt counter, incrementing by 1 for each user message, resetting to 0 when a new session begins.
3. The skill SHALL determine a randomized check threshold at the start of each session: a number between 5 and 8 (inclusive). When the prompt counter reaches this threshold, the skill SHALL inject a compression check question.
4. After completing a compression check cycle, the skill SHALL randomly select a new threshold (between 5 and 8 prompts from the current position) for the next check.
5. Before injecting, the skill SHALL evaluate whether the current user prompt is appropriate using skip rules (see requirement 6).
6. The skill SHALL skip the compression check (defer to next threshold) when the user current prompt matches any of these conditions:
   - The prompt is 3 or more paragraphs long (detailed specification/planning)
   - The prompt contains explicit reasoning, justification, or tradeoff analysis
   - The user is in a debugging/troubleshooting flow (error messages, stack traces)
   - The user prompt is a simple yes/no/inline continuation of a prior thread
   - The user is already asking a reflective question ("why does this work?", "what am I missing?")
   - The user prompt is the response to a prior compression check question (prevents cascading checks)
7. When injection is warranted, the skill SHALL prepend a compression check question to the normal response, formatted as a collaborative alignment check (NOT a quiz, NOT a summary request). Example phrasing: "Before we move on — in a few bullet points, what did we just build and why did we do it this way?"
8. The question SHALL be prefixed with a subtle visual marker and separated from the normal response by blank lines.
9. After the user responds with their bullet points, the skill SHALL internally evaluate the summary against the actual conversation:
   - **Accuracy check**: Did they correctly describe what was implemented?
   - **Gap detection**: What was omitted that was significant?
   - **Misconception detection**: What did they get wrong or frame incorrectly?
   - **Depth assessment**: How well do they understand the "why" (tradeoffs, rationale, alternatives)?
10. The skill SHALL construct an evaluation payload containing:
    - The user bullet-point summary
    - A condensed representation of the relevant conversation context (the work actually done)
    - The model evaluation: what they got right, what they missed, concepts they are shaky on, and a suggested follow-up question
    - References to the `/feedback` skill for full viewing context
11. The skill SHALL invoke the `python3 -m cli compressor submit --file <tempfile>` command, writing the evaluation payload to a temp file first.
12. The skill SHALL display the CLI output line exactly as-is to the user (no modification or wrapping).
13. The skill SHALL display exactly one clean line to the user: the output returned by the CLI.
14. The skill SHALL NOT display the evaluation inline. All feedback detail lives at the URL.
15. The skill SHALL NOT persist any state to disk. All state (prompt counter, threshold, check history) is session-local.
16. The skill SHALL NOT use the words "quiz", "test", "summarize", or "summary" in the injected question. Framing is always "alignment check" or "compression check."
17. The tone of the question SHALL be collaborative and casual, as if a pair-programming partner is checking alignment — never evaluative or judgmental.

### Non-Functional Requirements

- **Performance**: Negligible overhead. The CLI invocation (`python3 -m cli compressor submit --file <tempfile>`) is the only external call and runs asynchronously. Context processing is limited to the relevant conversation segment.
- **Scalability**: No persistent state. Each session is independent. The Vidbyte backend handles persistence.
- **Security**: The CLI invocation passes evaluation data to the Vidbyte backend. No credentials or secrets are stored in the SKILL.md. The CLI is assumed to be pre-authenticated by the user.
- **Observability**: The question injection and URL display are the only visible outputs.
- **Reliability**: If the CLI fails or is unavailable, the skill SHALL silently skip the submission and continue. If the CLI succeeds but returns an unexpected format, the skill SHALL display the raw output as-is. Conservative fallback prevents workflow disruption.

---

## 5. High-Level Design

The skill is a single `SKILL.md` file containing the complete procedural instructions for the LLM agent. The agent reads these instructions at session start and follows them deterministically.

**Data flow:**

```
User Prompt -> [Agent with compression-check skill loaded]
                   |
                   +-- Prompt counter incremented
                   |
                   +-- Counter reaches randomized threshold (5-8)?
                   |         |
                   |         No --> Normal response, silent
                   |         |
                   |        Yes
                   |         |
                   |         v
                   |   Evaluate skip rules:
                   |   - 3+ paragraphs? Skip
                   |   - Explicit reasoning? Skip
                   |   - Debugging flow? Skip
                   |   - Yes/no follow-up? Skip
                   |   - User asking reflective Q? Skip
                   |   - Response to prior check? Skip
                   |         |
                   |    +----+----+
                   |    v         v
                   |   Skip?    Don't skip?
                   |    |         |
                   |    v         v
                   |   Defer     Inject compression check question
                   |   to next   (prepended to normal response)
                   |   threshold |
                   |             |
                   |             v
                   |           User responds with bullet points
                   |             |
                   |             v
                   |           Model internally evaluates:
                   |           - Accuracy / Gaps / Misconceptions / Depth
                   |             |
                   |             v
                   |           Construct evaluation payload
                   |           (summary + context + evaluation + follow-up)
                   |             |
                   |             v
                   |           Run: python3 -m cli compressor submit --file <tempfile>
                   |             |
                   |    +--------+--------+
                   |    v                 v
                   |   Success          Failure
                   |    |                 |
                   |    v                 v
                   |   Parse URL        Silent fallback
                   |   from output      (no disruption)
                   |    |
                   |    v
                   |   Display CLI output:
                   |   "Check out the full response
                   |    to your summary on
                   |    https://vidbyte.pro/artifacts/abc123"
                   |    |
                   |    v
                   |   Randomize next threshold (5-8)
                   |
                   +-- Continue normal operation
```

**Key design decisions:**

1. **Randomized cadence (5-8, not 5-10 like why)**: The compression check is more frequent because it targets articulation of recently completed work rather than probing assumptions mid-work. A shorter interval ensures checks happen while context is still fresh.

2. **External CLI for persistence**: Unlike `do-not-repeat` file-based tracking, feedback persistence is delegated to `python3 -m cli compressor submit --file <tempfile>`. This keeps the skill simple (no file I/O logic besides temp file creation) and enables the Vidbyte web dashboard experience. The CLI handles signing, headers, and transport — the SKILL.md does not construct headers or call URLs directly.

3. **URL-only display**: The evaluation is never displayed inline. This keeps the terminal clean (one line) and drives the user to the Vidbyte feedback page, where the full breakdown is formatted for consumption and stored in their learning history.

4. **Session-local state only**: Same design as `why` — no cross-session persistence. Each session starts fresh with a new randomized threshold. The learning history lives in Vidbyte, not in the skill.

5. **Evaluation done internally by the model**: The model performs the accuracy/gap/misconception/depth evaluation using its own reasoning capabilities, then packages it for submission. No external evaluation service is needed.

6. **Skip rules prevent disruption**: Debugging flows, long specifications, and explicit reasoning prompts are skipped — same protective logic as `why` but extended with a "response to prior check" rule to prevent cascading checks.

7. **Alignment framing, never quiz framing**: The question is always framed as a collaborative alignment check. This phrasing is tested to feel like a pair-programming partner checking in, not a teacher administering a test.

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition)

**File(s):** `skills/compression-check/SKILL.md`
**Type:** New file

#### What it does
The complete compression check skill definition. Contains YAML frontmatter for discovery/installation, plus the full algorithmic instructions the LLM agent follows at runtime: counting prompts, evaluating context, injecting questions, evaluating responses, submitting feedback via CLI, and displaying the result URL.

#### Interface / API

Frontmatter:
```yaml
---
name: compression-check
description: >
  A silent background coach that periodically asks you to articulate what you just built and why,
  evaluates your response against the actual conversation, and submits the feedback to Vidbyte
  for a persistent learning record. Use automatically — no user invocation needed.
  Runs silently in the background.
---
```

Body sections:
1. **Identity** — Silent background coach; never calls this a quiz or test; frames everything as alignment.
2. **Goal** — Trigger compression/articulation moments, evaluate self-explanations, persist feedback to Vidbyte.
3. **Step-by-Step Execution** — 6 steps (Initialize, Count, Evaluate Skip Rules, Inject Question, Evaluate Response, Submit Feedback).
4. **Question Format** — Exact phrasing and formatting rules for the compression check question.
5. **Evaluation Framework** — The four dimensions: accuracy, gaps, misconceptions, depth. How to score each.
6. **Feedback Payload Structure** — What gets submitted via the CLI.
7. **Skip Rules** — 6 rules with detailed descriptions.
8. **Constraints** — Guardrails (no inline feedback, no persistent files, no judgment, no cascade checks).
9. **Success Criteria** — Verifiable outcomes.
10. **Input** — Automatic activation, no slash command needed.

#### Logic / Algorithm

**Step 0 — Initialization (session start):**
1. Initialize a session-local prompt counter to 0.
2. Randomly select the first compression check threshold: a number between 5 and 8 (inclusive).
3. Initialize an empty session-local variable for the current check state (null = no check in progress, object = check in progress awaiting user response).

**Step 1 — Prompt counter tracking:**
1. For each user message, increment the prompt counter by 1.
2. If a compression check is currently in progress (state is not null), go to Step 4 (Evaluate Response).
3. Otherwise, compare the counter to the current threshold.
4. If counter < threshold: produce a normal response. No question injected.
5. If counter == threshold: proceed to Step 2.

**Step 2 — Evaluate skip rules:**
Before injecting, review the current user prompt against these skip rules. If ANY rule matches, defer the injection:

- **Skip Rule 1 — Long Spec**: The user prompt contains 3 or more substantial paragraphs (3+ sentences each). Detailed specification indicates active engagement — skip.
- **Skip Rule 2 — Explicit Reasoning**: The user already included justification, tradeoff analysis, or explicit reasoning in their prompt (e.g., "I chose X because...", "the tradeoff here is..."). They are already thinking — skip.
- **Skip Rule 3 — Debugging Flow**: The user prompt contains error messages, stack traces, debug output, or troubleshooting language (e.g., "debug this", "something is broken"). Interrupting debugging is harmful — skip.
- **Skip Rule 4 — Simple Follow-up**: The user prompt is a brief yes/no, confirmation, or inline response to a prior question from the model (e.g., "yes", "no", "that works", "sure"). These are continuations — skip.
- **Skip Rule 5 — User Already Reflecting**: The user is already asking a reflective or metacognitive question (e.g., "why does this work?", "what am I missing?", "is this the right approach?"). Do not stack reflection on reflection — skip.
- **Skip Rule 6 — Response to Prior Check**: The user prompt contains bullet points that look like a response to a compression check question (short bulleted list summarizing work done). This prevents the skill from triggering back-to-back checks — skip.

If any skip rule matches: set the new threshold to current counter + random(5, 8). Produce a normal response. Do not inject.

If no skip rules match: proceed to Step 3.

**Step 3 — Inject compression check question:**

1. Formulate the compression check question. Use one of these variants, rotated to avoid feeling repetitive:
   - "Before we move on — in a few bullet points, what did we just build and why did we do it this way?"
   - "Quick alignment check — bullet point what we just worked on and the reasoning behind the approach?"
   - "Let me make sure I am tracking — in a few bullets, what did we accomplish and what drove the key decisions?"
   - "Pause for a sec — can you bullet out what we just built and the rationale for the approach?"

2. Vary the phrasing between checks within the same session. Never use the same variant twice in a row.

3. **Format the injection.** The question is prepended to the normal response, separated by blank lines:

```
💬 [The injected question — one sentence, casual, collaborative tone]

[The normal response follows below, complete and uninterrupted.]
```

4. Set the compression check state to "awaiting_response" and store the prompt counter value at which the question was asked (to correlate with the user upcoming response).

5. Set the new threshold to current counter + random(5, 8) (this will not be used until after the current check completes).

6. Deliver the response (question + normal answer).

**Step 4 — Evaluate the user response:**

When the user sends a message and the check state is "awaiting_response":

1. Capture the user response as their compression check summary.
2. Clear the check state (set to null).
3. Internally evaluate the user bullet points against the actual conversation context (the work done between the previous check and this check, or from session start if this is the first check):

   a. **Accuracy**: Did they correctly describe what was actually implemented? Compare their claims to the actual code, config, or decisions made. Note specific matches and mismatches.

   b. **Gaps**: What significant work, decisions, or concepts were omitted from their summary? Note the most important omissions — things that suggest they may not have internalized certain parts of the work.

   c. **Misconceptions**: Did they describe anything incorrectly? Did they attribute the wrong rationale to a decision? Did they misunderstand how something works? Note specific corrections.

   d. **Depth**: How well do they understand the "why" — the tradeoffs, the rationale for choosing approach A over B, the architectural thinking? Rate the depth qualitatively and note what is missing.

4. Produce a structured evaluation in this format (this goes to the CLI, not to the user):

```
## COMPRESSION CHECK EVALUATION

### What they got right
- [Bullet list of accurate observations]
- [Specific correct claims matched to actual work]

### What they missed
- [Bullet list of significant omissions]
- [Concepts or decisions they did not articulate]

### Concepts they are shaky on
- [Bullet list of misconceptions or partial understandings]
- [What the correct understanding would be]

### Depth assessment
[1-2 sentences on their demonstrated understanding of the why]

### Suggested follow-up
[A specific question tailored to their gaps]

### Reference
Full feedback breakdown available via /feedback
```

5. Proceed to Step 5.

**Step 5 — Submit feedback to Vidbyte:**

1. Construct the full feedback payload. The payload includes:
   - The user bullet-point summary (verbatim)
   - A condensed summary of the relevant conversation context (what was actually done)
   - The evaluation from Step 4 (all four dimensions + suggested follow-up)
   - Metadata: session timestamp, skill version, reference to `/feedback` skill

2. Write the payload to a temporary file and invoke the compressor CLI command:

   ```
   python3 -m cli compressor submit --file <tempfile>
   ```

   This is the only supported invocation pattern. The CLI handles signing (HMAC-SHA256 with skill secret), header construction, backend routing, and transport via `POST /api/skills/compressor`. Do not construct headers or call URLs directly.

   If `python3` is not available, try `python`. If neither is available, fail silently.

3. Parse the CLI output. The CLI prints exactly one line on success:
   - With URL in response: `Check out the full response to your summary on https://vidbyte.pro/artifacts/<id>`
   - With only message: the backend's human-readable status message
   - With neither: the raw JSON response body

   Display the CLI output line exactly as-is to the user. Do not modify or wrap it.

4. Handling outcomes:
   - **CLI succeeds**: Display the CLI output line alongside the normal response.
   - **CLI not found or fails**: Silently skip. Display nothing.
   - **Any other failure**: Silently skip. Display nothing.

5. Clean up the temporary file immediately after the CLI call completes.

6. Proceed to Step 6.

**Step 6 — Return to normal operation:**
- Deliver the normal response (the model answer to whatever the user just asked).
- If the CLI succeeded, the output line appears above or below the normal response, cleanly separated.
- The prompt counter continues incrementing normally.
- The next check will trigger when the counter reaches the (already-set) new threshold.

#### Edge Cases & Error Handling

- **First prompt of session**: Counter is 1. Threshold is between 5-8. No check possible yet. Normal.
- **User ignores the compression check question**: If the user response contains no bullet points and does not look like a summary, treat as a normal prompt. Do not evaluate. Reset check state to null.
- **User responds with "skip" or "not now"**: Clear the check state. Continue normally. Do not submit anything.
- **Short session (< 5 prompts)**: No compression check occurs. Expected.
- **Back-to-back checks prevented by Skip Rule 6**: The user bullet-point response to a check increments the counter by 1, and the counter is then compared to the new threshold (5-8 away) before another check can fire.
- **Conversation context too sparse for evaluation**: If the work done between checks was minimal (just clarifications or trivial tasks), note this in the evaluation. Still evaluate what was done.
- **User provides an extremely detailed summary**: Evaluate it fully. If it exceeds CLI argument limits, use the file-based fallback.
- **vidbyte CLI not installed**: Silently skip submission. The question is still asked (metacognitive benefit of articulation remains), but no feedback is persisted.
- **vidbyte CLI authenticated but backend unreachable**: Silently skip. Do not surface the error to the user.
- **URL format is unexpected**: Attempt to extract any URL-like string from the output. If none found, display the generic "Feedback submitted" message.

### 6.2 No Additional Files

**Type:** N/A — No runtime files, no tracking files, no dependencies.

The `compression-check` skill stores no state on disk. All state (counter, threshold, check state) is session-local. The Vidbyte backend handles persistent storage of evaluation data.

---

## 7. Data Model Changes

N/A — The skill maintains no persistent data within the repo. All persistent data (evaluation records, learning history) is stored by the Vidbyte backend.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. The skill consumes the Vidbyte backend API indirectly through the `python3 -m cli compressor submit --file <tempfile>` command, which handles transport and signing.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/compression-check/SKILL.md` | Core skill definition — the entire implementation |
| CREATE | `docs/design/compression-check.md` | This design document |

**Total: 2 files created (in repo), 0 modified, 0 deleted.**

No runtime files are created by the skill at runtime.

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. The skill is a Markdown prompt.

### Integration Tests
N/A — The skill operates within the LLM session context. The Vidbyte CLI and backend integration must be tested separately.

### Validation Tests
- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/compression-check/SKILL.md` exists
  - Frontmatter has valid `name: compression-check` matching the directory
  - Frontmatter has non-empty `description`
  - Body is non-empty
  - Skill name matches `^[a-z0-9]+(-[a-z0-9]+)*$` regex

### Manual / QA Test Cases

1. **First 4 prompts — silent**: Given a new session, when the user sends 4 prompts, then the skill produces no compression check questions and normal responses are delivered unchanged.

2. **First check at threshold (5-8)**: Given the counter reaches the threshold, when the user sends a prompt that does not match any skip rule, then exactly one compression check question is injected into the response, separated by blank lines.

3. **Skip on debugging**: Given the counter reaches the threshold, when the user sends an error message with "debug this", then the check is deferred and the threshold is reset.

4. **Skip on long spec**: Given the counter reaches the threshold, when the user sends a 3+ paragraph detailed specification, then the check is deferred.

5. **Skip on response to prior check**: Given a check was just asked, when the user responds with bullet points, then Skip Rule 6 fires and the next check is deferred.

6. **User provides bullet-point summary**: Given a compression check question was injected, when the user responds with bullet points summarizing what they built, then the model evaluates accuracy, gaps, misconceptions, and depth internally.

7. **Feedback submission success**: Given a valid evaluation payload and a working CLI, when feedback is submitted, then the output contains a friendly message with the artifacts URL and the user sees a one-line response.

8. **Feedback submission failure (CLI not found)**: Given the `vidbyte` CLI is not installed, when the evaluation is complete, then no feedback is submitted and no error is shown to the user.

9. **Normal response intact**: Given a compression check question is injected, when the response is delivered, then the full normal response is present below the question.

10. **No file artifacts**: Given any number of sessions, when the skill runs, then no persistent files are created on disk.

11. **Question phrasing varies**: Given two compression checks in the same session, when questions are injected, then the phrasing differs between checks.

12. **Threshold randomization**: Given two separate sessions, when the first check fires, then the prompt count at which it fires is different between sessions.

13. **User ignores check**: Given a compression check question was injected, when the user next prompt is a normal task prompt (not bullet points), then the check is treated as skipped and no evaluation occurs.

14. **Evaluation references conversation**: Given an evaluation is performed, when the evaluation is constructed, then it references specific work, decisions, and code from the actual conversation — not generic observations.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| `vidbyte` CLI | Latest (included in this repo at `cli/`) | Submits feedback payload to Vidbyte backend via `python3 -m cli compressor submit --file <tempfile>` | **Medium** — If Python or the CLI module is not available, feedback is silently lost. The skill degrades gracefully (question still asked for metacognitive benefit). |
| Vidbyte Backend API | vidbyte.pro/api/skills/compressor | Receives evaluation data, returns permalink URL in response | **Low** — Called indirectly via CLI. If unreachable, error is handled silently. |
| None (skill internal) | N/A | The skill itself has zero npm/code dependencies | None |

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the agent selects it based on its description. Since the description indicates automatic background operation, the agent loads it proactively.
- **Breaking change**: No. This is a new, additive skill. No existing code is modified.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Rollback procedure**: Delete `skills/compression-check/` directory and re-run the installer. No data migration needed. Existing feedback records in Vidbyte are unaffected.

---

## 13. Open Questions

- [x] What are the exact flags and input format for the CLI? **Resolved**: The CLI uses `python3 -m cli compressor submit --file <tempfile>`. The file contains the structured evaluation JSON.
- [ ] Should the skill display the URL immediately after the user bullet-point response, or in the following response? **Recommendation**: Immediately after the user response — the URL is shown alongside the next normal answer, so the user sees it right after they have articulated.
- [ ] Should the emoji marker be fixed or configurable? **Recommendation**: Fixed — consistent with the `why` skill fixed emoji delimiter. Zero-config is preferred.
- [ ] Should the evaluation dimensions be weighted or scored numerically? **Recommendation**: Qualitative only. Numerical scores would require calibration and consistency that a prompt-based system cannot reliably deliver.
- [ ] What happens if the user provides an audio response or non-text response to the compression check? **Recommendation**: The skill only processes text responses. Non-text responses are treated as skips.

---

## 14. Alternatives Considered

### Alternative 1: Fixed interval (always every 5 prompts)
- What: Inject a check on every 5th prompt, exactly.
- Why rejected: Predictable cadence allows the user to mentally brace for the check and formulaically prepare bullet points, defeating the spontaneous metacognitive effect. Randomization (5-8) makes each check genuinely unexpected.

### Alternative 2: Inline feedback display
- What: Show the evaluation directly in the terminal after the user bullet-point response.
- Why rejected: Displaying "what you got wrong" inline disrupts the workflow and can feel judgmental. The URL-only approach keeps the terminal clean and lets the user review on their own time. It also drives value to the Vidbyte dashboard.

### Alternative 3: File-based persistence (like do-not-repeat)
- What: Write evaluations to a local Markdown file rather than submitting to Vidbyte.
- Why rejected: File-based persistence does not provide the structured feedback breakdown, learning history dashboard, or cross-session pattern analysis that Vidbyte offers. The purpose of this skill is to compound learning data over time — file-based tracking cannot do that.

### Alternative 4: No external CLI dependency
- What: Keep all evaluation logic within the skill and display it inline.
- Why rejected: The Vidbyte backend is the core value proposition — persistent learning history, pattern analysis across sessions, and a dedicated feedback UI. Inline-only display eliminates the compounding benefit.

### Alternative 5: Evaluative framing (quiz mode)
- What: Frame the compression check as a knowledge check: "Quick quiz — can you explain what we just built?"
- Why rejected: The word "quiz" triggers performance anxiety and defensiveness. "Alignment check" / "compression check" frames it as a collaborative tool, not a test. The user is more likely to engage honestly.

### Alternative 6: User-initiated only (slash command)
- What: Require explicit `/compression-check` invocation.
- Why rejected: The spontaneous, unsolicited nature of the check is what makes it effective. If the user has to initiate it, they will only do it when they already feel confident — missing the moments where the gap between "can do" and "can explain" is largest.

### Alternative 7: More granular question variants (10+)
- What: Maintain a large library of varied compression check phrasings.
- Why rejected: A small set of 4 variants with natural rotation is sufficient. More variants risk the phrasing drifting toward quiz-like language. Consistency within variety is the goal.

---

END OF DESIGN DOC
