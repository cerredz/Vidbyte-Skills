import os
from pathlib import Path

from ..constants.auth import OFFICIAL_API_ORIGIN, DEFAULT_SKILL_ID, DEFAULT_TIMEOUT_MS


def _resolve_repo_root() -> Path:
    env_root = os.environ.get("VIDBYTE_REPO_ROOT")
    if env_root and Path(env_root).is_dir():
        return Path(env_root)

    current = Path(__file__).resolve().parent
    for _ in range(6):
        if (current / "package.json").is_file():
            return current
        current = current.parent

    return Path(__file__).resolve().parent.parent.parent


REPO_ROOT = _resolve_repo_root()


class EnvLoader:
    def __init__(self):
        self._load_env_files()

    def _load_env_files(self):
        candidates = self._env_file_candidates()
        for candidate in candidates:
            if not candidate.is_file():
                continue
            with open(candidate, "r", encoding="utf-8") as f:
                for line in f:
                    key, value = self._parse_env_line(line)
                    if key is None:
                        continue
                    if key in os.environ:
                        continue
                    os.environ[key] = value

    def _env_file_candidates(self):
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

    def _parse_env_line(self, line: str):
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("#"):
            return None, None

        sep = trimmed.find("=")
        if sep == -1:
            return None, None

        key = trimmed[:sep].strip()
        if not key:
            return None, None

        value = trimmed[sep + 1:].strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]

        return key, value

    def get_auth_config(self, overrides: dict | None = None) -> dict:
        overrides = overrides or {}
        return {
            "api_origin": OFFICIAL_API_ORIGIN,
            "skill_id": overrides.get("skill_id") or os.environ.get("VIDBYTE_SKILL_ID") or DEFAULT_SKILL_ID,
            "skill_secret": overrides.get("skill_secret") or os.environ.get("VIDBYTE_SKILL_SECRET", ""),
            "timeout_ms": int(os.environ.get("VIDBYTE_TIMEOUT_MS", DEFAULT_TIMEOUT_MS)),
        }

    @staticmethod
    def require_skill_secret(config: dict) -> None:
        if not config["skill_secret"]:
            raise RuntimeError(
                "Missing VIDBYTE_SKILL_SECRET. Set it in your environment or in a local .env file."
            )
