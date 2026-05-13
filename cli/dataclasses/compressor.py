import json
from datetime import datetime, timezone
from pathlib import Path


class CompressorPayload:
    __slots__ = ("domain", "conversation_id", "file_name", "content", "generated_at")

    def __init__(self, file_path: str, content: str, domain: str, conversation_id: str):
        self.domain = domain
        self.conversation_id = conversation_id
        self.file_name = Path(file_path).name
        self.content = content
        self.generated_at = datetime.now(timezone.utc).isoformat()

    def to_json(self) -> str:
        return json.dumps({
            "type": "compression-check",
            "domain": self.domain,
            "conversation_id": self.conversation_id,
            "file_name": self.file_name,
            "content": self.content,
            "generated_at": self.generated_at,
        })
