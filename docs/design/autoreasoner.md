# Design Doc: Autoreasoner Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

---

## 1. Overview

The `autoreasoner` skill is a meta-router prompt skill that analyzes a user's problem or question and recommends the single best reasoning strategy (skill) from the Vidbyte reasoning trace collection to apply. When invoked via `/autoreasoner`, it produces a structured inline response that explains what each candidate reasoning strategy does, diagnoses why the recommended strategy is the best fit for the specific problem, and lists ranked alternatives with tradeoffs. It does NOT execute the reasoning trace itself — it routes the user to the right tool.

---

## 2. Goals & Non-Goals

### Goals
- Accept a user problem/question and return a single recommended reasoning strategy from the full Vidbyte trace collection
- Provide a concise description of what every reasoning strategy family does
- Explain WHY the recommended strategy fits this specific problem (not generic praise)
- List 2-3 runner-up strategies with specific tradeoffs (what they do better, what they do worse)
- Output as inline response only — no files written, no CLI calls, no state maintained
- Include the exact invocation command (`/strategy-name`) the user can use next

### Non-Goals
- Executing the reasoning trace (this skill is the front door, not the room)
- Covering non-trace prompt skills like `/explain`, `/counterargument`, `/mental-model` (those are response formatters, not reasoning trace strategies)
- Generating a reasoning trace artifact in `memory/`
- Persisting state or learning from session context
- Recommending scale variants (small/medium/large) — the user chooses that when invoking the trace
- CLI integration or backend submission of any kind

---

## 3. Background & Context

The Vidbyte skills repo contains **100+ reasoning trace strategies** organized into families (abductive, deductive, causal, probabilistic, systems-thinking, creative, decision-analysis, etc.), each with small/medium/large scale variants. For a user facing a complex problem, navigating this collection manually is overwhelming — they don't know which strategy to use. A meta-router that understands all strategies and can match them to problem types solves the discoverability problem.

The skill is structurally modeled on the existing prompt skills like `explain`, `counterargument`, and `mental-model` — it's a simple `SKILL.md` with frontmatter, identity, steps, constraints, and success criteria. No new infrastructure is needed.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate when the user invokes `/autoreasoner` (case-insensitive).
2. When invoked without text, the skill SHALL respond with a usage explanation including an example.
3. When invoked with a problem description, the skill SHALL analyze the problem and recommend exactly one best-fit reasoning strategy.
4. The recommendation SHALL include a specific justification linking the problem's characteristics to the strategy's core move.
5. The output SHALL list 2-3 runner-up strategies with tradeoffs relative to the recommended one.
6. The output SHALL include the exact `/strategy-name` invocation for the recommended strategy.
7. The skill SHALL maintain an internal catalog of all reasoning strategy families with their core moves and best-fit problem types.
8. The skill SHALL NOT write files, call the CLI, or maintain session state.
9. The skill SHALL produce inline response only — no preamble, no postamble beyond the structured recommendation sections.

### Non-Functional Requirements
- **Performance**: Inline response, no computation beyond model inference. No latency concerns.
- **Scalability**: N/A — stateless single-response skill.
- **Security**: No secrets, no CLI calls, no network, no files. Zero-risk.
- **Observability**: N/A — stateless prompt skill.
- **Reliability**: The skill is a prompt. Reliability depends on the model's ability to match problem types to strategies. The internal catalog acts as a retrieval-augmentation anchor.

---

## 5. High-Level Design

The `autoreasoner` skill is a single `SKILL.md` file under `skills/autoreasoner/`. It follows the **prompt skill** pattern established by `counterargument`, `explain`, and `mental-model`.

The skill embeds a comprehensive catalog of all reasoning trace strategy families (approximately 100 unique strategies, removing -small/-medium/-large duplicates) organized by domain. When the user invokes `/autoreasoner <problem>`, the model:
1. Reads the embedded catalog to understand what each strategy does
2. Matches the user's problem characteristics against strategy best-fit profiles
3. Produces the structured recommendation output

```
[User invokes /autoreasoner <problem>]
    |
    v
[Model reads embedded strategy catalog from SKILL.md]
    |
    v
[Model matches problem type -> best strategy via catalog profiles]
    |
    v
[Model outputs: Recommended Strategy + Justification + Runners-up + Tradeoffs]
```

This is purely a prompt-engineering approach — no new code, no infrastructure changes. The strategy catalog is maintained as structured text within the SKILL.md body.

---

## 6. Detailed Design

### 6.1 `autoreasoner` SKILL.md

**File(s):** `skills/autoreasoner/SKILL.md`
**Type:** New file

#### What it does
Acts as a reasoning strategy directory. When the user invokes `/autoreasoner <problem>`, it analyzes the problem, consults an embedded catalog of all Vidbyte reasoning trace strategies, and recommends the single best-fit strategy with justification, runners-up, and tradeoffs.

#### Interface / API
```
Invocation: /autoreasoner <problem description>
```

No programmatic API — this is a slash-command triggered prompt skill.

#### Logic / Algorithm

1. **Detect Invocation**: Check if user prompt starts with `/autoreasoner` (case-insensitive).
   - No match: produce normal response (skill is silent).
   - Match with no text: respond with usage explanation.
   - Match with text: proceed to Step 2.

2. **Analyze Problem**: Extract the problem's key characteristics:
   - Is it causal (why did X happen?) → causal/diagnostic strategies
   - Is it decision-making (which option?) → decision-analysis strategies
   - Is it creative/design (how might we?) → creative/lateral strategies
   - Is it about understanding a system? → systems-thinking strategies
   - Is it about evaluating evidence? → analytic/epistemic strategies
   - Is it about predicting/forecasting? → probabilistic/futures strategies
   - Is it about arguments/debate? → dialectical/adversarial strategies
   - Is it abstract/conceptual? → logical/formal strategies
   - Is it practical/execution? → constraint/optimization strategies

3. **Consult Catalog**: Match problem characteristics against the embedded strategy catalog. Each strategy entry includes its core move and best-fit problem types.

4. **Select Recommendation**: Pick the single best-fit strategy. Apply the heuristic that the recommendation should match the problem's dominant characteristic (not a secondary one).

5. **Select Runners-up**: Pick 2-3 strategies that address the problem from different angles than the recommendation. These should be genuinely distinct approaches, not variations of the same strategy.

6. **Produce Output** (in exact order, no preamble/postamble):
   ```
   ## Recommended: <Strategy Name> (`/<strategy-slug>`)
   [2-3 sentences: what the strategy does, its core move, and why it is 
   specifically the best fit for THIS problem. Reference the problem's actual 
   characteristics — causation, uncertainty, creativity, whatever. No generic praise.]

   ## What It Does
   [2-3 sentences: a plain-English description of how this strategy works. 
   The core move. What the output looks like (a trace in memory/ with numbered steps).]

   ## Why Not These?
   
   ### Runner-up: <Strategy Name> (`/<strategy-slug>`)
   - **What it does better:** [one specific thing — e.g., "Handles more explanatory alternatives" or "More adversarial testing"]
   - **What it does worse:** [one specific thing — e.g., "Less focused on root cause" or "Overkill for single-decision problems"]
   - **When to use instead:** [one sentence — the exact scenario where this runner-up beats the recommendation]

   [Repeat for 2-3 runner-ups]

   ## To Use This
   Run: `/<strategy-slug>` followed by your question.

   For shorter output: `/<strategy-slug>-small`
   For deeper analysis: `/<strategy-slug>-large`
   ```

#### Edge Cases & Error Handling
- **No text after `/autoreasoner`**: Respond with usage explanation including an example.
- **Problem too vague**: Produce a "here's what I need to know" follow-up asking the user to clarify the type of reasoning they need (causal, decision, creative, etc.), with quick examples. Do not guess — missing the problem type produces a wrong recommendation.
- **Problem matches multiple strategies equally well**: Recommend the more general-purpose strategy as primary and the more specialized one as runner-up. Explain the tradeoff.
- **Problem is trivial (doesn't need a reasoning strategy)**: Recommend the most lightweight strategy (`five-whys-trace` or similar) and explain that the problem may not require the overhead. Still provide the recommendation — let the user decide.
- **Unrecognized problem domain**: Fall back to abductive reasoning (inference to best explanation) as the most general-purpose strategy, and flag that the recommendation is a fallback.

---

## 7. Data Model Changes

N/A — This is a prompt skill. No database, schema, or data model changes. The strategy catalog is inline text within the SKILL.md body.

---

## 8. API Changes

N/A — This skill has no API endpoints. It is a slash-command activated prompt that produces inline text output.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/autoreasoner/SKILL.md` | New prompt skill: reasoning strategy router |

---

## 10. Testing Plan

### Unit Tests
N/A — Prompt skills have no code to unit test. Validation is handled by `npm test` (metadata validation).

### Metadata Validation
Run `npm test` to verify:
- Frontmatter contains valid `name` and `description`
- `name` matches folder name and is lowercase hyphen-case
- Body is non-empty

### Manual / QA Test Cases
1. **Usage message**: Given `/autoreasoner` with no text, response should be the usage explanation with example.
2. **Causal problem**: Given `/autoreasoner Why did our database start timing out after the last deploy?`, response should recommend a causal/diagnostic strategy (e.g., `root-cause-trace` or `five-whys-trace`) with justification referencing the causal nature of the question.
3. **Decision problem**: Given `/autoreasoner Should we migrate from monolith to microservices?`, response should recommend a decision-analysis strategy (e.g., `decision-tree-trace` or `cost-benefit-trace`) with justification.
4. **Creative problem**: Given `/autoreasoner How can we reduce our cloud costs without degrading performance?`, response should recommend a creative/constraint strategy (e.g., `constraint-removal-trace` or `lateral-thinking-trace`).
5. **Vague problem**: Given `/autoreasoner I'm stuck`, response should ask clarifying questions about what type of reasoning is needed rather than guessing.
6. **All output sections present**: Every response should contain Recommended, What It Does, Why Not These (with 2-3 runners-up), and To Use This sections in that order.
7. **No preamble/postamble**: Response body should start with `## Recommended:` and end with the scale variant note. No "Here's my analysis..." or "Hope this helps!"

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | N/A | N/A |

This skill is a pure prompt — it has zero dependencies beyond the model's inference capability.

---

## 12. Rollout & Deployment

- **Feature flags**: None needed. The skill is activated only when the user explicitly invokes `/autoreasoner`.
- **Breaking change**: No. This is a new skill, not a modification of existing behavior.
- **Deployment order**: Single-step — add `skills/autoreasoner/SKILL.md` to the repo. The installer auto-discovers it.
- **Rollback procedure**: Delete `skills/autoreasoner/SKILL.md`. No other changes needed.

---

## 13. Open Questions

- [ ] Should the strategy catalog also cover the non-trace prompt skills (`/explain`, `/counterargument`, `/mental-model`, etc.), or should it be restricted to reasoning trace skills only? **Decision: Trace skills only for v1. Prompt skills serve different purposes (response formatting vs. reasoning artifact generation) and mixing them would dilute the recommendation quality.**
- [ ] Should the skill include the scale variants in its catalog, or only the base strategies? **Decision: Base strategies only. The scale variants are the same strategy at different depths — the user chooses depth separately.**

---

## 14. Alternatives Considered

### Alternative 1: Python CLI-backed skill with backend routing
- What: Build a CLI-backed skill that sends the problem to a backend, computes a match score, and returns the recommendation.
- Why rejected: Massive overengineering for a simple recommendation task. The embedded catalog approach gives the model enough information to match problem types to strategies. A backend adds latency, cost, and a new failure surface for no gain in recommendation quality.

### Alternative 2: Three-tier router with progressive disclosure
- What: First ask the user which domain (causal, decision, creative, etc.), then which sub-domain, then recommend from a narrowed list.
- Why rejected: Too many round trips. The skill should be one-shot with a fallback clarifying question only when the problem is genuinely too vague to classify.

### Alternative 3: Include full strategy descriptions inline in every response
- What: List every strategy and its description in the response, letting the user pick.
- Why rejected: Defeats the purpose. The user doesn't want a catalog — they want a recommendation. The catalog exists in the SKILL.md body for the model to consult; the output is the recommendation only.
