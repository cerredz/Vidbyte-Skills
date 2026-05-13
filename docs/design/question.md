# Design Doc: Question Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-12
**Last Updated:** 2026-05-12

---

## 1. Overview

The `question` skill is a user-invoked slash command that transforms a sparse model response into a detailed, structured answer. When the user types `/question <their question>`, the skill intercepts and formats the answer into five sections: What (definition/explanation), Why (reasoning and context), Critical Thinking (deeper analysis and tradeoffs), Best Practices (industry standards where applicable), and More Resources (further reading). It is designed to counter the default terseness of models inside Claude Code, Cursor, Codex, and similar harnesses — giving the user depth on demand without changing normal behavior.

---

## 2. Goals & Non-Goals

### Goals
- Provide a user-invoked `/question` slash command that triggers detailed, structured answers
- Structure every answer into five sections: What, Why, Critical Thinking, Best Practices, More Resources
- Feel like a natural expansion of the model's native capabilities, not a foreign overlay
- Include concrete usage examples inside the SKILL.md so the LLM can model the behavior
- Follow the same SKILL.md conventions as existing skills (frontmatter, procedural instructions, constraints)

### Non-Goals
- Running automatically in the background — this is user-invoked only, unlike `why` or `anti-passive`
- Writing any files to disk — all output is inline in the response
- Modifying the installer (`bin/`, `lib/`) — this is a standard, auto-discovered skill
- Modifying validation scripts — the skill passes existing validation unchanged
- Replacing normal responses globally — only responses to `/question` invocations are affected
- Adding runtime dependencies or API calls — pure prompt engineering

---

## 3. Background & Context

Models inside coding harnesses (Claude Code, Cursor, Codex, Gemini CLI, OpenCode) default to sparse, direct answers. This is efficient for code generation and quick fixes, but leaves users underserved when they want deeper understanding. A user who asks "what's a race condition?" gets a two-sentence definition and an example — they don't get the critical thinking, best practices, and further reading that would turn the answer into actual learning.

Existing skills in this repo address different problems: `why` probes metacognitive depth proactively, `anti-passive` interrupts pure-consumption loops, and the trace skills produce file-based reasoning artifacts. None of them provide a simple, on-demand "go deeper" toggle for any question.

The `question` skill fills this gap. It is a user-facing slash command — the user decides when they want depth. When invoked, the model structures its answer into five clearly labeled sections, ensuring the user gets substance without having to ask follow-up prompts to extract it.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate when the user invokes `/question` followed by their question text.
2. The skill SHALL format the answer into five labeled sections, always in this order:
   - **What** — Clear definition, explanation, or description of the topic
   - **Why** — The reasoning, context, importance, or motivation behind it
   - **Critical Thinking** — Deeper analysis: tradeoffs, edge cases, common misconceptions, when it applies vs. when it doesn't, competing perspectives
   - **Best Practices** — Industry standards, patterns, guidelines (where applicable; omit this section if genuinely not applicable for the question)
   - **More Resources** — Books, articles, documentation, papers, or further reading (1-5 concrete references)
3. The skill SHALL NOT trigger on any user prompt that does not begin with `/question` — it is strictly opt-in.
4. The skill SHALL preserve the user's exact question text and answer it directly within the structure.
5. If the user invokes `/question` with no question text following it, the skill SHALL respond by explaining its usage format and providing a brief example.
6. The skill SHALL include 3-5 example invocations inside the SKILL.md body so the LLM can model the expected output format.
7. The skill SHALL produce all output inline in the response — no files are created, read, or written to disk.

### Non-Functional Requirements

- **Performance**: Negligible overhead. The skill adds structure to the response but introduces no I/O, network calls, or extra computation.
- **Scalability**: Stateless per invocation. No session state is maintained.
- **Security**: No file writes, no network calls, no credential exposure.
- **Observability**: The structured response format is self-evident — no logging or metrics needed.
- **Reliability**: If the question is ambiguous, the skill SHALL answer what is most reasonably intended and note the ambiguity in the Critical Thinking section.

---

## 5. High-Level Design

The skill is a single `SKILL.md` file that functions as a procedural instruction set for the LLM agent. Unlike `why` and `anti-passive` (which are always-active background monitors), `question` is purely user-invoked — it only activates when the user explicitly types `/question`.

**Data flow:**

```
User: "/question what's a race condition?"
        |
        v
[Agent with question skill loaded]
        |
        +-- Does prompt start with "/question"?
        |     |
        |     No --> Normal response, skill silent
        |     |
        |    Yes
        |     |
        |     +-- Extract question text after "/question"
        |     |
        |     +-- Answer using the five-section format:
        |     |     What -> Why -> Critical Thinking -> Best Practices -> More Resources
        |     |
        |     +-- If no question text: show usage/example instead
        |
        +-- Response delivered
```

**Key design decisions:**

1. **User-invoked, not automatic**: Unlike `why` and `anti-passive`, this skill does not monitor or interrupt. The user controls when depth is applied. This keeps the skill simple, predictable, and non-intrusive.

2. **Five fixed sections**: The sections are always the same so the user knows exactly what format to expect. The "Best Practices" section is conditionally omitted if not applicable (e.g., for purely theoretical questions), but the other four sections are always present.

3. **Inline output, no files**: Trace skills write to `memory/` on disk; this skill does not. The user asked a question and wants a detailed answer right now — not a persistent artifact. Inline formatting keeps it immediate.

4. **Frontmatter signals hybrid activation**: The description says "Use when the user invokes /question" so the harness's skill selection layer knows this is slash-command-triggered, not automatic. The body instructions reinforce this with an explicit trigger check.

5. **Examples embedded in SKILL.md**: Rather than separate documentation, the SKILL.md includes 3-5 worked examples. This is the most reliable way to ensure the LLM follows the format — it sees what good output looks like.

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition)

**File(s):** `skills/question/SKILL.md`
**Type:** New file

#### What it does
The complete skill definition. Contains YAML frontmatter for discovery/installation, plus the full procedural instructions the LLM agent follows when `/question` is invoked. Includes the five-section answer format and 3-5 example invocations.

#### Interface / API

Frontmatter:
```yaml
---
name: question
description: >
  Use when the user invokes /question. Produces a detailed, structured answer with five sections —
  What, Why, Critical Thinking, Best Practices, and More Resources.
  Counters the default sparse responses from models in coding harnesses (Claude Code, Cursor, Codex, etc.)
  by going into greater depth on any topic the user asks about.
---
```

Body sections:
1. **Identity** — User-invoked skill that expands sparse model answers into detailed, structured responses.
2. **Goal** — Transform any question into a five-section deep-dive: What, Why, Critical Thinking, Best Practices, More Resources.
3. **Activation Rule** — Explicit trigger: only when user prompt starts with `/question`.
4. **Answer Format** — The five sections with descriptions of what each contains.
5. **Example Invocations** — 3-5 concrete examples showing `/question` usage with full example answers.
6. **Constraints** — Guardrails (only on `/question`, always use all sections, no files, no judgment of the question).

#### Logic / Algorithm

**Step 1 — Detect invocation:**
1. Check if the user's prompt starts with `/question` (case-insensitive, with or without a space after).
2. If no: produce a normal response. The skill is silent.
3. If yes: proceed to Step 2.

**Step 2 — Extract the question:**
1. Strip the `/question` prefix from the user's prompt.
2. Trim whitespace.
3. If the resulting text is empty (user typed just `/question` with no question), respond with:
   - A brief explanation of the `/question` command
   - The expected format
   - A short example invocation
   Then stop. Do not proceed to Step 3.
4. If text is present, treat it as the question to answer. Proceed to Step 3.

**Step 3 — Structure the answer:**
Produce the response in this exact order:

```
## What
[Clear definition, explanation, or description. Make this self-contained — 
assume the reader has no prior knowledge. Use concrete examples where helpful.]

## Why
[The reasoning, context, or motivation. Why does this matter? What problem does 
it solve? What happens if you ignore it? Connect to real-world implications.]

## Critical Thinking
[Deeper analysis. Consider:
- Tradeoffs and when this approach is appropriate vs. not
- Common misconceptions or pitfalls
- Competing perspectives or alternative approaches
- Edge cases where the conventional wisdom breaks down
- Historical context if relevant
Surface uncertainty — acknowledge what is settled vs. debated.]

## Best Practices
[Industry standards, patterns, or guidelines. Include code examples if relevant.
Omit this section only if the question is purely theoretical/conceptual and has 
no actionable best practices.]

## More Resources
[1-5 concrete references with brief descriptions:
- Authoritative documentation links
- Seminal books or papers
- Respected blog posts or talks
- RFCs or specifications where applicable]
```

**Step 4 — Deliver response:**
Deliver the structured answer as the complete response. Do not prepend or append any other content (no preamble like "Here's a detailed answer...", no postamble).

#### Edge Cases & Error Handling

- **Empty question**: User types `/question` with nothing after. Respond with usage explanation and an example.
- **Very broad question** ("/question explain programming"): Scope the answer to a reasonable overview and note in Critical Thinking that the topic is vast and more specific sub-questions would yield better results.
- **Question with no applicable best practices**: Omit Best Practices section. Example: "/question what is the meaning of life?" — this has no industry-standard best practices.
- **Question that is purely subjective**: Still apply the format. Critical Thinking should acknowledge subjectivity and present multiple perspectives.
- **User provides their own format constraints**: "/question what is X? keep it short" — honor the user's explicit constraint while still using the section structure.
- **Question requesting code**: Include code examples in the What or Best Practices sections, but still provide the full five-section format around them.
- **Ambiguous question**: Answer the most reasonable interpretation. Note the ambiguity and alternative interpretations in Critical Thinking.

### 6.2 No Additional Files

**Type:** N/A — No runtime files, no tracking files, no dependencies.

The `question` skill is entirely self-contained in `SKILL.md`. It writes nothing to disk, maintains no state, and requires no external resources.

---

## 7. Data Model Changes

N/A — The skill maintains no persistent data. All output is inline in the response.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. This is a prompt-based skill with no server component.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/question/SKILL.md` | Core skill definition — the entire implementation |
| CREATE | `docs/design/question.md` | This design document |

**Total: 2 files created, 0 modified, 0 deleted.**

No runtime files are created by the skill. No existing files are touched.

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. The skill is a Markdown prompt.

### Integration Tests
N/A — The skill operates within the LLM's session context.

### Validation Tests
- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/question/SKILL.md` exists
  - Frontmatter has valid `name: question` matching the directory
  - Frontmatter has non-empty `description`
  - Body is non-empty
  - Skill name matches `^[a-z0-9]+(-[a-z0-9]+)*$` regex (`question` is a single word, no hyphens needed)

### Manual / QA Test Cases

1. **Basic invocation**: Given the user types `/question what is a race condition?`, then the response contains five sections (What, Why, Critical Thinking, Best Practices, More Resources) in order.

2. **Empty invocation**: Given the user types `/question` with no question text, then the response explains usage format and shows an example.

3. **No false activation**: Given the user types "what is a race condition?" (without `/question` prefix), then the skill produces a normal, non-structured response.

4. **Best Practices omitted when not applicable**: Given the user types `/question what is the trolley problem?`, then the response omits the Best Practices section (no industry best practices for an ethical thought experiment).

5. **Code-heavy question**: Given the user types `/question how do I handle errors in async/await?`, then the What and Best Practices sections include code examples while maintaining the full five-section structure.

6. **Broad question scoped appropriately**: Given the user types `/question explain databases`, then the answer provides a reasonable overview, and the Critical Thinking section notes that the topic is broad and suggests more specific sub-questions.

7. **No disk artifacts**: Given the skill runs in any session, then no files are created in the `skills/question/` directory beyond `SKILL.md` itself.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | The skill has zero external dependencies | None |

The skill operates entirely through the LLM agent's native capabilities: parsing the trigger prefix and generating structured text. No npm packages, APIs, databases, or services are involved.

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the agent selects it based on its description. Since the description says "Use when the user invokes /question", the agent loads it when the `/question` command is typed.
- **Breaking change**: No. This is a new, additive skill. No existing code is modified.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Rollback procedure**: Delete `skills/question/` directory and re-run the installer. No data migration needed (the skill has no persistent state).

---

## 13. Open Questions

- [ ] **Should the section order be configurable?** Currently fixed (What, Why, Critical Thinking, Best Practices, More Resources). **Recommendation**: Keep it fixed. Predictability is a feature — the user always knows the format.
- [ ] **Should there be a `/question-short` variant?** A user might want the structure but with less depth. **Recommendation**: Not in v1. The user can phrase their question with "keep it brief" to constrain the response.
- [ ] **Should Best Practices always be present, or genuinely optional?** **Recommendation**: Genuinely optional — a section that says "N/A" adds no value and looks formulaic.
- [ ] **Should the skill write to a file (like trace skills do to memory/)?** **Recommendation**: No. This is an inline-answer skill. File output is for reasoning traces; this is for immediate consumption.

---

## 14. Alternatives Considered

### Alternative 1: Automatic depth (always-detailed mode)
- What: Make the skill always-on like `why`, producing detailed answers to every prompt.
- Why rejected: Would make every response verbose, slowing down code-generation workflows. Opt-in depth respects the user's context — they ask for depth when they want it.

### Alternative 2: Section toggles (e.g., `/question --no-best-practices`)
- What: Allow users to toggle which sections appear via flags.
- Why rejected: Adds complexity for marginal benefit. The skill is simple by design — the user gets all sections and can skip what they don't need by reading selectively.

### Alternative 3: Dynamic section selection (model decides which sections are relevant)
- What: Let the LLM decide which sections to include based on the question type.
- Why rejected: Inconsistency undermines the skill's value. The user invokes `/question` because they want the full format. If the model sometimes omits sections unpredictably, the user loses trust in the command.

### Alternative 4: Merge into a broader "teaching" skill
- What: Combine `/question` with other teaching-oriented behaviors into a single "tutor" skill.
- Why rejected: Each skill in this repo addresses a single, sharp failure mode. `/question` solves "responses are too sparse." Merging it with other concerns would dilute its focus and make it harder to invoke precisely.

### Alternative 5: File-based output (write answer to memory/)
- What: Write the structured answer to a timestamped file in `memory/` instead of inline.
- Why rejected: The user asked a question — they want the answer now, in the chat. File output adds friction. The trace skills already cover the file-output use case.

---

END OF DESIGN DOC
