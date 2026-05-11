import json
import urllib.request
import urllib.error

from .auth.headers import create_signed_headers
from .auth.config import get_auth_config, require_skill_secret

ENDPOINTS = {
    "feedback": "/api/skills/feedback",
}


def post_to_vidbyte(*, body: str, cli_version: str, endpoint_name: str, skill_id: str | None = None) -> dict:
    endpoint_path = ENDPOINTS.get(endpoint_name)
    if endpoint_path is None:
        raise ValueError(f"Unknown Vidbyte endpoint: {endpoint_name}")

    config = get_auth_config({"skill_id": skill_id} if skill_id else {})
    require_skill_secret(config)

    headers = create_signed_headers(
        body=body,
        cli_version=cli_version,
        method="POST",
        path=endpoint_path,
        skill_id=config["skill_id"],
        skill_secret=config["skill_secret"],
    )

    url = f"{config['api_origin']}{endpoint_path}"
    data = body.encode("utf-8")

    req = urllib.request.Request(url, data=data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=config["timeout_ms"] / 1000.0) as response:
            text = response.read().decode("utf-8")
            return _parse_response(text)
    except urllib.error.HTTPError as e:
        text = e.read().decode("utf-8")
        raise RuntimeError(f"Vidbyte API rejected the request ({e.code}): {text}") from e


def _parse_response(text: str) -> dict:
    if not text:
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"message": text}
