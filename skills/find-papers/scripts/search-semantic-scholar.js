/*
CONTEXT PROTOCOL HEADER
Description: Semantic Scholar Graph API query script for the find-papers skill.
Purpose: Executes queries against the free Semantic Scholar search API to discover academic papers.
Architecture: ES module containing asynchronous fetch routing and response mapping.
Functions/Key Elements: searchSemanticScholar.
Relation to Codebase: Packaged inside skills/find-papers/scripts/ and run programmatically.
Similar Files: skills/find-papers/scripts/search-arxiv.js.
*/

export async function searchSemanticScholar(query, options = {}) {
  const limit = options.limit || 10;
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,abstract,year,authors,venue,citationCount,openAccessPdf,tldr,externalIds,isOpenAccess`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Vidbyte-Skills-Client/1.0" },
      signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) {
      throw new Error(`Semantic Scholar API returned status ${response.status}`);
    }

    const data = await response.json();

    if (!data.data) {
      return [];
    }

    return data.data.map((paper) => {
      const isPeerReviewed = paper.venue && !/arxiv|biorxiv|medrxiv|ssrn/i.test(paper.venue);
      let tier = "[Aggregator — Unverified]";
      if (isPeerReviewed) {
        tier = "[Tier 1 — Peer Reviewed]";
      } else if (paper.venue) {
        tier = "[Tier 2 — Preprint]";
      }

      return {
        title: paper.title,
        authors: paper.authors ? paper.authors.map(a => a.name).join(", ") : "Unknown",
        year: paper.year || "n.d.",
        venue: paper.venue || "Semantic Scholar",
        citationCount: paper.citationCount || 0,
        tier,
        tldr: paper.tldr ? paper.tldr.text : (paper.abstract ? paper.abstract.substring(0, 160) + "..." : "No abstract available"),
        doi: paper.externalIds ? paper.externalIds.DOI : null,
        url: paper.externalIds && paper.externalIds.DOI ? `https://doi.org/${paper.externalIds.DOI}` : `https://www.semanticscholar.org/paper/${paper.paperId}`,
        openAccessPdf: paper.openAccessPdf ? paper.openAccessPdf.url : null
      };
    });

  } catch (error) {
    console.error(`[Semantic Scholar Search Error]: ${error.message}`);
    return [];
  }
}
