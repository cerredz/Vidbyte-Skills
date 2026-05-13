import fs from "node:fs";
import path from "node:path";
import {
  MANAGED_BLOCK_END,
  MANAGED_BLOCK_START,
  renderManagedRuleBlock,
  renderRuleDocument
} from "./rule-documents.js";

export function installSkillDirectory(skill, target, mode, dryRun, environment) {
  const destination = path.join(target.root, skill.name);
  const unsafe = unsafeSourceDestination(skill.dir, destination, target.root, environment);

  if (unsafe) {
    return { action: "skip", destination, message: unsafe };
  }

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

export function installManagedRuleFile(skills, target, dryRun) {
  if (dryRun) {
    return { action: "update", destination: target.file };
  }

  const block = renderManagedRuleBlock(skills, target.title);
  const action = upsertManagedBlock(target.file, block);

  return { action, destination: target.file };
}

export function installAiderRule(skills, target, dryRun) {
  if (dryRun) {
    return { action: "update", destination: target.conventionsFile };
  }

  const block = renderManagedRuleBlock(skills, target.title);
  const action = upsertManagedBlock(target.conventionsFile, block);
  const configResult = ensureAiderReadsConventions(target.configFile, path.basename(target.conventionsFile));

  return {
    action,
    destination: target.conventionsFile,
    message: configResult
  };
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

function unsafeSourceDestination(source, destination, root, environment) {
  const resolvedSource = resolveExistingPath(source);
  const resolvedDestination = path.resolve(destination);
  const resolvedRoot = path.resolve(root);
  const resolvedSkillsRoot = path.resolve(environment.skillsRoot);

  if (samePath(resolvedSource, resolvedDestination)) {
    return "source and destination are identical";
  }

  if (samePath(resolvedRoot, resolvedSkillsRoot)) {
    return "target root is the source skills directory";
  }

  return "";
}

function resolveExistingPath(targetPath) {
  const resolved = path.resolve(targetPath);

  try {
    return fs.realpathSync(resolved);
  } catch {
    return resolved;
  }
}

function samePath(left, right) {
  return normalizePath(left) === normalizePath(right);
}

function normalizePath(targetPath) {
  return process.platform === "win32" ? targetPath.toLowerCase() : targetPath;
}

function upsertManagedBlock(file, block) {
  fs.mkdirSync(path.dirname(file), { recursive: true });

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `${block}\n`, "utf8");
    return "write";
  }

  const content = fs.readFileSync(file, "utf8");
  const hasStart = content.includes(MANAGED_BLOCK_START);
  const hasEnd = content.includes(MANAGED_BLOCK_END);

  if (hasStart !== hasEnd) {
    throw new Error(`Cannot update ${file}: found only one Vidbyte managed block marker.`);
  }

  if (hasStart) {
    fs.writeFileSync(file, replaceManagedBlock(content, block), "utf8");
    return "update";
  }

  const separator = content.endsWith("\n") ? "\n" : "\n\n";
  fs.writeFileSync(file, `${content}${separator}${block}\n`, "utf8");
  return "update";
}

function replaceManagedBlock(content, block) {
  const start = content.indexOf(MANAGED_BLOCK_START);
  const end = content.indexOf(MANAGED_BLOCK_END, start);
  const afterEnd = end + MANAGED_BLOCK_END.length;

  return `${content.slice(0, start)}${block}${content.slice(afterEnd)}`;
}

function ensureAiderReadsConventions(configFile, conventionsName) {
  if (!fs.existsSync(configFile)) {
    fs.mkdirSync(path.dirname(configFile), { recursive: true });
    fs.writeFileSync(configFile, `read:\n  - ${conventionsName}\n`, "utf8");
    return `${path.basename(configFile)} created`;
  }

  const content = fs.readFileSync(configFile, "utf8");
  if (content.includes(conventionsName)) {
    return `${path.basename(configFile)} already reads ${conventionsName}`;
  }

  const updated = appendToSimpleAiderReadList(content, conventionsName);
  if (!updated) {
    return `warning: add ${conventionsName} to ${path.basename(configFile)} read list`;
  }

  fs.writeFileSync(configFile, updated, "utf8");
  return `${path.basename(configFile)} updated`;
}

function appendToSimpleAiderReadList(content, conventionsName) {
  const lines = content.split(/\r?\n/);
  const inlineRead = lines.some((line) => /^read:\s*\S/.test(line.trim()));

  if (inlineRead) {
    return "";
  }

  const readIndex = lines.findIndex((line) => line.trim() === "read:");

  if (readIndex === -1) {
    return `${content.trimEnd()}\n\nread:\n  - ${conventionsName}\n`;
  }

  const insertAt = findReadListEnd(lines, readIndex);
  if (insertAt === readIndex + 1) {
    return "";
  }

  const nextTopLevel = lines.slice(readIndex + 1, insertAt).some((line) => /^\S/.test(line));
  if (nextTopLevel) {
    return "";
  }

  const updated = [...lines];
  updated.splice(insertAt, 0, `  - ${conventionsName}`);
  return updated.join("\n");
}

function findReadListEnd(lines, readIndex) {
  for (let i = readIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.trim() === "") {
      continue;
    }

    if (/^\S/.test(line)) {
      return i;
    }
  }

  return lines.length;
}
