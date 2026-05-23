import hashlib
import json
from dataclasses import dataclass
from uuid import uuid4


@dataclass(frozen=True)
class InvocationRequest:
    method: str
    path: str
    skill_id: str
    body_sha256: str
    request_nonce: str
    installation_id: str

    @classmethod
    def for_body(cls, *, body: str, method: str, path: str, skill_id: str, installation_id: str) -> "InvocationRequest":
        return cls(
            method=method.upper(),
            path=path,
            skill_id=skill_id,
            body_sha256=hashlib.sha256(body.encode("utf-8")).hexdigest(),
            request_nonce=str(uuid4()),
            installation_id=installation_id,
        )

    def to_json(self) -> str:
        return json.dumps(
            {
                "method": self.method,
                "path": self.path,
                "skill_id": self.skill_id,
                "body_sha256": self.body_sha256,
                "request_nonce": self.request_nonce,
                "installation_id": self.installation_id,
            },
            separators=(",", ":"),
            sort_keys=True,
        )
