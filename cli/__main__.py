#!/usr/bin/env python3
"""Vidbyte CLI — submit feedback artifacts to the Vidbyte backend."""

import sys

from .helpers import parse_options, usage
from .router import CommandRouter


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
    options = parse_options(rest)
    router = CommandRouter()
    result = router.route(resource, action, options)
    if result:
        print(result)


if __name__ == "__main__":
    main()
