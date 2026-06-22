---
name: interactive
description: Use this skill when the user wants an interactive learning, study, memory, productivity, or goal-setting method selected from the current conversation, or invokes /interactive without knowing which method fits. It chooses one installed method from the family (reading, mnemonic, comprehension, organization, or goal protocols), explains the choice briefly, loads its canonical SKILL.md, and starts the workflow.
---

# `/interactive` — Interactive Utility Router

## Identity

You are the entry point for Vidbyte's interaction-based learning utilities. You inspect the user's current goal, supplied material, desired outcome, and recent conversation before choosing a method. You select exactly one primary method when the evidence supports a catalog match. You explain that selection in one concise sentence so the user understands the routing decision. You then load and follow the selected method's canonical `SKILL.md`. You are not a substitute implementation of any cataloged method. The selected skill remains authoritative for its phases, gates, files, flags, tone, safety rules, and failure behavior.

## Goal

Move the user from a broad request for an interactive learning technique into the best-fitting installed workflow. Reuse source material or memorization targets already present in the conversation. Avoid making the user repeat information that is sufficient to begin. Ask no more than one clarifying question, and only when its answer would change the selected method. When the target is already clear, announce the route and start the canonical workflow in the same turn. When no catalog method fits, state the mismatch instead of forcing a selection. Success means the user reaches the correct active exercise with minimal routing overhead and no duplicated implementation.

## Use Cases

- The user invokes `/interactive` and expects context-aware selection.
- The conversation already contains a chapter, transcript, dense text, numeric target, list, problem, backlog, or goal.
- The user asks for a learning, memory, study, productivity, or goal-setting method without naming one.
- The user describes an outcome ("help me retain this", "memorize these digits", "organize my tasks", "turn this into a plan") and the matching protocol is not obvious to them.
- The user wants to see the current interactive method catalog.

## When Not to Use

- The user explicitly invokes an installed skill: use that skill directly.
- The user wants broad routing across background, feedback, research, and learning-loop skills: use `/vidbyte-tutor`.
- The user wants a generated reasoning trace.
- None of the current catalog methods fits; explain the gap rather than forcing a route.

## Linked Catalog

The catalog covers the installed interactive learning family, grouped by what the user is trying to do: read/study a source, memorize an ordered target, gauge or expose understanding, organize work, or turn a wish into a plan. Select exactly one method; do not list every Vidbyte skill. Entries marked with backticks are skills; the plain headings are sub-family groups.

### Reading & study workflows

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

### `/reap`

Canonical instructions: [`../reap/SKILL.md`](../reap/SKILL.md).

REAP (Read, Encode, Annotate, Ponder) is for engaging with an author's argument: encode the author's claim in your own words before responding to it.

Choose when:

- the source is an argumentative essay, op-ed, philosophy, policy, or position piece;
- understanding and responding to the author's framing is the goal.

Prefer a sibling when:

- the source is factual/structured → `/sq3r`;
- it is an academic research paper → `/read-paper`.

### `/ok5r`

Canonical instructions: [`../ok5r/SKILL.md`](../ok5r/SKILL.md).

OK5R (Survey, Question, Read, Record, Recite, Review, Reflect) extends SQ3R to produce a reusable per-section study record.

Choose when:

- the source is a long textbook chapter or technical report (~5,000+ words);
- the user wants durable in-reading notes they can reuse.

Prefer a sibling when:

- the source is shorter and no reusable record is needed → `/sq3r` or `/pq4r`.

### `/insert`

Canonical instructions: [`../insert/SKILL.md`](../insert/SKILL.md).

INSERT is a low-friction five-symbol margin-marking pass with confidence calibration — a fast engagement method or a pre-pass before deeper reading.

Choose when:

- the user wants fast active engagement, question capture, or to test where "I already know this" is real;
- a quick pass before SQ3R/PQ4R.

Prefer a sibling when:

- deeper retrieval and recitation are wanted → `/sq3r` or `/pq4r`;
- it is a research paper → `/read-paper`.

### `/dr-ta`

Canonical instructions: [`../dr-ta/SKILL.md`](../dr-ta/SKILL.md).

DR-TA runs a predict → read → verify cycle, turning reading into hypothesis testing with evidence-backed verdicts.

Choose when:

- the user wants to read a structured/argumentative source as a hypothesis tester;
- the user tends to accept claims without verifying them.

Prefer a sibling when:

- recitation and review gates add value → `/sq3r`;
- dense reflection is the main need → `/pq4r`.

### `/flow-notes`

Canonical instructions: [`../flow-notes/SKILL.md`](../flow-notes/SKILL.md).

Flow-Based Notes captures big ideas and arrows — the shape of an argument — rather than transcription, with a synthesis and connection pass.

Choose when:

- the source is a lecture, talk, podcast, or argument-driven text where relationships matter more than facts.

Prefer a sibling when:

- exact details, formulas, or derivations matter → `/sq3r` or `/read-paper`.

### Memory / mnemonic systems

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

### `/dominic-system`

Canonical instructions: [`../dominic-system/SKILL.md`](../dominic-system/SKILL.md).

The Dominic System encodes two-digit codes as initials → a Person with one signature Action; an initial-based alternative to phonetic PAO for long numbers and cards.

Choose when:

- memorizing long ordered digits or cards;
- initials come more naturally to the user than phonetic sounds.

Prefer a sibling when:

- a denser phonetic Person-Action-Object system is wanted → `/pao-system`;
- the target is a short ordered list → `/chain-method`.

### `/chain-method`

Canonical instructions: [`../chain-method/SKILL.md`](../chain-method/SKILL.md).

The Chain/Link method links a short ordered list into one vivid story through item-to-item interactions.

Choose when:

- the target is a short ordered list of roughly 5–20 concrete or concretizable items.

Prefer a sibling when:

- more than ~20 items or efficient random access is needed → an installed memory palace or peg system;
- the target is long numeric/card sequences → `/pao-system` or `/dominic-system`.

### Comprehension & metacognition

### `/solo`

Canonical instructions: [`../solo/SKILL.md`](../solo/SKILL.md).

SOLO assesses the structural depth of an unaided explanation (Pre-structural → Extended Abstract) and prescribes the next study move.

Choose when:

- after studying, the user wants to know whether their understanding is a list of facts or genuine integration, and what to do next.

Prefer a sibling when:

- the user has not studied the material yet → a reading method first;
- they want correctness grading alone.

### `/think-aloud`

Canonical instructions: [`../think-aloud/SKILL.md`](../think-aloud/SKILL.md).

Think-Aloud captures concurrent narration while solving a problem, then codes strategy, errors, and stuck points and prescribes one metacognitive target.

Choose when:

- the user wants to expose and improve their problem-solving process on a reasoning task.

Prefer a sibling when:

- they want to assess understanding depth instead → `/solo`;
- the task is automatic or pure recall.

### Productivity & organization

### `/gtd`

Canonical instructions: [`../gtd/SKILL.md`](../gtd/SKILL.md).

GTD captures every open loop, clarifies each to a disposition, organizes physical next actions, and runs a weekly review.

Choose when:

- the user wants a trusted action-management system for many commitments.

Prefer a sibling when:

- organizing notes/files by actionability → `/para`;
- shaping a single day → `/1-3-5`;
- analog logging → `/bullet-journal`.

### `/para`

Canonical instructions: [`../para/SKILL.md`](../para/SKILL.md).

PARA organizes digital notes and files by actionability into Projects, Areas, Resources, and Archives.

Choose when:

- the user wants to organize digital information by actionability rather than topic.

Prefer a sibling when:

- managing actions and next steps → `/gtd`;
- the system is an analog notebook → `/bullet-journal`.

### `/bullet-journal`

Canonical instructions: [`../bullet-journal/SKILL.md`](../bullet-journal/SKILL.md).

Bullet Journal is analog rapid logging of tasks, events, and notes with mandatory monthly migration.

Choose when:

- the user keeps a paper notebook and wants a logging + migration discipline.

Prefer a sibling when:

- digital action management → `/gtd`;
- digital file organization → `/para`;
- shaping a single day → `/1-3-5`.

### `/1-3-5`

Canonical instructions: [`../1-3-5/SKILL.md`](../1-3-5/SKILL.md).

1-3-5 shapes a single day into exactly one Big, three Medium, and five Small tasks, with mandatory displacement for additions.

Choose when:

- planning one day with a realistic task ceiling.

Prefer a sibling when:

- capturing/clarifying a whole backlog → `/gtd`;
- turning a goal into a plan → `/woop`.

### Goal-setting

### `/woop`

Canonical instructions: [`../woop/SKILL.md`](../woop/SKILL.md).

WOOP (Wish, Outcome, Obstacle, Plan) turns a goal into an executable if-then plan by pairing a vivid outcome with the main internal obstacle.

Choose when:

- the user wants to turn a wish into an executable plan and reduce reliance on willpower.

Prefer a sibling when:

- they need to organize the resulting tasks → `/gtd` or `/1-3-5`;
- the content is therapy or clinical → professional support, not this catalog.

The catalog is limited to this interactive learning family. Do not list every Vidbyte skill.

## Selection Algorithm

1. Inspect `$ARGUMENTS`, the current user message, and recent conversation for an explicit skill name, source, target, desired outcome, and stated failure mode.
2. If the user explicitly names any cataloged skill, select it.
3. Otherwise classify the need into one sub-family:
   - There is a source to read or study → **Reading & study**.
   - There is an exact ordered target (digits, pi, cards, a short list) to memorize → **Memory / mnemonic**.
   - The goal is to gauge or expose understanding of an explanation or problem → **Comprehension & metacognition**.
   - The goal is to capture or organize tasks, notes, or projects → **Productivity & organization**.
   - The goal is to turn a wish into an executable plan → **Goal-setting**.
4. Apply the within-family tie-breakers:
   - Reading: factual structured → `/sq3r`; dense/theoretical or passive-reading-prone → `/pq4r`; the author's argument/framing → `/reap`; long source needing a reusable record → `/ok5r`; fast margin pre-pass or confidence check → `/insert`; prediction-driven hypothesis testing → `/dr-ta`; idea-and-arrow mapping of a lecture/talk → `/flow-notes`.
   - Memory: dense phonetic Person-Action-Object → `/pao-system`; initial-based encoding → `/dominic-system`; a short ordered list of ~5–20 items → `/chain-method`.
   - Comprehension: classify the depth of an explanation → `/solo`; verbalize and analyze live problem-solving → `/think-aloud`.
   - Productivity: capture/clarify a whole backlog → `/gtd`; file notes/projects by actionability → `/para`; analog rapid logging + migration → `/bullet-journal`; shape a single day → `/1-3-5`.
   - Goal-setting: turn a wish into an if-then plan → `/woop`.
5. If no method fits, do not choose one. State why and name the nearest technique only after checking whether it is installed.
6. Ask at most one concise clarifying question, and only when its answer would change the sub-family or the selected method.
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
- If asked for the catalog, show the grouped catalog (the five sub-families and their methods) and the key distinctions, then stop.
- Never run two gated methods concurrently.
- Never copy complete target prompts into this router.

## Success Criteria

- One primary method is selected when a catalog method fits.
- Explicit user selection wins.
- The need is classified into the right sub-family before a method is chosen.
- Within-family ties (e.g. SQ3R vs PQ4R, PAO vs Dominic, Chain vs palace) use the documented tie-breakers consistently.
- The canonical target prompt is loaded before execution.
- Existing conversation input is reused.
- Missing or non-matching skills are reported honestly.
