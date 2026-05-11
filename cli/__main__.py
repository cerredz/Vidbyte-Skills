#!/usr/bin/env python3
"""Vidbyte CLI — submit feedback artifacts to the Vidbyte backend."""

import sys

from .helpers import execute_feedback_submit, parse_options, usage


def main() -> None:
    try:
        _main(sys.argv[1:])
    except Exception as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)


def _main(argv: list[str]) -> None:
    if not argv or "--help" in argv or "-h" in argv:
        print(usage())
        return

    resource, action, *rest = argv

    if resource == "feedback" and action == "submit":
        result = execute_feedback_submit(parse_options(rest))
        if result:
            print(result)
        return

    raise RuntimeError(f"Unknown command: {' '.join(argv)}\n\n{usage()}")


if __name__ == "__main__":
    main()
