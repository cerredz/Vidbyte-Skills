/*
CONTEXT PROTOCOL HEADER
Description: Text parser and jargon term extraction engine for the jargon utility skill.
Purpose: Cleans user-submitted dense texts and identifies potential jargon candidates based on casing, compound-word structures, and frequency checks.
Architecture: ES Module exporting utility cleaning and extraction functions.
Key Functions:
  - cleanText: standardizes newlines, spaces, and punctuation in raw text blocks.
  - extractPotentialTerms: scans text blocks to extract candidate multi-word or compound terms.
Relation to Codebase: Packaged inside skills/jargon/scripts/ and run programmatically during ingestion.
Similar Files: skills/find-papers/scripts/deduplicate.js.
*/

export function cleanText(input) {
  if (!input || typeof input !== "string") {
    return "";
  }
  return input
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractPotentialTerms(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const cleaned = cleanText(text);
  const candidates = new Set();

  // 1. Extract compound words or acronyms (e.g. multi-agent, API, LSTM, zero-knowledge)
  const compoundRegex = /\b[A-Za-z]+-[A-Za-z]+\b|\b[A-Z]{2,6}\b/g;
  let match;
  while ((match = compoundRegex.exec(cleaned)) !== null) {
    candidates.add(match[0]);
  }

  // 2. Extract title-cased sequences (potential proper nouns/technical phrases like "Attention Mechanism" or "Smart Contract")
  const titleCaseRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
  while ((match = titleCaseRegex.exec(cleaned)) !== null) {
    candidates.add(match[0]);
  }

  // 3. Extract words that are relatively long or complex (over 8 characters)
  const longWordsRegex = /\b[a-zA-Z]{9,20}\b/g;
  while ((match = longWordsRegex.exec(cleaned)) !== null) {
    const word = match[0].toLowerCase();
    // Simple filter to skip extremely common non-jargon long words
    const commonStopWords = ["something", "different", "important", "processes", "including", "structure"];
    if (!commonStopWords.includes(word)) {
      candidates.add(match[0]);
    }
  }

  return Array.from(candidates);
}
