# Design Doc: Skills Secure Account Linkage & Integration Hardening

**Status:** Draft
**Author:** Claude
**Created:** 2026-06-25
**Last Updated:** 2026-06-25

> This design doc is shared across **two pull requests** because the change spans two
> repositories that are halves of one trust boundary:
>
> - **PR A — `cerredz/Vidbyte`** (backend + next-app): branch `feat/skills-secure-account-linkage`
> - **PR B — `cerredz/Vidbyte-Skills`** (the CLI): branch `feat/cli-credential-hardening`
>
> Read Section 14 ("Summary of the Entire Secure System") first if you want the
> end-to-end mental model before the change-by-change detail.

---

## 1. Overview

Today a Vidbyte CLI learning skill (e.g. `retain`) authenticates the user, mints a
single-use body-bound token, and writes a learning artifact to the backend — but the
**artifact it stores is anonymous**: the proven `user_id` is dropped before the document
is persisted. As a result we cannot attribute artifacts to accounts, cannot enforce
per-user access to "private" artifacts (retain), cannot feed the user knowledge graph,
and cannot build per-user pages. At the same time the surrounding controls lean on
client-supplied data (the client IP header, the CLI's own sanitizer, a self-asserted
installation id) and store/log a long-lived session token in plaintext.

This change makes learning artifacts **genuinely account-linked and access-controlled**,
and hardens the weakest links in the prompt → CLI → backend path so that the security
properties we *think* we have are actually enforced server-side. It is the foundation
that the SEO/pSEO, nicer-UI, and knowledge-graph initiatives all sit on top of.

---

## 2. Goals & Non-Goals

### Goals
- **Attribute every learning artifact to the authenticated `user_id` at rest** (the
  enabling change for knowledge-graph signal, per-user pages, and access control).
- **Enforce owner-scoped access to retain artifacts** so a leaked/guessed URL plus the
  shared viewer secret is not sufficient to read another user's private artifact.
- **Stop storing and logging the session token in plaintext** — store only its hash and
  keep raw tokens out of the audit log.
- **Stop trusting client-supplied IP headers blindly** — derive the client IP through a
  configured trusted-proxy boundary so rate limits, blocklists, and audit IP hashes
  cannot be spoofed or used to grief other users.
- **Run server-side injection *detection* on retain payloads** (which currently skip the
  server sanitizer entirely) without corrupting their structured content.
- **Stop the CLI from sourcing auth-bearing secrets from a working-directory `.env`**, a
  supply-chain footgun when a skill runs inside an untrusted repo.
- **Harden the prompt → CLI boundary** by mandating argv-array invocation in the skill
  prompts (no shell-string interpolation of user/model content).
- Provide an **opt-in fail-closed mode** for replay protection when Redis is configured
  but unavailable.

### Non-Goals
- **No automated tests in this PR** (the user explicitly chose the no-tests workflow).
  Test coverage for these auth paths is called out as a strong follow-up.
- **Not building the knowledge-graph ingestion itself** — this PR makes artifacts
  user-attributed so a later PR can ingest them. (See [[vidbyte-user-knowledge-graph-memory]].)
- **Not building pSEO pages** — those need durable (non-TTL) publishing and are a
  separate project. This PR does not change artifact TTLs.
- **Not onboarding new skills** (e.g. `study-guide`) onto the sync contract — that is a
  follow-up that benefits from this foundation.
- **Not a full Redis rewrite of the in-memory rate limiters.** We add an opt-in
  fail-closed flag and document the full cross-worker counter migration as follow-up.
- **Not changing the session TTL** (a product decision) — only how the token is stored.

---

## 3. Background & Context

The skills integration was built in three layers that each made locally reasonable
choices that compose into gaps:

1. **The CLI** (`cerredz/Vidbyte-Skills`) authenticates with a `vb_live_…` API key,
   exchanges it for a session token, and for protected skills performs a two-leg dance:
   mint a single-use **invocation token** bound to the exact request body, then POST the
   artifact. The token design is genuinely strong (atomic single-use consume, body hash
   binding). See [[vidbyte-mcp-remote-http-transport]] and [[vidbyte-agent-payments-x402-mpp]]
   for adjacent identity work.

2. **The backend** (`cerredz/Vidbyte` `backend/`) runs a layered middleware gauntlet
   (auth → replay → IP intelligence → rate limit → schema/sanitize → bot scoring →
   circuit breaker) and persists artifacts to the `skillitems` collection.

3. **The frontend** (`cerredz/Vidbyte` `next-app/`) renders artifacts at public viewer
   URLs (`/m/…`, `/c/…`, `/skills/retain/…`).

**Why now:** the next wave of work (knowledge graph, per-user learning pages, premium
retain gating) all assume artifacts belong to a user. They do not, today. Building those
features on an anonymous-at-rest artifact store would either be impossible or would bake
in an access-control hole. Fixing the foundation first is cheaper than retrofitting it
under three dependent features. An adversarial review of the live code (see Section 13)
surfaced the specific gaps; this doc turns that review into the smallest set of changes
that closes them.

**Current-state facts that drive the design** (all verified in the code):
- `create_skill_item` persists `source_request_id` + `client_ip_hash` and **no `user_id`**,
  even though `request.state.user_id` is set by the invocation verifier.
- The retain viewer page calls `getServerSessionUser()` (which enforces login) but
  **discards the result**; the backend gates retain reads on a single shared
  `X-Retain-Viewer-Secret`, not on ownership.
- `create_skill_session` stores the **raw** `session_token`; `validate_auth` sets
  `request.state.skills_module_id = session_token`, which the audit logger writes to the
  `AUDIT_LOGS` collection — so the raw 30-day bearer lands in logs.
- `client_ip()` returns the first value of `CF-Connecting-IP` then `X-Forwarded-For`,
  with no trusted-proxy validation.
- The retain dispatch config sets `sanitize_payload=False`, so retain payloads bypass the
  server injection scanner entirely (the CLI-side sanitizer is the only check, and it is
  client-side and therefore untrusted).
- `EnvLoader` in the CLI loads `./.env` from the current working directory, including any
  auth-bearing variables.

**Verified compatibility facts the design relies on:**
- `principal.user_id` = `str(integrations.user_id)` (a user's Mongo `ObjectId`), and
  next-app `getServerSessionUser()` returns `user.id = savedUser._id.toString()`. These
  are the **same identity space**, so owner comparison `item.user_id == session.user.id`
  is correct (not an assumption — confirmed in `database/queries/integrations.py` and
  `next-app/security/user.js`).

---

## 4. Requirements

### Functional Requirements
1. Every skill artifact written via `create_skill_item` MUST persist the authenticated
   `user_id` resolved from the invocation token (empty string only when genuinely
   anonymous, which protected skills are not).
2. The `user_id` MUST NOT appear in any public response body (`to_public_dict`).
3. `GET /api/skills/retain/{encrypted_id}` MUST require, in addition to the viewer
   secret, that the requesting viewer's user id matches the artifact's `user_id`; a
   mismatch returns `403`.
4. The retain viewer page MUST forward the authenticated user's id to the backend and
   render an explicit "not authorized" state on `403`.
5. Session tokens MUST be stored only as a SHA-256 hash; lookups and deletes MUST hash
   the presented token before querying.
6. The raw session token MUST NOT be written to the audit log (or any persisted field
   other than the transient creation response to the client).
7. Client IP derivation MUST honor a configured trusted-proxy boundary: trust
   `CF-Connecting-IP` only when explicitly enabled, otherwise select the IP at the
   configured depth from the right of `X-Forwarded-For`, otherwise fall back to the
   socket peer address.
8. Retain payloads MUST be scanned server-side for XSS/SQL/prompt-injection patterns and
   rejected on detection, **without** HTML-escaping/mutating the stored content.
9. The CLI MUST NOT read auth-bearing variables (`VIDBYTE_SESSION_TOKEN`,
   `VIDBYTE_API_KEY`, `VIDBYTE_SKILL_SECRET`, `VIDBYTE_SKILL_ID`, `VIDBYTE_HOME`) from a
   working-directory or repo-root `.env` file; only the real process environment may
   supply them.
10. The CLI API-key format check MUST accept the same keys the server accepts
    (`vb_(live|test)_[a-zA-Z0-9]{32,}`).
11. The skill prompts that invoke the CLI with user/model-derived content MUST instruct
    the agent to pass arguments as an argv array and never via an interpolated shell string.
12. When `VIDBYTE_SKILLS_FAIL_CLOSED` is enabled and Redis is configured but errors during
    the nonce replay check, the request MUST be rejected rather than silently falling back
    to per-process memory.

### Non-Functional Requirements
- **Security:** all new authorization decisions are server-side; client-supplied values
  (IP header, installation id, CLI sanitizer result) are treated as untrusted inputs.
- **Backward compatibility:** changes must not break the existing 3 wired skills'
  request/response contracts other than the documented session-storage migration.
- **Observability:** the audit log must remain complete (no fields dropped) while no
  longer containing secrets.
- **Performance:** owner check adds at most one field comparison on an already-fetched
  document; no extra DB round-trips on the read path. IP resolution stays O(1).
- **Reliability:** the IP and fail-closed changes are config-gated so they can be tuned
  per environment without code changes, and default to safe behavior.

---

## 5. High-Level Design

The change is a thin, surgical layer over an already well-structured system. We are not
re-architecting — we are (a) **threading an identity that is already proven but
discarded**, (b) **moving three trust decisions from the client to the server**, and
(c) **removing two secret-handling footguns**.

```
PROMPT (SKILL.md)  --argv array, no shell string-->  CLI
   |                                                   | reads creds ONLY from process env + ~/.vidbyte
   |                                                   |  (never cwd .env for auth vars)
   v                                                   v
[CLI auth]  --API key--> /auth/validate --> session token (hash stored server-side)
   |
   |  leg 1: /auth/invoke  (Bearer session)  --> single-use invocation token (binds user_id, body hash)
   |  leg 2: /retain       (Bearer invocation token + body)
   v
[Backend middleware] auth -> replay(+fail-closed opt) -> IP(trusted-proxy) -> rate -> scan(detect-only for retain) -> bot -> circuit
   |
   v
[create_skill_item]  --persists user_id-->  skillitems { encrypted_id, user_id, ... }
   |
   v
[Next viewer]  /skills/retain/:id  -- X-Retain-Viewer-Secret + X-Retain-Viewer-User -->  backend
                                       owner check: item.user_id == viewer user id  (else 403)
```

**Key design decisions and why:**
- **Thread `user_id` from `request.state` (set by the invocation verifier) into
  `SkillCrudInputDto` and persist it.** We deliberately do *not* re-derive identity in the
  route; the invocation token already proves it. This keeps a single source of truth for
  "who authored this."
- **Owner check belongs server-side, with the viewer user id passed as a signed-context
  header from the trusted Next server.** The Next server already authenticates the user
  (NextAuth) and already holds the shared viewer secret; it is the correct place to assert
  "this logged-in user is X," and the backend enforces "X owns this item." The shared
  secret remains a transport gate (only our frontend can call), not the authorization
  decision.
- **Store the session token hash in a renamed field** (`session_token_hash`) so the
  schema is self-describing, accepting a trivial one-time index migration (sessions are
  disposable; see Section 7). We considered storing the hash in the existing
  `session_token` field to avoid migration but rejected it as misleading.
- **Detection-only scan for retain** rather than enabling the full sanitizer, because the
  full sanitizer HTML-escapes every string and would double-escape against React's own
  escaping in the viewer (the original reason retain disabled it). Detection gives us the
  security benefit without the rendering regression.
- **Config-gate the IP and fail-closed behavior** so production can opt into the correct
  proxy depth and we ship safe-by-default (socket peer) rather than spoofable-by-default.

---

## 6. Detailed Design

### 6.1 Persist `user_id` on skill items

**File(s):** `backend/lib/dtos/skills.py`, `backend/database/queries/skills.py`,
`backend/routes/skills.py`, `backend/lib/database/index.py`
**Type:** Modified

#### What it does
Adds an optional `user_id` field to the artifact document and the CRUD input, threads the
authenticated id from `request.state.user_id` into every protected-skill write, and indexes
it for future per-user queries. `user_id` is never exposed in public responses.

#### Interface / API
```python
# SkillItemDocumentDto / SkillCrudInputDto gain:
user_id: str = ""          # authored-by; empty only for genuinely anonymous writes

# from_payload(...) gains a user_id keyword (defaulted) and stores it in the document.
# to_public_dict() is UNCHANGED — user_id is intentionally omitted.
```

#### Logic / Algorithm
1. Add `user_id: str = ""` to `SkillItemDocumentDto` (persisted via `to_mongo_document`,
   excluded from `to_public_dict`).
2. Add `user_id: str = ""` to `SkillCrudInputDto`.
3. In `create_skill_item`, pass `user_id=skill_crud_input.user_id` into each
   `SkillItemDocumentDto.from_payload(...)` branch.
4. In `routes/skills.py`, every protected write (`retain`, `feedback`, `compression`)
   sets `user_id=getattr(request.state, "user_id", "")` on the `SkillCrudInputDto`.
5. Add a non-unique background index on `user_id` to the `SKILL_ITEMS` collection.

#### Edge Cases & Error Handling
- If `request.state.user_id` is unset (should not happen on protected routes, which all
  pass the invocation verifier), `user_id` stores `""` and the artifact is treated as
  unowned — owner-scoped reads will reject it for everyone, which fails safe.

---

### 6.2 Owner-scoped retain reads

**File(s):** `backend/routes/skills.py`, `backend/lib/config/skills.py`,
`backend/lib/database/queries/skills.py` (helper), `next-app/app/skills/retain/[encrypted_id]/page.jsx`
**Type:** Modified

#### What it does
Requires that the viewer fetching a retain item is its owner, enforced server-side using a
viewer-user-id header set by the trusted Next server.

#### Interface / API
```python
RETAIN_VIEWER_USER_HEADER = "X-Retain-Viewer-User"   # new constant

# get_retain_item_route: after the existing viewer-secret check and item fetch,
#   if item.user_id and item.user_id != request.headers.get(RETAIN_VIEWER_USER_HEADER):
#       return 403 RETAIN_FORBIDDEN
```
```jsx
// retain page.jsx
const { user } = await getServerSessionUser();   // already redirects if not logged in
// forward header:
headers: { "X-Retain-Viewer-Secret": ..., "X-Retain-Viewer-User": user.id }
// render a "not authorized" state on result.status === 403
```

#### Logic / Algorithm
1. Next page captures `user.id` from `getServerSessionUser()` (login already enforced).
2. Next forwards `X-Retain-Viewer-User: <user.id>` alongside the existing secret header.
3. Backend, after validating the secret and loading the item, compares `item.user_id` to
   the header; mismatch → `403 RETAIN_FORBIDDEN`.
4. Next renders an explicit "this exercise belongs to another account" state on 403.

#### Edge Cases & Error Handling
- Legacy retain items created before this PR have `user_id == ""`; the check treats empty
  owner as "nobody can open it" (fails safe). Because retain items have a 30-day TTL and
  are disposable, this self-heals quickly. Documented in Section 11.
- Missing/blank viewer-user header → treated as mismatch → 403.

---

### 6.3 Hash session tokens at rest; keep them out of logs

**File(s):** `backend/lib/dtos/skills.py`, `backend/database/queries/skills.py`,
`backend/routes/skills.py`, `backend/lib/database/index.py`
**Type:** Modified

#### What it does
Persists only `sha256(session_token)`; lookups/deletes hash the presented token; the raw
token is returned to the client exactly once (at creation) and never logged.

#### Interface / API
```python
# SkillSessionDocumentDto: field rename session_token -> session_token_hash
# create_skill_session(session_token=...) -> stores TokensHelper.sha256(session_token)
# get_skill_session(token) / delete_skill_session(token) -> query by sha256(token)
# validate_auth: request.state.skills_module_id = <session doc id>  (NOT the token)
```

#### Logic / Algorithm
1. Rename the DTO field and update `from_payload` to accept `session_token_hash`.
2. `create_skill_session` computes the hash and stores it; still returns the DTO so the
   route can return the raw token to the client.
3. `get_skill_session`/`delete_skill_session` hash the incoming bearer before `find_one`.
4. `validate_auth` sets `skills_module_id` to the inserted session's id, not the token.
5. Update the `SESSIONS` unique index to `session_token_hash`.

#### Edge Cases & Error Handling
- Hashes are unique per token, so the unique constraint semantics are preserved.
- Stale `session_token_1` index from before the rename: see migration in Section 7/11.

---

### 6.4 Trusted-proxy client IP resolution

**File(s):** `backend/lib/middleware/skills_requests.py`, `backend/lib/config/skills.py`
**Type:** Modified

#### What it does
Replaces blind first-hop header trust with a configurable trusted-proxy boundary so the
attacker cannot choose their own IP for rate limiting, blocklists, or audit attribution.

#### Interface / API
```python
# config:
SKILLS_TRUST_CF_HEADER: bool          # default False
SKILLS_TRUSTED_PROXY_DEPTH: int       # default 0  (0 => use socket peer; safe default)

# SkillsRequestHelper.client_ip(request) -> str   (same signature; new internals)
```

#### Logic / Algorithm
1. If `SKILLS_TRUST_CF_HEADER` and `CF-Connecting-IP` present → use it (Cloudflare sets a
   single trustworthy value when traffic truly transits Cloudflare).
2. Else if `X-Forwarded-For` present and `SKILLS_TRUSTED_PROXY_DEPTH > 0` → take the entry
   at `parts[-depth]` (the address observed by the outermost *trusted* proxy), not the
   client-controlled leftmost value.
3. Else → `request.client.host` (socket peer), which cannot be spoofed.

#### Edge Cases & Error Handling
- Depth larger than the list length → clamp to the leftmost available entry.
- Malformed header entries are stripped; empty result falls back to socket peer.
- **Default is safe-but-strict:** with depth 0, all traffic behind a single LB collapses
  to the LB IP (over-restrictive, never bypassable). Operators set the depth to match
  their real proxy chain. Documented prominently in Section 11.

---

### 6.5 Detection-only injection scan for retain

**File(s):** `backend/lib/middleware/skills_payload.py`,
`backend/lib/middleware/skills_security.py`
**Type:** Modified

#### What it does
Adds a scan that flags XSS/SQL/prompt-injection in nested payload strings **without**
HTML-escaping them, and wires it into the retain dispatch (which currently skips scanning).

#### Interface / API
```python
# skills_payload.py
def scan_strings_for_injection(data: dict) -> tuple[str | None, str | None]:
    # Detection-only: returns (error_code, field) or (None, None); never mutates content.

# skills_security.py: SkillsPayloadProcessor.parse_validate_and_sanitize_skill_payload
#   when sanitize_payload=False -> run scan_strings_for_injection and reject on a hit,
#   returning the validated (unescaped) model.
```

#### Logic / Algorithm
1. Factor the three existing regex checks in `sanitize_payload_strings` into a shared
   `_injection_code_for(value)` helper.
2. `sanitize_payload_strings` keeps detecting **and** escaping (unchanged for
   feedback/compression).
3. `scan_strings_for_injection` walks the same strings and returns the first hit's code +
   field, mutating nothing.
4. The retain branch (`sanitize_payload=False`) now means "detect, don't escape."

#### Edge Cases & Error Handling
- Legitimate study content that literally contains a flagged phrase (e.g. an example of
  "ignore previous instructions") will be rejected with the same `PROMPT_INJECTION_DETECTED`
  code feedback/compression already use. False-positive risk is accepted (Section 12).

---

### 6.6 Opt-in fail-closed replay protection

**File(s):** `backend/lib/middleware/skills_security.py`, `backend/lib/config/skills.py`
**Type:** Modified

#### What it does
When Redis is configured but the nonce check errors, reject the request instead of
silently degrading to per-process memory — but only when explicitly enabled.

#### Logic / Algorithm
1. Add `SKILLS_FAIL_CLOSED: bool` (default False).
2. In `SkillsReplayProtector.nonce_seen_or_store`, on a Redis exception: if
   `SKILLS_FAIL_CLOSED` → return `True` (treat as replay → reject); else keep current
   in-memory fallback.

#### Edge Cases & Error Handling
- Default off preserves availability; enabling it trades availability for strict replay
  guarantees during a Redis outage. The invocation token's atomic DB consume remains the
  backstop in either mode.

---

### 6.7 CLI: scope `.env` credential loading

**File(s):** `cli/auth/config.py`
**Type:** Modified

#### What it does
Prevents a working-directory/repo `.env` from supplying auth-bearing variables, closing a
supply-chain path where opening a malicious repo and running a skill could redirect the
user's data to an attacker's account.

#### Interface / API
```python
# EnvLoader: a denylist of keys that may ONLY come from the real process environment.
_PROTECTED_ENV_KEYS = {
    "VIDBYTE_SESSION_TOKEN", "VIDBYTE_API_KEY", "VIDBYTE_SKILL_SECRET",
    "VIDBYTE_SKILL_ID", "VIDBYTE_HOME",
}
# When parsing a .env line whose key is protected, skip it.
```

#### Logic / Algorithm
1. While loading `.env` candidates, if a parsed key is in `_PROTECTED_ENV_KEYS`, skip it
   (do not set it from file) regardless of whether it is already in the environment.
2. Non-auth config keys continue to load from `.env` as before.

#### Edge Cases & Error Handling
- Users who relied on a `.env` for these specific keys must move them to the real
  environment; documented as a behavior change in Section 11.

---

### 6.8 CLI: align API key format check

**File(s):** `cli/constants/auth.py`, `cli/commands/auth.py` (error text only if needed)
**Type:** Modified

#### What it does
Accepts the same key shapes the server accepts so valid (mixed-case / `vb_test_`) keys are
not rejected at the prompt.

#### Interface / API
```python
API_KEY_PATTERN = r"^vb_(live|test)_[a-zA-Z0-9]{32,}$"
```

---

### 6.9 Prompt → CLI argv-safety guidance

**File(s):** `skills/vidbyte-auth/SKILL.md` and any skill that invokes the CLI with
user/model-derived flags (e.g. a retain skill if present)
**Type:** Modified

#### What it does
Instructs the agent to invoke the CLI as an argv array (the tool's native form) and never
by interpolating user/model content into a shell string, removing a local shell-injection
surface on the user's machine.

#### Logic / Algorithm
1. Add a short, explicit "Invocation safety" subsection: pass each value as its own
   argument; never build a single shell command string from conversation content.

---

## 7. Data Model Changes

### 7.1 `skillitems` collection

**Change type:** Modified

```text
+ user_id: string   # authored-by user (Mongo user _id as string); "" if anonymous
```
**Migration strategy:**
- Forward: new field defaults to `""` on read for legacy docs (Pydantic default).
- Index: add non-unique background index on `user_id`.
- Rollback: field is additive and ignored by old code; safe to leave.

### 7.2 `skillsessions` collection

**Change type:** Modified

```text
- session_token: string (raw)          # REMOVED
+ session_token_hash: string (sha256)  # ADDED, unique index
```
**Migration strategy:**
- Sessions are disposable (30-day TTL; re-login is a single command). The simplest safe
  migration is to **drop the old `session_token_1` unique index** (and optionally clear the
  collection) at deploy time so the new `session_token_hash` unique index governs. Without
  dropping the stale index, new inserts would collide on a null `session_token`.
- Rollback: revert the field rename and index; existing hashed sessions become unusable
  (users re-login).

### 7.3 `skillitems` index

**Change type:** New
```text
DatabaseIndex("user_id", {"background": True})   # non-unique
```

---

## 8. API Changes

### 8.1 GET /api/skills/retain/{encrypted_id}

**Change type:** Modified

**Request (new header):**
```
X-Retain-Viewer-Secret: <shared secret>   (existing)
X-Retain-Viewer-User:   <authenticated user id>   (NEW, set by Next server)
```

**Error cases:**
| Status | Condition |
|--------|-----------|
| 401 | Missing/invalid viewer secret (existing) |
| 403 | `RETAIN_FORBIDDEN` — viewer is not the artifact owner (NEW) |
| 404 | Item not found / not a retain item (existing) |
| 410 | Item expired (existing) |

### 8.2 POST /api/skills/{retain,feedback,compression}

**Change type:** Modified (internal only)
Persisted document now includes `user_id`. **No change to request or public response
shape** — `user_id` is server-derived and omitted from `to_public_dict`.

### 8.3 POST /api/skills/auth/validate

**Change type:** Modified (internal only)
Session token is now hashed at rest; the response shape (`session_token`, `username`,
`email`, `account_tier`) is unchanged.

---

## 9. File Change Manifest

### PR A — `cerredz/Vidbyte` (branch `feat/skills-secure-account-linkage`)

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/skills-secure-account-linkage.md` | This design doc |
| MODIFY | `backend/lib/dtos/skills.py` | Add `user_id` to item DTO + CRUD input; rename session field to hash |
| MODIFY | `backend/database/queries/skills.py` | Persist `user_id`; hash session token on create/lookup/delete |
| MODIFY | `backend/routes/skills.py` | Thread `user_id`; owner check on retain read; stop logging raw token |
| MODIFY | `backend/lib/database/index.py` | `user_id` index on items; session index → hash |
| MODIFY | `backend/lib/config/skills.py` | New constants: viewer-user header, proxy/CF/fail-closed flags |
| MODIFY | `backend/lib/middleware/skills_requests.py` | Trusted-proxy client IP resolution |
| MODIFY | `backend/lib/middleware/skills_payload.py` | `scan_strings_for_injection` (detect-only) + shared regex helper |
| MODIFY | `backend/lib/middleware/skills_security.py` | Wire detect-only scan for retain; opt-in fail-closed replay |
| MODIFY | `next-app/app/skills/retain/[encrypted_id]/page.jsx` | Forward viewer-user header; render 403 state |

### PR B — `cerredz/Vidbyte-Skills` (branch `feat/cli-credential-hardening`)

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `docs/design/skills-secure-account-linkage.md` | This design doc (shared) |
| MODIFY | `cli/auth/config.py` | Block auth-bearing keys from `.env` |
| MODIFY | `cli/constants/auth.py` | Align API key regex with server |
| MODIFY | `skills/vidbyte-auth/SKILL.md` | Argv-safety invocation guidance |

---

## 10. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| MongoDB (motor) | existing | Persist `user_id`, hashed sessions, indexes | Stale session index must be dropped (Section 11) |
| Upstash Redis | existing (optional) | Nonce/replay + installation limits | Fail-closed mode trades availability on outage |
| NextAuth (`auth()`) | existing | Provides viewer user id for owner check | Identity space already verified to match principal |
| Cloudflare | existing (optional) | `CF-Connecting-IP` trust | Only trusted when `SKILLS_TRUST_CF_HEADER=true` |

---

## 11. Rollout & Deployment

- **Config to set in production before/at deploy (PR A):**
  - `VIDBYTE_SKILLS_TRUSTED_PROXY_DEPTH` — set to the number of trusted proxies in front
    of the origin (e.g. `1` for a single LB; `1` with Cloudflare→origin). **If left at the
    default `0`, all clients collapse to the proxy IP** (rate limits become global per-proxy
    — safe but over-restrictive).
  - `VIDBYTE_SKILLS_TRUST_CF_HEADER=true` only if traffic genuinely transits Cloudflare and
    the origin is not directly reachable.
  - `VIDBYTE_SKILLS_FAIL_CLOSED` — leave unset/false unless strict replay guarantees during
    a Redis outage are worth rejecting writes.
- **One-time DB migration (PR A):** drop the stale `session_token_1` index on the sessions
  collection (or drop the collection — sessions are disposable). New
  `session_token_hash` unique index is created automatically on first request.
- **Breaking changes:**
  - Existing logged-in CLI sessions are invalidated by the session-storage change → users
    run `vidbyte-skills auth login` again. Low impact (one command).
  - Legacy retain items (no `user_id`) become unopenable via the owner check; they expire
    within 30 days. Acceptable for a pre-GA feature.
  - CLI `.env` users of auth-bearing keys must move them to the real environment (PR B).
- **Deployment order:** PR A (backend) can ship independently; the retain owner check is
  backward-tolerant of the Next change because the page sends the header in the same PR.
  PR B (CLI) is independent and additive.
- **Rollback:** both PRs are revert-safe; the `user_id` field is additive. Reverting the
  session change invalidates hashed sessions (re-login).

---

## 12. Open Questions

- [ ] Should legacy `user_id == ""` retain items be readable by any authenticated user as a
      one-time grace window, or hard-denied (current design)? Current design hard-denies
      (fails safe); they expire in ≤30 days.
- [ ] Is the false-positive risk from detection-only scanning on retain acceptable, or do
      we want a softer "flag but allow, mark for review" mode for learning content?
- [ ] Should the viewer-user header be additionally signed (HMAC) rather than relying on
      the shared viewer secret to prove "this came from our Next server"? (Defense in depth;
      deferred.)
- [ ] Default `VIDBYTE_SKILLS_TRUSTED_PROXY_DEPTH`: ship `0` (safe/strict) vs `1` (matches
      the common single-LB case)? Current design ships `0` and documents it.

---

## 13. Alternatives Considered

### Alternative 1: Enable the existing full sanitizer for retain (`sanitize_payload=True`)
- What: Flip the flag so retain runs `sanitize_payload_strings`.
- Why rejected: that function HTML-escapes every string and writes it back; the viewer
  (React) escapes again, producing double-escaped artifacts (`&amp;lt;` etc.). A
  detection-only scan gives the security benefit without the rendering regression.

### Alternative 2: Store the session hash in the existing `session_token` field (no rename)
- What: Keep the field name, store the hash value, avoid any index migration.
- Why rejected: misleading field name is its own footgun; sessions are disposable so the
  migration cost is trivial. Clarity wins.

### Alternative 3: Re-derive the user in the route from the session/invocation record
- What: Look the user up again in the route handler instead of reading `request.state.user_id`.
- Why rejected: the invocation verifier already proved and attached the identity; re-deriving
  duplicates logic and risks divergence. Single source of truth.

### Alternative 4: Full Redis-backed rewrite of all rate limiters (finding 5, complete)
- What: Move per-IP/per-skill/circuit windows to Redis for cross-worker correctness.
- Why rejected *for this PR*: large, infra-coupled, and risk of availability regressions.
  We ship the opt-in fail-closed flag now and track the full migration as a follow-up.

### Alternative 5: Owner check purely in the Next layer
- What: Let Next compare ownership and only call the backend if it matches.
- Why rejected: Next would need the item's `user_id` (an extra fetch) and the authorization
  decision would live outside the system of record. Enforcing in the backend keeps the
  decision next to the data.

---

## 14. Summary of the Entire Secure System

This section is the end-to-end mental model of how a prompt becomes an account-linked,
access-controlled artifact — **after** this change. It is the "secure system summary"
requested for the PR.

### 14.1 Identities and tokens
- **API key (`vb_live_…`/`vb_test_…`)** — the user's long-lived credential, created at
  `vidbyte.pro/settings/api-keys`. Stored server-side only as a peppered HMAC
  (`HMAC-SHA256(SHA256(INTEGRATIONS_HASH_KEY:api-keys:v1), key)`). Never persisted by the CLI.
- **Session token** — opaque 256-bit random string minted on `auth/validate`. Lives in the
  CLI at `~/.vidbyte/credentials` (`chmod 600`). **After this change it is stored on the
  server only as `sha256(token)` and never written to logs.** TTL 30 days.
- **Invocation token** — opaque 256-bit random string, **single-use**, **body-bound**,
  **skill-scoped**, TTL 60s. Minted on `auth/invoke` and bound in the DB to
  `user_id`, `body_sha256`, `request_nonce`, `installation_id_hash`, `skill_id`, `method`,
  `path`. Consumed atomically (`find_one_and_update` on `consumed_at: null`).
- **Installation id** — a client-generated UUID; treated as a *hint* for rate limiting, not
  an identity (it is self-asserted).

### 14.2 The end-to-end flow
1. **Prompt → CLI.** A skill prompt instructs the agent to run the CLI **as an argv array**
   (no shell-string interpolation of conversation content — closes local shell injection).
   The CLI reads credentials **only** from the real process environment and `~/.vidbyte`,
   never from a working-directory `.env` (closes the supply-chain `.env` redirect).
2. **Login (once).** The CLI sends the API key to `POST /auth/validate` (`X-Api-Key`). The
   server resolves the key hash → principal (`user_id`), mints a session token, stores its
   **hash**, returns the raw token once. The CLI saves it locally.
3. **Mint (leg 1).** For a protected skill the CLI computes the exact request it will send,
   then calls `POST /auth/invoke` (`Bearer <session>`), committing `body_sha256`,
   `request_nonce`, `installation_id`, `skill_id`, `method`, `path`. The server validates
   the session (by hash), checks the path matches the skill, and mints a single-use
   invocation token bound to `user_id` + that exact request.
4. **Write (leg 2).** The CLI sends the artifact to e.g. `POST /retain` with
   `Bearer <invocation token>` plus skill headers. The session token never touches this
   endpoint.
5. **Server gauntlet** (per write): authenticate (invocation verifier re-hashes the body
   and rejects unless every bound field matches; token consumed atomically) → replay
   (timestamp window + single-use nonce; **opt-in fail-closed** on Redis error) → IP
   intelligence (**now using a trusted-proxy-derived IP**) → rate limits (per-IP / per-skill
   / per-installation / circuit breaker) → schema validation (Pydantic) → **injection scan**
   (escaping for feedback/compression; **detection-only for retain**) → bot/anomaly scoring
   → circuit breaker. Defense in depth: even if one layer degrades, the atomic token consume
   and schema validation stand.
6. **Persist.** `create_skill_item` writes the artifact to `skillitems` **including
   `user_id`** (the proven author), with a 128-bit unguessable `encrypted_id`, a 30-day TTL,
   and `client_ip_hash` (raw IP never stored). `user_id` is indexed and never returned in
   public responses.
7. **Render & authorize.** Public artifacts (`/m`, `/c`, generic `/skills/:id`) render via
   anonymous fetch. **Retain is owner-scoped:** the Next server (which has already
   authenticated the user via NextAuth and holds the shared viewer secret) forwards both the
   secret and `X-Retain-Viewer-User: <user.id>`. The backend loads the item and returns it
   only if `item.user_id == viewer user id`, else `403`. Because `principal.user_id` and the
   NextAuth user id are the same Mongo `_id`, this comparison is exact.
8. **Audit.** Every request writes non-sensitive metadata to `AUDIT_LOGS` (request id,
   hashed IP, skill id, outcome, layers passed, latency). **After this change it contains no
   secrets** (no raw session token).

### 14.3 What an attacker can and cannot do (post-change)
- **Stolen artifact URL + viewer secret:** still cannot read another user's retain item —
  owner check fails (was previously sufficient).
- **Spoofed `X-Forwarded-For`/`CF-Connecting-IP`:** no longer chooses their own IP — the
  trusted-proxy boundary decides; cannot bypass rate limits or grief-block other IPs
  (subject to operators setting the proxy depth correctly).
- **DB/log read:** no longer yields a usable session token (hash only; absent from logs).
- **Malicious repo `.env`:** can no longer inject the user's session/API key/skill secret
  into the CLI.
- **Injection payload via retain:** now scanned and rejected server-side, not just by the
  (untrusted) client.
- **Replay of a write:** still fails — single-use nonce + atomic token consume; optionally
  fail-closed if Redis is down.
- **Still relies on** (documented residual risk): the shared retain viewer secret as the
  transport gate (owner check is the real authz), correct proxy-depth configuration, and
  the self-asserted installation id as a soft rate-limit signal only.

---

END OF DESIGN DOC
