"""
Spec Files Router
=================

Provides endpoints for reading, writing, listing, and approving
spec files generated during brownfield modernization analysis.

Spec files live in <project_dir>/.autoforge/specs/ and their review
status is tracked in <project_dir>/.autoforge/specs/.review_status.json.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects/{project_name}/specs", tags=["specs"])

SPEC_FILES = ["constitution.md", "spec.md", "plan.md", "tasks.md"]
REVIEW_STATUS_FILE = ".review_status.json"


class SpecFileInfo(BaseModel):
    filename: str
    status: str  # "pending" | "approved"
    approved_at: str | None = None
    size: int = 0


class SpecListResponse(BaseModel):
    files: list[SpecFileInfo]
    all_approved: bool
    analysis_status: str  # "not_started" | "running" | "complete" | "error"


class SpecFileContent(BaseModel):
    filename: str
    content: str
    status: str


class SpecWriteRequest(BaseModel):
    content: str


class SpecApproveResponse(BaseModel):
    filename: str
    status: str
    all_approved: bool


class ModernizeStartResponse(BaseModel):
    status: str
    message: str


class ModernizeStatusResponse(BaseModel):
    status: str  # "not_started" | "running" | "complete" | "error"
    error: str | None = None
    progress_messages: list[str] = []


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_project_dir(project_name: str) -> Path:
    """Resolve project directory from registry."""
    import sys
    root = Path(__file__).parent.parent.parent
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    from registry import get_project_path
    project_dir = get_project_path(project_name)
    if not project_dir or not project_dir.exists():
        raise HTTPException(status_code=404, detail=f"Project '{project_name}' not found")
    return project_dir


def _get_specs_dir(project_dir: Path) -> Path:
    return project_dir / ".autoforge" / "specs"


def _ensure_specs_dir(project_dir: Path) -> Path:
    specs_dir = _get_specs_dir(project_dir)
    specs_dir.mkdir(parents=True, exist_ok=True)
    return specs_dir


def _read_review_status(project_dir: Path) -> dict[str, Any]:
    status_path = _get_specs_dir(project_dir) / REVIEW_STATUS_FILE
    if status_path.exists():
        try:
            return json.loads(status_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {"files": {}, "all_approved": False}


def _write_review_status(project_dir: Path, status: dict[str, Any]) -> None:
    specs_dir = _ensure_specs_dir(project_dir)
    status_path = specs_dir / REVIEW_STATUS_FILE
    status_path.write_text(json.dumps(status, indent=2), encoding="utf-8")


def _get_analysis_status(project_dir: Path) -> str:
    """Check the analysis status from the analysis status file."""
    status_path = _get_specs_dir(project_dir) / ".analysis_status.json"
    if status_path.exists():
        try:
            data = json.loads(status_path.read_text(encoding="utf-8"))
            return data.get("status", "not_started")
        except (json.JSONDecodeError, OSError):
            pass
    return "not_started"


def _check_all_approved(review_status: dict[str, Any], project_dir: Path) -> bool:
    """Check if ALL expected spec files exist on disk and are approved.

    Requires every file in SPEC_FILES to be present — approving a partial set
    (e.g. only app_spec.txt while others are still being generated) must not
    trigger the all-approved transition.
    """
    specs_dir = _get_specs_dir(project_dir)
    files_info = review_status.get("files", {})

    for filename in SPEC_FILES:
        file_path = specs_dir / filename
        if not file_path.exists():
            return False  # Still being generated
        file_status = files_info.get(filename, {})
        if file_status.get("status") != "approved":
            return False

    # Also require app_spec.txt in prompts directory
    prompts_dir = project_dir / ".autoforge" / "prompts"
    if not (prompts_dir / "app_spec.txt").exists():
        return False  # Still being generated
    app_spec_status = files_info.get("app_spec.txt", {})
    if app_spec_status.get("status") != "approved":
        return False

    return True


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=SpecListResponse)
async def list_spec_files(project_name: str):
    """List all spec files and their review status."""
    project_dir = _get_project_dir(project_name)
    specs_dir = _get_specs_dir(project_dir)
    review_status = _read_review_status(project_dir)
    files_info = review_status.get("files", {})
    analysis_status = _get_analysis_status(project_dir)

    result: list[SpecFileInfo] = []

    # Check standard spec files
    for filename in SPEC_FILES:
        file_path = specs_dir / filename
        if file_path.exists():
            file_review = files_info.get(filename, {})
            result.append(SpecFileInfo(
                filename=filename,
                status=file_review.get("status", "pending"),
                approved_at=file_review.get("approved_at"),
                size=file_path.stat().st_size,
            ))

    # Also include app_spec.txt from prompts directory
    prompts_dir = project_dir / ".autoforge" / "prompts"
    app_spec_path = prompts_dir / "app_spec.txt"
    if app_spec_path.exists():
        file_review = files_info.get("app_spec.txt", {})
        result.append(SpecFileInfo(
            filename="app_spec.txt",
            status=file_review.get("status", "pending"),
            approved_at=file_review.get("approved_at"),
            size=app_spec_path.stat().st_size,
        ))

    all_approved = _check_all_approved(review_status, project_dir) if result else False

    return SpecListResponse(
        files=result,
        all_approved=all_approved,
        analysis_status=analysis_status,
    )


@router.get("/{filename}", response_model=SpecFileContent)
async def read_spec_file(project_name: str, filename: str):
    """Read the content of a spec file."""
    project_dir = _get_project_dir(project_name)
    review_status = _read_review_status(project_dir)
    files_info = review_status.get("files", {})

    # Resolve file path (app_spec.txt is in prompts/, others in specs/)
    if filename == "app_spec.txt":
        file_path = project_dir / ".autoforge" / "prompts" / filename
    elif filename in SPEC_FILES:
        file_path = _get_specs_dir(project_dir) / filename
    else:
        raise HTTPException(status_code=400, detail=f"Unknown spec file: {filename}")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Spec file '{filename}' not found")

    content = file_path.read_text(encoding="utf-8")
    file_review = files_info.get(filename, {})

    return SpecFileContent(
        filename=filename,
        content=content,
        status=file_review.get("status", "pending"),
    )


@router.put("/{filename}", response_model=SpecFileContent)
async def write_spec_file(project_name: str, filename: str, body: SpecWriteRequest):
    """Write/update a spec file. Resets approval status to pending."""
    project_dir = _get_project_dir(project_name)

    if filename == "app_spec.txt":
        file_path = project_dir / ".autoforge" / "prompts" / filename
    elif filename in SPEC_FILES:
        file_path = _ensure_specs_dir(project_dir) / filename
    else:
        raise HTTPException(status_code=400, detail=f"Unknown spec file: {filename}")

    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(body.content, encoding="utf-8")

    # Reset this file's approval status since it was edited
    review_status = _read_review_status(project_dir)
    if "files" not in review_status:
        review_status["files"] = {}
    review_status["files"][filename] = {"status": "pending", "approved_at": None}
    review_status["all_approved"] = False
    _write_review_status(project_dir, review_status)

    logger.info(f"Spec file '{filename}' updated for project '{project_name}'")

    return SpecFileContent(
        filename=filename,
        content=body.content,
        status="pending",
    )


@router.post("/{filename}/approve", response_model=SpecApproveResponse)
async def approve_spec_file(project_name: str, filename: str):
    """Approve a spec file for use by the coding agents."""
    project_dir = _get_project_dir(project_name)

    # Verify the file exists
    if filename == "app_spec.txt":
        file_path = project_dir / ".autoforge" / "prompts" / filename
    elif filename in SPEC_FILES:
        file_path = _get_specs_dir(project_dir) / filename
    else:
        raise HTTPException(status_code=400, detail=f"Unknown spec file: {filename}")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Spec file '{filename}' not found")

    review_status = _read_review_status(project_dir)
    if "files" not in review_status:
        review_status["files"] = {}

    review_status["files"][filename] = {
        "status": "approved",
        "approved_at": datetime.now(timezone.utc).isoformat(),
    }

    all_approved = _check_all_approved(review_status, project_dir)
    review_status["all_approved"] = all_approved
    _write_review_status(project_dir, review_status)

    logger.info(f"Spec file '{filename}' approved for project '{project_name}' (all_approved={all_approved})")

    return SpecApproveResponse(
        filename=filename,
        status="approved",
        all_approved=all_approved,
    )


# ---------------------------------------------------------------------------
# Modernize Analysis Endpoints
# ---------------------------------------------------------------------------

@router.post("/modernize/start", response_model=ModernizeStartResponse)
async def start_modernize_analysis(project_name: str):
    """Start automatic codebase analysis and spec generation."""
    project_dir = _get_project_dir(project_name)

    # Get target stack from registry
    import sys
    root = Path(__file__).parent.parent.parent
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    from registry import get_project_info

    project_info = get_project_info(project_name)
    if not project_info or not project_info.get("target_stack"):
        raise HTTPException(
            status_code=400,
            detail="Project does not have a target stack configured. Cannot run modernization analysis."
        )

    target_stack_json = project_info["target_stack"]

    # Check if already running
    from ..services.modernize_session import get_session, start_session
    existing = get_session(project_name)
    if existing and existing.status == "running":
        return ModernizeStartResponse(
            status="running",
            message="Analysis is already in progress."
        )

    await start_session(project_name, project_dir, target_stack_json)

    return ModernizeStartResponse(
        status="running",
        message="Codebase analysis started. Zeus is analyzing your legacy code..."
    )


@router.get("/modernize/status", response_model=ModernizeStatusResponse)
async def get_modernize_status(project_name: str):
    """Get the current status of the modernization analysis."""
    project_dir = _get_project_dir(project_name)

    # First check in-memory session
    from ..services.modernize_session import get_session
    session = get_session(project_name)
    if session:
        return ModernizeStatusResponse(
            status=session.status,
            error=session.error,
            progress_messages=session.progress_messages[-10:],
        )

    # Fall back to on-disk status
    analysis_status = _get_analysis_status(project_dir)
    return ModernizeStatusResponse(
        status=analysis_status,
        error=None,
        progress_messages=[],
    )
