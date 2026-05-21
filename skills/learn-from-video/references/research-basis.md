# Research Basis

## Source

Cynthia J. Brame, "Effective Educational Videos: Principles and Guidelines for Maximizing Student Learning from Video Content," CBE-Life Sciences Education, 15(4), es6, 2016. DOI: 10.1187/cbe.16-03-0125.

## Pillar 1: Cognitive Load Management

Working memory is limited. A learning video becomes weaker when it forces the learner to process too much at once, adds decorative material that does not serve the concept, or makes narration and visuals compete.

This skill applies cognitive load management by:

- Segmenting video into short topic-complete chunks.
- Asking the model to identify topic transitions rather than split on fixed timers only.
- Using guiding questions and checkpoint questions to focus attention on the important ideas.
- Avoiding recall-only quiz questions that reward word matching instead of understanding.

## Pillar 2: Student Engagement

Engagement is strongly affected by duration. Shorter segments are easier to complete, and learners benefit when they know what to attend to before they start watching.

This skill applies engagement principles by:

- Targeting 4-8 minute segments.
- Capping sessions at 8 segments unless the user chooses a range or full long session.
- Telling the user what segment is playing and where the pause will occur.
- Preserving learner control through replay, rewind, timestamp ranges, and segment resume.

## Pillar 3: Active Learning

Watching is passive by default. Learning improves when the learner has to explain, decide, apply, or predict during and after the video.

This skill applies active learning by:

- Presenting guiding questions before viewing begins.
- Pausing at segment boundaries for interactive checkpoints.
- Requiring a passing answer before the video resumes.
- Saving the user's own answers in a handoff document.
- Connecting the session to a `vidbyte retain` command for later retrieval practice.

## Contributor Notes

The checkpoint gate is the central behavior. Do not weaken it by allowing partial, vague, or reassuring answers to advance the session. A `PARTIAL` or `MISS` should produce a hint and another attempt, not a pass.

