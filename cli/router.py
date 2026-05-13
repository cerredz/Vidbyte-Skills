from .commands.auth import AuthCommand
from .commands.feedback import FeedbackCommand
from .commands.compressor import CompressorCommand
from .commands.retain import RetainCommand
from .helpers import usage


class CommandRouter:

    def route(self, resource: str, action: str, options: dict) -> str | None:
        if resource == "feedback" and action == "submit":
            cmd = FeedbackCommand()
            return cmd.submit(options)

        if resource == "compressor" and action == "submit":
            cmd = CompressorCommand()
            return cmd.submit(options)

        if resource == "retain" and action == "submit":
            cmd = RetainCommand()
            return cmd.submit(options)

        if resource == "auth" and action in ("login", "logout", "status"):
            cmd = AuthCommand()
            method = getattr(cmd, action)
            return method(options)

        raise RuntimeError(f"Unknown command: {resource} {action}\n\n{usage()}")
