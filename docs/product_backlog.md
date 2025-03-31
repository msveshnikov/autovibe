# AutoVibe Product Backlog - Updated (Mon Mar 31 2025)

**Product Vision:** Empower users with rapid iterative vibe coding capabilities through a secure,
accessible, and easy-to-use web platform, enabling them to explore ideas and generate unexpected
outcomes at lightning speed by running LLM iterations based on an initial seed input and leveraging
AutoCode.

**Current Project State:**

- **Core Files:** `app.js` (backend), `index.html` (frontend) exist. `package.json` indicates a
  NodeJS/Bun project. `Dockerfile` and `docker-compose.yml` suggest containerization efforts or
  plans.
- **Architecture Defined:** Clear client-server model with NodeJS backend serving frontend and API
  endpoints (`/api/kickoff`, `/api/loop`). File system storage (`./projects/{timestamp}`) for
  session data and outputs (`README.md`, `index.html`, `style.css`, `script.js`). Frontend uses
  iframes to display `README.md` and `index.html`. Loop is driven by frontend polling `/api/loop`.
- **Key Dependencies:** Requires user-provided Gemini API key, integrates with AutoCode CLI.
- **Documentation:** `README.md` provides a good overview, architecture, setup, and future ideas.
- **Backlog Status:** Initial backlog drafted previously; this update refines it based on the
  detailed README description. No features are marked as completed yet.

**Legend:**

- **Priority:** [High] - Essential for core functionality/MVP, [Medium] - Important for
  usability/robustness, [Low] - Nice-to-have, future enhancements.
- **Type:** Feature, Enhancement, Technical Task, Bug Fix
- **Status:** To Do, In Progress, Done

---

## Core Functionality & MVP Features

| ID     | Title                                        | Priority | Type    | Status | Notes                                                                                                                                                                                                                     |
| :----- | :------------------------------------------- | :------- | :------ | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AV-001 | **Implement API Key Input & Handling**       | [High]   | Feature | To Do  | Frontend field for API key input. Securely pass to backend (NOT stored client-side). Backend uses key for LLM calls. Validate key format minimally.                                                                       |
| AV-002 | **Implement Seed Input UI**                  | [High]   | Feature | To Do  | Frontend textarea/input for user's initial seed.                                                                                                                                                                          |
| AV-003 | **Implement `/api/kickoff` Endpoint**        | [High]   | Feature | To Do  | Backend: Receives seed & API key. Creates unique session folder (`./projects/{timestamp}`). Creates initial `README.md` (with seed), empty `index.html`, `style.css`, `script.js`. Returns unique folder name/identifier. |
| AV-004 | **Implement `/api/loop` Endpoint**           | [High]   | Feature | To Do  | Backend: Receives session identifier. Runs one iteration: executes LLM logic, calls AutoCode CLI within the session folder. AutoCode updates `README.md`/`index.html`.                                                    |
| AV-005 | **Frontend Kickoff Logic**                   | [High]   | Feature | To Do  | Frontend: On "Run", send seed/key to `/api/kickoff`. Receive session identifier. Store identifier. Trigger first loop call. Set up iframes.                                                                               |
| AV-006 | **Frontend Loop Control & Polling**          | [High]   | Feature | To Do  | Frontend: After kickoff/previous loop call completes, call `/api/loop` with session identifier. Update iteration counter. Implement polling mechanism.                                                                    |
| AV-007 | **Frontend UI - Core Layout & Iframes**      | [High]   | Feature | To Do  | `index.html`: Structure with inputs (seed, key), Run/Stop buttons, iteration counter, spinner, side-by-side iframes for `README.md` and `index.html`.                                                                     |
| AV-008 | **Backend Static File Serving for Projects** | [High]   | Feature | To Do  | Backend (`app.js`) must serve files from `./projects/{session_id}/` so iframes can load `README.md` and `index.html`.                                                                                                     |
| AV-009 | **Frontend Iframe Refresh**                  | [High]   | Feature | To Do  | Frontend: After each successful `/api/loop` call, force refresh the `README.md` and `index.html` iframes to show updated content.                                                                                         |
| AV-010 | **Integrate AutoCode CLI Execution**         | [High]   | Feature | To Do  | Backend (`/api/loop`): Correctly execute the `autocode` CLI command within the designated session folder as part of the iteration logic. Handle CLI output/errors.                                                        |
| AV-011 | **Basic Loading/Spinner Indicator**          | [High]   | Feature | To Do  | Frontend: Show a visual indicator (spinner) while waiting for `/api/kickoff` and `/api/loop` responses. Update iteration counter during loop.                                                                             |
| AV-012 | **Basic Error Handling & Display**           | [High]   | Feature | To Do  | Frontend/Backend: Handle common errors (API failures, invalid input, file system issues, AutoCode errors). Display user-friendly error messages on the frontend.                                                          |
| AV-013 | **Implement Stop Functionality**             | [Medium] | Feature | To Do  | Frontend: "Stop" button sends signal (e.g., to `/api/stop` or flag in `/api/loop`). Backend: Detect signal and halt further iterations for that session.                                                                  |
| AV-014 | **Backend LLM Model Handling (Default)**     | [Medium] | Feature | To Do  | Backend: Use the default specified model (`gemini-2.0-flash-thinking-exp-01-21`) for LLM calls. Allow configuration (e.g., via env var).                                                                                  |
| AV-015 | **Input Validation (Client & Server)**       | [Medium] | Feature | To Do  | Validate seed input (e.g., not empty) and API key format (basic check) on both client and server.                                                                                                                         |

---

## Enhancements & Technical Tasks

| ID     | Title                                            | Priority | Type           | Status | Notes                                                                                                                                                     |
| :----- | :----------------------------------------------- | :------- | :------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AV-016 | **Refactor Frontend CSS/JS**                     | [Medium] | Enhancement    | To Do  | Ensure CSS and JS are cleanly separated into `style.css` and `script.js` within the main application structure (if not already done).                     |
| AV-017 | **Refactor Backend Code (`app.js`)**             | [Medium] | Enhancement    | To Do  | Break down `app.js` into smaller, manageable modules (e.g., api routes, loop logic, file handling) for better organization and testability.               |
| AV-018 | **Enhanced Progress Visualization**              | [Low]    | Enhancement    | To Do  | Go beyond basic spinner/counter. Show total planned iterations (if applicable), maybe estimated time. (From README Ideas)                                 |
| AV-019 | **Iteration History & Management**               | [Low]    | Feature        | To Do  | Allow users to browse previous versions of `README.md`/`index.html` within a session. (From README Ideas)                                                 |
| AV-020 | **Advanced Configuration Panel**                 | [Low]    | Feature        | To Do  | UI for setting LLM params (temp, tokens), AutoCode flags before running. (From README Ideas)                                                              |
| AV-021 | **Improved Error Feedback in UI**                | [Low]    | Enhancement    | To Do  | Display specific errors from backend/AutoCode directly in the UI instead of generic messages. (From README Ideas)                                         |
| AV-022 | **Responsive Design**                            | [Low]    | Enhancement    | To Do  | Ensure UI adapts gracefully to different screen sizes (mobile, tablet). (From README Ideas)                                                               |
| AV-023 | **Database Integration Investigation**           | [Low]    | Technical Task | To Do  | Evaluate replacing file system storage with a database (e.g., MongoDB, SQLite) for session/result management. (From README Ideas)                         |
| AV-024 | **Backend State Management Refinement**          | [Low]    | Technical Task | To Do  | Implement explicit state tracking for loops (`pending`, `running`, `stopped`, `completed`, `failed`) in the backend. (From README Ideas)                  |
| AV-025 | **LLM Model Selection UI**                       | [Low]    | Feature        | To Do  | Allow users to select between configured allowed models (`gemini-flash`, `gemini-pro`) via the UI. Backend needs to handle selection. (From README Ideas) |
| AV-026 | **Seed Templates/Examples**                      | [Low]    | Feature        | To Do  | Provide pre-defined seed examples to help users get started quickly. (From README Ideas)                                                                  |
| AV-027 | **Session Persistence & Resume (Requires Auth)** | [Low]    | Feature        | To Do  | Explore user accounts and saving sessions to resume later. (From README Ideas)                                                                            |
| AV-028 | **Basic Monitoring & Logging Setup**             | [Low]    | Technical Task | To Do  | Implement structured logging (e.g., using Pino) in `app.js`. Set up basic health checks. (From README Ideas)                                              |
| AV-029 | **Basic CI/CD Pipeline**                         | [Low]    | Technical Task | To Do  | Set up GitHub Actions (or similar) for basic linting, testing (when tests exist), and potentially deployment. (From README Ideas)                         |
| AV-030 | **Unit Tests for Core Backend Logic**            | [Low]    | Technical Task | To Do  | Write unit tests for critical backend functions (e.g., loop iteration logic, API handlers).                                                               |
| AV-031 | **Containerization Refinement**                  | [Low]    | Technical Task | To Do  | Review and finalize Dockerfile and docker-compose.yml for local development and potential deployment consistency.                                         |
| AV-032 | **Explore Real-time Updates (WebSockets/SSE)**   | [Low]    | Technical Task | To Do  | Investigate replacing iframe polling with WebSockets or SSE for smoother, real-time updates of content and progress.                                      |
| AV-033 | **Accessibility Improvements (WCAG)**            | [Low]    | Enhancement    | To Do  | Review frontend against WCAG guidelines. Implement semantic HTML, ARIA attributes, keyboard navigation improvements.                                      |
| AV-034 | **API Documentation (Internal)**                 | [Low]    | Technical Task | To Do  | Document the `/api/kickoff` and `/api/loop` endpoints (request/response formats, parameters) within the codebase or README.                               |

---

## New Features or User Stories (Summary of Additions/Refinements)

- **AV-003 (`/api/kickoff`):** Explicitly defined endpoint for session initiation and initial file
  creation.
- **AV-004 (`/api/loop`):** Explicitly defined endpoint for single iteration execution, including
  AutoCode call.
- **AV-005 (Frontend Kickoff):** Logic to call `/api/kickoff` and initiate the loop process.
- **AV-006 (Frontend Loop Control):** Specific implementation of frontend-driven polling for
  `/api/loop`.
- **AV-007 (UI - Iframes):** Specific requirement for side-by-side iframe display.
- **AV-008 (Backend File Serving):** Necessary task to make iframe content accessible.
- **AV-009 (Iframe Refresh):** Explicit task for updating iframe content after loop iteration.
- **AV-010 (AutoCode Integration):** Refined to emphasize execution within `/api/loop`.
- **AV-013 (Stop Functionality):** Added based on README description.
- Priorities adjusted to reflect the core flow described in the README as [High].

---

## Updated Priorities for Existing Items

- Priorities across the board have been reviewed based on the detailed architecture in the
  `README.md`.
- Items essential for the described core user flow (kickoff -> loop -> iframe display -> stop) are
  marked as **[High]**.
- Foundational improvements (validation, refactoring) are **[Medium]**.
- Features listed under "Design Ideas" in the README are generally **[Low]** unless they overlap
  with core usability.

---

## Removed or Completed Items

- None. This backlog represents the planned work based on the current understanding of the project
  as defined in the `README.md`.

---

## Additional Notes & Comments

- **MVP Focus:** The immediate priority is implementing the **[High]** items to deliver the core
  functionality described in the README: input seed/key, kick off a session, see iterative updates
  to `README.md` and `index.html` in iframes via frontend-driven polling of `/api/loop`, and be able
  to stop the process.
- **API Key Security:** Re-emphasizing the critical importance of handling the user's API key
  securely on the backend. It should _never_ be stored or processed extensively on the client-side.
- **AutoCode Dependency:** The core loop relies heavily on the successful integration and execution
  of the AutoCode CLI. Error handling around this is crucial.
- **File System Scalability:** The current file system approach is simple but may face
  scaling/management challenges later. Database integration (AV-023) should be considered post-MVP.
- **Polling vs. Real-time:** The defined architecture uses polling (AV-006, AV-009). While
  functional, exploring real-time updates (AV-032) is a potential future enhancement for better UX.
- **Iterative Refinement:** This backlog will evolve as development progresses and
  challenges/opportunities arise.
