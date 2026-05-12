# CLI Command Architecture

This artifact describes how the Vidbyte CLI routes commands internally and how new commands should be added.

## Command Router

The CLI uses a `CommandRouter` class in `cli/router.py` to dispatch resource/action pairs to the correct command handler. The router is a single switch statement that maps `(resource, action)` tuples to command class methods.

The entry point is `cli/__main__.py`, which:
1. Parses `resource` and `action` from `argv[0]` and `argv[1]`
2. Parses remaining arguments via `parse_options()`
3. Passes `(resource, action, options)` to `CommandRouter.route()`

## Command Classes

Each command resource has a class in `cli/commands/`. Methods on the class correspond to CLI actions.

### FeedbackCommand (`cli/commands/feedback.py`)

| Method | CLI invocation | Description |
|--------|---------------|-------------|
| `submit()` | `vidbyte feedback submit --file <path> ...` | Reads, sanitizes, signs, and sends a feedback artifact to the backend |

## Adding a New Command

1. Create a new command class in `cli/commands/<resource>.py`
2. Add a method for each action the command supports
3. Add a route entry in `CommandRouter.route()` in `cli/router.py`
4. Add the endpoint path to `cli/client.py` if a new backend route is needed
5. Add a smoke test entry if applicable

## Helper Functions

Utility functions live in `cli/helpers.py` and `cli/helpers/`:

| Location | Contents |
|----------|----------|
| `cli/helpers.py` | `read_package_version()`, `parse_options()`, `require_option()`, `format_response()` |
| `cli/helpers/usage.py` | `usage()` — returns the CLI help text |

## Design Principles

- Command classes contain no argument parsing — they receive a pre-parsed `options` dict
- Command classes are instantiated per-invocation (stateless)
- The router is the single place to know which commands exist
- `cli/__main__.py` is minimal: parse, route, print
