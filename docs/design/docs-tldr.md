# Design Doc: /docs-tldr Skill

**Status:** Draft
**Author:** Claude
**Created:** 2026-05-20
**Last Updated:** 2026-05-20

---

## 1. Overview

The `docs-tldr` skill is a utility skill that fetches the official documentation for any library or framework and produces a minimal cheat sheet answering five questions: core concepts, common operations with code examples, common beginner mistakes, a navigation map for going deeper, and setup instructions. Invoked via `/docs-tldr <library or framework>`, it resolves the library name to its official documentation URL, fetches 4-5 high-signal pages, extracts structured information, and saves a `<library>-tldr.md` cheat sheet to the working directory.

For an experienced developer landing on a new tool, this replaces 45 minutes of docs skimming. For a beginner, it provides orientation before going deeper.

---

## 2. Goals & Non-Goals

### Goals
- Create `skills/docs-tldr/SKILL.md` with full procedural instructions for URL resolution, multi-page fetching, concept extraction, operation extraction, mistake detection, and navigation map generation
- Create `skills/docs-tldr/references/known-docs-map.json` — a pre-mapped registry of ~50 common libraries to their official docs URLs
- Create utility scripts in `skills/docs-tldr/scripts/` for URL resolution, doc page fetching, concept extraction, and operation extraction (for harnesses that support script execution or for manual user invocation)
- Add `"docs-tldr"` to a new `"utility"` category in `skills-manifest.json`
- Update `scripts/validate.js` to accept `"utility"` as a valid manifest category
- Add `"docs-tldr"` to version 3 in `lib/skill-versions.json`
- Deliver a formatted cheat sheet with five sections: Setup, Core Concepts, Common Operations, Common Mistakes, Navigation Map
- Save output as `<library>-tldr.md` in the working directory
- Support version-specific requests (`/docs-tldr react@18`)
- Support section-specific requests (`/docs-tldr react --section concepts`)
- Support explicit URL input (`/docs-tldr https://docs.example.com`)

### Non-Goals
- Bundling a full web browser or headless browser — the skill uses web_fetch/web_search capabilities of the host harness
- Reading the entire documentation — only 4-5 high-signal pages are fetched
- Generating code examples from training data — examples must be extracted from or derived from the official docs
- Replacing the docs — the cheat sheet is a derived document that always links back to the source
- Supporting every possible library — the known-map starts with ~50 entries and grows
- Crawling or scraping aggressively — fetch count is bounded at 5 pages

---

## 3. Background & Context

Official documentation is written for completeness, not for speed. A developer picking up a new library needs a high-density extraction of the essentials, not the full API reference. The existing skills (`explain`, `research`, `question-builder`) help users understand concepts, but none fetches and distills external documentation into an actionable cheat sheet.

This skill is the first Vidbyte skill that:
- Performs structured web fetching against external sources
- Includes executable scripts in `scripts/` (previously documented but never used)
- Includes a reference data file (`references/known-docs-map.json`)
- Introduces a new skill category (`utility`) to the manifest and validation

---

## 4. Requirements

### Functional Requirements

1. The skill SHALL activate on `/docs-tldr <library-or-url>` with required argument.
2. The skill SHALL resolve a library name to its official documentation URL using a 4-step strategy: known-map lookup, npm/PyPI registry, web search fallback, and user confirmation for ambiguous matches.
3. The skill SHALL fetch 4-5 high-signal pages: root/index, getting-started/quick-start, core concepts/fundamentals, API reference index, and a web search for common mistakes.
4. The skill SHALL extract five core concepts — fundamental mental models required before anything else works — from the concepts/fundamentals page and getting-started guide.
5. The skill SHALL extract ten common operations — each with a minimal working code example — from the getting-started guide and API reference.
6. The skill SHALL extract three common mistakes — conceptual misunderstandings, not typos — from community forums, docs gotchas sections, and web search.
7. The skill SHALL generate a navigation map of 6-8 specific deep-link URLs for common deeper-dive needs.
8. The skill SHALL include a setup section with the install command and any non-trivial configuration (max 5 lines).
9. The skill SHALL output the cheat sheet in a formatted terminal block with box-drawing characters and save it as `<library>-tldr.md` in the working directory.
10. The skill SHALL include the source URL and detected version in the output header and footer.
11. The skill SHALL support these arguments and flags:
    - `<library>` — library name (required)
    - `@<version>` — version specifier (optional)
    - `--section <concepts|operations|mistakes|map>` — single section output (optional)
    - `--lang <language>` — force language for code examples (optional)
    - `https://...` — explicit docs URL bypassing resolution (optional)
    - `--save` — save output (redundant; always saved by default)
12. The skill SHALL NEVER generate code examples from training data alone — examples must be extracted from or directly derived from the official docs.
13. The skill SHALL NEVER include deprecated APIs in Common Operations.
14. The skill SHALL provide graceful error messages for unresolvable library names, unreachable docs pages, and libraries with no suitable docs structure.

### Non-Functional Requirements

- **Performance**: Total fetch operations bounded at 5 pages plus 1 web search. Response expected within 30-60 seconds.
- **Scalability**: Each invocation is independent. Known-map grows over time.
- **Security**: Only fetches from official documentation domains (no arbitrary URLs from user input without confirmation).
- **Observability**: Progress is reported inline during fetch operations ("Resolving docs URL...", "Fetching quick-start guide...").
- **Reliability**: If a specific fetch fails (404, timeout), the skill proceeds with available data and notes gaps.

---

## 5. High-Level Design

The skill combines a SKILL.md (model-facing instructions) with supporting scripts and reference data:

```
User invokes /docs-tldr react
         |
         v
[Agent loads docs-tldr SKILL.md]
         |
         +-- Phase 1: URL Resolution
         |     - Check known-docs-map.json
         |     - Fallback: npm/PyPI registry fetch
         |     - Fallback: web_search
         |     - User confirmation if ambiguous
         |
         v
[Phase 2: Fetch Strategy]
         |     - Fetch root/index for nav structure
         |     - Fetch quick-start / getting-started
         |     - Fetch core concepts / fundamentals
         |     - Fetch API reference index (nav map only)
         |     - web_search for common mistakes
         |
         v
[Phase 3: Extraction]
         |     - Extract 5 core concepts
         |     - Extract 10 common operations + code
         |     - Extract 3 common mistakes
         |     - Build 6-8 entry navigation map
         |     - Detect setup requirements
         |
         v
[Phase 4: Output]
               - Format cheat sheet with box-drawing
               - Save <library>-tldr.md to working directory
               - Print to terminal
```

**Key design decisions:**

1. **New "utility" category**: Unlike existing "learning" and "reasoning" skills, `docs-tldr` is a tool that fetches and transforms external data. A new category reflects this distinction and allows future utility skills to be grouped together.

2. **Scripts as reference implementations**: The `scripts/` directory contains runnable Node.js scripts that implement the core logic. These serve as reference for harnesses that support script execution and as documentation of the extraction heuristics. The SKILL.md contains equivalent logic expressed as model instructions for harnesses without script execution.

3. **Known-map as a living reference file**: `references/known-docs-map.json` starts with ~50 entries and grows over time. It's structured for both human editing and programmatic lookup.

4. **Bounded fetch count**: Maximum 5 page fetches + 1 web search per invocation. This keeps the skill fast and avoids abuse.

5. **Version-stamped output**: The cheat sheet is useless without knowing what version it covers. Version detection is built into the fetch pipeline (from docs URL, page metadata, or package registry).

---

## 6. Detailed Design

### 6.1 SKILL.md (Skill Definition)

**File:** `skills/docs-tldr/SKILL.md`
**Type:** New file

The SKILL.md contains the full procedural instructions for the LLM agent. It covers:

1. **Identity** — Utility that fetches official docs and distills them into a cheat sheet
2. **Goal** — Answer the five essential questions about any library in one pass
3. **Activation** — `/docs-tldr <library>` with full argument parsing
4. **Phase 1 — URL Resolution** — 4-step resolution with the full known-map embedded inline (since the model can't read JSON files directly in all harnesses)
5. **Phase 2 — Fetch Strategy** — Which pages to fetch and in what order, with progress reporting
6. **Phase 3 — Extraction** — Detailed heuristics for each of the five outputs
7. **Phase 4 — Output Format** — Exact box-drawing format and file-save instructions
8. **Hard Rules** — The 4 non-negotiable constraints (no training-data examples, include source URL, version-stamp, no deprecated APIs)
9. **Edge Cases** — Unresolvable names, version not found, docs site inaccessible, non-English docs, libraries with unconventional docs
10. **Constraints** — Guardrails around fetch targets, rate limiting, and URL validation
11. **Success Criteria** — Verifiable outcomes
12. **Behavior Contract** — Input/output table

### 6.2 Known Docs Map

**File:** `skills/docs-tldr/references/known-docs-map.json`
**Type:** New file

```json
{
  "react": "https://react.dev",
  "vue": "https://vuejs.org/guide/",
  "fastapi": "https://fastapi.tiangolo.com",
  "numpy": "https://numpy.org/doc/stable/",
  "pandas": "https://pandas.pydata.org/docs/",
  "django": "https://docs.djangoproject.com",
  "nextjs": "https://nextjs.org/docs",
  "tailwind": "https://tailwindcss.com/docs",
  "typescript": "https://www.typescriptlang.org/docs/",
  "node": "https://nodejs.org/docs/latest/api/",
  "express": "https://expressjs.com/",
  "prisma": "https://www.prisma.io/docs",
  "postgres": "https://www.postgresql.org/docs/current/",
  "redis": "https://redis.io/docs/",
  "docker": "https://docs.docker.com/",
  "kubernetes": "https://kubernetes.io/docs/",
  "graphql": "https://graphql.org/learn/",
  "svelte": "https://svelte.dev/docs",
  "angular": "https://angular.dev",
  "flask": "https://flask.palletsprojects.com/",
  "pytest": "https://docs.pytest.org/",
  "sqlalchemy": "https://docs.sqlalchemy.org/",
  "celery": "https://docs.celeryq.dev/",
  "golang": "https://go.dev/doc/",
  "rust": "https://doc.rust-lang.org/book/",
  "ruby": "https://ruby-doc.org/",
  "rails": "https://guides.rubyonrails.org/",
  "laravel": "https://laravel.com/docs",
  "spring": "https://docs.spring.io/spring-framework/reference/",
  "mongodb": "https://www.mongodb.com/docs/",
  "firebase": "https://firebase.google.com/docs",
  "aws": "https://docs.aws.amazon.com/",
  "terraform": "https://developer.hashicorp.com/terraform/docs",
  "ansible": "https://docs.ansible.com/",
  "nginx": "https://nginx.org/en/docs/",
  "webpack": "https://webpack.js.org/concepts/",
  "vite": "https://vitejs.dev/guide/",
  "eslint": "https://eslint.org/docs/latest/",
  "prettier": "https://prettier.io/docs/en/",
  "jest": "https://jestjs.io/docs/getting-started",
  "vitest": "https://vitest.dev/guide/",
  "playwright": "https://playwright.dev/docs/intro",
  "cypress": "https://docs.cypress.io/",
  "storybook": "https://storybook.js.org/docs",
  "redux": "https://redux.js.org/introduction/getting-started",
  "zustand": "https://docs.pmnd.rs/zustand/getting-started/introduction",
  "react-query": "https://tanstack.com/query/latest/docs/framework/react/overview",
  "shadcn": "https://ui.shadcn.com/docs",
  "bun": "https://bun.sh/docs",
  "astro": "https://docs.astro.build/",
  "nuxt": "https://nuxt.com/docs"
}
```

Each entry maps a lowercase name to the root docs URL. The URL must be the entry point to the documentation, not a sub-page.

### 6.3 Scripts

All scripts are Node.js ES modules. They follow the existing repo conventions (`"type": "module"`).

#### resolve-docs-url.js

**File:** `skills/docs-tldr/scripts/resolve-docs-url.js`
**Type:** New file

Purpose: Resolve a library name to its official docs URL using the 4-step strategy.

```
Input:  library name (string)
Output: { url: string, method: "known-map"|"npm"|"pypi"|"web-search"|"user-confirmed", version: string|null }

Algorithm:
1. Load known-docs-map.json, check exact match (case-insensitive)
2. If not found, try npm registry: GET https://registry.npmjs.org/{name}
   -> extract homepage or repository.url
3. If not found, try PyPI: GET https://pypi.org/pypi/{name}/json
   -> extract info.project_urls.Documentation or info.home_page
4. If still not found, return null with error message suggesting web_search
```

#### fetch-doc-pages.js

**File:** `skills/docs-tldr/scripts/fetch-doc-pages.js`
**Type:** New file

Purpose: Fetch the high-signal pages from a resolved docs URL.

```
Input:  baseUrl (string), version (string|null)
Output: { root: string, quickstart: string|null, concepts: string|null, apiIndex: string|null }

Algorithm:
1. Fetch root URL -> parse nav/links to find:
   - Getting Started / Quick Start / Introduction link
   - Core Concepts / Fundamentals / Key Concepts link
   - API Reference / Guides link
2. Fetch each identified page
3. Return raw page content for each (text or markdown)
```

#### extract-concepts.js

**File:** `skills/docs-tldr/scripts/extract-concepts.js`
**Type:** New file

Purpose: Extract five core concepts from docs page content.

```
Input:  concepts page text, quickstart page text
Output: [{ name: string, description: string }] (up to 5)

Heuristics:
- Look for sections titled "Concepts", "Core Concepts", "Fundamentals", "Key Ideas"
- Look for bold/emphasized terms in the first few sections
- Look for paragraphs starting with "X is..." or "X represents..."
- Look for terms described as "you should understand X before..."
- Quality filter: each concept must be a mental model, not an API method
```

#### extract-operations.js

**File:** `skills/docs-tldr/scripts/extract-operations.js`
**Type:** New file

Purpose: Extract ten common operations with code examples.

```
Input:  quickstart page text, api index page text
Output: [{ name: string, description: string, code: string }] (up to 10)

Heuristics:
- Extract code blocks from the getting-started guide
- Prioritize the first code example shown
- Look for "how to" sections
- Identify the most cross-referenced API methods
- Quality filter: code must be runnable, minimal, no placeholder comments
```

### 6.4 Manifest Changes

**File:** `skills-manifest.json`
**Type:** Modify — add `"utility"` category

Add a new top-level key:
```json
"utility": ["docs-tldr"]
```

### 6.5 Validation Changes

**File:** `scripts/validate.js`
**Type:** Modify — line 57

Change:
```js
const categories = ["learning", "reasoning"];
```
To:
```js
const categories = ["learning", "reasoning", "utility"];
```

### 6.6 Version Manifest

**File:** `lib/skill-versions.json`
**Type:** Modify — add to version 3

Add `"docs-tldr"` to the `"3"` array.

---

## 7. Data Model Changes

N/A — The skill does not introduce any backend data models. The `known-docs-map.json` is a static reference file. Output is a Markdown file saved to the user's working directory.

---

## 8. API Changes

N/A — No API endpoints are created, modified, or deprecated. The skill fetches from external documentation URLs but does not call the Vidbyte backend.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/docs-tldr/SKILL.md` | Core skill definition |
| CREATE | `skills/docs-tldr/scripts/resolve-docs-url.js` | URL resolution logic |
| CREATE | `skills/docs-tldr/scripts/fetch-doc-pages.js` | Multi-page fetch logic |
| CREATE | `skills/docs-tldr/scripts/extract-concepts.js` | Concept extraction heuristics |
| CREATE | `skills/docs-tldr/scripts/extract-operations.js` | Operation extraction heuristics |
| CREATE | `skills/docs-tldr/references/known-docs-map.json` | Pre-mapped library registry (~50 entries) |
| CREATE | `docs/design/docs-tldr.md` | This design document |
| MODIFY | `skills-manifest.json` | Add `"utility"` category with `"docs-tldr"` |
| MODIFY | `scripts/validate.js` | Add `"utility"` to allowed categories |
| MODIFY | `lib/skill-versions.json` | Add `"docs-tldr"` to version 3 |

**Total: 7 files created, 3 files modified, 0 files deleted.**

---

## 10. Testing Plan

### Unit Tests
N/A — The scripts are reference implementations; no unit test framework exists for skill scripts.

### Integration Tests
N/A — The skill operates within the LLM's session context with web fetch capabilities.

### Validation Tests
- **`npm test`** must pass — `validate.js` checks:
  - `skills/docs-tldr/SKILL.md` exists with valid frontmatter
  - `skills/docs-tldr` is listed in `skills-manifest.json` under `"utility"`
  - No dangling manifest entries or missing skill directories

### Manual / QA Test Cases

1. **Known-map resolution**: Given `/docs-tldr react`, then the URL is resolved from the known-map without any registry fetch, returning `https://react.dev`.
2. **Version-specific request**: Given `/docs-tldr react@18`, then the version `18` is passed through to doc page URL construction.
3. **Single-section output**: Given `/docs-tldr react --section concepts`, then only the Core Concepts section is output.
4. **Explicit URL**: Given `/docs-tldr https://custom-docs.example.com`, then URL resolution is bypassed and the explicit URL is used.
5. **Unknown library (npm fallback)**: Given `/docs-tldr some-npm-package`, and it's not in the known-map, then the npm registry is queried for the homepage.
6. **Unknown library (unresolvable)**: Given `/docs-tldr nonexistent-lib-999`, and all resolution methods fail, then a clear error message is returned.
7. **File save**: Given any successful invocation, then `<library>-tldr.md` is created in the working directory.
8. **Deprecated API exclusion**: Given the docs mark an API as deprecated, then that API appears in Common Mistakes (if at all) not Common Operations.
9. **Source URL in footer**: Given any successful output, then the footer contains the exact official docs URL.
10. **Code examples from docs**: Given a library with distinctive code patterns, then the code examples in the output match the docs' patterns, not generic model-generated examples.

---

## 11. Dependencies & External Services

| Dependency | Endpoint | Purpose | Risk |
|------------|----------|---------|------|
| npm registry | `https://registry.npmjs.org/{name}` | URL resolution fallback | Low — public API, no auth |
| PyPI registry | `https://pypi.org/pypi/{name}/json` | URL resolution fallback | Low — public API, no auth |
| Library docs sites | Various (resolved per invocation) | Fetch documentation pages | Medium — sites may block, change structure, or be offline |
| Web search | Host harness capability | Common mistakes research | Medium — depends on harness capability |

---

## 12. Rollout & Deployment

- **Feature flags**: None. The skill is loaded when the user explicitly invokes `/docs-tldr`.
- **Breaking change**: No. This is a new, additive skill. Adding `"utility"` category to validate.js is backward-compatible.
- **Deployment order**: Single step — merge the PR to main. The installer discovers the new skill directory automatically.
- **Rollback procedure**: Delete `skills/docs-tldr/` directory, revert manifest/validate changes, and re-run the installer.

---

## 13. Open Questions

- [ ] **Should the known-map be indexed by alternate names?** e.g., "reactjs" -> "react". Currently, only exact (case-insensitive) match is supported. **Recommendation**: Add aliases as separate entries for v1; implement a fuzzy-matching layer in v2.
- [ ] **Should scripts be runnable standalone?** The scripts currently import from each other and from the known-map. They could be bundled into a single CLI tool. **Recommendation**: Keep as separate modules for v1; bundling adds complexity without immediate benefit.
- [ ] **Should the skill cache docs pages within a session?** If the user invokes `/docs-tldr react` twice, re-fetching is wasteful. **Recommendation**: Not in v1. Session-local caching would require state management, which is not worth the complexity for a utility skill.
- [ ] **Should the known-map live in the SKILL.md inline for harnesses that can't read files?** Some harnesses may not allow the model to read JSON files from the skill directory. **Recommendation**: Include the full known-map inline in SKILL.md as a markdown table in addition to the JSON file. The model can read it from either source.
- [ ] **Should the output format use box-drawing characters?** Box-drawing characters look great in terminals but may render poorly in some environments. **Recommendation**: Use box-drawing by default; fall back to plain text if the harness can't render them.
- [ ] **Should the skill support non-English documentation?** Some libraries have docs in multiple languages. **Recommendation**: Not in v1. Default to English. Language selection can be added later.

---

## 14. Alternatives Considered

### Alternative 1: Pure prompt skill (no scripts)
- What: Put everything in SKILL.md with no scripts/ or references/ directories.
- Why rejected: The resolution logic and extraction heuristics are complex enough to benefit from reference implementations. Scripts serve as documentation and as a starting point for harnesses that support script execution. The create-skill-guide explicitly supports `scripts/` and `references/` subdirectories.

### Alternative 2: CLI-backed skill (dataclass, command, endpoint)
- What: Submit cheat sheets to the Vidbyte backend for persistent storage and sharing.
- Why rejected: The skill's value is immediate in-session utility, not persistent storage. Adding CLI integration would add significant complexity (dataclass, command, endpoint, smoke test) for a feature (persistence) that is secondary to the core value.

### Alternative 3: Full-page crawl instead of selective fetch
- What: Fetch more pages for more comprehensive extraction.
- Why rejected: Increases latency and bandwidth. The 5-page limit keeps the skill fast (30-60 seconds). More pages add diminishing returns for the five targeted outputs.

### Alternative 4: Put known-map inline in SKILL.md only (no JSON file)
- What: Skip `references/known-docs-map.json` and embed the map directly in SKILL.md.
- Why rejected: The JSON file is easier to maintain programmatically (scripts can read it), easier to validate, and follows the documented `references/` pattern. The SKILL.md will include the map inline as well for harness compatibility.

### Alternative 5: Category `"tools"` instead of `"utility"`
- What: Name the new category `"tools"`.
- Why rejected: `"utility"` is more general and aligns with common software taxonomy. `"tools"` might imply CLI tools, which these are not.

---

END OF DESIGN DOC
