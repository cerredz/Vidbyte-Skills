#!/usr/bin/env node
/**
 * fetch-doc-pages.js
 *
 * Fetches the high-signal documentation pages for a given library docs URL.
 * Targets: root/index, getting-started, core concepts, API reference index.
 */

/**
 * @typedef {Object} FetchedPages
 * @property {string} root - Raw content of the root/index page
 * @property {string|null} quickstart - Quick-start / getting-started page
 * @property {string|null} concepts - Core concepts / fundamentals page
 * @property {string|null} apiIndex - API reference index page
 */

/**
 * Common path patterns for high-signal docs pages.
 * Ordered by priority — first match wins.
 */
const QUICKSTART_PATTERNS = [
  "/getting-started", "/quick-start", "/quickstart", "/introduction",
  "/intro", "/tutorial", "/start", "/setup", "/installation",
  "/docs/getting-started", "/docs/quick-start", "/docs/introduction",
  "/guide/getting-started", "/guide/quick-start",
  "/get-started", "/overview",
];

const CONCEPTS_PATTERNS = [
  "/concepts", "/core-concepts", "/fundamentals", "/key-concepts",
  "/essentials", "/basics", "/guide",
  "/docs/concepts", "/docs/core-concepts", "/docs/guide",
  "/learn", "/docs/learn",
];

const API_INDEX_PATTERNS = [
  "/api", "/api-reference", "/reference", "/api/",
  "/docs/api", "/docs/reference", "/docs/api-reference",
  "/guide/api", "/api/index",
];

/**
 * Try to match a path pattern against a set of extracted links.
 * @param {string[]} links - Links extracted from the root page
 * @param {string[]} patterns - Path patterns to try
 * @param {string} baseUrl - Base docs URL for resolving relative paths
 * @returns {string|null}
 */
function findMatchingLink(links, patterns, baseUrl) {
  for (const pattern of patterns) {
    for (const link of links) {
      const normalized = link.toLowerCase().replace(/\/$/, "");
      if (normalized === pattern.toLowerCase() || normalized.endsWith(pattern.toLowerCase())) {
        try {
          return new URL(link, baseUrl).href;
        } catch {
          return link.startsWith("http") ? link : baseUrl.replace(/\/$/, "") + "/" + link.replace(/^\//, "");
        }
      }
    }
  }
  return null;
}

/**
 * Extract all hyperlinks from an HTML string.
 * @param {string} html
 * @returns {string[]}
 */
function extractLinks(html) {
  const links = [];
  const hrefPattern = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = hrefPattern.exec(html)) !== null) {
    const href = match[1];
    if (href && !href.startsWith("#") && !href.startsWith("javascript:") && !href.startsWith("mailto:")) {
      links.push(href);
    }
  }
  return links;
}

/**
 * Extract links from Markdown content.
 * @param {string} markdown
 * @returns {string[]}
 */
function extractMarkdownLinks(markdown) {
  const links = [];
  const mdLinkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;
  const inlineUrlPattern = /(?<![(\[])https?:\/\/[^\s<>"']+/g;
  let match;

  while ((match = mdLinkPattern.exec(markdown)) !== null) {
    const href = match[2];
    if (href && !href.startsWith("#")) {
      links.push(href);
    }
  }

  while ((match = inlineUrlPattern.exec(markdown)) !== null) {
    links.push(match[0]);
  }

  return links;
}

/**
 * Fetch a page and return its text content.
 * @param {string} url
 * @returns {Promise<string|null>}
 */
async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Vidbyte-docs-tldr/1.0" },
      redirect: "follow",
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Detect content type from response text and extract content accordingly.
 * Returns the raw text content (HTML is returned as-is for downstream processing).
 * @param {string} text - Raw response text
 * @returns {string}
 */
function normalizeContent(text) {
  // Return as-is; the LLM handles extraction from raw content
  return text;
}

/**
 * Fetch the high-signal documentation pages for a library.
 * @param {string} baseUrl - The resolved documentation base URL
 * @param {string|null} version - Optional version
 * @returns {Promise<FetchedPages>}
 */
export async function fetchDocPages(baseUrl, version = null) {
  // Ensure base URL ends without a trailing slash for consistent joining
  const base = baseUrl.replace(/\/$/, "");

  const result = {
    root: null,
    quickstart: null,
    concepts: null,
    apiIndex: null,
  };

  // 1. Fetch root page
  const rootContent = await fetchPage(base);
  if (!rootContent) {
    return result;
  }
  result.root = normalizeContent(rootContent);

  // Extract links from root page
  const links = [
    ...extractLinks(rootContent),
    ...extractMarkdownLinks(rootContent),
  ];

  // 2. Find and fetch quick-start page
  const quickstartUrl = findMatchingLink(links, QUICKSTART_PATTERNS, base);
  if (quickstartUrl) {
    const content = await fetchPage(quickstartUrl);
    if (content) {
      result.quickstart = normalizeContent(content);
    }
  }

  // 3. Find and fetch core concepts page
  const conceptsUrl = findMatchingLink(links, CONCEPTS_PATTERNS, base);
  if (conceptsUrl) {
    const content = await fetchPage(conceptsUrl);
    if (content) {
      result.concepts = normalizeContent(content);
    }
  }

  // 4. Find and fetch API reference index
  const apiUrl = findMatchingLink(links, API_INDEX_PATTERNS, base);
  if (apiUrl) {
    const content = await fetchPage(apiUrl);
    if (content) {
      result.apiIndex = normalizeContent(content);
    }
  }

  return result;
}

// CLI entry point
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const args = process.argv.slice(2);
  const baseUrl = args[0];
  const version = args[1] || null;

  if (!baseUrl) {
    console.error("Usage: node fetch-doc-pages.js <base-url> [version]");
    process.exit(1);
  }

  fetchDocPages(baseUrl, version).then((result) => {
    // Output summary of what was fetched
    const summary = {
      rootFetched: result.root !== null,
      quickstartFetched: result.quickstart !== null,
      conceptsFetched: result.concepts !== null,
      apiIndexFetched: result.apiIndex !== null,
      rootLength: result.root ? result.root.length : 0,
      quickstartLength: result.quickstart ? result.quickstart.length : 0,
      conceptsLength: result.concepts ? result.concepts.length : 0,
      apiIndexLength: result.apiIndex ? result.apiIndex.length : 0,
    };
    console.log(JSON.stringify(summary, null, 2));
  });
}
