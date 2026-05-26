---
name: mcp-export-prompts
description: >
  Use when the user wants to export Vidbyte SDK prompts as standalone JSON files
  for distribution, backup, or use outside the Python SDK. Produces one
  self-contained JSON file per prompt with metadata, text, and argument
  definitions.
---

# MCP Export Prompts

Export all Vidbyte SDK prompts as standalone, self-contained JSON files that can be distributed, archived, or consumed by non-Python tooling.

## Identity

You are a prompt export operator. You understand the `vidbyte-prompts export` command, the standalone prompt file format, and how exported files can be used independently of the SDK.

## Goal

Produce a directory of standalone prompt files that any system can consume — no Python, no SDK dependency, just JSON.

## Instructions

### Step 1: Export the prompts

Run:

```
vidbyte-prompts export --output-dir <directory>
```

Replace `<directory>` with the desired output path. If the directory does not exist, it will be created automatically.

Example:

```
vidbyte-prompts export --output-dir ./my-exported-prompts
```

Output:

```
Exported 42 prompts to /path/to/my-exported-prompts
```

### Step 2: Understand the exported format

Each exported file is named `<family-key>-<leaf-name>.json` (dots replaced with hyphens). For example, `chain_of_thought.reason_prompt` becomes `chain-of-thought-reason-prompt.json`.

File contents:

```json
{
  "name": "Chain of Thought",
  "description": "Chain of Thought is a foundational reasoning strategy...",
  "key": "chain_of_thought.reason_prompt",
  "family": "chain_of_thought",
  "text": "Solve the task carefully by reasoning step by step...",
  "arguments": ["task"],
  "version": "0.1.0"
}
```

| Field | Description |
|-------|-------------|
| `name` | Human-readable prompt family name |
| `description` | What this prompt does |
| `key` | Canonical enum key (`family.leaf`) |
| `family` | Prompt family identifier |
| `text` | The actual prompt text, with `{placeholders}` |
| `arguments` | List of placeholder names extracted from text |
| `version` | SDK version at time of export |

### Step 3: Use exported prompts

**With the MCP server (future):** Point the server at a directory of exported files. (The `--prompts-dir` flag is planned for a future release.)

**In custom tooling:** Read the JSON files in any language:

```python
import json
with open("chain-of-thought-reason-prompt.json") as f:
    prompt = json.load(f)
    rendered = prompt["text"].format(task="Explain quantum computing")
```

```javascript
const fs = require("fs");
const prompt = JSON.parse(fs.readFileSync("chain-of-thought-reason-prompt.json", "utf8"));
const rendered = prompt.text.replace("{task}", "Explain quantum computing");
```

**As reference data:** The exported files serve as a versioned, portable snapshot of the prompt catalog. Check them into your own repo, use them as build artifacts, or distribute them alongside your own tools.

## Export Options

| Flag | Description |
|------|-------------|
| `--output-dir`, `-o` | Directory to write prompt files (default: current directory) |

## Notes

- Exported files are deterministic — running the export again with the same SDK version produces identical files
- The `version` field matches the SDK version at export time
- Prompts with external Markdown references (goals, mimic_behavior) are resolved to inline text at export time
- The MCP server reads from the SDK catalog, not exported files — the export is a distribution channel, not the runtime source
