import secrets
import time

from .signature import build_canonical_request, sha256_hex, sign_canonical_request


def create_signed_headers(*, body: str, cli_version: str, method: str, path: str, skill_id: str, skill_secret: str) -> dict:
    timestamp = str(int(time.time()))
    nonce = secrets.token_hex(16)
    body_hash = sha256_hex(body)
    canonical_request = build_canonical_request(
        body_hash=body_hash,
        method=method,
        nonce=nonce,
        path=path,
        timestamp=timestamp,
    )
    signature = sign_canonical_request(canonical_request, skill_secret)

    return {
        "Content-Type": "application/json",
        "X-Skill-Id": skill_id,
        "X-Skill-Timestamp": timestamp,
        "X-Skill-Nonce": nonce,
        "X-Skill-Body-SHA256": body_hash,
        "X-Skill-Signature": signature,
        "X-Vidbyte-CLI-Version": cli_version,
    }
