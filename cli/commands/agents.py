from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

from ..helpers import REPO_ROOT


@dataclass
class AgentSkill:
    name: str
    description: str
    directory: Path
    skill_file: Path
    hidden: bool


class AgentSkillsCommand:

    def __init__(self, repo_root: Path | None = None) -> None:
        # Stores the repository root and resolves the bundled agent skill directory.
        self._repo_root = repo_root or REPO_ROOT
        self._skills_root = self._resolve_skills_root()

    def run(self, action: str, args: list[str]) -> str | None:
        # Dispatches agent skill subcommands using positional arguments preserved by the top-level parser.
        if action == "list":
            return self.list(args)
        if action == "get":
            return self.get(args)
        if action == "path":
            return self.path(args)
        raise RuntimeError(f"Unknown agents subcommand: {action}")

    def list(self, args: list[str]) -> str:
        # Lists visible agent skills as compact text or structured JSON.
        json_mode = self._json_mode(args)
        skills = [skill for skill in self._discover_skills() if not skill.hidden]
        if json_mode:
            return self._json({"success": True, "data": [{"name": skill.name, "description": skill.description} for skill in skills]})
        if not skills:
            return "No agent skills found"
        width = max(len(skill.name) for skill in skills)
        return "\n".join(f"  {skill.name:<{width}}  {self._truncate(skill.description, 70)}" for skill in skills)

    def get(self, args: list[str]) -> str:
        # Returns selected agent skill content, optionally including references and templates.
        json_mode = self._json_mode(args)
        full = "--full" in args
        get_all = "--all" in args
        names = [arg for arg in args if not arg.startswith("--")]
        targets = self._select_targets(names, get_all, json_mode)
        if json_mode:
            return self._json({"success": True, "data": [self._skill_to_json(skill, full) for skill in targets]})
        return "\n\n---\n\n".join(self._render_skill(skill, full) for skill in targets)

    def path(self, args: list[str]) -> str:
        # Prints the root agent skill directory or a selected agent skill directory.
        json_mode = self._json_mode(args)
        names = [arg for arg in args if not arg.startswith("--")]
        if not names:
            root = str(self._skills_root)
            if json_mode:
                return self._json({"success": True, "data": {"paths": [root]}})
            return root
        skill = self._find_skill(names[0], json_mode)
        if json_mode:
            return self._json({"success": True, "data": {"name": skill.name, "path": str(skill.directory)}})
        return str(skill.directory)

    def _resolve_skills_root(self) -> Path:
        # Resolves the agent guide root, allowing tests and development to override the bundled directory.
        override = os.environ.get("VIDBYTE_AGENT_SKILLS_DIR")
        if override:
            return Path(override).expanduser().resolve()
        return self._repo_root / "agent-skills"

    def _discover_skills(self) -> list[AgentSkill]:
        # Reads one-level child directories containing SKILL.md files and returns valid agent skill records.
        if not self._skills_root.is_dir():
            return []
        skills = []
        for child in sorted(self._skills_root.iterdir(), key=lambda path: path.name):
            skill = self._read_skill_directory(child)
            if skill is not None:
                skills.append(skill)
        return sorted(skills, key=lambda skill: skill.name)

    def _read_skill_directory(self, directory: Path) -> AgentSkill | None:
        # Parses a single skill directory and returns None for non-skill or malformed directories.
        skill_file = directory / "SKILL.md"
        if not directory.is_dir() or not skill_file.is_file():
            return None
        content = self._read_text(skill_file)
        metadata = self._parse_frontmatter(content)
        name = metadata.get("name", "")
        if not name:
            return None
        return AgentSkill(
            name=name,
            description=metadata.get("description", ""),
            directory=directory,
            skill_file=skill_file,
            hidden=metadata.get("hidden", "").lower() in ("true", "yes"),
        )

    def _parse_frontmatter(self, content: str) -> dict[str, str]:
        # Extracts simple YAML frontmatter values, including indented multiline descriptions.
        stripped = content.lstrip()
        if not stripped.startswith("---"):
            return {}
        marker = stripped.find("\n---", 3)
        if marker == -1:
            return {}
        lines = stripped[3:marker].splitlines()
        values: dict[str, str] = {}
        index = 0
        while index < len(lines):
            line = lines[index]
            if ":" not in line or line.startswith((" ", "\t")):
                index += 1
                continue
            key, raw_value = line.split(":", 1)
            value = raw_value.strip().strip("'\"")
            continuation = []
            while index + 1 < len(lines) and lines[index + 1].startswith((" ", "\t")):
                index += 1
                continuation.append(lines[index].strip())
            if continuation:
                value = " ".join(item for item in [value, *continuation] if item and item not in (">", "|"))
            values[key.strip()] = value
            index += 1
        return values

    def _select_targets(self, names: list[str], get_all: bool, json_mode: bool) -> list[AgentSkill]:
        # Selects visible skills for --all or exact named skills for explicit get requests.
        skills = self._discover_skills()
        if get_all:
            return [skill for skill in skills if not skill.hidden]
        if not names:
            self._raise_error("No skill name provided. Usage: vidbyte agents get <name>", json_mode)
        return [self._find_skill(name, json_mode, skills) for name in names]

    def _find_skill(self, name: str, json_mode: bool, skills: list[AgentSkill] | None = None) -> AgentSkill:
        # Finds an exact skill name or raises a command error with optional JSON formatting.
        for skill in skills or self._discover_skills():
            if skill.name == name:
                return skill
        self._raise_error(f"Skill not found: {name}", json_mode)

    def _render_skill(self, skill: AgentSkill, full: bool) -> str:
        # Renders a skill's Markdown and optionally appends supplementary reference/template files.
        parts = [self._read_text(skill.skill_file)]
        if full:
            for relative_path, content in self._collect_supplementary_files(skill.directory):
                parts.append(f"--- {relative_path} ---\n\n{content}")
        return "\n".join(part.rstrip("\n") for part in parts) + "\n"

    def _skill_to_json(self, skill: AgentSkill, full: bool) -> dict:
        # Converts a skill and optional supplementary files into a stable JSON object.
        data = {"name": skill.name, "content": self._read_text(skill.skill_file)}
        if full:
            files = [{"path": path, "content": content} for path, content in self._collect_supplementary_files(skill.directory)]
            if files:
                data["files"] = files
        return data

    def _collect_supplementary_files(self, skill_dir: Path) -> list[tuple[str, str]]:
        # Collects readable files from references and templates directories in deterministic order.
        files = []
        for subdir_name in ("references", "templates"):
            subdir = skill_dir / subdir_name
            if not subdir.is_dir():
                continue
            for child in sorted(subdir.iterdir(), key=lambda path: path.name):
                if child.is_file():
                    files.append((f"{subdir_name}/{child.name}", self._read_text(child)))
        return files

    def _read_text(self, path: Path) -> str:
        # Reads UTF-8 text while surfacing path-specific failures as command errors.
        return path.read_text(encoding="utf-8")

    def _json_mode(self, args: list[str]) -> bool:
        # Returns whether structured JSON output was requested.
        return "--json" in args

    def _json(self, data: dict) -> str:
        # Serializes command output as compact deterministic JSON.
        return json.dumps(data, separators=(",", ":"))

    def _raise_error(self, message: str, json_mode: bool) -> None:
        # Raises a RuntimeError, optionally formatting the message as a JSON error envelope.
        if json_mode:
            raise RuntimeError(self._json({"success": False, "error": message}))
        raise RuntimeError(message)

    def _truncate(self, text: str, max_length: int) -> str:
        # Shortens long descriptions at a word boundary for compact human list output.
        if len(text) <= max_length:
            return text
        boundary = text.rfind(" ", 0, max_length)
        if boundary <= 0:
            boundary = max_length
        return f"{text[:boundary]}..."
