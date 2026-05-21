#!/usr/bin/env node
/**
 * extract-operations.js
 *
 * Extracts common operations with code examples from documentation page content.
 */

/**
 * @typedef {Object} Operation
 * @property {string} name - Operation name in plain English
 * @property {string} code - Minimal working code example
 * @property {string} note - Optional usage note
 */

/**
 * Section heading patterns that indicate operation / how-to sections.
 */
const OPERATION_SECTION_HEADINGS = [
  /^#+\s*(how\s+to|using|working\s+with|common\s+operations?|examples?|usage|basic\s+usage)/i,
  /^#+\s*(getting\s+started|quick\s*start|tutorial|guide|walkthrough)/i,
  /^#+\s*(features?|recipes?|patterns?|tasks?)/i,
];

/**
 * Language comment markers for common languages.
 */
const LANGUAGE_COMMENTS = {
  js: "//",
  javascript: "//",
  jsx: "//",
  ts: "//",
  typescript: "//",
  tsx: "//",
  py: "#",
  python: "#",
  rb: "#",
  ruby: "#",
  sh: "#",
  bash: "#",
  yaml: "#",
  yml: "#",
  go: "//",
  rust: "//",
  java: "//",
  kotlin: "//",
  swift: "//",
  c: "//",
  cpp: "//",
  cs: "//",
  php: "//",
  sql: "--",
  r: "#",
  scala: "//",
  elixir: "#",
  lua: "--",
  haskell: "--",
  dart: "//",
};

/**
 * Extract code blocks from markdown content.
 * Handles both fenced code blocks (```) and indented code blocks.
 * @param {string} content
 * @returns {{ code: string, language: string|null }[]}
 */
function extractCodeBlocks(content) {
  const blocks = [];
  const fencePattern = /```(\w*)\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = fencePattern.exec(content)) !== null) {
    const language = match[1]?.toLowerCase() || null;
    const code = match[2].trim();
    if (code.length > 0) {
      blocks.push({ code, language });
    }
  }

  return blocks;
}

/**
 * Find sections of content that contain operations (how-to guides, examples).
 * @param {string} content
 * @returns {string[]} Array of section texts
 */
function findOperationSections(content) {
  const lines = content.split("\n");
  const sections = [];
  let currentSection = { heading: "", content: "" };
  let inOperationSection = false;
  let headingLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#+)\s+(.+)/);

    if (headingMatch) {
      // Flush previous section
      if (inOperationSection && currentSection.content.trim()) {
        sections.push(currentSection.content.trim());
      }

      const level = headingMatch[1].length;
      const heading = headingMatch[2];

      // Check if this is an operation section
      const isOpSection = OPERATION_SECTION_HEADINGS.some((pattern) => pattern.test(heading));

      if (isOpSection) {
        inOperationSection = true;
        headingLevel = level;
        currentSection = { heading, content: "" };
      } else if (inOperationSection && level <= headingLevel) {
        // Exiting operation section
        if (currentSection.content.trim()) {
          sections.push(currentSection.content.trim());
        }
        inOperationSection = false;
        currentSection = { heading: "", content: "" };
      } else if (inOperationSection) {
        // Sub-heading within operation section
        currentSection.content += "\n" + line;
      }
    } else if (inOperationSection) {
      currentSection.content += "\n" + line;
    }
  }

  // Flush last section
  if (inOperationSection && currentSection.content.trim()) {
    sections.push(currentSection.content.trim());
  }

  // If no operation sections found, use the entire content
  if (sections.length === 0) {
    sections.push(content);
  }

  return sections;
}

/**
 * Derive an operation name from surrounding text or code context.
 * @param {string} code - The code example
 * @param {string} surroundingText - Text around the code block
 * @returns {string}
 */
function deriveOperationName(code, surroundingText) {
  // Try to find a heading or sentence before the code that describes the operation
  const lines = surroundingText.split("\n").filter((l) => l.trim().length > 0);
  for (const line of lines.reverse()) {
    const headingMatch = line.match(/^#+\s+(.+)/);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
    const sentenceMatch = line.match(/^([^.!?]+[.!?])/);
    if (sentenceMatch && sentenceMatch[1].length > 10) {
      return sentenceMatch[1].trim();
    }
  }

  // Fallback: derive from the first import or function call in the code
  const firstImport = code.match(/^(?:import|from|require)\s+(.+)/m);
  if (firstImport) {
    return `Use ${firstImport[1].trim()}`;
  }

  const firstFunction = code.match(/^(\w+)\s*\(/m) || code.match(/^(\w+)\s*=/m);
  if (firstFunction) {
    return `Call ${firstFunction[1]}`;
  }

  return "Operation";
}

/**
 * Get comment syntax for a given language.
 * @param {string|null} language
 * @returns {string}
 */
function getCommentPrefix(language) {
  if (!language) return "//";
  return LANGUAGE_COMMENTS[language.toLowerCase()] || "//";
}

/**
 * Extract up to ten common operations with code examples.
 * @param {string} quickstartPageText - Quick-start / getting-started page content
 * @param {string} apiIndexText - API reference index page content (supplemental)
 * @returns {Operation[]}
 */
export function extractOperations(quickstartPageText, apiIndexText) {
  const primaryContent = quickstartPageText || "";
  const combinedContent = [primaryContent, apiIndexText].filter(Boolean).join("\n\n");

  const sections = findOperationSections(combinedContent);
  const operations = [];
  const seenCode = new Set();

  for (const section of sections) {
    const codeBlocks = extractCodeBlocks(section);

    for (const block of codeBlocks) {
      if (operations.length >= 10) break;

      // Quality filters
      const trimmedCode = block.code.trim();
      if (trimmedCode.length < 10) continue;
      if (trimmedCode.length > 2000) continue; // Too long for a quick example
      if (seenCode.has(trimmedCode)) continue;

      // Skip blocks that look like shell commands (not code examples)
      if (block.language === "bash" || block.language === "sh" || block.language === "shell") {
        // Only include if they show library usage, not just npm install
        if (!trimmedCode.match(/^(npm|yarn|pip|brew|apt|git\s+clone)/m)) {
          continue;
        }
      }

      // Skip blocks that are just output / logs
      if (block.language === "text" || block.language === "log" || block.language === "output") {
        continue;
      }

      // Skip JSON-only blocks (usually config, not operations)
      if (block.language === "json" && trimmedCode.startsWith("{")) {
        continue;
      }

      const name = deriveOperationName(trimmedCode, section);
      const commentPrefix = getCommentPrefix(block.language);

      operations.push({
        name,
        code: trimmedCode,
        note: "",
      });

      seenCode.add(trimmedCode);
    }

    if (operations.length >= 10) break;
  }

  return operations;
}

// CLI entry point
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: node extract-operations.js <quickstart-page-text> [api-index-text]");
    process.exit(1);
  }

  import("node:fs").then((fs) => {
    const quickstartText = fs.readFileSync(args[0], "utf8");
    const apiIndexText = args[1] ? fs.readFileSync(args[1], "utf8") : "";

    const operations = extractOperations(quickstartText, apiIndexText);
    console.log(JSON.stringify({ count: operations.length, operations }, null, 2));
  });
}
