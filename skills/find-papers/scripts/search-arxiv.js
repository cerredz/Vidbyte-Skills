/*
CONTEXT PROTOCOL HEADER
Description: arXiv API search script for the find-papers skill.
Purpose: Executes searches against the open arXiv preprint directory API.
Architecture: ES module querying arXiv export API and parsing XML metadata responses.
Functions/Key Elements: searchArXiv.
Relation to Codebase: Packaged inside skills/find-papers/scripts/ and run programmatically.
Similar Files: skills/find-papers/scripts/search-pubmed.js.
*/

export async function searchArXiv(query, options = {}) {
  const limit = options.limit || 10;
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${limit}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`arXiv API returned status ${response.status}`);
    }

    const xmlText = await response.text();

    // XML parsing heuristics (since xml2js is not standard in vanilla without install)
    const entries = xmlText.split("<entry>");
    if (entries.length <= 1) {
      return [];
    }

    const results = [];
    for (let i = 1; i < entries.length; i++) {
      const entry = entries[i];

      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
      const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);
      
      const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : "Unknown Title";
      const idUrl = idMatch ? idMatch[1].trim() : "";
      const arxivId = idUrl ? idUrl.substring(idUrl.lastIndexOf("/") + 1).split("v")[0] : "";
      const tldr = summaryMatch ? summaryMatch[1].trim().substring(0, 160).replace(/\s+/g, " ") + "..." : "";
      const year = publishedMatch ? publishedMatch[1].substring(0, 4) : "n.d.";

      // Extract authors
      const authorMatches = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)];
      const authors = authorMatches.map(m => m[1].trim()).join(", ") || "Unknown";

      results.push({
        title,
        authors,
        year,
        venue: "arXiv",
        citationCount: 0,
        tier: "[Tier 2 — Preprint]",
        tldr,
        doi: null,
        url: idUrl || `https://arxiv.org/abs/${arxivId}`,
        openAccessPdf: idUrl ? idUrl.replace("/abs/", "/pdf/") + ".pdf" : null
      });
    }

    return results;

  } catch (error) {
    console.error(`[arXiv Search Error]: ${error.message}`);
    return [];
  }
}
