# Context Engineering Guidlines

This file is a reusable guide for writing context-engineering prompt sections. Each section below explains what the section does, why it helps the model perform better, and what output shape the section should have when you include it in a prompt.

The goal is not to make every prompt longer. The goal is to make the important parts of a prompt explicit enough that the model can adopt the right role, understand the real objective, know when it is done, and execute with a consistent quality bar.

Note: the filename intentionally uses `guidlines` to match the requested artifact name. Do not create a duplicate `context-engineering-guidelines.md` file unless the repo intentionally migrates the name.

## How To Use This Guide

Use these sections as building blocks. A small prompt may only need `identity`, `goal`, and `success criteria`. A complex prompt may also need `intuition`, `checklist`, `internal_monolog`, and `internal reasoning` so the model understands both the concept and the execution standard.

Write each section for the task at hand. Avoid generic expert language that could apply to any domain. A useful section names the real task, the real constraints, the expected output, and the stopping conditions.

Recommended order:

1. `identity`
2. `goal`
3. `intuition`
4. `success criteria`
5. `checklist`
6. `internal_monolog`
7. `internal reasoning`

## Section Pattern

Every section should answer three questions:

- **Description:** What does this section tell the model?
- **Intuition:** Why does this section improve execution?
- **Output style:** What should this section look like in the prompt?

## identity

### Description

The `identity` section defines who the model should be for the task. It names the role, level of expertise, domain standards, and operating posture the model should adopt. Its purpose is to align the model with someone who is world class at the task instead of leaving it in a generic assistant mode. A strong identity section does not just say "you are an expert"; it explains what expert behavior means in this domain.

### Intuition

Model behavior changes when the prompt activates the right professional frame. A world-class software engineer, editor, researcher, architect, strategist, or teacher will notice different signals, use different standards, and make different tradeoffs. The identity section narrows the model's attention toward the heuristics that matter for the task. It also prevents weak defaults such as shallow helpfulness, excessive hedging, generic advice, or premature certainty. The identity should make the model feel responsible for a real quality bar.

### Output Style

Write 1-2 paragraphs. Each paragraph should contain 6-8 full, coherent sentences. The writing should describe the model's role, standards, priorities, and behavior in concrete task-specific terms. Avoid vague status claims such as "you are the best" unless they are followed by what that excellence looks like in practice.

### Template

```markdown
## identity

You are a world-class [role] specializing in [domain/task]. You approach the work by [core method], and you judge quality by [domain-specific standard]. You are especially attentive to [important signals], [important constraints], and [common failure mode]. You do not settle for generic answers when the task requires concrete judgment. You make tradeoffs explicit, explain assumptions clearly, and preserve the user's actual intent. Your work should feel like it came from someone who has handled this type of problem many times in real conditions.
```

## goal

### Description

The `goal` section states the exact outcome the prompt is trying to produce. It should explain what the model is trying to accomplish, what the final result should enable, and what kind of value the user should get. The goal should be narrower than the entire task description and broader than a single checklist item. It is the target the rest of the prompt optimizes around.

### Intuition

Without a clear goal, the model may optimize for sounding helpful instead of producing the needed result. A goal gives the model a stable north star when instructions compete or when the task has many possible directions. It also helps the model choose the right level of depth, the right output structure, and the right stopping point. A good goal turns the prompt from "respond to this" into "achieve this outcome." It keeps the model from wandering into interesting but irrelevant details.

### Output Style

Write one paragraph. The paragraph should contain 6-8 full, coherent sentences. It should describe the desired end state, the user's intended benefit, and the standard the model should optimize for. Keep it direct and outcome-focused.

### Template

```markdown
## goal

Your goal is to [produce/decide/build/explain/evaluate] [specific outcome] so that [user/audience] can [specific benefit]. The final output should [main quality]. It should account for [constraint], [context], and [risk]. It should avoid [common wrong direction]. The work is complete only when [high-level completion condition]. Optimize for [priority] over [lower-priority tradeoff].
```

## success criteria

### Description

The `success criteria` section defines the metrics the model must satisfy before it can stop. These are concrete completion checks, not general aspirations. They should tell the model what must be true about the answer, artifact, decision, or implementation before the task is considered done. This section is especially useful for long, ambiguous, or multi-step prompts.

### Intuition

Models often stop when an answer seems plausible, not when the task is actually complete. Success criteria prevent premature stopping by turning quality into observable checks. They also reduce ambiguity about what matters most. If the model has a checklist of stopping conditions, it can compare its work against those conditions before returning a final answer. This makes completion more reliable and makes the prompt easier to test.

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

The `intuition` section explains the conceptual logic of the prompt as a whole. It goes beyond a basic description of the task and explains what running the prompt is actually trying to accomplish. It should describe the deeper pattern, leverage point, or transformation the prompt is meant to create. This section helps the model understand why the instructions are shaped the way they are.

### Intuition

Prompts work better when the model understands the purpose behind the procedure. If the prompt only lists steps, the model may follow them mechanically and miss the deeper point. The intuition section gives the model a conceptual model of the task, which helps it adapt when the situation is messy or incomplete. It explains the logic that should govern judgment calls. It is especially valuable when the prompt is trying to change reasoning behavior, not just produce a fixed format.

### Output Style

Write 1-2 paragraphs. Each paragraph should contain 6-8 sentences. The writing should explain what the prompt is trying to accomplish conceptually, why the task matters, what failure mode it is preventing, and how the sections work together.

### Template

```markdown
## intuition

This prompt is trying to [conceptual purpose], not merely [surface task]. The core idea is that [underlying logic]. The model should treat [important signal] as evidence of [deeper pattern]. The prompt prevents [failure mode] by forcing [useful behavior]. The sections work together by [relationship between identity, goal, criteria, and checklist]. When uncertain, the model should preserve [principle] rather than defaulting to [weak default].
```

## checklist

### Description

The `checklist` section lists the actions the model should make sure to do during execution. It is different from `success criteria`: success criteria define when the model may stop, while the checklist defines what the model should remember to do while working. A checklist is useful when the task has repeated obligations, common omissions, or quality steps that are easy to forget.

### Intuition

Even when a model understands the goal, it can miss small but important execution details. A checklist creates a simple control surface for those details. It keeps the model from relying entirely on memory or broad intent. It also makes the prompt easier to inspect because the execution expectations are visible in one place.

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

## internal_monolog

### Description

The `internal_monolog` section tells the model what to privately attend to during execution. It can name the questions the model should keep in mind, the constraints it should monitor, and the quality signals it should check while working. This section should guide attention and self-monitoring, not ask the model to print private thought processes. The final answer should expose useful conclusions and rationale, not hidden internal monologue.

### Intuition

Complex tasks often fail because the model loses track of what it should be watching while it works. Internal monologue guidance acts like a private attention policy. It helps the model notice when it is drifting, when it is making assumptions, when the output is becoming generic, or when the task requires a different level of detail. The section is valuable because it shapes execution without cluttering the final answer.

### Output Style

Use short private-instruction bullets or a compact paragraph. Phrase it as "privately track" or "while working, attend to" rather than "show your thoughts." Do not require the model to reveal hidden chain-of-thought, private scratchpads, or step-by-step internal reasoning.

### Template

```markdown
## internal_monolog

Privately track whether the answer is still serving the stated goal. Notice when an assumption is unsupported, when a section is becoming generic, or when a detail is interesting but irrelevant. Keep checking whether the user's constraints are being preserved. Do not reveal private reasoning; only surface the conclusions, decisions, and evidence that are useful to the user.
```

## internal reasoning

### Description

The `internal reasoning` section defines the reasoning standards the model should apply before producing the final answer. It can specify how to evaluate assumptions, compare alternatives, verify claims, handle uncertainty, and decide when the output is good enough. This section should improve rigor while keeping the final response readable. It should not require the model to disclose hidden chain-of-thought.

### Intuition

Reasoning quality improves when the model knows which checks matter for the task. Some prompts need adversarial review, some need evidence grading, some need implementation verification, and some need conceptual coherence. Naming the internal reasoning standard helps the model choose the right mental tools. It also reduces shallow answers because the model must privately test the output before presenting it. The user should see the important results of that testing, not the entire private reasoning trace.

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
- `success criteria` defines when the model can stop.
- `checklist` defines what the model should remember to do.
- `internal_monolog` defines what the model should privately attend to.
- `internal reasoning` defines how the model should privately test its work.
