#!/usr/bin/env node
/**
 * extract-concepts.js
 *
 * Extracts core concepts from documentation page content using heuristics
 * that target common documentation structural patterns.
 */

/**
 * @typedef {Object} Concept
 * @property {string} name - Concept name
 * @property {string} description - 2-3 sentence description
 */

/**
 * Section heading patterns that indicate concept sections.
 */
const CONCEPT_SECTION_HEADINGS = [
  /^#+\s*(core\s+)?concepts?/i,
  /^#+\s*fundamentals/i,
  /^#+\s*key\s+ideas?/i,
  /^#+\s*essentials/i,
  /^#+\s*main\s+concepts?/i,
  /^#+\s*important\s+concepts?/i,
  /^#+\s*basic\s+concepts?/i,
  /^#+\s*how\s+it\s+works/i,
  /^#+\s*architecture/i,
  /^#+\s*mental\s+model/i,
];

/**
 * Patterns that indicate a term is a core concept being defined.
 */
const CONCEPT_DEFINITION_PATTERNS = [
  /^\*\*(.+?)\*\*\s*(?:is|are|refers to|represents|means)\s+/i,
  /^(.+?)\s+is an?\s+/i,
  /^The\s+(.+?)\s+is the\s+/i,
  /^A\s+(.+?)\s+is an?\s+/i,
  /^(.+?)\s+represents\s+/i,
  /^In\s+\w+,\s+a?\s*(.+?)\s+is\s+/i,
];

/**
 * Terms that indicate the surrounding text is NOT a concept but an API method.
 */
const API_METHOD_INDICATORS = [
  /\b(method|function|class|parameter|argument|return|prop|attribute|endpoint)\b/i,
  /\(\)/,
  /=>/,
  /^[A-Z][a-z]+\./,
];

/**
 * Check if text looks like an API method definition rather than a concept.
 * @param {string} text
 * @returns {boolean}
 */
function isApiMethod(text) {
  return API_METHOD_INDICATORS.some((pattern) => pattern.test(text));
}

/**
 * Clean and normalize a concept name.
 * @param {string} raw
 * @returns {string}
 */
function cleanConceptName(raw) {
  return raw.replace(/^[^a-zA-Z]+/, "").replace(/[^a-zA-Z0-9\s-]+$/, "").trim();
}

/**
 * Extract a description from text following a concept definition.
 * Returns up to 3 sentences.
 * @param {string} text - Full paragraph or section text
 * @returns {string}
 */
function extractDescription(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, 3).join(" ").trim();
}

/**
 * Find the section of text that likely contains concept definitions.
 * @param {string} content - Full page content (markdown or text)
 * @returns {string[]} Array of paragraphs from concept sections
 */
function findConceptSections(content) {
  const lines = content.split("\n");
  const paragraphs = [];
  let inConceptSection = false;
  let currentParagraph = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if we're entering or exiting a concept section
    if (CONCEPT_SECTION_HEADINGS.some((pattern) => pattern.test(line))) {
      inConceptSection = true;
      if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = "";
      }
      continue;
    }

    // A new heading of the same level exits the concept section
    if (inConceptSection && /^#+\s/.test(line) && !CONCEPT_SECTION_HEADINGS.some((p) => p.test(line))) {
      inConceptSection = false;
      if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = "";
      }
      continue;
    }

    if (inConceptSection && line.length > 0) {
      currentParagraph += " " + line;
    }

    // Paragraph break
    if (line.length === 0 && inConceptSection && currentParagraph) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = "";
    }
  }

  // Flush last paragraph
  if (currentParagraph.trim()) {
    paragraphs.push(currentParagraph.trim());
  }

  // If no concept sections found, take all paragraphs as candidates
  if (paragraphs.length === 0) {
    let para = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0 && para.length > 0) {
        paragraphs.push(para.trim());
        para = "";
      } else if (trimmed.length > 0) {
        para += " " + trimmed;
      }
    }
    if (para.trim()) paragraphs.push(para.trim());
  }

  return paragraphs;
}

/**
 * Extract up to five core concepts from documentation page content.
 * @param {string} conceptsPageText - Core concepts / fundamentals page content
 * @param {string} quickstartPageText - Quick-start page content (supplemental)
 * @returns {Concept[]}
 */
export function extractConcepts(conceptsPageText, quickstartPageText) {
  const combinedContent = [conceptsPageText, quickstartPageText].filter(Boolean).join("\n\n");
  const paragraphs = findConceptSections(combinedContent);
  const concepts = [];
  const seenNames = new Set();

  for (const paragraph of paragraphs) {
    if (concepts.length >= 5) break;

    // Try to find a concept definition pattern
    let found = false;
    for (const pattern of CONCEPT_DEFINITION_PATTERNS) {
      const match = paragraph.match(pattern);
      if (match) {
        const rawName = match[1].trim();
        const name = cleanConceptName(rawName);

        // Quality filters
        if (name.length < 3) continue;
        if (name.length > 60) continue;
        if (seenNames.has(name.toLowerCase())) continue;
        if (isApiMethod(paragraph)) continue;

        const description = extractDescription(paragraph);
        if (description.length < 20) continue;

        concepts.push({ name, description });
        seenNames.add(name.toLowerCase());
        found = true;
        break;
      }
    }

    // Fallback: look for bold terms that might be concepts
    if (!found) {
      const boldMatches = paragraph.match(/\*\*(.+?)\*\*/g);
      if (boldMatches) {
        for (const boldMatch of boldMatches) {
          if (concepts.length >= 5) break;
          const name = cleanConceptName(boldMatch.replace(/\*\*/g, ""));
          if (name.length < 3 || name.length > 60) continue;
          if (seenNames.has(name.toLowerCase())) continue;
          if (isApiMethod(name)) continue;

          const description = extractDescription(paragraph);
          if (description.length < 20) continue;

          concepts.push({ name, description });
          seenNames.add(name.toLowerCase());
        }
      }
    }
  }

  return concepts;
}

// CLI entry point
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: node extract-concepts.js <concepts-page-text> [quickstart-page-text]");
    console.error("  Reads page content from stdin or file paths.");
    process.exit(1);
  }

  import("node:fs").then((fs) => {
    const conceptsText = fs.readFileSync(args[0], "utf8");
    const quickstartText = args[1] ? fs.readFileSync(args[1], "utf8") : "";

    const concepts = extractConcepts(conceptsText, quickstartText);
    console.log(JSON.stringify(concepts, null, 2));
  });
}
