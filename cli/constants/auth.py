OFFICIAL_API_ORIGIN = "https://vidbyte.pro"
DEFAULT_SKILL_ID = "feedback-generator-v1"
DEFAULT_TIMEOUT_MS = 15_000

MAX_OUTBOUND_TEXT_LENGTH = 100_000

# Mirrors the server's accepted key shapes (vb_live_/vb_test_, mixed case) so valid
# keys are never rejected at the local prompt before the server can validate them.
API_KEY_PATTERN = r"^vb_(live|test)_[a-zA-Z0-9]{32,}$"

PROTECTED_SKILL_IDS = {
    "feedback": "feedback",
    "compressor": "compression",
    "retain": "retain",
}
