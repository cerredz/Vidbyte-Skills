# Design Doc: Three Learning Skill PR Batches

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-14
**Last Updated:** 2026-05-14

---

## 1. Overview

Create three independent pull requests, each containing 25 new Vidbyte skills. The PRs are split by the natural skill boundaries in `artifacts/create-skill-guide.md`:

1. PR 1: cognitive-friction skills that make the user think a little harder before the model proceeds.
2. PR 2: background learning-metric skills that silently track patterns for later learning use.
3. PR 3: input-mode slash skills that optimize responses for specific user input types.

This design doc is intentionally a meta-design for all three PRs. After approval, each PR branch will include the subset of 25 skills for that PR and may include this design doc as the shared implementation plan.

---

## 2. Goals & Non-Goals

### Goals

- Create 75 total new skill folders under `skills/`, with exactly one required `SKILL.md` in each folder.
- Split implementation into three PRs of 25 skills each.
- Keep every skill lowercase hyphen-case and self-contained.
- Avoid installer, validation, CLI, and backend changes unless a skill absolutely requires them.
- Ground the learning design in research on active learning, self-explanation, productive failure, retrieval practice, feedback, and self-regulated learning.
- Include a public rationale trace before each ideation batch in the design and implementation notes.
- Preserve a low-friction user experience: cognitive-friction skills should add productive friction, not generic obstruction.

### Non-Goals

- Do not expose hidden chain-of-thought. Public rationale traces will summarize design reasoning without private reasoning tokens.
- Do not modify `lib/`, `bin/`, `scripts/`, or `cli/` in this batch.
- Do not add new backend endpoints.
- Do not create README files inside individual skill folders.
- Do not add `agents/openai.yaml` metadata unless later requested.
- Do not replace existing skills such as `question`, `research`, `mental-model`, `counterargument`, `anti-passive`, `compression-check`, `feedback-generator`, `misconceptions`, or `daily-review`.

---

## 3. Background & Context

The repository discovers skills automatically from `skills/<name>/SKILL.md`. Validation only requires YAML frontmatter, a matching hyphen-case folder/name, a non-empty description, and a non-empty body. The current architecture favors prompt-only skills when possible.

The repo's `artifacts/create-skill-guide.md` defines three relevant categories:

- Prompt skills: inline response contracts with no persistent state.
- Learning/background skills: session observers that may maintain session-local state or write local artifacts.
- Reasoning trace skills: public scratchpad writers.

The requested work maps most directly to prompt skills and learning/background skills. The first batch intentionally behaves like user-invoked prompt friction: the user asks for a stricter interaction mode, and the model blocks or redirects only within that invocation. The second batch behaves like background observers, but most should remain local-artifact or session-local only to avoid inventing new CLI endpoints. The third batch is a set of slash-command input modes, similar to `question`, `research`, `mental-model`, and `counterargument`.

Research basis:

- Chi and Wylie's ICAP framework distinguishes passive, active, constructive, and interactive engagement, supporting the decision to move users from passive prompting into constructive articulation.
- Chi et al. found that eliciting self-explanations improves understanding, supporting skills that ask users to explain terms, mechanisms, and rationale.
- Productive Failure and problem-solving-before-instruction research supports asking users to attempt, predict, or define success before receiving a full answer.
- Retrieval-practice and desirable-difficulty research supports making the user retrieve, predict, or generate before seeing the model's answer.
- Hattie and Timperley's feedback model and later feedback meta-analysis emphasize that high-information feedback is more useful than generic praise, supporting background metrics that capture specific patterns rather than broad summaries.
- Self-regulated learning research supports monitoring, planning, and reflection scaffolds, but also warns that scaffolds should be adaptive and not over-intrusive.

Sources used during design:

- Chi, M. T. H., & Wylie, R. (2014), ICAP framework, ASU listing: https://education.asu.edu/lcl/publications/chi-m-t-h-wylie-r-2014-icap-framework-linking-cognitive-engagement-active-learning
- Chi, M. T. H., de Leeuw, N., Chiu, M. H., & LaVancher, C. (1994), self-explanation, ASU listing: https://education.asu.edu/lcl/publications/chi-m-t-h-de-leeuw-n-chiu-m-h-lavancher-c-1994-eliciting-self-explanations-0
- Sinha & Kapur (2021), productive failure meta-analysis: https://journals.sagepub.com/doi/10.3102/00346543211019105
- Newman et al. (2019), productive failure in biology: https://www.nature.com/articles/s41539-019-0040-6
- Lim et al. (2023), real-time SRL scaffolds: https://www.sciencedirect.com/science/article/pii/S0747563222003673
- Wisniewski et al. (2020), feedback meta-analysis: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full

---

## 4. Requirements

### Functional Requirements

1. The implementation SHALL create 75 new skill directories under `skills/`.
2. Each skill SHALL contain a valid `SKILL.md` with frontmatter fields `name` and `description`.
3. Each skill name SHALL match its folder name and `^[a-z0-9]+(-[a-z0-9]+)*$`.
4. Each PR SHALL contain exactly 25 skills.
5. PR 1 SHALL contain cognitive-friction skills that make users specify goals, constraints, evidence, assumptions, stakes, mechanisms, or decisions before the model proceeds.
6. PR 2 SHALL contain background learning-metric skills that track struggles, patterns, gaps, or learning signals across a session.
7. PR 3 SHALL contain specific input-mode slash skills such as `/hypothesis`, `/rubric`, or `/source-check`.
8. Every skill SHALL define activation, output behavior, constraints, empty invocation behavior where applicable, and success criteria.
9. Background skills SHALL define state variables, skip rules, artifact behavior, and user-facing output rules.
10. No new skill SHALL call `curl`, construct authentication headers, or invent Vidbyte backend routes.
11. If a background skill writes artifacts, it SHALL use local Markdown files only unless a future design explicitly adds CLI support.
12. Implementation SHALL run `npm test`.

### Non-Functional Requirements

- **Performance:** Prompt-only skills add no runtime code. Background skill prompts should be concise enough not to dominate context.
- **Scalability:** Skills should be independently removable. No registry updates should be required.
- **Security:** No secrets, no arbitrary URLs, no direct backend calls.
- **Reliability:** Every skill should include conservative skip or fallback behavior to avoid disrupting active work.
- **User experience:** Friction skills must ask targeted questions and avoid generic "please clarify" loops.

---

## 5. High-Level Design

The work is decomposed by skill type because each category has different behavior, risk, and review concerns.

```text
Three PRs
  |
  |-- PR 1: Cognitive friction
  |     |-- Prompt/user-invoked skills
  |     |-- Mostly block, redirect, or require articulation
  |
  |-- PR 2: Background learning metrics
  |     |-- Session observers
  |     |-- Mostly silent, local state/artifacts
  |
  |-- PR 3: Input-mode slash skills
        |-- Explicit slash commands
        |-- Structured learning-optimized response formats
```

Key design decisions:

1. Use three PRs by category, not three mixed PRs, because reviewers can evaluate one behavior family at a time.
2. Keep all 75 skills prompt-only in this iteration. That avoids expanding the Python CLI and backend contract for speculative metrics.
3. For background skills, prefer local artifacts or session-local counters. If a future backend wants these metrics, a later PR can add CLI endpoints using the existing `feedback` and `compressor` patterns.
4. Include public rationale traces before each skill batch. These are concise design explanations, not hidden chain-of-thought.

---

## 6. Detailed Design

### PR 1: Cognitive-Friction Skills

**Public rationale trace:** The user wants skills that make prompting slightly harder in ways that improve thinking. The useful friction point is not "ask more questions"; it is "force the missing decision into the open." Each skill should block, narrow, or reshape the request around one cognitive action: define success, expose assumptions, predict outcomes, name evidence, identify stakes, or choose constraints.

Create these 25 skill folders:

1. `success-criteria` - requires observable success conditions before implementation or advice.
2. `constraint-ledger` - forces explicit hard constraints, soft preferences, and unknown constraints.
3. `evidence-before-answer` - requires the user to provide or request evidence before accepting claims.
4. `scope-lock` - makes the user name what is in scope and out of scope before work starts.
5. `tradeoff-token` - requires the user to spend one explicit tradeoff before the model recommends a path.
6. `failure-mode-first` - asks for likely failure modes before proposing a solution.
7. `counterexample-required` - requires at least one case that would break the user's proposed claim.
8. `baseline-check` - asks for current baseline behavior or performance before improving anything.
9. `stakes-check` - asks what happens if the answer is wrong and adjusts rigor accordingly.
10. `definitions-first` - blocks work until key terms are defined in the user's context.
11. `uncertainty-budget` - asks the user to rank what may be assumed versus what must be verified.
12. `assumption-price` - makes each unstated assumption carry an explicit consequence.
13. `decision-owner` - requires the user to identify who decides and who is affected.
14. `falsifiability-check` - converts vague goals into testable or disprovable claims.
15. `premature-solution` - detects solution-first prompts and asks for the underlying problem.
16. `context-debt` - lists missing context that would likely cause rework if skipped.
17. `acceptance-tests-first` - asks for acceptance tests before writing code or plans.
18. `boundary-conditions` - requires edge conditions, limits, and excluded cases.
19. `cost-of-wrong` - asks the user to state the cost of false positives and false negatives.
20. `alternatives-required` - requires at least two plausible alternatives before choosing.
21. `mechanism-before-recommendation` - asks the user to explain the mechanism they think is at work.
22. `prediction-before-explanation` - asks the user to predict the outcome before receiving the explanation.
23. `reversibility-check` - separates reversible from irreversible decisions before action.
24. `stakeholder-lens` - makes the user view the request through affected parties.
25. `hidden-variable-check` - asks what unobserved variables could change the answer.

All PR 1 skills are prompt skills. They produce inline responses only.

### PR 2: Background Learning-Metric Skills

**Public rationale trace:** Background skills should not teach in the moment unless their intervention is clearly valuable. Their main job is to preserve learning signals that disappear from normal conversation: recurring struggles, calibration gaps, vocabulary growth, hesitation patterns, and transfer opportunities. Because new backend endpoints are out of scope, these skills will define local or session-local artifacts and conservative silence rules.

Create these 25 skill folders:

1. `struggle` - captures repeated struggle patterns and writes a session struggle log.
2. `confusion-ledger` - records concepts the user repeatedly asks to re-explain.
3. `recurring-errors` - tracks repeated error types across a session.
4. `decision-drift` - tracks when decisions are reopened without new evidence.
5. `explanation-debt` - records concepts the user used but could not explain.
6. `retrieval-gaps` - tracks failed or missing recall during check-ins.
7. `hesitation-map` - records where the user hesitates, defers, or asks permission.
8. `vocabulary-growth` - logs new domain terms and whether the user used them correctly.
9. `concept-coverage` - tracks major concepts touched and depth of engagement.
10. `calibration-log` - compares user confidence signals against observed correctness.
11. `confidence-mismatch` - records overconfidence and underconfidence moments.
12. `learning-dependencies` - maps prerequisite concepts that keep blocking progress.
13. `focus-switches` - tracks topic switching that may prevent consolidation.
14. `recovery-patterns` - records how the user recovers from errors or confusion.
15. `bottleneck-log` - identifies repeated bottlenecks in workflow or understanding.
16. `question-quality` - tracks whether questions become more precise over time.
17. `feedback-themes` - consolidates repeated feedback points into stable themes.
18. `tool-friction` - records tools, commands, or environments that repeatedly slow the user.
19. `debugging-patterns` - tracks debugging moves the user repeats or skips.
20. `memory-prompts` - stores high-value future review prompts from the session.
21. `misconception-near-misses` - logs almost-wrong statements before they harden.
22. `practice-opportunities` - records moments where a targeted exercise would help.
23. `autonomy-score` - tracks how much work the user delegates versus performs.
24. `transfer-signals` - records when the user applies a concept in a new domain.
25. `learning-momentum` - tracks whether the session is building, stalling, or consolidating.

Most PR 2 skills are background observers. Each must define silence as the default, conservative skip rules, and local artifact behavior if it writes files.

### PR 3: Input-Mode Slash Skills

**Public rationale trace:** Input-mode skills work best when the user knows the kind of thinking they want from the model. These should be explicit slash commands that transform one input type into a learning-optimized response: a hypothesis gets tested, a rubric gets built, a source gets checked, a case gets analyzed, a plan gets reviewed, and so on.

Create these 25 skill folders:

1. `hypothesis` - `/hypothesis <claim>` tests a claim with evidence, predictions, and disconfirmers.
2. `counterexample` - `/counterexample <claim>` generates boundary cases that break a claim.
3. `compare` - `/compare <A> vs <B>` compares options by criteria, tradeoffs, and decision context.
4. `debug-explain` - `/debug-explain <error>` explains an error through cause, diagnosis, and fix path.
5. `teach-back` - `/teach-back <topic>` asks the user to explain first, then evaluates their explanation.
6. `proof` - `/proof <claim>` asks for premises and evaluates whether the conclusion follows.
7. `source-check` - `/source-check <claim or source>` verifies attribution quality and evidence level.
8. `case-study` - `/case-study <topic>` teaches through a real or plausible case.
9. `rubric` - `/rubric <task>` creates evaluation criteria and scoring levels.
10. `decision` - `/decision <choice>` structures a decision with options, criteria, and recommendation.
11. `analogy` - `/analogy <concept>` creates analogies with explicit failure boundaries.
12. `example-ladder` - `/example-ladder <concept>` teaches through examples from simple to complex.
13. `draft-critique` - `/draft-critique <text>` critiques a draft for logic, clarity, and missing context.
14. `plan-review` - `/plan-review <plan>` reviews a plan for gaps, dependencies, and risks.
15. `risk-review` - `/risk-review <idea>` analyzes likely risks and mitigations.
16. `translate-level` - `/translate-level <audience>: <content>` rewrites for a target knowledge level.
17. `socratic` - `/socratic <topic>` teaches by asking sequenced questions instead of explaining first.
18. `blindspots` - `/blindspots <plan or belief>` identifies what the user may be failing to consider.
19. `research-question` - `/research-question <topic>` turns a vague interest into answerable research questions.
20. `define` - `/define <term>` gives definition, boundaries, non-examples, and common confusions.
21. `practice` - `/practice <skill>` creates targeted practice tasks with feedback criteria.
22. `reflection` - `/reflection <experience>` turns an experience into lessons, patterns, and next actions.
23. `debate` - `/debate <topic>` presents structured opposing cases and adjudication criteria.
24. `field-guide` - `/field-guide <domain>` builds a practical orientation guide for a domain.
25. `what-changed` - `/what-changed <before/after>` explains the meaningful differences and implications.

All PR 3 skills are user-invoked prompt skills. They produce inline responses only and include empty-invocation usage messages.

---

## 7. Data Model Changes

No application data model changes.

Some PR 2 background skills may define local Markdown artifact schemas, such as:

```markdown
# Struggle Log

**Date:** YYYY-MM-DD
**Session:** <slug>

## Observations

### 1 - <pattern>
**Observed:** ...
**Why it matters:** ...
**Suggested practice:** ...
```

These are prompt-level artifact formats, not app schemas.

---

## 8. API Changes

N/A - no installer, CLI, backend, or public API changes.

---

## 9. File Change Manifest

### Files to Create

This design phase creates:

- `docs/design/learning-skill-pr-batches.md`

Implementation will create 75 skill files:

- `skills/success-criteria/SKILL.md`
- `skills/constraint-ledger/SKILL.md`
- `skills/evidence-before-answer/SKILL.md`
- `skills/scope-lock/SKILL.md`
- `skills/tradeoff-token/SKILL.md`
- `skills/failure-mode-first/SKILL.md`
- `skills/counterexample-required/SKILL.md`
- `skills/baseline-check/SKILL.md`
- `skills/stakes-check/SKILL.md`
- `skills/definitions-first/SKILL.md`
- `skills/uncertainty-budget/SKILL.md`
- `skills/assumption-price/SKILL.md`
- `skills/decision-owner/SKILL.md`
- `skills/falsifiability-check/SKILL.md`
- `skills/premature-solution/SKILL.md`
- `skills/context-debt/SKILL.md`
- `skills/acceptance-tests-first/SKILL.md`
- `skills/boundary-conditions/SKILL.md`
- `skills/cost-of-wrong/SKILL.md`
- `skills/alternatives-required/SKILL.md`
- `skills/mechanism-before-recommendation/SKILL.md`
- `skills/prediction-before-explanation/SKILL.md`
- `skills/reversibility-check/SKILL.md`
- `skills/stakeholder-lens/SKILL.md`
- `skills/hidden-variable-check/SKILL.md`
- `skills/struggle/SKILL.md`
- `skills/confusion-ledger/SKILL.md`
- `skills/recurring-errors/SKILL.md`
- `skills/decision-drift/SKILL.md`
- `skills/explanation-debt/SKILL.md`
- `skills/retrieval-gaps/SKILL.md`
- `skills/hesitation-map/SKILL.md`
- `skills/vocabulary-growth/SKILL.md`
- `skills/concept-coverage/SKILL.md`
- `skills/calibration-log/SKILL.md`
- `skills/confidence-mismatch/SKILL.md`
- `skills/learning-dependencies/SKILL.md`
- `skills/focus-switches/SKILL.md`
- `skills/recovery-patterns/SKILL.md`
- `skills/bottleneck-log/SKILL.md`
- `skills/question-quality/SKILL.md`
- `skills/feedback-themes/SKILL.md`
- `skills/tool-friction/SKILL.md`
- `skills/debugging-patterns/SKILL.md`
- `skills/memory-prompts/SKILL.md`
- `skills/misconception-near-misses/SKILL.md`
- `skills/practice-opportunities/SKILL.md`
- `skills/autonomy-score/SKILL.md`
- `skills/transfer-signals/SKILL.md`
- `skills/learning-momentum/SKILL.md`
- `skills/hypothesis/SKILL.md`
- `skills/counterexample/SKILL.md`
- `skills/compare/SKILL.md`
- `skills/debug-explain/SKILL.md`
- `skills/teach-back/SKILL.md`
- `skills/proof/SKILL.md`
- `skills/source-check/SKILL.md`
- `skills/case-study/SKILL.md`
- `skills/rubric/SKILL.md`
- `skills/decision/SKILL.md`
- `skills/analogy/SKILL.md`
- `skills/example-ladder/SKILL.md`
- `skills/draft-critique/SKILL.md`
- `skills/plan-review/SKILL.md`
- `skills/risk-review/SKILL.md`
- `skills/translate-level/SKILL.md`
- `skills/socratic/SKILL.md`
- `skills/blindspots/SKILL.md`
- `skills/research-question/SKILL.md`
- `skills/define/SKILL.md`
- `skills/practice/SKILL.md`
- `skills/reflection/SKILL.md`
- `skills/debate/SKILL.md`
- `skills/field-guide/SKILL.md`
- `skills/what-changed/SKILL.md`

### Files to Modify

N/A.

### Files to Delete

N/A.

---

## 10. Testing Plan

### Automated

- Run `npm test`.
- Run `npm run validate` if a narrower validation pass is useful during iteration.

### Manual

- Spot-check 3 skills from each PR for frontmatter correctness.
- Spot-check 3 cognitive-friction skills with vague prompts and precise prompts.
- Spot-check 3 background skills for silence rules and artifact schemas.
- Spot-check 3 input-mode skills for empty invocation and normal invocation shape.
- Confirm no skill folder contains extra README-style documentation.
- Confirm no new skill asks the model to expose private chain-of-thought.

---

## 11. Dependencies & External Services

No new dependencies.

No new external services.

Existing web research was used to inform design, but the skills themselves should not require network access unless an input-mode skill explicitly tells the model to research and the harness permits browsing.

---

## 12. Rollout & Deployment

Implementation rollout:

1. Create PR 1 branch `feat/cognitive-friction-skills` with the 25 cognitive-friction skills.
2. Create PR 2 branch `feat/background-learning-metrics` with the 25 background metric skills.
3. Create PR 3 branch `feat/input-mode-learning-skills` with the 25 slash-command input-mode skills.
4. Run `npm test` per branch.
5. Open three draft PRs into `main`.

Rollback:

- Revert or close any PR independently. The PRs do not depend on each other.
- Since discovery is directory-based, removing a skill directory fully removes that skill.

---

## 13. Open Questions

1. Should each PR include only its 25 skill files, or should the shared design doc be included in all three branches?
2. Should background skills write local artifacts by default, or should some remain purely session-local with no files?
3. Should any background metrics be routed through existing `feedback` submission later, or should that wait for dedicated backend endpoints?
4. Should the skill bodies be compact and uniform for maintainability, or highly individualized for behavior quality?
5. Should PR 3 input-mode skills enforce peer-reviewed sources for research-like commands, or allow official docs and primary sources depending on domain?

---

## 14. Alternatives Considered

### Mixed PRs With All Three Skill Types In Each PR

Rejected for now. Mixed PRs would make review harder because prompt friction, background observation, and slash commands have different quality criteria.

### Add CLI Endpoints For Every Background Skill

Rejected for this batch. It would expand scope into backend contract design and authentication testing. Local artifacts are enough to define the skill behavior first.

### Generate Reasoning Trace Variants

Rejected. The repo already contains many reasoning trace skills. The user asked for learning-friction, background metrics, and input modes, not another trace-skill taxonomy.

### Implement On Main Immediately

Rejected by the active `design-doc` workflow. Implementation must wait for explicit approval and happen in isolated worktrees.
