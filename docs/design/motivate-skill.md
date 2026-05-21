# Design Doc: Motivate Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-20
**Last Updated:** 2026-05-20

---

## 1. Overview

The `motivate` skill is a user-invoked slash command (`/motivate`) that delivers a motivational quote about learning. Its defining mechanic is **self-persistence**: every quote delivered gets appended to a `## Used Quotes` section inside its own `SKILL.md`, guaranteeing the user never hears the same quote twice across any number of sessions. The underlying pattern — a skill that tracks its own state by mutating its own file — is genuinely useful and demonstrates a clean self-modifying skill architecture.

The skill ships with a bank of 30 quotes about learning, all stored directly in the `SKILL.md` file under a `## Quote Bank` section. This makes the source of truth human-readable, easy to extend via PR, and co-located with the skill definition.

---

## 2. Goals & Non-Goals

### Goals
- Deliver one unused motivational quote on `/motivate` invocation
- Track delivered quotes by appending to a managed block inside `SKILL.md`
- Guarantee deduplication — no quote ever repeats as long as unused quotes remain
- Print a counter showing progress (`Quote N of 30 delivered`)
- Handle exhaustion gracefully with a reset prompt
- Be self-contained in a single `SKILL.md` file — no scripts, references, or assets subdirectories
- Register the skill in version 3 of the skill versions manifest
- Follow existing SKILL.md conventions (frontmatter, procedural instructions, constraints)

### Non-Goals
- Running automatically in the background — this is user-invoked only (`/motivate`)
- Backend submission or CLI integration — no CLI calls, no API endpoints, no data sent to Vidbyte
- Category flags, theming, or subcommands (e.g., `/motivate --theme resilience`) — deferred to future versions
- Multiple quote banks or user-contributed quotes — the single bank of 30 is v1
- Per-user state across machines — state is per-install (the `SKILL.md` file itself)
- Cross-platform state persistence — rule-file platforms (Windsurf, Cline) will degrade gracefully

---

## 3. Background & Context

### Skill Taxonomy Fit

Per `artifacts/create-skill-guide.md`, this is a **Type 2: Prompt Skill** — it produces inline output with no CLI calls, no backend submission, and no session lifecycle. However, it introduces a novel mechanic: **self-modifying state via SKILL.md mutation**. This is not currently present in any existing skill in the repository.

### Managed Block Pattern

The `## Used Quotes` section uses sentinel comments (`<!-- vidbyte-motivate:used-start -->` / `<!-- vidbyte-motivate:used-end -->`) to mark the mutable block. This mirrors the managed block pattern Vidbyte already uses in `lib/rule-documents.js` for instruction-file integrations (`<!-- vidbyte-skills:start/end -->`). The sentinels let the skill find and update this block precisely without corrupting the rest of the file.

### Version 3 Placement

The skill is being placed in version 3 of `lib/skill-versions.json` (currently empty). This is appropriate because:
- Version 1 already has 5 curated prompt skills
- Version 2 is empty (reserved)
- Version 3 currently has no skills, making this the inaugural v3 skill

### Degraded Mode

On rule-file platforms (Windsurf, Cline) where the skill is flattened into a static rules file at install time, state persistence is not supported. In this case, the skill should degrade gracefully: deliver a quote but skip deduplication, and note that state tracking is unavailable on the platform.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate when the user invokes `/motivate` (case-insensitive, exact match, no arguments required).
2. The skill SHALL read its own `SKILL.md` to parse the Quote Bank and Used Quotes sections.
3. The skill SHALL select a random quote from the set of quotes not yet used.
4. The skill SHALL print the quote in a formatted box with a progress counter.
5. The skill SHALL append the chosen quote to the Used Quotes block between the sentinel comments.
6. The skill SHALL NOT repeat any quote already listed in the Used Quotes block.
7. When all 30 quotes are exhausted, the skill SHALL print a congratulatory message and ask the user if they want to reset.
8. If the user says yes to reset, the skill SHALL clear the Used Quotes block. If no, the skill SHALL exit.
9. The skill SHALL NOT trigger on any user prompt that does not begin with `/motivate`.
10. The skill SHALL preserve every line in `SKILL.md` outside the Used Quotes block — only the content between sentinels changes.

### Non-Functional Requirements

- **Performance**: File I/O on skill invocation is acceptable (READ + WRITE of a single small Markdown file).
- **Scalability**: The quote bank is fixed at 30 quotes. Linear scan of quotes for deduplication is O(n) and bounded.
- **Security**: No network calls, no credential exposure, no external dependencies. The skill only reads/writes its own `SKILL.md`.
- **Reliability**: Sentinel comments ensure the write operation never corrupts other sections. If the sentinels are missing or malformed, the skill SHALL print an error and degrade gracefully (deliver a random quote without tracking).

---

## 5. High-Level Design

The skill is a single `SKILL.md` file that serves as both the skill definition and the mutable state store. On invocation, the model reads the file, computes available quotes, selects one, prints it, and edits the Used Quotes block.

**Data flow:**

```
User: "/motivate"
         |
         v
[Agent with motivate skill loaded]
         |
         +-- READ skills/motivate/SKILL.md
         |
         +-- PARSE ## Quote Bank → full_set (30 quotes)
         +-- PARSE ## Used Quotes block → used_set
         |
         +-- COMPUTE available = full_set - used_set
         |
         +-- Is available empty?
         |     |
         |    Yes → Print exhaustion message, ask reset
         |     |     |
         |     |    Yes → Clear Used Quotes, WRITE back
         |     |     No → EXIT
         |     |
         |     No → Pick random from available
         |           Print formatted quote + counter
         |           Append quote to used_set
         |           WRITE updated used_set between sentinels
         |
         +-- Response delivered
```

**Key design decisions:**

1. **Single file, no subdirectories**: The entire skill is `skills/motivate/SKILL.md`. No `scripts/`, `references/`, or `assets/` needed. This is deliberate — a single-file skill is elegant and easy to distribute.

2. **Sentinel comments for mutation safety**: The `<!-- vidbyte-motivate:used-start -->` and `<!-- vidbyte-motivate:used-end -->` comments create a precise editing target. The skill never touches anything outside this block, preventing accidental corruption of the Quote Bank or instruction sections.

3. **Quote Bank co-located in SKILL.md**: Rather than a separate data file, quotes live directly in the skill definition. This makes the source of truth human-readable, easy to extend via PR, and avoids file discovery issues across platforms.

4. **Install mode: copy-only**: Because `SKILL.md` is both definition and state store, the installer must treat `motivate` as copy-only (`--mode copy`). A symlink or shared file would mean two users/machines share the same used-quotes state, which breaks the per-user guarantee.

5. **Counter as reward loop**: The `(Quote N of 30 delivered)` counter gives users visible progress toward hearing all 30 quotes, creating a light gamification loop.

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition + State Store)

**File(s):** `skills/motivate/SKILL.md`
**Type:** New file

#### Frontmatter

```yaml
---
name: motivate
description: >
  Use when the user runs /motivate. Delivers one motivational quote about
  learning that has not been shown before, then logs it inside this file
  so it is never repeated.
---
```

#### Body Sections

1. **Steps** — Algorithmic instructions for the model, matching the behavior contract
2. **Output Style** — ASCII art box format with quote, attribution, and counter
3. **Exhaustion Message** — What to display when all quotes are delivered
4. **Quote Bank** — 30 motivational quotes about learning (data section, read-only at runtime)
5. **Used Quotes** — Managed block with sentinel comments (mutable state, write-only between sentinels)

#### Algorithm (from SKILL.md Steps)

```
1. READ skills/motivate/SKILL.md
2. PARSE ## Quote Bank section → list of quote strings
3. PARSE ## Used Quotes block (between sentinel comments) → list of used quote strings
4. COMPUTE available = quote bank - used quotes

5. IF available is empty:
     PRINT exhaustion message
     ASK user "Reset the log and start over? (yes/no)"
     IF yes → CLEAR used_set, WRITE back, EXIT
     ELSE   → EXIT

6. PICK one quote at random from available

7. PRINT formatted output (see Output Style)

8. APPEND the chosen quote to used_set
9. WRITE updated used_set back between sentinel comments in SKILL.md
```

#### Output Style

```
╔══════════════════════════════════════╗
║          🌱  Time to Learn           ║
╚══════════════════════════════════════╝

"<quote text>"

  — <attribution>

  (Quote <used_count> of <total_count> delivered)
```

#### Exhaustion Message

```
🎉 You've heard every quote in the bank — that's 30/30.
   Impressive dedication. Want to reset and go again? (yes/no)
```

#### Quote Bank

30 quotes about learning, sourced from diverse historical figures:
1. Benjamin Franklin — "An investment in knowledge pays the best interest."
2. B.B. King — "The beautiful thing about learning is that no one can take it away from you."
3. Mahatma Gandhi — "Live as if you were to die tomorrow. Learn as if you were to live forever."
4. Dr. Seuss — "The more that you read, the more things you will know."
5. W.B. Yeats — "Education is not the filling of a pail, but the lighting of a fire."
6. Plutarch — "The mind is not a vessel to be filled, but a fire to be kindled."
7. Henry Ford — "Anyone who stops learning is old, whether at twenty or eighty."
8. Leonardo da Vinci — "Learning never exhausts the mind."
9. Benjamin Franklin — "Tell me and I forget. Teach me and I remember. Involve me and I learn."
10. Confucius — "It does not matter how slowly you go as long as you do not stop."
11. Jiddu Krishnamurti — "Real learning comes about when the competitive spirit has ceased."
12. Helen Hayes — "Every expert was once a beginner."
13. Albert Einstein — "Wisdom is not a product of schooling but of the lifelong attempt to acquire it."
14. Brian Herbert — "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."
15. Vincent van Gogh — "I am always doing what I cannot do yet, in order to learn how to do it."
16. Leonardo da Vinci — "Study without desire spoils the memory, and it retains nothing that it takes in."
17. Henry Ford — "The only real mistake is the one from which we learn nothing."
18. Zig Ziglar — "You don't have to be great to start, but you have to start to be great."
19. Albert Einstein — "The more I learn, the more I realize how much I don't know."
20. Phil Collins — "In learning you will teach, and in teaching you will learn."
21. Nelson Mandela — "I never lose. I either win or I learn."
22. Anthony J. D'Angelo — "Develop a passion for learning. If you do, you will never cease to grow."
23. Malcolm X — "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
24. George B. Leonard — "To learn is to change. Education is a process that changes the learner."
25. Unknown — "Mistakes are proof that you are trying."
26. Unknown — "Push yourself, because no one else is going to do it for you."
27. Neil Strauss — "Great things never came from comfort zones."
28. Mark Twain — "The secret of getting ahead is getting started."
29. Nelson Mandela — "It always seems impossible until it's done."
30. C.S. Lewis — "You are never too old to set another goal or to dream a new dream."

### 6.2 skills-manifest.json Update

**File(s):** `skills-manifest.json`
**Type:** Modified file

Add `"motivate"` to the `learning` array.

### 6.3 skill-versions.json Update

**File(s):** `lib/skill-versions.json`
**Type:** Modified file

Add `"motivate"` to version `"3"` array.

---

## 7. Data Model Changes

N/A — The skill has no structured data model. The Quote Bank is a Markdown bullet list; the Used Quotes block is also a Markdown bullet list between sentinel comments. Both are human-readable and require no parsing beyond bullet detection.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. This is a prompt-based skill with no server component. No CLI integration is needed.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/motivate/SKILL.md` | Core skill definition + quote bank + mutable state store |
| CREATE | `docs/design/motivate-skill.md` | This design document |
| MODIFY | `skills-manifest.json` | Add `"motivate"` to `learning` array |
| MODIFY | `lib/skill-versions.json` | Add `"motivate"` to version `"3"` |

**Total: 2 files created, 2 files modified, 0 files deleted.**

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. The skill is a Markdown prompt.

### Integration Tests
N/A — The skill operates within the LLM's session context.

### Validation Tests
- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/motivate/SKILL.md` exists
  - Frontmatter has valid `name: motivate` matching the directory
  - Frontmatter has non-empty `description`
  - Body is non-empty
  - Skill name matches `^[a-z0-9]+(-[a-z0-9]+)*$` regex (`motivate` is a single word, no hyphens needed)

### Manual / QA Test Cases

1. **Basic invocation**: Given the user types `/motivate`, then a formatted quote box appears with a random learning quote and a counter showing `(Quote 1 of 30 delivered)`.

2. **Deduplication**: Run `/motivate` multiple times. Verify no quote repeats. Verify the counter increments correctly.

3. **State persistence**: After running `/motivate`, inspect `skills/motivate/SKILL.md` and confirm the delivered quote appears in the `## Used Quotes` block between sentinel comments.

4. **No false activation**: Given the user types "motivate me" or "I need motivation" (without `/motivate` prefix), the skill does not activate.

5. **Exhaustion**: After all 30 quotes are delivered (simulated by pre-filling the Used Quotes block with all 30), invoke `/motivate` and verify the exhaustion message appears with a reset prompt.

6. **Reset**: Respond "yes" to the reset prompt. Verify the Used Quotes block is cleared.

7. **Reset decline**: Respond "no" to the reset prompt. Verify the skill exits without changes.

8. **File integrity**: Run `/motivate` multiple times, then verify the Quote Bank and instruction sections in `SKILL.md` remain unchanged — only the Used Quotes block was modified.

9. **npm test**: Run `npm test` and confirm the new skill passes metadata validation.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | The skill has zero external dependencies | None |

The skill operates entirely through the LLM agent's native capabilities: reading a Markdown file, parsing bullets, selecting randomly, and editing a delimited block. No npm packages, APIs, databases, or services are involved.

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the agent's skill selection layer matches `/motivate` to the skill's description trigger.
- **Breaking change**: No. This is a new, additive skill. No existing code is modified (only manifest additions).
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Install mode**: The skill should be installed with `copy-only` mode. The existing installer defaults to copy mode for skill directories, and symlink mode requires explicit `--mode link`. The current behavior already satisfies the constraint. No installer changes needed.
- **Rollback procedure**: Delete `skills/motivate/` directory, remove `"motivate"` from `skills-manifest.json` and `lib/skill-versions.json`, re-run the installer. No data migration needed.

---

## 13. Open Questions

- [ ] **`/motivate reset` subcommand?** Defer to v2.
- [ ] **Category flags (`--theme resilience`)?** Defer to v2.
- [ ] **Git merge strategy for `## Used Quotes`?** Document in SKILL.md that contributors should clear the Used Quotes block before submitting PRs.
- [ ] **Dynamic total count?** Compute `total_count` by counting bullets in Quote Bank so the counter stays accurate if quotes are added/removed.

---

## 14. Alternatives Considered

### Alternative 1: Separate state file (`used-quotes.json`)
- Why rejected: Introduces file discovery issues, requires JSON parsing/writing in SKILL.md instructions, breaks the elegant single-file design.

### Alternative 2: CLI-backed tracking (submit to Vidbyte backend)
- Why rejected: Massive overkill for a fun motivational skill. Requires dataclasses, command classes, routing, smoke tests, and backend schema changes.

### Alternative 3: Session-only state (no persistence)
- Why rejected: The defining mechanic is "never hear the same quote twice across any number of sessions." Session-only defeats this.

### Alternative 4: Separate quote bank file (`quotes.md`)
- Why rejected: Same file discovery issues. Co-locating in SKILL.md keeps the single-file design intact.

---

END OF DESIGN DOC
