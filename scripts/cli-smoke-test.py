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
            env={**os.environ, "VIDBYTE_HOME": temp_root},
        )

        if result.returncode != 0:
            print(result.stdout)
            print(result.stderr)
            return result.returncode

        dry_run = json.loads(result.stdout)
        assert dry_run["endpoint"] == "feedback", f"Expected endpoint 'feedback', got {dry_run['endpoint']}"
        assert dry_run["skill_id"] == "feedback", f"skill_id mismatch: {dry_run['skill_id']}"
        assert dry_run["signed"] is True, "signed should be True"
        assert dry_run["file"] == str(feedback_file.resolve()), f"file mismatch: {dry_run['file']}"
        assert dry_run["header_names"] == [
            "Content-Type",
            "User-Agent",
            "X-Skill-Id",
            "X-Skill-Body-SHA256",
            "X-Skill-Request-Nonce",
            "X-Vidbyte-Installation-Id",
            "X-Vidbyte-CLI-Version",
        ], f"header_names mismatch: {dry_run['header_names']}"

        retain_result = subprocess.run(
            [
                sys.executable,
                "-m",
                "cli",
                "retain",
                "--title",
                "Retain the CLI architecture",
                "--domain",
                "software-engineering",
                "--conversation-id",
                "test-conversation",
                "--concept1-name",
                "CLI signing boundary",
                "--concept1-distillation",
                "The prompt generates content, while the CLI owns signing and transport.",
                "--concept1-anchor",
                "A locked dispatch box with a public label and a private key under the desk.",
                "--concept1-hook",
                "This matches webhook signing, where the algorithm is public but the shared secret is private.",
                "--brain-dump-prompt",
                "Write everything you remember from the conversation.",
                "--question1",
                "Why should the prompt not construct Vidbyte HMAC headers itself?",
                "--answer1",
                "A strong answer says prompt text is not a trust boundary, while the CLI can keep secrets and build signatures in code.",
                "--problem1-scenario",
                "A teammate wants to open-source another Vidbyte submission CLI.",
                "--problem1-question",
                "What boundary should they preserve before shipping it?",
                "--problem1-criteria",
                "A strong answer keeps secrets out of prompts, signs requests in the CLI, and verifies signatures on the backend.",
                "--review1",
                "Explain the prompt-to-CLI-to-backend boundary from memory.",
                "--dry-run",
            ],
            capture_output=True,
            text=True,
            cwd=str(REPO_ROOT),
            env={**os.environ, "VIDBYTE_HOME": temp_root},
        )

        if retain_result.returncode != 0:
            print(retain_result.stdout)
            print(retain_result.stderr)
            return retain_result.returncode

        retain_dry_run = json.loads(retain_result.stdout)
        assert retain_dry_run["endpoint"] == "retain", f"Expected endpoint 'retain', got {retain_dry_run['endpoint']}"
        assert retain_dry_run["skill_id"] == "retain", f"skill_id mismatch: {retain_dry_run['skill_id']}"
        assert retain_dry_run["signed"] is True, "retain signed should be True"
        assert retain_dry_run["validated"] is True, "retain validated should be True"
        assert retain_dry_run["concept_count"] == 1, f"concept_count mismatch: {retain_dry_run['concept_count']}"
        assert retain_dry_run["question_count"] == 1, f"question_count mismatch: {retain_dry_run['question_count']}"
        assert retain_dry_run["problem_count"] == 1, f"problem_count mismatch: {retain_dry_run['problem_count']}"
        assert retain_dry_run["review_count"] == 1, f"review_count mismatch: {retain_dry_run['review_count']}"
        assert retain_dry_run["header_names"] == [
            "Content-Type",
            "User-Agent",
            "X-Skill-Id",
            "X-Skill-Body-SHA256",
            "X-Skill-Request-Nonce",
            "X-Vidbyte-Installation-Id",
            "X-Vidbyte-CLI-Version",
        ], f"retain header_names mismatch: {retain_dry_run['header_names']}"

    print("CLI smoke test passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
