def usage() -> str:
    return """Usage: vidbyte <command> [options]

Commands:
  vidbyte feedback submit --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]

Security:
  Requests are sent only to https://vidbyte.pro.
  Set VIDBYTE_SKILL_SECRET in your environment or a local .env file before submitting.
"""
