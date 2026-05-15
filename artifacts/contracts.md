# Contracts

This file is a reusable prompt artifact for validation contracts in agentic engineering. Each section explains what that section is, why it belongs, and how it should shape the model's behavior. The goal is to give agents a machine-checkable definition of success — a gauntlet they must run and pass before their work is considered done.

## goal

The `goal` section states that the prompt is not asking the model to "do the task" in the traditional sense. It is asking the model to produce output that satisfies a set of objective, runnable checks. The model's job is to iterate within a feedback loop — run the checks, see failures, fix them, repeat — until every check passes. The actual deliverable is code (or configuration, or documentation) that survives the gauntlet, not code that looks correct to a human reviewer.

This section should make the model understand that it is not done when it feels done. It is done when the verifier says it is done. The target is binary: all contracts pass, or the work is incomplete.

## intuition

The `intuition` section explains the deeper logic behind validation contracts: they shift the problem from "trust the agent's output" to "design a good checker." Humans are already good at writing tests, specifying schemas, and defining constraints. Agents are good at rapid iteration but bad at self-correcting without external feedback. A validation contract bridges this gap by giving the agent an immediate, objective signal it can use to steer.

A vague goal like "write good code" leaves the agent guessing. A verification contract replaces guessing with a tight loop: run code, see PASS or FAIL, and revise. The contract is the specification made executable — it lives in code, not in the prompt. The prompt provides intent and context, but the contract provides the definitive measure of correctness.

The deeper meta-pattern is that you are taking something you would normally catch in code review — sometimes days or weeks later — and turning it into an automated, immediate signal the agent can act on in the same loop. The earlier the feedback, the tighter the iteration, and the less you have to think about what the agent actually did.

## definition

A `validation contract` is a machine-checkable, binary condition that an agent's output must satisfy. It is NOT a natural language instruction, a vague quality aspiration, or a suggestion. It is a runnable check — a test, a type check, a lint rule, a schema validator, a tool invocation — that returns PASS or FAIL.

What a validation contract IS:
- A runnable artifact that produces a binary outcome
- Defined before the agent begins work (test-first, not test-after)
- Combined into pipelines where all contracts must pass simultaneously
- The authoritative definition of "done" for the agent's task

What a validation contract IS NOT:
- A prompt instruction alone ("make the code clean")
- A human review pass done after the agent finishes
- An LLM-based evaluation with a rubric (though this can serve as a soft supplement)
- A substitute for thinking about what success actually means

## success criteria

A well-designed validation contract:
- Returns a clear PASS or FAIL that the agent can act on without interpretation
- Runs fast enough to be part of a tight iteration loop (seconds, not minutes)
- Catches the failure modes that matter, not just surface-level issues
- Cannot be accidentally satisfied by output that violates the underlying intent
- Is defined before the agent begins work, not retrofitted to accept whatever the agent produces
- Stacks with other contracts to catch different classes of failure from different angles

## things to look for

When designing validation contracts, watch for these signals and failure modes:

- **Soft-failing contracts**: Checks that produce warnings instead of hard failures. Warnings will be ignored. Every contract must be a hard stop.
- **Contract overfitting**: The agent learns to pass the specific checks without solving the general problem. Fuzz contracts and property-based tests help counter this.
- **Contract drift**: The contracts themselves become outdated as requirements change. Contracts must be versioned alongside the code they validate.
- **Circular validation**: The contract validates output that the agent itself generated. Trust nothing — the contract should check against ground truth, snapshots, or independently defined expectations.
- **False confidence**: Passing contracts does not mean the output is perfect. It means the output passes the checks you thought to write. Missing checks are the real risk.
- **Contract cost**: Each contract adds to the feedback loop time. Contracts that take minutes to run create a slow loop where the agent loses context between iterations. Prefer fast contracts.
- **Unchecked dimensions**: A contract that checks correctness but not performance, or performance but not security, creates a blind spot the agent will exploit. Stack contracts across dimensions.

## checklist

When building a contract pipeline for an agentic task:

- Write the contracts first, before the agent starts implementation
- Make every contract produce a binary PASS/FAIL with no ambiguity
- Stack multiple contract types: tests, types, linting, security, performance, schema
- Include at least one contract that uses randomized or property-based inputs
- Include at least one contract that checks a negative (something must NOT be present)
- Verify the contracts can actually fail by writing a deliberately broken implementation
- Set a total feedback loop time budget and ensure all contracts fit within it
- Document what each contract is checking and why, so the pipeline remains maintainable

## contract categories

Below are the major categories of validation contracts, with what each category protects against and when it is most useful.

### Correctness contracts

Guard against logic errors, off-by-one bugs, missing edge cases, and broken behavior.

- **Unit test contract**: A suite of specific input-output pairs the agent's code must match exactly.
- **Integration test contract**: The agent's code wired to real dependencies must produce correct end-to-end behavior.
- **Property-based test contract**: For all generated inputs matching a specification, a logical property must hold (e.g. "sorting never changes list length").
- **Mutation testing contract**: A mutation tool introduces deliberate bugs into the agent's code; the agent's own tests must detect and kill every mutant.
- **Boundary coverage contract**: The agent's test suite must include explicit tests for empty input, single-element input, maximum-size input, and invalid input.
- **Determinism contract**: Run the agent's function 100 times with identical input; assert output is byte-for-byte identical every time.
- **Idempotency contract**: Call the function twice with the same input; assert the result matches calling it once.
- **Snapshot contract**: The agent's output against a known input must byte-match a stored golden file.
- **Regression contract**: Re-run a suite of historical bug-triggering inputs and assert none of the known bugs reappear.
- **Equivalence contract**: Given two implementations (e.g. old and new), assert they produce identical output for all inputs in a test corpus.
- **Invariant contract**: Assert that a program-wide invariant holds before and after every operation (e.g. "total balance across all accounts never changes").
- **Round-trip contract**: Serialize, then deserialize; assert the result equals the original. Or encode, then decode; assert no information is lost.
- **Symmetry contract**: For reversible operations, assert that applying the inverse recovers the original (e.g. `decrypt(encrypt(x)) == x`).
- **Commutativity contract**: Assert that operations that should be order-independent produce the same result regardless of execution order.
- **Monotonicity contract**: Assert that as input increases, output never decreases (or vice versa, depending on the function).

### Type and schema contracts

Guard against shape mismatches, missing fields, wrong types, and structural surprises.

- **Type checker contract**: The agent's code must pass `mypy`, `tsc --noEmit`, or equivalent with zero errors under strict mode.
- **JSON Schema conformance contract**: The agent's output must validate against a predefined JSON Schema document.
- **Protobuf/Avro schema contract**: Every message the agent publishes must conform to a registered schema version.
- **OpenAPI spec conformance contract**: Fire real requests at the agent's API and assert every response matches the declared OpenAPI schema.
- **GraphQL schema contract**: The agent's resolver output must satisfy the GraphQL schema with no nullability violations on required fields.
- **Database schema contract**: After migrations, assert the database schema exactly matches a reference schema dump.
- **Column nullability contract**: Assert that columns defined as NOT NULL contain zero nulls after the agent's data transformation runs.
- **Enum exhaustion contract**: For every enum or union type, assert the agent's code handles every variant — no default catch-alls that silently swallow new variants.
- **Discriminated union contract**: Assert the agent never produces an object that could match multiple branches of a discriminated union ambiguously.
- **Optionality contract**: Assert the agent never passes `null` or `undefined` where a value is required, and never assumes an optional value is present without checking.

### Performance and resource contracts

Guard against slow algorithms, memory leaks, unbounded growth, and resource exhaustion.

- **Wall-clock time contract**: The agent's function must complete within a stated time budget for a defined input size.
- **Asymptotic complexity contract**: Assert that doubling input size increases runtime by no more than the expected factor.
- **Memory ceiling contract**: The agent's code must stay under a peak memory threshold for a defined workload.
- **Memory leak contract**: Run the agent's code in a loop for N iterations and assert memory usage is bounded (does not grow without limit).
- **CPU utilization contract**: The agent's code must not saturate all available cores under normal load.
- **Database query count contract**: The agent's ORM code must make no more than N database round-trips for a given operation.
- **Bundle size contract**: The agent's compiled frontend bundle must not exceed a size threshold.
- **Docker image size contract**: The agent's Dockerfile must produce an image under a size threshold.
- **Network payload size contract**: The agent's API responses must not exceed a maximum byte size.
- **Startup time contract**: The agent's service must respond to health checks within a timeout after process start.
- **Cold start contract**: The agent's code must return correct results even when all caches are empty.
- **Warm cache hit rate contract**: With a warm cache, hit rate must meet a minimum threshold.
- **Cache size bounds contract**: The agent's cache must stay within a defined memory budget over extended operation.
- **Connection pool contract**: The agent must not exceed a maximum number of open connections to any dependency.
- **File descriptor contract**: Before and after the agent's code runs, the count of open file handles must be identical.

### Security contracts

Guard against injection, data exposure, broken auth, and insecure defaults.

- **SQL injection surface contract**: Scan the agent's code for string concatenation in SQL and assert none exists — all queries must be parameterized.
- **XSS surface contract**: Assert the agent's HTML output is properly escaped and contains no unsanitized user input.
- **Command injection contract**: The agent must never pass unsanitized input to shell execution, system calls, or subprocess invocations.
- **Path traversal contract**: Feed the agent's file-handling code paths like `../../etc/passwd`; assert it either rejects or sanitizes them.
- **Hardcoded secrets contract**: Run `truffleHog`, `gitleaks`, or equivalent on the agent's output; assert zero credentials, tokens, or keys.
- **Auth bypass contract**: Attempt to hit every protected endpoint without credentials; assert all return 401.
- **Privilege escalation contract**: Log in as a low-privilege user and hit every admin endpoint; assert all return 403.
- **Token expiry contract**: Create a token, advance time past expiry, and assert the system rejects it.
- **Password hashing contract**: Assert that no plaintext password exists in the database after the agent's auth flow runs.
- **CORS contract**: Fire requests from unauthorized origins and assert rejection; fire from allowed origins and assert success.
- **JWT claims contract**: Decode the agent's issued JWTs; assert required claims (iss, exp, sub, aud) are always present and correctly typed.
- **Session fixation contract**: Assert the session ID changes after login — a pre-auth session must never be valid post-auth.
- **CSRF contract**: Assert state-changing endpoints reject requests that lack the required CSRF token.
- **Rate limit contract**: Hammer the agent's endpoint and assert it starts returning 429 after crossing the defined threshold.
- **Encryption contract**: Assert the agent never writes sensitive data to disk or transmits it over the network without encryption.
- **Certificate validation contract**: Assert the agent's TLS connections verify certificates — no "insecure" flags, no self-signed certs in production paths.
- **Secure defaults contract**: Assert that every configurable security setting defaults to the most secure option, not the most convenient.
- **Dependency vulnerability contract**: Run `npm audit`, `pip-audit`, or equivalent; assert zero known vulnerabilities in the agent's dependency tree.
- **Secrets in logs contract**: Run the agent's log output through a PII/secret detector; assert zero credentials, tokens, or PII appear.
- **Prompt injection contract**: Feed the agent a suite of known prompt injection strings; assert the system never deviates from its intended behavior.

### Architecture and dependency contracts

Guard against tangled code, circular dependencies, wrong couplings, and structural decay.

- **Circular dependency contract**: Build the dependency graph of the agent's code; assert zero cycles exist.
- **Layer discipline contract**: Assert that lower-layer modules never import from higher-layer modules (e.g. database layer never imports from API layer).
- **Cyclomatic complexity contract**: Every function in the agent's output must stay below a complexity score threshold.
- **Function length contract**: No function may exceed a defined line count.
- **Parameter count contract**: No function may accept more than N parameters; beyond that, group into an object.
- **Dead code contract**: Run `vulture`, `knip`, or equivalent; assert zero unused exports, functions, or variables.
- **Dependency license contract**: Every dependency in the agent's package tree must use an approved license (MIT, Apache, BSD) — no GPL, no unknown.
- **Dependency pinning contract**: Every dependency must have an exact version pinned — no ranges, no `^` or `~`.
- **No wildcard imports contract**: The agent must never use `import *` or `from module import *`.
- **Single responsibility contract**: Assert that every class or module handles exactly one concern, detectable by its dependencies.
- **Interface segregation contract**: Assert no client module depends on methods it does not call.
- **Export control contract**: The agent's dependency tree must contain no packages from sanctioned jurisdictions.
- **Feature flag orphan contract**: Every feature flag referenced in code must have a corresponding entry in the feature flag management system.
- **Module visibility contract**: For languages with visibility modifiers, assert the agent never exposes internals that should be private.
- **Cohesion contract**: Assert that files within a module change together — high internal cohesion, low external coupling.

### API and interface contracts

Guard against broken integrations, schema mismatches, and consumer surprises.

- **Backwards compatibility contract**: Parse the previous API schema and the new one; assert no existing fields were removed, renamed, or retyped.
- **Consumer-driven contract contract**: Use Pact or equivalent to verify the agent's service sends responses that match what actual consumers expect.
- **HTTP method contract**: Mutating operations must use POST/PUT/PATCH/DELETE, never GET.
- **Content-type contract**: Every response must set an explicit Content-Type header matching the actual body format.
- **Redirect contract**: HTTP endpoints must redirect to HTTPS — no plaintext responses.
- **Compression contract**: Responses above a size threshold must be gzip or brotli compressed.
- **Pagination contract**: Paginating through all results with page size N must return exactly the same total set as fetching everything at once.
- **Rate limit header contract**: Rate-limited responses must include standard headers indicating limit, remaining, and reset time.
- **Error response shape contract**: Every error response must follow a consistent structure with at minimum an error code and human-readable message.
- **Latency percentile contract**: Assert p95 and p99 response times stay under defined thresholds, not just average.
- **Idempotency key contract**: Submitting the same request twice with the same idempotency key must produce the side effect exactly once.
- **Webhook signature contract**: The agent's webhook handler must reject payloads with invalid HMAC signatures.
- **Webhook retry contract**: Delivering the same webhook event twice must produce the correct side effect exactly once.
- **Version header contract**: Every API response must include a version header so consumers can detect breaking changes.
- **Health check depth contract**: The `/health` endpoint must verify database connectivity and downstream dependencies, not just that the process is alive.
- **Graceful degradation contract**: When a downstream dependency fails, the agent's service must still respond within its SLA — no inherited hangs.

### Data integrity contracts

Guard against data loss, corruption, inconsistency, and silent failures.

- **Row count reconciliation contract**: After the agent's transformation, output row count must equal input row count minus explicit deletions plus explicit additions.
- **Deduplication contract**: The agent's output must contain zero duplicate rows by a defined primary key.
- **Referential integrity contract**: Every foreign key in the agent's output must reference a row that actually exists.
- **Uniqueness contract**: For columns defined as unique, assert no duplicates exist in the output.
- **Range constraint contract**: Numeric columns must stay within defined min/max ranges. Dates must fall within valid bounds.
- **Encoding contract**: The agent must open all files with an explicit encoding declaration — no reliance on system locale defaults.
- **Null propagation contract**: Assert the agent never silently converts nulls to zeroes, empty strings, or other sentinel values without explicit handling.
- **Migration reversibility contract**: Run the agent's migration forward, then run the rollback; assert the schema is identical to the starting state.
- **Atomic write contract**: The agent's file writes must be atomic — either the full file is written, or nothing is written at all.
- **Seed data contract**: The agent's code must boot correctly against a known seed dataset and produce a specific known output.
- **Backfill determinism contract**: Rerunning the agent's pipeline over a historical date range must produce identical output.
- **Late data contract**: Feed the agent's pipeline events with out-of-order timestamps; assert they are handled correctly, not silently dropped.
- **Data retention contract**: Records older than the defined retention period must be deleted or anonymized by the agent's cleanup code.
- **Consent log contract**: Every operation that processes personal data must log a corresponding consent record.

### Concurrency and distributed systems contracts

Guard against race conditions, deadlocks, partial failures, and distributed state bugs.

- **Thread safety contract**: Spin up N concurrent callers all hitting the agent's function simultaneously; assert the result is consistent with sequential execution.
- **Deadlock detection contract**: Run the agent's concurrent code under a race detector; assert it completes within a timeout without deadlocking.
- **Atomicity contract**: Operations that modify multiple things must be wrapped in a transaction — partial writes must be impossible.
- **Circuit breaker contract**: Simulate a failing downstream; assert the agent's circuit breaker opens after N failures and returns fast failures.
- **Message deduplication contract**: The agent's queue consumer must handle duplicate messages without double-applying side effects.
- **Event ordering contract**: Given a set of events, assert the output is correct regardless of the order in which event handlers fire.
- **Graceful shutdown contract**: Send SIGTERM; assert the agent's service finishes in-flight requests before exiting.
- **Partition tolerance contract**: Simulate a network partition; assert the agent's service remains available for reads and degrades gracefully for writes.
- **Leader election contract**: In a multi-instance deployment, assert exactly one instance holds the leader lock at any time.
- **Replication lag contract**: Write to the primary and immediately read from a replica; assert the system handles the lag window correctly.

### Frontend and UI contracts

Guard against broken layouts, inaccessible interfaces, and visual regressions.

- **Accessibility audit contract**: Run axe-core against the agent's rendered HTML; assert zero violations.
- **Responsive layout contract**: Render at mobile, tablet, and desktop breakpoints; assert no elements overflow their containers.
- **Visual regression contract**: Render the agent's component and pixel-diff against a stored screenshot; any unintended visual change fails.
- **Accessibility label contract**: Every interactive element must have an accessibility label set.
- **Keyboard navigation contract**: Every interactive element must be reachable and operable via keyboard alone.
- **Color contrast contract**: All text must meet WCAG AA contrast ratio minimums against its background.
- **Screen reader contract**: The reading order exposed to screen readers must match the visual reading order.
- **Animation performance contract**: Animations must run at 60fps on a target device; no jank or dropped frames.
- **Bundle chunk contract**: The agent must not produce a single monolithic JavaScript bundle — code splitting must be present.
- **No layout thrashing contract**: The agent's JavaScript must not cause forced synchronous layouts (layout thrashing).
- **Click target size contract**: Every tappable element must be at least the minimum touch target size.
- **Offline mode contract**: Disable the network; assert the agent's app continues functioning for core features using cached data.
- **Deep link contract**: Every registered deep link URL must resolve to the correct screen with correct parameters.
- **Memory warning contract**: Simulate a low-memory warning; assert the app releases non-essential cached objects.

### Infrastructure and DevOps contracts

Guard against misconfiguration, resource destruction, and deployment surprises.

- **Terraform plan contract**: Run `terraform plan`; assert the plan contains zero resource destructions.
- **Infrastructure drift contract**: Assert the actual deployed infrastructure matches the Terraform/CloudFormation definition.
- **IAM least-privilege contract**: Assert no IAM role grants more permissions than its associated service actually uses.
- **Security group contract**: Assert no security group allows inbound traffic from `0.0.0.0/0` on sensitive ports.
- **Encryption at rest contract**: Assert every data store is configured with encryption at rest enabled.
- **Backup existence contract**: Assert every stateful resource has a backup configured with a defined retention period.
- **Monitoring coverage contract**: Every deployed service must have dashboards, alerts, and logging configured.
- **Log retention contract**: Assert log retention policies meet compliance requirements and storage budgets.
- **Tag compliance contract**: Every cloud resource must have required tags (cost center, owner, environment).
- **Multi-AZ contract**: Production services must be deployed across at least two availability zones.
- **Auto-scaling contract**: The agent's service configuration must include auto-scaling rules with defined min/max instances.

### Build and CI contracts

Guard against non-deterministic builds, slow pipelines, and broken developer workflows.

- **Reproducible build contract**: Build the artifact twice from the same source; assert the outputs are byte-for-byte identical.
- **Build time contract**: The CI build must complete within a defined time budget.
- **Test suite runtime contract**: The full test suite must run in under a defined wall-clock time.
- **No flaky test contract**: Run the test suite N times; assert zero test outcomes change between runs.
- **Changelog contract**: The agent's PR must include an entry in the changelog following a defined format.
- **Commit message contract**: All commit messages must follow Conventional Commits format.
- **Branch naming contract**: Branch names must follow a defined convention (feature/, fix/, chore/).
- **Signed commit contract**: Every commit must be GPG-signed or equivalent.
- **Merge strategy contract**: The agent must not produce merge commits on the main branch; only squash or rebase allowed.

### Documentation contracts

Guard against stale examples, incomplete APIs, and undocumented interfaces.

- **Example code compiles contract**: Extract all code snippets from the agent's documentation; assert they compile and run without errors.
- **API docs coverage contract**: Every public endpoint must have a corresponding API docs entry with description, parameters, and example.
- **README completeness contract**: The README must contain installation, usage, configuration, and contributing sections.
- **Docstring coverage contract**: Every public function and class must have a docstring or JSDoc comment.
- **Changelog format contract**: Changelog entries must follow Keep a Changelog format with correct version numbers.
- **Breaking change flag contract**: Any PR that removes or renames a public API must have a BREAKING CHANGE marker.
- **Deprecation notice contract**: Deprecated APIs must include a deprecation warning with a migration path and removal timeline.
- **Link validity contract**: Crawl the agent's documentation for internal and external links; assert zero broken links.

### CLI contracts

Guard against broken scripts, unexpected output, and integration failures.

- **Exit code contract**: The CLI must exit 0 on success and non-zero on every failure path. Scripts depend on this.
- **Help text contract**: Running with `--help` must print usage including every defined flag and argument.
- **Stdin/stdout contract**: The CLI must accept input on stdin and write output to stdout with no extra decoration, enabling Unix pipe composition.
- **Idempotent invocation contract**: Running the same CLI command twice must produce the same result — no double-applied side effects.
- **Version flag contract**: Running with `--version` must print the version string in a standard format.
- **Signal handling contract**: Sending SIGINT must trigger graceful cleanup, not an immediate crash.
- **Config precedence contract**: CLI flags must override env vars, which must override config file values, in the documented order.
- **Silent flag contract**: When `--quiet` or `--json` is passed, the CLI must emit only stdout data with zero stderr decoration.

### Machine learning and AI contracts

Guard against silently degraded models, biased outputs, and invalid predictions.

- **Model output schema contract**: The agent's inference code must always return output matching a defined schema — correct types, correct fields.
- **Accuracy floor contract**: Run the agent's model against a held-out eval set; assert accuracy or F1 stays above a minimum threshold.
- **Latency regression contract**: Benchmark inference; assert it has not gotten slower than the previous model version.
- **Bias contract**: Run eval against demographic subgroups; assert performance does not deviate beyond a threshold across groups.
- **Data leakage contract**: Assert no training features are derived from information unavailable at inference time.
- **Model reproducibility contract**: Train the same model twice from the same data and seed; assert outputs are identical.
- **Feature drift contract**: Monitor input feature distributions in production; assert they have not shifted beyond a threshold from training distributions.

### Configuration and startup contracts

Guard against misconfiguration, silent defaults, and mystery crashes.

- **Required env vars contract**: The application must fail fast with a clear error if any required environment variable is missing.
- **Config schema contract**: The configuration must be validated against a schema at startup before any real work begins.
- **No hardcoded environments contract**: Strings like "production" or "staging" must not appear outside of config files.
- **Port conflict contract**: The agent's service must fail fast if its configured port is already in use, not bind to a random fallback.
- **Database connectivity contract**: At startup, the service must verify it can connect to the database before accepting traffic.
- **Config immutability contract**: Configuration values must not be mutated at runtime — the config object must be frozen after initialization.

### Search and querying contracts

Guard against broken search, query injection, and data access bugs.

- **Search relevance contract**: Given a known query and dataset, assert the top result is the expected document.
- **Query injection contract**: Feed search inputs containing DSL syntax, Lucene expressions, or SQL fragments; assert they are treated as literal text.
- **Empty results contract**: When nothing matches, the agent's search must return an empty list, not null.
- **Pagination consistency contract**: Paginating through all results must return exactly the same total set as fetching everything at once.
- **Facet count contract**: The sum of counts across all facet buckets must not exceed the total matching document count.
- **Sort stability contract**: Sorting by a field with equal values must produce a stable, deterministic order.

### Caching contracts

- **Cache invalidation contract**: Mutate underlying data; assert the cache returns updated values within a defined window.
- **Cache key uniqueness contract**: No two different inputs may produce the same cache key.
- **Cache stampede contract**: Simulate N concurrent cache misses for the same key; assert only one backend request is made.
- **Negative caching contract**: Assert the agent caches "not found" results to avoid repeatedly querying for nonexistent resources.

### Logging and telemetry contracts

- **Structured logging contract**: Every log line must be valid JSON with a defined set of required fields.
- **Log level correctness contract**: Debug logs must not fire at INFO level in production; errors must log at ERROR or higher.
- **Trace propagation contract**: A trace ID injected into an inbound request must appear in every outbound call the agent makes.
- **Metric emission contract**: Every critical operation must emit a corresponding counter or gauge.
- **Alert coverage contract**: For every error type the system can throw, a corresponding alert rule must exist.

### Internationalization contracts

- **Hardcoded string contract**: Zero user-visible string literals outside of locale files.
- **Translation completeness contract**: Every key in the primary locale must exist in every supported locale file.
- **RTL layout contract**: Render in a right-to-left locale; assert text alignment, ordering, and layout mirror correctly.
- **Pluralization contract**: Assert correct handling of singular, plural, zero, and language-specific plural forms.
- **Date format contract**: Assert date formatting produces locale-correct output for a matrix of locales and formats.

## output style

Contracts should be concrete and executable. Prefer code over prose. Every example should show the actual check — a test function, a lint rule, a tool invocation — not just a description of what the check does. The model should be able to copy, adapt, and run the contract immediately.

Contracts should be named clearly to communicate their intent. A contract named `test_sort` is worse than `test_sort_preserves_all_elements_and_produces_ordered_output`. The name is the first signal of what failure means.

Contracts should be composed into pipelines: tests, then types, then linting, then security, then performance. The pipeline is the contract. The model must satisfy every layer, and each layer catches a different class of failure the others might miss.
