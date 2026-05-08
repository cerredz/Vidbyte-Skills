export const VALID_SKILL_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateSkills(skills) {
  const errors = skills.flatMap(validateSkill);

  if (errors.length > 0) {
    throw new Error(`Skill validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }
}

export function validateRequestedSkillNames(skillNames) {
  const invalidNames = skillNames.filter((name) => !VALID_SKILL_NAME.test(name));

  if (invalidNames.length > 0) {
    throw new Error(`Invalid skill name(s): ${invalidNames.join(", ")}. Use lowercase hyphen-case names.`);
  }
}

function validateSkill(skill) {
  const errors = [];

  requireSkillName(skill, errors);
  requireDescription(skill, errors);
  requireBody(skill, errors);

  return errors;
}

function requireSkillName(skill, errors) {
  if (!skill.name) {
    errors.push(`${skill.skillFile}: missing frontmatter name`);
  } else if (!VALID_SKILL_NAME.test(skill.name)) {
    errors.push(`${skill.skillFile}: name "${skill.name}" must match ${VALID_SKILL_NAME}`);
  } else if (skill.name !== skill.directoryName) {
    errors.push(`${skill.skillFile}: name "${skill.name}" must match directory "${skill.directoryName}"`);
  }
}

function requireDescription(skill, errors) {
  if (!skill.description) {
    errors.push(`${skill.skillFile}: missing frontmatter description`);
  }
}

function requireBody(skill, errors) {
  if (!skill.body.trim()) {
    errors.push(`${skill.skillFile}: body must not be empty`);
  }
}
