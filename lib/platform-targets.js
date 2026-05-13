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
  "roo-code",
  "github-copilot",
  "vscode-copilot",
  "copilot-cli",
  "warp",
  "factory",
  "crush",
  "openclaw",
  "aider",
  "augment-code",
  "auggie",
  "kilo-code",
  "jules",
  "zed",
  "replit-agent",
  "devin",
  "openhands",
  "qwen-code",
  "gemini-memory",
  "jetbrains-ai",
  "junie",
  "kiro",
  "amp",
  "piebald",
  "open-harness",
  "agents-md"
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
  universal: [{ label: "Universal .agents", user: [".agents", "skills"], project: [".agents", "skills"] }],
  "github-copilot": [{ label: "GitHub Copilot", user: [".copilot", "skills"], project: [".github", "skills"] }],
  "vscode-copilot": [{ label: "VS Code Copilot", user: [".copilot", "skills"], project: [".github", "skills"] }],
  "copilot-cli": [{ label: "Copilot CLI", user: [".copilot", "skills"], project: [".github", "skills"] }],
  warp: [{ label: "Warp", user: [".warp", "skills"], project: [".warp", "skills"] }],
  factory: [{ label: "Factory Droid", user: [".factory", "skills"], project: [".factory", "skills"] }],
  crush: [
    { label: "Crush", user: [".config", "crush", "skills"], project: [".crush", "skills"] },
    { label: "Crush Windows", userRoot: "localAppData", user: ["crush", "skills"], when: "win32" }
  ],
  openclaw: [{ label: "OpenClaw", user: [".openclaw", "skills"], project: ["skills"] }]
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

const MANAGED_RULE_FILE_TARGETS = {
  "github-copilot": [{ label: "GitHub Copilot instructions", project: [".github", "copilot-instructions.md"], title: "Vidbyte Skills for GitHub Copilot" }],
  "vscode-copilot": [{ label: "VS Code Copilot instructions", project: [".github", "copilot-instructions.md"], title: "Vidbyte Skills for VS Code Copilot" }],
  warp: [
    { label: "Warp AGENTS.md", user: ["AGENTS.md"], project: ["AGENTS.md"], title: "Vidbyte Skills for Warp" }
  ],
  factory: [
    { label: "Factory AGENTS.md", user: ["AGENTS.md"], project: ["AGENTS.md"], title: "Vidbyte Skills for Factory Droid" }
  ],
  crush: [{ label: "Crush AGENTS.md", project: ["AGENTS.md"], title: "Vidbyte Skills for Crush" }],
  "augment-code": [
    { label: "Augment rules", user: [".augment", "rules", "vidbyte-skills.md"], project: [".augment", "rules", "vidbyte-skills.md"], title: "Vidbyte Skills for Augment Code" },
    { label: "Augment guidelines", project: [".augment-guidelines"], title: "Vidbyte Skills for Augment Code" }
  ],
  auggie: [
    { label: "Auggie rules", user: [".augment", "rules", "vidbyte-skills.md"], project: [".augment", "rules", "vidbyte-skills.md"], title: "Vidbyte Skills for Auggie" }
  ],
  "kilo-code": [
    { label: "Kilo Code instructions", user: [".config", "kilo", "AGENTS.md"], project: ["AGENTS.md"], title: "Vidbyte Skills for Kilo Code" }
  ],
  jules: [{ label: "Jules AGENTS.md", project: ["AGENTS.md"], title: "Vidbyte Skills for Jules" }],
  zed: [{ label: "Zed rules", project: [".rules"], title: "Vidbyte Skills for Zed" }],
  "replit-agent": [{ label: "Replit Agent", project: ["replit.md"], title: "Vidbyte Skills for Replit Agent" }],
  devin: [{ label: "Devin instructions", user: ["AGENTS.md"], project: ["AGENTS.md"], title: "Vidbyte Skills for Devin" }],
  openhands: [{ label: "OpenHands microagent", project: [".openhands", "microagents", "repo.md"], title: "Vidbyte Skills for OpenHands" }],
  "qwen-code": [{ label: "Qwen Code memory", project: ["QWEN.md"], title: "Vidbyte Skills for Qwen Code" }],
  "gemini-memory": [{ label: "Gemini memory", user: ["GEMINI.md"], project: ["GEMINI.md"], title: "Vidbyte Skills for Gemini Memory" }],
  "jetbrains-ai": [{ label: "JetBrains AI instructions", project: ["AGENTS.md"], title: "Vidbyte Skills for JetBrains AI" }],
  junie: [{ label: "Junie guidelines", project: [".junie", "guidelines.md"], title: "Vidbyte Skills for Junie" }],
  kiro: [{ label: "Kiro guidelines", project: [".kiro", "guidelines.md"], title: "Vidbyte Skills for Kiro" }],
  amp: [{ label: "Amp AGENTS.md", project: ["AGENTS.md"], title: "Vidbyte Skills for Amp" }],
  piebald: [{ label: "Piebald AGENTS.md", project: ["AGENTS.md"], title: "Vidbyte Skills for Piebald" }],
  "open-harness": [{ label: "Open harness AGENTS.md", project: ["AGENTS.md"], title: "Vidbyte Skills for Open Harness" }],
  "agents-md": [{ label: "AGENTS.md", user: ["AGENTS.md"], project: ["AGENTS.md"], title: "Vidbyte Skills for AGENTS.md" }]
};

const AIDER_TARGETS = {
  aider: [
    { label: "Aider", user: ["CONVENTIONS.md"], userConfig: [".aider.conf.yml"], project: ["CONVENTIONS.md"], projectConfig: [".aider.conf.yml"], title: "Vidbyte Skills for Aider" }
  ]
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
  const managedTargets = buildManagedRuleFileTargets(platform, scope, environment);
  const aiderTargets = buildAiderTargets(platform, scope, environment);

  if (skillTargets.length > 0 || ruleTargets.length > 0 || managedTargets.length > 0 || aiderTargets.length > 0 || PLATFORM_IDS.includes(platform)) {
    return [...skillTargets, ...ruleTargets, ...managedTargets, ...aiderTargets];
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

function buildSkillDirectoryTargets(platform, scope, environment) {
  return (SKILL_DIRECTORY_TARGETS[platform] || [])
    .filter((target) => target[scope])
    .filter((target) => !target.when || target.when === process.platform)
    .map((target) => skillDirectoryTarget(platform, scope, environment, target));
}

function buildRuleFileTargets(platform, scope, environment) {
  return (RULE_FILE_TARGETS[platform] || [])
    .filter((target) => target[scope])
    .map((target) => ruleFileTarget(platform, scope, environment, target));
}

function buildManagedRuleFileTargets(platform, scope, environment) {
  return (MANAGED_RULE_FILE_TARGETS[platform] || [])
    .filter((target) => target[scope])
    .map((target) => managedRuleFileTarget(platform, scope, environment, target));
}

function buildAiderTargets(platform, scope, environment) {
  return (AIDER_TARGETS[platform] || [])
    .filter((target) => target[scope])
    .map((target) => aiderTarget(platform, scope, environment, target));
}

function skillDirectoryTarget(platform, scope, environment, target) {
  return {
    kind: "skill-dir",
    label: target.label,
    platform,
    root: installPath(environment, scope, target[scope], target[`${scope}Root`]),
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

function managedRuleFileTarget(platform, scope, environment, target) {
  return {
    file: installPath(environment, scope, target[scope], target[`${scope}Root`]),
    kind: "managed-rule-file",
    label: target.label,
    platform,
    scope,
    title: target.title
  };
}

function aiderTarget(platform, scope, environment, target) {
  return {
    configFile: installPath(environment, scope, target[`${scope}Config`]),
    conventionsFile: installPath(environment, scope, target[scope]),
    kind: "aider-rule",
    label: target.label,
    platform,
    scope,
    title: target.title
  };
}

function installPath(environment, scope, parts, rootName) {
  const root = rootName ? environment[rootName] : scopeRoot(environment, scope);
  return path.join(root, ...parts);
}

function scopeRoot(environment, scope) {
  return scope === "user" ? environment.home : environment.projectRoot;
}
