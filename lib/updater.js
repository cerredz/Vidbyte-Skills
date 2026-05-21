/**
 * Context Protocol
 * Description: Update module that fetches the latest published version of
 *              vidbyte-skills from npm and reinstalls all skills if the
 *              installed version is outdated.
 * Purpose: Powers the `vidbyte-skills update` CLI command so users can
 *          keep their skill library current with a single command rather
 *          than re-running the full installer manually.
 * Architecture: Three sequential steps — (1) read current version from
 *               package.json, (2) fetch latest version from the npm registry
 *               using the built-in fetch API, (3) if outdated shell out to
 *               `npm install -g vidbyte-skills@latest` then call
 *               installVidbyteSkills to reinstall into all harnesses.
 * Relations: Called by bin/install.js when argv[0] === "update".
 *            Uses lib/installer.js (installVidbyteSkills) after update.
 * Similar files: lib/installer.js (install logic), bin/install.js (entrypoint).
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const PACKAGE_NAME = "vidbyte-skills";
const NPM_REGISTRY_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;

/**
 * Entry point for the `vidbyte-skills update` command.
 * Checks the npm registry, exits early if already up to date,
 * or installs the latest version and reinstalls all skills.
 */
export async function runUpdate() {
  const currentVersion = readCurrentVersion();
  console.log(`Current version: ${currentVersion}`);
  console.log("Checking for updates...");

  let latestVersion;
  try {
    latestVersion = await fetchLatestVersion();
  } catch (err) {
    throw new Error(
      `Could not reach the npm registry. Check your internet connection.\n${err.message}`
    );
  }

  if (currentVersion === latestVersion) {
    console.log(`Already up to date (${currentVersion}).`);
    return;
  }

  console.log(`New version available: ${latestVersion}. Updating...`);
  installLatest();
  await reinstallSkills();
  console.log(`\nUpdated to ${latestVersion}. Skills reinstalled across all targets.`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readCurrentVersion() {
  const pkgPath = path.join(REPO_ROOT, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  return pkg.version;
}

async function fetchLatestVersion() {
  const response = await fetch(NPM_REGISTRY_URL);
  if (!response.ok) {
    throw new Error(`npm registry responded with status ${response.status}.`);
  }
  const data = await response.json();
  return data.version;
}

function installLatest() {
  // Use npm.cmd on Windows so spawnSync can find the npm shim.
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(
    npm,
    ["install", "--global", `${PACKAGE_NAME}@latest`],
    { stdio: "inherit", encoding: "utf8" }
  );

  if (result.error) {
    throw new Error(
      `Failed to run npm. Make sure npm is installed and in your PATH.\n${result.error.message}`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `npm install exited with code ${result.status}. ` +
        `Try running manually: npm install --global ${PACKAGE_NAME}@latest`
    );
  }
}

async function reinstallSkills() {
  // Dynamic import keeps the updater decoupled; installer is resolved at
  // call-time, after npm has placed the new package in the global prefix.
  const { installVidbyteSkills } = await import("./installer.js");
  installVidbyteSkills([]);
}
