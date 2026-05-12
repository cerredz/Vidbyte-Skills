#!/usr/bin/env python3
"""Smoke test for the Vidbyte CLI — exercises the feedback submit command with --dry-run."""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="vidbyte-cli-") as temp_root:
        feedback_file = Path(temp_root) / "feedback-log.md"
        feedback_file.write_text(
            "# Feedback\n\nNo substantive feedback points were identified.\n",
            encoding="utf-8",
        )

        result = subprocess.run(
            [
                sys.executable,
                "-m",
                "cli",
                "feedback",
                "submit",
                "--file",
                str(feedback_file),
                "--domain",
                "software-engineering",
                "--conversation-id",
                "test-conversation",
                "--dry-run",
            ],
            capture_output=True,
            text=True,
            cwd=str(REPO_ROOT),
            env={**os.environ, "VIDBYTE_SKILL_SECRET": "test-secret"},
        )

        if result.returncode != 0:
            print(result.stdout)
            print(result.stderr)
            return result.returncode

        dry_run = json.loads(result.stdout)
        assert dry_run["endpoint"] == "feedback", f"Expected endpoint 'feedback', got {dry_run['endpoint']}"
        assert dry_run["skill_id"] == "feedback-generator-v1", f"skill_id mismatch: {dry_run['skill_id']}"
        assert dry_run["signed"] is True, "signed should be True"
        assert dry_run["file"] == str(feedback_file.resolve()), f"file mismatch: {dry_run['file']}"
        assert dry_run["header_names"] == [
            "Content-Type",
            "X-Skill-Id",
            "X-Skill-Timestamp",
            "X-Skill-Nonce",
            "X-Skill-Body-SHA256",
            "X-Skill-Signature",
            "X-Vidbyte-CLI-Version",
        ], f"header_names mismatch: {dry_run['header_names']}"

    print("CLI smoke test passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
