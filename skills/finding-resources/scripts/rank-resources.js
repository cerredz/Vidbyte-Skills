#!/usr/bin/env node
import { fileURLToPath } from "node:url";

const LOW_QUALITY_HOST_PATTERNS = [
  /medium\.com\/tag\//i,
  /dev\.to\/tags\//i,
  /geeksforgeeks/i,
  /tutorialspoint/i,
  /javatpoint/i,
  /simplilearn/i,
  /guru99/i,
  /w3schools/i,
  /top-?10/i,
  /best-.*resources/i
];

const AUTHORITY_HOST_PATTERNS = [
  /\.edu(\/|$)/i,
  /arxiv\.org/i,
  /semanticscholar\.org/i,
  /pubmed\.ncbi\.nlm\.nih\.gov/i,
  /ncbi\.nlm\.nih\.gov\/pmc/i,
  /acm\.org/i,
  /ieee\.org/i,
  /usenix\.org/i,
  /ietf\.org/i,
  /w3\.org/i,
  /nist\.gov/i,
  /mitpress\.mit\.edu/i,
  /cambridge\.org/i,
  /oup\.com/i,
  /springer\.com/i,
  /manning\.com/i,
  /oreilly\.com/i,
  /docs\./i,
  /developer\./i
];

export function rankResources(candidates = [], options = {}) {
  const seen = new Map();
  const accepted = [];
  const rejected = [];
  const duplicates = [];

  for (const candidate of candidates) {
    const normalized = normalizeCandidate(candidate);
    const rejectionReason = rejectReason(normalized);

    if (rejectionReason) {
      rejected.push({ ...normalized, rejectionReason });
      continue;
    }

    const key = dedupeKey(normalized);
    if (seen.has(key)) {
      duplicates.push({ ...normalized, duplicateOf: seen.get(key).title });
      continue;
    }

    normalized.score = scoreCandidate(normalized, options);
    seen.set(key, normalized);
    accepted.push(normalized);
  }

  accepted.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return { accepted, rejected, duplicates };
}

function normalizeCandidate(candidate) {
  const title = String(candidate?.title ?? "").trim();
  const url = String(candidate?.url ?? "").trim();
  const host = safeHost(url);

  return {
    title,
    url,
    host,
    sourceType: String(candidate?.sourceType ?? "unknown").trim(),
    publisherOrHost: String(candidate?.publisherOrHost ?? host).trim(),
    authors: Array.isArray(candidate?.authors) ? candidate.authors.map(String) : [],
    year: Number.isFinite(Number(candidate?.year)) ? Number(candidate.year) : null,
    snippet: String(candidate?.snippet ?? "").trim(),
    doi: candidate?.doi ? String(candidate.doi).trim().toLowerCase() : null,
    isbn: candidate?.isbn ? String(candidate.isbn).trim().replaceAll("-", "") : null
  };
}

function rejectReason(candidate) {
  if (!candidate.title) {
    return "missing title";
  }
  if (!candidate.url) {
    return "missing url";
  }
  if (LOW_QUALITY_HOST_PATTERNS.some((pattern) => pattern.test(candidate.url) || pattern.test(candidate.title))) {
    return "low-quality or content-farm pattern";
  }
  if (/\b(top|best)\s+\d+\b/i.test(candidate.title)) {
    return "generic listicle title";
  }
  return null;
}

function dedupeKey(candidate) {
  if (candidate.doi) {
    return `doi:${candidate.doi}`;
  }
  if (candidate.isbn) {
    return `isbn:${candidate.isbn}`;
  }
  const normalizedTitle = candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return `${candidate.host}:${normalizedTitle}`;
}

function scoreCandidate(candidate, options) {
  let score = 0;

  if (AUTHORITY_HOST_PATTERNS.some((pattern) => pattern.test(candidate.url))) {
    score += 35;
  }
  if (candidate.authors.length > 0) {
    score += 10;
  }
  if (candidate.year) {
    score += recencyScore(candidate.year);
  }
  if (candidate.doi || candidate.isbn) {
    score += 10;
  }
  if (candidate.snippet.length > 80) {
    score += 5;
  }
  if (options.topic && containsTopic(candidate, options.topic)) {
    score += 20;
  }
  if (/official|standard|specification|documentation|course|lecture|textbook|case study|white paper/i.test(`${candidate.title} ${candidate.snippet}`)) {
    score += 10;
  }

  return score;
}

function recencyScore(year) {
  const currentYear = new Date().getUTCFullYear();
  const age = currentYear - year;
  if (age <= 2) {
    return 10;
  }
  if (age <= 7) {
    return 6;
  }
  if (age <= 20) {
    return 3;
  }
  return 0;
}

function containsTopic(candidate, topic) {
  const words = String(topic).toLowerCase().split(/\s+/).filter((word) => word.length > 3);
  const haystack = `${candidate.title} ${candidate.snippet}`.toLowerCase();
  return words.some((word) => haystack.includes(word));
}

function safeHost(url) {
  try {
    return new URL(url).host.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fs = await import("node:fs");
  const inputPath = process.argv[2];
  const raw = inputPath ? fs.readFileSync(inputPath, "utf8") : await readStdin();
  const parsed = raw.trim() ? JSON.parse(raw) : [];
  const candidates = Array.isArray(parsed) ? parsed : parsed.candidates;
  console.log(JSON.stringify(rankResources(candidates ?? [], parsed.options ?? {}), null, 2));
}
