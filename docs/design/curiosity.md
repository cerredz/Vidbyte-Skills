# Design Doc: Curiosity Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-11
**Last Updated:** 2026-05-11

---

## 1. Overview

The `curiosity` skill transforms the agent into a curiosity amplifier — a system that continuously scans user messages for behavioral signals indicating genuine curiosity, and extends those moments with carefully calibrated content that makes following a thread of interest more rewarding. It does not create learning moments; it amplifies the ones already happening. A user in pure task mode receives their answer unchanged. A user who is already leaning in gets one of four graduated response mechanisms: a Rabbit Hole Drop, a One Level Deeper Offer, a Reframe with Principle, or a Deep Dive Follow-Through. The skill is grounded in the neuroscience of curiosity — dopamine-driven encoding windows, the self-generation effect on the nucleus accumbens, and the productive struggle as the most powerful state for durable learning.

The companion `curiosity-background` skill extends the same signal taxonomy into a silent, background tracking mode — logging curiosity moments to a file and syncing them to Vidbyte for later review, without ever interrupting the user's workflow.

---

## 2. Goals & Non-Goals

### Goals
- Continuously scan every user message against a 10-category curiosity signal taxonomy (110+ signals)
- Detect the difference between task-mode prompts (answer-only) and curiosity-mode prompts (user is pulling a thread)
- Match signal strength to one of four graduated response mechanisms: Rabbit Hole Drop, One Level Deeper Offer, Reframe with Principle, or Deep Dive Follow-Through
- Calibrate every curiosity extension to the user's demonstrated level of expertise
- Deliver the task response first, completely, and at full quality — curiosity content is always additive
- Ensure zero friction for non-curious users: extensions must cost less than 2 seconds of attention to skip
- Never frame curiosity content as educational, instructional, or pedagogical
- When the user accepts a deeper offer or engages with a rabbit hole, provide a comprehensive in-depth explanation of the topic and — when web search is available — curated additional resources
- Provide a background tracking variant (`curiosity-background`) that silently logs curiosity moments to a file and syncs them to Vidbyte without interrupting workflow

### Non-Goals
- Installing any new runtime code (the skill is a prompt, not executable code)
- Modifying the installer (`bin/`, `lib/`) — this is a standard, auto-discovered skill
- Modifying validation scripts — the skill passes existing validation unchanged
- Replacing the normal answer — the task response always comes first, undiluted
- Asking the user direct questions about their curiosity or learning goals — the skill infers everything
- The background variant never interrupts or adds to responses during a session

---

## 3. Background & Context

In high-efficiency coding environments, users often oscillate between two modes: task mode (give me the answer so I can keep moving) and curiosity mode (something just caught my attention and I want to understand it more deeply). Most tools treat both modes identically, either ignoring curiosity entirely or imposing a learning layer that slows down task-mode users.

The `curiosity` skill solves this by operating as a signal detector rather than an always-on intervention. It reads user behavior — word choice, question patterns, engagement depth, reformulation behavior, connection-making — and activates only when the evidence of genuine curiosity crosses a threshold. When inactive, it is invisible. When active, it extends the user's natural thread of interest in a way that feels like a continuation of the conversation, not a pedagogical interruption.

The `curiosity-background` skill addresses a related but distinct need: some users want their curiosity moments captured for later review or analysis, but do not want extensions or interruptions during a working session. The background variant uses the same signal taxonomy but operates silently — logging detections to a file and a Vidbyte page without any visible output during the session.

---

## 4. Requirements

### Functional Requirements — Curiosity Skill

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
10. When a user accepts a One Level Deeper Offer or engages with a Rabbit Hole Drop, the follow-up SHALL deliver a comprehensive in-depth explanation (Deep Dive Follow-Through) covering the mechanism, context, tradeoffs, and mental model.
11. During the Deep Dive Follow-Through, when web search is available, the skill SHALL find and display 2–5 relevant, verified additional resources for further exploration.
12. When web search is unavailable during the Deep Dive Follow-Through, the skill SHALL deliver the in-depth explanation alone — silently skipping the resource section.
13. The skill SHALL NOT fabricate or guess resource URLs or titles — only resources actually found via web search shall be presented.
14. The skill SHALL maintain a persona: a curiosity amplifier — not a teacher, not a tutor, not a learning intervention.
15. The skill SHALL internalize the neuroscience of curiosity at a mechanistic level.

### Functional Requirements — Curiosity-Background Skill

16. The curiosity-background skill SHALL activate silent tracking when the user invokes `/curiosity-background`.
17. During tracking, the skill SHALL scan every user message against the same 10-category signal taxonomy without producing any visible output or modification to responses.
18. The skill SHALL log curiosity moments internally using signal weight assessment: always log Category A and I signals (strong), log Category B, C, D, E signals with corroboration, and log Category F, G, H, J signals when 3+ total signals are detected.
19. When the user invokes `/curiosity-background-end`, the skill SHALL write all logged moments as bullet points, append them to `curiosity-background-log.md`, and POST the data to `https://vidbyte.pro/api/skills/curiosity-background` using the standard Vidbyte skill API headers.
20. The skill SHALL limit logged entries to 10 per session, triaged by signal weight.
21. The skill SHALL NOT log task-driven information requests — only moments of genuine curiosity.

### Non-Functional Requirements

- **Performance**: Negligible overhead. The skill performs no file I/O during active tracking. Signal scanning is limited to the current user message and conversation history.
- **Scalability**: No persistent state beyond the log file and Vidbyte sync. Each session is independent.
- **Security**: No file writes during sessions, network calls only on explicit close invocation.
- **Observability**: The curiosity extensions and background log entries serve as the only visible output.
- **Reliability**: If signal detection is ambiguous, err on the side of no extension / no log entry.

---

## 5. High-Level Design

### Curiosity Skill

The skill is a single `SKILL.md` file containing the complete master prompt. The agent becomes a curiosity-amplifying system when the skill is loaded.

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
                    |         User accepts?  --> Deep Dive Follow-Through (Format 5)
                    |                              |
                    |                              +-- Full in-depth explanation
                    |                              +-- Web search for resources (if available)
                    |                              +-- Display curated resource links
                    |
                    +-- Deliver response
```

### Curiosity-Background Skill

The background skill is a separate `SKILL.md` file that is explicitly invoked. It uses the same signal taxonomy but operates silently.

**Data flow:**

```
User Message -> [Agent with curiosity-background skill active]
                    |
                    +-- Scan message against 10-category signal taxonomy
                    |
                    +-- Curiosity moment detected?
                    |         |
                    |        Yes --> Log internally (topic, category, summary)
                    |         |          No visible output. No response modification.
                    |         |
                    |         No --> Continue normal operation
                    |
                    ... (repeats for each message until session close)
                    |
                    +-- User invokes /curiosity-background-end
                              |
                              +-- Write bullets to curiosity-background-log.md
                              +-- POST to Vidbyte API
                              +-- Print summary to terminal
```

**Key design decisions:**

1. **Signal-driven, not interval-driven**: Both skills are entirely reactive. They activate only when user behavior indicates curiosity.
2. **Five graduated response mechanisms (curiosity)**: Rabbit Hole Drop, One Level Deeper Offer, Reframe with Principle, and the Deep Dive Follow-Through. The graduated system ensures proportional responses.
3. **Deep Dive Follow-Through with web search integration**: When users opt into deeper exploration, they receive a comprehensive explanation plus curated external resources. This addresses the gap between "interesting tidbit" and "I actually want to understand this deeply."
4. **Always-additive, never-substitutive**: The task answer always comes first, complete.
5. **Invisible when inactive / silent when tracking**: No visible change in agent behavior for uninterested users.
6. **Prompt-based, not executable code**: Universal portability, no runtime dependencies.
7. **Vidbyte integration for background tracking**: Same pattern as `daily-review` and `misconceptions` — append to .md log, curl POST to vidbyte.pro API with standard headers.

---

## 6. Detailed Design

### 6.1 SKILL.md (Curiosity Skill Definition)

**File(s):** `skills/curiosity/SKILL.md`
**Type:** New file

#### What it does

The complete curiosity skill definition. Contains YAML frontmatter and the full master prompt covering identity/persona, goal, the 10-category curiosity signal taxonomy, a weighted signal assessment algorithm, the four graduated response mechanisms plus the Deep Dive Follow-Through, calibration rules, and a comprehensive "things not to do" guardrail section.

#### Deep Dive Follow-Through (New Mechanism)

When a user accepts a One Level Deeper Offer or engages with a Rabbit Hole Drop, the skill transitions to the Deep Dive Follow-Through instead of the previous Reasoner Skill / Socratic question approach. This mechanism has three phases:

**Phase 1 — Full Explanation:**
A thorough, well-structured explanation of the topic the user is curious about. Covers mechanism, context, tradeoffs, and mental model. Uses concrete examples and connects to concepts the user already knows. Pitched at the Zone of Proximal Development.

**Phase 2 — Web Search for Resources:**
If web search is available in the current environment, the skill searches for 2–5 high-quality, relevant resources — authoritative documentation, well-regarded tutorials, related concepts, recent developments.

**Phase 3 — Display Resources:**
Resources are presented in a clear, scannable format at the end of the response. If web search is unavailable or returns no useful results, this phase is silently skipped.

### 6.2 SKILL.md (Curiosity-Background Skill Definition)

**File(s):** `skills/curiosity-background/SKILL.md`
**Type:** New file

#### What it does

A silent background tracking variant of the curiosity skill. When invoked via `/curiosity-background`, it activates passive curiosity detection for the remainder of the session — scanning every user message against the same 10-category signal taxonomy but never adding to responses or interrupting the user. On `/curiosity-background-end`, observed curiosity moments are written as bullet points, appended to `curiosity-background-log.md`, and POSTed to the Vidbyte API.

#### Interface / API

Frontmatter:
```yaml
---
name: curiosity-background
description: >
  Use this skill when the user invokes /curiosity-background to activate background curiosity tracking
  for the current session, or invokes /curiosity-background-end to append the observed curiosity moments
  to curiosity-background-log.md and send them to Vidbyte.
---
```

#### Vidbyte Sync Pattern

Follows the same pattern as `daily-review` and `misconceptions`:
- Append session entries to `curiosity-background-log.md` using `>>`
- POST JSON payload to `https://vidbyte.pro/api/skills/curiosity-background`
- Headers: `X-Skill-Id: curiosity-background-v1`, `X-Skill-Timestamp`, `X-Skill-Nonce`
- Payload format: `{"type": "curiosity_background", "session_date": "...", "session_time": "...", "entries": [...]}`

### 6.3 No Additional Files

**Type:** N/A — No runtime files beyond the two SKILL.md files.

The `curiosity` skill is stateless across sessions. The `curiosity-background` skill persists only to the log file and Vidbyte API.

---

## 7. Data Model Changes

N/A — The curiosity skill maintains no persistent data. The curiosity-background skill appends to `curiosity-background-log.md` and POSTs to Vidbyte API. All state (signal history, level inference) is session-local and ephemeral.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. The curiosity-background skill POSTs to an existing Vidbyte API endpoint pattern.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/curiosity/SKILL.md` | Core curiosity skill definition — the entire implementation, including Deep Dive Follow-Through mechanism |
| CREATE | `skills/curiosity-background/SKILL.md` | Background tracking variant — silent curiosity detection with Vidbyte sync |
| CREATE | `docs/design/curiosity.md` | This design document |

**Total: 3 files created, 0 modified, 0 deleted.**

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. Both skills are Markdown prompts.

### Validation Tests
- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/curiosity/SKILL.md` exists with valid frontmatter and non-empty body
  - `skills/curiosity-background/SKILL.md` exists with valid frontmatter and non-empty body
  - Both skill names match their directories and pass `^[a-z0-9]+(-[a-z0-9]+)*$` regex

### Manual / QA Test Cases

#### Curiosity Skill

1. **No signals → silent**: Given the user asks "what does git status do?", then the agent responds with the answer only — no curiosity extension appended.
2. **Single weak signal → Rabbit Hole Drop**: Given the user says "I thought this would work but it doesn't — why?" (Category B), then the agent appends a single naturally-integrated sentence opening a thread.
3. **Category A signal → One Level Deeper Offer**: Given the user says "wait, why does this work this way?" (Category A), then the agent appends a single optional line offering to go deeper.
4. **Three weak signals → One Level Deeper Offer**: Given the user shows three signals from Categories F, G, H, or J in consecutive messages, then the agent offers one level deeper.
5. **Multiple strong signals → Reframe with Principle**: Given the user shows sustained Category I and A signals across multiple prompts, then the agent restructures the answer to weave the principle in.
6. **User accepts One Level Deeper Offer → Deep Dive Follow-Through**: Given the user says "yes, tell me more", then the next response delivers a comprehensive in-depth explanation of the topic.
7. **Deep Dive with web search available → Resources displayed**: Given web search is available and the user accepts a deeper offer, then the response includes curated resources at the end.
8. **Deep Dive without web search → Elaboration only**: Given web search is unavailable, then the response delivers the in-depth explanation without mentioning resources.
9. **Task response integrity**: Given any curiosity extension is added, when the response is delivered, then the task answer is complete and correct before the extension.
10. **Extension follows user's thread**: Given the user expressed interest in why a specific function works unexpectedly, then the extension deepens on that mechanism — not a different concept.
11. **Non-pedagogical framing**: Given any curiosity extension, then the language contains no phrases like "this is a good opportunity to understand", "let me teach you", or "here's something important to know."

#### Curiosity-Background Skill

12. **Activation → silent tracking**: Given `/curiosity-background` is invoked, then the agent confirms activation with one line and all subsequent responses contain no tracking-related content.
13. **Curiosity moment logged**: Given the user says "wait, why does Promise.all work this way?" during tracking, then the moment is internally logged with topic, Category A, and summary.
14. **Close → log written**: Given `/curiosity-background-end` is invoked, then bullets are appended to `curiosity-background-log.md` and the Vidbyte API response is printed.
15. **No moments → empty log**: Given no curiosity signals were detected during tracking, then the log contains "No curiosity moments detected this session."
16. **Max 10 bullets**: Given more than 10 curiosity moments are detected, then the log contains at most 10, triaged by signal weight.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Vidbyte API | `https://vidbyte.pro/api/skills/curiosity-background` | Sync curiosity-background log entries for spaced review | API unavailability means entries are only in local log file |
| Web Search (optional) | Environment-dependent | Find additional resources during Deep Dive Follow-Through | Unavailable in some agent harnesses; skill degrades gracefully |

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skills are loaded when the agent selects them based on their descriptions. `curiosity` indicates automatic background operation. `curiosity-background` is explicitly invoked.
- **Breaking change**: No. These are new, additive skills. No existing code is modified.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directories automatically.
- **Rollback procedure**: Delete `skills/curiosity/` and `skills/curiosity-background/` directories and re-run the installer. No data migration needed.

---

## 13. Open Questions

- [x] Should the follow-up path use the Reasoner Skill (Socratic questions) or a full in-depth explanation? **Resolved**: Use Deep Dive Follow-Through — comprehensive in-depth explanation with optional web search resources.
- [x] Should the `description` frontmatter hint at automatic behavior or require user invocation? **Resolved**: `curiosity` hints at automatic behavior. `curiosity-background` requires explicit invocation.
- [x] Should a background variant exist? **Resolved**: Yes — `curiosity-background` skill file, sharing the same signal taxonomy, operating silently with Vidbyte sync on session close.

---

## 14. Alternatives Considered

### Alternative 1: Socratic-only follow-up (original design)
- What: When user accepts a One Level Deeper Offer, use 3-5 Socratic questions rather than stating the answer.
- Why replaced: The reviewer requested that when the user actually wants to explore something in detail, the output should explain the topic in depth — after reading, the user should know about the topic comprehensively, not just have been guided through questions.

### Alternative 2: Interval-based injection (like `why` skill)
- What: Inject curiosity content at randomized cadences regardless of user signals.
- Why rejected: Core value proposition is signal-detection selectivity.

### Alternative 3: Always-on extensions
- What: Append a curiosity thread to every response.
- Why rejected: Extensions that appear constantly become invisible.

### Alternative 4: No background variant
- What: Only the interactive curiosity skill.
- Why rejected: The reviewer requested a background variant that captures curiosity moments silently and syncs them to Vidbyte for later review.

### Alternative 5: Single combined skill
- What: One SKILL.md that handles both interactive extension and background tracking.
- Why rejected: Two skills with clear separation of concerns — interactive amplification vs. silent tracking — are cleaner to install, invoke, and reason about separately.

---

END OF DESIGN DOC
