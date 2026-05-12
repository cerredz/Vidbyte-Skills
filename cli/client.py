import json
import urllib.request
import urllib.error

from .auth.headers import HeaderBuilder
from .auth.config import EnvLoader

ENDPOINTS = {
    "feedback": "/api/skills/feedback",
}


class VidbyteRequestBuilder:
    def __init__(self, *, body: str, cli_version: str, endpoint_name: str, skill_id: str | None = None):
        endpoint_path = ENDPOINTS.get(endpoint_name)
        if endpoint_path is None:
            raise ValueError(f"Unknown Vidbyte endpoint: {endpoint_name}")

        env = EnvLoader()
        config = env.get_auth_config({"skill_id": skill_id} if skill_id else {})
        EnvLoader.require_skill_secret(config)

        header_builder = HeaderBuilder(
            body=body,
            cli_version=cli_version,
            method="POST",
            path=endpoint_path,
            skill_id=config["skill_id"],
            skill_secret=config["skill_secret"],
        )

        self._url = f"{config['api_origin']}{endpoint_path}"
        self._headers = header_builder.create()
        self._data = body.encode("utf-8")
        self._timeout = config["timeout_ms"] / 1000.0
        self._skill_id = config["skill_id"]
        self._endpoint_name = endpoint_name

    def dry_run(self) -> dict:
        return {
            "endpoint": self._endpoint_name,
            "header_names": list(self._headers.keys()),
            "skill_id": self._skill_id,
            "bytes": len(self._data),
            "signed": True,
        }

    def request(self) -> dict:
        req = urllib.request.Request(self._url, data=self._data, headers=self._headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as response:
                text = response.read().decode("utf-8")
                return self._parse_response(text)
        except urllib.error.HTTPError as e:
            text = e.read().decode("utf-8")
            raise RuntimeError(f"Vidbyte API rejected the request ({e.code}): {text}") from e

    @staticmethod
    def _parse_response(text: str) -> dict:
        if not text:
            return {}
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"message": text}
