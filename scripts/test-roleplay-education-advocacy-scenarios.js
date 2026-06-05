#!/usr/bin/env node
/**
 * Context Protocol
 * Description: Verification script for the education advocacy roleplay scenario batch.
 * Purpose: Validates generated scenario/rubric files, registry rows, rubric anchors, and roleplay installer filtering.
 * Architecture: Uses a small verifier class over Node.js standard library APIs to run deterministic file-system checks.
 * Key Functions:
 *   - EducationAdvocacyScenarioVerifier.run: executes all checks and exits non-zero on failure.
 * Relation to Codebase: Complements scripts/test-roleplay-scenarios-expansion.js for the PR #94 roleplay batch.
 * Similar Files: scripts/test-roleplay-scenarios-expansion.js, scripts/validate.js.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const ROLEPLAY_ROOT = path.join(REPO_ROOT, "skills", "roleplay");

const SCENARIOS = [
  ["teacher-grade-correction-request", "Teacher Grade Correction Request"],
  ["make-up-test-after-absence", "Make-Up Test After Absence"],
  ["late-assignment-penalty-reduction", "Late Assignment Penalty Reduction"],
  ["retake-or-test-correction-request", "Retake or Test Correction Request"],
  ["class-placement-appeal", "Class Placement Appeal"],
  ["advanced-course-permission", "Advanced Course Permission"],
  ["schedule-conflict-resolution", "Schedule Conflict Resolution"],
  ["counselor-recommendation-advocacy", "Counselor Recommendation Advocacy"],
  ["disciplinary-record-appeal", "Disciplinary Record Appeal"],
  ["bullying-harassment-escalation", "Bullying or Harassment Escalation"],
  ["iep-504-accommodation-meeting", "IEP/504 Accommodation Meeting"],
  ["temporary-injury-accommodation", "Temporary Injury Accommodation"],
  ["mental-health-support-plan", "Mental Health Support Plan"],
  ["attendance-policy-exception", "Attendance Policy Exception"],
  ["athletic-eligibility-appeal", "Athletic Eligibility Appeal"],
  ["scholarship-deadline-rescue", "Scholarship Deadline Rescue"],
  ["financial-aid-correction-meeting", "Financial Aid Correction Meeting"],
  ["transcript-error-correction", "Transcript Error Correction"],
  ["graduation-requirement-exception", "Graduation Requirement Exception"],
  ["community-service-hour-dispute", "Community Service Hour Dispute"],
  ["work-study-schedule-accommodation", "Work-Study Schedule Accommodation"],
  ["parent-teacher-conference-self-advocacy", "Parent-Teacher Conference Self-Advocacy"],
  ["group-project-contribution-dispute", "Group Project Contribution Dispute"],
  ["unsafe-classroom-lab-concern", "Unsafe Classroom/Lab Concern"],
  ["alternative-assignment-pathway-pitch", "Alternative Assignment Pathway Pitch"]
];

const REQUIRED_SCENARIO_HEADERS = [
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

const REQUIRED_RUBRIC_HEADERS = [
  "## Scoring Dimensions",
  "## Overall Score",
  "## Scoring Notes"
];

const SENSITIVE_SLUGS = new Set([
  "bullying-harassment-escalation",
  "iep-504-accommodation-meeting",
  "mental-health-support-plan",
  "disciplinary-record-appeal",
  "unsafe-classroom-lab-concern"
]);

class EducationAdvocacyScenarioVerifier {
  constructor() {
    // Initializes result counters used for PASS/FAIL reporting.
    this.passed = 0;
    this.total = 0;
  }

  run() {
    // Runs every required verification check and exits with a failing status on errors.
    const checks = [
      ["[Edge Case] expected scenario list has exactly 25 unique entries", () => this.verifyExpectedScenarioList()],
      ["[Hidden Assumption] expected slugs are lowercase hyphen-case", () => this.verifySlugFormat()],
      ["[Hidden Failure] scenario directories contain exactly scenario.md and rubric.md", () => this.verifyDirectories()],
      ["[Hidden Failure] scenario files contain required headings", () => this.verifyScenarioHeaders()],
      ["[Hidden Failure] rubric files contain required headings", () => this.verifyRubricHeaders()],
      ["[Silent Failure] rubrics contain exactly 15 dimensions", () => this.verifyRubricDimensionCounts()],
      ["[Hidden Assumption] rubric dimensions include valid weights", () => this.verifyRubricWeights()],
      ["[Hidden Failure] rubric dimensions include all five score anchors", () => this.verifyScoreAnchors()],
      ["[Silent Failure] registry contains one correct row per scenario", () => this.verifyRegistryRows()],
      ["[Hidden Assumption] sensitive scenarios discourage dishonest or unsafe escalation", () => this.verifySensitiveScenarioGuidance()],
      ["[Silent Failure] roleplay installer category filter remains scoped", () => this.verifyInstallerFilter()]
    ];

    for (const [name, check] of checks) {
      this.runCheck(name, check);
    }

    console.log(`\n${this.passed}/${this.total} tests passed`);
    process.exit(this.passed === this.total ? 0 : 1);
  }

  runCheck(name, check) {
    // Executes one check, prints a stable PASS/FAIL label, and records the outcome.
    this.total += 1;
    try {
      check();
      this.passed += 1;
      console.log(`PASS ${name}`);
    } catch (error) {
      console.error(`FAIL ${name}: ${error.message}`);
    }
  }

  verifyExpectedScenarioList() {
    // Ensures the approved batch size is unchanged and contains no duplicate slugs.
    const slugs = SCENARIOS.map(([slug]) => slug);
    const unique = new Set(slugs);
    this.assert(SCENARIOS.length === 25, `Expected 25 scenarios, found ${SCENARIOS.length}`);
    this.assert(unique.size === 25, `Expected 25 unique slugs, found ${unique.size}`);
  }

  verifySlugFormat() {
    // Ensures every expected slug matches the repository's skill naming style.
    for (const [slug] of SCENARIOS) {
      this.assert(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug), `Invalid slug format: ${slug}`);
    }
  }

  verifyDirectories() {
    // Confirms each generated scenario folder has only the two roleplay data files.
    for (const [slug] of SCENARIOS) {
      const dir = path.join(ROLEPLAY_ROOT, slug);
      this.assert(fs.existsSync(dir), `Missing directory: ${slug}`);
      const files = fs.readdirSync(dir).sort();
      this.assert(JSON.stringify(files) === JSON.stringify(["rubric.md", "scenario.md"]), `${slug} has unexpected files: ${files.join(", ")}`);
    }
  }

  verifyScenarioHeaders() {
    // Confirms scenario files remain loadable by the central /roleplay skill.
    for (const [slug] of SCENARIOS) {
      const text = this.readScenario(slug);
      for (const header of REQUIRED_SCENARIO_HEADERS) {
        this.assert(text.includes(header), `${slug}/scenario.md missing ${header}`);
      }
    }
  }

  verifyRubricHeaders() {
    // Confirms rubric files expose the required scoring sections.
    for (const [slug] of SCENARIOS) {
      const text = this.readRubric(slug);
      for (const header of REQUIRED_RUBRIC_HEADERS) {
        this.assert(text.includes(header), `${slug}/rubric.md missing ${header}`);
      }
    }
  }

  verifyRubricDimensionCounts() {
    // Confirms each rubric has exactly 15 numbered dimensions.
    for (const [slug] of SCENARIOS) {
      const dimensions = this.readRubric(slug).match(/^### \d+\. /gm) || [];
      this.assert(dimensions.length === 15, `${slug} has ${dimensions.length} dimensions`);
    }
  }

  verifyRubricWeights() {
    // Confirms all rubric weights are numeric, bounded, and sum to the approved range.
    for (const [slug] of SCENARIOS) {
      const weights = [...this.readRubric(slug).matchAll(/\*\*Weight:\*\* (\d+)/g)].map((match) => Number(match[1]));
      this.assert(weights.length === 15, `${slug} has ${weights.length} weights`);
      for (const weight of weights) {
        this.assert(weight >= 1 && weight <= 5, `${slug} has invalid weight ${weight}`);
      }
      const sum = weights.reduce((total, weight) => total + weight, 0);
      this.assert(sum >= 50 && sum <= 80, `${slug} weight sum ${sum} is outside 50-80`);
      this.assert(this.readRubric(slug).includes(`Weights sum: ${sum}.`), `${slug} does not state weight sum ${sum}`);
    }
  }

  verifyScoreAnchors() {
    // Confirms every rubric dimension includes the five required behavioral anchors.
    for (const [slug] of SCENARIOS) {
      const text = this.readRubric(slug);
      for (const label of ["Score 1 - Weak", "Score 2", "Score 3 - Adequate", "Score 4", "Score 5 - Strong"]) {
        const count = (text.match(new RegExp(`\\*\\*${label}:\\*\\*`, "g")) || []).length;
        this.assert(count === 15, `${slug} has ${count} anchors for ${label}`);
      }
    }
  }

  verifyRegistryRows() {
    // Confirms every scenario is discoverable exactly once with the expected display name.
    const registry = fs.readFileSync(path.join(ROLEPLAY_ROOT, "scenarios-registry.md"), "utf8");
    for (const [slug, name] of SCENARIOS) {
      const rowPattern = new RegExp(`^\\| ${this.escapeRegExp(slug)} \\| ${this.escapeRegExp(name)} \\|`, "gm");
      const matches = registry.match(rowPattern) || [];
      this.assert(matches.length === 1, `${slug} expected one registry row, found ${matches.length}`);
    }
  }

  verifySensitiveScenarioGuidance() {
    // Confirms sensitive scenarios include safety and truthfulness guardrails.
    for (const slug of SENSITIVE_SLUGS) {
      const scenario = this.readScenario(slug).toLowerCase();
      const rubric = this.readRubric(slug).toLowerCase();
      this.assert(scenario.includes("safety") || scenario.includes("safe"), `${slug} scenario lacks safety guidance`);
      this.assert(scenario.includes("exaggerates") || scenario.includes("dishonest") || rubric.includes("dishonest"), `${slug} lacks dishonesty guardrail`);
    }
  }

  verifyInstallerFilter() {
    // Confirms the roleplay category still installs only roleplay top-level skills.
    const output = execSync("node bin/install.js roleplay --dry-run", { cwd: REPO_ROOT, encoding: "utf8" });
    this.assert(output.includes("roleplay"), "Installer output missing roleplay");
    this.assert(output.includes("create-roleplay"), "Installer output missing create-roleplay");
    this.assert(!output.includes("daily-review"), "Installer output unexpectedly includes daily-review");
    this.assert(!output.includes("explain"), "Installer output unexpectedly includes explain");
  }

  readScenario(slug) {
    // Reads a generated scenario file for one expected slug.
    return fs.readFileSync(path.join(ROLEPLAY_ROOT, slug, "scenario.md"), "utf8");
  }

  readRubric(slug) {
    // Reads a generated rubric file for one expected slug.
    return fs.readFileSync(path.join(ROLEPLAY_ROOT, slug, "rubric.md"), "utf8");
  }

  escapeRegExp(value) {
    // Escapes dynamic strings before inserting them into a regular expression.
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  assert(condition, message) {
    // Throws with a clear message when a verification condition fails.
    if (!condition) {
      throw new Error(message);
    }
  }
}

new EducationAdvocacyScenarioVerifier().run();
