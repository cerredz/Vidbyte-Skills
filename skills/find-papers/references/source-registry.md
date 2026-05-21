<!--
CONTEXT PROTOCOL HEADER
Description: Credible academic source registry reference for the find-papers skill.
Purpose: Documents available database APIs, tiers, base endpoints, and credential scopes.
Architecture: Markdown tables containing source categories and technical descriptions.
Functions/Key Elements: Tier 1 registries, Tier 2 registries, Tier 3 registries.
Relation to Codebase: Packaged inside skills/find-papers/references/ and referenced by the main search prompt.
Similar Files: skills/read-paper/references/section-map.md.
-->

# Reference: Credible Academic Source Registry

This document lists the official academic sources mapped within the `/find-papers` skill, categorized by their structural tier.

---

## 1. Tier 1 — Peer-Reviewed and Indexed (Highest Credibility)

| Source | Scope / Domain | Endpoint | Access Details |
|---|---|---|---|
| **PubMed / MEDLINE** | Biology, Medicine, Neuroscience, Psychology | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` | Public API, no key required |
| **PubMed Central (PMC)** | Biomedical full-text | `https://www.ncbi.nlm.nih.gov/pmc/` | Free Open Access |
| **IEEE Xplore** | EE, CS, Electronics | Web Search / API | Index search |
| **ACM Digital Library** | Computer Science, HCI, Programming | Web Search / API | Index search |
| **Nature / Science** | Multidisciplinary | Web Search / RSS | High impact factor journals |

---

## 2. Tier 2 — Preprint Servers (Not Peer-Reviewed, Highly Current)

| Source | Scope / Domain | Endpoint | Access Details |
|---|---|---|---|
| **arXiv** | ML, AI, CS, Math, Physics, Stats | `https://export.arxiv.org/api/query` | Free API, no key required |
| **bioRxiv / medRxiv** | Biology, Medicine | Web Search | Preprint |
| **SSRN** | Social Sciences, Economics, Law | Web Search | Preprint |
| **ERIC** | Education | `https://api.ies.ed.gov/eric/` | Free API, no key required |

---

## 3. Tier 3 — Academic Aggregators (Cross-Database Search)

| Source | Scope / Domain | Endpoint | Access Details |
|---|---|---|---|
| **Semantic Scholar** | Multidisciplinary (200M+ papers) | `https://api.semanticscholar.org/graph/v1` | Free search API, no key required |
| **OpenAlex** | Fully open index (250M+ records) | `https://api.openalex.org/` | Free public endpoint |
| **Crossref** | DOI Metadata (150M+ works) | `https://api.crossref.org/` | Free query API |
