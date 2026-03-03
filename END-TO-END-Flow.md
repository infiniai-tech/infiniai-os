# AutoForge End-to-End Flow

This document explains how AutoForge runs from startup to agent execution and how the UI and backend interact.

---

## 1. How You Start AutoForge

### Option A: npm/CLI (recommended for installed package)

```bash
npx autoforge
# or, if installed globally:
autoforge
```

**What happens:**

1. **`bin/autoforge.js`** runs → delegates to **`lib/cli.js`** `run()`.

2. **CLI (`lib/cli.js`)**:
   - **[1/3] Python**: Finds Python 3.11+ (system or `AUTOFORGE_PYTHON`). Creates/uses venv at `~/.autoforge/venv/`, installs deps from `requirements-prod.txt` if needed.
   - **[2/3] Config**: Ensures `~/.autoforge/.env` exists (copies from `.env.example` if not).
   - **[3/3] Server**: Finds an available port (default 8888), then spawns:
     ```bash
     ~/.autoforge/venv/bin/python -m uvicorn server.main:app --host 127.0.0.1 --port <port>
     ```
   - Working directory for the server is the **autoforge package root** (where `server/`, `agent.py`, etc. live).
   - Writes PID to `~/.autoforge/server.pid` and optionally opens the browser to `http://127.0.0.1:<port>`.

3. **FastAPI app** (`server/main.py`) starts:
   - Loads `.env`, applies CORS (localhost or `*` if `AUTOFORGE_ALLOW_REMOTE=1`).
   - **Lifespan**: temp cleanup, orphan lock cleanup, **starts scheduler service**.
   - Mounts routers: projects, features, agent, schedules, devserver, spec_creation, expand, filesystem, assistant_chat, settings, terminal, scaffold.
   - WebSocket: `GET /ws/projects/{project_name}` → `project_websocket()`.
   - If `ui/dist` exists, serves the React SPA at `/` and static assets.

So: **one process** = Node CLI that spawns **one Python process** (uvicorn). All HTTP and WebSocket traffic goes to that single server.

---

## 2. Request Flow: From UI to Backend

### 2.1 API base

- UI is served from the same origin (or Vite dev on 5173). All API calls go to **`/api/...`** (see `ui/src/lib/api.ts`: `const API_BASE = '/api'`).

### 2.2 Projects and registry

- **List projects**: `GET /api/projects` → `server/routers/projects.py` → reads **registry** (`~/.autoforge/registry.db`) for project name → path.
- **Create project**: `POST /api/projects` with `{ name, path, spec_method }` → creates dir, writes registry, creates `.autoforge/` in project (e.g. `config.json`, `allowed_commands.yaml` template).

Project data and config live under **project path** and in **`~/.autoforge/`** (registry, venv, .env).

---

## 3. Starting the Agent (Full Chain)

When you click **Start** in the UI (or start after spec creation):

### 3.1 UI → API

- **Component**: e.g. `AgentControl.tsx` or `NewProjectModal` / `SpecCreationChat` after spec is done.
- **Hook**: `useStartAgent(projectName)` in `useProjects.ts` → calls `api.startAgent(projectName, options)`.
- **API**: `POST /api/projects/{project_name}/agent/start` with body:
  ```json
  { "yolo_mode", "parallel_mode", "max_concurrency", "testing_agent_ratio" }
  ```

### 3.2 Agent router

- **`server/routers/agent.py`**: `start_agent(project_name, request)`.
  - Resolves project path via registry.
  - Gets **process manager** for that project: `get_manager(project_name, project_dir, ROOT_DIR)` (singleton per project).
  - Reads defaults from global settings (e.g. `registry.get_all_settings()`: model, yolo, testing ratio, playwright headless, batch size).
  - Calls `manager.start(yolo_mode, model, max_concurrency, testing_agent_ratio, playwright_headless, batch_size)`.

### 3.3 Process manager (subprocess launch)

- **`server/services/process_manager.py`** – `AgentProcessManager.start()`:
  1. Checks no other agent is running for this project (lock file in project’s `.autoforge/`).
  2. Cleans stale features and kills any leftover Playwright browsers (`playwright-cli kill-all`).
  3. Builds command:
     ```bash
     python -u autonomous_agent_demo.py \
       --project-dir <absolute_path> \
       [--model <model>] \
       [--yolo] \
       --concurrency <max_concurrency> \
       --testing-ratio <testing_agent_ratio> \
       --batch-size <batch_size>
     ```
  4. **cwd** = project directory. **Env** = current env + `PYTHONUNBUFFERED=1`, `PLAYWRIGHT_CLI_SESSION=agent-{project}-{pid}`, API provider env from `registry.get_effective_sdk_env()`.
  5. Starts subprocess with **stdout/stderr piped**.
  6. Creates lock file (PID + creation time).
  7. Sets status to `"running"` and starts **`_stream_output()`** task: reads subprocess stdout line-by-line and calls every registered **output callback** (and detects auth errors, graceful pause messages).

So: **one agent “run”** = one long-lived **subprocess** of `autonomous_agent_demo.py` (the **orchestrator**).

### 3.4 Orchestrator and agent loop

- **`autonomous_agent_demo.py`** (entry point):
  - Loads env, applies SDK overrides from registry.
  - Resolves `--project-dir` (absolute path or registry lookup).
  - Migrates project to `.autoforge/` layout and current version if needed.
  - If **no** `--agent-type`: runs the **unified orchestrator**:
    - `from parallel_orchestrator import run_parallel_orchestrator`
    - `asyncio.run(run_parallel_orchestrator(project_dir, max_concurrency, model, yolo_mode, ...))`
  - If **`--agent-type`** is set (initializer / coding / testing): runs **single-agent** path:
    - `asyncio.run(run_autonomous_agent(..., agent_type=..., feature_id=..., ...))`

- **`parallel_orchestrator.py`**:
  - **Initializer**: If no features exist, runs one-off initializer agent (reads app spec, creates features in DB).
  - **Coding / testing agents**: Spawns **child processes** of `autonomous_agent_demo.py` with `--agent-type coding` or `--agent-type testing` and `--feature-id` / `--feature-ids` for batching.
  - Dependency-aware scheduling: picks features whose dependencies are satisfied, respects `max_concurrency` and testing ratio, writes progress to the **features DB** (SQLite under project).
  - All orchestrator and child output is **stdout** of the single orchestrator process (the one whose stdout is piped by the process manager).

- **`agent.py`** – `run_autonomous_agent()`:
  - Uses **Claude Agent SDK** (`create_client()`, `client.query(message)`).
  - Builds prompts from **`prompts.py`** (e.g. `get_initializer_prompt`, `get_coding_prompt`, `get_testing_prompt`) and project/spec/feature DB.
  - Loop: send prompt → `client.query()` → `client.receive_response()` (streaming). On tool use (e.g. Read, Write, Bash), SDK runs tools (subject to **security**: `security.py`, `allowed_commands.yaml` in project’s `.autoforge/`).
  - Writes results back to feature DB and stdout (e.g. “Feature #3 completed”). Orchestrator parses these to update state and spawn more work.

So end-to-end:

- **UI** → POST **/api/projects/{name}/agent/start**
- **Server** → **Process manager** starts subprocess **`autonomous_agent_demo.py`** (orchestrator)
- **Orchestrator** → initializer once, then **multiple** `autonomous_agent_demo.py` children with `--agent-type coding/testing`
- Each **child** runs **`agent.run_autonomous_agent()`** → **Claude SDK** → tools (read/write/bash) → progress and logs go to **orchestrator’s stdout**

---

## 4. Real-Time Updates: WebSocket

### 4.1 Connection

- UI opens **`/ws/projects/{project_name}`** (e.g. when viewing a project).
- **`server/websocket.py`** → `project_websocket(websocket, project_name)`:
  - Accepts connection, validates project, gets **agent process manager** and **dev server manager** for that project.
  - Registers two callbacks on the **agent** manager:
    - **`on_output(line)`**: for each line from `manager._stream_output()` (orchestrator subprocess stdout).
    - **`on_status_change(status)`**: when manager status changes (e.g. running → stopped/crashed).

### 4.2 What gets streamed

- **Process manager** `_stream_output()`:
  - Reads orchestrator subprocess **stdout** line by line (in a thread/executor so it doesn’t block the event loop).
  - Sanitizes secrets, detects auth errors and graceful-pause messages.
  - For each line, calls **`_broadcast_output(line)`** → every registered **output callback** (e.g. each WebSocket’s `on_output`).

- **WebSocket `on_output(line)`**:
  - Sends a **`log`** message: `{ type: "log", line, timestamp, featureId?, agentIndex? }`.
  - Passes the line to **AgentTracker** and **OrchestratorTracker** (regexes on orchestrator log format).
  - If the line matches “agent start/complete” or “orchestrator event”, sends **`agent_update`** or **`orchestrator_update`** JSON to the client.

- **Progress**: A separate **polling task** in the same WebSocket handler calls **`count_passing_tests(project_dir)`** (reads feature DB) every 2s and sends **`progress`** messages: `{ type: "progress", passing, in_progress, total, percentage, needs_human_input }`.

So: **one subprocess stdout** → **process manager** → **all registered WebSocket callbacks** → **UI** (logs + parsed agent/orchestrator updates + progress).

---

## 5. Stopping the Agent

- UI: **Stop** → `POST /api/projects/{project_name}/agent/stop` → **agent router** → **`manager.stop()`**.
- **Process manager**:
  - Cancels the `_stream_output()` task.
  - Runs **`playwright-cli kill-all`**.
  - **Kills the whole process tree** (orchestrator + all coding/testing children) via `kill_process_tree()`.
  - Cleans stale feature state, removes lock file, sets status to `"stopped"`.
- WebSocket **status** callback sends `agent_status` so the UI updates immediately.

---

## 6. Summary Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  User                                                                     │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │  open browser / use UI
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  React UI (Vite dev or static from FastAPI)                               │
│  - AgentControl, NewProjectModal, SpecCreationChat, etc.                  │
│  - api.ts → fetch('/api/...')                                             │
│  - WebSocket('/ws/projects/{name}')                                       │
└─────────────────────────────────────────────────────────────────────────┘
         │ HTTP POST /api/projects/{name}/agent/start
         │ WebSocket: /ws/projects/{name}
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FastAPI server (server/main.py)                                          │
│  - Routers: agent, projects, features, ...                                │
│  - project_websocket() → register callbacks on AgentProcessManager       │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │  get_manager(project_name, project_dir, ROOT_DIR)
         │  manager.start(...) → Popen(autonomous_agent_demo.py ...)
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  AgentProcessManager (process_manager.py)                                 │
│  - subprocess: python autonomous_agent_demo.py --project-dir ...         │
│  - _stream_output(): read subprocess.stdout → _broadcast_output(line)    │
│  - callbacks: on_output, on_status_change (from WebSocket handler)        │
└─────────────────────────────────────────────────────────────────────────┘
         │ stdout (piped)
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  autonomous_agent_demo.py (orchestrator process)                          │
│  - parallel_orchestrator.run_parallel_orchestrator(...)                   │
│  - Spawns child processes: autonomous_agent_demo.py --agent-type coding   │
│    / testing --feature-id N                                               │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │  child processes
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  agent.run_autonomous_agent() (in each child)                             │
│  - client = create_client() → Claude SDK                                 │
│  - prompts from prompts.py, project/.autoforge, feature DB               │
│  - client.query() / receive_response() → tools (Read, Write, Bash)        │
│  - security: .autoforge/allowed_commands.yaml, ~/.autoforge/config.yaml   │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │  tool runs (file I/O, shell)
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Project directory (your app code, .autoforge/config, features DB)        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Key Files Reference

| Layer            | File(s) |
|------------------|--------|
| Entry (CLI)      | `bin/autoforge.js`, `lib/cli.js` |
| Server           | `server/main.py` |
| Agent API        | `server/routers/agent.py` |
| Process lifecycle| `server/services/process_manager.py` |
| WebSocket        | `server/websocket.py` |
| Orchestrator     | `autonomous_agent_demo.py`, `parallel_orchestrator.py` |
| Agent loop       | `agent.py` |
| Prompts / spec   | `prompts.py` |
| Security         | `security.py`, `.autoforge/allowed_commands.yaml` |
| Registry / config| `registry.py`, `~/.autoforge/` |
| UI API           | `ui/src/lib/api.ts` |
| UI hooks         | `ui/src/hooks/useProjects.ts` (e.g. `useStartAgent`) |
| UI components    | `ui/src/components/AgentControl.tsx`, etc. |

This is the full path from “click Start in the UI” to “orchestrator subprocess → child agents → Claude SDK → tools → your project files,” and back to the UI via WebSocket and progress polling.
