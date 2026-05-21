#!/usr/bin/env node
import { fileURLToPath } from "node:url";

const VALID_LEVELS = new Set(["intro", "intermediate", "advanced", "all"]);

export function parseFindingResourcesArgs(input = "") {
  const tokens = tokenize(String(input).trim());
  const result = {
    topic: "",
    command: null,
    level: "all",
    domain: null,
    recent: false,
    foundational: false,
    applied: false,
    limit: 40,
    unknownFlags: [],
    errors: []
  };

  if (tokens.length === 0) {
    result.errors.push("Missing topic.");
    return result;
  }

  if (isCommand(tokens[0])) {
    result.command = tokens.shift().slice(1).toLowerCase();
  }

  const topicParts = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (!token.startsWith("--")) {
      topicParts.push(token);
      continue;
    }

    if (token === "--recent") {
      result.recent = true;
      continue;
    }
    if (token === "--foundational") {
      result.foundational = true;
      continue;
    }
    if (token === "--applied") {
      result.applied = true;
      continue;
    }

    if (token === "--level") {
      const value = tokens[i + 1];
      i += 1;
      if (!value || value.startsWith("--")) {
        result.errors.push("Missing value for --level.");
      } else if (!VALID_LEVELS.has(value)) {
        result.errors.push(`Invalid --level "${value}". Use intro, intermediate, advanced, or all.`);
      } else {
        result.level = value;
      }
      continue;
    }

    if (token === "--domain") {
      const value = tokens[i + 1];
      i += 1;
      if (!value || value.startsWith("--")) {
        result.errors.push("Missing value for --domain.");
      } else {
        result.domain = value;
      }
      continue;
    }

    if (token === "--limit") {
      const value = tokens[i + 1];
      i += 1;
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed)) {
        result.errors.push("Invalid --limit. Use a number between 5 and 80.");
      } else {
        result.limit = Math.min(80, Math.max(5, parsed));
      }
      continue;
    }

    result.unknownFlags.push(token);
  }

  result.topic = topicParts.join(" ").trim();

  if (!result.topic) {
    result.errors.push("Missing topic.");
  }

  return result;
}

function isCommand(token) {
  const normalized = token.toLowerCase();
  return normalized === "/find-resource" || normalized === "/finding-resources";
}

function tokenize(input) {
  const tokens = [];
  let current = "";
  let quote = null;

  for (const char of input) {
    if ((char === "\"" || char === "'") && quote === null) {
      quote = char;
      continue;
    }
    if (char === quote) {
      quote = null;
      continue;
    }
    if (/\s/.test(char) && quote === null) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = process.argv.slice(2).join(" ");
  console.log(JSON.stringify(parseFindingResourcesArgs(input), null, 2));
}
