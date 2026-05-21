/*
CONTEXT PROTOCOL HEADER
Description: Text noise-stripping pipeline for the read-paper skill.
Purpose: Cleans academic text formatting artifacts, citations, reference sections, and repetitive preamble.
Architecture: ES module containing regex replacements.
Functions/Key Elements: stripNoise, stripCitationClusters, stripBibliography.
Relation to Codebase: Packaged inside skills/read-paper/scripts/ and run programmatically.
Similar Files: skills/read-paper/scripts/extract-signal.js.
*/

export function stripCitationClusters(text) {
  // Regex to capture bracketed citations like (Smith, 2019; Jones et al., 2020)
  // or [1, 2, 3] and replace them with [N refs] or [N] references.
  const parenthesizedCitation = /\((?:[A-Za-z]+(?:\s+et\s+al\.?)?,\s*\d{4};?\s*)+\)/g;
  
  return text.replace(parenthesizedCitation, (match) => {
    const count = match.split(";").length;
    return `[${count} ref${count > 1 ? "s" : ""}]`;
  });
}

export function stripBibliography(text) {
  // Find "References" or "Bibliography" headings and slice off the content
  const refsRegex = /\n(?:References|Bibliography|Works\s+Cited)\r?\n/i;
  const match = text.match(refsRegex);
  
  if (match && match.index) {
    return text.substring(0, match.index) + "\n\n[Bibliography list stripped - replaced with Key References section]";
  }
  
  return text;
}

export function stripNoise(text) {
  if (!text || typeof text !== "string") return "";

  let cleaned = text;
  cleaned = stripBibliography(cleaned);
  cleaned = stripCitationClusters(cleaned);

  // Strip author ORCIDs, emails and affiliations
  cleaned = cleaned.replace(/orcid(?:\.org)?\/[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]/gi, "");
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email]");

  // Strip repetitive preambles
  cleaned = cleaned.replace(/in\s+this\s+paper\s+we\s+(?:will\s+)?(?:argue|show|demonstrate)\s+that/gi, "we demonstrate that");

  return cleaned.trim();
}
