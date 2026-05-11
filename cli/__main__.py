#!/usr/bin/env python3
"""Vidbyte CLI — submit feedback artifacts to the Vidbyte backend."""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from .auth.headers import create_signed_headers
from .auth.config import get_auth_config, require_skill_secret
from .auth.sanitize import sanitize_outbound_text
from .client import post_to_vidbyte

REPO_ROOT = Path(__file__).resolve().parent.parent


def _read_package_version() -> str:
    package_json = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
    return package_json["version"]


CLI_VERSION = _read_package_version()


def main() -> None:
    try:
        _main(sys.argv[1:])
    except Exception as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)


def _main(argv: list[str]) -> None:
    if not argv or "--help" in argv or "-h" in argv:
        print(_usage())
        return

    resource, action, *rest = argv

    if resource == "feedback" and action == "submit":
        _submit_feedback(_parse_options(rest))
        return

    raise RuntimeError(f"Unknown command: {' '.join(argv)}\n\n{_usage()}")


def _submit_feedback(options: dict) -> None:
    file = _require_option(options, "file", "--file")
    content = sanitize_outbound_text(Path(file).read_text(encoding="utf-8"))
    payload = json.dumps({
        "type": "feedback",
        "domain": options.get("domain", "unknown"),
        "conversation_id": options.get("conversation-id", ""),
        "file_name": Path(file).name,
        "content": content,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    })

    if options.get("dry-run"):
        config = get_auth_config({"skill_id": options.get("skill-id")} if options.get("skill-id") else {})
        require_skill_secret(config)
        headers = create_signed_headers(
            body=payload,
            cli_version=CLI_VERSION,
            method="POST",
            path="/api/skills/feedback",
            skill_id=config["skill_id"],
            skill_secret=config["skill_secret"],
        )

        print(json.dumps({
            "endpoint": "feedback",
            "file": str(Path(file).resolve()),
            "header_names": list(headers.keys()),
            "skill_id": config["skill_id"],
            "bytes": len(payload.encode("utf-8")),
            "signed": True,
        }, indent=2))
        return

    response = post_to_vidbyte(
        body=payload,
        cli_version=CLI_VERSION,
        endpoint_name="feedback",
        skill_id=options.get("skill-id"),
    )

    print(_format_response(response))


def _parse_options(argv: list[str]) -> dict:
    options: dict = {}
    i = 0
    while i < len(argv):
        arg = argv[i]

        if arg == "--dry-run":
            options["dry-run"] = True
            i += 1
            continue

        if not arg.startswith("--"):
            raise RuntimeError(f"Unexpected argument: {arg}")

        inline_separator = arg.find("=")
        if inline_separator != -1:
            key = arg[2:inline_separator]
            options[key] = arg[inline_separator + 1:]
            i += 1
            continue

        key = arg[2:]
        if i + 1 >= len(argv) or argv[i + 1].startswith("--"):
            raise RuntimeError(f"Missing value for {arg}.")

        options[key] = argv[i + 1]
        i += 2

    return options


def _require_option(options: dict, key: str, flag: str) -> str:
    value = options.get(key)
    if not value:
        raise RuntimeError(f"Missing required option {flag}.")
    return value


def _format_response(response: dict) -> str:
    if response.get("url"):
        return response["url"]
    if response.get("message"):
        return response["message"]
    return json.dumps(response)


def _usage() -> str:
    return """Usage: vidbyte <command> [options]

Commands:
  vidbyte feedback submit --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]

Security:
  Requests are sent only to https://vidbyte.pro.
  Set VIDBYTE_SKILL_SECRET in your environment or a local .env file before submitting.
"""


if __name__ == "__main__":
    main()
