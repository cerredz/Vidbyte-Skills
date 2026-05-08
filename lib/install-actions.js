import fs from "node:fs";
import path from "node:path";
import { renderRuleDocument } from "./rule-documents.js";

export function installSkillDirectory(skill, target, mode, dryRun) {
  const destination = path.join(target.root, skill.name);

  if (dryRun) {
    return { action: mode, destination };
  }

  replaceSkillDirectory(skill.dir, destination, target.root, mode);
  return { action: mode, destination };
}

export function installRuleFile(skills, target, dryRun) {
  if (dryRun) {
    return { action: "write", destination: target.file };
  }

  fs.mkdirSync(path.dirname(target.file), { recursive: true });
  fs.writeFileSync(target.file, renderRuleDocument(skills, target.title), "utf8");

  return { action: "write", destination: target.file };
}

function replaceSkillDirectory(source, destination, root, mode) {
  fs.mkdirSync(root, { recursive: true });
  fs.rmSync(destination, { recursive: true, force: true });

  if (mode === "copy") {
    fs.cpSync(source, destination, { recursive: true });
    return;
  }

  fs.symlinkSync(source, destination, linkType());
}

function linkType() {
  return process.platform === "win32" ? "junction" : "dir";
}
