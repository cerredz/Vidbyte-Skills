import os
from pathlib import Path

from ..constants.auth import OFFICIAL_API_ORIGIN, DEFAULT_SKILL_ID, DEFAULT_TIMEOUT_MS

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# Auth-bearing variables that must only come from the real process environment.
# A working-directory or repo .env must never be able to inject these, otherwise
# opening a malicious repo and running a skill could redirect the user's data to an
# attacker's account or supply a forged skill secret.
_PROTECTED_ENV_KEYS = frozenset({
    "VIDBYTE_SESSION_TOKEN",
    "VIDBYTE_API_KEY",
    "VIDBYTE_SKILL_SECRET",
    "VIDBYTE_SKILL_ID",
    "VIDBYTE_HOME",
})


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
                    # Never source credentials from a .env file; process env only.
                    if key in _PROTECTED_ENV_KEYS:
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
