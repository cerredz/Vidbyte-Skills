# Design Doc: /no-assumptions - Structured Assumption Excavation

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-13
**Last Updated:** 2026-05-13

---

## 1. Overview

`/no-assumptions` is a prompt skill that blocks model output until the user's
request is specific enough to execute without guessing. Instead of answering a
vague prompt, it asks a concrete checklist of questions about the hidden
assumptions, missing constraints, success criteria, audience, scope, inputs,
outputs, and implementation details that the model would otherwise invent.

The skill enforces a precision-first contract: the user must explain the task at
the level where the model knows exactly what to do. The goal is not to teach a
taxonomy of assumptions. The goal is to prevent drift by making every
execution-critical missing decision explicit before work begins.

---

## 2. Goals & Non-Goals

### Goals

- Provide a user-invoked `/no-assumptions` slash command.
- Surface every gap that would require the model to guess before answering.
- Ask a single general checklist of concrete clarifying questions, not
  category-labeled sections.
- Force high-level requests down to implementation-ready or content-ready
  detail.
- Apply beyond software engineering to writing, strategy, design, research, and
  planning tasks.
- Enforce a hard constraint: no partial help, no answering the clear parts, and
  no "best guess" mode while `/no-assumptions` is active.
- Follow existing `SKILL.md` conventions: YAML frontmatter, procedural
  instructions, explicit constraints, no file writes, no CLI/backend
  integration.
- Pass existing validation (`npm test`) without modifying validation scripts.
- Auto-discover via the existing installer with no registration changes.

### Non-Goals

- Writing files to disk. All output is inline.
- Modifying the installer (`bin/`, `lib/`).
- Modifying the CLI (`cli/`).
- Adding runtime dependencies, API calls, persistence, or network access.
- Replacing normal responses. The behavior applies only when the user starts
  the prompt with `/no-assumptions`.
- Producing a formal taxonomy of assumption types in the user-facing output.
- Acting as a background skill that activates automatically.
- Producing hidden scratchpad, memory files, or numbered trace artifacts.

---

## 3. Background & Context

Models are trained to be helpful by default. When a user says "make this
better," "clean this up," "write it in our style," or "make it production
ready," the model often fills in the missing details silently. It chooses what
"better" means, who the work is for, what can change, what must stay fixed, what
quality bar applies, and what the final output should look like.

That behavior is useful for casual requests but dangerous when precision matters.
The user may receive an answer that looks reasonable while being built on
decisions they never made. `/no-assumptions` forces those decisions back to the
user before the model commits to an answer.

The skill fills a gap in the Vidbyte suite. Existing skills such as `/question`,
`/counterargument`, `/mental-model`, and `/research` are designed to answer,
explain, challenge, or synthesize. `/no-assumptions` is different: it refuses to
begin until the request itself is precise enough to execute.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate only when the user's prompt starts with
   `/no-assumptions` (case-insensitive).

2. If the user invokes `/no-assumptions` with no request text, the skill SHALL
   respond with usage format and examples.

3. When activated with request text, the skill SHALL inspect the prompt for any
   execution-critical gap that would require the model to infer a decision.

4. The skill SHALL ask about missing implementation or content details, including
   scope, audience, purpose, inputs, outputs, constraints, success conditions,
   acceptable tradeoffs, examples to follow, and standards to avoid.

5. The skill SHALL treat vague high-level words such as "better," "clean,"
   "professional," "production ready," "the usual way," and "make it work" as
   unresolved unless the request defines what they mean in context.

6. The skill SHALL produce a single refusal checklist of concrete questions. The
   user-facing response SHALL NOT be organized under fixed category headings.

7. Each checklist item SHALL be specific enough that answering it removes a real
   blocker to execution. Generic questions like "can you clarify?" are not
   sufficient.

8. The refusal preamble SHALL be:
   `Before I can help with this, the following need to be made explicit:`

9. The refusal closing SHALL be:
   `Respond to each one above. I will not proceed until all are resolved.`

10. The skill SHALL produce zero partial answers. If the request contains both
    clear and unclear elements, the entire request is blocked.

11. If the user's request is genuinely precise on first examination, the skill
    SHALL acknowledge that no execution gaps were detected and produce a normal
    answer with elevated rigor.

12. When the user responds with clarifications, the skill SHALL re-check the
    combined original request and clarifications. The loop continues until the
    request is fully specified.

### Non-Functional Requirements

- **Performance:** N/A - pure prompt behavior only.
- **Scalability:** N/A - single-request invocation, no persistent state.
- **Security:** No secrets, no network calls, no file writes.
- **Observability:** N/A - inline response only, no logging.
- **Reliability:** The refusal must hold even when the model's default helpful
  behavior pushes toward partial answers.

---

## 5. High-Level Design

`/no-assumptions` is a pure prompt skill. It follows the existing
slash-command pattern used by other Vidbyte skills, but its output is a
precision gate rather than an answer format.

### Architecture

```
User invokes /no-assumptions <request>
    |
    v
Skill activates on prefix
    |
    v
Internal understanding check:
  - What would the model have to choose for the user?
  - Would two competent people produce different outputs?
  - Is the request still too high-level to execute?
    |
    v
Decision: execution gaps found?
  |-- YES -> Produce one general checklist of clarifying questions
  |          User responds with clarifications
  |          Re-check until precise
  |
  |-- NO  -> Acknowledge precision and answer with elevated rigor
```

### Key Design Decisions

1. **General checklist over category taxonomy.** The user should receive the
   exact questions that block execution, not a lesson organized under assumption
   categories. The checklist is direct: what does the model still need to know?

2. **Implementation-ready specificity.** The skill rejects prompts that explain
   an idea at too high of a level while omitting the details needed to implement,
   write, design, or decide correctly.

3. **Hard block over partial help.** Partial answers reward vague prompts. The
   skill must block the whole request until the missing decisions are explicit.

4. **Concrete questions over generic clarification.** Every checklist item must
   point to a specific missing decision. "What does better mean here?" is weak;
   "Which outcome should improve, and how will that improvement be judged?" is
   acceptable.

5. **Loop until executable.** Clarifications are re-checked because a partial
   clarification may resolve one gap while introducing another.

---

## 6. Detailed Design

### 6.1 `skills/no-assumptions/SKILL.md`

The implementation is a single prompt skill definition.

#### Identity and Intuition

The skill defines itself as an assumption excavator. Its intuition section
explains that the user must make their thinking complete enough that the model
knows exactly what to do before it begins. It also clarifies that this applies to
software and non-software work: code needs implementation details, while content
needs audience, purpose, voice, claims, constraints, and success criteria.

#### Activation

The skill activates only when the prompt starts with `/no-assumptions`. Empty
invocations return usage guidance and examples.

#### Internal Understanding Check

Before producing output, the model privately asks:

- What would I have to choose on the user's behalf if I started now?
- Would two competent people produce meaningfully different outputs from this
  same prompt?
- Is the prompt conceptual when the task requires concrete execution?

Any answer that reveals a missing decision becomes a checklist question.

#### Refusal Format

When gaps exist, the response is:

```
Before I can help with this, the following need to be made explicit:

[ ] "[quoted phrase from the user's request]" - [specific question that would remove the ambiguity]
[ ] [Specific question about a missing detail the model would otherwise have to infer]
[ ] [Specific question about a constraint, success condition, audience, scope, input, output, or implementation detail]

Respond to each one above. I will not proceed until all are resolved.
```

No category headings are used.

#### Precise Request Behavior

When no execution gaps are found, the skill responds:

```
No unstated execution gaps detected.
Proceeding with elevated rigor.
```

Then it answers normally while preserving the stated scope and avoiding newly
introduced unstated assumptions.

---

## 7. Data Model Changes

N/A. This is a pure prompt skill.

---

## 8. API Changes

N/A. This skill has no API endpoints, CLI integration, or network communication.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/no-assumptions/SKILL.md` | New prompt skill definition |

---

## 10. Testing Plan

### Automated Tests

- Run `npm test`.
- Confirm validation passes with the new skill directory and `SKILL.md`
  frontmatter.

### Manual / QA Test Cases

1. **Empty invocation**
   - Given: `/no-assumptions`
   - Then: Skill responds with usage format and examples.

2. **Vague implementation request**
   - Given: `/no-assumptions make this faster`
   - Then: Skill asks what "this" is, which speed metric matters, current
     baseline, target threshold, and constraints.

3. **Vague content request**
   - Given: `/no-assumptions write this in our style`
   - Then: Skill asks what "this" refers to, who the audience is, what style
     examples define "our style," and what claims or constraints apply.

4. **High-level product request**
   - Given: `/no-assumptions build the onboarding`
   - Then: Skill asks who is onboarding, what first successful action matters,
     which surfaces are in scope, what product constraints exist, and how
     success is measured.

5. **No category output**
   - Given: Any vague `/no-assumptions` request
   - Then: Response is a single checklist and does not contain fixed headings
     such as "Undefined Terms" or "Missing Subject."

6. **Precise request**
   - Given: `/no-assumptions add a rate limiter to GET /api/users allowing 100 requests per minute per API key, returning HTTP 429 when exceeded, using Redis counters with a 1-minute fixed window`
   - Then: Skill acknowledges no execution gaps and answers normally.

7. **Partial clarification loop**
   - Given: User answers only some checklist items
   - Then: Skill re-checks and asks only the remaining or newly introduced
     execution-gap questions.

8. **User rejects precision contract**
   - Given: User responds with "just do it anyway"
   - Then: Skill explains that `/no-assumptions` is precision-first and asks the
     user to re-issue without the prefix for a normal answer.

9. **No softening**
   - Given: A vague `/no-assumptions` request
   - Then: Response does not contain partial-answer language such as "here's a
     starting point" or "while you clarify."

10. **Non-invocation silence**
    - Given: A normal prompt without `/no-assumptions`
    - Then: Skill does not activate.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | Pure prompt behavior | N/A |

---

## 12. Rollout & Deployment

- **Feature flags:** None. The skill activates only on explicit invocation.
- **Breaking change:** No. This is a new skill addition with zero impact on
  existing skills.
- **Deployment order:** Single-step create `skills/no-assumptions/SKILL.md`.
- **Rollback procedure:** Delete the `skills/no-assumptions/` directory.

---

## 13. Open Questions

- [ ] Should the skill support a strictness flag? RESOLVED: Not in v1. A
  leniency flag undermines the precision-first contract.
- [ ] Should the skill provide examples of good clarification responses?
  RESOLVED: No. The checklist questions should be specific enough to guide the
  user.
- [ ] Should the skill maintain domain-specific safe-word lists? RESOLVED: Not
  in v1. The model should use judgment and only flag terms that are ambiguous in
  context.

---

## 14. Alternatives Considered

### Alternative 1: Background Skill

- **What:** Activate automatically on every user message.
- **Why rejected:** This would make normal interactions too adversarial. The
  explicit slash command lets the user choose when they want precision friction.

### Alternative 2: Two-Stage Flag Then Answer

- **What:** Ask clarification questions while also answering the clear parts.
- **Why rejected:** Partial answers reward vague prompts and create the exact
  behavior the skill is meant to prevent.

### Alternative 3: Fixed Assumption Categories

- **What:** Organize output under fixed headings such as undefined terms,
  missing subjects, unstated constraints, and assumed shared context.
- **Why rejected:** The reviewer feedback clarified that the user-facing output
  should be a general checklist of hidden assumptions and implementation gaps,
  not a category system. Categories can help thinking, but the response should
  focus on the exact questions that make the model ready to execute.

### Alternative 4: Inline Annotation Mode

- **What:** Echo the user's request with vague portions highlighted inline.
- **Why rejected:** Inline annotation blurs the refusal boundary and makes the
  model more likely to start answering instead of holding the precision gate.
