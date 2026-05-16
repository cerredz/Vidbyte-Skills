import { parseArgs } from "./cli-options.js";
import {
  installAiderRule,
  installManagedRuleFile,
  installRuleFile,
  installSkillDirectory
} from "./install-actions.js";
import { readInstallEnvironment } from "./install-environment.js";
import {
  reportEmptySkillSource,
  reportInstallComplete,
  reportInstallResult,
  reportInstallStart,
  reportNoTargetsSelected
} from "./install-reporter.js";
import { buildTargets, PLATFORM_IDS } from "./platform-targets.js";
import { discoverSkills, filterSkillsByCategory, readSkillCategories, selectRequestedSkills } from "./skill-catalog.js";
import { validateSkills } from "./skill-validation.js";

export function installVidbyteSkills(argv, category = null) {
  const environment = readInstallEnvironment();
  const options = parseArgs(argv, PLATFORM_IDS);
  const skills = readInstallableSkills(environment, category, options.skillNames);

  if (skills.length === 0) {
    reportEmptySkillSource(environment.skillsRoot);
    return;
  }

  validateSkills(skills);
  installSkillsIntoRequestedTargets(skills, options, environment, category);
}

function readInstallableSkills(environment, category, skillNames) {
  const skills = discoverSkills(environment.skillsRoot);
  let selected = selectRequestedSkills(skills, skillNames);

  if (category) {
    const categories = readSkillCategories(environment.repoRoot);
    selected = filterSkillsByCategory(selected, category, categories);
  }

  return selected;
}

function installSkillsIntoRequestedTargets(skills, options, environment, category) {
  const targets = dedupeTargets(buildTargets(options.platforms, options.scope, environment));

  if (targets.length === 0) {
    reportNoTargetsSelected();
    return;
  }

  reportInstallStart(skills, options, environment.skillsRoot, category);
  installEachTarget(skills, targets, options, environment);
  reportInstallComplete(options.dryRun);
}

function installEachTarget(skills, targets, options, environment) {
  for (const target of targets) {
    installTarget(skills, target, options, environment);
  }
}

function installTarget(skills, target, options, environment) {
  if (target.kind === "skill-dir") {
    installSkillsIntoDirectory(skills, target, options, environment);
    return;
  }

  if (target.kind === "managed-rule-file") {
    writeManagedRuleFileForTarget(skills, target, options.dryRun);
    return;
  }

  if (target.kind === "aider-rule") {
    writeAiderRuleForTarget(skills, target, options.dryRun);
    return;
  }

  writeRuleFileForTarget(skills, target, options.dryRun);
}

function installSkillsIntoDirectory(skills, target, options, environment) {
  for (const skill of skills) {
    const result = installSkillDirectory(skill, target, options.mode, options.dryRun, environment);
    reportInstallResult(target, result);
  }
}

function writeRuleFileForTarget(skills, target, dryRun) {
  const result = installRuleFile(skills, target, dryRun);
  reportInstallResult(target, result);
}

function writeManagedRuleFileForTarget(skills, target, dryRun) {
  const result = installManagedRuleFile(skills, target, dryRun);
  reportInstallResult(target, result);
}

function writeAiderRuleForTarget(skills, target, dryRun) {
  const result = installAiderRule(skills, target, dryRun);
  reportInstallResult(target, result);
}

function dedupeTargets(targets) {
  const seen = new Set();

  return targets.filter((target) => {
    const key = targetKey(target);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function targetKey(target) {
  if (target.kind === "skill-dir") {
    return `${target.kind}:${target.root}`;
  }

  if (target.kind === "aider-rule") {
    return `${target.kind}:${target.conventionsFile}:${target.configFile}`;
  }

  return `${target.kind}:${target.file}`;
}
