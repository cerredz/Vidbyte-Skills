#!/usr/bin/env python3
"""Verification script for agent-facing Vidbyte CLI help and skills."""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    # Runs every agent-facing CLI skill test and returns a process exit code.
    tests = [
        ("[Hidden Assumption] help includes Agents section", test_help_includes_agents_section),
        ("[Edge Case] bare agents command lists core", test_bare_agents_lists_core),
        ("[Silent Failure] agents list json is parseable", test_agents_list_json),
        ("[Hidden Failure] agents get core returns markdown", test_agents_get_core),
        ("[Silent Failure] agents get core json includes full content", test_agents_get_core_json),
        ("[Hidden Failure] agents get core full includes references", test_agents_get_core_full),
        ("[Edge Case] agents get all excludes hidden skills", test_agents_get_all_excludes_hidden),
        ("[Hidden Assumption] agents path prints root", test_agents_path_root),
        ("[Hidden Assumption] agents path core prints skill directory", test_agents_path_core),
        ("[Edge Case] missing agent skill fails clearly", test_missing_skill_fails),
        ("[Edge Case] unknown agents subcommand fails clearly", test_unknown_subcommand_fails),
        ("[Hidden Assumption] environment override points at skill root", test_environment_override),
        ("[Hidden Failure] feedback dry-run still routes", test_feedback_dry_run_still_routes),
        ("[Hidden Failure] retain dry-run still routes", test_retain_dry_run_still_routes),
        ("[Hidden Failure] auth status still routes", test_auth_status_still_routes),
        ("[Hidden Assumption] node vidbyte shim delegates agents command", test_node_shim_delegates_agents),
        ("[Hidden Assumption] package files includes agent-skills", test_package_files_include_agent_skills),
    ]
    passed = 0
    for name, test in tests:
        try:
            test()
            passed += 1
            print(f"PASS {name}")
        except Exception as exc:
            print(f"FAIL {name}: {exc}")
    print(f"{passed}/{len(tests)} tests passed")
    return 0 if passed == len(tests) else 1


def test_help_includes_agents_section() -> None:
    # Verifies top-level help teaches agents how to load CLI instructions.
    result = run_cli(["--help"])
    assert_ok(result)
    assert_contains(result.stdout, "Agents:")
    assert_contains(result.stdout, "vidbyte agents get core --full")


def test_bare_agents_lists_core() -> None:
    # Verifies `vidbyte agents` defaults to the list action.
    result = run_cli(["agents"])
    assert_ok(result)
    assert_contains(result.stdout, "core")
    assert_contains(result.stdout, "Core Vidbyte CLI usage")


def test_agents_list_json() -> None:
    # Verifies JSON list output is stable and machine-readable.
    result = run_cli(["agents", "--json"])
    assert_ok(result)
    data = parse_json(result.stdout)
    assert_true(data["success"] is True, "success should be true")
    assert_true(any(item["name"] == "core" for item in data["data"]), "core should be listed")


def test_agents_get_core() -> None:
    # Verifies core Markdown content is served from the bundled agent-skills directory.
    result = run_cli(["agents", "get", "core"])
    assert_ok(result)
    assert_contains(result.stdout, "# Vidbyte CLI Core")
    assert_contains(result.stdout, "vidbyte agents get core --full")


def test_agents_get_core_json() -> None:
    # Verifies JSON get output includes the full SKILL.md content.
    result = run_cli(["agents", "get", "core", "--json"])
    assert_ok(result)
    data = parse_json(result.stdout)
    assert_true(data["success"] is True, "success should be true")
    assert_true(data["data"][0]["name"] == "core", "core should be first target")
    assert_contains(data["data"][0]["content"], "# Vidbyte CLI Core")


def test_agents_get_core_full() -> None:
    # Verifies --full appends reference files for agent command details.
    result = run_cli(["agents", "get", "core", "--full"])
    assert_ok(result)
    assert_contains(result.stdout, "--- references/vidbyte-cli-commands.md ---")
    assert_contains(result.stdout, "vidbyte feedback submit --file <path>")


def test_agents_get_all_excludes_hidden() -> None:
    # Verifies hidden guide stubs stay out of list and --all output.
    with tempfile.TemporaryDirectory(prefix="vidbyte-agent-skills-") as temp_root:
        root = Path(temp_root)
        write_fixture_skill(root, "visible-skill", "Visible skill.", hidden=False)
        write_fixture_skill(root, "hidden-skill", "Hidden skill.", hidden=True)
        result = run_cli(["agents", "get", "--all", "--json"], env={"VIDBYTE_AGENT_SKILLS_DIR": str(root)})
    assert_ok(result)
    names = [item["name"] for item in parse_json(result.stdout)["data"]]
    assert_true(names == ["visible-skill"], f"unexpected names: {names}")


def test_agents_path_root() -> None:
    # Verifies the root path command points at the bundled agent-skills directory.
    result = run_cli(["agents", "path"])
    assert_ok(result)
    normalized = result.stdout.strip().replace("\\", "/")
    assert_true(normalized.endswith("agent-skills"), f"unexpected path: {result.stdout}")


def test_agents_path_core() -> None:
    # Verifies named path output points at the bundled core guide directory.
    result = run_cli(["agents", "path", "core"])
    assert_ok(result)
    normalized = result.stdout.strip().replace("\\", "/")
    assert_true(normalized.endswith("agent-skills/core"), f"unexpected path: {result.stdout}")


def test_missing_skill_fails() -> None:
    # Verifies unknown names fail loudly instead of returning empty content.
    result = run_cli(["agents", "get", "missing"])
    assert_true(result.returncode != 0, "missing skill should fail")
    assert_contains(result.stderr + result.stdout, "Skill not found: missing")


def test_unknown_subcommand_fails() -> None:
    # Verifies unknown agents subcommands produce the dedicated agents error.
    result = run_cli(["agents", "nope"])
    assert_true(result.returncode != 0, "unknown subcommand should fail")
    assert_contains(result.stderr + result.stdout, "Unknown agents subcommand: nope")


def test_environment_override() -> None:
    # Verifies VIDBYTE_AGENT_SKILLS_DIR is interpreted as the agent skill root itself.
    with tempfile.TemporaryDirectory(prefix="vidbyte-agent-skills-") as temp_root:
        root = Path(temp_root)
        write_fixture_skill(root, "fixture-skill", "Fixture skill.", hidden=False)
        (root / "not-a-skill").mkdir()
        result = run_cli(["agents", "--json"], env={"VIDBYTE_AGENT_SKILLS_DIR": str(root)})
    assert_ok(result)
    data = parse_json(result.stdout)
    names = [item["name"] for item in data["data"]]
    assert_true(names == ["fixture-skill"], f"unexpected override names: {names}")


def test_feedback_dry_run_still_routes() -> None:
    # Verifies the agents parser change does not break feedback submit routing.
    with tempfile.TemporaryDirectory(prefix="vidbyte-agent-cli-") as temp_root:
        feedback_file = Path(temp_root) / "feedback.md"
        feedback_file.write_text("# Feedback\n", encoding="utf-8")
        result = run_cli(["feedback", "submit", "--file", str(feedback_file), "--dry-run"], env={"VIDBYTE_HOME": temp_root})
    assert_ok(result)
    assert_true(parse_json(result.stdout)["endpoint"] == "feedback", "feedback endpoint mismatch")


def test_retain_dry_run_still_routes() -> None:
    # Verifies the agents parser change does not break retain shorthand routing.
    with tempfile.TemporaryDirectory(prefix="vidbyte-agent-cli-") as temp_root:
        result = run_cli(
            [
                "retain",
                "--concept1-name",
                "Concept",
                "--concept1-distillation",
                "Mechanism",
                "--concept1-anchor",
                "Image",
                "--concept1-hook",
                "Hook",
                "--question1",
                "Question?",
                "--answer1",
                "Answer.",
                "--dry-run",
            ],
            env={"VIDBYTE_HOME": temp_root},
        )
    assert_ok(result)
    assert_true(parse_json(result.stdout)["endpoint"] == "retain", "retain endpoint mismatch")


def test_auth_status_still_routes() -> None:
    # Verifies auth status still reaches AuthCommand after the dispatch change.
    with tempfile.TemporaryDirectory(prefix="vidbyte-agent-cli-") as temp_root:
        result = run_cli(["auth", "status"], env={"VIDBYTE_HOME": temp_root})
    assert_ok(result)
    assert_contains(result.stdout, "Not authenticated")


def test_node_shim_delegates_agents() -> None:
    # Verifies the public npm bin shim can delegate the new agents command.
    result = subprocess.run(
        ["node", "bin/vidbyte.js", "agents", "get", "core"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        env=os.environ.copy(),
    )
    assert_ok(result)
    assert_contains(result.stdout, "# Vidbyte CLI Core")


def test_package_files_include_agent_skills() -> None:
    # Verifies published package configuration includes the bundled agent guides.
    package = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
    assert_true("agent-skills" in package["files"], "agent-skills missing from package files")


def run_cli(args: list[str], env: dict[str, str] | None = None) -> subprocess.CompletedProcess:
    # Executes the Python CLI with isolated optional environment overrides.
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    return subprocess.run(
        [sys.executable, "-m", "cli", *args],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        env=merged_env,
    )


def write_fixture_skill(root: Path, name: str, description: str, hidden: bool) -> None:
    # Writes a minimal SKILL.md fixture under the supplied agent skill root.
    directory = root / name
    directory.mkdir(parents=True, exist_ok=True)
    hidden_line = "hidden: true\n" if hidden else ""
    (directory / "SKILL.md").write_text(
        f"---\nname: {name}\ndescription: {description}\n{hidden_line}---\n\n# {name}\n\nFixture content.\n",
        encoding="utf-8",
    )


def parse_json(text: str) -> dict:
    # Parses JSON and raises an assertion-friendly error when output is malformed.
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise AssertionError(f"invalid JSON: {text}") from exc


def assert_ok(result: subprocess.CompletedProcess) -> None:
    # Asserts a subprocess completed successfully and includes stderr on failure.
    assert_true(result.returncode == 0, f"exit {result.returncode}; stdout={result.stdout}; stderr={result.stderr}")


def assert_contains(text: str, expected: str) -> None:
    # Asserts a substring is present with a compact diagnostic.
    assert_true(expected in text, f"expected {expected!r} in {text!r}")


def assert_true(condition: bool, message: str) -> None:
    # Raises AssertionError with the supplied message when a condition is false.
    if not condition:
        raise AssertionError(message)


if __name__ == "__main__":
    sys.exit(main())
