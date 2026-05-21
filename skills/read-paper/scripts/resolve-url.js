/*
CONTEXT PROTOCOL HEADER
Description: URL and identifier resolver for the read-paper skill.
Purpose: Parses research paper URLs (arXiv, DOI, PubMed, Semantic Scholar, PDF) to extract standard IDs and format external API endpoints.
Architecture: ES module exporting utility functions for regex-based URL type classification.
Functions/Key Elements: resolveUrl, extractArxivId, extractDoi, extractPubmedId, extractSemanticScholarHash.
Relation to Codebase: Packaged inside skills/read-paper/scripts/ and executed during session initialization.
Similar Files: skills/read-paper/scripts/fetch-fulltext.js.
*/

export function resolveUrl(input) {
  if (!input || typeof input !== "string") {
    return { type: "unknown", id: null, queryUrl: null };
  }

  const trimmed = input.trim();

  // 1. arXiv
  const arxivRegex = /(?:arxiv\.org\/(?:abs|pdf|html)\/|arxiv:)\s*([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)/i;
  const arxivMatch = trimmed.match(arxivRegex);
  if (arxivMatch) {
    const id = arxivMatch[1];
    return {
      type: "arxiv",
      id,
      queryUrl: `https://api.semanticscholar.org/graph/v1/paper/ARXIV:${id}?fields=title,abstract,year,authors,venue,tldr,openAccessPdf,citationCount,externalIds`
    };
  }

  // 2. PubMed
  const pubmedRegex = /(?:pubmed\.ncbi\.nlm\.nih\.gov\/|pmid:\s*)([0-9]+)/i;
  const pubmedMatch = trimmed.match(pubmedRegex);
  if (pubmedMatch) {
    const id = pubmedMatch[1];
    return {
      type: "pubmed",
      id,
      queryUrl: `https://api.semanticscholar.org/graph/v1/paper/PMID:${id}?fields=title,abstract,year,authors,venue,tldr,openAccessPdf,citationCount,externalIds`
    };
  }

  // 3. DOI
  const doiRegex = /(?:doi\.org\/|doi:\s*)(10\.[0-9]{4,}(?:\.[0-9]+)*\/[^\s]+)/i;
  const doiMatch = trimmed.match(doiRegex);
  if (doiMatch) {
    const id = doiMatch[1];
    return {
      type: "doi",
      id,
      queryUrl: `https://api.semanticscholar.org/graph/v1/paper/DOI:${id}?fields=title,abstract,year,authors,venue,tldr,openAccessPdf,citationCount,externalIds`
    };
  }

  // 4. Semantic Scholar
  const ssRegex = /semanticscholar\.org\/paper\/(?:[^\s\/]+\/)?([a-f0-9]{40})/i;
  const ssMatch = trimmed.match(ssRegex);
  if (ssMatch) {
    const id = ssMatch[1];
    return {
      type: "semanticscholar",
      id,
      queryUrl: `https://api.semanticscholar.org/graph/v1/paper/${id}?fields=title,abstract,year,authors,venue,tldr,openAccessPdf,citationCount,externalIds`
    };
  }

  // 5. Direct PDF
  if (trimmed.endsWith(".pdf") || trimmed.includes("/pdf/")) {
    return {
      type: "pdf",
      id: trimmed,
      queryUrl: trimmed
    };
  }

  return {
    type: "unknown",
    id: trimmed,
    queryUrl: trimmed
  };
}
