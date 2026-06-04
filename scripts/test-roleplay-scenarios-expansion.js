/**
 * Context Protocol
 * Description: Verification script for the roleplay scenarios expansion feature.
 * Purpose: Automates validation of the generated scenario/rubric files, schemas, scenarios registry, and installer argument filtering.
 * Architecture: Runs sequential checks on directory structure, file headings, registry matching, and runs a dry-run install command to parse output.
 * Key Functions:
 *   - runChecks: sequentially calls verifyDirectories, verifyHeaders, verifyRegistry, and verifyInstaller.
 * Relation to Codebase: Testing script located under `scripts/` to verify feature compliance before PR submission.
 * Similar Files: scripts/validate.js, scripts/smoke-test.js.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const ROLEPLAY_ROOT = path.join(REPO_ROOT, "skills", "roleplay");

const SCENARIOS = [
  "zero-day-vulnerability-disclosure",
  "post-merger-decommissioning",
  "budget-defense-under-layoffs",
  "third-party-api-downtime-compensation",
  "architectural-dispute-with-principal",
  "ethical-ai-implementation-objection",
  "refusing-unilateral-term-changes",
  "cloud-migration-rollback",
  "retaining-departing-key-architect",
  "open-source-license-violation",
  "end-of-life-api-transition",
  "post-incident-review-defense",
  "contract-renewal-under-performance-issues",
  "offshore-vendor-termination",
  "explaining-ai-code-contamination",
  "addressing-micromanagement",
  "handling-missed-deliverable",
  "out-of-cycle-salary-adjustment",
  "project-handover-conflict",
  "deflecting-layoff-rumors",
  "pip-performance-response",
  "expediting-legal-review",
  "declining-peer-work-overload",
  "discussing-professional-burnout",
  "managing-disgruntled-peer",
  "process-inefficiency-expose",
  "entitled-candidate-rejection",
  "inappropriate-behavior-confrontation",
  "demanding-remote-setup-reimbursement",
  "negotiating-remote-work",
  "resigning-to-needy-manager",
  "academic-integrity-defense",
  "emergency-deadline-extension",
  "syllabus-conflict-disputing",
  "negotiating-research-funding",
  "appealing-exam-grade",
  "roommate-conflict-resolution",
  "tuition-waiver-appeal",
  "late-major-prerequisite-waiver",
  "internship-schedule-accommodation",
  "disability-accommodation-request",
  "disputing-registration-block",
  "joining-competitive-research-lab",
  "letter-of-recommendation-rescue",
  "disputing-mandatory-attendance-policy",
  "transfer-credit-appeal",
  "grade-rounding-request",
  "accidental-database-crash",
  "citation-plagiarism-accusation",
  "over-promised-deadline-crisis",
  "first-job-offer-negotiation",
  "public-code-review-critique",
  "underperformance-review-dispute",
  "major-system-crash-disclosure",
  "timesheet-fraud-discovery",
  "struggling-team-transfer-request",
  "falsified-test-data-directive",
  "overwhelming-workload-boundary",
  "internship-conversion-pitch",
  "solo-client-meeting-fail",
  "accidental-proprietary-code-leak",
  "missed-on-call-incident"
];

function verifyDirectories() {
  console.log("Running [Edge Case] directory schema validation...");
  for (const slug of SCENARIOS) {
    const dir = path.join(ROLEPLAY_ROOT, slug);
    if (!fs.existsSync(dir)) {
      throw new Error(`Directory does not exist for: ${slug}`);
    }
    const files = fs.readdirSync(dir);
    if (!files.includes("scenario.md") || !files.includes("rubric.md")) {
      throw new Error(`Missing scenario.md or rubric.md in ${slug}`);
    }
    if (files.length !== 2) {
      throw new Error(`Unexpected files found in ${slug}: ${files.join(", ")}`);
    }
  }
  console.log("PASS: Directory schema validation");
}

function verifyHeaders() {
  console.log("Running [Hidden Failure] file header validation...");
  for (const slug of SCENARIOS) {
    const scenarioPath = path.join(ROLEPLAY_ROOT, slug, "scenario.md");
    const rubricPath = path.join(ROLEPLAY_ROOT, slug, "rubric.md");

    const scenarioText = fs.readFileSync(scenarioPath, "utf8");
    const rubricText = fs.readFileSync(rubricPath, "utf8");

    const requiredScenHeaders = [
      "## Character Identity",
      "## Character Personality",
      "## Character Knowledge Profile",
      "## Character Emotional Profile",
      "## The Situation",
      "## Your Role",
      "## Character Goals",
      "## Opening Line",
      "## Example Character Responses",
      "## Conversation Guidelines",
      "## User Context Questions",
      "## Scenario Adaptation"
    ];

    const requiredRubricHeaders = [
      "## Scoring Dimensions",
      "## Overall Score",
      "## Scoring Notes"
    ];

    for (const header of requiredScenHeaders) {
      if (!scenarioText.includes(header)) {
        throw new Error(`Missing header "${header}" in ${slug}/scenario.md`);
      }
    }

    for (const header of requiredRubricHeaders) {
      if (!rubricText.includes(header)) {
        throw new Error(`Missing header "${header}" in ${slug}/rubric.md`);
      }
    }
  }
  console.log("PASS: File header validation");
}

function verifyRegistry() {
  console.log("Running [Silent Failure] scenarios registry validation...");
  const registryPath = path.join(ROLEPLAY_ROOT, "scenarios-registry.md");
  const registryText = fs.readFileSync(registryPath, "utf8");

  for (const slug of SCENARIOS) {
    if (!registryText.includes(`| ${slug} |`)) {
      throw new Error(`Slug "${slug}" is not registered in scenarios-registry.md`);
    }
  }
  console.log("PASS: Scenarios registry validation");
}

function verifyInstaller() {
  console.log("Running [Silent Failure] installer category filter validation...");
  // Run dry-run install command for roleplay
  const output = execSync("node bin/install.js roleplay --dry-run", {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });

  // Verify that roleplay and create-roleplay are scheduled for install
  if (!output.includes("roleplay") || !output.includes("create-roleplay")) {
    throw new Error("Installer did not include roleplay or create-roleplay skills in dry-run output.");
  }

  // Verify that other non-roleplay skills (e.g. explain, daily-review) are NOT scheduled for install
  if (output.includes("daily-review") || output.includes("explain")) {
    throw new Error("Installer output includes non-roleplay skills when roleplay category was requested.");
  }

  console.log("PASS: Installer category filter validation");
}

function runChecks() {
  try {
    verifyDirectories();
    verifyHeaders();
    verifyRegistry();
    verifyInstaller();
    console.log("\nAll 4/4 verification checks passed successfully!");
    process.exit(0);
  } catch (err) {
    console.error(`\nFAIL: ${err.message}`);
    process.exit(1);
  }
}

runChecks();
