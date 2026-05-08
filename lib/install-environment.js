import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

export function readInstallEnvironment() {
  return {
    home: path.resolve(process.env.VIDBYTE_HOME || os.homedir()),
    projectRoot: path.resolve(process.env.VIDBYTE_PROJECT_ROOT || process.cwd()),
    repoRoot: REPO_ROOT,
    skillsRoot: path.resolve(process.env.VIDBYTE_SKILLS_SRC || path.join(REPO_ROOT, "skills"))
  };
}
