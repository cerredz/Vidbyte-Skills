# Design Doc: Interactive Reflection, Critical Thinking, and Goal Skills

**Status:** Draft  
**Author:** Codex  
**Created:** 2026-06-22  
**Last Updated:** 2026-06-22

---

## 1. Overview

Add 23 standalone interactive utility skills covering reflective practice, argument and evidence analysis, dialogical inquiry, forecasting, and goal pursuit. Each skill will research and accurately teach one named technique, apply it to the user's actual work, halt for observable user contributions, evaluate those contributions against method-specific criteria, and produce a useful final synthesis or local handoff. The change will also expand `/interactive` so it can distinguish and launch every new method through its canonical `SKILL.md`, and will register the skills in a new opt-in version 7 bundle and the repository's public catalogs.

---

## 2. Goals & Non-Goals

### Goals

- Create one independently installable `SKILL.md` for each of the 23 unique requested techniques; repeated Boud and Locke–Latham entries are implemented once each.
- Research each technique individually from its primary publication or the closest authoritative source immediately before writing that skill.
- Preserve each technique's origin, defining mechanism, ordered stages or rubric, use-case boundary, and distinction from neighboring methods.
- Follow the merged PR #109/#112 skill format: substantial Identity and Goal sections, Origin and Mechanism, Model Behavior, concrete Use Cases and When Not to Use lists, Invocation, Orientation, Interaction Contract, gated phases, alternate modes where useful, handoff/state behavior, failure modes, and success criteria.
- Add a dedicated one-to-two-paragraph `Your Job` section to every skill stating that the agent guides the user through the technique on the user's current work rather than merely describing it or completing the user's reflective/judgment work for them.
- Require user-produced evidence at meaningful gates, literal response halts, criteria-based evaluation, retry behavior, and targeted hints after repeated failure.
- Expand `/interactive` with canonical links, fit/exclusion signals, and deterministic tie-break rules for all new methods.
- Register all new skills under `learning`, add an opt-in version 7 bundle, and update README, `llms.txt`, and the interactive-utility artifact.
- Preserve local privacy, treat supplied claims/experiences/texts as untrusted data, and avoid unsupported clinical, legal, or moral authority.

### Non-Goals

- Change or remove the existing reasoning-trace siblings such as `argument-map-trace`, `reference-class-forecasting-trace`, or `double-loop-learning-trace`.
- Fold standalone implementation intentions or mental contrasting into `/woop`; the new skills remain narrower alternatives with explicit routing boundaries.
- Implement the duplicated Boud or Locke–Latham request twice under different names.
- Add backend endpoints, authenticated CLI commands, package dependencies, timers, schedulers, collaboration services, or new verification scripts.
- Claim that another learner, colleague, mentor, or community participated when only the agent and user are present.
- Force a user to fabricate evidence, feelings, feedback, historical data, completed transformation stages, or test results.
- Treat reflective practice as therapy, Community of Philosophical Inquiry as authoritative adjudication, or critical-thinking frameworks as automatic truth detectors.
- Replace existing version bundles or change version 1 installer defaults.

---

## 3. Background & Context

Vidbyte skills are portable Markdown packages under `skills/<name>/SKILL.md`. Folder discovery is automatic, while `skills-manifest.json` assigns categories and `lib/skill-versions.json` defines opt-in bundles. Existing validation enforces matching lowercase hyphen-case folder/frontmatter names, non-empty descriptions, valid registrations, and installability. README and `llms.txt` are public discovery surfaces.

The repository's interactive-utility contract is `Orient -> Explain -> Demonstrate -> HALT -> User performs -> Evaluate -> Advance`, with hint-and-retry loops when a gate fails. The agent may remove clerical friction, structure the user's material, calculate transparent scores, and preserve accepted work, but it must not perform the reflection, argument judgment, forecast choice, philosophical position revision, or goal commitment that makes the technique useful.

PRs #109–112 establish the current authoring format. PR #112 explicitly requires Identity, Goal, Origin and Mechanism, Model Behavior, extensive Use Cases and When Not to Use guidance, Invocation, Orientation, Interaction Contract, phase-level Explain/Demonstrate/Gate-and-HALT/Evaluation sections, alternate modes, state or persistent-data behavior, final handoff, failure modes, and success criteria. PR #109 further establishes canonical-link routing in `/interactive`, while the utility-interactive artifact requires observable gates, literal halts, criteria-based retries, capability honesty, and availability-aware routing.

The repository already contains a 60-technique research artifact. It provides a useful starting synthesis, but it is not treated as sufficient authority by itself. Before each skill is authored, the implementer will inspect the named primary publication or closest authoritative edition, record the source in the skill, reconcile terminology and counts, and avoid overstating contested or later-adapted protocols. This is especially important for Moon's learning-depth map versus reflective-writing classifications, Mezirow's varying phase labels, Sagan's tool/fallacy counts, and Twardy's evidence-weight propagation.

The current `main` checkout has unrelated untracked files. Phase 2 creates only this design document. After approval, implementation will occur in a new worktree and preserve those files.

---

## 4. Requirements

### Functional Requirements

1. The change SHALL create exactly 23 unique interactive technique skills from the user's list.
2. The repeated Boud–Keogh–Walker and Locke–Latham entries SHALL each map to one canonical skill.
3. Before authoring each individual `SKILL.md`, the implementer SHALL read the technique's primary publication or closest authoritative source, confirm origin/protocol terminology, and record the source under `Origin and Mechanism` or a short source note.
4. Every skill SHALL use the PR #109/#112 section structure and depth, adapted only where a method has no meaningful persistence or alternate mode.
5. Every skill SHALL contain a dedicated `## Your Job` section of one or two paragraphs. It SHALL say, in method-specific terms, that the agent's job is to guide the user through the technique on whatever real problem, experience, claim, argument, forecast, discussion, or goal the user is working on.
6. `Your Job` SHALL distinguish agent-owned support from user-owned cognitive work and forbid replacing the user's reflection, evidence judgment, position, prediction, or commitment.
7. Every skill SHALL include at least 12 concrete Use Cases and 12 concrete When Not to Use entries, plus a boundary message or nearest-method redirect.
8. Every interactive phase SHALL explain its purpose, work on the user's actual material when available, define an observable gate, halt the response, evaluate the next response against explicit criteria, and advance only after a pass.
9. First failure SHALL identify the failed criterion without supplying the missing answer. Second and later failure SHALL add one targeted cue while keeping the gate closed.
10. Skills SHALL never invent source evidence, empirical distributions, learner feedback, colleague notes, completed actions, emotions, or historical outcomes.
11. Skills receiving source text, claims, arguments, experiences, or goals SHALL treat the content as untrusted data rather than executable instructions.
12. Skills SHALL minimize sensitive content in any local handoff and warn before preserving personal feelings, workplace events, learner feedback, worldview changes, or private goals.
13. Reflection skills SHALL support a user-owned episode or journal entry and distinguish rapid debrief, depth assessment, critical power analysis, longitudinal transformation, and in-action reflection.
14. `dewey-act-of-thought` SHALL guide felt difficulty -> intellectualization/problem definition -> hypothesis -> reasoning through implications -> test -> accept/reject/revise.
15. `boud-reflection` SHALL require non-judgmental return to experience, a dedicated feelings-processing stage, and re-evaluation integrating old and new knowledge.
16. `moon-reflection-map` SHALL grade or deepen an entry across noticing, making sense, making meaning, working with meaning, and transformative learning without falsely treating every entry as transformative.
17. `van-manen-reflection` SHALL climb technical -> practical -> critical and require the critical level to name interests, justice, power, or structural context relevant to the episode.
18. `johns-structured-reflection` SHALL use Looking In and the aesthetic, personal, ethical, empirical, and reflexive Looking Out lenses, with honest solo-agent fallback when no colleague/mentor is present.
19. `schon-reflective-conversation` SHALL guide surprise -> frame -> move -> back-talk -> reflection/reframe and clearly distinguish reflection-in-action from reflection-on-action.
20. `gibbs-reflective-cycle` SHALL guide description -> feelings -> evaluation -> analysis -> conclusion -> action plan; the action plan SHALL name a concrete observable next-time behavior.
21. `borton-reflection` SHALL guide What? -> So What? -> Now What? and require at least one actionable commitment in Now What.
22. `brookfield-four-lenses` SHALL require distinct evidence for autobiography, learners' eyes, colleagues' experiences, and scholarly literature, while allowing an incomplete/pending lens rather than fabricated evidence.
23. `mezirow-perspective-transformation` SHALL treat the ten-stage arc as longitudinal and appropriate only for a genuine disorienting dilemma; it SHALL map current evidence and next inquiry rather than force all stages in one session.
24. Critical-thinking skills SHALL apply to a specific user-supplied or clearly scoped claim/argument and distinguish decomposition, evaluation, evidence weighting, comprehensive ability auditing, and deliberative practice.
25. `toulmin-model` SHALL elicit claim, grounds, warrant, backing, qualifier, and rebuttal, with special scrutiny of the warrant as inferential bridge.
26. `baloney-detection-kit` SHALL apply the primary-source evidentiary tools and fallacy screen to one claim; exact tool/fallacy counts and labels SHALL be verified before authoring and SHALL not be invented from secondary summaries.
27. `paul-elder-framework` SHALL inventory all eight Elements of Thought and evaluate relevant elements against all nine Intellectual Standards without requiring a meaningless 72-cell pass/fail grid when narrative evidence is stronger.
28. `community-philosophical-inquiry` SHALL be participant-led and symmetric: participants generate questions, offer reasons/challenges/examples, revise positions, and reflect on inquiry quality. The agent SHALL act as co-inquirer/facilitator, not final authority.
29. `lamp-argument-mapping` SHALL distinguish a single argument map from LAMP's longitudinal deliberate-practice method, persist or summarize repeated maps, and assess mapping quality over time.
30. `reference-class-forecasting` SHALL require a defensible reference class and actual distributional data, capture an intuitive forecast, state predictive validity or an honest range/unknown, and regress transparently toward the base-rate mean.
31. `fisher-scriven-analysis` SHALL identify conclusion, reasons, assumptions, and counter-considerations, then separately judge premise acceptability and inferential sufficiency before an overall judgment.
32. `halpern-argument-analysis` SHALL use the source-verified protocol and end with an explicit accept/reject/suspend disposition justified by the analysis.
33. `ennis-critical-thinking` SHALL cover clarification, credibility/basis, deduction, induction, supposition/consider-the-opposite, and auxiliary self-monitoring using source-verified categories.
34. `twardy-evidence-mapping` SHALL add credibility and relevance judgments to evidence nodes and derive an auditable net-support judgment. It SHALL not invent a numeric upward-propagation equation if the authoritative source does not define one.
35. Goal skills SHALL work on a real user goal and distinguish goal difficulty/specification, situational cue-response planning, and mental contrasting.
36. `goal-setting-theory` SHALL produce a quantified specific difficult goal, verify commitment and task complexity, define feedback, and log progress; “90th percentile” SHALL be framed as a source-grounded difficulty target, not universal unsafe advice.
37. `implementation-intentions` SHALL form an executable `If <specific cue>, then I will <specific response>` plan and test cue visibility, response feasibility, and direct goal linkage.
38. `mental-contrasting` SHALL guide wish -> vivid positive outcome -> present internal obstacle/reality -> explicit juxtaposition, and SHALL stop before an if-then plan unless the user elects a `/woop` handoff.
39. Standalone implementation-intention and mental-contrasting skills SHALL explain their boundary with `/woop`; explicit standalone invocation SHALL win.
40. Every skill SHALL offer a concise orientation naming the method, origin, fit, neighboring alternative, phases, estimated effort, and what the user must produce.
41. Every skill SHALL provide a final inline synthesis or local Markdown handoff that separates user-authored input from agent-generated structure/evaluation.
42. Longitudinal skills—Mezirow, LAMP, goal setting, and optionally Brookfield/Johns follow-up—SHALL define resumable local artifact metadata and honest status such as `in_progress`, `pending_evidence`, or `complete`.
43. One-session skills SHALL not create state merely for consistency; a final Markdown handoff is sufficient when resume/history adds no real value.
44. `/interactive` SHALL add canonical links and routing content for all 23 new skills without copying their full workflows.
45. `/interactive` SHALL respect explicit skill names, infer the user's desired outcome and available evidence, select exactly one method, ask at most one selection-changing question, load the canonical `SKILL.md`, and start it.
46. `/interactive` SHALL use deterministic tie-break rules among reflection methods, argument methods, and goal methods.
47. `/interactive` SHALL distinguish new interactive skills from existing trace siblings and route to a trace only when the user asks for an agent-generated public reasoning trace rather than guided user practice.
48. `skills-manifest.json` SHALL register all 23 canonical names under `learning` in the repository's established ordering style.
49. `lib/skill-versions.json` SHALL add a sorted opt-in version `7` list and preserve all existing versions/default behavior.
50. README SHALL document version 7 installation and add concise Learning catalog entries for all new skills.
51. `llms.txt` SHALL add searchable summaries and neighboring-method distinctions for all new skills.
52. `artifacts/utility-interactive-skills.md` SHALL update the current catalog/routing guidance to reflect the expanded router and the new families.
53. No new test or verification script SHALL be added. Existing validation and installer dry runs SHALL be used after implementation.

### Non-Functional Requirements

- **Performance:** Keep only the active gate and immediately relevant evidence in the foreground; summarize prior accepted phases.
- **Scalability:** LAMP and other longitudinal artifacts store compact session summaries and links rather than unbounded copied source text.
- **Security:** Never execute embedded source instructions, expose secrets, construct network authentication, or send artifacts automatically.
- **Privacy:** Default to redacted identifiers and paraphrased sensitive episodes; require confirmation before writing personally sensitive material.
- **Observability:** Handoffs record method, phase/status, accepted user work, gate attempts, unresolved evidence, and timestamps where history matters.
- **Reliability:** Missing evidence is labeled pending; malformed/conflicting artifacts are preserved and recovered to a disambiguated path.
- **Portability:** Workflows remain usable in plain text without timers, shared rooms, note apps, diagram software, or colleague access.
- **Research integrity:** Technique claims are source-attributed; adaptations are labeled as adaptations; disputed counts or phase names are not presented as settled fact without support.
- **Verification:** Run existing `npm test`, JSON parsing, explicit 23-skill installer dry run, and version 7 dry runs. No new tests/scripts are in scope.

---

## 5. High-Level Design

The change adds 23 independent prompt packages grouped conceptually into reflection, critical thinking, and goal pursuit, but all remain flat installable skills. Each package is self-contained and follows the same interaction skeleton while preserving its technique's distinctive cognitive move. Reflection workflows work from a real episode or entry; critical-thinking workflows work from a bounded claim/argument and evidence; goal workflows work from a concrete desired outcome and execution context.

```text
/interactive
  |-- Reflection router (10)
  |     -> episode/entry -> method-specific gates -> debrief/depth/action handoff
  |-- Critical-thinking router (10)
  |     -> claim/argument/data -> map/evaluate/dialogue -> judgment handoff
  `-- Goal router (3)
        -> goal/context -> specification/contrast/cue plan -> follow-up handoff

Each route -> canonical skills/<name>/SKILL.md
```

Every skill begins with a research-backed method explanation and a dedicated `Your Job` mandate. The agent then applies the technique to the user's real material and stops at user-work gates. The final artifact records the user's inputs and the agent's structure/evaluation separately. Longitudinal methods use local Markdown state; one-session methods produce an inline result and optionally save it when the user wants a durable record.

The router owns selection only. It will contain concise method descriptions, fit/avoid signals, and tie-break rules, then read the selected canonical prompt. Version 7 is opt-in to avoid changing default installs and to keep this large batch separate from versions 5 and 6.

---

## 6. Detailed Design

### 6.1 Shared Research and Skill Contract

**File(s):** All 23 new `skills/<name>/SKILL.md` files  
**Type:** New files

#### What it does

Defines the required research-before-authoring and interactive structure shared by the batch without introducing a runtime shared file dependency.

#### Interface / API

```text
Frontmatter -> Identity -> Goal -> Origin and Mechanism -> Model Behavior
-> Your Job -> Use Cases -> When Not to Use -> Invocation -> Orientation
-> Interaction Contract -> Gated Phases -> Modes/State -> Final Handoff
-> Failure Modes -> Success Criteria
```

#### Logic / Algorithm

1. Open the primary publication or closest authoritative source for the next skill only.
2. Confirm attribution, canonical terminology, stage order/count, mechanism, and known adaptations.
3. Record source title/author/year in the skill and mark adaptations explicitly.
4. Write substantial method-specific context and the dedicated `Your Job` mandate.
5. Define observable gates, pass criteria, retry/hint rules, and literal halts for the user's real work.
6. Define a privacy-aware handoff and persistence only where it adds value.
7. Complete and self-review that skill before beginning research/authoring for the next skill.

#### Edge Cases & Error Handling

- If primary and secondary descriptions conflict, use the primary terminology and note the adaptation rather than silently merging protocols.
- If the primary source cannot support an exact count/formula, remove the unsupported precision or label a transparent operational adaptation.
- If a source is inaccessible, stop that individual skill's authoring and use a recognized authoritative edition or scholarly treatment before proceeding.

### 6.2 Reflection Skills

**File(s):** `skills/dewey-act-of-thought/SKILL.md`, `skills/boud-reflection/SKILL.md`, `skills/moon-reflection-map/SKILL.md`, `skills/van-manen-reflection/SKILL.md`, `skills/johns-structured-reflection/SKILL.md`, `skills/schon-reflective-conversation/SKILL.md`, `skills/gibbs-reflective-cycle/SKILL.md`, `skills/borton-reflection/SKILL.md`, `skills/brookfield-four-lenses/SKILL.md`, `skills/mezirow-perspective-transformation/SKILL.md`  
**Type:** New files

#### What it does

Provides ten distinct ways to inquire into an experience, grade reflective depth, interrogate assumptions/power, or follow a longitudinal perspective change.

#### Interface / API

| Skill | Invocation | Primary source to verify before authoring | Signature gate/output |
|---|---|---|---|
| Dewey | `/dewey-act-of-thought [episode|problem]` | Dewey, *How We Think* (1910/1933) | Defined problem, hypothesis implications, real test, accept/reject/revise |
| Boud | `/boud-reflection [episode]` | Boud, Keogh & Walker, *Reflection: Turning Experience into Learning* (1985) | Non-judgmental replay, processed feelings, integrated re-evaluation |
| Moon | `/moon-reflection-map [entry] [--assess|--deepen]` | Moon, *Reflection in Learning and Professional Development* (1999) | Evidence-based depth rating plus one-step rewrite/deepening |
| van Manen | `/van-manen-reflection [episode]` | van Manen, “Linking Ways of Knowing with Ways of Being Practical” (1977) | Technical, practical, and critical responses on one episode |
| Johns | `/johns-structured-reflection [episode] [--with-colleague-notes]` | Johns' structured reflection publications (1994/1995) and Carper (1978) | Looking In plus five distinct knowing lenses |
| Schön | `/schon-reflective-conversation [situation] [--in-action|--on-action]` | Schön, *The Reflective Practitioner* (1983) | Surprise, frame, move, back-talk, reflect/reframe |
| Gibbs | `/gibbs-reflective-cycle [episode]` | Gibbs, *Learning by Doing* (1988) | Six-stage debrief ending in observable next-time behavior |
| Borton | `/borton-reflection [episode] [--quick]` | Borton, *Reach, Touch, and Teach* (1970) | What/So What/Now What with actionable commitment |
| Brookfield | `/brookfield-four-lenses [practice]` | Brookfield, *Becoming a Critically Reflective Teacher* (1995) | Four evidence-distinct lenses; pending status for unavailable lenses |
| Mezirow | `/mezirow-perspective-transformation [dilemma] [--resume|--map]` | Mezirow, *Transformative Dimensions of Adult Learning* (1991) and foundational work | Evidence-backed longitudinal stage map and next inquiry/action |

#### Logic / Algorithm

1. Confirm a real episode, entry, practice, surprise, or dilemma and assess method fit.
2. Orient the user and distinguish the nearest alternative.
3. Move through the canonical phases or rubric one at a time, preserving user language.
4. Require evidence/specificity at each gate; feelings are never inferred.
5. Produce an action, depth judgment, reframing decision, pending-evidence plan, or transformation map appropriate to the method.
6. Save longitudinal state only for Mezirow and evidence-collection follow-ups; otherwise offer a concise Markdown handoff.

#### Edge Cases & Error Handling

- A user may decline to discuss feelings or sensitive details; the skill accepts redacted labels and does not pressure disclosure.
- Moon assesses the entry's demonstrated depth, not the writer's intelligence or character.
- Johns does not impersonate a colleague; it can act as a structured dialogue partner and label missing external perspective.
- Brookfield never fabricates learner feedback, peer evidence, or literature; unavailable lenses remain pending.
- Mezirow does not pathologize ordinary discomfort or manufacture a transformation arc.
- Schön in-action mode must not distract from safety-critical live work; it falls back to on-action reflection.

### 6.3 Argument Decomposition and Evaluation Skills

**File(s):** `skills/toulmin-model/SKILL.md`, `skills/baloney-detection-kit/SKILL.md`, `skills/paul-elder-framework/SKILL.md`, `skills/fisher-scriven-analysis/SKILL.md`, `skills/halpern-argument-analysis/SKILL.md`, `skills/ennis-critical-thinking/SKILL.md`  
**Type:** New files

#### What it does

Guides the user through structural decomposition, evidentiary screening, standards-based auditing, inferential evaluation, and final disposition of a bounded argument or claim.

#### Interface / API

| Skill | Invocation | Primary source to verify before authoring | Signature gate/output |
|---|---|---|---|
| Toulmin | `/toulmin-model [argument]` | Toulmin, *The Uses of Argument* (1958) | Six labeled components with defensible warrant |
| Sagan | `/baloney-detection-kit [claim]` | Sagan, *The Demon-Haunted World* (1995) | Source-accurate tool checklist and fallacy findings |
| Paul–Elder | `/paul-elder-framework [reasoning]` | Paul & Elder, Foundation for Critical Thinking framework texts | Eight elements, nine-standards audit, reconstructed reasoning |
| Fisher–Scriven | `/fisher-scriven-analysis [argument]` | Fisher & Scriven, *Critical Thinking: Its Definition and Assessment* (1997) | Acceptability and sufficiency judgments kept separate |
| Halpern | `/halpern-argument-analysis [argument]` | Halpern, *Thought and Knowledge* authoritative edition | Full analysis ending accept/reject/suspend |
| Ennis | `/ennis-critical-thinking [claim|argument]` | Ennis' critical-thinking taxonomy/publications | Six source-verified ability categories and overall judgment |

#### Logic / Algorithm

1. Bound the exact claim/argument and identify missing context.
2. Teach only the current framework component and demonstrate on a neutral analogous example when revealing the answer would bypass user work.
3. Require the user to label or judge the current component against explicit criteria.
4. Check evidence provenance, distinguish missing from false, and keep decomposition separate from evaluation where the framework requires it.
5. Produce a structured argument/evidence artifact and an uncertainty-aware final judgment.

#### Edge Cases & Error Handling

- Descriptive text with no arguable conclusion receives a fit correction before analysis.
- A missing warrant, premise, or source remains explicitly missing; the agent does not manufacture it.
- Sagan's source-verified checklist controls labels/counts even if common web summaries differ.
- Paul–Elder applies every standard meaningfully but avoids performative matrix filling with no evidence.
- Halpern's disposition may be `suspend`; the skill never pressures a binary verdict.
- High-stakes medical/legal/financial claims require current authoritative evidence and appropriate professional boundaries.

### 6.4 Dialogical, Mapping, and Forecasting Skills

**File(s):** `skills/community-philosophical-inquiry/SKILL.md`, `skills/lamp-argument-mapping/SKILL.md`, `skills/reference-class-forecasting/SKILL.md`, `skills/twardy-evidence-mapping/SKILL.md`  
**Type:** New files

#### What it does

Provides symmetric collaborative inquiry, deliberate argument-mapping practice, outside-view forecasting, and evidence-weighted map evaluation.

#### Interface / API

| Skill | Invocation | Primary source to verify before authoring | Signature gate/output |
|---|---|---|---|
| Community inquiry | `/community-philosophical-inquiry [stimulus|question]` | Lipman & Sharp's Philosophy for Children/community-of-inquiry works | Participant question, reason, challenge, example, revised position |
| LAMP | `/lamp-argument-mapping [text] [--new|--review|--history]` | van Gelder's LAMP/argument-mapping publications | Recursive map plus longitudinal rubric/history |
| Reference class | `/reference-class-forecasting [project|forecast]` | Kahneman & Tversky outside-view/reference-class work and authoritative forecasting treatment | Reference class data, intuitive estimate, validity, regressed forecast |
| Twardy | `/twardy-evidence-mapping [claim]` | Twardy's argument-mapping research/publication | Credibility/relevance weighted evidence map and auditable net support |

#### Logic / Algorithm

1. Validate the stimulus, argumentative text, forecast target, or contention.
2. For Community Inquiry, let the user generate/select the question and make the agent one reason-giving, revisable participant.
3. For mapping skills, build contention, reasons, objections, co-premises, and source pointers recursively while preserving user judgments at gates.
4. For forecasting, require actual comparable-case data and show the regression calculation transparently.
5. For longitudinal LAMP, record rubric results and select a next mapping weakness for practice.
6. Produce a dialogue record, map, practice history entry, or forecast sheet without overstating certainty.

#### Edge Cases & Error Handling

- Community Inquiry with only user and agent is labeled a two-participant simulation, not a real community consensus.
- LAMP requires repeated practice; one map is saved as session 1 and not marketed as completion of LAMP.
- Copyrighted source arguments use pointers and short excerpts rather than reproducing full texts.
- Reference classes that are too broad, selected after seeing outcomes, or unsupported by data fail the gate.
- Unknown predictive validity is reported as unknown or sensitivity-tested, not guessed as a precise coefficient.
- Twardy weights are ordinal or numeric only when source/skill defines their interpretation; net support remains reproducible from recorded judgments.

### 6.5 Goal Pursuit Skills

**File(s):** `skills/goal-setting-theory/SKILL.md`, `skills/implementation-intentions/SKILL.md`, `skills/mental-contrasting/SKILL.md`  
**Type:** New files

#### What it does

Guides users to formulate difficult specific goals with feedback, bind situational cues to responses, or create commitment through mental contrast.

#### Interface / API

| Skill | Invocation | Primary source to verify before authoring | Signature gate/output |
|---|---|---|---|
| Goal setting | `/goal-setting-theory [goal] [--review|--history]` | Locke & Latham's goal-setting theory papers/books, including 2002 review | Quantified difficult goal, commitment, feedback measure, progress log |
| Implementation intentions | `/implementation-intentions [goal] [--refine]` | Gollwitzer, “Implementation Intentions” (1999) | Specific cue-response if-then plan and feasibility test |
| Mental contrasting | `/mental-contrasting [wish] [--followup]` | Oettingen, Pak & Schnetter (2001) and authoritative mental-contrasting work | Wish/outcome/obstacle juxtaposition and commitment decision |

#### Logic / Algorithm

1. Establish a real goal/wish and screen for controllability, safety, complexity, and method fit.
2. Teach the method's mechanism and distinguish it from its neighboring goal techniques.
3. Gate the user's specific goal, cue-response link, or wish/outcome/obstacle content one phase at a time.
4. Test specificity, difficulty/feasibility, commitment, cue observability, response directness, and obstacle honesty as applicable.
5. Create a local handoff with progress/follow-up fields where repeated execution matters.

#### Edge Cases & Error Handling

- Difficult goals are calibrated to skill, resources, task complexity, and safety; 90th-percentile difficulty is not blindly imposed.
- Learning goals replace performance goals for complex novel tasks when source guidance supports that distinction.
- Implementation intentions do not use vague cues such as “when I feel like it” or responses that merely restate the goal.
- Mental contrasting distinguishes an internal obstacle from an uncontrollable external barrier and does not append a plan unless handing off to `/woop`.
- Clinical, self-harm, eating-disorder, or coercive goals are not optimized through these workflows.

### 6.6 `/interactive` Router Expansion

**File(s):** `skills/interactive/SKILL.md`  
**Type:** Modified

#### What it does

Adds the 23 canonical methods to the installed interactive catalog and selects one without reimplementing it.

#### Interface / API

```text
/interactive [goal, episode, claim, text, forecast, or wish]
Selected: /<skill> — <one-sentence fit reason>.
```

#### Logic / Algorithm

1. Preserve explicit installed-skill selection as highest priority.
2. Classify the desired work as source learning/memory (existing routes), reflection, critical thinking, dialogical/mapping/forecasting, or goal pursuit.
3. Use family-level tie-breaks:
   - Reflection: Borton for fastest debrief; Gibbs for comprehensive chronological debrief; Boud when affect processing is central; Dewey for inquiry/testing; Moon for depth scoring; van Manen for technical/practical/critical depth; Johns for knowing lenses/mentor dialogue; Brookfield for four external evidence lenses; Schön for live surprise/back-talk; Mezirow only for longitudinal worldview change.
   - Critical thinking: Toulmin for warrant-centered decomposition; Fisher–Scriven for acceptability/sufficiency; Halpern when a final disposition is required; Paul–Elder for elements/standards; Ennis for broad ability audit; Sagan for empirical-claim/fallacy screening; Community Inquiry for symmetric dialogue; LAMP for repeated mapping practice; Twardy for weighted evidence mapping; reference-class forecasting for predictive estimates.
   - Goals: Locke–Latham for goal difficulty/specificity/feedback; implementation intentions for cue-response execution; mental contrasting for commitment through obstacle juxtaposition; `/woop` when the user wants both contrasting and an if-then plan.
4. Ask at most one question only when the answer changes the route.
5. Verify/read the canonical skill file and start its orientation/gate using existing conversation material.
6. Preserve missing-skill behavior and never recreate a missing workflow from router summaries.

#### Edge Cases & Error Handling

- When several methods could fit, state the chosen signature criterion rather than stacking them.
- Explicit standalone mental contrasting or implementation intentions overrides `/woop` routing.
- Requests for public agent-generated traces route to trace siblings only after explaining the practice-versus-trace distinction.
- No-match behavior remains valid for tasks outside the installed catalog.

### 6.7 Catalog, Bundle, and Authoring Artifact

**File(s):** `skills-manifest.json`, `lib/skill-versions.json`, `README.md`, `llms.txt`, `artifacts/utility-interactive-skills.md`  
**Type:** Modified

#### What it does

Registers, bundles, documents, and explains the expanded interactive catalog.

#### Interface / API

```json
"7": [
  "baloney-detection-kit",
  "borton-reflection",
  "boud-reflection",
  "brookfield-four-lenses",
  "community-philosophical-inquiry",
  "dewey-act-of-thought",
  "ennis-critical-thinking",
  "fisher-scriven-analysis",
  "gibbs-reflective-cycle",
  "goal-setting-theory",
  "halpern-argument-analysis",
  "implementation-intentions",
  "johns-structured-reflection",
  "lamp-argument-mapping",
  "mental-contrasting",
  "mezirow-perspective-transformation",
  "moon-reflection-map",
  "paul-elder-framework",
  "reference-class-forecasting",
  "schon-reflective-conversation",
  "toulmin-model",
  "twardy-evidence-mapping",
  "van-manen-reflection"
]
```

#### Logic / Algorithm

1. Add all canonical names to the Learning manifest without disturbing existing categories.
2. Add the sorted version 7 bundle and preserve versions 1–6.
3. Document version 7 install commands and 23 concise skill entries in README.
4. Add searchable, differentiating entries to `llms.txt`.
5. Update the utility-interactive artifact's Current Catalog, routing family guidance, and creation examples without duplicating all prompt content.

#### Edge Cases & Error Handling

- JSON arrays must contain exact folder/frontmatter names and no duplicates.
- Existing version bundles remain byte-semantically unchanged except the new top-level version 7 key.
- Catalog wording must distinguish standalone mental contrasting/implementation intentions from `/woop` and interactive practice from trace siblings.

### 6.8 Design Document

**File(s):** `docs/design/interactive-reflection-critical-thinking-goal-skills.md`  
**Type:** New file

#### What it does

Serves as the approved source of truth for implementation, research order, file scope, and refinement.

#### Interface / API

N/A - Design documentation only.

#### Logic / Algorithm

1. Commit this document first in the isolated implementation worktree.
2. Implement only the approved manifest.
3. Reconcile original request, design requirements, and every skill during refinement.

#### Edge Cases & Error Handling

- Any canonical-name, protocol, or source change discovered during individual research is documented in the design or PR before implementation diverges.

---

## 7. Data Model Changes

### 7.1 Longitudinal Interactive Handoff Metadata

**Change type:** New local Markdown artifact convention; no application/database schema change

```yaml
schema_version: 1
method: lamp-argument-mapping | mezirow-perspective-transformation | goal-setting-theory | other
subject: redacted-or-user-approved-string
status: in_progress | pending_evidence | complete
current_phase: string
created_at: ISO-8601
updated_at: ISO-8601
source_pointers: []
```

The body separates `User-authored work`, `Agent structure/evaluation`, `Pending evidence`, and `Next gate/follow-up`. One-session methods may emit the same separation inline without writing a file.

**Migration strategy:** New optional artifacts only. Existing files are never migrated automatically. Name conflicts resume a validated matching artifact or create a disambiguated path; malformed files are preserved.

---

## 8. API Changes

N/A - This change adds prompt invocation grammars, installer catalog entries, and optional local Markdown handoffs. It adds no HTTP endpoint, authenticated CLI command, backend payload, or public JavaScript/Python API.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|---|---|---|
| CREATE | `docs/design/interactive-reflection-critical-thinking-goal-skills.md` | Approved design and research contract |
| CREATE | `skills/dewey-act-of-thought/SKILL.md` | Dewey five-phase inquiry workflow |
| CREATE | `skills/boud-reflection/SKILL.md` | Boud–Keogh–Walker affect-centered reflection |
| CREATE | `skills/moon-reflection-map/SKILL.md` | Moon reflective-depth assessment/deepening |
| CREATE | `skills/van-manen-reflection/SKILL.md` | Technical/practical/critical reflection |
| CREATE | `skills/johns-structured-reflection/SKILL.md` | Looking In/Out knowing-lenses workflow |
| CREATE | `skills/schon-reflective-conversation/SKILL.md` | Surprise/frame/move/back-talk workflow |
| CREATE | `skills/gibbs-reflective-cycle/SKILL.md` | Six-stage reflective debrief |
| CREATE | `skills/borton-reflection/SKILL.md` | What/So What/Now What debrief |
| CREATE | `skills/brookfield-four-lenses/SKILL.md` | Four-source critical reflection |
| CREATE | `skills/mezirow-perspective-transformation/SKILL.md` | Longitudinal transformation mapping |
| CREATE | `skills/toulmin-model/SKILL.md` | Six-component warrant-centered analysis |
| CREATE | `skills/baloney-detection-kit/SKILL.md` | Sagan evidence/fallacy screen |
| CREATE | `skills/paul-elder-framework/SKILL.md` | Elements-and-standards audit |
| CREATE | `skills/community-philosophical-inquiry/SKILL.md` | Symmetric participant-led reasoning dialogue |
| CREATE | `skills/lamp-argument-mapping/SKILL.md` | Longitudinal argument-mapping practice |
| CREATE | `skills/reference-class-forecasting/SKILL.md` | Outside-view forecast adjustment |
| CREATE | `skills/fisher-scriven-analysis/SKILL.md` | Acceptability/sufficiency argument evaluation |
| CREATE | `skills/halpern-argument-analysis/SKILL.md` | Analysis plus accept/reject/suspend disposition |
| CREATE | `skills/ennis-critical-thinking/SKILL.md` | Comprehensive critical-thinking abilities audit |
| CREATE | `skills/twardy-evidence-mapping/SKILL.md` | Credibility/relevance weighted map |
| CREATE | `skills/goal-setting-theory/SKILL.md` | Specific difficult goal and feedback loop |
| CREATE | `skills/implementation-intentions/SKILL.md` | Situational cue-response planning |
| CREATE | `skills/mental-contrasting/SKILL.md` | Wish/outcome/obstacle contrast |
| MODIFY | `skills/interactive/SKILL.md` | Route to all 23 canonical skills |
| MODIFY | `skills-manifest.json` | Register 23 Learning skills |
| MODIFY | `lib/skill-versions.json` | Add opt-in version 7 bundle |
| MODIFY | `README.md` | Document version 7 and new skills |
| MODIFY | `llms.txt` | Add searchable skill summaries/distinctions |
| MODIFY | `artifacts/utility-interactive-skills.md` | Update interactive catalog and authoring guidance |

No files will be deleted.

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|---|---|---|---|
| Existing skill installer/validator | Repository version | Discovery, metadata validation, explicit installs, version bundle dry runs | Name/registration mismatch causes validation failure |
| Primary publications/authoritative editions | Source-specific; research-time only | Verify attribution, protocol, terminology, and adaptations before each skill | Paywalls or variant editions may require an authoritative alternative and explicit note |
| Host file capabilities | Harness-dependent | Optional local handoffs, resume/history, source reading | Missing capability requires inline/manual fallback |
| Host web/search capabilities | Harness-dependent | Brookfield literature lens and current high-stakes evidence | Missing access leaves evidence pending; no invented sources |
| Existing trace siblings | Installed independently | Nearby alternative when the user wants agent-generated trace output | Router must not assume installation or conflate trace with practice |

No runtime package or external service dependency is added.

---

## 11. Rollout & Deployment

- After explicit approval, update local `main` from `origin/main` only if the checkout is clean as required by the workflow, then create `feat/interactive-reflection-critical-thinking-goal-skills` in an isolated worktree.
- Commit this design document before implementation files.
- Research and implement each skill individually; complete one skill's source verification, prompt, and self-review before starting the next.
- Commit in logical groups (reflection, critical-thinking, goal skills, then router/catalog integration) while retaining per-skill research traceability in commit content or prompt source notes.
- Run `npm test`, parse both JSON files, run an explicit comma-separated 23-skill dry run, and run version 7 dry runs through the general and learning installers.
- Version 1 remains the default. Users opt in via explicit skill name, `--version 7`, or `--version all`.
- Rollback reverts repository files and the version 7 catalog; it never deletes user-created reflection, mapping, forecast, or goal artifacts.

---

## 12. Open Questions

- [x] Sagan uses nine positive evidentiary tools and a 20-item fallacy list in the implemented source treatment; the skill names all 20 and requires mechanism-level evidence rather than label matching.
- [x] The reviewed Twardy treatment did not justify inventing a universal numeric propagation equation; the skill records credibility and relevance rationales and requires a reproducible, explicitly defined aggregation.
- [x] Mezirow uses the standard ten-stage sequence from disorienting dilemma through reintegration; the implementation keeps all ten visible and permits longitudinal `in_progress` status.
- [x] Moon's five-stage learning map is operationalized as an evidence-based depth assessment while avoiding claims that every entry reaches transformation; the skill does not conflate a depth rating with the writer's ability or character.

These research-resolution questions were closed before the affected skills were finalized.

---

## 13. Alternatives Considered

### Alternative 1: Three large family skills

- What: Build one reflection skill, one critical-thinking skill, and one goal skill with technique modes.
- Why rejected: It weakens automatic activation, makes canonical method boundaries harder to audit, and conflicts with the request that each technique be written individually.

### Alternative 2: Add modes to existing trace skills

- What: Extend `argument-map-trace`, `reference-class-forecasting-trace`, and `double-loop-learning-trace` with interactive gates.
- Why rejected: Trace skills produce agent-owned public reasoning artifacts; these new skills require user-owned practice gates and different activation/interaction contracts.

### Alternative 3: Fold mental contrasting and implementation intentions into `/woop`

- What: Use only the existing WOOP workflow because it combines both mechanisms.
- Why rejected: The user explicitly requested each technique individually. Standalone methods are useful when commitment formation or action initiation is the only problem, while `/woop` remains the combined route.

### Alternative 4: One-shot worksheets

- What: Emit a complete template containing all questions in one response.
- Why rejected: This bypasses phased instruction, permits shallow completion, prevents criteria-based feedback, and violates the repository's interactive utility contract.

### Alternative 5: Reuse the research artifact without source checks

- What: Treat `artifacts/learning-strategies-research.md` as final authority and implement all prompts from its summaries.
- Why rejected: The artifact itself reports mixed source types and several techniques have terminology, count, or adaptation ambiguities. The user explicitly requested research before each implementation.
