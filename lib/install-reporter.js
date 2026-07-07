export function reportInstallStart(skills, options, source, category = "") {
  // Prints the selected skill set and the install configuration before target writes.
  const action = options.dryRun ? "Planning" : "Installing";
  const categoryLabel = category ? `${category} ` : "";
  const skillNames = skills.map((skill) => skill.name).join(", ");
  const selectionLabel = describeSelection(options);

  console.log(`${action} ${skills.length} ${categoryLabel}skill(s) from ${selectionLabel}: ${skillNames}`);
  console.log(`Mode: ${options.mode}; scope: ${options.scope}; source: ${source}`);
}

function describeSelection(options) {
  // Returns the user-facing source of the selected skill set.
  if (options.skillNames.length > 0) {
    return "requested skills";
  }

  return options.version === "all" ? "all skills" : `version ${options.version}`;
}

export function reportInstallResult(target, result) {
  // Prints the install result for one target action.
  const suffix = result.message ? ` (${result.message})` : "";
  console.log(`- ${target.label} [${target.scope}] ${result.action}: ${result.destination}${suffix}`);
}

export function reportInstallComplete(dryRun) {
  // Prints the final install completion status.
  const message = dryRun
    ? "Dry run complete."
    : "Done. Restart or reload your agents if they do not detect skills immediately.";

  console.log(message);
}

export function reportEmptySkillSource(source) {
  // Prints a clear message when no skill folders can be discovered.
  console.log(`No installable skills found in ${source}. Add skills under skills/<name>/SKILL.md.`);
}

export function reportNoTargetsSelected() {
  // Prints a clear message when platform and scope filters resolve no targets.
  console.log("No targets selected for the requested platforms and scope.");
}
