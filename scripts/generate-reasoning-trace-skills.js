#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const SKILLS_DIR = path.join(REPO_ROOT, "skills");

const VARIANTS = [
  {
    suffix: "",
    label: "default",
    display: "Default",
    lineInstruction: "100 numbered scratchpad lines unless the user explicitly requests a different scale",
    lineStatement: "Scale: default - this scratchpad is required to output 100 lines unless the user explicitly requests a different scale.",
    lengthRule: "Write 100 numbered scratchpad lines by default, then add a short final answer after the numbered trace."
  },
  {
    suffix: "-small",
    label: "small",
    display: "Small",
    lineInstruction: "exactly 25 numbered scratchpad lines",
    lineStatement: "Scale: small - this scratchpad is required to output exactly 25 lines.",
    lengthRule: "Write exactly 25 numbered scratchpad lines, then add a short final answer after the numbered trace."
  },
  {
    suffix: "-medium",
    label: "medium",
    display: "Medium",
    lineInstruction: "exactly 100 numbered scratchpad lines",
    lineStatement: "Scale: medium - this scratchpad is required to output exactly 100 lines.",
    lengthRule: "Write exactly 100 numbered scratchpad lines, then add a short final answer after the numbered trace."
  },
  {
    suffix: "-large",
    label: "large",
    display: "Large",
    lineInstruction: "500 or more numbered scratchpad lines",
    lineStatement: "Scale: large - this scratchpad is required to output 500+ lines.",
    lengthRule: "Write 500 or more numbered scratchpad lines, then add a concise final answer after the numbered trace."
  }
];

const STRATEGIES = [
  ["first-principles-trace", "First Principles", "foundational decomposition", "break claims into primitive facts, ask what must be true at each smaller level, and rebuild the answer upward"],
  ["socratic-questioning-trace", "Socratic Questioning", "question-driven inquiry", "turn assertions into precise questions, probe definitions and assumptions, and answer each question in sequence"],
  ["five-whys-trace", "Five Whys", "root cause analysis", "ask why repeatedly until the trace reaches a cause that can be acted on or tested"],
  ["mece-decomposition-trace", "MECE Decomposition", "structured decomposition", "split the problem into mutually exclusive and collectively exhaustive parts before solving each part"],
  ["issue-tree-trace", "Issue Tree", "structured decomposition", "branch the central question into subissues, resolve leaf nodes, and roll findings back to the trunk"],
  ["minto-pyramid-trace", "Minto Pyramid", "communication reasoning", "state the answer first, group supporting arguments, and order evidence so the logic is easy to inspect"],
  ["deductive-trace", "Deductive Reasoning", "formal logic", "start from stated premises and derive conclusions that must follow if the premises are true"],
  ["inductive-trace", "Inductive Reasoning", "evidence generalization", "move from observations to patterns, estimate strength, and mark where the generalization could fail"],
  ["abductive-trace", "Abductive Reasoning", "inference to best explanation", "generate plausible explanations, compare explanatory power, and choose the best supported account"],
  ["analogical-trace", "Analogical Reasoning", "similarity transfer", "map a source case to the target case, test relevant similarities, and reject weak transfers"],
  ["causal-trace", "Causal Reasoning", "cause and effect analysis", "separate causes from correlations, map mechanisms, and test whether interventions would change outcomes"],
  ["counterfactual-trace", "Counterfactual Reasoning", "alternative possibility analysis", "ask what would change under different conditions and use those contrasts to clarify causation"],
  ["bayesian-trace", "Bayesian Reasoning", "probabilistic updating", "name priors, update with evidence, and explain how each item shifts confidence"],
  ["probabilistic-trace", "Probabilistic Reasoning", "uncertainty analysis", "represent uncertainty explicitly, compare likelihoods, and avoid binary certainty when evidence is incomplete"],
  ["base-rate-trace", "Base Rate Reasoning", "forecast calibration", "start from reference frequencies before adjusting for case-specific evidence"],
  ["expected-value-trace", "Expected Value Reasoning", "decision analysis", "combine outcomes with probabilities so decisions account for both payoff and likelihood"],
  ["utility-trace", "Utility Reasoning", "preference analysis", "clarify objectives, weight preferences, and compare options by expected usefulness"],
  ["cost-benefit-trace", "Cost Benefit Reasoning", "decision analysis", "identify costs, benefits, timing, risk, and distribution before recommending action"],
  ["tradeoff-matrix-trace", "Tradeoff Matrix", "comparative decision analysis", "score options across criteria and expose the compromises behind the recommendation"],
  ["decision-tree-trace", "Decision Tree", "branching decision analysis", "represent choices, uncertain events, and outcomes as branches that can be compared"],
  ["sensitivity-analysis-trace", "Sensitivity Analysis", "robustness testing", "vary key assumptions to see which inputs most change the conclusion"],
  ["scenario-planning-trace", "Scenario Planning", "future uncertainty analysis", "construct distinct plausible futures and test decisions across them"],
  ["premortem-trace", "Premortem Reasoning", "failure anticipation", "assume the plan failed, identify causes of failure, and convert them into mitigations"],
  ["postmortem-trace", "Postmortem Reasoning", "failure learning", "reconstruct what happened, separate symptoms from causes, and extract future safeguards"],
  ["ooda-loop-trace", "OODA Loop", "adaptive decision cycle", "observe, orient, decide, and act while updating the trace as the situation changes"],
  ["ooda-red-team-trace", "OODA Red Team", "adversarial adaptation", "run the OODA cycle from an opposing actor's perspective and compare likely moves"],
  ["analysis-of-competing-hypotheses-trace", "Analysis Of Competing Hypotheses", "structured analytic technique", "list competing explanations, test evidence against each, and prefer the hypothesis with least conflict"],
  ["key-assumptions-check-trace", "Key Assumptions Check", "structured analytic technique", "surface critical assumptions, test fragility, and revise conclusions where assumptions are weak"],
  ["devils-advocacy-trace", "Devils Advocacy", "adversarial critique", "argue against the favored answer to expose unsupported claims and hidden vulnerabilities"],
  ["red-team-trace", "Red Team Reasoning", "adversarial critique", "simulate a capable opponent or critic to stress-test plans, claims, and defenses"],
  ["outside-view-trace", "Outside View", "forecast calibration", "compare the case to a reference class before trusting inside details"],
  ["reference-class-forecasting-trace", "Reference Class Forecasting", "forecast calibration", "select comparable cases, derive an empirical baseline, and adjust only with justified evidence"],
  ["indicators-signposts-trace", "Indicators And Signposts", "monitoring analysis", "define observable signals that would confirm, weaken, or redirect the current assessment"],
  ["linchpin-analysis-trace", "Linchpin Analysis", "structured analytic technique", "identify assumptions or evidence that hold the conclusion together and test them first"],
  ["what-if-analysis-trace", "What If Analysis", "scenario stress testing", "alter one important condition at a time and track how the answer changes"],
  ["deception-detection-trace", "Deception Detection", "adversarial evidence analysis", "ask how evidence could be manipulated, fabricated, omitted, or misread"],
  ["alternative-futures-trace", "Alternative Futures", "scenario planning", "build multiple futures from key uncertainties and compare implications across them"],
  ["cone-of-plausibility-trace", "Cone Of Plausibility", "forecast framing", "separate probable, plausible, and possible futures so confidence stays calibrated"],
  ["horizon-scanning-trace", "Horizon Scanning", "weak signal analysis", "search for early signals, emerging patterns, and discontinuities that may matter later"],
  ["swot-trace", "SWOT Reasoning", "strategic analysis", "separate strengths, weaknesses, opportunities, and threats before synthesizing strategy"],
  ["pestle-trace", "PESTLE Reasoning", "macro-environment analysis", "scan political, economic, social, technological, legal, and environmental forces"],
  ["porters-five-forces-trace", "Porters Five Forces", "competitive strategy", "evaluate rivalry, entrants, substitutes, suppliers, and buyers before judging attractiveness"],
  ["stakeholder-analysis-trace", "Stakeholder Analysis", "social systems analysis", "map affected parties, incentives, power, needs, and likely reactions"],
  ["incentive-analysis-trace", "Incentive Analysis", "behavioral systems analysis", "infer behavior from rewards, constraints, penalties, and information available to actors"],
  ["game-theory-trace", "Game Theory", "strategic interaction", "model players, payoffs, moves, information, and equilibria before choosing a strategy"],
  ["minimax-trace", "Minimax Reasoning", "adversarial decision analysis", "choose the option whose worst credible outcome is strongest"],
  ["regret-minimization-trace", "Regret Minimization", "decision analysis", "compare future remorse across choices and reduce the cost of being wrong"],
  ["satisficing-trace", "Satisficing Reasoning", "bounded rationality", "define adequate thresholds and choose an option that meets them under real constraints"],
  ["opportunity-cost-trace", "Opportunity Cost Reasoning", "resource allocation", "make the next-best alternative explicit before choosing the current path"],
  ["second-order-effects-trace", "Second Order Effects", "consequence analysis", "reason beyond immediate outcomes into follow-on effects and feedback"],
  ["nth-order-effects-trace", "Nth Order Effects", "consequence analysis", "extend consequence chains across multiple steps while pruning speculative branches"],
  ["systems-thinking-trace", "Systems Thinking", "systems analysis", "map components, relationships, boundaries, feedback, delays, and emergent behavior"],
  ["iceberg-model-trace", "Iceberg Model", "systems analysis", "move from visible events to patterns, structures, and mental models underneath"],
  ["causal-loop-trace", "Causal Loop Reasoning", "systems dynamics", "represent reinforcing and balancing loops that drive the behavior of the system"],
  ["stock-and-flow-trace", "Stock And Flow Reasoning", "systems dynamics", "distinguish accumulations from rates of change and explain delays"],
  ["leverage-points-trace", "Leverage Points", "systems intervention", "find places where small changes can shift system behavior materially"],
  ["feedback-loop-trace", "Feedback Loop Reasoning", "systems analysis", "identify reinforcing and balancing loops, then trace their effects over time"],
  ["bottleneck-trace", "Bottleneck Reasoning", "constraint analysis", "locate the limiting factor that governs overall throughput or progress"],
  ["theory-of-constraints-trace", "Theory Of Constraints", "constraint analysis", "identify the system constraint, exploit it, subordinate other work, and reassess"],
  ["dependency-mapping-trace", "Dependency Mapping", "systems decomposition", "map prerequisites, blockers, interfaces, and sequencing before recommending work"],
  ["root-cause-trace", "Root Cause Reasoning", "cause analysis", "distinguish proximate symptoms from durable causes that can be corrected"],
  ["fault-tree-trace", "Fault Tree Analysis", "failure analysis", "work top-down from an undesirable event to combinations of contributing failures"],
  ["event-tree-trace", "Event Tree Analysis", "risk analysis", "start from an initiating event and branch through possible outcomes and controls"],
  ["fishbone-trace", "Fishbone Diagram Reasoning", "root cause analysis", "sort candidate causes into categories so missing families of causes become visible"],
  ["bowtie-risk-trace", "Bowtie Risk Reasoning", "risk analysis", "connect threats, preventive controls, the central event, recovery controls, and consequences"],
  ["lateral-thinking-trace", "Lateral Thinking", "creative problem solving", "approach the problem indirectly, break habitual frames, and generate non-obvious moves"],
  ["six-thinking-hats-trace", "Six Thinking Hats", "parallel thinking", "separate facts, feelings, risks, benefits, creativity, and process control into distinct passes"],
  ["scamper-trace", "SCAMPER Reasoning", "creative modification", "use substitute, combine, adapt, modify, put to another use, eliminate, and reverse prompts"],
  ["triz-trace", "TRIZ Reasoning", "inventive problem solving", "name contradictions, search invention patterns, and resolve constraints without simple compromise"],
  ["design-thinking-trace", "Design Thinking", "human-centered design", "empathize, define, ideate, prototype, and test around user needs"],
  ["double-diamond-trace", "Double Diamond", "design process", "diverge and converge first on the problem, then diverge and converge on the solution"],
  ["morphological-analysis-trace", "Morphological Analysis", "creative decomposition", "list dimensions of the problem and recombine alternatives across dimensions"],
  ["mind-map-trace", "Mind Mapping", "associative exploration", "radiate related concepts from a central question and cluster them into patterns"],
  ["random-stimulus-trace", "Random Stimulus", "creative provocation", "introduce an unrelated cue and force useful connections to the target problem"],
  ["reverse-brainstorming-trace", "Reverse Brainstorming", "creative inversion", "ask how to worsen the outcome, then reverse those causes into improvements"],
  ["biomimicry-trace", "Biomimicry Reasoning", "analogical design", "look to biological systems for patterns that can be adapted to the current challenge"],
  ["synectics-trace", "Synectics Reasoning", "creative analogy", "use direct, personal, symbolic, and fantasy analogies to reframe the problem"],
  ["constraint-removal-trace", "Constraint Removal", "creative problem solving", "temporarily remove assumed limits and inspect what new options appear"],
  ["provocation-trace", "Provocation Reasoning", "lateral thinking", "make a deliberate unreasonable statement and mine it for practical insight"],
  ["reframing-trace", "Reframing Reasoning", "perspective shift", "change the frame, owner, time horizon, or success definition before solving"],
  ["scientific-method-trace", "Scientific Method", "empirical inquiry", "form a question, propose hypotheses, test them, and revise based on observations"],
  ["hypothesis-testing-trace", "Hypothesis Testing", "empirical evaluation", "state testable claims, define disconfirming evidence, and compare observations to expectations"],
  ["null-hypothesis-trace", "Null Hypothesis Reasoning", "statistical inference", "assume no effect or no difference, then ask whether evidence is strong enough to reject that baseline"],
  ["experimental-design-trace", "Experimental Design", "empirical inquiry", "define variables, controls, measures, randomization, and validity risks"],
  ["randomized-control-trial-trace", "Randomized Control Trial", "causal inference", "compare treatment and control groups while guarding against confounds"],
  ["quasi-experimental-trace", "Quasi Experimental Reasoning", "causal inference", "use imperfect natural comparisons while naming threats to validity"],
  ["ab-testing-trace", "A B Testing", "experimental decision analysis", "compare variants with predefined metrics, sample rules, and decision thresholds"],
  ["regression-reasoning-trace", "Regression Reasoning", "statistical modeling", "explain relationships while checking controls, residuals, and model limits"],
  ["correlation-causation-trace", "Correlation Versus Causation", "causal inference", "separate association from mechanism, temporal order, and intervention evidence"],
  ["evidence-triangulation-trace", "Evidence Triangulation", "evidence synthesis", "combine independent evidence streams and compare whether they converge"],
  ["data-quality-audit-trace", "Data Quality Audit", "evidence reliability", "inspect completeness, accuracy, freshness, lineage, and measurement bias"],
  ["error-analysis-trace", "Error Analysis", "diagnostic evaluation", "categorize failures, estimate frequency, and identify the changes most likely to reduce them"],
  ["uncertainty-quantification-trace", "Uncertainty Quantification", "risk and probability analysis", "express confidence ranges, sources of uncertainty, and what would narrow them"],
  ["fuzzy-logic-trace", "Fuzzy Logic Reasoning", "graded truth analysis", "use degrees of membership when categories are not cleanly true or false"],
  ["defeasible-reasoning-trace", "Defeasible Reasoning", "revisable logic", "make provisional conclusions that can be withdrawn when stronger contrary evidence appears"],
  ["nonmonotonic-reasoning-trace", "Nonmonotonic Reasoning", "revisable logic", "allow new information to reduce or invalidate earlier conclusions"],
  ["modal-reasoning-trace", "Modal Reasoning", "possibility and necessity logic", "separate what is necessary, possible, impossible, and contingent"],
  ["temporal-reasoning-trace", "Temporal Reasoning", "time-based logic", "order events, durations, deadlines, lags, and time-dependent constraints"],
  ["spatial-reasoning-trace", "Spatial Reasoning", "geometric and layout logic", "reason about position, adjacency, distance, containment, and movement"],
  ["constraint-satisfaction-trace", "Constraint Satisfaction", "search and optimization", "list constraints, domains, and conflicts, then narrow toward feasible assignments"],
  ["backward-chaining-trace", "Backward Chaining", "goal-driven inference", "start from the desired conclusion and work backward to required premises or actions"],
  ["forward-chaining-trace", "Forward Chaining", "data-driven inference", "start from known facts and apply rules until useful conclusions emerge"],
  ["proof-by-contradiction-trace", "Proof By Contradiction", "formal logic", "assume the opposite of the target claim and show that it creates an inconsistency"],
  ["proof-by-cases-trace", "Proof By Cases", "formal logic", "split the problem into exhaustive cases and prove the conclusion within each case"],
  ["syllogistic-trace", "Syllogistic Reasoning", "formal logic", "evaluate categorical premises and derive whether the conclusion follows"],
  ["predicate-logic-trace", "Predicate Logic Reasoning", "formal logic", "translate claims into predicates, quantifiers, and relations before deriving conclusions"],
  ["propositional-logic-trace", "Propositional Logic Reasoning", "formal logic", "represent claims as propositions and test implications, conjunctions, disjunctions, and negations"],
  ["ethical-matrix-trace", "Ethical Matrix", "ethical analysis", "compare affected groups against principles such as wellbeing, autonomy, fairness, and responsibility"],
  ["values-tradeoff-trace", "Values Tradeoff Reasoning", "ethical decision analysis", "make competing values explicit and explain which value prevails under which condition"],
  ["fairness-analysis-trace", "Fairness Analysis", "equity reasoning", "check who benefits, who bears costs, and whether criteria are consistent and justified"],
  ["legal-reasoning-trace", "Legal Reasoning", "rule and precedent analysis", "identify governing rules, apply them to facts, and distinguish contrary authorities"],
  ["policy-analysis-trace", "Policy Analysis", "public decision analysis", "compare policy options by goals, feasibility, effects, equity, and implementation risk"],
  ["historical-reasoning-trace", "Historical Reasoning", "contextual analysis", "interpret events through chronology, context, sources, causation, and contingency"],
  ["comparative-case-trace", "Comparative Case Reasoning", "case comparison", "compare cases systematically to isolate similarities, differences, and transfer limits"],
  ["narrative-reasoning-trace", "Narrative Reasoning", "story and causality analysis", "trace actors, motives, conflicts, turning points, and implied causal arcs"],
  ["ethnographic-reasoning-trace", "Ethnographic Reasoning", "contextual social analysis", "infer meaning from practices, language, setting, and participant perspective"],
  ["hermeneutic-trace", "Hermeneutic Reasoning", "interpretive analysis", "move between parts and whole to refine interpretation of a text, event, or artifact"],
  ["dialectical-trace", "Dialectical Reasoning", "tension synthesis", "develop thesis, antithesis, and synthesis while preserving the strongest opposing insight"],
  ["steelman-trace", "Steelman Reasoning", "argument improvement", "reconstruct the strongest version of an opposing argument before responding"],
  ["argument-map-trace", "Argument Mapping", "argument analysis", "turn claims, supports, objections, and rebuttals into a visible logical structure"],
  ["assumption-ladder-trace", "Assumption Ladder", "metacognitive analysis", "climb from observations to interpretations, beliefs, and actions while checking each rung"],
  ["metacognitive-audit-trace", "Metacognitive Audit", "thinking quality review", "inspect the reasoning process itself for bias, gaps, overconfidence, and poor framing"]
];

function main() {
  fs.mkdirSync(SKILLS_DIR, { recursive: true });

  let count = 0;
  for (const strategy of STRATEGIES) {
    const [baseName, title, family, flow] = strategy;

    for (const variant of VARIANTS) {
      const skillName = `${baseName}${variant.suffix}`;
      const skillDir = path.join(SKILLS_DIR, skillName);
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, "SKILL.md"), renderSkill({ skillName, title, family, flow, variant }));
      count += 1;
    }
  }

  console.log(`Generated ${count} reasoning trace skills from ${STRATEGIES.length} strategies.`);
}

function renderSkill({ skillName, title, family, flow, variant }) {
  const variantName = variant.display === "Default" ? "" : ` ${variant.display}`;
  const heading = `${title} Reasoning Trace${variantName}`;
  const description = `Use this skill when the user invokes /${skillName} or asks for a ${variant.label} public reasoning trace using ${title}. It writes a structured scratchpad to root memory/{question_name}.md and scales the trace to ${variant.lineInstruction}.`;

  return `---
name: ${skillName}
description: "${escapeYaml(description)}"
---

# ${heading}

## Goal
Use this skill to produce a public, audit-friendly reasoning trace for the user's question using the ${title} strategy.
Convert the question into a named investigation and write the scratchpad at the repository root under \`memory/{question_name}.md\`.
Keep the trace focused on inspectable reasoning artifacts such as assumptions, subquestions, evidence, checks, intermediate conclusions, and the final answer.
Do not expose hidden private chain-of-thought; provide a concise public scratchpad that captures the visible structure of the reasoning method.
Make the final response point to the scratchpad file and summarize the conclusion only after the file is written.

## Instructions
Derive \`{question_name}\` from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using \`reasoning-trace\` if no safe name remains.
Create the root \`memory\` directory if it does not already exist, then create or overwrite \`memory/{question_name}.md\` for this trace.
Start the scratchpad by naming the question, the selected strategy, the selected scale, and the exact required line budget.
Apply ${title} by using it to ${flow}, and make each numbered line advance that method rather than adding generic filler.
End by writing a final answer section that is consistent with the scratchpad and states any remaining uncertainty plainly.

## Background Information About The Reasoning Strategy
${title} is a ${family} strategy that gives the trace a specific shape instead of a loose stream of thoughts.
Its core move is to ${flow}, which helps the model expose reasoning checkpoints that a reader can inspect.
The strategy is useful when the user wants the answer to show how the conclusion was built, compared, challenged, or calibrated.
The main failure mode is treating the framework as decorative labels, so every line should do real work inside the chosen strategy.
The trace should preserve uncertainty, assumptions, and disconfirming evidence because those details make the final answer more trustworthy.

## Output Information
Write the scratchpad as Markdown in the root \`memory/{question_name}.md\` file before giving the user the final answer.
Include this exact scale statement near the top of the file: "${variant.lineStatement}"
Use numbered scratchpad lines so the requested line count can be verified without guessing.
Keep each line concise, but make it substantive enough to show the reasoning operation performed on that line.
After the scratchpad is complete, respond to the user with the file path, the selected strategy, the scale statement, and the final answer.

## Specify Files And Length And Structure Of Output
The only required artifact is \`memory/{question_name}.md\` at the repository root, and the directory name must be exactly \`memory\`.
${variant.lengthRule}
Structure the file with the sections \`Question\`, \`Strategy\`, \`Scale\`, \`Scratchpad\`, \`Synthesis\`, and \`Final Answer\`.
The \`Scratchpad\` section must contain the numbered trace lines, while \`Synthesis\` should compress the trace into a small set of takeaways.
If the user gives a format, domain, or evidence constraint, preserve it inside this structure while still meeting the ${variant.label} length requirement.
`;
}

function escapeYaml(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}

main();
