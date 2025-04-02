# AutoVibe Product Backlog - Updated (Wed Apr 02 2025)

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
- **Key Dependencies:** Requires user-provided API key, integrates with AutoCode CLI.
- **Documentation:** `README.md` provides a comprehensive overview, architecture, setup, and future
  ideas.
- **Backlog Status:** Backlog updated and refined based on detailed README. No features are marked
  as completed yet.

**Legend:**

- **Priority:** [High] - Essential for core functionality/MVP, [Medium] - Important for
  usability/robustness, [Low] - Nice-to-have, future enhancements.
- **Type:** Feature, Enhancement, Technical Task, Bug Fix
- **Status:** To Do, In Progress, Done

---

## Core Functionality & MVP Features

| ID     | Title                                         | Priority | Type        | Status | Notes                                                                                                                                                                                                                                                                                      |
| :----- | :-------------------------------------------- | :------- | :---------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AV-001 | **Implement API Key Input & Handling**        | [High]   | Feature     | To Do  | Frontend field for API key input. Securely store in browser's Local Storage (`AutoVibeApiKey`). Pass to backend in `Authorization: Bearer` header for API calls. Backend uses key for LLM calls. Validate key format minimally.                                                            |
| AV-002 | **Implement Seed Input UI**                   | [High]   | Feature     | To Do  | Frontend textarea for user's initial seed.                                                                                                                                                                                                                                                 |
| AV-003 | **Implement `/api/kickoff` Endpoint**         | [High]   | Feature     | To Do  | Backend: Receives seed & model. Validates model against `ALLOWED_MODELS`. Creates unique session folder (`./projects/{timestamp}`). Creates initial `README.md` (with seed), empty `index.html`, `style.css`, `script.js` in iteration `1`. Returns `{ folderName, initialIteration: 1 }`. |
| AV-004 | **Implement `/api/loop` Endpoint**            | [High]   | Feature     | To Do  | Backend: Receives `folderName`, `model`, `iteration`. Validates model. Copies files from previous iteration. Executes `bunx autocode-ai generate {model} {apiKey}` in iteration folder. Handles success/error, CLI output, timeouts (10 mins). Returns status and iteration number.        |
| AV-005 | **Frontend Kickoff Logic**                    | [High]   | Feature     | To Do  | Frontend: On "Run", validate input, get API key from Local Storage, send seed/model/key to `/api/kickoff`. Receive `folderName`, store it. Set `currentIteration = 1`. Call `updateResultPreviews`. Trigger first `runIteration`.                                                          |
| AV-006 | **Frontend Iterative Loop Control & Polling** | [High]   | Feature     | To Do  | Frontend: `runIteration()` function: call `/api/loop` with `folderName`, `model`, `iteration`, API Key. On success, increment `currentIteration`, call `updateResultPreviews`, schedule next `runIteration` (setTimeout). On error, display error, call `stopLoop`.                        |
| AV-007 | **Frontend UI - Core Layout & Iframes**       | [High]   | Feature     | To Do  | `index.html`: Structure with API Key input, Seed textarea, Model dropdown, Run/Stop buttons, Iteration counter, Status messages, Spinner, side-by-side iframes for `README.md` and `index.html` previews.                                                                                  |
| AV-008 | **Backend Static File Serving for Projects**  | [High]   | Feature     | To Do  | Backend (`app.js`): Serve static files from `./projects/` route, preventing path traversal. Allow access to files within session folders for iframes (e.g., `/projects/{folderName}/{iteration}/{fileName}`).                                                                              |
| AV-009 | **Frontend Live Preview Update (Iframes)**    | [High]   | Feature     | To Do  | Frontend: `updateResultPreviews(folderName, iteration)` function: Fetch `/projects/{folderName}/{iteration}/README.md`, render Markdown, load into README iframe (`srcdoc`). Set HTML iframe `src` to `/projects/{folderName}/{iteration}/index.html`.                                     |
| AV-010 | **Integrate AutoCode CLI Execution**          | [High]   | Feature     | To Do  | Backend (`/api/loop`): Execute `bunx autocode-ai generate` command using `child_process.exec` with correct model and API key, within the iteration folder. Capture and return CLI output and errors.                                                                                       |
| AV-011 | **Basic Loading/Spinner Indicator**           | [High]   | Feature     | To Do  | Frontend: Show a spinner while waiting for `/api/kickoff` and `/api/loop` responses. Display "Iteration N" counter during loop. Show "Kicking off...", "Running iteration...", "Loop stopped", success/error messages.                                                                     |
| AV-012 | **Basic Error Handling & Display**            | [High]   | Feature     | To Do  | Frontend/Backend: Handle errors: API failures, invalid input, file system issues, AutoCode errors, timeouts, invalid API key, rate limits, safety blocks. Display user-friendly error messages in UI.                                                                                      |
| AV-013 | **Implement Stop Functionality**              | [High]   | Feature     | To Do  | Frontend: "Stop Loop" button: set `isLoopRunning = false`, clear `setTimeout`. Disable "Stop", enable "Run" buttons. Backend: Loop inherently stops when frontend stops polling `/api/loop`. No explicit `/api/stop` needed for MVP.                                                       |
| AV-014 | **Backend LLM Model Handling (Default)**      | [Medium] | Feature     | To Do  | Backend: Define `ALLOWED_MODELS` array in `app.js` (gemini-flash, gemini-pro, claude-sonnet, deepseek, o3-mini). Use `gemini-2.0-flash-thinking-exp-01-21` as default if no/invalid model provided.                                                                                        |
| AV-015 | **Input Validation (Client & Server)**        | [Medium] | Feature     | To Do  | Validate seed input (not empty), API key format (basic check), model selection (from `ALLOWED_MODELS`) on both client and server.                                                                                                                                                          |
| AV-035 | **Implement Model Selection UI**              | [Medium] | Feature     | To Do  | Frontend: Dropdown menu to select from `ALLOWED_MODELS` (gemini-flash, gemini-pro, etc.). Store selected model in Local Storage (`AutoVibeSelectedModel`). Send selected model to backend in `/api/kickoff` and `/api/loop`.                                                               |
| AV-036 | **Implement "Share Project Link" Feature**    | [Medium] | Feature     | To Do  | Frontend: "Share Project Link" button (enabled after 1st iteration). Copy URL `https://autovibe.dev/projects/{folderName}/{currentIteration}/index.html` to clipboard. Display "Link copied!" message.                                                                                     |
| AV-037 | **Implement "Open HTML" Feature**             | [Medium] | Feature     | To Do  | Frontend: "Open HTML" button (enabled after 1st iteration). Open `/projects/{folderName}/{currentIteration}/index.html` in a new browser tab.                                                                                                                                              |
| AV-038 | **Implement Real-time Status Display**        | [Medium] | Feature     | To Do  | Frontend: Display iteration number, loop status ("Kicking off...", "Running iteration N...", "Loop stopped", "Iteration N Success", "Iteration N Failed"). Update status messages dynamically.                                                                                             |
| AV-039 | **Implement Responsive Design for UI**        | [Medium] | Enhancement | To Do  | Ensure frontend UI is responsive and works well on different screen sizes (desktop, tablet, mobile). Use CSS media queries for layout adjustments.                                                                                                                                         |

---

## Enhancements & Technical Tasks

| ID     | Title                                            | Priority | Type           | Status | Notes                                                                                                                                       |
| :----- | :----------------------------------------------- | :------- | :------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| AV-016 | **Refactor Frontend CSS/JS**                     | [Medium] | Enhancement    | To Do  | Ensure CSS and JS are cleanly separated into `style.css` and `script.js` within the main application structure.                             |
| AV-017 | **Refactor Backend Code (`app.js`)**             | [Medium] | Enhancement    | To Do  | Break down `app.js` into smaller, manageable modules (e.g., api routes, loop logic, file handling) for better organization and testability. |
| AV-018 | **Enhanced Progress Visualization**              | [Low]    | Enhancement    | To Do  | Go beyond basic spinner/counter. Show total planned iterations (if applicable), maybe estimated time. (From README Ideas)                   |
| AV-019 | **Iteration History & Management**               | [Low]    | Feature        | To Do  | Allow users to browse previous versions of `README.md`/`index.html` within a session. (From README Ideas)                                   |
| AV-020 | **Advanced Configuration Panel**                 | [Low]    | Feature        | To Do  | UI for setting LLM params (temp, tokens), AutoCode flags before running. (From README Ideas)                                                |
| AV-021 | **Improved Error Feedback in UI**                | [Low]    | Enhancement    | To Do  | Display specific errors from backend/AutoCode directly in the UI instead of generic messages. (From README Ideas)                           |
| AV-022 | **Accessibility Improvements (WCAG)**            | [Low]    | Enhancement    | To Do  | Review frontend against WCAG guidelines. Implement semantic HTML, ARIA attributes, keyboard navigation improvements.                        |
| AV-023 | **Database Integration Investigation**           | [Low]    | Technical Task | To Do  | Evaluate replacing file system storage with a database (e.g., MongoDB, SQLite) for session/result management. (From README Ideas)           |
| AV-024 | **Backend State Management Refinement**          | [Low]    | Technical Task | To Do  | Implement explicit state tracking for loops (`pending`, `running`, `stopped`, `completed`, `failed`) in the backend. (From README Ideas)    |
| AV-026 | **Seed Templates/Examples**                      | [Low]    | Feature        | To Do  | Provide pre-defined seed examples to help users get started quickly. (From README Ideas)                                                    |
| AV-027 | **Session Persistence & Resume (Requires Auth)** | [Low]    | Feature        | To Do  | Explore user accounts and saving sessions to resume later. (From README Ideas)                                                              |
| AV-028 | **Basic Monitoring & Logging Setup**             | [Low]    | Technical Task | To Do  | Implement structured logging (e.g., using Pino) in `app.js`. Set up basic health checks. (From README Ideas)                                |
| AV-029 | **Basic CI/CD Pipeline**                         | [Low]    | Technical Task | To Do  | Set up GitHub Actions (or similar) for basic linting, testing (when tests exist), and potentially deployment. (From README Ideas)           |
| AV-030 | **Unit Tests for Core Backend Logic**            | [Low]    | Technical Task | To Do  | Write unit tests for critical backend functions (e.g., loop iteration logic, API handlers).                                                 |
| AV-031 | **Containerization Refinement**                  | [Low]    | Technical Task | To Do  | Review and finalize Dockerfile and docker-compose.yml for local development and potential deployment consistency.                           |
| AV-032 | **Explore Real-time Updates (WebSockets/SSE)**   | [Low]    | Technical Task | To Do  | Investigate replacing iframe polling with WebSockets or SSE for smoother, real-time updates of content and progress.                        |
| AV-034 | **API Documentation (Internal)**                 | [Low]    | Technical Task | To Do  | Document the `/api/kickoff` and `/api/loop` endpoints (request/response formats, parameters) within the codebase or README.                 |

---

## New Features or User Stories (Summary of Additions/Refinements)

- **AV-035 (Model Selection UI):** Added explicit UI for model selection based on `ALLOWED_MODELS`.
- **AV-036 ("Share Project Link"):** Added feature for sharing generated `index.html` link.
- **AV-037 ("Open HTML"):** Added feature to open `index.html` in a new tab.
- **AV-038 (Real-time Status Display):** Added more detailed status display requirements.
- **AV-039 (Responsive Design):** Explicitly added responsive design as a feature.
- **Refined Descriptions:** Existing backlog items (especially core features) have been expanded
  with more detail from the README, including specific file paths, API request/response structures,
  and UI element details.
- **Clarified Stop Functionality (AV-013):** Simplified stop mechanism for MVP to be frontend-driven
  polling cessation.

---

## Updated Priorities for Existing Items

- **AV-035, AV-036, AV-037, AV-038, AV-039:** Prioritized as [Medium] as they enhance usability and
  are important for a good user experience, but not strictly core MVP for the initial loop
  functionality.
- **AV-013 (Stop Functionality):** Priority remains [High] as it's crucial for user control, but the
  implementation is simplified for MVP.
- **AV-014 & AV-015 (Backend Model Handling, Input Validation):** Priority remains [Medium] as they
  are important for robustness and basic functionality beyond the absolute core loop.
- **Core MVP Features (AV-001 to AV-012):** Remain [High] priority as they are essential for the
  core "vibe coding" loop to function as described in the README.
- **Enhancements and Technical Tasks (AV-016 onwards):** Generally remain [Low] or [Medium]
  priority, representing post-MVP improvements and technical debt reduction.

---

## Removed or Completed Items

- None. No items are removed or marked as completed at this stage.

---

## Additional Notes & Comments

- **MVP Definition:** The updated backlog reinforces the MVP focus on delivering the core iterative
  loop functionality: Seed input, API key input, model selection, kickoff, iterative `autocode-ai`
  execution, live previews in iframes, basic status updates, and stop functionality.
- **API Key Security (Reiterated):** Secure handling of the API key remains paramount. Client-side
  storage in Local Storage is acceptable for MVP as described in the README, but backend security
  and minimizing client-side exposure should be continuously considered.
- **AutoCode CLI as Core Dependency:** The success of AutoVibe is heavily dependent on the reliable
  execution and output of the `autocode-ai` CLI. Robust error handling and potentially more control
  over CLI parameters might be needed in the future.
- **Frontend-Driven Polling for MVP:** For MVP simplicity, frontend polling of `/api/loop` is
  accepted. However, for a more polished user experience, exploring real-time updates
  (WebSockets/SSE - AV-032) should be considered a priority for post-MVP enhancements.
- **File System Storage Trade-offs:** File system storage is simple for MVP but might present
  scalability and management challenges later. Database integration (AV-023) remains a valid future
  consideration for improved session management and potential user features.
- **Next Steps:** Focus development efforts on the **[High]** priority items (AV-001 to AV-013) to
  achieve the core MVP functionality. Once the core loop is functional, address the **[Medium]**
  priority features (AV-014, AV-015, AV-035 to AV-039) to enhance usability and robustness.
  **[Low]** priority items are for future enhancements and technical improvements.
