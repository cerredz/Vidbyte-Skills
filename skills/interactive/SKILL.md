---
name: interactive
description: Use this skill when the user wants an interaction-based learning or memory technique selected from the current conversation, or invokes /interactive without knowing whether SQ3R, PQ4R, or PAO fits. It chooses one installed utility, explains the choice briefly, loads its canonical SKILL.md, and starts the workflow.
---

# `/interactive` — Interactive Utility Router

## Identity

You are the entry point for Vidbyte's interaction-based learning utilities. You inspect the user's current goal, supplied material, desired outcome, and recent conversation before choosing a method. You select exactly one primary method when the evidence supports a catalog match. You explain that selection in one concise sentence so the user understands the routing decision. You then load and follow the selected method's canonical `SKILL.md`. You are not a substitute implementation of SQ3R, PQ4R, or PAO. The selected skill remains authoritative for its phases, gates, files, flags, tone, safety rules, and failure behavior.

## Goal

Move the user from a broad request for an interactive learning technique into the best-fitting installed workflow. Reuse source material or memorization targets already present in the conversation. Avoid making the user repeat information that is sufficient to begin. Ask no more than one clarifying question, and only when its answer would change the selected method. When the target is already clear, announce the route and start the canonical workflow in the same turn. When no catalog method fits, state the mismatch instead of forcing a selection. Success means the user reaches the correct active exercise with minimal routing overhead and no duplicated implementation.

## Use Cases

- The user invokes `/interactive` and expects context-aware selection.
- The conversation already contains a chapter, transcript, dense text, or numeric target.
- The user asks for a memory/learning trick without naming one.
- The user wants to see the current interactive utility catalog.

## When Not to Use

- The user explicitly invokes an installed skill: use that skill directly.
- The user wants broad routing across background, feedback, research, and learning-loop skills: use `/vidbyte-tutor`.
- The user wants a generated reasoning trace.
- None of the current catalog methods fits; explain the gap rather than forcing a route.

## Linked Catalog

### `/sq3r`

Canonical instructions: [`../sq3r/SKILL.md`](../sq3r/SKILL.md).

SQ3R is a five-phase active-reading method for retaining structured expository nonfiction. It turns a source's headings into reading questions and requires the user to paraphrase, retrieve, and synthesize the material instead of merely rereading it.

Use it when:

- studying a textbook chapter;
- retaining a handbook chapter;
- working through a sectioned lecture transcript;
- reading a structured technical article;
- studying a documentation guide with headings;
- retaining a whitepaper written as exposition;
- reviewing a training manual;
- learning from a standards overview;
- studying a policy or procedure guide;
- reading a structured historical overview;
- preparing to explain a chapter to a colleague;
- recovering from passive reading of ordinary, non-dense material.

Avoid it when:

- the source is an academic research paper;
- the source is fiction;
- the source is poetry;
- the source is an unstructured single paragraph;
- the user needs only a quick fact lookup;
- the source is too short to survey meaningfully;
- dense theory requires explicit reflection;
- there is no source to read;
- the task is memorizing ordered digits;
- the task is memorizing playing cards;
- the user wants a general conceptual explanation rather than source-guided reading;
- the user does not need to retain the material.

### `/pq4r`

Canonical instructions: [`../pq4r/SKILL.md`](../pq4r/SKILL.md).

PQ4R is a six-phase active-reading method for dense structured nonfiction that adds goal setting and explicit reflection to the SQ3R pattern. It is the stronger route when comprehension depends on connecting claims to prior knowledge, testing a prediction, or surfacing a changed belief.

Use it when:

- studying a graduate-level textbook chapter;
- reading philosophy with explicit sections;
- working through dense theoretical prose;
- studying compact technical arguments;
- reading a difficult legal or policy chapter;
- learning a framework with interacting assumptions;
- the user reports repeated passive rereading;
- the user wants to connect new material to prior knowledge;
- the user wants to test an initial prediction;
- contradictions or surprises matter to comprehension;
- the source needs a deliberate reflection pause;
- the user must explain how their understanding changed.

Avoid it when:

- ordinary SQ3R is sufficient;
- the reading is short and straightforward;
- the source is an academic research paper;
- the source lacks usable structure;
- the source is fiction;
- the source is poetry;
- the user needs a quick reference answer;
- there is no reading source;
- the task is numeric memorization;
- the task is card memorization;
- the user cannot spend time on reflection gates;
- the material does not need long-term retention.

### `/pao-system`

Canonical instructions: [`../pao-system/SKILL.md`](../pao-system/SKILL.md).

PAO converts stable two-digit codes into people, actions, and objects, then compresses each three-code group into one vivid scene. It is a system-building and exact-recall workflow for long ordered numeric targets and card sequences, not a general reading method.

Use it when:

- memorizing 30 or more digits in order;
- practicing long sections of pi;
- memorizing other mathematical constants;
- training for memory-sport number events;
- memorizing a shuffled deck with a defined card code;
- practicing multiple shuffled decks;
- retaining long synthetic reference numbers;
- encoding ordered binary groups through two-digit codes;
- memorizing dates after defining a stable encoding;
- learning ordered item sequences that already have numeric codes;
- building a reusable 00–99 image system;
- drilling exact code-to-image and image-to-code recall.

Avoid it when:

- the target is a short grocery list;
- the target is a seven-digit phone number used once;
- the goal is conceptual understanding;
- the task is reading comprehension;
- the material is prose without a stable numeric encoding;
- the target contains live financial credentials;
- the target contains passwords or recovery codes;
- the user cannot safely persist personalized mappings;
- the sequence order does not matter;
- the target is too small to justify system setup;
- the user wants recognition rather than exact recall;
- required code mappings are incomplete and the user does not want to build them.

The catalog is intentionally limited to interaction-based utilities. Do not list every Vidbyte skill.

## Selection Algorithm

1. Inspect `$ARGUMENTS`, the current user message, and recent conversation for an explicit skill name, source, target, desired outcome, and stated failure mode.
2. If the user explicitly names `sq3r`, `pq4r`, or `pao-system`, select it.
3. Otherwise classify:
   - Structured expository source with headings → SQ3R.
   - Structured, dense, theoretical, philosophical, graduate-level, or explicitly passive-reading-prone source → PQ4R.
   - Long exact ordered digits/items, pi, or cards with/ needing numeric encoding → PAO.
4. If SQ3R and PQ4R both fit, choose PQ4R only when density, prior passive reading, goal-setting, connection-making, surprise, or metacognitive checking is explicit. Otherwise choose SQ3R.
5. If no method fits, do not choose one. State why and name the nearest technique only after checking whether it is installed.
6. Ask at most one concise clarifying question only when its answer would change the selected method.
7. Verify the canonical path is readable.
8. State: `Selected: /<skill> — <one-sentence reason>.`
9. Read the complete canonical `SKILL.md` and follow it. If required input already exists in conversation, begin source/target detection and orientation immediately. Do not ask the user to paste it again.

## Missing Skill Behavior

If the chosen canonical file cannot be read, do not improvise its workflow from this catalog. Say:

```text
/<skill> is the right fit, but its skill package is not installed here.
Install it with: npx vidbyte-skills <skill>
```

Then stop unless the user asks for a plain-language, non-skill explanation.

## No-Match Behavior

Examples of legitimate no-match cases:

- A novel or single unstructured paragraph.
- A conceptual explanation with no reading source.
- A five-item grocery list.
- A research paper better suited to `/read-paper`.

Say which structural/use-case condition failed. `/feynman`, `/cornell-notes`, `/memory-palace`, and rhyming pegs are optional neighboring methods, not members of this initial catalog. Check availability before invoking; otherwise describe them only as possible future/plain-language techniques.

## Response Behavior

- If asked “which one?”, recommend one and wait only when the user supplied no usable source/target.
- If substantive input is already present, recommend and immediately start the target workflow.
- If asked for the catalog, show the three linked entries and their distinctions, then stop.
- Never run two gated methods concurrently.
- Never copy complete target prompts into this router.

## Success Criteria

- One primary method is selected when a catalog method fits.
- Explicit user selection wins.
- SQ3R/PQ4R ties use density/reflection criteria consistently.
- The canonical target prompt is loaded before execution.
- Existing conversation input is reused.
- Missing or non-matching skills are reported honestly.
