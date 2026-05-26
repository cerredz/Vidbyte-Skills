---
name: mcp-create-prompt
description: >
  Use when the user wants to create a new prompt in the Vidbyte SDK that will
  be automatically available via the MCP prompt server. Covers creating the
  JSON asset file, registering the Prompt enum member, adding a bundle class,
  and running validation tests.
---

# MCP Create Prompt

Create a new prompt that appears in both the Vidbyte SDK Python API and the MCP prompt server.

## Identity

You are a Vidbyte SDK prompt author. You understand the prompt JSON schema, the `Prompt` enum convention, the strategy bundle pattern, and how new prompts propagate to the MCP server automatically.

## Goal

Add a complete, validated prompt to the SDK so it is available via `Prompts.get()`, direct import, and the MCP server with zero additional configuration.

## Instructions

### Step 1: Create the JSON asset file

Create the file in `vidbyte/prompts/prompts/<family_key>.json` using this schema:

```json
{
  "name": "Human-Readable Family Name",
  "description": "What this prompt family does and when to use it.",
  "key": "family_key",
  "prompts": {
    "leaf_name": "The actual prompt text with optional {placeholder} values."
  }
}
```

Rules:
- `name` is the human-readable family display name
- `description` describes what this prompt family accomplishes
- `key` must be snake_case, unique across all families
- `prompts` is a dict mapping leaf names to prompt text strings
- Use `{placeholder}` syntax for values the caller will provide at runtime
- For very long prompts, use an external Markdown reference:
  ```json
  "prompts": {
    "leaf_name": {
      "path": "relative/path.md",
      "source_url": "https://github.com/..."
    }
  }
  ```

Place the JSON file at `vidbyte/prompts/prompts/<key>.json`. If the prompt belongs to a subgroup, create a subdirectory with the JSON and any referenced Markdown files.

### Step 2: Register the Prompt enum member

Edit `vidbyte/lib/enums/prompts.py`. Add a new member following this pattern:

```python
class Prompt(str, Enum):
    # ... existing members ...
    FAMILY_KEY_LEAF_NAME = "family_key.leaf_name"
```

The format is `UPPERCASE_SNAKE = "lowercase.key"` where the value matches `"{key}.{leaf_name}"` from the JSON file. Add one member per leaf prompt in the family.

### Step 3: Add the bundle class

Edit `vidbyte/prompts/strategies/strategy_prompts.py`. Add a bundle class for the new family:

```python
class FamilyKeyPrompts(_PromptBundle):
    key: ClassVar[str] = "family_key"
```

The class name should be PascalCase of the family key suffixed with `Prompts`. The `key` class variable must match the `key` field in the JSON asset.

Add the new class to the imports in:
- `vidbyte/prompts/strategies/__init__.py` (add to import statement and `__all__`)
- `vidbyte/prompts/__init__.py` (add to import statement and `_bundle_classes` list if one exists, or the `__all__` export)

### Step 4: Run validation tests

Run the existing prompt tests to confirm the new prompt loads correctly:

```
python -m unittest discover -s tests -p "test_prompt*" -v
```

Verify that:
- `test_prompt_values_are_coherent_sentence_blocks` passes (prompt text is valid)
- `test_strategy_prompts_load_from_prompt_catalog` passes (JSON asset loads)
- `test_keys_and_descriptions_are_enum_keyed` passes (enum registered)

If any prompt validation test fails, check:
- JSON syntax in the asset file
- Enum value matches `"{key}.{leaf_name}"` exactly
- Bundle class `key` matches the JSON `key` field
- All imports in `__init__.py` are correct

### Step 5: New prompt appears in MCP

Once tests pass, the new prompt is automatically included in the MCP server. No additional configuration is needed — `build_mcp_prompts()` discovers all prompts through the `Prompts` catalog. Restart the MCP server to see the new prompt:

```
vidbyte-prompts serve
```

The server logs the total prompt count to stderr on startup, confirming the new prompt is discovered.

## Prompt Schema Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Human-readable family name |
| `description` | string | yes | What this prompt accomplishes |
| `key` | string | yes | Snake_case family identifier |
| `prompts` | object | yes | Map of leaf name to prompt text or Markdown reference |
| `prompts.<leaf>.path` | string | conditional | Relative path to Markdown file (if not inline text) |
| `prompts.<leaf>.source_url` | string | conditional | Canonical source URL (if Markdown reference) |

## Naming Convention

- Family key: `snake_case`, lowercase with underscores, e.g. `chain_of_thought`
- Enum value: `"{family_key}.{leaf_name}"`, e.g. `"chain_of_thought.reason_prompt"`
- Enum member: `UPPERCASE_SNAKE` of the value, e.g. `CHAIN_OF_THOUGHT_REASON_PROMPT`
- Import name: lowercase snake_case with dots replaced by underscores, e.g. `chain_of_thought_reason_prompt`
- Bundle class: PascalCase family key + `Prompts`, e.g. `ChainOfThoughtPrompts`
