# Design Doc: Curiosity Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-11
**Last Updated:** 2026-05-11

---

## 1. Overview

The `curiosity` skill transforms the agent into a curiosity amplifier — a system that continuously scans user messages for behavioral signals indicating genuine curiosity, and extends those moments with carefully calibrated content that makes following a thread of interest more rewarding. It does not create learning moments; it amplifies the ones already happening. A user in pure task mode receives their answer unchanged. A user who is already leaning in gets one of four graduated response mechanisms: a Rabbit Hole Drop, a One Level Deeper Offer, a Reframe with Principle, or a Socratic follow-up sequence. The skill is grounded in the neuroscience of curiosity — dopamine-driven encoding windows, the self-generation effect on the nucleus accumbens, and the productive struggle as the most powerful state for durable learning.

---

## 2. Goals & Non-Goals

### Goals
- Continuously scan every user message against a 10-category curiosity signal taxonomy (110+ signals)
- Detect the difference between task-mode prompts (answer-only) and curiosity-mode prompts (user is pulling a thread)
- Match signal strength to one of four graduated response mechanisms: Rabbit Hole Drop, One Level Deeper Offer, Reframe with Principle, or Reasoner Skill follow-up
- Calibrate every curiosity extension to the user's demonstrated level of expertise
- Deliver the task response first, completely, and at full quality — curiosity content is always additive
- Ensure zero friction for non-curious users: extensions must cost less than 2 seconds of attention to skip
- Never frame curiosity content as educational, instructional, or pedagogical

### Non-Goals
- Installing any new runtime code (the skill is a prompt, not executable code)
- Modifying the installer (`bin/`, `lib/`) — this is a standard, auto-discovered skill
- Modifying validation scripts — the skill passes existing validation unchanged
- Persisting any files to disk — all state is session-local
- Triggering curiosity extensions on every response — extensions appear only when signals are detected
- Replacing the normal answer — the task response always comes first, undiluted
- Asking the user direct questions about their curiosity or learning goals — the skill infers everything

---

## 3. Background & Context

In high-efficiency coding environments, users often oscillate between two modes: task mode (give me the answer so I can keep moving) and curiosity mode (something just caught my attention and I want to understand it more deeply). Most tools treat both modes identically, either ignoring curiosity entirely or imposing a learning layer that slows down task-mode users.

The `curiosity` skill solves this by operating as a signal detector rather than an always-on intervention. It reads user behavior — word choice, question patterns, engagement depth, reformulation behavior, connection-making — and activates only when the evidence of genuine curiosity crosses a threshold. When inactive, it is invisible. When active, it extends the user's natural thread of interest in a way that feels like a continuation of the conversation, not a pedagogical interruption.

This skill is structurally similar to the `do-not-repeat` and `why` skills (background behavioral modifier, single SKILL.md, platform-agnostic prompt-based design). It differs in its core mechanic: rather than tracking errors or injecting metacognitive probes at fixed intervals, it is entirely reactive — responding to what the user is already doing.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL scan every user message against a full curiosity signal taxonomy of 10 categories (A through J), comprising behavioral, linguistic, and interaction-pattern signals.
2. The skill SHALL assess signal weight continuously: no single signal is definitive; multiple weak signals constitute a strong detection; a single strong signal warrants a response.
3. The skill SHALL map signal weight to one of four response mechanisms:
   - **No signals detected** → deliver task response only, no addition
   - **One or two weak signals** (Categories F, G, H, J) → Rabbit Hole Drop: append one naturally-integrated sentence opening a thread
   - **One strong signal** (Categories A, B, I) or **three or more weak signals** → One Level Deeper Offer: append one optional line offering to go deeper
   - **Multiple strong signals** or **sustained pattern across prompts** → Reframe with Principle: restructure the answer itself to weave the underlying principle into the response
4. The skill SHALL deliver the complete task response first, at full quality, before adding any curiosity extension. A user who ignores the extension receives exactly what they would have received without the skill.
5. The skill SHALL calibrate every curiosity extension to the user's demonstrated level (Zone of Proximal Development), inferred from conversational context — never asked directly.
6. The skill SHALL never frame curiosity extensions as educational, instructional, or pedagogical. Every extension is framed as something interesting, not something to learn.
7. The skill SHALL produce at most one curiosity extension per response, unless the user has explicitly followed a thread (accepted a One Level Deeper Offer or engaged with a Rabbit Hole Drop).
8. The skill SHALL NOT produce curiosity extensions when the user is in a state of urgency or clear time pressure.
9. The skill SHALL NOT redirect curiosity in a direction unrelated to the thread the user is already pulling. Extensions must follow the direction of the user's demonstrated interest.
10. When a user accepts a One Level Deeper Offer, the follow-up response SHALL use 3-5 calibrated Socratic questions leading the user toward understanding rather than stating the answer directly.
11. The skill SHALL maintain a persona: a curiosity amplifier — not a teacher, not a tutor, not a learning intervention. It recognizes when a user's brain opens a door and makes the room on the other side more interesting to walk into.
12. The skill SHALL internalize the neuroscience of curiosity at a mechanistic level: dopamine-driven encoding windows, self-generation effects, and productive struggle. Every response design choice must be grounded in this understanding.

### Non-Functional Requirements

- **Performance**: Negligible overhead. The skill performs no file I/O. Signal scanning is limited to the current user message and conversation history.
- **Scalability**: No persistent state. Each session is independent.
- **Security**: No file writes, no network calls, no credential exposure.
- **Observability**: The curiosity extensions themselves serve as the only visible output.
- **Reliability**: If signal detection is ambiguous, err on the side of no extension. Conservative silence is always safe.

---

## 5. High-Level Design

The skill is a single `SKILL.md` file containing the complete master prompt that the LLM agent reads and internalizes. The agent becomes a curiosity-amplifying system at the start of every session where the skill is loaded.

**Data flow:**

```
User Message -> [Agent with curiosity skill loaded]
                    |
                    +-- Scan message against 10-category signal taxonomy
                    |
                    +-- No signals detected?
                    |         |
                    |        Yes --> Complete task response only (Format 1)
                    |         |
                    |         No
                    |         |
                    |         v
                    +-- Assess signal weight (weak / strong / sustained)
                    |         |
                    |    +----+----+----+
                    |    v         v    v
                    |   Weak    Strong  Sustained/Multiple
                    |    |         |        |
                    |    v         v        v
                    |  Rabbit    One      Reframe
                    |  Hole      Level    with
                    |  Drop      Deeper   Principle
                    |  (Format 2) Offer   (Format 4)
                    |            (Format 3)
                    |              |
                    |         User declines? --> Continue normal operation
                    |         User accepts?  --> Reasoner Skill (3-5 Socratic questions)
                    |
                    +-- Deliver response
```

**Key design decisions:**

1. **Signal-driven, not interval-driven**: Unlike `why` (which injects at randomized intervals), `curiosity` is entirely reactive. It only activates when the user's behavior indicates curiosity. This minimizes false positives.
2. **Four graduated response mechanisms**: The same response for every curiosity scenario would be jarring. The graduated system ensures that mild interest gets a light touch (Rabbit Hole Drop) while sustained deep interest gets a restructured response (Reframe with Principle).
3. **Always-additive, never-substitutive**: The task answer always comes first, complete. Curiosity extensions are optional continuations. This is the single most important constraint — it guarantees the skill never degrades task-mode productivity.
4. **Neuroscience-grounded design**: The skill's calibration (Zone of Proximal Development), Socratic follow-up (productive struggle), and non-evaluative framing (avoid triggering performance anxiety) are all grounded in specific neural mechanisms. This is not decorative — it directly shapes response design.
5. **Invisible when inactive**: The absence of curiosity signals produces no visible change in agent behavior. This is critical for trust — the user should never feel the skill is "on" or "watching" them.
6. **Prompt-based, not executable code**: Same rationale as `why` and `do-not-repeat` — universal portability, no runtime dependencies, works in any harness.

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition)

**File(s):** `skills/curiosity/SKILL.md`
**Type:** New file

#### What it does

The complete curiosity skill definition. Contains YAML frontmatter for discovery/installation and the full master prompt — approximately 300 lines covering identity/persona, goal, the 10-category curiosity signal taxonomy, a weighted signal assessment algorithm, the four graduated response mechanisms with execution instructions, calibration rules, and a comprehensive "things not to do" guardrail section.

#### Interface / API

Frontmatter:
```yaml
---
name: curiosity
description: >
  A curiosity amplifier that detects when the user is genuinely curious and extends those moments
  with calibrated, frictionless content — from subtle thread-drops to principle-level reframes.
  Runs automatically in the background. No explicit invocation needed.
---
```

Body sections:
1. **Identity / Persona** — Curiosity amplifier, not a teacher or tutor. Internalizes neuroscience of curiosity. Invisible when working correctly.
2. **Goal** — Detect natural curiosity moments and extend them without interrupting the work.
3. **Curiosity Signal Taxonomy** — 10 categories (A-J) totaling 110+ specific signals:
   - A: Explicit Linguistic Curiosity Markers
   - B: Confusion-With-Engagement Signals
   - C: Expansion and Depth-Seeking Signals
   - D: Challenge and Pushback Signals
   - E: Connection-Making Signals
   - F: Behavioral Interaction Pattern Signals
   - G: Investment and Engagement Signals
   - H: Productive Struggle Signals
   - I: Meta-Cognitive Signals
   - J: Hypothetical and Exploration Signals
4. **Checklist** — Signal assessment and response mechanism mapping algorithm
5. **Response Formats** — Four output formats with execution instructions
6. **Things Not To Do** — Guardrails (no extensions without signals, no pedagogical framing, pitch correctly, follow the user's thread, no urgency interruptions)
7. **Success Criteria** — Verifiable outcomes for each mechanism
8. **Inputs** — Live session stream, conversation history, inferred user level

#### Logic / Algorithm

**Phase 1 — Signal Detection (per user message):**
1. Read the full user message and conversation history.
2. Scan against all 10 signal categories. No single signal is definitive.
3. Classify signal weight:
   - No signals → proceed to Phase 2a
   - 1-2 weak signals (F, G, H, J) → proceed to Phase 2b
   - 1 strong signal (A, B, I) or 3+ weak signals → proceed to Phase 2c
   - Multiple strong signals or sustained pattern → proceed to Phase 2d

**Phase 2a — No Extension (Format 1):**
1. Deliver the complete task response.
2. Add nothing.

**Phase 2b — Rabbit Hole Drop (Format 2):**
1. Deliver the complete task response.
2. Append a single sentence naturally continuing the response, opening a thread the user can choose to follow. No heading, no label, no "by the way."
3. The sentence must reference something genuinely interesting about the topic that extends beyond what was asked and is pitched at the user's ZPD.

**Phase 2c — One Level Deeper Offer (Format 3):**
1. Deliver the complete task response.
2. Append a single optional line (max two sentences) making an explicit but frictionless offer to go deeper.
3. Phrased as a genuine choice, not a leading question: "Want to know why this works, or are you good?"
4. If user declines (one word or continues task): done.
5. If user accepts: transition to Reasoner Skill mode — 3-5 Socratic questions sequenced from accessible to deep, with at least one metacognitive question.

**Phase 2d — Reframe with Principle (Format 4):**
1. Restructure the answer itself so that it delivers the task response AND exposes the underlying principle — woven together in the same explanation.
2. No appendage, no separate section. The principle is visible inside the answer, not attached to the outside.
3. Example: instead of "use Promise.all() here," write "use Promise.all() here — which works because it fires all promises simultaneously and waits for the last one to resolve, so as long as the operations are independent this is always faster than sequencing them."

#### Edge Cases & Error Handling

- **First message of session**: Full signal taxonomy scan applies. If no signals yet, no extension — perfectly fine.
- **Urgency detected**: Short, direct prompts with no context, explicit time constraints, rapid-fire task requests → override all signal detection and produce no extension.
- **Ambiguous signal strength**: Borderline between Rabbit Hole Drop and One Level Deeper Offer → default to Rabbit Hole Drop (less intrusive).
- **User explicitly rejects extension**: If user says "no thanks" or "just the answer" → record this as negative signal; reduce extension frequency for remainder of session.
- **Conversation too short for level calibration**: Default to generalist level. Recalibrate as more signals accumulate.
- **User is off-task**: Distinguish between "task-exploration curiosity" (staying on task but going deeper) and "tangential curiosity" (wandering off task). Only extend threads aligned with the current task direction.

### 6.2 No Additional Files

**Type:** N/A — No runtime files, no tracking files, no dependencies.

The `curiosity` skill is stateless across sessions. All signal detection, level calibration, and response tracking are session-local.

---

## 7. Data Model Changes

N/A — The skill maintains no persistent data. All state (signal history, level inference) is session-local and ephemeral.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. This is a prompt-based skill with no server component.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/curiosity/SKILL.md` | Core skill definition — the entire implementation |
| CREATE | `docs/design/curiosity.md` | This design document |

**Total: 2 files created, 0 modified, 0 deleted.**

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. The skill is a Markdown prompt.

### Validation Tests
- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/curiosity/SKILL.md` exists
  - Frontmatter has valid `name: curiosity` matching the directory
  - Frontmatter has non-empty `description`
  - Body is non-empty
  - Skill name matches `^[a-z0-9]+(-[a-z0-9]+)*$` regex

### Manual / QA Test Cases

1. **No signals → silent**: Given the user asks "what does git status do?", then the agent responds with the answer only — no curiosity extension appended.
2. **Single weak signal → Rabbit Hole Drop**: Given the user says "I thought this would work but it doesn't — why?" (Category B), then the agent appends a single naturally-integrated sentence opening a thread.
3. **Category A signal → One Level Deeper Offer**: Given the user says "wait, why does this work this way?" (Category A), then the agent appends a single optional line offering to go deeper.
4. **Three weak signals → One Level Deeper Offer**: Given the user shows three signals from Categories F, G, H, or J in consecutive messages, then the agent offers one level deeper.
5. **Multiple strong signals → Reframe with Principle**: Given the user shows sustained Category I and A signals across multiple prompts, then the agent restructures the answer to weave the principle in.
6. **User accepts One Level Deeper Offer → Socratic follow-up**: Given the user says "yes, tell me more", then the next response uses 3-5 Socratic questions rather than stating the answer.
7. **Task response integrity**: Given any curiosity extension is added, when the response is delivered, then the task answer is complete and correct before the extension.
8. **Extension follows user's thread**: Given the user expressed interest in why a specific function works unexpectedly, then the extension deepens on that mechanism — not a different concept.
9. **Non-pedagogical framing**: Given any curiosity extension, then the language contains no phrases like "this is a good opportunity to understand", "let me teach you", or "here's something important to know."

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | The skill has zero external dependencies | None |

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the agent selects it based on its description. Since the description indicates automatic background operation, the agent loads it proactively.
- **Breaking change**: No. This is a new, additive skill. No existing code is modified.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Rollback procedure**: Delete `skills/curiosity/` directory and re-run the installer. No data migration needed.

---

## 13. Open Questions

- [ ] Should the Four Formats include an explicit format for the Reasoner Skill follow-up (Format 5), or is that implicit in Format 3's acceptance path? **Recommendation**: Implicit — it's the natural continuation of Format 3, not a separate format.
- [ ] Should the skill maintain an "extension suppression" signal when the user rejects an offer, to avoid repeated unwanted extensions in the same session? **Recommendation**: Yes — recorded in session-local state as described in edge cases.
- [ ] Should the `description` frontmatter hint at automatic behavior or require user invocation? **Recommendation**: Hint at automatic behavior, similar to the `why` skill pattern: "Runs automatically in the background."

---

## 14. Alternatives Considered

### Alternative 1: Interval-based injection (like `why` skill)
- What: Inject curiosity content at randomized cadences (every 5-10 prompts) regardless of user signals.
- Why rejected: The `curiosity` skill's core value proposition is that it only activates when the user is genuinely curious. Interval-based injection would produce false positives, training the user to ignore extensions — destroying their signal value when genuine curiosity is present.

### Alternative 2: Always-on extensions (always add a Rabbit Hole Drop)
- What: Append a curiosity thread to every response.
- Why rejected: Extensions that appear constantly become invisible. The skill's signal-detection selectivity is what makes the extensions meaningful.

### Alternative 3: Replace task answer with curiosity content
- What: When curiosity is detected, prioritize the deeper explanation over the task answer.
- Why rejected: This would make the skill hostile to task-mode users. The task answer must always come first and be complete.

### Alternative 4: Explicit user toggle (opt-in curiosity mode)
- What: Require the user to explicitly enable curiosity mode with `/curiosity on`.
- Why rejected: Curiosity is spontaneous. Adding a toggle gate would miss the natural moments the skill is designed to amplify. The signal-detection approach already handles opt-in/opt-out implicitly — an uninterested user produces no signals.

### Alternative 5: Five or more response mechanisms
- What: A more granular graduated system with 5+ tiers.
- Why rejected: Four formats is the right balance — enough granularity to match signal strength, not so many that the skill feels like a complex rules engine. The jump from Format 2 to Format 3 to Format 4 is visually and experientially distinct.

---

END OF DESIGN DOC
