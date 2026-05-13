# Design Doc: Four Slash-Command Skills — explain, counterargument, mental-model, research

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-12
**Last Updated:** 2026-05-12

---

## 1. Overview

Four user-invoked slash-command skills that extend the Vidbyte skill suite with on-demand cognitive tools. Each addresses a distinct failure mode in model-assisted thinking: `/explain` rebuilds concepts from first principles when the user is genuinely stuck; `/counterargument` stress-tests ideas with genuine adversarial rigor; `/mental-model` builds durable, neurologically-grounded mental representations; and `/research` delivers answers with explicit sourcing and epistemic labeling. All four are pure prompt-based skills — they create no files, make no network calls, and require no CLI or backend changes.

---

## 2. Goals & Non-Goals

### Goals
- Provide four new slash-command skills: `/explain`, `/counterargument`, `/mental-model`, `/research`
- Each skill SHALL produce structured output following strict formatting rules
- All four skills SHALL be user-invoked only (no automatic activation)
- Follow existing SKILL.md conventions: YAML frontmatter, procedural instructions, explicit constraints
- Pass existing validation (`npm test`) without modification to validation scripts
- Auto-discover via the existing installer — no registration changes

### Non-Goals
- Writing files to disk — all output is inline in the response
- Modifying the installer (`bin/`, `lib/`) — these are standard auto-discovered skills
- Modifying the CLI (`cli/`) — no backend submission, no Python changes
- Modifying validation scripts — the skills pass existing validation unchanged
- Replacing normal responses — only responses to the specific slash commands are affected
- Adding runtime dependencies or API calls — pure prompt engineering

---

## 3. Background & Context

Current Vidbyte skills address many reasoning patterns: metacognitive coaching (`why`), passive consumption detection (`anti-passive`), structured Q&A (`question`), misconception tracking (`misconceptions`), and 100+ reasoning trace strategies. However, several distinct failure modes are unaddressed:

1. **Explanation failure**: When a standard explanation does not land, the model has no protocol for rebuilding understanding from a lower floor. Users get restated variations of the same explanation rather than a genuinely different construction.

2. **Echo-chamber risk**: When a user has an idea they believe in, the model defaults to balanced, diplomatic responses that validate as much as they challenge. There is no tool for genuine adversarial stress-testing — the kind where the user walks away either with a stronger version of their idea or knowing why it needs revision.

3. **Brittle understanding**: Standard explanations produce information the user can read and nod at, not mental models they can reason with, predict from, and update. The research on learning and consolidation is clear about what produces durable mental models — but none of it is baked into default model behavior.

4. **Sourceless confidence**: Models present information at uniform confidence levels, making no distinction between established consensus and preliminary findings. Users cannot tell which claims are rock-solid and which are speculative without doing their own research.

These four skills fill those gaps. Each is a pure prompt — a single `SKILL.md` file with no dependencies.

---

## 4. Requirements

### Functional Requirements — /explain

1. The skill SHALL activate when the user invokes `/explain` followed by their question/confusion text.
2. Before explaining, the skill SHALL ask exactly one clarifying question: "What specifically is confusing — the what, the why, or how it works in practice?"
3. After the user answers the clarifying question, the skill SHALL produce a layered output structure:
   - **Floor Zero**: One sentence, no jargon, explained as if the user has never encountered the domain before.
   - **The Analogy**: One concrete, visual comparison to something entirely unrelated that shares the same underlying mechanism, followed immediately by "This analogy breaks down at the point where ___."
   - **One Layer Up**: Introduce actual terminology, but only after the concept is anchored by floor zero. Each new term gets a one-sentence plain-language definition before it is used.
   - **The Concrete Example**: A real, specific instance — not a hypothetical — something the user can point to in the world.
   - **The Check**: One question the user should now be able to answer if the explanation worked. "If you got this, you should be able to tell me ___."
4. The skill SHALL NOT use hedging phrases: "in simple terms," "basically," "essentially" are banned. Simplicity must be in the construction, not the framing.
5. If the user invokes `/explain` with no text following it, the skill SHALL respond by explaining its usage format.

### Functional Requirements — /counterargument

1. The skill SHALL activate when the user invokes `/counterargument` followed by their idea/position/argument.
2. The skill SHALL NOT soften, balance, or end with "but there are also merits to this view." The entire output is adversarial.
3. The skill SHALL cover distinct attack vectors in this order:
   - **Steelman of the opposing position**: The strongest version of the counterargument that a smart, reasonable person who disagrees would actually make. Not a strawman.
   - **Logical vulnerabilities**: Where does the reasoning break down? What unstated assumptions are required? What must be true for the argument to hold that might not be?
   - **Practical failure modes**: Where does this idea work in theory but fail in execution? What does it assume about people, systems, or resources that reality will not deliver?
   - **Edge cases that break it**: The 10% of situations where this approach produces the opposite of the intended result.
   - **The strongest single point**: The one argument that, if the user cannot answer it, should genuinely change their mind. An escalation, not a summary.
4. The skill SHALL be specific, not abstract. "This might not scale" is a banned formulation. Every criticism must identify the precise point of breakage and why.
5. If the user invokes `/counterargument` with no text following it, the skill SHALL respond by explaining its usage format.

### Functional Requirements — /mental-model

1. The skill SHALL activate when the user invokes `/mental-model` followed by the concept they want a mental model for.
2. The skill SHALL produce a multi-layered output that builds a durable mental representation, not merely an explanation:
   - **Scaffold**: One-sentence simplest possible version — a foothold, not a definition.
   - **Analogy with failure boundary**: A concrete visual metaphor, followed immediately by "This analogy breaks down at the point where ___."
   - **Narrative**: How the concept came to exist — what problem forced it into existence, what the world looked like before, what changed when it arrived.
   - **Layered Build**: Three to four progressive layers, each extending the previous one, each adding one new element without replacing what was built before.
   - **Visual/Spatial Representation**: Describe the concept as if drawing it — where things are in space, what moves, what is big vs. small, the shape of the process. The user should be able to close their eyes and see it.
   - **Concrete Anchors**: Two or three real examples grounding the most abstract parts — actual things that exist or have happened, not hypotheticals.
   - **Connections**: What this concept sits next to in the user's existing knowledge. What understanding this changes about things they already understood.
   - **Retrieval Check**: Three questions the user should be able to answer from the mental model alone — prediction questions, not definition questions ("What would happen if ___?" not "Define ___").
   - **Consolidation Note**: "Return to this tomorrow. The brain does its deepest consolidation work during sleep, and the model will be noticeably more solid after one night."
3. The skill SHALL integrate five evidence-backed mechanisms: scaffold-before-detail, dual coding (verbal + spatial), concrete grounding for abstracts, narrative over abstraction, and incremental layering.
4. If the user invokes `/mental-model` with no text following it, the skill SHALL respond by explaining its usage format.

### Functional Requirements — /research

1. The skill SHALL activate when the user invokes `/research` followed by their research question.
2. Every factual claim MUST be attributed — source, publication, year. Unattributable claims must be flagged as such before they are made.
3. Every claim SHALL receive an explicit epistemic label:
   - **Established consensus**: Widely replicated, high agreement, no serious current challenge
   - **Strong evidence**: Multiple good studies but some methodological variation or unresolved questions
   - **Preliminary/contested**: Interesting findings but small samples, replication issues, or active debate
   - **Widely believed but poorly evidenced**: Common in literature/practice but lacks rigorous experimental support
4. The skill SHALL NOT present extrapolation as finding. If the model infers Y from research finding X, that inference must be labeled as inference — not folded into the findings section.
5. The output structure:
   - **What the research actually says**: Findings stated plainly, attributed, with epistemic labels.
   - **Where the research is contested**: What the specific disagreement is about — methods, sample sizes, effect sizes.
   - **What the research does not answer**: Explicit gaps. What question is the user implicitly asking that the literature has not directly addressed?
   - **Recency flag**: If the most relevant research is older than five years in a fast-moving field, flag it. Surface meaningful recent updates.
   - **What this means in practice**: One short paragraph translating findings into something actionable, clearly marked as interpretation.
6. If the user invokes `/research` with no text following it, the skill SHALL respond by explaining its usage format.

### Non-Functional Requirements (All Four Skills)

- **Performance**: Negligible overhead. No I/O, no network calls, no extra computation.
- **Scalability**: Stateless per invocation. No session state maintained.
- **Security**: No file writes, no network calls, no credential exposure.
- **Observability**: The structured response format is self-evident.
- **Reliability**: If the input is ambiguous, answer the most reasonable interpretation and note the ambiguity.

---

## 5. High-Level Design

All four skills follow the same architecture as the existing `/question` skill: a single `SKILL.md` file with YAML frontmatter for discovery and procedural instructions for the LLM agent. No file writes, no CLI commands, no backend endpoints — the output is entirely inline in the chat response.

**Data flow (identical for all four):**

```
User: "/<command> <input text>"
         |
         v
[Agent with skill loaded]
         |
         +-- Does prompt start with "/<command>"?
         |     |
         |     No --> Normal response, skill silent
         |     |
         |    Yes
         |     |
         |     +-- Extract input text after "/<command>"
         |     |
         |     +-- If no input text: show usage/example
         |     |
         |     +-- If input text: produce structured output
         |     |     following the skill's specific output format
         |     |
         |     +-- Response delivered inline
```

**Key design decisions:**

1. **User-invoked only**: Like `/question`, these skills activate only on explicit slash command invocation. They do not monitor or interrupt sessions.

2. **No file output**: Unlike trace skills (which write to `memory/`) and `misconceptions` (which appends to a log), these skills produce inline responses only. The user asked a question and wants the answer now, in the chat.

3. **Strict output structures**: Each skill enforces a specific output structure. `/explain` enforces layered explanation with banned hedging phrases. `/counterargument` enforces adversarial-only output with specific attack vectors. `/mental-model` enforces nine distinct output sections. `/research` enforces attributed claims with epistemic labels.

4. **Pure prompt engineering**: Zero external dependencies. The skills leverage the LLM's native capabilities — parsing trigger prefixes and generating structured text — without any runtime code.

5. **Auto-discovered by installer**: No changes to `lib/skill-catalog.js`, `lib/skill-validation.js`, `scripts/validate.js`, or the installer. The skills directory `skills/<name>/SKILL.md` is discovered automatically.

---

## 6. Detailed Design

### 6.1 SKILL.md — /explain

**File(s):** `skills/explain/SKILL.md`
**Type:** New file

#### What it does
Defines the `/explain` slash command. When the user is genuinely stuck on a concept, this skill rebuilds the explanation from a lower floor — starting with a single jargon-free sentence, building through analogy and terminology, and ending with a retrieval check.

#### Interface / API

Frontmatter:
```yaml
---
name: explain
description: >
  Use when the user invokes /explain. Rebuilds explanations from first principles for users who are genuinely stuck.
  Asks one clarifying question first, then produces a layered explanation:
  floor-zero anchor, analogy with failure boundary, terminology introduction, concrete example, and retrieval check.
  Bans hedging phrases — simplicity is in the construction, not the framing.
---
```

#### Logic / Algorithm

**Step 1 — Detect invocation:**
1. Check if the user's prompt starts with `/explain`.
2. If no: produce normal response. Skill is silent.
3. If yes: proceed to Step 2.

**Step 2 — Ask the clarifying question:**
1. Extract the topic the user is confused about.
2. Before any explanation, ask exactly: "What specifically is confusing — the what, the why, or how it works in practice?"
3. Wait for the user's answer. Do NOT proceed to explanation until the user responds.
4. If the user typed `/explain` with no text, explain usage format instead.

**Step 3 — Produce the layered explanation:**

After the user answers the clarifying question, produce:

```
## Floor Zero
[One sentence. No jargon at all. Explain as if the reader has never encountered
this domain before. This is the anchor everything else attaches to.]

## The Analogy
[A concrete visual comparison to something completely unrelated that shares the same
underlying mechanism. Make it something the user can picture.]
This analogy breaks down at the point where [explicitly state the failure boundary].

## One Layer Up
[Now introduce actual terminology. Only terms that were already anchored by the
floor-zero version. Each new term gets a one-sentence plain-language definition
before it is used.]

## Concrete Example
[A real, specific instance — not a hypothetical. Something the user can point to
in the actual world. Name names, cite real systems, reference actual events.]

## Check
If you got this, you should be able to tell me: [one specific question that tests
whether the model actually landed. Not a quiz — a retrieval prompt.]
```

#### Edge Cases & Error Handling

- **Empty invocation**: User types `/explain` with nothing after. Respond with usage explanation and example.
- **User refuses to answer clarifying question**: If the user says "just explain it" without answering, proceed with the layered structure but target the most likely interpretation. Note the ambiguity.
- **Topic with no good real-world analogy**: Acknowledge that the analogy is approximate. Do not fabricate a misleading one.
- **Topic where asking about "what, why, or how" doesn't apply**: Adapt the clarifying question to the domain. The principle is: identify which layer of understanding is missing.

#### Banned Phrases (Hard Constraint)
The following phrases and their equivalents MUST NOT appear in the explanation: "in simple terms," "basically," "essentially," "to put it simply," "at its core," "fundamentally," "in a nutshell." Simplicity must be in the construction — simpler words, shorter sentences, concrete referents — not in framing devices that signal simplicity without delivering it.

---

### 6.2 SKILL.md — /counterargument

**File(s):** `skills/counterargument/SKILL.md`
**Type:** New file

#### What it does
Defines the `/counterargument` slash command. Provides genuine adversarial stress-testing of the user's idea — not balanced critique, not "on the other hand," but the strongest possible opposing position built with specificity and structural rigor.

#### Interface / API

Frontmatter:
```yaml
---
name: counterargument
description: >
  Use when the user invokes /counterargument. Stress-tests an idea with genuine adversarial rigor.
  Produces the steelman of the opposing position, identifies logical vulnerabilities and practical
  failure modes, explores edge cases, and ends with the single strongest counterpoint.
  Does not soften, balance, or validate — the whole output is adversarial.
---
```

#### Logic / Algorithm

**Step 1 — Detect invocation:**
Check if prompt starts with `/counterargument`. If no: silent. If yes with no text: show usage.

**Step 2 — Produce the adversarial analysis:**

```
## The Opposing Position
[Construct the strongest possible version of the counterargument. Not a strawman —
the real version that a smart, reasonable person who disagrees would actually make.
This is the foundation everything else builds on.]

## Logical Vulnerabilities
[Where does the reasoning break down? What assumptions are being made that are not
stated? What does the argument require to be true that might not be? Be surgical —
identify the specific premise or inference step, not just "there are assumptions."]

## Practical Failure Modes
[Where does this idea work in theory but fail in execution? What does it assume
about people, systems, or resources that reality will not deliver? Be specific about
the mechanism of failure, not abstract about "scaling" or "complexity."]

## Edge Cases That Break It
[What are the 10% of situations where this approach produces the opposite of the
intended result? Identify the specific conditions, not general categories.]

## The Strongest Single Point
[The one argument that, if the user cannot answer it, should genuinely change their
mind. This is not a summary — it is an escalation. The most damaging point saved for
last. If there are multiple strong points, choose the one that attacks the core premise
rather than peripheral details.]
```

#### Edge Cases & Error Handling

- **Empty invocation**: Show usage format with example.
- **User presents an idea that is genuinely hard to counter**: Say so directly. "This idea is well-constructed and hard to refute on its own terms. The strongest challenge is [X], but I want to be transparent that this is a marginal case."
- **User presents a morally charged position**: Engage with intellectual rigor, not moral judgment. Critique the reasoning, not the values.
- **Idea is internally contradictory**: The logical vulnerabilities section should identify the contradiction directly. Do not fabricate external counterarguments when the internal structure already fails.

#### Prohibitions (Hard Constraints)

- **No softening**: No "to be fair," "on the other hand," "there are merits to both sides," "that said," "however, your point about X is valid."
- **No balancing**: The output contains only adversarial content. The user already knows their own argument — they do not need it validated back to them.
- **No abstract criticism**: "This might not scale" is banned. Every criticism must identify the specific mechanism of failure. "This breaks at the point where the cache invalidation strategy assumes single-writer semantics because in a multi-writer scenario, the TTL-based staleness window grows to the point where two writers can produce conflicting authoritative states" is correct.
- **No "some people might disagree"**: Name the specific camp of disagreement and the specific reason. Do not gesture vaguely at disagreement.

---

### 6.3 SKILL.md — /mental-model

**File(s):** `skills/mental-model/SKILL.md`
**Type:** New file

#### What it does
Defines the `/mental-model` slash command. Builds a durable, flexible, retrievable mental representation of a concept — not just an explanation. Integrates five research-backed mechanisms: scaffold-before-detail, dual coding, concrete grounding, narrative framing, and incremental layering.

#### Interface / API

Frontmatter:
```yaml
---
name: mental-model
description: >
  Use when the user invokes /mental-model. Builds a durable mental representation of a concept,
  not just an explanation. Integrates five research-backed learning mechanisms:
  scaffold-before-detail, dual coding (verbal + spatial), concrete grounding, narrative framing,
  and incremental layering. Produces a nine-section output ending with a consolidation note.
---
```

#### Logic / Algorithm

**Step 1 — Detect invocation:**
Check if prompt starts with `/mental-model`. If no: silent. If yes with no text: show usage.

**Step 2 — Produce the nine-section mental model:**

```
## The Scaffold
[One sentence. The simplest possible version of the concept. Not accurate, not complete
— just a foothold. Something the brain can hang the rest on. Even an incomplete version
creates the hooks that make everything learned after it stick faster.]

## The Analogy
[A concrete visual metaphor drawn from an entirely different domain. Make it vivid
— something the user can see in their mind's eye.]
This analogy breaks down at the point where [explicit failure boundary].

## The Narrative
[How did this concept come to exist? What was the problem that forced it into existence?
What did the world look like before it existed? Who needed it and why? What changed
when it arrived? This is not historical context — it is the mechanism by which the
brain's episodic system builds a richer structural representation.]

## The Layered Build
[Three to four progressive layers. Each layer extends the previous one, adding exactly
one new element to the model without replacing what was built before. The first layer
is the scaffold expanded slightly. Each subsequent layer adds one dimension —
mechanism, constraint, interaction, or implication.]

### Layer 1 — [Single concept addition]
[Content]

### Layer 2 — [Single concept addition]
[Content]

### Layer 3 — [Single concept addition]
[Content]

### Layer 4 — [Single concept addition, if warranted]
[Content]

## The Visual Representation
[Describe the concept as if you are drawing it. Where are things in space relative to
each other? What moves? What is big and what is small? What is the shape of the process?
Use spatial language: left/right, above/below, inside/outside, flowing, expanding,
contracting, branching. The user should be able to close their eyes and see it.]

## The Concrete Anchors
[Two or three real examples grounding the most abstract parts of the concept. Not
hypotheticals — actual things that exist or have happened. Name specific systems,
events, discoveries, or cases. Each anchor should illuminate a different aspect
of the concept.]

## The Connections
[What does this concept sit next to in the user's existing knowledge? What does
understanding this change about things they already understood? How does it connect
to more familiar concepts? The more connections to existing knowledge, the faster
and more durably the model consolidates.]

## The Retrieval Check
[Three questions the user should be able to answer from the mental model alone,
without looking anything up. These are prediction questions, not definition questions:
"What would happen if ___?" not "Define ___." Prediction is the test of a real model.]

1. [Prediction question]
2. [Prediction question]
3. [Prediction question]

## Consolidation
Return to this tomorrow. The brain does its deepest consolidation work during sleep,
and the model will be noticeably more solid after one night.
```

#### Edge Cases & Error Handling

- **Empty invocation**: Show usage format with example.
- **Concept too large for a single mental model**: Scope to the most fundamental aspect and note that the model is partial. "This is a model of the core mechanism. The full concept has additional layers that build on this foundation."
- **Concept with no good spatial representation**: Use a process diagram or structural metaphor. If absolutely no spatial mapping works, acknowledge the limitation and compensate with stronger concrete anchors and narrative.
- **User asks for a model of something they already understand well**: Build the model as requested but note in the connections section: "Since you already understand [X], this model connects most directly to [existing knowledge] and should extend rather than replace your current understanding."

#### Research-Backed Mechanisms (Baked into the Output)

1. **Scaffold before detail**: The hippocampus needs a rough structure before it can efficiently encode anything. The output starts with the simplest possible version — even an incomplete version creates hooks for everything that follows.

2. **Dual coding**: Verbal explanation alone lives in one brain system. The Visual Representation section activates a completely separate system and creates a second parallel memory trace.

3. **Concrete grounding for abstract concepts**: Abstract ideas have no sensorimotor hooks. Every abstract component is tethered to a concrete example in the Concrete Anchors section. Motor cortices, auditory cortices, and visual cortices all activate when concrete hooks are present.

4. **Narrative over abstraction**: Story-based framing is neurologically superior to abstract rules. The brain's episodic memory system is tuned to build structured representations of "what happened and why." The Narrative section explains the concept as a story.

5. **Incremental layering**: New information that slightly extends an existing model gets absorbed almost instantly. The Layered Build section adds one element at a time, each just slightly beyond the last.

---

### 6.4 SKILL.md — /research

**File(s):** `skills/research/SKILL.md`
**Type:** New file

#### What it does
Defines the `/research` slash command. Delivers answers grounded in what is actually known and verified, with explicit source attribution, epistemic labeling on every claim, and clear separation between findings and inference.

#### Interface / API

Frontmatter:
```yaml
---
name: research
description: >
  Use when the user invokes /research. Delivers answers grounded in what is actually known
  and verified, with explicit source attribution and epistemic labeling on every claim.
  Distinguishes established consensus from preliminary findings, flags contested areas,
  and explicitly marks inferences as separate from findings.
---
```

#### Logic / Algorithm

**Step 1 — Detect invocation:**
Check if prompt starts with `/research`. If no: silent. If yes with no text: show usage.

**Step 2 — Produce the research-grounded answer:**

```
## What the Research Actually Says

[Each claim is a bullet. Each bullet includes: the finding stated plainly, the
attribution (source, publication, year), and the epistemic label in brackets.]

- Finding stated plainly. (Author et al., Journal, Year) [Established consensus]
- Another finding. (Researcher, Publication, Year) [Strong evidence]
- A third finding. (Team, Venue, Year) [Preliminary/contested]
- A claim believed but not rigorously evidenced. (Source context) [Widely believed but poorly evidenced]

## Where the Research Is Contested

[Not "some researchers disagree" — state the specific disagreement.
What is it actually about? Methods? Sample sizes? Effect sizes?
Interpretation of mechanisms? Who disagrees with whom, and on what grounds?]

## What the Research Does Not Answer

[Explicitly state the gaps. What question is the user implicitly asking that the
literature has not directly addressed? What would a study need to look like to
answer the user's actual question? Be honest about the boundary between what is
known and what is not.]

## Recency Flag
[If the most relevant research is older than five years in a fast-moving field,
flag it explicitly. If there is a meaningful recent update — a meta-analysis,
a replication effort, a new study with better methodology — surface it here.]

## What This Means in Practice

[INTERPRETATION — not a research finding. One short paragraph translating the
research into something actionable. Clearly marked as interpretation. This section
represents the model's synthesis, not a further empirical claim.]
```

#### Edge Cases & Error Handling

- **Empty invocation**: Show usage format with example.
- **Question with genuinely no research**: Say so directly. "I am not aware of peer-reviewed research that directly addresses this question. Here is what adjacent research says, and here is where the gap is."
- **Claims that are plausible but unattributable**: Flag them. "I believe [X] is the case based on [reasoning], but I cannot attribute this to a specific source. Treat this as inference, not finding."
- **Research that is old but not superseded**: If the research is 20+ years old but still the canonical source in a slow-moving field, note that recency is not a concern for this domain.
- **Question where the model's training data contains relevant but unverifiable claims**: Be honest. "My training data suggests [X], but I cannot verify this against specific publications. Treat this section with lower confidence."

#### Prohibitions (Hard Constraints)

- **No unattributed claims in the findings section**: Every claim in "What the Research Actually Says" must have a source. Claims without attributable sources go in a separate, clearly labeled section — or are not made.
- **No extrapolation presented as finding**: If the research establishes X and the model is inferring Y from it, Y goes in "What This Means in Practice" and is labeled as interpretation — not folded into the findings section.
- **No uniform confidence**: The epistemic labels are mandatory on every claim. The model's default is to present everything at the same confidence level — this skill forces differentiation.

---

## 7. Data Model Changes

N/A — All four skills maintain no persistent data. All output is inline in the response. No files are created, read, or written by these skills.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. These are prompt-based skills with no server component, no CLI commands, and no backend routes.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/explain/SKILL.md` | Core skill definition for /explain |
| CREATE | `skills/counterargument/SKILL.md` | Core skill definition for /counterargument |
| CREATE | `skills/mental-model/SKILL.md` | Core skill definition for /mental-model |
| CREATE | `skills/research/SKILL.md` | Core skill definition for /research |
| CREATE | `docs/design/explain-counterargument-mental-model-research.md` | This design document |

**Total: 5 files created, 0 modified, 0 deleted.**

No existing files are touched. No runtime files are created by any of the skills.

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. All four skills are Markdown prompts.

### Validation Tests
- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/explain/SKILL.md` exists, has valid frontmatter (name matching directory, non-empty description), and non-empty body
  - `skills/counterargument/SKILL.md` exists, has valid frontmatter, and non-empty body
  - `skills/mental-model/SKILL.md` exists, has valid frontmatter, and non-empty body
  - `skills/research/SKILL.md` exists, has valid frontmatter, and non-empty body

### Manual / QA Test Cases

#### /explain
1. **Basic layered explanation**: Given the user invokes `/explain what is a database index?` and answers the clarifying question, the response contains Floor Zero, The Analogy (with failure boundary), One Layer Up, Concrete Example, and Check sections — in that order.
2. **Hedging phrases absent**: Scan the entire response for "in simple terms," "basically," "essentially." None present.
3. **Empty invocation**: `/explain` with no text → usage explanation.
4. **Clarifying question asked first**: The model does not explain until the user answers "what, why, or how."

#### /counterargument
5. **Adversarial-only output**: Given the user invokes `/counterargument all software should be open source`, the response contains no softening, no balancing, no "there are merits to both." Every line is adversarial.
6. **Five attack vectors**: Opposing Position, Logical Vulnerabilities, Practical Failure Modes, Edge Cases, and Strongest Single Point — in that order.
7. **Specific criticism**: No "this might not scale." All criticism identifies precise mechanisms of failure.
8. **Empty invocation**: `/counterargument` with no text → usage explanation.

#### /mental-model
9. **All nine sections present**: Scaffold, Analogy (with failure boundary), Narrative, Layered Build (3-4 layers), Visual Representation, Concrete Anchors, Connections, Retrieval Check (3 prediction questions), and Consolidation note.
10. **Prediction questions**: Retrieval Check asks "What would happen if ___?" style questions, not "Define ___."
11. **Consolidation note**: Ends with "Return to this tomorrow" message.
12. **Empty invocation**: `/mental-model` with no text → usage explanation.

#### /research
13. **All claims attributed**: Every claim in "What the Research Actually Says" has source, publication, year.
14. **Epistemic labels present**: Each claim carries one of the four labels.
15. **Interpretation separated**: The "What This Means in Practice" section is clearly marked as interpretation.
16. **No extrapolation as finding**: No claim in the findings section is an inference presented as settled science.
17. **Empty invocation**: `/research` with no text → usage explanation.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | Zero external dependencies for all four skills | None |

All four skills operate entirely through the LLM agent's native capabilities: parsing the trigger prefix and generating structured text. No npm packages, APIs, databases, or services are involved.

---

## 12. Rollout & Deployment

- **Feature flags**: None. Each skill is loaded when the agent selects it based on its frontmatter description. Since each description specifies the slash command trigger, the agent loads the skill when that command is typed.
- **Breaking change**: No. All four skills are new and additive. No existing code is modified.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directories automatically.
- **Rollback procedure**: Delete the four `skills/<name>/` directories and re-run the installer. No data migration needed (no persistent state).

---

## 13. Open Questions

- [x] **Should `/explain` allow the user to pre-answer the clarifying question?** **Resolved: Yes.** The user can indicate the layer inline (e.g., `/explain what: how do database indexes work?` or `/explain how it works in practice: Rust's borrow checker`). If the layer is provided, proceed directly to the explanation. If not, ask the clarifying question.
- [x] **Should `/mental-model` have a complexity level selector?** **Resolved: No.** Keep the full nine-section output. The user can indicate "keep it brief" in their prompt if desired.
- [x] **Should `/research` cite only peer-reviewed sources?** **Resolved: Yes.** All claims in "What the Research Actually Says" must be supported by peer-reviewed publications (journal articles, conference proceedings, academic press books). Preprints, institutional reports, blog posts, and grey literature should not appear in the findings section — they may only appear in a separate "Related but Unreviewed Sources" section if explicitly relevant.

---

## 14. Alternatives Considered

### Alternative 1: Merge into a single "cognitive tools" skill
- What: Combine all four commands into one `/cog` skill with subcommands (`/cog explain`, `/cog argue`, etc.)
- Why rejected: Each skill addresses a distinct failure mode with a distinct output structure. The instructions for `/explain` (ban hedging, layered structure) would conflict with `/counterargument` (adversarial only). Separate skills keep instructions clean and non-conflicting.

### Alternative 2: Make skills always-active like `why`
- What: Have these skills activate automatically based on detected patterns rather than explicit slash commands.
- Why rejected: Each skill's output is substantial and structured. Automatically producing a nine-section mental model or a full adversarial analysis would be disruptive and unwanted in most contexts. User invocation respects the user's intention.

### Alternative 3: File-based output for `/research` and `/mental-model`
- What: Write the research brief or mental model to a timestamped file in `memory/` instead of inline.
- Why rejected: The user asked a question — they want the answer now, in the chat. File output adds friction for immediate consumption. The trace skills already cover the file-output pattern.

### Alternative 4: Add CLI commands for skills that submit to backend
- What: Create Python CLI commands so these skills can submit to Vidbyte backend.
- Why rejected: These skills are purely informational — they answer user questions inline. There is no artifact to submit, no backend processing needed. The `feedback` and `compressor` patterns cover backend submission; these skills are fundamentally different.

---

END OF DESIGN DOC
