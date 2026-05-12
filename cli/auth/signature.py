import hashlib
import hmac


class SignatureRequest:
    def __init__(self, body_hash: str, method: str, path: str, timestamp: str, nonce: str):
        self.body_hash = body_hash
        self.method = method.upper()
        self.path = self._normalize_path(path)
        self.timestamp = str(timestamp)
        self.nonce = nonce

    @staticmethod
    def sha256(value: str) -> str:
        return hashlib.sha256(value.encode("utf-8")).hexdigest()

    def canonical(self) -> str:
        return "\n".join([
            self.method,
            self.path,
            self.timestamp,
            self.nonce,
            self.body_hash,
        ])

    def sign(self, secret: str) -> str:
        return hmac.new(
            secret.encode("utf-8"),
            self.canonical().encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    @staticmethod
    def _normalize_path(path: str) -> str:
        if not path.startswith("/"):
            raise ValueError(f'API path must start with "/": {path}')
        return path
