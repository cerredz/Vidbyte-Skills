import fs from "node:fs";
import path from "node:path";
import { readFrontmatterValue } from "./frontmatter.js";
import { validateRequestedSkillNames } from "./skill-validation.js";

const VALID_CATEGORIES = ["learning", "reasoning"];

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
    return skills;
  }

  validateRequestedSkillNames(skillNames);
  assertRequestedSkillsExist(skills, skillNames);

  return skills.filter((skill) => skillNames.includes(skill.name));
}

export function readSkillCategories(repoRoot) {
  const manifestPath = path.join(repoRoot, "skills-manifest.json");

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`skills-manifest.json not found at ${repoRoot}.`);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to parse skills-manifest.json: ${error.message}`);
  }

  const categories = {};

  for (const category of VALID_CATEGORIES) {
    if (!Array.isArray(manifest[category])) {
      throw new Error(`skills-manifest.json is missing "${category}" array.`);
    }
    categories[category] = new Set(manifest[category]);
  }

  return categories;
}

export function filterSkillsByCategory(skills, category, categories) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Unknown category "${category}". Valid categories: ${VALID_CATEGORIES.join(", ")}.`);
  }

  const categorySet = categories[category];

  return skills.filter((skill) => categorySet.has(skill.name));
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
