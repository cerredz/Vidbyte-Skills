#!/usr/bin/env node
/**
 * Context Protocol
 * Description: npm bin shim for the `vidbyte-skills` command. Routes incoming
 *              argv to the correct handler: auth delegates to the Python CLI,
 *              update delegates to lib/updater.js, and all other invocations
 *              delegate to lib/installer.js for skill installation.
 * Purpose: Single entry point that keeps skill install, auth, and update
 *          concerns separated while sharing the same binary name.
 * Architecture: Sequential argv[0] checks. Auth and update are handled inline
 *              before falling through to the default installVidbyteSkills call.
 * Relations: lib/installer.js (install), lib/updater.js (update), Python cli
 *            module (auth). Listed as a bin entry in package.json.
 * Similar files: bin/vidbyte.js (Python shim), bin/learning.js, bin/reasoning.js.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { installVidbyteSkills } from "../lib/installer.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const argv = process.argv.slice(2);

// ── update ──────────────────────────────────────────────────────────────────
if (argv[0] === "update") {
  (async () => {
    try {
      const { runUpdate } = await import("../lib/updater.js");
      await runUpdate();
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  })();
}

// ── auth ─────────────────────────────────────────────────────────────────────
else if (argv[0] === "auth") {
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

// ── install (default) ────────────────────────────────────────────────────────
else {
  try {
    installVidbyteSkills(argv);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
