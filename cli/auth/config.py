import os
from pathlib import Path

OFFICIAL_API_ORIGIN = "https://vidbyte.pro"
DEFAULT_SKILL_ID = "feedback-generator-v1"
DEFAULT_TIMEOUT_MS = 15_000

AUTH_DIR = Path(__file__).resolve().parent
REPO_ROOT = AUTH_DIR.parent.parent


def load_local_env() -> None:
    for candidate in env_file_candidates():
        _load_env_file(candidate)


def get_auth_config(overrides: dict | None = None) -> dict:
    load_local_env()
    overrides = overrides or {}

    return {
        "api_origin": OFFICIAL_API_ORIGIN,
        "skill_id": overrides.get("skill_id") or os.environ.get("VIDBYTE_SKILL_ID") or DEFAULT_SKILL_ID,
        "skill_secret": overrides.get("skill_secret") or os.environ.get("VIDBYTE_SKILL_SECRET", ""),
        "timeout_ms": int(os.environ.get("VIDBYTE_TIMEOUT_MS", DEFAULT_TIMEOUT_MS)),
    }


def require_skill_secret(config: dict) -> None:
    if not config["skill_secret"]:
        raise RuntimeError(
            "Missing VIDBYTE_SKILL_SECRET. Set it in your environment or in a local .env file."
        )


def env_file_candidates() -> list[Path]:
    paths = [
        Path.cwd() / ".env",
        REPO_ROOT / ".env",
    ]
    seen = set()
    unique = []
    for p in paths:
        resolved = p.resolve()
        if resolved not in seen:
            seen.add(resolved)
            unique.append(resolved)
    return unique


def _load_env_file(file_path: Path) -> None:
    if not file_path.is_file():
        return

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            parsed = _parse_env_line(line)
            if parsed is None:
                continue
            key, value = parsed
            if key in os.environ:
                continue
            os.environ[key] = value


def _parse_env_line(line: str) -> tuple[str, str] | None:
    trimmed = line.strip()
    if not trimmed or trimmed.startswith("#"):
        return None

    separator_index = trimmed.find("=")
    if separator_index == -1:
        return None

    key = trimmed[:separator_index].strip()
    value = _unquote(trimmed[separator_index + 1:].strip())
    return (key, value) if key else None


def _unquote(value: str) -> str:
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value
