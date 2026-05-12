#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { installVidbyteSkills } from "../lib/installer.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const argv = process.argv.slice(2);

if (argv[0] === "auth") {
  const candidates = process.platform === "win32"
    ? ["python", "python3"]
    : ["python3", "python"];

  for (const py of candidates) {
    const result = spawnSync(py, ["-m", "cli", ...argv], {
      stdio: "inherit",
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    if (result.error) {
      continue;
    }
    process.exit(result.status ?? 1);
  }

  console.error("Python not found. Please install Python 3 to use the Vidbyte CLI.");
  process.exit(1);
}

try {
  installVidbyteSkills(argv);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
