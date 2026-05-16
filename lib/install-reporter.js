export function reportInstallStart(skills, options, source, category = "") {
  const action = options.dryRun ? "Planning" : "Installing";
  const categoryLabel = category ? `${category} ` : "";
  const skillNames = skills.map((skill) => skill.name).join(", ");
  const versionLabel = options.version === "all" ? "all skills" : `version ${options.version}`;

  console.log(`${action} ${skills.length} ${categoryLabel}skill(s) from ${versionLabel}: ${skillNames}`);
  console.log(`Mode: ${options.mode}; scope: ${options.scope}; source: ${source}`);
}

export function reportInstallResult(target, result) {
  const suffix = result.message ? ` (${result.message})` : "";
  console.log(`- ${target.label} [${target.scope}] ${result.action}: ${result.destination}${suffix}`);
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

export function reportNoTargetsSelected() {
  console.log("No targets selected for the requested platforms and scope.");
}
