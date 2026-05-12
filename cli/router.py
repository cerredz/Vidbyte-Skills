from .commands.feedback import FeedbackCommand
from .helpers import usage


class CommandRouter:

    def route(self, resource: str, action: str, options: dict) -> str | None:
        if resource == "feedback" and action == "submit":
            cmd = FeedbackCommand()
            return cmd.submit(options)

        raise RuntimeError(f"Unknown command: {resource} {action}\n\n{usage()}")
