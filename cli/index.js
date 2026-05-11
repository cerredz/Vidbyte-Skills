#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSignedHeaders } from "./auth/headers.js";
import { getAuthConfig, requireSkillSecret } from "./auth/config.js";
import { postToVidbyte } from "./client.js";
import { sanitizeOutboundText } from "./auth/sanitize.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI_VERSION = readPackageVersion();

main(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function main(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    console.log(usage());
    return;
  }

  const [resource, action, ...rest] = argv;

  if (resource === "feedback" && action === "submit") {
    await submitFeedback(parseOptions(rest));
    return;
  }

  throw new Error(`Unknown command: ${argv.join(" ")}\n\n${usage()}`);
}

async function submitFeedback(options) {
  const file = requireOption(options, "file", "--file");
  const content = sanitizeOutboundText(fs.readFileSync(path.resolve(file), "utf8"));
  const payload = JSON.stringify({
    type: "feedback",
    domain: options.domain || "unknown",
    conversation_id: options["conversation-id"] || "",
    file_name: path.basename(file),
    content,
    generated_at: new Date().toISOString()
  });

  if (options["dry-run"]) {
    const config = getAuthConfig({ skillId: options["skill-id"] });
    requireSkillSecret(config);
    const headers = createSignedHeaders({
      body: payload,
      cliVersion: CLI_VERSION,
      method: "POST",
      path: "/api/skills/feedback",
      skillId: config.skillId,
      skillSecret: config.skillSecret
    });

    console.log(JSON.stringify({
      endpoint: "feedback",
      file: path.resolve(file),
      header_names: Object.keys(headers),
      skill_id: config.skillId,
      bytes: Buffer.byteLength(payload),
      signed: true
    }, null, 2));
    return;
  }

  const response = await postToVidbyte({
    body: payload,
    cliVersion: CLI_VERSION,
    endpointName: "feedback",
    skillId: options["skill-id"]
  });

  console.log(formatResponse(response));
}

function parseOptions(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--dry-run") {
      options["dry-run"] = true;
      continue;
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const inlineSeparator = arg.indexOf("=");
    if (inlineSeparator !== -1) {
      const key = arg.slice(2, inlineSeparator);
      options[key] = arg.slice(inlineSeparator + 1);
      continue;
    }

    const key = arg.slice(2);

    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}.`);
    }
    options[key] = value;
    i += 1;
  }

  return options;
}

function requireOption(options, key, flag) {
  const value = options[key];
  if (!value) {
    throw new Error(`Missing required option ${flag}.`);
  }
  return value;
}

function formatResponse(response) {
  if (response.url) {
    return response.url;
  }
  if (response.message) {
    return response.message;
  }
  return JSON.stringify(response);
}

function readPackageVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  return packageJson.version;
}

function usage() {
  return `Usage: vidbyte <command> [options]

Commands:
  vidbyte feedback submit --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]

Security:
  Requests are sent only to https://vidbyte.pro.
  Set VIDBYTE_SKILL_SECRET in your environment or a local .env file before submitting.
`;
}
