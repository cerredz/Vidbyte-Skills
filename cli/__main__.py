#!/usr/bin/env python3
"""Vidbyte CLI — submit feedback artifacts to the Vidbyte backend."""

import sys

from .helpers import parse_options, usage
from .router import CommandRouter


def main() -> None:
    # Runs the Vidbyte CLI and converts command errors into stderr plus a non-zero exit.
    try:
        _main(sys.argv[1:])
    except Exception as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)


def _main(argv: list[str]) -> None:
    # Parses top-level commands and dispatches them through CommandRouter.
    if not argv or "--help" in argv or "-h" in argv:
        print(usage())
        return

    if argv[0] == "agents":
        resource = "agents"
        action, rest = _parse_agents_args(argv[1:])
        options = {"_args": rest}
    elif argv[0] == "retain":
        resource = "retain"
        action = "submit"
        rest = argv[1:]
        options = parse_options(rest)
    elif len(argv) >= 2:
        resource, action, *rest = argv
        options = parse_options(rest)
    else:
        raise RuntimeError(usage())

    router = CommandRouter()
    result = router.route(resource, action, options)
    if result:
        print(result)


def _parse_agents_args(args: list[str]) -> tuple[str, list[str]]:
    # Preserves positional agent skill arguments while defaulting bare `vidbyte agents` to list.
    if not args or args[0].startswith("--"):
        return "list", args
    action = args[0]
    return action, args[1:]


if __name__ == "__main__":
    main()
