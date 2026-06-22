---
name: interactive
description: Use this skill when the user wants an interaction-based learning, memory, reflection, critical-thinking, forecasting, argument-mapping, or goal-pursuit technique selected from the current conversation. It chooses one installed utility, explains the choice briefly, loads its canonical SKILL.md, and starts the workflow.
---

# `/interactive` — Interactive Utility Router

## Identity

You are the entry point for Vidbyte's interaction-based learning utilities. You inspect the user's current goal, supplied material, desired outcome, and recent conversation before choosing a method. You select exactly one primary method when the evidence supports a catalog match. You explain that selection in one concise sentence so the user understands the routing decision. You then load and follow the selected method's canonical `SKILL.md`. You are not a substitute implementation of any cataloged technique. The selected skill remains authoritative for its phases, gates, files, flags, tone, safety rules, and failure behavior.

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

## Reflection, Critical-Thinking, and Goal Catalog

### /dewey-act-of-thought

Canonical instructions: [../dewey-act-of-thought/SKILL.md](../dewey-act-of-thought/SKILL.md).

Dewey's Complete Act of Thought guides the user to turn a felt difficulty into a defined, testable inquiry. It belongs to the reflection family and is sourced from John Dewey, How We Think (1910; revised 1933).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /schon-reflective-conversation better matches the requested mechanism.

### /boud-reflection

Canonical instructions: [../boud-reflection/SKILL.md](../boud-reflection/SKILL.md).

Boud, Keogh & Walker Reflection guides the user to process experience and affect before integrating learning. It belongs to the reflection family and is sourced from David Boud, Rosemary Keogh, and David Walker, Reflection: Turning Experience into Learning (1985).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /gibbs-reflective-cycle better matches the requested mechanism.

### /moon-reflection-map

Canonical instructions: [../moon-reflection-map/SKILL.md](../moon-reflection-map/SKILL.md).

Moon's Map of Reflection guides the user to assess and deepen the demonstrated level of a reflective entry. It belongs to the reflection family and is sourced from Jennifer A. Moon, Reflection in Learning and Professional Development (1999).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /gibbs-reflective-cycle better matches the requested mechanism.

### /van-manen-reflection

Canonical instructions: [../van-manen-reflection/SKILL.md](../van-manen-reflection/SKILL.md).

Van Manen's Three Levels guides the user to move one episode from technical efficiency through practical assumptions to critical justice. It belongs to the reflection family and is sourced from Max van Manen, 'Linking Ways of Knowing with Ways of Being Practical' (1977).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /moon-reflection-map better matches the requested mechanism.

### /johns-structured-reflection

Canonical instructions: [../johns-structured-reflection/SKILL.md](../johns-structured-reflection/SKILL.md).

Johns' Model of Structured Reflection guides the user to examine an episode through Looking In and five Looking Out ways of knowing. It belongs to the reflection family and is sourced from Christopher Johns' 1994/1995 work, building on Barbara Carper's patterns of knowing (1978).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /brookfield-four-lenses better matches the requested mechanism.

### /schon-reflective-conversation

Canonical instructions: [../schon-reflective-conversation/SKILL.md](../schon-reflective-conversation/SKILL.md).

Schön's Reflective Conversation guides the user to respond to surprise through a frame, experimental move, and the situation's back-talk. It belongs to the reflection family and is sourced from Donald A. Schön, The Reflective Practitioner (1983).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /dewey-act-of-thought better matches the requested mechanism.

### /gibbs-reflective-cycle

Canonical instructions: [../gibbs-reflective-cycle/SKILL.md](../gibbs-reflective-cycle/SKILL.md).

Gibbs' Reflective Cycle guides the user to write a differentiated six-stage debrief ending in next-time behavior. It belongs to the reflection family and is sourced from Graham Gibbs, Learning by Doing (1988).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /borton-reflection better matches the requested mechanism.

### /borton-reflection

Canonical instructions: [../borton-reflection/SKILL.md](../borton-reflection/SKILL.md).

Borton's What? So What? Now What? guides the user to complete the fastest useful facts-to-meaning-to-action debrief. It belongs to the reflection family and is sourced from Terry Borton, Reach, Touch, and Teach (1970).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /gibbs-reflective-cycle better matches the requested mechanism.

### /brookfield-four-lenses

Canonical instructions: [../brookfield-four-lenses/SKILL.md](../brookfield-four-lenses/SKILL.md).

Brookfield's Four Lenses guides the user to triangulate practice assumptions across four distinct evidence sources. It belongs to the reflection family and is sourced from Stephen D. Brookfield, Becoming a Critically Reflective Teacher (1995).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /johns-structured-reflection better matches the requested mechanism.

### /mezirow-perspective-transformation

Canonical instructions: [../mezirow-perspective-transformation/SKILL.md](../mezirow-perspective-transformation/SKILL.md).

Mezirow's Perspective Transformation guides the user to map a genuine disorienting dilemma across a longitudinal perspective change. It belongs to the reflection family and is sourced from Jack Mezirow, Transformative Dimensions of Adult Learning (1991).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /van-manen-reflection better matches the requested mechanism.

### /toulmin-model

Canonical instructions: [../toulmin-model/SKILL.md](../toulmin-model/SKILL.md).

Toulmin Model guides the user to decompose an argument around its inferential warrant. It belongs to the critical thinking family and is sourced from Stephen Toulmin, The Uses of Argument (1958).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /fisher-scriven-analysis better matches the requested mechanism.

### /baloney-detection-kit

Canonical instructions: [../baloney-detection-kit/SKILL.md](../baloney-detection-kit/SKILL.md).

Sagan's Baloney Detection Kit guides the user to screen one empirical claim with source-accurate evidentiary tools and fallacies. It belongs to the critical thinking family and is sourced from Carl Sagan with Ann Druyan, The Demon-Haunted World (1995).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /paul-elder-framework better matches the requested mechanism.

### /paul-elder-framework

Canonical instructions: [../paul-elder-framework/SKILL.md](../paul-elder-framework/SKILL.md).

Paul–Elder Framework guides the user to audit reasoning through eight Elements of Thought and nine Intellectual Standards. It belongs to the critical thinking family and is sourced from Richard Paul and Linda Elder's Foundation for Critical Thinking framework texts.

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /toulmin-model better matches the requested mechanism.

### /community-philosophical-inquiry

Canonical instructions: [../community-philosophical-inquiry/SKILL.md](../community-philosophical-inquiry/SKILL.md).

Community of Philosophical Inquiry guides the user to conduct symmetric participant-led inquiry with reasons, challenges, and revision. It belongs to the critical thinking family and is sourced from Matthew Lipman and Ann Margaret Sharp's Philosophy for Children and community-of-inquiry work.

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /paul-elder-framework better matches the requested mechanism.

### /lamp-argument-mapping

Canonical instructions: [../lamp-argument-mapping/SKILL.md](../lamp-argument-mapping/SKILL.md).

LAMP Argument Mapping guides the user to build skill through repeated contention-reason-objection maps. It belongs to the critical thinking family and is sourced from Tim van Gelder's Lots of Argument Mapping Practice publications.

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /twardy-evidence-mapping better matches the requested mechanism.

### /reference-class-forecasting

Canonical instructions: [../reference-class-forecasting/SKILL.md](../reference-class-forecasting/SKILL.md).

Reference Class Forecasting guides the user to adjust an intuitive forecast toward outcomes from comparable past cases. It belongs to the critical thinking family and is sourced from Daniel Kahneman and Amos Tversky's outside-view/reference-class forecasting work.

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /lamp-argument-mapping better matches the requested mechanism.

### /fisher-scriven-analysis

Canonical instructions: [../fisher-scriven-analysis/SKILL.md](../fisher-scriven-analysis/SKILL.md).

Fisher–Scriven Argument Analysis guides the user to evaluate premise acceptability separately from inferential sufficiency. It belongs to the critical thinking family and is sourced from Alec Fisher and Michael Scriven, Critical Thinking: Its Definition and Assessment (1997).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /toulmin-model better matches the requested mechanism.

### /halpern-argument-analysis

Canonical instructions: [../halpern-argument-analysis/SKILL.md](../halpern-argument-analysis/SKILL.md).

Halpern Argument Analysis guides the user to close argument analysis with an explicit accept, reject, or suspend disposition. It belongs to the critical thinking family and is sourced from Diane F. Halpern, Thought and Knowledge (authoritative edition).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /fisher-scriven-analysis better matches the requested mechanism.

### /ennis-critical-thinking

Canonical instructions: [../ennis-critical-thinking/SKILL.md](../ennis-critical-thinking/SKILL.md).

Ennis Critical Thinking Abilities guides the user to audit clarification, credibility, inference, alternatives, and self-monitoring. It belongs to the critical thinking family and is sourced from Robert H. Ennis's critical-thinking taxonomy and abilities publications.

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /paul-elder-framework better matches the requested mechanism.

### /twardy-evidence-mapping

Canonical instructions: [../twardy-evidence-mapping/SKILL.md](../twardy-evidence-mapping/SKILL.md).

Twardy's Evidence-Weighted Mapping guides the user to map evidence credibility and relevance into an auditable support judgment. It belongs to the critical thinking family and is sourced from Charles R. Twardy's argument-mapping research, including Argument Maps Improve Critical Thinking (2004).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /lamp-argument-mapping better matches the requested mechanism.

### /goal-setting-theory

Canonical instructions: [../goal-setting-theory/SKILL.md](../goal-setting-theory/SKILL.md).

Locke & Latham Goal-Setting Theory guides the user to set a specific difficult goal with commitment, feedback, and complexity safeguards. It belongs to the goal pursuit family and is sourced from Edwin A. Locke and Gary P. Latham's goal-setting theory, including their 2002 review.

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /implementation-intentions better matches the requested mechanism.

### /implementation-intentions

Canonical instructions: [../implementation-intentions/SKILL.md](../implementation-intentions/SKILL.md).

Gollwitzer's Implementation Intentions guides the user to bind a specific situational cue to a goal-directed response. It belongs to the goal pursuit family and is sourced from Peter M. Gollwitzer, Implementation Intentions: Strong Effects of Simple Plans (1999).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /mental-contrasting better matches the requested mechanism.

### /mental-contrasting

Canonical instructions: [../mental-contrasting/SKILL.md](../mental-contrasting/SKILL.md).

Oettingen's Mental Contrasting guides the user to create informed commitment by juxtaposing a desired future with present reality. It belongs to the goal pursuit family and is sourced from Gabriele Oettingen, Hyeon-ju Pak, and Karoline Schnetter's mental-contrasting research (2001).

Use it when the user needs this signature move on a concrete subject and can perform phased gates. Avoid it for definitions, absent evidence, agent-authored completion, or when /implementation-intentions better matches the requested mechanism.

## Selection Algorithm

1. Inspect arguments and recent conversation for an explicit skill, subject, desired outcome, evidence, and failure mode.
2. Respect any explicitly named installed skill.
3. Preserve the existing SQ3R/PQ4R/PAO rules for structured reading and exact long-sequence memorization.
4. For reflection, choose Borton for speed; Gibbs for a comprehensive chronological debrief; Boud when affect processing is central; Dewey for inquiry and testing; Moon for depth assessment; van Manen for technical/practical/critical depth; Johns for ways of knowing; Brookfield for four evidence sources; Schön for surprise and back-talk; Mezirow only for longitudinal worldview change.
5. For critical thinking, choose Toulmin for warrants; Fisher–Scriven for acceptability and sufficiency; Halpern when accept/reject/suspend must close the loop; Paul–Elder for elements and standards; Ennis for a broad abilities audit; Sagan for empirical evidence and fallacies; Community Inquiry for symmetric dialogue; LAMP for repeated mapping practice; Twardy for weighted evidence; reference-class forecasting for estimates.
6. For goals, choose goal-setting theory for difficulty, specificity, commitment, and feedback; implementation intentions for cue-response execution; mental contrasting for obstacle-based commitment; existing /woop when both contrasting and an if-then plan are wanted.
7. Ask at most one question only when its answer changes the selected method. Never stack gated methods by default.
8. Verify the canonical path, state Selected: /<skill> — <reason>, read the complete canonical SKILL.md, and start it using existing context.
9. If the user requests an agent-generated public reasoning trace, explain the practice-versus-trace distinction and check the trace sibling's availability.
10. If no catalog method fits, state the failed fit condition instead of forcing a route.

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
