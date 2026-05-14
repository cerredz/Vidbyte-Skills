# Adding To Context Engineering Guidlines

This artifact explains how to add future sections to `artifacts/context-engineering-guidlines.md` without turning the guide into a loose collection of prompt tips. Use it when adding a new reusable prompt section, revising an existing section, or deciding whether a proposed section belongs in the guide. The main file intentionally uses `guidlines` in the filename because that was the requested artifact name. Do not add a second file with the corrected spelling unless the repo intentionally migrates the filename and updates all references.

## Before Adding A Section

Add a new section only when it solves a distinct prompt-construction problem. If the new idea is just a more specific form of `goal`, `success criteria`, `intuition`, `checklist`, `internal_monolog`, `internal reasoning`, or `output style`, update the existing section instead of creating a duplicate.

Ask what prompt failure the section prevents, whether that failure is already handled, and whether the section changes model behavior in a way that is easy to explain. Also check whether the section has a clear effect on the final response and whether it avoids asking for hidden chain-of-thought, secrets, credentials, private logs, or sensitive internal details.

## Required Section Shape

Every section in `context-engineering-guidlines.md` should be an actual prompt section marked with a `##` heading. Do not add nested `Description`, `Intuition`, `Output Style`, or `Template` headings inside each section.

Write each section in regular prose using two paragraphs and 6-8 total sentences. The prose should explain what the section is, the intent behind using it, and how it should affect the model's response. If a proposed addition cannot be explained clearly in that shape, it is not ready to add.

## Addition Workflow

1. Identify the prompt failure the new section is meant to solve.
2. Compare the proposed section against the existing sections for overlap.
3. Decide whether to add a new section or revise an existing one.
4. Draft the section as regular prose with two paragraphs and 6-8 total sentences.
5. Explain the section's description, intent, and response effect without nested subheadings.
6. Add safety or quality guardrails if the section touches private reasoning, sensitive data, external claims, tools, or user constraints.
7. Review the full guide for duplicate responsibilities and inconsistent terminology.

## Review Checklist

- [ ] The section has one clear job.
- [ ] The section solves a prompt failure not already covered elsewhere.
- [ ] The section explains what the prompt section is.
- [ ] The section explains the intent behind using it.
- [ ] The section explains how it should affect the model's response.
- [ ] The section uses two paragraphs and 6-8 total sentences.
- [ ] The section does not add nested subsection headings.
- [ ] The section does not request hidden chain-of-thought in the final output.
- [ ] The section does not ask for secrets, credentials, private logs, or sensitive internal details.
- [ ] The section does not make the guide longer without improving prompt execution.

## Common Failure Modes

### Duplicate Section

The proposed section repeats the job of an existing section with different wording. Merge the useful parts into the existing section instead of adding a new heading.

### Nested Section Pattern

The proposed section reintroduces `Description`, `Intuition`, `Output Style`, or `Template` as nested headings. Rewrite the material as regular prose inside the actual section.

### Vague Response Effect

The proposed section says what the model should think about but not how the final response should improve. Add plain language that connects the section to the answer the user will receive.

### Generic Expert Filler

The proposed section uses status words like "world-class" or "high quality" without defining the actual domain behavior. Replace status claims with concrete standards, signals, and constraints.

### Hidden Reasoning Exposure

The proposed section asks the model to print internal monologue, full chain-of-thought, or private scratchpad content. Reframe it as private execution guidance and ask the final answer to surface only useful conclusions, rationale, evidence, or uncertainty.

### Prompt Bloat

The proposed section is valid in isolation but makes the guide harder to use. Keep it only if it meaningfully changes execution quality across multiple prompt types.

## Example Addition Stub

```markdown
## [section_name]

The `[section_name]` section tells the model to [specific instruction]. It is useful when [situation]. Its intent is to [behavior change] so the model avoids [failure mode].

This section should make the final response [response effect]. It should not be used when [non-use case]. The user should notice [visible quality improvement] rather than extra process narration.
```

## Maintenance Rule

Keep the main guide practical. A section belongs only if it helps a prompt author write better instructions and helps a model execute those instructions more reliably.
