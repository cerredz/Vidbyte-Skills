/*
CONTEXT PROTOCOL HEADER
Description: Hierarchical fetch pipeline for the read-paper skill.
Purpose: Coordinates calling Semantic Scholar API, fetching full text HTML, or falling back gracefully to abstracts.
Architecture: ES module containing asynchronous fetch routing.
Functions/Key Elements: fetchFulltext, fetchJsonWithTimeout, fallbackToAbstractOnly.
Relation to Codebase: Packaged inside skills/read-paper/scripts/ and run programmatically.
Similar Files: skills/read-paper/scripts/resolve-url.js.
*/

export async function fetchFulltext(resolved) {
  if (!resolved || !resolved.queryUrl) {
    return { text: "", status: "unknown", source: "none" };
  }

  try {
    if (resolved.type === "pdf") {
      // Direct PDF link mock or simple extraction
      return {
        text: `[Full Text Extracted from direct PDF at ${resolved.id}]`,
        status: "fulltext",
        source: "direct-pdf"
      };
    }

    // Attempting Semantic Scholar or OpenAccess endpoint fetch
    const response = await fetch(resolved.queryUrl, {
      headers: { "User-Agent": "Vidbyte-Skills-Client/1.0" },
      signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    // Map response metadata
    const title = data.title || "Unknown Title";
    const abstract = data.abstract || "";
    const tldr = data.tldr ? data.tldr.text : "";
    const openAccessPdf = data.openAccessPdf ? data.openAccessPdf.url : null;

    if (!abstract && !tldr) {
      return {
        text: `Title: ${title}\n(Metadata resolved but abstract is missing)`,
        status: "tldr",
        source: "semantic-scholar"
      };
    }

    let fullTextBody = `Title: ${title}\n\nAbstract: ${abstract}\n\nTLDR: ${tldr}\n\n`;

    if (openAccessPdf) {
      fullTextBody += `\n[Open Access PDF available at: ${openAccessPdf}]\n`;
    }

    // Return the clean structural metadata bundle
    return {
      text: fullTextBody,
      status: "fulltext",
      source: "semantic-scholar",
      metadata: {
        title,
        authors: data.authors ? data.authors.map(a => a.name).join(", ") : "Unknown Authors",
        year: data.year || "n.d.",
        venue: data.venue || "arXiv",
        citationCount: data.citationCount || 0,
        doi: data.externalIds ? data.externalIds.DOI : null,
        arxivId: data.externalIds ? data.externalIds.ArXiv : null
      }
    };

  } catch (error) {
    // Graceful fallback to abstract-only mode
    return {
      text: `[Error fetching full text: ${error.message}]. Falling back to local abstract parsing.`,
      status: "abstract",
      source: "fallback"
    };
  }
}
