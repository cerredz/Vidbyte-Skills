import json
import os
from pathlib import Path


class CredentialsSession:
    def __init__(self, credentials_dir: Path | None = None, credentials_file: Path | None = None):
        self._dir = credentials_dir or (Path.home() / ".vidbyte")
        self._file = credentials_file or (self._dir / "credentials")

    def get(self) -> dict | None:
        try:
            return json.loads(self._file.read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError):
            return None

    def store(self, data: dict) -> None:
        self._dir.mkdir(mode=0o700, parents=True, exist_ok=True)
        try:
            self._dir.chmod(0o700)
        except OSError:
            pass
        tmp = self._file.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
        try:
            tmp.chmod(0o600)
        except OSError:
            pass
        tmp.replace(self._file)

    def clear(self) -> None:
        try:
            self._file.unlink()
        except FileNotFoundError:
            pass

    def token(self) -> str | None:
        cred = self.get()
        if not isinstance(cred, dict):
            return None
        t = cred.get("token")
        if not isinstance(t, str) or not t.strip():
            return None
        return t

    def resolve_session_token(self) -> str | None:
        env_token = os.environ.get("VIDBYTE_SESSION_TOKEN")
        if env_token:
            return env_token
        return self.token()