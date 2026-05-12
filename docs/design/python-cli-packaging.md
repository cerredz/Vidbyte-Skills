# Design Doc: Python CLI Packaging

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-12
**Last Updated:** 2026-05-12

---

## 1. Overview

Make the `cli/` Python package pip-installable via a `pyproject.toml` at the repo root, add an npm `postinstall` script that auto-installs the Python CLI into the user's active Python environment after `npm install`, and refactor the two file-relative `REPO_ROOT` lookups so the CLI can find its configuration (`package.json`, `.env`) regardless of whether it was invoked from a repo checkout, an npm global install, or a pip site-packages install. The end state is: after `npm install -g vidbyte-skills`, both `vidbyte feedback submit ...` (npm bin) and `python -m cli feedback submit ...` (direct Python) work reliably.

---

## 2. Goals & Non-Goals

### Goals
- Create `pyproject.toml` at the repo root declaring `cli/` as an installable Python package
- Add npm `postinstall` that runs `pip install` on the package directory (silent, non-fatal on missing pip)
- Refactor `cli/helpers/__init__.py` to resolve `REPO_ROOT` through multiple strategies (not just `__file__`-relative)
- Refactor `cli/auth/config.py` to resolve `.env` through multiple strategies
- Update `bin/vidbyte.js` to pass through the resolved `REPO_ROOT` as an environment variable so the Python CLI can use it
- Update `cli/skills/*/SKILL.md` files that reference `python3 -m cli` to use `vidbyte` (the npm bin) as primary, with `python -m cli` as fallback
- Ensure all existing tests pass (`npm test`)
- Ensure the CLI smoke test (`scripts/cli-smoke-test.py`) verifies the new packaging

### Non-Goals
- Publishing the Python package to PyPI (only local pip install is in scope)
- Creating a separate `setup.py` or `setup.cfg` (modern `pyproject.toml` only)
- Changing the skill installer (`bin/install.js`, `lib/`) logic
- Adding Python dependencies beyond stdlib
- Creating a new `vidbyte-cli` console_scripts entry point that would conflict with the npm `vidbyte` bin
- Modifying the structure or naming of files that the validate.js script checks for (`artifacts/research.md`, `artifacts/architecture.md` must remain)

---

## 3. Background & Context

### Current State

The repo distributes skills via npm. The npm package has two binaries:
- `vidbyte-skills` (bin/install.js) — installs skill directories to harness locations
- `vidbyte` (bin/vidbyte.js) — Node.js wrapper that delegates to `python -m cli`

The `vidbyte` wrapper works by resolving `REPO_ROOT` from its own file path and setting `cwd` to that root before spawning Python. Python's module search includes the current directory, so `python -m cli` finds `cli/`. This chain works after npm install because the wrapper is at `node_modules/vidbyte-skills/bin/vidbyte.js` and walks up to `node_modules/vidbyte-skills/` where `cli/` lives.

### The Problem

Skills contain bash commands embedded in SKILL.md prose that invoke:
```bash
python3 -m cli feedback submit --file "$FILE" ...
python3 -m cli compressor submit --file "$FILE" ...
```

When the AI harness reads a skill and executes these commands, Python's module search path does not include the npm package directory. The invocation fails with `ModuleNotFoundError: No module named cli`.

Additionally, two Python modules use `__file__`-relative `REPO_ROOT` resolution that breaks when the package is pip-installed into `site-packages/`:
- `cli/helpers/__init__.py:6` — `REPO_ROOT` used by `read_package_version()` to find `package.json`
- `cli/auth/config.py:6` — `REPO_ROOT` used as a fallback `.env` file location

### Constraints
- Python CLI must remain stdlib-only (no `pip install` of external dependencies)
- The npm package must remain the primary distribution channel
- Skills are static Markdown files — they cannot use JavaScript or dynamic path resolution
- The `bin/vidbyte.js` wrapper must remain the canonical way for npm consumers to invoke the CLI
- The existing test suite (`npm test` = validate + smoke-test + cli-smoke-test) must continue to pass

---

## 4. Requirements

### Functional Requirements
1. After `npm install -g vidbyte-skills`, `python -m cli feedback submit --file <path> ...` succeeds from any working directory
2. After `npm install -g vidbyte-skills`, `python -m cli compressor submit --file <path> ...` succeeds from any working directory
3. The `pyproject.toml` declares `cli/` as a package so `pip install` works (both from repo root and from the npm-installed location)
4. `npm install` (global or local) triggers a non-fatal `pip install .` postinstall step
5. When pip is not available, the postinstall prints a diagnostic and exits 0 (does not block npm install)
6. `cli/helpers/__init__.py:read_package_version()` resolves `package.json` correctly regardless of install method
7. `cli/auth/config.py:EnvLoader._env_file_candidates()` resolves `.env` correctly regardless of install method
8. The two skills that invoke the CLI (`feedback-generator`, `compression-check`) use `vidbyte` (npm bin) as primary invocation and `python -m cli` as fallback
9. The `vidbyte` npm bin passes an environment variable (`VIDBYTE_REPO_ROOT`) to Python so the pip-installed CLI knows where the npm package lives
10. All existing tests pass without modification (or with minimal, justified modifications)

### Non-Functional Requirements
- **Performance**: The postinstall adds < 2 seconds to `npm install` when pip is available
- **Reliability**: Postinstall failure must not cause `npm install` to fail (exit 0 with message)
- **Security**: The `pyproject.toml` must not introduce any new network dependencies or build steps beyond what setuptools provides
- **Observability**: Postinstall output is piped to stderr so it does not interfere with npm script output parsing
- **Backward compatibility**: Existing workflows (`npx vidbyte-skills`, `npm run install-skills`, `npm test`) must continue to work

---

## 5. High-Level Design

The strategy has three independent layers that together solve the problem:

**Layer 1 — Declarative packaging (`pyproject.toml`):** A `pyproject.toml` at the repo root declares `cli/` as a setuptools package. This is the static declaration that tells pip what to install. No new files are created inside `cli/` — only the root-level metadata file is added.

**Layer 2 — Automatic installation (`postinstall`):** An npm `postinstall` script runs after every `npm install`. It invokes `pip install .` from the package directory. On success, the `cli` package is installed into the active Python environment. On failure (no pip, no Python), the script prints a diagnostic message to stderr and exits 0 — the npm install succeeds regardless. This ensures `python -m cli` works after `npm install -g`.

**Layer 3 — Robust path resolution (refactored REPO_ROOT):** Currently two modules resolve `REPO_ROOT` by walking from `__file__`. After pip install, `__file__` points into `site-packages/cli/` where no `package.json` or `.env` exists. The fix adds a `VIDBYTE_REPO_ROOT` environment variable that `bin/vidbyte.js` sets to the npm package root before spawning Python. The Python CLI falls back through a chain: env var → `__file__`-relative → current directory search.

**Layer 4 — Skill invocation updates:** The two skills that call the CLI (`feedback-generator`, `compression-check`) are updated to prefer the `vidbyte` npm bin as the invocation method, with `python -m cli` as the fallback. This means skills work immediately after npm install (via the bin) and also work after pip install (via direct Python).

```
User runs: npm install -g vidbyte-skills
  ├── npm installs JS files to global node_modules/
  ├── npm runs postinstall: pip install .
  │     └── pip installs cli/ package into Python's site-packages/
  ├── User runs skill → AI executes: vidbyte feedback submit --file ...
  │     └── bin/vidbyte.js sets VIDBYTE_REPO_ROOT, spawns python -m cli
  │           ├── Python finds cli module (site-packages)
  │           └── cli reads VIDBYTE_REPO_ROOT to find package.json / .env
  └── OR: python -m cli feedback submit --file ...
        └── Python finds cli module (site-packages, pip-installed)
              └── cli falls back to __file__-relative or cwd search for config
```

---

## 6. Detailed Design

### 6.1 `pyproject.toml` (New File)

**File(s):** `pyproject.toml`
**Type:** New file

#### What it does
Declares the `cli/` directory as an installable Python package using setuptools. Pip reads this file to determine what to install and where to find the package source.

#### Interface / API
```toml
[build-system]
requires = ["setuptools>=64"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "vidbyte-skills"
version = "0.1.0"
description = "Vidbyte CLI — submit feedback and compression-check artifacts to the Vidbyte backend"
requires-python = ">=3.9"
dependencies = []

[tool.setuptools.packages.find]
include = ["cli*"]

[project.scripts]
vidbyte-cli = "cli.__main__:main"
```

#### Logic / Algorithm
1. `[build-system]` specifies setuptools as the build backend (stdlib, no extra installs needed)
2. `[project]` declares metadata — name matches npm package name, version matches `package.json`
3. `dependencies = []` explicitly states no external dependencies
4. `[tool.setuptools.packages.find]` with `include = ["cli*"]` tells setuptools to only package the `cli/` directory and its subpackages
5. `[project.scripts]` creates a `vidbyte-cli` console_scripts entry point (different name from npm `vidbyte` bin to avoid conflicts)

#### Edge Cases & Error Handling
- If `setuptools` is not available, pip will download it (setuptools >=64 is bundled with Python 3.12+, otherwise fetched from PyPI)
- The `cli/` directory contains empty `__init__.py` files — these are valid namespace packages that setuptools handles correctly
- `python -m pip install .` from the repo root will find `pyproject.toml` and install `cli/`

---

### 6.2 `package.json` postinstall script (Modified)

**File(s):** `package.json`
**Type:** Modified

#### What it does
Adds a `postinstall` script that runs `pip install .` from the npm package root after every `npm install`. On failure, prints a diagnostic and exits 0 so npm install never breaks due to missing Python/pip.

#### Interface / API
```json
{
  "scripts": {
    "postinstall": "python3 -m pip install --quiet . 2>NUL || python -m pip install --quiet . 2>NUL || (echo Vidbyte CLI: Python/pip not found. Install Python 3 and run 'pip install <path>' for direct CLI access. The 'vidbyte' npm binary will still work. >&2) & exit 0"
  }
}
```

#### Logic / Algorithm
1. Try `python3 -m pip install --quiet .` first (Unix convention)
2. If that fails, try `python -m pip install --quiet .` (Windows convention)
3. If both fail, print a diagnostic to stderr (so it doesn't interfere with npm output)
4. The trailing `exit 0` ensures the npm install always succeeds
5. `--quiet` suppresses pip's progress bar output (it's a postinstall script, not interactive)

#### Edge Cases & Error Handling
- No Python installed: diagnostic printed, npm install continues normally
- pip not available: same as above
- Permission denied (global install without admin): pip install fails, diagnostic printed, npm install continues
- `pip install .` already done (reinstall): pip detects it's already installed and skips (idempotent)

---

### 6.3 `cli/helpers/__init__.py` REPO_ROOT refactor (Modified)

**File(s):** `cli/helpers/__init__.py`
**Type:** Modified

#### What it does
Replaces the single `__file__`-relative `REPO_ROOT` resolution with a multi-strategy resolver that works regardless of how the CLI was invoked (repo checkout, npm global install, pip site-packages install).

#### Interface / API
```python
def _resolve_repo_root() -> Path:
    """Resolve the repository root through a priority chain:
    1. VIDBYTE_REPO_ROOT env var (set by bin/vidbyte.js wrapper)
    2. __file__-relative walk-up searching for 'package.json'
    3. __file__-relative walk-up (legacy fallback)
    """
    import os

    env_root = os.environ.get("VIDBYTE_REPO_ROOT")
    if env_root and Path(env_root).is_dir():
        return Path(env_root)

    current = Path(__file__).resolve().parent
    for _ in range(6):
        if (current / "package.json").is_file():
            return current
        current = current.parent

    return Path(__file__).resolve().parent.parent.parent

REPO_ROOT = _resolve_repo_root()
```

#### Logic / Algorithm
1. Check `VIDBYTE_REPO_ROOT` env var — if set and valid, use it immediately (covers npm wrapper invocation)
2. Walk up from `__file__` up to 6 levels looking for `package.json` — covers repo checkout and npm-installed contexts
3. Fall back to the original 3-level walk-up (`helpers/` → `cli/` → root) for backward compatibility
4. `read_package_version()` uses `REPO_ROOT` unchanged — it works because step 1 or 2 found the correct root

#### Edge Cases & Error Handling
- `VIDBYTE_REPO_ROOT` points to a non-existent directory: log warning, fall to step 2
- `package.json` not found in any ancestor (pip install without env var): step 3 falls back, `read_package_version()` will raise FileNotFoundError — acceptable since the CLI can't function without a version
- `helpers/` ends up deeper than 6 levels from root: the 6-level loop covers `site-packages/cli/helpers/` → 2 levels to `site-packages/` which is safe; if `site-packages/` happens to have a `package.json` that's a false positive but extremely unlikely

---

### 6.4 `cli/auth/config.py` REPO_ROOT refactor (Modified)

**File(s):** `cli/auth/config.py`
**Type:** Modified

#### What it does
Replaces the single `__file__`-relative `REPO_ROOT` resolution with the same multi-strategy resolver used in `cli/helpers/__init__.py`, plus adds a `cwd/.env` candidate to the env file search path.

#### Interface / API
```python
def _resolve_repo_root() -> Path:
    """Resolve the repository root through a priority chain."""
    import os

    env_root = os.environ.get("VIDBYTE_REPO_ROOT")
    if env_root and Path(env_root).is_dir():
        return Path(env_root)

    current = Path(__file__).resolve().parent
    for _ in range(6):
        if (current / "package.json").is_file():
            return current
        current = current.parent

    return Path(__file__).resolve().parent.parent.parent

REPO_ROOT = _resolve_repo_root()
```

#### Logic / Algorithm
Identical to 6.3's algorithm. The class `EnvLoader` continues to use `REPO_ROOT` as a `.env` candidate path.

#### Edge Cases & Error Handling
- `.env` not found in any candidate: `EnvLoader._load_env_files()` silently skips missing files (existing behavior preserved)
- `REPO_ROOT` points to a valid directory without `.env`: silent skip (existing behavior preserved)

---

### 6.5 `bin/vidbyte.js` — pass REPO_ROOT as env var (Modified)

**File(s):** `bin/vidbyte.js`
**Type:** Modified

#### What it does
Before spawning `python -m cli`, sets the `VIDBYTE_REPO_ROOT` environment variable to the resolved repo root so the Python CLI can locate its configuration files even when pip-installed elsewhere.

#### Interface / API
```javascript
const result = spawnSync(py, ["-m", "cli", ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: REPO_ROOT,
  env: {
    ...process.env,
    VIDBYTE_REPO_ROOT: REPO_ROOT,
  },
  encoding: "utf8",
});
```

#### Logic / Algorithm
1. `REPO_ROOT` is already resolved correctly (points to the npm package root)
2. Add `VIDBYTE_REPO_ROOT` to the child process environment
3. Python's `_resolve_repo_root()` reads this env var first and uses it

#### Edge Cases & Error Handling
- Environment variable already set by user: the wrapper overrides it (the wrapper's resolved path is authoritative for npm-originated invocations)
- Long path names (Windows): Node.js handles long paths, env var value is a string — no known length issues

---

### 6.6 Skills — update CLI invocation patterns (Modified)

**File(s):** `skills/feedback-generator/SKILL.md`, `skills/compression-check/SKILL.md`
**Type:** Modified

#### What it does
Updates the bash invocation blocks in the two skills that call the CLI to prefer the `vidbyte` npm binary, with `python -m cli` as a fallback when the npm binary is not found.

#### Interface / API (feedback-generator)

Changed from:
```bash
if command -v vidbyte >/dev/null 2>&1; then
  VIDBYTE_RESPONSE=$(python3 -m cli feedback submit \
    --file "$FEEDBACK_LOG_FILE" \
    --domain "$FEEDBACK_DOMAIN" \
    --conversation-id "$FEEDBACK_CONVERSATION_ID" 2>&1)
  ...
fi
```

Changed to:
```bash
if command -v vidbyte >/dev/null 2>&1; then
  VIDBYTE_RESPONSE=$(vidbyte feedback submit \
    --file "$FEEDBACK_LOG_FILE" \
    --domain "$FEEDBACK_DOMAIN" \
    --conversation-id "$FEEDBACK_CONVERSATION_ID" 2>&1)
elif command -v python3 >/dev/null 2>&1; then
  VIDBYTE_RESPONSE=$(python3 -m cli feedback submit \
    --file "$FEEDBACK_LOG_FILE" \
    --domain "$FEEDBACK_DOMAIN" \
    --conversation-id "$FEEDBACK_CONVERSATION_ID" 2>&1)
elif command -v python >/dev/null 2>&1; then
  VIDBYTE_RESPONSE=$(python -m cli feedback submit \
    --file "$FEEDBACK_LOG_FILE" \
    --domain "$FEEDBACK_DOMAIN" \
    --conversation-id "$FEEDBACK_CONVERSATION_ID" 2>&1)
else
  ...
fi
```

#### Interface / API (compression-check)

Changed from:
```bash
python3 -m cli compressor submit --file <tempfile>
```

Changed to:
```bash
# Prefer the npm vidbyte binary, fall back to direct Python invocation
if command -v vidbyte >/dev/null 2>&1; then
  vidbyte compressor submit --file <tempfile>
elif command -v python3 >/dev/null 2>&1; then
  python3 -m cli compressor submit --file <tempfile>
elif command -v python >/dev/null 2>&1; then
  python -m cli compressor submit --file <tempfile>
fi
```

#### Logic / Algorithm
1. Check for `vidbyte` npm bin first (most reliable — works after any npm install)
2. Fall back to `python3 -m cli` (works after pip install)
3. Fall back to `python -m cli` (Windows convention)
4. If none available, the skill fails silently (existing behavior)

#### Edge Cases & Error Handling
- `vidbyte` is on PATH but `python` is not: step 1 succeeds, CLI works via the npm wrapper
- `vidbyte` is NOT on PATH but `python -m cli` works (pip install): step 2 or 3 succeeds
- Neither is available: skill fails silently (existing behavior preserved)

---

## 7. Data Model Changes

N/A — this feature does not introduce or modify any data models, database schemas, or persistent storage formats.

---

## 8. API Changes

N/A — this feature does not introduce or modify any HTTP API endpoints. The Python CLI's internal `VidbyteRequestBuilder` API is unchanged.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `pyproject.toml` | Declare `cli/` as a pip-installable Python package |
| MODIFY | `package.json` | Add `postinstall` script to auto pip-install the CLI |
| MODIFY | `bin/vidbyte.js` | Pass `VIDBYTE_REPO_ROOT` env var to spawned Python process |
| MODIFY | `cli/helpers/__init__.py` | Refactor `REPO_ROOT` resolution to multi-strategy lookup |
| MODIFY | `cli/auth/config.py` | Refactor `REPO_ROOT` resolution to multi-strategy lookup |
| MODIFY | `skills/feedback-generator/SKILL.md` | Update CLI invocation to use `vidbyte` bin with fallback |
| MODIFY | `skills/compression-check/SKILL.md` | Update CLI invocation to use `vidbyte` bin with fallback |

Total: 1 new file, 6 modified files, 0 deleted files.

---

## 10. Testing Plan

### Unit Tests
No new unit test files are created. The existing tests are sufficient because the changes preserve existing interfaces. However, the following manual verification points are needed:

- `cli/helpers/__init__.py`: `_resolve_repo_root()` returns correct root when `VIDBYTE_REPO_ROOT` is set
- `cli/helpers/__init__.py`: `_resolve_repo_root()` returns correct root by walking up to `package.json`
- `cli/helpers/__init__.py`: `_resolve_repo_root()` returns legacy fallback when neither env var nor `package.json` is found
- `cli/auth/config.py`: `_resolve_repo_root()` returns correct root and `.env` discovery works

### Integration Tests
The existing `scripts/cli-smoke-test.py` already tests the full `python -m cli feedback submit --dry-run` flow. After this change:
- The test must continue to pass (it sets `cwd` to `REPO_ROOT`, which is the legacy fallback case)
- The test should ALSO pass when `VIDBYTE_REPO_ROOT` is set

The existing `scripts/smoke-test.js` tests the installer end-to-end. After this change:
- It must continue to pass unchanged

### Manual / QA Test Cases
1. **Given** a fresh machine with Node.js 18+ and Python 3.9+, **when** `npm install -g <repo-path>` is run, **then** `python -m cli feedback submit --help` resolves the module
2. **Given** the above, **when** `vidbyte feedback submit --file test.md --domain test --dry-run` is run, **then** it produces valid JSON output
3. **Given** pip is NOT installed, **when** `npm install -g <repo-path>` is run, **then** npm install succeeds and prints a diagnostic about missing pip
4. **Given** the feedback-generator skill is installed to a harness, **when** the AI executes the skill's CLI command block, **then** it invokes `vidbyte` correctly (npm bin on PATH after global install)

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| setuptools | >=64 | Build backend for pip install | Minimal — bundled with Python 3.12+, pip can auto-fetch for older versions |
| Python 3 | >=3.9 | Runtime for the CLI | Already required by README; postinstall gracefully handles absence |
| pip | Any modern version | Installer for the Python package | Postinstall gracefully handles absence |

---

## 12. Rollout & Deployment

- **No feature flags** — this is a packaging change, not a runtime behavioral change
- **Not a breaking change** — existing workflows continue to work:
  - `npm run install-skills` still works
  - `npm test` still works
  - `npx vidbyte-skills` still works (postinstall is a no-op for npx since it doesn't fully install)
  - Skills continue to work because the invocation pattern has fallbacks
- **Deployment order**: Merge PR → `npm publish` (if/when publishing to npm)
- **Rollback procedure**: Revert the PR commit. The `cli/` package is only locally installed — no remote state to unwind.

---

## 13. Open Questions

- [ ] Should we version the `pyproject.toml` independently from `package.json`, or keep them in sync? (Current design keeps them in sync — both at `0.1.0`)
- [ ] Should the postinstall use `pip install --user .` for global installs to avoid permission issues? (Current design uses plain `pip install .` which may require `--user` on some systems; the postinstall is resilient to failure)
- [ ] Should the `validate.js` script be updated to require `pyproject.toml` as a required file? (Current design does NOT add it — validate.js already checks a specific set of files; adding a new required file could break existing checkouts)

---

## 14. Alternatives Considered

### Alternative 1: Ship a standalone Python zipapp instead of pip install
- **What**: Bundle `cli/` as a `vidbyte-cli.pyz` zipapp, distribute alongside the npm package, have skills call `python /path/to/vidbyte-cli.pyz`
- **Why rejected**: Requires skills to know the absolute path to the npm package. Path resolution is the same problem as the original. A zipapp is also harder to debug and makes stack traces less readable.

### Alternative 2: Have skills call `npx vidbyte ...` instead of `python -m cli`
- **What**: Skills use `npx vidbyte feedback submit ...` which auto-downloads and runs the npm binary
- **Why rejected**: `npx` adds network latency and download overhead on every invocation. Not suitable for frequent calls (compression-check fires every 5-8 prompts). Also requires `npx` to be on PATH, which is not guaranteed in all harness environments.

### Alternative 3: Only fix the skill invocations (use `vidbyte` bin), no pip install
- **What**: Update skills to use `vidbyte` (npm bin) instead of `python -m cli`. Skip the `pyproject.toml` and pip install entirely.
- **Why rejected**: This would work for the immediate case but leaves the Python CLI fragile. If a user or harness invokes `python -m cli` directly (e.g., debugging, custom scripts), it still fails. The `pyproject.toml` + postinstall makes the CLI robust regardless of invocation method. Also, `pip install` is the standard Python packaging path — users expect `pip install` to work for Python tools.

### Alternative 4: Create a `setup.py` instead of `pyproject.toml`
- **What**: Use the older `setup.py` pattern
- **Why rejected**: `pyproject.toml` is the modern standard (PEP 517/518/621). `setup.py` is deprecated for new packages. The codebase has no existing `setup.py` convention to maintain.

---

END OF DESIGN DOC
