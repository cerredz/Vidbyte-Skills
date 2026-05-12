# Design Doc: Anti-Passive Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-11
**Last Updated:** 2026-05-11

---

## 1. Overview

The `anti-passive` skill is a silent session observer that detects when a user has fallen into a prolonged "passive consumption" mode — reading explanations, asking clarifying questions, watching outputs flow by — without engaging in the active work of building, implementing, or deciding. When the pattern reaches a calibrated threshold, the skill interrupts with a single redirection prompt inviting the user to take the reins before the model continues. Its purpose is to prevent the session from degrading into an infinite lecture where nothing gets built.

---

## 2. Goals & Non-Goals

### Goals
- Detect passive consumption patterns across the full taxonomy of passive behaviors (curiosity spirals, implementation avoidance, premature clarification, spectator loops, architecture tourism, decision ping-pong, tutorial purgatory)
- Maintain a session-local "passive score" that accumulates with each qualifying passive message
- Interrupt when the score crosses a threshold — not on the first lazy prompt, but after a sustained pattern has formed
- Produce a single, non-judgmental redirection message inviting the user to implement before continuing
- Reset the score after an active implementation message or after the redirect is issued
- Operate silently between interruptions (users experience no difference in response behavior)
- Adapt tone to context: curious collaborator, not scolding teacher

### Non-Goals
- Preventing all explanation-seeking behavior (some clarifying questions are legitimate and necessary)
- Interrupting on every qualifying message (the skill waits for sustained pattern, not single events)
- Modifying the installer (`bin/`, `lib/`) — this is a standard, auto-discovered skill
- Modifying validation scripts — the skill passes existing validation unchanged
- Persisting state to disk — all state is session-local
- Replacing the normal response entirely — the redirect is injected alongside the response
- Judging the user's choice (whether they implement or continue explaining is their call)
- Overlapping with `why` — `why` probes decisions, `anti-passive` probes activity level

---

## 3. Background & Context

LLM-powered coding sessions carry a seductive failure mode: the model is an infinitely patient, infinitely knowledgeable explainer. A user can ask "how does X work?", hear a detailed explanation, follow up with "but what about Y?", get another detailed explanation, ask "and what if I want Z instead?", and so on — indefinitely. Every question feels productive because new information is being received. But if no code is being written, no decisions are being made, and no artifacts are being produced, the session has become a consumption loop rather than a building session.

This is not a knowledge-gap problem. The user is learning. The problem is that pure consumption without implementation produces brittle understanding — information that was never pressure-tested against reality. The skill's intervention is not "stop learning" but "learn by doing" — try implementing something, surface the real friction points, then ask questions about what actually broke.

The skill is structurally modeled on the `why` and `misconceptions` skills (same silent-observer pattern, same session-local state, same single-SKILL.md approach) but addresses a distinct failure mode: `why` probes metacognitive depth, `misconceptions` tracks wrong beliefs, and `anti-passive` interrupts consumption-without-production.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate silently at session start with no user invocation required.
2. The skill SHALL maintain a session-local "passive score" counter starting at 0.
3. For each user message, the skill SHALL classify it as passive, active, or neutral according to the passive consumption taxonomy.
4. Passive messages SHALL increment the passive score. Active messages SHALL reset it to 0. Neutral messages SHALL leave it unchanged.
5. When the passive score reaches the threshold (default: 3), the skill SHALL inject a single redirection prompt into the current response before delivering the normal response.
6. After injecting the redirect, the skill SHALL reset the passive score to 0.
7. The skill SHALL define and detect the following passive consumption archetypes:

   **a. Curiosity Spiral**: The user asks "how does X work?", gets an explanation, then asks "but what about Y related to X?", then "and what about Z related to Y?". Each question is a legitimate knowledge-seeking question in isolation, but the aggregate pattern is a chain of explanations with no implementation checkpoint. Detection marker: 2+ consecutive messages that are purely explanatory requests (asking how/why something works, what a library does, comparing concepts) with no intervening implementation.

   **b. Implementation Avoidance**: The user repeatedly asks "should I do X or Y?", "what's the best way to...?", "which approach is better for...?" without committing to either and building something. The user is gathering decision inputs but deferring the decision itself. Detection marker: 2+ consecutive messages seeking architectural or approach recommendations without acting on any prior recommendation.

   **c. Premature Clarification**: The user asks clarifying questions about details that would become clear during implementation — asking about edge cases for a function they haven't written yet, asking about deployment details before the code exists, asking about optimization before anything works. Detection marker: questions about downstream concerns (performance, edge cases, deployment, scaling) when no implementation has occurred yet in the session.

   **d. Spectator Loop**: The user issues commands and reads outputs without making decisions or modifications. This is the "just let me see what happens" pattern — running builds, checking logs, viewing outputs — but never saying "ok, now make this change." Detection marker: 3+ consecutive messages that are read-only operations (view, show, list, explain) with no modify/implement decision.

   **e. Architecture Tourism**: The user explores multiple architectural approaches in depth without committing to one. "Explain microservices vs monolith for this", then "walk me through event-driven too", then "what about hexagonal architecture?" — each exploration is thorough but no decision point is reached. Detection marker: 3+ messages exploring different architectural/design approaches with no convergence on a choice.

   **f. Decision Ping-Pong**: The user oscillates between options without resolution. "I'll use SQLite. Actually no, PostgreSQL. Wait, maybe MongoDB makes more sense. Hmm, SQLite was simpler..." The session becomes a rehearsal of the decision rather than the decision itself. Detection marker: 3+ messages that revisit or re-evaluate a previously discussed decision without acting on it.

   **g. Tutorial Purgatory**: The user requests walkthroughs, step-by-step guides, or comprehensive explanations that replicate what a tutorial or documentation would provide — walking through every step of a process rather than attempting it and asking about friction points. Detection marker: messages requesting "walk me through X step by step", "explain every part of Y", or "give me a comprehensive overview of Z" when the user has not yet attempted any part of X, Y, or Z independently.

8. The redirection prompt SHALL be a single sentence (optionally two) with this structure:
   - Acknowledgment of what the user has been doing (non-judgmental observation)
   - Invitation to implement before continuing (framed as their choice)
   - Example template: "We've been in explanation mode for the last few messages — want to try implementing [what was just discussed] yourself first before I continue?"

9. The redirect SHALL reference something specific from the recent conversation context (e.g., "try implementing the auth middleware" not "try implementing something").

10. The redirect SHALL be prepended to the normal response, separated by blank lines, and visually delimited with `🛠️` (U+1F6E0 hammer and wrench emoji).

11. The skill SHALL maintain an internal log of the last 5-10 user messages (session-local, not persisted) to track patterns rather than classify messages in isolation.

12. The skill SHALL NOT classify messages that are genuine follow-up clarifications on a recently discussed implementation task as passive. A user who just implemented something and is now debugging it is active.

13. The skill SHALL NOT inject the redirect when the user has produced implementation or decision output in the current session. The threshold accrues from zero on the first passive message after the last active one.

### Non-Functional Requirements

- **Performance**: Negligible overhead. No file I/O. Context processing limited to current and recent user messages.
- **Scalability**: No persistent state. Each session is independent.
- **Security**: No file writes, no network calls, no credential exposure.
- **Observability**: The redirect messages themselves are the only visible output.
- **Reliability**: If classification is ambiguous (message could be passive or active depending on intent), the skill SHALL classify it as neutral. False positives (interrupting an active session) are worse than false negatives (missing a passive pattern).

---

## 5. High-Level Design

The skill is a single `SKILL.md` file that functions as a procedural instruction set for the LLM agent. The agent reads these instructions at session start and monitors conversation patterns throughout the session.

**Data flow:**

```
User sends message
       |
       v
[Agent with anti-passive skill loaded]
       |
       +-- Classify message against passive consumption taxonomy
       |     |
       |     +-- Passive archetype matched?
       |     |     Yes --> Increment passive_score
       |     |
       |     +-- Active (implementation, decision, commit)?
       |     |     Yes --> Reset passive_score to 0
       |     |
       |     +-- Neutral (genuine follow-up, debugging, etc.)?
       |           Yes --> passive_score unchanged
       |
       +-- Passive_score >= threshold (3)?
       |     |
       |     No --> Normal response, silent
       |     |
       |    Yes --> Inject redirect:
       |             "We've been in explanation mode — want to try
       |              implementing [context] yourself first?"
       |              |
       |              v
       |             Reset passive_score to 0
       |              |
       |              v
       |             Normal response (below redirect)
       |
       +-- Return to monitoring
```

**Key design decisions:**

1. **Score-based rather than message-count-based**: A simple counter of consecutive passive messages would be brittle — two passive messages followed by one neutral debugging follow-up would reset the count even though the user hasn't actually built anything. The score-based approach (passive increments, active resets, neutral preserves) better reflects sustained patterns.

2. **Threshold of 3**: Below 3, the user might just be doing necessary research. At 3+ consecutive passive messages with no active output, a pattern has formed. This mirrors the `why` skill's threshold philosophy: give enough room for natural behavior before interrupting.

3. **Seven passive archetypes**: Covering the full taxonomy (curiosity spiral, implementation avoidance, premature clarification, spectator loop, architecture tourism, decision ping-pong, tutorial purgatory) ensures the skill catches passive consumption regardless of how it manifests. A single "asking too many questions" rule would miss architecture tourism or decision ping-pong.

4. **Context-specific redirect**: The redirect must reference what the user was last discussing, making the interruption feel like a thoughtful collaborator rather than a nagging timer. "We've been exploring SQLite vs PostgreSQL for a while — want to try implementing a schema in one and see what you actually need?" is far more useful than "Stop reading and start coding."

5. **Conservative classification**: When in doubt, classify as neutral. A false interrupt on an active user erodes trust in the skill more than a missed passive pattern.

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition)

**File(s):** `skills/anti-passive/SKILL.md`
**Type:** New file

#### What it does
The complete skill definition. Contains YAML frontmatter for discovery/installation, plus the full procedural instructions the LLM agent follows at runtime to detect passive consumption patterns and inject redirection prompts.

#### Interface / API

Frontmatter:
```yaml
---
name: anti-passive
description: >
  Detects when a user has been in a pure consumption mode for too long (reading explanations,
  asking clarifying questions, watching outputs) without actually building or implementing
  anything. Interrupts and redirects the user toward active implementation.
  Use automatically — no user invocation needed. Runs silently in the background.
---
```

Body sections:
1. **Identity** — Silent session observer that watches for passive consumption and interrupts with a redirect toward implementation.
2. **Goal** — Prevent sessions from degrading into infinite explanation loops where nothing gets built.
3. **Passive Consumption Taxonomy** — The seven archetypes with detailed definitions and detection markers.
4. **Step-by-Step Execution** — 5 steps (Initialize, Classify Each Message, Accumulate Score, Evaluate Threshold, Inject Redirect).
5. **Redirect Templates** — Structure and examples for context-specific redirection.
6. **Constraints** — Guardrails (conservative classification, no judgment, single redirect, session-local only).
7. **Success Criteria** — Verifiable outcomes.
8. **Input** — Invocation behavior (automatic, no slash command needed).

#### Logic / Algorithm

**Step 0 — Initialization (session start):**
1. Initialize a session-local `passive_score` counter to 0.
2. Initialize a session-local `message_history` buffer (last 5-10 messages, in-memory only).
3. Initialize a session-local `has_produced_output` flag to false.

**Step 1 — Receive user message:**
1. Append the current user message to the `message_history` buffer.
2. Proceed to Step 2 (classification).

**Step 2 — Classify the message:**
Review the current user message and the recent message_history against the classification rules:

**Active (resets passive_score to 0):**
- User reports having implemented something: "I tried X and...", "I wrote the code and...", "Here's what I built..."
- User makes a definitive decision: "I'll go with X", "Let's use Y", "Decided on Z"
- User commits code, creates files, or executes implementation commands in the session
- User issues a command that modifies the codebase (write, edit, create, move, delete operations)
- User demonstrates working output from something they just built
- User asks a debugging question about code they wrote themselves and are currently executing
- User reports output from running something they implemented

**Passive (increments passive_score by 1):**
Messages matching any of these seven archetypes:

1. **Curiosity Spiral**: The message is the 3rd+ in a chain of purely explanatory questions (how does X work? what about Y? explain Z?) with no intervening implementation. The current message asks about a mechanism, concept, or comparison without any action component.

2. **Implementation Avoidance**: The message asks "should I do X or Y?", "what's the best approach?", "which library should I use?" when similar decision-seeking questions have been asked before without resolution. The 2nd+ such message in a row qualifies.

3. **Premature Clarification**: The message asks about optimization, edge cases, scaling, deployment, or production concerns when no implementation exists yet in the session for the thing being discussed. Asking "how do I handle rate limiting?" before you've written the endpoint is premature.

4. **Spectator Loop**: The message is the 3rd+ consecutive read-only operation — viewing, listing, showing, explaining, describing — without any modify/implement/decide action in between.

5. **Architecture Tourism**: The message is the 3rd+ exploration of a different architectural pattern, design approach, or technology without converging on a choice. "Tell me about event-driven", then "what about CQRS?", then "explain hexagonal architecture" — each exploration is passive if no decision is made.

6. **Decision Ping-Pong**: The message revisits or re-evaluates a previously discussed decision. "Actually, maybe I should use X instead of Y" when the user had previously leaned toward Y. The 3rd+ oscillation qualifies.

7. **Tutorial Purgatory**: The message requests a step-by-step walkthrough, comprehensive explanation, or full tutorial on something the user has not yet attempted. "Walk me through setting up a React project from scratch step by step" when no project has been started.

**Neutral (leaves passive_score unchanged):**
- Genuine debugging follow-ups on code currently being implemented
- Clarifying questions about an error message the user is encountering
- Responses to agent questions (yes/no, confirmations)
- Short logistical messages ("one sec", "let me think", "what was that command again?")
- Questions about something the user just implemented (context-dependent: if they just wrote it and are asking about a detail, that's active learning)
- Any message that is ambiguous — when in doubt, classify as neutral

**Step 3 — Accumulate score:**
- If message is Passive: `passive_score += 1`
- If message is Active: `passive_score = 0`
- If message is Neutral: `passive_score` unchanged

**Step 4 — Evaluate threshold:**
- If `passive_score < 3`: proceed to Step 5 (normal response, no redirect).
- If `passive_score >= 3`: inject redirect, then reset `passive_score = 0`, then proceed to Step 5.

**Step 5 — Generate redirect (when threshold reached):**

1. Review the last 5-10 messages to identify the dominant passive pattern and the most recent topic.
2. Formulate a single sentence (optionally two) that references the specific context and invites implementation.
3. Use this template structure: `Observe the pattern` + `Invite the user to implement` + `Frame as their choice.`

Structure options:
- Decision-stall: "We've been weighing [X vs Y] for a bit — want to try implementing a quick version with one and see what actually breaks?"
- Exploration-chain: "We've explored [A, B, C] in depth — want to try building something with what we've covered so far before we go further?"
- Walkthrough-request: "I can walk through this in detail, but you might get more out of it by trying to [implement X] yourself first — want to give it a shot?"
- Spectator-pattern: "We've been in observe-and-explain mode for the last few messages — want to take the wheel and start [implementing/changing/building] something before I continue?"

4. Format the redirect:
```
🛠️ [The context-specific redirect — one sentence, curious and collaborative tone]

[Your normal response follows below, uninterrupted and complete.]
```

The normal response is delivered in full below the redirect. The redirect does not replace any part of the response.

#### Edge Cases & Error Handling

- **First messages of session**: All 3+ of the first messages are passive classification inquiries (e.g., "how do I set up a React app?", "what's the folder structure look like?", "what does package.json do?"). This is a legitimate onboarding scenario, not passive consumption. The skill should NOT trigger on the first 3 messages of a session because the user hasn't had a chance to build yet. Implement a "grace period" of 5 messages before the passive score begins accruing.

- **User starts with implementation, then gets stuck**: The user implements for a while, hits a problem, and asks several explanation questions in a row. This is debugging, not passive consumption. The presence of prior implementation activity in the session should raise the threshold or add a cooldown before passive scoring resumes.

- **Model's own responses trigger passive pattern**: The user asks "how do I do X?", the model gives a huge explanation, the user says "thanks, now how about Y?" — the model's verbosity invited more questions. This is not the user's fault. The skill should consider whether the model's own explanations are inflating the passive pattern.

- **User doesn't know enough to implement anything yet**: A genuine beginner who needs some baseline knowledge before they can implement. In this case, the redirect should suggest a minimal implementation attempt (even a "hello world" version) rather than a full implementation.

- **Ambiguous classification**: If the message could be passive or active depending on intent, classify as neutral. Conservative deferral prevents false interruptions.

- **Session ends before any redirect**: Normal. The skill had no opportunity to redirect, which means the user either stayed active or the session was too short.

- **User responds to redirect by continuing to ask explanations**: Treat as a normal user message — they made their choice. Reset the score and continue.

- **User responds to redirect by implementing**: Classify as active (score resets to 0). The skill worked.

### 6.2 No Additional Files

**Type:** N/A — No runtime files, no tracking files, no dependencies.

The `anti-passive` skill is stateless across sessions. All state (passive_score, message_history, has_produced_output flag) is session-local and discarded when the session ends.

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
| CREATE | `skills/anti-passive/SKILL.md` | Core skill definition — the entire implementation |
| CREATE | `docs/design/anti-passive.md` | This design document |

**Total: 2 files created (in repo), 0 modified, 0 deleted.**

No runtime files are created by the skill at runtime. No existing files are touched.

---

## 10. Testing Plan

### Unit Tests

N/A — There is no executable code to unit test. The skill is a Markdown prompt.

### Integration Tests

N/A — The skill operates within the LLM's session context.

### Validation Tests

- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/anti-passive/SKILL.md` exists
  - Frontmatter has valid `name: anti-passive` matching the directory
  - Frontmatter has non-empty `description`
  - Body is non-empty
  - Skill name matches `^[a-z0-9]+(-[a-z0-9]+)*$` regex (`anti-passive` validates correctly: two lowercase segments separated by a hyphen)

### Manual / QA Test Cases

1. **Passive pattern — curiosity spiral**: Given a session where the user asks "how does Docker work?", then "what about Kubernetes vs Docker?", then "explain container orchestration more", when the 3rd qualifying message arrives, then the redirect is injected referencing the orchestration topic.

2. **Passive pattern — architecture tourism**: Given a session where the user asks "explain microservices architecture", then "what about event-driven architecture?", then "walk me through hexagonal architecture", when the 3rd architecture exploration arrives with no decision, then the redirect is injected.

3. **Passive pattern — premature clarification**: Given a session where no code exists yet, when the user asks "how do I optimize the database query?" followed by "what's the best indexing strategy?" followed by "how do I handle connection pooling?", then the redirect fires on the 3rd message.

4. **Active interruption — implementation**: Given a passive score of 2, when the user says "I implemented it, here's the code", then the score resets to 0 and no redirect fires.

5. **Active interruption — decision**: Given a passive score of 2, when the user says "I'll go with PostgreSQL", then the score resets to 0.

6. **Neutral preservation**: Given a passive score of 2, when the user sends a debugging question about code they're running ("I'm getting this error: connection refused — what does that mean?"), then the score remains at 2 (neutral message).

7. **Grace period**: Given a brand new session, when the user asks 3 explanatory questions as their first 3 messages, then no redirect fires (messages in the grace period of first 5 do not accrue score).

8. **Context-specific redirect**: Given the user has been exploring "REST vs GraphQL" for 3 messages, when the redirect fires, then the redirect message references "REST and GraphQL" specifically.

9. **Redirect format**: When a redirect fires, then it is prepended to the normal response with `🛠️` prefix, separated by blank lines, and the normal response is delivered in full below it.

10. **User elects to continue explanations**: Given a redirect fired and the user says "no, keep explaining", then the score resets to 0 and the skill monitors normally.

11. **User elects to implement**: Given a redirect fired and the user implements and reports back, then the score is 0 and the skill considers the session active.

12. **After implementation, explanation questions are neutral**: Given the user just implemented a feature, then asks 3 clarification questions about what they built, then no redirect fires (context is post-implementation debugging/learning, not pre-implementation deferral).

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | The skill has zero external dependencies | None |

The skill operates entirely through the LLM agent's native capabilities: reading conversation history, classifying message patterns, and generating text. No npm packages, APIs, databases, or services are involved.

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the agent selects it based on its description meta-pattern of "use automatically." Since the description signals automatic activation, the agent loads it in all sessions where skills are available.
- **Breaking change**: No. This is a new, additive skill. No existing code is modified.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Rollback procedure**: Delete `skills/anti-passive/` directory and re-run the installer. No data migration needed (the skill has no persistent state).

---

## 13. Open Questions

- [ ] **Threshold tuning**: Is 3 the right threshold? Too low and the skill interrupts legitimate research. Too high and passive patterns can run for a long time before intervention. **Recommendation**: Start at 3 and gather feedback. The grace period of 5 messages before scoring begins provides additional buffer.

- [ ] **Grace period length**: Should the 5-message grace period apply to all sessions or only truly new conversations? **Recommendation**: Apply to all sessions for simplicity. If a user is loading a prior session and immediately going passive, they'll hit the threshold at message 8 (5 grace + 3 passive).

- [ ] **Should the skill detect when the model's own verbose explanations are fueling the passive pattern?**: If the model gives a 200-line explanation, the user's follow-up "but what about..." is partly a response to being given too much. **Recommendation**: Include this as a soft consideration — if the model's prior response was very long and detailed, bias toward neutral classification for the user's next message.

- [ ] **Should the redirect ever be forceful versus always offering a choice?**: "Want to try implementing this yourself?" is a soft redirect. "Let's pause and implement before continuing" is a hard redirect. **Recommendation**: Always soft — frame as the user's choice. The `why` skill's success criteria emphasize that the user should never feel interrogated. Same principle applies here.

- [ ] **Should the `🛠️` emoji be the delimiter or something else?**: The `why` skill uses `🤔` (thinking face). The `anti-passive` skill needs a distinct delimiter. **Recommendation**: `🛠️` (hammer and wrench) signals "building" as the redirect's destination.

- [ ] **Should there be a user-invocation mode?**: `/anti-passive check` to manually check their passive score? **Recommendation**: Not in v1. Keep it simple and automatic. Manual invocation can be added later if users request visibility into their score.

---

## 14. Alternatives Considered

### Alternative 1: Timer-based interruption (every N minutes of no implementation)
- What: Use a wall-clock timer to interrupt when no code has been written in X minutes.
- Why rejected: The LLM has no timer capability. A prompt-based approach (counting messages) is the only thing the agent can do deterministically.

### Alternative 2: Binary toggle (active/passive) instead of score
- What: Track a single boolean: `is_passive`. If the last 3 messages were all passive, interrupt.
- Why rejected: Binary tracking loses information. A neutral message in the middle of a passive streak should not reset detection. The score-based approach preserves the signal through neutral messages.

### Alternative 3: Single "too many questions" rule instead of taxonomy
- What: Just count consecutive question-asking messages without implementation.
- Why rejected: Misses entire categories of passive consumption. Architecture tourism and decision ping-pong don't look like questions — they look like exploration and decision-making. The seven-archetype taxonomy catches the full spectrum.

### Alternative 4: Block the response until the user implements
- What: When threshold is reached, refuse to answer until the user shows implementation output.
- Why rejected: Hostile and counterproductive. The skill is a coach, not a gatekeeper. The user always retains control — the redirect is an invitation, not a demand.

### Alternative 5: File-based state persistence
- What: Store the passive score to disk so it persists across sessions.
- Why rejected: Cross-session state would mean a user who was passive in their last session gets interrupted early in their next session, even if they came back specifically to implement. Session-local state is correct for this use case.

### Alternative 6: Combine with `why` into a single metacognitive skill
- What: Merge `anti-passive` and `why` into one "session coach" skill.
- Why rejected: They address distinct failure modes. `why` probes decisions, `anti-passive` probes activity level. Combining them would create a bloated skill where neither function is done well. Keeping them separate means each is focused and effective.

---

END OF DESIGN DOC
