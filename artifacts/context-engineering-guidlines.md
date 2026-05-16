# Context Engineering Guidlines

**Note:** Not every prompt needs every section in this file. This is a collection of common prompt engineering styles we use — pick the sections that fit the task at hand. A simple prompt may only need `identity`, `goal`, and `success criteria`. Use more sections when the task requires deeper structure, but never add sections just to make the prompt longer.

This file is a reusable guide for common context-engineering prompt sections. Each section explains what that prompt section is, why it belongs in a prompt, and how it should influence the model's response. The filename intentionally uses `guidlines` to match the requested artifact name.

## identity

The `identity` section tells the model who it should be for the task. It defines the role, domain, standards, and working posture the model should adopt before it begins answering. The intent is to move the model out of generic assistant mode and into a specific expert frame. A strong identity section does not just say that the model is excellent; it explains what excellent behavior looks like for this kind of work.

This section should make the model care about the right signals, tradeoffs, and failure modes. It helps the model choose the vocabulary, depth, and judgment style that fit the task. In the response, identity should show up as task-appropriate expertise rather than as a visible self-description. The user should feel the role through the quality and focus of the answer, not through repeated claims about who the model is.

## goal

The `goal` section states the exact outcome the prompt is trying to produce. It explains what the model should accomplish, what the result should enable, and what success should look like from the user's point of view. The intent is to give the model a stable target when the task contains many possible directions. A clear goal prevents the response from optimizing for vague helpfulness or interesting side details.

This section should be specific enough to guide choices but broad enough to cover the whole task. It helps the model decide what to include, what to leave out, and when the answer is complete. In the response, the goal should show up as direct movement toward the requested outcome. The final answer should feel purposeful because every part of it serves the stated result.

## success criteria

The `success criteria` section defines the conditions the model must satisfy before it can stop. It turns completion into observable checks instead of a loose feeling that the answer is probably good enough. The intent is to prevent premature stopping, missing requirements, and answers that sound polished but fail the actual task. Success criteria are especially useful when the work has multiple requirements, quality bars, or edge cases.

This section should describe what must be true about the final answer, artifact, decision, or implementation. It gives the model a way to compare its work against the user's expectations before responding. In the response, success criteria should show up as completeness, coverage, and fewer accidental omissions. The model does not need to print the checklist unless asked; it should use the criteria to control the quality of the final output.

## algorithm

The `algorithm` section gives the model an ordered sequence of steps to follow during execution. It is the procedural core of the prompt: what to check first, what to do next, what branch to take when information is missing, and when to stop. Without an algorithm, the model may start working before it has the right information, skip a validation step, or forget to stop when the work is done. The intent is to turn the prompt from a loose set of preferences into a repeatable procedure that handles normal cases, missing-context cases, and failure cases. An algorithm is most useful when the task has a natural dependency order, when missing information changes what should happen next, or when the work spans multiple tools or rounds of interaction. It turns a good prompt into a reliable one by making execution predictable.

This section should use numbered steps with clear branch conditions. Each step should name an action and the condition that triggers the next step. Keep the steps literal enough that another prompt author could simulate the model's path through the task. An algorithm should cover the happy path, the missing-context path, and at least one failure path so the model never stalls or guesses. It works best when paired with a success criteria section that defines when the algorithm has reached completion. In the response, the algorithm should produce consistent execution order and predictable branching. The user should notice that the model handles edge cases, missing information, and completion in a structured way rather than improvising.

## intuition

The `intuition` section explains the deeper logic behind the prompt. It describes why the prompt is structured the way it is and what the model should understand beyond the surface task. The intent is to help the model apply the instructions intelligently instead of following them mechanically. This section is useful when the prompt depends on judgment, adaptation, or a particular way of thinking.

This section should clarify the conceptual pattern that makes the task work. It can explain the failure mode the prompt is trying to avoid, the leverage point it is trying to use, or the behavior it is trying to create. In the response, intuition should show up as coherent judgment when the situation is messy or incomplete. The answer should reflect the purpose behind the instructions, not just the literal wording of each step.

## definition

The `definition` section pins down a term, concept, or standard that could otherwise be interpreted in multiple plausible ways. It is useful when a prompt depends on words like depth, transfer, evidence, coverage, autonomy, quality, or success that sound clear but carry different meanings across domains. The intent is to prevent the model from silently choosing one interpretation and then building the rest of the response on that hidden choice. A definition section should state what the term means in this prompt and what it does not mean.

This section should make the final response more stable by giving the model a shared reference point for judgment. It should be concrete enough to guide decisions, but not so narrow that it removes necessary flexibility. Use it for concepts that are open to interpretation, not for ordinary words whose meaning is already obvious in context. The user should notice fewer vague labels and more consistent application of the defined idea.

## things to look for

The `things to look for` section gives the model a scanning checklist of signals, patterns, or failure modes that should be noticed during the task. It is useful when the model needs to observe behavior over time, audit a prompt, review an artifact, or catch repeated blind spots that are easy to miss in a single pass. The intent is to turn vague awareness into explicit attention targets. Each item should describe a signal and explain why it matters.

This section should make the response or artifact more observant and less generic. It should not become a loose list of advice; every item should point to something the model can actually detect in user input, work products, or session flow. For background skills, the list can guide what gets logged without interrupting the user. The user should notice that repeated patterns are captured more precisely and that feedback is tied to observable behavior.

## checklist

The `checklist` section lists concrete actions or checks the model should remember while doing the work. It is different from success criteria because it focuses on execution steps rather than final stopping conditions. The intent is to keep important obligations visible so the model does not drop them while concentrating on the main answer. A checklist is useful for repeated tasks, common omissions, and quality controls that are easy to forget.

This section should be practical, action-oriented, and short enough for the model to scan. It should name the behaviors the model must actually perform, such as checking constraints, preserving user intent, or verifying an edge case. In the response, the checklist should show up as careful execution rather than as unnecessary process narration. The final output should be cleaner because the model used the checklist to catch problems before answering.

## internal_monolog

The `internal_monolog` section tells the model what to privately attend to while it works. It names the constraints, quality signals, doubts, and drift risks the model should monitor during execution. The intent is to guide attention without asking the model to reveal hidden chain-of-thought or private scratchpad content. This section should improve self-monitoring while keeping the final response concise and useful.

This section should be phrased as private execution guidance, not as a request to show every thought. It can tell the model to notice unsupported assumptions, generic phrasing, missed constraints, or details that no longer serve the goal. In the response, internal monologue should show up only through better decisions, clearer caveats, and more relevant conclusions. The model should surface useful rationale and uncertainty, but it should not print private internal reasoning.

## internal reasoning

The `internal reasoning` section defines the reasoning standards the model should apply before it answers. It can tell the model how to test assumptions, compare alternatives, verify evidence, handle uncertainty, and decide whether the result is complete. The intent is to make the model's private evaluation more rigorous without making the final answer noisy. This section is useful when correctness, judgment, or tradeoff quality matters.

This section should describe the checks the model should run internally, not demand a transcript of those checks. It should help the model find weak logic, missing evidence, hidden assumptions, or unsupported conclusions before the user sees the answer. In the response, internal reasoning should show up as stronger conclusions, clearer justification, and appropriate uncertainty. The user should receive the useful outcome of the reasoning process, not the full private chain-of-thought.

## output style

The `output style` section tells the model how the final response should look and feel. It is about the shape, tone, density, organization, and presentation of the model's answer to the user. The intent is to make the response match the task, audience, and use case instead of defaulting to a generic assistant format. This section is its own prompt section, not a repeated subsection inside every other section.

This section should specify response qualities such as prose versus bullets, concise versus detailed, formal versus direct, or explanatory versus artifact-focused. It should avoid restating the goal and should focus only on how the final answer should be delivered. In the response, output style should show up as the chosen structure and voice of the answer. The model should follow the style in a way that supports the user's work rather than making formatting the center of the response.

## context

The `context` section gives the model the background information it needs to answer correctly. It can include facts about the user, the project, the codebase, the organization, the industry, or the specific situation. The intent is to prevent the model from working from generic assumptions when the real answer depends on specifics. Without context, even a well-structured prompt can produce an answer that is technically correct but practically wrong.

This section should include only information that affects the answer materially. Avoid dumping irrelevant history or organizational trivia that the model does not need. The best context is specific, verifiable, and directly tied to a decision the model must make. In the response, good context should show up as decisions that fit the actual situation rather than generic best-practice answers. The model should reference the context only when it changes the recommendation.

**Short example:** `Context: The CRM is Salesforce Enterprise Edition with 2,000 licensed users. The integration must use the REST API via a connected app with OAuth 2.0. The middleware is Node.js 20 on AWS Lambda. The sync must complete within 60 seconds of a contact being updated. The data volume is approximately 50,000 contacts and 5,000 accounts.`

## scope

The `scope` section defines what the task covers and what it explicitly excludes. It prevents the model from expanding the work into adjacent areas that were not requested. The intent is to set a clear boundary so the model knows where its responsibility ends. This is especially important for open-ended tasks like reviews, audits, and investigations where the natural tendency is to keep going.

This section should name the files, modules, features, domains, or topics that are in scope and those that are out of scope. It should be specific enough that the model can recognize when it is about to cross the boundary. In the response, scope should show up as focused work that stays within the defined limits. The model should pause and ask before expanding beyond the stated scope, even when the adjacent work seems related or valuable.

**Short example:** `Scope: In scope — the payment processing module (src/payments/), specifically credit card validation, charge creation, and refund handling. Out of scope — the subscription billing UI, the invoice PDF generator, the webhook handlers from Stripe, and any changes to the database schema for the payments table.`

## constraints

The `constraints` section lists external limits the model must respect. These can include technical constraints like no new dependencies, no backend changes, or no database migrations; organizational constraints like budget caps, deadline dates, or team availability; or content constraints like prohibited topics, protected data types, or compliance requirements. The intent is to prevent the model from proposing solutions that are impossible or unacceptable in the real environment.

This section should name each constraint explicitly and explain why it exists when the reason is not obvious. A constraint like "no new dependencies" is clearer when accompanied by "because the security review process adds three weeks per dependency." In the response, constraints should show up as realistic answers that work within the real limits. The model should not argue against constraints or propose workarounds unless the user explicitly asks for alternatives.

**Short example:** `Constraints: No new npm dependencies (security review adds 2 weeks per package). No database schema changes (migrations require DBA approval with a 5-day lead time). The public API must remain backward-compatible (three mobile app versions in the field depend on the current response shape). The solution must work within the existing Express.js server (no new services or infrastructure). Deadline is Friday end of day.`

## assumptions

The `assumptions` section names what the model should take as given rather than questioning or verifying. It is the opposite of a things-to-look-for section: instead of telling the model what to check, it tells the model what to trust. The intent is to save time and focus by signaling which parts of the problem are settled and which parts are still open.

This section should list each assumption clearly and state its scope. An assumption like "the database schema is stable" is stronger than "we're using Postgres" because it signals what the model should not question. In the response, assumptions should show up as confident forward progress on settled ground and appropriate caution on open ground. The model should still flag an assumption if it detects evidence that the assumption may be false for the specific situation at hand.

**Short example:** `Assumptions: The PostgreSQL connection pool handles up to 50 concurrent connections safely. The Redis cache is available and has no TTL eviction issues under current load. The third-party payment API is stable and its v2 endpoint has been tested in staging. These assumptions were verified in the last quarter. If any assumption fails, the model should flag it before proceeding.`

## edge cases

The `edge cases` section lists specific unusual scenarios the model must handle correctly. It prevents a solution from working only on the happy path by naming the boundary conditions, error states, empty inputs, maximum values, concurrent operations, or rare combinations that the model should verify. The intent is to force the model to test its own work against the cases most likely to break it.

This section should name edge cases concretely rather than abstractly. "Handle empty input" is weaker than "handle an empty CSV file with headers but zero data rows" because the concrete version gives the model a specific scenario to imagine. In the response, edge cases should show up as robust handling and explicit acknowledgment of limits. The model should not claim completeness for an edge case it cannot verify with the available information.

**Short example:** `Edge cases: An empty CSV file with headers but no data rows, a row where the email field contains a pipe character, a row where the date is in DD/MM/YYYY format instead of ISO, a row where the amount field contains a currency symbol, duplicate rows with identical transaction IDs, and a file where the column order differs from the expected schema. Each edge case must have a defined resolution: skip, transform, or reject with a specific error message.`

## tone

The `tone` section defines the voice, density, vocabulary, and emotional posture the model should use in its response. It is about how the model communicates, not what it communicates. The intent is to match the response to the audience and situation: a support engineer needs a different tone than a strategy consultant, and a postmortem author needs a different tone than a marketing copywriter.

This section should describe tone in observable terms rather than vague adjectives. "Professional" is too broad; "concise, direct, no cheerleading, every claim backed by evidence" is specific enough for the model to execute. In the response, tone should show up as the natural voice of the answer. The user should feel the right register without noticing that it was specified. The model should maintain the tone consistently throughout the entire response, not just in the opening paragraph.

**Short example:** `Tone: Concise and direct — prefer short sentences with concrete nouns. No cheerleading phrases like "Great question!" or "I'd be happy to help with that." No hedging with phrases like "you might want to consider" when the prompt calls for a recommendation. Every claim about code behavior is backed by a line reference or a runnable command. The tone should feel like a senior colleague who values the reader's time.`

## iteration

The `iteration` section defines how the model should handle rounds of revision, feedback, or progressive refinement. It sets expectations about how many rounds are acceptable, what kind of feedback to expect, and when to consider the work done even if it is not perfect. The intent is to prevent both premature finalization and infinite polishing. This section is especially useful for writing, design, code review, and planning tasks where the first pass is rarely the final answer.

This section should specify the maximum number of revision rounds, the type of feedback the model should solicit, and the stopping condition for iteration. It should also define what the model should preserve across rounds and what should evolve. In the response, iteration should show up as progressive refinement without loss of earlier gains. The model should track what changed between rounds so the user can see the evolution.

**Short example:** `Iteration: Maximum two rounds. After the first draft, ask the user to confirm three specific dimensions: (1) does the structure match their mental model, (2) are the recommended actions specific enough to execute, and (3) is anything important missing. Incorporate the user's answers into one revision. After that revision, assume the document is final unless the user explicitly requests another pass.`

## cross-domain examples

The `cross-domain examples` section gives the model diverse examples of the same prompt behavior across unrelated real-world domains. It shows the model the invariant pattern beneath different surface topics. The intent is to prevent the prompt from overfitting to a single domain's vocabulary and to help the model recognize the underlying move when the user's request comes from an unfamiliar area. Models generalize better when they see the same behavior expressed across software, medicine, law, finance, education, operations, and other fields.

This section should use short examples with the same shape repeated across domains. Each example should name the domain, show a realistic user prompt or situation, and show the kind of model response the skill should produce. Keep examples concrete enough to model interaction, not just abstract use cases. In the response, cross-domain examples should produce consistent behavior regardless of the user's domain. The model should recognize the pattern even when the surface topic changes.

### Example 1: Software Engineering — identity

User: "Write an identity section for a prompt that reviews database migrations."

Model: "You are a senior database reliability engineer who has reviewed hundreds of production migrations. You know the difference between a migration that runs correctly and one that runs safely under load. You check for lock duration, rollback completeness, backfill correctness, index impact, and data integrity risks. You assume every migration runs against a live production system with real traffic."

### Example 2: Medicine — goal

User: "Write a goal section for a prompt that helps triage emergency department patients."

Model: "Your goal is to produce a prioritized triage recommendation from the available patient data so that the triage nurse can assign the right acuity level within three minutes. The output must include the recommended ESI level, the key findings that support it, the vital sign thresholds that would upgrade the level, and any missing information that could change the decision. The work is complete when a nurse could act on the recommendation without re-evaluating the entire chart."

### Example 3: Law — success criteria

User: "Write success criteria for a prompt that drafts a cease-and-desist letter."

Model: "- The letter names the specific infringing conduct with dates and evidence references. - The letter cites the legal basis for the demand. - The letter states a clear compliance deadline and the consequences of non-compliance. - The letter preserves factual accuracy that would withstand a subsequent defamation claim. - The letter avoids language that could be interpreted as extortion or bad-faith negotiation. - The tone is firm but professional, not threatening."

### Example 4: Finance — intuition

User: "Write an intuition section for a prompt that evaluates startup investment memos."

Model: "This prompt is trying to surface hidden risks that the memo author is incentivized to downplay, not merely to summarize what the memo already says. The core idea is that every investment memo tells a story, and the story is strongest where the evidence is weakest. The model should treat missing data, hand-waved assumptions, and comparisons to cherry-picked benchmarks as signals that the underlying thesis needs more scrutiny. This prompt prevents confirmation bias by forcing the model to list what would have to be true for the investment to fail before evaluating what would have to be true for it to succeed."

### Example 5: Product Management — definition

User: "Write a definition section for a prompt about defining 'done' for feature work."

Model: "In this prompt, 'done' means the feature is deployed to production, the feature flag is enabled for all target users, the monitoring dashboard shows normal error rates for 24 hours, the customer-facing documentation is published, and the internal runbook is updated. 'Done' does not mean the code is merged, the PR is approved, the QA environment passes, or the feature is 'ready to ship.' It specifically means the feature is live and stable for end users."

### Example 6: DevOps — algorithm

User: "Write an algorithm section for a prompt that handles incident response."

Model: "1. Confirm whether this is an active incident or a retrospective review. If retrospective, skip to step 5. 2. Identify the affected service, the symptom, and the customer impact. 3. Check whether a runbook exists for this symptom. If yes, follow it; if no, proceed to diagnosis. 4. Determine whether the incident requires escalation. If the incident exceeds 15 minutes of customer impact or affects a critical path, escalate to the on-call manager. 5. Document the timeline, root cause, contributing factors, customer impact duration, and remediation steps. 6. Draft a postmortem entry. Stop after all fields are complete."

### Example 7: Education — checklist

User: "Write a checklist section for a prompt that creates lesson plans."

Model: "- Identify the prerequisite knowledge students must have before this lesson. - State the single learning objective in observable terms. - Include at least one retrieval practice activity before new instruction. - Include at least one worked example with fading support. - Check that the exit ticket directly measures the stated learning objective. - Verify that the plan fits within the stated time limit. - Remove any content that does not directly serve the learning objective."

### Example 8: Aviation — things to look for

User: "Write a things-to-look-for section for a prompt that reviews pre-flight checklists."

Model: "- Look for items listed as 'checked' without a specific reading or measurement. - Look for deferred maintenance items that have aged beyond their deferral window. - Look for weather minimums stated without the specific source and timestamp of the weather data. - Look for fuel calculations that use estimated rather than measured quantities. - Look for weight-and-balance entries that omit passenger or cargo weights. Each of these signals indicates a checklist being completed from memory rather than from measurement."

### Example 9: Data Science — context

User: "Write a context section for a prompt that builds a churn prediction model."

Model: "The business has 50,000 subscribers on a monthly plan with an average lifetime of 14 months. Current churn rate is 4.2% per month. The product team suspects that churn spikes after the first billing cycle and again after six months. The available data includes account creation date, plan tier, support ticket history, login frequency, feature usage events, and billing history. The model must run in the existing Python data pipeline on a weekly schedule. The output is used by the customer success team to prioritize outreach, so false positives (contacting customers who would not have churned) are more acceptable than false negatives (missing customers who will churn)."

### Example 10: Academic Research — scope

User: "Write a scope section for a prompt that conducts a literature review."

Model: "In scope: peer-reviewed studies published between 2015 and 2025, indexed in PubMed and Scopus, examining the effect of retrieval practice on long-term retention in undergraduate STEM courses. Include meta-analyses, randomized controlled trials, and quasi-experimental studies. Exclude studies focused on K-12 populations, studies measuring only immediate recall within the same session, and studies where retrieval practice is confounded with other interventions. Do not include opinion pieces, editorials, or conference abstracts."

### Example 11: Construction — constraints

User: "Write a constraints section for a prompt that plans a building renovation."

Model: "Constraints: the building must remain occupied and operational during all renovation phases, with no more than 20% of floor area inaccessible at any time. Work hours are limited to 7 PM to 6 AM on weekdays and all day on weekends. The total budget is $2.4M with a 10% contingency. No structural changes to load-bearing walls are permitted. All materials must meet LEED Gold certification requirements. The fire suppression system must remain operational throughout construction. The project must complete within 14 months from permit approval."

### Example 12: Climate Science — assumptions

User: "Write an assumptions section for a prompt that models regional flood risk."

Model: "Assumptions: the IPCC SSP2-4.5 scenario provides the baseline emissions trajectory for this analysis. The regional climate models used are from the CMIP6 ensemble and have been bias-corrected against local historical data from 1980-2020. Sea level rise follows the median projection from the local tide gauge record, not the global average. The flood defense infrastructure is assumed to be maintained at current standards without upgrades. Population distribution is assumed to follow current census patterns without migration effects. These assumptions hold for the 30-year planning horizon; beyond that, uncertainty increases materially."

### Example 13: Accessibility — edge cases

User: "Write an edge cases section for a prompt that audits a web form for accessibility."

Model: "Edge cases to verify: the form submitted with every field empty, the form submitted with every field at maximum character length, the form navigated using only the Tab key with no mouse input, the form navigated using a screen reader in both browse and focus modes, the form displayed at 200% browser zoom, the form displayed at 400% browser zoom, the form with custom CSS disabled, the form with JavaScript disabled, error messages displayed after submission with autofocus on the first invalid field, and the success confirmation read aloud by a screen reader after submission."

### Example 14: Crisis Communication — tone

User: "Write a tone section for a prompt that drafts a public statement after a data breach."

Model: "Tone: direct, factual, and accountable. No hedging, no corporate euphemisms, no deflection, no passive voice that obscures responsibility. Every sentence should answer a question the affected user would actually ask: what happened, what data was involved, what we are doing now, what you should do, and when you will hear from us next. The writing should feel like it was written by a human who takes the situation seriously, not by a legal team trying to minimize liability. Do not use the phrase 'we take your privacy seriously' — demonstrate it through concrete actions."

### Example 15: UX Design — iteration

User: "Write an iteration section for a prompt that redesigns a checkout flow."

Model: "Iteration: after the first design, the model should ask for feedback on three specific dimensions: clarity (does the user understand each step?), friction (where does the flow ask for unnecessary information?), and trust (do the payment and shipping screens feel secure?). The user will provide feedback on these dimensions. The model should produce one revision incorporating that feedback. After two total rounds (initial design plus one revision), assume the design is ready for prototyping. Do not iterate beyond two rounds unless the user explicitly requests a third."

## before / after examples

The `before / after examples` section shows bad examples of what not to do before showing the stronger replacement. It demonstrates the failure mode the prompt is trying to prevent and the corrected behavior the model should produce instead. The intent is to give the model contrast: not just what to do, but what to avoid. Models often need to see the failure mode made concrete before they can reliably avoid it.

This section should use paired examples labeled clearly as `Bad` and `Good`. Keep the bad example short and obviously flawed so the failure mode is unmistakable. Make the good example specific enough that the difference is observable. In the response, before/after examples should produce behavior that consistently follows the good pattern and avoids the bad pattern.

### Pair 1: identity — Generic Role

Bad: "You are an expert software engineer."

Good: "You are a senior infrastructure engineer who specializes in database reliability. You review every migration for lock duration, rollback safety, index impact, and data integrity risks. You do not approve a migration just because the syntax runs — you verify it runs safely under production load."

### Pair 2: identity — Self-Description vs Demonstrated Expertise

Bad: "You are excellent at code review. You have great attention to detail and strong architectural instincts."

Good: "You are a principal engineer who reviews code by tracing data flow from entry point to side effect. You flag any path where an error can go unhandled, a state change can go unobserved, or an assumption about input shape can break. Your feedback names the specific line, the risk, and the fix."

### Pair 3: goal — Vague Outcome

Bad: "Your goal is to make the codebase better."

Good: "Your goal is to reduce the auth module's public API surface to four exported functions while keeping all existing auth tests passing and adding no new dependencies. The work is complete when the module exports exactly `createSession`, `validateSession`, `refreshSession`, and `revokeSession`, and all 23 existing auth tests pass without modification."

### Pair 4: goal — Process vs Outcome

Bad: "Your goal is to review and analyze the data and produce insights."

Good: "Your goal is to identify the top three drivers of customer churn from the last six months of billing and support data so that the product team can prioritize one change this quarter. The output must include churn rate by driver, revenue impact per driver, and at least one actionable recommendation per driver."

### Pair 5: intuition — Surface Description

Bad: "This prompt helps models answer better by giving them clear instructions."

Good: "This prompt is trying to prevent the model from answering the question the user asked literally rather than the question the user meant functionally. The core idea is that users under-specify constraints because they assume the model shares their context. The prompt forces the model to surface hidden assumptions before committing to an architecture, which prevents the most expensive class of mistakes: solutions that are internally correct but externally wrong."

### Pair 6: intuition — Mechanical Framing

Bad: "Follow these steps in order to get the right answer. The steps work because they break down the problem."

Good: "This prompt is trying to force evaluation before generation — the model should determine success criteria before writing any code, not because process matters, but because undefined 'done' is the most common reason projects ship the wrong thing. The prompt prevents solution-first thinking by making the model name what failure looks like. When the model can describe failure concretely, it can navigate toward success with actual awareness instead of hopeful motion."

### Pair 7: definition — Ambiguous Term

Bad: "'Coverage' means the tests are comprehensive."

Good: "'Coverage' in this prompt means that every public function in the auth module has at least one test for its happy path, at least one test for its most common error path, and at least one test for an edge case involving a null or empty input. Coverage does not mean line coverage percentage or branch coverage percentage from a tool — it means those three test categories exist per function."

### Pair 8: definition — Dictionary vs Situated

Bad: "'Done' means the task is complete and ready for the next phase."

Good: "'Done' in this prompt means the PR is merged to main, the staging deploy passed all smoke tests, the feature flag is enabled for internal users, and the monitoring dashboard shows zero new errors for four hours. 'Done' does not mean the code is written, the branch is pushed, or the PR is opened — those are milestones on the way to done, not done itself."

### Pair 9: success criteria — Vague Completion

Bad: "- The answer is good. - It addresses the user's question. - It is clear and helpful."

Good: "- The answer includes the current latency and the target latency with the measurement method. - The answer names at least two root causes supported by the provided traces. - The answer includes a rollback plan with specific commands. - The answer avoids any recommendation that requires a database migration without migration downtime estimates."

### Pair 10: success criteria — Aspirational vs Verifiable

Bad: "- The code should be cleaner than before. - Performance should be improved. - The architecture should be better."

Good: "- No file in the refactored module exceeds 150 lines. - All 47 existing tests pass without modification. - The p95 response time for the /checkout endpoint is below 200ms measured with `wrk -t4 -c100 -d30s`. - The module's public API is unchanged: the same 12 exported functions exist with the same signatures."

### Pair 11: algorithm — Loose Steps

Bad: "1. Understand the problem. 2. Think about solutions. 3. Pick the best one. 4. Implement it."

Good: "1. Detect whether the user provided a file path or inline code. If inline, proceed to step 2. If file path, read the file first. 2. Extract the function signatures and their docstrings. 3. For each function, determine whether a test exists in the corresponding test file. If no test file exists, note this as a gap. 4. For functions with tests, verify that each test covers at least the happy path and one error path. 5. Report all gaps and generate a test plan. Stop after the report is complete."

### Pair 12: algorithm — Linear vs Branch Conditions

Bad: "1. Do the task. 2. Check your work. 3. Submit."

Good: "1. Read the provided CSV file. 2. If the file is empty, return a specific error with the file path. 3. If the file has headers but no data rows, return an empty result with a note. 4. If the file has more than 100,000 rows, ask the user for a row limit before processing. 5. Clean the data: trim whitespace, normalize date formats, remove duplicate rows. 6. Write the cleaned file. 7. Report row count before, row count after, and rows removed with reasons. Stop only after the report is complete."

### Pair 13: checklist — Memory-Based

Bad: "- Make sure the answer is good. - Check for errors. - Verify correctness."

Good: "- Identify the user's stated constraints before proposing any solution. - Check whether any proposed change requires a new dependency. - Verify that the proposed solution does not break existing API contracts. - Confirm that the error states described in the requirements are handled. - Remove any suggestion that falls outside the stated scope."

### Pair 14: checklist — Vague Reminders

Bad: "- Remember to be thorough. - Consider edge cases. - Stay focused."

Good: "- Check that every public function has its return type documented. - Verify that no sensitive value (API key, token, password) appears in plain text. - Confirm that all database queries include a LIMIT clause when operating on unbounded datasets. - Test the form with an empty submission, a maximum-length submission, and a submission with special characters."

### Pair 15: things to look for — Generic Advice

Bad: "- Look for issues in the code. - Watch for problems. - Notice anything unusual."

Good: "- Look for functions that accept a parameter but never use it — those often signal incomplete refactoring. - Look for error handling that logs the error but swallows the exception without re-raising or returning an error value. - Look for database queries inside loops — those signal N+1 problems. - Look for hard-coded environment names ('production', 'staging') instead of configuration-driven behavior."

### Pair 16: things to look for — Subjective vs Detectable

Bad: "- Notice when the writing feels off. - Pay attention to weak arguments. - Watch for boring sections."

Good: "- Look for claims stated without a source, example, or data point. - Look for paragraphs where every sentence starts with the same subject. - Look for recommendations that use the word 'just' (e.g., 'just add a cache') — those often skip the operational complexity. - Look for sections where the word count exceeds 300 words without a subheading."

### Pair 17: context — Assumed Knowledge

Bad: "Context: this is a typical web application."

Good: "Context: this is a Next.js 14 application using the App Router. The database is PostgreSQL 15 on RDS with a read replica. The auth system uses NextAuth v5 with a custom credentials provider. The team is four engineers, two of whom are new to the codebase. Deployments go through Vercel. The current bottleneck is the checkout flow, which takes 4.2 seconds p95 end-to-end."

### Pair 18: context — Irrelevant vs Decision-Relevant

Bad: "Context: the company was founded in 2019 by three ex-Googlers and raised a $12M Series A. The office is in San Francisco and has a kombucha tap."

Good: "Context: the ERP system is SAP, the integration must use the SAP BAPI interface over RFC, the middleware runs on a Windows Server that cannot be upgraded this year, and the data must sync within 30 seconds of a purchase order being approved. The integration cannot use REST because the SAP instance is version 7.4 without the Gateway component."

### Pair 19: scope — Unbounded Task

Bad: "Scope: improve the application."

Good: "In scope: the user registration flow (pages /register, /verify-email, /welcome), the password reset flow (pages /forgot-password, /reset-password), and the email templates for both flows. Out of scope: the login page, the profile settings page, the admin user management dashboard, and any changes to the session token format or auth middleware."

### Pair 20: scope — Implicit Exclusion

Bad: "Scope: review the billing module."

Good: "In scope: the billing module under src/billing/ — specifically invoice generation, payment processing, and refund handling. Out of scope: the pricing configuration admin panel, the customer-facing subscription management page, the webhook handlers from the payment provider, and any changes to the database schema."

### Pair 21: constraints — Unstated Limits

Bad: "Constraints: do a good job."

Good: "Constraints: no new npm dependencies (security review adds 2 weeks per dependency), no changes to the database schema (migrations require DBA approval cycle that takes 5 business days), the public API must remain backward-compatible (three mobile app versions in the field depend on the current response shape), and the solution must work within the existing Express.js server (no new services or infrastructure)."

### Pair 22: constraints — Hidden Rationale

Bad: "Constraints: no new services."

Good: "Constraints: no new services — the infrastructure team is frozen through end of quarter for a SOC 2 audit. No database migrations — the DBA is on leave for two weeks. No changes to the mobile API response shape — version 2.8 and earlier do not have a forced-upgrade mechanism and must keep working. The deadline is Friday because the feature must ship before the marketing campaign launches Monday."

### Pair 23: assumptions — Silent Defaults

Bad: "Assumptions: standard web development assumptions apply."

Good: "Assumptions: the existing PostgreSQL connection pool handles up to 50 concurrent connections safely. The Redis cache is available and has no TTL eviction issues under current load. The user's browser supports ES2020 features. The third-party payment API is stable and its v2 endpoint has been tested. These assumptions were verified in the last quarter and have not changed. If any assumption fails, the model should flag it before proceeding."

### Pair 24: edge cases — Happy-Path-Only

Bad: "Edge cases: handle errors gracefully."

Good: "Edge cases: an empty CSV file with headers but no data, a row where the email field contains a pipe character, a row where the date is in DD/MM/YYYY format instead of the expected ISO format, a row where the amount field contains a currency symbol, duplicate rows with identical transaction IDs, and a file where the column order differs from the expected schema. Each edge case must have a defined resolution: skip, transform, or reject with a specific error message."

### Pair 25: edge cases — Abstract Naming

Bad: "Edge cases: null values, empty strings, long inputs, special characters."

Good: "Edge cases: the username field is null, the username field is an empty string, the username field is 256 characters (exceeding the 255-char column limit), the username contains a SQL injection pattern, the username contains emoji characters, the email field contains two @ symbols, the payment amount is negative, and the payment amount is $0.00. For each case, specify whether it should be rejected with a validation error or handled with a specific transformation."

### Pair 26: tone — Vague Adjectives

Bad: "Tone: professional and friendly."

Good: "Tone: concise and direct — prefer short sentences with concrete nouns. No cheerleading phrases like 'Great question!' or 'I'd be happy to help with that.' No hedging with phrases like 'you might want to consider' when the prompt calls for a recommendation. Every claim about code behavior is backed by a line reference or a runnable command. The tone should feel like a senior colleague who values the reader's time."

### Pair 27: tone — Inconsistent Register

Bad: "Tone: be helpful. Adjust as needed."

Good: "Tone for this postmortem: factual and blameless. Use passive voice for system actions ('the deploy was rolled back') and active voice for human decisions ('the on-call engineer decided to restart the service'). No adjectives describing severity — let the metrics speak. No speculation about what 'should have' happened. Every paragraph should contain a timestamp in UTC. The reader should finish the document knowing exactly what happened, when, and what will prevent recurrence."

### Pair 28: iteration — Open-Ended Polishing

Bad: "Iteration: keep improving until it is good."

Good: "Iteration: the user will provide one round of feedback. After incorporating that feedback, produce the final version. Do not ask for a second round of feedback unless the user initiates it. When you deliver the revised version, include a brief change log listing what was modified and why. If the user provides no feedback within this session, treat the current version as final."

### Pair 29: iteration — Unguided Revision

Bad: "Iteration: revise the draft based on user feedback."

Good: "Iteration: maximum two rounds. After the first draft, ask the user to confirm or correct three specific dimensions: (1) does the structure match their mental model of the problem, (2) are the recommended actions specific enough to execute without follow-up questions, and (3) is anything important missing. Incorporate the user's answers into one revision. After that revision, assume the document is final unless the user explicitly requests another pass."

### Pair 30: output style — Implicit Format

Bad: "Output style: give me a good answer."

Good: "Output style: respond in a single Markdown table with columns for Endpoint, Method, Request Body, Success Response, and Error Response. Each row represents one API endpoint. Use JSON for the request and response examples. Do not add introductory or concluding paragraphs — the table is the entire response. If an endpoint has multiple error responses, list the most common two."

## Common Section Boundaries

- `identity` defines who the model should be and what expertise it should bring to the task.
- `goal` defines what the model is trying to accomplish and what outcome matters.
- `intuition` defines why the prompt is structured this way and what deeper pattern it relies on.
- `definition` pins down terms or concepts that could be interpreted in multiple ways.
- `success criteria` defines when the model can stop and how completion is verified.
- `algorithm` defines the ordered procedure the model follows with branch conditions.
- `checklist` defines what the model should remember to do during execution.
- `things to look for` defines signals, patterns, or failure modes the model should notice.
- `context` defines the background information the model needs to answer correctly.
- `scope` defines what the task covers and what it explicitly excludes.
- `constraints` defines external limits the model must respect (technical, organizational, content).
- `assumptions` defines what the model should take as given rather than question.
- `edge cases` defines specific unusual scenarios the model must handle correctly.
- `tone` defines the voice, density, vocabulary, and emotional posture of the response.
- `iteration` defines how the model handles rounds of revision and when to stop iterating.
- `output style` defines the shape, structure, and presentation of the final response.
- `cross-domain examples` defines how the same behavior looks across unrelated domains.
- `before / after examples` defines what weak behavior looks like and what should replace it.
- `internal_monolog` defines what the model should privately attend to during execution.
- `internal reasoning` defines how the model should privately test and evaluate its work.
