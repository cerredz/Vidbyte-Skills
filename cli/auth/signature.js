import crypto from "node:crypto";

export function sha256Hex(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

export function buildCanonicalRequest({ bodyHash, method, nonce, path, timestamp }) {
  return [
    method.toUpperCase(),
    normalizePath(path),
    timestamp,
    nonce,
    bodyHash
  ].join("\n");
}

export function signCanonicalRequest(canonicalRequest, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(canonicalRequest, "utf8")
    .digest("hex");
}

function normalizePath(path) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with "/": ${path}`);
  }
  return path;
}

