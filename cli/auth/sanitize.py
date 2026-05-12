import re

from ..constants.auth import MAX_OUTBOUND_TEXT_LENGTH


class _BaseSanitizer:
    def sanitize(self, value: str) -> str:
        return value


class _InstructionOverrideSanitizer(_BaseSanitizer):
    PATTERNS = [
        re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.IGNORECASE),
        re.compile(r"disregard\s+(all\s+)?(previous|above|prior)\s+instructions", re.IGNORECASE),
        re.compile(r"forget\s+(all\s+)?(previous|above|prior)\s+instructions", re.IGNORECASE),
        re.compile(r"skip\s+(all\s+)?(previous|above)\s+instructions", re.IGNORECASE),
        re.compile(r"do\s+not\s+follow\s+(your\s+)?(previous|above)\s+instructions", re.IGNORECASE),
        re.compile(r"override\s+(your\s+)?(system|previous|initial)\s+(prompt|instructions)", re.IGNORECASE),
        re.compile(r"you\s+are\s+no\s+longer\s+bound\s+by\s+(your\s+)?(system|previous)\s+(prompt|instructions|rules)", re.IGNORECASE),
        re.compile(r"new\s+instructions?\s*:\s*", re.IGNORECASE),
        re.compile(r"new\s+directives?\s*:\s*", re.IGNORECASE),
        re.compile(r"from\s+now\s+on,\s+you\s+are\s+", re.IGNORECASE),
    ]

    def sanitize(self, value: str) -> str:
        for pattern in self.PATTERNS:
            value = pattern.sub("[removed prompt-injection directive]", value)
        return value


class _SystemPromptExtractionSanitizer(_BaseSanitizer):
    PATTERNS = [
        re.compile(r"(reveal|show|print|display|tell\s+me|echo\s+back)\s+(the\s+)?(system|developer|initial|hidden)\s+(prompt|instructions|message)", re.IGNORECASE),
        re.compile(r"what\s+(were|are)\s+(your|the)\s+(original|initial|system|hidden)\s+(prompt|instructions)", re.IGNORECASE),
        re.compile(r"repeat\s+(back\s+)?(your|the)\s+(system|hidden)\s+(prompt|instructions)", re.IGNORECASE),
        re.compile(r"dump\s+(your|the)\s+(system|hidden)\s+(prompt|instructions)", re.IGNORECASE),
        re.compile(r"output\s+(your|the)\s+(system|developer)\s+(prompt|instructions)", re.IGNORECASE),
        re.compile(r"what\s+does\s+(your|the)\s+system\s+prompt\s+say", re.IGNORECASE),
        re.compile(r"(expose|leak)\s+(your|the)\s+(system|developer|initial)\s+(prompt|instructions)", re.IGNORECASE),
        re.compile(r"show\s+me\s+(the|your)\s+initial\s+(prompt|instructions|message)", re.IGNORECASE),
    ]

    def sanitize(self, value: str) -> str:
        for pattern in self.PATTERNS:
            value = pattern.sub("[removed prompt-injection directive]", value)
        return value


class _RoleManipulationSanitizer(_BaseSanitizer):
    PATTERNS = [
        re.compile(r"you\s+are\s+now\s+(a\s+)?(DAN|jailbreak|evil|unethical|unrestricted|malicious)\b", re.IGNORECASE),
        re.compile(r"(you\s+are|you're)\s+no\s+longer\s+(an?\s+)?(assistant|AI|language\s+model|LLM)", re.IGNORECASE),
        re.compile(r"(pretend|act|pose)\s+as\s+(an?\s+)?(evil|unethical|unrestricted|malicious|developer)", re.IGNORECASE),
        re.compile(r"developer\s+mode\s+(activated|enabled|on)", re.IGNORECASE),
        re.compile(r"you\s+are\s+now\s+in\s+(developer|unrestricted|unfiltered|evil)\s+mode", re.IGNORECASE),
        re.compile(r"pretend\s+you\s+are\s+(an?\s+)?(evil|unethical|unrestricted|malicious|rogue)\s+(AI|assistant|LLM)", re.IGNORECASE),
        re.compile(r"humans?\s+are\s+not\s+in\s+the\s+loop", re.IGNORECASE),
        re.compile(r"do\s+anything\s+now\s+mode", re.IGNORECASE),
    ]

    def sanitize(self, value: str) -> str:
        for pattern in self.PATTERNS:
            value = pattern.sub("[removed prompt-injection directive]", value)
        return value


class _OutputFormatHijackingSanitizer(_BaseSanitizer):
    PATTERNS = [
        re.compile(r"(start|begin)\s+(every|each|all)\s+(response|message|answer|reply|output)\s+with", re.IGNORECASE),
        re.compile(r"(end|finish|conclude)\s+(every|each|all)\s+(response|message|answer|reply|output)\s+with", re.IGNORECASE),
        re.compile(r"(prepend|prefix|append|postfix)\s+(every|all)\s+(response|message|answer|reply|output)\s+with", re.IGNORECASE),
        re.compile(r"respond\s+(only|exclusively)\s+(in|with)\s+the\s+following\s+format", re.IGNORECASE),
        re.compile(r"wrap\s+(all|every)\s+(response|output)\s+in", re.IGNORECASE),
        re.compile(r"(every|all|each)\s+(response|reply|answer|output)\s+must\s+(start|begin|end)\s+with", re.IGNORECASE),
        re.compile(r"always\s+(start|begin|end|prepend|append)\s+(your\s+)?(response|reply|answer)\s+with", re.IGNORECASE),
    ]

    def sanitize(self, value: str) -> str:
        for pattern in self.PATTERNS:
            value = pattern.sub("[removed prompt-injection directive]", value)
        return value


class _DelimiterAttackSanitizer(_BaseSanitizer):
    PATTERNS = [
        re.compile(r"^-{3,}\s*(system|assistant|user|human):?\s*$", re.MULTILINE | re.IGNORECASE),
        re.compile(r"^#{1,3}\s*(system|assistant|instruction)", re.MULTILINE | re.IGNORECASE),
    ]

    def sanitize(self, value: str) -> str:
        for pattern in self.PATTERNS:
            value = pattern.sub("[removed prompt-injection directive]", value)
        return value


class _EncodingSmugglingSanitizer(_BaseSanitizer):
    BASE64_PATTERN = re.compile(r"(?:do\s+|please\s+|you\s+must\s+)?(?:decode|interpret)\s+(?:the\s+following\s+)?(?:as\s+)?(?:base64|b64)\s*[:\-]?\s*(?:it\s+)?(?:and\s+)?(?:respond|answer|execute)", re.IGNORECASE)
    HEX_PATTERN = re.compile(r"(?:do\s+|please\s+|you\s+must\s+)?(?:decode|interpret)\s+(?:the\s+following\s+)?(?:as\s+)?(?:hex|hexadecimal)\s*[:\-]?\s*(?:it\s+)?(?:and\s+)?(?:respond|answer|execute)", re.IGNORECASE)
    ROT13_PATTERN = re.compile(r"(?:do\s+|please\s+|you\s+must\s+)?(?:decode|interpret)\s+(?:the\s+following\s+)?(?:as\s+)?(?:rot13|rot\s*13|caesar)", re.IGNORECASE)
    TASK_ENCODING_PATTERN = re.compile(r"(?:translate|decrypt)\s+(?:the\s+following\s+)?(?:text\s+)?(?:from\s+)?(?:base64|hex|rot13|morse\s+code)", re.IGNORECASE)

    def sanitize(self, value: str) -> str:
        for pattern in [self.BASE64_PATTERN, self.HEX_PATTERN, self.ROT13_PATTERN, self.TASK_ENCODING_PATTERN]:
            value = pattern.sub("[removed prompt-injection directive]", value)
        return value


class _CharacterSanitizer(_BaseSanitizer):
    ZERO_WIDTH = re.compile("[\u200b\u200c\u200d\u200e\u200f\u2060\u2061\u2062\u2063\u2064\uFEFF]")
    BIDI_OVERRIDE = re.compile("[\u202a\u202b\u202c\u202d\u202e]")

    def sanitize(self, value: str) -> str:
        value = self.ZERO_WIDTH.sub("", value)
        value = self.BIDI_OVERRIDE.sub("", value)
        return value


class Sanitizer:
    def __init__(self):
        self._sanitizers = [
            _InstructionOverrideSanitizer(),
            _SystemPromptExtractionSanitizer(),
            _RoleManipulationSanitizer(),
            _OutputFormatHijackingSanitizer(),
            _DelimiterAttackSanitizer(),
            _EncodingSmugglingSanitizer(),
            _CharacterSanitizer(),
        ]

    def sanitize(self, value: str) -> str:
        if not isinstance(value, str):
            raise TypeError("Outbound content must be a string.")

        value = value.replace("\u0000", "")
        value = value.replace("\r\n", "\n")
        value = value.replace("\r", "\n")

        for sanitizer in self._sanitizers:
            value = sanitizer.sanitize(value)

        if len(value) > MAX_OUTBOUND_TEXT_LENGTH:
            raise ValueError(
                f"Outbound content is too large ({len(value)} characters). "
                f"Limit: {MAX_OUTBOUND_TEXT_LENGTH}."
            )

        return value
