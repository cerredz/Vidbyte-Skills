import re

MAX_OUTBOUND_TEXT_LENGTH = 100_000

PROMPT_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.IGNORECASE),
    re.compile(r"disregard\s+(all\s+)?(previous|above)\s+instructions", re.IGNORECASE),
    re.compile(r"reveal\s+(the\s+)?(system|developer)\s+prompt", re.IGNORECASE),
    re.compile(r"print\s+(the\s+)?(system|developer)\s+prompt", re.IGNORECASE),
]


def sanitize_outbound_text(value: str) -> str:
    if not isinstance(value, str):
        raise TypeError("Outbound content must be a string.")

    sanitized = value
    sanitized = sanitized.replace("\u0000", "")
    sanitized = sanitized.replace("\r\n", "\n")
    sanitized = sanitized.replace("\r", "\n")

    for pattern in PROMPT_INJECTION_PATTERNS:
        sanitized = pattern.sub("[removed prompt-injection directive]", sanitized)

    if len(sanitized) > MAX_OUTBOUND_TEXT_LENGTH:
        raise ValueError(
            f"Outbound content is too large ({len(sanitized)} characters). "
            f"Limit: {MAX_OUTBOUND_TEXT_LENGTH}."
        )

    return sanitized
