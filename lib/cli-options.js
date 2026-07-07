import { SKILL_GROUPS } from "./skill-groups.js";

export function usage(platformIds) {
  return `Usage: vidbyte-skills [skill-name ...] [options]

Options:
  --scope <user|project|both>       Install scope. Default: user
  --platform <list|all>             Comma-separated platforms. Default: all
  --skill <list>                    Comma-separated skill names. Default: all
  --critical-thinking               Install the curated critical-thinking skills
  --version <number|all>            Skills version to install. Default: 1
  --mode <copy|link>                Copy skills or link them. Default: copy
  --dry-run                         Print planned installs without writing files
  --help                            Show this help

Examples:
  vidbyte-skills
  vidbyte-skills my-skill
  vidbyte-skills --critical-thinking
  vidbyte-skills --version all
  vidbyte-skills --skill my-skill,other-skill --platform codex,claude-code

Platforms:
  ${platformIds.join(", ")}
`;
}

export function parseArgs(argv, platformIds) {
  const options = defaultOptions(platformIds);

  for (let i = 0; i < argv.length; i += 1) {
    i = readArgument(argv, i, options, platformIds);
  }

  validateInstallOptions(options);
  options.skillNames = uniqueValues(options.skillNames);

  return options;
}

function defaultOptions(platformIds) {
  return {
    dryRun: false,
    mode: "copy",
    platforms: [...platformIds],
    scope: "user",
    skillNames: [],
    version: "1"
  };
}

function readArgument(argv, index, options, platformIds) {
  const arg = argv[index];

  if (arg === "--help" || arg === "-h") {
    console.log(usage(platformIds));
    process.exit(0);
  }

  if (arg === "--dry-run") {
    options.dryRun = true;
    return index;
  }

  if (arg === "--critical-thinking") {
    options.skillNames.push(...SKILL_GROUPS.criticalThinking);
    return index;
  }

  return readValuedArgument(argv, index, options, platformIds);
}

function readValuedArgument(argv, index, options, platformIds) {
  const arg = argv[index];
  const readers = optionReaders(platformIds);

  for (const reader of readers) {
    const result = reader(argv, index, options);
    if (result !== undefined) {
      return result;
    }
  }

  return readSkillSelector(arg, index, options, platformIds);
}

function optionReaders(platformIds) {
  return [
    optionReader("--scope", (value, options) => { options.scope = value; }),
    optionReader("--mode", (value, options) => { options.mode = value; }),
    optionReader("--version", (value, options) => { options.version = value; }),
    optionReader("--platform", (value, options) => { options.platforms = parsePlatforms(value, platformIds); }),
    optionReader("--skill", (value, options) => { options.skillNames.push(...parseSkillNames(value)); })
  ];
}

function optionReader(flag, assignValue) {
  return (argv, index, options) => {
    const arg = argv[index];

    if (arg === flag) {
      assignValue(readValue(argv, index + 1, flag), options);
      return index + 1;
    }
    if (arg.startsWith(`${flag}=`)) {
      assignValue(arg.slice(flag.length + 1), options);
      return index;
    }

    return undefined;
  };
}

function readSkillSelector(arg, index, options, platformIds) {
  if (arg.startsWith("--")) {
    throw new Error(`Unknown option: ${arg}\n\n${usage(platformIds)}`);
  }

  options.skillNames.push(...parseSkillNames(arg));
  return index;
}

function readValue(argv, index, flag) {
  const value = argv[index];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function parsePlatforms(value, platformIds) {
  if (value === "all") {
    return [...platformIds];
  }

  const platforms = uniqueValues(value.split(",").map((item) => item.trim()).filter(Boolean));
  const unknown = platforms.filter((item) => !platformIds.includes(item));

  if (unknown.length > 0) {
    throw new Error(`Unknown platform(s): ${unknown.join(", ")}. Valid: ${platformIds.join(", ")}`);
  }

  return platforms;
}

function parseSkillNames(value) {
  return value.split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeSkillSelector);
}

function normalizeSkillSelector(value) {
  const normalized = value.replaceAll("\\", "/");
  return normalized.includes("/") ? normalized.split("/").filter(Boolean).at(-1) : normalized;
}

function validateInstallOptions(options) {
  if (!["user", "project", "both"].includes(options.scope)) {
    throw new Error(`Invalid --scope "${options.scope}". Use user, project, or both.`);
  }
  if (!["copy", "link"].includes(options.mode)) {
    throw new Error(`Invalid --mode "${options.mode}". Use copy or link.`);
  }
  if (!/^\d+$/.test(options.version) && options.version !== "all") {
    throw new Error(`Invalid --version "${options.version}". Use a version number (e.g., '1', '2') or 'all'.`);
  }
}

function uniqueValues(values) {
  return [...new Set(values)];
}
