#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

const checks = [];

function addCheck(name, fn) {
  checks.push({ name, fn });
}

function read(relativePath) {
  const filePath = path.join(REPO_ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

for (const file of ["README.md", "skills/README.md", "cli/commands/README.md"]) {
  addCheck(`${file} exists`, () => fs.existsSync(path.join(REPO_ROOT, file)));
  addCheck(`${file} is non-empty`, () => read(file).trim().length > 0);
}

addCheck("root README links deeper docs", () => {
  const content = read("README.md");
  return includesAll(content, ["skills/README.md", "cli/commands/README.md"]);
});

addCheck("root README explains package surfaces", () => {
  const content = read("README.md");
  return includesAll(content, ["Vidbyte", "vidbyte-skills", "vidbyte", "Repository Map"]);
});

addCheck("skills README covers catalog categories", () => {
  const content = read("skills/README.md");
  return includesAll(content, ["learning", "reasoning", "utility", "roleplay"]);
});

addCheck("skills README covers structure and validation", () => {
  const content = read("skills/README.md");
  return includesAll(content, ["Role In The Repository", "Design Philosophy", "Usage", "SKILL.md", "skills-manifest.json", "scripts/validate.js", "```"]);
});

addCheck("commands README covers command classes", () => {
  const content = read("cli/commands/README.md");
  return includesAll(content, ["AuthCommand", "FeedbackCommand", "CompressorCommand", "RetainCommand"]);
});

addCheck("commands README covers routing and request boundary", () => {
  const content = read("cli/commands/README.md");
  return includesAll(content, ["Role In The Repository", "Design Philosophy", "Usage", "CommandRouter", "VidbyteRequestBuilder", "--dry-run", "```"]);
});

addCheck("commands README covers security model", () => {
  const content = read("cli/commands/README.md");
  return includesAll(content, ["prompt text is not a trust boundary", "invocation-token", "official Vidbyte origin"]);
});

let passed = 0;

for (const check of checks) {
  let ok = false;
  try {
    ok = Boolean(check.fn());
  } catch {
    ok = false;
  }
  if (ok) {
    passed += 1;
    console.log(`PASS ${check.name}`);
  } else {
    console.log(`FAIL ${check.name}`);
  }
}

console.log(`${passed}/${checks.length} tests passed`);
process.exit(passed === checks.length ? 0 : 1);
