export function renderRuleDocument(skills, title = "Vidbyte Skills") {
  const sections = skills.map(renderSkillSection);

  return [
    `# ${title}`,
    "",
    "This file was generated from this repository's `skills/` directory.",
    "Use these instructions when the user asks for the named workflow or when the description matches the task.",
    "",
    ...sections
  ].join("\n\n").concat("\n");
}

function renderSkillSection(skill) {
  return [
    `## ${skill.name}`,
    "",
    `Description: ${skill.description}`,
    "",
    skill.body.trim()
  ].join("\n");
}
