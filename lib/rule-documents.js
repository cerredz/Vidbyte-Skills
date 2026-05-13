export const MANAGED_BLOCK_END = "<!-- vidbyte-skills:end -->";
export const MANAGED_BLOCK_START = "<!-- vidbyte-skills:start -->";

export function renderRuleDocument(skills, title = "Vidbyte Skills") {
  const sections = skills.map(renderSkillSection);

  return renderRuleDocumentLines(sections, title).join("\n\n").concat("\n");
}

export function renderManagedRuleBlock(skills, title = "Vidbyte Skills") {
  return [
    MANAGED_BLOCK_START,
    renderRuleDocument(skills, title).trimEnd(),
    MANAGED_BLOCK_END
  ].join("\n");
}

function renderRuleDocumentLines(sections, title) {
  return [
    `# ${title}`,
    "",
    "This file was generated from this repository's `skills/` directory.",
    "Use these instructions when the user asks for the named workflow or when the description matches the task.",
    "",
    ...sections
  ];
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
