import json
import os
import urllib.request
import urllib.error

from .auth.headers import HeaderBuilder
from .auth.config import EnvLoader
from .constants.auth import OFFICIAL_API_ORIGIN, DEFAULT_TIMEOUT_MS

ENDPOINTS = {
    "feedback": "/api/skills/feedback",
    "compressor": "/api/skills/compressor",
    "retain": "/api/skills/retain",
    "auth-validate": "/api/auth/validate",
    "auth-session": "/api/auth/session",
}


class VidbyteRequestBuilder:
    def __init__(self, *, body: str = "", cli_version: str, endpoint_name: str,
                 skill_id: str | None = None, bearer_token: str | None = None,
                 method: str = "POST"):
        endpoint_path = ENDPOINTS.get(endpoint_name)
        if endpoint_path is None:
            raise ValueError(f"Unknown Vidbyte endpoint: {endpoint_name}")

        self._method = method
        self._endpoint_name = endpoint_name

        if bearer_token is not None:
            self._url = f"{OFFICIAL_API_ORIGIN}{endpoint_path}"
            self._headers = {
                "Content-Type": "application/json",
                "X-CLI-Version": cli_version,
                "X-Platform": os.name,
                "User-Agent": f"vidbyte-skills/{cli_version} ({os.name})",
                "Authorization": f"Bearer {bearer_token}",
            }
            self._data = body.encode("utf-8") if body else None
            self._timeout = DEFAULT_TIMEOUT_MS / 1000.0
            self._skill_id = skill_id
        else:
            env = EnvLoader()
            config = env.get_auth_config({"skill_id": skill_id} if skill_id else {})
            EnvLoader.require_skill_secret(config)

            header_builder = HeaderBuilder(
                body=body,
                cli_version=cli_version,
                method=method,
                path=endpoint_path,
                skill_id=config["skill_id"],
                skill_secret=config["skill_secret"],
            )

            self._url = f"{config['api_origin']}{endpoint_path}"
            self._headers = header_builder.create()
            self._data = body.encode("utf-8")
            self._timeout = config["timeout_ms"] / 1000.0
            self._skill_id = config["skill_id"]

    def dry_run(self) -> dict:
        return {
            "endpoint": self._endpoint_name,
            "header_names": list(self._headers.keys()),
            "skill_id": self._skill_id,
            "bytes": len(self._data),
            "signed": True,
        }

    def request(self) -> dict | None:
        req = urllib.request.Request(self._url, data=self._data, headers=self._headers, method=self._method)

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as response:
                if response.code == 204:
                    return None
                text = response.read().decode("utf-8")
                return self._parse_response(text)
        except urllib.error.HTTPError as e:
            text = e.read().decode("utf-8")
            message = self._parse_error_response(text, e.code)
            err = RuntimeError(message)
            err.status_code = e.code
            raise err
        except urllib.error.URLError as e:
            raise RuntimeError("Unable to reach Vidbyte backend. Check your connection.") from e
        except TimeoutError:
            raise RuntimeError("Request timed out.")

    @staticmethod
    def _parse_response(text: str) -> dict:
        if not text:
            return {}
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"message": text}

    @staticmethod
    def _parse_error_response(text: str, code: int) -> str:
        try:
            data = json.loads(text)
            return data.get("error") or f"Unexpected response (status {code})"
        except (json.JSONDecodeError, Exception):
            return f"Unexpected response (status {code})"
