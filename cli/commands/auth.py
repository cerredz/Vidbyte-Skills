import getpass
import os
import re
import sys
from datetime import datetime, timezone

from ..client import VidbyteRequestBuilder
from ..auth.session import CredentialsSession
from ..constants.auth import API_KEY_PATTERN
from ..helpers import read_package_version


class AuthCommand:

    def __init__(self):
        self._session = CredentialsSession()

    def login(self, options: dict) -> str | None:
        print("Visit https://vidbyte.pro/settings/api-keys to generate an API key.")
        key = _prompt_secure("Paste your API key: ")

        if not key:
            raise RuntimeError("No API key provided.")

        if not re.match(API_KEY_PATTERN, key):
            raise RuntimeError(
                "Invalid API key format. Keys start with vb_live_ followed by at least 32 characters."
            )

        try:
            builder = VidbyteRequestBuilder(
                body="",
                cli_version=read_package_version(),
                endpoint_name="auth-validate",
                bearer_token=key,
                method="POST",
            )
            data = builder.request()
        except RuntimeError as err:
            raise _translate_api_error(err)

        self._session.store({
            "token": data["token"],
            "username": data["username"],
            "email": data["email"],
            "tier": data["tier"],
            "authenticatedAt": datetime.now(timezone.utc).isoformat(),
        })

        del key
        print(f"Authenticated as {data['username']} ({data['email']}) \u2014 {data['tier']} tier")
        return None

    def logout(self, options: dict) -> str | None:
        token = self._session.token()

        if token is None:
            print("Not authenticated.")
            return None

        try:
            builder = VidbyteRequestBuilder(
                body="",
                cli_version=read_package_version(),
                endpoint_name="auth-session",
                bearer_token=token,
                method="DELETE",
            )
            builder.request()
        except RuntimeError:
            pass

        self._session.clear()
        print("Logged out.")
        return None

    def status(self, options: dict) -> str | None:
        if os.environ.get("VIDBYTE_SESSION_TOKEN"):
            print("Authenticated via VIDBYTE_SESSION_TOKEN")
            return None

        token = self._session.token()

        if token is None:
            print("Not authenticated. Run vidbyte-skills auth login.")
            return None

        try:
            builder = VidbyteRequestBuilder(
                body="",
                cli_version=read_package_version(),
                endpoint_name="auth-session",
                bearer_token=token,
                method="GET",
            )
            data = builder.request()
            print(f"{data['username']} ({data['email']}) \u2014 {data['tier']} tier")
        except RuntimeError as err:
            if hasattr(err, "status_code") and err.status_code == 401:
                self._session.clear()
                print("Session expired. Run vidbyte-skills auth login to re-authenticate.")
                return None
            print(
                f"Session status unknown \u2014 offline"
            )

        return None


def _prompt_secure(prompt_text: str) -> str:
    if not sys.stdin.isatty():
        fallback = os.environ.get("VIDBYTE_API_KEY")
        if fallback:
            return fallback
        raise RuntimeError(
            "Authentication requires an interactive terminal. Use VIDBYTE_SESSION_TOKEN instead."
        )
    return getpass.getpass(prompt_text)


def _translate_api_error(err: RuntimeError) -> RuntimeError:
    status_code = getattr(err, "status_code", None)

    if status_code == 401:
        return RuntimeError("Invalid API key. Check you copied it correctly.")
    if status_code == 403:
        return RuntimeError("API key has been revoked or expired.")
    if status_code == 429:
        return RuntimeError("Too many attempts. Wait and try again.")
    if "timed out" in str(err).lower():
        return RuntimeError("Request timed out.")
    if "Unable to reach" in str(err) or "connection" in str(err).lower():
        return RuntimeError("Unable to reach Vidbyte backend. Check your connection.")
    return err