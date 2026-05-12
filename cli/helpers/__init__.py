import json
from functools import wraps
from pathlib import Path

from .usage import usage  # noqa: F401 — re-export for callers

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def sanitize_file_content(func):
    """Decorator that reads a file from options, sanitizes it, and stores the result.

    The decorated method must accept ``(self, options: dict)``.  The decorator
    reads ``options["file"]``, runs it through :class:`Sanitizer`, and stores
    the sanitized text in ``options["_sanitized_content"]`` so the method body
    can consume it without repeating the sanitizer boilerplate.
    """
    @wraps(func)
    def wrapper(self, options: dict):
        file_path = options.get("file", "")
        if file_path:
            from ..auth.sanitize import Sanitizer
            sanitizer = Sanitizer()
            content = sanitizer.sanitize(Path(file_path).read_text(encoding="utf-8"))
            options["_sanitized_content"] = content
        return func(self, options)
    return wrapper


def read_package_version() -> str:
    """Read the package version string from the repo root package.json."""
    package_json = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
    return package_json["version"]


def parse_options(argv: list[str]) -> dict:
    """Parse CLI options from a list of arguments into a key-value dict.

    Supports --flag=value, --flag value, and --dry-run (boolean flag).
    Raises RuntimeError on unexpected or malformed arguments.
    """
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
    """Return the value for *key* in *options* or raise RuntimeError with *flag*.

    Useful for validating that required CLI options are present.
    """
    value = options.get(key)
    if not value:
        raise RuntimeError(f"Missing required option {flag}.")
    return value


def format_response(response: dict) -> str:
    """Extract the most useful display string from a backend API response dict.

    Prefers the 'url' field, then 'message', then dumps the full response as JSON.
    """
    if response.get("url"):
        return response["url"]
    if response.get("message"):
        return response["message"]
    return json.dumps(response)
