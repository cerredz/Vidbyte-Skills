#!/usr/bin/env node
// Cross-platform runner for the Python CLI smoke test.

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const smokeTest = path.join(REPO_ROOT, "scripts", "cli-smoke-test.py");

const candidates = process.platform === "win32"
  ? ["python", "python3"]
  : ["python3", "python"];

for (const py of candidates) {
  const result = spawnSync(py, [smokeTest], {
    stdio: "inherit",
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  if (result.error) {
    continue;
  }
  process.exit(result.status ?? 1);
}

console.error("Python not found. Please install Python 3 and try again.");
process.exit(1);
