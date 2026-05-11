# Design Doc: Why Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-11
**Last Updated:** 2026-05-11

---

## 1. Overview

The `why` skill is a silent autonomous metacognitive coach that periodically injects a single "why" question into the agent's response. Its purpose is to prevent the user from operating on autopilot — it interrupts the flow of directive prompt-and-execute by asking the user to reflect on their decisions, assumptions, and alternatives. By probing at a randomized cadence of every 5-10 prompts, the skill ensures the user stays actively engaged in the reasoning behind their own choices rather than blindly delegating to the model.

---

## 2. Goals & Non-Goals

### Goals
- Create a single `SKILL.md` that the LLM agent reads and follows as procedural instructions
- Inject one calibrated "why" question every 5-10 user prompts (randomized within that range)
- Intelligently skip injection when the user's prompt contains extensive reasoning or detailed specifications (3+ paragraphs), since those already demonstrate active thinking
- Target moments where the user could be operating on autopilot, making unexamined assumptions, or choosing a path without considering alternatives
- Generate contextually relevant questions that probe the specific decision at hand rather than generic prompts
- Remain silent between injection points — normal response behavior is identical to uninstrumented operation

### Non-Goals
- Installing any new runtime code (the skill is a prompt, not executable code)
- Modifying the installer (`bin/`, `lib/`) — this is a standard, auto-discovered skill
- Modifying validation scripts — the skill passes existing validation unchanged
- Persisting any files to disk (unlike `do-not-repeat`, this skill is stateless across sessions)
- Interrupting every prompt — the cadence is sparse by design
- Replacing the normal response entirely (unlike `do-not-repeat`'s intervention mode) — the question is injected alongside the response
- Judging the user's answers or following up on them — the skill asks and moves on

---

## 3. Background & Context

In long coding sessions, users naturally fall into a pattern: think up a command, issue the command, review output, issue the next command. This is efficient but creates a cognitive blind spot — the user stops actively questioning whether the direction they chose is the right one, whether there's a better approach, or what assumptions underpin their request. The model becomes an executor rather than a collaborator.

This skill fills that gap by injecting metacognitive interruptions at unpredictable intervals. By asking "why are you doing this?" or "why this approach instead of that one?" at a randomized cadence, it forces the user to surface and examine their own reasoning. The goal is not to slow the user down but to prevent the kind of autopilot that leads to wasted effort on the wrong approach.

The skill is modeled structurally on the `do-not-repeat` skill (same background-silent-monitor pattern, same single SKILL.md approach, same platform-agnostic design) but differs in its core mechanic: `do-not-repeat` tracks and intervenes on repeated errors, while `why` probes for unexamined decisions.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL insert itself into every agent session silently and monitor the prompt count.
2. The skill SHALL maintain a session-local prompt counter, incrementing by 1 for each user message, resetting to 0 when a new session begins.
3. The skill SHALL determine a randomized "injection threshold" at the start of each session: a number between 5 and 10 (inclusive). When the prompt counter reaches this threshold, the skill SHALL inject a "why" question.
4. After injecting a question, the skill SHALL randomly select a new threshold (between 5 and 10 prompts from the current position) for the next injection.
5. Before injecting, the skill SHALL evaluate whether the current user prompt is appropriate for a "why" question using the skip rules in requirement 6.
6. The skill SHALL skip injection (defer to next threshold) when the user's current prompt meets any of these conditions:
   - The prompt is 3 or more paragraphs long (indicating detailed reasoning or specification)
   - The prompt already contains explicit reasoning, justification, or tradeoff analysis
   - The user is in the middle of a debugging flow (error messages, stack traces, "why is this broken?")
   - The user's prompt is a simple yes/no follow-up to a prior response
   - The user is explicitly asking a "why" question themselves
7. When injection is warranted, the skill SHALL select one of these question archetypes, adapted to the specific context:
   - **Decision probe**: "Why did you choose this approach over [contextually relevant alternative]?"
   - **Assumption check**: "What assumption are you making about [contextual element] and how would your approach change if it were false?"
   - **Alternative surfacing**: "Before continuing — why not handle this by [alternative approach that's contextually plausible]?"
   - **Goal clarification**: "Stepping back — what's the higher-level outcome you're trying to achieve, and is this the most direct path to it?"
   - **Constraint questioning**: "Is [apparent constraint] actually a hard requirement, or could relaxing it simplify things significantly?"
   - **Tradeoff awareness**: "What tradeoffs are you accepting with this approach that might matter later?"
8. The injected question SHALL be contextually relevant — it must reference something specific from the user's current or recent prompts (e.g., a technology choice, an architectural decision, a named approach).
9. The injected question SHALL be delivered as a single line prefixed with `🤔` (U+1F914 thinking face emoji) at the very top or very bottom of the normal response, separated from the response body by a blank line. The question must not displace or replace any part of the normal response.
10. Only one question SHALL be injected per injection event.
11. The skill SHALL NOT store any state on disk. All state (prompt counter, threshold, session history) is session-local only.
12. The skill SHALL NOT respond to or evaluate the user's answer to the injected question — it is purely a question-asking mechanism.
13. The tone of injected questions SHALL be curious and collaborative, not interrogative or judgmental. "Why not..." is better than "Why would you..."

### Non-Functional Requirements

- **Performance**: Negligible overhead. The skill performs no file I/O. Context processing is limited to the current user prompt and recent conversation.
- **Scalability**: No persistent state. Each session is independent.
- **Security**: No file writes, no network calls, no credential exposure.
- **Observability**: The injected questions themselves serve as the only visible output.
- **Reliability**: If the skill cannot determine whether to inject (ambiguous context), it SHALL defer (skip injection for this threshold). Conservative behavior is preferred.

---

## 5. High-Level Design

The skill is a single `SKILL.md` file that functions as a procedural instruction set for the LLM agent. The agent reads these instructions at session start and follows them deterministically throughout the session.

**Data flow:**

```
User Prompt -> [Agent with why skill loaded]
                  |
                  +-- Prompt counter incremented
                  |
                  +-- Counter reaches threshold (5-10)?
                  |         |
                  |         No --> Normal response, silent
                  |         |
                  |        Yes
                  |         |
                  |         v
                  |   Evaluate context (skip rules):
                  |   - 3+ paragraphs? Skip
                  |   - Contains explicit reasoning? Skip
                  |   - Debugging flow? Skip
                  |   - Yes/no follow-up? Skip
                  |   - User asking "why"? Skip
                  |         |
                  |    +----+----+
                  |    v         v
                  |   Skip?    Don't skip?
                  |    |         |
                  |    v         v
                  |   Defer    Pick question archetype
                  |   to next  based on context
                  |   threshold|
                  |             v
                  |           Inject question into
                  |           normal response
                  |             |
                  |             v
                  |           Randomize next threshold
                  |           (5-10 from current position)
                  |
                  +-- Normal response (with optional question prepended)
```

**Key design decisions:**

1. **Prompt-based, not executable code**: Same rationale as `do-not-repeat` — universal portability, no runtime dependencies, works in any harness.
2. **Session-local state only**: No files, no disk persistence. This keeps the skill lightweight and avoids the complexity of file paths and trimming from `do-not-repeat`. The cost (no cross-session memory) is acceptable because the skill's purpose is in-session metacognitive interruption, not long-term tracking.
3. **Randomized cadence**: Fixed intervals (every 5 prompts) become predictable and the user learns to ignore them. A random range (5-10) makes each question genuinely surprising, which is necessary for the metacognitive effect.
4. **Context-sensitive skip rules**: Injecting a "why" question when the user is already reasoning deeply is counterproductive — it interrupts productive flow. The skip rules prevent this.
5. **Single-question format with emoji delimiter**: The `🤔` prefix is unobtrusive but visually scannable. A single question (not multiple) avoids overwhelming the user. The question complements the normal response rather than replacing it.

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition)

**File(s):** `skills/why/SKILL.md`
**Type:** New file

#### What it does
The complete skill definition. Contains YAML frontmatter for discovery/installation, plus the full algorithmic instructions the LLM agent follows at runtime.

#### Interface / API

Frontmatter:
```yaml
---
name: why
description: >
  A silent metacognitive coach that periodically asks "why" questions to prevent autopilot.
  Use automatically — no user invocation needed. Runs silently in the background.
---
```

Body sections:
1. **Identity** — Silently monitors for autopilot patterns; asks one context-relevant "why" question every 5-10 prompts.
2. **Goal** — Break the autopilot cycle by forcing the user to surface and examine their own reasoning at unpredictable intervals.
3. **Step-by-Step Execution** — 5 steps (Initialize, Count, Evaluate Threshold, Evaluate Context, Inject Question).
4. **Question Archetypes** — The 6 question templates with guidelines for contextual adaptation.
5. **Skip Rules** — Explicit conditions that defer injection.
6. **Constraints** — Guardrails (one question per injection, no file I/O, conservative deferral, curiosity not judgment).
7. **Success Criteria** — Verifiable outcomes.
8. **Input** — Invocation behavior (automatic, no slash command needed).

#### Logic / Algorithm

**Step 0 — Initialization (session start):**
1. Initialize a session-local prompt counter to 0.
2. Randomly select the first injection threshold: a number between 5 and 10 (inclusive).
3. Initialize an empty session-local history of injected questions (to avoid repeating the same question type consecutively).

**Step 1 — Prompt counter tracking:**
1. Increment the prompt counter by 1 for each user message received.
2. Compare the counter to the current injection threshold.
3. If counter < threshold: produce a normal response. No question injected.
4. If counter == threshold: proceed to Step 2.

**Step 2 — Evaluate injection context (skip rules):**
Before injecting, review the current user prompt against these skip rules. If ANY rule matches, defer the injection:
1. **Long spec rule**: The user's prompt is 3 or more substantial paragraphs (where a paragraph is 3+ sentences, not just line breaks). Detailed specification, planning, or multi-paragraph instructions indicate active engagement — skip.
2. **Explicit reasoning rule**: The user already included justification, tradeoff analysis, or explicit reasoning in their prompt (e.g., "I chose X because...", "The reason for Y is...", "Given the constraints of Z..."). They're already thinking — skip.
3. **Debugging flow rule**: The user's prompt contains error messages, stack traces, debug output, or explicit troubleshooting language (e.g., "I'm getting this error:", "why is this failing?", "debug this"). Interrupting debugging flow is harmful — skip.
4. **Simple follow-up rule**: The user's prompt is a direct yes/no/inline response to a prior question from the agent (e.g., "yes", "no", "that works", "try again"). These are continuations, not decisions — skip.
5. **"Why" question rule**: The user is already asking a "why" question (e.g., "why does this happen?", "why would that be better?"). Don't out-why the user — skip.

If skip rules trigger: set the new threshold to current counter + random(5, 10). Produce a normal response. Do not inject.

If no skip rules trigger: proceed to Step 3.

**Step 3 — Select question archetype:**
1. From the 6 question archetypes, select one that is contextually appropriate for the user's current and recent prompts.
2. Avoid selecting the same archetype that was used in the previous injection (if any).
3. Adapt the archetype template to the specific context — the question MUST reference something concrete from the user's prompts (a technology name, an architectural choice, a pattern, a named approach, or a specific decision).

The 6 question archetypes:
- **Decision probe**: "Why did you choose [X] over [Y] here?"
- **Assumption check**: "What assumption are you making about [Z] and how would things change if it were false?"
- **Alternative surfacing**: "Before continuing — why not handle this by [alternative approach]?"
- **Goal clarification**: "Stepping back — what's the outcome you're driving toward, and is this the most direct path?"
- **Constraint questioning**: "Is [apparent constraint] actually a hard requirement, or could relaxing it change the approach?"
- **Tradeoff awareness**: "What tradeoffs are you accepting with this approach — are there any that might become issues later?"

**Step 4 — Inject question:**
1. Prepend the formatted question to the normal response output.
2. Format: a blank line, then `🤔 [The question here]`, then a blank line, then the normal response.
3. Record the archetype used in session-local history.
4. Set the new injection threshold to current counter + random(5, 10).

**Step 5 — Return to normal operation:**
- Continue normal response generation for all prompts until the counter reaches the new threshold.
- Repeat Steps 1-4.

#### Edge Cases & Error Handling
- **First prompt of session**: Counter is 1. Threshold is between 5-10. No injection possible yet.
- **No suitable archetype for context**: If none of the 6 archetypes can be adapted to the current context, defer (skip this injection cycle). This is unlikely but safe.
- **Context is ambiguous**: If the model cannot confidently assess whether the skip rules apply, err on the side of skipping. Conservative deferral is always safe.
- **User responds to injected question**: Treat as a normal user message. Do not evaluate the answer. Increment the counter and continue.
- **Session ends before any injection**: Normal. The skill had no opportunity to inject, which is fine.
- **Extremely short session (< 5 prompts)**: No injection. Expected behavior.

### 6.2 No Additional Files

**Type:** N/A — No runtime files, no tracking files, no dependencies.

The `why` skill is stateless across sessions. Unlike `do-not-repeat`, which maintains `recent_conversation.md` on disk, `why` stores nothing and writes nothing. All state (counter, threshold, injection history) is session-local and discarded when the session ends.

---

## 7. Data Model Changes

N/A — The skill maintains no persistent data. All state is session-local and ephemeral.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. This is a prompt-based skill with no server component.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/why/SKILL.md` | Core skill definition — the entire implementation |
| CREATE | `docs/design/why.md` | This design document |

**Total: 2 files created (in repo), 0 modified, 0 deleted.**

No runtime files are created by the skill at runtime (unlike `do-not-repeat`'s `recent_conversation.md`).

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. The skill is a Markdown prompt.

### Integration Tests
N/A — The skill operates within the LLM's session context.

### Validation Tests
- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/why/SKILL.md` exists
  - Frontmatter has valid `name: why` matching the directory
  - Frontmatter has non-empty `description`
  - Body is non-empty
  - Skill name matches `^[a-z0-9]+(-[a-z0-9]+)*$` regex (note: `why` is a single word, no hyphens needed)

### Manual / QA Test Cases

1. **First 4 prompts — silent**: Given a new session, when the user sends 4 prompts, then the skill produces no injected questions and normal responses are delivered unchanged.

2. **First injection at threshold**: Given a counter reaches the threshold (between 5-10), when the user sends a prompt that does not match any skip rule, then exactly one `🤔` question is injected into the response.

3. **Skip on long spec**: Given the counter reaches the threshold, when the user sends a 3+ paragraph detailed specification, then the injection is deferred and the threshold is reset.

4. **Skip on explicit reasoning**: Given the counter reaches the threshold, when the user's prompt contains "I chose this because...", then the injection is deferred.

5. **Skip on debugging**: Given the counter reaches the threshold, when the user sends an error message with "why is this failing?", then the injection is deferred.

6. **Skip on yes/no follow-up**: Given the counter reaches the threshold, when the user responds "yes" to a prior agent question, then the injection is deferred.

7. **Contextual relevance**: Given the user's recent prompts discuss "deciding between REST and GraphQL", when injection occurs, then the question references REST/GraphQL specifically (not a generic "why did you choose this?").

8. **Randomized cadence**: Given two separate sessions, when injections occur, then the thresholds are not identical across sessions — demonstrating randomization.

9. **Normal response intact**: Given a question is injected, when the response is delivered, then the full normal response (what the agent would have said without the skill) is present below the injected question.

10. **No file artifacts**: Given any number of sessions, when the skill runs, then no files are created on disk (verified by checking the skills directory for any files beyond SKILL.md).

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | The skill has zero external dependencies | None |

The skill operates entirely through the LLM agent's native capabilities: counting prompts, reading context, and generating text. No npm packages, APIs, databases, or services are involved.

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the agent selects it based on its description. Since the description says "Use automatically — no user invocation needed", the agent loads it by default in all sessions.
- **Breaking change**: No. This is a new, additive skill. No existing code is modified.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Rollback procedure**: Delete `skills/why/` directory and re-run the installer. No data migration needed (the skill has no persistent state).

---

## 13. Open Questions

- [ ] Should the `🤔` emoji be user-configurable, or is a fixed delimiter acceptable? **Recommendation**: Fixed — the skill is designed for zero-config operation.
- [ ] Should the question be prepended (top) or appended (bottom) of the response? **Recommendation**: Prepended — the user sees and considers the question before reading the answer, making the metacognitive interruption more effective.
- [ ] Should the skill ever ask more than one question per injection event? **Recommendation**: No — a single question is digestible; multiple questions feel like a pop quiz and degrade the user experience.
- [ ] Should the threshold randomization range (5-10) be adjustable? **Recommendation**: Keep it fixed at 5-10 as the default. This provides a good balance between frequency (enough to be useful) and rarity (enough to be surprising).

---

## 14. Alternatives Considered

### Alternative 1: File-based state persistence (like do-not-repeat)
- What: Store the prompt counter and threshold to disk so they persist across sessions.
- Why rejected: `why` is an in-session metacognitive tool. Cross-session persistence would mean injecting a question on the first prompt of a new session after accumulating count from the previous session, which would feel intrusive and context-less. Session-local state is correct for this use case.

### Alternative 2: Fixed interval (always every 5 prompts)
- What: Inject a question on every 5th prompt, exactly.
- Why rejected: Predictable cadence allows the user to mentally brace for the question, defeating the metacognitive purpose. Randomization makes each question genuinely surprising and thus more effective.

### Alternative 3: Replace normal response entirely (like do-not-repeat interventions)
- What: When injecting a question, suppress the normal response and only show the question.
- Why rejected: The user asked a question or gave an instruction — they need the answer. The question is a complement, not a replacement. Removing the answer would be hostile.

### Alternative 4: Inject at the end of the response
- What: Append the question after the normal response.
- Why rejected: The user may not read to the end if the answer is long. Prepending ensures the question is seen. However, the design can be adjusted if user feedback favors appending.

### Alternative 5: Multiple question archetypes per injection
- What: Ask 2-3 questions at once.
- Why rejected: Overwhelming. One question per injection maximizes the chance the user actually engages with it.

### Alternative 6: Follow-up on the user's answer to the question
- What: Read the user's response to the injected question and evaluate whether they answered thoughtfully.
- Why rejected: The skill is a coach, not an interrogator. Following up would make the user defensive and degrade trust. The skill asks one question and moves on.

---

END OF DESIGN DOC
