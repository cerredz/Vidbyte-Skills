# Vidbyte CLI Commands

## Help And Agent Guides

```bash
vidbyte --help
vidbyte agents
vidbyte agents list
vidbyte agents list --json
vidbyte agents get core
vidbyte agents get core --full
vidbyte agents get --all
vidbyte agents path
vidbyte agents path core
```

Set `VIDBYTE_AGENT_SKILLS_DIR` to point at an alternate agent guide directory during development or tests.

## Auth

```bash
vidbyte-skills auth login
vidbyte auth logout
vidbyte auth status
```

`vidbyte-skills auth login` prompts securely in the terminal. Do not ask the user to paste API keys into chat.

## Feedback

```bash
vidbyte feedback submit --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]
```

Use `--dry-run` before a real submission when validating command construction.

## Compressor

```bash
vidbyte compressor submit --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]
```

Use this for compression-check artifacts that should be persisted to Vidbyte.

## Retain

```bash
vidbyte retain --concept1-name <text> --concept1-distillation <text> --concept1-anchor <text> --concept1-hook <text> --question1 <text> --answer1 <text> [--dry-run]
```

The retain command accepts more concept, question, problem, and review fields when the skill generated them. Prefer command flags over temporary files for retention exercises.

## Installer

```bash
vidbyte-skills [skill-name ...] [options]
vidbyte-skills update
```

The installer copies or links product skills into coding harnesses. It is separate from `vidbyte agents`, which only serves local CLI usage instructions.
