#!/usr/bin/env node
/*
CONTEXT PROTOCOL HEADER
Description: Smoke testing suite for the Vidbyte CLI installation layer.
Purpose: Validates that skill files, global environment configurations, editor integrations, and project instruction hooks are successfully deployed and robust.
Architecture: Node.js execution script spawning sub-processes and utilizing native node:assert/strict libraries for output validations.
Key Functions:
  - Spawns dry-run installers and asserts file output existences under simulated home and project directories.
Relation to Codebase: Serving as a core structural validation executed during local npm testing and repository continuous integration pipelines.
Similar Files: scripts/validate.js, scripts/cli-smoke-test.js.
*/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseScopeArgs } from "../skills/scope/scripts/parse-scope-args.js";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vidbyte-skills-"));
const home = path.join(tempRoot, "home");
const project = path.join(tempRoot, "project");
const skills = path.join(tempRoot, "skills");
const fixtureSkill = path.join(skills, "demo-skill");
const unselectedSkill = path.join(skills, "extra-skill");

fs.mkdirSync(fixtureSkill, { recursive: true });
fs.mkdirSync(unselectedSkill, { recursive: true });
fs.mkdirSync(project, { recursive: true });
fs.writeFileSync(path.join(project, "AGENTS.md"), "Existing project instructions.\n");
fs.writeFileSync(path.join(fixtureSkill, "SKILL.md"), `---
name: demo-skill
description: Use this fixture skill to verify installer behavior.
---

# Demo Skill

Follow the fixture instructions.
`);
fs.writeFileSync(path.join(unselectedSkill, "SKILL.md"), `---
name: extra-skill
description: Use this fixture skill to verify skill selection behavior.
---

# Extra Skill

Follow the extra fixture instructions.
`);

const result = spawnSync(process.execPath, [
  path.join(REPO_ROOT, "bin", "install.js"),
  "demo-skill",
  "--scope",
  "both",
  "--platform",
  "all"
], {
  cwd: project,
  env: {
    ...process.env,
    VIDBYTE_HOME: home,
    VIDBYTE_PROJECT_ROOT: project,
    VIDBYTE_SKILLS_SRC: skills
  },
  encoding: "utf8"
});

if (result.status !== 0) {
  console.error(result.stdout);
  console.error(result.stderr);
}
assert.equal(result.status, 0);

const expectedSkillFiles = [
  path.join(home, ".claude", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".claude", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".codex", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".codex", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".gemini", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".gemini", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".config", "opencode", "skill", "demo-skill", "SKILL.md"),
  path.join(home, ".config", "opencode", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".opencode", "skill", "demo-skill", "SKILL.md"),
  path.join(project, ".opencode", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".cursor", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".cursor", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".hermes", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".agents", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".agents", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".copilot", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".github", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".warp", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".warp", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".factory", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".factory", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".config", "crush", "skills", "demo-skill", "SKILL.md"),
  path.join(project, ".crush", "skills", "demo-skill", "SKILL.md"),
  path.join(home, ".openclaw", "skills", "demo-skill", "SKILL.md"),
  path.join(project, "skills", "demo-skill", "SKILL.md")
];

for (const expected of expectedSkillFiles) {
  assert.equal(fs.existsSync(expected), true, `Expected ${expected}`);
}

const unexpectedSkill = path.join(home, ".codex", "skills", "extra-skill", "SKILL.md");
assert.equal(fs.existsSync(unexpectedSkill), false, `Did not expect ${unexpectedSkill}`);

const windsurfRule = path.join(project, ".windsurf", "rules", "vidbyte-skills.md");
assert.equal(fs.existsSync(windsurfRule), true, "Expected Windsurf project rule");
assert.match(fs.readFileSync(windsurfRule, "utf8"), /demo-skill/);

const expectedRuleFiles = [
  path.join(home, "Documents", "Cline", "Rules", "vidbyte-skills.md"),
  path.join(project, ".clinerules", "vidbyte-skills.md"),
  path.join(project, ".continue", "rules", "vidbyte-skills.md"),
  path.join(project, ".roo", "rules", "vidbyte-skills.md"),
  path.join(home, ".augment", "rules", "vidbyte-skills.md"),
  path.join(project, ".augment", "rules", "vidbyte-skills.md")
];

for (const expected of expectedRuleFiles) {
  assert.equal(fs.existsSync(expected), true, `Expected ${expected}`);
  assert.match(fs.readFileSync(expected, "utf8"), /demo-skill/);
}

const expectedManagedFiles = [
  path.join(project, "AGENTS.md"),
  path.join(home, "AGENTS.md"),
  path.join(project, ".github", "copilot-instructions.md"),
  path.join(project, ".augment-guidelines"),
  path.join(home, ".config", "kilo", "AGENTS.md"),
  path.join(project, ".rules"),
  path.join(project, "replit.md"),
  path.join(project, ".openhands", "microagents", "repo.md"),
  path.join(project, "QWEN.md"),
  path.join(home, "GEMINI.md"),
  path.join(project, "GEMINI.md"),
  path.join(project, ".junie", "guidelines.md"),
  path.join(project, ".kiro", "guidelines.md"),
  path.join(project, "CONVENTIONS.md")
];

for (const expected of expectedManagedFiles) {
  assert.equal(fs.existsSync(expected), true, `Expected ${expected}`);
  const content = fs.readFileSync(expected, "utf8");
  assert.match(content, /vidbyte-skills:start/);
  assert.match(content, /demo-skill/);
}

const agentsContent = fs.readFileSync(path.join(project, "AGENTS.md"), "utf8");
assert.match(agentsContent, /Existing project instructions\./);
assert.equal((agentsContent.match(/vidbyte-skills:start/g) || []).length, 1);
assert.equal((agentsContent.match(/vidbyte-skills:end/g) || []).length, 1);

const aiderConfig = path.join(project, ".aider.conf.yml");
assert.equal(fs.existsSync(aiderConfig), true, "Expected Aider config");
assert.match(fs.readFileSync(aiderConfig, "utf8"), /CONVENTIONS\.md/);

const selfCopyRoot = path.join(tempRoot, "self-copy-project");
const selfCopySkills = path.join(selfCopyRoot, "skills");
const selfCopySkill = path.join(selfCopySkills, "demo-skill");
fs.mkdirSync(selfCopySkill, { recursive: true });
fs.writeFileSync(path.join(selfCopySkill, "SKILL.md"), fs.readFileSync(path.join(fixtureSkill, "SKILL.md"), "utf8"));

const selfCopyResult = spawnSync(process.execPath, [
  path.join(REPO_ROOT, "bin", "install.js"),
  "demo-skill",
  "--scope",
  "project",
  "--platform",
  "openclaw"
], {
  cwd: selfCopyRoot,
  env: {
    ...process.env,
    VIDBYTE_HOME: home,
    VIDBYTE_PROJECT_ROOT: selfCopyRoot,
    VIDBYTE_SKILLS_SRC: selfCopySkills
  },
  encoding: "utf8"
});

if (selfCopyResult.status !== 0) {
  console.error(selfCopyResult.stdout);
  console.error(selfCopyResult.stderr);
}
assert.equal(selfCopyResult.status, 0);
assert.match(selfCopyResult.stdout, /skip:/);
assert.equal(fs.existsSync(path.join(selfCopySkill, "SKILL.md")), true, "Expected self-copy source skill to survive");

// Unit tests for /scope parseScopeArgs helper
console.log("Running unit tests for parseScopeArgs...");
const parsed1 = parseScopeArgs(["distributed", "systems", "--depth", "deep", "--focus", "databases"]);
assert.equal(parsed1.cleanInput, "distributed systems");
assert.equal(parsed1.depth, "deep");
assert.equal(parsed1.focus, "databases");

const parsed2 = parseScopeArgs(["philosophy", "-d", "high-level", "-f", "ethics"]);
assert.equal(parsed2.cleanInput, "philosophy");
assert.equal(parsed2.depth, "high-level");
assert.equal(parsed2.focus, "ethics");

const parsed3 = parseScopeArgs(null);
assert.equal(parsed3.cleanInput, "");
assert.equal(parsed3.depth, "high-level");
assert.equal(parsed3.focus, "");
console.log("parseScopeArgs unit tests passed.");

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log("Smoke test passed.");
