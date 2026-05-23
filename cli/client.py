import json
import os
import urllib.request
import urllib.error

from .auth.invocation import InvocationRequest
from .auth.session import CredentialsSession
from .constants.auth import OFFICIAL_API_ORIGIN, DEFAULT_TIMEOUT_MS, PROTECTED_SKILL_IDS

ENDPOINTS = {
    "feedback": "/api/skills/feedback",
    "compressor": "/api/skills/compression",
    "retain": "/api/skills/retain",
    "auth-validate": "/api/skills/auth/validate",
    "auth-invoke": "/api/skills/auth/invoke",
    "auth-session": "/api/skills/auth/session",
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
        self._path = endpoint_path
        self._timeout = DEFAULT_TIMEOUT_MS / 1000.0
        self._invocation: InvocationRequest | None = None
        self._session = CredentialsSession()

        if bearer_token is not None:
            self._url = f"{OFFICIAL_API_ORIGIN}{endpoint_path}"
            self._headers = {
                "Content-Type": "application/json",
                "X-CLI-Version": cli_version,
                "X-Platform": os.name,
                "User-Agent": f"vidbyte-skills/{cli_version} ({os.name})",
            }
            if endpoint_name == "auth-validate":
                self._headers["X-Api-Key"] = bearer_token
            else:
                self._headers["Authorization"] = f"Bearer {bearer_token}"
            self._data = body.encode("utf-8") if body else None
            self._skill_id = skill_id
        else:
            protected_skill_id = PROTECTED_SKILL_IDS.get(endpoint_name)
            if protected_skill_id is None:
                raise ValueError(f"Endpoint does not support invocation-token auth: {endpoint_name}")
            self._skill_id = protected_skill_id
            installation_id = self._session.installation_id()
            self._invocation = InvocationRequest.for_body(
                body=body,
                method=method,
                path=endpoint_path,
                skill_id=protected_skill_id,
                installation_id=installation_id,
            )
            self._url = f"{OFFICIAL_API_ORIGIN}{endpoint_path}"
            self._headers = {
                "Content-Type": "application/json",
                "User-Agent": f"vidbyte-skills/{cli_version} ({os.name})",
                "X-Skill-Id": protected_skill_id,
                "X-Skill-Body-SHA256": self._invocation.body_sha256,
                "X-Skill-Request-Nonce": self._invocation.request_nonce,
                "X-Vidbyte-Installation-Id": installation_id,
                "X-Vidbyte-CLI-Version": cli_version,
            }
            self._data = body.encode("utf-8")

    def dry_run(self) -> dict:
        return {
            "endpoint": self._endpoint_name,
            "header_names": list(self._headers.keys()),
            "skill_id": self._skill_id,
            "bytes": len(self._data or b""),
            "auth_model": "invocation-token" if self._invocation is not None else "bearer",
            "signed": self._invocation is not None,
        }

    def request(self) -> dict | None:
        if self._invocation is not None:
            self._headers["Authorization"] = f"Bearer {self._request_invocation_token()}"
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
            if isinstance(data.get("message"), str):
                return data["message"]
            if isinstance(data.get("code"), str):
                return data["code"]
            if isinstance(data.get("error"), str):
                return data["error"]
            return f"Unexpected response (status {code})"
        except (json.JSONDecodeError, Exception):
            return f"Unexpected response (status {code})"

    def _request_invocation_token(self) -> str:
        session_token = self._session.resolve_session_token()
        if not session_token:
            raise RuntimeError("Authentication required. Run vidbyte-skills auth login.")
        builder = VidbyteRequestBuilder(
            body=self._invocation.to_json(),
            cli_version=self._headers.get("X-Vidbyte-CLI-Version", "unknown"),
            endpoint_name="auth-invoke",
            bearer_token=session_token,
            method="POST",
        )
        data = builder.request() or {}
        token = data.get("invocation_token")
        if not isinstance(token, str) or not token:
            raise RuntimeError("Vidbyte backend did not return an invocation token.")
        return token
