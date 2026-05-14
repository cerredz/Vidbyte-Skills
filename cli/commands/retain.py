import json

from ..auth.sanitize import Sanitizer
from ..client import VidbyteRequestBuilder
from ..helpers import format_response, read_package_version
from ..dataclasses.retain import RetainModule, RetainPayload, _ALLOWED_OPTIONS, DEFAULT_RETAIN_SKILL_ID


class RetainCommand:

    def __init__(self, options: dict):
        sanitized = self._sanitize(options)
        self._reject_unknown(sanitized)
        self._module = RetainModule(sanitized)
        self._dry_run = sanitized.get("dry-run", False)

    def submit(self) -> str | None:
        payload = RetainPayload(self._module)

        builder = VidbyteRequestBuilder(
            body=payload.to_json(),
            cli_version=read_package_version(),
            endpoint_name="retain",
            skill_id=payload.skill_id,
        )

        if self._dry_run:
            result = builder.dry_run()
            result["validated"] = True
            result["concept_count"] = len(self._module.concepts)
            result["question_count"] = len(self._module.questions)
            result["problem_count"] = len(self._module.problems)
            result["review_count"] = len(self._module.reviews)
            return json.dumps(result, indent=2)

        response = builder.request() or {}
        url = response.get("url", "")
        if url:
            return f"Your retention exercise is ready on {url}"
        return format_response(response)

    @staticmethod
    def _sanitize(options: dict) -> dict:
        sanitizer = Sanitizer()
        sanitized = {}
        for key, value in options.items():
            if value is True or not isinstance(value, str):
                sanitized[key] = value
                continue
            cleaned = sanitizer.sanitize(value).strip()
            if cleaned:
                sanitized[key] = cleaned
        return sanitized

    @staticmethod
    def _reject_unknown(options: dict) -> None:
        unknown = sorted(key for key in options if key not in _ALLOWED_OPTIONS)
        if unknown:
            raise RuntimeError(f"Unknown retain option(s): {', '.join('--' + key for key in unknown)}.")
