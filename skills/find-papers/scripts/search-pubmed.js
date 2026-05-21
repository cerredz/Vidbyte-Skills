/*
CONTEXT PROTOCOL HEADER
Description: PubMed search query script for the find-papers skill.
Purpose: Executes searches against the free PubMed E-utilities API for medicine and biology papers.
Architecture: ES module querying PubMed E-search and mapping outcomes.
Functions/Key Elements: searchPubMed.
Relation to Codebase: Packaged inside skills/find-papers/scripts/ and run programmatically.
Similar Files: skills/find-papers/scripts/search-semantic-scholar.js.
*/

export async function searchPubMed(query, options = {}) {
  const limit = options.limit || 10;
  const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`;

  try {
    const response = await fetch(esearchUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`PubMed esearch returned status ${response.status}`);
    }

    const searchData = await response.json();
    const idList = searchData.esearchresult ? searchData.esearchresult.idlist : [];

    if (idList.length === 0) {
      return [];
    }

    // PubMed summary fetch
    const esummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(",")}&retmode=json`;
    const summaryResponse = await fetch(esummaryUrl, { signal: AbortSignal.timeout(5000) });

    if (!summaryResponse.ok) {
      throw new Error(`PubMed esummary returned status ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();
    const results = [];

    for (const id of idList) {
      const uidData = summaryData.result ? summaryData.result[id] : null;
      if (!uidData) continue;

      results.push({
        title: uidData.title || "Unknown Title",
        authors: uidData.authors ? uidData.authors.map(a => a.name).join(", ") : "Unknown",
        year: uidData.pubdate ? uidData.pubdate.substring(0, 4) : "n.d.",
        venue: uidData.source || "PubMed",
        citationCount: 0, // PubMed E-utilities doesn't return citation count easily
        tier: "[Tier 1 — Peer Reviewed]",
        tldr: "Abstract available on landing page.",
        doi: uidData.articleids ? uidData.articleids.find(i => i.idtype === "doi")?.value : null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        openAccessPdf: null
      });
    }

    return results;

  } catch (error) {
    console.error(`[PubMed Search Error]: ${error.message}`);
    return [];
  }
}
