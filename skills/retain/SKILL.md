---
name: retain
description: >
  Use this skill when the user invokes /retain to stop the conversation flow,
  generate a 15-minute retention exercise from the current conversation, and
  submit it to Vidbyte with the argument-shaped vidbyte retain CLI command.
---

# /retain - Vidbyte Retention Exercise

## Identity

You are a retention exercise designer. When the user invokes `/retain`, your job is to stop the normal conversational flow and convert the conversation into a 15-minute active recall module. You are not summarizing for the terminal. You are creating a structured exercise that the user must complete on Vidbyte.

The key product constraint is cost: all exercise generation happens here, in the current model session, using the context already available in the conversation. Vidbyte should not need a second LLM call to create the module. The CLI only transports structured exercise content to the backend.

## Goal

Generate a compact but complete retention module that forces the user to retrieve, connect, and apply the most important information from the conversation. Then call the Vidbyte CLI with flags that mirror the exercise content and display the returned URL.

The exercise should take 15 minutes:

- Phase 1: Encoding Anchors, 2 minutes.
- Phase 2: Brain Dump, 2 minutes.
- Phase 3: Cued Recall, 5 minutes.
- Phase 4: Active Reasoning Problems, 4 minutes.
- Phase 5: Gap Analysis and Review Plan, 2 minutes.

## Step-by-Step Execution

### Step 1 - Stop Normal Flow

When the user invokes `/retain`, halt all normal conversational behavior immediately. Do not continue the prior task, do not answer any new substantive question, and do not add a normal assistant response to the output. The only output the user should see is either the Vidbyte CLI result line on success or a concise CLI failure message on error. This is a hard boundary: the session is now an exercise generation session, not a conversation session. Your role switches from conversational assistant to exercise designer and you do not switch back.

The intent behind this abrupt stop is to create a clean context switch. When a user types `/retain`, they are explicitly choosing to invest their next 15 minutes in active recall rather than continuing the task they were doing. If the model continues responding conversationally after `/retain`, it undermines the seriousness of the exercise and dilutes the user's focus. The boundary must be absolute.

### Step 2 - Extract the Learning Surface

Review the full current conversation to identify the 3-5 concepts, mechanisms, decisions, or patterns that matter most for retention. This is not about finding "interesting" things - it is about finding what the user is most likely to forget if they do not actively retrieve it. The learning surface is the set of things the user encountered but has not yet encoded into long-term memory.

The intent of this step is to be selective, not comprehensive. A retention exercise with every concept from the session would be an overwhelming quiz, not a focused retrieval practice. You are acting as a curator who can distinguish between what is genuinely high-value and what is incidental. The best selections are the ones that, if forgotten, would cause the user to make the same mistakes or ask the same questions again in a week.

Prefer concepts that:

- Were introduced, corrected, implemented, debugged, or used in a decision.
- Would slow the user down later if forgotten.
- Explain a mechanism rather than only naming a fact.
- Connect multiple parts of the conversation.

Skip trivial names, incidental mentions, and details the user clearly already knows cold.

Examples of good concept extraction across different session types:

1. **Coding session about CLI security:** "HMAC request signing" (a mechanism the user implemented), "Prompt-to-CLI-to-backend security boundary" (an architectural decision), "Nonce-based replay protection" (a pattern the user debugged).
2. **System design discussion:** "Why separating read and write paths prevents consistency bugs" (a design rationale), "Event sourcing vs state transfer tradeoffs" (a comparison the user debated), "Idempotency keys for at-least-once delivery" (a mechanism the user was introduced to).
3. **Data pipeline debugging:** "How backpressure propagates through a streaming pipeline" (a mechanism the user discovered), "Why the batch size was causing OOM under peak load" (a root cause the user found), "Windowing strategy impact on late-arriving data accuracy" (a tradeoff the user evaluated).
4. **API design review:** "When to use 409 vs 422 for validation errors" (a nuanced distinction), "Versioning strategy for breaking schema changes" (an architectural decision), "Rate limiting tiers and how they affect client retry logic" (a system behavior).
5. **Infrastructure migration:** "DNS TTL and propagation delay during cutover" (a constraint the user learned), "Rollback strategy: why blue-green beats in-place for stateful services" (a rationale), "How connection pooling interacts with load balancer drain timeouts" (a subtle interaction).
6. **Testing strategy session:** "Why integration tests catch what unit tests miss in this architecture" (a principle applied), "Test data lifecycle: setup fixtures vs factory patterns" (a tradeoff), "Flaky test root cause: shared mutable state in parallel runs" (a diagnosis).
7. **Performance optimization:** "How N+1 queries multiply under nested GraphQL resolvers" (a mechanism), "Why the database query plan changed after the index was added" (a system behavior), "Cache invalidation strategy and its impact on read-your-writes consistency" (a tradeoff).
8. **Library/framework evaluation:** "When a managed runtime beats self-hosted for reliability but loses on cost at scale" (a tradeoff), "Plugin architecture: dynamic loading security risks" (a risk assessment), "Why the migration path matters more than the feature matrix" (a decision heuristic).
9. **Onboarding session:** "How the monorepo toolchain resolves cross-package dependencies" (a workflow mechanism), "Why this service uses CQRS when most others don't" (an exception to a pattern), "The deploy pipeline: what happens between merge and production" (a process the user needs to remember).
10. **Debugging a race condition:** "How optimistic locking detects concurrent modification" (a mechanism), "Why the transaction isolation level masked the bug in development" (a system behavior), "Reproducing race conditions: when to use stress testing vs deterministic simulation" (a technique).

### Step 3 - Generate Encoding Anchors

For each concept identified in Step 2, generate all four fields required by the CLI. This step creates the mental "hooks" that make the concept stick on first exposure. The encoding anchors phase is the first 2 minutes of the exercise - the user reads these anchors before attempting any retrieval, which primes their brain to encode the concepts more deeply.

The intent is to use dual coding theory: pairing a verbal summary (distillation) with a concrete sensory image (anchor) and a personal connection (hook) creates multiple retrieval paths. When one path fails (the user forgets the exact definition), another path can trigger the memory (the user remembers "the glowing key under the desk" and reconstructs the security boundary concept from that image).

For each concept, generate:

- **`conceptN-name`**: A short label (3-7 words) that names the concept clearly. Good: "HMAC request signing boundary." Bad: "Security."
- **`conceptN-distillation`**: One sentence capturing the essential mechanism - what it is and why it works, not just what it does. Good: "Open-sourcing the CLI is safe because the algorithm is public but the per-install signing secret is not." Bad: "The CLI signs requests."
- **`conceptN-anchor`**: A vivid, specific, sensory image that encodes the meaning. The anchor should be strange enough to be memorable. Use concrete imagery, motion, color, location, or tactile detail. Avoid vague images like "a network" or "a map." Good: "A glass mailbox with public blueprints posted on the outside, but a private key glowing under the user's desk that only they can reach." Bad: "A lock and key."
- **`conceptN-hook`**: A personal or schema hook that connects the concept to something the user already knows or cares about. This leverages existing mental models. Good: "This matches how GitHub can publish webhook signing docs without exposing anyone's webhook secret." Bad: "This is important for security."

Examples of good encoding anchors across different concepts:

1. **Concept: Nonce-based replay protection**
   - Name: "Nonce replay protection"
   - Distillation: "A unique one-time number prevents attackers from resending captured requests by making each request provably fresh."
   - Anchor: "A bouncer at an exclusive club stamping each wrist with invisible ink that glows a different color every night - last night's stamp won't work tonight."
   - Hook: "Like the changing code on a 2FA app - even if someone saw your last code, it's already expired."

2. **Concept: Promises vs async/await error handling**
   - Name: "Async error propagation"
   - Distillation: "Unhandled promise rejections crash the process in Node 16+ unless caught, making manual .catch() chains riskier than try/catch with await."
   - Anchor: "A fuse box where one circuit has a modern breaker that trips cleanly (await) and the other has an old wire that smolders and sets the whole house on fire (unhandled rejection)."
   - Hook: "Like forgetting to close a file handle in Python - the garbage collector might save you, or it might corrupt your data at 3 AM."

3. **Concept: Database connection pooling**
   - Name: "Connection pool lifecycle"
   - Distillation: "Pre-opening a fixed number of database connections avoids the TCP handshake cost per query, but exhausting the pool under load causes request queuing instead of new connections."
   - Anchor: "A restaurant with exactly 10 tables - new diners wait at the bar instead of the chef building more tables. The wait time grows with the line, not with the cooking time."
   - Hook: "Like the thread pool in your web framework - the pool size is a deliberate bottleneck that trades throughput for predictable resource usage."

4. **Concept: Immutable deployments**
   - Name: "Immutable infrastructure"
   - Distillation: "Replacing entire servers or containers instead of patching running ones eliminates configuration drift and makes rollback instant by pointing traffic back to the previous version."
   - Anchor: "A mechanic who never repairs your car while you're driving it - they build a new identical car with the fix, swap your seat to the new one, and keep the old car running in the bay in case the fix was wrong."
   - Hook: "Like saving your game before a boss fight - if the new strategy fails, you reload the save, not try to heal mid-battle."

5. **Concept: CAP theorem tradeoffs**
   - Name: "CAP consistency vs availability"
   - Distillation: "A distributed system under network partition must choose between returning possibly stale data (availability) or refusing requests until it can confirm consistency across nodes."
   - Anchor: "Two bank tellers in separate buildings during a storm when the phone lines are down - one gives you your balance from their local ledger (available but maybe wrong), the other refuses to speak until the phones come back (consistent but unavailable)."
   - Hook: "Like choosing between reading your email offline from the last sync vs waiting for connectivity - Gmail chose availability, your bank chose consistency."

6. **Concept: Lazy loading vs eager loading**
   - Name: "ORM loading strategies"
   - Distillation: "Eager loading fetches related data in one query via JOINs to avoid N+1 problems, while lazy loading defers queries until the data is accessed, which simplifies code but risks performance degradation under loops."
   - Anchor: "A warehouse worker who either grabs every item on your shopping list in one trip with a big cart (eager) vs running back to the shelf for each item as you call it out from the counter (lazy, but the round trips add up)."
   - Hook: "Like REST vs GraphQL - REST gives you the whole resource in one call, GraphQL lets you pick fields but can cause waterfall requests without careful batching."

7. **Concept: Eventual consistency**
   - Name: "Eventual consistency model"
   - Distillation: "In eventually consistent systems, all replicas converge to the same state given enough time without new writes, but reads may return stale data during the propagation window."
   - Anchor: "A high school rumor that takes 2 hours to reach every student - the first person you ask might not know yet, but by lunchtime everyone has the same story. Ask too early and you get outdated intel."
   - Hook: "Like DNS propagation after changing your domain's IP - some resolvers cache the old address for up to 48 hours, and there's no way to force them all to update at once."

8. **Concept: Dependency inversion principle**
   - Name: "Dependency inversion"
   - Distillation: "High-level modules should not depend on low-level modules; both should depend on abstractions, which decouples business logic from implementation details and enables testing with mocks."
   - Anchor: "A universal power adapter that plugs into any wall socket via interchangeable plugs - your laptop (high-level module) doesn't care whether the wall (low-level detail) is US, EU, or UK; the adapter interface handles the translation."
   - Hook: "Like using a credit card instead of carrying 15 different currencies when traveling - the card is the abstraction, and each merchant's payment terminal handles the local conversion."

9. **Concept: Idempotency in distributed systems**
   - Name: "Idempotency keys"
   - Distillation: "Assigning a unique key per operation allows safely retrying requests because the server recognizes duplicates and returns the original result instead of processing the operation twice."
   - Anchor: "A librarian who stamps your book with today's date - stamping it again produces the same date, not 'tomorrow.' The stamp says 'this operation already happened' instead of 'do it again.'"
   - Hook: "Like the 'resend' button on your email client - if the first send succeeded but you didn't get the confirmation, resending with the same message ID doesn't create a duplicate in the recipient's inbox."

10. **Concept: Zero-downtime schema migrations**
    - Name: "Expand-contract migrations"
    - Distillation: "Database schema changes deploy in two phases: first add new columns/tables while old code ignores them (expand), then remove old columns after all code has been updated (contract), avoiding breaking changes at any point."
    - Anchor: "Building a new lane on a highway: first you build the lane while cars still use the old road (expand), then you open the new lane, let everyone switch over, and finally demolish the old lane (contract) - at no point is the road closed."
    - Hook: "Like adding a new field to a JSON API with a default value - old clients ignore the new field, new clients use it, and you only remove the default after every client has been updated."

### Step 4 - Generate Brain Dump Prompt

Generate the free-recall prompt that the user sees during the 2-minute brain dump phase. This prompt should instruct the user to write everything they remember without filtering, organizing, or looking back at the conversation. The key instruction is "do not organize" - organization happens in later phases. This phase is pure retrieval fluency.

The intent of the brain dump is twofold. First, retrieval itself strengthens memory traces (the testing effect), so even writing things down without feedback improves retention. Second, what the user does and does not write reveals gaps they are unaware of - things they thought they knew but cannot retrieve. The gap analysis phase later compares what they wrote to what they should have written.

The default prompt works for most sessions:

```text
Write everything you remember from the conversation. Do not look back. Do not organize. Just output.
```

Customize it only when the session has a narrow focus that would benefit from a scoped recall target:

- Narrow scope: "Write everything you remember about the database migration strategy we discussed. Do not look back. Do not organize. Just output."
- Broad scope: "Write everything you remember from this session - decisions, mechanisms, debugging discoveries, and tradeoffs. Do not look back. Do not organize. Just output."
- Architecture focus: "Write everything you remember about the system architecture decisions we made. Include the rationale you remember for each choice. Do not look back. Do not organize. Just output."

Examples of when to customize vs use the default:

1. **Use default:** The session covered multiple unrelated topics and you selected 3-5 concepts from across all of them. The broad prompt captures everything.
2. **Narrow scope:** The user added scope after `/retain` (e.g., `/retain focus on the CLI security model only`). Customize the brain dump to match that scope.
3. **Broad scope with emphasis:** The session was wide-ranging but the concepts all relate to a theme (e.g., "performance optimization"). Frame the prompt around that theme without restricting to specific subtopics.
4. **Debugging-heavy session:** Add "Include the bugs you encountered, what caused them, and how you fixed them" because debugging discoveries are high-value retrieval targets.
5. **Decision-heavy session:** Add "Include the decisions you made, the alternatives you considered, and why you chose as you did" because decision rationale is what fades fastest.

### Step 5 - Generate Cued Recall

Generate up to six open-text questions and hidden answer keys. This is the longest phase (5 minutes) and the core of the exercise. The user sees one question at a time, types their answer, then sees the hidden answer key to self-evaluate.

The intent of cued recall is to create desirable difficulty. Free recall (brain dump) activates broad memory traces. Cued recall targets specific traces with retrieval cues that force the user to reconstruct the answer rather than recognize it. The progression from retrieval (questions 1-2) to connection (questions 3-4) to transfer (questions 5-6) follows Bloom's taxonomy, building from simple recall to higher-order application. The hidden answer keys serve as immediate feedback, which is essential for correcting misconceptions before they consolidate.

Question rules:

- Use `--question1` through `--question6`.
- Use the matching hidden keys `--answer1` through `--answer6`.
- Questions 1-2 should retrieve specific important ideas from the conversation (retrieval level).
- Questions 3-4 should connect two ideas from the conversation (connection level).
- Questions 5-6 should apply an idea to a nearby context not explicitly discussed (transfer level).
- Target mechanisms, not vocabulary. Never ask "what is X called?" Ask "why does X work this way?" or "what happens if you change Y?"

Each answer key should say what a strong answer must include. Do not write only the final answer; include the criteria that make the answer correct. The answer key is the self-evaluation rubric the user uses to assess their own response.

Bad question: "What is lazy loading?"
Good question: "Why does lazy loading cause performance problems when iterating over a collection of objects, even if each individual query is fast?"

Bad answer key: "Lazy loading defers queries."
Good answer key: "A strong answer explains that each access triggers a separate database round-trip (the N+1 problem), that the cumulative latency of N sequential queries dwarfs the cost of a single JOIN, and that the problem is invisible in development with small datasets but explodes in production under real data volumes."

Examples of good question/answer pairs across difficulty levels:

**Retrieval level (questions 1-2):**

1. **Question:** "Why does the HMAC signing boundary belong in the CLI code rather than in the prompt text that the model generates?"
   **Answer key:** "A strong answer says prompt text is not a trust boundary - it can be injected, logged, leaked, or revealed. The CLI keeps the signing secret in environment variables or .env files that are never exposed to the model. It also explains that constructing HMAC headers requires cryptographic operations the model should not perform, and that keeping signing in code makes it auditable, testable, and version-controlled."

2. **Question:** "What problem does a nonce solve in a signed API request, and what would happen without one?"
   **Answer key:** "A strong answer explains that a nonce (number used once) prevents replay attacks by making each request unique even when the body, timestamp, and signature would otherwise be identical. Without a nonce, an attacker who captured a signed request could resend it and the server would accept it as valid because the signature would still match. A good answer also mentions that the server must track used nonces within a time window to detect replays."

3. **Question:** "Why did we choose the blueprint pattern over an ORM for this data access layer?"
   **Answer key:** "A strong answer references the specific tradeoffs discussed: the ORM's N+1 risk with complex joins, the difficulty of optimizing ORM-generated queries for the specific database engine, the team's existing familiarity with raw SQL, and the need for fine-grained control over transaction boundaries that the ORM abstracts away. It should distinguish between 'ORMs are bad' (simplistic) and 'this specific ORM created more problems than it solved in this specific context' (nuanced)."

4. **Question:** "What happens to in-flight requests during a zero-downtime deploy if the load balancer drains connections too quickly?"
   **Answer key:** "A strong answer explains that draining too quickly (short drain timeout) terminates connections before requests complete, causing client-side errors. The load balancer stops sending new requests to the old instance but existing connections get a grace period. If that grace period is shorter than the longest request, slow requests are cut off mid-flight. A good answer also mentions that clients must implement retry logic with exponential backoff, otherwise the aborted requests are lost permanently."

5. **Question:** "How does the event sourcing pattern handle a situation where the event schema needs to change between versions of the application?"
   **Answer key:** "A strong answer describes upcasting: old events are transformed to the new schema when read from the event store, but the original event is never modified. It explains that the event store is append-only and immutable, so schema changes are handled at read time through version-specific deserializers. It should mention that upcasting logic accumulates per version, and that testing must cover every historical schema version because you cannot replay events if any upcaster is broken."

**Connection level (questions 3-4):**

6. **Question:** "How does the HMAC signing boundary in the CLI relate to the same principle that makes webhook signature verification work, and where do they differ?"
   **Answer key:** "A strong answer identifies the shared principle: a shared secret known only to the sender and receiver, used to create a signature over the request body that proves authenticity and integrity. The differences: webhooks typically use a static secret while the CLI uses a per-install secret with a nonce and timestamp for freshness. Webhooks often verify only the body hash; the CLI's HMAC includes timestamp, nonce, body hash, and endpoint path in the canonical request. Both rely on the receiver recomputing the signature and comparing."

7. **Question:** "What is the relationship between the database connection pool size and the HTTP server thread pool size, and what happens when they are mismatched?"
   **Answer key:** "A strong answer explains that if the HTTP thread pool is larger than the connection pool, threads will queue waiting for database connections, creating head-of-line blocking where fast queries wait behind slow ones. If the connection pool is larger, idle connections waste database resources. The optimal ratio depends on the query latency distribution: I/O-bound services need roughly equal pools; CPU-bound services can have a smaller DB pool. It should also mention that connection timeouts interact with thread timeouts - a connection timeout that is shorter than the thread timeout causes cascading failures under load."

8. **Question:** "How does the concept of idempotency keys in API design connect to the idea of exactly-once delivery in message queues - what problem do they both solve and why are they different solutions?"
   **Answer key:** "A strong answer identifies that both solve the at-least-once delivery problem: a sender retries and the receiver must not process the duplicate. The difference is scope: idempotency keys are per-request and client-generated, stored by the server. Exactly-once delivery in messaging is infrastructure-level, using deduplication at the broker. Idempotency keys work across client restarts (the key persists in client state); broker-level deduplication typically has a limited window. A good answer notes that the strongest systems use both: broker dedup as a first line and application idempotency as a safety net."

9. **Question:** "Connect the idea of eventual consistency to the DNS propagation problem: why are they fundamentally the same pattern, and what does DNS teach us about designing eventually consistent applications?"
   **Answer key:** "A strong answer recognizes that DNS is a globally distributed eventually consistent system: multiple authoritative and recursive resolvers cache records independently, and there is a propagation delay (TTL) during which different clients see different IPs. DNS teaches that: (1) the TTL is a tradeoff between freshness and load - shorter TTL means faster propagation but more queries to the authoritative server, (2) clients must handle the stale-read window because you cannot eliminate it, only shrink it, and (3) the propagation is not uniform - some resolvers refresh faster than others, so you cannot assume 'all clients see the new value after TTL seconds.'"

10. **Question:** "Connect the expand-contract migration pattern to the dependency inversion principle: how do they both use the same underlying strategy to enable safe change?"
    **Answer key:** "A strong answer identifies the shared strategy: introducing an abstraction or intermediate layer that decouples the thing being changed from the things that depend on it. In expand-contract, the intermediate state (both old and new columns exist) is the abstraction - code can read from either. In dependency inversion, the interface is the abstraction - high-level code depends on the interface, not the implementation. Both patterns allow replacing the old thing (column/implementation) without breaking the dependent thing (query code/business logic) because the dependent thing never directly coupled to what was replaced."

**Transfer level (questions 5-6):**

11. **Question:** "A teammate proposes moving the HMAC signing logic from the CLI into a shared library that both the CLI and the prompt layer can call. What security risks does this introduce, even if the library itself is correctly implemented?"
    **Answer key:** "A strong answer identifies that the prompt layer gaining access to signing capabilities, even through a library, breaks the security boundary. The model can now construct signed requests, which means: (1) prompt injection could trick the model into signing attacker-chosen payloads, (2) the signing secret is now accessible from any context the model runs in, not just the controlled CLI environment, (3) audit trails blur because you can no longer distinguish between CLI-signed requests (trusted, tested code path) and model-signed requests (untrusted, unpredictable code path). The key insight is that the boundary is about who can initiate signing, not how signing is implemented."

12. **Question:** "If you were designing a new service that had to maintain consistency across three geographic regions and you could not use a single leader database, what pattern from this conversation would you apply and what new problem would you have to solve that we did not discuss?"
    **Answer key:** "A strong answer applies eventual consistency with conflict resolution, recognizing that multi-region writes require accepting temporary inconsistency. The new problem not discussed: conflict detection and resolution. When two regions accept conflicting writes to the same record before they can synchronize, you need a merge strategy (last-write-wins, CRDTs, operational transforms, or application-specific merge logic). It should also identify that the conversation covered read-time staleness (DNS analogy) but not write-write conflicts, which are the harder problem in multi-leader systems."

13. **Question:** "A new team member argues that connection pool exhaustion only happens at 'internet scale' and that a pool of 20 connections is enough for any internal service. Using the concepts from this conversation, what would you ask them to measure before accepting that claim?"
    **Answer key:** "A strong answer pushes back on the assumption by asking for: (1) the P99 query latency - if queries take 2 seconds at P99, 20 connections can only serve 10 requests/second before queuing, (2) the request arrival pattern - bursty traffic can exhaust the pool even at low average throughput, (3) the impact of downstream slowness - if the database slows down under load, the pool empties faster (the 'death spiral'), and (4) the cost of waiting - is queuing for a connection acceptable for this service's SLA, or does it cascade into timeouts upstream? The key is that pool sizing is a function of latency distribution, not request volume alone."

### Step 6 - Generate Active Reasoning Problems

Generate one or two active reasoning problems. These problems require the user to apply concepts from the conversation to a genuinely adjacent situation - one that was not directly discussed but where the same principle applies. This tests transfer, which is the strongest evidence of deep understanding.

The intent of active reasoning problems is to move beyond retrieval into application. A user who can answer cued recall questions but cannot solve a novel problem using the same concepts has not truly learned - they have memorized. The problems must be adjacent enough that the user recognizes which concept applies, but different enough that they cannot simply replay a conversation excerpt. The hidden criteria describe what a strong answer looks like so the user can self-evaluate after attempting the problem.

For each problem, produce:

- **`--problemN-scenario`**: An adjacent situation where a concept from the conversation applies. Set the scene with enough detail to make the problem concrete but not so much that the solution path is obvious.
- **`--problemN-question`**: An open-ended question about how to approach the situation. Do not name the concept in the question - the user must recognize which concept applies.
- **`--problemN-criteria`**: Hidden criteria for a strong answer, including assumptions the user should surface, mistakes to avoid, and what the solution should address.

The problems should require transfer. They should not be direct repeats of the conversation.

Examples:

1. **Scenario:** "Your team is building an internal CLI tool that developers will install locally. The tool needs to collect usage analytics and submit them to a central server, but the server must be certain the data came from a legitimate installation and was not tampered with in transit."
   **Question:** "Design the submission mechanism for this tool. What must happen on the client side, what must the server verify, and where does the trust boundary live?"
   **Criteria:** "A strong answer applies the prompt-to-CLI-to-backend boundary pattern: the CLI signs analytics payloads with a per-install secret, the server verifies with the corresponding public key or shared secret, and never trusts unauthenticated data. It identifies that the analytics payload (like the retention module) must be structured and signed before transmission, that the install secret must be generated at install time and never exposed to the tool's plugin ecosystem, and that the server must reject replays via nonce or timestamp windows. It avoids the mistake of putting the signing secret in configuration files that plugins can read."

2. **Scenario:** "A teammate added a new feature that queries a list of 500 projects and, for each project, loads the project owner's profile from the database to display their avatar URL. The page loads fine in development with 10 projects but times out in staging with real data. They are confused because 'each query is indexed and takes under 5ms.'"
   **Question:** "What is the actual performance problem, why is it invisible in development, and what would you change to fix it while keeping the same feature?"
   **Criteria:** "A strong answer identifies the N+1 query pattern: 1 query for 500 projects plus 500 queries for 500 owners = 501 queries. Even at 5ms each, that is 2.5 seconds of cumulative database time. It explains that development has 10 projects (50ms, imperceptible) while staging has 500 (2.5s, plus network latency). The fix: eager load owner profiles in the initial query with a JOIN or use a batch query (SELECT * FROM users WHERE id IN (...)). It should also mention that connection pool contention makes this worse - those 500 sequential queries tie up a connection that other requests are waiting for."

3. **Scenario:** "Your team deploys a new version of a background job processor. The deploy process stops the old containers and starts new ones. During the deploy, some jobs that were mid-processing are lost. The team proposes adding a 'graceful shutdown' that waits 30 seconds for jobs to finish. The product manager objects that this makes deploys take 30 seconds longer."
   **Question:** "What alternative deployment pattern would let you deploy immediately (zero wait) while still ensuring no jobs are lost? What tradeoff does this pattern introduce?"
   **Criteria:** "A strong answer applies immutable deployment or blue-green: start the new job processor alongside the old one, let the old one finish its in-flight jobs naturally (no forced shutdown), drain traffic from old to new over time, and only remove the old instance when it has zero in-flight jobs. The tradeoff: you temporarily run double the infrastructure (old + new instances), which costs more during the deploy window. It should also mention that the jobs must be idempotent because both old and new processors might briefly claim the same job during the overlap period."

4. **Scenario:** "You are reviewing a pull request where the author added caching to a user profile endpoint. They cache the full profile object with a 1-hour TTL. The profile includes fields like 'last_active_at' that update every few minutes and 'account_status' that can change at any time when an admin suspends an account. The author says 'stale data is fine because users won't notice a few minutes of delay.'"
   **Question:** "What specific problems could this caching strategy cause, and how would you redesign it to keep the performance benefit while avoiding stale-data bugs?"
   **Criteria:** "A strong answer identifies two categories of problems. (1) Account status staleness: a suspended user could continue accessing the system for up to an hour because the cached profile says 'active.' This is a security/correctness issue, not a UX issue. (2) Stale last_active_at is cosmetic. The fix: split the cache by field sensitivity. Cache stable fields (name, avatar, join date) with a long TTL. Either don't cache sensitive fields (account_status) or use a short TTL with cache invalidation on status change. The key insight is that caching strategy must distinguish between 'eventually correct is fine' and 'eventually correct is a security bug.'"

5. **Scenario:** "A service uses optimistic locking with a version column. Two users simultaneously edit the same document. User A saves first (version 1 → 2, success). User B saves second with version 1 and gets a conflict error. The frontend developer wants to auto-resolve by just retrying User B's save with version 2, merging the changes automatically."
   **Question:** "Why is automatic retry with merge dangerous in this scenario, and what safer alternatives exist?"
   **Criteria:** "A strong answer explains that auto-merging without user inspection can produce nonsensical results: User A changed paragraph 3, User B also changed paragraph 3 - a naive merge would concatenate both versions or pick one arbitrarily. The conflict means 'two people changed the same document in potentially incompatible ways.' The safer alternatives: (1) show both versions and let the user resolve (like Google Docs suggesting mode), (2) use CRDTs that can merge text changes deterministically, or (3) use field-level versioning so non-overlapping edits don't conflict. The mistake to avoid: assuming that 'conflict' means 'the computer can't figure it out' rather than 'two humans made contradictory decisions.'"

6. **Scenario:** "You're designing an API endpoint that charges a customer's credit card. The payment gateway sometimes returns a timeout even when the charge succeeded on their end. The frontend retries the request, and customers are occasionally double-charged. The team wants to add a 'check for duplicate' endpoint that the frontend calls before retrying."
   **Question:** "Why does the 'check then retry' approach still have a race condition? What would be a more reliable solution?"
   **Criteria:** "A strong answer identifies that check-then-retry has a TOCTOU (time-of-check-time-of-use) race: between checking and retrying, the state can change. The solution is idempotency: the frontend generates a unique idempotency key before the first attempt, passes it on every retry, and the server recognizes the key and returns the original result instead of charging again. The idempotency key must be generated client-side before any attempt, not server-side after receiving the request. It should also note that the idempotency key store on the server needs a TTL - you don't need to remember every key forever, just long enough to cover the maximum retry window."

7. **Scenario:** "Your microservice ecosystem has 30 services. Each service has its own database. The team wants to add a 'generate monthly report' feature that aggregates data from 5 different services. The proposal is to have the report service query all 5 services synchronously, assemble the data, and return the report."
   **Question:** "What will happen to this report endpoint at scale, and what architectural pattern from the conversation would you use to make it reliable?"
   **Criteria:** "A strong answer identifies that synchronous aggregation creates a fragile chain: if any of the 5 services is slow or down, the entire report fails. It also creates a thundering herd if multiple users request reports simultaneously, multiplying the load on all 5 services. The pattern to apply: use an event-driven architecture where each service emits domain events into a shared event bus or log, and the report service maintains its own read-optimized materialized view by consuming those events. This decouples report generation from service availability - the report service always has data (possibly slightly stale) and the source services are never queried directly for reports."

8. **Scenario:** "A developer added a feature flag system that checks 50 feature flags on every request by calling a configuration service over HTTP. Under load, the configuration service becomes the bottleneck, and requests that should be fast (all flags disabled) are spending 200ms just checking flags."
   **Question:** "How would you redesign the feature flag system to eliminate the per-request network call while preserving the ability to toggle flags in near-real-time?"
   **Criteria:** "A strong answer applies the principle of local caching with periodic refresh: each service instance loads the full flag state at startup and polls for updates every N seconds (e.g., every 10 seconds). Flag checks become in-memory hashmap lookups (microseconds instead of milliseconds). The tradeoff: flag changes take up to N seconds to propagate to all instances. This is usually acceptable because: (1) most flags are long-lived configuration, not real-time toggles, (2) emergency kill switches can use a separate fast path (e.g., a tiny dedicated endpoint that only serves kill-switch flags), and (3) the performance improvement (200ms → microseconds) outweighs the staleness delay. The mistake to avoid: making every flag real-time when only 2 out of 50 actually need instant toggling."

### Step 7 - Generate Review Prompts

Generate three review prompts for spaced repetition. These prompts are shown to the user at increasing intervals (1 day, 3 days, 7 days) and force retrieval at each checkpoint. The prompts should be distinct from the cued recall questions - they should target the most important overarching concepts rather than specific details.

The intent of the review schedule is to combat the forgetting curve. Memory decays exponentially after initial encoding, and each retrieval resets the decay curve. The intervals (1 day, 3 days, 7 days) approximate an expanding schedule: the first review happens before significant decay, the second after some forgetting has occurred (making retrieval harder and therefore more effective), and the third after a longer gap to test durable retention. Each prompt should be a single task that takes 2-3 minutes - enough to force retrieval but not so much that the user skips the review.

- **`--review1`**: Near-term review (1 day later). Target the concept the user was least confident about.
- **`--review2`**: Medium review (3 days later). Target the most complex concept that benefited from connection-level questions.
- **`--review3`**: Longer review (7 days later). Target synthesis: explain the most important concept from memory in one paragraph.

Each review prompt should force retrieval, not rereading. Never say "review your notes on X" - say "explain X from memory."

Examples:

1. **After a security architecture session:**
   - review1: "From memory, draw the trust boundary between the prompt layer, CLI, and backend. Label where secrets live and where signing happens."
   - review2: "A colleague proposes moving HMAC signing from the CLI into a shared npm package. From memory, write three specific security arguments against this design."
   - review3: "In one paragraph, explain the principle that determines where cryptographic operations should live in a multi-component system. Use an example from outside this project."

2. **After a database optimization session:**
   - review1: "From memory, list the three connection pool configuration parameters that most affect tail latency, and explain what happens when each is set too low."
   - review2: "A new service you've never seen has P99 latency of 3 seconds on its database queries. From memory, list four possible causes and how you would test each hypothesis."
   - review3: "In one paragraph, explain why database performance problems are rarely about query speed and almost always about query quantity. Use a real-world analogy."

3. **After a distributed systems discussion:**
   - review1: "From memory, explain why idempotency keys must be generated client-side, not server-side. What breaks if the server generates them on receipt?"
   - review2: "Compare eventual consistency and strong consistency from the perspective of a mobile app that works offline. From memory, describe a feature that requires each approach."
   - review3: "In one paragraph, explain the tradeoff between consistency and availability during a network partition. Give a concrete example of a system that chose each side."

4. **After a testing strategy session:**
   - review1: "From memory, write the test pyramid for a typical CRUD API. Label each layer with what it catches and what it misses."
   - review2: "A test is flaky - it passes 80% of the time. From memory, list four possible root causes and the diagnostic question you would ask to distinguish each one."
   - review3: "In one paragraph, explain why 'more tests' is not a testing strategy and what a testing strategy actually optimizes for."

5. **After a code review patterns discussion:**
   - review1: "From memory, list the three categories of code review feedback and give an example of each that is NOT from this session."
   - review2: "A PR review says 'this could be more efficient.' From memory, explain why this feedback is incomplete and what a reviewer should include to make it actionable."
   - review3: "In one paragraph, explain what makes code review feedback effective versus demotivating. Use the difference between 'this is wrong' and 'this has a specific consequence.'"

### Step 8 - Invoke the CLI

Invoke the CLI with the generated fields. The public command shape is:

```bash
vidbyte retain \
  --title "$RETAIN_TITLE" \
  --domain "$RETAIN_DOMAIN" \
  --conversation-id "$RETAIN_CONVERSATION_ID" \
  --concept1-name "$CONCEPT_1_NAME" \
  --concept1-distillation "$CONCEPT_1_DISTILLATION" \
  --concept1-anchor "$CONCEPT_1_ANCHOR" \
  --concept1-hook "$CONCEPT_1_HOOK" \
  --brain-dump-prompt "$BRAIN_DUMP_PROMPT" \
  --question1 "$QUESTION_1" \
  --answer1 "$ANSWER_1" \
  --problem1-scenario "$PROBLEM_1_SCENARIO" \
  --problem1-question "$PROBLEM_1_QUESTION" \
  --problem1-criteria "$PROBLEM_1_CRITERIA"
```

Add `--concept2-*` through `--concept5-*`, `--question2` through `--question6`, `--answer2` through `--answer6`, `--problem2-*`, and `--review1` through `--review3` when generated.

If the `vidbyte` binary is not available, instruct the user to install it. Use the following pattern to invoke the CLI:

```bash
if command -v vidbyte >/dev/null 2>&1; then
  vidbyte retain \
    --title "$RETAIN_TITLE" \
    --domain "$RETAIN_DOMAIN" \
    --conversation-id "$RETAIN_CONVERSATION_ID" \
    --concept1-name "$CONCEPT_1_NAME" \
    --concept1-distillation "$CONCEPT_1_DISTILLATION" \
    --concept1-anchor "$CONCEPT_1_ANCHOR" \
    --concept1-hook "$CONCEPT_1_HOOK" \
    --brain-dump-prompt "$BRAIN_DUMP_PROMPT" \
    --question1 "$QUESTION_1" \
    --answer1 "$ANSWER_1" \
    --problem1-scenario "$PROBLEM_1_SCENARIO" \
    --problem1-question "$PROBLEM_1_QUESTION" \
    --problem1-criteria "$PROBLEM_1_CRITERIA"
else
  echo "Vidbyte CLI is not installed. Install it with: npm install -g vidbyte-skills"
fi
```

Do not call `curl`. Do not construct headers. Do not include secrets in prompt text, files, or command arguments. The CLI handles signing and transport.

### Step 9 - Display the Result

If the CLI succeeds, display its output exactly as returned. A successful URL response should look like:

```text
Your retention exercise is ready on https://vidbyte.pro/...
```

If the CLI fails, display only a concise failure message and the CLI error. Because `/retain` is explicit, failures should not be silent.

## Constraints

- Do not show the full exercise inline in the terminal.
- Do not ask the user to approve the exercise before submitting; `/retain` is the approval.
- Do not use multiple choice questions.
- Do not generate questions that only test names or definitions.
- Do not include raw secrets, API keys, or environment values.
- Do not call Vidbyte endpoints directly from prompt text.
- Do not use a file as the primary submission interface. The command should mimic the exercise shape with flags.

## Success Criteria

- The normal conversation flow stops when `/retain` is invoked.
- The exercise contains at least one complete concept and one complete question/answer pair.
- The target shape is 3-5 concepts, 6 cued recall questions, 1-2 active reasoning problems, and 3 review prompts.
- The model invokes `vidbyte retain` rather than `vidbyte retain submit`.
- The CLI flags represent the generated exercise fields directly.
- The only user-facing success output is the Vidbyte URL line returned by the CLI.
- The backend receives a signed request through the Vidbyte CLI.

## Inputs

**Required invocation:** `/retain`

**Implicit context:** The current conversation history is the source material for the exercise.

**Optional user scope:** The user may add scope text after `/retain`, such as `/retain focus on the CLI architecture only`. If present, generate the module from that subset of the conversation.
