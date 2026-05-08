#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vidbyte-skills-"));
const home = path.join(tempRoot, "home");
const project = path.join(tempRoot, "project");
const skills = path.join(tempRoot, "skills");
const fixtureSkill = path.join(skills, "demo-skill");
const unselectedSkill = path.join(skills, "extra-skill");
const reasoningSkill = path.join(skills, "causal-trace");

fs.mkdirSync(fixtureSkill, { recursive: true });
fs.mkdirSync(unselectedSkill, { recursive: true });
fs.mkdirSync(reasoningSkill, { recursive: true });
fs.mkdirSync(project, { recursive: true });
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
fs.writeFileSync(path.join(reasoningSkill, "SKILL.md"), `---
name: causal-trace
description: Use this fixture skill to verify reasoning trace collection behavior.
---

# Causal Trace

Follow the reasoning fixture instructions.
`);

const result = runInstaller(["demo-skill", "--scope", "both", "--platform", "all"], home, project);

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
  path.join(project, ".agents", "skills", "demo-skill", "SKILL.md")
];

for (const expected of expectedSkillFiles) {
  assert.equal(fs.existsSync(expected), true, `Expected ${expected}`);
}

const unexpectedSkill = path.join(home, ".codex", "skills", "extra-skill", "SKILL.md");
assert.equal(fs.existsSync(unexpectedSkill), false, `Did not expect ${unexpectedSkill}`);

const unexpectedReasoningSkill = path.join(home, ".codex", "skills", "causal-trace", "SKILL.md");
assert.equal(fs.existsSync(unexpectedReasoningSkill), false, `Did not expect ${unexpectedReasoningSkill}`);

const windsurfRule = path.join(project, ".windsurf", "rules", "vidbyte-skills.md");
assert.equal(fs.existsSync(windsurfRule), true, "Expected Windsurf project rule");
assert.match(fs.readFileSync(windsurfRule, "utf8"), /demo-skill/);

const expectedRuleFiles = [
  path.join(home, "Documents", "Cline", "Rules", "vidbyte-skills.md"),
  path.join(project, ".clinerules", "vidbyte-skills.md"),
  path.join(project, ".continue", "rules", "vidbyte-skills.md"),
  path.join(project, ".roo", "rules", "vidbyte-skills.md")
];

for (const expected of expectedRuleFiles) {
  assert.equal(fs.existsSync(expected), true, `Expected ${expected}`);
  assert.match(fs.readFileSync(expected, "utf8"), /demo-skill/);
}

const defaultHome = path.join(tempRoot, "default-home");
const defaultProject = path.join(tempRoot, "default-project");
fs.mkdirSync(defaultProject, { recursive: true });
const defaultResult = runInstaller(["--scope", "user", "--platform", "codex"], defaultHome, defaultProject);
assert.equal(defaultResult.status, 0);
assert.equal(fs.existsSync(path.join(defaultHome, ".codex", "skills", "demo-skill", "SKILL.md")), true);
assert.equal(fs.existsSync(path.join(defaultHome, ".codex", "skills", "extra-skill", "SKILL.md")), true);
assert.equal(fs.existsSync(path.join(defaultHome, ".codex", "skills", "causal-trace", "SKILL.md")), false);

const reasoningHome = path.join(tempRoot, "reasoning-home");
const reasoningProject = path.join(tempRoot, "reasoning-project");
fs.mkdirSync(reasoningProject, { recursive: true });
const reasoningResult = runInstaller(["vidbyte-skill/reasoning", "--scope", "user", "--platform", "codex"], reasoningHome, reasoningProject);
assert.equal(reasoningResult.status, 0);
assert.equal(fs.existsSync(path.join(reasoningHome, ".codex", "skills", "causal-trace", "SKILL.md")), true);
assert.equal(fs.existsSync(path.join(reasoningHome, ".codex", "skills", "demo-skill", "SKILL.md")), false);
assert.equal(fs.existsSync(path.join(reasoningHome, ".codex", "skills", "extra-skill", "SKILL.md")), false);

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log("Smoke test passed.");

function runInstaller(args, vidbyteHome, projectRoot) {
  return spawnSync(process.execPath, [
    path.join(REPO_ROOT, "bin", "install.js"),
    ...args
  ], {
    cwd: projectRoot,
    env: {
      ...process.env,
      VIDBYTE_HOME: vidbyteHome,
      VIDBYTE_PROJECT_ROOT: projectRoot,
      VIDBYTE_SKILLS_SRC: skills
    },
    encoding: "utf8"
  });
}
