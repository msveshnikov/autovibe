# AutoVibe

**AutoVibe** is a free web platform designed to empower users with rapid iterative "vibe coding" capabilities. It enables users to explore ideas and generate unexpected outcomes at speed by running many Large Language Model (LLM) iterations based on an initial seed input. AutoVibe uses the AutoCode CLI (autocode-ai) under the hood to generate and evolve project files (README.md, index.html, style.css, script.js) and presents live previews.

![AutoVibe preview](image.png)

Production URL: https://autovibe.dev

Table of Contents
- Overview
- Key Goals & Philosophy
- Key Features
- Architecture & Components
- Project Structure (current)
- Getting Started (local development)
- Deployment (Docker)
- Configuration & Environment Variables
- API Endpoints
- Design Ideas & Future Considerations
  - UX / Product
  - Iteration Control & Safety
  - Backend & Architecture
  - Storage, Persistence & Data Model
  - Execution, Isolation & Resource Management
  - Security & Privacy
  - Observability, Metrics & Monitoring
  - Testing, CI/CD & Developer Experience
  - Cost Control & Quotas
  - Accessibility, Internationalization & Legal
- Roadmap & Priorities
- Contributing
- License

Overview
--------
AutoVibe accepts a short "seed" prompt and iteratively applies LLM-powered transformations using the AutoCode CLI, storing each iteration into a timestamped project folder (./projects/{folderName}/{iteration}/). The frontend provides live previews of the evolving README and generated HTML, and lets users start/stop the loop, share links, and open the generated HTML.

Key Goals & Philosophy
----------------------
- Bring Your Own API Key: Users control and provide their own API key (stored locally by default).
- Seed-Based Creativity: Start from a seed prompt and let the model explore.
- Rapid Iteration: Run many iterations quickly to explore diverse outputs.
- Simplicity: Lightweight web UI with minimal setup for users.
- Reproducibility: Preserve iteration outputs on disk so every step is inspectable and shareable.
- Safety & Privacy: Default to privacy-preserving behavior; avoid capturing sensitive keys server-side unless explicitly opted in.

Key Features (summary)
----------------------
- Web-based UI that runs in a browser and stores the API key locally.
- Model selection with validation against an allow-list.
- Iterative loop managing multiple AutoCode CLI runs.
- Live previews of generated README.md (rendered) and index.html.
- Files persisted to ./projects/{timestamp}/{iteration}/ and served statically.
- Sharing via direct links to the latest iteration index.html.
- Basic Docker deployment artifacts included.

Architecture & Components
-------------------------
- Frontend: Single-file `index.html` (HTML + inline CSS + JS). Uses `marked` for Markdown rendering.
- Backend: Single `app.js` Express server (Bun runtime). Serves static UI and `/api/*` endpoints for kickoff/loop. Runs autocode-ai CLI in per-iteration directories.
- File Storage: Local filesystem `./projects` with one folder per session (timestamp by default) and subfolders per iteration.
- External: `autocode-ai` CLI + LLM APIs (user-provided API key).

Project Structure (current)
---------------------------
Notable files and folders:
- app.js — Express backend entrypoint
- index.html — Frontend UI
- Dockerfile, docker-compose.yml — Deployment
- package.json, .prettierrc — project metadata
- site.webmanifest — PWA metadata
- docs/ — marketing and store metadata (app_description.txt, release_notes.txt, privacy_policy.html, etc.)
- projects/ — runtime-generated (not checked into repo)

Getting Started (local development)
-----------------------------------
Prerequisites
- Bun (https://bun.sh/)
- git
- autocode-ai CLI accessible (bunx autocode-ai or globally)

Clone, install and run:
```bash
git clone https://github.com/msveshnikov/autovibe
cd autovibe
bun install
bun run start
# open http://localhost:3000
```

Deployment (Docker)
-------------------
A Dockerfile and docker-compose.yml are provided. Basic usage:
- Create local projects folder: `mkdir projects`
- Build (optional): `docker build -t autovibe-local .`
- Run: `docker-compose up -d`
- Access: http://localhost:8030 (docker-compose maps host 8030 to container 3000)

Configuration & Environment Variables
-------------------------------------
Introduce environment variables for configuration and production readiness. Consider adding a `.env.example` with keys like:
- PORT (default 3000)
- PROJECTS_DIR (default ./projects)
- AUTOCODE_CLI_CMD (e.g., "bunx autocode-ai")
- AUTOCODE_TIMEOUT_MS (e.g., 600000)
- MAX_ITERATIONS (default cap)
- ITERATION_DELAY_MS (delay between iterations)
- LOG_LEVEL (info/warn/error/debug)
- ALLOWED_MODELS (comma-separated list)
- RETENTION_DAYS (auto-cleanup)
- S3_BUCKET / DATABASE_URL / REDIS_URL (if using external storage/queue)

API Endpoints (summary)
-----------------------
- GET / — serves index.html
- POST /api/kickoff — create new session and iteration 1 (requires Authorization: Bearer <key>)
- POST /api/loop — run next iteration (requires Authorization)
- GET /projects/{folder}/{iter}/{file} — static files for preview
- GET /api/* — returns 404 for unknown API paths

Design Ideas & Future Considerations
-----------------------------------
This section outlines actionable design directions, architectural improvements, and operational considerations aligned with the current codebase and repository layout.

Principles to follow
- Privacy-first: Avoid storing user API keys server-side unless necessary; use client-side storage or ephemeral proxies.
- Reproducibility: Keep full iteration artifacts and metadata (manifest) per session so runs can be inspected and reproduced.
- Safety and Limits: Enforce iteration limits, timeouts, and resource caps to prevent runaway usage.
- Observability: Provide metrics, logs and health endpoints for safe operation and troubleshooting.
- Modular & Testable: Refactor monolithic `app.js` into smaller modules (routes, controllers, services, utils) to improve maintainability and testing.

1) UX / Product
- Iteration history UI: allow browsing, previewing, and diffing arbitrary iterations (side-by-side diff of README.md and rendered HTML).
- Snapshot & compare: provide the ability to mark snapshots, compare two iterations, or export selected iterations as ZIP.
- Templates: curated seed templates (landing page, marketing page, component stub).
- Advanced run options: expose model parameters (temperature, max tokens) and autocode CLI flags in a collapsible "Advanced" UI.
- Run budgets & safety: let users pick max iterations and tokens-per-iteration budgets before starting.
- Share & privacy controls: allow sessions to be public, unlisted (tokenized share link), or private (requires authentication).
- Embeddable previews: provide an embed snippet or an optional sanitized iframe with strict CSP and sandbox attributes.

2) Iteration Control & Safety
- Max iterations: leverage a configurable MAX_ITERATIONS environment variable and per-session cap.
- Stop conditions: allow automatic stopping criteria: no-change detection (files unchanged), safety block detection, token usage cap, or model response flags.
- Backoff & retry: implement exponential backoff for rate-limited responses (429), with configurable retry limits.
- CLI exit handling: capture CLI stdout/stderr streamed back to the UI; save outputs to iteration metadata.
- Safety classification: scan outputs for disallowed content and either sanitize or stop the loop.

3) Backend & Architecture
- Refactor: split `app.js` into:
  - routes/ (api routes)
  - controllers/ (request handling)
  - services/autocodeExecutor.js (CLI invocation + streaming + timeout)
  - services/storage.js (filesystem abstraction & optional S3)
  - models/session.js (session metadata management)
- Replace timestamp-only folder names with UUIDs or timestamp+UUID for collision resistance.
- Provide a session manifest file (session.json) inside each project folder that stores:
  - id, createdAt, seed, model, status, iterations[] {iteration, timestamp, cliOutputFile, notes}
- Job queue: move long-running CLI invocations to a background worker queue (Redis + BullMQ or similar) so HTTP endpoints return immediately with job IDs. This improves scalability and resiliency.
- Workers: dedicated worker processes (or containers) execute autocode tasks and report status back to the main app.

4) Storage, Persistence & Data Model
- Session metadata: create session.json to record seed, model, config, iteration metadata, CLI logs and status.
- Optional DB: introduce Postgres/MongoDB for session indexing, query, user accounts, and retention policies.
- Object storage: store iteration artifacts (index.html, README.md, assets) in S3-compatible storage for durability and easier scaling; keep local cache or symlink for fast static serving.
- Retention & cleanup: implement retention policy and TTL-based cleanup (configurable RETENTION_DAYS). Provide administrative CLI to purge or archive old projects.

5) Execution, Isolation & Resource Management
- Sandbox execution: execute autocode in isolated environments:
  - Option A: run CLI inside an ephemeral container per iteration to limit filesystem access and resource usage.
  - Option B: use process-level sandboxing (chroot-like or namespaces) plus non-root users.
- Resource limits: enforce CPU/memory/time limits for CLI runs; set execution timeout and capture exits gracefully.
- Concurrency control: limit number of concurrent CLI runs per server or globally with configurable worker pool size.
- Streaming logs: stream autocode CLI logs to the frontend in real-time via SSE or WebSockets for better UX.

6) Security & Privacy
- API keys:
  - Do not log user API keys (mask them in logs).
  - Prefer storing API keys client-side only. If server-side storage is required, encrypt keys at rest using a secrets manager.
  - Consider an ephemeral proxy/token system to avoid long-term storage of user keys.
- Input validation & sanitization: strictly validate all incoming inputs (seed, model, folder names, iteration numbers) to prevent path traversal and injection.
- Static file serving:
  - Enforce safe file serving with proper path resolution and deny-list for file types if necessary.
  - Apply strong CSP headers and sandbox attributes for iframe previews.
- HTTP security:
  - Use secure headers via Helmet or equivalent.
  - Require HTTPS in production; provide guidance for TLS (Let's Encrypt/Certbot, reverse proxy).
- Authentication & Authorization:
  - For private sessions and persistent accounts, add auth (OAuth, JWT or session-based).
  - Provide role-based access for admin operations (cleanup, view logs).
- Security policy & reporting:
  - Add SECURITY.md and a disclosure process for responsible vulnerability reporting.
  - Consider automated dependency scanning and SCA in CI.

7) Observability, Metrics & Monitoring
- Health endpoints: /health, /readiness and /metrics for system health and automated orchestration.
- Metrics: expose Prometheus metrics:
  - autovibe_iterations_total
  - autovibe_iteration_duration_seconds
  - autovibe_cli_exit_code_count
  - autovibe_api_requests_total, autovibe_api_errors_total
  - autovibe_queue_depth
- Structured logs: use JSON-structured logs to centralize logs (ELK, Loki).
- Alerting: set up alerting rules for high error rates, high queue length, or excessive memory/CPU usage.
- Tracing: instrument critical paths (kickoff, loop execution) with tracing (Jaeger/OpenTelemetry).

8) Testing, CI/CD & Developer Experience
- Tests:
  - Unit tests for services and utilities.
  - Integration tests for API endpoints mocking the autocode CLI (or using a lightweight stub).
  - E2E tests for the web UI using Puppeteer/Playwright (mocked LLM responses).
- CI:
  - Add GitHub Actions / GitLab CI for lint, tests, build, and container image push.
  - Run security checks, dependency audits and formatting in CI.
- Pre-commit: add git hooks with Husky or simple scripts for formatting and linting.
- Local developer UX:
  - Provide `.env.example`, `Makefile` or npm scripts for common tasks (dev, test, build).
  - Provide a lightweight autocode CLI stub for local offline testing.

9) Cost Control & Quotas
- Per-session budget: allow users to set total tokens or cost caps for a session.
- Iteration cost estimation: add a conservative cost estimator before each run and display running totals.
- Alerts and automatic stop: stop the loop if budget is exceeded or the user has no remaining quota.
- Rate limiting: global and per-IP rate limiting to control load and abuse.

10) Accessibility, Internationalization & Legal
- Accessibility: ensure UI elements are keyboard-accessible and follow WCAG guidelines.
- Internationalization: allow localization of UI strings and seed templates for other languages.
- Privacy policy & compliance: keep docs/privacy_policy.html updated and include mechanisms for data deletion on user request.
- Legal: clarify terms of use regarding user-provided API keys and generated content ownership.

Implementation Suggestions (short-term)
- Add session manifest (session.json) to each project folder to track state and metadata.
- Add simple background queue and worker to avoid blocking HTTP request threads during autocode runs.
- Add metrics endpoint and basic health checks.
- Introduce a download-as-zip feature and iteration diff UI.
- Refactor app.js into modular directories to improve testability and maintainability.
- Add .env.example and improved Dockerfile (multi-stage build + non-root user).

Roadmap & Priorities
--------------------
Near-term:
1. Refactor app.js into modular services and add session manifest.
2. Implement job queue + worker for CLI runs (single-machine Redis-backed).
3. Add iteration history UI and diffing.
4. Add basic metrics, /health endpoint, and a CI workflow.

Mid-term:
1. Optional DB for session indexing and user accounts.
2. S3-compatible artifact storage and retention policies.
3. Per-iteration sandboxing (containerized execution).
4. Public/private sharing controls and signed URLs.

Long-term:
1. Multi-tenant production architecture with autoscaling workers and robust RBAC.
2. Integrated billing/usage dashboards and multi-provider LLM support.
3. On-prem/self-hosted installation guide and Helm charts for Kubernetes deployment.

Contributing
------------
Contributions are welcome. Please follow these best practices:
- Open an issue first to discuss larger changes.
- Add tests for new behavior or bug fixes.
- Follow repository code style (.prettierrc) and run formatting before commits.
- Provide a clear PR description and reference any relevant issues.

Add or update these repository files to improve contributor experience:
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- .env.example
- .gitignore
- .github/workflows/ci.yml

License
-------
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgements & Notes
------------------------
- The project currently relies on the autocode-ai CLI and user-provided LLM API keys. Any changes that move keys server-side should be designed with encryption, user consent, and clear privacy controls.
- The docs/ folder contains app metadata (app_description.txt, release_notes.txt, privacy_policy.html, etc.) — use it for release automation and store listing content where appropriate.

This README focuses on practical and actionable design ideas to evolve AutoVibe from a file-system, single-process prototype into a production-ready, user-focused, and secure platform while preserving the lightweight iterative workflow that makes the tool compelling.