import json
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def read_package_version() -> str:
    package_json = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
    return package_json["version"]


def parse_options(argv: list[str]) -> dict:
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


def require_option(options: dict, key: str, flag: str) -> str:
    value = options.get(key)
    if not value:
        raise RuntimeError(f"Missing required option {flag}.")
    return value


def format_response(response: dict) -> str:
    if response.get("url"):
        return response["url"]
    if response.get("message"):
        return response["message"]
    return json.dumps(response)


def usage() -> str:
    return """Usage: vidbyte <command> [options]

Commands:
  vidbyte feedback submit --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]

Security:
  Requests are sent only to https://vidbyte.pro.
  Set VIDBYTE_SKILL_SECRET in your environment or a local .env file before submitting.
"""


def execute_feedback_submit(options: dict) -> str | None:
    file = require_option(options, "file", "--file")

    from .auth.sanitize import Sanitizer
    sanitizer = Sanitizer()
    content = sanitizer.sanitize(Path(file).read_text(encoding="utf-8"))

    payload = json.dumps({
        "type": "feedback",
        "domain": options.get("domain", "unknown"),
        "conversation_id": options.get("conversation-id", ""),
        "file_name": Path(file).name,
        "content": content,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    })

    cli_version = read_package_version()

    if options.get("dry-run"):
        from .auth.config import EnvLoader
        from .auth.headers import HeaderBuilder

        env = EnvLoader()
        config = env.get_auth_config({"skill_id": options.get("skill-id")} if options.get("skill-id") else {})
        EnvLoader.require_skill_secret(config)

        header_builder = HeaderBuilder(
            body=payload,
            cli_version=cli_version,
            method="POST",
            path="/api/skills/feedback",
            skill_id=config["skill_id"],
            skill_secret=config["skill_secret"],
        )
        headers = header_builder.create()

        return json.dumps({
            "endpoint": "feedback",
            "file": str(Path(file).resolve()),
            "header_names": list(headers.keys()),
            "skill_id": config["skill_id"],
            "bytes": len(payload.encode("utf-8")),
            "signed": True,
        }, indent=2)

    from .client import VidbyteRequestBuilder

    builder = VidbyteRequestBuilder(
        body=payload,
        cli_version=cli_version,
        endpoint_name="feedback",
        skill_id=options.get("skill-id"),
    )
    response = builder.request()
    return format_response(response)
