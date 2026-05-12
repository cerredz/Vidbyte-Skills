import json
from datetime import datetime, timezone
from pathlib import Path

from ..client import VidbyteRequestBuilder
from ..helpers import read_package_version, require_option, format_response, sanitize_file_content


class FeedbackCommand:

    @sanitize_file_content
    def submit(self, options: dict) -> str | None:
        file = require_option(options, "file", "--file")
        content = options["_sanitized_content"]

        payload = json.dumps({
            "type": "feedback",
            "domain": options.get("domain", "unknown"),
            "conversation_id": options.get("conversation-id", ""),
            "file_name": Path(file).name,
            "content": content,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        })

        builder = VidbyteRequestBuilder(
            body=payload,
            cli_version=read_package_version(),
            endpoint_name="feedback",
            skill_id=options.get("skill-id"),
        )

        if options.get("dry-run"):
            result = builder.dry_run()
            result["file"] = str(Path(file).resolve())
            return json.dumps(result, indent=2)

        response = builder.request()
        url = response.get("url", "")
        if url:
            return f"Check out the full feedback breakdown on {url}"
        return format_response(response)
