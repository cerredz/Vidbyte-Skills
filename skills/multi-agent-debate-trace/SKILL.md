---
name: multi-agent-debate-trace
description: >
  Use this skill when the user invokes /multi-agent-debate-trace or asks for a default public reasoning trace using Multi-Agent Debate.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Multi-Agent Debate as the actual structure of the analysis.
  The strategy simulates multiple heterogeneous LLM agents with distinct roles who independently reason, then engage in structured debate rounds
  critiquing and revising each other's answers toward consensus. Based on the Society of Mind theory, debate allows agents to improve factuality
  and logical consistency. Newer frameworks like A-HMAD use heterogeneous agents with distinct roles and dynamic debate routing.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by adversarial collaboration between distinct perspectives.
---

# Multi-Agent Debate Reasoning Trace

## Goal
Use Multi-Agent Debate to answer the user's question through structured adversarial collaboration between distinct perspectives, not through a single chain of thought or generic response.
The trace should simulate multiple heterogeneous agents with distinct roles who independently reason, critique each other, and revise toward consensus, so the visible reasoning shows how disagreement is resolved (or persists).
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on each agent's initial position, the critique rounds, revisions, and final convergence or persistent disagreement, because those artifacts make debate useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming where agents persistently disagree, what evidence each relies on, and what the crux of unresolved disagreement is.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Multi-Agent Debate move: define heterogeneous agents with distinct roles, run independent reasoning, then conduct structured critique and revision rounds toward consensus.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Multi-Agent Debate is a reasoning strategy where multiple LLM instances argue and critique each other's answers toward consensus.
Based on the Society of Mind theory, debate allows several agents to answer each other in turn, critique and revise each other, improving factuality and logical consistency on complex reasoning tasks.
However, current MAD frameworks have a notable empirical finding: they fail to consistently outperform simple single-agent test-time computation strategies. Newer work like A-HMAD attempts to rescue the core idea by using heterogeneous agents with distinct roles and dynamic debate routing rather than homogeneous agents with majority voting.
It should give the output document a visible debate structure with initial positions, critique rounds, revisions, and final convergence or characterized disagreement, so the reader can see how the answer was reached without exposing hidden private chain-of-thought.
Use it when the problem benefits from the core move "simulate heterogeneous agents with distinct roles who independently reason, critique each other in structured rounds, and revise toward consensus" and when the final answer needs adversarial stress-testing from multiple perspectives.
A strong Multi-Agent Debate trace shows distinct agent identities, substantive critiques (not strawmen), genuine revision, and transparent handling of persistent disagreement.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard, then define 3 heterogeneous agents with distinct roles (e.g., Optimizer/opportunity-focused, Skeptic/risk-focused, Integrator/systems-focused).
2. Round 1 — Initial Positions: Each agent independently reasons through the problem and states their conclusion with full reasoning.
3. Round 2 — Critique: Each agent critiques the other agents' positions, identifying specific weaknesses, missing evidence, or logical gaps. No agent critiques itself.
4. Round 3 — Revision: Each agent revises their position in light of the critiques received, acknowledging valid points and defending against invalid ones with reasoning.
5. Final Round — Convergence: Attempt to converge on a consensus position. If consensus is reached, state it and the reasoning. If not, clearly characterize the crux of persistent disagreement and present the strongest positions.
6. Record assumptions, missing evidence, and confidence changes throughout, noting which evidence each agent relies on and where agents share or differ in their assumptions.
7. Synthesize the completed trace into the final answer, showing how the conclusion follows from the debate process rather than from a single perspective.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should contain an Agent Definitions section that names each agent and its role, then dedicated subsections for each debate round (Round 1: Initial Positions, Round 2: Critique, Round 3: Revision, Final Round: Convergence).
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, and whether consensus was reached or disagreement persists.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, use an Agent Definitions subsection, then dedicated subsections for each debate round, and a Convergence subsection for the final outcome.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
