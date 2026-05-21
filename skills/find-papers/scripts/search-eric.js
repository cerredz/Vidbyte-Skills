/*
CONTEXT PROTOCOL HEADER
Description: ERIC database search script for the find-papers skill.
Purpose: Executes searches against the free ERIC education database API.
Architecture: ES module querying ERIC API and mapping responses.
Functions/Key Elements: searchERIC.
Relation to Codebase: Packaged inside skills/find-papers/scripts/ and run programmatically.
Similar Files: skills/find-papers/scripts/search-arxiv.js.
*/

export async function searchERIC(query, options = {}) {
  const limit = options.limit || 10;
  const url = `https://api.ies.ed.gov/eric/?search=${encodeURIComponent(query)}&rows=${limit}&format=json`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`ERIC API returned status ${response.status}`);
    }

    const data = await response.json();
    const docs = data.response ? data.response.docs : [];

    return docs.map((doc) => {
      const year = doc.publicationdateyear || "n.d.";
      const authors = doc.author ? (Array.isArray(doc.author) ? doc.author.join(", ") : doc.author) : "Unknown";
      const title = doc.title || "Unknown Title";

      return {
        title,
        authors,
        year: String(year),
        venue: doc.source || "ERIC",
        citationCount: 0,
        tier: "[Tier 1 — Peer Reviewed]",
        tldr: doc.description ? doc.description.substring(0, 160) + "..." : "No description available",
        doi: doc.peerreviewed === "T" ? "Yes" : null,
        url: `https://eric.ed.gov/?id=${doc.id}`,
        openAccessPdf: doc.url || null
      };
    });

  } catch (error) {
    console.error(`[ERIC Search Error]: ${error.message}`);
    return [];
  }
}
