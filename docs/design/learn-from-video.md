# Design Doc: learn-from-video Skill

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-21
**Last Updated:** 2026-05-21

---

## 1. Overview

Add a version 3 Vidbyte learning skill named `learn-from-video` that turns a YouTube video into an active learning session. The skill will parse a YouTube URL, collect metadata and transcript context where available, create a segmented viewing plan grounded in Brame (2016), use available browser automation to play and pause each segment, require the user to pass active-learning checkpoints before continuing, and generate a local learning handoff document with a `vidbyte retain` command at completion.

---

## 2. Goals & Non-Goals

### Goals

- Create `skills/learn-from-video/SKILL.md` as the canonical prompt skill definition.
- Include helper scripts and references under `skills/learn-from-video/scripts/` and `skills/learn-from-video/references/`.
- Add `learn-from-video` to the root `skills-manifest.json` learning array.
- Add `learn-from-video` to version `3` in `lib/skill-versions.json`.
- Implement browser-tool detection instructions as a hard gate unless the user passes `--no-browser`.
- Support common YouTube URL formats, raw video IDs, `--segment`, `--range`, `--depth deep`, `--depth light`, and `--no-browser`.
- Define transcript extraction priority: browser transcript scrape, `yt-dlp`, optional `youtube-transcript-api`, then title-only fallback.
- Define Brame-grounded segment planning, guiding questions, active checkpoint gates, response evaluation, and handoff generation.
- Preserve repo conventions: flat skill source under `skills/`, lowercase hyphen-case names, frontmatter with `name` and `description`, optional helper folders copied by the installer, and no new package dependencies.

### Non-Goals

- Add a new backend endpoint or Vidbyte CLI command.
- Change installer behavior, platform target behavior, or validation schema.
- Implement a standalone YouTube downloader or media player.
- Guarantee transcript access for all YouTube videos.
- Guarantee browser control on rule-file-only platforms that do not expose browser automation tools.
- Add automated browser integration tests for YouTube playback.
- Modify generated package copies under `packages/learning/` directly; those are updated by the existing build process.

---

## 3. Background & Context

The repo is a portable skills package. Runtime source skills live under `skills/<name>/SKILL.md`, and optional `scripts/`, `references/`, and `assets/` directories are copied by the installer. Validation in `scripts/validate.js` checks each skill directory has `SKILL.md`, matching hyphen-case frontmatter `name`, non-empty `description`, and non-empty body.

Skill category membership is stored in `skills-manifest.json` as two arrays: `learning` and `reasoning`. Version membership is stored separately in `lib/skill-versions.json`. Version 3 currently exists as an empty array. This means the requested object-style manifest entry cannot be added as written without changing repo schema; instead, the implementation should add the skill name to the existing learning array and add it to version `3`.

The requested skill is based on Cynthia J. Brame's 2016 paper, "Effective Educational Videos: Principles and Guidelines for Maximizing Student Learning from Video Content." The skill applies the paper's practical pillars: reduce cognitive load through segmenting and weeding, increase engagement through short focused sections and learner control, and enforce active learning through guiding questions and interactive checkpoints.

---

## 4. Requirements

### Functional Requirements

1. The repo SHALL contain `skills/learn-from-video/SKILL.md` with frontmatter `name: learn-from-video` and a non-empty description.
2. The skill SHALL activate for `/learn-from-video <youtube-url>` and document supported optional flags: `--segment <N>`, `--range <start-end>`, `--no-browser`, `--depth deep`, and `--depth light`.
3. The skill SHALL run Phase 0 browser-tool detection before browser-dependent work unless `--no-browser` is present.
4. The browser gate SHALL treat tools containing `browser`, `playwright`, `puppeteer`, or `navigate`, and known browser MCP/tool names, as usable browser automation.
5. If no browser tool is available and `--no-browser` is not present, the skill SHALL display a no-browser message with install options for Playwright MCP, Browser Use, Browserbase MCP, and Puppeteer MCP, then stop unless the user asks for installation.
6. The skill SHALL parse common YouTube URLs, `youtu.be` URLs, timestamped URLs, and raw 11-character video IDs.
7. The skill SHALL extract or infer video ID, title, start timestamp, and duration when possible.
8. Transcript extraction SHALL follow priority order: YouTube built-in transcript via browser page scrape, optional `yt-dlp`, optional Python `youtube-transcript-api`, then title/visible-description fallback.
9. Transcript planning data SHALL use a list of objects containing `start`, `duration`, and `text`.
10. The skill SHALL create an internal session plan with video title, video ID, total duration, guiding questions, and segment objects.
11. Segments SHALL target 4-8 minutes, prefer topic transitions, avoid splitting mid-explanation, and cap at 8 segments.
12. If a video is longer than 60 minutes and no range is supplied, the skill SHALL ask whether the user wants the full video or a range before planning the whole session.
13. Each segment SHALL include 1 question by default, 2 questions for `--depth deep`, and simpler 1-question checks for `--depth light`.
14. Questions SHALL use only `explain`, `apply`, `decide`, and `predict` types.
15. Questions SHALL avoid yes/no and recall-only formats.
16. At least one question in a full session SHALL be `apply` or `decide`.
17. Before opening the browser, the skill SHALL present guiding questions and wait for the user to type `go`.
18. In browser mode, the skill SHALL open or seek the video to each segment start, allow playback, pause at the segment boundary, and present the checkpoint.
19. The skill SHALL not advance past a checkpoint until the user produces a genuine `PASS`.
20. `PARTIAL` and `MISS` verdicts SHALL provide targeted feedback or hints and require another answer.
21. In `--no-browser` mode, the skill SHALL still perform transcript planning when possible and present a self-paced list of segments and questions, but it SHALL clearly state that automatic video pause/seek control is unavailable.
22. After all checkpoints pass, the skill SHALL generate a Markdown handoff document in the current working directory.
23. The handoff SHALL include summary, key concepts, questions answered, user's passing answers, revisit notes, next steps, and a ready-to-run `vidbyte retain` command.
24. The handoff SHALL include the user's own final passing checkpoint answers, lightly edited only for clarity.
25. `learn-from-video` SHALL be included in `skills-manifest.json` under `learning`.
26. `learn-from-video` SHALL be included in `lib/skill-versions.json` under key `"3"`.

### Non-Functional Requirements

- **Performance:** Transcript helper scripts should avoid downloading video media. They should fetch metadata/transcript only and return quickly for typical videos.
- **Scalability:** Long videos are bounded by the 8-segment cap unless the user explicitly chooses a range or full long session.
- **Security:** The skill must not request YouTube credentials, bypass access controls, store secrets, construct Vidbyte backend headers, or call Vidbyte endpoints directly. The handoff may include a `vidbyte retain` command, relying on existing CLI security boundaries.
- **Observability:** The skill should tell the user what phase it is in, whether transcript fallback was used, and what segment is playing.
- **Reliability / error tolerance:** Missing browser tools, missing transcripts, missing optional tools, private/deleted videos, and unavailable duration metadata should degrade to clear fallback behavior.

---

## 5. High-Level Design

The change adds a prompt skill package under `skills/learn-from-video/`. The main behavior lives in `SKILL.md`; helper scripts and reference files are included as support material for harnesses that can run local scripts or for models that need a concise source of truth. No installer or CLI architecture changes are needed because this repo already auto-discovers skill directories, validates skill metadata, copies optional helper folders, and filters installable skills through the category and version manifests.

The session flow is prompt-led. The model parses `$ARGUMENTS`, detects browser capability from the current harness tools, extracts transcript/metadata using the best available method, plans topic segments, presents guiding questions, then loops through browser playback and checkpoint evaluation. The browser helper script documents reusable video-control snippets, but actual browser interaction is done through whichever browser tool the harness exposes.

```text
/learn-from-video <url>
  |
  v
[SKILL.md prompt workflow]
  |-- Phase 0: browser tool gate
  |-- Phase 1: parse URL + metadata
  |-- Phase 2: transcript extraction
  |-- Phase 3: segment plan + questions
  |-- Phase 4: guiding questions, wait for "go"
  |-- Phase 5: browser playback + checkpoint gate loop
  `-- Phase 6: local handoff document + retain command

Repo integration:
skills/learn-from-video/* -> installer auto-discovers
skills-manifest.json      -> learning category
lib/skill-versions.json   -> version 3
```

Key decisions:

- Keep this as a prompt skill plus optional helpers, not a CLI-backed backend submission. The user requested a browser-controlled learning session and local handoff, while existing `retain` already covers durable Vidbyte submission.
- Add only the skill name to manifests because the repo's current manifest schema is array-based.
- Use optional transcript tooling rather than adding dependencies to `package.json`; `yt-dlp` and `youtube-transcript-api` may be present or installed by the user/harness, but the skill must work without them in fallback mode.

---

## 6. Detailed Design

### 6.1 `skills/learn-from-video/SKILL.md`

**File(s):** `skills/learn-from-video/SKILL.md`
**Type:** New file

#### What it does

Defines the full `/learn-from-video` workflow: argument parsing, browser gate, transcript extraction, segment planning, active checkpoint loop, answer evaluation, and handoff generation.

#### Interface / API

```markdown
---
name: learn-from-video
description: >
  Use this skill when the user invokes /learn-from-video with a YouTube URL
  and wants a browser-controlled active learning session with transcript-based
  segment planning, checkpoint questions, and a final learning handoff.
version: 1.0.0
arguments: true
---
```

Supported invocation forms:

```text
/learn-from-video <youtube-url>
/learn-from-video <youtube-url> --segment <N>
/learn-from-video <youtube-url> --range 10:00-25:00
/learn-from-video <youtube-url> --no-browser
/learn-from-video <youtube-url> --depth deep
/learn-from-video <youtube-url> --depth light
```

Internal session plan shape:

```json
{
  "video_title": "Video title",
  "video_id": "VIDEO_ID",
  "total_duration_seconds": 1420,
  "guiding_questions": [
    "What problem is this video trying to help you solve?",
    "Where would you apply the central idea outside this video?"
  ],
  "segments": [
    {
      "segment_number": 1,
      "start_seconds": 0,
      "end_seconds": 310,
      "topic": "Opening concept",
      "pause_at_seconds": 310,
      "questions": [
        {
          "type": "explain",
          "text": "In your own words, what mechanism did this section introduce?"
        }
      ]
    }
  ]
}
```

#### Logic / Algorithm

1. Parse `$ARGUMENTS` into URL/video ID and flags.
2. If `--no-browser` is absent, inspect available harness tools for browser automation names.
3. If no browser tool is found, print the no-browser installation message and stop.
4. Parse YouTube ID and optional start timestamp.
5. Fetch metadata from the browser page, YouTube oEmbed, visible page metadata, or fallback to URL/video ID.
6. Extract transcript using the documented priority order.
7. If transcript is unavailable, enter title-only planning mode and warn that coverage is less precise.
8. Build a bounded session plan using Brame-grounded segmenting rules.
9. Present the guiding question intro and wait for `go`.
10. For each segment, seek/play to the segment start, pause at the checkpoint, and ask the generated question.
11. Evaluate each answer against the transcript-derived correct understanding.
12. Record attempt count, verdicts, and final passing answer.
13. After all segments pass, write the handoff Markdown file.

#### Edge Cases & Error Handling

- Empty invocation prints usage.
- Invalid URL/video ID asks the user for a valid YouTube URL or raw ID.
- Timestamped URL starts at that timestamp and adjusts segment planning accordingly.
- `--segment <N>` starts at the selected planned segment and still uses prior transcript context for evaluation where available.
- `--range` restricts transcript planning and playback to the requested time window.
- Long videos over 60 minutes require user range/full-video confirmation before planning all content.
- No browser tool triggers hard gate unless `--no-browser` is present.
- Browser page blocked/private/deleted produces a clear failure or fallback if metadata/transcript remains partially available.
- Transcript unavailable triggers title-only mode with lower-confidence questions.
- User answer too vague gets `MISS` or `PARTIAL`; the skill does not advance.
- Handoff filename collisions use a timestamped filename, for example `learning-handoff-learn-from-video-2026-05-21.md`.

---

### 6.2 `skills/learn-from-video/scripts/detect-browser-tools.js`

**File(s):** `skills/learn-from-video/scripts/detect-browser-tools.js`
**Type:** New file

#### What it does

Provides a small helper for classifying a list of tool names as browser-capable. This script cannot directly inspect model-tool availability on its own; it is a reusable helper for harnesses or future tests that can pass a tool-name list.

#### Interface / API

```javascript
export function detectBrowserTools(toolNames = []) {
  return {
    available: Boolean,
    matches: ["tool_name"]
  };
}
```

Optional CLI usage:

```bash
node skills/learn-from-video/scripts/detect-browser-tools.js browser_navigate playwright
```

#### Logic / Algorithm

1. Normalize each provided tool/server name to lowercase.
2. Match substrings: `browser`, `playwright`, `puppeteer`, `navigate`, `browserbase`.
3. Match known names: `@playwright/mcp`, `browser-use`, `browserbase`, `computer`.
4. Return availability and matches.

#### Edge Cases & Error Handling

- Empty input returns `available: false`.
- Non-string values are ignored.
- The script should avoid throwing for malformed input.

---

### 6.3 `skills/learn-from-video/scripts/extract-transcript.py`

**File(s):** `skills/learn-from-video/scripts/extract-transcript.py`
**Type:** New file

#### What it does

Attempts non-browser transcript extraction for Methods B and C: `yt-dlp` subtitles first, then optional `youtube-transcript-api`. Browser page scraping remains prompt/tool-driven because browser automation APIs vary by harness.

#### Interface / API

```bash
python skills/learn-from-video/scripts/extract-transcript.py <youtube-url-or-id>
python skills/learn-from-video/scripts/extract-transcript.py <youtube-url-or-id> --json
```

Output shape:

```json
[
  { "start": 0.0, "duration": 8.0, "text": "Welcome..." }
]
```

#### Logic / Algorithm

1. Parse YouTube video ID from common URL forms or raw ID.
2. Check for `yt-dlp` with `shutil.which`.
3. If present, run `yt-dlp --write-subs --write-auto-subs --skip-download --sub-langs en --sub-format vtt`.
4. Parse generated VTT into transcript objects.
5. If `yt-dlp` is unavailable or fails, try importing `youtube_transcript_api`.
6. If available, call its transcript fetch API and normalize to the transcript object shape.
7. Print JSON transcript on success.
8. Print a clear error and exit non-zero on failure.

#### Edge Cases & Error Handling

- Missing Python package prints an install hint instead of failing cryptically.
- Unavailable captions produce a clear no-transcript message.
- Temporary files are created in a temp directory and removed automatically.
- The script does not download video media.

---

### 6.4 `skills/learn-from-video/scripts/control-video.js`

**File(s):** `skills/learn-from-video/scripts/control-video.js`
**Type:** New file

#### What it does

Documents browser video control helper snippets for harnesses that can evaluate JavaScript in the page. It exports small functions as text/logic references for seeking, reading current time, pausing, and checking whether the video reached a target timestamp.

#### Interface / API

```javascript
export function seekSnippet(seconds) { return "..." }
export function pauseSnippet() { return "..." }
export function currentTimeSnippet() { return "..." }
export function reachedTimeSnippet(seconds) { return "..." }
```

#### Logic / Algorithm

1. Use `document.querySelector('video')`.
2. Seek by assigning `video.currentTime`.
3. Play by calling `video.play()` when needed.
4. Pause by calling `video.pause()`.
5. Read current time from `video.currentTime`.

#### Edge Cases & Error Handling

- Snippets check for a missing `<video>` element and return/throw a concise error.
- The skill still adapts to the concrete browser tool syntax exposed by the harness.

---

### 6.5 `skills/learn-from-video/references/research-basis.md`

**File(s):** `skills/learn-from-video/references/research-basis.md`
**Type:** New file

#### What it does

Summarizes Brame (2016) in contributor-facing language and maps the paper's principles to this skill's phases.

#### Interface / API

Markdown reference sections:

```markdown
# Research Basis
## Source
## Pillar 1: Cognitive Load Management
## Pillar 2: Student Engagement
## Pillar 3: Active Learning
## How This Skill Applies the Research
```

#### Logic / Algorithm

N/A - reference document.

#### Edge Cases & Error Handling

N/A - reference document.

---

### 6.6 `skills/learn-from-video/references/question-type-guide.md`

**File(s):** `skills/learn-from-video/references/question-type-guide.md`
**Type:** New file

#### What it does

Provides examples and quality rules for `explain`, `apply`, `decide`, and `predict` checkpoint questions across technical, product, design, academic, and general educational videos.

#### Interface / API

Markdown reference sections:

```markdown
# Question Type Guide
## Explain
## Apply
## Decide
## Predict
## Banned Patterns
## Depth Modes
```

#### Logic / Algorithm

N/A - reference document.

#### Edge Cases & Error Handling

N/A - reference document.

---

### 6.7 `skills-manifest.json`

**File(s):** `skills-manifest.json`
**Type:** Modified

#### What it does

Adds `learn-from-video` to the `learning` array so category installers and package builds classify it as a learning skill.

#### Interface / API

```json
{
  "learning": [
    "...",
    "learn-from-video",
    "..."
  ]
}
```

#### Logic / Algorithm

Insert the skill name into the existing learning array, preferably alphabetically near other learning prompt skills if the current local order allows.

#### Edge Cases & Error Handling

- Validation fails if the manifest references the skill before `skills/learn-from-video/SKILL.md` exists.
- Duplicate entries fail validation.

---

### 6.8 `lib/skill-versions.json`

**File(s):** `lib/skill-versions.json`
**Type:** Modified

#### What it does

Adds `learn-from-video` to version `3` so users installing `--version 3` receive this skill.

#### Interface / API

```json
{
  "3": ["learn-from-video"]
}
```

#### Logic / Algorithm

Append or insert `learn-from-video` in the version `3` array.

#### Edge Cases & Error Handling

- `scripts/validate.js` verifies every versioned skill exists on disk.
- If additional version 3 skills are added later, this array can grow without changing installer code.

---

## 7. Data Model Changes

### 7.1 Skill Category Manifest

**Change type:** Modified

```json
{
  "learning": ["learn-from-video"]
}
```

**Migration strategy:**

- Forward migration: add `learn-from-video` to the existing `learning` array after creating the skill directory.
- Rollback plan: remove `learn-from-video` from the `learning` array.

### 7.2 Version Manifest

**Change type:** Modified

```json
{
  "3": ["learn-from-video"]
}
```

**Migration strategy:**

- Forward migration: add `learn-from-video` to `lib/skill-versions.json` key `"3"`.
- Rollback plan: remove `learn-from-video` from key `"3"`.

### 7.3 Internal Session Plan

**Change type:** New prompt-local transient data

```json
{
  "video_title": "string",
  "video_id": "string",
  "total_duration_seconds": "number | null",
  "guiding_questions": ["string"],
  "segments": [
    {
      "segment_number": "number",
      "start_seconds": "number",
      "end_seconds": "number",
      "topic": "string",
      "pause_at_seconds": "number",
      "questions": [
        { "type": "explain | apply | decide | predict", "text": "string" }
      ]
    }
  ]
}
```

**Migration strategy:**

- N/A - session-local prompt data only; not persisted as repo state.

---

## 8. API Changes

No HTTP or Python CLI API endpoints are added or modified.

### 8.1 `/learn-from-video` Skill Invocation

**Change type:** New skill invocation

**Request:**

```text
/learn-from-video <youtube-url-or-video-id> [--segment N] [--range start-end] [--no-browser] [--depth deep|light]
```

**Response:**

```text
Interactive prompt flow:
1. Browser/tool gate or no-browser fallback
2. Guiding question intro
3. Segment playback/checkpoint loop
4. Final handoff document path
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| N/A | No browser tool detected and `--no-browser` not provided |
| N/A | Invalid YouTube URL or video ID |
| N/A | Transcript unavailable, degraded to title-only mode |
| N/A | Browser cannot load or control video |
| N/A | User answer is partial or incorrect, checkpoint repeats |

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/learn-from-video.md` | Design document for the new skill |
| CREATE | `skills/learn-from-video/SKILL.md` | Canonical prompt skill definition and full workflow |
| CREATE | `skills/learn-from-video/scripts/detect-browser-tools.js` | Helper for browser tool-name classification |
| CREATE | `skills/learn-from-video/scripts/extract-transcript.py` | Optional non-browser transcript extraction helper |
| CREATE | `skills/learn-from-video/scripts/control-video.js` | Browser video-control snippet helper |
| CREATE | `skills/learn-from-video/references/research-basis.md` | Brame (2016) summary and skill mapping |
| CREATE | `skills/learn-from-video/references/question-type-guide.md` | Active-learning question examples and quality rules |
| MODIFY | `skills-manifest.json` | Add `learn-from-video` to learning skills |
| MODIFY | `lib/skill-versions.json` | Add `learn-from-video` to version 3 |

Total after implementation: 7 files created, 2 files modified, 0 files deleted, plus this design doc already created in Phase 2.

---

## 10. Testing Plan

### Unit Tests

This repository does not currently use a unit test framework for skill logic. The implementation should still verify helper scripts directly:

- `node skills/learn-from-video/scripts/detect-browser-tools.js browser_navigate` should report browser availability.
- `node skills/learn-from-video/scripts/detect-browser-tools.js shell_command` should report no browser availability.
- `node --check skills/learn-from-video/scripts/detect-browser-tools.js` should pass.
- `node --check skills/learn-from-video/scripts/control-video.js` should pass.
- `python skills/learn-from-video/scripts/extract-transcript.py --help` should print usage and exit successfully if a help flag is implemented.

### Integration Tests

- `npm run validate` should pass:
  - `skills/learn-from-video/SKILL.md` metadata is valid.
  - `skills-manifest.json` references an existing skill directory.
  - `lib/skill-versions.json` version `3` references an existing skill directory.
- `npm test` should pass:
  - Validation.
  - Installer smoke test.
  - Python CLI smoke test.
- `node bin/learning.js --version 3 --dry-run --platform codex` should include `learn-from-video`.
- `node bin/install.js --version 3 --dry-run --platform codex` should include `learn-from-video`.
- `node bin/install.js --version all --dry-run --skill learn-from-video --platform codex` should install/select only `learn-from-video`.

### Manual / QA Test Cases

1. Given `/learn-from-video` with no URL, the skill prints usage and does not proceed.
2. Given `/learn-from-video dQw4w9WgXcQ --no-browser`, the skill parses the raw ID and runs transcript/title planning without browser control.
3. Given a standard YouTube watch URL, the skill extracts the video ID correctly.
4. Given a `youtu.be` URL, the skill extracts the video ID correctly.
5. Given a timestamped URL, the first segment starts at the timestamp or range-adjusted start.
6. Given no browser tool and no `--no-browser`, the no-browser gate message appears before metadata/transcript work.
7. Given an available browser tool, the skill presents guiding questions before opening the video.
8. Given a transcript-bearing video, segments target 4-8 minutes and do not exceed 8 segments.
9. Given a video longer than 60 minutes and no range, the skill asks whether to cover the full video or a range.
10. Given an insufficient checkpoint answer, the skill returns `PARTIAL` or `MISS` and does not advance.
11. Given a passing checkpoint answer, the skill records the answer and advances.
12. Given completion of all checkpoints, the skill writes a Markdown handoff with the user's answers and a `vidbyte retain` command.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| YouTube | Video page, oEmbed endpoint, transcript UI | Metadata, playback, transcript source | Videos may be private, captions may be unavailable, page UI may change |
| Browser automation tool | Playwright MCP, Browser Use, Browserbase MCP, Puppeteer MCP, or harness browser/computer tool | Open, seek, monitor, and pause video | Tool availability varies by harness |
| `yt-dlp` | Optional local executable | Subtitle extraction fallback | Not installed by default; external tool behavior may change |
| `youtube-transcript-api` | Optional Python package | Transcript extraction fallback | Not installed by default; API support may change |
| Vidbyte CLI | Existing `vidbyte retain` command | Handoff includes ready-to-run retention command | Command remains user-run or skill-run through existing CLI security boundary |

---

## 12. Rollout & Deployment

- Feature flags: N/A.
- Breaking change: No. The skill is additive and only included in version 3 or explicit installs.
- Deployment order:
  1. Create skill files and references.
  2. Add manifest entries.
  3. Run validation and tests.
  4. If publishing packages, run `node scripts/build-packages.js` as part of the existing package build workflow.
- Rollback procedure:
  1. Remove `learn-from-video` from `skills-manifest.json`.
  2. Remove `learn-from-video` from `lib/skill-versions.json`.
  3. Delete `skills/learn-from-video/`.
  4. Re-run `npm test`.

---

## 13. Open Questions

- [ ] Should `learn-from-video` be the only version 3 skill, or should version 3 include earlier core learning skills as well?
- [ ] Should the no-browser install flow only provide instructions, or should the skill actually run installer commands when the user says yes?
- [ ] Should title-only mode be allowed by default after transcript failure, or should the skill ask for confirmation because coverage is lower quality?
- [ ] Should the final `vidbyte retain` command be generated only, or should the skill also offer to execute it after writing the handoff?
- [ ] Should the helper scripts remain advisory only, or should the skill require running `extract-transcript.py` before browser transcript scraping when Python is available?

---

## 14. Alternatives Considered

### Alternative 1: Add a New CLI Command for Video Learning

- What: Implement `vidbyte learn-from-video` in the Python CLI and store session artifacts in the Vidbyte backend.
- Why rejected: The requested behavior is primarily browser-controlled interaction and local handoff generation. Existing `retain` already handles durable learning exercises. A backend integration would expand scope substantially.

### Alternative 2: Change `skills-manifest.json` to Object Entries

- What: Replace array entries with rich objects containing name, description, tags, requires, and related skills.
- Why rejected: The current installer, package builder, and validator expect arrays of skill names. Changing the schema would be a broad migration unrelated to adding this one skill.

### Alternative 3: Make `--no-browser` the Default

- What: Avoid browser-tool gating and provide only transcript-based questions.
- Why rejected: The core value of this skill is active checkpoint gating during actual video viewing. Defaulting to no-browser mode would remove the strongest behavior.

### Alternative 4: Rely Only on YouTube Transcript API

- What: Skip browser transcript scraping and optional `yt-dlp`, using only `youtube-transcript-api`.
- Why rejected: The repo has no Python dependencies, YouTube transcript availability varies, and the user explicitly requested browser transcript scraping as Method A.

### Alternative 5: Implement Browser Control as a Full Node Script

- What: Add a Node Playwright script that opens YouTube and controls playback.
- Why rejected: The repo has no Playwright dependency and the skill is intended to use harness-provided browser tools. Adding Playwright to `package.json` would increase installation weight and still not guarantee compatibility with MCP/browser-tool environments.
