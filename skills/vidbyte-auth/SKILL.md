---
name: vidbyte-auth
description: Authenticate the CLI with your Vidbyte account to enable account-linked features like saving analysis results and persisting preferences. Run /vidbyte-auth to start.
---

# Vidbyte Auth

Authenticate your local Vidbyte CLI with a Vidbyte platform account.

## Instructions

Tell the user you will authenticate the Vidbyte CLI. Then run the following command in a bash tool:

```
vidbyte-skills auth login
```

Report the output to the user. If it succeeds, the user is now authenticated and account-linked features are available. If it fails, report the error and suggest visiting https://vidbyte.pro/settings/api-keys to generate a new API key.

**Important:** Never ask the user to type or paste their API key into this chat. The CLI handles key input securely through a terminal prompt.

## Invocation safety

When any Vidbyte skill invokes `vidbyte-skills` with content derived from the
conversation (concepts, questions, notes, etc.), pass each value as its **own argument**
to the command. Never assemble a single shell-command string by interpolating
user- or model-generated text into it. Conversation content can contain quotes,
`$(...)`, backticks, or newlines, and building a shell string from it risks executing
arbitrary commands on the user's machine. Use your tool's argv-array form (one element
per flag and per value); let the CLI receive the arguments verbatim.