import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

export function readInstallEnvironment() {
  const home = path.resolve(process.env.VIDBYTE_HOME || os.homedir());

  return {
    home,
    localAppData: readLocalAppData(home),
    projectRoot: path.resolve(process.env.VIDBYTE_PROJECT_ROOT || process.cwd()),
    repoRoot: REPO_ROOT,
    skillsRoot: path.resolve(process.env.VIDBYTE_SKILLS_SRC || path.join(REPO_ROOT, "skills"))
  };
}

function readLocalAppData(home) {
  if (process.env.VIDBYTE_LOCAL_APP_DATA) {
    return path.resolve(process.env.VIDBYTE_LOCAL_APP_DATA);
  }

  if (process.platform === "win32") {
    return path.resolve(process.env.LOCALAPPDATA || path.join(home, "AppData", "Local"));
  }

  return path.join(home, ".local", "share");
}
