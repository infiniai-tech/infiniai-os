"""
GitHub API Service
==================

Async client for GitHub REST API using httpx.
Ported from OlympusAI's Node.js github.js service.
"""

import asyncio
import logging
import re
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"


def _headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "Olympus",
    }


async def _gh_fetch(
    path: str,
    token: str,
    method: str = "GET",
    body: Optional[dict] = None,
) -> Any:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.request(
            method,
            f"{GITHUB_API}{path}",
            headers=_headers(token),
            json=body,
        )
        if not response.is_success:
            try:
                err = response.json()
                msg = err.get("message", response.reason_phrase)
            except Exception:
                msg = response.reason_phrase
            raise RuntimeError(f"GitHub API {response.status_code}: {msg}")
        if response.status_code == 204:
            return None
        return response.json()


def parse_repo_url(url: str) -> dict[str, str]:
    cleaned = url.strip().rstrip("/")
    if cleaned.endswith(".git"):
        cleaned = cleaned[:-4]
    match = re.search(r"github\.com[/:]([^/]+)/([^/]+)", cleaned)
    if not match:
        raise ValueError(f"Invalid GitHub URL: {url}")
    return {"owner": match.group(1), "repoName": match.group(2)}


async def verify_access(owner: str, repo_name: str, token: str) -> dict[str, str]:
    data = await _gh_fetch(f"/repos/{owner}/{repo_name}", token)
    return {
        "owner": owner,
        "repoName": repo_name,
        "defaultBranch": data.get("default_branch", "main"),
    }


async def create_repo(name: str, token: str, private: bool = False) -> dict[str, str]:
    data = await _gh_fetch(
        "/user/repos",
        token,
        method="POST",
        body={
            "name": name,
            "description": f"Olympus project: {name}",
            "private": private,
            "auto_init": True,
        },
    )
    return {
        "url": data["html_url"],
        "owner": data["owner"]["login"],
        "repoName": data["name"],
    }


async def get_authenticated_user(token: str) -> str:
    data = await _gh_fetch("/user", token)
    return data.get("login", "unknown")


async def get_file_content(
    owner: str, repo_name: str, token: str, branch: str, file_path: str
) -> Optional[dict]:
    try:
        data = await _gh_fetch(
            f"/repos/{owner}/{repo_name}/contents/{file_path}?ref={branch}", token
        )
        import base64
        content = base64.b64decode(data["content"]).decode("utf-8")
        return {"content": content, "sha": data["sha"]}
    except RuntimeError as e:
        if "404" in str(e):
            return None
        raise


async def push_files(
    owner: str,
    repo_name: str,
    token: str,
    branch: str,
    files: list[dict[str, str]],
    commit_message: str,
) -> dict[str, str]:
    """
    Push multiple files in a single commit using the Git Tree API.
    Retries once on 422 (stale base SHA).
    """

    async def attempt() -> dict[str, str]:
        ref_data = await _gh_fetch(
            f"/repos/{owner}/{repo_name}/git/refs/heads/{branch}", token
        )
        base_commit_sha = ref_data["object"]["sha"]

        commit_data = await _gh_fetch(
            f"/repos/{owner}/{repo_name}/git/commits/{base_commit_sha}", token
        )
        base_tree_sha = commit_data["tree"]["sha"]

        tree_items = []
        for f in files:
            blob = await _gh_fetch(
                f"/repos/{owner}/{repo_name}/git/blobs",
                token,
                method="POST",
                body={"content": f["content"], "encoding": "utf-8"},
            )
            tree_items.append({
                "path": f["path"],
                "mode": "100644",
                "type": "blob",
                "sha": blob["sha"],
            })

        tree_data = await _gh_fetch(
            f"/repos/{owner}/{repo_name}/git/trees",
            token,
            method="POST",
            body={"base_tree": base_tree_sha, "tree": tree_items},
        )

        new_commit = await _gh_fetch(
            f"/repos/{owner}/{repo_name}/git/commits",
            token,
            method="POST",
            body={
                "message": commit_message,
                "tree": tree_data["sha"],
                "parents": [base_commit_sha],
            },
        )

        await _gh_fetch(
            f"/repos/{owner}/{repo_name}/git/refs/heads/{branch}",
            token,
            method="PATCH",
            body={"sha": new_commit["sha"], "force": False},
        )

        return {
            "commitUrl": f"https://github.com/{owner}/{repo_name}/commit/{new_commit['sha']}",
            "commitSha": new_commit["sha"],
        }

    try:
        return await attempt()
    except RuntimeError as e:
        if "422" in str(e):
            logger.warning("422 on ref update — retrying with fresh SHA")
            return await attempt()
        raise
