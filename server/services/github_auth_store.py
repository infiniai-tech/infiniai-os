"""
GitHub Auth Store
=================

Persists GitHub OAuth token to ~/.autoforge/github_auth.json.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, TypedDict

logger = logging.getLogger(__name__)

AUTH_DIR = Path.home() / ".autoforge"
AUTH_FILE = AUTH_DIR / "github_auth.json"


class AuthData(TypedDict, total=False):
    token: str
    username: str
    connectedAt: str


def get_auth() -> Optional[AuthData]:
    if not AUTH_FILE.exists():
        return None
    try:
        data = json.loads(AUTH_FILE.read_text(encoding="utf-8"))
        return data if data.get("token") else None
    except Exception:
        return None


def set_auth(token: str, username: str) -> None:
    AUTH_DIR.mkdir(parents=True, exist_ok=True)
    data: AuthData = {
        "token": token,
        "username": username,
        "connectedAt": datetime.now(timezone.utc).isoformat(),
    }
    AUTH_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    logger.info("GitHub auth saved for user '%s'", username)


def clear_auth() -> None:
    AUTH_DIR.mkdir(parents=True, exist_ok=True)
    AUTH_FILE.write_text("{}", encoding="utf-8")
    logger.info("GitHub auth cleared")
