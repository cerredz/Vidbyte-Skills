import json
from datetime import datetime, timezone
from pathlib import Path

from ..client import VidbyteRequestBuilder
from ..helpers import read_package_version, require_option, sanitize_file_content


class CompressorCommand:

    @sanitize_file_content
    def submit(self, options: dict) -> str | None:
        file = require_option(options, "file", "--file")
        content = options["_sanitized_content"]

        payload = json.dumps({
            "type": "compression-check",
            "domain": options.get("domain", "unknown"),
            "conversation_id": options.get("conversation-id", ""),
            "file_name": Path(file).name,
            "content": content,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        })

        builder = VidbyteRequestBuilder(
            body=payload,
            cli_version=read_package_version(),
            endpoint_name="compressor",
            skill_id=options.get("skill-id"),
        )

        if options.get("dry-run"):
            result = builder.dry_run()
            result["file"] = str(Path(file).resolve())
            return json.dumps(result, indent=2)

        response = builder.request()
        url = response.get("url", "")
        if url:
            return f"Check out the full response to your summary on {url}"
        if response.get("message"):
            return response["message"]
        return json.dumps(response)
