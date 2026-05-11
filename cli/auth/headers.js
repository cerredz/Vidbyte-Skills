import crypto from "node:crypto";
import { buildCanonicalRequest, sha256Hex, signCanonicalRequest } from "./signature.js";

export function createSignedHeaders({ body, cliVersion, method, path, skillId, skillSecret }) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const bodyHash = sha256Hex(body);
  const canonicalRequest = buildCanonicalRequest({
    bodyHash,
    method,
    nonce,
    path,
    timestamp
  });
  const signature = signCanonicalRequest(canonicalRequest, skillSecret);

  return {
    "Content-Type": "application/json",
    "X-Skill-Id": skillId,
    "X-Skill-Timestamp": timestamp,
    "X-Skill-Nonce": nonce,
    "X-Skill-Body-SHA256": bodyHash,
    "X-Skill-Signature": signature,
    "X-Vidbyte-CLI-Version": cliVersion
  };
}

