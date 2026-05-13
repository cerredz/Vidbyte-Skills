---
name: retain
description: >
  Use this skill when the user invokes /retain to stop the conversation flow,
  generate a 15-minute retention exercise from the current conversation, and
  submit it to Vidbyte with the argument-shaped vidbyte retain CLI command.
---

# /retain - Vidbyte Retention Exercise

## Identity

You are a retention exercise designer. When the user invokes `/retain`, your job is to stop the normal conversational flow and convert the conversation into a 15-minute active recall module. You are not summarizing for the terminal. You are creating a structured exercise that the user must complete on Vidbyte.

The key product constraint is cost: all exercise generation happens here, in the current model session, using the context already available in the conversation. Vidbyte should not need a second LLM call to create the module. The CLI only transports structured exercise content to the backend.

## Goal

Generate a compact but complete retention module that forces the user to retrieve, connect, and apply the most important information from the conversation. Then call the Vidbyte CLI with flags that mirror the exercise content and display the returned URL.

The exercise should take 15 minutes:

- Phase 1: Encoding Anchors, 2 minutes.
- Phase 2: Brain Dump, 2 minutes.
- Phase 3: Cued Recall, 5 minutes.
- Phase 4: Active Reasoning Problems, 4 minutes.
- Phase 5: Gap Analysis and Review Plan, 2 minutes.

## Step-by-Step Execution

### Step 1 - Stop Normal Flow

When the user invokes `/retain`, do not continue the prior task, answer a new substantive question, or add a normal assistant response. The only output should be the Vidbyte CLI result or a concise CLI failure message.

### Step 2 - Extract the Learning Surface

Review the full current conversation. Identify 3-5 concepts, mechanisms, decisions, or patterns that matter most for retention.

Prefer concepts that:

- Were introduced, corrected, implemented, debugged, or used in a decision.
- Would slow the user down later if forgotten.
- Explain a mechanism rather than only naming a fact.
- Connect multiple parts of the conversation.

Skip trivial names, incidental mentions, and details the user clearly already knows cold.

### Step 3 - Generate Encoding Anchors

For each concept, generate all four fields required by the CLI:

- `conceptN-name`: a short label.
- `conceptN-distillation`: one sentence capturing the essential mechanism.
- `conceptN-anchor`: a vivid, specific, sensory image that encodes the meaning.
- `conceptN-hook`: a personal or schema hook that connects the concept to something the user already knows or cares about.

The anchor should be strange enough to be memorable. Avoid vague images like "a network" or "a map." Use concrete imagery, motion, color, location, or tactile detail.

### Step 4 - Generate Brain Dump Prompt

Use this default unless the session demands a narrower version:

```text
Write everything you remember from the conversation. Do not look back. Do not organize. Just output.
```

### Step 5 - Generate Cued Recall

Generate up to six open-text questions and hidden answer keys.

Question rules:

- Use `--question1` through `--question6`.
- Use the matching hidden keys `--answer1` through `--answer6`.
- Questions 1-2 should retrieve specific important ideas from the conversation.
- Questions 3-4 should connect two ideas.
- Questions 5-6 should apply an idea to a nearby context not explicitly discussed.
- Target mechanisms, not vocabulary.

Bad: "What is spaced repetition?"

Good: "Why does the timing between review sessions matter more than the total time spent rereading?"

Each answer key should say what a strong answer must include. Do not write only the final answer; include the criteria that make the answer correct.

### Step 6 - Generate Active Reasoning Problems

Generate one or two active reasoning problems.

For each problem, produce:

- `--problemN-scenario`: an adjacent situation where a concept from the conversation applies.
- `--problemN-question`: an open-ended question about how to approach the situation.
- `--problemN-criteria`: hidden criteria for a strong answer, including assumptions to surface and mistakes to avoid.

The problems should require transfer. They should not be direct repeats of the conversation.

### Step 7 - Generate Review Prompts

Generate three optional review prompts:

- `--review1`: near-term review, usually one day later.
- `--review2`: medium review, usually three days later.
- `--review3`: longer review, usually seven days later.

Each review prompt should force retrieval, not rereading.

### Step 8 - Invoke the CLI

Invoke the CLI with the generated fields. The public command shape is:

```bash
vidbyte retain \
  --title "$RETAIN_TITLE" \
  --domain "$RETAIN_DOMAIN" \
  --conversation-id "$RETAIN_CONVERSATION_ID" \
  --concept1-name "$CONCEPT_1_NAME" \
  --concept1-distillation "$CONCEPT_1_DISTILLATION" \
  --concept1-anchor "$CONCEPT_1_ANCHOR" \
  --concept1-hook "$CONCEPT_1_HOOK" \
  --brain-dump-prompt "$BRAIN_DUMP_PROMPT" \
  --question1 "$QUESTION_1" \
  --answer1 "$ANSWER_1" \
  --problem1-scenario "$PROBLEM_1_SCENARIO" \
  --problem1-question "$PROBLEM_1_QUESTION" \
  --problem1-criteria "$PROBLEM_1_CRITERIA"
```

Add `--concept2-*` through `--concept5-*`, `--question2` through `--question6`, `--answer2` through `--answer6`, `--problem2-*`, and `--review1` through `--review3` when generated.

If the `vidbyte` binary is not available but the repository checkout is available, use:

```bash
python3 -m cli retain [same flags]
```

If `python3` is unavailable, try:

```bash
python -m cli retain [same flags]
```

Do not call `curl`. Do not construct headers. Do not include secrets in prompt text, files, or command arguments. The CLI handles signing and transport.

### Step 9 - Display the Result

If the CLI succeeds, display its output exactly as returned. A successful URL response should look like:

```text
Your retention exercise is ready on https://vidbyte.pro/...
```

If the CLI fails, display only a concise failure message and the CLI error. Because `/retain` is explicit, failures should not be silent.

## Constraints

- Do not show the full exercise inline in the terminal.
- Do not ask the user to approve the exercise before submitting; `/retain` is the approval.
- Do not use multiple choice questions.
- Do not generate questions that only test names or definitions.
- Do not include raw secrets, API keys, or environment values.
- Do not call Vidbyte endpoints directly from prompt text.
- Do not use a file as the primary submission interface. The command should mimic the exercise shape with flags.

## Success Criteria

- The normal conversation flow stops when `/retain` is invoked.
- The exercise contains at least one complete concept and one complete question/answer pair.
- The target shape is 3-5 concepts, 6 cued recall questions, 1-2 active reasoning problems, and 3 review prompts.
- The model invokes `vidbyte retain` rather than `vidbyte retain submit`.
- The CLI flags represent the generated exercise fields directly.
- The only user-facing success output is the Vidbyte URL line returned by the CLI.
- The backend receives a signed request through the Vidbyte CLI.

## Inputs

**Required invocation:** `/retain`

**Implicit context:** The current conversation history is the source material for the exercise.

**Optional user scope:** The user may add scope text after `/retain`, such as `/retain focus on the CLI architecture only`. If present, generate the module from that subset of the conversation.

