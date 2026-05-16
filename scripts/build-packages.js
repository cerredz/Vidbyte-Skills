#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const MANIFEST_PATH = path.join(REPO_ROOT, "skills-manifest.json");
const SKILLS_DIR = path.join(REPO_ROOT, "skills");
const LIB_DIR = path.join(REPO_ROOT, "lib");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function buildPackage(name, category) {
  const pkgDir = path.join(REPO_ROOT, "packages", name);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const skillNames = manifest[category];

  const pkgLibDir = path.join(pkgDir, "lib");
  fs.rmSync(pkgLibDir, { recursive: true, force: true });
  copyDir(LIB_DIR, pkgLibDir);

  const pkgSkillsDir = path.join(pkgDir, "skills");
  fs.rmSync(pkgSkillsDir, { recursive: true, force: true });

  for (const skillName of skillNames) {
    const src = path.join(SKILLS_DIR, skillName);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(pkgSkillsDir, skillName));
    }
  }

  copyFile(MANIFEST_PATH, path.join(pkgDir, "skills-manifest.json"));
  copyFile(path.join(REPO_ROOT, "README.md"), path.join(pkgDir, "README.md"));
  copyFile(path.join(REPO_ROOT, "LICENSE"), path.join(pkgDir, "LICENSE"));

  console.log(`Built packages/${name} with ${skillNames.length} skills.`);
}

buildPackage("learning", "learning");
buildPackage("reasoning", "reasoning");
