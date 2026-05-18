---
name: curriculum-learning-trace
description: >
  Use this skill when the user invokes /curriculum-learning-trace or asks for a default public reasoning trace using Curriculum Learning.
  The skill writes a durable scratchpad to root memory/{question_name}.md and uses Curriculum Learning as the actual structure of the analysis.
  The strategy first solves easy "proxy" queries related to the target question, then gradually presents harder versions, with each solved
  sub-problem serving as a stepping stone to the next. The reasoning trace builds up incrementally through solved sub-problems before
  confronting the hard target — contrasting with CoT which jumps straight at the full problem.
  Treat the scale as a rough effort target rather than a fixed quota: around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail.
  Use this skill when the user wants the answer shaped by progressive difficulty scaffolding instead of a direct frontal assault.
---

# Curriculum Learning Reasoning Trace

## Goal
Use Curriculum Learning to answer the user's question through progressive difficulty scaffolding, not through a direct frontal assault on the full problem or generic response.
The trace should define a curriculum of progressively harder sub-problems, solve each as a stepping stone, and use the accumulated solutions to tackle the target question, so the visible reasoning shows how the answer is built incrementally.
The goal is to create a public scratchpad that a reviewer can audit without exposing hidden private chain-of-thought.
Center the scratchpad on the curriculum design, each solved stepping-stone problem, and how each builds toward the target, because those artifacts make curriculum learning useful rather than decorative.
Preserve the user's domain, constraints, definitions, and evidence standards so the trace stays tied to the actual task.
Keep uncertainty visible by naming where stepping stones may not fully transfer, where the target introduces qualitatively new difficulty, and what assumptions carry forward.
Write the result to root memory/{question_name}.md so the reasoning trace becomes a durable project artifact.

## Instructions
Derive {question_name} from the user's actual question by lowercasing it, replacing non-alphanumeric runs with hyphens, trimming extra hyphens, and using reasoning-trace if no safe name remains.
Create the root memory directory when needed, then write or replace memory/{question_name}.md with this trace.
Start the file with the question, selected strategy, scale note, source constraints, and a brief statement of what the trace will inspect.
Build the scratchpad by repeatedly applying the Curriculum Learning move: define a curriculum of progressively harder proxy problems, solve each as a stepping stone, and use the accumulated solutions to tackle the target question.
Use a medium-depth trace by default, usually around 100 numbered lines, unless the user asks for a different depth.
Prefer concise public reasoning artifacts over hidden deliberation, and make every numbered item contribute a question, observation, test, comparison, inference, or synthesis.
End the file with a synthesis and final answer that follow from the trace, including any important uncertainty that remains.

## Background Information About The Reasoning Strategy
Curriculum Learning is a reasoning strategy that scaffolds problem-solving through progressive difficulty levels.
Rather than exposing the model to the full problem uniformly, it first steers the model to solve easy "proxy" queries related to the target query, then gradually presents harder versions of the problem.
The easy queries and solutions serve as stepping stones, forming a curriculum for the chain of thought.
The reasoning trace builds up incrementally through solved sub-problems before confronting the hard target — contrasting with CoT which jumps straight at the full problem. This approach is particularly effective when the target problem has many interdependent components or when the solver needs to build intuition before tackling the full complexity.
It should give the output document a visible curriculum structure: the stepping-stone problems in order of difficulty, their solutions, and how each solution enables the next, culminating in the target problem solution.
Use it when the problem benefits from the core move "define a curriculum of easy-to-hard proxy problems, solve each as a stepping stone, and build up to the target" and when the problem is complex enough that a direct assault risks getting overwhelmed by interdependent details.

Algorithm for the output document:
1. Restate the user's question, constraints, and evidence standard.
2. **Design the Curriculum**: Analyze the target problem and decompose it into a sequence of 3-5 progressively harder proxy problems. Start with the simplest version that captures the core dynamic (removing complexity), then add layers of difficulty until reaching the target. Each step should build directly on the previous one.
3. **Solve Step-by-Step**: For each stepping-stone problem in order (easiest first):
   - State the simplified problem clearly
   - Solve it completely, recording the reasoning and solution
   - Identify what this solution teaches that transfers to the next step
4. **Confront the Target**: Apply the accumulated insights, patterns, and solutions from the curriculum to solve the original target problem. Use the stepping-stone solutions as building blocks or analogical anchors.
5. Record assumptions about which simplifications were made, where the curriculum may have omitted important complexity, and what insights transfer fully versus partially.
6. Synthesize the completed trace into the final answer, showing how the conclusion follows from the accumulated curriculum rather than from a single direct attempt.

## Output Information
Write the scratchpad as Markdown in root memory/{question_name}.md before responding to the user.
Include this scale note near the top of the file: "Scale: default - aim for around 100 numbered lines, or roughly 2,000 to 3,500 tokens, while adapting to the real complexity of the question."
Use numbered scratchpad items for scanability, but treat the number target as approximate and subordinate to usefulness.
The scratchpad should contain a Curriculum Design subsection that defines the stepping-stone problems, then dedicated subsections for each stepping stone's solution, and a Target Solution subsection that applies the accumulated curriculum.
Keep the scratchpad public, inspectable, and concise enough per line that the structure remains easy to review.
After writing the file, respond with the path, selected strategy, scale note, final answer summary, and note which stepping stones were most critical to the target solution.

## Specify Files And Length And Structure Of Output
Write the artifact to memory/{question_name}.md at the repository root, using the literal memory directory name.
Structure the file with the sections Question, Strategy, Scale, Scratchpad, Synthesis, and Final Answer.
Within Scratchpad, use a Curriculum Design subsection, then dedicated subsections for each stepping-stone problem solution, and a Target Solution subsection that applies the accumulated curriculum.
The Scratchpad section should target around 100 numbered lines or roughly 2,000 to 3,500 tokens of public scratchpad detail, adjusted reasonably for very small or unusually broad questions.
Use subsections inside Scratchpad when the trace becomes long enough that phases, branches, hypotheses, cases, or criteria would improve readability.
If the user supplies a domain format, evidence source, or output constraint, preserve it inside this structure while keeping the default scale approximate.
