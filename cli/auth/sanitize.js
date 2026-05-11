const MAX_OUTBOUND_TEXT_LENGTH = 100_000;

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /disregard\s+(all\s+)?(previous|above)\s+instructions/gi,
  /reveal\s+(the\s+)?(system|developer)\s+prompt/gi,
  /print\s+(the\s+)?(system|developer)\s+prompt/gi
];

export function sanitizeOutboundText(value) {
  if (typeof value !== "string") {
    throw new Error("Outbound content must be a string.");
  }

  let sanitized = value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[removed prompt-injection directive]");
  }

  if (sanitized.length > MAX_OUTBOUND_TEXT_LENGTH) {
    throw new Error(
      `Outbound content is too large (${sanitized.length} characters). Limit: ${MAX_OUTBOUND_TEXT_LENGTH}.`
    );
  }

  return sanitized;
}

