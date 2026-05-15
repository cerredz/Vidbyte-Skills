#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const SKILLS_DIR = path.join(REPO_ROOT, "skills");
const VALID_SKILL_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function main() {
  const errors = [];

  if (!fs.existsSync(SKILLS_DIR)) {
    errors.push("Missing skills/ directory.");
  } else {
    const skills = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => !entry.name.startsWith("."));

    for (const entry of skills) {
      validateSkill(entry.name, errors);
    }
  }

  for (const required of ["package.json", "bin/install.js", "README.md", "artifacts/research.md", "artifacts/architecture.md"]) {
    if (!fs.existsSync(path.join(REPO_ROOT, required))) {
      errors.push(`Missing ${required}.`);
    }
  }

  validateVersionManifest(errors);

  if (errors.length > 0) {
    console.error(`Validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
    process.exit(1);
  }

  console.log("Validation passed.");
}

function validateSkill(directoryName, errors) {
  const skillFile = path.join(SKILLS_DIR, directoryName, "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    errors.push(`skills/${directoryName} is missing SKILL.md.`);
    return;
  }

  const content = fs.readFileSync(skillFile, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    errors.push(`${relative(skillFile)} must start with YAML frontmatter.`);
    return;
  }

  const [, frontmatter, body] = match;
  const name = readFrontmatterValue(frontmatter, "name");
  const description = readFrontmatterValue(frontmatter, "description");

  if (!name) {
    errors.push(`${relative(skillFile)} is missing frontmatter name.`);
  } else if (!VALID_SKILL_NAME.test(name)) {
    errors.push(`${relative(skillFile)} name must match ${VALID_SKILL_NAME}.`);
  } else if (name !== directoryName) {
    errors.push(`${relative(skillFile)} name must match its directory.`);
  }

  if (!description) {
    errors.push(`${relative(skillFile)} is missing frontmatter description.`);
  }

  if (!body.trim()) {
    errors.push(`${relative(skillFile)} body must not be empty.`);
  }
}

function readFrontmatterValue(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const keyPattern = new RegExp(`^${key}:\\s*(.*)$`);

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
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function validateVersionManifest(errors) {
  const manifestPath = path.join(REPO_ROOT, "lib", "skill-versions.json");
  if (!fs.existsSync(manifestPath)) {
    errors.push("Missing lib/skill-versions.json.");
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    errors.push(`lib/skill-versions.json: invalid JSON — ${error.message}`);
    return;
  }

  for (const [version, skillNames] of Object.entries(manifest)) {
    if (!/^\d+$/.test(version)) {
      errors.push(`lib/skill-versions.json: version key "${version}" must be a numeric string.`);
    }
    if (!Array.isArray(skillNames)) {
      errors.push(`lib/skill-versions.json: version ${version} value must be an array.`);
      continue;
    }
    for (const name of skillNames) {
      if (!VALID_SKILL_NAME.test(name)) {
        errors.push(`lib/skill-versions.json: version ${version} references "${name}" which is not a valid skill name.`);
      }
      const skillFile = path.join(SKILLS_DIR, name, "SKILL.md");
      if (!fs.existsSync(skillFile)) {
        errors.push(`lib/skill-versions.json: version ${version} references "${name}" but skills/${name}/SKILL.md does not exist.`);
      }
    }
  }
}

function relative(file) {
  return path.relative(REPO_ROOT, file).replaceAll("\\", "/");
}

main();
