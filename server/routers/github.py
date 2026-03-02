"""
GitHub Integration Router
=========================

Provides:
- Device flow authentication (POST /api/auth/github/device/start, GET .../status)
- Connection status and disconnect (GET /api/auth/github/status, DELETE /api/auth/github)
- Git repo operations (POST /api/projects/{name}/git/connect, .../git/create)
"""

import logging
import os
import time
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.github_auth_store import clear_auth, get_auth, set_auth
from ..services.github_service import (
    create_repo,
    get_authenticated_user,
    parse_repo_url,
    verify_access,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["github"])


# ============================================================================
# Schemas
# ============================================================================


class DeviceStartResponse(BaseModel):
    userCode: str
    verificationUri: str
    expiresIn: int
    interval: int


class DeviceStatusResponse(BaseModel):
    status: str
    username: Optional[str] = None
    error: Optional[str] = None
    interval: Optional[int] = None


class AuthStatusResponse(BaseModel):
    connected: bool
    username: Optional[str] = None
    connectedAt: Optional[str] = None


class GitConnectRequest(BaseModel):
    repoUrl: str


class GitCreateRequest(BaseModel):
    repoName: Optional[str] = None
    isPrivate: Optional[bool] = False


class GitRepoResponse(BaseModel):
    url: str
    owner: str
    repoName: str
    branch: str


class GitResponse(BaseModel):
    gitRepo: GitRepoResponse


# ============================================================================
# In-memory device flow state
# ============================================================================

_pending_device_flow: Optional[dict] = None


# ============================================================================
# Auth Endpoints
# ============================================================================


@router.post("/api/auth/github/device/start", response_model=DeviceStartResponse)
async def device_flow_start():
    global _pending_device_flow

    client_id = os.environ.get("GITHUB_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="GITHUB_CLIENT_ID not configured in .env")

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            "https://github.com/login/device/code",
            json={"client_id": client_id, "scope": "repo"},
            headers={"Accept": "application/json"},
        )
        data = resp.json()

    if "error" in data:
        raise HTTPException(status_code=400, detail=data.get("error_description", data["error"]))

    _pending_device_flow = {
        "deviceCode": data["device_code"],
        "expiresAt": time.time() + data["expires_in"],
        "interval": data.get("interval", 5),
    }

    return DeviceStartResponse(
        userCode=data["user_code"],
        verificationUri=data["verification_uri"],
        expiresIn=data["expires_in"],
        interval=data.get("interval", 5),
    )


@router.get("/api/auth/github/device/status", response_model=DeviceStatusResponse)
async def device_flow_status():
    global _pending_device_flow

    client_id = os.environ.get("GITHUB_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="GITHUB_CLIENT_ID not configured")

    if _pending_device_flow is None:
        return DeviceStatusResponse(status="error", error="No active device flow. Call /start first.")

    if time.time() > _pending_device_flow["expiresAt"]:
        _pending_device_flow = None
        return DeviceStatusResponse(status="expired")

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": client_id,
                "device_code": _pending_device_flow["deviceCode"],
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
            },
            headers={"Accept": "application/json"},
        )
        data = resp.json()

    if data.get("error") == "authorization_pending":
        return DeviceStatusResponse(status="pending")

    if data.get("error") == "slow_down":
        _pending_device_flow["interval"] = data.get("interval", _pending_device_flow["interval"] + 5)
        return DeviceStatusResponse(status="pending", interval=_pending_device_flow["interval"])

    if data.get("error") == "expired_token":
        _pending_device_flow = None
        return DeviceStatusResponse(status="expired")

    if data.get("error"):
        return DeviceStatusResponse(status="error", error=data.get("error_description", data["error"]))

    access_token = data.get("access_token")
    if access_token:
        try:
            username = await get_authenticated_user(access_token)
        except Exception:
            username = "unknown"
        set_auth(access_token, username)
        _pending_device_flow = None
        return DeviceStatusResponse(status="authorized", username=username)

    return DeviceStatusResponse(status="pending")


@router.get("/api/auth/github/status", response_model=AuthStatusResponse)
async def auth_status():
    auth = get_auth()
    if not auth:
        return AuthStatusResponse(connected=False)
    return AuthStatusResponse(
        connected=True,
        username=auth.get("username"),
        connectedAt=auth.get("connectedAt"),
    )


@router.delete("/api/auth/github", status_code=204)
async def auth_disconnect():
    clear_auth()
    return None


# ============================================================================
# Git Repo Endpoints (per-project)
# ============================================================================


@router.post("/api/projects/{project_name}/git/connect", response_model=GitResponse)
async def git_connect(project_name: str, body: GitConnectRequest):
    auth = get_auth()
    if not auth:
        raise HTTPException(status_code=401, detail="GitHub not connected. Use 'Connect GitHub' first.")

    try:
        parsed = parse_repo_url(body.repoUrl)
        result = await verify_access(parsed["owner"], parsed["repoName"], auth["token"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    git_repo = GitRepoResponse(
        url=f"https://github.com/{result['owner']}/{result['repoName']}",
        owner=result["owner"],
        repoName=result["repoName"],
        branch=result["defaultBranch"],
    )
    return GitResponse(gitRepo=git_repo)


@router.post("/api/projects/{project_name}/git/create", response_model=GitResponse)
async def git_create(project_name: str, body: GitCreateRequest):
    auth = get_auth()
    if not auth:
        raise HTTPException(status_code=401, detail="GitHub not connected. Use 'Connect GitHub' first.")

    import re
    repo_name = body.repoName or re.sub(r"[^a-z0-9-]", "-", project_name.lower()).strip("-")
    repo_name = re.sub(r"-+", "-", repo_name)

    try:
        result = await create_repo(repo_name, auth["token"], body.isPrivate or False)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    git_repo = GitRepoResponse(
        url=result["url"],
        owner=result["owner"],
        repoName=result["repoName"],
        branch="main",
    )
    return GitResponse(gitRepo=git_repo)
