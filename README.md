# AutoVibe

**AutoVibe** is a free web platform designed to empower users with rapid iterative "vibe coding"
capabilities. It enables users to explore ideas and generate unexpected outcomes at speed by running
many Large Language Model (LLM) iterations based on an initial seed input. AutoVibe uses the
AutoCode CLI (autocode-ai) under the hood to generate and evolve project files (README.md,
index.html, style.css, script.js) and presents live previews.

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

## Overview

AutoVibe accepts a short "seed" prompt and iteratively applies LLM-powered transformations using the
AutoCode CLI, storing each iteration into a timestamped project folder
(./projects/{folderName}/{iteration}/). The frontend provides live previews of the evolving README
and generated HTML, and lets users start/stop the loop, share links, and open the generated HTML.

## Key Goals & Philosophy

- Bring Your Own API Key: Users control and provide their own API key (stored locally by default).
- Seed-Based Creativity: Start from a seed prompt and let the model explore.
- Rapid Iteration: Run many iterations quickly to explore diverse outputs.
- Simplicity: Lightweight web UI with minimal setup for users.
- Reproducibility: Preserve iteration outputs on disk so every step is inspectable and shareable.
- Safety & Privacy: Default to privacy-preserving behavior; avoid capturing sensitive keys
  server-side unless explicitly opted in.

## Key Features (summary)

- Web-based UI that runs in a browser and stores the API key locally.
- Model selection with validation against an allow-list.
- Iterative loop managing multiple AutoCode CLI runs.
- Live previews of generated README.md (rendered) and index.html.
- Files persisted to ./projects/{timestamp}/{iteration}/ and served statically.
- Sharing via direct links to the latest iteration index.html.
- Basic Docker deployment artifacts included.

## Architecture & Components

- Frontend: Single-file `index.html` (HTML + inline CSS + JS). Uses `marked` for Markdown rendering.
- Backend: Single `app.js` Express server (Bun runtime). Serves static UI and `/api/*` endpoints for
  kickoff/loop. Runs autocode-ai CLI in per-iteration directories.
- File Storage: Local filesystem `./projects` with one folder per session (timestamp by default) and
  subfolders per iteration.
- External: `autocode-ai` CLI + LLM APIs (user-provided API key).

## Project Structure (current)

Notable files and folders:

- app.js — Express backend entrypoint
- index.html — Frontend UI
- Dockerfile, docker-compose.yml — Deployment
- package.json, .prettierrc — project metadata
- site.webmanifest — PWA metadata
- docs/ — marketing and store metadata (app_description.txt, release_notes.txt, privacy_policy.html,
  etc.)
- projects/ — runtime-generated (not checked into repo)

## Getting Started (local development)

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

## Deployment (Docker)

A Dockerfile and docker-compose.yml are provided. Basic usage:

- Create local projects folder: `mkdir projects`
- Build (optional): `docker build -t autovibe-local .`
- Run: `docker-compose up -d`
- Access: http://localhost:8030 (docker-compose maps host 8030 to container 3000)

## API Endpoints (summary)

- GET / — serves index.html
- POST /api/kickoff — create new session and iteration 1 (requires Authorization: Bearer <key>)
- POST /api/loop — run next iteration (requires Authorization)
- GET /projects/{folder}/{iter}/{file} — static files for preview
- GET /api/\* — returns 404 for unknown API paths
