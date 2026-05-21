<!--
CONTEXT PROTOCOL HEADER
Description: Domain-to-source mapping guide for the find-papers skill.
Purpose: Helps the search agent target optimal databases based on the inferred user query domain.
Architecture: Markdown tables containing domain scopes and priority databases.
Functions/Key Elements: Computer Science domain map, Biology/Medicine domain map, Education domain map, Psychology/Cognitive science map.
Relation to Codebase: Packaged inside skills/find-papers/references/ and referenced by the search prompt.
Similar Files: skills/read-paper/references/section-map.md.
-->

# Reference: Domain-to-Source Mapping

This guide helps the `/find-papers` search agent map the inferred domain of a user prompt to the most effective academic database combinations.

---

## 1. Mappings Table

| Inferred Domain | Primary Source | Secondary Source | Web Search Filter |
|---|---|---|---|
| **Computer Science, AI, ML** | Semantic Scholar | arXiv | `site:arxiv.org OR site:dl.acm.org OR site:ieeexplore.ieee.org` |
| **Medicine, Biology, neuroscience** | PubMed | Semantic Scholar | `site:pubmed.ncbi.nlm.nih.gov OR site:ncbi.nlm.nih.gov/pmc` |
| **Education Research** | ERIC | Semantic Scholar | `site:eric.ed.gov OR filetype:pdf site:*.edu` |
| **Psychology, Cognitive Science** | PubMed | Semantic Scholar | `site:pubmed.ncbi.nlm.nih.gov OR site:biorxiv.org` |
| **Economics, Law, Social Sciences** | Semantic Scholar | Crossref | `site:ssrn.com OR site:nber.org` |
| **General / Multidisciplinary** | Semantic Scholar | OpenAlex | `site:nature.com OR site:science.org OR site:pnas.org` |

---

## 2. Invalidation & Fallback Procedures
1. **Fallback search**: If a domain-specific API call (like PubMed or ERIC) fails, immediately fallback to querying **Semantic Scholar Graph API** as the primary search engine, which indexes all domain scopes.
2. **Preprint filtering**: If the user passes `--tier 1` or `--no-preprints`, exclude **arXiv**, **bioRxiv**, and other preprint search routes.
3. **Open Access filtering**: If the user passes `--oa`, prioritize results that carry a verified `openAccessPdf` URL, filtering out metadata-only results.
