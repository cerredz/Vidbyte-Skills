import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OFFICIAL_API_ORIGIN = "https://vidbyte.pro";
const DEFAULT_SKILL_ID = "feedback-generator-v1";
const DEFAULT_TIMEOUT_MS = 15_000;

const AUTH_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(AUTH_DIR, "..", "..");

export function loadLocalEnv() {
  for (const candidate of envFileCandidates()) {
    loadEnvFile(candidate);
  }
}

export function getAuthConfig(overrides = {}) {
  loadLocalEnv();

  return {
    apiOrigin: OFFICIAL_API_ORIGIN,
    skillId: overrides.skillId || process.env.VIDBYTE_SKILL_ID || DEFAULT_SKILL_ID,
    skillSecret: overrides.skillSecret || process.env.VIDBYTE_SKILL_SECRET || "",
    timeoutMs: Number(process.env.VIDBYTE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
  };
}

export function requireSkillSecret(config) {
  if (!config.skillSecret) {
    throw new Error(
      "Missing VIDBYTE_SKILL_SECRET. Set it in your environment or in a local .env file."
    );
  }
}

function envFileCandidates() {
  return uniquePaths([
    path.join(process.cwd(), ".env"),
    path.join(REPO_ROOT, ".env")
  ]);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed || process.env[parsed.key] !== undefined) {
      continue;
    }
    process.env[parsed.key] = parsed.value;
  }
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return undefined;
  }

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex === -1) {
    return undefined;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = unquote(trimmed.slice(separatorIndex + 1).trim());
  return key ? { key, value } : undefined;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function uniquePaths(paths) {
  return [...new Set(paths.map((item) => path.resolve(item)))];
}

