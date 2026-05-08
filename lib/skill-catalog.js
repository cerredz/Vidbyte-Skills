import fs from "node:fs";
import path from "node:path";
import { readFrontmatterValue } from "./frontmatter.js";
import { validateRequestedSkillNames } from "./skill-validation.js";

const COLLECTION_SELECTORS = new Set(["default", "reasoning", "reasoning-traces", "all"]);

export function discoverSkills(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) {
    return [];
  }

  return fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter(isSkillDirectory)
    .map((entry) => readSkillDirectory(skillsRoot, entry.name))
    .filter((skill) => fs.existsSync(skill.skillFile))
    .map((skill) => ({ ...skill, ...readSkill(skill.skillFile) }));
}

export function selectRequestedSkills(skills, skillNames) {
  if (skillNames.length === 0) {
    return skills.filter(isDefaultSkill);
  }

  validateRequestedSkillNames(skillNames.filter((skillName) => !COLLECTION_SELECTORS.has(skillName)));

  const requestedSkillNames = skillNames.filter((skillName) => !COLLECTION_SELECTORS.has(skillName));
  assertRequestedSkillsExist(skills, requestedSkillNames);

  return uniqueSkills([
    ...selectCollections(skills, skillNames),
    ...skills.filter((skill) => requestedSkillNames.includes(skill.name))
  ]);
}

export function isReasoningTraceSkill(skill) {
  return /-trace($|-)/.test(skill.name);
}

function isDefaultSkill(skill) {
  return !isReasoningTraceSkill(skill);
}

function selectCollections(skills, skillNames) {
  const selected = [];

  if (skillNames.includes("all")) {
    selected.push(...skills);
  }
  if (skillNames.includes("default")) {
    selected.push(...skills.filter(isDefaultSkill));
  }
  if (skillNames.includes("reasoning") || skillNames.includes("reasoning-traces")) {
    selected.push(...skills.filter(isReasoningTraceSkill));
  }

  return selected;
}

function isSkillDirectory(entry) {
  return entry.isDirectory() && !entry.name.startsWith(".");
}

function readSkillDirectory(skillsRoot, directoryName) {
  const dir = path.join(skillsRoot, directoryName);

  return {
    dir,
    directoryName,
    skillFile: path.join(dir, "SKILL.md")
  };
}

function readSkill(skillFile) {
  const content = fs.readFileSync(skillFile, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return { content, frontmatter: "", body: "", name: "", description: "" };
  }

  return parseSkillFile(content, match);
}

function parseSkillFile(content, match) {
  const [, frontmatter, body] = match;

  return {
    body,
    content,
    description: readFrontmatterValue(frontmatter, "description"),
    frontmatter,
    name: readFrontmatterValue(frontmatter, "name")
  };
}

function assertRequestedSkillsExist(skills, skillNames) {
  const knownNames = new Set(skills.map((skill) => skill.name));
  const missing = skillNames.filter((skillName) => !knownNames.has(skillName));

  if (missing.length > 0) {
    throw new Error(`Unknown skill(s): ${missing.join(", ")}.`);
  }
}

function uniqueSkills(skills) {
  const seen = new Set();
  const unique = [];

  for (const skill of skills) {
    if (!seen.has(skill.name)) {
      seen.add(skill.name);
      unique.push(skill);
    }
  }

  return unique;
}
