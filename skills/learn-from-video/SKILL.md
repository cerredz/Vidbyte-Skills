---
name: learn-from-video
description: >
  Use this skill when the user invokes /learn-from-video with a YouTube URL
  and wants a browser-controlled active learning session with transcript-based
  segment planning, checkpoint questions, and a final learning handoff.
version: 1.0.0
arguments: true
---

# /learn-from-video

You are running the `learn-from-video` skill.

`$ARGUMENTS` contains a YouTube URL or video ID and optional flags.

## Purpose

Turn passive video watching into active learning. The skill is grounded in Cynthia J. Brame's 2016 paper "Effective Educational Videos: Principles and Guidelines for Maximizing Student Learning from Video Content." Apply three ideas throughout:

1. Manage cognitive load: segment the video, remove distraction, and focus attention.
2. Preserve engagement: keep segments short and topic-complete.
3. Enforce active learning: the learner must explain, apply, decide, or predict before moving on.

The central rule: do not let the user advance past a checkpoint without a genuine pass.

## Supported Invocations

```text
/learn-from-video <youtube-url>
/learn-from-video <youtube-url> --segment <N>
/learn-from-video <youtube-url> --range 10:00-25:00
/learn-from-video <youtube-url> --no-browser
/learn-from-video <youtube-url> --depth deep
/learn-from-video <youtube-url> --depth light
```

Accepted video inputs:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID&t=90s`
- `https://youtu.be/VIDEO_ID`
- Raw 11-character video ID

If no usable input is provided, respond:

```text
Usage: /learn-from-video <youtube-url-or-video-id> [--segment N] [--range 10:00-25:00] [--no-browser] [--depth light|deep]
```

## Phase 0 - Browser Tool Detection

Run this before browser-dependent work unless `--no-browser` is present.

Check the current harness tools for browser automation. Treat the following as browser-capable:

- Playwright MCP or a tool/server containing `playwright`
- Puppeteer MCP or a tool/server containing `puppeteer`
- Browser Use or a tool/server containing `browser-use`
- Browserbase MCP or a tool/server containing `browserbase`
- Claude Code computer/browser capability
- Any tool whose name contains `browser`, `navigate`, `playwright`, or `puppeteer`

You may use `scripts/detect-browser-tools.js` as a helper if the harness exposes a list of tool names. If the tool list is only visible in the model context, inspect it directly.

If no browser tool is found and `--no-browser` is absent, display this message and stop:

```text
------------------------------------------------------------
    /learn-from-video
------------------------------------------------------------

  No browser tool detected.

  This skill needs to open and control a browser to pause
  the video and run active learning checkpoints. Without it,
  the full skill cannot function.

  Install one of these:

  Option 1 - Playwright MCP (recommended)
  https://github.com/microsoft/playwright-mcp
  Install: npx @playwright/mcp@latest

  Option 2 - Browser Use
  https://github.com/browser-use/browser-use
  Install: pip install browser-use

  Option 3 - Browserbase MCP
  https://docs.browserbase.com/mcp
  Install: npx @browserbasehq/mcp

  Option 4 - Puppeteer MCP
  https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer
  Install: npx @modelcontextprotocol/server-puppeteer

  Would you like me to install one of these for you?
  Say "yes, install Playwright" or name the option you prefer.

------------------------------------------------------------
```

If the user says yes, run the chosen installer command if tool execution is allowed in the harness, then re-check availability. If installation is not allowed, give the exact command and stop.

If `--no-browser` is present, continue in transcript-only mode. State clearly that automatic seek, play, and pause will not be available.

## Phase 1 - Parse URL and Metadata

Parse `$ARGUMENTS` into:

- `video_id`
- `original_url`
- `start_seconds`
- `range_start_seconds`
- `range_end_seconds`
- `segment_number`
- `depth`
- `browser_mode`

Respect timestamped URLs as the start point unless `--range` gives a narrower explicit start.

Get metadata using the best available path:

1. Browser page metadata from YouTube.
2. YouTube oEmbed endpoint if network access is available.
3. Visible page title/description.
4. Fallback to `YouTube video VIDEO_ID`.

Try to infer duration from the page or transcript. If duration is unavailable, plan from transcript timestamps. If both duration and transcript are unavailable, use title-only mode.

## Phase 2 - Transcript Extraction

The transcript is the planning foundation. Extract timestamped transcript objects in this shape:

```json
[
  { "start": 0, "duration": 8, "text": "Welcome to this video..." }
]
```

Use this priority order:

1. Browser transcript scrape:
   - Navigate to the video page.
   - Open the more-options menu if needed.
   - Select "Show transcript" when available.
   - Scrape visible timestamped transcript rows.
2. `yt-dlp` helper:
   - Run `python skills/learn-from-video/scripts/extract-transcript.py <url>`.
   - This helper tries `yt-dlp` without downloading the video media.
3. Python transcript API:
   - The helper also tries `youtube-transcript-api` if installed.
4. Title-only fallback:
   - Use title and any visible description or headings.
   - Tell the user:

```text
No transcript found. I will generate questions from the video title and visible context. Coverage may be less precise.
```

Do not invent transcript quotes. If exact transcript text is unavailable, label the plan as lower-confidence.

## Phase 3 - Segment Planning and Question Generation

Create a private session plan before opening or playing the video.

Session plan:

```json
{
  "video_title": "Video title",
  "video_id": "VIDEO_ID",
  "total_duration_seconds": 1420,
  "guiding_questions": [
    "What problem does this video solve?",
    "Where could you apply the main idea?"
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

Segment rules:

- Target 4-8 minutes per segment.
- Prefer topic transitions over fixed time boundaries.
- Never split mid-explanation when the transcript shows the thought continues.
- Maximum 8 segments.
- If the video is longer than 60 minutes and no `--range` was supplied, ask whether the user wants the full video or a specific range before planning all content.
- For `--segment N`, still plan the whole video or range when possible, then start the viewing loop at segment N.
- For `--range`, plan only the transcript entries in that time window.

Question rules:

- Use only `explain`, `apply`, `decide`, and `predict`.
- Never ask yes/no questions.
- Never ask recall-only questions.
- The question must test understanding, transfer, choice, or forecast.
- At least one question per full session must be `apply` or `decide`.
- `--depth light`: one easier `explain` or `predict` question per segment.
- Default depth: one question per segment; use two only for unusually dense segments.
- `--depth deep`: two questions per segment, favoring `apply` and `decide`.

Use `references/question-type-guide.md` for examples.

## Phase 4 - Guiding Question Intro

Before opening the browser, present:

```text
------------------------------------------------------------
    /learn-from-video
  "<Video Title>"
------------------------------------------------------------

  HOW THIS WORKS

  I will open the video and let you watch. At the end of each
  section, I will pause it and ask you a question. You will not
  move forward until you answer it. This is intentional: active
  generation is what turns watching into learning.

  The session is broken into <N> segment(s), about <X> minutes each.

  KEEP THESE QUESTIONS IN MIND WHILE WATCHING

  These are not quiz questions. Hold them in your head so your
  attention has a target:

  1. <guiding question 1>
  2. <guiding question 2>

  Ready? Type "go" to open the video.

------------------------------------------------------------
```

Wait for `go`. Do not open the browser before this.

## Phase 5 - Segmented Viewing Loop

For each segment, tell the user:

```text
Playing segment <N>/<TOTAL>: <topic>.
I will pause it at <timestamp>.
```

Browser mode:

1. Navigate to `https://www.youtube.com/watch?v=<VIDEO_ID>&t=<segment.start_seconds>s`.
2. Start or resume playback if needed.
3. Monitor `document.querySelector('video').currentTime`.
4. Pause when current time reaches `segment.pause_at_seconds`.
5. Present the checkpoint.

The `scripts/control-video.js` file provides browser-evaluate snippets, but adapt to the actual browser tool exposed by the harness.

No-browser mode:

1. Tell the user which segment to watch and the timestamp range.
2. Ask the user to return when finished.
3. Present the same checkpoint.
4. Continue only after a passing answer.

Checkpoint format:

```text
------------------------------------------------------------
  CHECKPOINT - Segment <N> of <TOTAL>
  Topic: <segment topic>
------------------------------------------------------------

  [TYPE: EXPLAIN | APPLY | DECIDE | PREDICT]

  <question text>

  Take your time. Answer in your own words.
  I will not continue until you do.

------------------------------------------------------------
```

## Phase 5c - Evaluate the Response

Evaluate against the transcript-derived understanding, not against exact wording.

Verdicts:

PASS:

```text
Good. <One sentence naming what they got right.>
<Optional one-sentence nuance.>

Resuming at segment <N+1>...
```

PARTIAL:

```text
Close, but not quite there yet.

You got: <what they understood correctly>
Missing: <what the correct answer requires>

Try again. Focus on <specific aspect>.
```

MISS:

```text
Not quite.

<One or two sentences giving a directed hint, not the full answer.>

Try again.
```

Hard gate:

- Do not advance on `PARTIAL`.
- Do not advance on `MISS`.
- Do not call a vague answer a pass.
- Do not give the full answer after a miss unless the user explicitly abandons the session.
- Keep a record of attempt counts and the final passing answer for each checkpoint.

After the final segment passes, show:

```text
------------------------------------------------------------
    Video Complete
------------------------------------------------------------

  You answered all <N> checkpoints.

  Checkpoint summary:
  Segment 1 - PASS (first attempt)
  Segment 2 - PASS (2 attempts)
  Segment 3 - PASS (first attempt)

  Generating your handoff document...

------------------------------------------------------------
```

## Phase 6 - Handoff Document

Write a Markdown file in the working directory. Use a safe timestamped filename such as:

```text
learning-handoff-learn-from-video-YYYY-MM-DD-HHMM.md
```

The handoff structure must include:

- `# Learning Handoff: <Video Title>`
- The YouTube URL, completion date, and Brame (2016) research basis.
- `## What This Video Was About` with a 2-3 sentence summary.
- `## Key Concepts` with idea, why it matters, and the user's own words.
- `## The Questions You Answered` with checkpoint questions and final passing answers.
- `## Things to Revisit` for segments that took multiple attempts.
- `## What to Do Next` with two concrete next actions.
- `## Connect to Retain` with a ready-to-run `vidbyte retain` command.

Retain command template:

```bash
vidbyte retain \
  --title "Learning Handoff - <Video Title>" \
  --domain "<inferred-domain>" \
  --conversation-id "<conversation-id-if-known>" \
  --concept1-name "<concept>" \
  --concept1-distillation "<distillation>" \
  --concept1-anchor "<anchor>" \
  --concept1-hook "<hook>" \
  --question1 "<question>" \
  --answer1 "<answer key>"
```

The handoff must include the user's own checkpoint answers. Do not replace them with generic summaries.

## Hard Rules

- Never skip Phase 0 unless `--no-browser` is present.
- Never open the browser before the guiding questions.
- Never advance past a checkpoint without a genuine pass.
- Never ask yes/no or recall-only checkpoint questions.
- Never fabricate transcript details.
- Never request YouTube credentials.
- Never construct Vidbyte HMAC headers or call Vidbyte endpoints directly.
- Always include the user's final passing checkpoint answers in the handoff.
- Always generate the handoff after all checkpoints pass.

## Inputs

Primary input is `$ARGUMENTS`.

Use conversation context only to infer domain, user level, and a useful `vidbyte retain` command. The video transcript and user checkpoint answers are the authoritative learning source for the handoff.
