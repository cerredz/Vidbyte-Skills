import { createSignedHeaders } from "./auth/headers.js";
import { getAuthConfig, requireSkillSecret } from "./auth/config.js";

export const ENDPOINTS = Object.freeze({
  feedback: "/api/skills/feedback"
});

export async function postToVidbyte({ body, cliVersion, endpointName, skillId }) {
  const endpointPath = ENDPOINTS[endpointName];
  if (!endpointPath) {
    throw new Error(`Unknown Vidbyte endpoint: ${endpointName}`);
  }

  const config = getAuthConfig({ skillId });
  requireSkillSecret(config);

  const response = await fetchWithTimeout(`${config.apiOrigin}${endpointPath}`, {
    body,
    headers: createSignedHeaders({
      body,
      cliVersion,
      method: "POST",
      path: endpointPath,
      skillId: config.skillId,
      skillSecret: config.skillSecret
    }),
    method: "POST"
  }, config.timeoutMs);

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Vidbyte API rejected the request (${response.status}): ${text}`);
  }

  return parseResponse(text);
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parseResponse(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

