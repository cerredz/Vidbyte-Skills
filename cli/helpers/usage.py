def usage() -> str:
    return """Usage: vidbyte <command> [options]

Commands:
  vidbyte feedback submit   --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]
  vidbyte compressor submit --file <path> [--domain <name>] [--conversation-id <id>] [--skill-id <id>] [--dry-run]
  vidbyte retain            --concept1-name <text> --concept1-distillation <text> --concept1-anchor <text> --concept1-hook <text> --question1 <text> --answer1 <text> [--dry-run]
  vidbyte auth login
  vidbyte auth logout
  vidbyte auth status

Security:
  Requests are sent only to https://vidbyte.pro.
  Set VIDBYTE_SKILL_SECRET in your environment or a local .env file before submitting.
"""
