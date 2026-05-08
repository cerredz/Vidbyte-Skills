export function readFrontmatterValue(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const keyPattern = new RegExp(`^${escapeRegExp(key)}:\\s*(.*)$`);

  for (let i = 0; i < lines.length; i += 1) {
    const value = readFrontmatterLine(lines, keyPattern, i);

    if (value !== undefined) {
      return value;
    }
  }

  return "";
}

export function cleanYamlScalar(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed.replace(/^['"]|['"]$/g, "") : "";
}

function readFrontmatterLine(lines, keyPattern, index) {
  const match = lines[index].match(keyPattern);

  if (!match) {
    return undefined;
  }

  return cleanYamlScalar(match[1]) || readIndentedYamlValue(lines, index + 1);
}

function readIndentedYamlValue(lines, startIndex) {
  const continuation = [];

  for (let i = startIndex; i < lines.length; i += 1) {
    if (/^[A-Za-z0-9_-]+:\s*/.test(lines[i])) {
      break;
    }
    if (/^\s+/.test(lines[i])) {
      continuation.push(lines[i].trim());
    }
  }

  return cleanYamlScalar(continuation.join(" "));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
