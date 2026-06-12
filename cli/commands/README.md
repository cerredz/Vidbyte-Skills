# Vidbyte CLI Commands

The `cli/commands/` package contains the Python command classes behind the
`vidbyte` command shipped with Vidbyte Skills. These commands let skills submit
validated artifacts to Vidbyte without asking model-generated prompt text to
construct backend requests or authentication headers.

## Role In The Repository

The Node package exposes `vidbyte` through `bin/vidbyte.js`, which delegates to
the stdlib-only Python CLI. `cli/__main__.py` parses the command shape,
`cli/router.py` dispatches to command classes, and each command class builds a
payload for `VidbyteRequestBuilder`.

Current commands:

- `AuthCommand`: `auth login`, `auth logout`, and `auth status`.
- `FeedbackCommand`: `feedback submit --file ...`.
- `CompressorCommand`: `compressor submit --file ...`.
- `RetainCommand`: `retain ...` as a direct shortcut command.

## Design Philosophy

Prompt text is not a trust boundary. Skills can generate files and structured
arguments, but the CLI owns authentication, sanitization, backend endpoint
selection, request signing, invocation-token exchange, and response parsing.

This keeps the security model narrow:

- Requests go to the official Vidbyte origin configured in code.
- File-backed commands sanitize file content before payload construction.
- Protected skill submissions use session-backed invocation-token auth.
- `--dry-run` validates request shape locally without sending the final backend request.
- Command implementations avoid third-party Python dependencies.

## Usage

Submit feedback from a generated file:

```bash
vidbyte feedback submit --file feedback-log.md --domain software-engineering --conversation-id local-test --dry-run
```

Submit a compression artifact:

```bash
vidbyte compressor submit --file summary.md --domain software-engineering --conversation-id local-test --dry-run
```

Submit retention content with argument-shaped fields:

```bash
vidbyte retain --concept1-name "CLI auth boundary" --concept1-distillation "The prompt writes content while the CLI owns transport." --question1 "Why should prompts not construct auth headers?" --answer1 "Because prompt text is not a trust boundary." --dry-run
```

Check authentication state:

```bash
vidbyte auth status
```

Route commands from Python:

```python
from cli.router import CommandRouter

result = CommandRouter().route(
    "feedback",
    "submit",
    {"file": "feedback-log.md", "domain": "software-engineering", "dry-run": True},
)
print(result)
```

Build a dry-run request envelope:

```python
from cli.client import VidbyteRequestBuilder
from cli.helpers import read_package_version

builder = VidbyteRequestBuilder(
    body="{}",
    cli_version=read_package_version(),
    endpoint_name="feedback",
)

print(builder.dry_run())
```

## Command Flow

```text
bin/vidbyte.js
    |
    v
python -m cli
    |
    v
cli/__main__.py parses resource/action/options
    |
    v
CommandRouter
    |
    v
AuthCommand | FeedbackCommand | CompressorCommand | RetainCommand
    |
    v
VidbyteRequestBuilder
```

## Key Files

- `auth.py`: interactive login, logout, and status checks through `CredentialsSession`.
- `feedback.py`: sanitized file submission for feedback artifacts.
- `compressor.py`: sanitized file submission for compression artifacts.
- `retain.py`: argument-shaped retention module submission.
- `../client.py`: endpoint mapping, dry-run envelopes, session-backed invocation-token auth, and response parsing.
- `../router.py`: resource/action dispatch.
- `../__main__.py`: top-level CLI parsing.

## Related Flows

Use [`skills/`](../../skills/README.md) for installable skill content. Skills
should call these CLI commands instead of constructing requests to
`https://vidbyte.pro` directly.
