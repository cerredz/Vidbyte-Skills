# Design Doc: /no-assumptions — Structured Assumption Excavation

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-13
**Last Updated:** 2026-05-13

---

## 1. Overview

`/no-assumptions` is a prompt skill that forces productive precision in model interactions. Instead of answering a request, it produces a structured refusal that identifies every instance of vagueness, undefined terms, unstated context, and hidden assumptions in the user's prompt — organized into four categories — and blocks all help until every gap is explicitly resolved. The skill enforces a "precision-first" contract: the answer does not exist until the question is precise.

---

## 2. Goals & Non-Goals

### Goals

- Provide a user-invoked `/no-assumptions` slash command that excavates hidden assumptions from any prompt
- Organize findings into four explicit categories: undefined terms, missing subject, unstated constraints, assumed shared context
- Produce a structured refusal checklist where every gap has a concrete clarifying question
- Enforce a hard constraint: no partial help, no answering "the parts that are clear" while flagging the rest — the entire request is blocked until the entire checklist is cleared
- The model must not soften this behavior — no "I'll help with what I can while you clarify the rest"
- Follow existing SKILL.md conventions: YAML frontmatter, procedural instructions, explicit constraints, no file writes, no CLI/backend integration
- Pass existing validation (`npm test`) without modification to validation scripts
- Auto-discover via the existing installer — no registration changes

### Non-Goals

- Writing files to disk — all output is inline in the response
- Modifying the installer (`bin/`, `lib/`) — this is a standard auto-discovered skill
- Modifying the CLI (`cli/`) — no backend submission, no Python changes
- Modifying validation scripts — the skill passes existing validation unchanged
- Replacing normal responses — only responses to the specific `/no-assumptions` command are affected
- Adding runtime dependencies or API calls — pure prompt engineering
- Being a background/learning skill that activates automatically — this is an explicit user-invoked tool
- Being a reasoning trace skill — no scratchpad, no memory file, no numbered lines output

---

## 3. Background & Context

### Why this is being built now

Model interactions trend toward efficiency at the cost of precision. Models are trained to be helpful by default — filling in gaps, making reasonable assumptions, and producing answers without surfacing what they're assuming. This creates a hidden tax: users receive answers built on unstated premises, and neither party realizes it. The model guesses, the user accepts, and flawed reasoning enters the workflow without detection.

This skill fills a gap in the Vidbyte suite: every existing skill is designed to *answer* — whether through adversarial critique (`/counterargument`), layered explanation (`/explain`), mental model construction (`/mental-model`), research synthesis (`/research`), or deep questioning (`/question`). None are designed to *refuse to answer until the question is precise enough to answer correctly*.

### What problem it solves

Users offload cognitive work onto models through vague language: "fix this," "make it better," "improve the onboarding," "make this scalable." Each of these contains dozens of hidden decisions the user has not made — and the model, eager to help, makes all of them silently. The result is output that looks reasonable but is built on foundations the user never examined.

`/no-assumptions` forces those hidden decisions back to the user. It treats vagueness not as something to work around but as a blocker to be resolved. The productive friction is the feature.

### Current state

No existing Vidbyte skill provides this capability. The closest analogs:

- `/question` goes deeper on a user's question but does not challenge the question's precision
- `/why` asks metacognitive reflection questions but does not block answers for vagueness
- `/counterargument` stress-tests ideas but does not examine the assumptions in the *asking*
- Trace skills produce structured analysis but always toward an answer, never toward refining the question

`/no-assumptions` is the first Vidbyte skill that refuses to do its job until the conditions for doing it well are met.

### Constraints and dependencies

- Pure prompt skill — no files, no CLI, no network, no backend
- Must interoperate with the existing 500+ skills without conflict
- Must not interfere with normal model behavior when not invoked
- Must survive the model's natural tendency to soften refusals with partial help

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate only when the user's prompt starts with `/no-assumptions` (case-insensitive).

2. When activated with text following the command, the skill SHALL scan the user's request across four categories before any answering behavior.

3. Category 1 — Undefined Terms: The skill SHALL identify words that feel concrete but are not: "fast," "better," "clean," "simple," "scalable," "efficient," "secure," "modern," "robust," "intuitive," "performant," "maintainable," "optimize," "improve," "fix this," "refactor." For each, the skill SHALL return a specific clarifying question asking what the term means in THIS context.

4. Category 2 — Missing Subject: The skill SHALL identify where the request omits the subject of its verbs: who is this for, under what conditions, on what data, at what scale, at what point in the system, measured against what baseline. Requests that omit the actor, object, or scope SHALL be flagged before anything else.

5. Category 3 — Unstated Constraints: The skill SHALL identify what is not stated but must be true for the request to be answerable: what cannot change, what has already been tried, what constraints apply but were not mentioned, what the user is unwilling to modify. "Help me structure this database" without stating what query patterns matter, what consistency guarantees are needed, or what cannot be restructured SHALL be flagged.

6. Category 4 — Assumed Shared Context: The skill SHALL identify references the user believes the model already knows that it does not: "the usual approach," "how we normally do this," "the standard way," "like we did before," "the typical pattern." Any request containing these without stating what they mean in this specific project SHALL be flagged.

7. The refusal format SHALL be a bullet checklist organized by category, where each [ ] item is a concrete, specific clarifying question — not a generic "please clarify." Each item SHALL be answerable by the user with specific information.

8. The refusal preamble SHALL be: "Before I can help with this, the following need to be made explicit:" — followed by the category sections and their checklist items. The closing SHALL be: "Respond to each one above. I will not proceed until all are resolved."

9. The skill SHALL produce zero partial answers. If the request contains both clear and unclear elements, the entire request is blocked. The model SHALL NOT answer the clear parts while flagging the rest. The model SHALL NOT say "I'll help with what I can while you clarify the rest" or any equivalent softening.

10. If the user invokes `/no-assumptions` with no text following it, the skill SHALL respond with usage format and examples.

11. If the user's request is genuinely precise on first examination (no undefined terms, subject is explicit, constraints are stated, no assumed shared context), the skill SHALL acknowledge this and produce a normal answer — but with elevated rigor proportional to the precision already demonstrated. The skill SHALL NOT invent gaps where none exist just to fulfil a refusal contract.

12. When the user responds with clarifications, the skill SHALL re-scan and identify any remaining gaps. The loop continues until the request is fully specified.

### Non-Functional Requirements

- **Performance**: N/A — pure prompt, no computation beyond normal model inference
- **Scalability**: N/A — single-request invocation, no persistent state
- **Security**: No secrets in prompt, no network calls, no file writes
- **Observability**: N/A — inline response only, no logging
- **Reliability**: The refusal must be produced even if the model's default helpfulness instinct pushes toward partial answers. The hard constraints in the skill prompt must overcome this tendency.
- **Latency**: Must not meaningfully increase response time beyond normal model inference

---

## 5. High-Level Design

`/no-assumptions` is a pure prompt skill (Type 2 in the Vidbyte taxonomy). It follows the exact same invocation-and-response pattern as the existing five prompt skills (`/counterargument`, `/explain`, `/mental-model`, `/question`, `/research`).

### Architecture

```
User invokes /no-assumptions <request>
    |
    v
Skill activates (Step 1 — gating on /no-assumptions prefix)
    |
    v
Scanner runs four-category analysis of the request text:
  ├── Category 1: Undefined terms scan
  ├── Category 2: Missing subject scan
  ├── Category 3: Unstated constraints scan
  └── Category 4: Assumed shared context scan
    |
    v
Decision: gaps found?
  ├── YES → Produce structured refusal checklist
  │         User responds with clarifications
  │         → Re-scan → Loop until precise
  │
  └── NO  → Acknowledge precision, produce normal answer
             with elevated rigor
```

### Key Design Decisions

1. **Four-category taxonomy over flat list**: Organizing by category (terms, subject, constraints, context) forces the scanner to think across distinct dimensions of vagueness rather than producing a generic "please clarify." Each category represents a different type of hidden assumption, and the model must examine each independently.

2. **Hard block over partial help**: This is the hardest design decision. Models are trained to be helpful, and "helpful" defaults to "answer what you can." Partial help rewards vague requests — the user gets something without doing the cognitive work. The skill must explicitly prohibit this. The constraint text in the prompt must be emphatic enough to overcome the model's helpfulness bias.

3. **Concrete questions over generic prompts**: Every checklist item must be a specific, answerable question referencing the user's actual text. "What does 'faster' mean?" is generic. "Faster by what metric — request latency, time-to-first-byte, or throughput under load?" is concrete. The difference matters because concrete questions make the hidden decision visible to the user.

4. **Loop until precise, not until exhausted**: The skill keeps scanning and refining until the request is genuinely specified. It does not stop after one round of clarification just because the user made an effort. The loop only ends when the categories are clean.

5. **No-preamble/no-postamble delivery**: Following the established prompt skill pattern, the response is delivered with no introduction or closing beyond the refusal format itself. The checklist IS the response.

---

## 6. Detailed Design

### 6.1 SKILL.md — Prompt Skill Definition

**File(s):** `skills/no-assumptions/SKILL.md`
**Type:** New file

#### What it does

Defines the `/no-assumptions` prompt skill: its identity, activation rules, four-category scan algorithm, refusal format, hard constraints against partial help, and success criteria. This is the sole implementation artifact — no other files are created or modified.

#### Interface / API

The skill has no programmatic interface. It is invoked by the user typing:

```
/no-assumptions <request text>
```

The skill produces an inline Markdown response following the refusal format, or a normal answer if the request is already precise.

#### Logic / Algorithm

**Step 1 — Gating.** If the user's prompt does not start with `/no-assumptions`, produce a normal response. The skill is silent.

**Step 2 — Empty invocation.** If the user typed only `/no-assumptions` with no request text, respond with usage format and examples. Do not proceed to the scan.

**Step 3 — Four-category scan.** For each category, analyze the request text:

- *Category 1 — Undefined Terms*: Scan for words that feel concrete but are not: faster, better, cleaner, simpler, scalable, efficient, secure, modern, robust, intuitive, performant, maintainable, optimized, improved, fixed, refactored, organized, flexible, reliable, good, bad, nice, usable, smooth, clean. When found, produce a checklist item asking: what does [term] mean in this specific context — by what metric, under what conditions, judged by whom?

- *Category 2 — Missing Subject*: Scan for missing actors, objects, scopes, scales, conditions, and baselines. Who is this for? Under what conditions? On what data? At what scale? At what point in the system? Measured against what? When found, produce a checklist item asking the specific missing-subject question.

- *Category 3 — Unstated Constraints*: Scan for what must be true but is not stated. What cannot change? What has already been tried? What tools, languages, frameworks, or patterns are required or prohibited? What is the user unwilling to modify? What is the budget — time, compute, attention? When found, produce a checklist item.

- *Category 4 — Assumed Shared Context*: Scan for references that assume shared knowledge not stated: "the usual approach," "how we normally do this," "the standard way," "like we did before," "the typical pattern," "as everyone knows," "the obvious solution," "following best practices," "conventional wisdom." When found, produce a checklist item asking: what does [reference] mean in this specific project/context?

**Step 4 — Decision.** If any category produced items, produce the refusal. If all categories are clean, acknowledge the precision and produce a normal answer with elevated rigor.

**Step 5 — Refusal format.** When gaps exist, output exactly:

```
Before I can help with this, the following need to be made explicit:

## Undefined Terms
[Checklist items from Category 1, or "None found." if clean]

## Missing Subject
[Checklist items from Category 2, or "None found." if clean]

## Unstated Constraints
[Checklist items from Category 3, or "None found." if clean]

## Assumed Shared Context
[Checklist items from Category 4, or "None found." if clean]

Respond to each one above. I will not proceed until all are resolved.
```

Each checklist item format: `[ ] "[quoted text from request]" — [specific clarifying question]`

**Step 6 — Re-scan on clarification.** When the user responds to the checklist, treat the combined original request + clarification as the new request. Re-run the four-category scan. Produce updated refusal if gaps remain. Produce answer if all categories are clean.

**Step 7 — Elevated rigor answer.** When the request passes all categories, produce a normal answer but maintain the precision standard: define terms, state scope, acknowledge limitations, and avoid introducing new unstated assumptions.

#### Edge Cases & Error Handling

- **Request is already precise**: If the scanner finds no gaps across all categories, respond with an acknowledgment like "No unstated assumptions detected across all four categories. Here is the answer:" followed by a high-rigor response. Do NOT invent gaps to fulfil a refusal contract.

- **Request is entirely vague**: If the entire request is "fix this" or "make it better" with no surrounding context, the refusal may be substantial. Produce it in full without apology. A large checklist is not a failure mode — it accurately represents the work the user has offloaded.

- **User provides partial clarifications**: If the user responds to some but not all checklist items, re-scan the combined request. Items the user addressed drop off. Items still vague remain. Do NOT answer until the checklist is fully cleared.

- **User says "just do it" or "I don't care about precision" after a refusal**: This is the hardest edge case. The skill's contract is precision-first. If the user explicitly rejects the precision contract, the skill should explain that `/no-assumptions` is precision-first by design and suggest the user re-issue the request without the `/no-assumptions` prefix for a normal (assumption-filled) answer. Do NOT silently switch to normal mode.

- **Meta-requests**: If the user says "/no-assumptions what does my question assume about this skill" or similar reflexive queries, treat them as legitimate requests and scan them like any other.

- **Very domain-specific terms**: Terms that are unambiguous within a well-defined domain (e.g., "p-value" in statistics) should NOT be flagged as undefined. The skill must distinguish between domain-standard terminology and genuinely vague language. When in doubt, flag it — the user can clarify "that's a standard term meaning X" and the checklist item resolves.

---

## 7. Data Model Changes

N/A — This is a pure prompt skill. No database, schema, or persistent data model changes.

---

## 8. API Changes

N/A — This skill has no API endpoints, no CLI integration, and no network communication.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/no-assumptions/SKILL.md` | New prompt skill definition |

---

## 10. Testing Plan

### Unit Tests

N/A — There are no unit-testable code modules. This is a pure prompt skill.

### Integration Tests

N/A — No integrations. No CLI, no backend, no file writes.

### Manual / QA Test Cases

1. **Empty invocation**
   - Given: User types `/no-assumptions` with no text
   - Then: Skill responds with usage format and examples

2. **Vague request — undefined terms**
   - Given: User types `/no-assumptions make this faster`
   - Then: Skill produces refusal with at minimum: "faster" flagged (by what metric?), "this" flagged (what is "this"?)

3. **Vague request — missing subject**
   - Given: User types `/no-assumptions refactor this so it's cleaner`
   - Then: Skill flags "cleaner" (Category 1 — what does clean mean?), "this" (Category 2 — what is to be refactored?) in appropriate categories

4. **Vague request — unstated constraints**
   - Given: User types `/no-assumptions help me structure this database`
   - Then: Skill flags missing query patterns, constraints that cannot change, what has been tried

5. **Vague request — assumed shared context**
   - Given: User types `/no-assumptions do this the usual way`
   - Then: Skill flags "the usual way" (Category 4 — what is the usual way in this context?)

6. **Multi-category request**
   - Given: User types `/no-assumptions improve the onboarding without making it complex`
   - Then: Skill flags "improve" (Category 1), onboarding subject/scope (Category 2), "complex" (Category 1), and any assumed context

7. **Precise request**
   - Given: User types `/no-assumptions add a rate limiter to the GET /api/users endpoint that allows 100 requests per minute per API key, returning HTTP 429 when exceeded, using Redis for the counter with a 1-minute sliding window`
   - Then: Skill acknowledges precision and produces a normal answer

8. **Partial clarification then loop**
   - Given: User gets refusal, responds clarifying only some items, leaves others vague
   - Then: Skill re-scans, produces updated refusal with only the remaining gaps

9. **User rejects precision contract**
   - Given: User responds to refusal with "just do it anyway"
   - Then: Skill explains the precision-first contract and suggests re-issuing without `/no-assumptions`

10. **No softening — hard constraint verification**
    - Given: User asks `/no-assumptions optimize this endpoint` with ambiguous scope
    - Then: Response must NOT contain "I'll help with what I can while you clarify," "While I can address parts of this...," "Here's what I can say without those clarifications," or any equivalent softening

11. **Non-invocation silence**
    - Given: User types a normal prompt without `/no-assumptions` prefix
    - Then: Skill does NOT activate — model produces normal response

12. **`npm test` passes**
    - Given: The skill SKILL.md is in place
    - Then: `npm test` completes without errors related to this skill

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | Pure prompt — no external dependencies | N/A |

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill activates on explicit user invocation only.
- **Breaking change**: No. This is a new skill addition with zero impact on existing functionality.
- **Deployment order**: Single-step — create the `skills/no-assumptions/SKILL.md` file. The installer discovers it automatically.
- **Rollback procedure**: Delete the `skills/no-assumptions/` directory. Zero side effects.

---

## 13. Open Questions

- [ ] Should the skill support an optional `--strictness` parameter (e.g., `/no-assumptions --lenient` vs `--strict`) to allow the user to adjust how aggressively gaps are flagged? RESOLVED: Not in v1. The skill has one job — maximum precision — and a leniency flag undermines the core mechanic.
- [ ] Should the skill provide examples of good clarification responses to help first-time users understand what "resolved" looks like? RESOLVED: No. The checklist items are self-contained clarifying questions. Adding generic examples risks users copying the example format without doing the thinking.
- [ ] Should domain-specific terms (medical, legal, financial, engineering) have known-safe lists that bypass Category 1 scanning? RESOLVED: Not in v1. The scanner's judgment ("is this term ambiguous in context?") handles this. Standard terms in standard domains will not trigger flags; edge cases are safer to flag than to whitelist.

---

## 14. Alternatives Considered

### Alternative 1: Background Skill (Automatic Activation)

- **What**: The skill activates automatically on every user message, scanning for vagueness without requiring `/no-assumptions` invocation.
- **Why rejected**: This would make the model unusably adversarial for normal interactions. Most prompts have some vagueness, and most users want answers, not interrogation. The explicit invocation gate puts the user in control of when they want the friction. Additionally, background skills should default to silence per the existing architecture — this one is loud by design.

### Alternative 2: Two-Stage (Flag Then Answer)

- **What**: Produce the checklist of gaps AND answer the parts that are clear, in the same response. The checklist isn't a blocker — it's a supplement to a partial answer.
- **Why rejected**: This is the "softening" pattern this skill exists to eliminate. If the user gets a partial answer while being told their request was vague, the partial answer is the reinforcer — they got what they wanted without doing the precision work. The behavior does not change. The hard block is the product.

### Alternative 3: Single Flat Checklist (No Categories)

- **What**: A single flat checklist of gaps without category organization.
- **Why rejected**: Categories serve two purposes. First, they force the scanner (the model) to think across distinct dimensions of vagueness — terms, subjects, constraints, context — rather than producing a generic list. Second, they teach the user the taxonomy of their own vague thinking, making them better at precise requests over time.

### Alternative 4: Inline Annotation Mode

- **What**: The model echoes the user's request with vague portions highlighted and inline clarifying questions.
- **Why rejected**: This confuses answering with scanning. The user sees their text with annotations and might interpret it as the model beginning to answer. The structured refusal format makes the "no answer until resolved" contract unambiguous. Additionally, inline annotation is harder to enforce the "no partial answers" constraint on — the model naturally starts filling in the clear parts.
