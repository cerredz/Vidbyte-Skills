import path from "node:path";

export const PLATFORM_IDS = [
  "claude-code",
  "codex",
  "gemini",
  "opencode",
  "cursor",
  "hermes",
  "universal",
  "windsurf",
  "cline",
  "continue",
  "roo-code"
];

const SKILL_DIRECTORY_TARGETS = {
  "claude-code": [{ label: "Claude Code", user: [".claude", "skills"], project: [".claude", "skills"] }],
  codex: [{ label: "OpenAI Codex", user: [".codex", "skills"], project: [".codex", "skills"] }],
  gemini: [{ label: "Gemini CLI", user: [".gemini", "skills"], project: [".gemini", "skills"] }],
  opencode: [
    { label: "OpenCode", user: [".config", "opencode", "skill"], project: [".opencode", "skill"] },
    { label: "OpenCode compatibility", user: [".config", "opencode", "skills"], project: [".opencode", "skills"] }
  ],
  cursor: [{ label: "Cursor", user: [".cursor", "skills"], project: [".cursor", "skills"] }],
  hermes: [{ label: "Hermes Agent", user: [".hermes", "skills"] }],
  universal: [{ label: "Universal .agents", user: [".agents", "skills"], project: [".agents", "skills"] }]
};

const RULE_FILE_TARGETS = {
  windsurf: [{ label: "Windsurf", project: [".windsurf", "rules", "vidbyte-skills.md"], title: "Vidbyte Skills for Windsurf" }],
  cline: [
    { label: "Cline", user: ["Documents", "Cline", "Rules", "vidbyte-skills.md"], title: "Vidbyte Skills for Cline" },
    { label: "Cline", project: [".clinerules", "vidbyte-skills.md"], title: "Vidbyte Skills for Cline" }
  ],
  continue: [{ label: "Continue", project: [".continue", "rules", "vidbyte-skills.md"], title: "Vidbyte Skills for Continue" }],
  "roo-code": [{ label: "Roo Code", project: [".roo", "rules", "vidbyte-skills.md"], title: "Vidbyte Skills for Roo Code" }]
};

export function buildTargets(platforms, scope, environment) {
  return platforms.flatMap((platform) => {
    return scopesFor(scope).flatMap((activeScope) => targetsFor(platform, activeScope, environment));
  });
}

function scopesFor(scope) {
  return scope === "both" ? ["user", "project"] : [scope];
}

function targetsFor(platform, scope, environment) {
  const skillTargets = buildSkillDirectoryTargets(platform, scope, environment);
  const ruleTargets = buildRuleFileTargets(platform, scope, environment);

  if (skillTargets.length > 0 || ruleTargets.length > 0 || PLATFORM_IDS.includes(platform)) {
    return [...skillTargets, ...ruleTargets];
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

function buildSkillDirectoryTargets(platform, scope, environment) {
  return (SKILL_DIRECTORY_TARGETS[platform] || [])
    .filter((target) => target[scope])
    .map((target) => skillDirectoryTarget(platform, scope, environment, target));
}

function buildRuleFileTargets(platform, scope, environment) {
  return (RULE_FILE_TARGETS[platform] || [])
    .filter((target) => target[scope])
    .map((target) => ruleFileTarget(platform, scope, environment, target));
}

function skillDirectoryTarget(platform, scope, environment, target) {
  return {
    kind: "skill-dir",
    label: target.label,
    platform,
    root: installPath(environment, scope, target[scope]),
    scope
  };
}

function ruleFileTarget(platform, scope, environment, target) {
  return {
    file: installPath(environment, scope, target[scope]),
    kind: "rule-file",
    label: target.label,
    platform,
    scope,
    title: target.title
  };
}

function installPath(environment, scope, parts) {
  const root = scope === "user" ? environment.home : environment.projectRoot;
  return path.join(root, ...parts);
}
