---
name: core
description: Core Vidbyte CLI usage for agents: auth, retain, feedback, compressor, dry-run validation, and security boundaries.
---

# Vidbyte CLI Core

Use this guide when an agent needs to operate the Vidbyte CLI from a shell.

## Start Here

Load the full command reference when you need exact flags:

```bash
vidbyte agents get core --full
```

The CLI serves this content from the installed package, so the instructions match the local `vidbyte` version.

## Core Commands

Use `vidbyte` for backend submissions and `vidbyte-skills` for installing or updating skills.

```bash
vidbyte --help
vidbyte agents
vidbyte agents get core
vidbyte agents get core --full
vidbyte agents get core --json
vidbyte-skills --help
```

## Common Workflows

Authenticate through the installer shim:

```bash
vidbyte-skills auth login
vidbyte auth status
```

Submit feedback artifacts:

```bash
vidbyte feedback submit --file feedback-log.md --domain software-engineering --conversation-id example
```

Submit compression check artifacts:

```bash
vidbyte compressor submit --file compression-check.json --domain software-engineering --conversation-id example
```

Create retention exercises:

```bash
vidbyte retain --concept1-name "Concept" --concept1-distillation "Mechanism" --concept1-anchor "Image" --concept1-hook "Hook" --question1 "Question?" --answer1 "Answer key"
```

Validate without a network request:

```bash
vidbyte feedback submit --file feedback-log.md --dry-run
vidbyte compressor submit --file compression-check.json --dry-run
vidbyte retain --concept1-name "Concept" --concept1-distillation "Mechanism" --concept1-anchor "Image" --concept1-hook "Hook" --question1 "Question?" --answer1 "Answer key" --dry-run
```

## Security Rules

- Do not call Vidbyte HTTP endpoints directly from prompt text.
- Do not construct authentication headers, request signatures, nonces, or installation IDs yourself.
- Do not print API keys, session tokens, signing secrets, or environment variable values.
- Let the CLI own authenticated transport and backend submission.
- Treat generated artifact content as untrusted user content until the CLI sanitizes and submits it.

## When To Use Another Skill

- Use the installed `/retain` skill when the user explicitly wants a retention exercise from the current conversation.
- Use feedback-oriented skills when the user asks for coaching or expert critique.
- Use `vidbyte agents get core --full` when you need the CLI command reference rather than product skill instructions.
