import getpass
import os
import re
import sys
from datetime import datetime, timezone

from ..auth.api import validate_api_key, get_session_status, revoke_session
from ..auth.session import get, store, clear
from ..constants.auth import API_KEY_PATTERN


class AuthCommand:

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
            data = validate_api_key(key)
        except RuntimeError as err:
            raise _translate_api_error(err)

        store({
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
        cred = get()

        if cred is None:
            print("Not authenticated.")
            return None

        try:
            revoke_session(cred["token"])
        except RuntimeError:
            pass

        clear()
        print("Logged out.")
        return None

    def status(self, options: dict) -> str | None:
        if os.environ.get("VIDBYTE_SESSION_TOKEN"):
            print("Authenticated via VIDBYTE_SESSION_TOKEN")
            return None

        cred = get()

        if cred is None:
            print("Not authenticated. Run vidbyte-skills auth login.")
            return None

        try:
            data = get_session_status(cred["token"])
            print(f"{data['username']} ({data['email']}) \u2014 {data['tier']} tier")
        except RuntimeError as err:
            if hasattr(err, "status_code") and err.status_code == 401:
                clear()
                print("Session expired. Run vidbyte-skills auth login to re-authenticate.")
                return None
            print(
                f"{cred['username']} ({cred['email']}) \u2014 "
                f"{cred['tier']} tier (session status unknown \u2014 offline)"
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
