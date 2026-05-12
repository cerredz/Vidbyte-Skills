import secrets
import time

from .signature import SignatureRequest


class HeaderBuilder:
    def __init__(self, *, body: str, cli_version: str, method: str, path: str, skill_id: str, skill_secret: str):
        self._cli_version = cli_version
        self._skill_id = skill_id
        self._timestamp = str(int(time.time()))
        self._nonce = secrets.token_hex(16)
        self._body_hash = SignatureRequest.sha256(body)

        sig = SignatureRequest(
            body_hash=self._body_hash,
            method=method,
            path=path,
            timestamp=self._timestamp,
            nonce=self._nonce,
        )
        self._signature = sig.sign(skill_secret)

    def create(self) -> dict:
        return {
            "Content-Type": "application/json",
            "X-Skill-Id": self._skill_id,
            "X-Skill-Timestamp": self._timestamp,
            "X-Skill-Nonce": self._nonce,
            "X-Skill-Body-SHA256": self._body_hash,
            "X-Skill-Signature": self._signature,
            "X-Vidbyte-CLI-Version": self._cli_version,
        }

    @staticmethod
    def build(*, body: str, cli_version: str, method: str, path: str, skill_id: str, skill_secret: str) -> dict:
        builder = HeaderBuilder(
            body=body,
            cli_version=cli_version,
            method=method,
            path=path,
            skill_id=skill_id,
            skill_secret=skill_secret,
        )
        return builder.create()
