OFFICIAL_API_ORIGIN = "https://vidbyte.pro"
DEFAULT_SKILL_ID = "feedback-generator-v1"
DEFAULT_TIMEOUT_MS = 15_000

MAX_OUTBOUND_TEXT_LENGTH = 100_000

API_KEY_PATTERN = r"^vb_live_[a-z0-9]{32,}$"

PROTECTED_SKILL_IDS = {
    "feedback": "feedback",
    "compressor": "compression",
    "retain": "retain",
}
