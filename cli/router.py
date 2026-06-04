from .commands.agents import AgentSkillsCommand
from .commands.auth import AuthCommand
from .commands.feedback import FeedbackCommand
from .commands.compressor import CompressorCommand
from .commands.retain import RetainCommand
from .helpers import usage


class CommandRouter:

    def route(self, resource: str, action: str, options: dict) -> str | None:
        # Routes a parsed resource/action pair to the command implementation that owns it.
        if resource == "agents":
            cmd = AgentSkillsCommand()
            return cmd.run(action, options.get("_args", []))

        if resource == "feedback" and action == "submit":
            cmd = FeedbackCommand()
            return cmd.submit(options)

        if resource == "compressor" and action == "submit":
            cmd = CompressorCommand()
            return cmd.submit(options)

        if resource == "retain" and action == "submit":
            cmd = RetainCommand(options)
            return cmd.submit()

        if resource == "auth" and action in ("login", "logout", "status"):
            cmd = AuthCommand()
            method = getattr(cmd, action)
            return method(options)

        raise RuntimeError(f"Unknown command: {resource} {action}\n\n{usage()}")
