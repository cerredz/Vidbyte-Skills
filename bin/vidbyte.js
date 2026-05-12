#!/usr/bin/env node
// Wrapper that delegates to the Python Vidbyte CLI.
// npm bin shim entry — spawns python -m cli from the repo root.

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const candidates = process.platform === "win32"
  ? ["python", "python3"]
  : ["python3", "python"];

for (const py of candidates) {
  const result = spawnSync(py, ["-m", "cli", ...process.argv.slice(2)], {
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
