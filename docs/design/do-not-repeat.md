# Design Doc: Do-Not-Repeat Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-11
**Last Updated:** 2026-05-11

---

## 1. Overview

The `do-not-repeat` skill is a persistent learning guardian that silently monitors user prompts across sessions. When it detects that the user has made the same conceptual mistake or exhibited the same knowledge gap twice, it intervenes with a minimal, targeted correction and 1-2 calibrated questions designed to break the repeating pattern by forcing the user to reason through the correct understanding themselves. Between interventions, the skill is silent — it logs, compares, and waits.

---

## 2. Goals & Non-Goals

### Goals
- Create a single SKILL.md that the LLM agent reads and follows as procedural instructions
- Detect when a user repeats a conceptual error or knowledge gap across prompts (semantically, not via string matching)
- Maintain a persistent, bounded `recent_conversation.md` file that tracks identified gaps across sessions
- Add up to 2 new gap entries every 5 user prompts
- Intervene (replace normal response) when a semantic match to an existing entry is detected
- Trim the tracking file when it exceeds 200 lines (remove oldest 50 lines, preserving the header)
- Support platform-specific file paths for Claude Code, Claude.ai, Claude Desktop (macOS/Windows/Linux), OpenCode, and other harnesses

### Non-Goals
- Installing any new runtime code (the skill is a prompt, not executable code)
- Modifying the installer (`bin/`, `lib/`) — this is a standard, auto-discovered skill
- Modifying validation scripts — the skill passes existing validation unchanged
- Tracking one-off typos or surface-level syntax errors — only model-level conceptual gaps
- Intervening more than once per 5-prompt check, even if multiple repeated errors are detected
- Providing general tutoring or proactive teaching — intervention is the only output mode

---

## 3. Background & Context

Users frequently ask LLMs the same types of questions and make the same conceptual errors across sessions. Without persistent memory of these gaps, each session starts fresh, and the user's mistaken mental models go uncorrected. Standard LLM responses correct the surface error each time but do not break the underlying pattern.

This skill fills that gap by being a persistent, write-capable observer that:
- Logs identified conceptual gaps to a file that persists across sessions
- Compares new prompts against those logged gaps on a fixed cadence (every 5 prompts)
- Intervenes only when a confirmed pattern (same gap, second occurrence) is detected
- Delivers the correction through guided questions, not direct explanation

The skill lives in `skills/do-not-repeat/SKILL.md` as a standard installable skill. It is a **non-reasoning** skill (`do-not-repeat` does not match `-trace*`), so it will be selected by default installs. It is self-contained with zero external dependencies.

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL insert itself into every agent session silently and scan user prompts for conceptual errors or knowledge gaps.
2. On first invocation in any environment, the skill SHALL detect the platform and create `recent_conversation.md` at the platform-correct path with the header `# Do-Not-Repeat Log`.
3. If `recent_conversation.md` already exists at the correct path, the skill SHALL skip initialization (read existing entries, do not recreate).
4. The skill SHALL maintain a session-local prompt counter, incrementing by 1 for each user message, resetting to 0 when a new session begins.
5. Every 5th prompt (when counter reaches a multiple of 5), the skill SHALL read the current contents of `recent_conversation.md` and review the last 5 user prompts for conceptual gaps.
6. For each candidate gap identified, the skill SHALL check for a semantic match against existing entries in `recent_conversation.md`.
7. If the candidate gap does NOT exist in the file: append a bullet entry (max 2 new entries per check, prioritizing the most significant gaps). Each entry format: `- **[Topic label]**: [What they got wrong - 1 sentence.] [Correct understanding + why their version falls short - 1-2 sentences.]`
8. If the candidate gap DOES already exist in the file: halt normal response and deliver an intervention (see requirement 11). Do NOT add a duplicate entry.
9. After adding entries, if the file exceeds 200 lines (not counting trailing newline), the skill SHALL remove the first 50 lines of body content below the `# Do-Not-Repeat Log` header, preserving the header itself.
10. Only 1 intervention SHALL be delivered per 5-prompt check, even if multiple repeated errors are detected simultaneously. Choose the most significant one.
11. An intervention SHALL replace the normal response entirely and follow this exact structure:
    - Opening delimiter: `---`
    - `⚠️ **This has come up before.**`
    - `**What you got wrong:** [One focused paragraph — what the user stated or implied, why it is incorrect, what the correct understanding is. Maximum 4 sentences. Informational register — subject is the concept, not the user's competence.]`
    - `**Think through this:**`
    - `1. [Open-ended question, calibrated to user's level, requiring reasoning]`
    - `2. [Optional second question extending the reasoning path]`
    - Closing delimiter: `---`
12. The skill SHALL NOT deliver interventions for new errors, uncertain matches, one-off mistakes, or surface-level typos. Silence is the correct behavior when no confirmed pattern is detected.
13. The skill SHALL perform semantic comparison between candidate and existing entries — matching the underlying misconception, not the surface wording.
14. The skill SHALL NOT frame the intervention as punishment or judgment — tone must be informational: "this has come up before" not "you keep getting this wrong."

### Non-Functional Requirements

- **Performance**: No measurable overhead. The file I/O (read + optional write) happens once every 5 prompts and operates on a file of at most 200 lines (~8KB). Context processing is limited to the last 5 user prompts.
- **Scalability**: The file is capped at 200 lines with rolling trim. It will never grow unbounded across infinite sessions.
- **Security**: The file is written to the user's own skills directory. No secrets or credentials are involved. No network calls.
- **Observability**: The file itself serves as the audit log. The prompt counter is session-local and not persisted.
- **Reliability**: If file read fails (file missing after initialization), treat as 0 existing entries. If file write fails, fail silently.

---

## 5. High-Level Design

The skill is a single `SKILL.md` file that functions as a procedural instruction set for the LLM agent. The agent reads these instructions at session start (when the skill is loaded) and follows them deterministically throughout the session.

**Data flow:**

```
User Prompt -> [Agent with do-not-repeat skill loaded]
                  |
                  +-- Prompt counter incremented
                  |
                  +-- Is counter % 5 == 0? -- No --> Normal response, silent
                  |         |
                  |        Yes
                  |         |
                  |         v
                  |   Read recent_conversation.md
                  |   Review last 5 prompts for gaps
                  |         |
                  |   +-----+----------+
                  |   v                v
                  |   New gap?     Semantic match?
                  |   |                |
                  |   v                v
                  |   Append <=2    Intervention
                  |   entries       (replace response)
                  |   |
                  |   v
                  |   File >200 lines?
                  |     +-- Yes: trim 50 lines
                  |
                  +-- Normal response (if no intervention triggered)
```

**Storage layout:**

```
skills/do-not-repeat/
  SKILL.md                  # The skill instruction prompt (committed)
  recent_conversation.md    # Persistent gap log (created on first run)
```

**Key design decisions:**

1. **Prompt-based skill, not runtime code**: The skill is a Markdown document interpreted by the LLM. This avoids needing to write platform-specific file I/O code. The LLM already has filesystem access via its tooling.

2. **Single skill file**: No scripts, no references, no assets. The entire skill is self-contained in `SKILL.md`.

3. **Platform path resolution at runtime**: The SKILL.md includes explicit path tables and detection heuristics the LLM follows. The agent determines platform from environment signals and writes to the correct derived path.

4. **No installer changes**: The skill follows the exact same conventions as all other skills (frontmatter with `name` and `description`, valid hyphen-case name matching directory). The existing installer discovers and installs it automatically.

5. **Co-located log file**: `recent_conversation.md` lives next to `SKILL.md` in the installed skills directory. This avoids fragile per-platform path logic.

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition)

**File(s):** `skills/do-not-repeat/SKILL.md`
**Type:** New file

#### What it does
The complete skill definition. Contains YAML frontmatter for discovery/installation, plus the full algorithmic instructions the LLM agent follows at runtime.

#### Interface / API

Frontmatter:
```yaml
---
name: do-not-repeat
description: A silent persistent learning guardian that detects when the user repeats the same conceptual error and intervenes with calibrated questions to break the cycle. Use automatically — no user invocation needed.
---
```

Body sections:
1. **Identity / Persona** — Establishes the skill as a persistent learning guardian with narrow focus on detecting and breaking repeated errors. Silence is the default; intervention is rare and meaningful.
2. **Goal** — Break the cycle of repeated error before it becomes a permanent feature of the user's understanding.
3. **Algorithm** — Steps 0-4 (see below).
4. **Checklist** — Operational guardrails (platform detection first, semantic comparison, 2-entry cap, file trim, single intervention per check, question calibration).
5. **Things Not To Do** — Negative constraints (no one-off logging, no multiple interventions, no answers-in-questions, no unbounded growth, no non-pattern interruptions, no judgmental framing).
6. **Output Structure** — The exact intervention template with opening/closing `---` delimiters.
7. **Success Criteria** — Verifiable outcomes.
8. **Platform Paths** — Explicit table of where `recent_conversation.md` is placed for each environment.

#### Logic / Algorithm

**Step 0 — Initialization (first run only):**
1. Detect the platform and determine the correct file path for `recent_conversation.md` by checking for the skill's own directory. Platform-specific location table:
   - **Claude Code / CLI**: `<project>/.claude/skills/do-not-repeat/` (project scope) or `~/.claude/skills/do-not-repeat/` (user scope)
   - **OpenCode**: `~/.config/opencode/skill/do-not-repeat/` or `~/.config/opencode/skills/do-not-repeat/`
   - **Cursor**: `~/.cursor/skills/do-not-repeat/`
   - **Codex**: `~/.codex/skills/do-not-repeat/`
   - **Hermes**: `~/.hermes/skills/do-not-repeat/`
   - **Universal .agents**: `~/.agents/skills/do-not-repeat/`
   - **Claude Desktop macOS**: `~/Library/Application Support/Claude/skills/do-not-repeat/`
   - **Claude Desktop Windows**: `%APPDATA%\Claude\skills\do-not-repeat\`
   - **Claude Desktop Linux**: `~/.config/claude/skills/do-not-repeat/`
2. The simplest heuristic: `recent_conversation.md` goes in the **same directory** as this `SKILL.md` file itself. Use the path of this SKILL.md as the base.
3. If the target directory does not exist, create it.
4. Check if `recent_conversation.md` already exists there. If not, create it with header: `# Do-Not-Repeat Log`.
5. Initialization runs once and never again. If the file already exists, skip.

**Step 1 — Prompt counter tracking:**
- Maintain a count of user prompts within the current session.
- Increment by 1 for each user message received.
- Session-local only; resets to 0 when a new session begins.
- The counter does not persist to the file.

**Step 2 — Every 5th prompt: comparison check:**
When the prompt counter reaches a multiple of 5 (prompt 5, 10, 15, etc.):
1. Read the current contents of `recent_conversation.md`.
2. Review the last 5 user prompts from the context window.
3. Identify any instances where the user stated something factually incorrect, demonstrated a clear conceptual gap, or explained something in a way that reveals a mistaken underlying model.
4. For each candidate gap identified, check whether a semantically equivalent entry already exists in `recent_conversation.md`. This check is semantic, not string-based — the same underlying misconception expressed in different words counts as a match.
5. If the entry does NOT already exist: proceed to Step 3.
6. If the entry DOES already exist: proceed to Step 4.

**Step 3 — Add new entries (max 2):**
1. For each new gap identified that does not already exist in the file, add a bullet point entry.
2. Add no more than 2 new entries per check, even if more gaps were identified.
3. Prioritize the most significant gaps — those most likely to cause recurring errors — over minor ones.
4. Entry format: `- **[Topic label]**: [One sentence describing what the user got wrong or expressed poorly.] [One to two sentences explaining what the correct understanding is and why the user's version falls short.]`
5. Append new entries to the end of the file.
6. After appending, check total line count. If >200 lines, remove the first 50 lines of body content below the header (preserve `# Do-Not-Repeat Log`).

**Step 4 — Repeated error detected: intervene:**
1. When the comparison check reveals a semantic match to an existing entry, do not add a duplicate.
2. Instead, halt normal response generation.
3. Deliver an intervention in place of the standard response.
4. If multiple repeated errors are detected, intervene on only the most significant one.
5. After delivering, return to normal response behavior for subsequent prompts.

#### Edge Cases & Error Handling
- **First session, no file exists**: Step 0 creates the file with header only. Check proceeds with 0 existing entries.
- **File deleted between sessions**: Same as first session — create new empty file.
- **User prompt has no errors**: Normal. No entries added, no intervention. The check still runs and finds nothing.
- **User prompt is too short/trivial to assess**: Skip gap detection for that prompt. If no gaps in last 5, check passes silently.
- **Ambiguous semantic match**: Err toward treating as a match and intervening.
- **Multiple repeated errors detected in one check**: Only intervene on the most significant. Others will re-appear in future checks.
- **Platform cannot be detected**: Deliver a single one-time message stating the file path could not be resolved. This is the only exception to the silence rule.
- **File write fails (permissions, etc.)**: Fail silently. The check is best-effort.

### 6.2 recent_conversation.md (Tracking File)

**File:** `<platform-skills-dir>/do-not-repeat/recent_conversation.md`
**Type:** New file (created at runtime by the LLM, not committed to repo)

#### What it does
Persistent, bounded record of the user's known conceptual gaps. Acts as the skill's "memory" across sessions.

#### Format

```markdown
# Do-Not-Repeat Log

- **[Closures capture references]**: User treated closures as capturing values at creation time rather than references to variables. In JavaScript, closures capture the variable binding, not the snapshot of its value — the value at invocation time is used, not at definition time.
- **[async/await error propagation]**: User assumed async functions automatically catch and wrap errors, believing try/catch inside async is optional. Unhandled promise rejections in async functions propagate up and will crash the process if not caught — async/await does not add implicit error boundaries.
```

#### Management
- Max 200 total lines
- Trim: remove first 50 body lines when threshold exceeded
- Header line `# Do-Not-Repeat Log` is never removed
- Entries are appended to end (never inserted or reordered)

---

## 7. Data Model Changes

N/A — No database or schema changes. The only data artifact is the Markdown file described in Section 6.2.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. This is a prompt-based skill with no server component.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/do-not-repeat/SKILL.md` | Core skill definition — the entire implementation |
| CREATE | `docs/design/do-not-repeat.md` | This design document |

**Total: 2 files created (in repo), 0 modified, 0 deleted.**

Note: `recent_conversation.md` is created at runtime by the skill, not committed. Optionally, an empty placeholder with just the header could be committed to `skills/do-not-repeat/recent_conversation.md` as documentation of intent.

---

## 10. Testing Plan

### Unit Tests
N/A — There is no executable code to unit test. The skill is a Markdown prompt.

### Integration Tests
N/A — The skill operates within the LLM's session context.

### Validation Tests
- **`npm test`** must pass — the `validate.js` script checks that:
  - `skills/do-not-repeat/SKILL.md` exists
  - Frontmatter has valid `name: do-not-repeat` matching the directory
  - Frontmatter has non-empty `description`
  - Body is non-empty
  - Skill name matches the `^[a-z0-9]+(-[a-z0-9]+)*$` regex

### Manual / QA Test Cases

1. **First-run initialization**: Given a fresh environment with no `recent_conversation.md`, when the skill is first loaded, then the LLM creates the file at the correct path with only the header line.
2. **Silent pass**: Given a user submits 5 prompts with no conceptual errors, when the 5th prompt is processed, then the skill adds 0 entries and produces no intervention.
3. **New gap logging**: Given a user submits 5 prompts containing 2 distinct conceptual gaps never seen before, when the 5th prompt is processed, then the skill appends 2 bullet entries to `recent_conversation.md`.
4. **Intervention on repeat**: Given a user makes the same gap that already exists in the file, when the matching check runs, then the normal response is replaced with the intervention template.
5. **Max 2 new entries**: Given 3 new gaps are identified in one check, when entries are added, then only the 2 most significant are appended.
6. **File trim**: Given `recent_conversation.md` exceeds 200 lines after adding entries, when the check runs, then the first 50 body lines are removed.
7. **Single intervention per check**: Given 2 distinct repeated errors are detected simultaneously, when the check runs, then only 1 intervention is delivered.
8. **Semantic matching**: Given the file contains an entry about reference vs value equality, when the user makes the same conceptual error but phrases it differently, then the agent detects a semantic match and intervenes.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| None | N/A | The skill has zero external dependencies | None |

The skill operates entirely through the LLM agent's native capabilities: reading files, writing files, and comparing text. No npm packages, APIs, databases, or services are involved.

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the agent selects it based on its description. Since the description says "Use automatically — no user invocation needed", the agent loads it by default in all sessions.
- **Breaking change**: No. This is a new, additive skill. No existing code is modified.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Rollback procedure**: Delete `skills/do-not-repeat/` directory and re-run the installer. No data migration needed.

---

## 13. Open Questions

- [ ] Should the repo include an empty `recent_conversation.md` placeholder (header only) to document the co-location pattern, or should it be purely runtime-created? **Recommendation**: Commit empty placeholder.
- [ ] Should the `SKILL.md` frontmatter description include explicit trigger phrasing (e.g., "Use this skill...") or be purely passive? The user indicated "runs in the background."
- [ ] Prompt counter persistence: Is session-local sufficient? In very long sessions, the counter resets naturally, which is acceptable since gap detection restarts fresh.

---

## 14. Alternatives Considered

### Alternative 1: Executable JavaScript/node script
- What: Implement the algorithm as a JS script in `skills/do-not-repeat/scripts/index.js`.
- Why rejected: Adds complexity, requires Node.js runtime assumptions, and ties the implementation to one ecosystem. A prompt-only skill is universally portable.

### Alternative 2: Hardcoded platform-specific paths
- What: Maintain a lookup table of absolute paths for each platform.
- Why rejected: Fragile, requires constant updates. Co-locating with SKILL.md is simpler and works everywhere.

### Alternative 3: Database-backed storage (SQLite, JSON)
- What: Store gap entries in a structured format with timestamps and counts.
- Why rejected: Over-engineered for a simple log. The 200-line Markdown file is sufficient, human-readable, and requires no parsing libraries.

### Alternative 4: Intervene on every mistake, not just repeats
- What: Deliver an intervention on the first occurrence of any gap.
- Why rejected: Violates the "silent by default" principle. The skill's value is in detecting *patterns*.

### Alternative 5: Persist prompt counter to file
- What: Write the prompt counter to recent_conversation.md on every prompt.
- Why rejected: Adds unnecessary I/O. The counter naturally resets across sessions, which is acceptable behavior.

---

END OF DESIGN DOC
