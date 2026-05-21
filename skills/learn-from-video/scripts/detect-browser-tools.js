#!/usr/bin/env node
const BROWSER_PATTERNS = [
  "browser",
  "playwright",
  "puppeteer",
  "navigate",
  "browserbase",
  "computer"
];

const KNOWN_TOOLS = [
  "@playwright/mcp",
  "browser-use",
  "browserbase",
  "claude code computer",
  "computer/browser"
];

export function detectBrowserTools(toolNames = []) {
  const matches = toolNames
    .filter((name) => typeof name === "string")
    .filter((name) => isBrowserTool(name));

  return {
    available: matches.length > 0,
    matches
  };
}

function isBrowserTool(name) {
  const normalized = name.toLowerCase();
  return KNOWN_TOOLS.some((tool) => normalized.includes(tool))
    || BROWSER_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function main(argv) {
  const result = detectBrowserTools(argv);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll("\\", "/"))) {
  main(process.argv.slice(2));
}

