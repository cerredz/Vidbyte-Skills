# Design Doc: no-abstraction

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-13
**Last Updated:** 2026-05-13

---

## 1. Overview

The `no-abstraction` skill is a user-invoked slash command that acts as an intent concretizer. Before engaging with any task, the model scans for six specific ways a request can leave intent open to interpretation: qualitative comparisons without baselines, vague quantities, undefined time horizons, unspecified subjects, process nouns without named operations, and experiential terms without observable behavior. It also checks named operations for missing execution method, so a request like "rename variables" or "split this function" is still returned if it does not state exact targets, replacement names or rules, sub-steps, ordering, constraints, and verification. In Round 1 and Round 2, each abstract term is returned with a category-tagged rejection and the specific question that would make the request executable. In Round 3, the model explains what is still too abstract, explains why the missing decision matters, declares the assumptions it will use, and then executes the request under those assumptions. The model also applies the same standard to its own outputs by naming missing variables instead of hiding them behind vague language. The skill includes one legitimate exception for requests to help operationalize an abstract goal.

---

## 2. Goals & Non-Goals

### Goals

- Create `skills/no-abstraction/SKILL.md` with YAML frontmatter and full procedural instructions
- Implement the six abstract-language failure mode detectors with rejection formats
- Implement the model's own output constraint â€” the model cannot produce abstract language in its responses
- Implement the low-level operation rule: named actions still require exact targets, method, ordering, constraints, and verification
- Implement the operationalization rule for inherently abstract concepts (observable proxies)
- Implement the three-round escalation pattern for repeated abstraction
- Implement the one legitimate exception for requests to help operationalize an abstract goal
- Include cross-domain examples (software, medicine, law, finance, writing, product) as pattern-recognition anchors
- Update `skills/vidbyte-tutor/SKILL.md` to add `no-abstraction` to the catalog
- Pass existing validation (`npm test`)

### Non-Goals

- No changes to the installer (`bin/`, `lib/`)
- No CLI commands, backend endpoints, or network calls
- No file I/O â€” the skill is a stateless inline-response formatter
- No automatic/background activation â€” user-invoked via slash command only
- No modifications to existing skills other than `vidbyte-tutor`
- No changes to `package.json` or README

---

## 3. Background & Context

This repository contains a growing collection of user-invoked prompt skills (`question`, `explain`, `counterargument`, `mental-model`, `research`, `explain-away-others`, `define-success`, `no-conclusions`) and always-on or CLI-backed background skills (`why`, `anti-passive`, `do-not-repeat`, `compression-check`, `feedback-generator`, `misconceptions`, `daily-review`). The central orchestrator `vidbyte-tutor` catalogs and routes users to these skills.

The `no-abstraction` skill fills a cognitive gap not yet addressed: users (and models) routinely use abstract language â€” "faster," "better," "clean up," "optimize" â€” that prevents anyone, including the user themselves, from knowing whether a task was completed. This skill forces concreteness at the input boundary before any work begins, and enforces it in the model's own output throughout the exchange.

The existing `define-success` skill addresses a related but distinct problem: it defines what done looks like before work begins. `no-abstraction` addresses a more fundamental problem: if the request itself is abstract, success criteria cannot be defined because the target does not exist in observable terms. `no-abstraction` sits logically before `define-success` â€” you cannot define success for "make it faster" until "faster" becomes concrete.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate when the user prompt starts with `/no-abstraction` (case-insensitive).
2. The skill SHALL scan the user's request for six failure modes before engaging with any task content:
   - Qualitative comparisons without baseline, target, and measurement method
   - Vague quantities that cannot be verified against an observation
   - Undefined time horizons without date, duration, or triggering condition
   - Unspecified subjects without enough specificity to identify the referent
   - Process nouns (categories of action without specific movement)
   - Experiential terms not observable by a third party
3. The skill SHALL reject each abstract term using a category-tagged format that names the term, the category, and the specific question(s) that would resolve it.
4. The skill SHALL return ALL abstract terms in a single response â€” not one at a time.
5. The skill SHALL NOT engage with the concrete parts of a request while abstract parts remain unresolved. The entire request is blocked.
6. The skill SHALL apply the same abstraction standard to its own output. Every sentence the model generates must pass the same six failure-mode tests.
7. When the model cannot be concrete because a genuine answer requires an unknown variable, the model SHALL name the variable explicitly and state the answer for each possible value, rather than retreating into abstraction.
8. For inherently abstract concepts that cannot be made fully concrete without losing meaning, the skill SHALL require the user to state an observable proxy â€” a specific measurable thing that would be present if the abstract concept were true.
9. The skill SHALL NOT accept the proxy as equivalent to the concept â€” it SHALL treat the proxy as the working definition for the session.
10. The skill SHALL reject named low-level operations when the execution method is missing. For example, "rename variables" requires the variables and replacement names or naming rule; "split this function" requires the split boundaries, new function names, moved statements, and verification target.
11. The skill SHALL implement a three-round escalation pattern: first return (categorical rejection), second return (same questions with note of repetition), third return (explain what is still abstract, declare assumptions, then execute).
12. The skill SHALL include a legitimate exception for requests to help operationalize an abstract goal â€” such requests are themselves concrete and SHALL be engaged with immediately.
13. The skill SHALL include cross-domain examples (software, medicine, law, finance, writing, product) as internal pattern-recognition anchors.

### Non-Functional Requirements

- **Performance**: Negligible overhead. Pure prompt instructions with no I/O, network, or computation.
- **Scalability**: Stateless per invocation. No session state.
- **Security**: No file writes, no network calls, no credential exposure.
- **Observability**: The rejection format is self-evident â€” each abstract term is tagged with its failure category.
- **Reliability**: If the user provides insufficient context to evaluate concreteness, the skill asks for the missing dimension rather than guessing.

---

## 5. High-Level Design

Add one new skill file at `skills/no-abstraction/SKILL.md` and modify `skills/vidbyte-tutor/SKILL.md` to register it in the orchestrator catalog.

The skill is a pure prompt instruction set â€” no runtime code, no dependencies, no file I/O. It follows the same architectural pattern as the existing `explain-away-others`, `define-success`, and `no-conclusions` skills.

**Data flow:**

```
User: "/no-abstraction improve the performance of the checkout flow"
         |
         v
[Agent with no-abstraction skill loaded]
         |
         +-- Does prompt start with "/no-abstraction"?
         |     No --> Normal response
         |    Yes
         |     +-- Scan for six failure modes:
         |     |     1. Qualitative comparisons without baseline/target/measurement
         |     |     2. Vague quantities
         |     |     3. Undefined time horizons
         |     |     4. Unspecified subjects
         |     |     5. Process nouns
         |     |     6. Experiential terms
         |     +-- Any abstract terms found?
         |     |     Yes --> Return ALL abstract terms with category-tagged rejections
         |     |     No --> Proceed with task, enforcing output constraint
         |     +-- User resubmits?
         |           Still abstract? --> Escalation round 2 or 3
         |           Concrete? --> Proceed, enforcing output constraint
```

**Key design decisions:**

1. **Six failure modes, not a general "be concrete" instruction**: Specific, named failure modes give the model a checklist to scan against rather than a vague directive it can interpret inconsistently.

2. **All abstract terms returned at once**: This prevents the frustrating ping-pong of fixing one term only to have the next one rejected. The user sees the full scope of what needs to be concretized.

3. **Category-tagged rejection format**: Each rejection names the specific term, the failure category, and the question(s) that would resolve it. This format is machine-consistent and user-actionable.

4. **Model output constraint**: The model's own sentences are held to the same standard. This is stated separately from the user-input constraint because it operates differently â€” it is a self-filter applied mid-generation, not a gate applied before engagement.

5. **Low-level operation rule**: Naming an action is not enough. The skill asks how the action should be performed, including exact targets, replacement values, sub-steps, ordering, constraints, and verification.

6. **Operationalization rule for abstract concepts**: Some domains require concepts like "readability" or "wellbeing." The rule requiring observable proxies keeps the skill usable in these domains without weakening the standard.

7. **Three-round escalation**: The escalating firmness prevents the skill from becoming a nagging background hum while maintaining the gate across repeated submissions.

8. **Legitimate exception for operationalization requests**: The skill must not block users who are genuinely trying to become more concrete. "Help me define a concrete proxy for readability" is itself a concrete request.

---

## 6. Detailed Design

### 6.1 no-abstraction SKILL.md

**File(s):** `skills/no-abstraction/SKILL.md`
**Type:** New file

#### What it does

A user-invoked slash command that identifies and rejects abstract language before engaging with any task. Applies the same abstraction standard to the model's own output throughout the exchange. Includes escalation pattern for repeated abstraction and an exception for operationalization requests.

#### Frontmatter

```yaml
---
name: no-abstraction
description: >
  Use when the user invokes /no-abstraction. Acts as a translation enforcer â€” scans for
  six categories of abstract language (qualitative comparisons, vague quantities, undefined
  time horizons, unspecified subjects, process nouns, experiential terms) and returns each
  with a category-tagged rejection until every term is observable to a third party.
  Applies the same standard to the model's own output.
---
```

#### Body Structure

1. **Section 1 â€” Identity**: Defines the skill as a translation enforcer whose only job is to identify abstract language and return it until every term is concrete enough that a third party could observe whether the stated condition is true or false.

2. **Section 2 â€” Goal**: Prevent the user from offloading the work of being concrete onto the model. Force the user to define what would be observably true when the task is done before the model engages.

3. **Section 3 â€” Activation Rule**: Triggered by `/no-abstraction` prefix. Non-triggering prompts get normal responses.

4. **Section 4 â€” The Six Failure Modes**: Detailed definitions with the rejection format for each:

   - **Mode 1: Qualitative comparisons without baseline**. "Faster," "cleaner," "better," "stronger," "more readable," "more robust." Every comparative adjective requires: the current value, the target value, and the measurement method. Rejection: `"faster" â†’ qualitative comparison. Current value? Target value? Measurement method?`

   - **Mode 2: Vague quantities**. "Some," "many," "significant," "a lot," "several," "various," "numerous." Replace with a number, a range with stated confidence, or an enumeration. Rejection: `"several" â†’ vague quantity. Number? Range? Enumeration?`

   - **Mode 3: Undefined time horizons**. "Soon," "eventually," "over time," "in the long run," "going forward." Must have a date, duration, or triggering condition. Rejection: `"over time" â†’ undefined time horizon. Date? Duration? Triggering condition?`

   - **Mode 4: Unspecified subjects**. "Users," "the system," "people," "customers," "the team," "things," "it." Must be specific enough to identify without ambiguity. Rejection: `"users" â†’ unspecified subject. Which subset? Identifiable by what characteristic?`

   - **Mode 5: Process nouns**. "Optimization," "improvement," "enhancement," "refactoring," "remediation," "resolution." These describe a direction without describing a movement. Replace with a verb phrase stating what will change and how. Rejection: `"optimization" â†’ process noun with no specified action. What operation? On what? To what target?`

   - **Mode 6: Experiential terms**. "Feels cleaner," "seems better," "looks good," "more intuitive," "easier to use." Not observable by a third party. Replace with the specific behavior, action, or metric present if the experiential claim were true. Rejection: `"more intuitive" â†’ experiential term. What observable behavior would be present if this were true?`

5. **Section 5 â€” Rejection Format**: The exact format for returning abstract terms â€” one rejection per abstract term, all returned in a single response, the entire request blocked.

6. **Section 6 â€” Model Output Constraint**: Separate, explicit instructions that the model cannot produce abstract language in its responses. Every sentence is held to the same six-mode standard. Specific prohibitions with replacements.

7. **Section 7 â€” Required Steering Questions**: Adds the "go lower than the action label" rule. The model asks for exact targets, sub-operations, replacement values, ordering, unchanged constraints, and verification when a named action is underspecified.

8. **Section 8 â€” The "Name the Variable" Rule**: When the model cannot be concrete because it genuinely lacks information, it names the variable and states the answer conditional on each value.

9. **Section 9 â€” The Operationalization Rule**: For inherently abstract concepts, the user states an observable proxy. The proxy becomes the working definition for the session. The model does not accept the proxy as equivalent to the concept.

10. **Section 10 â€” The Escalation Pattern**: Round 1 (categorical rejection with questions), Round 2 (same questions with note of repetition), Round 3 (explain the remaining abstraction, state assumptions, then execute).

11. **Section 11 â€” The Legitimate Exception**: A request for help operationalizing an abstract goal is itself concrete. The model engages immediately with such requests.

12. **Section 12 â€” Cross-Domain Examples**: Software, medicine, law, finance, writing, product â€” each showing abstract request â†’ rejection â†’ concrete resubmission. These are internal pattern-recognition anchors, not templates to copy.

13. **Section 13 â€” Algorithm**: Step-by-step execution:
    - Step 1: Detect invocation
    - Step 2: Scan for six failure modes
    - Step 3: If no abstract terms, proceed with output constraint active
    - Step 4: If abstract terms found, check for legitimate exception
    - Step 5: If exception, engage immediately
    - Step 6: If no exception, return all abstract terms with rejections
    - Step 7: Evaluate resubmission (escalation tracking)
    - Step 8: Apply output constraint throughout the exchange

14. **Section 14 â€” Constraints**: Never engage with abstract requests, never produce abstract output, never accept the proxy as the concept, the escalation is real at every round, the legitimate exception must be checked first.

15. **Section 15 â€” Success Criteria**: Verifiable outcomes.

#### Edge Cases & Error Handling

- **Request contains both concrete and abstract parts**: The entire request is blocked. All abstract terms are returned. No partial engagement.
- **Abstract request that is the legitimate exception**: "I want to improve [X] but I don't know how to measure it â€” help me define a concrete proxy." This is concrete. Engage immediately.
- **User submits abstraction, model needs info to evaluate concreteness**: Model asks the specific question about the missing dimension â€” not "be more concrete" but "what is the current value of X?"
- **Genuinely abstract concept (e.g., "justice," "wellbeing")**: Require observable proxy. Accept proxy as working definition. Treat subsequent references to the abstract concept as references to the proxy.
- **User resubmits with only some terms de-abstracted**: All still-abstract terms are returned. The previously accepted terms are acknowledged as resolved.
- **User names an operation without method**: "Rename unclear variables" is returned until the user names the variables and replacement names or naming rule. "Split long functions" is returned until the user names functions, split boundaries, extracted responsibilities, new function names, and verification target.
- **User reaches Round 3 and still submits abstraction**: The model explains which decision is still missing, states the assumption it will use, and executes under that assumption. The model does not pretend the abstraction was resolved.
- **Model finds itself about to produce "this depends on context"**: Must instead name the specific contextual variable and state how each value changes the answer.

### 6.2 vidbyte-tutor Catalog Update

**File(s):** `skills/vidbyte-tutor/SKILL.md`
**Type:** Modified

#### What it does

Adds `no-abstraction` to the included skills list, the detailed entries, the tie-break rules, and the output-behavior counters.

#### Changes

1. **Frontmatter description**: Add `no-abstraction` to the list of example skills.
2. **Core Rule list**: Add `- \`no-abstraction\`` (alphabetical order).
3. **Included Skills section**: Add detailed entry:

```markdown
### `no-abstraction`

Use when the user needs every term in a request to be concrete and observable â€” before any work begins. Scans for qualitative comparisons without baselines, vague quantities, undefined time horizons, unspecified subjects, process nouns, and experiential terms. Route here for prompts like:

- "Make sure this request is concrete before I start."
- "Don't let me use abstract language."
- "Force me to define what I actually mean."
- "Check this request for hand-waving."

Invoke as `/no-abstraction`. The skill returns every abstract term with a category-tagged rejection and specific questions. Includes a three-round escalation pattern. Applies the same standard to the model's own output.
```

4. **Tie-Break Rules**: Add entry:
   - If the user needs abstraction removal before any task begins, choose `no-abstraction`.

5. **Response Behavior**: Update count from "eight" to "nine" (assuming previous PRs haven't been merged â€” if they have, update accordingly).

6. **Success Criteria and Input sections**: Add `no-abstraction` / "abstraction enforcement" to the enumerated use cases.

---

## 7. Data Model Changes

N/A â€” The skill is prompt-only. No database schema, persistent state, or structured runtime data model is added.

---

## 8. API Changes

N/A â€” No API endpoints are created, modified, or deprecated. No CLI commands are added. No network traffic is involved.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/no-abstraction.md` | Design document for the new skill |
| CREATE | `skills/no-abstraction/SKILL.md` | New skill: abstraction enforcer with six failure-mode detectors |
| MODIFY | `skills/vidbyte-tutor/SKILL.md` | Add no-abstraction to catalog, tie-break rules, and counters |

**Total: 3 files (2 created, 1 modified, 0 deleted).**

---

## 10. Testing Plan

### Unit Tests

N/A â€” The implementation is a Markdown skill prompt, not executable code.

### Validation Tests

Run:

```bash
npm run validate
```

Expected results:
- `skills/no-abstraction/SKILL.md` passes validation (name matches directory, non-empty description, non-empty body)
- `skills/vidbyte-tutor/SKILL.md` still passes validation

### Full Smoke Tests

```bash
npm test
```

Expected: existing validation, installer smoke test, and CLI smoke test all pass.

### Manual / QA Test Cases

1. **Single abstract term rejected**: Given `/no-abstraction make the API faster`, the model returns: `"faster" â†’ qualitative comparison. Current value? Target value? Measurement method?` â€” blocking the entire request.

2. **Multiple abstract terms returned at once**: Given `/no-abstraction improve the performance of the checkout flow for many users`, the model returns rejections for "improve" (process noun), "performance" (unspecified subject â€” what metric?), and "many" (vague quantity) â€” in a single response.

3. **Concrete request proceeds**: Given `/no-abstraction reduce p99 response latency on /api/checkout from 1.2s to under 300ms under 500 concurrent requests, measured with k6`, the model proceeds and applies output constraint.

4. **Model output constraint active**: After a concrete request, the model does not say "this approach is cleaner" â€” it says "this approach removes 3 intermediate variables and reduces cyclomatic complexity from 14 to 6."

5. **Low-level operation still missing method**: Given `/no-abstraction In src/payments/processor.ts, rename unclear variables and split long functions`, the model returns "unclear variables" until variables and replacement names are listed, and returns "split long functions" until functions, split boundaries, new function names, moved statements, and verification targets are listed.

6. **Operationalization exception**: Given `/no-abstraction I want to improve code readability but I don't know how to measure it â€” help me define a concrete proxy`, the model engages immediately and helps define a proxy.

7. **Observable proxy enforced**: After the user states "readability means a developer can describe any function in 90 seconds," the model treats all subsequent references to "readability" as references to that proxy.

8. **Three-round escalation**: Round 1 returns abstraction with questions. Round 2 returns same questions with "The previous submission still contained [term]." Round 3 explains what remains abstract, declares assumptions, and executes under those assumptions.

9. **"Name the variable" instead of retreating**: When the model would normally say "this depends on context," it instead says "The answer depends on whether the database uses row-level or table-level locking. If row-level: [answer]. If table-level: [answer]."

10. **Cross-domain composition**: Works identically for software, medicine, law, finance, writing, and product requests.

11. **No false activation**: Normal prompts without `/no-abstraction` produce normal responses.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Existing skill validation scripts | Repository-local | Validate new skill frontmatter/body conventions | Low |
| Existing installer | Repository-local | Discover and install new skill | Low |

No new npm dependencies, Python dependencies, backend services, or external APIs are introduced.

---

## 12. Rollout & Deployment

- **Feature flags**: None.
- **Deployment order**: Merge all three files in a single PR.
- **Backwards compatibility**: Fully additive. No existing skills are modified (vidbyte-tutor is extended, not broken).
- **Rollback**: Delete `skills/no-abstraction/` directory and revert the vidbyte-tutor changes. No data migration required.
- **Breaking change**: No.

---

## 13. Open Questions

- [ ] Should `no-abstraction` support a `--lenient` flag that accepts "close enough" concretization? Recommendation: no â€” the skill's value is in strictness. Users who want leniency should not invoke the skill.
- [ ] Should the skill apply its output constraint to ALL follow-up responses in a session, or only to responses within the `/no-abstraction` exchange? Recommendation: within the exchange only. The output constraint applies while the skill is active; when the user returns to normal mode, normal responses resume.
- [ ] Should the escalation counter persist across separate `/no-abstraction` invocations within the same session, or reset each time? Recommendation: reset each invocation. Each `/no-abstraction` exchange is an independent gate.
- [ ] Should the skill detect abstraction in the model's own previous responses and flag them? Recommendation: not in v1. The output constraint is applied going forward, not retroactively.

---

## 14. Alternatives Considered

### Alternative 1: Make it an always-on background skill

- What: Like `why` or `anti-passive`, have `no-abstraction` scan every user prompt for abstraction.
- Why rejected: This would make normal sessions unusable. Most natural conversation contains some abstraction. The skill is a hard enforcement tool â€” it should only apply when the user explicitly opts in.

### Alternative 2: One abstract term at a time

- What: Return only the first abstract term found, let the user fix it, then scan again.
- Why rejected: Frustrating ping-pong UX. The user fixes "faster" only to have "some users" flagged next. Returning all at once respects the user's time.

### Alternative 3: Have the model rewrite the abstract request into concrete terms

- What: Instead of rejecting, the model automatically concretizes the user's abstract language.
- Why rejected: This defeats the purpose entirely. The skill exists to force the USER to do the cognitive work of being concrete. The model doing it for them is the pattern this skill was designed to break.

### Alternative 4: Merge with `define-success`

- What: Combine the abstraction enforcement with the success-criteria gate into one meta-skill.
- Why rejected: These are separate gates that operate at different logical points. Abstraction enforcement sits at the input boundary â€” you cannot define success criteria for an abstract request. A combined skill would confuse these two functions.

### Alternative 5: Don't apply output constraint â€” only enforce user input

- What: Only scan user requests for abstraction; let the model respond normally.
- Why rejected: The user requested "the model applies this standard to its own outputs with the same strictness it applies to the user's inputs. It cannot produce abstract language while refusing to receive it." This asymmetry is part of the skill's identity â€” it would be hypocritical without it.

### Alternative 6: Skip escalation â€” return the same response each time

- What: No escalating firmness across rounds.
- Why rejected: The user specifically requested a three-round escalation pattern. The friction must remain real at every round, and the escalation must be visible.

---

END OF DESIGN DOC
