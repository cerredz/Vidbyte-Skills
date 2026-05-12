import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const API_URL = process.env.VIDBYTE_API_URL || "https://vidbyte.pro/api";
const API_TIMEOUT_MS = 10_000;

let _version;

function readVersion() {
  if (_version) return _version;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
    _version = pkg.version;
  } catch {
    _version = "0.0.0";
  }
  return _version;
}

async function apiRequest(method, pathSeg, { bearerToken, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-CLI-Version": readVersion(),
    "X-Platform": process.platform,
    "User-Agent": `vidbyte-skills/${readVersion()} (${process.platform})`
  };
  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const started = Date.now();
  try {
    const res = await fetch(`${API_URL}${pathSeg}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    logRequest(method, pathSeg, res.status, Date.now() - started);

    if (!res.ok) {
      const message = await parseErrorMessage(res);
      const err = new Error(message);
      err.statusCode = res.status;
      throw err;
    }

    if (res.status === 204) return null;
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function parseErrorMessage(res) {
  try {
    const data = await res.json();
    return data.error || `Unexpected response (status ${res.status})`;
  } catch {
    return `Unexpected response (status ${res.status})`;
  }
}

function logRequest(method, pathSeg, status, durationMs) {
  console.error(`[vidbyte] ${method} ${pathSeg} \u2192 ${status} (${durationMs}ms)`);
}

export async function validateApiKey(apiKey) {
  return apiRequest("POST", "/auth/validate", { bearerToken: apiKey });
}

export async function getSessionStatus(sessionToken) {
  return apiRequest("GET", "/auth/session", { bearerToken: sessionToken });
}

export async function revokeSession(sessionToken) {
  return apiRequest("DELETE", "/auth/session", { bearerToken: sessionToken });
}
