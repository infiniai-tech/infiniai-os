"""
Modernize Analysis Session
===========================

Non-interactive Claude session that analyzes an existing codebase
and generates modernization spec files without user interaction.

Uses the same Claude SDK infrastructure as SpecChatSession but runs
autonomously — no WebSocket or chat required.
"""

import asyncio
import json
import logging
import os
import shutil
import sys
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient
from dotenv import load_dotenv

from .chat_constants import ROOT_DIR, safe_receive_response

load_dotenv()

logger = logging.getLogger(__name__)

# Global session tracking
_sessions: dict[str, "ModernizeSession"] = {}
_sessions_lock = threading.Lock()


class ModernizeSession:
    """
    Non-interactive Claude session for codebase analysis and spec generation.

    Runs the modernize-spec skill in auto mode, generating all spec files
    without asking the user any questions.
    """

    def __init__(self, project_name: str, project_dir: Path, target_stack_json: str):
        self.project_name = project_name
        self.project_dir = project_dir
        self.target_stack_json = target_stack_json
        self.client: Optional[ClaudeSDKClient] = None
        self.status: str = "idle"  # idle | running | complete | error
        self.error: Optional[str] = None
        self.progress_messages: list[str] = []
        self._task: Optional[asyncio.Task] = None
        self._client_entered: bool = False

    async def close(self) -> None:
        if self.client and self._client_entered:
            try:
                await self.client.__aexit__(None, None, None)
            except Exception as e:
                logger.warning(f"Error closing Claude client: {e}")
            finally:
                self._client_entered = False
                self.client = None

    def _write_analysis_status(self, status: str, error: str | None = None) -> None:
        """Write analysis status to disk so the UI can poll it."""
        specs_dir = self.project_dir / ".autoforge" / "specs"
        specs_dir.mkdir(parents=True, exist_ok=True)
        status_data = {
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": error,
        }
        (specs_dir / ".analysis_status.json").write_text(
            json.dumps(status_data, indent=2), encoding="utf-8"
        )

    async def run(self) -> None:
        """Run the full analysis and spec generation."""
        self.status = "running"
        self._write_analysis_status("running")
        self.progress_messages.append("Starting codebase analysis...")

        try:
            await self._run_claude()

            # Verify spec files were actually written
            specs_dir = self.project_dir / ".autoforge" / "specs"
            prompts_dir = self.project_dir / ".autoforge" / "prompts"
            written = [f for f in ["constitution.md", "spec.md", "plan.md", "tasks.md"]
                       if (specs_dir / f).exists()]
            has_app_spec = (prompts_dir / "app_spec.txt").exists()

            if not written and not has_app_spec:
                # Claude ran but wrote nothing — treat as error so user knows
                raise RuntimeError(
                    "Claude completed the session but did not write any spec files. "
                    "Check server logs for 'Zeus:' and 'Zeus tool:' entries to see what happened. "
                    "This may indicate an authentication issue with the Claude CLI."
                )

            self.status = "complete"
            self._write_analysis_status("complete")
            self.progress_messages.append(
                f"Analysis complete. Generated: {', '.join(written)}"
                + (" + app_spec.txt" if has_app_spec else "")
            )
            self._init_review_status()
        except Exception as e:
            self.status = "error"
            self.error = str(e)
            self._write_analysis_status("error", str(e))
            self.progress_messages.append(f"Error: {e}")
            logger.error(f"Modernize analysis failed for {self.project_name}: {e}", exc_info=True)
        finally:
            await self.close()

    def _init_review_status(self) -> None:
        """Initialize review_status.json for all generated spec files."""
        specs_dir = self.project_dir / ".autoforge" / "specs"
        prompts_dir = self.project_dir / ".autoforge" / "prompts"

        files_status: dict[str, dict[str, Any]] = {}
        for filename in ["constitution.md", "spec.md", "plan.md", "tasks.md"]:
            if (specs_dir / filename).exists():
                files_status[filename] = {"status": "pending", "approved_at": None}

        if (prompts_dir / "app_spec.txt").exists():
            files_status["app_spec.txt"] = {"status": "pending", "approved_at": None}

        review_status = {"files": files_status, "all_approved": False}
        (specs_dir / ".review_status.json").write_text(
            json.dumps(review_status, indent=2), encoding="utf-8"
        )

    async def _run_claude(self) -> None:
        """Set up and run the Claude SDK session."""
        # Load the auto-modernize skill
        skill_path = ROOT_DIR / ".claude" / "commands" / "modernize-spec.md"
        if not skill_path.exists():
            raise FileNotFoundError(f"Modernize spec skill not found at {skill_path}")

        try:
            skill_content = skill_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            skill_content = skill_path.read_text(encoding="utf-8", errors="replace")

        self.project_dir.mkdir(parents=True, exist_ok=True)

        # Ensure output directories exist before Claude runs
        (self.project_dir / ".autoforge" / "specs").mkdir(parents=True, exist_ok=True)
        (self.project_dir / ".autoforge" / "prompts").mkdir(parents=True, exist_ok=True)

        logger.info(
            "ModernizeSession starting for %s at %s",
            self.project_name,
            self.project_dir.resolve(),
        )

        # Delete old app_spec.txt for fresh generation
        app_spec_path = self.project_dir / ".autoforge" / "prompts" / "app_spec.txt"
        if app_spec_path.exists():
            app_spec_path.unlink()

        # Use "." as $ARGUMENTS so Claude writes to relative paths (cwd = project_dir).
        # This is critical on Windows: absolute paths like C:\Users\... don't match the
        # Write(./**) permission glob, causing silent write failures.
        # The absolute path (POSIX format) is preserved for <source_path> in app_spec.txt
        # so coding agents can locate the source code later.
        abs_project_path = self.project_dir.resolve().as_posix()
        system_prompt = skill_content.replace("$ARGUMENTS", ".")
        # Restore absolute path for source_path element only
        system_prompt = system_prompt.replace(
            "<source_path>.</source_path>",
            f"<source_path>{abs_project_path}</source_path>",
        )
        system_prompt = system_prompt.replace("$TARGET_STACK", self.target_stack_json)

        # Security settings — allow both relative and absolute paths (belt-and-suspenders)
        security_settings = {
            "sandbox": {"enabled": False},
            "permissions": {
                "defaultMode": "acceptEdits",
                "allow": [
                    "Read(./**)",
                    "Write(./**)",
                    "Edit(./**)",
                    "Glob(./**)",
                    f"Read({abs_project_path}/**)",
                    f"Write({abs_project_path}/**)",
                    f"Edit({abs_project_path}/**)",
                    f"Glob({abs_project_path}/**)",
                ],
            },
        }
        from autoforge_paths import get_claude_settings_path
        settings_file = get_claude_settings_path(self.project_dir)
        settings_file.parent.mkdir(parents=True, exist_ok=True)
        with open(settings_file, "w") as f:
            json.dump(security_settings, f, indent=2)

        # Write system prompt to CLAUDE.md
        claude_md_path = self.project_dir / "CLAUDE.md"
        with open(claude_md_path, "w", encoding="utf-8") as f:
            f.write(system_prompt)

        # Set up Claude SDK
        # On Windows, shutil.which("claude") returns a Unix shell script that cannot be
        # executed as a subprocess (WinError 193). Pass None so the SDK uses its bundled
        # claude.exe instead.
        system_cli = None if sys.platform == "win32" else shutil.which("claude")
        from registry import DEFAULT_MODEL, get_effective_sdk_env
        sdk_env = get_effective_sdk_env()
        model = sdk_env.get("ANTHROPIC_DEFAULT_OPUS_MODEL") or os.getenv(
            "ANTHROPIC_DEFAULT_OPUS_MODEL", DEFAULT_MODEL
        )

        self.client = ClaudeSDKClient(
            options=ClaudeAgentOptions(
                model=model,
                cli_path=system_cli,
                # Use "project" only (not "user") so global ~/.claude/ settings don't
                # override our per-session permissions or add conflicting CLAUDE.md content.
                setting_sources=["project"],
                allowed_tools=["Read", "Write", "Edit", "Glob", "WebFetch", "WebSearch"],
                permission_mode="acceptEdits",
                max_turns=100,
                cwd=str(self.project_dir.resolve()),
                settings=str(settings_file.resolve()),
                env=sdk_env,
            )
        )
        try:
            await self.client.__aenter__()
            self._client_entered = True
        except Exception as init_err:
            err_msg = str(init_err)
            if "timeout" in err_msg.lower() or "initialize" in err_msg.lower():
                raise RuntimeError(
                    "Claude CLI timed out during initialization. "
                    "Make sure the Claude CLI is authenticated (run 'claude' in a terminal) "
                    "and that your ANTHROPIC_API_KEY is set in the .env file."
                ) from init_err
            raise

        # Send the initial (and only) message — triggers full auto-analysis
        initial_message = (
            "Analyze this codebase and generate all modernization spec files automatically. "
            "Do not ask any questions — make all decisions based on the codebase analysis "
            "and the target stack provided in your instructions. Generate constitution.md, "
            "spec.md, plan.md, tasks.md, app_spec.txt, and initializer_prompt.md."
        )

        self.progress_messages.append("Claude is analyzing the codebase...")
        logger.info("ModernizeSession: sending initial message to Claude (cwd=%s, model=%s)", self.project_dir.resolve(), model)

        # Send the message first, then stream the response
        try:
            await self.client.query(initial_message)
            logger.info("ModernizeSession: query sent successfully, starting event loop")
        except Exception as query_err:
            logger.error("ModernizeSession: query() failed: %s", query_err, exc_info=True)
            raise

        event_count = 0
        async for event in safe_receive_response(self.client, logger):
            event_count += 1
            msg_type = type(event).__name__
            logger.info("Zeus event #%d: type=%s", event_count, msg_type)

            if msg_type == "AssistantMessage" and hasattr(event, "content"):
                for block in event.content:
                    block_type = type(block).__name__
                    if block_type == "TextBlock" and hasattr(block, "text"):
                        text = block.text
                        logger.info("Zeus text: %s", text[:150])
                        if text and len(text) > 20:
                            self.progress_messages.append(text[:200])
                    elif block_type == "ToolUseBlock" and hasattr(block, "name"):
                        tool_name = block.name
                        logger.info("Zeus tool: %s", tool_name)
                        if tool_name == "Write":
                            inp = getattr(block, "input", {})
                            path = inp.get("file_path", inp.get("path", ""))
                            if path:
                                self.progress_messages.append(f"Writing {Path(path).name}...")
                                logger.info("Zeus writing: %s", path)

            elif msg_type == "UserMessage" and hasattr(event, "content"):
                for block in event.content:
                    block_type = type(block).__name__
                    if block_type == "ToolResultBlock":
                        is_error = getattr(block, "is_error", False)
                        if is_error:
                            content = getattr(block, "content", "Unknown error")
                            logger.warning("Tool error during analysis: %s", content)
                            self.progress_messages.append(f"Tool error: {str(content)[:100]}")

            elif msg_type == "ResultMessage":
                result_text = getattr(event, "text", None) or getattr(event, "content", None)
                logger.info("Zeus ResultMessage: %s", str(result_text)[:300] if result_text else "(empty)")
                break
            else:
                logger.info("Zeus unhandled event: %s attrs=%s", msg_type, dir(event))

        logger.info("ModernizeSession: receive loop finished, total events=%d", event_count)
        if event_count == 0:
            raise RuntimeError(
                "Claude session produced no events (0 messages received). "
                "The Claude CLI may have exited immediately — check authentication "
                "by running 'claude' in a terminal and verifying you are logged in."
            )

        self.progress_messages.append("Claude finished generating spec files.")


# ---------------------------------------------------------------------------
# Session management
# ---------------------------------------------------------------------------

def get_session(project_name: str) -> Optional[ModernizeSession]:
    with _sessions_lock:
        return _sessions.get(project_name)


async def start_session(
    project_name: str,
    project_dir: Path,
    target_stack_json: str,
) -> ModernizeSession:
    """Start a new modernize analysis session."""
    with _sessions_lock:
        existing = _sessions.get(project_name)
        if existing and existing.status == "running":
            return existing

        session = ModernizeSession(project_name, project_dir, target_stack_json)
        _sessions[project_name] = session

    # Run in background
    session._task = asyncio.create_task(session.run())
    return session
