/*
CONTEXT PROTOCOL HEADER
Description: Result deduplication script for the find-papers skill.
Purpose: Combines academic paper lists and filters out duplicates by DOI or title matching.
Architecture: ES module exposing clean string normalization and set-based filtering.
Functions/Key Elements: deduplicate, normalizeTitle.
Relation to Codebase: Packaged inside skills/find-papers/scripts/ and run programmatically.
Similar Files: skills/find-papers/scripts/rank-results.js.
*/

export function normalizeTitle(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // strip all non-alphanumeric
    .trim();
}

export function deduplicate(results) {
  if (!Array.isArray(results)) return [];

  const seenDois = new Set();
  const seenTitles = new Set();
  const deduped = [];

  for (const paper of results) {
    // Deduplicate by DOI first if it exists
    if (paper.doi) {
      const doiKey = paper.doi.toLowerCase().trim();
      if (seenDois.has(doiKey)) {
        continue;
      }
      seenDois.add(doiKey);
    }

    // Deduplicate by title similarity
    const titleKey = normalizeTitle(paper.title);
    if (seenTitles.has(titleKey)) {
      continue;
    }
    seenTitles.add(titleKey);

    deduped.push(paper);
  }

  return deduped;
}
