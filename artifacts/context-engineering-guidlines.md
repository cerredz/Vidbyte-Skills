# Context Engineering Guidlines

This file is a reusable guide for writing context-engineering prompt sections. Each section explains what the section does, why it helps the model perform better, and what output shape the section should have when included in a prompt.

The goal is not to make every prompt longer. The goal is to make the important parts explicit enough that the model can adopt the right role, understand the real objective, know when it is done, and execute with a consistent quality bar.

Note: the filename intentionally uses `guidlines` to match the requested artifact name. Do not create a duplicate `context-engineering-guidelines.md` file unless the repo intentionally migrates the name.

## How To Use This Guide

Use these sections as building blocks. A small prompt may only need `identity`, `goal`, and `success criteria`. A complex prompt may also need `intuition`, `definition`, `algorithm`, `checklist`, `things to look for`, `cross-domain examples`, `before / after examples`, `internal_monolog`, `internal reasoning`, and `output style` so the model understands both the concept and the execution standard.

Write each section for the task at hand. Avoid generic expert language that could apply to any domain. A useful section names the real task, the real constraints, the expected output, and the stopping conditions.

Recommended order:

1. `identity`
2. `goal`
3. `intuition`
4. `definition`
5. `success criteria`
6. `algorithm`
7. `checklist`
8. `things to look for`
9. `cross-domain examples`
10. `before / after examples`
11. `internal_monolog`
12. `internal reasoning`
13. `output style`

## Section Pattern

Every section should answer three questions:

- **Description:** What does this section tell the model?
- **Intuition:** Why does this section improve execution?
- **Output style:** What should this section look like in the prompt?

## identity

### Description

The `identity` section defines who the model should be for the task. It names the role, level of expertise, domain standards, and operating posture the model should adopt. Its purpose is to align the model with someone who is world class at the task instead of leaving it in a generic assistant mode. A strong identity section does not just say "you are an expert"; it explains what expert behavior means in this domain.

### Intuition

Model behavior changes when the prompt activates the right professional frame. A world-class software engineer, editor, researcher, architect, strategist, or teacher will notice different signals, use different standards, and make different tradeoffs. The identity section narrows the model's attention toward the heuristics that matter for the task. It also prevents weak defaults such as shallow helpfulness, excessive hedging, generic advice, or premature certainty.

### Output Style

Write 1-2 paragraphs. Each paragraph should contain 6-8 full, coherent sentences. The writing should describe the model's role, standards, priorities, and behavior in concrete task-specific terms.

### Template

```markdown
## identity

You are a world-class [role] specializing in [domain/task]. You approach the work by [core method], and you judge quality by [domain-specific standard]. You are especially attentive to [important signals], [important constraints], and [common failure mode]. You do not settle for generic answers when the task requires concrete judgment. You make tradeoffs explicit, explain assumptions clearly, and preserve the user's actual intent. Your work should feel like it came from someone who has handled this type of problem many times in real conditions.
```

## goal

### Description

The `goal` section states the exact outcome the prompt is trying to produce. It should explain what the model is trying to accomplish, what the final result should enable, and what kind of value the user should get. The goal should be narrower than the entire task description and broader than a single checklist item.

### Intuition

Without a clear goal, the model may optimize for sounding helpful instead of producing the needed result. A goal gives the model a stable target when instructions compete or when the task has many possible directions. It also helps the model choose the right level of depth, the right output structure, and the right stopping point.

### Output Style

Write one paragraph. The paragraph should contain 6-8 full, coherent sentences. It should describe the desired end state, the user's intended benefit, and the standard the model should optimize for.

### Template

```markdown
## goal

Your goal is to [produce/decide/build/explain/evaluate] [specific outcome] so that [user/audience] can [specific benefit]. The final output should [main quality]. It should account for [constraint], [context], and [risk]. It should avoid [common wrong direction]. The work is complete only when [high-level completion condition]. Optimize for [priority] over [lower-priority tradeoff].
```

## success criteria

### Description

The `success criteria` section defines the metrics the model must satisfy before it can stop. These are concrete completion checks, not general aspirations. They should tell the model what must be true about the answer, artifact, decision, or implementation before the task is considered done.

### Intuition

Models often stop when an answer seems plausible, not when the task is actually complete. Success criteria prevent premature stopping by turning quality into observable checks. They also reduce ambiguity about what matters most. If the model has a checklist of stopping conditions, it can compare its work against those conditions before returning a final answer.

### Output Style

Use a checklist or bullet list. Each item should be concrete, observable, and phrased as something the model can verify. Prefer completion conditions over vague process reminders.

### Template

```markdown
## success criteria

- [ ] The output directly addresses [primary task].
- [ ] The output includes [required section/detail/artifact].
- [ ] The output accounts for [constraint or edge case].
- [ ] The output avoids [known failure mode].
- [ ] The model stops only after [verification condition].
```

## intuition

### Description

The `intuition` section explains the conceptual logic of the prompt as a whole. It goes beyond a basic description of the task and explains what running the prompt is actually trying to accomplish. It should describe the deeper pattern, leverage point, or transformation the prompt is meant to create.

### Intuition

Prompts work better when the model understands the purpose behind the procedure. If the prompt only lists steps, the model may follow them mechanically and miss the deeper point. The intuition section gives the model a conceptual model of the task, which helps it adapt when the situation is messy or incomplete.

### Output Style

Write 1-2 paragraphs. Each paragraph should contain 6-8 sentences. The writing should explain what the prompt is trying to accomplish conceptually, why the task matters, what failure mode it is preventing, and how the sections work together.

### Template

```markdown
## intuition

This prompt is trying to [conceptual purpose], not merely [surface task]. The core idea is that [underlying logic]. The model should treat [important signal] as evidence of [deeper pattern]. The prompt prevents [failure mode] by forcing [useful behavior]. The sections work together by [relationship between identity, goal, criteria, and checklist]. When uncertain, the model should preserve [principle] rather than defaulting to [weak default].
```

## definition

### Description

The `definition` section pins down a term, concept, or standard that could otherwise be interpreted in multiple plausible ways. It is useful when a prompt depends on words like depth, transfer, evidence, coverage, autonomy, quality, or success that sound clear but carry different meanings across domains. The intent is to prevent the model from silently choosing one interpretation and then building the rest of the response on that hidden choice. A definition section should state what the term means in this prompt and what it does not mean.

### Intuition

Models can silently adopt one interpretation of an ambiguous term and commit the entire response to that frame. When critical words are left undefined, the user may receive an answer that sounds correct but is built on a misalignment. A definition section creates a shared reference point for judgment, making the final response more stable by reducing interpretive drift. It also makes the prompt more reusable across users who may have different background assumptions about the same terms.

### Output Style

Write one paragraph per term being defined. Each paragraph should state what the term means for this task and what it does not mean. Be concrete enough to guide decisions, but not so narrow that it removes necessary flexibility. Use it for concepts that are genuinely open to interpretation, not for ordinary words whose meaning is already obvious in context.

### Template

```markdown
## definition

**[Term]:** In this task, [term] means [specific meaning]. It does not mean [common misinterpretation]. The model should apply this definition when deciding [decision point], checking [criterion], or evaluating [output quality].
```

## algorithm

### Description

The `algorithm` section gives the model the ordered steps it should take while executing the prompt. It is the procedural core: what to check first, what to do next, what branch to take when information is missing, what output to produce, and when to stop. It should be more concrete than the goal and more sequential than the checklist.

### Intuition

An algorithm prevents the model from treating the prompt as a loose set of preferences. It turns the behavior into a repeatable procedure that can handle normal cases, missing-context cases, failure cases, and completion. This is especially useful for skills, gates, review workflows, routing prompts, and any prompt where the model must decide between several response paths.

### Output Style

Use numbered steps with clear branch conditions. Each step should name an action and, when needed, the condition that triggers the next step. Keep the steps literal enough that another prompt author could simulate the model's path through the task.

### Template

```markdown
## algorithm

1. Detect whether [activation condition] applies. If not, [fallback behavior].
2. Extract [required input] from the user's request.
3. If [required input] is missing, ask [specific clarification] and stop.
4. Apply [main procedure] in this order: [substep], [substep], [substep].
5. Compare the result against the success criteria.
6. If a criterion fails, revise or return the specific failure.
7. Stop only after [completion condition].
```

## checklist

### Description

The `checklist` section lists the actions the model should make sure to do during execution. It is different from `success criteria`: success criteria define when the model may stop, while the checklist defines what the model should remember to do while working.

### Intuition

Even when a model understands the goal, it can miss small but important execution details. A checklist creates a simple control surface for those details. It keeps the model from relying entirely on memory or broad intent.

### Output Style

Use a bulleted list. Each bullet should start with a concrete verb when possible. Keep bullets short enough that the model can scan them before and during execution.

### Template

```markdown
## checklist

- Identify [required context] before answering.
- Preserve [user constraint or intent].
- Check [edge case or failure mode].
- Compare the output against [quality standard].
- Remove anything that does not help [goal].
```

## things to look for

### Description

The `things to look for` section gives the model a scanning checklist of signals, patterns, or failure modes that should be noticed during the task. It is useful when the model needs to observe behavior over time, audit a prompt, review an artifact, or catch repeated blind spots that are easy to miss in a single pass. The intent is to turn vague awareness into explicit attention targets. Each item should describe a signal and explain why it matters.

### Intuition

Models are good at processing what you ask them directly but can miss patterns that require sustained attention across a session. Explicit attention targets help the model notice drift, inconsistency, missing context, or repeated errors that would otherwise pass through. By naming specific signals and explaining their significance, the model becomes an observer of the process rather than just a responder to each message.

### Output Style

Use a bulleted list. Each bullet should name a specific signal or pattern and briefly state why it matters. Avoid loose lists of advice; every item should point to something the model can actually detect in user input, work products, or session flow. For background skills, the list can guide what gets logged without interrupting the user.

### Template

```markdown
## things to look for

- **[Signal or pattern]:** [Brief description of what to notice]. Why it matters: [explanation of the consequence].
- **[Another signal]:** [Brief description]. Why it matters: [explanation of the consequence].
```

## cross-domain examples

### Description

The `cross-domain examples` section gives the model diverse examples of the same skill or prompt behavior across unrelated real-world domains. It shows the model the invariant pattern beneath different surface topics. For example, a skill that forces alternative evaluation might include software, medicine, law, finance, education, operations, and writing examples.

### Intuition

Models generalize better when they see the same behavior expressed in multiple domains. Cross-domain examples prevent the prompt from overfitting to the first example's vocabulary. They also help the model recognize the underlying move when the user's request comes from a niche or unfamiliar area.

### Output Style

Use short examples with the same shape repeated across domains. Each example should name the domain, show a realistic user prompt or situation, and show the kind of model response the skill should produce. Keep examples concrete enough to model interaction, not just abstract use cases.

### Template

```markdown
## cross-domain examples

### Example 1: [Domain]

User: [realistic prompt]

Model response:

[brief response showing the behavior]

### Example 2: [Different domain]

User: [realistic prompt]

Model response:

[same behavior adapted to the new domain]
```

## before / after examples

### Description

The `before / after examples` section shows bad examples of what not to do before showing the stronger replacement. It demonstrates the failure mode the prompt is trying to prevent and the corrected behavior the model should produce instead. This is useful for skills where the main value is behavioral discipline, not just output formatting.

### Intuition

Models often need contrast, not just positive instruction. A bad-before example makes the failure mode concrete: vague criteria, generic dismissal, premature conclusion, unsafe command, unsupported claim, or shallow answer. The good-after example shows the same scenario handled with the intended standard, which makes the instruction easier to imitate and easier to test.

### Output Style

Use paired examples. Label each pair clearly as `Bad before` and `Good after`. Keep the bad example short and obviously flawed. Make the good example specific enough that the difference is observable.

### Template

```markdown
## before / after examples

### Pair 1: [Failure Mode]

Bad before:

[example of the weak behavior]

Good after:

[same scenario handled with the desired behavior]
```

## internal_monolog

### Description

The `internal_monolog` section tells the model what to privately attend to during execution. It can name the questions the model should keep in mind, the constraints it should monitor, and the quality signals it should check while working. This section should guide attention and self-monitoring, not ask the model to print private thought processes.

### Intuition

Complex tasks often fail because the model loses track of what it should be watching while it works. Internal monologue guidance acts like a private attention policy. It helps the model notice when it is drifting, making assumptions, becoming generic, or using the wrong level of detail.

### Output Style

Use short private-instruction bullets or a compact paragraph. Phrase it as "privately track" or "while working, attend to" rather than "show your thoughts." Do not require the model to reveal hidden chain-of-thought, private scratchpads, or step-by-step internal reasoning.

### Template

```markdown
## internal_monolog

Privately track whether the answer is still serving the stated goal. Notice when an assumption is unsupported, when a section is becoming generic, or when a detail is interesting but irrelevant. Keep checking whether the user's constraints are being preserved. Do not reveal private reasoning; only surface the conclusions, decisions, and evidence that are useful to the user.
```

## internal reasoning

### Description

The `internal reasoning` section defines the reasoning standards the model should apply before producing the final answer. It can specify how to evaluate assumptions, compare alternatives, verify claims, handle uncertainty, and decide when the output is good enough. This section should improve rigor while keeping the final response readable.

### Intuition

Reasoning quality improves when the model knows which checks matter for the task. Some prompts need adversarial review, some need evidence grading, some need implementation verification, and some need conceptual coherence. Naming the internal reasoning standard helps the model choose the right mental tools.

### Output Style

Use bullets or a compact paragraph. Each instruction should describe a reasoning move the model should apply internally. The final answer may include concise rationale, assumptions, caveats, or evidence summaries, but should not expose hidden chain-of-thought.

### Template

```markdown
## internal reasoning

- Check whether the answer follows from the available context.
- Identify assumptions that materially affect the result.
- Consider at least one plausible alternative before settling on the recommendation.
- Verify that the final output satisfies the success criteria.
- Surface only the useful rationale, uncertainty, and decision points in the final answer.
```

## output style

### Description

The `output style` section tells the model how the final response should look and feel when delivered to the user. It is about the shape, tone, density, organization, and presentation of the model's answer. Its purpose is to match the response to the task, audience, and use case instead of defaulting to a generic assistant format.

### Intuition

Without explicit output style guidance, models tend to converge on a generic assistant voice: polite, helpful, and medium-length. Different tasks demand different delivery: a code review needs precision, a strategy memo needs structure, a creative brief needs inspiration, and a terminal response needs conciseness. The output style section aligns the model's delivery with the real communication context.

### Output Style

Write one paragraph describing the desired response qualities: prose versus bullets, concise versus detailed, formal versus direct, explanatory versus artifact-focused. Avoid restating the goal. Focus only on how the final answer should be delivered.

### Template

```markdown
## output style

Respond in [format: bullets / prose / markdown sections]. Keep the response [concise / detailed]. Use [tone: direct / formal / conversational]. Prefer [delivery quality] over [lower-priority quality]. The response should feel like [target feel] rather than [avoided feel]. Do not include unnecessary preamble, self-description, or process narration unless the user explicitly asks.
```

## Quality Bar

A strong context-engineering prompt section is:

- Specific to the task instead of generic expert framing.
- Clear about the output shape it expects.
- Distinct from the other sections around it.
- Concrete enough that the model can verify whether it followed it.
- Safe about private reasoning: it can guide internal execution, but it should not demand hidden chain-of-thought in the final answer.
- Short enough to help the prompt rather than bury the task under instruction overhead.

## Common Section Boundaries

- `identity` defines who the model should be.
- `goal` defines what the model is trying to accomplish.
- `intuition` defines why the prompt is structured this way.
- `definition` defines the specific meaning of key terms.
- `success criteria` defines when the model can stop.
- `algorithm` defines the ordered procedure the model follows.
- `checklist` defines what the model should remember to do.
- `things to look for` defines what signals, patterns, or failure modes the model should notice.
- `cross-domain examples` defines how the same behavior looks across domains.
- `before / after examples` defines what weak behavior looks like and what should replace it.
- `internal_monolog` defines what the model should privately attend to.
- `internal reasoning` defines how the model should privately test its work.
- `output style` defines how the final response should be delivered to the user.
