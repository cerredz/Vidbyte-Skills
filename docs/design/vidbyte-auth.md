# Design Doc: vidbyte-auth — CLI Authentication & Session Management

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-11
**Last Updated:** 2026-05-11

---

## 1. Overview

Add a `vidbyte-skills auth` subcommand that authenticates a user's CLI installation against the Vidbyte platform backend. The flow exchanges a user-generated API key for a short-lived session token, stores it in a secure credential file (permission-restricted, revocable), and surfaces the authenticated identity to the harness. A companion `/vidbyte-auth` skill prompt orchestrates the high-level UX from inside the coding harness.

Once authenticated, other Vidbyte skills read the session token (or `VIDBYTE_SESSION_TOKEN` in CI/CD) and attach it to backend requests, enabling per-user features: module saving, preference persistence, quota tracking, and account-scoped analytics.

---

## 2. Goals & Non-Goals

### Goals
- Add `vidbyte-skills auth login` — secure terminal prompt (echo-disabled) for API key, backend validation, session token storage
- Add `vidbyte-skills auth logout` — clear stored session and optional server-side revocation
- Add `vidbyte-skills auth status` — report whether authenticated and as whom
- Create `/vidbyte-auth` skill prompt at `skills/vidbyte-auth/SKILL.md`
- Support `VIDBYTE_SESSION_TOKEN` env var for CI/CD (precedence over stored credential)
- Support `VIDBYTE_API_URL` env var to configure backend base URL
- Zero new npm dependencies

### Non-Goals
- OAuth2 browser flow (API key exchange only)
- User registration or API key generation (backend concern)
- Multi-account switching
- Token refresh/rotation beyond the initial exchange
- System keychain integration via native module (keytar) — file-based with strict permissions instead, matching industry CLI practice (npm, docker, aws-cli)

---

## 3. Background & Context

The codebase currently has zero npm dependencies and a single command (`vidbyte-skills install`). All code is plain JavaScript with ES modules, using only Node.js built-ins. Adding authentication is the CLI's first network-calling feature and first stateful operation.

The auth flow follows these security principles:
1. API key never appears in chat or logs — entered in a terminal prompt with echo disabled
2. Session tokens replace API keys after validation — revocable server-side without re-keying
3. Credential file stored at `~/.vidbyte/credentials` with OS-level file permissions (0600 / user-only on Unix; on Windows the directory restricts access by being under the user profile)

---

## 4. Requirements

### Functional Requirements
1. `vidbyte-skills auth login` must display platform URL, open a secure prompt with echo disabled, POST the key to backend, store the session token, and report success
2. `vidbyte-skills auth logout` must clear stored credentials and (best-effort) revoke the session server-side
3. `vidbyte-skills auth status` must report authenticated/not-authenticated with username, email, tier when available
4. The `/vidbyte-auth` skill must instruct the harness to invoke `vidbyte-skills auth login` via a bash tool call
5. Other skills may call `vidbyte-skills auth status` or read the token from env/config to obtain the session token for backend requests
6. `VIDBYTE_SESSION_TOKEN` env var overrides file-based storage when set (CI/CD path)
7. `VIDBYTE_API_URL` env var configures the backend base URL; defaults to `https://vidbyte.pro/api`
8. Client-side format validation: API keys must match `vb_live_[a-z0-9]{32,}` before sending to backend

### Non-Functional Requirements
- **Performance**: Login completes in <3s under normal network conditions
- **Security**: API key never written to disk, never echoed, never in stdout
- **Security**: Session token stored in `~/.vidbyte/credentials` with 0600 permissions (user-read-write only)
- **Reliability**: Backend unreachable → clear error message, exit code 1, no state change
- **Observability**: Network calls logged to stderr with timing; secrets excluded
- **Compatibility**: Node >= 18, Windows 10+, macOS 12+, Linux (glibc)

---

## 5. High-Level Design

### Architecture

```
[Harness] → runs /vidbyte-auth skill
    │
    ▼
[SKILL.md] → tells harness: bash(vidbyte-skills auth login)
    │
    ▼
[bin/install.js] → subcommand router
    │
    ├─ argv[0]="auth" → lib/auth-command.js ─┐
    │                                   │
    │     ┌─────────────────────────────┤
    │     ▼                             ▼
    │  promptSecure()            lib/api-client.js
    │  (echo-disabled stdin)     (fetch() to backend)
    │                                   │
    │     ┌─────────────────────────────┘
    │     ▼
    │  lib/credentials.js
    │  (~/.vidbyte/credentials)
    │
    └─ argv[0]≠"auth" → lib/installer.js (existing, unchanged)
```

### Data Flow — Login

```
1. User runs /vidbyte-auth in harness
2. Harness invokes: vidbyte-skills auth login
3. CLI prints: "Visit https://vidbyte.pro/settings/api-keys to generate an API key"
4. CLI opens echo-disabled prompt, user pastes key (never in chat)
5. CLI validates key format client-side (must match vb_live_[a-z0-9]{32,})
6. CLI calls POST {VIDBYTE_API_URL}/api/auth/validate  { Authorization: Bearer <key> }
7. Backend responds: { token, username, email, tier }
8. CLI writes { token, username, email, tier, authenticatedAt } to ~/.vidbyte/credentials (0600)
9. CLI prints: "Authenticated as {username} ({email}) — {tier} tier"
10. Harness displays success
```

### Key Design Decisions

1. **Subcommand routing in the existing binary**: `bin/install.js` inspects `argv[0]`. `"auth"` → auth; anything else → install (backward compatible).

2. **Two credential tiers**: `VIDBYTE_SESSION_TOKEN` env var takes precedence over file storage. This lets CI/CD bypass the file approach without a dedicated config system.

3. **External keychain not implemented**: Most CLI tools (npm, aws-cli, docker-cli) store credentials in permission-restricted config files. A future upgrade to `keytar` or OS-native credential store is noted in Alternatives.

4. **Client-side key format validation**: API keys follow the `vb_live_` convention. The CLI rejects malformed keys before any network call, reducing load on the auth endpoint.

---

## 6. Detailed Design

### 6.1 Main Entry Point — Subcommand Router

**File(s):** `bin/install.js`
**Type:** Modified

#### What it does
Currently directly calls `installVidbyteSkills()`. Modified to inspect the first positional argument and route to `authCommand()` when the user runs `vidbyte-skills auth ...`.

#### Interface / API
```javascript
#!/usr/bin/env node
import { installVidbyteSkills } from "../lib/installer.js";
import { authCommand, authUsage } from "../lib/auth-command.js";

const argv = process.argv.slice(2);

if (argv[0] === "auth") {
  authCommand(argv.slice(1)).catch((error) => {
    console.error(`auth: ${error.message}`);
    if (error.showUsage) {
      console.error(authUsage());
    }
    process.exit(1);
  });
} else {
  try {
    installVidbyteSkills(argv);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
```

#### Logic / Algorithm
1. Slice `process.argv` past node + script path
2. `argv[0] === "auth"` → destructure `argv.slice(1)` as auth subcommand args
3. Otherwise → `installVidbyteSkills(argv)` (backward compat, no change)
4. Auth path uses `.catch()` because auth is async; install path remains sync

#### Edge Cases & Error Handling
- `vidbyte-skills` with no args: falls through to install (backward compat)
- `vidbyte-skills auth` with no subcommand: treated as `login` (default)
- Unknown auth subcommand: throws with usage hint

---

### 6.2 Auth Command Module

**File(s):** `lib/auth-command.js`
**Type:** New file

#### What it does
Routes `auth login`, `auth logout`, `auth status` to handler functions. Each handler orchestrates credential prompt, backend call, and credential storage.

#### Interface / API
```javascript
export function authUsage() {
  return `Usage: vidbyte-skills auth <login|logout|status>

Commands:
  login    Authenticate with a Vidbyte API key
  logout   Clear stored session
  status   Show current authentication state`;
}

export async function authCommand(argv) {
  const action = argv[0] || "login";

  if (action === "login") return authLogin();
  if (action === "logout") return authLogout();
  if (action === "status") return authStatus();

  const err = new Error(`Unknown auth command: ${action}`);
  err.showUsage = true;
  throw err;
}
```

#### Logic — `authLogin()`
1. Print instructions (backend URL for key generation)
2. Call `promptSecure("Paste your API key: ")`
3. Trim input; if empty, throw with message "No API key provided."
4. Validate key format client-side: must match `vb_live_[a-z0-9]{32,}` — if not, throw "Invalid API key format. Keys start with vb_live_ followed by at least 32 characters."
5. Call `validateApiKey(key)` from `api-client.js`
6. On 2xx: call `credentials.store({ token, username, email, tier, authenticatedAt })`
7. Print: `"Authenticated as {username} ({email}) — {tier} tier"`
8. Set `key` variable to `null` explicitly

#### Logic — `authLogout()`
1. Read credential via `credentials.get()`
2. If no credential: print `"Not authenticated."`
3. If credential exists: call `revokeSession(token)` (best-effort, network errors ignored)
4. Call `credentials.clear()`
5. Print `"Logged out."`

#### Logic — `authStatus()`
1. Check env var: if `VIDBYTE_SESSION_TOKEN` is set → print `"Authenticated via VIDBYTE_SESSION_TOKEN"`
2. Read credential via `credentials.get()`
3. If credential exists: call `getSessionStatus(token)`
   - 200: print `"{username} ({email}) — {tier} tier"` (use local data if backend offline)
   - 401: credential expired → call `credentials.clear()`, print `"Session expired. Run vidbyte-skills auth login to re-authenticate."`
   - Network error: print `"{username} ({email}) — {tier} tier (session status unknown — offline)"`
4. If no credential and no env var: print `"Not authenticated. Run vidbyte-skills auth login."`

#### Edge Cases & Error Handling
- Backend 400: `"Invalid request format."`
- Backend 401: `"Invalid API key. Check you copied it correctly."`
- Backend 403: `"API key has been revoked or expired."`
- Backend 429: `"Too many attempts. Wait and try again."`
- Backend 5xx / network error: `"Unable to reach Vidbyte backend. Check your connection."`
- `promptSecure` called when stdin is not a TTY: `"Authentication requires an interactive terminal. Use VIDBYTE_SESSION_TOKEN instead."`

---

### 6.3 Secure Prompt (private helper in auth-command.js)

**File(s):** `lib/auth-command.js` (module-private function)
**Type:** New (inline)

#### What it does
Reads a line from stdin with terminal echo disabled. The API key is collected directly by the CLI process and never enters the harness or LLM context.

#### Logic / Algorithm
1. Check `process.stdin.isTTY` — if false, check `process.env.VIDBYTE_API_KEY` as fallback; if absent, throw `"Authentication requires an interactive terminal..."`
2. Write prompt text to stdout
3. Set `process.stdin.setRawMode(true)`, resume stdin
4. On each data event:
   - `\r` / `\n` → restore raw mode, print newline, resolve with accumulated input
   - `\x03` (Ctrl+C) → restore raw mode, exit 0
   - `\x7f` (Backspace) → remove last char, write `\b \b` to stdout
   - Other printable → append char, write `*`
5. Return Promise<string>

#### Edge Cases
- Empty input: resolve with `""`
- Non-TTY stdin: throw or fall back to env var
- Backspace on empty buffer: no-op
- Ctrl+C: clean exit with code 0

---

### 6.4 Credential Store

**File(s):** `lib/credentials.js`
**Type:** New file

#### What it does
Provides a simple key-value credential store backed by a JSON file at `~/.vidbyte/credentials`. The file is created with OS-level restrictions (0600 on Unix).

#### Interface / API
```javascript
export function get()      // Returns { token, username, email, tier, authenticatedAt } | null
export function store(data) // Writes data to ~/.vidbyte/credentials
export function clear()     // Deletes ~/.vidbyte/credentials
export function token()     // Returns token string or null (convenience for callers)
```

#### Implementation
```javascript
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CREDENTIALS_DIR = path.join(os.homedir(), ".vidbyte");
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, "credentials");

function ensureDir() {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
}

export function get() {
  try {
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf8"));
  } catch {
    return null;
  }
}

export function store(data) {
  ensureDir();
  const tmp = `${CREDENTIALS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, CREDENTIALS_FILE);
}

export function clear() {
  try { fs.unlinkSync(CREDENTIALS_FILE); } catch { /* already gone */ }
}

export function token() {
  const cred = get();
  return cred ? cred.token : null;
}
```

#### Token Resolution Order

The session token is resolved in this priority:
1. `process.env.VIDBYTE_SESSION_TOKEN` (if non-empty) — CI/CD path
2. `credentials.token()` from file — interactive path
3. `null` — not authenticated

A shared helper `resolveSessionToken()` in this module encapsulates this order.

```javascript
export function resolveSessionToken() {
  const envToken = process.env.VIDBYTE_SESSION_TOKEN;
  if (envToken) return envToken;
  return token();
}
```

#### Edge Cases & Error Handling
- Credentials file missing: `get()` returns `null`
- Credentials file corrupt JSON: `get()` returns `null` (treated as not authenticated)
- Write failure (disk full / permissions): `store()` throws, surfaced to caller
- Concurrent access: not guarded (auth is a single-user, single-process operation)

---

### 6.5 API Client

**File(s):** `lib/api-client.js`
**Type:** New file

#### What it does
Encapsulates all HTTP calls to the Vidbyte backend. Thin wrapper around Node 18+ built-in `fetch`.

#### Interface / API
```javascript
export function validateApiKey(apiKey)        // POST /api/auth/validate  → { token, username, email, tier }
export function getSessionStatus(sessionToken) // GET  /api/auth/session    → { username, email, tier }
export function revokeSession(sessionToken)    // DELETE /api/auth/session  → 204
```

#### Implementation
```javascript
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const API_URL = process.env.VIDBYTE_API_URL || "https://vidbyte.pro/api";
const API_TIMEOUT_MS = 10_000;

let _version;

function readVersion() {
  if (_version) return _version;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
    _version = pkg.version;
  } catch {
    _version = "0.0.0";
  }
  return _version;
}

async function apiRequest(method, path, { bearerToken, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-CLI-Version": readVersion(),
    "X-Platform": process.platform,
    "User-Agent": `vidbyte-skills/${readVersion()} (${process.platform})`
  };
  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const started = Date.now();
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    logRequest(method, path, res.status, Date.now() - started);

    if (!res.ok) {
      const message = await parseErrorMessage(res);
      const err = new Error(message);
      err.statusCode = res.status;
      throw err;
    }

    if (res.status === 204) return null;
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function parseErrorMessage(res) {
  try {
    const data = await res.json();
    return data.error || `Unexpected response (status ${res.status})`;
  } catch {
    return `Unexpected response (status ${res.status})`;
  }
}

function logRequest(method, path, status, durationMs) {
  console.error(`[vidbyte] ${method} ${path} \u2192 ${status} (${durationMs}ms)`);
}
```

#### Logic — `validateApiKey(apiKey)`
1. Call `apiRequest("POST", "/auth/validate", { bearerToken: apiKey })`
2. On 200: return `{ token, username, email, tier }`
3. On 401: throw `"Invalid API key. Check you copied it correctly."` with statusCode 401
4. On other: throw with backend error message

#### Logic — `getSessionStatus(sessionToken)`
1. Call `apiRequest("GET", "/auth/session", { bearerToken: sessionToken })`
2. On 200: return `{ username, email, tier }`
3. On 401: throw `"Session expired"` with statusCode 401

#### Logic — `revokeSession(sessionToken)`
1. Call `apiRequest("DELETE", "/auth/session", { bearerToken: sessionToken })`
2. On 204: return `null`
3. On non-204: throw (will be caught by logout's best-effort wrapper)

#### Edge Cases
- Request timeout (>10s): thrown as AbortError → wrapped as `"Request timed out."`
- DNS failure / network down: thrown as fetch error → wrapped as `"Unable to reach Vidbyte backend. Check your connection."`
- Non-JSON response body: error message defaults to `"Unexpected response (status {code})"`

---

### 6.6 Skill Prompt — /vidbyte-auth

**File(s):** `skills/vidbyte-auth/SKILL.md`
**Type:** New file

#### What it does
When the user runs `/vidbyte-auth` in the harness, this skill instructs the harness to invoke the CLI's `auth login` command via a bash tool call. The skill does NOT instruct the user to type or paste their key into chat.

#### Content
```markdown
---
name: vidbyte-auth
description: Authenticate the CLI with your Vidbyte account to enable account-linked features like saving analysis results and persisting preferences. Run /vidbyte-auth to start.
---

# Vidbyte Auth

Authenticate your local Vidbyte CLI with a Vidbyte platform account.

## Instructions

Tell the user you will authenticate the Vidbyte CLI. Then run the following command in a bash tool:

```
vidbyte-skills auth login
```

Report the output to the user. If it succeeds, the user is now authenticated and account-linked features are available. If it fails, report the error and suggest visiting https://vidbyte.pro/settings/api-keys to generate a new API key.

**Important:** Never ask the user to type or paste their API key into this chat. The CLI handles key input securely through a terminal prompt.
```

#### Verification
- Frontmatter name `vidbyte-auth` matches directory name `vidbyte-auth`
- Name matches `VALID_SKILL_NAME` regex: `/^[a-z0-9]+(-[a-z0-9]+)*$/` → `vidbyte-auth` matches (`vidbyte` + `-` + `auth`)
- Description is non-empty
- Body is non-empty

---

## 7. Data Model Changes

### 7.1 Credential File

**Change type:** New

```json
// ~/.vidbyte/credentials
{
  "token": "vb_ses_a1b2c3d4e5f6...",
  "username": "alice",
  "email": "alice@example.com",
  "tier": "pro",
  "authenticatedAt": "2026-05-11T14:30:00.000Z"
}
```

**Migration strategy:** N/A — new file created on first successful login.

---

## 8. API Changes

### 8.1 POST /auth/validate

**Change type:** External (backend) — documented here as dependency

**Request:**
```
POST {VIDBYTE_API_URL}/auth/validate
Authorization: Bearer vb_live_x1y2z3...
Content-Type: application/json
X-CLI-Version: 0.2.0
X-Platform: win32|darwin|linux
```

**Response (200):**
```json
{
  "token": "vb_ses_a1b2c3d4e5f6...",
  "username": "alice",
  "email": "alice@example.com",
  "tier": "pro"
}
```

**Error cases:**
| Status | Condition |
|--------|-----------|
| 400 | Malformed request |
| 401 | Invalid or expired API key |
| 403 | Key revoked or account suspended |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### 8.2 GET /auth/session

**Change type:** External (backend)

**Request:**
```
GET {VIDBYTE_API_URL}/auth/session
Authorization: Bearer vb_ses_...
```

**Response (200):**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "tier": "pro"
}
```

**Error cases:**
| Status | Condition |
|--------|-----------|
| 401 | Invalid or expired session token |

### 8.3 DELETE /auth/session

**Change type:** External (backend)

**Request:**
```
DELETE {VIDBYTE_API_URL}/auth/session
Authorization: Bearer vb_ses_...
```

**Response:** 204 No Content

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| MODIFY | `bin/install.js` | Add subcommand routing for `auth` |
| CREATE | `lib/auth-command.js` | Auth subcommand logic: login, logout, status + secure prompt |
| CREATE | `lib/credentials.js` | Credential store: read/write/delete `~/.vidbyte/credentials` + token resolution |
| CREATE | `lib/api-client.js` | Backend API calls: validate, session status, revoke |
| CREATE | `skills/vidbyte-auth/SKILL.md` | Skill prompt for `/vidbyte-auth` |
| MODIFY | `package.json` | Bump minor version (0.1.0 → 0.2.0) to reflect new feature |

---

## 10. Testing Plan

### Unit Tests (manual verification via smoke-test.js pattern)
- `describe('credentials')`
  - `it('store() and get() round-trip correctly')`
  - `it('get() returns null when file does not exist')`
  - `it('get() returns null when file is corrupt JSON')`
  - `it('clear() removes file')`
  - `it('resolveSessionToken() prefers env var over file')`
  - `it('resolveSessionToken() returns null when neither source available')`

- `describe('auth-command')`
  - `it('router defaults to login when no subcommand given')`
  - `it('router throws on unknown subcommand')`
  - `it('login rejects when stdin is not TTY and no env fallback')`

- `describe('api-client')`
  - `it('validateApiKey returns token on 200')`
  - `it('validateApiKey throws on 401')`
  - `it('request times out after API_TIMEOUT_MS')`

### Integration Tests (smoke test pattern)
- Run `vidbyte-skills auth login` with a mock backend (or `VIDBYTE_API_URL` pointing to a test endpoint)
- Verify `~/.vidbyte/credentials` file is created with correct content and permissions
- Run `vidbyte-skills auth status` and verify output format
- Run `vidbyte-skills auth logout` and verify file is deleted

### Manual / QA Test Cases
1. Given no credentials, when `vidbyte-skills auth status`, then "Not authenticated"
2. Given interactive terminal, when `vidbyte-skills auth login`, then prompt appears with echo disabled
3. Given valid API key, when prompted, then success message with username, email, tier
4. Given invalid API key, when prompted, then clear error message
5. Given active session, when `vidbyte-skills auth status`, then username/email/tier displayed
6. Given active session, when `vidbyte-skills auth logout`, then credentials cleared
7. Given CI/CD env, when `VIDBYTE_SESSION_TOKEN` is set, then `vidbyte-skills auth status` reports "Authenticated via env"

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Node.js `fetch` | 18+ (built-in) | HTTP calls to backend | None — already required |
| Node.js `fs`, `os`, `path` | 18+ (built-in) | File I/O, config paths | None |
| Vidbyte backend | `https://vidbyte.pro/api` (default) | Auth validation, session management | Backend must expose the three endpoints |
| `package.json` version field | Local file | Read for `X-CLI-Version` header | None |

---

## 12. Rollout & Deployment

- **Feature flag**: N/A — auth is additive and opt-in. Existing install-only usage is unchanged.
- **Breaking change**: No. Running `vidbyte-skills` with no args or `vidbyte-skills my-skill` still triggers the existing install flow.
- **Deployment order**: Publish CLI package to npm; backend endpoints must already exist (or be deployed concurrently).
- **Rollback**: If the auth feature has issues, users can remove `~/.vidbyte/credentials` and continue using the install flow unaffected.
- **Backend not available**: Auth commands fail gracefully with a clear message. The install path is entirely unaffected.

---

## 13. Open Questions

- [x] Backend API base URL: `https://vidbyte.pro/api` (default `VIDBYTE_API_URL`)
- [ ] Session token expiry: TBD by backend implementation (CLI treats any 401 as "expired, re-login")
- [x] API key prefix convention: `vb_live_` — CLI validates format (`vb_live_[a-z0-9]{32,}`) before server call
- [ ] Should `auth status` also display session expiry time if the backend returns it?
- [ ] Tier formatting: TBD by backend

---

## 14. Alternatives Considered

### Alternative 1: Second binary (`vidbyte-auth` as separate entry in `bin`)
- What: Add `"vidbyte-auth": "./bin/auth.js"` to package.json instead of routing through `install.js`
- Why rejected: Would require a second `npm link` or npx command. Single binary with subcommands is the simpler, more conventional DX (like `git`, `npm`, `gh`).

### Alternative 2: keytar for OS-native keychain
- What: Add `keytar` npm dependency for macOS Keychain / Windows Credential Manager / Linux libsecret integration
- Why rejected: Keytar requires native compilation (node-gyp, Python, C++ toolchain) and is fragile on Windows. The codebase has zero dependencies and that's a strength worth preserving. File-based storage with 0600 permissions is what npm, docker, and aws-cli use.

### Alternative 3: Read API key from stdin via readline (not raw mode)
- What: Use Node's `readline.createInterface` with `prompt()` and echo fully disabled
- Why rejected: Node's built-in `readline` does not support disabling echo (the `terminal` option suppresses history but not echo). Raw mode with manual keystroke handling is the only way to do a true password-style prompt with zero dependencies.

### Alternative 4: Pass API key as CLI argument (`vidbyte-skills auth login --key sk_...`)
- What: `vidbyte-skills auth login --key vb_live_abc123`
- Why rejected: This embeds the secret in the shell history and process table (`/proc` / `ps`). The interactive prompt approach is the standard for credential input (`ssh`, `sudo`, `npm login`).

---
