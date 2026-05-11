# Vidbyte Skill to CLI to Backend Architecture

This artifact describes how a Vidbyte skill should connect to the local CLI and the official Vidbyte backend without putting security-sensitive behavior inside the prompt layer.

## Core Model

Vidbyte uses three layers with separate responsibilities:

1. Prompt layer: observes or generates structured learning content and writes local artifacts.
2. CLI layer: validates command input, sanitizes outbound content, signs requests, and sends traffic only to the official Vidbyte backend.
3. Backend layer: verifies signatures, rejects replays, validates schemas, enforces rate limits, stores accepted artifacts, and emits audit logs.

The prompt is not a trust boundary. It is text and can be injected, copied, or altered by the model context. The CLI is the first real client-side enforcement point because it executes code outside the prompt. The backend is the final enforcement point because it verifies the request independently.

## Prompt Layer

The prompt layer should do only the work that requires model judgment:

- Infer the session domain.
- Decide whether a user action is feedback-worthy.
- Write structured local files.
- Track recurrence counts and session-level patterns.
- Call the Vidbyte CLI with a local file path when the artifact is complete.

The prompt layer must not:

- Store secrets.
- Construct HMAC signatures.
- Build authentication headers.
- Call `curl` directly for Vidbyte submissions.
- Send requests to arbitrary URLs.
- Treat user-provided content as trusted instructions.

The prompt can raise the bar by wrapping untrusted user content, avoiding direct shell interpolation where possible, and explicitly limiting its external action to the Vidbyte CLI. Those controls are useful, but they are defense in depth rather than the primary security model.

## CLI Layer

The CLI is intentionally thin. Its job is to transform an already-written artifact into a signed backend request. It is implemented in Python and uses only standard library modules — no external dependencies.

Current command:

```bash
vidbyte feedback submit --file <path> --domain <domain> --conversation-id <id>
```

The CLI can also be invoked directly via:

```bash
python3 -m cli feedback submit --file <path> --domain <domain> --conversation-id <id>
```

The CLI performs these steps:

1. Reads the local feedback file.
2. Sanitizes outbound text by removing null bytes, normalizing line endings, applying high-signal prompt-injection replacements, and enforcing a maximum payload size.
3. Builds a JSON payload with artifact metadata.
4. Creates a SHA-256 hash of the request body.
5. Builds a canonical request:

```text
POST
/api/skills/feedback
[timestamp]
[nonce]
[body-sha256]
```

6. Computes an HMAC-SHA256 signature with `VIDBYTE_SKILL_SECRET`.
7. Sends the request to `https://vidbyte.pro` only.

The CLI sends these headers:

```text
Content-Type: application/json
X-Skill-Id
X-Skill-Timestamp
X-Skill-Nonce
X-Skill-Body-SHA256
X-Skill-Signature
X-Vidbyte-CLI-Version
```

Secrets are read from the environment or a local `.env` file. The repo tracks `.env.example` for local setup, and `.gitignore` prevents real `.env` files from being committed.

For production-grade distribution, the same auth boundary can later move from `.env` to an OS keychain-backed first-run flow without changing the prompt contract. The prompt should still call the same CLI command.

## Backend Layer

The backend should treat every request as untrusted until it passes server-side verification. The recommended route structure is shared global middleware plus skill-route middleware.

Global middleware should run on every request:

- HTTPS and transport enforcement.
- Request body size limits.
- IP allow/block intelligence.
- Global rate limiting.
- Circuit breaking.
- Security headers.
- Audit log envelope creation.

Skill-route middleware should run on `/api/skills/*`:

- `X-Skill-Id` lookup.
- Raw-body SHA-256 verification.
- Canonical request reconstruction.
- HMAC verification using constant-time comparison.
- Timestamp window validation.
- Nonce replay prevention with Redis or another low-latency store.
- CLI version checks for critically outdated clients.
- Skill-specific rate limits.
- Payload schema validation.
- Content sanitization before persistence or downstream AI use.

The backend should never trust the CLI's claims about identity or payload integrity by assertion. It should recompute the body hash and signature from the raw request.

## End-to-End Flow

1. User invokes or activates a Vidbyte skill.
2. The skill creates a session artifact in the skills directory.
3. The skill updates the artifact incrementally during the session.
4. At session close, the skill appends any final patterns or summary sections.
5. The skill calls `vidbyte feedback submit --file ...`.
6. The CLI reads and sanitizes the file.
7. The CLI signs the request with a timestamp, nonce, body hash, and HMAC.
8. The backend verifies the request and rejects invalid, stale, replayed, oversized, malformed, or rate-limited traffic.
9. The backend stores the artifact and returns the module URL or status.
10. The CLI prints only the backend result; the skill can append that result to the local artifact if its own persona requires silence.

## Security Invariants

- The prompt never sees the signing secret.
- The signing secret is never committed.
- The CLI never sends Vidbyte skill traffic outside `https://vidbyte.pro`.
- The backend verifies math, not intent.
- Replay protection depends on both timestamp windowing and nonce storage.
- Route-specific middleware extends the global middleware stack instead of duplicating it.
- Open-sourcing the CLI is acceptable because the algorithm is not the secret; the per-installation signing secret is the secret.

## Adding A New Skill Integration

To add another Vidbyte skill that submits backend content:

1. Create `skills/[skill-name]/SKILL.md`.
2. Keep the prompt focused on observation, reasoning, and local artifact creation.
3. Add a CLI command if the existing command does not match the artifact type.
4. Add the endpoint path to `cli/client.py`.
5. Reuse `cli/auth/*` for headers, body hashing, nonce generation, timestamp generation, and HMAC signing.
6. Add a smoke test that exercises the CLI command with `--dry-run`.
7. Add backend route middleware that verifies HMAC, rejects replays, validates the schema, and applies skill-specific rate limits.
8. Document the command in the skill prompt and avoid direct `curl` examples.

This keeps the prompt layer replaceable, the CLI auditable, and the backend authoritative.
