#!/usr/bin/env node
/**
 * resolve-docs-url.js
 *
 * Resolves a library name to its official documentation URL using a 4-step
 * strategy: known-map lookup, npm registry, PyPI registry, web search.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWN_MAP_PATH = join(__dirname, "..", "references", "known-docs-map.json");

/**
 * @typedef {Object} ResolutionResult
 * @property {string} url - Resolved documentation URL
 * @property {"known-map"|"npm"|"pypi"|"web-search"|"user-confirmed"} method
 * @property {string|null} version - Detected or user-specified version
 */

/**
 * Load the known docs map from the reference JSON file.
 * @returns {Record<string, string>}
 */
function loadKnownMap() {
  try {
    const raw = readFileSync(KNOWN_MAP_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Resolve a library name to its documentation URL.
 * @param {string} libraryName - The library name (lowercase, no version)
 * @param {string|null} version - Optional version specifier
 * @returns {Promise<ResolutionResult|null>}
 */
export async function resolveDocsUrl(libraryName, version = null) {
  const name = libraryName.toLowerCase().trim();

  // Step 1: Known-map lookup
  const knownMap = loadKnownMap();
  if (knownMap[name]) {
    return { url: knownMap[name], method: "known-map", version };
  }

  // Step 2: npm registry
  try {
    const npmUrl = await resolveFromNpm(name);
    if (npmUrl) {
      return { url: npmUrl, method: "npm", version };
    }
  } catch {
    // Continue to next step
  }

  // Step 3: PyPI registry
  try {
    const pypiUrl = await resolveFromPypi(name);
    if (pypiUrl) {
      return { url: pypiUrl, method: "pypi", version };
    }
  } catch {
    // Continue to next step
  }

  // Step 4: Not resolvable — caller should attempt web search
  return null;
}

/**
 * Attempt to resolve a docs URL from the npm registry.
 * @param {string} name
 * @returns {Promise<string|null>}
 */
async function resolveFromNpm(name) {
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
  if (!response.ok) return null;

  const data = await response.json();
  const homepage = data.homepage || (data.repository && data.repository.url);

  if (homepage) {
    const url = homepage.replace(/^git\+/, "").replace(/\.git$/, "").replace(/^git:\/\//, "https://");
    if (isLikelyDocsUrl(url, name)) return url;
  }

  return null;
}

/**
 * Attempt to resolve a docs URL from the PyPI registry.
 * @param {string} name
 * @returns {Promise<string|null>}
 */
async function resolveFromPypi(name) {
  const response = await fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`);
  if (!response.ok) return null;

  const data = await response.json();
  const info = data.info || {};
  const docsUrl = info.project_urls && (info.project_urls.Documentation || info.project_urls.Docs);
  const homepage = info.home_page || info.project_url;

  if (docsUrl && isLikelyDocsUrl(docsUrl, name)) return docsUrl;
  if (homepage && isLikelyDocsUrl(homepage, name)) return homepage;

  return null;
}

/**
 * Heuristic check: does the URL look like it points to documentation?
 * @param {string} url
 * @param {string} name
 * @returns {boolean}
 */
function isLikelyDocsUrl(url, name) {
  if (!url || typeof url !== "string") return false;
  const lower = url.toLowerCase();
  const docsIndicators = ["docs", "guide", "learn", "tutorial", "reference", "readthedocs", "documentation"];
  return docsIndicators.some((indicator) => lower.includes(indicator)) || lower.includes(name.toLowerCase());
}

// CLI entry point
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const args = process.argv.slice(2);
  const libraryName = args[0];

  if (!libraryName) {
    console.error("Usage: node resolve-docs-url.js <library-name> [version]");
    process.exit(1);
  }

  const version = args[1] || null;

  resolveDocsUrl(libraryName, version).then((result) => {
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify({ error: "unresolvable", library: libraryName }));
      process.exit(1);
    }
  });
}
