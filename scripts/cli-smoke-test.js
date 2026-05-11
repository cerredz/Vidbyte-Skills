#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vidbyte-cli-"));
const feedbackFile = path.join(tempRoot, "feedback-log.md");

fs.writeFileSync(feedbackFile, "# Feedback\n\nNo substantive feedback points were identified.\n");

const result = spawnSync(process.execPath, [
  path.join(REPO_ROOT, "cli", "index.js"),
  "feedback",
  "submit",
  "--file",
  feedbackFile,
  "--domain",
  "software-engineering",
  "--conversation-id",
  "test-conversation",
  "--dry-run"
], {
  cwd: tempRoot,
  env: {
    ...process.env,
    VIDBYTE_SKILL_SECRET: "test-secret"
  },
  encoding: "utf8"
});

if (result.status !== 0) {
  console.error(result.stdout);
  console.error(result.stderr);
}

assert.equal(result.status, 0);
const dryRun = JSON.parse(result.stdout);
assert.equal(dryRun.endpoint, "feedback");
assert.equal(dryRun.skill_id, "feedback-generator-v1");
assert.equal(dryRun.signed, true);
assert.equal(dryRun.file, feedbackFile);
assert.deepEqual(dryRun.header_names, [
  "Content-Type",
  "X-Skill-Id",
  "X-Skill-Timestamp",
  "X-Skill-Nonce",
  "X-Skill-Body-SHA256",
  "X-Skill-Signature",
  "X-Vidbyte-CLI-Version"
]);

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log("CLI smoke test passed.");
