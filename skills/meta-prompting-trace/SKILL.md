---
name: meta-prompting-trace
description: >
  Use this skill when the user invokes /meta-prompting-trace or asks for a default public reasoning trace using Meta-Prompting.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Meta-Prompting as the actual structure of the analysis.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by single-model conductor orchestrating a panel of expert perspectives instead of a generic response.
---

# Meta-Prompting Reasoning Trace

## Goal
Use Meta-Prompting to answer the user's question through single-model conductor orchestrating a panel of expert perspectives, not through a generic checklist or interchangeable trace.
The trace should decompose the problem into subtasks, assign each to a tailored expert persona with specific instructions, collect independent expert contributions, and synthesize them as the conductor, so the visible reasoning follows the same path the strategy is known for.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on subquestions, assumptions, evidence, contrasts, tests, intermediate conclusions, and implications, because those artifacts make meta-prompting useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming weak assumptions, missing evidence, rival interpretations, and confidence changes as they arise.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Intent
Meta-Prompting trace is invoked when the problem requires genuine multi-perspective analysis where different expert lenses would produce different answers, and the user needs those perspectives to be weighed and synthesized by a coordinating intelligence rather than presented as a simple list of opinions. Unlike multi-agent approaches that require separate model deployments or API calls, Meta-Prompting operates entirely within a single context window — the same model plays the conductor role and all expert roles — making it dramatically more cost-effective while preserving the benefit of specialized perspective-taking. The conductor is not just a vote-counter; it actively deconstructs the problem, assigns sub-questions to the right experts, collects their contributions, reconciles conflicts, and produces an integrated answer that no single expert could have produced alone.

A user would select this trace over a generic trace when the problem sits at the intersection of multiple domains and no single analytical framework is sufficient — for example, evaluating the feasibility of a new technology requires technical, economic, regulatory, and ethical perspectives that must be synthesized rather than simply listed. The strategy prevents the "single-perspective blind spot" failure mode where a generic trace implicitly adopts one framing and misses considerations visible only from other framings. By making the conductor's synthesis logic explicit — what was weighted, what was reconciled, what was set aside and why — the trace produces an audit artifact where the reviewer can see not just the final answer but the deliberative process that integrated competing expert views.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Meta-Prompting move: act as a conductor that deconstructs the problem into subtasks, assigns each to a distinct expert persona within the same context, and synthesizes their contributions.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Meta-Prompting transforms a single language model into a multi-faceted conductor that manages and integrates multiple independent expert queries within the same context window. High-level instructions guide the model to deconstruct complex tasks into smaller subtasks, which are then handled by distinct expert instances of the same model each operating under specific tailored instructions. This is architecturally distinct from multi-agent systems because it is one model playing all roles rather than multiple separate deployments ΓÇö substantially reducing computational overhead while still gaining the benefit of specialized perspectives. Research from 2024 demonstrates that meta-prompting achieves performance competitive with multi-agent systems while being significantly more cost-effective.
It should give the output document a visible conductor's task decomposition, each expert's contribution under their persona, and the conductor's synthesis, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "act as a conductor that deconstructs the problem into subtasks, assigns each to a distinct expert persona within the same context, and synthesizes their contributions" and when the final answer needs multi-perspective analysis with explicit reconciliation of expert disagreements.
A strong Meta-Prompting trace shows distinct expert voices, makes the conductor's synthesis logic explicit, and surfaces where experts agree or disagree.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then identify which specialized perspectives the problem requires.
2. Define 3-5 expert personas, each with a specific domain focus and tailored reasoning instructions relevant to the problem's sub-questions.
3. As conductor, assign each sub-question to the appropriate expert, collecting each expert's independent analysis within the structured trace.
4. Synthesize expert contributions as the conductor: reconcile conflicts, weight contributions by relevance, and build the integrated answer.
5. Record all expert contributions and the conductor's synthesis, showing how the final answer integrates perspectives rather than favoring a single view.

## Implementation Details
Meta-Prompting was introduced by Suzgun and Kalai (2024) in "Meta-Prompting: Enhancing Language Models with Task-Agnostic Scaffolding," which proposed a framework where a single language model acts as a conductor orchestrating multiple expert queries within the same context window. The paper demonstrated that this approach achieves performance competitive with multi-agent systems — matching or exceeding the accuracy of systems that deploy separate model instances for each role — while being significantly more cost-effective because all roles run within a single inference. The key architectural insight is that role specialization does not require architectural separation; the same model can adopt different personas effectively when given tailored instructions within the same context.

The technical mechanism works through a three-layer architecture: the conductor (meta-layer) analyzes the problem, decomposes it into sub-questions, and defines expert personas with tailored instructions; the expert layer consists of the same model adopting each persona sequentially and producing independent analyses for their assigned sub-questions; and the synthesis layer has the conductor reconcile expert contributions, weighting them by relevance, resolving conflicts, and building the integrated answer. This is structurally different from multi-agent systems like AutoGen (Wu et al., 2023) or CAMEL (Li et al., 2023) where each agent is a separate model instance with its own message history — Meta-Prompting achieves similar benefits with a fraction of the computational overhead because all roles share the same context window and attention computation.

For Vidbyte reasoning traces, Meta-Prompting requires 3-5 distinct expert personas, each with a clearly defined domain focus and tailored reasoning instructions. The conductor's role must be visible: it decomposes the problem, assigns sub-questions to experts, and synthesizes contributions. Each expert's contribution should be labeled and attributed to that persona, with distinct analytical styles that reflect their specialization — the legal expert should sound different from the technical expert. The synthesis must explicitly handle conflicts between experts, not paper over them, and the final answer should reflect an integration of perspectives that no single expert could have produced alone.

The broader context includes work on ensemble methods and mixture-of-experts architectures (Shazeer et al., 2017) which similarly combine specialized sub-modules. Meta-Prompting differs by implementing this specialization at the prompting level rather than at the architecture level, making it applicable to any instruction-tuned LLM without model modification.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, and final answer summary.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.

## Things Not to Do
- Do not define expert personas that are too similar — if two experts would give the same analysis, one is redundant, and the strategy loses the multi-perspective benefit that justifies its overhead.
- Do not let the conductor delegate all work to experts without contributing its own synthesis — the conductor must actively reconcile, weight, and integrate expert contributions; simply collecting them is not meta-prompting.
- Do not suppress expert disagreements in the synthesis — if experts disagree on a substantive point, the trace must surface the disagreement and explain the resolution, not silently pick one side.
- Do not let expert contributions cross-contaminate — each expert should reason independently based on their assigned sub-question, not respond to or rebut other experts' analyses within their section.
- Do not skip the conductor's decomposition step — the trace must show what sub-questions were identified and why each was assigned to a particular expert, so the reviewer can assess whether the decomposition was valid.
- Do not present expert contributions without attribution — every section of the trace must clearly label which persona produced it, so the reviewer can evaluate whether the persona's perspective was authentically represented.
- Do not use generic expert names ("Expert 1," "Expert 2") when domain-specific names would better communicate the analytical lens — "Regulatory Compliance Analyst" tells the reviewer more than a generic label.
- Do not write the trace to a location other than memory/{question_name}.md at the repository root.
