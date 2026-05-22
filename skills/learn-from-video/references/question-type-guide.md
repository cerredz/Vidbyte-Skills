# Question Type Guide

Checkpoint questions must force active generation. They should test whether the learner can use the idea, not whether they can repeat a phrase from the transcript.

## Explain

Use when the segment introduced a mechanism, causal relationship, distinction, or workflow.

Good:

- "In your own words, why does this approach reduce the amount of state the caller has to manage?"
- "Explain what changed between the first and second example, and why that change matters."

Avoid:

- "What was the first step?"
- "What is the definition of the term?"

## Apply

Use when the learner can transfer the segment's concept to a nearby situation.

Good:

- "Apply that idea to a small API endpoint that returns cached data. What would you change first?"
- "How would you use the pattern from this segment in a project with three independent teams?"

Avoid:

- "Can this be applied elsewhere?"
- "Where did the speaker apply it?"

## Decide

Use when the segment compared approaches, surfaced tradeoffs, or showed a decision boundary.

Good:

- "Which approach would you choose if the input changed every minute, and what cost would you accept?"
- "Decide whether you would keep this abstraction in a codebase with only two call sites. Justify the decision."

Avoid:

- "Was this the better approach?"
- "Do you agree with the speaker?"

## Predict

Use before a following segment, demonstration, or example outcome.

Good:

- "Before watching the next example, predict what breaks if the middle step returns null."
- "What do you expect the graph to show after the speaker changes the batch size, and why?"

Avoid:

- "What happened next?"
- "Did the output change?"

## Banned Patterns

- Yes/no questions.
- Recall-only prompts.
- Questions answerable by copying a sentence from the transcript.
- Questions that require external knowledge not present in the video or user's context.
- Multiple-choice prompts unless the user explicitly requested them.

## Depth Modes

Light mode:

- One question per segment.
- Prefer `explain` and `predict`.
- Keep questions narrower and easier to answer.

Default mode:

- One question per segment, with two for dense segments.
- Include at least one `apply` or `decide` question per session.

Deep mode:

- Two questions per segment.
- Prefer `apply` and `decide`.
- Make the user transfer or choose, not merely summarize.
