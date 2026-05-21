#!/usr/bin/env node
import { fileURLToPath } from "node:url";

const SOURCE_TYPES = [
  {
    id: "textbooks",
    label: "Textbooks and academic books",
    terms: ["textbook", "book", "academic press", "publisher catalog"],
    authorityTargets: ["MIT Press", "Cambridge University Press", "Oxford University Press", "Springer", "Manning", "O'Reilly"]
  },
  {
    id: "papers",
    label: "Research papers and preprints",
    terms: ["survey paper", "seminal paper", "arXiv", "Semantic Scholar"],
    authorityTargets: ["arxiv.org", "semanticscholar.org", "pubmed.ncbi.nlm.nih.gov", "scholar.google.com"]
  },
  {
    id: "white-papers",
    label: "White papers",
    terms: ["white paper", "technical report", "research lab report"],
    authorityTargets: ["NIST", "research lab", "industry research", "government report"]
  },
  {
    id: "practitioner-posts",
    label: "Practitioner writing",
    terms: ["engineering blog", "technical blog", "field guide", "implementation"],
    authorityTargets: ["company engineering blogs", "recognized practitioners", "maintainer blogs"]
  },
  {
    id: "case-studies",
    label: "Case studies",
    terms: ["case study", "production", "at scale", "implementation report"],
    authorityTargets: ["organization case studies", "vendor case studies", "conference experience reports"]
  },
  {
    id: "courses",
    label: "University courses and lecture notes",
    terms: ["site:edu course", "site:edu lecture notes", "site:edu syllabus"],
    authorityTargets: ["university course pages", "lecture notes", "open courseware"]
  },
  {
    id: "docs-standards",
    label: "Official documentation and standards",
    terms: ["official documentation", "standard", "specification", "reference"],
    authorityTargets: ["official docs", "IETF", "W3C", "NIST", "ISO public pages"]
  },
  {
    id: "talks",
    label: "Conference proceedings and talks",
    terms: ["conference talk", "proceedings", "tutorial", "keynote"],
    authorityTargets: ["ACM", "IEEE", "USENIX", "domain conferences", "conference video archives"]
  }
];

const DOMAIN_HINTS = {
  "machine learning": ["NeurIPS", "ICML", "JMLR", "arXiv cs.LG", "Papers with Code"],
  ai: ["NeurIPS", "ICML", "ACL", "arXiv", "OpenAI", "Anthropic"],
  "software engineering": ["ACM", "USENIX", "IEEE Software", "Martin Fowler", "Google Research"],
  "distributed systems": ["USENIX", "ACM SIGOPS", "MIT 6.824", "Jepsen", "VLDB"],
  medicine: ["PubMed", "Cochrane", "NEJM", "JAMA", "WHO"],
  psychology: ["APA PsycNet", "PubMed", "Annual Reviews", "Frontiers", "Nature Human Behaviour"],
  economics: ["NBER", "SSRN", "AEA", "Journal of Economic Perspectives", "World Bank"],
  education: ["ERIC", "IES", "AERA", "What Works Clearinghouse", "Learning & Instruction"],
  law: ["SSRN", "Harvard Law Review", "Stanford Encyclopedia", "Cornell LII", "Brookings"],
  cybersecurity: ["USENIX Security", "IEEE S&P", "ACM CCS", "NIST", "OWASP"],
  statistics: ["JASA", "IMS", "CRC Press", "Cambridge", "Stanford course notes"]
};

export function buildSearchPlan(options = {}) {
  const topic = normalizeTopic(options.topic);
  if (!topic) {
    return [];
  }

  const domain = options.domain ? String(options.domain).toLowerCase() : inferDomain(topic);
  const domainTargets = DOMAIN_HINTS[domain] ?? [];

  return SOURCE_TYPES.map((sourceType) => {
    const queries = buildQueries(topic, sourceType, {
      domain,
      recent: Boolean(options.recent),
      foundational: Boolean(options.foundational),
      applied: Boolean(options.applied)
    });

    return {
      sourceType: sourceType.id,
      label: sourceType.label,
      inferredDomain: domain,
      queries,
      authorityTargets: [...sourceType.authorityTargets, ...domainTargets],
      rejectPatterns: [
        "best resources",
        "top 10",
        "ultimate guide",
        "content farm",
        "affiliate",
        "scraper mirror"
      ]
    };
  });
}

function buildQueries(topic, sourceType, options) {
  const modifier = options.recent ? " recent" : "";
  const focus = options.foundational ? " foundational" : options.applied ? " applied" : "";
  const domainPhrase = options.domain ? ` ${options.domain}` : "";
  const base = `"${topic}"`;

  const queries = sourceType.terms.slice(0, 3).map((term) =>
    `${base}${domainPhrase} ${term}${focus}${modifier}`.replace(/\s+/g, " ").trim()
  );

  if (sourceType.id === "courses") {
    queries.push(`${base} site:edu syllabus OR "lecture notes"`);
  } else if (sourceType.id === "papers") {
    queries.push(`${base} survey paper OR seminal paper`);
  } else if (sourceType.id === "docs-standards") {
    queries.push(`${base} official documentation OR standard OR specification`);
  } else if (sourceType.id === "case-studies") {
    queries.push(`${base} "case study" production "at scale"`);
  }

  return [...new Set(queries)].slice(0, 4);
}

function normalizeTopic(topic) {
  return String(topic ?? "").trim().replace(/\s+/g, " ");
}

function inferDomain(topic) {
  const normalized = topic.toLowerCase();

  for (const domain of Object.keys(DOMAIN_HINTS)) {
    if (normalized.includes(domain)) {
      return domain;
    }
  }

  if (/(neural|transformer|llm|rag|model|reinforcement learning)/.test(normalized)) {
    return "machine learning";
  }
  if (/(postgres|database|kubernetes|distributed|systems|compiler|api)/.test(normalized)) {
    return "software engineering";
  }
  if (/(clinical|disease|therapy|drug|diagnosis|patient)/.test(normalized)) {
    return "medicine";
  }
  if (/(cognitive|behavior|memory|emotion|attention)/.test(normalized)) {
    return "psychology";
  }
  if (/(causal inference|regression|bayesian|probability|statistics)/.test(normalized)) {
    return "statistics";
  }
  if (/(security|cryptography|malware|threat|vulnerability)/.test(normalized)) {
    return "cybersecurity";
  }

  return "general";
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const topic = process.argv.slice(2).join(" ");
  console.log(JSON.stringify(buildSearchPlan({ topic }), null, 2));
}
