# Reasoning Strategy Research Notes

The reasoning trace skill collection was built from a web research pass across formal reasoning, structured analytic techniques, systems thinking, creative problem solving, decision analysis, and empirical inquiry.

## Source Themes

- Stanford Encyclopedia of Philosophy on analogical reasoning: analogies require mapping relevant similarities and guarding against weak transfers.
- MIT Open Encyclopedia of Cognitive Science on causal reasoning: causal models support causal and counterfactual inference and connect causal structure with Bayesian updating.
- Johnson-Laird's mental models research in PMC: reasoning often works by constructing models of possibilities and checking what follows from them.
- CIA Center for the Study of Intelligence, Richards Heuer's `Psychology of Intelligence Analysis`: structured techniques such as Analysis of Competing Hypotheses help analysts manage uncertainty, bias, and ambiguous evidence.
- Systems thinking literature in MDPI and systems dynamics sources: tools such as iceberg models, causal loop diagrams, stock-and-flow diagrams, and feedback loops support reasoning about complex systems.
- Creative problem-solving sources on Six Thinking Hats, SCAMPER, lateral thinking, design thinking, and TRIZ: these methods deliberately change the frame, generate alternatives, and separate creative and critical passes.
- IBM and AI reasoning overviews: modern reasoning taxonomies include symbolic, probabilistic, fuzzy, causal, and neuro-symbolic patterns, which informed several trace families.

## Design Implications

Each skill uses one named reasoning strategy as the organizing frame for a public scratchpad.
The scratchpad records visible reasoning artifacts rather than private hidden chain-of-thought.
Each strategy has four variants so slash invocations can trade off output length and test-time compute.
The default and medium variants require 100 numbered scratchpad lines, the small variant requires 25 lines, and the large variant requires 500+ lines.
Every skill writes to root `memory/{question_name}.md` so traces become durable project artifacts.

## Sources Consulted

- https://plato.stanford.edu/entries/reasoning-analogy/
- https://oecs.mit.edu/pub/ee7y4opg
- https://pmc.ncbi.nlm.nih.gov/articles/PMC2972923/
- https://www.cia.gov/resources/csi/books-monographs/psychology-of-intelligence-analysis-2/
- https://www.mdpi.com/2079-8954/8/2/14
- https://umbrex.com/resources/frameworks/organization-frameworks/system-dynamics-feedback-loop-models/
- https://www.imd.org/blog/innovation/scamper-method-design-thinking/
- https://miro.com/brainstorming/what-is-creative-problem-solving/
- https://www.ibm.com/think/topics/ai-reasoning
