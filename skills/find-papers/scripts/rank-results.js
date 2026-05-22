/*
CONTEXT PROTOCOL HEADER
Description: Scorer and ranker script for the find-papers skill.
Purpose: Ranks discovered academic papers by combining keyword relevance, source credibility, and normalized citation count.
Architecture: ES module containing ranking heuristics.
Functions/Key Elements: rankResults, calculateRelevanceScore, getTierWeight, getCitationWeight.
Relation to Codebase: Packaged inside skills/find-papers/scripts/ and run programmatically.
Similar Files: skills/find-papers/scripts/deduplicate.js.
*/

export function calculateRelevanceScore(title, summary, originalQuery) {
  const queryWords = originalQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return 1.0;

  const targetText = `${title} ${summary}`.toLowerCase();
  let matches = 0;

  for (const word of queryWords) {
    if (targetText.includes(word)) {
      matches += 1;
    }
  }

  // Jaccard-like or simple keyword occurrence ratio
  return matches / queryWords.length;
}

export function getTierWeight(tier) {
  switch (tier) {
    case "[Tier 1 — Peer Reviewed]":
      return 1.0;
    case "[Tier 2 — Conference]":
      return 0.9;
    case "[Tier 2 — Preprint]":
      return 0.7;
    case "[Aggregator — Unverified]":
    default:
      return 0.5;
  }
}

export function getCitationWeight(citationCount, year) {
  const currentYear = new Date().getFullYear();
  const age = Math.max(1, currentYear - Number(year) || 1);

  // Citations per year (velocity)
  const velocity = citationCount / age;

  // Logarithmic scaling so high citations don't completely skew findings
  return Math.min(1.0, Math.log1p(velocity) / 5);
}

export function rankResults(results, originalQuery) {
  if (!Array.isArray(results)) return [];

  return results
    .map((paper) => {
      const relevance = calculateRelevanceScore(paper.title, paper.tldr, originalQuery);
      const tierWeight = getTierWeight(paper.tier);
      const citationWeight = getCitationWeight(paper.citationCount, paper.year);

      // Relevance (weight: 0.5) + Credibility (weight: 0.3) + Impact (weight: 0.2)
      const score = (relevance * 0.5) + (tierWeight * 0.3) + (citationWeight * 0.2);

      return { ...paper, score };
    })
    .sort((a, b) => b.score - a.score);
}
