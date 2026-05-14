# Context Engineering Guidlines

This file is a reusable guide for common context-engineering prompt sections. Each section explains what that prompt section is, why it belongs in a prompt, and how it should influence the model's response. The filename intentionally uses `guidlines` to match the requested artifact name.

## identity

The `identity` section tells the model who it should be for the task. It defines the role, domain, standards, and working posture the model should adopt before it begins answering. The intent is to move the model out of generic assistant mode and into a specific expert frame. A strong identity section does not just say that the model is excellent; it explains what excellent behavior looks like for this kind of work.

This section should make the model care about the right signals, tradeoffs, and failure modes. It helps the model choose the vocabulary, depth, and judgment style that fit the task. In the response, identity should show up as task-appropriate expertise rather than as a visible self-description. The user should feel the role through the quality and focus of the answer, not through repeated claims about who the model is.

## goal

The `goal` section states the exact outcome the prompt is trying to produce. It explains what the model should accomplish, what the result should enable, and what success should look like from the user's point of view. The intent is to give the model a stable target when the task contains many possible directions. A clear goal prevents the response from optimizing for vague helpfulness or interesting side details.

This section should be specific enough to guide choices but broad enough to cover the whole task. It helps the model decide what to include, what to leave out, and when the answer is complete. In the response, the goal should show up as direct movement toward the requested outcome. The final answer should feel purposeful because every part of it serves the stated result.

## success criteria

The `success criteria` section defines the conditions the model must satisfy before it can stop. It turns completion into observable checks instead of a loose feeling that the answer is probably good enough. The intent is to prevent premature stopping, missing requirements, and answers that sound polished but fail the actual task. Success criteria are especially useful when the work has multiple requirements, quality bars, or edge cases.

This section should describe what must be true about the final answer, artifact, decision, or implementation. It gives the model a way to compare its work against the user's expectations before responding. In the response, success criteria should show up as completeness, coverage, and fewer accidental omissions. The model does not need to print the checklist unless asked; it should use the criteria to control the quality of the final output.

## intuition

The `intuition` section explains the deeper logic behind the prompt. It describes why the prompt is structured the way it is and what the model should understand beyond the surface task. The intent is to help the model apply the instructions intelligently instead of following them mechanically. This section is useful when the prompt depends on judgment, adaptation, or a particular way of thinking.

This section should clarify the conceptual pattern that makes the task work. It can explain the failure mode the prompt is trying to avoid, the leverage point it is trying to use, or the behavior it is trying to create. In the response, intuition should show up as coherent judgment when the situation is messy or incomplete. The answer should reflect the purpose behind the instructions, not just the literal wording of each step.

## definition

The `definition` section pins down a term, concept, or standard that could otherwise be interpreted in multiple plausible ways. It is useful when a prompt depends on words like depth, transfer, evidence, coverage, autonomy, quality, or success that sound clear but carry different meanings across domains. The intent is to prevent the model from silently choosing one interpretation and then building the rest of the response on that hidden choice. A definition section should state what the term means in this prompt and what it does not mean.

This section should make the final response more stable by giving the model a shared reference point for judgment. It should be concrete enough to guide decisions, but not so narrow that it removes necessary flexibility. Use it for concepts that are open to interpretation, not for ordinary words whose meaning is already obvious in context. The user should notice fewer vague labels and more consistent application of the defined idea.

## things to look for

The `things to look for` section gives the model a scanning checklist of signals, patterns, or failure modes that should be noticed during the task. It is useful when the model needs to observe behavior over time, audit a prompt, review an artifact, or catch repeated blind spots that are easy to miss in a single pass. The intent is to turn vague awareness into explicit attention targets. Each item should describe a signal and explain why it matters.

This section should make the response or artifact more observant and less generic. It should not become a loose list of advice; every item should point to something the model can actually detect in user input, work products, or session flow. For background skills, the list can guide what gets logged without interrupting the user. The user should notice that repeated patterns are captured more precisely and that feedback is tied to observable behavior.

## checklist

The `checklist` section lists concrete actions or checks the model should remember while doing the work. It is different from success criteria because it focuses on execution steps rather than final stopping conditions. The intent is to keep important obligations visible so the model does not drop them while concentrating on the main answer. A checklist is useful for repeated tasks, common omissions, and quality controls that are easy to forget.

This section should be practical, action-oriented, and short enough for the model to scan. It should name the behaviors the model must actually perform, such as checking constraints, preserving user intent, or verifying an edge case. In the response, the checklist should show up as careful execution rather than as unnecessary process narration. The final output should be cleaner because the model used the checklist to catch problems before answering.

## internal_monolog

The `internal_monolog` section tells the model what to privately attend to while it works. It names the constraints, quality signals, doubts, and drift risks the model should monitor during execution. The intent is to guide attention without asking the model to reveal hidden chain-of-thought or private scratchpad content. This section should improve self-monitoring while keeping the final response concise and useful.

This section should be phrased as private execution guidance, not as a request to show every thought. It can tell the model to notice unsupported assumptions, generic phrasing, missed constraints, or details that no longer serve the goal. In the response, internal monologue should show up only through better decisions, clearer caveats, and more relevant conclusions. The model should surface useful rationale and uncertainty, but it should not print private internal reasoning.

## internal reasoning

The `internal reasoning` section defines the reasoning standards the model should apply before it answers. It can tell the model how to test assumptions, compare alternatives, verify evidence, handle uncertainty, and decide whether the result is complete. The intent is to make the model's private evaluation more rigorous without making the final answer noisy. This section is useful when correctness, judgment, or tradeoff quality matters.

This section should describe the checks the model should run internally, not demand a transcript of those checks. It should help the model find weak logic, missing evidence, hidden assumptions, or unsupported conclusions before the user sees the answer. In the response, internal reasoning should show up as stronger conclusions, clearer justification, and appropriate uncertainty. The user should receive the useful outcome of the reasoning process, not the full private chain-of-thought.

## output style

The `output style` section tells the model how the final response should look and feel. It is about the shape, tone, density, organization, and presentation of the model's answer to the user. The intent is to make the response match the task, audience, and use case instead of defaulting to a generic assistant format. This section is its own prompt section, not a repeated subsection inside every other section.

This section should specify response qualities such as prose versus bullets, concise versus detailed, formal versus direct, or explanatory versus artifact-focused. It should avoid restating the goal and should focus only on how the final answer should be delivered. In the response, output style should show up as the chosen structure and voice of the answer. The model should follow the style in a way that supports the user's work rather than making formatting the center of the response.
