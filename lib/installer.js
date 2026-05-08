import { parseArgs } from "./cli-options.js";
import { installRuleFile, installSkillDirectory } from "./install-actions.js";
import { readInstallEnvironment } from "./install-environment.js";
import {
  reportEmptySkillSource,
  reportInstallComplete,
  reportInstallResult,
  reportInstallStart,
  reportNoTargetsSelected
} from "./install-reporter.js";
import { buildTargets, PLATFORM_IDS } from "./platform-targets.js";
import { discoverSkills, selectRequestedSkills } from "./skill-catalog.js";
import { validateSkills } from "./skill-validation.js";

export function installVidbyteSkills(argv) {
  const environment = readInstallEnvironment();
  const options = parseArgs(argv, PLATFORM_IDS);
  const skills = readInstallableSkills(environment.skillsRoot, options.skillNames);

  if (skills.length === 0) {
    reportEmptySkillSource(environment.skillsRoot);
    return;
  }

  validateSkills(skills);
  installSkillsIntoRequestedTargets(skills, options, environment);
}

function readInstallableSkills(skillsRoot, skillNames) {
  const skills = discoverSkills(skillsRoot);
  return selectRequestedSkills(skills, skillNames);
}

function installSkillsIntoRequestedTargets(skills, options, environment) {
  const targets = buildTargets(options.platforms, options.scope, environment);

  if (targets.length === 0) {
    reportNoTargetsSelected();
    return;
  }

  reportInstallStart(skills, options, environment.skillsRoot);
  installEachTarget(skills, targets, options);
  reportInstallComplete(options.dryRun);
}

function installEachTarget(skills, targets, options) {
  for (const target of targets) {
    installTarget(skills, target, options);
  }
}

function installTarget(skills, target, options) {
  if (target.kind === "skill-dir") {
    installSkillsIntoDirectory(skills, target, options);
    return;
  }

  writeRuleFileForTarget(skills, target, options.dryRun);
}

function installSkillsIntoDirectory(skills, target, options) {
  for (const skill of skills) {
    const result = installSkillDirectory(skill, target, options.mode, options.dryRun);
    reportInstallResult(target, result);
  }
}

function writeRuleFileForTarget(skills, target, dryRun) {
  const result = installRuleFile(skills, target, dryRun);
  reportInstallResult(target, result);
}
