#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const SKILLS_SRC = path.resolve(process.env.VIDBYTE_SKILLS_SRC || path.join(REPO_ROOT, "skills"));
const HOME = path.resolve(process.env.VIDBYTE_HOME || os.homedir());
const PROJECT_ROOT = path.resolve(process.env.VIDBYTE_PROJECT_ROOT || process.cwd());
const VALID_SKILL_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const PLATFORM_IDS = [
  "claude-code",
  "codex",
  "gemini",
  "opencode",
  "cursor",
  "hermes",
  "universal",
  "windsurf",
  "cline",
  "continue",
  "roo-code"
];

function usage() {
  return `Usage: vidbyte-skills [options]

Options:
  --scope <user|project|both>       Install scope. Default: user
  --platform <list|all>             Comma-separated platforms. Default: all
  --mode <copy|link>                Copy skills or link them. Default: copy
  --dry-run                         Print planned installs without writing files
  --help                            Show this help

Platforms:
  ${PLATFORM_IDS.join(", ")}
`;
}

function parseArgs(argv) {
  const options = {
    scope: "user",
    platforms: [...PLATFORM_IDS],
    mode: "copy",
    dryRun: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--scope") {
      options.scope = readValue(argv, ++i, "--scope");
      continue;
    }

    if (arg.startsWith("--scope=")) {
      options.scope = arg.slice("--scope=".length);
      continue;
    }

    if (arg === "--platform") {
      options.platforms = parsePlatforms(readValue(argv, ++i, "--platform"));
      continue;
    }

    if (arg.startsWith("--platform=")) {
      options.platforms = parsePlatforms(arg.slice("--platform=".length));
      continue;
    }

    if (arg === "--mode") {
      options.mode = readValue(argv, ++i, "--mode");
      continue;
    }

    if (arg.startsWith("--mode=")) {
      options.mode = arg.slice("--mode=".length);
      continue;
    }

    throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
  }

  if (!["user", "project", "both"].includes(options.scope)) {
    throw new Error(`Invalid --scope "${options.scope}". Use user, project, or both.`);
  }

  if (!["copy", "link"].includes(options.mode)) {
    throw new Error(`Invalid --mode "${options.mode}". Use copy or link.`);
  }

  return options;
}

function readValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }
  return value;
}

function parsePlatforms(value) {
  if (value === "all") {
    return [...PLATFORM_IDS];
  }

  const platforms = value.split(",").map((item) => item.trim()).filter(Boolean);
  const unknown = platforms.filter((item) => !PLATFORM_IDS.includes(item));
  if (unknown.length > 0) {
    throw new Error(`Unknown platform(s): ${unknown.join(", ")}. Valid: ${PLATFORM_IDS.join(", ")}`);
  }

  return [...new Set(platforms)];
}

function discoverSkills(skillsRoot = SKILLS_SRC) {
  if (!fs.existsSync(skillsRoot)) {
    return [];
  }

  return fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => {
      const dir = path.join(skillsRoot, entry.name);
      return {
        dir,
        directoryName: entry.name,
        skillFile: path.join(dir, "SKILL.md")
      };
    })
    .filter((skill) => fs.existsSync(skill.skillFile))
    .map((skill) => ({
      ...skill,
      ...readSkill(skill.skillFile)
    }));
}

function readSkill(skillFile) {
  const content = fs.readFileSync(skillFile, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { content, frontmatter: "", body: "", name: "", description: "" };
  }

  const [, frontmatter, body] = match;
  return {
    content,
    frontmatter,
    body,
    name: readFrontmatterValue(frontmatter, "name"),
    description: readFrontmatterValue(frontmatter, "description")
  };
}

function readFrontmatterValue(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const keyPattern = new RegExp(`^${escapeRegExp(key)}:\\s*(.*)$`);

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(keyPattern);
    if (!match) {
      continue;
    }

    const inline = cleanYamlScalar(match[1]);
    if (inline) {
      return inline;
    }

    const continuation = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const line = lines[j];
      if (/^[A-Za-z0-9_-]+:\s*/.test(line)) {
        break;
      }
      if (/^\s+/.test(line)) {
        continuation.push(line.trim());
      }
    }
    return cleanYamlScalar(continuation.join(" "));
  }

  return "";
}

function cleanYamlScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.replace(/^['"]|['"]$/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateSkills(skills) {
  const errors = [];

  for (const skill of skills) {
    if (!skill.name) {
      errors.push(`${skill.skillFile}: missing frontmatter name`);
    } else if (!VALID_SKILL_NAME.test(skill.name)) {
      errors.push(`${skill.skillFile}: name "${skill.name}" must match ${VALID_SKILL_NAME}`);
    }

    if (!skill.description) {
      errors.push(`${skill.skillFile}: missing frontmatter description`);
    }

    if (skill.name && skill.name !== skill.directoryName) {
      errors.push(`${skill.skillFile}: name "${skill.name}" must match directory "${skill.directoryName}"`);
    }

    if (!skill.body.trim()) {
      errors.push(`${skill.skillFile}: body must not be empty`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Skill validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }
}

function scopesFor(scope) {
  if (scope === "both") {
    return ["user", "project"];
  }
  return [scope];
}

function buildTargets(platforms, scope) {
  const targets = [];
  for (const platform of platforms) {
    for (const activeScope of scopesFor(scope)) {
      targets.push(...targetsFor(platform, activeScope));
    }
  }
  return targets;
}

function targetsFor(platform, scope) {
  const inHome = (...parts) => path.join(HOME, ...parts);
  const inProject = (...parts) => path.join(PROJECT_ROOT, ...parts);
  const skillTarget = (label, root) => ({ kind: "skill-dir", platform, label, scope, root });

  switch (platform) {
    case "claude-code":
      return [skillTarget("Claude Code", scope === "user" ? inHome(".claude", "skills") : inProject(".claude", "skills"))];
    case "codex":
      return [skillTarget("OpenAI Codex", scope === "user" ? inHome(".codex", "skills") : inProject(".codex", "skills"))];
    case "gemini":
      return [skillTarget("Gemini CLI", scope === "user" ? inHome(".gemini", "skills") : inProject(".gemini", "skills"))];
    case "opencode":
      return [
        skillTarget("OpenCode", scope === "user" ? inHome(".config", "opencode", "skill") : inProject(".opencode", "skill")),
        skillTarget("OpenCode compatibility", scope === "user" ? inHome(".config", "opencode", "skills") : inProject(".opencode", "skills"))
      ];
    case "cursor":
      return [skillTarget("Cursor", scope === "user" ? inHome(".cursor", "skills") : inProject(".cursor", "skills"))];
    case "hermes":
      if (scope === "project") {
        return [];
      }
      return [skillTarget("Hermes Agent", inHome(".hermes", "skills"))];
    case "universal":
      return [skillTarget("Universal .agents", scope === "user" ? inHome(".agents", "skills") : inProject(".agents", "skills"))];
    case "windsurf":
      if (scope === "user") {
        return [];
      }
      return [{
        kind: "rule-file",
        platform,
        label: "Windsurf",
        scope,
        file: inProject(".windsurf", "rules", "vidbyte-skills.md"),
        title: "Vidbyte Skills for Windsurf"
      }];
    case "cline":
      return [{
        kind: "rule-file",
        platform,
        label: "Cline",
        scope,
        file: scope === "user"
          ? inHome("Documents", "Cline", "Rules", "vidbyte-skills.md")
          : inProject(".clinerules", "vidbyte-skills.md"),
        title: "Vidbyte Skills for Cline"
      }];
    case "continue":
      if (scope === "user") {
        return [];
      }
      return [{
        kind: "rule-file",
        platform,
        label: "Continue",
        scope,
        file: inProject(".continue", "rules", "vidbyte-skills.md"),
        title: "Vidbyte Skills for Continue"
      }];
    case "roo-code":
      if (scope === "user") {
        return [];
      }
      return [{
        kind: "rule-file",
        platform,
        label: "Roo Code",
        scope,
        file: inProject(".roo", "rules", "vidbyte-skills.md"),
        title: "Vidbyte Skills for Roo Code"
      }];
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function installSkillTarget(skill, target, mode, dryRun) {
  const destination = path.join(target.root, skill.name);
  if (dryRun) {
    return { action: mode, destination };
  }

  fs.mkdirSync(target.root, { recursive: true });
  fs.rmSync(destination, { recursive: true, force: true });

  if (mode === "copy") {
    fs.cpSync(skill.dir, destination, { recursive: true });
  } else {
    const linkType = process.platform === "win32" ? "junction" : "dir";
    fs.symlinkSync(skill.dir, destination, linkType);
  }

  return { action: mode, destination };
}

function installRuleFile(skills, target, dryRun) {
  if (dryRun) {
    return { action: "write", destination: target.file };
  }

  fs.mkdirSync(path.dirname(target.file), { recursive: true });
  fs.writeFileSync(target.file, renderRuleDocument(skills, target.title), "utf8");
  return { action: "write", destination: target.file };
}

function renderRuleDocument(skills, title = "Vidbyte Skills") {
  const sections = skills.map((skill) => {
    const body = skill.body.trim();
    return [
      `## ${skill.name}`,
      "",
      `Description: ${skill.description}`,
      "",
      body
    ].join("\n");
  });

  return [
    `# ${title}`,
    "",
    "This file was generated from this repository's `skills/` directory.",
    "Use these instructions when the user asks for the named workflow or when the description matches the task.",
    "",
    ...sections
  ].join("\n\n").concat("\n");
}

function run() {
  const options = parseArgs(process.argv.slice(2));
  const skills = discoverSkills();

  if (skills.length === 0) {
    console.log(`No installable skills found in ${SKILLS_SRC}. Add skills under skills/<name>/SKILL.md.`);
    return;
  }

  validateSkills(skills);

  const targets = buildTargets(options.platforms, options.scope);
  if (targets.length === 0) {
    console.log("No targets selected for the requested platforms and scope.");
    return;
  }

  console.log(`${options.dryRun ? "Planning" : "Installing"} ${skills.length} skill(s): ${skills.map((skill) => skill.name).join(", ")}`);
  console.log(`Mode: ${options.mode}; scope: ${options.scope}; source: ${SKILLS_SRC}`);

  for (const target of targets) {
    if (target.kind === "skill-dir") {
      for (const skill of skills) {
        const result = installSkillTarget(skill, target, options.mode, options.dryRun);
        console.log(`- ${target.label} [${target.scope}] ${result.action}: ${result.destination}`);
      }
      continue;
    }

    if (target.kind === "rule-file") {
      const result = installRuleFile(skills, target, options.dryRun);
      console.log(`- ${target.label} [${target.scope}] ${result.action}: ${result.destination}`);
    }
  }

  console.log(options.dryRun ? "Dry run complete." : "Done. Restart or reload your agents if they do not detect skills immediately.");
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
