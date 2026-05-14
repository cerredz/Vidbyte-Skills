# Adding To Context Engineering Guidlines

This artifact explains how to add future sections to `artifacts/context-engineering-guidlines.md` without turning the guide into a loose collection of prompt tips. Use it when adding a new reusable prompt section, revising an existing section, or deciding whether a proposed section belongs in the guide.

The main file intentionally uses `guidlines` in the filename because that was the requested artifact name. Do not add a second file with the corrected spelling unless the repo intentionally migrates the filename and updates all references.

## Before Adding A Section

Add a new section only when it solves a distinct prompt-construction problem. If the new idea is just a more specific form of `goal`, `success criteria`, `intuition`, or `checklist`, update the existing section instead of creating a duplicate.

Ask these questions first:

- What prompt failure does this section prevent?
- Is that failure already handled by an existing section?
- Does the section change model behavior in a way that is easy to explain?
- Does the section have a concrete output shape?
- Can the section be reused across multiple prompts?
- Does the section avoid asking for hidden chain-of-thought or sensitive information?

## Required Section Shape

Every section in `context-engineering-guidlines.md` should use this shape:

```markdown
## section_name

### Description

Explain what this section tells the model.

### Intuition

Explain why this section improves execution and what failure mode it prevents.

### Output Style

Define the expected form, length, format, and constraints.

### Template

Provide a short reusable starter pattern.
```

If a section does not have a clear output style, it is not ready to add.

## Addition Workflow

1. Identify the prompt failure the new section is meant to solve.
2. Compare the proposed section against the existing sections for overlap.
3. Decide whether to add a new section or revise an existing one.
4. Draft the section using `Description`, `Intuition`, `Output Style`, and `Template`.
5. Make the output style concrete enough to test by inspection.
6. Add safety or quality guardrails if the section touches private reasoning, sensitive data, external claims, tools, or user constraints.
7. Update the recommended section order if the new section changes how prompts should be assembled.
8. Review the full guide for duplicate responsibilities and inconsistent terminology.

## Review Checklist

- [ ] The section has one clear job.
- [ ] The section solves a prompt failure not already covered elsewhere.
- [ ] The description explains what the model should understand.
- [ ] The intuition explains why the section improves behavior.
- [ ] The output style defines format, length, and constraints.
- [ ] The template is reusable but not so generic that it becomes filler.
- [ ] The section can be adapted to different tasks.
- [ ] The section does not request hidden chain-of-thought in the final output.
- [ ] The section does not ask for secrets, credentials, private logs, or sensitive internal details.
- [ ] The section does not make the prompt longer without improving execution.

## Common Failure Modes

### Duplicate Section

The proposed section repeats the job of an existing section with different wording. Merge the useful parts into the existing section instead of adding a new heading.

### Vague Output Style

The proposed section says what to think about but not what the prompt text should look like. Add exact shape requirements such as paragraph count, bullet form, checklist form, or template format.

### Generic Expert Filler

The proposed section uses status words like "world-class" or "high quality" without defining the actual domain behavior. Replace status claims with concrete standards, signals, and constraints.

### Hidden Reasoning Exposure

The proposed section asks the model to print internal monologue, full chain-of-thought, or private scratchpad content. Reframe it as private execution guidance and ask the final answer to surface only useful conclusions, rationale, evidence, or uncertainty.

### Prompt Bloat

The proposed section is valid in isolation but makes the guide harder to use. Keep it only if it meaningfully changes execution quality across multiple prompt types.

## Example Addition Stub

```markdown
## [section_name]

### Description

The `[section_name]` section tells the model to [specific instruction]. It is useful when [situation]. It should not be used when [non-use case].

### Intuition

This section improves prompts by [mechanism]. It prevents [failure mode]. It helps the model [behavior change] instead of [weak default].

### Output Style

Use [paragraphs/checklist/bullets/table/etc.]. Include [required elements]. Avoid [format or behavior to avoid].

### Template

[Reusable starter text.]
```

## Maintenance Rule

Keep the main guide practical. A section belongs only if it helps a prompt author write better instructions and helps a model execute those instructions more reliably.
