import json
import os
from pathlib import Path


CREDENTIALS_DIR = Path.home() / ".vidbyte"
CREDENTIALS_FILE = CREDENTIALS_DIR / "credentials"


def get() -> dict | None:
    try:
        return json.loads(CREDENTIALS_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def store(data: dict) -> None:
    CREDENTIALS_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    tmp = CREDENTIALS_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
    try:
        tmp.chmod(0o600)
    except NotImplementedError:
        pass
    tmp.replace(CREDENTIALS_FILE)


def clear() -> None:
    try:
        CREDENTIALS_FILE.unlink()
    except FileNotFoundError:
        pass


def token() -> str | None:
    cred = get()
    if cred is None:
        return None
    return cred.get("token")


def resolve_session_token() -> str | None:
    env_token = os.environ.get("VIDBYTE_SESSION_TOKEN")
    if env_token:
        return env_token
    return token()
