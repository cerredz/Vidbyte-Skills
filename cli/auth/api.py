import json
import os
import urllib.request
import urllib.error

from ..constants.auth import DEFAULT_API_URL, AUTH_API_TIMEOUT_MS
from ..helpers import read_package_version


def _api_url() -> str:
    return os.environ.get("VIDBYTE_API_URL", DEFAULT_API_URL)


def _log_request(method: str, path: str, status: str, duration_ms: float) -> None:
    import sys
    print(f"[vidbyte] {method} {path} \u2192 {status} ({duration_ms:.0f}ms)", file=sys.stderr)


def _parse_error(res) -> str:
    try:
        text = res.read().decode("utf-8")
        data = json.loads(text)
        return data.get("error") or f"Unexpected response (status {res.code})"
    except (json.JSONDecodeError, Exception):
        return f"Unexpected response (status {res.code})"


def _api_request(method: str, path: str, bearer_token: str | None = None, body: dict | None = None) -> dict | None:
    url = f"{_api_url()}{path}"
    data = json.dumps(body).encode("utf-8") if body else None

    headers = {
        "Content-Type": "application/json",
        "X-CLI-Version": read_package_version(),
        "X-Platform": os.name,
        "User-Agent": f"vidbyte-skills/{read_package_version()} ({os.name})",
    }
    if bearer_token:
        headers["Authorization"] = f"Bearer {bearer_token}"

    import time
    started = time.monotonic()

    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=AUTH_API_TIMEOUT_MS / 1000.0) as res:
            duration = (time.monotonic() - started) * 1000
            _log_request(method, path, str(res.code), duration)
            if res.code == 204:
                return None
            text = res.read().decode("utf-8")
            return json.loads(text)
    except urllib.error.HTTPError as e:
        duration = (time.monotonic() - started) * 1000
        _log_request(method, path, str(e.code), duration)
        message = _parse_error(e)
        err = RuntimeError(message)
        err.status_code = e.code
        raise err
    except urllib.error.URLError as e:
        raise RuntimeError("Unable to reach Vidbyte backend. Check your connection.") from e
    except TimeoutError:
        raise RuntimeError("Request timed out.")


def validate_api_key(api_key: str) -> dict:
    return _api_request("POST", "/auth/validate", bearer_token=api_key)


def get_session_status(session_token: str) -> dict:
    return _api_request("GET", "/auth/session", bearer_token=session_token)


def revoke_session(session_token: str) -> None:
    _api_request("DELETE", "/auth/session", bearer_token=session_token)
