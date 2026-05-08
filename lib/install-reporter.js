export function reportInstallStart(skills, options, source) {
  const action = options.dryRun ? "Planning" : "Installing";
  const skillNames = skills.map((skill) => skill.name).join(", ");

  console.log(`${action} ${skills.length} skill(s): ${skillNames}`);
  console.log(`Mode: ${options.mode}; scope: ${options.scope}; source: ${source}`);
}

export function reportInstallResult(target, result) {
  console.log(`- ${target.label} [${target.scope}] ${result.action}: ${result.destination}`);
}

export function reportInstallComplete(dryRun) {
  const message = dryRun
    ? "Dry run complete."
    : "Done. Restart or reload your agents if they do not detect skills immediately.";

  console.log(message);
}

export function reportEmptySkillSource(source) {
  console.log(`No installable skills found in ${source}. Add skills under skills/<name>/SKILL.md.`);
}

export function reportNoSkillsSelected() {
  console.log("No default skills selected. Reasoning trace skills are skipped by default; run `vidbyte-skills reasoning` to install them.");
}

export function reportNoTargetsSelected() {
  console.log("No targets selected for the requested platforms and scope.");
}
