# Rubric: Job Interview

## Scoring Dimensions

### Specificity of Examples
**Weight:** 5
**Measures:** Whether the candidate uses concrete, verifiable details (names, numbers, timeframes, system context) rather than generic statements about what they "usually do."
**Score 1 — Weak:** Answer is entirely abstract or uses only platitudes ("I always prioritize communication," "We followed best practices"). No real event, number, or system mentioned.
**Score 3 — Adequate:** Answer references a real situation but stays at the surface — mentions the project name or tech but not the actual decision logic, tradeoffs, or measurable outcome.
**Score 5 — Strong:** Answer names a specific decision with real constraints ("we had a 200ms SLA and chose X over Y because Z"), describes the tradeoff reasoning, and connects it to an observable result.

### Handling Pushback
**Weight:** 4
**Measures:** How the candidate responds when Alex challenges an answer, asks a follow-up that exposes a gap, or explicitly says an answer wasn't specific enough.
**Score 1 — Weak:** Becomes defensive, deflects blame, repeats the same answer louder, or shuts down ("I mean, that's just how we did it").
**Score 3 — Adequate:** Accepts the pushback without becoming defensive but doesn't fully recover — provides slightly more detail but still stays vague.
**Score 5 — Strong:** Welcomes the probe, acknowledges where the previous answer was thin, and provides a materially more specific follow-up that demonstrates genuine reflection.

### Clarity of Communication
**Weight:** 4
**Measures:** Whether the candidate's answers are structured and easy to follow — not necessarily polished, but organized enough that a listener can track the logic.
**Score 1 — Weak:** Answer rambles, switches topics mid-sentence, or is so unstructured that the core point is unclear after two minutes.
**Score 3 — Adequate:** Answer has a rough structure but requires the listener to do significant work to extract the main point. Some unnecessary padding.
**Score 5 — Strong:** Answer is tight. The candidate leads with the core point, provides supporting detail in logical order, and stops when done.

### Self-Awareness
**Weight:** 3
**Measures:** Whether the candidate can accurately identify what they did well, what they did poorly, and what they genuinely learned — without either excessive self-criticism or self-serving spin.
**Score 1 — Weak:** Candidate presents past work as uniformly correct and acknowledges no real mistakes or growth areas. Or conversely, is so self-critical the answer becomes noise.
**Score 3 — Adequate:** Candidate acknowledges something went wrong but frames it as external ("the team moved fast," "requirements changed") without owning their part.
**Score 5 — Strong:** Candidate names a specific mistake or gap they owned, explains what they now understand that they didn't then, and does so without excessive hedging or self-flagellation.

### Technical Depth
**Weight:** 4
**Measures:** Whether the candidate demonstrates genuine systems-level understanding — not just tool familiarity, but judgment about tradeoffs, failure modes, and constraints.
**Score 1 — Weak:** Answer stays at the level of tool names or framework choices with no reasoning ("we used Kafka because that's what the team knew").
**Score 3 — Adequate:** Candidate shows awareness of tradeoffs but at a textbook level — cites common considerations without applying them to the specific situation described.
**Score 5 — Strong:** Candidate articulates why a specific constraint (latency, throughput, team size, failure tolerance) drove the decision, and shows awareness of what would need to change for a different choice to be correct.

## Overall Score
Weighted average: sum(score × weight) / sum(weights). Scale 1–5.
Weights sum: 20. Example: if scores are 4, 3, 5, 4, 3 → overall = (20+12+20+12+12)/20 = 3.8.

## Scoring Notes
Specificity and Technical Depth are the two highest-weighted dimensions because this is an engineering role where concrete thinking is the primary signal. A candidate who communicates clearly but lacks depth or specificity should not score above 3.5 overall.
