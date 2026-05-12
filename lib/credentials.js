import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CREDENTIALS_DIR = path.join(os.homedir(), ".vidbyte");
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, "credentials");

function ensureDir() {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
}

export function get() {
  try {
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf8"));
  } catch {
    return null;
  }
}

export function store(data) {
  ensureDir();
  const tmp = `${CREDENTIALS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, CREDENTIALS_FILE);
}

export function clear() {
  try {
    fs.unlinkSync(CREDENTIALS_FILE);
  } catch {
    /* already gone */
  }
}

export function token() {
  const cred = get();
  return cred ? cred.token : null;
}

export function resolveSessionToken() {
  const envToken = process.env.VIDBYTE_SESSION_TOKEN;
  if (envToken) return envToken;
  return token();
}
