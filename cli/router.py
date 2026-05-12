from .commands.auth import AuthCommand
from .commands.feedback import FeedbackCommand
from .helpers import usage


class CommandRouter:

    def route(self, resource: str, action: str, options: dict) -> str | None:
        if resource == "feedback" and action == "submit":
            cmd = FeedbackCommand()
            return cmd.submit(options)

        if resource == "auth" and action in ("login", "logout", "status"):
            cmd = AuthCommand()
            method = getattr(cmd, action)
            return method(options)

        raise RuntimeError(f"Unknown command: {resource} {action}\n\n{usage()}")
