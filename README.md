# Vidbyte Skills

Vidbyte Skills is a portable skill package for AI coding harnesses. One source of truth — installed with a single command into Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, Warp, and 30+ other harnesses.

Repository: https://github.com/cerredz/Vidbyte-Skills

## Intent

Most AI coding harnesses are excellent at writing code but lack structured workflows for learning, reasoning, and communication. Vidbyte Skills fills that gap: a curated library of slash-command skills covering deep learning methodology, structured reasoning traces, developer utilities, and roleplay practice — all installed into any compatible harness from one package.

The repository owns the skill source files under `skills/`. Adding a skill requires only a `SKILL.md` file; no code registration needed.

## Installation

### Install All Skills

```bash
# From npm
npx vidbyte-skills

# From GitHub (before npm publish)
npx github:cerredz/Vidbyte-Skills

# From a local checkout
npm run install-skills
```

### Install Specific Skills

```bash
npx vidbyte-skills my-skill other-skill
# or
npx vidbyte-skills --skill my-skill,other-skill
```

### Options

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--scope` | `user`, `project`, `both` | `user` | Where to install |
| `--platform` | see list below | all | Target harness(es) |
| `--skill` | comma-separated names | all | Skill subset to install |
| `--mode` | `copy`, `link` | `copy` | Install method |
| `--dry-run` | — | — | Validate without writing |

### Update

```bash
vidbyte-skills update
```

Pulls the latest published version from npm and reinstalls all skills.

### Supported Platforms

`claude-code`, `codex`, `gemini`, `opencode`, `cursor`, `hermes`, `universal`, `windsurf`, `cline`, `continue`, `roo-code`, `github-copilot`, `vscode-copilot`, `copilot-cli`, `warp`, `factory`, `crush`, `openclaw`, `aider`, `augment-code`, `auggie`, `kilo-code`, `jules`, `zed`, `replit-agent`, `devin`, `openhands`, `qwen-code`, `gemini-memory`, `jetbrains-ai`, `junie`, `kiro`, `amp`, `piebald`, `open-harness`, `agents-md`

## Skills

### Learning

Skills for active learning, comprehension, retention, and research.

| Skill | Command | Description |
|-------|---------|-------------|
| blindspots | `/blindspots` | Surfaces hidden principles, tradeoffs, or considerations the user hasn't named yet using targeted guiding questions |
| compression-check | background | Silent background coach that asks you to explain what you just built; evaluates your response and submits a learning record to Vidbyte |
| concept-coverage | `/concept-coverage` | Background tracker that monitors how deeply you engage with a concept; export as a JSON learning artifact at end of session |
| daily-review | `/daily-review` | Extracts high-risk session concepts at end of a work session, appends them to a log, and sends them to Vidbyte for spaced review |
| explain | `/explain` | Rebuilds explanations from first principles; diagnoses which understanding layer is broken and fills from the lowest solid floor |
| explain-away-others | `/explain-away-others` | Before accepting your approach, identifies 2–3 competitive alternatives and requires mechanism-level explanations for why each fails |
| feedback-generator | `/feedback` | Multi-agent harness that generates expert domain feedback grounded in 180+ learning-science papers through iterative self-refinement |
| find-papers | `/find-papers` | Searches for academic papers via plain-language prompt, filters by credible databases, and returns a clean formatted list |
| finding-resources | `/find-resource` | Produces a comprehensive learning-resource map across books, papers, courses, and practitioner writing for any topic |
| jargon | `/jargon` | Surfaces domain-specific jargon, translates to plain language, and builds vocabulary before engaging a technical topic |
| learn-from-video | `/learn-from-video` | Browser-controlled active learning session for a YouTube video with transcript-based segment planning and checkpoint questions |
| motivate | `/motivate` | Delivers one non-repeated motivational learning quote and logs it so it is never shown again |
| my-knowledge | `/my-knowledge` | Scans the session to give an honest assessment of genuine understanding vs. context-dependent familiarity |
| practice | `/practice` | Creates high-volume practice questions that emphasize pattern recognition, variation, and creative intelligence |
| question | `/question` | Produces detailed five-section answers (What, Why, Critical Thinking, Best Practices, Resources) to counter shallow responses in coding harnesses |
| question-builder | `/question-builder` | Background tracker that logs retention and future-direction questions throughout the session; export as a JSON artifact |
| read-paper | `/read-paper` | Reads a research paper (arXiv, DOI, PDF, Semantic Scholar, PubMed), strips noise, extracts a 6-field core signal, and runs a learning gate check |
| research | `/research` | Answers grounded in verified knowledge with explicit source attribution, epistemic labeling on every claim, and peer-reviewed sources |
| retain | `/retain` | Pauses the conversation, generates a 15-minute retention exercise from the session, and submits it to Vidbyte |
| scope | `/scope` | Defines boundaries of broad domains, highlighting core, adjacent, and commonly misattributed fields |
| struggle | `/struggle` | Background tracker that logs repeated struggle patterns and blind-spot signals throughout the session; export as a JSON artifact |
| theoretical-feedback | `/theoretical-feedback` | Extracts the underlying mental model separating novices from experts for any situation or mistake in any domain |
| transfer-signals | `/transfer-signals` | Background tracker that logs cross-field concept connections and missed transfer-learning opportunities |
| vidbyte-auth | `/vidbyte-auth` | Authenticates the Vidbyte CLI with your account to enable saved analysis results and persisted preferences |
| vidbyte-tutor | `/vidbyte-tutor` | Orchestrator for all non-reasoning learning skills; routes to the best skill, explains the selection, and follows the skill's workflow |
| visualize | `/visualize` | Renders visual explanations in Unicode box art; auto-routes to concept maps, layered architectures, sequence flowcharts, or analogy mappings |

### Reasoning Traces

Structured reasoning strategies that write a public scratchpad to `memory/{question_name}.md`. Each trace comes in four size variants:

- **default** — ~100 numbered lines (~2,000–3,500 tokens)
- **small** — ~25 numbered lines (append `-small`)
- **medium** — ~100 numbered lines (append `-medium`)
- **large** — ~500+ numbered lines (append `-large`)

Example: `/bayesian-trace`, `/bayesian-trace-small`, `/bayesian-trace-large`

#### Decision & Strategy

| Skill | Description |
|-------|-------------|
| `a3-problem-solving-trace` | Toyota A3 structured problem-solving using a one-page lean format |
| `analytic-hierarchy-process-trace` | Pairwise comparison of criteria and alternatives to rank decisions |
| `ansoff-matrix-trace` | Market/product growth strategy using the four Ansoff quadrants |
| `balanced-scorecard-trace` | Strategy execution across financial, customer, process, and learning perspectives |
| `bcg-matrix-trace` | Portfolio analysis using the BCG growth-share matrix |
| `blue-ocean-strategy-trace` | Uncontested market-space creation via value innovation |
| `business-model-canvas-trace` | Nine-block business model design and analysis |
| `cost-benefit-trace` | Quantified comparison of costs and benefits across decision options |
| `decision-matrix-trace` | Weighted scoring across multiple criteria to rank options |
| `decision-tree-trace` | Branch-based expected-value decomposition of decision paths |
| `elimination-by-aspects-trace` | Progressive elimination of options by failing minimum criteria thresholds |
| `expected-value-trace` | Probability-weighted outcome calculation across decision branches |
| `multi-attribute-utility-trace` | Utility scoring across independent attributes with explicit weights |
| `opportunity-cost-trace` | Surfaces the best forgone alternative behind any choice |
| `pareto-principle-trace` | Identifies the 20% of inputs driving 80% of outcomes |
| `regret-minimization-trace` | Selects the option that minimizes long-run regret |
| `satisficing-trace` | Chooses the first option meeting minimum acceptable thresholds |
| `tradeoff-matrix-trace` | Explicit mapping of gains and losses across competing values |
| `utility-trace` | Formal utility function construction and optimization |
| `value-focused-thinking-trace` | Decision framing from fundamental values rather than alternatives |
| `vrio-framework-trace` | Competitive advantage assessment via Value, Rarity, Imitability, Organization |

#### Causal & Systems Thinking

| Skill | Description |
|-------|-------------|
| `bottleneck-trace` | Identifies the single constraint limiting throughput in a system |
| `causal-loop-trace` | Reinforcing and balancing feedback loop mapping |
| `causal-trace` | Structured cause-and-effect chain analysis |
| `dependency-mapping-trace` | Maps dependencies and critical paths across components or tasks |
| `feedback-loop-trace` | Traces circular causal relationships in dynamic systems |
| `fishbone-trace` | Ishikawa diagram for root-cause categorization across 6M/8M categories |
| `five-whys-trace` | Iterative why-questioning to reach root cause |
| `iceberg-model-trace` | Systems iceberg: events → patterns → structures → mental models |
| `leverage-points-trace` | Identifies the highest-leverage intervention points in a system |
| `root-cause-trace` | Structured root cause identification and verification |
| `stock-and-flow-trace` | System dynamics modeling of accumulations and rates |
| `systems-thinking-trace` | Holistic system behavior analysis including feedback and emergence |
| `theory-of-constraints-trace` | TOC five-step focusing process for constraint exploitation |
| `why-because-analysis-trace` | Causal graph construction linking contributing factors to outcomes |

#### Logic & Formal Reasoning

| Skill | Description |
|-------|-------------|
| `abductive-trace` | Best-explanation inference from incomplete observations |
| `backward-chaining-trace` | Goal-driven reasoning from desired outcome to required conditions |
| `deductive-trace` | Validity-preserving inference from premises to conclusions |
| `defeasible-reasoning-trace` | Tentative inference that can be retracted on new evidence |
| `forward-chaining-trace` | Data-driven reasoning from known facts to conclusions |
| `fuzzy-logic-trace` | Partial truth-value reasoning for vague or graduated concepts |
| `inductive-trace` | Pattern-based generalization from specific instances |
| `modal-reasoning-trace` | Possibility and necessity reasoning across possible worlds |
| `nonmonotonic-reasoning-trace` | Reasoning where adding facts can invalidate prior conclusions |
| `predicate-logic-trace` | First-order logic formalization of arguments |
| `proof-by-cases-trace` | Exhaustive case-division proof construction |
| `proof-by-contradiction-trace` | Reductio ad absurdum argument structure |
| `propositional-logic-trace` | Truth-functional analysis of compound propositions |
| `syllogistic-trace` | Classical syllogism construction and validity checking |
| `temporal-reasoning-trace` | Reasoning about time, sequences, and temporal constraints |

#### Probabilistic & Statistical

| Skill | Description |
|-------|-------------|
| `base-rate-trace` | Anchors inference in prior probabilities before updating on evidence |
| `bayesian-trace` | Sequential belief updating via Bayes' theorem |
| `correlation-causation-trace` | Distinguishes spurious correlation from causal relationship |
| `counterfactual-trace` | Explores what would have happened under different conditions |
| `fermi-estimation-trace` | Order-of-magnitude estimation from first-principles decomposition |
| `null-hypothesis-trace` | Formal hypothesis test framing and significance reasoning |
| `probabilistic-trace` | Explicit probability assignment and uncertainty quantification |
| `quasi-experimental-trace` | Causal inference from observational data without randomization |
| `randomized-control-trial-trace` | RCT design and analysis for causal claim validation |
| `reference-class-forecasting-trace` | Outside-view prediction using base rates from comparable cases |
| `regression-reasoning-trace` | Regression to the mean and base-rate reversion analysis |
| `sensitivity-analysis-trace` | Impact assessment of parameter variation on outcomes |
| `uncertainty-quantification-trace` | Formal bounds and confidence intervals on uncertain quantities |

#### Creative & Innovation

| Skill | Description |
|-------|-------------|
| `alternative-futures-trace` | Multiple plausible future scenarios from trend extrapolation |
| `analogical-trace` | Cross-domain analogy mapping to transfer structural insights |
| `analogy` | Standalone analogy generation and stress-testing |
| `biomimicry-trace` | Nature-inspired solution design for engineering or strategy problems |
| `constraint-removal-trace` | Innovation through systematically removing assumed constraints |
| `lateral-thinking-trace` | De Bono lateral thinking provocation and escape techniques |
| `morphological-analysis-trace` | Combinatorial solution space exploration via attribute matrices |
| `provocation-trace` | Deliberate provocative statements to break fixed thinking patterns |
| `random-stimulus-trace` | Random input injection to generate unexpected solution directions |
| `reverse-brainstorming-trace` | Generates solutions by first brainstorming how to cause the problem |
| `scamper-trace` | SCAMPER framework for systematic idea transformation |
| `synectics-trace` | Creative connection-making through metaphor and analogy |
| `systematic-inventive-thinking-trace` | SIT five patterns for structured product/service innovation |
| `triz-trace` | TRIZ inventive principles for technical contradiction resolution |

#### Risk & Failure Analysis

| Skill | Description |
|-------|-------------|
| `bowtie-risk-trace` | Visual risk model linking threats to outcomes through barriers |
| `error-analysis-trace` | Systematic classification and root cause of errors |
| `event-tree-trace` | Forward-looking probability tree from an initiating event |
| `fault-tree-trace` | Top-down deductive failure analysis using logic gates |
| `fmea-trace` | Failure Mode and Effects Analysis with severity/occurrence/detectability scoring |
| `hazop-trace` | Hazard and Operability Study for process safety deviation analysis |
| `postmortem-trace` | Retrospective failure analysis for learning and prevention |
| `precautionary-principle-trace` | Risk framing under deep uncertainty with asymmetric stakes |
| `premortem-trace` | Prospective failure imagining to surface risks before they occur |
| `red-team-trace` | Adversarial challenge to plans, arguments, or systems |

#### Business Frameworks

| Skill | Description |
|-------|-------------|
| `customer-journey-mapping-trace` | End-to-end customer experience mapping across touchpoints |
| `cynefin-trace` | Domain classification (simple/complicated/complex/chaotic) for response selection |
| `design-thinking-trace` | Empathize → Define → Ideate → Prototype → Test cycle |
| `dmaic-trace` | Six Sigma Define-Measure-Analyze-Improve-Control improvement cycle |
| `double-diamond-trace` | Diverge-converge design process for problem and solution space |
| `empathy-mapping-trace` | User perspective mapping across think, feel, see, and do |
| `gemba-walk-trace` | Go-to-the-source operational observation and waste identification |
| `jobs-to-be-done-trace` | Functional, emotional, and social job framing for product/strategy |
| `pdca-cycle-trace` | Plan-Do-Check-Act iterative improvement cycle |
| `pestle-trace` | Environmental scan across Political, Economic, Social, Technical, Legal, Environmental |
| `porters-five-forces-trace` | Industry structure analysis via Porter's competitive forces |
| `stakeholder-analysis-trace` | Power-interest mapping and engagement strategy for stakeholders |
| `swot-trace` | Strengths, Weaknesses, Opportunities, Threats strategic analysis |
| `value-chain-analysis-trace` | Competitive advantage identification across primary and support activities |
| `value-stream-mapping-trace` | Lean value-stream visualization and waste elimination |

#### Planning & Forecasting

| Skill | Description |
|-------|-------------|
| `cone-of-plausibility-trace` | Foresight ranging from probable to possible to plausible futures |
| `delphi-method-trace` | Structured expert-opinion convergence through iterative rounds |
| `horizon-scanning-trace` | Systematic weak-signal detection for emerging trends and risks |
| `indicators-signposts-trace` | Leading indicator identification and scenario monitoring |
| `nine-windows-trace` | TRIZ nine-window space-time analysis for innovation context |
| `ooda-loop-trace` | Observe-Orient-Decide-Act decision cycle for dynamic environments |
| `ooda-red-team-trace` | Adversarial OODA loop application for competitive threat modeling |
| `scenario-planning-trace` | Multiple coherent futures construction for robust strategy |
| `what-if-analysis-trace` | Structured exploration of hypothetical condition changes |

#### Argument & Critical Thinking

| Skill | Description |
|-------|-------------|
| `argument-map-trace` | Visual argument structure with premises, objections, and rebuttals |
| `counterargument` | Standalone strongest-case counterargument generation |
| `deception-detection-trace` | Identifies misleading framing, omissions, and manipulation in arguments |
| `devils-advocacy-trace` | Systematic opposition to a position regardless of personal view |
| `dialectical-trace` | Thesis-antithesis-synthesis dialectical reasoning |
| `issue-tree-trace` | MECE issue decomposition for structured problem framing |
| `key-assumptions-check-trace` | Surfaces and stress-tests the assumptions an argument depends on |
| `linchpin-analysis-trace` | Identifies the single assumption whose failure collapses an entire argument |
| `mece-decomposition-trace` | Mutually exclusive, collectively exhaustive problem breakdown |
| `minto-pyramid-trace` | Pyramid principle: conclusion-first top-down communication structure |
| `steelman-trace` | Strongest-possible version of an opposing argument |

#### Cognitive Biases & Heuristics

| Skill | Description |
|-------|-------------|
| `adaptive-reasoning-trace` | Meta-level strategy selection based on task type and available resources |
| `affect-heuristic-trace` | Surfaces emotional valence driving judgments below conscious reasoning |
| `assumption-ladder-trace` | Argyris ladder of inference from data to belief to action |
| `default-heuristic-trace` | Identifies when defaults or status quo bias are driving a choice |
| `familiarity-heuristic-trace` | Detects when familiarity is masquerading as quality or accuracy |
| `fast-and-frugal-trees-trace` | Bounded-rationality decision tree with minimal cue requirements |
| `fluency-heuristic-trace` | Surfaces processing fluency effects on perceived truth or quality |
| `mental-simulation-trace` | Simulation heuristic: running mental movies of outcomes |
| `metacognitive-audit-trace` | Audit of one's own reasoning quality and calibration |
| `naive-diversification-trace` | 1/N equal-weighting heuristic and its appropriate vs. inappropriate uses |
| `outside-view-trace` | Base-rate-grounded outside view to counter inside-view optimism |
| `peak-end-rule-trace` | Kahneman peak-end memory bias in experience evaluation |
| `recognition-heuristic-trace` | Exploits name recognition as a proxy for quality under uncertainty |
| `scarcity-heuristic-trace` | Surfaces artificial urgency and scarcity framing effects |
| `simulation-heuristic-trace` | Ease-of-imagining effects on probability and emotion judgments |
| `social-proof-trace` | Detects when consensus signals are substituting for independent analysis |
| `speed-accuracy-tradeoff-trace` | Explicit calibration of response time vs. decision quality |
| `take-the-best-trace` | Gigerenzer's take-the-best: one-reason decision making |
| `tallying-trace` | Equal-weight cue counting as a decision heuristic |

#### Research & Qualitative

| Skill | Description |
|-------|-------------|
| `comparative-case-trace` | Most-similar/most-different case selection for causal inference |
| `data-quality-audit-trace` | Systematic assessment of data completeness, accuracy, and fitness |
| `ethnographic-reasoning-trace` | Contextual inquiry and thick description for behavioral understanding |
| `experimental-design-trace` | Control, randomization, and validity design for experiments |
| `hermeneutic-trace` | Interpretive reading of texts within their historical-contextual horizon |
| `historical-reasoning-trace` | Contextual analysis of historical events, causes, and contingency |
| `narrative-reasoning-trace` | Story-structure analysis: plot, character, causality, and meaning |
| `phenomenology-trace` | First-person lived-experience description and eidetic reduction |
| `scientific-method-trace` | Observe → Hypothesize → Predict → Test → Conclude cycle |

#### Learning & Reflection

| Skill | Description |
|-------|-------------|
| `after-action-review-trace` | Military AAR: what happened, why it happened, and what to do differently |
| `double-loop-learning-trace` | Argyris double-loop: challenges governing values, not just actions |
| `kolb-learning-cycle-trace` | Concrete experience → Reflection → Abstraction → Active testing |

#### AI & Advanced Reasoning Patterns

| Skill | Description |
|-------|-------------|
| `agent-as-judge-trace` | Uses a simulated evaluator agent to assess and critique responses |
| `autoreasoner` | Meta-skill that selects the best reasoning strategy for a given problem |
| `codeact-reasoning` | Code-execution-grounded reasoning for computational problems |
| `codeact-trace` | Public scratchpad for CodeAct step-by-step execution tracing |
| `contrastive-cot-trace` | Contrasts correct and incorrect reasoning paths for insight |
| `cross-lingual-consistency-trace` | Checks reasoning consistency across language representations |
| `curriculum-learning-reasoning` | Staged complexity ordering for multi-step problem solving |
| `curriculum-learning-trace` | Public scratchpad for curriculum-ordered problem decomposition |
| `divide-and-conquer-trace` | Recursive problem decomposition into independent subproblems |
| `dynamic-agent-generation-trace` | Generates specialized sub-agents dynamically for complex problems |
| `elastic-reasoning-trace` | Adapts reasoning depth and breadth to available compute budget |
| `focused-cot-trace` | Chain-of-thought constrained to a single narrow reasoning thread |
| `graph-of-thoughts-trace` | Non-linear thought graph where ideas can merge and branch |
| `iteration-of-thought-trace` | Iterative thought refinement with feedback between steps |
| `least-to-most-trace` | Decomposes complex problems from easiest to hardest subproblem |
| `mental-model` | Standalone mental model construction and stress-testing |
| `meta-prompting-trace` | Self-generating prompt refinement for improved task framing |
| `mixture-of-agents-reasoning` | Ensemble-style multi-perspective synthesis |
| `mixture-of-agents-trace` | Public scratchpad for mixture-of-agents reasoning coordination |
| `multi-agent-debate-reasoning` | Structured adversarial debate between simulated reasoning agents |
| `multi-agent-debate-trace` | Public scratchpad for multi-agent debate resolution |
| `paradigm-routing-reasoning` | Routes the problem to the most appropriate reasoning paradigm |
| `paradigm-routing-trace` | Public scratchpad for paradigm selection and execution |
| `parallel-thinking-reasoning` | Concurrent exploration of independent reasoning threads |
| `parallel-thinking-trace` | Public scratchpad for parallel reasoning synthesis |
| `self-consistency-reasoning` | Samples multiple reasoning paths and takes the majority answer |
| `self-consistency-trace` | Public scratchpad for self-consistency sampling and voting |
| `self-rag-reasoning` | Self-retrieval-augmented generation with inline fact verification |
| `self-rag-trace` | Public scratchpad for self-RAG retrieval and answer grounding |
| `sketch-of-thought-trace` | Compressed sketch-style reasoning for efficient token use |
| `step-back-reasoning` | Abstracts the problem one level before solving |
| `step-back-trace` | Public scratchpad for step-back abstraction and re-engagement |

#### Miscellaneous Thinking Tools

| Skill | Description |
|-------|-------------|
| `anti-passive` | Detects passive voice and hedging in reasoning and writing |
| `concept-mapping-trace` | Hierarchical concept map with cross-links and propositions |
| `define-success` | Forces explicit success criteria before evaluating any solution |
| `do-not-repeat` | Constraint: ensures the response does not restate what the user just said |
| `fairness-analysis-trace` | Equity and bias analysis across stakeholders and outcomes |
| `force-field-trace` | Lewin force-field: driving vs. restraining forces on change |
| `game-theory-trace` | Strategic interaction modeling via payoff matrices and equilibria |
| `incentive-analysis-trace` | Maps incentive structures and misalignment in systems |
| `influence-diagram-trace` | Decision, chance, and value node diagram for structured decisions |
| `inversion-trace` | Invert the problem: think about what causes failure first |
| `legal-reasoning-trace` | Legal argument construction: precedent, statute, principle, analogy |
| `mind-map-trace` | Radial concept mapping for brainstorming and exploration |
| `misconceptions` | Surfaces common misconceptions about a topic before learning |
| `no-abstraction` | Constraint: respond using only concrete, specific language |
| `no-assumptions` | Constraint: identify and explicitly state all assumptions before reasoning |
| `no-conclusions` | Constraint: present evidence and reasoning without stating a conclusion |
| `nth-order-effects-trace` | Traces cascading effects beyond second-order consequences |
| `occams-razor-trace` | Simplest sufficient explanation selection |
| `policy-analysis-trace` | Multi-criteria policy option assessment including stakeholder effects |
| `pragmatism-trace` | Pragmatic evaluation: what works in practice vs. what is theoretically optimal |
| `reframing-trace` | Restates the problem from different angles to find non-obvious solutions |
| `rubber-duck-debugging-trace` | Verbalized step-by-step explanation to surface hidden assumptions |
| `second-order-effects-trace` | Immediate second-order consequence tracing |
| `six-thinking-hats-trace` | De Bono six hats: parallel thinking across six defined modes |
| `socratic-questioning-trace` | Structured Socratic dialogue to surface unstated premises |
| `spatial-reasoning-trace` | Mental rotation, layout, and spatial relationship reasoning |
| `spider-mapping-trace` | Central-topic spider diagram for concept relationship exploration |
| `storyboarding-trace` | Sequential frame-by-frame narrative construction |
| `trial-and-error-trace` | Explicit hypothesis-test-learn iteration with logged attempts |
| `values-tradeoff-trace` | Explicit mapping of competing values in an ethical or strategic decision |
| `why` | Simple recursive why-questioning to reach first principles |

### Utility

| Skill | Command | Description |
|-------|---------|-------------|
| docs-tldr | `/docs-tldr <library>` | Fetches official documentation for any library and produces a minimal cheat sheet: 5 core concepts, 10 common operations with code, 3 common mistakes, and a navigation map |
| unit | `/unit <topic>` | Decomposes a large complex subject into its smallest meaningful atomic components; pure decomposition, no roadmap |

### Roleplay

| Skill | Command | Description |
|-------|---------|-------------|
| roleplay | `/roleplay` | Character simulation for practicing real-world interpersonal scenarios: job interviews, difficult conversations, salary negotiation, feedback, pitching |
| create-roleplay | `/create-roleplay` | Creates a new roleplay scenario for use with `/roleplay`; generates `scenario.md` and `rubric.md` and registers the scenario |

## Vidbyte CLI

This package exposes a `vidbyte` command for skill-to-backend submissions. Skills call the CLI instead of constructing backend requests in prompt text.

```bash
vidbyte feedback submit --file feedback-log.md --domain software-engineering --conversation-id example
vidbyte retain --title "Retain this session" --domain software-engineering ...
vidbyte agents get core
```

Use `--dry-run` to validate input without sending a network request.

```bash
python3 -m cli feedback submit --file feedback-log.md --domain software-engineering --conversation-id local-test --dry-run
```

## Adding a Skill

Create a folder under `skills/` with a `SKILL.md` file:

```text
skills/my-skill/
  SKILL.md
```

`SKILL.md` must start with frontmatter:

```markdown
---
name: my-skill
description: Use this skill when the user asks for the specific workflow it handles.
---
```

The skill name must be lowercase hyphen-case matching the folder name. No code registration needed. For a deeper guide to authoring reasoning trace, prompt, and background/CLI-backed skills, see `artifacts/create-skill-guide.md`.

## Install Locations

Skill-directory integrations receive a copy or symlink of each selected skill folder:

```text
Claude Code:    ~/.claude/skills or <project>/.claude/skills
Codex:          ~/.codex/skills or <project>/.codex/skills
Gemini CLI:     ~/.gemini/skills or <project>/.gemini/skills
OpenCode:       ~/.config/opencode/skills or <project>/.opencode/skills
Cursor:         ~/.cursor/skills or <project>/.cursor/skills
GitHub Copilot: ~/.copilot/skills or <project>/.github/skills
Warp:           ~/.warp/skills or <project>/.warp/skills
Factory:        ~/.factory/skills or <project>/.factory/skills
Crush:          ~/.config/crush/skills or <project>/.crush/skills
```

Rule-file integrations flatten skills into a generated Markdown rule document:

```text
Windsurf:       <project>/.windsurf/rules/vidbyte-skills.md
Cline:          ~/Documents/Cline/Rules/vidbyte-skills.md or <project>/.clinerules/vidbyte-skills.md
Continue:       <project>/.continue/rules/vidbyte-skills.md
Roo Code:       <project>/.roo/rules/vidbyte-skills.md
Augment Code:   ~/.augment/rules/vidbyte-skills.md or <project>/.augment/rules/vidbyte-skills.md
```

## Verify

```bash
npm test
```

The test suite validates skill metadata and runs a smoke test that installs a fixture skill into temporary home and project directories.
