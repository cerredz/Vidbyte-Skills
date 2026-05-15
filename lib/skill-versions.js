import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(dirname, "skill-versions.json"), "utf8"));

export const SKILL_VERSIONS = manifest;

export function getSkillsForVersion(version, allSkills) {
  if (version === "all") {
    return allSkills;
  }

  const versionSkills = SKILL_VERSIONS[version];

  if (!versionSkills) {
    const available = Object.keys(SKILL_VERSIONS).join(", ");
    throw new Error(`Unknown version "${version}". Available versions: ${available}, or "all".`);
  }

  const skillNameSet = new Set(versionSkills);
  return allSkills.filter((skill) => skillNameSet.has(skill.name));
}
