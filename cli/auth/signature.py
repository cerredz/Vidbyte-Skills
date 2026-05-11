import hashlib
import hmac


def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def build_canonical_request(*, body_hash: str, method: str, nonce: str, path: str, timestamp: str) -> str:
    return "\n".join([
        method.upper(),
        normalize_path(path),
        timestamp,
        nonce,
        body_hash,
    ])


def sign_canonical_request(canonical_request: str, secret: str) -> str:
    return hmac.new(
        secret.encode("utf-8"),
        canonical_request.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def normalize_path(path: str) -> str:
    if not path.startswith("/"):
        raise ValueError(f'API path must start with "/": {path}')
    return path
