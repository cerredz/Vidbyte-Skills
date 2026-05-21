<!--
CONTEXT PROTOCOL HEADER
Description: Design document for the read-paper and find-papers skills inside the vidbyte-cli codebase.
Purpose: To specify requirements, architecture, files to change, and verification plan for adding these two advanced research prompt skills to version 3 of the repo.
Architecture: Documented below under sections 5 (High-Level Design) and 6 (Detailed Design).
Functions/Key Elements: Details the URL resolution, full-text fetching, noise-stripping, active learning gate checkpoints, search query generation, deduplication, and ranking algorithms.
Relation to Codebase: Guides the implementation of skills/read-paper/*, skills/find-papers/*, skills-manifest.json, and lib/skill-versions.json.
Similar Files: docs/design/theoretical-feedback-skill.md, docs/design/learn-from-video.md.
-->

# Design Doc: `/read-paper` and `/find-papers` Skills

**Status:** Draft
**Author:** Antigravity
**Created:** 2026-05-21
**Last Updated:** 2026-05-21

---

## 1. Overview

This feature implements two advanced prompt-based learning skills in version 0.3.0 (version 3) of the `vidbyte-cli` repository:
1. `/read-paper`: Fetches and extracts key information from research papers (arXiv, DOI, PDF, PubMed, Semantic Scholar), strips volume noise, and gates sections behind active learning checkpoints to ensure comprehension before delivering a structured handoff note with a ready-to-run `vidbyte retain` command.
2. `/find-papers`: Performs plain-language search across multiple highly credible academic databases (Semantic Scholar, arXiv, PubMed, ERIC, and top-tier publishers) to discover papers, ranking and formatting them directly in the terminal without leaving the harness.

Both skills are stateless prompt skills package-linked into the Vidbyte Ecosystem. They contain a modular sub-structure consisting of helper scripts and references within their respective directories.

---

## 2. Goals & Non-Goals

### Goals

- Implement `/read-paper` and `/find-papers` in the `skills/` directory of the `vidbyte-cli` repo.
- Support complete and robust instruction sets inside `skills/read-paper/SKILL.md` and `skills/find-papers/SKILL.md` with YAML frontmatter.
- Build fully-functional and clean helper JavaScript scripts under each skill's `scripts/` directory for URL resolution, full-text fetching, noise stripping, search engine querying, deduplication, and result ranking.
- Provide comprehensive references in each skill's `references/` directory for structure mapping, registry of credible sources, and domain maps.
- Register both skills in `skills-manifest.json` under the `"learning"` array.
- Version both skills in `lib/skill-versions.json` under version `"3"`.
- Ensure complete integration of `/read-paper` with the existing `vidbyte retain` command by auto-generating ready-to-run CLI invocations at the end of active learning sessions.
- Ensure that the entire codebase compiles, passes `npm test`, and runs successfully without any validation or regression errors.

### Non-Goals

- Creating new Python CLI subcommands (these skills are Type 2 Prompt Skills that run inline within the harness and leverage existing Python commands like `vidbyte retain`).
- Persisting session states or gate checkpoint results locally on disk in a database (they are session-scoped and stateless).
- Automating web fetches from node.js environment directly at install time (the Javascript scripts are packaged utilities that are shipped to target harnesses and executed by agent environments at runtime).

---

## 3. Background & Context

Modern researchers and developers struggle with "Volume Noise" (unhelpful boilerplate, repetitive introductions, and dense citation clusters) and "Comprehension Illusion" (believing they understood a paper when reading passively, only to forget it shortly after). 

Currently, the `vidbyte-cli` repo has background skills and simple prompt skills, but lacks deep research tools. `/find-papers` and `/read-paper` act as the top of the research funnel. Together, they create a highly effective workflow:
1. Discover papers with `/find-papers "<topic>"`
2. Deep dive, strip noise, and pass active learning checkpoints with `/read-paper <url>`
3. Synthesize the findings and run `vidbyte retain` to lock the core concept into spaced repetition.

Packaging these skills into version 3 (version 0.3.0) allows any harness installing version 3 to immediately gain advanced research and active-learning capabilities.

---

## 4. Requirements

### Functional Requirements

#### For `/read-paper`:
1. **URL Resolution**: Must handle arXiv (abstract/PDF/HTML), DOI, direct PDF, Semantic Scholar, and PubMed/PMC links.
2. **Fetch Strategy & Priority**: Must prioritize structured Semantic Scholar API first, falling back to arXiv HTML, open-access PDFs, publisher page abstracts, and finally abstract-only mode if no full text is available.
3. **Structure Mapping**: Must recognize standard structures, IMRaD structures, and theory/review papers to map sections correctly to the 6 signal fields: *Research Question, Why It Matters, What They Did, What They Found, Caveats and Limits, Practical Takeaway*.
4. **Noise Stripping**: Must strip affiliations, acknowledgments, bibliography, repetitive preamble, dense in-text citation clusters, raw tables, and formatting artifacts.
5. **Active Learning Gates**: Must gate each section behind a question (Decide, Explain, Predict, Apply) and require a genuine user answer before advancing.
6. **Handoff Output**: Save structured `read-paper-<slug>.md` file in the working directory containing the signal, user's in-your-own-words responses, key references, citations (APA + BibTeX), and a ready-to-run `vidbyte retain` script.
7. **Behavior Flags**: Must support `--no-gates`, `--section <name>`, `--abstract-only`, and `--cite`.

#### For `/find-papers`:
1. **Domain Inference**: Infer research domain (e.g. machine learning, clinical medicine, education) from natural language query.
2. **Query Generation**: Generate 2-3 specific academic keyword queries.
3. **Source Queries**: Perform multi-source queries across Tier 1 (peer-reviewed), Tier 2 (preprints), and Tier 3 (aggregators).
4. **Ranking & Score**: Rank by Relevance (high), Credibility (medium), and Age-Normalized Citations (low).
5. **Deduplication**: Deduplicate results using DOI first, and normalized title matching second.
6. **Output Format**: Format in clean terminal boxes showing Tier, title, authors, venue, citation counts, short summary, and direct links.
7. **Behavior Flags**: Support `--limit N`, `--tier 1`, `--source <name>`, `--recent`, `--foundational`, `--oa`, `--domain <name>`, and `--read <N>`.

### Non-Functional Requirements

- **Compliance with Validations**: The skills must strictly pass `node scripts/validate.js` checks (frontmatter name matching directory name, non-empty description, non-empty body).
- **Modularity**: Preserving clean directory structures so the installer packages them correctly.
- **Node compatibility**: Helper scripts must be written in valid vanilla JavaScript (ES modules or CommonJS matching the project type).

---

## 5. High-Level Design

The `/read-paper` and `/find-papers` skills are structured as self-contained skill packages under the `skills/` directory.

```text
vidbyte-skills/
  skills/
    read-paper/
      SKILL.md
      scripts/
        resolve-url.js
        fetch-fulltext.js
        extract-signal.js
        strip-noise.js
      references/
        section-map.md
    find-papers/
      SKILL.md
      scripts/
        search-semantic-scholar.js
        search-pubmed.js
        search-arxiv.js
        search-eric.js
        deduplicate.js
        rank-results.js
      references/
        source-registry.md
        domain-source-map.md
  lib/
    skill-versions.json
  skills-manifest.json
```

The coding harness reads the main `SKILL.md` system prompts to guide the agent behavior. When executing actions, the agent can invoke the bundled scripts in the `scripts/` directory to fetch metadata or perform operations programmatically, ensuring a highly robust, high-fidelity experience.

---

## 6. Detailed Design

### 6.1 `skills/read-paper/SKILL.md`
**File(s):** `skills/read-paper/SKILL.md`
**Type:** New file

#### What it does
Provides the main LLM system prompt instructing the agent on how to manage `/read-paper` invocations, run the active learning gates, parse structures, and write the final handoff document.

---

### 6.2 `skills/read-paper/scripts/resolve-url.js`
**File(s):** `skills/read-paper/scripts/resolve-url.js`
**Type:** New file

#### What it does
Detects the URL type (arXiv, DOI, PubMed, Semantic Scholar, direct PDF) and makes appropriate metadata API requests.

#### Interface / API
```javascript
export function resolveUrl(inputString) {
  // Returns { type: 'arxiv'|'doi'|'pdf'|'pubmed'|'semanticscholar'|'unknown', id: string, queryUrl: string }
}
```

---

### 6.3 `skills/read-paper/scripts/fetch-fulltext.js`
**File(s):** `skills/read-paper/scripts/fetch-fulltext.js`
**Type:** New file

#### What it does
Performs the hierarchical fetch strategy, trying high-quality structured versions (arXiv HTML, open access PDFs via Unpaywall, Semantic Scholar) and falling back to publisher page abstracts.

#### Interface / API
```javascript
export async function fetchFulltext(resolved) {
  // Returns { text: string, status: 'fulltext'|'abstract'|'tldr', source: string }
}
```

---

### 6.4 `skills/read-paper/scripts/extract-signal.js`
**File(s):** `skills/read-paper/scripts/extract-signal.js`
**Type:** New file

#### What it does
Implements standard parsing/mapping rules mapping section structures to the 6 signal fields.

#### Interface / API
```javascript
export function extractSignal(rawText, structureType) {
  // Returns { researchQuestion: string, whyItMatters: string, whatTheyDid: string, whatTheyFound: string, caveats: string, practicalTakeaway: string }
}
```

---

### 6.5 `skills/read-paper/scripts/strip-noise.js`
**File(s):** `skills/read-paper/scripts/strip-noise.js`
**Type:** New file

#### What it does
Noise-stripping pipeline that regexes out bibliography reference lists, in-text citation clusters, journal headers, and repetitive preambles.

#### Interface / API
```javascript
export function stripNoise(rawText) {
  // Returns string with noise stripped
}
```

---

### 6.6 `skills/read-paper/references/section-map.md`
**File(s):** `skills/read-paper/references/section-map.md`
**Type:** New file

#### What it does
Markdown guide mapping different paper structures (IMRaD, Standard, Theory/Review) to extraction fields for prompt context.

---

### 6.7 `skills/find-papers/SKILL.md`
**File(s):** `skills/find-papers/SKILL.md`
**Type:** New file

#### What it does
System prompt instructing the agent on domain inference, search query translation, ranking, and final terminal formatting.

---

### 6.8 `skills/find-papers/scripts/search-semantic-scholar.js`
**File(s):** `skills/find-papers/scripts/search-semantic-scholar.js`
**Type:** New file

#### What it does
Queries the Semantic Scholar Graph API for papers.

#### Interface / API
```javascript
export async function searchSemanticScholar(query, options = {}) {
  // Returns list of papers
}
```

---

### 6.9 `skills/find-papers/scripts/search-pubmed.js`
**File(s):** `skills/find-papers/scripts/search-pubmed.js`
**Type:** New file

#### What it does
Queries PubMed E-utilities search endpoint.

#### Interface / API
```javascript
export async function searchPubMed(query, options = {}) {
  // Returns list of papers
}
```

---

### 6.10 `skills/find-papers/scripts/search-arxiv.js`
**File(s):** `skills/find-papers/scripts/search-arxiv.js`
**Type:** New file

#### What it does
Queries arXiv API query endpoint.

#### Interface / API
```javascript
export async function searchArXiv(query, options = {}) {
  // Returns list of papers
}
```

---

### 6.11 `skills/find-papers/scripts/search-eric.js`
**File(s):** `skills/find-papers/scripts/search-eric.js`
**Type:** New file

#### What it does
Queries ERIC API endpoint.

#### Interface / API
```javascript
export async function searchERIC(query, options = {}) {
  // Returns list of papers
}
```

---

### 6.12 `skills/find-papers/scripts/deduplicate.js`
**File(s):** `skills/find-papers/scripts/deduplicate.js`
**Type:** New file

#### What it does
Deduplicates academic results from multiple databases by matching DOIs or title string similarity.

#### Interface / API
```javascript
export function deduplicate(results) {
  // Returns deduplicated list
}
```

---

### 6.13 `skills/find-papers/scripts/rank-results.js`
**File(s):** `skills/find-papers/scripts/rank-results.js`
**Type:** New file

#### What it does
Scores results based on relevance (cosine/keyword matches), credibility tiers, and normalized citation velocity.

#### Interface / API
```javascript
export function rankResults(results, originalQuery) {
  // Returns sorted and scored list
}
```

---

### 6.14 `skills/find-papers/references/source-registry.md`
**File(s):** `skills/find-papers/references/source-registry.md`
**Type:** New file

#### What it does
Markdown registry of credible Tier 1, Tier 2, and Tier 3 academic sources, including domain scopes and base URLs.

---

### 6.15 `skills/find-papers/references/domain-source-map.md`
**File(s):** `skills/find-papers/references/domain-source-map.md`
**Type:** New file

#### What it does
Guides mapping from inferred user intent domain to optimal database combinations.

---

### 6.16 `skills-manifest.json`
**File(s):** `skills-manifest.json`
**Type:** Modified

#### What it does
Adds `read-paper` and `find-papers` to the `"learning"` category array, making them discoverable by the installer.

---

### 6.17 `lib/skill-versions.json`
**File(s):** `lib/skill-versions.json`
**Type:** Modified

#### What it does
Adds `read-paper` and `find-papers` to key `"3"`, making them active in Version 3 installation scope.

---

## 7. Data Model Changes

N/A - No database tables or database schemas exist in this stateless CLI and prompt-skills repo.

---

## 8. API Changes

N/A - No new network endpoints are added to the Python CLI backend since both `/read-paper` and `/find-papers` are prompt-level cognitive skills that run inline and connect to the existing `/retain` CLI route.

---

## 9. File Change Manifest

| Action | File Path | Reason |
|--------|-----------|--------|
| CREATE | `skills/read-paper/SKILL.md` | Main instruction file for `/read-paper` |
| CREATE | `skills/read-paper/scripts/resolve-url.js` | Helper script to parse academic URLs |
| CREATE | `skills/read-paper/scripts/fetch-fulltext.js` | Hierarchical fetch pipeline |
| CREATE | `skills/read-paper/scripts/extract-signal.js` | Section to signal mapping parser |
| CREATE | `skills/read-paper/scripts/strip-noise.js` | Noise removal utility |
| CREATE | `skills/read-paper/references/section-map.md` | Structure-to-field reference mapping |
| CREATE | `skills/find-papers/SKILL.md` | Main instruction file for `/find-papers` |
| CREATE | `skills/find-papers/scripts/search-semantic-scholar.js` | Semantic Scholar querying logic |
| CREATE | `skills/find-papers/scripts/search-pubmed.js` | PubMed querying logic |
| CREATE | `skills/find-papers/scripts/search-arxiv.js` | arXiv querying logic |
| CREATE | `skills/find-papers/scripts/search-eric.js` | ERIC querying logic |
| CREATE | `skills/find-papers/scripts/deduplicate.js` | Deduplication algorithm |
| CREATE | `skills/find-papers/scripts/rank-results.js` | Scoring and sorting algorithm |
| CREATE | `skills/find-papers/references/source-registry.md` | Credible database metadata reference |
| CREATE | `skills/find-papers/references/domain-source-map.md` | Intent to source database mapping |
| MODIFY | `skills-manifest.json` | Register skills under the "learning" category |
| MODIFY | `lib/skill-versions.json` | Register skills in Version 3 |

---

## 10. Testing Plan

### Unit Tests

We will run the project's validation suite which runs structural linting and metadata validation on all skills.
- Run `node scripts/validate.js` to ensure skills matching directory, have frontmatter, description, and valid bodies.
- Verify `lib/skill-versions.json` validation holds.

### Integration Tests

- Run `npm test` which validates all skills, triggers the package smoke test, and verifies installer routing.

### Manual / QA Test Cases

1. **Active Learning Gate Checkpoint**:
   - Given the user invokes `/read-paper https://arxiv.org/abs/2301.10140`, the model should resolve the URL, fetch metadata via Semantic Scholar or arXiv HTML, display the header, and show section 1 (Research Question + Why It Matters).
   - The model must halt and ask a "Decide" question.
   - The user must provide an explanation, and the model must validate and issue a "PASS" before displaying Section 2 (What They Did) and the next gate.
   
2. **Abstract-Only Mode**:
   - Given the user invokes `/read-paper https://example.com/paywalled.pdf --abstract-only` or when a full-text fetch fails, the skill must explicitly notify the user: *"Full text not accessible — working from abstract and metadata. Results will be less detailed."* and present abstract-level extraction.

3. **Multi-Source Paper Search**:
   - Given the user invokes `/find-papers "transformer attention mechanism efficiency"`, the skill must infer the CS domain, prioritize arXiv/Semantic Scholar/IEEE, generate academic keyword queries, and output ranked paper results formatted in clean terminal boxes.

---

## 11. Dependencies & External Services

| Dependency | Version / Endpoint | Purpose | Risk |
|------------|--------------------|---------|------|
| Semantic Scholar API | `https://api.semanticscholar.org/graph/v1` | Academic search + citation metadata | API rate limits (unauthenticated limits apply) |
| arXiv API | `https://export.arxiv.org/api` | Academic preprint searches | Slow response times |
| PubMed API | `https://eutils.ncbi.nlm.nih.gov/entrez` | Medical and clinical paper database | None |
| ERIC API | `https://api.ies.ed.gov/eric` | Educational research database | None |

---

## 12. Rollout & Deployment

- No breaking changes. Both skills are purely additive.
- The installer dynamically bundles and copies all scripts and files under `skills/read-paper/` and `skills/find-papers/` on subsequent installs, facilitating instant developer deployment.

---

## 13. Open Questions

- [x] Should rate-limit handlers or fallback keys be structured in the helper files? *Yes, the scripts are designed to catch and handle API failures gracefully, falling back to other search engines or unpaywalled abstract APIs.*

---

## 14. Alternatives Considered

### Alternative 1: Flat SKILL.md without helper scripts

- **What**: Combine all JS logic into pure prompt guidelines.
- **Why rejected**: A research-grade skill needs highly precise algorithms for URL resolution, noise regex cleaning, API endpoint construction, and ranking weights. Documenting this solely in natural language prompt text would consume massive token count, clutter prompt context, and result in less reliable formatting. Bundling clean scripts in the `scripts/` directory ensures precise execution and aligns perfectly with the multi-file version 3 architecture rules.
